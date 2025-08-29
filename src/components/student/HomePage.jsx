// src/components/student/HomePage.jsx
import React, { useState } from 'react';
import {
  Calendar, BookOpen, Users, MessageCircle, Bell,
  TrendingUp, Clock, MapPin, Star, ArrowRight,
  Briefcase, GraduationCap, Award, Target
} from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';

const HomePage = () => {
  const { events, grades } = useAppContext();
  const { t } = useLanguage();
  const [greeting] = useState(getTimeBasedGreeting());

  function getTimeBasedGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return '早上好';
    if (hour < 18) return '下午好';
    return '晚上好';
  }

  // 快速操作按钮
  const quickActions = [
    {
      id: 'calendar',
      title: '今日课程',
      subtitle: '查看课程安排',
      icon: Calendar,
      color: 'bg-blue-500',
      path: '/student/calendar'
    },
    {
      id: 'assignments',
      title: '作业提醒',
      subtitle: '待完成任务',
      icon: BookOpen,
      color: 'bg-green-500',
      path: '/student/assignments'
    },
    {
      id: 'grades',
      title: '成绩查询',
      subtitle: '学术表现',
      icon: TrendingUp,
      color: 'bg-purple-500',
      path: '/student/grades'
    },
    {
      id: 'jobs',
      title: '职业服务',
      subtitle: '实习就业',
      icon: Briefcase,
      color: 'bg-orange-500',
      path: '/student/jobs'
    }
  ];

  // 今日亮点数据
  const todayHighlights = [
    {
      id: 'classes',
      title: '今日课程',
      value: '3',
      unit: '节课',
      trend: 'next',
      nextItem: '下节课: 数据结构 (14:00)',
      icon: GraduationCap,
      color: 'text-blue-600'
    },
    {
      id: 'assignments',
      title: '待办作业',
      value: '2',
      unit: '项',
      trend: 'urgent',
      nextItem: '最近截止: 算法作业 (明天)',
      icon: Target,
      color: 'text-red-600'
    },
    {
      id: 'events',
      title: '校园活动',
      value: '1',
      unit: '个',
      trend: 'upcoming',
      nextItem: '今晚: 学术讲座 (19:00)',
      icon: Award,
      color: 'text-green-600'
    }
  ];

  // 最近通知
  const recentNotifications = [
    {
      id: 1,
      title: '课程调整通知',
      content: '明天的高等数学课程时间调整至下午3点',
      time: '2小时前',
      type: 'academic',
      urgent: true
    },
    {
      id: 2,
      title: '实习机会推荐',
      content: 'Google 2024暑期实习项目开始申请',
      time: '4小时前',
      type: 'career',
      urgent: false
    },
    {
      id: 3,
      title: '图书馆座位预约',
      content: '您预约的明天上午图书馆座位已确认',
      time: '1天前',
      type: 'service',
      urgent: false
    }
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* 个人欢迎卡片 */}
      <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-violet-700 rounded-2xl p-6 text-white relative overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-5 rounded-full -ml-12 -mb-12"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">{greeting}, 张伟!</h1>
              <p className="text-blue-100 mt-1">今天也要加油学习哦</p>
            </div>
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-2xl">👋</span>
            </div>
          </div>
          
          {/* 快速统计 */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">85%</div>
              <div className="text-xs text-blue-100">本周出勤率</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">12</div>
              <div className="text-xs text-blue-100">本周课程</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">3</div>
              <div className="text-xs text-blue-100">待办作业</div>
            </div>
          </div>
        </div>
      </div>

      {/* 今日亮点 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">今日概览</h2>
        <div className="grid grid-cols-1 gap-4">
          {todayHighlights.map((highlight) => (
            <div key={highlight.id} className="flex items-center space-x-4 p-3 rounded-lg bg-gray-50">
              <div className={`w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center`}>
                <highlight.icon className={`w-5 h-5 ${highlight.color}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold text-gray-900">{highlight.value}</span>
                  <span className="text-sm text-gray-500">{highlight.unit}</span>
                  <span className="text-sm font-medium text-gray-700">{highlight.title}</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">{highlight.nextItem}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 快速操作 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h2>
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              className="p-4 rounded-xl border border-gray-200 hover:shadow-md hover:border-purple-200 transition-all text-left group"
              onClick={() => {
                console.log(`Navigate to ${action.path}`);
              }}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 group-hover:text-purple-600">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-500">{action.subtitle}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 最近通知 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">最近通知</h2>
          <button className="text-purple-600 text-sm hover:text-purple-700">
            查看全部
          </button>
        </div>
        <div className="space-y-3">
          {recentNotifications.map((notification) => (
            <div key={notification.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mt-0.5 ${
                notification.urgent ? 'bg-red-100' : 'bg-blue-100'
              }`}>
                <Bell className={`w-4 h-4 ${
                  notification.urgent ? 'text-red-600' : 'text-blue-600'
                }`} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 text-sm">{notification.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{notification.content}</p>
                <div className="flex items-center space-x-3 mt-2">
                  <span className="text-xs text-gray-500">{notification.time}</span>
                  {notification.urgent && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                      紧急
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 学习进度卡片 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">本周学习进度</h2>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">课程出勤</span>
              <span className="text-gray-900 font-medium">85%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{width: '85%'}}></div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">作业完成</span>
              <span className="text-gray-900 font-medium">70%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{width: '70%'}}></div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">学习目标</span>
              <span className="text-gray-900 font-medium">92%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full" style={{width: '92%'}}></div>
            </div>
          </div>
        </div>
      </div>

      {/* 推荐功能 */}
      <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-6 border border-purple-100">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <Star className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">发现新功能</h3>
            <p className="text-sm text-gray-600 mb-3">
              试试我们的AI学习助手，它可以帮你制定个性化学习计划！
            </p>
            <button className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors">
              立即体验
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;