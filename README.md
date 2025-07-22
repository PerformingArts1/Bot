Local RAG System
A full-stack, local-first AI chatbot application with Retrieval-Augmented Generation (RAG) capabilities. This system allows users to upload their own documents, chat with a local Large Language Model (LLM) that leverages these documents for informed responses, and manage LLM settings, all running entirely on your local machine using Docker. Optimized for powerful local machines like the Mac Mini M4 Max.

✨ Features
Local-First Execution: All components (LLM, vector database, backend, frontend) run locally in Docker containers.

Retrieval-Augmented Generation (RAG): The chatbot answers questions by retrieving relevant information from your uploaded documents.

Hybrid Search: Combines semantic (vector) search with keyword (BM25) search for improved retrieval accuracy.

Re-ranking (Conceptual): Includes a framework for re-ranking retrieved documents using a cross-encoder model (requires uncommenting and setup).

Asynchronous Document Ingestion: Document processing (parsing, chunking, embedding) is offloaded to a background thread, preventing UI freezes during uploads. Real-time status updates are provided via WebSockets.

Document Management:

Upload various document types (e.g., .txt, .pdf, .docx) for indexing via a drag-and-drop interface.

View a paginated and searchable list of uploaded documents.

Preview the extracted text content of any uploaded document.

Delete documents, removing them from the RAG system.

Interactive Chat Interface:

Conversational chat window with user and AI messages.

Streaming Responses: LLM responses are streamed token-by-token for a more dynamic user experience.

Real-time "Assistant is typing..." indicator via WebSockets.

Source attribution for AI responses, indicating which documents and chunks were used.

Copy chat messages to clipboard.

Export chat history to JSON or Markdown.

Clear entire chat history.

Configurable LLM Settings:

Select from locally available Ollama models (e.g., llama2, mistral).

Adjust LLM parameters like Temperature, Top K, and Top P.

Settings are persisted locally and loaded on startup.

Persistent Data: Uploaded documents, vector store, chat history, and LLM settings are persisted across sessions.

Responsive UI: Modern and adaptive user interface built with React and Tailwind CSS.

Theme Toggle: Switch between dark and light modes.

Progressive Web App (PWA) Ready: Includes manifest link for installability (full offline support requires service worker).

🚀 Getting Started
These instructions will get you a copy of the project up and running on your local machine.

Prerequisites
Before you begin, ensure you have the following installed:

Docker Desktop: Download Docker Desktop (includes Docker Engine and Docker Compose)

Ollama: Download Ollama

Once installed, pull the required LLM and Embedding models. You can specify these in your .env file.

ollama pull llama2 # Or your preferred LLM, e.g., mistral
ollama pull nomic-embed-text # Or your preferred embedding model

Installation & Setup
Clone the repository:

git clone https://github.com/PerformingArts1/Bot.git # Replace with your actual repo URL if different
cd Bot/performing-arts-rag-chatbot # Navigate into the project directory

Adjust Project Structure (IMPORTANT!):
The docker-compose.yml expects the backend and frontend code in backend/ and frontend/ subdirectories. You need to manually create these and move your files:

# From the 'performing-arts-rag-chatbot' directory:
mkdir -p backend frontend/src/services frontend/src/__tests__ frontend/public

# Move backend files
mv app.py backend/
mv Dockerfile backend/
mv requirements.txt backend/

# Move frontend files
mv index.html frontend/public/
mv vite.svg frontend/public/ # If you have this file
mv App.js frontend/src/
mv index.css frontend/src/
mv main.jsx frontend/src/ # Or index.js if that's your entry point
mv package.json frontend/
mv package-lock.json frontend/ # or yarn.lock
mv tailwind.config.js frontend/

# Create .env.example (if not already present)
# Copy the content from the .env.example section below into this file
touch .env.example

Create .env file:
Copy the content from .env.example into a new file named .env in the root of your performing-arts-rag-chatbot directory. Adjust LLM_MODEL and EMBEDDING_MODEL if you pulled different models.

cp .env.example .env

Build and Run with Docker Compose:
Navigate to the performing-arts-rag-chatbot directory (where docker-compose.yml is located) and run:

docker-compose build
docker-compose up -d

docker-compose build: Builds the Docker images for your backend and frontend. This might take a few minutes the first time as it installs dependencies and system packages.

docker-compose up -d: Starts the services in detached mode.

Access the Application:
Once all services are up and running (this might take a minute or two for Ollama to start and pull models), you can access the application:

Frontend: Open your web browser and go to http://localhost:3000

Backend API: http://localhost:5000 (for direct API calls, not typically used by user)

