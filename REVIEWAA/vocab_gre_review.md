# gre 词库内容 · 送审件(抽 100 词)

> 抽样种子固定 20260803,复跑抽到同一批。**不是纯随机** —— 贪心挑成尽量铺开场景与词性,
> 免得 100 个里大半是名词、场景全挤在 news。
> 本批覆盖 **10/10 个场景**、**6 种词性**。
> 全量内容见 `scripts/vocab/data/generated/gre-content.json`。

## 全量 3478 词的实测分布

| 项 | 实测 |
| --- | --- |
| 词条 | 3478 |
| 例句 | 10434(平均每词 3.00 条) |
| 难度档 | B1 5 · B2 247 · C1 3226 |
| ECDICT 未标词性 | 28 词 |
| 跨词性(pos 含 `/`) | 779 词(22.4%) |
| 一次过闸 | 3130 词 · 重试后才过 348 词 |
| 人工撰写 | 4 词(lout caldron dolt boor) |

场景分布(共 10434 条例句):academic 1395 · news 1137 · daily_life 1963 · work 1572 · science_tech 877 · health 485 · environment 357 · education 882 · travel 158 · culture 1608

## 请重点看这四点

1. **中文释义准不准** —— 有没有把次要义当主义、有没有并列近义词充数。
2. **搭配是不是真高频**,顺序是不是真按频率(句 1 应当是最常见的说法)。
3. **例句像不像人写的** —— 三句之间是不是真换了写法,不是同一个模子换词。
4. **难度档合不合适** —— 高频词配短句、低频学术词配长句。

## ⚠️ 我自己知道的薄弱点(不用你去找)

- **跨词性词的义项**:本批有 779 个跨词性词。提示词里加了"跨词性几乎必然对应词典
  分列义项"的自查,实测 state → 状态；国家 ✓、part → 部分；分开 ✓,但 **might(n./aux.)
  仍然给「可能；或许」** —— 近义堆砌且漏了名词义"力量"。没继续迭代提示词(边际收益递减),
  这类**只能靠人审兜**,请留意跨词性词的第二个义项。
- **个别搭配不是真搭配**:如 system 的 "local system"、part 的
  "Understanding is part of the problem we face"(语义空转)。机器闸门只能判"搭配里含不含
  目标词",判不了"这个搭配母语者到底说不说"。
- **人工撰写的 4 条**(上面标了 🖊):模型连续三轮爬不出同一个陷阱才手写的,
  照样过了全部闸门,但请你单独看一眼。

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

### 4. shiftiness  *(ECDICT 没标词性)*

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

### 17. inspired  *adj.*

| | |
| --- | --- |
| 音标 | /ɪnˈspaɪərd/ |
| 中文释义 | 受到启发的 |
| 英文释义 | Stimulated or motivated by an external influence or idea. |
| freq_rank | 8847 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | inspired by | `culture` | Artists are often inspired by nature and its beauty. | 艺术家常常受到自然及其美丽的启发。 |
| 2 | inspired ideas | `education` | Teachers frequently share inspired ideas to engage their students effectively. | 教师们常常分享受到启发的想法，以有效地吸引学生。 |
| 3 | truly inspired | `work` | She delivered a truly inspired presentation that left everyone impressed. | 她的演讲真是受到启发，令所有人印象深刻。 |

### 18. meritorious  *adj.*

| | |
| --- | --- |
| 音标 | /ˌmɛrɪˈtɔːriəs/ |
| 中文释义 | 值得赞赏的；有功绩的 |
| 英文释义 | Deserving praise or recognition for achievements or qualities. |
| freq_rank | 24074 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | meritorious service | `work` | His meritorious service to the company was recognized at the annual meeting. | 他对公司的值得赞赏的贡献在年会上得到了认可。 |
| 2 | meritorious achievements | `academic` | Students are encouraged to pursue meritorious achievements in their academic careers. | 学生们被鼓励在学术生涯中追求值得赞赏的成就。 |
| 3 | meritorious conduct | `daily_life` | Her meritorious conduct during the crisis inspired others in the community. | 她在危机期间的值得赞赏的行为激励了社区中的其他人。 |

### 19. condole  *v.*

| | |
| --- | --- |
| 音标 | /kənˈdoʊl/ |
| 中文释义 | 哀悼 |
| 英文释义 | To express sympathy for someone's sorrow or loss. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | condole with someone | `daily_life` | Friends often condole with families during difficult times of grief. | 朋友们常常在艰难的哀伤时刻向家属表示哀悼。 |
| 2 | condole on someone's death | `news` | The community leaders gathered to condole on the untimely death of a respected member. | 社区领导人聚集在一起，为一位受人尊敬的成员的过世表示哀悼。 |
| 3 | condole with the bereaved | `culture` | It is customary to condole with the bereaved at a funeral service. | 在葬礼上向丧亲者表示哀悼是习俗。 |

### 20. invulnerable  *adj.*

| | |
| --- | --- |
| 音标 | /ɪnˈvʌl.nər.ə.bəl/ |
| 中文释义 | 无懈可击的；不可伤害的 |
| 英文释义 | Incapable of being harmed or damaged. |
| freq_rank | 23429 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | invulnerable to attacks | `news` | In recent debates, some politicians claimed their policies made them invulnerable to attacks. | 在最近的辩论中，一些政客声称他们的政策使他们无懈可击。 |
| 2 | invulnerable position | `academic` | The study concluded that certain species are in an invulnerable position against environmental changes. | 研究得出结论，某些物种对环境变化处于无懈可击的位置。 |
| 3 | invulnerable individual | `health` | An invulnerable individual is often perceived as someone who never gets sick. | 无懈可击的个体常常被认为是一个从不生病的人。 |

### 21. voluptuous  *adj.*

| | |
| --- | --- |
| 音标 | /vəˈlʌp.tʃu.əs/ |
| 中文释义 | 丰腴的；妖艳的 |
| 英文释义 | Characterized by luxury, sensual pleasure, or fullness. |
| freq_rank | 17728 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | voluptuous curves | `culture` | Fashion models often showcase voluptuous curves in contemporary advertisements. | 时尚模特在当代广告中常常展示丰腴的曲线。 |
| 2 | voluptuous lifestyle | `daily_life` | Many celebrities are known for their voluptuous lifestyle filled with luxury and indulgence. | 许多名人以丰腴的奢华生活方式而闻名。 |
| 3 | voluptuous beauty | `work` | The artist captured her voluptuous beauty in the stunning painting he created. | 艺术家在他创作的惊艳画作中捕捉到了她丰腴的美。 |

### 22. grievous  *adj.*

| | |
| --- | --- |
| 音标 | /ˈɡriː.vəs/ |
| 中文释义 | 悲惨的；严重的 |
| 英文释义 | Causing great sorrow or pain; serious or severe in nature. |
| freq_rank | 20105 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | grievous harm | `news` | Many citizens are concerned about the grievous harm caused by pollution. | 许多市民对污染造成的严重伤害表示担忧。 |
| 2 | grievous error | `academic` | Researchers noted a grievous error in the published study that could mislead others. | 研究人员指出该已发表研究中的严重错误可能误导他人。 |
| 3 | grievous consequences | `work` | Failure to comply with safety standards can lead to grievous consequences for employees. | 未能遵循安全标准可能会给员工带来严重后果。 |

### 23. autocracy  *n.*

| | |
| --- | --- |
| 音标 | /ɔːˈtɒk.rə.si/ |
| 中文释义 | 独裁统治 |
| 英文释义 | A system of government with absolute power held by one leader or group. |
| freq_rank | 22674 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | autocracy in government | `news` | Countries with an autocracy in government often face international criticism. | 拥有独裁统治的国家常常面临国际批评。 |
| 2 | rise of autocracy | `academic` | The rise of autocracy can lead to significant social unrest and violence. | 独裁统治的兴起可能导致严重的社会动荡和暴力。 |
| 3 | autocracy vs democracy | `culture` | Debates about autocracy vs democracy continue to shape modern political landscapes. | 关于独裁统治与民主的辩论继续塑造现代政治格局。 |

### 24. flit  *n./v.*

