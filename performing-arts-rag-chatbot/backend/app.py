# app.py - Flask Backend for Local RAG System

import os
import json
import uuid
import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

# Import Ollama and other necessary libraries from Langchain
from langchain_community.llms import Ollama
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.documents import Document as LangchainDocument # Alias to avoid conflict

# Import unstructured for document parsing
from unstructured.partition.auto import partition

# Import requests for direct Ollama API calls (e.g., listing models)
import requests

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

# --- Configuration ---
DATA_DIR = 'data'
UPLOAD_FOLDER = os.path.join(DATA_DIR, 'documents')
PERSIST_DIRECTORY = os.path.join(DATA_DIR, 'chroma_db')
TINYDB_DIR = os.path.join(DATA_DIR, 'tinydb')

# Ensure all necessary directories exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PERSIST_DIRECTORY, exist_ok=True)
os.makedirs(TINYDB_DIR, exist_ok=True)

# File paths for persistence
CHAT_HISTORY_FILE = os.path.join(TINYDB_DIR, 'chat_history.json')
DOCUMENTS_METADATA_FILE = os.path.join(TINYDB_DIR, 'documents_metadata.json')
LLM_SETTINGS_FILE = os.path.join(TINYDB_DIR, 'llm_settings.json')


# --- Global Variables for RAG System ---
# Initialize LLM and Embeddings (default to Llama2 and Nomic-embed-text)
# These will be updated by settings from the frontend
LLM_MODEL = os.getenv("LLM_MODEL", "llama2")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "nomic-embed-text")
LLM_TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", 0.7))
LLM_TOP_K = int(os.getenv("LLM_TOP_K", 40))
LLM_TOP_P = float(os.getenv("LLM_TOP_P", 0.9))

llm = None # Will be initialized in initialize_rag_system
embeddings = None # Will be initialized in initialize_rag_system
vectorstore = None
retrieval_chain = None # The main RAG chain

chat_history_data = [] # Stores chat messages (in-memory, also persisted to file)
documents_metadata = {} # Stores metadata about uploaded documents {doc_id: {filename, path, upload_date, num_chunks}}


# --- Persistence Functions ---

def load_documents_metadata():
    """Loads document metadata from a JSON file."""
    global documents_metadata
    if os.path.exists(DOCUMENTS_METADATA_FILE):
        try:
            with open(DOCUMENTS_METADATA_FILE, 'r') as f:
                documents_metadata = json.load(f)
            print(f"Loaded {len(documents_metadata)} document metadata entries.")
        except json.JSONDecodeError:
            print(f"Warning: {DOCUMENTS_METADATA_FILE} is corrupted or empty. Starting with empty metadata.")
            documents_metadata = {}
    else:
        documents_metadata = {}
        print("No existing document metadata found.")

def save_documents_metadata():
    """Saves document metadata to a JSON file."""
    with open(DOCUMENTS_METADATA_FILE, 'w') as f:
        json.dump(documents_metadata, f, indent=4)
    print("Document metadata saved.")

def load_chat_history():
    """Loads chat history from a JSON file."""
    global chat_history_data
    if os.path.exists(CHAT_HISTORY_FILE):
        try:
            with open(CHAT_HISTORY_FILE, 'r') as f:
                chat_history_data = json.load(f)
            print(f"Loaded {len(chat_history_data)} chat history entries.")
        except json.JSONDecodeError:
            print(f"Warning: {CHAT_HISTORY_FILE} is corrupted or empty. Starting with empty chat history.")
            chat_history_data = []
    else:
        chat_history_data = []
        print("No existing chat history found.")

def save_chat_history():
    """Saves chat history to a JSON file."""
    with open(CHAT_HISTORY_FILE, 'w') as f:
        json.dump(chat_history_data, f, indent=4)
    print("Chat history saved.")

