import React, { useEffect, useRef } from 'react'
import './ParentDashboard.css'

export default function ParentDashboard() {
  const rootRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    // 进入动画延迟
    root.querySelectorAll('.animate-fade-in').forEach((el, i) => {
      el.style.animationDelay = `${i * 0.1}s`
    })

    // 进度环
    const ring = root.querySelector('.progress-ring')
    if (ring) {
      const percentage = 85
      const degrees = (percentage / 100) * 360
      ring.style.background = `conic-gradient(#9333ea 0deg ${degrees}deg, #e5e7eb ${degrees}deg 360deg)`
    }

    // 学科进度条动画
    const bars = Array.from(root.querySelectorAll('.progress-fill'))
    bars.forEach((bar, i) => {
      const target = bar.style.width || '0%'
      bar.style.width = '0%'
      // 强制重排
      // eslint-disable-next-line no-unused-expressions
      bar.offsetWidth
      setTimeout(() => {
        bar.style.width = target
      }, i * 200)
    })

    // AI 分析卡片：可折叠
    const sections = Array.from(root.querySelectorAll('.ai-analysis-card .ai-section'))
    const cleanups = []
    sections.forEach(section => {
      const title = section.querySelector('.ai-section-title')
      if (!title) return
      if (title.textContent.trim() === '总体表现') return
      const content = title.parentElement.children[1]
      title.style.cursor = 'pointer'
      const onClick = () => {
        if (!content) return
        const hidden = content.style.display === 'none'
        content.style.display = hidden ? 'block' : 'none'
        title.style.opacity = hidden ? '1' : '0.6'
      }
      title.addEventListener('click', onClick)
      cleanups.push(() => title.removeEventListener('click', onClick))
    })

    return () => cleanups.forEach(fn => fn())
  }, [])

  const bounceClick = e => {
    const el = e.currentTarget
    el.style.transform = 'scale(0.98)'
    setTimeout(() => {
      el.style.transform = ''
    }, 100)
  }

  const handleContact = who => {
    if (who === 'student') {
      alert('正在拨打张小明的电话...')
    } else {
      alert('正在连接UCL学生服务热线...')
    }
  }

  const handleReport = () => {
    alert('跳转到详细周报页面...')
  }

  return (
    <div className="parent-dashboard" ref={rootRef}>
      <div className="header">
        <div className="container">
          <div className="header-content">
            <div className="user-info">
              <div className="avatar">李</div>
              <div className="user-details">
                <h2>家长端</h2>
                <div className="user-status">
                  <div className="status-dot" />
                  <span>14:25 (孩子当地时间)</span>
                </div>
              </div>
            </div>
            <div className="header-actions">
              <button className="header-btn" title="通知设置">🔔</button>
              <button className="header-btn" title="设置">⚙️</button>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="main-content">
          {/* 孩子信息卡片 */}
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

          {/* 隐私设置通知 */}
          <div className="privacy-notice animate-fade-in">
            <div className="privacy-icon">🔒</div>
            <div className="privacy-content">
              <h4>隐私设置 - 部分可见</h4>
              <p>张小明已将可见级别设置为部分可见。您可以查看课程安排、作业截止时间和部分成绩信息，但无法查看详细的邮件内容和Moodle链接。</p>
            </div>
          </div>

          <div className="content-grid">
            {/* 近期安排 */}
            <div className="card animate-fade-in">
              <div className="card-header">
                <div className="card-icon schedule-icon">📅</div>
                <div className="card-title">近期安排</div>
              </div>

              <div className="schedule-item" onClick={bounceClick}>
                <div className="schedule-type type-class">📚</div>
                <div className="schedule-details">
                  <h4>高等数学</h4>
                  <div className="schedule-meta">
                    <span>明天 09:00 - 11:00</span>
                    <span>数学系大楼 A101</span>
                  </div>
                </div>
              </div>

              <div className="schedule-item" onClick={bounceClick}>
                <div className="schedule-type type-assignment">📝</div>
                <div className="schedule-details">
                  <h4>机器学习作业</h4>
                  <div className="schedule-meta">
                    <span className="urgent">截止: 后天 23:59</span>
                    <span>CS7012 课程作业</span>
                  </div>
                </div>
              </div>

              <div className="schedule-item" onClick={bounceClick}>
                <div className="schedule-type type-exam">🎯</div>
                <div className="schedule-details">
                  <h4>期中考试</h4>
                  <div className="schedule-meta">
                    <span>下周五 14:00 - 17:00</span>
                    <span>统计学 STAT7001</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 成绩概览 */}
            <div className="card animate-fade-in">
              <div className="card-header">
                <div className="card-icon grades-icon">📊</div>
                <div className="card-title">成绩概览</div>
              </div>

              <div className="grade-item" onClick={bounceClick}>
                <div className="grade-info">
                  <h4>STAT7001</h4>
                  <p>期中考试</p>
                </div>
                <div className="grade-score">85%</div>
              </div>

              <div className="grade-item" onClick={bounceClick}>
                <div className="grade-info">
                  <h4>CS7012</h4>
                  <p>项目作业1</p>
                </div>
                <div className="grade-score">92%</div>
              </div>

              <div className="grade-item" onClick={bounceClick}>
                <div className="grade-info">
                  <h4>MATH7003</h4>
                  <p>课堂测验</p>
                </div>
                <div className="grade-score">78%</div>
              </div>
            </div>

            {/* AI 成绩分析 */}
            <div className="card ai-analysis-card animate-fade-in">
              <div className="card-header">
                <div className="card-icon ai-icon">🤖</div>
                <div className="card-title">AI成绩分析</div>
              </div>

              {/* 总体表现 */}
              <div className="ai-section">
                <h4 className="ai-section-title">总体表现</h4>
                <div className="performance-chart">
                  <div className="chart-container">
                    <div className="progress-ring">
                      <div className="progress-value">85%</div>
                      <div className="progress-label">综合成绩</div>
                    </div>
                    <div className="trend-indicator trending-up">
                      <span className="trend-arrow">↗</span>
                      <span className="trend-text">较上月提升3%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI 洞察 */}
              <div className="ai-section">
                <h4 className="ai-section-title">智能洞察</h4>
                <div className="insight-list">
                  <div className="insight-item insight-positive">
                    <div className="insight-icon">✅</div>
                    <div className="insight-content">
                      <strong>优势科目：</strong>计算机科学表现优异，项目作业得分92%，建议继续保持编程实践
                    </div>
                  </div>
                  <div className="insight-item insight-warning">
                    <div className="insight-icon">⚠️</div>
                    <div className="insight-content">
                      <strong>需要关注：</strong>数学基础课程成绩偏低(78%)，建议增加练习时间
                    </div>
                  </div>
                  <div className="insight-item insight-info">
                    <div className="insight-icon">💡</div>
                    <div className="insight-content">
                      <strong>学习建议：</strong>统计学成绩稳定，可尝试更高难度的数据分析项目
                    </div>
                  </div>
                </div>
              </div>

              {/* 学科对比 */}
              <div className="ai-section">
                <h4 className="ai-section-title">学科表现对比</h4>
                <div className="subject-comparison">
                  <div className="subject-bar">
                    <div className="subject-info">
                      <span className="subject-name">计算机科学</span>
                      <span className="subject-score">92%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill excellent" style={{ width: '92%' }} />
                    </div>
                    <div className="subject-rank">专业排名: 前15%</div>
                  </div>

                  <div className="subject-bar">
                    <div className="subject-info">
                      <span className="subject-name">统计学</span>
                      <span className="subject-score">85%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill good" style={{ width: '85%' }} />
                    </div>
                    <div className="subject-rank">专业排名: 前30%</div>
                  </div>

                  <div className="subject-bar">
                    <div className="subject-info">
                      <span className="subject-name">数学基础</span>
                      <span className="subject-score">78%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill fair" style={{ width: '78%' }} />
                    </div>
                    <div className="subject-rank">专业排名: 前50%</div>
                  </div>
                </div>
              </div>

              {/* 改进建议 */}
              <div className="ai-section">
                <h4 className="ai-section-title">个性化建议</h4>
                <div className="recommendations">
                  <div className="recommendation-item">
                    <div className="rec-priority high">高优先级</div>
                    <div className="rec-content">
                      <h5>加强数学基础</h5>
                      <p>建议每周额外安排2-3小时数学练习，重点关注微积分和线性代数</p>
                    </div>
                  </div>
                  <div className="recommendation-item">
                    <div className="rec-priority medium">中优先级</div>
                    <div className="rec-content">
                      <h5>拓展计算机项目</h5>
                      <p>考虑参与开源项目或实习，将理论知识应用到实际项目中</p>
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

            {/* 本周摘要 */}
            <div className="card animate-fade-in">
              <div className="card-header">
                <div className="card-icon summary-icon">📋</div>
                <div className="card-title">本周摘要</div>
              </div>
              <div className="summary-item summary-success">
                <div className="summary-indicator">✓</div>
                <div className="summary-text">本周按时完成2项作业</div>
              </div>
              <div className="summary-item summary-warning">
                <div className="summary-indicator">!</div>
                <div className="summary-text">1项作业即将到期</div>
              </div>
              <div className="summary-item summary-info">
                <div className="summary-indicator">i</div>
                <div className="summary-text">下周有重要考试</div>
              </div>
            </div>
          </div>

          {/* 底部操作 */}
          <div className="bottom-actions">
            <button className="primary-btn" onClick={handleReport}>
              查看详细周报
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
