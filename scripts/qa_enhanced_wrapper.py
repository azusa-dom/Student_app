#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
qa_enhanced_wrapper.py - 终极优化版 (中文搜索修复)
修复：
1. [关键] 修复 _extract_program_name，增加中文别名映射 (如 "计算机" -> "computer science")
2. [关键] 修复 _extract_keywords，引入 jieba 进行中文分词 (替换掉无用的 n-gram)
3. [关键] 优化 Web 搜索逻辑，当检测到中文查询+程序别名时，优先搜索英文以提高成功率。
4. [关键] 重写 LLM 提示词，解决“回答愚蠢” (Data Science) 和“回答混乱” (Computer Science) 的问题。
"""

import os
import re
import json
import time
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional
from collections import defaultdict

# 基础日志配置
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("qa_wrapper")

# 导入 Web 搜索
try:
    from scripts.web_search import search_web
    HAVE_WEB_SEARCH = True
    logger.info("✅ web_search 模块加载成功")
except Exception as e:
    logger.warning(f"⚠️ web_search 模块加载失败: {e}")
    HAVE_WEB_SEARCH = False

# ✅ [本次修复] 导入 Jieba
try:
    import jieba
    HAVE_JIEBA = True
    logger.info("✅ jieba 加载成功")
except ImportError:
    HAVE_JIEBA = False
    logger.warning("⚠️ jieba 未安装, 中文分词将回退到 n-gram")


# 路径配置
ROOT = Path(__file__).resolve().parents[1] if "__file__" in globals() else Path.cwd()
PROGRAMS_PATH = ROOT / "public" / "data" / "ucl_programs.json"
SERVICES_PATH = ROOT / "public" / "data" / "ucl_services.json"

# 全局缓存
_GLOBAL_DOCS: List[Dict] = []
_PROGRAM_INDEX: Dict[str, List[Dict]] = {} 

# ✅ [本次修复] 中文别名映射
PROGRAM_ALIASES = {
    "computer science": ["computer science", "计算机科学", "计算机"],
    "data science": ["data science", "数据科学"],
    "intercultural communication": ["intercultural communication", "跨文化交流"],
    "global health": ["global health", "全球健康", "全球健康管理"],
    "language requirements": ["language requirements", "语言要求", "雅思", "ielts", "toefl", "托福"],
    "entry requirements": ["entry requirements", "入学要求"],
    "modules": ["modules", "课程", "模块"],
    "fees": ["fees", "tuition", "学费"],
}


def _build_program_index(docs: List[Dict]) -> Dict[str, List[Dict]]:
    """构建专业名称索引，用于快速查找"""
    index = defaultdict(list)
    
    for doc in docs:
        title = (doc.get("title") or "").lower()
        
        # 完整标题
        index[title].append(doc)
        
        # 分词索引（如 "data science msc" -> "data", "science", "msc"）
        words = title.split()
        for word in words:
            if len(word) > 2:
                index[word].append(doc)
        
        # 缩写索引
        if "msc" in title: index["msc"].append(doc); index["master"].append(doc)
        if "ma" in title: index["ma"].append(doc); index["master"].append(doc)
        if "bsc" in title: index["bsc"].append(doc); index["bachelor"].append(doc)
        if "ba" in title: index["ba"].append(doc); index["bachelor"].append(doc)
        
        # 特殊专业关键词
        for internal_name, aliases in PROGRAM_ALIASES.items():
            if any(alias in title for alias in aliases if len(alias) > 3): # 避免 "ba" 匹配 "data"
                for kw in internal_name.split(): # 使用内部英文名建立索引
                    index[kw].append(doc)
    
    return dict(index)

def _load_documents() -> List[Dict]:
    """加载文档并建立索引"""
    global _GLOBAL_DOCS, _PROGRAM_INDEX
    
    if _GLOBAL_DOCS:
        return _GLOBAL_DOCS
    
    docs = []
    for path in (PROGRAMS_PATH, SERVICES_PATH):
        if path.exists():
            try:
                data = json.loads(path.read_text(encoding="utf-8"))
                if isinstance(data, list):
                    docs.extend(data)
                    logger.info(f"✅ 加载 {path.name}: {len(data)} 个文档")
            except Exception as e:
                logger.warning(f"⚠️ 加载 {path.name} 失败: {e}")
    
    logger.info(f"📚 总共加载 {len(docs)} 个文档")
    
    _GLOBAL_DOCS = docs
    _PROGRAM_INDEX = _build_program_index(docs)
    logger.info(f"📑 建立索引: {len(_PROGRAM_INDEX)} 个关键词")
    
    return docs

def _extract_program_name(query: str) -> Optional[str]:
    """✅ [本次修复] 从查询中提取专业名称 (支持中文)"""
    query_lower = query.lower()
    
    # 1. 检查中文别名
    for internal_name, aliases in PROGRAM_ALIASES.items():
        if any(alias in query_lower for alias in aliases):
            logger.info(f"💡 检测到别名，匹配到: {internal_name}")
            return internal_name # 返回内部英文名

    # 2. 检查英文模式
    patterns = [
        r"([\w\s]+)\s+(msc|ma|bsc|ba|phd)",  # "Data Science MSc"
        r"(msc|ma|bsc|ba|phd)\s+in\s+([\w\s]+)",  # "MSc in Data Science"
        r"([\w\s]+)\s+(master|bachelor|doctorate)",  # "Data Science Master"
    ]
    
    for pattern in patterns:
        match = re.search(pattern, query_lower)
        if match:
            # 返回匹配到的短语，例如 "data science msc"
            return match.group(0).strip()
    
    return None


def _smart_search(query: str, docs: List[Dict], top_k: int = 10) -> List[Dict]:
    """智能搜索：结合索引查找和相关性评分"""
    query_lower = query.lower()
    results = []
    seen_titles = set()
    
    # 1. 首先尝试精确匹配专业名称
    program_name = _extract_program_name(query)
    program_words = set((program_name or "").split())
    
    if program_name:
        logger.info(f"🎯 检测到专业名称: {program_name}")
        
        candidate_docs = [] 
        for word in program_words:
            if word in _PROGRAM_INDEX and _PROGRAM_INDEX[word]:
                candidate_docs.extend(_PROGRAM_INDEX[word]) 
        
        logger.info(f"📊 找到 {len(candidate_docs)} 个专业相关的候选")

        for doc in candidate_docs:
            title = doc.get("title", "")
            if not title or title in seen_titles:
                continue
            
            seen_titles.add(title)
            title_lower = title.lower()
            
            score = 0
            # [新] 检查内部名称是否在标题中
            if all(word in title_lower for word in program_words):
                score = 100
            elif program_name in title_lower:
                score = 90
            
            if score > 0:
                results.append({
                    "doc": doc,
                    "score": score + _calculate_relevance(doc, [], query), # 加上内容分
                    "matched_sections": _extract_relevant_sections(doc, query, program_name) # 传入 program_name
                })

    
    # 2. 关键词搜索
    keywords = _extract_keywords(query)
    logger.info(f"📝 关键词: {keywords[:10]}")
    
    for doc in docs:
        title = doc.get("title", "")
        if not title or title in seen_titles:
            continue
        
        score = _calculate_relevance(doc, keywords, query)
        if score > 0:
            results.append({
                "doc": doc,
                "score": score,
                "matched_sections": _extract_relevant_sections(doc, query)
            })
            seen_titles.add(title)
    
    # 3. 排序并返回
    results.sort(key=lambda x: x["score"], reverse=True)
    final_results = results[:top_k]
    
    top_score = results[0]['score'] if results else 0
    logger.info(f"✅ 找到 {len(final_results)} 个相关结果 (Top score: {top_score})")
    return final_results

def _extract_keywords(query: str) -> List[str]:
    """✅ [本次修复] 提取查询关键词 (使用 Jieba)"""
    stopwords = {
        "what", "how", "where", "when", "which", "who", "the", "a", "an",
        "is", "are", "was", "were", "do", "does", "did", "about", "for",
        "of", "in", "on", "at", "to",
        "的", "是", "有", "在", "吗", "呢", "啊", "了", "和", "与", "什么", "要求", "专业"
    }
    
    keywords = []
    query_lower = query.lower()
    
    # 提取英文单词
    english_words = re.findall(r'\b[a-z]{3,}\b', query_lower) # 至少3个字母
    keywords.extend([w for w in english_words if w not in stopwords])
    
    # ✅ [修复] 使用 Jieba 提取中文关键词
    chinese_matches = re.findall(r"[\u4e00-\u9fff]+", query)
    if HAVE_JIEBA:
        for chunk in chinese_matches:
            keywords.extend([
                token for token in jieba.cut(chunk) 
                if len(token) > 1 and token not in stopwords
            ])
    else:
        # 降级：如果 jieba 失败
        for chunk in chinese_matches:
            for i in range(len(chunk) - 1):
                keywords.append(chunk[i:i+2])

    # 添加专业相关扩展词 (基于英文意图)
    intent = _detect_intent(query_lower)
    if intent == "modules":
        keywords.extend(["compulsory", "core", "optional", "elective", "curriculum"])
    if intent in ("requirements", "language_requirements"):
        keywords.extend(["ielts", "toefl", "gpa", "degree", "qualification", "a-level"])
    if intent == "fees":
        keywords.extend(["scholarship", "funding", "payment", "international", "uk", "overseas"])
    
    return list(set(keywords))[:30]  # 限制关键词数量

def _calculate_relevance(doc: Dict, keywords: List[str], query: str) -> float:
    """计算文档相关性得分"""
    score = 0.0
    query_lower = query.lower()
    
    title = (doc.get("title") or "").lower()
    
    # 关键词匹配
    for kw in keywords:
        if kw in title:
            score += 5
            if f" {kw} " in f" {title} ":
                score += 3
    
    # 级别匹配
    level = str(doc.get("level", "")).lower()
    if "msc" in query_lower or "master" in query_lower or "硕士" in query:
        if "msc" in level or "master" in level:
            score += 10
    elif "bsc" in query_lower or "bachelor" in query_lower or "本科" in query:
        if "bsc" in level or "bachelor" in level:
            score += 10
    
    # 内容匹配
    sections = doc.get("sections", [])
    for section in sections[:20]:
        if not isinstance(section, dict): continue
        heading = (section.get("heading") or "").lower()
        text = (section.get("text") or "").lower()
        
        section_score = 0
        for kw in keywords[:15]:
            if kw in heading: section_score += 3
            if kw in text: section_score += 0.5
        
        score += min(section_score, 10)
    
    return score

def _extract_relevant_sections(doc: Dict, query: str, program_name: Optional[str] = None) -> List[Dict]:
    """提取相关章节"""
    query_lower = query.lower()
    keywords = _extract_keywords(query)
    relevant_sections = []
    
    sections = doc.get("sections", [])
    
    # [新] 优先章节 (匹配查询意图)
    priority_headings = []
    priority_terms = {
        "module": ["module", "course", "curriculum", "syllabus", "课程", "模块", "compulsory", "optional"],
        "requirement": ["requirement", "entry", "admission", "qualification", "要求", "入学", "a-level", "ib diploma"],
        "fee": ["fee", "tuition", "cost", "scholarship", "学费", "费用", "funding"],
        "language_requirement": ["ielts", "toefl", "language", "english", "语言", "雅思", "托福"],
        "career": ["career", "employment", "job", "prospect", "就业", "职业"],
    }
    
    intent = _detect_intent(query_lower)
    if intent in priority_terms:
        priority_headings = priority_terms[intent]

    # ✅ [新] 如果是精确的专业搜索，"About this degree" 也是高优先级
    if program_name:
        priority_headings.append("about this degree")

    for section in sections:
        if not isinstance(section, dict):
            continue
        
        heading = section.get("heading", "")
        text = section.get("text", "")
        
        if not text:
            continue
        
        relevance = 0
        heading_lower = heading.lower()
        text_lower = text.lower()
        
        # 1. 意图匹配 (最高权重)
        if any(term in heading_lower for term in priority_headings):
            relevance += 20
        
        # 2. 关键词匹配
        for kw in keywords[:10]:
            if kw in heading_lower:
                relevance += 3
            if kw in text_lower:
                relevance += 1
        
        if relevance > 0:
            relevant_sections.append({
                "heading": heading,
                "text": text[:800],
                "score": relevance
            })
    
    relevant_sections.sort(key=lambda x: x["score"], reverse=True)
    return relevant_sections[:5] 

def _format_context_for_llm(results: List[Dict]) -> str:
    """为LLM准备本地文档的上下文 (移除 '本地' 字样)"""
    if not results:
        return ""
    
    context_parts = []
    
    for i, result in enumerate(results[:3], 1): # 只取 Top 3 文档
        doc = result.get("doc", {})
        title = doc.get("title", "")
        sections = result.get("matched_sections", [])
        
        header = f"\n【{title}】"
        context_parts.append(header)
        
        if sections:
            context_parts.append("相关内容:")
            for section in sections[:3]:
                heading = section.get("heading", "")
                text = section.get("text", "").strip()
                
                if heading:
                    context_parts.append(f"\n▸ {heading}")
                
                if text:
                    text = text.replace("\u00a0", " ")
                    text = re.sub(r'\s+', ' ', text)
                    text = text[:600]
                    context_parts.append(f"  {text}")
        
        context_parts.append("")
    
    return "\n".join(context_parts)

def _pick_best_snippets_from_web(results: List[Dict]) -> str:
    """为LLM准备网络搜索的上下文"""
    if not results:
        return ""
    
    parts = []
    for i, r in enumerate(results[:3], 1):
        title = r.get("title", "")
        snippet = r.get("snippet", "")
        url = r.get("url", "")
        if title and snippet:
            parts.append(f"\n【{title}】\n链接: {url}\n摘要: {snippet}")
    
    return "\n".join(parts)[:1500]

def _generate_comprehensive_answer(context: str, query: str, language: str, has_high_score_local: bool) -> str:
    """
    ✅ [本次修复] 动态提示词
    """
    
    if not context:
        if language == "zh":
            return "抱歉，未找到与您查询相关的信息。请尝试使用更具体的关键词或查询其他专业。"
        else:
            return "Sorry, no relevant information found. Please try with more specific keywords or search for other programs."
    
    if os.getenv("GROQ_API_KEY"):
        try:
            from scripts.llm_client import chat_with_groq
            
            # ✅ [新] 动态选择提示词
            if has_high_score_local:
                # 场景 1: 本地找到了高分匹配 (如 "Data Science MSc")
                # 使用严格的、聚焦的提示词
                logger.info("🤖 使用 [高分聚焦] 提示词...")
                if language == "zh":
                    system_prompt = """你是UCL（伦敦大学学院）的AI助手。
