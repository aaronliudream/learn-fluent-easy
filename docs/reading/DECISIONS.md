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

## D12 · 图书馆(`/library`)与阅读练习(P0 `/reading`)分线,书目唯一权威表 — ✅ 已定(Aaron 拍板)
**背景**:P0 `/reading`(答题式阅读理解,表 `reading_library`,未上线)与新 v1 图书馆规格(`/library`,逐句沉浸朗读器,表 `library_books`/`library_sentences`/`library_reading_progress`)是**两个不同产品**。走方案 A:严格按 v1 规格建 `/library`,P0 `/reading` **一行不碰**、原样搁置;新代码全放 `src/pages/library/` `src/lib/library/` `src/components/library/`,与 P0 `Reading.tsx`/`src/lib/reading/` 目录隔离。
**书目统一约定**:
1. **`library_books` = "书类内容"唯一权威书目**。未来"同一本书既沉浸阅读、又挂理解测验"时,理解题走**追加式** `library_questions(id, book_id → library_books.id, chapter_idx, q_seq, question, options, answer, explanation)`,锚点是 **`(book_id, chapter_idx)`**(题按"书的某一章"挂,不按整本书)。**禁止再建第二份书表**。因该表纯追加、引用已有主键,`library_books` 现在就是干净外键空间,v1 无需为此加任何列。
2. **`exam_passage` 等纯考试短文不并入图书馆**——`age_band`/`cover`/`author`/`intro` 对真题短文无意义,它属于"按考试/年级组织的题库",留在 P0 `reading_library` 或将来另设"真题短文库"。
3. **章号 `chapter_idx` 用真实章号**(样书 seed 按真实章编,断点续读 `state.chapter_idx` 据此记),**不塌成全 0**——为未来"题按 `(book_id, chapter_idx)` 挂"预留干净寻址空间。
4. **不加 `kind`/`content_type` 判别列**。将来要区分"带题书/纯书",用"该书在 `library_questions` 里有没有题记录"判断,不加冗余状态列(避免两处状态不一致)。真需一等公民的章(章标题/章完成度)时,再追加式建 `library_chapters(book_id, chapter_idx, title)`,零回头成本。
**放弃**:把 P0 `reading_library` 折进 `library_books`(粒度不同:P0"篇"为原子含内联题,新模型"书→句";且 P0 存 `body` 整段无法机械拆句迁移)。

---

### 后续 TODO(样板验收后再做,先记账不做)
- T1:扩 `juniorClassroomSync.ts` / `useMasteryOverview.ts` / `AchievementBanner.tsx` 的 module 字面量,让 `reading_center` 进看板/家长报告(R6)。
- T2:补 `junior_reading` 的 `volume/unit` 正式 migration(R1),或在新 `reading_library` 上不重蹈暗桩。
- T3:删僵尸副本 `src/pages/juniorHub/JuniorReading.tsx`;把两栏块抽成共享组件(消 junior/gaokao 重复)。
- T4:绘本/整本书章节展示层(拼 `SentenceLessonStage` + `ReadWritePictureVisual`),可后置。

---

### D13 · 发布边界(硬红线 · Aaron 2026-07-12 明确,未经他点头绝不越)
图书馆(`/library`)在彻底完美前**不对用户开放**,现阶段只能靠**直接敲 `/library` 网址**访问。据此:
1. **只 commit / push 到 `feat-reading-center` 分支,绝不合并 `main`。** `main` 会被 Vercel 自动部署到 bigmoonenglish.com —— 合 main = 直接对全体用户上线。
2. **绝不往 `BrandHubNav`(或任何首页/导航入口)加图书馆入口。** 挂导航 = 对全体用户可见,等同发布。
3. 合并 main、挂 BrandHubNav 入口、开 PR、部署 —— **四样都必须 Aaron 明确说了才能做**(与 autonomy-boundaries 一致)。

---

### D14 · 图书馆词库复习选表红线(硬 · Aaron 2026-07-12)
图书馆复习(收藏词/语块练到掌握)**只准写这三处**:
1. `mastery_progress`(掌握;module=`library_vocab_review`,item_id=`<kind>:<term>`)
2. `library_vocab_favorites`(收藏表自己的字段:`correct_streak`/`last_correct_date` 跨天连对、`recall_*`)
3. `user_mistakes`(错题;module=`library_vocab` —— **不用 `reading`/`cloze`**,那俩是老师端 RPC 保留名)

**绝不写** `junior_word_mastery` / `gaokao_user_mastery` / `unified_mastery_manual`。那三张是初中词汇的碎片化坑(日常练写 A 表、Hub 读 B 表,读写不齐);一旦有人因为"图书馆这也是词汇"就把它接进去,就把坑拖进来了。**这是本功能唯一真正的选表风险。** 跨天掌握=`correct_streak>=3`(做对且非同天 UTC+8 才+1,做错清零),必须跨天——同天连点=刷次数,违背间隔重复。

---

