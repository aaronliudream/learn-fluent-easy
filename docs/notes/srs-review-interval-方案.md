# 错题复习间隔（SRS）改造方案 —— L 项，先出方案不动手

发现于完形错题空号改造的 F2 grep，与那次改造**完全解耦**（本方案不碰数据模型，只改一个 RPC + 一个 TS 函数）。
优先级排在拆条之前：拆条是数据模型，这个是每天都在生效的学习效果。

---

## 一、现状：三个缺陷，第 2 条比第 1 条严重

### 缺陷 1 —— 驱动量选错（Aaron 已指出）

`src/pages/ReviewToday.tsx:27-28`

```ts
const days = wrong_count >= 4 ? 3 : wrong_count >= 2 ? 7 : 14;
```

`wrong_count` 单调递增、永不回落。推论：某题历史上错过 4 次，此后**无论连对多少次，间隔永远锁死 3 天**。
SRS 的基本语义是「答对则拉长间隔」，这个公式结构上做不到，只会越来越密。

### 缺陷 2 —— 调度只在一处写，另外三条答对路径根本不排程 ⚠️

全仓检索 `user_mistakes.next_review_at` 的**写入点**，只有三处：

| 写入点 | 时机 |
|---|---|
| `ReviewToday.tsx:88` | 今日复习答对 → `nextReviewOnCorrect(wrong_count)` |
| `ReviewToday.tsx:105` | 今日复习答错 → 明天 |
| `supabase/functions/record-attempt/index.ts:178` | edge 新建错题行时给初值 |

而**答对的路径有四条**：今日复习、`/mistakes` 重做弹窗、登录强制复习门、各专区做对。
后三条走的都是 `bumpMistakeCorrect()` → RPC `bump_mistake_correct`，
而该 RPC（`SQLAA/PHASE3_mistakes_3day_streak_and_ghost_fix.sql:61-65`）只更新
`correct_streak / last_correct_date / is_resolved`，**完全不碰 `next_review_at`**。

后果：**在今日复习之外答对的题，`next_review_at` 停在过去，永远处于「已到期」状态**，
天天回到队列，直到跨 3 天连对满 3 次靠 `is_resolved` 才离场。
学生在复习门里答对一道题，明天它照样在队列里等着。

> 各写入器的 upsert（`recordZoneMistake` 等）也不写 `next_review_at`，
> 所以「再次做错」同样不重排。这是同一根因的另一面。

### 缺陷 2b —— 答错侧同样多入口，而且方向更坏（R 项补充）

答错路径的 `next_review_at` 写入实测：

| 答错路径 | 是否重排 `next_review_at` | 后果 |
|---|---|---|
| 今日复习 `ReviewToday.tsx:105` | ✅ 明天 | 正常 |
| edge `record-attempt/index.ts:178` | ✅ `dueAt`（1 天） | 正常 |
| 登录复习门 `MistakeReviewGate.tsx:130-137` | ❌ **答错完全不写库** | 排程不变 |
| `/mistakes` 重做弹窗 | ❌ **答错完全不写库**（`wrongPicked` 只用于 UI） | 排程不变 |
| 各专区直写 upsert（`recordZoneMistake` / `recordHubMistake` / `seniorGrammarMistake` / `JuniorClozePlay` / `JuniorReadingPlay` / `GaokaoReadingPlay` / `library/mistakes`） | ❌ payload 里没有这一列 | 见下 |

最后一类要特别说明：PostgREST 的 upsert 是 `INSERT … ON CONFLICT DO UPDATE SET <payload 里出现的列>`，
**没出现的列保留旧值**。所以一行被推到 +7 / +14 天之后，学生在专区里把这题**又做错了**，
`next_review_at` 依然是那个远期值 —— **刚做错却要等 7~14 天才回到队列**。

方向与 R 担心的相反但同样有害：不是"钉在过去出不去"，而是"该立刻回来却回不来"。
（"钉在过去"发生在答对侧，即缺陷 2。两侧凑齐了排程的两个方向都失灵。）

### 缺陷 3 —— 两者叠加

