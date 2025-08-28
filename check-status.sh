#!/bin/bash
echo "🔍 Student App 状态检查"
echo "========================"
echo ""

# 检查网站状态
echo "🌐 网站状态:"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://azusa-dom.github.io/Student_app/)
echo "主页响应: $STATUS"

if [ "$STATUS" = "200" ]; then
    echo "✅ 网站可以访问"
else
    echo "❌ 网站无法访问"
fi
echo ""

# 检查GitHub Actions
echo "🔄 GitHub Actions 状态:"
ACTIONS=$(curl -s https://api.github.com/repos/azusa-dom/Student_app/actions/runs 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "$ACTIONS" | jq '.workflow_runs[0] | "最新运行: \(.status) - \(.conclusion) - \(.head_commit.message)"' 2>/dev/null || echo "无法解析Actions数据"
else
    echo "❌ 无法连接到GitHub API"
fi
echo ""

# 检查最近的git提交
echo "📜 最近的git提交:"
cd /workspaces/Student_app && git log --oneline -3
echo ""

# 检查构建后的文件
echo "📂 构建后的文件:"
ls -la /workspaces/Student_app/dist/
echo ""

echo "🌐 网站地址: https://azusa-dom.github.io/Student_app/"
echo ""
echo "💡 如果网站显示错误，请等待几分钟让GitHub Pages更新缓存"

chmod +x /workspaces/Student_app/check-status.sh && /workspaces/Student_app/check-status.sh