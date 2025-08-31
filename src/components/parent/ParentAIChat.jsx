import React, { useState } from 'react';

const ParentAIChat = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '您好，我是家长助手AI。您可以询问孩子近期成绩、出勤、作业或需要的建议。' }
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setSending(true);
    // 这里可接入真实后端AI接口
    await new Promise(r => setTimeout(r, 800));
    setMessages(prev => [...prev, { role: 'assistant', content: '已记录您的问题，我建议关注孩子的作业截止和出勤提醒。' }]);
    setSending(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">家长 AI 对话</h3>
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm">关闭</button>
        </div>

        <div className="p-4 h-[50vh] overflow-y-auto space-y-3 bg-gray-50">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>
                {m.content}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t bg-white">
          <div className="flex gap-2">
            <input
              className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="输入你的问题，如：最近一次物理成绩？"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend} disabled={sending} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              发送
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500">提示：暂为演示模式，可接入后端AI服务以返回更精准的分析与建议。</p>
        </div>
      </div>
    </div>
  );
};

export default ParentAIChat;

