#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
LLM 服务诊断脚本
检查 Ollama 配置和可用性
"""
import os
import sys
import requests
import time
from pathlib import Path

def check_ollama_service():
    """检查 Ollama 服务状态"""
    print("\n" + "="*60)
    print("🔍 Ollama 服务诊断")
    print("="*60)
    
    # 读取环境变量
    base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    model = os.getenv("OLLAMA_MODEL", "tinyllama")
    
    print(f"\n📍 配置信息:")
    print(f"   Base URL: {base_url}")
    print(f"   Model: {model}")
    
    # 1. 检查服务是否运行
    print(f"\n🔌 检查 Ollama 服务...")
    try:
        response = requests.get(f"{base_url}/api/tags", timeout=5)
        if response.status_code == 200:
            print(f"   ✅ Ollama 服务正在运行")
            data = response.json()
            models = data.get("models", [])
            print(f"   📦 已安装模型: {len(models)} 个")
            for m in models:
                print(f"      - {m.get('name', 'unknown')}")
        else:
            print(f"   ❌ 服务响应异常: HTTP {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print(f"   ❌ 无法连接到 Ollama 服务")
        print(f"\n💡 解决方案:")
        print(f"   1. 确保 Ollama 已安装: https://ollama.ai/")
        print(f"   2. 启动服务: ollama serve")
        print(f"   3. 或在后台运行: nohup ollama serve &")
        return False
    except Exception as e:
        print(f"   ❌ 检查失败: {e}")
        return False
    
    # 2. 检查目标模型
    print(f"\n🎯 检查目标模型 '{model}'...")
    try:
        response = requests.get(f"{base_url}/api/tags", timeout=5)
        data = response.json()
        models = data.get("models", [])
        model_names = [m.get("name", "") for m in models]
        
        if any(model in name for name in model_names):
            print(f"   ✅ 模型 '{model}' 已安装")
        else:
            print(f"   ❌ 模型 '{model}' 未安装")
            print(f"\n💡 解决方案:")
            print(f"   安装模型: ollama pull {model}")
            print(f"\n   推荐模型:")
            print(f"   - tinyllama (快速，轻量)")
            print(f"   - llama2 (平衡)")
            print(f"   - mistral (高质量)")
            return False
    except Exception as e:
        print(f"   ❌ 检查失败: {e}")
        return False
    
    # 3. 测试对话功能
    print(f"\n🧪 测试对话功能...")
    try:
        test_payload = {
            "model": model,
            "messages": [
                {"role": "user", "content": "Hello"}
            ],
            "stream": False
        }
        
        start = time.time()
        response = requests.post(
            f"{base_url}/api/chat",
            json=test_payload,
            timeout=30
        )
        elapsed = time.time() - start
        
        if response.status_code == 200:
            data = response.json()
            reply = data.get("message", {}).get("content", "")
            print(f"   ✅ 对话测试成功 (耗时: {elapsed:.2f}s)")
            print(f"   📝 模型回复: {reply[:100]}...")
        else:
            print(f"   ❌ 对话失败: HTTP {response.status_code}")
            print(f"   响应: {response.text[:200]}")
            return False
            
    except Exception as e:
        print(f"   ❌ 测试失败: {e}")
        return False
    
    print(f"\n{'='*60}")
    print("✅ 所有检查通过！LLM 服务可用")
    print("="*60)
    return True


def check_data_files():
    """检查数据文件"""
    print("\n" + "="*60)
    print("📁 数据文件检查")
    print("="*60)
    
    ROOT = Path.cwd()
    files_to_check = [
        ROOT / "public/data/ucl_programs.json",
        ROOT / "public/data/ucl_services.json",
    ]
    
    all_ok = True
    for fpath in files_to_check:
        if fpath.exists():
            size = fpath.stat().st_size
            print(f"   ✅ {fpath.name} ({size:,} bytes)")
        else:
            print(f"   ❌ {fpath.name} 不存在")
            all_ok = False
    
    return all_ok


def main():
    print("\n🩺 UCL AI QA 系统诊断")
    
    # 检查 Ollama
    ollama_ok = check_ollama_service()
    
    # 检查数据文件
    data_ok = check_data_files()
    
    # 总结
    print("\n" + "="*60)
    print("📊 诊断总结")
    print("="*60)
    print(f"   Ollama 服务: {'✅ 正常' if ollama_ok else '❌ 异常'}")
    print(f"   数据文件: {'✅ 完整' if data_ok else '❌ 缺失'}")
    
    if ollama_ok and data_ok:
        print("\n✅ 系统一切正常，可以开始使用！")
    else:
        print("\n⚠️  系统存在问题，请按照上述提示修复")
    
    print("="*60 + "\n")


if __name__ == "__main__":
    main()