// src/services/ActivityManager.js
// 轻量代理：兼容从其他文件导入 activityManager 的写法
import { activityService } from './ActivityService';

export const activityManager = {
  getAllActivities: (...args) => activityService.getAllActivities(...args),
  getActivitiesByType: (...args) => activityService.getActivitiesByType(...args),
  refreshServerCache: (...args) => activityService.refreshServerCache(...args),
  getUserActivities: (...args) => activityService.getUserActivities(...args),
  registerForActivity: (...args) => activityService.registerForActivity(...args),
  unregisterFromActivity: (...args) => activityService.unregisterFromActivity(...args),
  toggleInterest: (...args) => activityService.toggleInterest(...args),
  exportData: (...args) => activityService.exportData(...args),
  getActivityStats: (...args) => activityService.getActivityStats(...args)
};

export default activityManager;

