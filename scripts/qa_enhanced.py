# scripts/qa_enhanced.py
"""增强版 QA 系统：意图识别 + 查询改写 + 语义重排 + 受控生成。

该实现聚焦 "基于证据回答"，通过如下方式降低幻觉并提升可读性：
- 检索阶段对候选做意图加权与关键词过滤（含“硕士/MSC/Postgraduate”优先）。
- 从 snippet/content 中筛出与“语言要求/IELTS/TOEFL/English level”等相关的证据句。
- 生成阶段优先调用 LLM，不可用时回退本地摘要；答案末尾统一列出参考来源（标题 + URL）。
"""
from __future__ import annotations

import json
import pickle
import re
import sys
from collections import OrderedDict
from datetime import datetime
from functools import lru_cache
from pathlib import Path
from typing import Dict, List, Sequence, Tuple

import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

# 触发 pickle 中的 tokenizer 引用
try:  # pragma: no cover
    import scripts.tokenizers  # noqa: F401
except Exception:  # pragma: no cover
    pass

# LLM 客户端（可不可用均兼容）
try:
    from scripts.llm_client import LLMUnavailable, chat_completion
    HAVE_CHAT = True
except Exception:  # pragma: no cover
    HAVE_CHAT = False

    class LLMUnavailable(RuntimeError):
        """占位异常，保持接口一致。"""

    def chat_completion(*_args, **_kwargs):  # type: ignore
        raise LLMUnavailable("LLM client unavailable")

# 片段增强（可选）
try:
    from scripts.snippet_extractor import enrich_candidates_with_snippets
except Exception:  # pragma: no cover
    def enrich_candidates_with_snippets(cands: List[dict], _intent: str, max_each: int = 700) -> List[dict]:
        return cands

from scripts.qa_local import translate_query

INDEX_PATH = Path("data/qa_index.pkl")
LOG_PATH = Path("data/qa_enhanced_log.jsonl")

INTENT_PATTERNS: Dict[str, Sequence[re.Pattern]] = {
    "admission_requirements": [
        re.compile(r"入学|申请|要求|成绩|分数|gpa|雅思|托福|语言|硕士|本科|学位|学历|英语|证书|pte", re.I),
        re.compile(r"admission|requirement|entry|grade|score|qualification|ielts|toefl|gpa|bachelor|master|degree|language|english", re.I),
    ],
    "careers_resume": [
        re.compile(r"简历|cv|求职|就业|职业|找工作|实习|面试|工作|改|写", re.I),
        re.compile(r"resume|career|job|employment|internship|work|interview|cv improvement|tips", re.I),
    ],
    "wellbeing_support": [
        re.compile(r"心理|健康|咨询|counselling|support|mental|wellbeing|预约|appointment", re.I),
        re.compile(r"urgent|out of hours|helpline|counseling", re.I),
    ],
    "booking": [
        re.compile(r"预约|订|怎么|如何|book|booking|register|安排|排期|appointment|how to", re.I),
    ],
}

INTENT_SYNONYMS: Dict[str, Sequence[str]] = {
    "admission_requirements": ["入学要求", "entry requirements", "admission criteria"],
    "careers_resume": ["简历", "cv guidance", "career support"],
    "wellbeing_support": ["心理支持", "wellbeing support", "counselling"],
    "booking": ["如何预约", "booking", "appointment"],
}

INTENT_LEADS: Dict[str, str] = {
    "admission_requirements": "根据检索到的官方页面，总结入学要求如下：",
    "careers_resume": "UCL 职业发展资源显示：",
    "wellbeing_support": "UCL 提供的心理与健康支持包括：",
    "booking": "关于预约流程，UCL 官方说明：",
}

# ---------- 公用小工具：参考来源统一格式化 ----------
def _format_citations(citations: Sequence[dict], max_n: int = 5) -> str:
    if not citations:
        return ""
    lines = []
    for i, c in enumerate(citations[:max_n], 1):
        title = (c.get("title") or "参考页面").strip()
        url = (c.get("url") or "").strip()
        lines.append(f"{i}. {title} - {url}" if url else f"{i}. {title}")
    return "参考来源：\n" + "\n".join(lines)


