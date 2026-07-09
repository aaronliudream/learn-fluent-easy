# Reading Center — 决策日志 (DECISIONS)

> 每个架构选择、每次取舍记一条。状态:**✅ 已定 / 🟡 提案待 Aaron 或 web Claude 确认 / ⏸️ 待 Aaron 拍板(§7 开放问题)**。
> 依据全部来自 `INVENTORY.md`(带 path:line)。

---

## D1 · 表方案:新建 `reading_library` 同构表(不扩展 `junior_reading`) — ✅ 已定(Aaron 同意)
**决定**:不走"扩展 `junior_reading`"路线,新建一张 `reading_library`,但 `questions`/`vocab_notes` 的 jsonb 形状与 `junior_reading` **保持同构**。
**理由**:
1. Reading Center 的定位是**跨学段 + 跨内容类型**;`junior_reading.grade` 是 `smallint`(7–12),且没有 `content_type`/`grade_band`/`level` 概念 —— 硬塞进去要改列 + 改 CHECK,反而更脏。
2. 新表不碰线上 junior/gaokao 阅读的任何一行,零回归风险。
3. 仓库已有 Method B 先例(American 克隆出 `american_user_mastery`,零 edge function,`data.ts:289-`),照抄这套是最稳的。
4. `junior_reading` 自身有暗桩列 `volume/unit`(风险 R1)和过时 TS 类型(R2),扩展它等于继承这些债。
**代价**:列表/播放页要参数化数据源(本来就要做,见 D6)。
**放弃的替代**:扩展 `junior_reading`(省一张表,但继承 R1/R2 债 + 污染现有 module 过滤 R6)。

## D2 · `questions` 承接现有瘦 schema `{q, options, answer, explanation?}` — ✅ 已定(Aaron 采纳,**修正文档 §4.1**)
**决定**:承接 `junior_reading` 实际在用的 `{ q, options[], answer:"A".., explanation? }`,**不采用**文档 §4.1 写的 `num/type/stem`。
**理由**:实测库里就是 `q`(不是 `stem`),无 `num`/`type`(风险 R3)。承接它可**直接复用** `JuniorReadingPlay.tsx` 的整套渲染 + 评分 + 落库逻辑,零映射。
**判断/判断题(T/F)怎么办**:不加 `type` 字段 —— T/F 建模为 `options:["True","False"]` + `answer:"A"/"B"`。选择题与判断题同一套渲染,样板不需要 schema 分支。
**后续若要多题型**(问答/排序):届时再加可选 `type` 字段,默认缺省=选择题,向后兼容。

## D3 · 错题落 `user_mistakes`,`module:"reading"` — ✅ 已定(照现成链路)
**决定**:阅读答错走 `recordUnifiedAttempt()`(`useRecordAttempt.ts:50` → `record-attempt` edge function),`module:"reading"`,`source_key` 命名空间前缀 `reading_center:<passageId>:<qIdx>`,`item_label` = 篇名。
**理由**:`"reading"` 已是合法枚举 + Mistakes UI 已有元数据(阅读错题 📖,`Mistakes.tsx:38`)+ 教师端 `get_class_weakness` 已按 `module`+`source_label` 分组 —— **零 UI / 零 edge 改动**,教师端自动归集。这正是 junior 阅读现行做法(`JuniorReadingPlay.tsx:152`)。满足文档铁律"错题第一天就进 mistake 系统"。
**要点**:必须给有意义的 `item_label`(篇名),否则错题本/教师端只显示裸 "reading"。
**放弃**:`gaokao_user_mistakes`(教师端不可见、无 migration)。

## D4 · 掌握度复用 `mastery_progress`,新 module 值 — ✅ 已定
**决定**:`recordMastery({ module:"reading_center", itemId:<library.id>, pct })` + `loadMastery("reading_center")`(客户端,`src/lib/masteryProgress.ts`,无 edge function)。
**理由**:`mastery_progress` 已是阅读的掌握度表、已跨学段共存、语义(星级/百分比/`[1,3,7,14,30,90]` 间隔复习)天然贴合阅读。`module` 是开放文本枚举(migration 注释已预留新值)。
**已知缺口(R6)**:`juniorClassroomSync.ts:151` / `useMasteryOverview.ts` / `AchievementBanner.tsx:257,370` 按字面 module 过滤 —— 新 `reading_center` **不会自动出现在这些看板/家长报告**。样板阶段接受"仅掌握度落库、暂不进旧看板";要进看板时再显式扩这些字面量(记一条后续 TODO)。
**放弃**:`junior_user_mastery`(FSRS 语法专用、uuid item_id、会污染语法看板)。

## D5 · 逐题日志 + 整篇完成:新建同构 `reading_attempts` / `reading_completions` — 🟡 提案
**决定**:照 `junior_reading_attempts` / `junior_reading_completions` 各克隆一张 `reading_attempts` / `reading_completions`(FK 指向 `reading_library`)。
**理由**:保持与 junior 一致的三层落库(原始日志 / 统一错题 / 掌握度+完成)。修掉 junior 的两个小债:completions 补 FK(修 R4)、attempts 落 `duration_ms`(修 R5)。
**可后置**:样板最小闭环只要 D3(错题)+ D4(掌握度)就能验收;attempts/completions 是分析/复习增强,可样板后补。样板先不建,避免过度铺设。

