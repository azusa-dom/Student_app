"""
后端 API 路由示例 - Flask/FastAPI
支持增强版 QA 系统
"""

# ============================================
# Flask 示例
# ============================================
from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
import sys
from pathlib import Path

# 添加项目根目录到路径
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from scripts.qa_enhanced import answer_enhanced

qa_bp = Blueprint('qa', __name__, url_prefix='/api/qa')

@qa_bp.route('/enhanced', methods=['POST'])
@cross_origin()
def enhanced_query():
    """
    增强版 QA API 端点
    
    Request:
        POST /api/qa/enhanced
        Content-Type: application/json
        
        {
            "query": "计算机专业入学要求是什么",
            "top_k": 10
        }
    
    Response:
        {
            "intent": "admission_requirements",
            "rewritten_queries": [...],
            "reranked": [...],
            "answer": "...",
            "citations": [...],
            "rules_patch": {...}
        }
    """
    try:
        data = request.get_json()
        
        if not data or 'query' not in data:
            return jsonify({
                'error': 'Missing required field: query'
            }), 400
        
        query = data['query'].strip()
        top_k = data.get('top_k', 10)
        
        if not query:
            return jsonify({
                'error': 'Query cannot be empty'
            }), 400
        
        if not isinstance(top_k, int) or top_k < 1 or top_k > 50:
            return jsonify({
                'error': 'top_k must be an integer between 1 and 50'
            }), 400
        
        # 调用增强版 QA
        result = answer_enhanced(query, top_k=top_k)
        
        return jsonify(result), 200
        
    except Exception as e:
        import traceback
        return jsonify({
            'error': 'Internal server error',
            'message': str(e),
            'traceback': traceback.format_exc()
        }), 500

@qa_bp.route('/health', methods=['GET'])
def health_check():
    """健康检查端点"""
    return jsonify({
        'status': 'healthy',
        'service': 'qa_enhanced',
        'version': '1.0.0'
    }), 200


# ============================================
# FastAPI 示例（更现代的选择）
# ============================================
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional

app = FastAPI(
    title="UCL QA Enhanced API",
    description="增强版 QA 系统 API",
    version="1.0.0"
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应该限制域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    """查询请求模型"""
    query: str = Field(..., min_length=1, description="用户问题")
    top_k: int = Field(10, ge=1, le=50, description="返回结果数量")

class QueryResponse(BaseModel):
    """查询响应模型（简化版，完整结构见 qa_enhanced.py）"""
    intent: str
    answer: str
    citations: list
    reranked: list
    rules_patch: dict

@app.post("/api/qa/enhanced", response_model=QueryResponse)
async def enhanced_query_fastapi(request: QueryRequest):
    """
    增强版 QA API 端点（FastAPI 版本）
    
    - **query**: 用户问题（必填）
    - **top_k**: 返回结果数量（1-50，默认10）
    
    Returns:
        QueryResponse: 包含意图、答案、引用等信息
    """
    try:
        result = answer_enhanced(request.query, top_k=request.top_k)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@app.get("/api/qa/health")
async def health_check_fastapi():
    """健康检查"""
    return {
        "status": "healthy",
        "service": "qa_enhanced",
        "version": "1.0.0"
    }


# ============================================
# 在 Flask app.py 中注册路由
# ============================================
"""
# app.py 示例

from flask import Flask
from flask_cors import CORS
from backend.routes.qa_routes import qa_bp

app = Flask(__name__)
CORS(app)

# 注册 QA 蓝图
app.register_blueprint(qa_bp)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
"""


# ============================================
# 测试脚本
# ============================================
"""
# 使用 curl 测试

curl -X POST http://localhost:5000/api/qa/enhanced \
  -H "Content-Type: application/json" \
  -d '{
    "query": "计算机专业入学要求是什么",
    "top_k": 5
  }'

# 使用 httpie 测试（更友好）
http POST http://localhost:5000/api/qa/enhanced \
  query="计算机专业入学要求是什么" \
  top_k:=5

# 使用 Python requests
import requests

response = requests.post(
    'http://localhost:5000/api/qa/enhanced',
    json={
        'query': '计算机专业入学要求是什么',
        'top_k': 5
    }
)

result = response.json()
print(result['intent'])      # admission_requirements
print(result['answer'])       # 答案文本
print(len(result['citations']))  # 引用数量
"""


# ============================================
# 部署配置（Gunicorn + Nginx）
# ============================================
"""
# gunicorn.conf.py
workers = 4
worker_class = "sync"
bind = "0.0.0.0:8000"
timeout = 120
keepalive = 5
accesslog = "logs/access.log"
errorlog = "logs/error.log"
loglevel = "info"

# 启动命令
gunicorn -c gunicorn.conf.py app:app

# Nginx 配置示例
server {
    listen 80;
    server_name api.yourdomain.com;

    location /api/qa {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_connect_timeout 120s;
        proxy_read_timeout 120s;
    }
}
"""


# ============================================
# Docker 部署示例
# ============================================
"""
# Dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["gunicorn", "-c", "gunicorn.conf.py", "app:app"]

# docker-compose.yml
version: '3.8'

services:
  qa-api:
    build: .
    ports:
      - "8000:8000"
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
    environment:
      - FLASK_ENV=production
    restart: unless-stopped

# 构建和运行
docker-compose up -d
"""