def load_llm_settings():
    """Loads LLM settings from a JSON file."""
    global LLM_MODEL, LLM_TEMPERATURE, LLM_TOP_K, LLM_TOP_P
    if os.path.exists(LLM_SETTINGS_FILE):
        try:
            with open(LLM_SETTINGS_FILE, 'r') as f:
                loaded_settings = json.load(f)
                LLM_MODEL = loaded_settings.get('model', LLM_MODEL)
                LLM_TEMPERATURE = loaded_settings.get('temperature', LLM_TEMPERATURE)
                LLM_TOP_K = loaded_settings.get('top_k', LLM_TOP_K)
                LLM_TOP_P = loaded_settings.get('top_p', LLM_TOP_P)
            print("LLM settings loaded.")
        except json.JSONDecodeError:
            print(f"Warning: {LLM_SETTINGS_FILE} is corrupted or empty. Using default LLM settings.")
            save_llm_settings() # Save defaults if file is bad
    else:
        save_llm_settings() # Save default settings if file doesn't exist

def save_llm_settings():
    """Saves current LLM settings to a JSON file."""
    settings_to_save = {
        "model": LLM_MODEL,
        "temperature": LLM_TEMPERATURE,
        "top_k": LLM_TOP_K,
        "top_p": LLM_TOP_P
    }
    with open(LLM_SETTINGS_FILE, 'w') as f:
        json.dump(settings_to_save, f, indent=4)
    print("LLM settings saved.")

# --- RAG System Initialization and Updates ---

def initialize_rag_system():
    """Initializes LLM, Embeddings, Vector Store, and RAG chain."""
    global llm, embeddings, vectorstore, retrieval_chain

    # Load persistent data
    load_llm_settings() # Load settings first to configure LLM
    load_documents_metadata()
    load_chat_history()

    # Initialize LLM and Embeddings based on loaded settings
    try:
        llm = Ollama(
            model=LLM_MODEL,
            temperature=LLM_TEMPERATURE,
            top_k=LLM_TOP_K,
            top_p=LLM_TOP_P,
            base_url=os.getenv("OLLAMA_HOST", "http://localhost:11434") # Use OLLAMA_HOST from .env
        )
        embeddings = OllamaEmbeddings(
            model=EMBEDDING_MODEL,
            base_url=os.getenv("OLLAMA_HOST", "http://localhost:11434") # Use OLLAMA_HOST from .env
        )
        print(f"LLM initialized: {LLM_MODEL}, Embeddings initialized: {EMBEDDING_MODEL}")
    except Exception as e:
        print(f"CRITICAL ERROR: Could not initialize Ollama LLM or Embeddings. Is Ollama running and models pulled? Error: {e}")
        llm = None # Set to None to indicate failure
        embeddings = None
        # Do not return here, allow the app to start but with limited functionality
        # Endpoints will check for llm/embeddings being None

    # Initialize or load ChromaDB
    try:
        vectorstore = Chroma(persist_directory=PERSIST_DIRECTORY, embedding_function=embeddings)
        print(f"Loaded ChromaDB from {PERSIST_DIRECTORY}")
    except Exception as e:
        print(f"Could not load ChromaDB, creating a new one. Error: {e}")
        vectorstore = Chroma(embedding_function=embeddings, persist_directory=PERSIST_DIRECTORY)
        vectorstore.persist()
        print(f"Created new ChromaDB at {PERSIST_DIRECTORY}")

    # Create the RAG chain
    _create_rag_chain()
    print("RAG system initialized.")

def _create_rag_chain():
    """Creates or re-creates the RAG retrieval chain."""
    global retrieval_chain, llm, vectorstore

    if llm is None or vectorstore is None:
        print("Cannot create RAG chain: LLM or Vectorstore not initialized. RAG functionality will be limited.")
        retrieval_chain = None
        return

    # Define the prompt template for the LLM
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a helpful assistant. Answer the user's questions based on the provided context. If you don't know the answer, just say that you don't know, don't try to make up an answer. Provide sources for your answers, referencing the original filename, chunk index, and document ID."),
        ("placeholder", "{chat_history}"), # Placeholder for chat history
        ("human", "{input}"), # User's current question
    ])

    # Create the document chain (combines retrieved documents with the prompt)
    document_chain = create_stuff_documents_chain(llm, prompt)

    # Create the retriever from the vector store
    retriever = vectorstore.as_retriever()

    # Create the full retrieval chain
    retrieval_chain = create_retrieval_chain(retriever, document_chain)
    print("RAG retrieval chain created.")


