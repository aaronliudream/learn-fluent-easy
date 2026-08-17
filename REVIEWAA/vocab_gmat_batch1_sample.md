# 托福词汇内容 batch1 · 送审样本

> 抽 16 词(种子固定 20260803,复跑抽到同样这批)。
> **不是纯随机** —— 贪心挑成尽量铺开 scene 与词性,免得 16 个全是名词、场景全挤在 news。
> 本批覆盖 **10/10 个 scene**、**6 种词性**(n. / adj. / v. / adv. / 词性缺失 / conj.)。
> (`词性缺失` = ECDICT 的 translation 里没有词性前缀,全库 53 个词属于这种,`pos` 为空。)
> 全量 778 词见 `scripts/vocab/data/generated/gmat-content.json`。

## 全量 778 词的分布(不只是抽样这 16 个)

难度档:B1 5 · B2 246 · C1 527

场景(共 2334 条例句):academic 267 · news 260 · daily_life 436 · work 387 · science_tech 206 · health 116 · environment 94 · education 196 · travel 43 · culture 329

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

### 1. arbiter  *n.*

| | |
| --- | --- |
| 音标 | /ˈɑːr.bɪ.tər/ |
| 中文释义 | 仲裁者 |
| 英文释义 | A person who settles disputes or has ultimate authority. |
| freq_rank | 14948 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | final arbiter | `academic` | Scholars often regard the peer review process as the final arbiter of quality. | 学者们常常认为同行评审过程是质量的最终仲裁者。 |
| 2 | arbiters of taste | `culture` | Fashion designers are seen as arbiters of taste in contemporary society. | 时装设计师被视为当代社会的品味仲裁者。 |
| 3 | arbiter in disputes | `work` | The HR manager acted as an arbiter in disputes between employees. | 人力资源经理在员工之间的争议中担任仲裁者。 |

### 2. disparate  *adj./n.*

| | |
| --- | --- |
| 音标 | /ˈdɪs.pər.ət/ |
| 中文释义 | 迥然不同的；相异的 |
| 英文释义 | Different in kind; not able to be compared. |
| freq_rank | 8918 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | disparate groups | `education` | Students from disparate groups contribute unique perspectives to discussions. | 来自迥然不同的群体的学生为讨论提供了独特的观点。 |
| 2 | disparate views | `news` | Experts often hold disparate views on how to address climate change. | 专家们在如何应对气候变化的问题上经常持有迥然不同的看法。 |
| 3 | disparate outcomes | `science_tech` | The experiment produced disparate outcomes under varying conditions. | 该实验在不同条件下产生了迥然不同的结果。 |

### 3. wilt  *v./n.*

| | |
| --- | --- |
| 音标 | /wɪlt/ |
| 中文释义 | 枯萎 |
| 英文释义 | To become limp or droop due to lack of water. |
| freq_rank | 10000 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | flowers wilt | `daily_life` | When the temperature rises, flowers wilt rapidly without enough water. | 当温度上升时，花朵在缺水的情况下很快就会枯萎。 |
| 2 | plants wilting | `environment` | In hot weather, plants wilting is a common problem for gardeners. | 在炎热的天气中，植物枯萎是园丁常见的问题。 |
| 3 | vegetables wilt | `health` | Eating vegetables right after purchase prevents them from wilting quickly. | 购买后立即食用蔬菜可以防止它们快速枯萎。 |

### 4. gingerly  *adv./adj.*

| | |
| --- | --- |
| 音标 | /ˈdʒɪn.dʒər.li/ |
| 中文释义 | 小心翼翼地；谨慎地 |
| 英文释义 | In a careful or cautious manner. |
| freq_rank | 11787 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | gingerly approached | `daily_life` | She gingerly approached the sleeping dog, afraid it might wake up suddenly. | 她小心翼翼地靠近正在睡觉的狗，生怕它突然醒来。 |
| 2 | gingerly handled | `work` | The technician gingerly handled the fragile equipment during the installation process. | 技术人员在安装过程中小心翼翼地处理易碎设备。 |
| 3 | gingerly stepped | `travel` | He gingerly stepped onto the icy pavement, trying not to slip or fall. | 他小心翼翼地踩在冰冷的人行道上，尽量不摔倒。 |

### 5. genome  

