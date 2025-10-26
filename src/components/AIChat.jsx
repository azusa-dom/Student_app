// src/components/student/AIChat.jsx
import React, { useEffect, useState } from "react";

/** 轻量注入页面级样式（紫色渐变+圆角+玻璃态） */
function useInjectStyles() {
  useEffect(() => {
    const css = `
:root{
  --purple:#7c5cdb; 
  --purple-dark:#5a3fb8;
  --lav:#9b7eeb;
  --bg1:#8b6fd8; 
  --bg2:#6b4fc4;
  --card:#fff;
  --text:#2d3748; 
  --muted:#718096; 
  --border:#e2e8f0;
}
.aiq-page{
  min-height: calc(100vh - 120px);
  background: linear-gradient(135deg, var(--bg1), var(--bg2));
  padding: 24px 16px;
}
.aiq-header{
  text-align:center;color:#fff;margin:12px auto 18px;
}
.aiq-header h1{font-weight:800;letter-spacing:.3px;margin-bottom:6px}
.aiq-header p{opacity:.95}
.aiq-card{
  max-width:980px;margin:0 auto;background:var(--card);
  border-radius:18px;padding:22px;box-shadow:0 12px 40px rgba(0,0,0,.12);
}
.aiq-suggest-title{color:var(--muted);font-size:14px;margin-bottom:10px}
.aiq-suggest-pills{display:flex;flex-wrap:wrap;gap:10px}
.aiq-pill{
  border:2px solid var(--purple);color:var(--purple);background:transparent;
  padding:8px 14px;border-radius:999px;font-size:14px;cursor:pointer;transition:.2s
}
.aiq-pill:hover{background:var(--purple);color:#fff}
.aiq-search{display:flex;gap:10px;margin:16px 0 6px}
.aiq-search input{
  flex:1;padding:12px 14px;border:2px solid var(--border);border-radius:12px;font-size:15px;outline:none;
}
.aiq-search input:focus{
  border-color:var(--purple);box-shadow:0 0 0 3px rgba(124,92,219,.15)
}
.aiq-search button{
  background:var(--purple);color:#fff;border:none;padding:12px 20px;border-radius:12px;
  font-weight:700;cursor:pointer;transition:.2s
}
.aiq-search button:hover:not(:disabled){background:var(--purple-dark)}
.aiq-search button:disabled{background:#aaa;cursor:not-allowed}
.aiq-loading,.aiq-error{padding:24px;color:var(--muted);text-align:center}
.aiq-spinner{
  width:40px;height:40px;border:4px solid rgba(124,92,219,.2);border-top-color:var(--purple);
  border-radius:50%;margin:0 auto 10px;animation:spin .9s linear infinite
}
@keyframes spin{to{transform:rotate(360deg)}}
.aiq-result-card{animation:fadeIn .2s ease}
@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
.aiq-intent{
  display:inline-block;padding:6px 14px;border-radius:16px;
  background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;font-weight:700;font-size:13px;margin-bottom:10px
}
.aiq-answer{
  background:#f7fafc;border-left:4px solid var(--purple);padding:14px;border-radius:8px;line-height:1.85;margin-bottom:12px
}
.aiq-answer a{color:var(--purple);text-decoration:none}
.aiq-answer a:hover{text-decoration:underline}
.aiq-stats{display:flex;gap:10px;margin:8px 0 12px}
.aiq-stat{flex:1;background:#f7fafc;border-radius:10px;padding:12px;text-align:center}
.aiq-k{font-size:12px;color:var(--muted)}
.aiq-v{font-size:18px;font-weight:800;color:var(--purple)}
.aiq-sources{border-top:2px solid var(--border);padding-top:12px}
.aiq-sources h4{font-size:14px;color:var(--muted);margin-bottom:10px}
.aiq-sources ul{list-style:none;padding-left:0}
.aiq-sources li{background:#f7fafc;padding:10px;border-radius:8px;margin-bottom:8px}
.aiq-sources li a{color:var(--purple);word-break:break-all;text-decoration:none}
.aiq-sources li a:hover{text-decoration:underline}
@media (max-width:768px){
  .aiq-card{padding:16px}
  .aiq-search{flex-direction:column}
  .aiq-search button{width:100%}
  .aiq-stats{flex-direction:column}
}
    `;
    const s = document.createElement("style");
    s.id = "aiq-inline-style";
    s.innerHTML = css;
    document.head.appendChild(s);
    return () => {
      const exist = document.getElementById("aiq-inline-style");
      if (exist) exist.remove();
    };
  }, []);
}

