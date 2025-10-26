# LLM 集成说明

本目录包含大模型相关集成与优化。

- `scripts/llm_client.py`：Ollama 客户端，支持 tinyllama。
- `scripts/qa_enhanced_wrapper.py`：RAG 调用与回退。
- 错误处理、模型拉取、回退本地摘要。

如模型未安装，自动拉取 tinyllama 并提示。