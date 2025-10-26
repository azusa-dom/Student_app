# api_qa.py
import time
import traceback
from typing import List, Dict, Optional

from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from scripts.qa_enhanced_wrapper import answer_enhanced

app = FastAPI(title="UCL AI 问答 API")

# CORS（前端本地端口 5173；如需更安全，去掉 "*"）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 健康检查
@app.get("/api/health")
async def health():
    return {"status": "ok"}

# GET 形式（前端直接 fetch /api/qa?query=...）
@app.get("/api/qa")
async def qa_endpoint_get(query: str = Query(default="", min_length=1), top_k: int = 8):
    if not query.strip():
        raise HTTPException(status_code=400, detail="query 参数不能为空")
    start = time.time()
    try:
        result = answer_enhanced(query, top_k=top_k)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"内部服务错误: {e}")
    response_time = f"{(time.time() - start):.2f}s"
    return {
        "intent": result.get("intent", ""),
        "answer": result.get("answer", ""),
        "citations": result.get("citations", []),
        "num_queries": len(result.get("rewritten_queries", [])),
        "num_docs": len(result.get("reranked", [])),
        "response_time": response_time
    }

# POST 形式（可选）
class QARequest(BaseModel):
    query: str
    top_k: Optional[int] = 8

class QAResponse(BaseModel):
    intent: str
    answer: str
    citations: List[Dict[str,str]]
    num_queries: int
    num_docs: int
    response_time: str

@app.post("/api/qa", response_model=QAResponse)
async def qa_endpoint(req: QARequest):
    if not req.query or req.query.strip() == "":
        raise HTTPException(status_code=400, detail="query 参数不能为空")
    start = time.time()
    try:
        result = answer_enhanced(req.query, top_k=req.top_k)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"内部服务错误: {e}")
    response_time = f"{(time.time() - start):.2f}s"
    return QAResponse(
        intent=result.get("intent", ""),
        answer=result.get("answer", ""),
        citations=result.get("citations", []),
        num_queries=len(result.get("rewritten_queries", [])),
        num_docs=len(result.get("reranked", [])),
        response_time=response_time
    )

@app.get("/")
async def root():
    return {"message": "UCL AI 问答服务（API） 正常运行", "docs": "/docs", "health": "/api/health"}

if __name__ == "__main__":
    import uvicorn, os
    port = int(os.getenv("PORT", "5051"))
    uvicorn.run(app, host="0.0.0.0", port=port, reload=True)
