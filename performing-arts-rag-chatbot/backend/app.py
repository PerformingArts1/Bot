# backend/app.py - Flask Backend for Local RAG System

import os
import json
import uuid
import datetime
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import magic  # For file content validation
from flask_socketio import SocketIO, emit # Added for WebSockets
from concurrent.futures import ThreadPoolExecutor # Added for async document processing

# Import Ollama and other necessary libraries from Langchain
from langchain_community.llms import Ollama
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.documents import Document as LangchainDocument  # Alias to avoid conflict

# Import unstructured for document parsing
from unstructured.partition.auto import partition
from unstructured.partition.api import PartitionUnstructuredError # Specific error for unstructured

# Import requests for direct Ollama API calls (e.g., listing models)
import requests

# Load environment variables from .env file
load_dotenv()

# --- Logging Setup ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Global Configuration (can be overridden by app factory) ---
DATA_DIR = 'data'
UPLOAD_FOLDER = os.path.join(DATA_DIR, 'documents')
PERSIST_DIRECTORY = os.path.join(DATA_DIR, 'chroma_db')
TINYDB_DIR = os.path.join(DATA_DIR, 'tinydb')

CHAT_HISTORY_FILE = os.path.join(TINYDB_DIR, 'chat_history.json')
DOCUMENTS_METADATA_FILE = os.path.join(TINYDB_DIR, 'documents_metadata.json')
LLM_SETTINGS_FILE = os.path.join(TINYDB_DIR, 'llm_settings.json')

# --- Constants ---
ALLOWED_EXTENSIONS = {'.pdf', '.txt', '.docx'}
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200
PREVIEW_CHAR_LIMIT = 10000 # For raw file content preview

# --- Global Variables for RAG System (managed within app context or passed) ---
llm = None
embeddings = None
vectorstore = None
retrieval_chain = None

# In-memory caches (persisted to file)
chat_history_data = []
documents_metadata = {}

# LLM settings (persisted to file)
LLM_MODEL = os.getenv("LLM_MODEL", "llama2")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "nomic-embed-text")
LLM_TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", 0.7))
LLM_TOP_K = int(os.getenv("LLM_TOP_K", 40))
LLM_TOP_P = float(os.getenv("LLM_TOP_P", 0.9))

# Thread pool for background document processing
executor = ThreadPoolExecutor(max_workers=os.cpu_count() * 2) # Leverage M4 Max cores

