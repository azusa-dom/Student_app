import React, { useState, useMemo } from 'react';
import { Home, GraduationCap, Briefcase, Users, Phone, Settings, User, Bell, Plus } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import HomePage from './HomePage';
import GradesPage from './GradesPage';
import JobsPage from './JobsPage';
import ClubsPage from './ClubsPage';
import EmergencyPage from './EmergencyPage';
import SettingsPage from './SettingsPage';

const StudentDashboard = () => {
  const { currentTime, grades } = useAppContext();
  const [selectedTab, setSelectedTab] = useState('home');

  const TABS = useMemo(() => [
    { id: 'home', icon: Home, label: '首页' },
    { id: 'grades', icon: GraduationCap, label: '成绩', badge: grades.length > 0 },
    { id: 'jobs', icon: Briefcase, label: '求职' },
    { id: 'clubs', icon: Users, label: '社团' },
    { id: 'emergency', icon: Phone, label: '紧急' },
    { id: 'settings', icon: Settings, label: '设置' }
  ], [grades.length]);

  const renderContent = () => {
    switch (selectedTab) {
      case 'home': return <HomePage />;
      case 'grades': return <GradesPage />;
      case 'jobs': return <JobsPage />;
      case 'clubs': return <ClubsPage />;
      case 'emergency': return <EmergencyPage />;
      case 'settings': return <SettingsPage />;
      default: return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-24 relative">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.015] pointer-events-none" />
      
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-white/80 border-b border-gray-100/50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">张同学 - UCL</h2>
                <p className="text-sm text-gray-600 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                  {currentTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })} 伦敦时间
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl relative group transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
                <Bell className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full ring-4 ring-white"></div>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4">{renderContent()}</main>

      <nav className="fixed bottom-0 left-0 right-0 backdrop-blur-xl bg-white/80 border-t border-gray-100/50 safe-area-pb">
        <div className="max-w-6xl mx-auto px-4 py-2">
          <div className="flex justify-around">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isSelected = selectedTab === tab.id;
              return (
                <button 
                  key={tab.id} 
                  onClick={() => setSelectedTab(tab.id)} 
                  className={`
                    flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-300
                    ${isSelected 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20 scale-110' 
                      : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                    }
                  `}
                >
                  <div className="relative">
                    <Icon className={`w-5 h-5 transition-transform ${isSelected ? 'animate-bounce' : 'group-hover:scale-110'}`} />
                    {tab.badge && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <span className="text-xs mt-1 font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <button 
        onClick={() => alert('功能待开发：手动添加事件')}
        className="fixed bottom-24 right-6 group">
        <div className="absolute inset-0 bg-blue-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
        <div className="relative w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-110 transition-all duration-300">
          <Plus className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
        </div>
      </button>
    </div>
  );
};

export default StudentDashboard;
