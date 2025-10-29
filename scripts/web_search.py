#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""联网搜索模块 - 使用 DuckDuckGo 真实实现"""

import logging
import requests
from typing import List, Dict
from bs4 import BeautifulSoup
import re
import time

logger = logging.getLogger(__name__)

class WebSearcher:
    """联网搜索器 - 使用 DuckDuckGo HTML 搜索"""
    
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
        self.session = requests.Session()
    
    def search_ucl_info(self, query: str, max_results: int = 3) -> List[Dict]:
        """
        搜索 UCL 相关信息
        
        Args:
            query: 搜索查询
            max_results: 最多返回结果数
            
        Returns:
            List[Dict]: 搜索结果列表
        """
        # 🔥 限制搜索范围在 UCL 官网
        search_query = f"site:ucl.ac.uk {query}"
        
        try:
            # 使用 DuckDuckGo HTML 搜索
            url = "https://html.duckduckgo.com/html/"
            params = {"q": search_query}
            
            logger.info(f"🌐 Searching: {search_query}")
            
            response = self.session.post(
                url, 
                data=params, 
                headers=self.headers, 
                timeout=10
            )
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            results = []
            
            # 解析搜索结果
            result_divs = soup.find_all('div', class_='result')
            
            logger.info(f"📊 Found {len(result_divs)} raw results")
            
            for result_div in result_divs[:max_results * 2]:  # 多取一些以备过滤
                try:
                    # 提取标题和链接
                    title_elem = result_div.find('a', class_='result__a')
                    if not title_elem:
                        continue
                    
                    title = title_elem.get_text(strip=True)
                    result_url = title_elem.get('href', '')
                    
                    # 清理 DuckDuckGo 的跳转链接
                    if result_url.startswith('//duckduckgo.com/l/'):
                        # 提取真实URL
                        match = re.search(r'uddg=(https?://[^&]+)', result_url)
                        if match:
                            result_url = match.group(1)
                    
                    # 确保是 UCL 域名
                    if 'ucl.ac.uk' not in result_url:
                        continue
                    
                    # 提取摘要
                    snippet_elem = result_div.find('a', class_='result__snippet')
                    snippet = snippet_elem.get_text(strip=True) if snippet_elem else ""
                    
                    # 如果没有摘要，尝试其他元素
                    if not snippet:
                        snippet_elem = result_div.find('div', class_='result__snippet')
                        snippet = snippet_elem.get_text(strip=True) if snippet_elem else ""
                    
                    if not snippet:
                        snippet = "No description available"
                    
                    results.append({
                        "title": title,
                        "url": result_url,
                        "snippet": snippet[:500],  # 限制长度
                        "source": "web"
                    })
                    
                    if len(results) >= max_results:
                        break
                    
                except Exception as e:
                    logger.debug(f"⚠️  Failed to parse result: {e}")
                    continue
            
            logger.info(f"✅ Web search found {len(results)} valid UCL results")
            return results
            
        except requests.Timeout:
            logger.error("❌ Web search timeout")
            return []
        except requests.RequestException as e:
            logger.error(f"❌ Web search request failed: {e}")
            return []
        except Exception as e:
            logger.error(f"❌ Web search failed: {e}")
            return []


def search_web(query: str, language: str = "en") -> List[Dict]:
    """
    便捷函数：联网搜索
    
    Args:
        query: 搜索查询
        language: 语言（用于提示词）
        
    Returns:
        List[Dict]: 搜索结果
    """
    try:
        searcher = WebSearcher()
        return searcher.search_ucl_info(query)
    except Exception as e:
        logger.error(f"❌ Search wrapper failed: {e}")
        return []


# 测试代码
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    
    test_query = "Computer Science MSc entry requirements"
    results = search_web(test_query)
    
    print(f"\n{'='*80}")
    print(f"Search: {test_query}")
    print(f"{'='*80}\n")
    
    for i, result in enumerate(results, 1):
        print(f"[{i}] {result['title']}")
        print(f"    URL: {result['url']}")
        print(f"    Snippet: {result['snippet'][:150]}...")
        print()