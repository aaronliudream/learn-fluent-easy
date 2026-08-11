# kaoyan 词库内容 · 送审件(抽 95 词)

> 抽样种子固定 20260803,复跑抽到同一批。**不是纯随机** —— 贪心挑成尽量铺开场景与词性,
> 免得 100 个里大半是名词、场景全挤在 news。
> 本批覆盖 **10/10 个场景**、**5 种词性**。
> 全量内容见 `scripts/vocab/data/generated/kaoyan-content.json`。

## 全量 95 词的实测分布

| 项 | 实测 |
| --- | --- |
| 词条 | 95 |
| 例句 | 285(平均每词 3.00 条) |
| 难度档 | A2 1 · B1 4 · B2 48 · C1 42 |
| ECDICT 未标词性 | 2 词 |
| 跨词性(pos 含 `/`) | 19 词(20.0%) |
| 一次过闸 | 85 词 · 重试后才过 10 词 |
| 人工撰写 | 0 词 |

场景分布(共 285 条例句):academic 32 · news 28 · daily_life 57 · work 46 · science_tech 21 · health 19 · environment 7 · education 30 · travel 4 · culture 41

## 请重点看这四点

1. **中文释义准不准** —— 有没有把次要义当主义、有没有并列近义词充数。
2. **搭配是不是真高频**,顺序是不是真按频率(句 1 应当是最常见的说法)。
3. **例句像不像人写的** —— 三句之间是不是真换了写法,不是同一个模子换词。
4. **难度档合不合适** —— 高频词配短句、低频学术词配长句。

## ⚠️ 我自己知道的薄弱点(不用你去找)

- **跨词性词的义项**:本批有 19 个跨词性词。提示词里加了"跨词性几乎必然对应词典
  分列义项"的自查,实测 state → 状态；国家 ✓、part → 部分；分开 ✓,但 **might(n./aux.)
  仍然给「可能；或许」** —— 近义堆砌且漏了名词义"力量"。没继续迭代提示词(边际收益递减),
  这类**只能靠人审兜**,请留意跨词性词的第二个义项。
- **个别搭配不是真搭配**:如 system 的 "local system"、part 的
  "Understanding is part of the problem we face"(语义空转)。机器闸门只能判"搭配里含不含
  目标词",判不了"这个搭配母语者到底说不说"。


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

### 3. cyberspace  *(ECDICT 没标词性)*

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

### 7. laptop  *(ECDICT 没标词性)*

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

### 17. syndrome  *n.*

| | |
| --- | --- |
| 音标 | /ˈsɪn.droʊm/ |
| 中文释义 | 综合症 |
| 英文释义 | A set of medical signs or symptoms grouped together. |
| freq_rank | 4281 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | autism spectrum syndrome | `health` | Many children with autism spectrum syndrome require special educational support. | 许多自闭症谱系综合症的儿童需要特殊的教育支持。 |
| 2 | down syndrome | `science_tech` | Research continues to improve the lives of individuals with down syndrome. | 研究持续改善唐氏综合症患者的生活。 |
| 3 | chronic fatigue syndrome | `academic` | Chronic fatigue syndrome poses significant challenges for both patients and healthcare providers. | 慢性疲劳综合症给患者和医疗提供者带来了重大挑战。 |

### 18. paradigm  *n.*

| | |
| --- | --- |
| 音标 | /ˈpær.ə.daɪm/ |
| 中文释义 | 范式 |
| 英文释义 | A typical example or pattern of something. |
| freq_rank | 5201 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | the dominant paradigm | `academic` | Many researchers challenge the dominant paradigm in their fields. | 许多研究人员质疑他们领域内的主流范式。 |
| 2 | shift in paradigm | `science_tech` | A shift in paradigm could revolutionize our approach to energy. | 范式的转变可能会彻底改变我们对能源的看法。 |
| 3 | paradigm of excellence | `work` | Our company aims to be a paradigm of excellence in customer service. | 我们公司致力于成为客户服务的范式。 |

### 19. muted  *adj.*

| | |
| --- | --- |
| 音标 | /ˈmjuː.tɪd/ |
| 中文释义 | 消音的；减弱的 |
| 英文释义 | Having a softened or quieted sound or tone. |
| freq_rank | 9361 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | muted colors | `culture` | Artworks often feature muted colors to create a calming effect. | 艺术作品常常运用消音颜色以营造宁静的效果。 |
| 2 | muted response | `news` | The community had a muted response to the proposed changes in policy. | 社区对拟议的政策变更反应冷淡。 |
| 3 | muted conversation | `daily_life` | During the meeting, a muted conversation filled the room with tension. | 会议期间，消音的对话在房间里弥漫着紧张气氛。 |

### 20. peanut  *n./adj.*

| | |
| --- | --- |
| 音标 | /ˈpiː.nʌt/ |
| 中文释义 | 花生 |
| 英文释义 | A small, edible seed often used in snacks and cooking. |
| freq_rank | 4627 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | peanut butter | `daily_life` | Many people enjoy spreading peanut butter on their toast for breakfast. | 许多人喜欢在吐司上涂抹花生酱作为早餐。 |
| 2 | peanut allergy | `health` | A peanut allergy can cause severe reactions in some individuals. | 花生过敏会导致一些人出现严重反应。 |
| 3 | peanut crop | `culture` | Farmers are increasingly focused on the peanut crop due to its high demand. | 农民们越来越关注花生作物，因为其需求量很大。 |

### 21. reasoning  *n.*

| | |
| --- | --- |
| 音标 | /ˈriː.zən.ɪŋ/ |
| 中文释义 | 推理；推断 |
| 英文释义 | The process of thinking logically about something. |
| freq_rank | 5805 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | logical reasoning | `academic` | Students must develop logical reasoning to solve complex problems. | 学生必须培养逻辑推理能力以解决复杂问题。 |
| 2 | critical reasoning | `education` | Teachers encourage students to enhance their critical reasoning skills in discussions. | 教师鼓励学生在讨论中提高他们的批判性推理能力。 |
| 3 | reasoning skills | `work` | Effective teamwork requires strong reasoning skills to address challenges. | 有效的团队合作需要强大的推理能力来应对挑战。 |

### 22. anemia  *n.*

| | |
| --- | --- |
| 音标 | /əˈniː.mi.ə/ |
| 中文释义 | 贫血 |
| 英文释义 | A condition marked by a deficiency of red blood cells. |
| freq_rank | 14240 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | iron deficiency anemia | `health` | Many people suffer from iron deficiency anemia, particularly women during pregnancy. | 许多人患有缺铁性贫血，尤其是怀孕期间的女性。 |
| 2 | anemia symptoms | `daily_life` | Experiencing fatigue and weakness are common anemia symptoms that should not be ignored. | 感到疲劳和虚弱是常见的贫血症状，不应被忽视。 |
| 3 | sickle cell anemia | `science_tech` | Sickle cell anemia is a genetic condition affecting the shape of red blood cells. | 镰状细胞贫血是一种影响红血球形状的遗传病。 |

### 23. intrusive  *adj.*

| | |
| --- | --- |
| 音标 | /ɪnˈtruː.sɪv/ |
| 中文释义 | 侵入的；干扰的 |
| 英文释义 | Causing disruption or annoyance through being unwelcome or uninvited. |
| freq_rank | 10964 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | intrusive thoughts | `daily_life` | People often struggle to manage intrusive thoughts during stressful situations. | 人们常常在压力大的情况下努力应对侵入性思维。 |
| 2 | intrusive advertising | `culture` | Many consider intrusive advertising on social media to be a major annoyance. | 许多人认为社交媒体上的侵入性广告是一种主要的干扰。 |
| 3 | intrusive species | `environment` | Scientists are concerned about the impact of intrusive species on native ecosystems. | 科学家们对侵入性物种对本土生态系统的影响表示担忧。 |

