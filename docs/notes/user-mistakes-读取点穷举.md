# user_mistakes 读写点穷举（junior_cloze 拆条 + 归档改造前置清单）

生成于 2026-07-26，服务于「完形错题空号改造」B3 要求。
方法：`user_mistakes` 全仓检索（`src/` / `supabase/` / `SQLAA/` / `scripts/`），逐条打开确认过滤条件，非估算。
`gaokao_user_mistakes` 是**另一张表**（高中旧错题本），不受本次改造影响，已剔除。

判定口径：
- **归档漏检** = 老行改 `module='junior_cloze_archived'` 后，该处是否仍会读到它
- **拆条影响** = 一篇 5 空拆成 5 行后，该处的数字/展示是否改变（**与归档无关，拆条本身就会变**）

---

## 一、前端读取（src/）

| 文件:行 | 用途 | 当前 module 过滤 | 归档漏检 | 拆条影响 | 需否改 |
|---|---|---|---|---|---|
| `src/pages/Mistakes.tsx:119-127` | /mistakes 主列表 | `.not(module in (listening,cloze,vocab,grammar,writing,phonics))` + JS 滤 `primary_%` | **会漏** | 一篇卡 → 5 张空卡 | ✅ 加 `junior_cloze_archived` |
| `src/components/MistakeReviewGate.tsx:57-68` | 登录强制复习门 | 同上 + `isRedoableMcq()` | 不漏（整篇型无顶层 options，被 `isRedoableMcq` 挡掉） | **拆条后开始进门**（这是本次目的） | ⚠️ 加排除以防万一 |
| `src/pages/ReviewToday.tsx:51-58` | 今日复习队列 | **无任何 module 过滤** | **会漏** | 5 行同日到期 → 队列被单篇占满 | ✅ 必改 |
| `src/hooks/useDashboardExtras.ts:123-130` | Dashboard 薄弱 Top3（`WeakSpots`） | **无任何 module 过滤** | **会漏** | `wrong_count` 排序基准变（篇级 5 → 空级 1） | ✅ 必改 |
| `src/hooks/useDashboardExtras.ts:140-147` | Dashboard 模块分布（limit 500） | **无任何 module 过滤** | **会漏** | 行数×5，可能顶到 500 上限 | ✅ 必改 |
| `src/lib/library/mistakes.ts:77-82` | 图书馆词库错题解决 | `.eq(module,'library_vocab')` | 不漏 | 无 | ❌ 不动 |

## 二、前端写入（src/）——不需要排除，列出仅为完整性

| 文件:行 | 动作 |
|---|---|
| `src/pages/JuniorClozePlay.tsx:100-113` | **本次改造对象**：整篇一条 upsert |
| `src/lib/recordZoneMistake.ts:77 / :131` | 通用写入器（A/B 类走这里） |
| `src/lib/recordHubMistake.ts:60` / `seniorGrammarMistake.ts:59` / `library/mistakes.ts:43` | 各专区写入 |
| `src/pages/JuniorReadingPlay.tsx:211` / `GaokaoReadingPlay.tsx:127` | 阅读整篇快照 |
| `src/pages/GaokaoGrammarQuiz.tsx:414` / `KnowledgeCard.tsx:265` / `suzhouExamDiagnosis.ts:104` | 其它写入 |
| `src/pages/Mistakes.tsx:210 / :242` | 按 `id` 更新（收藏 / 开放题移出），与 module 无关 |
| `src/pages/ReviewToday.tsx:85 / :98` | 按 `id` 更新复习时间 / 错误计数 |
| ⚠️ `src/pages/Mistakes.tsx:940-948` | **AI 相似题**以 `module = 源错题.module` 写入，`source_key` 前缀 `ai_similar:` |

## 三、Edge Function

| 位置 | 用途 | 影响 |
|---|---|---|
| `supabase/functions/record-attempt/index.ts:165` | 薄行写入，`SKIP_BARE_MODULES` 已挡裸模块 | 只写不读，不受影响 |

## 四、DB RPC —— 已部署（`supabase/migrations/`）

⚠️ 这三处是**老师端聚合口径，全部没有 module 过滤**，是本清单风险最高的一组。

| 位置 | 用途 | 当前 module 过滤 | 归档漏检 | 拆条影响 |
|---|---|---|---|---|
| `20260521120000_teacher_classes.sql:275-281` | 班级 `weak_student_count`（`wrong_count>=3` 的学生数） | **无** | **会漏** | 拆后每行 `wrong_count=1`，原本达标的学生**掉出统计** |
| `20260521120000_teacher_classes.sql:341-343` | 学生 `unresolved_weak_count`（`count(*)`） | **无** | **会漏** | **直接×5** |
| `20260521120000_teacher_classes.sql:389-397` | 班级高频错题（`group by module` + `sum(wrong_count)`） | **无** | **会漏** | 分组行数与求和值双变 |

## 五、DB RPC —— SQLAA 定义（**以库内实际为准**，见回溯 SQL ⑧ 段）

| 函数 | 最新定义所在 | junior_cloze 处理 | 需否改 |
|---|---|---|---|
| `get_student_mistake_counts` | `PHASE7`（`PHASE2_junior_cloze_snapshot` 的「源4 按篇」疑被覆盖） | PHASE7 版 0 次提及 | ✅ 待 ⑧ 段定 |
| `get_student_mistakes` | `PHASE7` | 同上 | ✅ 待 ⑧ 段定 |
| `get_teacher_student_passage_review` | `PHASE2_junior_cloze_snapshot` | 显式认 `source_key like 'junior_cloze_passage_%'` | ✅ 拆条后此分支失效 |
| `bump_mistake_correct` | `PHASE3` | 按 `(module, source_key)` 定位 | ✅ key 改了要跟着核 |
| `get_student_module_progress` | `PHASE2_student_detail_rpcs` | 读 `user_mistakes` 无 module 过滤 | ✅ 需核 |

