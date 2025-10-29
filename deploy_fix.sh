#!/bin/bash
# 🚀 UCL AI Assistant - 一键修复部署脚本
# 
# 使用方法:
#   chmod +x deploy_fix.sh
#   ./deploy_fix.sh

set -e  # 遇到错误立即停止

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║     🚀 UCL AI Assistant - 终极修复部署                       ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# 检查是否在正确的目录
if [ ! -f "api_qa.py" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    echo "   当前目录: $(pwd)"
    exit 1
fi

echo "📂 当前目录: $(pwd)"
echo ""

# 步骤 1: 备份原文件
echo "📦 步骤 1/4: 备份原文件..."
mkdir -p backups
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
if [ -f "scripts/enhanced_retriever.py" ]; then
    cp scripts/enhanced_retriever.py "backups/enhanced_retriever_${TIMESTAMP}.py"
    echo "  ✅ 已备份 enhanced_retriever.py"
fi
if [ -f "scripts/qa_enhanced_wrapper.py" ]; then
    cp scripts/qa_enhanced_wrapper.py "backups/qa_enhanced_wrapper_${TIMESTAMP}.py"
    echo "  ✅ 已备份 qa_enhanced_wrapper.py"
fi
echo ""

# 步骤 2: 下载修复文件
echo "📥 步骤 2/4: 准备修复文件..."

# 创建 enhanced_retriever.py 修复版
cat > scripts/enhanced_retriever.py << 'RETRIEVER_EOF'
"""增强版检索器 - 完全修复版

修复内容:
1. 所有空值检查和容错处理
2. 防止 NoneType 迭代错误  
3. 完善的异常处理
"""

from __future__ import annotations
import json, logging, math, re
from collections import Counter
from difflib import SequenceMatcher
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)

try:
    from sentence_transformers import SentenceTransformer, util
    import torch
    HAVE_SEMANTIC = True
except:
    HAVE_SEMANTIC = False

try:
    import jieba
    HAVE_JIEBA = True
    logger.info("✅ jieba loaded")
except:
    HAVE_JIEBA = False

class ScoringConfig:
    KEYWORD_IN_TITLE = 14
    EXACT_QUERY_MATCH = 36
    SYNONYM_MATCH = 28
    PROGRAM_PREFIX_MATCH = 60
    PROGRAM_CONTAINS_MATCH = 32
    FUZZY_MATCH_MULTIPLIER = 24
    DEGREE_TAG_MATCH = 12
    INTENT_HEADING_MATCH = 20
    KEYWORD_IN_HEADING = 10
    KEYWORD_IN_TEXT_PER_OCCURRENCE = 3
    MAX_KEYWORD_TEXT_SCORE = 18
    LIST_STRUCTURE_BONUS = 15
    COURSE_CODE_BONUS = 10
    LEVEL_BOOST = 12
    LEVEL_PENALTY = -8
    SEMANTIC_MULTIPLIER = 40
    SECTION_LENGTH_NORMALIZATION_BASE = 150

class CommonPhrases:
    PHRASES = {
        "language requirements": ["entry requirements", "english language", "ielts", "toefl"],
        "core modules": ["compulsory modules", "core courses", "required modules"],
        "tuition fees": ["fees", "cost", "tuition", "funding"],
        "entry requirements": ["admission", "qualification", "prerequisite"],
    }