📂 Project Structure
performing-arts-rag-chatbot/
├── backend/
│   ├── app.py                  # Flask backend application (with app factory, async tasks, SocketIO)
│   ├── Dockerfile              # Dockerfile for backend (includes unstructured dependencies)
│   ├── requirements.txt        # Python dependencies (Flask-SocketIO, gunicorn)
│   └── tests/
│       └── test_app.py         # Backend unit tests
├── frontend/
│   ├── public/
│   │   ├── index.html          # Main HTML file (PWA manifest link added)
│   │   ├── manifest.json       # PWA manifest (you need to create this)
│   │   ├── service-worker.js   # PWA service worker (you need to create this)
│   │   └── vite.svg            # Favicon
│   ├── src/
│   │   ├── App.js              # React main component (with SocketIO, API client, theme toggle, streaming)
│   │   ├── index.css           # Global Tailwind CSS and custom styles (including theme)
│   │   ├── main.jsx            # React entry point
│   │   └── services/
│   │       └── api.js          # Centralized API client for frontend
│   │   └── __tests__/
│   │       └── App.test.js     # Frontend unit tests
│   ├── package.json            # Frontend dependencies (socket.io-client)
│   ├── package-lock.json       # npm lock file
│   └── tailwind.config.js      # Tailwind CSS configuration
├── .env.example                # Example environment variables
├── .gitignore                  # Files/directories to ignore in Git
├── .dockerignore               # Files/directories to ignore in Docker builds
└── README.md                   # This file

🛠️ Troubleshooting
"Could not connect to Ollama API. Is Ollama running?":

Ensure the Ollama application is running on your host machine before starting Docker Compose.

Verify that OLLAMA_HOST in your .env file is set correctly (e.g., http://ollama:11434 for Docker internal network, or http://localhost:11434 if Ollama is on host and not in Docker).

Check docker-compose logs ollama and docker-compose logs backend for errors.

Ensure Ollama has pulled the required models (llama2, nomic-embed-text) using ollama list on your host.

Frontend not loading (http://localhost:3000) or showing blank page:

Check docker-compose logs frontend for build or serving errors.

Ensure port 3000 is not already in use on your host machine.

Verify VITE_REACT_APP_API_BASE_URL in your .env matches the backend service's exposed port.

Rebuild the frontend image: docker-compose build frontend then docker-compose up -d frontend.

Document processing seems stuck or fails silently:

Check docker-compose logs backend for detailed Python errors. The backend now processes documents asynchronously, and errors will be logged there and emitted via WebSockets.

Ensure system dependencies for unstructured (like poppler-utils, libreoffice, tesseract-ocr) are correctly installed in the backend/Dockerfile.

Chat messages not appearing in real-time:

Check network tab in browser developer tools for WebSocket connection issues.

Verify Flask-SocketIO is correctly installed (requirements.txt) and initialized in app.py.

Check docker-compose logs backend for any SocketIO errors.

Data not persisting:

Ensure the data/ directory exists at the root of your performing-arts-rag-chatbot project and has proper write permissions. Docker volumes rely on this.

🧪 Running Tests
Backend Tests (Python)
To run backend tests, ensure your Python virtual environment is active (if you set one up for local development outside Docker) or run pytest inside the backend container.

# Option 1: Run tests inside the backend container
docker-compose exec backend pytest backend/tests/

# Option 2: Run tests on host (if you have Python/pip installed and venv active)
# (From 'performing-arts-rag-chatbot' directory)
# cd backend
# pip install -r requirements.txt # if not already installed
# pytest tests/

Frontend Tests (JavaScript/React)
To run frontend tests:

# From 'performing-arts-rag-chatbot' directory
cd frontend
npm install # if not already installed
npm test

🔐 Authentication (Considerations for Public Deployment)
This application currently lacks user authentication and authorization. For a public-facing application, strongly consider implementing one of the following:

Flask-Login: A popular Flask extension for managing user sessions. It handles the common tasks of logging in, logging out, and remembering users' sessions.

Auth0 / Firebase Authentication: Managed authentication services that offload the complexity of user management, multi-factor authentication, etc., providing robust security features out-of-the-box.

PropelAuth: A library designed to simplify adding authentication and authorization to B2B/multi-tenant applications.

Implementing authentication is a significant addition and would require substantial changes to both backend and frontend.

🔄 Keeping Dependencies Updated & Auditing
It is critical to regularly update your project's dependencies to mitigate security vulnerabilities and leverage new features.

Python Dependencies
Update requirements.txt:

pip freeze > requirements.txt

Check for outdated packages:

pip list --outdated

Update specific packages:

pip install --upgrade <package-name>

Security Audit with pip-audit:

pip install pip-audit
pip-audit

Integrate pip-audit into your CI/CD pipeline.

Frontend Dependencies (Node.js/npm)
Check for outdated packages:

npm outdated

Update packages:

npm update # Updates to latest minor/patch
npm install # Updates package-lock.json based on package.json

For major version updates, consider npm-check-updates (ncu).

npm install -g npm-check-updates
ncu -u # Updates package.json
npm install # Installs new versions

Security Audit with npm audit:

npm audit

npm audit fix: Attempts to automatically resolve vulnerabilities.

npm audit fix --force: Use with caution, can force breaking changes.

Best Practices:

Regular Schedule: Make dependency updates and audits a regular part of your development cycle.

CI/CD Integration: Integrate npm audit and pip-audit into your CI/CD pipelines to catch vulnerabilities early.

Review Changes: Always review changelogs before upgrading major versions.

Testing: Comprehensive testing is essential after dependency updates.

🤝 Contributing
Feel free to fork this repository, open issues, or submit