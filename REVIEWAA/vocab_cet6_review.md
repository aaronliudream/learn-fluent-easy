# cet6 词库内容 · 送审件(抽 100 词)

> 抽样种子固定 20260803,复跑抽到同一批。**不是纯随机** —— 贪心挑成尽量铺开场景与词性,
> 免得 100 个里大半是名词、场景全挤在 news。
> 本批覆盖 **10/10 个场景**、**7 种词性**。
> 全量内容见 `scripts/vocab/data/generated/cet6-content.json`。

## 全量 964 词的实测分布

| 项 | 实测 |
| --- | --- |
| 词条 | 964 |
| 例句 | 2892(平均每词 3.00 条) |
| 难度档 | A2 38 · B1 106 · B2 471 · C1 349 |
| ECDICT 未标词性 | 4 词 |
| 跨词性(pos 含 `/`) | 276 词(28.6%) |
| 一次过闸 | 756 词 · 重试后才过 208 词 |
| 人工撰写 | 2 词(morality mustard) |

场景分布(共 2892 条例句):academic 265 · news 296 · daily_life 564 · work 527 · science_tech 313 · health 134 · environment 104 · education 269 · travel 69 · culture 351

## 请重点看这四点

1. **中文释义准不准** —— 有没有把次要义当主义、有没有并列近义词充数。
2. **搭配是不是真高频**,顺序是不是真按频率(句 1 应当是最常见的说法)。
3. **例句像不像人写的** —— 三句之间是不是真换了写法,不是同一个模子换词。
4. **难度档合不合适** —— 高频词配短句、低频学术词配长句。

## ⚠️ 我自己知道的薄弱点(不用你去找)

- **跨词性词的义项**:本批有 276 个跨词性词。提示词里加了"跨词性几乎必然对应词典
  分列义项"的自查,实测 state → 状态；国家 ✓、part → 部分；分开 ✓,但 **might(n./aux.)
  仍然给「可能；或许」** —— 近义堆砌且漏了名词义"力量"。没继续迭代提示词(边际收益递减),
  这类**只能靠人审兜**,请留意跨词性词的第二个义项。
- **个别搭配不是真搭配**:如 system 的 "local system"、part 的
  "Understanding is part of the problem we face"(语义空转)。机器闸门只能判"搭配里含不含
  目标词",判不了"这个搭配母语者到底说不说"。
- **人工撰写的 2 条**(上面标了 🖊):模型连续三轮爬不出同一个陷阱才手写的,
  照样过了全部闸门,但请你单独看一眼。

---

### 1. resultant  *adj./n.*

| | |
| --- | --- |
| 音标 | /rɪˈzʌltənt/ |
| 中文释义 | 结果的；后果的 |
| 英文释义 | Occurring as a result or consequence of something. |
| freq_rank | 14064 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | resultant effects | `science_tech` | Researchers observed the resultant effects of the experiment on plant growth. | 研究人员观察了实验对植物生长的结果效应。 |
| 2 | resultant forces | `academic` | The study examined how resultant forces influence motion in physical systems. | 该研究考察了结果力如何影响物理系统中的运动。 |
| 3 | resultant changes | `environment` | Communities are adapting to the resultant changes in climate patterns over the years. | 随着时间的推移，社区正在适应气候模式的结果变化。 |

### 2. category  *n.*

| | |
| --- | --- |
| 音标 | /ˈkæt.ɪ.gɔːr.i/ |
| 中文释义 | 类别 |
| 英文释义 | A group of things that share common characteristics. |
| freq_rank | 1461 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | category of products | `work` | Many companies sell different types in this category of products. | 许多公司在这个产品类别中销售不同类型的产品。 |
| 2 | category of information | `education` | Teachers often organize lessons by category of information. | 教师通常按信息类别组织课程。 |
| 3 | category of art | `culture` | This gallery exhibits a unique category of art from various artists. | 这个画廊展出了来自不同艺术家的独特艺术类别。 |

### 3. congest  *v.*

| | |
| --- | --- |
| 音标 | /kənˈdʒɛst/ |
| 中文释义 | 拥堵 |
| 英文释义 | To cause a blockage or overcrowding in a space or system. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | congested areas | `daily_life` | Traffic has significantly congested areas around the city center during rush hour. | 在高峰时段，城市中心周围的交通严重拥堵。 |
| 2 | congested highways | `news` | Reports indicate that many congested highways remain a serious issue for commuters. | 报告显示，许多拥堵的高速公路仍然是通勤者面临的严重问题。 |
| 3 | congested patients | `health` | Doctors are treating a number of congested patients suffering from respiratory issues. | 医生正在治疗一些因呼吸问题而拥堵的患者。 |

### 4. ideally  *adv.*

| | |
| --- | --- |
| 音标 | /aɪˈdiː.əl.i/ |
| 中文释义 | 理想情况下 |
| 英文释义 | In the best possible way or condition. |
| freq_rank | 7858 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | ideally suited | `work` | Candidates are ideally suited for this role if they have relevant experience. | 如果候选人有相关经验，理想情况下他们非常适合这个职位。 |
| 2 | ideally you would | `education` | Ideally you would complete all assignments before the deadline. | 理想情况下，你应该在截止日期之前完成所有作业。 |
| 3 | ideally located | `travel` | The hotel is ideally located near the main attractions of the city. | 这家酒店理想地位于城市的主要景点附近。 |

### 5. grants  *(ECDICT 没标词性)*

| | |
| --- | --- |
| 音标 | /ɡrænts/ |
| 中文释义 | 补助金；赠款 |
| 英文释义 | Financial aid given for a specific purpose without repayment obligation. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | research grants | `academic` | Many universities provide substantial research grants to support innovative projects. | 许多大学提供大量的研究补助金以支持创新项目。 |
| 2 | government grants | `work` | Small businesses often rely on government grants to help them grow and succeed. | 小企业通常依靠政府补助金来帮助它们成长和成功。 |
| 3 | educational grants | `education` | Students can apply for educational grants to cover their tuition expenses and living costs. | 学生可以申请教育补助金来支付学费和生活费用。 |

### 6. versus  *prep.*

| | |
| --- | --- |
| 音标 | /ˈvɜr.səs/ |
| 中文释义 | 对比；对抗 |
| 英文释义 | Indicating opposition or contrast between two entities. |
| freq_rank | 3160 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | time versus money | `work` | Many people struggle with the choice between time versus money. | 很多人都在时间和金钱之间苦苦挣扎。 |
| 2 | nature versus nurture | `science_tech` | The debate on nature versus nurture continues to be a popular topic. | 关于自然与养育的辩论仍然是一个热门话题。 |
| 3 | democracy versus dictatorship | `culture` | In many countries, democracy versus dictatorship is a critical issue. | 在许多国家，民主与独裁是一个关键问题。 |

### 7. alas  *int.*

| | |
| --- | --- |
| 音标 | /əˈlæs/ |
| 中文释义 | 哎呀；唉 |
| 英文释义 | An expression of sorrow or regret. |
| freq_rank | 8520 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | alas, we must part | `daily_life` | The time has come, alas, we must part from each other. | 时光已到，哎呀，我们得分别了。 |
| 2 | alas, it is true | `news` | Reports confirm, alas, it is true that the event was canceled. | 报道确认，哎呀，这个事件确实被取消了。 |
| 3 | alas, not everyone | `academic` | In studies, alas, not everyone comprehends the material equally well. | 在研究中，哎呀，并不是每个人都能平等地理解这些材料。 |

### 8. oak  *n./adj.*

| | |
| --- | --- |
| 音标 | /oʊk/ |
| 中文释义 | 橡树 |
| 英文释义 | A large tree known for its strength and hard wood. |
| freq_rank | 4423 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | oak trees | `environment` | Oak trees provide essential habitats for various wildlife species. | 橡树为多种野生动物提供了重要栖息地。 |
| 2 | oak wood | `daily_life` | Many furniture items are crafted from durable oak wood for its longevity. | 许多家具都是用耐用的橡木制作的，因其持久性。 |
| 3 | oak barrels | `culture` | Wine is often aged in oak barrels to enhance its flavor profile. | 葡萄酒通常在橡木桶中陈酿，以增强其风味。 |

### 9. senseless  *adj.*

| | |
| --- | --- |
| 音标 | /ˈsɛnsləs/ |
| 中文释义 | 无意义的；无目的的 |
| 英文释义 | Lacking meaning, purpose, or value. |
| freq_rank | 12428 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | senseless violence | `news` | Many communities are struggling to combat senseless violence that affects innocent lives. | 许多社区正在努力抵制无意义的暴力，它影响着无辜的生命。 |
| 2 | senseless act | `daily_life` | He described the theft as a senseless act that brought no benefit to anyone. | 他形容这次盗窃是一种无意义的行为，对任何人都没有好处。 |
| 3 | senseless loss | `culture` | The documentary highlighted the senseless loss of cultural heritage due to neglect. | 该纪录片突显了由于忽视而导致文化遗产的无意义损失。 |

### 10. blur  *v.*

| | |
| --- | --- |
| 音标 | /blɜr/ |
| 中文释义 | 模糊；混淆 |
| 英文释义 | To make or become unclear or indistinct. |
| freq_rank | 6364 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | blur the lines | `culture` | Artists often blur the lines between reality and imagination in their work. | 艺术家在作品中常常模糊现实与想象的界限。 |
| 2 | blur the distinction | `academic` | Researchers aim to blur the distinction between traditional and modern teaching methods. | 研究人员旨在模糊传统和现代教学方法之间的区别。 |
| 3 | blur the image | `science_tech` | High-speed motion can blur the image captured by the camera. | 高速运动可能会模糊相机捕捉到的图像。 |

