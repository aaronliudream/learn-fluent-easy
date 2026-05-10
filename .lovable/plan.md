# Big Moon English → AI 能力诊断系统升级方案

你的判断完全正确：网站的真正壁垒不是题库，而是**学生能力建模 (Student Modeling)**。下面是分阶段、可落地的工程方案。核心思想：**先打通数据底座（视图化 + 知识点标签），再让 Dashboard 和"强化练习"自动消费这套底座。**

---

## 阶段 1：统一数据底座（视图化方案 B）

### 1.1 把 `unified_mastery` 改造为视图

将现有 13+ 张源表（`primary_word_mastery` / `primary_reading_progress` / `primary_lesson_progress` / `primary_speaking_attempts` / `junior_word_mastery` / `junior_listening_attempts` / `user_grammar_mastery` / `gaokao_user_mastery` / `gaokao_user_attempts` / `mastery_progress` / `card_attempts` / `slang_mastery` …）通过 `UNION ALL` 合并为一个**实时视图**，统一字段：

```text
user_id | stage | grade | module | item_type | item_id
       | attempts | correct_count | accuracy
       | last_attempt_at | last_correct_at
       | knowledge_tag | subskill | difficulty
```

好处：
- 任何源表写入 → Dashboard 立即可见，**零同步成本**
- 旧 `unified_mastery` 表里 24 行历史数据先备份再 DROP
- 现有写入路径（`record-attempt` Edge Function 等）不变，但**只写源表**，不再写 unified_mastery

### 1.2 mastery 状态规则（写在视图里，全站统一）

| 状态 | 规则 |
|---|---|
| **master** | attempts ≥ 5 且 accuracy ≥ 90% |
| **fluent** | attempts ≥ 3 且 accuracy 70–90% |
| **weak** | accuracy < 70% **或** 最近一次答错 |
| **none** | attempts = 0（通过题库 LEFT JOIN 得到） |

---

## 阶段 2：知识点标签体系（真正的护城河）

### 2.1 新建 `question_tags` 表

把所有题目（语法点、阅读题、词汇、听力片段、完形…）打上多维标签：

```text
question_id | stage | grade | module
            | skill         -- grammar / reading / vocab / listening / writing / cloze
            | subskill      -- subjunctive / inference / phrasal_verb / numbers ...
            | difficulty    -- 1–5
            | knowledge_point -- 自由文本，用于面向学生的展示
```

### 2.2 子技能字典（首批最小集）

- **grammar**: subjunctive, relative_clause, tense, non_finite, inversion, conditionals
- **reading**: main_idea, inference, detail, vocab_in_context, long_sentence, attitude
- **vocab**: high_freq, academic, phrasal_verb, collocation, confusable
- **listening**: numbers, liaison, scene_words, gist, detail
- **writing**: grammar_error, sentence_variety, cohesion, task_response
- **cloze**: logic, collocation, contrast, cohesion

### 2.3 回填策略

- 高考 / 初中语法已有的 grammar_point 字段直接映射
- 阅读、完形、听力先跑一次 **AI 批量打标**（gemini-2.5-flash，便宜快），把结果写入 `question_tags`
- 新生成的题目（generate-lesson / generate-grammar-content 等 Edge Function）从源头就写入 tags

---

## 阶段 3：能力雷达视图

新建两个上层视图，**Dashboard 直接消费**：

### 3.1 `mastery_by_skill`（雷达图数据）

按 `user_id × skill` 聚合 → 每个用户在 grammar / reading / vocab / listening / writing / cloze 上的整体掌握百分比。

### 3.2 `mastery_by_subskill`（弱点诊断）

按 `user_id × skill × subskill` 聚合 → 输出每个子技能的 accuracy + state，**按 weak 优先排序**，前端 `LIMIT 5` 即得"今日待突破"。

### 3.3 `coverage_gaps`（哪些还没做）

`question_tags LEFT JOIN unified_mastery` → 列出 attempts=0 的题目数，按 subskill 分组，得到"阅读推理 还有 12 题没做"。

---

## 阶段 4：Dashboard 改版

```text
┌────────────────────────────────────┐
│  AI 能力雷达图（6 轴）             │
│  Grammar 82  Reading 61  …         │
└────────────────────────────────────┘

┌─ 今日待突破（来自 mastery_by_subskill, weak top 3）─┐
│ • 阅读推理     45%   [开始训练]                     │
│ • 长难句       52%   [开始训练]                     │
│ • 虚拟语气     58%   [开始训练]                     │
└─────────────────────────────────────────────────────┘

┌─ 还没做（来自 coverage_gaps）─┐
│ • 完形填空 12 篇未做           │
│ • 听力数字题 8 段未做          │
└────────────────────────────────┘

点 Grammar → 子技能下钻表
  虚拟语气  weak    [练]
  定语从句  fluent  [复习]
  时态     master  ✓
```

技术：雷达图用 `recharts` 的 `RadarChart`（已在依赖里）。

---

## 阶段 5：智能抽题（"针对性测试"）

新增 Edge Function `next-recommended-questions`：

```text
输入: user_id, skill (可选), limit=10
逻辑:
  1. 优先取 weak 子技能的题目（占 60%）
  2. 其次取 none（从未做过）的题目（占 30%）
  3. 最后取 fluent 但超过 7 天未复习的（占 10%）
  4. 同一子技能不超过 3 题，避免疲劳
返回: 题目列表 + 推荐理由（"因为你在虚拟语气上较弱"）
```

所有"强化练习 / 智能复习"按钮都走这个函数，**取代现有随机抽题**。

---

## 阶段 6：AI 学习路径（后续迭代）

基于 `mastery_by_subskill`，让 `tutor-chat` Edge Function 在系统 prompt 里注入学生当前最弱的 3 个子技能，输出个性化建议：

> 因为你：虚拟语气差、长难句差
> 请先完成：1. 从句专项 2. 虚拟语气专项 3. 长难句拆解

---

## 落地顺序（建议一步一步走，不要一次全做）

1. **本轮先做**：阶段 1（视图化 unified_mastery）+ 阶段 3.1（mastery_by_skill 视图）+ 阶段 4 中的雷达图
   - 这一步立即让 Dashboard 显示真实数据，所有现有 1200+ 行历史记录"一夜复活"
2. **下一轮**：阶段 2（question_tags 表 + 首批 AI 打标）+ 阶段 3.2/3.3
3. **再下一轮**：阶段 5 智能抽题 + 阶段 4 子技能下钻
4. **最后**：阶段 6 AI 学习路径

---

## 需要你确认的 3 件事

1. **mastery 阈值**：master = 5 次 & 90%、fluent = 3 次 & 70%、weak < 70%——这个数字 OK 吗？还是要更严（比如 master 要 95%）？
2. **本轮范围**：是先只做"阶段 1 + 雷达图"（约 1 个工作单元，立竿见影），还是连阶段 2 知识点打标也一起做（约 3 个工作单元，需要跑 AI 批量任务）？
3. **knowledge_tag 字典**：上面列的子技能字典够用吗？还是你想加 / 删某些（比如要不要加"音标 phonics"维度给小学）？

确认后我就开始写迁移 SQL 和前端组件。
