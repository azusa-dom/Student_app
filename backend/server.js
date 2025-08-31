// backend/server.js - Express代理服务器
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const cron = require('node-cron');
const Redis = require('redis');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// 中间件
app.use(cors({
  origin: [process.env.CORS_ORIGIN || 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// 静态资源与无图标情况的处理（避免控制台 404）
app.get('/favicon.ico', (_req, res) => res.status(204).end());

// Redis缓存客户端（可选）
let redisClient = null;
try {
  if (process.env.REDIS_URL) {
    redisClient = Redis.createClient({ url: process.env.REDIS_URL });
    redisClient.on('error', (err) => console.log('Redis Client Error', err));
    redisClient.connect().catch(err => console.log('Redis connect error', err));
  }
} catch (error) {
  console.log('Redis not available, using in-memory cache');
}

// 内存缓存
const memoryCache = new Map();

// 缓存辅助函数
async function getCache(key) {
  if (redisClient) {
    try {
      const val = await redisClient.get(key);
      return val;
    } catch (error) {
      console.error('Redis get error:', error);
    }
  }
  return memoryCache.get(key);
}

async function setCache(key, value, expireInSeconds = 1800) {
  if (redisClient) {
    try {
      await redisClient.setEx(key, expireInSeconds, value);
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }
  memoryCache.set(key, value);
  // 内存缓存过期清理
  setTimeout(() => memoryCache.delete(key), expireInSeconds * 1000);
}

// UCL学生会活动爬取
async function scrapeStudentUnionEvents() {
  try {
    const response = await axios.get('https://studentsunionucl.org/whats-on', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; UCL-Student-App/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);
    const events = [];

    $('.event-item, .event-card, .whats-on-item').each((index, element) => {
      try {
        const $el = $(element);
        const event = {
          id: generateId('su'),
          title: $el.find('.event-title, .title, h2, h3').first().text().trim(),
          description: $el.find('.event-description, .description, p').first().text().trim(),
          date: parseDate($el.find('.event-date, .date').text()),
          time: $el.find('.event-time, .time').text().trim() || 'TBD',
          location: $el.find('.event-location, .location, .venue').text().trim() || 'TBD',
          url: absolutizeUrl('https://studentsunionucl.org', $el.find('a').first().attr('href')),
          type: 'club',
          category: inferCategory($el.text()),
          organizer: 'UCL Students Union',
          source: 'student_union',
          lastUpdated: new Date().toISOString()
        };
        if (event.title && event.title.length > 3) events.push(event);
      } catch (error) {
        console.error('Error parsing student union event:', error);
      }
    });
    return events;
  } catch (error) {
    console.error('Error scraping student union events:', error);
    return [];
  }
}

// UCL职业服务活动爬取
async function scrapeCareerEvents() {
  try {
    const response = await axios.get('https://www.ucl.ac.uk/careers/events', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; UCL-Student-App/1.0)' },
      timeout: 15000
    });
    const $ = cheerio.load(response.data);
    const events = [];

    $('.event-listing, .career-event, .event-item').each((index, element) => {
      try {
        const $el = $(element);
        const event = {
          id: generateId('career'),
          title: $el.find('.event-title, .title, h2, h3').first().text().trim(),
          description: $el.find('.event-summary, .summary, p').first().text().trim(),
          date: parseDate($el.find('.event-date, .date').text()),
          time: $el.find('.event-time, .time').text().trim() || 'TBD',
          location: $el.find('.event-location, .location').text().trim() || 'Online',
          url: absolutizeUrl('https://www.ucl.ac.uk', $el.find('a').first().attr('href')),
          type: 'career',
          category: 'career',
          organizer: 'UCL Career Services',
          source: 'ucl_careers',
          lastUpdated: new Date().toISOString()
        };
        if (event.title && event.title.length > 3) events.push(event);
      } catch (error) {
        console.error('Error parsing career event:', error);
      }
    });
    return events;
  } catch (error) {
    console.error('Error scraping career events:', error);
    return [];
  }
}

// UCL官方活动爬取
async function scrapeUCLEvents() {
  try {
    const response = await axios.get('https://www.ucl.ac.uk/events', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; UCL-Student-App/1.0)' },
      timeout: 15000
    });
    const $ = cheerio.load(response.data);
    const events = [];

    $('.event, .event-teaser').each((index, element) => {
      try {
        const $el = $(element);
        const event = {
          id: generateId('ucl'),
          title: $el.find('.event-title, .title, h2, h3').first().text().trim(),
          description: $el.find('.event-summary, .summary, p').first().text().trim(),
          date: parseDate($el.find('.event-date, .date').text()),
          time: $el.find('.event-time, .time').text().trim() || 'TBD',
          location: $el.find('.event-location, .location').text().trim() || 'UCL Campus',
          url: absolutizeUrl('https://www.ucl.ac.uk', $el.find('a').first().attr('href')),
          type: 'event',
          category: inferCategory($el.text()),
          organizer: 'UCL',
          source: 'ucl_events',
          lastUpdated: new Date().toISOString()
        };
        if (event.title && event.title.length > 3) events.push(event);
      } catch (error) {
        console.error('Error parsing UCL event:', error);
      }
    });
    return events;
  } catch (error) {
    console.error('Error scraping UCL events:', error);
    return [];
  }
}

// 主要的API端点
app.get('/api/activities', async (req, res) => {
  try {
    const cacheKey = 'all_activities';
    const cached = await getCache(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

    console.log('Fetching fresh activity data...');
    const [studentUnionEvents, careerEvents, uclEvents] = await Promise.all([
      scrapeStudentUnionEvents(),
      scrapeCareerEvents(),
      scrapeUCLEvents()
    ]);

    const allEvents = [...studentUnionEvents, ...careerEvents, ...uclEvents];
    const uniqueEvents = deduplicateEvents(allEvents);
    const sortedEvents = uniqueEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

    const result = {
      activities: sortedEvents.slice(0, 50),
      totalCount: sortedEvents.length,
      lastUpdated: new Date().toISOString(),
      sources: [
        { name: 'UCL Students Union', count: studentUnionEvents.length },
        { name: 'UCL Careers', count: careerEvents.length },
        { name: 'UCL Events', count: uclEvents.length }
      ]
    };

    await setCache(cacheKey, JSON.stringify(result), 1800);
    res.json(result);
  } catch (error) {
    console.error('Error in /api/activities:', error);
    res.status(500).json({
      error: 'Failed to fetch activities',
      message: error.message,
      fallback: getFallbackActivities()
    });
  }
});

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

// RSS/XML订阅源处理
app.get('/api/activities/rss', async (req, res) => {
  try {
    const rssUrls = [
      'https://studentsunionucl.org/events.xml',
      'https://www.ucl.ac.uk/events.rss'
    ];
    const rssPromises = rssUrls.map(async (url) => {
      try {
        const response = await axios.get(url, { timeout: 10000 });
        return parseRSSFeed(response.data, url);
      } catch (error) {
        console.error(`Failed to fetch RSS from ${url}:`, error);
        return [];
      }
    });
    const rssResults = await Promise.all(rssPromises);
    const allRSSEvents = rssResults.flat();
    res.json({ activities: allRSSEvents, count: allRSSEvents.length, lastUpdated: new Date().toISOString() });
  } catch (error) {
    console.error('Error fetching RSS feeds:', error);
    res.status(500).json({ error: 'Failed to fetch RSS feeds' });
  }
});

// 按类型筛选活动
app.get('/api/activities/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const cacheKey = `activities_${type}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

    const allActivitiesResponse = await axios.get(`http://localhost:${port}/api/activities`);
    const filteredActivities = allActivitiesResponse.data.activities.filter(
      a => a.type === type || a.category === type
    );

    const result = { activities: filteredActivities, type, count: filteredActivities.length, lastUpdated: new Date().toISOString() };
    await setCache(cacheKey, JSON.stringify(result), 900);
    res.json(result);
  } catch (error) {
    console.error(`Error fetching ${req.params.type} activities:`, error);
    res.status(500).json({ error: 'Failed to fetch activities by type' });
  }
});

