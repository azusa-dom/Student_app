# scripts/check_final_coverage.py
# 统计最终覆盖率

import json
from collections import Counter

file_path = 'data/ucl_clean_v2.jsonl'

try:
    with open(file_path) as f:
        data = [json.loads(l) for l in f]
except FileNotFoundError:
    print(f"{file_path} not found!")
    exit(1)

total = len(data)
count = Counter()
for item in data:
    for sec in item['sections']:
        count[sec['heading']] += 1

print(f"\nFinal Coverage ({total} programs):")
print("-" * 50)
for k, v in sorted(count.items(), key=lambda x: -x[1]):
    print(f"{k:25} {v:4}/{total}  ({v/total*100:5.1f}%)")