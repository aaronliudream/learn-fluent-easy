# 场景串记学习闭环 P0 —— 实现方案(v2,已按 Aaron 2026-08-09 的裁决重写)

**状态**:方案已定,**仍未动工**,等一句"开工"。
**规格来源**:`vocab-scenes-closed-loop-p0` + Aaron 2026-08-09 的三条裁决。

---

## 〇、这一版的前提(Aaron 定,v1 里没有)

> **场景闭环是一套独立于词库 SRS 的小闭环。不要为了"接进现有系统"而硬挂 `word_id`。**

v1 我把三条路都放在桌面上让他选,他把前提直接抬高了一层 —— 这条前提比三个具体裁决更重要,
因为它一次性回答了后面所有"要不要接进去"的问题:**不接**。

由此:
- 场景回忆**自己一张表**,不进 `user_vocab_mastery`;
- 场景错题**不进** `/mistakes`;
- 今日学习**不混**场景节点;
- 场景的复习入口**长在场景自己身上**。

---

## 一、勘验实测(2026-08-09 现查,是这条前提的依据)

```
场景包 30 · 节点 262 · 每包 8~11(平均 8.7)
word 65(有 word_id 7) / collocation 83(0) / contrast 30(0) / chunk 84(0)
→ 有 word_id 的节点:7 / 262 = 2.7%
goal_zh 列:不存在(PostgREST 42703)
```

`user_vocab_mastery` / `vocab_mistake_book` / `buildTodayPlan` 三者全按 `word_id` 索引。
**硬挂的话 97.3% 的节点要么塞不进去,要么在掌握度表里变成一堆没有 `word_id` 的孤儿行** ——
Aaron 的原话,也是不硬挂的直接理由。

⚠️ **`textmatch.mjs` 在本仓库不存在**(全仓零命中)。
Aaron 已确认那是他引用记忆时的笔误,**宽松匹配新写即可**,不用去找。
(记档在这里,免得下一个会话又去翻一遍。)

---

## 二、数据模型:`vocab_scene_recall`(唯一新增表)

字段按 Aaron 指定:

| 列 | 类型 | 说明 |
| --- | --- | --- |
| `user_id` | uuid | → `auth.users(id) ON DELETE CASCADE` |
| `pack_id` | uuid | → `vocab_scene_packs(id)`。**冗余存着**,为的是"这个包掌握几条"能一次查出来,不用 join items |
| `item_id` | uuid | → `vocab_scene_items(id)` |
| `first_recalled` | boolean | **第一次就想起来了吗**。掌握度只认它 —— 看过答案再打对不算"能主动想起来" |
| `attempts` | int | 尝试次数 |
| `last_attempt_at` | timestamptz | 最近一次 |

主键 `(user_id, item_id)`;`(user_id, pack_id)` 建索引(列表页要按包聚合)。
RLS 照 `SQLAA/library-review-streak-table.sql` 那套:own-row 三策略,`auth.uid() = user_id`。

⚠️ **没有 `next_review_at`**。v1 我写了这一列,是照搬词库 SRS 的惯性 ——
按新前提,场景复习不排队、不到期,规则简单一句话:
**下次进这个场景时,没能主动想起来的节点优先出现**。一个布尔就够了,不需要排程列。
将来真要做间隔重复,加列即可,不影响已有数据。

---

## 三、逐项方案

### P0-1 场景目标 —— 🟢

- DDL:`vocab_scene_packs` 加 `goal_zh text`(可空)。
- 前端:详情页主题头下一行;为空**整行不渲染**(与 benefits/drawbacks 同一套)。
- 内容:30 条我写 → **出送审件**,审完再出 UPDATE SQL。

### P0-2 三阶递减提示 —— 🟢 是**改造**不是新增

现有 `cloze: boolean`(全显/全挖)升级成 `hintLevel: 1 | 2 | 3`,默认 1:

| 档 | 显示 |
| --- | --- |
| ① 全显 | 英文 + 中文 + 🔊(现状) |
| ② 半显 | `b_____ 浏览`(首字母 + 中文) |
| ③ 只给中文 | `浏览`,点击才翻英文 |

- `peeked`(想不起来点一下看答案)**任何档都保留**。
- 切换器替换原来那个「挖空自测」按钮,放词链区顶部 —— **不新增卡片层级**。
- 档位存 localStorage(与自动朗读同一套写法)。

### P0-3 中译英回忆 —— 🟢(SRS 那半按新前提已简化掉)

- 词链下方练习区,长在第②段里,不新起卡片。
- 逐条给中文 → 输入英文 → 判对错;答错显示正确答案 + 该节点例句。
- 结果写 `vocab_scene_recall`:第一次就对 → `first_recalled = true`。
- 全做完给「本场景 N/M 能主动想起来」。
- **答错的节点不进 `/mistakes`**(裁决 b)。它们的"复习"就是下次进这个场景时排在前面。

**两个细节**:

1. **contrast 节点排除**(30 个,恰好每包 1 个)。让人把「直飞 vs 中转」默写成
   `direct vs connecting` 考的是背题不是回忆;而且至少有一条的 `text_zh` 是整段解释。
   → 分母 M = `word + collocation + chunk`,每包 7~10 个。Aaron 那条「6/8」判据仍成立。
