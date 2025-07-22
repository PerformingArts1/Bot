import pytest
import os
import json
import shutil
from unittest.mock import patch, MagicMock
from io import BytesIO

# Import the create_app factory function
from app import create_app, DATA_DIR, UPLOAD_FOLDER, PERSIST_DIRECTORY, TINYDB_DIR, \
    CHAT_HISTORY_FILE, DOCUMENTS_METADATA_FILE, LLM_SETTINGS_FILE

# Global variables to hold app and socketio instances for test setup
test_app_instance = None
test_socketio_instance = None

# Ensure test directories are clean before and after tests
@pytest.fixture(scope='session', autouse=True)
def setup_test_environment():
    global test_app_instance, test_socketio_instance

    # Define test-specific paths
    test_data_dir = "test_data_for_app"
    test_upload_folder = os.path.join(test_data_dir, 'documents')
    test_persist_directory = os.path.join(test_data_dir, 'chroma_db')
    test_tinydb_dir = os.path.join(test_data_dir, 'tinydb')
    test_chat_history_file = os.path.join(test_tinydb_dir, 'chat_history.json')
    test_documents_metadata_file = os.path.join(test_tinydb_dir, 'documents_metadata.json')
    test_llm_settings_file = os.path.join(test_tinydb_dir, 'llm_settings.json')

    # Clean up existing test data directories before running tests
    if os.path.exists(test_data_dir):
        shutil.rmtree(test_data_dir)
    os.makedirs(test_upload_folder, exist_ok=True)
    os.makedirs(test_persist_directory, exist_ok=True)
    os.makedirs(test_tinydb_dir, exist_ok=True)

    # Patch global variables in app.py for test paths
    with patch('app.DATA_DIR', test_data_dir), \
         patch('app.UPLOAD_FOLDER', test_upload_folder), \
         patch('app.PERSIST_DIRECTORY', test_persist_directory), \
         patch('app.TINYDB_DIR', test_tinydb_dir), \
         patch('app.CHAT_HISTORY_FILE', test_chat_history_file), \
         patch('app.DOCUMENTS_METADATA_FILE', test_documents_metadata_file), \
         patch('app.LLM_SETTINGS_FILE', test_llm_settings_file):

        # Create the app instance using the factory
        test_app_instance, test_socketio_instance = create_app()
        test_app_instance.config['TESTING'] = True

        yield # Run tests

    # Clean up test data directories after tests
    if os.path.exists(test_data_dir):
        shutil.rmtree(test_data_dir)

@pytest.fixture
def app():
    # Return the pre-configured app instance
    return test_app_instance

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def socketio_test_client():
    # Create a test client for SocketIO
    return test_socketio_instance.test_client(test_app_instance)

