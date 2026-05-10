# Phonics 学习引擎 v1

把"陪 Spark 学拼读"从"内容陈列"升级为"学习引擎"，复用已经验证过的 `primary_word_mastery` 套路，但拼读音用独立的新表（避免和单词混淆，避免破坏现有词汇 SRS）。

---

## 数据层

### 新表 `primary_phonics_mastery`（一次性迁移）

字段（套用 `primary_word_mastery` 的 SRS 字段，去掉 grade —— 拼读不分年级）：

```
id              uuid PK
user_id         uuid (FK auth.users)
phonics_id      text  -- 例如 "p_a", "p_ai", "p_sh"
quiz_correct    int default 0
quiz_wrong      int default 0
listen_correct  int default 0
listen_wrong    int default 0
mastery_level   smallint default 0   -- 0 未学 / 1 学过 / 2 熟练 / 3 掌握
ease            real default 2.5
interval_days   real default 0
due_at          timestamptz default now()
last_seen_at    timestamptz
created_at / updated_at + touch trigger
unique(user_id, phonics_id)
```

RLS：完全照抄 pwm 的 4 条 own-row 策略。

### 复用现有 SRS 工具

`src/lib/fsrs.ts`（PrimaryVocab 在用的）保持原样，写一个轻薄的 `phonicsMastery.ts` wrapper，两件事：
- `bumpPhonicsMastery(phonicsId, kind: "quiz"|"listen", correct: boolean)`
- `getPhonicsMasteryMap()` → `Map<phonicsId, { level, dueAt, ... }>`

---

## 路由

```
/primary/phonics                    -- 新：拼读冒险仪表盘（替代 /primary/letters 的位置）
/primary/phonics/learn/:phonicsId   -- 新：学单个音 + 自动 3-5 题小测
/primary/phonics/quiz/:groupId      -- 新：整组挑战测试，全过解锁下一组
/primary/letters                    -- 保留：A-Z 索引视图（家长 / 复习用）
```

Adventure 第 1 步从 `/primary/letters` 改为 `/primary/phonics`。

---

## 三个新页面

### 1. `PrimaryPhonics.tsx`（仪表盘）

加载：`PHONICS_GROUPS` + `PHONICS_ITEMS` + 当前用户 mastery map。

显示从上到下：
- Spark 顶卡："今天 Spark 想和你练 N 个音" —— N = 当前组里 level<3 的音数 + 到期复习数
- **进度条**：7 组横排，每组显示 `⭐⭐⭐○○○ x/y 已掌握`，未解锁的组上锁
- **3 个 CTA 卡**（按优先级）：
  1. 「继续学新音 X」→ 当前组里第一个 mastery_level=0 的音
  2. 「复习 N 个学过的音」→ `due_at <= now() AND level<3` 的音；点开进入 quiz 模式
  3. 「挑战组 X 测试」→ 当前组所有音 level≥1 时才显示

组解锁规则：组 N 的所有音 mastery_level≥2 → 解锁组 N+1。

### 2. `PrimaryPhonicsLearn.tsx`（学单个音）

复用 `PrimaryLetters.tsx` 的详情卡 UI（字母名 / 拼读音 / 口型 / 笔顺 / 儿歌 / 例词 / 小知识），不重写。

学习完点「我学会了 ✓」 → 立即进入 **inline mini-quiz**（3 题）：
- Q1 听音选字母：播放 `sound`，4 选 1（同组干扰）
- Q2 看字母选音：显示字母，4 个 IPA 选项
- Q3 选例词：播放例词，3 个 emoji 选 1
（字母组合没有 letterNameIpa → 跳过 Q2 改成第二种听音题）

每题 → `bumpPhonicsMastery(id, "quiz", correct)`。
3 题全对 → `mastery_level += 1`（最高 3）+ Spark 庆祝。
有错 → `due_at` 设为 1 天后再复习。

完成后回 `/primary/phonics`，下一张 CTA 自动指向下一个 mastery_level=0 的音。

### 3. `PrimaryPhonicsQuiz.tsx`（整组挑战 / 复习模式）

两种入口：
- `/primary/phonics/quiz/g2` → 该组全部音，每个音随机 1 题，答错的最后再考一遍
- `/primary/phonics/quiz/review` → SRS 到期的所有音

题型同 mini-quiz。全部通过 → 该组所有音 `mastery_level = max(level, 2)` → 下一组解锁 + Spark 进化动画（复用 `celebratePet`）。

---

## 改动 & 不改动

改：
- `src/lib/dailyAdventure.ts` 第 1 步 `to: "/primary/phonics"`
- 新建 3 个页面 + `phonicsMastery.ts` lib + 1 条迁移
- `src/App.tsx` 加 3 条路由

不改：
- `PrimaryLetters.tsx` 保持不动（A-Z 视图，作为字母索引备用）
- `primaryPhonics.ts` 数据文件不动
- 现有 `primary_word_mastery` 表不动
- 不引入新依赖

---

## 不在 v1 范围（下一轮再做）

- 错题本独立页（v1 用 SRS 自然推送即可）
- 家长周报里加 phonics 进度
- 拼读真词练习页（CVC/Magic E 那 59 个词，已经在数据里，下一轮做 `PrimaryPhonicsBlend.tsx`）
- 离线音频缓存

---

## 验收清单

孩子第一次进 `/primary/phonics` → 看到组 1 全部 0/6 + CTA「学新音 s」。
学完 s 答对 3 题 → 回仪表盘显示 1/6，CTA 变成「学新音 a」。
学完一组 6 个 → 「挑战组 1 测试」CTA 出现。
全过 → 组 2 解锁 + Spark 进化弹窗。
第二天打开 → 如果有到期复习，CTA 第二张显示「复习 N 个音」。

---

## 工作量预估

约 4 个文件新建 + 2 个文件小改 + 1 条迁移 + 1 条路由更新。预计单轮做完，做完直接给你 yes/no 自审清单。
