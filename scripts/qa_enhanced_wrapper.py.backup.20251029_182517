#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
qa_enhanced_wrapper_FINAL.py - 完整修复版
修复：语义检索参数 + 语言检测 + LLM答案格式化
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
    """加载文档"""
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
    """
    改进的语言检测
    
    策略：计算中文字符占比
    - 中文字符 > 20% → zh
    - 否则 → en
    """
    if not text:
        return "en"
    
    text = text.strip()
    if not text:
        return "en"
    
    # 统计中文字符
    chinese_chars = len(re.findall(r"[\u4e00-\u9fff]", text))
    total_chars = len(text)
    
    if total_chars == 0:
        return "en"
    
    chinese_ratio = chinese_chars / total_chars
    
    # 调试日志
    logger.debug(f"语言检测: '{text[:50]}...' | 中文字符: {chinese_chars}/{total_chars} ({chinese_ratio:.1%})")
    
    # 20% 阈值
    return "zh" if chinese_ratio > 0.2 else "en"

def _detect_intent(q: str) -> str:
    """检测查询意图"""
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
    """
    提取最佳片段
    
    Returns:
        格式化的上下文字符串
    """
    if not results:
        return ""
    
    parts = []
    
    for r in results[:3]:  # 取前3个结果
        doc = r.get("doc", {})
        title = doc.get("title", "")
        
        matched_sections = r.get("matched_sections", [])
        
        for sec in matched_sections[:2]:  # 每个文档取2个section
            heading = sec.get("heading", "")
            text = sec.get("text", "")
            
            if not text:
                continue
            
            # 清理文本
            text = text.replace("\u00a0", " ")  # 替换不间断空格
            text = re.sub(r'\s+', ' ', text).strip()  # 压缩空白
            text = text[:800]  # 截断
            
            # 构建片段
            if title and heading:
                snippet = f"【{title} - {heading}】\n{text}"
            elif title:
                snippet = f"【{title}】\n{text}"
            else:
                snippet = text
            
            parts.append(snippet)
    
    context = "\n\n".join(parts)
    return context[:2500]  # 总长度限制

def _format_answer_with_llm(context: str, query: str, lang: str) -> str:
    """
    使用 LLM 格式化答案
    
    Args:
        context: 检索到的上下文
        query: 用户查询
        lang: 目标语言 (zh/en)
    
    Returns:
        格式化后的答案
    """
    if not context:
        if lang == "zh":
            return "抱歉，未检索到相关信息。建议访问 UCL 官网获取最新信息，或尝试换个说法重新提问。"
        else:
            return "Sorry, no relevant information found. Please check the UCL official website for the latest details, or try rephrasing your question."
    
    # 尝试使用 LLM
    try:
        from scripts.llm_client import chat_with_groq, is_configured
        
        if not is_configured():
            logger.warning("⚠️ LLM 未配置 (GROQ_API_KEY)，使用简单格式化")
            return _format_answer_simple(context, lang)
        
        # 🔥 构建提示词（根据语言）
        if lang == "zh":
            system_prompt = "你是 UCL（伦敦大学学院）的AI助手。请用简洁、专业、友好的中文回答用户问题。"
            user_prompt = f"""请根据以下参考信息，用中文回答用户的问题。

用户问题：
{query}

参考信息：
{context}

要求：
1. 必须用中文回答
2. 直接回答问题，不要重复问题
3. 用清晰的段落或要点组织答案
4. 保持专业但友好的语气
5. 如果信息不完整，建议用户访问 UCL 官网
6. 不要编造信息，只基于参考信息回答

回答："""
        else:
            system_prompt = "You are an AI assistant for UCL (University College London). Answer user questions in concise, professional, and friendly English."
            user_prompt = f"""Please answer the user's question based on the following reference information.

User Question:
{query}

Reference Information:
{context}

Requirements:
1. Answer in English
2. Be direct and concise
3. Organize the answer in clear paragraphs or bullet points
4. Maintain a professional but friendly tone
5. If information is incomplete, suggest visiting the UCL website
6. Do not make up information - only answer based on the reference

Answer:"""
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        
        logger.info(f"🤖 使用 LLM 生成 {lang} 答案...")
        
        # 调用 Groq API
        answer = chat_with_groq(
            messages=messages,
            temperature=0.3,  # 降低温度，更加准确
            max_retries=2
        )
        
        if not answer or len(answer.strip()) < 20:
            logger.warning("⚠️ LLM 返回答案过短，使用简单格式化")
            return _format_answer_simple(context, lang)
        
        # 验证答案语言
        detected_lang = _detect_language(answer)
        if detected_lang != lang:
            logger.warning(f"⚠️ LLM 返回语言不匹配: 期望 {lang}, 实际 {detected_lang}")
            logger.warning(f"答案预览: {answer[:100]}...")
            
            # 如果差异很大，使用简单格式化
            if lang == "zh" and detected_lang == "en":
                return _format_answer_simple(context, lang)
        
        logger.info(f"✅ LLM 答案生成成功: {len(answer)} 字符")
        return answer.strip()
        
    except Exception as e:
        logger.error(f"❌ LLM 格式化失败: {e}")
        logger.info("🔄 降级到简单格式化")
        return _format_answer_simple(context, lang)

