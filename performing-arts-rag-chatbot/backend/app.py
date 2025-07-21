# app.py - Flask Backend for Local RAG System

import os
import json
import uuid
import datetime
import logging
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

# --- Logging Setup ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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

# --- Constants ---
ALLOWED_EXTENSIONS = {'.pdf', '.txt', '.docx'}
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200
PREVIEW_CHAR_LIMIT = 10000

# --- Global Variables for RAG System ---
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

# --- Utility Functions ---

def allowed_file(filename):
    return os.path.splitext(filename)[1].lower() in ALLOWED_EXTENSIONS

# --- Persistence Functions ---

def load_documents_metadata():
    global documents_metadata
    if os.path.exists(DOCUMENTS_METADATA_FILE):
        try:
            with open(DOCUMENTS_METADATA_FILE, 'r') as f:
                documents_metadata = json.load(f)
            logger.info(f"Loaded {len(documents_metadata)} document metadata entries.")
        except json.JSONDecodeError:
            logger.warning(f"{DOCUMENTS_METADATA_FILE} is corrupted or empty. Starting with empty metadata.")
            documents_metadata = {}
    else:
        documents_metadata = {}
        logger.info("No existing document metadata found.")

def save_documents_metadata():
    with open(DOCUMENTS_METADATA_FILE, 'w') as f:
        json.dump(documents_metadata, f, indent=4)
    logger.info("Document metadata saved.")

def load_chat_history():
    global chat_history_data
    if os.path.exists(CHAT_HISTORY_FILE):
        try:
            with open(CHAT_HISTORY_FILE, 'r') as f:
                chat_history_data = json.load(f)
            logger.info(f"Loaded {len(chat_history_data)} chat history entries.")
        except json.JSONDecodeError:
            logger.warning(f"{CHAT_HISTORY_FILE} is corrupted or empty. Starting with empty chat history.")
            chat_history_data = []
    else:
        chat_history_data = []
        logger.info("No existing chat history found.")

def save_chat_history():
    with open(CHAT_HISTORY_FILE, 'w') as f:
        json.dump(chat_history_data, f, indent=4)
    logger.info("Chat history saved.")

def load_llm_settings():
    global LLM_MODEL, LLM_TEMPERATURE, LLM_TOP_K, LLM_TOP_P
    if os.path.exists(LLM_SETTINGS_FILE):
        try:
            with open(LLM_SETTINGS_FILE, 'r') as f:
                loaded_settings = json.load(f)
                LLM_MODEL = loaded_settings.get('model', LLM_MODEL)
                LLM_TEMPERATURE = loaded_settings.get('temperature', LLM_TEMPERATURE)
                LLM_TOP_K = loaded_settings.get('top_k', LLM_TOP_K)
                LLM_TOP_P = loaded_settings.get('top_p', LLM_TOP_P)
            logger.info("LLM settings loaded.")
        except json.JSONDecodeError:
            logger.warning(f"{LLM_SETTINGS_FILE} is corrupted or empty. Using default LLM settings.")
            save_llm_settings()
    else:
        save_llm_settings()

def save_llm_settings():
    settings_to_save = {
        "model": LLM_MODEL,
        "temperature": LLM_TEMPERATURE,
        "top_k": LLM_TOP_K,
        "top_p": LLM_TOP_P
    }
    with open(LLM_SETTINGS_FILE, 'w') as f:
        json.dump(settings_to_save, f, indent=4)
    logger.info("LLM settings saved.")

# --- RAG System Initialization and Updates ---

