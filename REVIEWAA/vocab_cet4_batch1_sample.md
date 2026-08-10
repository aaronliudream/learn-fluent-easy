# 托福词汇内容 batch1 · 送审样本

> 抽 16 词(种子固定 20260803,复跑抽到同样这批)。
> **不是纯随机** —— 贪心挑成尽量铺开 scene 与词性,免得 16 个全是名词、场景全挤在 news。
> 本批覆盖 **10/10 个 scene**、**10 种词性**(n. / v. / adv. / adj. / prep. / num. / aux. / pron. / conj. / 词性缺失)。
> (`词性缺失` = ECDICT 的 translation 里没有词性前缀,全库 53 个词属于这种,`pos` 为空。)
> 全量 3789 词见 `scripts/vocab/data/generated/cet4-content.json`。

## 全量 3789 词的分布(不只是抽样这 16 个)

难度档:A2 679 · B1 1488 · B2 1318 · C1 304

场景(共 11367 条例句):academic 709 · news 1101 · daily_life 2577 · work 2195 · science_tech 1078 · health 532 · environment 405 · education 1293 · travel 279 · culture 1198

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

### 1. appearance  *n.*

| | |
| --- | --- |
| 音标 | /əˈpɪr.əns/ |
| 中文释义 | 外观；出现 |
| 英文释义 | The way someone or something looks to others. |
| freq_rank | 1684 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | physical appearance | `daily_life` | Many people judge others by their physical appearance. | 很多人通过外貌来评判他人。 |
| 2 | public appearance | `news` | The celebrity made a surprise public appearance last night. | 这位名人昨晚突然公开露面。 |
| 3 | initial appearance | `work` | She made an initial appearance in the meeting to introduce herself. | 她在会议上首次亮相以自我介绍。 |

### 2. excite  *v.*

| | |
| --- | --- |
| 音标 | /ɪkˈsaɪt/ |
| 中文释义 | 激发；使兴奋 |
| 英文释义 | To cause strong feelings of enthusiasm or eagerness. |
| freq_rank | 5328 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | excite interest | `education` | Teachers should excite students' interest in learning by using engaging methods. | 教师应通过使用有趣的方法激发学生对学习的兴趣。 |
| 2 | excite emotions | `culture` | Artists often excite emotions through their powerful visual expressions and performances. | 艺术家通常通过强大的视觉表现和表演激发情感。 |
| 3 | excite curiosity | `science_tech` | Innovations in technology excite curiosity about the future of human potential. | 科技创新激发了人们对人类潜力未来的好奇。 |

### 3. permanently  *adv.*

| | |
| --- | --- |
| 音标 | /ˈpɜːr.mə.nənt.li/ |
| 中文释义 | 永久地 |
| 英文释义 | In a way that lasts forever without change. |
| freq_rank | 5676 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | permanently altered | `academic` | Research findings have been permanently altered by new evidence. | 研究结果已被新证据永久改变。 |
| 2 | permanently removed | `environment` | Plastic waste is permanently removed from the ocean each year. | 每年，塑料垃圾会被永久清除出海洋。 |
| 3 | permanently affected | `health` | Many individuals are permanently affected by the side effects of the medication. | 许多人会受到药物副作用的永久影响。 |

### 4. wooden  *adj.*

| | |
| --- | --- |
| 音标 | /ˈwʊd.ən/ |
| 中文释义 | 木制的 |
| 英文释义 | Made of wood or resembling wood in texture. |
| freq_rank | 2512 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | wooden chair | `daily_life` | I bought a beautiful wooden chair for my dining room. | 我为我的餐厅买了一把漂亮的木椅。 |
| 2 | wooden box | `travel` | They packed their souvenirs in a sturdy wooden box. | 他们把纪念品装在一个坚固的木箱里。 |
| 3 | wooden sculpture | `culture` | The gallery displayed a stunning wooden sculpture by a local artist. | 画廊展出了当地艺术家的精美木雕。 |

### 5. amongst  *prep.*

