# gmat 词库内容 · 送审件(抽 100 词)

> 抽样种子固定 20260803,复跑抽到同一批。**不是纯随机** —— 贪心挑成尽量铺开场景与词性,
> 免得 100 个里大半是名词、场景全挤在 news。
> 本批覆盖 **10/10 个场景**、**6 种词性**。
> 全量内容见 `scripts/vocab/data/generated/gmat-content.json`。

## 全量 778 词的实测分布

| 项 | 实测 |
| --- | --- |
| 词条 | 778 |
| 例句 | 2334(平均每词 3.00 条) |
| 难度档 | B1 5 · B2 246 · C1 527 |
| ECDICT 未标词性 | 7 词 |
| 跨词性(pos 含 `/`) | 249 词(32.0%) |
| 一次过闸 | 637 词 · 重试后才过 141 词 |
| 人工撰写 | 0 词 |

场景分布(共 2334 条例句):academic 267 · news 260 · daily_life 436 · work 387 · science_tech 206 · health 116 · environment 94 · education 196 · travel 43 · culture 329

## 请重点看这四点

1. **中文释义准不准** —— 有没有把次要义当主义、有没有并列近义词充数。
2. **搭配是不是真高频**,顺序是不是真按频率(句 1 应当是最常见的说法)。
3. **例句像不像人写的** —— 三句之间是不是真换了写法,不是同一个模子换词。
4. **难度档合不合适** —— 高频词配短句、低频学术词配长句。

## ⚠️ 我自己知道的薄弱点(不用你去找)

- **跨词性词的义项**:本批有 249 个跨词性词。提示词里加了"跨词性几乎必然对应词典
  分列义项"的自查,实测 state → 状态；国家 ✓、part → 部分；分开 ✓,但 **might(n./aux.)
  仍然给「可能；或许」** —— 近义堆砌且漏了名词义"力量"。没继续迭代提示词(边际收益递减),
  这类**只能靠人审兜**,请留意跨词性词的第二个义项。
- **个别搭配不是真搭配**:如 system 的 "local system"、part 的
  "Understanding is part of the problem we face"(语义空转)。机器闸门只能判"搭配里含不含
  目标词",判不了"这个搭配母语者到底说不说"。


---

### 1. arbiter  *n.*

| | |
| --- | --- |
| 音标 | /ˈɑːr.bɪ.tər/ |
| 中文释义 | 仲裁者 |
| 英文释义 | A person who settles disputes or has ultimate authority. |
| freq_rank | 14948 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | final arbiter | `academic` | Scholars often regard the peer review process as the final arbiter of quality. | 学者们常常认为同行评审过程是质量的最终仲裁者。 |
| 2 | arbiters of taste | `culture` | Fashion designers are seen as arbiters of taste in contemporary society. | 时装设计师被视为当代社会的品味仲裁者。 |
| 3 | arbiter in disputes | `work` | The HR manager acted as an arbiter in disputes between employees. | 人力资源经理在员工之间的争议中担任仲裁者。 |

### 2. disparate  *adj./n.*

| | |
| --- | --- |
| 音标 | /ˈdɪs.pər.ət/ |
| 中文释义 | 迥然不同的；相异的 |
| 英文释义 | Different in kind; not able to be compared. |
| freq_rank | 8918 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | disparate groups | `education` | Students from disparate groups contribute unique perspectives to discussions. | 来自迥然不同的群体的学生为讨论提供了独特的观点。 |
| 2 | disparate views | `news` | Experts often hold disparate views on how to address climate change. | 专家们在如何应对气候变化的问题上经常持有迥然不同的看法。 |
| 3 | disparate outcomes | `science_tech` | The experiment produced disparate outcomes under varying conditions. | 该实验在不同条件下产生了迥然不同的结果。 |

### 3. wilt  *v./n.*

| | |
| --- | --- |
| 音标 | /wɪlt/ |
| 中文释义 | 枯萎 |
| 英文释义 | To become limp or droop due to lack of water. |
| freq_rank | 10000 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | flowers wilt | `daily_life` | When the temperature rises, flowers wilt rapidly without enough water. | 当温度上升时，花朵在缺水的情况下很快就会枯萎。 |
| 2 | plants wilting | `environment` | In hot weather, plants wilting is a common problem for gardeners. | 在炎热的天气中，植物枯萎是园丁常见的问题。 |
| 3 | vegetables wilt | `health` | Eating vegetables right after purchase prevents them from wilting quickly. | 购买后立即食用蔬菜可以防止它们快速枯萎。 |

### 4. gingerly  *adv./adj.*

| | |
| --- | --- |
| 音标 | /ˈdʒɪn.dʒər.li/ |
| 中文释义 | 小心翼翼地；谨慎地 |
| 英文释义 | In a careful or cautious manner. |
| freq_rank | 11787 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | gingerly approached | `daily_life` | She gingerly approached the sleeping dog, afraid it might wake up suddenly. | 她小心翼翼地靠近正在睡觉的狗，生怕它突然醒来。 |
| 2 | gingerly handled | `work` | The technician gingerly handled the fragile equipment during the installation process. | 技术人员在安装过程中小心翼翼地处理易碎设备。 |
| 3 | gingerly stepped | `travel` | He gingerly stepped onto the icy pavement, trying not to slip or fall. | 他小心翼翼地踩在冰冷的人行道上，尽量不摔倒。 |

### 5. genome  *(ECDICT 没标词性)*

| | |
| --- | --- |
| 音标 | /ˈdʒiː.noʊm/ |
| 中文释义 | 基因组 |
| 英文释义 | The complete set of genetic material in an organism. |
| freq_rank | 7379 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | human genome | `science_tech` | Researchers are mapping the human genome to understand genetic diseases better. | 研究人员正在绘制人类基因组，以更好地理解遗传疾病。 |
| 2 | plant genome | `environment` | Scientists are exploring the plant genome to enhance agricultural productivity. | 科学家正在研究植物基因组，以提高农业生产力。 |
| 3 | genome sequencing | `health` | Genome sequencing has revolutionized the study of personalized medicine. | 基因组测序彻底改变了个性化医学的研究。 |

### 6. albeit  *conj.*

| | |
| --- | --- |
| 音标 | /ɔːlˈbiː.ɪt/ |
| 中文释义 | 尽管；虽然 |
| 英文释义 | In spite of the fact that; although. |
| freq_rank | 6086 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | albeit difficult | `education` | Studying a new language is challenging, albeit difficult for many students. | 学习一门新语言是具有挑战性的，尽管对许多学生来说很困难。 |
| 2 | albeit expensive | `daily_life` | Dining at that restaurant is enjoyable, albeit expensive for most families. | 在那家餐厅用餐很愉快，尽管对大多数家庭来说很贵。 |
| 3 | albeit with reservations | `work` | The proposal was accepted, albeit with reservations from some team members. | 该提案被接受，尽管一些团队成员对此有保留意见。 |

### 7. bout  *n.*

| | |
| --- | --- |
| 音标 | /baʊt/ |
| 中文释义 | 一段时间；一场 |
| 英文释义 | A short period of time or a contest. |
| freq_rank | 5865 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | boxing bout | `daily_life` | Many people enjoy watching a boxing bout on television. | 许多人喜欢在电视上观看拳击比赛。 |
| 2 | bout of illness | `health` | She experienced a sudden bout of illness last week. | 她上周经历了一次突发的疾病。 |
| 3 | bout of laughter | `culture` | After a funny story, there was a bout of laughter among friends. | 在一个有趣的故事后，朋友们笑得不可开交。 |

### 8. cache  *n./v.*

| | |
| --- | --- |
| 音标 | /kæʃ/ |
| 中文释义 | 缓存；藏匿处 |
| 英文释义 | A storage space for temporarily holding data. |
| freq_rank | 8893 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | cache memory | `science_tech` | Computers utilize cache memory to increase processing speed. | 计算机利用缓存内存来提高处理速度。 |
| 2 | cache files | `work` | Employees often clear cache files to optimize performance. | 员工经常清理缓存文件以优化性能。 |
| 3 | cache data | `academic` | Researchers found that cache data can significantly affect results. | 研究人员发现缓存数据会显著影响结果。 |

### 9. complacency  *n.*

| | |
| --- | --- |
| 音标 | /kəmˈpleɪ.sən.si/ |
| 中文释义 | 自满；满足 |
| 英文释义 | A feeling of self-satisfaction, often without awareness of potential dangers or deficiencies. |
| freq_rank | 14595 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | complacency in safety practices | `work` | Many employees exhibited complacency in safety practices, leading to avoidable accidents. | 许多员工在安全操作上表现出自满，导致了可避免的事故。 |
| 2 | complacency about results | `academic` | Students often show complacency about results, believing they can achieve without effort. | 学生们常常对结果表现出自满，认为自己无需努力就能取得成功。 |
| 3 | complacency towards challenges | `daily_life` | She approached new challenges with complacency, thinking they would resolve themselves. | 她自满地面对新的挑战，认为这些问题会自我解决。 |

### 10. hamstring  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈhæm.strɪŋ/ |
| 中文释义 | 腿筋；限制 |
| 英文释义 | A muscle at the back of the thigh; to hinder progress. |
| freq_rank | 11057 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | hamstring injury | `health` | Athletes often suffer a hamstring injury during intense training sessions. | 运动员在高强度训练中经常会受伤腿筋。 |
| 2 | hamstring efforts | `work` | The new regulations may hamstring efforts to boost productivity in the company. | 新法规可能会限制公司提升生产力的努力。 |
| 3 | hamstring reforms | `news` | Recent political debates could hamstring reforms aimed at improving public services. | 最近的政治辩论可能会限制改善公共服务的改革。 |

### 11. stealth  *n.*

