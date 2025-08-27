import React, { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';

const ActivityPreview = () => {
  const [previewActivity] = useState({
    title: 'Project Active Yoga',
    date: '2025年8月27日',
    time: '17:00 - 18:00',
    location: 'Room 301, Main Building'
  });

  return (
    <div className="flex items-center space-x-4 bg-white/80 backdrop-blur-xl p-4 rounded-2xl border border-gray-100/50 shadow-lg">
      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
        <Calendar className="w-8 h-8 text-white" />
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900">{previewActivity.title}</h3>
        <div className="flex items-center space-x-3 text-sm text-gray-600">
          <span className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            {previewActivity.date}
          </span>
          <span className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {previewActivity.time}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">{previewActivity.location}</p>
      </div>
    </div>
  );
};

export default ActivityPreview;
