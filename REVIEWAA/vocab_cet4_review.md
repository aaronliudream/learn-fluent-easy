# cet4 词库内容 · 送审件(抽 100 词)

> 抽样种子固定 20260803,复跑抽到同一批。**不是纯随机** —— 贪心挑成尽量铺开场景与词性,
> 免得 100 个里大半是名词、场景全挤在 news。
> 本批覆盖 **10/10 个场景**、**10 种词性**。
> 全量内容见 `scripts/vocab/data/generated/cet4-content.json`。

## 全量 3789 词的实测分布

| 项 | 实测 |
| --- | --- |
| 词条 | 3789 |
| 例句 | 11367(平均每词 3.00 条) |
| 难度档 | A2 679 · B1 1488 · B2 1318 · C1 304 |
| ECDICT 未标词性 | 2 词 |
| 跨词性(pos 含 `/`) | 1646 词(43.4%) |
| 一次过闸 | 3065 词 · 重试后才过 724 词 |
| 人工撰写 | 0 词 |

场景分布(共 11367 条例句):academic 709 · news 1101 · daily_life 2577 · work 2195 · science_tech 1078 · health 532 · environment 405 · education 1293 · travel 279 · culture 1198

## 请重点看这四点

1. **中文释义准不准** —— 有没有把次要义当主义、有没有并列近义词充数。
2. **搭配是不是真高频**,顺序是不是真按频率(句 1 应当是最常见的说法)。
3. **例句像不像人写的** —— 三句之间是不是真换了写法,不是同一个模子换词。
4. **难度档合不合适** —— 高频词配短句、低频学术词配长句。

## ⚠️ 我自己知道的薄弱点(不用你去找)

- **跨词性词的义项**:本批有 1646 个跨词性词。提示词里加了"跨词性几乎必然对应词典
  分列义项"的自查,实测 state → 状态；国家 ✓、part → 部分；分开 ✓,但 **might(n./aux.)
  仍然给「可能；或许」** —— 近义堆砌且漏了名词义"力量"。没继续迭代提示词(边际收益递减),
  这类**只能靠人审兜**,请留意跨词性词的第二个义项。
- **个别搭配不是真搭配**:如 system 的 "local system"、part 的
  "Understanding is part of the problem we face"(语义空转)。机器闸门只能判"搭配里含不含
  目标词",判不了"这个搭配母语者到底说不说"。


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

### 10. reflexion  *(ECDICT 没标词性)*

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

### 17. decay  *n./v.*

| | |
| --- | --- |
| 音标 | /dɪˈkeɪ/ |
| 中文释义 | 衰变；腐烂 |
| 英文释义 | The process of declining or deteriorating in quality. |
| freq_rank | 7931 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | to decay over time | `science_tech` | Organic materials tend to decay over time if not preserved properly. | 如果不妥善保存，有机材料往往会随时间衰变。 |
| 2 | to prevent decay | `health` | Doctors emphasize the importance of oral hygiene to prevent decay in teeth. | 医生强调良好口腔卫生的重要性，以防止牙齿衰变。 |
| 3 | the decay of society | `culture` | Many believe that the decay of society stems from a lack of moral values. | 许多人认为，社会的衰变源于道德价值观的缺失。 |

### 18. hostile  *adj./n.*

| | |
| --- | --- |
| 音标 | /ˈhɒs.taɪl/ |
| 中文释义 | 敌对的；敌意的 |
| 英文释义 | Unfriendly, antagonistic, or opposed to something or someone. |
| freq_rank | 4163 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | hostile environment | `work` | Employers must recognize the signs of a hostile environment in the workplace. | 雇主必须认识到工作场所中敌对环境的迹象。 |
| 2 | hostile takeover | `news` | The company faced a hostile takeover attempt from a rival organization last year. | 这家公司去年面临了来自竞争对手的敌意收购尝试。 |
| 3 | hostile forces | `science_tech` | Researchers studied the effects of hostile forces on ecosystem stability. | 研究人员研究了敌对力量对生态系统稳定性的影响。 |

### 19. cigarette  *n.*

| | |
| --- | --- |
| 音标 | /ˌsɪɡ.əˈrɛt/ |
| 中文释义 | 香烟 |
| 英文释义 | A small roll of cut tobacco wrapped in paper for smoking. |
| freq_rank | 2111 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | smoke a cigarette | `daily_life` | Many people smoke a cigarette during their break at work. | 很多人在工作休息期间抽香烟。 |
| 2 | light a cigarette | `health` | He decided to light a cigarette after finishing lunch outside. | 他在户外吃完午餐后决定点燃一支香烟。 |
| 3 | discard a cigarette | `environment` | You should discard a cigarette responsibly to avoid littering. | 你应该负责任地丢弃香烟，以避免乱扔垃圾。 |

### 20. jaw  *n./v.*

| | |
| --- | --- |
| 音标 | /dʒɔː/ |
| 中文释义 | 下颚；颚骨 |
| 英文释义 | The lower part of the face that moves when speaking or eating. |
| freq_rank | 4087 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | clench one's jaw | `daily_life` | She often clenches her jaw when stressed or anxious. | 她在压力大或焦虑时常常咬紧下颚。 |
| 2 | jaw pain | `health` | Many people experience jaw pain due to teeth grinding at night. | 许多人因晚上磨牙而感到下颚疼痛。 |
| 3 | jaw structure | `science_tech` | Researchers studied the jaw structure of ancient species for insights. | 研究人员研究古代物种的下颚结构以获取见解。 |

### 21. goal  *n./v.*

| | |
| --- | --- |
| 音标 | /ɡoʊl/ |
| 中文释义 | 目标 |
| 英文释义 | The object of a person's ambition or effort. |
| freq_rank | 681 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | set a goal | `work` | Many employees set a goal to improve their skills. | 许多员工设定目标以提升自己的技能。 |
| 2 | reach a goal | `education` | Students often work hard to reach a goal in their studies. | 学生们常常努力学习以达成他们的学习目标。 |
| 3 | achieve a goal | `daily_life` | You can achieve a goal if you stay focused and determined. | 如果你保持专注和决心，就能实现目标。 |

### 22. suck  *v./n.*

| | |
| --- | --- |
| 音标 | /sʌk/ |
| 中文释义 | 吸；吮 |
| 英文释义 | To draw into the mouth by creating a vacuum. |
| freq_rank | 3618 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | suck up to | `work` | Many employees suck up to their bosses for promotions. | 许多员工为了升职而讨好他们的老板。 |
| 2 | suck it up | `daily_life` | You need to suck it up and accept the decision. | 你需要忍耐并接受这个决定。 |
| 3 | suck blood | `science_tech` | Some parasites suck blood from their hosts to survive. | 一些寄生虫从宿主身上吸血以维持生存。 |

### 23. slippery  *adj.*

| | |
| --- | --- |
| 音标 | /ˈslɪp.ər.i/ |
| 中文释义 | 光滑的；滑的 |
| 英文释义 | Difficult to hold or stand on due to a smooth surface. |
| freq_rank | 7707 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | slippery slope | `science_tech` | Researchers warn that a slippery slope can lead to unintended consequences. | 研究人员警告说，滑坡效应可能导致意想不到的后果。 |
| 2 | slippery road | `daily_life` | Drivers should be cautious on slippery roads during rainy weather conditions. | 在雨天，司机应该对滑溜的道路保持警惕。 |
| 3 | slippery fish | `culture` | Catching a slippery fish requires skill and patience for successful fishing. | 捕捉滑溜的鱼需要技巧和耐心才能成功钓鱼。 |

### 24. greet  *v.*

