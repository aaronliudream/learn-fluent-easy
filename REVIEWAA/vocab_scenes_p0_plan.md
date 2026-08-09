# 场景串记学习闭环 P0 —— 实现方案(待 Aaron 确认后再动手)

**日期**:2026-08-09 · **状态**:⏳ 方案待批,**一行代码都还没写**
**规格来源**:`vocab-scenes-closed-loop-p0`(Aaron 2026-08-09)

---

## 〇、先说结论:五项里有 **两项半** 卡在同一个地方

勘验完现有代码和数据,最要紧的一件事是:

> **262 个场景节点里,只有 7 个有 `word_id`(2.7%)。**

而错题本(`vocab_mistake_book`)、掌握度(`user_vocab_mastery`)、今日学习(`buildTodayPlan`)
**三者全部按 `word_id` 索引**。也就是说规格里这几句照字面做不了:

- P0-3「答错的节点**写错题本**,接现有 SRS」
- P0-4「未掌握的节点进复习队列,**接今日学习那套排程**」

不是难做,是**没有挂靠点**。方案第三节给了取舍,请你拍一个。

其余 P0-1 / P0-2 / P0-5 没有障碍,可以直接做。

---

## 一、勘验实测(2026-08-09 现查,不是凭记忆)

### 数据

```
场景包 30 个 · 节点 262 个 · 每包 8~11 个(平均 8.7)

kind            总数   有word_id   有音频
word              65          7       65
collocation       83          0       83
contrast          30          0       30
chunk             84          0       83

有 word_id 的节点:7 / 262 = 2.7%
goal_zh 列:不存在(PostgREST 42703)
```

`contrast` 恰好**每包 1 个**,形如 `en="direct vs connecting" / zh="直飞 vs 中转"`。
其中至少一条的 `text_zh` 是一整段解释(「可生物降解 vs 不可生物降解,可生物降解指…」)——
说明 contrast 的 `text_zh` **不是短释义**,结构上和另外三型不同。

### 代码

| 现成的 | 位置 | P0 能不能复用 |
| --- | --- | --- |
| 五段版式 + 首访逐步展开 | `VocabSceneDetail.tsx`(579 行) | ✅ 全部保留,新东西长在里面 |
| **挖空自测开关**(`cloze` + `peeked`) | 同上,第 57-59 行 | ✅ **P0-2 就是把它升级成三档** |
| 场景进度(localStorage) | `scenes.ts` `readSceneProgress` / `markSceneNodes` | ⚠️ 只有本地、只记"看到第几环" |
| 掌握判定 | `data.ts` `isMasteredRow` | ❌ 按 word_id,场景用不上 |
| 错题本写入 | `vocabMastery.ts` `addMistake(uid, wordId, mode)` | ❌ 同上 |
| 今日学习编排 | `todayPlan.ts` `buildTodayPlan(bankId)` | ❌ 三个数据源全是 word_id |
| 挖空(容忍屈折) | `blankOut.ts`(真库实测 975/978) | ✅ 归一化思路可借,但它做的是"挖",不是"判对错" |

⚠️ **规格里提到的 `textmatch.mjs` 在本仓库不存在**(全仓搜过,零命中)。
那是别的板块的闸门脚本,不在 `src/` 里、也没有前端可用的版本。
所以 P0-3 的宽松匹配**要新写一个**(不大,约 60 行 + 测试),不是"复用现有的"。

---

## 二、逐项方案

### P0-1 场景目标 —— 🟢 无障碍

- DDL:`vocab_scene_packs` 加 `goal_zh text`(一列,可空)。出 `SQLAA/`。
- 前端:详情页主题头下加一行,`goal_zh` 为空时**整行不渲染**(不留空壳,与 benefits/drawbacks 同一套做法)。
- 内容:30 条我来写,**出送审件给你审**,审完再出 UPDATE SQL。
- 工作量:小。

### P0-2 三阶递减提示 —— 🟢 无障碍,是**改造**不是新增

现有 `cloze` 布尔开关(全显 / 全挖)升级成三档:

| 档 | 显示 | 现在有吗 |
| --- | --- | --- |
| ① 全显 | 英文 + 中文 + 🔊 | ✅ `cloze=false` |
| ② 半显 | `b_____ 浏览` (首字母 + 中文) | ❌ 新增 |
| ③ 只给中文 | `浏览`,点击才翻英文 | ✅ 约等于现在的 `cloze=true` + `peeked` |

