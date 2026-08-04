# 托福词汇内容 batch1 · 送审样本

> 抽 16 词(种子固定 20260803,复跑抽到同样这批)。
> **不是纯随机** —— 贪心挑成尽量铺开 scene 与词性,免得 16 个全是名词、场景全挤在 news。
> 本批覆盖 **10/10 个 scene**、**7 种词性**(n. / adj. / adv. / v. / 词性缺失 / prep. / conj.)。
> (`词性缺失` = ECDICT 的 translation 里没有词性前缀,全库 53 个词属于这种,`pos` 为空。)
> 全量 198 词见 `scripts/vocab/data/generated/toefl-content.json`。

## 全量 198 词的分布(不只是抽样这 16 个)

难度档:A2 9 · B1 189

场景(共 594 条例句):academic 30 · news 91 · daily_life 101 · work 120 · science_tech 52 · health 34 · environment 11 · education 81 · travel 4 · culture 70

## 这批内容是怎么把住质量的

**九道**机器闸门,任一不过就整词重生成(最多 3 次),仍不过记入 `scripts/vocab/data/failed.json`:

| 闸门 | 判据 | 拦的是什么 |
| --- | --- | --- |
| g1 | 句中含 headword 或其屈折形/派生形 | 例句根本没用上目标词 |
| g2 | 例句 8-16 词 | 太短没语境 / 太长读不动 |
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

### 1. negotiation  *n.*

| | |
| --- | --- |
| 音标 | /nɪˌɡoʊ.ʃiˈeɪ.ʃən/ |
| 中文释义 | 谈判 |
| 英文释义 | The process of discussing terms to reach an agreement. |
| freq_rank | 2259 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | business negotiation | `work` | Businesses often engage in negotiation to resolve conflicts effectively. | 企业通常会进行谈判，以有效解决冲突。 |
| 2 | peace negotiation | `news` | Diplomats are working hard on peace negotiation between the two nations. | 外交官正在为两个国家的和平谈判努力工作。 |
| 3 | salary negotiation | `daily_life` | Many people feel anxious during salary negotiation with their employers. | 许多人在与雇主进行薪资谈判时感到焦虑。 |

### 2. colonial  *adj.*

| | |
| --- | --- |
| 音标 | /kəˈloʊ.ni.əl/ |
| 中文释义 | 与殖民地或殖民地相关的 |
| 英文释义 | Relating to a colony or colonies. |
| freq_rank | 3321 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | colonial rule | `culture` | Colonial rule greatly impacted the local traditions and customs. | 殖民统治对当地传统和习俗产生了重大影响。 |
| 2 | colonial history | `academic` | Studying colonial history helps us understand modern political structures. | 研究殖民历史有助于我们理解现代政治结构。 |
| 3 | colonial architecture | `travel` | Travelers often admire the beauty of colonial architecture in historic cities. | 游客常常赞美历史城市中殖民建筑的美丽。 |

### 3. simultaneously  *adv.*

| | |
| --- | --- |
| 音标 | /ˌsɪməlˈteɪniəsli/ |
| 中文释义 | 同时；同时发生的 |
| 英文释义 | At the same time; occurring together. |
| freq_rank | 3662 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | simultaneously increased | `health` | Many patients simultaneously increased their exercise routines this year. | 许多病人今年同时增加了锻炼。 |
| 2 | simultaneously developed | `science_tech` | The technology is being simultaneously developed in multiple countries. | 这项技术正在多个国家同时开发。 |
| 3 | simultaneously studied | `education` | Students simultaneously studied for their exams while attending classes. | 学生们在上课的同时也学习考试。 |

### 4. minimize  *v.*

| | |
| --- | --- |
| 音标 | /ˈmɪn.ɪ.maɪz/ |
| 中文释义 | 将某物尽可能缩小 |
| 英文释义 | To make something as small as possible. |
| freq_rank | 3941 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | minimize risks | `work` | We should minimize risks in our project planning. | 我们应该在项目规划中减少风险。 |
| 2 | minimize impact | `environment` | Governments aim to minimize the impact of climate change. | 政府旨在减少气候变化的影响。 |
| 3 | minimize costs | `daily_life` | Many people try to minimize costs when shopping for groceries. | 许多人在购买杂货时努力减少开支。 |

### 5. funding  

