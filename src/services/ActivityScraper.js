// src/services/ActivityScraper.js
import axios from 'axios';
import * as cheerio from 'cheerio';

class ActivityScraper {
  constructor() {
    this.endpoints = {
      uclStudentUnion: 'https://studentsunionucl.org/whats-on',
      uclCareers: 'https://www.ucl.ac.uk/careers/events',
      uclEvents: 'https://www.ucl.ac.uk/events',
      studentUnionAPI: 'https://studentsunionucl.org/api/events',
      careersAPI: 'https://www.ucl.ac.uk/careers/api/events'
    };
    
    this.cache = new Map();
    this.cacheTimeout = 30 * 60 * 1000; // 30分钟缓存
  }

  // 检查缓存是否有效
  isCacheValid(key) {
    const cached = this.cache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.cacheTimeout;
  }

  // 获取缓存数据
  getFromCache(key) {
    const cached = this.cache.get(key);
    return cached ? cached.data : null;
  }

  // 设置缓存
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // 方法1: 使用现有API端点
  async fetchFromAPIs() {
    try {
      const promises = [];

      // UCL学生会API（如果存在）
      promises.push(
        axios.get(this.endpoints.studentUnionAPI, {
          timeout: 10000,
          headers: {
            'User-Agent': 'UCL-Student-App/1.0'
          }
        }).catch(err => ({ data: null, error: err.message }))
      );

      // UCL职业服务API
      promises.push(
        axios.get(this.endpoints.careersAPI, {
          timeout: 10000,
          headers: {
            'User-Agent': 'UCL-Student-App/1.0'
          }
        }).catch(err => ({ data: null, error: err.message }))
      );

      const results = await Promise.all(promises);
      
      return {
        studentUnion: results[0].data || [],
        careers: results[1].data || []
      };
    } catch (error) {
      console.error('API fetch failed:', error);
      return { studentUnion: [], careers: [] };
    }
  }

  // 方法2: 网页爬虫（注意CORS限制）
  async scrapeWebPages() {
    const cacheKey = 'scraped_activities';
    
    if (this.isCacheValid(cacheKey)) {
      return this.getFromCache(cacheKey);
    }

    try {
      // 由于浏览器CORS限制，这部分需要通过代理服务器
      const proxyResults = await this.fetchThroughProxy();
      
      this.setCache(cacheKey, proxyResults);
      return proxyResults;
    } catch (error) {
      console.error('Scraping failed:', error);
      return this.getFallbackData();
    }
  }

  // 通过代理服务器获取数据
  async fetchThroughProxy() {
    // 这里需要设置一个后端代理服务
    const proxyUrl = '/api/proxy/activities'; // 您的代理端点
    
    try {
      const response = await axios.post(proxyUrl, {
        urls: Object.values(this.endpoints)
      });
      
      return this.parseProxyResponse(response.data);
    } catch (error) {
      console.error('Proxy request failed:', error);
      return this.getFallbackData();
    }
  }

  // 解析代理响应
  parseProxyResponse(data) {
    const activities = [];
    
    // 解析学生会活动
    if (data.studentUnion) {
      const $ = cheerio.load(data.studentUnion);
      
      $('.event-card, .activity-item').each((index, element) => {
        const activity = this.parseActivityElement($, element, 'club');
        if (activity) activities.push(activity);
      });
    }
    
    // 解析职业活动
    if (data.careers) {
      const $ = cheerio.load(data.careers);
      
      $('.career-event, .job-fair').each((index, element) => {
        const activity = this.parseActivityElement($, element, 'career');
        if (activity) activities.push(activity);
      });
    }
    
    return activities;
  }