| | |
| --- | --- |
| 音标 | /ɡrit/ |
| 中文释义 | 问候 |
| 英文释义 | To acknowledge someone with a sign or words of welcome. |
| freq_rank | 3475 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | greet visitors | `work` | Our team members greet visitors warmly at the reception. | 我们的团队成员在接待处热情地问候来访者。 |
| 2 | greet each other | `daily_life` | Friends often greet each other with hugs and smiles. | 朋友们经常用拥抱和微笑互相问候。 |
| 3 | greet students | `education` | Teachers greet students at the entrance of the school every morning. | 老师们每天早晨在学校入口处问候学生。 |

### 25. evaluate  *v.*

| | |
| --- | --- |
| 音标 | /ɪˈvæljʊˌeɪt/ |
| 中文释义 | 评估 |
| 英文释义 | To judge or determine the value or quality of something. |
| freq_rank | 2339 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | evaluate the effectiveness | `education` | Teachers often evaluate the effectiveness of their teaching methods. | 老师们经常评估他们教学方法的有效性。 |
| 2 | evaluate performance | `work` | Managers need to regularly evaluate employee performance to provide feedback. | 经理需要定期评估员工绩效以提供反馈。 |
| 3 | evaluate options | `daily_life` | Before making a decision, it's wise to evaluate all options carefully. | 在做决定之前，仔细评估所有选项是明智的。 |

### 26. relevant  *adj.*

| | |
| --- | --- |
| 音标 | /ˈrɛl.ə.vənt/ |
| 中文释义 | 相关的；重要的 |
| 英文释义 | Important or significant in relation to something. |
| freq_rank | 2814 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | relevant information | `work` | Managers need relevant information to make effective decisions. | 管理者需要相关的信息来做出有效的决策。 |
| 2 | relevant issues | `news` | Many relevant issues were discussed during the conference today. | 今天的会议讨论了许多相关的问题。 |
| 3 | relevant content | `education` | Students should focus on relevant content for their exams. | 学生应该关注与考试相关的内容。 |

### 27. dare  *n./v.*

| | |
| --- | --- |
| 音标 | /dɛr/ |
| 中文释义 | 敢；挑战 |
| 英文释义 | To have the courage to do something. |
| freq_rank | 3348 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | dare to dream | `daily_life` | Many people dare to dream of a better future. | 许多人敢于梦想更美好的未来。 |
| 2 | dare someone to do something | `work` | She dared her colleague to take on the challenging project. | 她挑战同事去承担这个具有挑战性的项目。 |
| 3 | dare not | `academic` | Students dare not express their opinions in class discussions. | 学生们不敢在课堂讨论中表达自己的观点。 |

### 28. impossible  *adj.*

| | |
| --- | --- |
| 音标 | /ɪmˈpɑːsəbl/ |
| 中文释义 | 不可能的 |
| 英文释义 | Not able to occur, exist, or be done. |
| freq_rank | 1606 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | impossible task | `work` | Completing the project on time felt like an impossible task. | 按时完成这个项目让人觉得是不可能的任务。 |
| 2 | impossible situation | `daily_life` | She found herself in an impossible situation with no clear solution. | 她发现自己处于一个没有明确解决方案的不可能局面。 |
| 3 | impossible dream | `culture` | Many believe that achieving world peace is an impossible dream. | 许多人相信，实现世界和平是不可能的梦想。 |

### 29. purse  *n./v.*

| | |
| --- | --- |
| 音标 | /pɜrs/ |
| 中文释义 | 钱包；小包 |
| 英文释义 | A small bag used for carrying money and personal items. |
| freq_rank | 4358 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | designer purse | `daily_life` | She bought a new designer purse for her birthday celebration. | 她为自己的生日庆祝买了一个新的设计师钱包。 |
| 2 | purse strings | `work` | The financial manager controls the purse strings for the entire department. | 财务经理掌控着整个部门的资金。 |
| 3 | purse of gold | `culture` | Legends often speak of a magical purse of gold granting wishes. | 传说中常常提到一个能实现愿望的金色钱包。 |

### 30. exceed  *v.*

| | |
| --- | --- |
| 音标 | /ɪkˈsiːd/ |
| 中文释义 | 超出；超过 |
| 英文释义 | To go beyond a limit or expectation. |
| freq_rank | 3281 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | exceed expectations | `work` | Employers expect candidates to exceed expectations during interviews. | 雇主希望候选人在面试中超出预期。 |
| 2 | exceed limits | `science_tech` | New technology may exceed limits previously thought unbreakable. | 新技术可能会超出之前认为无法突破的限制。 |
| 3 | exceed the maximum | `health` | Patients should not exceed the maximum dosage of medication prescribed. | 患者不应超过所开药物的最大剂量。 |

### 31. warmth  *n.*

| | |
| --- | --- |
| 音标 | /wɔrmθ/ |
| 中文释义 | 温暖；热情 |
| 英文释义 | A state of being warm or an expression of affection. |
| freq_rank | 4749 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | warmth of community | `culture` | Communities can provide warmth of support during challenging times. | 在困难时期，社区可以提供温暖的支持。 |
| 2 | warmth of friendship | `daily_life` | She appreciated the warmth of friendship in her life. | 她感激生活中友谊的温暖。 |
| 3 | warmth of the sun | `travel` | The warmth of the sun made our beach day enjoyable. | 阳光的温暖让我们的海滩之旅变得愉快。 |

### 32. inside  *n./adj./adv./prep.*

| | |
| --- | --- |
| 音标 | /ˈɪn.saɪd/ |
| 中文释义 | 内部；里面 |
| 英文释义 | Situated within; the inner part of something. |
| freq_rank | 964 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | inside the house | `daily_life` | They are playing games inside the house today. | 他们今天在屋子里玩游戏。 |
| 2 | inside information | `news` | She shared inside information about the company's plans. | 她分享了关于公司计划的内部消息。 |
| 3 | inside your mind | `culture` | Think about what is happening inside your mind now. | 想想现在你心里发生了什么。 |

### 33. self  *n./v./adj.*

| | |
| --- | --- |
| 音标 | /sɛlf/ |
| 中文释义 | 自我 |
| 英文释义 | Personal identity or individual as distinct from others. |
| freq_rank | 2162 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | self-help resources | `daily_life` | Many people find self-help resources useful for personal growth. | 许多人发现自助资源对个人成长很有帮助。 |
| 2 | self-esteem issues | `health` | Addressing self-esteem issues can significantly improve your mental health. | 解决自尊问题可以显著改善你的心理健康。 |
| 3 | self-assessment tools | `education` | Teachers often use self-assessment tools to gauge student progress. | 教师经常使用自评工具来评估学生的进步。 |

### 34. complicate  *v.*

| | |
| --- | --- |
| 音标 | /ˈkɒmplɪkeɪt/ |
| 中文释义 | 使复杂化 |
| 英文释义 | To make something more difficult or intricate than necessary. |
| freq_rank | 5983 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | complicate matters | `work` | New regulations can complicate matters for small businesses trying to comply. | 新规定可能会使小企业在遵守时变得复杂。 |
| 2 | complicate the situation | `news` | Political tensions may complicate the situation in the region further. | 政治紧张局势可能会使该地区的情况更加复杂。 |
| 3 | complicate issues | `academic` | Research findings can complicate issues surrounding climate change adaptation strategies. | 研究结果可能会使气候变化适应战略中的问题变得复杂。 |

### 35. department  *n.*

