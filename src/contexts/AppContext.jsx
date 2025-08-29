// src/contexts/AppContext.jsx
import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // 成绩数据
  const [grades] = useState([
    { 
      course: 'COMP3001', 
      assignment: '算法设计作业', 
      grade: '88', 
      date: '2024-03-15' 
    },
    { 
      course: 'MATH2001', 
      assignment: '线性代数期中', 
      grade: '85', 
      date: '2024-03-10' 
    },
    { 
      course: 'PHYS1001', 
      assignment: '物理实验报告', 
      grade: '92', 
      date: '2024-03-08' 
    }
  ]);

  // 事件数据
  const [events] = useState([
    {
      id: 1,
      title: '高级数学讲座',
      type: 'class_event',
      start_at: '2024-03-20T09:00:00Z',
      location: '教学楼A101',
      teacher: 'Prof. Smith',
      course: 'MATH3001'
    },
    {
      id: 2,
      title: '机器学习作业',
      type: 'assignment_due',
      due_at: '2024-03-22T23:59:59Z',
      course: 'CS7012'
    },
    {
      id: 3,
      title: '期中考试',
      type: 'exam',
      start_at: '2024-03-25T14:00:00Z',
      location: '考试中心',
      course: 'STAT7001'
    }
  ]);

  // 招聘会数据
  const [jobFairs] = useState([
    {
      id: 1,
      title: '春季科技招聘会',
      date: '2024-04-15',
      location: 'UCL主校区',
      companies: ['Google', 'Microsoft', 'Amazon', 'Meta']
    },
    {
      id: 2,
      title: '金融行业专场',
      date: '2024-04-20',
      location: '伦敦金融城',
      companies: ['Goldman Sachs', 'JPMorgan', 'Morgan Stanley']
    }
  ]);

  // 添加成绩
  const addGrade = (newGrade) => {
    console.log('Adding grade:', newGrade);
  };

  // 添加事件
  const addEvent = (newEvent) => {
    console.log('Adding event:', newEvent);
  };

  const value = {
    grades,
    events,
    jobFairs,
    addGrade,
    addEvent
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;