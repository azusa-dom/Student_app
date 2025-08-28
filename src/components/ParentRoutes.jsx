import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ParentDashboard from './parent/ParentDashboard';

const ParentRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ParentDashboard />} />
      <Route path="/*" element={<ParentDashboard />} />
    </Routes>
  );
};

export default ParentRoutes;