| | |
| --- | --- |
| 音标 | /dɪˈpɑːrt.mənt/ |
| 中文释义 | 部门 |
| 英文释义 | A distinct part of an organization or institution. |
| freq_rank | 1198 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | marketing department | `work` | She works in the marketing department of the company. | 她在公司的市场部门工作。 |
| 2 | department of education | `education` | The department of education oversees all schools in the state. | 教育部门监管该州所有学校。 |
| 3 | department store | `daily_life` | We bought clothes at the department store downtown. | 我们在市中心的百货商店买了衣服。 |

### 36. stony  *adj.*

| | |
| --- | --- |
| 音标 | /ˈstoʊ.ni/ |
| 中文释义 | 多石的；冷酷的 |
| 英文释义 | Characterized by or full of stones; harsh or unfeeling. |
| freq_rank | 11616 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | stony landscape | `environment` | A stony landscape surrounded the ancient ruins, creating an eerie atmosphere. | 古老遗址周围是一片多石的风景，营造出一种阴森的氛围。 |
| 2 | stony silence | `daily_life` | During the meeting, a stony silence fell over the group after the controversial statement. | 会议上，争议性发言后，组内陷入了多石的沉默。 |
| 3 | stony heart | `culture` | He was known for his stony heart, showing little empathy towards others in need. | 他因冷酷无情而闻名，几乎对有需要的他人没有同情心。 |

### 37. gradual  *adj./n.*

| | |
| --- | --- |
| 音标 | /ˈɡrædʒ.u.əl/ |
| 中文释义 | 逐渐的 |
| 英文释义 | Happening slowly over a period of time. |
| freq_rank | 6796 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | gradual increase | `science_tech` | Researchers noted a gradual increase in temperature over the years. | 研究人员观察到气温逐年逐渐上升。 |
| 2 | gradual change | `environment` | Ecosystems often undergo gradual change due to climate variations. | 生态系统常因气候变化而经历逐渐的变化。 |
| 3 | gradual improvement | `health` | Patients experienced gradual improvement in their condition after treatment. | 患者在治疗后，状况逐渐好转。 |

### 38. recorder  *n.*

| | |
| --- | --- |
| 音标 | /rɪˈkɔːr.dər/ |
| 中文释义 | 录音机；记录器 |
| 英文释义 | A device for recording sounds or images. |
| freq_rank | 6015 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | digital recorder | `education` | Teachers often use a digital recorder to capture lectures for students. | 老师们经常使用数字录音机来录制学生的讲座。 |
| 2 | voice recorder | `daily_life` | Many people rely on a voice recorder for taking notes during meetings. | 许多人依靠录音机在会议中做笔记。 |
| 3 | tape recorder | `culture` | A vintage tape recorder can evoke memories of the past for older generations. | 复古的录音机能唤起老一辈人对过去的记忆。 |

### 39. crystal  *n./adj.*

| | |
| --- | --- |
| 音标 | /ˈkrɪs.təl/ |
| 中文释义 | 水晶；晶体 |
| 英文释义 | A solid transparent mineral or glass structure. |
| freq_rank | 3574 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | crystal clear | `daily_life` | The lake was crystal clear, perfect for swimming on hot days. | 湖水晶莹剔透，非常适合在炎热的日子里游泳。 |
| 2 | crystal ball | `science_tech` | Scientists use a crystal ball to predict future climate changes. | 科学家使用水晶球来预测未来的气候变化。 |
| 3 | crystal structure | `education` | Understanding crystal structure is essential for material science students. | 理解晶体结构对材料科学的学生至关重要。 |

### 40. rival  *n./adj.*

| | |
| --- | --- |
| 音标 | /ˈraɪ.vəl/ |
| 中文释义 | 竞争对手；对立者 |
| 英文释义 | A person or entity competing with another for the same objective. |
| freq_rank | 4346 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | rival companies | `work` | Many rival companies are competing for market dominance this year. | 许多竞争对手公司今年都在争夺市场主导地位。 |
| 2 | rival teams | `culture` | The rival teams faced off in a thrilling championship match last weekend. | 上个周末，竞争对手球队在一场激动人心的决赛中对决。 |
| 3 | rival factions | `news` | Reports indicated that rival factions within the party are causing significant tension. | 报告指出，党内的竞争派系正在造成严重的紧张局势。 |

### 41. yearly  *adj./adv.*

| | |
| --- | --- |
| 音标 | /ˈjɪr.li/ |
| 中文释义 | 每年的 |
| 英文释义 | Occurring once a year; annual in nature. |
| freq_rank | 8913 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | yearly report | `work` | The team submitted the yearly report before the deadline. | 团队在截止日期之前提交了年度报告。 |
| 2 | yearly budget | `education` | Schools need to prepare a yearly budget for their expenses. | 学校需要为其开支准备年度预算。 |
| 3 | yearly meeting | `daily_life` | Our community holds a yearly meeting to discuss future plans. | 我们社区每年召开一次会议讨论未来计划。 |

### 42. veteran  *n./adj.*

| | |
| --- | --- |
| 音标 | /ˈvɛt.ər.ən/ |
| 中文释义 | 老兵；退伍军人 |
| 英文释义 | A person who has long experience in a particular field. |
| freq_rank | 2389 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | veteran soldier | `news` | Many veteran soldiers struggle to adjust to civilian life after service. | 许多老兵在退役后很难适应平民生活。 |
| 2 | veteran status | `work` | Employees with veteran status receive additional benefits in our company. | 在我们公司，拥有老兵身份的员工会获得额外的福利。 |
| 3 | veteran's benefits | `daily_life` | Understanding veteran's benefits can be challenging for many families. | 了解老兵福利对许多家庭来说可能很有挑战性。 |

### 43. complicated  *adj.*

| | |
| --- | --- |
| 音标 | /ˈkɒmplɪˌkeɪtɪd/ |
| 中文释义 | 复杂的 |
| 英文释义 | Not easy to understand or deal with due to many parts. |
| freq_rank | 2750 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | complicated process | `science_tech` | Many researchers believe the process is more complicated than previously thought. | 许多研究人员认为这个过程比以前认为的更复杂。 |
| 2 | complicated relationship | `daily_life` | Their relationship became complicated after they started working together. | 他们开始一起工作后，关系变得复杂。 |
| 3 | complicated issue | `news` | The article discusses a complicated issue that affects many citizens. | 这篇文章讨论了一个影响许多公民的复杂问题。 |

### 44. turnip  *n.*

| | |
| --- | --- |
| 音标 | /ˈtɜrnɪp/ |
| 中文释义 | 萝卜 |
| 英文释义 | A root vegetable with a white or yellow round shape. |
| freq_rank | 15232 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | turnips are rich in nutrients | `health` | Eating turnips are beneficial for your overall health and well-being. | 食用萝卜对你的整体健康和福祉有益。 |
| 2 | turnip greens | `daily_life` | Many people enjoy cooking turnip greens as a nutritious side dish. | 许多人喜欢将萝卜叶作为营养丰富的配菜烹饪。 |
| 3 | turnip soup | `culture` | At family gatherings, a traditional dish is turnip soup, often served during winter. | 在家庭聚会上，一道传统菜肴是萝卜汤，通常在冬季食用。 |

### 45. thirst  *n./v.*

| | |
| --- | --- |
| 音标 | /θɜrst/ |
| 中文释义 | 口渴 |
| 英文释义 | A strong desire to drink water or other liquids. |
| freq_rank | 10813 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | thirst for knowledge | `academic` | Students often exhibit a thirst for knowledge that drives their academic pursuits. | 学生们常常表现出对知识的渴望，这推动着他们的学术追求。 |
| 2 | thirst quencher | `daily_life` | Hydration drinks serve as excellent thirst quenchers during hot summer days. | 在炎热的夏天，补水饮料是极好的解渴饮品。 |
| 3 | thirst for success | `work` | Many professionals have an unyielding thirst for success that motivates them in their careers. | 许多职场人士对成功有着不屈的渴望，这激励着他们在职业生涯中不断前进。 |

