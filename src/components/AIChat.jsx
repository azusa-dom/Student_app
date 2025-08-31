import React, { useState } from 'react';
import { Bot, Send, Settings } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function AIChat() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState([
    { id: 1, from: 'ai', text: 'Hello! I am your study assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [useOpenAI, setUseOpenAI] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Simple response system for student assistance
  const getAssistantReply = (text) => {
    const userInput = text.toLowerCase();
    
    // Basic pattern matching for common student queries
    const responses = {
      study: [
        'For effective studying, try the Pomodoro Technique: 25 minutes of focused work followed by a 5-minute break.',
        'Active learning methods like summarizing and teaching others can improve retention significantly.',
        'Create a study schedule and stick to it. Consistency is key to academic success.'
      ],
      time: [
        'Time management is crucial. Try prioritizing tasks using the Eisenhower Matrix.',
        'Break large projects into smaller, manageable tasks with specific deadlines.',
        'Use a planner or digital calendar to track assignments and deadlines.'
      ],
      exam: [
        'Start exam preparation early and create a review schedule.',
        'Practice with past papers and time yourself to simulate exam conditions.',
        'Focus on understanding concepts rather than memorizing facts.'
      ],
      stress: [
        'Take regular breaks during study sessions to avoid burnout.',
        'Try relaxation techniques like deep breathing when feeling overwhelmed.',
        'Remember to maintain a healthy work-life balance.'
      ],
      default: [
        'I understand your question. Could you provide more specific details?',
        'That\'s an interesting topic. What particular aspect would you like help with?',
        'I\'m here to help with your studies. Feel free to ask specific questions.',
        'Could you elaborate on what you\'re looking for assistance with?'
      ]
    };
    
    // Find matching category
    let selectedResponses = responses.default;
    for (const [category, categoryResponses] of Object.entries(responses)) {
      if (category !== 'default' && userInput.includes(category)) {
        selectedResponses = categoryResponses;
        break;
      }
    }
    
    // Additional keyword matching
    const keywords = ['help', 'study', 'learn', 'homework', 'assignment', 'project'];
    const timeKeywords = ['time', 'schedule', 'plan', 'deadline', 'manage'];
    const examKeywords = ['exam', 'test', 'quiz', 'review', 'prepare'];
    const stressKeywords = ['stress', 'tired', 'overwhelmed', 'pressure'];
    
    if (timeKeywords.some(keyword => userInput.includes(keyword))) {
      selectedResponses = responses.time;
    } else if (examKeywords.some(keyword => userInput.includes(keyword))) {
      selectedResponses = responses.exam;
    } else if (stressKeywords.some(keyword => userInput.includes(keyword))) {
      selectedResponses = responses.stress;
    } else if (keywords.some(keyword => userInput.includes(keyword))) {
      selectedResponses = responses.study;
    }
    
    // Return random response from selected category
    const randomReply = selectedResponses[Math.floor(Math.random() * selectedResponses.length)];
    
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ text: randomReply });
      }, 500 + Math.random() * 1000); // Realistic response delay
    });
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), from: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      let reply;
      if (useOpenAI && apiKey.trim()) {
        // OpenAI API integration (when API key is provided)
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: 'You are a helpful study assistant for students. Provide clear, concise, and encouraging advice.' },
              { role: 'user', content: currentInput }
            ],
            temperature: 0.7,
            max_tokens: 300
          })
        });
        
        if (!response.ok) throw new Error('API request failed');
        const data = await response.json();
        reply = { text: data.choices[0].message.content };
      } else {
        // Use local assistant
        reply = await getAssistantReply(currentInput);
      }
      
      setMessages(prev => [...prev, { id: Date.now(), from: 'ai', text: reply.text }]);
    } catch (error) {
      console.error('Assistant Error:', error);
      // Fallback to local assistant
      const fallbackReply = await getAssistantReply(currentInput);
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        from: 'ai', 
        text: `⚠️ External service unavailable. Local response: ${fallbackReply.text}` 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-w-4xl mx-auto bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Study Assistant</h2>
            <p className="text-sm text-gray-500">
              {useOpenAI && apiKey ? '🔥 AI Enhanced' : '🧠 Local Assistant'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="openai-toggle"
                checked={useOpenAI}
                onChange={(e) => setUseOpenAI(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="openai-toggle" className="text-sm font-medium">
                Use OpenAI (requires API key)
              </label>
            </div>
            {useOpenAI && (
              <input
                type="password"
                placeholder="Enter your OpenAI API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              />
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.from === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                message.from === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
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
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask me about study tips, time management, or any academic questions..."
            className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}