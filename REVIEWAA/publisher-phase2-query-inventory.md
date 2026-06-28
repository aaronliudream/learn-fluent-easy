# 出版社分叉 Phase 2 · 查询层盘点清单(只读,等核,未改任何代码)

> 范围:全仓查这 9 张内容表的地方 —— junior_vocab / junior_grammar_points / junior_grammar_questions / junior_reading / junior_cloze / junior_listening_exercises / junior_listening_items / junior_writing_prompts / context_questions。
> 分类:**A**=高中/gaokao 查询(要加 publisher 过滤) · **SHARED**=共用组件(按入口分流 pub) · **B**=初中/小学/admin/统计/禁区(★一行不动★)。
> 关键前提:高中内容 = volume `required*/elective*` + grade 10/11/12;初中 = grade 7/8/9 + volume `7A/7B/8A/8B/9`。**grade/volume 本身已隔离初高中**,publisher 只用于在"高中内部"区分 pep/sufe/fltrp。所以 B 类(初中)现有 grade/volume 过滤已天然排除高中,**加 publisher 既多余又危险 → 不碰**。

---

## A 类 —— 高中专项板块(纯 senior,直接 `.eq('publisher', pub)`,pub 默认 'pep')

| # | 文件:行 | 表 | 用途 | 当前过滤 | 动作 |
|---|---|---|---|---|---|
| A1 | `GaokaoVocabBoard.tsx:47` | junior_vocab | 选册可用性(哪些册有词) | `.in('volume', SENIOR_VOLUMES)` | 加 `.eq('publisher',pub)` |
| A2 | `GaokaoVocabBoard.tsx:61` | junior_vocab | 读某册全部词(词汇专项主池) | `.eq('volume', book)` | 加 `.eq('publisher',pub)` |
| A3 | `GaokaoWritingBoard.tsx:35` | junior_writing_prompts | 选册可用性 | `.in('volume', SENIOR_VOLUMES)` | 加 publisher |
| A4 | `GaokaoWritingBoard.tsx:48` | junior_writing_prompts | 某册写作题列表 | `.eq('volume', book)` | 加 publisher |
| A5 | `GaokaoExerciseBoard.tsx:43` | reading/cloze/listening_exercises(table 变量) | 选册可用性 | `.in('volume', SENIOR_VOLUMES)` | 加 publisher |
| A6 | `GaokaoExerciseBoard.tsx:55` | 同上 | 某册单元列表 | `.eq('volume', book)` | 加 publisher |
| A7 | `GaokaoGrammarBoard.tsx`(经 `juniorGrammarUnits.loadUnitGrammar`) | grammar_points/questions | 语法专项·按册列单元语法点 | 见 S-G(走 grammar JOIN) | points 加 publisher |

> A 类全部只在 `/gaokao/*` 路由出现,纯高中,pub 现阶段恒 'pep'(Phase 3 接选择页后变量)。

---

## SHARED 类 —— 共用组件,publisher **按入口分流**(/gaokao→pep,/junior→'junior'/不传)

★这些组件 `/gaokao/lesson`(高中壳 basePath)和 `/junior`(初中)同一套代码都走。**不能按组件一刀切加 pep**;pub 必须从"入口"传进来。★

**入口分流信号(三选一,建议统一函数 `resolvePublisher`):**
- `basePath`:`/gaokao*` → 'pep';`/junior*` → 'junior'(JuniorHubStagePlay 及其 Stage 都有 basePath prop,已层层下传)。
- `grade`:≥10 → senior(pep);7/8/9 → 'junior'。
- 都取不到 → 默认 'pep'(用户定:取不到=pep)。

