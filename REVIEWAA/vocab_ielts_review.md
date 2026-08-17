# ielts 词库内容 · 送审件(抽 100 词)

> 抽样种子固定 20260803,复跑抽到同一批。**不是纯随机** —— 贪心挑成尽量铺开场景与词性,
> 免得 100 个里大半是名词、场景全挤在 news。
> 本批覆盖 **10/10 个场景**、**7 种词性**。
> 全量内容见 `scripts/vocab/data/generated/ielts-content.json`。

## 全量 815 词的实测分布

| 项 | 实测 |
| --- | --- |
| 词条 | 815 |
| 例句 | 2445(平均每词 3.00 条) |
| 难度档 | A2 7 · B1 41 · B2 166 · C1 601 |
| ECDICT 未标词性 | 20 词 |
| 跨词性(pos 含 `/`) | 146 词(17.9%) |
| 一次过闸 | 703 词 · 重试后才过 112 词 |
| 人工撰写 | 9 词(housing burger birds dilapidated duly photocopy clubs tributes water-skiing) |

场景分布(共 2445 条例句):academic 218 · news 232 · daily_life 471 · work 443 · science_tech 229 · health 121 · environment 97 · education 270 · travel 88 · culture 276

## 请重点看这四点

1. **中文释义准不准** —— 有没有把次要义当主义、有没有并列近义词充数。
2. **搭配是不是真高频**,顺序是不是真按频率(句 1 应当是最常见的说法)。
3. **例句像不像人写的** —— 三句之间是不是真换了写法,不是同一个模子换词。
4. **难度档合不合适** —— 高频词配短句、低频学术词配长句。

## ⚠️ 我自己知道的薄弱点(不用你去找)

- **跨词性词的义项**:本批有 146 个跨词性词。提示词里加了"跨词性几乎必然对应词典
  分列义项"的自查,实测 state → 状态；国家 ✓、part → 部分；分开 ✓,但 **might(n./aux.)
  仍然给「可能；或许」** —— 近义堆砌且漏了名词义"力量"。没继续迭代提示词(边际收益递减),
  这类**只能靠人审兜**,请留意跨词性词的第二个义项。
- **个别搭配不是真搭配**:如 system 的 "local system"、part 的
  "Understanding is part of the problem we face"(语义空转)。机器闸门只能判"搭配里含不含
  目标词",判不了"这个搭配母语者到底说不说"。
- **人工撰写的 9 条**(上面标了 🖊):模型连续三轮爬不出同一个陷阱才手写的,
  照样过了全部闸门,但请你单独看一眼。

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

### 3. wollongong  *(ECDICT 没标词性)*

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

### 17. cute  *adj.*

| | |
| --- | --- |
| 音标 | /kjuːt/ |
| 中文释义 | 可爱的 |
| 英文释义 | Appealing or attractive in a charming way. |
| freq_rank | 4345 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | cute animals | `daily_life` | Many people love to take pictures of cute animals in the park. | 许多人喜欢在公园里拍摄可爱的动物。 |
| 2 | cute outfit | `culture` | She wore a cute outfit that attracted everyone's attention at the event. | 她穿着一套可爱的衣服，吸引了大家在活动上的注意。 |
| 3 | cute gesture | `education` | A cute gesture of kindness can brighten someone's day significantly. | 一个可爱的善举能显著地照亮某人的一天。 |

### 18. mathematic  *(ECDICT 没标词性)*

| | |
| --- | --- |
| 音标 | /ˈmæθ.ə.mæt.ɪk/ |
| 中文释义 | 数学的 |
| 英文释义 | Relating to or characterized by the study of numbers and quantities. |
| freq_rank | 44241 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | mathematic principles | `education` | Understanding mathematic principles is crucial for advanced studies in engineering. | 理解数学原理对于工程学的深入学习至关重要。 |
| 2 | mathematic models | `science_tech` | Researchers often use mathematic models to simulate real-world phenomena effectively. | 研究人员经常使用数学模型有效地模拟现实现象。 |
| 3 | mathematic theories | `academic` | The development of new mathematic theories can lead to breakthroughs in various fields. | 新数学理论的发展可以在多个领域带来突破。 |

### 19. thesaurus  *n.*

| | |
| --- | --- |
| 音标 | /θɪˈsɔːr.əs/ |
| 中文释义 | 同义词词典 |
| 英文释义 | A reference book listing synonyms and antonyms. |
| freq_rank | 22411 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | a comprehensive thesaurus | `academic` | Researchers often consult a comprehensive thesaurus for precise language choices. | 研究人员经常查阅全面的同义词词典以选择准确的语言。 |
| 2 | online thesaurus | `work` | Using an online thesaurus can enhance the quality of your writing significantly. | 使用在线同义词词典可以显著提高你的写作质量。 |
| 3 | print thesaurus | `daily_life` | Many writers still prefer a print thesaurus for its tactile benefits and ease of use. | 许多作家仍然更喜欢纸质同义词词典，因为它的手感和使用方便。 |

### 20. deluge  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈdɛl.juːdʒ/ |
| 中文释义 | 洪水；暴雨 |
| 英文释义 | A great flood or heavy rainfall causing inundation. |
| freq_rank | 16257 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | deluge of data | `science_tech` | Researchers faced a deluge of data from the recent experiments. | 研究人员面临来自最近实验的洪水般的数据。 |
| 2 | deluge of complaints | `news` | The company received a deluge of complaints following the service outage. | 在服务中断后，公司收到了大量投诉。 |
| 3 | deluge of emotions | `daily_life` | During the ceremony, a deluge of emotions overwhelmed the attendees. | 在仪式上，强烈的情感淹没了与会者。 |

### 21. instructors  *n.*

| | |
| --- | --- |
| 音标 | /ɪnˈstrʌk.tərz/ |
| 中文释义 | 讲师；指导者 |
| 英文释义 | People who teach or provide instruction in a specific subject. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | instructors' feedback | `education` | Students greatly appreciate the constructive feedback from their instructors. | 学生们非常感激讲师们的建设性反馈。 |
| 2 | instructors' qualifications | `work` | Employers often seek candidates with strong qualifications and experienced instructors. | 雇主通常寻求具有良好资格和经验丰富讲师的候选人。 |
| 3 | instructors' roles | `academic` | Understanding the diverse roles of instructors is essential in educational reform. | 理解讲师多样化的角色对教育改革至关重要。 |

### 22. procure  *v.*

| | |
| --- | --- |
| 音标 | /prəˈkjʊr/ |
| 中文释义 | 获取；获得 |
| 英文释义 | To obtain something through effort or action. |
| freq_rank | 13308 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | procure funding | `academic` | Researchers were able to procure funding for their innovative project. | 研究人员成功获取了他们创新项目的资金。 |
| 2 | procure materials | `work` | The team must procure materials before the project can begin. | 团队必须在项目开始前获取材料。 |
| 3 | procure approval | `daily_life` | To move forward, you need to procure approval from your supervisor. | 要继续进行，你需要获得上司的批准。 |

### 23. elated  *adj.*

| | |
| --- | --- |
| 音标 | /ɪˈleɪtɪd/ |
| 中文释义 | 兴高采烈的 |
| 英文释义 | Feeling or expressing great happiness or joy. |
| freq_rank | 15102 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | elated feeling | `daily_life` | After receiving the news, she was elated and couldn't stop smiling. | 收到消息后，她兴高采烈，忍不住微笑。 |
| 2 | elated supporters | `news` | The elated supporters celebrated their team's victory late into the night. | 兴高采烈的支持者们庆祝他们的球队胜利，直到深夜。 |
| 3 | elated mood | `health` | His elated mood was contagious, uplifting everyone around him. | 他兴高采烈的情绪具有感染力，提升了周围每个人的心情。 |

### 24. beds  *n.*

