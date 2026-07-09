# Reading Center — 现有基建盘点 (INVENTORY)

> 目的:动代码前摸清可复用的东西。结论分三类标注:**✅ 可直接复用 / 🟡 需改造后复用 / 🆕 需新建**,并标出**风险点**。
> 盘点方法:5 路并行只读检索(数据层 / 展示层 / 绘本 / 错题系统 / 掌握度),全部带 `path:line` 出处。
> 盘点日期:2026-07-08。

---

## 0. 一句话结论

阅读的**核心链路已经存在且成熟**:junior 阅读 = 一张 `junior_reading` 内嵌 JSON 表 + `JuniorReadingPlay.tsx` 播放页 + 三处落库(原始日志 / 统一错题 / 掌握度)。展示原语(`ExamPaper.tsx`)已在 junior/gaokao 间共享,是最强复用点。**没有**独立的绘本/分级读物系统(只有一张废弃空表)。因此 Reading Center 的最小闭环几乎不用造新基建 —— 主要工作是把 junior 页面里**写死的耦合抽出来参数化**,并决定"扩展现有表 vs 新建 `reading_*` 表"。

---

## 1. 数据层

### ✅ `junior_reading`(阅读原文表,可复用/可扩展)
定义:`supabase/migrations/20260503023113_466fe8f6-....sql:105-119`

| 列 | 类型 | 说明 |
|---|---|---|
| `id` | uuid PK | |
| `grade` | smallint NOT NULL | 原 CHECK(7,8,9),后放宽到 `BETWEEN 7 AND 12` 给高中复用 —— `scripts/senior-rebuild/required1-preflight-ddl.sql:13-14` |
| `title` | text NOT NULL | |
| `body` | text NOT NULL | 原文 |
| `topic` | text | 如 `说明文/记叙文/书信` |
| `word_count` | int | 驱动 UI 推荐阅读时长 |
| `questions` | jsonb NOT NULL DEFAULT `[]` | 见下 |
| `vocab_notes` | jsonb NOT NULL DEFAULT `[]` | 见下 |
| `difficulty` | smallint NOT NULL DEFAULT 2 | 实数据 1–4 |
| `created_at` | timestamptz | |
| `publisher` | text NOT NULL | 后加 —— `SQLAA/DONE_publisher-phase1-migrate.sql:57-71`;值 `junior/pep/fltrp/sufe` |
| `volume` | text | ⚠️ 后加(见风险 R1);值如 `g9/required1/elective1` |
| `unit` | text | ⚠️ 后加;值如 `U1` |

**`questions` jsonb 形状**(⚠️ 与文档提案的 `num/type/stem` **不一致**):每项为 `{ q, options[4], answer, explanation? }`。
- `q` = 题干(不是 `stem`);无 `num`(靠数组下标 `i+1`);无 `type`(全按选择题渲染)。
- `answer` = `"A"/"B"/"C"/"D"`;`options` 按 A–D 顺序。
- 真实例:`scripts/fltrp-elective1-u1-load.sql:127`、`scripts/g9-u1-load.sql:104`。
- 消费类型:`src/pages/JuniorReadingPlay.tsx:18`。

**`vocab_notes` jsonb 形状**(⚠️ 比文档提案的 `word/phonetic/pos/cn/example` **更瘦**):每项仅 `{ word, cn }`。
- 富词条(phonetic/pos/example)在**另一张** `junior_vocab` 表,阅读行没有。
- 很多 junior seed 直接 `'[]'` 空数组(`scripts/g9-u1-load.sql:104-109`)。
- UI 只渲染 `v.word` + `v.cn`(`JuniorReadingPlay.tsx:292-298`)。

### ✅ `junior_reading_attempts`(逐题原始日志,复用模式)
定义:`supabase/migrations/20260503035502_....sql:48-61`。列:`user_id, reading_id(FK→junior_reading, ON DELETE CASCADE), question_idx(0基), user_answer, is_correct, duration_ms, created_at`。RLS owner-only,只 INSERT/SELECT。
写入:每次选项即插一行 —— `src/pages/JuniorReadingPlay.tsx:139-143`(⚠️ 不写 `duration_ms`,见 R5)。