| | |
| --- | --- |
| 音标 | /stɛlθ/ |
| 中文释义 | 隐形；潜行 |
| 英文释义 | Cautious and secretive movement to avoid detection. |
| freq_rank | 12455 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | stealth technology | `science_tech` | Researchers are developing stealth technology to enhance military aircraft capabilities. | 研究人员正在开发隐形技术，以增强军用飞机的能力。 |
| 2 | stealth operations | `news` | The military conducted stealth operations to gather intelligence without being detected. | 军方进行了隐秘行动，以在不被发现的情况下收集情报。 |
| 3 | stealth tactics | `work` | Effective leaders often utilize stealth tactics to navigate complex organizational challenges. | 有效的领导者常常利用隐秘策略来应对复杂的组织挑战。 |

### 12. covenant  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈkʌv.ən.ənt/ |
| 中文释义 | 契约 |
| 英文释义 | A formal agreement or promise between parties. |
| freq_rank | 11267 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | covenant agreement | `work` | The company signed a covenant agreement to protect intellectual property rights. | 公司签署了一份契约协议，以保护知识产权。 |
| 2 | covenant community | `culture` | Many families choose to live in a covenant community that upholds specific values. | 许多家庭选择居住在维护特定价值观的契约社区。 |
| 3 | covenant relationship | `education` | Establishing a covenant relationship fosters trust and collaboration among students and teachers. | 建立契约关系促进学生和教师之间的信任与合作。 |

### 13. custody  *n.*

| | |
| --- | --- |
| 音标 | /ˈkʌs.tə.di/ |
| 中文释义 | 监护；拘留 |
| 英文释义 | The legal right to take care of someone or something. |
| freq_rank | 4422 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | child custody | `daily_life` | Parents often dispute over child custody during divorce proceedings. | 离婚诉讼过程中，父母常常争夺子女的监护权。 |
| 2 | in custody | `news` | The suspect remained in custody while investigations continued. | 在调查继续进行的同时，嫌疑人仍被拘留。 |
| 3 | legal custody | `academic` | Legal custody determines which parent makes important decisions for the child. | 法律监护决定哪个父母为孩子做重要决定。 |

### 14. memoir  *n.*

| | |
| --- | --- |
| 音标 | /ˈmɛ.mwɑːr/ |
| 中文释义 | 回忆录 |
| 英文释义 | A historical account written from personal knowledge. |
| freq_rank | 5572 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | memoir writing | `education` | Writing a memoir requires deep reflection on personal experiences. | 撰写回忆录需要对个人经历进行深入反思。 |
| 2 | memoir author | `culture` | Many famous memoir authors share their life stories with the world. | 许多著名的回忆录作者与世界分享他们的生活故事。 |
| 3 | memoir collection | `daily_life` | A collection of memoirs can provide diverse perspectives on history. | 一部回忆录合集可以提供多样的历史视角。 |

### 15. seminary  *n.*

| | |
| --- | --- |
| 音标 | /ˈsɛm.ɪ.nɛr.i/ |
| 中文释义 | 神学院 |
| 英文释义 | An institution for training ministers or priests. |
| freq_rank | 9762 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | the seminary curriculum | `education` | Students participate actively in the seminary curriculum to enhance their learning experience. | 学生积极参与神学院的课程，以提升他们的学习体验。 |
| 2 | attend the seminary | `daily_life` | Young adults often choose to attend the seminary for spiritual growth. | 年轻人常常选择去神学院以获得灵性成长。 |
| 3 | graduate from the seminary | `work` | Many individuals aspire to graduate from the seminary and serve their communities. | 许多人渴望从神学院毕业，并服务于他们的社区。 |

### 16. sensual  *adj.*

| | |
| --- | --- |
| 音标 | /ˈsɛnʃuəl/ |
| 中文释义 | 性感的 |
| 英文释义 | Relating to physical or sexual pleasure or gratification. |
| freq_rank | 10089 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | sensual experience | `culture` | Exploring a sensual experience can deepen one's appreciation for art and beauty. | 探索性感的体验可以加深对艺术和美的欣赏。 |
| 2 | sensual pleasure | `daily_life` | Many seek sensual pleasure through fine dining and exquisite flavors that delight the senses. | 许多人通过美食和令人愉悦的味道寻求性感的享受。 |
| 3 | sensual imagery | `education` | The use of sensual imagery in literature often evokes strong emotional responses from readers. | 文学中运用性感的意象往往会激发读者强烈的情感反应。 |

### 17. landfill  *n.*

| | |
| --- | --- |
| 音标 | /ˈlænd.fɪl/ |
| 中文释义 | 垃圾填埋场 |
| 英文释义 | A site for the disposal of waste materials. |
| freq_rank | 6865 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | municipal landfills | `environment` | Municipal landfills are becoming increasingly overloaded with waste materials. | 市政垃圾填埋场正日益超负荷处理垃圾。 |
| 2 | landfill sites | `news` | Many landfill sites are being monitored for environmental impact. | 许多垃圾填埋场正在监测其对环境的影响。 |
| 3 | landfill waste | `daily_life` | Reducing landfill waste is essential for sustainable living. | 减少垃圾填埋废物对可持续生活至关重要。 |

### 18. flail  *n./v.*

| | |
| --- | --- |
| 音标 | /fleɪl/ |
| 中文释义 | 挥动；挣扎 |
| 英文释义 | To wave or swing wildly or to struggle desperately. |
| freq_rank | 12868 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | flail wildly | `daily_life` | During the emergency, people began to flail wildly in panic. | 在紧急情况下，人们开始慌乱地挥舞。 |
| 2 | flail about | `work` | When faced with new challenges, some employees may flail about instead of seeking help. | 面对新挑战时，一些员工可能会乱做而不是寻求帮助。 |
| 3 | flail in pain | `health` | The patient continued to flail in pain after the accident occurred. | 事故发生后，病人仍然在痛苦中挣扎。 |

### 19. grotesque  *n./adj.*

| | |
| --- | --- |
| 音标 | /ɡroʊˈtɛsk/ |
| 中文释义 | 可怕的；怪异的 |
| 英文释义 | Distorted or unnatural in appearance; shocking or repulsive. |
| freq_rank | 12252 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | grotesque figures | `culture` | Artists often depict grotesque figures to evoke strong emotions in their audience. | 艺术家常常描绘可怕的形象以激发观众强烈的情感。 |
| 2 | grotesque humor | `daily_life` | Many comedians use grotesque humor to entertain their audiences through absurd situations. | 许多喜剧演员利用可怕的幽默通过荒诞的情境来娱乐观众。 |
| 3 | grotesque manifestations | `science_tech` | Researchers have documented grotesque manifestations of genetic mutations in affected organisms. | 研究人员记录了受影响生物中基因突变的可怕表现。 |

### 20. thematic  *adj.*

| | |
| --- | --- |
| 音标 | /θəˈmæt.ɪk/ |
| 中文释义 | 主题的；题材的 |
| 英文释义 | Relating to a particular subject or theme. |
| freq_rank | 11588 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | thematic analysis | `academic` | Researchers employed thematic analysis to interpret the qualitative data collected. | 研究人员使用主题分析法解读收集的定性数据。 |
| 2 | thematic elements | `culture` | Various thematic elements influenced the storytelling techniques in contemporary cinema. | 多种主题元素影响了当代电影中的叙事技巧。 |
| 3 | thematic exhibitions | `daily_life` | The museum hosts thematic exhibitions that change every few months to attract visitors. | 博物馆举办的主题展览每几个月更换一次，以吸引游客。 |

### 21. nexus  *n.*

| | |
| --- | --- |
| 音标 | /ˈnɛk.səs/ |
| 中文释义 | 连接；联系 |
| 英文释义 | A connection or link between different things or entities. |
| freq_rank | 14124 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | nexus of relationships | `culture` | Cultural identity often forms a nexus of relationships among diverse communities. | 文化认同常常在不同的社区中形成联系的纽带。 |
| 2 | nexus between | `education` | There is a strong nexus between education and economic development in many countries. | 在许多国家，教育与经济发展之间存在着紧密的联系。 |
| 3 | digital nexus | `science_tech` | The digital nexus allows for unprecedented data sharing across various platforms. | 数字联系使得在各个平台之间共享数据成为可能。 |

### 22. blatant  *adj.*

| | |
| --- | --- |
| 音标 | /ˈbleɪ.tənt/ |
| 中文释义 | 公然的；明显的 |
| 英文释义 | Openly obvious or conspicuous; lacking any attempt to conceal. |
| freq_rank | 10787 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | blatant violation | `news` | Numerous reports highlighted the blatant violation of human rights in the country. | 多份报告强调了该国公然侵犯人权的行为。 |
| 2 | blatant disregard | `academic` | The study revealed a blatant disregard for ethical standards in the research process. | 研究显示在研究过程中对伦理标准的公然无视。 |
| 3 | blatant lie | `daily_life` | She told a blatant lie about her whereabouts last night that no one believed. | 她昨晚关于自己行踪的公然谎言没有人相信。 |

### 23. dummy  *n./adj.*

| | |
| --- | --- |
| 音标 | /ˈdʌmi/ |
| 中文释义 | 虚拟；假人 |
| 英文释义 | A figure representing a person, often used for display or training. |
| freq_rank | 11288 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | dummy variable | `science_tech` | Researchers often use a dummy variable in regression analysis to represent categories. | 研究人员常在回归分析中使用虚拟变量来表示类别。 |
| 2 | dummy text | `work` | Designers frequently employ dummy text to showcase layout without actual content. | 设计师常用虚拟文本展示布局，而不使用实际内容。 |
| 3 | dummy proof | `education` | The instructions are dummy proof, making them easy for anyone to follow. | 这些说明是虚拟防错的，任何人都能轻松理解。 |

