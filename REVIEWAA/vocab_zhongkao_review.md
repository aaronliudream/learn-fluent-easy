# zhongkao 词库内容 · 送审件(抽 100 词)

> 抽样种子固定 20260803,复跑抽到同一批。**不是纯随机** —— 贪心挑成尽量铺开场景与词性,
> 免得 100 个里大半是名词、场景全挤在 news。
> 本批覆盖 **10/10 个场景**、**13 种词性**。
> 全量内容见 `scripts/vocab/data/generated/zhongkao-content.json`。

## 全量 856 词的实测分布

| 项 | 实测 |
| --- | --- |
| 词条 | 856 |
| 例句 | 2568(平均每词 3.00 条) |
| 难度档 | A2 607 · B1 152 · B2 63 · C1 34 |
| ECDICT 未标词性 | 3 词 |
| 跨词性(pos 含 `/`) | 506 词(59.1%) |
| 一次过闸 | 651 词 · 重试后才过 205 词 |
| 人工撰写 | 11 词(night room both sometimes west ball nobody twenty fifty bell bye) |

场景分布(共 2568 条例句):academic 86 · news 186 · daily_life 798 · work 502 · science_tech 98 · health 97 · environment 79 · education 340 · travel 106 · culture 276

## 请重点看这四点

1. **中文释义准不准** —— 有没有把次要义当主义、有没有并列近义词充数。
2. **搭配是不是真高频**,顺序是不是真按频率(句 1 应当是最常见的说法)。
3. **例句像不像人写的** —— 三句之间是不是真换了写法,不是同一个模子换词。
4. **难度档合不合适** —— 高频词配短句、低频学术词配长句。

## ⚠️ 我自己知道的薄弱点(不用你去找)

- **跨词性词的义项**:本批有 506 个跨词性词。提示词里加了"跨词性几乎必然对应词典
  分列义项"的自查,实测 state → 状态；国家 ✓、part → 部分；分开 ✓,但 **might(n./aux.)
  仍然给「可能；或许」** —— 近义堆砌且漏了名词义"力量"。没继续迭代提示词(边际收益递减),
  这类**只能靠人审兜**,请留意跨词性词的第二个义项。
- **个别搭配不是真搭配**:如 system 的 "local system"、part 的
  "Understanding is part of the problem we face"(语义空转)。机器闸门只能判"搭配里含不含
  目标词",判不了"这个搭配母语者到底说不说"。
- **人工撰写的 11 条**(上面标了 🖊):模型连续三轮爬不出同一个陷阱才手写的,
  照样过了全部闸门,但请你单独看一眼。

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

### 11. bye  *int.*  🖊 **人工撰写**

| | |
| --- | --- |
| 音标 | /baɪ/ |
| 中文释义 | 再见 |
| 英文释义 | A casual way of saying farewell. |
| freq_rank | 18387 |
| 难度档 | C1 |

> 🖊 这条是人工写的,原因:感叹词:模型三句例句里一次都没真正用上 bye(g1),搭配也不含它。手写成三个真的说 bye 的场景。

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | said bye | `education` | She said bye and walked toward the school gate. | 她说了再见，然后朝校门口走去。 |
| 2 | bye for now | `daily_life` | I really have to leave now, so bye for now. | 我现在真的得走了，那就先说再见吧。 |
| 3 | waved bye | `travel` | The children waved bye as the bus drove away. | 公交车开走时，孩子们挥手道别。 |

### 12. socks  *(ECDICT 没标词性)*

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

### 17. cloudy  *adj.*

| | |
| --- | --- |
| 音标 | /ˈklaʊ.di/ |
| 中文释义 | 多云的 |
| 英文释义 | Characterized by the presence of many clouds in the sky. |
| freq_rank | 10229 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | cloudy day | `daily_life` | Today looks like a cloudy day, perfect for staying indoors with a book. | 今天看起来是个多云的日子，适合呆在室内看书。 |
| 2 | cloudy weather | `environment` | The forecast predicts cloudy weather, which may affect outdoor activities this weekend. | 天气预报预测周末将是多云的天气，这可能会影响户外活动。 |
| 3 | cloudy sky | `science_tech` | Astronomers often find it challenging to observe celestial events during a cloudy sky. | 在多云的天空下，天文学家往往发现观察天文事件很具挑战性。 |

### 18. their  *pron.*

| | |
| --- | --- |
| 音标 | /ðɛr/ |
| 中文释义 | 他们的 |
| 英文释义 | Belonging to or associated with the people previously mentioned. |
| freq_rank | 36 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | their family | `daily_life` | Many children love spending time with their family. | 许多孩子喜欢和他们的家人一起度过时间。 |
| 2 | their studies | `education` | Students should focus on their studies for better results. | 学生应该专注于他们的学习，以获得更好的成绩。 |
| 3 | their choices | `culture` | People often regret their choices after the event has passed. | 人们常常在事件结束后后悔自己的选择。 |

### 19. party  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈpɑːr.ti/ |
| 中文释义 | 聚会；宴会 |
| 英文释义 | A social gathering of people for enjoyment or celebration. |
| freq_rank | 351 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | birthday party | `daily_life` | Many friends attended her birthday party last weekend. | 很多朋友上周末参加了她的生日聚会。 |
| 2 | political party | `news` | The political party announced its candidate for the election. | 这个政党宣布了其候选人。 |
| 3 | dance party | `culture` | We are planning a dance party for the school festival. | 我们正在为学校节日计划一个舞会。 |

### 20. out  *adj./adv./prep.*

| | |
| --- | --- |
| 音标 | /aʊt/ |
| 中文释义 | 外面的；向外 |
| 英文释义 | Not inside; located outside or away from something. |
| freq_rank | 64 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | get out | `daily_life` | We should get out and enjoy the sunshine today. | 我们应该出去享受今天的阳光。 |
| 2 | look out | `work` | Please look out for any important updates in the email. | 请注意电子邮件中的重要更新。 |
| 3 | call out | `education` | Teachers often call out students' names during class. | 老师在课堂上经常叫学生的名字。 |

### 21. hotel  *n.*

| | |
| --- | --- |
| 音标 | /hoʊˈtɛl/ |
| 中文释义 | 旅馆 |
| 英文释义 | A place providing accommodation, meals, and other services. |
| freq_rank | 1002 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | hotel room | `travel` | We booked a hotel room for our vacation next month. | 我们为下个月的假期预定了一个旅馆房间。 |
| 2 | luxury hotel | `daily_life` | She often stays at a luxury hotel when traveling. | 她出差时经常住在奢华的旅馆。 |
| 3 | hotel staff | `work` | The hotel staff were very friendly and helpful during our stay. | 在我们入住期间，旅馆工作人员非常友好和乐于助人。 |

### 22. left  *adj./adv./n.*

| | |
| --- | --- |
| 音标 | /lɛft/ |
| 中文释义 | 左边的；剩下的 |
| 英文释义 | On the side opposite to right; remaining after others are gone. |
| freq_rank | 771 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | left side | `daily_life` | I always keep my keys on the left side. | 我总是把钥匙放在左边。 |
| 2 | left behind | `news` | Many people were left behind during the evacuation. | 在撤离过程中，许多人被留了下来。 |
| 3 | left out | `education` | Some students felt left out of the group project. | 一些学生感到在小组项目中被排除在外。 |

