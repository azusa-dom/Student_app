import React from 'react';
import { Plus, GraduationCap } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';

const GradesPage = () => {
  const { grades } = useAppContext();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="relative group mb-8">
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600 to-green-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
        <div className="relative bg-gradient-to-tr from-emerald-600 via-green-500 to-teal-400 rounded-3xl p-8 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full translate-y-24 -translate-x-24"></div>
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">成绩管理</h2>
              <p className="text-emerald-100 text-lg">本学期已更新 {grades.length} 门课程成绩</p>
            </div>
            <button className="relative group px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl backdrop-blur-lg transition-all duration-300">
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-white group-hover:rotate-180 transition-transform duration-500" />
                <span className="font-medium text-white">手动添加</span>
              </div>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-black/5 rounded-2xl backdrop-blur-lg group-hover:bg-black/10 transition-colors"></div>
              <div className="relative p-4 text-center">
                <div className="text-3xl font-bold mb-1">3.8</div>
                <div className="text-sm text-emerald-100">平均GPA</div>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-black/5 rounded-2xl backdrop-blur-lg group-hover:bg-black/10 transition-colors"></div>
              <div className="relative p-4 text-center">
                <div className="text-3xl font-bold mb-1">85%</div>
                <div className="text-sm text-emerald-100">及格率</div>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-black/5 rounded-2xl backdrop-blur-lg group-hover:bg-black/10 transition-colors"></div>
              <div className="relative p-4 text-center">
                <div className="text-3xl font-bold mb-1">92</div>
                <div className="text-sm text-emerald-100">最高分</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid gap-4">
        {grades.map((grade, index) => (
          <div key={index} className="relative group">
            <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 group-hover:shadow-2xl group-hover:shadow-gray-300/50 transition-all duration-300"></div>
            <div className="relative p-6 flex items-center justify-between">
              <div className="flex items-center space-x-5">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-green-400 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
                  <div className="relative w-16 h-16 bg-gradient-to-tr from-emerald-500 to-green-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <GraduationCap className="w-8 h-8 text-white transform group-hover:scale-110 transition-transform" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{grade.course}</h3>
                  <p className="text-base text-gray-600 mb-1">{grade.assignment}</p>
                  <p className="text-sm text-gray-500">{grade.date}</p>
                </div>
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent transform group-hover:scale-110 transition-transform">
                {grade.grade}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GradesPage;
