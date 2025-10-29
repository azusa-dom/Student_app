#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""api_qa.py - 完全修复版"""

import os
import time
import uuid
import re
from pathlib import Path
from time import sleep
import json
from fastapi import FastAPI, HTTPException, Query, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import logging
from typing import List, Dict, Optional, Any
from dotenv import load_dotenv

# 加载 .env 文件
load_dotenv()

# 现在可以访问环境变量
groq_api_key = os.getenv("GROQ_API_KEY")
print(f"GROQ_API_KEY: {groq_api_key}")

# ============ 日志配置 ============
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("api_qa")

# ============ 🔥 环境变量检查 ============
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    logger.error("❌ GROQ_API_KEY 未设置！AI 功能无法使用")
    logger.error("请运行: export GROQ_API_KEY='your_api_key_here'")
else:
    logger.info(f"✅ GROQ_API_KEY: {GROQ_API_KEY[:15]}...")

# ============ 导入 wrapper ============
try:
    from scripts.qa_enhanced_wrapper import answer_enhanced
    logger.info("✅ Loaded qa_enhanced_wrapper")
except Exception as e:
    logger.error(f"❌ 导入 wrapper 失败: {e}")
    def answer_enhanced(*a, **k): 
        return {"intent": "error", "answer": "后端加载失败", "citations": []}

# ============ 基础配置 ============
APP_START_TS = time.time()
DEFAULT_TOP_K = 5
MAX_TOP_K = 30
MAX_QUERY_LENGTH = 1200
RETRY_MAX = 2

LOGS_DIR = Path("logs")
LOGS_DIR.mkdir(parents=True, exist_ok=True)
FEEDBACK_LOG = LOGS_DIR / "feedback.log"

app = FastAPI(title="UCL AI QA API", version="3.0")

# ============ CORS ============
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).parent

# ============ 静态资源挂载 ============
if (BASE_DIR / "public").exists():
    app.mount("/public", StaticFiles(directory=str(BASE_DIR / "public")), name="public")
    logger.info("✅ Mounted /public")

# ============ 🔥 语言自动检测 ============
def detect_language(text: str) -> str:
    """检测文本语言"""
    # 检测中文字符
    chinese_chars = len(re.findall(r'[\u4e00-\u9fff]', text))
    total_chars = len(text.strip())
    
    if chinese_chars > 0:
        return "zh"  # 只要有中文就用中文
    return "en"

# ============ 请求 ID ============
def new_request_id() -> str:
    return uuid.uuid4().hex

# ============ 数据模型 ============
class QARequest(BaseModel):
    query: str
    top_k: Optional[int] = DEFAULT_TOP_K
    language: Optional[str] = "auto"  # 🔥 默认自动检测

class Feedback(BaseModel):
    request_id: str
    helpful: Optional[bool] = None
    timestamp: Optional[str] = None
    note: Optional[str] = None

# ============ 🔥 智能前端查找 ============
def _find_frontend_file():
    """查找前端文件 - 你已经确认是 index.html"""
    candidates = [
        BASE_DIR / "index.html",           # 🔥 你说的正确位置
        BASE_DIR / "demo_qa.html",
        BASE_DIR / "public/demo_qa.html",
        BASE_DIR / "public/index.html",
    ]
    
    for path in candidates:
        if path.exists():
            logger.info(f"✅ 前端: {path}")
            return path
    
    logger.error("❌ 未找到前端文件")
    return None

# ============ API 路由 ============

@app.get("/api/health")
async def health():
    """健康检查"""
    uptime = time.time() - APP_START_TS
    return {
        "status": "ok",
        "uptime_seconds": f"{uptime:.2f}",
        "version": "3.0",
        "groq_configured": bool(GROQ_API_KEY),
        "frontend": str(_find_frontend_file())
    }

@app.get("/api/qa")
async def api_qa_get(
    request: Request,
    response: Response,
    query: str = Query(..., min_length=1),
    top_k: int = DEFAULT_TOP_K,
    language: str = "auto"  # 🔥 自动检测
):
    return await _handle_qa(request, response, query, top_k, language)

@app.post("/api/qa")
async def api_qa_post(req: QARequest, response: Response, request: Request):
    return await _handle_qa(request, response, req.query, req.top_k, req.language)