### 23. clear  *adj./adv./v./n.*

| | |
| --- | --- |
| 音标 | /klɪr/ |
| 中文释义 | 清晰的；明亮的 |
| 英文释义 | Easy to perceive, understand, or interpret. |
| freq_rank | 563 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | clear explanation | `education` | Teachers provide a clear explanation of the topic. | 老师对这个主题做了清晰的解释。 |
| 2 | clear guidelines | `work` | The manager gave us clear guidelines for the project. | 经理给了我们项目的清晰指导方针。 |
| 3 | clear skies | `environment` | Tomorrow promises clear skies for our picnic. | 明天的野餐天气预报是晴空万里。 |

### 24. vegetable  *n./adj.*

| | |
| --- | --- |
| 音标 | /ˈvɛdʒ.tə.bəl/ |
| 中文释义 | 蔬菜 |
| 英文释义 | A type of plant used as food, usually eaten cooked or raw. |
| freq_rank | 1934 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | leafy vegetable | `health` | Eating more leafy vegetables can improve your health. | 多吃绿色蔬菜能改善你的健康。 |
| 2 | vegetable garden | `daily_life` | She loves working in her vegetable garden every weekend. | 她每个周末都喜欢在自己的菜园里工作。 |
| 3 | vegetable oil | `culture` | Many recipes call for vegetable oil as a cooking ingredient. | 许多食谱需要植物油作为烹饪原料。 |

### 25. someone  *pron.*

| | |
| --- | --- |
| 音标 | /ˈsʌm.wʌn/ |
| 中文释义 | 某人 |
| 英文释义 | An unknown or unspecified person. |
| freq_rank | 419 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | someone else | `daily_life` | I would like to invite someone else to the party. | 我想邀请其他人参加聚会。 |
| 2 | someone important | `work` | We need to discuss this with someone important in the company. | 我们需要和公司里的重要人士讨论这个。 |
| 3 | find someone | `education` | It is hard to find someone who understands this topic. | 找到一个理解这个主题的人很困难。 |

### 26. join  *v./n.*

| | |
| --- | --- |
| 音标 | /dʒɔɪn/ |
| 中文释义 | 加入；连接 |
| 英文释义 | To connect or combine with something or someone. |
| freq_rank | 505 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | join a club | `daily_life` | Many people want to join a club after school. | 许多人想在放学后加入一个俱乐部。 |
| 2 | join together | `work` | Employees will join together to solve the problem. | 员工们会齐心协力解决这个问题。 |
| 3 | join forces | `news` | Countries join forces to tackle climate change. | 各国联合起来应对气候变化。 |

### 27. green  *n./adj.*

| | |
| --- | --- |
| 音标 | /ɡrin/ |
| 中文释义 | 绿色；环保的 |
| 英文释义 | A color between blue and yellow in the spectrum. |
| freq_rank | 890 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | green energy | `environment` | Many countries are investing in green energy sources. | 许多国家正在投资绿色能源。 |
| 2 | green vegetables | `daily_life` | Eating green vegetables is good for your health. | 吃绿色蔬菜有益于健康。 |
| 3 | green spaces | `culture` | Cities need more green spaces for better living. | 城市需要更多绿色空间以提高生活质量。 |

### 28. pick  *n./v.*

| | |
| --- | --- |
| 音标 | /pɪk/ |
| 中文释义 | 选择；挑选 |
| 英文释义 | To select or take something from a group. |
| freq_rank | 517 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | pick up | `daily_life` | I usually pick up groceries on my way home. | 我通常在回家的路上买菜。 |
| 2 | pick a book | `education` | Students can pick a book from the library today. | 学生今天可以从图书馆挑一本书。 |
| 3 | pick flowers | `environment` | Children love to pick flowers in the spring. | 孩子们喜欢在春天摘花。 |

### 29. somewhere  *adv.*

| | |
| --- | --- |
| 音标 | /ˈsʌm.wɛər/ |
| 中文释义 | 某处 |
| 英文释义 | In, at, or to a place not specified or unknown. |
| freq_rank | 1588 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | somewhere to go | `daily_life` | We need somewhere to go for our vacation. | 我们需要某个地方去度假。 |
| 2 | somewhere in the city | `travel` | There is a restaurant somewhere in the city that serves great food. | 在城市的某个地方有一家餐厅，提供美味的食物。 |
| 3 | somewhere safe | `work` | Please keep the documents somewhere safe when you finish. | 请在完成后把文件放在安全的地方。 |

### 30. basket  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈbæs.kɪt/ |
| 中文释义 | 篮子 |
| 英文释义 | A container made of woven materials for holding items. |
| freq_rank | 3255 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | shopping basket | `daily_life` | People often use a shopping basket for groceries. | 人们通常用购物篮装食品杂货。 |
| 2 | basket of fruit | `culture` | She placed a beautiful basket of fruit on the table. | 她在桌子上放了一个漂亮的水果篮。 |
| 3 | basket case | `news` | The company was labeled a basket case after its financial collapse. | 公司在财务崩溃后被称为无可救药的案例。 |

### 31. grandma  *n.*

| | |
| --- | --- |
| 音标 | /ˈɡræn.mɑː/ |
| 中文释义 | 祖母 |
| 英文释义 | A mother of one's father or mother. |
| freq_rank | 9804 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | grandma's house | `daily_life` | Visiting grandma's house during holidays is always a special tradition. | 节假日去祖母家总是一个特别的传统。 |
| 2 | grandma's cooking | `culture` | Many families cherish the memories of grandma's cooking at family gatherings. | 许多家庭珍惜祖母在家庭聚会上的烹饪回忆。 |
| 3 | grandma's stories | `education` | Students often enjoy listening to grandma's stories about her childhood adventures. | 学生们常常喜欢听祖母讲述她童年的冒险故事。 |

### 32. excuse  *v./n.*

| | |
| --- | --- |
| 音标 | /ɪkˈskjus/ |
| 中文释义 | 借口；理由 |
| 英文释义 | A reason or explanation put forward to defend or justify something. |
| freq_rank | 3484 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | excuse me | `daily_life` | Excuse me, do you have a moment to talk? | 对不起，您有时间聊聊吗？ |
| 2 | make an excuse | `work` | She tried to make an excuse for missing the meeting. | 她试图为缺席会议找个理由。 |
| 3 | excuse for his behavior | `news` | There is no valid excuse for his behavior during the event. | 他在活动中的行为没有合理的借口。 |

### 33. noodle  *n.*

| | |
| --- | --- |
| 音标 | /ˈnuː.dəl/ |
| 中文释义 | 面条 |
| 英文释义 | A type of long, thin pasta or similar food. |
| freq_rank | 7939 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | instant noodles | `daily_life` | Many people prefer to eat instant noodles for convenience during busy days. | 许多人在忙碌的日子里更喜欢吃方便面。 |
| 2 | noodle soup | `culture` | Traditional noodle soup is served with various toppings and flavors. | 传统的面条汤配有多种配料和风味。 |
| 3 | egg noodles | `health` | Egg noodles provide a good source of protein and are very versatile. | 蛋面提供了良好的蛋白质来源，且用途广泛。 |

