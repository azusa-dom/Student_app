import React, { useState } from 'react';
import { 
  FileText, 
  Phone, 
  MapPin, 
  Calendar, 
  Users, 
  ExternalLink,
  BookOpen,
  Clock,
  Mail,
  Wifi,
  GraduationCap,
  Building,
  Search,
  Star,
  Navigation
} from 'lucide-react';
import './CampusPage.css';

const CampusPage = () => {
  const [activeTab, setActiveTab] = useState('services');
  const [searchTerm, setSearchTerm] = useState('');

  const handleTabSwitch = (tabId) => {
    setActiveTab(tabId);
  };

  const handleSearch = () => {
    console.log('搜索:', searchTerm);
  };

  const services = [
    {
      id: 'academic',
      icon: '📚',
      title: '学术注册处',
      description: '成绩单、注册信息、学籍记录管理',
      primaryUrl: 'https://www.ucl.ac.uk/academic-registry',
      primaryText: '🎓 访问学术服务',
      subLinks: [
        { name: '成绩单申请', url: 'https://www.ucl.ac.uk/academic-registry/transcripts' },
        { name: '课程注册', url: 'https://www.ucl.ac.uk/academic-registry/registration' },
        { name: '学位证书', url: 'https://www.ucl.ac.uk/academic-registry/certificates' },
        { name: '学术记录', url: 'https://www.ucl.ac.uk/academic-registry/records' },
        { name: '毕业申请', url: 'https://www.ucl.ac.uk/academic-registry/graduation' }
      ]
    },
    {
      id: 'support',
      icon: '🤝',
      title: '学生支持服务',
      description: '心理咨询、经济援助、生活指导',
      primaryUrl: 'https://www.ucl.ac.uk/students',
      primaryText: '💪 获取支持帮助',
      subLinks: [
        { name: '心理健康咨询', url: 'https://www.ucl.ac.uk/students/support-and-wellbeing' },
        { name: '经济援助', url: 'https://www.ucl.ac.uk/students/funding' },
        { name: '学习技能支持', url: 'https://www.ucl.ac.uk/students/academic-support' },
        { name: '住宿服务', url: 'https://www.ucl.ac.uk/accommodation' },
        { name: '国际学生服务', url: 'https://www.ucl.ac.uk/students/international-students' }
      ]
    },
    {
      id: 'campus',
      icon: '🗺️',
      title: '校园地图导航',
      description: '建筑位置、设施导航、交通指引',
      primaryUrl: 'https://www.ucl.ac.uk/maps',
      primaryText: '🧭 探索校园',
      subLinks: [
        { name: '互动地图', url: 'https://www.ucl.ac.uk/maps' },
        { name: '建筑查找', url: 'https://www.ucl.ac.uk/estates/buildings' },
        { name: '交通指南', url: 'https://www.ucl.ac.uk/about/getting-here' },
        { name: '停车信息', url: 'https://www.ucl.ac.uk/estates/parking' },
        { name: '无障碍设施', url: 'https://www.ucl.ac.uk/students/support-and-wellbeing/disability-support' }
      ]
    },
    {
      id: 'events',
      icon: '📅',
      title: '活动日历',
      description: '讲座、研讨会、重要截止日期',
      primaryUrl: 'https://www.ucl.ac.uk/events',
      primaryText: '🎯 查看所有活动',
      subLinks: [
        { name: '学术讲座', url: 'https://www.ucl.ac.uk/events/lectures' },
        { name: '研讨会', url: 'https://www.ucl.ac.uk/events/seminars' },
        { name: '学术截止日期', url: 'https://www.ucl.ac.uk/students/academic-calendar' },
        { name: '社交活动', url: 'https://studentsunionucl.org/events' },
        { name: '会议预订', url: 'https://www.ucl.ac.uk/estates/room-booking' }
      ]
    },
    {
      id: 'organizations',
      icon: '👥',
      title: '学生组织',
      description: '社团、学会、课外活动',
      primaryUrl: 'https://studentsunionucl.org',
      primaryText: '🌟 加入社团',
      subLinks: [
        { name: '学生会', url: 'https://studentsunionucl.org' },
        { name: '社团列表', url: 'https://studentsunionucl.org/clubs-societies' },
        { name: '志愿服务', url: 'https://studentsunionucl.org/volunteering' },
        { name: '体育俱乐部', url: 'https://studentsunionucl.org/sport' },
        { name: '创建社团', url: 'https://studentsunionucl.org/start-society' }
      ]
    }
  ];

  const quickLinks = [
    {
      id: 'moodle',
      icon: '💻',
      title: 'Moodle',
      description: '在线学习平台',
      url: 'https://moodle.ucl.ac.uk',
      category: 'academic'
    },
    {
      id: 'library',
      icon: '📖',
      title: 'UCL图书馆',
      description: '图书资源和学习空间',
      url: 'https://www.ucl.ac.uk/library',
      category: 'academic'
    },
    {
      id: 'timetable',
      icon: '⏰',
      title: '课程表',
      description: '个人课程安排',
      url: 'https://timetable.ucl.ac.uk',
      category: 'academic'
    },
    {
      id: 'grades',
      icon: '📊',
      title: '成绩查询',
      description: '学术成绩和评估',
      url: 'https://portico.ucl.ac.uk',
      category: 'academic'
    },
    {
      id: 'email',
      icon: '📧',
      title: 'UCL邮箱',
      description: '学校电子邮件系统',
      url: 'https://outlook.office365.com',
      category: 'communication'
    },
    {
      id: 'wifi',
      icon: '📶',
      title: 'WiFi服务',
      description: '校园网络连接',
      url: 'https://www.ucl.ac.uk/isd/services/get-connected/wifi',
      category: 'technical'
    }
  ];

  const campusStats = [
    { number: '180+', label: '建筑物' },
    { number: '42,000+', label: '在校学生' },
    { number: '300+', label: '学生社团' },
    { number: '24/7', label: '图书馆开放' }
  ];

  const featuredServices = [
    {
      id: 'portico',
      icon: '🏛️',
      title: 'Portico学生门户',
      description: '一站式学生服务平台',
      features: ['课程注册', '成绩查询', '费用缴纳', '个人信息']
    },
    {
      id: 'myucl',
      icon: '📱',
      title: 'MyUCL应用',
      description: '移动端校园服务',
      features: ['校园地图', '课程表', '图书馆', '活动信息']
    }
  ];

  return (
    <div className="campus">
      <div className="container">
        {/* 头部区域 */}
        <div className="header animate-fade-in">
          <div className="header-content">
            <h1>UCL 校园服务中心</h1>
            <p>一站式校园生活服务，让您的学习生活更便捷高效</p>
            
            <div className="quick-stats">
              {campusStats.map((stat, index) => (
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
              placeholder="搜索校园服务、建筑位置、联系方式..."
              className="search-input"
            />
            <button onClick={handleSearch} className="search-btn">
              <Search className="search-icon" />
              搜索服务
            </button>
          </div>
        </div>

        {/* 标签导航 */}
        <div className="tab-navigation animate-fade-in">
          {[
            { id: 'services', label: '校园服务', icon: <Building className="tab-icon" /> },
            { id: 'quick', label: '快速链接', icon: <Star className="tab-icon" /> },
            { id: 'featured', label: '特色服务', icon: <GraduationCap className="tab-icon" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabSwitch(tab.id)}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* 校园服务 */}
        {activeTab === 'services' && (
          <div className="services-grid">
            {services.map((service) => (
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
                    <ExternalLink className="link-icon" />
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

        {/* 快速链接 */}
        {activeTab === 'quick' && (
          <div className="quick-links-section">
            <div className="section-title">
              <h2>🚀 常用快速链接</h2>
              <p className="muted">一键访问最常用的校园服务</p>
            </div>
            
            <div className="quick-links-grid">
              {quickLinks.map((link) => (
                <div key={link.id} className="quick-link-card animate-fade-in">
                  <div className="quick-link-header">
                    <div className="quick-link-icon">{link.icon}</div>
                    <div className="quick-link-info">
                      <h3>{link.title}</h3>
                      <p>{link.description}</p>
                    </div>
                  </div>
                  
                  <div className="quick-link-action">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="quick-link-btn"
                    >
                      <span>立即访问</span>
                      <ExternalLink className="btn-icon" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 特色服务 */}
        {activeTab === 'featured' && (
          <div className="featured-services">
            <div className="section-title">
              <h2>⭐ 特色服务平台</h2>
              <p className="muted">UCL为您提供的专业服务平台</p>
            </div>
            
            <div className="featured-grid">
              {featuredServices.map((service) => (
                <div key={service.id} className="featured-card animate-fade-in">
                  <div className="featured-header">
                    <div className="featured-icon">{service.icon}</div>
                    <div className="featured-info">
                      <h3>{service.title}</h3>
                      <p>{service.description}</p>
                    </div>
                  </div>
                  
                  <div className="featured-features">
                    <h4>主要功能：</h4>
                    <div className="features-list">
                      {service.features.map((feature, index) => (
                        <span key={index} className="feature-tag">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="featured-actions">
                    <button className="featured-btn primary">
                      <Navigation className="btn-icon" />
                      立即使用
                    </button>
                    <button className="featured-btn secondary">
                      <BookOpen className="btn-icon" />
                      使用指南
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 底部帮助卡片 */}
        <div className="campus-footer animate-fade-in">
          <div className="footer-content">
            <div className="footer-icon">
              <Phone className="help-icon" />
            </div>
            <div className="footer-info">
              <h3>需要帮助？</h3>
              <p>如果您在使用校园服务时遇到任何问题，请随时联系我们</p>
              <div className="help-contacts">
                <div className="contact-item">
                  <Phone className="contact-icon" />
                  <span>IT服务台：+44 20 7679 5000</span>
                </div>
                <div className="contact-item">
                  <Mail className="contact-icon" />
                  <span>学生服务：student.services@ucl.ac.uk</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampusPage;
