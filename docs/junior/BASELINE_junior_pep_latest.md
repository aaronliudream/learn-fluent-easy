# 初中人教「当前基线」考古报告 — 外研社 Phase 2 对齐基准

> 目的:外研社(FLTRP)内容生产必须对齐**距今最近**的人教初中做法,不是 5–6 月的早期做法。
> 本轮**只调查、零改代码**(除本报告)。所有结论带 commit / 文件:行号 为证。
> 生成日期:2026-07-19 · 分支 `feat-junior-fltrp`(不 push,等 Aaron 审)
> 调查方式:git log 时间倒排 + 三路并行 agent 读码取证(错题链路 / 掌握度互通 / 老师端 RPC)。

---

## 1. 基线单元指认(按日期,不按文件名猜)

| 角色 | 单元 | commit / 日期 | 特征 |
|---|---|---|---|
| **最新基线** | 初三 **g9 U1–U14**(收官 U14) | `c958f9e1` · **2026-06-22** | 全 DB 驱动 · 9 关(含完形)· `grammarCodes` · 听力 audio 预生成 · 字段名锁死 |
| 权威规范 | `docs/G9_DATA_SPEC.md` | 更新 2026-06-22 | volume 键锁死 + 灌库铁律 + §12 JSON 字段规范 |
| 最早对照 | 初一 **g7 七上**(Starter+U1) | `503aafd4` 等 · 2026-05-31~06-02 | JSON 内联为主的老做法 · `available` 逐个翻真 |

**外研社 7A/7B/8A/8B = 初一/初二**,对应人教 **8 关**(无完形),但**做法(约定)全部跟最新 g9 那套**(见 §4),只是关数用 8 关、册键用 `wy7A…`。

> ⚠️ 注意:`docs/G9_DATA_SPEC.md` 是按 g9(9 关/每单元 60 语法题/6 篇阅读完形听力)写的。外研社 7-8 年级**关数=8(无完形关)**,每单元的 vocab/阅读/听力**题量随课本实际**,不硬套 g9 的"60/6/6"。约定(字段名/键规则/DELETE 事务/audio 预生成)照搬,数量按册。

---

## 2. 8 关错题写入链路(最新基线,带文件:行号)

**架构关键事实:初中错题有两条互不重叠的路**——
- **`addMistake(...)`**(`src/lib/juniorHub/context.tsx:106-128`)→ **只写 localStorage**(`JuniorHubPersist.mistakes`),云同步仅作为 `junior_hub_progress.state` 里的不透明 blob,**永不进 DB 错题表**。
- **`recordUnifiedAttempt(...)`**(`src/hooks/useRecordAttempt.ts:50-78`)→ POST `record-attempt` edge → 唯一落 `user_mistakes`(可复核/老师端)的路。
- hub 的阅读/听力/完形关是**卡片列表跳出**到独立 play 页(`/junior/reading|listening|cloze/:id`),DB 写在 play 页,不在 `JuniorHubStagePlay.tsx`;hub 内联 `onWrong→addMistake` 只在**无 DB 内容的回退分支**触发。

| 关 | 答错写错题? | 落表 | module 值 | snapshot | 前端/edge | 文件:行 |
|---|---|---|---|---|---|---|
| s1 vocab | 否(翻卡浏览,不判分) | `junior_word_mastery`(记"看过") | — | — | 直连 FE | `JuniorHubStagePlay.tsx:330`;`juniorWordMastery.ts:141` |
| s2 listenWord | **仅 localStorage** + 词计数 | LS `mistakes` · `junior_word_mastery` | 无 | LS 全字段(q/opts/answer/audio) | FE(**无 edge/无 user_mistakes**) | `JuniorHubStagePlay.tsx:2148-2159` |
| s3 match | **答错什么都不写** | — | — | — | — | 派发 `:2162`(无 onWrong);仅记成功 `:491` |
| s4 grammar | DB 掌握度(薄 qid) | `junior_user_mastery`(`grammar_point`/`grammar_kp`)+ `wrongQ[]` | 无 | **薄**:只存 question_id,题干后补拉 | FE | `JuniorUnitGrammarTest.tsx:99`;`juniorGrammarFsrs.ts:249` |
| s5 reading · DB 路径 | **是** | `junior_reading_attempts` + `user_mistakes`(edge) | `"reading"` | attempts 全;user_mistakes **题干空/无选项**(未传 `context.question`) | FE + edge | `JuniorReadingPlay.tsx:139-163` |
| s5 reading · 内联回退 | **仅 localStorage** | LS `mistakes` | 无 | LS 全字段 | LS | `JuniorHubStagePlay.tsx:2180-2189` |
| s6 listening · DB 路径 | **是** | `junior_listening_attempts` + `user_mistakes`(edge) | `"listening"` | 同阅读:**题干空** | FE + edge | `JuniorListeningPlay.tsx:111-135` |
| s6 listening · 内联回退 | **仅 localStorage** | LS `mistakes` | 无 | LS 全字段 | LS | `JuniorHubStagePlay.tsx:2216-2226` |
| s7 writing | 否(提交即 pass,`is_correct:true`) | `junior_writing_attempts` + `unified_mastery_manual` | `"writing"` | 全 essay+score | FE + edge(永不生成 mistake) | `JuniorHubStagePlay.tsx:1904-1928` |
| s8 finalQuiz | **仅 localStorage**(+语法掌握度) | LS `mistakes`;grammar→`junior_user_mastery` | 无 | LS 全字段 | LS + FE | `JuniorHubStagePlay.tsx:2256-2275` |
| s9 cloze(仅 g9) | **无可复核错题** | 仅 `mastery_progress` 聚合 best-pct | — | 无 | FE | `JuniorClozePlay.tsx:74` |