### 24. cyclical  *adj.*

| | |
| --- | --- |
| 音标 | /ˈsɪk.lɪ.kəl/ |
| 中文释义 | 循环的 |
| 英文释义 | Occurring in cycles or recurring at regular intervals. |
| freq_rank | 12518 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | cyclical changes | `science_tech` | Scientists studied the cyclical changes in climate patterns over the decades. | 科学家们研究了几十年来气候模式的循环变化。 |
| 2 | cyclical process | `work` | Every fiscal year, our company undergoes a cyclical process of budget review. | 每个财政年度，我们公司都会经历一次预算审查的循环过程。 |
| 3 | cyclical trends | `culture` | Cyclical trends in fashion often lead to the revival of past styles. | 时尚中的循环趋势常常导致过去风格的复兴。 |

### 25. quartet  *n.*

| | |
| --- | --- |
| 音标 | /kwɔːrˈtɛt/ |
| 中文释义 | 四重奏 |
| 英文释义 | A musical composition for four instruments or voices. |
| freq_rank | 11286 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | string quartet | `culture` | The string quartet performed beautifully at the gala last night. | 昨晚，弦乐四重奏在晚会上表现得非常精彩。 |
| 2 | vocal quartet | `daily_life` | A vocal quartet entertained the guests during the wedding reception. | 在婚礼招待会上，一个声乐四重奏为宾客带来了娱乐。 |
| 3 | jazz quartet | `work` | Our team collaborated with a jazz quartet for the charity event. | 我们的团队与一个爵士四重奏合作举办慈善活动。 |

### 26. retrace  *v.*

| | |
| --- | --- |
| 音标 | /rɪˈtreɪs/ |
| 中文释义 | 追溯 |
| 英文释义 | To go back over or revisit a path or process. |
| freq_rank | 13708 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | retrace one's steps | `daily_life` | After realizing he was lost, John had to retrace his steps back home. | 意识到自己迷路后，约翰不得不返回他的脚步回家。 |
| 2 | retrace the history | `academic` | Researchers often retrace the history of an event to understand its causes and effects. | 研究人员经常追溯事件的历史，以理解其原因和影响。 |
| 3 | retrace the process | `science_tech` | Scientists may retrace the process of experimentation to identify any errors in their methods. | 科学家们可能会追溯实验过程，以识别他们方法中的任何错误。 |

### 27. sash  *n./v.*

| | |
| --- | --- |
| 音标 | /sæʃ/ |
| 中文释义 | 绶带；腰带 |
| 英文释义 | A band or strip of material worn around the waist or over the shoulder. |
| freq_rank | 14607 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | sash window | `culture` | Many historic buildings feature elegant sash windows that enhance their architectural beauty. | 许多历史建筑都有优雅的绶带窗，增添了建筑的美感。 |
| 2 | sash dress | `daily_life` | She wore a stunning sash dress that caught everyone's attention at the party. | 她穿着一条令人惊艳的绶带裙，吸引了派对上所有人的目光。 |
| 3 | sash cord | `work` | The technician replaced the broken sash cord to restore the window's functionality. | 技术人员更换了损坏的绶带绳，以恢复窗户的功能。 |

### 28. archer  *n.*

| | |
| --- | --- |
| 音标 | /ˈɑːr.tʃər/ |
| 中文释义 | 弓箭手 |
| 英文释义 | A person who uses a bow to shoot arrows. |
| freq_rank | 14695 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | archers compete | `culture` | During the festival, archers compete for the grand prize in front of a large audience. | 在节日期间，弓箭手在一大群观众面前争夺大奖。 |
| 2 | archers practice | `daily_life` | Every weekend, the archers practice their skills at the local range. | 每个周末，弓箭手都在当地的射箭场练习技能。 |
| 3 | archers train | `education` | Students interested in archery can join the club where archers train regularly. | 对射箭感兴趣的学生可以加入社团，弓箭手定期训练。 |

### 29. minnow  *n.*

| | |
| --- | --- |
| 音标 | /ˈmɪn.oʊ/ |
| 中文释义 | 小鱼；小型淡水鱼 |
| 英文释义 | A small freshwater fish often used as bait or food. |
| freq_rank | 14753 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | small minnows | `environment` | Small minnows thrive in clean, shallow waters rich with vegetation. | 小鱼在有丰富植被的清澈浅水中生长良好。 |
| 2 | bait minnows | `daily_life` | Fishermen often use bait minnows to attract larger fish during their trips. | 渔民在出海时常用小鱼作为饵料来吸引大鱼。 |
| 3 | school of minnows | `science_tech` | A school of minnows can indicate a healthy aquatic ecosystem in a lake. | 一群小鱼可以表明湖泊中水生生态系统的健康。 |

### 30. trajectory  *n.*

| | |
| --- | --- |
| 音标 | /trəˈdʒɛk.tə.ri/ |
| 中文释义 | 轨迹 |
| 英文释义 | The path followed by a moving object. |
| freq_rank | 7728 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | career trajectory | `work` | Many professionals analyze their career trajectories to plan future success. | 许多专业人士分析他们的职业轨迹，以规划未来的成功。 |
| 2 | orbital trajectory | `science_tech` | The satellite's orbital trajectories are determined by gravitational forces. | 卫星的轨道轨迹是由引力决定的。 |
| 3 | project trajectory | `academic` | Researchers will study the project trajectories to improve outcomes in future initiatives. | 研究人员将研究项目轨迹，以改善未来计划的结果。 |

### 31. skunk  *n./v.*

| | |
| --- | --- |
| 音标 | /skʌŋk/ |
| 中文释义 | 臭鼬 |
| 英文释义 | A North American mammal known for its strong odor. |
| freq_rank | 14568 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | skunk cabbage | `environment` | Some species of skunk cabbage thrive in wetland areas during spring. | 某些种类的臭鼬花在春季湿地区域生长良好。 |
| 2 | skunk works | `work` | The company established a skunk works project to foster innovative ideas. | 公司设立了一个臭鼬工程项目，以促进创新思维。 |
| 3 | skunk beer | `daily_life` | He discovered that skunk beer can result from improper storage conditions. | 他发现，臭鼬啤酒可能是由于储存条件不当造成的。 |

### 32. hypertension  *n.*

| | |
| --- | --- |
| 音标 | /ˌhaɪ.pɚˈtɛn.ʃən/ |
| 中文释义 | 高血压 |
| 英文释义 | A condition of abnormally high blood pressure. |
| freq_rank | 10410 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | manage hypertension | `health` | Patients often struggle to manage hypertension effectively with lifestyle changes. | 患者常常努力通过生活方式改变有效管理高血压。 |
| 2 | hypertension medication | `science_tech` | Researchers are developing new hypertension medication that targets multiple pathways. | 研究人员正在开发针对多种途径的新型高血压药物。 |
| 3 | hypertension risk | `academic` | Many factors can increase the risk of developing hypertension over time. | 许多因素会随着时间的推移增加患高血压的风险。 |

### 33. skirmish  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈskɜːr.mɪʃ/ |
| 中文释义 | 小规模冲突 |
| 英文释义 | A minor fight or conflict between groups. |
| freq_rank | 13180 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | armed skirmish | `news` | Reports indicate that an armed skirmish occurred along the border yesterday. | 报告指出，昨天边境发生了一起武装冲突。 |
| 2 | political skirmish | `academic` | The recent political skirmish highlighted deep divisions within the party. | 最近的政治冲突凸显了党内的深刻分歧。 |
| 3 | skirmish tactics | `work` | Employing effective skirmish tactics can improve team performance in project management. | 采用有效的冲突战术可以提高项目管理中的团队绩效。 |

### 34. shawl  *n./v.*

| | |
| --- | --- |
| 音标 | /ʃɔl/ |
| 中文释义 | 披肩 |
| 英文释义 | A piece of fabric worn over the shoulders for warmth or fashion. |
| freq_rank | 11627 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | wore a shawl | `daily_life` | She wore a beautiful shawl to the evening party. | 她在晚会上披上了一条美丽的披肩。 |
| 2 | shawls made of silk | `culture` | Many artisans create shawls made of silk for traditional ceremonies. | 许多工匠为传统仪式制作丝绸披肩。 |
| 3 | shawl pattern | `education` | The professor analyzed the shawl pattern used in ancient textiles. | 教授分析了古代纺织品中使用的披肩图案。 |

### 35. otter  *n.*

| | |
| --- | --- |
| 音标 | /ˈɑː.tər/ |
| 中文释义 | 水獺 |
| 英文释义 | A small, aquatic mammal known for its playful behavior. |
| freq_rank | 11888 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | river otters | `environment` | River otters often inhabit areas with abundant water and food sources. | 水獺通常栖息在水源和食物丰富的地区。 |
| 2 | sea otters | `science_tech` | Scientists study sea otters to understand their role in marine ecosystems. | 科学家研究海水獺以了解它们在海洋生态系统中的作用。 |
| 3 | otter population | `news` | The declining otter population raises concerns among wildlife conservationists. | 水獺数量的减少引发了野生动物保护者的担忧。 |

### 36. throes  *n.*

| | |
| --- | --- |
| 音标 | /θroʊz/ |
| 中文释义 | 挣扎；痛苦 |
| 英文释义 | Intense or violent struggle or pain. |
| freq_rank | 14716 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | in the throes of | `news` | The country is in the throes of a severe economic crisis. | 该国正挣扎于严重的经济危机中。 |
| 2 | throes of death | `health` | He was found in the throes of death after the accident. | 他在事故后被发现正在奄奄一息。 |
| 3 | throes of passion | `culture` | They experienced the throes of passion during their romantic getaway. | 在浪漫的假期中，他们经历了爱情的挣扎。 |

