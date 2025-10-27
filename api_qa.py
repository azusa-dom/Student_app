#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""api_qa.py - 完整可运行版：支持中英文 + Groq + 无 slowapi"""

import os
import time
import traceback
import uuid
from pathlib import Path
from typing import List, Dict, Optional, Any
from time import sleep
import json
from fastapi import FastAPI, HTTPException, Query, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("api_qa")

# 导入 wrapper（自动适配 llm_client 或 groq_client）
try:
    from scripts.qa_enhanced_wrapper import answer_enhanced
except Exception as e:
    logger.error(f"导入 wrapper 失败: {e}")
    def answer_enhanced(*a, **k): return {"intent": "error", "answer": "后端错误", "citations": []}

APP_START_TS = time.time()
DEFAULT_TOP_K = 5
MAX_TOP_K = 30
MAX_QUERY_LENGTH = 1200
RETRY_MAX = 2

LOGS_DIR = Path("logs")
LOGS_DIR.mkdir(parents=True, exist_ok=True)
FEEDBACK_LOG = LOGS_DIR / "feedback.log"

app = FastAPI(title="UCL AI QA API", version="2.1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔥 新增：挂载静态文件（前端）
from pathlib import Path
BASE_DIR = Path(__file__).parent

# 如果有 public 目录，挂载它
if (BASE_DIR / "public").exists():
    app.mount("/public", StaticFiles(directory="public"), name="public")

# 🔥 新增：根路径返回前端页面
@app.get("/")
async def serve_frontend():
    html_file = BASE_DIR / "demo_qa.html"
    if html_file.exists():
        return FileResponse(html_file)
    return {"message": "UCL AI Assistant API", "docs": "/docs"}

def new_request_id() -> str:
    return uuid.uuid4().hex

class QARequest(BaseModel):
    query: str
    top_k: Optional[int] = DEFAULT_TOP_K
    language: Optional[str] = "en"

@app.get("/api/health")
async def health():
    uptime = time.time() - APP_START_TS
    return {"status": "ok", "uptime_seconds": f"{uptime:.2f}"}

@app.get("/api/qa")
async def api_qa_get(
    request: Request,
    response: Response,
    query: str = Query(..., min_length=1),
    top_k: int = DEFAULT_TOP_K,
    language: str = "en"
):
    return await _handle_qa(request, response, query, top_k, language)

@app.post("/api/qa")
async def api_qa_post(req: QARequest, response: Response, request: Request):
    return await _handle_qa(request, response, req.query, req.top_k, req.language)

async def _handle_qa(request: Request, response: Response, query: str, top_k: int, language: str):
    req_id = new_request_id()
    response.headers["X-Request-ID"] = req_id
    start = time.time()
    logger.info(f"[{req_id}] Query: {query[:200]} | lang={language}")

    if not query.strip():
        raise HTTPException(status_code=400, detail={"msg": "query required", "request_id": req_id})
    if len(query) > MAX_QUERY_LENGTH:
        raise HTTPException(status_code=400, detail={"msg": f"query too long (max {MAX_QUERY_LENGTH})", "request_id": req_id})

    top_k = max(1, min(top_k, MAX_TOP_K))

    last_exc = None
    for attempt in range(1, RETRY_MAX + 1):
        try:
            result = answer_enhanced(query, top_k=top_k, language=language)
            break
        except Exception as e:
            last_exc = e
            logger.warning(f"[{req_id}] attempt {attempt} failed: {e}")
            sleep(0.5 * (2 ** (attempt-1)))
    else:
        logger.error(f"[{req_id}] all attempts failed: {last_exc}")
        raise HTTPException(status_code=503, detail={"msg": "Service error", "request_id": req_id})

    if not isinstance(result, dict):
        result = {"intent":"unknown","answer":str(result),"citations":[],"reranked":[]}

    rt = f"{time.time() - start:.2f}s"
    logger.info(f"[{req_id}] Done in {rt}")

    out = {
        "intent": result.get("intent",""),
        "answer": result.get("answer",""),
        "citations": result.get("citations", []),
        "num_docs": len(result.get("reranked", [])),
        "response_time": rt,
        "request_id": req_id,
        "model": os.getenv("MODEL_PROVIDER", "groq"),
        "language": language
    }
    return out

class Feedback(BaseModel):
    request_id: str
    helpful: Optional[bool] = None
    timestamp: Optional[str] = None
    note: Optional[str] = None

@app.post("/api/feedback")
async def feedback(payload: Feedback):
    try:
        entry = {k: v for k, v in payload.dict().items() if v is not None}
        entry["timestamp"] = entry.get("timestamp") or time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        with open(FEEDBACK_LOG, "a", encoding="utf-8") as f:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
        return {"status":"ok"}
    except Exception as e:
        logger.error(f"Feedback save failed: {e}")
        raise HTTPException(status_code=500, detail="Save failed")

def _find_demo_file():
    candidates = [
        Path("demo_qa.html"),
        Path("public/demo_qa.html"),
        Path("/workspaces/Student_app/demo_qa.html"),
        Path("dist/index.html"),
    ]
    for p in candidates:
        if p.exists():
            return p
    return None

@app.get("/")
async def root_ui():
    demo = _find_demo_file()
    if demo:
        return FileResponse(str(demo))
    return {"message": "UI not found. Place demo_qa.html in root or public/"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "5051"))
    uvicorn.run("api_qa:app", host="0.0.0.0", port=port, reload=True)