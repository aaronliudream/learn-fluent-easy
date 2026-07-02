# Phase 0 盘点报告 — 成人英语(CEFR)板块下线 → 美语课程替换

> 分支目标 `feat-american-course`(未建,真机验收前不 push)。本步**零写入**:对线上库无任何 INSERT/UPDATE/DELETE/DDL。
> 产出:本报告 + `SQLAA/adult_phase0_backup.sql`(备份,待 Aaron service role 跑)。
> **报告未确认前不进 Phase 1。clear SQL 等你确认表清单后才生成。**

## 处理原则(按你收紧的版本)

1. 只被成人板块使用的页面/组件/hook/工具 → 归档 `_archived/adult/`
2. 被其它专区(小学/初中/高中/全局)引用的**任何**文件 → **禁删,只切走成人入口**
3. 全局层(App 路由表 / nav / 共享 context)里的成人条目 → **只摘条目,不重构文件**
4. 拿不准 → 标【待定】,不自行判断

---

## 结论先行

- 成人英语 = 本站**最初的 CEFR 原始应用**(`/levels` 系),与三个新学段结构上独立(唯一一批无 `<ChineseOnlyRoute>` 包裹的路由)。**共享依赖按最高级处理。**
- **反向依赖 = 零**:无任何非成人代码 import 成人页面/成人专属组件/成人数据文件。
- **DB 足迹极小**:内容 99% 在静态 TS 文件(随代码归档),线上库仅 5 张表沾边。
- 🔴 **最大雷 = `unified_mastery`**(全站掌握度中枢,Lesson 也写)——**绝不能清**。

---

## 一、共享依赖矩阵(每个文件都判过,带证据)

### A. 【归档】只被成人板块使用 → `_archived/adult/`

| 文件 | 被谁 import(全部成人) | 判定 |
|---|---|---|
| **页面(12)** `Levels/Level/Unit/Lesson/Placement/Scenes/ScenesCategory/ScenesPlay/Workplace/WorkplaceCategory/WorkplacePlay/Slang.tsx` | 仅各自路由(无反向依赖) | 归档 ✅ |
| `components/TappableLine.tsx` | ScenesPlay, WorkplacePlay, PhraseQuiz | 归档 ✅ |
| `components/RewriteDialog.tsx` | ScenesPlay, WorkplacePlay | 归档 ✅ |
| `components/PhraseQuiz.tsx` | ScenesPlay, WorkplacePlay | 归档 ✅ |
| `components/slang/SlangMasteryDots.tsx` | Slang | 归档 ✅ |
| `lib/richText.ts` | TappableLine, RewriteDialog, PhraseQuiz, ScenesPlay, WorkplacePlay | 归档 ✅ |
| `lib/mastery.ts`(成人老掌握度,≠初中/高中的) | Unit, Lesson | 归档 ✅ |
| `lib/slangMastery.ts` | Slang, SlangMasteryDots | 归档 ✅ |
| `lib/slangEmotions.ts` | Slang | 归档 ✅ |
| `lib/placement.ts` | Placement | 归档 ✅ |
| `lib/lessonCache.ts` | Lesson | 归档 ✅ |
| `lib/priorWords.ts` | Lesson | 归档 ✅ |
| `data/course.ts` + `sourceLessons.ts` + `lessonSamples.ts` + `aiLessons.json` | Levels/Level/Unit/Lesson + 成人 lib(course 又引后两者) | 归档 ✅ |
| `data/scenes.ts` | Scenes, ScenesCategory, ScenesPlay | 归档 ✅ |
| `data/workplace.ts` | Workplace, WorkplaceCategory, WorkplacePlay | 归档 ✅ |
| `data/idioms.ts` | Slang, slangEmotions | 归档 ✅ |
| `data/placementBank.ts` | lib/placement | 归档 ✅ |

### A′. 【待定】只被成人用,但命名通用/像可复用件——你定归档 or 留

| 文件 | 现况 | 我的看法 |
|---|---|---|
| `components/game/XPBurst.tsx` | **仅** Slang import(通用庆祝动画组件) | 通用件,归档亦可、留着当未来复用亦可。倾向随 Slang 归档;听你的 |
| `hooks/useGuestNudge.ts` | **仅** Lesson, Unit import(游客提示 hook) | 命名通用但当前只成人用。倾向归档;听你的 |

### B. 【禁删,只切走成人入口】成人也用,但其它专区/全局也用

