#!/bin/bash
# 一键部署最终修复版

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║               🚀 部署最终修复版 - 解决所有问题                          ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# 检查目录
if [ ! -d "scripts" ]; then
    echo "❌ 错误：请在项目根目录运行此脚本"
    echo "   cd /workspaces/Student_app && bash DEPLOY_NOW.sh"
    exit 1
fi

echo "📍 当前目录: $(pwd)"
echo ""

# 检查修复文件
FIXED_FILE="/workspaces/Student_app/qa_enhanced_wrapper_FINAL.py"
if [ ! -f "$FIXED_FILE" ]; then
    echo "❌ 找不到修复文件: $FIXED_FILE"
    exit 1
fi

echo "✅ 找到修复文件"
echo ""

# 备份
echo "📦 备份原文件..."
BACKUP_TIME=$(date +%Y%m%d_%H%M%S)
if [ -f "scripts/qa_enhanced_wrapper.py" ]; then
    cp scripts/qa_enhanced_wrapper.py "scripts/qa_enhanced_wrapper.py.backup.$BACKUP_TIME"
    echo "✅ 已备份到: scripts/qa_enhanced_wrapper.py.backup.$BACKUP_TIME"
else
    echo "⚠️  原文件不存在"
fi
echo ""

# 替换
echo "🔄 替换文件..."
cp "$FIXED_FILE" scripts/qa_enhanced_wrapper.py
echo "✅ 已替换 scripts/qa_enhanced_wrapper.py"
echo ""

# 验证
echo "🔍 验证文件..."
if grep -q "_format_answer_with_llm" scripts/qa_enhanced_wrapper.py; then
    echo "✅ 验证通过：包含 LLM 格式化函数"
else
    echo "❌ 验证失败"
    exit 1
fi

if grep -q "_detect_language" scripts/qa_enhanced_wrapper.py; then
    echo "✅ 验证通过：包含改进的语言检测"
else
    echo "❌ 验证失败"
    exit 1
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║                         🎉 部署成功！                                    ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 修复内容："
echo "   ✅ 移除 cache_embeddings 参数（兼容当前 enhanced_retriever.py）"
echo "   ✅ 改进语言检测（基于中文字符占比）"
echo "   ✅ 使用 LLM 格式化答案（自然语言回答）"
echo "   ✅ 添加降级方案（LLM 不可用时）"
echo ""
echo "📝 下一步："
echo "   1. 重启服务: python api_qa.py"
echo "   2. 测试英文查询: What are the tuition fees?"
echo "   3. 测试中文查询: 数据科学硕士的学费是多少？"
echo ""
echo "💡 预期效果："
echo "   ✅ 英文查询 → 英文流畅答案"
echo "   ✅ 中文查询 → 中文流畅答案"
echo "   ✅ 答案格式化良好，可读性高"
echo ""