### 46. frog  *n.*

| | |
| --- | --- |
| 音标 | /frɔg/ |
| 中文释义 | 青蛙 |
| 英文释义 | A small, tailless amphibian with long hind legs for jumping. |
| freq_rank | 5370 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | green frogs | `environment` | Green frogs are commonly found in wetlands across the United States. | 绿青蛙通常生活在美国的湿地中。 |
| 2 | frog population | `science_tech` | The decreasing frog population indicates potential ecological issues in the region. | 青蛙数量的减少表明该地区可能存在生态问题。 |
| 3 | frog species | `academic` | Several frog species are known for their unique mating calls during the breeding season. | 多个青蛙物种以其独特的求偶叫声而闻名。 |

### 47. stuff  *n./v.*

| | |
| --- | --- |
| 音标 | /stʌf/ |
| 中文释义 | 东西；物品 |
| 英文释义 | Various objects or materials, often in large quantities. |
| freq_rank | 996 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | stuff to do | `daily_life` | I have a lot of stuff to do today. | 我今天有很多事情要做。 |
| 2 | bunch of stuff | `work` | She brought a bunch of stuff for the meeting. | 她带了很多东西来开会。 |
| 3 | extra stuff | `education` | You can find extra stuff in the library for your project. | 你可以在图书馆找到项目所需的额外资料。 |

### 48. noun  *n.*

| | |
| --- | --- |
| 音标 | /naʊn/ |
| 中文释义 | 名词 |
| 英文释义 | A word used to identify a person, place, thing, or idea. |
| freq_rank | 13780 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | common nouns | `education` | Students often struggle to distinguish between common nouns and proper nouns. | 学生常常难以区分普通名词和专有名词。 |
| 2 | abstract nouns | `academic` | Exploring abstract nouns helps deepen the understanding of language and thought. | 探索抽象名词有助于加深对语言和思想的理解。 |
| 3 | countable nouns | `work` | In business writing, countable nouns must be used correctly to convey clarity. | 在商业写作中，可数名词必须正确使用以传达清晰。 |

### 49. setting  *n.*

| | |
| --- | --- |
| 音标 | /ˈsɛt.ɪŋ/ |
| 中文释义 | 环境；设置 |
| 英文释义 | The place or environment where something occurs. |
| freq_rank | 1742 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | cultural setting | `culture` | Different cultural settings can influence people's behavior significantly. | 不同的文化环境可以显著影响人们的行为。 |
| 2 | learning setting | `education` | An interactive learning setting promotes better engagement among students. | 互动学习环境能促进学生之间更好的参与。 |
| 3 | business setting | `work` | In a business setting, clear communication is essential for success. | 在商业环境中，清晰的沟通对成功至关重要。 |

### 50. area  *n.*

| | |
| --- | --- |
| 音标 | /ˈɛr.i.ə/ |
| 中文释义 | 区域；面积 |
| 英文释义 | A space or region defined by specific limits or qualities. |
| freq_rank | 230 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | study area | `academic` | Students must choose a study area for their project. | 学生必须为他们的项目选择一个研究区域。 |
| 2 | urban area | `daily_life` | Many people live in urban areas near the city. | 许多人住在城市附近的城市区域。 |
| 3 | safe area | `health` | This is a safe area for children to play outside. | 这是一个儿童可以在外面玩耍的安全区域。 |

### 51. continue  *v.*

| | |
| --- | --- |
| 音标 | /kənˈtɪn.juː/ |
| 中文释义 | 继续 |
| 英文释义 | To keep doing something without stopping. |
| freq_rank | 293 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | continue working | `work` | I will continue working on the project tomorrow. | 我明天将继续进行这个项目。 |
| 2 | continue learning | `education` | Students should continue learning new skills every day. | 学生们每天都应该继续学习新技能。 |
| 3 | continue to grow | `environment` | The trees continue to grow despite the harsh weather. | 尽管天气恶劣，树木依然持续生长。 |

### 52. loss  *n.*

| | |
| --- | --- |
| 音标 | /lɔs/ |
| 中文释义 | 损失；丧失 |
| 英文释义 | The state of no longer having something. |
| freq_rank | 788 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | loss of life | `news` | The earthquake caused a significant loss of life. | 这场地震造成了重大的人员伤亡。 |
| 2 | loss of income | `work` | Many families faced a loss of income during the pandemic. | 许多家庭在疫情期间面临收入减少的问题。 |
| 3 | financial losses | `academic` | Companies report their financial losses at the end of the year. | 公司在年末报告其财务损失。 |

### 53. generator  *n.*

| | |
| --- | --- |
| 音标 | /dʒəˈneɪ.tər/ |
| 中文释义 | 发电机 |
| 英文释义 | A device that converts mechanical energy into electrical energy. |
| freq_rank | 5836 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | electric generator | `science_tech` | Electric generators play a crucial role in power production systems. | 发电机在电力生产系统中发挥着至关重要的作用。 |
| 2 | backup generator | `work` | Companies often invest in backup generators to ensure operations during power outages. | 公司常常投资于备用发电机，以确保在停电时的正常运作。 |
| 3 | wind generator | `environment` | Wind generators harness natural energy from wind to produce electricity. | 风力发电机利用自然风能来发电。 |

### 54. section  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈsɛk.ʃən/ |
| 中文释义 | 部分；章节 |
| 英文释义 | A distinct part or subdivision of something larger. |
| freq_rank | 818 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | section of the report | `work` | A section of the report needs to be revised. | 报告的一部分需要修改。 |
| 2 | section of the book | `education` | This section of the book explains the main concepts. | 这本书的这一部分解释了主要概念。 |
| 3 | news section | `news` | Many people read the news section every morning. | 很多人每天早晨阅读新闻部分。 |

### 55. dictate  *v./n.*

| | |
| --- | --- |
| 音标 | /dɪkˈteɪt/ |
| 中文释义 | 口述；命令 |
| 英文释义 | To say or read aloud for someone else to write down. |
| freq_rank | 4933 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | dictate terms | `work` | Employers often dictate terms to their employees during negotiations. | 雇主在谈判中常常对员工下达条件。 |
| 2 | dictate policy | `academic` | Researchers argue that funding sources can dictate policy decisions in science. | 研究人员认为资金来源可能会影响科学中的政策决策。 |
| 3 | dictate behavior | `culture` | Cultural norms usually dictate behavior in social settings among individuals. | 文化规范通常在社交场合中影响个体的行为。 |

### 56. feasible  *adj.*

| | |
| --- | --- |
| 音标 | /ˈfiː.zə.bəl/ |
| 中文释义 | 可行的 |
| 英文释义 | Capable of being done or carried out successfully. |
| freq_rank | 7591 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | feasible solution | `work` | Finding a feasible solution to the problem requires teamwork and creativity. | 找到问题的可行解决方案需要团队合作和创造力。 |
| 2 | feasible plan | `education` | The proposed curriculum changes need to be a feasible plan for implementation. | 提议的课程变更需要是一个可行的实施计划。 |
| 3 | feasible option | `science_tech` | Researchers are exploring a feasible option for renewable energy sources. | 研究人员正在探索可行的可再生能源选择。 |

### 57. consider  *v.*

