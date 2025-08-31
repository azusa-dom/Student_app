import React, { useState, useEffect } from 'react';
import { 
  Phone, Mail, MapPin, Calendar, TrendingUp, TrendingDown, 
  AlertTriangle, CheckCircle, Clock, Book, GraduationCap, 
  Settings, Bell, RefreshCw, Eye, EyeOff, MessageCircle,
  FileText, Download, Share2, Heart, Star, Award,
  BarChart3, PieChart, Activity, Users, Home, Shield
} from 'lucide-react';
import ParentAIChat from './ParentAIChat';

const EnhancedParentDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('overview');
  const [showDetailedGrades, setShowDetailedGrades] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showAI, setShowAI] = useState(false);
  const [childData, setChildData] = useState({
    name: "张小明",
    university: "University College London", 
    programme: "Computer Science - Year 2",
    avatar: "🎓",
    status: "online",
    lastSeen: "2分钟前"
  });

  // 成绩数据
  const [gradesData, setGradesData] = useState([
    {
      course: 'COMP3001',
      courseName: '算法与数据结构',
      grade: 88,
      assignment: '期中考试',
      date: '2024-03-15',
      trend: 'up',
      weight: 40,
      feedback: '表现优秀，算法理解深入'
    },
    {
      course: 'MATH2001', 
      courseName: '线性代数',
      grade: 85,
      assignment: '课程作业2',
      date: '2024-03-12',
      trend: 'stable',
      weight: 25,
      feedback: '计算准确，需加强证明逻辑'
    },
    {
      course: 'PHYS1001',
      courseName: '大学物理',
      grade: 92,
      assignment: '实验报告',
      date: '2024-03-10',
      trend: 'up',
      weight: 30,
      feedback: '实验设计优秀，分析透彻'
    }
  ]);

  // 近期活动
  const [recentActivities, setRecentActivities] = useState([
    {
      type: 'attendance',
      title: '出席算法课程',
      time: '2小时前',
      status: 'success',
      details: 'COMP3001 - 准时出席'
    },
    {
      type: 'assignment',
      title: '提交线性代数作业',
      time: '1天前', 
      status: 'success',
      details: '按时提交，等待评分'
    },
    {
      type: 'grade',
      title: '收到物理实验成绩',
      time: '2天前',
      status: 'excellent',
      details: '92分 - 超出预期表现'
    },
    {
      type: 'social',
      title: '参加中国学生会活动',
      time: '3天前',
      status: 'info',
      details: '文化交流活动 - 积极参与'
    }
  ]);

  // 更新时间
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // 模拟数据刷新
  const handleRefresh = async () => {
    setRefreshing(true);
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 更新最后查看时间
    setChildData(prev => ({
      ...prev,
      lastSeen: "刚刚"
    }));
    
    setRefreshing(false);
    
    // 显示成功提示
    const notification = {
      id: Date.now(),
      type: 'success',
      message: '数据已更新',
      time: new Date()
    };
    setNotifications(prev => [notification, ...prev.slice(0, 4)]);
  };

  // 联系功能
  const handleContact = (method, target) => {
    switch (method) {
      case 'call-student':
        window.location.href = 'tel:+447700123456';
        break;
      case 'message-student':
        alert('正在打开微信/WhatsApp...');
        break;
      case 'email-student': 
        window.location.href = 'mailto:zhang.ming.23@ucl.ac.uk';
        break;
      case 'call-school':
        window.location.href = 'tel:+442076792000';
        break;
      case 'email-school':
        window.location.href = 'mailto:student.services@ucl.ac.uk';
        break;
      default:
        alert(`联系方式: ${method} - ${target}`);
    }
  };

  // 下载报告
  const handleDownloadReport = (type) => {
    // 模拟报告下载
    const reportTypes = {
      weekly: '周度学习报告',
      monthly: '月度综合报告', 
      grades: '成绩单详情',
      attendance: '出勤记录'
    };
    
    alert(`正在下载 ${reportTypes[type]}...`);
    
    // 实际实现中会调用下载API
    const link = document.createElement('a');
    link.href = '#';
    link.download = `${reportTypes[type]}_${new Date().toISOString().split('T')[0]}.pdf`;
    link.click();
  };

  // 计算整体成绩
  const calculateOverallGrade = () => {
    const totalWeightedGrade = gradesData.reduce((sum, item) => sum + (item.grade * item.weight), 0);
    const totalWeight = gradesData.reduce((sum, item) => sum + item.weight, 0);
    return Math.round(totalWeightedGrade / totalWeight);
  };

  // 获取趋势图标
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  // 获取状态颜色
  const getStatusColor = (status) => {
    const colors = {
      success: 'text-green-600 bg-green-50 border-green-200',
      excellent: 'text-blue-600 bg-blue-50 border-blue-200', 
      warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      info: 'text-purple-600 bg-purple-50 border-purple-200'
    };
    return colors[status] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  // 获取活动图标
  const getActivityIcon = (type) => {
    const icons = {
      attendance: <CheckCircle className="w-5 h-5" />,
      assignment: <FileText className="w-5 h-5" />,
      grade: <Award className="w-5 h-5" />,
      social: <Users className="w-5 h-5" />
    };
    return icons[type] || <Activity className="w-5 h-5" />;
  };

  const overallGrade = calculateOverallGrade();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* 顶部导航栏 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                家
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">家长监护中心</h1>
                <p className="text-gray-600 text-sm">实时关注孩子的学习生活</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-right text-sm text-gray-600">
                <div>当地时间: {currentTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</div>
                <div>最后同步: {childData.lastSeen}</div>
              </div>
              
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>刷新</span>
              </button>

              <button
                onClick={() => alert('设置页面')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 孩子信息卡片 */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center space-x-6 mb-6 lg:mb-0">
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center text-4xl backdrop-blur-sm">
                  {childData.avatar}
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2">{childData.name}</h2>
                  <p className="text-blue-100 text-lg mb-1">{childData.university}</p>
                  <p className="text-blue-200">{childData.programme}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-blue-100 text-sm">在线活跃</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">{overallGrade}%</div>
                  <div className="text-blue-200 text-sm">综合成绩</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">94%</div>
                  <div className="text-blue-200 text-sm">出勤率</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">12</div>
                  <div className="text-blue-200 text-sm">本周课程</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">3</div>
                  <div className="text-blue-200 text-sm">待交作业</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 通知栏 */}
        {notifications.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">{notifications[0].message}</span>
              <span className="text-green-600 text-sm">({notifications[0].time.toLocaleTimeString()})</span>
            </div>
          </div>
        )}

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 左侧：成绩和学习情况 */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 最新成绩 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">最新成绩</h3>
                    <p className="text-gray-600 text-sm">学业表现追踪</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowDetailedGrades(!showDetailedGrades)}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    {showDetailedGrades ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span>{showDetailedGrades ? '简化视图' : '详细视图'}</span>
                  </button>
                  
                  <button
                    onClick={() => handleDownloadReport('grades')}
                    className="flex items-center space-x-1 text-gray-600 hover:text-gray-700 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>下载</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {gradesData.map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-bold text-gray-900">{item.courseName}</h4>
                          {getTrendIcon(item.trend)}
                        </div>
                        <p className="text-gray-600 text-sm">{item.course} • {item.assignment}</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${
                          item.grade >= 90 ? 'text-green-600' : 
                          item.grade >= 80 ? 'text-blue-600' : 
                          item.grade >= 70 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {item.grade}%
                        </div>
                        <p className="text-gray-500 text-xs">{item.date}</p>
                      </div>
                    </div>
                    
                    {showDetailedGrades && (
                      <div className="pt-3 border-t border-gray-200">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">权重占比</span>
                          <span className="text-sm font-medium">{item.weight}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(item.grade / 100) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-700 bg-white p-3 rounded-lg border">
                          <span className="font-medium">教师反馈：</span>{item.feedback}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* AI 分析报告 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">AI 学习分析</h3>
                  <p className="text-gray-600 text-sm">智能学习建议</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 优势分析 */}
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Star className="w-5 h-5 text-green-600" />
                    <h4 className="font-bold text-green-800">学习优势</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-green-700">
                    <li>• 物理实验能力突出 (92分)</li>
                    <li>• 算法理解能力强</li>
                    <li>• 出勤率保持优秀</li>
                  </ul>
                </div>

                {/* 改进建议 */}
                <div className="bg-yellow-50 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <h4 className="font-bold text-yellow-800">改进建议</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-yellow-700">
                    <li>• 加强数学证明逻辑训练</li>
                    <li>• 提前准备期末考试</li>
                    <li>• 参与更多学术讨论</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                <h4 className="font-bold text-blue-800 mb-2">本月学习趋势</h4>
                <p className="text-blue-700 text-sm">
                  整体表现稳中有升，建议保持当前学习节奏。物理和算法课程表现优异，
                  数学课程需要额外关注。预计期末成绩可达到85-90分区间。
                </p>
              </div>
            </div>

            {/* AI 智能对话 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">AI 智能助手</h3>
                  <p className="text-gray-600 text-sm">个性化学习建议与问答</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">AI</span>
                  </div>
                  <span className="font-medium text-gray-900">智能助手</span>
                </div>
                <p className="text-gray-700 text-sm">
                  您好！我可以帮您分析孩子的学习情况，回答关于成绩、出勤、作业的问题，
                  并提供个性化的学习建议。
                </p>
              </div>

              <button
                onClick={() => setShowAI(true)}
                className="w-full flex items-center justify-center space-x-2 p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="font-medium">开始 AI 对话</span>
              </button>
            </div>
          </div>

          {/* 右侧：活动和联系 */}
          <div className="space-y-6">
            
            {/* 最近活动 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">最近活动</h3>
                  <p className="text-gray-600 text-sm">实时动态追踪</p>
                </div>
              </div>

              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className={`flex items-start space-x-3 p-3 rounded-lg border ${getStatusColor(activity.status)}`}>
                    <div className={`flex-shrink-0 ${activity.status === 'success' ? 'text-green-600' : activity.status === 'excellent' ? 'text-blue-600' : activity.status === 'warning' ? 'text-yellow-600' : 'text-purple-600'}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{activity.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{activity.details}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => alert('查看完整活动历史')}
                className="w-full mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                查看更多活动 →
              </button>
            </div>

            {/* 紧急联系 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <Phone className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">联系方式</h3>
                  <p className="text-gray-600 text-sm">一键联系</p>
                </div>
              </div>

              <div className="space-y-3">
                {/* 联系孩子 */}
                <div className="bg-blue-50 rounded-xl p-4">
                  <h4 className="font-medium text-blue-800 mb-3">联系 {childData.name}</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleContact('call-student')}
                      className="flex flex-col items-center space-y-1 p-3 bg-white rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Phone className="w-5 h-5 text-blue-600" />
                      <span className="text-xs text-blue-800">电话</span>
                    </button>
                    <button
                      onClick={() => handleContact('message-student')}
                      className="flex flex-col items-center space-y-1 p-3 bg-white rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <MessageCircle className="w-5 h-5 text-blue-600" />
                      <span className="text-xs text-blue-800">消息</span>
                    </button>
                    <button
                      onClick={() => handleContact('email-student')}
                      className="flex flex-col items-center space-y-1 p-3 bg-white rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Mail className="w-5 h-5 text-blue-600" />
                      <span className="text-xs text-blue-800">邮件</span>
                    </button>
                  </div>
                </div>

                {/* 联系学校 */}
                <div className="bg-green-50 rounded-xl p-4">
                  <h4 className="font-medium text-green-800 mb-3">联系 UCL</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleContact('call-school')}
                      className="flex flex-col items-center space-y-1 p-3 bg-white rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <Phone className="w-5 h-5 text-green-600" />
                      <span className="text-xs text-green-800">学校热线</span>
                    </button>
                    <button
                      onClick={() => handleContact('email-school')}
                      className="flex flex-col items-center space-y-1 p-3 bg-white rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <Mail className="w-5 h-5 text-green-600" />
                      <span className="text-xs text-green-800">学生服务</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 快速操作 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">快速操作</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleDownloadReport('weekly')}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">下载周报</span>
                  </div>
                  <Download className="w-4 h-4 text-gray-400" />
                </button>
                
                <button
                  onClick={() => handleDownloadReport('monthly')}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">月度报告</span>
                  </div>
                  <Download className="w-4 h-4 text-gray-400" />
                </button>
                
                <button
                  onClick={() => alert('分享功能')}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Share2 className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">分享进度</span>
                  </div>
                  <div className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAI && <ParentAIChat onClose={() => setShowAI(false)} />}
    </div>
  );
};

export default EnhancedParentDashboard;