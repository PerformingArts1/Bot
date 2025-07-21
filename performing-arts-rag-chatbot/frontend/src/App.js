import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Settings, MessageSquare, FileText, UploadCloud, Trash2, Search, ChevronLeft, ChevronRight, XCircle, Eye, Download, Send, Loader2, Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useDropzone } from 'react-dropzone';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Base URL for the Flask backend
const API_BASE_URL = 'http://localhost:5000'; // Make sure this matches your Flask app's port

// --- Toast Component ---
function Toast({ message, type, onClose }) {
  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const icon = type === 'success' ? <Info size={20} /> : <XCircle size={20} />;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto-close after 5 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg text-white flex items-center gap-2 ${bgColor} z-50`}>
      {icon}
      <span>{message}</span>
      <button onClick={onClose} className="ml-auto p-1 rounded-full hover:bg-white/20">
        <XCircle size={16} />
      </button>
    </div>
  );
}

// --- Chat Export Component ---
function ChatExport({ chatHistory }) {
  const downloadFile = (data, filename, type) => {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a); // Required for Firefox
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    downloadFile(JSON.stringify(chatHistory, null, 2), "chat_history.json", "application/json");
  };

  const exportMarkdown = () => {
    const md = chatHistory
      .map((msg) => {
        let content = msg.content;
        if (msg.sources && msg.sources.length > 0) {
          const sourceList = msg.sources.map(s =>
            `- **${s.original_filename}** (Chunk: ${s.chunk_index}, ID: ${s.document_id})`
          ).join('\n');
          content += `\n\n**Sources:**\n${sourceList}`;
        }
        return msg.role === "user"
          ? `**You:** ${content}`
          : `**Assistant:**\n\n${content}`;
      })
      .join("\n\n---\n\n");
    downloadFile(md, "chat_history.md", "text/markdown");
  };

  return (
    <div className="flex flex-wrap gap-2 my-2">
      <button onClick={exportJSON} className="btn flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm">
        <Download size={16} /> Export JSON
      </button>
      <button onClick={exportMarkdown} className="btn flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm">
        <Download size={16} /> Export Markdown
      </button>
    </div>
  );
}

// --- File Upload (Drag-and-Drop) Component ---
function FileUpload({ onUpload, isUploading }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onUpload,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed p-6 rounded-lg cursor-pointer text-center mb-4 transition-colors duration-200
                  ${isDragActive ? "border-blue-500 bg-blue-900/30" : "border-gray-600 bg-gray-800 hover:border-gray-400"}`}
    >
      <input {...getInputProps()} />
      {isUploading ? (
        <p className="text-blue-400 flex items-center justify-center gap-2">
          <Loader2 className="animate-spin" size={20} /> Uploading...
        </p>
      ) : isDragActive ? (
        <p className="text-blue-300">Drop the file here ...</p>
      ) : (
        <p className="text-gray-300">Drag & drop a PDF, TXT, or DOCX file here, or click to select</p>
      )}
    </div>
  );
}

