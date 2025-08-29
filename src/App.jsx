// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppProvider } from './contexts/AppContext';
import { UserProvider } from './contexts/UserContext';
import LoginPage from './auth/LoginPage';
import ParentDashboard from './components/parent/ParentDashboard';
import StudentDashboard from './components/student/StudentDashboard';
import HomePage from './components/student/HomePage';
import MailPage from './components/student/MailPage';
import GradesPage from './components/student/GradesPage';
import JobsPage from './components/student/JobsPage';
import CalendarPage from './components/student/CalendarPage';
import CampusPage from './components/student/CampusPage';
import EmergencyPage from './components/student/EmergencyPage';
import SettingsPage from './components/student/SettingsPage';
import AIChat from './components/AIChat';

function App() {
  return (
    <Router basename="/Student_app">
      <LanguageProvider>
        <ThemeProvider>
          <UserProvider>
            <AppProvider>
              <Routes>
                {/* 登录页面 */}
                <Route path="/" element={<LoginPage />} />
                
                {/* 家长端路由 */}
                <Route path="/parent/dashboard" element={<ParentDashboard />} />
                
                {/* 学生端路由 */}
                <Route path="/student" element={<StudentDashboard />}>
                  <Route path="home" element={<HomePage />} />
                  <Route path="mail" element={<MailPage />} />
                  <Route path="grades" element={<GradesPage />} />
                  <Route path="jobs" element={<JobsPage />} />
                  <Route path="calendar" element={<CalendarPage />} />
                  <Route path="campus" element={<CampusPage />} />
                  <Route path="emergency" element={<EmergencyPage />} />
                  <Route path="ai" element={<AIChat />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route index element={<HomePage />} />
                </Route>
                
                {/* 兼容旧路由 */}
                <Route path="/student/home" element={
                  <StudentDashboard>
                    <HomePage />
                  </StudentDashboard>
                } />
                <Route path="/student/dashboard" element={
                  <StudentDashboard>
                    <HomePage />
                  </StudentDashboard>
                } />
              </Routes>
            </AppProvider>
          </UserProvider>
        </ThemeProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;