  // 解析单个活动元素
  parseActivityElement($, element, type) {
    try {
      const $el = $(element);
      
      return {
        id: this.generateId(),
        title: $el.find('.title, .event-title, h3, h2').first().text().trim(),
        description: $el.find('.description, .excerpt, p').first().text().trim(),
        date: this.parseDate($el.find('.date, .event-date').text()),
        time: $el.find('.time').text().trim() || '待定',
        location: $el.find('.location, .venue').text().trim() || '待定',
        type: type,
        category: this.inferCategory($el.text()),
        url: $el.find('a').first().attr('href'),
        organizer: type === 'club' ? '学生会' : 'UCL职业服务',
        participants: this.parseParticipants($el.text()),
        status: 'upcoming',
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to parse activity element:', error);
      return null;
    }
  }

  // 方法3: RSS/XML订阅源
  async fetchFromRSSFeeds() {
    const rssFeeds = [
      'https://studentsunionucl.org/events.xml',
      'https://www.ucl.ac.uk/careers/events.rss',
      'https://www.ucl.ac.uk/events.xml'
    ];

    const activities = [];

    for (const feedUrl of rssFeeds) {
      try {
        const response = await axios.get(`/api/proxy/rss?url=${encodeURIComponent(feedUrl)}`);
        const parsedFeed = this.parseRSSFeed(response.data);
        activities.push(...parsedFeed);
      } catch (error) {
        console.error(`Failed to fetch RSS feed ${feedUrl}:`, error);
      }
    }

    return activities;
  }

  // 方法4: 第三方数据服务集成
  async fetchFromThirdPartyServices() {
    const services = {
      // Eventbrite API
      eventbrite: {
        url: 'https://www.eventbriteapi.com/v3/events/search/',
        params: {
          'location.address': 'London, UK',
          'q': 'UCL university',
          'sort_by': 'date'
        }
      },
      
      // Meetup API
      meetup: {
        url: 'https://api.meetup.com/find/events',
        params: {
          'lat': 51.5074,
          'lon': -0.1278,
          'radius': 5,
          'text': 'university students'
        }
      }
    };

    const results = [];

    for (const [serviceName, config] of Object.entries(services)) {
      try {
        const response = await this.fetchWithRetry(config.url, config.params);
        const parsed = this.parseThirdPartyData(response.data, serviceName);
        results.push(...parsed);
      } catch (error) {
        console.error(`${serviceName} API failed:`, error);
      }
    }

    return results;
  }

  // 主要的获取方法 - 综合多个数据源
  async fetchLatestActivities(options = {}) {
    const {
      includeClubs = true,
      includeCareers = true,
      includeEvents = true,
      maxResults = 50
    } = options;

    console.log('🔄 开始获取最新活动数据...');

    const allActivities = [];
    const errors = [];

    try {
      // 1. 尝试API端点
      console.log('📡 尝试从API获取数据...');
      const apiData = await this.fetchFromAPIs();
      if (apiData.studentUnion?.length) {
        allActivities.push(...apiData.studentUnion.slice(0, 20));
      }
      if (apiData.careers?.length) {
        allActivities.push(...apiData.careers.slice(0, 20));
      }

      // 2. 尝试RSS订阅
      console.log('📰 尝试从RSS获取数据...');
      const rssData = await this.fetchFromRSSFeeds();
      allActivities.push(...rssData.slice(0, 15));

      // 3. 尝试第三方服务
      console.log('🌐 尝试从第三方服务获取数据...');
      const thirdPartyData = await this.fetchFromThirdPartyServices();
      allActivities.push(...thirdPartyData.slice(0, 15));

      // 4. 如果都失败，使用模拟数据
      if (allActivities.length === 0) {
        console.log('⚠️  使用备用数据...');
        return this.getFallbackData();
      }

    } catch (error) {
      console.error('获取活动数据时出错:', error);
      errors.push(error.message);
    }

    // 数据处理和去重
    const processedActivities = this.processActivities(allActivities);
    
    console.log(`✅ 成功获取 ${processedActivities.length} 个活动`);
    
    return {
      activities: processedActivities.slice(0, maxResults),
      lastUpdated: new Date().toISOString(),
      sources: this.getDataSources(),
      errors: errors.length > 0 ? errors : null
    };
  }

  // 处理和标准化活动数据
  processActivities(rawActivities) {
    const uniqueActivities = new Map();

    rawActivities.forEach(activity => {
      // 去重逻辑
      const key = `${activity.title}-${activity.date}`.toLowerCase();
      
      if (!uniqueActivities.has(key)) {
        // 标准化数据格式
        const standardized = {
          id: activity.id || this.generateId(),
          title: this.cleanText(activity.title),
          description: this.cleanText(activity.description),
          date: this.standardizeDate(activity.date),
          time: activity.time || '待定',
          location: activity.location || '待定',
          type: activity.type || 'general',
          category: activity.category || this.inferCategory(activity.title),
          url: activity.url,
          organizer: activity.organizer,
          participants: activity.participants || 0,
          maxParticipants: activity.maxParticipants || 100,
          status: activity.status || 'upcoming',
          tags: this.extractTags(activity.title + ' ' + activity.description),
          lastUpdated: new Date().toISOString(),
          source: activity.source || 'unknown'
        };

        uniqueActivities.set(key, standardized);
      }
    });

    return Array.from(uniqueActivities.values())
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  // 辅助方法
  generateId() {
    return 'activity_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  parseDate(dateStr) {
    // 处理各种日期格式
    const patterns = [
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
      /(\d{4})-(\d{2})-(\d{2})/,
      /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/i
    ];

    for (const pattern of patterns) {
      const match = dateStr.match(pattern);
      if (match) {
        return new Date(match[0]).toISOString().split('T')[0];
      }
    }

    return new Date().toISOString().split('T')[0];
  }

  inferCategory(text) {
    const categories = {
      'cultural': ['culture', 'art', 'music', 'dance', 'theater', '文化', '艺术', '音乐'],
      'academic': ['lecture', 'seminar', 'workshop', 'research', '讲座', '研讨', '学术'],
      'sports': ['sport', 'fitness', 'gym', 'yoga', 'football', '体育', '健身'],
      'social': ['social', 'party', 'networking', 'meetup', '社交', '聚会'],
      'career': ['career', 'job', 'internship', 'recruitment', '职业', '招聘', '实习']
    };

    const lowerText = text.toLowerCase();
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return category;
      }
    }
    
    return 'general';
  }

