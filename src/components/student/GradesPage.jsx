import React, { useState, useEffect } from 'react';
import { 
  Plus, GraduationCap, TrendingUp, TrendingDown, BarChart3, 
  Calendar, Filter, Download, Search, Target, Award, 
  BookOpen, FileText, Eye, EyeOff, Star, AlertCircle
} from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';

const GradesPage = () => {
  const { grades, addGrade } = useAppContext();
  const { t } = useLanguage();
  const [activeView, setActiveView] = useState('overview');
  const [selectedSemester, setSelectedSemester] = useState('current');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPredictions, setShowPredictions] = useState(true);

  // 扩展的成绩数据
  const [gradesData] = useState([
    {
      id: 1,
      course: 'COMP3001',
      courseName: '算法与数据结构',
      credits: 6,
      assignments: [
        { name: '期中考试', grade: 88, weight: 40, date: '2024-03-15', type: 'exam' },
        { name: '编程作业1', grade: 92, weight: 20, date: '2024-02-28', type: 'assignment' },
        { name: '编程作业2', grade: 85, weight: 20, date: '2024-04-10', type: 'assignment' },
        { name: '期末项目', grade: null, weight: 20, date: '2024-05-20', type: 'project' }
      ],
      currentGrade: 89.2,
      predictedFinal: 87.5,
      trend: 'up',
      semester: '2024春',
      status: 'in-progress'
    },
    {
      id: 2,
      course: 'MATH2001',
      courseName: '线性代数',
      credits: 4,
      assignments: [
        { name: '课堂测验1', grade: 75, weight: 15, date: '2024-02-20', type: 'quiz' },
        { name: '课堂测验2', grade: 82, weight: 15, date: '2024-03-20', type: 'quiz' },
        { name: '期中考试', grade: 79, weight: 35, date: '2024-04-05', type: 'exam' },
        { name: '期末考试', grade: null, weight: 35, date: '2024-05-25', type: 'exam' }
      ],
      currentGrade: 78.8,
      predictedFinal: 80.2,
      trend: 'up',
      semester: '2024春',
      status: 'in-progress'
    },
    {
      id: 3,
      course: 'PHYS1001',
      courseName: '大学物理',
      credits: 5,
      assignments: [
        { name: '实验报告1', grade: 90, weight: 25, date: '2024-01-30', type: 'lab' },
        { name: '期中考试', grade: 85, weight: 35, date: '2024-03-10', type: 'exam' },
        { name: '期末考试', grade: 88, weight: 40, date: '2024-05-15', type: 'exam' }
      ],
      currentGrade: 87.25,
      predictedFinal: 87.25,
      trend: 'stable',
      semester: '2024春',
      status: 'completed'
    }
  ]);

  // 计算统计数据
  const calculateStats = () => {
    const completedCourses = gradesData.filter(course => course.status === 'completed');
    const inProgressCourses = gradesData.filter(course => course.status === 'in-progress');
    
    const totalCredits = gradesData.reduce((sum, course) => sum + course.credits, 0);
    const weightedGradeSum = gradesData.reduce((sum, course) => 
      sum + (course.currentGrade * course.credits), 0);
    const gpa = weightedGradeSum / totalCredits / 20; // 假设100分制转5分制
    
    return {
      totalCourses: gradesData.length,
      completedCourses: completedCourses.length,
      inProgressCourses: inProgressCourses.length,
      averageGrade: (weightedGradeSum / totalCredits).toFixed(1),
      gpa: gpa.toFixed(2),
      totalCredits,
      highestGrade: Math.max(...gradesData.map(c => c.currentGrade)),
      lowestGrade: Math.min(...gradesData.map(c => c.currentGrade))
    };
  };

  const stats = calculateStats();

  // 过滤课程
  const filteredCourses = gradesData.filter(course =>
    course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 获取趋势图标和颜色
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  // 获取成绩等级颜色
  const getGradeColor = (grade) => {
    if (grade >= 90) return 'text-green-600';
    if (grade >= 80) return 'text-blue-600';
    if (grade >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  // 获取作业类型图标
  const getAssignmentIcon = (type) => {
    const icons = {
      exam: <FileText className="w-4 h-4" />,
      assignment: <BookOpen className="w-4 h-4" />,
      project: <Target className="w-4 h-4" />,
      quiz: <AlertCircle className="w-4 h-4" />,
      lab: <Award className="w-4 h-4" />
    };
    return icons[type] || <FileText className="w-4 h-4" />;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* 顶部统计卡片 */}
      <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full translate-y-24 -translate-x-24"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">学术表现中心</h1>
              <p className="text-purple-200 text-lg">
                本学期 {stats.totalCourses} 门课程 · {stats.completedCourses} 门已完成
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
              <button
                onClick={() => setShowPredictions(!showPredictions)}
                className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-sm transition-colors"
              >
                {showPredictions ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span className="text-sm">预测成绩</span>
              </button>
              <button className="flex items-center space-x-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-sm transition-colors">
                <Plus className="w-5 h-5" />
                <span>手动添加</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold mb-1">{stats.gpa}</div>
              <div className="text-sm text-purple-200">GPA</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold mb-1">{stats.averageGrade}</div>
              <div className="text-sm text-purple-200">平均分</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold mb-1">{stats.totalCredits}</div>
              <div className="text-sm text-purple-200">总学分</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold mb-1">{stats.highestGrade}</div>
              <div className="text-sm text-purple-200">最高分</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold mb-1">{stats.inProgressCourses}</div>
              <div className="text-sm text-purple-200">进行中</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold mb-1">{stats.completedCourses}</div>
              <div className="text-sm text-purple-200">已完成</div>
            </div>
          </div>
        </div>
      </div>

      {/* 导航和搜索栏 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-4">
            {['overview', 'courses', 'analytics'].map((view) => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                  activeView === view
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {view === 'overview' && '概览'}
                {view === 'courses' && '课程详情'}
                {view === 'analytics' && '学习分析'}
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="搜索课程..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-20 transition-colors"
              />
            </div>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
              <Filter className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 课程列表 */}
      {activeView === 'overview' && (
        <div className="grid gap-6">
          {filteredCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              {/* 课程头部 */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <GraduationCap className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{course.courseName}</h3>
                    <p className="text-gray-600">{course.course} · {course.credits} 学分</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        course.status === 'completed' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {course.status === 'completed' ? '已完成' : '进行中'}
                      </span>
                      {getTrendIcon(course.trend)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${getGradeColor(course.currentGrade)}`}>
                    {course.currentGrade.toFixed(1)}
                  </div>
                  {showPredictions && course.predictedFinal && (
                    <p className="text-sm text-gray-500 mt-1">
                      预测: {course.predictedFinal.toFixed(1)}
                    </p>
                  )}
                </div>
              </div>

              {/* 作业列表 */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700 mb-3">作业与考试</h4>
                {course.assignments.map((assignment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                        {getAssignmentIcon(assignment.type)}
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900">{assignment.name}</h5>
                        <p className="text-sm text-gray-600">
                          权重 {assignment.weight}% · {assignment.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {assignment.grade ? (
                        <div className={`text-lg font-semibold ${getGradeColor(assignment.grade)}`}>
                          {assignment.grade}
                        </div>
                      ) : (
                        <div className="text-gray-400 text-sm">待评分</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* 进度条 */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>课程进度</span>
                  <span>{course.status === 'completed' ? '100%' : '75%'}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: course.status === 'completed' ? '100%' : '75%' }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 学习分析视图 */}
      {activeView === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
              成绩趋势分析
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                <div>
                  <h4 className="font-medium text-green-800">优势学科</h4>
                  <p className="text-sm text-green-600">大学物理 (87.3分)</p>
                </div>
                <Star className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl">
                <div>
                  <h4 className="font-medium text-yellow-800">需要关注</h4>
                  <p className="text-sm text-yellow-600">线性代数 (78.8分)</p>
                </div>
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">学习建议</h3>
            <div className="space-y-3">
              <div className="p-3 bg-purple-50 rounded-xl">
                <p className="text-sm text-purple-700">
                  建议加强线性代数的练习，重点关注矩阵运算部分
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-700">
                  算法课程表现优秀，可以尝试更有挑战性的编程项目
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <p className="text-sm text-green-700">
                  保持当前学习节奏，有望获得优秀的期末成绩
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradesPage;