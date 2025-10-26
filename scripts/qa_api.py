#!/usr/bin/env python3
"""
增强版 QA 系统 - JSON API 接口
可以通过命令行或作为模块导入使用
"""
import sys
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from scripts.qa_enhanced import answer_enhanced

def api_answer(query: str, top_k: int = 10) -> str:
    """
    API 接口：返回 JSON 格式结果
    
    Args:
        query: 用户问题
        top_k: 返回候选数量
    
    Returns:
        JSON 字符串
    """
    result = answer_enhanced(query, top_k=top_k)
    return json.dumps(result, ensure_ascii=False, indent=2)

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("用法: python qa_api.py '<问题>' [top_k]")
        print("示例: python qa_api.py '计算机专业入学要求' 10")
        sys.exit(1)
    
    query = sys.argv[1]
    top_k = int(sys.argv[2]) if len(sys.argv) > 2 else 10
    
    result_json = api_answer(query, top_k)
    print(result_json)
