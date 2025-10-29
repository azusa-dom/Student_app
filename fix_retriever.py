#!/usr/bin/env python3
"""修复 enhanced_retriever.py 中的 None 值处理"""

with open('scripts/enhanced_retriever.py', 'r', encoding='utf-8') as f:
    content = f.read()

# 找到 _score_sections 方法中的问题行
old_code = '''        for section in sections:
            heading = section.get("heading", "")
            text = section.get("text", "")
            if not heading and not text:
                continue

            heading_lower = heading.lower()
            text_lower = text.lower()'''

new_code = '''        for section in sections:
            heading = section.get("heading") or ""
            text = section.get("text") or ""
            if not heading and not text:
                continue

            heading_lower = heading.lower()
            text_lower = text.lower()'''

if old_code in content:
    content = content.replace(old_code, new_code)
    print("✅ 已修复 _score_sections 方法")
else:
    print("⚠️  未找到目标代码，尝试逐行替换...")
    
    # 逐行替换
    content = content.replace(
        'heading = section.get("heading", "")',
        'heading = section.get("heading") or ""'
    )
    content = content.replace(
        'text = section.get("text", "")',
        'text = section.get("text") or ""'
    )
    print("✅ 已应用逐行替换")

with open('scripts/enhanced_retriever.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("\n✅ 修复完成！现在重新测试...")
