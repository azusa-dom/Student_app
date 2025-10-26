# 后端说明

本目录包含后端架构、服务说明。

- `api_qa.py`：FastAPI 问答接口。
- `scripts/qa_enhanced.py`：RAG 主逻辑。
- `scripts/llm_client.py`：Ollama LLM 客户端。
- `data/qa_index.pkl`：TF-IDF 索引。

支持 LLM 回答与本地摘要回退。