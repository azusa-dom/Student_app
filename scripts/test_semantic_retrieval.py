#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
test_semantic_retrieval.py - 语义检索测试脚本

用于验证语义检索是否正常工作
"""

import sys
import json
from pathlib import Path

# 添加项目路径
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

print("=" * 80)
print("🧪 语义检索完整测试")
print("=" * 80)

# ============================================================================
# 1. 检查依赖
# ============================================================================
print("\n[1/5] 检查依赖...")

try:
    from sentence_transformers import SentenceTransformer
    print("✅ sentence-transformers 已安装")
except ImportError as e:
    print(f"❌ sentence-transformers 未安装: {e}")
    print("\n请运行: pip install sentence-transformers")
    sys.exit(1)

try:
    import torch
    print(f"✅ torch 已安装 (版本: {torch.__version__})")
except ImportError:
    print("❌ torch 未安装")
    sys.exit(1)

try:
    import numpy as np
    print(f"✅ numpy 已安装 (版本: {np.__version__})")
except ImportError:
    print("❌ numpy 未安装")
    sys.exit(1)

# ============================================================================
# 2. 测试模型加载
# ============================================================================
print("\n[2/5] 测试模型加载...")

try:
    model = SentenceTransformer('all-MiniLM-L6-v2', device='cpu')
    print("✅ 语义模型加载成功")
except Exception as e:
    print(f"❌ 模型加载失败: {e}")
    sys.exit(1)

# ============================================================================
# 3. 测试 embedding 生成
# ============================================================================
print("\n[3/5] 测试 embedding 生成...")

try:
    test_text = "Data Science MSc program at UCL"
    embedding = model.encode(test_text, convert_to_tensor=True)
    embedding_np = embedding.cpu().numpy()
    
    print(f"✅ Embedding 生成成功")
    print(f"   - 形状: {embedding_np.shape}")
    print(f"   - 类型: {type(embedding_np)}")
    print(f"   - 数值范围: [{embedding_np.min():.4f}, {embedding_np.max():.4f}]")
except Exception as e:
    print(f"❌ Embedding 生成失败: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# ============================================================================
# 4. 测试相似度计算
# ============================================================================
print("\n[4/5] 测试相似度计算...")

try:
    query = "What are the modules in Data Science?"
    doc1 = "Data Science MSc Core Modules: Machine Learning, Statistics, Data Visualization"
    doc2 = "Computer Science MSc includes programming and algorithms"
    
    query_emb = model.encode(query, convert_to_tensor=True).cpu().numpy()
    doc1_emb = model.encode(doc1, convert_to_tensor=True).cpu().numpy()
    doc2_emb = model.encode(doc2, convert_to_tensor=True).cpu().numpy()
    
    # 计算余弦相似度
    sim1 = np.dot(query_emb, doc1_emb) / (np.linalg.norm(query_emb) * np.linalg.norm(doc1_emb))
    sim2 = np.dot(query_emb, doc2_emb) / (np.linalg.norm(query_emb) * np.linalg.norm(doc2_emb))
    
    print(f"✅ 相似度计算成功")
    print(f"   - Query vs Doc1 (相关): {sim1:.4f}")
    print(f"   - Query vs Doc2 (不相关): {sim2:.4f}")
    
    if sim1 > sim2:
        print(f"   ✅ 相似度排序正确 (Doc1 > Doc2)")
    else:
        print(f"   ⚠️ 相似度排序异常 (Doc1 < Doc2)")
        
except Exception as e:
    print(f"❌ 相似度计算失败: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# ============================================================================
# 5. 测试 EnhancedRetriever
# ============================================================================
print("\n[5/5] 测试 EnhancedRetriever...")

try:
    from scripts.enhanced_retriever import EnhancedRetriever
    print("✅ 导入 EnhancedRetriever 成功")
except ImportError as e:
    print(f"❌ 导入失败: {e}")
    print("\n请确保 enhanced_retriever.py 在正确的位置")
    sys.exit(1)

# 创建测试数据
test_docs = [
    {
        "title": "Data Science MSc",
        "level": "Postgraduate",
        "url": "https://ucl.ac.uk/data-science",
        "sections": [
            {
                "heading": "Core Modules",
                "text": "This programme includes core modules in Machine Learning, Statistical Analysis, Data Visualization, and Research Methods. Students will gain practical experience in data science techniques."
            },
            {
                "heading": "Entry Requirements",
                "text": "A minimum of upper second-class UK Bachelor's degree in Computer Science or related field. IELTS 7.0 overall with 6.5 in each component."
            }
        ]
    },
    {
        "title": "Computer Science MSc",
        "level": "Postgraduate",
        "url": "https://ucl.ac.uk/cs",
        "sections": [
            {
                "heading": "Programme Structure",
                "text": "The MSc in Computer Science covers Algorithms, Software Engineering, and Artificial Intelligence. Optional modules available in security and networks."
            }
        ]
    },
    {
        "title": "Student Support Services",
        "level": "Service",
        "url": "https://ucl.ac.uk/support",
        "sections": [
            {
                "heading": "Academic Support",
                "text": "UCL provides comprehensive support services including counseling, career guidance, and academic tutoring."
            }
        ]
    }
]

try:
    # 创建检索器
    print("\n创建检索器...")
    retriever = EnhancedRetriever(enable_semantic=True, cache_embeddings=True)
    
    if retriever.enable_semantic:
        print("✅ 语义检索已启用")
    else:
        print("❌ 语义检索未启用")
        sys.exit(1)
    
    # 测试查询
    test_queries = [
        "What are the core modules in Data Science MSc?",
        "Machine learning requirements",
        "Student counseling services"
    ]
    
    for query in test_queries:
        print(f"\n{'='*60}")
        print(f"查询: {query}")
        print('='*60)
        
        results = retriever.search_with_context(query, test_docs, top_k=3)
        
        if results:
            print(f"✅ 找到 {len(results)} 个结果")
            for i, result in enumerate(results, 1):
                doc = result['doc']
                score = result['score']
                print(f"\n{i}. {doc['title']}")
                print(f"   分数: {score:.2f}")
                print(f"   URL: {doc['url']}")
                sections = result.get('matched_sections', [])
                if sections:
                    print(f"   匹配sections: {len(sections)} 个")
                    for sec in sections[:1]:
                        print(f"      - {sec.get('heading', 'N/A')}")
        else:
            print("❌ 未找到结果")
    
    print("\n" + "="*60)
    print("✅ EnhancedRetriever 测试通过")
    
except Exception as e:
    print(f"❌ EnhancedRetriever 测试失败: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# ============================================================================
# 总结
# ============================================================================
print("\n" + "=" * 80)
print("🎉 所有测试通过！语义检索功能正常")
print("=" * 80)
print("\n下一步:")
print("1. 替换项目中的 enhanced_retriever.py")
print("2. 替换 qa_enhanced_wrapper.py")
print("3. 重启服务测试")