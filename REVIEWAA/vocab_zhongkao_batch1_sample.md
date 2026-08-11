# 托福词汇内容 batch1 · 送审样本

> 抽 16 词(种子固定 20260803,复跑抽到同样这批)。
> **不是纯随机** —— 贪心挑成尽量铺开 scene 与词性,免得 16 个全是名词、场景全挤在 news。
> 本批覆盖 **10/10 个 scene**、**13 种词性**(n. / prep. / adj. / v. / num. / adv. / pron. / conj. / aux. / art. / int. / 词性缺失 / abbr.)。
> (`词性缺失` = ECDICT 的 translation 里没有词性前缀,全库 53 个词属于这种,`pos` 为空。)
> 全量 856 词见 `scripts/vocab/data/generated/zhongkao-content.json`。

## 全量 856 词的分布(不只是抽样这 16 个)

难度档:A2 607 · B1 152 · B2 63 · C1 34

场景(共 2568 条例句):academic 86 · news 186 · daily_life 798 · work 502 · science_tech 98 · health 97 · environment 79 · education 340 · travel 106 · culture 276

## 这批内容是怎么把住质量的

**九道**机器闸门,任一不过就整词重生成(最多 3 次),仍不过记入 `scripts/vocab/data/failed.json`:

| 闸门 | 判据 | 拦的是什么 |
| --- | --- | --- |
| g1 | 句中含 headword 或其屈折形/派生形 | 例句根本没用上目标词 |
| g2 | 例句按档句长(A2 7-12 / B1 7-14 / B2 8-16 / C1 9-20) | 太短没语境 / 太长读不动 |
| g3 | 全字段扫 em-dash / en-dash | 破折号(中文排版里很丑) |
| g4 | 与**历史全部**已生成句 4-gram 重合 >50% | 跨词、跨批次的套话复读 |
| g5 | 三句 scene 互不相同且在枚举内;三句 collocation 互不相同 | 三句其实在讲同一个用法 |
| g6 | 同词任意两句 4-gram 重合 >30% | "换个场景词、其余照抄"的偷懒句 |
| g7 | collocation 必须含目标词或其屈折/派生形 | 拿同义词冒充搭配(attorney→"lawyer") |
| g8 | 译文句末须全角句号;中文后不许跟半角标点 | 中英标点混排 |
| g9 | 三句首词两两不同 | 同一个句式模子套三遍 |

场景枚举固定 10 个:`academic`, `news`, `daily_life`, `work`, `science_tech`, `health`, `environment`, `education`, `travel`, `culture`。

`scene` 既服务于 g5/g6 判定,也**随例句一并入库**(`vocab_examples.scene`),将来可按场景筛例句。

## 请重点看这几点

1. **中文释义准不准**、有没有把次要义当主义。
2. **搭配是不是真高频**,顺序是不是真按频率(句1 应该是最常见的说法)。
3. **例句像不像人写的** —— 三句之间是不是真的换了写法,不是同一个模子。
4. **难度档合不合适**:高频词配 A2 句、低频学术词配 B2/C1 句。

---

### 1. shorts  *n.*

| | |
| --- | --- |
| 音标 | /ʃɔrts/ |
| 中文释义 | 短裤 |
| 英文释义 | A type of clothing worn on the lower body, above the knee. |
| freq_rank | 4868 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | wearing shorts | `daily_life` | During summer, wearing shorts is a common choice for many people. | 在夏天，穿短裤是许多人常见的选择。 |
| 2 | cargo shorts | `travel` | Many travelers prefer cargo shorts for their multiple pockets and comfort. | 许多旅行者喜欢穿工装短裤，因为它们有多个口袋且舒适。 |
| 3 | basketball shorts | `work` | Athletes often wear basketball shorts during practice or games to stay cool. | 运动员在训练或比赛期间通常穿篮球短裤以保持凉爽。 |

### 2. below  *prep./adv.*

| | |
| --- | --- |
| 音标 | /bɪˈloʊ/ |
| 中文释义 | 在…下面；低于 |
| 英文释义 | At a lower level; beneath or under something. |
| freq_rank | 1450 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | below average | `academic` | His grades are below average this semester. | 他的成绩在这个学期低于平均水平。 |
| 2 | below freezing | `environment` | Temperatures are expected to drop below freezing tonight. | 今晚的气温预计会降到零度以下。 |
| 3 | below the surface | `science_tech` | The research explored life forms below the surface of Mars. | 这项研究探索了火星表面以下的生命形式。 |