### D15 · 图书馆可写第四处:连续学习天数表(硬 · Aaron 2026-07-13 批准)
Batch 2「连续学习天数(🔥)」需要 per-user 落点,而 D14 三张允许表都无合适字段(mastery_progress 是 per-item、收藏表是 per-term)。Aaron 批准**新开第四张表** `library_review_streak(user_id PK, last_review_date, review_streak, longest_streak, updated_at)`,**仅本功能可写**、用户私有(RLS 仅本人读写)。语义:复习完成一次记「今天学过」,跨北京日(UTC+8)连续则 +1、断了重置 1,longest 记历史最长。**D14 红线不变**——仍绝不写 junior_word_mastery / gaokao_user_mastery / unified_mastery_manual;这第四张只是把「学习节奏」这类图书馆自有状态收在自己车道里,不进那三张坑。

---

### D16 · 朗读改走 Web Audio 消灭 iOS 灵动岛 Now Playing(Aaron 2026-07-25 指令)

**问题**:朗读一播,iPhone 灵动岛/锁屏就弹「正在播放」卡片。

**根因**:只要用 `HTMLAudioElement`(`<audio>` / `new Audio()`)出声,iOS 就**强制**注册 MediaSession。
`navigator.mediaSession` 只能改卡片内容,**没有任何 API 能取消注册** —— 全库 `mediaSession` 零命中,
说明这卡片不是我们主动挂的,是系统兜底行为。唯一根治办法是换播放路径。

**做法**:新建 `src/lib/audio/webAudioPlayer.ts`(AudioContext + AudioBufferSourceNode,
fetch → decodeAudioData → BufferSource → GainNode → destination),该路径不注册 Now Playing 会话。
`LibraryReader` 的朗读改走它;URL 解析复用 `speak.ts` 新导出的 `resolveTtsUrl()`(缓存/CDN/edge 那套一行没重写)。
`unlockAudioSync()`(在 `<audio>` 上播静音 WAV 消费手势)换成 `unlockReadAloud()`(手势内 `AudioContext.resume()`)
—— 旧那一下静音播放本身就足以招来灵动岛。

**边界**:限图书馆阅读器**整页**(第二步已把页内点词一并迁移,见下)。阅读器之外的全站发音
(初中/高考/美语的点词、单词卡、闯关题,~36 个文件)仍走 `speak()` 的 `<audio>` 路径,行为一行未改。

**第二步 · 页内点词查义(Aaron 2026-07-25 追加)**:只迁朗读的话,点一个词又把灵动岛招回来。
`TappableLine` 加可选 prop `speakFn`(不传 → 默认 `speak()`,其它模块零改动),内部用
`SpeakFnContext` 下发给深层的喇叭按钮 —— 因为按钮埋在
`TappableLine → ExplainPopover → LessonBody → SenseRow → PlayableEnCn` 五层里,
逐层钻 prop 要改 5 个组件签名,而这组件是全线共用的。**不传 `speakFn` 时连 Provider 都不套**,
其它模块的渲染树逐节点不变。阅读器与绘本模式(`ReadingPictureBook` 透传)两处注入点都已接。

⚠️ 注入的必须是**不带 opts** 的 `readAloudText(t)`。`TappableLine` 的视口预热
(`pwWarm` → `prefetchTTS(t)`)用的是默认音色、无 accent 的缓存键;一旦传 `READ_ACCENT`/`speed`,
键就对不上,点词全退回 1-3s 冷合成。点词(默认音色)与整句朗读(accent US)音色不同是既有设定,不是笔误。

**点词与连播的冲突裁决(Aaron 2026-07-25 拍板:停连播)**:两者共用同一个播放器,后来的必然掐掉
先来的 —— "词音完整播完"与"朗读继续下一句"物理上二选一。故 `tapSpeak` 先 `stopAll()` 再播词音:
点词 → 朗读停(播放按钮回未播放态)→ 词音完整 → 用户自己决定要不要接着播。
不选"停后自动续播"是因为停在哪句/接哪句/中途再点词的状态恢复容易埋雷,先要最简单的那个。
(旧 `<audio>` 版另一种坏法:新 `speak()` 覆盖掉共享元素的 `onended`,老 promise 永不 resolve →
朗读循环挂死在 await 且 `playingAll` 仍为 true。两版都不对,只是坏的方向相反。)

**iOS 手势解锁的位置**:`readAloudText` 的**第一行**必须同步 `unlockWebAudio()`。它在 onClick 里被
直接调用,函数体同步执行到第一个 await 为止,这一行因此仍在手势栈内;若把 resume 留给 `playAudioUrl`
里那次(在 `await resolveTtsUrl` 之后),iOS 判定不在手势中而拒绝解锁 —— 表现为"开章后先点词,一声不响"。

**变速**:朗读慢速档走的是 **TTS 服务端合成**(`speed=0.7` 传给 tts edge function),
前端从不碰 `playbackRate`(全库零命中)。所以不存在「慢速变低沉怪音」的问题 —— 无需插停顿方案。

**已知副作用(有意接受,不修)**:
1. 熄屏 / 切后台会暂停(iOS 挂起 AudioContext)。
2. 受手机硬件静音开关影响。
3. 锁屏控制与耳机线控失效。
4. 无 `<audio>` 兜底:Web Audio 失败(解码错/离线)则该句静音跳过,不回退 —— 回退就等于把灵动岛请回来。

**连带改动**:`isSpeaking()` 加入 Web Audio 播放态。它是学习时长心跳(`useActiveHeartbeat`)判定
「被动听朗读也算活跃」的依据;朗读不再有 `<audio>` 可读,不加这一笔听朗读会被误判为发呆而停止计时。