### 37. calculated  *adj.*

| | |
| --- | --- |
| 音标 | /ˈkæl.kjʊ.leɪ.tɪd/ |
| 中文释义 | 经过计算的；深思熟虑的 |
| 英文释义 | Done with careful planning and consideration of outcomes. |
| freq_rank | 12454 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | calculated risk | `work` | Taking a calculated risk can lead to significant rewards in business. | 在商业中承担经过计算的风险可以带来重大回报。 |
| 2 | calculated decision | `academic` | The researchers made a calculated decision based on their extensive data analysis. | 研究者根据他们的 extensive 数据分析做出了经过计算的决策。 |
| 3 | calculated approach | `science_tech` | Implementing a calculated approach can enhance project success rates considerably. | 实施经过计算的方法可以显著提高项目成功率。 |

### 38. intangible  *adj.*

| | |
| --- | --- |
| 音标 | /ɪnˈtæn.dʒə.bəl/ |
| 中文释义 | 无形的 |
| 英文释义 | Not able to be touched or grasped; lacking physical presence. |
| freq_rank | 13879 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | intangible assets | `work` | Companies often invest in intangible assets to enhance their market position. | 公司通常会投资于无形资产，以增强市场地位。 |
| 2 | intangible benefits | `education` | Students may receive intangible benefits from participating in extracurricular activities. | 学生参与课外活动可能会获得无形的好处。 |
| 3 | intangible cultural heritage | `culture` | Many communities strive to preserve their intangible cultural heritage for future generations. | 许多社区努力保护他们的无形文化遗产，以留给后代。 |

### 39. replete  *adj.*

| | |
| --- | --- |
| 音标 | /rɪˈpliːt/ |
| 中文释义 | 充满的；装满的 |
| 英文释义 | Filled or well-supplied with something. |
| freq_rank | 13185 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | replete with evidence | `academic` | Researchers found that the study was replete with evidence supporting their hypothesis. | 研究人员发现，这项研究充满了支持其假设的证据。 |
| 2 | replete with information | `work` | The report was replete with information that helped to clarify the project’s objectives. | 该报告充满了有助于阐明项目目标的信息。 |
| 3 | replete with nutrients | `health` | A balanced diet should be replete with nutrients essential for maintaining good health. | 均衡饮食应充满维持身体健康所需的营养成分。 |

### 40. aftermath  *n.*

| | |
| --- | --- |
| 音标 | /ˈæf.tər.mæθ/ |
| 中文释义 | 后果；余波 |
| 英文释义 | The consequences or aftereffects of an event, especially a disaster. |
| freq_rank | 5655 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | aftermath of the disaster | `news` | The aftermath of the disaster revealed extensive damage to the community. | 灾难的后果揭示了社区的广泛破坏。 |
| 2 | aftermath of the war | `academic` | Scholars study the aftermath of the war to understand its long-term effects. | 学者们研究战争的后果以理解其长期影响。 |
| 3 | aftermath of the crisis | `work` | In the aftermath of the crisis, the company implemented new safety protocols. | 危机的后果中，公司实施了新的安全协议。 |

### 41. subdued  *adj.*

| | |
| --- | --- |
| 音标 | /səbˈdjuːd/ |
| 中文释义 | 低调的；抑制的 |
| 英文释义 | Quiet and controlled, not strong or intense. |
| freq_rank | 11208 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | subdued colors | `culture` | Artists often prefer subdued colors in their paintings to create a calming effect. | 艺术家常常喜欢在画作中使用低调的颜色来营造宁静的效果。 |
| 2 | subdued atmosphere | `daily_life` | The subdued atmosphere in the café encouraged quiet conversations among patrons. | 咖啡馆中低调的氛围促使顾客之间进行安静的交流。 |
| 3 | subdued lighting | `work` | During the meeting, subdued lighting helped to maintain focus and reduce distractions. | 在会议期间，低调的灯光有助于维持专注并减少干扰。 |

### 42. temp  *n.*

| | |
| --- | --- |
| 音标 | /tɛmp/ |
| 中文释义 | 临时工 |
| 英文释义 | A temporary worker or employee for a short period. |
| freq_rank | 11941 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | temp worker | `work` | Employers often hire temp workers to handle seasonal demands effectively. | 雇主经常雇佣临时工来有效应对季节性需求。 |
| 2 | temp agency | `daily_life` | Many people find jobs through a temp agency that specializes in short-term placements. | 许多人通过一家专门提供短期职位的临时机构找到工作。 |
| 3 | temp job | `education` | Students often take a temp job during summer breaks to gain work experience. | 学生们经常在暑假期间找临时工作以获得工作经验。 |

### 43. restored  *adj.*

| | |
| --- | --- |
| 音标 | /rɪˈstɔrdəd/ |
| 中文释义 | 恢复的；修复的 |
| 英文释义 | Brought back to a former or original condition. |
| freq_rank | 11190 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | restored balance | `environment` | Ecosystems thrive when restored balance is achieved among species. | 当物种之间恢复平衡时，生态系统蓬勃发展。 |
| 2 | restored artwork | `culture` | The museum displayed several restored artworks from the Renaissance period. | 博物馆展出了几件来自文艺复兴时期的修复艺术品。 |
| 3 | restored rights | `news` | Activists are fighting to ensure restored rights for marginalized communities. | 活动人士正在努力确保被边缘化社区的权利得到恢复。 |

### 44. herbicide  *n.*

| | |
| --- | --- |
| 音标 | /ˈhɜːr.bɪ.saɪd/ |
| 中文释义 | 除草剂 |
| 英文释义 | A chemical used to kill unwanted plants. |
| freq_rank | 13857 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | selective herbicide | `environment` | Farmers often use selective herbicides to target specific weeds without harming crops. | 农民经常使用选择性除草剂来针对特定杂草，而不损害作物。 |
| 2 | systemic herbicide | `science_tech` | Researchers are studying the effects of systemic herbicides on plant health and soil quality. | 研究人员正在研究全身性除草剂对植物健康和土壤质量的影响。 |
| 3 | non-selective herbicide | `work` | The landscaping team applied a non-selective herbicide to clear the entire garden area. | 园艺团队在整个花园区域施用了非选择性除草剂。 |

### 45. stigma  *n.*

| | |
| --- | --- |
| 音标 | /ˈstɪɡ.mə/ |
| 中文释义 | 污名；耻辱 |
| 英文释义 | A mark of disgrace associated with a particular circumstance, quality, or person. |
| freq_rank | 8507 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | social stigma | `health` | Social stigma often prevents individuals from seeking necessary mental health treatment. | 社会污名常常阻碍个人寻求必要的心理健康治疗。 |
| 2 | cultural stigma | `culture` | Cultural stigma surrounding addiction can lead to feelings of shame and isolation. | 围绕成瘾的文化污名可能导致耻辱感和孤立感。 |
| 3 | stigma attached | `education` | Students may face stigma attached to their learning disabilities in academic environments. | 学生在学术环境中可能会面临与学习障碍相关的污名。 |

### 46. corrugated  *adj.*

| | |
| --- | --- |
| 音标 | /ˈkɔr.ə.ɡeɪ.tɪd/ |
| 中文释义 | 波纹状的 |
| 英文释义 | Shaped or marked by grooves or ridges. |
| freq_rank | 14635 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | corrugated metal | `work` | Workers installed corrugated metal sheets on the roof to enhance durability. | 工人们在屋顶安装了波纹金属板，以增强耐用性。 |
| 2 | corrugated cardboard | `daily_life` | Many packages are shipped in corrugated cardboard boxes to ensure protection during transit. | 许多包裹使用波纹纸箱运输，以确保在运输过程中得到保护。 |
| 3 | corrugated structure | `science_tech` | Researchers are studying the benefits of a corrugated structure in lightweight engineering materials. | 研究人员正在研究波纹结构在轻型工程材料中的好处。 |

### 47. defuse  *v.*

| | |
| --- | --- |
| 音标 | /dɪˈfjuz/ |
| 中文释义 | 化解；排除 |
| 英文释义 | To make a situation less tense or dangerous. |
| freq_rank | 12450 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | defuse a conflict | `news` | Negotiators worked tirelessly to defuse a conflict between the two nations. | 谈判代表们不懈努力以化解两国之间的冲突。 |
| 2 | defuse tensions | `work` | Management must find ways to defuse tensions among team members to improve collaboration. | 管理层必须找到方法以化解团队成员间的紧张关系，从而改善合作。 |
| 3 | defuse a bomb | `science_tech` | The technician was able to defuse a bomb safely without causing any injuries. | 技术人员成功地化解了一枚炸弹，未造成任何伤害。 |

### 48. strident  *adj.*

| | |
| --- | --- |
| 音标 | /ˈstraɪ.dənt/ |
| 中文释义 | 刺耳的；尖锐的 |
| 英文释义 | Having a loud, harsh, and grating quality. |
| freq_rank | 14944 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | strident criticism | `news` | Critics have expressed strident criticism regarding the new policy changes. | 评论家们对新的政策变更表达了刺耳的批评。 |
| 2 | strident voice | `daily_life` | She spoke in a strident voice that drew everyone's attention in the room. | 她用刺耳的声音说话，吸引了房间里每个人的注意。 |
| 3 | strident tones | `education` | The teacher used strident tones to emphasize the importance of the assignment. | 老师用刺耳的语调强调了作业的重要性。 |

### 49. aspen  *n./adj.*

