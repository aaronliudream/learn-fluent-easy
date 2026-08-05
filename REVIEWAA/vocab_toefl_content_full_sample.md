# 托福词汇内容 batch1 · 送审样本

> 抽 16 词(种子固定 20260803,复跑抽到同样这批)。
> **不是纯随机** —— 贪心挑成尽量铺开 scene 与词性,免得 16 个全是名词、场景全挤在 news。
> 本批覆盖 **10/10 个 scene**、**7 种词性**(adj. / n. / adv. / 词性缺失 / v. / prep. / conj.)。
> (`词性缺失` = ECDICT 的 translation 里没有词性前缀,全库 53 个词属于这种,`pos` 为空。)
> 全量 4471 词见 `scripts/vocab/data/generated/toefl-content.json`。

## 全量 4471 词的分布(不只是抽样这 16 个)

难度档:A2 9 · B1 193 · B2 1521 · C1 2748

场景(共 13413 条例句):academic 1438 · news 1308 · daily_life 2267 · work 2226 · science_tech 1464 · health 658 · environment 658 · education 1291 · travel 288 · culture 1815

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

### 1. melodious  *adj.*

| | |
| --- | --- |
| 音标 | /mɛˈloʊ.di.əs/ |
| 中文释义 | 悦耳的 |
| 英文释义 | Having a pleasant, tuneful sound or melody. |
| freq_rank | 24239 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | melodious tones | `daily_life` | Birds often produce melodious tones that brighten up the morning. | 鸟儿常常发出悦耳的音调，让早晨更加明亮。 |
| 2 | melodious voice | `culture` | She sang with a melodious voice, captivating everyone in the audience. | 她以悦耳的嗓音歌唱，吸引了在场的每一个人。 |
| 3 | melodious melodies | `education` | The class listened to melodious melodies that helped them relax during study time. | 班级在学习期间听着悦耳的旋律，帮助他们放松。 |

### 2. petrifaction  *n.*

| | |
| --- | --- |
| 音标 | /ˌpɛtrɪˈfækʃən/ |
| 中文释义 | 石化 |
| 英文释义 | The process of turning organic material into stone. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | petrifaction process | `science_tech` | The petrifaction process can preserve ancient organisms for millions of years. | 石化过程可以使古代生物保存几百万年。 |
| 2 | petrifaction of trees | `environment` | During the petrifaction of trees, minerals replace the organic material gradually over time. | 在树木石化过程中，矿物逐渐替代有机物质。 |
| 3 | petrifaction evidence | `academic` | Researchers have found evidence of petrifaction in several fossilized plants. | 研究人员在几种化石植物中发现了石化的证据。 |

### 3. indefinitely  *adv.*

| | |
| --- | --- |
| 音标 | /ˌɪnˈdɛf.ɪ.nət.li/ |
| 中文释义 | 无限期地 |
| 英文释义 | For an unlimited time; without a defined endpoint. |
| freq_rank | 8418 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | stay indefinitely | `work` | Employees can stay indefinitely on the project if necessary. | 如果有必要，员工可以无限期留在该项目上。 |
| 2 | postpone indefinitely | `news` | The event was postponed indefinitely due to unforeseen circumstances. | 由于不可预见的情况，活动被无限期推迟。 |
| 3 | prolonged indefinitely | `health` | Treatment may be prolonged indefinitely to ensure the best outcomes. | 为了确保最佳效果，治疗可能被无限期延长。 |

### 4. fortuitously  

| | |
| --- | --- |
| 音标 | /fɔːrˈtjuː.ɪ.təs.li/ |
| 中文释义 | 偶然地；意外地 |
| 英文释义 | Happening by chance, often with a positive outcome. |
| freq_rank | 29221 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | fortuitously discovered | `science_tech` | Researchers fortuitously discovered a new method for energy storage during their experiments. | 研究人员在实验过程中偶然发现了一种新的储能方法。 |
| 2 | fortuitously encountered | `travel` | Travelers fortuitously encountered a festival that showcased local culture and traditions. | 旅行者偶然遇见了一个展示当地文化和传统的节日。 |
| 3 | fortuitously aligned | `work` | The project goals fortuitously aligned with the company’s long-term objectives, enhancing collaboration. | 项目目标偶然与公司的长期目标一致，增强了合作。 |