### 24. copyright  *n.*

| | |
| --- | --- |
| 音标 | /ˈkɑː.pi.raɪt/ |
| 中文释义 | 版权 |
| 英文释义 | Legal right to control reproduction and distribution of creative works. |
| freq_rank | 6066 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | copyright law | `work` | Copyright law protects the rights of creators and their works. | 版权法保护创作者及其作品的权利。 |
| 2 | copyright infringement | `culture` | Artists often face copyright infringement issues in the digital age. | 艺术家在数字时代常常面临版权侵权问题。 |
| 3 | copyright holder | `academic` | A copyright holder can license their work to others for use. | 版权持有人可以将其作品授权给他人使用。 |

### 25. repression  *n.*

| | |
| --- | --- |
| 音标 | /rɪˈprɛʃ.ən/ |
| 中文释义 | 压制 |
| 英文释义 | The act of holding back or suppressing something. |
| freq_rank | 7683 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | political repression | `news` | Governments often resort to political repression to maintain control. | 政府通常诉诸于政治压制以维持控制。 |
| 2 | emotional repression | `daily_life` | Many individuals struggle with emotional repression and its effects. | 许多人在情感压制及其影响上挣扎。 |
| 3 | social repression | `academic` | Social repression can lead to widespread discontent in communities. | 社会压制可能导致社区内广泛的不满。 |

### 26. stereotyped  *adj.*

| | |
| --- | --- |
| 音标 | /ˈstɛr.i.oʊ.taɪpt/ |
| 中文释义 | 刻板的；老套的 |
| 英文释义 | Having a fixed, oversimplified, and generalized idea or image. |
| freq_rank | 17812 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | stereotyped thinking | `education` | Many students struggle with stereotyped thinking during complex problem solving. | 许多学生在复杂的问题解决中，难以摆脱刻板思维。 |
| 2 | stereotyped roles | `culture` | Society often assigns stereotyped roles based on gender or ethnicity. | 社会常常基于性别或种族分配刻板角色。 |
| 3 | stereotyped image | `daily_life` | People frequently encounter a stereotyped image of beauty in advertisements. | 人们在广告中经常会遇到对美的刻板印象。 |

### 27. apologise  *v.*

| | |
| --- | --- |
| 音标 | /əˈpɒlədʒaɪz/ |
| 中文释义 | 道歉 |
| 英文释义 | Express regret for an action or statement made. |
| freq_rank | 5315 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | apologise for a mistake | `work` | Our team must apologise for the mistake made in the report. | 我们的团队必须为报告中犯下的错误道歉。 |
| 2 | apologise sincerely | `daily_life` | She decided to apologise sincerely for her earlier remarks. | 她决定真诚地为之前的言论道歉。 |
| 3 | apologise to someone | `education` | Teachers often have to apologise to students for misunderstandings. | 老师们经常不得不为误解向学生道歉。 |

### 28. noteworthy  *adj.*

| | |
| --- | --- |
| 音标 | /ˈnoʊtˌwɜr.ði/ |
| 中文释义 | 值得注意的；显著的 |
| 英文释义 | Deserving attention or notice; remarkable in some way. |
| freq_rank | 9460 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | noteworthy contributions | `academic` | Researchers made noteworthy contributions to the field of renewable energy. | 研究人员在可再生能源领域做出了值得注意的贡献。 |
| 2 | noteworthy achievements | `work` | The company celebrated its noteworthy achievements in the last fiscal year. | 公司庆祝了去年财政年度的显著成就。 |
| 3 | noteworthy developments | `news` | Recent noteworthy developments in technology have impacted daily life significantly. | 最近技术领域的显著发展对日常生活产生了重大影响。 |

### 29. hypocrisy  *n.*

| | |
| --- | --- |
| 音标 | /hɪˈpɒk.rɪ.si/ |
| 中文释义 | 虚伪 |
| 英文释义 | The practice of claiming to have moral standards that one does not actually possess. |
| freq_rank | 9213 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | double standards and hypocrisy | `news` | Many politicians display double standards and hypocrisy in their actions. | 许多政治家在其行为中表现出双重标准与虚伪。 |
| 2 | moral hypocrisy | `academic` | Researchers examined the impact of moral hypocrisy on social behaviors. | 研究者考察了道德虚伪对社会行为的影响。 |
| 3 | hypocrisy in society | `daily_life` | People often criticize hypocrisy in society during discussions. | 人们在讨论中常常批评社会中的虚伪。 |

### 30. labor  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈleɪ.bɚ/ |
| 中文释义 | 劳动；工作 |
| 英文释义 | Physical or mental effort to achieve a result. |
| freq_rank | 1123 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | heavy labor | `work` | Workers often perform heavy labor for long hours. | 工人们经常进行长时间的重体力劳动。 |
| 2 | manual labor | `daily_life` | Many people still rely on manual labor for their livelihoods. | 许多人仍然依靠体力劳动来谋生。 |
| 3 | labor market | `news` | The labor market is changing rapidly due to technology. | 由于技术的原因，劳动力市场正在迅速变化。 |

### 31. abdomen  *n.*

| | |
| --- | --- |
| 音标 | /ˈæb.də.mən/ |
| 中文释义 | 腹部 |
| 英文释义 | The part of the body containing digestive organs. |
| freq_rank | 9711 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | pain in the abdomen | `health` | Many patients report experiencing pain in the abdomen after eating. | 许多患者在进食后报告感到腹部疼痛。 |
| 2 | abdomen muscles | `daily_life` | Regular exercise can help strengthen the abdomen muscles effectively. | 规律的锻炼可以有效增强腹部肌肉。 |
| 3 | abdomen surgery | `science_tech` | The latest advancements have improved the techniques for abdomen surgery. | 最新的进展改善了腹部手术的技术。 |

### 32. pickup  *n.*

| | |
| --- | --- |
| 音标 | /ˈpɪk.ʌp/ |
| 中文释义 | 拾起；接送 |
| 英文释义 | An act of lifting or collecting something, or a vehicle for transportation. |
| freq_rank | 3802 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | pickup truck | `daily_life` | He bought a new pickup truck for his weekend trips. | 他买了一辆新货车用于周末旅行。 |
| 2 | pickup line | `culture` | She rolled her eyes at his cheesy pickup line during the party. | 她在派对上对他那老套的搭讪话感到无奈。 |
| 3 | pickup game | `work` | They often play a pickup game of basketball after work. | 他们经常在下班后玩一场便装篮球赛。 |

### 33. jargon  *n.*

| | |
| --- | --- |
| 音标 | /ˈdʒɑːr.ɡən/ |
| 中文释义 | 行话；术语 |
| 英文释义 | Specialized language used by a particular group or profession. |
| freq_rank | 12425 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | technical jargon | `work` | Many employees found the technical jargon difficult to understand in meetings. | 许多员工发现会议中的技术行话难以理解。 |
| 2 | medical jargon | `health` | Patients often feel confused by the medical jargon used by their doctors. | 患者常常对医生使用的医疗行话感到困惑。 |
| 3 | academic jargon | `education` | Scholars should avoid using academic jargon when writing for a general audience. | 学者在为大众写作时应避免使用学术行话。 |

### 34. rut  *n./v.*

| | |
| --- | --- |
| 音标 | /rʌt/ |
| 中文释义 | 车辙；习惯 |
| 英文释义 | A fixed or established mode of conduct or behavior. |
| freq_rank | 11310 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | get stuck in a rut | `daily_life` | Many people feel they have gotten stuck in a rut in their careers. | 许多人觉得自己在职业生涯中陷入了车辙。 |
| 2 | fall into a rut | `work` | Employees may fall into a rut if their tasks become monotonous and repetitive. | 如果员工的任务变得单调和重复，他们可能会陷入车辙。 |
| 3 | break out of a rut | `education` | Students must learn to break out of a rut to achieve their full potential. | 学生必须学会打破车辙，以实现他们的全部潜能。 |

