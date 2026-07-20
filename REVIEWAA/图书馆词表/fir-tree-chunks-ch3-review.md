# 枞树 · 第 3 章 语块(chunk)候选 — 待审

> **CC 亲判亲抽**(不走 Gemini,配额 429)。判据同 ch1/ch2:可迁移才收、例句另造禁抄原文、逐词 literal、可分式 card-only、跨章去重。
> 产物:`SQLAA/library-chunks-fir-tree-ch3.sql`(3 条语块 / 3 卡 / 3 索引行,幂等 upsert,**未跑**)。审:①边界(该收/误收)②释义+例句(讲反没/简单没/没抄原文)。

## 自查基线
| 项 | 结果 |
|---|---|
| 例句抄原文 | **0**(生成器硬卡,=原文即报错退出) |
| surface 逐字命中出处句 | **全部通过**(硬卡) |
| 缺 literal / 缺例句 | **0 / 0**(硬卡) |
| 跨章重复卡 | 去重 0 张(只补索引不重出) · card-only 0 条 |

## 一、语块清单(3 条 · 请审边界+释义+例句)
| 语块 | 释义 | 例句(另造·简单) | 例句中译 | 逐词(literal) |
|---|---|---|---|---|
| **set fire to** | 点着、放火烧、使…着火 | A stray spark set fire to the dry grass by the road. | 一颗飞溅的火星点着了路边的干草。 | set=使…(着火)(非'放置'); fire=火; to=对…、给… |
| **fall upon** | 扑向、一拥而上(去抢或攻击) | The hungry children fell upon the food the moment it appeared. | 食物一端上来,饿坏了的孩子们就一拥而上。 | fall=猛扑(此处非'跌倒'); upon=向…、朝… |
| **the way of the world** | 世道就是这样、世间常情 | The strong win and the weak lose — that's just the way of the world. | 强者赢、弱者输——世道就是这样。 | the way=样子、常态; of the world=世间的、人世的(合起来=世道人情) |

## 二、我特意没收(边界·供你复核宽没宽/漏没漏)
(subagent 未记)

## 三、请你审 / 定
1. 边界:有没有该踢的(普通词组/太基础误收)?"没收"里有没有该捞回的?
2. 释义/例句:讲反没?例句简单没、没抄原文没?可分式 card-only 判断对没?
3. 审过 → Aaron 跑 `SQLAA/library-chunks-fir-tree-ch3.sql`(幂等,无需重部署 edge)→ :8080 第 3 章验珊瑚虚线+逐词节。

> 边界:只产文件+SQL(Aaron 跑);未落库、未改读路径/收藏、未合 main。SQL 只有 Aaron 手动跑。
