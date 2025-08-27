import React from 'react';
import { Phone } from 'lucide-react';

const EmergencyPage = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="relative group mb-8">
        <div className="absolute inset-0 bg-gradient-to-tr from-red-600 to-rose-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
        <div className="relative bg-gradient-to-tr from-red-600 via-rose-500 to-pink-500 rounded-3xl p-8 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full translate-y-24 -translate-x-24"></div>
          
          <h2 className="text-3xl font-bold mb-4">紧急联系</h2>
          <p className="text-red-100 text-lg mb-4">如遇紧急情况，请立即拨打以下电话获取帮助</p>
          
          <div className="grid grid-cols-3 gap-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-black/5 rounded-2xl backdrop-blur-lg group-hover:bg-black/10 transition-colors"></div>
              <div className="relative p-4 text-center">
                <Phone className="w-6 h-6 text-white mx-auto mb-2" />
                <div className="text-sm text-red-100">24/7全天候支持</div>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-black/5 rounded-2xl backdrop-blur-lg group-hover:bg-black/10 transition-colors"></div>
              <div className="relative p-4 text-center">
                <div className="text-3xl font-bold mb-1">112</div>
                <div className="text-sm text-red-100">英国报警电话</div>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-black/5 rounded-2xl backdrop-blur-lg group-hover:bg-black/10 transition-colors"></div>
              <div className="relative p-4 text-center">
                <div className="text-3xl font-bold mb-1">999</div>
                <div className="text-sm text-red-100">救护车</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-20 transition-opacity"></div>
          <button className="relative w-full flex items-center justify-between p-6 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-red-500/5 hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-red-500 to-rose-400 rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="relative w-14 h-14 bg-gradient-to-tr from-red-500 to-rose-400 rounded-xl flex items-center justify-center">
                  <Phone className="w-7 h-7 text-white transform group-hover:rotate-12 transition-transform" />
                </div>
              </div>
              <div className="text-left">
                <p className="text-lg font-semibold text-gray-900 mb-1">呼叫家长</p>
                <p className="text-base text-gray-600">一键拨号</p>
              </div>
            </div>
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center group-hover:bg-red-100 transition-colors">
              <span className="text-red-600 text-lg font-bold transform group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </button>
        </div>
        
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-20 transition-opacity"></div>
          <button className="relative w-full flex items-center justify-between p-6 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-blue-500/5 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-indigo-400 rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="relative w-14 h-14 bg-gradient-to-tr from-blue-500 to-indigo-400 rounded-xl flex items-center justify-center">
                  <Phone className="w-7 h-7 text-white transform group-hover:rotate-12 transition-transform" />
                </div>
              </div>
              <div className="text-left">
                <p className="text-lg font-semibold text-gray-900 mb-1">UCL学生服务</p>
                <p className="text-base text-gray-600">24小时热线</p>
              </div>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <span className="text-blue-600 text-lg font-bold transform group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </button>
        </div>
        
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-20 transition-opacity"></div>
          <button className="relative w-full flex items-center justify-between p-6 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-emerald-500/5 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-green-400 rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="relative w-14 h-14 bg-gradient-to-tr from-emerald-500 to-green-400 rounded-xl flex items-center justify-center">
                  <Phone className="w-7 h-7 text-white transform group-hover:rotate-12 transition-transform" />
                </div>
              </div>
              <div className="text-left">
                <p className="text-lg font-semibold text-gray-900 mb-1">中国领事馆</p>
                <p className="text-base text-gray-600">紧急求助</p>
              </div>
            </div>
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
              <span className="text-emerald-600 text-lg font-bold transform group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyPage;