class EnhancedRetriever:
    def __init__(self, enable_semantic=True, cache_embeddings=True):
        self.enable_semantic = enable_semantic and HAVE_SEMANTIC
        self.cache_embeddings = cache_embeddings
        
        self.intent_keywords = {
            "modules": ["module", "course", "curriculum", "syllabus", "课程", "模块"],
            "requirements": ["requirement", "entry", "admission", "ielts", "toefl", "要求"],
            "career": ["career", "job", "employment", "就业", "职业"],
            "fees": ["fee", "tuition", "cost", "学费", "费用"],
            "services": ["service", "support", "help", "counseling", "服务", "支持"]
        }
        
        self.intent_headings = {
            "modules": ["module", "curriculum", "teaching", "compulsory"],
            "requirements": ["entry", "requirement", "admission", "qualification"],
            "career": ["career", "employment", "graduate"],
            "fees": ["fee", "tuition", "cost"],
            "services": ["service", "support", "counseling"]
        }
        
        self.custom_synonyms = {
            "data science": ["data science", "数据科学", "analytics"],
            "computer science": ["computer science", "computing"],
        }
        
        self.domain_vocab = self._build_domain_vocab()
        self.semantic_model = None
        self._section_embeddings_cache = {}
        
        if self.enable_semantic:
            self._load_semantic_model()
    
    def detect_intent(self, query: str) -> str:
        """🔥 完全防护的意图检测"""
        if not query:
            return "general"
        try:
            query_lower = query.lower()
        except:
            return "general"
        
        for intent, keywords in self.intent_keywords.items():
            if not keywords:
                continue
            try:
                for kw in keywords:
                    if kw and isinstance(kw, str) and kw in query_lower:
                        return intent
            except:
                continue
        return "general"
    
    def search_with_context(self, query: str, documents: List[dict], top_k: int = 8) -> List[Dict]:
        """🔥 完全防护的检索方法"""
        if not query or not documents:
            return []
        
        try:
            keywords = self._extract_smart_keywords(query)
            if not keywords:
                keywords = [w for w in query.lower().split() if len(w) > 2]
        except:
            keywords = [w for w in query.lower().split() if len(w) > 2]
        
        try:
            intent = self.detect_intent(query)
        except:
            intent = "general"
        
        query_lower = query.lower()
        results = []
        
        for doc_idx, doc in enumerate(documents):
            try:
                title_raw = doc.get("title")
                if not title_raw or not isinstance(title_raw, str):
                    continue
                
                title_lower = title_raw.lower()
                title_score, title_hits = self._score_title_similarity(title_lower, keywords, query_lower)
                level_score = self._score_level(doc, query_lower)
                
                sections = doc.get("sections")
                if not sections or not isinstance(sections, list):
                    sections = []
                
                sections_score, matched_sections = self._score_sections(sections, keywords, intent)
                base_score = title_score + level_score + sections_score
                
                if base_score <= 0:
                    continue
                
                results.append({
                    "doc": doc,
                    "score": base_score,
                    "title_score": title_score,
                    "sections_score": sections_score,
                    "semantic_score": 0,
                    "level_score": level_score,
                    "matched_sections": matched_sections,
                    "title_matches": title_hits,
                    "intent": intent,
                })
            except:
                continue
        
        results.sort(key=lambda x: x["score"], reverse=True)
        logger.info(f"📊 找到 {len(results)} 个文档")
        return results[:top_k]
    
    def _score_level(self, doc, query_lower):
        if not doc:
            return 0.0
        level = str(doc.get("level", "")).lower()
        if not level:
            return 0.0
        score = 0.0
        if any(m in query_lower for m in ("msc", "master", "硕士")):
            if any(m in level for m in ("postgraduate", "msc", "master")):
                score += 12
        return score
    
    def _score_title_similarity(self, title_lower, keywords, query_lower):
        score, matches = 0.0, []
        if not title_lower or not keywords:
            return score, matches
        
        for kw in keywords:
            if kw and isinstance(kw, str) and len(kw) > 2 and kw in title_lower:
                score += 14
                matches.append(kw)
        return score, matches
    
    def _score_sections(self, sections, keywords, intent):
        """🔥 完全防护的章节评分"""
        if not sections or not isinstance(sections, list):
            return 0.0, []
        if not keywords:
            keywords = []
        
        score = 0.0
        relevant_sections = []
        target_headings = self.intent_headings.get(intent, [])
        
        for section in sections:
            if not section or not isinstance(section, dict):
                continue
            
            try:
                heading = section.get("heading") or ""
                text = section.get("text") or ""
                
                if not isinstance(heading, str):
                    heading = ""
                if not isinstance(text, str):
                    text = ""
                
                if not heading and not text:
                    continue
                
                heading_lower = heading.lower()
                text_lower = text.lower()
                section_score = 0.0
                
                for th in target_headings:
                    if th and isinstance(th, str) and th in heading_lower:
                        section_score += 20
                
                for kw in keywords:
                    if kw and isinstance(kw, str):
                        if kw in heading_lower:
                            section_score += 10
                        section_score += min(text_lower.count(kw) * 3, 18)
                
                if section_score > 0:
                    relevant_sections.append({
                        "heading": heading,
                        "text": text[:1000],
                        "score": section_score
                    })
                    score += section_score
            except:
                continue
        
        relevant_sections.sort(key=lambda x: x["score"], reverse=True)
        return score, relevant_sections[:5]
    
    def _extract_smart_keywords(self, query):
        if not query:
            return []
        
        stopwords = {"what", "how", "the", "is", "are", "的", "是", "有", "吗"}
        query_lower = query.lower()
        
        english_words = re.findall(r"\b[a-z]+\b", query_lower)
        keywords = [w for w in english_words if w not in stopwords and len(w) > 2]
        
        chinese_matches = re.findall(r"[\u4e00-\u9fff]+", query)
        for chunk in chinese_matches:
            if HAVE_JIEBA:
                keywords.extend([t for t in jieba.cut(chunk) if len(t) > 1 and t not in stopwords])
        
        return keywords
    
    def _load_semantic_model(self):
        pass
    
    def _build_domain_vocab(self):
        return set()

