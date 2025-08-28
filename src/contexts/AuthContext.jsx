import React, { createContext, useState, useContext } from 'react';
import { getMockData } from '../api/mockData';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userType, setUserType] = useState('student');
  const [loading, setLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);

  const handleEmailAuth = async (provider) => {
    try {
      setSelectedProvider(provider);
      setLoading(true);

      await new Promise((resolve, reject) => {
        setTimeout(() => {
          getMockData()
            .then(() => {
              setIsAuthorized(true);
              resolve();
            })
            .catch(reject);
        }, 2000);
      });
    } catch (error) {
      console.error('Authentication failed:', error);
      throw new Error(t('auth.failed'));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setIsAuthorized(false);
    setSelectedProvider(null);
    // 可以添加其他清理逻辑
  };

  const value = {
    isAuthorized,
    userType,
    setUserType,
    loading,
    handleEmailAuth,
    selectedProvider,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