### 34. silk  *n./adj.*

| | |
| --- | --- |
| 音标 | /sɪlk/ |
| 中文释义 | 丝绸 |
| 英文释义 | A soft, smooth fabric made from silkworm cocoons. |
| freq_rank | 3969 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | silk scarf | `daily_life` | She wore a beautiful silk scarf around her neck. | 她脖子上围着一条美丽的丝绸围巾。 |
| 2 | silk fabric | `culture` | Many traditional dresses are made from silk fabric. | 许多传统服装都是用丝绸面料制作的。 |
| 3 | silk production | `science_tech` | Silk production involves raising silkworms and harvesting their cocoons. | 丝绸生产涉及养殖蚕和收获它们的茧。 |

### 35. woman  *n./adj./v.*

| | |
| --- | --- |
| 音标 | /ˈwʊ.mən/ |
| 中文释义 | 女人 |
| 英文释义 | An adult female human being. |
| freq_rank | 111 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | women in leadership | `work` | Many women in leadership are breaking traditional barriers. | 许多女性在领导岗位上打破了传统障碍。 |
| 2 | young woman | `daily_life` | A young woman walked her dog in the park today. | 今天，一位年轻女性在公园里遛狗。 |
| 3 | strong women | `culture` | Strong women inspire others to achieve their goals. | 坚强的女性激励他人实现目标。 |

### 36. hungry  *adj.*

| | |
| --- | --- |
| 音标 | /ˈhʌŋ.ɡri/ |
| 中文释义 | 饥饿的 |
| 英文释义 | Feeling a need for food or nourishment. |
| freq_rank | 3181 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | hungry students | `education` | Students are often hungry during long study sessions. | 学生在长时间学习期间常常感到饥饿。 |
| 2 | hungry for success | `work` | Many entrepreneurs are hungry for success in their businesses. | 许多企业家在他们的事业中渴望成功。 |
| 3 | hungry animals | `daily_life` | Hungry animals roam the streets searching for food. | 饥饿的动物在街上游荡寻找食物。 |

### 37. coffee  *n.*

| | |
| --- | --- |
| 音标 | /ˈkɔː.fi/ |
| 中文释义 | 咖啡 |
| 英文释义 | A drink made by infusing ground beans in hot water. |
| freq_rank | 1388 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | drink coffee | `daily_life` | I like to drink coffee every morning. | 我喜欢每天早上喝咖啡。 |
| 2 | coffee shop | `culture` | She often meets friends at the coffee shop near her home. | 她常常在家附近的咖啡店见朋友。 |
| 3 | coffee break | `work` | Employees enjoy a short coffee break in the afternoon. | 员工们在下午享受短暂的咖啡休息。 |

### 38. plan  *n./v.*

| | |
| --- | --- |
| 音标 | /plæn/ |
| 中文释义 | 计划；方案 |
| 英文释义 | A detailed proposal for doing something. |
| freq_rank | 413 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | study plan | `academic` | I need to create a study plan for next week. | 我需要为下周制定学习计划。 |
| 2 | business plan | `work` | She wrote a business plan for her new company. | 她为她的新公司写了一份商业计划。 |
| 3 | travel plan | `travel` | They discussed their travel plans for the summer vacation. | 他们讨论了暑假的旅行计划。 |

### 39. august  *n./adj.*

| | |
| --- | --- |
| 音标 | /ɔːˈɡʌst/ |
| 中文释义 | 威严的，尊贵的 |
| 英文释义 | Having a majestic or dignified quality. |
| freq_rank | 22206 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | august gathering | `culture` | An august gathering of esteemed scholars will take place next month. | 下个月将举行一场威严的学者聚会。 |
| 2 | august presence | `academic` | The professor's august presence commanded respect among the students. | 教授威严的气场在学生中引起了尊重。 |
| 3 | august traditions | `travel` | They explored the august traditions of the ancient culture during their travels. | 他们在旅行中探索了古代文化的威严传统。 |

### 40. date  *n./v.*

| | |
| --- | --- |
| 音标 | /deɪt/ |
| 中文释义 | 日期；约会 |
| 英文释义 | A specific day of the month or year. |
| freq_rank | 1201 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | date of birth | `daily_life` | Please tell me your date of birth. | 请告诉我你的出生日期。 |
| 2 | set a date | `work` | We need to set a date for the meeting. | 我们需要为会议定一个日期。 |
| 3 | first date | `culture` | They went on their first date last weekend. | 他们上周末约会了第一次。 |

### 41. land  *n./v.*

| | |
| --- | --- |
| 音标 | /lænd/ |
| 中文释义 | 土地；陆地 |
| 英文释义 | The solid part of the Earth's surface. |
| freq_rank | 566 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | agricultural land | `daily_life` | Farmers use agricultural land to grow crops. | 农民利用农田种植作物。 |
| 2 | land ownership | `work` | Understanding land ownership is important for real estate agents. | 了解土地所有权对房地产经纪人很重要。 |
| 3 | vacant land | `environment` | Many cities have vacant land for new parks and developments. | 许多城市有空地可用于新公园和开发项目。 |

### 42. television  *n.*

| | |
| --- | --- |
| 音标 | /ˈtɛl.ɪˌvɪʒ.ən/ |
| 中文释义 | 电视 |
| 英文释义 | An electronic device for receiving and displaying moving images and sound. |
| freq_rank | 794 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | watch television | `daily_life` | Many people watch television in the evening. | 许多人晚上看电视。 |
| 2 | television programs | `culture` | Kids enjoy many television programs on weekends. | 孩子们周末喜欢看很多电视节目。 |
| 3 | television news | `news` | He always reads television news in the morning. | 他总是在早上看电视新闻。 |

### 43. daughter  *n./adj.*

| | |
| --- | --- |
| 音标 | /ˈdɔː.tər/ |
| 中文释义 | 女儿 |
| 英文释义 | A female child or offspring. |
| freq_rank | 634 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | her daughter | `daily_life` | My sister loves her daughter very much. | 我姐姐非常爱她的女儿。 |
| 2 | the daughter | `education` | The teacher praised the daughter for her excellent work. | 老师表扬了这位女儿的优异表现。 |
| 3 | a daughter | `news` | A daughter was born to the royal family yesterday. | 王室昨天迎来了一个女儿。 |

### 44. skirt  *n./v.*

| | |
| --- | --- |
| 音标 | /skɜrt/ |
| 中文释义 | 裙子；环绕 |
| 英文释义 | A piece of clothing worn around the waist. |
| freq_rank | 3637 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | mini skirt | `daily_life` | She bought a new mini skirt for the summer. | 她为夏天买了一条新短裙。 |
| 2 | skirt the issue | `academic` | Politicians often skirt the issue during debates. | 政治家们在辩论中常常回避这个问题。 |
| 3 | skirt around the city | `travel` | Tourists skirt around the city to see the sights. | 游客们绕着城市游览风景。 |

### 45. ten  *num.*