| | |
| --- | --- |
| 音标 | /bɛdz/ |
| 中文释义 | 床铺 |
| 英文释义 | A piece of furniture for sleep or rest, typically a mattress on a frame. |
| freq_rank | 26632 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | bunk beds | `daily_life` | Children often share rooms with bunk beds to save space. | 孩子们常常共享带双层床的房间以节省空间。 |
| 2 | hospital beds | `health` | Patients in critical condition require specialized hospital beds for proper care. | 重症患者需要专业的医院床以获得适当的护理。 |
| 3 | queen-size beds | `culture` | Many couples prefer queen-size beds for their shared comfort and space. | 许多夫妇更喜欢大号床以获得共享的舒适和空间。 |

### 25. scum  *n./v.*

| | |
| --- | --- |
| 音标 | /skʌm/ |
| 中文释义 | 污垢；渣滓 |
| 英文释义 | A layer of dirt or unwanted material on a surface. |
| freq_rank | 15268 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | scum of the earth | `culture` | He believed that the scum of the earth should be punished harshly. | 他认为，世上的渣滓应该受到严厉惩罚。 |
| 2 | scum buildup | `environment` | Regular maintenance prevents scum buildup in the pool, ensuring clean water. | 定期维护可以防止泳池中的污垢积聚，确保水质清洁。 |
| 3 | scum floating | `daily_life` | They noticed scum floating on the surface of the stagnant water in the garden. | 他们注意到花园里的静水表面漂浮着污垢。 |

### 26. families  *n.*

| | |
| --- | --- |
| 音标 | /ˈfæm.ɪ.liz/ |
| 中文释义 | 家庭；家族 |
| 英文释义 | Groups of individuals related by blood or marriage. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | supporting families | `work` | Organizations play a crucial role in supporting families during crises. | 组织在危机期间为家庭提供了重要支持。 |
| 2 | diverse families | `culture` | Many diverse families contribute to the rich tapestry of society. | 许多多样化的家庭为社会的丰富多彩作出了贡献。 |
| 3 | families in poverty | `news` | Reports highlight the challenges faced by families in poverty across the nation. | 报告强调了全国贫困家庭面临的挑战。 |

### 27. precautions  *n.*

| | |
| --- | --- |
| 音标 | /prɪˈkɔː.ʃənz/ |
| 中文释义 | 预防措施；防范措施 |
| 英文释义 | Actions taken in advance to prevent harm or ensure safety. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | safety precautions | `health` | Employing safety precautions is essential to prevent workplace accidents. | 采取安全预防措施对防止工作场所事故至关重要。 |
| 2 | take precautions | `daily_life` | Everyone should take precautions against the spread of infectious diseases. | 每个人都应该采取预防措施以防止传染病传播。 |
| 3 | precautions are necessary | `academic` | In many experiments, precautions are necessary to ensure reliable results. | 在许多实验中，采取预防措施是确保可靠结果的必要条件。 |

### 28. water-clock  *n.*

| | |
| --- | --- |
| 音标 | /ˈwɔː.tərˌklɒk/ |
| 中文释义 | 水钟 |
| 英文释义 | An ancient device used for measuring time with water flow. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | water-clock mechanism | `science_tech` | The water-clock mechanism was crucial for ancient timekeeping innovations. | 水钟机制对古代计时创新至关重要。 |
| 2 | ancient water-clocks | `culture` | Ancient water-clocks reveal fascinating insights into historical time management practices. | 古代水钟揭示了历史时间管理实践的迷人见解。 |
| 3 | water-clock designs | `education` | Various water-clock designs have been studied in historical engineering courses. | 各种水钟设计已在历史工程课程中研究。 |

### 29. questions  *n.*

| | |
| --- | --- |
| 音标 | /ˈkwɛs.tʃənz/ |
| 中文释义 | 问题 |
| 英文释义 | Inquiries or requests for information, often requiring a response. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | difficult questions | `education` | Students often face difficult questions during their final exams. | 学生们在期末考试中常常会遇到困难的问题。 |
| 2 | frequently asked questions | `work` | The website contains a section for frequently asked questions to assist users. | 该网站设有一个常见问题栏目以帮助用户。 |
| 3 | open-ended questions | `science_tech` | Researchers prefer open-ended questions to gather more detailed responses. | 研究人员更喜欢开放式问题以获取更详细的回答。 |

### 30. visas  *n.*

| | |
| --- | --- |
| 音标 | /ˈviː.zəz/ |
| 中文释义 | 签证 |
| 英文释义 | Official documents allowing entry to a country for a specific purpose. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | apply for visas | `work` | Many companies assist employees in applying for visas when relocating abroad. | 许多公司在员工海外调动时协助申请签证。 |
| 2 | travel visas | `travel` | Obtaining travel visas can be a lengthy and complex process for many individuals. | 对于许多人来说，获取旅行签证可能是一个漫长而复杂的过程。 |
| 3 | student visas | `education` | International students often require student visas to enroll in universities abroad. | 国际学生通常需要学生签证才能在国外的大学注册。 |

### 31. respondents  *n.*

| | |
| --- | --- |
| 音标 | /rɪˈspɒndənts/ |
| 中文释义 | 受访者；调查对象 |
| 英文释义 | Individuals who provide information in a survey or research study. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | respondents' answers | `academic` | Researchers analyzed the respondents' answers to understand their preferences better. | 研究人员分析了受访者的回答，以更好地理解他们的偏好。 |
| 2 | respondents to a survey | `work` | Many respondents to a survey indicated they prefer remote work options over in-office work. | 许多调查的受访者表示，他们更喜欢远程工作选项而非办公室工作。 |
| 3 | respondents expressed concerns | `health` | Some respondents expressed concerns about the safety of the new vaccine during the study. | 一些受访者在研究中表达了对新疫苗安全性的担忧。 |

### 32. marks  *n.*

| | |
| --- | --- |
| 音标 | /mɑrks/ |
| 中文释义 | 分数；标记 |
| 英文释义 | Scores or symbols indicating performance or quality. |
| freq_rank | 6038 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | marks of respect | `daily_life` | People often show marks of respect during important ceremonies. | 人们常在重要的仪式中表现出尊重的标记。 |
| 2 | marks on a test | `education` | Students receive marks on a test based on their performance and understanding. | 学生根据表现和理解在考试中获得分数。 |
| 3 | marks of progress | `work` | The company has made significant marks of progress in technology this year. | 公司今年在技术方面取得了显著的进展标志。 |

### 33. planners  *n.*

| | |
| --- | --- |
| 音标 | /ˈplæn.ərz/ |
| 中文释义 | 规划者 |
| 英文释义 | Individuals who create plans or strategies for projects or events. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | city planners | `work` | City planners are crucial in designing sustainable urban environments. | 城市规划者在设计可持续城市环境中至关重要。 |
| 2 | event planners | `daily_life` | Successful event planners know how to manage logistics and client expectations effectively. | 成功的活动策划者知道如何有效管理物流和客户期望。 |
| 3 | education planners | `education` | Education planners play a vital role in shaping curriculum and resource allocation. | 教育规划者在塑造课程和资源分配中发挥着重要作用。 |

### 34. forfeit  *n./v./adj.*

| | |
| --- | --- |
| 音标 | /ˈfɔːr.fɪt/ |
| 中文释义 | 丧失；放弃 |
| 英文释义 | To lose or give up something as a penalty or consequence. |
| freq_rank | 12633 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | forfeit rights | `news` | Individuals may forfeit their rights if they violate the agreement. | 如果个人违反协议，可能会丧失其权利。 |
| 2 | forfeit a privilege | `education` | Students who misbehave may forfeit a privilege granted to them earlier. | 表现不当的学生可能会失去之前授予的特权。 |
| 3 | forfeit a deposit | `daily_life` | If you cancel the reservation too late, you will forfeit your deposit. | 如果您太晚取消预订，您将丧失押金。 |

### 35. books  *n.*

| | |
| --- | --- |
| 音标 | /bʊks/ |
| 中文释义 | 书籍 |
| 英文释义 | Written works that are published in printed or digital format. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | read books | `daily_life` | Many people find joy in reading books during their free time. | 许多人在空闲时间阅读书籍感到快乐。 |
| 2 | academic books | `education` | Students often rely on academic books for their research and studies. | 学生通常依靠学术书籍进行研究和学习。 |
| 3 | old books | `culture` | Antique shops often have old books that reflect historical perspectives. | 古董商店通常有反映历史观点的旧书籍。 |