| | |
| --- | --- |
| 音标 | /ˈæs.pən/ |
| 中文释义 | 白杨树 |
| 英文释义 | A type of tall tree with smooth, white bark. |
| freq_rank | 13173 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | aspen trees | `environment` | Aspen trees can be found in various mountainous regions across North America. | 白杨树可以在北美的多个山区找到。 |
| 2 | aspen groves | `travel` | Visitors often enjoy hiking through the stunning aspen groves during the fall season. | 游客们常常在秋季享受徒步穿越迷人的白杨林。 |
| 3 | aspen leaves | `culture` | The vibrant colors of aspen leaves attract many artists seeking inspiration. | 白杨树叶的鲜艳色彩吸引了许多寻求灵感的艺术家。 |

### 50. entourage  *n.*

| | |
| --- | --- |
| 音标 | /ˈɒntʊrɑːʒ/ |
| 中文释义 | 随行人员；随扈 |
| 英文释义 | A group of attendants or associates accompanying an important person. |
| freq_rank | 11325 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | celebrity entourage | `culture` | Celebrities often travel with a large entourage for security and support. | 明星通常会带着庞大的随行人员来保障安全和提供支持。 |
| 2 | political entourage | `news` | The politician arrived at the event with an entourage of advisors and security. | 这位政治家带着一群顾问和保安抵达活动现场。 |
| 3 | royal entourage | `travel` | Tourists were excited to catch a glimpse of the royal entourage during their visit. | 游客们在参观期间兴奋地想一睹王室随行人员的风采。 |

### 51. defined  *adj.*

| | |
| --- | --- |
| 音标 | /dɪˈfaɪnd/ |
| 中文释义 | 明确定义的 |
| 英文释义 | Clearly marked or established; not vague or ambiguous. |
| freq_rank | 13586 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | clearly defined | `academic` | Research objectives must be clearly defined to guide the project effectively. | 研究目标必须明确定义，以有效指导项目。 |
| 2 | poorly defined | `science_tech` | Inadequate methodologies lead to poorly defined outcomes in scientific studies. | 不充分的方法论导致科学研究中结果的定义不明确。 |
| 3 | well defined | `work` | Success criteria should be well defined before starting any new project. | 在开始任何新项目之前，成功标准应该明确定义。 |

### 52. tattered  *adj.*

| | |
| --- | --- |
| 音标 | /ˈtæt.ɚd/ |
| 中文释义 | 破烂的 |
| 英文释义 | Old and torn; in poor condition due to age or use. |
| freq_rank | 10444 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | tattered clothes | `daily_life` | She donated her tattered clothes to help those in need. | 她把破烂的衣服捐给了需要帮助的人。 |
| 2 | tattered flag | `culture` | The tattered flag flapped in the wind, symbolizing resilience and history. | 那面破烂的旗帜在风中飘扬，象征着韧性与历史。 |
| 3 | tattered book | `education` | He found a tattered book in the library that contained rare historical insights. | 他在图书馆找到一本破旧的书，里面包含了珍贵的历史见解。 |

### 53. epithet  *n.*

| | |
| --- | --- |
| 音标 | /ˈɛp.ɪ.θɛt/ |
| 中文释义 | 修饰语；表述词 |
| 英文释义 | A descriptive term or phrase expressing a quality or attribute. |
| freq_rank | 14731 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | derogatory epithet | `news` | Politicians often resort to derogatory epithets during heated debates. | 在激烈的辩论中，政治家们经常诉诸贬义的修饰语。 |
| 2 | racial epithet | `culture` | Using a racial epithet can lead to serious consequences in society. | 使用种族修饰语可能会在社会中导致严重后果。 |
| 3 | literary epithet | `academic` | A literary epithet often enhances the vividness of descriptions in poetry. | 文学修饰语常常增强诗歌中描述的生动性。 |

### 54. almond  *n.*

| | |
| --- | --- |
| 音标 | /ˈɑːl.mənd/ |
| 中文释义 | 杏仁 |
| 英文释义 | A type of edible nut with a hard shell. |
| freq_rank | 7510 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | almond milk | `daily_life` | Many people prefer almond milk over regular dairy milk for its taste. | 很多人更喜欢杏仁奶而不是普通牛奶，因为它的味道。 |
| 2 | almond butter | `health` | Athletes often use almond butter as a healthy source of energy. | 运动员常常把杏仁酱作为健康的能量来源。 |
| 3 | bitter almonds | `science_tech` | Bitter almonds contain cyanide and should not be consumed raw. | 苦杏仁含有氰化物，不能生吃。 |

### 55. blockade  *n./v.*

| | |
| --- | --- |
| 音标 | /blɒkˈeɪd/ |
| 中文释义 | 封锁；阻碍 |
| 英文释义 | An act of obstructing or sealing off an area, preventing access. |
| freq_rank | 11548 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | naval blockade | `news` | The government imposed a naval blockade to prevent supplies from entering the region. | 政府实施了海上封锁，以阻止物资进入该地区。 |
| 2 | economic blockade | `academic` | Scholars have studied the effects of economic blockade on international relations. | 学者们研究了经济封锁对国际关系的影响。 |
| 3 | humanitarian blockade | `culture` | Activists protested against the humanitarian blockade affecting vulnerable populations. | 活动人士抗议影响弱势群体的人道主义封锁。 |

### 56. fang  *n.*

| | |
| --- | --- |
| 音标 | /fæŋ/ |
| 中文释义 | 犬牙 |
| 英文释义 | A long, pointed tooth, especially in carnivorous animals. |
| freq_rank | 14276 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | fangs of a snake | `science_tech` | Researchers study the fangs of a snake to understand their venom delivery mechanism. | 研究人员研究蛇的犬牙以了解它们的毒液传递机制。 |
| 2 | sharp fangs | `daily_life` | He noticed the sharp fangs glistening in the moonlight during his hike. | 在他的远足中，他注意到月光下闪闪发光的锐利犬牙。 |
| 3 | fangs of a vampire | `culture` | In horror films, the fangs of a vampire are often exaggerated for dramatic effect. | 在恐怖电影中，吸血鬼的犬牙常常被夸张以达到戏剧效果。 |

### 57. muffle  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈmʌf.əl/ |
| 中文释义 | 消音；减弱声音 |
| 英文释义 | To deaden or reduce the intensity of sound. |
| freq_rank | 13309 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | muffle the sound | `daily_life` | Children often muffle the sound of their laughter when playing hide and seek. | 孩子们在玩捉迷藏时常常压低笑声。 |
| 2 | muffle a scream | `news` | Witnesses reported that she tried to muffle a scream during the incident. | 目击者报告称，她在事件中试图压抑尖叫。 |
| 3 | muffle noise | `work` | To improve concentration, some workers prefer to muffle noise with headphones. | 为了提高专注力，有些员工喜欢用耳机来隔音。 |

### 58. prognosis  *n.*

| | |
| --- | --- |
| 音标 | /prɒɡˈnoʊ.sɪs/ |
| 中文释义 | 预后 |
| 英文释义 | A forecast or prediction about the likely outcome of a situation. |
| freq_rank | 11704 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | medical prognosis | `health` | Doctors provided a positive prognosis for the patient's recovery after treatment. | 医生对患者治疗后的恢复做出了积极的预后。 |
| 2 | long-term prognosis | `science_tech` | Scientists have determined the long-term prognosis for climate change is concerning. | 科学家们已确定气候变化的长期预后令人担忧。 |
| 3 | poor prognosis | `news` | The report revealed a poor prognosis for the struggling economy in 2023. | 报告显示2023年疲软经济的预后不佳。 |

### 59. dabble  *v.*

| | |
| --- | --- |
| 音标 | /ˈdæb.əl/ |
| 中文释义 | 涉猎；浅尝辄止 |
| 英文释义 | To take part in an activity in a casual or superficial way. |
| freq_rank | 14779 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | dabble in art | `culture` | Many young adults dabble in art during their free time to explore creativity. | 许多年轻人在业余时间涉猎艺术，以探索创造力。 |
| 2 | dabble in science | `education` | Students often dabble in science projects to enhance their learning experience. | 学生们经常涉猎科学项目，以提升他们的学习体验。 |
| 3 | dabble in business | `work` | Entrepreneurs might dabble in business ventures before committing fully to one. | 创业者在完全投入某个项目之前，可能会涉猎多个商业创意。 |

### 60. whine  *n./v.*

| | |
| --- | --- |
| 音标 | /waɪn/ |
| 中文释义 | 抱怨；哀鸣 |
| 英文释义 | To make a high-pitched, complaining sound or expression. |
| freq_rank | 7913 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | whine about | `daily_life` | Children often whine about having to do their homework. | 孩子们常常抱怨要做家庭作业。 |
| 2 | whine of | `work` | The whine of the machines made it difficult to concentrate on tasks. | 机器的嗡嗡声使得专注于任务变得困难。 |
| 3 | whine of pain | `health` | He let out a soft whine of pain after twisting his ankle. | 他扭伤脚踝后发出轻微的痛苦呻吟。 |

### 61. metaphysics  *n.*

| | |
| --- | --- |
| 音标 | /ˌmɛtəˈfɪzɪks/ |
| 中文释义 | 形而上学 |
| 英文释义 | A branch of philosophy exploring fundamental nature of reality. |
| freq_rank | 14929 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | metaphysics research | `academic` | Researchers are conducting extensive studies on metaphysics and its implications. | 研究人员正在进行形而上学及其影响的广泛研究。 |
| 2 | metaphysics theories | `science_tech` | Various metaphysics theories attempt to explain the nature of existence. | 各种形而上学理论试图解释存在的本质。 |
| 3 | metaphysics discussions | `culture` | Philosophers engage in deep metaphysics discussions during their conferences. | 哲学家在会议期间进行深入的形而上学讨论。 |

### 62. reinstate  *v.*

