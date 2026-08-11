# 托福词汇内容 batch1 · 送审样本

> 抽 16 词(种子固定 20260803,复跑抽到同样这批)。
> **不是纯随机** —— 贪心挑成尽量铺开 scene 与词性,免得 16 个全是名词、场景全挤在 news。
> 本批覆盖 **10/10 个 scene**、**7 种词性**(n. / v. / 词性缺失 / adj. / abbr. / adv. / prep.)。
> (`词性缺失` = ECDICT 的 translation 里没有词性前缀,全库 53 个词属于这种,`pos` 为空。)
> 全量 815 词见 `scripts/vocab/data/generated/ielts-content.json`。

## 全量 815 词的分布(不只是抽样这 16 个)

难度档:A2 7 · B1 41 · B2 166 · C1 601

场景(共 2445 条例句):academic 218 · news 232 · daily_life 471 · work 443 · science_tech 229 · health 121 · environment 97 · education 270 · travel 88 · culture 276

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

### 1. spoons  *n.*

| | |
| --- | --- |
| 音标 | /spuːnz/ |
| 中文释义 | 勺子 |
| 英文释义 | Utensils used for stirring, serving, and eating food or liquids. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | wooden spoons | `culture` | Chefs often prefer wooden spoons because they do not scratch cookware. | 厨师们常常偏爱木勺，因为它们不会划伤炊具。 |
| 2 | silver spoons | `daily_life` | Many families pass down silver spoons as heirlooms from generation to generation. | 许多家庭将银勺作为传家宝代代相传。 |
| 3 | plastic spoons | `work` | During the company picnic, we used disposable plastic spoons for convenience. | 在公司野餐时，我们为了方便使用了一次性塑料勺。 |

### 2. sterilize  *v.*

| | |
| --- | --- |
| 音标 | /ˈstɛr.ɪ.laɪz/ |
| 中文释义 | 消毒；灭菌 |
| 英文释义 | To make something free from bacteria or other living microorganisms. |
| freq_rank | 14878 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | sterilize surgical instruments | `health` | Surgeons must sterilize surgical instruments before any operation to prevent infections. | 外科医生在手术前必须消毒手术器械，以防止感染。 |
| 2 | sterilize medical equipment | `science_tech` | It's crucial to sterilize medical equipment to ensure patient safety during procedures. | 在手术过程中，消毒医疗设备对确保病人安全至关重要。 |
| 3 | sterilize water | `environment` | Communities often need to sterilize water to make it safe for drinking after contamination. | 在水源被污染后，社区通常需要消毒水源，以确保饮用安全。 |

### 3. wollongong  

| | |
| --- | --- |
| 音标 | /ˈwɒl.əŋ.ɡɒŋ/ |
| 中文释义 | 澳大利亚新南威尔士州的一个城市 |
| 英文释义 | A coastal city in New South Wales, Australia, known for its beaches. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | Wollongong University | `academic` | Students from across the globe enroll at Wollongong University for diverse programs. | 来自全球的学生在沃隆冈大学注册多样化的课程。 |
| 2 | Wollongong beaches | `travel` | Travelers flock to Wollongong beaches, especially during the summer months. | 游客在夏季时特别涌向沃隆冈的海滩。 |
| 3 | Wollongong area | `news` | The Wollongong area has experienced significant development over the past decade. | 沃隆冈地区在过去十年中经历了显著的发展。 |

### 4. detailed  *adj.*

| | |
| --- | --- |
| 音标 | /ˈdiː.teɪld/ |
| 中文释义 | 详细的 |
| 英文释义 | Having many details or providing a lot of information. |
| freq_rank | 3125 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | detailed explanation | `education` | Teachers often provide detailed explanations for complex topics. | 老师通常会为复杂的主题提供详细的解释。 |
| 2 | detailed report | `work` | The manager submitted a detailed report on the project's progress. | 经理提交了关于项目进展的详细报告。 |
| 3 | detailed analysis | `science_tech` | Researchers conducted a detailed analysis of the experimental results. | 研究人员对实验结果进行了详细分析。 |

### 5. ideas  *abbr.*

