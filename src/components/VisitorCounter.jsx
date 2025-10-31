// src/components/VisitorCounter.jsx
import { useState, useEffect } from 'react';

/**
 * 访问计数器组件
 * 注意：countapi.xyz 已失效，这里使用本地存储作为替代
 */
export default function VisitorCounter() {
  const [count, setCount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 使用本地存储模拟访问计数
    const updateLocalCount = () => {
      try {
        const localCount = localStorage.getItem('visitor_count') || '0';
        const newCount = parseInt(localCount) + 1;
        localStorage.setItem('visitor_count', newCount.toString());
        setCount(newCount);
      } catch (error) {
        console.warn('无法访问 localStorage:', error);
        setCount(null);
      } finally {
        setLoading(false);
      }
    };

    updateLocalCount();
  }, []);

  if (loading) {
    return (
      <div className="text-sm text-gray-500">
        <span className="inline-block w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mr-2"></span>
        加载中...
      </div>
    );
  }

  if (!count) {
    return null; // 不显示计数器
  }

  return (
    <div className="text-sm text-gray-600">
      <span className="font-medium">访问次数:</span> {count.toLocaleString()}
    </div>
  );
}