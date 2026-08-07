# D 段 词块 tier1 · 送审件(100 条)

四类定额:**phrasal_verb** 35 · **collocation_ext** 30 · **frame** 20 · **connector** 15

## 🔴 人审必看:phrasal_verb 可分性(规则表判定 + 逐条人扫)

**可分性不由模型写** —— 上一轮让它写,四条错两条(`set up` / `take on` 明明可分,
却被写成"宾语不插中间")。**写错比不写更糟**,学生会照着写出病句。
也不假装有数据源:ECDICT 没有可分性标注。

所以走**规则表判定**,依据一并列出;两栖词(on / over / around / through)**不猜,标待人工**。
这一栏请逐条扫一眼,100 条几分钟:

| 词块 | 判定 | 依据 |
| --- | --- | --- |
| look into | 不可分 | 介词 into |
| come up with | 不可分 | 三词短语动词 |
| set up | 可分 | 副词小品词 up |
| carry on | 不可分 | 本义不及物,carry sth on 罕用不教 |
| find out | 可分 | 副词小品词 out |
| turn down | 可分 | 副词小品词 down |
| figure out | 可分 | 副词小品词 out |
| take over | 可分 | Aaron 人工裁决 |
| make up | 可分 | 副词小品词 up |
| come across | 不可分 | across 为介词 |
| run into | 不可分 | 介词 into |
| look after | 不可分 | 介词 after |
| put off | 可分 | 副词小品词 off |
| bring up | 可分 | 副词小品词 up |
| break down | 可分 | 副词小品词 down |
| give up | 可分 | 副词小品词 up |
| take off | 可分 | 副词小品词 off |
| pick up | 可分 | 副词小品词 up |
| turn up | 可分 | 副词小品词 up |
| set off | 可分 | 副词小品词 off |
| look forward to | 不可分 | 三词短语动词 |
| put up with | 不可分 | 三词短语动词 |
| turn out | 不可分 | 「结果是」义不及物(It turned out that…) |
| call off | 可分 | 副词小品词 off |
| go on | 不可分 | Aaron 人工裁决 |
| put out | 可分 | 副词小品词 out |
| show up | 不可分 | 「露面」义不及物 |
| back up | 可分 | 副词小品词 up |
| take on | 可分 | Aaron 人工裁决 |
| break out | 不可分 | 「爆发」义不及物,无 break sth out |
| take apart | 可分 | Aaron 人工裁决 |
| go over | 不可分 | go 不及物,over 为介词 |
| bring about | 不可分 | 介词 about |
| cut down on | 不可分 | 三词短语动词 |
| give away | 可分 | 副词小品词 away |

⚠️ **按类分批生成,不让模型自选类别** —— 自选必然偏向最好写的 phrasal_verb,
100 条能出 80 条 `look after` 型。

⚠️ **connector 的 def_zh 必须点出使用边界**(什么时候不能用),已做成机器闸。
只给「因此」的话,`as a result` / `therefore` / `thus` 在学生眼里没有区别。

## phrasal_verb(35 条)

