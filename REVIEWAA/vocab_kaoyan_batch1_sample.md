# 托福词汇内容 batch1 · 送审样本

> 抽 16 词(种子固定 20260803,复跑抽到同样这批)。
> **不是纯随机** —— 贪心挑成尽量铺开 scene 与词性,免得 16 个全是名词、场景全挤在 news。
> 本批覆盖 **10/10 个 scene**、**5 种词性**(n. / adj. / 词性缺失 / int. / v.)。
> (`词性缺失` = ECDICT 的 translation 里没有词性前缀,全库 53 个词属于这种,`pos` 为空。)
> 全量 95 词见 `scripts/vocab/data/generated/kaoyan-content.json`。

## 全量 95 词的分布(不只是抽样这 16 个)

难度档:A2 1 · B1 4 · B2 48 · C1 42

场景(共 285 条例句):academic 32 · news 28 · daily_life 57 · work 46 · science_tech 21 · health 19 · environment 7 · education 30 · travel 4 · culture 41

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

### 1. meditation  *n.*

| | |
| --- | --- |
| 音标 | /ˌmɛdɪˈteɪʃən/ |
| 中文释义 | 冥想 |
| 英文释义 | A practice of focused thought for relaxation or spiritual growth. |
| freq_rank | 6196 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | mindfulness meditation | `health` | Practicing mindfulness meditation can greatly reduce stress levels over time. | 练习正念冥想可以大大降低长期的压力水平。 |
| 2 | guided meditation | `daily_life` | Many people find guided meditation helpful for achieving better focus during their day. | 许多人发现引导冥想有助于在日常生活中更好地集中注意力。 |
| 3 | transcendental meditation | `education` | Transcendental meditation has been studied in various educational settings for its benefits. | 超越冥想在不同的教育环境中因其益处而被研究。 |

### 2. temperamental  *adj.*

| | |
| --- | --- |
| 音标 | /ˌtɛmpəˈrɛmən(t)əl/ |
| 中文释义 | 喜怒无常的 |
| 英文释义 | Prone to sudden changes in mood or behavior. |
| freq_rank | 18395 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | temperamental nature | `work` | Her temperamental nature often led to conflicts with colleagues. | 她喜怒无常的性格常常导致与同事发生冲突。 |
| 2 | temperamental artist | `culture` | Many consider him a temperamental artist who demands perfection in every piece. | 许多人认为他是一个对每件作品都要求完美的喜怒无常的艺术家。 |
| 3 | temperamental equipment | `science_tech` | This lab's temperamental equipment frequently disrupts our experiments and research. | 这个实验室的喜怒无常的设备常常会打乱我们的实验和研究。 |

### 3. cyberspace  

| | |
| --- | --- |
| 音标 | /ˈsaɪbərˌspeɪs/ |
| 中文释义 | 网络空间 |
| 英文释义 | A virtual environment where electronic communication occurs. |
| freq_rank | 11760 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | cyberspace security | `work` | Companies are investing heavily in improving cyberspace security to protect sensitive data. | 公司正在大力投资以提升网络空间安全，保护敏感数据。 |
| 2 | cyberspace activity | `academic` | Research on cyberspace activity highlights its influence on social interactions. | 关于网络空间活动的研究强调了其对社交互动的影响。 |
| 3 | cyberspace law | `news` | New legislation is needed to address issues related to cyberspace law. | 需要新的立法来解决与网络空间法律相关的问题。 |

### 4. goodby  *int.*

| | |
| --- | --- |
| 音标 | /ɡʊdˈbaɪ/ |
| 中文释义 | 再见 |
| 英文释义 | A phrase used to express farewell. |
| freq_rank | 37659 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | saying goodby | `daily_life` | Friends often find it hard when saying goodby to each other after a long visit. | 朋友们在长时间探访后，常常发现彼此告别很困难。 |
| 2 | goodby for now | `work` | We will be parting ways, but it's just a goodby for now, not forever. | 我们将各奔东西，但这只是暂时的告别，并不是永别。 |
| 3 | goodby to someone | `travel` | As travelers board the train, they wave to loved ones, saying goodby to someone special. | 当旅行者们登上火车时，他们向亲人挥手，向特别的人告别。 |

### 5. inhale  *v.*

