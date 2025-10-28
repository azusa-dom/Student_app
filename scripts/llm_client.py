#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
llm_client.py - Groq 客户端（完全修复版）
导出：chat_with_groq, is_configured
"""

import os
import time
import logging

logger = logging.getLogger("llm_client")

# ============ 全局客户端（延迟初始化）============
_groq_client = None

def _init_client():
    """延迟初始化 Groq 客户端"""
    global _groq_client
    
    if _groq_client is not None:
        return _groq_client
    
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        logger.error("❌ GROQ_API_KEY not set")
        return None
    
    try:
        from groq import Groq
        # 🔥 只传递 api_key，不传递其他参数（避免 proxies 错误）
        _groq_client = Groq(api_key=api_key)
        logger.info(f"✅ Groq client initialized")
        return _groq_client
    except Exception as e:
        logger.error(f"❌ Failed to initialize Groq: {e}")
        return None

def is_configured() -> bool:
    """检查 GROQ_API_KEY 是否配置"""
    return bool(os.getenv("GROQ_API_KEY"))

def chat_with_groq(
    messages, 
    temperature=0.1, 
    max_retries=2, 
    model="llama-3.3-70b-versatile"
):
    """
    调用 Groq API
    
    Args:
        messages: 消息列表 [{"role": "user", "content": "..."}]
        temperature: 温度参数 (0-1)
        max_retries: 最大重试次数
        model: 模型名称
    
    Returns:
        str: LLM 返回的文本
    
    Raises:
        Exception: API 调用失败
    """
    # 检查配置
    if not is_configured():
        raise Exception("❌ GROQ_API_KEY not set. Run: export GROQ_API_KEY='your_key'")
    
    # 初始化客户端
    groq_client = _init_client()
    if groq_client is None:
        raise Exception("❌ Failed to initialize Groq client")
    
    # 重试逻辑
    for attempt in range(max_retries):
        try:
            logger.info(f"🤖 Groq (model={model}, T={temperature}, try={attempt+1}/{max_retries})")
            
            response = groq_client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=1024,
                top_p=0.95,
            )
            
            content = response.choices[0].message.content
            logger.info(f"✅ Success: {len(content)} chars")
            return content
        
        except Exception as e:
            logger.warning(f"⚠️  Try {attempt+1} failed: {e}")
            
            if attempt == max_retries - 1:
                logger.error(f"❌ All {max_retries} attempts failed")
                raise Exception(f"Groq API failed: {str(e)[:200]}")
            
            # 指数退避
            wait = 1 * (2 ** attempt)
            logger.info(f"⏳ Retry in {wait}s...")
            time.sleep(wait)
    
    return None


# ============ 测试 ============
if __name__ == "__main__":
    import sys
    
    print("=" * 60)
    print("🧪 Testing llm_client.py")
    print("=" * 60)
    
    # 检查配置
    if not is_configured():
        print("❌ GROQ_API_KEY not set!")
        print("\nRun: export GROQ_API_KEY='your_key_here'")
        sys.exit(1)
    
    print(f"✅ GROQ_API_KEY configured")
    
    # 测试初始化
    print("\n📝 Testing client init...")
    client = _init_client()
    if client is None:
        print("❌ Init failed")
        sys.exit(1)
    print("✅ Client initialized")
    
    # 测试中文对话
    print("\n📝 Testing Chinese response...")
    test_messages = [
        {"role": "system", "content": "你是助手。必须用中文回答。"},
        {"role": "user", "content": "用一句话介绍 UCL"}
    ]
    
    try:
        response = chat_with_groq(test_messages)
        print(f"\n✅ SUCCESS!\n\nResponse:\n{response}\n")
        
        # 验证中文
        import re
        cn = len(re.findall(r'[\u4e00-\u9fff]', response))
        if cn > 10:
            print(f"✅ Chinese verified ({cn} chars)")
        else:
            print(f"⚠️  Warning: May not be Chinese")
        
    except Exception as e:
        print(f"\n❌ FAILED: {e}\n")
        sys.exit(1)
    
    print("\n" + "=" * 60)
    print("🎉 All tests passed!")
    print("=" * 60)