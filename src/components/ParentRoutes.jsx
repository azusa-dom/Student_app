import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ParentDashboard from './parent/ParentDashboard';

const ParentRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/parent/dashboard" replace />} />
      <Route path="/dashboard" element={<ParentDashboard />} />
      <Route path="/*" element={<Navigate to="/parent/dashboard" replace />} />
    </Routes>
  );
};

export default ParentRoutes;