import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthTest = () => {
  const auth = useAuth(); // 这应该不会抛出错误

  return (
    <div className="p-4 bg-green-100 border border-green-300 rounded">
      <h3 className="text-green-800 font-bold">✅ AuthProvider 工作正常!</h3>
      <p className="text-green-700">useAuth hook 可以正常使用</p>
      <div className="mt-2 text-sm">
        <p>认证状态: {auth.isAuthenticated ? '已认证' : '未认证'}</p>
        <p>用户类型: {auth.userType || '无'}</p>
      </div>
    </div>
  );
};

export default AuthTest;