## D6 · 代码组织:跟随现有 `src/pages` + `src/lib` + `src/components` 约定 — ✅ 已定
**决定**:**不**新建 `src/features/reading/`(仓库没有 `src/features/*` 约定)。跟随现状:
- 页面 `src/pages/Reading.tsx`(列表)、`src/pages/ReadingPlay.tsx`(播放),或 `src/pages/reading/` 子目录。
- 数据/逻辑 `src/lib/reading/`(数据源抽象、mastery 包装)。
- 组件 `src/components/reading/`(把 junior/gaokao 复制的"原文+词汇+题两栏块"抽成共享 `ReadingPassagePanel`)。
- 复用 `src/components/exam/ExamPaper.tsx` 原语(卡/选项/进度)。
**理由**:文档明确"别硬塞不符现有约定的路径";仓库全走 pages/lib/components。

## D7 · 一级入口 `/reading`:**全站一级入口** — ✅ 已定(Aaron 拍板)
**决定**:`/reading` 做成**全站统一阅读中心**一级入口,进去后按学段(小学/初中/高中/通用)筛,**不**挂各学段下面各自一个。**不动** junior 现有路由,新增 `/reading` 路由不碰任何禁区文件。

## D8 · 分级标准:**词数分级** — ✅ 已定(Aaron 拍板)
**决定**:样板用**词数分级**,`level` 列留可扩展位(自由文本)。Lexile 是 MetaMetrics 专有度量、不能免费算,以后想接再加数值字段,样板不上。

## D9 · 内容来源/版权 & AI 出题 — ✅ 已定(Aaron 拍板)
**决定**:样板那篇 = **自编**初中短文(零版权风险)。整本书路线只用**公有领域**文本,**绝不**照搬 RAZ / 牛津树 / 现行教材原文。AI 出题/解析:样板**纯人工题**;AI 出题留作以后可选增强,且**必须走审核门**。铁律:找不到合法来源就停下问 Aaron,绝不编原文冒充教材节选。

## D10 · 样板选型:初中,1 篇自编分级读物 + 4 题(选择/判断) — ✅ 已定(Aaron 同意)
**决定**:样板选**初中**学段(素材多、闭环快),`content_type='graded_reader'`,`grade_band='junior'`,自编 1 篇 + 4 道题(MC/TF)。闭环:`/reading` → 进篇 → 答题 → 错题写 `user_mistakes` → 错题本可见 → tsc/build/test 绿。**内容先回 Aaron → web Claude 审核通过再落库。**

## D11 · 样板落地记录(P0 代码已建,内容待审 + 待 Aaron 跑 SQL)— 🟡 待验收
**已完成(代码,纯技术可直接推)**:
- 表方案:落地 **D1**(新建 `reading_library` 同构表)+ **D2**(承接 `{q,options,answer,explanation?}` 瘦 schema)。DDL 见 `SQLAA/reading-center-ddl.sql`。
- 数据层:`src/lib/reading/source.ts`(`listReadings`/`getReading`,`supabase as any` 访问新表,照 `american/data.ts` 先例)。
- 掌握度:`src/lib/reading/mastery.ts` 薄封装 `recordMastery`/`loadMastery`,module=`reading_center`(**D4**)。
- 页面:`src/pages/Reading.tsx`(`/reading` 列表,学段 chip 筛)+ `src/pages/ReadingPlay.tsx`(`/reading/:id` 播放)。复用成功:`ExamPaper` 全套原语零改、`StarRating`、`NoCopyGuard`、`useRegisterAssistant`、`celebrateScore`。
- 路由:`src/App.tsx` 新增 `/reading`、`/reading/:id`(包 `ChineseOnlyRoute`,**未碰任何禁区文件**)。
- 错题(**D3**):**单一链路**——每题 `recordUnifiedAttempt({module:"reading", item_id:"reading_center:<id>:<qi>", context:{question:题干,explanation}})`,答错入 `user_mistakes`(source_label=篇名→错题本📖 + 教师端 `get_class_weakness` 自动归集),答对自动置 `is_resolved`。**刻意不照抄 junior 的"整篇快照"二次写**:junior 同时写逐题行 + 整篇快照,会在错题本产生重复/空标题卡;D3 只钦定 `recordUnifiedAttempt`,故本实现只走这一条,每道错题=一张可读卡(headline=题干)。
- `tsc --noEmit` ✅ 通过;`vite build` ✅ 通过(见提交说明)。
**未做/待办**:
- 内容审核门:样板篇《The Lost Kitten》+ 4 题为**自编原创**,审稿件 `docs/reading/SAMPLE_REVIEW.md`(镜像 `REVIEWAA/阅读中心样板/`),**须 Aaron/网页版 Claude 审过再落库**。
- 落库 SQL:`SQLAA/reading-center-ddl.sql`(建表,可先跑)+ `SQLAA/reading-center-seed-sample.sql`(内容,审过再跑)。
- **闭环真机验证**待 Aaron 跑 SQL 后:`/reading`→进篇→故意答错→错题本可见。CC 侧因新表未落库无法本地跑通全链路,已用 tsc/build 兜底静态验证。
- D5 的 `reading_attempts`/`reading_completions` 样板阶段**未建**(最小闭环只需 D3+D4),留 P1。

---

### 后续 TODO(样板验收后再做,先记账不做)
- T1:扩 `juniorClassroomSync.ts` / `useMasteryOverview.ts` / `AchievementBanner.tsx` 的 module 字面量,让 `reading_center` 进看板/家长报告(R6)。
- T2:补 `junior_reading` 的 `volume/unit` 正式 migration(R1),或在新 `reading_library` 上不重蹈暗桩。
- T3:删僵尸副本 `src/pages/juniorHub/JuniorReading.tsx`;把两栏块抽成共享组件(消 junior/gaokao 重复)。
- T4:绘本/整本书章节展示层(拼 `SentenceLessonStage` + `ReadWritePictureVisual`),可后置。