### 35. heroin  *n.*

| | |
| --- | --- |
| 音标 | /ˈhɛr.oʊ.ɪn/ |
| 中文释义 | 海洛因 |
| 英文释义 | A powerful and addictive narcotic derived from morphine. |
| freq_rank | 5859 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | heroin addiction | `health` | Many individuals struggle with heroin addiction and need support to recover. | 许多人在与海洛因成瘾斗争，亟需支持以恢复。 |
| 2 | heroin use | `news` | Authorities reported a rise in heroin use among young adults this year. | 当局报告称，今年年轻人中海洛因使用增加。 |
| 3 | heroin overdose | `daily_life` | She survived a heroin overdose and is now in rehabilitation. | 她经历了海洛因过量，现已在康复中。 |

### 36. appal  *v.*

| | |
| --- | --- |
| 音标 | /əˈpæl/ |
| 中文释义 | 使震惊；使惊骇 |
| 英文释义 | To shock or horrify someone greatly. |
| freq_rank | 11526 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | appalled by the decision | `news` | Many citizens were appalled by the government's decision to raise taxes. | 许多公民对政府提高税收的决定感到震惊。 |
| 2 | appalled at the violence | `culture` | People are often appalled at the violence depicted in modern films. | 人们常常对现代电影中描绘的暴力感到震惊。 |
| 3 | appalling behavior | `education` | Teachers were appalled by the appalling behavior of some students during the exam. | 老师们对一些学生在考试期间的令人震惊的行为感到震惊。 |

### 37. overpass  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈoʊ.vɚ.pæs/ |
| 中文释义 | 天桥；立交桥 |
| 英文释义 | A structure allowing passage over an obstacle such as a road. |
| freq_rank | 20685 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | road overpass | `daily_life` | Drivers often encounter a road overpass while navigating the city. | 司机在城市行驶时，常常会遇到天桥。 |
| 2 | overpass bridge | `travel` | Travelers appreciated the scenic views from the overpass bridge overlooking the valley. | 游客们欣赏到俯瞰山谷的天桥上美丽的景色。 |
| 3 | pedestrian overpass | `environment` | A pedestrian overpass was constructed to improve safety for crossing busy streets. | 为提高繁忙街道的过马路安全，建造了一座人行天桥。 |

### 38. transcendent  *adj./n.*

| | |
| --- | --- |
| 音标 | /trænˈsɛndənt/ |
| 中文释义 | 超越的；卓越的 |
| 英文释义 | Going beyond ordinary limits; surpassing; extraordinary. |
| freq_rank | 11634 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | transcendent experience | `culture` | Many describe their first concert as a transcendent experience that changed their lives. | 许多人形容他们的第一次音乐会是一次超越的经历，改变了他们的生活。 |
| 2 | transcendent value | `education` | The transcendent value of education often influences social mobility and personal growth. | 教育的超越价值常常影响社会流动和个人成长。 |
| 3 | transcendent beauty | `daily_life` | Witnessing a sunset can evoke feelings of transcendent beauty and peace. | 目睹日落常常会唤起超越的美和宁静的感觉。 |

### 39. acrobat  *n.*

| | |
| --- | --- |
| 音标 | /ˈæk.rə.bæt/ |
| 中文释义 | 杂技演员 |
| 英文释义 | A performer skilled in physical feats and acrobatics. |
| freq_rank | 19213 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | acrobats perform | `culture` | Children often enjoy watching acrobats perform daring stunts at festivals. | 孩子们常常喜欢在节日上观看杂技演员表演大胆的特技。 |
| 2 | acrobatic skills | `daily_life` | Many gymnasts train to enhance their acrobatic skills for competitions. | 许多体操运动员训练以提升他们在比赛中的杂技技能。 |
| 3 | acrobats in the circus | `work` | The acrobats in the circus wowed the audience with their incredible acts. | 马戏团的杂技演员以他们惊人的表演吸引了观众。 |

### 40. paternal  *adj.*

| | |
| --- | --- |
| 音标 | /pəˈtɜrnəl/ |
| 中文释义 | 父亲的；父系的 |
| 英文释义 | Relating to a father or fatherhood, especially in a biological sense. |
| freq_rank | 12688 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | paternal rights | `culture` | Many cultures prioritize paternal rights in child custody cases. | 在儿童监护权案件中，许多文化优先考虑父亲的权利。 |
| 2 | paternal influence | `education` | His paternal influence shaped my career choices significantly throughout my life. | 他对我的影响在我一生中显著影响了我的职业选择。 |
| 3 | paternal instincts | `daily_life` | New fathers often experience strong paternal instincts towards their newborns. | 新父亲常常对他们的新生儿产生强烈的父亲本能。 |

### 41. paradoxical  *adj.*

| | |
| --- | --- |
| 音标 | /ˌpær.əˈdɒk.sɪ.kəl/ |
| 中文释义 | 自相矛盾的 |
| 英文释义 | Seemingly contradictory or absurd but possibly true. |
| freq_rank | 12379 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | paradoxical outcomes | `science_tech` | Researchers observed paradoxical outcomes in their latest experimental study. | 研究人员在最新的实验研究中观察到自相矛盾的结果。 |
| 2 | paradoxical nature | `environment` | The paradoxical nature of climate change often confuses policymakers and citizens alike. | 气候变化的自相矛盾特性常常让政策制定者和公民感到困惑。 |
| 3 | paradoxical situation | `daily_life` | Living in a paradoxical situation can lead to unexpected personal growth. | 处于自相矛盾的境地可能会导致意想不到的个人成长。 |

### 42. virtuosity  *n.*

| | |
| --- | --- |
| 音标 | /ˌvɜr.tʃuˈɔs.ɪ.ti/ |
| 中文释义 | 高超的技艺 |
| 英文释义 | Great skill in a particular art or field, especially music. |
| freq_rank | 20404 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | musical virtuosity | `culture` | Many pianists are celebrated for their extraordinary musical virtuosity. | 许多钢琴家因其非凡的音乐技艺而受到赞誉。 |
| 2 | artistic virtuosity | `education` | Students often study the works of artists renowned for their artistic virtuosity. | 学生们常常研究那些因其艺术技艺而闻名的艺术家的作品。 |
| 3 | technical virtuosity | `work` | The engineer's technical virtuosity impressed everyone during the project presentation. | 工程师在项目演示中的技术高超技艺给所有人留下了深刻的印象。 |

### 43. passerby  *n.*

| | |
| --- | --- |
| 音标 | /ˈpæs.ər.baɪ/ |
| 中文释义 | 路过的人；过路人 |
| 英文释义 | A person who happens to be near a place. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | passerby on the street | `daily_life` | A passerby noticed the unusual art installation and stopped to admire it. | 一位路过的人注意到了这件不寻常的艺术装置，停下来欣赏它。 |
| 2 | passerby interaction | `culture` | Many passerby interactions can lead to unexpected friendships in urban environments. | 许多路过的人的互动可以在城市环境中导致意想不到的友谊。 |
| 3 | passerby safety | `news` | Authorities are concerned about passerby safety around the construction site. | 当局对施工现场附近路过者的安全表示担忧。 |

### 44. compelling  *adj.*

