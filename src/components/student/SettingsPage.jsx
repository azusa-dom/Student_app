import React, { useState } from 'react';
import { 
  User, Mail, Phone, BookOpen, Bell, Shield, Settings as SettingsIcon, 
  Link, HelpCircle, ChevronRight, ChevronDown, Globe, Clock, 
  Palette, Download, Upload, Trash2, Eye, EyeOff, Calendar,
  FileText, Camera, Edit3, Save, X, Check, AlertTriangle
} from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useUser } from '../../contexts/UserContext';
import AvatarUploader from './AvatarUploader';
import ThemeSettings from './ThemeSettings';

const SettingsPage = () => {
  const { selectedProvider, userType } = useAppContext();
  const { t, language, changeLanguage } = useLanguage();
  const { userData, updateUserData } = useUser();
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
  const [profileData, setProfileData] = useState(userData);

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
    
    // 更新全局用户数据
    updateUserData(profileData);
    
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">设置</h1>
        <p className="text-gray-600">管理您的个人资料、通知偏好和应用设置</p>
      </div>

      {/* 个人资料 */}
      <SettingSection id="profile" title="个人资料" icon={User}>
        <div className="space-y-6">
          {/* 头像上传 */}
          <AvatarUploader />

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
                      setProfileData(userData);
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

      {/* 通知设置 */}
      <SettingSection id="notifications" title="通知设置" icon={Bell}>
        <div className="space-y-4">
          <SwitchToggle
            enabled={notifications.assignments}
            onChange={(value) => setNotifications(prev => ({ ...prev, assignments: value }))}
            label="作业提醒"
            description="新作业和截止日期提醒"
          />
          <SwitchToggle
            enabled={notifications.grades}
            onChange={(value) => setNotifications(prev => ({ ...prev, grades: value }))}
            label="成绩通知"
            description="新成绩发布时通知"
          />
          <SwitchToggle
            enabled={notifications.events}
            onChange={(value) => setNotifications(prev => ({ ...prev, events: value }))}
            label="课程提醒"
            description="课程开始前的提醒"
          />
          <SwitchToggle
            enabled={notifications.deadlines}
            onChange={(value) => setNotifications(prev => ({ ...prev, deadlines: value }))}
            label="截止日期提醒"
            description="作业和项目截止前的提醒"
          />
        </div>
      </SettingSection>

      {/* 应用设置 */}
      <SettingSection id="app" title="应用设置" icon={SettingsIcon}>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">语言设置</label>
            <select 
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="zh">中文</option>
              <option value="en">English</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">主题设置</label>
            <ThemeSettings />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">时区设置</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">数据同步</label>
            <select 
              value={appSettings.autoSync}
              onChange={(e) => setAppSettings(prev => ({ ...prev, autoSync: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="realtime">实时同步</option>
              <option value="daily">每日同步</option>
              <option value="weekly">每周同步</option>
              <option value="manual">手动同步</option>
            </select>
          </div>
        </div>
      </SettingSection>

      {/* 数据管理 */}
      <SettingSection id="data" title="数据管理" icon={Shield}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button className="flex items-center justify-center space-x-2 p-3 text-blue-600 font-medium border border-blue-300 rounded-lg hover:bg-blue-50">
              <Download className="w-4 h-4" />
              <span>导出数据</span>
            </button>
            <button className="flex items-center justify-center space-x-2 p-3 text-blue-600 font-medium border border-blue-300 rounded-lg hover:bg-blue-50">
              <Upload className="w-4 h-4" />
              <span>备份设置</span>
            </button>
            <button className="flex items-center justify-center space-x-2 p-3 text-red-600 font-medium border border-red-300 rounded-lg hover:bg-red-50">
              <Trash2 className="w-4 h-4" />
              <span>删除账户</span>
            </button>
          </div>
        </div>
      </SettingSection>

      {/* 支持与反馈 */}
      <SettingSection id="support" title="支持与反馈" icon={HelpCircle}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button className="flex items-center space-x-3 p-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50">
              <FileText className="w-5 h-5 text-gray-600" />
              <div>
                <div className="font-medium text-gray-900">使用帮助</div>
                <div className="text-sm text-gray-500">查看使用指南</div>
              </div>
            </button>
            <button className="flex items-center space-x-3 p-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50">
              <Mail className="w-5 h-5 text-gray-600" />
              <div>
                <div className="font-medium text-gray-900">联系客服</div>
                <div className="text-sm text-gray-500">获取技术支持</div>
              </div>
            </button>
          </div>
        </div>
      </SettingSection>
    </div>
  );
};

export default SettingsPage;
