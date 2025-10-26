#!/bin/bash
# 一键部署脚本
npm run build
cp -r dist/* public/
echo "部署完成，可推送到 gh-pages 分支。"