| | |
| --- | --- |
| 音标 | /flɪt/ |
| 中文释义 | 快速移动；飞翔 |
| 英文释义 | To move swiftly and lightly from one place to another. |
| freq_rank | 14466 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | flit between different roles | `work` | Employees often flit between different roles to gain diverse skills. | 员工们常常在不同的角色间快速切换，以获得多样化的技能。 |
| 2 | flit from topic to topic | `academic` | In discussions, scholars frequently flit from topic to topic without clear transitions. | 在讨论中，学者们常常在不同话题间快速跳跃，缺乏清晰的过渡。 |
| 3 | flit about the garden | `daily_life` | Butterflies flit about the garden, adding beauty to the vibrant flowers. | 蝴蝶在花园中飞舞，为鲜艳的花朵增添了美丽。 |

### 25. imitative  *adj.*

| | |
| --- | --- |
| 音标 | /ˈɪmɪˌteɪtɪv/ |
| 中文释义 | 模仿的 |
| 英文释义 | Related to mimicking or copying something or someone. |
| freq_rank | 27592 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | imitative behavior | `daily_life` | Children often engage in imitative behavior while playing with friends. | 孩子们在和朋友玩耍时常常表现出模仿行为。 |
| 2 | imitative art | `culture` | Imitative art can reveal the influence of various cultural styles on an artist's work. | 模仿艺术可以揭示多种文化风格对艺术家作品的影响。 |
| 3 | imitative learning | `education` | Teachers encourage imitative learning to help students grasp complex concepts more easily. | 教师鼓励模仿学习，以帮助学生更容易地掌握复杂概念。 |

### 26. quay  *n.*

| | |
| --- | --- |
| 音标 | /kiː/ |
| 中文释义 | 码头 |
| 英文释义 | A structure on the shore of a harbor where ships dock. |
| freq_rank | 22357 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | fishing quay | `daily_life` | Fishermen often gather at the fishing quay to exchange their catches. | 渔民经常在渔码头聚集，交流他们的捕获。 |
| 2 | cargo quay | `work` | The cargo quay was bustling with trucks loading and unloading shipments. | 货物码头上，卡车正忙着装卸货物，热闹非凡。 |
| 3 | quay wall | `travel` | Tourists enjoyed a lovely evening walk along the quay wall by the waterfront. | 游客们在滨水区的码头墙边享受了一个美好的夜晚散步。 |

### 27. zephyr  *n.*

| | |
| --- | --- |
| 音标 | /ˈzɛf.ər/ |
| 中文释义 | 微风 |
| 英文释义 | A gentle, mild breeze, often associated with spring. |
| freq_rank | 29600 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | zephyr winds | `environment` | Gentle zephyr winds swept across the meadow, bringing a sense of calm. | 温和的微风掠过草地，带来宁静的感觉。 |
| 2 | zephyr-like | `culture` | In literature, the author describes the zephyr-like quality of her protagonist's spirit. | 在文学中，作者描绘了主角精神的微风般特质。 |
| 3 | zephyr breezes | `travel` | As we traveled along the coast, zephyr breezes made the journey delightful. | 当我们沿着海岸旅行时，微风让旅程变得愉快。 |

### 28. defalcate  *v.*

| | |
| --- | --- |
| 音标 | /ˈdɛ.fæl.keɪt/ |
| 中文释义 | 挪用；贪污 |
| 英文释义 | To embezzle or misappropriate funds or resources. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | defalcate funds | `work` | The accountant was found guilty of defalcating funds from the company. | 这名会计因挪用公司的资金而被判有罪。 |
| 2 | defalcate money | `news` | Several officials were accused of defalcating money intended for public services. | 几位官员被指控挪用本应用于公共服务的资金。 |
| 3 | defalcate resources | `academic` | Researchers highlighted the risk of organizations that might defalcate resources for personal gain. | 研究人员强调了组织可能挪用资源以谋取个人利益的风险。 |

### 29. reinstate  *v.*

| | |
| --- | --- |
| 音标 | /ˌriː.ɪnˈsteɪt/ |
| 中文释义 | 恢复；复职 |
| 英文释义 | To restore someone or something to a previous position or condition. |
| freq_rank | 10892 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | reinstate funding | `academic` | The university decided to reinstate funding for the research project. | 大学决定恢复该研究项目的资金支持。 |
| 2 | reinstate a policy | `work` | Management will reinstate a policy that helps improve employee morale. | 管理层将恢复一项有助于提升员工士气的政策。 |
| 3 | reinstate the order | `news` | Authorities worked hard to reinstate the order after the protests. | 当局努力在抗议之后恢复秩序。 |

### 30. axiom  *n.*

| | |
| --- | --- |
| 音标 | /ˈæk.si.əm/ |
| 中文释义 | 公理 |
| 英文释义 | A statement accepted as true without proof in a system. |
| freq_rank | 16970 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | axioms of mathematics | `academic` | Many students struggle to understand the axioms of mathematics clearly. | 许多学生很难清晰地理解数学公理。 |
| 2 | axiom of choice | `science_tech` | The axiom of choice is fundamental in many areas of mathematics. | 选择公理在许多数学领域中是基础。 |
| 3 | axioms of economics | `work` | Understanding the axioms of economics helps in making better business decisions. | 理解经济学公理有助于做出更好的商业决策。 |

### 31. latency  *n.*

| | |
| --- | --- |
| 音标 | /ˈleɪ.tən.si/ |
| 中文释义 | 延迟 |
| 英文释义 | The delay before a transfer of data begins following an instruction. |
| freq_rank | 18606 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | network latency | `science_tech` | Network latency can significantly impact the performance of online applications. | 网络延迟会显著影响在线应用程序的性能。 |
| 2 | latency period | `health` | The latency period for this virus can vary greatly among individuals. | 这种病毒的潜伏期因个体差异而有很大不同。 |
| 3 | latency measurement | `academic` | Researchers often focus on latency measurement to improve system efficiency. | 研究人员通常关注延迟测量以提高系统效率。 |

### 32. gluttonous  *adj.*

| | |
| --- | --- |
| 音标 | /ˈɡlʌtənəs/ |
| 中文释义 | 贪吃的；暴食的 |
| 英文释义 | Excessively greedy, especially in eating or consuming. |
| freq_rank | 36758 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | gluttonous behavior | `daily_life` | People often criticize gluttonous behavior during holiday feasts, as it can lead to health issues. | 人们常常批评假期盛宴中的贪吃行为，因为这可能导致健康问题。 |
| 2 | gluttonous appetite | `health` | A gluttonous appetite can negatively affect one's overall well-being and fitness. | 贪吃的胃口会对一个人的整体健康和身体状况产生负面影响。 |
| 3 | gluttonous tendencies | `academic` | Research indicates that gluttonous tendencies may have both genetic and environmental influences. | 研究表明，贪吃的倾向可能受到遗传和环境的影响。 |

### 33. overriding  *(ECDICT 没标词性)*

| | |
| --- | --- |
| 音标 | /ˈoʊ.vərˌraɪ.dɪŋ/ |
| 中文释义 | 优先考虑的；压倒性的 |
| 英文释义 | Having greater importance or priority than others. |
| freq_rank | 12417 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | overriding concern | `news` | Many policymakers view economic stability as the overriding concern for the upcoming elections. | 许多政策制定者将经济稳定视为即将到来的选举中最重要的关注点。 |
| 2 | overriding principle | `education` | Teachers must abide by the overriding principle of student safety in all classroom activities. | 教师在所有课堂活动中都必须遵守学生安全这一首要原则。 |
| 3 | overriding interest | `work` | The team decided that the project's success should be the overriding interest for all members involved. | 团队决定，项目的成功应该是所有参与成员的首要利益。 |

### 34. cogitate  *v.*

| | |
| --- | --- |
| 音标 | /ˈkɒdʒ.ɪ.teɪt/ |
| 中文释义 | 深思；思考 |
| 英文释义 | To think deeply or carefully about something. |
| freq_rank | 42191 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | cogitate on an issue | `academic` | Researchers often cogitate on this issue for many years before reaching conclusions. | 研究人员通常在这个问题上深思多年才得出结论。 |
| 2 | cogitate over a problem | `work` | Many engineers cogitate over a problem before proposing innovative solutions. | 许多工程师在提出创新解决方案之前会深思这个问题。 |
| 3 | cogitate about life | `daily_life` | During quiet moments, she likes to cogitate about life and its complexities. | 在安静的时刻，她喜欢深思生活及其复杂性。 |

### 35. gosling  *n.*

