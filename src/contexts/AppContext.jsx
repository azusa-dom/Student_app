import React, { createContext, useState, useContext, useEffect } from 'react';
import { getMockData } from '../api/mockData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userType, setUserType] = useState('student');
  const [loading, setLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  
  const [events, setEvents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [jobFairs, setJobFairs] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    const data = await getMockData();
    setEvents(data.events);
    setGrades(data.grades);
    setJobFairs(data.jobFairs);
    setClubs(data.clubs);
  };

  const handleEmailAuth = (provider) => {
    setSelectedProvider(provider);
    setLoading(true);
    
    setTimeout(() => {
      loadData().then(() => {
        setIsAuthorized(true);
        setLoading(false);
      });
    }, 2000);
  };

  const value = {
    isAuthorized,
    userType,
    setUserType,
    loading,
    handleEmailAuth,
    selectedProvider,
    events,
    grades,
    jobFairs,
    clubs,
    currentTime,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
