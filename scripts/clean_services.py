import json
from pathlib import Path

input_file = 'data/supplement/ucl_services_raw.jsonl'
output_file = 'data/ucl_services_clean.jsonl'

seen = set()
cleaned = 0

with open(input_file, 'r') as f_in, open(output_file, 'w') as f_out:
    for line in f_in:
        if not line.strip():
            continue
        item = json.loads(line)
        key = (item['service_name'], item['url'])
        if key in seen:
            continue
        seen.add(key)
        
        # 标准化
        item['service_name'] = item['service_name'].strip()
        item['description'] = item['description'].strip()
        if len(item['description']) < 20:
            item['description'] = 'Service details available on website.'
        
        f_out.write(json.dumps(item, ensure_ascii=False) + '\n')
        cleaned += 1

print(f"Cleaned {cleaned} unique services → {output_file}")