// 强制刷新缓存
app.post('/api/activities/refresh', async (req, res) => {
  try {
    if (redisClient) await redisClient.flushAll();
    memoryCache.clear();
    const response = await axios.get(`http://localhost:${port}/api/activities`);
    res.json({ message: 'Cache refreshed successfully', data: response.data });
  } catch (error) {
    console.error('Error refreshing cache:', error);
    res.status(500).json({ error: 'Failed to refresh cache' });
  }
});

// 定时任务 - 每30分钟更新一次缓存
cron.schedule('*/30 * * * *', async () => {
  console.log('Running scheduled cache refresh...');
  try {
    await axios.post(`http://localhost:${port}/api/activities/refresh`);
    console.log('Cache refreshed successfully');
  } catch (error) {
    console.error('Scheduled cache refresh failed:', error);
  }
});

// 启动服务器
app.listen(port, () => {
  console.log(`🚀 Activity scraper proxy server running on port ${port}`);
  console.log(`📡 Health check: http://localhost:${port}/api/health`);
  console.log(`🎯 Activities API: http://localhost:${port}/api/activities`);
});

// 工具函数
function generateId(prefix = 'act') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
function parseDate(dateStr) {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  const cleaned = String(dateStr).trim().replace(/[^\w\s\-\/]/g, '');
  const patterns = [
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
    /(\d{4})-(\d{2})-(\d{2})/,
    /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/i,
    /(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/i
  ];
  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match) {
      const date = new Date(match[0]);
      if (!isNaN(date.getTime())) return date.toISOString().split('T')[0];
    }
  }
  return new Date().toISOString().split('T')[0];
}
function inferCategory(text) {
  const categories = {
    cultural: ['culture','art','music','dance','theater','exhibition','文化','艺术','音乐','舞蹈'],
    academic: ['lecture','seminar','workshop','research','conference','讲座','研讨','学术','会议'],
    sports: ['sport','fitness','gym','yoga','football','basketball','体育','健身','瑜伽'],
    social: ['social','party','networking','meetup','mixer','社交','聚会','交流'],
    career: ['career','job','internship','recruitment','employer','职业','招聘','实习','雇主'],
    wellness: ['wellness','mental health','counseling','meditation','健康','心理','冥想']
  };
  const lower = String(text).toLowerCase();
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(k => lower.includes(k))) return category;
  }
  return 'general';
}
function parseRSSFeed(xmlData, sourceUrl) {
  try {
    const $ = cheerio.load(xmlData, { xmlMode: true });
    const items = [];
    $('item').each((_, element) => {
      const $item = $(element);
      const item = {
        id: generateId('rss'),
        title: $item.find('title').text().trim(),
        description: $item.find('description').text().trim(),
        date: parseDate($item.find('pubDate').text()),
        url: $item.find('link').text().trim(),
        type: inferTypeFromSource(sourceUrl),
        category: inferCategory($item.find('title').text() + ' ' + $item.find('description').text()),
        source: 'rss',
        lastUpdated: new Date().toISOString()
      };
      if (item.title) items.push(item);
    });
    return items;
  } catch (error) {
    console.error('Error parsing RSS feed:', error);
    return [];
  }
}
function inferTypeFromSource(sourceUrl) {
  if (!sourceUrl) return 'event';
  if (sourceUrl.includes('careers')) return 'career';
  if (sourceUrl.includes('studentsunion')) return 'club';
  return 'event';
}
function deduplicateEvents(events) {
  const unique = new Map();
  events.forEach(event => {
    const key = `${(event.title || '').toLowerCase().slice(0,50)}-${event.date}`;
    if (!unique.has(key)) {
      unique.set(key, {
        ...event,
        title: cleanText(event.title),
        description: cleanText(event.description),
        location: cleanText(event.location)
      });
    }
  });
  return Array.from(unique.values());
}
function cleanText(text) {
  if (!text) return '';
  return String(text).trim().replace(/\s+/g, ' ').replace(/[^\w\s\u4e00-\u9fa5\-\.,!?]/g, '').substring(0, 200);
}
function absolutizeUrl(base, href) {
  try {
    if (!href) return base;
    return new URL(href, base).toString();
  } catch {
    return href || base;
  }
}

module.exports = app;