| | |
| --- | --- |
| 音标 | /ˈɡɑz.lɪŋ/ |
| 中文释义 | 雏鹅 |
| 英文释义 | A young goose, especially one less than a year old. |
| freq_rank | 36865 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | gosling population | `environment` | The gosling population has increased significantly in recent years due to conservation efforts. | 由于保护工作的努力，雏鹅的数量近年来显著增加。 |
| 2 | gosling feathers | `daily_life` | Tiny gosling feathers can often be found scattered around the pond in spring. | 春天，在池塘周围常常能找到小雏鹅的羽毛。 |
| 3 | gosling behavior | `academic` | Research on gosling behavior reveals interesting insights into their social interactions. | 对雏鹅行为的研究揭示了它们社会交往中的有趣见解。 |

### 36. ringlet  *n.*

| | |
| --- | --- |
| 音标 | /ˈrɪŋ.lɛt/ |
| 中文释义 | 小卷发；卷发 |
| 英文释义 | A small, spiral curl of hair. |
| freq_rank | 23871 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | ringlet hairstyle | `daily_life` | Many celebrities are known for their iconic ringlet hairstyles. | 许多名人以其标志性的小卷发发型而闻名。 |
| 2 | ringlet curls | `culture` | Traditional dances often feature women with elaborate ringlet curls. | 传统舞蹈中，女性通常会有华丽的小卷发。 |
| 3 | perfect ringlet | `education` | In our hair styling class, we learned how to create the perfect ringlet. | 在我们的发型设计课程中，我们学习了如何打造完美的小卷发。 |

### 37. coagulation  *n.*

| | |
| --- | --- |
| 音标 | /koʊˌæɡ.jəˈleɪ.ʃən/ |
| 中文释义 | 凝固；凝结 |
| 英文释义 | The process of changing from a liquid to a solid state. |
| freq_rank | 27482 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | coagulation process | `science_tech` | Researchers studied the coagulation process in blood samples from patients. | 研究人员研究了患者血样中的凝固过程。 |
| 2 | coagulation factors | `health` | Deficiencies in coagulation factors can lead to severe bleeding disorders. | 凝固因子的缺乏可能导致严重的出血障碍。 |
| 3 | coagulation of proteins | `academic` | The coagulation of proteins is essential in various biochemical reactions. | 蛋白质的凝固在各种生化反应中是必不可少的。 |

### 38. misogamy  *n.*

| | |
| --- | --- |
| 音标 | /mɪˈzɑː.ɡə.mi/ |
| 中文释义 | 厌婚 |
| 英文释义 | A dislike or aversion to marriage or the institution of marriage. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | misogamy has been studied in sociology | `academic` | Researchers found that misogamy has significant cultural implications in modern society. | 研究人员发现，厌婚在现代社会中具有重要的文化意义。 |
| 2 | views on misogamy | `culture` | Many young adults express their views on misogamy during discussions about relationships. | 许多年轻人在关于人际关系的讨论中表达他们对厌婚的看法。 |
| 3 | misogamy is on the rise | `news` | Recent studies suggest that misogamy is on the rise among millennials and Gen Z. | 最近的研究表明，厌婚在千禧一代和Z世代中正在上升。 |

### 39. spindly  *adj.*

| | |
| --- | --- |
| 音标 | /ˈspɪnd.li/ |
| 中文释义 | 纤细的；瘦弱的 |
| 英文释义 | Long, thin, and weak in appearance or structure. |
| freq_rank | 18091 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | spindly legs | `daily_life` | Children often have spindly legs that make them appear fragile. | 孩子们的腿常常纤细，显得很脆弱。 |
| 2 | spindly trees | `environment` | In the forest, spindly trees struggle to reach the sunlight. | 在森林里，纤细的树木努力争取阳光。 |
| 3 | spindly growth | `science_tech` | The laboratory observed spindly growth patterns in the mutated plants. | 实验室观察到突变植物的生长模式纤细。 |

### 40. scald  *n./v.*

| | |
| --- | --- |
| 音标 | /skɔld/ |
| 中文释义 | 烫伤；热水烫伤 |
| 英文释义 | To burn the skin with hot liquid or steam. |
| freq_rank | 19697 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | scald someone | `health` | Children are often scalded by hot liquids left unattended. | 孩子们常常会被无人看管的热液体烫伤。 |
| 2 | scald the skin | `science_tech` | When water reaches a certain temperature, it can scald the skin quickly. | 当水达到一定温度时，会迅速烫伤皮肤。 |
| 3 | scalding water | `daily_life` | He accidentally spilled scalding water on his hand while cooking. | 他在做饭时不小心把烫热的水洒在手上。 |

### 41. undergird  *v.*

| | |
| --- | --- |
| 音标 | /ˌʌndərˈɡɪrd/ |
| 中文释义 | 支撑；加强 |
| 英文释义 | To support or strengthen from underneath. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | undergird the principles | `academic` | Scholars believe these theories undergird the principles of modern physics. | 学者们认为这些理论支撑了现代物理学的原则。 |
| 2 | undergird the economy | `news` | Policies that undergird the economy are crucial for sustainable growth. | 支撑经济的政策对可持续增长至关重要。 |
| 3 | undergird the argument | `work` | Data collected from various sources undergird the argument made in the report. | 从各种来源收集的数据支撑了报告中的论点。 |

### 42. unworldly  *adj.*

| | |
| --- | --- |
| 音标 | /ʌnˈwɜrldli/ |
| 中文释义 | 不属于世俗的；超然的 |
| 英文释义 | Not influenced by worldly concerns or affairs. |
| freq_rank | 32764 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | unworldly perspective | `academic` | Researchers often adopt an unworldly perspective when examining complex societal issues. | 研究人员在审视复杂社会问题时，常常采用超然的视角。 |
| 2 | unworldly nature | `culture` | Artists and writers frequently embody an unworldly nature in their imaginative works. | 艺术家和作家在他们的创作中常常体现出不属于世俗的特性。 |
| 3 | unworldly beliefs | `daily_life` | Many people hold unworldly beliefs that challenge conventional wisdom in today's society. | 许多人持有超然的信念，挑战当今社会的传统智慧。 |

### 43. giddy  *adj./v.*

| | |
| --- | --- |
| 音标 | /ˈɡɪ.di/ |
| 中文释义 | 兴奋的；头晕的 |
| 英文释义 | Feeling light-headed or overly joyful, often with dizziness. |
| freq_rank | 11227 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | giddy heights | `culture` | Winning the award left her in the giddy heights of success. | 获奖让她沉浸在辉煌的成功之中。 |
| 2 | giddy with excitement | `daily_life` | Children often feel giddy with excitement during the holiday season. | 孩子们在假日期间常常因兴奋而感到头晕目眩。 |
| 3 | giddy laughter | `education` | Their giddy laughter echoed through the classroom during the fun activity. | 他们的欢快笑声在有趣的活动中回荡在教室里。 |

### 44. outlandish  *adj.*

| | |
| --- | --- |
| 音标 | /aʊtˈlændɪʃ/ |
| 中文释义 | 异乎寻常的；荒唐的 |
| 英文释义 | Very unusual, bizarre, or extravagant in appearance or behavior. |
| freq_rank | 15124 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | outlandish outfits | `culture` | People often wear outlandish outfits during the annual carnival celebration. | 人们在年度狂欢节庆祝活动中常常穿着异乎寻常的服装。 |
| 2 | outlandish claims | `news` | Experts dismissed the politician's outlandish claims as completely unfounded. | 专家们驳斥了这位政治家的荒唐主张，认为毫无根据。 |
| 3 | outlandish ideas | `work` | She proposed several outlandish ideas during the brainstorming session, surprising everyone. | 在头脑风暴会议上，她提出了几个异乎寻常的想法，令大家感到惊讶。 |

### 45. diabetes  *n.*

| | |
| --- | --- |
| 音标 | /ˈdaɪ.ə.biː.tɪs/ |
| 中文释义 | 糖尿病 |
| 英文释义 | A chronic condition affecting blood sugar regulation. |
| freq_rank | 4089 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | type 2 diabetes | `health` | Many people are diagnosed with type 2 diabetes every year. | 每年都有许多人被诊断为患有二型糖尿病。 |
| 2 | manage diabetes | `daily_life` | Individuals must learn how to manage diabetes effectively to stay healthy. | 个人必须学会有效管理糖尿病，以保持健康。 |
| 3 | diabetes research | `science_tech` | New findings in diabetes research may change treatment approaches significantly. | 糖尿病研究的新发现可能会显著改变治疗方法。 |

### 46. memoir  *n.*