| | |
| --- | --- |
| 音标 | /tɛn/ |
| 中文释义 | 十 |
| 英文释义 | The number after nine and before eleven. |
| freq_rank | 838 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | ten years old | `education` | She is ten years old and loves to read. | 她十岁，喜欢阅读。 |
| 2 | ten times | `science_tech` | This machine can work ten times faster than before. | 这台机器可以比以前快十倍。 |
| 3 | ten minutes | `daily_life` | I will arrive in ten minutes, so wait for me. | 我十分钟后就到，请等我。 |

### 46. meal  *n./v.*

| | |
| --- | --- |
| 音标 | /miːl/ |
| 中文释义 | 膳食；餐 |
| 英文释义 | A portion of food served and eaten at one time. |
| freq_rank | 1710 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | meal preparation | `daily_life` | Preparing a meal can be a fun activity for families. | 准备膳食对家庭来说可以是一个有趣的活动。 |
| 2 | meal plan | `health` | Many people follow a meal plan to stay healthy. | 许多人遵循膳食计划以保持健康。 |
| 3 | main meal | `culture` | In many cultures, dinner is the main meal of the day. | 在许多文化中，晚餐是一天中的主要膳食。 |

### 47. please  *adv./v.*

| | |
| --- | --- |
| 音标 | /pliːz/ |
| 中文释义 | 请；希望 |
| 英文释义 | Used as a polite request or to express desire. |
| freq_rank | 1167 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | please help me | `daily_life` | Could you please help me with this task? | 你能帮我完成这个任务吗？ |
| 2 | please wait | `work` | Please wait while I finish this report for you. | 请等一下，我为你完成这个报告。 |
| 3 | please continue | `education` | Now, please continue with your presentation on climate change. | 现在，请继续你的关于气候变化的演讲。 |

### 48. if  *conj./n.*

| | |
| --- | --- |
| 音标 | /ɪf/ |
| 中文释义 | 如果；假设 |
| 英文释义 | A conjunction used to introduce a conditional clause. |
| freq_rank | 40 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | if you need help | `daily_life` | You can call me if you need help. | 如果你需要帮助，可以给我打电话。 |
| 2 | if it rains | `environment` | We will stay inside if it rains tomorrow. | 如果明天下雨，我们将呆在里面。 |
| 3 | if they agree | `work` | The project will start if they agree to the terms. | 如果他们同意条款，项目将开始。 |

### 49. road  *n.*

| | |
| --- | --- |
| 音标 | /roʊd/ |
| 中文释义 | 道路 |
| 英文释义 | A way for vehicles or people to travel on. |
| freq_rank | 489 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | main road | `daily_life` | Many shops are located along the main road. | 许多商店都位于主干道旁边。 |
| 2 | paved road | `travel` | Traveling is easier on a paved road. | 在铺好的道路上旅行更容易。 |
| 3 | bumpy road | `news` | The bumpy road made the journey uncomfortable for everyone. | 崎岖的道路让每个人的旅程都很不舒服。 |

### 50. before  *prep./conj./adv.*

| | |
| --- | --- |
| 音标 | /bɪˈfɔːr/ |
| 中文释义 | 在…之前；早于 |
| 英文释义 | At an earlier time than something else. |
| freq_rank | 219 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | before the meeting | `work` | They always prepare documents before the meeting starts. | 他们总是在会议开始前准备文件。 |
| 2 | before the deadline | `education` | You must submit your assignment before the deadline. | 你必须在截止日期之前提交作业。 |
| 3 | before sunrise | `daily_life` | She wakes up early before sunrise every day. | 她每天在日出之前早起。 |

### 51. hospital  *n.*

| | |
| --- | --- |
| 音标 | /ˈhɒs.pɪ.təl/ |
| 中文释义 | 医院 |
| 英文释义 | A place where sick or injured people receive treatment and care. |
| freq_rank | 647 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | go to the hospital | `daily_life` | We need to go to the hospital after the accident. | 事故后我们需要去医院。 |
| 2 | work at a hospital | `work` | She works at a hospital in the city as a nurse. | 她在市里的医院工作，担任护士。 |
| 3 | hospital admission | `health` | Hospital admission can be stressful for many patients. | 入院对许多病人来说可能很有压力。 |

### 52. pull  *v./n.*

| | |
| --- | --- |
| 音标 | /pʊl/ |
| 中文释义 | 拉；拖 |
| 英文释义 | To exert force on something to move it closer. |
| freq_rank | 471 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | pull a heavy box | `daily_life` | She needs to pull a heavy box across the floor. | 她需要把一个重箱子拖过地板。 |
| 2 | pull the car over | `work` | The officer asked him to pull the car over safely. | 警察让他安全地把车停靠在一边。 |
| 3 | pull information from sources | `academic` | Researchers often pull information from various sources for their studies. | 研究人员常常从不同来源获取信息用于他们的研究。 |

### 53. bottle  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈbɑː.tl/ |
| 中文释义 | 瓶子；瓶装液体 |
| 英文释义 | A container, typically made of glass or plastic. |
| freq_rank | 1740 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | water bottle | `daily_life` | Everyone should carry a reusable water bottle to stay hydrated. | 每个人都应该携带一个可重复使用的水瓶以保持水分。 |
| 2 | bottle neck | `work` | The project faced a bottle neck due to lack of resources. | 由于缺乏资源，项目遇到了瓶颈。 |
| 3 | bottle of wine | `culture` | They shared a bottle of wine during dinner at the restaurant. | 他们在餐厅的晚餐时共享了一瓶酒。 |

### 54. help  *n./v.*

| | |
| --- | --- |
| 音标 | /hɛlp/ |
| 中文释义 | 帮助；援助 |
| 英文释义 | To provide assistance or support to someone or something. |
| freq_rank | 167 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | help you | `daily_life` | Can I help you find your way home? | 我可以帮助你找到回家的路吗？ |
| 2 | help others | `education` | Teachers help others learn new skills every day. | 老师们每天帮助他人学习新技能。 |
| 3 | help improve | `work` | This training will help improve team performance significantly. | 这次培训将帮助显著提高团队表现。 |

### 55. lovely  *adj.*

| | |
| --- | --- |
| 音标 | /ˈlʌv.li/ |
| 中文释义 | 可爱的 |
| 英文释义 | Attractive or pleasing in appearance or character. |
| freq_rank | 3284 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | lovely day | `daily_life` | Today is such a lovely day for a picnic. | 今天是个适合野餐的可爱日子。 |
| 2 | lovely couple | `culture` | They make a lovely couple at the wedding ceremony. | 他们在婚礼上是一对可爱的情侣。 |
| 3 | lovely voice | `education` | Her lovely voice captivated the entire classroom during the presentation. | 她那可爱的声音吸引了整个课堂的注意。 |

### 56. leg  *n./v.*

| | |
| --- | --- |
| 音标 | /lɛɡ/ |
| 中文释义 | 腿；支柱 |
| 英文释义 | A limb used for walking or supporting the body. |
| freq_rank | 856 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | broken leg | `health` | He has a broken leg and needs crutches. | 他摔断了腿，需要拐杖。 |
| 2 | leg muscles | `daily_life` | Leg muscles are important for running and jumping. | 腿部肌肉对跑步和跳跃很重要。 |
| 3 | long legs | `culture` | Many models have long legs that look great on the runway. | 许多模特的腿很长，在走秀时看起来很棒。 |