| 文件 | 成人用处 | **非成人也在用**(证据) |
|---|---|---|
| `components/PageHeader.tsx` | 几乎每个成人页 | Dashboard/Account/Me/About/Stats/Review/Mistakes/Teacher/Gaokao*/Suzhou* 等 ~25 页 |
| `components/BackLink.tsx` | Level | 小学/初中/高中/teacher/social/pets 全站 |
| `components/tutor/TutorChat.tsx` | Lesson, PhraseQuiz | Mistakes, GaokaoMistakes, JuniorGrammarPoint, SuzhouExamPlay |
| `components/brand/BrandLogo.tsx` | (Cet,非本板块) | Index, KnowledgeCard, BrandHubNav |
| `components/ui/*`(button/popover…) | 各成人页 | 全站基础设施 |
| `lib/speak.ts` | 所有成人页音频 | 全局(App.tsx + 全站 `speak()`) |
| `lib/guestProgress.ts` | Unit/Lesson/ScenesPlay/WorkplacePlay/Slang/Placement | useStudySession/WeeklyReport/Stats/Account/Index/TodayTaskCard |
| `lib/feedback.ts` | Lesson/Slang/PhraseQuiz | 全站(含 `lib/confetti` 重导) |
| 🔴 `lib/unifiedMastery.ts` | Lesson 写 | **StageTestPlay(/stage-tests)** — 且底层 `unified_mastery` 表是全站掌握度中枢 |
| `lib/srs.ts` | PhraseQuiz | **Review 页 + PageHeader**(到期复习计数) |
| `integrations/supabase/client` | Lesson/Slang/Placement | 全局 |

→ 这些**一个都不删/不改结构**;成人被归档后它们自然少一批调用方,仅此而已。

### C. 【只摘条目,不重构文件】全局层里指向成人的入口

| 文件:行 | 成人条目 | 处理 |
|---|---|---|
| `App.tsx:343,344,350,366-370,538-541` | 12 条成人路由 | 摘除,改挂 301 → `/american`(见 Phase 1) |
| `components/LandingPage.tsx:105` | 成人英语卡 → `/levels` | **替换为美语卡**(Phase 2) |
| `components/BottomTabBar.tsx:187`(+`22`/`27` 隐藏逻辑) | 成人 tab | 摘条目 |
| `pages/Index.tsx:83/91/102` | hub 视图里 /slang /levels /placement | 摘条目 |
| `components/ThreeTracksHero.tsx:13/22`(仅 Index 用) | /levels /workplace | 摘成人条目 |
| `components/BrandHubNav.tsx:15`(仅 Index 用) | 俚语 /slang | 摘条目 |
| `components/OnboardingWizard.tsx:30/31/33` | /scenes /workplace /levels | 摘条目 |
| `components/TodayTaskCard.tsx:14/50/118/178` | /level… /levels /slang | 摘条目 |
| `pages/Review.tsx:134/140` | 推荐 /scenes /workplace | 摘条目 |
| `pages/GlobalParent.tsx:417` | /placement 链 | 摘条目 |

### C′.【待定】全局层里"行为型"成人引用(不是简单链接,动它需你点头)

| 文件:行 | 内容 | 为何待定 |
|---|---|---|
| `components/assistant/GlobalAIAssistant.tsx:42/165/255` | AI 助手识别 `/placement` + markdown 推荐定级 | 涉及助手逻辑与话术,非纯链接 |
| `hooks/useActiveHeartbeat.ts:24-30` | 把 `/workplace /scenes /slang /placement` 归类为学习时长 | 埋点分类,删了不影响新板块但改行为 |
| `components/UserAvatarMenu.tsx:28-29` | 隐藏头像菜单的 regex 含 `/slang /cet /placement` | 路由 301 后这些路径不再直达,是否清理 regex |

---

## 二、DB 表清单 + 各表读写方(**你确认后我才出 clear SQL**)

| 表 | 内容/用户 | 被哪些页面读/写 | 其它专区是否用 |
|---|---|---|---|
| `daily_slang` | 内容(无 user_id,cron 生成) | Slang **读**(`Slang.tsx:307`);edge `generate-daily-slang` 写 | 否(成人专属) |
| `slang_mastery` | 用户历史 | `lib/slangMastery.ts:67` 读 / `:147` 写(Slang);`Account.tsx:146` 导出读;`delete-account` 删 | 否(成人专属) |
| `generated_lessons` | 用户 AI 缓存 | `lib/lessonCache.ts:66/135` 读 / `:81/109` 写(Lesson);`Account.tsx:147` 导出读;`delete-account` 删 | 否(成人专属) |
| `placement_results` | 用户历史 | **前端 0 引用**(仅 types.ts;**无迁移文件**) | 否(成人专属·孤儿) |
| `workplace_practice` | 用户历史 | **前端 0 引用**(仅 types.ts;**无迁移文件**) | 否(成人专属·孤儿) |
| 🔴 `unified_mastery` | 共享·全站掌握度中枢 | Lesson 写(经 `record-attempt`) | **是**:primary/junior/gaokao/StageTest 全在用 → **绝不清** |
| `expression_reviews` | 共享 | PhraseQuiz(成人) | **是**:全局 Review + PageHeader → **不动** |