| | |
| --- | --- |
| 音标 | /ˈmɛm.wɑːr/ |
| 中文释义 | 回忆录 |
| 英文释义 | A historical account or biography written from personal knowledge. |
| freq_rank | 5572 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | publish a memoir | `culture` | She decided to publish her memoir to share her experiences with others. | 她决定出版回忆录，与他人分享她的经历。 |
| 2 | memoir writing | `education` | Students often struggle with memoir writing due to its personal nature. | 学生们常常因为回忆录写作的个人性质而感到困难。 |
| 3 | memoir of a historical figure | `academic` | The memoir of a historical figure can provide valuable insights into their life. | 历史人物的回忆录可以提供关于其生活的宝贵见解。 |

### 47. authorization  *n.*

| | |
| --- | --- |
| 音标 | /ˌɔːθəraɪˈzeɪʃən/ |
| 中文释义 | 授权 |
| 英文释义 | Permission or approval to do something or access information. |
| freq_rank | 9750 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | user authorization | `work` | Companies require user authorization before granting access to sensitive data. | 公司在授予访问敏感数据之前需要用户授权。 |
| 2 | authorization process | `science_tech` | The authorization process for new drugs can take several years to complete. | 新药的授权过程可能需要几年才能完成。 |
| 3 | authorization letters | `daily_life` | Individuals often need authorization letters to travel with minors. | 个人常常需要授权信才能与未成年人旅行。 |

### 48. tautological  *adj.*

| | |
| --- | --- |
| 音标 | /ˌtɔː.təˈlɑː.dʒɪ.kəl/ |
| 中文释义 | 同义反复的 |
| 英文释义 | Involving unnecessary repetition of meaning or expression. |
| freq_rank | 35910 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | tautological statements | `academic` | Many scholars critique tautological statements for lacking substantive content. | 许多学者批评同义反复的陈述缺乏实质内容。 |
| 2 | tautological reasoning | `work` | His tautological reasoning failed to convince the committee members during the meeting. | 他的同义反复推理未能在会议中说服委员会成员。 |
| 3 | tautological phrases | `daily_life` | People often use tautological phrases without realizing they are doing so. | 人们常常在不知不觉中使用同义反复的短语。 |

### 49. wilt  *v./n.*

| | |
| --- | --- |
| 音标 | /wɪlt/ |
| 中文释义 | 枯萎；衰退 |
| 英文释义 | To lose freshness or vigor; to fade or droop. |
| freq_rank | 10000 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | wilt under pressure | `work` | Many employees wilt under pressure during peak seasons. | 许多员工在高峰季节承压而感到疲惫。 |
| 2 | plants wilt | `environment` | When exposed to extreme heat, plants often wilt and lose their shape. | 在极端高温下，植物常常会枯萎并失去形状。 |
| 3 | flowers wilt | `daily_life` | After a few days without water, the flowers began to wilt. | 几天没有水后，花朵开始枯萎。 |

### 50. abjure  *v.*

| | |
| --- | --- |
| 音标 | /əbˈdʒʊr/ |
| 中文释义 | 放弃；声明放弃 |
| 英文释义 | To formally reject or disavow a belief or claim. |
| freq_rank | 30718 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | abjure one's beliefs | `culture` | Many intellectuals have chosen to abjure their previous beliefs for new ideologies. | 许多知识分子选择放弃他们之前的信仰，转向新的意识形态。 |
| 2 | abjure violence | `news` | The government urged citizens to abjure violence in light of recent events. | 政府呼吁市民在近期事件的背景下放弃暴力。 |
| 3 | abjure one's citizenship | `work` | He decided to abjure his citizenship to pursue opportunities abroad. | 他决定放弃国籍，去国外追求机会。 |

### 51. calipers  *n.*

| | |
| --- | --- |
| 音标 | /ˈkæl.ɪ.pərz/ |
| 中文释义 | 卡尺 |
| 英文释义 | Instruments used to measure the distance between two opposite sides of an object. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | digital calipers | `science_tech` | Digital calipers provide accurate measurements for various engineering applications. | 数显卡尺为各种工程应用提供了精确的测量。 |
| 2 | Vernier calipers | `academic` | Vernier calipers are essential tools for precise measurements in laboratory experiments. | 游标卡尺是实验室实验中进行精确测量的基本工具。 |
| 3 | calipers measurement | `work` | The calipers measurement process requires careful handling to ensure accuracy. | 卡尺测量过程需要小心操作，以确保准确性。 |

### 52. premiere  *v./n./adj.*

| | |
| --- | --- |
| 音标 | /prɪˈmɪr/ |
| 中文释义 | 首映；首次公演 |
| 英文释义 | The first public performance of a play or film. |
| freq_rank | 6832 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | premiere show | `culture` | She attended the premiere show of the new blockbuster last night. | 昨晚，她参加了这部新大片的首映。 |
| 2 | premiere event | `news` | The documentary's premiere event gathered many famous filmmakers and actors. | 这部纪录片的首映活动吸引了许多著名电影制片人和演员。 |
| 3 | premiere screening | `daily_life` | We enjoyed a premiere screening of our friend's short film at the festival. | 在节日上，我们欣赏了朋友短片的首映放映。 |

### 53. know-how  *n.*

| | |
| --- | --- |
| 音标 | /ˈnoʊ haʊ/ |
| 中文释义 | 专业知识；技能 |
| 英文释义 | Practical knowledge or skill in a particular area. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | technical know-how | `work` | Engineers must possess extensive technical know-how to solve complex problems. | 工程师必须具备丰富的技术专业知识，以解决复杂问题。 |
| 2 | business know-how | `education` | Students are taught essential business know-how for successful entrepreneurship. | 学生们学习成功创业所需的基本商业专业知识。 |
| 3 | scientific know-how | `science_tech` | Researchers are advancing scientific know-how to address climate change challenges. | 研究人员正在推进科学专业知识，以应对气候变化的挑战。 |

### 54. sidle  *v./n.*

| | |
| --- | --- |
| 音标 | /ˈsaɪ.dl̩/ |
| 中文释义 | 溜走；侧身而行 |
| 英文释义 | To move sideways, especially in a quiet or secretive manner. |
| freq_rank | 17493 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | sidle up to someone | `daily_life` | She decided to sidle up to her friend during the meeting. | 她决定在会议期间悄悄靠近她的朋友。 |
| 2 | sidle past | `work` | Employees tend to sidle past the manager's office when avoiding confrontation. | 员工在避免冲突时常常悄悄经过经理的办公室。 |
| 3 | sidle away | `news` | The suspect attempted to sidle away from the scene of the incident unnoticed. | 嫌疑人试图悄悄离开事件现场而未被发现。 |

### 55. contraband  *n./adj.*

| | |
| --- | --- |
| 音标 | /ˈkɒn.trə.bænd/ |
| 中文释义 | 走私物品 |
| 英文释义 | Goods that are imported or exported illegally. |
| freq_rank | 19922 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | contraband goods | `news` | Authorities seized a large shipment of contraband goods at the border. | 当局在边境查获了一大批走私物品。 |
| 2 | contraband activities | `daily_life` | She reported suspicious contraband activities occurring in her neighborhood. | 她报告了她的邻里出现可疑的走私活动。 |
| 3 | contraband trafficking | `academic` | Research focuses on the impacts of contraband trafficking on local communities. | 研究聚焦于走私贩运对当地社区的影响。 |

### 56. sheaf  *n./v.*

| | |
| --- | --- |
| 音标 | /ʃiːf/ |
| 中文释义 | 捆；束 |
| 英文释义 | A bundle of grain stalks laid lengthwise and tied together. |
| freq_rank | 16707 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | sheaf of papers | `work` | Numerous reports were submitted as a sheaf of papers to the committee. | 大量报告作为一捆文件提交给委员会。 |
| 2 | sheaf of wheat | `environment` | Farmers harvested a sheaf of wheat from the field immediately after the rain. | 农民在雨后立即从田里收割了一捆小麦。 |
| 3 | sheaf of arrows | `culture` | The archer displayed a colorful sheaf of arrows at the festival last weekend. | 射手在上周末的节日上展示了一捆五彩斑斓的箭。 |