**学生端错题本(`JuniorHubMistakes.tsx`)只读 localStorage**(`state.mistakes`,`:5/:18/:38`),**不查任何 DB / RPC**。→ 学生看到的 = listenWord/内联阅读听力/finalQuiz 的 LS 错题;看不到 DB 的阅读/听力、语法 wrongQ、完形。

---

## 3. ★关键★ 老师中心可见性(RPC 真身 + 排除名单)

> ⚠️ **这两个 RPC 和全部 `SQLAA/PHASE*` 排除脚本都在 `main` 上,不在工作分支**。以下引自 `git show main:…`。

**最新生效定义 = `SQLAA/PHASE7_exclude_bare_grammar_writing_phonics.sql`(2026-07-11 01:39)**,`CREATE OR REPLACE` 链上最后一个,承接 PHASE6/PHASE3/PHASE2。

`get_student_mistake_counts` / `get_student_mistakes` 对 `user_mistakes`(源1)的**排除谓词(逐字)**:
```sql
where um.user_id = _student_id and um.is_resolved = false
  and um.module not in ('cloze','reading','listening','vocab','grammar','writing','phonics')
  and um.module not like 'primary_%'
```
- **精确集 `not in`(非 LIKE)是故意的** → 带前缀的变体全部**保留**:`senior_grammar` / `gaokao_grammar` / `hub_listening` / `junior_cloze` / `american_scenario` …
- **重路由(非真隐藏)**:`cloze`→源2(`gaokao_user_mistakes` 按篇);`reading`→源3A/3B(快照 `junior_reading_passage_%` + 旧 `junior_reading_attempts` 按篇);`listening`→**源1 全隐**,完整快照替身写在 `hub_listening`(保留)下。

### module → 老师端可见性表(初中写入)

| module | 初中谁写 | 老师端可见? |
|---|---|---|
| `vocab` | JuniorVocab / stageVocabStats | **否**(在 not in 集) |
| `grammar` | JuniorGrammarPoint/Lab/Continue | **否** |
| `writing` | JuniorWritingPlay:99 · StagePlay:1922 | **否** |
| `phonics` | (小学,无初中写) | **否** |
| `reading` | JuniorReadingPlay:155 | 源1 排除,**经源3A/3B 按篇重现** → 显示 |
| `listening` | JuniorListeningPlay:127 | 源1 全隐;替身走 `hub_listening`(保留) |
| `cloze` | junior cloze play | 源1 排除,**经源2 重现** → 显示 |
| `senior_grammar`/`gaokao_grammar`/`hub_listening`/`junior_cloze` | 高中/快照写入器 | **是**(保留) |
| `primary_%` | 小学 | **否**(not like) |

### 老师端 RPC 真身 SQL(给 Aaron 跑 · 确认 DB 现况是否 == PHASE7)
```sql
SELECT p.proname, pg_get_functiondef(p.oid) AS definition
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('get_student_mistake_counts','get_student_mistakes')
ORDER BY p.proname, p.oid;
```
把返回的 `not in (...)` 与 PHASE7 的 `('cloze','reading','listening','vocab','grammar','writing','phonics')` + `not like 'primary_%'` 逐字对比,确认 PHASE6/PHASE7 是否已在 DB 跑过。

---

