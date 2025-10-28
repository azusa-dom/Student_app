# scripts/validate_data.py
import json
import re
from collections import Counter

def validate_and_analyze():
    """全面验证和分析数据质量"""
    with open('public/data/ucl_programs.json', 'r', encoding='utf-8') as f:
        programs = json.load(f)
    
    print("📊 UCL Course Data Analysis\n")
    print(f"Total Courses: {len(programs)}\n")
    
    # 1. Level 分布
    levels = Counter(prog.get('level', 'Unknown') for prog in programs)
    print("📚 Level Distribution:")
    for level, count in levels.most_common():
        print(f"   {level}: {count}")
    
    # 2. Sections 分析
    print("\n📑 Sections Analysis:")
    section_headings = Counter()
    total_sections = 0
    
    for prog in programs:
        sections = prog.get('sections', [])
        total_sections += len(sections)
        for sec in sections:
            heading = sec.get('heading', '').strip()
            if heading:
                section_headings[heading] += 1
    
    print(f"   Total sections: {total_sections}")
    print(f"   Average sections per course: {total_sections/len(programs):.1f}")
    print(f"   Unique headings: {len(section_headings)}")
    
    print("\n🏆 Top 15 Section Headings:")
    for heading, count in section_headings.most_common(15):
        print(f"   • {heading}: {count}")
    
    # 3. 检查是否有"modules"相关的sections
    print("\n🔍 Module-related Sections:")
    module_keywords = ['module', 'curriculum', 'syllabus', 'teaching', 'course structure', 'what you will learn']
    
    courses_with_modules = 0
    module_section_examples = []
    
    for prog in programs:
        has_module_section = False
        for sec in prog.get('sections', []):
            heading = sec.get('heading', '').lower()
            if any(kw in heading for kw in module_keywords):
                has_module_section = True
                if len(module_section_examples) < 5:
                    module_section_examples.append({
                        'course': prog.get('title'),
                        'heading': sec.get('heading'),
                        'text_preview': sec.get('text', '')[:200]
                    })
                break
        if has_module_section:
            courses_with_modules += 1
    
    print(f"   Courses with module info: {courses_with_modules} ({courses_with_modules/len(programs)*100:.1f}%)")
    
    print("\n📝 Examples of Module Sections:")
    for ex in module_section_examples:
        print(f"\n   Course: {ex['course']}")
        print(f"   Heading: {ex['heading']}")
        print(f"   Preview: {ex['text_preview']}...")
    
    # 4. 检查 Data Science 课程
    print("\n\n🎓 Data Science Courses Detail:")
    ds_courses = [p for p in programs if 'data science' in p.get('title', '').lower()]
    
    for course in ds_courses[:3]:
        print(f"\n{'='*60}")
        print(f"Title: {course.get('title')}")
        print(f"Level: {course.get('level')}")
        print(f"Sections ({len(course.get('sections', []))}:")
        for sec in course.get('sections', [])[:5]:
            print(f"   • {sec.get('heading')}: {len(sec.get('text', ''))} chars")

if __name__ == '__main__':
    validate_and_analyze()