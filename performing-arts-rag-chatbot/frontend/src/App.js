import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Settings, MessageSquare, FileText, UploadCloud, Trash2, Search, ChevronLeft, ChevronRight, XCircle, Eye, Download, Send, Loader2, Info, Moon, Sun, Copy, Headphones, PlayCircle, PauseCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useDropzone } from 'react-dropzone';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import io from 'socket.io-client'; // Import socket.io-client

import api from './services/api'; // Import the centralized API service

// --- Constants ---
const BACKEND_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL || 'http://localhost:5000';
const ALLOWED_TEXT_EXTENSIONS = ['.pdf', '.txt', '.docx'];
const ALLOWED_AUDIO_EXTENSIONS = ['.mp3', '.wav', '.flac', '.m4a'];
const ALL_ALLOWED_EXTENSIONS = [...ALLOWED_TEXT_EXTENSIONS, ...ALLOWED_AUDIO_EXTENSIONS];

// --- Socket.IO Client ---
const socket = io(BACKEND_URL, {
  transports: ['websocket', 'polling']
});

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
    <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg text-white flex items-center gap-2 ${bgColor} z-50 animate-fade-in-up`}>
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
function FileUpload({ onUpload, isUploading, socketId, acceptedFileTypes, label }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => onUpload(acceptedFiles, socketId),
    accept: acceptedFileTypes,
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
        <p className="text-gray-300">{label}</p>
      )}
    </div>
  );
}

// --- Audio Player Component ---
function AudioPlayer({ src }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlayPause = () => {
    if (audioRef.current.paused) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const onPlay = () => setIsPlaying(true);
      const onPause = () => setIsPlaying(false);
      const onEnded = () => setIsPlaying(false);

      audio.addEventListener('play', onPlay);
      audio.addEventListener('pause', onPause);
      audio.addEventListener('ended', onEnded);

      return () => {
        audio.removeEventListener('play', onPlay);
        audio.removeEventListener('pause', onPause);
        audio.removeEventListener('ended', onEnded);
      };
    }
  }, []);

  return (
    <div className="flex items-center gap-2 bg-gray-700 dark:bg-gray-700 light:bg-gray-200 p-2 rounded-md">
      <audio ref={audioRef} src={src} preload="none" className="hidden" />
      <button onClick={togglePlayPause} className="p-1 rounded-full bg-blue-600 text-white hover:bg-blue-700">
        {isPlaying ? <PauseCircle size={20} /> : <PlayCircle size={20} />}
      </button>
      <span className="text-sm text-gray-300 dark:text-gray-300 light:text-gray-700">Podcast</span>
      <a href={src} download className="ml-auto p-1 rounded-full text-blue-400 hover:text-blue-300">
        <Download size={20} />
      </a>
    </div>
  );
}


// --- Main App Component ---
export default function App() {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat', 'documents', 'settings'
  const [documents, setDocuments] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [llmSettings, setLlmSettings] = useState(() => {
    // Load LLM settings from localStorage on initial render
    try {
      const savedSettings = localStorage.getItem('llmSettings');
      return savedSettings ? JSON.parse(savedSettings) : { model: '', temperature: 0.7, top_k: 40, top_p: 0.9 };
    } catch (error) {
      console.error("Failed to parse LLM settings from localStorage", error);
      return { model: '', temperature: 0.7, top_k: 40, top_p: 0.9 };
    }
  });
  const [ollamaModels, setOllamaModels] = useState([]);

  const [isLoading, setIsLoading] = useState(false); // General loading state
  const [isUploadingDocument, setIsUploadingDocument] = useState(false); // Specific for text file upload
  const [isUploadingAudio, setIsUploadingAudio] = useState(false); // Specific for audio file upload
  const [isSendingMessage, setIsSendingMessage] = useState(false); // Specific for chat message
  const [uploadMessage, setUploadMessage] = useState('');
  const [documentSearchQuery, setDocumentSearchQuery] = useState('');
  const [documentTypeFilter, setDocumentTypeFilter] = useState('all'); // 'all', 'text_document', 'audio_transcript'
  const [currentPage, setCurrentPage] = useState(1);
  const [documentsPerPage] = useState(5); // Fixed items per page
  const [totalDocuments, setTotalDocuments] = useState(0);

  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success'); // 'success' or 'error'

  const [socketId, setSocketId] = useState(null); // Store Socket.IO SID
  const [isAssistantTyping, setIsAssistantTyping] = useState(false); // State for typing indicator
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark'); // 'dark' or 'light'

  const chatHistoryRef = useRef(null); // Ref for auto-scrolling chat
  const currentAssistantMessageRef = useRef(''); // Ref to build streamed assistant message
  const currentAssistantSourcesRef = useRef([]); // Ref to hold sources for streamed message

  // State for podcast generation
  const [isGeneratingPodcast, setIsGeneratingPodcast] = useState({}); // {documentId: true/false}
  const [podcastUrls, setPodcastUrls] = useState({}); // {documentId: url}

  // Theme management
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const showNotification = useCallback((message, type) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  }, []);

  // Function to copy text to clipboard
  const copyToClipboard = useCallback((text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showNotification('Copied to clipboard!', 'success');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      showNotification('Failed to copy text.', 'error');
    }
    document.body.removeChild(textArea);
  }, [showNotification]);

  // Socket.IO setup
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to Socket.IO');
      setSocketId(socket.id);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO');
      setSocketId(null);
    });

    // Handle streaming chunks
    socket.on('chat_stream_chunk', (data) => {
      currentAssistantMessageRef.current += data.content;
      setChatHistory((prevHistory) => {
        const lastMessage = prevHistory[prevHistory.length - 1];
        if (lastMessage && lastMessage.role === 'assistant' && lastMessage.isStreaming) {
          return [
            ...prevHistory.slice(0, -1),
            { ...lastMessage, content: currentAssistantMessageRef.current }
          ];
        } else {
          return [
            ...prevHistory,
            { role: 'assistant', content: data.content, timestamp: new Date().toISOString(), isStreaming: true }
          ];
        }
      });
    });

    // Handle complete chat response (after streaming finishes)
    socket.on('chat_response_complete', (data) => {
      setIsSendingMessage(false);
      setIsAssistantTyping(false);
      if (data.success) {
        setChatHistory((prevHistory) => {
          const finalContent = currentAssistantMessageRef.current;
          const finalSources = data.sources;
          const updatedHistory = prevHistory.map((msg, index) => {
            if (index === prevHistory.length - 1 && msg.isStreaming) {
              return { ...msg, content: finalContent, sources: finalSources, isStreaming: false };
            }
            return msg;
          });
          if (!updatedHistory[updatedHistory.length - 1] || updatedHistory[updatedHistory.length - 1].isStreaming) {
             return [...data.history];
          }
          return updatedHistory;
        });
        currentAssistantMessageRef.current = '';
        currentAssistantSourcesRef.current = '';
      } else {
        showNotification(`Chat error: ${data.error}`, 'error');
        setChatHistory(data.history);
        currentAssistantMessageRef.current = '';
        currentAssistantSourcesRef.current = '';
      }
    });

    socket.on('typing_indicator', (data) => {
      setIsAssistantTyping(data.status);
    });

    socket.on('document_processing_status', (data) => {
      if (data.success) {
        showNotification(`Document "${data.original_filename}" processed. ${data.num_chunks} chunks indexed.`, 'success');
        fetchDocuments();
        setIsUploadingDocument(false);
      }
      console.log('Document processing status:', data);
    });

    socket.on('document_processing_error', (data) => {
      showNotification(`Document processing failed for ID ${data.id}: ${data.error}`, 'error');
      setIsUploadingDocument(false);
      console.error('Document processing error:', data);
    });

    // New: Audio processing status
    socket.on('audio_processing_status', (data) => {
      if (data.success) {
        showNotification(`Audio "${data.original_filename}" transcribed and indexed. ${data.num_chunks} chunks.`, 'success');
        fetchDocuments(); // Refresh document list to show new audio transcript
        setIsUploadingAudio(false);
      }
      console.log('Audio processing status:', data);
    });

    // New: Audio processing error
    socket.on('audio_processing_error', (data) => {
      showNotification(`Audio processing failed for ID ${data.id}: ${data.error}`, 'error');
      setIsUploadingAudio(false);
      console.error('Audio processing error:', data);
    });

    // New: Podcast generation status
    socket.on('podcast_status', (data) => {
      if (data.success) {
        showNotification(`Podcast generated for document ID ${data.id}!`, 'success');
        setPodcastUrls(prev => ({ ...prev, [data.id]: data.url }));
        setIsGeneratingPodcast(prev => ({ ...prev, [data.id]: false }));
      }
      console.log('Podcast status:', data);
    });

    // New: Podcast generation error
    socket.on('podcast_error', (data) => {
      showNotification(`Podcast generation failed for ID ${data.id}: ${data.error}`, 'error');
      setIsGeneratingPodcast(prev => ({ ...prev, [data.id]: false }));
      console.error('Podcast error:', data);
    });


    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('chat_stream_chunk');
      socket.off('chat_response_complete');
      socket.off('typing_indicator');
      socket.off('document_processing_status');
      socket.off('document_processing_error');
      socket.off('audio_processing_status'); // Clean up new listeners
      socket.off('audio_processing_error');
      socket.off('podcast_status');
      socket.off('podcast_error');
    };
  }, [showNotification]);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getDocuments(documentSearchQuery, currentPage, documentsPerPage, documentTypeFilter);
      setDocuments(data.documents);
      setTotalDocuments(data.total_documents);
      // Clear podcast URLs for documents not currently displayed
      setPodcastUrls(prev => {
        const newUrls = {};
        data.documents.forEach(doc => {
          if (prev[doc.id]) {
            newUrls[doc.id] = prev[doc.id];
          }
        });
        return newUrls;
      });
    } catch (error) {
      showNotification(`Error fetching documents: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [documentSearchQuery, currentPage, documentsPerPage, documentTypeFilter, showNotification]);

  const fetchChatHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getChatHistory();
      setChatHistory(data.history);
    } catch (error) {
      showNotification(`Error fetching chat history: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);

  const fetchLlmSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getLlmSettings();
      setLlmSettings({
        model: data.model,
        temperature: data.temperature,
        top_k: data.top_k,
        top_p: data.top_p,
      });
      // Save to localStorage
      localStorage.setItem('llmSettings', JSON.stringify({
        model: data.model,
        temperature: data.temperature,
        top_k: data.top_k,
        top_p: data.top_p,
      }));
    } catch (error) {
      showNotification(`Failed to fetch LLM settings: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);

  const fetchOllamaModels = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getOllamaModels();
      setOllamaModels(data.models);
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

  const handleDocumentUpload = useCallback(async (acceptedFiles, currentSocketId) => {
    if (!acceptedFiles || acceptedFiles.length === 0) {
      showNotification('No file selected.', 'error');
      return;
    }
    setUploadMessage('');
    setIsUploadingDocument(true);
    const formData = new FormData();
    formData.append('file', acceptedFiles[0]);
    if (currentSocketId) {
      formData.append('socket_sid', currentSocketId);
    }

    try {
      const response = await api.uploadDocument(formData);
      if (response.ok) {
        const data = await response.json();
        showNotification(`Document upload initiated for "${data.original_filename}". Processing in background.`, 'success');
        setUploadMessage(`Document upload initiated for "${data.original_filename}".`);
      } else {
        const errorData = await response.json();
        showNotification(`Upload failed: ${errorData.error || response.statusText}`, 'error');
        setUploadMessage(`Upload failed: ${errorData.error || response.statusText}`);
        setIsUploadingDocument(false);
      }
    } catch (error) {
      showNotification(`Error uploading file: ${error.message}`, 'error');
      setUploadMessage(`Error uploading file: ${error.message}`);
      setIsUploadingDocument(false);
    }
  }, [showNotification]);

  const handleAudioUpload = useCallback(async (acceptedFiles, currentSocketId) => {
    if (!acceptedFiles || acceptedFiles.length === 0) {
      showNotification('No audio file selected.', 'error');
      return;
    }
    setUploadMessage('');
    setIsUploadingAudio(true);
    const formData = new FormData();
    formData.append('file', acceptedFiles[0]);
    if (currentSocketId) {
      formData.append('socket_sid', currentSocketId);
    }

    try {
      const response = await api.uploadAudio(formData);
      if (response.ok) {
        const data = await response.json();
        showNotification(`Audio upload initiated for "${data.original_filename}". Processing in background.`, 'success');
        setUploadMessage(`Audio upload initiated for "${data.original_filename}".`);
      } else {
        const errorData = await response.json();
        showNotification(`Audio upload failed: ${errorData.error || response.statusText}`, 'error');
        setUploadMessage(`Audio upload failed: ${errorData.error || response.statusText}`);
        setIsUploadingAudio(false);
      }
    } catch (error) {
      showNotification(`Error uploading audio file: ${error.message}`, 'error');
      setUploadMessage(`Error uploading audio file: ${error.message}`);
      setIsUploadingAudio(false);
    }
  }, [showNotification]);

  const handleDeleteDocument = useCallback(async (documentId, filename) => {
    if (!window.confirm(`Are you sure you want to delete "${filename}"? This action cannot be undone.`)) {
      return;
    }
    setIsLoading(true);
    try {
      const data = await api.deleteDocument(documentId);
      showNotification(data.message, 'success');
      fetchDocuments();
    } catch (error) {
      showNotification(`Failed to delete document: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [fetchDocuments, showNotification]);

  const handlePreviewDocument = useCallback(async (documentId, filename) => {
    setIsLoading(true);
    try {
      const data = await api.previewExtractedText(documentId);
      setPreviewContent(data.content);
      setPreviewTitle(`Preview: ${filename}${data.truncated ? ' (truncated)' : ''}`);
      setShowPreviewModal(true);
    } catch (error) {
      showNotification(`Failed to preview document: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);

  const handleGeneratePodcast = useCallback(async (documentId, filename) => {
    setIsGeneratingPodcast(prev => ({ ...prev, [documentId]: true }));
    try {
      // Pass documentId to backend to retrieve content, or pass text directly
      await api.generatePodcast(null, documentId, socketId);
      showNotification(`Podcast generation started for "${filename}".`, 'success');
    } catch (error) {
      showNotification(`Failed to start podcast generation for "${filename}": ${error.message}`, 'error');
      setIsGeneratingPodcast(prev => ({ ...prev, [documentId]: false }));
    }
  }, [socketId, showNotification]);

  const handleSendMessage = useCallback(async (e) => {
    e.preventDefault();
    if (!currentMessage.trim()) return;

    const userMessage = { role: 'user', content: currentMessage, timestamp: new Date().toISOString() };
    setChatHistory((prev) => [...prev, userMessage]);
    setCurrentMessage('');
    setIsSendingMessage(true);
    setIsAssistantTyping(true);

    currentAssistantMessageRef.current = '';
    currentAssistantSourcesRef.current = [];

    try {
      await api.sendMessage(userMessage.content);
    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        content: `Network Error: Could not send message. ${error.message}`,
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setChatHistory((prev) => [...prev, errorMessage]);
      showNotification(`Network error during chat: ${error.message}`, 'error');
      setIsSendingMessage(false);
      setIsAssistantTyping(false);
    }
  }, [currentMessage, showNotification]);

  const handleClearChatHistory = useCallback(async () => {
    if (!window.confirm('Are you sure you want to clear all chat history?')) {
      return;
    }
    setIsLoading(true);
    try {
      await api.clearChatHistory();
      showNotification('Chat history cleared successfully.', 'success');
    } catch (error) {
      showNotification(`Failed to clear chat history: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);

  const handleLlmSettingChange = useCallback((e) => {
    const { name, value, type } = e.target;
    setLlmSettings((prev) => {
      const newSettings = {
        ...prev,
        [name]: type === 'number' ? parseFloat(value) : value,
      };
      localStorage.setItem('llmSettings', JSON.stringify(newSettings));
      return newSettings;
    });
  }, []);

  const handleUpdateLlmSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.updateLlmSettings(llmSettings);
      showNotification(data.message, 'success');
      fetchLlmSettings();
    } catch (error) {
      showNotification(`Failed to update settings: ${error.message}`, 'error');
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

  // Effect to re-fetch documents when search query, page, or type filter changes
  useEffect(() => {
    fetchDocuments();
  }, [documentSearchQuery, currentPage, documentTypeFilter, fetchDocuments]);


  // --- UI Render ---
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col font-inter transition-colors duration-300 dark:bg-gray-900 dark:text-gray-100 light:bg-gray-100 light:text-gray-900">
      {/* Header */}
      <header className="bg-gray-800 dark:bg-gray-800 light:bg-blue-100 p-4 shadow-md flex items-center justify-between flex-wrap transition-colors duration-300">
        <h1 className="text-2xl font-bold text-blue-400 dark:text-blue-400 light:text-blue-700 mb-2 sm:mb-0">Local RAG System</h1>
        <nav className="flex space-x-2 sm:space-x-4">
          <button
            onClick={() => setActiveTab('chat')}
            className={`tab-button ${activeTab === 'chat' ? 'bg-blue-700 text-white' : 'bg-gray-700 hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 light:bg-blue-200 light:text-blue-800 light:hover:bg-blue-300'}`}
          >
            <MessageSquare size={20} /> <span className="hidden sm:inline">Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`tab-button ${activeTab === 'documents' ? 'bg-blue-700 text-white' : 'bg-gray-700 hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 light:bg-blue-200 light:text-blue-800 light:hover:bg-blue-300'}`}
          >
            <FileText size={20} /> <span className="hidden sm:inline">Documents</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`tab-button ${activeTab === 'settings' ? 'bg-blue-700 text-white' : 'bg-gray-700 hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 light:bg-blue-200 light:text-blue-800 light:hover:bg-blue-300'}`}
          >
            <Settings size={20} /> <span className="hidden sm:inline">Settings</span>
          </button>
          <button
            onClick={toggleTheme}
            className="tab-button bg-gray-700 hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 light:bg-blue-200 light:text-blue-800 light:hover:bg-blue-300"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
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
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-blue-300 dark:text-blue-300 light:text-blue-600">Chat with your RAG System</h2>
            <ChatExport chatHistory={chatHistory} />
            <div ref={chatHistoryRef} className="flex-grow bg-gray-800 dark:bg-gray-800 light:bg-white p-4 rounded-lg shadow-inner overflow-y-auto mb-4 custom-scrollbar">
              {chatHistory.length === 0 ? (
                <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-center py-4">Start a conversation!</p>
              ) : (
                chatHistory.map((msg, index) => (
                  <div key={index} className={`mb-4 p-3 rounded-lg animate-fade-in ${msg.role === 'user' ? 'bg-blue-900 dark:bg-blue-900 light:bg-blue-100 ml-auto text-right' : 'bg-gray-700 dark:bg-gray-700 light:bg-gray-200 mr-auto text-left'} max-w-[90%] sm:max-w-[75%] break-words`}>
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-semibold text-sm">
                        {msg.role === 'user' ? 'You' : 'Assistant'}
                      </p>
                      <div className="flex items-center text-xs text-gray-400 dark:text-gray-400 light:text-gray-500">
                        <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                        <button
                          onClick={() => copyToClipboard(msg.content)}
                          className="ml-2 p-1 rounded-md hover:bg-gray-600 dark:hover:bg-gray-600 light:hover:bg-gray-300 transition-colors duration-150"
                          title="Copy message"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>
                    <ReactMarkdown
                      className="prose prose-invert max-w-none dark:prose-invert light:prose"
                      components={{
                        code({ node, inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || '');
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={atomDark}
                              language={match[1]}
                              PreTag="div"
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2 text-xs text-gray-400 dark:text-gray-400 light:text-gray-600 border-t border-gray-600 dark:border-gray-600 light:border-gray-300 pt-2">
                        <p className="font-medium mb-1">Sources:</p>
                        <ul className="list-disc list-inside">
                          {msg.sources.map((source, srcIndex) => (
                            <li key={srcIndex}>
                              <span className="font-mono text-gray-300 dark:text-gray-300 light:text-gray-700">{source.original_filename}</span> (Chunk: {source.chunk_index}, Doc ID: {source.document_id.substring(0, 8)}...)
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              )}
              {isAssistantTyping && (
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-500 light:text-gray-600 my-2 p-3 bg-gray-700 dark:bg-gray-700 light:bg-gray-200 rounded-lg max-w-fit animate-pulse">
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
                className="flex-grow p-3 rounded-lg bg-gray-700 dark:bg-gray-700 light:bg-white border border-gray-600 dark:border-gray-600 light:border-gray-300 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 light:focus:border-blue-500"
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
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-blue-300 dark:text-blue-300 light:text-blue-600">Manage Documents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-200 dark:text-gray-200 light:text-gray-800">Upload Text Documents</h3>
                <FileUpload
                  onUpload={handleDocumentUpload}
                  isUploading={isUploadingDocument}
                  socketId={socketId}
                  acceptedFileTypes={{
                    "application/pdf": [".pdf"],
                    "text/plain": [".txt"],
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
                  }}
                  label="Drag & drop a PDF, TXT, or DOCX file here, or click to select"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-200 dark:text-gray-200 light:text-gray-800">Upload Audio Files (for Transcription)</h3>
                <FileUpload
                  onUpload={handleAudioUpload}
                  isUploading={isUploadingAudio}
                  socketId={socketId}
                  acceptedFileTypes={{
                    "audio/mpeg": [".mp3"],
                    "audio/wav": [".wav"],
                    "audio/flac": [".flac"],
                    "audio/mp4": [".m4a"], // Common mimetype for m4a
                  }}
                  label="Drag & drop an MP3, WAV, FLAC, or M4A file here, or click to select"
                />
              </div>
            </div>

            {uploadMessage && (
              <p className={`mt-3 text-sm ${uploadMessage.includes('failed') || uploadMessage.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
                {uploadMessage}
              </p>
            )}

            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4 text-blue-300 dark:text-blue-300 light:text-blue-600">Uploaded Content</h3>
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Search by filename..."
                  value={documentSearchQuery}
                  onChange={(e) => setDocumentSearchQuery(e.target.value)}
                  onKeyUp={(e) => { if (e.key === 'Enter') setCurrentPage(1); fetchDocuments(); }}
                  className="flex-grow p-2 rounded-lg bg-gray-700 dark:bg-gray-700 light:bg-white border border-gray-600 dark:border-gray-600 light:border-gray-300 focus:outline-none focus:border-blue-500"
                  aria-label="Search documents"
                />
                <select
                  value={documentTypeFilter}
                  onChange={(e) => { setDocumentTypeFilter(e.target.value); setCurrentPage(1); }}
                  className="p-2 rounded-lg bg-gray-700 dark:bg-gray-700 light:bg-white border border-gray-600 dark:border-gray-600 light:border-gray-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="text_document">Text Documents</option>
                  <option value="audio_transcript">Audio Transcripts</option>
                </select>
                <button
                  onClick={() => { setCurrentPage(1); fetchDocuments(); }}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg flex items-center justify-center"
                  aria-label="Perform search"
                >
                  <Search size={20} />
                </button>
              </div>

              {documents.length === 0 && !isLoading ? (
                <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-center py-4">No content uploaded yet. Start by uploading a document or audio file!</p>
              ) : (
                <div className="bg-gray-800 dark:bg-gray-800 light:bg-white rounded-lg shadow-inner overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-700 dark:divide-gray-700 light:divide-gray-300">
                    <thead className="bg-gray-700 dark:bg-gray-700 light:bg-gray-200">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 dark:text-gray-300 light:text-gray-700 uppercase tracking-wider">
                          Filename
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 dark:text-gray-300 light:text-gray-700 uppercase tracking-wider hidden sm:table-cell">
                          Type
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 dark:text-gray-300 light:text-gray-700 uppercase tracking-wider hidden md:table-cell">
                          Upload Date
                        </th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-300 dark:text-gray-300 light:text-gray-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700 dark:divide-gray-700 light:divide-gray-300">
                      {documents.map((doc) => (
                        <tr key={doc.id} className="hover:bg-gray-700 dark:hover:bg-gray-700 light:hover:bg-gray-100">
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-200 dark:text-gray-200 light:text-gray-800">
                            {doc.original_filename}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400 dark:text-gray-400 light:text-gray-600 hidden sm:table-cell">
                            {doc.type === 'text_document' ? 'Text Document' : 'Audio Transcript'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400 dark:text-gray-400 light:text-gray-600 hidden md:table-cell">
                            {new Date(doc.upload_date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2 items-center">
                              {doc.type === 'audio_transcript' && podcastUrls[doc.id] ? (
                                <AudioPlayer src={podcastUrls[doc.id]} />
                              ) : doc.type === 'audio_transcript' && isGeneratingPodcast[doc.id] ? (
                                <span className="text-blue-400 flex items-center text-xs">
                                  <Loader2 className="animate-spin mr-1" size={16} /> Generating...
                                </span>
                              ) : doc.type === 'audio_transcript' ? (
                                <button
                                  onClick={() => handleGeneratePodcast(doc.id, doc.original_filename)}
                                  className="text-green-400 hover:text-green-300 p-1 rounded-md hover:bg-gray-700 dark:hover:bg-gray-700 light:text-green-600 light:hover:text-green-500 light:hover:bg-gray-200 flex items-center gap-1"
                                  title="Generate Podcast"
                                  disabled={isGeneratingPodcast[doc.id]}
                                >
                                  <Headphones size={18} /> <span className="hidden sm:inline">Podcast</span>
                                </button>
                              ) : null}
                              <button
                                onClick={() => handlePreviewDocument(doc.id, doc.original_filename)}
                                className="text-blue-400 hover:text-blue-300 p-1 rounded-md hover:bg-gray-700 dark:hover:bg-gray-700 light:text-blue-600 light:hover:text-blue-500 light:hover:bg-gray-200"
                                aria-label={`Preview ${doc.original_filename}`}
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteDocument(doc.id, doc.original_filename)}
                                className="text-red-400 hover:text-red-300 p-1 rounded-md hover:bg-gray-700 dark:hover:bg-gray-700 light:text-red-600 light:hover:text-red-500 light:hover:bg-gray-200"
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
                    className="pagination-button dark:pagination-button light:bg-blue-200 light:text-blue-800 light:hover:bg-blue-300 light:disabled:bg-gray-300"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-gray-300 dark:text-gray-300 light:text-gray-700 text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || isLoading}
                    className="pagination-button dark:pagination-button light:bg-blue-200 light:text-blue-800 light:hover:bg-blue-300 light:disabled:bg-gray-300"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-gray-800 dark:bg-gray-800 light:bg-white p-6 rounded-lg shadow-inner">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-blue-300 dark:text-blue-300 light:text-blue-600">LLM Settings</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="llmModel" className="block text-sm font-medium text-gray-300 dark:text-gray-300 light:text-gray-700 mb-1">LLM Model:</label>
                <select
                  id="llmModel"
                  name="model"
                  value={llmSettings.model}
                  onChange={handleLlmSettingChange}
                  className="w-full p-2 rounded-md bg-gray-700 dark:bg-gray-700 light:bg-white border border-gray-600 dark:border-gray-600 light:border-gray-300 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 light:focus:border-blue-500"
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
                <label htmlFor="temperature" className="block text-sm font-medium text-gray-300 dark:text-gray-300 dark:text-gray-700 light:text-gray-700 mb-1">Temperature:</label>
                <input
                  type="number"
                  id="temperature"
                  name="temperature"
                  value={llmSettings.temperature}
                  onChange={handleLlmSettingChange}
                  step="0.1"
                  min="0.0"
                  max="2.0"
                  className="w-full p-2 rounded-md bg-gray-700 dark:bg-gray-700 light:bg-white border border-gray-600 dark:border-gray-600 light:border-gray-300 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 light:focus:border-blue-500"
                  disabled={isLoading}
                  aria-describedby="temperature-help"
                />
                <p id="temperature-help" className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-500 mt-1">Controls randomness. Lower values are more deterministic. (0.0 - 2.0)</p>
              </div>
              <div>
                <label htmlFor="topK" className="block text-sm font-medium text-gray-300 dark:text-gray-300 light:text-gray-700 mb-1">Top K:</label>
                <input
                  type="number"
                  id="topK"
                  name="top_k"
                  value={llmSettings.top_k}
                  onChange={handleLlmSettingChange}
                  step="1"
                  min="0"
                  max="1000"
                  className="w-full p-2 rounded-md bg-gray-700 dark:bg-gray-700 light:bg-white border border-gray-600 dark:border-gray-600 light:border-gray-300 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 light:focus:border-blue-500"
                  disabled={isLoading}
                  aria-describedby="topk-help"
                />
                <p id="topk-help" className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-500 mt-1">Limits the number of highest probability tokens to consider. (0 - 1000)</p>
              </div>
              <div>
                <label htmlFor="topP" className="block text-sm font-medium text-gray-300 dark:text-gray-300 light:text-gray-700 mb-1">Top P:</label>
                <input
                  type="number"
                  id="topP"
                  name="top_p"
                  value={llmSettings.top_p}
                  onChange={handleLlmSettingChange}
                  step="0.05"
                  min="0.0"
                  max="1.0"
                  className="w-full p-2 rounded-md bg-gray-700 dark:bg-gray-700 light:bg-white border border-gray-600 dark:border-gray-600 light:border-gray-300 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 light:focus:border-blue-500"
                  disabled={isLoading}
                  aria-describedby="topp-help"
                />
                <p id="topp-help" className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-500 mt-1">Nucleus sampling: filters tokens by cumulative probability. (0.0 - 1.0)</p>
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
        <div className="fixed inset-0 bg-gray-950 bg-opacity-80 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-gray-800 dark:bg-gray-800 light:bg-white rounded-lg shadow-xl w-full max-w-3xl h-[90vh] flex flex-col transform transition-transform duration-300 scale-95 animate-scale-in">
            <div className="flex justify-between items-center p-4 border-b border-gray-700 dark:border-gray-700 light:border-gray-300">
              <h3 className="text-lg font-semibold text-blue-300 dark:text-blue-300 light:text-blue-600">{previewTitle}</h3>
              <button onClick={() => setShowPreviewModal(false)} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 dark:hover:bg-gray-700 light:text-gray-600 light:hover:text-gray-800 light:hover:bg-gray-200" aria-label="Close preview">
                <XCircle size={24} />
              </button>
            </div>
            <div className="flex-grow p-4 overflow-y-auto text-gray-200 dark:text-gray-200 light:text-gray-800 whitespace-pre-wrap custom-scrollbar">
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
