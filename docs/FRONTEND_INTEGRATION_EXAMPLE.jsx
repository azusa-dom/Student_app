// 前端集成示例 - AIChat 组件增强版

import React, { useState } from 'react';

/**
 * QA 增强版 API 调用函数
 */
export async function queryEnhancedQA(question, topK = 10) {
  try {
    const response = await fetch('/api/qa/enhanced', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ 
        query: question, 
        top_k: topK 
      })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('QA API Error:', error);
    return {
      intent: 'error',
      answer: '抱歉，系统出错，请稍后重试。',
      citations: [],
      error: error.message
    };
  }
}

/**
 * AIChat 组件 - 使用增强版 QA
 */
export function AIChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input.trim()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // 调用增强版 QA API
      const result = await queryEnhancedQA(userMessage.content);
      
      const botMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: result.answer,
        metadata: {
          intent: result.intent,
          citations: result.citations,
          reranked: result.reranked?.slice(0, 3), // 只显示前3个
          queryExpansions: result.rewritten_queries
        }
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: '抱歉，系统出错，请稍后重试。',
        error: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-chat-container">
      {/* 消息列表 */}
      <div className="messages">
        {messages.map(msg => (
          <Message key={msg.id} message={msg} />
        ))}
        {loading && <LoadingIndicator />}
      </div>

      {/* 输入框 */}
      <form onSubmit={handleSubmit} className="input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入您的问题..."
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          发送
        </button>
      </form>
    </div>
  );
}

/**
 * 消息组件 - 支持显示元数据
 */
function Message({ message }) {
  const { role, content, metadata, error } = message;
  
  return (
    <div className={`message message-${role} ${error ? 'error' : ''}`}>
      <div className="message-content">
        {content}
      </div>
      
      {/* 显示意图和引用（仅 bot 消息）*/}
      {metadata && (
        <div className="message-metadata">
          {/* 意图标签 */}
          {metadata.intent && (
            <div className="intent-badge">
              <span className="badge">
                意图: {getIntentLabel(metadata.intent)}
              </span>
            </div>
          )}
          
          {/* 引用来源 */}
          {metadata.citations && metadata.citations.length > 0 && (
            <div className="citations">
              <h4>📚 参考来源:</h4>
              <ul>
                {metadata.citations.map((cite, i) => (
                  <li key={i}>
                    <a 
                      href={cite.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="citation-link"
                    >
                      [{cite.type === 'program' ? '课程' : '服务'}] {cite.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* 展开查看重排结果 */}
          {metadata.reranked && (
            <details className="reranked-details">
              <summary>查看详细匹配结果</summary>
              <ul>
                {metadata.reranked.map((item, i) => (
                  <li key={i}>
                    <strong>{item.title}</strong>
                    <br />
                    得分: {item.score.toFixed(2)} | {item.why}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * 加载指示器
 */
function LoadingIndicator() {
  return (
    <div className="message message-assistant loading">
      <div className="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
}

/**
 * 意图标签映射
 */
function getIntentLabel(intent) {
  const labels = {
    admission_requirements: '入学要求',
    careers_resume: '简历/求职',
    booking: '预约',
    wellbeing_support: '心理支持',
    other: '其他'
  };
  return labels[intent] || intent;
}

// CSS 样式示例
const styles = `
.ai-chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.message {
  margin-bottom: 16px;
  padding: 12px;
  border-radius: 8px;
}

.message-user {
  background: #e3f2fd;
  margin-left: 20%;
  text-align: right;
}

.message-assistant {
  background: #f5f5f5;
  margin-right: 20%;
}

.message.error {
  background: #ffebee;
  color: #c62828;
}

.message-metadata {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e0e0e0;
  font-size: 0.9em;
}

.intent-badge {
  margin-bottom: 8px;
}

.badge {
  display: inline-block;
  padding: 4px 8px;
  background: #2196f3;
  color: white;
  border-radius: 4px;
  font-size: 0.85em;
}

.citations {
  margin-top: 8px;
}

.citations h4 {
  margin: 0 0 8px 0;
  font-size: 0.9em;
  color: #666;
}

.citations ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.citations li {
  margin-bottom: 4px;
}

.citation-link {
  color: #1976d2;
  text-decoration: none;
}

.citation-link:hover {
  text-decoration: underline;
}

.reranked-details {
  margin-top: 8px;
  font-size: 0.85em;
}

.reranked-details summary {
  cursor: pointer;
  color: #1976d2;
}

.reranked-details ul {
  margin-top: 8px;
  padding-left: 20px;
}

.reranked-details li {
  margin-bottom: 8px;
  color: #666;
}

.input-form {
  display: flex;
  padding: 16px;
  border-top: 1px solid #e0e0e0;
  gap: 8px;
}

.input-form input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

.input-form button {
  padding: 12px 24px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.input-form button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.typing-indicator {
  display: flex;
  gap: 4px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #666;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    opacity: 0.3;
  }
  30% {
    opacity: 1;
  }
}
`;

export default AIChat;