| | |
| --- | --- |
| 音标 | /ˌriːɪnˈsteɪt/ |
| 中文释义 | 恢复；重建 |
| 英文释义 | To restore someone or something to a previous position or condition. |
| freq_rank | 10892 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | reinstate the policy | `work` | The management decided to reinstate the policy after considering employee feedback. | 管理层在考虑员工反馈后决定恢复该政策。 |
| 2 | reinstate the benefits | `academic` | Researchers aim to reinstate the benefits of traditional teaching methods in modern classrooms. | 研究人员旨在在现代课堂上恢复传统教学方法的好处。 |
| 3 | reinstate the position | `news` | After the investigation, the official will reinstate the position he lost due to allegations. | 调查后，该官员将恢复因指控而失去的职位。 |

### 63. scourge  *n./v.*

| | |
| --- | --- |
| 音标 | /skɜrdʒ/ |
| 中文释义 | 灾难；祸害 |
| 英文释义 | A person or thing that causes great trouble or suffering. |
| freq_rank | 14709 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | social scourge | `news` | Social scourges often lead to significant public health challenges and economic burdens. | 社会祸害往往导致重大的公共健康挑战和经济负担。 |
| 2 | scourge of poverty | `academic` | Addressing the scourge of poverty requires comprehensive policy reforms and community engagement. | 解决贫困祸害需要全面的政策改革和社区参与。 |
| 3 | scourge of war | `culture` | The scourge of war has left lasting scars on generations of affected communities. | 战争的祸害给受影响的社区的几代人留下了持久的伤痕。 |

### 64. dysfunctional  *adj.*

| | |
| --- | --- |
| 音标 | /dɪsˈfʌŋkʃənl/ |
| 中文释义 | 失调的；功能障碍的 |
| 英文释义 | Not functioning normally or effectively. |
| freq_rank | 9869 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | dysfunctional family | `daily_life` | Many children struggle in school due to their dysfunctional family situations. | 许多孩子因为功能失调的家庭环境而在学校表现不佳。 |
| 2 | dysfunctional relationship | `culture` | She decided to end her dysfunctional relationship after years of unhappiness. | 经过多年的不快乐，她决定结束这段功能失调的关系。 |
| 3 | dysfunctional organization | `work` | The team failed to meet its goals because it was part of a dysfunctional organization. | 这个团队未能实现目标，因为它属于一个失调的组织。 |

### 65. felony  *n.*

| | |
| --- | --- |
| 音标 | /ˈfɛl.ə.ni/ |
| 中文释义 | 重罪 |
| 英文释义 | A serious crime punishable by severe penalties. |
| freq_rank | 7233 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | felonies committed | `news` | Authorities are cracking down on felonies committed by organized crime groups. | 当局正在打击有组织犯罪团伙所犯的重罪。 |
| 2 | conviction of a felony | `work` | A conviction of a felony can affect your employment opportunities significantly. | 重罪定罪会严重影响你的就业机会。 |
| 3 | felony charges | `academic` | Research indicates that felony charges often lead to long-term consequences for individuals. | 研究表明，重罪指控通常会给个人带来长期后果。 |

### 66. authenticity  *n.*

| | |
| --- | --- |
| 音标 | /ɔːˈθentɪsɪti/ |
| 中文释义 | 真实性 |
| 英文释义 | The quality of being genuine or real, not false. |
| freq_rank | 8177 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | cultural authenticity | `culture` | Many travelers seek cultural authenticity when visiting new countries. | 许多旅行者在访问新国家时寻求文化的真实性。 |
| 2 | authenticity of documents | `work` | Employees must verify the authenticity of documents before processing them. | 员工在处理文件之前，必须验证文件的真实性。 |
| 3 | authenticity in art | `daily_life` | Art critics often debate the authenticity in contemporary artworks. | 艺术评论家经常讨论当代艺术作品的真实性。 |

### 67. sprig  *n./v.*

| | |
| --- | --- |
| 音标 | /sprɪɡ/ |
| 中文释义 | 细枝；嫩芽 |
| 英文释义 | A small stem or branch that is typically green. |
| freq_rank | 10342 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | sprig of mint | `daily_life` | A sprig of mint can enhance the flavor of many dishes. | 一根薄荷枝可以提升许多菜肴的风味。 |
| 2 | sprigs of thyme | `culture` | Cooks often add sprigs of thyme to improve the aroma of soups. | 厨师们常常加入几根百里香以改善汤的香气。 |
| 3 | sprig of parsley | `health` | Adding a sprig of parsley can boost the nutritional value of your meal. | 加入一根香菜可以提升你餐点的营养价值。 |

### 68. floppy  *adj.*

| | |
| --- | --- |
| 音标 | /ˈflɑː.pi/ |
| 中文释义 | 松软的；无力的 |
| 英文释义 | Lacking stiffness or firmness; loosely hanging or drooping. |
| freq_rank | 12505 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | floppy disk | `science_tech` | Old computers often used a floppy disk to save data. | 老式电脑通常使用软盘来保存数据。 |
| 2 | floppy hat | `daily_life` | Wearing a floppy hat provides excellent sun protection during summer outings. | 佩戴松软的帽子在夏季出游时能提供很好的防晒保护。 |
| 3 | floppy ears | `culture` | The dog with floppy ears won the best-in-show award at the competition. | 那只耳朵松软的狗在比赛中获得了最佳表演奖。 |

### 69. interplay  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈɪn.tə.pleɪ/ |
| 中文释义 | 相互作用；相互影响 |
| 英文释义 | The mutual influence or interaction between two or more entities. |
| freq_rank | 11797 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | interplay of factors | `science_tech` | Scientists study the interplay of factors affecting climate change. | 科学家研究影响气候变化的因素之间的相互作用。 |
| 2 | interplay between cultures | `culture` | The interplay between cultures can lead to greater understanding and tolerance. | 文化之间的相互作用可以增进理解与包容。 |
| 3 | interplay in education | `education` | Teachers recognize the interplay in education between knowledge and critical thinking skills. | 教师意识到教育中知识与批判性思维技能之间的相互作用。 |

### 70. monolithic  *adj.*

| | |
| --- | --- |
| 音标 | /ˌmɒn.əˈlɪθ.ɪk/ |
| 中文释义 | 单一的；庞大的 |
| 英文释义 | Characterized by a large and indivisible structure or unit. |
| freq_rank | 14354 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | monolithic structure | `science_tech` | Engineers often face challenges when designing monolithic structures that resist earthquakes. | 工程师在设计抵抗地震的单一结构时常常面临挑战。 |
| 2 | monolithic approach | `academic` | Adopting a monolithic approach in research can overlook diverse perspectives and complexities. | 在研究中采取单一的方法可能会忽视多样的视角和复杂性。 |
| 3 | monolithic organization | `work` | Many employees feel constrained by the monolithic organization and its rigid hierarchy. | 许多员工感到受到单一组织及其僵化等级制度的限制。 |

### 71. sublime  *adj./v./n.*

| | |
| --- | --- |
| 音标 | /səˈblaɪm/ |
| 中文释义 | 崇高的；宏伟的 |
| 英文释义 | Of great beauty or excellence, inspiring admiration. |
| freq_rank | 10377 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | sublime beauty | `culture` | Witnessing the sublime beauty of the sunrise was a transformative experience. | 目睹日出崇高的美丽是一种改变人生的体验。 |
| 2 | sublime music | `daily_life` | Listening to sublime music can elevate one's mood significantly. | 聆听崇高的音乐可以显著提升一个人的情绪。 |
| 3 | sublime nature | `travel` | The sublime nature of the mountains left the hikers in awe during their journey. | 在徒步旅行中，山脉的崇高自然让远足者感到敬畏。 |

### 72. veneer  *n./v.*

| | |
| --- | --- |
| 音标 | /vəˈnɪr/ |
| 中文释义 | 表面；外观 |
| 英文释义 | A thin layer applied to a surface for appearance. |
| freq_rank | 13417 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | wood veneer | `work` | Furniture often features a wood veneer that enhances its aesthetic appeal. | 家具通常采用木质表面，增强其美观。 |
| 2 | veneer of sophistication | `culture` | Many brands create a veneer of sophistication to attract a wealthy clientele. | 许多品牌营造出一种精致的外观，以吸引富裕客户。 |
| 3 | veneer of respectability | `news` | He maintained a veneer of respectability despite his questionable actions. | 尽管他的行为可疑，他仍保持着体面的外表。 |

### 73. gully  *n.*

| | |
| --- | --- |
| 音标 | /ˈɡʌli/ |
| 中文释义 | 溪谷 |
| 英文释义 | A deep, narrow ravine, typically with steep sides. |
| freq_rank | 13639 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | drainage gully | `environment` | Drainage gullies are essential for preventing waterlogging in agricultural fields. | 排水沟在农田中防止水涝至关重要。 |
| 2 | gully erosion | `science_tech` | Gully erosion can significantly impact soil fertility and crop yields. | 沟蚀会严重影响土壤肥力和作物产量。 |
| 3 | gully system | `work` | The engineers designed a gully system to manage stormwater effectively. | 工程师们设计了一个沟渠系统以有效管理暴雨水。 |

### 74. parable  *n.*

| | |
| --- | --- |
| 音标 | /ˈpɛr.ə.bəl/ |
| 中文释义 | 寓言 |
| 英文释义 | A simple story used to illustrate a moral or spiritual lesson. |
| freq_rank | 12932 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | moral parable | `culture` | Many cultures have their own moral parables that convey important life lessons. | 许多文化都有自己的道德寓言，用于传达重要的人生教训。 |
| 2 | biblical parable | `education` | The professor explained a biblical parable to help students understand its deeper meaning. | 教授解释了一个圣经寓言，以帮助学生理解其更深层的含义。 |
| 3 | famous parable | `daily_life` | She often refers to a famous parable whenever discussing ethical dilemmas with her friends. | 每当和朋友讨论伦理困境时，她常常提到一个著名的寓言。 |

