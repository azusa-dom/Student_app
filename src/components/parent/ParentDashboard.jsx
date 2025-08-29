import React, { useEffect, useState } from "react";
import "./ParentDashboard.css"; // 把原来的 <style> 内容放到这个文件

const ParentDashboard = () => {
  useEffect(() => {
    // 进度环动画
    const percentage = 85
    const degrees = (percentage / 100) * 360
    const ring = document.querySelector('.progress-ring')
    if (ring) {
      ring.style.background = `conic-gradient(#9333ea 0deg ${degrees}deg, #e5e7eb ${degrees}deg 360deg)`
    }

    // 学科进度条动画
    document.querySelectorAll('.progress-fill').forEach((bar, index) => {
      const width = bar.dataset.width
      setTimeout(() => {
        bar.style.width = width
      }, index * 200)
    })
  }, [])

  const handleContact = (type) => {
    alert(
      type === 'student'
        ? '正在拨打张小明的电话...'
        : '正在连接UCL学生服务热线...'
    )
  }

  return (
    <div className="container">
      <header className="header">
        <div className="header-content">
          <div className="user-info">
            <div className="avatar">李</div>
            <div className="user-details">
              <h2>家长端</h2>
              <div className="user-status">
                <div className="status-dot"></div>
                <span>14:25 (孩子当地时间)</span>
              </div>
            </div>
          </div>
          <div className="header-actions">
            <button className="header-btn">🔔</button>
            <button className="header-btn">⚙️</button>
          </div>
        </div>
      </header>

      <main className="main-content">
        {/* 学生信息卡片 */}
        <div className="student-card animate-fade-in">
          <div className="student-info">
            <div className="student-avatar">🎓</div>
            <div className="student-details">
              <h3>张小明</h3>
              <p>University College London</p>
              <p>Computer Science - Year 2</p>
            </div>
          </div>
          <div className="student-stats">
            <div className="stat-item">
              <span className="stat-number">12</span>
              <span className="stat-label">本周课程</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">3</span>
              <span className="stat-label">待交作业</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">85%</span>
              <span className="stat-label">平均成绩</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">94%</span>
              <span className="stat-label">出勤率</span>
            </div>
          </div>
        </div>

        {/* 隐私提示 */}
        <div className="privacy-notice animate-fade-in">
          <div className="privacy-icon">🔒</div>
          <div className="privacy-content">
            <h4>隐私设置 - 部分可见</h4>
            <p>张小明已将可见级别设置为部分可见。</p>
          </div>
        </div>

        {/* AI 分析卡片 */}
        <div className="card ai-analysis-card animate-fade-in">
          <div className="card-header">
            <div className="card-icon ai-icon">🤖</div>
            <div className="card-title">AI成绩分析</div>
          </div>

          <div className="ai-section">
            <h4 className="ai-section-title">综合成绩</h4>
            <div className="performance-chart">
              <div className="chart-container">
                <div className="progress-ring">
                  <div className="progress-value">85%</div>
                  <div className="progress-label">综合成绩</div>
                </div>
              </div>
            </div>
          </div>

          <div className="ai-section">
            <h4 className="ai-section-title">学科对比</h4>
            <div className="subject-comparison">
              <div className="subject-bar">
                <div className="subject-info">
                  <span className="subject-name">计算机科学</span>
                  <span className="subject-score">92%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill excellent"
                    data-width="92%"
                  ></div>
                </div>
              </div>
              <div className="subject-bar">
                <div className="subject-info">
                  <span className="subject-name">统计学</span>
                  <span className="subject-score">85%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill good"
                    data-width="85%"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 紧急联系 */}
        <div className="card animate-fade-in">
          <div className="card-header">
            <div className="card-icon emergency-icon">📞</div>
            <div className="card-title">紧急联系</div>
          </div>
          <button
            className="contact-btn contact-student"
            onClick={() => handleContact('student')}
          >
            <div className="contact-info">
              <div className="contact-icon">📱</div>
              <div className="contact-details">
                <h4>呼叫张小明</h4>
                <p>+44 7XXX XXX XXX</p>
              </div>
            </div>
            <div className="contact-arrow">→</div>
          </button>
          <button
            className="contact-btn contact-school"
            onClick={() => handleContact('school')}
          >
            <div className="contact-info">
              <div className="contact-icon">🏫</div>
              <div className="contact-details">
                <h4>UCL学生服务</h4>
                <p>学校紧急热线</p>
              </div>
            </div>
            <div className="contact-arrow">→</div>
          </button>
        </div>
      </main>
    </div>
  );
};

export default ParentDashboard;
