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

## 九年级策略
- 新版九上(2024版)2026 秋刚启用出电子版;新版九下要 **2027 春**。→ 九年级"整理中"空壳会挂**至少半年**。
- 建议:**先把七上下、八上下四册做扎实**,九年级等新版九上拿到手再单独排一期(若想外研社入口早点完整,别等九年级)。
