#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
llm_client.py - Groq 客户端（完全修复版）
导出：chat_with_groq, is_configured
"""

import os
import time
import logging

# ============ 日志配置（必须在最前面）============
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
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
        _groq_client = Groq(api_key=api_key)
        logger.info("✅ Groq client initialized")
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
