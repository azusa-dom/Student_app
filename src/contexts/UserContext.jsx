// src/contexts/UserContext.jsx
import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [userData] = useState({
    name: '张伟',
    email: 'zhangwei@ucl.ac.uk',
    studentId: 'UCL2021001',
    university: 'University College London',
    major: 'Computer Science',
    year: 'Year 2',
    avatar: null
  });

  const [userPreferences, setUserPreferences] = useState({
    notifications: true,
    theme: 'light',
    language: 'zh'
  });

  const getInitials = () => {
    return userData.name ? userData.name.charAt(0) : 'U';
  };

  const getFullName = () => {
    return userData.name || 'Unknown User';
  };

  const updateUserData = (newData) => {
    console.log('Updating user data:', newData);
  };

  const updatePreferences = (newPreferences) => {
    setUserPreferences(prev => ({ ...prev, ...newPreferences }));
  };

  const value = {
    userData,
    userPreferences,
    getInitials,
    getFullName,
    updateUserData,
    updatePreferences
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;