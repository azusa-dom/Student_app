import React, { useState } from 'react';
import { Phone, AlertTriangle, Shield, Clock, MapPin, Globe, Heart, Users } from 'lucide-react';
import './EmergencyPage.css';

const EmergencyPage = () => {
  const [activeTab, setActiveTab] = useState('emergency');

  const emergencyContacts = [
    {
      id: 'police',
      icon: '🚔',
      title: '英国紧急报警',
      number: '999',
      description: '火警、急救、警察 - 24小时紧急服务',
      type: 'critical',
      available: '24/7全天候'
    },
    {
      id: 'non-emergency',
      icon: '📞',
      title: '非紧急警察热线',
      number: '101',
      description: '非紧急情况下的警察服务',
      type: 'standard',
      available: '24/7全天候'
    },
    {
      id: 'nhs',
      icon: '🏥',
      title: 'NHS 24小时热线',
      number: '111',
      description: '医疗建议和非紧急医疗服务',
      type: 'medical',
      available: '24/7全天候'
    }
  ];

  const personalContacts = [
    {
      id: 'parents',
      icon: '👨‍👩‍👧‍👦',
      title: '联系家人',
      description: '一键拨打家庭紧急联系人',
      action: 'call-family',
      type: 'family'
    },
    {
      id: 'ucl-security',
      icon: '🛡️',
      title: 'UCL 校园安全',
      number: '+44 20 3108 1000',
      description: '校园内紧急情况和安全服务',
      type: 'university',
      available: '24/7全天候'
    },
    {
      id: 'chinese-embassy',
      icon: '🇨🇳',
      title: '中国驻英领事馆',
      number: '+44 20 7299 4049',
      description: '领事保护和协助服务',
      type: 'consular',
      available: '工作时间'
    }
  ];

  const supportServices = [
    {
      id: 'mental-health',
      icon: '🧠',
      title: '心理健康支持',
      services: [
        { name: 'UCL学生心理咨询', number: '+44 20 7679 0100' },
        { name: 'Samaritans危机热线', number: '116 123' },
        { name: 'Mind心理健康慈善机构', number: '0300 123 3393' }
      ]
    },
    {
      id: 'academic-support',
      icon: '📚',
      title: '学术紧急支持',
      services: [
        { name: 'UCL学生服务', number: '+44 20 7679 3000' },
        { name: '国际学生办公室', number: '+44 20 7679 7765' },
        { name: '学术不端举报', number: '+44 20 7679 2000' }
      ]
    }
  ];

  const quickActions = [
    { id: 'location', icon: '📍', title: '发送位置', description: '向紧急联系人发送当前位置' },
    { id: 'medical', icon: '💊', title: '医疗信息', description: '查看个人医疗信息和过敏史' },
    { id: 'insurance', icon: '🛡️', title: '保险信息', description: '查看医疗保险和联系方式' },
    { id: 'embassy', icon: '🏛️', title: '领事服务', description: '快速访问领事馆服务' }
  ];

  const handleEmergencyCall = (number) => {
    if (number) {
      window.location.href = `tel:${number}`;
    }
  };

  const handleQuickAction = (actionId) => {
    console.log('执行快速操作:', actionId);
    // 这里可以添加具体的操作逻辑
  };

  return (
    <div className="emergency">
      <div className="container">
        {/* 头部警告区域 */}
        <div className="emergency-header animate-fade-in">
          <div className="header-content">
            <div className="alert-indicator">
              <AlertTriangle className="alert-icon" />
            </div>
            <h1>紧急联系中心</h1>
            <p>如遇紧急情况，请立即拨打相应电话获取帮助</p>
            
            <div className="quick-stats">
              <div className="stat-item critical">
                <span className="stat-number">999</span>
                <span className="stat-label">紧急报警</span>
              </div>
              <div className="stat-item medical">
                <span className="stat-number">111</span>
                <span className="stat-label">医疗热线</span>
              </div>
              <div className="stat-item university">
                <span className="stat-number">24/7</span>
                <span className="stat-label">校园安全</span>
              </div>
              <div className="stat-item consular">
                <Clock className="stat-icon" />
                <span className="stat-label">领事服务</span>
              </div>
            </div>
          </div>
        </div>

        {/* 标签导航 */}
        <div className="tab-navigation animate-fade-in">
          {[
            { id: 'emergency', label: '紧急联系', icon: <Phone className="tab-icon" /> },
            { id: 'support', label: '支持服务', icon: <Heart className="tab-icon" /> },
            { id: 'quick', label: '快速操作', icon: <Shield className="tab-icon" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* 紧急联系 */}
        {activeTab === 'emergency' && (
          <div className="emergency-grid">
            <div className="section-title">
              <h2>🚨 紧急服务热线</h2>
              <p className="muted">生命安全相关的紧急情况</p>
            </div>
            
            <div className="contacts-grid critical-contacts">
              {emergencyContacts.map((contact) => (
                <div key={contact.id} className={`contact-card ${contact.type} animate-fade-in`}>
                  <div className="contact-header">
                    <div className="contact-icon">{contact.icon}</div>
                    <div className="contact-info">
                      <h3>{contact.title}</h3>
                      <p>{contact.description}</p>
                      <div className="availability">
                        <Clock className="availability-icon" />
                        {contact.available}
                      </div>
                    </div>
                  </div>
                  
                  <div className="contact-action">
                    <button 
                      onClick={() => handleEmergencyCall(contact.number)}
                      className={`call-btn ${contact.type}`}
                    >
                      <Phone className="call-icon" />
                      <span className="call-number">{contact.number}</span>
                      <span className="call-text">立即拨打</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="section-title">
              <h2>👥 个人紧急联系</h2>
              <p className="muted">家人、学校和领事馆联系方式</p>
            </div>
            
            <div className="contacts-grid personal-contacts">
              {personalContacts.map((contact) => (
                <div key={contact.id} className={`contact-card ${contact.type} animate-fade-in`}>
                  <div className="contact-header">
                    <div className="contact-icon">{contact.icon}</div>
                    <div className="contact-info">
                      <h3>{contact.title}</h3>
                      <p>{contact.description}</p>
                      {contact.available && (
                        <div className="availability">
                          <Clock className="availability-icon" />
                          {contact.available}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="contact-action">
                    <button 
                      onClick={() => handleEmergencyCall(contact.number)}
                      className={`call-btn ${contact.type}`}
                    >
                      <Phone className="call-icon" />
                      {contact.number ? (
                        <>
                          <span className="call-number">{contact.number}</span>
                          <span className="call-text">拨打</span>
                        </>
                      ) : (
                        <span className="call-text">联系</span>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 支持服务 */}
        {activeTab === 'support' && (
          <div className="support-grid">
            {supportServices.map((service) => (
              <div key={service.id} className="support-card animate-fade-in">
                <div className="support-header">
                  <div className="support-icon">{service.icon}</div>
                  <div className="support-info">
                    <h3>{service.title}</h3>
                  </div>
                </div>
                
                <div className="support-services">
                  {service.services.map((item, index) => (
                    <div key={index} className="service-item">
                      <div className="service-info">
                        <span className="service-name">{item.name}</span>
                      </div>
                      <button 
                        onClick={() => handleEmergencyCall(item.number)}
                        className="service-call-btn"
                      >
                        <Phone className="service-call-icon" />
                        {item.number}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 快速操作 */}
        {activeTab === 'quick' && (
          <div className="quick-actions-grid">
            {quickActions.map((action) => (
              <div key={action.id} className="quick-action-card animate-fade-in">
                <div className="quick-action-icon">{action.icon}</div>
                <h3>{action.title}</h3>
                <p>{action.description}</p>
                <button 
                  onClick={() => handleQuickAction(action.id)}
                  className="quick-action-btn"
                >
                  执行操作
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 底部重要提示 */}
        <div className="emergency-footer animate-fade-in">
          <div className="footer-content">
            <div className="footer-icon">
              <Shield className="shield-icon" />
            </div>
            <div className="footer-info">
              <h3>重要提示</h3>
              <ul>
                <li>🚨 遇到生命危险立即拨打 <strong>999</strong></li>
                <li>🏥 非紧急医疗问题拨打 <strong>111</strong></li>
                <li>📱 保持手机电量充足，确保能够联系</li>
                <li>📍 记住您的准确位置信息</li>
                <li>🆔 随身携带身份证件和医疗信息</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyPage;