队列按 `order by next_review_at asc` + `limit(50)` 取。
被缺陷 2 钉在过去的老题排在最前，且因缺陷 1 间隔越缩越短 →
**错得多的老题长期霸占队列头部，新错题排在 50 名之后可能永远轮不到。**

**修复缺陷 1 而不修缺陷 2，等于没修**：新公式算出的间隔，那三条路径依然不会写进去。

---

## 二、新档位设计

### 主驱动改为 `correct_streak`

`correct_streak` 语义（`SQLAA/PHASE3…:31-65` + `src/lib/mistakeStreak.ts`）：
跨北京日 +1、同日不重复计、做错归 0、满 3 → `is_resolved` 移出。
**在册行的取值只可能是 0 / 1 / 2**（到 3 就离场了）。

| `correct_streak` | 基础间隔 | 说明 |
|---|---|---|
| 0（刚错 / 从没对过） | 1 天 | 与现有 `nextReviewOnWrong()` 一致 |
| 1 | 3 天 | |
| 2 | 7 天 | 在册最高档（满 3 即移出） |

### `wrong_count` 降级为「难度修正」，只缩不放

```
base    = [1, 3, 7][min(correct_streak, 2)]
factor  = wrong_count >= 4 ? 0.6 : wrong_count >= 2 ? 0.8 : 1.0
days    = max(1, round(base * factor))
```

实际取值表：

| | wrong_count 1 | 2–3 | ≥4 |
|---|---|---|---|
| streak 0 | 1 天 | 1 天 | 1 天 |
| streak 1 | 3 天 | 2 天 | 2 天 |
| streak 2 | 7 天 | 6 天 | 4 天 |

### 两条不变式（S 项，作为验收断言）

**取整策略写死：先乘后 `round()`，再套 `max(1, …)` 下限，单位为整数天。**

| # | 不变式 | 为什么必须有 |
|---|---|---|
| **I1** | **任何参数组合下，间隔 ≥ 1 天** | 否则 `1 × 0.6 = 0.6 天` → 当天再次到期 → 学生当天答对，但 `bump_mistake_correct` 按北京日判"同天"(`last_correct_date = _today`) → **streak 不增**。卡片当天反复出现、答对也不推进，且无任何报错。 |
| **I2** | 任何 `wrong_count` 下，`streak+1` 的间隔**严格大于** `streak` 的间隔 | 「答对一定拉长间隔」，正是缺陷 1 缺失的性质。最坏路径 1 → 2 → 4，成立。 |

I1 单靠 `round()` 不够（`round(0.6) = 1` 只是碰巧），必须显式写 `max(1, …)`，
否则将来有人调档位常量（比如基础档改 2 天、系数改 0.4）就会掉进同日死循环。
两条不变式在 RPC 里各配一条注释，并作为上线验收的断言项。

### 落点：写进 RPC，不写在前端

把「答对 → 重排 `next_review_at`」放进 **`bump_mistake_correct` 内部**：
它已经算出新 streak、已经在 UPDATE 同一行，加一句赋值即可。

这样做的三个好处：

1. **四条答对路径自动统一** —— 前端零改动，`ReviewToday.tsx:88` 那行 update 反而可以删掉。
2. 缺陷 2 与缺陷 1 一次性同时修掉。
3. 档位常量落在 `supabase/rpc/bump_mistake_correct.sql`，与 E / ⑧ 要求的
   「业务常量收进权威定义文件、PHASE 脚本不再各写一份」正好同一件事。

### 答错侧：新建 `bump_mistake_wrong`，**不是可选项**（R 项定稿）

初版把答错侧列为"可选、不阻塞"，**这个判断是错的**，收回。理由见缺陷 2b：
专区 upsert 会保留远期 `next_review_at`，做错的题要等 7~14 天才回来。
而且 **"14 天内全量收敛"这个承诺依赖答错侧补齐** —— 一行若一直被答错，
永远触发不到 `bump_mistake_correct`，就永远不会进入新档。

建议新建对称的 RPC `bump_mistake_wrong(_module, _source_key)`：

```
correct_streak    = 0
last_correct_date = null
last_wrong_at     = now()
wrong_count       = wrong_count + 1
next_review_at    = now() + 1 day     ← 关键:答错一律明天
```

