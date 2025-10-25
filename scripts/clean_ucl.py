# scripts/clean_ucl.py
# 清洗ucl_raw.jsonl：去空sections、去重、标准化
# 运行：python scripts/clean_ucl.py
# 输出：data/ucl_clean.jsonl

import json

input_file = 'data/ucl_raw.jsonl'
output_file = 'data/ucl_clean.jsonl'

if not json.loads:  # 简单检查
    print("Error: JSON module not available.")
    exit(1)

try:
    with open(input_file, 'r') as f_in, open(output_file, 'w') as f_out:
        seen_urls = set()  # 全局去重URL
        for line in f_in:
            if not line.strip():
                continue
            try:
                item = json.loads(line)
            except json.JSONDecodeError:
                print(f"Skipping invalid JSON line: {line[:50]}...")
                continue

            if item['url'] in seen_urls:
                print(f"Duplicate URL skipped: {item['url']}")
                continue
            seen_urls.add(item['url'])

            # 清洗sections：去空、去重heading
            cleaned_sections = []
            seen_headings = set()
            for sec in item.get('sections', []):
                heading = sec['heading'].strip().lower()
                text = sec['text'].strip()
                if not text or heading in seen_headings:
                    continue
                seen_headings.add(heading)
                cleaned_sections.append({
                    'heading': sec['heading'],
                    'text': text.replace('\n', ' ').replace('  ', ' ')  # 标准化空格
                })

            if cleaned_sections:
                item['sections'] = cleaned_sections
                f_out.write(json.dumps(item, ensure_ascii=False) + '\n')
            else:
                print(f"No valid sections after cleaning for {item['url']}")

    print(f"Cleaning complete! Output: {output_file}")
except FileNotFoundError:
    print(f"Error: Input file {input_file} not found. Run crawl_ucl.py first.")