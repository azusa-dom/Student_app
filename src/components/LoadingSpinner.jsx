import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const LoadingSpinner = ({ size = 'md', color = 'blue' }) => {
  const { t } = useLanguage();
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const colorClasses = {
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    gray: 'text-gray-600',
    white: 'text-white'
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center space-y-4">
        <div
          className={`animate-spin rounded-full border-4 border-gray-200 border-t-transparent ${sizeClasses[size]} ${colorClasses[color]}`}
          style={{
            borderTopColor: 'currentColor'
          }}
        />
        <p className="text-gray-600 text-sm">{t('loading') || '加载中...'}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;