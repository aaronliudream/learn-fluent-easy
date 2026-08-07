-- ✅ DONE 2026-08-07 已执行,库内实证:vocab_chunks 中非 idiom 词块恰 100 条
-- D 段 词块 tier1 —— 100 条
-- 四类定额:phrasal_verb 35 / collocation_ext 30 / frame 20 / connector 15
-- ⚠️ 一条都没有 idiom —— 那是 H 段的,k1 闸门硬卡。
-- 幂等:ON CONFLICT (lower(chunk)) 更新。⚠️ 由 Aaron 执行。

BEGIN;

SELECT 'BEFORE' AS stage, count(*) AS chunks FROM vocab_chunks;

INSERT INTO vocab_chunks (chunk, type, translation_zh, scene, example_en, example_zh, freq_rank)
VALUES
  ('a wide range of', 'collocation_ext', '各种各样的(后接复数名词)', 'academic', 'The library offers a wide range of resources for students.', '图书馆为学生提供各种各样的资源。', 1),
  ('play a key role', 'collocation_ext', '发挥关键作用', 'work', 'Effective communication plays a key role in team success.', '有效的沟通在团队成功中发挥关键作用。', 2),
  ('take into account', 'collocation_ext', '考虑到', 'work', 'We need to take into account the potential risks before proceeding.', '在继续之前，我们需要考虑到潜在的风险。', 3),
  ('it is clear that...', 'frame', '显而易见的是(句首,引出显见事实,学术或新闻)', 'academic', 'It is clear that climate change affects biodiversity globally.', '显而易见的是,气候变化在全球范围内影响生物多样性。', 4),
  ('it is possible that...', 'frame', '有可能的是(句首,引出假设或可能性,学术或新闻)', 'science_tech', 'It is possible that new technologies will solve this issue.', '有可能的是,新技术会解决这个问题。', 5),
  ('as a result', 'connector', '因此(须有明确因果,不作泛泛承接)', 'academic', 'The experiment failed, and as a result, the hypothesis was rejected.', '实验失败,因此假设被否定了。', 6),
  ('on the contrary', 'connector', '恰恰相反(纠正前句,非对比)', 'news', 'Some believe the policy will harm the economy; on the contrary, it could boost growth.', '一些人认为该政策会损害经济;恰恰相反,它可能促进增长。', 7),
  ('look into', 'phrasal_verb', '调查(look into sth,宾语不插中间)', 'work', 'The manager promised to look into the issue by tomorrow.', '经理承诺在明天之前调查这个问题。', 8),
  ('come up with', 'phrasal_verb', '想出(come up with sth,宾语不插中间)', 'work', 'She came up with a brilliant idea for the project.', '她为这个项目想出了一个绝妙的主意。', 9),
  ('set up', 'phrasal_verb', '建立(set sth up 可分,代词须插中间)', 'work', 'They set up the new system in just two days.', '他们在短短两天内建立了新系统。', 10),
  ('carry on', 'phrasal_verb', '继续(不及物,不带宾语)', 'daily_life', 'Despite the difficulties, they decided to carry on with the plan.', '尽管困难重重,他们决定继续执行计划。', 11),
  ('in addition', 'connector', '此外(用于补充,不用于递进)', 'academic', 'The study was successful; in addition, it received international recognition.', '这项研究取得了成功；此外,还获得了国际认可。', 12),
  ('in other words', 'connector', '换句话说(用于解释,不用于总结)', 'education', 'The results were inconclusive; in other words, more research is needed.', '结果尚不明确；换句话说,还需要更多研究。', 13),
  ('on the other hand', 'connector', '另一方面(用于对比,不用于转折)', 'news', 'The economy is growing; on the other hand, unemployment remains high.', '经济在增长；另一方面,失业率仍然很高。', 14),
  ('for example', 'connector', '例如(用于举例,不用于列举)', 'academic', 'Many animals are endangered; for example, the giant panda is at risk.', '许多动物濒临灭绝；例如,大熊猫正面临危险。', 15),
  ('as a consequence', 'connector', '结果是(有明确因果,非泛泛承接)', 'science_tech', 'The experiment failed; as a consequence, the hypothesis was rejected.', '实验失败了；结果是,假设被否定了。', 16),
  ('in fact', 'connector', '事实上(用于强调,不用于转折)', 'news', 'He claimed to be an expert; in fact, he had no experience.', '他自称是专家；事实上,他没有经验。', 17),
  ('in summary', 'connector', '总结来说(用于总结,不用于解释)', 'academic', 'In summary, the project was a success despite initial challenges.', '总结来说,尽管最初面临挑战,该项目取得了成功。', 18),
  ('in contrast', 'connector', '相比之下(比较两者,不纠正前句)', 'science_tech', 'The north is cold; in contrast, the south is warm and sunny.', '北方寒冷；相比之下,南方温暖而阳光明媚。', 19),
  ('as a result of', 'connector', '由于(表示原因,不用于结果)', 'health', 'The river flooded as a result of heavy rainfall.', '由于降雨量大,河流泛滥了。', 20),
  ('in particular', 'connector', '尤其是(用于强调,不用于列举)', 'culture', 'European art is diverse; in particular, Italian Renaissance art is notable.', '欧洲艺术多样化；尤其是,意大利文艺复兴艺术尤为显著。', 21),
  ('in conclusion', 'connector', '总之(用于结尾,不用于过渡)', 'academic', 'In conclusion, climate change is a pressing global issue.', '总之,气候变化是一个紧迫的全球性问题。', 22),
  ('in spite of', 'connector', '尽管(用于让步,不用于因果)', 'daily_life', 'In spite of the rain, we decided to go hiking.', '尽管下雨,我们还是决定去远足。', 23),
  ('as long as', 'connector', '只要(用于条件,不用于时间)', 'work', 'You can join the meeting as long as you finish your work.', '只要你完成工作,就可以参加会议。', 24),
  ('find out', 'phrasal_verb', '查明(find sth out 可分,代词须插中间)', 'daily_life', 'She needs to find out the truth about her family.', '她需要查明关于她家庭的真相。', 25),
  ('turn down', 'phrasal_verb', '拒绝(turn sth down 可分,代词须插中间)', 'work', 'He decided to turn down the job offer.', '他决定拒绝这份工作邀请。', 26),
  ('figure out', 'phrasal_verb', '弄清楚(figure sth out 可分,代词须插中间)', 'education', 'I can''t figure out how to solve this problem.', '我无法弄清楚如何解决这个问题。', 27),
  ('take over', 'phrasal_verb', '接管(take sth over 可分,代词须插中间)', 'work', 'The company will take over the smaller firm next month.', '这家公司将于下个月接管这家小公司。', 28),
  ('make up', 'phrasal_verb', '组成(make sth up 可分,代词须插中间)', 'science_tech', 'Water makes up about 70% of the human body.', '水约占人体的 70%。', 29),
  ('come across', 'phrasal_verb', '偶然遇到(come across sth,宾语不插中间)', 'daily_life', 'I came across an old friend at the market yesterday.', '我昨天在市场上偶然遇到了一位老朋友。', 30),
  ('run into', 'phrasal_verb', '偶然碰到(run into sth,宾语不插中间)', 'daily_life', 'I ran into my teacher at the bookstore.', '我在书店偶然碰到了我的老师。', 31),
  ('look after', 'phrasal_verb', '照顾(look after sth,宾语不插中间)', 'daily_life', 'She looks after her younger brother every weekend.', '她每个周末都照顾她的弟弟。', 32),
  ('put off', 'phrasal_verb', '推迟(put sth off 可分,代词须插中间)', 'work', 'They decided to put off the meeting until next week.', '他们决定将会议推迟到下周。', 33),
  ('bring up', 'phrasal_verb', '提起(bring sth up 可分,代词须插中间)', 'work', 'She brought up an interesting point during the discussion.', '她在讨论中提起了一个有趣的观点。', 34),
  ('break down', 'phrasal_verb', '分解(break sth down 可分,代词须插中间)', 'science_tech', 'The scientist broke down the complex process into simple steps.', '科学家将复杂的过程分解成简单的步骤。', 35),
  ('give up', 'phrasal_verb', '放弃(give sth up 可分,代词须插中间)', 'daily_life', 'She decided to give up smoking for her health.', '她决定为了健康而放弃吸烟。', 36),
  ('take off', 'phrasal_verb', '脱下(take sth off 可分,代词须插中间)', 'travel', 'He took off his coat and hung it by the door.', '他脱下外套，挂在门边。', 37),
  ('pick up', 'phrasal_verb', '捡起(pick sth up 可分,代词须插中间)', 'daily_life', 'He picked up the book from the floor.', '他从地上捡起了书。', 38),
  ('turn up', 'phrasal_verb', '出现(turn sth up 可分,代词须插中间)', 'daily_life', 'He turned up at the party unexpectedly.', '他出乎意料地出现在聚会上。', 39),
  ('set off', 'phrasal_verb', '出发(set sth off 可分,代词须插中间)', 'travel', 'They set off on their journey early in the morning.', '他们一大早就出发了。', 40),
  ('look forward to', 'phrasal_verb', '期待(look forward to sth,宾语不插中间)', 'daily_life', 'I look forward to the weekend.', '我期待着周末。', 41),
  ('put up with', 'phrasal_verb', '忍受(put up with sth,宾语不插中间)', 'daily_life', 'She can''t put up with the noise any longer.', '她再也无法忍受这种噪音了。', 42),
  ('turn out', 'phrasal_verb', '结果是(不及物,不带宾语)', 'daily_life', 'It turned out that the weather was perfect for a picnic.', '结果天气非常适合野餐。', 43),
  ('call off', 'phrasal_verb', '取消(call sth off 可分,代词须插中间)', 'work', 'They had to call off the event due to rain.', '他们不得不因为下雨取消活动。', 44),
  ('go on', 'phrasal_verb', '继续(不及物,不带宾语)', 'daily_life', 'After a short break, they went on with their work.', '短暂休息后，他们继续工作。', 45),
  ('put out', 'phrasal_verb', '扑灭(put sth out 可分,代词须插中间)', 'daily_life', 'Firefighters managed to put out the fire quickly.', '消防员迅速扑灭了火灾。', 46),
  ('show up', 'phrasal_verb', '露面(不及物,不带宾语)', 'daily_life', 'He didn''t show up for the meeting.', '他没有出席会议。', 47),
  ('back up', 'phrasal_verb', '支持(back sth up 可分,代词须插中间)', 'work', 'She always backs up her arguments with evidence.', '她总是用证据支持她的论点。', 48),
  ('take on', 'phrasal_verb', '承担(take sth on 可分,代词须插中间)', 'work', 'She decided to take on more responsibilities at work.', '她决定在工作中承担更多责任。', 49),
  ('break out', 'phrasal_verb', '爆发(不及物,不带宾语)', 'news', 'A fire broke out in the building last night.', '昨晚大楼里发生了火灾。', 50),
  ('take apart', 'phrasal_verb', '拆开(take sth apart 可分,代词须插中间)', 'science_tech', 'He took apart the computer to fix it.', '他拆开了电脑进行修理。', 51),
  ('go over', 'phrasal_verb', '复习(go over sth,宾语不插中间)', 'education', 'Let''s go over the main points of the lecture.', '让我们复习一下讲座的要点。', 52),
  ('bring about', 'phrasal_verb', '导致(bring about sth,宾语不插中间)', 'science_tech', 'The new policy will bring about significant changes.', '新政策将带来重大变革。', 53),
  ('cut down on', 'phrasal_verb', '减少(cut down on sth,宾语不插中间)', 'health', 'She needs to cut down on sugar for her health.', '为了健康，她需要减少糖的摄入。', 54),
  ('give away', 'phrasal_verb', '赠送(give sth away 可分,代词须插中间)', 'daily_life', 'She decided to give away her old clothes to charity.', '她决定把旧衣服捐赠给慈善机构。', 55),
  ('based on', 'collocation_ext', '基于', 'work', 'The decision was made based on the latest data.', '这个决定是基于最新数据做出的。', 56),
  ('in order to', 'collocation_ext', '为了', 'education', 'He studied hard in order to pass the exam.', '他努力学习为了通过考试。', 57),
  ('as well as', 'collocation_ext', '以及', 'academic', 'The course covers biology as well as chemistry.', '这门课程涵盖生物学以及化学。', 58),
  ('due to', 'collocation_ext', '由于', 'news', 'The event was canceled due to bad weather.', '活动因恶劣天气取消。', 59),
  ('pay attention to', 'collocation_ext', '注意', 'education', 'Students should pay attention to the teacher''s instructions.', '学生应该注意老师的指示。', 60),
  ('in relation to', 'collocation_ext', '关于', 'academic', 'The report discusses climate change in relation to agriculture.', '报告讨论了气候变化与农业的关系。', 61),
  ('in charge of', 'collocation_ext', '负责', 'work', 'She is in charge of the marketing department.', '她负责市场部。', 62),
  ('in response to', 'collocation_ext', '回应', 'news', 'The company issued a statement in response to the allegations.', '公司发布声明回应指控。', 63),
  ('take advantage of', 'collocation_ext', '利用', 'work', 'We should take advantage of the new technology.', '我们应该利用新技术。', 64),
  ('in favor of', 'collocation_ext', '赞成', 'news', 'The majority voted in favor of the new policy.', '多数人投票赞成新政策。', 65),
  ('be aware of', 'collocation_ext', '意识到', 'health', 'You should be aware of the potential risks.', '你应该意识到潜在的风险。', 66),
  ('in line with', 'collocation_ext', '符合', 'work', 'The new procedures are in line with company policy.', '新程序符合公司政策。', 67),
  ('be capable of', 'collocation_ext', '能够', 'science_tech', 'This robot is capable of learning new tasks.', '这个机器人能够学习新任务。', 68),
  ('be familiar with', 'collocation_ext', '熟悉', 'work', 'He is familiar with the company''s procedures.', '他熟悉公司的程序。', 69),
  ('in accordance with', 'collocation_ext', '依照', 'work', 'The project was completed in accordance with the guidelines.', '项目依照指导方针完成。', 70),
  ('be involved in', 'collocation_ext', '参与', 'education', 'She is involved in several research projects.', '她参与了几个研究项目。', 71),
  ('be responsible for', 'collocation_ext', '负责', 'work', 'He is responsible for managing the team.', '他负责管理团队。', 72),
  ('be likely to', 'collocation_ext', '可能', 'daily_life', 'The weather is likely to improve tomorrow.', '天气明天可能会好转。', 73),
  ('be similar to', 'collocation_ext', '类似于', 'science_tech', 'The new design is similar to the previous model.', '新设计类似于之前的型号。', 74),
  ('play a significant role', 'collocation_ext', '发挥重要作用', 'academic', 'Education plays a significant role in shaping a person''s future.', '教育在塑造一个人的未来中发挥重要作用。', 75),
  ('make a difference', 'collocation_ext', '产生影响', 'education', 'Volunteers can make a difference in the lives of many children.', '志愿者可以对许多孩子的生活产生影响。', 76),
  ('have access to', 'collocation_ext', '有权使用', 'science_tech', 'Students should have access to the latest technology in the classroom.', '学生应该有权在教室使用最新技术。', 77),
  ('be dependent on', 'collocation_ext', '依赖于', 'environment', 'The local economy is heavily dependent on tourism.', '当地经济严重依赖于旅游业。', 78),
  ('it is important to...', 'frame', '重要的是(句首,强调某事的重要性)', 'education', 'It is important to understand the basics before moving on.', '重要的是在继续之前理解基础知识。', 79),
  ('the fact that...', 'frame', '事实是(句首或句中,用于强调事实)', 'news', 'The fact that the company is expanding is promising.', '公司正在扩张的事实令人期待。', 80),
  ('there is a need for...', 'frame', '有必要(句首,引出需求或建议)', 'work', 'There is a need for improved communication within the team.', '团队内部有必要提高沟通。', 81),
  ('it is unlikely that...', 'frame', '不太可能(句首,引出否定可能性)', 'science_tech', 'It is unlikely that the experiment will yield different results.', '实验不太可能得出不同的结果。', 82),
  ('it is essential that...', 'frame', '至关重要的是(句首,引出必须做的事)', 'health', 'It is essential that patients follow the prescribed treatment plan.', '至关重要的是患者遵循规定的治疗计划。', 83),
  ('it is worth mentioning that...', 'frame', '值得一提的是(句首,引出补充信息)', 'news', 'It is worth mentioning that the event was a huge success.', '值得一提的是,活动非常成功。', 84),
  ('it is not surprising that...', 'frame', '不足为奇的是(句首,引出合理结果)', 'culture', 'It is not surprising that the movie won several awards.', '这部电影获得多个奖项不足为奇。', 85),
  ('the extent to which...', 'frame', '在多大程度上(句中,用于讨论程度)', 'academic', 'The extent to which this will impact the economy is still unknown.', '这将对经济产生多大影响尚不清楚。', 86),
  ('it is assumed that...', 'frame', '假设是(句首,用于引出假设或观点)', 'academic', 'It is assumed that the results will be consistent across trials.', '假设各次试验的结果将是一致的。', 87),
  ('there is no denying that...', 'frame', '不可否认的是(句首,引出无可争议的事实)', 'daily_life', 'There is no denying that exercise is beneficial for health.', '不可否认的是,锻炼对健康有益。', 88),
  ('what matters most is that...', 'frame', '最重要的是(句首,强调重点)', 'daily_life', 'What matters most is that we learn from our mistakes.', '最重要的是我们从错误中学习。', 89),
  ('it is recommended that...', 'frame', '建议(句首,用于提出建议)', 'health', 'It is recommended that you drink plenty of water during the day.', '建议您在一天中多喝水。', 90),
  ('it is evident that...', 'frame', '显然(句首,用于引出明显结论)', 'academic', 'It is evident that climate change is affecting global weather patterns.', '显然,气候变化正在影响全球天气模式。', 91),
  ('it is believed that...', 'frame', '人们相信(句首,引出普遍观点或假设)', 'science_tech', 'It is believed that the universe is constantly expanding.', '人们相信宇宙在不断膨胀。', 92),
  ('it is likely that...', 'frame', '很可能(句首,引出可能性)', 'news', 'It is likely that the new policy will be implemented next year.', '新政策很可能在明年实施。', 93),
  ('the reason why...', 'frame', '原因是(句中或句首,用于解释原因)', 'work', 'The reason why the project was delayed is still unclear.', '项目延期的原因尚不清楚。', 94),
  ('it is unfortunate that...', 'frame', '不幸的是(句首,引出遗憾或不好的消息)', 'news', 'It is unfortunate that the event was canceled due to the weather.', '不幸的是,由于天气原因,活动被取消。', 95),
  ('it is noteworthy that...', 'frame', '值得注意的是(句首,强调重要信息)', 'academic', 'It is noteworthy that the study received widespread attention.', '值得注意的是,这项研究受到了广泛关注。', 96),
  ('carry out research', 'collocation_ext', '进行研究', 'academic', 'The team will carry out research on climate change impacts.', '该团队将进行气候变化影响的研究。', 97),
  ('play an important role', 'collocation_ext', '发挥重要作用', 'news', 'Education plays an important role in economic development.', '教育在经济发展中发挥着重要作用。', 98),
  ('pose a threat to', 'collocation_ext', '对…构成威胁', 'environment', 'Pollution poses a threat to marine life in the ocean.', '污染对海洋生物构成威胁。', 99),
  ('make an effort to', 'collocation_ext', '努力去...', 'education', 'Students should make an effort to improve their grades.', '学生们应该努力提高他们的成绩。', 100)
ON CONFLICT (lower(chunk)) DO UPDATE
  SET type = EXCLUDED.type, translation_zh = EXCLUDED.translation_zh, scene = EXCLUDED.scene,
      example_en = EXCLUDED.example_en, example_zh = EXCLUDED.example_zh,
      freq_rank = EXCLUDED.freq_rank, updated_at = now();

SELECT 'AFTER' AS stage, count(*) AS chunks FROM vocab_chunks;

-- ── count-validate:三行都必须是 t,否则 ROLLBACK ──
SELECT '词块总数 = 100' AS expect,
       (SELECT count(*) FROM vocab_chunks) = 100 AS ok
UNION ALL
SELECT '没有 idiom(那是 H 段的)',
       NOT EXISTS (SELECT 1 FROM vocab_chunks WHERE type = 'idiom')
UNION ALL
SELECT 'connector 的释义都写了边界说明(括号)',
       NOT EXISTS (SELECT 1 FROM vocab_chunks WHERE type = 'connector'
                    AND translation_zh !~ '[(（][^)）]{2,}[)）]');

COMMIT;