## 4. 新旧做法差异(最新 g9 vs 最早 g7 七上)

| 维度 | 老做法(g7 七上 · 5-6月) | 新做法(g9 · 6/22) | 外研社跟哪个 |
|---|---|---|---|
| 题目来源 | JSON 内联为主(`unit.reading`/`grammarQuiz` 等) | **全 DB 驱动**,内联仅 dormant 回退 | **新:全灌 DB** |
| 语法挂载 | `grammarCode`(单数) | **`grammarCodes[]`**(复数,设了才走 DB);删 `grammarCode` 残留 | 新:`grammarCodes` |
| volume 键 | 早期漂移(g9 曾 `'g9'` vs `'9'` 分裂) | **锁死单一键**(g9=`'9'`) | 新:外研社锁 `wy7A/wy7B/wy8A/wy8B` |
| 灌库 | 早期无 commit 记录 | **DELETE+INSERT 同事务 + 每批 count 校验 + SQL 提交仓库** | 新:同事务幂等 |
| 阅读/听力持久化 | 内联回退 → **不进 DB,错题/掌握度全断** | DB 行带 `volume/unit` → 卡片跳 play 页,attempts+mastery 落库 | **新:必须 DB(否则互通全断)** |
| JSON 字段 | 早期变体(topic/q/list scoring) | **§12 锁死**:`genre`≠topic、`stem`≠q、`vocab_notes` 必填、`translation_cn` 必填、`scoring`=dict | 新:严格 §12 |
| 听力音频 | — | `pregenerate` 脚本 `--volume` 过滤 `audio_url IS NULL` → 回填 | 新:预生成 audio_url |
| 质检 | 无统一 | **`scripts/qc-unit.mjs` 硬闸**(见 §5) | 新:必跑 |

---

## 5. ★外研社 Phase 2 必遵守清单(=验收标准)★

**A. 键与隔离(命名铁律,灌前 grep 确认)**
1. `publisher='junior_fltrp'`(**不复用高中 `fltrp`**);`volume∈{wy7A,wy7B,wy8A,wy8B}`;`unit` 用课本原文(`Starter/U1…`);`grade∈{7,8}`。
2. 语法点 `code` **全 `wy` 前缀**(防与人教 code 撞、防语法总览页串 tab)。
3. DELETE **必带** `publisher='junior_fltrp' AND volume='wyXX'`,绝不动人教行;DELETE+INSERT **同一事务**;可重跑幂等。照抄 `scripts/fltrp-required1-u1-load.sql` 写法(高中版,改 publisher/volume/grade)。

**B. 内容必须进 DB(互通前提,§7 证据)**
4. 阅读、听力**必须灌 `junior_reading`/`junior_listening_exercises` 且带 `volume=wyXX`+`unit`**——否则单元关走内联回退,错题/掌握度两头全断。**绝不 JSON 内联交付**。
5. 语法单元 JSON 设 `grammarCodes=['wy7u1.01',…]`(设了才走 DB);`grammarCode`(单数)置 `null`。

**C. 字段与结构(§12 锁死)**
6. reading:`genre`(非 topic)、`stem`(非 q)、**`vocab_notes` 每篇 3 生词必填**;listening:**`translation_cn` 必填**、`type∈{dialogue,passage}`/`kind∈{long,short}`/`speaker∈{us_male,us_female}`;writing:`scoring`=dict。
7. 关数 = **8 关**(核心词汇→听辨→配对→语法→阅读→听力→写作→通关),**无完形关**(完形是 g9 专属)。
8. 音标:初中基线用**英音 IPA**(与人教初中一致);听力音色若沿用 g9 则 `us_*`,**外研社是否改英音由 Aaron 定**(见 §6 待定)。

**D. 质检硬闸(入库前必跑)**
9. `node scripts/qc-unit.mjs --dir … --vol wyXX --unit UN`:选项数=4 / 无重复选项 / 答案在选项内 / 无空选项 / 答案分布不偏斜(≥8题:无某位为0且单位≤40%)/ 无≥4连同位 / 语法应用型(禁术语题·禁中文选项)/ 阅读答案不照抄正文(≥5词连续子串)。0 FAIL 才生成灌库 SQL。
10. 词汇题语义对应铁律:题干中文释义↔标答英文一一对应、答案唯一、干扰项同类但都错,逐题回读自审。

**E. 落库前置双键断言(§7.3,每个灌库 SQL 末尾附,任一 ≠0 = 失败)** — 见 §7.3。

**F. 落库审核门槛**
11. 教学内容(chunk/句型/情景题/阅读听力语法)造完**先贴 Aaron 审 + 核课本**才落库;SQL 只 Aaron 跑;每单元真机抽验 8 关 + 6 大专项(确认人教侧条数没变);同步 SQL→`SQLAA/`、待审 JSON→`REVIEWAA/`。

---

## 6. ★待修缺陷(本轮不修 · 发现即上报)★

> 以下多为**跨学段共用组件的历史遗留**,改动波及小学/初中/高中,须单开分支单独验收。外研社 Phase 2 **继承同样行为**,不因外研社而恶化,但 Aaron 应知情。

| # | 缺陷 | 证据 | 影响 / 性质 |
|---|---|---|---|
| D1 | **`useMasteryOverview` 分母硬编码 + 分子无 publisher 过滤** | `useMasteryOverview.ts:44-48`(`junior:{vocab:2016,…}`);分子仅按 user_id,`:191/221/250/269/304` | 灌外研社后:pep+fltrp 混学生**可 >100%**;纯 fltrp 学生分母是人教数**无意义**。**详见 §7.2** |
| D2 | **match(s3)答错什么都不写** | `JuniorHubStagePlay.tsx:2162`(无 onWrong) | 配对关错题永久丢失 |
| D3 | **finalQuiz/listenWord/内联阅读听力 只写 localStorage** | `:2148/2181/2217/2267` | 换设备/清缓存即丢;老师端永不可见 |
| D4 | **cloze(s9)无可复核错题** | `JuniorClozePlay.tsx:74` | 只有聚合 best-pct,错题不入册 |
| D5 | **DB 路径阅读/听力 user_mistakes 题干空** | `JuniorReadingPlay.tsx:162`/`JuniorListeningPlay.tsx:134` 未传 `context.question` | 老师端(经快照union)能看到答案+解析,**看不到题干和选项** |
| D6 | **学生错题本只读 localStorage** | `JuniorHubMistakes.tsx:5/38` | 与 DB/老师端不同源;跨设备错题看不全 |
| D7 | **finalQuiz 语法只写 grammar_point 不写 grammar_question** | `JuniorHubStagePlay.tsx:2256-2263` | finalQuiz 里练的语法**不推动板块 grammar 计数**(板块只数 grammar_question) |
| D8 | **⚠️工作分支 edge 无 SKIP_BARE_MODULES 护栏** | 本分支 `record-attempt/index.ts:154-172` 无护栏;`main` 有 `:154-160` | **若从本分支部署 edge**:vocab/grammar/writing 裸 module 会写进 user_mistakes 又被 PHASE7 静默排除 → "学生看得到、老师永远看不到"。**不要从此分支部署 edge**(edge 走 main) |

> D1 是外研社灌数据前**唯一强相关**的必修项(其余是 pep 既有,外研社不新增)。D8 是部署纪律提醒。

---

## 7. 课程 ↔ 板块 掌握度/完成度 互通链路

### 7.1 互通三键现状表(agent 取证,均 file:line)

| 维度 | 共享键 | 单元侧写 | 板块侧读 | 通? |
|---|---|---|---|---|
| 词汇 | `junior_vocab.id`→`junior_word_mastery.word_id` | `useUnitVocab.ts:52` 携 id 原样;写 `juniorWordMastery.ts:126` | `useUnitVocab.ts:116` 按 word_id | ✅ 双向 |
| 语法 | point `code`→id + question id | `JuniorUnitGrammarTest.tsx:90/99` 写 grammar_question+grammar_point | `juniorGrammarUnits.ts:114` 读 grammar_question(`loadProgressForCodes`) | ✅ 双向 |
| 阅读 | `junior_reading.id`→`reading_id` | 卡片跳 `/reading/:id`;`JuniorReadingPlay.ts:139/177` | `masteryProgress.ts:81` `loadMastery("junior_reading")` | ✅ 双向 |
| 听力 | `junior_listening_exercises.id`→`exercise_id` | 卡片跳 `/listening/:id`;`JuniorListeningPlay.ts:80/111` | 同上 `junior_listening` | ✅ 双向 |
| 写作 | `prompt_id` | 单元 WritingStage **未见写 attempts** | `useMasteryOverview.ts:269` | ⚠️ 弱/单向 |