def identify_intent(query: str) -> str:
    """根据规则匹配识别意图，匹配失败则返回 other。"""
    for intent, patterns in INTENT_PATTERNS.items():
        if any(p.search(query) for p in patterns):
            return intent
    return "other"


def _is_masters_query(q: str) -> bool:
    """粗判是否为“硕士/研究生/MSC”类查询。"""
    ql = (q or "").lower()
    zh_hit = ("硕士" in q) or ("研究生" in q)
    en_hit = any(k in ql for k in ["msc", "master", "postgraduate"])
    return zh_hit or en_hit


def rewrite_queries(query: str, intent: str) -> List[str]:
    """生成查询改写，保留原问句并追加意图相关的同义词与翻译。"""
    rewrites = OrderedDict()
    rewrites[query] = None

    for synonym in INTENT_SYNONYMS.get(intent, []):
        rewrites[f"{synonym} {query}"] = None

    translated = translate_query(query)
    if isinstance(translated, dict):
        translated = translated.get("query", query)
    if translated and translated != query:
        rewrites[translated] = None

    return list(rewrites.keys())


@lru_cache(maxsize=1)
def _load_index_cached(mtime: float):
    with open(INDEX_PATH, "rb") as fh:
        data = pickle.load(fh)
    return data["vectorizer"], data["tfidf_matrix"], data["metadata"]


def _load_index():
    if not INDEX_PATH.exists():
        raise FileNotFoundError(
            "QA index not found. Run `python scripts/build_qa_index.py` to generate data/qa_index.pkl."
        )
    stat = INDEX_PATH.stat()
    return _load_index_cached(stat.st_mtime)


def _retrieve_candidates(rewrites: Sequence[str], intent: str, top_k: int) -> List[dict]:
    """对所有改写查询做 TF-IDF 检索，并按 URL 聚合最高得分。"""
    vectorizer, tfidf_matrix, metadata = _load_index()
    aggregated: Dict[str, dict] = {}

    for rq in rewrites:
        translated = translate_query(rq)
        if isinstance(translated, dict):
            translated = translated.get("query", rq)
        query_vec = vectorizer.transform([translated])
        similarities = cosine_similarity(query_vec, tfidf_matrix).flatten()
        indices = np.argsort(similarities)[-top_k:][::-1]

        for idx in indices:
            score = float(similarities[idx])
            if score < 0.005:
                continue

            doc = metadata[idx]
            url = doc.get("url") or f"local://{idx}"
            entry = aggregated.setdefault(
                url,
                {
                    "title": doc.get("title", "Untitled"),
                    "type": doc.get("type", "unknown"),
                    "level": doc.get("level", "unknown"),
                    "url": url,
                    "score": 0.0,
                    "scores": [],
                    "snippet": doc.get("snippet", ""),
                    "content": doc.get("content", doc.get("text", "")),  # 需要 build_qa_index 写入 metadata.content
                },
            )
            entry["score"] = max(entry["score"], score)
            entry["scores"].append(score)

    candidates = list(aggregated.values())
    return enrich_candidates_with_snippets(candidates, intent, max_each=700)


def _split_sentences(text: str) -> List[str]:
    """更稳健的切句：标点切 + 超长软切 + 去重。"""
    cleaned = (text or "").replace("•", " ").replace("\u2022", " ")
    parts = re.split(r"(?<=[。！？.!?])\s+|\n+", cleaned)
    tmp = []
    for p in parts:
        p = p.strip()
        if not p:
            continue
        if len(p) > 220:  # 超长再软切
            for i in range(0, len(p), 180):
                tmp.append(p[i:i + 200])
        else:
            tmp.append(p)
    sentences = [s for s in tmp if len(s) >= 6]
    dedup: OrderedDict[str, None] = OrderedDict()
    for s in sentences:
        dedup.setdefault(s, None)
    return list(dedup.keys())