| 词块 | 释义 | 例句 | 中译 |
| --- | --- | --- | --- |
| look into | 调查(look into sth,宾语不插中间) | The manager promised to look into the issue by tomorrow. | 经理承诺在明天之前调查这个问题。 |
| come up with | 想出(come up with sth,宾语不插中间) | She came up with a brilliant idea for the project. | 她为这个项目想出了一个绝妙的主意。 |
| set up | 建立(set sth up 可分,代词须插中间) | They set up the new system in just two days. | 他们在短短两天内建立了新系统。 |
| carry on | 继续(不及物,不带宾语) | Despite the difficulties, they decided to carry on with the plan. | 尽管困难重重,他们决定继续执行计划。 |
| find out | 查明(find sth out 可分,代词须插中间) | She needs to find out the truth about her family. | 她需要查明关于她家庭的真相。 |
| turn down | 拒绝(turn sth down 可分,代词须插中间) | He decided to turn down the job offer. | 他决定拒绝这份工作邀请。 |
| figure out | 弄清楚(figure sth out 可分,代词须插中间) | I can't figure out how to solve this problem. | 我无法弄清楚如何解决这个问题。 |
| take over | 接管(take sth over 可分,代词须插中间) | The company will take over the smaller firm next month. | 这家公司将于下个月接管这家小公司。 |
| make up | 组成(make sth up 可分,代词须插中间) | Water makes up about 70% of the human body. | 水约占人体的 70%。 |
| come across | 偶然遇到(come across sth,宾语不插中间) | I came across an old friend at the market yesterday. | 我昨天在市场上偶然遇到了一位老朋友。 |
| run into | 偶然碰到(run into sth,宾语不插中间) | I ran into my teacher at the bookstore. | 我在书店偶然碰到了我的老师。 |
| look after | 照顾(look after sth,宾语不插中间) | She looks after her younger brother every weekend. | 她每个周末都照顾她的弟弟。 |
| put off | 推迟(put sth off 可分,代词须插中间) | They decided to put off the meeting until next week. | 他们决定将会议推迟到下周。 |
| bring up | 提起(bring sth up 可分,代词须插中间) | She brought up an interesting point during the discussion. | 她在讨论中提起了一个有趣的观点。 |
| break down | 分解(break sth down 可分,代词须插中间) | The scientist broke down the complex process into simple steps. | 科学家将复杂的过程分解成简单的步骤。 |
| give up | 放弃(give sth up 可分,代词须插中间) | She decided to give up smoking for her health. | 她决定为了健康而放弃吸烟。 |
| take off | 脱下(take sth off 可分,代词须插中间) | He took off his coat and hung it by the door. | 他脱下外套，挂在门边。 |
| pick up | 捡起(pick sth up 可分,代词须插中间) | He picked up the book from the floor. | 他从地上捡起了书。 |
| turn up | 出现(turn sth up 可分,代词须插中间) | He turned up at the party unexpectedly. | 他出乎意料地出现在聚会上。 |
| set off | 出发(set sth off 可分,代词须插中间) | They set off on their journey early in the morning. | 他们一大早就出发了。 |
| look forward to | 期待(look forward to sth,宾语不插中间) | I look forward to the weekend. | 我期待着周末。 |
| put up with | 忍受(put up with sth,宾语不插中间) | She can't put up with the noise any longer. | 她再也无法忍受这种噪音了。 |
| turn out | 结果是(不及物,不带宾语) | It turned out that the weather was perfect for a picnic. | 结果天气非常适合野餐。 |
| call off | 取消(call sth off 可分,代词须插中间) | They had to call off the event due to rain. | 他们不得不因为下雨取消活动。 |
| go on | 继续(不及物,不带宾语) | After a short break, they went on with their work. | 短暂休息后，他们继续工作。 |
| put out | 扑灭(put sth out 可分,代词须插中间) | Firefighters managed to put out the fire quickly. | 消防员迅速扑灭了火灾。 |
| show up | 露面(不及物,不带宾语) | He didn't show up for the meeting. | 他没有出席会议。 |
| back up | 支持(back sth up 可分,代词须插中间) | She always backs up her arguments with evidence. | 她总是用证据支持她的论点。 |
| take on | 承担(take sth on 可分,代词须插中间) | She decided to take on more responsibilities at work. | 她决定在工作中承担更多责任。 |
| break out | 爆发(不及物,不带宾语) | A fire broke out in the building last night. | 昨晚大楼里发生了火灾。 |
| take apart | 拆开(take sth apart 可分,代词须插中间) | He took apart the computer to fix it. | 他拆开了电脑进行修理。 |
| go over | 复习(go over sth,宾语不插中间) | Let's go over the main points of the lecture. | 让我们复习一下讲座的要点。 |
| bring about | 导致(bring about sth,宾语不插中间) | The new policy will bring about significant changes. | 新政策将带来重大变革。 |
| cut down on | 减少(cut down on sth,宾语不插中间) | She needs to cut down on sugar for her health. | 为了健康，她需要减少糖的摄入。 |
| give away | 赠送(give sth away 可分,代词须插中间) | She decided to give away her old clothes to charity. | 她决定把旧衣服捐赠给慈善机构。 |

## collocation_ext(30 条)

