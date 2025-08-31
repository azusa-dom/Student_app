import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { Home, GraduationCap, Briefcase, Users, Phone, Settings, Bell, Plus, Globe, Calendar, Mail, Building2, Bot } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useUser } from '../../contexts/UserContext';


const StudentDashboard = () => {
  const { grades } = useAppContext();
  const { t, language, changeLanguage } = useLanguage();
  const { getThemeConfig, getBackgroundClass } = useTheme();
  const { userData, getInitials } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // 添加时间更新效果
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 从当前路径获取活跃的标签
  const currentTab = useMemo(() => {
    const path = location.pathname.split('/').pop();
    return path || 'home';
  }, [location.pathname]);

  const themeConfig = getThemeConfig();
  const backgroundClass = getBackgroundClass();

  const handleAvatarChange = (newAvatar) => {
    setAvatar(newAvatar);
    alert('Avatar updated');
  };

  const TABS = useMemo(() => [
    { id: 'home', icon: Home, label: t('nav.home'), path: '/student/home' },
    { id: 'mail', icon: Mail, label: t('nav.mail'), badge: true, path: '/student/mail' },
    { id: 'grades', icon: GraduationCap, label: t('nav.grades'), badge: grades.length > 0, path: '/student/grades' },
    { id: 'campus', icon: Building2, label: t('nav.campus'), path: '/student/campus' },
    { id: 'jobs', icon: Briefcase, label: t('nav.jobs'), path: '/student/jobs' },
    { id: 'activities', icon: Users, label: '活动', path: '/student/activities' },
    { id: 'ai', icon: Bot, label: t('ai.title'), path: '/student/ai' },
    { id: 'settings', icon: Settings, label: t('nav.settings'), path: '/student/settings' }
  ], [grades.length, t]);

  const handleTabClick = (tab) => {
    navigate(tab.path);
  };



  return (
    <div className={`min-h-screen ${backgroundClass} pb-20`}>
      
      {/* Header */}
      <header className={`backdrop-blur-2xl ${themeConfig.navigation} border-b`}>
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm border-2 border-white/20">
                {userData.avatar ? (
                  <img src={userData.avatar} alt="用户头像" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">{getInitials()}</span>
                  </div>
                )}
              </div>
              <div>
                <h2 className={`font-semibold ${themeConfig.text} text-lg`}>{userData.name} - UCL</h2>
                <p className={`${themeConfig.textSecondary} text-sm flex items-center`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></span>
                  {currentTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} {t('user.status')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* 语言切换按钮 */}
              <button 
                onClick={() => changeLanguage(language === 'zh' ? 'en' : 'zh')}
                className={`p-2 ${themeConfig.card} rounded-lg border border-white/20 ${themeConfig.cardHover} transition-all duration-200 flex items-center space-x-1`}
                title={language === 'zh' ? 'Switch to English' : '切换到中文'}
              >
                <Globe className={`w-4 h-4 ${themeConfig.text}`} />
                <span className={`text-xs font-medium ${themeConfig.text}`}>
                  {language === 'zh' ? 'EN' : '中'}
                </span>
              </button>
              <button className={`p-2 ${themeConfig.card} rounded-lg border border-white/20 ${themeConfig.cardHover} transition-all duration-200`}>
                <Bell className={`w-5 h-5 ${themeConfig.text}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Activity Preview Section - 只在首页显示 */}


      {/* Main Content - 使用 Outlet 渲染子路由 */}
      <main className="max-w-4xl mx-auto px-6 py-2">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className={`fixed bottom-0 left-0 right-0 backdrop-blur-2xl ${themeConfig.navigation} border-t shadow-lg`}>
        <div className="max-w-4xl mx-auto px-2 py-2">
          <div className="grid grid-cols-7 gap-1">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isSelected = currentTab === tab.id;
              return (
                <button 
                  key={tab.id} 
                  onClick={() => handleTabClick(tab)} 
                  className={`
                    flex flex-col items-center py-2 px-1 rounded-lg transition-all duration-200
                    ${isSelected ? `${themeConfig.button} shadow-md` : `${themeConfig.textSecondary} ${themeConfig.cardHover}`}
                  `}
                >
                  <div className="relative">
                    <Icon className="w-4 h-4" />
                    {tab.badge && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                    )}
                  </div>
                  <span className="text-xs mt-1 font-medium leading-tight">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* FAB */}
      <button 
        onClick={() => navigate('/student/calendar')} // 跳转到日历页面添加新事件
        className={`fixed bottom-24 right-6 w-12 h-12 ${themeConfig.button} rounded-xl shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center`}
        title="添加新事件"
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>
  );
};

export default StudentDashboard;