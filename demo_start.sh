#!/bin/bash
# demo_start.sh - 一键启动 UCL QA 演示系统

set -e

echo "🎓 UCL AI 问答系统 - 演示启动"
echo "================================="

cd /workspaces/Student_app

# 检查虚拟环境
if [ ! -f ".venv/bin/python" ]; then
    echo "❌ 虚拟环境未找到，请先运行 setup.sh"
    exit 1
fi

# 杀死现有进程
echo "🧹 清理旧进程..."
pkill -f "serve_qa.py" || true
sleep 1

# 启动服务
echo "🚀 启动 API 服务（端口 5051）..."
.venv/bin/python serve_qa.py > /tmp/demo_qa.log 2>&1 &
SERVICE_PID=$!

# 等待服务启动
sleep 3

# 检查健康状态
echo "✅ 检查服务健康状态..."
if curl -s http://127.0.0.1:5051/health >/dev/null 2>&1; then
    echo "✅ 服务已启动！"
    echo ""
    echo "📍 演示页面: http://127.0.0.1:5051/"
    echo "🔌 API 端点: http://127.0.0.1:5051/api/qa?query=<your-query>"
    echo "📊 日志文件: /tmp/demo_qa.log"
    echo ""
    echo "📋 试试这些问题："
    echo "  1. 心理咨询怎么预约"
    echo "  2. 计算机专业入学要求是什么"
    echo "  3. 怎么改简历"
    echo "  4. 商科硕士需要什么成绩"
    echo "  5. UCL GPA怎么算"
    echo ""
    echo "🛑 按 Ctrl+C 停止服务"
    wait $SERVICE_PID
else
    echo "❌ 服务启动失败"
    tail -20 /tmp/demo_qa.log
    exit 1
fi