### 5. impel  *v.*

| | |
| --- | --- |
| 音标 | /ɪmˈpɛl/ |
| 中文释义 | 驱动；推动 |
| 英文释义 | To drive or urge to take action. |
| freq_rank | 16966 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | impel action | `work` | Many factors can impel action in a corporate environment, including profit margins. | 许多因素可以在企业环境中驱动行动，包括利润率。 |
| 2 | impel change | `culture` | Cultural movements often impel change in societal attitudes and beliefs. | 文化运动常常推动社会态度和信仰的变化。 |
| 3 | impel progress | `education` | Innovative teaching methods can impel progress in student learning outcomes. | 创新的教学方法可以推动学生学习成果的进步。 |

### 6. amid  *prep.*

| | |
| --- | --- |
| 音标 | /əˈmɪd/ |
| 中文释义 | 在……中间 |
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
| 英文释义 | In spite of that; nevertheless; used to introduce a contrast. |
| freq_rank | 3298 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | ..., nonetheless, ... | `news` | The economy is struggling; nonetheless, job growth continues in some sectors. | 经济正在挣扎，尽管如此，某些行业的就业增长仍在继续。 |
| 2 | nonetheless, + 主句 | `science_tech` | There were numerous challenges; nonetheless, the research team achieved their goals. | 面临众多挑战，尽管如此，研究团队实现了他们的目标。 |
| 3 | 小句; nonetheless | `daily_life` | I was tired after work; nonetheless, I decided to exercise. | 我下班后很累，尽管如此，我决定锻炼。 |

### 8. usher  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈʌʃ.ər/ |
| 中文释义 | 引导；接待 |
| 英文释义 | To lead or guide someone to a place or event. |
| freq_rank | 6570 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | usher in a new era | `news` | Experts believe technology will usher in a new era of innovation. | 专家认为，科技将引领一个创新的新纪元。 |
| 2 | usher guests to their seats | `daily_life` | The staff will usher guests to their seats before the performance starts. | 工作人员会在演出开始前引导客人入座。 |
| 3 | usher students into the auditorium | `education` | Teachers will usher students into the auditorium for the assembly. | 老师们会引导学生进入礼堂参加集会。 |

### 9. pueblo  *n.*

| | |
| --- | --- |
| 音标 | /ˈpwɛbloʊ/ |
| 中文释义 | 印第安村落 |
| 英文释义 | A type of communal dwelling of certain Native American peoples. |
| freq_rank | 15092 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | Native American pueblo | `culture` | The Native American pueblo communities have rich cultural traditions that continue today. | 印第安村落社区保留了丰富的文化传统，至今仍在延续。 |
| 2 | pueblo architecture | `education` | Students studied pueblo architecture to understand its historical significance in indigenous cultures. | 学生们研究印第安村落建筑，以了解其在土著文化中的历史重要性。 |
| 3 | historic pueblo sites | `travel` | Many tourists visit historic pueblo sites to learn about ancient Native American lifestyles. | 许多游客参观历史悠久的印第安村落遗址，以了解古代土著美国人的生活方式。 |

### 10. intuition  *n.*

| | |
| --- | --- |
| 音标 | /ˌɪn.tuˈɪ.ʃən/ |
| 中文释义 | 直觉 |
| 英文释义 | The ability to understand something instinctively without conscious reasoning. |
| freq_rank | 8521 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | gut intuition | `daily_life` | Many people trust their gut intuitions when making important decisions. | 许多人在做重要决定时信任自己的直觉。 |
| 2 | intuition tells | `work` | Her intuition tells her that this project will be successful despite the challenges. | 她的直觉告诉她，尽管面临挑战，这个项目会成功。 |
| 3 | creative intuition | `education` | Students often rely on their creative intuitions to enhance their artistic expressions. | 学生们常常依靠自己的创造性直觉来提升艺术表达。 |