def _format_answer_simple(context: str, lang: str) -> str:
    """
    简单格式化（LLM 不可用时的降级方案）
    
    Args:
        context: 上下文
        lang: 语言
    
    Returns:
        格式化的答案
    """
    if not context:
        if lang == "zh":
            return "抱歉，未找到相关信息。"
        else:
            return "Sorry, no relevant information found."
    
    # 分句
    sentences = re.split(r'[。！？.!?]+', context)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 20]
    
    if not sentences:
        return context[:500]
    
    # 格式化为要点
    bullets = [f"• {s}" for s in sentences[:5]]
    answer = "\n".join(bullets)
    
    # 添加提示
    if lang == "zh":
        answer += "\n\n💡 建议访问 UCL 官网获取更详细信息。"
    else:
        answer += "\n\n💡 For more details, please visit the UCL official website."
    
    return answer

def answer_enhanced(query: str, top_k: int = 8, language: str = "auto", **kwargs) -> Dict[str, Any]:
    """
    增强版问答（完整修复版）
    
    Args:
        query: 用户查询
        top_k: 返回结果数
        language: 语言 (auto/zh/en)
        **kwargs: 其他参数
    
    Returns:
        问答结果字典
    """
    t0 = time.time()
    
    # 语言检测
    if language == "auto":
        language = _detect_language(query)
    
    intent = _detect_intent(query)
    
    logger.info(f"🔍 查询: '{query}' | 语言: {language} | 意图: {intent}")
    
    # 加载文档
    docs = _load_documents()
    
    reranked: List[Dict[str, Any]] = []
    semantic_used = False
    
    # 🔥 尝试语义检索（修复参数）
    try:
        from scripts.enhanced_retriever import EnhancedRetriever
        
        logger.info("🧠 尝试语义检索...")
        
        # ⚡ 关键修复：不传 cache_embeddings 参数
        retriever = EnhancedRetriever(enable_semantic=True)
        
        raw = retriever.search_with_context(
            query=query,
            documents=docs,
            top_k=max(5, top_k),
            intent=intent
        )
        
        if raw:
            logger.info(f"✅ 语义检索成功: {len(raw)} 个结果")
            
            for r in raw:
                reranked.append({
                    "doc": r.get("doc", {}),
                    "score": float(r.get("score", 0.0)),
                    "matched_sections": r.get("matched_sections", [])
                })
            
            semantic_used = True
        else:
            logger.warning("⚠️ 语义检索返回空结果")
    
    except Exception as e:
        logger.error(f"❌ 语义检索失败: {e}")
    
    # 降级到关键词
    if not reranked:
        logger.info("🔄 降级到关键词检索...")
        reranked = _keyword_fallback(query, docs, intent, top_k)
    
    logger.info(f"✅ 查询完成: semantic={semantic_used}, {len(reranked)} 个结果")
    
    # 🔥 提取上下文并用 LLM 格式化
    context = _pick_best_snippets(reranked)
    answer = _format_answer_with_llm(context, query, language)
    
    # 构建引用
    citations = []
    for item in reranked[:5]:
        d = item.get("doc", {})
        citations.append({
            "title": d.get("title", ""),
            "url": d.get("url", ""),
            "relevance_score": float(item.get("score", 0.0)),
            "source": "local"
        })
    
    rt = f"{time.time() - t0:.2f}s"
    
    result = {
        "intent": intent,
        "answer": answer,
        "citations": citations,
        "reranked": reranked,
        "rewritten_queries": [],
        "response_time": rt,
        "num_docs": len(reranked),
        "language": language,
        "web_search_used": False,
        "semantic_used": semantic_used
    }
    
    logger.info(f"✅ 问答完成: {rt}, {len(answer)} 字符")
    
    return result