def create_retriever(enable_semantic=True, cache_embeddings=True):
    return EnhancedRetriever(enable_semantic=enable_semantic, cache_embeddings=cache_embeddings)
RETRIEVER_EOF

echo "  ✅ 创建 enhanced_retriever.py"

# 创建 qa_enhanced_wrapper.py 修复版
cat > scripts/qa_enhanced_wrapper.py << 'WRAPPER_EOF'
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""qa_enhanced_wrapper.py - 终极修复版

核心修复:
1. 智能判断本地结果质量
2. 质量差时直接联网搜索
3. 强制语言控制
4. 绝不说废话
"""

import os, sys, json, time, logging, re
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / "scripts"))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("qa_wrapper")

try:
    from scripts.llm_client import chat_with_groq, is_configured as groq_configured
    logger.info("✅ Using llm_client.py")
except:
    try:
        from scripts.groq_client import chat_with_groq, is_configured as groq_configured
        logger.info("✅ Using groq_client.py")
    except:
        def groq_configured(): return False
        def chat_with_groq(*a, **k): raise Exception("LLM not available")

try:
    from scripts.enhanced_retriever import EnhancedRetriever
    HAVE_RETRIEVER = True
except:
    HAVE_RETRIEVER = False

try:
    from scripts.web_search import search_web
    HAVE_WEB_SEARCH = True
except:
    HAVE_WEB_SEARCH = False

PROGRAMS_PATH = ROOT / "public/data/ucl_programs.json"
SERVICES_PATH = ROOT / "public/data/ucl_services.json"

def detect_language(text: str) -> str:
    """检测语言 - 有中文就返回中文"""
    if not text:
        return "en"
    chinese_chars = len(re.findall(r'[\u4e00-\u9fff]', text))
    return "zh" if chinese_chars > 0 else "en"

def validate_answer_language(answer: str, expected_lang: str) -> bool:
    """验证答案语言"""
    if not answer:
        return False
    chinese_chars = len(re.findall(r'[\u4e00-\u9fff]', answer))
    total_chars = len(answer.replace(" ", "").replace("\n", ""))
    if expected_lang == "zh":
        return chinese_chars > total_chars * 0.5
    return chinese_chars < total_chars * 0.2

def _is_result_quality_good(results: List[Dict], query: str) -> bool:
    """判断本地结果质量"""
    if not results:
        return False
    best_score = results[0].get('score', 0)
    matched_sections = results[0].get('matched_sections', [])
    
    if best_score >= 40 and len(matched_sections) >= 2:
        return True
    
    intent = results[0].get('intent', 'general')
    if intent in ['modules', 'requirements', 'fees']:
        if best_score >= 30 and len(matched_sections) >= 1:
            return True
    
    logger.warning(f"⚠️  本地质量差: score={best_score:.1f}, sections={len(matched_sections)}")
    return False

@lru_cache(maxsize=1)
def _load_documents() -> List[Dict]:
    documents = []
    for path, name in [(PROGRAMS_PATH, "programs"), (SERVICES_PATH, "services")]:
        if not path.exists():
            continue
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
                documents.extend(data)
            logger.info(f"✅ Loaded {len(data)} {name}")
        except Exception as e:
            logger.error(f"❌ Load {name} failed: {e}")
    return documents

def _detect_intent(q: str) -> str:
    ql = q.lower()
    if any(k in ql for k in ['language', '语言', 'ielts', 'requirement', '要求']):
        return 'requirements'
    if any(k in ql for k in ['module', '课程', 'curriculum', '模块']):
        return 'modules'
    if any(k in ql for k in ['career', 'counseling', '预约', 'support', '支持']):
        return 'services'
    if any(k in ql for k in ['fee', 'tuition', '学费', '费用']):
        return 'fees'
    return 'general'

def _build_context_from_results(results: List[Dict]) -> str:
    """构建上下文"""
    if not results:
        return ""
    snippets = []
    for idx, result in enumerate(results[:5], 1):
        doc = result.get("doc", {})
        title = doc.get("title", "Unknown")
        source = result.get("source", "local")
        source_tag = "🌐 Web" if source == "web" else "📚 Local"
        
        sections = result.get("matched_sections") or doc.get("sections", [])
        if not sections:
            continue
        
        doc_snippets = []
        for section in sections[:3]:
            if not isinstance(section, dict):
                continue
            heading = section.get("heading", "")
            text = section.get("text", "")
            if not text or len(text) < 30:
                continue
            cleaned_text = text.strip()[:600]
            if heading:
                doc_snippets.append(f"  • {heading}:\n    {cleaned_text}")
            else:
                doc_snippets.append(f"  • {cleaned_text}")
        
        if doc_snippets:
            snippet_text = "\n".join(doc_snippets)
            snippets.append(f"[{idx}] {source_tag} {title}\n{snippet_text}")
    
    context = "\n\n".join(snippets)
    logger.info(f"📝 Context: {len(context)} chars from {len(snippets)} docs")
    return context

def _generate_smart_answer_using_llm(
    query: str,
    results: List[Dict],
    language: str = "auto",
    force_web_search: bool = False
) -> str:
    """🔥 生成智能答案 - 绝不说废话"""
    
    if language == "auto" or not language:
        language = detect_language(query)
    
    context = _build_context_from_results(results)
    
    # 判断是否需要联网
    need_web = force_web_search or not context or not _is_result_quality_good(results, query)
    
    if need_web and HAVE_WEB_SEARCH:
        logger.info("🌐 启动联网搜索...")
        try:
            web_results = search_web(query, language)
            if web_results:
                logger.info(f"✅ 联网成功: {len(web_results)} 结果")
                web_context = []
                for web_res in web_results[:3]:
                    web_context.append(f"【{web_res['title']}】\n{web_res['snippet']}")
                context = "\n\n".join(web_context)
        except Exception as e:
            logger.error(f"❌ 联网失败: {e}")
    
    if not context:
        if language == "zh":
            return "抱歉,暂时无法找到相关信息。建议:\n• 访问 UCL 官网\n• 联系招生办\n• 换个方式提问"
        return "Sorry, couldn't find information. Suggestions:\n• Visit UCL website\n• Contact admissions\n• Rephrase question"
    
    # 构建 Prompt
    if language == "zh":
        system = """你是 UCL 智能助手。