| | |
| --- | --- |
| 音标 | /aɪˈdɪəz/ |
| 中文释义 | 想法；主意 |
| 英文释义 | Concepts or mental representations formed through thoughts. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | creative ideas | `work` | Collaboration often leads to innovative and creative ideas within teams. | 合作通常会在团队内产生创新和创意的想法。 |
| 2 | scientific ideas | `science_tech` | Many scientific ideas have changed our understanding of the universe significantly. | 许多科学想法已经显著改变了我们对宇宙的理解。 |
| 3 | political ideas | `news` | The debate focused on various political ideas that could shape future policies. | 这场辩论集中在可能影响未来政策的多种政治想法上。 |

### 6. effectively  *adv.*

| | |
| --- | --- |
| 音标 | /ɪˈfɛktɪvli/ |
| 中文释义 | 有效地 |
| 英文释义 | In a way that produces the intended result. |
| freq_rank | 2566 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | effectively communicate | `work` | Managers need to effectively communicate their expectations to employees. | 经理需要有效地传达对员工的期望。 |
| 2 | effectively address | `education` | Teachers must effectively address different learning styles in their classrooms. | 教师必须有效地应对课堂上不同的学习风格。 |
| 3 | effectively manage | `science_tech` | Scientists are learning how to effectively manage limited resources. | 科学家们正在学习如何有效地管理有限的资源。 |

### 7. amidst  *prep.*

| | |
| --- | --- |
| 音标 | /əˈmɪdst/ |
| 中文释义 | 在……中；在……之间 |
| 英文释义 | In the middle of or surrounded by something. |
| freq_rank | 9845 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | amidst chaos | `daily_life` | Students tried to focus amidst the chaos of the crowded cafeteria. | 在拥挤的自助餐厅中，学生们努力集中注意力。 |
| 2 | amidst uncertainty | `academic` | Researchers conducted experiments amidst uncertainty about the results' reliability. | 研究人员在对结果可靠性充满不确定性的情况下进行了实验。 |
| 3 | amidst discussions | `work` | The manager made a decision amidst discussions about budget cuts. | 经理在关于预算削减的讨论中做出了决定。 |

### 8. grate  *n./v.*

| | |
| --- | --- |
| 音标 | /ɡreɪt/ |
| 中文释义 | 磨碎；擦擦 |
| 英文释义 | To reduce food to small shreds by being scraped against a rough surface. |
| freq_rank | 8512 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | grate cheese | `daily_life` | Many people prefer to grate cheese for better melting. | 许多人更喜欢磨碎奶酪以便更好地融化。 |
| 2 | grate on someone | `work` | Constant noise can grate on employees' patience during long hours. | 持续的噪音会在长时间内磨损员工的耐心。 |
| 3 | grate vegetables | `health` | To enhance salads, many chefs choose to grate vegetables finely. | 为了提升沙拉的风味，许多厨师选择将蔬菜磨得很细。 |

### 9. positions  *n.*

| | |
| --- | --- |
| 音标 | /pəˈzɪʃ.ənz/ |
| 中文释义 | 职位；地位 |
| 英文释义 | Roles or locations within a particular context or organization. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | leadership positions | `work` | Many professionals aspire to attain leadership positions within their organizations. | 许多专业人士渴望在其组织中获得领导职位。 |
| 2 | academic positions | `education` | Institutions are constantly seeking qualified candidates for academic positions. | 各学术机构不断寻找合格的候选人来填补学术职位。 |
| 3 | political positions | `news` | Recent polls reveal shifting public opinions on political positions held by various parties. | 最近的民调显示公众对各党派所持政治立场的看法正在变化。 |

### 10. omen  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈoʊ.mən/ |
| 中文释义 | 预兆；前兆 |
| 英文释义 | A phenomenon regarded as a sign of future events. |
| freq_rank | 14093 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | bad omen | `news` | The recent market crash was seen as a bad omen for the economy. | 最近的市场崩盘被视为经济的一个坏预兆。 |
| 2 | omen of death | `culture` | Many cultures believe that a black cat is an omen of death. | 许多文化相信黑猫是死亡的预兆。 |
| 3 | omen for success | `work` | Receiving positive feedback was an encouraging omen for success in the project. | 收到积极反馈是项目成功的鼓舞人心的预兆。 |

### 11. insipid  *adj.*

