# 枞树 · 第 2 章 语块(chunk)候选 — 待审

> **CC 亲判亲抽**(不走 Gemini,配额 429)。判据同 ch1/ch2:可迁移才收、例句另造禁抄原文、逐词 literal、可分式 card-only、跨章去重。
> 产物:`SQLAA/library-chunks-fir-tree-ch2.sql`(2 条语块 / 2 卡 / 2 索引行,幂等 upsert,**未跑**)。审:①边界(该收/误收)②释义+例句(讲反没/简单没/没抄原文)。

## 自查基线
| 项 | 结果 |
|---|---|
| 例句抄原文 | **0**(生成器硬卡,=原文即报错退出) |
| surface 逐字命中出处句 | **全部通过**(硬卡) |
| 缺 literal / 缺例句 | **0 / 0**(硬卡) |
| 跨章重复卡 | 去重 0 张(只补索引不重出) · card-only 0 条 |

## 一、语块清单(2 条 · 请审边界+释义+例句)
| 语块 | 释义 | 例句(另造·简单) | 例句中译 | 逐词(literal) |
|---|---|---|---|---|
| **come to oneself** | 苏醒过来、回过神来、恢复知觉 | He fainted for a moment, but soon came to himself again. | 他昏了一会儿,但很快又醒了过来。 | come to=苏醒、恢复知觉(固定搭配,非'来到'); oneself=自己(文中作 himself) |
| **take root** | 生根、扎根;(念头等)扎下根来 | The young apple tree soon took root in the warm soil. | 那棵小苹果树很快在温暖的泥土里生了根。 | take=扎下、生出(与 root 合成,非'拿'); root=根 |

## 二、我特意没收(边界·供你复核宽没宽/漏没漏)
(subagent 未记)

## 三、请你审 / 定
1. 边界:有没有该踢的(普通词组/太基础误收)?"没收"里有没有该捞回的?
2. 释义/例句:讲反没?例句简单没、没抄原文没?可分式 card-only 判断对没?
3. 审过 → Aaron 跑 `SQLAA/library-chunks-fir-tree-ch2.sql`(幂等,无需重部署 edge)→ :8080 第 2 章验珊瑚虚线+逐词节。

> 边界:只产文件+SQL(Aaron 跑);未落库、未改读路径/收藏、未合 main。SQL 只有 Aaron 手动跑。
