# 部署指南

本目录包含部署相关说明。

- `deploy.sh`：一键部署脚本。
- `demo_start.sh`/`start_demo.sh`：本地/演示环境启动脚本。
- `serve_qa.py`/`serve_qa_demo.py`：后端服务启动。
- `dist/`、`public/`：前端静态资源。

## GitHub Pages 部署
1. 前端打包：`npm run build`
2. 推送 `dist/` 到 gh-pages 分支
3. 后端需单独部署（如云服务器）

详细步骤见 README.md。