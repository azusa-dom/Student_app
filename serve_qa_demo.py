#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
UCL AI 问答系统 - 终极完美版
完全基于你爬取的真实数据
"""
import os
import json
import time
import logging
from pathlib import Path
from flask import Flask, request, jsonify

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)

# Groq API Key - 从环境变量读取
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

# ==================== 加载数据 ====================
def load_all_data():
    """加载课程和服务数据"""
    # 尝试多个可能的路径
    possible_paths = [
        ("/workspaces/Student_app/public/data/ucl_programs.json", 
         "/workspaces/Student_app/public/data/ucl_services.json"),
        ("./public/data/ucl_programs.json", "./public/data/ucl_services.json"),
        ("./data/ucl_programs.json", "./data/ucl_services.json"),
        ("../public/data/ucl_programs.json", "../public/data/ucl_services.json"),
    ]
    
    programs = []
    services = []
    
    for prog_path, serv_path in possible_paths:
        # 加载课程
        if Path(prog_path).exists():
            try:
                with open(prog_path, 'r', encoding='utf-8') as f:
                    programs = json.load(f)
                logger.info(f"✅ 课程数据: {len(programs)} 个")
            except Exception as e:
                logger.error(f"❌ 加载课程失败: {e}")
        
        # 加载服务
        if Path(serv_path).exists():
            try:
                with open(serv_path, 'r', encoding='utf-8') as f:
                    services = json.load(f)
                logger.info(f"✅ 服务数据: {len(services)} 个")
            except Exception as e:
                logger.error(f"❌ 加载服务失败: {e}")
        
        if programs or services:
            break
    
    return programs, services

PROGRAMS, SERVICES = load_all_data()

# ==================== Groq API ====================
def chat_with_groq(messages, temperature=0.2):
    """调用 Groq API"""
    import requests
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"}
    payload = {"model": "llama-3.1-8b-instant", "messages": messages, "temperature": temperature, "max_tokens": 400}
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        if response.status_code == 200:
            return response.json()["choices"][0]["message"]["content"].strip()
        logger.error(f"API 错误 {response.status_code}")
        return None
    except Exception as e:
        logger.error(f"调用失败: {e}")
        return None

# ==================== 智能搜索 ====================
def search_programs_and_services(query):
    """搜索课程和服务"""
    query_lower = query.lower()
    results = []
    
    # 关键词映射
    program_keywords = {
        'computer': ['computer', 'computing', 'software', 'cs', '计算机', '软件'],
        'data': ['data science', 'data analytics', 'analytics', '数据科学', '数据分析'],
        'business': ['business', 'management', 'mba', 'finance', '商科', '管理', '金融'],
        'economics': ['economics', 'econometrics', '经济'],
        'engineering': ['engineering', 'mechanical', 'civil', '工程'],
        'psychology': ['psychology', 'cognitive', '心理'],
        'medicine': ['medicine', 'medical', 'health', '医学', '健康'],
        'law': ['law', 'legal', '法律'],
    }
    
    service_keywords = {
        'career': ['career', 'job', 'employment', 'cv', 'resume', '职业', '简历', '求职'],
        'counseling': ['counseling', 'mental', 'wellbeing', 'support', '咨询', '心理', '健康'],
        'library': ['library', 'book', '图书馆'],
        'accommodation': ['accommodation', 'housing', '住宿'],
    }
    
    # 搜索课程 (PROGRAMS)
    for prog in PROGRAMS:
        score = 0
        title = prog.get('title', '').lower()
        url = prog.get('url', '')
        
        # 从 sections 提取所有文本
        all_text = title
        sections_data = []
        
        if 'sections' in prog:
            for section in prog['sections']:
                heading = section.get('heading', '')
                text = section.get('text', '')
                all_text += f" {heading} {text}".lower()
                sections_data.append({'heading': heading, 'text': text})
        
        # 关键词匹配
        for category, keywords in program_keywords.items():
            if any(kw in query_lower for kw in keywords):
                for kw in keywords:
                    score += all_text.count(kw) * 3
        
        # 直接词匹配
        for word in query_lower.split():
            if len(word) > 2:
                score += all_text.count(word) * 2
        
        if score > 0:
            results.append({
                'score': score,
                'type': 'program',
                'title': prog.get('title', '未知课程'),
                'url': url,
                'sections': sections_data[:5]  # 只取前5个section
            })
    
    # 搜索服务 (SERVICES)
    for serv in SERVICES:
        score = 0
        service_name = serv.get('service_name', '').lower()
        description = serv.get('description', '').lower()
        category = serv.get('category', '').lower()
        url = serv.get('url', '')
        
        all_text = f"{service_name} {description} {category}"
        
        # 关键词匹配
        for cat, keywords in service_keywords.items():
            if any(kw in query_lower for kw in keywords):
                for kw in keywords:
                    score += all_text.count(kw) * 3
        
        # 直接词匹配
        for word in query_lower.split():
            if len(word) > 2:
                score += all_text.count(word) * 2
        
        if score > 0:
            results.append({
                'score': score,
                'type': 'service',
                'title': serv.get('service_name', '未知服务'),
                'url': url,
                'description': description[:600],
                'category': serv.get('category', ''),
                'contact': serv.get('contact', ''),
                'how_to_access': serv.get('how_to_access', '')
            })
    
    # 按分数排序
    results.sort(key=lambda x: x['score'], reverse=True)
    return results[:5]

# ==================== 构建上下文 ====================
def build_context(results):
    """从搜索结果构建上下文"""
    context_parts = []
    
    for result in results[:3]:
        title = result['title']
        
        if result['type'] == 'program':
            # 课程类型
            for section in result.get('sections', [])[:3]:
                heading = section.get('heading', '')
                text = section.get('text', '')[:600]
                if text:
                    context_parts.append(f"【课程：{title} - {heading}】\n{text}")
        
        else:
            # 服务类型
            desc = result.get('description', '')[:600]
            contact = result.get('contact', '')
            access = result.get('how_to_access', '')
            
            info = f"【服务：{title}】\n{desc}"
            if contact:
                info += f"\n联系方式: {contact}"
            if access:
                info += f"\n访问方式: {access}"
            
            context_parts.append(info)
    
    return "\n\n".join(context_parts)

# ==================== Flask 应用 ====================
app = Flask(__name__)

@app.route('/')
def index():
    return '''<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8"/>
<title>🎓 UCL AI Assistant</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,sans-serif;background:linear-gradient(135deg,#667eea,#764ba2);min-height:100vh;color:#2d3748}
.container{max-width:980px;margin:0 auto;padding:48px 24px}
header{text-align:center;margin-bottom:40px}
h1{color:#fff;font-size:48px;font-weight:700;margin-bottom:12px;text-shadow:0 2px 20px rgba(0,0,0,0.2)}
.subtitle{color:rgba(255,255,255,0.95);font-size:18px}
.card{background:rgba(255,255,255,0.9);backdrop-filter:blur(20px);border-radius:24px;padding:36px;box-shadow:0 8px 32px rgba(0,0,0,0.1)}
.pills{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:32px}
.pill{background:linear-gradient(135deg,#8B7BE8,#6B5BC7);color:#fff;border:none;padding:12px 24px;border-radius:24px;font-size:14px;font-weight:500;cursor:pointer;transition:all 0.3s}
.pill:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(139,123,232,0.4)}
.search-box{position:relative;margin-bottom:32px}
#q{width:100%;padding:18px 140px 18px 24px;border:2px solid rgba(139,123,232,0.2);border-radius:16px;font-size:16px;transition:all 0.3s}
#q:focus{outline:none;border-color:#8B7BE8;box-shadow:0 0 0 4px rgba(139,123,232,0.1)}
#ask{position:absolute;right:8px;top:50%;transform:translateY(-50%);background:linear-gradient(135deg,#8B7BE8,#6B5BC7);color:#fff;border:none;padding:12px 28px;border-radius:12px;font-size:15px;font-weight:600;cursor:pointer;transition:all 0.3s}
#ask:hover:not(:disabled){transform:translateY(-50%) scale(1.05)}
#ask:disabled{background:#ccc;cursor:not-allowed}
.loading{text-align:center;padding:48px}
.spinner{width:48px;height:48px;border:4px solid rgba(139,123,232,0.2);border-top-color:#8B7BE8;border-radius:50%;margin:0 auto 20px;animation:spin 0.8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.answer-box{background:linear-gradient(135deg,rgba(247,250,252,0.95),rgba(237,242,247,0.95));border-left:4px solid #8B7BE8;border-radius:12px;padding:24px;line-height:1.8;margin-bottom:28px;white-space:pre-wrap;box-shadow:0 2px 12px rgba(0,0,0,0.05)}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:28px}
.stat{background:rgba(255,255,255,0.9);border-radius:16px;padding:20px;text-align:center;transition:transform 0.2s}
.stat:hover{transform:translateY(-2px)}
.stat-label{font-size:13px;color:#718096;margin-bottom:8px;font-weight:500}
.stat-value{font-size:28px;font-weight:700;color:#8B7BE8}
.sources{border-top:2px solid rgba(139,123,232,0.2);padding-top:24px;margin-top:24px}
.sources h4{font-size:15px;color:#718096;margin-bottom:16px;font-weight:600}
.source-item{background:rgba(255,255,255,0.8);padding:16px 20px;border-radius:12px;margin-bottom:12px;border-left:3px solid #8B7BE8;transition:all 0.3s}
.source-item:hover{background:rgba(255,255,255,1);transform:translateX(4px);box-shadow:0 4px 12px rgba(0,0,0,0.1)}
.source-item a{color:#8B7BE8;text-decoration:none;font-weight:500;display:block}
.source-item a:hover{text-decoration:underline}
.badge{display:inline-block;background:linear-gradient(135deg,#48bb78,#38a169);color:#fff;padding:4px 12px;border-radius:12px;font-size:11px;font-weight:600;margin-left:8px}
</style>
</head>
<body>
<div class="container">
<header>
<h1>🎓 UCL AI Assistant</h1>
<p class="subtitle">基于真实爬取数据 · 智能检索 · 精准回答</p>
</header>
<div class="card">
<div class="pills">
<button class="pill" onclick="ask('Computer Science MSc language requirements')">💻 Computer Science</button>
<button class="pill" onclick="ask('Data Science course modules')">📊 Data Science</button>
<button class="pill" onclick="ask('How to book career counseling')">🧠 Career Services</button>
<button class="pill" onclick="ask('Business Management entry requirements')">📈 Business</button>
</div>
<div class="search-box">
<input id="q" placeholder="Ask about UCL programs or services..." onkeypress="if(event.key==='Enter')submit()"/>
<button id="ask" onclick="submit()">Ask</button>
</div>
<div id="stage"></div>
</div>
</div>
<script>
const q=document.getElementById('q');
const btn=document.getElementById('ask');
const stage=document.getElementById('stage');
function ask(text){q.value=text;setTimeout(submit,100)}
function esc(s){const d=document.createElement('div');d.textContent=s;return d.innerHTML}
async function submit(){
const text=(q.value||'').trim();
if(!text){q.focus();return}
btn.disabled=true;btn.textContent='Thinking...';
stage.innerHTML='<div class="loading"><div class="spinner"></div><p>Searching data...</p></div>';
try{
const res=await fetch('/api/qa?query='+encodeURIComponent(text));
const data=await res.json();
const answer=esc(data.answer||'No answer').replace(/\\n/g,'<br/>');
let src='';
if(data.sources && data.sources.length>0){
src='<div class="sources"><h4>🔗 Reference Sources</h4>';
data.sources.forEach((s,i)=>{
const badge=s.type==='program'?'<span class="badge">Course</span>':'<span class="badge" style="background:linear-gradient(135deg,#ed8936,#dd6b20)">Service</span>';
src+='<div class="source-item"><a href="'+esc(s.url)+'" target="_blank">'+(i+1)+'. '+esc(s.title)+badge+'</a></div>';
});
src+='</div>';
}
stage.innerHTML='<div class="answer-box">'+answer+'</div>'+
'<div class="stats">'+
'<div class="stat"><div class="stat-label">Sources</div><div class="stat-value">'+data.num_sources+'</div></div>'+
'<div class="stat"><div class="stat-label">Response Time</div><div class="stat-value">'+esc(data.response_time)+'</div></div>'+
'<div class="stat"><div class="stat-label">AI Model</div><div class="stat-value">Groq</div></div>'+
'</div>'+src;
}catch(e){
stage.innerHTML='<div style="color:#e53e3e;padding:24px;text-align:center">❌ '+esc(e.message)+'</div>';
}finally{
btn.disabled=false;btn.textContent='Ask';
}
}
console.log('[UCL AI] Ready with real data ✨');
</script>
</body>
</html>'''

@app.route('/api/qa', methods=['GET'])
def api_qa():
    query = request.args.get('query', '').strip()
    if not query:
        return jsonify({'error': 'Missing query'}), 400
    
    logger.info(f"\n{'='*60}")
    logger.info(f"[Query] {query}")
    
    start_time = time.time()
    
    try:
        # 搜索数据
        results = search_programs_and_services(query)
        logger.info(f"Found {len(results)} results")
        
        if not results:
            return jsonify({
                'answer': 'Sorry, no relevant information found. Please try different keywords or visit UCL website.',
                'sources': [],
                'num_sources': 0,
                'response_time': f"{time.time() - start_time:.2f}s"
            })
        
        # 构建上下文
        context = build_context(results)
        logger.info(f"Context length: {len(context)} chars")
        
        # 调用 Groq
        system_prompt = """You are a UCL assistant. Answer based on the provided data.

