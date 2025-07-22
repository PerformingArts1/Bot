# backend/app.py - Flask Backend for Local RAG System

import os
import json
import uuid
import datetime
import logging
from flask import Flask, request, jsonify, send_file # Added send_file for audio
from flask_cors import CORS
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import magic  # For file content validation
from flask_socketio import SocketIO, emit # Added for WebSockets
from concurrent.futures import ThreadPoolExecutor # Added for async document processing
import shutil # Added for file operations (e.g., copying for GDrive ingest)
import glob # Added for file pattern matching (e.g., for GDrive ingest)
import io # For handling audio data in memory

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

# Import requests for direct Ollama API calls (e.g., listing models, Whisper, Coqui)
import requests

# Import BM25 for hybrid search
from rank_bm25 import BM25Okapi

# Import for re-ranking (conceptual)
# Requires 'sentence-transformers' to be installed
# from sentence_transformers import CrossEncoder # Uncomment if you fully implement re-ranking
# import torch # Uncomment if you fully implement re-ranking and want MPS device

# Imports for Langfuse
from langfuse import Langfuse # New import
from langfuse.model import CreateTrace, CreateSpan, CreateGeneration # New import

# Imports for Neo4j
from neo4j import GraphDatabase # New import

# Load environment variables from .env file
load_dotenv()

# --- Logging Setup ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Global Configuration (can be overridden by app factory) ---
DATA_DIR = 'data'
UPLOAD_FOLDER = os.path.join(DATA_DIR, 'documents') # For text docs and audio files
PERSIST_DIRECTORY = os.path.join(DATA_DIR, 'chroma_db')
TINYDB_DIR = os.path.join(DATA_DIR, 'tinydb')
AUDIO_OUTPUT_DIR = os.path.join(DATA_DIR, 'audio_output') # For generated podcast audio

CHAT_HISTORY_FILE = os.path.join(TINYDB_DIR, 'chat_history.json')
DOCUMENTS_METADATA_FILE = os.path.join(TINYDB_DIR, 'documents_metadata.json')
LLM_SETTINGS_FILE = os.path.join(TINYDB_DIR, 'llm_settings.json')

# Optional: Google Drive mount path for batch ingestion
GDRIVE_MOUNT_PATH = '/app/gdrive_docs' # This must match the path in docker-compose.yml

# --- Constants ---
ALLOWED_TEXT_EXTENSIONS = {'.pdf', '.txt', '.docx'}
ALLOWED_AUDIO_EXTENSIONS = {'.mp3', '.wav', '.flac', '.m4a'} # Common audio formats
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200
PREVIEW_CHAR_LIMIT = 10000 # For raw file content preview
TOP_K_VECTOR_SEARCH = 5 # Number of documents to retrieve from vector store
TOP_K_BM25_SEARCH = 5   # Number of documents to retrieve from BM25
TOP_K_HYBRID_COMBINED = 7 # Number of documents to pass to LLM after hybrid search
TOP_K_RE_RANKED = 5 # Number of documents to keep after re-ranking

# --- Global Variables for RAG System (managed within app context or passed) ---
llm = None
embeddings = None
vectorstore = None
retrieval_chain = None
bm25_retriever = None
all_document_chunks = [] # To store all chunks for BM25 indexing
re_ranker_model = None # Global for re-ranker model (conceptual)

# Langfuse client
langfuse_client = None # New global for Langfuse client

# Neo4j driver
neo4j_driver = None # New global for Neo4j driver

# Audio service hosts
WHISPER_ASR_HOST = os.getenv("WHISPER_ASR_HOST", "http://localhost:9000")
COQUI_TTS_HOST = os.getenv("COQUI_TTS_HOST", "http://localhost:5002")