### 11. sift  *v.*

| | |
| --- | --- |
| 音标 | /sɪft/ |
| 中文释义 | 筛选；过滤 |
| 英文释义 | To separate or sort through material to remove unwanted elements. |
| freq_rank | 7955 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | sift through data | `academic` | Researchers sift through data to identify patterns in their findings. | 研究人员筛选数据，以识别他们发现中的模式。 |
| 2 | sift through evidence | `news` | Investigators sift through evidence to uncover the truth behind the incident. | 调查人员筛选证据，以揭示事件背后的真相。 |
| 3 | sift flour | `daily_life` | She sifts flour to ensure the cake has a smooth texture. | 她筛选面粉，以确保蛋糕的口感光滑。 |

### 12. ferry  *n.*

| | |
| --- | --- |
| 音标 | /ˈfɛr.i/ |
| 中文释义 | 渡船 |
| 英文释义 | A boat that carries people or goods across a body of water. |
| freq_rank | 6492 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | ferry service | `travel` | Many travelers depend on the ferry service for their daily commute. | 许多旅行者依赖渡船服务进行日常通勤。 |
| 2 | ferry terminal | `daily_life` | The ferry terminal was crowded with passengers waiting to board. | 渡船码头挤满了等待登船的乘客。 |
| 3 | ferry ride | `culture` | During the summer, the ferry ride across the lake is popular among tourists. | 夏季，横渡湖泊的渡船旅程深受游客喜爱。 |

### 13. sightseeing  *n./adj.*

| | |
| --- | --- |
| 音标 | /ˈsaɪtˌsiːɪŋ/ |
| 中文释义 | 观光；旅游 |
| 英文释义 | The activity of visiting interesting places, especially as a leisure activity. |
| freq_rank | 16109 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | sightseeing tour | `travel` | Many tourists prefer a sightseeing tour to make the most of their visit. | 很多游客更喜欢参加观光游，以充分利用他们的旅行。 |
| 2 | sightseeing spots | `culture` | Travel guides often highlight the best sightseeing spots in a city. | 旅游指南通常会强调城市中最好的观光景点。 |
| 3 | sightseeing activities | `daily_life` | Families often plan various sightseeing activities during the summer holidays. | 家庭通常会在暑假期间计划各种观光活动。 |

### 14. officer  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈɔː.fɪ.sər/ |
| 中文释义 | 官员 |
| 英文释义 | A person holding a position of authority or responsibility. |
| freq_rank | 671 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | police officer | `daily_life` | Officers help keep our neighborhoods safe and secure. | 官员帮助保持我们社区的安全与安宁。 |
| 2 | military officer | `work` | He is a military officer who leads his team effectively. | 他是一名有效领导团队的军官。 |
| 3 | government officer | `news` | Government officers announced new policies to improve health. | 政府官员宣布了改善健康的新政策。 |

### 15. promote  *v.*

| | |
| --- | --- |
| 音标 | /prəˈmoʊt/ |
| 中文释义 | 促进；提升 |
| 英文释义 | To support or encourage development or growth in something. |
| freq_rank | 1328 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | promote education | `education` | Schools promote education for all children every day. | 学校每天都促进所有儿童的教育。 |
| 2 | promote health | `health` | We should promote health through better lifestyle choices. | 我们应该通过更好的生活方式促进健康。 |
| 3 | promote awareness | `culture` | Organizations promote awareness of local traditions to visitors. | 组织向游客促进对当地传统的认识。 |

### 16. chorus  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈkɔːr.əs/ |
| 中文释义 | 合唱；合唱团 |
| 英文释义 | A group of singers or a song sung by them. |
| freq_rank | 5274 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | choir and chorus | `culture` | Many choirs and choruses perform together during the festival season. | 在节日季节，许多合唱团和合唱团一起演出。 |
| 2 | chorus line | `daily_life` | During rehearsals, the chorus line practiced their synchronized movements. | 在排练期间，合唱队员们练习他们的同步动作。 |
| 3 | chorus of voices | `education` | A chorus of voices rose in agreement during the classroom discussion. | 在课堂讨论中，赞同的声音齐声响起。 |

### 17. gravel  *n.*

| | |
| --- | --- |
| 音标 | /ˈɡræ.vəl/ |
| 中文释义 | 砾石 |
| 英文释义 | Small, rounded stones commonly used in construction or landscaping. |
| freq_rank | 5620 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | gravel roads | `daily_life` | Many rural areas have unpaved gravel roads for local traffic. | 许多乡村地区有未经铺设的砾石道路供当地交通使用。 |
| 2 | gravel pits | `environment` | Gravel pits can significantly impact local ecosystems and biodiversity. | 砾石坑可能会对当地生态系统和生物多样性产生重大影响。 |
| 3 | gravel extraction | `work` | The company specializes in gravel extraction for construction projects. | 该公司专注于为建筑项目提取砾石。 |

### 18. symptom  *n.*

| | |
| --- | --- |
| 音标 | /ˈsɪmp.təm/ |
| 中文释义 | 症状 |
| 英文释义 | A physical or mental feature indicating a condition or disease. |
| freq_rank | 2249 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | common symptoms | `health` | Many patients report common symptoms like fatigue and headaches. | 许多患者报告常见症状，如疲劳和头痛。 |
| 2 | serious symptoms | `news` | Doctors warned that serious symptoms should not be ignored. | 医生警告说，严重症状不应被忽视。 |
| 3 | initial symptoms | `science_tech` | Researchers studied initial symptoms to improve early diagnosis. | 研究人员研究了初始症状，以改善早期诊断。 |

### 19. referee  *n./v.*

| | |
| --- | --- |
| 音标 | /ˌrɛf.əˈriː/ |
| 中文释义 | 裁判；仲裁者 |
| 英文释义 | A person who oversees a game or competition. |
| freq_rank | 8516 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | football referee | `daily_life` | Every football referee must know the rules of the game well. | 每位足球裁判都必须熟知比赛规则。 |
| 2 | referee's decision | `work` | The referee's decision was final and could not be challenged. | 裁判的决定是最终的，无法被挑战。 |
| 3 | referee a dispute | `academic` | Professors often referee a dispute between competing theories in their field. | 教授们常常在他们的领域中仲裁竞争理论之间的争议。 |

### 20. intercourse  *n.*

| | |
| --- | --- |
| 音标 | /ˈɪn.tə.kɔːrs/ |
| 中文释义 | 交往；性交 |
| 英文释义 | The act of sexual procreation or intimate interaction. |
| freq_rank | 7736 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | sexual intercourse | `health` | Many studies highlight the importance of safe sexual intercourse for health. | 许多研究强调安全性交对健康的重要性。 |
| 2 | intercourse between | `academic` | Intercourse between cultures fosters understanding and cooperation among societies. | 文化之间的交往促进了社会的理解与合作。 |
| 3 | intercourse rights | `news` | Recent legislation addresses the rights related to marital intercourse and consent. | 最近的立法涉及配偶之间性交和同意的权利。 |

### 21. wholly  *adv.*

| | |
| --- | --- |
| 音标 | /ˈhoʊl.i/ |
| 中文释义 | 完全地 |
| 英文释义 | In a complete manner; entirely or fully. |
| freq_rank | 6835 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | wholly inadequate | `education` | Many students found the support provided to be wholly inadequate. | 许多学生发现提供的支持完全不够。 |
| 2 | wholly owned | `work` | The company is now a wholly owned subsidiary of a larger corporation. | 该公司现在是一个大型公司的全资子公司。 |
| 3 | wholly focused | `science_tech` | Researchers were wholly focused on finding a solution to the problem. | 研究人员完全专注于寻找解决问题的方法。 |

### 22. treasurer  *n.*

| | |
| --- | --- |
| 音标 | /ˈtrɛʒ.ər.ər/ |
| 中文释义 | 财务主管 |
| 英文释义 | One responsible for managing financial affairs or funds. |
| freq_rank | 11019 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | chief treasurer | `work` | The chief treasurer of the organization presented the annual financial report to the board. | 该组织的财务主管向董事会提交了年度财务报告。 |
| 2 | school treasurer | `education` | In our school, the elected school treasurer manages the budget for extracurricular activities. | 在我们学校，选举产生的学生财务主管负责管理课外活动的预算。 |
| 3 | company treasurer | `news` | A new company treasurer was appointed following the recent financial scandal in the firm. | 在最近公司的财务丑闻后，任命了一位新的公司财务主管。 |

### 23. fling  *n./v.*

| | |
| --- | --- |
| 音标 | /flɪŋ/ |
| 中文释义 | 投掷；冲动的行为 |
| 英文释义 | A sudden movement or act of throwing something. |
| freq_rank | 6172 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | fling away | `daily_life` | People often fling away trash without thinking about the environment. | 人们常常不假思索地把垃圾抛弃。 |
| 2 | fling open | `work` | She decided to fling open the doors to welcome her colleagues inside. | 她决定猛地打开门，欢迎同事们进来。 |
| 3 | fling into | `academic` | Researchers might fling themselves into studying this complex phenomenon. | 研究人员可能会全心投入研究这一复杂现象。 |

### 24. blouse  *n.*

