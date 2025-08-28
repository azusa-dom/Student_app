import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { GraduationCap } from 'lucide-react';
import ErrorBoundary from './components/ErrorBoundary';

// 懒加载组件
const OnboardingScreen = lazy(() => import('./components/OnboardingScreen'));
const StudentDashboard = lazy(() => import('./components/student/StudentDashboard'));
const ParentDashboard = lazy(() => import('./components/parent/ParentDashboard'));

// 懒加载学生页面组件
const HomePage = lazy(() => import('./components/student/HomePage'));
const MailPage = lazy(() => import('./components/student/MailPage'));
const GradesPage = lazy(() => import('./components/student/GradesPage'));
const CampusPage = lazy(() => import('./components/student/CampusPage'));
const JobsPage = lazy(() => import('./components/student/JobsPage'));
const CalendarPage = lazy(() => import('./components/student/CalendarPage'));
const ClubsPage = lazy(() => import('./components/student/ClubsPage'));
const EmergencyPage = lazy(() => import('./components/student/EmergencyPage'));
const SettingsPage = lazy(() => import('./components/student/SettingsPage'));
const AIChat = lazy(() => import('./components/AIChat'));

// 加载动画组件
const LoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
    <div className="relative">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 flex flex-col items-center shadow-2xl border border-white/50">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
          <GraduationCap className="w-8 h-8 text-white animate-pulse" />
        </div>
        <div className="text-lg font-semibold text-gray-900 mb-2">正在加载</div>
        <div className="text-sm text-gray-600 mb-4">请稍候...</div>
        <div className="flex space-x-1">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  </div>
);

// 受保护的路由组件
const ProtectedRoute = ({ children }) => {
  const { isAuthorized } = useAuth();
  
  if (!isAuthorized) {
    return <Navigate to="/onboarding" replace />;
  }
  
  return children;
};

// 学生路由包装器 - 提供通用布局和导航
const StudentRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/mail" element={<MailPage />} />
      <Route path="/grades" element={<GradesPage />} />
      <Route path="/campus" element={<CampusPage />} />
      <Route path="/jobs" element={<JobsPage />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/clubs" element={<ClubsPage />} />
  <Route path="/ai" element={<AIChat />} />
      <Route path="/emergency" element={<EmergencyPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
};

// 主要路由内容
const AppRoutes = () => {
  const { isAuthorized, userType } = useAppContext();

  return (
    <Routes>
      {/* 引导页面 */}
      <Route 
        path="/onboarding" 
        element={
          isAuthorized ? (
            <Navigate to={`/${userType}`} replace />
          ) : (
            <OnboardingScreen />
          )
        } 
      />
      
      {/* 学生仪表板路由 */}
      <Route 
        path="/student/*" 
        element={
          <ProtectedRoute>
            <StudentDashboard>
              <StudentRoutes />
            </StudentDashboard>
          </ProtectedRoute>
        } 
      />
      
      {/* 家长仪表板 */}
      <Route 
        path="/parent/*" 
        element={
          <ProtectedRoute>
            <ParentDashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* 根路径重定向 */}
      <Route 
        path="/" 
        element={
          isAuthorized ? (
            <Navigate to={`/${userType}`} replace />
          ) : (
            <Navigate to="/onboarding" replace />
          )
        } 
      />
      
      {/* 404 页面 */}
      <Route 
        path="*" 
        element={
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 text-center shadow-2xl border border-white/50">
              <div className="text-6xl mb-4">404</div>
              <div className="text-xl font-semibold text-gray-900 mb-2">页面未找到</div>
              <div className="text-gray-600 mb-6">抱歉，您访问的页面不存在</div>
              <button 
                onClick={() => window.location.href = '/'}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                返回首页
              </button>
            </div>
          </div>
        } 
      />
    </Routes>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ThemeProvider>
          <AppProvider>
            <Router basename="/Student_app">
              <Suspense fallback={<LoadingScreen />}>
                <AppRoutes />
              </Suspense>
            </Router>
          </AppProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
};

export default App;