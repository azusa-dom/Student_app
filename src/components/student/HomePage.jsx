import React from 'react';
import { ExternalLink, Calendar, GraduationCap } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import SmartCard from '../SmartCard';

const HomePage = () => {
  const { events, grades, setStudentTab } = useAppContext();

  // 动态计算概览数据
  const todayClassesCount = events.filter(e => e.type === 'class_event' && new Date(e.start_at).toDateString() === new Date().toDateString()).length;
  const pendingAssignmentsCount = events.filter(e => e.type === 'assignment_due' && new Date(e.due_at) > new Date()).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h2 className="text-2xl font-bold mb-2 text-gray-900">今日概览</h2>
          <p className="text-gray-600 mb-6">你今天有 {events.length} 个重要事项需要关注</p>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-100">
              <div className="text-3xl font-bold mb-1 text-blue-600">{todayClassesCount}</div>
              <div className="text-sm text-blue-700">今日课程</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center border border-orange-100">
              <div className="text-3xl font-bold mb-1 text-orange-600">{pendingAssignmentsCount}</div>
              <div className="text-sm text-orange-700">待交作业</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center border border-green-100">
              <div className="text-3xl font-bold mb-1 text-green-600">{grades.length}</div>
              <div className="text-sm text-green-700">新成绩</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">智能卡片流</h3>
          {events.map(event => <SmartCard key={event.id} event={event} />)}
        </div>
      </div>

      <div className="space-y-6">
        <div className="relative group">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 group-hover:shadow-2xl group-hover:shadow-gray-300/50 transition-all duration-300"></div>
          <div className="relative p-6">
            <h3 className="font-semibold text-gray-900 mb-4">快速操作</h3>
            <div className="space-y-3">
              <button onClick={() => window.open('https://moodle.ucl.ac.uk/', '_blank')} className="w-full flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-200/50 transition-all duration-300 group">
                <ExternalLink className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                <span className="font-medium">打开Moodle</span>
              </button>
              <button onClick={() => setStudentTab && setStudentTab('calendar')} className="w-full flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-green-50 to-green-100/50 hover:from-green-100 hover:to-green-200/50 transition-all duration-300 group">
                <Calendar className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" />
                <span className="font-medium">查看课程表</span>
              </button>
              <button onClick={() => setStudentTab && setStudentTab('grades')} className="w-full flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100/50 hover:from-purple-100 hover:to-purple-200/50 transition-all duration-300 group">
                <GraduationCap className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" />
                <span className="font-medium">查看成绩</span>
              </button>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 group-hover:shadow-2xl group-hover:shadow-gray-300/50 transition-all duration-300"></div>
          <div className="relative p-6">
            <h3 className="font-semibold text-gray-900 mb-4">最新成绩</h3>
            <div className="space-y-3">
              {grades.slice(0, 3).map((grade, index) => (
                <div key={index} className="group flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100/50 hover:from-gray-100 hover:to-gray-200/50 transition-all duration-300">
                  <div>
                    <div className="font-medium text-gray-900">{grade.course}</div>
                    <div className="text-sm text-gray-600">{grade.assignment}</div>
                  </div>
                  <div className="text-lg font-bold text-emerald-600 group-hover:scale-110 transition-transform">{grade.grade}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
