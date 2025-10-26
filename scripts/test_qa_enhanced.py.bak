#!/usr/bin/env python3
# coding: utf-8
"""
增强版 QA 系统测试脚本（兼容 answer_enhanced 接口）
保存为: scripts/test_qa_enhanced.py
用法: python scripts/test_qa_enhanced.py
说明:
 - 依赖: 你的项目环境应能 import scripts.qa_enhanced.answer_enhanced
 - 该脚本会对 answer_enhanced 的返回做容错处理（字段缺失时不会崩溃）
"""
import sys
import json
import traceback
from pathlib import Path

# 将项目根目录加入 sys.path（保证能 import 项目内部模块）
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

# 从你的增强 QA 模块导入（你已有的模块）
try:
    from scripts.qa_enhanced_wrapper import answer_enhanced
except Exception as e:
    print("无法导入 scripts.qa_enhanced.answer_enhanced，请确保文件存在且函数名正确。")
    print("导入错误：", e)
    raise

# 测试问题集（可按需替换/扩充）
TEST_QUESTIONS = [
    "计算机专业入学要求是什么",
    "怎么改简历？",
    "心理咨询怎么预约",
    "商科硕士需要什么成绩",
    "UCL GPA怎么算？"
]

OUTPUT_JSON = Path("data/qa_enhanced_test_results.json")
OUTPUT_JSON.parent.mkdir(parents=True, exist_ok=True)

def pretty_print_reranked(items, top_n=3):
    if not items:
        print("   （无重排结果）")
        return
    for j, item in enumerate(items[:top_n], 1):
        title = item.get("title") or item.get("meta", {}).get("title") or item.get("text", "")[:60]
        score = item.get("score") if item.get("score") is not None else item.get("rerank_score", 0)
        why = item.get("why") or item.get("explain", "") or ""
        typ = item.get("type") or item.get("meta", {}).get("type") or "unknown"
        type_label = "课程" if typ == "program" else ("服务" if typ == "service" else typ)
        print(f"   {j}. [{type_label}] {title[:60]}...")
        try:
            print(f"      分数: {float(score):.3f} | 原因: {why}")
        except Exception:
            print(f"      分数: {score} | 原因: {why}")

def run_one(question, top_k=10):
    """调用 answer_enhanced 并做容错包装"""
    try:
        res = answer_enhanced(question, top_k=top_k)
    except Exception as e:
        print("调用 answer_enhanced 出错：")
        traceback.print_exc()
        # 构造一个失败格式的返回，方便后续处理
        return {
            "question": question,
            "intent": "ERROR",
            "rewritten_queries": [],
            "reranked": [],
            "answer": f"调用 answer_enhanced 时出错：{e}",
            "citations": []
        }

    # 容错字段提取
    intent = res.get("intent") if isinstance(res, dict) else None
    rewrites = res.get("rewritten_queries") if isinstance(res, dict) else None
    rewrites = rewrites if isinstance(rewrites, (list,tuple)) else []
    reranked = res.get("reranked") if isinstance(res, dict) else None
    reranked = reranked if isinstance(reranked, list) else []
    answer = res.get("answer") if isinstance(res, dict) else str(res)
    citations = res.get("citations") if isinstance(res, dict) else []
    citations = citations if isinstance(citations, list) else []

    return {
        "question": question,
        "intent": intent or "unknown",
        "rewritten_queries": rewrites,
        "reranked": reranked,
        "answer": answer,
        "citations": citations
    }

def test_all(top_k=10):
    print("="*72)
    print("开始测试增强版 QA 系统")
    print("="*72)
    results_summary = []

    for idx, q in enumerate(TEST_QUESTIONS, 1):
        print("\n" + "-"*72)
        print(f"[{idx}/{len(TEST_QUESTIONS)}] 问题: {q}")
        print("-"*72)

        result = run_one(q, top_k=top_k)

        # 输出意图
        print(f"\n✓ 意图识别: {result.get('intent')}\n")

        # 改写查询
        rew = result.get("rewritten_queries") or []
        print(f"✓ 查询改写 ({len(rew)}):")
        for i, r in enumerate(rew[:5], 1):
            print(f"   {i}. {r}")
        if not rew:
            print("   （无改写）")

        # 重排展示
        print(f"\n✓ 语义重排 (Top 3):")
        pretty_print_reranked(result.get("reranked", []), top_n=3)

        # 答案预览（200 字）
        print(f"\n✓ 生成答案（预览）:\n")
        ans = result.get("answer") or ""
        preview = ans[:200].replace("\n", " ")
        print(f"   {preview}{'...' if len(ans) > 200 else ''}")

        # 引用
        cites = result.get("citations") or []
        print(f"\n✓ 引用来源: {len(cites)} 个")
        for i, c in enumerate(cites[:3], 1):
            t = c.get("title") if isinstance(c, dict) else str(c)
            print(f"   {i}. {t[:80]}")

        # 统计项（判断是否有答案）
        has_answer = (isinstance(ans, str) and "当前语料无该信息" not in ans and len(ans.strip())>0)
        top_score = 0.0
        if result.get("reranked"):
            try:
                top_score = float(result["reranked"][0].get("score") or result["reranked"][0].get("rerank_score") or 0.0)
            except Exception:
                top_score = 0.0

        results_summary.append({
            "question": q,
            "intent": result.get("intent"),
            "has_answer": bool(has_answer),
            "citations_count": len(cites),
            "top_score": top_score
        })
        print("\n" + "-"*72)

    # 总结
    success_count = sum(1 for r in results_summary if r["has_answer"])
    print("\n" + "="*72)
    print("测试总结")
    print("="*72)
    print(f"成功回答: {success_count}/{len(results_summary)} ({success_count/len(results_summary)*100:.1f}%)\n")

    for i, r in enumerate(results_summary, 1):
        status = "✓" if r["has_answer"] else "✗"
        print(f"{status} {i}. {r['question']}")
        print(f"   意图: {r['intent']} | 引用数: {r['citations_count']} | 最高分: {r['top_score']:.3f}")

    # 保存到文件
    with open(OUTPUT_JSON, "w", encoding="utf-8") as fw:
        json.dump(results_summary, fw, ensure_ascii=False, indent=2)
    print(f"\n详细结果已保存到: {OUTPUT_JSON}")

if __name__ == "__main__":
    test_all(top_k=10)
