import React, { useState, useEffect } from 'react';
import { Search, Bell, Settings, Globe, Star, Archive, Trash2, Edit3, Plus, GraduationCap } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';

const MailPage = () => {
  const { user, grades, addGrade } = useAppContext();
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAISorting, setIsAISorting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGrade, setNewGrade] = useState({ course: '', assignment: '', grade: '' });

  // 邮件数据
  const [emails, setEmails] = useState([
    {
      id: 1,
      sender: {
        name: 'Prof. Smith',
        avatar: 'PS',
        category: '学术导师',
        type: 'prof'
      },
      subject: 'Assignment 2 Feedback - Urgent Review Required',
      preview: '你好张伟，关于你提交的Assignment 2，我需要和你讨论一些重要的修改建议。请查看附件中的详细反馈，并安排时间进行一对一讨论...',
      timestamp: '2小时前',
      priority: 'high',
      isRead: false,
      isUrgent: true,
      tags: ['作业反馈', '重要'],
      type: 'assignment'
    },
    {
      id: 2,
      sender: {
        name: 'UCL Registry',
        avatar: 'UR',
        category: '学校官方',
        type: 'registry'
      },
      subject: 'Semester Results Available - Check Your Portal',
      preview: '亲爱的学生，您的本学期成绩已经公布，请登录学生门户网站查看详细成绩单。如有任何疑问，请联系学术事务办公室...',
      timestamp: '1天前',
      priority: 'medium',
      isRead: false,
      isUrgent: false,
      tags: ['成绩通知', '官方'],
      type: 'notification'
    },
    {
      id: 3,
      sender: {
        name: 'Career Services',
        avatar: 'CS',
        category: '职业服务',
        type: 'career'
      },
      subject: 'Tech Career Fair 2024 - Registration Now Open',
      preview: '技术职业博览会2024即将开始报名！这是与顶尖科技公司面对面交流的绝佳机会，包括Google、Microsoft、Amazon等知名企业...',
      timestamp: '3天前',
      priority: 'normal',
      isRead: true,
      isUrgent: false,
      tags: ['职业发展', '招聘会'],
      type: 'career'
    }
  ]);

  // 统计数据
  const mailStats = {
    urgent: emails.filter(email => email.isUrgent).length,
    pending: emails.filter(email => !email.isRead).length,
    assignments: emails.filter(email => email.type === 'assignment').length,
    accuracy: 95
  };

  // 筛选标签
  const filterTabs = [
    { id: 'all', label: '全部', count: emails.length },
    { id: 'assignment', label: '作业', count: emails.filter(e => e.type === 'assignment').length },
    { id: 'notification', label: '通知', count: emails.filter(e => e.type === 'notification').length },
    { id: 'promotion', label: '推广', count: 0 },
    { id: 'spam', label: '垃圾邮件', count: 0 },
    { id: 'read', label: '已读', count: emails.filter(e => e.isRead).length },
    { id: 'unread', label: '未读', count: emails.filter(e => !e.isRead).length }
  ];

  // 过滤邮件
  const filteredEmails = emails.filter(email => {
    const matchesSearch = searchTerm === '' || 
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.preview.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.sender.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = activeFilter === 'all' || 
      (activeFilter === 'read' && email.isRead) ||
      (activeFilter === 'unread' && !email.isRead) ||
      email.type === activeFilter;

    return matchesSearch && matchesFilter;
  });

  // 获取发件人头像样式
  const getAvatarStyle = (type) => {
    const styles = {
      prof: 'bg-gradient-to-r from-blue-500 to-blue-600',
      registry: 'bg-gradient-to-r from-green-500 to-green-600',
      career: 'bg-gradient-to-r from-amber-500 to-amber-600'
    };
    return styles[type] || 'bg-gradient-to-r from-gray-500 to-gray-600';
  };

  // 获取邮件标签样式
  const getTagStyle = (tag) => {
    if (tag.includes('作业') || tag.includes('反馈')) return 'bg-blue-50 text-blue-600';
    if (tag.includes('通知') || tag.includes('官方')) return 'bg-green-50 text-green-600';
    if (tag.includes('职业') || tag.includes('招聘')) return 'bg-amber-50 text-amber-600';
    return 'bg-gray-50 text-gray-600';
  };

  // AI智能排序
  const handleAISort = () => {
    setIsAISorting(true);
    setTimeout(() => {
      // 模拟AI排序：按优先级和时间排序
      const sorted = [...emails].sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, normal: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.timestamp) - new Date(a.timestamp);
      });
      setEmails(sorted);
      setIsAISorting(false);
    }, 2000);
  };

  // 邮件操作
  const handleEmailAction = (emailId, action, event) => {
    event.stopPropagation();
    
    setEmails(prevEmails => {
      return prevEmails.map(email => {
        if (email.id === emailId) {
          switch (action) {
            case 'star':
              return { ...email, isStarred: !email.isStarred };
            case 'read':
              return { ...email, isRead: !email.isRead };
            default:
              return email;
          }
        }
        return email;
      }).filter(email => {
        if (action === 'delete' && email.id === emailId) {
          return false;
        }
        return true;
      });
    });

    if (action === 'archive') {
      // 归档动画效果
      setTimeout(() => {
        setEmails(prev => prev.filter(email => email.id !== emailId));
      }, 300);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewGrade(prev => ({ ...prev, [name]: value }));
  };

  const handleAddGrade = (e) => {
    e.preventDefault();
    if (!newGrade.course || !newGrade.grade) {
      alert('课程名称和成绩不能为空！');
      return;
    }
    addGrade({
      ...newGrade,
      assignment: newGrade.assignment || '综合评估',
      date: new Date().toLocaleDateString('zh-CN')
    });
    setNewGrade({ course: '', assignment: '', grade: '' });
    setShowAddForm(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* 顶部导航 */}
      <div className="bg-white border-b border-gray-200 -mx-4 px-4 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold">
              张
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">智能邮件中心</h1>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>02:53 已同步</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Globe className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* AI智能摘要 */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-10 rounded-full -mr-24 -mt-24"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center text-xl backdrop-blur-sm">
              🤖
            </div>
            <div>
              <h2 className="text-xl font-semibold">今日邮件摘要</h2>
              <p className="text-purple-100">AI为您智能分析和归类邮件内容</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: '紧急邮件', value: mailStats.urgent },
              { label: '待处理', value: mailStats.pending },
              { label: '作业相关', value: mailStats.assignments },
              { label: '分类准确率', value: `${mailStats.accuracy}%` }
            ].map((stat, index) => (
              <div key={index} className="text-center bg-white bg-opacity-10 rounded-xl p-3 backdrop-blur-sm">
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-purple-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 搜索和过滤栏 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        {/* 搜索栏 */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="搜索邮件内容、发件人或关键词..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-20 transition-colors"
            />
          </div>
          <button
            onClick={handleAISort}
            disabled={isAISorting}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:transform-none flex items-center space-x-2"
          >
            {isAISorting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>AI排序中...</span>
              </>
            ) : (
              <>
                <span>🧠</span>
                <span>AI智能排序</span>
              </>
            )}
          </button>
        </div>

        {/* 过滤标签 */}
        <div className="flex flex-wrap gap-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeFilter === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                  activeFilter === tab.id ? 'bg-white text-purple-600' : 'bg-red-500 text-white'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 邮件列表 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredEmails.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              📧
            </div>
            <p className="text-gray-500">没有找到匹配的邮件</p>
          </div>
        ) : (
          filteredEmails.map((email, index) => (
            <div
              key={email.id}
              className={`p-6 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors relative ${
                !email.isRead ? 'bg-purple-50 bg-opacity-50 border-l-4 border-l-purple-500' : ''
              } ${
                email.isUrgent ? 'border-l-4 border-l-red-500 bg-red-50 bg-opacity-30' : ''
              }`}
            >
              {/* 邮件头部 */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-semibold ${getAvatarStyle(email.sender.type)}`}>
                    {email.sender.avatar}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{email.sender.name}</h3>
                    <p className="text-sm text-gray-500">{email.sender.category}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500">{email.timestamp}</span>
                  {email.priority === 'high' && (
                    <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                      紧急
                    </span>
                  )}
                  {email.priority === 'medium' && (
                    <span className="px-2 py-1 bg-amber-100 text-amber-600 text-xs font-medium rounded-full">
                      重要
                    </span>
                  )}
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleEmailAction(email.id, 'star', e)}
                      className="p-1.5 text-gray-400 hover:text-amber-500 rounded-lg hover:bg-amber-50 transition-colors"
                    >
                      <Star className={`w-4 h-4 ${email.isStarred ? 'fill-amber-500 text-amber-500' : ''}`} />
                    </button>
                    <button
                      onClick={(e) => handleEmailAction(email.id, 'archive', e)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleEmailAction(email.id, 'delete', e)}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* 邮件内容 */}
              <div className="mb-3">
                <h4 className="font-semibold text-gray-900 mb-1">{email.subject}</h4>
                <p className="text-gray-600 text-sm line-clamp-2">{email.preview}</p>
              </div>

              {/* 邮件标签 */}
              <div className="flex flex-wrap gap-2">
                {email.tags.map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className={`px-2 py-1 text-xs font-medium rounded-lg ${getTagStyle(tag)}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* AI建议面板 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
            💡
          </div>
          <h3 className="text-lg font-semibold text-gray-900">AI智能建议</h3>
        </div>
        <div className="space-y-3">
          {[
            'Prof. Smith的邮件标记为紧急，建议优先回复并安排面谈时间',
            '成绩通知邮件可以自动添加到日历提醒中，避免错过重要截止日期',
            '职业博览会信息建议转发给感兴趣的同学，增加networking机会'
          ].map((suggestion, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors">
              <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
              <p className="text-sm text-gray-700">{suggestion}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 浮动写邮件按钮 */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-110 flex items-center justify-center z-50">
        <Edit3 className="w-6 h-6" />
      </button>

      {/* 成绩管理表单 */}
      <div className="max-w-4xl mx-auto mt-8">
        <div className="relative bg-gradient-to-tr from-emerald-600 via-green-500 to-teal-400 rounded-3xl p-8 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full translate-y-24 -translate-x-24"></div>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">成绩管理</h2>
              <p className="text-emerald-100 text-lg">本学期已更新 {grades.length} 门课程成绩</p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="relative group px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl backdrop-blur-lg transition-all duration-300"
            >
              <div className="flex items-center space-x-2">
                <Plus className={`w-5 h-5 text-white transition-transform duration-500 ${showAddForm ? 'rotate-45' : 'group-hover:rotate-180'}`} />
                <span className="font-medium text-white">{showAddForm ? '取消添加' : '手动添加'}</span>
              </div>
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddGrade} className="bg-black/10 rounded-2xl p-4 mb-4 backdrop-blur-sm animate-fade-in-down">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input
                  type="text"
                  name="course"
                  value={newGrade.course}
                  onChange={handleInputChange}
                  placeholder="课程名称 (必填)"
                  className="w-full bg-white/10 text-white placeholder-emerald-200/70 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <input
                  type="text"
                  name="assignment"
                  value={newGrade.assignment}
                  onChange={handleInputChange}
                  placeholder="作业/考试名称"
                  className="w-full bg-white/10 text-white placeholder-emerald-200/70 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <input
                  type="text"
                  name="grade"
                  value={newGrade.grade}
                  onChange={handleInputChange}
                  placeholder="成绩 (必填)"
                  className="w-full bg-white/10 text-white placeholder-emerald-200/70 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
              <button type="submit" className="w-full px-6 py-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-lg transition-all duration-300 font-semibold">
                确认添加
              </button>
            </form>
          )}

          <div className="grid grid-cols-3 gap-6">
            {grades.map((grade, index) => (
              <div key={index} className="bg-white rounded-2xl p-4 shadow-md flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{grade.course}</h3>
                  <p className="text-sm text-gray-500">{grade.assignment}</p>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="text-2xl font-bold text-emerald-600">{grade.grade}</div>
                  <button
                    onClick={() => {}}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                  >
                    查看详情
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MailPage;