# 托福词汇内容 batch1 · 送审样本

> 抽 16 词(种子固定 20260803,复跑抽到同样这批)。
> **不是纯随机** —— 贪心挑成尽量铺开 scene 与词性,免得 16 个全是名词、场景全挤在 news。
> 本批覆盖 **10/10 个 scene**、**7 种词性**(adj. / n. / v. / adv. / 词性缺失 / prep. / int.)。
> (`词性缺失` = ECDICT 的 translation 里没有词性前缀,全库 53 个词属于这种,`pos` 为空。)
> 全量 928 词见 `scripts/vocab/data/generated/cet6-content.json`。

## 全量 928 词的分布(不只是抽样这 16 个)

难度档:A2 33 · B1 103 · B2 455 · C1 337

场景(共 2784 条例句):academic 256 · news 282 · daily_life 545 · work 505 · science_tech 305 · health 128 · environment 100 · education 261 · travel 64 · culture 338

## 这批内容是怎么把住质量的

**九道**机器闸门,任一不过就整词重生成(最多 3 次),仍不过记入 `scripts/vocab/data/failed.json`:

| 闸门 | 判据 | 拦的是什么 |
| --- | --- | --- |
| g1 | 句中含 headword 或其屈折形/派生形 | 例句根本没用上目标词 |
| g2 | 例句按档句长(A2 8-12 / B1 8-14 / B2 9-16 / C1 10-20) | 太短没语境 / 太长读不动 |
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

### 5. grants  

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
