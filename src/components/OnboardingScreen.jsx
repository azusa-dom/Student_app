import React from 'react';
import { useAppContext } from '../contexts/AppContext';

const OnboardingScreen = () => {
  const { userType, setUserType, handleEmailAuth, loading, selectedProvider } = useAppContext();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        
        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
          
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">留学生家校通</h1>
            <p className="text-gray-600">智能管理，学业无忧</p>
          </div>

          {/* Auth Section */}
          <div className="space-y-4 mb-8">
            {!loading && !selectedProvider && (
              <>
                <button 
                  onClick={() => handleEmailAuth('gmail')} 
                  className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-1"
                >
                  使用 Gmail 授权
                </button>
                
                <button 
                  onClick={() => handleEmailAuth('outlook')} 
                  className="w-full py-4 px-6 bg-white text-gray-700 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-2 border-gray-100 hover:border-gray-200"
                >
                  使用 Outlook 授权
                </button>
              </>
            )}

            {loading && (
              <div className="text-center py-8">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-blue-800 font-medium">正在授权并同步数据...</p>
                <p className="text-gray-500 text-sm mt-2">连接邮箱和Moodle系统</p>
              </div>
            )}
          </div>

          {/* User Type Toggle */}
          {!loading && (
            <div className="bg-gray-100/80 p-1 rounded-xl">
              <div className="grid grid-cols-2 gap-1">
                <button 
                  onClick={() => setUserType('student')} 
                  className={`py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                    userType === 'student' 
                      ? 'bg-white text-blue-700 shadow-sm' 
                      : 'text-gray-600 hover:text-blue-700'
                  }`}
                >
                  学生端
                </button>
                <button 
                  onClick={() => setUserType('parent')} 
                  className={`py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                    userType === 'parent' 
                      ? 'bg-white text-blue-700 shadow-sm' 
                      : 'text-gray-600 hover:text-blue-700'
                  }`}
                >
                  家长端
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Text */}
        <p className="text-center text-gray-500 text-sm mt-6">
          安全连接，数据加密保护
        </p>
      </div>
    </div>
  );
};

export default OnboardingScreen;