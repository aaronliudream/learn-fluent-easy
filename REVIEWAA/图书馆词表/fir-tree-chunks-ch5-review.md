# 枞树 · 第 5 章 语块(chunk)候选 — 待审

> **CC 亲判亲抽**(不走 Gemini,配额 429)。判据同 ch1/ch2:可迁移才收、例句另造禁抄原文、逐词 literal、可分式 card-only、跨章去重。
> 产物:`SQLAA/library-chunks-fir-tree-ch5.sql`(1 条语块 / 1 卡 / 1 索引行,幂等 upsert,**未跑**)。审:①边界(该收/误收)②释义+例句(讲反没/简单没/没抄原文)。

## 自查基线
| 项 | 结果 |
|---|---|
| 例句抄原文 | **0**(生成器硬卡,=原文即报错退出) |
| surface 逐字命中出处句 | **全部通过**(硬卡) |
| 缺 literal / 缺例句 | **0 / 0**(硬卡) |
| 跨章重复卡 | 去重 0 张(只补索引不重出) · card-only 0 条 |

## 一、语块清单(1 条 · 请审边界+释义+例句)
| 语块 | 释义 | 例句(另造·简单) | 例句中译 | 逐词(literal) |
|---|---|---|---|---|
| **look to oneself** | 照看自己、顾自己、留意自身 | With so many guests to serve, she had no time to look to herself. | 要招呼这么多客人,她根本没工夫顾自己。 | look to=照料、留意(固定搭配,非'看向'); oneself=自己(文中作 himself) |

## 二、我特意没收(边界·供你复核宽没宽/漏没漏)
(subagent 未记)

## 三、请你审 / 定
1. 边界:有没有该踢的(普通词组/太基础误收)?"没收"里有没有该捞回的?
2. 释义/例句:讲反没?例句简单没、没抄原文没?可分式 card-only 判断对没?
3. 审过 → Aaron 跑 `SQLAA/library-chunks-fir-tree-ch5.sql`(幂等,无需重部署 edge)→ :8080 第 5 章验珊瑚虚线+逐词节。

> 边界:只产文件+SQL(Aaron 跑);未落库、未改读路径/收藏、未合 main。SQL 只有 Aaron 手动跑。
