"""增强版检索器 - 修复空值错误版本

主要修复:
1. 所有空值检查和容错处理
2. 防止 NoneType 迭代错误
3. 完善的异常处理
"""

from __future__ import annotations

import json
import logging
import math
import re
from collections import Counter
from difflib import SequenceMatcher
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)

# ============================================================================
# 依赖检查
# ============================================================================
try:
    from sentence_transformers import SentenceTransformer, util  # type: ignore
    import torch  # type: ignore

    HAVE_SEMANTIC = True
    logger.info("✅ sentence-transformers loaded for semantic search")
except Exception:
    HAVE_SEMANTIC = False
    logger.warning("⚠️ sentence-transformers not available, semantic search disabled")

try:
    import jieba  # type: ignore

    HAVE_JIEBA = True
    logger.info("✅ jieba loaded for Chinese tokenization")
except Exception:
    HAVE_JIEBA = False
    logger.warning("⚠️ jieba not available, fallback to regex for Chinese")


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
# 主类
# ============================================================================

class EnhancedRetriever:
    """增强版检索器 - 完全修复空值处理"""

    def __init__(self, enable_semantic: bool = True, cache_embeddings: bool = True) -> None:
        self.enable_semantic = enable_semantic and HAVE_SEMANTIC
        self.cache_embeddings = cache_embeddings

        # 🔥 确保所有关键词列表都不为 None
        self.intent_keywords: Dict[str, List[str]] = {
            "modules": ["module", "course", "subject", "curriculum", "syllabus", "teaching", "learn", "课程", "模块"],
            "requirements": ["requirement", "prerequisite", "entry", "admission", "qualification", "ielts", "toefl", "要求", "申请"],
            "career": ["career", "job", "employment", "graduate", "prospect", "就业", "职业"],
            "fees": ["fee", "tuition", "cost", "funding", "scholarship", "学费", "费用"],
        }

        self.intent_headings: Dict[str, List[str]] = {
            "modules": [
                "module", "curriculum", "syllabus", "teaching", "what you will learn",
                "course structure", "compulsory", "optional", "placement", "supervisor"
            ],
            "requirements": ["entry", "requirement", "admission", "english", "qualification", "ielts", "toefl", "language"],
            "career": ["career", "employment", "graduate", "prospects", "outcomes"],
            "fees": ["fee", "tuition", "cost", "funding", "scholarship"],
        }

        self.custom_synonyms: Dict[str, List[str]] = {
            "data science": ["data science", "数据科学", "analytics", "data"],
            "computer science": ["computer science", "computing", "computer"],
            "business analytics": ["business analytics", "商业分析"],
            "management": ["management", "管理", "business"],
        }

        self.domain_vocab = self._build_domain_vocab()
        self.semantic_model: Optional[Any] = None
        self._section_embeddings_cache: Dict[int, Dict[int, Any]] = {}

        if self.enable_semantic:
            self._load_semantic_model()

    def detect_intent(self, query: str) -> str:
        """🔥 检测查询意图 - 完全防护版本"""
        if not query:
            return "general"
        
        try:
            query_lower = query.lower()
        except (AttributeError, TypeError):
            return "general"
        
        for intent, keywords in self.intent_keywords.items():
            # 🔥 多重空值检查
            if not keywords:
                continue
            try:
                # 确保 keywords 是可迭代的且每个 kw 都是字符串
                for kw in keywords:
                    if kw and isinstance(kw, str) and kw in query_lower:
                        return intent
            except (TypeError, AttributeError):
                continue
        
        return "general"

    def _detect_intent(self, query: str, keywords: List[str]) -> str:
        """🔥 检测查询意图（带关键词列表）- 完全防护版本"""
        if not query:
            return "general"
        
        try:
            query_lower = query.lower()
        except (AttributeError, TypeError):
            return "general"
        
        # 🔥 确保 keywords 不为 None
        if keywords is None:
            keywords = []
        
        # 意图匹配规则
        intent_patterns = {
            "modules": [
                "module", "course", "curriculum", "subject", "teaching",
                "模块", "课程", "科目", "教学"
            ],
            "requirements": [
                "requirement", "entry", "admission", "prerequisite", "qualify",
                "要求", "入学", "条件", "资格", "申请"
            ],
            "fees": [
                "fee", "tuition", "cost", "price", "funding", "scholarship",
                "学费", "费用", "价格", "奖学金", "资助"
            ],
            "career": [
                "career", "job", "employment", "graduate", "outcome",
                "职业", "就业", "工作", "前景", "发展"
            ],
            "services": [
                "service", "support", "help", "counseling", "wellbeing",
                "服务", "支持", "帮助", "咨询", "辅导"
            ]
        }
        
        # 检测意图
        for intent, patterns in intent_patterns.items():
            if not patterns:
                continue
            try:
                for pattern in patterns:
                    if not pattern or not isinstance(pattern, str):
                        continue
                    # 检查查询中是否包含模式
                    if pattern in query_lower:
                        return intent
                    # 检查关键词列表
                    if keywords:
                        for kw in keywords:
                            if kw and isinstance(kw, str) and pattern in kw:
                                return intent
            except (TypeError, AttributeError):
                continue
        
        return "general"

    def search_with_context(self, query: str, documents: List[dict], top_k: int = 8) -> List[Dict]:
        """🔥 修复后的主检索方法 - 完全防护版本"""
        
        # 🔥 空值检查
        if not query:
            logger.warning("⚠️  Empty query")
            return []
        
        if not documents:
            logger.warning("⚠️  Empty documents")
            return []

        try:
            # 🔥 提取关键词时添加空值检查
            keywords = self._extract_smart_keywords(query)
            if not keywords:
                logger.warning("⚠️  No keywords extracted, using simple split")
                keywords = [w for w in query.lower().split() if len(w) > 2]
        except Exception as e:
            logger.error(f"❌ Keyword extraction failed: {e}")
            keywords = [w for w in query.lower().split() if len(w) > 2]

        # 检测意图
        try:
            intent = self._detect_intent(query, keywords)
        except Exception as e:
            logger.error(f"❌ Intent detection failed: {e}")
            intent = "general"
        
        query_lower = query.lower()

        logger.info(f"🔍 [检索] 查询: {query[:100]}")
        logger.info(f"🎯 [检索] 意图: {intent}")
        logger.info(f"🔑 [检索] 关键词: {keywords[:10]}")

        # 预计算 embeddings
        query_embedding = None
        if self.enable_semantic:
            try:
                query_embedding = self._encode_query(query)
            except Exception as e:
                logger.warning(f"⚠️  Query encoding failed: {e}")

        if self.enable_semantic and self.cache_embeddings and not self._section_embeddings_cache:
            try:
                logger.info("🔄 [缓存] 预计算文档 embeddings...")
                self._precompute_embeddings(documents)
            except Exception as e:
                logger.warning(f"⚠️  Embedding precompute failed: {e}")

        results: List[Dict] = []

        for doc_idx, doc in enumerate(documents):
            try:
                # 🔥 添加空值检查
                title_raw = doc.get("title")
                if not title_raw or not isinstance(title_raw, str):
                    continue
                
                title_lower = title_raw.lower()

                # 标题评分
                title_score, title_hits = self._score_title_similarity(title_lower, keywords, query_lower)
                
                # 学位级别评分
                level_score = self._score_level(doc, query_lower)
                
                # 章节评分
                sections = doc.get("sections")
                if not sections or not isinstance(sections, list):
                    sections = []
                
                sections_score, matched_sections = self._score_sections(sections, keywords, intent)

                # 🔥 语义评分时添加空值检查
                semantic_score = 0.0
                if self.enable_semantic and query_embedding is not None:
                    try:
                        semantic_score = self._semantic_boost(doc_idx, sections, query_embedding)
                    except Exception as e:
                        logger.debug(f"⚠️  Semantic scoring failed for doc {doc_idx}: {e}")

                base_score = title_score + level_score + sections_score + semantic_score

                # 过滤低分结果
                if base_score <= 0 or (not matched_sections and title_score < 25):
                    continue

                results.append({
                    "doc": doc,
                    "score": base_score,
                    "title_score": title_score,
                    "sections_score": sections_score,
                    "semantic_score": semantic_score,
                    "level_score": level_score,
                    "matched_sections": matched_sections,
                    "title_matches": title_hits,
                    "intent": intent,
                })
            except Exception as e:
                logger.debug(f"⚠️  Error processing doc {doc_idx}: {e}")
                continue

        # 排序
        results.sort(key=lambda item: item["score"], reverse=True)

        logger.info(f"📊 [检索] 找到 {len(results)} 个相关文档，返回 top {top_k}")

        return results[:top_k]

    def _score_level(self, doc: dict, query_lower: str) -> float:
        """评分：学位级别匹配"""
        if not doc or not isinstance(doc, dict):
            return 0.0
        
        level = str(doc.get("level", "")).lower()
        if not level:
            return 0.0

        score = 0.0
        postgraduate_markers = ("postgraduate", "msc", "master", "mres", "ma", "phd")
        undergraduate_markers = ("undergraduate", "ba", "bsc")

        try:
            if any(marker in query_lower for marker in ("msc", "master", "postgraduate", "graduate", "硕士", "研究生")):
                if any(marker in level for marker in postgraduate_markers):
                    score += ScoringConfig.LEVEL_BOOST
                if any(marker in level for marker in undergraduate_markers):
                    score += ScoringConfig.LEVEL_PENALTY

            if any(marker in query_lower for marker in ("bsc", "ba", "undergraduate", "bachelor", "本科")):
                if any(marker in level for marker in undergraduate_markers):
                    score += ScoringConfig.LEVEL_BOOST
                if any(marker in level for marker in postgraduate_markers):
                    score += ScoringConfig.LEVEL_PENALTY
        except (TypeError, AttributeError):
            pass

        return score

    def _score_title_similarity(self, title_lower: str, keywords: List[str], query_lower: str) -> Tuple[float, List[str]]:
        """评分：标题相似度"""
        score = 0.0
        matches: List[str] = []

        if not title_lower or not isinstance(title_lower, str):
            return score, matches
        
        if not keywords:
            keywords = []

        try:
            main_title = title_lower.split("|")[0].strip()

            # 关键词匹配
            for kw in keywords:
                if not kw or not isinstance(kw, str) or len(kw) <= 2:
                    continue
                if kw in title_lower:
                    score += ScoringConfig.KEYWORD_IN_TITLE
                    if kw not in matches:
                        matches.append(kw)

            # 完全查询匹配
            normalized_query = re.sub(r"\s+", " ", query_lower.strip())
            if normalized_query and normalized_query in title_lower:
                score += ScoringConfig.EXACT_QUERY_MATCH

            # 同义词匹配
            for phrase, synonyms in self.custom_synonyms.items():
                if not synonyms:
                    continue
                if any(syn and syn in query_lower for syn in synonyms) and phrase in title_lower:
                    score += ScoringConfig.SYNONYM_MATCH
                    if phrase not in matches:
                        matches.append(phrase)

            # 模糊匹配
            ratio = SequenceMatcher(None, query_lower, title_lower).ratio()
            if ratio > 0.42:
                score += ratio * ScoringConfig.FUZZY_MATCH_MULTIPLIER

            # 学位标签匹配
            for tag in ("msc", "mres", "ma", "pgdip", "bsc", "ba", "phd"):
                if tag in query_lower and tag in title_lower:
                    score += ScoringConfig.DEGREE_TAG_MATCH
                    if tag not in matches:
                        matches.append(tag)

        except Exception as e:
            logger.debug(f"⚠️  Title scoring error: {e}")

        return score, matches

    def _score_sections(self, sections: List[dict], keywords: List[str], intent: str) -> Tuple[float, List[dict]]:
        """评分：章节内容"""
        
        # 🔥 添加空值检查
        if not sections or not isinstance(sections, list):
            return 0.0, []
        
        if not keywords:
            keywords = []
        
        score = 0.0
        relevant_sections: List[dict] = []
        target_headings = self.intent_headings.get(intent, [])

        for section in sections:
            if not section or not isinstance(section, dict):
                continue
            
            try:
                heading = section.get("heading") or ""
                text = section.get("text") or ""
                
                if not isinstance(heading, str):
                    heading = ""
                if not isinstance(text, str):
                    text = ""
                
                if not heading and not text:
                    continue

                heading_lower = heading.lower()
                text_lower = text.lower()
                section_score = 0.0
                reasons: List[str] = []

                # 意图相关标题匹配
                for th in target_headings:
                    if th and isinstance(th, str) and th in heading_lower:
                        section_score += ScoringConfig.INTENT_HEADING_MATCH
                        reasons.append(f"intent_heading:{th}")

                # 标题关键词匹配
                for kw in keywords:
                    if kw and isinstance(kw, str) and kw in heading_lower:
                        section_score += ScoringConfig.KEYWORD_IN_HEADING
                        reasons.append(f"heading_kw:{kw}")

                # 文本关键词匹配
                for kw in keywords:
                    if not kw or not isinstance(kw, str):
                        continue
                    occurrences = text_lower.count(kw)
                    if occurrences:
                        kw_score = min(
                            occurrences * ScoringConfig.KEYWORD_IN_TEXT_PER_OCCURRENCE,
                            ScoringConfig.MAX_KEYWORD_TEXT_SCORE
                        )
                        section_score += kw_score
                        reasons.append(f"text_kw:{kw}x{occurrences}")

                # 模块意图特殊处理
                if intent == "modules":
                    if "•" in text or "\n-" in text or text.count("\n") > 5:
                        section_score += ScoringConfig.LIST_STRUCTURE_BONUS
                        reasons.append("list_structure")
                    if re.search(r"\b[A-Z]{4}\d{4}\b", text):
                        section_score += ScoringConfig.COURSE_CODE_BONUS
                        reasons.append("course_code")

                # 长度归一化
                text_len = max(len(text), 1)
                normalization_factor = 1 + math.log10(text_len / ScoringConfig.SECTION_LENGTH_NORMALIZATION_BASE + 1)
                section_score /= normalization_factor

                if section_score > 0:
                    snippet = text.strip().replace("\u00a0", " ")[:1000]
                    relevant_sections.append({
                        "heading": heading,
                        "text": snippet,
                        "score": section_score,
                        "reasons": reasons,
                    })
                    score += section_score

            except Exception as e:
                logger.debug(f"⚠️  Section scoring error: {e}")
                continue

        relevant_sections.sort(key=lambda item: item["score"], reverse=True)
        return score, relevant_sections[:5]

    def _extract_smart_keywords(self, query: str) -> List[str]:
        """智能提取查询关键词"""
        if not query or not isinstance(query, str):
            return []
        
        stopwords = {
            "what", "how", "where", "when", "which", "who", "the", "a", "an",
            "is", "are", "was", "were", "do", "does", "did", "about", "for",
            "的", "是", "有", "在", "吗", "呢", "啊", "了",
        }

        try:
            query_lower = query.lower()

            # 提取英文单词
            english_words = re.findall(r"\b[a-z]+\b", query_lower)
            english_keywords = [word for word in english_words if word not in stopwords and len(word) > 2]

            # 提取中文关键词
            chinese_keywords: List[str] = []
            chinese_matches = re.findall(r"[\u4e00-\u9fff]+", query)
            for chunk in chinese_matches:
                if HAVE_JIEBA:
                    chinese_keywords.extend([
                        token for token in jieba.cut(chunk) 
                        if len(token) > 1 and token not in stopwords
                    ])
                else:
                    chinese_keywords.extend([
                        chunk[i : i + j] 
                        for i in range(len(chunk)) 
                        for j in range(2, 5) 
                        if i + j <= len(chunk)
                    ])

            keywords: List[str] = english_keywords + chinese_keywords

            # 扩展常见短语
            for phrase, expansions in CommonPhrases.PHRASES.items():
                if phrase in query_lower:
                    keywords.extend(expansions)

            # 去重
            expanded: List[str] = []
            seen = set()
            for kw in keywords:
                if not kw or not isinstance(kw, str) or kw in seen:
                    continue
                expanded.append(kw)
                seen.add(kw)

            # 过滤领域词汇
            domain_filtered = [kw for kw in expanded if len(kw) > 3 or kw in self.domain_vocab]

            return domain_filtered or expanded

        except Exception as e:
            logger.error(f"❌ Keyword extraction error: {e}")
            return []

    def _load_semantic_model(self) -> None:
        """加载语义模型"""
        if not HAVE_SEMANTIC:
            return

        try:
            self.semantic_model = SentenceTransformer("all-MiniLM-L6-v2")
            logger.info("✅ 语义模型加载成功")
        except Exception as exc:
            logger.warning(f"⚠️  语义模型加载失败: {exc}")
            self.enable_semantic = False

    def _precompute_embeddings(self, documents: List[dict]) -> None:
        """预计算文档 embeddings"""
        if not self.enable_semantic or self.semantic_model is None:
            return

        for doc_idx, doc in enumerate(documents):
            if not doc or not isinstance(doc, dict):
                continue
            
            if doc_idx in self._section_embeddings_cache:
                continue

            self._section_embeddings_cache[doc_idx] = {}
            sections = doc.get("sections", [])
            if not sections or not isinstance(sections, list):
                continue
            
            for sec_idx, section in enumerate(sections):
                if not section or not isinstance(section, dict):
                    continue
                text = section.get("text") or ""
                if text and isinstance(text, str) and len(text) > 50:
                    try:
                        emb = self.semantic_model.encode(text, convert_to_tensor=True)
                        self._section_embeddings_cache[doc_idx][sec_idx] = emb
                    except Exception as exc:
                        logger.debug(f"⚠️  计算 embedding 失败: {exc}")

    def _encode_query(self, query: str) -> Optional[Any]:
        """编码查询"""
        if not self.enable_semantic or self.semantic_model is None:
            return None

        try:
            return self.semantic_model.encode(query, convert_to_tensor=True)
        except Exception as exc:
            logger.warning(f"⚠️  查询编码失败: {exc}")
            return None

    def _semantic_boost(self, doc_idx: int, sections: List[dict], query_emb: Any) -> float:
        """语义相似度加成"""
        if not sections or query_emb is None:
            return 0.0

        best_sim = 0.0

        if doc_idx in self._section_embeddings_cache:
            for sec_idx, section_emb in self._section_embeddings_cache[doc_idx].items():
                try:
                    similarity = util.pytorch_cos_sim(query_emb, section_emb).item()
                    best_sim = max(best_sim, similarity)
                except Exception:
                    continue

        return best_sim * ScoringConfig.SEMANTIC_MULTIPLIER

    def _build_domain_vocab(self) -> set:
        """构建领域词汇表"""
        repo_root = Path(__file__).resolve().parents[1]
        data_paths = [
            repo_root / "public" / "data" / "ucl_programs.json",
            repo_root / "public" / "data" / "ucl_services.json",
        ]

        words: List[str] = []
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
                        if not title or not isinstance(title, str):
                            continue
                        tokens = re.findall(r"\b\w+\b|[\u4e00-\u9fff]+", title.lower())
                        words.extend(tokens)
            except Exception as exc:
                logger.warning(f"⚠️  读取数据文件失败: {exc}")
                continue

        counter = Counter(words)
        vocab = {token for token, freq in counter.items() if freq > 1 and len(token) > 2}

        logger.info(f"📚 Built domain vocab with {len(vocab)} words")
        return vocab


def create_retriever(enable_semantic: bool = True, cache_embeddings: bool = True) -> EnhancedRetriever:
    """工厂函数：创建检索器"""
    return EnhancedRetriever(enable_semantic=enable_semantic, cache_embeddings=cache_embeddings)