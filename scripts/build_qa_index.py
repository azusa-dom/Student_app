# scripts/build_qa_index.py
import json
from pathlib import Path
import sys
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from scripts.tokenizers import jieba_tokenizer

PROGRAMS_PATH = Path('public/data/ucl_programs.json')
SERVICES_PATH = Path('public/data/ucl_services.json')
INDEX_PATH = Path('data/qa_index.pkl')
STOPWORDS_PATH = Path('data/cn_en_stopwords.txt')
INDEX_PATH.parent.mkdir(parents=True, exist_ok=True)

def load_json(p: Path):
    with open(p, 'r', encoding='utf-8') as f:
        return json.load(f)

def load_stopwords(p: Path):
    if not p.exists():
        print(f"Warning: stopwords missing at {p}")
        return []
    words = set()
    with open(p, 'r', encoding='utf-8') as f:
        for line in f:
            words.update(line.strip().lower().split())
    return list(words)

def infer_level(title: str) -> str:
    tl = (title or "").lower()
    if any(k in tl for k in ["msc", "mres", "mphil", "master", "ma", "mph", "meng"]):
        return "postgraduate"
    if any(k in tl for k in ["ba", "bsc", "llb", "undergraduate"]):
        return "undergraduate"
    return "unknown"

def extract_text(item: dict) -> str:
    parts = []
    title = item.get('title') or item.get('service_name') or item.get('program_name') or item.get('name') or ""
    if title:
        parts.append(' '.join([title] * 3))  # 标题提权

        # 课程层级提示词（影响 TF-IDF）
        lvl = infer_level(title)
        parts.append(f"type: {lvl} program")

    url = item.get('url')
    if url:
        parts.append(url.replace('-', ' ').replace('/', ' '))

    sections = item.get('sections', [])
    important = ['entry requirements', 'language requirements', 'admission', 'requirements', 'grades', 'gpa']
    for sec in sections or []:
        heading = (sec.get('heading') or '').lower()
        text = sec.get('text') or ''
        if not text:
            continue
        if heading:
            parts.append(f"{heading}: {text}")
        else:
            parts.append(text)
        if any(k in heading for k in important):
            parts.append(text)  # 再加一遍提权

    desc = (
        item.get('description') or item.get('content') or item.get('details') or
        item.get('info') or item.get('text') or ''
    )
    if desc:
        parts.append(str(desc))

    for key in ['entry_requirements', 'requirements', 'gpa_info', 'category', 'type']:
        val = item.get(key)
        if val:
            parts.append(str(val))
            if 'require' in key.lower() or 'gpa' in key.lower():
                parts.append(str(val))  # 再加一遍提权

    text = ' '.join(parts).strip()
    return text if text else "document"

def build_index():
    print("Loading data...")
    programs = load_json(PROGRAMS_PATH)
    services = load_json(SERVICES_PATH)
    stopwords = load_stopwords(STOPWORDS_PATH)

    documents = []
    metadata = []

    # 课程
    for it in programs:
        text = extract_text(it)
        documents.append(text)
        metadata.append({
            'type': 'program',
            'title': it.get('title', 'Unknown Program'),
            'url': it.get('url', ''),
            'source': 'ucl_programs.json',
            'level': infer_level(it.get('title', '')),
            'content': text,  # 🔥 关键：把正文存进来
        })

    # 服务
    for it in services:
        text = extract_text(it)
        documents.append(text)
        metadata.append({
            'type': 'service',
            'title': it.get('service_name', it.get('title', 'Unknown Service')),
            'url': it.get('url', ''),
            'source': 'ucl_services.json',
            'level': 'service',
            'content': text,  # 🔥 关键：把正文存进来
        })

    print(f"Total docs: {len(documents)} | Stopwords: {len(stopwords)}")
    vectorizer = TfidfVectorizer(
        tokenizer=jieba_tokenizer,
        token_pattern=None,
        ngram_range=(1, 2),      # (1,2) 足够，速度更快
        max_features=15000,      # 控内存
        stop_words=stopwords,
        min_df=2,
        sublinear_tf=True
    )
    tfidf = vectorizer.fit_transform(documents)

    with open(INDEX_PATH, 'wb') as f:
        pickle.dump({
            'vectorizer': vectorizer,
            'tfidf_matrix': tfidf,
            'metadata': metadata
        }, f)

    print(f"Index saved: {INDEX_PATH.resolve()}")

if __name__ == '__main__':
    build_index()
