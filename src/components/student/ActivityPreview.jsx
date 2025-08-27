import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, MapPin } from 'lucide-react';

const ActivityPreview = () => {
  const [previewActivity, setPreviewActivity] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // 模拟获取今日活动数据
    const todayActivities = [
      {
        id: 1,
        title: 'Project Active Yoga',
        club: 'UCL Health & Wellness',
        date: '2025-08-27',
        time: '17:00 – 18:00',
        location: 'Sports Centre',
        participants: 25,
        maxParticipants: 30,
        type: 'wellness'
      },
      {
        id: 2,
        title: 'AI Research Workshop',
        club: 'UCL Computer Science Society',
        date: '2025-08-27',
        time: '19:00 – 21:00',
        location: 'Pearson Building',
        participants: 18,
        maxParticipants: 20,
        type: 'academic'
      },
      {
        id: 3,
        title: 'Chinese Cultural Night',
        club: 'Chinese Students Association',
        date: '2025-08-27',
        time: '18:30 – 22:00',
        location: 'Jeremy Bentham Room',
        participants: 85,
        maxParticipants: 120,
        type: 'cultural'
      }
    ];

    // 选择今天的第一个活动作为预览
    setPreviewActivity(todayActivities[0]);

    // 更新时间
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const getActivityTypeColor = (type) => {
    switch (type) {
      case 'wellness': return 'bg-green-100 text-green-700';
      case 'academic': return 'bg-blue-100 text-blue-700';
      case 'cultural': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (!previewActivity) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-pulse text-gray-500">加载今日活动...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getActivityTypeColor(previewActivity.type)}`}>
              今日推荐
            </span>
            <span className="text-xs text-gray-500">
              {currentTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })} 更新
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {previewActivity.title}
          </h3>
          <p className="text-sm text-gray-600 mb-2">{previewActivity.club}</p>
        </div>
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
          <Calendar className="w-6 h-6 text-white" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center space-x-2 text-gray-600">
          <Clock className="w-4 h-4" />
          <span>{previewActivity.time}</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{previewActivity.location}</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <Users className="w-4 h-4" />
          <span>{previewActivity.participants}/{previewActivity.maxParticipants} 人</span>
        </div>
        <div className="flex justify-end">
          <button className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-blue-700 transition-colors">
            查看详情
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityPreview;