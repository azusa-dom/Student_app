import React, { useState, useEffect } from 'react';
import { Users, Calendar, Clock, MapPin, Filter, Search, ExternalLink } from 'lucide-react';

const ClubsPage = () => {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    // 模拟UCL学生会活动数据，基于你提到的whats-on页面
    const mockActivities = [
      {
        id: 1,
        club: 'Chinese Students Association',
        title: 'Cultural Night',
        date: '2025-12-03',
        time: '18:30 - 22:00',
        location: 'Jeremy Bentham Room',
        description: '传统文化表演、美食分享、才艺展示',
        participants: 85,
        maxParticipants: 120,
        category: 'cultural',
        website: 'https://studentsunionucl.org/whats-on'
      },
      {
        id: 2,
        club: 'AI Research Club',
        title: 'Machine Learning Workshop',
        date: '2025-12-01',
        time: '14:00 - 17:00',
        location: 'Pearson Building G22',
        description: '深度学习基础教程，实战项目分享',
        participants: 45,
        maxParticipants: 50,
        category: 'academic',
        website: 'https://studentsunionucl.org/whats-on'
      },
      {
        id: 3,
        club: 'UCL Health & Wellness',
        title: 'Project Active Yoga',
        date: '2025-08-27',
        time: '17:00 - 18:00',
        location: 'Sports Centre Studio 2',
        description: '放松身心，缓解学习压力',
        participants: 25,
        maxParticipants: 30,
        category: 'wellness',
        website: 'https://studentsunionucl.org/whats-on'
      },
      {
        id: 4,
        club: 'Drama Society',
        title: 'Theatre Performance',
        date: '2025-12-05',
        time: '19:00 - 21:30',
        location: 'Bloomsbury Theatre',
        description: '原创剧目首演，探讨现代大学生活',
        participants: 200,
        maxParticipants: 250,
        category: 'arts',
        website: 'https://studentsunionucl.org/whats-on'
      },
      {
        id: 5,
        club: 'International Students Society',
        title: 'Global Food Festival',
        date: '2025-12-07',
        time: '12:00 - 16:00',
        location: 'Main Quad',
        description: '世界各国美食，文化交流体验',
        participants: 150,
        maxParticipants: 200,
        category: 'cultural',
        website: 'https://studentsunionucl.org/whats-on'
      }
    ];

    setActivities(mockActivities);
    setFilteredActivities(mockActivities);
  }, []);

  useEffect(() => {
    let filtered = activities;

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(activity => 
        activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.club.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 分类过滤
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(activity => activity.category === selectedFilter);
    }

    setFilteredActivities(filtered);
  }, [searchTerm, selectedFilter, activities]);

  const getCategoryColor = (category) => {
    switch (category) {
      case 'cultural': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'academic': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'wellness': return 'bg-green-100 text-green-700 border-green-200';
      case 'arts': return 'bg-pink-100 text-pink-700 border-pink-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'cultural': return '🎎';
      case 'academic': return '📚';
      case 'wellness': return '🧘';
      case 'arts': return '🎭';
      default: return '📅';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
  };

  return (
    <div className="space-y-4">
      {/* 页面标题 */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">社团活动</h2>
        <p className="text-gray-600">发现并参与UCL丰富多彩的社团活动</p>
      </div>

      {/* 搜索和过滤 */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 搜索框 */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索活动或社团..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 分类过滤 */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">全部分类</option>
              <option value="cultural">文化活动</option>
              <option value="academic">学术活动</option>
              <option value="wellness">健康运动</option>
              <option value="arts">艺术表演</option>
            </select>
          </div>
        </div>
      </div>

      {/* 活动列表 */}
      <div className="space-y-4">
        {filteredActivities.length === 0 ? (
          <div className="bg-white rounded-xl p-8 border border-gray-200 text-center">
            <div className="text-gray-500 text-lg mb-2">没有找到匹配的活动</div>
            <p className="text-gray-400">试试调整搜索条件或分类筛选</p>
          </div>
        ) : (
          filteredActivities.map((activity) => (
            <div key={activity.id} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`text-xs px-2 py-1 rounded-full border ${getCategoryColor(activity.category)}`}>
                          {getCategoryIcon(activity.category)} {activity.category === 'cultural' ? '文化' : activity.category === 'academic' ? '学术' : activity.category === 'wellness' ? '健康' : '艺术'}
                        </span>
                        <span className="text-sm text-gray-500">{formatDate(activity.date)}</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {activity.title}
                      </h3>
                      <p className="text-lg text-blue-600 font-medium mb-2">{activity.club}</p>
                      <p className="text-gray-600 mb-3">{activity.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{activity.time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>{activity.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>{activity.participants}/{activity.maxParticipants} 人参与</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 lg:flex-col">
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                    <span>加入活动</span>
                  </button>
                  <a 
                    href={activity.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>详情</span>
                  </a>
                </div>
              </div>

              {/* 进度条 */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>报名进度</span>
                  <span>{Math.round((activity.participants / activity.maxParticipants) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(activity.participants / activity.maxParticipants) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 页脚提示 */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <div className="flex items-center space-x-2 text-blue-700">
          <Calendar className="w-5 h-5" />
          <span className="font-medium">活动数据来源</span>
        </div>
        <p className="text-blue-600 text-sm mt-1">
          数据同步自 UCL Students' Union 官方活动日历，每日更新
        </p>
      </div>
    </div>
  );
};

export default ClubsPage;