| | |
| --- | --- |
| 音标 | /kəmˈpɛl.ɪŋ/ |
| 中文释义 | 引人注目的；令人信服的 |
| 英文释义 | Evoking interest, attention, or admiration in a powerful way. |
| freq_rank | 4879 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | compelling evidence | `academic` | The researchers presented compelling evidence to support their theory. | 研究人员提出了引人注目的证据来支持他们的理论。 |
| 2 | compelling argument | `culture` | She made a compelling argument for the importance of art in education. | 她提出了引人注目的论点，强调艺术在教育中的重要性。 |
| 3 | compelling story | `daily_life` | Everyone found the author's compelling story hard to put down. | 每个人都觉得作者引人注目的故事令人难以放下。 |

### 45. thriftless  *adj.*

| | |
| --- | --- |
| 音标 | /ˈθrɪft.ləs/ |
| 中文释义 | 挥霍的；不节俭的 |
| 英文释义 | Lacking thrift or careful management of resources. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | thriftless spending | `daily_life` | It is often said that thriftless spending leads to financial ruin. | 人们常说，挥霍的消费会导致财务破产。 |
| 2 | thriftless habits | `work` | Employees with thriftless habits can negatively impact the company's budget. | 养成挥霍习惯的员工可能会对公司的预算产生负面影响。 |
| 3 | thriftless behavior | `culture` | Thriftless behavior is often criticized in literature as a moral failing. | 在文学作品中，挥霍的行为常常被批评为道德缺失。 |

### 46. gut  *n./v.*

| | |
| --- | --- |
| 音标 | /ɡʌt/ |
| 中文释义 | 肠；勇气 |
| 英文释义 | The digestive tract or intestinal canal; also, courage or bravery. |
| freq_rank | 4297 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | gut feeling | `daily_life` | Many people trust their gut feelings when making important decisions. | 许多人在做出重要决定时相信自己的直觉。 |
| 2 | gut instinct | `work` | She relied on her gut instinct to lead the team during the project. | 在项目期间，她依靠自己的直觉来领导团队。 |
| 3 | gut health | `health` | Maintaining good gut health is essential for overall well-being. | 保持良好的肠道健康对整体健康至关重要。 |

### 47. infrared  *adj./n.*

| | |
| --- | --- |
| 音标 | /ˌɪnfrəˈrɛd/ |
| 中文释义 | 红外的；红外线的 |
| 英文释义 | Relating to or denoting electromagnetic radiation with wavelengths longer than visible light. |
| freq_rank | 7095 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | infrared radiation | `science_tech` | Infrared radiation can be used for night vision technology. | 红外辐射可以用于夜视技术。 |
| 2 | infrared sensor | `work` | Engineers developed an infrared sensor to detect movement in the dark. | 工程师开发了一种红外传感器，以在黑暗中探测运动。 |
| 3 | infrared spectroscopy | `academic` | Researchers utilized infrared spectroscopy to analyze chemical compounds effectively. | 研究人员利用红外光谱法有效分析化合物。 |

### 48. mortality  *n.*

| | |
| --- | --- |
| 音标 | /mɔːrˈtæl.ɪ.ti/ |
| 中文释义 | 死亡率 |
| 英文释义 | The state of being subject to death; the incidence of death. |
| freq_rank | 4662 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | infant mortality | `health` | Infant mortality rates have declined significantly in many countries recently. | 许多国家的婴儿死亡率最近显著下降。 |
| 2 | mortality rate | `news` | The mortality rate from the disease has increased over the past year. | 该疾病的死亡率在过去一年中有所上升。 |
| 3 | overall mortality | `science_tech` | Researchers are studying the effects of air pollution on overall mortality rates. | 研究人员正在研究空气污染对整体死亡率的影响。 |

### 49. chromosome  *n.*

| | |
| --- | --- |
| 音标 | /ˈkrɒməˌsoʊm/ |
| 中文释义 | 染色体 |
| 英文释义 | Structures within cells that contain genetic material. |
| freq_rank | 9960 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | chromosomes in human cells | `science_tech` | Chromosomes in human cells determine inherited traits and characteristics. | 人类细胞中的染色体决定遗传特征和特性。 |
| 2 | number of chromosomes | `education` | The number of chromosomes varies significantly between different species. | 不同物种之间的染色体数量差异显著。 |
| 3 | chromosomes during cell division | `health` | During cell division, chromosomes ensure proper distribution of genetic information. | 在细胞分裂过程中，染色体确保遗传信息的正确分配。 |

### 50. kinship  *n.*

| | |
| --- | --- |
| 音标 | /ˈkɪn.ʃɪp/ |
| 中文释义 | 亲属关系 |
| 英文释义 | The state of being related to someone by blood or marriage. |
| freq_rank | 8890 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | family kinship | `daily_life` | Families often share a deep sense of kinship that bonds them together. | 家庭通常具有深厚的亲属关系，使他们紧密团结在一起。 |
| 2 | cultural kinship | `culture` | Cultural kinship links individuals through shared traditions and histories. | 文化亲属关系通过共同的传统和历史联系个体。 |
| 3 | kinship ties | `academic` | Researchers are examining how kinship ties influence social structures in communities. | 研究人员正在考察亲属关系如何影响社区的社会结构。 |

### 51. doctorate  *n.*

| | |
| --- | --- |
| 音标 | /ˈdɒk.tər.ət/ |
| 中文释义 | 博士学位 |
| 英文释义 | A high-level academic degree awarded after advanced study and research. |
| freq_rank | 8557 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | obtain a doctorate | `education` | Many students aspire to obtain a doctorate in their chosen field. | 许多学生渴望获得他们所选领域的博士学位。 |
| 2 | earn a doctorate | `academic` | To earn a doctorate requires years of dedication and research. | 获得博士学位需要多年的奉献和研究。 |
| 3 | doctorate program | `work` | She is currently enrolled in a doctorate program focused on environmental science. | 她目前正在攻读一个专注于环境科学的博士项目。 |

### 52. holder  *n.*

| | |
| --- | --- |
| 音标 | /ˈhoʊl.dɚ/ |
| 中文释义 | 持有者 |
| 英文释义 | A person or thing that holds something. |
| freq_rank | 5440 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | certificate holder | `education` | Students must submit their applications to the certificate holders by next week. | 学生必须在下周之前将申请提交给证书持有者。 |
| 2 | card holder | `daily_life` | Every card holder needs to ensure their information is secure. | 每个卡片持有者都需要确保他们的信息安全。 |
| 3 | title holder | `culture` | The title holders of the competition will be announced later this month. | 这个比赛的持有者将在本月晚些时候公布。 |

### 53. superstitious  *adj.*

| | |
| --- | --- |
| 音标 | /ˌsuː.pəˈstɪʃ.əs/ |
| 中文释义 | 迷信的 |
| 英文释义 | Believing in supernatural influences or irrational beliefs. |
| freq_rank | 14286 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | superstitious beliefs | `culture` | Many people still hold superstitious beliefs that influence their daily decisions. | 许多人仍然抱有迷信的信仰，影响他们的日常决定。 |
| 2 | superstitious customs | `daily_life` | Superstitious customs can vary significantly between different cultures around the world. | 迷信习俗在世界不同文化之间可能有显著差异。 |
| 3 | superstitious rituals | `education` | Students often engage in superstitious rituals before important exams to boost their confidence. | 学生们常在重要考试前参与迷信仪式，以增强自信心。 |

### 54. relish  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈrɛlɪʃ/ |
| 中文释义 | 喜好；享受 |
| 英文释义 | Great enjoyment or satisfaction from something. |
| freq_rank | 8659 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | relish the opportunity | `work` | Many professionals relish the opportunity to advance in their careers. | 许多专业人士都享受在职业中晋升的机会。 |
| 2 | relish the moment | `daily_life` | Children often relish the moment when they receive gifts during celebrations. | 孩子们常常享受在庆祝活动中收到礼物的时刻。 |
| 3 | relish the experience | `travel` | Travelers generally relish the experience of exploring new cultures and places. | 旅行者通常享受探索新文化和地方的经历。 |