- `cloze: boolean` → `hintLevel: 1 | 2 | 3`,**默认 1**,`peeked` 逻辑原样保留(任何档都能点开偷看)。
- 切换器放词链区顶部,替换现在那个「挖空自测」按钮 —— **不新增卡片层级**。
- ⚠️ 档位存 localStorage(与自动朗读同一套写法),别每次进来都回到 ①。
- 工作量:小。

### P0-3 中译英回忆 —— 🟡 主体可做,**SRS 那半卡住**(见第三节)

**能做的部分(不依赖任何裁决)**:

- 词链下方新增练习区(长在第②段里,不新起一张卡)。
- 逐条给中文,输入英文,提交判对错;答错显示正确答案 + 该节点例句。
- 全做完给「本场景 N/M 能主动想起来」。

**三个必须先定的细节**:

1. **contrast 节点排除在外**(30 个)。让用户把「直飞 vs 中转」默写成 `direct vs connecting`
   考的是背题不是回忆。所以分母 M = `word + collocation + chunk`,每包约 7~10 个。
   → 规格里的「6/8」判据仍成立,只是分母改成"可回忆节点数"。
2. **宽松匹配怎么松**。要新写 `src/lib/vocab/looseMatch.ts`:
   小写化、去首尾/多余空格、去标点、冠词 a/an/the 可有可无、
   物主代词 my/your/his/her/their 互通、常见屈折(-s/-es/-ed/-ing)容忍。
   ⚠️ 但**中译英天生不是单答案题**:「迅速走红」写成 `go viral` 对,写成 `become popular fast` 也不算错。
   机器判不了这个(第九条:分不清就别硬判)。
   → 做法:机器只判"是不是目标说法";不匹配时**不说"你错了"**,而是显示
     「目标说法是 go viral」+ 一个「**我写的也对**」按钮。点了算对,并把这条记下来
     (攒够了我给你出一份人工看的清单)。这样既不误判,也不放水。
3. **答错要不要写错题本** —— 见第三节,需要你拍板。

### P0-4 场景掌握度取代"已学" —— 🟡 前端可做,**落库位置要裁决**

- 掌握度 = P0-3 里答对的节点数 / 可回忆节点数;**≥80%** 才算完成,否则「继续训练」。
- 列表页每张卡把"已学"改成「掌握 6/8」。
- ⚠️ 现在的进度是 `localStorage`(`readSceneProgress`),**换设备就没了**。
  掌握度是学习成果,和"看到第几环"不是一个量级的东西 —— 我建议落库,见第三节。

### P0-5 短文接回忆 —— 🟢 无障碍

- 短文区下方加「合上短文,自己讲一遍」→ 隐藏短文,只留该包的中文提示词(复用 P0-3 的节点列表)。
- 自评「能讲出来 / 讲不全」,选后者滚回 P0-3 练习区(不是跳页,同页锚点)。
- 不做 STT,与规格一致。
- 工作量:小。

---

## 三、🟥 需要你拍板的三件事

### 裁决 ① 场景回忆的数据落在哪(**最关键,决定 P0-3/P0-4 的形态**)

| 方案 | 做法 | 代价 |
| --- | --- | --- |
| **A(我推荐)** | 新建一张 `vocab_scene_recall`,主键 `(user_id, scene_item_id)`,带 `correct_count / wrong_count / last_result_at / next_review_at` | 加一张表(纯新增,不动任何现有表);跨设备同步;将来接今日学习只要在 `buildTodayPlan` 里多拉一路 |
| B | 给这 255 个节点在 `vocab_words` 里造词条,再挂进一个隐藏库 | ❌ **不建议**:`go viral`、`fact-check the output` 不是"词",进了 `vocab_words` 会污染词库计数、进四选一干扰项池、进磨耳朵朗读队列 |
| C | 全部留在 localStorage(和现在的进度一样) | 便宜,但换设备清零、也接不了今日学习 —— 等于 P0-4 后半句做不了 |

**我推荐 A。** 它是纯新增表,不碰 `user_vocab_mastery` / `vocab_mistake_book`
(那两张是全站共用的,改它们要动统一错题本那条线,属于另一个工程)。

### 裁决 ② 场景错题要不要进 `/mistakes`

`vocab_mistake_book.word_id` 是必填且指向 `vocab_words` —— 97.3% 的场景节点填不进去。

