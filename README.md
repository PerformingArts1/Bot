Performing Arts Center AI Chatbot (Frontend)
This is the frontend application for the Performing Arts Center AI Chatbot. It provides a user interface for interacting with the RAG (Retrieval Augmented Generation) backend, allowing users to chat with an AI assistant, upload documents for ingestion, and browse knowledge base resources.
Features
	•	Interactive Chat Interface: Engage in conversations with the AI assistant.
	•	Multimodal Input: Send text queries along with images for AI analysis.
	•	RAG Context Display: Visually presents the retrieved document chunks, including source, AI-generated tags, extracted table content, and associated images, directly within the chat.
	•	Asynchronous Document Upload: Upload various document types (PDF, DOCX, XLSX, images, etc.) for backend processing and ingestion into the knowledge base.
	•	Knowledge Base Browsing: Dedicated section to explore simulated training documents, inventory lists, and training videos.
	•	Firebase Integration: Utilizes Firebase Authentication for anonymous user sessions and Firestore for persistent chat history.
	•	Real-time Backend Status: Displays the connection status to the Python backend.
	•	Responsive Design: Built with Tailwind CSS for a mobile-first and adaptive user experience.
Architecture
The frontend is a React application built with:
	•	React: For building the user interface.
	•	Tailwind CSS: A utility-first CSS framework for rapid styling and responsive design.
	•	Lucide React: A collection of beautiful and customizable open-source icons.
	•	Firebase:
	◦	Authentication: For managing user sessions (anonymous sign-in).
	◦	Firestore: A NoSQL cloud database for storing chat history in real-time.
	•	Backend Interaction: Communicates with the separate Python Flask backend API for AI chat responses and document ingestion.
Setup
Follow these steps to get the frontend running locally.
Prerequisites
	•	Node.js (LTS version recommended)
	•	npm (Node Package Manager, comes with Node.js) or yarn
1. Clone the Repository
Assuming you have a monorepo structure where ai-chatbot-app is your frontend folder:
git clone <your-repo-url>
cd <your-repo-name>/ai-chatbot-app # Navigate to your frontend directory

2. Install Dependencies
npm install
# or
yarn install

3. Configure Tailwind CSS
Ensure your tailwind.config.js and src/index.css (or src/App.css) are correctly set up.
tailwind.config.js:
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

src/index.css (or your main CSS file):
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Add Inter font */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* Custom scrollbar for better aesthetics */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #555;
}

4. Firebase Configuration
The application expects Firebase configuration and an initial authentication token to be injected into the environment. This is typically handled by the platform where the application is hosted (e.g., Google Cloud Canvas).
	•	__firebase_config: Your Firebase project's configuration object (JSON string).
	•	__app_id: A unique identifier for your application (string).
	•	__initial_auth_token: A custom Firebase authentication token (string).
If running locally for development, you might need to mock these global variables or set them up in your build process.
5. Run the Application
First, ensure your Python Backend is fully running (Flask API, Celery Worker, Celery Beat, Ollama, Redis). Refer to the backend's README.md for instructions.
Once the backend is operational, start the React development server:
npm start
# or
yarn start

The application should open in your browser at http://localhost:3000 (or another available port).
Usage
	•	Chat Tab:
	◦	Type your query in the input field and press Enter or click the "Send" button.
	◦	Click the microphone icon for voice input (Chrome browser recommended).
	◦	Click the image icon to upload an image along with your text query for multimodal interactions.
	◦	Click on the "Quick Access & Common Queries" buttons to send predefined questions.
	•	Docs & Inventory Tab:
	◦	Upload New Documents: Use the "Click to select document for upload" area to ingest new files into the RAG system. Supported formats include PDF, DOCX, XLSX, PPTX, TXT, MD, JSON, common image types, and DXF.
	◦	Browse Resources: Explore simulated lists of training documents, videos, and inventory items. Use the search bars to filter content.
	◦	Floor Plans: Interact with the conceptual floor map to see simulated details about different areas of the performing arts center.
Future Enhancements
	•	User Authentication: Implement full user login/registration with Firebase.
	•	Role-Based Access Control: Restrict access to certain features (e.g., document upload) based on user roles.
	•	Real Document Display: Integrate a PDF/document viewer to display ingested documents directly in the frontend.
	•	Interactive Floor Map: Develop a fully functional interactive floor map that dynamically loads data from the backend's indexed documents.
	•	Searchable Inventory: Connect inventory lists to a real backend database for dynamic search and management.
	•	Live Video Integration: Embed actual training videos from YouTube or other platforms.
License
This project is licensed under the MIT License - see the LICENSE file for details.