| | |
| --- | --- |
| 音标 | /kənˈsɪd.ər/ |
| 中文释义 | 考虑 |
| 英文释义 | Think about something carefully, especially before making a decision. |
| freq_rank | 394 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | consider the options | `work` | You should consider the options before choosing a solution. | 在选择解决方案之前，你应该考虑这些选项。 |
| 2 | consider the impact | `environment` | Many people consider the impact of pollution on health. | 许多人考虑污染对健康的影响。 |
| 3 | consider a proposal | `daily_life` | She will consider a proposal to go on vacation. | 她会考虑一个去度假的提议。 |

### 58. semiconductor  *n.*

| | |
| --- | --- |
| 音标 | /ˈsɛmɪˌkənˌdʌktər/ |
| 中文释义 | 半导体 |
| 英文释义 | A material that partially conducts electricity, used in electronics. |
| freq_rank | 8736 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | semiconductor industry | `work` | The semiconductor industry has seen significant growth this past year. | 半导体行业在过去一年中经历了显著增长。 |
| 2 | semiconductor devices | `science_tech` | Researchers are developing new semiconductor devices for advanced technology applications. | 研究人员正在开发用于先进技术应用的新型半导体设备。 |
| 3 | semiconductor materials | `academic` | Understanding semiconductor materials is crucial for modern electronic engineering. | 理解半导体材料对现代电子工程至关重要。 |

### 59. passion  *n.*

| | |
| --- | --- |
| 音标 | /ˈpæʃ.ən/ |
| 中文释义 | 热情；激情 |
| 英文释义 | A strong feeling of enthusiasm or excitement for something. |
| freq_rank | 2283 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | passion for learning | `education` | Many students develop a passion for learning through engaging activities. | 许多学生通过参与活动培养对学习的热情。 |
| 2 | passion projects | `work` | She often works on passion projects in her free time to express creativity. | 她常常在闲暇时间做热情项目，以表达创造力。 |
| 3 | passion in life | `daily_life` | Finding a passion in life can greatly enhance overall happiness. | 找到生活中的热情能大大提升整体幸福感。 |

### 60. naturally  *adv.*

| | |
| --- | --- |
| 音标 | /ˈnætʃ.ər.əl.i/ |
| 中文释义 | 自然地 |
| 英文释义 | In a way that is consistent with nature or instinct. |
| freq_rank | 2795 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | naturally talented | `education` | Many students are naturally talented in mathematics and science. | 许多学生在数学和科学方面自然有天赋。 |
| 2 | naturally occurring | `science_tech` | Some medicines come from naturally occurring substances in plants. | 一些药物来源于植物中自然存在的物质。 |
| 3 | naturally speaking | `daily_life` | Naturally speaking, children learn languages more easily than adults. | 自然地说，儿童比成年人更容易学习语言。 |

### 61. fahrenheit  *adj./n.*

| | |
| --- | --- |
| 音标 | /ˈfɑːrənˌhaɪt/ |
| 中文释义 | 华氏温度 |
| 英文释义 | A temperature scale where water freezes at 32 degrees and boils at 212 degrees. |
| freq_rank | 28229 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | fahrenheit scale | `science_tech` | The fahrenheit scale is commonly used in the United States for weather forecasts. | 华氏温度计在美国天气预报中常被使用。 |
| 2 | degrees fahrenheit | `daily_life` | On a hot summer day, temperatures can reach over 100 degrees fahrenheit. | 在炎热的夏天，气温可以超过100华氏度。 |
| 3 | fahrenheit conversion | `education` | Students often learn fahrenheit conversion during their science classes in high school. | 学生们通常在高中科学课上学习华氏温度转换。 |

### 62. observation  *n.*

| | |
| --- | --- |
| 音标 | /ˌɑːb.zərˈveɪ.ʃən/ |
| 中文释义 | 观察 |
| 英文释义 | The act of noticing or perceiving something carefully. |
| freq_rank | 2105 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | careful observation | `science_tech` | Scientists rely on careful observation to conduct their experiments. | 科学家依赖细致的观察进行实验。 |
| 2 | field observation | `work` | Field observation helps researchers gather data in real environments. | 实地观察帮助研究人员在真实环境中收集数据。 |
| 3 | participant observation | `academic` | Participant observation allows sociologists to better understand social interactions. | 参与观察使社会学家更好地理解社会互动。 |

### 63. waggon  *n.*

| | |
| --- | --- |
| 音标 | /ˈwæɡ.ən/ |
| 中文释义 | 货车 |
| 英文释义 | A vehicle for transporting goods or passengers. |
| freq_rank | 23206 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | freight waggon | `daily_life` | Freight waggons are essential for transporting goods across the country. | 货车在全国货物运输中至关重要。 |
| 2 | railway waggons | `travel` | Many railway waggons were used to transport passengers during the holiday season. | 许多铁路货车在假期期间用于运输乘客。 |
| 3 | open waggons | `science_tech` | Open waggons are commonly used in mining to carry raw materials. | 敞篷货车通常用于矿业运输原材料。 |

### 64. reader  *n.*

| | |
| --- | --- |
| 音标 | /ˈriː.dər/ |
| 中文释义 | 读者 |
| 英文释义 | A person who reads books or articles regularly. |
| freq_rank | 1268 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | avid readers | `daily_life` | Many avid readers enjoy discussing their favorite books. | 许多热心读者喜欢讨论他们最喜欢的书籍。 |
| 2 | target readers | `news` | The article is written for target readers interested in science. | 这篇文章是为对科学感兴趣的目标读者写的。 |
| 3 | young readers | `education` | Teachers encourage young readers to explore different genres. | 教师鼓励年轻读者探索不同的体裁。 |

### 65. nursery  *n.*

| | |
| --- | --- |
| 音标 | /ˈnɜːr.səri/ |
| 中文释义 | 托儿所 |
| 英文释义 | A place where young children are cared for during the day. |
| freq_rank | 5632 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | nursery school | `education` | Many parents choose nursery schools for their children's early education. | 许多父母为孩子的早期教育选择托儿所。 |
| 2 | plant nursery | `culture` | She visited a plant nursery to buy flowers for her garden. | 她去托儿所购买花卉以装饰自己的花园。 |
| 3 | nursery rhymes | `daily_life` | Children love singing nursery rhymes during playtime at home. | 孩子们喜欢在家玩耍时唱托儿歌。 |

### 66. therefore  *adv.*

| | |
| --- | --- |
| 音标 | /ˈðɛrˌfɔr/ |
| 中文释义 | 因此 |
| 英文释义 | For that reason; as a result or consequence. |
| freq_rank | 1161 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | therefore, we must act quickly | `work` | We need to finish the project; therefore, we must act quickly. | 我们需要完成这个项目，因此，我们必须迅速行动。 |
| 2 | therefore, this study shows | `academic` | The results were significant; therefore, this study shows important findings. | 结果显著，因此，这项研究显示了重要的发现。 |
| 3 | therefore, it is essential | `health` | Regular exercise is beneficial; therefore, it is essential for a healthy lifestyle. | 规律锻炼有益，因此，保持健康的生活方式是必不可少的。 |

### 67. civil  *adj.*

| | |
| --- | --- |
| 音标 | /ˈsɪv.əl/ |
| 中文释义 | 公民的；民事的 |
| 英文释义 | Relating to ordinary citizens and their concerns. |
| freq_rank | 1050 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | civil rights | `daily_life` | People are fighting for civil rights in many countries. | 人们在许多国家为公民权利而斗争。 |
| 2 | civil service | `work` | He works in the civil service for the government. | 他在政府的公务员系统工作。 |
| 3 | civil war | `news` | The civil war caused great suffering in the nation. | 内战给这个国家带来了巨大的痛苦。 |

### 68. device  *n.*