### 36. monsoon  *n.*

| | |
| --- | --- |
| 音标 | /mɒnˈsuːn/ |
| 中文释义 | 季风 |
| 英文释义 | A seasonal prevailing wind that typically brings heavy rain. |
| freq_rank | 16516 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | monsoon season | `environment` | The monsoon season significantly impacts agricultural productivity in many regions. | 季风季节对许多地区的农业生产力影响显著。 |
| 2 | monsoon rains | `work` | Many construction projects are delayed due to the unpredictable monsoon rains. | 由于不可预测的季风雨，许多建设项目被延误。 |
| 3 | monsoon patterns | `science_tech` | Researchers study monsoon patterns to better understand climate change effects. | 研究人员研究季风模式，以更好地理解气候变化的影响。 |

### 37. tertiary  *adj./n.*

| | |
| --- | --- |
| 音标 | /ˈtɜr.ʃiˌɛr.i/ |
| 中文释义 | 第三位的；第三阶段的 |
| 英文释义 | Of third rank or order; third in importance or development. |
| freq_rank | 18337 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | tertiary education | `education` | Institutions offer various programs for tertiary education aimed at career readiness. | 这些机构提供多种旨在职业准备的高等教育课程。 |
| 2 | tertiary sector | `work` | The tertiary sector plays a critical role in the economy by providing services. | 第三产业在经济中发挥着重要作用，提供各种服务。 |
| 3 | tertiary treatment | `environment` | Implementing tertiary treatment processes can significantly reduce water pollution levels. | 实施三级处理工艺可以显著降低水污染水平。 |

### 38. regulations  *n.*

| | |
| --- | --- |
| 音标 | /ˌrɛɡjʊˈleɪʃənz/ |
| 中文释义 | 规章；条例 |
| 英文释义 | Rules or directives made and maintained by an authority. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | government regulations | `news` | Government regulations are often necessary to ensure public safety and welfare. | 政府规章常常是确保公众安全和福利所必需的。 |
| 2 | safety regulations | `work` | Employers must comply with safety regulations to protect their workers from harm. | 雇主必须遵守安全规章，以保护工人免受伤害。 |
| 3 | environmental regulations | `environment` | Understanding environmental regulations is crucial for sustainable development practices. | 理解环境规章对可持续发展实践至关重要。 |

### 39. granary  *n.*

| | |
| --- | --- |
| 音标 | /ˈɡræn.ər.i/ |
| 中文释义 | 谷仓 |
| 英文释义 | A place for storing threshed grain. |
| freq_rank | 24702 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | granaries for storage | `work` | Farmers constructed new granaries for storage during the harvest season. | 农民在收获季节建造了新的谷仓用于储存。 |
| 2 | historical granaries | `culture` | Archaeologists discovered ancient granaries that reveal agricultural practices of past civilizations. | 考古学家发现的古代谷仓揭示了过去文明的农业实践。 |
| 3 | granaries in the region | `news` | Local authorities are assessing the condition of granaries in the region after recent storms. | 地方当局在近期暴风雨后正在评估该地区谷仓的状况。 |

### 40. fossils  *n.*

| | |
| --- | --- |
| 音标 | /ˈfɑː.səlz/ |
| 中文释义 | 化石 |
| 英文释义 | Remains or impressions of organisms from a past geological age. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | fossils found | `science_tech` | Researchers recently announced the discovery of fossils found in Antarctica. | 研究人员最近宣布在南极发现的化石。 |
| 2 | fossils reveal | `academic` | Fossils reveal important information about ancient ecosystems and species evolution. | 化石揭示了关于古代生态系统和物种演化的重要信息。 |
| 3 | fossils of dinosaurs | `news` | Newly unearthed fossils of dinosaurs have captivated the scientific community and public alike. | 新发现的恐龙化石吸引了科学界和公众的注意。 |

### 41. bones  *n.*

| | |
| --- | --- |
| 音标 | /boʊnz/ |
| 中文释义 | 骨骼；骨头 |
| 英文释义 | The rigid organs that form the skeleton of vertebrates. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | broken bones | `health` | Many patients suffer from broken bones after serious accidents or falls. | 许多患者在严重事故或跌倒后遭受骨折。 |
| 2 | bones of contention | `academic` | Scholars often debate the bones of contention in ancient archaeological findings. | 学者们常常争论古代考古发现中的争议焦点。 |
| 3 | bones of a dinosaur | `science_tech` | Researchers discovered the bones of a dinosaur buried deep within the sediment. | 研究人员发现了一只恐龙的骨骼深埋在沉积物中。 |

### 42. girlfriend  *n.*

| | |
| --- | --- |
| 音标 | /ˈɡɜːrlˌfrɛnd/ |
| 中文释义 | 女朋友 |
| 英文释义 | A person's female partner in a romantic relationship. |
| freq_rank | 3115 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | my girlfriend | `daily_life` | I called my girlfriend to ask about her day. | 我打电话给我的女朋友询问她的日子。 |
| 2 | introduce my girlfriend | `culture` | He decided to introduce my girlfriend to his family at dinner. | 他决定在晚餐时把我的女朋友介绍给他的家人。 |
| 3 | ex-girlfriend | `news` | The article discussed an interview with his ex-girlfriend. | 这篇文章讨论了与他的前女朋友的采访。 |

### 43. mercenary  *n./adj.*

| | |
| --- | --- |
| 音标 | /ˈmɜːr.sə.ner.i/ |
| 中文释义 | 雇佣兵；雇佣的 |
| 英文释义 | A person hired to fight for another country or group. |
| freq_rank | 14838 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | mercenary forces | `news` | Mercenary forces are often employed in conflict zones around the world. | 雇佣兵部队通常在全球冲突地区被雇佣。 |
| 2 | mercenary motivations | `academic` | Understanding mercenary motivations can provide insight into modern warfare dynamics. | 理解雇佣兵的动机可以深入了解现代战争动态。 |
| 3 | mercenary activities | `work` | Many countries impose restrictions on mercenary activities to maintain national security. | 许多国家对雇佣兵活动施加限制以维护国家安全。 |

### 44. vomit  *v./n.*

| | |
| --- | --- |
| 音标 | /ˈvɑː.mɪt/ |
| 中文释义 | 呕吐 |
| 英文释义 | To expel contents from the stomach through the mouth. |
| freq_rank | 8753 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | vomit blood | `health` | Patients may vomit blood as a serious symptom of illness. | 患者可能会呕吐血液，这是疾病的严重症状。 |
| 2 | to vomit violently | `daily_life` | After eating something spoiled, she began to vomit violently in the bathroom. | 吃了变质的东西后，她在浴室里开始剧烈呕吐。 |
| 3 | vomit from motion sickness | `travel` | Some people tend to vomit from motion sickness when traveling by car. | 有些人在乘车旅行时容易因晕车而呕吐。 |

### 45. walls  *n.*

| | |
| --- | --- |
| 音标 | /wɔlz/ |
| 中文释义 | 墙壁 |
| 英文释义 | Vertical structures that enclose or divide spaces. |
| freq_rank | 18881 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | inner walls | `science_tech` | Scientists discovered that the inner walls of cells have complex structures. | 科学家发现细胞的内壁具有复杂的结构。 |
| 2 | soundproof walls | `daily_life` | Many homeowners are installing soundproof walls to reduce noise levels in their homes. | 许多房主正在安装隔音墙以降低家庭噪音水平。 |
| 3 | tall walls | `culture` | In ancient times, many cities built tall walls for protection against invasions. | 在古代，许多城市建造高墙以保护自己免受侵略。 |