| | |
| --- | --- |
| 音标 | /blaʊz/ |
| 中文释义 | 女衬衫 |
| 英文释义 | A loose-fitting upper garment for women, typically with buttons. |
| freq_rank | 6586 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | stylish blouse | `daily_life` | She wore a stylish blouse to the party last weekend. | 她在上周末的聚会上穿了一件时尚的女衬衫。 |
| 2 | dressy blouse | `work` | For the meeting, I chose a dressy blouse and tailored pants. | 为了会议，我选择了一件正式的女衬衫和修身裤子。 |
| 3 | silk blouse | `culture` | Many artists prefer a silk blouse for its elegance and comfort. | 许多艺术家喜欢穿丝绸女衬衫，因为它优雅舒适。 |

### 25. pedlar  *n.*

| | |
| --- | --- |
| 音标 | /ˈpɛd.lər/ |
| 中文释义 | 小贩 |
| 英文释义 | A person who sells goods, typically in the street. |
| freq_rank | 23386 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | street pedlars | `daily_life` | Street pedlars offer various items to local customers every day. | 小贩每天向当地顾客提供各种商品。 |
| 2 | pedlars of goods | `work` | Many pedlars of goods face challenges in urban areas due to regulations. | 许多小贩在城市地区面临因监管而产生的挑战。 |
| 3 | pedlars selling wares | `culture` | Pedlars selling wares at festivals contribute to the cultural atmosphere of the event. | 在节日上销售商品的小贩为活动的文化氛围做出了贡献。 |

### 26. woe  *n.*

| | |
| --- | --- |
| 音标 | /woʊ/ |
| 中文释义 | 悲哀；苦恼 |
| 英文释义 | Great sorrow or distress, often due to misfortune. |
| freq_rank | 8122 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | woes of war | `news` | Many families are affected by the ongoing woes of war. | 许多家庭受到持续战争苦恼的影响。 |
| 2 | woes of life | `daily_life` | He often talks about the woes of life during our conversations. | 我们交谈时，他常常谈到生活的苦恼。 |
| 3 | woes of the economy | `academic` | Researchers are studying the woes of the economy to propose solutions. | 研究人员正在研究经济的苦恼，以提出解决方案。 |

### 27. hull  *n./v.*

| | |
| --- | --- |
| 音标 | /hʌl/ |
| 中文释义 | 船体；外壳 |
| 英文释义 | The outer covering or structure of a ship or boat. |
| freq_rank | 6683 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | hull damage | `work` | Inspectors reported significant hull damage after the storm hit. | 检查员报告说，暴风雨过后船体受到了严重损坏。 |
| 2 | hull design | `science_tech` | Engineers focused on improving the hull design for better fuel efficiency. | 工程师们专注于改善船体设计以提高燃油效率。 |
| 3 | hull integrity | `environment` | Maintaining hull integrity is crucial for the safety of the vessel. | 保持船体完整性对船只的安全至关重要。 |

### 28. grassy  *adj.*

| | |
| --- | --- |
| 音标 | /ˈɡræs.i/ |
| 中文释义 | 草多的；草生长的 |
| 英文释义 | Covered with grass or having many grass plants. |
| freq_rank | 10102 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | grassy fields | `environment` | Wild animals often roam in grassy fields during the summer months. | 野生动物常常在夏季的草地上游荡。 |
| 2 | grassy areas | `daily_life` | Children love to play in the grassy areas of the park on sunny days. | 孩子们喜欢在阳光明媚的日子里，在公园的草地上玩耍。 |
| 3 | grassy slopes | `travel` | Hikers enjoyed the breathtaking views from the grassy slopes of the mountain. | 徒步旅行者在山的草坡上欣赏到了令人叹为观止的景色。 |

### 29. propeller  *n.*

| | |
| --- | --- |
| 音标 | /prəˈpɛl.ər/ |
| 中文释义 | 螺旋桨 |
| 英文释义 | A device with blades that creates thrust in fluids. |
| freq_rank | 12524 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | aircraft propellers | `science_tech` | Aircraft propellers are essential for generating lift and thrust during flight. | 飞机的螺旋桨在飞行过程中对于产生升力和推力至关重要。 |
| 2 | marine propellers | `work` | Marine propellers enable boats to navigate through water with efficiency and speed. | 船用螺旋桨使船只能够高效快速地在水中航行。 |
| 3 | propeller design | `academic` | The principles of propeller design are crucial for improving fuel efficiency in aviation. | 螺旋桨设计的原理对于提高航空燃油效率至关重要。 |

### 30. touchable  *adj.*

| | |
| --- | --- |
| 音标 | /ˈtʌtʃ.ə.bəl/ |
| 中文释义 | 可触摸的 |
| 英文释义 | Able to be touched or felt physically. |
| freq_rank | 35163 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | touchable surfaces | `science_tech` | Researchers have developed touchable surfaces that can change texture upon contact. | 研究人员开发了可触摸的表面，可以在接触时改变纹理。 |
| 2 | touchable objects | `education` | In the museum, students can interact with touchable objects for a hands-on experience. | 在博物馆，学生可以与可触摸的物体互动，获得动手体验。 |
| 3 | touchable interfaces | `daily_life` | Most smartphones today feature touchable interfaces that enhance user interaction. | 如今大多数智能手机都配有可触摸的界面，增强用户交互。 |

### 31. labour  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈleɪ.bər/ |
| 中文释义 | 劳动；工作 |
| 英文释义 | Physical or mental effort to achieve a result. |
| freq_rank | 16348 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | hard labour | `work` | Many prisoners are sentenced to hard labour for their crimes. | 许多囚犯因犯罪被判处苦役。 |
| 2 | labour market | `news` | The current labour market shows signs of recovery after the recession. | 目前的劳动力市场显示出经济衰退后的复苏迹象。 |
| 3 | labour rights | `culture` | Activists are fighting to protect labour rights across the globe. | 活动家们正在努力保护全球的劳动权利。 |

### 32. wasteful  *adj.*

| | |
| --- | --- |
| 音标 | /ˈweɪst.fəl/ |
| 中文释义 | 浪费的 |
| 英文释义 | Using more resources than necessary; inefficient or extravagant. |
| freq_rank | 12903 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | wasteful spending | `work` | Companies often face criticism for wasteful spending during economic downturns. | 公司在经济下滑期间常因浪费的支出而受到批评。 |
| 2 | wasteful practices | `environment` | Many industries still engage in wasteful practices that harm the environment. | 许多行业仍在进行浪费的做法，危害环境。 |
| 3 | wasteful consumption | `daily_life` | Individuals should be aware of wasteful consumption to promote sustainability. | 个人应意识到浪费的消费，以促进可持续发展。 |

### 33. yoke  *n./v.*

| | |
| --- | --- |
| 音标 | /joʊk/ |
| 中文释义 | 枷锁；束缚 |
| 英文释义 | A device for joining together a pair of animals or burdened items. |
| freq_rank | 16099 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | yoke together | `work` | Farmers often yoke together oxen to plow large fields efficiently. | 农民们通常把牛拴在一起，以高效地耕作大田。 |
| 2 | yoke of oppression | `culture` | Many communities strive to break the yoke of oppression imposed by authoritarian regimes. | 许多社区努力打破专制政权施加的压迫枷锁。 |
| 3 | yoke of slavery | `education` | Histories of the yoke of slavery are crucial for understanding social justice today. | 对奴隶枷锁的历史了解对于理解当今的社会公正至关重要。 |

### 34. radiator  *n.*

| | |
| --- | --- |
| 音标 | /ˈreɪ.di.eɪ.tər/ |
| 中文释义 | 散热器 |
| 英文释义 | A device for transferring heat from one medium to another. |
| freq_rank | 13342 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | hot water radiator | `daily_life` | During the winter, the hot water radiator keeps our home warm and cozy. | 在冬天，热水散热器让我们的家变得温暖舒适。 |
| 2 | electric radiator | `work` | The office installed an electric radiator to improve the heating efficiency during cold months. | 办公室安装了电散热器，以提高寒冷月份的取暖效率。 |
| 3 | radiator cap | `science_tech` | A malfunctioning radiator cap can lead to overheating in the vehicle's engine. | 故障的散热器盖可能导致车辆发动机过热。 |

### 35. physically  *adv.*

| | |
| --- | --- |
| 音标 | /ˈfɪz.ɪ.kli/ |
| 中文释义 | 身体上；物理上 |
| 英文释义 | In a bodily manner; relating to the body. |
| freq_rank | 3243 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | physically active | `health` | People who are physically active tend to have better health. | 活跃的人通常更健康。 |
| 2 | physically demanding | `work` | This job is physically demanding and requires strength and stamina. | 这份工作对身体有很高的要求，需要力量和耐力。 |
| 3 | physically present | `education` | Students must be physically present to participate in the experiment. | 学生必须亲自到场才能参加实验。 |

### 36. watchful  *adj.*

| | |
| --- | --- |
| 音标 | /ˈwɑːtʃ.fəl/ |
| 中文释义 | 警觉的；留心的 |
| 英文释义 | Vigilant and attentive to potential dangers or issues. |
| freq_rank | 12369 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | watchful eye | `daily_life` | Parents should always keep a watchful eye on their children in public places. | 父母在公共场所应始终留心关注他们的孩子。 |
| 2 | watchful gaze | `work` | She observed the meeting with a watchful gaze, noting everything discussed. | 她以警觉的目光观察会议，记录讨论的每一项内容。 |
| 3 | watchful attention | `education` | Teachers provide watchful attention to students during examinations to prevent cheating. | 老师在考试期间对学生给予警觉的关注，以防止作弊。 |