async def _handle_qa(
    request: Request, 
    response: Response, 
    query: str, 
    top_k: int, 
    language: str
):
    """统一的 QA 处理逻辑"""
    req_id = new_request_id()
    response.headers["X-Request-ID"] = req_id
    start = time.time()
    
    # 🔥 自动检测语言
    if language == "auto" or not language:
        language = detect_language(query)
        logger.info(f"[{req_id}] 🌐 自动检测语言: {language}")
    
    logger.info(f"[{req_id}] 📝 Query: {query[:100]}")
    logger.info(f"[{req_id}] 🎯 Language: {language} | Top-K: {top_k}")

    # 🔥 检查 API Key
    if not GROQ_API_KEY:
        logger.error(f"[{req_id}] ❌ GROQ_API_KEY 未配置")
        return {
            "intent": "error",
            "answer": "⚠️ AI 服务未配置，请联系管理员设置 GROQ_API_KEY 环境变量",
            "citations": [],
            "reranked": [],
            "rewritten_queries": [],
            "num_docs": 0,
            "num_queries": 0,
            "response_time": "0s",
            "request_id": req_id,
            "model": "none",
            "language": language
        }

    # 输入验证
    if not query.strip():
        raise HTTPException(status_code=400, detail={
            "msg": "query is required",
            "request_id": req_id
        })
    
    if len(query) > MAX_QUERY_LENGTH:
        raise HTTPException(status_code=400, detail={
            "msg": f"query too long (max {MAX_QUERY_LENGTH})",
            "request_id": req_id
        })

    top_k = max(1, min(top_k, MAX_TOP_K))

    # 🔥 重试机制
    last_exc = None
    result = None
    
    for attempt in range(1, RETRY_MAX + 1):
        try:
            logger.info(f"[{req_id}] 🔄 尝试 {attempt}/{RETRY_MAX}")
            result = answer_enhanced(query, top_k=top_k, language=language)
            logger.info(f"[{req_id}] ✅ 成功")
            break
        except Exception as e:
            last_exc = e
            logger.error(f"[{req_id}] ❌ 尝试 {attempt} 失败: {e}")
            if attempt < RETRY_MAX:
                sleep(0.5 * (2 ** (attempt - 1)))
    
    if result is None:
        logger.error(f"[{req_id}] 💥 所有尝试失败: {last_exc}")
        # 🔥 降级：返回友好错误而不是抛出异常
        return {
            "intent": "error",
            "answer": f"抱歉，服务暂时不可用。错误信息：{str(last_exc)[:200]}",
            "citations": [],
            "reranked": [],
            "rewritten_queries": [],
            "num_docs": 0,
            "num_queries": 0,
            "response_time": f"{time.time() - start:.2f}s",
            "request_id": req_id,
            "model": os.getenv("MODEL_PROVIDER", "groq"),
            "language": language
        }

    # 🔥 确保返回格式完整
    if not isinstance(result, dict):
        result = {
            "intent": "unknown",
            "answer": str(result),
            "citations": [],
            "reranked": [],
            "rewritten_queries": []
        }

    # 补齐缺失字段
    result.setdefault("citations", [])
    result.setdefault("reranked", [])
    result.setdefault("rewritten_queries", [])

    rt = f"{time.time() - start:.2f}s"
    logger.info(f"[{req_id}] ⏱️  完成: {rt}")

    # 🔥 返回完整响应（包含 num_queries）
    return {
        "intent": result.get("intent", "general"),
        "answer": result.get("answer", ""),
        "citations": result.get("citations", []),
        "reranked": result.get("reranked", []),
        "rewritten_queries": result.get("rewritten_queries", []),
        "num_docs": len(result.get("reranked", [])),
        "num_queries": len(result.get("rewritten_queries", [])),
        "response_time": rt,
        "request_id": req_id,
        "model": os.getenv("MODEL_PROVIDER", "groq"),
        "language": language
    }

@app.post("/api/feedback")
async def feedback(payload: Feedback):
    """用户反馈"""
    try:
        entry = {k: v for k, v in payload.dict().items() if v is not None}
        entry["timestamp"] = entry.get("timestamp") or time.strftime(
            "%Y-%m-%dT%H:%M:%SZ", 
            time.gmtime()
        )
        
        with open(FEEDBACK_LOG, "a", encoding="utf-8") as f:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
        
        logger.info(f"📝 Feedback: {entry.get('request_id')} - {entry.get('helpful')}")
        return {"status": "ok"}
    
    except Exception as e:
        logger.error(f"❌ Feedback 失败: {e}")
        raise HTTPException(status_code=500, detail="Failed to save feedback")

# ============ 前端路由 ============

@app.get("/")
async def serve_frontend():
    """根路径：返回前端页面"""
    frontend_file = _find_frontend_file()
    
    if frontend_file:
        return FileResponse(str(frontend_file))
    
    return {
        "message": "UCL AI Assistant API",
        "version": "3.0",
        "status": "frontend not found",
        "groq_configured": bool(GROQ_API_KEY),
        "docs": "/docs"
    }

@app.get("/{full_path:path}")
async def catch_all(full_path: str):
    """SPA 支持"""
    # 跳过 API 和静态资源
    if full_path.startswith(("api/", "assets/", "public/", "docs", "openapi.json")):
        raise HTTPException(status_code=404, detail="Not found")
    
    frontend_file = _find_frontend_file()
    if frontend_file:
        return FileResponse(str(frontend_file))
    
    raise HTTPException(status_code=404, detail="Frontend not found")

# ============ 启动 ============
if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", "5051"))
    
    # 🔥 启动信息
    logger.info("=" * 60)
    logger.info("🚀 UCL AI Assistant API v3.0")
    logger.info("=" * 60)
    logger.info(f"📂 Base: {BASE_DIR}")
    logger.info(f"🔑 GROQ_API_KEY: {'✅ OK' if GROQ_API_KEY else '❌ 未设置'}")
    logger.info(f"🌐 Frontend: {_find_frontend_file()}")
    logger.info(f"📡 Server: http://localhost:{port}")
    logger.info(f"📚 Docs: http://localhost:{port}/docs")
    logger.info("=" * 60)
    
    if not GROQ_API_KEY:
        logger.error("\n⚠️  CRITICAL: GROQ_API_KEY 未设置!")
        logger.error("请运行: export GROQ_API_KEY='your_key_here'\n")
    
    uvicorn.run(
        "api_qa:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )
