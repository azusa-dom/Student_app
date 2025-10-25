# scripts/normalize_headings.py
import json

input_file = 'data/ucl_clean_v2.jsonl'
output_file = 'data/ucl_final.jsonl'

mapping = {
    'fees and funding': 'Fees and Funding',
    'fees for this course': 'Fees and Funding',
    'funding your studies': 'Fees and Funding',
    'programme structure': 'Programme Structure',
    'compulsory modules': 'Compulsory Modules',
    'optional modules': 'Optional Modules',
    'teaching and learning': 'Teaching and Learning',
    'entry requirements': 'Entry Requirements',
}

with open(input_file, 'r') as f_in, open(output_file, 'w') as f_out:
    for line in f_in:
        item = json.loads(line)
        for sec in item.get('sections', []):
            key = sec['heading'].lower()
            if key in mapping:
                sec['heading'] = mapping[key]
        f_out.write(json.dumps(item, ensure_ascii=False) + '\n')

print(f"Normalized → {output_file}")