### 37. fission  *n.*

| | |
| --- | --- |
| 音标 | /ˈfɪʃ.ən/ |
| 中文释义 | 裂变 |
| 英文释义 | The process of splitting a nucleus into smaller parts. |
| freq_rank | 19394 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | nuclear fission | `science_tech` | Nuclear fission occurs when an atomic nucleus splits into smaller nuclei, releasing energy. | 当原子核裂变成更小的核时，释放出能量。 |
| 2 | fission reaction | `academic` | A fission reaction can produce significant amounts of energy for power generation. | 裂变反应可以为发电提供大量能量。 |
| 3 | fission products | `environment` | The fission products released into the environment can have serious health impacts. | 释放到环境中的裂变产物可能对健康造成严重影响。 |

### 38. absurd  *adj./n.*

| | |
| --- | --- |
| 音标 | /əbˈsɜrd/ |
| 中文释义 | 荒谬的 |
| 英文释义 | Ridiculously unreasonable or illogical. |
| freq_rank | 5901 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | absurd situation | `daily_life` | Many find the current political climate to be an absurd situation. | 许多人认为当前的政治气候是一种荒谬的情况。 |
| 2 | absurd claims | `news` | The report included several absurd claims that lacked evidence. | 该报告包含几项缺乏证据的荒谬主张。 |
| 3 | absurd behavior | `work` | His absurd behavior during meetings often distracts the team. | 他在会议期间的荒谬行为常常分散团队的注意力。 |

### 39. supersonic  *adj.*

| | |
| --- | --- |
| 音标 | /ˌsuː.pərˈsɒn.ɪk/ |
| 中文释义 | 超音速的 |
| 英文释义 | Relating to speeds greater than the speed of sound. |
| freq_rank | 17396 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | supersonic travel | `travel` | Many companies are investing in supersonic travel to reduce flight times significantly. | 许多公司正在投资超音速旅行，以显著缩短飞行时间。 |
| 2 | supersonic jets | `science_tech` | Engineers are developing new supersonic jets that are more fuel-efficient than previous models. | 工程师们正在开发比以前型号更省油的超音速飞机。 |
| 3 | supersonic speeds | `news` | The latest research reveals the impact of supersonic speeds on aircraft design. | 最新研究揭示了超音速对飞机设计的影响。 |

### 40. refrain  *n./v.*

| | |
| --- | --- |
| 音标 | /rɪˈfreɪn/ |
| 中文释义 | 克制；避免 |
| 英文释义 | To abstain from an impulse or action. |
| freq_rank | 9029 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | refrain from making comments | `news` | Politicians often refrain from making comments during sensitive situations. | 政治家在敏感情况下往往克制自己不做评论。 |
| 2 | refrain from taking risks | `work` | Employees should refrain from taking risks that could jeopardize safety. | 员工应克制自己不冒险，以免危及安全。 |
| 3 | refrain from excessive consumption | `health` | People are encouraged to refrain from excessive consumption of sugary drinks. | 人们被鼓励克制自己不过量饮用含糖饮料。 |

### 41. contradict  *v.*

| | |
| --- | --- |
| 音标 | /ˌkɒn.trəˈdɪkt/ |
| 中文释义 | 反驳；与…矛盾 |
| 英文释义 | To assert the opposite of a statement or idea. |
| freq_rank | 6863 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | contradict the findings | `academic` | Researchers often contradict the findings of previous studies in their papers. | 研究人员经常在论文中反驳之前研究的结果。 |
| 2 | contradict oneself | `daily_life` | He tends to contradict himself during conversations, causing confusion. | 他在谈话中往往自相矛盾，导致混淆。 |
| 3 | contradict the evidence | `news` | The lawyer argued that new statements contradict the evidence presented in court. | 律师辩称新陈述与法庭上提供的证据相矛盾。 |

### 42. provost  *n.*

| | |
| --- | --- |
| 音标 | /ˈproʊ.vɔst/ |
| 中文释义 | 教务长 |
| 英文释义 | A senior administrative officer in a college or university. |
| freq_rank | 19065 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | university provost | `education` | The university provost announced new initiatives to improve student engagement. | 教务长宣布了新的举措，以提高学生的参与度。 |
| 2 | provost's office | `work` | Many important decisions are made in the provost's office regarding academic policies. | 许多关于学术政策的重要决定是在教务长办公室做出的。 |
| 3 | acting provost | `academic` | After the resignation, an acting provost was appointed to oversee university operations temporarily. | 在辞职后，任命了一名代理教务长来暂时监督大学的运营。 |

### 43. grove  *n.*

| | |
| --- | --- |
| 音标 | /ɡroʊv/ |
| 中文释义 | 小树林 |
| 英文释义 | A small group of trees growing close together. |
| freq_rank | 7155 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | cherry grove | `environment` | Many visitors enjoy walking through the cherry grove during springtime blooms. | 许多游客喜欢在春天的樱桃小树林里散步。 |
| 2 | olive grove | `daily_life` | They harvested olives from the ancient olive grove near their home. | 他们从家附近的古老橄榄小树林里采摘橄榄。 |
| 3 | grove of trees | `culture` | Artists often seek inspiration in a tranquil grove of trees. | 艺术家们常常在宁静的小树林中寻找灵感。 |

### 44. prism  *n.*

| | |
| --- | --- |
| 音标 | /ˈprɪz.əm/ |
| 中文释义 | 棱镜 |
| 英文释义 | A transparent optical element that refracts light. |
| freq_rank | 13056 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | light prism | `science_tech` | Scientists use a light prism to demonstrate the spectrum of colors. | 科学家利用光棱镜展示色谱。 |
| 2 | optical prism | `academic` | An optical prism is essential in various imaging systems and technologies. | 光学棱镜在各种成像系统和技术中至关重要。 |
| 3 | glass prism | `work` | Engineers often design glass prisms for innovative optical devices in the industry. | 工程师们常常设计玻璃棱镜用于行业内的创新光学设备。 |

### 45. shaky  *adj.*

| | |
| --- | --- |
| 音标 | /ˈʃeɪ.ki/ |
| 中文释义 | 不稳定的；摇晃的 |
| 英文释义 | Not firm or steady; likely to tremble or fall. |
| freq_rank | 7947 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | shaky hands | `daily_life` | During the presentation, she noticed her hands felt shaky and unsteady. | 在演示过程中，她注意到自己的手感到不稳定和颤抖。 |
| 2 | shaky foundation | `science_tech` | The team realized their research was based on a shaky foundation of assumptions. | 团队意识到他们的研究是基于不稳固的假设基础。 |
| 3 | shaky economy | `news` | Experts warned that the country's economy remains shaky due to recent events. | 专家警告称，由于最近的事件，国家经济仍然不稳定。 |

### 46. principally  *adv.*

| | |
| --- | --- |
| 音标 | /ˈprɪn.sə.pəl.i/ |
| 中文释义 | 主要地 |
| 英文释义 | In a primary or main way. |
| freq_rank | 10478 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | principally focused on | `academic` | Researchers are principally focused on the impact of climate change on biodiversity. | 研究人员主要关注气候变化对生物多样性的影响。 |
| 2 | principally due to | `news` | The decline in enrollment is principally due to recent budget cuts at the university. | 入学人数下降主要是由于大学最近的预算削减。 |
| 3 | principally serves | `work` | This role principally serves to enhance team communication and project efficiency. | 这个角色主要用于提升团队沟通和项目效率。 |

### 47. experimentation  *n.*

| | |
| --- | --- |
| 音标 | /ˌɛk.spə.rɪ.mɛnˈteɪ.ʃən/ |
| 中文释义 | 实验；试验 |
| 英文释义 | The process of testing ideas or theories to discover new information. |
| freq_rank | 8997 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | scientific experimentation | `science_tech` | Scientists conduct rigorous scientific experimentation to validate their findings. | 科学家进行严格的科学实验以验证他们的发现。 |
| 2 | educational experimentation | `education` | Teachers often engage in educational experimentation to improve student learning outcomes. | 教师经常进行教育实验以改善学生的学习成果。 |
| 3 | field experimentation | `work` | Field experimentation is essential for understanding real-world applications of theories. | 现场实验对于理解理论在现实世界中的应用至关重要。 |

### 48. additional  *adj.*

| | |
| --- | --- |
| 音标 | /əˈdɪʃ.ən.əl/ |
| 中文释义 | 额外的 |
| 英文释义 | Something added to what is already present or available. |
| freq_rank | 1319 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | additional information | `education` | We need additional information for the project report. | 我们需要额外的信息来写项目报告。 |
| 2 | additional support | `work` | She received additional support from her colleagues during the project. | 她在项目期间得到了同事们的额外支持。 |
| 3 | additional features | `science_tech` | The new software has several additional features to improve usability. | 新软件有多个额外功能来提高可用性。 |

### 49. diesel  *n.*

| | |
| --- | --- |
| 音标 | /ˈdiː.zəl/ |
| 中文释义 | 柴油 |
| 英文释义 | A type of fuel used in engines for vehicles. |
| freq_rank | 6468 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | diesel engines | `work` | Many companies are switching to more efficient diesel engines for their trucks. | 许多公司正在为他们的卡车更换更高效的柴油发动机。 |
| 2 | diesel prices | `news` | Recent fluctuations in diesel prices have affected transportation costs significantly. | 柴油价格的近期波动已经显著影响了运输成本。 |
| 3 | diesel fuel | `environment` | Using cleaner diesel fuel can help reduce harmful emissions from vehicles. | 使用更清洁的柴油可以帮助减少车辆的有害排放。 |