def _query_terms(query: str) -> List[str]:
    terms = [t for t in re.split(r"[^\w]+", query.lower()) if len(t) >= 2]
    return terms or [query.lower()]


def rerank_candidates(candidates: Sequence[dict], intent: str, query: str) -> List[dict]:
    """对候选结果加上意图相关的加权，生成最终排序。"""
    terms = _query_terms(query)
    is_masters = _is_masters_query(query)
    reranked: List[dict] = []

    for cand in candidates:
        title = (cand.get("title") or "").lower()
        snippet = (cand.get("snippet") or (cand.get("content") or "")).lower()
        level = (cand.get("level") or "").lower()
        base_score = float(cand.get("score", 0.0))
        score = base_score
        reasons: List[str] = []

        # 基础匹配
        if any(term in title for term in terms):
            score += 0.10
            reasons.append("标题匹配查询词")
        if any(term in snippet for term in terms):
            score += 0.15
            reasons.append("片段包含查询词")

        # 入学要求专属加权
        if intent == "admission_requirements":
            if any(k in title for k in ["entry", "requirement", "admission", "language", "ielts", "toefl", "english"]):
                score += 0.25
                reasons.append("入学/语言要求关键词加权(标题)")
            if any(k in snippet for k in ["ielts", "toefl", "english", "language requirement", "english language level", "level "]):
                score += 0.20
                reasons.append("语言要求关键词加权(片段)")

            if is_masters:
                if level == "postgraduate":
                    score += 0.25
                    reasons.append("硕士课程优先(level=postgraduate)")
                if any(k in title for k in ["msc", "master", "postgraduate"]):
                    score += 0.15
                    reasons.append("硕士关键词加权(标题)")
                if "psycholog" in title:
                    score += 0.05
                    reasons.append("心理学相关(标题)")

        # 其他意图加权
        if intent == "careers_resume" and any(k in title for k in ["career", "resume", "cv"]):
            score += 0.15
            reasons.append("职业发展关键词加权")
        if intent == "wellbeing_support" and any(k in title for k in ["wellbeing", "support", "counselling", "mental"]):
            score += 0.18
            reasons.append("心理支持关键词加权")
        if intent == "booking" and any(k in title for k in ["book", "booking", "appointment", "register"]):
            score += 0.18
            reasons.append("预约关键词加权")

        reranked.append(
            {
                **cand,
                "base_score": round(base_score, 4),
                "score": round(score, 4),
                "why": "; ".join(reasons) if reasons else "TF-IDF 得分",
            }
        )

    reranked.sort(key=lambda item: item["score"], reverse=True)
    return reranked


def _collect_evidence(reranked: Sequence[dict], query: str, max_candidates: int = 3) -> Tuple[List[str], List[dict]]:
    """从前若干候选中提取支持句，并返回引用信息。"""
    terms = _query_terms(query)
    kw_bonus = ["ielts", "toefl", "english", "language requirement", "entry requirements", "english language level", "level "]
    sentences: List[str] = []
    citations: List[dict] = []

    def bad(s: str) -> bool:
        s2 = s.strip().lower()
        if len(s2) < 6:
            return True
        if 'http' in s2 or 'www.' in s2 or re.search(r'[/:]{2,}', s2):
            return True
        if re.search(r"this is the programme information for \d{4} entry", s2, re.I):
            return True
        # 过短类似标题
        if len(s2) <= 24 and s2.istitle():
            return True
        return False

    scored_pool: List[Tuple[float, str]] = []

    for cand in reranked[:max_candidates]:
        snippet = cand.get("snippet") or cand.get("content") or ""
        if not snippet:
            continue
        # 切句
        parts = _split_sentences(snippet)
        for p in parts:
            if bad(p):
                continue
            pl = p.lower()
            score = 0.0
            if any(t in pl for t in terms):
                score += 0.4
            if any(k in pl for k in kw_bonus):
                score += 0.6
            # 适中长度更好读
            ln = len(p)
            if 20 <= ln <= 240:
                score += 0.2
            scored_pool.append((score, p))

        # 引用列表带上该候选链接
        if not any(c.get("url") == cand.get("url") for c in citations):
            citations.append({"title": cand.get("title", ""), "url": cand.get("url", "")})

    # 排序取前若干句
    scored_pool.sort(key=lambda x: x[0], reverse=True)
    top_sent = [s for _sc, s in scored_pool[:6]]  # 取6句，summarizer 再选 3-5
    # 去重
    dedup: OrderedDict[str, None] = OrderedDict()
    for s in top_sent:
        dedup.setdefault(s.strip(), None)
    return list(dedup.keys()), citations


