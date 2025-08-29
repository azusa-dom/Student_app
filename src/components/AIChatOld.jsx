import React, { useState } from 'react';
import { Bot, Send, Key, Brain, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

// 增强的 AI 聊天组件：支持免费 AI 和 OpenAI API
export default function AIChat() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState([
    { id: 1, from: 'ai', text: '你好！我是你的AI学习助手，可以帮你解答学习问题、制定学习计划等。你可以选择免费AI模式或使用OpenAI API获得更好的体验。' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [useOpenAI, setUseOpenAI] = useState(false);

  // 免费AI智能回复
  const getFreeAIReply = (text) => {
    const responses = {
      // 学习相关
      学习: ['制定学习计划很重要！建议每天安排固定时间复习，分散学习比集中学习更有效。', '学习时可以使用番茄工作法，25分钟专注学习，5分钟休息。'],
      作业: ['作业遇到困难是正常的！建议先回顾课堂笔记，然后查阅相关资料，最后寻求同学或老师帮助。', '按时完成作业很重要，可以使用待办清单来管理作业进度。'],
      考试: ['考试复习建议制作思维导图，梳理知识点之间的联系。考前保证充足睡眠很重要！', '考试时先做简单题建立信心，再解决难题。时间分配要合理。'],
      专业: ['专业学习需要理论与实践结合，多参与项目实践能更好理解概念。', '建议关注行业动态，了解专业发展趋势。'],
      
      // 生活相关
      时间: ['时间管理很重要！建议使用日历应用规划每日任务，设置提醒避免遗忘。', '学会说"不"也是时间管理的重要部分，专注于重要的事情。'],
      压力: ['感到压力时可以尝试深呼吸、散步或与朋友聊天。适度运动有助于缓解压力。', '压力过大时建议寻求专业帮助，学校通常提供心理咨询服务。'],
      健康: ['保持规律作息很重要！建议每天至少8小时睡眠，均衡饮食，适度运动。', '长时间学习要注意休息，每小时起身活动5-10分钟保护视力和颈椎。'],
      
      // 技术相关
      编程: ['编程学习建议多练习，从简单项目开始，逐步提高复杂度。GitHub是很好的代码分享平台。', '遇到bug不要慌张，仔细检查代码逻辑，使用调试工具定位问题。'],
      算法: ['算法学习要理解核心思想，不要死记硬背。多做练习题，LeetCode是不错的选择。', '数据结构是算法基础，先掌握数组、链表、栈、队列等基础结构。'],
      
      // 默认回复
      default: [
        '这是个很好的问题！建议你可以从多个角度思考这个问题。',
        '我理解你的困惑。可以先搜集相关资料，然后整理思路。',
        '每个人的情况不同，建议你结合自己的实际情况来考虑。',
        '可以尝试把大问题分解成小问题，逐步解决。',
        '如需更专业的建议，可以咨询相关领域的专家或老师。'
      ]
    };
    
    // 查找匹配的关键词
    const keywords = Object.keys(responses).filter(key => key !== 'default' && text.includes(key));
    let selectedResponses = responses.default;
    
    if (keywords.length > 0) {
      selectedResponses = responses[keywords[0]];
    }
    
    // 随机选择一个回复
    const randomReply = selectedResponses[Math.floor(Math.random() * selectedResponses.length)];
    
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ text: `🤖 ${randomReply}` });
      }, 800 + Math.random() * 1200); // 模拟真实的响应时间
    });
  };tate } from 'react';
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
        <label htmlFor="ai-api-key" className="block text-sm text-gray-600 mb-1">{t('ai.apiKey') || 'OpenAI API Key (可选)'}</label>
        <input id="ai-api-key" name="ai-api-key" value={apiKey} onChange={e => setApiKey(e.target.value)} className="w-full rounded-md border px-3 py-2" placeholder="sk-..." />
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
        <label htmlFor="ai-user-input" className="sr-only">{t('ai.placeholder') || '请输入问题'}</label>
        <input id="ai-user-input" name="ai-user-input" value={input} onChange={e => setInput(e.target.value)} className="flex-1 rounded-md border px-3 py-2" placeholder={t('ai.placeholder') || '问我一些关于作业、截止日期或校园服务的问题'} />
        <button onClick={handleSend} disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-md">{loading ? (t('loading') || 'Loading...') : (t('ai.send') || '发送')}</button>
      </div>
    </div>
  );
}