### 50. confrontation  *n.*

| | |
| --- | --- |
| 音标 | /ˌkɒn.frʌnˈteɪ.ʃən/ |
| 中文释义 | 对抗；冲突 |
| 英文释义 | A situation where people or groups oppose each other. |
| freq_rank | 4459 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | peaceful confrontation | `culture` | Peaceful confrontations can lead to constructive dialogue between opposing groups. | 和平的对抗可以促使对立群体之间进行建设性对话。 |
| 2 | violent confrontation | `news` | The violent confrontations in the city escalated tensions between local residents and authorities. | 城市中的暴力冲突加剧了当地居民与当局之间的紧张关系。 |
| 3 | confrontation strategies | `work` | Developing effective confrontation strategies is essential for conflict resolution in teams. | 制定有效的对抗策略对于团队解决冲突至关重要。 |

### 51. extraordinarily  *adv.*

| | |
| --- | --- |
| 音标 | /ɪkˈstrɔː.dɪn.er.ɪ.leɪ/ |
| 中文释义 | 极其；特别 |
| 英文释义 | In a very unusual or remarkable manner. |
| freq_rank | 7314 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | extraordinarily difficult | `education` | Studying advanced mathematics can be extraordinarily difficult for many students. | 学习高级数学对许多学生来说极其困难。 |
| 2 | extraordinarily talented | `culture` | She is considered extraordinarily talented in the field of classical music. | 她在古典音乐领域被认为非常有才华。 |
| 3 | extraordinarily popular | `news` | The new movie became extraordinarily popular within just a few days of release. | 这部新电影在上映几天内变得非常受欢迎。 |

### 52. petty  *adj.*

| | |
| --- | --- |
| 音标 | /ˈpɛti/ |
| 中文释义 | 微不足道的；琐碎的 |
| 英文释义 | Of little importance or trivial nature. |
| freq_rank | 6435 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | petty issues | `daily_life` | Many people argue about petty issues that do not matter in the long run. | 许多人争论那些在长远来看毫无意义的琐碎问题。 |
| 2 | petty theft | `news` | The police reported an increase in petty theft incidents near the park. | 警方报告说，公园附近的小偷小摸事件有所增加。 |
| 3 | petty politics | `academic` | In academia, petty politics can hinder collaboration and innovation among researchers. | 在学术界，琐碎的政治可能会阻碍研究者之间的合作与创新。 |

### 53. hydraulic  *adj.*

| | |
| --- | --- |
| 音标 | /haɪˈdrɔː.lɪk/ |
| 中文释义 | 液压的 |
| 英文释义 | Relating to the movement of fluid through pipes or systems. |
| freq_rank | 10564 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | hydraulic system | `work` | Engineers designed a hydraulic system to increase the machinery's efficiency. | 工程师设计了一个液压系统，以提高机器的效率。 |
| 2 | hydraulic pressure | `science_tech` | The experiment demonstrated how hydraulic pressure can lift heavy objects easily. | 实验展示了液压压力如何轻松提升重物。 |
| 3 | hydraulic fluids | `daily_life` | Many vehicles rely on hydraulic fluids to operate their braking systems effectively. | 许多车辆依靠液压液有效操作其制动系统。 |

### 54. kit  *n.*

| | |
| --- | --- |
| 音标 | /kɪt/ |
| 中文释义 | 配套工具；装备 |
| 英文释义 | A set of items used for a specific purpose. |
| freq_rank | 4018 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | tool kit | `work` | Workers often carry a tool kit to assist with repairs. | 工人们经常携带工具包来帮助修理。 |
| 2 | first aid kit | `health` | Every household should have a well-stocked first aid kit. | 每个家庭都应该备有一套装备齐全的急救包。 |
| 3 | starter kit | `education` | Students received a starter kit to begin their scientific experiments. | 学生们收到了一个入门套件以开始他们的科学实验。 |

### 55. microprocessor  *n.*

| | |
| --- | --- |
| 音标 | /ˈmaɪ.kroʊˌprɑː.sɛs.ər/ |
| 中文释义 | 微处理器 |
| 英文释义 | A small electronic device that processes data in computers. |
| freq_rank | 12718 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | microprocessor architecture | `science_tech` | Computer scientists often design new microprocessor architectures to enhance performance. | 计算机科学家常常设计新的微处理器架构，以提升性能。 |
| 2 | microprocessor technology | `academic` | Research in microprocessor technology has led to significant advancements in computing power. | 微处理器技术的研究已带来计算能力的重大进步。 |
| 3 | microprocessor market | `news` | Analysts predict robust growth for the microprocessor market over the next decade. | 分析师预测在未来十年微处理器市场将实现强劲增长。 |

### 56. repay  *v.*

| | |
| --- | --- |
| 音标 | /rɪˈpeɪ/ |
| 中文释义 | 偿还 |
| 英文释义 | To pay back money that was borrowed or owed. |
| freq_rank | 7971 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | repay a debt | `daily_life` | Many people struggle to repay a debt after losing their jobs. | 许多人在失业后很难偿还债务。 |
| 2 | repay a loan | `work` | The company plans to repay a loan to improve its credit rating. | 该公司计划偿还一笔贷款以改善信用评级。 |
| 3 | repay kindness | `culture` | One day, she hopes to repay kindness shown to her during tough times. | 有一天，她希望能回报在困难时期对她的善意。 |

### 57. fade  *v./n./adj.*

| | |
| --- | --- |
| 音标 | /feɪd/ |
| 中文释义 | 褪色；消失 |
| 英文释义 | To gradually lose brightness or color. |
| freq_rank | 2882 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | fade away | `daily_life` | He watched the colors fade away from the sunset. | 他注视着夕阳的颜色逐渐褪去。 |
| 2 | fade in | `culture` | The music will fade in slowly as the scene changes. | 随着场景的变化，音乐会慢慢响起。 |
| 3 | fade out | `work` | She decided to fade out her involvement in the project. | 她决定逐渐减少对这个项目的参与。 |

### 58. northward  *n./adj./adv.*

| | |
| --- | --- |
| 音标 | /ˈnɔrθ.wɚd/ |
| 中文释义 | 北方的；向北的 |
| 英文释义 | In the direction of the north; toward the north. |
| freq_rank | 14152 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | move northward | `travel` | Travelers are encouraged to move northward for a better climate. | 旅行者被鼓励向北移动以获得更好的气候。 |
| 2 | northward expansion | `news` | The company plans for northward expansion into new markets next year. | 该公司计划明年向北扩展到新市场。 |
| 3 | northward trend | `science_tech` | Recent data shows a significant northward trend in global temperatures. | 最近的数据表明全球气温显著向北上升。 |

### 59. raisin  *n.*

| | |
| --- | --- |
| 音标 | /ˈreɪ.zən/ |
| 中文释义 | 葡萄干 |
| 英文释义 | Dried grape used in cooking or as a snack. |
| freq_rank | 8989 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | raisin bread | `daily_life` | Many people enjoy eating raisin bread for breakfast or snacks. | 许多人喜欢早餐或作为零食吃葡萄干面包。 |
| 2 | raisin cookie | `culture` | A traditional recipe often includes raisin cookies for special occasions. | 传统食谱常常在特殊场合包括葡萄干饼干。 |
| 3 | raisin consumption | `health` | Health experts recommend moderate raisin consumption for its benefits. | 健康专家建议适量食用葡萄干以获得益处。 |

### 60. withhold  *v.*

| | |
| --- | --- |
| 音标 | /wɪðˈhoʊld/ |
| 中文释义 | 拒绝给予；隐瞒 |
| 英文释义 | To refuse to give something that is due or expected. |
| freq_rank | 6650 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | withhold information | `news` | Officials have decided to withhold information about the ongoing investigation. | 官员们决定隐瞒有关正在进行的调查的信息。 |
| 2 | withhold consent | `work` | Employees cannot withhold consent for mandatory safety training programs. | 员工不能拒绝参加强制性的安全培训项目。 |
| 3 | withhold payment | `daily_life` | Many customers might withhold payment until the service is satisfactory. | 许多顾客可能会在服务满意之前拒绝付款。 |

### 61. freshen  *v.*

| | |
| --- | --- |
| 音标 | /ˈfrɛʃ.ən/ |
| 中文释义 | 使清新；使恢复活力 |
| 英文释义 | To make something fresh or renewed in appearance or quality. |
| freq_rank | 18379 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | freshen up the room | `daily_life` | Guests often freshen up the room with new decorations and scents. | 客人们常常用新的装饰和香气来使房间焕然一新。 |
| 2 | freshen your mind | `education` | Students should take breaks to freshen their minds during long study sessions. | 学生们在长时间学习中应该休息一下，以使思维清新。 |
| 3 | freshen up the presentation | `work` | Before the meeting, I will freshen up the presentation to engage the audience better. | 在会议之前，我会使演示文稿焕然一新，以更好地吸引观众。 |

### 62. savage  *adj./v./n.*

