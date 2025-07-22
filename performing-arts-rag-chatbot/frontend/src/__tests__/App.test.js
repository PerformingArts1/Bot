import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // For extended DOM matchers
import App from '../App';
import api from '../services/api'; // Import the mocked API service
import io from 'socket.io-client'; // Import the actual socket.io-client

// Mock the entire api service
jest.mock('../services/api');

// Mock socket.io-client
jest.mock('socket.io-client', () => {
  const mSocket = {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    id: 'mock-socket-id-123',
    connected: true,
  };
  return jest.fn(() => mSocket);
});

describe('App Component', () => {
  let mockSocket;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Configure the mock socket.io-client instance
    mockSocket = io(); // Get the mocked instance
    mockSocket.on.mockImplementation((event, callback) => {
      if (event === 'connect') {
        callback(); // Simulate immediate connection
      }
    });

    // Mock API responses
    api.getDocuments.mockResolvedValue({
      success: true,
      documents: [
        { id: 'doc1', original_filename: 'doc1.pdf', upload_date: '2024-07-20T10:00:00Z', num_chunks: 5 },
        { id: 'doc2', original_filename: 'doc2.txt', upload_date: '2024-07-20T11:00:00Z', num_chunks: 3 }
      ],
      total_documents: 2, page: 1, limit: 10
    });
    api.getChatHistory.mockResolvedValue({
      success: true,
      history: [
        { role: 'user', content: 'Hello', timestamp: '2024-07-20T12:00:00Z' },
        { role: 'assistant', content: 'Hi there!', timestamp: '2024-07-20T12:00:05Z' }
      ]
    });
    api.getLlmSettings.mockResolvedValue({
      success: true,
      model: 'llama2', temperature: 0.7, top_k: 40, top_p: 0.9
    });
    api.getOllamaModels.mockResolvedValue({
      success: true,
      models: ['llama2', 'mistral', 'nomic-embed-text']
    });
    api.sendMessage.mockResolvedValue({ success: true }); // Backend sends 200 OK, then SocketIO updates
    api.clearChatHistory.mockResolvedValue({ success: true });
    api.deleteDocument.mockResolvedValue({ success: true, message: 'Document deleted successfully' });
    api.previewExtractedText.mockResolvedValue({ success: true, content: 'Mocked preview content', truncated: false });
    api.updateLlmSettings.mockResolvedValue({ success: true, message: 'Settings updated' });
    api.uploadDocument.mockResolvedValue(new Response(JSON.stringify({ success: true, message: 'Upload initiated' }), { status: 202 }));
  });

  test('renders main application layout and fetches initial data', async () => {
    render(<App />);

    // Check for key elements of the layout
    expect(screen.getByText(/Local RAG System/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Upload Document/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Chat with Documents/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /LLM Settings/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Toggle theme/i })).toBeInTheDocument();

    // Verify initial data fetches
    await waitFor(() => {
      expect(api.getDocuments).toHaveBeenCalledTimes(1);
      expect(api.getChatHistory).toHaveBeenCalledTimes(1);
      expect(api.getLlmSettings).toHaveBeenCalledTimes(1);
      expect(api.getOllamaModels).toHaveBeenCalledTimes(1);
    });
  });

  test('navigates to Document Management tab and displays documents', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Upload Document/i }));

    await waitFor(() => {
      expect(screen.getByText(/Manage Documents/i)).toBeInTheDocument();
      expect(screen.getByText(/doc1.pdf/i)).toBeInTheDocument();
      expect(screen.getByText(/doc2.txt/i)).toBeInTheDocument();
    });
    expect(api.getDocuments).toHaveBeenCalledTimes(2); // Initial fetch + fetch on tab change
  });

  test('navigates to Chat tab and displays history', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Chat with Documents/i }));

    await waitFor(() => {
      expect(screen.getByText(/Chat with your RAG/i)).toBeInTheDocument();
      expect(screen.getByText(/Hello/i)).toBeInTheDocument(); // User message
      expect(screen.getByText(/Hi there!/i)).toBeInTheDocument(); // Assistant message
    });
    expect(api.getChatHistory).toHaveBeenCalledTimes(2); // Initial fetch + fetch on tab change
  });

  test('sends a chat message and displays response via SocketIO', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Chat with Documents/i }));

    await waitFor(() => expect(screen.getByLabelText(/Your message/i)).toBeInTheDocument());

    const chatInput = screen.getByLabelText(/Your message/i);
    fireEvent.change(chatInput, { target: { value: 'What is RAG?' } });
    fireEvent.click(screen.getByRole('button', { name: /Send/i }));

    // Expect API call to send message
    expect(api.sendMessage).toHaveBeenCalledWith('What is RAG?');

    // Simulate SocketIO response for chat_response
    mockSocket.on.mock.calls.find(call => call[0] === 'chat_response')[1]({
      success: true,
      history: [
        { role: 'user', content: 'Hello', timestamp: '2024-07-20T12:00:00Z' },
        { role: 'assistant', content: 'Hi there!', timestamp: '2024-07-20T12:00:05Z' },
        { role: 'user', content: 'What is RAG?', timestamp: '2024-07-20T13:00:00Z' },
        { role: 'assistant', content: 'Mocked AI chat response.', timestamp: '2024-07-20T13:00:05Z', sources: [] }
      ]
    });

    await waitFor(() => {
      expect(screen.getByText(/What is RAG?/i)).toBeInTheDocument(); // User's sent message
      expect(screen.getByText(/Mocked AI chat response./i)).toBeInTheDocument(); // AI's response
    });

    // Verify typing indicator was shown and then hidden
    expect(screen.queryByText(/Assistant is typing.../i)).not.toBeInTheDocument();
  });

  test('navigates to LLM Settings tab and displays settings', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /LLM Settings/i }));

    await waitFor(() => {
      expect(screen.getByText(/LLM Model:/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue('llama2')).toBeInTheDocument();
      expect(screen.getByDisplayValue('0.7')).toBeInTheDocument(); // Temperature
    });
    expect(api.getLlmSettings).toHaveBeenCalledTimes(2); // Initial fetch + fetch on tab change
    expect(api.getOllamaModels).toHaveBeenCalledTimes(2); // Initial fetch + fetch on tab change
  });

  test('toggles theme between dark and light', () => {
    render(<App />);
    const themeToggleButton = screen.getByRole('button', { name: /Toggle theme/i });

    // Initial theme is dark
    expect(document.documentElement).toHaveClass('dark');
    expect(document.documentElement).not.toHaveClass('light');

    // Toggle to light
    fireEvent.click(themeToggleButton);
    expect(document.documentElement).toHaveClass('light');
    expect(document.documentElement).not.toHaveClass('dark');

    // Toggle back to dark
    fireEvent.click(themeToggleButton);
    expect(document.documentElement).toHaveClass('dark');
    expect(document.documentElement).not.toHaveClass('light');
  });

  test('displays document preview modal', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Upload Document/i })); // Go to documents tab
    await waitFor(() => expect(screen.getByText(/doc1.pdf/i)).toBeInTheDocument());

    const previewButton = screen.getAllByLabelText(/Preview/i)[0];
    fireEvent.click(previewButton);

    await waitFor(() => {
      expect(screen.getByText(/Preview: doc1.pdf/i)).toBeInTheDocument();
      expect(screen.getByText(/Mocked preview content/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText(/Close preview/i));
    expect(screen.queryByText(/Preview: doc1.pdf/i)).not.toBeInTheDocument();
  });

  test('handles document upload via dropzone', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Upload Document/i })); // Go to documents tab
    await waitFor(() => expect(screen.getByText(/Drag & drop a PDF, TXT, or DOCX file here, or click to select/i)).toBeInTheDocument());

    const dropzone = screen.getByText(/Drag & drop a PDF, TXT, or DOCX file here, or click to select/i);
    const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });

    // Simulate file drop
    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [file],
      },
    });

    await waitFor(() => {
      expect(screen.getByText(/Uploading.../i)).toBeInTheDocument();
    });

    // Simulate backend response via SocketIO for processing status
    mockSocket.on.mock.calls.find(call => call[0] === 'document_processing_status')[1]({
      id: 'new_doc_id',
      status: 'Indexing complete!',
      progress: 100,
      success: true,
      original_filename: 'test.pdf',
      num_chunks: 1
    });

    await waitFor(() => {
      expect(screen.getByText(/Document upload initiated for "test.pdf". Processing in background./i)).toBeInTheDocument();
      expect(screen.getByText(/Document "test.pdf" processed. 1 chunks indexed./i)).toBeInTheDocument();
      expect(api.uploadDocument).toHaveBeenCalledTimes(1);
      expect(api.getDocuments).toHaveBeenCalledTimes(3); // Initial, tab change, and after upload success
    });
  });

  test('clears chat history', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Chat with Documents/i }));
    await waitFor(() => expect(screen.getByText(/Hello/i)).toBeInTheDocument());

    // Mock window.confirm
    window.confirm = jest.fn(() => true);

    fireEvent.click(screen.getByRole('button', { name: /Clear/i }));

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to clear all chat history?');
    expect(api.clearChatHistory).toHaveBeenCalledTimes(1);

    // Simulate SocketIO response for chat_response after clearing
    mockSocket.on.mock.calls.find(call => call[0] === 'chat_response')[1]({
      success: true,
      history: []
    });

    await waitFor(() => {
      expect(screen.getByText(/Start a conversation!/i)).toBeInTheDocument();
      expect(screen.getByText(/Chat history cleared successfully./i)).toBeInTheDocument();
    });
  });

  test('updates LLM settings', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /LLM Settings/i }));
    await waitFor(() => expect(screen.getByLabelText(/Temperature:/i)).toBeInTheDocument());

    const tempInput = screen.getByLabelText(/Temperature:/i);
    fireEvent.change(tempInput, { target: { name: 'temperature', value: '0.9' } });

    fireEvent.click(screen.getByRole('button', { name: /Save Settings/i }));

    expect(api.updateLlmSettings).toHaveBeenCalledWith(expect.objectContaining({ temperature: 0.9 }));
    await waitFor(() => {
      expect(screen.getByText(/Settings updated/i)).toBeInTheDocument();
      expect(api.getLlmSettings).toHaveBeenCalledTimes(3); // Initial, tab change, after update
    });
  });
});