// --- Main App Component ---
export default function App() {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat', 'documents', 'settings'
  const [documents, setDocuments] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [llmSettings, setLlmSettings] = useState({ model: '', temperature: 0.7, top_k: 40, top_p: 0.9 });
  const [ollamaModels, setOllamaModels] = useState([]);

  const [isLoading, setIsLoading] = useState(false); // General loading state
  const [isUploading, setIsUploading] = useState(false); // Specific for file upload
  const [isSendingMessage, setIsSendingMessage] = useState(false); // Specific for chat message
  const [uploadMessage, setUploadMessage] = useState('');
  const [documentSearchQuery, setDocumentSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [documentsPerPage] = useState(5); // Fixed items per page
  const [totalDocuments, setTotalDocuments] = useState(0);

  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success'); // 'success' or 'error'

  const chatHistoryRef = useRef(null); // Ref for auto-scrolling chat

  const showNotification = useCallback((message, type) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  }, []);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/documents?query=${documentSearchQuery}&page=${currentPage}&limit=${documentsPerPage}`);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents);
        setTotalDocuments(data.total_documents);
      } else {
        showNotification(`Failed to fetch documents: ${response.statusText}`, 'error');
      }
    } catch (error) {
      showNotification(`Error fetching documents: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [documentSearchQuery, currentPage, documentsPerPage, showNotification]);

  const fetchChatHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/chat_history`);
      if (response.ok) {
        const data = await response.json();
        setChatHistory(data.history);
      } else {
        showNotification(`Failed to fetch chat history: ${response.statusText}`, 'error');
      }
    } catch (error) {
      showNotification(`Error fetching chat history: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);

  const fetchLlmSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/llm_settings`);
      if (response.ok) {
        const data = await response.json();
        setLlmSettings({
          model: data.model,
          temperature: data.temperature,
          top_k: data.top_k,
          top_p: data.top_p,
        });
      } else {
        showNotification(`Failed to fetch LLM settings: ${response.statusText}`, 'error');
      }
    } catch (error) {
      showNotification(`Error fetching LLM settings: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);

  const fetchOllamaModels = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/ollama_models`);
      if (response.ok) {
        const data = await response.json();
        setOllamaModels(data.models);
      } else {
        showNotification(`Failed to fetch Ollama models: ${response.error || response.statusText}`, 'error');
      }
    } catch (error) {
      showNotification(`Error fetching Ollama models: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);

  // Initial data fetching on component mount
  useEffect(() => {
    fetchDocuments();
    fetchChatHistory();
    fetchLlmSettings();
    fetchOllamaModels();
  }, [fetchDocuments, fetchChatHistory, fetchLlmSettings, fetchOllamaModels]);

  // Auto-scroll chat history to bottom
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // --- Handlers ---

  // Handles file upload via drag-and-drop
  const handleDropUpload = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles || acceptedFiles.length === 0) {
      showNotification('No file selected.', 'error');
      return;
    }
    setUploadMessage('');
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', acceptedFiles[0]);

    try {
      const response = await fetch(`${API_BASE_URL}/upload_document`, {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        showNotification(`File uploaded: ${data.original_filename} (${data.num_chunks} chunks).`, 'success');
        setUploadMessage(`File uploaded: ${data.original_filename} (${data.num_chunks} chunks).`);
        fetchDocuments(); // Refresh document list
      } else {
        const errorData = await response.json();
        showNotification(`Upload failed: ${errorData.error || response.statusText}`, 'error');
        setUploadMessage(`Upload failed: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      showNotification(`Error uploading file: ${error.message}`, 'error');
      setUploadMessage(`Error uploading file: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  }, [fetchDocuments, showNotification]);

  const handleDeleteDocument = useCallback(async (documentId, filename) => {
    if (!window.confirm(`Are you sure you want to delete "${filename}"? This action cannot be undone.`)) {
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/delete_document/${documentId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        showNotification(`Document "${filename}" deleted successfully.`, 'success');
        fetchDocuments(); // Refresh document list
      } else {
        const errorData = await response.json();
        showNotification(`Failed to delete document: ${errorData.error || response.statusText}`, 'error');
      }
    } catch (error) {
      showNotification(`Error deleting document: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [fetchDocuments, showNotification]);

  const handlePreviewDocument = useCallback(async (documentId, filename) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/preview_extracted_text/${documentId}`);
      if (response.ok) {
        const data = await response.json();
        setPreviewContent(data.content);
        setPreviewTitle(`Preview: ${filename}${data.truncated ? ' (truncated)' : ''}`);
        setShowPreviewModal(true);
      } else {
        const errorData = await response.json();
        showNotification(`Failed to preview document: ${errorData.error || response.statusText}`, 'error');
      }
    } catch (error) {
      showNotification(`Error previewing document: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);

  const handleSendMessage = useCallback(async (e) => {
    e.preventDefault();
    if (!currentMessage.trim()) return;

    const userMessage = { role: 'user', content: currentMessage, timestamp: new Date().toISOString() };
    setChatHistory((prev) => [...prev, userMessage]);
    setCurrentMessage('');
    setIsSendingMessage(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage = {
          role: 'assistant',
          content: data.response,
          timestamp: data.timestamp,
          sources: data.sources,
        };
        setChatHistory((prev) => [...prev, assistantMessage]);
      } else {
        const errorData = await response.json();
        const errorMessage = {
          role: 'assistant',
          content: `Error: ${errorData.error || response.statusText}`,
          timestamp: new Date().toISOString(),
          isError: true,
        };
        setChatHistory((prev) => [...prev, errorMessage]);
        showNotification(`Chat failed: ${errorData.error || response.statusText}`, 'error');
      }
    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        content: `Network Error: ${error.message}`,
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setChatHistory((prev) => [...prev, errorMessage]);
      showNotification(`Network error during chat: ${error.message}`, 'error');
    } finally {
      setIsSendingMessage(false);
    }
  }, [currentMessage, showNotification]);

  const handleClearChatHistory = useCallback(async () => {
    if (!window.confirm('Are you sure you want to clear all chat history?')) {
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/clear_chat_history`, {
        method: 'POST',
      });
      if (response.ok) {
        setChatHistory([]);
        showNotification('Chat history cleared successfully.', 'success');
      } else {
        const errorData = await response.json();
        showNotification(`Failed to clear chat history: ${errorData.error || response.statusText}`, 'error');
      }
    } catch (error) {
      showNotification(`Error clearing chat history: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);

  const handleLlmSettingChange = useCallback((e) => {
    const { name, value, type } = e.target;
    setLlmSettings((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  }, []);

  const handleUpdateLlmSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/llm_settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(llmSettings),
      });
      if (response.ok) {
        const data = await response.json();
        showNotification(data.message, 'success');
        // Re-fetch settings to ensure UI reflects backend state, including defaults if any were applied
        fetchLlmSettings();
      } else {
        const errorData = await response.json();
        showNotification(`Failed to update settings: ${errorData.error || response.statusText}`, 'error');
      }
    } catch (error) {
      showNotification(`Error updating settings: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [llmSettings, fetchLlmSettings, showNotification]);

  // --- Pagination Handlers ---
  const totalPages = Math.ceil(totalDocuments / documentsPerPage);

  const handlePageChange = useCallback((newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  }, [totalPages]);

  // --- UI Render ---
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col font-inter">
      {/* Header */}
      <header className="bg-gray-800 p-4 shadow-md flex items-center justify-between flex-wrap">
        <h1 className="text-2xl font-bold text-blue-400 mb-2 sm:mb-0">Local RAG System</h1>
        <nav className="flex space-x-2 sm:space-x-4">
          <button
            onClick={() => setActiveTab('chat')}
            className={`tab-button ${activeTab === 'chat' ? 'bg-blue-700 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            <MessageSquare size={20} /> <span className="hidden sm:inline">Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`tab-button ${activeTab === 'documents' ? 'bg-blue-700 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            <FileText size={20} /> <span className="hidden sm:inline">Documents</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`tab-button ${activeTab === 'settings' ? 'bg-blue-700 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            <Settings size={20} /> <span className="hidden sm:inline">Settings</span>
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow p-4 sm:p-6 container mx-auto max-w-4xl">
        {isLoading && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-40">
            <Loader2 className="animate-spin text-blue-400" size={48} />
            <span className="ml-3 text-blue-400 text-lg">Loading...</span>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="flex flex-col h-[calc(100vh-150px)]"> {/* Adjust height based on header/footer */}
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-blue-300">Chat with your RAG System</h2>
            <ChatExport chatHistory={chatHistory} />
            <div ref={chatHistoryRef} className="flex-grow bg-gray-800 p-4 rounded-lg shadow-inner overflow-y-auto mb-4 custom-scrollbar">
              {chatHistory.length === 0 ? (
                <p className="text-gray-400 text-center py-4">Start a conversation!</p>
              ) : (
                chatHistory.map((msg, index) => (
                  <div key={index} className={`mb-4 p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-900 ml-auto text-right' : 'bg-gray-700 mr-auto text-left'} max-w-[90%] sm:max-w-[75%] break-words`}>
                    <p className="font-semibold text-sm mb-1">
                      {msg.role === 'user' ? 'You' : 'Assistant'} <span className="text-gray-400 text-xs ml-2">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                    </p>
                    <ReactMarkdown className="prose prose-invert max-w-none">
                      {msg.content}
                    </ReactMarkdown>
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2 text-xs text-gray-400 border-t border-gray-600 pt-2">
                        <p className="font-medium mb-1">Sources:</p>
                        <ul className="list-disc list-inside">
                          {msg.sources.map((source, srcIndex) => (
                            <li key={srcIndex}>
                              <span className="font-mono text-gray-300">{source.original_filename}</span> (Chunk: {source.chunk_index}, Doc ID: {source.document_id.substring(0, 8)}...)
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              )}
              {isSendingMessage && (
                <div className="flex items-center gap-2 text-gray-500 my-2 p-3 bg-gray-700 rounded-lg max-w-fit">
                  <Loader2 className="animate-spin" size={18} />
                  <span>Assistant is typing...</span>
                </div>
              )}
            </div>
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-grow p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
                disabled={isSendingMessage}
                aria-label="Your message"
              />
              <button
                type="submit"
                className="btn bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-1"
                disabled={isSendingMessage || !currentMessage.trim()}
              >
                {isSendingMessage ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                <span className="hidden sm:inline">Send</span>
              </button>
              <button
                type="button"
                onClick={handleClearChatHistory}
                className="btn bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-1"
                disabled={isSendingMessage || chatHistory.length === 0}
              >
                <Trash2 size={20} /> <span className="hidden sm:inline">Clear</span>
              </button>
            </form>
          </div>
        )}

        {activeTab === 'documents' && (
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-blue-300">Manage Documents</h2>
            <FileUpload onUpload={handleDropUpload} isUploading={isUploading} />
            {uploadMessage && (
              <p className={`mt-3 text-sm ${uploadMessage.includes('failed') || uploadMessage.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
                {uploadMessage}
              </p>
            )}

            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4 text-blue-300">Uploaded Documents</h3>
              <div className="flex items-center mb-4">
                <input
                  type="text"
                  placeholder="Search documents by filename..."
                  value={documentSearchQuery}
                  onChange={(e) => setDocumentSearchQuery(e.target.value)}
                  onKeyUp={(e) => { if (e.key === 'Enter') setCurrentPage(1); fetchDocuments(); }}
                  className="flex-grow p-2 rounded-l-lg bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
                  aria-label="Search documents"
                />
                <button
                  onClick={() => { setCurrentPage(1); fetchDocuments(); }}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-r-lg flex items-center justify-center"
                  aria-label="Perform search"
                >
                  <Search size={20} />
                </button>
              </div>

              {documents.length === 0 && !isLoading ? (
                <p className="text-gray-400 text-center py-4">No documents uploaded yet. Start by uploading one!</p>
              ) : (
                <div className="bg-gray-800 rounded-lg shadow-inner overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Filename
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                          Upload Date
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden md:table-cell">
                          Chunks
                        </th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {documents.map((doc) => (
                        <tr key={doc.id} className="hover:bg-gray-700">
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                            {doc.original_filename}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400 hidden sm:table-cell">
                            {new Date(doc.upload_date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400 hidden md:table-cell">
                            {doc.num_chunks}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handlePreviewDocument(doc.id, doc.original_filename)}
                                className="text-blue-400 hover:text-blue-300 p-1 rounded-md hover:bg-gray-700"
                                aria-label={`Preview ${doc.original_filename}`}
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteDocument(doc.id, doc.original_filename)}
                                className="text-red-400 hover:text-red-300 p-1 rounded-md hover:bg-gray-700"
                                aria-label={`Delete ${doc.original_filename}`}
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-6 space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isLoading}
                    className="pagination-button"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-gray-300 text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || isLoading}
                    className="pagination-button"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-inner">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-blue-300">LLM Settings</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="llmModel" className="block text-sm font-medium text-gray-300 mb-1">LLM Model:</label>
                <select
                  id="llmModel"
                  name="model"
                  value={llmSettings.model}
                  onChange={handleLlmSettingChange}
                  className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
                  disabled={isLoading}
                >
                  {ollamaModels.length === 0 ? (
                    <option value="">Loading models...</option>
                  ) : (
                    ollamaModels.map((modelName) => (
                      <option key={modelName} value={modelName}>
                        {modelName}
                      </option>
                    ))
                  )}
                </select>
                {ollamaModels.length === 0 && !isLoading && (
                  <p className="text-red-400 text-xs mt-1">No Ollama models found. Ensure Ollama is running and models are pulled.</p>
                )}
              </div>
              <div>
                <label htmlFor="temperature" className="block text-sm font-medium text-gray-300 mb-1">Temperature:</label>
                <input
                  type="number"
                  id="temperature"
                  name="temperature"
                  value={llmSettings.temperature}
                  onChange={handleLlmSettingChange}
                  step="0.1"
                  min="0.0"
                  max="2.0"
                  className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
                  disabled={isLoading}
                  aria-describedby="temperature-help"
                />
                <p id="temperature-help" className="text-xs text-gray-400 mt-1">Controls randomness. Lower values are more deterministic. (0.0 - 2.0)</p>
              </div>
              <div>
                <label htmlFor="topK" className="block text-sm font-medium text-gray-300 mb-1">Top K:</label>
                <input
                  type="number"
                  id="topK"
                  name="top_k"
                  value={llmSettings.top_k}
                  onChange={handleLlmSettingChange}
                  step="1"
                  min="0"
                  max="1000"
                  className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
                  disabled={isLoading}
                  aria-describedby="topk-help"
                />
                <p id="topk-help" className="text-xs text-gray-400 mt-1">Limits the number of highest probability tokens to consider. (0 - 1000)</p>
              </div>
              <div>
                <label htmlFor="topP" className="block text-sm font-medium text-gray-300 mb-1">Top P:</label>
                <input
                  type="number"
                  id="topP"
                  name="top_p"
                  value={llmSettings.top_p}
                  onChange={handleLlmSettingChange}
                  step="0.05"
                  min="0.0"
                  max="1.0"
                  className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
                  disabled={isLoading}
                  aria-describedby="topp-help"
                />
                <p id="topp-help" className="text-xs text-gray-400 mt-1">Nucleus sampling: filters tokens by cumulative probability. (0.0 - 1.0)</p>
              </div>
              <button
                onClick={handleUpdateLlmSettings}
                className="btn bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Settings size={20} />}
                Save Settings
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Document Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-gray-950 bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-blue-300">{previewTitle}</h3>
              <button onClick={() => setShowPreviewModal(false)} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700" aria-label="Close preview">
                <XCircle size={24} />
              </button>
            </div>
            <div className="flex-grow p-4 overflow-y-auto text-gray-200 whitespace-pre-wrap custom-scrollbar">
              {previewContent || "No content to display."}
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <Toast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />
      )}
    </div>
  );
}

// Custom CSS for scrollbar and tab buttons (Tailwind doesn't style scrollbars directly without plugins)
// This would typically go into an index.css or a global CSS file
// For this immersive, it's included here.
const style = document.createElement('style');
style.innerHTML = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #374151; /* gray-700 */
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #60a5fa; /* blue-400 */
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #3b82f6; /* blue-500 */
  }

  .tab-button {
    @apply px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2;
  }

  .btn {
    @apply focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900;
  }

  .pagination-button {
    @apply p-2 rounded-md bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200;
  }

  /* React Markdown specific styles */
  .prose {
    color: var(--tw-prose-invert-body);
  }
  .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
    color: var(--tw-prose-invert-headings);
  }
  .prose strong {
    color: var(--tw-prose-invert-bold);
  }
  .prose a {
    color: var(--tw-prose-invert-links);
  }
  .prose ol, .prose ul {
    color: var(--tw-prose-invert-li);
  }
  .prose code {
    color: var(--tw-prose-invert-code);
    background-color: var(--tw-prose-invert-code-bg);
    padding: 0.2em 0.4em;
    border-radius: 0.3em;
  }
  .prose pre {
    background-color: var(--tw-prose-invert-pre-bg);
    color: var(--tw-prose-invert-pre-code);
    padding: 1em;
    border-radius: 0.5em;
    overflow-x: auto;
  }
  .prose pre code {
    background-color: transparent;
    padding: 0;
  }
`;
document.head.appendChild(style);
