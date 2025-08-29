import React, { useState } from 'react';
import { Bot, Send, Key, Brain, Sparkles, Settings } from 'lucide-react';
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
  const [showSettings, setShowSettings] = useState(false);

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
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now(), from: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      let reply;
      if (useOpenAI && apiKey.trim()) {
        // OpenAI API 调用
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: 'You are a helpful assistant for students. Respond in Chinese.' },
              { role: 'user', content: input }
            ],
            temperature: 0.7
          })
        });
        
        if (!response.ok) throw new Error('OpenAI API failed');
        const data = await response.json();
        reply = { text: `🔥 ${data.choices[0].message.content}` };
      } else {
        // 使用免费AI
        reply = await getFreeAIReply(input);
      }
      
      setMessages(prev => [...prev, { id: Date.now(), from: 'ai', text: reply.text }]);
    } catch (error) {
      console.error('AI Error:', error);
      // 如果OpenAI失败，回退到免费AI
      const fallbackReply = await getFreeAIReply(input);
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        from: 'ai', 
        text: `⚠️ OpenAI连接失败，使用免费AI回复：\n${fallbackReply.text}` 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-w-4xl mx-auto bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">AI学习助手</h2>
            <p className="text-sm text-gray-500">
              {useOpenAI && apiKey ? '🔥 OpenAI模式' : '🤖 免费AI模式'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* 设置面板 */}
      {showSettings && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="use-openai"
                checked={useOpenAI}
                onChange={(e) => setUseOpenAI(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="use-openai" className="font-medium text-gray-700">
                使用OpenAI API（需要API密钥）
              </label>
            </div>
            
            {useOpenAI && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OpenAI API密钥
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  密钥仅在浏览器本地存储，不会上传到服务器
                </p>
              </div>
            )}
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-start space-x-2">
                <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">免费AI vs OpenAI</h4>
                  <p className="text-sm text-blue-700">
                    免费AI：基于预设规则，适合常见学习问题<br/>
                    OpenAI：更智能，可处理复杂问题，需要API密钥
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
              msg.from === 'user' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-900'
            }`}>
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-2xl">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-sm">AI正在思考...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 输入区域 */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="询问AI任何学习相关的问题..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
