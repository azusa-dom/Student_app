import React, { Suspense, lazy } from 'react';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { GraduationCap } from 'lucide-react';
import ErrorBoundary from './components/ErrorBoundary';

// 使用懒加载优化初始加载性能
const OnboardingScreen = lazy(() => import('./components/OnboardingScreen'));
const StudentDashboard = lazy(() => import('./components/student/StudentDashboard'));
const ParentDashboard = lazy(() => import('./components/parent/ParentDashboard'));

// 加载动画组件
const LoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
    <div className="relative group">
      <div className="absolute inset-0 bg-blue-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity animate-pulse"></div>
      <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 flex flex-col items-center shadow-xl shadow-blue-500/10">
        <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 animate-bounce shadow-lg shadow-blue-500/30">
          <GraduationCap className="w-10 h-10 text-white" />
        </div>
        <div className="text-lg font-medium text-gray-900">正在加载</div>
        <div className="text-sm text-gray-600 mt-2">请稍候...</div>
        <div className="mt-4 flex space-x-2">
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  </div>
);

const AppContent = () => {
  const { isAuthorized, userType } = useAppContext();

  if (!isAuthorized) {
    return <OnboardingScreen />;
  }

  return userType === 'student' ? <StudentDashboard /> : <ParentDashboard />;
};

const App = () => {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Suspense fallback={<LoadingScreen />}>
          <AppContent />
        </Suspense>
      </AppProvider>
    </ErrorBoundary>
  );
};

export default App;