规则:
1. 只用中文回答
2. 直接回答,不说"文档没提到"
3. 用 • 列要点
4. 150字内
5. 信息不完整时,给已知信息+建议访问官网"""
        
        user = f"""信息:
{context}

问题: {query}

直接用中文回答,不要说废话!"""
    else:
        system = """You are UCL assistant.

Rules:
1. Answer in English
2. Answer directly, no "documents don't mention"
3. Use • bullets
4. Under 150 words
5. If incomplete, give known info + suggest website"""
        
        user = f"""Info:
{context}

Question: {query}

Answer directly, no nonsense!"""
    
    messages = [
        {"role": "system", "content": system},
        {"role": "user", "content": user}
    ]
    
    # 调用 LLM (最多2次)
    for attempt in range(2):
        try:
            if groq_configured():
                logger.info(f"🤖 LLM (lang={language}, try={attempt+1})...")
                ans = chat_with_groq(messages, temperature=0.1)
                
                # 检查废话
                forbidden = [
                    "the provided documents do not mention",
                    "the documents do not mention",
                    "not mentioned",
                    "文档中没有提到",
                    "提供的文档没有"
                ]
                
                has_forbidden = any(phrase in ans.lower() for phrase in forbidden)
                
                if has_forbidden:
                    logger.warning(f"⚠️  废话检测 (try {attempt+1})")
                    if attempt == 0:
                        system += "\n\n绝对不要说'文档没提到'!"
                        messages = [
                            {"role": "system", "content": system},
                            {"role": "user", "content": user}
                        ]
                        continue
                
                # 验证语言
                if validate_answer_language(ans, language):
                    logger.info(f"✅ 答案OK ({len(ans)} chars)")
                    return ans
                else:
                    logger.warning(f"⚠️  语言错误 (try {attempt+1})")
                    if attempt == 0 and language == "zh":
                        system = "你必须用中文!不要英文!"
                        user = f"信息:{context}\n\n问题:{query}\n\n纯中文回答!"
                        messages = [
                            {"role": "system", "content": system},
                            {"role": "user", "content": user}
                        ]
                        continue
        except Exception as e:
            logger.error(f"❌ LLM失败: {e}")
            break
    
    # Fallback提取
    logger.warning("⚠️  使用提取模式")
    extracted = []
    for r in results[:2]:
        doc = r.get('doc', {})
        title = doc.get('title', '')
        sections = r.get('matched_sections', [])
        for s in sections[:2]:
            heading = s.get('heading', '') if isinstance(s, dict) else ''
            text = s.get('text', '') or '' if isinstance(s, dict) else ''
            if len(text) > 80:
                clean = text.strip()[:400]
                extracted.append(f"• {heading}: {clean}")
                break
    
    if language == "zh":
        header = "根据 UCL 资料:\n\n"
        footer = "\n\n💡 更多详情访问 UCL 官网"
    else:
        header = "Based on UCL info:\n\n"
        footer = "\n\n💡 Visit UCL website for details"
    
    return header + "\n\n".join(extracted[:3]) + footer if extracted else (
        "建议访问 UCL 官网" if language == "zh" else "Visit UCL website"
    )

def answer_enhanced(
    query: str,
    top_k: int = 8,
    language: str = "auto"
) -> Dict[str, Any]:
    """主函数"""
    start = time.time()
    
    if language == "auto" or not language:
        language = detect_language(query)
    
    logger.info(f"{'='*60}")
    logger.info(f"🔍 Query: {query}")
    logger.info(f"🌐 Language: {language}")
    logger.info(f"{'='*60}")
    
    docs = _load_documents()
    search_results = []
    detected_intent = _detect_intent(query)
    
    if HAVE_RETRIEVER and docs:
        try:
            retriever = EnhancedRetriever(enable_semantic=False, cache_embeddings=False)
            raw = retriever.search_with_context(query, docs, top_k)
            search_results = [
                {
                    'doc': r.get('doc', r),
                    'score': r.get('score', 0),
                    'intent': r.get('intent', detected_intent),
                    'matched_sections': r.get('matched_sections', []),
                    'source': 'local'
                }
                for r in raw
            ]
            if search_results:
                detected_intent = search_results[0].get('intent', detected_intent)
            logger.info(f"✅ 本地: {len(search_results)} 结果")
        except Exception as e:
            logger.warning(f"⚠️  检索失败: {e}")
    
    # 判断是否强制联网
    force_web = not _is_result_quality_good(search_results, query)
    
    # 生成答案
    answer = _generate_smart_answer_using_llm(query, search_results, language, force_web)
    
    # 最终废话检查
    forbidden = [
        "the provided documents do not mention",
        "the documents do not mention",
        "not mentioned",
        "文档中没有提到"
    ]
    
    if any(phrase in answer.lower() for phrase in forbidden):
        logger.warning("⚠️  最终废话检测,紧急联网")
        if HAVE_WEB_SEARCH:
            try:
                web_results = search_web(query, language)
                if web_results:
                    web_search_results = []
                    for web_res in web_results:
                        web_search_results.append({
                            'doc': {
                                'title': web_res['title'],
                                'url': web_res['url'],
                                'sections': [{'heading': 'Web', 'text': web_res['snippet']}]
                            },
                            'score': 30,
                            'intent': detected_intent,
                            'matched_sections': [{'heading': 'Web', 'text': web_res['snippet']}],
                            'source': 'web'
                        })
                    search_results = web_search_results
                    answer = _generate_smart_answer_using_llm(query, search_results, language, True)
            except Exception as e:
                logger.error(f"❌ 紧急联网失败: {e}")
    
    # 构建引用
    citations = []
    for d in search_results[:6]:
        doc = d.get('doc', {})
        citations.append({
            'title': doc.get('title', ''),
            'url': doc.get('url', ''),
            'relevance_score': d.get('score', 0),
            'source': d.get('source', 'local')
        })
    
    rt = f"{time.time()-start:.2f}s"
    logger.info(f"✅ 完成: {rt}")
    
    return {
        "intent": detected_intent,
        "answer": answer,
        "citations": citations,
        "rewritten_queries": [],
        "reranked": search_results,
        "response_time": rt,
        "num_docs": len(search_results),
        "num_queries": 1,
        "web_search_used": any(r.get('source') == 'web' for r in search_results)
    }
WRAPPER_EOF

echo "  ✅ 创建 qa_enhanced_wrapper.py"
echo ""

# 步骤 3: 验证文件
echo "🔍 步骤 3/4: 验证文件..."
if [ -f "scripts/enhanced_retriever.py" ] && [ -f "scripts/qa_enhanced_wrapper.py" ]; then
    echo "  ✅ 所有文件已就位"
else
    echo "  ❌ 文件创建失败"
    exit 1
fi
echo ""

# 步骤 4: 重启服务提示
echo "🚀 步骤 4/4: 准备就绪!"
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  ✅ 修复部署完成!                                            ║"
echo "║                                                              ║"
echo "║  下一步:                                                     ║"
echo "║  1. 停止当前服务 (Ctrl+C)                                   ║"
echo "║  2. 重启: python api_qa.py                                   ║"
echo "║  3. 测试: python test_fixes.py                               ║"
echo "║                                                              ║"
echo "║  备份位置: backups/                                          ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
