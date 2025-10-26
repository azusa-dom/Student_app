# ========== 兼容性导入和 reranker（替换原有 import CrossEncoder / rerank_passages） ==========
# 放在文件顶部与其他 import 一起
import numpy as np

# 尝试导入 CrossEncoder（优先 cross-encoder 包，其次 sentence-transformers 的实现）
CrossEncoderClass = None
try:
    # 如果你安装了 cross-encoder 包（某些环境有）
    from cross_encoder import CrossEncoder as CE  # type: ignore
    CrossEncoderClass = CE
except Exception:
    try:
        # sentence-transformers 在某些版本中也提供 CrossEncoder
        from sentence_transformers import CrossEncoder as CE  # type: ignore
        CrossEncoderClass = CE
    except Exception:
        CrossEncoderClass = None

def rerank_passages(query, passages, embedder=None, reranker_model="cross-encoder/ms-marco-MiniLM-L-6-v2", top_k=5):
    """
    优先使用 CrossEncoder（若可用）；若不可用，则回落到基于 embedding 的 cosine 相似度重排。
    - query: 原始查询字符串
    - passages: list of dicts, each must have 'text' 字段
    - embedder: SentenceTransformer 实例（若使用 cosine fallback，需要传入）
    """
    if not passages:
        return []

    # 1) 若有 CrossEncoderClass（来自 cross-encoder 或 sentence-transformers），使用它（更精准）
    if CrossEncoderClass is not None:
        try:
            reranker = CrossEncoderClass(reranker_model)
            pairs = [(query, p['text']) for p in passages]
            scores = reranker.predict(pairs)
            for p, s in zip(passages, scores):
                p['rerank_score'] = float(s)
            passages.sort(key=lambda x: x.get('rerank_score', 0.0), reverse=True)
            return passages[:top_k]
        except Exception as e:
            # 如果 CrossEncoder 调用失败，降级到 cosine fallback（但先打印错误）
            print("Warning: CrossEncoder failed, fallback to cosine rerank. Error:", e)

    # 2) Cosine-similarity fallback：需要 embedder（若没有则抛错提示）
    if embedder is None:
        raise RuntimeError("No CrossEncoder available and embedder is None — cannot rerank. Please pass embedder to rerank_passages or install cross-encoder / sentence-transformers with CrossEncoder.")

    # 准备 embeddings（对 passages 做批量编码）
    texts = [p['text'] for p in passages]
    try:
        p_embs = embedder.encode(texts, convert_to_numpy=True, show_progress_bar=False)
    except TypeError:
        # 兼容不同版本的 sentence-transformers
        p_embs = np.array([embedder.encode(t) for t in texts])

    q_emb = embedder.encode([query], convert_to_numpy=True)
    # 归一化
    def normalize(x):
        x = np.array(x, dtype=np.float32)
        norms = np.linalg.norm(x, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        return x / norms
    p_embs_n = normalize(p_embs)
    q_emb_n = normalize(q_emb)[0]
    sims = (p_embs_n @ q_emb_n).tolist()  # cosine similarity
    for p, s in zip(passages, sims):
        p['rerank_score'] = float(s)
    passages.sort(key=lambda x: x.get('rerank_score', 0.0), reverse=True)
    return passages[:top_k]
# ================================================================================================
# ----------------- quick-fix: translate_query stub -----------------
def translate_query(query):
    if not isinstance(query, str):
        query = str(query or "")
    q = query.strip()
    zh_chars = any('\u4e00' <= ch <= '\u9fff' for ch in q)
    lang = "zh" if zh_chars else "en"
    rewrites = [q]
    if lang == "zh":
        rewrites.append(q + " English language requirements")
    else:
        rewrites.append(q + " site:ucl.ac.uk")
    return {
        "original_query": q,
        "query": q,
        "lang": lang,
        "rewrites": rewrites
    }
# ----------------- end translate_query stub -----------------