# --- API Endpoints ---

@app.route('/')
def index():
    return "Local RAG System Backend is running!"

@app.route('/upload_document', methods=['POST'])
def upload_document():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    if file:
        original_filename = secure_filename(file.filename)
        document_id = str(uuid.uuid4()) # Generate a unique ID for the document
        file_extension = os.path.splitext(original_filename)[1].lower()
        # Create a unique filename on disk to avoid conflicts
        filename_on_disk = f"{document_id}{file_extension}"
        filepath = os.path.join(UPLOAD_FOLDER, filename_on_disk)
        file.save(filepath)

        try:
            # Use unstructured.io to parse the document content
            elements = partition(filename=filepath)
            
            # Convert elements to Langchain Document objects
            # We'll use RecursiveCharacterTextSplitter for chunking
            text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
            
            langchain_docs = []
            for i, element in enumerate(elements):
                if element.text.strip():
                    # Split the element text into smaller chunks if it's too long
                    # This ensures smaller, more manageable chunks for the vector store
                    sub_chunks = text_splitter.split_text(element.text)
                    for j, sub_chunk_text in enumerate(sub_chunks):
                        doc = LangchainDocument(
                            page_content=sub_chunk_text,
                            metadata={
                                "document_id": document_id,
                                "original_filename": original_filename,
                                "chunk_index": f"{i}-{j}", # Combine element index and sub-chunk index
                                "source_type": element.category # e.g., 'Title', 'NarrativeText'
                            }
                        )
                        langchain_docs.append(doc)

            if not langchain_docs:
                os.remove(filepath) # Clean up if no documents were loaded
                return jsonify({"error": "Could not extract content from document. Ensure it's a supported format (PDF, TXT, DOCX, etc.) and not empty."}), 500

            # Add documents to the vectorstore
            global vectorstore
            if vectorstore is None: # Should be initialized, but fallback
                initialize_rag_system() # Attempt to re-initialize if it failed earlier

            if vectorstore:
                vectorstore.add_documents(langchain_docs)
                vectorstore.persist() # Persist changes to disk
            else:
                os.remove(filepath)
                return jsonify({"error": "Vector store not initialized. Cannot index document."}), 500

            # Store metadata
            documents_metadata[document_id] = {
                "original_filename": original_filename,
                "filename_on_disk": filename_on_disk, # Store the name used on disk
                "filepath": filepath, # Full path to the file
                "upload_date": datetime.datetime.now().isoformat(),
                "num_chunks": len(langchain_docs) # Number of elements/chunks processed
            }
            save_documents_metadata()

            # Recreate RAG chain to ensure it uses the latest vectorstore state
            _create_rag_chain()

            return jsonify({
                "message": "Document uploaded and processed successfully",
                "id": document_id,
                "original_filename": original_filename,
                "num_chunks": len(langchain_docs)
            }), 200
        except Exception as e:
            os.remove(filepath) # Clean up partially processed file
            print(f"Error processing document: {e}")
            return jsonify({"error": f"Error processing document: {e}. Check backend console for details."}), 500

@app.route('/documents', methods=['GET'])
def get_documents():
    search_query = request.args.get('query', '').lower()
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 5)) # Default limit to 5, matches frontend

    # Convert documents_metadata dict to a list for filtering and sorting
    all_docs = []
    for doc_id, meta in documents_metadata.items():
        doc_info = meta.copy()
        doc_info['id'] = doc_id
        all_docs.append(doc_info)

    # Apply search filter
    if search_query:
        filtered_docs = [
            doc for doc in all_docs
            if search_query in doc['original_filename'].lower()
        ]
    else:
        filtered_docs = all_docs

    # Sort documents by upload date (newest first)
    filtered_docs.sort(key=lambda x: x['upload_date'], reverse=True)

    total_documents = len(filtered_docs)
    
    # Apply pagination
    start_index = (page - 1) * limit
    end_index = start_index + limit
    paginated_docs = filtered_docs[start_index:end_index]

    return jsonify({
        "documents": paginated_docs,
        "total_documents": total_documents,
        "page": page,
        "limit": limit
    }), 200

