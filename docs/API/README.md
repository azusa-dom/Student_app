# API 文档

本目录包含后端 API 的接口说明、参数、返回值示例。

- `api_qa.py`：主问答接口，支持 GET/POST，返回意图、答案、引用、统计信息。
- `serve_qa.py`：本地服务启动脚本。

## 示例
```json
{
  "intent": "wellbeing",
  "answer": "...",
  "citations": ["..."],
  "stats": {"retrieved": 5, "reranked": 2}
}
```

详细接口文档请见代码注释。