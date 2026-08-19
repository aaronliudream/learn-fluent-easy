# 托福词汇内容 batch1 · 送审样本

> 抽 16 词(种子固定 20260803,复跑抽到同样这批)。
> **不是纯随机** —— 贪心挑成尽量铺开 scene 与词性,免得 16 个全是名词、场景全挤在 news。
> 本批覆盖 **10/10 个 scene**、**1 种词性**(词性缺失)。
> (`词性缺失` = ECDICT 的 translation 里没有词性前缀,全库 53 个词属于这种,`pos` 为空。)
> 全量 55 词见 `scripts/vocab/data/generated/textbookslots-content.json`。

## 全量 55 词的分布(不只是抽样这 16 个)

难度档:A2 50 · B1 5

场景(共 165 条例句):academic 8 · news 5 · daily_life 45 · work 42 · science_tech 7 · health 7 · environment 4 · education 32 · travel 7 · culture 8

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

### 1. be friends with sb.  

| | |
| --- | --- |
| 音标 | /biː frɛndz wɪð/ |
| 中文释义 | 交朋友；与某人做朋友 |
| 英文释义 | To have a friendly relationship with someone. |
| freq_rank | — |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | be friends with my classmates | `academic` | I want to be friends with my classmates this year. | 我想和我的同学交朋友，今年。 |
| 2 | be friends with your neighbors | `daily_life` | They are happy to be friends with your neighbors now. | 他们现在很高兴能和你的邻居交朋友。 |
| 3 | be friends with her colleagues | `work` | He decided to be friends with her colleagues at the office. | 他决定和办公室里的同事交朋友。 |

### 2. show interest in sth  

| | |
| --- | --- |
| 音标 | /ʃoʊ ˈɪn.trəst ɪn ˈsʌm.θɪŋ/ |
| 中文释义 | 对某事表现出兴趣 |
| 英文释义 | To express curiosity or concern about something. |
| freq_rank | — |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | show interest in science | `education` | Students often show interest in science projects during class. | 学生们在课堂上经常对科学项目表现出兴趣。 |
| 2 | show interest in culture | `culture` | Many people show interest in culture through festivals and events. | 许多人通过节日和活动对文化表现出兴趣。 |
| 3 | show interest in health | `health` | Parents should show interest in their children's health habits. | 父母应该对孩子的健康习惯表现出兴趣。 |

### 3. unlock the secrets of sth  

| | |
| --- | --- |
| 音标 | /ʌnˈlɒk ðə ˈsiː.krɪts ʌv/ |
| 中文释义 | 揭示某事的秘密 |
| 英文释义 | To reveal hidden or unknown information about something. |
| freq_rank | — |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | unlock the secrets of science | `science_tech` | Scientists unlock the secrets of science every day. | 科学家每天揭示科学的秘密。 |
| 2 | unlock the secrets of history | `academic` | Researchers unlock the secrets of history through careful study. | 研究人员通过细致的研究揭示历史的秘密。 |
| 3 | unlock the secrets of nature | `environment` | We must unlock the secrets of nature to protect our planet. | 我们必须揭示自然的秘密以保护我们的星球。 |

### 4. be hard on sb.  

| | |
| --- | --- |
| 音标 | /bi hɑrd ɑn/ |
| 中文释义 | 对某人严格；对某人苛刻 |
| 英文释义 | To treat someone harshly or with strictness. |
| freq_rank | — |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | Teachers should not be hard on students who struggle. | `education` | Teachers should not be hard on students who struggle. | 老师不应该对有困难的学生苛刻。 |
| 2 | Parents often worry they might be hard on their children. | `daily_life` | Parents often worry they might be hard on their children. | 父母常常担心自己对孩子太严格。 |
| 3 | Reporters can be hard on politicians during interviews. | `news` | Reporters can be hard on politicians during interviews. | 记者在采访时可能对政治家很苛刻。 |

### 5. help sb with  

