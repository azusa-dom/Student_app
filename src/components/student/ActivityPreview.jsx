import React, { useState } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';

const ActivityPreview = () => {
  const [previewActivity] = useState({
    title: 'Active Yoga Session',
    date: 'Aug 27, 2025',
    time: '17:00 - 18:00',
    location: 'Room 301, Main Building'
  });

  return (
    <div className="flex items-center space-x-4">
      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
        <Calendar className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-medium text-white truncate">{previewActivity.title}</h3>
        <div className="flex items-center space-x-4 text-sm text-white/70 mt-1">
          <span className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {previewActivity.time}
          </span>
          <span className="flex items-center">
            <MapPin className="w-3 h-3 mr-1" />
            {previewActivity.location}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ActivityPreview;