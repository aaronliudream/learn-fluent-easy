# 托福词汇内容 batch1 · 送审样本

> 抽 16 词(种子固定 20260803,复跑抽到同样这批)。
> **不是纯随机** —— 贪心挑成尽量铺开 scene 与词性,免得 16 个全是名词、场景全挤在 news。
> 本批覆盖 **10/10 个 scene**、**6 种词性**(n. / v. / adj. / 词性缺失 / adv. / conj.)。
> (`词性缺失` = ECDICT 的 translation 里没有词性前缀,全库 53 个词属于这种,`pos` 为空。)
> 全量 3478 词见 `scripts/vocab/data/generated/gre-content.json`。

## 全量 3478 词的分布(不只是抽样这 16 个)

难度档:B1 5 · B2 247 · C1 3226

场景(共 10434 条例句):academic 1395 · news 1137 · daily_life 1963 · work 1572 · science_tech 877 · health 485 · environment 357 · education 882 · travel 158 · culture 1608

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

### 1. qualm  *n.*

| | |
| --- | --- |
| 音标 | /kwɑːm/ |
| 中文释义 | 疑虑 |
| 英文释义 | A feeling of doubt or uncertainty about something. |
| freq_rank | 14827 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | qualms about | `work` | Many employees expressed their qualms about the new policy changes. | 许多员工对新政策的变化表示疑虑。 |
| 2 | qualms of conscience | `daily_life` | She had qualms of conscience after lying to her friend. | 在对朋友撒谎后，她感到内心的疑虑。 |
| 3 | no qualms | `news` | He showed no qualms about criticizing the government openly. | 他对公开批评政府毫无疑虑。 |

### 2. lacerate  *v./adj.*

| | |
| --- | --- |
| 音标 | /ˈlæs.ə.reɪt/ |
| 中文释义 | 撕裂；切割 |
| 英文释义 | To tear or deeply cut something or someone. |
| freq_rank | 31623 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | lacerate the skin | `health` | Injuries can lacerate the skin, leading to severe bleeding. | 伤口可以撕裂皮肤，导致严重出血。 |
| 2 | lacerate the tissue | `science_tech` | The surgeon must be careful not to lacerate the tissue during the procedure. | 外科医生在手术过程中必须小心不要撕裂组织。 |
| 3 | lacerate with words | `culture` | Authors can lacerate with words, revealing deep emotional truths. | 作者可以用文字撕裂，揭示深刻的情感真相。 |

### 3. pellucid  *adj.*

| | |
| --- | --- |
| 音标 | /pəˈluː.sɪd/ |
| 中文释义 | 清澈的；明晰的 |
| 英文释义 | Transmitting light; clear in meaning or style. |
| freq_rank | 39045 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | pellucid prose | `academic` | Scholarly works often feature pellucid prose that enhances understanding. | 学术作品常常以清晰的散文增强理解。 |
| 2 | pellucid waters | `environment` | The lake's pellucid waters reflected the surrounding mountains beautifully. | 湖泊的清澈水面美丽地映照出周围的山脉。 |
| 3 | pellucid explanations | `education` | Teachers strive to provide pellucid explanations for complex topics to aid student learning. | 教师努力为复杂主题提供清晰的解释，以帮助学生学习。 |

### 4. shiftiness  

| | |
| --- | --- |
| 音标 | /ˈʃɪftɪnəs/ |
| 中文释义 | 狡诈；不诚实 |
| 英文释义 | The quality of being deceitful or untrustworthy. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | shiftiness of the negotiations | `news` | Negotiators expressed concerns about the shiftiness of the negotiations regarding the treaty. | 谈判者对条约谈判中的狡诈表示担忧。 |
| 2 | shiftiness in behavior | `daily_life` | Her friends began to notice a shiftiness in her behavior after the incident. | 事件发生后，她的朋友开始注意到她行为中的狡诈。 |
| 3 | shiftiness of political tactics | `academic` | Scholars analyze the shiftiness of political tactics employed during the election. | 学者们分析选举中使用的政治策略的狡诈。 |

### 5. summarily  *adv.*

| | |
| --- | --- |
| 音标 | /səˈmɛr.ə.li/ |
| 中文释义 | 迅速地；立即地 |
| 英文释义 | In a prompt or direct manner; without delay. |
| freq_rank | 19090 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | summarily dismiss | `work` | Management decided to summarily dismiss the employee for repeated violations. | 管理层决定立即解雇该员工，因其屡次违规。 |
| 2 | summarily reject | `news` | The court summarily rejected the appeal due to lack of evidence. | 法院因证据不足立即驳回了上诉。 |
| 3 | summarily execute | `culture` | Historical records show that rebels were often summarily executed without trial. | 历史记录显示，叛乱者常常被立即处决，毫无审判。 |

