# 初中词表数据库现状报告（阶段 2 · 只读）

> 生成时间：阶段 2 代码/迁移审计。未连接生产 Supabase，**行数与是否已执行临时 SQL 需在控制台自行核对**（见文末 SQL）。

---

## 1. `junior_vocab` 表

### 1.1 是否存在

**存在。** 由迁移 `supabase/migrations/20260503023113_466fe8f6-8502-46e9-8878-965f1ff5c5cb.sql` 创建。

### 1.2 列结构（迁移 + `types.ts` 一致）

| 列名 | 类型 | 说明 |
|------|------|------|
| `id` | `uuid` PK | 数据库主键（`gen_random_uuid()`） |
| `grade` | `smallint` | 7 / 8 / 9（CHECK 约束） |
| `word` | `text` | 英文词形 |
| `pos` | `text` | 词性 |
| `phonetic` | `text` | 音标 |
| `meaning_cn` | `text` | 中文释义（必填） |
| `meaning_en` | `text` | 英文释义 |
| `example_en` / `example_cn` | `text` | 例句 |
| `tip` | `text` | 记忆提示 |
| `theme` | `text` | 主题代码（关联 `junior_themes`） |
| `freq_rank` | `int` | 词频排序 |
| `star_level` | `smallint` | 默认 3 |
| `created_at` | `timestamptz` | 创建时间 |

**与阶段 1 合并 CSV 的差异（灌库前必须处理）：**

| CSV 字段 | 库表现状 |
|----------|----------|
| `word_id`（业务键，如 `jr-7B-U1-0001`） | **无列** — 仅 `id` uuid |
| `stage` | **无列**（恒为 junior，可忽略或加列） |
| `volume`（7A/7B/8A/8B/9） | **无列** |
| `unit` | **无列** |
| `source_type` / `source_page` / `confidence` | **无列** |

RLS：全员可读（`Anyone can read junior vocab`），**无客户端 INSERT/UPDATE 策略**（词表只能经 service role / migration 写入）。

### 1.3 现有行数

**本 Agent 无法查询生产库。** 请在 Supabase SQL Editor 执行：

```sql
SELECT COUNT(*) AS total FROM public.junior_vocab;
SELECT grade, COUNT(*) FROM public.junior_vocab GROUP BY grade ORDER BY grade;
```

**代码侧参考值：** `src/hooks/useMasteryOverview.ts` 硬编码初中词汇总量 **2043**（用于家长端进度分母），与阶段 1 合并词表 **2373** 不一致——灌库后需同步更新该常量。

### 1.4 数据从哪来

- 仓库内 **无任何 `INSERT INTO junior_vocab` 的 migration 或脚本**（仅 `20260509041616_…sql` 对停用词做过 `DELETE`）。
- 词表内容来自 **Lovable / Supabase 控制台手工或外部灌入**，非本仓库版本化种子。
- 前端按 `grade`（7/8/9）分页读取，按 `freq_rank` 排序；`theme` 对应迁移里种下的 `junior_themes`（如 `g7_school`），与 CSV 的 `volume`/`unit` 维度无关。

---

## 2. `junior_word_mastery` 表

### 2.1 结构

同迁移 `20260503023113_…sql` 创建；`types.ts` 与库一致。

| 列名 | 说明 |
|------|------|
| `id` | uuid PK |
| `user_id` | 用户 |
| `word_id` | **uuid，FK → `junior_vocab.id`** |
| `grade` | 7/8/9 |
| `quiz_*` / `listen_*` / `spell_*` / `match_*` / `cloze_*` / `reading_*` | 各题型对错计数 |
| `mastery_level` | 0–4 |
| `ease` / `interval_days` / `due_at` | SRS 字段 |
| `last_seen_at` / `created_at` / `updated_at` | 时间戳 |

唯一约束：`(user_id, word_id)`。

### 2.2 与 `junior_vocab` 的关联

```
junior_word_mastery.word_id  →  junior_vocab.id  (uuid)
```

**不是** CSV 里的字符串 `word_id`（`jr-7B-U1-0001`）。灌库后业务键需映射到 `junior_vocab.id`，或在 `junior_vocab` 增加 `word_id` 文本列并在 mastery 写入时使用该映射。

### 2.3 与 `unified_mastery` 的关系

迁移 `20260510000527_…sql` 曾把 `junior_word_mastery` **一次性同步**到 `unified_mastery`（`stage='junior'`, `item_id=word_id::text`）。