### 75. interchangeable  *adj.*

| | |
| --- | --- |
| 音标 | /ˌɪntərˈtʃeɪndʒəbl/ |
| 中文释义 | 可互换的；可替代的 |
| 英文释义 | Able to be exchanged or replaced without losing functionality. |
| freq_rank | 14996 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | interchangeable parts | `work` | Engineers designed the machines to use interchangeable parts for easier repairs. | 工程师设计的机器使用可互换的零件，以便于维修。 |
| 2 | interchangeable symbols | `education` | Mathematical equations often include interchangeable symbols to represent variables. | 数学方程中通常包含可互换的符号来表示变量。 |
| 3 | interchangeable roles | `culture` | In many modern families, parents share interchangeable roles in child-rearing. | 在许多现代家庭中，父母在育儿方面共享可互换的角色。 |

### 76. surrogate  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈsɜr.ə.ɡət/ |
| 中文释义 | 替代者；代理人 |
| 英文释义 | A person or thing acting as a substitute for another. |
| freq_rank | 8901 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | surrogate mother | `daily_life` | A surrogate mother carries a baby for another person or couple. | 一位代孕母亲为另一个人或夫妇怀孕。 |
| 2 | surrogate decision-maker | `work` | Healthcare providers often consult surrogate decision-makers for patients unable to communicate. | 医疗提供者通常会咨询无法沟通的患者的代理决策者。 |
| 3 | surrogate key | `science_tech` | In databases, a surrogate key uniquely identifies a record without meaning. | 在数据库中，代替键在没有实际意义的情况下唯一标识一条记录。 |

### 77. pun  *n./v.*

| | |
| --- | --- |
| 音标 | /pʌn/ |
| 中文释义 | 双关语；说谐音梗 |
| 英文释义 | A humorous play on words, often exploiting multiple meanings. |
| freq_rank | 12887 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | make a pun | `daily_life` | During dinner, someone decided to make a pun about the food served. | 晚餐时，有人决定说个关于食物的双关语。 |
| 2 | pun intended | `culture` | After telling the joke, she added, pun intended, to emphasize the wordplay. | 讲完笑话后，她补充道，双关语是故意的，以强调这个文字游戏。 |
| 3 | bad pun | `news` | The article criticized the comedian for his bad pun during the live show. | 这篇文章批评了这位喜剧演员在现场表演中说的冷笑话。 |

### 78. innocence  *n.*

| | |
| --- | --- |
| 音标 | /ˈɪn.ə.səns/ |
| 中文释义 | 清白；无罪 |
| 英文释义 | The state of being free from guilt or sin. |
| freq_rank | 5397 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | the innocence of youth | `daily_life` | Many believe in the innocence of youth, which shapes their future positively. | 许多人相信年轻人的清白，这将积极塑造他们的未来。 |
| 2 | to protect innocence | `education` | Teachers have a duty to protect innocence in young children during their development. | 教师有责任在儿童成长过程中保护他们的清白。 |
| 3 | restore innocence | `news` | The court aims to restore innocence to those wrongfully convicted of crimes. | 法庭旨在恢复那些被错误定罪者的清白。 |

### 79. ecstatic  *n./adj.*

| | |
| --- | --- |
| 音标 | /ɪkˈstætɪk/ |
| 中文释义 | 狂喜的 |
| 英文释义 | Feeling or expressing overwhelming happiness or joyful excitement. |
| freq_rank | 10382 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | ecstatic fans | `culture` | The ecstatic fans celebrated their team's victory long into the night. | 狂喜的球迷们欢庆他们球队的胜利，直到深夜。 |
| 2 | ecstatic response | `news` | An ecstatic response from the audience followed the performance of the renowned artist. | 著名艺术家的表演引发了观众的狂喜反应。 |
| 3 | ecstatic moment | `daily_life` | She felt an ecstatic moment when her best friend surprised her with a birthday party. | 当她的好友为她举办生日派对时，她感到无比欢喜。 |

### 80. inscription  *n.*

| | |
| --- | --- |
| 音标 | /ɪnˈskrɪp.ʃən/ |
| 中文释义 | 铭文 |
| 英文释义 | Text engraved or printed on a surface. |
| freq_rank | 8978 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | historical inscriptions | `culture` | Historians study ancient historical inscriptions to understand past societies. | 历史学家研究古代的铭文，以了解过去的社会。 |
| 2 | epitaph inscription | `daily_life` | Many families choose meaningful words for their loved one's epitaph inscription. | 许多家庭为逝去亲人的铭文选择有意义的话语。 |
| 3 | inscription found | `science_tech` | An inscription found in the ruins revealed new information about ancient civilizations. | 在遗迹中发现的铭文揭示了关于古代文明的新信息。 |

### 81. asparagus  *n.*

| | |
| --- | --- |
| 音标 | /əˈspær.ə.ɡəs/ |
| 中文释义 | 芦笋 |
| 英文释义 | A green vegetable with long, thin stalks. |
| freq_rank | 9304 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | asparagus salad | `daily_life` | Many people enjoy a fresh asparagus salad during summer. | 许多人在夏天喜欢吃新鲜的芦笋沙拉。 |
| 2 | roasted asparagus | `culture` | Chefs often recommend roasted asparagus as a delicious side dish. | 厨师们常推荐将芦笋烤制作为美味的配菜。 |
| 3 | asparagus spears | `health` | Eating asparagus spears can provide essential vitamins and minerals. | 食用芦笋可以提供必需的维生素和矿物质。 |

### 82. resilient  *adj.*

| | |
| --- | --- |
| 音标 | /rɪˈzɪl.jənt/ |
| 中文释义 | 有弹性的；适应力强的 |
| 英文释义 | Able to recover quickly from difficult conditions. |
| freq_rank | 10634 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | resilient communities | `culture` | Many communities have proven to be resilient in the face of adversity. | 许多社区在逆境面前展现出了韧性。 |
| 2 | resilient economy | `news` | Experts predict that the resilient economy will bounce back after the recession. | 专家预测，韧性的经济将在衰退后复苏。 |
| 3 | resilient materials | `science_tech` | Researchers are developing resilient materials for more durable engineering applications. | 研究人员正在开发更耐用的工程应用材料。 |

### 83. collected  *adj.*

| | |
| --- | --- |
| 音标 | /kəˈlɛk.tɪd/ |
| 中文释义 | 收集的；聚集的 |
| 英文释义 | Gathered or brought together from various sources. |
| freq_rank | 14084 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | collected data | `science_tech` | Researchers have collected data from multiple experiments to analyze the results. | 研究人员已从多个实验中收集数据以分析结果。 |
| 2 | collected works | `culture` | The museum features an exhibition of collected works from renowned artists worldwide. | 该博物馆展出了来自全球著名艺术家的作品汇展。 |
| 3 | collected items | `daily_life` | She proudly displayed her collected items from various countries on the shelf. | 她自豪地在架子上展示了来自不同国家的收藏品。 |

### 84. cinder  *n.*

| | |
| --- | --- |
| 音标 | /ˈsɪn.dɚ/ |
| 中文释义 | 余烬 |
| 英文释义 | Small pieces of partially burned material or ash. |
| freq_rank | 14664 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | cinder block | `work` | Construction workers often use cinder blocks for building durable walls. | 建筑工人经常使用余烬砖来建造耐用的墙壁。 |
| 2 | cinder path | `daily_life` | Many parks feature a cinder path for walking and jogging enthusiasts. | 许多公园设有余烬小道，供散步和慢跑爱好者使用。 |
| 3 | cinder ash | `environment` | Cinder ash can affect soil quality and local vegetation growth. | 余烬灰可能会影响土壤质量和当地植被的生长。 |

### 85. plaque  *n.*

| | |
| --- | --- |
| 音标 | /plæk/ |
| 中文释义 | 菌斑；牙菌斑 |
| 英文释义 | A sticky deposit on teeth containing bacteria. |
| freq_rank | 7009 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | dental plaque | `health` | Effective brushing can help reduce dental plaque buildup. | 有效的刷牙可以帮助减少牙菌斑的堆积。 |
| 2 | plaque formation | `science_tech` | Researchers studied the mechanisms of plaque formation in arteries. | 研究人员研究了动脉中菌斑形成的机制。 |
| 3 | plaque removal | `daily_life` | Using mouthwash can aid in plaque removal after meals. | 使用漱口水可以帮助餐后去除牙菌斑。 |

### 86. earring  *n.*

| | |
| --- | --- |
| 音标 | /ˈɪər.ɪŋ/ |
| 中文释义 | 耳环 |
| 英文释义 | A piece of jewelry worn on the ear. |
| freq_rank | 6973 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | gold earrings | `daily_life` | She bought a beautiful pair of gold earrings yesterday. | 她昨天买了一对美丽的金耳环。 |
| 2 | hoop earrings | `culture` | Many celebrities are now wearing large hoop earrings at events. | 许多名人在活动中佩戴大型圈形耳环。 |
| 3 | dangling earrings | `work` | He prefers wearing dangling earrings during his casual office days. | 他喜欢在休闲的办公室日子里佩戴垂坠耳环。 |

### 87. fillet  *n./v.*

| | |
| --- | --- |
| 音标 | /fɪˈleɪ/ |
| 中文释义 | 鱼片；去骨肉片 |
| 英文释义 | A boneless piece of meat or fish, often cooked. |
| freq_rank | 10721 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | salmon fillet | `daily_life` | Many people enjoy grilling a salmon fillet during summer barbecues. | 许多人喜欢在夏季烧烤时烤三文鱼片。 |
| 2 | chicken fillet | `work` | The chef prepared a chicken fillet with a flavorful sauce for the special dinner. | 厨师为特别晚餐准备了一份美味的鸡肉片。 |
| 3 | beef fillet | `culture` | A tender beef fillet is often considered a delicacy in fine dining. | 嫩滑的牛肉片通常被视为高档餐饮中的美味佳肴。 |

