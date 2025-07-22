// frontend/src/services/api.js
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL || 'http://localhost:5000';

const api = {
  // Chat Endpoints
  sendMessage: async (message) => {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });
    // Note: The actual streamed content is handled by Socket.IO,
    // this fetch call primarily initiates the backend process.
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send message');
    }
    return response; // Return the response object for status checking
  },

  getChatHistory: async () => {
    const response = await fetch(`${API_BASE_URL}/chat_history`);
    if (!response.ok) {
      throw new Error('Failed to fetch chat history');
    }
    return response.json();
  },

  clearChatHistory: async () => {
    const response = await fetch(`${API_BASE_URL}/clear_chat_history`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to clear chat history');
    }
    return response.json();
  },

  // Document Management Endpoints
  uploadDocument: async (formData) => {
    // formData should contain the file and socket_sid
    const response = await fetch(`${API_BASE_URL}/upload_document`, {
      method: 'POST',
      body: formData, // No Content-Type header needed for FormData, browser sets it
    });
    return response; // Return response to check .ok and parse JSON
  },

  uploadAudio: async (formData) => {
    // formData should contain the audio file and socket_sid
    const response = await fetch(`${API_BASE_URL}/upload_audio`, {
      method: 'POST',
      body: formData,
    });
    return response;
  },

  getDocuments: async (query = '', page = 1, limit = 5, type = 'all') => {
    const response = await fetch(`${API_BASE_URL}/documents?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}&type=${type}`);
    if (!response.ok) {
      throw new Error('Failed to fetch documents');
    }
    return response.json();
  },

  deleteDocument: async (documentId) => {
    const response = await fetch(`${API_BASE_URL}/delete_document/${documentId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete document');
    }
    return response.json();
  },

  previewExtractedText: async (documentId) => {
    const response = await fetch(`${API_BASE_URL}/preview_extracted_text/${documentId}`);
    if (!response.ok) {
      throw new Error('Failed to preview document');
    }
    return response.json();
  },

  // LLM Settings Endpoints
  getLlmSettings: async () => {
    const response = await fetch(`${API_BASE_URL}/llm_settings`);
    if (!response.ok) {
      throw new Error('Failed to fetch LLM settings');
    }
    return response.json();
  },

  updateLlmSettings: async (settings) => {
    const response = await fetch(`${API_BASE_URL}/llm_settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update LLM settings');
    }
    return response.json();
  },

  getOllamaModels: async () => {
    const response = await fetch(`${API_BASE_URL}/ollama_models`);
    if (!response.ok) {
      throw new Error('Failed to fetch Ollama models');
    }
    return response.json();
  },

  // New: Podcast Generation
  generatePodcast: async (text, documentId, socketId) => {
    const response = await fetch(`${API_BASE_URL}/generate_podcast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, document_id: documentId, socket_sid: socketId }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to initiate podcast generation');
    }
    return response.json();
  }
};

export default api;