### 57. rustle  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈrʌs.əl/ |
| 中文释义 | 沙沙声；窃窃私语 |
| 英文释义 | A soft sound made by leaves or paper moving lightly. |
| freq_rank | 12778 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | rustle of leaves | `daily_life` | Leaves rustled gently in the breeze, creating a calming atmosphere. | 微风中树叶沙沙作响，营造出一种宁静的氛围。 |
| 2 | rustle of papers | `work` | She heard the rustle of papers as her colleague organized the files. | 她听到同事整理文件时沙沙作响的声音。 |
| 3 | rustle of fabric | `culture` | At the fashion show, the rustle of fabric echoed through the hall. | 在时装秀上，布料的沙沙声在大厅中回荡。 |

### 58. libertine  *n./adj.*

| | |
| --- | --- |
| 音标 | /ˈlɪb.ɚ.tiːn/ |
| 中文释义 | 放荡不羁的人；纵欲者 |
| 英文释义 | A person who behaves without moral restraint, especially in sexual matters. |
| freq_rank | 34433 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | libertine lifestyle | `culture` | Many young people aspire to a libertine lifestyle, enjoying freedom and indulgence. | 许多年轻人渴望过放荡不羁的生活，享受自由与放纵。 |
| 2 | libertine tendencies | `daily_life` | He often displays libertine tendencies, disregarding conventional morals and values. | 他经常表现出放荡不羁的倾向，忽视传统的道德和价值观。 |
| 3 | libertine literature | `academic` | The study of libertine literature reveals much about societal norms in past centuries. | 对放荡文艺作品的研究揭示了过去几个世纪的社会规范。 |

### 59. accrue  *v.*

| | |
| --- | --- |
| 音标 | /əˈkruː/ |
| 中文释义 | 积累；增加 |
| 英文释义 | To gather or accumulate over time. |
| freq_rank | 12166 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | accrue interest | `work` | Businesses need to ensure that profits accrue interest effectively to maximize returns. | 企业需要确保利润有效地积累利息，以最大化回报。 |
| 2 | accrue benefits | `education` | Students who study hard will accrue benefits that last a lifetime. | 努力学习的学生将获得终身受益。 |
| 3 | accrue expenses | `daily_life` | You might not notice how quickly expenses can accrue during a vacation. | 你可能没有意识到假期期间开支会快速积累。 |

### 60. lobe  *n.*

| | |
| --- | --- |
| 音标 | /loʊb/ |
| 中文释义 | 叶；耳垂 |
| 英文释义 | A rounded or projecting part of an organ or structure. |
| freq_rank | 11517 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | frontal lobe | `health` | The frontal lobe is crucial for decision-making and impulse control. | 额叶对决策和控制冲动至关重要。 |
| 2 | temporal lobe | `science_tech` | Damage to the temporal lobe can affect memory and language abilities. | 颞叶损伤可能影响记忆和语言能力。 |
| 3 | lobe of the ear | `daily_life` | He wore a diamond stud in his lobe of the ear, catching everyone's attention. | 他在耳垂上戴着一个钻石耳钉，吸引了所有人的注意。 |

### 61. inflame  *v.*

| | |
| --- | --- |
| 音标 | /ɪnˈfleɪm/ |
| 中文释义 | 激发；煽动 |
| 英文释义 | To provoke strong feelings or intense reactions. |
| freq_rank | 13961 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | inflame emotions | `culture` | Public speeches can easily inflame emotions within communities during protests. | 公众演讲在抗议活动中容易激发社区内的情绪。 |
| 2 | inflame tensions | `news` | Recent events have inflamed tensions between the two rival political parties. | 最近的事件加剧了两大对立政党之间的紧张关系。 |
| 3 | inflame controversies | `academic` | Scholars often inflame controversies by publishing provocative research findings. | 学者们通过发表挑衅性的研究结果，常常引发争议。 |

### 62. cringe  *n./v.*

| | |
| --- | --- |
| 音标 | /krɪndʒ/ |
| 中文释义 | 感到不适；尴尬 |
| 英文释义 | To experience discomfort or embarrassment due to someone's actions or statements. |
| freq_rank | 10670 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | cringe at someone's behavior | `daily_life` | Many people cringe at the thought of attending awkward social gatherings. | 许多人对参加尴尬的社交聚会感到不适。 |
| 2 | cringe-worthy moment | `culture` | The film contained several cringe-worthy moments that made the audience uncomfortable. | 这部电影包含了几个让观众感到尴尬的时刻。 |
| 3 | cringe in response to criticism | `academic` | Students often cringe in response to harsh feedback from their professors. | 学生们通常会对教授的严厉反馈感到不适。 |

### 63. augur  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈɔː.ɡər/ |
| 中文释义 | 预言；预兆 |
| 英文释义 | To predict or indicate future events. |
| freq_rank | 26617 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | augur well | `news` | Many analysts believe the new policies will augur well for economic growth. | 许多分析师认为，新政策将预示经济增长的良好前景。 |
| 2 | augur a change | `education` | Such findings may augur a change in educational strategies for better student engagement. | 这些发现可能预示着教育策略将发生变化，以提高学生的参与度。 |
| 3 | augur ill | `science_tech` | The initial results of the study augur ill for the effectiveness of the proposed treatment. | 研究的初步结果对所提议的治疗效果预示着不利的局面。 |

### 64. bandy  *adj./v.*

| | |
| --- | --- |
| 音标 | /ˈbæn.di/ |
| 中文释义 | 相互交换；互相传递 |
| 英文释义 | To pass back and forth; to exchange in conversation. |
| freq_rank | 24176 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | bandy words | `daily_life` | Their friends often bandy words about politics during dinner parties. | 他们的朋友们常常在晚宴上讨论政治话题，互相交流意见。 |
| 2 | bandy ideas | `work` | In the meeting, team members bandy ideas to improve the project. | 在会议上，团队成员们互相交流想法，以改进项目。 |
| 3 | bandy about | `academic` | Scholars tend to bandy about theories without sufficient evidence. | 学者们往往在没有足够证据的情况下，互相传播理论。 |

### 65. covenant  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈkʌv.ən.ənt/ |
| 中文释义 | 契约；盟约 |
| 英文释义 | A formal agreement between parties, often legal in nature. |
| freq_rank | 11267 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | covenants in law | `academic` | Lawyers often examine covenants in law to ensure compliance. | 律师通常检查法律中的契约以确保遵守。 |
| 2 | covenants between nations | `news` | Recent treaties include covenants between nations to address climate change. | 最近的条约包括国家间为应对气候变化而签订的契约。 |
| 3 | covenant of partnership | `work` | Establishing a covenant of partnership can enhance collaborative efforts in projects. | 建立合作伙伴关系的契约可以增强项目中的协作努力。 |

### 66. rudder  *n.*

| | |
| --- | --- |
| 音标 | /ˈrʌdər/ |
| 中文释义 | 舵 |
| 英文释义 | A device used for steering a boat or ship. |
| freq_rank | 16535 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | steering rudder | `travel` | When navigating through rough seas, a functioning steering rudder is essential. | 在恶劣海域航行时，正常运作的舵是必不可少的。 |
| 2 | rudder position | `science_tech` | Engineers must carefully analyze the rudder position to ensure stability. | 工程师必须仔细分析舵的位置以确保稳定性。 |
| 3 | rudder control | `work` | The pilot adjusted the rudder control to improve the aircraft's maneuverability. | 飞行员调整了舵控制以提高飞机的机动性。 |

### 67. furor  *n.*

| | |
| --- | --- |
| 音标 | /ˈfjʊr.ɔːr/ |
| 中文释义 | 狂热；激动 |
| 英文释义 | An intense and often public outburst of excitement or anger. |
| freq_rank | 15523 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | public furor | `news` | Outrage over the decision sparked a public furor that lasted for weeks. | 对这一决定的愤怒引发了持续数周的公众狂热。 |
| 2 | political furor | `culture` | The political furor surrounding the election revealed deep divisions within society. | 围绕选举的政治狂热暴露了社会内部的深刻分歧。 |
| 3 | media furor | `daily_life` | After the celebrity's remarks, there was a media furor that captivated the nation. | 在这位名人的言论之后，媒体狂热吸引了全国的注意。 |

### 68. potentiate  *v.*

| | |
| --- | --- |
| 音标 | /pəˈtɛn.ʃi.eɪt/ |
| 中文释义 | 增强；促进 |
| 英文释义 | To increase or enhance the effect of something. |
| freq_rank | 37489 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | potentiate the effects | `science_tech` | Researchers found that certain compounds can potentiate the effects of medications. | 研究人员发现某些化合物可以增强药物的效果。 |
| 2 | potentiate the response | `health` | The new therapy aims to potentiate the response of the immune system to infections. | 新疗法旨在增强免疫系统对感染的反应。 |
| 3 | potentiate the impact | `academic` | This study explores how various factors can potentiate the impact of climate change. | 本研究探讨了各种因素如何增强气候变化的影响。 |

