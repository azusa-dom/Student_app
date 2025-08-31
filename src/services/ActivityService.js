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

  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const activityService = new ActivityService();
export default ActivityService;

