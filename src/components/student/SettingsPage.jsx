import React, { useState } from 'react';
import { 
  User, Mail, Phone, BookOpen, Bell, Shield, Settings as SettingsIcon, 
  Link, HelpCircle, ChevronRight, ChevronDown, Globe, Clock, 
  Palette, Download, Upload, Trash2, Eye, EyeOff, Calendar,
  FileText, Camera, Edit3, Save, X, Check, AlertTriangle
} from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';
import AvatarUploader from './AvatarUploader';
import ThemeSettings from './ThemeSettings';

const SettingsPage = () => {
  const { selectedProvider, userType } = useAppContext();
  const { t, language, changeLanguage } = useLanguage();
  const [expandedSections, setExpandedSections] = useState({
    profile: true,
    academic: false,
    notifications: false,
    privacy: false,
    app: false,
    connections: false,
    support: false,
    parent: false
  });
  
  const [editingProfile, setEditingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [profileData, setProfileData] = useState({
    name: t('user.name'),
    university: t('user.university'),
    studentId: 'ZCAB1234',
    email: 'zhang.wei.23@ucl.ac.uk',
    phone: '+44 7700 123456',
    year: '2023/24',
    programme: 'MSc Computer Science'
  });

  const [notifications, setNotifications] = useState({
    assignments: true,
    grades: true,
    events: true,
    emails: false,
    deadlines: true,
    calendar: true
  });

  const [privacySettings, setPrivacySettings] = useState({
    parentAccess: {
      courses: true,
      assignments: true,
      grades: false,
      activities: true,
      location: false
    },
    dataSharing: {
      analytics: true,
      research: false,
      marketing: false
    }
  });

  const [appSettings, setAppSettings] = useState({
    language: language,
    theme: 'light',
    timezone: 'Europe/London',
    autoSync: 'daily'
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleProfileSave = () => {
    setEditingProfile(false);
    setSaveSuccess(true);
    // 这里可以添加保存到后端的逻辑
    console.log('Profile saved:', profileData);
    
    // 显示保存成功提示，3秒后消失
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  const SettingSection = ({ id, title, icon: Icon, children, badge = null }) => {
    const isExpanded = expandedSections[id];
    
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <button
          onClick={() => toggleSection(id)}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-t-xl"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon className="w-4 h-4 text-blue-600" />
            </div>
            <span className="font-semibold text-gray-900">{title}</span>
            {badge && (
              <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                {badge}
              </span>
            )}
          </div>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
        </button>
        
        {isExpanded && (
          <div className="p-4 pt-0 border-t border-gray-100">
            {children}
          </div>
        )}
      </div>
    );
  };

  const SwitchToggle = ({ enabled, onChange, label, description }) => (
    <div className="flex items-center justify-between py-2">
      <div className="flex-1">
        <div className="font-medium text-gray-900 text-sm">{label}</div>
        {description && (
          <div className="text-xs text-gray-500 mt-1">{description}</div>
        )}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* 保存成功提示 */}
      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center space-x-3">
          <Check className="w-5 h-5 text-green-600" />
          <div>
            <h3 className="font-medium text-green-800">保存成功！</h3>
            <p className="text-sm text-green-600">您的个人信息已更新</p>
          </div>
        </div>
      )}

      {/* 页面标题 */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('settings.title')}</h1>
        <p className="text-gray-600">{t('settings.description')}</p>
      </div>

      {/* 个人资料 */}
      <SettingSection id="profile" title={t('settings.profile.title')} icon={User}>
        <div className="space-y-6">
          {/* 头像上传 */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-semibold text-lg">张</span>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">头像</h3>
              <p className="text-sm text-gray-500 mb-2">点击上传新头像</p>
              <button className="text-blue-600 text-sm font-medium">更改头像</button>
            </div>
          </div>

          {/* 基本信息 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">基本信息</h3>
              <div className="flex items-center space-x-2">
                {editingProfile && (
                  <button
                    onClick={() => {
                      setEditingProfile(false);
                      // 重置数据到原始状态
                      setProfileData({
                        name: t('user.name'),
                        university: t('user.university'),
                        studentId: 'ZCAB1234',
                        email: 'zhang.wei.23@ucl.ac.uk',
                        phone: '+44 7700 123456',
                        year: '2023/24',
                        programme: 'MSc Computer Science'
                      });
                    }}
                    className="flex items-center space-x-1 text-gray-600 text-sm font-medium hover:text-gray-800"
                  >
                    <X className="w-4 h-4" />
                    <span>取消</span>
                  </button>
                )}
                <button
                  onClick={() => editingProfile ? handleProfileSave() : setEditingProfile(true)}
                  className="flex items-center space-x-1 text-blue-600 text-sm font-medium hover:text-blue-700"
                >
                  {editingProfile ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                  <span>{editingProfile ? '保存' : '编辑'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
        <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                {editingProfile ? (
                  <input
          id="profile-name"
          name="profile-name"
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.name}</p>
                )}
              </div>

              <div>
        <label htmlFor="profile-student-id" className="block text-sm font-medium text-gray-700 mb-1">学号</label>
                {editingProfile ? (
                  <input
          id="profile-student-id"
          name="profile-student-id"
                    type="text"
                    value={profileData.studentId}
                    onChange={(e) => setProfileData(prev => ({ ...prev, studentId: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.studentId}</p>
                )}
              </div>

              <div>
        <label htmlFor="profile-email" className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                {editingProfile ? (
                  <input
          id="profile-email"
          name="profile-email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.email}</p>
                )}
              </div>

              <div>
        <label htmlFor="profile-phone" className="block text-sm font-medium text-gray-700 mb-1">电话</label>
                {editingProfile ? (
                  <input
          id="profile-phone"
          name="profile-phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">大学</label>
                <p className="text-gray-900">{profileData.university}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">专业</label>
                <p className="text-gray-900">{profileData.programme}</p>
              </div>
            </div>
          </div>
        </div>
      </SettingSection>

      {/* 学术设置 */}
      <SettingSection id="academic" title="学术设置" icon={BookOpen}>
        <div className="space-y-4">
          <div>
            <label htmlFor="select-academic-year" className="block text-sm font-medium text-gray-700 mb-2">学年选择</label>
            <select id="select-academic-year" name="select-academic-year" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="2023/24">2023/24学年</option>
              <option value="2024/25">2024/25学年</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">成绩显示偏好</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="radio" name="gradeDisplay" value="percentage" defaultChecked className="mr-2" />
                <span className="text-sm">百分比 (70%)</span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="gradeDisplay" value="letter" className="mr-2" />
                <span className="text-sm">字母等级 (A, B, C)</span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="gradeDisplay" value="gpa" className="mr-2" />
                <span className="text-sm">GPA (4.0)</span>
              </label>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">日历同步</h4>
            <SwitchToggle
              enabled={true}
              onChange={() => {}}
              label="Moodle日历同步"
              description="自动同步课程和作业截止日期"
            />
            <SwitchToggle
              enabled={false}
              onChange={() => {}}
              label="Google Calendar同步"
              description="将学术事件同步到Google日历"
            />
          </div>
        </div>
      </SettingSection>

      {/* 通知管理 */}
      <SettingSection id="notifications" title="通知管理" icon={Bell} badge="3">
        <div className="space-y-4">
          <SwitchToggle
            enabled={notifications.assignments}
            onChange={(value) => setNotifications(prev => ({ ...prev, assignments: value }))}
            label="作业截止提醒"
            description="在作业截止前24小时和1小时提醒"
          />
          <SwitchToggle
            enabled={notifications.grades}
            onChange={(value) => setNotifications(prev => ({ ...prev, grades: value }))}
            label="成绩更新通知"
            description="有新成绩发布时立即通知"
          />
          <SwitchToggle
            enabled={notifications.events}
            onChange={(value) => setNotifications(prev => ({ ...prev, events: value }))}
            label="活动通知"
            description="社团活动和学校活动提醒"
          />
          <SwitchToggle
            enabled={notifications.emails}
            onChange={(value) => setNotifications(prev => ({ ...prev, emails: value }))}
            label="邮件同步"
            description="同步学校邮箱的重要邮件"
          />
          
          <div className="pt-4 border-t border-gray-100">
            <h4 className="font-medium text-gray-900 mb-2">通知时间设置</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="quiet-start" className="block text-sm text-gray-700 mb-1">安静时间开始</label>
                <input id="quiet-start" name="quiet-start" type="time" defaultValue="22:00" className="w-full p-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label htmlFor="quiet-end" className="block text-sm text-gray-700 mb-1">安静时间结束</label>
                <input id="quiet-end" name="quiet-end" type="time" defaultValue="08:00" className="w-full p-2 border border-gray-300 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </SettingSection>

      {/* 隐私与安全 */}
      <SettingSection id="privacy" title="隐私与安全" icon={Shield}>
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">家长访问控制</h4>
            <div className="space-y-2">
              <SwitchToggle
                enabled={privacySettings.parentAccess.courses}
                onChange={(value) => setPrivacySettings(prev => ({
                  ...prev,
                  parentAccess: { ...prev.parentAccess, courses: value }
                }))}
                label="课程信息可见"
                description="家长可以查看课程表和课程详情"
              />
              <SwitchToggle
                enabled={privacySettings.parentAccess.assignments}
                onChange={(value) => setPrivacySettings(prev => ({
                  ...prev,
                  parentAccess: { ...prev.parentAccess, assignments: value }
                }))}
                label="作业进度可见"
                description="家长可以查看作业截止日期和完成状态"
              />
              <SwitchToggle
                enabled={privacySettings.parentAccess.grades}
                onChange={(value) => setPrivacySettings(prev => ({
                  ...prev,
                  parentAccess: { ...prev.parentAccess, grades: value }
                }))}
                label="成绩信息可见"
                description="家长可以查看考试成绩和GPA"
              />
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">数据管理</h4>
            <div className="space-y-3">
              <button className="flex items-center space-x-2 text-blue-600 font-medium">
                <Download className="w-4 h-4" />
                <span>导出我的数据</span>
              </button>
              <button className="flex items-center space-x-2 text-blue-600 font-medium">
                <Upload className="w-4 h-4" />
                <span>备份设置</span>
              </button>
              <button className="flex items-center space-x-2 text-red-600 font-medium">
                <Trash2 className="w-4 h-4" />
                <span>删除账户</span>
              </button>
            </div>
          </div>
        </div>
      </SettingSection>

      {/* 应用设置 */}
      <SettingSection id="app" title="应用设置" icon={SettingsIcon}>
        <div className="space-y-4">
          <ThemeSettings />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">语言选择</label>
            <select 
              value={appSettings.language}
              onChange={(e) => setAppSettings(prev => ({ ...prev, language: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="zh-CN">中文 (简体)</option>
              <option value="zh-TW">中文 (繁体)</option>
              <option value="en-GB">English (UK)</option>
              <option value="en-US">English (US)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">主题选择</label>
            <div className="grid grid-cols-3 gap-2">
              <button 
                className={`p-3 border rounded-lg text-center ${appSettings.theme === 'light' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                onClick={() => setAppSettings(prev => ({ ...prev, theme: 'light' }))}
              >
                <div className="w-6 h-6 bg-white border border-gray-300 rounded mx-auto mb-1"></div>
                <span className="text-xs">浅色</span>
              </button>
              <button 
                className={`p-3 border rounded-lg text-center ${appSettings.theme === 'dark' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                onClick={() => setAppSettings(prev => ({ ...prev, theme: 'dark' }))}
              >
                <div className="w-6 h-6 bg-gray-800 rounded mx-auto mb-1"></div>
                <span className="text-xs">深色</span>
              </button>
              <button 
                className={`p-3 border rounded-lg text-center ${appSettings.theme === 'auto' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                onClick={() => setAppSettings(prev => ({ ...prev, theme: 'auto' }))}
              >
                <div className="w-6 h-6 bg-gradient-to-r from-white to-gray-800 rounded mx-auto mb-1"></div>
                <span className="text-xs">自动</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">时区</label>
            <select 
              value={appSettings.timezone}
              onChange={(e) => setAppSettings(prev => ({ ...prev, timezone: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Europe/London">伦敦 (GMT+0)</option>
              <option value="Asia/Shanghai">北京 (GMT+8)</option>
              <option value="America/New_York">纽约 (GMT-5)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">自动同步频率</label>
            <select 
              value={appSettings.autoSync}
              onChange={(e) => setAppSettings(prev => ({ ...prev, autoSync: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="realtime">实时同步</option>
              <option value="hourly">每小时</option>
              <option value="daily">每日</option>
              <option value="manual">手动同步</option>
            </select>
          </div>
        </div>
      </SettingSection>

      {/* 连接服务 */}
      <SettingSection id="connections" title="连接服务" icon={Link}>
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Gmail</div>
                  <div className="text-sm text-gray-500">zhang.wei@gmail.com</div>
                </div>
              </div>
              <button className="text-green-600 text-sm font-medium">已连接</button>
            </div>

            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Moodle</div>
                  <div className="text-sm text-gray-500">UCL官方学习平台</div>
                </div>
              </div>
              <button className="text-blue-600 text-sm font-medium">连接</button>
            </div>

            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Google Calendar</div>
                  <div className="text-sm text-gray-500">日历同步服务</div>
                </div>
              </div>
              <button className="text-blue-600 text-sm font-medium">连接</button>
            </div>
          </div>
        </div>
      </SettingSection>

      {/* 支持与反馈 */}
      <SettingSection id="support" title="支持与反馈" icon={HelpCircle}>
        <div className="space-y-3">
          <button className="flex items-center justify-between w-full p-3 text-left hover:bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-900">帮助中心</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button className="flex items-center justify-between w-full p-3 text-left hover:bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-900">报告问题</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button className="flex items-center justify-between w-full p-3 text-left hover:bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Edit3 className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-900">功能建议</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <div className="pt-3 border-t border-gray-100">
            <div className="text-sm text-gray-500">
              <p className="mb-1">版本信息：v1.2.0</p>
              <p>最后更新：2025年8月27日</p>
            </div>
          </div>
        </div>
      </SettingSection>

      {/* 家长端特有设置 (仅在家长模式下显示) */}
      {userType === 'parent' && (
        <SettingSection id="parent" title="家长监护设置" icon={Eye}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">监护级别</label>
              <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="full">完全监护 - 查看所有信息</option>
                <option value="limited">有限监护 - 仅查看学术信息</option>
                <option value="minimal">最小监护 - 仅查看紧急信息</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">报告频率</label>
              <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="daily">每日报告</option>
                <option value="weekly">每周报告</option>
                <option value="monthly">每月报告</option>
                <option value="ondemand">按需获取</option>
              </select>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">紧急联系方式</h4>
              <div className="space-y-2">
                <input 
                  type="tel" 
                  placeholder="主要联系电话"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input 
                  type="tel" 
                  placeholder="备用联系电话"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </SettingSection>
      )}
    </div>
  );
};

export default SettingsPage;
