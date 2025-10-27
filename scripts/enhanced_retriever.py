"""
增强版检索器 - 智能语义检索与意图识别
"""
import re
import logging
from typing import List, Dict, Tuple
from collections import Counter

logger = logging.getLogger(__name__)


class EnhancedRetriever:
    """增强版检索器"""
    
    def __init__(self):
        self.intent_keywords = {
            'modules': ['module', 'course', 'subject', 'curriculum', 'syllabus', 'teaching', 'learn', '课程', '模块'],
            'requirements': ['requirement', 'prerequisite', 'entry', 'admission', 'qualification', 'ielts', 'toefl', '要求', '申请'],
            'career': ['career', 'job', 'employment', 'graduate', 'prospect', '就业', '职业'],
            'fees': ['fee', 'tuition', 'cost', 'funding', 'scholarship', '学费', '费用'],
        }
    
    def detect_intent(self, query: str) -> str:
        """检测查询意图"""
        query_lower = query.lower()
        for intent, keywords in self.intent_keywords.items():
            if any(kw in query_lower for kw in keywords):
                return intent
        return 'general'
    
    def search_with_context(self, query: str, documents: List[dict], top_k: int = 8) -> List[Dict]:
        """上下文感知的智能检索"""
        intent = self.detect_intent(query)
        query_lower = query.lower()
        
        # 提取关键词
        keywords = self._extract_smart_keywords(query)
        
        logger.info(f"🔍 [检索] 查询: {query}")
        logger.info(f"🎯 [检索] 意图: {intent}")
        logger.info(f"🔑 [检索] 关键词: {keywords}")
        
        results = []
        
        for doc in documents:
            score = 0
            matched_sections = []
            
            title = doc.get('title', '').lower()
            level = doc.get('level', '').lower() if doc.get('level') else ''
            
            # 1. 标题匹配（权重最高）
            title_score = 0
            for kw in keywords:
                if kw in title:
                    title_score += 15
            
            # 精确匹配加倍
            if query_lower in title:
                title_score += 30
            
            score += title_score
            
            # 2. Level 匹配（硕士课程优先）
            if level and ('postgraduate' in level or 'msc' in level.lower()):
                if 'master' in query_lower or 'msc' in query_lower or '硕士' in query_lower:
                    score += 10
            
            # 3. Sections 深度匹配（核心改进）
            sections_score, relevant_sections = self._score_sections(
                doc.get('sections', []), 
                keywords, 
                intent
            )
            score += sections_score
            matched_sections = relevant_sections
            
            if score > 0:
                results.append({
                    'doc': doc,
                    'score': score,
                    'title_score': title_score,
                    'sections_score': sections_score,
                    'matched_sections': matched_sections,
                    'intent': intent
                })
        
        # 排序
        results.sort(key=lambda x: x['score'], reverse=True)
        
        logger.info(f"📊 [检索] 找到 {len(results)} 个相关文档，返回 top {top_k}")
        
        return results[:top_k]
    
    def _score_sections(self, sections: List[dict], keywords: List[str], intent: str) -> Tuple[int, List[dict]]:
        """对sections进行智能评分"""
        score = 0
        relevant_sections = []
        
        # 意图相关的section标题
        intent_headings = {
            'modules': ['module', 'curriculum', 'syllabus', 'teaching', 'what you will learn', 'course structure', 'compulsory', 'optional'],
            'requirements': ['entry', 'requirement', 'admission', 'english', 'qualification', 'ielts', 'toefl'],
            'career': ['career', 'employment', 'graduate', 'prospects', 'outcomes'],
            'fees': ['fee', 'tuition', 'cost', 'funding'],
        }
        
        target_headings = intent_headings.get(intent, [])
        
        for section in sections:
            heading = section.get('heading', '').lower()
            text = section.get('text', '').lower()
            section_score = 0
            
            # 1. Heading 匹配意图（高权重）
            if any(th in heading for th in target_headings):
                section_score += 20
            
            # 2. Heading 匹配关键词
            for kw in keywords:
                if kw in heading:
                    section_score += 10
            
            # 3. Text 内容匹配
            for kw in keywords:
                count = text.count(kw)
                section_score += min(count * 3, 15)  # 单个关键词最多贡献15分
            
            # 4. 特殊加权（modules 相关）
            if intent == 'modules':
                # 检查是否有列表结构
                if '•' in text or '\n-' in text or text.count('\n') > 5:
                    section_score += 15
                
                # 检查是否包含课程代码（如 COMP0001）
                if re.search(r'\b[A-Z]{4}\d{4}\b', text):
                    section_score += 10
            
            if section_score > 0:
                score += section_score
                relevant_sections.append({
                    'heading': section.get('heading', ''),
                    'text': section.get('text', '')[:800],  # 保留前800字符
                    'score': section_score
                })
        
        # 按分数排序相关sections
        relevant_sections.sort(key=lambda x: x['score'], reverse=True)
        
        return score, relevant_sections[:5]  # 最多返回5个最相关的section
    
    def _extract_smart_keywords(self, query: str) -> List[str]:
        """智能提取关键词"""
        # 停用词
        stopwords = {
            'what', 'how', 'where', 'when', 'which', 'who', 'the', 'a', 'an', 
            'is', 'are', 'was', 'were', 'do', 'does', 'did', 'about', 'for',
            '的', '是', '有', '在', '吗', '呢', '啊', '了'
        }
        
        # 提取英文单词
        english_words = re.findall(r'\b[a-z]+\b', query.lower())
        english_keywords = [w for w in english_words if w not in stopwords and len(w) > 2]
        
        # 提取中文词（2-4字）
        chinese_words = re.findall(r'[\u4e00-\u9fff]{2,4}', query)
        
        keywords = english_keywords + chinese_words
        
        # 同义词扩展
        synonyms = {
            'modules': ['module', 'course', 'subject', 'curriculum'],
            'requirements': ['requirement', 'entry', 'admission', 'prerequisite'],
            'master': ['msc', 'postgraduate', 'masters', '硕士'],
            'data': ['data', 'analytics', '数据'],
            'science': ['science', 'scientific', '科学'],
        }
        
        expanded = keywords.copy()
        for kw in keywords:
            if kw in synonyms:
                expanded.extend(synonyms[kw])
        
        return list(set(expanded))
