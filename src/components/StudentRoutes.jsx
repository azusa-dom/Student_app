import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import StudentDashboard from './student/StudentDashboard';

const StudentRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<StudentDashboard />} />
      <Route path="/*" element={<StudentDashboard />} />
    </Routes>
  );
};

export default StudentRoutes;