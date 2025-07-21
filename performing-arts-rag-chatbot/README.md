# Local RAG System

A Flask-based backend for a local Retrieval-Augmented Generation (RAG) system, enabling you to chat with your documents using local Large Language Models (LLMs) via Ollama.

## ✨ Features

* **Document Ingestion:** Upload PDF, TXT, and DOCX files.
* **Local LLM Integration:** Connects to Ollama for local LLM inference.
* **Local Embeddings:** Uses Ollama embeddings for document chunking and retrieval.
* **Vector Database:** Utilizes ChromaDB for efficient similarity search of document chunks.
* **Persistent Data:** Uploaded documents, vector store, chat history, and LLM settings are persisted.
* **Configurable LLM:** Adjust LLM model, temperature, top_k, and top_p.
* **Document Management:** View uploaded documents, preview extracted text, and delete documents.
* **Chat Interface:** Engage in conversational AI with context from your uploaded documents.

## 🚀 Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Before you begin, ensure you have the following installed:

* **Python 3.9+**: [Download Python](https://www.python.org/downloads/)
* **pip**: Python package installer (usually comes with Python)
* **Ollama**: [Download Ollama](https://ollama.com/download)
    * Once installed, pull the required LLM and Embedding models.
        ```bash
        ollama pull llama2 # Or your preferred LLM
        ollama pull nomic-embed-text # Or your preferred embedding model
        ```
* **Node.js & npm (for frontend if applicable)**: If you're building a separate frontend, ensure you have these.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://your-repository-url.git](https://your-repository-url.git)
    cd local-rag-system
    ```

2.  **Backend Setup (Python/Flask):**

    a.  **Create a Python Virtual Environment (recommended):**
        ```bash
        python -m venv venv
        ```

    b.  **Activate the virtual environment:**
        * **On macOS/Linux:**
            ```bash
            source venv/bin/activate
            ```
        * **On Windows (Command Prompt):**
            ```bash
            venv\Scripts\activate.bat
            ```
        * **On Windows (PowerShell):**
            ```bash
            venv\Scripts\Activate.ps1
            ```

    c.  **Install Python dependencies:**
        ```bash
        pip install -r requirements.txt
        ```
        (Make sure you have a `requirements.txt` generated from your `app.py` dependencies: `pip freeze > requirements.txt`)

    d.  **Create a `.env` file:**
        In the root directory of your project, create a file named `.env` and add the following (adjust values as needed):
        ```env
        OLLAMA_HOST=http://localhost:11434
        LLM_MODEL=llama2
        EMBEDDING_MODEL=nomic-embed-text
        LLM_TEMPERATURE=0.7
        LLM_TOP_K=40
        LLM_TOP_P=0.9
        ```
        * `OLLAMA_HOST`: The URL where your Ollama instance is running.
        * `LLM_MODEL`: The name of the LLM model you pulled with Ollama.
        * `EMBEDDING_MODEL`: The name of the embedding model you pulled with Ollama.
        * `LLM_TEMPERATURE`, `LLM_TOP_K`, `LLM_TOP_P`: Hyperparameters for the LLM.

3.  **Frontend Setup (if separate):**
    If you have a separate frontend (e.g., in a `frontend/` directory), navigate to it and install its dependencies:
    ```bash
    # cd frontend
    # npm install # or yarn install
    ```

### Running the Application

1.  **Ensure Ollama is running:** Make sure the Ollama application is active on your system.
2.  **Start the Flask backend:**
    ```bash
    # (Make sure your Python virtual environment is active)
    python app.py
    ```
    The backend will typically run on `http://127.0.0.1:5000`.

3.  **Start the Frontend (if separate):**
    ```bash
    # cd frontend
    # npm start # or yarn start
    ```
    The frontend will usually open in your browser at `http://localhost:3000` (or similar).

## 📂 Project Structure