### 69. amulet  *n.*

| | |
| --- | --- |
| 音标 | /ˈæmjʊlɪt/ |
| 中文释义 | 护身符 |
| 英文释义 | A small object believed to bring good luck or protection. |
| freq_rank | 18661 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | protective amulet | `culture` | Many cultures have their own versions of protective amulets that are worn for safety. | 许多文化都有自己版本的护身符，佩戴以保护自身。 |
| 2 | amulet worn | `daily_life` | She often wears an amulet worn by her grandmother for spiritual guidance. | 她常常佩戴祖母所戴的护身符，以获得精神上的指引。 |
| 3 | amulets for luck | `education` | Students in various cultures believe in amulets for luck during exams and important events. | 各文化的学生相信，护身符能为考试和重要事件带来好运。 |

### 70. epitomize  *v.*

| | |
| --- | --- |
| 音标 | /ɪˈpɪtəmaɪz/ |
| 中文释义 | 典范；象征 |
| 英文释义 | To be a perfect example of something. |
| freq_rank | 12479 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | epitomize excellence | `academic` | Many scholars believe that this research epitomizes excellence in the field. | 许多学者认为这项研究体现了该领域的卓越。 |
| 2 | epitomizes a trend | `news` | The latest data epitomizes a trend towards sustainable energy solutions. | 最新数据显示，体现了可持续能源解决方案的趋势。 |
| 3 | epitomize the spirit | `culture` | This artwork beautifully epitomizes the spirit of the Renaissance. | 这幅艺术作品完美地体现了文艺复兴的精神。 |

### 71. votary  *n.*

| | |
| --- | --- |
| 音标 | /ˈvoʊ.tər.i/ |
| 中文释义 | 信徒；崇拜者 |
| 英文释义 | A devoted follower or admirer, especially in a religious context. |
| freq_rank | 41179 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | votary of science | `science_tech` | Many votaries of science advocate for greater public understanding of scientific principles. | 许多科学信徒提倡公众更好地理解科学原理。 |
| 2 | votaries of art | `culture` | Artists often find inspiration among votaries of art who appreciate their work. | 艺术家们常常在欣赏他们作品的艺术信徒中寻求灵感。 |
| 3 | votary of philosophy | `academic` | He considers himself a votary of philosophy, constantly seeking deeper truths. | 他自认为是哲学的信徒，不断追求更深的真理。 |

### 72. gestate  *v.*

| | |
| --- | --- |
| 音标 | /ˈdʒɛs.teɪt/ |
| 中文释义 | 孕育 |
| 英文释义 | To develop or grow within a protective environment. |
| freq_rank | 34904 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | gestate a concept | `academic` | Researchers often gestate a concept over several years before publication. | 研究人员常常在发表前花费数年孕育一个概念。 |
| 2 | gestate new ideas | `work` | Teams need time to gestate new ideas that can improve productivity. | 团队需要时间孕育新想法，以提高生产力。 |
| 3 | gestate a plan | `daily_life` | He decided to gestate a plan for his vacation during the winter months. | 他决定在冬季期间孕育一个假期计划。 |

### 73. bog  *n./v.*

| | |
| --- | --- |
| 音标 | /bɔɡ/ |
| 中文释义 | 沼泽；泥潭 |
| 英文释义 | A wetland area that is spongy and muddy. |
| freq_rank | 11278 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | bog vegetation | `environment` | Many species thrive in areas with diverse bog vegetation and moisture. | 许多物种在多样的沼泽植被和湿润的区域中繁荣。 |
| 2 | bog down | `work` | The project began to bog down due to unforeseen complications and delays. | 由于不可预见的复杂情况和延误，项目开始陷入困境。 |
| 3 | peat bog | `science_tech` | Researchers are studying the carbon capture capabilities of peat bog ecosystems. | 研究人员正在研究泥炭沼泽生态系统的碳捕获能力。 |

### 74. remunerative  *adj.*

| | |
| --- | --- |
| 音标 | /rɪˈmjunəˌrətɪv/ |
| 中文释义 | 有利可图的 |
| 英文释义 | Providing a profit or financial gain. |
| freq_rank | 37629 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | remunerative work | `work` | Many professionals pursue remunerative work to secure their financial future. | 许多专业人士追求有利可图的工作以确保他们的经济未来。 |
| 2 | remunerative activities | `daily_life` | Engaging in remunerative activities can enhance one's quality of life significantly. | 参与有利可图的活动可以显著提高一个人的生活质量。 |
| 3 | remunerative projects | `academic` | Researchers are often funded for their remunerative projects to encourage scientific advancement. | 研究人员通常会获得资助以促进他们的有利可图的项目，鼓励科学进步。 |

### 75. tremulous  *adj.*

| | |
| --- | --- |
| 音标 | /ˈtrɛm.jə.ləs/ |
| 中文释义 | 颤抖的；不安的 |
| 英文释义 | Characterized by trembling or shaking, often due to emotion. |
| freq_rank | 24494 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | tremulous voice | `daily_life` | Her tremulous voice revealed the fear she tried to conceal. | 她颤抖的声音暴露了她试图掩饰的恐惧。 |
| 2 | tremulous excitement | `culture` | The audience felt a tremulous excitement before the performance began. | 演出开始前，观众感到一阵颤抖的兴奋。 |
| 3 | tremulous laughter | `work` | His tremulous laughter suggested that he was not entirely at ease. | 他颤抖的笑声表明他并不完全放松。 |

### 76. ingress  *n.*

| | |
| --- | --- |
| 音标 | /ˈɪn.ɡrɛs/ |
| 中文释义 | 进入；通道 |
| 英文释义 | The act of entering a place or the entrance itself. |
| freq_rank | 34813 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | ingress points | `academic` | Researchers identified multiple ingress points to enhance security measures. | 研究人员确定了多个进入点以增强安全措施。 |
| 2 | ingress traffic | `science_tech` | Network engineers monitored ingress traffic to prevent potential overloads. | 网络工程师监控进入流量以防止潜在的过载。 |
| 3 | ingress pathways | `health` | Studying ingress pathways can help understand how pollutants affect health. | 研究进入途径可以帮助了解污染物如何影响健康。 |

### 77. commensurate  *adj.*

| | |
| --- | --- |
| 音标 | /kəˈmɛn.sər.ət/ |
| 中文释义 | 相应的；成比例的 |
| 英文释义 | Corresponding in size, degree, or extent; proportionate. |
| freq_rank | 16742 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | commensurate compensation | `work` | Employees expect commensurate compensation for their increased workload during the project. | 员工期待与他们在项目中增加的工作量相应的补偿。 |
| 2 | commensurate with responsibilities | `academic` | Academic rigor should be commensurate with the responsibilities assigned to students. | 学术严格程度应与分配给学生的责任相应。 |
| 3 | not commensurate | `news` | Many believe the funding provided is not commensurate with the project's scale. | 许多人认为，提供的资金与项目的规模不成比例。 |

### 78. patrimony  *n.*

| | |
| --- | --- |
| 音标 | /ˈpæt.rɪ.mə.ni/ |
| 中文释义 | 遗产 |
| 英文释义 | Property inherited from ancestors or family heritage. |
| freq_rank | 22150 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | cultural patrimony | `culture` | Many countries strive to protect their cultural patrimony from destruction and neglect. | 许多国家努力保护其文化遗产，避免被破坏和忽视。 |
| 2 | patrimony law | `work` | Lawyers often debate the implications of patrimony law in family estate cases. | 律师们经常讨论遗产法在家庭财产案件中的影响。 |
| 3 | patrimony tax | `news` | The government has proposed changes to the patrimony tax to enhance revenue. | 政府提出对遗产税进行更改，以增加收入。 |

### 79. multifarious  *adj.*

| | |
| --- | --- |
| 音标 | /ˌmʌl.tɪˈfɛə.ri.əs/ |
| 中文释义 | 多样的；多种的 |
| 英文释义 | Having many different parts, elements, or forms. |
| freq_rank | 29977 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | multifarious interests | `daily_life` | People often have multifarious interests that enrich their experiences and knowledge. | 人们通常有多样的兴趣，丰富他们的经历和知识。 |
| 2 | multifarious applications | `science_tech` | Researchers are exploring the multifarious applications of nanotechnology in various fields. | 研究人员正在探索纳米技术在各个领域的多种应用。 |
| 3 | multifarious perspectives | `education` | Students benefit from discussing multifarious perspectives during class debates. | 学生在课堂辩论中讨论多样的观点，对他们有益。 |