def local_summarizer(sentences: Sequence[str], intent: str, citations: Sequence[dict]) -> str:
    """若 LLM 不可用，使用证据句生成 3-5 句中文摘要，并在末尾列出参考来源（标题 + URL）。"""
    if not sentences:
        refs = _format_citations(citations)
        if refs:
            return "抱歉，未能在资料中找到与问题直接相关的句子。\n\n" + refs
        return "抱歉，未能在资料中找到与问题直接相关的句子。"

    lead = INTENT_LEADS.get(intent, "相关信息如下：")
    chosen = list(sentences)[:5]
    summary = lead + " " + " ".join(chosen)

    refs = _format_citations(citations)
    if refs:
        summary += "\n\n" + refs

    return summary


def generate_answer(reranked: Sequence[dict], query: str, intent: str) -> Tuple[str, List[dict]]:
    """根据证据生成回答。优先调用 LLM，失败时落回本地 summarizer。"""
    evidence, citations = _collect_evidence(reranked, query)

    if not evidence:
        fallback_lines = ["暂时无法从资料中提炼具体答案，建议直接查看以下页面："]
        for cand in reranked[:3]:
            title = cand.get('title', '相关页面')
            url = cand.get('url', '')
            fallback_lines.append(f"- {title} ({url})" if url else f"- {title}")
        return "\n".join(fallback_lines), citations

    if HAVE_CHAT:
        system_prompt = (
            "你是信息核查助手。请严格依据提供的证据句作答，"
            "使用中文写出 3-5 句陈述，禁止列举项目符号。若证据不足请直言缺失。"
        )
        user_prompt = "查询：" + query + "\n\n可用证据：\n" + "\n".join(
            f"[{i+1}] {sent}" for i, sent in enumerate(evidence)
        ) + "\n\n请基于证据撰写总结。"

        try:
            reply = chat_completion(
                [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.2,
            )
            if reply and reply.strip():
                answer_text = reply.strip()
                # 确保附上参考来源（即便模型没主动加）
                refs = _format_citations(citations)
                if refs and refs not in answer_text:
                    answer_text += "\n\n" + refs
                return answer_text, citations
        except LLMUnavailable:
            pass
        except Exception:
            pass

    # LLM 调用失败或不可用：回退本地摘要（也包含参考来源）
    return local_summarizer(evidence, intent, citations), citations


def generate_rules_patch(query: str, intent: str, reranked: Sequence[dict]) -> dict:
    """根据结果给出可选的规则补丁建议。"""
    patch = {"synonyms_add": [], "demote_rules": []}

    top = reranked[0] if reranked else None
    if top and intent == "admission_requirements" and "verification" in (top.get("title", "").lower()):
        patch["demote_rules"].append(
            {
                "intent": intent,
                "contains": ["verification", "证明", "third party"],
                "delta": -0.3,
                "reason": "避免将成绩验证页面排在入学要求之前",
            }
        )

    if intent == "admission_requirements":
        patch["synonyms_add"].append(["成绩", "grades", "entry requirements", "admission criteria"])
    elif intent == "careers_resume":
        patch["synonyms_add"].append(["简历", "CV", "resume", "career guidance"])
    elif intent == "wellbeing_support":
        patch["synonyms_add"].append(["心理", "wellbeing", "counselling", "support"])
    elif intent == "booking":
        patch["synonyms_add"].append(["预约", "booking", "appointment", "register"])

    return patch


def answer_enhanced(query: str, top_k: int = 10, return_full: bool = False) -> dict:
    """增强版 QA 主入口。"""
    try:
        intent = identify_intent(query)
        rewrites = rewrite_queries(query, intent)
        candidates = _retrieve_candidates(rewrites, intent, top_k)

        # 若问的是“硕士/MSC”，且用于入学要求场景，优先保留 level=postgraduate
        if intent == "admission_requirements" and _is_masters_query(query):
            masters_only = [c for c in candidates if (c.get("level") or "").lower() == "postgraduate"]
            if masters_only:
                candidates = masters_only

        reranked = rerank_candidates(candidates, intent, query)
        answer, citations = generate_answer(reranked, query, intent)
        rules_patch = generate_rules_patch(query, intent, reranked)

        result = {
            "intent": intent,
            "rewritten_queries": rewrites,
            "reranked": reranked[:10],
            "answer": answer,
            "citations": citations,
            "rules_patch": rules_patch,
        }

        if return_full:
            result["candidates"] = candidates

        LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
        with open(LOG_PATH, "a", encoding="utf-8") as fh:
            fh.write(
                json.dumps(
                    {
                        "timestamp": datetime.now().isoformat(),
                        "query": query,
                        "intent": intent,
                        "answer_preview": answer[:160],
                        "citations": len(citations),
                    },
                    ensure_ascii=False,
                )
                + "\n"
            )

        return result

    except FileNotFoundError as exc:
        return {
            "intent": "error",
            "rewritten_queries": [],
            "reranked": [],
            "answer": str(exc),
            "citations": [],
            "rules_patch": {},
            "error": "missing_index",
        }

    except Exception as exc:  # pragma: no cover - 兜底防御
        import traceback

        return {
            "intent": "error",
            "rewritten_queries": [],
            "reranked": [],
            "answer": f"系统错误：{exc}",
            "citations": [],
            "rules_patch": {},
            "error": traceback.format_exc(),
        }


def _print_cli_result(result: dict) -> None:
    """命令行调试输出。"""
    print(f"意图识别: {result['intent']}")
    print("\n查询改写:")
    for item in result["rewritten_queries"]:
        print(f"  - {item}")

    print("\n重排结果 (Top 5):")
    for i, cand in enumerate(result["reranked"][:5], 1):
        print(f"  {i}. [{cand.get('type', 'unknown')}/{cand.get('level', 'unknown')}] {cand.get('title', '')}")
        print(f"     分数: {cand.get('score')} | 原因: {cand.get('why')}")

    print("\n答案：")
    print(result["answer"])

    if result["citations"]:
        print("\n引用链接:")
        for i, cite in enumerate(result["citations"], 1):
            print(f"  {i}. {cite.get('title', '')}")
            print(f"     {cite.get('url', '')}")

    if result["rules_patch"].get("synonyms_add") or result["rules_patch"].get("demote_rules"):
        print("\n规则补丁建议:")
        if result["rules_patch"].get("synonyms_add"):
            print(f"  同义词扩展: {result['rules_patch']['synonyms_add']}")
        if result["rules_patch"].get("demote_rules"):
            print(f"  降权规则: {result['rules_patch']['demote_rules']}")


if __name__ == "__main__":  # pragma: no cover
    print("UCL AI QA (增强版) 已启动！输入 'exit' 退出。\n")
    while True:
        try:
            question = input("\n您的问题: ").strip()
        except EOFError:
            break

        if question.lower() in {"exit", "quit", "q"}:
            break
        if not question:
            continue

        outcome = answer_enhanced(question, top_k=10)
        print("\n" + "=" * 60)
        _print_cli_result(outcome)
        print("=" * 60)
