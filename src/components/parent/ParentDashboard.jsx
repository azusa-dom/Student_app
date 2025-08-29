import React, { useEffect, useState } from "react";
import "./ParentDashboard.css"; // 把原来的 <style> 内容放到这个文件

const ParentDashboard = () => {
  const [progress, setProgress] = useState(85); // AI成绩分析百分比
  const [expandedSections, setExpandedSections] = useState({}); // AI分析展开/收缩

  // 模拟页面加载动画
  useEffect(() => {
    const elements = document.querySelectorAll(".animate-fade-in");
    elements.forEach((el, index) => {
      el.style.animationDelay = `${index * 0.1}s`;
    });
  }, []);

  // 点击展开/收缩 AI 分析 section
  const toggleSection = (title) => {
    setExpandedSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const handleContact = (type) => {
    if (type === "student") {
      alert("正在拨打张小明的电话...");
    } else {
      alert("正在连接UCL学生服务热线...");
    }
  };

  const handleReport = () => {
    alert("跳转到详细周报页面...");
  };

  return (
    <div>
      {/* 顶部导航 */}
      <div className="header">
        <div className="container">
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
              <button className="header-btn" title="通知设置">
                🔔
              </button>
              <button className="header-btn" title="设置">
                ⚙️
              </button>
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
              <p>
                张小明已将可见级别设置为部分可见。您可以查看课程安排、作业截止时间和部分成绩信息，但无法查看详细的邮件内容和Moodle链接。
              </p>
            </div>
          </div>

          {/* 内容网格 */}
          <div className="content-grid">
            {/* 近期安排 */}
            <div className="card animate-fade-in">
              <div className="card-header">
                <div className="card-icon schedule-icon">📅</div>
                <div className="card-title">近期安排</div>
              </div>
              <div className="schedule-item">
                <div className="schedule-type type-class">📚</div>
                <div className="schedule-details">
                  <h4>高等数学</h4>
                  <div className="schedule-meta">
                    <span>明天 09:00 - 11:00</span>
                    <span>数学系大楼 A101</span>
                  </div>
                </div>
              </div>
              <div className="schedule-item">
                <div className="schedule-type type-assignment">📝</div>
                <div className="schedule-details">
                  <h4>机器学习作业</h4>
                  <div className="schedule-meta">
                    <span className="urgent">截止: 后天 23:59</span>
                    <span>CS7012 课程作业</span>
                  </div>
                </div>
              </div>
              <div className="schedule-item">
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
              <div className="grade-item">
                <div className="grade-info">
                  <h4>STAT7001</h4>
                  <p>期中考试</p>
                </div>
                <div className="grade-score">85%</div>
              </div>
              <div className="grade-item">
                <div className="grade-info">
                  <h4>CS7012</h4>
                  <p>项目作业1</p>
                </div>
                <div className="grade-score">92%</div>
              </div>
              <div className="grade-item">
                <div className="grade-info">
                  <h4>MATH7003</h4>
                  <p>课堂测验</p>
                </div>
                <div className="grade-score">78%</div>
              </div>
            </div>

            {/* AI成绩分析 */}
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
                    <div
                      className="progress-ring"
                      style={{
                        background: `conic-gradient(#9333ea 0deg ${
                          (progress / 100) * 360
                        }deg, #e5e7eb ${(progress / 100) * 360}deg 360deg)`,
                      }}
                    >
                      <div className="progress-value">{progress}%</div>
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
                <h4
                  className="ai-section-title"
                  onClick={() => toggleSection("insights")}
                >
                  智能洞察
                </h4>
                {!expandedSections["insights"] && (
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
                )}
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
                onClick={() => handleContact("student")}
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
                onClick={() => handleContact("school")}
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
  );
};

export default ParentDashboard;
