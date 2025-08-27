import React from 'react';
import { AppProvider, useAppContext } from './contexts/AppContext';
import OnboardingScreen from './components/OnboardingScreen';
import StudentDashboard from './components/student/StudentDashboard';
import ParentDashboard from './components/parent/ParentDashboard';

const AppContent = () => {
  const { isAuthorized, userType } = useAppContext();

  if (!isAuthorized) {
    return <OnboardingScreen />;
  }

  return userType === 'student' ? <StudentDashboard /> : <ParentDashboard />;
};

const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