def initialize_rag_system():
    global llm, embeddings, vectorstore, retrieval_chain

    load_llm_settings()
    load_documents_metadata()
    load_chat_history()

    try:
        llm = Ollama(
            model=LLM_MODEL,
            temperature=LLM_TEMPERATURE,
            top_k=LLM_TOP_K,
            top_p=LLM_TOP_P,
            base_url=os.getenv("OLLAMA_HOST", "http://localhost:11434")
        )
        embeddings = OllamaEmbeddings(
            model=EMBEDDING_MODEL,
            base_url=os.getenv("OLLAMA_HOST", "http://localhost:11434")
        )
        logger.info(f"LLM initialized: {LLM_MODEL}, Embeddings initialized: {EMBEDDING_MODEL}")
    except Exception as e:
        logger.critical(f"Could not initialize Ollama LLM or Embeddings. Is Ollama running and models pulled? Error: {e}")
        llm = None
        embeddings = None

    try:
        vectorstore = Chroma(persist_directory=PERSIST_DIRECTORY, embedding_function=embeddings)
        logger.info(f"Loaded ChromaDB from {PERSIST_DIRECTORY}")
    except Exception as e:
        logger.warning(f"Could not load ChromaDB, creating a new one. Error: {e}")
        vectorstore = Chroma(embedding_function=embeddings, persist_directory=PERSIST_DIRECTORY)
        vectorstore.persist()
        logger.warning(f"Created new ChromaDB at {PERSIST_DIRECTORY}. Previous data may be lost.")

    _create_rag_chain()
    logger.info("RAG system initialized.")

def _create_rag_chain():
    global retrieval_chain, llm, vectorstore

    if llm is None or vectorstore is None:
        logger.error("Cannot create RAG chain: LLM or Vectorstore not initialized. RAG functionality will be limited.")
        retrieval_chain = None
        return

    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a helpful assistant. Answer the user's questions based on the provided context. If you don't know the answer, just say that you don't know, don't try to make up an answer. Provide sources for your answers, referencing the original filename, chunk index, and document ID."),
        ("placeholder", "{chat_history}"),
        ("human", "{input}"),
    ])

    document_chain = create_stuff_documents_chain(llm, prompt)
    retriever = vectorstore.as_retriever()
    retrieval_chain = create_retrieval_chain(retriever, document_chain)
    logger.info("RAG retrieval chain created.")

# --- API Endpoints ---

@app.route('/')
def index():
    return "Local RAG System Backend is running!"

@app.route('/upload_document', methods=['POST'])
def upload_document():
    if 'file' not in request.files:
        return jsonify({"error": "No file part", "success": False}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file", "success": False}), 400
    if not allowed_file(file.filename):
        return jsonify({"error": "Unsupported file type", "success": False}), 400
    if file:
        original_filename = secure_filename(file.filename)
        document_id = str(uuid.uuid4())
        file_extension = os.path.splitext(original_filename)[1].lower()
        filename_on_disk = f"{document_id}{file_extension}"
        filepath = os.path.join(UPLOAD_FOLDER, filename_on_disk)
        file.save(filepath)

        try:
            elements = partition(filename=filepath)
            text_splitter = RecursiveCharacterTextSplitter(chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP)
            langchain_docs = []
            for i, element in enumerate(elements):
                if element.text.strip():
                    sub_chunks = text_splitter.split_text(element.text)
                    for j, sub_chunk_text in enumerate(sub_chunks):
                        doc = LangchainDocument(
                            page_content=sub_chunk_text,
                            metadata={
                                "document_id": document_id,
                                "original_filename": original_filename,
                                "chunk_index": f"{i}-{j}",
                                "source_type": element.category
                            }
                        )
                        langchain_docs.append(doc)

            if not langchain_docs:
                os.remove(filepath)
                return jsonify({"error": "Could not extract content from document. Ensure it's a supported format (PDF, TXT, DOCX, etc.) and not empty.", "success": False}), 500

            global vectorstore
            if vectorstore is None:
                initialize_rag_system()

            if vectorstore:
                vectorstore.add_documents(langchain_docs)
                vectorstore.persist()
            else:
                os.remove(filepath)
                return jsonify({"error": "Vector store not initialized. Cannot index document.", "success": False}), 500

            documents_metadata[document_id] = {
                "original_filename": original_filename,
                "filename_on_disk": filename_on_disk,
                "filepath": filepath,
                "upload_date": datetime.datetime.now().isoformat(),
                "num_chunks": len(langchain_docs)
            }
            save_documents_metadata()
            _create_rag_chain()

            return jsonify({
                "message": "Document uploaded and processed successfully",
                "id": document_id,
                "original_filename": original_filename,
                "num_chunks": len(langchain_docs),
                "success": True
            }), 200
        except Exception as e:
            os.remove(filepath)
            logger.error(f"Error processing document: {e}")
            return jsonify({"error": f"Error processing document: {e}. Check backend console for details.", "success": False}), 500

@app.route('/documents', methods=['GET'])
def get_documents():
    search_query = request.args.get('query', '').lower()
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 5))

    all_docs = []
    for doc_id, meta in documents_metadata.items():
        doc_info = meta.copy()
        doc_info['id'] = doc_id
        all_docs.append(doc_info)

    if search_query:
        filtered_docs = [
            doc for doc in all_docs
            if search_query in doc['original_filename'].lower()
        ]
    else:
        filtered_docs = all_docs

    filtered_docs.sort(key=lambda x: x['upload_date'], reverse=True)
    total_documents = len(filtered_docs)
    start_index = (page - 1) * limit
    end_index = start_index + limit
    paginated_docs = filtered_docs[start_index:end_index]

    return jsonify({
        "documents": paginated_docs,
        "total_documents": total_documents,
        "page": page,
        "limit": limit,
        "success": True
    }), 200

