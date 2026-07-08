# 美语课程 · 自主决策留痕(DECISIONS)

> 全自动生产授权(Aaron 2026-07-04)下的自决记录。格式:日期 · 课/事项 · 选项 · 依据 · 决定。Aaron 异步翻阅,有异议回溯。

## 2026-07-04

- **性能③ 元数据缓存范围** · 选项:全站统一缓存层 vs 美语本地缓存 · 依据:范围声明只碰美语;全站层会波及其他板块 · **决定**:缓存收在 `src/lib/american/data.ts`(`cachedBooks/cachedUnits` + fetch 成功写 `localStorage am.meta.v1.*`),仅美语页消费;其他板块同类优化各自做,不共用一层。

- **性能② 路由分割** · 依据:App.tsx 已对四板块 `React.lazy`,`/american` 实测只下美语 chunk · **决定**:判定"已完成",不重做,不动 App.tsx 路由结构(避免碰禁区/共用)。

- **性能①「无法加载」修法** · 选项:每查询手动超时 vs 客户端全局 fetch 超时 · 依据:根因是客户端零超时导致弱网请求永久挂起,逐查询改动面太大易漏 · **决定**:在 `supabase/client.ts` 加 `global.fetch` 10s AbortController 超时(全站生效,Aaron 明确要全站受益);该文件标注"自动生成勿改",已加注释说明例外并请保留。

- **性能④⑤ 美语现状** · 依据:`fetchLessonBundle` 已 `Promise.all` 六查询并行;`fetchUnits` 已列裁剪(不取 grammar_card/课文/词表)· **决定**:美语侧④⑤基本已满足,判"已达标";全站"今日复习角标延后"属别板块落地页,不在美语范围,不碰。

- **真机修正③ 加粗 vs 共用 TappableLine** · 硬停②候选(改共用组件波及全站)· 依据:TappableLine 是全站共享,直接加高亮 prop 会波及 · **决定**:不改 TappableLine;在美语本地 `AmericanTappableLine` 把句子切成加粗/非加粗段、各段仍过 TappableLine,`<strong>` 包加粗段。零跨板块波及,不触发硬停。

- **校验第10项 stem_cn 判定范围** · 选项:所有带空题 vs 仅"完整英文句"填空题 · 依据:中文讲解式题干(如"在晚上说 ___")译中文无意义,只有完整英文句填空才需"填答案后整句中译" · **决定**:`isPatternQ` = 带 `___` + ≥3 英文词 + 中文字符≤3;据此第10项只卡纯英文句填空题。

---
## 2026-07-05 · 🟡概念辨认(audit ~98/用户口径55)两档处置规则(Aaron 定)
排在单元之间空档做,不阻塞主线;逐题按三维判档:
- **档一 = 转运用题**:知识点硬、能自然改成单句运用(改后学生"产出一个正确句子"而非"选一个解释")。
  例:"Yesterday I have finished 为什么错"→ yesterday 配一般过去的填空;"didn't 后接原形"→ 填空题。
- **档二 = 保留(归🟢近运用)**:辨析理解、强转单句会别扭的语用/词义辨析,解释写透即可。
  例:has gone vs has been、could 表可能。
处置写进 REVIEWAA/american-instructional-design-audit.md 的"实际处置"列;机器 11/12 项复跑;幂等 UPDATE。
状态:待做(U4 收尾后的单元空档批量处理)。

---
## 2026-07-07 · am4 L46《Hobbies》词表取舍(现代美语优先)

- **事项**:NCE4 L46(丘吉尔《Painting as a Pastime》)官方生词表 27 词,含大量古旧/文学词(spasm/insinuate/convulsive/sedulously/vivify/undue/caprice/satiation/frantically/avenge/clatter/grudge/sustenance/recuperation 等)。
- **选项**:①全收 27 词(遵 CONSTITUTION 第3章"词表零遗漏")vs ②取现代可教子集。
- **依据**:CONSTITUTION 第0章(最高原则,一切之上)"教现代美语,不教过时用法;英式/古旧用法要么不出"。教 sedulously/vivify/caprice 这类词违背立课之本,且对当代美国口语无迁移价值;第0章 > 第3章。
- **决定**:取 **12 个现代可教词**(gifted/psychologist/futile/illumination/improvise/aggravate/trifling/gratify/boredom/appetite/absorbing/banish),舍弃古旧文学词。语法考点(the+比较级/it is no use doing/those who/情态被动/不定式目的状语)全部覆盖,机器12项🟢。此为"现代美语优先"通则,后续遇同类古旧长词表沿用。

---
## 2026-07-07 · 三册可下载课本 PDF 收官(book2/3/4)

**成品**:`american-book2-v1.pdf`(96课/12.8MB)、`american-book3-v1.pdf`(60课/10.7MB)、`american-book4-v1.pdf`(48课/9.1MB),生成于 `scripts/american/pdf/out/`。**待 Aaron 上传 Supabase `textbooks` 公开桶**(文件名保持一致),上传后 hub 下载卡片自动生效(卡片已四册通用,`bookNo` 驱动,零需再改代码)。fitz 已验:合法 PDF、页数完整(398/290/247)、book4 含 L32/L33 净化版内容(Galileo/伽利略/Education)。

- **① 数据源 = 本地净化 JSON**(`docs/american/book<N>/am<N>_l*.json`),**与线上题库同源**。理由(Aaron 定 A):本地是过了机器12项校验的净化后健康全本,不受 SQL 是否跑齐影响;选项打散口径(mulberry32+placeQuota,options[0]=正确项)与 `gen-book<N>-seed.mjs` 完全一致,PDF 与线上逐题对得上。**不读 DB、不碰 service key**(Aaron 定 B:CC 出成品、Aaron 手动上传)。
- **② 上传方式**:CC 生成 → Aaron 手传。禁用 service key(最高权限,泄露=整库可改)。同第一册当初口径。
- **③ 脚本已参数化,可重导出新版本**:`node scripts/american/pdf/export-data.mjs <2|3|4> [unit|all]`(支持 book_no 过滤 + 按册真实单元数,不硬编 12)→ `node scripts/american/pdf/build-book.mjs <2|3|4>` 出 HTML → Chrome headless `--print-to-pdf` 出 PDF。**以后哪课改了,重跑这条链出新 PDF,升版本号(v2)上传换掉即可**,旧缓存不被覆盖(文件名带版本号)。生成物 `data/`、`out/` 是产物,按惯例不入库。
