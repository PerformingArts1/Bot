// frontend/src/services/api.js

// Use environment variable for API base URL (Vite uses VITE_ prefix)
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL || 'http://localhost:5000';

const api = {
  // Helper for consistent fetch calls
  _fetch: async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  // Document Endpoints
  uploadDocument: async (formData) => {
    // Note: FormData does not require 'Content-Type' header to be set manually
    return await fetch(`${API_BASE_URL}/upload_document`, {
      method: 'POST',
      body: formData,
    });
  },
  getDocuments: async (query = '', page = 1, limit = 5) => {
    const params = new URLSearchParams({ query, page, limit }).toString();
    return await api._fetch(`/documents?${params}`, { method: 'GET' });
  },
  deleteDocument: async (documentId) => {
    return await api._fetch(`/delete_document/${documentId}`, { method: 'DELETE' });
  },
  previewExtractedText: async (documentId) => {
    return await api._fetch(`/preview_extracted_text/${documentId}`, { method: 'GET' });
  },

  // Chat Endpoints
  sendMessage: async (messageContent) => {
    return await api._fetch('/chat', {
      method: 'POST',
      body: JSON.stringify({ message: messageContent }),
    });
  },
  getChatHistory: async () => {
    return await api._fetch('/chat_history', { method: 'GET' });
  },
  clearChatHistory: async () => {
    return await api._fetch('/clear_chat_history', { method: 'POST', body: JSON.stringify({}) });
  },

  // LLM Settings Endpoints
  getLlmSettings: async () => {
    return await api._fetch('/llm_settings', { method: 'GET' });
  },
  updateLlmSettings: async (settings) => {
    return await api._fetch('/llm_settings', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  },
  getOllamaModels: async () => {
    return await api._fetch('/ollama_models', { method: 'GET' });
  },
};

export default api;
