import React from 'react';
import { useLocation } from 'react-router-dom';

const TestHomePage = () => {
  const location = useLocation();
  
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f8ff', minHeight: '400px' }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>🎯 学生首页测试</h1>
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
        <h2>路由信息：</h2>
        <p><strong>当前路径：</strong> {location.pathname}</p>
        <p><strong>搜索参数：</strong> {location.search}</p>
        <p><strong>哈希：</strong> {location.hash}</p>
      </div>
      
      <div style={{ backgroundColor: '#e8f5e8', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
        <h2>✅ 如果你能看到这个页面，说明学生路由工作正常！</h2>
        <p>接下来我们需要检查为什么真正的HomePage组件没有显示。</p>
      </div>

      <div style={{ backgroundColor: '#fff3cd', padding: '20px', borderRadius: '10px' }}>
        <h3>今日概览测试</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginTop: '15px' }}>
          <div style={{ backgroundColor: '#dbeafe', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>3</div>
            <div style={{ fontSize: '0.875rem', color: '#1d4ed8' }}>今日课程</div>
          </div>
          <div style={{ backgroundColor: '#fed7aa', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ea580c' }}>5</div>
            <div style={{ fontSize: '0.875rem', color: '#c2410c' }}>待交作业</div>
          </div>
          <div style={{ backgroundColor: '#dcfce7', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#16a34a' }}>2</div>
            <div style={{ fontSize: '0.875rem', color: '#15803d' }}>新成绩</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestHomePage;
