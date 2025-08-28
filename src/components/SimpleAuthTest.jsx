import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const SimpleAuthTest = () => {
  try {
    const auth = useAuth();
    return (
      <div style={{ padding: '20px', backgroundColor: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '5px', margin: '20px' }}>
        <h3 style={{ color: '#155724' }}>✅ AuthProvider 工作正常!</h3>
        <p style={{ color: '#155724' }}>useAuth hook 可以正常使用</p>
        <div style={{ fontSize: '14px', marginTop: '10px' }}>
          <p>认证状态: {auth.isAuthenticated ? '已认证' : '未认证'}</p>
          <p>用户类型: {auth.userType || '无'}</p>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '5px', margin: '20px' }}>
        <h3 style={{ color: '#721c24' }}>❌ AuthProvider 错误!</h3>
        <p style={{ color: '#721c24' }}>错误信息: {error.message}</p>
      </div>
    );
  }
};

export default SimpleAuthTest;