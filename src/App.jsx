import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { AppProvider } from './contexts/AppContext';
import { UserProvider } from './contexts/UserContext';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';

// 懒加载组件
const OnboardingScreen = lazy(() => import('./components/NewOnboardingScreen'));
const LoginPage = lazy(() => import('./auth/LoginPage'));
const StudentRoutes = lazy(() => import('./components/StudentRoutes'));
const ParentRoutes = lazy(() => import('./components/ParentRoutes'));
const ParentDashboard = lazy(() => import('./components/parent/ParentDashboard'));
const TestPage = lazy(() => import('./components/TestPage'));

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ThemeProvider>
          <AuthProvider>
            <UserProvider>
              <DataProvider>
                <AppProvider>
                  <Router basename="/Student_app">
                    <div className="App">
                      <Routes>
                        <Route path="/" element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <OnboardingScreen />
                          </Suspense>
                        } />
                        <Route path="/login" element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <LoginPage />
                          </Suspense>
                        } />
                        <Route path="/test" element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <TestPage />
                          </Suspense>
                        } />
                        <Route path="/student/*" element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <StudentRoutes />
                          </Suspense>
                        } />
                        <Route path="/parent/*" element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <ParentRoutes />
                          </Suspense>
                        } />
                        <Route path="/parent/dashboard" element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <ParentDashboard />
                          </Suspense>
                        } />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </div>
                  </Router>
                </AppProvider>
              </DataProvider>
            </UserProvider>
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;