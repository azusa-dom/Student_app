#!/bin/bash
cd /workspaces/Student_app

echo "🔄 添加文件到git..."
git add .

echo "📝 提交更改..."
git commit -m "fix: add AuthProvider test to OnboardingScreen"

echo "🔨 构建项目..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ 构建成功！开始部署..."
    npm run deploy

    if [ $? -eq 0 ]; then
        echo "🎉 部署成功！"
        echo "🌐 网站地址: https://azusa-dom.github.io/Student_app/"
        echo "🔍 打开浏览器查看网站..."
        "$BROWSER" https://azusa-dom.github.io/Student_app/
    else
        echo "❌ 部署失败！"
        exit 1
    fi
else
    echo "❌ 构建失败！"
    exit 1
fi

cd /workspaces/Student_app && npm run build
cd /workspaces/Student_app && npm run deploy
ls -la /workspaces/Student_app/dist/

echo "📡 检查GitHub Actions的最新运行状态..."
curl -s https://api.github.com/repos/azusa-dom/Student_app/actions/runs | jq '.workflow_runs[0] | {status, conclusion, created_at, head_commit: .head_commit.message}' 2>/dev/null || echo "无法获取GitHub Actions状态"

echo "🔍 检查网站HTTP状态码..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://azusa-dom.github.io/Student_app/)
if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "✅ 网站正常运行，状态码：$HTTP_STATUS"
else
    echo "❌ 网站出现问题，状态码：$HTTP_STATUS"
    exit 1
fi

echo "🔄 检查网站响应状态..."
curl -s -o /dev/null -w "%{http_code}" https://azusa-dom.github.io/Student_app/
if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "✅ 网站响应正常，状态码：$HTTP_STATUS"
else
    echo "❌ 网站响应出现问题，状态码：$HTTP_STATUS"
    exit 1
fi