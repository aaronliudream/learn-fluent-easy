# gaokao 词库内容 · 送审件(抽 100 词)

> 抽样种子固定 20260803,复跑抽到同一批。**不是纯随机** —— 贪心挑成尽量铺开场景与词性,
> 免得 100 个里大半是名词、场景全挤在 news。
> 本批覆盖 **10/10 个场景**、**8 种词性**。
> 全量内容见 `scripts/vocab/data/generated/gaokao-content.json`。

## 全量 378 词的实测分布

| 项 | 实测 |
| --- | --- |
| 词条 | 378 |
| 例句 | 1134(平均每词 3.00 条) |
| 难度档 | A2 18 · B1 52 · B2 149 · C1 159 |
| ECDICT 未标词性 | 7 词 |
| 跨词性(pos 含 `/`) | 69 词(18.3%) |
| 一次过闸 | 329 词 · 重试后才过 49 词 |
| 人工撰写 | 4 词(oh hey vanilla receipt) |

场景分布(共 1134 条例句):academic 57 · news 84 · daily_life 279 · work 189 · science_tech 95 · health 47 · environment 41 · education 132 · travel 44 · culture 166

## 请重点看这四点

1. **中文释义准不准** —— 有没有把次要义当主义、有没有并列近义词充数。
2. **搭配是不是真高频**,顺序是不是真按频率(句 1 应当是最常见的说法)。
3. **例句像不像人写的** —— 三句之间是不是真换了写法,不是同一个模子换词。
4. **难度档合不合适** —— 高频词配短句、低频学术词配长句。

## ⚠️ 我自己知道的薄弱点(不用你去找)

- **跨词性词的义项**:本批有 69 个跨词性词。提示词里加了"跨词性几乎必然对应词典
  分列义项"的自查,实测 state → 状态；国家 ✓、part → 部分；分开 ✓,但 **might(n./aux.)
  仍然给「可能；或许」** —— 近义堆砌且漏了名词义"力量"。没继续迭代提示词(边际收益递减),
  这类**只能靠人审兜**,请留意跨词性词的第二个义项。
- **个别搭配不是真搭配**:如 system 的 "local system"、part 的
  "Understanding is part of the problem we face"(语义空转)。机器闸门只能判"搭配里含不含
  目标词",判不了"这个搭配母语者到底说不说"。
- **人工撰写的 4 条**(上面标了 🖊):模型连续三轮爬不出同一个陷阱才手写的,
  照样过了全部闸门,但请你单独看一眼。

---

### 1. parking  *n./adj.*

| | |
| --- | --- |
| 音标 | /ˈpɑːrkɪŋ/ |
| 中文释义 | 停车；停车场 |
| 英文释义 | The act of stopping a vehicle and leaving it temporarily. |
| freq_rank | 2322 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | free parking | `daily_life` | Many people prefer free parking when they go shopping. | 许多人在购物时更喜欢免费的停车。 |
| 2 | parking lot | `work` | She parked her car in the company parking lot all week. | 她一整周都把车停在公司停车场。 |
| 3 | parking space | `travel` | Finding a parking space in the city can be quite challenging. | 在市区找到停车位可能相当具有挑战性。 |

### 2. quake  *v./n.*

| | |
| --- | --- |
| 音标 | /kweɪk/ |
| 中文释义 | 震动；地震 |
| 英文释义 | To shake or tremble violently. |
| freq_rank | 8561 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | quake tremors | `news` | Residents felt the quake tremors long after the main event occurred. | 居民在主要事件发生后，仍能感觉到震动。 |
| 2 | quake damage | `science_tech` | Assessing the quake damage is essential for future building safety standards. | 评估震动造成的损害对未来的建筑安全标准至关重要。 |
| 3 | aftershock quake | `environment` | Survivors prepared for the aftershock quake that could follow the initial event. | 幸存者们为可能继发的余震做好了准备。 |

### 3. founding  *(ECDICT 没标词性)*

| | |
| --- | --- |
| 音标 | /ˈfaʊndɪŋ/ |
| 中文释义 | 创立；建立 |
| 英文释义 | The act of establishing or initiating something. |
| freq_rank | 7525 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | founding fathers | `culture` | Many people admire the founding fathers of the United States for their vision. | 许多人钦佩美国的开国元勋，因他们的远见。 |
| 2 | founding member | `work` | She was a founding member of the organization dedicated to environmental protection. | 她是致力于环境保护的组织的创始成员。 |
| 3 | founding document | `education` | The founding document of the school outlines its mission and values. | 学校的创立文件概述了其使命和价值观。 |

### 4. numb  *adj./v.*

| | |
| --- | --- |
| 音标 | /nʌm/ |
| 中文释义 | 麻木的；失去感觉的 |
| 英文释义 | Lacking sensation or feeling in a part of the body. |
| freq_rank | 9317 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | numb feelings | `daily_life` | After the accident, he often experienced numb feelings in his legs. | 事故后，他的腿经常感到麻木。 |
| 2 | numb pain | `health` | She took medication to help relieve the numb pain in her back. | 她服用药物来缓解背部的麻木疼痛。 |
| 3 | numb to | `academic` | Many people have become numb to the ongoing crises in the world. | 许多人对世界上持续发生的危机感到麻木。 |

### 5. oh  *int.*  🖊 **人工撰写**

| | |
| --- | --- |
| 音标 | /oʊ/ |
| 中文释义 | 哦；啊 |
| 英文释义 | A sound people make to show surprise or sudden understanding. |
| freq_rank | 411 |
| 难度档 | A2 |

> 🖊 这条是人工写的,原因:感叹词:三句都自然地以 Oh 开头,撞 g9(三句首词必须互异)。手写时只让一句以它开头,另两句把它放进引述里。

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | oh no | `daily_life` | Oh no, I left my keys inside the car. | 哦不，我把钥匙落在车里了。 |
| 2 | oh dear | `work` | She said oh dear when the printer broke again. | 打印机又坏了，她说了声哎呀。 |
| 3 | oh well | `travel` | Everyone laughed and said oh well about the delay. | 对于这次延误，大家笑着说算了吧。 |

### 6. totally  *adv.*

| | |
| --- | --- |
| 音标 | /ˈtoʊ.təl.i/ |
| 中文释义 | 完全地 |
| 英文释义 | Completely and without any doubt or qualification. |
| freq_rank | 1911 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | totally different | `daily_life` | These two approaches are totally different in their methods. | 这两种方法在方法上完全不同。 |
| 2 | totally agree | `academic` | I totally agree with the findings of this research paper. | 我完全同意这篇研究论文的发现。 |
| 3 | totally unacceptable | `work` | Such behavior is totally unacceptable in a professional setting. | 这种行为在专业场合是完全不可接受的。 |

### 7. sixteenth  *num.*

| | |
| --- | --- |
| 音标 | /sɪkˈstiːnθ/ |
| 中文释义 | 第十六 |
| 英文释义 | The ordinal number following fifteenth. |
| freq_rank | 10249 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | sixteenth century | `culture` | Historians often study the impact of the sixteenth century on modern society. | 历史学家经常研究第十六世纪对现代社会的影响。 |
| 2 | sixteenth amendment | `news` | The sixteenth amendment allowed the federal government to impose an income tax. | 第十六修正案允许联邦政府征收所得税。 |
| 3 | sixteenth birthday | `daily_life` | Celebrating her sixteenth birthday was a significant milestone for her family. | 为她庆祝第十六个生日对她的家人来说是一个重要的里程碑。 |

### 8. per  *prep.*

| | |
| --- | --- |
| 音标 | /pɜr/ |
| 中文释义 | 每；每一 |
| 英文释义 | For each; for every; used in measurements or rates. |
| freq_rank | 669 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | per person | `daily_life` | The cost is $20 per person for the tour. | 每个人的费用是20美元，包含这次旅行。 |
| 2 | per day | `work` | She works eight hours per day at the office. | 她在办公室每天工作八小时。 |
| 3 | per year | `education` | Students study ten subjects per year in high school. | 高中生每年学习十门科目。 |

### 9. memorize  *v.*

| | |
| --- | --- |
| 音标 | /ˈmɛm.ə.raɪz/ |
| 中文释义 | 记忆；背诵 |
| 英文释义 | To commit something to memory for later recall. |
| freq_rank | 8276 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | memorize vocabulary | `education` | Students often memorize vocabulary to improve their language skills. | 学生们常常记忆词汇以提高他们的语言技能。 |
| 2 | memorize information | `academic` | Researchers need to memorize information for their presentations and papers. | 研究人员需要记忆信息以备他们的演示和论文之用。 |
| 3 | memorize a speech | `daily_life` | Actors typically memorize a speech before performing on stage. | 演员们通常在上台表演前记忆台词。 |

### 10. motherland  *n.*

| | |
| --- | --- |
| 音标 | /ˈmʌð.ər.lænd/ |
| 中文释义 | 祖国 |
| 英文释义 | The country where one was born or has strong cultural ties. |
| freq_rank | 23389 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | defend the motherland | `news` | Citizens are ready to defend the motherland against any threats. | 公民们准备好捍卫祖国免受任何威胁。 |
| 2 | patriotism towards the motherland | `culture` | Patriotism towards the motherland is celebrated during national holidays. | 在国家假日期间，爱国主义被大力弘扬。 |
| 3 | return to the motherland | `travel` | Many expatriates wish to return to the motherland for family reunions. | 许多侨民希望回到祖国与家人团聚。 |

### 11. salesgirl  *n.*

