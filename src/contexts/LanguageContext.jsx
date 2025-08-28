import React, { createContext, useContext, useState, useEffect } from 'react';

// 翻译数据
const translations = {
  zh: {
    // 通用
    save: '保存',
    
    // 活动和概览
    activities: {
      projectYoga: '乐活瑜伽',
      healthWellness: 'UCL健康与保健',
      sportsCenter: '体育中心',
      participants: '{count} 人参与'
    },
    overview: {
      dueToday: '今日截止',
      classes: '课程安排',
      activities: '社团活动',
      newGrades: '新成绩',
      unreadMails: '未读邮件'
    },
    cards: {
      advancedStats: '高级统计讲座',
      mlCoursework: '机器学习作业1',
      libraryMaintenance: '图书馆系统维护',
      date_example_1: '{date}',
      date_example_2: '{date}',
      location_example: '{location}',
      instructor: '讲师',
      due_in_days: '截止：{days} 天后'
    },
    actions: {
      addToCalendar: '加入日历',
      markDone: '标记完成',
      openMoodle: '打开Moodle'
    },
    quick: {
      moodle: '打开Moodle',
      viewGrades: '查看成绩'
    },
    
    // 就业服务
    jobs: {
      tabs: {
        events: '招聘活动',
        services: 'UCL就业服务',
        resources: '求职资源'
      },
      events: {
        title: '校园招聘活动',
        register: '立即报名'
      },
      services: {
        title: 'UCL就业服务',
        jobBoard: 'UCL就业机会',
        jobBoardDesc: '浏览最新校园招聘、实习和全职工作机会',
        cvService: '简历优化服务',
        cvServiceDesc: '由专业顾问提供简历编写和面试指导',
        careerConsulting: '职业咨询',
        careerConsultingDesc: '一对一职业规划和发展建议',
        workshops: '职业技能工作坊',
        workshopsDesc: '提升求职技能和职场软实力'
      },
      resources: {
        title: '求职学习资源',
        interviewPrep: '面试准备指南',
        interviewPrepDesc: '面试技巧、案例分析和模拟训练',
        industryInsights: '行业洞察',
        industryInsightsDesc: '了解不同行业的职业发展路径和要求'
      }
    },
    cancel: '取消',
    edit: '编辑',
    delete: '删除',
    confirm: '确认',
    loading: '加载中...',
    search: '搜索',
    filter: '筛选',
    all: '全部',
    settingsLabel: '设置',
    back: '返回',
    next: '下一步',
    previous: '上一步',
    close: '关闭',
    submit: '提交',
    update: '更新',
    
    // 导航和标签
    nav: {
      home: '首页',
      mail: '邮件',
      campus: '校园',
      calendar: '日历',
      grades: '成绩',
      jobs: '就业',
      clubs: '社团',
      emergency: '帮助',
      settings: '设置'
    },
    
    // 首页
    home: {
      title: '今日概览',
      description: '你今天有 {count} 个重要事项需要关注',
      todayClasses: '今日课程',
      pendingAssignments: '待交作业',
      newGrades: '新成绩',
      smartCards: '智能卡片流'
    },
    
    // 社团活动
    clubs: {
      title: '社团活动',
      description: '发现并参与UCL丰富多彩的社团活动',
      searchPlaceholder: '搜索活动或社团...',
      categories: {
        all: '全部分类',
        cultural: '文化活动',
        academic: '学术活动',
        wellness: '健康运动',
        arts: '艺术表演'
      },
      categoryLabels: {
        cultural: '文化',
        academic: '学术',
        wellness: '健康',
        arts: '艺术'
      },
      joinActivity: '加入活动',
      details: '详情',
      progress: '报名进度',
      participants: '人参与',
      noResults: '没有找到匹配的活动',
      noResultsDesc: '试试调整搜索条件或分类筛选',
      dataSource: '活动数据来源',
      dataSourceDesc: '数据同步自 UCL Students\' Union 官方活动日历，每日更新',
      todayRecommended: '今日推荐',
      updateTime: '更新',
      viewDetails: '查看详情'
    },
    
    // 活动预览
    activityPreview: {
      loadingToday: '加载今日活动...'
    },
    
    // 设置页面
    settings: {
      title: '设置',
      description: '管理您的个人资料、偏好设置和隐私选项',
      
      // 个人资料
      profile: {
        title: '个人资料',
        avatar: '头像',
        changeAvatar: '更改头像',
        clickToUpload: '点击上传新头像',
        basicInfo: '基本信息',
        name: '姓名',
        studentId: '学号',
        email: '邮箱',
        phone: '电话',
        university: '大学',
        programme: '专业'
      },
      
      // 学术设置
      academic: {
        title: '学术设置',
        yearSelection: '学年选择',
        gradeDisplay: '成绩显示偏好',
        percentage: '百分比 (70%)',
        letter: '字母等级 (A, B, C)',
        gpa: 'GPA (4.0)',
        calendarSync: '日历同步',
        moodleSync: 'Moodle日历同步',
        moodleSyncDesc: '自动同步课程和作业截止日期',
        googleCalendarSync: 'Google Calendar同步',
        googleCalendarSyncDesc: '将学术事件同步到Google日历'
      },
      
      // 通知管理
      notifications: {
        title: '通知管理',
        assignmentReminders: '作业截止提醒',
        assignmentRemindersDesc: '在作业截止前24小时和1小时提醒',
        gradeUpdates: '成绩更新通知',
        gradeUpdatesDesc: '有新成绩发布时立即通知',
        eventNotifications: '活动通知',
        eventNotificationsDesc: '社团活动和学校活动提醒',
        emailSync: '邮件同步',
        emailSyncDesc: '同步学校邮箱的重要邮件',
        timeSettings: '通知时间设置',
        quietTimeStart: '安静时间开始',
        quietTimeEnd: '安静时间结束'
      },
      
      // 隐私与安全
      privacy: {
        title: '隐私与安全',
        parentAccess: '家长访问控制',
        courseVisible: '课程信息可见',
        courseVisibleDesc: '家长可以查看课程表和课程详情',
        assignmentVisible: '作业进度可见',
        assignmentVisibleDesc: '家长可以查看作业截止日期和完成状态',
        gradeVisible: '成绩信息可见',
        gradeVisibleDesc: '家长可以查看考试成绩和GPA',
        dataManagement: '数据管理',
        exportData: '导出我的数据',
        backupSettings: '备份设置',
        deleteAccount: '删除账户'
      },
      
      // 应用设置
      app: {
        title: '应用设置',
        language: '语言选择',
        theme: '主题选择',
        light: '浅色',
        dark: '深色',
        auto: '自动',
        timezone: '时区',
        autoSync: '自动同步频率',
        realtime: '实时同步',
        hourly: '每小时',
        daily: '每日',
        manual: '手动同步'
      },
      
      // 连接服务
      connections: {
        title: '连接服务',
        gmail: 'Gmail',
        moodle: 'Moodle',
        moodleDesc: 'UCL官方学习平台',
        googleCalendar: 'Google Calendar',
        googleCalendarDesc: '日历同步服务',
        connected: '已连接',
        connect: '连接'
      },
      
      // 支持与反馈
      support: {
        title: '支持与反馈',
        helpCenter: '帮助中心',
        reportIssues: '报告问题',
        featureRequests: '功能建议',
        versionInfo: '版本信息：v1.2.0',
        lastUpdate: '最后更新：2025年8月27日'
      },
      
      // 家长监护设置
      parent: {
        title: '家长监护设置',
        monitoringLevel: '监护级别',
        fullMonitoring: '完全监护 - 查看所有信息',
        limitedMonitoring: '有限监护 - 仅查看学术信息',
        minimalMonitoring: '最小监护 - 仅查看紧急信息',
        reportFrequency: '报告频率',
        dailyReport: '每日报告',
        weeklyReport: '每周报告',
        monthlyReport: '每月报告',
        onDemandReport: '按需获取',
        emergencyContacts: '紧急联系方式',
        primaryPhone: '主要联系电话',
        backupPhone: '备用联系电话'
      }
    },
    
    // 日历
    calendar: {
      title: '日程表',
      today: '今天',
      month: '月',
      week: '周',
      day: '日',
      filter: '筛选',
      addEvent: '添加事件',
      showEventTypes: '显示事件类型',
      noEventsToday: '今天没有安排的事件',
      eventsCount: '{count} 个事件',
      moreEvents: '+{count} 更多',
      eventTypes: {
        class_event: '课程',
        assignment_due: '作业',
        exam: '考试',
        club_activity: '社团活动'
      },
      weekdays: {
        sun: '周日',
        mon: '周一',
        tue: '周二',
        wed: '周三',
        thu: '周四',
        fri: '周五',
        sat: '周六'
      }
    },

    // 用户信息
    user: {
      name: '张伟',
      university: 'University College London',
      status: 'GMT'
    }
  },
  
  en: {
    // 通用
    save: 'Save',
    
    // Job Services
    jobs: {
      tabs: {
        events: 'Career Events',
        services: 'UCL Careers',
        resources: 'Resources'
      },
      events: {
        title: 'Campus Recruitment Events',
        register: 'Register Now'
      },
      services: {
        title: 'UCL Career Services',
        jobBoard: 'UCL Job Board',
        jobBoardDesc: 'Browse latest campus recruitment, internships and full-time positions',
        cvService: 'CV Review Service',
        cvServiceDesc: 'Professional CV writing and interview guidance',
        careerConsulting: 'Career Consulting',
        careerConsultingDesc: 'One-on-one career planning and development advice',
        workshops: 'Skills Workshops',
        workshopsDesc: 'Enhance job hunting skills and workplace soft skills'
      },
      resources: {
        title: 'Career Learning Resources',
        interviewPrep: 'Interview Preparation',
        interviewPrepDesc: 'Interview skills, case studies and mock interviews',
        industryInsights: 'Industry Insights',
        industryInsightsDesc: 'Learn about career paths and requirements in different industries'
      }
    },
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    confirm: 'Confirm',
    loading: 'Loading...',
    search: 'Search',
    filter: 'Filter',
    all: 'All',
    settingsLabel: 'Settings',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    close: 'Close',
    submit: 'Submit',
    update: 'Updated',
    
    // 导航和标签
    nav: {
      home: 'Home',
      mail: 'Mail',
      campus: 'Campus',
      calendar: 'Calendar',
      grades: 'Grades',
      jobs: 'Jobs',
      clubs: 'Clubs',
      emergency: 'Help',
      settings: 'Settings'
    },
    
    // 首页
    home: {
      title: 'Today\'s Overview',
      description: 'You have {count} important items to focus on today',
      todayClasses: 'Today\'s Classes',
      pendingAssignments: 'Pending Assignments',
      newGrades: 'New Grades',
      smartCards: 'Smart Card Stream'
    },
    
    // 社团活动
    clubs: {
      title: 'Club Activities',
      description: 'Discover and participate in UCL\'s vibrant club activities',
      searchPlaceholder: 'Search activities or clubs...',
      categories: {
        all: 'All Categories',
        cultural: 'Cultural Events',
        academic: 'Academic Events',
        wellness: 'Wellness & Sports',
        arts: 'Arts & Performance'
      },
      categoryLabels: {
        cultural: 'Cultural',
        academic: 'Academic',
        wellness: 'Wellness',
        arts: 'Arts'
      },
      joinActivity: 'Join Activity',
      details: 'Details',
      progress: 'Registration Progress',
      participants: 'participants',
      noResults: 'No matching activities found',
      noResultsDesc: 'Try adjusting your search criteria or category filters',
      dataSource: 'Activity Data Source',
      dataSourceDesc: 'Data synced from UCL Students\' Union official activity calendar, updated daily',
      todayRecommended: 'Today\'s Pick',
      updateTime: 'Updated',
      viewDetails: 'View Details'
    },
    
    // 活动预览
    activityPreview: {
      loadingToday: 'Loading today\'s activities...'
    },
    
    // 设置页面
    settings: {
      title: 'Settings',
      description: 'Manage your profile, preferences, and privacy options',
      
      // 个人资料
      profile: {
        title: 'Profile',
        avatar: 'Avatar',
        changeAvatar: 'Change Avatar',
        clickToUpload: 'Click to upload new avatar',
        basicInfo: 'Basic Information',
        name: 'Name',
        studentId: 'Student ID',
        email: 'Email',
        phone: 'Phone',
        university: 'University',
        programme: 'Programme'
      },
      
      // 学术设置
      academic: {
        title: 'Academic Settings',
        yearSelection: 'Academic Year Selection',
        gradeDisplay: 'Grade Display Preference',
        percentage: 'Percentage (70%)',
        letter: 'Letter Grade (A, B, C)',
        gpa: 'GPA (4.0)',
        calendarSync: 'Calendar Sync',
        moodleSync: 'Moodle Calendar Sync',
        moodleSyncDesc: 'Automatically sync courses and assignment deadlines',
        googleCalendarSync: 'Google Calendar Sync',
        googleCalendarSyncDesc: 'Sync academic events to Google Calendar'
      },
      
      // 通知管理
      notifications: {
        title: 'Notification Management',
        assignmentReminders: 'Assignment Reminders',
        assignmentRemindersDesc: 'Remind 24 hours and 1 hour before assignment deadlines',
        gradeUpdates: 'Grade Update Notifications',
        gradeUpdatesDesc: 'Notify immediately when new grades are published',
        eventNotifications: 'Event Notifications',
        eventNotificationsDesc: 'Club activities and school event reminders',
        emailSync: 'Email Sync',
        emailSyncDesc: 'Sync important emails from school mailbox',
        timeSettings: 'Notification Time Settings',
        quietTimeStart: 'Quiet Time Start',
        quietTimeEnd: 'Quiet Time End'
      },
      
      // 隐私与安全
      privacy: {
        title: 'Privacy & Security',
        parentAccess: 'Parent Access Control',
        courseVisible: 'Course Information Visible',
        courseVisibleDesc: 'Parents can view timetable and course details',
        assignmentVisible: 'Assignment Progress Visible',
        assignmentVisibleDesc: 'Parents can view assignment deadlines and completion status',
        gradeVisible: 'Grade Information Visible',
        gradeVisibleDesc: 'Parents can view exam results and GPA',
        dataManagement: 'Data Management',
        exportData: 'Export My Data',
        backupSettings: 'Backup Settings',
        deleteAccount: 'Delete Account'
      },
      
      // 应用设置
      app: {
        title: 'App Settings',
        language: 'Language Selection',
        theme: 'Theme Selection',
        light: 'Light',
        dark: 'Dark',
        auto: 'Auto',
        timezone: 'Timezone',
        autoSync: 'Auto-sync Frequency',
        realtime: 'Real-time Sync',
        hourly: 'Hourly',
        daily: 'Daily',
        manual: 'Manual Sync'
      },
      
      // 连接服务
      connections: {
        title: 'Connected Services',
        gmail: 'Gmail',
        moodle: 'Moodle',
        moodleDesc: 'UCL Official Learning Platform',
        googleCalendar: 'Google Calendar',
        googleCalendarDesc: 'Calendar Sync Service',
        connected: 'Connected',
        connect: 'Connect'
      },
      
      // 支持与反馈
      support: {
        title: 'Support & Feedback',
        helpCenter: 'Help Center',
        reportIssues: 'Report Issues',
        featureRequests: 'Feature Requests',
        versionInfo: 'Version: v1.2.0',
        lastUpdate: 'Last Updated: August 27, 2025'
      },
      
      // 家长监护设置
      parent: {
        title: 'Parental Controls',
        monitoringLevel: 'Monitoring Level',
        fullMonitoring: 'Full Monitoring - View all information',
        limitedMonitoring: 'Limited Monitoring - View academic information only',
        minimalMonitoring: 'Minimal Monitoring - View emergency information only',
        reportFrequency: 'Report Frequency',
        dailyReport: 'Daily Report',
        weeklyReport: 'Weekly Report',
        monthlyReport: 'Monthly Report',
        onDemandReport: 'On-demand',
        emergencyContacts: 'Emergency Contacts',
        primaryPhone: 'Primary Phone',
        backupPhone: 'Backup Phone'
      }
    },
    
    // 日历
    calendar: {
      title: 'Schedule',
      today: 'Today',
      month: 'Month',
      week: 'Week',
      day: 'Day',
      filter: 'Filter',
      addEvent: 'Add Event',
      showEventTypes: 'Show Event Types',
      noEventsToday: 'No events scheduled for today',
      eventsCount: '{count} events',
      moreEvents: '+{count} more',
      eventTypes: {
        class_event: 'Classes',
        assignment_due: 'Assignments',
        exam: 'Exams',
        club_activity: 'Club Activities'
      },
      weekdays: {
        sun: 'Sun',
        mon: 'Mon',
        tue: 'Tue',
        wed: 'Wed',
        thu: 'Thu',
        fri: 'Fri',
        sat: 'Sat'
      }
    },

    // 用户信息
    user: {
      name: 'Zhang Wei',
      university: 'University College London',
      status: 'GMT'
    }
  }
};

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // 优先使用 localStorage 中的设置，其次使用浏览器语言，最后默认中文
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && (savedLanguage === 'zh' || savedLanguage === 'en')) {
      return savedLanguage;
    }
    
    // 检测浏览器语言
    const browserLang = navigator.language || navigator.userLanguage;
    const preferredLang = browserLang.toLowerCase().startsWith('zh') ? 'zh' : 'en';
    
    localStorage.setItem('language', preferredLang);
    return preferredLang;
  });
  
  // 添加一个版本号来强制所有使用 t() 的组件重新渲染
  const [version, setVersion] = useState(0);

  useEffect(() => {
    // 监听其他标签页的语言变化
    const handleStorageChange = (e) => {
      if (e.key === 'language' && e.newValue !== language) {
        setLanguage(e.newValue);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [language]);

  const changeLanguage = (newLanguage) => {
    if (newLanguage !== 'zh' && newLanguage !== 'en') {
      console.warn('Invalid language code:', newLanguage);
      return;
    }
    setLanguage(newLanguage);
    setVersion(v => v + 1); // 增加版本号强制更新
    localStorage.setItem('language', newLanguage);
    // 添加语言切换后的文档标题更新
    document.title = newLanguage === 'zh' ? '留学生家校通' : 'Student Portal';
  };

  // 获取翻译文本的函数
  const t = (key, params = {}) => {
    // eslint-disable-next-line no-unused-vars
    const _ = version; // 通过读取版本号来强制重新渲染
    
    if (!key) {
      console.warn('Translation key is undefined or empty');
      return '';
    }

    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key "${key}" not found for language "${language}"`);
        // 如果当前语言找不到翻译，尝试使用另一种语言
        const fallbackLang = language === 'zh' ? 'en' : 'zh';
        let fallbackValue = translations[fallbackLang];
        for (const fk of keys) {
          if (fallbackValue && typeof fallbackValue === 'object' && fk in fallbackValue) {
            fallbackValue = fallbackValue[fk];
          } else {
            return key;
          }
        }
        value = fallbackValue;
      }
    }
    
    // 处理参数替换
    if (typeof value === 'string') {
      return value.replace(/\{(\w+)\}/g, (match, param) => {
        if (params[param] === undefined) {
          console.warn(`Parameter "${param}" not provided for key "${key}"`);
          return match;
        }
        return params[param];
      });
    }
    
    return value || key;
  };

  const value = {
    language,
    changeLanguage,
    t,
    isZh: language === 'zh',
    isEn: language === 'en'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