### 46. shimmer  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈʃɪm.ɚ/ |
| 中文释义 | 微光；闪光 |
| 英文释义 | A soft, wavering light or gleam that reflects off surfaces. |
| freq_rank | 14417 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | shimmer of light | `daily_life` | Light from the sunset shimmered across the lake, creating a picturesque scene. | 落日的光辉在湖面上闪烁，形成了一幅如画的景象。 |
| 2 | shimmering surface | `science_tech` | The shimmering surface of the ocean reflected the bright morning sun beautifully. | 海洋的闪烁表面美丽地反射着明亮的晨光。 |
| 3 | shimmering dress | `culture` | She wore a shimmering dress that captivated everyone at the gala. | 她穿着一件闪亮的裙子，吸引了晚会上的所有人。 |

### 47. fund-raising  *(ECDICT 没标词性)*

| | |
| --- | --- |
| 音标 | /ˈfʌndˌreɪ.zɪŋ/ |
| 中文释义 | 筹款 |
| 英文释义 | The act of collecting money for a specific purpose. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | fund-raising event | `daily_life` | Many people attended the fund-raising event to support local charities. | 许多人参加了筹款活动，以支持当地慈善机构。 |
| 2 | fund-raising campaign | `work` | Our team has launched a fund-raising campaign for the new community center. | 我们的团队已经启动了一项筹款活动，以支持新的社区中心。 |
| 3 | fund-raising activities | `education` | Students organized various fund-raising activities to help those in need. | 学生们组织了各种筹款活动，以帮助有需要的人。 |

### 48. sewage  *n.*

| | |
| --- | --- |
| 音标 | /ˈsuː.ɪdʒ/ |
| 中文释义 | 污水；排污水 |
| 英文释义 | Liquid waste, especially from households or industries. |
| freq_rank | 7208 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | wastewater treatment of sewage | `environment` | Wastewater treatment processes are essential for managing sewage effectively. | 污水处理过程对有效管理污水至关重要。 |
| 2 | sewage system | `daily_life` | Many cities are upgrading their sewage systems to prevent pollution. | 许多城市正在升级其污水系统以防止污染。 |
| 3 | sewage disposal | `work` | Proper sewage disposal methods are crucial for public health and safety. | 适当的污水处理方法对公共健康和安全至关重要。 |

### 49. prizes  *n./v.*

| | |
| --- | --- |
| 音标 | /praɪzɪz/ |
| 中文释义 | 奖品；奖金 |
| 英文释义 | Items awarded for achievement or success in competitions. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | academic prizes | `education` | Winning academic prizes can significantly enhance a student's resume. | 获得学术奖项可以显著提升学生的简历。 |
| 2 | film prizes | `culture` | The festival awarded numerous film prizes to emerging directors this year. | 今年，电影节向新兴导演颁发了多个电影奖项。 |
| 3 | cash prizes | `daily_life` | Many competitions offer cash prizes to attract more participants. | 许多比赛提供现金奖励以吸引更多参赛者。 |

### 50. wreathe  *v.*

| | |
| --- | --- |
| 音标 | /riːð/ |
| 中文释义 | 环绕；缠绕 |
| 英文释义 | To encircle or adorn with something; to twist around. |
| freq_rank | 24499 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | wreathe in flowers | `daily_life` | They chose to wreathe in flowers for the summer festival decorations. | 他们选择用鲜花环绕夏季节日的装饰。 |
| 2 | wreathe with smoke | `environment` | The factory began to wreathe with smoke during the early morning hours. | 工厂在清晨时分开始被烟雾缠绕。 |
| 3 | wreathe in ivy | `culture` | Historically, people would wreathe in ivy during special celebrations or rituals. | 历史上，人们会在特别的庆祝活动或仪式中用常春藤环绕。 |

### 51. assassination  *n.*

| | |
| --- | --- |
| 音标 | /əˌsæs.ɪˈneɪ.ʃən/ |
| 中文释义 | 暗杀 |
| 英文释义 | The act of deliberately killing a prominent person. |
| freq_rank | 5434 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | political assassination | `news` | Many countries have been affected by political assassination over the decades. | 许多国家在几十年间受到政治暗杀的影响。 |
| 2 | assassination attempt | `work` | An assassination attempt on the leader shocked the entire organization. | 对领导者的暗杀企图震惊了整个组织。 |
| 3 | targeted assassination | `culture` | Targeted assassination has become a controversial topic in modern warfare. | 有针对性的暗杀已成为现代战争中的一个争议话题。 |

### 52. standards  *n.*

| | |
| --- | --- |
| 音标 | /ˈstæn.dɚdz/ |
| 中文释义 | 标准 |
| 英文释义 | Criteria or principles used for evaluating quality or performance. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | academic standards | `education` | Many universities have strict academic standards that students must meet. | 许多大学有严格的学术标准，学生必须达到这些标准。 |
| 2 | quality standards | `work` | Companies are required to adhere to quality standards in their production processes. | 公司必须遵循生产过程中的质量标准。 |
| 3 | safety standards | `science_tech` | New regulations have been introduced to improve safety standards in laboratory environments. | 新规章已被引入，以提高实验室环境中的安全标准。 |

### 53. benefits  *n.*

| | |
| --- | --- |
| 音标 | /ˈbɛnɪfɪts/ |
| 中文释义 | 好处；利益 |
| 英文释义 | Advantages or gains obtained from something. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | health benefits | `health` | Regular exercise provides numerous health benefits, improving overall well-being. | 定期锻炼带来了众多健康好处，提升整体健康状况。 |
| 2 | tax benefits | `work` | Many businesses can take advantage of various tax benefits to reduce their expenses. | 许多企业可以利用各种税收优惠来降低开支。 |
| 3 | economic benefits | `academic` | This study highlights the economic benefits of renewable energy sources for future development. | 本研究强调了可再生能源对未来发展的经济好处。 |

### 54. paraphernalia  *n.*

| | |
| --- | --- |
| 音标 | /ˌpær.ə.fəˈneɪ.lə/ |
| 中文释义 | 随身物品；设备 |
| 英文释义 | Miscellaneous articles, especially the equipment needed for a particular activity. |
| freq_rank | 15134 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | drug paraphernalia | `daily_life` | Authorities confiscated a large quantity of drug paraphernalia from the suspect's home. | 当局从嫌疑人的家中查获了大量的毒品随身物品。 |
| 2 | hiking paraphernalia | `culture` | She packed all her hiking paraphernalia for the weekend trip to the mountains. | 她为周末的登山旅行打包了所有的登山设备。 |
| 3 | scientific paraphernalia | `science_tech` | The lab was filled with various scientific paraphernalia for the ongoing experiments. | 实验室里充满了进行中的实验所需的各种科学设备。 |

### 55. drugs  *n.*

| | |
| --- | --- |
| 音标 | /drʌɡz/ |
| 中文释义 | 药物 |
| 英文释义 | Substances used for medical or recreational purposes, affecting bodily functions. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | illegal drugs | `news` | Authorities are cracking down on the distribution of illegal drugs in urban areas. | 当局正在打击城市地区非法药物的分发。 |
| 2 | prescription drugs | `health` | Patients often rely on prescription drugs to manage their chronic illnesses effectively. | 患者通常依赖处方药有效地管理他们的慢性疾病。 |
| 3 | recreational drugs | `daily_life` | Many people experiment with recreational drugs during social gatherings or parties. | 许多人在社交聚会或派对上尝试休闲药物。 |

### 56. annuity  *n.*

| | |
| --- | --- |
| 音标 | /əˈnjuː.ɪ.ti/ |
| 中文释义 | 年金 |
| 英文释义 | A fixed sum paid regularly for a specified period. |
| freq_rank | 12850 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | retirement annuity | `work` | Many employees choose a retirement annuity to secure their financial future. | 许多员工选择年金来保障他们的财务未来。 |
| 2 | life annuity | `health` | A life annuity provides income for the rest of a person's life. | 年金为一个人提供终生的收入。 |
| 3 | immediate annuity | `academic` | An immediate annuity starts payments almost right after the initial investment. | 即期年金在初始投资后几乎立即开始支付。 |

### 57. clubs  *n.*  🖊 **人工撰写**

| | |
| --- | --- |
| 音标 | /klʌbz/ |
| 中文释义 | 俱乐部；社团 |
| 英文释义 | Groups of people who meet regularly for a shared interest. |
| freq_rank | — |
| 难度档 | C1 |