const INTENT_MAP = {
  admission_requirements: "📚 入学要求",
  careers_resume: "💼 职业发展",
  wellbeing_support: "❤️ 健康支持",
  booking: "📅 预约服务",
  other: "📄 其他信息",
  error: "❌ 系统错误",
};

const SUGGESTIONS = [
  "计算机科学硕士的语言要求",
  "如何预约心理咨询",
  "商科硕士入学要求",
  "简历和求职准备",
];

export default function AIChat() {
  useInjectStyles();

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState(null);
  const [err, setErr] = useState("");

  const ask = async (qForced) => {
    const q = (qForced ?? query).trim();
    if (!q) return;

    setLoading(true);
    setErr("");
    setRes(null);

    try {
      // 直接调你的 FastAPI：GET /api/qa?query=...
      // 开发期建议在 vite.config.js 里加 proxy 把 /api 转 5051
      const r = await fetch(`/api/qa?query=${encodeURIComponent(q)}`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();

      setRes({
        intent: data.intent,
        answer: data.answer,
        citations: data.citations || [],
        num_queries: data.num_queries ?? 0,
        num_docs: data.num_docs ?? (data.citations || []).length,
        response_time: data.response_time ?? "-",
      });
    } catch (e) {
      setErr(e.message || "请求失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="aiq-page">
      <div className="aiq-header">
        <h1>🎓 UCL AI 问答系统</h1>
        <p>智能检索 · 意图识别 · 精准回答</p>
      </div>

      <div className="aiq-card">
        {/* 建议问题 */}
        <div className="aiq-suggest">
          <div className="aiq-suggest-title">💡 试试这些问题：</div>
          <div className="aiq-suggest-pills">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                className="aiq-pill"
                onClick={() => {
                  setQuery(s);
                  setTimeout(() => ask(s), 0);
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* 搜索框 */}
        <div className="aiq-search">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ask()}
            placeholder="请输入你的问题…（回车提交）"
          />
          <button onClick={() => ask()} disabled={loading}>
            {loading ? "思考中…" : "提问"}
          </button>
        </div>

        {/* 结果 */}
        <div>
          {loading && (
            <div className="aiq-loading">
              <div className="aiq-spinner" />
              正在检索和分析，请稍候…
            </div>
          )}

          {err && (
            <div className="aiq-error">❌ 系统错误<br /><small>{err}</small></div>
          )}

          {!loading && !err && res && (
            <div className="aiq-result-card">
              <span className="aiq-intent">
                {INTENT_MAP[res.intent] || res.intent || "📄 结果"}
              </span>

              <div className="aiq-answer">
                {String(res.answer || "")
                  .split("\n")
                  .map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                {res.citations?.[0] && (
                  <p style={{ marginTop: 8 }}>
                    来源：
                    <a
                      href={res.citations[0].url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {res.citations[0].title}
                    </a>
                  </p>
                )}
              </div>

              <div className="aiq-stats">
                <div className="aiq-stat">
                  <div className="aiq-k">检索文档</div>
                  <div className="aiq-v">{res.num_docs}</div>
                </div>
                <div className="aiq-stat">
                  <div className="aiq-k">查询改写</div>
                  <div className="aiq-v">{res.num_queries}</div>
                </div>
                <div className="aiq-stat">
                  <div className="aiq-k">响应时间</div>
                  <div className="aiq-v">{res.response_time}</div>
                </div>
              </div>

              {res.citations?.length > 0 && (
                <div className="aiq-sources">
                  <h4>🔗 参考来源</h4>
                  <ul>
                    {res.citations.map((c, i) => (
                      <li key={`${c.url}-${i}`}>
                        <strong>{i + 1}. {c.title}</strong><br />
                        <a href={c.url} target="_blank" rel="noreferrer">
                          {c.url}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
