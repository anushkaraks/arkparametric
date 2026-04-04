FROM python:3.11-slim

WORKDIR /app

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# Ensure startup script is executable
USER root
RUN chmod +x /app/start.sh
USER appuser

# Start the combined services
CMD ["/app/start.sh"]
