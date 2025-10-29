#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
qa_enhanced_wrapper_FIXED_V2.py - 修复 logging 错误

关键修复：正确处理 llm_client 的所有异常
"""

import os, re, json, time, logging
from pathlib import Path
from typing import Any, Dict, List

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("qa_wrapper")

ROOT = Path(__file__).resolve().parents[1]
PROGRAMS_PATH = ROOT / "public" / "data" / "ucl_programs.json"
SERVICES_PATH = ROOT / "public" / "data" / "ucl_services.json"

def _load_documents() -> List[Dict]:
    docs: List[Dict] = []
    for p in (PROGRAMS_PATH, SERVICES_PATH):
        if p.exists():
            try:
                data = json.loads(p.read_text(encoding="utf-8"))
                if isinstance(data, list):
                    docs.extend(data)
                    logger.info(f"✅ 加载 {p.name}: {len(data)} 个文档")
            except Exception as e:
                logger.warning(f"⚠️ 加载 {p.name} 失败: {e}")
    logger.info(f"📚 总共加载 {len(docs)} 个文档")
    return docs

def _detect_language(text: str) -> str:
    if not text:
        return "en"
    text = text.strip()
    if not text:
        return "en"
    chinese_chars = len(re.findall(r"[\u4e00-\u9fff]", text))
    total_chars = len(text)
    if total_chars == 0:
        return "en"
    chinese_ratio = chinese_chars / total_chars
    logger.debug(f"语言检测: '{text[:50]}...' | 中文: {chinese_chars}/{total_chars} ({chinese_ratio:.1%})")
    return "zh" if chinese_ratio > 0.2 else "en"

def _detect_intent(q: str) -> str:
    ql = (q or "").lower()
    intent_patterns = {
        "language_requirements": ["ielts", "toefl", "language requirement", "english", "语言要求", "雅思", "托福"],
        "requirements": ["entry requirement", "admission", "prerequisite", "入学", "申请", "要求", "资格"],
        "modules": ["module", "course", "curriculum", "syllabus", "课程", "模块", "compulsory", "core", "必修"],
        "fees": ["fee", "tuition", "cost", "scholarship", "学费", "费用", "奖学金", "price"],
        "career": ["career", "employment", "job", "就业", "职业", "工作"],
        "services": ["service", "support", "counseling", "咨询", "服务", "支持"],
    }
    for intent, patterns in intent_patterns.items():
        if any(k in ql for k in patterns):
            return intent
    return "general"

def _pick_best_snippets(results: List[Dict]) -> str:
    if not results:
        return ""
    parts = []
    for r in results[:3]:
        doc = r.get("doc", {})
        title = doc.get("title", "")
        matched_sections = r.get("matched_sections", [])
        for sec in matched_sections[:2]:
            heading = sec.get("heading", "")
            text = sec.get("text", "")
            if not text:
                continue
            text = text.replace("\u00a0", " ")
            text = re.sub(r'\s+', ' ', text).strip()
            text = text[:800]
            if title and heading:
                snippet = f"【{title} - {heading}】\n{text}"
            elif title:
                snippet = f"【{title}】\n{text}"
            else:
                snippet = text
            parts.append(snippet)
    context = "\n\n".join(parts)
    return context[:2500]

def _format_answer_with_llm(context: str, query: str, lang: str) -> str:
    """使用 LLM 格式化答案（完整修复版）"""
    if not context:
        if lang == "zh":
            return "抱歉，未检索到相关信息。建议访问 UCL 官网获取最新信息。"
        else:
            return "Sorry, no relevant information found. Please check the UCL official website."
    
    # 🔥 修复：三层异常处理
    try:
        # 第1层：尝试导入
        try:
            from scripts.llm_client import chat_with_groq, is_configured
        except ImportError as e:
            logger.warning(f"⚠️ 无法导入 llm_client: {e}")
            return _format_answer_simple(context, lang)
        
        # 第2层：检查配置
        try:
            if not is_configured():
                logger.warning("⚠️ LLM 未配置 (GROQ_API_KEY 未设置)")
                return _format_answer_simple(context, lang)
        except Exception as e:
            logger.warning(f"⚠️ 检查 LLM 配置失败: {e}")
            return _format_answer_simple(context, lang)
        
        # 构建提示词
        if lang == "zh":
            system_prompt = "你是 UCL（伦敦大学学院）的AI助手。用简洁、专业、友好的中文回答。"
            user_prompt = f"""根据参考信息用中文回答。

问题：{query}
参考：{context}

要求：
1. 必须用中文
2. 清晰组织答案
3. 专业但友好
4. 只基于参考信息

回答："""
        else:
            system_prompt = "You are UCL AI assistant. Answer in concise, professional English."
            user_prompt = f"""Answer based on reference.

Question: {query}
Reference: {context}

Requirements:
1. English only
2. Clear organization
3. Professional tone
4. Reference-based only