# Mock external dependencies for all tests
@pytest.fixture(autouse=True)
def mock_external_dependencies():
    with patch('app.Ollama') as MockOllama, \
         patch('app.OllamaEmbeddings') as MockOllamaEmbeddings, \
         patch('app.Chroma') as MockChroma, \
         patch('app.partition') as MockPartition, \
         patch('app.create_retrieval_chain') as MockCreateRetrievalChain, \
         patch('app.create_stuff_documents_chain') as MockCreateStuffDocumentsChain, \
         patch('app.magic.Magic') as MockMagic, \
         patch('app.executor') as MockExecutor, \
         patch('app.BM25Okapi') as MockBM25Okapi, \
         patch('app.re_rank_documents') as MockReRankDocuments: # Mock re-ranker

        # Configure Ollama/Embeddings mocks
        mock_ollama_instance = MagicMock()
        mock_ollama_instance.stream.return_value = [
            MagicMock(content="Mocked "),
            MagicMock(content="AI "),
            MagicMock(content="response.")
        ]
        MockOllama.return_value = mock_ollama_instance
        MockOllamaEmbeddings.return_value = MagicMock()

        # Configure Chroma mock
        mock_vectorstore_instance = MagicMock()
        mock_vectorstore_instance.as_retriever.return_value = MagicMock()
        mock_vectorstore_instance.add_documents.return_value = None
        mock_vectorstore_instance.delete.return_value = None
        mock_vectorstore_instance.persist.return_value = None
        # Mock _collection.get for BM25 indexing
        mock_vectorstore_instance._collection = MagicMock()
        mock_vectorstore_instance._collection.get.return_value = {
            'ids': ['doc_chunk_1', 'doc_chunk_2'],
            'documents': ["content of chunk 1", "content of chunk 2"],
            'metadatas': [{"document_id": "mock_doc_id_1", "chunk_index": "0"}, {"document_id": "mock_doc_id_2", "chunk_index": "0"}]
        }
        MockChroma.return_value = mock_vectorstore_instance
        # Directly set the global vectorstore for the app instance (used by app.py functions)
        test_app_instance.vectorstore = mock_vectorstore_instance

        # Configure unstructured.partition.auto.partition mock
        mock_element = MagicMock()
        mock_element.text = "This is some extracted text from the document."
        mock_element.category = "NarrativeText"
        MockPartition.return_value = [mock_element] # Return some elements

        # Configure Langchain chain mocks
        mock_document_chain = MagicMock()
        MockCreateStuffDocumentsChain.return_value = mock_document_chain

        # Mock the HybridRetriever's get_relevant_documents
        mock_retriever_instance = MagicMock()
        mock_retrieved_docs = [
            MagicMock(page_content="Context snippet 1", metadata={"original_filename": "test.pdf", "chunk_index": "0", "document_id": "mock_doc_id_1"}),
            MagicMock(page_content="Context snippet 2", metadata={"original_filename": "another.txt", "chunk_index": "1", "document_id": "mock_doc_id_2"})
        ]
        mock_retriever_instance.get_relevant_documents.return_value = mock_retrieved_docs

        mock_retrieval_chain = MagicMock()
        # The retrieval chain's 'retriever' attribute will be our HybridRetriever instance
        mock_retrieval_chain.retriever = mock_retriever_instance
        # The invoke method is now simpler as it just calls the retriever
        mock_retrieval_chain.invoke.return_value = {
            "answer": "Mocked AI response based on context.",
            "context": mock_retrieved_docs # Ensure context is passed correctly
        }
        MockCreateRetrievalChain.return_value = mock_retrieval_chain
        # Directly set the global retrieval_chain for the app instance
        test_app_instance.retrieval_chain = mock_retrieval_chain

        # Configure python-magic mock
        mock_magic_instance = MagicMock()
        mock_magic_instance.from_file.return_value = 'application/pdf'
        MockMagic.return_value = mock_magic_instance

        # Mock the executor to run tasks immediately for testing
        MockExecutor.submit.side_effect = lambda fn, *args, **kwargs: fn(*args, **kwargs)

        # Mock BM25Okapi
        MockBM25Okapi.return_value = MagicMock()
        MockBM25Okapi.return_value.get_scores.return_value = [0.5, 0.8] # Dummy scores

        # Mock re_rank_documents to just return input for now
        MockReRankDocuments.side_effect = lambda query, docs: docs

        yield

    # Clean up in-memory data after each test
    test_app_instance.chat_history_data.clear()
    test_app_instance.documents_metadata.clear()
    test_app_instance.all_document_chunks.clear() # Clear BM25 chunks
    # Reload persistence files to ensure clean state for each test
    with test_app_instance.app_context():
        test_app_instance.load_chat_history()
        test_app_instance.load_documents_metadata()
        test_app_instance.load_llm_settings()


def test_index_route(client):
    response = client.get('/')
    assert response.status_code == 200
    assert b"Local RAG System Backend is running!" in response.data

def test_upload_document_initiates_background_processing(client, socketio_test_client):
    data = {
        'file': (BytesIO(b'%PDF-1.4\n1 0 obj <</Type/Catalog/Pages 2 0 R>> endobj 2 0 obj <</Type/Pages/Count 0>> endobj'), 'test_file.pdf', 'application/pdf'),
        'socket_sid': socketio_test_client.sid
    }

    response = client.post('/upload_document', content_type='multipart/form-data', data=data)

    assert response.status_code == 202
    json_data = response.get_json()
    assert json_data['success'] is True
    assert "Document upload initiated. Processing in background." in json_data['message']
    assert 'id' in json_data
    assert 'original_filename' in json_data

    # Verify that processing status updates were emitted via SocketIO
    received = socketio_test_client.get_received()
    assert any(msg['name'] == 'document_processing_status' and msg['args'][0]['status'] == 'Indexing complete!' for msg in received)
    assert any(msg['name'] == 'document_processing_status' and msg['args'][0]['success'] is True for msg in received)

    doc_id = json_data['id']
    assert doc_id in test_app_instance.documents_metadata
    assert test_app_instance.vectorstore.add_documents.called

def test_upload_document_no_file(client):
    response = client.post('/upload_document')
    assert response.status_code == 400
    json_data = response.get_json()
    assert json_data['success'] is False
    assert "No file part" in json_data['error']