| | |
| --- | --- |
| 音标 | /əˈmʌŋst/ |
| 中文释义 | 在……中；在……之间 |
| 英文释义 | In the middle of or surrounded by a group. |
| freq_rank | 7821 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | amongst friends | `daily_life` | You can always be yourself amongst friends who accept you. | 在朋友中，你可以做真实的自己。 |
| 2 | amongst scholars | `academic` | There is a significant debate amongst scholars regarding the interpretation of this text. | 在学者中，对于这段文本的解读存在重要争论。 |
| 3 | amongst the options | `work` | We need to choose the best strategy amongst the options available. | 我们需要在可用的选项中选择最佳策略。 |

### 6. billion  *num.*

| | |
| --- | --- |
| 音标 | /ˈbɪl.jən/ |
| 中文释义 | 十亿 |
| 英文释义 | A number equal to one thousand million. |
| freq_rank | 612 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | billion dollars | `news` | The company earned over a billion dollars last year. | 该公司去年赚取了超过十亿美元。 |
| 2 | billion people | `culture` | About two billion people use social media worldwide. | 全球约有二十亿人使用社交媒体。 |
| 3 | billion times | `science_tech` | This technology is used billions of times each day. | 这种技术每天使用数十亿次。 |

### 7. ought  *aux./n.*

| | |
| --- | --- |
| 音标 | /ɔt/ |
| 中文释义 | 应该；必须 |
| 英文释义 | Indicates a duty or obligation to do something. |
| freq_rank | 1755 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | ought to | `work` | Employees ought to follow the safety guidelines at all times. | 员工应该始终遵循安全指南。 |
| 2 | ought to be | `education` | Students ought to be respectful to their teachers and peers. | 学生应该尊重他们的老师和同学。 |
| 3 | ought not to | `daily_life` | We ought not to waste food during meals. | 我们在用餐时不应该浪费食物。 |

### 8. whatever  *pron.*

| | |
| --- | --- |
| 音标 | /wɔˈtɛv.ər/ |
| 中文释义 | 无论什么；任何事物 |
| 英文释义 | Used to refer to anything or any choice. |
| freq_rank | 776 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | whatever you want | `daily_life` | You can choose whatever you want for dinner. | 你可以选择任何你想吃的晚餐。 |
| 2 | whatever happens | `news` | The team will support each other whatever happens. | 无论发生什么，团队都会相互支持。 |
| 3 | whatever it takes | `work` | I will do whatever it takes to succeed. | 我会不惜一切代价取得成功。 |

### 9. although  *conj.*

| | |
| --- | --- |
| 音标 | /ɔːlˈðoʊ/ |
| 中文释义 | 尽管 |
| 英文释义 | In spite of the fact that; even though. |
| freq_rank | 378 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | although it was raining | `daily_life` | I went for a walk although it was raining. | 尽管下雨，我还是去散步了。 |
| 2 | although he studied hard | `academic` | He failed the exam although he studied hard. | 尽管他努力学习，他还是没通过考试。 |
| 3 | although they disagreed | `work` | The team finished the project although they disagreed. | 尽管他们有分歧，团队还是完成了项目。 |

### 10. reflexion  

| | |
| --- | --- |
| 音标 | /rɪˈflɛkʃən/ |
| 中文释义 | 反射；深思 |
| 英文释义 | The process of reflecting or considering something carefully. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | self-reflexion | `daily_life` | Many people engage in self-reflexion to better understand their emotions and thoughts. | 很多人进行自我反思，以更好地理解自己的情感和思想。 |
| 2 | cultural reflexion | `culture` | Cultural reflexion plays a crucial role in understanding societal values and beliefs. | 文化反思在理解社会价值观和信仰中起着至关重要的作用。 |
| 3 | scientific reflexion | `science_tech` | Scientific reflexion on past experiments often leads to new hypotheses and discoveries. | 对过去实验的科学反思常常会导致新的假设和发现。 |

### 11. specify  *v.*