| | |
| --- | --- |
| 音标 | /ˈseɪlzˌɡɜrl/ |
| 中文释义 | 女售货员 |
| 英文释义 | A female salesperson, typically in a retail setting. |
| freq_rank | 29991 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | salesgirl at the store | `daily_life` | Many customers prefer to ask a salesgirl at the store for assistance. | 许多顾客喜欢向商店里的女售货员寻求帮助。 |
| 2 | experienced salesgirls | `work` | The company often hires experienced salesgirls to improve customer service. | 这家公司经常聘请有经验的女售货员来提升客户服务。 |
| 3 | salesgirl in the market | `culture` | A salesgirl in the market displayed her products with enthusiasm and skill. | 市场里的女售货员热情且熟练地展示她的产品。 |

### 12. subject  *n./adj./adv./v.*

| | |
| --- | --- |
| 音标 | /ˈsʌb.dʒɛkt/ |
| 中文释义 | 主题；科目 |
| 英文释义 | A topic or area of study, often in education. |
| freq_rank | 670 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | subject matter | `education` | Teachers discuss the subject matter with students every week. | 老师每周与学生讨论主题内容。 |
| 2 | subject to change | `work` | The schedule is subject to change based on new information. | 时间表会根据新信息而有所变动。 |
| 3 | subject line | `daily_life` | Please write a clear subject line for your email. | 请为您的电子邮件写一个清晰的主题。 |

### 13. beer  *n.*

| | |
| --- | --- |
| 音标 | /bɪr/ |
| 中文释义 | 啤酒 |
| 英文释义 | A fermented alcoholic beverage made from grains and hops. |
| freq_rank | 1902 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | craft beer | `culture` | Many people enjoy trying different types of craft beer at festivals. | 许多人喜欢在节日里尝试不同类型的手工啤酒。 |
| 2 | light beer | `daily_life` | She prefers to drink light beer during summer gatherings with friends. | 在夏天的聚会中，她更喜欢喝淡啤酒。 |
| 3 | beer garden | `work` | Our company organized a team event at a local beer garden this Friday. | 我们公司本周五在一个当地的啤酒花园组织了一次团队活动。 |

### 14. unconditional  *adj.*

| | |
| --- | --- |
| 音标 | /ˌʌn.kənˈdɪʃ.ən.əl/ |
| 中文释义 | 无条件的 |
| 英文释义 | Not contingent on any conditions or limitations. |
| freq_rank | 11570 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | unconditional love | `daily_life` | Parents often express unconditional love towards their children regardless of circumstances. | 父母常常无条件地爱着他们的孩子，无论情况如何。 |
| 2 | unconditional support | `work` | The manager provided unconditional support for the team's innovative ideas and projects. | 经理对团队的创新想法和项目给予了无条件的支持。 |
| 3 | unconditional agreement | `academic` | An unconditional agreement among researchers is essential for advancing collaborative studies. | 研究者之间的无条件协议对于推进合作研究至关重要。 |

### 15. workday  *n.*

| | |
| --- | --- |
| 音标 | /ˈwɜrk.deɪ/ |
| 中文释义 | 工作日 |
| 英文释义 | A day on which one is expected to work, typically Monday to Friday. |
| freq_rank | 13488 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | long workday | `work` | Many employees dread the thought of a long workday ahead of them. | 许多员工害怕即将到来的漫长工作日。 |
| 2 | workday schedule | `daily_life` | Creating a balanced workday schedule can enhance productivity and reduce stress levels. | 制定一个平衡的工作日安排可以提高生产力并减少压力。 |
| 3 | workday routine | `education` | Students often struggle to maintain a consistent workday routine while studying. | 学生在学习期间往往难以保持一致的工作日常。 |

### 16. worried  *adj.*

| | |
| --- | --- |
| 音标 | /ˈwɚ.id/ |
| 中文释义 | 担心的 |
| 英文释义 | Feeling anxious or concerned about something. |
| freq_rank | 3261 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | worried about | `work` | Employees are often worried about job security during layoffs. | 在裁员期间，员工通常会担心工作安全问题。 |
| 2 | worried parents | `daily_life` | Many worried parents seek advice on how to raise their children. | 许多担心的父母寻求如何养育孩子的建议。 |
| 3 | worried look | `news` | The politician had a worried look during the press conference. | 在新闻发布会上，该政治家面露担忧。 |

### 17. bride  *n.*

| | |
| --- | --- |
| 音标 | /braɪd/ |
| 中文释义 | 新娘 |
| 英文释义 | A woman on her wedding day or just before it. |
| freq_rank | 4871 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | bride and groom | `daily_life` | Many guests attended the wedding of the bride and groom. | 许多客人参加了新郎和新娘的婚礼。 |
| 2 | bride's dress | `culture` | The design of the bride's dress was inspired by classic fairy tales. | 新娘的婚纱设计灵感来源于经典童话。 |
| 3 | bride price | `news` | Some cultures still practice paying a bride price before marriage. | 在某些文化中，结婚前仍然会支付聘礼。 |

### 18. undivided  *adj.*

| | |
| --- | --- |
| 音标 | /ʌn.dɪˈvaɪ.dɪd/ |
| 中文释义 | 不分心的；专注的 |
| 英文释义 | Not divided or shared; having full attention or focus. |
| freq_rank | 20480 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | undivided attention | `education` | Students require undivided attention from their teachers to succeed academically. | 学生需要老师全神贯注的关注才能在学业上取得成功。 |
| 2 | undivided support | `work` | The team received undivided support from management during the project. | 在项目期间，团队得到了管理层的全力支持。 |
| 3 | undivided loyalty | `daily_life` | She showed undivided loyalty to her friends throughout their challenges. | 在朋友们面临挑战的过程中，她始终表现出对他们的忠诚。 |

### 19. sneaker  *n.*

| | |
| --- | --- |
| 音标 | /ˈsniː.kər/ |
| 中文释义 | 运动鞋 |
| 英文释义 | A type of shoe designed for sports or casual activities. |
| freq_rank | 33208 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | running sneakers | `daily_life` | Many athletes prefer lightweight running sneakers for better performance. | 许多运动员更喜欢轻便的跑步鞋，以提升表现。 |
| 2 | fashion sneakers | `culture` | Fashion sneakers have become a popular choice among young people lately. | 近年来，时尚运动鞋在年轻人中变得十分流行。 |
| 3 | basketball sneakers | `work` | Basketball sneakers are essential for players to enhance their game on the court. | 篮球鞋对球员在球场上提升表现至关重要。 |

### 20. yoghurt  *n.*

| | |
| --- | --- |
| 音标 | /ˈjoʊ.ɡərt/ |
| 中文释义 | 酸奶 |
| 英文释义 | A creamy, fermented milk product often consumed as a snack. |
| freq_rank | 43601 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | Greek yoghurt | `health` | Greek yoghurt is known for its high protein content and creamy texture. | 希腊酸奶以其高蛋白含量和奶油质地而闻名。 |
| 2 | yoghurt parfait | `daily_life` | For breakfast, I enjoy a yoghurt parfait with fresh fruits and granola. | 早餐时，我喜欢吃搭配新鲜水果和燕麦的酸奶杯。 |
| 3 | yoghurt drink | `culture` | In some cultures, a yoghurt drink is a common accompaniment to meals. | 在一些文化中，酸奶饮料是餐食的常见搭配。 |

### 21. cowboy  *n.*

| | |
| --- | --- |
| 音标 | /ˈkaʊ.bɔɪ/ |
| 中文释义 | 牛仔 |
| 英文释义 | A person who herds cattle, typically in the western United States. |
| freq_rank | 5048 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | cowboys and Indians | `culture` | Many children enjoy playing cowboys and Indians in the backyard. | 许多孩子喜欢在后院玩牛仔与印第安人。 |
| 2 | cowboy hat | `daily_life` | He wore a cowboy hat to the country music concert last night. | 他昨晚去乡村音乐会时戴着牛仔帽。 |
| 3 | cowboy ethics | `academic` | The concept of cowboy ethics is often discussed in western literature. | 牛仔伦理的概念在西部文学中经常被讨论。 |

### 22. moustache  *n.*

| | |
| --- | --- |
| 音标 | /ˈmʌs.tæʃ/ |
| 中文释义 | 胡子 |
| 英文释义 | Facial hair that grows above the upper lip. |
| freq_rank | 16314 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | handlebar moustache | `daily_life` | He styled his handlebar moustache with great care every morning. | 他每天早上细心地修饰他的胡须。 |
| 2 | thin moustache | `culture` | Many vintage photographs feature men with a thin moustache and stylish attire. | 许多复古照片中的男性都留着细胡子和时尚的服装。 |
| 3 | moustache wax | `work` | The barber recommended using moustache wax for better styling results. | 理发师建议使用胡子蜡以达到更好的造型效果。 |

### 23. agenda  *n.*

| | |
| --- | --- |
| 音标 | /əˈdʒɛn.də/ |
| 中文释义 | 议程 |
| 英文释义 | A list of items to be discussed in a meeting. |
| freq_rank | 2130 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | meeting agenda | `work` | We should prepare the meeting agenda before inviting participants. | 我们应该在邀请参与者之前准备会议议程。 |
| 2 | political agenda | `news` | The political agenda for this year focuses on health reforms. | 今年的政治议程关注健康改革。 |
| 3 | personal agenda | `daily_life` | She has a personal agenda that she keeps secret from others. | 她有一个个人议程，她对其他人保密。 |

