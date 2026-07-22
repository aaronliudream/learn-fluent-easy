# 汤姆·索亚历险记 · 第 34 章 语块(chunk)候选 — 待审

> **CC 亲判亲抽**(不走 Gemini,配额 429)。判据同 ch1/ch2:可迁移才收、例句另造禁抄原文、逐词 literal、可分式 card-only、跨章去重。
> 产物:`SQLAA/library-chunks-tom-sawyer-ch34.sql`(16 条语块 / 12 卡 / 14 索引行,幂等 upsert,**未跑**)。审:①边界(该收/误收)②释义+例句(讲反没/简单没/没抄原文)。

## 自查基线
| 项 | 结果 |
|---|---|
| 例句抄原文 | **0**(生成器硬卡,=原文即报错退出) |
| surface 逐字命中出处句 | **全部通过**(硬卡) |
| 缺 literal / 缺例句 | **0 / 0**(硬卡) |
| 跨章重复卡 | 去重 5 张(只补索引不重出) · card-only 3 条 |

## 一、语块清单(16 条 · 请审边界+释义+例句)
| 语块 | 释义 | 例句(另造·简单) | 例句中译 | 逐词(literal) |
|---|---|---|---|---|
| **be used to** | 习惯于 | I'm not used to getting up so early. | 我还不习惯这么早起床。 | used=习惯的(此处非“用过”，指“对…习以为常”); to=对于(后接名词或动名词) |
| **take care of** | 照顾；负责处理 | Please take care of my dog while I'm away. | 我不在的时候请帮我照顾狗。 | take=承担; care=照料; of=对…(负责) |
| **on account of** | 因为；由于 | The game was cancelled on account of the rain. | 比赛因为下雨取消了。 | on=基于; account=缘由(此处非“账户”，指“原因”); of=…的 |
| **get along with** | 应付、把事办成；(与人)相处 | How are you getting along with your new job? | 你的新工作进展得怎么样？ | get=进展; along=向前(此处指“进行、进展下去”); with=凭借、和 |
| **let on** | 假装、佯装;(次义)走漏口风、说出去 | She let on that she didn't care, but she did. | 她装作不在乎,其实很在意。 | let=让; on=(习语介词)(单独无实义，须整体记忆) |
| **spring something on someone** | 冷不防向某人抛出(消息/要求) | He sprang the news on us right at dinner. | 他就在晚饭时冷不防向我们抛出这消息。 | spring=突然抛出(此处非“春天/弹跳”); something=某事物; on=冲着(某人) |
| **never mind** | 别管；没关系 | Never mind the mess—we'll clean it up later. | 别管这一团乱，我们待会儿再收拾。 | never=不必; mind=在意、介意 |
| **catch it** | 挨骂；受罚 | If you break that vase, you'll really catch it. | 你要是打碎那花瓶，可有得挨骂了。 | catch=招来(此处非“抓住”，指“惹来(责罚)”); it=(指责骂/惩罚) |
| **and so forth** | 等等；诸如此类 | Bring pens, paper, rulers, and so forth. | 把笔、纸、尺子等等都带上。 | and=和; so=如此; forth=向前(此处为习语固定用词) |
| **out of doors** | 在户外；到室外 | The children love playing out of doors all day. | 孩子们喜欢一整天都在户外玩。 | out=在外; of=…的; doors=门(户)(此处借指“室内”，out of doors 即“屋外”) |
| **amount to** | 总计达；相当于；等于 | His savings amount to a thousand dollars. | 他的积蓄总共有一千美元。 | amount=达到(某数量); to=至、到 |
| **keep back** | 忍住；抑制；阻止 | She could hardly keep back her tears. | 她几乎忍不住眼泪。 | keep=使保持; back=往回(此处指“压住不放出”) |
| **take one's breath away** ⚠card-only | 令人惊叹；使大吃一惊 | The view from the mountain top took my breath away. | 山顶的景色让我惊叹得说不出话。 | take=夺走; the=(众人的); breath=呼吸、气息; away=离开 |
| **tell on someone** ⚠card-only | 告发；打小报告 | My little brother told on me for eating the cake. | 我弟弟去告状说我偷吃了蛋糕。 | tell=告发; on=针对(某人)(此处为“告发某人”的固定介词); someone=某人 |
| **make out** ⚠card-only | 看清；辨认出；弄懂 | I can't make out what this note says. | 我看不清这张便条写的是什么。 | make=弄; out=出来(此处指“辨认/弄明白”) |
| **willing to allow** | (老式)愿意承认、认错 | After thinking it over, she was willing to allow that he had been right. | 想过之后,她愿意承认他一直是对的。 | willing=愿意的; to allow=(此处)承认、认定(此 allow=admit,非'允许') |

## 二、我特意没收(边界·供你复核宽没宽/漏没漏)
- slope (方言俚语：溜走、逃跑)
- ain't / jist / 'tend / don't / you'd 'a' (方言拼写，迁移弱)
- blowout (俚语：盛大聚会，一次性)
- was bound (that) (旧式：决意、非要，一次性)
- drop pretty flat / fall flat (变体，一次性)
- make a grand time over (一次性)
- after the fashion of (文雅一次性)
- make a show of (备选，控量舍去)
- help sb out of (备选，控量舍去)
- prop up / fix up (备选，控量舍去)
- tongue-tied (一次性形容语)
- at one time (偏基础)
- 专名 Huck / Tom / Sid / Aunt Polly / Mr. Jones / the Welshman / the widow

## 三、请你审 / 定
1. 边界:有没有该踢的(普通词组/太基础误收)?"没收"里有没有该捞回的?
2. 释义/例句:讲反没?例句简单没、没抄原文没?可分式 card-only 判断对没?
3. 审过 → Aaron 跑 `SQLAA/library-chunks-tom-sawyer-ch34.sql`(幂等,无需重部署 edge)→ :8080 第 34 章验珊瑚虚线+逐词节。

> 边界:只产文件+SQL(Aaron 跑);未落库、未改读路径/收藏、未合 main。SQL 只有 Aaron 手动跑。
