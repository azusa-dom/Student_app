#!/bin/bash
# Codespace 一键修复脚本
# 使用方法: bash codespace_quick_fix.sh

set -e

echo "🚀 UCL AI QA - Codespace 一键修复"
echo "=================================="
echo

# 1. 检查并安装 Ollama
echo "📦 步骤 1/5: 安装 Ollama..."
if ! command -v ollama &> /dev/null; then
    echo "   安装 Ollama..."
    curl -fsSL https://ollama.ai/install.sh | sh
    echo "   ✅ Ollama 安装完成"
else
    echo "   ✅ Ollama 已安装"
fi
echo

# 2. 启动 Ollama 服务
echo "📦 步骤 2/5: 启动 Ollama 服务..."
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "   ✅ Ollama 服务已在运行"
else
    echo "   启动服务..."
    nohup ollama serve > /tmp/ollama.log 2>&1 &
    sleep 5
    
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo "   ✅ Ollama 服务启动成功"
    else
        echo "   ❌ Ollama 启动失败，查看日志: /tmp/ollama.log"
        exit 1
    fi
fi
echo

# 3. 安装模型
echo "📦 步骤 3/5: 安装 tinyllama 模型..."
if ollama list | grep -q "tinyllama"; then
    echo "   ✅ tinyllama 已安装"
else
    echo "   下载模型（约 1.1GB，可能需要几分钟）..."
    ollama pull tinyllama
    echo "   ✅ 模型安装完成"
fi
echo

# 4. 备份并替换代码
echo "📦 步骤 4/5: 更新代码..."
if [ -f "scripts/qa_enhanced_wrapper.py" ]; then
    # 备份
    if [ ! -f "scripts/qa_enhanced_wrapper.py.bak" ]; then
        cp scripts/qa_enhanced_wrapper.py scripts/qa_enhanced_wrapper.py.bak
        echo "   ✅ 已备份原文件"
    fi
    
    # 替换
    if [ -f "qa_enhanced_wrapper_fixed.py" ]; then
        cp qa_enhanced_wrapper_fixed.py scripts/qa_enhanced_wrapper.py
        echo "   ✅ 已更新 qa_enhanced_wrapper.py"
    else
        echo "   ⚠️  qa_enhanced_wrapper_fixed.py 不存在，跳过替换"
        echo "   请手动下载并放置该文件"
    fi
else
    echo "   ⚠️  scripts/qa_enhanced_wrapper.py 不存在"
fi
echo

# 5. 运行诊断
echo "📦 步骤 5/5: 运行诊断..."
if [ -f "diagnose_llm.py" ]; then
    python3 diagnose_llm.py
else
    echo "   ⚠️  diagnose_llm.py 不存在，跳过诊断"
    echo "   手动测试: curl http://localhost:11434/api/tags"
fi
echo

# 完成
echo "=================================="
echo "✅ 修复完成！"
echo "=================================="
echo
echo "下一步："
echo "1. 重启服务: python serve_qa_demo.py"
echo "2. 测试问答: 访问你的服务端口"
echo "3. 查看日志确认 LLM 工作正常"
echo
echo "日志位置:"
echo "- Ollama: /tmp/ollama.log"
echo "- 服务: 查看启动命令的输出"
echo