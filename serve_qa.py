#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
UCL AI 问答系统 - 强制防崩溃版
"""
import sys
import os
import traceback
from pathlib import Path

# ========= 强制显示所有输出 =========
sys.stdout = os.fdopen(sys.stdout.fileno(), 'w', 1)  # line buffering
sys.stderr = os.fdopen(sys.stderr.fileno(), 'w', 1)

# ========= 打印 Python 环境 =========
print("Python 可执行文件:", sys.executable)
print("Python 版本:", sys.version)
print("当前工作目录:", os.getcwd())

# ========= 强制路径 =========
ROOT = Path(__file__).resolve().parent
print(f"项目根目录: {ROOT}")

if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
if str(ROOT / "scripts") not in sys.path:
    sys.path.insert(0, str(ROOT / "scripts"))

print(f"sys.path 前三项: {sys.path[:3]}")

# ========= 导入 Flask =========
try:
    from flask import Flask, request, jsonify
    print("Flask 导入成功")
except Exception as e:
    print(f"Flask 导入失败: {e}")
    traceback.print_exc()
    sys.exit(1)

# ========= 导入 answer_enhanced（关键！）=========
print("正在导入 qa_enhanced_wrapper...")
try:
    from qa_enhanced_wrapper import answer_enhanced
    print("qa_enhanced_wrapper 导入成功")
except Exception as e:
    print(f"qa_enhanced_wrapper 导入失败: {e}")
    print("完整错误堆栈:")
    traceback.print_exc()
    print("\n请检查 scripts/qa_enhanced_wrapper.py 是否有语法错误或缺失依赖")
    sys.exit(1)

# ========= Flask 应用 =========
app = Flask(__name__)

# ========= 简单 HTML =========
DEMO_PAGE = """
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>UCL AI</title><style>
body{font-family:sans-serif;background:#f4f4f9;padding:2rem}
.card{max-width:700px;margin:auto;background:white;padding:2rem;border-radius:1rem;box-shadow:0 4px 12px rgba(0,0,0,.1)}
input,button{padding:1rem;margin:0.5rem 0;width:100%;border-radius:0.5rem}
input{border:1px solid #ddd}
button{background:#6d28d9;color:white;border:none;font-weight:bold;cursor:pointer}
button:disabled{background:#999}
.result{margin-top:1rem;padding:1rem;border-left:4px solid #6d28d9;background:#f9f9f9}
</style></head>
<body>
<div class="card">
<h1>UCL AI 问答</h1>
<input id="q" placeholder="输入问题，如：计算机硕士语言要求"/>
<button id="ask" onclick="ask()">提问</button>
<div id="out"></div>
</div>
<script>
async function ask(){
  const q = document.getElementById('q').value.trim();
  if(!q) return;
  document.getElementById('ask').disabled=true;
  document.getElementById('out').innerHTML='<p>思考中...</p>';
  try{
    const r = await fetch('/api/qa?query='+encodeURIComponent(q));
    const d = await r.json();
    document.getElementById('out').innerHTML = `
      <div class="result">
        <strong>答案：</strong>${d.answer||'无答案'}<br><br>
        <small>来源：${(d.sources||[]).map(s=>`<a href="${s.url}" target="_blank">${s.title}</a>`).join(' | ') || '无'}</small>
      </div>`;
  }catch(e){
    document.getElementById('out').innerHTML = '<p style="color:red">错误：'+e.message+'</p>';
  }finally{
    document.getElementById('ask').disabled=false;
  }
}
</script>
</body></html>
"""

@app.route("/")
def index():
    return DEMO_PAGE

@app.route("/api/qa")
def api_qa():
    query = request.args.get("query", "").strip()
    if not query:
        return jsonify({"error": "no query"}), 400
    try:
        result = answer_enhanced(query)
        return jsonify({
            "answer": result.get("answer", "无答案"),
            "sources": result.get("citations", []),
            "intent": result.get("intent", "unknown")
        })
    except Exception as e:
        return jsonify({"error": str(e), "answer": "内部错误"}), 500

# ========= 启动 =========
if __name__ == "__main__":
    print("\n" + "="*60)
    print("UCL AI 问答服务启动中...")
    print("="*60)
    try:
        app.run(host="0.0.0.0", port=5055, debug=True, use_reloader=False)
    except Exception as e:
        print(f"Flask 启动失败: {e}")
        traceback.print_exc()