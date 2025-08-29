import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const MobileStudentDashboard = ({ children }) => {
  const { userData, getInitials } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('home');

  // 添加时间更新效果
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 从当前路径获取活跃的标签
  useEffect(() => {
    const path = location.pathname.split('/').pop();
    setActiveTab(path || 'home');
  }, [location.pathname]);

  const handleTabClick = (tabId, path) => {
    setActiveTab(tabId);
    navigate(path);
  };

  const handleButtonClick = (e) => {
    // 波纹效果
    const button = e.currentTarget;
    const ripple = document.createElement('div');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255,255,255,0.4);
      transform: scale(0);
      animation: ripple 0.6s linear;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      pointer-events: none;
    `;
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  };

  if (location.pathname !== '/student/home' && location.pathname !== '/student') {
    return (
      <div style={{ paddingBottom: '80px' }}>
        {children}
        {/* 底部导航 */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '414px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(0, 0, 0, 0.06)',
          padding: '12px 20px',
          zIndex: 100
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '4px'
          }}>
            {[
              { id: 'home', icon: '🏠', label: '首页', path: '/student/home' },
              { id: 'mail', icon: '📧', label: '邮件', path: '/student/mail' },
              { id: 'grades', icon: '📊', label: '成绩', path: '/student/grades' },
              { id: 'campus', icon: '🏫', label: '校园', path: '/student/campus' },
              { id: 'jobs', icon: '💼', label: '就业', path: '/student/jobs' },
              { id: 'ai', icon: '🤖', label: 'AI助手', path: '/student/ai' },
              { id: 'settings', icon: '⚙️', label: '设置', path: '/student/settings' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={(e) => {
                  handleButtonClick(e);
                  handleTabClick(item.id, item.path);
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '8px 4px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: activeTab === item.id ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'none',
                  border: 'none',
                  color: activeTab === item.id ? 'white' : '#6b7280'
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>{item.icon}</div>
                <div style={{
                  fontSize: '10px',
                  fontWeight: '500',
                  lineHeight: 1
                }}>{item.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '414px',
      margin: '0 auto',
      background: 'white',
      minHeight: '100vh',
      position: 'relative'
    }}>
      <style>
        {`
          @keyframes ripple {
            to {
              transform: scale(4);
              opacity: 0;
            }
          }
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .fade-in-up {
            animation: fadeInUp 0.5s ease-out forwards;
          }
        `}
      </style>

      {/* 状态栏 */}
      <div style={{
        padding: '12px 20px 8px',
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.95), rgba(118, 75, 162, 0.95))',
        backdropFilter: 'blur(20px)',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '14px',
        fontWeight: '500'
      }}>
        <span>{currentTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
        <span>🔋 85%</span>
      </div>

      {/* 用户头部 */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          content: '',
          position: 'absolute',
          top: '-50%',
          right: '-20px',
          width: '200px',
          height: '200px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          zIndex: 1
        }}></div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 2
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '16px',
              background: userData.avatar ? `url(${userData.avatar}) center/cover` : 'linear-gradient(135deg, #4facfe, #00f2fe)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '18px',
              color: 'white',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}>
              {!userData.avatar && getInitials()}
            </div>
            <div>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '2px'
              }}>{userData.name} - UCL</h2>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '12px',
                opacity: 0.9
              }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  background: '#10b981',
                  borderRadius: '50%',
                  marginRight: '6px'
                }}></div>
                在线活跃
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={(e) => {
                handleButtonClick(e);
                // 这里可以添加语言切换逻辑
              }}
              style={{
                width: '36px',
                height: '36px',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >🌐</button>
            <button
              onClick={(e) => {
                handleButtonClick(e);
                // 这里可以添加通知逻辑
              }}
              style={{
                width: '36px',
                height: '36px',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >🔔</button>
          </div>
        </div>
      </div>

      {/* 活动预览卡片 */}
      <div className="fade-in-up" style={{
        margin: '20px',
        background: 'white',
        borderRadius: '20px',
        padding: '20px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#10b981',
            fontWeight: '600',
            fontSize: '14px'
          }}>
            ⏰ 乐活瑜伽
          </div>
          <button
            onClick={handleButtonClick}
            style={{
              background: '#10b981',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >预备参加</button>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(6, 182, 212, 0.05))',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px'
          }}>
            <span style={{
              fontSize: '12px',
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>⏰ 17:00 - 18:00</span>
            <span style={{
              fontSize: '12px',
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>📍 体育中心</span>
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              color: '#059669',
              padding: '4px 8px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: '500'
            }}>25/30 人参与</div>
          </div>
          <p style={{ color: '#6b7280', fontSize: '12px', margin: '8px 0' }}>促进身心健康，增强体质</p>
        </div>
      </div>

      {/* 概览统计 */}
      <div style={{ padding: '0 20px 20px' }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: '16px'
        }}>你今天有 4 个重要事项需要关注</h3>
        
        <div className="fade-in-up" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '16px',
            textAlign: 'center',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '4px'
            }}>2</div>
            <div style={{
              fontSize: '11px',
              color: '#6b7280',
              fontWeight: '500'
            }}>今日截止</div>
          </div>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '16px',
            textAlign: 'center',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '4px'
            }}>1</div>
            <div style={{
              fontSize: '11px',
              color: '#6b7280',
              fontWeight: '500'
            }}>课程</div>
          </div>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '16px',
            textAlign: 'center',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '4px'
            }}>3</div>
            <div style={{
              fontSize: '11px',
              color: '#6b7280',
              fontWeight: '500'
            }}>活动</div>
          </div>
        </div>

        {/* 快捷操作 */}
        <div className="fade-in-up" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          marginBottom: '20px'
        }}>
          {[
            { icon: '📚', label: '打开Moodle', bg: '#3b82f6', action: () => navigate('/student/campus') },
            { icon: '📊', label: '查看成绩', bg: '#10b981', action: () => navigate('/student/grades') },
            { icon: '📝', label: '查看课表', bg: '#f59e0b', action: () => navigate('/student/campus') }
          ].map((action, index) => (
            <button
              key={index}
              onClick={(e) => {
                handleButtonClick(e);
                action.action();
              }}
              style={{
                background: 'white',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                borderRadius: '16px',
                padding: '16px 12px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.06)'
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                margin: '0 auto 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                color: 'white',
                fontWeight: 'bold',
                background: action.bg
              }}>{action.icon}</div>
              <div style={{
                fontSize: '11px',
                color: '#4b5563',
                fontWeight: '500'
              }}>{action.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 智能卡片流 */}
      <div style={{ padding: '0 20px' }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: '16px'
        }}>智能卡片流</h3>

        {/* 课程卡片 */}
        {[
          {
            icon: '📊',
            title: '高级统计课程',
            code: 'STAT7001',
            date: '今天 14:00',
            location: 'Room 101',
            instructor: 'Prof. Smith',
            iconBg: 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
          },
          {
            icon: '⏰',
            title: '机器学习作业1',
            code: 'CS7012',
            due: '3天后截止',
            isDue: true,
            iconBg: 'linear-gradient(135deg, #f59e0b, #d97706)'
          },
          {
            icon: '📚',
            title: '图书馆系统维护',
            date: '明天 09:00',
            iconBg: 'linear-gradient(135deg, #10b981, #059669)'
          }
        ].map((course, index) => (
          <div key={index} className="fade-in-up" style={{
            background: 'white',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '12px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              content: '',
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '4px',
              background: 'linear-gradient(180deg, #667eea, #764ba2)'
            }}></div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: course.iconBg,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '14px'
              }}>{course.icon}</div>
              <div>
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '2px'
                }}>{course.title}</h3>
                {course.code && (
                  <div style={{
                    fontSize: '11px',
                    color: '#6b7280',
                    fontWeight: '500'
                  }}>{course.code}</div>
                )}
              </div>
            </div>
            
            {course.isDue && (
              <div style={{
                background: '#fef3c7',
                color: '#92400e',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '11px',
                marginBottom: '12px'
              }}>{course.due}</div>
            )}
            
            {(course.date || course.location || course.instructor) && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '12px',
                fontSize: '11px',
                color: '#6b7280'
              }}>
                {course.date && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    📅 {course.date}
                  </span>
                )}
                {course.location && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    📍 {course.location}
                  </span>
                )}
              </div>
            )}
            
            {course.instructor && (
              <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px' }}>
                教师: {course.instructor}
              </p>
            )}
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleButtonClick}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: '#3b82f6',
                  color: 'white'
                }}
              >加入日历</button>
              <button
                onClick={handleButtonClick}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: '#f3f4f6',
                  color: '#4b5563'
                }}
              >稍后查看</button>
            </div>
          </div>
        ))}
      </div>

      {/* 新成绩 */}
      <div style={{ padding: '0 20px 20px' }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: '16px'
        }}>新成绩</h3>

        {[
          { course: 'STAT7001', score: '85%', label: 'Midterm Exam', progress: 85 },
          { course: 'CS7012', score: '92%', label: 'Project 1', progress: 92 }
        ].map((grade, index) => (
          <div key={index} className="fade-in-up" style={{
            background: 'white',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '12px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#1f2937',
                flex: 1
              }}>{grade.course}</div>
              <div style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#10b981'
              }}>{grade.score}</div>
            </div>
            <div style={{
              fontSize: '11px',
              color: '#6b7280',
              marginBottom: '8px'
            }}>{grade.label}</div>
            <div style={{
              width: '100%',
              height: '6px',
              background: '#f3f4f6',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                background: 'linear-gradient(90deg, #10b981, #059669)',
                borderRadius: '3px',
                transition: 'width 0.3s ease',
                width: `${grade.progress}%`
              }}></div>
            </div>
          </div>
        ))}
      </div>

      {/* 底部导航 */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '414px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(0, 0, 0, 0.06)',
        padding: '12px 20px',
        zIndex: 100
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '4px'
        }}>
          {[
            { id: 'home', icon: '🏠', label: '首页', path: '/student/home' },
            { id: 'mail', icon: '📧', label: '邮件', path: '/student/mail' },
            { id: 'grades', icon: '📊', label: '成绩', path: '/student/grades' },
            { id: 'campus', icon: '🏫', label: '校园', path: '/student/campus' },
            { id: 'jobs', icon: '💼', label: '就业', path: '/student/jobs' },
            { id: 'ai', icon: '🤖', label: 'AI助手', path: '/student/ai' },
            { id: 'settings', icon: '⚙️', label: '设置', path: '/student/settings' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={(e) => {
                handleButtonClick(e);
                handleTabClick(item.id, item.path);
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '8px 4px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: activeTab === item.id ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'none',
                border: 'none',
                color: activeTab === item.id ? 'white' : '#6b7280'
              }}
            >
              <div style={{
                width: '20px',
                height: '20px',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>{item.icon}</div>
              <div style={{
                fontSize: '10px',
                fontWeight: '500',
                lineHeight: 1
              }}>{item.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 浮动操作按钮 */}
      <button
        onClick={handleButtonClick}
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '20px',
          width: '56px',
          height: '56px',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          border: 'none',
          borderRadius: '16px',
          color: 'white',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
          transition: 'all 0.2s ease',
          zIndex: 99
        }}
      >+</button>
    </div>
  );
};

export default MobileStudentDashboard;