def _keyword_fallback(query: str, docs: List[Dict], intent: str, top_k: int) -> List[Dict]:
    """关键词降级检索"""
    keywords = _extract_keywords(query)
    logger.info(f"📝 提取关键词: {keywords[:10]}")
    
    if not keywords:
        logger.warning("⚠️ 未提取到关键词")
        return []
    
    scored: List[Dict[str, Any]] = []
    for d in docs:
        if not d or not isinstance(d, dict):
            continue
        
        result = _score_document_keyword(d, keywords, intent)
        if result["score"] > 0:
            scored.append({
                "doc": d,
                "score": result["score"],
                "matched_sections": result.get("matched_sections", [])
            })
    
    scored.sort(key=lambda x: x["score"], reverse=True)
    
    final_results = scored[:max(1, min(top_k, 10))]
    logger.info(f"✅ 关键词检索完成: {len(final_results)} 个结果")
    
    return final_results

def _extract_keywords(query: str) -> List[str]:
    """提取关键词"""
    stopwords = {
        "what", "how", "where", "when", "which", "who", "the", "a", "an",
        "is", "are", "was", "were", "do", "does", "did", "about", "for",
        "的", "是", "有", "在", "吗", "呢", "啊", "了", "和"
    }
    
    keywords = []
    
    # 英文关键词
    english_words = re.findall(r"\b[a-z]+\b", query.lower())
    keywords.extend([w for w in english_words if w not in stopwords and len(w) > 2])
    
    # 中文关键词（简单n-gram）
    chinese_matches = re.findall(r"[\u4e00-\u9fff]+", query)
    for chunk in chinese_matches:
        for i in range(len(chunk) - 1):
            keywords.append(chunk[i:i+2])
            if i + 3 <= len(chunk):
                keywords.append(chunk[i:i+3])
    
    return list(set(keywords))

def _score_document_keyword(doc: Dict, keywords: List[str], intent: str) -> Dict[str, Any]:
    """关键词打分"""
    score = 0.0
    
    # 标题匹配
    title = (doc.get("title") or "").lower()
    title_hits = []
    for k in keywords:
        if k and k in title:
            score += 8
            title_hits.append(k)
    
    # Level 匹配
    level = str(doc.get("level", "")).lower()
    if any(x in level for x in ["msc", "master", "postgraduate", "研究生"]):
        score += 3
    
    # Section 匹配
    matched_sections: List[Dict] = []
    sections = doc.get("sections") or []
    
    intent_headings = {
        "modules": ["module", "curriculum", "syllabus", "compulsory", "optional", "课程", "模块"],
        "requirements": ["entry", "requirement", "admission", "qualification", "english", "语言", "入学", "要求"],
        "fees": ["fee", "tuition", "cost", "scholarship", "学费", "费用", "奖学金"],
        "career": ["career", "employment", "prospect", "就业", "职业"],
        "services": ["service", "support", "counseling", "咨询", "服务"],
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
        
        # Intent 匹配
        if any(h in hlow for h in intent_headings):
            sec_score += 8
        
        # 关键词匹配
        hitk = sum(1 for k in keywords[:50] if k and (k in hlow or k in tlow))
        sec_score += min(hitk, 6) * 2
        
        if sec_score > 0:
            matched_sections.append({
                "heading": heading,
                "text": text[:600].replace("\u00a0", " "),
                "score": sec_score
            })
            score += sec_score
    
    matched_sections.sort(key=lambda x: x["score"], reverse=True)
    
    return {
        "score": score,
        "title_hits": list(set(title_hits)),
        "matched_sections": matched_sections[:5]
    }


# ============ 测试 ============
if __name__ == "__main__":
    print("=" * 60)
    print("🧪 测试问答系统")
    print("=" * 60)
    
    test_queries = [
        ("What are the tuition fees for Data Science MSc?", "auto"),
        ("数据科学硕士的学费是多少？", "auto"),
        ("IELTS requirements", "auto"),
    ]
    
    for query, lang in test_queries:
        print(f"\n{'='*60}")
        print(f"查询: {query}")
        print(f"语言: {lang}")
        print('='*60)
        
        result = answer_enhanced(query, top_k=5, language=lang)
        
        print(f"\n检测语言: {result['language']}")
        print(f"意图: {result['intent']}")
        print(f"语义检索: {result['semantic_used']}")
        print(f"响应时间: {result['response_time']}")
        print(f"\n答案:\n{result['answer']}")
        print()
    
    print("=" * 60)
    print("✅ 测试完成")
    print("=" * 60)
