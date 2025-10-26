# 测试 LLM 客户端
import pytest
from scripts.llm_client import query_ollama

def test_llm_response():
    resp = query_ollama("介绍一下UCL的心理健康服务")
    assert resp
    assert isinstance(resp, str)
