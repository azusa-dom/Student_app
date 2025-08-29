import React, { useState } from 'react';
import { Bot, Send, Settings, Sparkles, Brain, Lightbulb } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function AIChat() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState([
    { id: 1, from: 'ai', text: '你好！我是你的AI学习助手。我可以帮你解答学习问题、制定计划、解决困惑。试试问我具体的问题吧！' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [useOpenAI, setUseOpenAI] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // 智能AI回复系统
  const getSmartAIReply = (text) => {
    const userInput = text.toLowerCase();
    
    // 问题分类和智能回复
    const questionPatterns = [
      // 学习方法类
      {
        patterns: ['怎么学', '如何学', '学习方法', '学不会', '学不懂', '效率', '提高'],
        responses: [
          `关于学习方法，我建议你：\n\n1. 制定明确的学习目标\n2. 采用主动学习法（提问、总结、教授他人）\n3. 使用间隔重复记忆法\n4. 保持专注，避免多任务处理\n\n你具体在哪个科目或领域遇到困难？我可以给出更针对性的建议。`,
          `学习效率的关键在于方法和习惯：\n\n• 番茄工作法：25分钟专注+5分钟休息\n• 费曼学习法：用简单语言解释复杂概念\n• 思维导图：梳理知识结构\n• 定期复习：遗忘曲线规律复习\n\n你想了解哪种方法的具体操作步骤？`
        ]
      },
      
      // 时间管理类
      {
        patterns: ['时间', '计划', '安排', '拖延', 'deadline', '截止', '忙碌'],
        responses: [
          `时间管理的核心是优先级排序：\n\n⭐ 重要且紧急：立即处理\n📅 重要不紧急：计划安排\n⚡ 紧急不重要：快速处理或委派\n❌ 不重要不紧急：尽量避免\n\n建议使用日历工具记录所有任务，每天晚上规划第二天的安排。你现在最大的时间管理挑战是什么？`,
          `对抗拖延症的实用方法：\n\n1. 2分钟法则：能在2分钟内完成的事立即做\n2. 分解任务：大任务拆分成小步骤\n3. 设定奖励：完成任务后给自己小奖励\n4. 环境优化：移除干扰因素\n\n最重要的是开始行动，即使只做5分钟也比不做强！`
        ]
      },
      
      // 考试复习类
      {
        patterns: ['考试', '复习', '背书', '记忆', '背不下来', '忘记'],
        responses: [
          `高效复习策略：\n\n📚 主动回忆：不看书回想知识点\n📝 制作卡片：重点概念做成记忆卡\n🔄 间隔复习：第1天、第3天、第7天、第15天复习\n👥 互相提问：和同学互相测试\n\n考试前一周应该以回顾和练习为主，不要学新内容。你是什么类型的考试？`,
          `记忆技巧大全：\n\n• 联想记忆：将新信息与已知信息关联\n• 故事法：将要记的内容编成故事\n• 位置法：在熟悉的路线上放置记忆点\n• 图像化：抽象概念转化为具体图像\n\n建议根据学科特点选择合适的记忆方法。比如历史用故事法，化学用图像法。`
        ]
      },
      
      // 编程技术类
      {
        patterns: ['编程', 'bug', '代码', '算法', 'python', 'java', 'javascript', '程序'],
        responses: [
          `编程学习建议：\n\n💻 多动手练习：理论+实践结合\n🔍 学会调试：掌握断点、日志技巧\n📖 阅读源码：学习优秀项目的代码\n🤝 参与项目：GitHub上找开源项目\n\n遇到bug时的系统化排查流程：\n1. 复现问题\n2. 查看错误信息\n3. 逐步调试\n4. 查阅文档\n5. 寻求社区帮助\n\n你在学哪种编程语言？遇到什么具体问题？`,
          `算法学习路径：\n\n基础：数组、链表、栈、队列\n进阶：树、图、哈希表\n算法：排序、搜索、动态规划\n\n推荐资源：\n• LeetCode：刷题练习\n• 算法可视化网站：理解过程\n• GitHub算法仓库：学习实现\n\n建议每天坚持做1-2道题，重在理解思路而非速度。`
        ]
      },
      
      // 压力情绪类
      {
        patterns: ['压力', '焦虑', '紧张', '担心', '害怕', '烦躁', '情绪'],
        responses: [
          `缓解学习压力的方法：\n\n🧘 放松技巧：深呼吸、冥想、渐进式肌肉放松\n🏃 运动释压：跑步、瑜伽、散步\n💬 情感支持：和朋友、家人或咨询师交流\n📝 写日记：记录情绪和想法\n\n记住，适度压力是正常的，关键是学会管理。如果压力持续影响生活，建议寻求专业帮助。`,
          `应对考试焦虑：\n\n准备阶段：\n• 制定现实的复习计划\n• 充分准备，增强信心\n• 保持规律的作息\n\n考试时：\n• 到达考场后做深呼吸\n• 先做简单题建立信心\n• 遇到难题暂时跳过\n\n记住：考试只是检验学习成果的一种方式，不代表你的全部价值。`
        ]
      },
      
      // 专业发展类
      {
        patterns: ['专业', '职业', '就业', '实习', '求职', '面试', '简历'],
        responses: [
          `职业发展建议：\n\n🎯 明确目标：确定职业方向和短期目标\n💼 技能建设：关注行业需求的核心技能\n🌐 建立人脉：参加行业活动、线上社群\n📄 作品集：展示实际项目和成果\n\n实习是很好的实践机会，建议主动申请相关岗位。你的专业方向是什么？`,
          `简历制作要点：\n\n• 简洁明了：1-2页为宜\n• 突出成果：用数据说话\n• 关键词优化：匹配岗位要求\n• 项目经历：详细描述参与项目\n\n面试准备：\n• 研究公司背景\n• 准备常见问题回答\n• 练习技术问题\n• 准备提问问题`
        ]
      }
    ];

    // 智能匹配
    let bestMatch = null;
    let maxScore = 0;

    questionPatterns.forEach(pattern => {
      let score = 0;
      pattern.patterns.forEach(keyword => {
        if (userInput.includes(keyword)) {
          score += keyword.length; // 更长的关键词权重更高
        }
      });
      if (score > maxScore) {
        maxScore = score;
        bestMatch = pattern;
      }
    });

    // 特殊问题处理
    const specialQuestions = [
      {
        patterns: ['你是谁', '你好', 'hello', '介绍'],
        response: '我是你的AI学习助手！我可以帮助你：\n\n📚 学习方法指导\n⏰ 时间管理建议\n💻 编程技术问答\n📝 考试复习规划\n😌 压力情绪调节\n🎯 职业发展建议\n\n有什么具体问题想问我吗？'
      },
      {
        patterns: ['谢谢', '感谢', 'thank'],
        response: '不客气！很高兴能帮助到你😊\n\n如果还有其他问题，随时可以问我。记住，学习是一个持续的过程，保持耐心和坚持很重要！'
      },
      {
        patterns: ['没用', '不好', '垃圾', '愚蠢'],
        response: '抱歉我的回答没有帮助到你😔\n\n我还在不断学习中，可以：\n• 尝试更具体地描述你的问题\n• 问不同类型的问题让我学习\n• 使用OpenAI模式获得更专业的回答\n\n你能告诉我需要什么样的帮助吗？'
      }
    ];

    // 检查特殊问题
    for (let special of specialQuestions) {
      if (special.patterns.some(pattern => userInput.includes(pattern))) {
        return Promise.resolve({ text: `🤖 ${special.response}` });
      }
    }

    // 如果找到匹配，返回相应回复
    if (bestMatch && maxScore > 0) {
      const responses = bestMatch.responses;
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({ text: `🧠 ${randomResponse}` });
        }, 800 + Math.random() * 1200);
      });
    }

    // 默认智能回复
    const smartDefaults = [
      `我理解你的问题。能否提供更多细节？比如：\n• 具体是什么情况？\n• 你已经尝试过什么方法？\n• 希望达到什么目标？\n\n这样我能给出更有针对性的建议。`,
      `这是个有趣的问题！虽然我可能无法给出完美答案，但我们可以一起分析：\n\n💡 先明确问题的核心\n🔍 分析可能的解决方向\n📚 寻找相关资源\n👥 考虑寻求专家建议\n\n你觉得这个问题最困难的地方是什么？`,
      `让我帮你整理一下思路：\n\n1️⃣ 明确现状：目前的情况如何？\n2️⃣ 确定目标：想要达到什么效果？\n3️⃣ 分析差距：中间有什么阻碍？\n4️⃣ 制定行动：可以采取哪些步骤？\n\n你想从哪个角度开始分析？`
    ];

    const randomDefault = smartDefaults[Math.floor(Math.random() * smartDefaults.length)];
    
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ text: `💭 ${randomDefault}` });
      }, 800 + Math.random() * 1200);
    });
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now(), from: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
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
              { role: 'system', content: 'You are a helpful AI tutor for students. Respond in Chinese with practical, encouraging advice. Use emojis and structured formatting to make responses clear and engaging.' },
              { role: 'user', content: currentInput }
            ],
            temperature: 0.7,
            max_tokens: 500
          })
        });
        
        if (!response.ok) throw new Error('OpenAI API failed');
        const data = await response.json();
        reply = { text: `🔥 ${data.choices[0].message.content}` };
      } else {
        // 使用智能免费AI
        reply = await getSmartAIReply(currentInput);
      }
      
      setMessages(prev => [...prev, { id: Date.now(), from: 'ai', text: reply.text }]);
    } catch (error) {
      console.error('AI Error:', error);
      // 如果OpenAI失败，回退到智能免费AI
      const fallbackReply = await getSmartAIReply(currentInput);
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        from: 'ai', 
        text: `⚠️ OpenAI连接失败，使用智能AI回复：\n\n${fallbackReply.text}` 
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
            <h2 className="font-semibold text-gray-900">智能AI助手</h2>
            <p className="text-sm text-gray-500">
              {useOpenAI && apiKey ? '🔥 OpenAI模式' : '🧠 智能AI模式'}
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
                使用OpenAI API（可选，需要密钥）
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
                <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">智能AI升级</h4>
                  <p className="text-sm text-blue-700">
                    新版智能AI支持：学习方法、时间管理、编程技术、考试复习、情绪调节、职业发展等专业建议
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
            <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
              msg.from === 'user' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-900'
            }`}>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-2xl">
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
            placeholder="试试问我：如何提高学习效率？编程遇到bug怎么办？"
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        {/* 快速提问按钮 */}
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            '如何提高学习效率？',
            '时间管理技巧',
            '考试复习方法',
            '编程学习建议'
          ].map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setInput(suggestion)}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