| | |
| --- | --- |
| 音标 | /ˈdʒiː.noʊm/ |
| 中文释义 | 基因组 |
| 英文释义 | The complete set of genetic material in an organism. |
| freq_rank | 7379 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | human genome | `science_tech` | Researchers are mapping the human genome to understand genetic diseases better. | 研究人员正在绘制人类基因组，以更好地理解遗传疾病。 |
| 2 | plant genome | `environment` | Scientists are exploring the plant genome to enhance agricultural productivity. | 科学家正在研究植物基因组，以提高农业生产力。 |
| 3 | genome sequencing | `health` | Genome sequencing has revolutionized the study of personalized medicine. | 基因组测序彻底改变了个性化医学的研究。 |

### 6. albeit  *conj.*

| | |
| --- | --- |
| 音标 | /ɔːlˈbiː.ɪt/ |
| 中文释义 | 尽管；虽然 |
| 英文释义 | In spite of the fact that; although. |
| freq_rank | 6086 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | albeit difficult | `education` | Studying a new language is challenging, albeit difficult for many students. | 学习一门新语言是具有挑战性的，尽管对许多学生来说很困难。 |
| 2 | albeit expensive | `daily_life` | Dining at that restaurant is enjoyable, albeit expensive for most families. | 在那家餐厅用餐很愉快，尽管对大多数家庭来说很贵。 |
| 3 | albeit with reservations | `work` | The proposal was accepted, albeit with reservations from some team members. | 该提案被接受，尽管一些团队成员对此有保留意见。 |

### 7. bout  *n.*

| | |
| --- | --- |
| 音标 | /baʊt/ |
| 中文释义 | 一段时间；一场 |
| 英文释义 | A short period of time or a contest. |
| freq_rank | 5865 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | boxing bout | `daily_life` | Many people enjoy watching a boxing bout on television. | 许多人喜欢在电视上观看拳击比赛。 |
| 2 | bout of illness | `health` | She experienced a sudden bout of illness last week. | 她上周经历了一次突发的疾病。 |
| 3 | bout of laughter | `culture` | After a funny story, there was a bout of laughter among friends. | 在一个有趣的故事后，朋友们笑得不可开交。 |

### 8. cache  *n./v.*

| | |
| --- | --- |
| 音标 | /kæʃ/ |
| 中文释义 | 缓存；藏匿处 |
| 英文释义 | A storage space for temporarily holding data. |
| freq_rank | 8893 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | cache memory | `science_tech` | Computers utilize cache memory to increase processing speed. | 计算机利用缓存内存来提高处理速度。 |
| 2 | cache files | `work` | Employees often clear cache files to optimize performance. | 员工经常清理缓存文件以优化性能。 |
| 3 | cache data | `academic` | Researchers found that cache data can significantly affect results. | 研究人员发现缓存数据会显著影响结果。 |

### 9. complacency  *n.*

| | |
| --- | --- |
| 音标 | /kəmˈpleɪ.sən.si/ |
| 中文释义 | 自满；满足 |
| 英文释义 | A feeling of self-satisfaction, often without awareness of potential dangers or deficiencies. |
| freq_rank | 14595 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | complacency in safety practices | `work` | Many employees exhibited complacency in safety practices, leading to avoidable accidents. | 许多员工在安全操作上表现出自满，导致了可避免的事故。 |
| 2 | complacency about results | `academic` | Students often show complacency about results, believing they can achieve without effort. | 学生们常常对结果表现出自满，认为自己无需努力就能取得成功。 |
| 3 | complacency towards challenges | `daily_life` | She approached new challenges with complacency, thinking they would resolve themselves. | 她自满地面对新的挑战，认为这些问题会自我解决。 |

### 10. hamstring  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈhæm.strɪŋ/ |
| 中文释义 | 腿筋；限制 |
| 英文释义 | A muscle at the back of the thigh; to hinder progress. |
| freq_rank | 11057 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | hamstring injury | `health` | Athletes often suffer a hamstring injury during intense training sessions. | 运动员在高强度训练中经常会受伤腿筋。 |
| 2 | hamstring efforts | `work` | The new regulations may hamstring efforts to boost productivity in the company. | 新法规可能会限制公司提升生产力的努力。 |
| 3 | hamstring reforms | `news` | Recent political debates could hamstring reforms aimed at improving public services. | 最近的政治辩论可能会限制改善公共服务的改革。 |

### 11. stealth  *n.*