> 🖊 这条是人工写的,原因:词条本身是复数形。模型把搭配写成 nightclubs —— 独立的词,不是 clubs 的搭配(g7)。

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | sports clubs | `health` | Sports clubs in the city welcome new members each spring. | 市里的体育俱乐部每年春天都欢迎新成员加入。 |
| 2 | book clubs | `culture` | Many readers join book clubs to discuss recent novels. | 许多读者加入读书会来讨论新近出版的小说。 |
| 3 | join clubs | `education` | Teachers encourage students to join clubs after regular lessons. | 老师鼓励学生在正课之后参加社团活动。 |

### 58. relations  *n.*

| | |
| --- | --- |
| 音标 | /rɪˈleɪʃənz/ |
| 中文释义 | 关系；联系 |
| 英文释义 | The way in which two or more people or groups are connected. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | international relations | `academic` | International relations are increasingly influenced by global economic changes. | 国际关系受到全球经济变化的影响越来越大。 |
| 2 | family relations | `daily_life` | Many family relations can become strained due to financial disagreements. | 许多家庭关系因财务争议而变得紧张。 |
| 3 | business relations | `work` | Building strong business relations is essential for long-term success. | 建立良好的商业关系对长期成功至关重要。 |

### 59. guardian  *n./adj.*

| | |
| --- | --- |
| 音标 | /ˈɡɑːr.di.ən/ |
| 中文释义 | 监护人；保护者 |
| 英文释义 | A person who protects or takes care of another individual. |
| freq_rank | 5671 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | legal guardian | `academic` | A legal guardian is appointed to protect a minor's interests. | 监护人被指定来保护未成年人的利益。 |
| 2 | guardian of the environment | `culture` | Many activists serve as guardians of the environment in their communities. | 许多活动家在他们的社区里担任环境的保护者。 |
| 3 | guardian angel | `daily_life` | She believes her guardian angel watches over her every day. | 她相信她的守护天使每天都在看护她。 |

### 60. nautical  *adj.*

| | |
| --- | --- |
| 音标 | /ˈnɔː.tɪ.kəl/ |
| 中文释义 | 航海的 |
| 英文释义 | Related to ships, navigation, or maritime activities. |
| freq_rank | 16018 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | nautical charts | `work` | Many sailors rely on nautical charts for safe navigation at sea. | 许多水手依赖航海图在海上安全航行。 |
| 2 | nautical terms | `education` | Students in marine studies learn various nautical terms used in navigation. | 海洋研究的学生学习在航行中使用的各种航海术语。 |
| 3 | nautical traditions | `culture` | Coastal communities often celebrate their nautical traditions during festivals. | 沿海社区在节日期间常常庆祝他们的航海传统。 |

### 61. minutes  *n.*

| | |
| --- | --- |
| 音标 | /ˈmɪn.ɪts/ |
| 中文释义 | 分钟 |
| 英文释义 | Units of time equal to sixty seconds each. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | five minutes | `daily_life` | It takes me five minutes to walk to the bus stop. | 我走到公交站需要五分钟。 |
| 2 | ten minutes late | `work` | Arriving ten minutes late to the meeting caused unnecessary disruptions. | 在会议上迟到十分钟造成了不必要的干扰。 |
| 3 | last few minutes | `academic` | The last few minutes of the lecture were particularly insightful and engaging. | 讲座的最后几分钟特别引人深思且引人入胜。 |

### 62. chicks  *n.*

| | |
| --- | --- |
| 音标 | /tʃɪks/ |
| 中文释义 | 雏鸟；小鸡 |
| 英文释义 | Young birds, especially those of domesticated fowl. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | baby chicks | `daily_life` | Baby chicks require a warm environment to thrive in their early days. | 小雏鸟在早期需要一个温暖的环境才能茁壮成长。 |
| 2 | cute chicks | `culture` | Many people enjoy watching cute chicks during spring festivals around the world. | 许多人在世界各地的春季节庆中喜欢观看可爱的小鸡。 |
| 3 | chicks hatching | `science_tech` | Chicks hatching from eggs is a fascinating biological process to observe. | 观察小鸡从蛋中孵化是一个引人入胜的生物过程。 |

### 63. planetarium  *n.*

| | |
| --- | --- |
| 音标 | /ˌplæn.ɪˈtɛr.i.əm/ |
| 中文释义 | 天文馆 |
| 英文释义 | A theater built primarily for presenting educational films about astronomy. |
| freq_rank | 17660 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | planetarium shows | `education` | Students often attend planetarium shows to learn about the universe. | 学生们经常参加天文馆的演出，以了解宇宙。 |
| 2 | local planetarium | `culture` | The local planetarium offers various events for astronomy enthusiasts throughout the year. | 当地的天文馆全年为天文学爱好者提供各种活动。 |
| 3 | planetarium exhibits | `science_tech` | Many planetarium exhibits include interactive displays to engage visitors effectively. | 许多天文馆展览包括互动展示，以有效吸引参观者。 |

### 64. retails  *v.*

| | |
| --- | --- |
| 音标 | /ˈriː.teɪlz/ |
| 中文释义 | 零售 |
| 英文释义 | Sells goods or services directly to consumers. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | retails online | `daily_life` | Businesses that retails online have significantly increased their customer base. | 在线零售的企业显著扩大了他们的客户基础。 |
| 2 | retails at a loss | `work` | The company often retails at a loss to attract new customers in competitive markets. | 为了在竞争激烈的市场中吸引新客户，该公司常常以亏损价格零售。 |
| 3 | retails well during holidays | `culture` | Retailers typically retails well during holidays, boosting overall sales for the year. | 零售商在假期期间通常销售良好，推动了全年的整体销售。 |

### 65. tourists  *n.*

| | |
| --- | --- |
| 音标 | /ˈtʊər.ɪsts/ |
| 中文释义 | 游客 |
| 英文释义 | People who travel to visit new places for leisure or exploration. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | tourists visiting | `travel` | Tourists visiting the historic site often marvel at its architecture. | 游客参观这个历史遗址时，常常惊叹于它的建筑。 |
| 2 | tourists flocking | `culture` | During the summer, tourists flocking to the festival create a vibrant atmosphere. | 夏季时，涌向节日的游客们营造了热闹的氛围。 |
| 3 | tourists' experiences | `education` | Understanding tourists' experiences helps improve local tourism policies for better engagement. | 了解游客的体验有助于改善当地旅游政策，以便更好地吸引游客。 |

### 66. steering  *n.*

| | |
| --- | --- |
| 音标 | /ˈstɪər.ɪŋ/ |
| 中文释义 | 操控；引导 |
| 英文释义 | The act of guiding or controlling the direction of something. |
| freq_rank | 6341 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | steering committee | `work` | The steering committee has made significant progress on the project. | 指导委员会在项目上取得了显著进展。 |
| 2 | steering wheel | `daily_life` | She adjusted the steering wheel to a comfortable position while driving. | 她在开车时将方向盘调整到舒适的位置。 |
| 3 | steering input | `science_tech` | Engineers analyzed the steering input for better vehicle performance. | 工程师分析了操控输入以提升车辆性能。 |

### 67. sources  *n.*

| | |
| --- | --- |
| 音标 | /ˈsɔːr.sɪz/ |
| 中文释义 | 来源 |
| 英文释义 | Providers or origins of information, materials, or support. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | credible sources | `academic` | Researchers must always cite credible sources to support their arguments. | 研究人员必须始终引用可信的来源来支持他们的论点。 |
| 2 | data sources | `science_tech` | Many applications rely on various data sources to function effectively. | 许多应用程序依赖于各种数据来源才能有效运行。 |
| 3 | alternative sources | `work` | In our project, we should explore alternative sources for funding. | 在我们的项目中，我们应该寻找其他资金来源。 |

### 68. bibliography  *n.*