你的**首要任务**是精准回答用户关于**特定专业**的查询。
上下文可能包含多个文档，你**必须**优先使用标题与用户查询最匹配的文档。

**规则：**
1.  **聚焦答案**：如果用户询问特定专业（如 "计算机科学"），你必须在上下文中找到 `【Computer Science BSc】` 或 `【Data Science MSc】` 这样的标题，并**仅基于该文档的信息**进行回答。
2.  **忽略无关项**：**绝对禁止**罗列上下文中其他不相关专业的信息（比如当用户问 "计算机科学" 时，禁止提及 "Urban Spatial Science" 或 "Systems Engineering"）。
3.  **处理坏数据 (关键)**：如果一个文档中同时包含 `Compulsory modules` (模块列表) 和 `Teaching and learning` (教学描述)，你 **必须** 优先使用 `Compulsory modules` 里的列表。**必须忽略** `Teaching and learning` 中关于 "one compulsory module" 之类的模糊总结。
4.  **格式**：使用要点，并在要点之间添加空行 (`\n\n`)。
5.  **态度**：直接回答问题，不要说 "根据找到的信息" 或 "本地文档"。"""
                else:
                    system_prompt = """You are a UCL AI assistant.
Your **primary goal** is to answer the user's query about a **specific program**.
The context contains multiple documents. You **MUST** prioritize the document whose title *best matches* the user's query.

