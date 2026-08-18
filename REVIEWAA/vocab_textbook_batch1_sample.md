# 托福词汇内容 batch1 · 送审样本

> 抽 16 词(种子固定 20260803,复跑抽到同样这批)。
> **不是纯随机** —— 贪心挑成尽量铺开 scene 与词性,免得 16 个全是名词、场景全挤在 news。
> 本批覆盖 **10/10 个 scene**、**9 种词性**(词性缺失 / a / n / adv / vt / vi / v / prep / int)。
> (`词性缺失` = ECDICT 的 translation 里没有词性前缀,全库 53 个词属于这种,`pos` 为空。)
> 全量 991 词见 `scripts/vocab/data/generated/textbook-content.json`。

## 全量 991 词的分布(不只是抽样这 16 个)

难度档:A2 432 · B1 324 · B2 235

场景(共 2973 条例句):academic 173 · news 215 · daily_life 786 · work 537 · science_tech 167 · health 128 · environment 102 · education 389 · travel 136 · culture 340

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

### 1. sign up  

| | |
| --- | --- |
| 音标 | /saɪn ʌp/ |
| 中文释义 | 注册 |
| 英文释义 | To enroll or join a service or organization. |
| freq_rank | — |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | sign up for a course | `education` | Students can sign up for a course online. | 学生可以在网上注册课程。 |
| 2 | sign up for updates | `news` | You should sign up for updates on the website. | 你应该在网站上注册获取更新。 |
| 3 | sign up to volunteer | `daily_life` | Many people want to sign up to volunteer at the event. | 许多人想在活动中注册志愿者。 |

### 2. manned  *a*

| | |
| --- | --- |
| 音标 | /mænd/ |
| 中文释义 | 有人操控的 |
| 英文释义 | Operated by human personnel rather than automatically or remotely. |
| freq_rank | — |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | manned mission | `science_tech` | Astronauts completed the manned mission to Mars successfully this year. | 宇航员今年成功完成了前往火星的载人任务。 |
| 2 | manned aircraft | `work` | The company has developed new manned aircraft for commercial purposes. | 该公司开发了新的载人飞机用于商业用途。 |
| 3 | manned observation post | `academic` | Researchers established a manned observation post in the remote area for studies. | 研究人员在偏远地区建立了一个有人值守的观察站进行研究。 |

### 3. fast food  *n*

| | |
| --- | --- |
| 音标 | /fæst fuːd/ |
| 中文释义 | 快餐 |
| 英文释义 | Food that is prepared and served quickly. |
| freq_rank | — |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | eat fast food | `daily_life` | Many people choose to eat fast food for lunch. | 很多人选择吃快餐作为午餐。 |
| 2 | fast food restaurants | `culture` | Fast food restaurants are popular among young people. | 快餐店在年轻人中很受欢迎。 |
| 3 | fast food options | `health` | There are many fast food options that are unhealthy. | 有很多不健康的快餐选择。 |

### 4. what about  *adv*

| | |
| --- | --- |
| 音标 | /wɒt əˈbaʊt/ |
| 中文释义 | ……怎么样；……呢 |
| 英文释义 | Used to ask for an opinion about something, or to suggest an idea. |
| freq_rank | — |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | what about meeting | `daily_life` | What about meeting at the library after class today? | 今天下课后在图书馆见面怎么样？ |
| 2 | so what about | `work` | So what about the report your team promised us? | 那你们组答应给我们的报告呢？ |
| 3 | and what about | `environment` | And what about the animals that lose their homes? | 那些失去家园的动物又怎么办呢？ |

### 5. symbolise  *vt*

