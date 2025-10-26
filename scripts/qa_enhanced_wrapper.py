import os
import json
import sys
import traceback
from pathlib import Path
from typing import Dict, List, Tuple

# 动态加入项目根路径
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / "scripts"))

try:
    from scripts.llm_client import chat_completion, LLMUnavailable, OLLAMA_MODEL
except Exception:
    class LLMUnavailable(Exception): pass
    def chat_completion(*_args, **_kwargs): raise LLMUnavailable("LLM 未初始化")
    OLLAMA_MODEL = "unknown"

# ------------------------- 加载真实文档 -------------------------

REAL_DOCS: List[Dict[str, str]] = []

def load_documents_from_file(path: Path) -> List[Dict[str, str]]:
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)  # 是 JSON 数组，不是 JSONL
        docs = []
        for item in data:
            title = item.get("title", "未知标题")
            url = item.get("url", "#")
            sections = item.get("sections", [])
            text = "\n".join(s.get("text", "") for s in sections if isinstance(s, dict))
            if text.strip():
                docs.append({"title": title.strip(), "url": url, "text": text.strip()})
        return docs
    except Exception as e:
        print(f"❌ 加载失败: {path}: {e}")
        return []

def load_all_documents():
    global REAL_DOCS
    program_path = ROOT / "public/data/ucl_programs.json"
    service_path = ROOT / "public/data/ucl_services.json"
    REAL_DOCS = load_documents_from_file(program_path) + load_documents_from_file(service_path)
    print(f"✅ 成功加载真实文档数: {len(REAL_DOCS)}")

load_all_documents()

# ------------------------- Query 改写 -------------------------

def _detect_language_and_rewrite(query: str) -> Tuple[str, List[str]]:
    q = (query or "").strip()
    if not q:
        return "zh", [""]
    has_zh = any("\u4e00" <= ch <= "\u9fff" for ch in q)
    lang = "zh" if has_zh else "en"
    rewrites = [q]
    if lang == "zh":
        rewrites.append(f"{q} site:ucl.ac.uk")
    else:
        rewrites.append(f"{q} site:ucl.ac.uk")
    return lang, rewrites

# ------------------------- 文档检索（关键词） -------------------------

def _retrieve_documents(query: str, top_k: int) -> List[Dict[str, str]]:
    """基于关键词匹配检索文档，支持中英文分词"""
    q = (query or "").lower()
    
    # 中文分词
    import re
    # 简单中文分词：按字符和常见词分
    words = []
    # 提取英文词
    english_words = re.findall(r'[a-zA-Z]+', q)
    words.extend([w.lower() for w in english_words if len(w) > 2])
    
    # 提取中文词（2-4字）
    chinese_words = re.findall(r'[\u4e00-\u9fff]{2,4}', q)
    words.extend(chinese_words)
    
    if not words:
        words = q.split()
    
    scores = []
    for doc in REAL_DOCS:
        title = (doc.get("title") or "").lower()
        text = (doc.get("text") or "").lower()
        combined = title + " " + text
        
        # 计算匹配分数（标题权重更高）
        title_score = sum(3 for word in words if word in title)
        text_score = sum(1 for word in words if word in combined)
        total_score = title_score + text_score
        
        scores.append((total_score, doc))
    
    scores.sort(key=lambda item: item[0], reverse=True)
    
    # 只返回有匹配的文档，如果没有则返回前几个
    relevant_docs = [doc for score, doc in scores if score > 0]
    if relevant_docs:
        return relevant_docs[:top_k]
    else:
        return [doc for _, doc in scores[:top_k]]

# ------------------------- 本地摘要生成 -------------------------

def _generate_local_summary(query: str, docs: List[Dict[str, str]]) -> str:
    """当 LLM 不可用时，基于检索文档生成简单摘要"""
    if not docs:
        return "抱歉，未找到相关信息。请尝试换个问法或联系 UCL 官方。"
    
    # 提取前3个文档的关键信息
    summary_parts = [f"根据 UCL 官方资料，关于'{query}'的相关信息：\n"]
    
    for idx, doc in enumerate(docs[:3], start=1):
        title = doc.get('title', '未知来源')
        text = doc.get('text', '')
        # 截取前200个字符作为摘要
        snippet = text[:200].strip()
        if len(text) > 200:
            snippet += "..."
        summary_parts.append(f"\n【{idx}】{title}\n{snippet}")
    
    summary_parts.append("\n\n💡 提示：以上为自动摘要，详细信息请查看下方参考来源。")
    return "".join(summary_parts)

# ------------------------- Prompt 构建 -------------------------

SYSTEM_PROMPT = (
    "你是 UCL 的问答助手。请严格基于提供的资料回答问题，"
    "若资料不足请明确说明'根据现有资料无法回答'。"
    "请用中文作答，回答要简洁准确，不超过 200 字。"
)

def _build_prompt(query: str, docs: List[Dict[str, str]]) -> List[Dict[str, str]]:
    context_lines = []
    # 只取前 3 个最相关的文档，减少 token 数量
    for idx, doc in enumerate(docs[:3], start=1):
        text = doc.get('text', '')[:500]  # 限制每个文档 500 字符
        context_lines.append(f"[{idx}] {doc.get('title', '未知')}: {text}")
    context_block = "\n".join(context_lines)

    user_prompt = (
        f"资料：\n{context_block}\n\n"
        f"问题：{query}\n回答（不超过200字）："
    )

    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_prompt},
    ]

# ------------------------- 主入口 -------------------------

def answer_enhanced(query: str, top_k: int = 5) -> Dict[str, object]:
    lang, rewrites = _detect_language_and_rewrite(query)
    docs = _retrieve_documents(query, top_k)
    
    try:
        messages = _build_prompt(query, docs)
        print(f"[RAG] 调用 Ollama 模型: {OLLAMA_MODEL}，检索文档 {len(docs)} 条")
        answer = chat_completion(messages, temperature=0.2, timeout=120)  # 增加超时到 120 秒
        print(f"✅ RAG 成功生成答案")
    except LLMUnavailable as exc:
        print(f"⚠️  LLM 不可用: {exc}，使用本地摘要模式")
        answer = _generate_local_summary(query, docs)
    except Exception as exc:
        print(f"❌ RAG 执行失败: {exc}")
        traceback.print_exc()
        # 降级到本地摘要而不是返回错误
        print(f"⚠️  降级到本地摘要模式")
        answer = _generate_local_summary(query, docs)

    citations = [
        {"title": doc.get("title", "未知来源"), "url": doc.get("url", "#")}
        for doc in docs
    ]

    return {
        "intent": lang,
        "answer": answer or "根据现有资料无法回答。",
        "citations": citations,
        "rewritten_queries": rewrites,
        "reranked": docs,
    }