### 24. sharpener  *n.*

| | |
| --- | --- |
| 音标 | /ˈʃɑːr.pən.ər/ |
| 中文释义 | 削尖器 |
| 英文释义 | A device for sharpening pencils or other objects' points. |
| freq_rank | 28736 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | pencil sharpener | `education` | Students often need a pencil sharpener for their writing assignments. | 学生们在写作业时常常需要一个削铅笔器。 |
| 2 | knife sharpener | `daily_life` | He bought a knife sharpener to maintain the kitchen tools in good shape. | 他买了一个刀具削尖器，以保持厨房工具的良好状态。 |
| 3 | sharpener industry | `work` | The sharpener industry is seeing a rise in demand due to new school supplies. | 由于新的学习用品，削尖器行业的需求正在上升。 |

### 25. buffet  *n./v.*

| | |
| --- | --- |
| 音标 | /bəˈfeɪ/ |
| 中文释义 | 自助餐；冲击 |
| 英文释义 | A meal where guests serve themselves from a variety of dishes. |
| freq_rank | 8330 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | buffet dinner | `daily_life` | Guests enjoyed a lavish buffet dinner at the wedding reception. | 客人在婚礼招待会上享用了丰盛的自助餐。 |
| 2 | buffet table | `culture` | The buffet table was filled with international cuisine and desserts. | 自助餐桌上摆满了国际美食和甜点。 |
| 3 | buffet style | `education` | Students preferred the buffet style lunch for its variety and convenience. | 学生们更喜欢这种自助式午餐，因为它种类丰富且方便。 |

### 26. ballpoint  *n.*

| | |
| --- | --- |
| 音标 | /ˈbɔːl.pɔɪnt/ |
| 中文释义 | 圆珠笔 |
| 英文释义 | A pen that uses a tiny ball to dispense ink. |
| freq_rank | 24069 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | ballpoint pen | `daily_life` | She prefers to use a ballpoint pen for everyday writing tasks. | 她更喜欢用圆珠笔来进行日常写作。 |
| 2 | ballpoint ink | `science_tech` | Researchers are examining the composition of ballpoint ink for environmental safety. | 研究人员正在检查圆珠笔墨水的成分以确保环境安全。 |
| 3 | ballpoint tips | `work` | The quality of ballpoint tips can significantly affect writing performance. | 圆珠笔笔尖的质量会显著影响书写效果。 |

### 27. barbecue  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈbɑːr.bɪ.kjuː/ |
| 中文释义 | 烧烤 |
| 英文释义 | A method of cooking food over fire or hot coals. |
| freq_rank | 6778 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | barbecue grill | `daily_life` | Friends gathered around the barbecue grill to enjoy the meal together. | 朋友们围着烧烤架聚在一起享受美食。 |
| 2 | barbecue sauce | `culture` | Many people prefer to add barbecue sauce to their grilled meats. | 许多人喜欢在烧烤肉类上添加烧烤酱。 |
| 3 | barbecue party | `work` | Our team organized a barbecue party to celebrate the project completion. | 我们的团队组织了一场烧烤聚会以庆祝项目完成。 |

### 28. surrounding  *n./adj.*

| | |
| --- | --- |
| 音标 | /səˈraʊn.dɪŋ/ |
| 中文释义 | 周围的；环境 |
| 英文释义 | Existing or occurring around; nearby area or environment. |
| freq_rank | 4398 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | surrounding environment | `environment` | Wildlife is often affected by the surrounding environment in urban areas. | 野生动物常常受到城市周围环境的影响。 |
| 2 | surrounding communities | `culture` | Local governments should engage with surrounding communities for better cooperation. | 地方政府应与周围社区互动，以促进更好的合作。 |
| 3 | surrounding issues | `academic` | Researchers must consider the surrounding issues affecting climate change. | 研究人员必须考虑影响气候变化的周边问题。 |

### 29. labourer  *n.*

| | |
| --- | --- |
| 音标 | /ˈleɪ.bər.ər/ |
| 中文释义 | 工人 |
| 英文释义 | A person doing manual work for wages. |
| freq_rank | 32892 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | construction labourer | `work` | Many construction labourers face challenging working conditions every day. | 许多建筑工人每天面临艰难的工作条件。 |
| 2 | seasonal labourers | `daily_life` | Seasonal labourers often migrate to different locations for work opportunities. | 季节性工人往往迁移到不同地点寻找工作机会。 |
| 3 | agricultural labourers | `news` | Agricultural labourers are essential for the farming economy and food production. | 农业工人对农业经济和食品生产至关重要。 |

### 30. thermos  *n.*

| | |
| --- | --- |
| 音标 | /ˈθɜːr.məs/ |
| 中文释义 | 保温瓶 |
| 英文释义 | A container that keeps liquids hot or cold. |
| freq_rank | 17096 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | insulated thermos | `daily_life` | Families often rely on insulated thermoses to keep drinks warm during outings. | 家庭通常依靠保温瓶在外出时保持饮料温暖。 |
| 2 | thermos flask | `travel` | When hiking, a thermos flask filled with soup can be very comforting. | 在远足时，装满汤的保温瓶会让人倍感温馨。 |
| 3 | vacuum thermos | `science_tech` | Engineers designed a vacuum thermos to minimize heat transfer effectively. | 工程师设计了一个真空保温瓶，以有效减少热量传递。 |

### 31. crowded  *adj.*

| | |
| --- | --- |
| 音标 | /ˈkraʊ.dɪd/ |
| 中文释义 | 拥挤的 |
| 英文释义 | Filled with many people or items, causing discomfort. |
| freq_rank | 4738 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | crowded places | `daily_life` | Public transportation can be very crowded during rush hours. | 公共交通在高峰时段可能非常拥挤。 |
| 2 | crowded streets | `travel` | Tourists often enjoy exploring crowded streets filled with shops. | 游客们通常喜欢探索充满商店的拥挤街道。 |
| 3 | crowded classrooms | `education` | Teachers face challenges in crowded classrooms with limited resources. | 教师在资源有限的拥挤课堂中面临挑战。 |

### 32. last  *adj./v./adv./n.*

| | |
| --- | --- |
| 音标 | /læst/ |
| 中文释义 | 最后的；持续的 |
| 英文释义 | Being the final in a sequence or duration. |
| freq_rank | 130 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | last night | `daily_life` | I watched a movie last night with my friends. | 昨晚，我和朋友们一起看了一部电影。 |
| 2 | last week | `news` | She went to the conference last week in New York. | 她上周去纽约参加会议。 |
| 3 | last forever | `culture` | True love can last forever if nurtured well. | 真爱如果得到良好滋养，可以永恒不变。 |

### 33. modem  *n.*

| | |
| --- | --- |
| 音标 | /ˈmoʊ.dɛm/ |
| 中文释义 | 调制解调器 |
| 英文释义 | A device that modulates and demodulates signals for communication. |
| freq_rank | 5518 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | broadband modem | `science_tech` | Many households now rely on broadband modems for high-speed internet access. | 如今许多家庭依赖于宽带调制解调器来获取高速互联网接入。 |
| 2 | DSL modem | `daily_life` | The technician installed a new DSL modem to improve the internet speed. | 技术人员安装了一个新的DSL调制解调器以提高互联网速度。 |
| 3 | cable modem | `work` | Employees must connect their computers to the cable modem for a stable connection. | 员工必须将计算机连接到有线调制解调器以确保稳定的连接。 |

### 34. postcode  *n.*

| | |
| --- | --- |
| 音标 | /ˈpoʊstˌkoʊd/ |
| 中文释义 | 邮政编码 |
| 英文释义 | A code used to identify specific geographic areas for mail delivery. |
| freq_rank | 22564 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | postcode area | `daily_life` | Residents in the postcode area have noticed an increase in traffic congestion. | 邮政编码区域的居民发现交通拥堵情况有所增加。 |
| 2 | postcode database | `work` | The company maintains a comprehensive postcode database for its logistics planning. | 公司维护一个全面的邮政编码数据库用于物流规划。 |
| 3 | postcode system | `education` | Understanding the postcode system is essential for effective mail sorting procedures. | 理解邮政编码系统对有效的邮件分类程序至关重要。 |

### 35. bravery  *n.*

| | |
| --- | --- |
| 音标 | /ˈbreɪ.vər.i/ |
| 中文释义 | 勇气；勇敢 |
| 英文释义 | The quality of being courageous or brave in difficult situations. |
| freq_rank | 12303 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | acts of bravery | `news` | Many acts of bravery were recognized during the award ceremony last night. | 昨晚的颁奖典礼上，许多勇敢的行为得到了表彰。 |
| 2 | display bravery | `daily_life` | You must display bravery to face your fears and overcome them. | 你必须展现勇气来面对自己的恐惧并克服它们。 |
| 3 | bravery in battle | `culture` | Historical accounts often celebrate bravery in battle as a mark of honor. | 历史记载常常赞扬战斗中的勇气，视其为荣誉的标志。 |

### 36. wildlife  *n.*

| | |
| --- | --- |
| 音标 | /ˈwaɪld.laɪf/ |
| 中文释义 | 野生动物 |
| 英文释义 | Animals and plants living in their natural environment. |
| freq_rank | 3859 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | wildlife conservation | `environment` | Many organizations focus on wildlife conservation efforts each year. | 许多组织每年专注于野生动物保护工作。 |
| 2 | wildlife habitat | `science_tech` | Researchers study wildlife habitats to understand ecosystem health. | 研究人员研究野生动物栖息地以了解生态系统健康。 |
| 3 | wildlife photography | `daily_life` | He enjoys wildlife photography during his vacations in nature. | 他在假期里喜欢拍摄野生动物的照片。 |

