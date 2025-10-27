#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
demo_validate.py - 完整演示验证脚本
展示 5 个典型问题的完整 API 响应
"""

import requests
import json
import sys
from time import time

DEMO_QUERIES = [
    "心理咨询怎么预约",
    "计算机专业入学要求是什么",
    "怎么改简历？",
    "商科硕士需要什么成绩",
    "UCL GPA怎么算？"
]

API_URL = "http://127.0.0.1:5051/api/qa"

def test_api():
    print("\n" + "="*80)
    print("🎓 UCL AI 问答系统 - 演示验证")
    print("="*80 + "\n")
    
    all_passed = True
    
    for i, query in enumerate(DEMO_QUERIES, 1):
        print(f"[{i}/5] 问题: {query}")
        print("-" * 80)
        
        try:
            # 发送请求
            start = time()
            response = requests.get(API_URL, params={"query": query}, timeout=10)
            elapsed = time() - start
            
            if response.status_code != 200:
                print(f"❌ HTTP {response.status_code}")
                all_passed = False
                continue
            
            data = response.json()
            
            # 验证关键字段
            required_fields = ["intent", "answer", "sources"]
            for field in required_fields:
                if field not in data:
                    print(f"❌ 缺少字段: {field}")
                    all_passed = False
                    continue
            
            # 显示结果
            intent = data.get("intent", "unknown")
            answer = data.get("answer", "")
            sources = data.get("sources", [])
            
            print(f"✅ 意图: {intent}")
            print(f"📝 答案（前 80 字）: {answer[:80]}...")
            print(f"📎 来源: {len(sources)} 个")
            for j, src in enumerate(sources, 1):
                print(f"   {j}. {src.get('title')}")
            print(f"⏱️  响应时间: {elapsed:.2f}s")
            print()
            
        except requests.exceptions.ConnectionError:
            print("❌ 无法连接到 API 服务")
            print("   请确保已运行: python serve_qa.py")
            all_passed = False
        except Exception as e:
            print(f"❌ 错误: {e}")
            all_passed = False
        
        print()
    
    print("="*80)
    if all_passed:
        print("✅ 演示验证完成！所有问题都正确处理。")
        print("\n💡 下一步:")
        print("   1. 打开浏览器访问 http://127.0.0.1:5051/")
        print("   2. 尝试输入上述问题")
        print("   3. 查看紫色主题的答案显示和来源链接")
    else:
        print("⚠️  演示验证中有问题，请检查服务状态。")
        return 1
    
    print("="*80 + "\n")
    return 0

if __name__ == "__main__":
    sys.exit(test_api())