| | |
| --- | --- |
| 音标 | /ˈsæv.ɪdʒ/ |
| 中文释义 | 野蛮的；残酷的 |
| 英文释义 | Extremely fierce, cruel, or violent in nature or behavior. |
| freq_rank | 10011 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | savage attack | `news` | The protesters faced a savage attack from the police during the demonstration. | 抗议者在示威期间遭警方进行残酷的袭击。 |
| 2 | savage criticism | `academic` | Many academics received savage criticism for their controversial published works. | 许多学者因其有争议的出版作品遭受了残酷的批评。 |
| 3 | savage behavior | `daily_life` | Children sometimes exhibit savage behavior when they are frustrated or angry. | 孩子们在感到沮丧或生气时，有时会表现出野蛮的行为。 |

### 63. revision  *n.*

| | |
| --- | --- |
| 音标 | /rɪˈvɪʒ.ən/ |
| 中文释义 | 修订；修改 |
| 英文释义 | The process of reviewing and making changes to a document or plan. |
| freq_rank | 5994 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | academic revision | `education` | Students often struggle with academic revision before exams begin. | 学生在考试前常常在学术修订中感到很困难。 |
| 2 | revision process | `work` | The revision process is crucial to ensure the project meets all requirements. | 修订过程对于确保项目符合所有要求至关重要。 |
| 3 | draft revision | `science_tech` | Researchers submitted their draft revision for peer review to improve the findings. | 研究人员提交了他们的草稿修订以供同行评审，以改善研究结果。 |

### 64. distil  *v.*

| | |
| --- | --- |
| 音标 | /dɪˈstɪl/ |
| 中文释义 | 蒸馏；提取 |
| 英文释义 | To purify or extract a substance by heating and cooling. |
| freq_rank | 17042 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | distil knowledge | `education` | Researchers aim to distil knowledge from various sources to enhance teaching methods. | 研究人员旨在从各种来源提炼知识，以提升教学方法。 |
| 2 | distil information | `news` | Journalists strive to distil information from complex reports for clear public understanding. | 记者努力从复杂的报告中提炼信息，以便公众能够清楚理解。 |
| 3 | distil essence | `culture` | Artists often distil the essence of their experiences into their work for deeper connection. | 艺术家们常常将自己经历的精华提炼到作品中，以建立更深的联系。 |

### 65. capacitance  *n.*

| | |
| --- | --- |
| 音标 | /kəˈpæs.ɪ.təns/ |
| 中文释义 | 电容；电容值 |
| 英文释义 | The ability of a system to store electric charge. |
| freq_rank | 27326 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | capacitance measurement | `science_tech` | Engineers frequently perform capacitance measurement to ensure proper circuit functionality. | 工程师经常进行电容值测量，以确保电路正常工作。 |
| 2 | high capacitance | `academic` | Researchers are studying materials that can achieve high capacitance for energy storage applications. | 研究人员正在研究可以实现高电容的材料，用于储能应用。 |
| 3 | capacitance unit | `work` | In electrical engineering, the capacitance unit is often expressed in farads. | 在电气工程中，电容单位通常用法拉表示。 |

### 66. prick  *v./n./adj.*

| | |
| --- | --- |
| 音标 | /prɪk/ |
| 中文释义 | 刺；刺痛 |
| 英文释义 | To pierce or make a small hole in something. |
| freq_rank | 13277 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | prick one's finger | `daily_life` | After accidentally touching the needle, she made a small prick in her finger. | 不小心碰到针后，她的手指上刺了一小下。 |
| 2 | prick of conscience | `academic` | A prick of conscience can lead individuals to reconsider their actions. | 良心的刺痛可以促使个人重新考虑他们的行为。 |
| 3 | prick of fear | `culture` | He felt a prick of fear as he entered the dark alley. | 他走进黑暗的小巷时感到一阵恐惧的刺痛。 |

### 67. yielding  *adj.*

| | |
| --- | --- |
| 音标 | /ˈjiːl.dɪŋ/ |
| 中文释义 | 屈服的；顺从的 |
| 英文释义 | Capable of giving way under pressure; submissive or compliant. |
| freq_rank | 21183 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | yielding results | `science_tech` | Researchers reported yielding results that could revolutionize renewable energy technology. | 研究人员报告了可能改变可再生能源技术的成果。 |
| 2 | yielding ground | `news` | In the negotiations, both parties showed willingness to start yielding ground on key issues. | 在谈判中，双方都表现出愿意在关键问题上让步。 |
| 3 | yielding behavior | `education` | Teachers observed yielding behavior in students who felt overwhelmed by academic pressures. | 教师观察到在学业压力下，学生表现出屈服的行为。 |

### 68. fighter  *n.*

| | |
| --- | --- |
| 音标 | /ˈfaɪ.tər/ |
| 中文释义 | 斗士 |
| 英文释义 | A person who fights, especially in a battle or competition. |
| freq_rank | 3028 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | mixed martial arts fighter | `daily_life` | Many people admire mixed martial arts fighters for their skills. | 许多人钦佩综合格斗斗士的技能。 |
| 2 | political fighter | `news` | The political fighter continues to stand up against corruption. | 这位政治斗士继续反对腐败。 |
| 3 | professional fighter | `work` | Becoming a professional fighter requires intense training and discipline. | 成为职业斗士需要严格的训练和自律。 |

### 69. catalogue  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈkæt.əl.ɒɡ/ |
| 中文释义 | 目录；清单 |
| 英文释义 | A list of items, usually organized systematically. |
| freq_rank | 6793 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | catalogue of products | `work` | Businesses should maintain an updated catalogue of products for customers. | 企业应该维护更新的产品目录以供客户查看。 |
| 2 | catalogue of research | `academic` | The researchers published a comprehensive catalogue of research findings over the years. | 研究人员公布了多年来研究成果的全面目录。 |
| 3 | catalogue of services | `daily_life` | She browsed the catalogue of services offered by the local community center. | 她浏览了本地社区中心提供的服务目录。 |

### 70. culture  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈkʌl.tʃɚ/ |
| 中文释义 | 文化 |
| 英文释义 | The ideas, customs, and social behavior of a particular people or society. |
| freq_rank | 611 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | popular culture | `daily_life` | Popular culture influences many young people's choices. | 流行文化影响了许多年轻人的选择。 |
| 2 | academic culture | `education` | Students thrive in an academic culture that values learning. | 学生在重视学习的学术文化中茁壮成长。 |
| 3 | business culture | `work` | A positive business culture improves employee satisfaction. | 积极的商业文化提高了员工的满意度。 |

### 71. tyrant  *n.*

| | |
| --- | --- |
| 音标 | /ˈtaɪ.rənt/ |
| 中文释义 | 暴君 |
| 英文释义 | A ruler who exercises absolute power oppressively or cruelly. |
| freq_rank | 11629 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | tyrant ruler | `news` | Many citizens fear that the new leader will become a tyrant ruler. | 许多公民担心新领导者会成为暴君统治者。 |
| 2 | benevolent tyrants | `academic` | In some cases, benevolent tyrants provide stability and order in society. | 在某些情况下，仁慈的暴君为社会提供了稳定和秩序。 |
| 3 | tyrant government | `culture` | The tyrant government often suppresses dissenting voices to maintain control. | 暴君政府往往压制异议声音以保持控制。 |

### 72. fellowship  *n.*

| | |
| --- | --- |
| 音标 | /ˈfɛl.oʊ.ʃɪp/ |
| 中文释义 | 团契；友谊 |
| 英文释义 | A community or association of individuals with shared interests. |
| freq_rank | 9276 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | academic fellowship | `academic` | Numerous students applied for the academic fellowship at the university. | 许多学生申请了大学的学术奖学金。 |
| 2 | fellowship program | `education` | She joined a prestigious fellowship program to advance her career. | 她加入了一个有声望的奖学金项目以提升自己的职业生涯。 |
| 3 | professional fellowship | `work` | The company offers a professional fellowship for recent graduates. | 该公司为应届毕业生提供专业奖学金。 |

### 73. accessary  *adj./n.*

| | |
| --- | --- |
| 音标 | /ˈæksəˌsɛri/ |
| 中文释义 | 配件；附属物 |
| 英文释义 | An object that is added to something else to make it more useful or attractive. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | accessary equipment | `work` | Many organizations require accessary equipment to ensure safety and efficiency in various operations. | 许多组织要求配件设备，以确保各项操作的安全和效率。 |
| 2 | accessary roles | `education` | In collaborative projects, students often take on accessary roles to support their peers effectively. | 在合作项目中，学生们通常承担配件角色，以有效支持同伴。 |
| 3 | accessary features | `science_tech` | The new smartphone model includes several accessary features that enhance user experience significantly. | 新款智能手机型号包括多个配件功能，显著提升了用户体验。 |

### 74. incomplete  *adj.*

| | |
| --- | --- |
| 音标 | /ˌɪn.kəmˈpliːt/ |
| 中文释义 | 不完整的 |
| 英文释义 | Not fully formed or finished; lacking some parts or elements. |
| freq_rank | 6938 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | incomplete data | `science_tech` | Researchers published their findings based on incomplete data from multiple sources. | 研究人员根据来自多个来源的不完整数据发布了他们的研究结果。 |
| 2 | incomplete information | `education` | Students often struggle when they receive incomplete information during lectures. | 学生在听讲座时常常因为收到不完整的信息而感到困惑。 |
| 3 | incomplete tasks | `work` | Managers frequently check on incomplete tasks to ensure deadlines are met. | 管理者经常检查未完成的任务，以确保按时完成。 |

### 75. commonwealth  *n.*

