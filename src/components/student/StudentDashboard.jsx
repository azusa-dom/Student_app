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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 pb-20">
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <div className="w-6 h-6 bg-white rounded-lg"></div>
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 text-lg">Zhang - UCL</h2>
                <p className="text-gray-600 text-sm flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></span>
                  {currentTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} GMT
                </p>
              </div>
            </div>
            <button className="p-2 bg-gray-100 rounded-lg border border-gray-200 hover:bg-gray-200 transition-all duration-200">
              <Bell className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>
      </header>

      {/* Activity Preview Section */}
      <div className="max-w-4xl mx-auto px-6 py-4">
        <ActivityPreview />
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-2">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-200 shadow-lg">
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
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
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
        className="fixed bottom-24 right-6 w-12 h-12 bg-blue-600 text-white rounded-xl shadow-lg hover:scale-105 hover:bg-blue-700 transition-all duration-200 flex items-center justify-center"
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>
  );
};

export default StudentDashboard;