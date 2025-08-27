import React from 'react';
import { useAppContext } from '../contexts/AppContext';

const OnboardingScreen = () => {
  const { userType, setUserType, handleEmailAuth, loading, selectedProvider } = useAppContext();

  const features = [
    { title: '自动生成课程表', emoji: '📅', description: '智能排课' },
    { title: '作业DDL提醒', emoji: '⏰', description: '不错过任何截止日期' },
    { title: '成绩自动获取', emoji: '📊', description: '实时成绩追踪' },
    { title: '求职信息整合', emoji: '💼', description: '职业规划助手' },
    { title: '家长同步摘要', emoji: '👨‍👩‍👧‍👦', description: '家校沟通桥梁' },
    { title: '学习分析', emoji: '🎯', description: '个性化学习建议' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-purple-100 to-indigo-100 flex items-center justify-center p-6">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-6xl border border-white/40 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
          
          {/* Left Column - Main Content */}
          <div className="flex flex-col justify-center p-8 lg:p-12">
            {/* Logo and Title */}
            <div className="text-center lg:text-left mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl mb-6 shadow-lg">
                <span className="text-3xl">🎓</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
                留学生家校通
              </h1>
              <p className="text-xl text-gray-600 font-medium">
                智能管理，学业无忧
              </p>
            </div>

            {/* Auth Buttons */}
            <div className="space-y-4 mb-8">
              {!loading && !selectedProvider && (
                <>
                  <button 
                    onClick={() => handleEmailAuth('gmail')} 
                    className="w-full py-4 px-8 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-semibold text-lg shadow-xl hover:shadow-purple-500/30 transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div className="flex items-center justify-center space-x-3">
                      <span className="text-2xl">📧</span>
                      <span>使用 Gmail 授权</span>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => handleEmailAuth('outlook')} 
                    className="w-full py-4 px-8 bg-white text-gray-700 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] border-2 border-gray-200 hover:border-gray-300"
                  >
                    <div className="flex items-center justify-center space-x-3">
                      <span className="text-2xl">📮</span>
                      <span>使用 Outlook 授权</span>
                    </div>
                  </button>
                </>
              )}

              {loading && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full mb-6 shadow-lg animate-pulse">
                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-xl font-semibold text-purple-800 mb-2">正在授权并同步数据...</p>
                  <p className="text-purple-600 opacity-80">连接邮箱和Moodle系统</p>
                </div>
              )}
            </div>

            {/* User Type Toggle */}
            {!loading && (
              <div className="bg-purple-50/80 p-2 rounded-2xl border border-purple-200/50">
                <div className="grid grid-cols-2 gap-1">
                  <button 
                    onClick={() => setUserType('student')} 
                    className={`py-3 px-6 rounded-xl text-base font-semibold transition-all duration-300 ${
                      userType === 'student' 
                        ? 'bg-white text-purple-700 shadow-lg transform scale-105' 
                        : 'text-gray-600 hover:text-purple-700 hover:bg-white/50'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <span>👨‍🎓</span>
                      <span>学生端</span>
                    </div>
                  </button>
                  <button 
                    onClick={() => setUserType('parent')} 
                    className={`py-3 px-6 rounded-xl text-base font-semibold transition-all duration-300 ${
                      userType === 'parent' 
                        ? 'bg-white text-purple-700 shadow-lg transform scale-105' 
                        : 'text-gray-600 hover:text-purple-700 hover:bg-white/50'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <span>👨‍👩‍👧‍👦</span>
                      <span>家长端</span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Features Grid */}
          <div className="bg-gradient-to-br from-purple-50/50 to-indigo-50/50 p-8 lg:p-12">
            <div className="h-full flex flex-col">
              <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
                ✨ 核心功能
              </h2>
              
              <div className="grid grid-cols-2 gap-6 flex-1">
                {features.map((feature, index) => (
                  <div 
                    key={index} 
                    className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 border border-white/60 group cursor-pointer"
                    style={{
                      animationDelay: `${index * 0.1}s`,
                    }}
                  >
                    <div className="text-center h-full flex flex-col justify-center">
                      <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                        {feature.emoji}
                      </div>
                      <h3 className="font-bold text-gray-800 text-sm mb-2 leading-tight">
                        {feature.title}
                      </h3>
                      <p className="text-xs text-gray-500 opacity-80">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Bottom decoration */}
              <div className="text-center mt-8 opacity-60">
                <p className="text-sm text-gray-500">
                  🚀 让学习变得更简单高效
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingScreen;