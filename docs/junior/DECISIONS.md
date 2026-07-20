# 初中外研社(FLTRP)分叉 — 决策记录

> 与 `docs/american/DECISIONS.md` 同级。Aaron 拍板项,后续窗口照此执行,别重议。
> 配套:Phase 1 状态见 `docs/junior/BASELINE_junior_pep_latest.md`。

---

## Phase 1(骨架)状态
- 分支 `feat-junior-fltrp`(=main + 2 commit:骨架 + 基线报告),已 push,Vercel 预览受 SSO 保护(owner 可看)。
- **3 项 pre-push 检查已用真库数据核验通过**(2026-07-19):
  - ① 详情页 by-id 无 publisher 过滤 → senior(sufe/required1)行按 id 仍 HIT ✓(老错题/收藏/分享链接不坏)。
  - ② `/junior/grammar`(pep)只剩 `[7A,7B,8A,8B,9]`,默认 tab `7A` 存在 → 不会选到已消失 tab;改动前会多漏 `[required1-3, elective1-4]`(sufe/pep/fltrp 高中卷)。
  - ③ 全部模式非空:junior_reading 305 / listening 447 / writing 74(移除 senior 636/636/106);vocab grade=7 严格等价(822=822,差0)。
- **merge-main 仍 gated**,等 Aaron 说「合」。

---

## 五项关键决策(2026-07-19 Aaron 拍板)

### ① D1 `useMasteryOverview` 修法 —— Phase 2 之前单开分支,不进本轮
- 三学段共用,混进 `feat-junior-fltrp` 会把验收面积炸成小学+初中+高中。
- **但必须在灌任何外研社数据之前修完**,否则一灌就错(混学生 >100% / 纯 fltrp 分母无意义)。
- 分两步(同一新分支):
  - **步骤 a(先挡错)**:分子 JOIN `junior_vocab`(经 `word_id=id`)取 publisher 过滤;语法经 `junior_grammar_points.publisher`;阅读/听力经内容表 publisher。(`junior_word_mastery` 无 publisher/volume 列,单表做不到,已核实。)
  - **步骤 b(去硬编码)**:分母改按 publisher 实时计数;**做成一个 RPC 一次返回全模块计数**,别每模块一次 count(否则 dashboard 首屏多 5-6 个往返)。

### ② 老师端 RPC 真身 SQL —— 现在就跑(只读零风险)
- Phase 2 前置依赖:module 可见性没确认,外研社的题写进去可能老师端全隐形。
- SQL(见基线报告 §3,复制即跑):`SELECT p.proname, pg_get_functiondef(p.oid) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname IN ('get_student_mistake_counts','get_student_mistakes');`
- 对照 PHASE7 排除集 `('cloze','reading','listening','vocab','grammar','writing','phonics')` + `not like 'primary_%'`,确认 DB 是否已生效。

### ③ 听力音色 —— 沿用 `us_*`,但做成分册可配字段
- 现全站统一 `us_*`(避免按出版社永久分叉维护成本)。
- **但把音色做成分册可配**:灌库时存 `voice` 参数(如 listening 行/册配置),**不在代码里硬编码**。
- 将来两条路都留:全局"用户可选音色" 或 改一行配置切某册英音。

### ④ 旧版无标注八下 —— 已删除(Aaron 已处理)
- 素材目录现只剩 **七上/七下/八上/八下(全 2024 新版 Unit 制)** 四册,无 Module 制混入。
- 路径:`C:\Users\willi\OneDrive\Desktop\英语教材\初中英语教材\外研社`。

### ⑤ D8 部署纪律 —— 固化(见下「铁律」)

---

## ★铁律:edge function 部署 + 本分支目录权限★
1. **edge function 只从 `main` 部署**。任何 feature 分支**禁止** `supabase functions deploy`。
   - 原因:`main` 的 `record-attempt` 有 `SKIP_BARE_MODULES` 护栏(跳过 vocab/grammar/writing/phonics 裸 module 的 user_mistakes 写);**本分支 `feat-junior-fltrp` 的 edge 缺此护栏** → 若从本分支部署,裸 module 错题会写进库又被 PHASE7 静默排除("学生看得到、老师永远看不到")。
2. **本轮 `feat-junior-fltrp` 上 `supabase/functions/` 目录只读**,一个字不改、不部署。

---

## 超出外研社、需单独排期的两条(优先级高于外研社)

### P0-A ★比 D1 更严重★ 学生错题本只读 localStorage(`JuniorHubMistakes.tsx:5/38`)
- 换设备/清缓存/换浏览器 → 错题全丢;且学生端(localStorage)与老师端(user_mistakes)**不是同一份数据**,家长/老师一对账露馅。
- **已在影响现有付费转化路径**,不是外研社问题,优先级排在外研社**之前**。