### 37. crossing  *n.*

| | |
| --- | --- |
| 音标 | /ˈkrɔ.sɪŋ/ |
| 中文释义 | 交叉；十字路口 |
| 英文释义 | The act of moving across something, or a place where roads meet. |
| freq_rank | 6302 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | crossing the street | `daily_life` | Many children are taught about crossing the street safely. | 许多孩子被教导如何安全过马路。 |
| 2 | railroad crossings | `work` | Engineers must ensure safety at all railroad crossings. | 工程师必须确保所有铁路道口的安全。 |
| 3 | crossing boundaries | `academic` | Crossing boundaries in research can lead to innovative discoveries. | 在研究中跨越界限可能导致创新的发现。 |

### 38. disobey  *v.*

| | |
| --- | --- |
| 音标 | /ˌdɪs.əˈbeɪ/ |
| 中文释义 | 不服从 |
| 英文释义 | To refuse to follow rules or authority. |
| freq_rank | 15476 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | disobey rules | `education` | Students who disobey rules may face consequences during school activities. | 不服从规则的学生在学校活动中可能会面临后果。 |
| 2 | disobey orders | `work` | Employees who disobey orders from their supervisors can be reprimanded. | 不服从上级命令的员工可能会受到斥责。 |
| 3 | disobey the law | `news` | Many citizens disobey the law, resulting in increased crime rates in the area. | 许多公民不遵守法律，导致该地区犯罪率上升。 |

### 39. mm  *(ECDICT 没标词性)*

| | |
| --- | --- |
| 音标 | /ɛm ɛm/ |
| 中文释义 | 嗯；表现犹豫或思考的声音 |
| 英文释义 | A sound made to express hesitation or thinking. |
| freq_rank | 15832 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | mm, I see what you mean. | `daily_life` | I was unsure about the plan, but mm, it makes sense now. | 我对这个计划不太确定，不过嗯，现在说得通了。 |
| 2 | mm, that's interesting. | `academic` | During the lecture, mm, the professor raised several thought-provoking questions. | 在讲座中，嗯，教授提出了几个引人深思的问题。 |
| 3 | mm, I need to think about it. | `work` | Before making a final decision, mm, I really need to consider all options. | 在做出最终决定之前，嗯，我确实需要考虑所有选项。 |

### 40. reviewer  *n.*

| | |
| --- | --- |
| 音标 | /rɪˈvjuː.ər/ |
| 中文释义 | 评审人；审稿人 |
| 英文释义 | A person who evaluates or critiques something, often in written form. |
| freq_rank | 8282 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | peer reviewer | `academic` | Many journals rely on peer reviewers to ensure quality articles. | 许多期刊依赖于评审人来确保文章的质量。 |
| 2 | movie reviewer | `culture` | A famous movie reviewer praised the film for its stunning visuals. | 一位著名的影评人称赞这部电影画面惊艳。 |
| 3 | book reviewer | `daily_life` | Last week, a book reviewer highlighted a new author’s debut novel. | 上周，一位书评人强调了一位新作者的处女作。 |

### 41. abortion  *n.*

| | |
| --- | --- |
| 音标 | /əˈbɔːr.ʃən/ |
| 中文释义 | 堕胎 |
| 英文释义 | The termination of a pregnancy by removal of an embryo or fetus. |
| freq_rank | 1969 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | unsafe abortion | `health` | Many women face health risks due to unsafe abortions. | 许多女性因堕胎不安全而面临健康风险。 |
| 2 | abortion rights | `news` | Activists continue to fight for abortion rights across the country. | 活动人士继续在全国范围内争取堕胎权利。 |
| 3 | abortion clinic | `daily_life` | She visited the local abortion clinic for advice and support. | 她去当地的堕胎诊所寻求建议和支持。 |

### 42. punctuation  *n.*

| | |
| --- | --- |
| 音标 | /ˌpʌŋk.tʃuˈeɪ.ʃən/ |
| 中文释义 | 标点符号 |
| 英文释义 | Symbols that clarify meaning in written language. |
| freq_rank | 15876 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | punctuation marks | `education` | Teachers often emphasize the importance of punctuation marks in writing assignments. | 教师常常强调标点符号在写作作业中的重要性。 |
| 2 | correct punctuation | `daily_life` | Using correct punctuation can make a significant difference in your message's clarity. | 使用正确的标点可以显著提高信息的清晰度。 |
| 3 | punctuation errors | `work` | Punctuation errors in reports can lead to misunderstandings among team members. | 报告中的标点错误可能导致团队成员之间的误解。 |

### 43. eyewitness  *n.*

| | |
| --- | --- |
| 音标 | /ˈaɪˌwɪt.nəs/ |
| 中文释义 | 目击者 |
| 英文释义 | A person who sees an event, typically a crime or accident. |
| freq_rank | 8633 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | eyewitness account | `news` | Many eyewitness accounts reported the same details about the accident. | 许多目击者的陈述报告了关于事故的相同细节。 |
| 2 | eyewitness testimony | `work` | During the trial, the eyewitness testimony was crucial for the defense. | 在审判过程中，目击者的证词对辩方至关重要。 |
| 3 | eyewitness reports | `academic` | Researchers analyzed several eyewitness reports to understand human memory reliability. | 研究人员分析了几份目击者报告，以了解人类记忆的可靠性。 |

### 44. unsafe  *adj.*

| | |
| --- | --- |
| 音标 | /ʌnˈseɪf/ |
| 中文释义 | 不安全的 |
| 英文释义 | Not safe; involving risk of harm or danger. |
| freq_rank | 9139 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | unsafe working conditions | `work` | Many employees worry about unsafe working conditions in their factories. | 许多员工担心他们工厂里的不安全工作环境。 |
| 2 | unsafe food | `health` | Consuming unsafe food can lead to serious health issues. | 食用不安全的食物可能会导致严重的健康问题。 |
| 3 | unsafe environment | `environment` | Living in an unsafe environment affects children's development significantly. | 生活在不安全的环境中会显著影响儿童的发展。 |

### 45. windbreaker  *n.*

| | |
| --- | --- |
| 音标 | /ˈwɪndˌbreɪ.kər/ |
| 中文释义 | 风衣 |
| 英文释义 | A lightweight jacket designed to resist wind and light rain. |
| freq_rank | 18855 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | a windbreaker jacket | `daily_life` | Wearing a windbreaker jacket is essential for morning jogs in autumn. | 在秋天的早晨慢跑时，穿风衣是必不可少的。 |
| 2 | wear a windbreaker | `travel` | During our hike, I decided to wear a windbreaker to stay comfortable and dry. | 在远足时，我决定穿上风衣以保持舒适和干燥。 |
| 3 | pack a windbreaker | `education` | Students should pack a windbreaker for outdoor activities during the school trip. | 学生们应该为校外活动准备一件风衣。 |

### 46. pleased  *adj.*

| | |
| --- | --- |
| 音标 | /plizd/ |
| 中文释义 | 高兴的 |
| 英文释义 | Feeling or showing satisfaction or happiness. |
| freq_rank | 3448 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | pleased to meet you | `daily_life` | I was very pleased to meet you at the event yesterday. | 我很高兴昨天在活动中见到你。 |
| 2 | pleased with the results | `work` | She is pleased with the results of her recent project. | 她对最近项目的结果感到满意。 |
| 3 | pleased to announce | `news` | The school is pleased to announce the scholarship winners today. | 学校很高兴今天宣布奖学金获得者。 |

### 47. database  *n.*

| | |
| --- | --- |
| 音标 | /ˈdeɪ.təˌbeɪs/ |
| 中文释义 | 数据库 |
| 英文释义 | A structured collection of data stored electronically. |
| freq_rank | 3638 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | database management system | `work` | Many companies use a database management system for efficient data storage. | 许多公司使用数据库管理系统以高效存储数据。 |
| 2 | relational database | `science_tech` | Researchers often rely on a relational database to analyze large datasets. | 研究人员常常依赖关系数据库来分析大型数据集。 |
| 3 | database security | `health` | Maintaining database security is crucial to protect patient information. | 维护数据库安全对保护患者信息至关重要。 |

### 48. seashell  *n.*

| | |
| --- | --- |
| 音标 | /ˈsiː.ʃɛl/ |
| 中文释义 | 海螺；贝壳 |
| 英文释义 | A hard shell of a marine mollusk. |
| freq_rank | 19554 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | seashell collection | `daily_life` | Many children enjoy creating a seashell collection during their beach vacations. | 许多孩子喜欢在海滩度假时收集海螺。 |
| 2 | seashell designs | `culture` | Artists often use seashell designs to inspire their jewelry creations. | 艺术家经常用海螺的设计来激发他们的首饰创作。 |
| 3 | seashell fossils | `science_tech` | Researchers discovered ancient seashell fossils that reveal past ocean conditions. | 研究人员发现了古老的海螺化石，这些化石揭示了过去海洋的状况。 |

### 49. freezing  *adj.*