| | |
| --- | --- |
| 音标 | /ˈspɛs.ɪ.faɪ/ |
| 中文释义 | 指定；说明 |
| 英文释义 | To state or identify something clearly and precisely. |
| freq_rank | 4860 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | specify the requirements | `work` | Employers must specify the requirements for each job position clearly. | 雇主必须清楚地指定每个职位的要求。 |
| 2 | specify the terms | `academic` | Researchers should specify the terms used in their studies to avoid confusion. | 研究人员应指定他们研究中使用的术语，以避免混淆。 |
| 3 | specify the details | `daily_life` | Please specify the details of your plan so that we can prepare accordingly. | 请指定你的计划的细节，以便我们可以相应准备。 |

### 12. convention  *n.*

| | |
| --- | --- |
| 音标 | /kənˈvɛnʃən/ |
| 中文释义 | 惯例；大会 |
| 英文释义 | A way in which something is usually done or a formal meeting. |
| freq_rank | 2472 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | scientific conventions | `science_tech` | Scientists often attend scientific conventions to share their research. | 科学家常常参加科学大会以分享他们的研究成果。 |
| 2 | social conventions | `daily_life` | Understanding social conventions is important for effective communication. | 理解社会惯例对有效沟通很重要。 |
| 3 | cultural conventions | `culture` | Different cultures have their own unique cultural conventions that shape behavior. | 不同文化有各自独特的文化惯例，塑造行为。 |

### 13. bathe  *v.*

| | |
| --- | --- |
| 音标 | /beɪð/ |
| 中文释义 | 洗澡；沐浴 |
| 英文释义 | To clean oneself in water, typically in a bath or shower. |
| freq_rank | 7550 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | bathe in sunlight | `daily_life` | Many people prefer to bathe in sunlight during the summer months. | 许多人喜欢在夏季的阳光下沐浴。 |
| 2 | bathe the baby | `health` | Parents should bathe the baby gently to ensure comfort and safety. | 父母应该轻柔地给婴儿洗澡，以确保舒适和安全。 |
| 3 | bathe after exercise | `education` | Students should bathe after exercise to maintain good hygiene and health. | 学生们在锻炼后应洗澡，以保持良好的卫生和健康。 |

### 14. unwilling  *adj.*

| | |
| --- | --- |
| 音标 | /ʌnˈwɪl.ɪŋ/ |
| 中文释义 | 不愿意的 |
| 英文释义 | Not wanting to do something; reluctant or disinclined. |
| freq_rank | 6237 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | unwilling participants | `education` | Many students were unwilling participants in the group project. | 许多学生在小组项目中是心不甘情不愿的参与者。 |
| 2 | unwilling to accept | `news` | Governments are often unwilling to accept foreign aid during crises. | 各国政府在危机期间通常不愿接受外援。 |
| 3 | unwilling to compromise | `work` | Employees are often unwilling to compromise on their work-life balance. | 员工通常不愿在工作与生活平衡上妥协。 |

### 15. team  *n./v.*

| | |
| --- | --- |
| 音标 | /tiːm/ |
| 中文释义 | 团队 |
| 英文释义 | A group of individuals working together towards a common goal. |
| freq_rank | 307 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | work as a team | `work` | Employees need to work as a team to succeed. | 员工们需要齐心协力才能成功。 |
| 2 | join a team | `daily_life` | Many students want to join a team for sports. | 很多学生想加入一个运动队。 |
| 3 | lead the team | `academic` | The professor will lead the team in the research project. | 教授将领导这个团队进行研究项目。 |

### 16. rust  *n./v.*

| | |
| --- | --- |
| 音标 | /rʌst/ |
| 中文释义 | 锈；生锈 |
| 英文释义 | A reddish-brown oxide formed on iron due to moisture. |
| freq_rank | 10260 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | rust prevention measures | `work` | Implementing rust prevention measures can significantly extend the life of metal structures. | 实施防锈措施可以显著延长金属结构的使用寿命。 |
| 2 | rust stains | `daily_life` | After the rain, rust stains appeared on the outdoor furniture, requiring immediate cleaning. | 雨后，户外家具上出现了锈斑，需要立即清洗。 |
| 3 | rust particles | `science_tech` | Researchers discovered rust particles in ancient artifacts, indicating their exposure to moisture over time. | 研究人员在古代文物中发现了锈粒，表明它们长期暴露于潮湿环境中。 |
