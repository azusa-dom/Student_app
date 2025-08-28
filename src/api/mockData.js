export const getMockData = async () => {
  // 模拟网络延迟
  await new Promise(res => setTimeout(res, 500));

  return {
    events: [
      {
        id: '1',
        type: 'class_event',
  title: { zh: '高级统计讲座', en: 'Advanced Statistics Lecture' },
        course: 'STAT7001',
        start_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        end_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        location: 'Room 301, Math Building',
        teacher: 'Prof. Smith',
        confidence: 0.95,
        status: 'new'
      },
      {
        id: '2',
        type: 'assignment_due',
  title: { zh: '机器学习作业1', en: 'Machine Learning Coursework 1' },
        course: 'CS7012',
        due_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        link: 'https://moodle.ucl.ac.uk',
        confidence: 0.92,
        status: 'new',
        description: 'Neural network implementation'
      },
      {
        id: '3',
        type: 'system_notice',
  title: { zh: '图书馆系统维护', en: 'Library System Maintenance' },
        start_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        end_at: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
        confidence: 0.98,
        status: 'new'
      }
    ],
    grades: [
      { course: 'STAT7001', assignment: 'Midterm Exam', grade: '85%', date: '2024-11-15' },
      { course: 'CS7012', assignment: 'Project 1', grade: '92%', date: '2024-11-10' },
      { course: 'MATH7003', assignment: 'Essay', grade: '78%', date: '2024-11-05' }
    ],
    jobFairs: [
  { id: '1', title: { zh: '科技招聘会 2024', en: 'Tech Career Fair 2024' }, date: '2024-12-05', location: 'Main Hall', companies: ['Google', 'Meta', 'Amazon'] },
  { id: '2', title: { zh: '金融招聘活动', en: 'Finance Recruitment Event' }, date: '2024-12-08', location: 'Business School', companies: ['JP Morgan', 'Goldman Sachs'] }
    ],
    clubs: [
  { id: '1', name: { zh: '中国学生学会', en: 'Chinese Students Association' }, members: 120, nextEvent: { zh: '文化之夜 - 12月3日', en: 'Cultural Night - Dec 3' } },
  { id: '2', name: { zh: '人工智能研究俱乐部', en: 'AI Research Club' }, members: 45, nextEvent: { zh: '研讨会 - 12月1日', en: 'Workshop - Dec 1' } }
    ]
  };
};