### 55. rape  *n./v.*

| | |
| --- | --- |
| 音标 | /reɪp/ |
| 中文释义 | 强奸；侵犯 |
| 英文释义 | A violent act involving non-consensual sexual intercourse. |
| freq_rank | 3416 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | rape victim | `news` | The police interviewed the rape victim to gather evidence. | 警方对强奸受害者进行了采访，以收集证据。 |
| 2 | date rape | `daily_life` | Many universities offer support for those affected by date rape. | 许多大学为受到约会强奸影响的人提供支持。 |
| 3 | acquaintance rape | `academic` | Research indicates that acquaintance rape is often underreported in surveys. | 研究表明，熟人强奸在调查中常常被低估。 |

### 56. modernization  *n.*

| | |
| --- | --- |
| 音标 | /ˌmɒd.ər.nəˈzeɪ.ʃən/ |
| 中文释义 | 现代化 |
| 英文释义 | The process of adapting something to modern needs or habits. |
| freq_rank | 8383 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | economic modernization | `news` | Countries are focusing on economic modernization to enhance their competitiveness. | 各国正专注于经济现代化，以增强竞争力。 |
| 2 | technological modernization | `science_tech` | Technological modernization has greatly improved communication in recent years. | 近年来，技术现代化极大地改善了通信。 |
| 3 | urban modernization | `culture` | Urban modernization is transforming traditional neighborhoods into vibrant communities. | 城市现代化正在将传统社区转变为充满活力的社区。 |

### 57. honorable  *adj.*

| | |
| --- | --- |
| 音标 | /ˈɑː.nər.ə.bəl/ |
| 中文释义 | 可敬的 |
| 英文释义 | Worthy of respect or admiration, having high moral principles. |
| freq_rank | 7084 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | honorable mention | `education` | Students who excelled received an honorable mention during the ceremony. | 在颁奖典礼上，表现出色的学生获得了可敬的提名。 |
| 2 | honorable conduct | `work` | Employees are expected to demonstrate honorable conduct in all business dealings. | 员工在所有商业交易中应表现出可敬的行为。 |
| 3 | honorable intentions | `daily_life` | His honorable intentions were clear when he volunteered to help the community. | 他自愿帮助社区时，可敬的意图显而易见。 |

### 58. optimize  *v.*

| | |
| --- | --- |
| 音标 | /ˈɑːp.tɪ.maɪz/ |
| 中文释义 | 优化 |
| 英文释义 | Make the best or most effective use of a resource. |
| freq_rank | 11612 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | optimize performance | `work` | Teams are constantly looking for ways to optimize performance in their projects. | 团队们不断寻找方法来优化项目的表现。 |
| 2 | optimize resources | `science_tech` | Researchers aim to optimize resources for sustainable energy solutions. | 研究人员旨在优化资源，以实现可持续能源解决方案。 |
| 3 | optimize design | `education` | Students learn how to optimize design for their engineering projects. | 学生们学习如何优化他们工程项目的设计。 |

### 59. chap  *n./v.*

| | |
| --- | --- |
| 音标 | /tʃæp/ |
| 中文释义 | 小伙子；家伙 |
| 英文释义 | A man or boy, often used informally in conversation. |
| freq_rank | 12814 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | a good chap | `daily_life` | Everyone agrees that he is a good chap who can be trusted. | 大家都同意他是一个值得信赖的小伙子。 |
| 2 | the young chap | `culture` | A young chap in a suit caught everyone's attention at the gala. | 一位穿着西装的小伙子在晚会上吸引了所有人的注意。 |
| 3 | old chap | `work` | My old chap from the office always brings laughter during meetings. | 我在办公室的老朋友总是在会议上带来欢笑。 |

### 60. pneumonia  *n.*

| | |
| --- | --- |
| 音标 | /njuˈmoʊ.njə/ |
| 中文释义 | 肺炎 |
| 英文释义 | Inflammation of the lungs, often caused by infection or illness. |
| freq_rank | 8632 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | pneumonia infection | `health` | Doctors are concerned about the pneumonia infection spreading in the community. | 医生担心肺炎感染在社区传播。 |
| 2 | bacterial pneumonia | `science_tech` | Researchers study how bacterial pneumonia affects immune system responses. | 研究人员研究细菌性肺炎如何影响免疫系统反应。 |
| 3 | viral pneumonia | `news` | The outbreak of viral pneumonia has raised alarms in many hospitals. | 病毒性肺炎的爆发引起了许多医院的警报。 |

### 61. amplifier  *n.*

| | |
| --- | --- |
| 音标 | /ˈæmplɪfaɪər/ |
| 中文释义 | 放大器 |
| 英文释义 | A device that increases the amplitude of signals. |
| freq_rank | 15529 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | audio amplifier | `daily_life` | She bought a new audio amplifier to enhance her home sound system. | 她买了一个新的音频放大器来增强她的家庭音响系统。 |
| 2 | signal amplifier | `science_tech` | Engineers are developing a signal amplifier to improve communication quality in remote areas. | 工程师们正在开发一种信号放大器，以提高偏远地区的通信质量。 |
| 3 | operational amplifier | `academic` | The operational amplifier is crucial in modern electronic circuit design and analysis. | 运算放大器在现代电子电路设计与分析中至关重要。 |

### 62. foreseeable  *adj.*

| | |
| --- | --- |
| 音标 | /fɔːrˈsiː.ə.bəl/ |
| 中文释义 | 可预见的 |
| 英文释义 | Able to be predicted or anticipated based on present circumstances. |
| freq_rank | 11604 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | foreseeable future | `news` | Many experts believe the economic recovery will take a foreseeable future. | 许多专家认为经济复苏将需要一个可预见的未来。 |
| 2 | foreseeable risks | `work` | Identifying foreseeable risks is essential for effective project management. | 识别可预见的风险对于有效的项目管理至关重要。 |
| 3 | foreseeable consequences | `education` | Students must understand the foreseeable consequences of their academic choices. | 学生必须理解他们学术选择的可预见后果。 |

### 63. paperback  *n.*

| | |
| --- | --- |
| 音标 | /ˈpeɪ.pər.bæk/ |
| 中文释义 | 平装本 |
| 英文释义 | A book with a flexible paper cover. |
| freq_rank | 8235 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | paperback books | `education` | Many students prefer paperback books for their affordability and portability. | 许多学生更喜欢平装本书籍，因为它们便宜且方便携带。 |
| 2 | new paperback | `culture` | The author released a new paperback version of the popular novel last week. | 作者上周发布了这部受欢迎小说的新平装本。 |
| 3 | buy a paperback | `daily_life` | You can buy a paperback at any major bookstore near the university. | 你可以在大学附近的任何大型书店购买平装本。 |

### 64. sufficiency  *n.*

| | |
| --- | --- |
| 音标 | /səˈfɪʃ.ən.si/ |
| 中文释义 | 充足；足够 |
| 英文释义 | The quality of being adequate or enough for a particular purpose. |
| freq_rank | 24932 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | sufficiency of evidence | `academic` | Researchers must prove the sufficiency of evidence in their studies to support claims. | 研究人员必须在研究中证明证据的充足性，以支持论点。 |
| 2 | food sufficiency | `health` | Ensuring food sufficiency is crucial for maintaining public health and preventing malnutrition. | 确保食物的充足性对维护公共健康和预防营养不良至关重要。 |
| 3 | sufficiency in funding | `work` | Startups often struggle to achieve sufficiency in funding for their growth and operations. | 初创公司往往难以获得充足的资金以支持其增长和运营。 |