当前答题 Edge Function `record-attempt` 写入的是 **`unified_mastery_manual`**（表由 `unified_mastery` rename 而来），**不写入** `junior_word_mastery`。

---

## 3. 前端读写位置

### 3.1 `junior_vocab`（读）

| 文件 | 用途 |
|------|------|
| `src/pages/JuniorVocab.tsx` | 按 `grade` 分页 `select`，词汇游戏词池 |
| `src/pages/StageTestPlay.tsx` | 阶段测从 `junior_vocab` 抽题 |
| `src/pages/GaokaoVocab.tsx` | 拉取 `junior_vocab.word`（去重/过滤用） |

### 3.2 `junior_word_mastery`

| 操作 | 文件 | 说明 |
|------|------|------|
| **读** | `JuniorVocab.tsx` | Hub 掌握度统计；SRS 模式筛 `due_at` |
| **读** | `useMasteryOverview.ts` | 初中家长端 vocab 模块进度 |
| **读** | `AchievementBanner.tsx` | 成就统计 |
| **读** | `daily-stats` Edge Function | 日统计 |
| **写** | `StageTestPlay.tsx` | **唯一**在仓库内对 `junior_word_mastery` 做 insert/update 的前端路径（阶段测交卷 `syncProgress`） |
| **写** | `JuniorVocab.tsx` 各游戏模式 | **无** |

### 3.3 并行掌握度体系（易混淆）

| 存储 | 初中词汇答题是否写入 |
|------|---------------------|
| `junior_word_mastery` | **否**（日常练习）；**仅**阶段测 |
| `gaokao_user_mastery` | **是** — `recordCohortAttempt` → `bumpVocabMastery` |
| `gaokao_user_attempts` | **是** — `recordAttempt` |
| `unified_mastery_manual` | **是** — `recordUnifiedAttempt` → Edge `record-attempt` |

`docs/SOURCE_AUDIT.md` 明确：`JuniorVocab` 所有路径 `source: free_practice` → `gaokao_user_mastery`。

`src/lib/vocabMastery.ts` 注释写明 GuidedSession / 复习池读写的也是 **`gaokao_user_mastery`**，与 Hub 读的 **`junior_word_mastery`** 分裂。

---

## 4. 关键：学生做完一道初中词汇题后的数据链路

### 4.1 主路径 — `JuniorVocab` → `ClassicQuiz` / `DictationSession`

用户：选年级 → 选模式 `classic` 或 `dict` → 作答 `onPickAns` / `submit`。

每次作答并行调用（均带 `.catch(() => {})` 静默吞错）：

1. `recordCohortAttempt({ vocabId: cur.id, …, source: "free_practice" })`  
   → `bumpVocabMastery` → **`gaokao_user_mastery`**（`item_type='vocab'`, `item_id=cur.id`）
2. `recordAttempt({ questionType: "vocab", questionId: cur.id, … })`  
   → **`gaokao_user_attempts`**
3. `recordUnifiedAttempt({ stage: "junior", module: "vocab", item_id: cur.id, … })`  
   → Edge **`record-attempt`** → **`unified_mastery_manual`**

**不写入 `junior_word_mastery`。**

UI 文案写「答题数据已自动接入智能复习系统」，但 Hub/SRS 读的是 `junior_word_mastery`，形成 **读写表不一致**。

### 4.2 其他 `JuniorVocab` 模式

| 模式 | 写 `junior_word_mastery` | 写 `gaokao_user_mastery` 等 |
|------|--------------------------|------------------------------|
| `classic` / `dict` | 否 | 是（见上） |
| `match`（记忆翻牌） | 否 | **否**（仅 `awardCoins`） |
| `bento` / `quest` / `duel` | 否 | 视子组件；未统一写 jwm |
| `guided` → `GuidedSession` | 否 | 是（`recordCohortAttempt`） |
| `review` → `ReviewPool` / cohort 组件 | 否 | 是 |
| `srs` | 否 | 练习写 gaokao；**到期列表却读 `junior_word_mastery`** → 常为空 |

### 4.3 会写 `junior_word_mastery` 的路径

**`StageTestPlay.tsx`**（`segment=junior` 阶段词汇测）：交卷 `syncProgress` 对每题 upsert `quiz_correct` / `quiz_wrong` / `mastery_level` / `last_seen_at`。

### 4.4 结论（与诊断一致）