| | |
| --- | --- |
| 音标 | \/dɪˈvaɪs\/ |
| 中文释义 | 设备 |
| 英文释义 | A tool or piece of equipment designed for a specific purpose. |
| freq_rank | 1507 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | smart device | `daily_life` | Many people use a smart device to communicate with others. | 许多人使用智能设备与他人沟通。 |
| 2 | medical device | `health` | Doctors often rely on a medical device for accurate diagnosis. | 医生通常依赖医疗设备进行准确诊断。 |
| 3 | electronic device | `science_tech` | An electronic device can enhance our ability to learn and explore. | 电子设备可以增强我们学习和探索的能力。 |

### 69. contain  *v.*

| | |
| --- | --- |
| 音标 | /kənˈteɪn/ |
| 中文释义 | 包含 |
| 英文释义 | To have something inside; to hold something. |
| freq_rank | 931 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | contain a variety of | `education` | Courses in this program contain a variety of subjects. | 这个项目的课程包含多种学科。 |
| 2 | contain important information | `news` | The report must contain important information for the public. | 这份报告必须包含对公众重要的信息。 |
| 3 | contain harmful substances | `health` | Some products may contain harmful substances and should be avoided. | 一些产品可能包含有害物质，应避免使用。 |

### 70. grasp  *n./v.*

| | |
| --- | --- |
| 音标 | /ɡræsp/ |
| 中文释义 | 理解；掌握 |
| 英文释义 | To understand something completely or to hold firmly. |
| freq_rank | 4181 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | grasp the concept | `education` | Many students struggle to grasp the concept of evolution clearly. | 许多学生难以清楚地理解进化的概念。 |
| 2 | grasp the importance | `work` | Managers must grasp the importance of effective communication in the workplace. | 经理们必须理解有效沟通在工作场所的重要性。 |
| 3 | grasp the opportunity | `daily_life` | You should grasp the opportunity to travel abroad while you can. | 你应该抓住这个出国旅行的机会。 |

### 71. hence  *adv.*

| | |
| --- | --- |
| 音标 | /hɛns/ |
| 中文释义 | 因此 |
| 英文释义 | As a consequence; for this reason. |
| freq_rank | 3639 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | hence the need | `education` | Students struggle with math, hence the need for extra tutoring. | 学生在数学上遇到困难，因此需要额外的辅导。 |
| 2 | hence the importance | `work` | This project is complex, hence the importance of teamwork. | 这个项目很复杂，因此团队合作显得很重要。 |
| 3 | hence my decision | `daily_life` | I found the book boring, hence my decision to stop reading it. | 我觉得这本书无聊，因此决定不再读。 |

### 72. fluent  *adj.*

| | |
| --- | --- |
| 音标 | /ˈfluː.ənt/ |
| 中文释义 | 流利的 |
| 英文释义 | Able to express oneself easily and articulately. |
| freq_rank | 11910 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | fluent in | `education` | Many students aspire to become fluent in multiple languages during their studies. | 许多学生渴望在学习期间掌握多种语言，变得流利。 |
| 2 | fluent speaker | `daily_life` | She is a fluent speaker of English and French, impressing everyone she meets. | 她是英语和法语的流利讲者，给遇见的每个人都留下深刻印象。 |
| 3 | fluent communication | `work` | Fluent communication among team members is essential for project success. | 团队成员之间的流利沟通对项目成功至关重要。 |

### 73. marriage  *n.*

| | |
| --- | --- |
| 音标 | /ˈmærɪdʒ/ |
| 中文释义 | 婚姻 |
| 英文释义 | Union of individuals in a legal or social relationship. |
| freq_rank | 1011 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | arranged marriage | `culture` | Many families still prefer arranged marriages for their children. | 许多家庭仍然更喜欢为孩子安排婚姻。 |
| 2 | same-sex marriage | `news` | Some countries have legalized same-sex marriages in recent years. | 近年来，一些国家已合法化同性婚姻。 |
| 3 | marriage certificate | `daily_life` | You will need a marriage certificate to apply for a joint account. | 申请联名账户时，您需要结婚证。 |

### 74. purely  *adv.*

| | |
| --- | --- |
| 音标 | /ˈpjʊr.li/ |
| 中文释义 | 纯粹地；完全地 |
| 英文释义 | In a manner that is entirely free from any other quality. |
| freq_rank | 5120 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | purely academic | `academic` | Discussions in the seminar are purely academic and not for practical application. | 研讨会中的讨论纯粹是学术性的，不用于实际应用。 |
| 2 | purely theoretical | `science_tech` | The experiment's results are purely theoretical without practical experiments to support them. | 实验的结果纯粹是理论性，没有实际实验来支持。 |
| 3 | purely coincidental | `daily_life` | Her appearance at the event was purely coincidental, not planned in advance. | 她出现在活动中纯粹是巧合，并没有提前计划。 |

### 75. compete  *v.*

| | |
| --- | --- |
| 音标 | /kəmˈpiːt/ |
| 中文释义 | 竞争 |
| 英文释义 | To strive against others to gain something or win. |
| freq_rank | 2065 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | compete with each other | `work` | Companies often compete with each other for market share. | 公司们经常为市场份额而竞争。 |
| 2 | compete for resources | `environment` | Animals must compete for resources in their habitat to survive. | 动物们必须在栖息地中竞争资源以求生存。 |
| 3 | compete in a tournament | `daily_life` | Athletes will compete in a tournament next weekend to showcase their skills. | 运动员们将在下周末的比赛中展示他们的技能。 |

### 76. confirm  *v.*

| | |
| --- | --- |
| 音标 | /kənˈfɜrm/ |
| 中文释义 | 确认；证实 |
| 英文释义 | To establish the truth or correctness of something. |
| freq_rank | 1851 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | confirm the results | `science_tech` | Scientists confirm the results of their latest experiment successfully. | 科学家成功确认了他们最新实验的结果。 |
| 2 | confirm a booking | `travel` | Travelers should confirm a booking before arrival at the hotel. | 旅行者应在抵达酒店之前确认预订。 |
| 3 | confirm your identity | `work` | Employees need to confirm your identity for security purposes. | 员工需要确认您的身份以确保安全。 |

### 77. berry  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈbɛr.i/ |
| 中文释义 | 浆果 |
| 英文释义 | A small, round fruit, often juicy and edible. |
| freq_rank | 6096 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | fresh berries | `health` | Eating fresh berries can boost your immune system significantly. | 吃新鲜的浆果可以显著增强免疫系统。 |
| 2 | mixed berry | `daily_life` | She made a smoothie using mixed berry flavors and yogurt. | 她用混合浆果和酸奶做了一个冰沙。 |
| 3 | wild berry | `environment` | The forest is home to many wild berry plants, attracting various wildlife. | 森林里有许多野生浆果植物，吸引了各种野生动物。 |

### 78. jail  *n./v.*

| | |
| --- | --- |
| 音标 | /dʒeɪl/ |
| 中文释义 | 监狱；拘留所 |
| 英文释义 | A place for the confinement of people accused of crimes. |
| freq_rank | 2528 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | go to jail | `news` | Many people fear they will go to jail for their actions. | 许多人担心他们会因为自己的行为而入狱。 |
| 2 | jail time | `daily_life` | He received a lengthy jail time for his serious offense. | 他因严重犯罪被判处长时间监禁。 |
| 3 | jail sentence | `academic` | The judge decided on a harsh jail sentence for the offender. | 法官决定对罪犯判处严厉的监禁。 |

### 79. hole  *n./v.*

