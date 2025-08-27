import { BookOpen, Clock, Bell, Calendar, Briefcase } from 'lucide-react';

export const formatTimeRemaining = (dateString) => {
  const now = new Date();
  const target = new Date(dateString);
  const diff = target.getTime() - now.getTime();
  
  if (diff < 0) return '已过期';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}天后`;
  if (hours > 0) return `${hours}小时后`;
  return '即将到期';
};

export const getEventIcon = (type) => {
  const iconMap = {
    'class_event': BookOpen,
    'assignment_due': Clock,
    'system_notice': Bell,
    'activity': Calendar,
    'recruitment': Briefcase
  };
  return iconMap[type] || Calendar;
};

export const getEventColor = (type) => {
  const colorMap = {
    'class_event': 'from-blue-500 to-indigo-600',
    'assignment_due': 'from-red-500 to-pink-600',
    'system_notice': 'from-amber-500 to-orange-600',
    'activity': 'from-green-500 to-emerald-600',
    'recruitment': 'from-purple-500 to-violet-600'
  };
  return colorMap[type] || 'from-blue-500 to-indigo-600';
};