### P0-B 老 7A/Starter 走 JSON 内联回退 → 回填进 DB(带 volume/unit)
- Starter 是新用户第一次进来必碰的单元,恰好错题+掌握度两头断 → 漏斗最上层体验最差。
- **Phase 2 开工前顺手把 7A/Starter 内容回填 DB**(带 volume/unit),成本低收益直接。

---

## Phase 2 前必补(2026-07-19 眼验时 Aaron 捞到 · 详情页里的过滤缺口)

### A. `JuniorReadingPlay.tsx:97-99` "上一篇/下一篇"按 grade 取兄弟篇,无 publisher 过滤
- `select("id,title").eq("grade", grade)` 无 `.eq("publisher",…)` → 外研社阅读一灌进去,学生点"下一篇"会跳进人教文章("翻着翻着换教材了")。
- 和 5 个列表页同一类缺口,只是藏在详情页。**灌外研社阅读数据前必补**。
- ✅ CC 已核实:`JuniorListeningPlay.tsx` **无**兄弟篇导航(只 `.eq("id",id)` by-id 取),故 A **仅阅读 Play**,听力 Play 无此问题。

### B. `JuniorWritingPlay.tsx:99` 写 `module:"writing"` 裸值 → 老师端看不到写作错题(★全站写作板块从上线起半瘫★)
- 已坐实:`main` 源码 PHASE7 排除集含 `writing`(`not in (…,'writing',…)`),而 WritingPlay:99 写的正是裸 `writing` → **全站写作错题老师端一条都看不到,从来如此**(D 系列活体样本)。
- ★修法(Aaron 定,别踩坑)★:
  - **正确=改写入侧**:写作提交时 `module` 用带前缀值 `junior_writing` + 带完整 snapshot → 天然落保留名单(和 `senior_grammar`/`hub_listening` 一个路子)。RPC **一行不用动**,老薄行也不会被翻出来。
  - **禁止=去 RPC 排除集里删 `writing`**:那个排除集是挡 edge 写的无 snapshot 薄行的;放行 = 把"(无题目快照)"残卡重新放出来。
- 写作板块坑,非外研社独有;修一次 pep+fltrp 两家受益。

---

## ★Phase 2 错题写入 module / source_key 命名表(2026-07-19 Aaron service-role RPC 实证后锁死)★

> RPC 实证:两函数都在,排除集**精确=7 裸值 `('cloze','reading','listening','vocab','grammar','writing','phonics')` + `primary_%`**,两函数条件完全一致,与 main PHASE7 文件对得上(PHASE6/7 已真部署,最后那版)。
> ⚠️ **纠正我(CC)之前"module 一律带前缀"的过度概括——对阅读是错的**。阅读走双条件捞回,前缀化即崩。

| 板块 | module 值 | source_key | 依据 |
|---|---|---|---|
| **阅读** | **裸 `reading`** | **必须 `junior_reading_passage_<uuid>`**(uuid=`junior_reading.id`,**绝不加 wy 前缀**) | 源3A 双条件匹配:`module='reading' AND source_key LIKE 'junior_reading_passage_%'`。module 前缀化→散行不聚篇、与人教形态不一致;source_key 前缀化→整篇消失、掉进源3B 无快照残卡 |
| **写作** | 带前缀 `junior_writing` | 沿用基线 | 裸 `writing` 被排除且**全 union 无补回源**(B 实锤) |
| **听力** | 带前缀(`hub_listening` 或基线实际值) | 沿用基线 | 裸 `listening` 被排除;替身走 hub_listening(保留) |
| **词汇 / 语法** | 带前缀 | 沿用基线 | 裸 `vocab`/`grammar` 被排除 |
| 完形 | —— | —— | 初中 8 关无完形,不涉及 |

**两条铁律**:
1. 具体前缀值**一律照抄基线报告 §2 表里最新人教单元实际在用的那个**,**不要发明新值**(新前缀虽能过排除集,但会在老师端多出孤立模块分类,学生端/老师端可能对不上)。
2. **阅读 snapshot 必须带完整 `questions` 数组**——源3A 直接读 `um.snapshot->'questions'`,缺了就是空壳整篇。

> 阅读的"新快照篇 + 无快照旧篇去重 + 源3B 曾有整篇行则永久压住不复活"这套双源合并 Aaron 确认写得很细,外研社**直接继承,不重做**。

---

