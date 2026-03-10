# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies for PDF/Docx processing
RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn

# Copy the rest of the application
COPY . .

# Create the upload directory
RUN mkdir -p public/files

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application using uvicorn
CMD ["uvicorn", "backend:app", "--host", "0.0.0.0", "--port", "8000"]
