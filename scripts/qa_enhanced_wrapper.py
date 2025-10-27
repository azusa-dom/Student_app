#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
增强版 QA Wrapper - 智能检索 + 优化 LLM
"""
import os
import sys
import json
import time
import logging
from pathlib import Path
from typing import Dict, List

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# 动态加入项目根路径
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / "scripts"))

# ==================== 导入增强检索器 ====================
from scripts.enhanced_retriever import EnhancedRetriever

# ==================== LLM 客户端 ====================
try:
    from scripts.llm_client import chat_completion, LLMUnavailable, OLLAMA_MODEL, is_configured
    HAVE_LLM = True
    
    if not is_configured():
        logger.warning("⚠️  Ollama 服务未运行")
        HAVE_LLM = False
    else:
        logger.info(f"✅ LLM 可用: {OLLAMA_MODEL}")
        
except Exception as e:
    logger.error(f"❌ LLM 加载失败: {e}")
    HAVE_LLM = False
    
    class LLMUnavailable(Exception): 
        pass
    
    def chat_completion(*_args, **_kwargs): 
        raise LLMUnavailable("LLM 未初始化")
    
    OLLAMA_MODEL = "unknown"

# ==================== 加载文档数据 ====================# ==================== 加载文档数据 ====================
PROGRAMS_PATH = ROOT / "public/data/ucl_programs.json"
SERVICES_PATH = ROOT / "public/data/ucl_services.json"

def _load_documents() -> List[dict]:
    """加载所有文档"""
    documents = []
    
    # 加载 programs
    if PROGRAMS_PATH.exists():
        try:
            with open(PROGRAMS_PATH, 'r', encoding='utf-8') as f:
                programs = json.load(f)
                documents.extend(programs)
            logger.info(f"✅ 加载 {len(programs)} 个课程")
        except Exception as e:
            logger.error(f"❌ 加载课程失败: {e}")
    
    # 加载 services
    if SERVICES_PATH.exists():
        try:
            with open(SERVICES_PATH, 'r', encoding='utf-8') as f:
                services = json.load(f)
                documents.extend(services)
            logger.info(f"✅ 加载 {len(services)} 个服务")
        except Exception as e:
            logger.error(f"❌ 加载服务失败: {e}")
    
    return documents

# ==================== 智能答案生成 ====================
def _generate_smart_answer(query: str, search_results: List[Dict]) -> str:
    """智能生成答案（充分利用sections信息）"""
    
    intent = search_results[0]['intent']
    
    # 构建富含上下文的 prompt
    context_parts = []
    
    for i, result in enumerate(search_results[:3], 1):
        doc = result['doc']
        title = doc.get('title', 'Unknown')
        url = doc.get('url', '')
        matched_sections = result.get('matched_sections', [])
        
        # 提取最相关的sections
        section_texts = []
        for sec in matched_sections[:3]:  # 前3个最相关section
            heading = sec['heading']
            text = sec['text'][:500]  # 限制长度
            section_texts.append(f"  **{heading}**\n  {text}")
        
        context_parts.append(
            f"[{i}] {title}\n" + 
            "\n".join(section_texts) + 
            f"\n  Source: {url}"
        )
    
    context_str = "\n\n".join(context_parts)
    
    # 根据意图定制 prompt
    intent_prompts = {
        'modules': """Focus on extracting course modules, curriculum structure, and what students will learn. 
If specific module names/codes are listed, include them. If only topics are mentioned, list the topics clearly.""",
        
        'requirements': """Focus on entry requirements, qualifications, English language requirements (IELTS/TOEFL), 
and any prerequisites. Be specific with numbers and scores.""",
        
        'career': """Focus on career prospects, graduate outcomes, employment opportunities, and potential career paths.""",
        
        'fees': """Focus on tuition fees, funding opportunities, scholarships, and financial information.""",
        
        'general': """Provide a comprehensive overview based on the available information."""
    }
    
    system_prompt = f"""You are a UCL course information assistant with access to detailed course documentation.

INSTRUCTIONS:
1. Answer based STRICTLY on the provided course sections
2. {intent_prompts.get(intent, intent_prompts['general'])}
3. Cite sources using [1], [2], [3]
4. If information is limited, acknowledge it but extract what's available
5. Use bullet points for lists
6. Keep answer under 250 words
7. Be natural and conversational in tone"""

    user_prompt = f"""Question: {query}

Available Course Information:
{context_str}