Answer:"""
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        
        logger.info(f"🤖 使用 LLM 生成 {lang} 答案...")
        
        # 第3层：调用 API
        try:
            answer = chat_with_groq(messages=messages, temperature=0.3, max_retries=2)
        except Exception as e:
            logger.error(f"❌ Groq API 调用失败: {e}")
            return _format_answer_simple(context, lang)
        
        if not answer or len(answer.strip()) < 20:
            logger.warning("⚠️ LLM 返回答案过短")
            return _format_answer_simple(context, lang)
        
        # 验证语言
        detected_lang = _detect_language(answer)
        if detected_lang != lang and lang == "zh" and detected_lang == "en":
            logger.warning(f"⚠️ 语言不匹配，降级")
            return _format_answer_simple(context, lang)
        
        logger.info(f"✅ LLM 答案: {len(answer)} 字符")
        return answer.strip()
        
    except Exception as e:
        logger.error(f"❌ LLM 异常: {e}")
        logger.info("🔄 降级到简单格式化")
        return _format_answer_simple(context, lang)

def _format_answer_simple(context: str, lang: str) -> str:
    if not context:
        return "抱歉，未找到相关信息。" if lang == "zh" else "Sorry, no information found."
    sentences = re.split(r'[。！？.!?]+', context)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 20]
    if not sentences:
        return context[:500]
    bullets = [f"• {s}" for s in sentences[:5]]
    answer = "\n".join(bullets)
    if lang == "zh":
        answer += "\n\n💡 建议访问 UCL 官网获取详细信息。"
    else:
        answer += "\n\n💡 Visit UCL website for details."
    return answer

def answer_enhanced(query: str, top_k: int = 8, language: str = "auto", **kwargs) -> Dict[str, Any]:
    t0 = time.time()
    if language == "auto":
        language = _detect_language(query)
    intent = _detect_intent(query)
    logger.info(f"🔍 查询: '{query}' | 语言: {language} | 意图: {intent}")
    docs = _load_documents()
    reranked: List[Dict[str, Any]] = []
    semantic_used = False
    try:
        from scripts.enhanced_retriever import EnhancedRetriever
        logger.info("🧠 语义检索...")
        retriever = EnhancedRetriever(enable_semantic=True)
        raw = retriever.search_with_context(query=query, documents=docs, top_k=max(5, top_k), intent=intent)
        if raw:
            logger.info(f"✅ 语义检索: {len(raw)} 个结果")
            for r in raw:
                reranked.append({"doc": r.get("doc", {}), "score": float(r.get("score", 0.0)), "matched_sections": r.get("matched_sections", [])})
            semantic_used = True
    except Exception as e:
        logger.error(f"❌ 语义检索失败: {e}")
    if not reranked:
        logger.info("🔄 关键词检索...")
        reranked = _keyword_fallback(query, docs, intent, top_k)
    logger.info(f"✅ 查询完成: {len(reranked)} 个结果")
    context = _pick_best_snippets(reranked)
    answer = _format_answer_with_llm(context, query, language)
    citations = []
    for item in reranked[:5]:
        d = item.get("doc", {})
        citations.append({"title": d.get("title", ""), "url": d.get("url", ""), "relevance_score": float(item.get("score", 0.0)), "source": "local"})
    rt = f"{time.time() - t0:.2f}s"
    result = {"intent": intent, "answer": answer, "citations": citations, "reranked": reranked, "rewritten_queries": [], "response_time": rt, "num_docs": len(reranked), "language": language, "web_search_used": False, "semantic_used": semantic_used}
    logger.info(f"✅ 问答完成: {rt}, {len(answer)} 字符")
    return result

def _keyword_fallback(query: str, docs: List[Dict], intent: str, top_k: int) -> List[Dict]:
    keywords = _extract_keywords(query)
    if not keywords:
        return []
    scored: List[Dict[str, Any]] = []
    for d in docs:
        if not d or not isinstance(d, dict):
            continue
        result = _score_document_keyword(d, keywords, intent)
        if result["score"] > 0:
            scored.append({"doc": d, "score": result["score"], "matched_sections": result.get("matched_sections", [])})
    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:max(1, min(top_k, 10))]

def _extract_keywords(query: str) -> List[str]:
    stopwords = {"what", "how", "where", "when", "which", "who", "the", "a", "an", "is", "are", "was", "were", "do", "does", "did", "about", "for", "的", "是", "有", "在", "吗", "呢", "啊", "了"}
    keywords = []
    english_words = re.findall(r"\b[a-z]+\b", query.lower())
    keywords.extend([w for w in english_words if w not in stopwords and len(w) > 2])
    chinese_matches = re.findall(r"[\u4e00-\u9fff]+", query)
    for chunk in chinese_matches:
        for i in range(len(chunk) - 1):
            keywords.append(chunk[i:i+2])
            if i + 3 <= len(chunk):
                keywords.append(chunk[i:i+3])
    return list(set(keywords))

def _score_document_keyword(doc: Dict, keywords: List[str], intent: str) -> Dict[str, Any]:
    score = 0.0
    title = (doc.get("title") or "").lower()
    title_hits = []
    for k in keywords:
        if k and k in title:
            score += 8
            title_hits.append(k)
    level = str(doc.get("level", "")).lower()
    if any(x in level for x in ["msc", "master", "postgraduate"]):
        score += 3
    matched_sections: List[Dict] = []
    sections = doc.get("sections") or []
    intent_headings = {
        "modules": ["module", "curriculum", "syllabus", "compulsory", "optional", "课程"],
        "requirements": ["entry", "requirement", "admission", "qualification", "入学", "要求"],
        "fees": ["fee", "tuition", "cost", "scholarship", "学费", "费用"],
        "career": ["career", "employment", "就业", "职业"],
        "services": ["service", "support", "咨询", "服务"],
    }.get(intent, [])
    for s in sections[:30]:
        if not isinstance(s, dict):
            continue
        heading = (s.get("heading") or "")
        text = (s.get("text") or "")
        if not heading and not text:
            continue
        hlow, tlow = heading.lower(), text.lower()
        sec_score = 0.0
        if any(h in hlow for h in intent_headings):
            sec_score += 8
        hitk = sum(1 for k in keywords[:50] if k and (k in hlow or k in tlow))
        sec_score += min(hitk, 6) * 2
        if sec_score > 0:
            matched_sections.append({"heading": heading, "text": text[:600].replace("\u00a0", " "), "score": sec_score})
            score += sec_score
    matched_sections.sort(key=lambda x: x["score"], reverse=True)
    return {"score": score, "title_hits": list(set(title_hits)), "matched_sections": matched_sections[:5]}