**结论**:vocab/grammar/reading/listening **通过真 DB 主键双向互通**——但**仅当内容行 `volume`/`unit` 已回填**。最新 g9(`volume='9'`)= DB 支撑 ✅;老 `7A`/`Starter` 走无 id 的 JSON 回退→**两头都不通**(`JuniorHubStagePlay.tsx:1466/1642` fallback 分支)。
→ **外研社所有阅读/听力/语法必须灌 DB 带 `volume=wyXX`,互通开箱即用**(见 §5-B4)。

### 7.2 ★D1 详解 + 修法评估(灌数据前必决)★

**根因**:`junior_word_mastery` **无 `publisher`/`volume` 列**(`types.ts:3805-3855`,只有 `grade`)。`grade=7` 无法区分人教 g7 与外研社 wy7A。publisher/volume **只在 `junior_vocab`**(`useUnitVocab.ts:29-32` 证明其存在;checked-in `types.ts` junior_vocab Row 是**旧的**,漏了 publisher/volume,但运行时查询证明 DB 有)。

**修法两条路(本轮不改,Aaron 定单开分支)**:
- **(a) 分子加 join**:junior vocab 计数 `junior_word_mastery JOIN junior_vocab ON word_id=id WHERE junior_vocab.publisher=?`;语法经 `junior_grammar_points.publisher`;阅读/听力经内容表 `publisher`(`mastery_progress`/attempts 表自身也无 publisher)。**这是唯一可行方向**——`junior_word_mastery` 单表做不到 publisher 过滤。
- **(b) 分母去硬编码**:`TOTALS` 改按 publisher 实时 `count(*)`(防以后再加沪教/译林又踩)。

**优先查清并已确认**:publisher 过滤**必须** join 内容表——这决定了修法工作量,是 Phase 2 能否开工的前置。`useMasteryOverview` 三学段共用,改它波及小学/高中,**单开分支单独验收**。

### 7.3 灌库前置双键断言(每个外研社 SQL 末尾必附,任一 ≠0 即失败)

```sql
-- ① wy* volume 但 publisher 不对 → 单元取得到、板块取不到
SELECT 'vocab_volume_orphan' chk, count(*) n FROM public.junior_vocab
 WHERE volume LIKE 'wy%' AND publisher <> 'junior_fltrp'
UNION ALL
-- ② junior_fltrp 但 volume 不是 wy* → 板块取得到、单元取不到
SELECT 'vocab_publisher_orphan', count(*) FROM public.junior_vocab
 WHERE publisher = 'junior_fltrp' AND volume NOT LIKE 'wy%'
UNION ALL
SELECT 'gp_volume_orphan', count(*) FROM public.junior_grammar_points
 WHERE volume LIKE 'wy%' AND publisher <> 'junior_fltrp'
UNION ALL
SELECT 'gp_publisher_orphan', count(*) FROM public.junior_grammar_points
 WHERE publisher = 'junior_fltrp' AND volume NOT LIKE 'wy%'
UNION ALL
-- ⑤ code 前缀铁律:外研社语法点 code 必须全 wy 开头
SELECT 'gp_code_prefix_bad', count(*) FROM public.junior_grammar_points
 WHERE publisher = 'junior_fltrp' AND code NOT LIKE 'wy%'
UNION ALL
-- ⑥ 反向哨兵:人教行绝不能被误标成 wy*(灌库 WHERE 写错的兜底)
SELECT 'pep_row_polluted', count(*) FROM public.junior_vocab
 WHERE publisher = 'junior' AND volume LIKE 'wy%';
```
阅读 / 听力 / 写作 / context_questions 各表照此模板补齐(表名+列名替换)。

---

## 8. 待 Aaron 决策 / 核实

1. **D1 `useMasteryOverview` 修法**:本轮修还是 Phase 2 前单开分支修?选 (a) 分子 join 还是 (a)+(b) 分母也去硬编码?(共用组件,单独验收)
2. **老师端 RPC 现况**:跑 §3 的 `pg_get_functiondef` SQL,确认 PHASE6/PHASE7 是否已在 DB 生效(SQLAA 文件 ≠ DB 真身)。
3. **外研社音标/听力音色**:初中英音 IPA 确认;听力 `speaker` 沿用 g9 `us_*` 还是改英音?
4. **旧版无标注八下**:Phase 2 生产前从素材目录(`OneDrive/英语教材/初中英语教材/外研社`)挪走,防 Module 制混进 Unit 制。
5. **D8 部署纪律**:edge function 只从 `main` 部署,勿从 `feat-junior-fltrp` 部署(本分支 edge 缺 SKIP_BARE_MODULES 护栏)。

---
*报告完 · 零代码改动 · 提交 `feat-junior-fltrp` 待审*
