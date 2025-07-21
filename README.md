# Local RAG Chatbot

![RAG System Diagram](https://placehold.co/800x400/E0F2F7/000?text=Local+RAG+Chatbot+System)

A full-stack, local-first AI chatbot application with Retrieval-Augmented Generation (RAG) capabilities. This system allows users to upload their own documents, chat with a local Large Language Model (LLM) that leverages these documents for informed responses, and manage LLM settings, all running entirely on your local machine using Docker.

## ✨ Features

* **Local-First Execution:** All components (LLM, vector database, backend, frontend) run locally in Docker containers.
* **Retrieval-Augmented Generation (RAG):** The chatbot answers questions by retrieving relevant information from your uploaded documents.
* **Document Management:**
    * Upload various document types (e.g., `.txt`, `.pdf`, `.docx`) for indexing.
    * View a paginated and searchable list of uploaded documents.
    * Preview the extracted text content of any uploaded document.
    * Delete documents, removing them from the RAG system.
* **Interactive Chat Interface:**
    * Conversational chat window with user and AI messages.
    * Source attribution for AI responses, indicating which documents and chunks were used.
    * Copy chat messages to clipboard.
    * Clear entire chat history.
* **Configurable LLM Settings:**
    * Select from locally available Ollama models (e.g., `llama2`, `mistral`).
    * Adjust LLM parameters like Temperature, Top K, and Top P.
* **Persistent Data:** Chat history, document metadata, and the vector database are persisted to disk, so your data remains even if containers are stopped.

## 🚀 Technologies Used

* **Backend:**
    * **Python Flask:** RESTful API server.
    * **Langchain:** Framework for building LLM applications, handling RAG chains, document loading, and chunking.
    * **Ollama:** Local LLM inference server and embedding provider.
    * **ChromaDB:** Local vector database for storing document embeddings.
    * **Unstructured.io:** For robust document parsing and text extraction from various file formats.
    * **TinyDB:** Lightweight, file-based database for persisting chat history and document metadata.
* **Frontend:**
    * **React.js:** Modern JavaScript library for building user interfaces.
    * **Vite:** Fast frontend build tool.
    * **Tailwind CSS:** Utility-first CSS framework for styling.
    * **Lucide React:** Icon library for clean UI elements.
* **Containerization:**
    * **Docker:** For packaging applications into isolated containers.
    * **Docker Compose:** For defining and running multi-container Docker applications.

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

* **Docker Desktop:** This includes Docker Engine, Docker CLI, and Docker Compose.
    * [Download Docker Desktop](https://www.docker.com/products/docker-desktop/) (Available for macOS, Windows, Linux).
    * After installation, make sure Docker Desktop is running. You should see the Docker whale icon in your system tray/menu bar.

## 📦 Setup and Running the Application

Follow these steps to get your Local RAG Chatbot up and running:

1.  **Clone the Repository:**
    ```bash
    git clone <your-repository-url>
    cd your-rag-project # Navigate into the project directory
    ```
    *(Replace `<your-repository-url>` with the actual URL of your GitHub repository)*

2.  **Configure Environment Variables (Optional but Recommended):**
    The project uses a `.env` file for configuration. A default `.env` is provided. You can customize the LLM model, embedding model, and other parameters by editing this file at the root of your project:
    ```bash
    # .env
    OLLAMA_HOST=http://ollama:11434
    LLM_MODEL=llama2 # Change to 'mistral', 'llama3', etc., if desired
    EMBEDDING_MODEL=nomic-embed-text
    LLM_TEMPERATURE=0.7
    LLM_TOP_K=40
    LLM_TOP_P=0.9
    REACT_APP_API_BASE_URL=http://localhost:5000
    ```
    * **Note:** The `OLLAMA_HOST` inside `docker-compose.yml` points to the `ollama` service name within the Docker network, which is correct for inter-container communication.

3.  **Build and Run Docker Containers:**
    From the root of your `your-rag-project` directory, execute the Docker Compose command:
    ```bash
    docker-compose up --build -d
    ```
    * `--build`: This command builds the Docker images for your backend and frontend services. This is essential for the first run and after any changes to `Dockerfile`s or dependency files (`requirements.txt`, `package.json`).
    * `-d`: Runs the containers in "detached" mode, allowing them to run in the background.

4.  **Monitor Ollama Model Download (Crucial First Step):**
    The `ollama` service will start and automatically attempt to download the specified LLM (`llama2` by default) and embedding models (`nomic-embed-text` by default). This step requires an active internet connection and can take a considerable amount of time depending on your network speed and model sizes.

    To monitor the download progress, open a new terminal window and run:
    ```bash
    docker-compose logs -f ollama
    ```
    Wait until you see messages indicating that Ollama is "serving" or "listening" on port 11434. This confirms the models are downloaded and Ollama is ready.

5.  **Access the Application:**
    Once all services are up and running (including Ollama with its models), open your web browser and navigate to:
    ```
    http://localhost:3000
    ```

You should now see the Local RAG Chatbot frontend!

## 📂 Project Structure


your-rag-project/
├── .env                      # Environment variables for Docker Compose and services
├── docker-compose.yml        # Defines and orchestrates Docker services
├── backend/                  # Flask API for RAG logic
│   ├── Dockerfile            # Dockerfile for building the Flask backend image
│   ├── app.py                # Main Flask application
│   └── requirements.txt      # Python dependencies for the backend
└── frontend/                 # React application for the user interface
├── Dockerfile            # Dockerfile for building the React frontend image
├── package.json          # Node.js dependencies for React
├── tailwind.config.js    # Tailwind CSS configuration
├── src/
│   ├── App.js            # Main React application component
│   └── index.css         # Global CSS and Tailwind directives
└── public/
└── index.html        # Main HTML file for the React app


## 💡 Usage

1.  **Documents Tab:**
    * Go to the "Documents" tab.
    * Use the "Upload New Document" section to select `.txt`, `.pdf`, or `.docx` files. Click "Upload". The backend will process and index the document.
    * The "Your Uploaded Documents" section will list your documents. You can search by filename and navigate through pages if you have many documents.
    * Use the "Eye" icon to preview the extracted text content.
    * Use the "Trash" icon to delete a document from the system.

2.  **Chat Tab:**
    * Go to the "Chat" tab.
    * Type your questions in the input field at the bottom.
    * The AI will respond, leveraging the content of your uploaded documents.
    * Responses will include "Sources" if information was retrieved from your documents. Click "View Sources" to see snippets.
    * Use the "Copy" icon to copy any chat message.
    * Use the "Clear" button to clear the chat history.

3.  **Settings Tab:**
    * Go to the "Settings" tab.
    * Select a different Ollama model from the dropdown (ensure it's downloaded locally).
    * Adjust LLM parameters like Temperature, Top K, and Top P.
    * Click "Save Settings" to apply changes.

## 🐛 Troubleshooting

* **"Could not connect to Ollama. Is it running?" / LLM errors:**
    * Ensure Docker Desktop is running.
    * Run `docker-compose logs -f ollama` in your terminal. Check for errors during model download or if Ollama failed to start serving.
    * Verify that the models specified in your `.env` file (`LLM_MODEL`, `EMBEDDING_MODEL`) are correctly spelled and available on Ollama Hub.
    * Ensure you have enough disk space for the Ollama models.
* **"Failed to upload document" / Document processing errors:**
    * Check the `docker-compose logs -f backend` for detailed Python errors.
    * Ensure the document is a supported format (`.txt`, `.pdf`, `.docx`). For `.pdf` and `.docx`, `unstructured.io` relies on system-level dependencies which might not be fully present in the base Python Docker image. If you encounter issues with these file types, you might need to add more `apt-get install` commands to the `backend/Dockerfile` (e.g., `poppler-utils`, `tesseract-ocr`, `libreoffice-writer` for LibreOffice conversion).
* **Frontend not loading (`http://localhost:3000`):**
    * Check `docker-compose logs -f frontend` for build or serving errors.
    * Ensure port 3000 is not already in use by another application on your host machine.
    * Try rebuilding the frontend: `docker-compose build frontend` then `docker-compose up -d frontend`.
* **Data not persisting:**
    * Ensure the `data/` directory exists at the root of your project and has proper write permissions. Docker volumes rely on this.

## 🤝 Contributing

Feel free to fork this repository, open issues, or submit pull requests.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