## Phase 2 · 七上(wy7A)结构锁定 + grammarCode 命名 + 抽取发现(2026-07-19 · Aaron 从真文本层 PDF 锁定)

> 七上 PDF = 真文本层(InDesign 直出,非扫描),Scope and sequence 完整抽出。CC 报的六个标题**全对,JSON 不改**。

**grammarCode 命名(锁死):**
```
wy7-starter-basics          （Starter 综合,7 个点合一条）
wy7-u1-pronouns
wy7-u2-simple-present
wy7-u3-possessive-nouns
wy7-u4-adverbs-of-frequency
wy7-u5-simple-future
wy7-u6-present-continuous
```
- **Starter 合一条**(不拆 7 条):Starter 是小初衔接复习性质、7 点都浅,拆开会让语法板块出现 7 个"练两三题就满级"的条目。

**抽取发现(影响 Phase 2 数据生产):**
- ① **IPA 现成,可机器抽**:`Words and expressions` 附录(p150 起)每词自带 `word /ipa/ pos 释义 首现页码`(如 `explore /ɪkˈsplɔː/ v. 探索…… 9`)。**不像 G9 要手工补 IPA**,词汇关数据近乎直接机抽。
- ② **"课标三级词汇"标记抽不出**:附录用**加粗**表示三级词汇,加粗是视觉属性、文本层丢失 → 要标此字段需逐页视觉识别 150+ 页。**本轮不做此字段**,backlog,有需求再单独一轮。
- ③ ⚠️ **外研社 5 板块 vs 8 关模板对不上(Aaron 定)**:
  - 能对上:Reading→s5 · Grammar→s4 · Listening and speaking→s6 · Reading for writing→s7 · 词汇→s1/s2/s3 · finalQuiz→s8。
  - **Phonetics 音标**(外研社每单元必有,8 关无):**本轮不做**——塞进 s2 listenWord 会稀释定位;单开第 9 关要动 8 关模板(人教共用,一动就把验收面扩到人教全单元)。**backlog**,等外研社跑通再评估要不要单加第 9 关。
  - **Presenting ideas 产出任务**(做海报/做计划):**直接不做**,课堂产出活动、非可判分题。

---

## Phase 2 词表抽取规约（外研社初中 · 铁律）

> 2026-07-19 定。Unit 1 词表(35 条)已按此逐条核过、Aaron 全通过。

### 抽取管线分工
- word / pos / meaning_cn / first_page → 文本抽取（pdfplumber 位置排序）
- IPA → **一律走视觉闸**，禁止采信任何文本抽取结果
  依据：pdftotext 吃掉 IPA 特殊字符（sentence→/sentns/）；
  pdfplumber ~97% 但残留乱序是静默的（sentence→/ˈsenət ns/）。
  单管线自检永远报 100%，不构成证据。
- 附录仅 8 页（七上 PDF p155–162），视觉逐条核成本可控。

### 双栏切分
附录为双栏，每栏内含 [词条+释义][页码] 两个子栏。
必须先按 x 中线切栏、再各栏纵向解析。
横向粘连是典型故障征兆（如 "ready … 3  人人 9"）。

### 跨行释义拼接
匹配 headword 行后，后续"不含 /ipa/、非新 headword、非孤立页码"的行 = 释义续行；
行尾或孤立的 1–3 位数字 = 首现页码，遇到即封口。
Unit 1 有 10 条跨行（meaning/important/problem/homework/project/
advice/journey/something/through/towards），可作回归用例。

### 校验闸
- 机械扫描：IPA 内含空格 → 标红人工核。
  白名单：多词条目合法带空格（T-shirt /ˈtiː ʃɜːt/）。
- 回归用例：sentence 必须为 /ˈsentəns/。

### ★照抄铁律★
教材注音一律照抄，**禁止依据通用词典"纠正"**。
实例：外研社七上 mistake = /məˈsteɪk/（非通用的 /mɪˈsteɪk/）。
质检脚本不得拿外部词典做 IPA 正误判定，只做格式合法性检查。

### 字段约定
- 无音标短语（point out / in fact / primary school 等）：
  ipa 与 pos 存 **null**，不存空串、不存 "—"（防前端渲染出破折号）。
- 释义清理全角括号后的多余空格：「n.（ 学校的）」→「（学校的）」。
- 课标三级词汇加粗标记：文本层不可恢复，本期**不做该字段**。
- 落库字段：publisher='junior_fltrp' / volume='wy7A' / unit='U1' / grade=7。

---

## ★s4 语法出题铁律(2026-07-19 Aaron 定 · U1 定稿时锁死)★