2. **宽松匹配 `src/lib/vocab/looseMatch.ts`(新写)**:小写化、去多余空格与标点、
   冠词 a/an/the 可有可无、物主代词互通、常见屈折(-s/-es/-ed/-ing)容忍。
   ⚠️ **中译英天生不是单答案题**:「迅速走红」写 `go viral` 对,写 `become popular fast`
   也不算错,机器判不了(第九条:分不清就别硬判)。
   → 机器只判"是不是目标说法";不匹配时**不说"你错了"**,而是显示
     「目标说法是 go viral」+ 一个「**我写的也对**」按钮。点了算对(`first_recalled` 照记),
     并把这条留痕,攒够了出一份人工看的清单。既不误判,也不放水。

### P0-4 场景掌握度取代"已学" —— 🟢

- 掌握度 = `first_recalled = true` 的节点数 / 可回忆节点数(M)。
- **≥80%** 算完成;否则列表卡显示「继续训练」。
- 列表卡把"已学"换成「掌握 6/8」。
- ⚠️ 现有 `readSceneProgress`(localStorage,只记"看到第几环")**保留不动** ——
  它管的是"展开到哪了",和掌握度不是一回事,两者并存互不覆盖。

### P0-5 短文接回忆 —— 🟢

- 短文区下方「合上短文,自己讲一遍」→ 隐藏短文,只留该包的中文提示词。
- 自评「能讲出来 / 讲不全」,后者滚回练习区(同页锚点,不跳页)。
- 不做 STT。

### 场景复习入口(裁决 c 的后半,新增项)

场景**列表页顶部**一行:「**N 个场景有待巩固的表达**」→ 点进去是掌握度 < 80% 的那几个包。
N 从 `vocab_scene_recall` 按 `pack_id` 聚合算,不写死。

⚠️ 今日学习主卡**不动**。它的「今日 N 词」口径必须保持"全是词库词" ——
混入场景节点会让那个数字说不清是什么(Aaron 的理由,记在这里防止以后有人"顺手接一下")。

---

## 四、改动清单

**新增**
```
SQLAA/2026xxxx_vocab_scene_goal_ddl.sql        goal_zh 一列
SQLAA/2026xxxx_vocab_scene_recall_ddl.sql      新表 + RLS(照 library-review-streak 模板)
SQLAA/2026xxxx_vocab_scene_goal_content.sql    30 条目标文案(⚠️ 审过再出)
REVIEWAA/vocab_scene_goals.md                  30 条送审件
src/lib/vocab/looseMatch.ts   + .test.ts       宽松匹配(正反两侧都要测)
src/lib/vocab/sceneRecall.ts  + .test.ts       读写新表 + 掌握度算法(阈值/分母口径)
src/components/vocab/SceneRecall.tsx           练习区(长在第②段里)
```

**改动**
```
src/pages/vocab/VocabSceneDetail.tsx   cloze→hintLevel / 目标行 / 练习区 / 合上短文
src/pages/vocab/VocabScenes.tsx        列表卡「掌握 N/M」+ 顶部「N 个场景有待巩固」
src/lib/vocab/scenes.ts                ScenePack 加 goal_zh
```

**明确不动**:词链事件顺序结构、双档短文、Benefits-Drawbacks、现有视觉语言、
`vocab_words` / `user_vocab_mastery` / `vocab_mistake_book` / `buildTodayPlan` / `readSceneProgress`。

---

## 五、分期(每期一个 PR,能独立验收)

| 期 | 内容 | 依赖 |
| --- | --- | --- |
| 1 | P0-2 三阶提示 + P0-1 目标行(带列不带内容) | `goal_zh` DDL |
| 2 | `looseMatch` + P0-3 练习区(先只算当次、不落库) | **无,纯前端** |
| 3 | `vocab_scene_recall` 落库 + P0-4 掌握度 + 列表卡 + 顶部入口 | 新表 DDL |
| 4 | P0-5 合上短文 + 30 条目标文案上库 | 目标文案审过 |

**第 2 期不等任何 SQL**,可以先做;第 1 期只等一列。

---

## 六、验收判据

规格给的是:**学完的用户能在不看提示的情况下,用中文提示说出至少 6/8 个表达** —— 这条真机验。
我这边自己能验的:

- 三档切换在 SE 375×667 上不把词链挤出首屏(量 `getBoundingClientRect` 实际像素,不看截图)
- `looseMatch` 测试**必须同时覆盖"该判对的"和"不许判对的"两侧** ——
  只测前者会写出一个什么都判对的匹配器
- 掌握度分母在 30 个包上逐包核一遍(contrast 排除后每包 7~10)
- 场景页跑 `fail-states.mjs` 同款探针:回忆区取不到数据时说"没能加载",不说"你还没练"
- 新表 DDL 逐字对照 `SQLAA/library-review-streak-table.sql`(我跑不了 DDL,只能这样审)

---

## 七、不做(复核)

规格里的四条:3 秒反应计时 / AI 批改口语作文 / 情境迁移任务 / 多步引导教程 —— 全不做。
我自己也不打算顺手做的:那 559 组 def_zh 撞车的**内容**清理、
给 `vocab_mistake_book` 加 `scene_item_id`(裁决 b 已否)。
