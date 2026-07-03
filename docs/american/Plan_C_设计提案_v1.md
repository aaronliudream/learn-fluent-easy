# Plan C 机制强化 · 设计提案 v1（Aaron 过目后再动手）

> B 线一轮工程,全课程生效。顺序:先 4+5(数据侧)→ 再 1-3(逻辑侧)。每步幂等,seed 走分片。
> ⚠️ 本文档是**设计**,尚未写任何代码/SQL。#1 SRS 需你签字后才落地。

---

## 决策速览（请逐条确认 / 打回）

| # | 要点 | 我的方案 | 需你拍板 |
|---|---|---|---|
| 1 | SRS 复习池落库 | 复用现有 `american_user_mastery` 的 SRS 列(due_at 等),**零建表零迁移** | 池范围 + UI 入口位置 |
| 2 | 掌握口径收紧 | 仅改 `am_grammar_point`:净分≥3 且末次答对;答错 -1(下限0) | 是否也收紧 am_question(单题环) |
| 3 | 关10 通关 | 全对才亮星;有错当轮结束**直接重考错题**,全对才通关 | 重考行为细节 |
| 4 | 关7 抽题池 | 每轮从该课池随机抽 6 空,跨轮去重(localStorage),池耗尽重置 | 无(照规格) |
| 5 | 扩容包入库 | 关5+48 挂既有考点(门禁已过)/关7+26空/关10+18;273 题;走分片 | 门禁结果见下 |

---

## #5 扩容包 · 考点挂接门禁【已验,通过】

48 道关5增补**全部对上单元1既有 grammar_point,零需新建**:

| 课 | 增补(考点描述→挂接) |
|---|---|
| L1 | Is this...?×5→`gp1` · my/your×3→`gp2` |
| L2 | Here's/Here are×5→`gp1` · sorry/excuse×3→`gp2` |
| L3 | 冠词 a/an×5→`gp1` · This is+人/国籍×3→`gp2` |
| L4 | Are you...?×5→`gp1` · a/an+职业×3→`gp2`(gp2 含"What's your job? 与 a/an+职业") |
| L5 | How are you?×5→`gp1` · 形容词表语×3→`gp2` |
| L6 | Whose+'s×5→`gp1` · his/her×3→`gp2` |

**对账基准复核**:关5 49→97(+48) · 关7 29→55(+26) · 关10 42→60(+18);单元1 总题 181→**273**。关7 池:L1=4+6=**10** / L2–L6=5+4=**9**。全部与扩容包底账一致 ✓。

---

## #1 SRS 复习池 · 落库设计【重点,待签字 —— 先选 A / B】

### 先厘清 junior 现状(调研结论)
- junior SRS = **一张 `mastery_progress` 表**(`module` 自由文本判别 + `item_id` + `stars 0–5` + `next_review_at`),阶梯 `REVIEW_DAYS=[1,3,7,14,30,90]` 按 stars 取,逻辑全在 `src/lib/masteryProgress.ts`。**只在满分推进 next_review;答错降 1 星、保留旧 due;stars=5 永久毕业不再复现。**
- 错题本(`user_mistakes`)是**另一张独立表**,不与 SRS 混。
- ⚠️ 你原话"复用 mastery_progress 的 SRS **思路**"+"不新建重复机制"有两种落法,后果不同 ⇩

### 方案 A(推荐)：在 `american_user_mastery` 现有 SRS 列上实现
`american_user_mastery` 建表即镜像了 junior 的 FSRS 列(`due_at / next_review_at / stability / difficulty / lapses / last_result / mastery_matrix`),现全闲置。直接启用:
- `due_at` = 复习池判据(`due_at<=now()` 到期);`mastery_matrix.srs_step` 记档 0/1/2/3;`lapses` 答错+1。
- **零建表零迁移**;美语数据全留在 `american_*` 表内 → **守住互通铁律**(将来"美语专项"读同一份表)。
- 代价:阶梯/写入逻辑要在 american 侧新写一份(≈50 行),算"复用思路"非"复用引擎"。

### 方案 B：直接复用 `mastery_progress` 表 + `masteryProgress.ts` 引擎
新增 module 字符串(如 `american_question`),每次作答调既有 `recordMastery({module,itemId,pct})`,读用既有 `loadDueReviews([...])`。
- 真正"不新建任何机制",零新代码逻辑(只加 module 常量 + 调用点)。
- 代价:美语掌握被拆到两张表(掌握环在 `american_user_mastery`,SRS 在 `mastery_progress`)→ **破互通铁律**;且 junior 阶梯是 [1,3,7,14,30,90]/满分推进,与你要的 [1,3,7]→出池口径不同,要么改公共 `masteryProgress.ts`(影响 junior/高考),要么给美语单独分支(又变回"新机制")。