| | |
| --- | --- |
| 音标 | /ɪnˈsɪp.ɪd/ |
| 中文释义 | 无味的；平淡的 |
| 英文释义 | Lacking flavor, interest, or excitement. |
| freq_rank | 24841 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | insipid taste | `daily_life` | Many people find the food at that restaurant to be insipid, lacking any real flavor. | 许多人觉得那家餐厅的食物无味，缺乏真正的风味。 |
| 2 | insipid commentary | `news` | The documentary was criticized for its insipid commentary that failed to engage viewers. | 该纪录片因无味的评论未能吸引观众而受到批评。 |
| 3 | insipid remarks | `academic` | During the lecture, several students made insipid remarks that added little to the discussion. | 在讲座期间，几名学生发表的无味评论对讨论几乎没有贡献。 |

### 12. volunteers  *n./v.*

| | |
| --- | --- |
| 音标 | /ˌvɑːl.ənˈtɪrz/ |
| 中文释义 | 志愿者；志愿者行为 |
| 英文释义 | People who offer to do something voluntarily without pay. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | volunteers for a project | `work` | Many professionals become volunteers for community projects to give back. | 许多专业人士志愿参与社区项目，以回馈社会。 |
| 2 | volunteers in a crisis | `news` | During the disaster, local volunteers stepped in to help those affected. | 在灾难期间，当地志愿者介入，帮助受影响的人们。 |
| 3 | volunteers at an event | `daily_life` | Students often serve as volunteers at charity events to gain experience. | 学生们经常在慈善活动中担任志愿者，以获得经验。 |

### 13. educational  *adj.*

| | |
| --- | --- |
| 音标 | /ˌɛdʒʊˈkeɪʃənl/ |
| 中文释义 | 教育的 |
| 英文释义 | Related to the process of teaching and learning. |
| freq_rank | 1587 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | educational resources | `education` | Teachers use various educational resources to enhance student learning. | 教师利用各种教育资源来提升学生学习效果。 |
| 2 | educational programs | `daily_life` | Many families participate in educational programs during the summer months. | 许多家庭在夏季参加教育项目。 |
| 3 | educational institutions | `academic` | Students often apply to several educational institutions for their higher studies. | 学生通常申请几所教育机构以继续深造。 |

### 14. advertising  *n./adj.*

| | |
| --- | --- |
| 音标 | /ˈæd.vɚˌtaɪ.zɪŋ/ |
| 中文释义 | 广告 |
| 英文释义 | Promoting products or services through various media. |
| freq_rank | 2640 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | advertising campaign | `work` | Many companies are launching new advertising campaigns this year. | 许多公司今年正在推出新的广告活动。 |
| 2 | advertising agency | `daily_life` | She works at an advertising agency that specializes in digital marketing. | 她在一家专注于数字营销的广告公司工作。 |
| 3 | advertising trends | `news` | Experts predict upcoming advertising trends will focus on personalization. | 专家预测，未来的广告趋势将专注于个性化。 |

### 15. booklet  *n.*

| | |
| --- | --- |
| 音标 | /ˈbʊk.lɪt/ |
| 中文释义 | 小册子 |
| 英文释义 | A small book containing information or instructions. |
| freq_rank | 10619 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | instruction booklet | `education` | Teachers often provide an instruction booklet to guide new students through the curriculum. | 教师通常会提供一本说明小册子来引导新生了解课程。 |
| 2 | brochure booklet | `travel` | After reading the brochure booklet, we decided to visit the national park this summer. | 读完宣传小册子后，我们决定今年夏天去国家公园游玩。 |
| 3 | catalog booklet | `work` | The marketing team created a catalog booklet to showcase the new product line. | 市场团队制作了一本目录小册子来展示新产品系列。 |

### 16. treatise  *n.*

| | |
| --- | --- |
| 音标 | /ˈtriː.tɪs/ |
| 中文释义 | 论文；著作 |
| 英文释义 | A formal written work discussing a specific subject in detail. |
| freq_rank | 11509 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | scholarly treatise | `academic` | Researchers published a scholarly treatise on climate change effects. | 研究人员发表了一篇关于气候变化影响的学术论文。 |
| 2 | legal treatise | `work` | The attorney referenced a legal treatise during the court hearing. | 律师在法庭听证会上提及了一部法律论文。 |
| 3 | philosophical treatise | `culture` | His philosophical treatise challenged traditional views on morality and ethics. | 他的哲学论文挑战了传统的道德和伦理观念。 |