| | |
| --- | --- |
| 音标 | /ɪnˈheɪl/ |
| 中文释义 | 吸入 |
| 英文释义 | To breathe in air or other substances. |
| freq_rank | 6746 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | inhale deeply | `health` | Many people find it relaxing to inhale deeply during meditation. | 许多人发现，在冥想时深吸一口气令人放松。 |
| 2 | inhale smoke | `daily_life` | Some individuals choose to inhale smoke from various sources, risking their health. | 有些人选择吸入各种来源的烟雾，危及健康。 |
| 3 | inhale toxins | `environment` | Animals in polluted areas often inhale toxins from the atmosphere. | 生活在污染地区的动物常常吸入来自大气的毒素。 |

### 6. prosecutor  *n.*

| | |
| --- | --- |
| 音标 | /ˈprɒs.ɪ.kjuː.tər/ |
| 中文释义 | 检察官 |
| 英文释义 | A legal official who conducts criminal prosecutions on behalf of the government. |
| freq_rank | 2124 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | district prosecutors | `news` | District prosecutors have filed several charges against the suspect. | 地区检察官已对该嫌疑人提出多项指控。 |
| 2 | assistant prosecutor | `work` | An assistant prosecutor helped with the case preparations last week. | 一名助理检察官上周协助进行了案件准备工作。 |
| 3 | senior prosecutors | `academic` | Senior prosecutors often provide guidance for younger attorneys in court. | 高级检察官通常为年轻律师在法庭上提供指导。 |

### 7. laptop  

| | |
| --- | --- |
| 音标 | /ˈlæp.tɑːp/ |
| 中文释义 | 笔记本电脑 |
| 英文释义 | A portable personal computer with a clamshell form factor. |
| freq_rank | 5866 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | use a laptop | `work` | Many professionals use a laptop for remote work tasks. | 许多专业人士使用笔记本电脑进行远程工作。 |
| 2 | laptop screen | `education` | Students often take notes directly on their laptop screens during lectures. | 学生们经常在讲座中直接在笔记本电脑屏幕上记笔记。 |
| 3 | laptop charger | `daily_life` | Make sure to pack your laptop charger before traveling. | 旅行前一定要记得带上你的笔记本电脑充电器。 |

### 8. rigour  *n.*

| | |
| --- | --- |
| 音标 | /ˈrɪɡ.ər/ |
| 中文释义 | 严谨 |
| 英文释义 | Strictness or exactness in standards and procedures, often in academic contexts. |
| freq_rank | 9776 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | academic rigour | `education` | Students must demonstrate academic rigour in their research projects. | 学生们必须在他们的研究项目中展示学术严谨。 |
| 2 | rigour of research | `science_tech` | The rigour of research is crucial for reliable scientific findings. | 研究的严谨性对可靠的科学发现至关重要。 |
| 3 | intellectual rigour | `culture` | Intellectual rigour fosters critical thinking and deeper understanding. | 智力的严谨促进批判性思维和更深层次的理解。 |

### 9. affiliation  *n.*

| | |
| --- | --- |
| 音标 | /əˌfɪl.iˈeɪ.ʃən/ |
| 中文释义 | 隶属关系；联合 |
| 英文释义 | A connection or association with a group or organization. |
| freq_rank | 6180 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | academic affiliation | `academic` | Many researchers are proud of their academic affiliations with prestigious institutions. | 许多研究人员为自己与知名机构的学术隶属关系感到自豪。 |
| 2 | political affiliation | `news` | Voters often reveal their political affiliations during elections and surveys. | 选民在选举和调查中常常透露他们的政治隶属关系。 |
| 3 | business affiliation | `work` | Her business affiliations help her network with industry leaders effectively. | 她的商业隶属关系使她能够有效地与行业领袖建立联系。 |

### 10. futility  *n.*

| | |
| --- | --- |
| 音标 | /fjuːˈtɪl.ɪ.ti/ |
| 中文释义 | 无效；徒劳 |
| 英文释义 | The quality of having no useful result or purpose. |
| freq_rank | 13526 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | futility of war | `news` | Many analysts highlight the futility of war in achieving lasting peace. | 许多分析人士强调战争在实现持久和平方面的徒劳。 |
| 2 | futility of effort | `work` | He realized the futility of effort when faced with such overwhelming odds. | 面对如此压倒性的困难时，他意识到努力的徒劳。 |
| 3 | futility of hope | `daily_life` | She struggled with the futility of hope after repeated disappointments. | 经历了多次失望后，她对希望的徒劳感到苦恼。 |

### 11. fishery  *n.*

