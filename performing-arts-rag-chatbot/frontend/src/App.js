import React, { useState, useEffect, useCallback } from 'react';
import { Settings, MessageSquare, FileText, UploadCloud, Trash2, Search, ChevronLeft, ChevronRight, XCircle, Eye } from 'lucide-react'; // Using Lucide React for icons

// Main App Component
function App() {
    // State for navigation (which tab is active)
    const [activeTab, setActiveTab] = useState('chat'); // 'chat', 'documents', 'settings'

    // State for chat functionality
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [isSendingMessage, setIsSendingMessage] = useState(false); // To disable input during AI response
    const [showClearChatConfirm, setShowClearChatConfirm] = useState(false); // For clear chat confirmation

    // State for document management
    const [selectedFile, setSelectedFile] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [uploadMessage, setUploadMessage] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [docToDelete, setDocToDelete] = useState(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewContent, setPreviewContent] = useState('');
    const [previewFilename, setPreviewFilename] = useState('');

    // State for document pagination and search
    const [currentPage, setCurrentPage] = useState(1);
    const [documentsPerPage] = useState(5); // Fixed number of documents per page
    const [totalDocuments, setTotalDocuments] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFetchingDocuments, setIsFetchingDocuments] = useState(false);

    // State for LLM settings
    const [llmSettings, setLlmSettings] = useState({
        model: 'llama2',
        temperature: 0.7,
        top_k: 40,
        top_p: 0.9,
    });
    const [availableModels, setAvailableModels] = useState([]);
    const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
    const [settingsMessage, setSettingsMessage] = useState('');

    // Base URL for the Flask backend
    const API_BASE_URL = 'http://localhost:5000'; // Ensure this matches your Flask backend URL

    // --- Chat Functions ---

    // Fetches chat history from the backend
    const fetchChatHistory = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/chat_history`);
            if (response.ok) {
                const data = await response.json();
                setChatHistory(data);
            } else {
                console.error('Failed to fetch chat history:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching chat history:', error);
        }
    }, []);

    // Sends a new message to the backend and updates chat history
    const sendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim() || isSendingMessage) return;

        const userMessage = message.trim();
        // Add user message to local history immediately for responsiveness
        setChatHistory(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date().toISOString() }]);
        setMessage(''); // Clear input field
        setIsSendingMessage(true);

        try {
            const response = await fetch(`${API_BASE_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage }),
            });

            if (response.ok) {
                const data = await response.json();
                // Backend sends back the full response, including sources
                setChatHistory(prev => {
                    // Find the last user message and insert the assistant's response after it
                    const newHistory = [...prev];
                    // The backend now returns the full chat history, so we can just replace it
                    // Or, if the backend only returns the new message, we'd append it.
                    // Assuming backend returns the new assistant message only for this call:
                    return [...newHistory, {
                        role: 'assistant',
                        content: data.response,
                        timestamp: data.timestamp,
                        sources: data.sources || []
                    }];
                });
            } else {
                const errorData = await response.json();
                console.error('Failed to send message:', errorData.error);
                setChatHistory(prev => [...prev, { role: 'assistant', content: `Error: ${errorData.error || 'Failed to get response.'}`, timestamp: new Date().toISOString(), isError: true }]);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setChatHistory(prev => [...prev, { role: 'assistant', content: `Error: Could not connect to backend. ${error.message}`, timestamp: new Date().toISOString(), isError: true }]);
        } finally {
            setIsSendingMessage(false);
            // Re-fetch full history to ensure sync, especially if multiple users are interacting
            fetchChatHistory();
        }
    };

    // Clears chat history on the backend
    const clearChatHistory = async () => {
        setShowClearChatConfirm(false); // Hide confirmation modal
        try {
            const response = await fetch(`${API_BASE_URL}/clear_chat_history`, {
                method: 'POST',
            });
            if (response.ok) {
                setChatHistory([]); // Clear local history
            } else {
                console.error('Failed to clear chat history:', response.statusText);
            }
        } catch (error) {
            console.error('Error clearing chat history:', error);
        }
    };

    // --- Document Management Functions ---

    // Handles file selection for upload
    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        setUploadMessage('');
    };

    // Uploads selected document to the backend
    const uploadDocument = async () => {
        if (!selectedFile) {
            setUploadMessage('Please select a file first.');
            return;
        }

        setIsUploading(true);
        setUploadMessage('Uploading...');
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch(`${API_BASE_URL}/upload_document`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setUploadMessage(`File uploaded: ${data.original_filename} (${data.num_chunks} chunks).`);
                setSelectedFile(null); // Clear selected file
                fetchDocuments(); // Refresh document list
            } else {
                const errorData = await response.json();
                setUploadMessage(`Upload failed: ${errorData.error || response.statusText}`);
            }
        } catch (error) {
            setUploadMessage(`Error uploading file: ${error.message}`);
            console.error('Error uploading document:', error);
        } finally {
            setIsUploading(false);
        }
    };

    // Fetches documents from the backend with pagination and search
    const fetchDocuments = useCallback(async () => {
        setIsFetchingDocuments(true);
        try {
            const response = await fetch(`${API_BASE_URL}/documents?page=${currentPage}&limit=${documentsPerPage}&query=${encodeURIComponent(searchQuery)}`);
            if (response.ok) {
                const data = await response.json();
                setDocuments(data.documents);
                setTotalDocuments(data.total_documents);
            } else {
                console.error('Failed to fetch documents:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching documents:', error);
        } finally {
            setIsFetchingDocuments(false);
        }
    }, [currentPage, documentsPerPage, searchQuery]); // Dependencies for useCallback

    // Prepares for document deletion
    const handleDeleteClick = (doc) => {
        setDocToDelete(doc);
        setShowDeleteConfirm(true);
    };

    // Deletes a document from the backend
    const deleteDocument = async () => {
        if (!docToDelete) return;

        setShowDeleteConfirm(false); // Hide confirmation modal

        try {
            const response = await fetch(`${API_BASE_URL}/delete_document/${docToDelete.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setUploadMessage(`Document "${docToDelete.original_filename}" deleted successfully.`);
                fetchDocuments(); // Refresh document list
            } else {
                const errorData = await response.json();
                setUploadMessage(`Deletion failed: ${errorData.error || response.statusText}`);
            }
        } catch (error) {
            setUploadMessage(`Error deleting document: ${error.message}`);
            console.error('Error deleting document:', error);
        } finally {
            setDocToDelete(null); // Clear document to delete
        }
    };

    // Fetches and displays document content for preview
    const previewDocument = async (documentId, filename) => {
        setPreviewFilename(filename);
        setPreviewContent('Loading preview...');
        setShowPreviewModal(true);
        try {
            const response = await fetch(`${API_BASE_URL}/preview_extracted_text/${documentId}`);
            if (response.ok) {
                const data = await response.json();
                setPreviewContent(data.content);
            } else {
                const errorData = await response.json();
                setPreviewContent(`Failed to load preview: ${errorData.error || response.statusText}`);
            }
        } catch (error) {
            setPreviewContent(`Error loading preview: ${error.message}`);
            console.error('Error previewing document:', error);
        }
    };

    // --- LLM Settings Functions ---

    // Fetches current LLM settings from the backend
    const fetchLlmSettings = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/llm_settings`);
            if (response.ok) {
                const data = await response.json();
                setLlmSettings(data);
            } else {
                console.error('Failed to fetch LLM settings:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching LLM settings:', error);
        }
    }, []);

    // Fetches available Ollama models from the backend
    const fetchAvailableModels = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/ollama_models`);
            if (response.ok) {
                const data = await response.json();
                setAvailableModels(data.models);
            } else {
                console.error('Failed to fetch available models:', response.statusText);
                setAvailableModels(['Error fetching models']); // Indicate error to user
            }
        } catch (error) {
            console.error('Error fetching available models:', error);
            setAvailableModels(['Error fetching models']); // Indicate error to user
        }
    }, []);

    // Updates LLM settings on the backend
    const updateLlmSettings = async (e) => {
        e.preventDefault();
        setIsUpdatingSettings(true);
        setSettingsMessage('Updating settings...');
        try {
            const response = await fetch(`${API_BASE_URL}/llm_settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(llmSettings),
            });

            if (response.ok) {
                const data = await response.json();
                setSettingsMessage(data.message);
                fetchLlmSettings(); // Re-fetch to confirm
            } else {
                const errorData = await response.json();
                setSettingsMessage(`Update failed: ${errorData.error || response.statusText}`);
            }
        } catch (error) {
            setSettingsMessage(`Error updating settings: ${error.message}`);
            console.error('Error updating LLM settings:', error);
        } finally {
            setIsUpdatingSettings(false);
            setTimeout(() => setSettingsMessage(''), 3000); // Clear message after 3 seconds
        }
    };

    // --- Effects ---

    // Initial data fetching on component mount
    useEffect(() => {
        fetchChatHistory();
        fetchDocuments(); // Initial fetch for documents
        fetchLlmSettings();
        fetchAvailableModels();
    }, [fetchChatHistory, fetchDocuments, fetchLlmSettings, fetchAvailableModels]);

    // Effect to re-fetch documents when currentPage or searchQuery changes
    useEffect(() => {
        fetchDocuments();
    }, [currentPage, searchQuery, fetchDocuments]); // Add fetchDocuments to dependency array

    // --- Pagination Logic ---
    const totalPages = Math.ceil(totalDocuments / documentsPerPage);

    const handlePageChange = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    // --- Render ---
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 font-inter flex flex-col">
            {/* Header/Navigation */}
            <header className="bg-gray-800 p-4 shadow-lg flex justify-between items-center">
                <h1 className="text-3xl font-bold text-blue-400">Local RAG System</h1>
                <nav className="flex space-x-4">
                    <button
                        className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300 ${activeTab === 'chat' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        onClick={() => setActiveTab('chat')}
                    >
                        <MessageSquare size={20} />
                        <span>Chat</span>
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300 ${activeTab === 'documents' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        onClick={() => setActiveTab('documents')}
                    >
                        <FileText size={20} />
                        <span>Documents</span>
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300 ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        <Settings size={20} />
                        <span>Settings</span>
                    </button>
                </nav>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 p-6 overflow-hidden flex flex-col">
                {activeTab === 'chat' && (
                    <div className="flex-1 flex flex-col bg-gray-800 rounded-lg shadow-xl p-6">
                        <h2 className="text-2xl font-semibold text-blue-300 mb-4">Chat with your Documents</h2>
                        <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                            {chatHistory.length === 0 ? (
                                <div className="text-center text-gray-500 py-10">
                                    Start a conversation! Your chat history will appear here.
                                </div>
                            ) : (
                                chatHistory.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`mb-4 p-4 rounded-lg shadow-md ${
                                            msg.role === 'user' ? 'bg-blue-700 text-white self-end ml-auto' :
                                            msg.isError ? 'bg-red-700 text-white self-start mr-auto' :
                                            'bg-gray-700 text-gray-200 self-start mr-auto'
                                        } max-w-[80%]`}
                                    >
                                        <div className="font-bold mb-1">
                                            {msg.role === 'user' ? 'You' : 'Assistant'}
                                        </div>
                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                        {msg.sources && msg.sources.length > 0 && (
                                            <div className="mt-2 text-sm text-gray-400 border-t border-gray-600 pt-2">
                                                <h4 className="font-semibold">Sources:</h4>
                                                <ul className="list-disc list-inside">
                                                    {msg.sources.map((source, srcIndex) => (
                                                        <li key={srcIndex}>
                                                            <span className="font-medium">{source.original_filename}</span> (Chunk {source.chunk_index}, ID: {source.document_id.substring(0, 8)}...)
                                                            <p className="text-xs italic">"{source.snippet}"</p>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        <div className="text-xs text-gray-500 mt-1">
                                            {new Date(msg.timestamp).toLocaleString()}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Chat Input */}
                        <form onSubmit={sendMessage} className="mt-6 flex items-center space-x-3">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={isSendingMessage ? "Generating response..." : "Type your message..."}
                                className="flex-1 p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={isSendingMessage}
                            />
                            <button
                                type="submit"
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isSendingMessage || !message.trim()}
                            >
                                {isSendingMessage ? 'Sending...' : 'Send'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowClearChatConfirm(true)}
                                className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300 shadow-md flex items-center space-x-2"
                                title="Clear Chat History"
                            >
                                <Trash2 size={20} />
                                <span>Clear</span>
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'documents' && (
                    <div className="flex-1 flex flex-col bg-gray-800 rounded-lg shadow-xl p-6">
                        <h2 className="text-2xl font-semibold text-blue-300 mb-4">Manage Documents</h2>

                        {/* Upload Section */}
                        <div className="mb-6 p-4 border border-gray-700 rounded-lg bg-gray-700 shadow-inner">
                            <h3 className="text-xl font-medium text-gray-200 mb-3">Upload New Document (.txt files only)</h3>
                            <div className="flex items-center space-x-3">
                                <input
                                    type="file"
                                    accept=".txt"
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-gray-300
                                               file:mr-4 file:py-2 file:px-4
                                               file:rounded-full file:border-0
                                               file:text-sm file:font-semibold
                                               file:bg-blue-500 file:text-white
                                               hover:file:bg-blue-600 transition-colors duration-300"
                                />
                                <button
                                    onClick={uploadDocument}
                                    disabled={!selectedFile || isUploading}
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-300 shadow-md flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <UploadCloud size={20} />
                                    <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
                                </button>
                            </div>
                            {uploadMessage && (
                                <p className={`mt-3 text-sm ${uploadMessage.includes('failed') || uploadMessage.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
                                    {uploadMessage}
                                </p>
                            )}
                        </div>

                        {/* Document List Section */}
                        <div className="flex-1 overflow-hidden flex flex-col">
                            <h3 className="text-xl font-medium text-gray-200 mb-3">Your Uploaded Documents ({totalDocuments} total)</h3>

                            {/* Search Input */}
                            <div className="mb-4 flex items-center space-x-2">
                                <Search size={20} className="text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search documents by filename..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1); // Reset to first page on new search
                                    }}
                                    className="flex-1 p-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {isFetchingDocuments ? (
                                <div className="text-center text-gray-500 py-10">Loading documents...</div>
                            ) : documents.length === 0 ? (
                                <div className="text-center text-gray-500 py-10">
                                    No documents uploaded yet. Upload a .txt file to get started!
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto custom-scrollbar rounded-lg border border-gray-700 shadow-md">
                                        <table className="min-w-full divide-y divide-gray-700">
                                            <thead className="bg-gray-700">
                                                <tr>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                        Filename
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                        Chunks
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                        Upload Date
                                                    </th>
                                                    <th scope="col" className="relative px-6 py-3">
                                                        <span className="sr-only">Actions</span>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-gray-800 divide-y divide-gray-700">
                                                {documents.map((doc) => (
                                                    <tr key={doc.id} className="hover:bg-gray-700 transition-colors duration-200">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-300">
                                                            {doc.original_filename}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                                            {doc.num_chunks}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                                            {new Date(doc.upload_date).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end space-x-2">
                                                            <button
                                                                onClick={() => previewDocument(doc.id, doc.original_filename)}
                                                                className="text-blue-400 hover:text-blue-300 transition-colors duration-200 p-2 rounded-full hover:bg-gray-600"
                                                                title="Preview Document"
                                                            >
                                                                <Eye size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteClick(doc)}
                                                                className="text-red-400 hover:text-red-300 transition-colors duration-200 p-2 rounded-full hover:bg-gray-600"
                                                                title="Delete Document"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {/* Pagination Controls */}
                                    {totalPages > 1 && (
                                        <div className="mt-6 flex justify-center items-center space-x-4">
                                            <button
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className="p-2 rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                            >
                                                <ChevronLeft size={20} />
                                            </button>
                                            <span className="text-gray-300">
                                                Page {currentPage} of {totalPages}
                                            </span>
                                            <button
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className="p-2 rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                            >
                                                <ChevronRight size={20} />
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="flex-1 flex flex-col bg-gray-800 rounded-lg shadow-xl p-6">
                        <h2 className="text-2xl font-semibold text-blue-300 mb-4">LLM Settings</h2>
                        <form onSubmit={updateLlmSettings} className="space-y-6">
                            <div>
                                <label htmlFor="llmModel" className="block text-gray-300 text-lg font-medium mb-2">LLM Model:</label>
                                <select
                                    id="llmModel"
                                    value={llmSettings.model}
                                    onChange={(e) => setLlmSettings({ ...llmSettings, model: e.target.value })}
                                    className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={isUpdatingSettings}
                                >
                                    {availableModels.length > 0 ? (
                                        availableModels.map(model => (
                                            <option key={model} value={model}>{model}</option>
                                        ))
                                    ) : (
                                        <option value="">Loading models...</option>
                                    )}
                                </select>
                                {availableModels.includes('Error fetching models') && (
                                    <p className="text-red-400 text-sm mt-2">Could not fetch Ollama models. Ensure Ollama is running and accessible.</p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="temperature" className="block text-gray-300 text-lg font-medium mb-2">Temperature:</label>
                                <input
                                    type="number"
                                    id="temperature"
                                    step="0.1"
                                    min="0"
                                    max="2"
                                    value={llmSettings.temperature}
                                    onChange={(e) => setLlmSettings({ ...llmSettings, temperature: parseFloat(e.target.value) })}
                                    className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={isUpdatingSettings}
                                />
                                <p className="text-gray-400 text-sm mt-1">Controls randomness. Lower values are more deterministic.</p>
                            </div>
                            <div>
                                <label htmlFor="topK" className="block text-gray-300 text-lg font-medium mb-2">Top K:</label>
                                <input
                                    type="number"
                                    id="topK"
                                    step="1"
                                    min="0"
                                    max="100" // Example max, adjust as needed by LLM
                                    value={llmSettings.top_k}
                                    onChange={(e) => setLlmSettings({ ...llmSettings, top_k: parseInt(e.target.value) })}
                                    className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={isUpdatingSettings}
                                />
                                <p className="text-gray-400 text-sm mt-1">Considers the top K most likely next tokens.</p>
                            </div>
                            <div>
                                <label htmlFor="topP" className="block text-gray-300 text-lg font-medium mb-2">Top P:</label>
                                <input
                                    type="number"
                                    id="topP"
                                    step="0.05"
                                    min="0"
                                    max="1"
                                    value={llmSettings.top_p}
                                    onChange={(e) => setLlmSettings({ ...llmSettings, top_p: parseFloat(e.target.value) })}
                                    className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={isUpdatingSettings}
                                />
                                <p className="text-gray-400 text-sm mt-1">Considers the smallest set of tokens whose cumulative probability exceeds P.</p>
                            </div>
                            <button
                                type="submit"
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-md flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isUpdatingSettings}
                            >
                                {isUpdatingSettings ? 'Saving...' : 'Save Settings'}
                            </button>
                            {settingsMessage && (
                                <p className={`mt-3 text-sm ${settingsMessage.includes('failed') || settingsMessage.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
                                    {settingsMessage}
                                </p>
                            )}
                        </form>
                    </div>
                )}
            </main>

            {/* Confirmation Modals */}
            {showClearChatConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-8 rounded-lg shadow-2xl text-center border border-gray-700">
                        <p className="text-gray-200 text-lg mb-6">Are you sure you want to clear the entire chat history?</p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={clearChatHistory}
                                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300 shadow-md"
                            >
                                Yes, Clear
                            </button>
                            <button
                                onClick={() => setShowClearChatConfirm(false)}
                                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-300 shadow-md"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-8 rounded-lg shadow-2xl text-center border border-gray-700">
                        <p className="text-gray-200 text-lg mb-6">Are you sure you want to delete "{docToDelete?.original_filename}"?</p>
                        <p className="text-red-400 text-sm mb-6">Note: This will delete the document file and its metadata. Embeddings might persist in the vector store until re-indexing.</p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={deleteDocument}
                                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300 shadow-md"
                            >
                                Yes, Delete
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-300 shadow-md"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showPreviewModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-3xl h-[80vh] flex flex-col border border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-blue-300">Preview: {previewFilename}</h3>
                            <button
                                onClick={() => setShowPreviewModal(false)}
                                className="text-gray-400 hover:text-gray-200 transition-colors duration-200 p-1 rounded-full hover:bg-gray-700"
                                title="Close Preview"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto bg-gray-700 p-4 rounded-lg text-gray-200 text-sm whitespace-pre-wrap custom-scrollbar">
                            {previewContent}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
