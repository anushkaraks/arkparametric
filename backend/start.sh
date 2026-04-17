#!/bin/bash
set -e

# Wait for database to be ready
echo "Waiting for database..."
# Extract hostname from DATABASE_URL (handling postgres://user:pass@host:port/db)
DB_HOST=$(python3 -c "from urllib.parse import urlparse; print(urlparse('$DATABASE_URL').hostname)")
until python3 -c "import socket; s = socket.socket(socket.AF_INET, socket.SOCK_STREAM); s.settimeout(1); s.connect(('$DB_HOST', 5432))" 2>/dev/null; do
  echo "Database ($DB_HOST) not ready yet... sleeping"
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
