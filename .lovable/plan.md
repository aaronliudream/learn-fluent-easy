## 目标

在「高考阅读 · 单篇精读」页 (`GaokaoReadingArticle.tsx`) 落地完整闭环：

```text
做完题
  → 每题显示「20XX 全国卷｜考点：XXX」
  → 不懂点「问小月」(右下角已存在 → 注入快照即可)
  → 学生若仍未理解，点「我还是不懂，给我练 3 题」
    → AI 针对该考点 + 学生错项生成 3 道小题
    → 全对 → 标记掌握 ✅
    → 还错 → 弹「再来 3 题？」(最多 3 轮 = 9 题)
    → 3 轮后仍未掌握
       → 错题入 gaokao_user_mistakes
       → 该 knowledge_point 在 gaokao_user_mastery 上掉档(FSRS lapse)
       → 学生中心「待巩固」区域出现
```

跑通后再复制到完形/词汇/语法/小学等页面。

---

## 一、数据层

### 1. 给现有题目打"年份+考点"标签（一次性离线）

**新表** `question_exam_tags`（统一标签表，覆盖所有题型）：
- `question_id uuid`
- `module text` — `gaokao_reading_article` / `gaokao_reading_passage` / `cloze` / ...
- `exam_year smallint` — 例 2023
- `exam_source text` — 例 "全国甲卷"、"新高考Ⅰ卷"、"AI 仿真题"
- `knowledge_point_id uuid` → `gaokao_reading_knowledge_points.id`（可空）
- `knowledge_point_label text` — 冗余便于直接渲染
- `confidence real` — AI 置信度
- 唯一键 `(module, question_id)`

**新 Edge Function** `tag-questions-batch`：
- 入参 `{ module, limit }`，分批拉未打标的题目
- 调用 Lovable AI Gateway (`google/gemini-3-flash-preview`)，结构化输出 (Output.object)
- prompt 输入：题干 + 选项 + 正确答案 + 解析 + 已有 knowledge_points 列表
- 输出：`{ exam_year, exam_source, knowledge_point_id | new_label, confidence }`
- 写入 `question_exam_tags`
- 一次性人工触发（管理后台或 curl），跑完即止

### 2. AI 生成的强化练习

**新表** `ai_practice_sets`：
- `user_id`, `source_question_id`, `module`, `knowledge_point_id`
- `round smallint`（1/2/3）
- `questions jsonb` — 3 道生成题：`[{stem, options, correct, explanation, focus_trap}]`
- `result jsonb` — 学生作答 + 对错
- `passed boolean`（3 题全对）

**新 Edge Function** `generate-practice-questions`：
- 入参 `{ source_question_id, knowledge_point_id, user_wrong_option, round }`
- AI 生成 3 道难度逐轮递增的同考点题 + 解析
- 第 2/3 轮把上一轮的错项作为干扰素材

### 3. 复用 FSRS-lite

掌握度走 `gaokao_user_mastery`（已存在 stability/difficulty/lapses/due_at 字段，和 `src/lib/masteryFsrs.ts` 对齐）：
- `item_type = 'knowledge_point'`，`item_id = knowledge_point_id`
- 学生 3 轮全错 → 调用 `applyFsrsGrade('again')` → lapses+1, stability 降低, due_at 提前到明天
- 中间任意一轮通过 → `applyFsrsGrade('good')`

---

## 二、UI / 页面改动（仅 `GaokaoReadingArticle.tsx` + 新组件）

### A. 答题复盘卡（已有）增强

每题标题旁加一个小徽章：

```text
[2023 全国乙卷] · [推理判断 · 长难句指代]   [问小月] [我还是不懂 →练3题]
```

数据来自 `question_exam_tags` join `gaokao_reading_knowledge_points`。

### B. 「问小月」按钮

复用现有 `AIAssistantContext` —— 点击时调 `assistant.open()` 并 `prefill({ question, snapshot })`，把这一题完整快照（题干、四选项、解析、学生答案、年份、考点）注入。**不新建对话面板**，沿用右下角小月。

### C. 「练 3 题」组件 `PracticeBooster.tsx`（新建）

一个内嵌折叠面板，状态机：

```text
idle → loading(调 generate-practice-questions) → answering
  → 全对: passed ✅（保存 mastery good，结束）
  → 有错:
      round<3 → 显示「再来 3 题？」按钮 → loading...
      round=3 → fail（写 mistake，mastery again，提示明天复习）
```

每道生成题回答完即时显示对错+解析。

### D. 学生中心 `/me` 加一个区块「待巩固考点」

读 `gaokao_user_mastery` 中 `item_type='knowledge_point'` 且 `mastery_level < 3` 或 `due_at <= now()` 的记录，按 `lapses desc` 排序，每条显示：

```text
推理判断 · 长难句指代  · 错过 3 次 · 明天复习
[去练习]  [查错题]
```

---

## 三、技术细节

### Edge Functions（共 2 个新建）

1. `supabase/functions/tag-questions-batch/index.ts` — 一次性打标（管理触发）
2. `supabase/functions/generate-practice-questions/index.ts` — 实时生成 3 题

两者都通过 Lovable AI Gateway 走 `@ai-sdk/openai-compatible` + `Output.object`，模型 `google/gemini-3-flash-preview`。沿用 `_shared/ai-gateway.ts`（如不存在则新建）。

### 前端文件

- 新建 `src/components/exam/PracticeBooster.tsx`
- 新建 `src/components/exam/QuestionExamBadge.tsx`
- 新建 `src/lib/knowledgePointMastery.ts` —— 封装"3轮规则 + FSRS 调用 + 错题写入"
- 修改 `src/pages/GaokaoReadingArticle.tsx` —— 在 review 阶段每题接 Badge + Booster
- 修改学生中心页（找当前 `Profile`/`Me` 页，加「待巩固考点」区块）

### 数据库迁移

一份 migration 建 `question_exam_tags` 和 `ai_practice_sets` + RLS（用户只读自己的 practice_sets，tags 公开 select）。

---

## 四、不做什么（明确范围）

- ❌ 完形 / 词汇 / 语法 / 小学 —— 这一轮先不接，待阅读跑通验证
- ❌ 改 `AIAssistantContext` —— 复用现有右下角小月，只通过 prefill 注入题目快照
- ❌ 流式输出 —— 一次性返回 3 题 JSON，简单稳定
- ❌ 新色板 —— 沿用试卷主题 token

---

## 五、验收

1. 任选 3 篇阅读文章，每题显示年份+考点徽章
2. 答错一题 → 点「问小月」→ 小月知道这道题在问什么
3. 仍不懂 → 点「练 3 题」→ AI 生成针对该考点的 3 题
4. 故意全错 3 轮 → 错题本能查到 + 学生中心「待巩固考点」出现该项 + due_at 是明天
5. 中间任意一轮全对 → 立即收尾，"已掌握 ✅"，mastery_level 提升

实施顺序：迁移 → 标签 Edge Function + 跑一次 → 生成题 Edge Function → PracticeBooster + Badge → 学生中心区块。
