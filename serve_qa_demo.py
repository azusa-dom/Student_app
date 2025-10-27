#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
UCL AI 问答系统 - 终极完美版
完全基于你爬取的真实数据
"""
import os
import json
import time
import logging
from pathlib import Path
from flask import Flask, request, jsonify

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)

# Groq API Key - 从环境变量读取
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

# ==================== 加载数据 ====================
def load_all_data():
    """加载课程和服务数据"""
    # 尝试多个可能的路径
    possible_paths = [
        ("/workspaces/Student_app/public/data/ucl_programs.json", 
         "/workspaces/Student_app/public/data/ucl_services.json"),
        ("./public/data/ucl_programs.json", "./public/data/ucl_services.json"),
        ("./data/ucl_programs.json", "./data/ucl_services.json"),
        ("../public/data/ucl_programs.json", "../public/data/ucl_services.json"),
    ]
    
    programs = []
    services = []
    
    for prog_path, serv_path in possible_paths:
        # 加载课程
        if Path(prog_path).exists():
            try:
                with open(prog_path, 'r', encoding='utf-8') as f:
                    programs = json.load(f)
                logger.info(f"✅ 课程数据: {len(programs)} 个")
            except Exception as e:
                logger.error(f"❌ 加载课程失败: {e}")
        
        # 加载服务
        if Path(serv_path).exists():
            try:
                with open(serv_path, 'r', encoding='utf-8') as f:
                    services = json.load(f)
                logger.info(f"✅ 服务数据: {len(services)} 个")
            except Exception as e:
                logger.error(f"❌ 加载服务失败: {e}")
        
        if programs or services:
            break
    
    return programs, services

PROGRAMS, SERVICES = load_all_data()

# ==================== Groq API ====================
def chat_with_groq(messages, temperature=0.2):
    """调用 Groq API"""
    import requests
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"}
    payload = {"model": "llama-3.1-8b-instant", "messages": messages, "temperature": temperature, "max_tokens": 400}
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        if response.status_code == 200:
            return response.json()["choices"][0]["message"]["content"].strip()
        logger.error(f"API 错误 {response.status_code}")
        return None
    except Exception as e:
        logger.error(f"调用失败: {e}")
        return None

# ==================== 智能搜索 ====================
def search_programs_and_services(query):
    """搜索课程和服务"""
    query_lower = query.lower()
    results = []
    
    # 关键词映射
    program_keywords = {
        'computer': ['computer', 'computing', 'software', 'cs', '计算机', '软件'],
        'data': ['data science', 'data analytics', 'analytics', '数据科学', '数据分析'],
        'business': ['business', 'management', 'mba', 'finance', '商科', '管理', '金融'],
        'economics': ['economics', 'econometrics', '经济'],
        'engineering': ['engineering', 'mechanical', 'civil', '工程'],
        'psychology': ['psychology', 'cognitive', '心理'],
        'medicine': ['medicine', 'medical', 'health', '医学', '健康'],
        'law': ['law', 'legal', '法律'],
    }
    
    service_keywords = {
        'career': ['career', 'job', 'employment', 'cv', 'resume', '职业', '简历', '求职'],
        'counseling': ['counseling', 'mental', 'wellbeing', 'support', '咨询', '心理', '健康'],
        'library': ['library', 'book', '图书馆'],
        'accommodation': ['accommodation', 'housing', '住宿'],
    }
    
    # 搜索课程 (PROGRAMS)
    for prog in PROGRAMS:
        score = 0
        title = prog.get('title', '').lower()
        url = prog.get('url', '')
        
        # 从 sections 提取所有文本
        all_text = title
        sections_data = []
        
        if 'sections' in prog:
            for section in prog['sections']:
                heading = section.get('heading', '')
                text = section.get('text', '')
                all_text += f" {heading} {text}".lower()
                sections_data.append({'heading': heading, 'text': text})
        
        # 关键词匹配
        for category, keywords in program_keywords.items():
            if any(kw in query_lower for kw in keywords):
                for kw in keywords:
                    score += all_text.count(kw) * 3
        
        # 直接词匹配
        for word in query_lower.split():
            if len(word) > 2:
                score += all_text.count(word) * 2
        
        if score > 0:
            results.append({
                'score': score,
                'type': 'program',
                'title': prog.get('title', '未知课程'),
                'url': url,
                'sections': sections_data[:5]  # 只取前5个section
            })
    
    # 搜索服务 (SERVICES)
    for serv in SERVICES:
        score = 0
        service_name = serv.get('service_name', '').lower()
        description = serv.get('description', '').lower()
        category = serv.get('category', '').lower()
        url = serv.get('url', '')
        
        all_text = f"{service_name} {description} {category}"
        
        # 关键词匹配
        for cat, keywords in service_keywords.items():
            if any(kw in query_lower for kw in keywords):
                for kw in keywords:
                    score += all_text.count(kw) * 3
        
        # 直接词匹配
        for word in query_lower.split():
            if len(word) > 2:
                score += all_text.count(word) * 2
        
        if score > 0:
            results.append({
                'score': score,
                'type': 'service',
                'title': serv.get('service_name', '未知服务'),
                'url': url,
                'description': description[:600],
                'category': serv.get('category', ''),
                'contact': serv.get('contact', ''),
                'how_to_access': serv.get('how_to_access', '')
            })
    
    # 按分数排序
    results.sort(key=lambda x: x['score'], reverse=True)
    return results[:5]

# ==================== 构建上下文 ====================
def build_context(results):
    """从搜索结果构建上下文"""
    context_parts = []
    
    for result in results[:3]:
        title = result['title']
        
        if result['type'] == 'program':
            # 课程类型
            for section in result.get('sections', [])[:3]:
                heading = section.get('heading', '')
                text = section.get('text', '')[:600]
                if text:
                    context_parts.append(f"【课程：{title} - {heading}】\n{text}")
        
        else:
            # 服务类型
            desc = result.get('description', '')[:600]
            contact = result.get('contact', '')
            access = result.get('how_to_access', '')
            
            info = f"【服务：{title}】\n{desc}"
            if contact:
                info += f"\n联系方式: {contact}"
            if access:
                info += f"\n访问方式: {access}"
            
            context_parts.append(info)
    
    return "\n\n".join(context_parts)

# ==================== Flask 应用 ====================
app = Flask(__name__)

@app.route('/')
def index():
    return '''<html lang="zh-CN">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>🎓 UCL AI Assistant - Redesigned</title>
  <style>
    * { 
      margin: 0; 
      padding: 0; 
      box-sizing: border-box; 
    }
    
    :root {
      --primary: #8B7BE8;
      --primary-dark: #6B5BC7;
      --primary-light: #A896F0;
      --secondary: #48bb78;
      --bg-gradient-1: #667eea;
      --bg-gradient-2: #764ba2;
      --text-dark: #2d3748;
      --text-light: #718096;
      --white: #ffffff;
      --error: #e53e3e;
      --success: #48bb78;
    }
    
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, var(--bg-gradient-1), var(--bg-gradient-2));
      min-height: 100vh;
      color: var(--text-dark);
      padding: 20px;
      transition: all 0.3s ease;
    }
    
    .container { 
      max-width: 1100px;
      margin: 0 auto;
    }
    
    /* Header Styles */
    header { 
      text-align: center;
      margin-bottom: 48px;
      color: var(--white);
      animation: fadeInDown 0.6s ease;
    }
    
    .header-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      margin-bottom: 16px;
    }
    
    .logo {
      font-size: 56px;
      animation: bounce 2s infinite;
    }
    
    h1 { 
      font-size: 48px;
      font-weight: 800;
      text-shadow: 0 4px 20px rgba(0,0,0,0.2);
      line-height: 1.2;
    }
    
    .subtitle { 
      font-size: 18px;
      opacity: 0.95;
      margin-top: 12px;
      font-weight: 400;
    }
    
    /* Language Toggle */
    .lang-toggle {
      position: absolute;
      top: 24px;
      right: 24px;
      background: rgba(255,255,255,0.2);
      backdrop-filter: blur(10px);
      border-radius: 30px;
      padding: 8px;
      display: flex;
      gap: 4px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
      z-index: 100;
    }
    
    .lang-btn {
      background: transparent;
      border: none;
      color: var(--white);
      padding: 10px 20px;
      border-radius: 24px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .lang-btn.active {
      background: var(--white);
      color: var(--primary);
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    
    .lang-btn:hover:not(.active) {
      background: rgba(255,255,255,0.15);
    }
    
    /* Status Badge */
    .status { 
      display: inline-block;
      background: rgba(255,255,255,0.2);
      backdrop-filter: blur(10px);
      padding: 12px 24px;
      border-radius: 24px;
      margin-top: 20px;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
    }
    
    /* Main Card */
    .card { 
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 32px;
      padding: 48px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
      animation: fadeInUp 0.6s ease;
    }
    
    /* Quick Questions Section */
    .quick-questions-section {
      margin-bottom: 40px;
    }
    
    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--text-dark);
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .section-title::before {
      content: '';
      width: 4px;
      height: 24px;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      border-radius: 2px;
    }
    
    .questions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
    }
    
    .question-card {
      background: linear-gradient(135deg, rgba(139, 123, 232, 0.08), rgba(107, 91, 199, 0.05));
      border: 2px solid rgba(139, 123, 232, 0.15);
      border-radius: 16px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    
    .question-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    .question-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(139, 123, 232, 0.25);
      border-color: var(--primary);
    }
    
    .question-card:hover::before {
      opacity: 1;
    }
    
    .question-card:hover .question-content {
      color: var(--white);
    }
    
    .question-content {
      position: relative;
      z-index: 1;
    }
    
    .question-icon {
      font-size: 28px;
      margin-bottom: 12px;
      display: block;
    }
    
    .question-text {
      font-size: 15px;
      font-weight: 600;
      line-height: 1.5;
      color: var(--text-dark);
      transition: color 0.3s ease;
    }
    
    .question-category {
      font-size: 12px;
      color: var(--text-light);
      margin-top: 8px;
      font-weight: 500;
      transition: color 0.3s ease;
    }
    
    .question-card:hover .question-category {
      color: rgba(255,255,255,0.8);
    }
    
    /* Search Box */
    .search-section {
      margin-bottom: 32px;
    }
    
    .search-box { 
      position: relative;
      margin-bottom: 16px;
    }
    
    #q { 
      width: 100%;
      padding: 20px 140px 20px 56px;
      border: 2px solid rgba(139, 123, 232, 0.2);
      border-radius: 20px;
      font-size: 16px;
      transition: all 0.3s ease;
      background: var(--white);
      font-family: inherit;
    }
    
    #q::placeholder {
      color: var(--text-light);
    }
    
    #q:focus { 
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 6px rgba(139, 123, 232, 0.1);
      transform: translateY(-2px);
    }
    
    .search-icon {
      position: absolute;
      left: 20px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 24px;
      color: var(--text-light);
      pointer-events: none;
    }
    
    #ask { 
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: var(--white);
      border: none;
      padding: 14px 32px;
      border-radius: 14px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(139, 123, 232, 0.3);
    }
    
    #ask:hover:not(:disabled) { 
      transform: translateY(-50%) scale(1.05);
      box-shadow: 0 6px 20px rgba(139, 123, 232, 0.4);
    }
    
    #ask:disabled { 
      background: #cbd5e0;
      cursor: not-allowed;
      box-shadow: none;
    }
    
    .search-hint {
      font-size: 13px;
      color: var(--text-light);
      text-align: center;
      padding: 0 20px;
    }
    
    /* Loading State */
    .loading { 
      text-align: center;
      padding: 60px 20px;
    }
    
    .spinner { 
      width: 56px;
      height: 56px;
      border: 4px solid rgba(139, 123, 232, 0.2);
      border-top-color: var(--primary);
      border-radius: 50%;
      margin: 0 auto 24px;
      animation: spin 0.8s linear infinite;
    }
    
    .loading-text {
      font-size: 16px;
      color: var(--text-dark);
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    .loading-subtext {
      font-size: 14px;
      color: var(--text-light);
    }
    
    /* Answer Box */
    .answer-container {
      animation: fadeIn 0.5s ease;
    }
    
    .intent-badge { 
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, var(--secondary), #38a169);
      color: var(--white);
      padding: 10px 20px;
      border-radius: 24px;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 20px;
      box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
    }
    
    .answer-box { 
      background: linear-gradient(135deg, rgba(247, 250, 252, 0.95), rgba(237, 242, 247, 0.95));
      border-left: 5px solid var(--primary);
      border-radius: 16px;
      padding: 32px;
      line-height: 1.8;
      margin-bottom: 32px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      font-size: 16px;
    }
    
    .answer-box strong {
      color: var(--primary);
      font-weight: 700;
    }
    
    /* Stats Grid */
    .stats { 
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }
    
    .stat { 
      background: rgba(255, 255, 255, 0.95);
      border-radius: 20px;
      padding: 24px;
      text-align: center;
      transition: all 0.3s ease;
      border: 2px solid rgba(139, 123, 232, 0.1);
    }
    
    .stat:hover { 
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      border-color: var(--primary);
    }
    
    .stat-label { 
      font-size: 13px;
      color: var(--text-light);
      margin-bottom: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .stat-value { 
      font-size: 32px;
      font-weight: 800;
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }
    
    /* Sources Section */
    .sources { 
      border-top: 2px solid rgba(139, 123, 232, 0.15);
      padding-top: 28px;
      margin-top: 28px;
    }
    
    .sources h4 { 
      font-size: 16px;
      color: var(--text-dark);
      margin-bottom: 20px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .source-item { 
      background: rgba(255, 255, 255, 0.9);
      padding: 18px 24px;
      border-radius: 14px;
      margin-bottom: 12px;
      border-left: 4px solid var(--primary);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    
    .source-item::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      background: linear-gradient(180deg, var(--primary), var(--primary-dark));
      transition: width 0.3s ease;
    }
    
    .source-item:hover::before {
      width: 100%;
      opacity: 0.05;
    }
    
    .source-item:hover { 
      background: rgba(255, 255, 255, 1);
      transform: translateX(6px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
    }
    
    .source-item a { 
      color: var(--primary);
      text-decoration: none;
      font-weight: 600;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      position: relative;
      z-index: 1;
    }
    
    .source-number {
      flex-shrink: 0;
      width: 28px;
      height: 28px;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: var(--white);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 700;
    }
    
    .source-content {
      flex: 1;
    }
    
    .source-title {
      font-size: 15px;
      line-height: 1.5;
      margin-bottom: 4px;
    }
    
    .source-score {
      font-size: 12px;
      color: var(--text-light);
      font-weight: 500;
    }
    
    /* Error State */
    .error { 
      background: linear-gradient(135deg, #fed7d7, #fcb8b8);
      border-left: 5px solid var(--error);
      padding: 24px;
      border-radius: 16px;
      color: #742a2a;
      animation: shake 0.5s ease;
    }
    
    .error-title {
      font-weight: 700;
      font-size: 18px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    /* Animations */
    @keyframes spin { 
      to { transform: rotate(360deg); } 
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes fadeInDown {
      from {
        opacity: 0;
        transform: translateY(-30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-10px); }
      75% { transform: translateX(10px); }
    }
    
    /* Responsive Design */
    @media (max-width: 768px) {
      body { padding: 16px; }
      
      .card { 
        padding: 28px 20px;
        border-radius: 24px;
      }
      
      h1 { font-size: 36px; }
      
      .subtitle { font-size: 16px; }
      
      .lang-toggle {
        top: 16px;
        right: 16px;
      }
      
      .questions-grid {
        grid-template-columns: 1fr;
      }
      
      #q { 
        padding: 18px 120px 18px 48px;
        font-size: 15px;
      }
      
      .search-icon {
        left: 16px;
        font-size: 20px;
      }
      
      #ask {
        padding: 12px 24px;
        font-size: 14px;
      }
      
      .stats {
        grid-template-columns: repeat(2, 1fr);
      }
      
      .stat-value {
        font-size: 28px;
      }
    }
    
    @media (max-width: 480px) {
      .header-content {
        flex-direction: column;
        gap: 8px;
      }
      
      h1 { font-size: 28px; }
      
      .stats {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <!-- Language Toggle -->
  <div class="lang-toggle">
    <button class="lang-btn active" data-lang="zh" onclick="switchLanguage('zh')">中文</button>
    <button class="lang-btn" data-lang="en" onclick="switchLanguage('en')">English</button>
  </div>

  <div class="container">
    <!-- Header -->
    <header>
      <div class="header-content">
        <span class="logo">🎓</span>
        <h1 data-i18n="title">UCL AI Assistant</h1>
      </div>
      <p class="subtitle" data-i18n="subtitle">增强版检索 · 智能检索 · 精准回答</p>
      <div class="status" id="status">🔄 <span data-i18n="status-connecting">正在连接...</span></div>
    </header>

    <!-- Main Card -->
    <div class="card">
      <!-- Quick Questions Section -->
      <div class="quick-questions-section">
        <h3 class="section-title">
          <span data-i18n="quick-questions">💡 快速问题</span>
        </h3>
        <div class="questions-grid" id="questionsGrid">
          <!-- Questions will be dynamically generated -->
        </div>
      </div>

      <!-- Search Section -->
      <div class="search-section">
        <h3 class="section-title">
          <span data-i18n="custom-query">🔍 自定义查询</span>
        </h3>
        <div class="search-box">
          <span class="search-icon">🔎</span>
          <input 
            id="q" 
            data-i18n-placeholder="search-placeholder"
            placeholder="请输入您的问题，例如：Data Science MSc 有哪些课程模块？"
            onkeypress="if(event.key==='Enter')ask()"
          />
          <button id="ask" onclick="ask()">
            <span data-i18n="ask-btn">提问</span>
          </button>
        </div>
        <p class="search-hint" data-i18n="search-hint">💡 支持中英文提问，可询问专业信息、入学要求、课程模块等</p>
      </div>

      <!-- Results Stage -->
      <div id="stage"></div>
    </div>
  </div>

  <script>
    // API Configuration
    const API_BASE = 'http://localhost:5051';
    
    // Language Translations
    const translations = {
      zh: {
        title: 'UCL AI 助手',
        subtitle: '增强版检索 · 智能检索 · 精准回答',
        'status-connecting': '正在连接...',
        'status-connected': '后端已连接 (增强版检索)',
        'status-disconnected': '后端未启动',
        'quick-questions': '💡 快速问题',
        'custom-query': '🔍 自定义查询',
        'search-placeholder': '请输入您的问题，例如：Data Science MSc 有哪些课程模块？',
        'ask-btn': '提问',
        'search-hint': '💡 支持中英文提问，可询问专业信息、入学要求、课程模块等',
        'thinking': '思考中...',
        'searching': '🔍 智能检索中...',
        'analyzing': '正在分析相关信息...',
        'error-title': '❌ 查询出错',
        'sources-title': '🔗 参考来源',
        'stat-docs': '检索文档',
        'stat-time': '响应时间',
        'stat-intent': '意图识别',
        questions: [
          {
            icon: '📊',
            text: '请问 Data Science MSc 专业有哪些核心课程模块？',
            category: '课程信息',
            query: 'What are the core modules in Data Science MSc?'
          },
          {
            icon: '💻',
            text: '申请 Computer Science MSc 需要满足什么语言要求？',
            category: '入学要求',
            query: 'Computer Science MSc language requirements'
          },
          {
            icon: '🧠',
            text: '我想了解 UCL 的心理咨询服务，如何预约？',
            category: '学生服务',
            query: '如何预约心理咨询'
          },
          {
            icon: '📈',
            text: 'Business Analytics MSc 的入学要求和申请条件是什么？',
            category: '申请信息',
            query: 'Business Analytics MSc entry requirements'
          },
          {
            icon: '💰',
            text: '国际学生就读工程类硕士的学费是多少？',
            category: '费用咨询',
            query: 'Engineering MSc tuition fees for international students'
          },
          {
            icon: '🌍',
            text: 'UCL 为国际学生提供哪些语言支持和帮助？',
            category: '学生支持',
            query: 'Language support for international students at UCL'
          }
        ]
      },
      en: {
        title: 'UCL AI Assistant',
        subtitle: 'Enhanced Search · Intelligent Retrieval · Accurate Answers',
        'status-connecting': 'Connecting...',
        'status-connected': 'Backend Connected (Enhanced)',
        'status-disconnected': 'Backend Not Running',
        'quick-questions': '💡 Quick Questions',
        'custom-query': '🔍 Custom Query',
        'search-placeholder': 'Enter your question, e.g., What modules are in Data Science MSc?',
        'ask-btn': 'Ask',
        'search-hint': '💡 Supports both Chinese and English queries about programs, requirements, modules, etc.',
        'thinking': 'Thinking...',
        'searching': '🔍 Searching intelligently...',
        'analyzing': 'Analyzing relevant information...',
        'error-title': '❌ Query Error',
        'sources-title': '🔗 Reference Sources',
        'stat-docs': 'Documents',
        'stat-time': 'Response Time',
        'stat-intent': 'Intent Detection',
        questions: [
          {
            icon: '📊',
            text: 'What are the core modules in the Data Science MSc program?',
            category: 'Course Info',
            query: 'What are the core modules in Data Science MSc?'
          },
          {
            icon: '💻',
            text: 'What are the language requirements for Computer Science MSc?',
            category: 'Entry Requirements',
            query: 'Computer Science MSc language requirements'
          },
          {
            icon: '🧠',
            text: 'How can I book a psychological counseling session at UCL?',
            category: 'Student Services',
            query: 'How to book psychological counseling at UCL'
          },
          {
            icon: '📈',
            text: 'What are the entry requirements for Business Analytics MSc?',
            category: 'Application Info',
            query: 'Business Analytics MSc entry requirements'
          },
          {
            icon: '💰',
            text: 'What are the tuition fees for Engineering MSc for international students?',
            category: 'Fees',
            query: 'Engineering MSc tuition fees for international students'
          },
          {
            icon: '🌍',
            text: 'What language support does UCL offer to international students?',
            category: 'Support Services',
            query: 'Language support for international students at UCL'
          }
        ]
      }
    };
    
    // Current Language
    let currentLang = 'zh';
    
    // DOM Elements
    const q = document.getElementById('q');
    const askBtn = document.getElementById('ask');
    const stage = document.getElementById('stage');
    const status = document.getElementById('status');
    const questionsGrid = document.getElementById('questionsGrid');
    
    // Initialize
    function init() {
      renderQuestions();
      checkBackend();
      setInterval(checkBackend, 30000);
      console.log('[UCL AI] Redesigned v4.0 Initialized');
    }
    
    // Switch Language
    function switchLanguage(lang) {
      currentLang = lang;
      
      // Update active button
      document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
      });
      
      // Update all i18n elements
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        el.textContent = translations[lang][key] || key;
      });
      
      // Update placeholder
      const placeholder = document.querySelector('[data-i18n-placeholder]');
      if (placeholder) {
        placeholder.placeholder = translations[lang]['search-placeholder'];
      }
      
      // Re-render questions
      renderQuestions();
      
      // Update status if needed
      checkBackend();
    }
    
    // Render Quick Questions
    function renderQuestions() {
      const questions = translations[currentLang].questions;
      questionsGrid.innerHTML = questions.map(q => `
        <div class="question-card" onclick="quickAsk('${escapeHtml(q.query)}')">
          <div class="question-content">
            <span class="question-icon">${q.icon}</span>
            <div class="question-text">${q.text}</div>
            <div class="question-category">${q.category}</div>
          </div>
        </div>
      `).join('');
    }
    
    // Check Backend Status
    async function checkBackend() {
      try {
        const response = await fetch(API_BASE + '/api/health');
        if (response.ok) {
          status.innerHTML = '✅ ' + translations[currentLang]['status-connected'];
          status.style.background = 'rgba(72,187,120,0.3)';
          return true;
        }
      } catch (e) {
        console.warn('Backend check failed:', e);
      }
      status.innerHTML = '❌ ' + translations[currentLang]['status-disconnected'];
      status.style.background = 'rgba(229,62,62,0.3)';
      return false;
    }
    
    // Quick Ask
    function quickAsk(text) {
      q.value = text;
      setTimeout(ask, 150);
    }
    
    // Main Ask Function
    async function ask() {
      const text = (q.value || '').trim();
      if (!text) {
        q.focus();
        return;
      }
      
      askBtn.disabled = true;
      askBtn.innerHTML = '<span data-i18n="thinking">' + translations[currentLang]['thinking'] + '</span>';
      
      stage.innerHTML = `
        <div class="loading">
          <div class="spinner"></div>
          <div class="loading-text">${translations[currentLang]['searching']}</div>
          <div class="loading-subtext">${translations[currentLang]['analyzing']}</div>
        </div>
      `;
      
      try {
        console.log('[Query]', text);
        const response = await fetch(API_BASE + '/api/qa?query=' + encodeURIComponent(text));
        console.log('[Status]', response.status);
        
        if (!response.ok) throw new Error('HTTP ' + response.status);
        
        const data = await response.json();
        console.log('[Data]', data);
        
        renderAnswer(data);
      } catch (error) {
        console.error('[Error]', error);
        stage.innerHTML = `
          <div class="error">
            <div class="error-title">${translations[currentLang]['error-title']}</div>
            <div>${escapeHtml(error.message)}</div>
          </div>
        `;
      } finally {
        askBtn.disabled = false;
        askBtn.innerHTML = '<span data-i18n="ask-btn">' + translations[currentLang]['ask-btn'] + '</span>';
      }
    }
    
    // Render Answer
    function renderAnswer(data) {
      const intent = data.intent || 'general';
      let answer = data.answer || '未找到相关信息';
      
      // Format answer
      answer = escapeHtml(answer)
        .replace(/
/g, '<br/>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/• /g, '&bull; ');
      
      const docs = data.num_docs || 0;
      const responseTime = data.response_time || '-';
      
      // Intent labels
      const intentLabels = {
        modules: '📚 课程模块',
        requirements: '✅ 入学要求',
        career: '💼 职业发展',
        fees: '💰 学费查询',
        general: '🔍 通用查询'
      };
      
      // Build sources HTML
      let sourcesHtml = '';
      if (data.citations && data.citations.length > 0) {
        sourcesHtml = `
          <div class="sources">
            <h4>${translations[currentLang]['sources-title']}</h4>
            ${data.citations.map((source, index) => {
              const scoreText = source.relevance_score 
                ? `<span class="source-score">相关度: ${source.relevance_score}</span>` 
                : '';
              return `
                <div class="source-item">
                  <a href="${escapeHtml(source.url)}" target="_blank">
                    <div class="source-number">${index + 1}</div>
                    <div class="source-content">
                      <div class="source-title">${escapeHtml(source.title)}</div>
                      ${scoreText}
                    </div>
                  </a>
                </div>
              `;
            }).join('')}
          </div>
        `;
      }
      
      // Render final result
      stage.innerHTML = `
        <div class="answer-container">
          <div class="intent-badge">
            ${intentLabels[intent] || '🔍 ' + intent}
          </div>
          <div class="answer-box">${answer}</div>
          <div class="stats">
            <div class="stat">
              <div class="stat-label">${translations[currentLang]['stat-docs']}</div>
              <div class="stat-value">${docs}</div>
            </div>
            <div class="stat">
              <div class="stat-label">${translations[currentLang]['stat-time']}</div>
              <div class="stat-value">${responseTime.replace('s', '<small>s</small>')}</div>
            </div>
            <div class="stat">
              <div class="stat-label">${translations[currentLang]['stat-intent']}</div>
              <div class="stat-value">✓</div>
            </div>
          </div>
          ${sourcesHtml}
        </div>
      `;
    }
    
    // Utility: Escape HTML
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
    
    // Initialize on load
    init();
  </script>
</body>
</html>'''

@app.route('/api/qa', methods=['GET'])
def api_qa():
    query = request.args.get('query', '').strip()
    if not query:
        return jsonify({'error': 'Missing query'}), 400
    
    logger.info(f"\n{'='*60}")
    logger.info(f"[Query] {query}")
    
    start_time = time.time()
    
    try:
        # 搜索数据
        results = search_programs_and_services(query)
        logger.info(f"Found {len(results)} results")
        
        if not results:
            return jsonify({
                'answer': 'Sorry, no relevant information found. Please try different keywords or visit UCL website.',
                'sources': [],
                'num_sources': 0,
                'response_time': f"{time.time() - start_time:.2f}s"
            })
        
        # 构建上下文
        context = build_context(results)
        logger.info(f"Context length: {len(context)} chars")
        
        # 调用 Groq
        system_prompt = """You are a UCL assistant. Answer based on the provided data.