前三行是现在各写入器 upsert 里**已经在做**的事，收进 RPC 后写入器可以不再各写一份。
调用点：复习门答错、`/mistakes` 重做答错、各专区写入器（把 upsert 的这几列换成 RPC 调用）。

> 为什么不复用同一个 RPC 加布尔参数：`bump_mistake_correct` 有"同北京日不重复计"的防刷分支，
> 答错侧不需要也不应该有（同一天错两次就该记两次）。合成一个函数会让防刷条件长出分叉，
> 反而更难核对。两个小函数各自可读性更好。

---

## 三、是否回填历史 `next_review_at`

**建议不回填。** 两个理由：

1. 历史 `next_review_at` 里混着「被 ReviewToday 推过的」和「从没被推过、停在过去的」，
   无法区分哪些是有意义的排程，重算等于用新公式覆盖掉一批本来正确的值。
2. 不回填也能自然收敛，而且很快 —— 见下。

### 自然收敛期：≤ 14 天

- 当前**已到期**的行：下一次被答对时立刻落入新档（新逻辑在 RPC 里，四条路径都会触发）。
- 当前**未到期**的行：保持旧排程直到到期，残留时长 ≤ 旧公式最大档 **14 天**。

→ **14 天内全量收敛，零迁移脚本。** 这是选「写进 RPC」而非「改前端函数」的额外好处。

⚠️ 待确认（SQL ⑪ 段）：当前 `next_review_at > now() + 14 天` 的行数应为 **0**。
若非 0，说明还有别处写过更远的值，收敛期估算要重算。

---

## 四、切换当日队列长度变化

- **切换当日：零跳变。** 新逻辑只在「答对那一刻」改写未来排程，不触碰任何现有
  `next_review_at` → 当日队列与前一天完全一致。这是「不回填」的直接推论。
- **之后 1–2 周：队列应显著缩短。** 现在大量「答对了但没经过今日复习」的题被钉在已到期状态天天回锅，
  新逻辑下它们答对一次就真的被推远。
- 具体数字待 SQL ⑪ 段的 `next_review_at` 分布 + 已到期行中 `correct_streak > 0` 的占比。
  后者直接就是「本该被推远却还在队列里」的存量规模。

---

## 五、交付切分

| # | 内容 | 依赖 |
|---|---|---|
| L-1 | `supabase/rpc/bump_mistake_correct.sql` 权威定义（含新档位 + I1/I2 注释）+ 删 `ReviewToday.tsx:88` 那行 update | 与 ⑧ 同轮 |
| L-2 | `supabase/rpc/bump_mistake_wrong.sql` 新建 + 各写入器改调它 + 删 `ReviewToday.tsx:105` | 与 L-1 同批（收敛承诺依赖它） |
| L-3 | 切换后 2 周回看队列长度，验证收敛 | L-1/L-2 上线后 |

与完形拆条**无任何依赖**，可并行。

### 交付物按 P 的规矩（T 项）

| 交付物 | 说明 |
|---|---|
| `supabase/rpc/bump_mistake_correct.sql`、`supabase/rpc/bump_mistake_wrong.sql` | 权威定义文件，**档位常量与 I1/I2 只写在这里** |
| `SQLAA/<日期>_srs_interval_migrate.sql` | 变更 SQL，`BEGIN/COMMIT` + 前后校验 |
| `SQLAA/<日期>_srs_interval_rollback.sql` | 回滚 SQL，可退回变更前定义 |
| 变更前定义留档 | Aaron 跑 `pg_get_functiondef` 贴回 → 存进权威文件作为 baseline，**先有 baseline 再改** |

⚠️ **这是 RPC，不是 edge function** —— 不需要 `supabase functions deploy`，
只需要 Aaron 在 SQL Editor 手动跑变更 SQL。部署步骤到此为止，不要多做也不要漏做。

### ⚠️ 前置确认（已核实）

今日复习自身的答对路径**确实**走 `bumpMistakeCorrect`（`ReviewToday.tsx:91`，
在 :88 那行 update 之后紧接着调用）。所以把排程写进 RPC 后删掉 :88，
这条路径不会失去写入 —— 它照样经 RPC 拿到新排程。
