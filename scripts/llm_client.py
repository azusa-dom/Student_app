# -*- coding: utf-8 -*-
import os
import time
import requests
from typing import List, Dict, Optional

class LLMUnavailable(Exception):
    pass

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434").rstrip("/")
OLLAMA_MODEL    = os.getenv("OLLAMA_MODEL", "tinyllama")

def is_configured() -> bool:
    """检查 Ollama 服务是否可用"""
    try:
        resp = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=3)
        return resp.status_code == 200
    except:
        return False

def chat_completion(messages: List[Dict[str, str]],
                    model: Optional[str] = None,
                    temperature: float = 0.4,
                    timeout: int = 60,
                    max_retries: int = 1) -> str:
    url = f"{OLLAMA_BASE_URL}/api/chat"
    payload = {
        "model": model or OLLAMA_MODEL,
        "messages": messages,
        "options": {"temperature": temperature},
        "stream": False
    }

    last_err = None
    for _ in range(max_retries + 1):
        try:
            resp = requests.post(url, json=payload, timeout=timeout)
            if resp.status_code == 200:
                data = resp.json()
                msg = data.get("message", {}).get("content")
                if msg:
                    return msg
                # 某些版本返回 messages 列表
                if "messages" in data:
                    return "\n".join(m.get("content", "") for m in data["messages"])
                return ""
            elif resp.status_code == 404:
                # 模型不存在
                error_detail = resp.text[:200]
                raise LLMUnavailable(f"模型 '{payload['model']}' 未安装。请运行: ollama pull {payload['model']}")
            else:
                last_err = RuntimeError(f"Ollama HTTP {resp.status_code}: {resp.text[:300]}")
        except LLMUnavailable:
            raise  # 直接抛出，不重试
        except Exception as e:
            last_err = e
        time.sleep(0.3)
    raise last_err if last_err else RuntimeError("Ollama chat failed.")