### 80. gully  *n.*

| | |
| --- | --- |
| 音标 | /ˈɡʌli/ |
| 中文释义 | 沟渠 |
| 英文释义 | A deep, narrow channel cut by running water. |
| freq_rank | 13639 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | drainage gully | `environment` | The construction project included a drainage gully to prevent flooding. | 该建筑项目包括一个排水沟渠以防止洪水。 |
| 2 | erosion gully | `science_tech` | Researchers studied the impact of rainfall on the formation of erosion gullies. | 研究人员研究了降雨对侵蚀沟渠形成的影响。 |
| 3 | gully system | `academic` | A comprehensive analysis of the gully system was conducted in the region. | 对该地区的沟渠系统进行了全面分析。 |

### 81. somatic  *adj.*

| | |
| --- | --- |
| 音标 | /səˈmæ.tɪk/ |
| 中文释义 | 躯体的 |
| 英文释义 | Relating to the body, especially as distinct from the mind. |
| freq_rank | 14487 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | somatic symptoms | `health` | Patients often report somatic symptoms that can complicate diagnosis. | 患者常常报告躯体症状，这可能使诊断变得复杂。 |
| 2 | somatic therapies | `science_tech` | Many practitioners now incorporate somatic therapies into their treatment plans. | 许多从业者现在将躯体疗法纳入他们的治疗计划中。 |
| 3 | somatic experiences | `culture` | Cultural practices can influence individuals' somatic experiences and bodily perceptions. | 文化实践可以影响个体的躯体体验和身体感知。 |

### 82. revulsion  *n.*

| | |
| --- | --- |
| 音标 | /rɪˈvʌl.ʃən/ |
| 中文释义 | 厌恶 |
| 英文释义 | A strong feeling of disgust or repulsion. |
| freq_rank | 15759 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | sense of revulsion | `daily_life` | Many people felt a sense of revulsion when they saw the news report. | 看到新闻报道后，许多人感到厌恶。 |
| 2 | revulsion against | `culture` | There is a growing revulsion against violence in popular media today. | 今天，越来越多人对流行媒体中的暴力感到厌恶。 |
| 3 | revulsion for | `academic` | The research revealed a revulsion for unethical practices among participants. | 研究显示参与者对不道德行为的厌恶。 |

### 83. sere  *adj./n.*

| | |
| --- | --- |
| 音标 | /sɪr/ |
| 中文释义 | 枯萎的；干枯的 |
| 英文释义 | Dry and withered, lacking vitality or freshness. |
| freq_rank | 34987 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | sere landscape | `environment` | The sere landscape appeared desolate after the prolonged drought. | 经历长时间干旱后，干枯的景观显得荒凉。 |
| 2 | sere foliage | `science_tech` | As autumn approaches, the trees shed their sere foliage. | 随着秋天的到来，树木落下干枯的叶子。 |
| 3 | sere conditions | `daily_life` | Farmers struggled to adapt to the sere conditions caused by climate change. | 农民们努力适应气候变化带来的干燥条件。 |

### 84. immunize  *v.*

| | |
| --- | --- |
| 音标 | /ɪˈmjun.aɪz/ |
| 中文释义 | 免疫；使免疫 |
| 英文释义 | To protect against disease by introducing a vaccine. |
| freq_rank | 18368 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | immunize children | `daily_life` | Healthcare professionals strongly recommend to immunize children from common diseases. | 医疗专业人士强烈建议为儿童接种疫苗以预防常见疾病。 |
| 2 | immunize against infection | `health` | Vaccines can effectively immunize individuals against various infections and viruses. | 疫苗可以有效使个体免疫各种感染和病毒。 |
| 3 | immunize the population | `science_tech` | Research indicates that we need to immunize the population to prevent outbreaks. | 研究表明，我们需要使整个群体免疫以预防疫情爆发。 |

### 85. serfdom  *n.*

| | |
| --- | --- |
| 音标 | /ˈsɜrfdəm/ |
| 中文释义 | 农奴制 |
| 英文释义 | The status of peasants under feudalism, bound to their lord's land. |
| freq_rank | 31985 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | abolition of serfdom | `academic` | Many scholars study the abolition of serfdom in Eastern Europe during the 19th century. | 许多学者研究19世纪东欧农奴制的废除。 |
| 2 | legacy of serfdom | `culture` | The legacy of serfdom still influences social structures in some regions today. | 农奴制的遗留影响至今仍在某些地区影响社会结构。 |
| 3 | serfdom practices | `news` | Reports highlight the resurgence of serfdom practices in certain rural communities around the world. | 报道称，世界某些农村社区农奴制实践有所复苏。 |

### 86. sermonize  *v.*

| | |
| --- | --- |
| 音标 | /ˈsɜː.mə.naɪz/ |
| 中文释义 | 讲道；说教 |
| 英文释义 | To deliver a sermon or preach, often in a moralizing way. |
| freq_rank | 38275 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | sermonize on morality | `education` | Educators often sermonize on morality to instill ethical values in students. | 教育者常常讲道关于道德，以便培养学生的伦理价值观。 |
| 2 | sermonize about politics | `news` | Politicians frequently sermonize about politics during campaign speeches to persuade voters. | 政治家在竞选演讲中常常讲道关于政治，以说服选民。 |
| 3 | sermonize during meetings | `work` | Managers tend to sermonize during meetings, emphasizing the importance of teamwork. | 经理在会议中往往讲道，强调团队合作的重要性。 |

### 87. pullulate  *v.*

| | |
| --- | --- |
| 音标 | /ˈpʌl.jə.leɪt/ |
| 中文释义 | 滋生；繁殖 |
| 英文释义 | To breed or multiply in great numbers. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | pullulate in the wild | `environment` | Biodiversity can thrive when species pullulate in the wild under optimal conditions. | 在最佳环境下，物种在野外滋生时，生物多样性可以繁荣。 |
| 2 | pullulate with life | `science_tech` | The research site was found to pullulate with life, revealing numerous undiscovered species. | 研究地点被发现生机勃勃，揭示了许多未被发现的物种。 |
| 3 | pullulate rapidly | `news` | Experts warn that invasive species can pullulate rapidly and disrupt local ecosystems. | 专家警告说，入侵物种可能快速滋生，扰乱当地生态系统。 |

### 88. unicorn  *n.*

| | |
| --- | --- |
| 音标 | /ˈjuː.nɪ.kɔːrn/ |
| 中文释义 | 独角兽 |
| 英文释义 | A mythical creature resembling a horse with a single horn. |
| freq_rank | 17309 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | mythical unicorn | `culture` | Legends of the mythical unicorn have fascinated cultures for centuries. | 关于独角兽的传说让各个文化都着迷了几个世纪。 |
| 2 | unicorn startup | `work` | Investors flock to support innovative unicorn startups that disrupt traditional markets. | 投资者纷纷支持颠覆传统市场的创新独角兽创业公司。 |
| 3 | unicorn sighting | `science_tech` | The recent unicorn sighting sparked debates about its existence among scientists. | 最近的独角兽目击事件引发了科学家们对其存在的辩论。 |

### 89. unremitting  *adj.*

| | |
| --- | --- |
| 音标 | /ʌn.rɪˈmɪt.ɪŋ/ |
| 中文释义 | 不停的；不懈的 |
| 英文释义 | Continuing without interruption; persistent and relentless in nature. |
| freq_rank | 25055 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | unremitting effort | `work` | She has shown unremitting effort in her project, achieving remarkable results. | 她在项目中表现出了不懈的努力，取得了显著的成果。 |
| 2 | unremitting pressure | `health` | Unremitting pressure can lead to severe mental health issues over time. | 不停的压力可能导致长期严重的心理健康问题。 |
| 3 | unremitting pace | `education` | Maintaining an unremitting pace in studies can be exhausting for students. | 在学习中保持不停的节奏对学生来说可能非常疲惫。 |

### 90. omelet  *n.*