### 57. no  *n./adj./adv.*

| | |
| --- | --- |
| 音标 | /noʊ/ |
| 中文释义 | 不；没有 |
| 英文释义 | Used to indicate negation or refusal. |
| freq_rank | 93 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | no problem | `daily_life` | She said there was no problem with my request. | 她说我的请求没有问题。 |
| 2 | no evidence | `academic` | The scientist found no evidence to support his theory. | 科学家没有找到支持他理论的证据。 |
| 3 | no news | `news` | We received no news about the missing person today. | 今天我们没有收到关于失踪者的消息。 |

### 58. sunny  *adj.*

| | |
| --- | --- |
| 音标 | /ˈsʌni/ |
| 中文释义 | 阳光明媚的 |
| 英文释义 | Characterized by bright sunlight and clear skies. |
| freq_rank | 4866 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | sunny day | `daily_life` | Many people enjoy spending time outdoors on a sunny day. | 许多人喜欢在阳光明媚的日子里待在户外。 |
| 2 | sunny weather | `environment` | Sunny weather is ideal for outdoor activities and relaxation. | 阳光明媚的天气非常适合户外活动和放松。 |
| 3 | sunny disposition | `culture` | Her sunny disposition always brightens the room whenever she arrives. | 她阳光般的性格总是在她到来时让房间充满活力。 |

### 59. conversation  *n.*

| | |
| --- | --- |
| 音标 | /ˌkɒn.vəˈseɪ.ʃən/ |
| 中文释义 | 对话；谈话 |
| 英文释义 | A verbal exchange between two or more people. |
| freq_rank | 1164 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | have a conversation | `daily_life` | We often have a conversation about our plans. | 我们经常谈论我们的计划。 |
| 2 | engage in conversation | `work` | She likes to engage in conversation with clients. | 她喜欢和客户交谈。 |
| 3 | difficult conversation | `education` | Teachers sometimes face difficult conversations with students. | 老师有时会和学生进行困难的对话。 |

### 60. full  *n./adj./adv./v.*

| | |
| --- | --- |
| 音标 | /fʊl/ |
| 中文释义 | 充满的；完全的 |
| 英文释义 | Containing as much as possible; not empty. |
| freq_rank | 503 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | full of energy | `daily_life` | Children are often full of energy in the morning. | 孩子们早上通常充满活力。 |
| 2 | full report | `work` | I submitted the full report to my boss yesterday. | 我昨天把完整的报告提交给了我的老板。 |
| 3 | full attention | `education` | Students must give full attention during the lecture. | 学生们必须在讲座期间全神贯注。 |

### 61. schoolbag  *n.*

| | |
| --- | --- |
| 音标 | /ˈskuːl.bæɡ/ |
| 中文释义 | 书包 |
| 英文释义 | A bag for carrying books and school supplies. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | schoolbag weight | `education` | Carrying a heavy schoolbag can cause back problems for students. | 背着沉重的书包可能会导致学生的背部问题。 |
| 2 | schoolbag design | `culture` | The latest schoolbag designs often include additional pockets for convenience. | 最新的书包设计通常包括额外的口袋以增加便利性。 |
| 3 | schoolbag straps | `daily_life` | Adjusting the schoolbag straps can help distribute its weight evenly. | 调整书包的肩带可以帮助均匀分配重量。 |

### 62. clean  *adj./adv./v./n.*

| | |
| --- | --- |
| 音标 | /kliːn/ |
| 中文释义 | 干净的；清洁的 |
| 英文释义 | Free from dirt, marks, or stains. |
| freq_rank | 1514 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | clean water | `environment` | Many people lack access to clean water for drinking. | 许多人缺乏可饮用的干净水源。 |
| 2 | clean house | `daily_life` | She spends her weekends trying to keep the house clean. | 她花周末时间保持房子干净。 |
| 3 | clean record | `work` | He was awarded the promotion due to his clean record at work. | 由于他在工作中有着良好的记录，他获得了晋升。 |

### 63. my  *pron.*

| | |
| --- | --- |
| 音标 | /maɪ/ |
| 中文释义 | 我的 |
| 英文释义 | Belonging to the speaker or writer. |
| freq_rank | 44 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | my friends | `daily_life` | All my friends are coming to the party. | 我所有的朋友都要来参加聚会。 |
| 2 | my homework | `academic` | I forgot to finish my homework last night. | 我昨晚忘记完成我的作业了。 |
| 3 | my opinion | `culture` | In my opinion, this movie is very interesting. | 在我看来，这部电影非常有趣。 |

### 64. raincoat  *n.*

| | |
| --- | --- |
| 音标 | /ˈreɪnˌkoʊt/ |
| 中文释义 | 雨衣 |
| 英文释义 | A waterproof garment worn to protect from rain. |
| freq_rank | 15201 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | wear a raincoat | `daily_life` | On rainy days, I always wear a raincoat to stay dry. | 在下雨天，我总是穿着雨衣以保持干燥。 |
| 2 | buy a raincoat | `travel` | Travelers often need to buy a raincoat when visiting tropical regions. | 游客在访问热带地区时通常需要购买雨衣。 |
| 3 | lightweight raincoats | `environment` | Lightweight raincoats are becoming popular due to their convenience and portability. | 由于方便和便携，轻便雨衣越来越受欢迎。 |

### 65. noon  *n.*

| | |
| --- | --- |
| 音标 | /nuːn/ |
| 中文释义 | 中午 |
| 英文释义 | The middle of the day, around 12 o'clock. |
| freq_rank | 3820 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | noon meeting | `work` | We have a noon meeting scheduled for all team members. | 我们安排了一个中午的会议，所有团队成员都需参加。 |
| 2 | noon sun | `science_tech` | The noon sun is at its highest point in the sky. | 中午的太阳在天空中处于最高点。 |
| 3 | after noon | `daily_life` | After noon, the temperature usually starts to rise. | 下午过后，温度通常开始上升。 |

### 66. fifty  *num.*  🖊 **人工撰写**

| | |
| --- | --- |
| 音标 | /ˈfɪfti/ |
| 中文释义 | 五十 |
| 英文释义 | The number that comes after forty-nine. |
| freq_rank | 3038 |
| 难度档 | B1 |

> 🖊 这条是人工写的,原因:同 twenty:释义写成 …before fifty-one 撞 g12 循环定义,三句场景也重复。

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | fifty percent | `news` | About fifty percent of the seats were still empty. | 大约有百分之五十的座位仍然空着。 |
| 2 | fifty years | `work` | The factory has been running for over fifty years. | 这家工厂已经运转了五十多年。 |
| 3 | fifty people | `education` | Nearly fifty people signed up for the science club. | 将近五十个人报名参加了科学社团。 |

### 67. well  *n./v./adj./adv./int.*

| | |
| --- | --- |
| 音标 | /wɛl/ |
| 中文释义 | 好；良好 |
| 英文释义 | In a good or satisfactory manner. |
| freq_rank | 100 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | do well | `academic` | Many students do well on the final exam this year. | 许多学生今年期末考试表现良好。 |
| 2 | feel well | `health` | She feels well after taking her medicine this morning. | 她今天早上吃了药后感觉很好。 |
| 3 | well known | `culture` | This painter is well known for his colorful artworks. | 这位画家以其色彩斑斓的艺术作品而闻名。 |