@app.route('/delete_document/<document_id>', methods=['DELETE'])
def delete_document(document_id):
    if document_id not in documents_metadata:
        return jsonify({"error": "Document not found", "success": False}), 404

    doc_info = documents_metadata[document_id]
    filepath = doc_info['filepath']

    try:
        global vectorstore
        if vectorstore:
            vectorstore.delete(where={"document_id": document_id})
            vectorstore.persist()
            logger.info(f"Deleted chunks for document {document_id} from ChromaDB.")
        else:
            logger.warning("Vectorstore not initialized, cannot delete chunks from ChromaDB.")

        if os.path.exists(filepath):
            os.remove(filepath)
            logger.info(f"Deleted file: {filepath}")

        del documents_metadata[document_id]
        save_documents_metadata()
        _create_rag_chain()

        return jsonify({"message": "Document deleted successfully", "success": True}), 200
    except Exception as e:
        logger.error(f"Error deleting document {document_id}: {e}")
        return jsonify({"error": f"Failed to delete document: {str(e)}", "success": False}), 500

@app.route('/preview_extracted_text/<document_id>', methods=['GET'])
def preview_extracted_text(document_id):
    if document_id not in documents_metadata:
        return jsonify({"error": "Document not found", "success": False}), 404

    filepath = documents_metadata[document_id]['filepath']
    if not os.path.exists(filepath):
        return jsonify({"error": "Document file not found on server", "success": False}), 404

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read(PREVIEW_CHAR_LIMIT)
        return jsonify({"content": content, "success": True}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to read document content: {str(e)}", "success": False}), 500

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message_content = data.get('message')
    if not user_message_content:
        return jsonify({"error": "No message provided", "success": False}), 400

    chat_history_data.append({"role": "user", "content": user_message_content, "timestamp": datetime.datetime.now().isoformat()})
    save_chat_history()

    try:
        if retrieval_chain is None:
            return jsonify({"error": "RAG system not fully initialized. Please check backend logs.", "success": False}), 500

        messages = []
        for msg in chat_history_data:
            if msg["role"] == "user":
                messages.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "assistant" and not msg.get("isError", False):
                messages.append(AIMessage(content=msg["content"]))

        response = retrieval_chain.invoke({
            "input": user_message_content,
            "chat_history": messages[:-1]
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
            "timestamp": datetime.datetime.now().isoformat(),
            "success": True
        }

        chat_history_data.append({"role": "assistant", "content": assistant_response["response"], "timestamp": assistant_response["timestamp"], "sources": assistant_response["sources"]})
        save_chat_history()

        return jsonify(assistant_response), 200

    except Exception as e:
        logger.error(f"Error during chat: {e}")
        error_message = f"An error occurred while processing your request: {e}. Please check the backend console."
        chat_history_data.append({"role": "assistant", "content": error_message, "timestamp": datetime.datetime.now().isoformat(), "isError": True})
        save_chat_history()
        return jsonify({"error": error_message, "success": False}), 500

@app.route('/chat_history', methods=['GET'])
def get_chat_history():
    return jsonify({"history": chat_history_data, "success": True}), 200

@app.route('/clear_chat_history', methods=['POST'])
def clear_chat_history():
    global chat_history_data
    chat_history_data = []
    save_chat_history()
    return jsonify({"message": "Chat history cleared", "success": True}), 200

@app.route('/llm_settings', methods=['GET'])
def get_llm_settings_api():
    return jsonify({
        "model": LLM_MODEL,
        "temperature": LLM_TEMPERATURE,
        "top_k": LLM_TOP_K,
        "top_p": LLM_TOP_P,
        "success": True
    }), 200

@app.route('/llm_settings', methods=['POST'])
def update_llm_settings_api():
    global LLM_MODEL, LLM_TEMPERATURE, LLM_TOP_K, LLM_TOP_P, llm

    data = request.json
    new_model = data.get('model', LLM_MODEL)
    new_temperature = float(data.get('temperature', LLM_TEMPERATURE))
    new_top_k = int(data.get('top_k', LLM_TOP_K))
    new_top_p = float(data.get('top_p', LLM_TOP_P))

    if not (0 <= new_temperature <= 2):
        return jsonify({"error": "Temperature must be between 0 and 2", "success": False}), 400
    if not (0 <= new_top_k <= 1000):
        return jsonify({"error": "Top K must be between 0 and 1000", "success": False}), 400
    if not (0 <= new_top_p <= 1):
        return jsonify({"error": "Top P must be between 0 and 1", "success": False}), 400

    if (new_model != LLM_MODEL or
        new_temperature != LLM_TEMPERATURE or
        new_top_k != LLM_TOP_K or
        new_top_p != LLM_TOP_P):

        LLM_MODEL = new_model
        LLM_TEMPERATURE = new_temperature
        LLM_TOP_K = new_top_k
        LLM_TOP_P = new_top_p

        try:
            llm = Ollama(
                model=LLM_MODEL,
                temperature=LLM_TEMPERATURE,
                top_k=LLM_TOP_K,
                top_p=LLM_TOP_P,
                base_url=os.getenv("OLLAMA_HOST", "http://localhost:11434")
            )
            _create_rag_chain()
            save_llm_settings()
            logger.info(f"LLM settings updated: Model={LLM_MODEL}, Temp={LLM_TEMPERATURE}, TopK={LLM_TOP_K}, TopP={LLM_TOP_P}")
            return jsonify({
                "message": "LLM settings updated successfully",
                "current_settings": {
                    "model": LLM_MODEL,
                    "temperature": LLM_TEMPERATURE,
                    "top_k": LLM_TOP_K,
                    "top_p": LLM_TOP_P
                },
                "success": True
            }), 200
        except Exception as e:
            logger.error(f"Error re-initializing LLM with new settings: {e}")
            return jsonify({"error": f"Failed to update LLM settings: {str(e)}. Ensure model is available.", "success": False}), 500
    else:
        return jsonify({"message": "No changes to LLM settings", "success": True}), 200

@app.route('/ollama_models', methods=['GET'])
def get_ollama_models():
    """Fetches a list of available Ollama models using direct API call."""
    try:
        ollama_api_url = os.getenv("OLLAMA_HOST", "http://localhost:11434") + "/api/tags"
        response = requests.get(ollama_api_url)
        response.raise_for_status()
        models_data = response.json()
        model_names = [m['name'] for m in models_data.get('models', [])]
        return jsonify({"models": model_names, "success": True}), 200
    except requests.exceptions.ConnectionError:
        return jsonify({"error": "Could not connect to Ollama. Is it running?", "success": False}), 500
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Error fetching Ollama models: {str(e)}", "success": False}), 500
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}", "success": False}), 500

# Run initialization when the app starts
if __name__ == '__main__':
    initialize_rag_system()