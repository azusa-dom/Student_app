const express = require('express');
const cors = require('cors');
const path = require('path');
const { spawn } = require('child_process');
const axios = require('axios');
const cheerio = require('cheerio');
const cron = require('node-cron');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================================
// 中间件配置
// ============================================================================

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'dist')));

// 速率限制：15分钟内最多100个请求
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.'
}));

// ============================================================================
// 缓存系统（内存缓存）
// ============================================================================

const memoryCache = new Map();

function getCache(key) {
  const cached = memoryCache.get(key);
  if (!cached) return null;
  
  // 检查是否过期
  if (Date.now() > cached.expiry) {
    memoryCache.delete(key);
    return null;
  }
  
  return cached.value;
}

function setCache(key, value, expireInSeconds = 1800) {
  memoryCache.set(key, {
    value,
    expiry: Date.now() + (expireInSeconds * 1000)
  });
}

function clearCache() {
  memoryCache.clear();
}

// ============================================================================
// 健康检查端点
// ============================================================================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cacheSize: memoryCache.size
  });
});

// Preflight 请求处理
app.options('*', cors());

// ============================================================================
// 主 QA API 端点
// ============================================================================

app.post('/api/chat', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { query } = req.body;
    
    // 验证请求
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Query is required and must be a string',
        timestamp: new Date().toISOString()
      });
    }

    if (query.trim().length === 0) {
      return res.status(400).json({
        error: 'Query cannot be empty',
        timestamp: new Date().toISOString()
      });
    }

    if (query.length > 500) {
      return res.status(400).json({
        error: 'Query too long (max 500 characters)',
        timestamp: new Date().toISOString()
      });
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔍 Query: ${query}`);
    console.log(`📅 Time: ${new Date().toISOString()}`);
    console.log(`${'='.repeat(60)}`);

    // 检查缓存
    const cacheKey = `query:${query.toLowerCase().trim()}`;
    const cachedResult = getCache(cacheKey);
    
    if (cachedResult) {
      console.log('✅ Cache hit');
      return res.json({
        ...JSON.parse(cachedResult),
        cached: true,
        response_time: `${Date.now() - startTime}ms`
      });
    }

    // 调用 Python QA 系统
    const pythonPath = process.env.PYTHON_PATH || 'python3';
    const scriptPath = path.join(__dirname, '..', 'scripts', 'qa_enhanced_wrapper.py');
    
    console.log(`🐍 Calling Python: ${pythonPath}`);
    console.log(`📄 Script: ${scriptPath}`);

    const python = spawn(pythonPath, [scriptPath, query]);
    
    let output = '';
    let errorOutput = '';
    
    // 超时处理
    const timeout = setTimeout(() => {
      python.kill();
      console.error('⏱️ Python process timeout');
    }, 30000); // 30秒超时

    python.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    python.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.error('⚠️ Python stderr:', data.toString());
    });
    
    python.on('close', (code) => {
      clearTimeout(timeout);
      
      if (code !== 0) {
        console.error(`❌ Python exited with code: ${code}`);
        console.error(`Error output: ${errorOutput}`);
        
        return res.status(500).json({
          error: 'Failed to process query',
          details: process.env.NODE_ENV === 'development' ? errorOutput : undefined,
          timestamp: new Date().toISOString()
        });
      }
      
      try {
        const result = JSON.parse(output);
        
        // 缓存结果（30分钟）
        setCache(cacheKey, output, 1800);
        
        console.log(`✅ Success in ${Date.now() - startTime}ms`);
        
        res.json({
          ...result,
          cached: false,
          response_time: `${Date.now() - startTime}ms`,
          timestamp: new Date().toISOString()
        });
        
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        console.error('Raw output:', output);
        
        res.status(500).json({
          error: 'Failed to parse response',
          details: process.env.NODE_ENV === 'development' ? output : undefined,
          timestamp: new Date().toISOString()
        });
      }
    });
    
    python.on('error', (error) => {
      clearTimeout(timeout);
      console.error('❌ Python spawn error:', error);
      
      res.status(500).json({
        error: 'Failed to start Python process',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        timestamp: new Date().toISOString()
      });
    });
    
  } catch (error) {
    console.error('❌ API error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

// ============================================================================
// 活动爬取 API
// ============================================================================

app.get('/api/activities', async (req, res) => {
  try {
    const cacheKey = 'ucl:activities';
    const cached = getCache(cacheKey);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    console.log('🔄 Fetching UCL activities...');
    
    const activities = await scrapeUCLActivities();
    const result = {
      activities,
      total: activities.length,
      lastUpdated: new Date().toISOString()
    };
    
    // 缓存1小时
    setCache(cacheKey, JSON.stringify(result), 3600);
    
    res.json(result);
    
  } catch (error) {
    console.error('❌ Activities fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch activities',
      timestamp: new Date().toISOString()
    });
  }
});

// 按类型筛选活动
app.get('/api/activities/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const cacheKey = `ucl:activities:${type}`;
    const cached = getCache(cacheKey);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const allActivities = await scrapeUCLActivities();
    const filtered = allActivities.filter(a => a.type === type);
    
    const result = {
      activities: filtered,
      total: filtered.length,
      type,
      lastUpdated: new Date().toISOString()
    };
    
    setCache(cacheKey, JSON.stringify(result), 3600);
    res.json(result);
    
  } catch (error) {
    console.error('❌ Activities filter error:', error);
    res.status(500).json({
      error: 'Failed to filter activities',
      timestamp: new Date().toISOString()
    });
  }
});

// 刷新缓存端点
app.post('/api/refresh-cache', async (req, res) => {
  try {
    clearCache();
    console.log('🔄 Cache cleared');
    
    // 预热缓存
    const activities = await scrapeUCLActivities();
    setCache('ucl:activities', JSON.stringify({
      activities,
      total: activities.length,
      lastUpdated: new Date().toISOString()
    }), 3600);
    
    res.json({
      message: 'Cache refreshed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Cache refresh error:', error);
    res.status(500).json({
      error: 'Failed to refresh cache',
      timestamp: new Date().toISOString()
    });
  }
});

// ============================================================================
// 爬虫功能
// ============================================================================

async function scrapeUCLActivities() {
  const activities = [];
  
  try {
    // 爬取学生会活动
    const unionResponse = await axios.get('https://studentsunionucl.org/whats-on', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });
    
    const $ = cheerio.load(unionResponse.data);
    
    $('.event-item, .activity-card, .event-card').each((_, element) => {
      try {
        const $el = $(element);
        const activity = {
          id: generateId('union'),
          title: $el.find('.event-title, .title, h2, h3').first().text().trim(),
          description: $el.find('.event-description, .description, p').first().text().trim(),
          date: parseDate($el.find('.event-date, .date, time').first().text()),
          location: $el.find('.event-location, .location').first().text().trim() || 'UCL',
          url: absolutizeUrl('https://studentsunionucl.org', $el.find('a').first().attr('href')),
          type: 'event',
          category: inferCategory($el.text()),
          source: 'students_union',
          lastUpdated: new Date().toISOString()
        };
        
        if (activity.title) {
          activities.push(activity);
        }
      } catch (error) {
        console.error('Error parsing activity:', error);
      }
    });
    
  } catch (error) {
    console.error('❌ Scraping error:', error);
  }
  
  return deduplicateEvents(activities);
}

// ============================================================================
// 工具函数
// ============================================================================

function generateId(prefix = 'event') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function parseDate(dateString) {
  if (!dateString) return new Date().toISOString().split('T')[0];
  
  const cleaned = dateString.trim();
  const patterns = [
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
    /(\d{4})-(\d{2})-(\d{2})/,
    /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/i
  ];
  
  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match) {
      const date = new Date(match[0]);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }
  }
  
  return new Date().toISOString().split('T')[0];
}

function inferCategory(text) {
  const categories = {
    cultural: ['culture', 'art', 'music', 'dance', 'theater', '文化', '艺术'],
    academic: ['lecture', 'seminar', 'workshop', 'research', '讲座', '学术'],
    sports: ['sport', 'fitness', 'gym', 'yoga', '体育', '健身'],
    social: ['social', 'party', 'networking', '社交', '聚会'],
    career: ['career', 'job', 'internship', 'recruitment', '职业', '招聘'],
    wellness: ['wellness', 'mental health', 'meditation', '健康', '心理']
  };
  
  const lower = String(text).toLowerCase();
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(k => lower.includes(k))) {
      return category;
    }
  }
  
  return 'general';
}

function deduplicateEvents(events) {
  const unique = new Map();
  
  events.forEach(event => {
    const key = `${(event.title || '').toLowerCase().slice(0, 50)}-${event.date}`;
    
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
  return String(text)
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s\u4e00-\u9fa5\-\.,!?]/g, '')
    .substring(0, 200);
}

function absolutizeUrl(base, href) {
  try {
    if (!href) return base;
    return new URL(href, base).toString();
  } catch {
    return href || base;
  }
}

// ============================================================================
// 定时任务
// ============================================================================

// 每小时刷新缓存
cron.schedule('0 * * * *', async () => {
  console.log('🔄 Running scheduled cache refresh...');
  try {
    const activities = await scrapeUCLActivities();
    setCache('ucl:activities', JSON.stringify({
      activities,
      total: activities.length,
      lastUpdated: new Date().toISOString()
    }), 3600);
    console.log(`✅ Cache refreshed: ${activities.length} activities`);
  } catch (error) {
    console.error('❌ Scheduled refresh failed:', error);
  }
});

// ============================================================================
// SPA 路由处理（必须放在最后）
// ============================================================================

app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error sending index.html:', err);
      res.status(500).send('Internal Server Error');
    }
  });
});

// ============================================================================
// 启动服务器
// ============================================================================

app.listen(PORT, '0.0.0.0', () => {
  console.log('\n' + '='.repeat(60));
  console.log('✅ UCL AI Assistant Server Started');
  console.log('='.repeat(60));
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`💚 Health: http://localhost:${PORT}/health`);
  console.log(`🤖 API: http://localhost:${PORT}/api/chat`);
  console.log(`📅 Activities: http://localhost:${PORT}/api/activities`);
  console.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('='.repeat(60) + '\n');
});

// ============================================================================
// 错误处理
// ============================================================================

process.on('uncaughtException', (error) => {
  console.error('\n❌ Uncaught Exception:');
  console.error(error);
  console.error('Stack:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n❌ Unhandled Rejection:');
  console.error('Promise:', promise);
  console.error('Reason:', reason);
});

process.on('SIGTERM', () => {
  console.log('\n⚠️  SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n⚠️  SIGINT received, shutting down gracefully...');
  process.exit(0);
});

module.exports = app;