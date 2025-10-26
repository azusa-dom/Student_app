#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
UCL AI 问答系统 - 真实 LLM 版本
"""
import time
from flask import Flask, request, jsonify
from scripts.qa_enhanced_wrapper import answer_enhanced

app = Flask(__name__)

# 演示HTML页面
DEMO_PAGE = '''<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>🎓 UCL AI 问答系统</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    :root{
      --purple:#7c5cdb; --purple-dark:#5a3fb8; --purple-light:#9b7eeb;
      --bg1:#8b6fd8; --bg2:#6b4fc4; --card:#fff;
      --text:#2d3748; --muted:#718096; --border:#e2e8f0;
    }
    body{
      font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei","Helvetica Neue",Arial,sans-serif;
      background:linear-gradient(135deg,var(--bg1),var(--bg2));
      min-height:100vh; color:var(--text);
    }
    .container{max-width:920px;margin:0 auto;padding:36px 18px}
    header{text-align:center;margin-bottom:22px}
    header h1{color:#fff;font-size:32px;font-weight:800;margin-bottom:8px}
    header p{color:#fff;opacity:.9}
    .card{background:var(--card); border-radius:18px; padding:26px; box-shadow:0 10px 40px rgba(0,0,0,.1)}
    .pills{display:flex;flex-wrap:wrap;gap:10px;margin-top:12px;margin-bottom:16px}
    .pill{
      border:2px solid var(--purple); color:var(--purple); background:transparent;
      padding:9px 14px; border-radius:999px; font-size:14px; cursor:pointer; transition:.2s
    }
    .pill:hover{background:var(--purple); color:#fff}
    .search{display:flex;gap:10px;margin-bottom:14px}
    #q{flex:1;padding:13px 14px;border:2px solid var(--border);border-radius:12px;font-size:15px}
    #q:focus{outline:none;border-color:var(--purple);box-shadow:0 0 0 3px rgba(124,92,219,.15)}
    #ask{
      background:var(--purple); color:#fff; border:none; padding:13px 22px; border-radius:12px;
      font-size:15px; font-weight:700; cursor:pointer; transition:.2s
    }
    #ask:hover:not(:disabled){background:var(--purple-dark)}
    #ask:disabled{background:#aaa;cursor:not-allowed}
    .loading,.error{padding:26px; color:var(--muted); text-align:center}
    .spinner{width:40px;height:40px;border:4px solid rgba(124,92,219,.2);border-top-color:var(--purple);border-radius:50%;margin:0 auto 10px;animation:spin .9s linear infinite}
    @keyframes spin{to{transform:rotate(360deg)}}
    .intent{display:inline-block;padding:6px 14px;border-radius:18px;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;font-weight:700;font-size:13px;margin-bottom:10px}
    .answer{background:#f7fafc;border-left:4px solid var(--purple);padding:14px;border-radius:8px;white-space:pre-wrap;line-height:1.8;margin-bottom:14px}
    .answer a{color:var(--purple);text-decoration:none}
    .answer a:hover{text-decoration:underline}
    .stats{display:flex;gap:12px;margin:10px 0 16px}
    .stat{flex:1;background:#f7fafc;border-radius:10px;padding:12px;text-align:center}
    .stat .k{font-size:12px;color:var(--muted)} .stat .v{font-size:18px;font-weight:800;color:var(--purple)}
    .src{border-top:2px solid var(--border);padding-top:12px}
    .src h4{font-size:14px;color:var(--muted);margin-bottom:8px}
    .src ul{list-style:none} .src li{background:#f7fafc;padding:10px;border-radius:8px;margin-bottom:8px}
    .src a{color:var(--purple);text-decoration:none;word-break:break-all}
    .src a:hover{text-decoration:underline}
    @media (max-width:768px){.container{padding:22px 12px}.card{padding:18px;border-radius:14px}.search{flex-direction:column}#ask{width:100%}.stats{flex-direction:column}}
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🎓 UCL AI 问答系统</h1>
      <p>智能检索 · 意图识别 · 精准回答</p>
    </header>

    <div class="card">
      <div style="color:var(--muted);font-size:14px">💡 试试这些问题：</div>
      <div class="pills">
        <button class="pill" onclick="setQ('计算机科学硕士的语言要求')">计算机科学硕士的语言要求</button>
        <button class="pill" onclick="setQ('如何预约心理咨询')">如何预约心理咨询</button>
        <button class="pill" onclick="setQ('商科硕士入学要求')">商科硕士入学要求</button>
        <button class="pill" onclick="setQ('简历和求职准备')">简历和求职准备</button>
      </div>

      <div class="search">
        <input id="q" type="text" placeholder="请输入你的问题，例如：计算机科学硕士的语言要求" />
        <button id="ask" onclick="ask()">提问</button>
      </div>

      <div id="stage"></div>
    </div>
  </div>

  <script>
    const q = document.getElementById('q');
    const askBtn = document.getElementById('ask');
    const stage = document.getElementById('stage');
    q.addEventListener('keyup', e => { if (e.key === 'Enter') ask(); });

    function setQ(text){ q.value = text; q.focus(); }

    function loadingView(){
      stage.innerHTML = `
        <div class="loading">
          <div class="spinner"></div>
          正在检索和总结，请稍候…
        </div>`;
    }

    function errorView(msg){
      stage.innerHTML = `<div class="error">❌ 系统错误：${escapeHtml(msg || '连接失败')}</div>`;
    }

    function escapeHtml(s){return (s||'').replace(/[&<>"']/g,c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]))}

    async function ask(){
      const text = (q.value||'').trim();
      if(!text){ q.focus(); return; }

      askBtn.disabled = true; askBtn.textContent = '思考中…';
      loadingView();

      try{
        const res = await fetch(`/api/qa?query=${encodeURIComponent(text)}`);
        if(!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        render(data);
      }catch(e){
        errorView(e.message);
      }finally{
        askBtn.disabled = false; askBtn.textContent = '提问';
      }
    }

    function render(data){
      const intent = data.intent || '其他';
      let answer = data.answer || '当前语料无该信息。';

      const docs = data.num_docs || 0;
      const rewrites = data.num_queries || '-';
      const rt = data.response_time || '-';

      stage.innerHTML = `
        <div class="intent">${escapeHtml(intent)}</div>
        <div class="answer">${escapeHtml(answer).replace(/\\n/g,'<br/>')}</div>

        <div class="stats">
          <div class="stat"><div class="k">检索文档</div><div class="v">${docs}</div></div>
          <div class="stat"><div class="k">查询改写</div><div class="v">${rewrites}</div></div>
          <div class="stat"><div class="k">响应时间</div><div class="v">${escapeHtml(rt)}</div></div>
        </div>

        ${renderSources(data.sources)}
      `;
    }

    function renderSources(sources){
      if (!Array.isArray(sources) || sources.length===0) return '';
      const lis = sources.map((s,i)=>`<li>${i+1}. <a href="${s.url}" target="_blank">${escapeHtml(s.title || s.url)}</a></li>`).join('');
      return `
        <div class="src">
          <h4>📎 参考来源</h4>
          <ul>${lis}</ul>
        </div>
      `;
    }
  </script>
</body>
</html>
'''


@app.route('/')
def index():
    return DEMO_PAGE


@app.route('/api/qa', methods=['GET'])
def api_qa():
    query = request.args.get('query', '').strip()
    if not query:
        return jsonify({'error': '缺少query参数'}), 400
    
    print(f"[收到查询] {query}")
    start_time = time.time()
    
    try:
        # 调用真实的 RAG 系统
        result = answer_enhanced(query, top_k=5)
        
        response_time = f"{time.time() - start_time:.2f}s"
        
        return jsonify({
            'intent': result['intent'],
            'answer': result['answer'],
            'sources': result['citations'],  # citations -> sources
            'num_queries': len(result.get('rewritten_queries', [])),
            'num_docs': len(result.get('reranked', [])),
            'response_time': response_time
        })
    except Exception as e:
        print(f"❌ 错误: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'intent': 'error',
            'answer': f'系统错误: {str(e)}',
            'sources': [],
            'num_queries': 0,
            'num_docs': 0,
            'response_time': f"{time.time() - start_time:.2f}s"
        }), 500


@app.route('/health')
def health():
    return jsonify({'status': 'ok'}), 200


if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚀 启动 UCL AI 问答演示服务 (真实 LLM)")
    print("="*60)
    print(f"📍 本地地址: http://127.0.0.1:5051")
    print(f"🎯 演示页面: http://127.0.0.1:5051/")
    print(f"🔌 API端点: http://127.0.0.1:5051/api/qa")
    print(f"🤖 使用 Ollama + tinyllama 模型")
    print("="*60 + "\n")
    
    app.run(host='0.0.0.0', port=5051, debug=False)