| 词块 | 释义 | 例句 | 中译 |
| --- | --- | --- | --- |
| a wide range of | 各种各样的(后接复数名词) | The library offers a wide range of resources for students. | 图书馆为学生提供各种各样的资源。 |
| play a key role | 发挥关键作用 | Effective communication plays a key role in team success. | 有效的沟通在团队成功中发挥关键作用。 |
| take into account | 考虑到 | We need to take into account the potential risks before proceeding. | 在继续之前，我们需要考虑到潜在的风险。 |
| based on | 基于 | The decision was made based on the latest data. | 这个决定是基于最新数据做出的。 |
| in order to | 为了 | He studied hard in order to pass the exam. | 他努力学习为了通过考试。 |
| as well as | 以及 | The course covers biology as well as chemistry. | 这门课程涵盖生物学以及化学。 |
| due to | 由于 | The event was canceled due to bad weather. | 活动因恶劣天气取消。 |
| pay attention to | 注意 | Students should pay attention to the teacher's instructions. | 学生应该注意老师的指示。 |
| in relation to | 关于 | The report discusses climate change in relation to agriculture. | 报告讨论了气候变化与农业的关系。 |
| in charge of | 负责 | She is in charge of the marketing department. | 她负责市场部。 |
| in response to | 回应 | The company issued a statement in response to the allegations. | 公司发布声明回应指控。 |
| take advantage of | 利用 | We should take advantage of the new technology. | 我们应该利用新技术。 |
| in favor of | 赞成 | The majority voted in favor of the new policy. | 多数人投票赞成新政策。 |
| be aware of | 意识到 | You should be aware of the potential risks. | 你应该意识到潜在的风险。 |
| in line with | 符合 | The new procedures are in line with company policy. | 新程序符合公司政策。 |
| be capable of | 能够 | This robot is capable of learning new tasks. | 这个机器人能够学习新任务。 |
| be familiar with | 熟悉 | He is familiar with the company's procedures. | 他熟悉公司的程序。 |
| in accordance with | 依照 | The project was completed in accordance with the guidelines. | 项目依照指导方针完成。 |
| be involved in | 参与 | She is involved in several research projects. | 她参与了几个研究项目。 |
| be responsible for | 负责 | He is responsible for managing the team. | 他负责管理团队。 |
| be likely to | 可能 | The weather is likely to improve tomorrow. | 天气明天可能会好转。 |
| be similar to | 类似于 | The new design is similar to the previous model. | 新设计类似于之前的型号。 |
| play a significant role | 发挥重要作用 | Education plays a significant role in shaping a person's future. | 教育在塑造一个人的未来中发挥重要作用。 |
| make a difference | 产生影响 | Volunteers can make a difference in the lives of many children. | 志愿者可以对许多孩子的生活产生影响。 |
| have access to | 有权使用 | Students should have access to the latest technology in the classroom. | 学生应该有权在教室使用最新技术。 |
| be dependent on | 依赖于 | The local economy is heavily dependent on tourism. | 当地经济严重依赖于旅游业。 |
| carry out research | 进行研究 | The team will carry out research on climate change impacts. | 该团队将进行气候变化影响的研究。 |
| play an important role | 发挥重要作用 | Education plays an important role in economic development. | 教育在经济发展中发挥着重要作用。 |
| pose a threat to | 对…构成威胁 | Pollution poses a threat to marine life in the ocean. | 污染对海洋生物构成威胁。 |
| make an effort to | 努力去... | Students should make an effort to improve their grades. | 学生们应该努力提高他们的成绩。 |

## frame(20 条)

