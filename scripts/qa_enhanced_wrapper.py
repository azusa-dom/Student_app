#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""qa_enhanced_wrapper.py - 完全增强版（智能语言切换）"""

import os, sys, json, time, logging, re
from pathlib import Path
from typing import List, Dict, Any

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / "scripts"))

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("qa_enhanced_wrapper")

# ============ 导入 LLM 客户端 ============
try:
    from scripts.llm_client import chat_with_groq, is_configured as groq_configured
    logger.info("✅ Using llm_client.py")
except Exception as e1:
    try:
        from scripts.groq_client import chat_with_groq, is_configured as groq_configured
        logger.info("✅ Using groq_client.py")
    except Exception as e2:
        logger.warning(f"❌ LLM import failed: {e1}, {e2}")
        def groq_configured(): return False
        def chat_with_groq(*a, **k): raise Exception("LLM not available")

# ============ 导入检索器 ============
try:
    from scripts.enhanced_retriever import EnhancedRetriever
    HAVE_RETRIEVER = True
    logger.info("✅ Enhanced retriever loaded")
except Exception as e:
    HAVE_RETRIEVER = False
    logger.warning(f"⚠️  Retriever not available: {e}")

PROGRAMS_PATH = ROOT / "public/data/ucl_programs.json"
SERVICES_PATH = ROOT / "public/data/ucl_services.json"

# ============ 🔥 语言检测 ============
def detect_language(text: str) -> str:
    """检测文本语言"""
    chinese_chars = len(re.findall(r'[\u4e00-\u9fff]', text))
    if chinese_chars > 0:
        return "zh"
    return "en"

# ============ 文档加载 ============
def _load_documents() -> List[Dict]:
    documents = []
    for path, name in [(PROGRAMS_PATH, "programs"), (SERVICES_PATH, "services")]:
        if path.exists():
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    documents.extend(data)
                logger.info(f"✅ Loaded {len(data)} {name}")
            except Exception as e:
                logger.error(f"❌ Load {name} failed: {e}")
    return documents

# ============ 意图检测 ============
def _detect_intent(q: str) -> str:
    ql = q.lower()
    if any(k in ql for k in ['language', '语言', 'ielts', 'toefl', 'requirement', '要求']):
        return 'requirements'
    if any(k in ql for k in ['module', '课程', 'core', 'curriculum', '模块']):
        return 'modules'
    if any(k in ql for k in ['career', 'counseling', 'book', '预约', '就业']):
        return 'services'
    if any(k in ql for k in ['fee', 'tuition', 'cost', '学费', '费用']):
        return 'fees'
    return 'general'

# ============ 简单搜索（fallback）============
def _simple_fallback_search(query: str, documents: List[Dict], top_k: int = 8) -> List[Dict]:
    qlower = query.lower()
    results = []
    for doc in documents:
        text = ' '.join([doc.get('title','')] + [
            f"{s.get('heading','')} {s.get('text','')}" 
            for s in doc.get('sections',[])[:5]
        ]).lower()
        score = sum(text.count(w) * 2 for w in qlower.split() if len(w) > 2)
        if score > 0:
            results.append({
                'doc': doc, 
                'score': score, 
                'intent': _detect_intent(query)
            })
    results.sort(key=lambda x: x['score'], reverse=True)
    return results[:top_k]

# ============ 构建上下文 ============
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

# ============ 清理文本 ============
def _clean_text(text: str) -> str:
    if not text: return ""
    noise = ['click here', 'view details', 'read more', 'for more information']
    for n in noise:
        text = text.replace(n, '')
    return '. '.join([s.strip() for s in text.split('.')[:5] if len(s) > 40])

# ============ 🔥 提取关键信息（支持中英文）============
def _extract_key_info(results: List[Dict], lang: str) -> str:
    if not results:
        return "抱歉，未找到相关信息。" if lang == "zh" else "No relevant information found."
    
    extracted = []
    for r in results[:3]:
        doc = r.get('doc', {})
        title = doc.get('title', '')
        for s in doc.get('sections', [])[:4]:
            heading = s.get('heading', '')
            text = _clean_text(s.get('text', ''))
            if len(text) > 100:
                extracted.append(f"**{title} - {heading}**:\n{text[:600]}")
                break
    
    if not extracted:
        return "找到相关内容，但无法提取详情。" if lang == "zh" else "Found content but unable to extract details."
    
    return '\n\n'.join(extracted[:2])