1. **source_type=③(DB 不存,只审核层留痕)**:题目 `source_type` 一律 `authored`。改编来源/设计意图等**只写进 REVIEWAA md 的“审核备注”行**,**绝不进 DB 的 `explanation` 字段**。已答三次,不再问。
2. **REVIEWAA 审核件一律在对话里贴全文,永不给仓库链接**:Aaron 主工作树停在旧分支,GitHub blob 链接他本地打不开;审核件(md)必须在对话正文全文粘贴。
3. **explanation 只写语法解释**:不得含“改编/非原句/避开/设计/来源/歧义/印<页码>/待核/(本题…)”等审校备注。QC 硬扫(`dirty_expl`)。
4. **归属类题目避免 `X's` → `his/hers` 同义反复**:题干出现名词所有格(Peter's)+ 标答名词性物主代词(his)= 同指废题。QC 硬扫(`tautology`,排除 It's/He's 等缩略)。
5. **词汇基准 = 七上词表 ∪ 小学词表**:出题前先拉“动词并集”(`scripts` 侧 `build_verbs.py`,已导出 `verb_union.json`,140 词);verb-heavy 单元(U2/U4/U6)谓语只从并集取。**⚠️ baseline_words.json(1092)是残缺 primary 转储,漏 go/run/see/never 等基础词**,QC 用 `CORE` 兜底表补;OOV 只查题干+正确答案(干扰项常为故意错拼/错形,不查)。
6. **难度梯度 d3≥3**:每单元 20 题 = d1×~9 / d2×~8 / d3×3;d3 须语境综合(多空、时态对比、所有格共有vs各有)。
7. **答案分布过 `assignAnswerPositions` 同款算法**(每位≤⌊N/4⌋均衡 + 禁相邻重复),QC 硬扫 `adj`。
8. **选项格式一致性**:同一题四选项不得有可区分的尾标点/首字母大小写(否则"只有正确项带句号"泄露答案)。QC 硬扫 `fmt`。**禁用中文"选出语序正确的一项"式选序题**(与站内题型不一致 + 易生格式泄露),位置考点用语境填空承载。
9. **单复数所有格必须有数量锁**:普通名词所有格答案('s / s')的题干必须有 one/two/many/both/each/only 等数量词或前文人数锁定,否则单数所有格与复数所有格两解都成立(同 `His name is Lucky` 类无语境歧义)。QC 硬扫 `nolock`(排除 children's/women's 等不规则复数 + 专名)。
10. **频度副词干扰项只用已教的 5 词**(always/usually/often/sometimes/never),禁用 seldom 等 summary 未教词做干扰(四选一看到没学过的只能猜);且干扰项须是真会误选的同类项,禁 a/the/much 凑数。

### ★白名单纪律(Aaron 2026-07-19 抓到"门漏"后锁死)★
- **OOV 兜底白名单 `CORE` 只放功能词 + 无争议小学/七上核心词。绝不为消 OOV 硬塞内容词。**
- 教训:baseline_words.json(1092)是残缺 primary 转储(漏 go/run/see/never),我曾往 `CORE` 塞 honest/lie/lies/meat/teeth/twins/cross 等超纲词强行消 OOV → 门失效放行超纲题(Aaron 抓)。已剔除,gate 现能真拦。
- 任何"为过 QC 而放宽 QC"都是把门做废;发现 baseline 缺词,只补无争议基础词,存疑词一律改题避开。

**生成器**:`scratchpad/gen_wy7a_batch.py`(6 单元合一 + 全 QC 套件);U1 单出 `gen_wy7a_u1_grammar.py`。产物 md+json 落 `REVIEWAA/wy7a-grammar-batch/`(批量)、`REVIEWAA/wy7a-u1-grammar/`(U1)。

**七上语法进度**:U1+Starter+U2-U6 全 7 单元 Aaron 复审通过(2026-07-19,全 8 道 QC 绿)。灌库 SQL = `SQLAA/wy7a-grammar-load.sql`(140 题·publisher/volume 锁·四断言),**待 Aaron 跑**。⏭️ 跑后需前端把 `fltrp-grade7.json` 的 7 处 `grammarCode` 从 null 接上 wy7-* 码,per-unit 语法才点亮。下一关 s5 阅读(版权:课文不全文入库,只存题+片段/改写;source_key 先拿 junior_reading.id 再回填)。

## 九年级策略
- 新版九上(2024版)2026 秋刚启用出电子版;新版九下要 **2027 春**。→ 九年级"整理中"空壳会挂**至少半年**。
- 建议:**先把七上下、八上下四册做扎实**,九年级等新版九上拿到手再单独排一期(若想外研社入口早点完整,别等九年级)。
