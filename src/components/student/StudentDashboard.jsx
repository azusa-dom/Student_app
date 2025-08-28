import React, { useState, useMemo } from 'react';
import { Home, GraduationCap, Briefcase, Users, Phone, Settings, Bell, Plus, Globe, Calendar, Mail, Building2 } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import ActivityPreview from './ActivityPreview';
import HomePage from './HomePage';
import GradesPage from './GradesPage';
import JobsPage from './JobsPage';
import MailPage from './MailPage';
import CampusPage from './CampusPage';
import ClubsPage from './ClubsPage';
import CalendarPage from './CalendarPage';
import EmergencyPage from './EmergencyPage';
import SettingsPage from './SettingsPage';
import AvatarUploader from './AvatarUploader';

const StudentDashboard = () => {
  const { currentTime, grades, studentTab, setStudentTab } = useAppContext();
  const { t, language, changeLanguage } = useLanguage();
  const { getThemeConfig, getBackgroundClass } = useTheme();
  const [selectedTab, setSelectedTab] = useState(studentTab || 'home');
  // 同步全局 tab，供首页快速操作跳转
  React.useEffect(() => {
    if (studentTab && studentTab !== selectedTab) {
      setSelectedTab(studentTab);
    }
  }, [studentTab]);
  const [avatar, setAvatar] = useState(null);

  const themeConfig = getThemeConfig();
  const backgroundClass = getBackgroundClass();

  const handleAvatarChange = (newAvatar) => {
    setAvatar(newAvatar);
    alert('Avatar updated');
  };

  const TABS = useMemo(() => [
    { id: 'home', icon: Home, label: t('nav.home') },
    { id: 'mail', icon: Mail, label: t('nav.mail'), badge: true },
    { id: 'grades', icon: GraduationCap, label: t('nav.grades'), badge: grades.length > 0 },
    { id: 'campus', icon: Building2, label: t('nav.campus') },
    { id: 'jobs', icon: Briefcase, label: t('nav.jobs') },
    { id: 'calendar', icon: Calendar, label: t('nav.calendar') },
    { id: 'settings', icon: Settings, label: t('nav.settings') }
  ], [grades.length, t]);

  const renderContent = () => {
    switch (selectedTab) {
      case 'home': return <HomePage />;
      case 'mail': return <MailPage />;
      case 'grades': return <GradesPage />;
      case 'campus': return <CampusPage />;
      case 'jobs': return <JobsPage />;
      case 'calendar': return <CalendarPage />;
      case 'settings': return <SettingsPage />;
      default: return <HomePage />;
    }
  };

  return (
    <div className={`min-h-screen ${backgroundClass} pb-20`}>
      
      {/* Header */}
      <header className={`backdrop-blur-2xl ${themeConfig.navigation} border-b`}>
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 ${themeConfig.card} rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20`}>
                <div className="w-6 h-6 bg-white rounded-lg"></div>
              </div>
              <div>
                <h2 className={`font-semibold ${themeConfig.text} text-lg`}>{t('user.name')} - UCL</h2>
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

      {/* Activity Preview Section */}
      {selectedTab === 'home' && (
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className={`${themeConfig.card} rounded-2xl p-4 border border-white/20`}>
            <ActivityPreview />
          </div>
        </div>
      )}

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-2">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className={`fixed bottom-0 left-0 right-0 backdrop-blur-2xl ${themeConfig.navigation} border-t shadow-lg`}>
        <div className="max-w-4xl mx-auto px-2 py-2">
          <div className="grid grid-cols-7 gap-1">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isSelected = selectedTab === tab.id;
              return (
                <button 
                  key={tab.id} 
                  onClick={() => {
                    setSelectedTab(tab.id);
                    setStudentTab && setStudentTab(tab.id);
                  }} 
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
        onClick={() => alert('Add new item')}
        className={`fixed bottom-24 right-6 w-12 h-12 ${themeConfig.button} rounded-xl shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center`}
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>
  );
};

export default StudentDashboard;