| | |
| --- | --- |
| 音标 | /hoʊl/ |
| 中文释义 | 洞；孔 |
| 英文释义 | An opening or hollow space in a solid object. |
| freq_rank | 1213 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | big hole | `daily_life` | We found a big hole in the ground. | 我们在地上发现了一个大洞。 |
| 2 | drain hole | `work` | The drain hole needs to be cleaned regularly. | 排水孔需要定期清理。 |
| 3 | bullet hole | `news` | Authorities discovered a bullet hole in the wall. | 当局发现墙上有一个子弹孔。 |

### 80. rag  *n./v.*

| | |
| --- | --- |
| 音标 | /ræɡ/ |
| 中文释义 | 破布；旧衣服 |
| 英文释义 | A piece of old cloth or clothing, often torn. |
| freq_rank | 6662 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | old rag | `daily_life` | Everyone should have an old rag handy for cleaning up spills. | 每个人应该准备一块旧布用来清理溅出的液体。 |
| 2 | torn rag | `work` | He used a torn rag to wipe the grease from his hands. | 他用一块破旧的布擦去手上的油脂。 |
| 3 | cleaning rag | `science_tech` | In laboratories, a clean cleaning rag is essential for maintaining hygiene. | 在实验室中，干净的清洁布对于保持卫生至关重要。 |

### 81. optional  *adj.*

| | |
| --- | --- |
| 音标 | /ˈɑːp.ʃən.əl/ |
| 中文释义 | 可选择的 |
| 英文释义 | Available to be chosen; not mandatory. |
| freq_rank | 5692 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | optional courses | `education` | Students can select from various optional courses to enhance their learning experience. | 学生可以从多种可选课程中选择，以提升他们的学习体验。 |
| 2 | optional features | `work` | Our software offers several optional features that can be added based on user needs. | 我们的软件提供几个可选择的功能，可以根据用户需求添加。 |
| 3 | optional extras | `daily_life` | Many car manufacturers provide optional extras to customize vehicles for buyers. | 许多汽车制造商提供可选配件，以便为买家定制车辆。 |

### 82. agent  *n.*

| | |
| --- | --- |
| 音标 | /ˈeɪ.dʒənt/ |
| 中文释义 | 代理人 |
| 英文释义 | A person who acts on behalf of another. |
| freq_rank | 1020 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | travel agent | `daily_life` | I need to book a flight with a travel agent. | 我需要通过旅行代理人预订航班。 |
| 2 | real estate agent | `work` | He is a successful real estate agent in the city. | 他是这个城市一位成功的房地产代理人。 |
| 3 | secret agent | `culture` | A secret agent often works undercover for the government. | 特工经常为政府秘密工作。 |

### 83. scarf  *n./v.*

| | |
| --- | --- |
| 音标 | /skɑrf/ |
| 中文释义 | 围巾 |
| 英文释义 | A piece of fabric worn around the neck for warmth. |
| freq_rank | 6140 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | worn scarf | `daily_life` | Many people wore colorful scarves during the winter festival. | 许多人在冬季节日里佩戴彩色围巾。 |
| 2 | fashion scarf | `culture` | Designers showcased their latest fashion scarves at the annual fashion show. | 设计师在年度时装秀上展示了他们最新的时尚围巾。 |
| 3 | silk scarf | `work` | She prefers to wear a silk scarf to enhance her professional attire. | 她更喜欢佩戴丝绸围巾来提升她的职业装。 |

### 84. intelligent  *adj.*

| | |
| --- | --- |
| 音标 | /ɪnˈtɛl.ɪ.dʒənt/ |
| 中文释义 | 聪明的；有才智的 |
| 英文释义 | Having the ability to think, learn, and understand quickly. |
| freq_rank | 3709 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | intelligent people | `education` | Many intelligent people have contributed to scientific progress. | 许多聪明的人为科学进步做出了贡献。 |
| 2 | intelligent design | `science_tech` | Critics argue that intelligent design lacks scientific evidence. | 批评者认为，智能设计缺乏科学证据。 |
| 3 | intelligent solutions | `work` | They are looking for intelligent solutions to complex problems. | 他们正在寻找复杂问题的聪明解决方案。 |

### 85. unconscious  *adj.*

| | |
| --- | --- |
| 音标 | /ʌnˈkɒn.ʃəs/ |
| 中文释义 | 无意识的 |
| 英文释义 | Not awake or aware of one's surroundings or actions. |
| freq_rank | 5668 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | unconscious mind | `science_tech` | The unconscious mind influences our thoughts and behaviors every day. | 无意识的思维每天都会影响我们的想法和行为。 |
| 2 | unconscious bias | `work` | Many organizations are now addressing unconscious biases in their hiring processes. | 许多组织现在正在解决招聘过程中无意识的偏见问题。 |
| 3 | unconscious state | `health` | He was found in an unconscious state after the accident. | 他在事故后被发现处于无意识状态。 |

### 86. emotion  *n.*

| | |
| --- | --- |
| 音标 | /ɪˈmoʊ.ʃən/ |
| 中文释义 | 情感 |
| 英文释义 | A strong feeling such as joy or sadness. |
| freq_rank | 2117 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | express emotions | `daily_life` | People often express emotions when they are happy or sad. | 人们常常在快乐或悲伤时表达情感。 |
| 2 | overwhelming emotions | `health` | Overwhelming emotions can affect a person's mental health significantly. | 强烈的情感会显著影响一个人的心理健康。 |
| 3 | emotional response | `culture` | An emotional response can vary greatly from person to person. | 情感反应因人而异。 |

### 87. tub  *n./v.*

| | |
| --- | --- |
| 音标 | /tʌb/ |
| 中文释义 | 浴缸；桶 |
| 英文释义 | A round container used for holding liquids. |
| freq_rank | 5418 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | hot tub | `daily_life` | Relaxing in the hot tub can relieve stress after a long day. | 在热水浴缸中放松能缓解一天的压力。 |
| 2 | fill the tub | `health` | To ensure a comfortable bath, fill the tub with warm water first. | 为了确保舒适的沐浴，先将浴缸装满温水。 |
| 3 | tub of ice cream | `culture` | She brought a tub of ice cream to the picnic for everyone to enjoy. | 她带了一桶冰淇淋去野餐，供大家享用。 |

### 88. shore  *n./v.*

| | |
| --- | --- |
| 音标 | /ʃɔr/ |
| 中文释义 | 岸；海岸 |
| 英文释义 | Land bordering a large body of water. |
| freq_rank | 3244 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | on the shore | `travel` | Waves crashed on the shore while we set up our tent. | 波浪在海岸上拍打着，我们搭起了帐篷。 |
| 2 | along the shore | `daily_life` | Families walked along the shore enjoying the sunny weather. | 家人们在海岸上漫步，享受着阳光明媚的天气。 |
| 3 | shore of the lake | `environment` | Birds often nest on the shore of the lake during spring. | 鸟类通常在春季在湖岸上筑巢。 |

### 89. rubber  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈrʌb.ər/ |
| 中文释义 | 橡胶；橡皮 |
| 英文释义 | A flexible material used for various purposes such as erasing. |
| freq_rank | 4791 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | rubber bands | `daily_life` | People often use rubber bands to keep items organized in their homes. | 人们经常使用橡皮筋在家中保持物品的整齐。 |
| 2 | rubber gloves | `work` | Workers need to wear rubber gloves to protect themselves from chemicals. | 工人需要戴上橡胶手套以保护自己免受化学品的伤害。 |
| 3 | rubber trees | `environment` | In Southeast Asia, rubber trees are crucial for the economy and ecology. | 在东南亚，橡胶树对经济和生态至关重要。 |

### 90. aware  *adj.*

