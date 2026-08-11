# 托福词汇内容 batch1 · 送审样本

> 抽 16 词(种子固定 20260803,复跑抽到同样这批)。
> **不是纯随机** —— 贪心挑成尽量铺开 scene 与词性,免得 16 个全是名词、场景全挤在 news。
> 本批覆盖 **10/10 个 scene**、**8 种词性**(n. / v. / 词性缺失 / adj. / int. / adv. / num. / prep.)。
> (`词性缺失` = ECDICT 的 translation 里没有词性前缀,全库 53 个词属于这种,`pos` 为空。)
> 全量 378 词见 `scripts/vocab/data/generated/gaokao-content.json`。

## 全量 378 词的分布(不只是抽样这 16 个)

难度档:A2 18 · B1 52 · B2 149 · C1 159

场景(共 1134 条例句):academic 57 · news 84 · daily_life 279 · work 189 · science_tech 95 · health 47 · environment 41 · education 132 · travel 44 · culture 166

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

### 3. founding  

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

### 5. oh  *int.*

| | |
| --- | --- |
| 音标 | /oʊ/ |
| 中文释义 | 哦；啊 |
| 英文释义 | A sound people make to show surprise or sudden understanding. |
| freq_rank | 411 |
| 难度档 | A2 |

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