Please provide a clear, accurate answer based on the sections above."""

    try:
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        
        logger.info(f"[LLM] 调用 Ollama，上下文长度: {len(context_str)} 字符")
        answer = chat_completion(messages, temperature=0.3, timeout=120)
        
        return answer
        
    except LLMUnavailable as e:
        logger.warning(f"⚠️ LLM 不可用: {e}")
        return _generate_fallback_answer(search_results)
    except Exception as e:
        logger.error(f"❌ LLM 调用失败: {e}")
        return _generate_fallback_answer(search_results)

def _generate_fallback_answer(search_results: List[Dict]) -> str:
    """降级方案：基于sections的智能摘要"""
    
    if not search_results:
        return "抱歉，没有找到相关信息。"
    
    intent = search_results[0]['intent']
    answer_parts = []
    
    # 根据意图生成不同的回答框架
    if intent == 'modules':
        answer_parts.append("Based on the course information:\n")
    elif intent == 'requirements':
        answer_parts.append("Entry requirements found:\n")
    elif intent == 'career':
        answer_parts.append("Career information:\n")
    else:
        answer_parts.append("Here's what I found:\n")
    
    # 提取前3个最相关文档的信息
    for i, result in enumerate(search_results[:3], 1):
        doc = result['doc']
        title = doc.get('title', 'Unknown')
        matched_sections = result.get('matched_sections', [])
        
        answer_parts.append(f"\n**{i}. {title}**")
        
        # 提取最相关section的关键信息
        if matched_sections:
            best_section = matched_sections[0]
            heading = best_section['heading']
            text = best_section['text'][:400]
            
            # 智能截断（按句子）
            sentences = text.split('. ')
            summary = '. '.join(sentences[:3]) + '.'
            
            answer_parts.append(f"   • {heading}: {summary}")
    
    answer_parts.append("\n\n💡 *For complete details, please visit the official UCL course pages.*")
    
    return '\n'.join(answer_parts)

# ==================== 主函数 ====================
# ==================== 主函数 ====================
def answer_enhanced(query: str, top_k: int = 8) -> dict:
    """增强版问答（使用新检索器）"""
    start_time = time.time()
    
    logger.info(f"\n{'='*60}\n收到查询: {query}\n{'='*60}")
    
    # 加载数据和索引
    documents = _load_documents()
    
    if not documents:
        return {
            'intent': 'unknown',
            'answer': '抱歉，数据未加载。',
            'citations': [],
            'num_queries': 1,
            'num_docs': 0,
            'response_time': f"{time.time() - start_time:.2f}s"
        }
    
    # 使用增强检索器
    retriever = EnhancedRetriever()
    search_results = retriever.search_with_context(query, documents, top_k)
    
    if not search_results:
        return {
            'intent': 'unknown',
            'answer': '抱歉，没有找到相关信息。',
            'citations': [],
            'num_queries': 1,
            'num_docs': 0,
            'response_time': f"{time.time() - start_time:.2f}s"
        }
    
    # 生成答案
    try:
        answer = _generate_smart_answer(query, search_results)
    except Exception as e:
        logger.error(f"❌ 答案生成失败: {e}")
        answer = _generate_fallback_answer(search_results)
    
    # 构建引用
    citations = []
    for result in search_results[:5]:
        doc = result['doc']
        citations.append({
            'title': doc.get('title', 'Unknown'),
            'url': doc.get('url', ''),
            'relevance_score': result['score']
        })
    
    response_time = time.time() - start_time
    logger.info(f"✅ 问答完成，耗时: {response_time:.2f}s\n{'='*60}\n")
    
    return {
        'intent': search_results[0]['intent'],
        'answer': answer,
        'citations': citations,
        'num_queries': 1,
        'num_docs': len(search_results),
        'response_time': f"{response_time:.2f}s"
    }


# ==================== 测试 ====================
# ==================== 测试 ====================
if __name__ == "__main__":
    test_queries = [
        "Data Science MSc modules",
        "计算机科学硕士的语言要求",
        "如何预约心理咨询",
        "商科硕士入学要求"
    ]
    
    print("\n" + "="*60)
    print("增强版 QA 系统测试")
    print("="*60)
    
    for q in test_queries:
        print(f"\n问题: {q}")
        result = answer_enhanced(q, top_k=5)
        print(f"\n意图: {result['intent']}")
        print(f"\n答案:\n{result['answer']}")
        print(f"\n引用: {len(result['citations'])} 个文档")
        for i, cite in enumerate(result['citations'][:3], 1):
            print(f"  {i}. {cite['title']} (score: {cite.get('relevance_score', 'N/A')})")
        print("-"*60)