### 6. albeit  *conj.*

| | |
| --- | --- |
| 音标 | /ɔːlˈbiː.ɪt/ |
| 中文释义 | 尽管；虽然 |
| 英文释义 | Although; even though something is true. |
| freq_rank | 6086 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | albeit a challenge | `work` | Meeting the deadline was stressful, albeit a challenge we accepted. | 按时完成任务很有压力，尽管这是我们接受的挑战。 |
| 2 | albeit significant | `academic` | The results were promising, albeit significant improvements are needed. | 这些结果是有希望的，尽管仍需要显著改进。 |
| 3 | albeit reluctantly | `daily_life` | She agreed to join the project, albeit reluctantly due to her busy schedule. | 她同意参与这个项目，尽管是因为她的日程繁忙而不情愿。 |

### 7. miscellany  *n.*

| | |
| --- | --- |
| 音标 | /ˈmɪs.əˌleɪ.ni/ |
| 中文释义 | 杂集；混合物 |
| 英文释义 | A collection of various items or works. |
| freq_rank | 30265 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | miscellany of studies | `academic` | Researchers compiled a miscellany of studies addressing climate change impacts. | 研究人员编纂了一部关于气候变化影响的杂集研究。 |
| 2 | miscellany of opinions | `culture` | During the debate, a miscellany of opinions emerged from the audience. | 在辩论中，观众发表了各种各样的意见。 |
| 3 | miscellany of artifacts | `travel` | The museum displayed a miscellany of artifacts from ancient civilizations. | 博物馆展出了来自古代文明的杂集文物。 |

### 8. detonation  *n.*

| | |
| --- | --- |
| 音标 | /ˌdɛtəˈneɪʃən/ |
| 中文释义 | 爆炸 |
| 英文释义 | The act of causing an explosion or violent burst. |
| freq_rank | 18461 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | detonation sequence | `science_tech` | Researchers studied the detonation sequence of the explosives used in the test. | 研究人员研究了测试中使用的炸药的爆炸顺序。 |
| 2 | detonation chamber | `academic` | The detonation chamber must be safely contained to prevent accidental explosions. | 爆炸室必须安全密闭，以防止意外爆炸。 |
| 3 | detonation waves | `news` | Reports indicated that detonation waves were felt miles away from the blast site. | 报告显示，爆炸波在爆炸地点几英里之外被感受到。 |

### 9. bibulous  *adj.*

| | |
| --- | --- |
| 音标 | /ˈbɪb.jə.ləs/ |
| 中文释义 | 嗜酒的 |
| 英文释义 | Characterized by excessive drinking or a fondness for alcohol. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | bibulous culture | `culture` | A bibulous culture often leads to various social issues and public health concerns. | 嗜酒文化常常导致多种社会问题和公共健康担忧。 |
| 2 | bibulous enjoyment | `daily_life` | Friends gathered for a bibulous enjoyment during the weekend barbecue. | 朋友们在周末烧烤时聚在一起享受嗜酒的乐趣。 |
| 3 | bibulous individuals | `academic` | Research shows that bibulous individuals may face higher risks of certain health conditions. | 研究表明，嗜酒的人可能面临更高的某些健康状况风险。 |

### 10. parlous  *adj./adv.*

| | |
| --- | --- |
| 音标 | /ˈpɑːr.ləs/ |
| 中文释义 | 危险的；不安的 |
| 英文释义 | Full of danger or risk; perilous. |
| freq_rank | 38676 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | parlous state | `news` | The country's parlous state has raised international concerns about stability. | 该国的危险状态引起了国际社会对稳定的担忧。 |
| 2 | parlous times | `academic` | During parlous times, effective leadership becomes increasingly crucial for survival. | 在危险时期，有效的领导对生存变得愈加重要。 |
| 3 | parlous position | `work` | She found herself in a parlous position after the sudden layoffs at her company. | 由于公司突然裁员，她发现自己处于危险的境地。 |

