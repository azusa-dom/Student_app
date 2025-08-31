// src/services/ActivityService.js
import axios from 'axios';
import { API_CONFIG, buildApiUrl } from '../config/api';

class ActivityService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.cache = new Map();
    this.cacheTimeout = 15 * 60 * 1000; // 15分钟
  }

  getCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    if (Date.now() - cached.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }
    return cached.data;
  }

  setCache(key, data) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  async getAllActivities(forceRefresh = false) {
    const cacheKey = 'all_activities';
    if (!forceRefresh) {
      const cached = this.getCache(cacheKey);
      if (cached) return cached;
    }
    try {
      const res = await axios.get(buildApiUrl(API_CONFIG.ENDPOINTS.ACTIVITIES));
      this.setCache(cacheKey, res.data);
      return res.data;
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      // 失败兜底：返回空结构
      return { activities: [], totalCount: 0, lastUpdated: new Date().toISOString() };
    }
  }

  async getActivitiesByType(type, forceRefresh = false) {
    const cacheKey = `activities_${type}`;
    if (!forceRefresh) {
      const cached = this.getCache(cacheKey);
      if (cached) return cached;
    }
    try {
      const res = await axios.get(buildApiUrl(`/activities/${type}`));
      this.setCache(cacheKey, res.data);
      return res.data;
    } catch (error) {
      console.error(`Failed to fetch ${type} activities:`, error);
      return { activities: [], type, count: 0, lastUpdated: new Date().toISOString() };
    }
  }

  async refreshServerCache() {
    try {
      const res = await axios.post(buildApiUrl(API_CONFIG.ENDPOINTS.REFRESH));
      // 刷新后清空本地缓存
      this.cache.clear();
      return res.data;
    } catch (error) {
      console.error('Failed to refresh server cache:', error);
      return null;
    }
  }

  // ========== 客户端本地用户活动管理（示例实现，持久化在 localStorage） ==========
  _readLocal() {
    try {
      const raw = localStorage.getItem('user_activities');
      if (!raw) return { registered: [], interested: [] };
      const parsed = JSON.parse(raw);
      return { registered: parsed.registered || [], interested: parsed.interested || [] };
    } catch {
      return { registered: [], interested: [] };
    }
  }

  _writeLocal(data) {
    try {
      localStorage.setItem('user_activities', JSON.stringify(data));
    } catch {}
  }

  getUserActivities() {
    const data = this._readLocal();
    return {
      registered: {
        activities: data.registered,
        activityIds: data.registered.map(a => a.id),
        count: data.registered.length
      },
      interested: {
        activities: data.interested,
        activityIds: data.interested.map(a => a.id),
        count: data.interested.length
      }
    };
  }

  registerForActivity(activityId) {
    const store = this._readLocal();
    if (store.registered.some(a => a.id === activityId)) {
      return { success: false, message: '已报名该活动' };
    }
    // 尝试从最新活动列表中找到该活动以保存详情
    const cache = this.getCache('all_activities');
    const all = cache?.activities || [];
    const found = all.find(a => a.id === activityId) || { id: activityId, title: '已报名活动', date: new Date().toISOString().split('T')[0], time: '09:00 - 10:00' };
    store.registered.push(found);
    this._writeLocal(store);
    return { success: true, message: '报名成功' };
  }

  unregisterFromActivity(activityId) {
    const store = this._readLocal();
    const before = store.registered.length;
    store.registered = store.registered.filter(a => a.id !== activityId);
    this._writeLocal(store);
    return before !== store.registered.length
      ? { success: true, message: '已取消报名' }
      : { success: false, message: '未找到报名记录' };
  }

  toggleInterest(activityId) {
    const store = this._readLocal();
    const exists = store.interested.some(a => a.id === activityId);
    if (exists) {
      store.interested = store.interested.filter(a => a.id !== activityId);
      this._writeLocal(store);
      return { success: true, isInterested: false };
    }
    const cache = this.getCache('all_activities');
    const all = cache?.activities || [];
    const found = all.find(a => a.id === activityId) || { id: activityId, title: '感兴趣活动' };
    store.interested.push(found);
    this._writeLocal(store);
    return { success: true, isInterested: true };
  }

  exportData() {
    try {
      const store = this._readLocal();
      const json = JSON.stringify(store, null, 2);
      return { success: true, json };
    } catch (e) {
      return { success: false, message: '导出失败' };
    }
  }

  getActivityStats() {
    const data = this._readLocal();
    const all = [...data.registered, ...data.interested];
    const byType = all.reduce((acc, cur) => {
      const key = cur.type || 'general';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return {
      registered: data.registered.length,
      interested: data.interested.length,
      upcoming: all.filter(a => new Date(a.date || a.start_at) >= new Date()).length,
      total: all.length,
      byType
    };
  }
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const activityService = new ActivityService();
export default ActivityService;