| | |
| --- | --- |
| 音标 | /hɛlp sɪb wɪð/ |
| 中文释义 | 帮助某人做某事 |
| 英文释义 | To assist someone in doing something. |
| freq_rank | — |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | help me with my homework | `education` | I need you to help me with my homework. | 我需要你帮助我做作业。 |
| 2 | help him with a project | `work` | Can you help him with a project at work? | 你能帮助他在工作上做一个项目吗？ |
| 3 | help her with her luggage | `travel` | They offered to help her with her luggage at the airport. | 他们主动帮助她在机场提行李。 |

### 6. depend on  

| | |
| --- | --- |
| 音标 | /dɪˈpɛnd ɑn/ |
| 中文释义 | 依赖；依靠 |
| 英文释义 | To rely on someone or something for support or help. |
| freq_rank | — |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | depend on friends | `daily_life` | You can always depend on your friends when you need help. | 当你需要帮助时，你总是可以依靠朋友。 |
| 2 | depend on weather conditions | `science_tech` | Farmers depend on weather conditions to grow their crops. | 农民依赖天气条件来种植作物。 |
| 3 | depend on your skills | `work` | To succeed, you must depend on your skills and experience. | 要成功，你必须依赖你的技能和经验。 |

### 7. to sb's surprise  

| | |
| --- | --- |
| 音标 | /tə sbz səˈpraɪz/ |
| 中文释义 | 令某人惊讶 |
| 英文释义 | Causing someone to feel shocked or astonished. |
| freq_rank | — |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | to my surprise | `daily_life` | I found my keys in the fridge, to my surprise. | 我惊讶地发现我的钥匙在冰箱里。 |
| 2 | to her surprise | `work` | Her colleague arrived early, to her surprise. | 她的同事提前到达，令她感到惊讶。 |
| 3 | to their surprise | `culture` | The movie ended differently, to their surprise. | 这部电影以不同的方式结束，令他们感到惊讶。 |

### 8. make sb's bed  

| | |
| --- | --- |
| 音标 | /meɪk ˈbɛd/ |
| 中文释义 | 整理床铺 |
| 英文释义 | To arrange the bedding neatly in a bed. |
| freq_rank | — |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | make my bed every morning | `daily_life` | I make my bed every morning before school. | 我每天早上上学前整理床铺。 |
| 2 | make his bed properly | `education` | Students are taught to make their bed properly. | 学生们被教导要正确整理床铺。 |
| 3 | make her bed before leaving | `work` | She always makes her bed before leaving for work. | 她总是在去上班之前整理床铺。 |

### 9. drive sb. crazy  

| | |
| --- | --- |
| 音标 | /draɪv ˈkreɪzi/ |
| 中文释义 | 使某人发疯 |
| 英文释义 | To make someone feel very annoyed or upset. |
| freq_rank | — |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | drive me crazy | `daily_life` | The loud music drives me crazy every night. | 每晚，响亮的音乐让我发疯。 |
| 2 | drive her crazy | `work` | His constant talking drives her crazy during meetings. | 他在会议上不停地讲话，让她发疯。 |
| 3 | drive them crazy | `education` | Long assignments can drive students crazy before exams. | 长作业在考试前会让学生发疯。 |

### 10. pull one's weight  

| | |
| --- | --- |
| 音标 | /pʊl wʌnz weɪt/ |
| 中文释义 | 尽自己所能 |
| 英文释义 | To do one's fair share of work or responsibility. |
| freq_rank | — |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | pull one's weight in a group project | `academic` | Every student must pull their weight in the group project for success. | 每个学生在小组项目中都必须尽自己所能以获得成功。 |
| 2 | pull one's weight at work | `work` | Employees are expected to pull their weight at work to maintain productivity. | 员工必须在工作中尽自己所能以保持生产力。 |
| 3 | pull one's weight in a team | `daily_life` | It's frustrating when someone does not pull their weight in a team. | 当有人在团队中不尽自己所能时，令人感到沮丧。 |

### 11. lift sb's spirits  