> **我的建议 = A**:守互通铁律 + 你要的短阶梯([1,3,7]→出池)本就和 junior 不同,单独实现更干净;而"不新建重复机制"的精神(不建第二张 SRS 表)靠"复用 american_user_mastery 已有列"同样满足。**但这是你的架构决定,请点 A 或 B。**

### 区间阶梯(A/B 通用,照你给的口径)
```
答错  → srs_step=0, due=now()               —— 下一轮复习必出
答对  → step0 →+1天(→1) / step1 →+3天(→2) / step2 →+7天(→3) / step3 →出池(due=NULL)
任意答错 → 打回 step0、due=now()、lapses+1    —— 重新爬梯(连过 1/3/7 天三档才毕业)
```
常量 `AM_SRS_LADDER_DAYS = [1, 3, 7]`。

### 池范围(A/B 通用)
- **仅 `am_question`**(关5–10 的题):答错即入池——唯一可"重放"的题型。
- 排除 `am_grammar_point`(聚合掌握,非可重放)、`am_sentence`/`am_prelisten`(关1 覆盖,非测验)。
- 词(关2/3/4)走 `american_word_mastery`(已自带 due_at/interval),**本期不动**。

### 读取 + UI 入口(A/B 通用)
- `fetchReviewPool()`:查本人到期 am_question,按 item_id 回捞 `american_questions` 原题 → 复用 QuizRunner。
- **入口:美语 hub 顶部「今日复习(N)」卡**(N=0 不显示);点进 = 跨全课程做到期题;答题照上面阶梯更新 due。

### 与 #2/#3 的关系
- 复习池(#1,跨课跨天,按 due_at)与掌握口径(#2,净分)是两套字段,互不干扰。
- 关10 重考(#3)是**单课当轮内**错题重做;SRS(#1)是**长期复现**。两者独立。

---

## #2 掌握口径收紧【逻辑侧】

改 `recordMastery`,**仅 item_type='am_grammar_point'** 分支:
```
correct_count = isCorrect ? c+1 : max(0, c-1)     // 答错扣分,下限0
mastered = (correct_count >= 3) && (last_result === 'correct')   // 净分≥3 且末次答对
mastery_level = mastered ? 4 : (有作答 ? 1 : 0)
```
- `am_question` 维持答对2次(单题掌握环口径不变)——**除非你要求一并收紧**。
- 双环里 gp 掌握占比随之收紧;seed/内容零改动,纯写入逻辑。

---

## #3 关10 通关口径【逻辑侧】

- 现状:onComplete 无条件 markStageComplete;≥80% 亮 🏆。
- 改为:**每轮结算后**,若有错题 → 不通关、不亮星,直接进"错题重考"轮(只出本轮错的);循环直到某轮**全对** → markStageComplete(10) + 🏆。
- 实现:AmericanFinalQuizStage 加"轮"状态,QuizRunner 结算回传本轮错题 id 集;错题非空则用错题子集重挂 QuizRunner(key=轮次),空则通关。
- 掌握仍每题 recordMastery(含重考的每次作答,答错照样进 SRS 池)。

---

## #4 关7 抽题池【数据侧逻辑,配合 #5 扩容】

- 池 = 该课全部 stage7 题(既有 + 扩容)。每轮**随机抽 6 空**。
- 跨轮去重:localStorage `am.cloze.seen.<lessonId>` 记已出空;优先抽未出过的;未出 <6 时,先取剩余未出 + 重置已出集合、从新池补足(排除本轮已抽)。
- 轮内按 blank_no 升序展示(读起来连贯);context 用题自带 payload.context。
- 落库层无改动,纯 AmericanClozeStage 取题逻辑改造。

---

## 落地顺序 & 幂等

1. **#5 扩容包 seed**(数据):生成器加"扩容源"增广单元1 关5/关7/关10;seq 接既有续号;ON CONFLICT 幂等;分片重出(落 part1_unit01-04)。anon 查库对账 273。
2. **#4 关7 池**(前端逻辑):AmericanClozeStage 改随机抽 6 + 去重。
3. **#1 SRS**(接线 + UI):data.ts 写 due_at 阶梯 + fetchReviewPool + hub 复习卡。**← 本项待你签字**
4. **#2 口径**(写入逻辑):recordMastery 的 gp 分支。
5. **#3 关10**(前端逻辑):重考错题环。

每步独立提交、独立可回滚;seed 幂等;前端改动 tsc0 后才交。
