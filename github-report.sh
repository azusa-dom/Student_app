#!/bin/bash
echo "📊 GitHub 更新报告"
echo "=================="
echo ""

# 检查git状态
echo "📝 Git 状态:"
cd /workspaces/Student_app
echo "当前分支: $(git branch --show-current)"
echo "最新提交: $(git log --oneline -1)"
echo ""

# 检查最近的git提交历史
echo "📜 最近的提交历史:"
cd /workspaces/Student_app && git log --oneline -5
echo ""

# 检查GitHub Actions
echo "🔄 GitHub Actions 状态:"
ACTIONS=$(curl -s https://api.github.com/repos/azusa-dom/Student_app/actions/runs 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "$ACTIONS" | jq '.workflow_runs[0] | "状态: \(.status) | 结果: \(.conclusion) | 提交: \(.head_commit.message)"' 2>/dev/null || echo "无法解析Actions数据"
else
    echo "❌ 无法连接到GitHub API"
fi
echo ""

# 检查网站状态
echo "🌐 网站状态:"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://azusa-dom.github.io/Student_app/)
echo "主页响应: $STATUS"

if [ "$STATUS" = "200" ]; then
    echo "✅ 网站可以正常访问"
else
    echo "❌ 网站访问异常"
fi
echo ""

echo "📋 更新内容:"
echo "✅ 修复 AuthProvider 上下文嵌套问题"
echo "✅ 添加 AuthProvider 实时测试组件"
echo "✅ 更新 OnboardingScreen 包含测试验证"
echo "✅ 添加状态检查和部署监控脚本"
echo "✅ 修复 CSP 和路由问题"
echo ""

echo "🌐 访问地址:"
echo "  主页: https://azusa-dom.github.io/Student_app/"
echo "  测试: https://azusa-dom.github.io/Student_app/test"
echo ""

echo "💡 注意:"
echo "GitHub Pages 部署可能需要 1-2 分钟完成"
echo "如果网站显示旧版本，请尝试强制刷新 (Ctrl+F5)"
chmod +x /workspaces/Student_app/github-report.sh && /workspaces/Student_app/github-report.sh
"$BROWSER" https://azusa-dom.github.io/Student_app/