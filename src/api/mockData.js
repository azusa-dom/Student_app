export const getMockData = async () => {
  // 模拟网络延迟
  await new Promise(res => setTimeout(res, 500));

  return {
    events: [
      {
        id: '1',
        type: 'class_event',
        title: 'Advanced Statistics Lecture',
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
        title: 'Machine Learning Coursework 1',
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
        title: 'Library System Maintenance',
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
      { id: '1', title: 'Tech Career Fair 2024', date: '2024-12-05', location: 'Main Hall', companies: ['Google', 'Meta', 'Amazon'] },
      { id: '2', title: 'Finance Recruitment Event', date: '2024-12-08', location: 'Business School', companies: ['JP Morgan', 'Goldman Sachs'] }
    ],
    clubs: [
      { id: '1', name: 'Chinese Students Association', members: 120, nextEvent: 'Cultural Night - Dec 3' },
      { id: '2', name: 'AI Research Club', members: 45, nextEvent: 'Workshop - Dec 1' }
    ]
  };
};