| | |
| --- | --- |
| 音标 | /ˈsɪm.bə.laɪz/ |
| 中文释义 | 象征；象徵 |
| 英文释义 | To represent or stand for something in a meaningful way. |
| freq_rank | — |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | symbolise change | `culture` | The colors in the painting symbolise change and the passage of time. | 画作中的颜色象征着变化与时间的流逝。 |
| 2 | symbolise hope | `daily_life` | These flowers symbolise hope for a better future after difficult times. | 这些花象征着在艰难时期后美好未来的希望。 |
| 3 | symbolise freedom | `education` | Many statues in the city symbolise freedom and the fight for human rights. | 城市中的许多雕像象征着自由与人权斗争。 |

### 6. ice-skate  *vi*

| | |
| --- | --- |
| 音标 | /ˈaɪs.keɪt/ |
| 中文释义 | 滑冰 |
| 英文释义 | To move on ice using skates with blades on the bottom. |
| freq_rank | — |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | ice-skate outdoors | `daily_life` | We often ice-skate outdoors during the winter months. | 我们在冬天的几个月里常常在户外滑冰。 |
| 2 | ice-skate well | `education` | She practices regularly to ice-skate well for her competition. | 为了比赛，她定期练习以便滑冰滑得好。 |
| 3 | ice-skate with friends | `culture` | Many people love to ice-skate with friends at the rink. | 许多人喜欢在溜冰场和朋友一起滑冰。 |

### 7. overwhelmed  *v*

| | |
| --- | --- |
| 音标 | /ˌoʊ.vərˈhwɛlmd/ |
| 中文释义 | 不堪重负 |
| 英文释义 | Affected deeply in a way that is hard to manage. |
| freq_rank | — |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | overwhelmed with stress | `work` | Many employees feel overwhelmed with stress during busy seasons. | 许多员工在繁忙的时节感到不堪重负。 |
| 2 | overwhelmed by emotions | `daily_life` | She was overwhelmed by emotions during the surprise party. | 在惊喜派对上，她被情感所淹没。 |
| 3 | overwhelmed by information | `education` | Students often feel overwhelmed by information from various subjects. | 学生们常常感到来自各个学科的信息令人不堪重负。 |

### 8. re  *prep/n*

| | |
| --- | --- |
| 音标 | /riː/ |
| 中文释义 | 关于；重新 |
| 英文释义 | Concerning or in relation to something; again. |
| freq_rank | — |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | re the project | `work` | We need to discuss the updates re the project very soon. | 我们需要尽快讨论关于这个项目的更新。 |
| 2 | re your request | `daily_life` | Please send me more information re your request at your earliest convenience. | 请尽快向我发送关于您请求的更多信息。 |
| 3 | re the findings | `science_tech` | Researchers published a paper re the findings of their latest study. | 研究人员发表了一篇关于他们最新研究结果的论文。 |

### 9. merci  *int*

| | |
| --- | --- |
| 音标 | /mɛrˈsi/ |
| 中文释义 | 谢谢 |
| 英文释义 | A polite expression of gratitude or appreciation. |
| freq_rank | — |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | merci beaucoup | `daily_life` | I just wanted to say merci beaucoup for your help yesterday. | 我只是想说，非常感谢你昨天的帮助。 |
| 2 | un grand merci | `culture` | At the end of the event, we gave un grand merci to all participants. | 在活动结束时，我们对所有参与者表示衷心的感谢。 |
| 3 | merci d'avance | `work` | Please confirm your attendance, merci d'avance for your cooperation. | 请确认你的出席，提前谢谢你的配合。 |

### 10. stonehenge  

| | |
| --- | --- |
| 音标 | /ˈstoʊnˌhɛndʒ/ |
| 中文释义 | 史前巨石建筑 |
| 英文释义 | A prehistoric monument of standing stones in England. |
| freq_rank | — |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | visit stonehenge | `travel` | Many tourists visit Stonehenge every year during the summer. | 每年夏天，许多游客都会参观史前巨石建筑。 |
| 2 | study stonehenge | `academic` | Students study Stonehenge to understand ancient cultures and engineering techniques. | 学生研究史前巨石建筑，以了解古代文化和工程技术。 |
| 3 | explore stonehenge | `culture` | Historians often explore Stonehenge for its mysteries and historical significance. | 历史学家常常探索史前巨石建筑，以研究其神秘和历史重要性。 |

