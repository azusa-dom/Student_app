import json
from pathlib import Path
from datetime import datetime

def merge_data():
    """合并原始数据和补充数据"""
    print("开始合并数据...")
    
    # 读取原始数据
    with open('data/processed/ucl_programs.json', 'r', encoding='utf-8') as f:
        original_data = json.load(f)
    
    # 建立URL索引
    url_to_program = {prog['url']: prog for prog in original_data}
    
    # 读取补充数据
    supplement_file = Path('data/supplement/assessment_supplement.jsonl')
    if not supplement_file.exists():
        print("未找到补充数据文件！")
        return
    
    # 统计信息
    stats = {
        'total': len(original_data),
        'updated': 0,
        'assessment_coverage_before': 0,
        'assessment_coverage_after': 0,
        'structure_coverage_before': 0,
        'structure_coverage_after': 0
    }
    
    # 计算原始覆盖率
    for prog in original_data:
        sections = prog.get('sections', {})
        if 'assessment' in sections:
            stats['assessment_coverage_before'] += 1
        if 'structure' in sections:
            stats['structure_coverage_before'] += 1
    
    # 处理补充数据
    print("合并补充数据...")
    with open(supplement_file, 'r', encoding='utf-8') as f:
        for line in f:
            try:
                supplement = json.loads(line)
                url = supplement['url']
                if url in url_to_program:
                    # 更新sections
                    program = url_to_program[url]
                    for section in supplement['sections']:
                        heading = section['heading'].lower()
                        # 根据关键词确定section类型
                        if 'assessment' in heading or 'examination' in heading:
                            program['sections']['assessment'] = section['text']
                        elif 'structure' in heading:
                            program['sections']['structure'] = section['text']
                    stats['updated'] += 1
            except json.JSONDecodeError:
                continue
    
    # 计算新的覆盖率
    for prog in original_data:
        sections = prog.get('sections', {})
        if 'assessment' in sections:
            stats['assessment_coverage_after'] += 1
        if 'structure' in sections:
            stats['structure_coverage_after'] += 1
    
    # 保存合并后的数据
    output_file = 'data/ucl_clean_v2.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(original_data, f, ensure_ascii=False, indent=2)
    
    # 生成报告
    report = f"""数据合并报告
生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

总课程数: {stats['total']}
更新课程数: {stats['updated']}

Assessment章节覆盖率:
- 更新前: {stats['assessment_coverage_before']/stats['total']*100:.1f}%
- 更新后: {stats['assessment_coverage_after']/stats['total']*100:.1f}%

Structure章节覆盖率:
- 更新前: {stats['structure_coverage_before']/stats['total']*100:.1f}%
- 更新后: {stats['structure_coverage_after']/stats['total']*100:.1f}%
"""
    
    # 保存报告
    with open('data/supplement/merge_report.txt', 'w', encoding='utf-8') as f:
        f.write(report)
    
    print("\n合并完成！")
    print(f"更新的课程数: {stats['updated']}")
    print(f"新数据已保存到: {output_file}")
    print("详细报告已保存到: data/supplement/merge_report.txt")

if __name__ == '__main__':
    merge_data()