| 方案 | 做法 | 代价 |
| --- | --- | --- |
| **A2(我推荐)** | 场景错的节点**只留在场景内**(记在 `vocab_scene_recall`),在场景卡上体现成「继续训练」 | P0 范围内闭环完整;`/mistakes` 不变 |
| A1 | 给 `vocab_mistake_book` 加 `scene_item_id` 列并把 `word_id` 改成可空 | 动的是**全站统一错题本**那张表(三个学段 + 美语板块都在写),风险与工作量都超出 P0 |

**我推荐 A2**,并把 A1 挂进统一错题本那条线的 backlog。

### 裁决 ③ P0-4「接今日学习那套排程」这一期做到哪

- **最小可用(推荐)**:`vocab_scene_recall` 记 `next_review_at`,**场景列表页**按到期排序、
  未掌握的置顶。今日学习主卡**暂不**混入场景节点。
- **完整**:`buildTodayPlan` 多拉一路到期的场景节点,和词一起排进今日任务。
  ⚠️ 这会改动刚刚优化过的 `buildTodayPlan`(#336),而且今日学习的每一题都走
  `recordAnswer(wordId, ...)` —— 场景节点没有 wordId,**整条作答/写库链路都要分叉**。
  这不是加一路查询的事,是把今日学习从"词的序列"改成"混合序列"。

**我推荐最小可用**,完整版单独立项。

---

## 四、改动清单(按裁决 A / A2 / 最小可用 计)

**新增**
```
SQLAA/2026xxxx_vocab_scene_goal_ddl.sql          goal_zh 一列
SQLAA/2026xxxx_vocab_scene_recall_ddl.sql        新表 + RLS(按 user_id 隔离)
SQLAA/2026xxxx_vocab_scene_goal_content.sql      30 条目标文案(⚠️ 审过再出)
REVIEWAA/vocab_scene_goals.md                    30 条送审件
src/lib/vocab/looseMatch.ts                      宽松匹配 + 测试
src/lib/vocab/looseMatch.test.ts
src/lib/vocab/sceneRecall.ts                     读写 vocab_scene_recall + 掌握度算法
src/lib/vocab/sceneRecall.test.ts                掌握度阈值/分母口径
src/components/vocab/SceneRecall.tsx             P0-3 练习区(长在第②段里)
```

**改动**
```
src/pages/vocab/VocabSceneDetail.tsx   cloze→hintLevel 三档 / 目标行 / 练习区 / 合上短文
src/pages/vocab/VocabScenes.tsx        列表卡"已学"→「掌握 N/M」
src/lib/vocab/scenes.ts                ScenePack 加 goal_zh;进度读写改走 sceneRecall
```

**不动**:词链事件顺序结构、双档短文、Benefits-Drawbacks、现有视觉语言、
`vocab_words` / `user_vocab_mastery` / `vocab_mistake_book` / `buildTodayPlan`。

---

## 五、分期(每期一个 PR,能独立验收)

| 期 | 内容 | 依赖 |
| --- | --- | --- |
| 1 | P0-2 三阶提示 + P0-1 目标行(带列不带内容) | 只需 `goal_zh` DDL |
| 2 | `looseMatch` + P0-3 练习区(先只算当次、不落库) | 无 |
| 3 | `vocab_scene_recall` 落库 + P0-4 掌握度 + 列表卡 | 裁决 ①③ |
| 4 | P0-5 合上短文 + 30 条目标文案上库 | 目标文案审过 |

先做 1、2 也能立刻验收(那两期是纯前端,不等任何 SQL)。

---

## 六、验收判据

规格给的是:**学完的用户能在不看提示的情况下,用中文提示说出至少 6/8 个表达**。
这条要真机验;我这边能自己验的是:

- 三档切换在 SE 375×667 上不把词链挤出首屏(量实际像素,不看截图)
- `looseMatch` 的测试要**同时**覆盖"该判对的"和"不许判对的"两侧
  (只测前者会写出一个什么都判对的匹配器)
- 掌握度分母在 30 个包上逐包核一遍(contrast 排除后,每包 7~10)
- 场景页跑 `fail-states.mjs` 同款探针:回忆区取不到数据时说"没能加载",不说"你还没练"

---

## 七、我不建议一起做的(规格里也写了不做,这里只是复核)

3 秒反应计时 / AI 批改口语作文 / 情境迁移任务 / 多步引导教程 —— 全部不做。
另外我自己也**不打算**顺手做的:那 559 组 def_zh 撞车的内容清理(见 `vocab_def_en_duplicates.md`)、
`/mistakes` 接场景错题(裁决 ② 的 A1)。
