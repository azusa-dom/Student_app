#!/bin/bash
set -e
echo "🚀 Starting UCL AI Assistant on port ${PORT:-8000}..."
mkdir -p public/data logs
exec uvicorn api_qa:app --host 0.0.0.0 --port ${PORT:-8000}
