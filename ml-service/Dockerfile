FROM python:3.10-slim

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Set PYTHONPATH to include the app directory
ENV PYTHONPATH=/app

# Expose the port that Flask runs on (Hugging Face uses 7860 by default)
EXPOSE 7860

# Run the application
CMD ["python", "main.py"]