### 68. picture  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈpɪk.tʃər/ |
| 中文释义 | 图像；画面 |
| 英文释义 | A representation of someone or something in visual form. |
| freq_rank | 562 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | take a picture | `daily_life` | I like to take a picture of my friends. | 我喜欢给我的朋友们拍照。 |
| 2 | photo picture | `travel` | This photo picture reminds me of our vacation. | 这张照片让我想起我们的假期。 |
| 3 | picture gallery | `culture` | The picture gallery has many famous artworks. | 这个画廊有许多著名的艺术作品。 |

### 69. double  *n./adj./v.*

| | |
| --- | --- |
| 音标 | /ˈdʌb.əl/ |
| 中文释义 | 双倍的；成对的 |
| 英文释义 | Consisting of two parts or elements; twice as much. |
| freq_rank | 2202 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | double the amount | `work` | We need to double the amount of production this month. | 这个月，我们需要把生产量翻倍。 |
| 2 | double check | `daily_life` | Before submitting your assignment, double check your work for errors. | 在提交作业之前，务必仔细检查一遍。 |
| 3 | double trouble | `culture` | If you skip class, it will lead to double trouble for your grades. | 如果你缺课，会导致你的成绩双重麻烦。 |

### 70. quick  *adj./adv./n.*

| | |
| --- | --- |
| 音标 | /kwɪk/ |
| 中文释义 | 快速的；迅速的 |
| 英文释义 | Done with speed; happening in a short time. |
| freq_rank | 1303 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | quick response | `work` | Everyone needs a quick response to customer requests. | 每个人都需要对客户请求快速回应。 |
| 2 | quick answer | `academic` | Students should give a quick answer in the exam. | 学生在考试中应该给出快速回答。 |
| 3 | quick fix | `daily_life` | He found a quick fix for the broken chair. | 他找到了椅子坏了的快速修复方法。 |

### 71. tree  *n./v.*

| | |
| --- | --- |
| 音标 | /triː/ |
| 中文释义 | 树 |
| 英文释义 | A tall plant with a trunk and branches. |
| freq_rank | 596 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | fruit tree | `daily_life` | Many people grow fruit trees in their gardens. | 很多人会在自家花园种植水果树。 |
| 2 | tree trunk | `science_tech` | The tree trunk supports the branches and leaves above. | 树干支撑着上面的树枝和树叶。 |
| 3 | shade tree | `environment` | A shade tree can provide relief from the hot sun. | 遮阴树可以在炎热的阳光下提供庇荫。 |

### 72. sheep  *n.*

| | |
| --- | --- |
| 音标 | /ʃiːp/ |
| 中文释义 | 羊 |
| 英文释义 | A domesticated ruminant animal with a thick woolly coat. |
| freq_rank | 4210 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | sheep grazing | `daily_life` | Farmers often report seeing sheep grazing in the fields. | 农民常常在田野中看到羊在吃草。 |
| 2 | sheep population | `environment` | The sheep population in this region has significantly increased this year. | 今年该地区的羊口数量显著增加。 |
| 3 | sheep herd | `work` | A skilled shepherd can manage a large sheep herd efficiently. | 一位熟练的牧羊人能高效管理一大群羊。 |

### 73. postcard  *n.*

| | |
| --- | --- |
| 音标 | /ˈpoʊst.kɑrd/ |
| 中文释义 | 明信片 |
| 英文释义 | A card for sending messages by mail without an envelope. |
| freq_rank | 6924 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | send a postcard | `travel` | Many travelers send a postcard to their friends and family. | 许多旅行者会给朋友和家人寄明信片。 |
| 2 | collect postcards | `culture` | She loves to collect postcards from various countries around the world. | 她喜欢收集来自世界各国的明信片。 |
| 3 | postcard design | `daily_life` | Designing a unique postcard can be a fun creative project. | 设计一张独特的明信片可以是一个有趣的创意项目。 |

### 74. world  *n.*

| | |
| --- | --- |
| 音标 | /wɜrld/ |
| 中文释义 | 世界 |
| 英文释义 | The earth and all its inhabitants and resources. |
| freq_rank | 123 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | the world around us | `daily_life` | We should appreciate the world around us every day. | 我们应该每天都欣赏我们周围的世界。 |
| 2 | the world of science | `science_tech` | Many discoveries change the world of science forever. | 许多发现永远改变了科学界。 |
| 3 | the best in the world | `culture` | She is considered the best in the world at dancing. | 她被认为是世界上最优秀的舞者。 |

### 75. homework  *n.*

| | |
| --- | --- |
| 音标 | /ˈhoʊmˌwɜrk/ |
| 中文释义 | 家庭作业 |
| 英文释义 | Tasks assigned to students by teachers for completion outside of class. |
| freq_rank | 4778 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | do homework | `education` | Many students struggle to do homework on time each week. | 许多学生每周都难以按时完成家庭作业。 |
| 2 | complete homework | `daily_life` | Completing homework can be challenging without proper resources. | 没有适当的资源，完成家庭作业可能很有挑战性。 |
| 3 | assign homework | `academic` | Teachers often assign homework to reinforce the lessons taught in class. | 老师们常常布置家庭作业，以巩固课堂上教授的内容。 |

### 76. themselves  *pron.*

| | |
| --- | --- |
| 音标 | /ðɛmˈsɛlvz/ |
| 中文释义 | 他们自己 |
| 英文释义 | Referring to the people mentioned earlier, as the subject. |
| freq_rank | 449 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | by themselves | `daily_life` | Children often play by themselves in the park. | 孩子们常常在公园里自己玩。 |
| 2 | for themselves | `work` | They must decide for themselves what to do next. | 他们必须自行决定接下来要做什么。 |
| 3 | to express themselves | `education` | Students need to find ways to express themselves creatively. | 学生需要找到创造性表达自己的方式。 |

### 77. lend  *v.*

| | |
| --- | --- |
| 音标 | /lɛnd/ |
| 中文释义 | 借出；提供 |
| 英文释义 | To give something to someone temporarily, expecting it to be returned. |
| freq_rank | 3548 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | lend money | `daily_life` | I always lend money to my friends when they need it. | 当朋友需要时，我总是借钱给他们。 |
| 2 | lend a hand | `work` | Can you lend a hand with this project today? | 你今天能帮这个项目一把吗？ |
| 3 | lend support | `education` | Schools should lend support to students facing challenges. | 学校应该对面临挑战的学生提供支持。 |

### 78. parent  *n.*

| | |
| --- | --- |
| 音标 | /ˈpɛr.ənt/ |
| 中文释义 | 父母；家长 |
| 英文释义 | A person who has a child or children. |
| freq_rank | 327 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | single parent | `daily_life` | A single parent often faces many challenges in life. | 单亲父母在生活中常常面临许多挑战。 |
| 2 | parenting style | `education` | Different cultures have various approaches to parenting styles. | 不同文化对育儿方式有不同的看法。 |
| 3 | parent meetings | `work` | Teachers organize parent meetings to discuss student progress. | 老师组织家长会议来讨论学生的进展。 |

