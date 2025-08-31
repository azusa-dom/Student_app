import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, ChevronRight, Plus, Calendar, Clock, MapPin, User,
  Filter, Search, Grid3X3, Rows3, Columns, Settings
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAppContext } from '../../contexts/AppContext';
import { QuickAddEventModal } from './QuickAddEventModal';

const CalendarPage = () => {
  const { t } = useLanguage();
  const { events, addEvent } = useAppContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // month, week, day
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    class_event: true,
    assignment_due: true,
    exam: true,
    club_activity: true
  });
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // 获取当前月份的所有日期
  const getCurrentMonthDates = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const dates = [];
    
    // 添加上个月的日期填充
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      dates.push({ date, isCurrentMonth: false });
    }
    
    // 添加当前月的日期
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      dates.push({ date, isCurrentMonth: true });
    }
    
    // 添加下个月的日期填充
    const remainingDays = 42 - dates.length; // 6周 × 7天
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      dates.push({ date, isCurrentMonth: false });
    }
    
    return dates;
  };

  // 获取当前周的日期
  const getCurrentWeekDates = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // 获取指定日期的事件
  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_at || event.due_at);
      return eventDate.toDateString() === date.toDateString() && 
             selectedFilters[event.type];
    });
  };

  // 获取事件颜色
  const getEventColor = (type) => {
    const colors = {
      class_event: 'bg-blue-500 text-white',
      assignment_due: 'bg-red-500 text-white',
      exam: 'bg-purple-500 text-white',
      club_activity: 'bg-green-500 text-white'
    };
    return colors[type] || 'bg-gray-500 text-white';
  };

  // 月视图组件
  const MonthView = () => {
    const monthDates = getCurrentMonthDates();
    const weekDays = [
      t('calendar.weekdays.sun'),
      t('calendar.weekdays.mon'),
      t('calendar.weekdays.tue'),
      t('calendar.weekdays.wed'),
      t('calendar.weekdays.thu'),
      t('calendar.weekdays.fri'),
      t('calendar.weekdays.sat')
    ];

    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* 星期标题 */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {(weekDays || []).map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 bg-gray-50">
              {day}
            </div>
          ))}
        </div>
        
        {/* 日期网格 */}
        <div className="grid grid-cols-7">
          {(monthDates || []).map(({ date, isCurrentMonth }, index) => {
            const dayEvents = getEventsForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();
            const isSelected = date.toDateString() === selectedDate.toDateString();
            
            return (
              <div
                key={index}
                className={`min-h-[120px] border-r border-b border-gray-100 p-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                  !isCurrentMonth ? 'bg-gray-50/50 text-gray-400' : ''
                }`}
                onClick={() => {
                  setSelectedDate(new Date(date));
                  setViewMode('day');
                }}
              >
                <div className={`text-sm font-medium mb-2 ${
                  isToday ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center' :
                  isSelected ? 'bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center' : ''
                }`}>
                  {date.getDate()}
                </div>
                
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event, eventIndex) => (
                    <div
                      key={eventIndex}
                      className={`text-xs px-1.5 py-0.5 rounded truncate ${getEventColor(event.type)}`}
                      title={(event.title && typeof event.title === 'object') ? (event.title[event.language || 'zh'] || event.title.zh || event.title.en) : event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500">
                      {t('calendar.moreEvents', { count: dayEvents.length - 3 })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 周视图组件
  const WeekView = () => {
    const weekDates = getCurrentWeekDates();
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* 日期标题 */}
        <div className="grid grid-cols-8 border-b border-gray-200">
          <div className="p-3 bg-gray-50"></div>
          {(weekDates || []).map(date => {
            const isToday = date.toDateString() === new Date().toDateString();
            return (
              <div key={date.toISOString()} className={`p-3 text-center ${isToday ? 'bg-blue-50' : 'bg-gray-50'}`}>
                <div className="text-sm text-gray-500">
                  {date.toLocaleDateString('zh-CN', { weekday: 'short' })}
                </div>
                <div className={`text-lg font-semibold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                  {date.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* 时间网格 */}
        <div className="max-h-[600px] overflow-y-auto">
          <div className="grid grid-cols-8">
            <div className="border-r border-gray-200">
              {hours.map(hour => (
                <div key={hour} className="h-16 border-b border-gray-100 p-2 text-xs text-gray-500">
                  {hour.toString().padStart(2, '0')}:00
                </div>
              ))}
            </div>
            
            {(weekDates || []).map(date => (
              <div key={date.toISOString()} className="border-r border-gray-200">
                {hours.map(hour => {
                  const dayEvents = getEventsForDate(date).filter(event => {
                    if (event.start_at) {
                      const eventHour = new Date(event.start_at).getHours();
                      return eventHour === hour;
                    }
                    return false;
                  });

                  return (
                    <div key={hour} className="h-16 border-b border-gray-100 p-1 relative">
                      {dayEvents.map((event, index) => (
                        <div
                          key={index}
                          className={`absolute left-1 right-1 top-1 bottom-1 rounded text-xs p-1 ${getEventColor(event.type)} truncate`}
                          title={event.title}
                        >
                          {event.title}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 日视图组件
  const DayView = () => {
    const dayEvents = getEventsForDate(selectedDate).sort((a, b) => {
      const timeA = new Date(a.start_at || a.due_at).getTime();
      const timeB = new Date(b.start_at || b.due_at).getTime();
      return timeA - timeB;
    });

    return (
      <div className="space-y-4">
        {/* 日期标题 */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h2 className="text-3xl font-extrabold text-gray-900">
            {selectedDate.toLocaleDateString('zh-CN', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              weekday: 'long'
            })}
          </h2>
          <p className="text-gray-600 mt-1">{t('calendar.eventsCount', { count: dayEvents.length })}</p>
        </div>

        {/* 事件列表 */}
        <div className="space-y-3">
          {dayEvents.length === 0 ? (
            <div className="bg-white rounded-xl p-8 border border-gray-200 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">{t('calendar.noEventsToday')}</p>
            </div>
          ) : (
            dayEvents.map((event, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                    {event.course && (
                      <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getEventColor(event.type)}`}>
                        {event.course}
                      </span>
                    )}
                    
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      {event.start_at && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">
                            {new Date(event.start_at).toLocaleTimeString('zh-CN', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{event.location}</span>
                        </div>
                      )}
                      {event.teacher && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <User className="w-4 h-4" />
                          <span className="text-sm">{event.teacher}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(currentDate.getMonth() + direction);
    } else if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() + (direction * 7));
    } else {
      newDate.setDate(currentDate.getDate() + direction);
    }
    setCurrentDate(newDate);
    if (viewMode === 'day') {
      setSelectedDate(newDate);
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const getDisplayTitle = () => {
    if (viewMode === 'month') {
      return currentDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' });
    } else if (viewMode === 'week') {
      const weekDates = getCurrentWeekDates();
      const start = weekDates[0];
      const end = weekDates[6];
      if (start.getMonth() === end.getMonth()) {
        return `${start.getFullYear()}年${start.getMonth() + 1}月 ${start.getDate()}-${end.getDate()}日`;
      } else {
        return `${start.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}`;
      }
    } else {
      return selectedDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
    }
  };

  return (
    <div className="space-y-4">
      {/* 标题栏 */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-4xl font-extrabold text-gray-900">{t('calendar.title')}</h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateDate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={goToToday}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                {t('calendar.today')}
              </button>
              <button
                onClick={() => navigateDate(1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <h2 className="text-xl font-bold text-gray-700">{getDisplayTitle()}</h2>
          </div>

          <div className="flex items-center space-x-2">
            {/* 筛选按钮 */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm">{t('calendar.filter')}</span>
            </button>

            {/* 视图切换 */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('month')}
                className={`flex items-center space-x-1 px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
                <span>{t('calendar.month')}</span>
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`flex items-center space-x-1 px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Columns className="w-4 h-4" />
                <span>{t('calendar.week')}</span>
              </button>
              <button
                onClick={() => setViewMode('day')}
                className={`flex items-center space-x-1 px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'day' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Rows3 className="w-4 h-4" />
                <span>{t('calendar.day')}</span>
              </button>
            </div>

            {/* 添加事件按钮 */}
            <button
              onClick={() => setIsQuickAddOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{t('calendar.addEvent')}</span>
            </button>
          </div>
        </div>

        {/* 筛选器 */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-base font-bold text-gray-900 mb-3">{t('calendar.showEventTypes')}</h3>
            <div className="grid grid-cols-4 gap-4">
              {Object.entries(selectedFilters).map(([type, enabled]) => (
                <label key={type} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name={`filter-${type}`}
                    id={`filter-${type}`}
                    checked={enabled}
                    onChange={(e) => setSelectedFilters(prev => ({ ...prev, [type]: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    {t(`calendar.eventTypes.${type}`)}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 日历内容 */}
      {viewMode === 'month' && <MonthView />}
      {viewMode === 'week' && <WeekView />}
      {viewMode === 'day' && <DayView />}

      {/* 快速添加事件弹窗 */}
      <QuickAddEventModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onAddEvent={(evt) => {
          addEvent(evt);
        }}
      />
    </div>
  );
};

export default CalendarPage;