### 3. all  *adj./adv./pron./n.*

| | |
| --- | --- |
| 音标 | /ɔl/ |
| 中文释义 | 所有的；全部的 |
| 英文释义 | The whole number or amount of something. |
| freq_rank | 43 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | all the time | `daily_life` | She listens to music all the time when studying. | 她在学习时总是听音乐。 |
| 2 | all over the world | `culture` | People celebrate this holiday all over the world each year. | 人们每年在世界各地庆祝这个节日。 |
| 3 | all kinds of | `education` | Students need all kinds of support to succeed in school. | 学生们在学校成功需要各种支持。 |

### 4. die  *v./n.*

| | |
| --- | --- |
| 音标 | /daɪ/ |
| 中文释义 | 死亡；死去 |
| 英文释义 | To cease living or existing; to pass away. |
| freq_rank | 403 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | die young | `daily_life` | Many people wish to not die young in life. | 很多人希望不在年轻时去世。 |
| 2 | die of cancer | `health` | He died of cancer last year after a long battle. | 他去年因长时间与癌症斗争而去世。 |
| 3 | die in an accident | `news` | Several people died in an accident on the highway. | 高速公路上发生事故，几人去世。 |

### 5. twelve  *num.*

| | |
| --- | --- |
| 音标 | /twɛlv/ |
| 中文释义 | 十二 |
| 英文释义 | The number after eleven and before thirteen. |
| freq_rank | 3218 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | twelve months | `daily_life` | I will save money for twelve months to buy a car. | 我将存钱十二个月来买一辆车。 |
| 2 | twelve hours | `work` | We worked for twelve hours straight to finish the project. | 我们连续工作了十二小时来完成项目。 |
| 3 | twelve people | `culture` | Twelve people attended the traditional festival last weekend. | 上周末有十二个人参加了传统节日。 |

### 6. along  *adv./prep.*

| | |
| --- | --- |
| 音标 | /əˈlɔŋ/ |
| 中文释义 | 沿着；顺着 |
| 英文释义 | In a line next to or parallel to something. |
| freq_rank | 447 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | walk along | `daily_life` | We walk along the path every morning. | 我们每天早上沿着小路走。 |
| 2 | go along | `education` | Students go along with their teachers on trips. | 学生们和老师们一起去旅行。 |
| 3 | along the way | `travel` | I met many friends along the way. | 我在途中遇到了许多朋友。 |

### 7. it  *pron.*

| | |
| --- | --- |
| 音标 | /ɪt/ |
| 中文释义 | 它 |
| 英文释义 | Used to refer to a thing previously mentioned or easily identified. |
| freq_rank | 10 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | it is important | `academic` | It is important to study every day for success. | 每天学习对成功很重要。 |
| 2 | make it happen | `work` | We can make it happen if we work together. | 如果我们合作，就能实现这个目标。 |
| 3 | look at it | `daily_life` | Look at it carefully before making a decision. | 在做决定之前仔细看看它。 |

### 8. whether  *conj./pron.*

| | |
| --- | --- |
| 音标 | /ˈwɛð.ər/ |
| 中文释义 | 是否 |
| 英文释义 | Indicates choices or possibilities between options. |
| freq_rank | 321 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | whether or not | `daily_life` | I can't decide whether or not to go today. | 我无法决定今天是否去。 |
| 2 | whether it's | `news` | Whether it's true or false, we need to check. | 无论这是否真实，我们需要核实。 |
| 3 | whether they will | `education` | Teachers want to know whether they will pass the test. | 老师想知道他们是否会通过考试。 |

### 9. could  *aux.*

| | |
| --- | --- |
| 音标 | /kəd/ |
| 中文释义 | 能够；可以 |
| 英文释义 | To indicate possibility or ability in the past. |
| freq_rank | 71 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | could help | `daily_life` | I thought you could help me with my homework. | 我以为你可以帮我做作业。 |
| 2 | could see | `work` | We could see improvements in the project's results. | 我们可以看到项目成果的改善。 |
| 3 | could find | `education` | Students could find the answers in their textbooks. | 学生可以在教科书中找到答案。 |

### 10. a  *art.*

