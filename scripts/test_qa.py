#!/usr/bin/env python3
# scripts/test_qa.py - 批量测试QA系统

import subprocess
import sys
import os

def run_qa_test(question):
    """运行单个QA测试"""
    try:
        # 使用echo管道输入问题到QA脚本
        # 注意: qa_local.py 是交互式脚本，我们通过管道输入问题
        cmd = f'echo "{question}" | {sys.executable} scripts/qa_local.py'
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)

        # 解析输出
        output_lines = result.stdout.strip().split('\n')
        response = ""
        sources = []

        # 找到回答部分
        in_response = False
        for line in output_lines:
            # 忽略启动信息、交互提示和问题回显行
            if "UCL AI QA" in line or "您的问题:" in line or "输入 'exit' 退出" in line or not line.strip():
                continue

            # 找到回答的开始
            if line.startswith("我找到了以下信息：") or line.startswith("抱歉"):
                in_response = True
                response = line.strip() # 开始记录回答，从标题开始
                continue
            
            # 如果在回答部分
            if in_response and line.strip():
                # 找到来源行
                if line.startswith("来源:"):
                    sources_part = line.replace("来源:", "").strip()
                    # 来源列表通常以逗号分隔
                    sources = [s.strip() for s in sources_part.split(',') if s.strip()]
                    in_response = False # 来源之后停止收集回答
                    # 不需要 break，继续让循环结束，以防后续有其他输出需要忽略
                else:
                    # 收集回答内容 (包括 bullet points)，使用换行符分隔以保留格式
                    response += "\n" + line.strip()

        return {
            'question': question,
            'response': response.strip(),
            'sources': sources,
            # 检查是否包含“抱歉”来判断是否找到信息
            'found_info': "抱歉" not in response
        }

    except Exception as e:
        return {
            'question': question,
            'response': f"错误: {str(e)}",
            'sources': [],
            'found_info': False
        }

def main():
    # 测试问题列表
    test_questions = [
        "计算机专业入学要求是什么",
        "怎么改简历？",
        "心理咨询怎么预约",
        "商科硕士需要什么成绩",
        "UCL GPA怎么算？"
    ]

    print("开始批量测试QA系统...")
    print("=" * 50)

    results = []
    for i, question in enumerate(test_questions, 1):
        print(f"\n[{i}/{len(test_questions)}] 问题: {question}")
        result = run_qa_test(question)
        results.append(result)

        # 现在能正确打印完整的回答文本
        print(f"回答:\n{result['response']}")
        if result['sources']:
            print(f"来源: {', '.join(result['sources'])}")
        print("-" * 50)

    # 统计结果
    found_count = sum(1 for r in results if r['found_info'])
    total_count = len(results)

    print("\n所有测试完成！")
    print(f"找到信息: {found_count}/{total_count} ({found_count/total_count*100:.1f}%)")

    # 详细结果
    print("\n详细结果:")
    for result in results:
        status = "✓" if result['found_info'] else "✗"
        # 打印更详细的概览
        print(f"{status} {result['question'][:30]}... ({len(result['sources'])} 来源)")

if __name__ == "__main__":
    main()