### 88. pecan  *n.*

| | |
| --- | --- |
| 音标 | /pɪˈkæn/ |
| 中文释义 | 山核桃 |
| 英文释义 | A type of nut from a hickory tree. |
| freq_rank | 8286 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | pecan pie | `culture` | Many families enjoy pecan pie during the holiday season. | 许多家庭在节日期间享用山核桃派。 |
| 2 | toasted pecans | `daily_life` | Adding toasted pecans enhances the flavor of the salad. | 加入烤山核桃能提升沙拉的味道。 |
| 3 | pecan tree | `environment` | The pecan tree thrives in warm climates and requires well-drained soil. | 山核桃树在温暖气候中生长良好，需排水良好的土壤。 |

### 89. painkiller  *n.*

| | |
| --- | --- |
| 音标 | /ˈpeɪnˌkɪl.ər/ |
| 中文释义 | 止痛药 |
| 英文释义 | A substance used to relieve pain. |
| freq_rank | 13003 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | over-the-counter painkillers | `health` | Many people rely on over-the-counter painkillers for mild headaches. | 很多人依靠非处方止痛药来缓解轻微头痛。 |
| 2 | prescription painkillers | `daily_life` | Doctors sometimes prescribe stronger prescription painkillers for chronic pain management. | 医生有时会开具更强的止痛药来管理慢性疼痛。 |
| 3 | painkiller addiction | `news` | The rise of painkiller addiction has sparked a nationwide public health crisis. | 止痛药成瘾的增加引发了全国性的公共卫生危机。 |

### 90. fumble  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈfʌm.bəl/ |
| 中文释义 | 失误；笨拙的行为 |
| 英文释义 | To drop or handle something clumsily or to make a mistake. |
| freq_rank | 7872 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | fumble during a presentation | `academic` | Participants often fumble during a presentation due to nerves. | 参与者在演讲时由于紧张常常会失误。 |
| 2 | fumble with the keys | `daily_life` | He fumbled with the keys before finally unlocking the door. | 他在钥匙上失误，最终才打开了门。 |
| 3 | fumble in the interview | `work` | Candidates may fumble in the interview if they are unprepared. | 如果候选人没有准备好，他们在面试中可能会失误。 |

### 91. understate  *v.*

| | |
| --- | --- |
| 音标 | /ˈʌn.dɚ.steɪt/ |
| 中文释义 | 低估 |
| 英文释义 | To describe something as less important or serious than it is. |
| freq_rank | 12982 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | understate the importance | `academic` | Research often tends to understate the importance of social factors in learning. | 研究常常低估社会因素在学习中的重要性。 |
| 2 | understate the risks | `health` | Doctors should not understate the risks associated with this treatment method. | 医生不应低估这种治疗方法所涉及的风险。 |
| 3 | understate the challenges | `work` | Many leaders tend to understate the challenges faced by their teams. | 许多领导往往低估他们团队面临的挑战。 |

### 92. militia  *n.*

| | |
| --- | --- |
| 音标 | /məˈlɪʃ.ə/ |
| 中文释义 | 民兵 |
| 英文释义 | A military force composed of ordinary citizens. |
| freq_rank | 4998 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | armed militia | `news` | Armed militias often become a significant concern for local authorities during conflicts. | 在冲突期间，武装民兵通常是地方当局的一大忧虑。 |
| 2 | local militia | `daily_life` | Local militias sometimes engage in community protection efforts against criminal groups. | 地方民兵有时会参与保护社区，抵御犯罪团伙。 |
| 3 | militia groups | `academic` | Research indicates that militia groups can influence regional political dynamics significantly. | 研究表明，民兵组织可以显著影响地区政治动态。 |

### 93. ethos  *n.*

| | |
| --- | --- |
| 音标 | /ˈiː.θɒs/ |
| 中文释义 | 伦理；精神 |
| 英文释义 | The characteristic spirit or values of a community or individual. |
| freq_rank | 11241 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | professional ethos | `work` | Many employees uphold a strong professional ethos in their daily tasks. | 许多员工在日常工作中坚持强烈的职业伦理。 |
| 2 | cultural ethos | `culture` | The cultural ethos of the community is reflected in their traditional festivals. | 这个社区的文化精神体现在他们的传统节日中。 |
| 3 | academic ethos | `education` | An academic ethos promotes critical thinking and intellectual curiosity among students. | 学术精神促进学生的批判性思维和求知欲。 |

### 94. syringe  *n./v.*

| | |
| --- | --- |
| 音标 | /sɪˈrɪndʒ/ |
| 中文释义 | 注射器；针筒 |
| 英文释义 | A device used to inject fluids into or withdraw fluids from the body. |
| freq_rank | 10644 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | syringe injection | `health` | Healthcare professionals often use a syringe injection to administer vaccines. | 医疗专业人员通常使用注射器注射疫苗。 |
| 2 | syringe needle | `science_tech` | A syringe needle should be disposed of properly to prevent injuries. | 注射器针应妥善处理，以防止受伤。 |
| 3 | syringe pump | `work` | The lab technician calibrated the syringe pump for precise medication delivery. | 实验室技术员为精确的药物输送校准了注射器泵。 |

### 95. nascent  *adj.*

| | |
| --- | --- |
| 音标 | /ˈneɪ.sənt/ |
| 中文释义 | 初始的；萌芽的 |
| 英文释义 | In an early stage of development or existence. |
| freq_rank | 13253 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | nascent industry | `work` | Numerous stakeholders are investing in the nascent industry of renewable energy. | 众多利益相关者正在投资于可再生能源的初始产业。 |
| 2 | nascent technology | `science_tech` | Researchers are exploring the implications of nascent technology in artificial intelligence. | 研究人员正在探讨初始技术在人工智能中的影响。 |
| 3 | nascent movement | `culture` | Activists are rallying support for the nascent movement advocating for climate change awareness. | 活动人士正在为倡导气候变化意识的初始运动争取支持。 |

### 96. reminisce  *v.*

| | |
| --- | --- |
| 音标 | /ˌrɛm.ɪˈnɪs/ |
| 中文释义 | 怀旧；回忆 |
| 英文释义 | To recall past experiences or events with fondness. |
| freq_rank | 13731 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | reminisce about childhood | `daily_life` | Many people often reminisce about childhood memories during family gatherings. | 许多人在家庭聚会上常常怀念童年的回忆。 |
| 2 | reminisce about past experiences | `culture` | During the reunion, friends reminisce about past experiences they shared in college. | 在聚会上，朋友们怀念他们在大学时分享的往事。 |
| 3 | reminisce fondly | `education` | Teachers and students alike reminisce fondly about the school's rich history. | 老师和学生们都怀念学校悠久的历史。 |

### 97. mite  *n.*

| | |
| --- | --- |
| 音标 | /maɪt/ |
| 中文释义 | 小虫，微小的生物 |
| 英文释义 | A very small insect or arachnid, often parasitic. |
| freq_rank | 12112 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | dust mites | `daily_life` | Dust mites can trigger allergic reactions in many individuals. | 尘螨会引发许多人的过敏反应。 |
| 2 | scabies mite | `health` | The scabies mite burrows into the skin, causing intense itching. | 疥虫会钻入皮肤，导致强烈瘙痒。 |
| 3 | spider mite | `science_tech` | Spider mites often damage plants by sucking their sap. | 蜘蛛螨常通过吸取植物的汁液来造成损害。 |

### 98. fodder  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈfɑː.dər/ |
| 中文释义 | 饲料；草料 |
| 英文释义 | Animal feed, especially dried hay or straw. |
| freq_rank | 12879 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | animal fodder | `daily_life` | Farmers often purchase high-quality animal fodder to ensure their livestock thrive. | 农民经常购买高质量的饲料，以确保他们的牲畜健康成长。 |
| 2 | fodder for thought | `academic` | This research provides ample fodder for thought concerning climate change policies. | 这项研究为气候变化政策提供了充足的思考材料。 |
| 3 | fodder crops | `environment` | Diversifying with fodder crops can improve soil health and reduce erosion. | 种植饲料作物可以改善土壤健康，减少侵蚀。 |

### 99. sliver  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈslɪ.vər/ |
| 中文释义 | 细片；薄片 |
| 英文释义 | A small, thin piece broken off from something larger. |
| freq_rank | 11156 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | slivers of light | `daily_life` | Sunlight filtered through the trees, creating slivers of light on the ground. | 阳光透过树木，地面上出现了细片光线。 |
| 2 | a sliver of hope | `news` | Despite the challenges, there remains a sliver of hope for peace negotiations. | 尽管面临挑战，但和平谈判仍然存在一线希望。 |
| 3 | sliver of glass | `science_tech` | The technician found a sliver of glass embedded in the device's mechanism. | 技术人员发现一片细玻璃嵌入设备的机制中。 |

### 100. entirety  *n.*

| | |
| --- | --- |
| 音标 | /ɪnˈtaɪə.ti/ |
| 中文释义 | 整体；全部 |
| 英文释义 | The whole or complete extent of something. |
| freq_rank | 12896 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | in its entirety | `academic` | This study must be reviewed in its entirety to understand the findings. | 本研究必须整体审查，以便理解研究结果。 |
| 2 | the entirety of | `work` | The manager is responsible for the entirety of the project’s execution and delivery. | 经理对项目的整体执行和交付负责。 |
| 3 | the entirety of the | `culture` | Many appreciate the entirety of the cultural heritage passed down through generations. | 许多人欣赏代代相传的文化遗产的整体。 |
