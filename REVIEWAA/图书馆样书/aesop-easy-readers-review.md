# 图书馆样书待审 · Aesop's Fables — Easy Readers(伊索寓言 · 分级阅读)

> v1 图书馆(/library)样书。**落库前须审**(content-review-gate + DECISIONS D9)。
> 性质:**公有领域伊索寓言情节 + 原创简易英文改写**(非任何现行教材节选;零版权风险,同 P0《The Lost Kitten》自编先例)。
> 落库文件:`SQLAA/library-seed-aesop-easy-readers.sql`(`is_published=false`;审过后单跑一行 UPDATE 置 true 才对用户可见)。
> 源:`scripts/library/books/aesop-easy-readers.json` → `node scripts/library/build-seed.mjs aesop-easy-readers` 生成 SQL。

## 书目元数据
| 字段 | 值 |
|---|---|
| book_key | `aesop-easy-readers` |
| title | Aesop's Fables — Easy Readers |
| zh_title | 伊索寓言 · 分级阅读 |
| author | Aesop (retold for learners) |
| age_band | 儿童 · age_range 6-9岁 |
| 章/句 | 4 章 / 44 句 |
| is_published | false(待审后置 true) |

**intro_en**: Aesop's Fables are short, wise stories from long ago. In each tale, animals talk and act like people, and the story ends with a simple lesson. These easy versions use short sentences, so new readers can enjoy them and read aloud with confidence.

**intro_zh**: 《伊索寓言》是很久以前流传下来的短小而充满智慧的故事。故事里的动物像人一样说话、行动,每个故事的结尾都有一个简单的道理。本册用简短的句子改写,方便初学者阅读,也适合大声朗读。

**审核要点**:①英文是否地道、分级难度是否合适(儿童 A1–A2);②中文翻译是否准确自然;③是否确无照搬任何具体版本/教材(应为原创改写);④每则结尾寓意句表达是否恰当。

---

## 第 1 章 · The Hare and the Tortoise(龟兔赛跑)
| # | English | 中文 |
|---|---|---|
| 1 | A hare laughed at a tortoise. | 一只兔子嘲笑一只乌龟。 |
| 2 | "You are so slow!" he said. | “你太慢了!”他说。 |
| 3 | "Let's have a race," said the tortoise. | “我们来赛跑吧,”乌龟说。 |
| 4 | The hare thought this was very funny. | 兔子觉得这非常好笑。 |
| 5 | The race began, and the hare ran fast. | 比赛开始了,兔子跑得飞快。 |
| 6 | Soon he was far ahead. | 很快他就遥遥领先。 |
| 7 | "I have time to rest," he said, and fell asleep. | “我有时间休息,”他说着就睡着了。 |
| 8 | The tortoise walked on and on. | 乌龟一直不停地走。 |
| 9 | He passed the sleeping hare. | 他经过了正在睡觉的兔子。 |
| 10 | When the hare woke up, the tortoise had won. | 兔子醒来时,乌龟已经赢了。 |
| 11 | Slow and steady wins the race. | 稳扎稳打者胜。 |

## 第 2 章 · The Lion and the Mouse(狮子和老鼠)
| # | English | 中文 |
|---|---|---|
| 1 | A lion was asleep in the sun. | 一只狮子在阳光下睡觉。 |
| 2 | A little mouse ran over his nose. | 一只小老鼠从他的鼻子上跑过。 |
| 3 | The lion woke up and caught the mouse. | 狮子醒了,抓住了老鼠。 |
| 4 | "Please let me go," cried the mouse. | “请放了我吧,”老鼠喊道。 |
| 5 | "One day I may help you." | “也许有一天我能帮到你。” |
| 6 | The lion laughed, but he let the mouse go. | 狮子笑了,但还是放走了老鼠。 |
| 7 | Later, the lion was caught in a net. | 后来,狮子被困在了网里。 |
| 8 | He roared, but he could not get free. | 他吼叫着,却挣脱不了。 |
| 9 | The little mouse heard him. | 小老鼠听见了他。 |
| 10 | She ran over and bit the ropes. | 她跑过来,咬断了绳子。 |
| 11 | Soon the lion was free. | 很快狮子就自由了。 |
| 12 | Even a small friend can be a great help. | 再小的朋友也能帮上大忙。 |

## 第 3 章 · The Fox and the Grapes(狐狸和葡萄)
| # | English | 中文 |
|---|---|---|
| 1 | A hungry fox saw some grapes. | 一只饥饿的狐狸看见了一些葡萄。 |
| 2 | They hung high on a vine. | 它们高高地挂在藤上。 |
| 3 | "Those grapes look sweet," he said. | “那些葡萄看起来很甜,”他说。 |
| 4 | The fox jumped up, but he missed. | 狐狸跳起来,却没够着。 |
| 5 | He tried again and again. | 他一次又一次地尝试。 |
| 6 | Each time, he could not reach them. | 每一次都够不到。 |
| 7 | At last, the fox walked away. | 最后,狐狸走开了。 |
| 8 | "I don't want them," he said. | “我才不要它们呢,”他说。 |
| 9 | "They are sour anyway." | “反正它们是酸的。” |
| 10 | It is easy to hate what you cannot have. | 得不到的东西,就容易去讨厌它。 |

## 第 4 章 · The Ant and the Grasshopper(蚂蚁和蚱蜢)
| # | English | 中文 |
|---|---|---|
| 1 | In summer, an ant worked hard. | 夏天,一只蚂蚁辛勤地劳作。 |
| 2 | She saved food for the winter. | 她为冬天储备食物。 |
| 3 | A grasshopper sang all day. | 一只蚱蜢整天唱歌。 |
| 4 | "Why work so much?" he asked. | “干嘛干这么多活?”他问。 |
| 5 | "Come and play with me!" | “过来和我一起玩吧!” |
| 6 | "There is plenty of food now." | “现在食物多得很。” |
| 7 | But the ant did not stop. | 但蚂蚁没有停下。 |
| 8 | Then winter came, and it was cold. | 后来冬天来了,天很冷。 |
| 9 | The grasshopper had no food. | 蚱蜢没有食物。 |
| 10 | The ant was warm and full. | 蚂蚁却温暖又饱足。 |
| 11 | It is wise to prepare for hard days. | 未雨绸缪才是明智之举。 |
