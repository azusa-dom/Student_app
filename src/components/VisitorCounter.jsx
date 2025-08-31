import React, { useState, useEffect } from 'react';

const VisitorCounter = () => {
  const [visitorCount, setVisitorCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 使用免费的访问计数 API
    const fetchVisitorCount = async () => {
      try {
        const response = await fetch('https://api.countapi.xyz/hit/azusa-dom.github.io/student-app');
        const data = await response.json();
        setVisitorCount(data.value);
      } catch (error) {
        console.error('访问计数错误:', error);
        // 使用本地存储作为备选方案
        const localCount = localStorage.getItem('visitor_count') || '0';
        const newCount = parseInt(localCount) + 1;
        localStorage.setItem('visitor_count', newCount.toString());
        setVisitorCount(newCount);
      } finally {
        setLoading(false);
      }
    };

    fetchVisitorCount();
  }, []);

  if (loading) {
    return (
      <div className="visitor-counter text-sm text-gray-500">
        <span>正在加载访问统计...</span>
      </div>
    );
  }

  return (
    <div className="visitor-counter text-sm text-gray-500 flex items-center gap-2">
      <svg 
        className="w-4 h-4" 
        fill="currentColor" 
        viewBox="0 0 20 20"
      >
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
      </svg>
      <span>访问次数: {visitorCount.toLocaleString()}</span>
    </div>
  );
};

export default VisitorCounter;
