# Production Dockerfile for FastAPI Placement Predictor Backend
FROM python:3.10-slim

WORKDIR /app

# Prevent Python from writing pyc files and buffering stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python packages
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code and trained ML models
COPY backend/ ./backend/
COPY ml/saved_models/ ./ml/saved_models/

# Expose port 8000
EXPOSE 8000

# Command to run FastAPI server via Uvicorn
CMD ["python", "backend/main.py"]