Requirements:
1. Only use provided data
2. Answer concisely (under 100 words)
3. Use bullet points (•) for key information
4. Be direct, don't say "according to data"
5. If asking about language requirements, mention specific scores
6. If asking about modules/courses, list them"""

        user_prompt = f"""Data:
{context}

Question: {query}

Answer:"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        
        logger.info("📤 Calling Groq API...")
        answer = chat_with_groq(messages, 0.2)
        
        if not answer:
            answer = f"Found {len(results)} relevant sources, but AI generation failed. Please check the references below."
        
        # 构建来源列表
        sources = [
            {"title": r['title'], "url": r['url'], "type": r['type']}
            for r in results
        ]
        
        response_time = f"{time.time() - start_time:.2f}s"
        
        logger.info(f"✅ Completed in {response_time}")
        logger.info(f"{'='*60}\n")
        
        return jsonify({
            'answer': answer,
            'sources': sources,
            'num_sources': len(results),
            'response_time': response_time
        })
        
    except Exception as e:
        logger.error(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'answer': f'System error: {str(e)}',
            'sources': [],
            'num_sources': 0,
            'response_time': f"{time.time() - start_time:.2f}s"
        }), 500

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚀 UCL AI Assistant - Ultimate Edition")
    print("="*60)
    print(f"✅ Groq API: llama-3.1-8b-instant")
    print(f"✅ Programs loaded: {len(PROGRAMS)}")
    print(f"✅ Services loaded: {len(SERVICES)}")
    print(f"✅ Total data: {len(PROGRAMS) + len(SERVICES)}")
    print(f"\n📍 Server: http://127.0.0.1:5051")
    print("="*60 + "\n")
    
    if not PROGRAMS and not SERVICES:
        print("⚠️  WARNING: No data loaded!")
        print("Please ensure JSON files are in the correct location:")
        print("  - /workspaces/Student_app/public/data/ucl_programs.json")
        print("  - /workspaces/Student_app/public/data/ucl_services.json\n")
    
    app.run(host='0.0.0.0', port=5051, debug=False)