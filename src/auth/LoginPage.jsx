import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { trackLogin } from '../utils/analytics';
import VisitorCounter from '../components/VisitorCounter';
import './LoginPage.css';

function LoginPage() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleStart = () => {
    if (selectedRole) {
      setIsLoading(true);
      
      // 模拟登录验证过程
      setTimeout(() => {
        setIsLoading(false);
        
        // 跟踪用户登录
        trackLogin(selectedRole);
        
        // 根据选择的角色进行路由跳转
        if (selectedRole === 'student') {
          navigate('/student/home');
        } else if (selectedRole === 'parent') {
          navigate('/parent/dashboard');
        }
      }, 2000);
    }
  };

  // 文本内容 - 支持中英文切换
  const texts = {
    zh: {
      systemOnline: '✓ 身份验证已通过 · 请选择您的身份继续',
      appTitle: '欢迎使用',
      appSubtitle: '智能校园生活助手',
      selectRole: '请选择您的身份',
      student: '学生',
      parent: '家长',
      studentDesc: '管理课程、作业和校园生活',
      parentDesc: '关注孩子学习动态和重要通知',
      getStarted: '开始使用',
      loading: '正在进入...'
    },
    en: {
      systemOnline: '✓ Authentication Verified · Please select your role to continue',
      appTitle: 'Welcome',
      appSubtitle: 'Smart Campus Life Assistant',
      selectRole: 'Select Your Role',
      student: 'Student',
      parent: 'Parent',
      studentDesc: 'Manage courses, assignments, and campus life',
      parentDesc: 'Monitor your child\'s progress and updates',
      getStarted: 'Get Started',
      loading: 'Loading...'
    }
  };

  const currentTexts = texts[language] || texts.zh;

  return (
    <div className="login-page">
      <div className="bg-animation">
        <div className="floating-element element1"></div>
        <div className="floating-element element2"></div>
        <div className="floating-element element3"></div>
        <div className="floating-element element4"></div>
        <div className="floating-element element5"></div>
        <div className="floating-element element6"></div>
      </div>
      
      <div className="login-wrapper">
        <div className="login-container">
          {/* 状态指示器 */}
          <div className="status-indicator">
            {currentTexts.systemOnline}
          </div>
          
          {/* 品牌区域 */}
          <div className="brand-section">
            <div className="app-logo">
              <div className="logo-circle">📚</div>
            </div>
            <h1 className="app-title">{currentTexts.appTitle}</h1>
            <p className="app-subtitle">{currentTexts.appSubtitle}</p>
          </div>
          
          {/* 角色选择 */}
          <div className="role-selection">
            <h2 className="selection-title">{currentTexts.selectRole}</h2>
            <div className="role-options">
              <div
                className={`role-card ${selectedRole === 'student' ? 'selected' : ''}`}
                onClick={() => handleRoleSelect('student')}
              >
                <div className="role-content">
                  <div className="role-icon student-icon">🎓</div>
                  <div className="role-text">
                    <h3 className="role-title">{currentTexts.student}</h3>
                    <p className="role-description">{currentTexts.studentDesc}</p>
                  </div>
                </div>
                <div className="check-indicator">
                  <span className="check-icon">✓</span>
                </div>
              </div>
              
              <div
                className={`role-card ${selectedRole === 'parent' ? 'selected' : ''}`}
                onClick={() => handleRoleSelect('parent')}
              >
                <div className="role-content">
                  <div className="role-icon parent-icon">👥</div>
                  <div className="role-text">
                    <h3 className="role-title">{currentTexts.parent}</h3>
                    <p className="role-description">{currentTexts.parentDesc}</p>
                  </div>
                </div>
                <div className="check-indicator">
                  <span className="check-icon">✓</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* 开始按钮 */}
          <button
            className="start-button"
            onClick={handleStart}
            disabled={!selectedRole || isLoading}
          >
            {isLoading ? (
              <div className="loading-content">
                <div className="loading-spinner"></div>
                <span>
                  {selectedRole === 'student' 
                    ? `${currentTexts.loading}学生端...` 
                    : `${currentTexts.loading}家长端...`}
                </span>
              </div>
            ) : (
              currentTexts.getStarted
            )}
          </button>
          
          {/* 访问统计 */}
          <div className="mt-8 flex justify-center">
            <VisitorCounter />
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;