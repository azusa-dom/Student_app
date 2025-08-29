// src/components/student/ActivityPreview.jsx
import React from 'react';
import { Clock, MapPin, Users } from 'lucide-react';

const ActivityPreview = ({ onNavigate }) => {
  const activity = {
    title: '乐活瑜伽',
    time: '17:00 - 18:00',
    location: 'activities.sportsCenter',
    participants: '25/30 人参与',
    category: 'activities.healthWithWellness'
  };

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">🧘</span>
          </div>
          <span className="font-medium text-green-800">{activity.title}</span>
        </div>
        <button className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors">
          预备参加
        </button>
      </div>
      
      <div className="flex items-center space-x-4 text-sm text-green-700">
        <div className="flex items-center space-x-1">
          <Clock className="w-4 h-4" />
          <span>{activity.time}</span>
        </div>
        <div className="flex items-center space-x-1">
          <MapPin className="w-4 h-4" />
          <span>运动中心</span>
        </div>
        <div className="flex items-center space-x-1">
          <Users className="w-4 h-4" />
          <span>{activity.participants}</span>
        </div>
      </div>
    </div>
  );
};

export default ActivityPreview;