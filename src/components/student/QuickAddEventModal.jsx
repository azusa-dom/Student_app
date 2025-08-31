// src/components/student/QuickAddEventModal.jsx
import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, User, Tag, Plus } from 'lucide-react';

export const QuickAddEventModal = ({ isOpen, onClose, onAddEvent }) => {
  const [eventData, setEventData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
    type: 'class_event',
    teacher: ''
  });

  const [errors, setErrors] = useState({});

  const eventTypes = [
    { value: 'class_event', label: '课程事件', color: 'bg-blue-500' },
    { value: 'assignment_due', label: '作业截止', color: 'bg-red-500' },
    { value: 'exam', label: '考试', color: 'bg-purple-500' },
    { value: 'personal', label: '个人事项', color: 'bg-green-500' },
    { value: 'meeting', label: '会议', color: 'bg-amber-500' }
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!eventData.title.trim()) {
      newErrors.title = '请输入事件标题';
    }
    
    if (!eventData.date) {
      newErrors.date = '请选择日期';
    }
    
    if (!eventData.time) {
      newErrors.time = '请输入时间';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    try {
      // 构建事件对象
      const [hours, minutes] = eventData.time.split(':');
      const eventDate = new Date(eventData.date);
      eventDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const newEvent = {
        title: eventData.title,
        type: eventData.type,
        start_at: eventDate.toISOString(),
        location: eventData.location || undefined,
        description: eventData.description || undefined,
        teacher: eventData.teacher || undefined
      };

      onAddEvent(newEvent);
      
      // 重置表单
      setEventData({
        title: '',
        date: '',
        time: '',
        location: '',
        description: '',
        type: 'class_event',
        teacher: ''
      });
      
      setErrors({});
      onClose();
      
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setEventData(prev => ({ ...prev, [field]: value }));
    
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">添加新事件</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 表单内容 */}
        <div className="p-6 space-y-4">
          {/* 事件标题 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center space-x-1">
                <Tag className="w-4 h-4" />
                <span>事件标题 *</span>
              </span>
            </label>
            <input
              type="text"
              value={eventData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="例如：高等数学课程"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.title && (
              <p className="text-red-600 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* 事件类型 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">事件类型</label>
            <div className="grid grid-cols-2 gap-2">
              {eventTypes.map(type => (
                <button
                  key={type.value}
                  onClick={() => handleInputChange('type', type.value)}
                  className={`flex items-center space-x-2 p-3 rounded-lg border-2 transition-colors ${
                    eventData.type === type.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${type.color}`}></div>
                  <span className="text-sm font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 日期和时间 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>日期 *</span>
                </span>
              </label>
              <input
                type="date"
                value={eventData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.date ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.date && (
                <p className="text-red-600 text-sm mt-1">{errors.date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>时间 *</span>
                </span>
              </label>
              <input
                type="time"
                value={eventData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.time ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.time && (
                <p className="text-red-600 text-sm mt-1">{errors.time}</p>
              )}
            </div>
          </div>

          {/* 地点 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>地点</span>
              </span>
            </label>
            <input
              type="text"
              value={eventData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="例如：教学楼A101"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>

          {/* 教师/负责人 */}
          {(eventData.type === 'class_event' || eventData.type === 'meeting') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>{eventData.type === 'class_event' ? '教师' : '负责人'}</span>
                </span>
              </label>
              <input
                type="text"
                value={eventData.teacher}
                onChange={(e) => handleInputChange('teacher', e.target.value)}
                placeholder={eventData.type === 'class_event' ? "例如：Prof. Smith" : "例如：张经理"}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
          )}

          {/* 描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">描述</label>
            <textarea
              value={eventData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="可选：添加事件的详细描述..."
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
            />
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end space-x-3 p-6 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>添加事件</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// 使用命名导出，避免打包器默认导出解析异常