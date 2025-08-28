import React from 'react';
import { Clock, Calendar, BookOpen, Briefcase, Mail, Building2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppContext } from '../../contexts/AppContext';

const ActivityPreview = ({ onNavigate }) => {
  const { t } = useLanguage();
  const { getThemeConfig } = useTheme();
  const { grades } = useAppContext();
  const themeConfig = getThemeConfig();

  // 快速操作数据
  const quickActions = [
    {
      id: 'project-yoga',
      icon: Clock,
      title: t('activities.projectYoga'),
      subtitle: t('activities.healthWellness'),
      time: '17:00 - 18:00',
      location: t('activities.sportsCenter'),
      attendees: t('activities.participants', { count: '25/30' }),
      status: 'upcoming',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      action: () => onNavigate('/student/calendar')
    }
  ];

  // 今日概览数据
  const todayOverview = [
    {
      id: 'assignments',
      number: '2',
      label: t('overview.dueToday'),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      action: () => onNavigate('/student/grades')
    },
    {
      id: 'schedule',
      number: '1',
      label: t('overview.classes'),
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      action: () => onNavigate('/student/calendar')
    },
    {
      id: 'activities',
      number: '3',
      label: '新活动',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      action: () => onNavigate('/student/calendar')
    }
  ];

  // 智能卡片流数据
  const smartCards = [
    {
      id: 'advanced-stats',
      icon: BookOpen,
      title: 'Advanced Statistics Lecture',
      code: 'STAT7001',
      date: '8月28日 20:27',
      location: 'Room 301, Math Building',
      instructor: 'Prof. Smith',
      actions: [
        { label: '加入日历', primary: true, action: () => onNavigate('/student/calendar') },
        { label: '标记完成', primary: false }
      ]
    },
    {
      id: 'ml-coursework',
      icon: Clock,
      title: 'Machine Learning Coursework 1',
      code: 'CS7012',
      status: '截止：1天后',
      statusColor: 'text-red-600',
      actions: [
        { label: '加入日历', primary: true, action: () => onNavigate('/student/calendar') },
        { label: '打开Moodle', primary: false },
        { label: '标记完成', primary: false }
      ]
    },
    {
      id: 'library-maintenance',
      icon: Building2,
      title: 'Library System Maintenance',
      date: '8月29日 18:27',
      actions: [
        { label: '加入日历', primary: true, action: () => onNavigate('/student/calendar') },
        { label: '标记完成', primary: false }
      ]
    }
  ];

  // 快速操作按钮
  const quickActionButtons = [
    {
      id: 'moodle',
      icon: BookOpen,
      label: '打开Moodle',
      color: 'text-blue-600',
      action: () => window.open('https://moodle.ucl.ac.uk', '_blank')
    },
    {
      id: 'grades',
      icon: BookOpen,
      label: '查看成绩',
      color: 'text-green-600',
      action: () => onNavigate('/student/grades')
    },
    {
      id: 'grades-info',
      icon: BookOpen,
      label: '查看成绩',
      color: 'text-purple-600',
      action: () => onNavigate('/student/grades')
    }
  ];

  // 最新成绩数据
  const recentGrades = [
    { code: 'STAT7001', name: 'Midterm Exam', score: '85%' },
    { code: 'CS7012', name: 'Project 1', score: '92%' },
    { code: 'MATH7003', name: 'Essay', score: '78%' }
  ];

  return (
    <div className="space-y-6">
      
      {/* 即将开始的活动 */}
      {quickActions.map(activity => (
        <div 
          key={activity.id}
          className={`${activity.bgColor} rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all duration-200`}
          onClick={activity.action}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 ${activity.bgColor} rounded-xl flex items-center justify-center`}>
                <activity.icon className={`w-5 h-5 ${activity.iconColor}`} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{activity.title}</h3>
                <p className="text-gray-600 text-xs">{activity.subtitle}</p>
              </div>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                activity.action();
              }}
              className="px-3 py-1.5 bg-white text-green-600 rounded-lg text-xs font-medium hover:shadow-sm transition-all duration-200"
            >
              报名参加
            </button>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
            <span className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{activity.time}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Building2 className="w-3 h-3" />
              <span>{activity.location}</span>
            </span>
            <span>{activity.attendees}</span>
          </div>
        </div>
      ))}

      {/* 今日概览 */}
      <div>
        <h4 className={`font-semibold ${themeConfig.text} mb-3 flex items-center space-x-2`}>
          <Calendar className="w-4 h-4" />
          <span>今日概览</span>
        </h4>
        <p className={`${themeConfig.textSecondary} text-sm mb-4`}>你今天有 4 个课程事项需要关注</p>
        
        <div className="grid grid-cols-3 gap-3 mb-4">
          {todayOverview.map(item => (
            <div 
              key={item.id}
              className={`${item.bgColor} rounded-xl p-3 text-center cursor-pointer hover:shadow-md transition-all duration-200`}
              onClick={item.action}
            >
              <div className={`text-xl font-bold ${item.color}`}>{item.number}</div>
              <div className="text-xs text-gray-600 mt-1">{item.label}</div>
            </div>
          ))}
        </div>

        {/* 快速操作 */}
        <div className="flex items-center space-x-2 mb-4">
          {quickActionButtons.map(btn => (
            <button 
              key={btn.id}
              onClick={btn.action}
              className={`flex items-center space-x-1 px-3 py-2 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-all duration-200 text-xs`}
            >
              <btn.icon className={`w-3 h-3 ${btn.color}`} />
              <span className={btn.color}>{btn.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 智能卡片流 */}
      <div>
        <h4 className={`font-semibold ${themeConfig.text} mb-3 flex items-center space-x-2`}>
          <BookOpen className="w-4 h-4" />
          <span>智能卡片流</span>
        </h4>
        
        <div className="space-y-3">
          {smartCards.map(card => (
            <div key={card.id} className={`${themeConfig.card} rounded-xl p-4 border border-white/20`}>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <card.icon className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h5 className={`font-medium ${themeConfig.text} text-sm mb-1`}>{card.title}</h5>
                  {card.code && (
                    <p className={`${themeConfig.textSecondary} text-xs mb-1`}>{card.code}</p>
                  )}
                  {card.date && (
                    <p className={`${themeConfig.textSecondary} text-xs mb-2 flex items-center space-x-1`}>
                      <Calendar className="w-3 h-3" />
                      <span>{card.date}</span>
                    </p>
                  )}
                  {card.location && (
                    <p className={`${themeConfig.textSecondary} text-xs mb-2 flex items-center space-x-1`}>
                      <Building2 className="w-3 h-3" />
                      <span>{card.location}</span>
                    </p>
                  )}
                  {card.instructor && (
                    <p className={`${themeConfig.textSecondary} text-xs mb-2`}>讲师: {card.instructor}</p>
                  )}
                  {card.status && (
                    <p className={`text-xs mb-2 ${card.statusColor}`}>{card.status}</p>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    {card.actions.map((action, index) => (
                      <button
                        key={index}
                        onClick={action.action}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                          action.primary
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 最新成绩 */}
      <div>
        <h4 className={`font-semibold ${themeConfig.text} mb-3 flex items-center space-x-2`}>
          <GraduationCap className="w-4 h-4" />
          <span>最新成绩</span>
        </h4>
        
        <div className="space-y-2">
          {recentGrades.map((grade, index) => (
            <div 
              key={index}
              className={`${themeConfig.card} rounded-lg p-3 border border-white/20 flex items-center justify-between cursor-pointer hover:shadow-md transition-all duration-200`}
              onClick={() => onNavigate('/student/grades')}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className={`font-medium ${themeConfig.text} text-sm`}>{grade.code}</p>
                  <p className={`${themeConfig.textSecondary} text-xs`}>{grade.name}</p>
                </div>
              </div>
              <div className="text-green-600 font-bold text-sm">{grade.score}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityPreview;