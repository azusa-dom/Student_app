# scripts/test/test_qa.py
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from qa_local import answer

TEST_QUESTIONS = [
    "UCL GPA怎么算？",
    "计算机专业入学要求是什么",
    "怎么改简历？",
    "心理咨询怎么预约",
    "商科硕士需要什么成绩"
]

def run_tests():
    print("UCL AI QA 系统测试开始")
    print("=" * 60)
    
    for i, q in enumerate(TEST_QUESTIONS, 1):
        print(f"\n[{i}/5] 问题: {q}")
        try:
            result = answer(q)
            print(f"回答: {result['text']}")
            if result.get('sources'):
                print(f"来源: {', '.join(result['sources'])}")
            else:
                print("来源: 无")
        except Exception as e:
            print(f"错误: {e}")
        print("-" * 60)
    
    print("所有测试完成！日志: logs/qa.log")

if __name__ == '__main__':
    run_tests()