import React from 'react';
import { User, Settings, Calendar, GraduationCap, Phone, Mail } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { getEventIcon, getEventColor, formatTimeRemaining } from '../../utils/helpers';

const ParentDashboard = () => {
  const { currentTime, events, grades } = useAppContext();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">家长端</h2>
              <p className="text-sm text-gray-600">
                {currentTime.toLocaleTimeString('zh-CN', {
                  hour: '2-digit',
                  minute: '2-digit'
                })} (孩子当地时间)
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white mb-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="text-4xl">🎓</div>
            <div>
              <h2 className="text-xl font-bold">张小明</h2>
              <p className="text-blue-100">University College London</p>
              <p className="text-blue-100 text-sm">Computer Science - Year 2</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div><p className="text-blue-100 text-sm">本周课程</p><p className="text-2xl font-bold">12</p></div>
            <div><p className="text-blue-100 text-sm">待交作业</p><p className="text-2xl font-bold">3</p></div>
            <div><p className="text-blue-100 text-sm">平均分</p><p className="text-2xl font-bold">85%</p></div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center"><Settings className="w-5 h-5 mr-2" />可见性说明</h3>
          <p className="text-blue-800 text-sm">张小明已将可见级别设置为<strong>部分可见</strong>。你可以看到课程安排、作业截止时间和部分成绩信息，但无法查看详细的邮件内容和Moodle链接。</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center"><Calendar className="w-5 h-5 mr-2" />近期安排</h3>
            <div className="space-y-3">
              {events.slice(0, 3).map(event => (
                <div key={event.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${getEventColor(event.type)} flex items-center justify-center`}>
                      {React.createElement(getEventIcon(event.type), { className: "w-4 h-4 text-white" })}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{event.title}</h4>
                      {event.course && <p className="text-xs text-blue-600">{event.course}</p>}
                      {event.due_at && <p className="text-xs text-red-600">截止: {formatTimeRemaining(event.due_at)}</p>}
                      {event.start_at && <p className="text-xs text-gray-500">{new Date(event.start_at).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center"><GraduationCap className="w-5 h-5 mr-2" />成绩概览</h3>
            <div className="space-y-3">
              {grades.map((grade, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{grade.course}</div>
                    <div className="text-xs text-gray-500">{grade.assignment}</div>
                  </div>
                  <div className="text-lg font-bold text-green-600">{grade.grade}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center"><Phone className="w-5 h-5 mr-2" />紧急联系</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100">
                <div className="flex items-center space-x-3"><Phone className="w-5 h-5 text-red-600" /><div className="text-left"><p className="font-medium text-sm">呼叫张小明</p><p className="text-xs text-gray-600">+44 7XXX XXX XXX</p></div></div>
                <span className="text-red-600">→</span>
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100">
                <div className="flex items-center space-x-3"><Phone className="w-5 h-5 text-blue-600" /><div className="text-left"><p className="font-medium text-sm">UCL学生服务</p><p className="text-xs text-gray-600">学校紧急热线</p></div></div>
                <span className="text-blue-600">→</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center"><Mail className="w-5 h-5 mr-2" />本周摘要</h3>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg"><p className="text-sm font-medium text-green-800">✓ 本周按时完成2项作业</p></div>
              <div className="p-3 bg-yellow-50 rounded-lg"><p className="text-sm font-medium text-yellow-800">⚠ 1项作业即将到期</p></div>
              <div className="p-3 bg-blue-50 rounded-lg"><p className="text-sm font-medium text-blue-800">ℹ 下周有重要考试</p></div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">查看详细周报</button>
        </div>
      </main>
    </div>
  );
};

export default ParentDashboard;