def test_upload_document_unsupported_extension(client):
    data = {
        'file': (BytesIO(b"dummy content"), 'test_file.xyz', 'text/plain')
    }
    response = client.post('/upload_document', content_type='multipart/form-data', data=data)
    assert response.status_code == 400
    json_data = response.get_json()
    assert json_data['success'] is False
    assert "Unsupported file type" in json_data['error']

def test_upload_document_invalid_content_type(client, socketio_test_client):
    with patch('app.magic.Magic') as MockMagic:
        mock_magic_instance = MockMagic.return_value
        mock_magic_instance.from_file.return_value = 'application/x-executable'
        data = {
            'file': (BytesIO(b'dummy executable content'), 'test_file.pdf', 'application/pdf'),
            'socket_sid': socketio_test_client.sid
        }
        response = client.post('/upload_document', content_type='multipart/form-data', data=data)

        assert response.status_code == 202
        json_data = response.get_json()
        assert json_data['success'] is True

        received = socketio_test_client.get_received()
        assert any(msg['name'] == 'document_processing_error' and "Invalid file content type" in msg['args'][0]['error'] for msg in received)


def test_get_documents(client):
    doc_id = "test_doc_id_123"
    test_app_instance.documents_metadata[doc_id] = {
        "original_filename": "test_document.pdf",
        "filename_on_disk": f"{doc_id}.pdf",
        "filepath": os.path.join(UPLOAD_FOLDER, f"{doc_id}.pdf"),
        "extracted_text_filepath": os.path.join(TINYDB_DIR, f"{doc_id}.txt"),
        "upload_date": "2024-07-20T10:00:00.000000",
        "num_chunks": 5
    }
    response = client.get('/documents')
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['success'] is True
    assert len(json_data['documents']) == 1
    assert json_data['documents'][0]['original_filename'] == "test_document.pdf"

def test_delete_document_success(client):
    doc_id = "to_be_deleted_doc"
    dummy_original_path = os.path.join(UPLOAD_FOLDER, f"{doc_id}.pdf")
    dummy_extracted_path = os.path.join(TINYDB_DIR, f"{doc_id}.txt")
    with open(dummy_original_path, 'w') as f: f.write("dummy original")
    with open(dummy_extracted_path, 'w') as f: f.write("dummy extracted")

    test_app_instance.documents_metadata[doc_id] = {
        "original_filename": "delete_me.pdf",
        "filename_on_disk": f"{doc_id}.pdf",
        "filepath": dummy_original_path,
        "extracted_text_filepath": dummy_extracted_path,
        "upload_date": "2024-07-20T10:00:00.000000",
        "num_chunks": 3
    }
    response = client.delete(f'/delete_document/{doc_id}')
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['success'] is True
    assert "Document deleted successfully" in json_data['message']
    assert doc_id not in test_app_instance.documents_metadata
    assert not os.path.exists(dummy_original_path)
    assert not os.path.exists(dummy_extracted_path)
    assert test_app_instance.vectorstore.delete.called

def test_delete_document_not_found(client):
    response = client.delete('/delete_document/non_existent_doc_id')
    assert response.status_code == 404
    json_data = response.get_json()
    assert json_data['success'] is False
    assert "Document not found" in json_data['error']

def test_preview_extracted_text_success(client):
    doc_id = "preview_doc_id"
    extracted_content = "This is the extracted text content for previewing."
    extracted_path = os.path.join(TINYDB_DIR, f"{doc_id}.txt")
    with open(extracted_path, 'w', encoding='utf-8') as f:
        f.write(extracted_content)

    test_app_instance.documents_metadata[doc_id] = {
        "original_filename": "preview.txt",
        "extracted_text_filepath": extracted_path,
        "upload_date": "2024-07-20T11:00:00.000000",
        "num_chunks": 1
    }

    response = client.get(f'/preview_extracted_text/{doc_id}')
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['success'] is True
    assert json_data['content'] == extracted_content
    assert json_data['truncated'] is False

    os.remove(extracted_path)

def test_preview_extracted_text_not_found(client):
    response = client.get('/preview_extracted_text/non_existent_preview_id')
    assert response.status_code == 404
    json_data = response.get_json()
    assert json_data['success'] is False
    assert "Document not found" in json_data['error']

