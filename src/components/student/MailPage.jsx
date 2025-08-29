import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';

const MailPage = () => {
  const { userData } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('全部');
  const [aiSorting, setAiSorting] = useState(false);

  // 模拟邮件数据
  const [emails] = useState([
    {
      id: 1,
      sender: {
        name: 'Prof. Smith',
        category: '学术导师',
        avatar: 'PS',
        avatarClass: 'prof-avatar'
      },
      subject: 'Assignment 2 Feedback - Urgent Review Required',
      preview: '你好张伟，关于你提交的Assignment 2，我需要和你讨论一些重要的修改建议。请查看附件中的详细反馈，并安排时间进行一对一讨论...',
      timestamp: '2小时前',
      priority: '紧急',
      priorityClass: 'priority-high',
      tags: ['作业反馈', '重要'],
      unread: true,
      urgent: true
    },
    {
      id: 2,
      sender: {
        name: 'UCL Registry',
        category: '学校官方',
        avatar: 'UR',
        avatarClass: 'registry-avatar'
      },
      subject: 'Semester Results Available - Check Your Portal',
      preview: '亲爱的学生，您的本学期成绩已经公布，请登录学生门户网站查看详细成绩单。如有任何疑问，请联系学术事务办公室...',
      timestamp: '1天前',
      priority: '重要',
      priorityClass: 'priority-medium',
      tags: ['成绩通知', '官方'],
      unread: true,
      urgent: false
    },
    {
      id: 3,
      sender: {
        name: 'Career Services',
        category: '职业服务',
        avatar: 'CS',
        avatarClass: 'career-avatar'
      },
      subject: 'Tech Career Fair 2024 - Registration Now Open',
      preview: '技术职业博览会2024即将开始报名！这是与顶尖科技公司面对面交流的绝佳机会，包括Google、Microsoft、Amazon等知名企业...',
      timestamp: '3天前',
      priority: null,
      priorityClass: null,
      tags: ['职业发展', '招聘会'],
      unread: false,
      urgent: false
    }
  ]);

  const [filteredEmails, setFilteredEmails] = useState(emails);

  // 过滤邮件
  useEffect(() => {
    let filtered = emails;

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(email =>
        email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.preview.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.sender.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 标签过滤
    if (activeFilter !== '全部') {
      switch (activeFilter) {
        case '作业':
          filtered = filtered.filter(email => 
            email.tags.some(tag => tag.includes('作业'))
          );
          break;
        case '通知':
          filtered = filtered.filter(email => 
            email.tags.some(tag => tag.includes('通知'))
          );
          break;
        case '未读':
          filtered = filtered.filter(email => email.unread);
          break;
        case '已读':
          filtered = filtered.filter(email => !email.unread);
          break;
        default:
          break;
      }
    }

    setFilteredEmails(filtered);
  }, [searchTerm, activeFilter, emails]);

  // AI智能排序
  const handleAiSort = () => {
    setAiSorting(true);
    setTimeout(() => {
      // 模拟AI排序逻辑：紧急邮件优先
      const sorted = [...filteredEmails].sort((a, b) => {
        if (a.urgent && !b.urgent) return -1;
        if (!a.urgent && b.urgent) return 1;
        if (a.unread && !b.unread) return -1;
        if (!a.unread && b.unread) return 1;
        return 0;
      });
      setFilteredEmails(sorted);
      setAiSorting(false);
    }, 2000);
  };

  // 邮件操作
  const handleEmailAction = (emailId, action) => {
    switch (action) {
      case '标记为重要':
        console.log(`标记邮件 ${emailId} 为重要`);
        break;
      case '归档':
        console.log(`归档邮件 ${emailId}`);
        break;
      case '删除':
        if (window.confirm('确定要删除这封邮件吗？')) {
          console.log(`删除邮件 ${emailId}`);
        }
        break;
      default:
        break;
    }
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <div style={styles.container}>
      {/* 顶部导航 */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.userInfo}>
            <div style={styles.avatar}>
              {getInitials(userData?.name || '用户')}
            </div>
            <div style={styles.userDetails}>
              <h1 style={styles.title}>智能邮件中心</h1>
              <div style={styles.userStatus}>
                <div style={styles.statusDot}></div>
                <span>02:53 已同步</span>
              </div>
            </div>
          </div>
          <div style={styles.headerActions}>
            <button style={styles.actionBtn} title="语言切换">🌐</button>
            <button style={styles.actionBtn} title="通知">🔔</button>
            <button style={styles.actionBtn} title="设置">⚙️</button>
          </div>
        </div>
      </div>

      {/* AI智能摘要 */}
      <div style={styles.aiSummary}>
        <div style={styles.summaryContent}>
          <div style={styles.summaryHeader}>
            <div style={styles.aiIcon}>🤖</div>
            <div>
              <h2 style={styles.summaryTitle}>今日邮件摘要</h2>
              <p style={styles.summarySubtitle}>AI为您智能分析和归类邮件内容</p>
            </div>
          </div>
          <div style={styles.summaryStats}>
            <div style={styles.statItem}>
              <span style={styles.statNumber}>3</span>
              <span style={styles.statLabel}>紧急邮件</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statNumber}>7</span>
              <span style={styles.statLabel}>待处理</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statNumber}>2</span>
              <span style={styles.statLabel}>作业相关</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statNumber}>95%</span>
              <span style={styles.statLabel}>分类准确率</span>
            </div>
          </div>
        </div>
      </div>

      {/* 搜索和过滤栏 */}
      <div style={styles.searchFilterBar}>
        <div style={styles.searchSection}>
          <div style={styles.searchContainer}>
            <div style={styles.searchIcon}>🔍</div>
            <input
              type="text"
              style={styles.searchInput}
              placeholder="搜索邮件内容、发件人或关键词..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            style={styles.aiSortBtn}
            onClick={handleAiSort}
            disabled={aiSorting}
          >
            <span>{aiSorting ? '🔄' : '🧠'}</span>
            <span>{aiSorting ? 'AI排序中...' : 'AI智能排序'}</span>
          </button>
        </div>
        <div style={styles.filterTabs}>
          {['全部', '作业', '通知', '推广', '垃圾邮件', '已读', '未读'].map(filter => (
            <div
              key={filter}
              style={{
                ...styles.filterTab,
                ...(activeFilter === filter ? styles.filterTabActive : {})
              }}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
              {(filter === '作业' || filter === '未读') && (
                <span style={styles.badge}>
                  {filter === '作业' ? '2' : '5'}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 邮件列表 */}
      <div style={styles.mailList}>
        {filteredEmails.map(email => (
          <div
            key={email.id}
            style={{
              ...styles.mailItem,
              ...(email.unread ? styles.mailItemUnread : {}),
              ...(email.urgent ? styles.mailItemUrgent : {})
            }}
          >
            <div style={styles.mailHeader}>
              <div style={styles.senderInfo}>
                <div style={{
                  ...styles.senderAvatar,
                  ...styles[email.sender.avatarClass]
                }}>
                  {email.sender.avatar}
                </div>
                <div style={styles.senderDetails}>
                  <h3 style={styles.senderName}>{email.sender.name}</h3>
                  <div style={styles.senderCategory}>{email.sender.category}</div>
                </div>
              </div>
              <div style={styles.mailMeta}>
                <div style={styles.timeStamp}>{email.timestamp}</div>
                {email.priority && (
                  <div style={{
                    ...styles.priorityIndicator,
                    ...styles[email.priorityClass]
                  }}>
                    {email.priority}
                  </div>
                )}
                <div style={styles.mailActions}>
                  <button
                    style={styles.actionIcon}
                    title="标记为重要"
                    onClick={() => handleEmailAction(email.id, '标记为重要')}
                  >
                    ⭐
                  </button>
                  <button
                    style={styles.actionIcon}
                    title="归档"
                    onClick={() => handleEmailAction(email.id, '归档')}
                  >
                    📁
                  </button>
                  <button
                    style={styles.actionIcon}
                    title="删除"
                    onClick={() => handleEmailAction(email.id, '删除')}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
            <div style={styles.mailContent}>
              <div style={styles.mailSubject}>{email.subject}</div>
              <div style={styles.mailPreview}>{email.preview}</div>
            </div>
            <div style={styles.mailTags}>
              {email.tags.map((tag, index) => (
                <div
                  key={index}
                  style={{
                    ...styles.mailTag,
                    ...(tag.includes('作业') ? styles.tagAssignment : {}),
                    ...(tag.includes('通知') ? styles.tagNotification : {}),
                    ...(tag.includes('职业') ? styles.tagCareer : {})
                  }}
                >
                  {tag}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* AI建议面板 */}
      <div style={styles.aiSuggestions}>
        <div style={styles.suggestionsHeader}>
          <div style={styles.suggestionIcon}>💡</div>
          <div style={styles.suggestionsTitle}>AI智能建议</div>
        </div>
        <div style={styles.suggestionList}>
          <div style={styles.suggestionItem}>
            <div style={styles.suggestionBullet}></div>
            <div style={styles.suggestionText}>
              Prof. Smith的邮件标记为紧急，建议优先回复并安排面谈时间
            </div>
          </div>
          <div style={styles.suggestionItem}>
            <div style={styles.suggestionBullet}></div>
            <div style={styles.suggestionText}>
              成绩通知邮件可以自动添加到日历提醒中，避免错过重要截止日期
            </div>
          </div>
          <div style={styles.suggestionItem}>
            <div style={styles.suggestionBullet}></div>
            <div style={styles.suggestionText}>
              职业博览会信息建议转发给感兴趣的同学，增加networking机会
            </div>
          </div>
        </div>
      </div>

      {/* 浮动写邮件按钮 */}
      <button
        style={styles.composeFab}
        title="写邮件"
        onClick={() => alert('打开写邮件窗口（示例）')}
      >
        ✏️
      </button>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 16px',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  header: {
    background: '#fff',
    borderBottom: '1px solid #e2e8f0',
    padding: '16px 0',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  avatar: {
    width: '40px',
    height: '40px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: '600'
  },
  userDetails: {},
  title: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: '2px',
    margin: 0
  },
  userStatus: {
    fontSize: '12px',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  statusDot: {
    width: '6px',
    height: '6px',
    background: '#10b981',
    borderRadius: '50%'
  },
  headerActions: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  },
  actionBtn: {
    width: '40px',
    height: '40px',
    border: 'none',
    background: '#f1f5f9',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    color: '#64748b'
  },
  aiSummary: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '20px',
    padding: '24px',
    margin: '24px 0',
    color: '#fff',
    position: 'relative',
    overflow: 'hidden'
  },
  summaryContent: {
    position: 'relative',
    zIndex: 2
  },
  summaryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px'
  },
  aiIcon: {
    width: '40px',
    height: '40px',
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    backdropFilter: 'blur(10px)'
  },
  summaryTitle: {
    margin: 0,
    marginBottom: '4px'
  },
  summarySubtitle: {
    margin: 0,
    opacity: 0.9
  },
  summaryStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
    gap: '16px',
    marginTop: '16px'
  },
  statItem: {
    textAlign: 'center',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '12px',
    backdropFilter: 'blur(10px)'
  },
  statNumber: {
    fontSize: '24px',
    fontWeight: '700',
    marginBottom: '4px',
    display: 'block'
  },
  statLabel: {
    fontSize: '12px',
    opacity: 0.9
  },
  searchFilterBar: {
    background: '#fff',
    borderRadius: '16px',
    padding: '16px',
    marginBottom: '24px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e2e8f0'
  },
  searchSection: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px'
  },
  searchContainer: {
    position: 'relative',
    flex: 1
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#64748b',
    fontSize: '16px'
  },
  searchInput: {
    flex: 1,
    padding: '12px 16px 12px 40px',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '16px',
    background: '#f8fafc',
    width: '100%'
  },
  aiSortBtn: {
    padding: '12px 20px',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  filterTabs: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  filterTab: {
    padding: '8px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '20px',
    background: '#fff',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '14px',
    fontWeight: '500',
    position: 'relative'
  },
  filterTabActive: {
    background: '#667eea',
    color: '#fff',
    borderColor: '#667eea'
  },
  badge: {
    background: 'rgba(239, 68, 68, 0.9)',
    color: '#fff',
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: '600',
    marginLeft: '6px'
  },
  mailList: {
    background: '#fff',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e2e8f0'
  },
  mailItem: {
    padding: '20px',
    borderBottom: '1px solid #f1f5f9',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative'
  },
  mailItemUnread: {
    background: 'linear-gradient(90deg, rgba(102, 126, 234, 0.02), transparent)',
    borderLeft: '3px solid #667eea'
  },
  mailItemUrgent: {
    borderLeft: '3px solid #ef4444',
    background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.02), transparent)'
  },
  mailHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px'
  },
  senderInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  senderAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '14px',
    color: '#fff',
    flexShrink: 0
  },
  'prof-avatar': {
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
  },
  'registry-avatar': {
    background: 'linear-gradient(135deg, #10b981, #059669)'
  },
  'career-avatar': {
    background: 'linear-gradient(135deg, #f59e0b, #d97706)'
  },
  senderDetails: {},
  senderName: {
    fontWeight: '600',
    color: '#1a202c',
    fontSize: '16px',
    marginBottom: '2px',
    margin: 0
  },
  senderCategory: {
    fontSize: '12px',
    color: '#64748b'
  },
  mailMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  timeStamp: {
    fontSize: '12px',
    color: '#64748b'
  },
  priorityIndicator: {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600'
  },
  'priority-high': {
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#dc2626'
  },
  'priority-medium': {
    background: 'rgba(245, 158, 11, 0.1)',
    color: '#d97706'
  },
  mailActions: {
    display: 'flex',
    gap: '8px',
    opacity: 0,
    transition: 'opacity 0.2s ease'
  },
  actionIcon: {
    width: '32px',
    height: '32px',
    border: 'none',
    background: '#f1f5f9',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    color: '#64748b'
  },
  mailContent: {
    marginBottom: '12px'
  },
  mailSubject: {
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: '4px',
    fontSize: '15px'
  },
  mailPreview: {
    color: '#64748b',
    fontSize: '14px',
    lineHeight: '1.5'
  },
  mailTags: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginTop: '8px'
  },
  mailTag: {
    padding: '4px 8px',
    background: '#f1f5f9',
    borderRadius: '12px',
    fontSize: '11px',
    color: '#64748b',
    fontWeight: '500'
  },
  tagAssignment: {
    background: 'rgba(59, 130, 246, 0.1)',
    color: '#3b82f6'
  },
  tagNotification: {
    background: 'rgba(16, 185, 129, 0.1)',
    color: '#10b981'
  },
  tagCareer: {
    background: 'rgba(245, 158, 11, 0.1)',
    color: '#f59e0b'
  },
  aiSuggestions: {
    background: '#fff',
    borderRadius: '16px',
    padding: '20px',
    marginTop: '24px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e2e8f0'
  },
  suggestionsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px'
  },
  suggestionIcon: {
    width: '32px',
    height: '32px',
    background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '16px'
  },
  suggestionsTitle: {
    fontWeight: '600',
    color: '#1a202c'
  },
  suggestionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  suggestionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    background: '#f8fafc',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  suggestionBullet: {
    width: '8px',
    height: '8px',
    background: '#667eea',
    borderRadius: '50%',
    flexShrink: 0
  },
  suggestionText: {
    fontSize: '14px',
    color: '#374151',
    flex: 1
  },
  composeFab: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    width: '56px',
    height: '56px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    border: 'none',
    borderRadius: '16px',
    color: '#fff',
    fontSize: '24px',
    cursor: 'pointer',
    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
    transition: 'all 0.2s ease',
    zIndex: 1000
  }
};

export default MailPage;