# In-memory caches (persisted to file)
chat_history_data = []
documents_metadata = {} # This will now store metadata for both text docs and audio transcripts

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
    socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

    # Ensure all necessary directories exist
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    os.makedirs(PERSIST_DIRECTORY, exist_ok=True)
    os.makedirs(TINYDB_DIR, exist_ok=True)
    os.makedirs(AUDIO_OUTPUT_DIR, exist_ok=True) # New directory for generated audio

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

    # --- Re-ranking Function (Conceptual) ---
    def re_rank_documents(query: str, documents: list[LangchainDocument]) -> list[LangchainDocument]:
        """
        Re-ranks a list of documents based on their relevance to the query
        using a cross-encoder model.

        NOTE: This is a conceptual implementation. To make it fully functional:
        1. Ensure 'sentence-transformers' is installed (added to requirements.txt).
        2. Uncomment the 'CrossEncoder' and 'torch' imports at the top.
        3. The re-ranker model needs to be loaded once (e.g., in initialize_rag_system).
           Downloading models can be large, so consider how to manage this (e.g., Docker build arg).
        4. The 'device' parameter for CrossEncoder should ideally be 'mps' for Mac M-series GPU.
        """
        if not documents:
            return []

        # Example placeholder for re-ranking logic
        # if re_ranker_model:
        #     pairs = [(query, doc.page_content) for doc in documents]
        #     # Ensure model is on the correct device (e.g., 'mps' for Apple Silicon)
        #     device = 'mps' if torch.backends.mps.is_available() else 'cpu'
        #     scores = re_ranker_model.predict(pairs, convert_to_tensor=True, device=device).tolist()
        #     ranked_docs = [doc for score, doc in sorted(zip(scores, documents), reverse=True)]
        #     return ranked_docs[:TOP_K_RE_RANKED] # Return top K after re-ranking
        # else:
        #     logger.warning("Re-ranker model not initialized. Skipping re-ranking.")
        return documents # Return documents as is if re-ranker not active

    # --- Neo4j Graph Integration ---
    def initialize_neo4j_driver():
        nonlocal neo4j_driver
        uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
        username = os.getenv("NEO4J_USERNAME", "neo4j")
        password = os.getenv("NEO4J_PASSWORD", "password") # Default password for initial setup

        try:
            neo4j_driver = GraphDatabase.driver(uri, auth=(username, password))
            neo4j_driver.verify_connectivity()
            logger.info("Neo4j driver initialized and connected.")
        except Exception as e:
            logger.error(f"Could not connect to Neo4j database: {e}")
            neo4j_driver = None

    def extract_and_store_graph_data(document_id: str, original_filename: str, text_content: str, doc_type: str = "text", trace_id: str = None, parent_span_id: str = None):
        """
        Uses the LLM to extract entities and relationships from text_content and stores them in Neo4j.
        """
        if not neo4j_driver:
            logger.warning("Neo4j driver not initialized. Skipping graph data extraction and storage.")
            return

        graph_extraction_span = None
        if langfuse_client and trace_id:
            graph_extraction_span = langfuse_client.span(
                CreateSpan(
                    trace_id=trace_id,
                    parent_observation_id=parent_span_id,
                    name="neo4j-graph-extraction",
                    input={"document_id": document_id, "original_filename": original_filename, "doc_type": doc_type, "text_length": len(text_content)}
                )
            )

        try:
            # Step 1: Create or Merge the Document/AudioTranscript node
            node_label = "Document" if doc_type == "text" else "AudioTranscript"
            with neo4j_driver.session() as session:
                session.run(
                    f"""
                    MERGE (n:{node_label} {{id: $document_id}})
                    SET n.filename = $original_filename,
                        n.uploadDate = $upload_date,
                        n.type = $doc_type
                    """,
                    document_id=document_id,
                    original_filename=original_filename,
                    upload_date=datetime.datetime.now().isoformat(),
                    doc_type=doc_type
                )
                logger.info(f"Created/Merged {node_label} node for {original_filename} in Neo4j.")

            # Step 2: Use LLM to extract entities and relationships
            extraction_prompt = ChatPromptTemplate.from_messages([
                ("system", """You are a highly skilled information extraction AI. Your task is to extract entities and their relationships from the provided text.
                Identify the following entity types: Person, Organization, Location, Event, Concept, Product.
                Identify relationships between these entities.
                Output the extracted information as a JSON array of objects. Each object should represent either an entity or a relationship.

                For entities:
                {{ "type": "entity", "label": "EntityType", "name": "Entity Name", "properties": {{ "key": "value" }} }}

                For relationships:
                {{ "type": "relationship", "source": "Source Entity Name", "target": "Target Entity Name", "relationship_type": "RELATIONSHIP_TYPE", "properties": {{ "key": "value" }} }}

                Ensure entity names are consistent for relationships. If an entity is mentioned multiple times, use the same name.
                Prioritize factual and clearly stated relationships.
                Example:
                {{
                    "entities": [
                        {{ "label": "Person", "name": "Alice" }},
                        {{ "label": "Organization", "name": "Acme Corp" }}
                    ],
                    "relationships": [
                        {{ "source": "Alice", "target": "Acme Corp", "type": "WORKS_AT" }}
                    ]
                }}
                """),
                ("human", f"Extract entities and relationships from the following text:\n\n{text_content}")
            ])

            # Langfuse generation for graph extraction LLM call
            graph_llm_gen_span = None
            if langfuse_client and graph_extraction_span:
                graph_llm_gen_span = langfuse_client.generation(
                    CreateGeneration(
                        trace_id=trace_id,
                        parent_observation_id=graph_extraction_span.id,
                        name="graph-extraction-llm-call",
                        model=LLM_MODEL,
                        input=extraction_prompt.format(text_content=text_content),
                        model_parameters={
                            "temperature": 0.1, # Keep extraction deterministic
                            "top_k": LLM_TOP_K,
                            "top_p": LLM_TOP_P
                        }
                    )
                )

            llm_response = llm.invoke(extraction_prompt.format(text_content=text_content))
            extracted_data = json.loads(llm_response.content) # Assuming LLM outputs valid JSON

            if graph_llm_gen_span:
                graph_llm_gen_span.end(output={"extracted_json": extracted_data})

            # Step 3: Store extracted entities and relationships in Neo4j
            with neo4j_driver.session() as session:
                for entity_data in extracted_data.get("entities", []):
                    label = entity_data.get("label", "UnknownEntity")
                    name = entity_data.get("name")
                    properties = entity_data.get("properties", {})
                    if name:
                        session.run(
                            f"MERGE (e:{label} {{name: $name}}) SET e += $properties",
                            name=name, properties=properties
                        )
                        # Link entity to the document it was extracted from
                        session.run(
                            f"""
                            MATCH (d:{node_label} {{id: $document_id}})
                            MATCH (e:{label} {{name: $name}})
                            MERGE (d)-[:MENTIONS]->(e)
                            """,
                            document_id=document_id, name=name
                        )
                logger.info(f"Stored {len(extracted_data.get('entities', []))} entities for {original_filename}.")

                for rel_data in extracted_data.get("relationships", []):
                    source_name = rel_data.get("source")
                    target_name = rel_data.get("target")
                    rel_type = rel_data.get("type", "RELATES_TO")
                    properties = rel_data.get("properties", {})
                    if source_name and target_name:
                        # Find source and target entities (assuming they were created)
                        # This part needs to be robust, potentially creating entities if they don't exist
                        session.run(
                            f"""
                            MERGE (s:Entity {{name: $source_name}})
                            MERGE (t:Entity {{name: $target_name}})
                            MERGE (s)-[r:{rel_type}]->(t)
                            SET r += $properties
                            """,
                            source_name=source_name, target_name=target_name, properties=properties
                        )
                logger.info(f"Stored {len(extracted_data.get('relationships', []))} relationships for {original_filename}.")

            if graph_extraction_span:
                graph_extraction_span.end(status="SUCCESS")

        except json.JSONDecodeError as e:
            logger.error(f"LLM output for graph extraction was not valid JSON for {original_filename}: {e}. Response: {llm_response.content}")
            if graph_extraction_span: graph_extraction_span.end(status="ERROR", status_message=f"LLM JSON decode error: {e}")
        except Exception as e:
            logger.error(f"Error storing graph data for {original_filename} in Neo4j: {e}")
            if graph_extraction_span: graph_extraction_span.end(status="ERROR", status_message=f"Neo4j storage error: {e}")


    # --- Langfuse Initialization ---
    def initialize_langfuse_client():
        nonlocal langfuse_client
        try:
            langfuse_client = Langfuse(
                public_key=os.getenv("LANGFUSE_PUBLIC_KEY"),
                secret_key=os.getenv("LANGFUSE_SECRET_KEY"),
                host=os.getenv("LANGFUSE_HOST")
            )
            logger.info("Langfuse client initialized.")
        except Exception as e:
            logger.error(f"Could not initialize Langfuse client: {e}. Tracing will be disabled.")
            langfuse_client = None

    # --- RAG System Initialization and Updates ---
    def initialize_rag_system():
        nonlocal llm, embeddings, vectorstore, retrieval_chain, bm25_retriever, all_document_chunks, re_ranker_model

        load_llm_settings()
        load_documents_metadata()
        load_chat_history()
        initialize_langfuse_client() # Initialize Langfuse
        initialize_neo4j_driver() # Initialize Neo4j

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
            return

        try:
            if os.path.exists(PERSIST_DIRECTORY) and os.path.isdir(PERSIST_DIRECTORY) and len(os.listdir(PERSIST_DIRECTORY)) > 0:
                vectorstore = Chroma(persist_directory=PERSIST_DIRECTORY, embedding_function=embeddings)
                logger.info(f"Loaded ChromaDB from {PERSIST_DIRECTORY}")
            else:
                logger.warning(f"ChromaDB directory {PERSIST_DIRECTORY} is empty or does not exist. Creating a new one.")
                vectorstore = Chroma(embedding_function=embeddings, persist_directory=PERSIST_DIRECTORY)
                vectorstore.persist()
                logger.info(f"Created new ChromaDB at {PERSIST_DIRECTORY}.")

            # Load all document chunks for BM25 indexing
            all_document_chunks = []
            if vectorstore:
                try:
                    all_chroma_docs = vectorstore._collection.get(ids=vectorstore._collection.get()['ids'], include=['documents', 'metadatas'])
                    for i, doc_content in enumerate(all_chroma_docs['documents']):
                        all_document_chunks.append(
                            LangchainDocument(
                                page_content=doc_content,
                                metadata=all_chroma_docs['metadatas'][i]
                            )
                        )
                    logger.info(f"Loaded {len(all_document_chunks)} chunks from ChromaDB for BM25 indexing.")
                    if all_document_chunks:
                        tokenized_corpus = [doc.page_content.split(" ") for doc in all_document_chunks]
                        bm25_retriever = BM25Okapi(tokenized_corpus)
                        logger.info("BM25 retriever initialized.")
                    else:
                        bm25_retriever = None
                        logger.info("No documents to initialize BM25 retriever.")
                except Exception as e:
                    logger.error(f"Error loading documents from Chroma for BM25: {e}")
                    bm25_retriever = None

            # Initialize re-ranker model (conceptual)
            # if torch.backends.mps.is_available():
            #     re_ranker_device = 'mps'
            #     logger.info("PyTorch MPS (Metal) backend available for re-ranker.")
            # else:
            #     re_ranker_device = 'cpu'
            #     logger.warning("PyTorch MPS (Metal) backend not available for re-ranker, using CPU.")
            # try:
            #     re_ranker_model = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2', device=re_ranker_device)
            #     logger.info("Re-ranker model initialized.")
            # except Exception as e:
            #     logger.error(f"Could not initialize re-ranker model: {e}. Re-ranking will be skipped.")
            #     re_ranker_model = None

        except Exception as e:
            logger.critical(f"Critical error loading or creating ChromaDB. RAG functionality will fail. Error: {e}")
            vectorstore = None
            bm25_retriever = None
            re_ranker_model = None
            return

        _create_rag_chain()
        logger.info("RAG system initialization sequence complete.")

    def _create_rag_chain():
        nonlocal retrieval_chain, llm, vectorstore, bm25_retriever

        if llm is None or vectorstore is None:
            logger.error("Cannot create RAG chain: LLM or Vectorstore not initialized. RAG functionality will be limited/unavailable.")
            retrieval_chain = None
            return

        # Define a custom retriever that combines vector and BM25 search
        class HybridRetriever:
            def __init__(self, vectorstore_retriever, bm25_retriever, all_chunks, k_vector, k_bm25, k_combined):
                self.vectorstore_retriever = vectorstore_retriever
                self.bm25_retriever = bm25_retriever
                self.all_chunks = all_chunks
                self.k_vector = k_vector
                self.k_bm25 = k_bm25
                self.k_combined = k_combined

            def get_relevant_documents(self, query):
                # Langfuse span for vector search
                vector_span = None
                if langfuse_client:
                    vector_span = langfuse_client.span(name="vector-search", input={"query": query, "k": self.k_vector})
                vector_docs = self.vectorstore_retriever.get_relevant_documents(query)
                vector_docs = vector_docs[:self.k_vector]
                if vector_span:
                    vector_span.end(output={"documents": [doc.metadata for doc in vector_docs]})

                # Langfuse span for BM25 search
                bm25_span = None
                if langfuse_client:
                    bm25_span = langfuse_client.span(name="bm25-search", input={"query": query, "k": self.k_bm25})
                bm25_docs = []
                if self.bm25_retriever and self.all_chunks:
                    tokenized_query = query.lower().split(" ")
                    doc_scores = self.bm25_retriever.get_scores(tokenized_query)
                    top_bm25_indices = sorted(range(len(doc_scores)), key=lambda i: doc_scores[i], reverse=True)[:self.k_bm25]
                    bm25_docs = [self.all_chunks[i] for i in top_bm25_indices]
                if bm25_span:
                    bm25_span.end(output={"documents": [doc.metadata for doc in bm25_docs]})

                # Combine and Deduplicate
                combined_docs = {}
                for doc in vector_docs + bm25_docs:
                    doc_id_chunk_index = f"{doc.metadata.get('document_id', '')}-{doc.metadata.get('chunk_index', '')}"
                    if doc_id_chunk_index and doc_id_chunk_index not in combined_docs:
                        combined_docs[doc_id_chunk_index] = doc

                final_docs = list(combined_docs.values())

                # Re-ranking step (if re_ranker_model is initialized)
                # Langfuse span for re-ranking
                rerank_span = None
                if langfuse_client:
                    rerank_span = langfuse_client.span(name="re-ranking", input={"query": query, "docs_before": len(final_docs)})
                final_docs = re_rank_documents(query, final_docs) # Call the re-ranking function
                if rerank_span:
                    rerank_span.end(output={"docs_after": len(final_docs)})

                return final_docs[:self.k_combined]

        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a helpful assistant. Answer the user's questions based on the provided context. If you don't know the answer, just say that you don't know, don't try to make up an answer. Provide sources for your answers, referencing the original filename, chunk index, and document ID."),
            ("placeholder", "{chat_history}"),
            ("human", "{input}"),
        ])

        document_chain = create_stuff_documents_chain(llm, prompt)
        vectorstore_retriever_instance = vectorstore.as_retriever(search_kwargs={"k": TOP_K_VECTOR_SEARCH})

        hybrid_retriever_instance = HybridRetriever(
            vectorstore_retriever_instance,
            bm25_retriever,
            all_document_chunks,
            TOP_K_VECTOR_SEARCH,
            TOP_K_BM25_SEARCH,
            TOP_K_HYBRID_COMBINED
        )

        retrieval_chain = create_retrieval_chain(hybrid_retriever_instance, document_chain)
        logger.info("RAG retrieval chain created/re-created with Hybrid Search and Re-ranking.")

    # --- Utility Functions ---
    def allowed_text_file(filename):
        return os.path.splitext(filename)[1].lower() in ALLOWED_TEXT_EXTENSIONS

    def allowed_audio_file(filename):
        return os.path.splitext(filename)[1].lower() in ALLOWED_AUDIO_EXTENSIONS

    # --- Audio Processing Functions ---
    def transcribe_audio(audio_filepath: str, socket_sid: str = None, trace_id: str = None, span_id: str = None):
        """Calls the Whisper ASR service to transcribe an audio file."""
        transcription_span = None
        if langfuse_client and trace_id:
            transcription_span = langfuse_client.span(
                CreateSpan(
                    trace_id=trace_id,
                    parent_observation_id=span_id,
                    name="audio-transcription",
                    input={"audio_filepath": audio_filepath}
                )
            )
        try:
            with open(audio_filepath, 'rb') as f:
                # Use 'audio_file' as the field name, and a generic mimetype for broad compatibility
                files = {'audio_file': (os.path.basename(audio_filepath), f, 'application/octet-stream')}
                response = requests.post(f"{WHISPER_ASR_HOST}/asr?task=transcribe&encode=true&output=json", files=files)
                response.raise_for_status()
                result = response.json()
                transcribed_text = result.get('text', '').strip()
                if not transcribed_text:
                    raise ValueError("No text transcribed from audio.")

                if transcription_span:
                    transcription_span.end(output={"transcription": transcribed_text}, status="SUCCESS")
                return transcribed_text
        except requests.exceptions.ConnectionError as e:
            error_msg = f"Could not connect to Whisper ASR service: {e}. Is it running?"
            logger.error(error_msg)
            if transcription_span:
                transcription_span.end(output={"error": error_msg}, status="ERROR")
            raise ConnectionError(error_msg)
        except requests.exceptions.RequestException as e:
            error_msg = f"Error from Whisper ASR service: {e}. Response: {e.response.text if e.response else 'N/A'}"
            logger.error(error_msg)
            if transcription_span:
                transcription_span.end(output={"error": error_msg}, status="ERROR")
            raise RuntimeError(error_msg)
        except Exception as e:
            error_msg = f"Unexpected error during audio transcription: {e}"
            logger.exception(error_msg)
            if transcription_span:
                transcription_span.end(output={"error": error_msg}, status="ERROR")
            raise RuntimeError(error_msg)

    def synthesize_speech(text: str, socket_sid: str = None, trace_id: str = None, span_id: str = None):
        """Calls the Coqui TTS service to synthesize speech from text."""
        tts_span = None
        if langfuse_client and trace_id:
            tts_span = langfuse_client.span(
                CreateSpan(
                    trace_id=trace_id,
                    parent_observation_id=span_id,
                    name="text-to-speech",
                    input={"text": text[:200] + "..." if len(text) > 200 else text} # Truncate for log
                )
            )
        try:
            # Coqui TTS API expects JSON payload for text
            response = requests.post(f"{COQUI_TTS_HOST}/api/tts", json={"text": text})
            response.raise_for_status()
            # The response content is the audio data (e.g., WAV bytes)
            audio_bytes = response.content

            if tts_span:
                tts_span.end(output={"audio_length_bytes": len(audio_bytes)}, status="SUCCESS")
            return audio_bytes
        except requests.exceptions.ConnectionError as e:
            error_msg = f"Could not connect to Coqui TTS service: {e}. Is it running?"
            logger.error(error_msg)
            if tts_span:
                tts_span.end(output={"error": error_msg}, status="ERROR")
            raise ConnectionError(error_msg)
        except requests.exceptions.RequestException as e:
            error_msg = f"Error from Coqui TTS service: {e}. Response: {e.response.text if e.response else 'N/A'}"
            logger.error(error_msg)
            if tts_span:
                tts_span.end(output={"error": error_msg}, status="ERROR")
            raise RuntimeError(error_msg)
        except Exception as e:
            error_msg = f"Unexpected error during speech synthesis: {e}"
            logger.exception(error_msg)
            if tts_span:
                tts_span.end(output={"error": error_msg}, status="ERROR")
            raise RuntimeError(error_msg)

    # --- Background Document Processing Task ---
    def process_document_background(filepath, original_filename, document_id, socket_sid, trace_id=None):
        nonlocal bm25_retriever, all_document_chunks
        processing_span = None
        if langfuse_client and trace_id:
            processing_span = langfuse_client.span(
                CreateSpan(
                    trace_id=trace_id,
                    name="process-document-background",
                    input={"document_id": document_id, "original_filename": original_filename}
                )
            )

        with app.app_context():
            try:
                socketio.emit('document_processing_status', {'id': document_id, 'status': 'Parsing file...', 'progress': 10}, room=socket_sid)
                mime = magic.Magic(mime=True)
                file_type = mime.from_file(filepath)
                allowed_content_types = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/octet-stream']
                if file_type not in allowed_content_types:
                    os.remove(filepath)
                    logger.warning(f"File {original_filename} has disallowed content type: {file_type}")
                    socketio.emit('document_processing_error', {'id': document_id, 'error': f"Invalid file content type: {file_type}. Please upload PDF, TXT, or DOCX."}, room=socket_sid)
                    if processing_span: processing_span.end(status="ERROR", status_message=f"Invalid file type: {file_type}")
                    return

                socketio.emit('document_processing_status', {'id': document_id, 'status': 'Extracting text...', 'progress': 30}, room=socket_sid)
                elements = partition(filename=filepath)
                logger.info(f"Partitioned document {original_filename}, found {len(elements)} elements.")

                full_extracted_text = "\n\n".join([element.text for element in elements if element.text.strip()])
                if not full_extracted_text.strip():
                    os.remove(filepath)
                    logger.error(f"No text extracted from document {original_filename}. File might be empty or unreadable.")
                    socketio.emit('document_processing_error', {'id': document_id, 'error': "Could not extract any content from document. It might be empty or unreadable."}, room=socket_sid)
                    if processing_span: processing_span.end(status="ERROR", status_message="No text extracted")
                    return

                extracted_text_filepath = os.path.join(TINYDB_DIR, f"{document_id}.txt")
                with open(extracted_text_filepath, 'w', encoding='utf-8') as f_ext:
                    f_ext.write(full_extracted_text)
                logger.info(f"Extracted text saved to {extracted_text_filepath}")

                # --- Neo4j Graph Data Extraction ---
                extract_and_store_graph_data(document_id, original_filename, full_extracted_text, doc_type="text", trace_id=trace_id, parent_span_id=processing_span.id if processing_span else None)
                # --- End Neo4j Graph Data Extraction ---

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
                                    "filepath": filepath,
                                    "doc_type": "text" # Explicitly mark as text document
                                }
                            )
                            langchain_docs.append(doc)
                            current_chunk_index += 1

                if not langchain_docs:
                    os.remove(filepath)
                    os.remove(extracted_text_filepath)
                    logger.error(f"No Langchain documents generated for {original_filename}. Issue with chunking.")
                    socketio.emit('document_processing_error', {'id': document_id, 'error': "Could not create document chunks for indexing. Ensure content is substantial."}, room=socket_sid)
                    if processing_span: processing_span.end(status="ERROR", status_message="No chunks generated")
                    return

                if vectorstore is None:
                    initialize_rag_system() # Attempt re-init
                    if vectorstore is None:
                        os.remove(filepath)
                        os.remove(extracted_text_filepath)
                        socketio.emit('document_processing_error', {'id': document_id, 'error': "Vector store not initialized. Cannot index document."}, room=socket_sid)
                        if processing_span: processing_span.end(status="ERROR", status_message="Vector store not initialized")
                        return

                vectorstore.add_documents(langchain_docs)
                vectorstore.persist()
                logger.info(f"Added {len(langchain_docs)} chunks to ChromaDB for document {document_id}.")

                documents_metadata[document_id] = {
                    "original_filename": original_filename,
                    "filename_on_disk": os.path.basename(filepath), # Store filename on disk for consistency
                    "filepath": filepath,
                    "extracted_text_filepath": extracted_text_filepath,
                    "upload_date": datetime.datetime.now().isoformat(),
                    "num_chunks": len(langchain_docs),
                    "type": "text_document" # Mark as text document
                }
                save_documents_metadata()

                all_document_chunks.extend(langchain_docs)
                if all_document_chunks:
                    tokenized_corpus = [doc.page_content.split(" ") for doc in all_document_chunks]
                    bm25_retriever = BM25Okapi(tokenized_corpus)
                    logger.info("BM25 retriever re-initialized after new document upload.")
                else:
                    bm25_retriever = None

                _create_rag_chain() # Re-create the RAG chain with the updated BM25 retriever

                socketio.emit('document_processing_status', {'id': document_id, 'status': 'Indexing complete!', 'progress': 100, 'success': True, 'original_filename': original_filename, 'num_chunks': len(langchain_docs)}, room=socket_sid)
                logger.info(f"Document {original_filename} (ID: {document_id}) processed successfully.")
                if processing_span: processing_span.end(status="SUCCESS")

            except PartitionUnstructuredError as e:
                logger.exception(f"Unstructured failed to partition document {original_filename}: {e}")
                if os.path.exists(filepath): os.remove(filepath)
                if os.path.exists(extracted_text_filepath): os.remove(extracted_text_filepath)
                socketio.emit('document_processing_error', {'id': document_id, 'error': f"Failed to parse document content (unstructured error): {e}. Please ensure it's a valid, uncorrupted file."}, room=socket_sid)
                if processing_span: processing_span.end(status="ERROR", status_message=f"Unstructured error: {e}")
            except Exception as e:
                logger.exception(f"Error processing document {original_filename}: {e}")
                if os.path.exists(filepath): os.remove(filepath)
                if os.path.exists(extracted_text_filepath): os.remove(extracted_text_filepath)
                socketio.emit('document_processing_error', {'id': document_id, 'error': f"An unexpected error occurred during document processing: {e}. Check backend console for details."}, room=socket_sid)
                if processing_span: processing_span.end(status="ERROR", status_message=f"Unexpected error: {e}")

    # --- Background Audio Processing Task ---
    def process_audio_background(filepath, original_filename, document_id, socket_sid, trace_id=None):
        nonlocal bm25_retriever, all_document_chunks
        processing_span = None
        if langfuse_client and trace_id:
            processing_span = langfuse_client.span(
                CreateSpan(
                    trace_id=trace_id,
                    name="process-audio-background",
                    input={"audio_id": document_id, "original_filename": original_filename}
                )
            )

        with app.app_context():
            extracted_text_filepath = None
            try:
                socketio.emit('audio_processing_status', {'id': document_id, 'status': 'Transcribing audio...', 'progress': 20}, room=socket_sid)
                transcribed_text = transcribe_audio(filepath, socket_sid=socket_sid, trace_id=trace_id, span_id=processing_span.id if processing_span else None)

                if not transcribed_text.strip():
                    os.remove(filepath)
                    logger.error(f"No text transcribed from audio file {original_filename}.")
                    socketio.emit('audio_processing_error', {'id': document_id, 'error': "Could not transcribe audio. File might be empty or unreadable."}, room=socket_sid)
                    if processing_span: processing_span.end(status="ERROR", status_message="No text transcribed")
                    return

                extracted_text_filepath = os.path.join(TINYDB_DIR, f"{document_id}_transcript.txt")
                with open(extracted_text_filepath, 'w', encoding='utf-8') as f_ext:
                    f_ext.write(transcribed_text)
                logger.info(f"Transcribed text saved to {extracted_text_filepath}")

                # --- Neo4j Graph Data Extraction ---
                extract_and_store_graph_data(document_id, original_filename, transcribed_text, doc_type="audio_transcript", trace_id=trace_id, parent_span_id=processing_span.id if processing_span else None)
                # --- End Neo4j Graph Data Extraction ---

                socketio.emit('audio_processing_status', {'id': document_id, 'status': 'Chunking and embedding transcript...', 'progress': 60}, room=socket_sid)
                text_splitter = RecursiveCharacterTextSplitter(chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP)
                langchain_docs = []
                current_chunk_index = 0
                sub_chunks = text_splitter.split_text(transcribed_text)
                for j, sub_chunk_text in enumerate(sub_chunks):
                    doc = LangchainDocument(
                        page_content=sub_chunk_text,
                        metadata={
                            "document_id": document_id,
                            "original_filename": original_filename,
                            "chunk_index": f"{current_chunk_index}",
                            "source_type": "audio_transcript",
                            "filepath": filepath,
                            "doc_type": "audio_transcript" # Explicitly mark as audio transcript
                        }
                    )
                    langchain_docs.append(doc)
                    current_chunk_index += 1

                if not langchain_docs:
                    os.remove(filepath)
                    os.remove(extracted_text_filepath)
                    logger.error(f"No Langchain documents generated for audio {original_filename}. Issue with chunking.")
                    socketio.emit('audio_processing_error', {'id': document_id, 'error': "Could not create document chunks from transcript. Ensure content is substantial."}, room=socket_sid)
                    if processing_span: processing_span.end(status="ERROR", status_message="No chunks generated from transcript")
                    return

                if vectorstore is None:
                    initialize_rag_system()
                    if vectorstore is None:
                        os.remove(filepath)
                        os.remove(extracted_text_filepath)
                        socketio.emit('audio_processing_error', {'id': document_id, 'error': "Vector store not initialized. Cannot index audio transcript."}, room=socket_sid)
                        if processing_span: processing_span.end(status="ERROR", status_message="Vector store not initialized")
                        return

                vectorstore.add_documents(langchain_docs)
                vectorstore.persist()
                logger.info(f"Added {len(langchain_docs)} chunks to ChromaDB for audio transcript {document_id}.")

                documents_metadata[document_id] = {
                    "original_filename": original_filename,
                    "filename_on_disk": os.path.basename(filepath),
                    "filepath": filepath,
                    "extracted_text_filepath": extracted_text_filepath,
                    "upload_date": datetime.datetime.now().isoformat(),
                    "num_chunks": len(langchain_docs),
                    "type": "audio_transcript" # Mark as audio transcript
                }
                save_documents_metadata()

                all_document_chunks.extend(langchain_docs)
                if all_document_chunks:
                    tokenized_corpus = [doc.page_content.split(" ") for doc in all_document_chunks]
                    bm25_retriever = BM25Okapi(tokenized_corpus)
                    logger.info("BM25 retriever re-initialized after new audio transcript upload.")
                else:
                    bm25_retriever = None

                _create_rag_chain()

                socketio.emit('audio_processing_status', {'id': document_id, 'status': 'Indexing complete!', 'progress': 100, 'success': True, 'original_filename': original_filename, 'num_chunks': len(langchain_docs)}, room=socket_sid)
                logger.info(f"Audio {original_filename} (ID: {document_id}) processed successfully.")
                if processing_span: processing_span.end(status="SUCCESS")

            except Exception as e:
                logger.exception(f"Error processing audio document {original_filename}: {e}")
                if os.path.exists(filepath): os.remove(filepath)
                if extracted_text_filepath and os.path.exists(extracted_text_filepath): os.remove(extracted_text_filepath)
                socketio.emit('audio_processing_error', {'id': document_id, 'error': f"An unexpected error occurred during audio processing: {e}. Check backend console for details."}, room=socket_sid)
                if processing_span: processing_span.end(status="ERROR", status_message=f"Unexpected error: {e}")


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

        if not allowed_text_file(file_extension):
            return jsonify({"success": False, "error": f"Unsupported text file type: {file_extension}. Allowed types are {', '.join(ALLOWED_TEXT_EXTENSIONS)}"}), 400

        document_id = str(uuid.uuid4())
        filename_on_disk = f"{document_id}{file_extension}"
        filepath = os.path.join(UPLOAD_FOLDER, filename_on_disk)

        # Start Langfuse trace for document upload
        trace = None
        if langfuse_client:
            trace = langfuse_client.trace(
                name="document-upload",
                input={"filename": original_filename, "file_extension": file_extension}
            )

        try:
            file.save(filepath)
            logger.info(f"File saved to {filepath} for background processing.")

            socket_sid = request.form.get('socket_sid')
            if not socket_sid:
                logger.warning("No socket_sid provided for document processing status updates. Real-time updates will not be sent.")

            executor.submit(process_document_background, filepath, original_filename, document_id, socket_sid, trace.id if trace else None)

            return jsonify({
                "success": True,
                "message": "Document upload initiated. Processing in background.",
                "id": document_id,
                "original_filename": original_filename
            }), 202

        except Exception as e:
            logger.exception(f"Error initiating document upload for {original_filename}: {e}")
            if os.path.exists(filepath):
                os.remove(filepath)
            if trace:
                trace.update(status="ERROR", status_message=f"Upload initiation failed: {e}")
            return jsonify({"success": False, "error": f"Error initiating document upload: {e}. Check backend console for details."}), 500

    @app.route('/upload_audio', methods=['POST'])
    def upload_audio():
        if 'file' not in request.files:
            return jsonify({"success": False, "error": "No file part"}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({"success": False, "error": "No selected file"}), 400

        original_filename = secure_filename(file.filename)
        file_extension = os.path.splitext(original_filename)[1].lower()

        if not allowed_audio_file(file_extension):
            return jsonify({"success": False, "error": f"Unsupported audio file type: {file_extension}. Allowed types are {', '.join(ALLOWED_AUDIO_EXTENSIONS)}"}), 400

        document_id = str(uuid.uuid4()) # Using document_id for audio transcript too
        filename_on_disk = f"{document_id}{file_extension}"
        filepath = os.path.join(UPLOAD_FOLDER, filename_on_disk) # Store audio files in UPLOAD_FOLDER

        # Start Langfuse trace for audio upload
        trace = None
        if langfuse_client:
            trace = langfuse_client.trace(
                name="audio-upload",
                input={"filename": original_filename, "file_extension": file_extension}
            )

        try:
            file.save(filepath)
            logger.info(f"Audio file saved to {filepath} for background processing.")

            socket_sid = request.form.get('socket_sid')
            if not socket_sid:
                logger.warning("No socket_sid provided for audio processing status updates. Real-time updates will not be sent.")

            executor.submit(process_audio_background, filepath, original_filename, document_id, socket_sid, trace.id if trace else None)

            return jsonify({
                "success": True,
                "message": "Audio upload initiated. Processing in background.",
                "id": document_id,
                "original_filename": original_filename
            }), 202

        except Exception as e:
            logger.exception(f"Error initiating audio upload for {original_filename}: {e}")
            if os.path.exists(filepath):
                os.remove(filepath)
            if trace:
                trace.update(status="ERROR", status_message=f"Upload initiation failed: {e}")
            return jsonify({"success": False, "error": f"Error initiating audio upload: {e}. Check backend console for details."}), 500

    @app.route('/ingest_gdrive_folder', methods=['POST'])
    def ingest_gdrive_folder():
        if not os.path.exists(GDRIVE_MOUNT_PATH):
            return jsonify({"success": False, "error": f"Google Drive mount path '{GDRIVE_MOUNT_PATH}' not found in container. Check docker-compose.yml."}), 404

        files_to_ingest = []
        for ext in ALLOWED_TEXT_EXTENSIONS:
            files_to_ingest.extend(glob.glob(os.path.join(GDRIVE_MOUNT_PATH, f'*{ext}')))
            files_to_ingest.extend(glob.glob(os.path.join(GDRIVE_MOUNT_PATH, f'*{ext.upper()}')))
        for ext in ALLOWED_AUDIO_EXTENSIONS:
            files_to_ingest.extend(glob.glob(os.path.join(GDRIVE_MOUNT_PATH, f'*{ext}')))
            files_to_ingest.extend(glob.glob(os.path.join(GDRIVE_MOUNT_PATH, f'*{ext.upper()}')))


        if not files_to_ingest:
            return jsonify({"success": False, "message": "No supported documents or audio files found in the mounted Google Drive folder."}), 200

        processed_count = 0
        failed_count = 0
        processing_details = []

        socket_sid = request.json.get('socket_sid') # Get SID from frontend for updates

        for filepath in files_to_ingest:
            original_filename = os.path.basename(filepath)
            document_id = str(uuid.uuid4())
            file_extension = os.path.splitext(original_filename)[1].lower()

            # Check if document already exists based on original_filename (simple check)
            if any(meta['original_filename'] == original_filename for meta in documents_metadata.values()):
                processing_details.append({"filename": original_filename, "status": "skipped", "reason": "Document with this filename already exists"})
                continue

            # Start Langfuse trace for GDrive ingest item
            trace = None
            if langfuse_client:
                trace = langfuse_client.trace(
                    name="gdrive-ingest-item",
                    input={"filename": original_filename, "file_extension": file_extension}
                )

            try:
                filename_on_disk = f"{document_id}{file_extension}"
                target_filepath = os.path.join(UPLOAD_FOLDER, filename_on_disk)
                shutil.copy(filepath, target_filepath)
                logger.info(f"Copied {filepath} to {target_filepath} for processing.")

                if allowed_text_file(file_extension):
                    executor.submit(process_document_background, target_filepath, original_filename, document_id, socket_sid, trace.id if trace else None)
                    processed_count += 1
                    processing_details.append({"filename": original_filename, "status": "initiated_text", "id": document_id})
                elif allowed_audio_file(file_extension):
                    executor.submit(process_audio_background, target_filepath, original_filename, document_id, socket_sid, trace.id if trace else None)
                    processed_count += 1
                    processing_details.append({"filename": original_filename, "status": "initiated_audio", "id": document_id})
                else:
                    processing_details.append({"filename": original_filename, "status": "skipped", "reason": "Unsupported file type"})
                    if trace: trace.update(status="ERROR", status_message="Unsupported file type for GDrive ingest")
                    continue # Skip to next file if not supported

            except Exception as e:
                logger.exception(f"Error preparing file {original_filename} for ingestion: {e}")
                failed_count += 1
                processing_details.append({"filename": original_filename, "status": "failed", "reason": str(e)})
                if trace: trace.update(status="ERROR", status_message=f"Preparation failed: {e}")

        if processed_count > 0:
            message = f"Initiated processing for {processed_count} documents/audio files from Google Drive folder."
            if failed_count > 0:
                message += f" {failed_count} documents/audio files failed or were skipped."
            return jsonify({"success": True, "message": message, "details": processing_details}), 202
        else:
            return jsonify({"success": False, "message": "No new supported documents or audio files found or all were skipped/failed.", "details": processing_details}), 200


    @app.route('/documents', methods=['GET'])
    def get_documents():
        search_query = request.args.get('query', '').lower()
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 5))
        doc_type_filter = request.args.get('type', 'all') # 'all', 'text_document', 'audio_transcript'

        all_docs = []
        for doc_id, meta in documents_metadata.items():
            doc_info = meta.copy()
            doc_info['id'] = doc_id
            all_docs.append(doc_info)

        filtered_docs = []
        for doc in all_docs:
            # Apply type filter
            if doc_type_filter != 'all' and doc.get('type') != doc_type_filter:
                continue
            # Apply search query filter
            if search_query and search_query not in doc['original_filename'].lower():
                continue
            filtered_docs.append(doc)

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
        nonlocal bm25_retriever, all_document_chunks # Allow modification of these globals
        if document_id not in documents_metadata:
            return jsonify({"success": False, "error": "Document not found"}), 404

        doc_info = documents_metadata[document_id]
        original_filepath = doc_info.get('filepath')
        extracted_text_filepath = doc_info.get('extracted_text_filepath')
        doc_type = doc_info.get('type', 'text_document') # Default to text if not specified

        # Start Langfuse trace for document deletion
        trace = None
        if langfuse_client:
            trace = langfuse_client.trace(
                name="document-deletion",
                input={"document_id": document_id, "original_filename": doc_info.get('original_filename')}
            )

        try:
            if vectorstore:
                vectorstore.delete(where={"document_id": document_id})
                vectorstore.persist()
                logger.info(f"Deleted chunks for document {document_id} from ChromaDB.")
            else:
                logger.warning("Vectorstore not initialized, cannot delete chunks from ChromaDB.")

            # Delete associated nodes/relationships from Neo4j
            if neo4j_driver:
                with neo4j_driver.session() as session:
                    node_label = "Document" if doc_type == "text_document" else "AudioTranscript"
                    session.run(f"MATCH (n:{node_label} {{id: $document_id}}) DETACH DELETE n", document_id=document_id)
                    logger.info(f"Deleted {node_label} node and its relationships for {document_id} from Neo4j.")


            if original_filepath and os.path.exists(original_filepath):
                os.remove(original_filepath)
                logger.info(f"Deleted original file: {original_filepath}")
            if extracted_text_filepath and os.path.exists(extracted_text_filepath):
                os.remove(extracted_text_filepath)
                logger.info(f"Deleted extracted text file: {extracted_text_filepath}")

            del documents_metadata[document_id]
            save_documents_metadata()

            # Rebuild BM25 index after document deletion
            all_document_chunks = [doc for doc in all_document_chunks if doc.metadata.get('document_id') != document_id]
            if all_document_chunks:
                tokenized_corpus = [doc.page_content.split(" ") for doc in all_document_chunks]
                bm25_retriever = BM25Okapi(tokenized_corpus)
                logger.info("BM25 retriever re-initialized after document deletion.")
            else:
                bm25_retriever = None
                logger.info("No documents left, BM25 retriever cleared.")

            _create_rag_chain() # Re-create the RAG chain with the updated BM25 retriever

            if trace:
                trace.update(status="SUCCESS")
            return jsonify({"success": True, "message": "Document deleted successfully"}), 200
        except Exception as e:
            logger.exception(f"Error deleting document {document_id}: {e}")
            if trace:
                trace.update(status="ERROR", status_message=f"Deletion failed: {e}")
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

    @app.route('/generate_podcast', methods=['POST'])
    def generate_podcast():
        data = request.json
        text_to_synthesize = data.get('text')
        document_id = data.get('document_id') # Optional: if generating from a specific doc
        socket_sid = data.get('socket_sid')

        trace = None
        if langfuse_client:
            trace = langfuse_client.trace(
                name="podcast-generation",
                input={"text_length": len(text_to_synthesize) if text_to_synthesize else "N/A", "document_id": document_id}
            )

        if not text_to_synthesize and document_id:
            # If no text provided, try to get it from the document
            if document_id not in documents_metadata:
                error_msg = "Document not found for podcast generation."
                if trace: trace.update(status="ERROR", status_message=error_msg)
                return jsonify({"success": False, "error": error_msg}), 404
            extracted_text_filepath = documents_metadata[document_id].get('extracted_text_filepath')
            if not extracted_text_filepath or not os.path.exists(extracted_text_filepath):
                error_msg = "Extracted text for document not found for podcast generation."
                if trace: trace.update(status="ERROR", status_message=error_msg)
                return jsonify({"success": False, "error": error_msg}), 404
            with open(extracted_text_filepath, 'r', encoding='utf-8') as f:
                text_to_synthesize = f.read()

        if not text_to_synthesize:
            error_msg = "No text provided or found for podcast generation."
            if trace: trace.update(status="ERROR", status_message=error_msg)
            return jsonify({"success": False, "error": error_msg}), 400

        try:
            # Synthesize speech in a background thread
            def _generate_podcast_background(text, doc_id, sid, current_trace_id):
                with app.app_context():
                    podcast_span = None
                    if langfuse_client and current_trace_id:
                        podcast_span = langfuse_client.span(
                            CreateSpan(
                                trace_id=current_trace_id,
                                name="podcast-generation-background",
                                input={"text_length": len(text)}
                            )
                        )
                    try:
                        socketio.emit('podcast_status', {'id': doc_id, 'status': 'Synthesizing audio...', 'progress': 50}, room=sid)
                        audio_bytes = synthesize_speech(text, socket_sid=sid, trace_id=current_trace_id, span_id=podcast_span.id if podcast_span else None) # Pass trace_id and span_id

                        audio_filename = f"podcast_{doc_id or uuid.uuid4()}.wav"
                        audio_filepath = os.path.join(AUDIO_OUTPUT_DIR, audio_filename)
                        with open(audio_filepath, 'wb') as f:
                            f.write(audio_bytes)
                        logger.info(f"Generated podcast saved to {audio_filepath}")

                        socketio.emit('podcast_status', {'id': doc_id, 'status': 'Podcast generated!', 'progress': 100, 'success': True, 'filename': audio_filename, 'url': f'{request.url_root.rstrip("/")}/audio_output/{audio_filename}'}, room=sid)
                        if podcast_span: podcast_span.end(status="SUCCESS", output={"audio_filename": audio_filename})
                        if trace: trace.update(status="SUCCESS") # Update main trace
                    except Exception as e:
                        logger.exception(f"Error generating podcast for document {doc_id}: {e}")
                        socketio.emit('podcast_error', {'id': doc_id, 'error': f"Failed to generate podcast: {e}"}, room=sid)
                        if podcast_span: podcast_span.end(status="ERROR", status_message=f"Podcast generation failed: {e}")
                        if trace: trace.update(status="ERROR", status_message=f"Podcast generation failed: {e}")


            executor.submit(_generate_podcast_background, text_to_synthesize, document_id, socket_sid, trace.id if trace else None)
            return jsonify({"success": True, "message": "Podcast generation initiated in background."}), 202

        except Exception as e:
            logger.exception(f"Error initiating podcast generation: {e}")
            if trace: trace.update(status="ERROR", status_message=f"Podcast initiation failed: {e}")
            return jsonify({"success": False, "error": f"Failed to initiate podcast generation: {e}"}), 500

    @app.route('/audio_output/<filename>', methods=['GET'])
    def serve_audio_output(filename):
        """Serves generated audio files."""
        filepath = os.path.join(AUDIO_OUTPUT_DIR, filename)
        if os.path.exists(filepath):
            return send_file(filepath, mimetype="audio/wav") # Adjust mimetype if you use other formats
        return jsonify({"success": False, "error": "Audio file not found"}), 404


    @app.route('/chat', methods=['POST'])
    def chat():
        data = request.json
        user_message_content = data.get('message')
        if not user_message_content:
            return jsonify({"success": False, "error": "No message provided"}), 400

        # Start Langfuse trace for the entire chat interaction
        trace = None
        if langfuse_client:
            trace = langfuse_client.trace(
                name="chat-session",
                input={"user_query": user_message_content},
                metadata={"session_id": request.sid} # Use socket SID as session ID
            )

        try:
            if retrieval_chain is None:
                initialize_rag_system()
                if retrieval_chain is None:
                    error_message = "RAG system not fully initialized after retry. Please check backend logs and ensure Ollama is running."
                    chat_history_data.append({"role": "assistant", "content": error_message, "timestamp": datetime.datetime.now().isoformat(), "isError": True})
                    save_chat_history()
                    socketio.emit('chat_response_complete', {'success': False, 'error': error_message, 'history': chat_history_data}, room=request.sid)
                    if trace:
                        trace.update(output={"error": error_message}, status_message="RAG system initialization failed", status="ERROR")
                    return jsonify({"success": False, "error": error_message}), 500

            messages_for_llm = []
            for msg in chat_history_data:
                if msg["role"] == "user":
                    messages_for_llm.append(HumanMessage(content=msg["content"]))
                elif msg["role"] == "assistant" and not msg.get("isError", False):
                    messages_for_llm.append(AIMessage(content=msg["content"]))

            socketio.emit('typing_indicator', {'status': True}, room=request.sid)

            # Langfuse span for retrieval
            retrieval_span = None
            if langfuse_client and trace:
                retrieval_span = langfuse_client.span(
                    CreateSpan(
                        trace_id=trace.id,
                        name="retrieval",
                        input={"query": user_message_content, "k_vector": TOP_K_VECTOR_SEARCH, "k_bm25": TOP_K_BM25_SEARCH}
                    )
                )

            # Perform retrieval using the custom hybrid retriever
            retrieved_docs = retrieval_chain.retriever.get_relevant_documents(user_message_content)

            if retrieval_span:
                retrieval_span.end(output={"documents": [doc.metadata for doc in retrieved_docs]})


            # Prepare context for LLM
            context_text = "\n\n".join([doc.page_content for doc in retrieved_docs])
            # Construct the full prompt for the LLM, including chat history and context
            full_prompt_messages = [
                ("system", "You are a helpful assistant. Answer the user's questions based on the provided context. If you don't know the answer, just say that you don't know, don't try to make up an answer. Provide sources for your answers, referencing the original filename, chunk index, and document ID. Ensure your responses are concise and directly address the user's query while integrating information from the provided context."),
                *messages_for_llm, # Include previous chat history
                ("human", f"Context: {context_text}\n\nQuestion: {user_message_content}"),
            ]

            # Langfuse generation for LLM call
            generation_span = None
            if langfuse_client and trace:
                generation_span = langfuse_client.generation(
                    CreateGeneration(
                        trace_id=trace.id,
                        name="llm-generation",
                        model=LLM_MODEL,
                        input=full_prompt_messages,
                        # Langfuse expects parameters in a flat dictionary
                        model_parameters={
                            "temperature": LLM_TEMPERATURE,
                            "top_k": LLM_TOP_K,
                            "top_p": LLM_TOP_P
                        }
                    )
                )

            # Stream response from LLM
            full_response_content = ""
            for chunk in llm.stream(full_prompt_messages):
                if chunk.content:
                    full_response_content += chunk.content
                    socketio.emit('chat_stream_chunk', {'content': chunk.content}, room=request.sid)

            sources = []
            if retrieved_docs:
                for i, doc in enumerate(retrieved_docs):
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
                "response": full_response_content,
                "sources": sources,
                "timestamp": datetime.datetime.now().isoformat()
            }

            # Append user message and assistant response to history
            chat_history_data.append({"role": "user", "content": user_message_content, "timestamp": datetime.datetime.now().isoformat()})
            chat_history_data.append({"role": "assistant", "content": assistant_response_data["response"], "timestamp": assistant_response_data["timestamp"], "sources": assistant_response_data["sources"]})
            save_chat_history()

            socketio.emit('chat_response_complete', {'success': True, 'history': chat_history_data, 'sources': sources}, room=request.sid)
            socketio.emit('typing_indicator', {'status': False}, room=request.sid)

            if generation_span:
                generation_span.end(output={"answer": full_response_content})
            if trace:
                trace.update(output={"answer": full_response_content}, status="SUCCESS")

            return jsonify(assistant_response_data), 200

        except Exception as e:
            logger.exception(f"Error during chat: {e}")
            error_message = f"An error occurred while processing your request: {e}. Please check the backend console."
            chat_history_data.append({"role": "assistant", "content": error_message, "timestamp": datetime.datetime.now().isoformat(), "isError": True})
            save_chat_history()
            socketio.emit('chat_response_complete', {'success': False, 'error': error_message, 'history': chat_history_data}, room=request.sid)
            socketio.emit('typing_indicator', {'status': False}, room=request.sid)

            if generation_span:
                generation_span.end(output={"error": str(e)}, status="ERROR")
            if trace:
                trace.update(output={"error": str(e)}, status_message=str(e), status="ERROR")

            return jsonify({"success": False, "error": error_message}), 500

    @app.route('/chat_history', methods=['GET'])
    def get_chat_history_api():
        return jsonify({"success": True, "history": chat_history_data}), 200

    @app.route('/clear_chat_history', methods=['POST'])
    def clear_chat_history_api():
        nonlocal chat_history_data
        chat_history_data = []
        save_chat_history()
        socketio.emit('chat_response_complete', {'success': True, 'history': chat_history_data}, room=request.sid)
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
        new_top_p = float(data.get('top_p', LLM_TOP_P))

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
            LLM_TOP_P = new_top_p

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

    with app.app_context():
        initialize_rag_system()

    return app, socketio

if __name__ == '__main__':
    app, socketio = create_app()
    socketio.run(app, host='0.0.0.0', port=5000, debug=True, allow_unsafe_werkzeug=True)