| | |
| --- | --- |
| 音标 | /ˈfʌndɪŋ/ |
| 中文释义 | 提供财政支持的行为 |
| 英文释义 | The act of providing financial support. |
| freq_rank | 2141 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | funding sources | `work` | Many companies seek diverse funding sources for their projects. | 许多公司寻找多样化的资金来源来支持他们的项目。 |
| 2 | government funding | `education` | Schools often rely on government funding to improve facilities. | 学校通常依赖政府资金来改善设施。 |
| 3 | funding opportunities | `science_tech` | Researchers are excited about new funding opportunities for innovative projects. | 研究人员对创新项目的新资金机会感到兴奋。 |

### 6. amid  *prep.*

| | |
| --- | --- |
| 音标 | /əˈmɪd/ |
| 中文释义 | 在……中间；在……之中 |
| 英文释义 | In the middle of; during something. |
| freq_rank | 3825 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | amid protests | `news` | The government acted swiftly amid protests from the citizens. | 在市民抗议之中，政府迅速采取了行动。 |
| 2 | amid uncertainty | `work` | Amid uncertainty, the team decided to proceed with the project. | 在不确定性中，团队决定继续推进项目。 |
| 3 | amid chaos | `daily_life` | She found her keys amid the chaos of her messy room. | 她在凌乱的房间混乱中找到了她的钥匙。 |

### 7. nonetheless  *conj./adv.*

| | |
| --- | --- |
| 音标 | /ˌnʌn.ðəˈlɛs/ |
| 中文释义 | 尽管如此 |
| 英文释义 | In spite of that; nevertheless. |
| freq_rank | 3298 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | nonetheless, the research shows significant results. | `academic` | Researchers found flaws in the data; nonetheless, the research shows significant results. | 研究人员发现数据存在缺陷，尽管如此，研究仍然显示出显著的结果。 |
| 2 | The project was challenging; nonetheless, we met the deadline. | `work` | The project was challenging; nonetheless, we met the deadline successfully. | 这个项目很具有挑战性，尽管如此，我们还是成功地按时完成了。 |
| 3 | I was tired; nonetheless, I went for a walk. | `daily_life` | Feeling exhausted, I decided to go out; nonetheless, I went for a walk. | 我感到精疲力竭，尽管如此，我还是出去散步了。 |

### 8. complexity  *n.*

| | |
| --- | --- |
| 音标 | /kəmˈplɛks.ɪ.ti/ |
| 中文释义 | 复杂性 |
| 英文释义 | The state of being intricate or complicated. |
| freq_rank | 3757 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | the complexity of the system | `science_tech` | Understanding the complexity of the system requires extensive study. | 理解该系统的复杂性需要大量的研究。 |
| 2 | complexity in education | `education` | Teachers often face complexity in education due to diverse student needs. | 教师们常常因为学生需求的多样性而面临教育中的复杂性。 |
| 3 | the complexity of life | `daily_life` | Life's complexity can be overwhelming for many individuals at times. | 生活的复杂性有时可能让许多人感到不知所措。 |

### 9. grab  *n./v.*

| | |
| --- | --- |
| 音标 | /ɡræb/ |
| 中文释义 | 迅速或突然地抓住某物 |
| 英文释义 | To take hold of something quickly or suddenly. |
| freq_rank | 1477 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | grab a bite | `daily_life` | Let's grab a bite to eat before the movie starts. | 在电影开始前，我们去吃点东西吧。 |
| 2 | grab attention | `news` | The advertisement failed to grab people's attention during the broadcast. | 这则广告在播出期间未能引起人们的注意。 |
| 3 | grab hold | `work` | She needed to grab hold of the ladder to climb up safely. | 她需要抓住梯子才能安全地爬上去。 |

### 10. penalty  *n.*

| | |
| --- | --- |
| 音标 | /ˈpɛn.əl.ti/ |
| 中文释义 | 因违反规定而受到的惩罚或不利后果 |
| 英文释义 | A punishment or disadvantage for an offense or violation. |
| freq_rank | 2680 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | penalties for breaking the rules | `work` | Companies face severe penalties for breaking the rules. | 公司因违反规定而面临严厉的惩罚。 |
| 2 | a penalty fee for late payment | `daily_life` | You will incur a penalty fee for late payment of the bill. | 如果账单逾期付款，您将产生罚款。 |
| 3 | penalty points on your license | `academic` | Students can receive penalty points on their license for academic dishonesty. | 学生因学术不诚实可以在他们的执照上获得罚分。 |