## 六、scripts/

全仓 `scripts/` 无 `user_mistakes` 读取点（仅 `senior-rebuild/_p0_backup_gaokao.mjs:25` 备份 `gaokao_user_mistakes`，另一张表）。

---

## 结论：必改点合计 **11 处**

前端 4（Mistakes / ReviewToday / useDashboardExtras ×2）+ 防御性 1（MistakeReviewGate）
+ 已部署 RPC 3（teacher_classes 聚合）+ SQLAA RPC 5（待 ⑧ 段确认实际部署版本，可能有重叠）

## 七、F2：`wrong_count` 阈值/排序点穷举

⚠️ 只统计读 **`user_mistakes.wrong_count`** 的位置。`junior_user_mastery` / `gaokao_user_mastery` /
`american_user_mastery` 等表也有同名列，是**另一套语义**，拆条不影响，单列在下方"安全"表。

### 受影响（拆条后 `wrong_count` 语义由「本篇错 N 空」变成「本空错 N 次」）

| 位置 | 类型 | 现行为 | 拆条后 | 校准建议 |
|---|---|---|---|---|
| `src/pages/ReviewToday.tsx:27-28` | **阈值** | `>=4 → 3天`；`>=2 → 7天`；否则 14 天 | 每行初始恒为 1 → **一律 14 天档** | ⚠️ 复习间隔被悄悄拉长 3~4 倍。建议档位改按 `correct_streak` 或把阈值下调到 `>=2 / >=1` |
| `teacher_classes.sql:275-281`（已部署） | **阈值** | `um.wrong_count >= 3` → 薄弱学生数 | 门槛从「本篇错3空」变「同一空错3次」，**大量学生静默掉出** | 改为「未解决条数 >= 3」∪「任一条 wrong_count >= 3」，保持旧灵敏度 |
| `PHASE1_teacher_rpc_time_source.sql:70` | 阈值 | 同上（同一逻辑第 2 份） | 同上 | 同上 |
| `PHASE2_class_sort_order.sql:226` | 阈值 | 同上（第 3 份） | 同上 | 同上 |
| `PHASE2_delete_recycle_bin.sql:246` | 阈值 | 同上（第 4 份） | 同上 | 同上 |
| `teacher_classes.sql:389-397` + `PHASE1_fix_classes_owner_rls.sql:106-114` | 排序 | `sum(wrong_count)` desc（班级高频错题） | 求和值与分组行数双变 | 语义仍成立，只需在迁移说明里标注跳变 |
| `PHASE2_student_detail_rpcs.sql:196` | 排序 | `order by module, wrong_count desc` | 排序基准变平（多数为 1） | 加 `last_wrong_at desc` 作次级键 |
| `src/hooks/useDashboardExtras.ts:125-128` | 排序 | `order wrong_count desc limit 3`（薄弱 Top3） | 完形不再因"一篇错5空"霸榜 | 语义反而更准，无需改，但要知情 |

> **`wrong_count >= 3` 这个阈值在 4 个 SQL 文件里各写了一遍** —— 与 E 节指出的排除清单散落是同一形态。
> 校准时若只改 `teacher_classes.sql`，另外 3 份一旦重跑就会把旧阈值写回来。SQL 侧的单一来源同样必要。

### 安全（读的是别的表，拆条不影响）

| 位置 | 实际读的表 |
|---|---|
| `src/hooks/useMasteryOverview.ts:337-342` | `junior_user_mastery` |
| `SQLAA/D1-junior-mastery-overview-rpc.sql:81`、`D1c…:70` | `junior_user_mastery` |
| `src/pages/GaokaoVocab.tsx:2630-2634` | `gaokao_user_mastery` |
| `src/pages/StageTestPlay.tsx:223-230`、`src/lib/american/data.ts:294-315`、`src/lib/cohortProgress.ts:154`、`src/pages/GaokaoReadingKnowledge.tsx:99-215` | 各自 mastery 表 |
| `src/pages/GaokaoMistakes.tsx:146` | `gaokao_user_mistakes`（另一张错题表） |

**结论：掌握度 / 进度条不读 `user_mistakes.wrong_count`，拆条不会影响学生看到的任何完成度或掌握度数字。**

## 两个额外发现（原方案未覆盖）

**① `ReviewToday` 无 module 过滤 → C 类其实早就在复习循环里，只是渲染是残的。**
先前「C 类从来没进入过复习循环」的说法要收窄为：被 `MistakeReviewGate` 挡掉，
但 `/review-today` 一直在取它。`ReviewToday.tsx:147/163` 只渲染 `question` + `correct_answer`，
而 C 类 `question`=篇名、`correct_answer`=NULL（`JuniorClozePlay` 那条 upsert 压根没写这两列），
所以学生看到的是「一个只有篇名、没有答案的自评卡」。拆条会顺带修好它。

**② `module='junior_cloze'` 的行不全是完形篇快照。**
`Mistakes.tsx:940` 的「AI 相似题」以 `module = 源错题.module` 写入，
若源错题是完形，就会产生 `module='junior_cloze'` 且 `source_key` 以 `ai_similar:` 开头、
`snapshot` 里没有 `questions[]` 的行。**迁移必须按 `source_key like 'junior_cloze_passage_%'`
定位，不能按 module 一刀切**，否则会把 AI 相似题记录一并归档/误拆。
回溯 SQL ⑤ 段的「无 questions 无法拆的行」即用于量化这批。
