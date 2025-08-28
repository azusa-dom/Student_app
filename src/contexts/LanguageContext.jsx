import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  zh: {
    save: '保存',
    loading: '加载中...',
    search: '搜索',
    nav: { home: '首页', mail: '邮件', campus: '校园', calendar: '日历', grades: '成绩', jobs: '就业', clubs: '社团', emergency: '帮助', settings: '设置' },
    home: { title: '今日概览', description: '你今天有 {count} 个重要事项需要关注', todayClasses: '今日课程', pendingAssignments: '待交作业', newGrades: '新成绩', smartCards: '智能卡片流' },
    activities: { projectYoga: '乐活瑜伽', participants: '{count} 人参与' },
    cards: { advancedStats: '高级统计讲座', mlCoursework: '机器学习作业1', libraryMaintenance: '图书馆系统维护' },
    quick: { moodle: '打开Moodle', viewGrades: '查看成绩' },
    jobs: { tabs: { events: '招聘活动', services: 'UCL就业服务', resources: '求职资源' }, events: { title: '校园招聘活动', register: '立即报名' }, services: { title: 'UCL就业服务', jobBoard: 'UCL就业机会' }, resources: { title: '求职学习资源', interviewPrep: '面试准备指南' } },
    clubs: { title: '社团活动', searchPlaceholder: '搜索活动或社团...', todayRecommended: '今日推荐' },
    calendar: { title: '日程表', today: '今天', addEvent: '添加事件', eventsCount: '{count} 个事件' },
    ai: { title: 'AI 助手', apiKey: 'OpenAI API Key (可选)', apiKeyHint: '输入临时 key 可直接调用 OpenAI（自行承担费用），留空则使用本地模拟模式。', placeholder: '问我一些关于作业、截止日期或校园服务的问题', send: '发送', welcome: '你好，我是你的 AI 助手。' },
    user: { name: '张伟', university: 'University College London' },
    settings: { title: '设置' }
  },
  en: {
    save: 'Save',
    loading: 'Loading...',
    search: 'Search',
    nav: { home: 'Home', mail: 'Mail', campus: 'Campus', calendar: 'Calendar', grades: 'Grades', jobs: 'Jobs', clubs: 'Clubs', emergency: 'Help', settings: 'Settings' },
    home: { title: "Today's Overview", description: 'You have {count} important items to focus on today', todayClasses: "Today's Classes", pendingAssignments: 'Pending Assignments', newGrades: 'New Grades', smartCards: 'Smart Card Stream' },
    activities: { projectYoga: 'Project Yoga', participants: '{count} participants' },
    cards: { advancedStats: 'Advanced Statistics Lecture', mlCoursework: 'Machine Learning Coursework 1', libraryMaintenance: 'Library System Maintenance' },
    quick: { moodle: 'Open Moodle', viewGrades: 'View Grades' },
    jobs: { tabs: { events: 'Career Events', services: 'UCL Careers', resources: 'Resources' }, events: { title: 'Campus Recruitment Events', register: 'Register Now' }, services: { title: 'UCL Career Services', jobBoard: 'UCL Job Board' }, resources: { title: 'Career Learning Resources', interviewPrep: 'Interview Preparation' } },
    clubs: { title: 'Club Activities', searchPlaceholder: 'Search activities or clubs...', todayRecommended: "Today's Pick" },
    calendar: { title: 'Schedule', today: 'Today', addEvent: 'Add Event', eventsCount: '{count} events' },
    ai: { title: 'AI Assistant', apiKey: 'OpenAI API Key (optional)', apiKeyHint: 'Enter a temporary key to call OpenAI directly (you are responsible for usage charges). Leave blank to use local mock mode.', placeholder: 'Ask me about assignments, deadlines or campus services', send: 'Send', welcome: 'Hello, I am your AI assistant.' },
    user: { name: 'Zhang Wei', university: 'University College London' },
    settings: { title: 'Settings' }
  }
};

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('language') : null;
      if (saved === 'zh' || saved === 'en') return saved;
    } catch (e) {}
    const browser = (typeof navigator !== 'undefined' ? (navigator.language || navigator.userLanguage) : 'en') || 'en';
    return browser.toLowerCase().startsWith('zh') ? 'zh' : 'en';
  });

  const [version, setVersion] = useState(0);

  useEffect(() => {
    const onStorage = (e) => { if (e.key === 'language' && e.newValue) setLanguage(e.newValue); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const changeLanguage = (newLang) => {
    if (newLang !== 'zh' && newLang !== 'en') return;
    setLanguage(newLang);
    setVersion(v => v + 1);
    try { localStorage.setItem('language', newLang); } catch (e) {}
    if (typeof document !== 'undefined') document.title = newLang === 'zh' ? '留学生家校通' : 'Student Portal';
  };

  const t = (key, params = {}) => {
    const _ = version;
    if (!key) return '';
    const parts = key.split('.');
    let val = translations[language];
    for (const p of parts) {
      if (!val) return key;
      val = val[p];
    }
    if (typeof val === 'string') return val.replace(/\{(\w+)\}/g, (_, k) => (params[k] !== undefined ? params[k] : `{${k}}`));
    return val || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, isZh: language === 'zh', isEn: language === 'en' }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
