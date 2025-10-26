import jieba


def jieba_tokenizer(text):
    """jieba tokenizer used across build and runtime. Returns list of tokens."""
    try:
        s = text if isinstance(text, str) else str(text)
        tokens = jieba.lcut(s)
        return [t for t in tokens if t.strip()]
    except Exception:
        return []
