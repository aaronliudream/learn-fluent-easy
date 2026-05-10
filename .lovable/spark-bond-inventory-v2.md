# Spark Bond/XP 触发点盘点 v2 + 数值提案

目标:把任务 2(让 Spark 对所有学习行为有反应)的范围一次盘清,并给出符合现有经济的数值提案,等用户拍板后再动代码。

## 一、现状盘点

### A. 现有 bond/XP 触发点(只有这些)

| 触发位置 | 函数 | +bond | +XP | 计入封顶 | 备注 |
|---|---|---:|---:|---|---|
| `PrimaryChat.tsx:123` 用户发消息 | `bondOnChatTurn` | +1 | 0 | 是(`DAILY_TURN_CAP=30`) | 每日上限 30 |
| `PrimaryChat.tsx:296` quiz 正确率 ≥60% | `bondOnQuizWin` | +5 | +20 | 否 | 唯一 XP 来源 |

常数 (`src/lib/petGrowth.ts`): `DAILY_TURN_CAP=30` · `BOND_PER_TURN=1` · `BOND_PER_QUIZ_WIN=5` · `XP_PER_QUIZ_WIN=20` · `LEVEL_THRESHOLD=100`。

**结论:** 全 App 只有 PrimaryChat 一个页面在喂 Spark。其余学习行为(听儿歌、读绘本、做课程、玩游戏、刷词、文化卡)全部静默。这就是任务 2 要堵的洞。

### B. 缺失触发点(已识别的"沉默"学习行为)

| 学习行为 | 文件:行 | 当前奖励 | Spark 反应 |
|---|---|---|---|
| 课程整课完成 | `PrimaryLesson.tsx:81` `awardCoins(5/10/20)` + `petReact("happy")` | 星币 | ❌ 无 bond/XP |
| 阅读关卡完成 | `PrimaryReadingPlay.tsx:98` 写 mastery | 星币(awardForCorrect) | ❌ 无 bond/XP |
| 词汇浏览/quiz | `PrimaryVocab.tsx:435,558` recordUnifiedAttempt | mastery | ❌ 无 bond/XP |
| 字母游戏完成 | `PrimaryGames.tsx:152` recordUnifiedAttempt | mastery | ❌ 无 bond/XP |
| 入学测评完成 | `PrimaryAssessment.tsx:208` recordUnifiedAttempt | mastery | ❌ 无 bond/XP |
| 文化卡盖章 | `PrimaryCulture.tsx:171` | 收藏 | ❌ 无 bond/XP |
| 字母学习单步完成 | `PrimaryLetters.tsx` | — | ❌ 无 bond/XP |
| 听儿歌/听力片段完成 | (尚未有独立模块,含在 lesson 内) | — | 需在 lesson step 粒度补 |

**关键洞察:** `recordUnifiedAttempt` 已经是统一的"学习行为发生"入口。最经济的做法是在 `record-attempt` 边缘函数返回后,客户端按 `module` + `is_correct` 派发 bond — 一次接线,所有现有 + 未来模块全覆盖。

## 二、数值提案(等用户 review)

### 设计原则

1. **完整学习行为 > 单点击答**:听完 2-3 分钟儿歌/读完 1 篇绘本 > 单题 quiz 答对。
2. **每日封顶统一池**:所有 bond 来源共用一个 daily cap,防刷。`DAILY_TURN_CAP` 改名 `DAILY_BOND_CAP`,从 30 提到 **60**(覆盖"今日冒险 4 件事 + 自由聊天 30 句")。
3. **完成今日冒险 4 件事 ≈ 升 1 级**:倒推总和 ≥100 bond。多余学习给金币不给 bond,避免"刷一晚升 5 级"。

### 提案表

| # | 行为 | 建议触发位置 | +bond | +XP | 计入封顶 | 备注 |
|---|---|---|---:|---:|---|---|
| 1 | 聊天每句 | `bondOnChatTurn` (现有) | 1 | 0 | ✅ | 不改 |
| 2 | quiz ≥60% | `bondOnQuizWin` (现有) | 5 | 20 | ❌ | 不改(quiz 触发量小) |
| 3 | 课程整课完成 1★ | `bondOnLessonComplete(stars)` | 10 | 30 | ✅ | 1★/2★/3★ → bond 10/15/25,XP 30/50/80 |
| 4 | 阅读绘本完成 | `bondOnReadingDone(stars)` | 15 | 50 | ✅ | 高价值,2-5 分钟参与 |
| 5 | 听力片段完成 | `bondOnListeningDone` | 12 | 40 | ✅ | 待 PrimaryListening 模块上线 |
| 6 | 字母/拼读单元过关 | `bondOnPhonicsDone` | 8 | 25 | ✅ | 短任务 |
| 7 | 词汇 quiz ≥70% | `bondOnVocabQuiz(acc)` | 6 | 20 | ✅ | 复用 ≥60% 阈值 |
| 8 | 文化卡盖章 | `bondOnCultureStamp` | 3 | 10 | ✅ | 轻量行为,小奖 |
| 9 | 入学测评完成 | `bondOnAssessmentDone` | 20 | 60 | ❌ | 一次性,不计封顶 |

### 推荐落地方式(单一接线点)

在 `useRecordAttempt.ts` 的 `recordUnifiedAttempt` 成功返回后,加一段:

```ts
import { bondForAttempt } from "@/lib/petGrowth";
if (input.stage === "primary" && result.success) {
  bondForAttempt({ module: input.module, item_type: input.item_type, is_correct: input.is_correct });
}
```

`bondForAttempt` 内部按上表的 module + item_type 路由到对应数值,统一走 `applyGrowth`。这样:

- 客户端各页面**无需改动**(已经在调 `recordUnifiedAttempt`)
- 新模块上线**自动接入**
- 唯一新增的"非 attempt"行为(聊天每句、文化卡盖章)继续直接调具名函数

## 三、待用户拍板的 3 件事

1. **数值表是否照此执行?** 如要调整,改哪几行?
2. **`DAILY_BOND_CAP` 提到 60 是否合适?** (旧 30 只覆盖聊天)
3. **接线方式是否选 `useRecordAttempt` 集中派发?** 备选:在每个页面单独调用具名函数(更显式但要改 8 个文件)。

签字后即可开工任务 2(预计半天完成接线 + 自测)。