Requirements:
1. Only use provided data
2. Answer concisely (under 100 words)
3. Use bullet points (•) for key information
4. Be direct, don't say "according to data"
5. If asking about language requirements, mention specific scores
6. If asking about modules/courses, list them"""

        user_prompt = f"""Data:
{context}

Question: {query}

Answer:"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        
        logger.info("📤 Calling Groq API...")
        answer = chat_with_groq(messages, 0.2)
        
        if not answer:
            answer = f"Found {len(results)} relevant sources, but AI generation failed. Please check the references below."
        
        # 构建来源列表
        sources = [
            {"title": r['title'], "url": r['url'], "type": r['type']}
            for r in results
        ]
        
        response_time = f"{time.time() - start_time:.2f}s"
        
        logger.info(f"✅ Completed in {response_time}")
        logger.info(f"{'='*60}\n")
        
        return jsonify({
            'answer': answer,
            'sources': sources,
            'num_sources': len(results),
            'response_time': response_time
        })
        
    except Exception as e:
        logger.error(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'answer': f'System error: {str(e)}',
            'sources': [],
            'num_sources': 0,
            'response_time': f"{time.time() - start_time:.2f}s"
        }), 500

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚀 UCL AI Assistant - Ultimate Edition")
    print("="*60)
    print(f"✅ Groq API: llama-3.1-8b-instant")
    print(f"✅ Programs loaded: {len(PROGRAMS)}")
    print(f"✅ Services loaded: {len(SERVICES)}")
    print(f"✅ Total data: {len(PROGRAMS) + len(SERVICES)}")
    print(f"\n📍 Server: http://127.0.0.1:5051")
    print("="*60 + "\n")
    
    if not PROGRAMS and not SERVICES:
        print("⚠️  WARNING: No data loaded!")
        print("Please ensure JSON files are in the correct location:")
        print("  - /workspaces/Student_app/public/data/ucl_programs.json")
        print("  - /workspaces/Student_app/public/data/ucl_services.json\n")
    
    app.run(host='0.0.0.0', port=5051, debug=False)