### 79. then  *adv./conj./n.*

| | |
| --- | --- |
| 音标 | /ðɛn/ |
| 中文释义 | 然后 |
| 英文释义 | At that time; next in order or sequence. |
| freq_rank | 77 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | if you finish early, then you can leave | `daily_life` | If you finish early, then you can leave the class. | 如果你提前完成，那么你可以离开课堂。 |
| 2 | we will discuss this, then decide | `work` | We will discuss the project, then decide on the next steps. | 我们将讨论这个项目，然后决定下一步。 |
| 3 | he went home, then felt better | `news` | He went home after the meeting, then felt better later. | 他在会议结束后回家，然后感觉好多了。 |

### 80. while  *n./conj./v.*

| | |
| --- | --- |
| 音标 | /waɪl/ |
| 中文释义 | 期间；同时 |
| 英文释义 | A period of time or a moment. |
| freq_rank | 153 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | while studying | `academic` | Students should take breaks while studying to improve focus. | 学生在学习时应该休息，以提高专注力。 |
| 2 | while waiting | `daily_life` | People often listen to music while waiting for the train. | 人们常常在等火车时听音乐。 |
| 3 | while working | `work` | She likes to drink coffee while working on her projects. | 她喜欢在工作项目时喝咖啡。 |

### 81. able  *adj.*

| | |
| --- | --- |
| 音标 | /ˈeɪ.bəl/ |
| 中文释义 | 能够的 |
| 英文释义 | Having the power, skill, means, or opportunity to do something. |
| freq_rank | 385 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | be able to | `daily_life` | She is able to finish her homework quickly. | 她能够快速完成作业。 |
| 2 | able to travel | `travel` | They are finally able to travel abroad this summer. | 他们终于能够在这个夏天出国旅行。 |
| 3 | not able to | `health` | He is not able to walk after the accident. | 他在事故后无法行走。 |

### 82. card  *n./v.*

| | |
| --- | --- |
| 音标 | /kɑrd/ |
| 中文释义 | 卡片；纸牌 |
| 英文释义 | A rectangular piece of thick paper or plastic. |
| freq_rank | 892 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | credit card | `daily_life` | She always pays with her credit card when shopping. | 她购物时总是用信用卡付款。 |
| 2 | business card | `work` | I gave him my business card after our meeting. | 会议后我把名片给了他。 |
| 3 | birthday card | `culture` | My sister received a beautiful birthday card yesterday. | 我妹妹昨天收到了一个漂亮的生日卡。 |

### 83. red  *adj./n.*

| | |
| --- | --- |
| 音标 | /rɛd/ |
| 中文释义 | 红色的；红色 |
| 英文释义 | A primary color resembling the color of blood or fire. |
| freq_rank | 598 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | red apple | `daily_life` | I bought a red apple from the market. | 我在市场买了一个红色的苹果。 |
| 2 | red flag | `news` | The red flag warned of a dangerous situation ahead. | 红色警告旗警告前方存在危险情况。 |
| 3 | red sauce | `culture` | Many people enjoy pasta with red sauce on top. | 许多人喜欢在意大利面上加红色酱料。 |

### 84. smoke  *n./v.*

| | |
| --- | --- |
| 音标 | /smoʊk/ |
| 中文释义 | 烟；烟雾 |
| 英文释义 | A visible suspension of carbon or other particles in the air. |
| freq_rank | 2414 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | smoke alarms | `daily_life` | Smoke alarms are essential for safety in homes and businesses. | 烟雾报警器在家庭和商业中是必不可少的安全设施。 |
| 2 | smoke signals | `culture` | Indigenous peoples used smoke signals to communicate over long distances. | 土著人民用烟雾信号在远距离间交流。 |
| 3 | smoke screens | `news` | The government created smoke screens to distract from the ongoing scandals. | 政府制造烟雾弹以转移公众对持续丑闻的注意。 |

### 85. behaviour  *n.*

| | |
| --- | --- |
| 音标 | /bɪˈheɪvjər/ |
| 中文释义 | 行为 |
| 英文释义 | The way a person acts or conducts themselves. |
| freq_rank | 10352 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | social behaviour | `culture` | Social behaviour often reflects cultural norms and values in society. | 社会行为往往反映出社会中的文化规范和价值观。 |
| 2 | human behaviour | `science_tech` | Understanding human behaviour is essential for effective communication and interaction. | 理解人类行为对有效沟通和互动至关重要。 |
| 3 | aggressive behaviour | `health` | Aggressive behaviour can lead to serious conflicts and mental health issues. | 攻击性行为可能导致严重的冲突和心理健康问题。 |

### 86. warm  *adj./v./n.*

| | |
| --- | --- |
| 音标 | /wɔrm/ |
| 中文释义 | 温暖的；温和的 |
| 英文释义 | Having a moderate degree of heat; friendly or affectionate. |
| freq_rank | 1356 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | warm weather | `daily_life` | Today has warm weather for a picnic with friends. | 今天的天气适合和朋友们一起野餐。 |
| 2 | warm welcome | `culture` | Everyone received a warm welcome at the event last night. | 昨晚在活动中，每个人都受到了热烈的欢迎。 |
| 3 | warm smile | `health` | She greeted him with a warm smile and kind words. | 她用温暖的微笑和亲切的话语向他问好。 |

### 87. rain  *n./v.*

| | |
| --- | --- |
| 音标 | /reɪn/ |
| 中文释义 | 雨；降雨 |
| 英文释义 | Water droplets falling from clouds in the atmosphere. |
| freq_rank | 1550 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | heavy rain | `daily_life` | Heavy rain made it difficult to drive safely yesterday. | 昨天的大雨让驾驶变得困难。 |
| 2 | rain forecast | `news` | The rain forecast predicts showers for the weekend. | 天气预报显示周末有小雨。 |
| 3 | rain falls | `environment` | As rain falls, it nourishes the plants and replenishes water sources. | 降雨滋养植物，补充水源。 |

### 88. agreement  *n.*

| | |
| --- | --- |
| 音标 | /əˈɡriː.mənt/ |
| 中文释义 | 协议 |
| 英文释义 | A mutual arrangement or understanding between parties. |
| freq_rank | 1059 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | sign an agreement | `work` | They signed an agreement yesterday about the new project. | 他们昨天签署了关于新项目的协议。 |
| 2 | reach an agreement | `daily_life` | We finally reached an agreement after hours of discussion. | 经过几小时的讨论，我们终于达成了一项协议。 |
| 3 | draft an agreement | `academic` | Students must draft an agreement for their group project soon. | 学生们必须尽快为他们的小组项目起草一份协议。 |

### 89. pupil  *n.*

| | |
| --- | --- |
| 音标 | /ˈpjuː.pəl/ |
| 中文释义 | 学生 |
| 英文释义 | A person enrolled in a school or educational institution. |
| freq_rank | 5057 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | primary pupils | `education` | Primary pupils often participate in various extracurricular activities that enhance their learning. | 小学生通常参加各种课外活动以增强他们的学习。 |
| 2 | pupil performance | `academic` | Teachers regularly assess pupil performance to identify areas for improvement. | 教师定期评估学生的表现，以找出改进的领域。 |
| 3 | pupil behavior | `daily_life` | Understanding pupil behavior is essential for creating a positive learning environment. | 理解学生的行为对创造积极的学习环境至关重要。 |

