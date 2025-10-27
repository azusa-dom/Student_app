SHELL := /bin/bash
VENV := .venv
PY := $(VENV)/bin/python

.PHONY: env-setup dev-backend dev-frontend dev stop test clean

env-setup:
	@if [ ! -d $(VENV) ]; then python3 -m venv $(VENV); fi
	$(PY) -m pip install -U pip
	$(PY) -m pip install -r requirements.txt
	npm install

# Start only the backend API with auto-reload on 127.0.0.1:5051
# Loads .env if present so your GROQ_API_KEY is available
dev-backend:
	set -a; [ -f .env ] && . ./.env; set +a; \
	$(PY) -m uvicorn api_qa:app --host 127.0.0.1 --port 5051 --reload

# Start only the Vite frontend at http://localhost:5173
# /api/* will proxy to backend on 5051 per vite.config.js
dev-frontend:
	npm run dev

# One command to run both: backend in background + frontend
# Use `make stop` to stop background processes
dev:
	set -a; [ -f .env ] && . ./.env; set +a; \
	($(PY) -m uvicorn api_qa:app --host 127.0.0.1 --port 5051 --reload &) && \
	npm run dev

# Stop dev servers (best-effort)
stop:
	pkill -f "uvicorn.*api_qa" || true
	pkill -f "vite" || true
	pkill -f "node .*vite" || true
	pkill -f "npm.*run dev" || true

# Run tests (if pytest is installed)
test:
	$(PY) -m pytest -q || echo "pytest not installed or tests failed"

clean:
	rm -rf dist .pytest_cache .coverage
	find . -type d -name "__pycache__" -prune -exec rm -rf {} +
