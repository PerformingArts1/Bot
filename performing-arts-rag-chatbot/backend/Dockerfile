# backend/Dockerfile
FROM python:3.9-slim-buster

# Set working directory inside the container
WORKDIR /app

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
CMD ["python", "app.py"]
