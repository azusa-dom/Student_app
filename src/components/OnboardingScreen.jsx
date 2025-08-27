import React from 'react';
import { useAppContext } from '../contexts/AppContext';

const OnboardingScreen = () => {
  const { userType, setUserType, handleEmailAuth, loading, selectedProvider } = useAppContext();

  const features = [
    { title: '自动生成课程表', img: '/illustrations/timetable.svg' },
    { title: '作业DDL提醒', img: '/illustrations/deadlines.svg' },
    { title: '成绩自动获取', img: '/illustrations/grades.svg' },
    { title: '求职信息整合', img: '/illustrations/jobs.svg' },
    { title: '家长同步摘要', img: '/illustrations/parents.svg' },
    { title: '个性化头像', img: '/illustrations/avatar.svg' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-200 via-purple-200 to-blue-200 flex items-center justify-center p-4">
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-4xl border border-white/30">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="flex flex-col justify-center text-center md:text-left">
            <img src="/illustrations/hero.svg" alt="Hero" className="w-24 h-24 mx-auto md:mx-0 mb-4" />
            <h1 className="text-4xl font-bold text-gray-800 mb-3 tracking-tight">留学生家校通</h1>
            <p className="text-gray-600 text-lg">智能管理，学业无忧</p>
            
            <div className="mt-8 space-y-4">
              {!loading && !selectedProvider && (
                <>
                  <button 
                    onClick={() => handleEmailAuth('gmail')} 
                    className="w-full py-3 px-6 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-purple-500/30 transition-all duration-300 transform hover:-translate-y-1"
                  >
                    使用 Gmail 授权
                  </button>
                  <button 
                    onClick={() => handleEmailAuth('outlook')} 
                    className="w-full py-3 px-6 bg-white text-gray-700 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-200"
                  >
                    使用 Outlook 授权
                  </button>
                </>
              )}

              {loading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-400 border-t-transparent mx-auto mb-6"></div>
                  <p className="text-purple-800">正在授权并同步数据...</p>
                  <p className="text-purple-600/80 text-sm mt-2">连接邮箱和Moodle系统</p>
                </div>
              )}
            </div>

            <div className="mt-8 flex p-1 bg-purple-100/50 rounded-full">
              <button 
                onClick={() => setUserType('student')} 
                className={`flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-all duration-300 ${
                  userType === 'student' 
                    ? 'bg-white text-purple-700 shadow-md' 
                    : 'text-gray-500 hover:text-purple-700'
                }`}
              >
                学生端
              </button>
              <button 
                onClick={() => setUserType('parent')} 
                className={`flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-all duration-300 ${
                  userType === 'parent' 
                    ? 'bg-white text-purple-700 shadow-md' 
                    : 'text-gray-500 hover:text-purple-700'
                }`}
              >
                家长端
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div className="grid grid-cols-2 grid-rows-3 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="bg-white/80 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
                <img src={feature.img} alt={feature.title} className="w-16 h-16 mb-2" />
                <p className="text-sm font-semibold text-gray-700">{feature.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingScreen;
