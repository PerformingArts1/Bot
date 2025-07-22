# backend/Dockerfile
FROM python:3.9-slim-buster

# Set working directory inside the container
WORKDIR /app

# Install system dependencies required by unstructured for various document types
# poppler-utils for PDF processing
# libreoffice for DOCX conversion (if unstructured uses it)
# tesseract-ocr for OCR capabilities (optional, but good for scanned PDFs)
RUN apt-get update && apt-get install -y \
    poppler-utils \
    libreoffice \
    tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements.txt and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your application code
COPY . .

# Create data directories inside the container
RUN mkdir -p data/documents data/chroma_db data/tinydb

# Expose the port Flask runs on
EXPOSE 5000

# Command to run the Flask application
# Using gunicorn for a more production-ready WSGI server
# CMD ["python", "app.py"] # Original command
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:create_app()"]
