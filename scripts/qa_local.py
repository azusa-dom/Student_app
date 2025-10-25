# scripts/qa_local.py
import pickle
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from pathlib import Path
import json
from datetime import datetime

# ===============================================
# 1. 修复：定义文件路径 (请确保 'data' 文件夹存在)
# ===============================================
INDEX_PATH = Path('data/qa_index.pkl')
LOG_PATH = Path('data/qa_log.txt')
# ===============================================

# 关键词映射：中文到英文
KEYWORD_MAPPING = {
    '计算机': 'computer science',
    '电脑': 'computer',
    '简历': 'CV resume',
    '心理咨询': 'counselling mental health',
    '预约': 'appointment booking',
    '商科': 'business economics finance',
    '硕士': 'masters MSc',
    '成绩': 'grades requirements',
    '入学要求': 'entry requirements admission',
    '怎么': 'how to',
    '改': 'improve edit',
    'GPA': 'GPA grades',
    '算': 'calculate'
}

def translate_query(question):
    """简单地将中文关键词替换为英文"""
    translated = question.lower()
    for cn, en in KEYWORD_MAPPING.items():
        translated = translated.replace(cn, en)
    return translated

# 加载索引
def load_index():
    with open(INDEX_PATH, 'rb') as f:
        data = pickle.load(f)
    return data['vectorizer'], data['tfidf_matrix'], data['metadata']

# 日志记录
def log_query(question, answer_text):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    # 确保日志文件路径存在
    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(LOG_PATH, 'a', encoding='utf-8') as f:
        f.write(f"[{timestamp}] Q: {question}\nA: {answer_text}\n---\n")

# 主函数
def answer(question, top_k=5, min_score=0.01):
    results = []
    try:
        vectorizer, tfidf_matrix, metadata = load_index()
        
        # 翻译中文查询为英文
        translated_question = translate_query(question)
        
        query_vec = vectorizer.transform([translated_question])
        similarities = cosine_similarity(query_vec, tfidf_matrix).flatten()
        
        # 取 top_k
        top_indices = np.argsort(similarities)[-top_k:][::-1]
        
        for idx in top_indices:
            score = similarities[idx]
            if score < min_score:
                continue
            doc = metadata[idx]
            results.append({
                'title': doc['title'],
                'type': doc['type'],
                'url': doc['url'],
                'score': round(float(score), 3),
                'source': doc['source']
            })

        # 生成回答
        if not results:
            response = "抱歉，我暂时无法找到相关信息。"
            sources = []
        else:
            response = "我找到了以下信息：\n"
            # 收集所有 URL 作为简易来源列表 (兼容旧的解析器/日志)
            sources = [r['url'] for r in results if r.get('url')]
            
            # 为回答文本添加结果列表
            for r in results:
                type_label = "专业" if r['type'] == 'program' else "服务"
                # 现在在回答中包含得分，以便用户可以手动评估
                response += f"• [{type_label}] {r['title']} (得分: {r['score']:.3f})\n" 

        log_query(question, response.strip())
        return {
            'text': response.strip(),
            'sources': sources,
            'results': results
        }

    except Exception as e:
        error_msg = f"系统错误: {str(e)}"
        log_query(question, error_msg)
        return {
            'text': '抱歉，系统出错，请稍后重试。',
            'sources': [],
            'error': error_msg,
            'results': []
        }

# 命令行交互
if __name__ == '__main__':
    print("UCL AI QA (静态版) 已启动！输入 'exit' 退出。")
    while True:
        try:
            q = input("\n您的问题: ").strip()
        except EOFError:
            # 兼容管道输入
            break
            
        if q.lower() in ['exit', 'quit', 'q']:
            break
        if not q:
            continue
        
        resp = answer(q)
        
        # 打印回答文本 (已包含标题和子弹点)
        print(f"\n{resp['text']}")
        
        # 打印更详细的来源列表 (友好格式)
        if resp.get('results'):
            print("\n详细来源列表:")
            for i, r in enumerate(resp['results'], 1):
                type_label = "专业" if r['type'] == 'program' else "服务"
                # 使用 Markdown 格式方便复制链接
                link_text = f"[{r['title']}]({r['url']})" if r.get('url') else f"[{r['title']}]"
                print(f"  {i}. [{type_label}] {link_text} (得分: {r['score']:.3f})")
        
        # 保留原有的简洁来源列表 (兼容旧解析器)
        if resp.get('sources'):
             print(f"\n来源: {', '.join(resp['sources'])}")