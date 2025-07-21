import React, { useState, useEffect, useCallback } from 'react';
import { Settings, MessageSquare, FileText, UploadCloud, Trash2, Search, ChevronLeft, ChevronRight, XCircle, Eye, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useDropzone } from 'react-dropzone';

// --- Chat Export Component ---
function ChatExport({ chatHistory }) {
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(chatHistory, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    download(url, "chat_history.json");
  };

  const exportMarkdown = () => {
    const md = chatHistory
      .map((msg) =>
        msg.role === "user"
          ? `**You:** ${msg.content}`
          : `**Assistant:**\n\n${msg.content}`
      )
      .join("\n\n---\n\n");
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    download(url, "chat_history.md");
  };

  function download(url, filename) {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex gap-2 my-2">
      <button onClick={exportJSON} className="btn flex items-center gap-1">
        <Download size={16} /> JSON
      </button>
      <button onClick={exportMarkdown} className="btn flex items-center gap-1">
        <Download size={16} /> Markdown
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
      className={`border-2 border-dashed p-6 rounded cursor-pointer text-center mb-4 transition-colors ${isDragActive ? "bg-blue-900/30" : "bg-gray-700"}`}
    >
      <input {...getInputProps()} />
      {isUploading ? (
        <p className="text-blue-400">Uploading...</p>
      ) : isDragActive ? (
        <p>Drop the file here ...</p>
      ) : (
        <p>Drag & drop a PDF, TXT, or DOCX file here, or click to select</p>
      )}
    </div>
  );
}

// --- Main App Component ---
function App() {
  // ... (all your state and logic from your current App.js, unchanged)
  // (Paste your entire App.js code here, but replace the upload section in 'documents' tab with <FileUpload ... /> as below)

  // ... all your state and logic from your current App.js ...

  // Replace the upload section in the 'documents' tab with:
  // <FileUpload onUpload={handleDropUpload} isUploading={isUploading} />
  // and implement handleDropUpload as below:

  // Handles file upload via drag-and-drop
  const handleDropUpload = async (acceptedFiles) => {
    if (!acceptedFiles || acceptedFiles.length === 0) return;
    setSelectedFile(null);
    setIsUploading(true);
    setUploadMessage('Uploading...');
    const formData = new FormData();
    formData.append('file', acceptedFiles[0]);
    try {
      const response = await fetch(`${API_BASE_URL}/upload_document`, {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        setUploadMessage(`File uploaded: ${data.original_filename} (${data.num_chunks} chunks).`);
        fetchDocuments();
      } else {
        const errorData = await response.json();
        setUploadMessage(`Upload failed: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      setUploadMessage(`Error uploading file: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // ... rest of your App.js code ...

  // In the render, in the 'documents' tab, replace the upload section with:
  /*
    <FileUpload onUpload={handleDropUpload} isUploading={isUploading} />
    {uploadMessage && (
      <p className={`mt-3 text-sm ${uploadMessage.includes('failed') || uploadMessage.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
        {uploadMessage}
      </p>
    )}
  */
  // and remove the old input/button for upload.

  // In the 'chat' tab, add <ChatExport chatHistory={chatHistory} /> above the chat history.

  // For Markdown rendering, replace <p className="whitespace-pre-wrap">{msg.content}</p> with:
  // <ReactMarkdown className="prose prose-invert">{msg.content}</ReactMarkdown>

  // For "Assistant is typing..." indicator, show:
  // {isSendingMessage && (
  //   <div className="flex items-center gap-2 text-gray-500 my-2">
  //     <span className="animate-pulse">Assistant is typing...</span>
  //   </div>
  // )}

  // (The rest of your App.js remains unchanged.)
}

export default App;