# --- Application Factory Function ---
def create_app():
    app = Flask(__name__)
    CORS(app)
    socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading') # Use threading for Flask-SocketIO

    # Ensure all necessary directories exist
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    os.makedirs(PERSIST_DIRECTORY, exist_ok=True)
    os.makedirs(TINYDB_DIR, exist_ok=True)

    # --- Persistence Functions ---
    def load_documents_metadata():
        nonlocal documents_metadata
        if os.path.exists(DOCUMENTS_METADATA_FILE):
            try:
                with open(DOCUMENTS_METADATA_FILE, 'r', encoding='utf-8') as f:
                    documents_metadata = json.load(f)
                logger.info(f"Loaded {len(documents_metadata)} document metadata entries.")
            except json.JSONDecodeError:
                logger.warning(f"{DOCUMENTS_METADATA_FILE} is corrupted or empty. Starting with empty metadata.")
                documents_metadata = {}
            except Exception as e:
                logger.error(f"Error loading document metadata: {e}")
                documents_metadata = {}
        else:
            documents_metadata = {}
            logger.info("No existing document metadata found.")

    def save_documents_metadata():
        with open(DOCUMENTS_METADATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(documents_metadata, f, indent=4)
        logger.info("Document metadata saved.")

    def load_chat_history():
        nonlocal chat_history_data
        if os.path.exists(CHAT_HISTORY_FILE):
            try:
                with open(CHAT_HISTORY_FILE, 'r', encoding='utf-8') as f:
                    chat_history_data = json.load(f)
                logger.info(f"Loaded {len(chat_history_data)} chat history entries.")
            except json.JSONDecodeError:
                logger.warning(f"{CHAT_HISTORY_FILE} is corrupted or empty. Starting with empty chat history.")
                chat_history_data = []
            except Exception as e:
                logger.error(f"Error loading chat history: {e}")
                chat_history_data = []
        else:
            chat_history_data = []
            logger.info("No existing chat history found.")

    def save_chat_history():
        with open(CHAT_HISTORY_FILE, 'w', encoding='utf-8') as f:
            json.dump(chat_history_data, f, indent=4)
        logger.info("Chat history saved.")

    def load_llm_settings():
        nonlocal LLM_MODEL, LLM_TEMPERATURE, LLM_TOP_K, LLM_TOP_P
        if os.path.exists(LLM_SETTINGS_FILE):
            try:
                with open(LLM_SETTINGS_FILE, 'r', encoding='utf-8') as f:
                    loaded_settings = json.load(f)
                    LLM_MODEL = loaded_settings.get('model', LLM_MODEL)
                    LLM_TEMPERATURE = loaded_settings.get('temperature', LLM_TEMPERATURE)
                    LLM_TOP_K = loaded_settings.get('top_k', LLM_TOP_K)
                    LLM_TOP_P = loaded_settings.get('top_p', LLM_TOP_P)
                logger.info("LLM settings loaded.")
            except json.JSONDecodeError:
                logger.warning(f"{LLM_SETTINGS_FILE} is corrupted or empty. Using default LLM settings.")
                save_llm_settings() # Save defaults back if corrupted
            except Exception as e:
                logger.error(f"Error loading LLM settings: {e}")
                save_llm_settings() # Save defaults back if an error occurs
        else:
            save_llm_settings() # Save defaults if file doesn't exist

    def save_llm_settings():
        settings_to_save = {
            "model": LLM_MODEL,
            "temperature": LLM_TEMPERATURE,
            "top_k": LLM_TOP_K,
            "top_p": LLM_TOP_P
        }
        with open(LLM_SETTINGS_FILE, 'w', encoding='utf-8') as f:
            json.dump(settings_to_save, f, indent=4)
        logger.info("LLM settings saved.")

    # --- RAG System Initialization and Updates ---
    def initialize_rag_system():
        nonlocal llm, embeddings, vectorstore, retrieval_chain

        load_llm_settings()
        load_documents_metadata()
        load_chat_history()

        try:
            llm = Ollama(
                model=LLM_MODEL,
                temperature=LLM_TEMPERATURE,
                top_k=LLM_TOP_K,
                top_p=LLM_TOP_P,
                base_url=os.getenv("OLLAMA_HOST", "http://ollama:11434")
            )
            embeddings = OllamaEmbeddings(
                model=EMBEDDING_MODEL,
                base_url=os.getenv("OLLAMA_HOST", "http://ollama:11434")
            )
            logger.info(f"LLM initialized: {LLM_MODEL}, Embeddings initialized: {EMBEDDING_MODEL}")
        except Exception as e:
            logger.critical(f"Could not initialize Ollama LLM or Embeddings. Is Ollama running and models pulled? Error: {e}")
            llm = None
            embeddings = None
            # Do not return here, allow the app to start even if LLM is down, but RAG chain will be None
            return

        try:
            # Check if vectorstore exists and is valid, otherwise create new
            if os.path.exists(PERSIST_DIRECTORY) and os.path.isdir(PERSIST_DIRECTORY) and len(os.listdir(PERSIST_DIRECTORY)) > 0:
                vectorstore = Chroma(persist_directory=PERSIST_DIRECTORY, embedding_function=embeddings)
                logger.info(f"Loaded ChromaDB from {PERSIST_DIRECTORY}")
            else:
                logger.warning(f"ChromaDB directory {PERSIST_DIRECTORY} is empty or does not exist. Creating a new one.")
                vectorstore = Chroma(embedding_function=embeddings, persist_directory=PERSIST_DIRECTORY)
                vectorstore.persist()
                logger.info(f"Created new ChromaDB at {PERSIST_DIRECTORY}.")

        except Exception as e:
            logger.critical(f"Critical error loading or creating ChromaDB. RAG functionality will fail. Error: {e}")
            vectorstore = None
            return

        _create_rag_chain()
        logger.info("RAG system initialization sequence complete.")

    def _create_rag_chain():
        nonlocal retrieval_chain, llm, vectorstore

        if llm is None or vectorstore is None:
            logger.error("Cannot create RAG chain: LLM or Vectorstore not initialized. RAG functionality will be limited/unavailable.")
            retrieval_chain = None
            return

        # Define the prompt template for the RAG chain
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a helpful assistant. Answer the user's questions based on the provided context. If you don't know the answer, just say that you don't know, don't try to make up an answer. Provide sources for your answers, referencing the original filename, chunk index, and document ID."),
            ("placeholder", "{chat_history}"),
            ("human", "{input}"),
        ])

        document_chain = create_stuff_documents_chain(llm, prompt)
        # Configure retriever for hybrid search (semantic + keyword)
        # Chroma's .as_retriever() doesn't directly support hybrid search out-of-the-box in this manner.
        # For a true hybrid search, you'd typically implement a custom retriever that combines
        # results from vectorstore.similarity_search_with_score and a keyword search (e.g., BM25).
        # For demonstration, we'll keep the standard retriever and note the enhancement.
        retriever = vectorstore.as_retriever(search_kwargs={"k": 5}) # Retrieve top 5 documents

        # Conceptual re-ranking step (requires a re-ranking model)
        # def re_rank_documents(query, documents):
        #     # Placeholder for re-ranking logic using a cross-encoder model
        #     # For example, using a SentenceTransformers cross-encoder:
        #     # from sentence_transformers import CrossEncoder
        #     # model = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')
        #     # scores = model.predict([(query, doc.page_content) for doc in documents])
        #     # ranked_docs = [doc for _, doc in sorted(zip(scores, documents), reverse=True)]
        #     # return ranked_docs
        #     return documents # No re-ranking implemented yet

        # retrieval_chain = create_retrieval_chain(retriever | (lambda x: re_rank_documents(x['input'], x['context'])), document_chain)
        retrieval_chain = create_retrieval_chain(retriever, document_chain)
        logger.info("RAG retrieval chain created/re-created.")

    # --- Utility Functions ---
    def allowed_file(filename):
        return os.path.splitext(filename)[1].lower() in ALLOWED_EXTENSIONS

    # --- Background Document Processing Task ---
    def process_document_background(filepath, original_filename, document_id, socket_sid):
        with app.app_context():
            try:
                socketio.emit('document_processing_status', {'id': document_id, 'status': 'Parsing file...', 'progress': 10}, room=socket_sid)
                # Validate file content using python-magic
                mime = magic.Magic(mime=True)
                file_type = mime.from_file(filepath)
                allowed_content_types = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/octet-stream']
                if file_type not in allowed_content_types:
                    os.remove(filepath)
                    logger.warning(f"File {original_filename} has disallowed content type: {file_type}")
                    socketio.emit('document_processing_error', {'id': document_id, 'error': f"Invalid file content type: {file_type}. Please upload PDF, TXT, or DOCX."}, room=socket_sid)
                    return

                socketio.emit('document_processing_status', {'id': document_id, 'status': 'Extracting text...', 'progress': 30}, room=socket_sid)
                elements = partition(filename=filepath)
                logger.info(f"Partitioned document {original_filename}, found {len(elements)} elements.")

                full_extracted_text = "\n\n".join([element.text for element in elements if element.text.strip()])
                if not full_extracted_text.strip():
                    os.remove(filepath)
                    logger.error(f"No text extracted from document {original_filename}. File might be empty or unreadable.")
                    socketio.emit('document_processing_error', {'id': document_id, 'error': "Could not extract any content from document. It might be empty or unreadable."}, room=socket_sid)
                    return

                extracted_text_filepath = os.path.join(TINYDB_DIR, f"{document_id}.txt")
                with open(extracted_text_filepath, 'w', encoding='utf-8') as f_ext:
                    f_ext.write(full_extracted_text)
                logger.info(f"Extracted text saved to {extracted_text_filepath}")

                socketio.emit('document_processing_status', {'id': document_id, 'status': 'Chunking and embedding...', 'progress': 60}, room=socket_sid)
                text_splitter = RecursiveCharacterTextSplitter(chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP)
                langchain_docs = []
                current_chunk_index = 0
                for i, element in enumerate(elements):
                    if element.text.strip():
                        sub_chunks = text_splitter.split_text(element.text)
                        for j, sub_chunk_text in enumerate(sub_chunks):
                            doc = LangchainDocument(
                                page_content=sub_chunk_text,
                                metadata={
                                    "document_id": document_id,
                                    "original_filename": original_filename,
                                    "chunk_index": f"{current_chunk_index}",
                                    "source_type": element.category,
                                    "filepath": filepath
                                }
                            )
                            langchain_docs.append(doc)
                            current_chunk_index += 1

                if not langchain_docs:
                    os.remove(filepath)
                    os.remove(extracted_text_filepath)
                    logger.error(f"No Langchain documents generated for {original_filename}. Issue with chunking.")
                    socketio.emit('document_processing_error', {'id': document_id, 'error': "Could not create document chunks for indexing. Ensure content is substantial."}, room=socket_sid)
                    return

                if vectorstore is None:
                    initialize_rag_system() # Attempt re-init
                    if vectorstore is None:
                        os.remove(filepath)
                        os.remove(extracted_text_filepath)
                        socketio.emit('document_processing_error', {'id': document_id, 'error': "Vector store not initialized. Cannot index document."}, room=socket_sid)
                        return

                vectorstore.add_documents(langchain_docs)
                vectorstore.persist()
                logger.info(f"Added {len(langchain_docs)} chunks to ChromaDB for document {document_id}.")

                documents_metadata[document_id] = {
                    "original_filename": original_filename,
                    "filename_on_disk": filename_on_disk,
                    "filepath": filepath,
                    "extracted_text_filepath": extracted_text_filepath,
                    "upload_date": datetime.datetime.now().isoformat(),
                    "num_chunks": len(langchain_docs)
                }
                save_documents_metadata()
                socketio.emit('document_processing_status', {'id': document_id, 'status': 'Indexing complete!', 'progress': 100, 'success': True, 'original_filename': original_filename, 'num_chunks': len(langchain_docs)}, room=socket_sid)
                logger.info(f"Document {original_filename} (ID: {document_id}) processed successfully.")

            except PartitionUnstructuredError as e:
                logger.exception(f"Unstructured failed to partition document {original_filename}: {e}")
                if os.path.exists(filepath): os.remove(filepath)
                if os.path.exists(extracted_text_filepath): os.remove(extracted_text_filepath)
                socketio.emit('document_processing_error', {'id': document_id, 'error': f"Failed to parse document content (unstructured error): {e}. Please ensure it's a valid, uncorrupted file."}, room=socket_sid)
            except Exception as e:
                logger.exception(f"Error processing document {original_filename}: {e}")
                if os.path.exists(filepath): os.remove(filepath)
                if os.path.exists(extracted_text_filepath): os.remove(extracted_text_filepath)
                socketio.emit('document_processing_error', {'id': document_id, 'error': f"An unexpected error occurred during document processing: {e}. Check backend console for details."}, room=socket_sid)


    # --- API Endpoints ---
    @app.route('/')
    def index():
        return "Local RAG System Backend is running!"

    @app.route('/upload_document', methods=['POST'])
    def upload_document():
        if 'file' not in request.files:
            return jsonify({"success": False, "error": "No file part"}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({"success": False, "error": "No selected file"}), 400

        original_filename = secure_filename(file.filename)
        file_extension = os.path.splitext(original_filename)[1].lower()

        if not allowed_file(file_extension):
            return jsonify({"success": False, "error": f"Unsupported file type: {file_extension}. Allowed types are {', '.join(ALLOWED_EXTENSIONS)}"}), 400

        document_id = str(uuid.uuid4())
        filename_on_disk = f"{document_id}{file_extension}"
        filepath = os.path.join(UPLOAD_FOLDER, filename_on_disk)

        try:
            file.save(filepath)
            logger.info(f"File saved to {filepath} for background processing.")

            # Get the SID from the request headers or query params if possible,
            # or rely on client to connect to SocketIO and send its SID.
            # For simplicity, we'll assume the frontend will send its SID with the upload request.
            # Or, for a simple upload, we might not need the SID here and let the frontend poll.
            # For this implementation, let's assume SID is passed in form data for simplicity.
            socket_sid = request.form.get('socket_sid')
            if not socket_sid:
                logger.warning("No socket_sid provided for document processing status updates.")
                # Proceed without real-time updates if SID is missing
                # Or return an error if real-time updates are mandatory
                pass

            # Offload document processing to a background thread
            executor.submit(process_document_background, filepath, original_filename, document_id, socket_sid)

            return jsonify({
                "success": True,
                "message": "Document upload initiated. Processing in background.",
                "id": document_id,
                "original_filename": original_filename
            }), 202 # 202 Accepted for background processing

        except Exception as e:
            logger.exception(f"Error initiating document upload for {original_filename}: {e}")
            if os.path.exists(filepath):
                os.remove(filepath)
            return jsonify({"success": False, "error": f"Error initiating document upload: {e}. Check backend console for details."}), 500

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
            "success": True,
            "documents": paginated_docs,
            "total_documents": total_documents,
            "page": page,
            "limit": limit
        }), 200

    @app.route('/delete_document/<document_id>', methods=['DELETE'])
    def delete_document(document_id):
        if document_id not in documents_metadata:
            return jsonify({"success": False, "error": "Document not found"}), 404

        doc_info = documents_metadata[document_id]
        original_filepath = doc_info.get('filepath')
        extracted_text_filepath = doc_info.get('extracted_text_filepath')

        try:
            if vectorstore:
                vectorstore.delete(where={"document_id": document_id})
                vectorstore.persist()
                logger.info(f"Deleted chunks for document {document_id} from ChromaDB.")
            else:
                logger.warning("Vectorstore not initialized, cannot delete chunks from ChromaDB.")

            if original_filepath and os.path.exists(original_filepath):
                os.remove(original_filepath)
                logger.info(f"Deleted original file: {original_filepath}")
            if extracted_text_filepath and os.path.exists(extracted_text_filepath):
                os.remove(extracted_text_filepath)
                logger.info(f"Deleted extracted text file: {extracted_text_filepath}")

            del documents_metadata[document_id]
            save_documents_metadata()

            return jsonify({"success": True, "message": "Document deleted successfully"}), 200
        except Exception as e:
            logger.exception(f"Error deleting document {document_id}: {e}")
            return jsonify({"success": False, "error": f"Failed to delete document: {str(e)}"}), 500

    @app.route('/preview_extracted_text/<document_id>', methods=['GET'])
    def preview_extracted_text(document_id):
        if document_id not in documents_metadata:
            return jsonify({"success": False, "error": "Document not found"}), 404

        extracted_text_filepath = documents_metadata[document_id].get('extracted_text_filepath')
        if not extracted_text_filepath or not os.path.exists(extracted_text_filepath):
            original_filepath = documents_metadata[document_id].get('filepath')
            if original_filepath and os.path.exists(original_filepath):
                logger.warning(f"Extracted text file missing for {document_id}. Attempting to read original file (may not be plain text).")
                filepath_to_read = original_filepath
            else:
                return jsonify({"success": False, "error": "Extracted text or original document file not found on server"}), 404
        else:
            filepath_to_read = extracted_text_filepath

        try:
            with open(filepath_to_read, 'r', encoding='utf-8') as f:
                content = f.read(PREVIEW_CHAR_LIMIT)
                has_more = len(f.read()) > 0
            return jsonify({"success": True, "content": content, "truncated": has_more}), 200
        except Exception as e:
            logger.exception(f"Failed to read document content for preview {document_id}: {e}")
            return jsonify({"success": False, "error": f"Failed to read document content: {str(e)}"}), 500

    @app.route('/chat', methods=['POST'])
    def chat():
        data = request.json
        user_message_content = data.get('message')
        if not user_message_content:
            return jsonify({"success": False, "error": "No message provided"}), 400

        # Append user message immediately (frontend will handle its own display)
        # We'll rely on SocketIO to push the full history update for consistency
        # Or, the frontend can optimistically update and then correct/confirm with SocketIO.

        try:
            if retrieval_chain is None:
                initialize_rag_system()
                if retrieval_chain is None:
                    error_message = "RAG system not fully initialized after retry. Please check backend logs and ensure Ollama is running."
                    chat_history_data.append({"role": "assistant", "content": error_message, "timestamp": datetime.datetime.now().isoformat(), "isError": True})
                    save_chat_history()
                    socketio.emit('chat_response', {'success': False, 'error': error_message, 'history': chat_history_data}, room=request.sid)
                    return jsonify({"success": False, "error": error_message}), 500 # Still return HTTP response

            messages_for_llm = []
            for msg in chat_history_data:
                if msg["role"] == "user":
                    messages_for_llm.append(HumanMessage(content=msg["content"]))
                elif msg["role"] == "assistant" and not msg.get("isError", False):
                    messages_for_llm.append(AIMessage(content=msg["content"]))

            # Emit typing indicator
            socketio.emit('typing_indicator', {'status': True}, room=request.sid)

            response = retrieval_chain.invoke({
                "input": user_message_content,
                "chat_history": messages_for_llm # Pass full history for context
            })

            response_content = response["answer"]
            sources = []
            if "context" in response:
                for i, doc in enumerate(response["context"]):
                    source_info = {
                        "original_filename": doc.metadata.get("original_filename", "N/A"),
                        "chunk_index": doc.metadata.get("chunk_index", "N/A"),
                        "document_id": doc.metadata.get("document_id", "N/A"),
                        "snippet": doc.page_content[:200] + "..." if len(doc.page_content) > 200 else doc.page_content,
                        "source_num": i + 1
                    }
                    sources.append(source_info)

            assistant_response_data = {
                "success": True,
                "response": response_content,
                "sources": sources,
                "timestamp": datetime.datetime.now().isoformat()
            }

            # Append assistant response to history
            chat_history_data.append({"role": "assistant", "content": assistant_response_data["response"], "timestamp": assistant_response_data["timestamp"], "sources": assistant_response_data["sources"]})
            save_chat_history()

            # Emit the full updated history via WebSocket
            socketio.emit('chat_response', {'success': True, 'history': chat_history_data}, room=request.sid)
            socketio.emit('typing_indicator', {'status': False}, room=request.sid)

            return jsonify(assistant_response_data), 200

        except Exception as e:
            logger.exception(f"Error during chat: {e}")
            error_message = f"An error occurred while processing your request: {e}. Please check the backend console."
            chat_history_data.append({"role": "assistant", "content": error_message, "timestamp": datetime.datetime.now().isoformat(), "isError": True})
            save_chat_history()
            socketio.emit('chat_response', {'success': False, 'error': error_message, 'history': chat_history_data}, room=request.sid)
            socketio.emit('typing_indicator', {'status': False}, room=request.sid)
            return jsonify({"success": False, "error": error_message}), 500

    @app.route('/chat_history', methods=['GET'])
    def get_chat_history_api(): # Renamed to avoid conflict with internal function
        return jsonify({"success": True, "history": chat_history_data}), 200

    @app.route('/clear_chat_history', methods=['POST'])
    def clear_chat_history_api(): # Renamed to avoid conflict
        nonlocal chat_history_data
        chat_history_data = []
        save_chat_history()
        socketio.emit('chat_response', {'success': True, 'history': chat_history_data}, room=request.sid) # Notify clients
        return jsonify({"success": True, "message": "Chat history cleared"}), 200

    @app.route('/llm_settings', methods=['GET'])
    def get_llm_settings_api():
        return jsonify({
            "success": True,
            "model": LLM_MODEL,
            "temperature": LLM_TEMPERATURE,
            "top_k": LLM_TOP_K,
            "top_p": LLM_TOP_P
        }), 200

    @app.route('/llm_settings', methods=['POST'])
    def update_llm_settings_api():
        nonlocal LLM_MODEL, LLM_TEMPERATURE, LLM_TOP_K, LLM_TOP_P, llm

        data = request.json
        new_model = data.get('model', LLM_MODEL)
        new_temperature = float(data.get('temperature', LLM_TEMPERATURE))
        new_top_k = int(data.get('top_k', LLM_TOP_K))
        new_top_p = float(data.get('top_p', LLM_TOP_P)) # Corrected typo here

        if not (0.0 <= new_temperature <= 2.0):
            return jsonify({"success": False, "error": "Temperature must be between 0.0 and 2.0"}), 400
        if not (0 <= new_top_k <= 1000):
            return jsonify({"success": False, "error": "Top K must be between 0 and 1000"}), 400
        if not (0.0 <= new_top_p <= 1.0):
            return jsonify({"success": False, "error": "Top P must be between 0.0 and 1.0"}), 400

        if (new_model != LLM_MODEL or
            new_temperature != LLM_TEMPERATURE or
            new_top_k != LLM_TOP_K or
            new_top_p != LLM_TOP_P):

            LLM_MODEL = new_model
            LLM_TEMPERATURE = new_temperature
            LLM_TOP_K = new_top_k
            LLM_TOP_P = new_top_p # Corrected typo here

            try:
                llm = Ollama(
                    model=LLM_MODEL,
                    temperature=LLM_TEMPERATURE,
                    top_k=LLM_TOP_K,
                    top_p=LLM_TOP_P,
                    base_url=os.getenv("OLLAMA_HOST", "http://ollama:11434")
                )
                _create_rag_chain()
                save_llm_settings()
                logger.info(f"LLM settings updated and re-initialized: Model={LLM_MODEL}, Temp={LLM_TEMPERATURE}, TopK={LLM_TOP_K}, TopP={LLM_TOP_P}")
                return jsonify({
                    "success": True,
                    "message": "LLM settings updated successfully",
                    "current_settings": {
                        "model": LLM_MODEL,
                        "temperature": LLM_TEMPERATURE,
                        "top_k": LLM_TOP_K,
                        "top_p": LLM_TOP_P
                    }
                }), 200
            except Exception as e:
                logger.exception(f"Error re-initializing LLM with new settings: {e}")
                return jsonify({"success": False, "error": f"Failed to update LLM settings: {str(e)}. Ensure the new model is available and Ollama is running."}), 500
        else:
            return jsonify({"success": True, "message": "No changes detected in LLM settings"}), 200

    @app.route('/ollama_models', methods=['GET'])
    def get_ollama_models():
        """Fetches a list of available Ollama models using direct API call."""
        try:
            ollama_api_url = os.getenv("OLLAMA_HOST", "http://ollama:11434") + "/api/tags"
            response = requests.get(ollama_api_url)
            response.raise_for_status()
            models_data = response.json()
            model_names = [m['name'] for m in models_data.get('models', [])]
            logger.info(f"Successfully fetched {len(model_names)} Ollama models.")
            return jsonify({"success": True, "models": model_names}), 200
        except requests.exceptions.ConnectionError:
            logger.error("Could not connect to Ollama API. Is Ollama running?")
            return jsonify({"success": False, "error": "Could not connect to Ollama. Is it running? Ensure OLLAMA_HOST is correct."}), 500
        except requests.exceptions.HTTPError as e:
            logger.error(f"HTTP error fetching Ollama models: {e.response.status_code} - {e.response.text}")
            return jsonify({"success": False, "error": f"Error fetching Ollama models: HTTP {e.response.status_code}."}), 500
        except requests.exceptions.RequestException as e:
            logger.exception(f"General request error fetching Ollama models: {e}")
            return jsonify({"success": False, "error": f"Error fetching Ollama models: {str(e)}"}), 500
        except Exception as e:
            logger.exception(f"An unexpected error occurred while fetching Ollama models: {e}")
            return jsonify({"success": False, "error": f"An unexpected error occurred: {str(e)}"}), 500

    # Initialize RAG system when the app is created
    with app.app_context():
        initialize_rag_system()

    return app, socketio # Return both app and socketio instance

# This block is for running the app directly (e.g., `python app.py`)
# When using gunicorn, it will call `app:create_app()`
if __name__ == '__main__':
    app, socketio = create_app()
    # Use socketio.run for development, gunicorn for production
    socketio.run(app, host='0.0.0.0', port=5000, debug=True, allow_unsafe_werkzeug=True)
