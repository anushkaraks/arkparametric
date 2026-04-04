#!/bin/bash
# Start the worker in background
celery -A app.core.celery_app worker --loglevel=info &

# Start the beat in background
celery -A app.core.celery_app beat --loglevel=info --pidfile= /tmp/celerybeat.pid &

# Start the API (this keeps the container alive)
# Render provides the $PORT environment variable
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
