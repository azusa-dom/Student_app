#!/bin/bash
set -e

echo "🚀 Starting UCL AI Assistant..."
echo "📂 Current directory: $(pwd)"
echo "📋 Python version: $(python --version)"
echo "🔑 GROQ_API_KEY configured: ${GROQ_API_KEY:+YES}"

# Ensure required files/directories exist
if [ ! -f "api_qa.py" ]; then
    echo "❌ api_qa.py not found!"
    exit 1
fi

if [ ! -d "public/data" ]; then
    echo "⚠️  public/data directory not found, creating..."
    mkdir -p public/data
fi

exec uvicorn api_qa:app --host 0.0.0.0 --port "${PORT:-8000}" --log-level info
