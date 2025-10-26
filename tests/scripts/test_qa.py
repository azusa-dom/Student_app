# 测试 RAG 问答主流程
import pytest
from scripts.qa_enhanced import main as qa_main

def test_basic_query():
    result = qa_main("心理健康服务有哪些？")
    assert "心理" in result["answer"]
    assert result["intent"] == "wellbeing"