| | |
| --- | --- |
| 音标 | /ˈɑː.mə.lɛt/ |
| 中文释义 | 煎蛋卷 |
| 英文释义 | A dish made from beaten eggs cooked until set. |
| freq_rank | 15101 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | vegetable omelets | `daily_life` | Many people enjoy adding fresh vegetables to their omelets for extra flavor. | 许多人喜欢在煎蛋卷中加入新鲜蔬菜以增加风味。 |
| 2 | cheese omelet | `work` | During meetings, a cheese omelet is often preferred as a quick breakfast option. | 在会议期间，奶酪煎蛋卷通常被认为是快速的早餐选择。 |
| 3 | fluffy omelet | `culture` | Culinary experts recommend techniques for creating a fluffy omelet that delights the palate. | 烹饪专家推荐制作松软煎蛋卷的技巧，以取悦味蕾。 |

### 91. crabbed  *adj.*

| | |
| --- | --- |
| 音标 | /ˈkræbd/ |
| 中文释义 | 狭隘的；乖戾的 |
| 英文释义 | Characterized by a narrow-minded or ill-tempered disposition. |
| freq_rank | 37302 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | crabbed nature | `daily_life` | Others often avoid engaging with her due to her crabbed nature. | 由于她性情乖戾，别人常常避免与她交往。 |
| 2 | crabbed writing | `academic` | His thesis was criticized for its crabbed writing style and lack of clarity. | 他的论文因文笔狭隘、缺乏清晰度而受到批评。 |
| 3 | crabbed view | `culture` | Many people were surprised by his crabbed view on modern art exhibitions. | 许多人对他对现代艺术展的狭隘看法感到惊讶。 |

### 92. careworn  *adj.*

| | |
| --- | --- |
| 音标 | /ˈkɛr.wɔrn/ |
| 中文释义 | 疲惫不堪的；愁苦的 |
| 英文释义 | Worn down by worry, stress, or hardship. |
| freq_rank | 37289 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | careworn expression | `daily_life` | Her careworn expression revealed the struggles she had been facing lately. | 她疲惫不堪的神情显示了她最近所面临的挣扎。 |
| 2 | careworn features | `work` | Many employees showed careworn features after working long hours without breaks. | 许多员工在长时间不休息工作后，面露疲惫的神情。 |
| 3 | careworn appearance | `news` | The politician's careworn appearance suggested the toll of the recent campaign. | 这位政治家的疲惫外表暗示了最近竞选活动带来的压力。 |

### 93. sybaritic  *adj.*

| | |
| --- | --- |
| 音标 | /ˌsɪb.əˈrɪt.ɪk/ |
| 中文释义 | 奢华的；享乐的 |
| 英文释义 | Relating to a life of luxury and indulgence. |
| freq_rank | 34474 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | sybaritic lifestyle | `culture` | Many celebrities are known for their sybaritic lifestyles filled with lavish parties. | 许多名人以奢华聚会的奢侈生活方式而闻名。 |
| 2 | sybaritic pleasures | `daily_life` | People often seek sybaritic pleasures to escape their mundane routines. | 人们常常追求奢华的快乐，以逃避单调的日常生活。 |
| 3 | sybaritic tastes | `travel` | Travelers with sybaritic tastes might prefer luxurious resorts over budget accommodations. | 有奢华品味的旅行者可能更喜欢豪华度假村，而非经济型住宿。 |

### 94. amalgam  *n.*

| | |
| --- | --- |
| 音标 | /əˈmæl.gəm/ |
| 中文释义 | 混合物；合成物 |
| 英文释义 | A mixture or combination of different elements. |
| freq_rank | 17090 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | amalgam of cultures | `culture` | Different traditions create an amalgam of cultures in the city. | 不同的传统在这座城市中形成了文化的混合。 |
| 2 | amalgam of ideas | `academic` | The research presents an amalgam of ideas from various disciplines. | 这项研究展示了来自各个学科的思想的混合。 |
| 3 | amalgam of technologies | `science_tech` | This product is an amalgam of technologies that enhances performance. | 该产品是多项技术的结合，提升了性能。 |

### 95. resourceful  *adj.*

| | |
| --- | --- |
| 音标 | /rɪˈsɔrs.fəl/ |
| 中文释义 | 足智多谋的 |
| 英文释义 | Able to deal effectively with difficult situations. |
| freq_rank | 14594 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | resourceful leaders | `work` | Effective and resourceful leaders are essential for guiding teams through challenges. | 有效且足智多谋的领导者对于引导团队应对挑战至关重要。 |
| 2 | resourceful solutions | `daily_life` | Finding resourceful solutions to everyday problems can improve our quality of life. | 找到足智多谋的解决方案来应对日常问题可以提高我们的生活质量。 |
| 3 | resourceful individuals | `education` | Many resourceful individuals excel in their studies despite facing various obstacles. | 许多足智多谋的个人尽管面临各种障碍，仍然在学习中表现出色。 |

### 96. tare  *n./v.*

| | |
| --- | --- |
| 音标 | /tɛr/ |
| 中文释义 | 皮重 |
| 英文释义 | Weight of a container without the contents. |
| freq_rank | 40934 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | tare weight | `work` | The tare weight of the container must be recorded before use. | 在使用之前，必须记录容器的皮重。 |
| 2 | tare compensation | `academic` | Researchers often calculate tare compensation to ensure accurate measurements. | 研究人员通常计算皮重补偿以确保测量准确。 |
| 3 | tare out | `science_tech` | To tare out the scale, press the button before placing the item. | 在放置物品之前，按下按钮以清零称重。 |

### 97. presenter  *n.*

| | |
| --- | --- |
| 音标 | /prɪˈzɛn.tər/ |
| 中文释义 | 演讲者；主持人 |
| 英文释义 | A person who presents information or ideas to an audience. |
| freq_rank | 15106 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | news presenter | `news` | News presenters often deliver stories with clarity and professionalism. | 新闻主持人通常以清晰和专业的方式传递新闻。 |
| 2 | conference presenter | `academic` | During the conference, several presenters showcased their latest research findings. | 在会议期间，几位演讲者展示了他们最新的研究成果。 |
| 3 | webinar presenter | `work` | Training programs might include a webinar presenter to facilitate online learning. | 培训项目可能会包括一位网络研讨会主持人来促进在线学习。 |

### 98. lexicographer  *n.*

| | |
| --- | --- |
| 音标 | /ˌlɛksɪˈkræfər/ |
| 中文释义 | 词典编纂者 |
| 英文释义 | A person who compiles dictionaries or lexicons. |
| freq_rank | 39731 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | lexicographer's work | `academic` | Many students admire the lexicographer's work on language evolution. | 许多学生钦佩这位词典编纂者在语言演变方面的工作。 |
| 2 | famous lexicographers | `culture` | Some famous lexicographers have profoundly influenced the English language. | 一些著名的词典编纂者对英语产生了深远的影响。 |
| 3 | lexicographer's research | `science_tech` | The lexicographer's research revealed fascinating insights into word usage trends. | 这位词典编纂者的研究揭示了词语使用趋势的迷人见解。 |

### 99. nostrum  *n.*

| | |
| --- | --- |
| 音标 | /ˈnɒs.trəm/ |
| 中文释义 | 万灵药 |
| 英文释义 | A remedy for all diseases or problems, especially ineffective ones. |
| freq_rank | 32333 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | nostrum for success | `work` | Many entrepreneurs believe that a specific business strategy is a nostrum for success. | 许多企业家相信某种特定的商业策略是成功的万灵药。 |
| 2 | nostrum in medicine | `health` | Critics argue that the proposed nostrum in medicine lacks sufficient scientific evidence. | 批评人士认为，所提议的医学万灵药缺乏足够的科学依据。 |
| 3 | nostrum solutions | `education` | Educators should be wary of nostrum solutions that promise rapid improvements in student performance. | 教育工作者应对那些承诺迅速改善学生表现的万灵药解决方案保持警惕。 |

### 100. grouse  *n./v.*

| | |
| --- | --- |
| 音标 | /ɡraʊs/ |
| 中文释义 | 抱怨；发牢骚 |
| 英文释义 | To complain or express dissatisfaction about something. |
| freq_rank | 14640 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | grouse about | `daily_life` | Most people tend to grouse about the traffic during rush hour. | 大多数人往往抱怨高峰时段的交通。 |
| 2 | grouse over | `news` | Citizens began to grouse over rising prices of essential goods. | 市民开始抱怨生活必需品的价格上涨。 |
| 3 | grouse at | `work` | Employees often grouse at the lack of recognition for their hard work. | 员工们常常抱怨对他们辛勤工作的缺乏认可。 |