| | |
| --- | --- |
| 音标 | /ˈkɑː.mən.wɛlθ/ |
| 中文释义 | 联邦；英联邦 |
| 英文释义 | A political unit or community governed by elected representatives. |
| freq_rank | 14121 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | commonwealth countries | `news` | Many commonwealth countries are collaborating on climate change initiatives. | 许多英联邦国家正在合作应对气候变化倡议。 |
| 2 | commonwealth of nations | `academic` | The commonwealth of nations promotes cooperation among its member states. | 英联邦促进其成员国之间的合作。 |
| 3 | commonwealth legislation | `work` | New commonwealth legislation aims to improve workers' rights across Australia. | 新颁布的联邦立法旨在改善澳大利亚工人的权利。 |

### 76. pretext  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈpriː.tɛkst/ |
| 中文释义 | 借口；托辞 |
| 英文释义 | A reason or motive given to hide true intentions. |
| freq_rank | 13441 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | pretext for action | `work` | Many employees made a pretext for action to avoid attending the meeting. | 许多员工以借口不参加会议。 |
| 2 | pretext for conflict | `news` | The government issued a pretext for conflict to justify its military actions. | 政府发布了借口，以为其军事行动辩护。 |
| 3 | using pretext | `daily_life` | Using a pretext, she left the party early without any explanations. | 她借口提前离开聚会，没有解释。 |

### 77. peacock  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈpiː.kɒk/ |
| 中文释义 | 孔雀 |
| 英文释义 | A large bird known for its colorful tail feathers. |
| freq_rank | 15411 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | peacock feathers | `culture` | Visitors to the garden were captivated by the stunning peacock feathers on display. | 游客被花园里展出的华丽孔雀羽毛吸引了注意。 |
| 2 | peacock display | `daily_life` | During the spring festival, many peacocks display their vibrant plumage to attract attention. | 在春季节期间，许多孔雀展示它们鲜艳的羽毛以吸引注意。 |
| 3 | peacock mating rituals | `science_tech` | Researchers observed fascinating peacock mating rituals in their natural habitat last summer. | 研究人员去年夏天在它们的自然栖息地观察到了迷人的孔雀求偶仪式。 |

### 78. combat  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈkɒm.bæt/ |
| 中文释义 | 战斗；搏斗 |
| 英文释义 | A fight or struggle between armed forces. |
| freq_rank | 3412 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | combat issues | `news` | Governments are trying to combat issues related to climate change. | 各国政府正努力应对与气候变化相关的问题。 |
| 2 | combat crime | `daily_life` | Cities work hard to combat crime and improve safety for residents. | 各城市努力抗击犯罪，提高居民的安全。 |
| 3 | combat inflation | `work` | Companies must find ways to combat inflation in their pricing strategies. | 公司必须找到在定价策略中对抗通货膨胀的方法。 |

### 79. elemental  *adj.*

| | |
| --- | --- |
| 音标 | /ˌɛl.əˈmɛn.təl/ |
| 中文释义 | 基本的；要素的 |
| 英文释义 | Relating to the basic or fundamental aspects of something. |
| freq_rank | 14054 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | elemental forces | `science_tech` | Scientists study elemental forces that shape our universe and environment. | 科学家研究塑造我们宇宙和环境的基本力量。 |
| 2 | elemental principles | `education` | Teachers emphasize elemental principles to help students understand complex concepts. | 教师强调基本原理，以帮助学生理解复杂的概念。 |
| 3 | elemental needs | `daily_life` | Meeting elemental needs is crucial for a person's survival and well-being. | 满足基本需求对一个人的生存和幸福至关重要。 |

### 80. reactor  *n.*

| | |
| --- | --- |
| 音标 | /riˈæk.tɚ/ |
| 中文释义 | 反应堆 |
| 英文释义 | A device used to initiate and control nuclear reactions. |
| freq_rank | 6317 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | nuclear reactor | `science_tech` | Nuclear reactors play a crucial role in generating electricity globally. | 核反应堆在全球发电中发挥着重要作用。 |
| 2 | research reactor | `academic` | Researchers utilize a research reactor to conduct various experiments safely. | 研究人员利用反应堆安全地进行各种实验。 |
| 3 | reactor design | `work` | Engineers are focused on improving reactor design for safety and efficiency. | 工程师们专注于提高反应堆设计的安全性和效率。 |

### 81. handbook  *n.*

| | |
| --- | --- |
| 音标 | /ˈhænd.bʊk/ |
| 中文释义 | 手册 |
| 英文释义 | A book providing information or instructions on a specific subject. |
| freq_rank | 13017 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | student handbook | `education` | Students should refer to the student handbook for important policies and guidelines. | 学生们应参考学生手册以获取重要的政策和指南。 |
| 2 | user handbook | `work` | The company distributed a user handbook to help employees navigate the new software. | 公司分发了用户手册以帮助员工使用新软件。 |
| 3 | reference handbook | `science_tech` | Researchers often consult a reference handbook to find accurate data for their studies. | 研究人员常常查阅参考手册以获取研究所需的准确数据。 |

### 82. theft  *n.*

| | |
| --- | --- |
| 音标 | /θɛft/ |
| 中文释义 | 盗窃 |
| 英文释义 | The act of stealing someone else's property. |
| freq_rank | 5367 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | property theft | `news` | There has been a significant increase in property theft in the city. | 该市的财产盗窃案件显著增加。 |
| 2 | theft prevention | `work` | Companies are investing heavily in theft prevention systems to protect assets. | 公司在盗窃预防系统上投入巨资以保护资产。 |
| 3 | grand theft | `academic` | Grand theft is often charged when the value exceeds a certain threshold. | 当价值超过某一阈值时，通常会被指控为重大盗窃。 |

### 83. nevertheless  *adv./conj.*

| | |
| --- | --- |
| 音标 | /ˈnɛv.ər.ðəˌlɛs/ |
| 中文释义 | 然而 |
| 英文释义 | In spite of that; nonetheless. |
| freq_rank | 2582 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | ..., nevertheless, ... | `news` | The weather was awful; nevertheless, the event continued as planned. | 天气很糟糕，然而，活动还是按计划进行。 |
| 2 | Despite the challenges, nevertheless | `academic` | Despite the challenges, the researchers made significant progress; nevertheless, further work is needed. | 尽管面临挑战，研究人员取得了显著进展，然而，仍需进一步的工作。 |
| 3 | ..., but nevertheless | `daily_life` | I was tired, but nevertheless I finished the project on time. | 我很累，然而我还是按时完成了项目。 |

### 84. promotion  *n.*

| | |
| --- | --- |
| 音标 | /prəˈmoʊ.ʃən/ |
| 中文释义 | 晋升；提升 |
| 英文释义 | Advancement in rank, status, or pay. |
| freq_rank | 3786 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | job promotion | `work` | He received a job promotion after completing his project successfully. | 他在成功完成项目后获得了晋升。 |
| 2 | promotion campaign | `daily_life` | The store launched a promotion campaign to attract more customers. | 商店推出了一项促销活动以吸引更多顾客。 |
| 3 | promotion materials | `education` | Students received promotion materials for the upcoming school event. | 学生们收到了即将举行的学校活动的宣传材料。 |

### 85. feminine  *adj.*

| | |
| --- | --- |
| 音标 | /ˈfɛm.ɪ.nɪn/ |
| 中文释义 | 女性的 |
| 英文释义 | Relating to characteristics typically associated with women. |
| freq_rank | 5815 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | feminine qualities | `culture` | Many cultures value feminine qualities in their traditional beliefs. | 许多文化在其传统信仰中重视女性特质。 |
| 2 | feminine perspective | `academic` | A feminine perspective can greatly enrich discussions on gender studies. | 女性视角可以极大丰富性别研究的讨论。 |
| 3 | feminine fashion | `daily_life` | She has a keen interest in feminine fashion trends and styles. | 她对女性时尚潮流和风格有浓厚的兴趣。 |

### 86. flutter  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈflʌt.ər/ |
| 中文释义 | 拍打；颤动 |
| 英文释义 | To move lightly and quickly in the air. |
| freq_rank | 8041 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | fluttering wings | `daily_life` | Birds are fluttering their wings as they prepare to take off. | 鸟儿在准备起飞时拍动着翅膀。 |
| 2 | flutter in the breeze | `environment` | Leaves flutter in the breeze, creating a soothing sound around us. | 树叶在微风中轻轻摇曳，发出令人放松的声音。 |
| 3 | flutter with anxiety | `work` | She felt her heart flutter with anxiety before the important presentation. | 在重要的演示之前，她感到心中充满了焦虑。 |

### 87. scarcely  *adv.*

| | |
| --- | --- |
| 音标 | /ˈskɛr.sli/ |
| 中文释义 | 几乎不；几乎没有 |
| 英文释义 | Only just; almost not at all. |
| freq_rank | 6981 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | scarcely any evidence | `academic` | Researchers found scarcely any evidence to support the hypothesis. | 研究人员几乎没有发现任何证据来支持这个假设。 |
| 2 | scarcely believable | `news` | The story was so strange that it was scarcely believable to the audience. | 这个故事如此奇怪，以至于观众几乎不相信。 |
| 3 | scarcely a day goes by | `daily_life` | Scarcely a day goes by without thinking about the future. | 几乎每天都在思考未来。 |

### 88. mischief  *n.*

