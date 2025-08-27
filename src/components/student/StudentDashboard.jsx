import React, { useState, useMemo } from 'react';
import { Home, GraduationCap, Briefcase, Users, Phone, Settings, Bell, Plus } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import ActivityPreview from './ActivityPreview';
import HomePage from './HomePage';
import GradesPage from './GradesPage';
import JobsPage from './JobsPage';
import ClubsPage from './ClubsPage';
import EmergencyPage from './EmergencyPage';
import SettingsPage from './SettingsPage';
import AvatarUploader from './AvatarUploader';

const StudentDashboard = () => {
  const { currentTime, grades } = useAppContext();
  const [selectedTab, setSelectedTab] = useState('home');
  const [avatar, setAvatar] = useState(null);

  const handleAvatarChange = (newAvatar) => {
    setAvatar(newAvatar);
    alert('Avatar updated');
  };

  const TABS = useMemo(() => [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'grades', icon: GraduationCap, label: 'Grades', badge: grades.length > 0 },
    { id: 'jobs', icon: Briefcase, label: 'Jobs' },
    { id: 'clubs', icon: Users, label: 'Clubs' },
    { id: 'emergency', icon: Phone, label: 'Help' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ], [grades.length]);

  const renderContent = () => {
    switch (selectedTab) {
      case 'home': return <HomePage />;
      case 'grades': return <GradesPage />;
      case 'jobs': return <JobsPage />;
      case 'clubs': return <ClubsPage />;
      case 'emergency': return <EmergencyPage />;
      case 'settings': return (
        <div className="p-6">
          <h2 className="text-xl font-light text-white mb-6">Settings</h2>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <AvatarUploader currentAvatar={avatar} onAvatarChange={handleAvatarChange} />
          </div>
        </div>
      );
      default: return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pb-20">
      
      {/* Header */}
      <header className="backdrop-blur-2xl bg-white/5 border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <div className="w-6 h-6 bg-white rounded-lg"></div>
              </div>
              <div>
                <h2 className="font-light text-white text-lg">Zhang - UCL</h2>
                <p className="text-white/60 text-sm flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-2"></span>
                  {currentTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} GMT
                </p>
              </div>
            </div>
            <button className="p-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200">
              <Bell className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* Activity Preview Section */}
      <div className="max-w-4xl mx-auto px-6 py-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
          <ActivityPreview />
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-2">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 backdrop-blur-2xl bg-white/5 border-t border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-3">
          <div className="flex justify-around">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isSelected = selectedTab === tab.id;
              return (
                <button 
                  key={tab.id} 
                  onClick={() => setSelectedTab(tab.id)} 
                  className={`
                    flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200
                    ${isSelected 
                      ? 'bg-white text-gray-900' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                    }
                  `}
                >
                  <div className="relative">
                    <Icon className="w-5 h-5" />
                    {tab.badge && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                    )}
                  </div>
                  <span className="text-xs mt-1 font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* FAB */}
      <button 
        onClick={() => alert('Add new item')}
        className="fixed bottom-24 right-6 w-12 h-12 bg-white text-gray-900 rounded-xl shadow-2xl hover:scale-105 transition-all duration-200 flex items-center justify-center backdrop-blur-sm"
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>
  );
};

export default StudentDashboard;