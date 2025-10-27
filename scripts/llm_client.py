#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
llm_client.py - Groq 客户端
导出：chat_with_groq, is_configured
"""

import os
import time
import logging
from groq import Groq

logger = logging.getLogger("llm_client")

# 🔥 改进：添加防御性检查
_api_key = os.getenv("GROQ_API_KEY")
if _api_key:
    client = Groq(api_key=_api_key)
else:
    client = None  # 延迟初始化
    logger.warning("GROQ_API_KEY not set, client will be None")

def is_configured() -> bool:
    return bool(os.getenv("GROQ_API_KEY"))

def chat_with_groq(messages, temperature=0.1, max_retries=2, model="llama-3.1-70b-versatile"):
    if not is_configured():
        raise Exception("GROQ_API_KEY not set")
    
    # 🔥 改进：懒加载客户端
    global client
    if client is None:
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    
    for attempt in range(max_retries):
        try:
            logger.info(f"Calling Groq model={model}, attempt={attempt+1}/{max_retries}")
            response = client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=1024,
                top_p=0.95,
            )
            content = response.choices[0].message.content
            logger.info(f"Groq response: {len(content)} chars")
            return content
        except Exception as e:
            logger.warning(f"Groq attempt {attempt+1} failed: {e}")
            if attempt == max_retries - 1:
                raise Exception(f"Groq call failed after {max_retries} attempts: {e}")
            time.sleep(1 * (2 ** attempt))
    return None