# ============ 🔥 智能生成答案（强化语言控制）============
def _generate_smart_answer_using_llm(
    query: str, 
    results: List[Dict], 
    language: str = "auto"
) -> str:
    """使用 LLM 生成智能答案，强制语言控制"""
    
    # 🔥 自动检测语言
    if language == "auto" or not language:
        language = detect_language(query)
        logger.info(f"🌐 自动检测语言: {language}")
    
    context = _build_context_from_results(results)
    
    if language == "zh":
        # 🔥 中文 Prompt - 极度强化
        system = """你是 UCL 信息助手。

【严格规则】
1. 你必须用中文回答，绝对不要使用英文
2. 从文档中提取准确信息
3. 使用 • 符号列出要点
4. 保持简洁，少于150字
5. 如果文档是英文，翻译成中文后回答

记住：你的回答必须全部是中文！"""
        
        user = f"""文档内容：
{context}

用户问题：{query}

请用中文回答，不要使用任何英文。"""
    
    else:
        # 英文 Prompt
        system = """You are a UCL information assistant.

Rules:
- Extract accurate information from documents
- Answer in English only
- Use • for bullet points
- Keep under 150 words
- Be specific and factual"""
        
        user = f"""Documents:
{context}

User Question: {query}

Answer in English."""
    
    messages = [
        {"role": "system", "content": system},
        {"role": "user", "content": user}
    ]
    
    try:
        if groq_configured():
            logger.info(f"🤖 调用 LLM (language={language})...")
            ans = chat_with_groq(messages, temperature=0.1)
            
            # 🔥 验证语言是否正确
            if language == "zh":
                chinese_chars = len(re.findall(r'[\u4e00-\u9fff]', ans))
                if chinese_chars < 10:  # 中文字符太少
                    logger.warning("⚠️  LLM 返回了英文，使用 fallback")
                    return _extract_key_info(results, language)
            
            if ans and len(ans) > 30:
                logger.info(f"✅ LLM 回答成功 ({len(ans)} chars)")
                return ans
    
    except Exception as e:
        logger.error(f"❌ LLM 调用失败: {e}")
    
    # Fallback
    logger.info("⚠️  使用 fallback 提取")
    return _extract_key_info(results, language)

# ============ 🔥 主函数 ============
def answer_enhanced(
    query: str, 
    top_k: int = 8, 
    language: str = "auto"
) -> Dict[str, Any]:
    """增强版问答 - 支持自动语言检测"""
    
    start = time.time()
    
    # 自动检测语言
    if language == "auto" or not language:
        language = detect_language(query)
    
    logger.info(f"{'='*60}")
    logger.info(f"🔍 Query: {query}")
    logger.info(f"🌐 Language: {language}")
    logger.info(f"{'='*60}")
    
    # 加载文档
    docs = _load_documents()
    if not docs:
        return {
            "intent": "error",
            "answer": "数据未加载" if language == "zh" else "Data not loaded",
            "citations": [],
            "rewritten_queries": [],
            "reranked": [],
            "response_time": f"{time.time()-start:.2f}s"
        }
    
    # 检索
    search_results = []
    if HAVE_RETRIEVER:
        try:
            retriever = EnhancedRetriever()
            raw = retriever.search_with_context(query, docs, top_k)
            search_results = [
                {
                    'doc': r.get('doc', r),
                    'score': r.get('score', 0),
                    'intent': _detect_intent(query)
                } 
                for r in raw
            ]
            logger.info(f"✅ Retriever 返回 {len(search_results)} 个结果")
        except Exception as e:
            logger.warning(f"⚠️  Retriever 失败: {e}")
    
    if not search_results:
        logger.info("⚠️  使用 fallback 搜索")
        search_results = _simple_fallback_search(query, docs, top_k)
    
    # 生成答案
    answer = _generate_smart_answer_using_llm(query, search_results, language)
    
    # 构建引用
    citations = [
        {
            'title': d.get('doc', {}).get('title', ''),
            'url': d.get('doc', {}).get('url', ''),
            'relevance_score': d.get('score', 0)
        }
        for d in search_results[:6]
    ]
    
    rt = f"{time.time()-start:.2f}s"
    logger.info(f"✅ 完成: {rt}")
    
    return {
        "intent": search_results[0].get('intent', 'general') if search_results else "unknown",
        "answer": answer,
        "citations": citations,
        "rewritten_queries": [],  # 🔥 前端需要
        "reranked": search_results,
        "response_time": rt
    }