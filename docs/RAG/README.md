# RAG 管道说明

本目录包含检索增强生成（RAG）相关逻辑。

- `scripts/qa_enhanced.py`：意图识别、检索、重排序、证据、生成。
- `data/qa_index.pkl`：TF-IDF 索引。
- `scripts/qa_enhanced_wrapper.py`：RAG 封装与回退。

支持中文关键词优化、检索覆盖率统计。