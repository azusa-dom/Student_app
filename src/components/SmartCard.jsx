import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Clock, Calendar, MapPin, User, ExternalLink, Check, AlertTriangle } from 'lucide-react';
import { getEventIcon, getEventColor, formatTimeRemaining } from '../utils/helpers';

const SmartCard = ({ event }) => {
  const Icon = getEventIcon(event.type);
  const [isCompleted, setIsCompleted] = useState(event.status === 'completed');
  const [isAddedToCalendar, setIsAddedToCalendar] = useState(false);

  const { getThemeConfig } = useTheme();
  const themeConfig = getThemeConfig();

  return (
    <div className={`relative group ${isCompleted ? 'opacity-75' : ''}`}>
      <div className={`absolute inset-0 rounded-3xl shadow-xl group-hover:shadow-2xl transition-all duration-300 ${themeConfig.card}`}></div>
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start space-x-4">
            <div className={`relative group w-14 h-14 rounded-2xl bg-gradient-to-tr shadow-lg ${getEventColor(event.type)} flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110`}>
              <div className="absolute inset-0 rounded-2xl bg-white opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <Icon className="w-7 h-7 text-white transition-transform group-hover:scale-110" />
            </div>
            <div className="flex-1 pt-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2 leading-tight">{(event.title && typeof event.title === 'object') ? (event.title?.[event.language || 'zh'] || event.title?.zh || event.title?.en) : event.title}</h3>
              {event.course && (
                <span className="inline-block px-4 py-1 text-sm font-medium bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 rounded-full shadow-sm">
                  {event.course}
                </span>
              )}
            </div>
          </div>
          {event.confidence < 0.8 && (
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl group-hover:shadow-md transition-shadow">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-medium text-amber-600">需确认</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {event.due_at && (
            <div className="col-span-2 flex items-center space-x-2 p-3 rounded-xl bg-red-50/50 group-hover:bg-red-50 transition-colors">
              <Clock className="w-5 h-5 text-red-500" />
              <span className="font-medium text-red-600">截止: {formatTimeRemaining(event.due_at)}</span>
            </div>
          )}
          {event.start_at && (
            <div className="flex items-center space-x-2 p-3 rounded-xl bg-blue-50/50 group-hover:bg-blue-50 transition-colors">
              <Calendar className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-blue-600">{new Date(event.start_at).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}
          {event.location && (
            <div className="flex items-center space-x-2 p-3 rounded-xl bg-purple-50/50 group-hover:bg-purple-50 transition-colors">
              <MapPin className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-purple-600">{event.location}</span>
            </div>
          )}
          {event.teacher && (
            <div className="flex items-center space-x-2 p-3 rounded-xl bg-emerald-50/50 group-hover:bg-emerald-50 transition-colors">
              <User className="w-5 h-5 text-emerald-500" />
              <span className="text-sm text-emerald-600">{event.teacher}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => {
              if (!isAddedToCalendar) {
                // 创建日历事件
                const startDate = event.start_at ? new Date(event.start_at) : new Date();
                const endDate = event.due_at ? new Date(event.due_at) : new Date(startDate.getTime() + 60 * 60 * 1000); // 默认1小时
                
                // 格式化为 ICS 格式的日期时间
                const formatDate = (date) => {
                  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                };
                
                // 构建 ICS 文件内容
                const icsContent = [
                  'BEGIN:VCALENDAR',
                  'VERSION:2.0',
                  'PRODID:-//Student App//Calendar Event//EN',
                  'BEGIN:VEVENT',
                  `DTSTART:${formatDate(startDate)}`,
                  `DTEND:${formatDate(endDate)}`,
                  `SUMMARY:${event.title}`,
                  `DESCRIPTION:${event.course ? `课程: ${event.course}\\n` : ''}${event.teacher ? `教师: ${event.teacher}\\n` : ''}${event.location ? `地点: ${event.location}` : ''}`,
                  `LOCATION:${event.location || ''}`,
                  `UID:${event.id || Date.now()}@studentapp.com`,
                  'END:VEVENT',
                  'END:VCALENDAR'
                ].join('\r\n');
                
                // 创建并下载 ICS 文件
                const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = `${(event.title || 'event').replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}.ics`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(link.href);
                
                setIsAddedToCalendar(true);
                
                // 显示成功提示
                const notification = document.createElement('div');
                notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse';
                notification.textContent = '日历事件已下载，请导入到您的日历应用';
                document.body.appendChild(notification);
                setTimeout(() => {
                  document.body.removeChild(notification);
                }, 3000);
              } else {
                setIsAddedToCalendar(false);
              }
            }}
            className={`
              flex items-center space-x-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300
              ${isAddedToCalendar 
                ? 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-600 shadow-sm shadow-emerald-100' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5'
              }
            `}
          >
            <Calendar className="w-4 h-4" />
            <span>{isAddedToCalendar ? '已加入' : '加入日历'}</span>
          </button>

          {event.link && (
            <button 
              onClick={() => window.open(event.link, '_blank')}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl font-medium text-sm bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
            >
              <ExternalLink className="w-4 h-4" />
              <span>打开Moodle</span>
            </button>
          )}

          <button 
            onClick={() => setIsCompleted(!isCompleted)}
            className={`
              flex items-center space-x-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300
              ${isCompleted
                ? 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-600 shadow-sm shadow-emerald-100'
                : 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-600 shadow-sm hover:shadow-md hover:-translate-y-0.5'
              }
            `}
          >
            <Check className="w-4 h-4" />
            <span>{isCompleted ? '已完成' : '标记完成'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmartCard;