### 11. american  *n/a*

| | |
| --- | --- |
| 音标 | /əˈmɛr.ɪ.kən/ |
| 中文释义 | 美国人；美国的 |
| 英文释义 | Relating to the United States or its inhabitants. |
| freq_rank | — |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | american culture | `culture` | American culture has greatly influenced many parts of the world. | 美国文化对世界许多地方产生了重大影响。 |
| 2 | american dream | `daily_life` | Many people chase the American dream of success and happiness. | 许多人追求美国梦，渴望成功和幸福。 |
| 3 | american history | `education` | Students study American history to understand the nation's past. | 学生学习美国历史，以了解国家的过去。 |

### 12. confused  *a*

| | |
| --- | --- |
| 音标 | /kənˈfjuːzd/ |
| 中文释义 | 困惑的 |
| 英文释义 | Unable to think clearly; bewildered or perplexed. |
| freq_rank | — |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | confused students | `education` | Many students were confused about the new grading system. | 许多学生对新的评分系统感到困惑。 |
| 2 | confused look | `daily_life` | She had a confused look on her face during the conversation. | 在谈话中，她面露困惑的神情。 |
| 3 | confused messages | `work` | The email contained confused messages that made the instructions unclear. | 电子邮件包含了让人困惑的信息，使指示不明确。 |

### 13. russian  *n/a*

| | |
| --- | --- |
| 音标 | /ˈrʌʃ.ən/ |
| 中文释义 | 俄罗斯的；俄国的 |
| 英文释义 | Relating to Russia or its people. |
| freq_rank | — |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | russian culture | `culture` | Many people are fascinated by Russian culture and history. | 许多人对俄罗斯文化和历史充满兴趣。 |
| 2 | russian language | `education` | She is learning the Russian language to communicate better. | 她正在学习俄语，以便更好地交流。 |
| 3 | russian army | `news` | The Russian army has conducted military exercises recently. | 俄罗斯军队最近进行了军事演习。 |

### 14. get along  

| | |
| --- | --- |
| 音标 | /ɡɛt əˈlɔŋ/ |
| 中文释义 | 相处融洽；相互理解 |
| 英文释义 | To have a friendly relationship with someone. |
| freq_rank | — |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | get along with my classmates | `academic` | I usually get along with my classmates very well. | 我通常和我的同学相处得很好。 |
| 2 | get along well | `work` | They get along well in their new job together. | 他们在新工作中相处得很好。 |
| 3 | get along like friends | `daily_life` | Children get along like friends during playtime. | 孩子们在游戏时间像朋友一样相处。 |

### 15. jump rope  *n*

| | |
| --- | --- |
| 音标 | /dʒʌmp roʊp/ |
| 中文释义 | 跳绳 |
| 英文释义 | To skip while turning a rope over one's head and under the feet. |
| freq_rank | — |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | play jump rope | `daily_life` | Children often play jump rope during recess. | 孩子们在课间常常跳绳。 |
| 2 | learn to jump rope | `education` | I want to learn to jump rope this summer. | 我想在这个夏天学会跳绳。 |
| 3 | practice jump rope | `health` | They practice jump rope for exercise every morning. | 他们每天早晨跳绳锻炼。 |

### 16. get up  

| | |
| --- | --- |
| 音标 | /ɡɛt ʌp/ |
| 中文释义 | 起床 |
| 英文释义 | To rise from bed or a seated position. |
| freq_rank | — |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | get up early | `daily_life` | Many people like to get up early in the morning. | 许多人喜欢在早上起床。 |
| 2 | get up on time | `work` | You should get up on time for your job. | 你应该按时起床去上班。 |
| 3 | get up quickly | `education` | Students must get up quickly for the next class. | 学生们必须快速起床去上下一节课。 |
