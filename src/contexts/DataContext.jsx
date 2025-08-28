import React, { createContext, useState, useContext, useEffect } from 'react';
import { getMockData } from '../api/mockData';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [jobFairs, setJobFairs] = useState([]);
  const [clubs, setClubs] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await getMockData();
      setEvents(data.events);
      setGrades(data.grades);
      setJobFairs(data.jobFairs);
      setClubs(data.clubs);
    } catch (error) {
      console.error('Failed to load data:', error);
      // 可以添加错误处理逻辑
    }
  };

  // 事件操作
  const addEvent = (newEvent) => {
    const id = Math.max(0, ...events.map(e => e.id || 0)) + 1;
    setEvents(prev => [...prev, { id, ...newEvent }]);
  };

  // 成绩操作
  const addGrade = (newGrade) => {
    setGrades(prev => [newGrade, ...prev]);
  };

  // 社团活动操作
  const joinClub = (clubId) => {
    setClubs(prev => 
      prev.map(club => 
        club.id === clubId 
          ? { ...club, memberCount: club.memberCount + 1, joined: true }
          : club
      )
    );
  };

  // 招聘会操作
  const registerJobFair = (fairId) => {
    setJobFairs(prev =>
      prev.map(fair =>
        fair.id === fairId
          ? { ...fair, registered: true }
          : fair
      )
    );
  };

  const value = {
    events,
    addEvent,
    grades,
    addGrade,
    jobFairs,
    registerJobFair,
    clubs,
    joinClub,
    refreshData: loadData
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
