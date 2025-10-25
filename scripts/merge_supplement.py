# scripts/merge_supplement.py
# 智能合并：自动查找原始文件 + 增量追加
import json
from collections import defaultdict
from pathlib import Path

# === 自动查找原始文件 ===
POSSIBLE_ORIGINALS = [
    'data/ucl_clean.jsonl',
    'data/ucl_clean_v1.jsonl',
    'data/ucl_raw.jsonl',
    'data/ucl_clean_v2.jsonl',
]

SUPPLEMENT_FILE = 'data/supplement/assessment_supplement.jsonl'
OUTPUT_FILE = 'data/ucl_clean_v2.jsonl'

original_file = None
for path in POSSIBLE_ORIGINALS:
    if Path(path).exists():
        original_file = path
        print(f"Found original: {original_file}")
        break

if not original_file:
    print("Error: No original file found! Check these:")
    for p in POSSIBLE_ORIGINALS:
        print(f"  - {p}")
    exit(1)

# === 读取补丁 ===
supplements = defaultdict(list)
try:
    with open(SUPPLEMENT_FILE, 'r') as f:
        for line in f:
            if line.strip():
                item = json.loads(line)
                supplements[item['url']].extend(item['sections'])
    print(f"Loaded {len(supplements)} patches")
except FileNotFoundError:
    print(f"{SUPPLEMENT_FILE} not found!")
    exit(1)

# === 合并 ===
added = 0
Path(OUTPUT_FILE).parent.mkdir(parents=True, exist_ok=True)
with open(original_file, 'r') as f_in, open(OUTPUT_FILE, 'w') as f_out:
    for line in f_in:
        if not line.strip():
            continue
        item = json.loads(line)
        url = item.get('url')
        if url and url in supplements:
            existing = {s['heading'].lower() for s in item.get('sections', [])}
            for sec in supplements[url]:
                if sec['heading'].lower() not in existing:
                    item['sections'].append(sec)
                    added += 1
        f_out.write(json.dumps(item, ensure_ascii=False) + '\n')

print(f"Merged! Added {added} new sections → {OUTPUT_FILE}")