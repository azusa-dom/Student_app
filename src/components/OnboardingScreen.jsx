import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import SimpleAuthTest from './SimpleAuthTest';

const OnboardingScreen = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole) {
      // 创建用户数据
      const userData = {
        id: Date.now(),
        name: selectedRole === 'student' ? 'Student User' : 'Parent User',
        role: selectedRole
      };

      // 登录用户
      login(userData, selectedRole);

      // 导航到相应的仪表板
      if (selectedRole === 'student') {
        navigate('/student');
      } else {
        navigate('/parent');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        {/* AuthProvider 测试 */}
        <SimpleAuthTest />

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('welcome')}</h1>
          <p className="text-gray-600">{t('selectRole')}</p>
        </div>

        <div className="space-y-4 mb-8">
          <button
            onClick={() => handleRoleSelect('student')}
            className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${
              selectedRole === 'student'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center">
              <div className="text-2xl mr-3">🎓</div>
              <div className="text-left">
                <h3 className="font-semibold">{t('student')}</h3>
                <p className="text-sm text-gray-500">{t('studentDescription')}</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleRoleSelect('parent')}
            className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${
              selectedRole === 'parent'
                ? 'border-purple-500 bg-purple-50 text-purple-700'
                : 'border-gray-200 hover:border-purple-300'
            }`}
          >
            <div className="flex items-center">
              <div className="text-2xl mr-3">👨‍👩‍👧‍👦</div>
              <div className="text-left">
                <h3 className="font-semibold">{t('parent')}</h3>
                <p className="text-sm text-gray-500">{t('parentDescription')}</p>
              </div>
            </div>
          </button>
        </div>

        <button
          onClick={handleContinue}
          disabled={!selectedRole}
          className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${
            selectedRole
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {t('continue')}
        </button>
      </div>
    </div>
  );
};

export default OnboardingScreen;