| # | 文件:行 | 表 | 用途 | 当前过滤 | 分流动作 |
|---|---|---|---|---|---|
| S1 | `juniorHub/useUnitVocab.ts:27` | junior_vocab | hub 词汇关取本单元词 | `.eq('grade',grade).eq('volume',unit.book).eq('unit',unit.unitKey)` | senior 入口加 `.eq('publisher','pep')`;junior 不加 |
| S2 | `juniorFinalQuiz.ts:56` | junior_vocab | 单元通关·词汇题 | `.eq('grade',grade).eq('volume',unit.book)` | 同上 |
| S3 | `juniorFinalQuiz.ts:281` | junior_listening_items | 单元通关·听力题 | `.eq('grade',grade).eq('volume',volume)` | 注:listening_items 全初中,senior 实际取 junior_listening_exercises;按入口/grade 分流,无 senior 数据则维持现状 |
| S4 | `juniorFinalQuiz.ts:398` | junior_reading | 单元通关·阅读题 | `.eq('grade',grade).eq('volume',unit.book)` | senior 入口加 publisher |
| S5 | `juniorHub/JuniorHubStagePlay.tsx:1296` | junior_reading | 课文阅读关·本单元列表 | `.eq('grade',grade).eq('volume',unit.book)` | basePath=/gaokao→pep |
| S6 | `juniorHub/JuniorHubStagePlay.tsx:1488` | junior_cloze | 完形关·本单元列表 | `.eq('grade',grade).eq('volume',unit.book)` | 同上 |
| S7 | `juniorHub/JuniorHubStagePlay.tsx:1614` | junior_listening_exercises | 听力关·本单元列表 | `.eq('grade',grade).eq('volume',unit.book)` | 同上 |
| S8 | `components/grammar/GrammarTipsCard.tsx:31` | junior_grammar_tips | 语法关·语法小知识卡 | `.eq('volume',volume).eq('unit',unit)` | senior 加 publisher(volume 已是 required*,pub=pep) |
| S9 | `JuniorVocab.tsx:744` (ContextQuiz) | context_questions | 情景闯关取题 | `.eq('grade',gradeNum)` + 可选 `.eq('volume',volume)` | 高中调用已传 volume;再按入口加 publisher |
| S-G | `juniorUnitGrammar.ts:34` `resolveUnitPoints` | junior_grammar_points | 单元语法综合测试/通关·code→point | `.in('code', codes)` | **加 `.eq('publisher',pub)`**(语法走 points.publisher;questions 经 point_id 继承,`loadPointMcq:62` 不改) |
| S-G2 | `juniorGrammarUnits.ts:38/100` | junior_grammar_points | 语法板块按册/code 列单元 | `.in('code',codes)` / 按 volume | 高中路径加 publisher |