def test_chat_success(client, socketio_test_client):
    test_app_instance.chat_history_data.clear()

    response = client.post('/chat', json={'message': 'Hello, what is this document about?'})
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['success'] is True
    assert "Mocked AI response." in json_data['response'] # Full response content
    assert 'sources' in json_data
    assert len(json_data['sources']) > 0
    assert test_app_instance.retrieval_chain.retriever.get_relevant_documents.called # Check retriever call
    assert test_app_instance.llm.stream.called # Check LLM stream call

    received = socketio_test_client.get_received()
    assert any(msg['name'] == 'typing_indicator' and msg['args'][0]['status'] is True for msg in received)
    assert any(msg['name'] == 'chat_stream_chunk' and msg['args'][0]['content'] == 'Mocked ' for msg in received)
    assert any(msg['name'] == 'chat_stream_chunk' and msg['args'][0]['content'] == 'AI ' for msg in received)
    assert any(msg['name'] == 'chat_stream_chunk' and msg['args'][0]['content'] == 'response.' for msg in received)
    assert any(msg['name'] == 'chat_response_complete' and msg['args'][0]['success'] is True for msg in received)
    assert any(msg['name'] == 'typing_indicator' and msg['args'][0]['status'] is False for msg in received)

    assert len(test_app_instance.chat_history_data) == 2
    assert test_app_instance.chat_history_data[0]['role'] == 'user'
    assert test_app_instance.chat_history_data[1]['role'] == 'assistant'

def test_chat_no_message(client):
    response = client.post('/chat', json={})
    assert response.status_code == 400
    json_data = response.get_json()
    assert json_data['success'] is False
    assert "No message provided" in json_data['error']

def test_get_chat_history(client):
    test_app_instance.chat_history_data.append({"role": "user", "content": "Hi", "timestamp": "2024-07-20T12:00:00"})
    test_app_instance.chat_history_data.append({"role": "assistant", "content": "Hello!", "timestamp": "2024-07-20T12:00:05"})

    response = client.get('/chat_history')
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['success'] is True
    assert len(json_data['history']) == 2
    assert json_data['history'][0]['role'] == 'user'
    assert json_data['history'][1]['role'] == 'assistant'

def test_clear_chat_history(client, socketio_test_client):
    test_app_instance.chat_history_data.append({"role": "user", "content": "Hi", "timestamp": "2024-07-20T12:00:00"})
    assert len(test_app_instance.chat_history_data) == 1

    response = client.post('/clear_chat_history')
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['success'] is True
    assert "Chat history cleared" in json_data['message']
    assert len(test_app_instance.chat_history_data) == 0

    received = socketio_test_client.get_received()
    assert any(msg['name'] == 'chat_response_complete' and msg['args'][0]['success'] is True and len(msg['args'][0]['history']) == 0 for msg in received)

def test_get_llm_settings(client):
    response = client.get('/llm_settings')
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['success'] is True
    assert 'model' in json_data
    assert 'temperature' in json_data
    assert 'top_k' in json_data
    assert 'top_p' in json_data

def test_update_llm_settings_success(client):
    new_settings = {
        "model": "mistral",
        "temperature": 0.5,
        "top_k": 30,
        "top_p": 0.8
    }
    response = client.post('/llm_settings', json=new_settings)
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['success'] is True
    assert "LLM settings updated successfully" in json_data['message']
    assert test_app_instance.LLM_MODEL == "mistral"
    assert test_app_instance.LLM_TEMPERATURE == 0.5
    assert test_app_instance.LLM_TOP_K == 30
    assert test_app_instance.LLM_TOP_P == 0.8
    assert test_app_instance._create_rag_chain.called

def test_update_llm_settings_no_change(client):
    test_app_instance.LLM_MODEL = "llama2"
    test_app_instance.LLM_TEMPERATURE = 0.7
    test_app_instance.LLM_TOP_K = 40
    test_app_instance.LLM_TOP_P = 0.9

    current_settings = {
        "model": "llama2",
        "temperature": 0.7,
        "top_k": 40,
        "top_p": 0.9
    }
    response = client.post('/llm_settings', json=current_settings)
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['success'] is True
    assert "No changes detected in LLM settings" in json_data['message']

def test_update_llm_settings_invalid_temperature(client):
    new_settings = {"temperature": 3.0}
    response = client.post('/llm_settings', json=new_settings)
    assert response.status_code == 400
    assert "Temperature must be between 0.0 and 2.0" in response.get_json()['error']

def test_get_ollama_models(client):
    with patch('app.requests.get') as mock_requests_get:
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "models": [
                {"name": "llama2"},
                {"name": "mistral"},
                {"name": "nomic-embed-text"}
            ]
        }
        mock_requests_get.return_value = mock_response

        response = client.get('/ollama_models')
        assert response.status_code == 200
        json_data = response.get_json()
        assert json_data['success'] is True
        assert 'models' in json_data
        assert "llama2" in json_data['models']
        assert "mistral" in json_data['models']
        assert "nomic-embed-text" in json_data['models']
