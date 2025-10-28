import json
import pandas as pd
import os
import re
from datetime import datetime
from collections import Counter

def ensure_directories():
    """确保数据目录存在"""
    os.makedirs('data/raw', exist_ok=True)
    os.makedirs('data/processed', exist_ok=True)

def load_jsonl(file_path):
    """加载JSONL文件"""
    data = []
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            try:
                data.append(json.loads(line.strip()))
            except json.JSONDecodeError:
                continue
    return data

def clean_text(text):
    """清理文本中的特殊字符和格式问题"""
    if not isinstance(text, str):
        return text
    
    # 替换 Unicode 转义序列
    text = text.encode('utf-8').decode('unicode_escape')
    
    # 统一空白字符
    text = re.sub(r'\s+', ' ', text)
    
    # 移除非打印字符
    text = ''.join(char for char in text if char.isprintable())
    
    # 处理特殊符号
    text = text.replace('\u00a3', '£')  # 替换英镑符号
    text = text.replace('&amp;', '&')   # 处理HTML实体
    
    return text.strip()

def normalize_heading(heading):
    """标准化章节标题"""
    if not isinstance(heading, str):
        return None
        
    # 转换为小写并移除多余空格
    heading = heading.lower().strip()
    
    # 标题映射字典
    heading_map = {
        'entry requirements': 'entry_requirements',
        'programme structure': 'structure',
        'course structure': 'structure',
        'degree structure': 'structure',
        'overview': 'overview',
        'about': 'overview',
        'careers': 'careers',
        'employability': 'careers',
        'fees': 'fees',
        'funding': 'funding',
        'scholarships': 'funding',
        'assessment': 'assessment',
        'teaching and assessment': 'assessment',
        'modules': 'modules',
        'core modules': 'modules',
    }
    
    # 查找最匹配的标准标题
    for key, value in heading_map.items():
        if key in heading:
            return value
            
    return None

def extract_course_info(item):
    """从课程数据中提取关键信息"""
    # 基本信息
    info = {
        'title': clean_text(item.get('title', '')),
        'url': item.get('url', ''),
        'school': item.get('school', ''),
        'type': item.get('type', ''),
        'last_crawled_at': item.get('last_crawled_at', '')
    }
    
    # 提取学位类型
    title = info['title'].lower()
    if 'msc' in title:
        info['degree_type'] = 'msc'
    elif 'ma' in title:
        info['degree_type'] = 'ma'
    elif 'bsc' in title:
        info['degree_type'] = 'bsc'
    elif 'ba' in title:
        info['degree_type'] = 'ba'
    else:
        info['degree_type'] = 'other'
    
    # 处理sections
    sections = {}
    for section in item.get('sections', []):
        heading = normalize_heading(section.get('heading', ''))
        if heading:
            sections[heading] = clean_text(section.get('text', ''))
    
    info['sections'] = sections
    return info

def process_data():
    """处理爬取的数据"""
    ensure_directories()
    
    # 加载原始数据
    print("加载原始数据...")
    raw_data = load_jsonl('data/ucl_raw.jsonl')
    
    # 统计信息
    stats = {
        'total_programs': len(raw_data),
        'degree_types': Counter(),
        'section_counts': Counter(),
        'missing_sections': Counter()
    }
    
    # 提取课程信息
    print("处理课程信息...")
    processed_data = []
    for item in raw_data:
        processed = extract_course_info(item)
        processed_data.append(processed)
        
        # 统计学位类型
        stats['degree_types'][processed['degree_type']] += 1
        
        # 统计章节
        for section in processed['sections']:
            stats['section_counts'][section] += 1
        
        # 检查缺失的关键章节
        key_sections = ['overview', 'entry_requirements', 'structure', 'assessment']
        for section in key_sections:
            if section not in processed['sections']:
                stats['missing_sections'][section] += 1
    
    # 转换为DataFrame
    print("生成数据文件...")
    df = pd.DataFrame(processed_data)
    
    # 保存处理后的数据
    df.to_csv('data/processed/ucl_programs.csv', index=False)
    print("已保存CSV文件：data/processed/ucl_programs.csv")
    
    # 保存为结构化JSON
    with open('data/processed/ucl_programs.json', 'w', encoding='utf-8') as f:
        json.dump(processed_data, f, ensure_ascii=False, indent=2)
    print("已保存JSON文件：data/processed/ucl_programs.json")
    
    # 生成报告
    report = f"""UCL课程数据处理报告
生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
总课程数: {stats['total_programs']}

学位类型分布:
{pd.Series(stats['degree_types']).to_string()}

章节覆盖率:
{pd.Series(stats['section_counts']).to_string()}

缺失关键章节:
{pd.Series(stats['missing_sections']).to_string()}
"""
    
    # 保存报告
    with open('data/processed/processing_report.txt', 'w', encoding='utf-8') as f:
        f.write(report)
    print("已生成处理报告：data/processed/processing_report.txt")

if __name__ == '__main__':
    process_data()
    print("数据处理完成！")