| | |
| --- | --- |
| 音标 | /ˌbɪb.liˈɒɡ.rə.fi/ |
| 中文释义 | 参考书目 |
| 英文释义 | A list of sources used in a written work. |
| freq_rank | 14033 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | bibliography entries | `academic` | Students must include all bibliography entries in their research papers. | 学生必须在研究论文中列出所有参考书目。 |
| 2 | annotated bibliography | `education` | Creating an annotated bibliography helps clarify sources for research projects. | 创建注释书目有助于澄清研究项目中的来源。 |
| 3 | bibliography format | `work` | Understanding the correct bibliography format is crucial for professional writing. | 理解正确的参考书目格式对专业写作至关重要。 |

### 69. records  *n.*

| | |
| --- | --- |
| 音标 | /ˈrɛk.ɔrdz/ |
| 中文释义 | 记录；档案 |
| 英文释义 | Documents that provide evidence or information about something. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | academic records | `education` | Students must submit their academic records when applying for graduate programs. | 学生申请研究生项目时必须提交他们的学术记录。 |
| 2 | health records | `health` | Maintaining accurate health records is crucial for effective patient care. | 维护准确的健康记录对有效的病人护理至关重要。 |
| 3 | public records | `news` | Investigative journalists often analyze public records to uncover stories. | 调查记者常常分析公共记录以挖掘故事。 |

### 70. conducive  *adj.*

| | |
| --- | --- |
| 音标 | /kənˈduː.sɪv/ |
| 中文释义 | 有助于的；有利的 |
| 英文释义 | Making a certain outcome likely or possible. |
| freq_rank | 11002 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | conducive environment | `education` | A supportive classroom is conducive to effective learning for all students. | 一个支持性的课堂有助于所有学生的有效学习。 |
| 2 | conducive factors | `science_tech` | Identifying conducive factors can improve the success rate of scientific experiments. | 识别有利因素可以提高科学实验的成功率。 |
| 3 | conducive relationships | `daily_life` | Building conducive relationships fosters positive interactions among team members. | 建立有利的关系促进团队成员之间的积极互动。 |

### 71. skiing  *n.*

| | |
| --- | --- |
| 音标 | /ˈskiː.ɪŋ/ |
| 中文释义 | 滑雪 |
| 英文释义 | The activity of moving over snow on skis. |
| freq_rank | 4983 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | skiing holiday | `travel` | Families often plan skiing holidays to enjoy winter sports together. | 家庭经常安排滑雪假期，一起享受冬季运动。 |
| 2 | skiing competition | `culture` | Athletes from around the world compete in skiing competitions every winter. | 来自世界各地的运动员每年冬天参加滑雪比赛。 |
| 3 | skiing gear | `daily_life` | Buying quality skiing gear is essential for a safe experience on the slopes. | 购买优质的滑雪装备对于在滑雪道上安全体验至关重要。 |

### 72. blonde  *adj./n.*

| | |
| --- | --- |
| 音标 | /blɒnd/ |
| 中文释义 | 金发的；金发人 |
| 英文释义 | Having light yellowish hair; a person with such hair. |
| freq_rank | 6949 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | blonde hair | `daily_life` | She decided to dye her hair a vibrant blonde. | 她决定把头发染成鲜艳的金色。 |
| 2 | blonde highlights | `culture` | Many women choose to add blonde highlights to their dark hair. | 许多女性选择在深色头发中增加金色挑染。 |
| 3 | blonde model | `work` | The agency is looking for a new blonde model for the campaign. | 该代理机构正在寻找一位新的金发模特来参加宣传活动。 |

### 73. pertain  *v.*

| | |
| --- | --- |
| 音标 | /pərˈteɪn/ |
| 中文释义 | 涉及；有关 |
| 英文释义 | Relate to or have a connection with something. |
| freq_rank | 12205 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | pertaining to the study | `academic` | Research findings pertaining to the study highlighted significant trends in behavior. | 与研究相关的研究结果突出了行为中的重要趋势。 |
| 2 | pertaining to regulations | `work` | Any changes pertaining to regulations must be communicated promptly to all staff. | 与规定相关的任何更改必须及时通知所有员工。 |
| 3 | pertaining to personal matters | `daily_life` | She often discusses issues pertaining to personal matters in her blog. | 她经常在博客中讨论与个人事务相关的问题。 |

### 74. treble  *n./adj./v.*

| | |
| --- | --- |
| 音标 | /ˈtrɛb.əl/ |
| 中文释义 | 三倍，三重；高音部分 |
| 英文释义 | A threefold increase or the highest range in music. |
| freq_rank | 25313 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | treble boost | `work` | Engineers decided to treble the boost to increase performance. | 工程师决定将提升倍数增加到三倍，以提高性能。 |
| 2 | treble figures | `news` | The report indicated that sales figures would treble this quarter. | 报告显示，这个季度的销售额将增长三倍。 |
| 3 | treble costs | `science_tech` | Researchers warned that costs could treble for future projects. | 研究人员警告说，未来项目的成本可能会增加三倍。 |

### 75. deadlock  *n./v.*

| | |
| --- | --- |
| 音标 | /ˈdɛd.lɑk/ |
| 中文释义 | 僵局 |
| 英文释义 | A situation in which no progress can be made. |
| freq_rank | 17906 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | political deadlock | `news` | Negotiations have reached a political deadlock that both sides cannot resolve. | 谈判已陷入双方无法解决的政治僵局。 |
| 2 | deadlock in talks | `work` | The deadlock in talks has delayed the project timeline significantly. | 谈判中的僵局显著延误了项目时间表。 |
| 3 | deadlock situation | `daily_life` | They found themselves in a deadlock situation over the weekend plans. | 他们在周末计划上陷入了僵局。 |

### 76. notes  *n.*

| | |
| --- | --- |
| 音标 | /noʊts/ |
| 中文释义 | 笔记 |
| 英文释义 | Written records or comments for reference or study. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | lecture notes | `education` | Students often review their lecture notes to prepare for exams. | 学生们经常复习他们的讲座笔记以备考。 |
| 2 | meeting notes | `work` | After the meeting, she shared the meeting notes with her team for clarity. | 会议结束后，她将会议笔记与团队分享以便于理解。 |
| 3 | field notes | `science_tech` | Researchers documented their observations in field notes during the expedition. | 研究人员在探险期间将他们的观察记录在野外笔记中。 |

### 77. calamity  *n.*

| | |
| --- | --- |
| 音标 | /kəˈlæm.ɪ.ti/ |
| 中文释义 | 灾难 |
| 英文释义 | An event causing great damage or distress, often sudden. |
| freq_rank | 12502 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | natural calamity | `environment` | Natural calamities have devastating impacts on communities and economies worldwide. | 自然灾害对全球社区和经济造成毁灭性影响。 |
| 2 | human-made calamities | `news` | Human-made calamities can lead to severe environmental and social consequences. | 人为灾害可能导致严重的环境和社会后果。 |
| 3 | calamity strikes | `daily_life` | When calamity strikes, families often struggle to rebuild their lives afterwards. | 当灾难来临时，家庭往往难以重建生活。 |

### 78. weeds  *n.*

| | |
| --- | --- |
| 音标 | /wiːdz/ |
| 中文释义 | 杂草 |
| 英文释义 | Unwanted plants that grow in cultivated areas, often hindering growth. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | pulling weeds | `daily_life` | Many people find pulling weeds to be a therapeutic gardening activity. | 许多人发现拔杂草是一种疗愈的园艺活动。 |
| 2 | treating weeds | `environment` | Farmers are developing new methods for treating weeds without harming crops. | 农民们在开发新方法，以处理杂草而不伤害作物。 |
| 3 | weeds control | `science_tech` | Advancements in biotechnology are improving weeds control techniques significantly. | 生物技术的进步正在显著改善杂草控制技术。 |

### 79. computers  *n.*