| | |
| --- | --- |
| 音标 | /əˈwɛər/ |
| 中文释义 | 知道的；意识到的 |
| 英文释义 | Having knowledge or perception of a situation or fact. |
| freq_rank | 1439 |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | aware of the problem | `work` | Everyone is aware of the problem with the project. | 每个人都知道这个项目的问题。 |
| 2 | become aware | `education` | Students should become aware of environmental issues early. | 学生应该早早意识到环境问题。 |
| 3 | be aware of the risks | `health` | You must be aware of the risks when taking medication. | 你必须知道服药时的风险。 |

### 91. panel  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈpæn.əl/ |
| 中文释义 | 面板；小组 |
| 英文释义 | A flat, rectangular piece used for display or discussion. |
| freq_rank | 1607 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | discussion panel | `academic` | Experts participated in a discussion panel about climate change. | 专家们参加了关于气候变化的讨论小组。 |
| 2 | control panel | `work` | The technician adjusted settings on the control panel to improve efficiency. | 技术人员调整了控制面板上的设置以提高效率。 |
| 3 | advisory panel | `education` | An advisory panel was formed to guide curriculum development at the school. | 学校成立了一个咨询小组，以指导课程开发。 |

### 92. volume  *n./v./adj.*

| | |
| --- | --- |
| 音标 | /ˈvɑː.ljuːm/ |
| 中文释义 | 音量；体积 |
| 英文释义 | The amount of space or sound something occupies. |
| freq_rank | 1917 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | increase the volume | `daily_life` | Please increase the volume of the television for better sound. | 请将电视的音量调高，以便更好地听到声音。 |
| 2 | sound volume | `work` | Adjusting the sound volume can enhance the presentation experience. | 调整音量可以提升演示的体验。 |
| 3 | data volume | `science_tech` | The data volume collected was larger than expected during the experiment. | 在实验中收集的数据量比预期的大。 |

### 93. lorry  *n.*

| | |
| --- | --- |
| 音标 | /ˈlɔː.ri/ |
| 中文释义 | 卡车 |
| 英文释义 | A large, heavy motor vehicle for transporting goods. |
| freq_rank | 24926 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | lorry driver | `work` | Many lorry drivers face long hours on the road, affecting their health. | 许多卡车司机在路上工作时间很长，影响了他们的健康。 |
| 2 | lorry loads | `news` | Lorry loads of supplies are being delivered to the affected areas after the disaster. | 灾后，卡车装载的物资正在送往受灾地区。 |
| 3 | lorry park | `daily_life` | Finding a suitable lorry park can be challenging in busy urban areas. | 在繁忙的城市地区，找到合适的卡车停车场可能很困难。 |

### 94. gentleman  *n.*

| | |
| --- | --- |
| 音标 | /ˈdʒɛn.təl.mən/ |
| 中文释义 | 绅士 |
| 英文释义 | A polite and honorable man. |
| freq_rank | 2447 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | a true gentleman | `daily_life` | He is known as a true gentleman in our community. | 他在我们社区被誉为真正的绅士。 |
| 2 | gentleman’s agreement | `work` | They reached a gentleman’s agreement without any legal documents. | 他们在没有任何法律文件的情况下达成了绅士协议。 |
| 3 | gentleman of leisure | `culture` | In the past, a gentleman of leisure enjoyed a life of comfort. | 在过去，一个绅士享受着舒适的生活。 |

### 95. infect  *v.*

| | |
| --- | --- |
| 音标 | /ɪnˈfɛkt/ |
| 中文释义 | 感染 |
| 英文释义 | To cause disease by entering the body or organism. |
| freq_rank | 5200 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | infect humans | `health` | Viruses can easily infect humans and spread rapidly within communities. | 病毒可以轻易感染人类，并在社区内迅速传播。 |
| 2 | infect plants | `science_tech` | Certain fungi can infect plants, leading to significant agricultural losses. | 某些真菌可以感染植物，导致重大的农业损失。 |
| 3 | infect the environment | `environment` | Pollutants may infect the environment, harming ecosystems and wildlife. | 污染物可能感染环境，危害生态系统和野生动物。 |

### 96. sausage  *n.*

| | |
| --- | --- |
| 音标 | /ˈsɔː.sɪdʒ/ |
| 中文释义 | 香肠 |
| 英文释义 | A cylindrical food product made from ground meat and spices. |
| freq_rank | 6199 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | breakfast sausage | `daily_life` | Many people enjoy eating breakfast sausages with their morning meals. | 许多人喜欢在早晨的餐点中吃香肠。 |
| 2 | hot sausage | `culture` | Street vendors often sell hot sausages at festivals and events. | 街头小贩通常在节日和活动中出售热香肠。 |
| 3 | sausage maker | `work` | The sausage maker used traditional techniques to create gourmet products. | 香肠制造商采用传统技术制作美食。 |

### 97. vibrate  *v.*

| | |
| --- | --- |
| 音标 | /vaɪˈbreɪt/ |
| 中文释义 | 振动 |
| 英文释义 | To move or cause to move rapidly back and forth. |
| freq_rank | 9666 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | vibrate at a frequency | `science_tech` | Devices often vibrate at a frequency that enhances user experience. | 设备通常在一种频率下振动，以增强用户体验。 |
| 2 | vibrate in response to | `work` | Machines vibrate in response to operational changes during manufacturing processes. | 机器在制造过程中对操作变化做出振动。 |
| 3 | vibrate with energy | `culture` | The festival grounds vibrate with energy from the enthusiastic crowd. | 节日场地因热情的观众而充满活力。 |

### 98. grand  *adj.*

| | |
| --- | --- |
| 音标 | /ɡrænd/ |
| 中文释义 | 宏伟，壮丽 |
| 英文释义 | Impressive or magnificent in appearance or style. |
| freq_rank | 2237 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | grand opening | `daily_life` | Everyone was excited for the grand opening of the new store. | 大家对新商店的盛大开业感到兴奋。 |
| 2 | grand plans | `work` | She has grand plans to expand the business next year. | 她有宏伟的计划，打算明年扩展业务。 |
| 3 | grand scale | `culture` | The festival was celebrated on a grand scale, attracting many visitors. | 这个节日以盛大的规模庆祝，吸引了许多游客。 |

### 99. needle  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈniː.dəl/ |
| 中文释义 | 针 |
| 英文释义 | A slender tool used for sewing or injecting. |
| freq_rank | 3804 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | sewing needle | `daily_life` | People often lose their sewing needles while working on crafts. | 人们在制作手工艺品时经常会丢失缝纫针。 |
| 2 | hypodermic needle | `health` | Doctors use hypodermic needles to give patients vaccinations. | 医生使用注射针给病人接种疫苗。 |
| 3 | needle in a haystack | `culture` | Finding the right book was like searching for a needle in a haystack. | 找到一本合适的书就像大海捞针。 |

### 100. pacific  *n./adj.*

| | |
| --- | --- |
| 音标 | /pəˈsɪf.ɪk/ |
| 中文释义 | 宁静的；和平的 |
| 英文释义 | Calm, peaceful, and free from disturbance or conflict. |
| freq_rank | 26607 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | pacific ocean | `travel` | Many travelers dream of exploring the vast Pacific Ocean and its islands. | 许多旅行者梦想探索广阔的太平洋及其岛屿。 |
| 2 | pacific approach | `education` | In negotiations, adopting a pacific approach can lead to better outcomes for all parties. | 在谈判中，采取和平的方法可以为所有各方带来更好的结果。 |
| 3 | pacific nations | `news` | The summit focused on cooperation among the Pacific nations to combat climate change. | 峰会集中讨论太平洋国家在应对气候变化方面的合作。 |
