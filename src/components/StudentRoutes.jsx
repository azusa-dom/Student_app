import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import StudentDashboard from './student/StudentDashboard';
import HomePage from './student/HomePage';

import GradesPage from './student/GradesPage';
import JobsPage from './student/JobsPage';
import CampusPage from './student/CampusPage';
import CalendarPage from './student/CalendarPage';
import MailPage from './student/MailPage';
import EmergencyPage from './student/EmergencyPage';
import SettingsPage from './student/SettingsPage';
import AIChat from './AIChat';

const StudentRoutes = () => {
  return (
    <StudentDashboard>
      <Routes>
        <Route path="/" element={<Navigate to="home" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/mail" element={<MailPage />} />
        <Route path="/grades" element={<GradesPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/campus" element={<CampusPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/emergency" element={<EmergencyPage />} />
        <Route path="/ai" element={<AIChat />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="home" replace />} />
      </Routes>
    </StudentDashboard>
  );
};

export default StudentRoutes;