| | |
| --- | --- |
| 音标 | /kəmˈpjuː.tərz/ |
| 中文释义 | 计算机；电脑 |
| 英文释义 | Electronic devices for processing and storing data. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | computers are essential in modern education. | `education` | In today's classrooms, computers are essential for effective learning. | 在当今的课堂上，计算机对有效学习至关重要。 |
| 2 | computers have revolutionized the workplace. | `work` | Significantly, computers have revolutionized the way businesses operate and communicate. | 显著地，计算机彻底改变了企业的运营和沟通方式。 |
| 3 | computers can enhance scientific research. | `science_tech` | Researchers believe that computers can enhance scientific research by analyzing complex data. | 研究人员认为，计算机可以通过分析复杂数据来增强科学研究。 |

### 80. engineers  *n.*

| | |
| --- | --- |
| 音标 | /ˌɛn.dʒɪˈnɪrz/ |
| 中文释义 | 工程师 |
| 英文释义 | Professionals who design, build, and maintain complex systems or structures. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | engineers work | `work` | Many engineers work tirelessly to develop sustainable energy solutions. | 许多工程师不懈努力，开发可持续的能源解决方案。 |
| 2 | civil engineers | `academic` | Civil engineers play a crucial role in infrastructure development and urban planning. | 土木工程师在基础设施建设和城市规划中扮演着至关重要的角色。 |
| 3 | software engineers | `science_tech` | Software engineers are essential for creating innovative applications and technologies. | 软件工程师在创建创新应用程序和技术方面至关重要。 |

### 81. activities  *n.*

| | |
| --- | --- |
| 音标 | /ækˈtɪv.ɪ.tiz/ |
| 中文释义 | 活动 |
| 英文释义 | Various pursuits or actions undertaken for enjoyment or achievement. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | extracurricular activities | `education` | Students often benefit from participating in extracurricular activities beyond academics. | 学生们常常受益于参与学业之外的课外活动。 |
| 2 | leisure activities | `daily_life` | On weekends, many people prefer engaging in leisure activities to unwind. | 许多人在周末喜欢参与休闲活动来放松自己。 |
| 3 | research activities | `science_tech` | The scientists presented their findings based on extensive research activities conducted over several years. | 科学家们展示了他们基于多年广泛研究活动得出的发现。 |

### 82. stones  *n.*

| | |
| --- | --- |
| 音标 | /stoʊnz/ |
| 中文释义 | 石头；岩石 |
| 英文释义 | Solid mineral matter found on the earth's surface. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | precious stones | `culture` | Many cultures attribute unique meanings to precious stones and their properties. | 许多文化赋予宝石及其特性独特的意义。 |
| 2 | river stones | `environment` | River stones can significantly impact aquatic ecosystems and their biodiversity. | 河流中的石头可以显著影响水生生态系统及其生物多样性。 |
| 3 | polished stones | `daily_life` | He collects polished stones from various locations to display at home. | 他从不同地方收集抛光石头以在家中展示。 |

### 83. trees  *n.*

| | |
| --- | --- |
| 音标 | /triːz/ |
| 中文释义 | 树木 |
| 英文释义 | Woody perennial plants, typically having a single stem or trunk. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | leafy trees | `environment` | Leafy trees provide shade and improve air quality in urban areas. | 树木繁茂的树木在城市区域提供阴凉和改善空气质量。 |
| 2 | fruit trees | `daily_life` | Many families enjoy planting fruit trees to provide fresh produce at home. | 许多家庭喜欢种植果树，以便在家中提供新鲜农产品。 |
| 3 | shade trees | `education` | Shade trees are essential for creating comfortable outdoor learning environments for students. | 遮荫树对为学生创造舒适的户外学习环境至关重要。 |

### 84. sprint  *n./v.*

| | |
| --- | --- |
| 音标 | /sprɪnt/ |
| 中文释义 | 冲刺；短跑 |
| 英文释义 | A short, fast run; a burst of speed over a distance. |
| freq_rank | 8582 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | sprint training | `work` | Many athletes engage in sprint training to improve their speed. | 许多运动员进行冲刺训练以提高他们的速度。 |
| 2 | sprint finish | `daily_life` | In the final moments of the race, he made a sprint finish. | 在比赛的最后时刻，他进行了冲刺冲刺。 |
| 3 | sprint event | `culture` | The sprint event at the Olympics always draws massive crowds. | 奥运会的短跑项目总是吸引大量观众。 |

### 85. inapt  *adj.*

| | |
| --- | --- |
| 音标 | /ɪˈnæpt/ |
| 中文释义 | 不适当的；不合适的 |
| 英文释义 | Not suitable or appropriate; lacking skill or ability. |
| freq_rank | 45011 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | inapt comments | `news` | Politicians often make inapt comments that alienate their constituents. | 政治家常常发表不适当的评论，使选民疏远。 |
| 2 | inapt remarks | `work` | Her inapt remarks during the meeting created unnecessary tension among the team. | 她在会议上的不合适言论给团队带来了不必要的紧张气氛。 |
| 3 | inapt analogy | `education` | The teacher's inapt analogy confused the students rather than clarifying the concept. | 老师的不恰当类比让学生感到困惑，而不是帮助他们理解这个概念。 |

### 86. working  *n./adj.*

| | |
| --- | --- |
| 音标 | /ˈwɜr.kɪŋ/ |
| 中文释义 | 工作；运作 |
| 英文释义 | Performing tasks or duties, usually for payment. |
| freq_rank | 2819 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | working hours | `work` | Many employees prefer flexible working hours to improve their lives. | 许多员工更喜欢灵活的工作时间来改善生活。 |
| 2 | working conditions | `daily_life` | The factory must improve its working conditions for better safety. | 工厂必须改善其工作条件以提升安全性。 |
| 3 | working on a project | `academic` | Students are currently working on a project about climate change. | 学生们目前正在进行一项关于气候变化的项目。 |

### 87. pounce  *n./v.*

| | |
| --- | --- |
| 音标 | /paʊns/ |
| 中文释义 | 突袭；猛扑 |
| 英文释义 | To spring or leap suddenly to seize something. |
| freq_rank | 12494 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | pounce on | `news` | Critics pounced on the report, questioning its accuracy and intent. | 批评者突袭这份报告，质疑其准确性和意图。 |
| 2 | pounce at | `academic` | Researchers pounce at opportunities to explore new theories and methodologies. | 研究人员抓住机会探索新的理论和方法。 |
| 3 | pounce upon | `daily_life` | Children often pounce upon their friends when playing tag outside. | 孩子们在外面玩捉迷藏时，经常会突然扑向他们的朋友。 |

### 88. scotsman  *n.*

| | |
| --- | --- |
| 音标 | /ˈskɑts.mən/ |
| 中文释义 | 苏格兰人 |
| 英文释义 | A man from Scotland, often characterized by specific cultural traits. |
| freq_rank | 8969 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | Scotsman in traditional dress | `culture` | A Scotsman in traditional dress participated in the festival. | 一位穿着传统服装的苏格兰人在节日中参加了活动。 |
| 2 | Scotsman won the award | `news` | Yesterday, a Scotsman won the prestigious literary award. | 昨天，一位苏格兰人获得了著名的文学奖。 |
| 3 | famous Scotsman | `education` | We studied a famous Scotsman during our history lessons. | 在我们的历史课上，我们学习了一位著名的苏格兰人。 |

### 89. multilateral  *adj.*

| | |
| --- | --- |
| 音标 | /ˌmʌl.tɪˈlæt.ər.əl/ |
| 中文释义 | 多边的 |
| 英文释义 | Involving multiple countries or parties for a common goal. |
| freq_rank | 9356 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | multilateral agreements | `news` | Countries signed several multilateral agreements to address climate change. | 各国签署了多个多边协议以应对气候变化。 |
| 2 | multilateral cooperation | `academic` | Multilateral cooperation is essential for solving global health issues effectively. | 多边合作对于有效解决全球健康问题至关重要。 |
| 3 | multilateral negotiations | `work` | Negotiators held multilateral negotiations to reach a trade deal last week. | 谈判人员上周举行了多边谈判以达成贸易协议。 |

### 90. toil  *n./v.*

