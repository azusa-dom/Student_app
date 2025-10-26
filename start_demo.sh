#!/bin/bash
# UCL AI QA 系统演示启动脚本

echo "🚀 正在启动 UCL AI QA 系统..."
echo ""

# 检查虚拟环境
if [ ! -d ".venv" ]; then
    echo "❌ 错误：未找到 Python 虚拟环境"
    echo "请先运行: python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi

# 检查数据文件
if [ ! -f "data/qa_index.pkl" ]; then
    echo "❌ 错误：未找到 QA 索引文件"
    echo "请先运行: python scripts/build_qa_index.py"
    exit 1
fi

# 停止旧进程
echo "🔍 检查现有服务..."
OLD_PID=$(lsof -ti:5051)
if [ ! -z "$OLD_PID" ]; then
    echo "⚠️  发现端口 5051 已被占用 (PID: $OLD_PID)，正在停止..."
    kill -9 $OLD_PID 2>/dev/null
    sleep 1
fi

# 启动 API 服务
echo "📡 正在启动 API 服务（端口 5051）..."
.venv/bin/python serve_qa.py > logs/api_server.log 2>&1 &
API_PID=$!
echo "   API 进程 PID: $API_PID"

# 等待服务启动
echo "⏳ 等待服务就绪..."
for i in {1..10}; do
    if curl -s http://localhost:5051/api/health > /dev/null 2>&1; then
        echo "✅ API 服务已就绪！"
        break
    fi
    sleep 1
    if [ $i -eq 10 ]; then
        echo "❌ 服务启动超时"
        exit 1
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 UCL AI QA 系统已启动！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 使用方式："
echo ""
echo "  方式 1: 打开演示网页（推荐给老板看）"
echo "    在浏览器中打开: file://$(pwd)/demo_qa.html"
echo "    或在 VS Code 中右键 demo_qa.html -> Open with Live Server"
echo ""
echo "  方式 2: 命令行测试"
echo "    curl \"http://localhost:5051/api/qa?query=计算机科学硕士的语言要求\""
echo ""
echo "  方式 3: Python 交互式"
echo "    python scripts/qa_enhanced.py"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 提示："
echo "  - API 日志: tail -f logs/api_server.log"
echo "  - 停止服务: kill $API_PID"
echo "  - 健康检查: curl http://localhost:5051/api/health"
echo ""