### 90. pancake  *n.*

| | |
| --- | --- |
| 音标 | /ˈpæn.keɪk/ |
| 中文释义 | 煎饼 |
| 英文释义 | A flat cake made from batter and fried on both sides. |
| freq_rank | 7331 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | pancake recipe | `culture` | Many families enjoy sharing their favorite pancake recipe during gatherings. | 许多家庭喜欢在聚会中分享他们最喜欢的煎饼食谱。 |
| 2 | fluffy pancakes | `daily_life` | On weekends, I love making fluffy pancakes for breakfast. | 在周末，我喜欢为早餐做松软的煎饼。 |
| 3 | pancake breakfast | `education` | The school organized a pancake breakfast to raise funds for charity. | 学校组织了一次煎饼早餐以筹集慈善资金。 |

### 91. home  *n./adj./adv.*

| | |
| --- | --- |
| 音标 | /hoʊm/ |
| 中文释义 | 家；住所 |
| 英文释义 | A place where one lives permanently or for a long time. |
| freq_rank | 224 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | go home | `daily_life` | After work, I like to go home and relax. | 下班后，我喜欢回家放松。 |
| 2 | at home | `culture` | Many people prefer to stay at home during holidays. | 许多人在假期期间更喜欢呆在家里。 |
| 3 | home country | `travel` | She plans to visit her home country next summer. | 她计划明年夏天回到自己的祖国。 |

### 92. chopsticks  *n.*

| | |
| --- | --- |
| 音标 | /ˈtʃɑp.stɪks/ |
| 中文释义 | 筷子 |
| 英文释义 | A pair of slender sticks used for eating. |
| freq_rank | 17509 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | using chopsticks | `daily_life` | Many people find it challenging to eat sushi using chopsticks. | 许多人觉得用筷子吃寿司很有挑战性。 |
| 2 | chopsticks etiquette | `culture` | Understanding chopsticks etiquette is essential when dining in Asian countries. | 在亚洲国家用餐时，了解筷子礼仪是必不可少的。 |
| 3 | chopsticks set | `travel` | I bought a beautiful chopsticks set as a souvenir from my trip to Japan. | 我从日本旅行中买了一套漂亮的筷子作为纪念品。 |

### 93. beat  *n./v./adj.*

| | |
| --- | --- |
| 音标 | /biːt/ |
| 中文释义 | 打击；击打 |
| 英文释义 | To strike or hit repeatedly. |
| freq_rank | 1036 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | beat the drum | `daily_life` | Children beat the drum at the school event. | 孩子们在学校活动中击打鼓。 |
| 2 | beat the competition | `work` | Our team beat the competition in the recent project. | 我们的团队在最近的项目中击败了竞争对手。 |
| 3 | beat the odds | `news` | She beat the odds and survived the illness. | 她战胜了困难，生存下来。 |

### 94. get  *v./n.*

| | |
| --- | --- |
| 音标 | /ɡɛt/ |
| 中文释义 | 得到；获得 |
| 英文释义 | To obtain, receive, or come to have something. |
| freq_rank | 39 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | get a job | `daily_life` | Many people want to get a job after graduation. | 许多人希望毕业后找到工作。 |
| 2 | get ready | `work` | We need to get ready for the meeting soon. | 我们需要尽快为会议做好准备。 |
| 3 | get better | `health` | She hopes to get better after taking the medicine. | 她希望在服药后能好起来。 |

### 95. send  *v./n.*

| | |
| --- | --- |
| 音标 | /sɛnd/ |
| 中文释义 | 发送；寄送 |
| 英文释义 | To cause to go or be taken to a destination. |
| freq_rank | 404 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | send an email | `work` | I will send an email to the team today. | 我今天会给团队发送一封邮件。 |
| 2 | send a message | `daily_life` | She sends a message to her friend every day. | 她每天都给朋友发送消息。 |
| 3 | send a letter | `culture` | They sent a letter to invite us to the party. | 他们寄了一封信邀请我们参加派对。 |

### 96. young  *adj./n.*

| | |
| --- | --- |
| 音标 | /jʌŋ/ |
| 中文释义 | 年轻的；年轻人 |
| 英文释义 | Having lived for a short time; not old yet. |
| freq_rank | 234 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | young people | `daily_life` | Many young people enjoy playing sports after school. | 许多年轻人喜欢在放学后打运动。 |
| 2 | young age | `education` | She started learning music at a young age. | 她在年轻时就开始学习音乐。 |
| 3 | young generation | `culture` | The young generation is very tech-savvy and creative. | 年轻一代非常精通科技且富有创造力。 |

### 97. since  *prep./adv./conj.*

| | |
| --- | --- |
| 音标 | /sɪns/ |
| 中文释义 | 自从 |
| 英文释义 | From a specific time in the past until now. |
| freq_rank | 260 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | since then | `daily_life` | I moved here last year, and since then, I've made friends. | 我去年搬到这里，自那时起，我交了朋友。 |
| 2 | since childhood | `education` | She has loved painting since childhood and practices daily. | 她从小就喜欢画画，并每天练习。 |
| 3 | since the start | `work` | The company has expanded rapidly since the start of the year. | 自今年开始，公司迅速扩张。 |

### 98. each  *adj./adv./pron.*

| | |
| --- | --- |
| 音标 | /iːtʃ/ |
| 中文释义 | 每个 |
| 英文释义 | Used to refer to every one of two or more people or things. |
| freq_rank | 192 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | each student | `education` | Teachers help each student with their learning needs. | 老师帮助每个学生满足他们的学习需求。 |
| 2 | each person | `daily_life` | Each person should take responsibility for their actions. | 每个人都应该对自己的行为负责。 |
| 3 | each day | `news` | The report is published each day to keep people updated. | 该报告每天发布，以便让人们保持更新。 |

### 99. pleasure  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈplɛʒər/ |
| 中文释义 | 愉快；乐趣 |
| 英文释义 | A feeling of enjoyment or satisfaction. |
| freq_rank | 1882 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | take pleasure | `daily_life` | Many people take pleasure in reading books during their free time. | 许多人在空闲时间阅读书籍中感到愉快。 |
| 2 | find pleasure | `education` | Students often find pleasure in learning new subjects and skills. | 学生们常常在学习新科目和技能中找到乐趣。 |
| 3 | pleasure to meet | `work` | It was a pleasure to meet you at the conference last week. | 上周在会议上见到你很高兴。 |

### 100. shine  *n./v.*

| | |
| --- | --- |
| 音标 | /ʃaɪn/ |
| 中文释义 | 发光；光辉 |
| 英文释义 | To emit light or be bright in appearance. |
| freq_rank | 3385 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | shine brightly | `daily_life` | Children love to watch the stars shine brightly at night. | 孩子们喜欢在夜晚观赏星星明亮地闪烁。 |
| 2 | shine a light | `work` | The manager decided to shine a light on the team's accomplishments. | 经理决定关注团队的成就。 |
| 3 | shine through | `culture` | Her talent continues to shine through in every performance. | 她的才华在每一次表演中依然耀眼。 |