| | |
| --- | --- |
| 音标 | /ˈmɪs.tʃɪf/ |
| 中文释义 | 恶作剧 |
| 英文释义 | Behavior that causes harm or annoyance to others. |
| freq_rank | 11810 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | play mischief | `daily_life` | Children are often known to play mischief, creating chaos around the house. | 孩子们经常会恶作剧，制造家里的混乱。 |
| 2 | mischief maker | `education` | Teachers often caution against being a mischief maker in the classroom, as it disrupts learning. | 老师们常常警告在课堂上成为恶作剧者，因为这样会干扰学习。 |
| 3 | mischief managed | `culture` | At the end of the play, the characters declared that all mischief had been managed satisfactorily. | 在剧结束时，角色们宣称所有的恶作剧都已妥善处理。 |

### 89. faultless  *adj.*

| | |
| --- | --- |
| 音标 | /ˈfɔːlt.ləs/ |
| 中文释义 | 无缺陷的；完美的 |
| 英文释义 | Without faults; perfect in quality or performance. |
| freq_rank | 30991 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | faultless performance | `work` | Her faultless performance during the presentation impressed everyone in the room. | 她在演示中的无缺陷表现让房间里的每个人都印象深刻。 |
| 2 | faultless logic | `academic` | This study presents faultless logic that supports the proposed hypothesis effectively. | 这项研究提出了无缺陷的逻辑，有效地支持了所提出的假设。 |
| 3 | faultless execution | `science_tech` | The engineers ensured faultless execution of the project before the deadline. | 工程师们在截止日期之前确保了项目的无缺陷执行。 |

### 90. corrupt  *adj./v.*

| | |
| --- | --- |
| 音标 | /kəˈrʌpt/ |
| 中文释义 | 腐败的；堕落的 |
| 英文释义 | Dishonest, depraved, or morally compromised behavior or practices. |
| freq_rank | 5850 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | corrupt practices | `work` | Many employers are concerned about corrupt practices in their organizations. | 许多雇主担心他们组织中的腐败行为。 |
| 2 | corrupt officials | `news` | Investigations revealed that several corrupt officials were involved in the scandal. | 调查显示，几名腐败官员参与了这起丑闻。 |
| 3 | corrupt data | `science_tech` | Researchers must ensure that corrupt data does not affect their findings. | 研究人员必须确保腐败数据不影响他们的研究结果。 |

### 91. hitherto  *adv.*

| | |
| --- | --- |
| 音标 | /ˈhɪðərˌtuː/ |
| 中文释义 | 迄今为止 |
| 英文释义 | Up to this time; until now. |
| freq_rank | 16041 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | hitherto unknown | `science_tech` | Many species have remained hitherto unknown to researchers in this remote area. | 许多物种在这个偏远地区迄今为止仍然对研究人员未知。 |
| 2 | hitherto unrecognized | `academic` | The study highlights factors that were hitherto unrecognized in previous research. | 该研究强调了在以往研究中迄今为止未被认识的因素。 |
| 3 | hitherto unaddressed | `news` | This issue has been hitherto unaddressed by policymakers in the recent discussions. | 在最近的讨论中，政策制定者迄今为止未曾解决这个问题。 |

### 92. lining  *n.*

| | |
| --- | --- |
| 音标 | /ˈlaɪ.nɪŋ/ |
| 中文释义 | 衬里 |
| 英文释义 | A material or layer covering the inner surface of something. |
| freq_rank | 9435 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | insulating lining | `science_tech` | Insulating linings are essential for maintaining temperature in cryogenic systems. | 绝热衬里对于维持低温系统的温度至关重要。 |
| 2 | lining materials | `work` | Manufacturers often choose durable lining materials for heavy-duty applications. | 制造商通常为重型应用选择耐用的衬里材料。 |
| 3 | protective lining | `health` | A protective lining helps to shield internal organs from damage during procedures. | 保护性衬里可以在手术过程中保护内脏免受损伤。 |

### 93. adjustable  *adj.*

| | |
| --- | --- |
| 音标 | /əˈdʒʌs.tə.bəl/ |
| 中文释义 | 可调节的 |
| 英文释义 | Capable of being adjusted or modified for different conditions or requirements. |
| freq_rank | 10047 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | adjustable settings | `science_tech` | Innovative devices often feature adjustable settings to enhance user experience. | 创新设备通常具有可调节的设置，以提升用户体验。 |
| 2 | adjustable straps | `daily_life` | Many backpacks come with adjustable straps to provide better comfort and fit. | 许多背包配有可调节的带子，以提供更好的舒适度和贴合度。 |
| 3 | adjustable rate | `work` | The mortgage includes an adjustable rate, which may change over time based on the market. | 这项抵押贷款包含可调利率，可能会根据市场变化而变化。 |

### 94. cradle  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈkreɪ.dl̩/ |
| 中文释义 | 摇篮；怀抱 |
| 英文释义 | A device for holding a baby; a place of nurturing. |
| freq_rank | 8639 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | cradle of civilization | `culture` | Mesopotamia is often referred to as the cradle of civilization. | 美索不达米亚常常被称为文明的摇篮。 |
| 2 | cradle-to-grave | `science_tech` | The study examines the cradle-to-grave impact of plastic waste. | 该研究考察了塑料废物从摇篮到坟墓的影响。 |
| 3 | cradle your child | `daily_life` | Parents often cradle their child gently to soothe them. | 父母常常轻柔地摇抱他们的孩子以安抚他们。 |

### 95. avail  *v./n.*

| | |
| --- | --- |
| 音标 | /əˈveɪl/ |
| 中文释义 | 有助于；可用 |
| 英文释义 | To make use of something for advantage or benefit. |
| freq_rank | 14262 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | avail oneself of | `work` | Many professionals avail themselves of networking opportunities to advance their careers. | 许多专业人士利用社交机会来提升他们的职业生涯。 |
| 2 | avail to | `academic` | Resources can significantly avail to students who require additional support in their studies. | 资源对需要额外学习支持的学生非常有帮助。 |
| 3 | avail the community | `culture` | The new program will avail the community by providing free workshops on local history. | 这个新项目将通过提供关于地方历史的免费讲座来惠及社区。 |

### 96. propagation  *n.*

| | |
| --- | --- |
| 音标 | /ˌprɒpəˈɡeɪʃən/ |
| 中文释义 | 传播 |
| 英文释义 | The act of spreading or promoting something widely. |
| freq_rank | 15569 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | genetic propagation | `science_tech` | Genetic propagation methods are crucial for crop improvement and sustainability. | 遗传传播方法对作物改良和可持续性至关重要。 |
| 2 | propagation of information | `education` | Effective propagation of information enhances students' understanding and engagement in the curriculum. | 有效的信息传播能增强学生对课程的理解和参与。 |
| 3 | radio wave propagation | `daily_life` | Understanding radio wave propagation is essential for optimizing communication systems. | 理解无线电波传播对优化通信系统至关重要。 |

### 97. damn  *n./int./v.*

| | |
| --- | --- |
| 音标 | /dæm/ |
| 中文释义 | 该死；可恶 |
| 英文释义 | Used to express anger or frustration. |
| freq_rank | 4414 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | damn good | `daily_life` | This restaurant serves damn good food that everyone loves. | 这家餐厅的食物非常好吃，大家都喜欢。 |
| 2 | damn near | `news` | The storm damn near caused severe damage to the city. | 这场风暴差点对城市造成严重损害。 |
| 3 | damn thing | `work` | I can’t find the damn thing we need for the project. | 我找不到我们项目需要的那个可恶的东西。 |

### 98. satisfactorily  *adv.*

| | |
| --- | --- |
| 音标 | /ˌsætɪsˈfæktəˌrɪli/ |
| 中文释义 | 令人满意地 |
| 英文释义 | In a way that meets requirements or expectations. |
| freq_rank | 17786 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | performed satisfactorily | `work` | Employees are expected to perform satisfactorily in their assigned tasks. | 员工在分配的任务中应表现令人满意。 |
| 2 | satisfied satisfactorily | `education` | Students reported that their needs were satisfied satisfactorily by the course materials. | 学生们表示，课程材料令他们的需求得到了令人满意的满足。 |
| 3 | managed satisfactorily | `daily_life` | Despite the challenges, she managed to balance her duties satisfactorily. | 尽管面临挑战，她成功地平衡了自己的职责，令人满意。 |

### 99. silicon  *n.*

| | |
| --- | --- |
| 音标 | /ˈsɪlɪkən/ |
| 中文释义 | 硅 |
| 英文释义 | A chemical element used in electronics and solar cells. |
| freq_rank | 8531 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | silicon chips | `science_tech` | Engineers are developing new silicon chips for faster computing. | 工程师们正在开发新的硅芯片，以提升计算速度。 |
| 2 | silicon valley | `news` | Many startups are based in Silicon Valley, attracting global attention. | 许多创业公司位于硅谷，吸引了全球的关注。 |
| 3 | silicon dioxide | `daily_life` | Silicon dioxide is commonly found in sand and glass products. | 二氧化硅通常存在于沙子和玻璃制品中。 |

### 100. influence  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈɪn.flu.əns/ |
| 中文释义 | 影响 |
| 英文释义 | The capacity to have an effect on someone or something. |
| freq_rank | 1392 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | influence people's decisions | `daily_life` | Friends often influence people's decisions about where to eat. | 朋友们经常影响人们的用餐决定。 |
| 2 | influence public opinion | `news` | The media can influence public opinion on important issues. | 媒体可以影响公众对重要问题的看法。 |
| 3 | influence educational outcomes | `education` | Teachers significantly influence educational outcomes for their students. | 教师对学生的教育成果有显著影响。 |
