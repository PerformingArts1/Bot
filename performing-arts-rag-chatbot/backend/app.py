{\rtf1\ansi\ansicpg1252\cocoartf2822
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red202\green202\blue202;\red23\green24\blue24;\red183\green111\blue247;
\red212\green212\blue212;\red109\green115\blue120;\red113\green192\blue131;\red246\green124\blue48;\red70\green137\blue204;
}
{\*\expandedcolortbl;;\cssrgb\c83137\c83137\c83137;\cssrgb\c11765\c12157\c12549;\cssrgb\c77255\c54118\c97647;
\cssrgb\c86275\c86275\c86275;\cssrgb\c50196\c52549\c54510;\cssrgb\c50588\c78824\c58431;\cssrgb\c98039\c56471\c24314;\cssrgb\c33725\c61176\c83922;
}
\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs28 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2     \cf4 \cb3 \strokec4 from\cf2 \cb3 \strokec2  flask \cf4 \cb3 \strokec4 import\cf2 \cb3 \strokec2  Flask\cf5 \strokec5 ,\cf2 \strokec2  request\cf5 \strokec5 ,\cf2 \strokec2  jsonify\cb1 \
\cb3     \cf4 \cb3 \strokec4 from\cf2 \cb3 \strokec2  flask_cors \cf4 \cb3 \strokec4 import\cf2 \cb3 \strokec2  CORS\cb1 \
\cb3     \cf4 \cb3 \strokec4 from\cf2 \cb3 \strokec2  dotenv \cf4 \cb3 \strokec4 import\cf2 \cb3 \strokec2  load_dotenv\cb1 \
\cb3     \cf4 \cb3 \strokec4 import\cf2 \cb3 \strokec2  os\cb1 \
\cb3     \cf4 \cb3 \strokec4 import\cf2 \cb3 \strokec2  tempfile\cb1 \
\cb3     \cf4 \cb3 \strokec4 from\cf2 \cb3 \strokec2  pypdf \cf4 \cb3 \strokec4 import\cf2 \cb3 \strokec2  PdfReader\cb1 \
\cb3     \cf4 \cb3 \strokec4 from\cf2 \cb3 \strokec2  langchain.embeddings \cf4 \cb3 \strokec4 import\cf2 \cb3 \strokec2  GooglePalmEmbeddings\cb1 \
\cb3     \cf4 \cb3 \strokec4 from\cf2 \cb3 \strokec2  langchain.vectorstores \cf4 \cb3 \strokec4 import\cf2 \cb3 \strokec2  FAISS\cb1 \
\cb3     \cf4 \cb3 \strokec4 from\cf2 \cb3 \strokec2  langchain.text_splitter \cf4 \cb3 \strokec4 import\cf2 \cb3 \strokec2  RecursiveCharacterTextSplitter\cb1 \
\cb3     \cf4 \cb3 \strokec4 from\cf2 \cb3 \strokec2  langchain.chains \cf4 \cb3 \strokec4 import\cf2 \cb3 \strokec2  ConversationalRetrievalChain\cb1 \
\cb3     \cf4 \cb3 \strokec4 from\cf2 \cb3 \strokec2  langchain.memory \cf4 \cb3 \strokec4 import\cf2 \cb3 \strokec2  ConversationBufferMemory\cb1 \
\cb3     \cf4 \cb3 \strokec4 from\cf2 \cb3 \strokec2  langchain_google_genai \cf4 \cb3 \strokec4 import\cf2 \cb3 \strokec2  ChatGoogleGenerativeAI\cb1 \
\cb3     \cf4 \cb3 \strokec4 import\cf2 \cb3 \strokec2  google.generativeai \cf4 \cb3 \strokec4 as\cf2 \cb3 \strokec2  genai\cb1 \
\cb3     \cf4 \cb3 \strokec4 import\cf2 \cb3 \strokec2  uuid\cb1 \
\cb3     \cf4 \cb3 \strokec4 import\cf2 \cb3 \strokec2  json\cb1 \
\cb3     \cf4 \cb3 \strokec4 from\cf2 \cb3 \strokec2  datetime \cf4 \cb3 \strokec4 import\cf2 \cb3 \strokec2  datetime\cb1 \
\
\cb3     \cf6 \strokec6 # Load environment variables from .env file\cf2 \cb1 \strokec2 \
\cb3     load_dotenv\cf5 \strokec5 ()\cf2 \cb1 \strokec2 \
\
\cb3     app = Flask\cf5 \strokec5 (\cf4 \cb3 \strokec4 __name__\cf5 \cb3 \strokec5 )\cf2 \cb1 \strokec2 \
\cb3     CORS\cf5 \strokec5 (\cf2 \strokec2 app\cf5 \strokec5 )\cf2 \strokec2  \cf6 \strokec6 # Enable CORS for all origins\cf2 \cb1 \strokec2 \
\
\cb3     \cf6 \strokec6 # --- Configuration ---\cf2 \cb1 \strokec2 \
\cb3     \cf6 \strokec6 # Retrieve API keys from environment variables\cf2 \cb1 \strokec2 \
\cb3     GOOGLE_API_KEY = os.getenv\cf5 \strokec5 (\cf7 \strokec7 "GOOGLE_API_KEY"\cf5 \strokec5 )\cf2 \cb1 \strokec2 \
\cb3     PRIMARY_BACKEND_API_KEY = os.getenv\cf5 \strokec5 (\cf7 \strokec7 "PRIMARY_BACKEND_API_KEY"\cf5 \strokec5 )\cf2 \strokec2  \cf6 \strokec6 # This is the key the frontend will use\cf2 \cb1 \strokec2 \
\
\cb3     \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf4 \cb3 \strokec4 not\cf2 \cb3 \strokec2  GOOGLE_API_KEY\cf5 \strokec5 :\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 raise\cf2 \cb3 \strokec2  ValueError\cf5 \strokec5 (\cf7 \strokec7 "GOOGLE_API_KEY environment variable not set."\cf5 \strokec5 )\cf2 \cb1 \strokec2 \
\cb3     \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf4 \cb3 \strokec4 not\cf2 \cb3 \strokec2  PRIMARY_BACKEND_API_KEY\cf5 \strokec5 :\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 raise\cf2 \cb3 \strokec2  ValueError\cf5 \strokec5 (\cf7 \strokec7 "PRIMARY_BACKEND_API_KEY environment variable not set."\cf5 \strokec5 )\cf2 \cb1 \strokec2 \
\
\cb3     genai.configure\cf5 \strokec5 (\cf2 \strokec2 api_key=GOOGLE_API_KEY\cf5 \strokec5 )\cf2 \cb1 \strokec2 \
\
\cb3     \cf6 \strokec6 # In-memory storage for document chunks and metadata (for demonstration purposes)\cf2 \cb1 \strokec2 \
\cb3     \cf6 \strokec6 # In a production system, this would be a persistent database/vector store\cf2 \cb1 \strokec2 \
\cb3     document_store = \cf5 \strokec5 \{\}\cf2 \strokec2  \cf6 \strokec6 # \{doc_id: \{"filename": str, "chunks": List[str], "upload_timestamp": str\}\}\cf2 \cb1 \strokec2 \
\cb3     vector_store = \cf4 \cb3 \strokec4 None\cf2 \cb3 \strokec2  \cf6 \strokec6 # FAISS vector store instance\cf2 \cb1 \strokec2 \
\cb3     conversation_chain = \cf4 \cb3 \strokec4 None\cf2 \cb3 \strokec2  \cf6 \strokec6 # Langchain conversation chain instance\cf2 \cb1 \strokec2 \
\cb3     memory = ConversationBufferMemory\cf5 \strokec5 (\cf2 \strokec2 memory_key=\cf7 \strokec7 "chat_history"\cf5 \strokec5 ,\cf2 \strokec2  return_messages=\cf4 \cb3 \strokec4 True\cf5 \cb3 \strokec5 )\cf2 \cb1 \strokec2 \
\
\cb3     \cf6 \strokec6 # Default RAG parameters (can be updated via admin API)\cf2 \cb1 \strokec2 \
\cb3     rag_parameters = \cf5 \strokec5 \{\cf2 \cb1 \strokec2 \
\cb3         \cf7 \strokec7 "chunk_size"\cf5 \strokec5 :\cf2 \strokec2  \cf8 \cb3 \strokec8 1000\cf5 \cb3 \strokec5 ,\cf2 \cb1 \strokec2 \
\cb3         \cf7 \strokec7 "chunk_overlap"\cf5 \strokec5 :\cf2 \strokec2  \cf8 \cb3 \strokec8 200\cf5 \cb3 \strokec5 ,\cf2 \cb1 \strokec2 \
\cb3         \cf7 \strokec7 "retrieval_k"\cf5 \strokec5 :\cf2 \strokec2  \cf8 \cb3 \strokec8 4\cf5 \cb3 \strokec5 ,\cf2 \strokec2  \cf6 \strokec6 # Number of documents to retrieve initially\cf2 \cb1 \strokec2 \
\cb3         \cf7 \strokec7 "cross_encoder_top_n"\cf5 \strokec5 :\cf2 \strokec2  \cf8 \cb3 \strokec8 3\cf5 \cb3 \strokec5 ,\cf2 \strokec2  \cf6 \strokec6 # Number of top documents after cross-encoder reranking\cf2 \cb1 \strokec2 \
\cb3         \cf7 \strokec7 "llm_temperature"\cf5 \strokec5 :\cf2 \strokec2  \cf8 \cb3 \strokec8 0.7\cf2 \cb3 \strokec2  \cf6 \strokec6 # Temperature for the LLM\cf2 \cb1 \strokec2 \
\cb3     \cf5 \strokec5 \}\cf2 \cb1 \strokec2 \
\
\cb3     \cf6 \strokec6 # --- Helper Functions ---\cf2 \cb1 \strokec2 \
\
\cb3     \cf4 \cb3 \strokec4 def\cf2 \cb3 \strokec2  get_pdf_text\cf5 \strokec5 (\cf2 \strokec2 pdf_docs\cf5 \strokec5 ):\cf2 \cb1 \strokec2 \
\cb3         \cf7 \strokec7 """Extracts text from a list of PDF documents."""\cf2 \cb1 \strokec2 \
\cb3         text = \cf7 \strokec7 ""\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 for\cf2 \cb3 \strokec2  pdf \cf4 \cb3 \strokec4 in\cf2 \cb3 \strokec2  pdf_docs\cf5 \strokec5 :\cf2 \cb1 \strokec2 \
\cb3             pdf_reader = PdfReader\cf5 \strokec5 (\cf2 \strokec2 pdf\cf5 \strokec5 )\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 for\cf2 \cb3 \strokec2  page \cf4 \cb3 \strokec4 in\cf2 \cb3 \strokec2  pdf_reader.pages\cf5 \strokec5 :\cf2 \cb1 \strokec2 \
\cb3                 text += page.extract_text\cf5 \strokec5 ()\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 return\cf2 \cb3 \strokec2  text\cb1 \
\
\cb3     \cf4 \cb3 \strokec4 def\cf2 \cb3 \strokec2  get_text_chunks\cf5 \strokec5 (\cf2 \strokec2 text\cf5 \strokec5 ):\cf2 \cb1 \strokec2 \
\cb3         \cf7 \strokec7 """Splits text into chunks based on configured parameters."""\cf2 \cb1 \strokec2 \
\cb3         text_splitter = RecursiveCharacterTextSplitter\cf5 \strokec5 (\cf2 \cb1 \strokec2 \
\cb3             chunk_size=rag_parameters\cf5 \strokec5 [\cf7 \strokec7 "chunk_size"\cf5 \strokec5 ],\cf2 \cb1 \strokec2 \
\cb3             chunk_overlap=rag_parameters\cf5 \strokec5 [\cf7 \strokec7 "chunk_overlap"\cf5 \strokec5 ]\cf2 \cb1 \strokec2 \
\cb3         \cf5 \strokec5 )\cf2 \cb1 \strokec2 \
\cb3         chunks = text_splitter.split_text\cf5 \strokec5 (\cf2 \strokec2 text\cf5 \strokec5 )\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 return\cf2 \cb3 \strokec2  chunks\cb1 \
\
\cb3     \cf4 \cb3 \strokec4 def\cf2 \cb3 \strokec2  get_vector_store\cf5 \strokec5 (\cf2 \strokec2 text_chunks\cf5 \strokec5 ):\cf2 \cb1 \strokec2 \
\cb3         \cf7 \strokec7 """Creates or updates a FAISS vector store from text chunks."""\cf2 \cb1 \strokec2 \
\cb3         embeddings = GooglePalmEmbeddings\cf5 \strokec5 (\cf2 \strokec2 google_api_key=GOOGLE_API_KEY\cf5 \strokec5 )\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 # If vector_store already exists, we can add more documents to it\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 # For simplicity, this example recreates it. In a real app, you'd use .add_texts()\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 global\cf2 \cb3 \strokec2  vector_store\cb1 \
\cb3         vector_store = FAISS.from_texts\cf5 \strokec5 (\cf2 \strokec2 text_chunks\cf5 \strokec5 ,\cf2 \strokec2  embedding=embeddings\cf5 \strokec5 )\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 return\cf2 \cb3 \strokec2  vector_store\cb1 \
\
\cb3     \cf4 \cb3 \strokec4 def\cf2 \cb3 \strokec2  get_conversation_chain\cf5 \strokec5 (\cf2 \strokec2 vectorstore\cf5 \strokec5 ):\cf2 \cb1 \strokec2 \
\cb3         \cf7 \strokec7 """Initializes a conversational RAG chain."""\cf2 \cb1 \strokec2 \
\cb3         llm = ChatGoogleGenerativeAI\cf5 \strokec5 (\cf2 \strokec2 model=\cf7 \strokec7 "gemini-pro"\cf5 \strokec5 ,\cf2 \strokec2  temperature=rag_parameters\cf5 \strokec5 [\cf7 \strokec7 "llm_temperature"\cf5 \strokec5 ],\cf2 \strokec2  google_api_key=GOOGLE_API_KEY\cf5 \strokec5 )\cf2 \cb1 \strokec2 \
\cb3         \cb1 \
\cb3         \cf6 \strokec6 # Configure retriever with k and reranker\cf2 \cb1 \strokec2 \
\cb3         retriever = vectorstore.as_retriever\cf5 \strokec5 (\cf2 \strokec2 search_kwargs=\cf5 \strokec5 \{\cf7 \strokec7 "k"\cf5 \strokec5 :\cf2 \strokec2  rag_parameters\cf5 \strokec5 [\cf7 \strokec7 "retrieval_k"\cf5 \strokec5 ]\})\cf2 \cb1 \strokec2 \
\cb3         \cb1 \
\cb3         \cf6 \strokec6 # Note: Cross-encoder reranking is typically done with a separate model (e.g., Sentence-Transformers cross-encoder).\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 # Langchain doesn't have a direct built-in cross-encoder for Google Palm Embeddings.\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 # For a full implementation, you'd integrate a separate reranking step here.\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 # For this example, we'll simulate it by simply taking top_n from the initial retrieval if cross_encoder_top_n is less than retrieval_k.\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 # In a real scenario, you'd pass the retrieved documents through a cross-encoder model\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 # and then select the top_n based on their scores.\cf2 \cb1 \strokec2 \
\cb3         \cb1 \
\cb3         \cf6 \strokec6 # This is a simplified representation. A true cross-encoder integration\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 # would involve a custom retriever or a transformation step.\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 class\cf2 \cb3 \strokec2  CustomRetriever\cf5 \strokec5 :\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 def\cf2 \cb3 \strokec2  \cf4 \cb3 \strokec4 __init__\cf5 \cb3 \strokec5 (\cf4 \cb3 \strokec4 self\cf5 \cb3 \strokec5 ,\cf2 \strokec2  base_retriever\cf5 \strokec5 ,\cf2 \strokec2  top_n\cf5 \strokec5 ):\cf2 \cb1 \strokec2 \
\cb3                 \cf4 \cb3 \strokec4 self\cf2 \cb3 \strokec2 .base_retriever = base_retriever\cb1 \
\cb3                 \cf4 \cb3 \strokec4 self\cf2 \cb3 \strokec2 .top_n = top_n\cb1 \
\
\cb3             \cf4 \cb3 \strokec4 def\cf2 \cb3 \strokec2  get_relevant_documents\cf5 \strokec5 (\cf4 \cb3 \strokec4 self\cf5 \cb3 \strokec5 ,\cf2 \strokec2  query\cf5 \strokec5 ):\cf2 \cb1 \strokec2 \
\cb3                 docs = \cf4 \cb3 \strokec4 self\cf2 \cb3 \strokec2 .base_retriever.get_relevant_documents\cf5 \strokec5 (\cf2 \strokec2 query\cf5 \strokec5 )\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 # Simulate reranking by simply taking the top_n from the initial retrieval\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 # In a real application, a cross-encoder would re-score these documents.\cf2 \cb1 \strokec2 \
\cb3                 \cf4 \cb3 \strokec4 return\cf2 \cb3 \strokec2  docs\cf5 \strokec5 [:\cf4 \cb3 \strokec4 self\cf2 \cb3 \strokec2 .top_n\cf5 \strokec5 ]\cf2 \cb1 \strokec2 \
\
\cb3         custom_retriever = CustomRetriever\cf5 \strokec5 (\cf2 \strokec2 retriever\cf5 \strokec5 ,\cf2 \strokec2  rag_parameters\cf5 \strokec5 [\cf7 \strokec7 "cross_encoder_top_n"\cf5 \strokec5 ])\cf2 \cb1 \strokec2 \
\
\cb3         \cf4 \cb3 \strokec4 global\cf2 \cb3 \strokec2  conversation_chain\cb1 \
\cb3         conversation_chain = ConversationalRetrievalChain.from_llm\cf5 \strokec5 (\cf2 \cb1 \strokec2 \
\cb3             llm=llm\cf5 \strokec5 ,\cf2 \cb1 \strokec2 \
\cb3             retriever=custom_retriever\cf5 \strokec5 ,\cf2 \cb1 \strokec2 \
\cb3             memory=memory\cb1 \
\cb3         \cf5 \strokec5 )\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 return\cf2 \cb3 \strokec2  conversation_chain\cb1 \
\
\cb3     \cf6 \strokec6 # --- Middleware for API Key Authentication ---\cf2 \cb1 \strokec2 \
\cb3     \cf9 \strokec9 @app\cf2 \strokec2 .before_request\cb1 \
\cb3     \cf4 \cb3 \strokec4 def\cf2 \cb3 \strokec2  authenticate_request\cf5 \strokec5 ():\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 # Allow health check without authentication\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  request.path == \cf7 \strokec7 '/health'\cf5 \strokec5 :\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 return\cf2 \cb1 \strokec2 \
\
\cb3         auth_header = request.headers.get\cf5 \strokec5 (\cf7 \strokec7 'Authorization'\cf5 \strokec5 )\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf4 \cb3 \strokec4 not\cf2 \cb3 \strokec2  auth_header\cf5 \strokec5 :\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 return\cf2 \cb3 \strokec2  jsonify\cf5 \strokec5 (\{\cf7 \strokec7 "error"\cf5 \strokec5 :\cf2 \strokec2  \cf7 \strokec7 "Authorization header missing"\cf5 \strokec5 \}),\cf2 \strokec2  \cf8 \cb3 \strokec8 401\cf2 \cb1 \strokec2 \
\
\cb3         \cf4 \cb3 \strokec4 try\cf5 \cb3 \strokec5 :\cf2 \cb1 \strokec2 \
\cb3             scheme\cf5 \strokec5 ,\cf2 \strokec2  token = auth_header.split\cf5 \strokec5 ()\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  scheme.lower\cf5 \strokec5 ()\cf2 \strokec2  != \cf7 \strokec7 'bearer'\cf2 \strokec2  \cf4 \cb3 \strokec4 or\cf2 \cb3 \strokec2  token != PRIMARY_BACKEND_API_KEY\cf5 \strokec5 :\cf2 \cb1 \strokec2 \
\cb3                 \cf4 \cb3 \strokec4 return\cf2 \cb3 \strokec2  jsonify\cf5 \strokec5 (\{\cf7 \strokec7 "error"\cf5 \strokec5 :\cf2 \strokec2  \cf7 \strokec7 "Invalid or unauthorized token"\cf5 \strokec5 \}),\cf2 \strokec2  \cf8 \cb3 \strokec8 403\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 except\cf2 \cb3 \strokec2  ValueError\cf5 \strokec5 :\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 return\cf2 \cb3 \strokec2  jsonify\cf5 \strokec5 (\{\cf7 \strokec7 "error"\cf5 \strokec5 :\cf2 \strokec2  \cf7 \strokec7 "Invalid Authorization header format"\cf5 \strokec5 \}),\cf2 \strokec2  \cf8 \cb3 \strokec8 401\cf2 \cb1 \strokec2 \
\
\cb3     \cf6 \strokec6 # --- API Endpoints ---\cf2 \cb1 \strokec2 \
\
\cb3     \cf9 \strokec9 @app\cf2 \strokec2 .route\cf5 \strokec5 (\cf7 \strokec7 "/health"\cf5 \strokec5 ,\cf2 \strokec2  methods=\cf5 \strokec5 [\cf7 \strokec7 "GET"\cf5 \strokec5 ])\cf2 \cb1 \strokec2 \
\cb3     \cf4 \cb3 \strokec4 def\cf2 \cb3 \strokec2  health_check\cf5 \strokec5 ():\cf2 \cb1 \strokec2 \
\cb3         \cf7 \strokec7 """Endpoint to check the health of the backend service."""\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 return\cf2 \cb3 \strokec2  jsonify\cf5 \strokec5 (\{\cf7 \strokec7 "status"\cf5 \strokec5 :\cf2 \strokec2  \cf7 \strokec7 "healthy"\cf5 \strokec5 ,\cf2 \strokec2  \cf7 \strokec7 "message"\cf5 \strokec5 :\cf2 \strokec2  \cf7 \strokec7 "Backend is running and accessible."\cf5 \strokec5 \}),\cf2 \strokec2  \cf8 \cb3 \strokec8 200\cf2 \cb1 \strokec2 \
\
\cb3     \cf9 \strokec9 @app\cf2 \strokec2 .route\cf5 \strokec5 (\cf7 \strokec7 "/upload-document"\cf5 \strokec5 ,\cf2 \strokec2  methods=\cf5 \strokec5 [\cf7 \strokec7 "POST"\cf5 \strokec5 ])\cf2 \cb1 \strokec2 \
\cb3     \cf4 \cb3 \strokec4 def\cf2 \cb3 \strokec2  upload_document\cf5 \strokec5 ():\cf2 \cb1 \strokec2 \
\cb3         \cf7 \strokec7 """\cf2 \cb1 \strokec2 \
\pard\pardeftab720\partightenfactor0
\cf7 \cb3 \strokec7         Handles PDF document upload, text extraction, chunking, and vector store creation.\cf2 \cb1 \strokec2 \
\cf7 \cb3 \strokec7         """\cf2 \cb1 \strokec2 \
\pard\pardeftab720\partightenfactor0
\cf2 \cb3         \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf7 \strokec7 'document'\cf2 \strokec2  \cf4 \cb3 \strokec4 not\cf2 \cb3 \strokec2  \cf4 \cb3 \strokec4 in\cf2 \cb3 \strokec2  request.files\cf5 \strokec5 :\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 return\cf2 \cb3 \strokec2  jsonify\cf5 \strokec5 (\{\cf7 \strokec7 "error"\cf5 \strokec5 :\cf2 \strokec2  \cf7 \strokec7 "No document part in the request"\cf5 \strokec5 \}),\cf2 \strokec2  \cf8 \cb3 \strokec8 400\cf2 \cb1 \strokec2 \
\
\cb3         \cf4 \cb3 \strokec4 file\cf2 \cb3 \strokec2  = request.files\cf5 \strokec5 [\cf7 \strokec7 'document'\cf5 \strokec5 ]\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf4 \cb3 \strokec4 file\cf2 \cb3 \strokec2 .filename == \cf7 \strokec7 ''\cf5 \strokec5 :\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 return\cf2 \cb3 \strokec2  jsonify\cf5 \strokec5 (\{\cf7 \strokec7 "error"\cf5 \strokec5 :\cf2 \strokec2  \cf7 \strokec7 "No selected file"\cf5 \strokec5 \}),\cf2 \strokec2  \cf8 \cb3 \strokec8 400\cf2 \cb1 \strokec2 \
\
\cb3         \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf4 \cb3 \strokec4 file\cf2 \cb3 \strokec2  \cf4 \cb3 \strokec4 and\cf2 \cb3 \strokec2  \cf4 \cb3 \strokec4 file\cf2 \cb3 \strokec2 .filename.endswith\cf5 \strokec5 (\cf7 \strokec7 '.pdf'\cf5 \strokec5 ):\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 try\cf5 \cb3 \strokec5 :\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 # Save the uploaded PDF to a temporary file\cf2 \cb1 \strokec2 \
\cb3                 \cf4 \cb3 \strokec4 with\cf2 \cb3 \strokec2  tempfile.NamedTemporaryFile\cf5 \strokec5 (\cf2 \strokec2 delete=\cf4 \cb3 \strokec4 False\cf5 \cb3 \strokec5 ,\cf2 \strokec2  suffix=\cf7 \strokec7 ".pdf"\cf5 \strokec5 )\cf2 \strokec2  \cf4 \cb3 \strokec4 as\cf2 \cb3 \strokec2  tmp_file\cf5 \strokec5 :\cf2 \cb1 \strokec2 \
\cb3                     \cf4 \cb3 \strokec4 file\cf2 \cb3 \strokec2 .save\cf5 \strokec5 (\cf2 \strokec2 tmp_file.name\cf5 \strokec5 )\cf2 \cb1 \strokec2 \
\cb3                     tmp_file_path = tmp_file.name\cb1 \
\
\cb3                 raw_text = get_pdf_text\cf5 \strokec5 ([\cf2 \strokec2 tmp_file_path\cf5 \strokec5 ])\cf2 \cb1 \strokec2 \
\cb3                 text_chunks = get_text_chunks\cf5 \strokec5 (\cf2 \strokec2 raw_text\cf5 \strokec5 )\cf2 \cb1 \strokec2 \
\
\cb3                 \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf4 \cb3 \strokec4 not\cf2 \cb3 \strokec2  text_chunks\cf5 \strokec5 :\cf2 \cb1 \strokec2 \
\cb3                     \cf4 \cb3 \strokec4 return\cf2 \cb3 \strokec2  jsonify\cf5 \strokec5 (\{\cf7 \strokec7 "error"\cf5 \strokec5 :\cf2 \strokec2  \cf7 \strokec7 "No text extracted or chunks created from the document."\cf5 \strokec5 \}),\cf2 \strokec2  \cf8 \cb3 \strokec8 400\cf2 \cb1 \strokec2 \
\
\cb3                 \cf6 \strokec6 # Update the global vector store\cf2 \cb1 \strokec2 \
\cb3                 get_vector_store\cf5 \strokec5 (\cf2 \strokec2 text_chunks\cf5 \strokec5 )\cf2 \cb1 \strokec2 \
\cb3                 \cb1 \
\cb3                 doc_id = \cf4 \cb3 \strokec4 str\cf5 \cb3 \strokec5 (\cf2 \strokec2 uuid.uuid4\cf5 \strokec5 ())\cf2 \cb1 \strokec2 \
\cb3                 document_store\cf5 \strokec5 [\cf2 \strokec2 doc_id\cf5 \strokec5 ]\cf2 \strokec2  = \cf5 \strokec5 \{\cf2 \cb1 \strokec2 \
\cb3                     \cf7 \strokec7 "filename"\cf5 \strokec5 :\cf2 \strokec2  \cf4 \cb3 \strokec4 file\cf2 \cb3 \strokec2 .filename\cf5 \strokec5 ,\cf2 \cb1 \strokec2 \
\cb3                     \cf7 \strokec7 "chunks"\cf5 \strokec5 :\cf2 \strokec2  text_chunks\cf5 \strokec5 ,\cf2 \cb1 \strokec2 \
\cb3                     \cf7 \strokec7 "num_chunks"\cf5 \strokec5 :\cf2 \strokec2  \cf4 \cb3 \strokec4 len\cf5 \cb3 \strokec5 (\cf2 \strokec2 text_chunks\cf5 \strokec5 ),\cf2 \cb1 \strokec2 \
\cb3                     \cf7 \strokec7 "upload_timestamp"\cf5 \strokec5 :\cf2 \strokec2  datetime.now\cf5 \strokec5 ()\cf2 \strokec2 .isoformat\cf5 \strokec5 ()\cf2 \cb1 \strokec2 \
\cb3                 \cf5 \strokec5 \}\cf2 \cb1 \strokec2 \
\
\cb3                 \cf6 \strokec6 # Re-initialize conversation chain with the updated vector store\cf2 \cb1 \strokec2 \
\cb3                 \cf4 \cb3 \strokec4 global\cf2 \cb3 \strokec2  conversation_chain\cb1 \
\cb3                 conversation_chain = get_conversation_chain\cf5 \strokec5 (\cf2 \strokec2 vector_store\cf5 \strokec5 )\cf2 \cb1 \strokec2 \
\cb3                 memory.clear\cf5 \strokec5 ()\cf2 \strokec2  \cf6 \strokec6 # Clear chat memory when new documents are ingested\cf2 \cb1 \strokec2 \
\
\cb3                 \cf4 \cb3 \strokec4 return\cf2 \cb3 \strokec2  jsonify\cf5 \strokec5 (\{\cf2 \cb1 \strokec2 \
\cb3                     \cf7 \strokec7 "message"\cf5 \strokec5 :\cf2 \strokec2  \cf7 \strokec7 f"Document '\cf2 \strokec2 \{file.filename\}\cf7 \strokec7 ' uploaded and ingested successfully!"\cf5 \strokec5 ,\cf2 \cb1 \strokec2 \
\cb3                     \cf7 \strokec7 "doc_id"\cf5 \strokec5 :\cf2 \strokec2  doc_id\cf5 \strokec5 ,\cf2 \cb1 \strokec2 \
\cb3                     \cf7 \strokec7 "num_chunks"\cf5 \strokec5 :\cf2 \strokec2  \cf4 \cb3 \strokec4 len\cf5 \cb3 \strokec5 (\cf2 \strokec2 text_chunks\cf5 \strokec5 )\cf2 \cb1 \strokec2 \
\cb3                 \cf5 \strokec5 \}),\cf2 \strokec2  \cf8 \cb3 \strokec8 200\cf2 \cb1 \strokec2 \
\
\cb3             \cf4 \cb3 \strokec4 except\cf2 \cb3 \strokec2  Exception \cf4 \cb3 \strokec4 as\cf2 \cb3 \strokec2  e\cf5 \strokec5 :\cf2 \cb1 \strokec2 \
\cb3                 app.logger.error\cf5 \strokec5 (\cf7 \strokec7 f"Error processing document upload: \cf2 \strokec2 \{e\}\cf7 \strokec7 "\cf5 \strokec5 )\cf2 \cb1 \strokec2 \
\cb3                 \cf4 \cb3 \strokec4 return\cf2 \cb3 \strokec2  jsonify\cf5 \strokec5 (\{\cf7 \strokec7 "error"\cf5 \strokec5 :\cf2 \strokec2  \cf7 \strokec7 f"Failed to process document: \cf2 \strokec2 \{str(e)\}\cf7 \strokec7 "\cf5 \strokec5 \}),\cf2 \strokec2  \cf8 \cb3 \strokec8 500\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 finally\cf5 \cb3 \strokec5 :\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 # Clean up the temporary file\cf2 \cb1 \strokec2 \
\cb3                 \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf7 \strokec7 'tmp_file_path'\cf2 \strokec2  \cf4 \cb3 \strokec4 in\cf2 \cb3 \strokec2  \cf4 \cb3 \strokec4 locals\cf5 \cb3 \strokec5 ()\cf2 \strokec2  \cf4 \cb3 \strokec4 and\cf2 \cb3 \strokec2  os.path.exists\cf5 \strokec5 (\cf2 \strokec2 tmp_file_path\cf5 \strokec5 ):\cf2 \cb1 \strokec2 \
\cb3                     os.remove\cf5 \strokec5 (\cf2 \strokec2 tmp_file_path\cf5 \strokec5 )\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 else\cf5 \cb3 \strokec5 :\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 return\cf2 \cb3 \strokec2  jsonify\cf5 \strokec5 (\{\cf7 \strokec7 "error"\cf5 \strokec5 :\cf2 \strokec2  \cf7 \strokec7 "Invalid file type. Only PDF files are allowed."\cf5 \strokec5 \}),\cf2 \strokec2  \cf8 \cb3 \strokec8 400\cf2 \cb1 \strokec2 \
\
\cb3     \cf9 \strokec9 @app\cf2 \strokec2 .route\cf5 \strokec5 (\cf7 \strokec7 "/ingest"\cf5 \strokec5 ,\cf2 \strokec2  methods=\cf5 \strokec5 [\cf7 \strokec7 "POST"\cf5 \strokec5 ])\cf2 \cb1 \strokec2 \
\cb3     \cf4 \cb3 \strokec4 def\cf2 \cb3 \strokec2  ingest_default_document\cf5 \strokec5 ():\cf2 \cb1 \strokec2 \
\cb3         \cf7 \strokec7 """\cf2 \cb1 \strokec2 \
\pard\pardeftab720\partightenfactor0
\cf7 \cb3 \strokec7         Triggers ingestion of a default, pre-defined document for demonstration.\cf2 \cb1 \strokec2 \
\cf7 \cb3 \strokec7         """\cf2 \cb1 \strokec2 \
\pard\pardeftab720\partightenfactor0
\cf2 \cb3         default_pdf_path = os.path.join\cf5 \strokec5 (\cf2 \strokec2 app.root_path\cf5 \strokec5 ,\cf2 \strokec2  \cf7 \strokec7 "AV201_ DEVICE LOCATIONS BASEMENT FLOOR PLAN Rev.4 markup (2).pdf"\cf5 \strokec5 )\cf2 \cb1 \strokec2 \
\cb3         \cb1 \
\cb3         \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf4 \cb3 \strokec4 not\cf2 \cb3 \strokec2  os.path.exists\cf5 \strokec5 (\cf2 \strokec2 default_pdf_path\cf5 \strokec5 ):\cf2 \cb1 \strokec2 \
\cb3             \cf6 \strokec6 # Attempt to create a dummy PDF if it doesn't exist for testing purposes\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 try\cf5 \cb3 \strokec5 :\cf2 \cb1 \strokec2 \
\cb3                 \cf4 \cb3 \strokec4 from\cf2 \cb3 \strokec2  reportlab.pdfgen \cf4 \cb3 \strokec4 import\cf2 \cb3 \strokec2  canvas\cb1 \
\cb3                 \cf4 \cb3 \strokec4 from\cf2 \cb3 \strokec2  reportlab.lib.pagesizes \cf4 \cb3 \strokec4 import\cf2 \cb3 \strokec2  letter\cb1 \
\cb3                 c = canvas.Canvas\cf5 \strokec5 (\cf2 \strokec2 default_pdf_path\cf5 \strokec5 ,\cf2 \strokec2  pagesize=letter\cf5 \strokec5 )\cf2 \cb1 \strokec2 \
\cb3                 c.drawString\cf5 \strokec5 (\cf8 \cb3 \strokec8 100\cf5 \cb3 \strokec5 ,\cf2 \strokec2  \cf8 \cb3 \strokec8 750\cf5 \cb3 \strokec5 ,\cf2 \strokec2  \cf7 \strokec7 "This is a dummy PDF document for testing RAG ingestion."\cf5 \strokec5 )\cf2 \cb1 \strokec2 \
\cb3                 c.drawString\cf5 \strokec5 (\cf8 \cb3 \strokec8 100\cf5 \cb3 \strokec5 ,\cf2 \strokec2  \cf8 \cb3 \strokec8 730\cf5 \cb3 \strokec5 ,\cf2 \strokec2  \cf7 \strokec7 "It contains some sample text about a device location."\cf5 \strokec5 )\cf2 \cb1 \strokec2 \
\cb3                 c.drawString\cf5 \strokec5 (\cf8 \cb3 \strokec8 100\cf5 \cb3 \strokec5 ,\cf2 \strokec2  \cf8 \cb3 \strokec8 710\cf5 \cb3 \strokec5 ,\cf2 \strokec2  \cf7 \strokec7 "The basement floor plan shows various devices."\cf5 \strokec5 )\cf2 \cb1 \strokec2 \
\cb3                 c.save\cf5 \strokec5 ()\cf2 \cb1 \strokec2 \
\cb3                 app.logger.warning\cf5 \strokec5 (\cf7 \strokec7 f"Dummy PDF created at: \cf2 \strokec2 \{default_pdf_path\}\cf7 \strokec7 "\cf5 \strokec5 )\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 except\cf2 \cb3 \strokec2  ImportError\cf5 \strokec5 :\cf2 \cb1 \strokec2 \
\cb3                 \cf4 \cb3 \strokec4 return\cf2 \cb3 \strokec2  jsonify\cf5 \strokec5 (\{\cf7 \strokec7 "error"\cf5 \strokec5 :\cf2 \strokec2  \cf7 \strokec7 "Default PDF not found and ReportLab not installed to create a dummy. Please provide the default PDF."\cf5 \strokec5 \}),\cf2 \strokec2  \cf8 \cb3 \strokec8 500\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 except\cf2 \cb3 \strokec2  Exception \cf4 \cb3 \strokec4 as\cf2 \cb3 \strokec2  e\cf5 \strokec5 :\cf2 \cb1 \strokec2 \
\cb3                 \cf4 \cb3 \strokec4 return\cf2 \cb3 \strokec2  jsonify\cf5 \strokec5 (\{\cf7 \strokec7 "error"\cf5 \strokec5 :\cf2 \strokec2  \cf7 \strokec7 f"Default PDF not found and failed to create dummy: \cf2 \strokec2 \{str(e)\}\cf7 \strokec7 "\cf5 \strokec5 \}),\cf2 \strokec2  \cf8 \cb3 \strokec8 500\cf2 \cb1 \strokec2 \
\
\cb3         \cf4 \cb3 \strokec4 try\cf5 \cb3 \strokec5 :\cf2 \cb1 \strokec2 \
\cb3             raw_text = get_pdf_text\cf5 \strokec5 ([\cf2 \strokec2 default_pdf_path\cf5 \strokec5 ])\cf2 \cb1 \strokec2 \
\cb3             text_chunks = get_text_chunks\cf5 \strokec5 (\cf2 \strokec2 raw_text\cf5 \strokec5 )\cf2 \cb1 \strokec2 \
\
\cb3             \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf4 \cb3 \strokec4 not\cf2 \cb3 \strokec2  text_chunks\cf5 \strokec5 :\cf2 \cb1 \strokec2 \
\cb3                 \cf4 \cb3 \strokec4 return\cf2 \cb3 \strokec2  jsonify\cf5 \strokec5 (\{\cf7 \strokec7 "error"\cf5 \strokec5 :\cf2 \strokec2  \cf7 \strokec7 "No text extracted or chunks created from the default document."\cf5 \strokec5 \}),\cf2 \strokec2  \cf8 \cb3 \strokec8 500\cf2 \cb1 \strokec2 \
\
\cb3             get_vector_store\cf5 \strokec5 (\cf2 \strokec2 text_chunks\cf5 \strokec5 )\cf2 \cb1 \strokec2 \
\cb3             \cb1 \
\cb3             doc_id = \cf4 \cb3 \strokec4 str\cf5 \cb3 \strokec5 (\cf2 \strokec2 uuid.uuid4\cf5 \strokec5 ())\cf2 \cb1 \strokec2 \
\cb3             document_store\cf5 \strokec5 [\cf2 \strokec2 doc_id\cf5 \strokec5 ]\cf2 \strokec2  = \cf5 \strokec5 \{\cf2 \cb1 \strokec2 \
\cb3                 \cf7 \strokec7 "filename"\cf5 \strokec5 :\cf2 \strokec2  os.path.basename\cf5 \strokec5 (\cf2 \strokec2 default_pdf_path\cf5 \strokec5 ),\cf2 \cb1 \strokec2 \
\cb3                 \cf7 \strokec7 "chunks"\cf5 \strokec5 :\cf2 \strokec2  text_chunks\cf5 \strokec5 ,\cf2 \cb1 \strokec2 \
\cb3                 \cf7 \strokec7 "num_chunks"\cf5 \strokec5 :\cf2 \strokec2  \cf4 \cb3 \strokec4 len\cf5 \cb3 \strokec5 (\cf2 \strokec2 text_chunks\cf5 \strokec5 ),\cf2 \cb1 \strokec2 \
\cb3                 \cf7 \strokec7 "upload_timestamp"\cf5 \strokec5 :\cf2 \strokec2  datetime.now\cf5 \strokec5 ()\cf2 \strokec2 .isoformat\cf5 \strokec5 ()\cf2 \cb1 \strokec2 \
\cb3             \cf5 \strokec5 \}\cf2 \cb1 \strokec2 \
\
\cb3             \cf4 \cb3 \strokec4 global\cf2 \cb3 \strokec2  conversation_chain\cb1 \
\cb3             conversation_chain = get_conversation_chain\cf5 \strokec5 (\cf2 \strokec2 vector_store\cf5 \strokec5 )\cf2 \cb1 \strokec2 \
\cb3             memory.clear\cf5 \strokec5 ()\cf2 \strokec2  \cf6 \strokec6 # Clear chat memory when new documents are ingested\cf2 \cb1 \strokec2 \
\
\cb3             \cf4 \cb3 \strokec4 return\cf2 \cb3 \strokec2  jsonify\cf5 \strokec5 (\{\cf2 \cb1 \strokec2 \
\cb3                 \cf7 \strokec7 "message"\cf5 \strokec5 :\cf2 \strokec2  \cf7 \strokec7 f"Default document '\cf2 \strokec2 \{os.path.basename(default_pdf_path)\}\cf7 \strokec7 ' ingested successfully!"\cf5 \strokec5 ,\cf2 \cb1 \strokec2 \
\cb3                 \cf7 \strokec7 "doc_id"\cf5 \strokec5 :\cf2 \strokec2  doc_id\cf5 \strokec5 ,\cf2 \cb1 \strokec2 \
\cb3                 \cf7 \strokec7 "num_chunks"\cf5 \strokec5 :\cf2 \strokec2  \cf4 \cb3 \strokec4 len\cf5 \cb3 \strokec5 (\cf2 \strokec2 text_chunks\cf5 \strokec5 )\cf2 \cb1 \strokec2 \
\cb3             \cf5 \strokec5 \}),\cf2 \strokec2  \cf8 \cb3 \strokec8 200\cf2 \cb1 \strokec2 \
\
\cb3         \cf4 \cb3 \strokec4 except\cf2 \cb3 \strokec2  Exception \cf4 \cb3 \strokec4 as\cf2 \cb3 \strokec2  e\cf5 \strokec5 :\cf2 \cb1 \strokec2 \
\cb3             app.logger.error\cf5 \strokec5 (\cf7 \strokec7 f"Error ingesting default document: \cf2 \strokec2 \{e\}\cf7 \strokec7 "\cf5 \strokec5 )\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 return\cf2 \cb3 \strokec2  jsonify\cf5 \strokec5 (\{\cf7 \strokec7 "error"\cf5 \strokec5 :\cf2 \strokec2  \cf7 \strokec7 f"Failed to ingest default document: \cf2 \strokec2 \{str(e)\}\cf7 \strokec7 "\cf5 \strokec5 \}),\cf2 \strokec2  \cf8 \cb3 \strokec8 500\cf2 \cb1 \strokec2 \
\
\cb3     \cf9 \strokec9 @app\cf2 \strokec2 .route\cf5 \strokec5 (\cf7 \strokec7 "/ask"\cf5 \strokec5 ,\cf2 \strokec2  methods=\cf5 \strokec5 [\cf7 \strokec7 "POST"\cf5 \strokec5 ])\cf2 \cb1 \strokec2 \
\cb3     \cf4 \cb3 \strokec4 def\cf2 \cb3 \strokec2  ask_question\cf5 \strokec5 ():\cf2 \cb1 \strokec2 \
\cb3         \cf7 \strokec7 """\cf2 \cb1 \strokec2 \
\pard\pardeftab720\partightenfactor0
\cf7 \cb3 \strokec7         Receives a user query and returns a RAG-generated response.\cf2 \cb1 \strokec2 \
\cf7 \cb3 \strokec7         """\cf2 \cb1 \strokec2 \
\pard\pardeftab720\partightenfactor0
\cf2 \cb3         data = request.get_json\cf5 \strokec5 ()\cf2 \cb1 \strokec2 \
\cb3         user_query = data.get\cf5 \strokec5 (\cf7 \strokec7 "query"\cf5 \strokec5 )\cf2 \cb1 \strokec2 \
\cb3         chat_history_data = data.get\cf5 \strokec5 (\cf7 \strokec7 "chatHistory"\cf5 \strokec5 ,\cf2 \strokec2  \cf5 \strokec5 [])\cf2 \strokec2  \cf6 \strokec6 # Expects [\{role: 'user', content: '...'\}, \{role: 'bot', content: '...'\}]\cf2 \cb1 \strokec2 \
\
\cb3         \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf4 \cb3 \strokec4 not\cf2 \cb3 \strokec2  user_query\cf5 \strokec5 :\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 return\cf2 \cb3 \strokec2  jsonify\cf5 \strokec5 (\{\cf7 \strokec7 "error"\cf5 \strokec5 :\cf2 \strokec2  \cf7 \strokec7 "No query provided"\cf5 \strokec5 \}),\cf2 \strokec2  \cf8 \cb3 \strokec8 400\cf2 \cb1 \strokec2 \
\
\cb3         \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf4 \cb3 \strokec4 not\cf2 \cb3 \strokec2  vector_store \cf4 \cb3 \strokec4 or\cf2 \cb3 \strokec2  \cf4 \cb3 \strokec4 not\cf2 \cb3 \strokec2  conversation_chain\cf5 \strokec5 :\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 return\cf2 \cb3 \strokec2  jsonify\cf5 \strokec5 (\{\cf7 \strokec7 "error"\cf5 \strokec5 :\cf2 \strokec2  \cf7 \strokec7 "No documents ingested yet. Please upload a document first."\cf5 \strokec5 \}),\cf2 \strokec2  \cf8 \cb3 \strokec8 400\cf2 \cb1 \strokec2 \
\
\cb3         \cf4 \cb3 \strokec4 try\cf5 \cb3 \strokec5 :\cf2 \cb1 \strokec2 \
\cb3             \cf6 \strokec6 # Reconstruct memory from chat_history_data\cf2 \cb1 \strokec2 \
\cb3             memory.clear\cf5 \strokec5 ()\cf2 \strokec2  \cf6 \strokec6 # Clear current memory\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 for\cf2 \cb3 \strokec2  msg \cf4 \cb3 \strokec4 in\cf2 \cb3 \strokec2  chat_history_data\cf5 \strokec5 :\cf2 \cb1 \strokec2 \
\cb3                 \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  msg\cf5 \strokec5 [\cf7 \strokec7 'role'\cf5 \strokec5 ]\cf2 \strokec2  == \cf7 \strokec7 'user'\cf5 \strokec5 :\cf2 \cb1 \strokec2 \
\cb3                     memory.chat_memory.add_user_message\cf5 \strokec5 (\cf2 \strokec2 msg\cf5 \strokec5 [\cf7 \strokec7 'content'\cf5 \strokec5 ])\cf2 \cb1 \strokec2 \
\cb3                 \cf4 \cb3 \strokec4 elif\cf2 \cb3 \strokec2  msg\cf5 \strokec5 [\cf7 \strokec7 'role'\cf5 \strokec5 ]\cf2 \strokec2  == \cf7 \strokec7 'bot'\cf5 \strokec5 :\cf2 \cb1 \strokec2 \
\cb3                     memory.chat_memory.add_ai_message\cf5 \strokec5 (\cf2 \strokec2 msg\cf5 \strokec5 [\cf7 \strokec7 'content'\cf5 \strokec5 ])\cf2 \cb1 \strokec2 \
\
\cb3             \cf6 \strokec6 # Invoke the conversation chain\cf2 \cb1 \strokec2 \
\cb3             result = conversation_chain.invoke\cf5 \strokec5 (\{\cf7 \strokec7 "question"\cf5 \strokec5 :\cf2 \strokec2  user_query\cf5 \strokec5 \})\cf2 \cb1 \strokec2 \
\cb3             \cb1 \
\cb3             bot_response = result.get\cf5 \strokec5 (\cf7 \strokec7 "answer"\cf5 \strokec5 ,\cf2 \strokec2  \cf7 \strokec7 "No answer found."\cf5 \strokec5 )\cf2 \cb1 \strokec2 \
\cb3             \cb1 \
\cb3             \cf4 \cb3 \strokec4 return\cf2 \cb3 \strokec2  jsonify\cf5 \strokec5 (\{\cf7 \strokec7 "response"\cf5 \strokec5 :\cf2 \strokec2  bot_response\cf5 \strokec5 \}),\cf2 \strokec2  \cf8 \cb3 \strokec8 200\cf2 \cb1 \strokec2 \
\
\cb3         \cf4 \cb3 \strokec4 except\cf2 \cb3 \strokec2  Exception \cf4 \cb3 \strokec4 as\cf2 \cb3 \strokec2  e\cf5 \strokec5 :\cf2 \cb1 \strokec2 \
\cb3             app.logger.error\cf5 \strokec5 (\cf7 \strokec7 f"Error during RAG query: \cf2 \strokec2 \{e\}\cf7 \strokec7 "\cf5 \strokec5 )\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 return\cf2 \cb3 \strokec2  jsonify\cf5 \strokec5 (\{\cf7 \strokec7 "error"\cf5 \strokec5 :\cf2 \strokec2  \cf7 \strokec7 f"Failed to get RAG response: \cf2 \strokec2 \{str(e)\}\cf7 \strokec7 "\cf5 \strokec5 \}),\cf2 \strokec2  \cf8 \cb3 \strokec8 500\cf2 \cb1 \strokec2 \
\
\cb3     \cf6 \strokec6 # --- Admin Endpoints ---\cf2 \cb1 \strokec2 \
\
\cb3     \cf9 \strokec9 @app\cf2 \strokec2 .route\cf5 \strokec5 (\cf7 \strokec7 "/admin/users"\cf5 \strokec5 ,\cf2 \strokec2  methods=\cf5 \strokec5 [\cf7 \strokec7 "GET"\cf5 \strokec5 ])\cf2 \cb1 \strokec2 \
\cb3     \cf4 \cb3 \strokec4 def\cf2 \cb3 \strokec2  admin_get_users\cf5 \strokec5 ():\cf2 \cb1 \strokec2 \
\cb3         \cf7 \strokec7 """\cf2 \cb1 \strokec2 \
\pard\pardeftab720\partightenfactor0
\cf7 \cb3 \strokec7         Admin endpoint to list all users (mock data for now).\cf2 \cb1 \strokec2 \
\cf7 \cb3 \strokec7         In a real app, this would query Firebase Auth or your user management system.\cf2 \cb1 \strokec2 \
\cf7 \cb3 \strokec7         """\cf2 \cb1 \strokec2 \
\pard\pardeftab720\partightenfactor0
\cf2 \cb3         \cf6 \strokec6 # This is mock data. In a real application, you would integrate with Firebase Admin SDK\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 # to list users from Firebase Authentication.\cf2 \cb1 \strokec2 \
\cb3         mock_users = \cf5 \strokec5 [\cf2 \cb1 \strokec2 \
\cb3             \cf5 \strokec5 \{\cf7 \strokec7 "uid"\cf5 \strokec5 :\cf2 \strokec2  \cf7 \strokec7 "user123"\cf5 \strokec5 ,\cf2 \strokec2  \cf7 \strokec7 "email"\cf5 \strokec5 :\cf2 \strokec2  \cf7 \strokec7 "user1@example.com"\cf5 \strokec5 ,\cf2 \strokec2  \cf7 \strokec7 "displayName"\cf5 \strokec5 :\cf2 \strokec2  \cf7 \strokec7 "Alice"\cf5 \strokec5 \},\cf2 \cb1 \strokec2 \
\cb3             \cf5 \strokec5 \{\cf7 \strokec7 "uid"\cf5 \strokec5 :\cf2 \strokec2  \cf7 \strokec7 "user456"\cf5 \strokec5 ,\cf2 \strokec2  \cf7 \strokec7 "email"\cf5 \strokec5 :\cf2 \strokec2  \cf7 \strokec7 "user2@example.com"\cf5 \strokec5 ,\cf2 \strokec2  \cf7 \strokec7 "displayName"\cf5 \strokec5 :\cf2 \strokec2  \cf7 \strokec7 "Bob"\cf5 \strokec5 \},\cf2 \cb1 \strokec2 \
\cb3             \cf5 \strokec5 \{\cf7 \strokec7 "uid"\cf5 \strokec5 :\cf2 \strokec2  \cf7 \strokec7 "YOUR_ADMIN_UID_HERE"\cf5 \strokec5 ,\cf2 \strokec2  \cf7 \strokec7 "email"\cf5 \strokec5 :\cf2 \strokec2  \cf7 \strokec7 "admin@example.com"\cf5 \strokec5 ,\cf2 \strokec2  \cf7 \strokec7 "displayName"\cf5 \strokec5 :\cf2 \strokec2  \cf7 \strokec7 "Admin User"\cf5 \strokec5 \}\cf2 \strokec2  \cf6 \strokec6 # IMPORTANT: Match this UID\cf2 \cb1 \strokec2 \
\cb3         \cf5 \strokec5 ]\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 return\cf2 \cb3 \strokec2  jsonify\cf5 \strokec5 (\{\cf7 \strokec7 "users"\cf5 \strokec5 :\cf2 \strokec2  mock_users\cf5 \strokec5 \}),\cf2 \strokec2  \cf8 \cb3 \strokec8 200\cf2 \cb1 \strokec2 \
\
\cb3     \cf9 \strokec9 @app\cf2 \strokec2 .route\cf5 \strokec5 (\cf7 \strokec7 "/admin/documents"\cf5 \strokec5 ,\cf2 \strokec2  methods=\cf5 \strokec5 [\cf7 \strokec7 "GET"\cf5 \strokec5 ])\cf2 \cb1 \strokec2 \
\cb3     \cf4 \cb3 \strokec4 def\cf2 \cb3 \strokec2  admin_get_documents\cf5 \strokec5 ():\cf2 \cb1 \strokec2 \
\cb3         \cf7 \strokec7 """Admin endpoint to list all ingested documents."""\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 # Convert document_store dictionary to a list of documents\cf2 \cb1 \strokec2 \
\cb3         documents_list = \cf5 \strokec5 [\cf2 \cb1 \strokec2 \
\cb3             \cf5 \strokec5 \{\cf7 \strokec7 "id"\cf5 \strokec5 :\cf2 \strokec2  doc_id\cf5 \strokec5 ,\cf2 \strokec2  **data\cf5 \strokec5 \}\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 for\cf2 \cb3 \strokec2  doc_id\cf5 \strokec5 ,\cf2 \strokec2  data \cf4 \cb3 \strokec4 in\cf2 \cb3 \strokec2  document_store.items\cf5 \strokec5 ()\cf2 \cb1 \strokec2 \
\cb3         \cf5 \strokec5 ]\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 return\cf2 \cb3 \strokec2  jsonify\cf5 \strokec5 (\{\cf7 \strokec7 "documents"\cf5 \strokec5 :\cf2 \strokec2  documents_list\cf5 \strokec5 \}),\cf2 \strokec2  \cf8 \cb3 \strokec8 200\cf2 \cb1 \strokec2 \
\
\cb3     \cf9 \strokec9 @app\cf2 \strokec2 .route\cf5 \strokec5 (\cf7 \strokec7 "/admin/document/<doc_id>"\cf5 \strokec5 ,\cf2 \strokec2  methods=\cf5 \strokec5 [\cf7 \strokec7 "DELETE"\cf5 \strokec5 ])\cf2 \cb1 \strokec2 \
\cb3     \cf4 \cb3 \strokec4 def\cf2 \cb3 \strokec2  admin_delete_document\cf5 \strokec5 (\cf2 \strokec2 doc_id\cf5 \strokec5 ):\cf2 \cb1 \strokec2 \
\cb3         \cf7 \strokec7 """Admin endpoint to delete an ingested document and its data."""\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  doc_id \cf4 \cb3 \strokec4 in\cf2 \cb3 \strokec2  document_store\cf5 \strokec5 :\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 del\cf2 \cb3 \strokec2  document_store\cf5 \strokec5 [\cf2 \strokec2 doc_id\cf5 \strokec5 ]\cf2 \cb1 \strokec2 \
\cb3             \cf6 \strokec6 # In a real system, you'd also remove chunks from the vector store\cf2 \cb1 \strokec2 \
\cb3             \cf6 \strokec6 # For FAISS, this would typically involve rebuilding the index or\cf2 \cb1 \strokec2 \
\cb3             \cf6 \strokec6 # using a vector store that supports direct deletion of vectors.\cf2 \cb1 \strokec2 \
\cb3             \cf6 \strokec6 # For simplicity, we just remove it from our in-memory store.\cf2 \cb1 \strokec2 \
\cb3             \cb1 \
\cb3             \cf6 \strokec6 # Re-initialize vector store and conversation chain if needed\cf2 \cb1 \strokec2 \
\cb3             \cf6 \strokec6 # (This is a simplistic approach; a robust solution would manage vector store updates)\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 global\cf2 \cb3 \strokec2  vector_store\cf5 \strokec5 ,\cf2 \strokec2  conversation_chain\cb1 \
\cb3             vector_store = \cf4 \cb3 \strokec4 None\cf2 \cb3 \strokec2  \cf6 \strokec6 # Reset vector store\cf2 \cb1 \strokec2 \
\cb3             conversation_chain = \cf4 \cb3 \strokec4 None\cf2 \cb3 \strokec2  \cf6 \strokec6 # Reset conversation chain\cf2 \cb1 \strokec2 \
\cb3             memory.clear\cf5 \strokec5 ()\cf2 \strokec2  \cf6 \strokec6 # Clear memory\cf2 \cb1 \strokec2 \
\cb3             \cb1 \
\cb3             \cf6 \strokec6 # If there are other documents, rebuild the vector store from them\cf2 \cb1 \strokec2 \
\cb3             all_chunks = \cf5 \strokec5 []\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 for\cf2 \cb3 \strokec2  doc_data \cf4 \cb3 \strokec4 in\cf2 \cb3 \strokec2  document_store.values\cf5 \strokec5 ():\cf2 \cb1 \strokec2 \
\cb3                 all_chunks.extend\cf5 \strokec5 (\cf2 \strokec2 doc_data\cf5 \strokec5 [\cf7 \strokec7 "chunks"\cf5 \strokec5 ])\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  all_chunks\cf5 \strokec5 :\cf2 \cb1 \strokec2 \
\cb3                 get_vector_store\cf5 \strokec5 (\cf2 \strokec2 all_chunks\cf5 \strokec5 )\cf2 \cb1 \strokec2 \
\cb3                 conversation_chain = get_conversation_chain\cf5 \strokec5 (\cf2 \strokec2 vector_store\cf5 \strokec5 )\cf2 \cb1 \strokec2 \
\
\cb3             \cf4 \cb3 \strokec4 return\cf2 \cb3 \strokec2  jsonify\cf5 \strokec5 (\{\cf7 \strokec7 "message"\cf5 \strokec5 :\cf2 \strokec2  \cf7 \strokec7 f"Document '\cf2 \strokec2 \{doc_id\}\cf7 \strokec7 ' deleted successfully."\cf5 \strokec5 \}),\cf2 \strokec2  \cf8 \cb3 \strokec8 200\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 else\cf5 \cb3 \strokec5 :\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 return\cf2 \cb3 \strokec2  jsonify\cf5 \strokec5 (\{\cf7 \strokec7 "error"\cf5 \strokec5 :\cf2 \strokec2  \cf7 \strokec7 "Document not found."\cf5 \strokec5 \}),\cf2 \strokec2  \cf8 \cb3 \strokec8 404\cf2 \cb1 \strokec2 \
\
\cb3     \cf9 \strokec9 @app\cf2 \strokec2 .route\cf5 \strokec5 (\cf7 \strokec7 "/admin/user/<user_id>/chat-history/<chat_id>"\cf5 \strokec5 ,\cf2 \strokec2  methods=\cf5 \strokec5 [\cf7 \strokec7 "DELETE"\cf5 \strokec5 ])\cf2 \cb1 \strokec2 \
\cb3     \cf4 \cb3 \strokec4 def\cf2 \cb3 \strokec2  admin_delete_chat_history_entry\cf5 \strokec5 (\cf2 \strokec2 user_id\cf5 \strokec5 ,\cf2 \strokec2  chat_id\cf5 \strokec5 ):\cf2 \cb1 \strokec2 \
\cb3         \cf7 \strokec7 """\cf2 \cb1 \strokec2 \
\pard\pardeftab720\partightenfactor0
\cf7 \cb3 \strokec7         Admin endpoint to delete a specific chat history entry for a user.\cf2 \cb1 \strokec2 \
\cf7 \cb3 \strokec7         This operation would typically interact directly with Firestore.\cf2 \cb1 \strokec2 \
\cf7 \cb3 \strokec7         Since Firestore operations are handled by the frontend, this backend endpoint is a placeholder\cf2 \cb1 \strokec2 \
\cf7 \cb3 \strokec7         or would be used if the backend were responsible for all Firestore interactions.\cf2 \cb1 \strokec2 \
\cf7 \cb3 \strokec7         For now, this is a mock successful response as the frontend directly manages Firestore deletion.\cf2 \cb1 \strokec2 \
\cf7 \cb3 \strokec7         """\cf2 \cb1 \strokec2 \
\pard\pardeftab720\partightenfactor0
\cf2 \cb3         \cf6 \strokec6 # In a real application, you would use Firebase Admin SDK to delete the document\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 # from Firestore: db.collection("artifacts").document(appId).collection("users").document(user_id).collection("chatHistory").document(chat_id).delete()\cf2 \cb1 \strokec2 \
\cb3         app.logger.info\cf5 \strokec5 (\cf7 \strokec7 f"Admin requested deletion of chat_id \cf2 \strokec2 \{chat_id\}\cf7 \strokec7  for user \cf2 \strokec2 \{user_id\}\cf7 \strokec7 . (Mock success)"\cf5 \strokec5 )\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 return\cf2 \cb3 \strokec2  jsonify\cf5 \strokec5 (\{\cf7 \strokec7 "message"\cf5 \strokec5 :\cf2 \strokec2  \cf7 \strokec7 f"Chat history entry '\cf2 \strokec2 \{chat_id\}\cf7 \strokec7 ' for user '\cf2 \strokec2 \{user_id\}\cf7 \strokec7 ' deleted successfully (mock)."\cf5 \strokec5 \}),\cf2 \strokec2  \cf8 \cb3 \strokec8 200\cf2 \cb1 \strokec2 \
\
\cb3     \cf9 \strokec9 @app\cf2 \strokec2 .route\cf5 \strokec5 (\cf7 \strokec7 "/admin/rag-params"\cf5 \strokec5 ,\cf2 \strokec2  methods=\cf5 \strokec5 [\cf7 \strokec7 "GET"\cf5 \strokec5 ,\cf2 \strokec2  \cf7 \strokec7 "POST"\cf5 \strokec5 ])\cf2 \cb1 \strokec2 \
\cb3     \cf4 \cb3 \strokec4 def\cf2 \cb3 \strokec2  admin_rag_params\cf5 \strokec5 ():\cf2 \cb1 \strokec2 \
\cb3         \cf7 \strokec7 """Admin endpoint to get or update RAG parameters."""\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  request.method == \cf7 \strokec7 "GET"\cf5 \strokec5 :\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 return\cf2 \cb3 \strokec2  jsonify\cf5 \strokec5 (\cf2 \strokec2 rag_parameters\cf5 \strokec5 ),\cf2 \strokec2  \cf8 \cb3 \strokec8 200\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 elif\cf2 \cb3 \strokec2  request.method == \cf7 \strokec7 "POST"\cf5 \strokec5 :\cf2 \cb1 \strokec2 \
\cb3             data = request.get_json\cf5 \strokec5 ()\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf4 \cb3 \strokec4 not\cf2 \cb3 \strokec2  data\cf5 \strokec5 :\cf2 \cb1 \strokec2 \
\cb3                 \cf4 \cb3 \strokec4 return\cf2 \cb3 \strokec2  jsonify\cf5 \strokec5 (\{\cf7 \strokec7 "error"\cf5 \strokec5 :\cf2 \strokec2  \cf7 \strokec7 "No JSON data provided"\cf5 \strokec5 \}),\cf2 \strokec2  \cf8 \cb3 \strokec8 400\cf2 \cb1 \strokec2 \
\
\cb3             \cf6 \strokec6 # Validate and update parameters\cf2 \cb1 \strokec2 \
\cb3             updated = \cf4 \cb3 \strokec4 False\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 for\cf2 \cb3 \strokec2  key\cf5 \strokec5 ,\cf2 \strokec2  value \cf4 \cb3 \strokec4 in\cf2 \cb3 \strokec2  data.items\cf5 \strokec5 ():\cf2 \cb1 \strokec2 \
\cb3                 \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  key \cf4 \cb3 \strokec4 in\cf2 \cb3 \strokec2  rag_parameters\cf5 \strokec5 :\cf2 \cb1 \strokec2 \
\cb3                     \cf6 \strokec6 # Basic type validation\cf2 \cb1 \strokec2 \
\cb3                     \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf4 \cb3 \strokec4 isinstance\cf5 \cb3 \strokec5 (\cf2 \strokec2 rag_parameters\cf5 \strokec5 [\cf2 \strokec2 key\cf5 \strokec5 ],\cf2 \strokec2  \cf4 \cb3 \strokec4 int\cf5 \cb3 \strokec5 ):\cf2 \cb1 \strokec2 \
\cb3                         \cf4 \cb3 \strokec4 try\cf5 \cb3 \strokec5 :\cf2 \cb1 \strokec2 \
\cb3                             rag_parameters\cf5 \strokec5 [\cf2 \strokec2 key\cf5 \strokec5 ]\cf2 \strokec2  = \cf4 \cb3 \strokec4 int\cf5 \cb3 \strokec5 (\cf2 \strokec2 value\cf5 \strokec5 )\cf2 \cb1 \strokec2 \
\cb3                             updated = \cf4 \cb3 \strokec4 True\cf2 \cb1 \strokec2 \
\cb3                         \cf4 \cb3 \strokec4 except\cf2 \cb3 \strokec2  ValueError\cf5 \strokec5 :\cf2 \cb1 \strokec2 \
\cb3                             \cf4 \cb3 \strokec4 return\cf2 \cb3 \strokec2  jsonify\cf5 \strokec5 (\{\cf7 \strokec7 "error"\cf5 \strokec5 :\cf2 \strokec2  \cf7 \strokec7 f"Invalid value for \cf2 \strokec2 \{key\}\cf7 \strokec7 . Expected integer."\cf5 \strokec5 \}),\cf2 \strokec2  \cf8 \cb3 \strokec8 400\cf2 \cb1 \strokec2 \
\cb3                     \cf4 \cb3 \strokec4 elif\cf2 \cb3 \strokec2  \cf4 \cb3 \strokec4 isinstance\cf5 \cb3 \strokec5 (\cf2 \strokec2 rag_parameters\cf5 \strokec5 [\cf2 \strokec2 key\cf5 \strokec5 ],\cf2 \strokec2  \cf4 \cb3 \strokec4 float\cf5 \cb3 \strokec5 ):\cf2 \cb1 \strokec2 \
\cb3                         \cf4 \cb3 \strokec4 try\cf5 \cb3 \strokec5 :\cf2 \cb1 \strokec2 \
\cb3                             rag_parameters\cf5 \strokec5 [\cf2 \strokec2 key\cf5 \strokec5 ]\cf2 \strokec2  = \cf4 \cb3 \strokec4 float\cf5 \cb3 \strokec5 (\cf2 \strokec2 value\cf5 \strokec5 )\cf2 \cb1 \strokec2 \
\cb3                             updated = \cf4 \cb3 \strokec4 True\cf2 \cb1 \strokec2 \
\cb3                         \cf4 \cb3 \strokec4 except\cf2 \cb3 \strokec2  ValueError\cf5 \strokec5 :\cf2 \cb1 \strokec2 \
\cb3                             \cf4 \cb3 \strokec4 return\cf2 \cb3 \strokec2  jsonify\cf5 \strokec5 (\{\cf7 \strokec7 "error"\cf5 \strokec5 :\cf2 \strokec2  \cf7 \strokec7 f"Invalid value for \cf2 \strokec2 \{key\}\cf7 \strokec7 . Expected float."\cf5 \strokec5 \}),\cf2 \strokec2  \cf8 \cb3 \strokec8 400\cf2 \cb1 \strokec2 \
\cb3                     \cf6 \strokec6 # Add more type checks if needed (e.g., for strings)\cf2 \cb1 \strokec2 \
\
\cb3             \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  updated\cf5 \strokec5 :\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 # Re-initialize conversation chain with new parameters if vector store exists\cf2 \cb1 \strokec2 \
\cb3                 \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  vector_store\cf5 \strokec5 :\cf2 \cb1 \strokec2 \
\cb3                     \cf4 \cb3 \strokec4 global\cf2 \cb3 \strokec2  conversation_chain\cb1 \
\cb3                     conversation_chain = get_conversation_chain\cf5 \strokec5 (\cf2 \strokec2 vector_store\cf5 \strokec5 )\cf2 \cb1 \strokec2 \
\cb3                     memory.clear\cf5 \strokec5 ()\cf2 \strokec2  \cf6 \strokec6 # Clear memory to reflect new RAG behavior\cf2 \cb1 \strokec2 \
\cb3                 \cf4 \cb3 \strokec4 return\cf2 \cb3 \strokec2  jsonify\cf5 \strokec5 (\{\cf7 \strokec7 "message"\cf5 \strokec5 :\cf2 \strokec2  \cf7 \strokec7 "RAG parameters updated successfully."\cf5 \strokec5 ,\cf2 \strokec2  \cf7 \strokec7 "new_params"\cf5 \strokec5 :\cf2 \strokec2  rag_parameters\cf5 \strokec5 \}),\cf2 \strokec2  \cf8 \cb3 \strokec8 200\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 else\cf5 \cb3 \strokec5 :\cf2 \cb1 \strokec2 \
\cb3                 \cf4 \cb3 \strokec4 return\cf2 \cb3 \strokec2  jsonify\cf5 \strokec5 (\{\cf7 \strokec7 "message"\cf5 \strokec5 :\cf2 \strokec2  \cf7 \strokec7 "No valid RAG parameters provided for update."\cf5 \strokec5 \}),\cf2 \strokec2  \cf8 \cb3 \strokec8 400\cf2 \cb1 \strokec2 \
\
\cb3     \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf4 \cb3 \strokec4 __name__\cf2 \cb3 \strokec2  == \cf7 \strokec7 "__main__"\cf5 \strokec5 :\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 # For local development, you might run with debug=True\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 # In Docker, Gunicorn or a similar WSGI server will run the app\cf2 \cb1 \strokec2 \
\cb3         app.run\cf5 \strokec5 (\cf2 \strokec2 host=\cf7 \strokec7 "0.0.0.0"\cf5 \strokec5 ,\cf2 \strokec2  port=\cf8 \cb3 \strokec8 5000\cf5 \cb3 \strokec5 ,\cf2 \strokec2  debug=\cf4 \cb3 \strokec4 False\cf5 \cb3 \strokec5 )\cf2 \cb1 \strokec2 \
\cb3     \cb1 \
}