| 词块 | 释义 | 例句 | 中译 |
| --- | --- | --- | --- |
| it is clear that... | 显而易见的是(句首,引出显见事实,学术或新闻) | It is clear that climate change affects biodiversity globally. | 显而易见的是,气候变化在全球范围内影响生物多样性。 |
| it is possible that... | 有可能的是(句首,引出假设或可能性,学术或新闻) | It is possible that new technologies will solve this issue. | 有可能的是,新技术会解决这个问题。 |
| it is important to... | 重要的是(句首,强调某事的重要性) | It is important to understand the basics before moving on. | 重要的是在继续之前理解基础知识。 |
| the fact that... | 事实是(句首或句中,用于强调事实) | The fact that the company is expanding is promising. | 公司正在扩张的事实令人期待。 |
| there is a need for... | 有必要(句首,引出需求或建议) | There is a need for improved communication within the team. | 团队内部有必要提高沟通。 |
| it is unlikely that... | 不太可能(句首,引出否定可能性) | It is unlikely that the experiment will yield different results. | 实验不太可能得出不同的结果。 |
| it is essential that... | 至关重要的是(句首,引出必须做的事) | It is essential that patients follow the prescribed treatment plan. | 至关重要的是患者遵循规定的治疗计划。 |
| it is worth mentioning that... | 值得一提的是(句首,引出补充信息) | It is worth mentioning that the event was a huge success. | 值得一提的是,活动非常成功。 |
| it is not surprising that... | 不足为奇的是(句首,引出合理结果) | It is not surprising that the movie won several awards. | 这部电影获得多个奖项不足为奇。 |
| the extent to which... | 在多大程度上(句中,用于讨论程度) | The extent to which this will impact the economy is still unknown. | 这将对经济产生多大影响尚不清楚。 |
| it is assumed that... | 假设是(句首,用于引出假设或观点) | It is assumed that the results will be consistent across trials. | 假设各次试验的结果将是一致的。 |
| there is no denying that... | 不可否认的是(句首,引出无可争议的事实) | There is no denying that exercise is beneficial for health. | 不可否认的是,锻炼对健康有益。 |
| what matters most is that... | 最重要的是(句首,强调重点) | What matters most is that we learn from our mistakes. | 最重要的是我们从错误中学习。 |
| it is recommended that... | 建议(句首,用于提出建议) | It is recommended that you drink plenty of water during the day. | 建议您在一天中多喝水。 |
| it is evident that... | 显然(句首,用于引出明显结论) | It is evident that climate change is affecting global weather patterns. | 显然,气候变化正在影响全球天气模式。 |
| it is believed that... | 人们相信(句首,引出普遍观点或假设) | It is believed that the universe is constantly expanding. | 人们相信宇宙在不断膨胀。 |
| it is likely that... | 很可能(句首,引出可能性) | It is likely that the new policy will be implemented next year. | 新政策很可能在明年实施。 |
| the reason why... | 原因是(句中或句首,用于解释原因) | The reason why the project was delayed is still unclear. | 项目延期的原因尚不清楚。 |
| it is unfortunate that... | 不幸的是(句首,引出遗憾或不好的消息) | It is unfortunate that the event was canceled due to the weather. | 不幸的是,由于天气原因,活动被取消。 |
| it is noteworthy that... | 值得注意的是(句首,强调重要信息) | It is noteworthy that the study received widespread attention. | 值得注意的是,这项研究受到了广泛关注。 |

## connector(15 条)

| 词块 | 释义 | 例句 | 中译 |
| --- | --- | --- | --- |
| as a result | 因此(须有明确因果,不作泛泛承接) | The experiment failed, and as a result, the hypothesis was rejected. | 实验失败,因此假设被否定了。 |
| on the contrary | 恰恰相反(纠正前句,非对比) | Some believe the policy will harm the economy; on the contrary, it could boost growth. | 一些人认为该政策会损害经济;恰恰相反,它可能促进增长。 |
| in addition | 此外(用于补充,不用于递进) | The study was successful; in addition, it received international recognition. | 这项研究取得了成功；此外,还获得了国际认可。 |
| in other words | 换句话说(用于解释,不用于总结) | The results were inconclusive; in other words, more research is needed. | 结果尚不明确；换句话说,还需要更多研究。 |
| on the other hand | 另一方面(用于对比,不用于转折) | The economy is growing; on the other hand, unemployment remains high. | 经济在增长；另一方面,失业率仍然很高。 |
| for example | 例如(用于举例,不用于列举) | Many animals are endangered; for example, the giant panda is at risk. | 许多动物濒临灭绝；例如,大熊猫正面临危险。 |
| as a consequence | 结果是(有明确因果,非泛泛承接) | The experiment failed; as a consequence, the hypothesis was rejected. | 实验失败了；结果是,假设被否定了。 |
| in fact | 事实上(用于强调,不用于转折) | He claimed to be an expert; in fact, he had no experience. | 他自称是专家；事实上,他没有经验。 |
| in summary | 总结来说(用于总结,不用于解释) | In summary, the project was a success despite initial challenges. | 总结来说,尽管最初面临挑战,该项目取得了成功。 |
| in contrast | 相比之下(比较两者,不纠正前句) | The north is cold; in contrast, the south is warm and sunny. | 北方寒冷；相比之下,南方温暖而阳光明媚。 |
| as a result of | 由于(表示原因,不用于结果) | The river flooded as a result of heavy rainfall. | 由于降雨量大,河流泛滥了。 |
| in particular | 尤其是(用于强调,不用于列举) | European art is diverse; in particular, Italian Renaissance art is notable. | 欧洲艺术多样化；尤其是,意大利文艺复兴艺术尤为显著。 |
| in conclusion | 总之(用于结尾,不用于过渡) | In conclusion, climate change is a pressing global issue. | 总之,气候变化是一个紧迫的全球性问题。 |
| in spite of | 尽管(用于让步,不用于因果) | In spite of the rain, we decided to go hiking. | 尽管下雨,我们还是决定去远足。 |
| as long as | 只要(用于条件,不用于时间) | You can join the meeting as long as you finish your work. | 只要你完成工作,就可以参加会议。 |