### ✅ `junior_reading_completions`(整篇完成表)
定义:`supabase/migrations/20260503070338_....sql:2-21`。列:`user_id, reading_id(无 FK), perfect, time_spent_sec, created_at`,`UNIQUE(user_id,reading_id)`。
写入:提交时 upsert —— `JuniorReadingPlay.tsx:175-176`。

### 🆕 `primary_storybook_completion`(废弃空表,可考虑复活)
定义:`supabase/migrations/20260511011526_....sql:2`。列:`user_id, book_id(text), completed_at, questions_correct, questions_total, read_count`,PK `(user_id, book_id)`。
**全库无任何代码读写它**(除 `types.ts:5990`)。当年绘本脚手架残留。若做"整本书/章节"进度,可复活它,或作为反面教材删掉。

**一次答题的落库扇出(重要):** junior 阅读单题答对/错会同时写 **三处** —— `junior_reading_attempts`(原始日志)+ `unified_mastery`/`user_mistakes`(经 `recordUnifiedAttempt` edge function)+ 提交时 `junior_reading_completions` & `mastery_progress`。Reading Center 照抄这套即可。

---

## 2. 展示层

### ✅ `src/components/exam/ExamPaper.tsx`(最强复用点,已跨学段共享)
导出原语:`ExamPaper`(页壳) / `ExamContainer`(限宽) / `ExamCard`(题卡) / `ExamProgress`(点状进度) / `ExamOption`(ABCD 选项按钮)。零 junior 耦合,**已被 junior + gaokao 阅读页共用**。自带 docstring:"用于阅读练习页(Junior/Gaokao reading)"(`ExamPaper.tsx:4-8`)。

### 🟡 `src/pages/JuniorReadingPlay.tsx`(单篇播放页,需抽耦合)
路由:`/junior/reading/:id`(`App.tsx:471`),并被 gaokao lesson 镜像复用(`App.tsx:536`)。
布局:**两栏**(`lg:grid-cols-[1.3fr_1fr]`,`:386`)——左栏 sticky 原文 `body`(`whitespace-pre-wrap`)+ 下方 `vocab_notes` chips;右栏题目 + 提交/重做/下一篇面板。
答题链路:`pick()`(`:132-164`)本地存 `picks`,首选后锁定,即时落 `junior_reading_attempts` + 金币/宠物 + `recordUnifiedAttempt`;`handleSubmit()`(`:166-191`)校验全答完 + 最短阅读时长,再 upsert completions + `recordMastery` + 满分奖励。**无独立结算路由**,结算卡内联。
🟡 写死的耦合(推广前必须参数化):表名 `junior_reading*`;模块键 `loadMastery("junior_reading")`/`recordMastery({module:"junior_reading"})`/`recordUnifiedAttempt({stage:"junior",module:"reading"})`/`awardForBlock("junior_reading")`/`bumpPetSkill("reading_owl")`;路由 `/junior/reading`、返回链接;grade 1/2/3↔7/8/9 重映射(`gradeKeyFromParam`);junior 品牌文案。

### 🟡 `src/pages/JuniorReading.tsx`(列表页)
路由 `/junior/reading`(`App.tsx:470`)。直接查 `junior_reading`(select id,title,topic,word_count,difficulty,grade)按 grade 过滤,`loadMastery("junior_reading")` 分 todo/dueReview/done 三组。
⚠️ **另有一份未路由的僵尸副本** `src/pages/juniorHub/JuniorReading.tsx:22`(闯关解锁变体),`App.tsx` 没引用它 —— 推广前先厘清删除。

### 🆕 绘本/分级读物展示层(不存在,但有拼装件)
无 storybook/绘本/graded-reader 的组件或路由(详见 §4)。可拼装的候选:
- `SentenceLessonStage.tsx`(753 行)—— 角色对话行 + 逐行 TTS(`hubSpeakAtSpeed`/`AudioBtn`)+ 说话人配色卡。适合"朗读式/对话式绘本页"。
- `ReadWritePictureVisual.tsx`(210 行)—— 插图渲染器(外链图 `ExternalImageVisual` 带降级 + 圆角画框 `VisualFrame`)。适合按页配图。