### 11. sanction  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈsæŋkʃən/ |
| 中文释义 | 制裁；许可 |
| 英文释义 | A penalty or approval for an action. |
| freq_rank | 3217 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | impose sanctions | `news` | The government decided to impose sanctions on the country. | 政府决定对该国实施制裁。 |
| 2 | economic sanctions | `work` | Many companies avoid doing business with nations under economic sanctions. | 许多公司避免与受经济制裁的国家做生意。 |
| 3 | sanction for use | `education` | Students must obtain a sanction for use before accessing the resources. | 学生在使用资源之前必须获得使用许可。 |

### 12. coalition  *n.*

| | |
| --- | --- |
| 音标 | /koʊ.əˈlɪʃ.ən/ |
| 中文释义 | 为特定目的或目标而形成的团体 |
| 英文释义 | A group formed for a specific purpose or goal. |
| freq_rank | 2241 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | coalition government | `news` | Several parties formed a coalition government after the elections. | 几个月前的选举后，几个政党组成了联合政府。 |
| 2 | international coalition | `work` | The international coalition addressed climate change through collaborative efforts. | 国际联盟通过合作努力应对气候变化。 |
| 3 | coalition of support | `culture` | Artists often seek a coalition of support from local communities for their projects. | 艺术家们通常希望从当地社区获得对其项目的支持联盟。 |

### 13. contractor  *n.*

| | |
| --- | --- |
| 音标 | /ˈkɒn.træk.tər/ |
| 中文释义 | 根据合同提供服务的个人或公司。 |
| 英文释义 | A person or company that provides services under a contract. |
| freq_rank | 3745 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | general contractor | `work` | Many builders depend on a general contractor to manage their projects. | 许多建筑商依赖总承包商来管理他们的项目。 |
| 2 | independent contractor | `daily_life` | She works as an independent contractor, allowing her more flexibility in her schedule. | 她作为独立承包商工作，这样能让她的日程更灵活。 |
| 3 | contractor license | `education` | Obtaining a contractor license requires passing several state exams and meeting qualifications. | 获得承包商执照需要通过多个州考试并满足资格要求。 |

### 14. hallway  *n.*

| | |
| --- | --- |
| 音标 | /ˈhɔːl.weɪ/ |
| 中文释义 | 建筑内部的长而狭窄的通道。 |
| 英文释义 | A long narrow passage inside a building. |
| freq_rank | 3559 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | hallway light | `daily_life` | She switched on the hallway light at night. | 她在晚上打开了走廊的灯。 |
| 2 | hallway noise | `work` | The hallway noise made it hard to concentrate during the meeting. | 走廊的噪音让人很难在会议上集中注意力。 |
| 3 | hallway decoration | `culture` | They chose elegant hallway decorations for the event. | 他们为活动选择了优雅的走廊装饰。 |

### 15. survivor  *n.*

| | |
| --- | --- |
| 音标 | /sərˈvaɪ.vər/ |
| 中文释义 | 在某个事件后仍然存活的人 |
| 英文释义 | A person remaining alive after an event. |
| freq_rank | 3011 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | survivor of an accident | `news` | Many survivors of the accident were treated at local hospitals. | 许多事故幸存者在当地医院接受治疗。 |
| 2 | survivor stories | `culture` | Documentaries often feature survivor stories from historical tragedies. | 纪录片常常讲述历史悲剧中的幸存者故事。 |
| 3 | survivor benefits | `work` | Employees may receive survivor benefits after a colleague's passing. | 员工在同事去世后可能会获得幸存者福利。 |

### 16. flavor  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈfleɪ.vɚ/ |
| 中文释义 | 独特的味道或某物的特质 |
| 英文释义 | A distinctive taste or quality of something. |
| freq_rank | 3118 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | unique flavor | `daily_life` | Many people enjoy trying ice cream with unique flavors each summer. | 许多人喜欢在夏天尝试各种独特口味的冰淇淋。 |
| 2 | add flavor | `culture` | Chefs often add herbs to dishes to enhance their flavor. | 厨师们常常在菜肴中加入香草以增强风味。 |
| 3 | flavor profile | `science_tech` | The flavor profile of this wine is complex and intriguing to sommeliers. | 这种葡萄酒的风味特征对品酒师来说复杂而引人入胜。 |