| | |
| --- | --- |
| 音标 | /ˈfriː.zɪŋ/ |
| 中文释义 | 冰冻的；极冷的 |
| 英文释义 | Extremely cold, often causing water to turn into ice. |
| freq_rank | 6369 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | freezing temperature | `environment` | Temperatures are dropping, leading to freezing conditions this evening. | 气温正在下降，今晚将出现冰冻天气。 |
| 2 | freezing point | `science_tech` | Water reaches its freezing point at zero degrees Celsius under normal pressure. | 在正常压力下，水在零摄氏度达到冰点。 |
| 3 | freezing rain | `daily_life` | Many roads were closed due to dangerous freezing rain in the area. | 由于该地区冰冻雨的危险，许多道路被关闭。 |

### 50. nursing  *n.*

| | |
| --- | --- |
| 音标 | /ˈnɜːr.sɪŋ/ |
| 中文释义 | 护理 |
| 英文释义 | The profession or practice of providing medical care. |
| freq_rank | 5250 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | nursing practice | `health` | Healthcare professionals must adhere to nursing practice standards. | 医疗专业人员必须遵循护理实践标准。 |
| 2 | nursing skills | `education` | Students learn various nursing skills during their training programs. | 学生在培训课程中学习各种护理技能。 |
| 3 | nursing degree | `academic` | Obtaining a nursing degree requires dedication and hard work. | 获得护理学位需要奉献和努力。 |

### 51. bear  *n./v.*

| | |
| --- | --- |
| 音标 | /bɛr/ |
| 中文释义 | 忍受；承受 |
| 英文释义 | To endure or tolerate something difficult or unpleasant. |
| freq_rank | 1619 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | bear responsibility | `work` | Managers must bear responsibility for their team's performance. | 管理者必须承担团队表现的责任。 |
| 2 | bear fruit | `science_tech` | The new research may eventually bear fruit in practical applications. | 这项新研究最终可能会在实际应用中取得成果。 |
| 3 | bear in mind | `education` | Always bear in mind the importance of studying regularly. | 时刻记住定期学习的重要性。 |

### 52. videophone  *n.*

| | |
| --- | --- |
| 音标 | /ˈvaɪ.də.foʊn/ |
| 中文释义 | 视频电话 |
| 英文释义 | A device used for transmitting video and audio during a call. |
| freq_rank | 27086 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | videophone technology | `science_tech` | Advancements in videophone technology enable clearer communication during virtual meetings. | 视频电话技术的进步使得虚拟会议中的沟通更加清晰。 |
| 2 | using a videophone | `daily_life` | Many families are using a videophone to stay connected during long distances. | 许多家庭在长距离中使用视频电话保持联系。 |
| 3 | videophones in education | `education` | Educators are integrating videophones in education to enhance remote learning experiences. | 教育工作者正在将视频电话融入教育，以增强远程学习体验。 |

### 53. hardworking  *adj.*

| | |
| --- | --- |
| 音标 | /ˌhɑrdˈwɜrkɪŋ/ |
| 中文释义 | 勤奋的 |
| 英文释义 | Characterized by hard work and dedication to tasks or goals. |
| freq_rank | 18992 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | hardworking students | `education` | Students who are hardworking often achieve better academic results than their peers. | 勤奋的学生通常比同龄人取得更好的学业成绩。 |
| 2 | hardworking employees | `work` | Many companies prioritize hiring hardworking employees for their commitment and reliability. | 许多公司优先雇用勤奋的员工，因为他们的责任心和可靠性。 |
| 3 | hardworking individuals | `daily_life` | Hardworking individuals often find success through perseverance and determination in their endeavors. | 勤奋的人在追求目标时通常通过坚持和决心获得成功。 |

### 54. washroom  *n.*

| | |
| --- | --- |
| 音标 | /ˈwɔʃ.ruːm/ |
| 中文释义 | 洗手间 |
| 英文释义 | A room with a toilet and sink for personal hygiene. |
| freq_rank | 24741 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | washroom facilities | `daily_life` | Visitors are encouraged to use the washroom facilities located near the entrance. | 我们鼓励游客使用入口附近的洗手间设施。 |
| 2 | washroom break | `work` | Employees should take a washroom break when necessary to maintain their productivity. | 员工在必要时应休息一下，去洗手间以保持工作效率。 |
| 3 | public washroom | `travel` | Finding a clean public washroom can be quite challenging in busy tourist areas. | 在繁忙的旅游区，找到干净的公共洗手间可能非常困难。 |

### 55. thinking  *n./adj.*

| | |
| --- | --- |
| 音标 | /ˈθɪŋ.kɪŋ/ |
| 中文释义 | 思考；想法 |
| 英文释义 | The process of using one's mind to consider something. |
| freq_rank | 1695 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | critical thinking | `education` | Teachers encourage critical thinking among their students. | 教师鼓励学生进行批判性思维。 |
| 2 | creative thinking | `work` | Many companies value creative thinking in problem-solving. | 许多公司重视在解决问题时的创造性思维。 |
| 3 | logical thinking | `science_tech` | Logical thinking is essential for scientific research. | 逻辑思维对科学研究至关重要。 |

### 56. subtraction  *n.*

| | |
| --- | --- |
| 音标 | /səbˈtræk.ʃən/ |
| 中文释义 | 减法 |
| 英文释义 | The process of taking one number away from another. |
| freq_rank | 21980 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | subtraction operation | `academic` | In mathematics, the subtraction operation is fundamental to understanding arithmetic. | 在数学中，减法运算是理解算术的基础。 |
| 2 | subtraction problems | `education` | Teachers often assign subtraction problems to help students improve their math skills. | 老师经常布置减法题目，以帮助学生提高数学能力。 |
| 3 | subtraction rule | `science_tech` | The subtraction rule is critical for solving complex equations in physics. | 减法规则对解决物理学中的复杂方程至关重要。 |

### 57. cance  *(ECDICT 没标词性)*

| | |
| --- | --- |
| 音标 | /ˈkæns/ |
| 中文释义 | 取消 |
| 英文释义 | To revoke or annul something, typically a planned event or arrangement. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | cance a meeting | `work` | The team decided to cancel a meeting that was no longer necessary. | 团队决定取消一个不再必要的会议。 |
| 2 | cance an order | `daily_life` | She had to cancel an order due to a change in her plans. | 她因为计划的变化而不得不取消一个订单。 |
| 3 | cance a subscription | `culture` | Many users choose to cancel a subscription that no longer meets their needs. | 许多用户选择取消一个不再满足他们需求的订阅。 |

### 58. snowman  *n.*

| | |
| --- | --- |
| 音标 | /ˈsnoʊ.mæn/ |
| 中文释义 | 雪人 |
| 英文释义 | A figure made of packed snow, typically with a carrot nose. |
| freq_rank | 18086 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | build a snowman | `daily_life` | Families often gather to build a snowman during winter holidays. | 家庭通常会在冬季假期聚在一起堆雪人。 |
| 2 | snowman decorations | `culture` | Many people display snowman decorations to celebrate the festive season. | 许多人用雪人装饰品来庆祝节日季节。 |
| 3 | snowman contest | `education` | Students participated in a snowman contest organized by their school this winter. | 学生们参加了学校在这个冬天组织的雪人比赛。 |

### 59. accountant  *n.*

| | |
| --- | --- |
| 音标 | /əˈkaʊntənt/ |
| 中文释义 | 会计 |
| 英文释义 | A professional who performs financial record-keeping and reporting tasks. |
| freq_rank | 5949 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | certified public accountant | `work` | Many companies hire certified public accountants to manage their finances effectively. | 许多公司聘请注册会计师以有效管理财务。 |
| 2 | management accountant | `daily_life` | In larger organizations, management accountants provide strategic financial advice to leaders. | 在更大的组织中，管理会计师为领导者提供战略财务建议。 |
| 3 | forensic accountant | `news` | Forensic accountants investigate financial discrepancies in criminal cases regularly. | 法务会计师定期调查刑事案件中的财务差异。 |

### 60. franc  *n.*

| | |
| --- | --- |
| 音标 | /fræŋk/ |
| 中文释义 | 法郎 |
| 英文释义 | A unit of currency used in various countries. |
| freq_rank | 7261 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | Swiss franc | `daily_life` | Prices in Switzerland are often quoted in Swiss francs. | 在瑞士，价格往往以瑞士法郎报价。 |
| 2 | French franc | `culture` | Before the euro, the French franc was the official currency of France. | 在欧元之前，法国法郎是法国的官方货币。 |
| 3 | convert francs | `travel` | Travelers need to convert their money into francs when visiting certain countries. | 游客在访问某些国家时需要将他们的钱兑换成法郎。 |

### 61. spoonful  *n.*

| | |
| --- | --- |
| 音标 | /ˈspuːn.fʊl/ |
| 中文释义 | 一勺的量 |
| 英文释义 | The amount that a spoon can hold. |
| freq_rank | 14845 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | spoonful of sugar | `daily_life` | Many people prefer a spoonful of sugar in their tea. | 很多人喜欢在茶里加一勺糖。 |
| 2 | spoonfuls of medicine | `health` | Doctors often recommend a spoonfuls of medicine for relief. | 医生常常建议服用一勺药以缓解症状。 |
| 3 | spoonful of flour | `science_tech` | For the experiment, add a spoonful of flour to the mixture. | 在实验中，往混合物中加入一勺面粉。 |

### 62. cab  *n./v.*

| | |
| --- | --- |
| 音标 | /kæb/ |
| 中文释义 | 出租车；马车 |
| 英文释义 | A vehicle for hire, often with a driver. |
| freq_rank | 4220 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | taxi cab | `daily_life` | A taxi cab is waiting outside the hotel for guests. | 一家酒店外面正等着一辆出租车接客人。 |
| 2 | hire a cab | `travel` | Many travelers prefer to hire a cab for convenience. | 许多旅行者为了方便选择租用出租车。 |
| 3 | cab driver | `work` | The cab driver shared interesting stories from his daily routes. | 出租车司机分享了他日常路线中的有趣故事。 |