### 复用小结
展示原语已经通用且共享(`ExamPaper.tsx`);两个 junior 页是写死副本、靠复制而非共享组件与 gaokao 撞同一套布局。通用化的正解 = 把"原文+词汇+题目两栏块"抽成**一个组件**,参数化:数据源 / 模块键 / 路由前缀 / grade 模型。

---

## 3. 错题系统(三套)

### ✅ `user_mistakes`(统一错题本,**唯一推荐落点**)
定义:`supabase/migrations/20260502223750_....sql:2-39`。关键:**没有独立 `source` 列**,靠 `module`(text 判别器)+ `source_key`(前缀命名)标识来源。`UNIQUE(user_id, module, source_key)` 是所有 upsert 的冲突键。RLS owner-only。
**规范写入路径** = `recordUnifiedAttempt()`(`src/hooks/useRecordAttempt.ts:50`)→ POST 到 `supabase/functions/record-attempt/index.ts`:答错自动 upsert(`:158`),后续答对自动置 `is_resolved`(`:173`)。
**对 Reading Center 极友好**:`module:"reading"` 已是 edge function 合法枚举值(`index.ts:12,67`),且 Mistakes UI 已有元数据(`src/pages/Mistakes.tsx:38` → 阅读错题 📖)—— **零 UI 改动**即可正确显示。junior 阅读已经这么用(`JuniorReadingPlay.tsx:152`)。

### 🟡 `gaokao_user_mistakes`(高中专用,不建议用)
`types.ts:2772`(⚠️ 无 migration,库里手建)。键 `(user_id, module, item_id)`。写:`GaokaoGrammarQuiz.tsx:444`、`knowledgePointMastery.ts:92`。高中作用域、无 `source_label`、**教师端读不到** —— Reading Center 别用。

### ✅ `junior_reading_attempts`(是日志不是错题本)
见 §1。它是原始分析日志(喂 `daily-stats`),**不是**错题本。阅读错题真正进错题本靠同一 `pick()` 里的 `recordUnifiedAttempt`。

### 🆕 `PassageReviewPanel`(不存在)
全库无此组件(及任何 `*ReviewPanel`)。各播放页(Junior/Gaokao/Suzhou/Cloze)各自内联结算 UI。若要共享复习面板,得**新建**。

### ✅ 教师端确实读 `user_mistakes`
`supabase/migrations/20260521120000_teacher_classes.sql` 的 SECURITY DEFINER RPC:`get_class_weakness` **按 `module` + `coalesce(source_label, module)` 分组**(`:383-398`)。
👉 含义:阅读错题只要写 `module:"reading"` + 有意义的 `source_label`(如篇名),就会**自动**出现在教师薄弱点看板并正确归类。`gaokao_user_mistakes`/`junior_reading_attempts` 对教师端不可见。

---

## 4. 掌握度 / 进度

### ✅ `mastery_progress`(星级/百分比,**阅读就用这张**)
定义:`supabase/migrations/20260503071215_....sql:2-25`;库 `src/lib/masteryProgress.ts`。
键 `UNIQUE(user_id, module, item_id)`。`module` 自由文本(migration 注释里已预留 `primary_reading`),`item_id` 不透明 text。`stars 0..5 / best_pct / attempts / next_review_at`,复习间隔 `[1,3,7,14,30,90]` 天。
写入全走 `recordMastery(...)`(客户端,**无 edge function**):`JuniorReadingPlay.tsx:177`(junior_reading)、`GaokaoReadingArticle.tsx:458`(gaokao_reading)等。
**Reading Center 直接 `recordMastery({module:"reading_center...", itemId, pct})` + `loadMastery(...)`,零 schema 改动。**

### 🟡 `junior_user_mastery`(FSRS 语法专用,**别用**)
`supabase/migrations/20260508074218_....sql:30-102`。键 `(user_id, item_type, item_id)`,`item_type` = grammar_point/kp/question,`item_id` 是**严格 uuid**,带一堆 FSRS 列 + `WHERE item_type='grammar_point'` 偏索引。语义是语法,复用给阅读会污染语法看板。避开。

