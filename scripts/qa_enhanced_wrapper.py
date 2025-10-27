#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""增强版 QA Wrapper - 支持中英文 + Groq"""

import os, sys, json, time, logging, traceback
from pathlib import Path
from typing import List, Dict, Any

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / "scripts"))

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("qa_enhanced_wrapper")

# 导入 LLM 客户端（优先 llm_client）
try:
    from scripts.llm_client import chat_with_groq, is_configured as groq_configured
    logger.info("Using llm_client.py")
except Exception as e1:
    try:
        from scripts.groq_client import chat_with_groq, is_configured as groq_configured
        logger.info("Using groq_client.py")
    except Exception as e2:
        logger.warning(f"LLM import failed: {e1}, {e2}")
        def groq_configured(): return False
        def chat_with_groq(*a, **k): raise Exception("LLM not available")

# 导入检索器
try:
    from scripts.enhanced_retriever import EnhancedRetriever
    HAVE_RETRIEVER = True
except Exception:
    HAVE_RETRIEVER = False

PROGRAMS_PATH = ROOT / "public/data/ucl_programs.json"
SERVICES_PATH = ROOT / "public/data/ucl_services.json"

def _load_documents() -> List[Dict]:
    documents = []
    for path, name in [(PROGRAMS_PATH, "programs"), (SERVICES_PATH, "services")]:
        if path.exists():
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    documents.extend(data)
                logger.info(f"Loaded {len(data)} {name}")
            except Exception as e:
                logger.error(f"Load {name} failed: {e}")
    return documents

def _detect_intent(q: str) -> str:
    ql = q.lower()
    if any(k in ql for k in ['language', '语言', 'ielts', 'toefl', 'requirement']):
        return 'requirements'
    if any(k in ql for k in ['module', '课程', 'core']):
        return 'modules'
    if any(k in ql for k in ['career', 'counseling', 'book', '预约']):
        return 'services'
    return 'general'

def _simple_fallback_search(query: str, documents: List[Dict], top_k: int = 8) -> List[Dict]:
    qlower = query.lower()
    results = []
    for doc in documents:
        text = ' '.join([doc.get('title','')] + [
            f"{s.get('heading','')} {s.get('text','')}" for s in doc.get('sections',[][:5])
        ]).lower()
        score = sum(text.count(w) * 2 for w in qlower.split() if len(w) > 2)
        if score > 0:
            results.append({'doc': doc, 'score': score, 'intent': _detect_intent(query)})
    results.sort(key=lambda x: x['score'], reverse=True)
    return results[:top_k]

def _build_context_from_results(results: List[Dict]) -> str:
    parts = []
    for r in results[:3]:
        doc = r.get('doc', {})
        title = doc.get('title', 'Unknown')
        for s in doc.get('sections', [])[:4]:
            h, t = s.get('heading', ''), s.get('text', '')[:900]
            if t and len(t) > 50:
                parts.append(f"【{title} - {h}】\n{t}")
                break
    return "\n\n".join(parts)

def _clean_text(text: str) -> str:
    if not text: return ""
    noise = ['click here', 'view details', 'read more', 'for more information']
    for n in noise:
        text = text.replace(n, '')
    return '. '.join([s.strip() for s in text.split('.')[:5] if len(s) > 40])

def _extract_key_info(results: List[Dict], lang: str) -> str:
    if not results:
        return "抱歉，未找到相关信息。" if lang == "zh" else "No information found."
    extracted = []
    for r in results[:3]:
        doc = r.get('doc', {})
        for s in doc.get('sections', [])[:4]:
            t = _clean_text(s.get('text', ''))
            if len(t) > 100:
                extracted.append(f"**{doc.get('title','')} - {s.get('heading','')}**:\n{t[:600]}")
                break
    return '\n\n'.join(extracted[:2]) or ("找到相关内容，但无法提取详情。" if lang == "zh" else "Found content but no details.")

def _generate_smart_answer_using_llm(query: str, results: List[Dict], language: str = "en") -> str:
    context = _build_context_from_results(results)
    if language == "zh":
        system = """你是 UCL 信息助手。用中文提取并总结官方文档中的具体信息。用 • 列出要求/模块。答案 <150 字。"""
        user = f"文档：{context}\n问题：{query}\n用中文回答。"
    else:
        system = """You are a UCL assistant. Extract facts from documents. Use • for lists. Keep <150 words."""
        user = f"Documents:{context}\nQuestion: {query}\nAnswer in English."

    messages = [{"role": "system", "content": system}, {"role": "user", "content": user}]
    try:
        if groq_configured():
            ans = chat_with_groq(messages)
            if ans and len(ans) > 30 and "cannot" not in ans.lower():
                return ans
    except: pass
    return _extract_key_info(results, language)

def answer_enhanced(query: str, top_k: int = 8, language: str = "en") -> Dict[str, Any]:
    start = time.time()
    docs = _load_documents()
    if not docs:
        return {"intent": "error", "answer": "数据未加载", "citations": [], "response_time": f"{time.time()-start:.2f}s"}

    search_results = []
    if HAVE_RETRIEVER:
        try:
            retriever = EnhancedRetriever()
            raw = retriever.search_with_context(query, docs, top_k)
            search_results = [{'doc': r.get('doc', r), 'score': r.get('score', 0), 'intent': _detect_intent(query)} for r in raw]
        except Exception as e:
            logger.warning(f"Retriever failed: {e}")
    if not search_results:
        search_results = _simple_fallback_search(query, docs, top_k)

    answer = _generate_smart_answer_using_llm(query, search_results, language)
    citations = [
        {'title': d.get('doc', {}).get('title', ''), 'url': d.get('doc', {}).get('url', ''), 'relevance_score': d.get('score', 0)}
        for d in search_results[:6]
    ]

    return {
        "intent": search_results[0].get('intent', 'general') if search_results else "unknown",
        "answer": answer,
        "citations": citations,
        "rewritten_queries": [],
        "reranked": search_results,
        "response_time": f"{time.time()-start:.2f}s"
    }