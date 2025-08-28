#!/bin/bash
echo "🔍 Student App 状态报告"
echo "=========================="
echo ""

# 检查本地构建状态
echo "📦 本地构建状态:"
if [ -d "/workspaces/Student_app/dist" ]; then
    echo "✅ dist 文件夹存在"
    echo "📁 dist 内容:"
    ls -la /workspaces/Student_app/dist/ | head -10
else
    echo "❌ dist 文件夹不存在"
fi
echo ""

# 检查网站访问状态
echo "🌐 网站访问状态:"
MAIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://azusa-dom.github.io/Student_app/)
TEST_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://azusa-dom.github.io/Student_app/test)

echo "🏠 主页: $MAIN_STATUS"
echo "🧪 测试页面: $TEST_STATUS"
echo ""

# 检查GitHub Actions
echo "🔄 GitHub Actions 状态:"
ACTIONS_DATA=$(curl -s https://api.github.com/repos/azusa-dom/Student_app/actions/runs 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "$ACTIONS_DATA" | jq '.workflow_runs[0] | {status, conclusion, created_at, head_commit: .head_commit.message}' 2>/dev/null || echo "无法解析Actions数据"
else
    echo "❌ 无法连接到GitHub API"
fi
echo ""

# 检查最近的提交
echo "📝 最近的提交:"
cd /workspaces/Student_app
git log --oneline -3
echo ""

echo "🌐 网站地址:"
echo "  主页: https://azusa-dom.github.io/Student_app/"
echo "  测试: https://azusa-dom.github.io/Student_app/test"
echo ""

echo "💡 建议:"
if [ "$MAIN_STATUS" = "200" ]; then
    echo "✅ 网站可以访问，请在浏览器中检查是否还有AuthProvider错误"
else
    echo "❌ 网站无法访问，可能需要等待GitHub Pages部署完成"
fi

cd /workspaces/Student_app && git add . && git commit -m "feat: add comprehensive AuthProvider test page" && npm run build && npm run deploy

"$BROWSER" https://azusa-dom.github.io/Student_app/test