### Method B 判定(同构表 + 复用 mastery + 不加 edge function)
**仓库已有强先例**:American 模块就是 Method B —— 克隆出 `american_user_mastery` 同构表 + 客户端 `recordMastery`(`src/lib/american/data.ts:289-`),零 edge function。Reading Center 可照抄。
最佳复用目标 = **`mastery_progress`**(而非 junior_user_mastery):已是阅读表、已跨学段(junior+gaokao 共存)、语义(星级/百分比/间隔复习)天然贴合阅读、纯客户端。

---

## 5. 风险点汇总(R1–R7)

- **R1 · `volume`/`unit` 是"暗桩" DDL。** 全库找不到 `ALTER TABLE junior_reading ADD COLUMN volume/unit` 的 migration/脚本(不同于 `publisher`),但所有 load 脚本都在插入/过滤它们。→ 纯靠 `supabase/migrations/` 重建的新库会**缺这两列**,load 脚本会失败。若 Reading Center 走"扩展 junior_reading"路线,必须先补一条正式 migration。
- **R2 · TS 类型 `junior_reading` 已过时。** `src/integrations/supabase/types.ts:3505-3540` 缺 `volume/unit/publisher`(库里都有且被大量查询)。→ 若按册/单元过滤,得先补类型或重新生成。
- **R3 · 题目键是 `q` 不是 `stem`。** 文档 §4.1 提案写的是 `num/type/stem`,实际存的是 `{q, options, answer, explanation?}`。→ **架构决策点**:Reading Center 要么承接现有瘦 schema,要么定义更富 schema 并做映射;两者不能默认混用。
- **R4 · `junior_reading_completions.reading_id` 无 FK**(而 attempts 表有 CASCADE)。删篇会级联清 attempts 但遗留 completion 孤儿行。
- **R5 · `duration_ms` 从不写入**(列在但 UI 插入路径不填)。别拿它做分析。
- **R6 · 聚合查询硬编码 module 字面量。** `juniorClassroomSync.ts:151`、`useMasteryOverview.ts`、`AchievementBanner.tsx:257,370` 按字面 `"junior_reading"`/`["gaokao_reading","gaokao_cloze"]` 过滤。→ **新 reading 模块在这些看板/家长报告里默认不出现**,得显式扩这些字面量。这是最"隐形"的缺口。
- **R7 · load 脚本双份并存。** `scripts/` 与 `SQLAA/` 下同名文件各一份(如 `fltrp-elective1-u1-load.sql`)。复用前确认哪个是权威。(按记忆:`SQLAA/` 只放待 Aaron 跑的 SQL。)

---

## 6. 能复用 / 需新建 一览

| 能力 | 结论 | 落点 |
|---|---|---|
| 阅读原文 + 题 + 词汇 存储 | ✅ 复用 or 🟡 扩展 | `junior_reading`(瘦 JSON schema)—— 决策见 ARCHITECTURE |
| 逐题日志 | ✅ 复用模式 | `junior_reading_attempts` 同构 |
| 整篇完成 | ✅ 复用模式 | `junior_reading_completions` 同构 |
| 展示原语(卡/选项/进度) | ✅ 直接复用 | `ExamPaper.tsx` |
| 两栏原文+词汇+题 布局 | 🟡 抽成共享组件 | 现为 junior/gaokao 各自复制 |
| 列表页 | 🟡 参数化复用 | `JuniorReading.tsx`(去 junior 耦合 + 删僵尸副本) |
| 错题落库 | ✅ 直接复用 | `recordUnifiedAttempt` → `user_mistakes` `module:"reading"` |
| 教师端归集 | ✅ 自动生效 | `get_class_weakness` 按 module+source_label 分组 |
| 掌握度/进度 | ✅ 直接复用 | `mastery_progress` + `recordMastery`(新 module 值) |
| 绘本/分级读物展示 | 🆕 拼装 | `SentenceLessonStage` + `ReadWritePictureVisual`(可后置) |
| 整本书章节阅读器 | 🆕 新建 | 长文本阅读器(可后置) |
| 共享结算/复习面板 | 🆕 新建 | `PassageReviewPanel` 不存在 |

> 下一步见 `DECISIONS.md`(表方案取舍)与 `ARCHITECTURE.md`(路由/组件方案)。
