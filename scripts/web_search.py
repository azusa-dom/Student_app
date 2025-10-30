#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import logging
import requests
import time
from typing import List, Dict
from bs4 import BeautifulSoup
from urllib.parse import quote_plus

# ✅ [本次修复] 优先使用 ddgs，如果失败则回退到 duckduckgo_search
try:
    from ddgs import DDGS # 优先使用新版
    HAVE_DDGS_API = True
    logger = logging.getLogger("web_search") # 成功导入后再定义 logger
    if not logging.getLogger().handlers:
        logging.basicConfig(level=logging.INFO)
    logger.info("✅ 已加载 'ddgs' (新版) 库")
except ImportError:
    HAVE_DDGS_API = False
    try:
        from duckduckgo_search import DDGS # 尝试旧版
        HAVE_DDGS_API = True
        logger = logging.getLogger("web_search") # 成功导入后再定义 logger
        if not logging.getLogger().handlers:
            logging.basicConfig(level=logging.INFO)
        logger.warning("⚠️ 建议更新: pip install ddgs")
    except ImportError:
        # 两个都失败
        HAVE_DDGS_API = False
        logger = logging.getLogger("web_search")
        if not logging.getLogger().handlers:
            logging.basicConfig(level=logging.INFO)
        logger.error("❌ 'ddgs' 和 'duckduckgo_search' 均未安装!")

"""web_search.py - 修复版网络搜索

主要修复：
1. [关键] 放弃不稳定的 HTML 爬虫 (_search_google, _search_duckduckgo)
2. [关键] 改用 'ddgs' (或 'duckduckgo_search') 库，它使用稳定的 API。
3. [关键] 搜索 "UCL {query}" 以确保相关性。
"""

USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
HEADERS = {'User-Agent': USER_AGENT}

def search_web(query: str, language: str = "en", max_results: int = 5) -> List[Dict]:
    """
    网络搜索函数 - 修复版 (使用 DDGS API)
    """
    
    if not HAVE_DDGS_API:
        logger.error("❌ 'ddgs' (或 'duckduckgo_search') 库未安装!")
        logger.error("请运行: pip install ddgs")
        return []

    # 搜索时自动加上 "UCL" 前缀
    search_query = f"UCL {query}"
    
    # [新] 为中文查询设置 'zh-Hans' 区域
    region = 'zh-Hans,cn-zh' if language == 'zh' else 'wt-wt'
    
    results = []
    
    try:
        logger.info(f"🔍 [DDGS API] 搜索: {search_query} (区域: {region})")
        
        # 实例化 API
        with DDGS(headers=HEADERS, timeout=10) as ddgs:
            # 执行文本搜索
            api_results = ddgs.text(
                search_query,
                region=region,
                safesearch='off',
                max_results=max_results
            )
            
            if not api_results:
                logger.warning(f"⚠️ [DDGS API] 未返回任何结果 for: {search_query}")
                return []
            
            # 格式化结果
            for r in api_results:
                results.append({
                    'title': r.get('title', ''),
                    'url': r.get('href', ''),
                    'snippet': r.get('body', ''), # API 返回 'body' 作为摘要
                    'source': 'web'
                })
        
        logger.info(f"🌐 [DDGS API] 搜索成功: 找到 {len(results)} 个结果")
        return results

    except Exception as e:
        logger.error(f"❌ [DDGS API] 搜索失败: {e}", exc_info=True)
        return []


# 🔥 测试函数
def test_search():
    """测试搜索功能"""
    if not HAVE_DDGS_API:
        print("❌ 'ddgs' (或 'duckduckgo_search') 库未安装! 无法测试。")
        print("请运行: pip install ddgs")
        return
        
    test_queries = [
        "Computer Science MSc",
        "Data Science MSc modules",
        "UCL language requirements",
        "全球健康管理" # ✅ 测试中文
    ]
    
    for query in test_queries:
        print(f"\n{'='*60}")
        print(f"测试查询: {query}")
        print('='*60)
        
        results = search_web(query, max_results=3)
        
        print(f"找到 {len(results)} 个结果:\n")
        for i, r in enumerate(results, 1):
            print(f"{i}. {r['title']}")
            print(f"   URL: {r['url']}")
            print(f"   摘要: {r['snippet'][:100]}...")
            print()


if __name__ == "__main__":
    # 设置日志级别
    logging.basicConfig(level=logging.INFO)
    test_search()