### 11. softwood  *n.*

| | |
| --- | --- |
| 音标 | /ˈsɔːt.wʊd/ |
| 中文释义 | 软木 |
| 英文释义 | Wood from coniferous trees, used in construction and furniture. |
| freq_rank | 24319 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | softwood lumber | `work` | Construction companies frequently use softwood lumber for building residential homes. | 建筑公司经常使用软木木材来建造住宅。 |
| 2 | softwood species | `science_tech` | Researchers have identified several softwood species suitable for sustainable forestry practices. | 研究人员已确定几种适合可持续林业实践的软木树种。 |
| 3 | softwood products | `daily_life` | You can find various softwood products like furniture and flooring in local stores. | 你可以在当地商店找到各种软木产品，如家具和地板。 |

### 12. entangle  *v.*

| | |
| --- | --- |
| 音标 | /ɪnˈtæŋɡəl/ |
| 中文释义 | 纠缠 |
| 英文释义 | To twist together or entwine; to involve in difficulties. |
| freq_rank | 14257 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | entangle in a web of lies | `daily_life` | She found herself entangled in a web of lies that spanned years. | 她发现自己卷入了长达数年的谎言之中。 |
| 2 | entangle with regulations | `work` | Businesses should avoid becoming entangled with complex regulations that hinder growth. | 企业应避免被复杂的法规所纠缠，这会妨碍发展。 |
| 3 | entangle in disputes | `academic` | Researchers often become entangled in disputes over funding and publication ethics. | 研究人员经常卷入资金和出版伦理的争议中。 |

### 13. negotiation  *n.*

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

### 14. protruding  *v.*

| | |
| --- | --- |
| 音标 | /prəˈtruː.dɪŋ/ |
| 中文释义 | 突出；伸出 |
| 英文释义 | Extending beyond a surface or boundary. |
| freq_rank | 19323 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | protruding objects | `daily_life` | Objects protruding from the shelves can be hazardous for customers. | 货架上突出物品可能对顾客构成危险。 |
| 2 | protruding parts | `science_tech` | The protruding parts of the machine require regular maintenance to ensure safety. | 机器的突出部件需要定期维护以确保安全。 |
| 3 | protruding features | `culture` | Artists often highlight protruding features in their sculptures to create depth. | 艺术家常常在雕塑中突出立体特征以创造深度。 |

### 15. dehydrate  *v.*

| | |
| --- | --- |
| 音标 | /diːhaɪˈdreɪt/ |
| 中文释义 | 脱水 |
| 英文释义 | To remove water from something, often for preservation. |
| freq_rank | 17223 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | dehydrate food | `daily_life` | Many people choose to dehydrate food to extend its shelf life and reduce waste. | 许多人选择脱水食物，以延长其保质期并减少浪费。 |
| 2 | dehydrate quickly | `science_tech` | If plants do not receive water, they will dehydrate quickly and show signs of wilting. | 如果植物不接收水分，它们会迅速脱水，并出现枯萎的迹象。 |
| 3 | dehydrate the body | `health` | Athletes must ensure they do not dehydrate the body during intense training sessions. | 运动员必须确保在高强度训练期间不使身体脱水。 |

### 16. blunder  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈblʌn.dər/ |
| 中文释义 | 失误；错误 |
| 英文释义 | A mistake made due to carelessness or misunderstanding. |
| freq_rank | 13190 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | common blunders | `work` | Employees should be aware of common blunders that can lead to project failures. | 员工应该意识到常见的失误可能导致项目失败。 |
| 2 | blunder in judgment | `education` | Students often make a blunder in judgment when selecting their courses for the semester. | 学生在选择学期课程时，常常会犯下判断失误。 |
| 3 | blunders of the past | `news` | The report highlights the blunders of the past that contributed to the financial crisis. | 该报告强调了导致金融危机的历史失误。 |
