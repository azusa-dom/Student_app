import React from 'react';
import { useAppContext } from '../../contexts/AppContext';

const SettingsPage = () => {
  const { selectedProvider } = useAppContext();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-6">设置</h2>
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium mb-2">账户信息</h3>
            <p className="text-sm text-gray-600 mb-2">邮箱: {selectedProvider?.toUpperCase()}</p>
            <p className="text-sm text-gray-600 mb-2">学校: University College London</p>
            <button className="text-blue-600 text-sm font-medium">编辑信息</button>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium mb-2">家长可见性设置</h3>
            <p className="text-sm text-gray-600 mb-3">控制家长可以看到的信息范围</p>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                <span className="text-sm">课程信息对家长可见</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                <span className="text-sm">作业DDL对家长可见</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">成绩信息对家长可见</span>
              </label>
            </div>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium mb-2">通知设置</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                <span className="text-sm">作业截止提醒</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                <span className="text-sm">新成绩通知</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                <span className="text-sm">课程变更通知</span>
              </label>
            </div>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium mb-2">数据管理</h3>
            <div className="space-y-2">
              <button className="text-blue-600 text-sm font-medium block">导出我的数据</button>
              <button className="text-red-600 text-sm font-medium block">删除账户</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