| | |
| --- | --- |
| 音标 | /tɔɪl/ |
| 中文释义 | 辛劳；苦工 |
| 英文释义 | Hard, continuous work or effort, often with difficulty. |
| freq_rank | 13009 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | toil away | `work` | Workers toil away in the fields from dawn until dusk. | 工人们从黎明到黄昏在田地里辛劳工作。 |
| 2 | toil and trouble | `culture` | The phrase 'toil and trouble' evokes a sense of foreboding in literature. | “辛劳与麻烦”这个短语在文学中引发了一种不祥的感觉。 |
| 3 | toil for success | `education` | Students must toil for success to achieve their academic goals. | 学生必须辛勤努力才能实现他们的学术目标。 |

### 91. psycholinguistics  *n.*

| | |
| --- | --- |
| 音标 | /ˌsaɪ.koʊ.lɪŋˈɡwɪs.tɪks/ |
| 中文释义 | 心理语言学 |
| 英文释义 | The study of the relationship between language and the mind. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | psycholinguistics research | `academic` | Researchers in psycholinguistics research how language acquisition occurs in children. | 心理语言学研究人员研究儿童是如何获得语言的。 |
| 2 | psycholinguistics theory | `education` | This course covers psycholinguistics theory and its applications in teaching methods. | 这门课程涵盖心理语言学理论及其在教学方法中的应用。 |
| 3 | psycholinguistics findings | `science_tech` | Recent psycholinguistics findings suggest a strong link between language and cognitive processes. | 最近的心理语言学研究结果表明，语言与认知过程之间有很强的联系。 |

### 92. planner  *n.*

| | |
| --- | --- |
| 音标 | /ˈplæn.ər/ |
| 中文释义 | 计划者 |
| 英文释义 | A person who makes plans or organizes events. |
| freq_rank | 4500 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | event planner | `work` | Many companies hire an event planner to manage their conferences effectively. | 许多公司雇用活动策划者来有效管理他们的会议。 |
| 2 | financial planner | `daily_life` | Individuals often consult a financial planner for investment advice and retirement planning. | 个人通常咨询财务规划师以获得投资建议和退休计划。 |
| 3 | urban planner | `academic` | An urban planner designs city layouts to improve community functionality and livability. | 城市规划者设计城市布局，以改善社区的功能性和宜居性。 |

### 93. aisle  *n.*

| | |
| --- | --- |
| 音标 | /aɪl/ |
| 中文释义 | 走道；通道 |
| 英文释义 | A passageway between rows of seats or shelves. |
| freq_rank | 4484 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | aisle seat | `travel` | Many travelers prefer an aisle seat for easier access to the restroom. | 许多旅客更喜欢走道座位，以便更方便地使用洗手间。 |
| 2 | grocery aisle | `daily_life` | He walked down the grocery aisle searching for fresh vegetables. | 他在超市走道里走着，寻找新鲜的蔬菜。 |
| 3 | church aisle | `culture` | The bride walked gracefully down the church aisle to her waiting groom. | 新娘优雅地走过教堂走道，走向等待的新郎。 |

### 94. healthcare  *n.*

| | |
| --- | --- |
| 音标 | /ˈhɛlθ.kɛr/ |
| 中文释义 | 医疗保健 |
| 英文释义 | The organized provision of medical services to maintain health. |
| freq_rank | 13229 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | healthcare system | `news` | Many countries are reforming their healthcare systems to improve efficiency and accessibility. | 许多国家正在改革其医疗保健系统，以提高效率和可及性。 |
| 2 | healthcare professionals | `work` | Healthcare professionals play a vital role in ensuring patient safety and providing quality care. | 医疗保健专业人员在确保患者安全和提供优质护理方面发挥着至关重要的作用。 |
| 3 | healthcare services | `daily_life` | Access to affordable healthcare services is essential for maintaining public welfare. | 获得负担得起的医疗保健服务对于维护公共福利至关重要。 |

### 95. printed  *adj.*

| | |
| --- | --- |
| 音标 | /ˈprɪn.tɪd/ |
| 中文释义 | 印刷的 |
| 英文释义 | Produced by a printing process on a surface like paper. |
| freq_rank | 7122 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | printed materials | `work` | Many companies use printed materials for their marketing campaigns. | 许多公司在营销活动中使用印刷材料。 |
| 2 | printed circuit board | `science_tech` | Engineers design printed circuit boards for electronic devices. | 工程师为电子设备设计印刷电路板。 |
| 3 | printed text | `education` | Students often highlight important sections in printed text during class. | 学生们在课堂上经常在印刷文本中标记重要部分。 |

### 96. agencies  *n.*

| | |
| --- | --- |
| 音标 | /ˈeɪ.dʒən.siz/ |
| 中文释义 | 机构；代理处 |
| 英文释义 | Organizations that provide specific services or functions. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | government agencies | `news` | Government agencies are often responsible for implementing new policies. | 政府机构通常负责实施新政策。 |
| 2 | non-profit agencies | `work` | Many non-profit agencies rely on donations to support their missions. | 许多非营利机构依赖捐款来支持他们的使命。 |
| 3 | advertising agencies | `daily_life` | Choosing the right advertising agencies can significantly affect a brand's success. | 选择合适的广告机构可以显著影响品牌的成功。 |

### 97. miles  *n.*

| | |
| --- | --- |
| 音标 | /maɪlz/ |
| 中文释义 | 英里；里程 |
| 英文释义 | A unit of distance equal to 5,280 feet. |
| freq_rank | 6229 |
| 难度档 | B2 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | miles away | `daily_life` | She lives just a few miles away from the city center. | 她住在离市中心只有几英里的地方。 |
| 2 | miles per hour | `science_tech` | The vehicle was traveling at sixty miles per hour on the highway. | 这辆车在高速公路上以每小时六十英里的速度行驶。 |
| 3 | miles of | `environment` | They cleared miles of forest to make room for new development. | 他们清理了数英里的森林以腾出空间用于新开发。 |

### 98. actions  *n.*

| | |
| --- | --- |
| 音标 | /ˈæk.ʃənz/ |
| 中文释义 | 行为；动作 |
| 英文释义 | The processes of doing something to achieve a goal. |
| freq_rank | — |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | take decisive actions | `work` | Effective leaders must take decisive actions to implement their strategies successfully. | 有效的领导者必须采取果断的行动，以成功实施他们的战略。 |
| 2 | illegal actions | `news` | The investigation revealed numerous illegal actions by several high-profile individuals. | 调查揭示了几位高调人士的众多非法行为。 |
| 3 | voluntary actions | `culture` | Many people engage in voluntary actions to support their communities during crises. | 许多人在危机期间参与志愿行动，以支持他们的社区。 |

### 99. planning  *n.*

| | |
| --- | --- |
| 音标 | /ˈplæn.ɪŋ/ |
| 中文释义 | 规划；计划 |
| 英文释义 | The process of making plans for something. |
| freq_rank | 2169 |
| 难度档 | B1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | urban planning | `work` | Many cities are focusing on urban planning to improve living conditions. | 许多城市正在专注于城市规划，以改善生活条件。 |
| 2 | event planning | `daily_life` | She is known for her skills in event planning and organization. | 她以在活动规划和组织方面的技能而闻名。 |
| 3 | financial planning | `academic` | Financial planning helps individuals manage their money effectively over time. | 财务规划帮助个人有效地管理他们的资金。 |

### 100. housekeeping  *n.*

| | |
| --- | --- |
| 音标 | /ˈhaʊsˌkiː.pɪŋ/ |
| 中文释义 | 家务管理 |
| 英文释义 | The organization and management of household tasks and activities. |
| freq_rank | 14891 |
| 难度档 | C1 |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
| 1 | housekeeping staff | `work` | Many hotels employ housekeeping staff to maintain cleanliness and order. | 许多酒店雇佣家务管理人员来保持清洁和整齐。 |
| 2 | housekeeping duties | `daily_life` | She took on various housekeeping duties to help her family manage the home. | 她承担了各种家务管理工作来帮助家人管理家务。 |
| 3 | housekeeping policies | `academic` | The study analyzed the impact of housekeeping policies on hotel efficiency. | 这项研究分析了家务管理政策对酒店效率的影响。 |