### 63. messy  *adj.*

| | |
| --- | --- |
| 音标 | /ˈmɛ.si/ |
| 中文释义 | 凌乱的；杂乱的 |
| 英文释义 | Characterized by disorder or untidiness. |
| freq_rank | 6651 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | messy situation | `news` | The latest report highlighted a messy situation in the government. | 最新报告强调了政府中的一个凌乱局面。 |
| 2 | messy desk | `work` | Colleagues often complain about my messy desk during meetings. | 同事们在会议期间常常抱怨我的办公桌凌乱。 |
| 3 | messy process | `science_tech` | Developing new software can be a messy process with many unexpected issues. | 开发新软件可能是一个充满许多意外问题的凌乱过程。 |

### 64. leftover  *n./adj.*

| | |
| --- | --- |
| 音标 | /ˈlɛftˌoʊ.vɚ/ |
| 中文释义 | 剩余物；剩饭 |
| 英文释义 | Something remaining after the majority has been used or consumed. |
| freq_rank | 9769 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | leftover food | `daily_life` | Many people struggle to find creative uses for leftover food. | 许多人努力寻找剩余食物的创造性用法。 |
| 2 | leftover materials | `science_tech` | Engineers often repurpose leftover materials for new projects. | 工程师们经常将剩余材料用于新项目。 |
| 3 | leftover money | `work` | The company plans to allocate leftover money to employee bonuses. | 公司计划将剩余资金分配给员工奖金。 |

### 65. zipper  *n.*

| | |
| --- | --- |
| 音标 | /ˈzɪpər/ |
| 中文释义 | 拉链 |
| 英文释义 | A fastening device consisting of two flexible strips bearing interlocking metal or plastic teeth. |
| freq_rank | 10432 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | zipper malfunction | `work` | Unexpectedly, the zipper malfunctioned during the crucial presentation, causing embarrassment. | 意外地，拉链在关键演示中出现故障，导致尴尬。 |
| 2 | zipper design | `culture` | Innovative zipper design has transformed fashion, allowing for more versatile garment styles. | 创新的拉链设计改变了时尚，使服装风格更加多样化。 |
| 3 | zipper installation | `science_tech` | A proper zipper installation is essential for ensuring the product's durability and functionality. | 正确的拉链安装对确保产品的耐用性和功能性至关重要。 |

### 66. unbelievable  *adj.*

| | |
| --- | --- |
| 音标 | /ˌʌn.bɪˈliː.və.bəl/ |
| 中文释义 | 难以置信的 |
| 英文释义 | Difficult to believe; incredible or astonishing. |
| freq_rank | 6070 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | unbelievable results | `science_tech` | Researchers reported unbelievable results from the latest experiment. | 研究人员报告了最新实验的难以置信的结果。 |
| 2 | unbelievable story | `daily_life` | Everyone was captivated by the unbelievable story he shared at dinner. | 大家都被他在晚餐时分享的难以置信的故事吸引住了。 |
| 3 | unbelievable prices | `culture` | Visitors were shocked by the unbelievable prices at the local market. | 游客们对当地市场的难以置信的价格感到震惊。 |

### 67. anecdote  *n.*

| | |
| --- | --- |
| 音标 | /ˈæn.ɪk.doʊt/ |
| 中文释义 | 轶事；趣闻 |
| 英文释义 | A short, amusing or interesting story about a real incident. |
| freq_rank | 8925 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | personal anecdotes | `daily_life` | People often share personal anecdotes to connect with others during conversations. | 人们常常分享个人轶事，以便在交谈中与他人建立联系。 |
| 2 | historical anecdotes | `education` | Students found the historical anecdotes engaging and relevant to their studies. | 学生们发现这些历史轶事引人入胜，与他们的学习相关。 |
| 3 | anecdotes about celebrities | `culture` | Writers frequently include anecdotes about celebrities to entertain their readers. | 作家们常常加入关于名人的轶事，以娱乐读者。 |

### 68. postbox  *n.*

| | |
| --- | --- |
| 音标 | /ˈpoʊst.bɑːks/ |
| 中文释义 | 邮筒 |
| 英文释义 | A box for sending and receiving mail. |
| freq_rank | 40238 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | postbox location | `daily_life` | Finding the nearest postbox location can save you a lot of time. | 寻找最近的邮筒位置可以节省很多时间。 |
| 2 | postbox key | `work` | I misplaced the postbox key, delaying our mail delivery. | 我把邮筒钥匙放错地方了，导致邮件送达延误。 |
| 3 | postbox collection | `education` | The postbox collection will happen every afternoon at three o'clock. | 邮筒的收集将在每天下午三点进行。 |

### 69. souvenirs  *n.*

| | |
| --- | --- |
| 音标 | /ˌsuː.vəˈnɪrz/ |
| 中文释义 | 纪念品 |
| 英文释义 | Items kept as reminders of people, places, or experiences. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | local souvenirs | `travel` | Local souvenirs often reflect the culture and traditions of a region. | 当地的纪念品通常反映了一个地区的文化和传统。 |
| 2 | souvenirs from abroad | `daily_life` | He brought back souvenirs from abroad to share with his family. | 他从国外带回了纪念品与家人分享。 |
| 3 | souvenirs of a trip | `culture` | Souvenirs of a trip can evoke wonderful memories and emotions. | 旅行的纪念品可以唤起美好的回忆和情感。 |

### 70. popcorn  *n.*

| | |
| --- | --- |
| 音标 | /ˈpɑːp.kɔːrn/ |
| 中文释义 | 爆米花 |
| 英文释义 | A type of corn that pops when heated. |
| freq_rank | 8839 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | buttered popcorn | `daily_life` | Many people enjoy buttery popcorn while watching movies. | 许多人在看电影时都喜欢吃黄油爆米花。 |
| 2 | popcorn machine | `work` | The staff purchased a new popcorn machine for the office events. | 工作人员为办公室活动购买了一台新的爆米花机。 |
| 3 | popcorn kernels | `science_tech` | Research shows that popcorn kernels have unique moisture levels. | 研究表明，爆米花颗粒具有独特的水分含量。 |

### 71. refreshments  *n.*

| | |
| --- | --- |
| 音标 | /rɪˈfrɛʃ.mənts/ |
| 中文释义 | 茶点；饮料 |
| 英文释义 | Light food and drinks served at an event or gathering. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | refreshments served | `work` | Attendees enjoyed refreshments served during the conference, enhancing the networking experience. | 与会者在会议期间享用了提供的茶点，增进了人际网络的交流。 |
| 2 | refreshments available | `culture` | At the festival, various refreshments were available to keep everyone energized throughout the day. | 在节日上，提供了各种茶点，让大家在一天中保持活力。 |
| 3 | refreshments included | `academic` | The seminar featured refreshments included in the registration fee, encouraging participation. | 研讨会包括了注册费内的茶点，激励参与者积极参与。 |

### 72. disgusting  *adj.*

| | |
| --- | --- |
| 音标 | /dɪsˈɡʌs.tɪŋ/ |
| 中文释义 | 令人厌恶的 |
| 英文释义 | Causing a strong feeling of dislike or revulsion. |
| freq_rank | 8938 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | disgusting behavior | `daily_life` | Many people find disgusting behavior unacceptable in public places. | 许多人觉得在公共场所令人厌恶的行为是不可接受的。 |
| 2 | disgusting food | `health` | Some tourists reported the food as disgusting at the local restaurant. | 一些游客报告当地餐厅的食物令人厌恶。 |
| 3 | disgusting habits | `culture` | Cultural differences can lead to misunderstandings about disgusting habits. | 文化差异可能导致对令人厌恶的习惯的误解。 |

### 73. fingernail  *n.*

| | |
| --- | --- |
| 音标 | /ˈfɪŋ.ɡər.neɪl/ |
| 中文释义 | 指人的指甲 |
| 英文释义 | The hard protective covering on the tip of a finger. |
| freq_rank | 7769 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | fingernail polish | `daily_life` | She decided to apply some bright fingernail polish before the party. | 她决定在派对前涂上鲜亮的指甲油。 |
| 2 | fingernail clippings | `health` | Regularly disposing of fingernail clippings helps maintain cleanliness. | 定期处理指甲屑有助于保持清洁。 |
| 3 | fingernail growth | `science_tech` | Research shows that fingernail growth varies among different individuals. | 研究表明，指甲生长因人而异。 |

### 74. matter  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈmæt.ər/ |
| 中文释义 | 事情；物质 |
| 英文释义 | A subject or situation under consideration or discussion. |
| freq_rank | 528 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | the matter at hand | `daily_life` | Everyone needs to understand the matter at hand. | 每个人都需要理解眼前的事情。 |
| 2 | no matter what | `work` | No matter what happens, we will finish the project. | 无论发生什么，我们都会完成这个项目。 |
| 3 | matter of importance | `education` | This is a matter of importance for our students' future. | 这对我们学生的未来是一个重要的事情。 |

### 75. breathless  *adj.*

