import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import AuthTest from './AuthTest';

const TestPage = () => {
  const { isAuthenticated, user, userType, login, logout } = useAuth();
  const { t } = useLanguage();

  const handleTestLogin = () => {
    login({ id: 1, name: 'Test User' }, 'student');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">AuthProvider 测试页面</h1>

        {/* AuthProvider 测试 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">🔍 AuthProvider 状态测试</h2>
          <AuthTest />
        </div>

        {/* 手动测试 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">🧪 手动测试</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded">
              <h3 className="font-semibold">认证状态:</h3>
              <p>已认证: {isAuthenticated ? '✅ 是' : '❌ 否'}</p>
              <p>用户: {user ? user.name : '无'}</p>
              <p>用户类型: {userType || '无'}</p>
            </div>

            <div className="p-4 bg-blue-50 rounded">
              <h3 className="font-semibold">语言测试:</h3>
              <p>当前语言: {t('welcome') || '未设置'}</p>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleTestLogin}
              className="bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600 transition-colors"
            >
              测试登录
            </button>
            <button
              onClick={logout}
              className="bg-red-500 text-white py-2 px-6 rounded hover:bg-red-600 transition-colors"
            >
              登出
            </button>
          </div>
        </div>

        {/* 导航测试 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">🧭 导航测试</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href="/Student_app/"
              className="bg-gray-100 hover:bg-gray-200 p-4 rounded text-center transition-colors"
            >
              🏠 主页
            </a>
            <a
              href="/Student_app/student"
              className="bg-blue-100 hover:bg-blue-200 p-4 rounded text-center transition-colors"
            >
              🎓 学生页面
            </a>
            <a
              href="/Student_app/student/ai"
              className="bg-purple-100 hover:bg-purple-200 p-4 rounded text-center transition-colors"
            >
              🤖 AI聊天
            </a>
            <a
              href="/Student_app/parent"
              className="bg-green-100 hover:bg-green-200 p-4 rounded text-center transition-colors"
            >
              👨‍👩‍👧‍👦 家长页面
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;