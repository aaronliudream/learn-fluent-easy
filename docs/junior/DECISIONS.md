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
- ★总量合理性自检（必做·2026-07-19 教训）★：每单元词数与其他单元量级比对，
  任一单元 **< 均值 × 0.75** 必回头核该单元首尾页范围，不得直接交付。
  （反例：七上 U6 首版 28 词 vs 均值 39 = 72%，正是漏读整页的信号；旧内部检查只查条目内
  重复/双词性/短语 null，没有一条查总量，漏页因此过关。0.75 阈值兜得住 28，0.6 兜不住。）
- ★页范围铁律★：末单元无后继 Unit 头界定，易少读尾页——附录到 **Proper nouns 前一页** 为止
  （七上 = fitz 154–161 / 印刷 p150–157，共 **8 页**；fitz 162 起为 Proper nouns）。逐单元复核首尾页边界。

### ★照抄铁律★
教材注音一律照抄，**禁止依据通用词典"纠正"**。
实例：外研社七上 mistake = /məˈsteɪk/（非通用的 /mɪˈsteɪk/）。
质检脚本不得拿外部词典做 IPA 正误判定，只做格式合法性检查。

### 字段约定
- 无音标短语（point out / in fact / primary school 等）：
  ipa 与 pos 存 **null**，不存空串、不存 "—"（防前端渲染出破折号）。
- 释义清理全角括号后的多余空格：「n.（ 学校的）」→「（学校的）」。
- 课标三级词汇加粗标记：文本层不可恢复，本期**不做该字段**。
- 落库字段：publisher='junior_fltrp' / volume='wy7A' / unit='U1' / grade=7；DB 列 word_id='wy7A-<unit>-<seq>' / stage='junior' / source_type='wordlist' / confidence='high' / freq_rank=课本顺序 / source_page='p.<页>'。

### 多词性词条存储（2026-07-19 Aaron 定）
同一 headword 有多个词性 → **存一行**，不拆多行（拆开会生成两张中文释义相同/相近的卡，用户体感=重复题）。
- **pos**：按教材顺序用 `/` 连接。`smile → n./v.`  `race → v./n.`
- **meaning_cn**：按教材顺序合并，义项间 `；` 分隔，**相同义项去重**。
  `smile → 笑容；微笑`   `race → 比赛`（两词性同义，合并只留一个，不写"比赛；比赛"）
- **first_page**：取最小者（最早出现）。`race → 56`
- **IPA**：两词性共用同一音标，存一份。
- **QC 追加**：合并后 meaning_cn 若出现重复义项（如"比赛；比赛"）判不合格。

---

## ★外研社初中 = 自动生产模式(2026-07-19 起,同美语课程)★

CC 自查、自验、自合到 main,不再逐步等 Aaron 确认。遇规则覆盖不到的才停。

**自动执行(不问,做完一行汇总+commit号)**:
1. D1 完整版:单 RPC 返回按 publisher 过滤的分子+分母,前端删 TOTALS 硬编码。RPC 必 `SECURITY DEFINER`+`SET search_path TO 'public'`+**不接 _user_id 参数(只用 auth.uid())**;三学段进度环自查,pep(纯初中账号)no-op。
2. JuniorListeningPlay/JuniorWritingPlay 跨社导航(同 ReadingPlay 7 处)。
3. 七上 Starter+U1–U6 内容抽取+灌库,按本文件词表抽取规约。

**合并规则**:tsc 0 + 测试无新增失败 + Vercel 预览绿 → 直接合 main,不等眼验。main 前进非快进 → 自己重 merge,零冲突继续,不汇报。

**硬停(只这几种停下问)**:①改 DB **表结构** 或 改 **共享组件签名**(注:建 RPC/函数=写 SQL 给 Aaron 跑,非硬停);②碰禁区文件(PrimaryHubUnit/unitRoutingConfig/PrimaryHubUnitDispatch/PrimaryHubUnitGamified);③源 PDF 缺失/内容存疑——**绝不编造教材内容**;④发现会影响 pep 线上行为的**意外**改动(D1 修 senior 泄漏是任务本身、非意外,不停);⑤需部署 edge function(只从 main)。

**汇报**:每件一行结论+commit;决策写本文件,不贴 Aaron。**内容审核仍需 Aaron 看**(教材错=教错学生,不自动过);代码自跑。

**Backlog(别现在做)**:D1 分母是全学段合计——七年级学生的阅读分母含八九年级内容。按年级切分母才真准,但另开题目。

---

## 外研社七上 · D1-c + 四关规约(2026-07-19 Aaron 定)

**D1-c(已做·SQLAA/D1c-...publisher-param.sql 待Aaron跑)**:`junior_mastery_overview(_publisher text default 'junior')` — publisher 是**内容维度**做成参数安全;`auth.uid()` 铁律不变**绝不接 _user_id**。前端 `Junior.tsx` 传 `dbPublisherFor(pub)`(pep→junior/fltrp→junior_fltrp)。缺省兜住 pep 零回归;fltrp 词汇分母=288(词表灌完)。原 D1 把 publisher='junior' 写死→外研社环永远 0/2434,D1-c 修另一侧。

**题目来源(Aaron 定·不再问)**:教材原题优先;题量不足允许自拟补足,但——每题 `source_type='textbook'|'authored'`;自拟不改教材语法点/词汇范围只做同范围扩充;[[vocab-quiz-semantic-match-rule]] 语义对应铁律照旧(题干中文释义↔标答英文一一对应·三干扰项真错·逐题自审)。

**四关执行顺序:s4 语法(当模板) → s5 阅读 → s7 写作 → s6 听力**。每关:内容 JSON 进 `REVIEWAA/` 等 Aaron 审(内容必人审不自动合);代码/SQL/文档按自动模式直接合 main。

- **s4 语法**:素材=附录 Guide to the language use(印刷 p145-154)+ 单元 Grammar 板块;grammarCode 已定(wy7-starter-basics/…/wy7-u6-present-continuous·Starter合一条);publisher='junior_fltrp'·code 必 wy 前缀。
- **s5 阅读**:素材=每单元 2 篇(Understanding ideas 主课文 + Reading for writing)。★落库铁律(重申)★ module=**裸 `reading`**;source_key=**`junior_reading_passage_<junior_reading.id>`(绝不加 wy)**;snapshot 必带完整 questions(老师端源3A 双条件·缺一则整篇消失)。
- **s7 写作**:素材=每单元 Writing 任务;module=**`junior_writing`**(带前缀·裸 writing 被 RPC 排除集挡·老师端看不见);判分链路照基线报告 §2 人教写作关实际做法,不自创。
- **s6 听力**:★核实结果=学生书**无完整 tapescript**(Listening and speaking 只印挖空对话+题·答案在教师书;grep 无原文·U1「Listen and choose」实证)→**本期不做**,课本 JSON 保 available:false,**不编造听力原文(硬停③)**。有音频源再说。★

---

## s4 语法出题细则(2026-07-19 Aaron 审 U1 模板后定·所有关通用)

- **难度梯度必须名副实**:d1=单点识别 / d2=对比辨析 / d3=**语境综合(一小段对话或短文里连续考 2–3 个代词/时态,同时判格与位置)**。知识点不同≠难度不同(形容词性 vs 名词性物主代词是知识点差异,不算梯度)。**每关 d3 至少 3 道**,别把同一难度铺二十遍。
- **禁元语言题**:题干不得问"英语的规则是什么"(如"pronouns are used together, English says ___")——那是考规则不是**用**语言,且题干阅读难度常超纲。应用型=在真实语境里用。并列顺序这类点用连词成句/改错,不做 MCQ。QC 关键词拦截 `usually says|the rule|pronouns are used|规则|顺序是`。
- **不超时态/超词汇**:七上时态只有一般现在(Starter/U2)、一般将来(Starter/U5)、现在进行(U6)——**整册无过去时**(broke/was/did 要七下)。词汇基准 = **小学词表 `primary_vocab` ∪ 本册词表 ∪ 常用基础词兜底 + 词形还原(-s/-ing/-ed/-ies)**;题干+选项实词须在基准内(专名/数字/缩略除外)。真超纲(wagging/proud)必换。
- **source 标注口径**:`source_type='textbook'` 的题**必注明印刷页码**(便于回 PDF 核对);只有严格教材原题/原句才算 textbook,把 Guide 里规则说明改写成的题算 authored。外研社单元 Grammar 板块 MCQ-able 原题极少→多为 authored,如实标。
- **答案铁律不变**:标答唯一、干扰项全部真错、[[vocab-quiz-semantic-match-rule]]。
- **★干扰项真错自检(批量必做)★**:逐题回读"这个干扰项在什么情况下能成立?"——能想出成立场景的就不是真错,必换。典型漏点:代词题里 `His name is Lucky`(宠物用 he/she 是常规,不是错)——先行词是动物/人时,gendered 物主代词(his/her)往往也成立。启发式:题干含动物先行词(dog/cat/pet…)且 His/Her 作干扰 → 标红复核。
- **★答案位置一律过 `assignAnswerPositions`(每位≤⌊N/2⌋ + 禁相邻重复),不手工排★**:总体分布均衡会掩盖局部聚集(如 12-17 连续 5 个 A),手工调下次还漏。生成器接站内同款算法(贪心:每步选剩余最多且≠前一位)。

---

## 九年级策略
- 新版九上(2024版)2026 秋刚启用出电子版;新版九下要 **2027 春**。→ 九年级"整理中"空壳会挂**至少半年**。
- 建议:**先把七上下、八上下四册做扎实**,九年级等新版九上拿到手再单独排一期(若想外研社入口早点完整,别等九年级)。