| | |
| --- | --- |
| 音标 | /ˈbrɛθ.ləs/ |
| 中文释义 | 气喘吁吁的 |
| 英文释义 | Unable to breathe easily; often due to excitement or exertion. |
| freq_rank | 10896 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | breathless excitement | `culture` | Children watched the performance with breathless excitement and amazement. | 孩子们满怀激动与惊奇地观看演出。 |
| 2 | breathless pace | `work` | She maintained a breathless pace during the final sprint of the marathon. | 她在马拉松的最后冲刺中保持着气喘吁吁的速度。 |
| 3 | breathless admiration | `daily_life` | Visitors expressed breathless admiration for the ancient architecture of the city. | 游客们对这座城市古老的建筑赞叹不已。 |

### 76. miniskirt  *n.*

| | |
| --- | --- |
| 音标 | /ˈmɪn.i.skɜːrt/ |
| 中文释义 | 迷你裙 |
| 英文释义 | A short skirt that typically ends above the knee. |
| freq_rank | 20289 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | miniskirt fashion | `culture` | Fashion designers often showcase innovative miniskirt styles during runway shows. | 时尚设计师们常常在时装秀上展示创新的迷你裙款式。 |
| 2 | wearing a miniskirt | `daily_life` | She felt confident wearing a miniskirt to the summer party last weekend. | 她觉得上周末在夏季派对上穿迷你裙很自信。 |
| 3 | miniskirt trend | `news` | The latest miniskirt trend has sparked discussions about body image and fashion standards. | 最新的迷你裙趋势引发了关于身体形象和时尚标准的讨论。 |

### 77. bedclothes  *n.*

| | |
| --- | --- |
| 音标 | /ˈbɛd.kləʊðz/ |
| 中文释义 | 床上用品 |
| 英文释义 | Items used on a bed for warmth or comfort. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | bedclothes set | `daily_life` | Many people prefer to buy a new bedclothes set every season. | 许多人喜欢每个季节购买一套新的床上用品。 |
| 2 | bedclothes storage | `work` | Effective bedclothes storage can save space and reduce clutter in bedrooms. | 有效的床上用品储存可以节省空间，减少卧室杂乱。 |
| 3 | bedclothes color | `culture` | The bedclothes color significantly influences the overall ambience of the room. | 床上用品的颜色显著影响房间的整体氛围。 |

### 78. block  *n./v.*

| | |
| --- | --- |
| 音标 | /blɑk/ |
| 中文释义 | 阻碍；街区 |
| 英文释义 | To obstruct or stop movement; a solid piece. |
| freq_rank | 1314 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | block the road | `daily_life` | Cars often block the road during rush hour. | 高峰时段，汽车经常阻碍道路。 |
| 2 | block access | `work` | We need to block access to sensitive information. | 我们需要阻止访问敏感信息。 |
| 3 | block a shot | `science_tech` | The player can block a shot in basketball effectively. | 这名球员能有效地挡住篮球投篮。 |

### 79. athletics  *n.*

| | |
| --- | --- |
| 音标 | /æθˈlɛtɪks/ |
| 中文释义 | 田径 |
| 英文释义 | A collection of competitive sports involving running, jumping, and throwing. |
| freq_rank | 8574 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | track and field athletics | `education` | Students often participate in track and field athletics during school competitions. | 学生们在学校比赛中经常参加田径比赛。 |
| 2 | athletics team | `daily_life` | Joining an athletics team can enhance your physical fitness and social skills. | 加入田径队可以提高你的身体素质和社交能力。 |
| 3 | athletics event | `culture` | The athletics event attracted numerous spectators and participants from various regions. | 这场田径赛事吸引了来自各个地区的大量观众和参与者。 |

### 80. gram  *n.*

| | |
| --- | --- |
| 音标 | /ɡræm/ |
| 中文释义 | 克 |
| 英文释义 | A unit of mass equal to one thousandth of a kilogram. |
| freq_rank | 9092 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | gram of sugar | `daily_life` | Adding a gram of sugar can enhance the flavor of your tea. | 加入一克糖可以提升你的茶的味道。 |
| 2 | gram per liter | `science_tech` | The concentration of the solution is measured in grams per liter. | 溶液的浓度以每升克数来衡量。 |
| 3 | milligram to gram | `health` | To convert milligrams to grams, divide the number by one thousand. | 要将毫克转换为克，将数字除以一千。 |

### 81. drier  *n.*

| | |
| --- | --- |
| 音标 | /ˈdraɪ.ər/ |
| 中文释义 | 干燥剂 |
| 英文释义 | A substance used to remove moisture from the air or materials. |
| freq_rank | 22822 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | drier air | `environment` | Drier air in the winter can lead to dry skin and respiratory issues. | 冬季的干燥空气可能导致皮肤干燥和呼吸问题。 |
| 2 | drier conditions | `science_tech` | Scientists reported that drier conditions are affecting local ecosystems and agriculture. | 科学家报告称，干燥的条件正在影响当地生态系统和农业。 |
| 3 | drier climates | `travel` | Travelers often prefer drier climates for outdoor activities like hiking and camping. | 旅行者通常更喜欢干燥的气候进行徒步和露营等户外活动。 |

### 82. smoker  *n.*

| | |
| --- | --- |
| 音标 | /ˈsmoʊ.kər/ |
| 中文释义 | 吸烟者 |
| 英文释义 | A person who regularly smokes tobacco products. |
| freq_rank | 6646 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | smoker's lung | `health` | Many health issues arise from a smoker's lung condition over time. | 随着时间推移，吸烟者的肺部状况引发许多健康问题。 |
| 2 | former smoker | `daily_life` | A former smoker often shares their experiences to help others quit. | 一位前吸烟者常常分享他们的经历来帮助他人戒烟。 |
| 3 | smoker's rights | `news` | There is ongoing debate about smoker's rights in public areas. | 关于公共区域吸烟者的权利，正在进行持续的辩论。 |

### 83. hilly  *adj.*

| | |
| --- | --- |
| 音标 | /ˈhɪli/ |
| 中文释义 | 丘陵的 |
| 英文释义 | Having many hills; characterized by undulating terrain. |
| freq_rank | 15597 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | hilly terrain | `environment` | Traveling through the hilly terrain can be quite challenging for cyclists. | 穿越丘陵地带对骑自行车的人来说相当具有挑战性。 |
| 2 | hilly landscape | `travel` | Many tourists are drawn to the hilly landscape of the region for hiking. | 许多游客被该地区的丘陵风光吸引去远足。 |
| 3 | hilly roads | `daily_life` | Driving on hilly roads requires extra caution, especially in bad weather. | 在丘陵道路上驾驶在恶劣天气中需要额外小心。 |

### 84. adjustment  *n.*

| | |
| --- | --- |
| 音标 | /əˈdʒʌst.mənt/ |
| 中文释义 | 调整 |
| 英文释义 | A change made to improve a situation or condition. |
| freq_rank | 3121 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | make adjustments | `work` | Employees need to make adjustments to their schedules often. | 员工需要经常调整他们的日程。 |
| 2 | adjustment process | `science_tech` | The adjustment process can take several weeks to complete. | 调整过程可能需要几周才能完成。 |
| 3 | require adjustments | `education` | Some students may require adjustments to their learning environment. | 一些学生可能需要调整他们的学习环境。 |

### 85. unimportant  *adj.*

| | |
| --- | --- |
| 音标 | /ʌnɪmˈpɔːrtənt/ |
| 中文释义 | 不重要的 |
| 英文释义 | Not significant or relevant in a given context. |
| freq_rank | 12727 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | unimportant details | `work` | Many unimportant details were omitted from the final report, simplifying the presentation. | 许多不重要的细节在最终报告中被省略，使得呈现更加简洁。 |
| 2 | unimportant issues | `education` | Students often feel that unimportant issues distract them from their studies during exams. | 学生们常常觉得不重要的问题在考试期间干扰了他们的学习。 |
| 3 | unimportant matters | `daily_life` | Sometimes, we worry about unimportant matters instead of focusing on what truly matters. | 有时，我们担心不重要的事情，而不是专注于真正重要的事务。 |

### 86. overweight  *n./adj./v.*

| | |
| --- | --- |
| 音标 | /ˌoʊ.vərˈweɪt/ |
| 中文释义 | 超重 |
| 英文释义 | Exceeding the normal weight limit for health. |
| freq_rank | 6628 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | overweight individuals | `health` | Many overweight individuals struggle to maintain a healthy lifestyle. | 许多超重的人难以保持健康的生活方式。 |
| 2 | overweight children | `education` | Overweight children may face challenges in physical education classes. | 超重儿童在体育课上可能面临挑战。 |
| 3 | overweight population | `news` | The overweight population has been steadily increasing in recent years. | 近年来，超重人口稳步增加。 |

### 87. ouch  *int./n.*

| | |
| --- | --- |
| 音标 | /aʊtʃ/ |
| 中文释义 | 哎呀；疼痛的感叹词 |
| 英文释义 | An expression of pain or discomfort. |
| freq_rank | 15065 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | ouch moment | `health` | He exclaimed 'ouch' after accidentally hitting his thumb with a hammer. | 他在不小心用锤子砸到拇指后喊了声“哎呀”。 |
| 2 | ouch sound | `daily_life` | During the game, several players yelled 'ouch' when they fell hard on the ground. | 比赛中，几名球员在摔倒在地时大声喊了“哎呀”。 |
| 3 | ouch reaction | `culture` | People often have an 'ouch' reaction to unexpected painful experiences in films. | 人们在电影中面对意外痛苦经历时，常常会有“哎呀”的反应。 |

### 88. barbershop  *n.*

