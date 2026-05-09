
# 词汇系统化通关 · 实施方案

## 目标

把现在散点的词汇游戏串成一条**必经路径**：每个词独立走 5 级，全部掌握后自动进 FSRS 复习池，按遗忘曲线回灌；不再让用户自己挑游戏。

## 数据层（不需新建表）

现有 `gaokao_user_mastery` / `junior_word_mastery` 已经有 `mastery_level (smallint)`、`difficulty/stability/due_at`（高考）或 `ease/interval_days/due_at`（初中）。**无需迁移**，直接复用。

约定：
- `mastery_level` 取值 `0..5`，含义如下
  - 0 = 新词 / 未学
  - 1 = 看过卡片
  - 2 = 中→英 选择通过
  - 3 = 英→中 选择通过
  - 4 = 听音拼写通过
  - 5 = 完形/造句通过 → **退出主队列，进 FSRS 复习池**
- 答对 → `level + 1`；答错 → `level - 1`（最低 1，不打回 0，避免挫败）
- 升到 5 时写 `reached_master_at = now()`，并按答题时长触发 `fsrsSchedule()` 写入 `due_at`
- FSRS 复习答错 → `level` 打回 3，重走 4、5

## 新增模块

### 1. `src/lib/vocabMastery.ts` — 通用状态机
统一两个学段（gaokao / junior）的逻辑：
```ts
type Stage = 'gaokao' | 'junior';
getNextWord(stage, unitId): Promise<{ vocab, level }>      // 取当前单元里 level 最低的词
recordVocabAttempt(stage, wordId, level, isCorrect, latencyMs)
                                                            // 升降级 + 升到5时调度FSRS
getDueReviews(stage, limit): Promise<Vocab[]>               // FSRS 到期池
```
内部按 stage 切表名，封装两套字段差异。

### 2. `src/components/vocab/GuidedSession.tsx` — 通关容器
一个组件跑完 8–10 个词的「这一关」：
- 顶部进度条：当前词 / 本关词数 / 平均等级
- 中间根据当前词的 `level` 渲染对应题型组件
  - L0/L1 → `<FlashcardStep>` （已存在，抽提）
  - L2 → `<Cn2EnQuiz>`（已存在）
  - L3 → `<En2CnQuiz>`（已存在）
  - L4 → `<ListenSpellStep>`（已存在）
  - L5 → `<ClozeStep>`（已存在）
- 答题后调 `recordVocabAttempt`，立刻取下一题（不一定是同一个词，按 level 最低优先轮转）
- 全员到 5 → 显示通关页（金币 + 徽章 + 解锁下一单元）

### 3. `src/components/vocab/ReviewPool.tsx` — FSRS 复习入口
首页/词汇页顶部一个卡片：「⏰ 你有 N 个词到了复习时间」。点进去用 `GuidedSession` 跑混合题型小测（每个词随机抽 L3–L5 之一）。

## 改造现有页面

### `src/pages/GaokaoVocab.tsx` & `src/pages/JuniorVocab.tsx`
- 默认入口改成 **"开始本单元通关"** 按钮 → 跳 `GuidedSession`
- 现有的零散游戏入口（freq browse / spell-only / dictation 等）收进 **"自由练习"** 折叠区，老用户照常能用
- 顶部加 `ReviewPool` 卡片
- 词列表里给每个词显示 5 颗灯（L1..L5），亮的代表已通过——视觉上立刻看到自己在哪一级

### `src/components/vocab/VocabMasteryPath.tsx`
现有的关卡地图：每关亮灯条件改为「该单元所有词 `mastery_level >= 5`」。

## 不动的部分

- 词条数据 / 例句 / 音频 / TTS 全部复用
- `fsrs.ts` 不改
- 已有 mastery 行不动（`mastery_level` 现状值仍然有意义；旧用户首次进入会自然按规则演进）

## 文件清单

| 操作 | 文件 |
|---|---|
| 新增 | `src/lib/vocabMastery.ts` |
| 新增 | `src/components/vocab/GuidedSession.tsx` |
| 新增 | `src/components/vocab/ReviewPool.tsx` |
| 修改 | `src/pages/GaokaoVocab.tsx`（顶部加引导入口 + 复习池） |
| 修改 | `src/pages/JuniorVocab.tsx`（同上） |
| 微调 | `src/components/vocab/VocabMasteryPath.tsx`（亮灯阈值） |

## 落地分两轮

**第一轮（这次）**：
- 写 `vocabMastery.ts` 状态机
- 写 `GuidedSession` 容器（先用最简单的 5 个题型 step）
- 写 `ReviewPool` 卡片
- 在两个 Vocab 页顶部插入 **"开始通关 / 复习池"** 两张卡片，**不删旧入口**

这样可以立刻验证流程，老功能也不破坏。

**第二轮（验证 OK 之后）**：
- 把零散入口收折叠 / 去掉
- `MasteryPath` 亮灯逻辑统一
- 加金币、徽章、连续打卡奖励

## 风险与回避

- **数据兼容**：旧 `mastery_level` 已是 1..5 范围，规则不冲突
- **样式不一致**：`GuidedSession` 复用现有 step 组件的样式，不引入新的设计 token
- **加载性能**：`getNextWord` 一次只查 1 条 + 单元词列表缓存，避免重复请求

---

请确认这个方向。确认后我执行**第一轮**（约 4 个新/改文件，~600 行代码）。
