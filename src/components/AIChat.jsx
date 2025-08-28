import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

// 简单的 AI 聊天组件：支持本地 mock 模式或通过 OpenAI key 调用
export default function AIChat() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState([
    { id: 1, from: 'ai', text: t ? t('ai.welcome') : 'Hello, I am your assistant.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');

  const sendMockReply = (text) => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ text: `AI（模拟）: 我收到了“${text}”，这是一个演示回应。` });
      }, 700);
    });
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now(), from: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      let reply;
      if (apiKey.trim()) {
        // 简单调用 OpenAI ChatCompletions（如果在未来启用），当前仅做防御并回退
        // 为了安全不在仓库中保存 key；用户可在浏览器输入临时 key
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: 'You are a helpful assistant for students.' },
              { role: 'user', content: input }
            ],
            temperature: 0.6
          })
        });
        if (!response.ok) throw new Error('OpenAI API failed');
        const data = await response.json();
        reply = { text: data?.choices?.[0]?.message?.content || '没有回复' };
      } else {
        // 模拟回复
        reply = await sendMockReply(input);
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, from: 'ai', text: reply.text }]);
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now() + 2, from: 'ai', text: 'AI 服务不可用：' + err.message }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">{t('ai.title') || 'AI 助手'}</h1>

      <div className="mb-3">
        <label className="block text-sm text-gray-600 mb-1">{t('ai.apiKey') || 'OpenAI API Key (可选)'}</label>
        <input value={apiKey} onChange={e => setApiKey(e.target.value)} className="w-full rounded-md border px-3 py-2" placeholder="sk-..." />
        <p className="text-xs text-gray-500 mt-1">{t('ai.apiKeyHint') || '输入临时 key 可直接调用 OpenAI（自行承担费用），留空则使用本地模拟模式。'}</p>
      </div>

      <div className="border rounded-lg p-3 h-80 overflow-auto bg-white/70">
        {messages.map(m => (
          <div key={m.id} className={`mb-3 ${m.from === 'ai' ? 'text-left' : 'text-right'}`}>
            <div className={`inline-block p-3 rounded-xl ${m.from === 'ai' ? 'bg-gray-100 text-gray-900' : 'bg-blue-600 text-white'}`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex space-x-2">
        <input value={input} onChange={e => setInput(e.target.value)} className="flex-1 rounded-md border px-3 py-2" placeholder={t('ai.placeholder') || '问我一些关于作业、截止日期或校园服务的问题'} />
        <button onClick={handleSend} disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-md">{loading ? (t('loading') || 'Loading...') : (t('ai.send') || '发送')}</button>
      </div>
    </div>
  );
}