| 问题 | 状态 |
|------|------|
| 日常初中词汇练习不写 `junior_word_mastery` | **确认** |
| Hub「我的词汇掌握度」读 `junior_word_mastery` | **确认** → 日常练习后数字不涨 |
| SRS 模式读 `junior_word_mastery` 的 `due_at` | **确认** → 与 `gaokao_user_mastery.due_at` 不同步 |
| 错误被 `.catch(() => {})` 吞掉 | **确认**（ClassicQuiz / Dictation / StageTest 等多处） |

阶段 4 修复目标：在 `JuniorVocab` 作答链路上 **upsert `junior_word_mastery`**（字段与 `StageTestPlay` 对齐），并改为可见错误处理；**不要**改动 `primary_*` / `gaokao_*` 既有写入（除非产品明确要求统一）。

---

## 5. 灌库方案待你拍板（阶段 3 前）

| 方案 | 说明 | 风险 |
|------|------|------|
| **A. 清空重灌** | `TRUNCATE`/`DELETE` 后按 `junior_merged.csv` 全量导入；mastery 的 `word_id` uuid 全部失效 | 需处理 `junior_sentences.word_id` FK；用户掌握记录需迁移或接受丢失 |
| **B. 增量合并** | 按 `word`+`grade`+`volume` 去重 upsert；保留已有 uuid | 需先加列；旧词与新词 id 不稳定 |
| **C. 新表** | 如 `junior_vocab_pep`，前端改读新表 | 改动面大，一般不首选 |

**建议前置：** 在 `junior_vocab` 增加 `word_id text UNIQUE`、`volume`、`unit`、`source_type`、`source_page`、`confidence`，再导入 2373 行；灌库后更新 `useMasteryOverview` 的 2043 常量。

请确认选用 **A / B / C**（或变体）后，再进入阶段 3。

---

## 6. 附录：`.tmp_primary_insert.sql`

### 6.1 是什么

项目根目录 **`/.tmp_primary_insert.sql`**（约 **96 KB**，**245 行**）：

- **不是** migration，**不在** `supabase/migrations/` 下
- **已纳入 git**（commit `0c8e2dcd`，2026-05-03，Lovable/gpt-engineer 提交）
- 内容为一次性 **INSERT** 脚本，目标表：
  - `primary_letters`：26 行（A–Z，`ON CONFLICT (letter_upper) DO NOTHING`）
  - `gaokao_vocab_themes`：16 行 primary 主题（`ON CONFLICT DO NOTHING`）
  - `gaokao_vocab`：约 **195** 行 `stage='primary'` 小学词（无 `ON CONFLICT`，重复执行可能主键/唯一冲突）

与 **初中任务无关**；属于小学词表/字母灌库草稿。

### 6.2 是否已被执行过

**无法从仓库断定。** 仓库无执行记录、无 migration 引用。

请在 Supabase 执行核对：

```sql
-- 若接近 26，letters 段可能已跑过
SELECT COUNT(*) FROM public.primary_letters;

-- 若接近 16，themes 段可能已跑过
SELECT COUNT(*) FROM public.gaokao_vocab_themes WHERE stage = 'primary';

-- 若显著 >0 且含 hello/hi 等，vocab 段可能已跑过（需与既有 primary 词去重）
SELECT COUNT(*) FROM public.gaokao_vocab WHERE stage = 'primary';
```

### 6.3 是否需要清理

| 项 | 建议 |
|----|------|
| **删文件** | 阶段 2 **未删除**（按任务书要求）。确认已执行且数据无误后，可 **移入** `supabase/seed/` 并改名，或 **git rm** 避免误跑 |
| **再执行** | **不要**在未确认前整文件执行；`gaokao_vocab` 段无幂等保护 |
| **纳入 migration** | 若需版本化，应拆成正式 migration + 幂等 `ON CONFLICT`，而非保留根目录 `.tmp_*` |

---

## 7. 阶段 2 自检清单

- [x] `junior_vocab` / `junior_word_mastery` 结构已从迁移与 types 确认
- [x] 前端读写点已列出
- [x] 初中词汇答题 → **不写** `junior_word_mastery` 已用代码证实
- [x] `.tmp_primary_insert.sql` 已说明（未执行、未删除）
- [ ] **需你在 Supabase 补跑**：`junior_vocab` 行数、`junior_word_mastery` 行数、`.tmp` 是否已生效

---

**阶段 2 结束 — 请确认灌库方案（§5）后回复「进入阶段 3」。**