| | |
| --- | --- |
| 音标 | /ˈfɪʃ.ər.i/ |
| 中文释义 | 渔场 |
| 英文释义 | A place where fish are cultivated or caught. |
| freq_rank | 5973 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | sustainable fishery | `environment` | Sustainable fisheries are essential for maintaining ocean biodiversity. | 可持续渔场对维持海洋生物多样性至关重要。 |
| 2 | commercial fishery | `work` | The commercial fishery industry faces many regulatory challenges this year. | 今年商业渔业面临许多监管挑战。 |
| 3 | fishery management | `academic` | Effective fishery management ensures the longevity of aquatic resources. | 有效的渔业管理确保水生资源的持久性。 |

### 12. highland  *n.*

| | |
| --- | --- |
| 音标 | /ˈhaɪ.lænd/ |
| 中文释义 | 高地 |
| 英文释义 | A mountainous area or elevated region. |
| freq_rank | 10211 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | highland regions | `environment` | Highland regions often host diverse ecosystems and unique wildlife. | 高地地区通常拥有多样的生态系统和独特的野生动物。 |
| 2 | highland culture | `culture` | Exploring highland culture reveals rich traditions and vibrant local customs. | 探索高地文化揭示了丰富的传统和生动的地方习俗。 |
| 3 | highland terrain | `travel` | Navigating highland terrain can be challenging due to its rugged features. | 由于高地地形崎岖，导航时可能会很困难。 |

### 13. narrate  *v.*

| | |
| --- | --- |
| 音标 | /ˈnær.eɪt/ |
| 中文释义 | 叙述 |
| 英文释义 | To tell a story or describe events in detail. |
| freq_rank | 10439 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | narrate a story | `culture` | Children often enjoy hearing adults narrate a story during bedtime. | 孩子们通常喜欢在睡觉前听大人讲故事。 |
| 2 | narrate the findings | `academic` | Researchers were required to narrate the findings of their study clearly and concisely. | 研究人员需要清晰简明地叙述他们研究的发现。 |
| 3 | narrate the events | `news` | The journalist will narrate the events of the day in the evening news broadcast. | 记者将在晚间新闻播报中叙述当天的事件。 |

### 14. witch  *n./v.*

| | |
| --- | --- |
| 音标 | /wɪtʃ/ |
| 中文释义 | 女巫；巫师 |
| 英文释义 | A person believed to have magical powers, especially evil ones. |
| freq_rank | 5294 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | witch hunt | `news` | Authorities are often accused of conducting a witch hunt against dissenters. | 当局常常被指控进行针对异议人士的猎巫行动。 |
| 2 | black witch | `culture` | In folklore, a black witch is often associated with dark magic and malevolence. | 在民间传说中，黑女巫通常与黑暗魔法和恶意相关联。 |
| 3 | witch trial | `education` | Historically, witch trials were infamous for their unjust proceedings and persecution. | 在历史上，猎巫审判因其不公的程序和迫害而臭名昭著。 |

### 15. machinery  *n.*

| | |
| --- | --- |
| 音标 | /məˈʃin.ər.i/ |
| 中文释义 | 机械；机器 |
| 英文释义 | The components of a machine or the system of machines. |
| freq_rank | 5774 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | heavy machinery | `work` | Construction sites often use heavy machinery to complete tasks quickly. | 建筑工地通常使用重型机械快速完成任务。 |
| 2 | machinery industry | `news` | The machinery industry has seen significant growth this year due to demand. | 由于需求，今年机械行业经历了显著增长。 |
| 3 | manufacturing machinery | `science_tech` | Advancements in technology improve manufacturing machinery efficiency and precision. | 技术的进步提高了制造机械的效率和精度。 |

### 16. insightful  *adj.*

| | |
| --- | --- |
| 音标 | /ˈɪn.saɪt.fəl/ |
| 中文释义 | 洞察力强的 |
| 英文释义 | Having or showing a deep understanding of something. |
| freq_rank | 12671 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | insightful analysis | `academic` | Researchers conducted an insightful analysis of the current trends in education. | 研究人员对当前教育趋势进行了洞察力强的分析。 |
| 2 | insightful comments | `news` | The expert provided insightful comments during the live broadcast of the event. | 专家在活动的现场直播中提供了洞察力强的评论。 |
| 3 | insightful perspective | `culture` | Her insightful perspective on art challenges conventional interpretations of beauty. | 她对艺术的洞察力强的看法挑战了对美的传统解读。 |
