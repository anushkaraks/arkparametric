#!/bin/bash
set -e

# Wait for database to be ready
echo "Waiting for database..."
until python -c "import socket; s = socket.socket(socket.AF_INET, socket.SOCK_STREAM); s.connect(('${DATABASE_URL#*@}', 5432))" 2>/dev/null; do
  echo "Database not ready yet... sleeping"
  sleep 2
done

# Run database seeding/migration
echo "Seeding database..."
python seed.py

# Start the worker in background
echo "Starting Celery Worker..."
celery -A app.core.celery_app worker --loglevel=info &

# Start the beat in background
echo "Starting Celery Beat..."
celery -A app.core.celery_app beat --loglevel=info --pidfile=/tmp/celerybeat.pid &

# Start the API
echo "Starting FastAPI API on port ${PORT:-8000}..."
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
