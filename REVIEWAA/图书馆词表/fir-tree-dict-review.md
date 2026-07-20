# 枞树 · 点词词典冷词卡 — 待审(12 张)

> **CC 子代理手写**(不走 AI 边缘,零配额)。只补全局 read-v1 词典里**还没有**的冷词(书中出现·频次≥2·已滤专名)。判据:太基础的初中词已跳过;每张卡英式音标+书中义+新造例句。
> 产物:`SQLAA/library-dict-fir-tree.sql`(12 张,幂等 upsert,**未跑**)。审:①该不该收(太基础/专名漏网)②释义贴不贴书中义③音标④例句。

## 自查基线
| 项 | 结果 |
|---|---|
| 缺 ipa/pos/gloss/例句 | **0**(生成器硬卡) |
| 跨批重复 normalized | 去重 0 |
| 子代理判为太基础/专名而跳过 | 0 词 |

## 词卡清单(12 张)
| 词 | 音标 | 词性 | 释义(书中义) | 英语释义(gloss_en) | sense_key | 例句(新造) | 例句中译 |
|---|---|---|---|---|---|---|---|
| **beheld** | /bɪˈhɛld/ | v. | 看见、注视(behold 的过去式,古旧书面语) | saw; gazed at (archaic past of behold) | behold | From the hill she beheld the whole city below. | 从山上,她望见了下面整座城市。 |
| **tinsel** | /ˈtɪnsəl/ | n. | (装饰用的)闪亮金属箔片、亮丝 | thin shiny strips used for decoration | tinsel | Silver tinsel sparkled all over the shop window. | 银色的亮丝在橱窗上到处闪光。 |
| **larder** | /ˈlɑːrdər/ | n. | 食品储藏室 | a cool room or cupboard for storing food | larder | She kept cheese and cold meat in the larder. | 她把奶酪和冷肉放在食品储藏室里。 |
| **magnificence** | /mæɡˈnɪfəsəns/ | n. | 壮丽、宏伟、豪华 | great splendor or grandeur | magnificence | The visitors gasped at the magnificence of the hall. | 客人们为大厅的豪华惊叹不已。 |
| **balustrade** | /ˈbæləstreɪd/ | n. | (阳台或楼梯边的)栏杆 | a railing along a balcony or staircase | balustrade | He leaned on the marble balustrade and looked down. | 他靠在大理石栏杆上往下看。 |
| **moveth** | /ˈmuːvəθ/ | v. | 动、涌动(move 的古旧第三人称形式) | moves (archaic third-person form of move) | move | The wind moveth over the still water. | 风在静静的水面上吹动。 |
| **wherefore** | /ˈwɛrfɔːr/ | adv. | 为什么、为何(古旧) | why; for what reason (archaic) | wherefore | Wherefore do you weep on such a happy day? | 这样喜庆的日子,你为什么哭呢? |
| **tis** | /tɪz/ | cont. | 'tis:它是、现在是('it is' 的古旧缩略) | it is (archaic contraction of "it is") | it-is | 'Tis a cold and lonely night out here. | 外面是个又冷又孤单的夜晚。 |
| **sugarplums** | /ˈʃʊɡərplʌmz/ | n. | (旧时的)圆形水果糖、蜜饯糖果 | small round sweets or candied treats | sugarplum | The children were given sugarplums after supper. | 晚饭后,孩子们分到了一些水果糖。 |
| **pith** | /pɪθ/ | n. | (树干、茎的)木髓、中心软心 | the soft spongy core at the center of a stem | pith | A soft pith runs down the middle of the twig. | 一条柔软的木髓穿过细枝的正中。 |
| **pines** | /paɪnz/ | n. | 松树(pine 的复数) | pine trees | pine | Tall pines lined both banks of the river. | 高大的松树排列在河的两岸。 |
| **pitcher** | /ˈpɪtʃər/ | n. | (有柄有倾口的)大水罐、大壶 | a large jug with a handle and a lip | pitcher | She poured milk from a heavy clay pitcher. | 她从一只沉甸甸的陶罐里倒出牛奶。 |

## 请你审 / 定
1. 边界:有没有太基础该踢的?有没有专名漏网?
2. 释义:贴书里的义没?音标准没?例句简单没、没抄书没?
3. 审过 → Aaron 跑 `SQLAA/library-dict-fir-tree.sql`(幂等,无需重部署 edge)→ 书里点这些词秒出卡带音标。

> 边界:只产文件+SQL(Aaron 跑);未落库、未动读路径/收藏。绝不写那三张词汇表。
