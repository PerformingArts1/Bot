{\rtf1\ansi\ansicpg1252\cocoartf2822
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 # app.py - Conceptual Python Backend for AI Chatbot\
\
from flask import Flask, request, jsonify\
from flask_cors import CORS\
import PyPDF2 # For PDF text extraction\
# import fitz # PyMuPDF - for more advanced PDF parsing and image extraction\
# import io\
# from PIL import Image # For image processing\
# import pytesseract # For Tesseract OCR\
# import numpy as np # For numerical operations, e.g., vector similarity\
# from transformers import AutoTokenizer, AutoModel # For embedding models (e.g., Sentence Transformers)\
# from llama_cpp import Llama # For local LLM (llama.cpp)\
# import chromadb # For vector database (example)\
# from shapely.geometry import Point, LineString, Polygon # For geometric operations\
# import ezdxf # For DXF CAD file parsing\
# import os\
# import base64\
# import requests # If using Ollama via its API\
\
app = Flask(__name__)\
CORS(app) # Enable CORS for frontend communication\
\
# --- 1. Configuration ---\
# You'll need to configure paths to your local models and data\
# For a real setup, download a model like 'all-MiniLM-L6-v2' for embeddings\
# and a GGUF model for Llama.cpp (e.g., Llama-3-8B-Instruct.Q4_K_M.gguf)\
\
# Placeholder for local LLM (replace with actual Llama.cpp/Ollama integration)\
# LLM_MODEL_PATH = "./models/llama-3-8b-instruct.Q4_K_M.gguf"\
# llm = Llama(model_path=LLM_MODEL_PATH, n_ctx=4096, n_gpu_layers=-1, verbose=False) # n_gpu_layers=-1 to offload all layers to GPU (MPS)\
\
# Placeholder for embedding model\
# tokenizer = AutoTokenizer.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")\
# model = AutoModel.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")\
\
# Placeholder for vector database (in-memory for this demo)\
# In a real app, you'd initialize ChromaDB, FAISS, etc.\
# client = chromadb.Client()\
# collection = client.get_or_create_collection(name="artscenter_knowledge_base")\
\
# Simplified in-memory "vector database" for demonstration\
knowledge_base = [] # Stores \{'text': 'chunk', 'embedding': [0.1, 0.2, ...], 'source': 'filename', 'page': 'page_num'\}\
\
# --- 2. Document Processing Functions ---\
\
def extract_text_from_pdf(pdf_path):\
    """\
    Extracts text from a PDF file, including conceptual OCR for images within.\
    Returns a list of (page_num, text_content) tuples.\
    """\
    extracted_pages_data = []\
    try:\
        # doc = fitz.open(pdf_path) # Using PyMuPDF for robust PDF handling\
        # for page_num in range(doc.page_count):\
        #     page = doc.load_page(page_num)\
        #     page_text = page.get_text() # Extract text directly\
\
        #     # --- Conceptual Advanced Computer Vision (CV) for Image Data ---\
        #     # This section would involve:\
        #     # 1. Extracting images from the PDF page.\
        #     # 2. Applying OCR to any text found within these images (e.g., labels, dimensions).\
        #     # 3. Using object detection/semantic segmentation to identify elements (e.g., TVs, conduits, walls).\
        #     # 4. Potentially converting vector graphics (if PDF is vector-based) into structured data.\
        #     # 5. Generating textual descriptions of the visual content.\
\
        #     # pix = page.get_pixmap()\
        #     # img_bytes = pix.tobytes("png")\
        #     # img = Image.open(io.BytesIO(img_bytes))\
        #     # ocr_text = pytesseract.image_to_string(img) # Requires Tesseract\
        #     # page_text += f"\\n[OCR Content from Image: \{ocr_text\}]"\
\
        #     # Conceptual diagram analysis for spatial structure (using PyTorch/OpenCV)\
        #     # detected_objects = process_diagram_for_objects(img) # Function to call CV models\
        #     # page_text += f"\\n[Diagram Analysis: Detected objects: \{detected_objects\}]"\
\
        #     extracted_pages_data.append((page_num + 1, page_text)) # +1 for 1-based page numbers\
\
        # Using PyPDF2 for basic text extraction for demo purposes\
        with open(pdf_path, 'rb') as file:\
            reader = PyPDF2.PdfReader(file)\
            for page_num in range(len(reader.pages)):\
                page = reader.pages[page_num]\
                page_text = page.extract_text() or ""\
                extracted_pages_data.append((page_num + 1, page_text))\
\
    except Exception as e:\
        print(f"Error extracting text from PDF \{pdf_path\}: \{e\}")\
    return extracted_pages_data\
\
def chunk_text(text, chunk_size=500, overlap=50):\
    """Splits text into smaller chunks with overlap."""\
    chunks = []\
    words = text.split()\
    i = 0\
    while i < len(words):\
        chunk = " ".join(words[i:i + chunk_size])\
        chunks.append(chunk)\
        i += chunk_size - overlap\
    return chunks\
\
# --- 3. Embedding Generation (Conceptual) ---\
\
def get_embedding(text):\
    """\
    Generates a conceptual embedding for a given text.\
    In a real system, this would use a pre-trained embedding model (e.g., Sentence Transformers).\
    """\
    # Example using a placeholder for actual embedding model\
    # inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)\
    # with torch.no_grad():\
    #     embeddings = model(**inputs).last_hidden_state.mean(dim=1).squeeze().tolist()\
    # return embeddings\
    # For demo, return a simple hash or mock vector\
    return [hash(text) % 1000 / 1000.0] * 384 # Mock 384-dim vector (e.g., for all-MiniLM-L6-v2)\
\
# --- 4. RAG Logic ---\
\
def retrieve_relevant_chunks(query_embedding, top_k=3):\
    """\
    Retrieves the most relevant chunks from the knowledge base based on query embedding.\
    In a real system, this would query the vector database using actual similarity metrics.\
    """\
    # In a real system, you'd calculate cosine similarity between query_embedding\
    # (which would be a real vector from get_embedding) and all stored embeddings\
    # in the knowledge_base (or vector DB).\
    # For demonstration, we'll use simplified keyword matching on the raw query string.\
\
    query_lower = query_embedding.lower() # query_embedding is actually the raw query string for demo\
\
    relevant_chunks = []\
    # Simplified keyword matching for demo purposes\
    for item in knowledge_base:\
        if any(keyword in item['text'].lower() for keyword in query_lower.split()):\
            relevant_chunks.append(item['text'])\
            if len(relevant_chunks) >= top_k:\
                break\
\
    # Fallback to predefined chunks if no keyword match in demo knowledge_base\
    if not relevant_chunks:\
        if "power requirements" in query_lower:\
            relevant_chunks = [\
                "GENERAL NOTES: EACH TV LOCATION REQUIRES 20A 120VAC DUPLEX RECEPTACLE",\
                "MOUNTING HEIGHT: RECEPTACLE HEIGHT 18 AFS., SWITCH HEIGHT - 48 AFF, TV HEIGHT 68AFF"\
            ]\
        elif "control room" in query_lower or "av-206" in query_lower:\
            relevant_chunks = [\
                "AV-206 CONTROL ROOM is located on the 3rd floor.",\
                "Control Room: Central hub for audio, lighting, and stage management. Refer to AV231 for detailed device placements."\
            ]\
        elif "emergency" in query_lower:\
            relevant_chunks = [\
                "Emergency Exits & Procedures.pdf: Comprehensive guide for emergency evacuations and safety protocols.",\
                "Fire Evacuation Protocol: Follow marked exit routes, proceed to assembly points, do not use elevators."\
            ]\
        elif "tv-321" in query_lower or "main hall" in query_lower:\
            relevant_chunks = [\
                "Device TV-321 is installed in the main hall.",\
                "Main Hall: The primary performance space with tiered seating. Capacity: 850."\
            ]\
        elif "sp-310" in query_lower or "lobby" in query_lower:\
             relevant_chunks = [\
                "SP-310 and SP-311 are speakers in the lobby area.",\
                "Lobby: Main entrance, ticket counter, and concession area."\
            ]\
        elif "dimensions" in query_lower or "layout" in query_lower or "floor plan" in query_lower or "conduit" in query_lower:\
            # --- Conceptual Geospatial/CAD Processing Integration ---\
            # This is where a specialized module would be called to interpret the drawing.\
            # For example, if you had a structured representation of the CAD data:\
            # spatial_data = parse_cad_data("path/to/your/AV231.dxf")\
            # inferred_info = spatial_reasoning_module(query_lower, spatial_data)\
            # relevant_chunks.append(f"Inferred spatial info: \{inferred_info\}")\
            relevant_chunks = [\
                "The AV231_ DEVICE PLACEMENTS 3RD FLOOR PLAN Rev.6 markup (1).pdf contains detailed layouts and dimensions for AV devices and conduit paths.",\
                "While direct geometric interpretation is complex, the document specifies device locations like AV-206 (Control Room) and TV-321 (Main Hall), and details conduit sizes and runs.",\
                "For precise measurements and spatial relationships, you would need to process the original CAD files (e.g., DXF) using libraries like `ezdxf` and `shapely`."\
            ]\
\
    return relevant_chunks\
\
def generate_response_with_llm(query, context_chunks, image_description=None):\
    """\
    Generates a response using the local LLM, augmented with context.\
    Includes conceptual handling for multimodal input.\
    """\
    context = "\\n".join(context_chunks)\
\
    # --- Conceptual Multimodal LLM Integration (for generation) ---\
    # If a Vision LLM described the image, that description would be passed here\
    # to help the main LLM generate a more informed response.\
    image_context = f"\\nUser provided an image with content: \{image_description\}\\n" if image_description else ""\
\
    prompt = f"""\
    You are an AI assistant for a performing arts center. Use the following information\
    to answer the user's question. If the information is not sufficient, state that.\
\
    Context from documents:\{image_context\}\
    \{context\}\
\
    User Question: \{query\}\
\
    AI Assistant:\
    """\
    print(f"Sending prompt to LLM:\\n\{prompt\}")\
\
    # Placeholder for actual LLM inference using llama-cpp-python or Ollama\
    # If using llama-cpp-python with a multimodal GGUF model (e.g., LLaVA):\
    # You would pass the image data directly to the LLM call along with the text prompt.\
    # The exact API varies by model/wrapper.\
    # output = llm(\
    #     prompt,\
    #     max_tokens=1024,\
    #     stop=["User:", "\\n"], # Adjust stop tokens based on model\
    #     echo=False,\
    #     temperature=0.7,\
    #     # images=[image_data_bytes] # If your LLM supports direct image input\
    # )\
    # return output["choices"][0]["text"].strip()\
\
    # If using Ollama (via requests to local Ollama server):\
    # payload = \{"model": "llava", "prompt": prompt\}\
    # if image_description: # If image was provided, include it for Ollama\
    #     payload["images"] = [base64_image_data_from_frontend] # You'd need to pass this through\
    # response = requests.post("http://localhost:11434/api/generate", json=payload)\
    # result = response.json()\
    # return result['response']\
\
\
    # Simulated LLM response for demonstration\
    if not context_chunks and not image_description:\
        return "I don't have specific information on that topic in my knowledge base. Could you please provide more details or ask about something else?"\
    else:\
        response_prefix = "Based on the documents"\
        if image_description:\
            response_prefix += f" and the image you provided (conceptually processed)"\
        return f"\{response_prefix\}, regarding '\{query\}', I found: \{context\}. How else can I help?"\
\
# --- 5. API Endpoints ---\
\
@app.route('/ingest_document', methods=['POST'])\
def ingest_document():\
    """\
    Endpoint to ingest a new PDF document into the knowledge base.\
    In a real system, this would process the file, chunk it, embed it, and store in DB.\
    """\
    if 'file' not in request.files:\
        return jsonify(\{"error": "No file part"\}), 400\
    file = request.files['file']\
    if file.filename == '':\
        return jsonify(\{"error": "No selected file"\}), 400\
    if file and file.filename.endswith('.pdf'):\
        # Save the file temporarily\
        filepath = os.path.join("/tmp", file.filename) # Use a temporary path\
        file.save(filepath)\
\
        # Process the PDF, including conceptual image/diagram analysis\
        pages_data = extract_text_from_pdf(filepath)\
        total_chunks_added = 0\
        for page_num, page_text in pages_data:\
            chunks = chunk_text(page_text)\
            for chunk in chunks:\
                embedding = get_embedding(chunk)\
                knowledge_base.append(\{'text': chunk, 'embedding': embedding, 'source': file.filename, 'page': page_num\})\
                # In a real system: collection.add(documents=[chunk], embeddings=[embedding], metadatas=[\{'source': file.filename, 'page': page_num\}])\
                total_chunks_added += 1\
\
        os.remove(filepath) # Clean up temp file\
        return jsonify(\{"message": f"Document '\{file.filename\}' ingested successfully. \{total_chunks_added\} chunks added."\}), 200\
    return jsonify(\{"error": "Invalid file type. Only PDFs are supported for ingestion."\}), 400\
\
@app.route('/chat', methods=['POST'])\
def chat():\
    """\
    Endpoint for AI chatbot interaction.\
    Handles text queries and conceptual image queries.\
    """\
    data = request.json\
    user_query = data.get('query', '')\
    image_data_b64 = data.get('image', None) # Base64 image data from frontend\
\
    image_description = None\
    if image_data_b64:\
        # --- Conceptual Multimodal Query Fusion (Image Understanding) ---\
        # 1. Decode base64 image\
        # image_bytes = base64.b64decode(image_data_b64)\
        # 2. Use a Vision LLM (e.g., LLaVA via llama-cpp-python or Ollama) or specialized CV model\
        #    to describe the image content. This description is then used to augment the user's text query.\
        # Example:\
        # If using llama-cpp-python with a multimodal model:\
        # vision_llm_output = llm.generate_image_description(image_bytes) # Conceptual API\
        # image_description = vision_llm_output.get('description', 'an unspecified diagram or image')\
        #\
        # If using Ollama:\
        # ollama_payload = \{"model": "llava", "prompt": "Describe this image.", "images": [image_data_b64]\}\
        # ollama_response = requests.post("http://localhost:11434/api/generate", json=ollama_payload)\
        # ollama_result = ollama_response.json()\
        # image_description = ollama_result.get('response', 'an unspecified diagram or image')\
\
        print("Received image data. Conceptual image processing for multimodal query fusion would happen here.")\
        image_description = "a technical diagram or floor plan" # Simulated description for demo\
        # user_query = f"\{user_query\} (User provided an image, conceptually processed as: \{image_description\})"\
        # For simplicity in demo, we'll just pass image_description to generate_response_with_llm\
\
    if not user_query and not image_data_b64: # After potential image processing, ensure there's a query\
        return jsonify(\{"error": "No query provided after image processing"\}), 400\
\
    # 1. Get embedding for the user query (now potentially augmented by image description)\
    # In a real system, query_embedding would be a vector from get_embedding(user_query + image_description)\
    query_embedding = user_query # Still using raw query string for simplified demo retrieval\
\
    # 2. Retrieve relevant context chunks\
    # This step would leverage the embedding model and vector DB for actual similarity search.\
    relevant_chunks = retrieve_relevant_chunks(query_embedding)\
\
    # 3. Generate response using LLM with context (and image description if present)\
    ai_response = generate_response_with_llm(user_query, relevant_chunks, image_description)\
\
    return jsonify(\{"response": ai_response\}), 200\
\
@app.route('/emergency_protocols', methods=['GET'])\
def get_emergency_protocols():\
    """\
    Endpoint to retrieve emergency protocols.\
    In a real system, these would also be managed via RAG or a structured DB.\
    """\
    protocols = [\
        \{"title": "Fire Evacuation", "content": "Follow marked exit routes, proceed to assembly points, do not use elevators."\},\
        \{"title": "Medical Emergency", "content": "Call 911, notify nearest staff, provide first aid if trained, secure area."\},\
        \{"title": "Power Outage", "content": "Remain calm, wait for instructions, emergency lighting will activate."\},\
        \{"title": "Security Threat", "content": "Run, Hide, Fight. Follow instructions from security personnel or law enforcement."\},\
    ]\
    return jsonify(\{"protocols": protocols\}), 200\
\
if __name__ == '__main__':\
    # For demonstration, let's ingest a conceptual PDF content\
    # In a real scenario, you'd have a separate script or admin interface for ingestion\
    conceptual_pdf_content = """\
    AV231_ DEVICE PLACEMENTS 3RD FLOOR PLAN Rev.6 markup (1).pdf\
    GENERAL NOTES: EACH TV LOCATION REQUIRES 20A 120VAC DUPLEX RECEPTACLE.\
    CONTROL ROOM (AV-206) is located on the 3rd floor.\
    MOUNTING HEIGHT: RECEPTACLE HEIGHT 18 AFS., SWITCH HEIGHT - 48 AFF, TV HEIGHT 68AFF.\
    Refer to AV-300 and AV-900 sheets for DISPLAY ELEVATIONS AND MOUNTING DETAILS.\
    Device TV-321 is installed in the main hall.\
    SP-310 and SP-311 are speakers in the lobby area.\
    Emergency exits are clearly marked on all floor plans.\
    The drawing also contains detailed conduit paths and dimensions for cabling.\
    There are multiple junction boxes (e.g., 12x12x4, 16x16x6) indicated for various connections.\
    """\
    print("Ingesting conceptual PDF content into knowledge base...")\
    # Simulate processing of a multi-page PDF with some visual info\
    conceptual_pages = [\
        (1, "Page 1: " + conceptual_pdf_content),\
        (2, "Page 2: This page shows the detailed conduit paths and specific device connections for AV-206 (Control Room) and TV-321. It includes dimensions for conduit runs and junction box placements. There is a CHANGE OF CONDUIT PATH TO AV-308."),\
        (3, "Page 3: This page focuses on the device legend, detailing symbols for various junction boxes (1-gang, 2-gang, 3-gang, 16x6x4, 8x8x4, 12x12x4, 14x14x4, 16x16x6). It also has notes on equipment rack elevations and an AV CABLE SCHEDULE."),\
    ]\
\
    total_chunks = 0\
    for page_num, page_content in conceptual_pages:\
        chunks_to_ingest = chunk_text(page_content, chunk_size=100, overlap=20)\
        for chunk in chunks_to_ingest:\
            knowledge_base.append(\{'text': chunk, 'embedding': get_embedding(chunk), 'source': 'AV231_ DEVICE PLACEMENTS 3RD FLOOR PLAN Rev.6 markup (1).pdf', 'page': page_num\})\
            total_chunks += 1\
    print(f"Conceptual knowledge base initialized with \{total_chunks\} chunks.")\
\
    # Run the Flask app\
    app.run(host='0.0.0.0', port=5000, debug=True)\
}