| | |
| --- | --- |
| 音标 | /ˈbɑːr.bər.ʃɒp/ |
| 中文释义 | 理发店 |
| 英文释义 | A shop where hair is cut and styled. |
| freq_rank | 16205 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | barbershop culture | `culture` | Barbershop culture has a rich history in many communities. | 理发店文化在许多社区中有着丰富的历史。 |
| 2 | barbershop quartet | `daily_life` | He enjoys performing in a barbershop quartet on weekends. | 他喜欢在周末参加理发店四重唱演出。 |
| 3 | barbershop services | `work` | Many barbershops offer additional services like shaving and beard trimming. | 许多理发店提供剃须和修剪胡须等附加服务。 |

### 89. wayside  *n./adj.*

| | |
| --- | --- |
| 音标 | /ˈweɪˌsaɪd/ |
| 中文释义 | 路边 |
| 英文释义 | The land adjacent to a road or path. |
| freq_rank | 17420 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | on the wayside | `daily_life` | Children often play on the wayside during their walks home from school. | 孩子们在放学回家的路上，常常在路边玩耍。 |
| 2 | wayside attractions | `travel` | Travelers frequently stop at various wayside attractions along their journeys. | 旅行者们在旅途中经常停靠各种路边景点。 |
| 3 | wayside plants | `environment` | Ecologists study the diverse wayside plants that thrive in urban environments. | 生态学家研究在城市环境中生长的多样路边植物。 |

### 90. cheers  *int.*

| | |
| --- | --- |
| 音标 | /tʃɪrz/ |
| 中文释义 | 祝酒；干杯 |
| 英文释义 | Expressions used to convey good wishes before drinking. |
| freq_rank | 14296 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | cheers to | `daily_life` | We raised our glasses and said cheers to the happy couple. | 我们举起酒杯，祝福这对新人。 |
| 2 | cheers from | `culture` | The performers received cheers from the enthusiastic audience after the show. | 表演结束后，热情的观众热烈欢呼。 |
| 3 | cheers erupted | `news` | Cheers erupted from the crowd as the team scored the winning goal. | 当球队进了制胜球，观众欢呼声响起。 |

### 91. biochemistry  *n.*

| | |
| --- | --- |
| 音标 | /ˌbaɪ.oʊ.kɛm.ɪ.stri/ |
| 中文释义 | 生物化学 |
| 英文释义 | The study of chemical processes in living organisms. |
| freq_rank | 17884 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | biochemistry research | `academic` | Numerous studies have advanced our understanding of biochemistry research over the years. | 多年的研究推动了我们对生物化学研究的理解。 |
| 2 | biochemistry majors | `education` | Many universities offer programs for students who wish to become biochemistry majors. | 许多大学提供了生物化学专业的课程供学生选择。 |
| 3 | biochemistry techniques | `science_tech` | Scientists utilize various biochemistry techniques to analyze cellular processes effectively. | 科学家利用多种生物化学技术有效分析细胞过程。 |

### 92. blue  *n./adj./v.*

| | |
| --- | --- |
| 音标 | /bluː/ |
| 中文释义 | 蓝色 |
| 英文释义 | A color between green and violet on the spectrum. |
| freq_rank | 842 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | blue sky | `daily_life` | Children love to play under the blue sky. | 孩子们喜欢在蓝天下面玩耍。 |
| 2 | blue eyes | `culture` | She has beautiful blue eyes that captivate everyone. | 她有迷人的蓝眼睛，吸引了每个人。 |
| 3 | blue light | `science_tech` | Blue light from screens can affect your sleep quality. | 屏幕发出的蓝光会影响你的睡眠质量。 |

### 93. backache  *n.*

| | |
| --- | --- |
| 音标 | /ˈbæk.eɪk/ |
| 中文释义 | 背痛 |
| 英文释义 | A persistent pain in the back, often related to strain. |
| freq_rank | 29373 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | chronic backache | `health` | Chronic backache can significantly hinder daily activities and comfort. | 慢性背痛会显著妨碍日常活动和舒适度。 |
| 2 | severe backache | `daily_life` | Many people experience severe backache after long hours of sitting at work. | 许多人在工作中坐了很久后会感到剧烈的背痛。 |
| 3 | lower backache | `academic` | Research indicates that lower backache is prevalent among office workers. | 研究表明，办公室工作人员普遍存在下背部疼痛。 |

### 94. regards  *n.*

| | |
| --- | --- |
| 音标 | /rɪˈɡɑrdz/ |
| 中文释义 | 问候；致意 |
| 英文释义 | Expressions of good wishes or respect towards someone. |
| freq_rank | 20654 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | best regards | `work` | I sent you an email this morning with my best regards. | 我今天早上给你发了封邮件，附上我的问候。 |
| 2 | regards to | `daily_life` | She sent her regards to you during our conversation yesterday. | 她在我们昨天的谈话中向你致以问候。 |
| 3 | kind regards | `academic` | Please convey my kind regards to the committee members after the meeting. | 会议结束后，请向委员会成员转达我的问候。 |

### 95. smelly  *adj.*

| | |
| --- | --- |
| 音标 | /ˈsmɛli/ |
| 中文释义 | 有臭味的 |
| 英文释义 | Having a strong unpleasant odor or scent. |
| freq_rank | 14701 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | smelly socks | `daily_life` | After working out, my smelly socks filled the room with a foul odor. | 锻炼后，我的臭袜子充满了房间的恶臭。 |
| 2 | smelly food | `health` | Some smelly food can cause nausea in sensitive individuals during meals. | 某些有臭味的食物在用餐时会让敏感的人感到恶心。 |
| 3 | smelly garbage | `environment` | Leaving smelly garbage outside attracts pests and creates unpleasant living conditions. | 把臭垃圾放在外面会吸引害虫，造成不愉快的居住环境。 |

### 96. beddings  *n./adj./v.*

| | |
| --- | --- |
| 音标 | /ˈbɛd.ɪŋz/ |
| 中文释义 | 床上用品 |
| 英文释义 | Items used to dress a bed, such as sheets and blankets. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | luxurious beddings | `daily_life` | Hotels often provide luxurious beddings to enhance guest comfort. | 酒店通常提供奢华的床上用品，以提升客人的舒适度。 |
| 2 | comfortable beddings | `health` | Children need comfortable beddings for a good night's sleep. | 孩子们需要舒适的床上用品，以保证良好的睡眠。 |
| 3 | organic beddings | `environment` | Using organic beddings can reduce exposure to harmful chemicals. | 使用有机床上用品可以减少接触有害化学物质。 |

### 97. litre  *n.*

| | |
| --- | --- |
| 音标 | /ˈliː.tər/ |
| 中文释义 | 升 |
| 英文释义 | A unit of volume equivalent to 1,000 cubic centimeters. |
| freq_rank | 5726 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | litres of water | `daily_life` | People should drink at least two litres of water daily. | 人们每天至少应该喝两升水。 |
| 2 | litres of fuel | `environment` | The car consumes seven litres of fuel per hundred kilometers. | 这辆车每行驶一百公里消耗七升燃油。 |
| 3 | litres of milk | `health` | A child needs about one litre of milk each day for health. | 一个孩子每天需要大约一升牛奶以保持健康。 |

### 98. hey  *int.*  🖊 **人工撰写**

| | |
| --- | --- |
| 音标 | /heɪ/ |
| 中文释义 | 嘿；喂 |
| 英文释义 | A casual call used to greet someone or get attention. |
| freq_rank | 1429 |
| 难度档 | A2 |

> 🖊 这条是人工写的,原因:同 oh:感叹词三句都以 Hey 开头撞 g9。手写成一句直呼、两句引述。

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | hey there | `daily_life` | Hey there, could you help me with this box? | 嘿，你能帮我搬一下这个箱子吗？ |
| 2 | hey guys | `work` | He said hey guys before starting the team meeting. | 他在团队会议开始前打了声招呼。 |
| 3 | shouted hey | `education` | Students shouted hey to their teacher across the playground. | 学生们隔着操场朝老师喊了一声。 |

### 99. bathtub  *n.*

| | |
| --- | --- |
| 音标 | /ˈbæθ.tʌb/ |
| 中文释义 | 浴缸 |
| 英文释义 | A large container for holding water for bathing. |
| freq_rank | 9766 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | filled bathtub | `daily_life` | Filled bathtubs can provide a relaxing environment for many people. | 满是水的浴缸可以为许多人提供放松的环境。 |
| 2 | bathtub faucet | `work` | Repairing a leaking bathtub faucet can save water and reduce bills. | 修理漏水的浴缸龙头可以节约用水并减少费用。 |
| 3 | bathtub toys | `culture` | Children love playing with colorful bathtub toys during bath time. | 孩子们喜欢在洗澡时玩各种颜色的浴缸玩具。 |

### 100. chairwoman  *n.*

| | |
| --- | --- |
| 音标 | /ˈtʃɛrˌwʊmən/ |
| 中文释义 | 女主席 |
| 英文释义 | A female leader of a committee or organization. |
| freq_rank | 15732 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | the chairwoman of the board | `work` | Her decision as the chairwoman of the board was final and binding. | 作为董事会女主席，她的决定是最终且具有约束力的。 |
| 2 | the chairwoman's speech | `news` | During the event, the chairwoman's speech inspired many participants to take action. | 在活动中，女主席的演讲激励了许多参与者采取行动。 |
| 3 | the chairwoman of a committee | `academic` | In her role as chairwoman of a committee, she focused on improving academic standards. | 作为一个委员会的女主席，她专注于提升学术标准。 |