### 65. bloody  *adj.*

| | |
| --- | --- |
| 音标 | /ˈblʌd.i/ |
| 中文释义 | 血腥的；可怕的 |
| 英文释义 | Involving bloodshed; very unpleasant or bad. |
| freq_rank | 4127 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | bloody conflict | `news` | Many nations are affected by the ongoing bloody conflict in the region. | 许多国家受到该地区持续的血腥冲突的影响。 |
| 2 | bloody mess | `daily_life` | After the party, there was a bloody mess left in the kitchen. | 聚会结束后，厨房里留下了血腥的烂摊子。 |
| 3 | bloody battle | `culture` | The documentary detailed the bloody battle that changed the course of history. | 这部纪录片详细介绍了改变历史进程的血腥战役。 |

### 66. bin  *n.*

| | |
| --- | --- |
| 音标 | /bɪn/ |
| 中文释义 | 垃圾箱 |
| 英文释义 | A container for waste or discarded items. |
| freq_rank | 5370 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | recycling bin | `environment` | Many households have a separate recycling bin for paper and plastics. | 许多家庭都有一个单独的纸张和塑料回收箱。 |
| 2 | garbage bin | `daily_life` | She placed the empty boxes in the garbage bin outside. | 她把空箱子放进了外面的垃圾箱里。 |
| 3 | storage bin | `work` | Each office has a designated storage bin for supplies and documents. | 每个办公室都有一个指定的存储箱，用于存放物品和文件。 |

### 67. daytime  *n.*

| | |
| --- | --- |
| 音标 | /ˈdeɪˌtaɪm/ |
| 中文释义 | 白天 |
| 英文释义 | The period of time during daylight hours. |
| freq_rank | 7145 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | daytime activities | `daily_life` | Many people enjoy outdoor daytime activities during the summer. | 许多人在夏季喜欢户外的白天活动。 |
| 2 | daytime television | `culture` | She prefers watching daytime television shows while relaxing at home. | 她喜欢在家放松时观看白天的电视节目。 |
| 3 | daytime sleep | `health` | Some individuals benefit from daytime sleep to recharge energy levels. | 有些人通过白天睡觉来补充能量。 |

### 68. lad  *n.*

| | |
| --- | --- |
| 音标 | /læd/ |
| 中文释义 | 小伙子 |
| 英文释义 | A boy or young man, often one who is carefree. |
| freq_rank | 9364 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | young lad | `daily_life` | Many young lads enjoy playing football in the park after school. | 许多小伙子喜欢在放学后在公园踢足球。 |
| 2 | lad in the group | `culture` | The lad in the group shared funny stories that made everyone laugh. | 团体中的小伙子分享了有趣的故事，让每个人都笑了。 |
| 3 | old lad | `news` | An old lad received a surprise party for his birthday from friends. | 一位老小伙子收到了朋友们为他庆祝生日的惊喜派对。 |

### 69. neurology  *n.*

| | |
| --- | --- |
| 音标 | /njuˈrɑː.lə.dʒi/ |
| 中文释义 | 神经学 |
| 英文释义 | The branch of medicine dealing with nervous system disorders. |
| freq_rank | 21144 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | neurology research | `academic` | Research in neurology has significantly advanced our understanding of brain disorders. | 神经学研究极大地推动了我们对脑部疾病的理解。 |
| 2 | neurology clinic | `health` | Patients often visit a neurology clinic for specialized care and diagnosis. | 患者通常会到神经学诊所寻求专业的护理和诊断。 |
| 3 | neurology textbook | `education` | A comprehensive neurology textbook provides essential information for medical students. | 一本全面的神经学教材为医学生提供了必要的信息。 |

### 70. glamor  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈɡlæm.ər/ |
| 中文释义 | 魅力 |
| 英文释义 | Attractiveness or allure, often in a superficial way. |
| freq_rank | 9073 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | glamor models | `culture` | Fashion shows often feature glamor models showcasing the latest designs. | 时装秀经常会展示魅力模特展示最新的设计。 |
| 2 | glamor industry | `work` | The glamor industry can be demanding and competitive for newcomers. | 魅力行业对新来者来说可能要求很高且竞争激烈。 |
| 3 | glamor of celebrity | `daily_life` | Many people are captivated by the glamor of celebrity lifestyles. | 许多人被名人生活的魅力所吸引。 |

### 71. gallop  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈɡæl.əp/ |
| 中文释义 | 飞奔；疾驰 |
| 英文释义 | A fast gait of a horse; to move quickly. |
| freq_rank | 12092 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | gallop away | `daily_life` | The children watched the horses gallop away into the distance. | 孩子们看着马飞奔而去，消失在远方。 |
| 2 | gallop in | `work` | She decided to gallop in and take charge of the meeting immediately. | 她决定冲进来，立即掌控会议。 |
| 3 | gallop through | `education` | Students need to gallop through the syllabus to prepare for the exams. | 学生们需要迅速完成课程大纲，以备考。 |

### 72. sophomore  *n./adj.*

| | |
| --- | --- |
| 音标 | /ˈsɒf.mɔːr/ |
| 中文释义 | 大二学生 |
| 英文释义 | A second-year student in a U.S. college or high school. |
| freq_rank | 5932 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | sophomore year | `education` | Many students struggle during their sophomore year in college. | 许多学生在大学的大二阶段感到困难。 |
| 2 | sophomore class | `daily_life` | She enjoyed the camaraderie in her sophomore class during lunch. | 她在午餐时享受和大二班同学之间的友谊。 |
| 3 | sophomore project | `work` | Completing a sophomore project can help improve research skills. | 完成一个大二项目可以帮助提高研究技能。 |

### 73. eyebrow  *n.*

| | |
| --- | --- |
| 音标 | /ˈaɪ.braʊ/ |
| 中文释义 | 眉毛 |
| 英文释义 | A strip of hair growing above the eye. |
| freq_rank | 4465 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | plucked eyebrows | `daily_life` | Many people choose to maintain perfectly plucked eyebrows for beauty. | 许多人选择保持完美的修眉来提升美感。 |
| 2 | eyebrow shape | `culture` | Artists often emphasize the eyebrow shape in their portraits. | 艺术家们常常在肖像中强调眉形。 |
| 3 | raise eyebrows | `news` | The politician's comments raised eyebrows among his colleagues. | 这位政治家的言论引起了同事们的关注。 |

### 74. innovate  *v.*

| | |
| --- | --- |
| 音标 | /ˈɪn.ə.veɪt/ |
| 中文释义 | 创新 |
| 英文释义 | To introduce new ideas, methods, or products. |
| freq_rank | 18968 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | innovate in technology | `science_tech` | Companies must innovate in technology to remain competitive in the market. | 公司必须在科技领域创新，才能在市场上保持竞争力。 |
| 2 | innovate the process | `work` | To improve efficiency, the team decided to innovate the process of project management. | 为了提高效率，团队决定创新项目管理的流程。 |
| 3 | innovate educational practices | `education` | Teachers are encouraged to innovate educational practices to better engage students in learning. | 教师被鼓励创新教育实践，以更好地吸引学生的学习兴趣。 |

### 75. perceptual  *adj.*

| | |
| --- | --- |
| 音标 | /pərˈsɛp.tʃu.əl/ |
| 中文释义 | 感知的 |
| 英文释义 | Relating to the ability to perceive or interpret sensory information. |
| freq_rank | 11718 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | perceptual differences | `science_tech` | Researchers found significant perceptual differences in how subjects responded to stimuli. | 研究人员发现受试者对刺激的感知差异显著。 |
| 2 | perceptual skills | `education` | Students develop perceptual skills through various interactive learning activities in class. | 学生通过课堂上的各种互动学习活动发展感知技能。 |
| 3 | perceptual experience | `daily_life` | Every perceptual experience shapes our understanding of the world around us. | 每一次感知体验都塑造了我们对周围世界的理解。 |

