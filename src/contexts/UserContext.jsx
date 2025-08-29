import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState({
    name: '张伟',
    university: 'UCL - 伦敦大学学院',
    studentId: 'ZCAB1234',
    email: 'zhang.wei.23@ucl.ac.uk',
    phone: '+44 7700 123456',
    year: '2023/24',
    programme: 'MSc Computer Science',
    avatar: null
  });

  const updateUserData = (newData) => {
    setUserData(prev => ({ ...prev, ...newData }));
  };

  const getInitials = () => {
    return userData.name.charAt(0) || '用';
  };

  return (
    <UserContext.Provider value={{
      userData,
      updateUserData,
      getInitials
    }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