@app.route('/delete_document/<document_id>', methods=['DELETE'])
def delete_document(document_id):
    if document_id not in documents_metadata:
        return jsonify({"error": "Document not found"}), 404

    doc_info = documents_metadata[document_id]
    filepath = doc_info['filepath']

    try:
        # Delete document from ChromaDB by its document_id
        global vectorstore
        if vectorstore:
            # Langchain's Chroma.delete() method accepts a where clause for metadata filtering
            vectorstore.delete(where={"document_id": document_id})
            vectorstore.persist() # Persist changes
            print(f"Deleted chunks for document {document_id} from ChromaDB.")
        else:
            print("Vectorstore not initialized, cannot delete chunks from ChromaDB.")

        # Delete the file from the upload folder
        if os.path.exists(filepath):
            os.remove(filepath)
            print(f"Deleted file: {filepath}")

        # Remove from our metadata tracking
        del documents_metadata[document_id]
        save_documents_metadata()

        # Recreate RAG chain to ensure it uses the latest vectorstore state
        _create_rag_chain()

        return jsonify({"message": "Document deleted successfully"}), 200
    except Exception as e:
        print(f"Error deleting document {document_id}: {e}")
        return jsonify({"error": f"Failed to delete document: {str(e)}"}), 500

@app.route('/preview_extracted_text/<document_id>', methods=['GET'])
def preview_extracted_text(document_id):
    if document_id not in documents_metadata:
        return jsonify({"error": "Document not found"}), 404

    filepath = documents_metadata[document_id]['filepath']
    if not os.path.exists(filepath):
        return jsonify({"error": "Document file not found on server"}), 404

    try:
        # Read the entire content of the file
        # For larger files, consider streaming or reading in chunks
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        return jsonify({"content": content}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to read document content: {str(e)}"}), 500

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message_content = data.get('message')
    if not user_message_content:
        return jsonify({"error": "No message provided"}), 400

    # Add user message to history
    chat_history_data.append({"role": "user", "content": user_message_content, "timestamp": datetime.datetime.now().isoformat()})
    save_chat_history()

    try:
        if retrieval_chain is None:
            return jsonify({"error": "RAG system not fully initialized. Please check backend logs."}), 500

        # Convert chat history for prompt
        messages = []
        # Only include actual chat messages, not error messages from previous runs
        for msg in chat_history_data:
            if msg["role"] == "user":
                messages.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "assistant" and not msg.get("isError", False): # Exclude error messages
                messages.append(AIMessage(content=msg["content"]))

        # Invoke the retrieval chain with current message and history
        # The chain expects 'input' for the current query and 'chat_history'
        response = retrieval_chain.invoke({
            "input": user_message_content,
            "chat_history": messages[:-1] # Exclude the current user message from chat_history passed to LLM
        })

        response_content = response["answer"]
        sources = []
        if "context" in response:
            for doc in response["context"]:
                source_info = {
                    "original_filename": doc.metadata.get("original_filename", "N/A"),
                    "chunk_index": doc.metadata.get("chunk_index", "N/A"),
                    "document_id": doc.metadata.get("document_id", "N/A"),
                    "snippet": doc.page_content[:200] + "..." if len(doc.page_content) > 200 else doc.page_content
                }
                sources.append(source_info)

        assistant_response = {
            "response": response_content,
            "sources": sources,
            "timestamp": datetime.datetime.now().isoformat()
        }

        # Add assistant message to history
        chat_history_data.append({"role": "assistant", "content": assistant_response["response"], "timestamp": assistant_response["timestamp"], "sources": assistant_response["sources"]})
        save_chat_history()

        return jsonify(assistant_response), 200

    except Exception as e:
        print(f"Error during chat: {e}")
        error_message = f"An error occurred while processing your request: {e}. Please check the backend console."
        # Add an error message to chat history
        chat_history_data.append({"role": "assistant", "content": error_message, "timestamp": datetime.datetime.now().isoformat(), "isError": True})
        save_chat_history()
        return jsonify({"error": error_message}), 500

@app.route('/chat_history', methods=['GET'])
def get_chat_history():
    return jsonify(chat_history_data), 200

@app.route('/clear_chat_history', methods=['POST'])
def clear_chat_history():
    global chat_history_data
    chat_history_data = []
    save_chat_history()
    return jsonify({"message": "Chat history cleared"}), 200

@app.route('/llm_settings', methods=['GET'])
def get_llm_settings_api():
    # Return current global settings
    return jsonify({
        "model": LLM_MODEL,
        "temperature": LLM_TEMPERATURE,
        "top_k": LLM_TOP_K,
        "top_p": LLM_TOP_P
    }), 200

@app.route('/llm_settings', methods=['POST'])
def update_llm_settings_api():
    global LLM_MODEL, LLM_TEMPERATURE, LLM_TOP_K, LLM_TOP_P, llm

    data = request.json
    new_model = data.get('model', LLM_MODEL)
    new_temperature = float(data.get('temperature', LLM_TEMPERATURE))
    new_top_k = int(data.get('top_k', LLM_TOP_K))
    new_top_p = float(data.get('top_p', LLM_TOP_P))

    # Validate inputs
    if not (0 <= new_temperature <= 2):
        return jsonify({"error": "Temperature must be between 0 and 2"}), 400
    if not (0 <= new_top_k <= 1000): # Increased max for top_k
        return jsonify({"error": "Top K must be between 0 and 1000"}), 400
    if not (0 <= new_top_p <= 1):
        return jsonify({"error": "Top P must be between 0 and 1"}), 400

    # Check if settings have actually changed
    if (new_model != LLM_MODEL or
        new_temperature != LLM_TEMPERATURE or
        new_top_k != LLM_TOP_K or
        new_top_p != LLM_TOP_P):

        LLM_MODEL = new_model
        LLM_TEMPERATURE = new_temperature
        LLM_TOP_K = new_top_k
        LLM_TOP_P = new_top_p

        # Re-initialize the LLM with new settings
        try:
            llm = Ollama(
                model=LLM_MODEL,
                temperature=LLM_TEMPERATURE,
                top_k=LLM_TOP_K,
                top_p=LLM_TOP_P,
                base_url=os.getenv("OLLAMA_HOST", "http://localhost:11434")
            )
            # Recreate RAG chain with new LLM
            _create_rag_chain()
            save_llm_settings() # Save updated settings to file
            print(f"LLM settings updated: Model={LLM_MODEL}, Temp={LLM_TEMPERATURE}, TopK={LLM_TOP_K}, TopP={LLM_TOP_P}")
            return jsonify({"message": "LLM settings updated successfully", "current_settings": {"model": LLM_MODEL, "temperature": LLM_TEMPERATURE, "top_k": LLM_TOP_K, "top_p": LLM_TOP_P}}), 200
        except Exception as e:
            print(f"Error re-initializing LLM with new settings: {e}")
            return jsonify({"error": f"Failed to update LLM settings: {str(e)}. Ensure model is available."}), 500
    else:
        return jsonify({"message": "No changes to LLM settings"}), 200

@app.route('/ollama_models', methods=['GET'])
def get_ollama_models():
    """Fetches a list of available Ollama models using direct API call."""
    try:
        ollama_api_url = os.getenv("OLLAMA_HOST", "http://localhost:11434") + "/api/tags"
        response = requests.get(ollama_api_url)
        response.raise_for_status() # Raise an HTTPError for bad responses (4xx or 5xx)
        models_data = response.json()
        model_names = [m['name'] for m in models_data.get('models', [])]
        return jsonify({"models": model_names}), 200
    except requests.exceptions.ConnectionError:
        return jsonify({"error": "Could not connect to Ollama. Is it running?"}), 500
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Error fetching Ollama models: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500


# Run initialization when the app starts
if __name__ == '__main__':
    initialize_rag_system()
    app.run(debug=True) # debug=True allows auto-reloading and better error messages