**Play 子页(经 GaokaoExerciseBoard 链接,/gaokao/lesson/* 与 /junior 共用)——多数按 `id` 取(id 全局唯一,无需 publisher);仅"按 grade/volume 列下一篇"需分流:**
| # | 文件:行 | 表 | 用途 | 备注 |
|---|---|---|---|---|
| P1 | `JuniorReadingPlay.tsx:87` | junior_reading | 按 id 取单篇 | id 唯一,**无需 publisher** |
| P2 | `JuniorReadingPlay.tsx:97` | junior_reading | 按 grade 列"同级文章"导航 | senior 入口需加 publisher(否则混到他社) |
| P3 | `JuniorClozePlay.tsx:44` | junior_cloze | 按 id 取 | 多半 id 唯一,**核实**是否有 grade 列表 |
| P4 | `JuniorListeningPlay.tsx:85` | junior_listening_exercises | 按 id 取 | 同上核实 |
| P5 | `JuniorWritingPlay.tsx:58` | junior_writing_prompts | 按 id/grade 取 | 同上核实 |

---

## B 类 —— ★一行不动★(初中 / 小学 / admin / 统计 / 禁区文件)

| 文件:行 | 表 | 为何不动 |
|---|---|---|
| `JuniorVocab.tsx:73` | junior_vocab | 初中词汇页(/junior),grade 7/8/9 已隔离 |
| `JuniorReading.tsx:39` / `juniorHub/JuniorReading.tsx:40` | junior_reading | 初中阅读列表(按 grade) |
| `JuniorListening.tsx:79` | junior_listening_exercises | 初中听力列表 |
| `JuniorWriting.tsx:16` | junior_writing_prompts | 初中写作列表 |
| `JuniorClozePlay.tsx` / `JuniorReadingPlay.tsx`(从 /junior 入) | junior_cloze/reading | 同组件初中入口分支(分流后初中不加 pub) |
| `JuniorGrammar.tsx:80` / `JuniorGrammarKpQuiz.tsx:57` / `JuniorGrammarLab.tsx:1162+` / `JuniorGrammarMastery.tsx:114+` / `JuniorGrammarPoint.tsx:128+` / `JuniorGrammarRevenge.tsx:49` | grammar_points/questions | 初中语法各页(/junior);按 grade/code,初中 code 与高中不撞 |
| `juniorGrammarContinue.ts:46` / `juniorKnowledgePoint.ts:123` / `juniorGrammarFsrs.ts:150` / `JuniorKpPracticeSection.tsx:46` / `useGrammarPointId.ts:23` / `SkillMasteryPanel.tsx:18` | grammar_points/questions | 初中语法掌握/KP/续练;按 id/code/grade,初中域 |
| `AdminGrammarContent.tsx:107+` | grammar_points/questions | ★admin 管理台,要看全部 publisher,绝不加过滤★ |
| `corpusTotals.ts:31/52` | junior_vocab | 语料总数统计(全量计数,加 pub 会漏算) |
| `useMasteryOverview.ts:316/322` | grammar_points/questions | 掌握度总览统计(全量) |
| `juniorClassroomSync.ts:106/115/143/161/189` | 多表 | ★禁区文件,不改★(班级内容同步) |
| `components/parent/AchievementBanner.tsx:262/289` | grammar_points/questions | ★禁区文件,不改★ |

> primary_*(小学)、`junior_user_mastery`/`junior_word_mastery`/`mastery_progress`/`gaokao_user_mastery`(进度)、`_junior_*_backup*`(备份):本就不在 9 张内容表里,零触碰。

---

## 真改时的纪律(确认后才动)
1. **统一 publisher 解析函数** `resolvePublisher(ctx)`:入口/basePath/grade → pub;取不到 = **'pep'**。
2. **A 类**:直接 `.eq('publisher', pub)`(pub 恒 pep,Phase 3 变量)。
3. **SHARED 类**:pub 从入口传入;`/gaokao`→pep,`/junior`→'junior'(或不加);**初中分支字节级不变**。
4. **语法**:过滤打在 `resolveUnitPoints` 的 `junior_grammar_points`(`.eq('publisher',pub)`);`junior_grammar_questions` 经 `point_id` 继承,不单独加。
5. **B 类一行不动**;admin 不过滤;禁区文件不碰;不碰库/进度表/word_id。
6. 改完:`tsc 0` + 人教(pep)零回归真机(初中、各高中板块全过)再 push。

---

## ★前提核查(真改前必读)★ —— B 类是否都带初中过滤兜底?

逐个读过 B 类查询。结论:**大多数带 grade/code/id/category 过滤(安全),但有 7 处"裸查整表"——自从高中内容灌进这 9 张共用表,它们现在会捞到高中数据**。这些就是用户说的"要单独处理"的。

> ★★ Aaron 决定(2026-06-27):**Phase 2 只动高中侧,初中一律不碰。下面 N1-N7 全部保持原样、一个字不改。**
> 理由:初中显示是 Aaron 审核过的正确状态,初中代码和初中数据都没变,继续正常工作;出版社分叉只为高中加外研社/上外,不需要动初中。
> 以下 N1-N7 仅作"已知现状"记录,**本期不修**。★★

### 🔴 裸查(无 grade/volume/category 过滤 → 现会捞到高中)—— ❌本期不修(初中侧,保持现状)
| # | 文件:行 | 表 | 现状 | 影响 | 建议 |
|---|---|---|---|---|---|
| N1 | `corpusTotals.ts:31` `countJuniorVocabCorpus` | junior_vocab | `count(*)` 无过滤 | 初中词汇总数 2016→**4140**(被 1706 高中词撑大),初中进度分母虚高 | `.eq('publisher','junior')` |
| N2 | `corpusTotals.ts:52` `fetchVocabCorpusIds('junior')` | junior_vocab | 整表分页拉 id | 同上,初中掌握度分母污染 | `.eq('publisher','junior')` |
| N3 | `useMasteryOverview.ts:316` | junior_grammar_points | `.not('unit','is',null)` 无 grade/stage | 跨学段:初中语法总题数含高中点 → 初中语法掌握%分母虚高 | 按 stage 分流(junior→`publisher='junior'`) |
| N4 | `JuniorGrammar.tsx:80` | junior_grammar_points | `.order('sort_order')` 无过滤 | 初中语法主页拉到高中点(若按 category 渲染或可遮掉,仍应收口) | `.eq('publisher','junior')` |
| N5 | `JuniorGrammarRevenge.tsx:49` | junior_grammar_points | 无过滤 | 初中错题复习池含高中点 | `.eq('publisher','junior')` |
| N6 | `juniorGrammarContinue.ts:46` | junior_grammar_points | 无过滤 | 初中语法续练含高中点 | `.eq('publisher','junior')` |
| N7 | `JuniorGrammarLab.tsx:1181` | junior_grammar_points | 无过滤(实验室点列表) | 拉到高中点 —— **待确认 Lab 是否对学生开放**(若纯 admin/作者台则同 admin 不动) | 视访问面定 |

> N1/N2/N3 是**数值泄漏**(无下游 category 过滤,直接进计数),最该修;N4–N6 可能被下游 category 渲染遮掉,但查询层应一并收口;N7 看访问面。

### 🟢 admin 裸查 = 故意(不动)
- `AdminGrammarContent.tsx:107/111` 整表拉 points/questions:管理台本就要看全部 publisher,**保持裸查,不加过滤**。

### 🟡 条件 grade(靠调用方传初中 grade 才安全 —— 真改时确认调用方恒传)
- `JuniorReading.tsx:39` / `juniorHub/JuniorReading.tsx:40` / `JuniorListening.tsx:79` / `JuniorWriting.tsx:16`:都是 `if (grade) q=q.eq('grade',…)`。初中页路由恒带 grade(7/8/9)→ 实际安全;但"无 grade 兜底就裸查"是潜在风险,真改时确认这些页恒传初中 grade(我倾向顺手补 `.eq('publisher','junior')` 双保险,零风险)。

### ✅ 确认安全(带 id/code/kp_id/point_id/category 过滤,初高中天然不混)
- 按 `id`:`JuniorGrammarPoint:128/136`、`JuniorGrammarKpQuiz:57`、`JuniorGrammarMastery:114/128`、`JuniorGrammarLab:1162/1171`、`juniorGrammarUnits:86`、`JuniorReadingPlay:87` 等
- 按 `code`:`useGrammarPointId:23`、`JuniorGrammarMastery:120`、`juniorGrammarUnits:100`(code 现含册前缀,初高中不撞;真改时这些 SHARED 的可选加 publisher)
- 按 `kp_id`:`juniorKnowledgePoint:123`
- 按 `point_id`(继承):所有 questions 查询
- 按 `category_id`:`JuniorKpPracticeSection:46`(初中 category 不含高中)
- 按 `grade`(无条件):`JuniorVocab:73`

---

## 待 Aaron/你核的点
- P3/P4/P5(cloze/listening/writing Play)是否纯按 id 取?若有"按 grade 列下一篇"才需分流 —— 我真改前会逐个读确认。
- S3(listening_items)senior 无数据,确认 finalQuiz 听力 senior 实际走 listening_exercises(S7 路径),listening_items 维持初中现状。
- 共用组件分流信号:统一用 `basePath` 还是 `grade`?(我倾向 basePath,最显式;grade 作兜底)。
