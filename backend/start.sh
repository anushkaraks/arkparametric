#!/bin/bash
set -e

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
