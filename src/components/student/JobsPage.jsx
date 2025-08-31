import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import './JobsPage.css';

const JobsPage = () => {
  const { getThemeConfig } = useTheme();
  const themeConfig = getThemeConfig();
  const [activeTab, setActiveTab] = useState('services');
  const [searchTerm, setSearchTerm] = useState('');

  const handleTabSwitch = (tabId) => {
    setActiveTab(tabId);
  };

  const handleSearch = () => {
    console.log('搜索:', searchTerm);
    // 这里可以添加搜索逻辑
  };

  const services = [
    {
      id: 'jobs',
      icon: '💼',
      title: '工作与实习机会',
      description: '探索全球顶尖企业的工作和实习机会，找到完美的职业起点',
      primaryUrl: 'https://www.ucl.ac.uk/careers/opportunities',
      primaryText: '🚀 浏览所有机会',
      subLinks: [
        { name: '工作与实习', url: 'https://www.ucl.ac.uk/careers/opportunities/jobs-and-internships' },
        { name: '毕业生职位', url: 'https://www.ucl.ac.uk/careers/opportunities/graduate-jobs' },
        { name: '实习项目', url: 'https://www.ucl.ac.uk/careers/opportunities/internships' },
        { name: '兼职工作', url: 'https://www.ucl.ac.uk/careers/opportunities/part-time-jobs' },
        { name: '虚拟工作体验', url: 'https://www.ucl.ac.uk/careers/simulated-work-experience' },
        { name: '海外工作', url: 'https://www.ucl.ac.uk/careers/work-abroad' }
      ]
    },
    {
      id: 'applications',
      icon: '📝',
      title: '申请材料准备',
      description: '专业的简历、求职信指导，让你的申请材料脱颖而出',
      primaryUrl: 'https://www.ucl.ac.uk/careers/applications-and-interviews',
      primaryText: '✍️ 申请指导中心',
      subLinks: [
        { name: '简历制作', url: 'https://www.ucl.ac.uk/careers/applications-and-interviews/cvs-and-applications' },
        { name: '求职信写作', url: 'https://www.ucl.ac.uk/careers/applications-and-interviews/cover-letters' },
        { name: '申请表填写', url: 'https://www.ucl.ac.uk/careers/applications-and-interviews/application-forms' },
        { name: 'LinkedIn优化', url: 'https://www.ucl.ac.uk/careers/applications-and-interviews/linkedin' },
        { name: '简历自动检查', url: 'https://www.ucl.ac.uk/careers/applying/applications' }
      ]
    },
    {
      id: 'interviews',
      icon: '🎯',
      title: '面试与评估',
      description: '全面的面试技巧训练和评估中心准备，提升面试成功率',
      primaryUrl: 'https://www.ucl.ac.uk/careers/applications-and-interviews/interviews',
      primaryText: '💪 面试训练营',
      subLinks: [
        { name: '面试准备', url: 'https://www.ucl.ac.uk/careers/applications-and-interviews/interviews/interview-preparation' },
        { name: '评估中心', url: 'https://www.ucl.ac.uk/careers/applications-and-interviews/interviews/assessment-centres' },
        { name: '视频面试', url: 'https://www.ucl.ac.uk/careers/applications-and-interviews/interviews/video-interviews' },
        { name: '在线面试练习', url: 'https://www.ucl.ac.uk/careers/applying/interviews' },
        { name: '技能评估测试', url: 'https://www.ucl.ac.uk/careers/skills' }
      ]
    },
    {
      id: 'guidance',
      icon: '👥',
      title: '一对一职业指导',
      description: '预约专业的职业顾问，获得个性化的职业发展建议',
      primaryUrl: 'https://www.ucl.ac.uk/careers/advice',
      primaryText: '📅 预约咨询',
      subLinks: [
        { name: '预约系统', url: 'https://www.ucl.ac.uk/careers/about-us/appointments' },
        { name: '职业建议', url: 'https://www.ucl.ac.uk/careers/about-us/careers-advice' },
        { name: '个人门户', url: 'https://www.ucl.ac.uk/careers/myuclcareers' },
        { name: '职业选择', url: 'https://www.ucl.ac.uk/careers/options' }
      ]
    }
  ];

  const events = [
    {
      id: 'spring-fair',
      icon: '🏢',
      title: '春季职业博览会',
      date: '2024年3月15日',
      location: 'UCL主校区',
      time: '10:00-16:00',
      companies: ['Google', 'Microsoft', 'Goldman Sachs', 'BCG', '+50家企业'],
      registrationUrl: 'https://www.ucl.ac.uk/careers/fairs',
      detailsUrl: 'https://www.ucl.ac.uk/careers/fairs'
    },
    {
      id: 'tech-insight',
      icon: '🎓',
      title: '技术行业洞察日',
      date: '2024年3月22日',
      location: '在线活动',
      time: '14:00-17:00',
      companies: ['AI/ML', '区块链', '云计算', '数据科学'],
      registrationUrl: 'https://www.ucl.ac.uk/careers/sector-insight-events',
      detailsUrl: 'https://www.ucl.ac.uk/careers/sector-insight-events'
    }
  ];

  const resources = [
    {
      id: 'skills',
      icon: '🧠',
      title: '技能发展中心',
      description: '提升核心技能，增强就业竞争力',
      primaryUrl: 'https://www.ucl.ac.uk/careers/resources',
      primaryText: '📚 技能提升',
      subLinks: [
        { name: '技能发展', url: 'https://www.ucl.ac.uk/careers/resources/skills-development' },
        { name: '职业规划', url: 'https://www.ucl.ac.uk/careers/resources/career-planning' },
        { name: '社团活动', url: 'https://studentsunionucl.org/clubs-societies' },
        { name: '志愿服务', url: 'https://studentsunionucl.org/volunteering' }
      ]
    },
    {
      id: 'industry',
      icon: '🏭',
      title: '行业深度解析',
      description: '深入了解各行业发展趋势和就业前景',
      primaryUrl: 'https://www.ucl.ac.uk/careers/industry-insights',
      primaryText: '🔍 行业分析',
      subLinks: [
        { name: '金融服务', url: 'https://www.ucl.ac.uk/careers/sectors/financial-services' },
        { name: '科技行业', url: 'https://www.ucl.ac.uk/careers/sectors/technology' },
        { name: '医疗健康', url: 'https://www.ucl.ac.uk/careers/sectors/healthcare' },
        { name: '咨询服务', url: 'https://www.ucl.ac.uk/careers/sectors/consulting' }
      ]
    }
  ];

  // 设置CSS变量来控制主题：深色模式卡片为半透明白而非灰
  const prefersDark = themeConfig.text.includes('dark:text-white') || themeConfig.text.includes('text-white');
  const cardBg = prefersDark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.80)';
  
  return (
    <div 
      className="career" 
      style={{
        '--card-bg': cardBg,
        '--text-color': themeConfig.text.includes('text-white') ? '#ffffff' : '#1f2937',
        '--text-secondary': themeConfig.textSecondary.includes('text-gray-300') ? '#d1d5db' : '#6b7280'
      }}
    >
      <div className="container">
        {/* 头部区域 */}
        <div className="header animate-fade-in">
          <div className="header-content">
            <h1>UCL 职业服务中心</h1>
            <p>全方位职业发展支持，助力你的未来职业之路</p>
            
            <div className="quick-stats">
              {[
                { number: '500+', label: '合作雇主' },
                { number: '95%', label: '就业率' },
                { number: '1000+', label: '年度活动' },
                { number: '24/7', label: '在线支持' }
              ].map((stat, index) => (
                <div key={index} className="stat-item">
                  <span className="stat-number">{stat.number}</span>
                  <span className="stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 搜索栏 */}
        <div className="search-bar animate-fade-in">
          <div className="search-input-group">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索职位、公司、行业或技能..."
              className="search-input"
            />
            <button onClick={handleSearch} className="search-btn">
              🔍 搜索机会
            </button>
          </div>
        </div>

        {/* 标签导航 */}
        <div className="tab-navigation animate-fade-in">
          {[
            { id: 'services', label: '核心服务' },
            { id: 'events', label: '活动博览' },
            { id: 'resources', label: '学习资源' },
            { id: 'special', label: '专项支持' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabSwitch(tab.id)}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 核心服务 */}
        {activeTab === 'services' && (
          <div className="services-grid">
            {(services || []).map((service) => (
              <div key={service.id} className="service-card animate-fade-in">
                <div className="service-header">
                  <div className="service-icon">{service.icon}</div>
                  <div className="service-info">
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                  </div>
                </div>
                
                <div className="service-links">
                  <a
                    href={service.primaryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="primary-link"
                  >
                    {service.primaryText}
                  </a>
                  
                  <div className="sub-links">
                    {service.subLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sub-link"
                      >
                        {link.name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 活动博览 */}
        {activeTab === 'events' && (
          <div className="events-grid">
            {(events || []).map((event) => (
              <div key={event.id} className="event-card animate-fade-in">
                <div className="event-header">
                  <div className="event-icon">{event.icon}</div>
                  <div className="event-info">
                    <h3>{event.title}</h3>
                    <div className="event-meta">
                      <span>📅 {event.date}</span>
                      <span>📍 {event.location}</span>
                      <span>⏰ {event.time}</span>
                    </div>
                  </div>
                </div>
                
                <div className="event-companies">
                  {event.companies.map((company, index) => (
                    <span key={index} className="company-tag">{company}</span>
                  ))}
                </div>
                
                <div className="event-actions">
                  <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                    🎯 立即报名
                  </a>
                  <a href={event.detailsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                    📋 查看详情
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 学习资源 */}
        {activeTab === 'resources' && (
          <div className="services-grid">
            {(resources || []).map((resource) => (
              <div key={resource.id} className="service-card animate-fade-in">
                <div className="service-header">
                  <div className="service-icon">{resource.icon}</div>
                  <div className="service-info">
                    <h3>{resource.title}</h3>
                    <p>{resource.description}</p>
                  </div>
                </div>
                
                <div className="service-links">
                  <a
                    href={resource.primaryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="primary-link"
                  >
                    {resource.primaryText}
                  </a>
                  
                  <div className="sub-links">
                    {resource.subLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sub-link"
                      >
                        {link.name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 专项支持 */}
        {activeTab === 'special' && (
          <div className="special-services animate-fade-in">
            <h2>专项支持服务</h2>
            <p className="muted center sm">我们为不同背景的学生提供量身定制的职业支持</p>
            
            <div className="special-grid">
              {[
                { icon: '🌍', title: '国际学生支持', description: '签证、工作许可和文化适应指导' },
                { icon: '♿', title: '无障碍就业服务', description: '为有特殊需求的学生提供个性化支持' },
                { icon: '🎓', title: '研究生职业发展', description: '针对研究生和博士生的高级职业规划' },
                { icon: '💡', title: '创业孵化项目', description: '支持学生创业想法的孵化和实现' }
              ].map((item, index) => (
                <div key={index} className="special-item">
                  <div className="service-icon alt-green">{item.icon}</div>
                  <h3>{item.title}</h3>
                  <p className="muted">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsPage;
