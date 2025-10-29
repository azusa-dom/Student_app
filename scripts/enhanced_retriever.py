#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
enhanced_retriever.py - 启动时预计算版本

🔥 关键优化：
1. 启动时一次性预计算所有文档embeddings
2. 查询时直接使用缓存，不再实时计算
3. 支持增量更新缓存
"""

import os
import json
import logging
import math
import re
import time
from collections import Counter
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import numpy as np

# ============================================================================
# 日志配置
# ============================================================================
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================================
# 依赖检查
# ============================================================================
try:
    from sentence_transformers import SentenceTransformer, util
    import torch
    HAVE_SEMANTIC = True
    logger.info("✅ sentence-transformers 加载成功")
except Exception as e:
    HAVE_SEMANTIC = False
    logger.warning(f"⚠️ sentence-transformers 不可用: {e}")

try:
    import jieba
    HAVE_JIEBA = True
    logger.info("✅ jieba 加载成功")
except Exception:
    HAVE_JIEBA = False
    logger.warning("⚠️ jieba 不可用，使用正则分词")

# ============================================================================
# 配置常量
# ============================================================================
class ScoringConfig:
    """评分权重配置"""
    KEYWORD_IN_TITLE = 14
    EXACT_QUERY_MATCH = 36
    SYNONYM_MATCH = 28
    PROGRAM_PREFIX_MATCH = 60
    PROGRAM_CONTAINS_MATCH = 32
    FUZZY_MATCH_MULTIPLIER = 24
    DEGREE_TAG_MATCH = 12
    INTENT_HEADING_MATCH = 20
    KEYWORD_IN_HEADING = 10
    KEYWORD_IN_TEXT_PER_OCCURRENCE = 3
    MAX_KEYWORD_TEXT_SCORE = 18
    LIST_STRUCTURE_BONUS = 15
    COURSE_CODE_BONUS = 10
    LEVEL_BOOST = 12
    LEVEL_PENALTY = -8
    SEMANTIC_MULTIPLIER = 40
    SECTION_LENGTH_NORMALIZATION_BASE = 150


class CommonPhrases:
    """常见查询短语及其扩展"""
    PHRASES = {
        "language requirements": ["entry requirements", "english language", "ielts", "toefl", "language proficiency"],
        "core modules": ["compulsory modules", "core courses", "required modules", "mandatory"],
        "tuition fees": ["fees", "cost", "tuition", "funding", "scholarship"],
        "entry requirements": ["admission", "qualification", "prerequisite", "grade"],
        "career prospects": ["employment", "graduate outcomes", "career", "job"],
    }


# ============================================================================
# 主类 - 启动时预计算版本
# ============================================================================
class EnhancedRetriever:
    """增强版检索器 - 启动时预计算版本"""

    def __init__(self, enable_semantic: bool = True, preload_documents: Optional[List[Dict]] = None) -> None:
        """
        初始化检索器
        
        Args:
            enable_semantic: 是否启用语义搜索
            preload_documents: 启动时预加载的文档列表（如果提供，会立即预计算）
        """
        self.enable_semantic = enable_semantic and HAVE_SEMANTIC
        
        # 初始化语义模型
        self.semantic_model = None
        if self.enable_semantic:
            self._load_semantic_model()
        
        # 缓存（改为持久化存储）
        self._doc_embeddings_cache: Dict[str, np.ndarray] = {}  # key: doc_url, value: embedding
        self._query_embedding_cache: Dict[str, np.ndarray] = {}
        
        # 文档索引（用于快速查找）
        self._doc_index: Dict[str, Dict] = {}  # key: doc_url, value: doc
        
        # 领域词汇
        self.domain_vocab = self._build_domain_vocab()
        
        logger.info(f"🚀 EnhancedRetriever 初始化完成 (semantic={self.enable_semantic})")
        
        # 🔥 启动时预计算
        if preload_documents:
            self.precompute_all_embeddings(preload_documents)

    def _load_semantic_model(self) -> None:
        """加载语义模型"""
        if not HAVE_SEMANTIC:
            logger.warning("⚠️ sentence-transformers 未安装")
            self.enable_semantic = False
            return

        try:
            logger.info("📥 正在加载语义模型...")
            self.semantic_model = SentenceTransformer("all-MiniLM-L6-v2", device="cpu")
            # 预热模型
            _ = self.semantic_model.encode("warmup", convert_to_tensor=False, show_progress_bar=False)
            logger.info("✅ 语义模型加载成功")
        except Exception as exc:
            logger.error(f"❌ 语义模型加载失败: {exc}")
            self.enable_semantic = False
            self.semantic_model = None

    def precompute_all_embeddings(self, documents: List[Dict], batch_size: int = 32) -> None:
        """
        🔥 启动时一次性预计算所有文档的 embeddings
        
        Args:
            documents: 文档列表
            batch_size: 批处理大小
        """
        if not self.enable_semantic or self.semantic_model is None:
            logger.warning("⚠️ 语义搜索未启用，跳过预计算")
            return
        
        start_time = time.time()
        logger.info(f"📊 开始预计算 {len(documents)} 个文档的 embeddings...")
        
        # 准备文本和对应的 URL
        texts = []
        urls = []
        
        for doc in documents:
            if not doc or not isinstance(doc, dict):
                continue
            
            url = doc.get("url", "") or doc.get("title", "")
            if not url:
                continue
            
            # 提取文档文本
            doc_text = self._extract_doc_text(doc)
            if doc_text:
                texts.append(doc_text)
                urls.append(url)
                self._doc_index[url] = doc
        
        if not texts:
            logger.warning("⚠️ 没有有效的文档文本，跳过预计算")
            return
        
        # 🔥 批量计算 embeddings（大幅提速）
        logger.info(f"🚀 批量计算 embeddings (batch_size={batch_size})...")
        try:
            # 使用 show_progress_bar=True 显示进度
            embeddings = self.semantic_model.encode(
                texts,
                batch_size=batch_size,
                convert_to_numpy=True,  # 直接转为 numpy
                show_progress_bar=True,
                normalize_embeddings=True  # L2 归一化，加速相似度计算
            )
            
            # 存入缓存
            for url, emb in zip(urls, embeddings):
                self._doc_embeddings_cache[url] = emb
            
            elapsed = time.time() - start_time
            logger.info(f"✅ 预计算完成: {len(self._doc_embeddings_cache)} 个文档，耗时 {elapsed:.2f}s")
            logger.info(f"📈 平均速度: {len(texts) / elapsed:.1f} docs/s")
        
        except Exception as e:
            logger.error(f"❌ 批量预计算失败: {e}", exc_info=True)

    def search_with_context(
        self, 
        query: str, 
        documents: List[Dict], 
        top_k: int = 5,
        intent: str = "general"
    ) -> List[Dict]:
        """
        主搜索入口 - 优先使用预计算的 embeddings
        
        Args:
            query: 搜索查询
            documents: 文档列表（通常不需要，直接使用缓存）
            top_k: 返回结果数量
            intent: 查询意图
        
        Returns:
            排序后的搜索结果列表
        """
        logger.info(f"🔍 开始搜索: query='{query}', top_k={top_k}, cached_docs={len(self._doc_embeddings_cache)}")
        
        results = []
        
        # 🔥 优先尝试语义搜索（使用预计算的 embeddings）
        if self.enable_semantic and self.semantic_model is not None and self._doc_embeddings_cache:
            try:
                results = self._semantic_search_cached(query, top_k)
                if results:
                    logger.info(f"✅ 语义搜索成功: 找到 {len(results)} 个结果")
                    return results
                else:
                    logger.warning("⚠️ 语义搜索返回空结果")
            except Exception as e:
                logger.error(f"❌ 语义搜索异常: {e}", exc_info=True)
        
        # 🔥 降级到关键词检索
        logger.info("🔄 降级到关键词检索...")
        # 如果 documents 为空，使用缓存的文档
        docs_to_search = documents if documents else list(self._doc_index.values())
        results = self._keyword_search(query, docs_to_search, top_k, intent)
        logger.info(f"✅ 关键词搜索完成: 找到 {len(results)} 个结果")
        
        return results

    def _semantic_search_cached(self, query: str, top_k: int) -> List[Dict]:
        """
        🔥 使用预计算的 embeddings 进行语义搜索（极速版）
        
        Returns:
            搜索结果列表
        """
        if not self._doc_embeddings_cache:
            logger.warning("⚠️ 缓存为空，无法执行语义搜索")
            return []
        
        try:
            logger.info("⚡ 执行缓存语义搜索...")
            
            # 1. 编码查询（带缓存）
            query_embedding = self._encode_query_cached(query)
            if query_embedding is None:
                logger.error("❌ 查询编码失败")
                return []
            
            # 2. 计算所有文档的相似度（向量化计算，极快）
            urls = list(self._doc_embeddings_cache.keys())
            doc_embeddings = np.array([self._doc_embeddings_cache[url] for url in urls])
            
            # 🔥 批量计算余弦相似度（已归一化，直接点积）
            similarities = np.dot(doc_embeddings, query_embedding)
            
            # 3. 获取 top_k
            top_indices = np.argsort(similarities)[::-1][:top_k * 2]  # 取 2 倍，过滤后再截断
            
            results = []
            for idx in top_indices:
                sim = float(similarities[idx])
                if sim < 0.1:  # 过滤低分
                    continue
                
                url = urls[idx]
                doc = self._doc_index.get(url)
                if not doc:
                    continue
                
                results.append({
                    'doc': doc,
                    'score': sim * 100,  # 归一化到 0-100
                    'matched_sections': self._find_relevant_sections(doc, query)
                })
            
            logger.info(f"✅ 缓存语义搜索完成: {len(results)} 个结果")
            return results[:top_k]
        
        except Exception as e:
            logger.error(f"❌ 缓存语义搜索失败: {e}", exc_info=True)
            return []

    def _encode_query_cached(self, query: str) -> Optional[np.ndarray]:
        """编码查询（带缓存）"""
        if query in self._query_embedding_cache:
            return self._query_embedding_cache[query]
        
        try:
            # 直接返回 numpy，且 L2 归一化
            embedding = self.semantic_model.encode(
                query,
                convert_to_numpy=True,
                normalize_embeddings=True,
                show_progress_bar=False
            )
            
            self._query_embedding_cache[query] = embedding
            return embedding
        except Exception as e:
            logger.error(f"❌ 查询编码失败: {e}")
            return None

    def _extract_doc_text(self, doc: Dict) -> str:
        """提取文档文本用于 embedding"""
        text_parts = []
        
        # 标题（权重更高，重复3次）
        title = doc.get("title", "")
        if title:
            text_parts.append(f"{title}. {title}. {title}.")
        
        # Level/Degree
        level = doc.get("level", "")
        if level:
            text_parts.append(f"Level: {level}.")
        
        # Sections（只取前 10 个，每个截断到 200 字符）
        sections = doc.get("sections", [])
        if sections and isinstance(sections, list):
            for section in sections[:10]:
                if not isinstance(section, dict):
                    continue
                heading = section.get("heading", "")
                text = section.get("text", "")
                if heading:
                    text_parts.append(f"{heading}: {text[:200]}")
                elif text:
                    text_parts.append(text[:200])
        
        return " ".join(text_parts)

    def _find_relevant_sections(self, doc: Dict, query: str) -> List[Dict]:
        """找到相关的 sections"""
        relevant = []
        query_lower = query.lower()
        query_words = set(query_lower.split())
        
        sections = doc.get("sections", [])
        if not sections or not isinstance(sections, list):
            return []
        
        for section in sections[:20]:
            if not isinstance(section, dict):
                continue
            
            heading = section.get("heading", "").lower()
            text = section.get("text", "").lower()
            
            # 计算关键词匹配度
            matches = sum(1 for word in query_words if len(word) > 2 and (word in heading or word in text))
            
            if matches > 0:
                relevant.append({
                    "heading": section.get("heading", ""),
                    "text": section.get("text", "")[:500],
                    "score": matches
                })
        
        relevant.sort(key=lambda x: x["score"], reverse=True)
        return relevant[:3]

    def _keyword_search(self, query: str, documents: List[Dict], top_k: int, intent: str) -> List[Dict]:
        """关键词检索（降级方案）"""
        logger.info("🔎 执行关键词检索...")
        
        keywords = self._extract_keywords(query)
        logger.info(f"📝 提取关键词: {keywords[:10]}")
        
        if not keywords:
            logger.warning("⚠️ 未提取到有效关键词")
            return []
        
        scored_docs = []
        for doc in documents:
            if not doc or not isinstance(doc, dict):
                continue
            
            score_result = self._score_document(doc, keywords, intent)
            if score_result["score"] > 0:
                scored_docs.append({
                    "doc": doc,
                    "score": score_result["score"],
                    "matched_sections": score_result.get("matched_sections", [])
                })
        
        scored_docs.sort(key=lambda x: x["score"], reverse=True)
        return scored_docs[:top_k]

    def _extract_keywords(self, query: str) -> List[str]:
        """提取查询关键词"""
        stopwords = {
            "what", "how", "where", "when", "which", "who", "the", "a", "an",
            "is", "are", "was", "were", "do", "does", "did", "about", "for",
            "的", "是", "有", "在", "吗", "呢", "啊", "了",
        }
        
        try:
            query_lower = query.lower()
            
            # 英文关键词
            english_words = re.findall(r"\b[a-z]+\b", query_lower)
            english_keywords = [w for w in english_words if w not in stopwords and len(w) > 2]
            
            # 中文关键词
            chinese_keywords = []
            chinese_matches = re.findall(r"[\u4e00-\u9fff]+", query)
            for chunk in chinese_matches:
                if HAVE_JIEBA:
                    chinese_keywords.extend([
                        token for token in jieba.cut(chunk) 
                        if len(token) > 1 and token not in stopwords
                    ])
                else:
                    for i in range(len(chunk)):
                        for j in range(2, 4):
                            if i + j <= len(chunk):
                                chinese_keywords.append(chunk[i:i+j])
            
            keywords = english_keywords + chinese_keywords
            
            # 扩展常见短语
            for phrase, expansions in CommonPhrases.PHRASES.items():
                if phrase in query_lower:
                    keywords.extend(expansions)
            
            # 去重
            seen = set()
            unique_keywords = []
            for kw in keywords:
                if kw and kw not in seen:
                    unique_keywords.append(kw)
                    seen.add(kw)
            
            return unique_keywords
        
        except Exception as e:
            logger.error(f"❌ 关键词提取失败: {e}")
            return []

    def _score_document(self, doc: Dict, keywords: List[str], intent: str) -> Dict[str, Any]:
        """为文档打分"""
        score = 0.0
        matched_sections = []
        
        # 标题匹配
        title = (doc.get("title") or "").lower()
        title_hits = 0
        for kw in keywords:
            if kw and kw.lower() in title:
                score += ScoringConfig.KEYWORD_IN_TITLE
                title_hits += 1
        
        # Level 匹配
        level = str(doc.get("level", "")).lower()
        if any(x in level for x in ["msc", "master", "postgraduate"]):
            score += ScoringConfig.LEVEL_BOOST
        
        # Section 匹配
        sections = doc.get("sections", [])
        if sections and isinstance(sections, list):
            intent_headings = {
                "modules": ["module", "curriculum", "syllabus", "compulsory", "optional"],
                "requirements": ["entry", "requirement", "admission", "qualification"],
                "fees": ["fee", "tuition", "cost", "scholarship"],
                "career": ["career", "employment", "prospect"],
                "services": ["service", "support", "counseling"],
            }.get(intent, [])
            
            for section in sections[:30]:
                if not isinstance(section, dict):
                    continue
                
                heading = (section.get("heading") or "").lower()
                text = (section.get("text") or "").lower()
                
                sec_score = 0.0
                
                if any(h in heading for h in intent_headings):
                    sec_score += ScoringConfig.INTENT_HEADING_MATCH
                
                matches = 0
                for kw in keywords[:20]:
                    if kw and (kw.lower() in heading or kw.lower() in text):
                        matches += 1
                
                sec_score += min(matches * ScoringConfig.KEYWORD_IN_HEADING, ScoringConfig.MAX_KEYWORD_TEXT_SCORE)
                
                if sec_score > 0:
                    matched_sections.append({
                        "heading": section.get("heading", ""),
                        "text": section.get("text", "")[:500],
                        "score": sec_score
                    })
                    score += sec_score
        
        matched_sections.sort(key=lambda x: x["score"], reverse=True)
        
        return {
            "score": score,
            "title_hits": title_hits,
            "matched_sections": matched_sections[:5]
        }

    def _build_domain_vocab(self) -> set:
        """构建领域词汇表"""
        try:
            repo_root = Path(__file__).resolve().parents[1]
            data_paths = [
                repo_root / "public" / "data" / "ucl_programs.json",
                repo_root / "public" / "data" / "ucl_services.json",
            ]
            
            words = []
            for path in data_paths:
                if not path.exists():
                    continue
                try:
                    with path.open("r", encoding="utf-8") as fh:
                        data = json.load(fh)
                        if not data or not isinstance(data, list):
                            continue
                        for item in data:
                            if not item or not isinstance(item, dict):
                                continue
                            title = item.get("title", "")
                            if title and isinstance(title, str):
                                tokens = re.findall(r"\b\w+\b|[\u4e00-\u9fff]+", title.lower())
                                words.extend(tokens)
                except Exception as e:
                    logger.debug(f"读取文件失败: {e}")
            
            counter = Counter(words)
            vocab = {token for token, freq in counter.items() if freq > 1 and len(token) > 2}
            
            logger.info(f"📚 领域词汇表构建完成: {len(vocab)} 个词")
            return vocab
        
        except Exception as e:
            logger.warning(f"⚠️ 领域词汇表构建失败: {e}")
            return set()


# ============================================================================
# 工厂函数
# ============================================================================
def create_retriever(enable_semantic: bool = True, preload_documents: Optional[List[Dict]] = None) -> EnhancedRetriever:
    """创建检索器实例"""
    return EnhancedRetriever(enable_semantic=enable_semantic, preload_documents=preload_documents)