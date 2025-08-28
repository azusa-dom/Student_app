cd /workspaces/Student_app && git push origin main
curl -s https://api.github.com/repos/azusa-dom/Student_app/actions/runs | jq '.workflow_runs[0] | {status, conclusion, created_at, head_commit: .head_commit.message}' 2>/dev/null || echo "无法获取GitHub Actions状态"
curl -s -o /dev/null -w "%{http_code}" https://azusa-dom.github.io/Student_app/