**备份已就绪**:`SQLAA/adult_phase0_backup.sql`(备份上面 5 张成人表到独立 `adult_archive` schema + RLS 锁死;后两张用 `to_regclass` 守卫,存在才备)。待你 service role 跑,跑完把行数校验贴回。

---

## 三、边缘函数(本期零改动)

- 成人专属(**不删**,列备查):`generate-lesson`、`slang-scenario`、`grade-slang-sentence`、`generate-daily-slang`、`explain-phrase`、`rewrite-line`、`extract-key-phrases`。
- 成人也用但共享(**必留**):`check-writing`(初高中也用)、`tts`(全局音频)、`translate`(全局 i18n)。

## 四、"新概念 / NCE" 排查

`新概念` src/ **0 命中**;`NCE` 无产品引用(命中全是 EXPERIENCE/SENTENCE 子串)。✅

---

## 需你拍板(报告确认前不进 Phase 1)

1. **矩阵 A/A′/B/C/C′ 是否认可?** 尤其 A′ 两个(XPBurst / useGuestNudge)归档 or 留;C′ 三个行为型引用动 or 不动。
2. **DB 表清单认可?** `clear SQL` 只清 `daily_slang`(内容),4 张用户表**默认只备份留壳不清行**——要清干净请明说(有备份兜底)。
3. **最终课程名**(现占位「美语新起点」)。
4. **备份是否哈希 user_id**(默认保原值以便回滚;备份表已锁死读不到)。

---

## ✅ Aaron 已拍板 + Phase 0/1 执行结果(2026-07-01)

**拍板结论**:A 类归档(唯一例外 `TappableLine.tsx` 留原位,美语关1复用);A′(XPBurst/useGuestNudge)留;B 全不动;C 只摘条目;C′ 三个随本期"只改条目"处理;**本期一张表都不清**(备份+留壳),下线稳定 2–4 周后再单独出内容表 clear;课名占位「美语新起点」单常量。

**Phase 0 备份**:Aaron service role 已跑 `SQLAA/adult_phase0_backup.sql`,5 表共 **550 行**入 `adult_archive` 并锁 RLS,user_id 保原值。✅

**Phase 1(前端下线 + redirect,不清库)已完成**:

归档(git mv 到 `_archived/adult/`,保留历史):12 页面 + 3 组件(RewriteDialog/PhraseQuiz/SlangMasteryDots)+ 7 lib(mastery/slangMastery/slangEmotions/placement/lessonCache/priorWords)+ 8 data(course/sourceLessons/lessonSamples/aiLessons/scenes/workplace/idioms/placementBank)。**保留在 src/**:TappableLine、richText(TappableLine 依赖)、XPBurst、useGuestNudge。

新增:`src/lib/american/brand.ts`(课名单常量)、`src/pages/american/AmericanHome.tsx`(占位页)、`/american` 路由。

改条目(旧成人路由全部 301 → `/american`):`App.tsx`(12 路由→Navigate);卡片 `LandingPage.tsx`(成人卡→美语渐变卡,避真实校名/地标);`BottomTabBar`(tab match + 学段选择器)、`ThreeTracksHero`、`BrandHubNav`、`OnboardingWizard`、`Index`(hub sections)、`TodayTaskCard`(移除俚语任务、首课改指)、`Review`、`GlobalParent`;C′:`GlobalAIAssistant`(去 /placement 识别+话术)、`useActiveHeartbeat`(成人段→american,**保留 /stage-test**)、`UserAvatarMenu`(去 /slang /placement,/american 同 /levels 显示全局头)。

自查:`tsc` 我方文件 0 错(仓库其余为既有类型漂移,非本次);`vite build` 通过(exit 0,bundle 已无成人代码);改动源文件 eslint 0 错;`slangLocalization.test` 移除已归档 Slang 源码守卫用例并补 auth mock(剩 7 例为既有 i18n 动态翻译测试隔离问题,与本次无关)。

**遗留给 Aaron**:① `GlobalParent` 那段"5分钟免费评估/CEFR推荐"文案已把按钮指向 /american,但**文案仍提评估**(功能已下线)——需你决定改文案还是删段。② 最终课名。③ clear SQL 待 2–4 周后另出。