**Rules:**
1.  **Focus**: If the query is about "Computer Science", find the context section starting with `【Computer Science BSc】` or `【Data Science MSc】` and base your answer **ONLY** on that document.
2.  **Ignore Noise**: **Strictly forbid** summarizing other irrelevant programs (e.g., do not mention "Urban Spatial Science" when asked about "Computer Science").
3.  **Handle Bad Data (Critical)**: If a document contains both a `Compulsory modules` section (a list) and a `Teaching and learning` section (a vague summary), you **MUST** use the `Compulsory modules` list. **You MUST IGNORE** vague summaries like "students will take one compulsory module" found in other sections.
4.  **Format**: Use bullet points, with blank lines (`\n\n`) between them for readability.
5.  **Tone**: Be direct. Do not say "Based on the information found" or "local documents"."""
            else:
                # 场景 2: 本地结果分数低，或使用了网络搜索 (如 "全球健康管理")
                # 使用宽松的、总结性的提示词
                logger.info("🤖 使用 [通用总结] 提示词...")
                if language == "zh":
                    system_prompt = """你是UCL（伦敦大学学院）的AI助手。
你的任务是**友好地总结**上下文中与用户问题相关的**所有**信息。

**规则：**
1.  **全面总结**：综合上下文中提供的所有信息（可能来自不同页面）进行回答。
2.  **必须回答**：**必须**根据上下文提供回答。不要说 "抱歉，我无法回答"，而是总结你找到的内容。
3.  **格式**：使用要点，并在要点之间添加空行 (`\n\n`)。
4.  **态度**：直接回答问题。如果信息来自知乎或百度，可以非正式地引用标题。"""
                else:
                    system_prompt = """You are a UCL AI assistant.
