# Reading Center — 架构方案 (ARCHITECTURE)

> 表结构 / 路由 / 组件方案。决策依据见 `DECISIONS.md`,复用依据见 `INVENTORY.md`。
> 🟡 = 提案待确认;DDL 未跑,落库前须过 web Claude 审 + Aaron 跑 SQL(存 `SQLAA/`)。

---

## 1. 数据层 DDL(🟡 提案,未执行)

### 1.1 `reading_library`(阅读原文,同构 junior_reading 的瘦 JSON)
```sql
CREATE TABLE public.reading_library (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type  text NOT NULL CHECK (content_type IN ('graded_reader','book_chapter','exam_passage')),
  grade_band    text NOT NULL CHECK (grade_band IN ('primary','junior','senior','general')),
  level         text,                         -- 分级标签(A/B/C 或词数档);标准待 Aaron 定(§7 Q1)
  title         text NOT NULL,
  body          text NOT NULL,                -- 原文
  word_count    int,
  difficulty    smallint NOT NULL DEFAULT 2,  -- 1..4
  topic         text,
  questions     jsonb NOT NULL DEFAULT '[]',  -- [{ q, options[], answer:"A".., explanation? }] —— 同构 junior_reading
  vocab_notes   jsonb NOT NULL DEFAULT '[]',  -- [{ word, cn }] —— 同构 junior_reading
  is_published  boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_reading_library_band_type ON public.reading_library (grade_band, content_type);
ALTER TABLE public.reading_library ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone read reading_library" ON public.reading_library FOR SELECT USING (true);
-- 写入仅 service role(灌库脚本);无 client 写策略。
```
**要点**:`questions`/`vocab_notes` 与 `junior_reading` **完全同构**(键 `q`/`options`/`answer`/`explanation`;`word`/`cn`)——好处是 `JuniorReadingPlay.tsx` 的渲染/评分逻辑几乎零改就能接。T/F 用 `options:["True","False"]` 建模,不加 `type`。

### 1.2 `reading_attempts` / `reading_completions`(🟡 可后置,见 D5)
照 `junior_reading_attempts`(补 `duration_ms` 落值,修 R5)/`junior_reading_completions`(补 FK,修 R4)克隆,FK→`reading_library`。样板最小闭环可不建。

### 1.3 复用(不新建)
- 错题:`user_mistakes`(经 `record-attempt` edge function)。
- 掌握度:`mastery_progress`(客户端 `recordMastery`)。

---

## 2. 落库链路(复用现成,零 edge 改动)

```
ReadingPlay 答题
 ├─ 每题 pick():
 │    ├─ recordUnifiedAttempt({ stage, module:"reading",
 │    │     item_type:"reading_question",
 │    │     item_id:`reading_center:${passageId}:${qIdx}`,
 │    │     item_label:<篇名>, is_correct, user_answer, correct_answer,
 │    │     context:{ question, explanation } })
 │    │        └─→ record-attempt edge fn → user_mistakes(module:"reading") 答错upsert/答对resolve
 │    │                                   → unified_mastery
 │    └─ (可选) insert reading_attempts        // D5 后置
 └─ 提交 handleSubmit():
      ├─ recordMastery({ module:"reading_center", itemId:passageId, pct })  → mastery_progress
      └─ (可选) upsert reading_completions      // D5 后置
```
教师端 `get_class_weakness` 按 `module`+`source_label` 分组 → 阅读错题**自动归集**(前提:`item_label` 给篇名)。

---

## 3. 路由(🟡,§7 Q4 待定最终形态)
- `/reading` —— 一级入口列表页(暂定;不动 junior 现有路由)。
- `/reading/:id` —— 单篇播放页。
- 均包 `<ChineseOnlyRoute>`,注册在 `src/App.tsx`(仓库单一中央路由)。

---

## 4. 组件方案(跟随 pages/lib/components 约定)

| 层 | 文件(🟡 提案) | 复用 |
|---|---|---|
| 列表页 | `src/pages/Reading.tsx` | 仿 `JuniorReading.tsx` 去 junior 耦合 |
| 播放页 | `src/pages/ReadingPlay.tsx` | 仿 `JuniorReadingPlay.tsx`,数据源/模块键/路由参数化 |
| 共享面板 | `src/components/reading/ReadingPassagePanel.tsx` | 抽"原文+词汇+题两栏块"(junior/gaokao 现各自复制) |
| 原语 | 直接 import `src/components/exam/ExamPaper.tsx` | ✅ 零改 |
| 数据源 | `src/lib/reading/source.ts` | 查 `reading_library`;抽象成可切内容源 |
| 掌握度包装 | `src/lib/reading/mastery.ts` | 薄封装 `recordMastery`/`loadMastery` |

**参数化清单**(把 `JuniorReadingPlay.tsx` 的写死项抽成 props/config):数据源(表/查询)、`masteryModule`、`mistakeModule`+`stage`、路由前缀/返回链接、grade 模型、品牌文案。

---

## 5. 分阶段落地(样板先停)
- **P0 样板(本轮唯一目标)**:`reading_library` + 复用 user_mistakes/mastery_progress;`/reading` + `/reading/:id`;1 篇初中分级读物 + 4 题;打通错题写入 + 错题本可见;tsc/build/test 绿;内容回 Aaron 审。
- **P1**(样板验收后):attempts/completions 表、共享面板抽取、看板 module 字面量扩展(R6)、删僵尸副本。
- **P2**:绘本/整本书章节展示层、AI 出题/解析、分级标准落地。