### 11. closure  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈkloʊʒər/ |
| 中文释义 | 闭合；结束 |
| 英文释义 | The act of closing or concluding something, especially a discussion. |
| freq_rank | 5773 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | emotional closure | `daily_life` | Many people seek emotional closure after a significant loss in their lives. | 许多人在经历重大损失后寻求情感的闭合。 |
| 2 | closure of a project | `work` | The closure of a project often leads to reflections on its overall success. | 项目的结束往往会引发对其整体成功的反思。 |
| 3 | closure phase | `academic` | In psychological studies, the closure phase is crucial for participant well-being. | 在心理学研究中，闭合阶段对参与者的福祉至关重要。 |

### 12. disfranchise  *v.*

| | |
| --- | --- |
| 音标 | /dɪsˈfræn.chaɪz/ |
| 中文释义 | 剥夺投票权 |
| 英文释义 | To deprive someone of the right to vote. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | disfranchise voters | `news` | Legislation was introduced to disfranchise voters in the upcoming election. | 立法被提出，剥夺即将到来的选举中的选民投票权。 |
| 2 | disfranchise communities | `academic` | Certain policies tend to disfranchise communities with lower socioeconomic status. | 某些政策往往剥夺低社会经济地位社区的权益。 |
| 3 | disfranchise citizens | `culture` | Many feel that new laws will disfranchise citizens who cannot navigate complex regulations. | 许多人认为，新法律将剥夺无法应对复杂法规的公民权利。 |

### 13. aeronautics  *n.*

| | |
| --- | --- |
| 音标 | /ˌɛə.rəˈnɔː.tɪks/ |
| 中文释义 | 航空学 |
| 英文释义 | The study of flight and the design of aircraft. |
| freq_rank | 26576 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | aeronautics engineering | `academic` | Many universities offer degrees in aeronautics engineering for aspiring students. | 许多大学为有抱负的学生提供航空工程学位。 |
| 2 | aeronautics research | `science_tech` | Innovative aeronautics research is crucial for developing safer aircraft technologies. | 创新的航空学研究对开发更安全的飞机技术至关重要。 |
| 3 | aeronautics industry | `work` | The aeronautics industry is experiencing rapid growth due to technological advancements. | 由于技术进步，航空工业正在经历快速增长。 |

### 14. anorexia  *n.*

| | |
| --- | --- |
| 音标 | /ˌæn.əˈrɛk.si.ə/ |
| 中文释义 | 厌食症 |
| 英文释义 | An eating disorder characterized by an intense fear of gaining weight. |
| freq_rank | 16765 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | anorexia nervosa | `health` | Many adolescents struggle with anorexia nervosa, leading to severe health complications. | 许多青少年与厌食症作斗争，导致严重的健康并发症。 |
| 2 | symptoms of anorexia | `science_tech` | Researchers are investigating the psychological and physical symptoms of anorexia in patients. | 研究人员正在调查患者厌食症的心理和身体症状。 |
| 3 | treatment for anorexia | `academic` | Effective treatment for anorexia often requires a multidisciplinary approach to ensure recovery. | 有效的厌食症治疗通常需要多学科的方法来确保康复。 |

### 15. marsupial  *n./adj.*

| | |
| --- | --- |
| 音标 | /mɑrˈsuː.pi.əl/ |
| 中文释义 | 有袋动物 |
| 英文释义 | A group of mammals with pouches for carrying young. |
| freq_rank | 26241 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | marsupial species | `science_tech` | Many unique marsupial species inhabit Australia and nearby islands. | 许多独特的有袋动物物种栖息在澳大利亚及其附近岛屿。 |
| 2 | marsupial habitats | `environment` | Conservation efforts focus on preserving marsupial habitats for future generations. | 保护工作着重于为后代保护有袋动物栖息地。 |
| 3 | marsupial evolution | `academic` | The study of marsupial evolution reveals fascinating insights into mammalian diversity. | 对有袋动物演化的研究揭示了哺乳动物多样性的迷人见解。 |

### 16. protuberance  *n.*

| | |
| --- | --- |
| 音标 | /prəˈtjuː.bə.rəns/ |
| 中文释义 | 隆起；突出物 |
| 英文释义 | A protruding part or surface of an object. |
| freq_rank | 32583 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | bony protuberance | `health` | Doctors noted a bony protuberance on the patient's wrist. | 医生注意到患者手腕上的一个骨突。 |
| 2 | skin protuberance | `science_tech` | The researchers discovered a skin protuberance in the specimen under examination. | 研究人员在所检验的样本中发现了一个皮肤隆起。 |
| 3 | unusual protuberance | `academic` | An unusual protuberance was observed during the geological survey of the area. | 在该地区的地质调查中观察到了一个异常的隆起。 |