Your task is to **helpfully summarize ALL** information from the context that is relevant to the user's query.

**Rules:**
1.  **Summarize All**: Combine information from all context snippets provided.
2.  **Must Answer**: You **must** provide an answer based on the context. Do not say "Sorry, I cannot answer". Instead, summarize what you found.
3.  **Format**: Use bullet points, with blank lines (`\n\n`) between them for readability.
4.  **Tone**: Be direct and helpful."""

            
            user_prompt = f"""Question: {query}

Available Information:
{context}

Please provide a focused and accurate answer based on these rules."""
            
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
            
            answer = chat_with_groq(
                messages=messages,
                temperature=0.0,
                max_retries=2,
                model="llama-3.3-70b-versatile"
            )
            
            if answer and len(answer.strip()) > 30:
                return answer.strip() 
            else:
                logger.warning("LLM 返回过短，降级到简单格式化")

        except Exception as e:
            logger.error(f"❌ LLM调用失败: {e}")
    
    return context 

def _detect_language(text: str) -> str:
    """检测语言"""
    if not text: return "en"
    chinese_chars = len(re.findall(r'[\u4e00-\u9fff]', text))
    total_chars = len(text.strip())
    if total_chars > 0 and chinese_chars / total_chars > 0.3:
        return "zh"
    return "en"

def _detect_intent(query: str) -> str:
    """检测查询意图"""
    q_lower = query.lower()
    
    # [新] 使用别名来检测意图
    for intent, aliases in PROGRAM_ALIASES.items():
        if any(alias in q_lower for alias in aliases):
            # 这是一个 "known_entity" 意图，但我们按要求返回特定意图
            if intent in ("language_requirements", "requirements", "modules", "fees"):
                return intent
    
    # 原始意图检测
    intent_patterns = {
        "career": ["career", "employment", "job", "prospect", "就业", "职业"],
        "services": ["service", "support", "counseling", "咨询", "服务"]
    }
    for intent, patterns in intent_patterns.items():
        if any(p in q_lower for p in patterns):
            return intent
    
    return "general"

def answer_enhanced(
    query: str,
    top_k: int = 10,
    language: str = "auto",
    **kwargs
) -> Dict[str, Any]:
    """主入口函数 - 终极优化版 (Web 搜索集成)"""
    start_time = time.time()
    
    if language == "auto":
        language = _detect_language(query)
    
    intent = _detect_intent(query)
    
    logger.info(f"🔍 查询: '{query[:100]}...' | 语言: {language} | 意图: {intent}")
    
    docs = _load_documents()
    
    local_results = _smart_search(query, docs, top_k)
    
    web_search_used = False
    web_context = ""
    web_citations: List[Dict] = []

    top_score = 0
    if local_results:
        top_score = local_results[0].get("score", 0)

    # 触发条件：1. 本地没结果, 或 2. 本地最高分 < 30
    if (not local_results or top_score < 30) and HAVE_WEB_SEARCH:
        logger.warning(f"⚠️ 本地结果不足 (Top score: {top_score}). 启动网络搜索 for '{query}'...")
        try:
            # ✅ [本次修复] 优化中文的网络搜索
            search_query = query
            program_name = _extract_program_name(query)
            
            if language == 'zh' and program_name:
                # 优先搜索英文术语，成功率更高
                search_query_parts = [program_name]
                if intent == "language_requirements": search_query_parts.append("language requirements")
                elif intent == "requirements": search_query_parts.append("entry requirements")
                elif intent == "modules": search_query_parts.append("modules")
                elif intent == "fees": search_query_parts.append("tuition fees")
                
                search_query = " ".join(search_query_parts)
                logger.info(f"🌐 中文查询映射到英文网络搜索: {search_query}")
            
            web_results = search_web(search_query, language=language, max_results=3)
            logger.info(f"🌐 网络搜索完成: {len(web_results)} 个结果")
            
            if web_results:
                web_search_used = True
                web_context = _pick_best_snippets_from_web(web_results)
                
                for r in web_results:
                    web_citations.append({
                        "title": r.get("title", "Network Source"),
                        "url": r.get("url", ""),
                        "relevance_score": 0.0,
                        "source": "web"
                    })
        except Exception as e:
            logger.error(f"❌ 网络搜索失败: {e}")

    local_context = _format_context_for_llm(local_results)
    
    final_context = (local_context + "\n\n" + web_context).strip()
    
    # ✅ [新] 告知 LLM 使用哪个提示词
    use_strict_prompt = (top_score > 90) and (not web_search_used)
    
    answer = _generate_comprehensive_answer(final_context, query, language, use_strict_prompt)
    
    citations = []
    for result in local_results[:5]:
        doc = result.get("doc", {})
        citations.append({
            "title": doc.get("title", ""),
            "url": doc.get("url", ""),
            "relevance_score": float(result.get("score", 0)),
            "source": "local"
        })
    
    citations.extend(web_citations)
    
    response_time = f"{time.time() - start_time:.2f}s"
    
    logger.info(f"✅ 查询完成: {response_time}, {len(local_results)} (本地), {len(web_citations)} (网络)")
    
    return {
        "intent": intent,
        "answer": answer,
        "citations": citations,
        "reranked": local_results,
        "rewritten_queries": [],
        "response_time": response_time,
        "num_docs": len(local_results),
        "language": language,
        "semantic_used": False,
        "web_search_used": web_search_used
    }

if __name__ == "__main__":
    # 测试
    test_queries = [
        ("What are the modules for Intercultural Communication MA?", "auto"),
        ("Data Science MSc modules", "auto"),
        ("雅思要求", "auto"),
        ("计算机科学入学要求", "auto"),
        ("全球健康管理", "auto"),
    ]
    
    for query, lang in test_queries:
        print(f"\n{'='*60}")
        print(f"查询: {query}")
        print(f"语言: {lang}")
        print('='*60)
        result = answer_enhanced(query, top_k=5, language=lang)
        print(f"找到结果 (本地): {result['num_docs']}")
        print(f"使用网络: {result['web_search_used']}")
        print(f"答案预览: \n{result['answer'][:500]}...")