### 76. recurrent  *adj.*

| | |
| --- | --- |
| 音标 | /rɪˈkɜːr.ənt/ |
| 中文释义 | 反复的；再现的 |
| 英文释义 | Happening repeatedly over a period of time. |
| freq_rank | 11386 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | recurrent issues | `work` | Many teams face recurrent issues that impede productivity and morale. | 许多团队面临反复出现的问题，这影响了生产力和士气。 |
| 2 | recurrent themes | `culture` | Artists often explore recurrent themes in their work to convey deeper meanings. | 艺术家们常常在作品中探讨反复出现的主题，以传达更深的意义。 |
| 3 | recurrent events | `science_tech` | Researchers study recurrent events to understand patterns in natural phenomena. | 研究人员研究反复出现的事件，以理解自然现象中的模式。 |

### 77. transcendental  *adj.*

| | |
| --- | --- |
| 音标 | /træn.sənˈdɛn.təl/ |
| 中文释义 | 超越的；超验的 |
| 英文释义 | Relating to a spiritual or non-physical realm. |
| freq_rank | 16575 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | transcendental philosophy | `academic` | Philosophers often debate the implications of transcendental philosophy in modern thought. | 哲学家们常常讨论超验哲学在现代思想中的影响。 |
| 2 | transcendental meditation | `health` | Practicing transcendental meditation can lead to significant stress reduction and improved focus. | 练习超越冥想可以显著减少压力并提高专注力。 |
| 3 | transcendental experiences | `culture` | Many artists cite their transcendental experiences as inspiration for their creative work. | 许多艺术家将他们的超越体验视为创作工作的灵感。 |

### 78. spicy  *adj.*

| | |
| --- | --- |
| 音标 | /ˈspaɪ.si/ |
| 中文释义 | 辛辣的 |
| 英文释义 | Having a strong, pungent flavor; often associated with heat. |
| freq_rank | 7735 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | spicy food | `daily_life` | Many people enjoy spicy food for its bold flavors. | 很多人喜欢辛辣的食物，因为它的味道浓烈。 |
| 2 | spicy flavors | `culture` | In many cuisines, spicy flavors play a central role in dishes. | 在许多菜系中，辛辣的风味在菜肴中占据中心地位。 |
| 3 | spicy ingredients | `health` | Using spicy ingredients can enhance the nutritional value of meals. | 使用辛辣成分可以提高餐食的营养价值。 |

### 79. retrospection  *n.*

| | |
| --- | --- |
| 音标 | /ˌrɛtrəˈspɛkʃən/ |
| 中文释义 | 回顾；追溯 |
| 英文释义 | The process of looking back at past events or experiences. |
| freq_rank | 42499 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | historical retrospection | `academic` | Historians often engage in retrospection to understand past civilizations better. | 历史学家常常通过回顾来更好地理解过去的文明。 |
| 2 | retrospection on past decisions | `work` | During the meeting, the team conducted a retrospection on past decisions to improve future strategies. | 在会议上，团队对过去的决策进行了回顾，以改善未来的战略。 |
| 3 | personal retrospection | `daily_life` | Finding time for personal retrospection can significantly enhance one's emotional well-being. | 抽出时间进行个人回顾可以显著提升一个人的情感健康。 |

### 80. archive  *v./n.*

| | |
| --- | --- |
| 音标 | /ˈɑːr.kaɪv/ |
| 中文释义 | 档案；存档 |
| 英文释义 | A collection of documents or records. |
| freq_rank | 6515 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | archive documents | `work` | Managers need to archive documents for future reference. | 经理需要将档案文件存档以备将来参考。 |
| 2 | digital archive | `academic` | Researchers often consult the digital archive for historical data. | 研究人员经常查阅数字档案以获取历史数据。 |
| 3 | archive material | `culture` | The museum plans to archive material related to local history. | 博物馆计划存档与地方历史相关的资料。 |

### 81. redundancy  *n.*

| | |
| --- | --- |
| 音标 | /rɪˈdʌn.dən.si/ |
| 中文释义 | 冗余 |
| 英文释义 | The state of being unnecessary or excessive in quantity or content. |
| freq_rank | 16763 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | job redundancy | `work` | Job redundancy often leads to significant stress and uncertainty among employees. | 工作冗余常常会给员工带来巨大的压力和不确定性。 |
| 2 | data redundancy | `science_tech` | Data redundancy can improve reliability but may increase storage costs. | 数据冗余可以提高可靠性，但可能会增加存储成本。 |
| 3 | redundancy payment | `daily_life` | Employees receiving redundancy payments should carefully manage their finances post-layoff. | 接受冗余赔偿的员工应该在裁员后谨慎管理自己的财务。 |

### 82. apprehensive  *adj.*

| | |
| --- | --- |
| 音标 | /ˌæp.rɪˈhɛn.sɪv/ |
| 中文释义 | 忧虑的；不安的 |
| 英文释义 |  anxious or fearful about possible future events. |
| freq_rank | 13421 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | apprehensive about the results | `academic` | Students often feel apprehensive about the results of their final exams. | 学生们常常对期末考试的结果感到忧虑。 |
| 2 | apprehensive of change | `work` | Many employees are apprehensive of change within the organization. | 许多员工对组织内部的变化感到不安。 |
| 3 | apprehensive parents | `daily_life` | Apprehensive parents waited for their children to return home safely. | 忧虑的父母等待孩子安全回家。 |

### 83. blueprint  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈbluː.prɪnt/ |
| 中文释义 | 蓝图；设计图 |
| 英文释义 | A detailed plan or drawing used as a guide. |
| freq_rank | 7570 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | detailed blueprint | `work` | Engineers created a detailed blueprint for the new bridge. | 工程师为新桥制作了详细的蓝图。 |
| 2 | architectural blueprint | `education` | Students studied an architectural blueprint to understand building design. | 学生们研究了一份建筑蓝图，以了解建筑设计。 |
| 3 | business blueprint | `science_tech` | The company developed a business blueprint for future growth and innovation. | 公司制定了一份未来增长和创新的商业蓝图。 |

### 84. capitalism  *n.*

| | |
| --- | --- |
| 音标 | /ˈkæp.ɪ.təl.ɪ.zəm/ |
| 中文释义 | 资本主义 |
| 英文释义 | An economic system based on private ownership and free markets. |
| freq_rank | 5107 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | free market capitalism | `academic` | Free market capitalism often promotes competition and innovation within economies. | 自由市场资本主义通常促进经济中的竞争和创新。 |
| 2 | market-based capitalism | `news` | Many countries are shifting towards market-based capitalism for better economic growth. | 许多国家正在转向市场导向的资本主义以实现更好的经济增长。 |
| 3 | global capitalism | `culture` | Global capitalism has transformed how we view trade and international relations. | 全球资本主义改变了我们对贸易和国际关系的看法。 |

### 85. connotation  *n.*

| | |
| --- | --- |
| 音标 | /ˌkɒnəˈteɪʃən/ |
| 中文释义 | 内涵 |
| 英文释义 | An implied or associated meaning of a word or phrase. |
| freq_rank | 11350 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | positive connotation | `daily_life` | Describing someone as generous often carries a positive connotation. | 形容某人慷慨通常带有积极的内涵。 |
| 2 | negative connotation | `academic` | Certain terms may have a negative connotation in specific contexts of study. | 某些术语在特定的研究语境中可能具有消极的内涵。 |
| 3 | cultural connotation | `culture` | Different cultures may attribute various meanings and cultural connotation to symbols. | 不同文化可能会对符号赋予不同的意义和文化内涵。 |

