#!/bin/bash
set -e  # 出错即退出

echo "[$(date)] Daily update started..."

# 1. 增量爬取 + 自动合并（update_services.py 里已实现）
python scripts/update_services.py

# 2. 导出 programs → public/data/ucl_programs.json
mkdir -p public/data
python - <<'PY'
import json, sys
path = 'data/ucl_clean_v2.jsonl'
data = [json.loads(l) for l in open(path, encoding='utf-8') if l.strip()]
out = 'public/data/ucl_programs.json'
json.dump(data, open(out, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print(f"Programs exported: {len(data)} → {out}")
PY

# 3. 导出 services → public/data/ucl_services.json
python - <<'PY'
import json, sys
path = 'data/ucl_services_clean.jsonl'
data = [json.loads(l) for l in open(path, encoding='utf-8') if l.strip()]
out = 'public/data/ucl_services.json'
json.dump(data, open(out, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print(f"Services exported: {len(data)} → {out}")
PY

# 4. 构建 + 部署
npm run deploy

echo "[$(date)] Update complete! https://azusa-dom.github.io/Student_app/"