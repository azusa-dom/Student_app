import React from 'react';
import { BookOpen, Clock, GraduationCap, Briefcase, Users } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

const OnboardingScreen = () => {
  const { userType, setUserType, handleEmailAuth, loading, selectedProvider } = useAppContext();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 bg-[url('/noise.png')] bg-opacity-50">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-12 w-full max-w-md border border-white/20">
        <div className="text-center mb-12">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg transform hover:scale-105 transition-all duration-300 rotate-3">
              <GraduationCap className="w-10 h-10 text-white transform -rotate-3" />
            </div>
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-3xl blur opacity-30"></div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">留学生家校通</h1>
          <p className="text-blue-200/80">智能管理学校邮件和Moodle信息</p>
        </div>

        <div className="space-y-3 mb-8">
          <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors">
            <div className="p-2.5 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl"><BookOpen className="w-5 h-5 text-white" /></div>
            <span className="text-blue-50">自动生成课程表</span>
          </div>
          <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors">
            <div className="p-2.5 bg-gradient-to-br from-red-400 to-pink-500 rounded-xl"><Clock className="w-5 h-5 text-white" /></div>
            <span className="text-blue-50">作业DDL提醒</span>
          </div>
          <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors">
            <div className="p-2.5 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl"><GraduationCap className="w-5 h-5 text-white" /></div>
            <span className="text-blue-50">成绩自动获取</span>
          </div>
          <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors">
            <div className="p-2.5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl"><Briefcase className="w-5 h-5 text-white" /></div>
            <span className="text-blue-50">求职信息整合</span>
          </div>
          <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors">
            <div className="p-2.5 bg-gradient-to-br from-purple-400 to-violet-500 rounded-xl"><Users className="w-5 h-5 text-white" /></div>
            <span className="text-blue-50">家长同步摘要</span>
          </div>
        </div>

        {!loading && !selectedProvider && (
          <div className="space-y-4">
            <button 
              onClick={() => handleEmailAuth('gmail')} 
              className="group relative w-full py-4 px-6 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl font-medium shadow-lg hover:shadow-red-500/25 transition-all duration-300 hover:-translate-y-0.5"
            >
              <span className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></span>
              使用 Gmail 授权
            </button>
            <button 
              onClick={() => handleEmailAuth('outlook')} 
              className="group relative w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-medium shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5"
            >
              <span className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></span>
              使用 Outlook 授权
            </button>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-400 border-t-transparent mx-auto mb-6"></div>
            <p className="text-blue-200">正在授权并同步数据...</p>
            <p className="text-blue-200/60 text-sm mt-2">连接邮箱和Moodle系统</p>
          </div>
        )}

        <div className="flex mt-8 p-1 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
          <button 
            onClick={() => setUserType('student')} 
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
              userType === 'student' 
                ? 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white shadow-lg' 
                : 'text-blue-200/70 hover:text-blue-200'
            }`}
          >
            学生端
          </button>
          <button 
            onClick={() => setUserType('parent')} 
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
              userType === 'parent' 
                ? 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white shadow-lg' 
                : 'text-blue-200/70 hover:text-blue-200'
            }`}
          >
            家长端
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingScreen;