| | |
| --- | --- |
| 音标 | /lɪft ˈspɪr.ɪts/ |
| 中文释义 | 振奋情绪 |
| 英文释义 | To make someone feel happier or more positive. |
| freq_rank | — |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | lift my spirits | `daily_life` | Friends often help lift my spirits when I am sad. | 朋友们常常帮助我振奋情绪，当我感到伤心时。 |
| 2 | lift her spirits | `work` | A surprise party can really lift her spirits at work. | 一个惊喜派对真的能振奋她在工作的情绪。 |
| 3 | lift their spirits | `culture` | Music can lift their spirits during tough times. | 音乐可以在艰难时刻振奋他们的情绪。 |

### 12. be connected to  

| | |
| --- | --- |
| 音标 | /bi kəˈnɛk.tɪd tuː/ |
| 中文释义 | 与某事物有关联 |
| 英文释义 | To have a relationship or association with something. |
| freq_rank | — |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | be connected to the internet | `daily_life` | Many people need to be connected to the internet every day. | 许多人每天需要连接互联网。 |
| 2 | be connected to certain issues | `news` | This policy may be connected to certain issues in society. | 该政策可能与社会中的某些问题有关。 |
| 3 | be connected to various fields | `education` | Students should be connected to various fields of study. | 学生应该与多个学科领域相关联。 |

### 13. lend sb a hand  

| | |
| --- | --- |
| 音标 | /lɛnd ə hænd/ |
| 中文释义 | 帮助；援助 |
| 英文释义 | To assist someone with a task or problem. |
| freq_rank | — |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | lend me a hand | `daily_life` | Can you lend me a hand with this project? | 你能帮我一把这个项目吗？ |
| 2 | lend him a hand | `work` | They are ready to lend him a hand during the busy season. | 在繁忙的季节，他们准备帮助他。 |
| 3 | lend her a hand | `education` | Teachers often lend her a hand when she struggles. | 当她遇到困难时，老师们经常帮助她。 |

### 14. succeed in doing sth  

| | |
| --- | --- |
| 音标 | /səkˈsiːd ɪn ˈduːɪŋ/ |
| 中文释义 | 成功做某事 |
| 英文释义 | To achieve what one aims to do successfully. |
| freq_rank | — |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | succeed in passing the exam | `academic` | Many students succeed in passing the exam with hard work. | 许多学生通过努力成功地通过了考试。 |
| 2 | succeed in achieving their goals | `work` | The team succeeded in achieving their goals this quarter. | 该团队在本季度成功达成了他们的目标。 |
| 3 | succeed in finding a solution | `science_tech` | Researchers succeeded in finding a solution to the problem. | 研究人员成功找到了问题的解决方案。 |

### 15. be home to sb/sth  

| | |
| --- | --- |
| 音标 | /bi hoʊm tu/ |
| 中文释义 | 是某人或某物的家 |
| 英文释义 | To be the place where someone or something lives or exists. |
| freq_rank | — |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | be home to many important species | `environment` | Forests are home to many important species of animals. | 森林是许多重要物种的栖息地。 |
| 2 | be home to the best universities | `education` | This city is home to the best universities in the country. | 这个城市是全国最好的大学的所在地。 |
| 3 | be home to a diverse culture | `culture` | Our town is home to a diverse culture and traditions. | 我们的城镇是多元文化和传统的发源地。 |

### 16. pour sth into sth  

| | |
| --- | --- |
| 音标 | /pɔːr ˈɪntu/ |
| 中文释义 | 倒入；倾注 |
| 英文释义 | To cause a substance to flow into another place. |
| freq_rank | — |
| 难度档 | A2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | pour water into a glass | `daily_life` | You should pour water into a glass carefully. | 你应该小心地把水倒入杯子里。 |
| 2 | pour cement into a mold | `work` | They will pour cement into a mold to create a structure. | 他们会把水泥倒入模具中以建造结构。 |
| 3 | pour data into a database | `science_tech` | Researchers need to pour data into a database for analysis. | 研究人员需要将数据倒入数据库进行分析。 |