  cleanText(text) {
    if (!text) return '';
    return text.trim().replace(/\s+/g, ' ').substring(0, 200);
  }

  standardizeDate(date) {
    try {
      return new Date(date).toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  }

  extractTags(text) {
    // 简单的标签提取逻辑
    const commonTags = ['workshop', 'seminar', 'networking', 'free', 'students', 'career'];
    const lowerText = text.toLowerCase();
    
    return commonTags.filter(tag => lowerText.includes(tag));
  }

  parseParticipants(text) {
    const match = text.match(/(\d+)\s*(?:people|participants|attending|人参与)/i);
    return match ? parseInt(match[1]) : 0;
  }

  getDataSources() {
    return [
      { name: 'UCL Student Union', url: 'https://studentsunionucl.org/whats-on' },
      { name: 'UCL Careers', url: 'https://www.ucl.ac.uk/careers/events' },
      { name: 'UCL Events', url: 'https://www.ucl.ac.uk/events' }
    ];
  }

  // 备用数据
  getFallbackData() {
    return {
      activities: [
        {
          id: 'fallback_1',
          title: '中国学生学会文化夜',
          description: '传统文化表演、美食分享、才艺展示',
          date: '2024-12-03',
          time: '18:30 - 22:00',
          location: 'Jeremy Bentham Room',
          type: 'club',
          category: 'cultural',
          organizer: 'Chinese Students Association',
          participants: 85,
          maxParticipants: 120,
          status: 'upcoming',
          source: 'fallback'
        },
        {
          id: 'fallback_2',
          title: 'AI Research Club Workshop',
          description: '机器学习基础教程，实战项目分享',
          date: '2024-12-01',
          time: '14:00 - 17:00',
          location: 'Pearson Building G22',
          type: 'club',
          category: 'academic',
          organizer: 'AI Research Club',
          participants: 45,
          maxParticipants: 50,
          status: 'upcoming',
          source: 'fallback'
        },
        {
          id: 'fallback_3',
          title: '春季科技招聘会',
          description: '顶尖科技公司招聘机会，现场面试',
          date: '2024-12-15',
          time: '10:00 - 16:00',
          location: 'UCL Main Campus',
          type: 'career',
          category: 'career',
          organizer: 'UCL Career Services',
          participants: 200,
          maxParticipants: 500,
          status: 'upcoming',
          source: 'fallback'
        }
      ],
      lastUpdated: new Date().toISOString(),
      sources: this.getDataSources(),
      note: '使用备用数据'
    };
  }

  async fetchWithRetry(url, params, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await axios.get(url, { params, timeout: 10000 });
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }
}

// 导出单例实例
export const activityScraper = new ActivityScraper();
export default ActivityScraper;
