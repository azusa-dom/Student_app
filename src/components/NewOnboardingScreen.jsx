import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const NewOnboardingScreen = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const selectRole = (role) => {
    // 移除之前的选择
    setSelectedRole(role);
  };

  const continueLogin = () => {
    if (!selectedRole) return;

    // 创建用户数据
    const userData = {
      id: Date.now(),
      name: selectedRole === 'student' ? '张伟' : '家长用户',
      role: selectedRole
    };

    // 登录用户
    login(userData, selectedRole);

    // 导航到相应的仪表板
    if (selectedRole === 'student') {
      navigate('/student');
    } else {
      navigate('/parent');
    }
  };

  return (
    <div style={{
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
      fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* 背景装饰 */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        zIndex: 1
      }}>
        <div className="floating-shape shape1" style={{
          position: 'absolute',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          width: '80px',
          height: '80px',
          top: '20%',
          left: '10%',
          animation: 'float 6s ease-in-out infinite'
        }}></div>
        <div className="floating-shape shape2" style={{
          position: 'absolute',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          width: '120px',
          height: '120px',
          top: '60%',
          right: '15%',
          animation: 'float 6s ease-in-out infinite 2s'
        }}></div>
        <div className="floating-shape shape3" style={{
          position: 'absolute',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          bottom: '20%',
          left: '20%',
          animation: 'float 6s ease-in-out infinite 4s'
        }}></div>
        <div className="floating-shape shape4" style={{
          position: 'absolute',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          width: '100px',
          height: '100px',
          top: '10%',
          right: '30%',
          animation: 'float 6s ease-in-out infinite 1s'
        }}></div>
      </div>
      
      <div style={{
        position: 'relative',
        zIndex: 10,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '48px 40px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), 0 0 20px rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        animation: 'slideUp 0.8s ease-out'
      }}>
        {/* 认证状态 */}
        <div style={{
          background: 'linear-gradient(90deg, #10b981, #059669)',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '16px',
          fontSize: '14px',
          textAlign: 'center',
          marginBottom: '32px',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
          animation: 'slideDown 0.8s ease-out 0.2s both'
        }}>
          <svg style={{
            display: 'inline-block',
            width: '16px',
            height: '16px',
            marginRight: '8px',
            verticalAlign: 'middle'
          }} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          身份验证已通过 · 请选择您的身份继续
        </div>
        
        {/* 欢迎部分 */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px',
          animation: 'fadeIn 0.8s ease-out 0.4s both'
        }}>
          <div style={{
            width: '72px',
            height: '72px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            borderRadius: '20px',
            margin: '0 auto 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            color: 'white',
            fontWeight: 'bold',
            boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
            animation: 'logoSpin 0.8s ease-out 0.6s both'
          }}>智</div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '8px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>欢迎使用</h1>
          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            fontWeight: '400'
          }}>智能校园生活助手</p>
        </div>
        
        {/* 角色选择 */}
        <div style={{
          marginBottom: '32px',
          animation: 'slideUp 0.8s ease-out 0.8s both'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '20px',
            textAlign: 'center'
          }}>请选择您的身份</h2>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div 
              onClick={() => selectRole('student')}
              style={{
                position: 'relative',
                padding: '20px 24px',
                border: selectedRole === 'student' ? '2px solid #667eea' : '2px solid #e5e7eb',
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: selectedRole === 'student' 
                  ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))' 
                  : 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                boxShadow: selectedRole === 'student' ? '0 8px 25px rgba(102, 126, 234, 0.15)' : 'none'
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                flexShrink: 0,
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white'
              }}>🎓</div>
              <div style={{ flexGrow: 1 }}>
                <div style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '4px'
                }}>学生</div>
                <div style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  lineHeight: '1.4'
                }}>管理课程、作业和校园生活，获得AI学习辅导</div>
              </div>
              {selectedRole === 'student' && (
                <>
                  <div style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '24px',
                    height: '24px',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    borderRadius: '50%',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}></div>
                  <div style={{
                    position: 'absolute',
                    right: '22px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>✓</div>
                </>
              )}
            </div>
            
            <div 
              onClick={() => selectRole('parent')}
              style={{
                position: 'relative',
                padding: '20px 24px',
                border: selectedRole === 'parent' ? '2px solid #667eea' : '2px solid #e5e7eb',
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: selectedRole === 'parent' 
                  ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))' 
                  : 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                boxShadow: selectedRole === 'parent' ? '0 8px 25px rgba(102, 126, 234, 0.15)' : 'none'
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                flexShrink: 0,
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: 'white'
              }}>👥</div>
              <div style={{ flexGrow: 1 }}>
                <div style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '4px'
                }}>家长</div>
                <div style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  lineHeight: '1.4'
                }}>关注孩子学习动态，接收学校重要通知</div>
              </div>
              {selectedRole === 'parent' && (
                <>
                  <div style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '24px',
                    height: '24px',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    borderRadius: '50%',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}></div>
                  <div style={{
                    position: 'absolute',
                    right: '22px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>✓</div>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* 继续按钮 */}
        <button 
          onClick={continueLogin}
          disabled={!selectedRole}
          style={{
            width: '100%',
            padding: '16px 24px',
            background: selectedRole ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#d1d5db',
            color: 'white',
            border: 'none',
            borderRadius: '16px',
            fontSize: '18px',
            fontWeight: '600',
            cursor: selectedRole ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s ease',
            boxShadow: selectedRole ? '0 4px 15px rgba(102, 126, 234, 0.4)' : 'none',
            animation: 'slideUp 0.8s ease-out 1s both',
            opacity: selectedRole ? 1 : 0.6
          }}
        >
          开始使用
        </button>
      </div>
      
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
          
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes logoSpin {
            from {
              opacity: 0;
              transform: scale(0.5) rotate(-180deg);
            }
            to {
              opacity: 1;
              transform: scale(1) rotate(0deg);
            }
          }
        `}
      </style>
    </div>
  );
};

export default NewOnboardingScreen;