### 86. genealogist  *n.*

| | |
| --- | --- |
| 音标 | /ˌdʒiːniˈælədʒɪst/ |
| 中文释义 | 家谱学者 |
| 英文释义 | A person who studies family ancestries and histories. |
| freq_rank | 32076 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | professional genealogist | `work` | Considering her expertise, many view her as a professional genealogist. | 考虑到她的专业知识，许多人视她为一名专业的家谱学者。 |
| 2 | expert genealogists | `academic` | Many expert genealogists have contributed to historical research in significant ways. | 许多专家家谱学者在历史研究中做出了重要贡献。 |
| 3 | genealogist records | `daily_life` | People often consult genealogist records to trace their family lineage. | 人们常常查阅家谱学者的记录以追溯家族谱系。 |

### 87. repressive  *adj.*

| | |
| --- | --- |
| 音标 | /rɪˈprɛsɪv/ |
| 中文释义 | 压制的 |
| 英文释义 | Restricting or controlling freedom or expression. |
| freq_rank | 11423 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | repressive regime | `news` | Many countries are governed by repressive regimes that limit personal freedoms. | 许多国家都由压制性政权统治，限制个人自由。 |
| 2 | repressive policies | `academic` | Scholars discuss the impact of repressive policies on societal development. | 学者们讨论压制性政策对社会发展的影响。 |
| 3 | repressive measures | `culture` | Artists often face repressive measures that stifle creativity and expression. | 艺术家们通常面临压制性措施，扼杀创造力和表达。 |

### 88. quirk  *n.*

| | |
| --- | --- |
| 音标 | /kwɜrk/ |
| 中文释义 | 怪癖 |
| 英文释义 | A peculiar or unusual trait or behavior. |
| freq_rank | 12149 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | quirks of personality | `daily_life` | Many people embrace the quirks of personality that make them unique. | 许多人接受那些使他们独特的个性怪癖。 |
| 2 | quirk in the system | `science_tech` | Researchers discovered a quirk in the system that affected the results. | 研究人员发现了系统中的一个怪癖，影响了结果。 |
| 3 | quirks in behavior | `academic` | The study aimed to analyze quirks in behavior among different social groups. | 该研究旨在分析不同社会群体中的行为怪癖。 |

### 89. fairy  *n./adj.*

| | |
| --- | --- |
| 音标 | /ˈfɛr.i/ |
| 中文释义 | 仙女；精灵 |
| 英文释义 | A mythical being with magical powers, often depicted as beautiful and small. |
| freq_rank | 6368 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | fairy tales | `culture` | Many children grow up listening to enchanting fairy tales at bedtime. | 许多孩子在睡前听迷人的仙女故事长大。 |
| 2 | fairy lights | `daily_life` | Hanging fairy lights transformed the garden into a magical space. | 悬挂的仙女灯把花园变成了一个神奇的空间。 |
| 3 | fairy godmother | `education` | In the story, a fairy godmother helps the protagonist achieve her dreams. | 在这个故事中，一位仙女教母帮助主角实现她的梦想。 |

### 90. doorway  *n.*

| | |
| --- | --- |
| 音标 | /ˈdɔr.weɪ/ |
| 中文释义 | 门口；门道 |
| 英文释义 | An entrance or passageway to a building or room. |
| freq_rank | 3866 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | doorway to success | `work` | She found a doorway to success through her hard work. | 她通过努力工作找到成功的门道。 |
| 2 | doorway of opportunity | `daily_life` | Many people see education as a doorway of opportunity. | 许多人视教育为机遇的门道。 |
| 3 | doorway into another world | `culture` | The art museum serves as a doorway into another world of creativity. | 这座艺术博物馆是通往创意另一个世界的门道。 |

### 91. prudence  *n.*

| | |
| --- | --- |
| 音标 | /ˈpruː.dəns/ |
| 中文释义 | 谨慎 |
| 英文释义 | The quality of being cautious and exercising good judgment. |
| freq_rank | 14974 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | financial prudence | `work` | Investors often value financial prudence when making decisions about their portfolios. | 投资者在做出投资组合决策时，通常会重视财务谨慎。 |
| 2 | exercise prudence | `education` | Students should exercise prudence when selecting courses for their academic future. | 学生在选择课程以规划学术未来时，应当谨慎行事。 |
| 3 | demonstrate prudence | `news` | The government must demonstrate prudence in handling public funds during economic crises. | 政府在经济危机期间必须在处理公共资金时表现出谨慎。 |

### 92. theological  *adj.*

| | |
| --- | --- |
| 音标 | /ˌθiː.əˈlɒdʒ.ɪ.kəl/ |
| 中文释义 | 神学的 |
| 英文释义 | Relating to the study of religious beliefs and practices. |
| freq_rank | 4732 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | theological studies | `academic` | Students often engage in various theological studies to deepen their understanding. | 学生们常常参与各种神学研究，以加深他们的理解。 |
| 2 | theological debates | `culture` | Scholars frequently hold theological debates to address contemporary moral issues. | 学者们经常举行神学辩论，以讨论当代道德问题。 |
| 3 | theological perspectives | `education` | Different theological perspectives can influence how history is interpreted in schools. | 不同的神学观点会影响学校对历史的解读。 |

### 93. juggle  *v./n.*

| | |
| --- | --- |
| 音标 | /ˈdʒʌɡ.əl/ |
| 中文释义 | 耍杂技；同时处理多项事务 |
| 英文释义 | To keep several objects in motion in the air by catching and throwing them. |
| freq_rank | 9584 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | juggle responsibilities | `work` | Many professionals juggle responsibilities to maintain a work-life balance. | 许多专业人士同时处理责任以维持工作与生活的平衡。 |
| 2 | juggle tasks | `academic` | Students often juggle tasks to meet deadlines and manage their studies. | 学生们常常同时处理任务以满足截止日期并管理学习。 |
| 3 | juggle time | `daily_life` | Parents must juggle time to care for their children and manage household chores. | 父母必须合理安排时间照顾孩子并处理家务。 |

### 94. sip  *n./v.*

| | |
| --- | --- |
| 音标 | /sɪp/ |
| 中文释义 | 啜饮；小口喝 |
| 英文释义 | To drink a small amount, usually slowly. |
| freq_rank | 5716 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | sip tea | `daily_life` | She likes to sip tea while reading her favorite book. | 她喜欢在阅读自己喜欢的书时啜饮茶。 |
| 2 | sip coffee | `work` | Many people sip coffee during their morning meetings to stay awake. | 很多人在早晨的会议上啜饮咖啡以保持清醒。 |
| 3 | sip water | `health` | It is important to sip water regularly throughout the day to stay hydrated. | 在一天中定期啜饮水，以保持水分充足是很重要的。 |

### 95. reassurance  *n.*

| | |
| --- | --- |
| 音标 | /ˌriː.əˈʃʊr.əns/ |
| 中文释义 | 安慰；放心 |
| 英文释义 | The act of providing comfort or confidence to someone. |
| freq_rank | 10591 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | reassurance from experts | `news` | Experts provided reassurance about the safety of the vaccine, alleviating public fears. | 专家们对疫苗的安全性提供了安慰，缓解了公众的恐惧。 |
| 2 | reassurance to patients | `health` | Doctors often give reassurance to patients undergoing stressful procedures to ease their anxiety. | 医生们经常对正在经历压力程序的患者给予安慰，以减轻他们的焦虑。 |
| 3 | reassurance in challenging times | `daily_life` | In challenging times, families seek reassurance from each other to maintain hope and stability. | 在困难时期，家庭成员相互寻求安慰，以维持希望和稳定。 |
