// src/components/student/UserActivityManagement.jsx
import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, MapPin, Users, Heart, Check, X, 
  ExternalLink, RefreshCw, Trash2, Download, BarChart3
} from 'lucide-react';
import { activityService } from '../../services/ActivityService';

export const UserActivityManagement = () => {
  const [userActivities, setUserActivities] = useState({
    registered: { activities: [], count: 0 },
    interested: { activities: [], count: 0 }
  });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('registered');

  useEffect(() => {
    loadUserActivities();
    loadStats();
  }, []);

  const loadUserActivities = () => {
    setLoading(true);
    try {
      const activities = activityService.getUserActivities();
      setUserActivities(activities);
    } catch (error) {
      console.error('Failed to load user activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = () => {
    try {
      const activityStats = activityService.getActivityStats();
      setStats(activityStats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleUnregister = (activityId) => {
    if (window.confirm('确定要取消报名吗？')) {
      const result = activityService.unregisterFromActivity(activityId);
      if (result.success) {
        loadUserActivities();
        showNotification(result.message, 'success');
      } else {
        showNotification(result.message, 'error');
      }
    }
  };

  const handleRemoveInterest = (activityId) => {
    const result = activityService.toggleInterest(activityId);
    if (result.success) {
      loadUserActivities();
      showNotification('已从感兴趣列表移除', 'info');
    }
  };

  const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
      type === 'success' ? 'bg-green-500 text-white' : 
      type === 'error' ? 'bg-red-500 text-white' : 
      'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  };

  const exportActivityData = () => {
    try {
      const exportResult = activityService.exportData();
      if (exportResult.success) {
        const blob = new Blob([exportResult.json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `my_activities_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showNotification('活动数据已导出', 'success');
      } else {
        showNotification(exportResult.message, 'error');
      }
    } catch (error) {
      showNotification('导出失败', 'error');
    }
  };

  const ActivityCard = ({ activity, type, onAction }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1">{activity.title}</h4>
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{activity.description}</p>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{activity.date}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{activity.time}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>{activity.location}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">主办: {activity.organizer}</span>
            <span className={`px-2 py-1 text-xs rounded-full ${
              activity.type === 'club' ? 'bg-green-100 text-green-700' :
              activity.type === 'career' ? 'bg-blue-100 text-blue-700' :
              'bg-purple-100 text-purple-700'
            }`}>
              {activity.type === 'club' ? '社团' : 
               activity.type === 'career' ? '职业' : '官方'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          {activity.url && (
            <button
              onClick={() => window.open(activity.url, '_blank')}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
            >
              <ExternalLink className="w-3 h-3" />
              <span>详情</span>
            </button>
          )}
          
          {activity.participants && (
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Users className="w-3 h-3" />
              <span>{activity.participants}/{activity.maxParticipants}</span>
            </div>
          )}
        </div>

        <button
          onClick={() => onAction(activity.id)}
          className={`flex items-center space-x-1 px-3 py-1 rounded text-xs font-medium ${
            type === 'registered' 
              ? 'bg-red-100 text-red-600 hover:bg-red-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <X className="w-3 h-3" />
          <span>{type === 'registered' ? '取消报名' : '取消关注'}</span>
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-300 rounded w-1/4"></div>
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 统计信息 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.registered}</div>
            <div className="text-sm text-blue-700">已报名活动</div>
          </div>
          <div className="bg-pink-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-pink-600">{stats.interested}</div>
            <div className="text-sm text-pink-700">感兴趣活动</div>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.upcoming}</div>
            <div className="text-sm text-green-700">即将到来</div>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.total}</div>
            <div className="text-sm text-purple-700">活动总数</div>
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex items-center justify-between">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('registered')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              activeTab === 'registered' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            已报名活动 ({userActivities.registered.count})
          </button>
          <button
            onClick={() => setActiveTab('interested')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              activeTab === 'interested' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            感兴趣活动 ({userActivities.interested.count})
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadUserActivities}
            className="flex items-center space-x-1 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>刷新</span>
          </button>
          
          <button
            onClick={exportActivityData}
            className="flex items-center space-x-1 px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 text-sm"
          >
            <Download className="w-4 h-4" />
            <span>导出</span>
          </button>
        </div>
      </div>

      {/* 活动列表 */}
      <div className="space-y-4">
        {activeTab === 'registered' ? (
          userActivities.registered.activities.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
              <Check className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>您还没有报名任何活动</p>
              <p className="text-sm">去发现一些有趣的活动吧！</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userActivities.registered.activities.map(activity => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  type="registered"
                  onAction={handleUnregister}
                />
              ))}
            </div>
          )
        ) : (
          userActivities.interested.activities.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
              <Heart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>您还没有关注任何活动</p>
              <p className="text-sm">标记感兴趣的活动，随时关注最新动态</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userActivities.interested.activities.map(activity => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  type="interested"
                  onAction={handleRemoveInterest}
                />
              ))}
            </div>
          )
        )}
      </div>

      {/* 活动类型统计 */}
      {stats && stats.byType && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">活动类型分布</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.byType).map(([type, count]) => (
              <div key={type} className="text-center">
                <div className="text-xl font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-600">
                  {type === 'club' ? '社团活动' :
                   type === 'career' ? '职业发展' :
                   type === 'official' ? '官方活动' : type}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// 使用命名导出，便于按需加载