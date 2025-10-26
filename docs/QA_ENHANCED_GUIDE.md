# 增强版 QA 系统使用指南

## 📋 概览

增强版 QA 系统实现了以下功能：
1. **意图识别**：自动识别用户查询意图（入学要求、简历指导、预约、心理支持等）
2. **查询改写**：生成 3-6 个同义词和扩展查询
3. **语义重排**：基于意图和规则对结果重新打分排序
4. **受控生成**：只使用高质量候选生成答案，并提供引用
5. **规则自愈**：分析结果并建议同义词和降权规则

## 🚀 快速开始

### 命令行使用

```bash
# 交互式运行
python scripts/qa_enhanced.py

# API 模式（返回 JSON）
python scripts/qa_api.py "计算机专业入学要求是什么"

# 批量测试
python scripts/test_qa_enhanced.py

# 对比测试（原版 vs 增强版）
python scripts/compare_qa_systems.py
```

### Python 模块调用

```python
from scripts.qa_enhanced import answer_enhanced

# 基本调用
result = answer_enhanced("计算机专业入学要求是什么", top_k=10)

# 返回结果结构
{
  "intent": "admission_requirements",
  "rewritten_queries": ["...", "..."],
  "reranked": [
    {
      "title": "Computer Science MSc",
      "type": "program",
      "url": "https://...",
      "score": 5.57,
      "why": "专业页面包含入学要求",
      "snippet": "..."
    }
  ],
  "answer": "根据查询结果，以下课程/页面包含相关入学要求信息：...",
  "citations": [
    {"title": "...", "url": "...", "type": "program"}
  ],
  "rules_patch": {
    "synonyms_add": [...],
    "demote_rules": [...]
  }
}
```

## 🎯 意图类型

系统支持以下意图：

| 意图 | 触发关键词 | 加权规则 |
|------|----------|---------|
| `admission_requirements` | 入学、申请、要求、成绩、GPA | program +0.4, service -0.2 |
| `careers_resume` | 简历、CV、求职、就业 | service +0.4 |
| `booking` | 预约、预定、appointment | service +0.4 |
| `wellbeing_support` | 心理、咨询、健康、wellbeing | - |
| `other` | 其他 | - |

## ⚙️ 重排规则

### 基础规则
- TF-IDF 得分 × 50 作为基础分数
- 标题包含关键词（entry requirements, admission, grades）：+0.15
- 查询词匹配度：每个匹配词 +0.1

### 意图相关规则
- `admission_requirements` + `program` 类型：+0.4
- `admission_requirements` + `service` 类型：-0.2
- `careers_resume` / `booking` + `service` 类型：+0.4

### 降权规则
- 标题/URL 包含 "verification"/"证明"/"认证" 且意图为 `admission_requirements`：-0.3

## 🔌 前端集成

### React 示例

```javascript
// src/services/qaService.js
export async function queryQA(question) {
  const response = await fetch('/api/qa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: question, top_k: 10 })
  });
  return await response.json();
}

// 使用示例
import { queryQA } from './services/qaService';

function AIChat() {
  const [answer, setAnswer] = useState(null);
  
  const handleSubmit = async (question) => {
    const result = await queryQA(question);
    setAnswer(result);
  };
  
  return (
    <div>
      <input onSubmit={handleSubmit} />
      {answer && (
        <div>
          <p><strong>意图:</strong> {answer.intent}</p>
          <p>{answer.answer}</p>
          <ul>
            {answer.citations.map((cite, i) => (
              <li key={i}>
                <a href={cite.url}>{cite.title}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

### 后端 API（Flask 示例）

```python
# backend/routes/qa.py
from flask import Blueprint, request, jsonify
from scripts.qa_enhanced import answer_enhanced

qa_bp = Blueprint('qa', __name__)

@qa_bp.route('/api/qa', methods=['POST'])
def query_qa():
    data = request.get_json()
    question = data.get('query', '')
    top_k = data.get('top_k', 10)
    
    if not question:
        return jsonify({'error': 'Missing query'}), 400
    
    result = answer_enhanced(question, top_k=top_k)
    return jsonify(result)

# 在 app.py 中注册
from backend.routes.qa import qa_bp
app.register_blueprint(qa_bp)
```

## 📊 测试结果

最新测试（5个问题）：
- ✅ 成功率: **100%** (5/5)
- ✅ 意图识别准确率: **100%**
- ✅ 平均引用数: **5**
- ✅ 平均得分: **7.54** (vs 原版 0.1-0.3)

对比原版改进：
1. 得分更高更有区分度（5-13 分 vs 0.05-0.3）
2. 意图驱动的类型过滤（program/service 加权）
3. 查询改写提升召回率（6个子查询 vs 1个）
4. 降权不相关结果（如 verification 页面）
5. 提供规则优化建议

## 🛠️ 自定义配置

### 添加新意图

编辑 `scripts/qa_enhanced.py`:

```python
INTENT_PATTERNS = {
    # ... 现有意图
    'student_life': [
        r'宿舍|住宿|食堂|校园|活动',
        r'accommodation|dormitory|campus|activity|event'
    ]
}
```

### 调整重排规则

在 `rerank_candidates()` 函数中添加规则：

```python
# 新规则：提升特定类型内容
if intent == 'student_life' and 'accommodation' in title:
    adjusted_score += 0.5
```

### 扩展查询词典

编辑 `QUERY_EXPANSION`:

```python
QUERY_EXPANSION = {
    # ... 现有映射
    '宿舍': ['accommodation', 'dormitory', 'housing', 'residence']
}
```

## 📁 文件说明

- `scripts/qa_enhanced.py` - 增强版 QA 核心实现
- `scripts/qa_api.py` - JSON API 接口
- `scripts/test_qa_enhanced.py` - 批量测试脚本
- `scripts/compare_qa_systems.py` - 对比测试脚本
- `data/qa_enhanced_log.jsonl` - 查询日志（JSONL 格式）

## 🔍 调试技巧

### 查看日志

```bash
# 查看最近 10 条查询
tail -n 10 data/qa_enhanced_log.jsonl | jq .

# 统计意图分布
jq -r '.intent' data/qa_enhanced_log.jsonl | sort | uniq -c
```

### 调整阈值

```python
# 降低最小得分阈值（在 rerank_candidates 后）
top_candidates = [c for c in reranked if c['score'] > 0.5]  # 默认 1.0
```

### 启用详细输出

```python
result = answer_enhanced(query, top_k=10, return_full=True)
# return_full=True 会包含所有中间步骤的详细信息
```

## 📈 性能优化建议

1. **缓存索引**：第一次加载后缓存 vectorizer 和 tfidf_matrix
2. **异步处理**：前端使用 WebSocket 实时返回结果
3. **结果缓存**：对常见问题缓存结果（Redis）
4. **批量查询**：支持一次处理多个问题

## 🤝 贡献

欢迎提交改进建议和规则优化！

1. Fork 项目
2. 创建特性分支
3. 提交改动
4. 发起 Pull Request

---

**维护者**: UCL Student App Team  
**最后更新**: 2025-10-25