| | |
| --- | --- |
| 音标 | /ə/ |
| 中文释义 | 一个 |
| 英文释义 | Used to refer to one or any single item. |
| freq_rank | 5 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | have a friend | `daily_life` | I have a friend who loves to travel. | 我有一个朋友喜欢旅行。 |
| 2 | make a decision | `work` | She needs to make a decision by tomorrow. | 她需要在明天之前做出一个决定。 |
| 3 | take a break | `education` | Let's take a break after this lesson. | 我们在这节课后休息一下。 |

### 11. bye  *int.*

| | |
| --- | --- |
| 音标 | /baɪ/ |
| 中文释义 | 再见 |
| 英文释义 | A casual way of saying farewell. |
| freq_rank | 18387 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | said bye | `education` | She said bye and walked toward the school gate. | 她说了再见，然后朝校门口走去。 |
| 2 | bye for now | `daily_life` | I really have to leave now, so bye for now. | 我现在真的得走了，那就先说再见吧。 |
| 3 | waved bye | `travel` | The children waved bye as the bus drove away. | 公交车开走时，孩子们挥手道别。 |

### 12. socks  

| | |
| --- | --- |
| 音标 | /sɑks/ |
| 中文释义 | 袜子 |
| 英文释义 | A piece of clothing worn on the feet. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | wearing socks | `daily_life` | Many people prefer wearing socks with sandals during the summer. | 许多人夏天喜欢穿袜子搭配凉鞋。 |
| 2 | colorful socks | `culture` | Fashion trends often include colorful socks to enhance personal style. | 时尚潮流常常包括多彩的袜子以增强个人风格。 |
| 3 | pair of socks | `work` | He always carries an extra pair of socks in his bag for emergencies. | 他总是在包里带一双备用袜子以备不时之需。 |

### 13. dvd  *abbr.*

| | |
| --- | --- |
| 音标 | /ˌdiːˌviːˈdiː/ |
| 中文释义 | 数字视频光盘 |
| 英文释义 | A digital optical disc storage format for video and data. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | dvd player | `daily_life` | Everyone gathered around the dvd player to watch the movie together. | 大家围着dvd播放器一起看电影。 |
| 2 | dvd collection | `culture` | She proudly displayed her extensive dvd collection on the living room shelf. | 她自豪地把自己的庞大dvd收藏展示在客厅的架子上。 |
| 3 | dvd format | `science_tech` | The new software supports various dvd formats for better compatibility. | 新软件支持多种dvd格式，以提高兼容性。 |

### 14. large  *adj./adv.*

| | |
| --- | --- |
| 音标 | /lɑrdʒ/ |
| 中文释义 | 大的；巨大的 |
| 英文释义 | Of considerable size, extent, or capacity. |
| freq_rank | 220 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | large number of | `daily_life` | Many people bought a large number of tickets today. | 今天，很多人购买了大量票。 |
| 2 | large amount of | `science_tech` | The experiment required a large amount of data for analysis. | 实验需要大量数据进行分析。 |
| 3 | large scale | `environment` | They plan to build a large scale solar farm next year. | 他们计划明年建一个大规模的太阳能农场。 |

### 15. example  *n.*

| | |
| --- | --- |
| 音标 | /ɪɡˈzæmpəl/ |
| 中文释义 | 例子 |
| 英文释义 | A representative form or pattern used for explanation or illustration. |
| freq_rank | 852 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | for example | `education` | Teachers often give examples to help students understand concepts. | 老师们常常给出例子来帮助学生理解概念。 |
| 2 | an example of | `daily_life` | This painting is an example of modern art techniques. | 这幅画是现代艺术技巧的一个例子。 |
| 3 | good examples | `work` | We need more good examples in our reports to support our claims. | 我们需要更多好的例子在报告中支持我们的主张。 |

### 16. drive  *n./v.*

| | |
| --- | --- |
| 音标 | /draɪv/ |
| 中文释义 | 驾驶；开车 |
| 英文释义 | To operate and control a vehicle. |
| freq_rank | 490 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | drive a car | `daily_life` | She drives a car to work every day. | 她每天开车上班。 |
| 2 | drive safely | `work` | Employees must drive safely while on business trips. | 员工在出差时必须安全驾驶。 |
| 3 | drive the change | `culture` | Leaders drive the change in their organizations. | 领导在他们的组织中推动变革。 |