| | |
| --- | --- |
| 音标 | /stɛlθ/ |
| 中文释义 | 隐形；潜行 |
| 英文释义 | Cautious and secretive movement to avoid detection. |
| freq_rank | 12455 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | stealth technology | `science_tech` | Researchers are developing stealth technology to enhance military aircraft capabilities. | 研究人员正在开发隐形技术，以增强军用飞机的能力。 |
| 2 | stealth operations | `news` | The military conducted stealth operations to gather intelligence without being detected. | 军方进行了隐秘行动，以在不被发现的情况下收集情报。 |
| 3 | stealth tactics | `work` | Effective leaders often utilize stealth tactics to navigate complex organizational challenges. | 有效的领导者常常利用隐秘策略来应对复杂的组织挑战。 |

### 12. covenant  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈkʌv.ən.ənt/ |
| 中文释义 | 契约 |
| 英文释义 | A formal agreement or promise between parties. |
| freq_rank | 11267 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | covenant agreement | `work` | The company signed a covenant agreement to protect intellectual property rights. | 公司签署了一份契约协议，以保护知识产权。 |
| 2 | covenant community | `culture` | Many families choose to live in a covenant community that upholds specific values. | 许多家庭选择居住在维护特定价值观的契约社区。 |
| 3 | covenant relationship | `education` | Establishing a covenant relationship fosters trust and collaboration among students and teachers. | 建立契约关系促进学生和教师之间的信任与合作。 |

### 13. custody  *n.*

| | |
| --- | --- |
| 音标 | /ˈkʌs.tə.di/ |
| 中文释义 | 监护；拘留 |
| 英文释义 | The legal right to take care of someone or something. |
| freq_rank | 4422 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | child custody | `daily_life` | Parents often dispute over child custody during divorce proceedings. | 离婚诉讼过程中，父母常常争夺子女的监护权。 |
| 2 | in custody | `news` | The suspect remained in custody while investigations continued. | 在调查继续进行的同时，嫌疑人仍被拘留。 |
| 3 | legal custody | `academic` | Legal custody determines which parent makes important decisions for the child. | 法律监护决定哪个父母为孩子做重要决定。 |

### 14. memoir  *n.*

| | |
| --- | --- |
| 音标 | /ˈmɛ.mwɑːr/ |
| 中文释义 | 回忆录 |
| 英文释义 | A historical account written from personal knowledge. |
| freq_rank | 5572 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | memoir writing | `education` | Writing a memoir requires deep reflection on personal experiences. | 撰写回忆录需要对个人经历进行深入反思。 |
| 2 | memoir author | `culture` | Many famous memoir authors share their life stories with the world. | 许多著名的回忆录作者与世界分享他们的生活故事。 |
| 3 | memoir collection | `daily_life` | A collection of memoirs can provide diverse perspectives on history. | 一部回忆录合集可以提供多样的历史视角。 |

### 15. seminary  *n.*

| | |
| --- | --- |
| 音标 | /ˈsɛm.ɪ.nɛr.i/ |
| 中文释义 | 神学院 |
| 英文释义 | An institution for training ministers or priests. |
| freq_rank | 9762 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | the seminary curriculum | `education` | Students participate actively in the seminary curriculum to enhance their learning experience. | 学生积极参与神学院的课程，以提升他们的学习体验。 |
| 2 | attend the seminary | `daily_life` | Young adults often choose to attend the seminary for spiritual growth. | 年轻人常常选择去神学院以获得灵性成长。 |
| 3 | graduate from the seminary | `work` | Many individuals aspire to graduate from the seminary and serve their communities. | 许多人渴望从神学院毕业，并服务于他们的社区。 |

### 16. sensual  *adj.*

| | |
| --- | --- |
| 音标 | /ˈsɛnʃuəl/ |
| 中文释义 | 性感的 |
| 英文释义 | Relating to physical or sexual pleasure or gratification. |
| freq_rank | 10089 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | sensual experience | `culture` | Exploring a sensual experience can deepen one's appreciation for art and beauty. | 探索性感的体验可以加深对艺术和美的欣赏。 |
| 2 | sensual pleasure | `daily_life` | Many seek sensual pleasure through fine dining and exquisite flavors that delight the senses. | 许多人通过美食和令人愉悦的味道寻求性感的享受。 |
| 3 | sensual imagery | `education` | The use of sensual imagery in literature often evokes strong emotional responses from readers. | 文学中运用性感的意象往往会激发读者强烈的情感反应。 |
