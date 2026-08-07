-- I 段 · 中文高频表达 50 条(**终态写法,可任意重放**)
--
-- 一条中文 → 2–3 个不同语域的地道英文说法。本段的全部价值是**挡中式英语**。
--
-- ⚠️ 终态:先删掉不在本表内的表达(renditions 靠 FK ON DELETE CASCADE 连带清),
--    再按 cn_phrase 重建。重跑任意次结果不变,不会复活已裁决删除的条目。
-- ⚠️ 硬约束勘验自 DDL(非记忆):category ∈ {daily,proverb} ·
--    register ∈ {casual,neutral,formal} · sort_order CHECK 1..3。
-- ⚠️ 由 Aaron 执行。

BEGIN;

-- ① 终态收敛(renditions 由 FK ON DELETE CASCADE 连带删除)
DELETE FROM vocab_cn_expressions WHERE cn_phrase NOT IN (
  '我随便说说', '没问题', '我想也是', '别生气', '我不太确定', '我来试试', '我很期待', '水滴石穿', '无风不起浪', '不入虎穴,焉得虎子', '江山易改,本性难移', '众口难调', '老马识途', '那不关我的事', '我不明白', '我得走了', '随便你', '我来帮你', '我同意', '我不知道', '我懂了', '没关系', '我很高兴', '我很着急', '我没听见', '我在路上', '小心点', '我在想', '我想睡觉', '我忘了', '杯水车薪', '唇亡齿寒', '覆水难收', '我饿了', '你有空吗', '我保证', '关灯', '去散步', '我不在乎', '我很无聊', '真可惜', '我想休息一下', '画蛇添足', '入乡随俗', '真好吃', '我很生气', '骑虎难下', '我很抱歉', '你说得对', '我需要帮助'
);
DELETE FROM vocab_cn_renditions r
 USING vocab_cn_expressions e
 WHERE r.expression_id = e.id;

-- ② 表达
INSERT INTO vocab_cn_expressions (cn_phrase, cn_note, category, sort_order) VALUES
  ('我随便说说', '表示不确定或非认真', 'daily', 1),
  ('没问题', '表示同意或接受', 'daily', 2),
  ('我想也是', '表示赞同他人意见', 'daily', 3),
  ('别生气', '用于安抚情绪', 'daily', 4),
  ('我不太确定', NULL, 'daily', 5),
  ('我来试试', NULL, 'daily', 6),
  ('我很期待', NULL, 'daily', 7),
  ('水滴石穿', '强调坚持不懈的力量', 'proverb', 8),
  ('无风不起浪', '指事情总有起因', 'proverb', 9),
  ('不入虎穴,焉得虎子', '强调冒险的重要性', 'proverb', 10),
  ('江山易改,本性难移', '强调本性难以改变', 'proverb', 11),
  ('众口难调', '指难以满足所有人的需求', 'proverb', 12),
  ('老马识途', '指经验丰富的人善于指导', 'proverb', 13),
  ('那不关我的事', '用于撇清关系', 'daily', 14),
  ('我不明白', '用于表达不理解', 'daily', 15),
  ('我得走了', '用于表示要离开', 'daily', 16),
  ('随便你', '用于表示无所谓', 'daily', 17),
  ('我来帮你', '用于表示愿意帮忙', 'daily', 18),
  ('我同意', '用于表示赞同', 'daily', 19),
  ('我不知道', '用于表示不知情', 'daily', 20),
  ('我懂了', '用于表示理解', 'daily', 21),
  ('没关系', '用于安慰他人', 'daily', 22),
  ('我很高兴', '用于表达开心', 'daily', 23),
  ('我很着急', '用于描述紧张或焦虑', 'daily', 24),
  ('我没听见', '用于表示没听清', 'daily', 25),
  ('我在路上', '用于告知正前往之中', 'daily', 26),
  ('小心点', '用于提醒注意安全', 'daily', 27),
  ('我在想', '用于表示正在考虑', 'daily', 28),
  ('我想睡觉', '用于表示困倦', 'daily', 29),
  ('我忘了', '用于承认忘记', 'daily', 30),
  ('杯水车薪', '比喻无济于事。', 'proverb', 31),
  ('唇亡齿寒', '比喻关系密切,互相依存', 'proverb', 32),
  ('覆水难收', '比喻事情不可逆转', 'proverb', 33),
  ('我饿了', NULL, 'daily', 34),
  ('你有空吗', NULL, 'daily', 35),
  ('我保证', NULL, 'daily', 36),
  ('关灯', NULL, 'daily', 37),
  ('去散步', NULL, 'daily', 38),
  ('我不在乎', NULL, 'daily', 39),
  ('我很无聊', NULL, 'daily', 40),
  ('真可惜', NULL, 'daily', 41),
  ('我想休息一下', NULL, 'daily', 42),
  ('画蛇添足', NULL, 'proverb', 43),
  ('入乡随俗', NULL, 'proverb', 44),
  ('真好吃', NULL, 'daily', 45),
  ('我很生气', NULL, 'daily', 46),
  ('骑虎难下', '指事情进行中难以停下。', 'proverb', 47),
  ('我很抱歉', NULL, 'daily', 48),
  ('你说得对', NULL, 'daily', 49),
  ('我需要帮助', NULL, 'daily', 50)
ON CONFLICT DO NOTHING;

-- ③ 说法(按 cn_phrase 关联,避免写死 uuid)
INSERT INTO vocab_cn_renditions (expression_id, rendition, register, scene_hint, example_en, example_zh, sort_order)
SELECT e.id, v.rendition, v.register, v.scene_hint, v.example_en, v.example_zh, v.sort_order
  FROM (VALUES
    ('我随便说说', 'I''m just saying.', 'casual', '用于朋友间随意聊天', 'I''m just saying, maybe we should try a new restaurant.', '我随便说说,或许我们该试试新的餐馆。', 1),
    ('我随便说说', 'It''s just a thought.', 'neutral', '用于表达不确定想法', 'It''s just a thought, but maybe we could start earlier.', '我随便说说,但或许我们可以早点开始。', 2),
    ('我随便说说', 'This is merely a suggestion.', 'formal', '用于正式场合表达建议', 'This is merely a suggestion for your consideration.', '我随便说说,供你参考。', 3),
    ('没问题', 'No problem.', 'casual', '用于朋友间回应请求', 'No problem, I''ll help you move on Saturday.', '没问题,我周六帮你搬家。', 1),
    ('没问题', 'That sounds fine.', 'neutral', '用于一般场合表示同意', 'That sounds fine, let''s meet at 3 PM.', '没问题,我们下午3点见。', 2),
    ('没问题', 'I have no objections.', 'formal', '用于正式场合表示同意', 'I have no objections to the proposed plan.', '我对提议的计划没问题。', 3),
    ('我想也是', 'I think so too.', 'casual', '用于朋友间表达同意', 'I think so too, it''s a great idea!', '我想也是,这是个好主意!', 1),
    ('我想也是', 'I agree with you.', 'neutral', '用于一般场合表示同意', 'I agree with you, the proposal is promising.', '我想也是,这个提议很有前景。', 2),
    ('我想也是', 'I concur with your assessment.', 'formal', '用于正式场合表示同意', 'I concur with your assessment of the situation.', '我想也是,对于这种情况我同意你的看法。', 3),
    ('别生气', 'Don''t get mad.', 'casual', '用于朋友间安抚情绪', 'Don''t get mad, it was just a joke.', '别生气,这只是个玩笑。', 1),
    ('别生气', 'Try to stay calm.', 'neutral', '用于一般场合安抚情绪', 'Try to stay calm while we sort this out.', '我们处理这件事时,你尽量别生气。', 2),
    ('别生气', 'Please remain composed.', 'formal', '用于正式场合安抚情绪', 'Please remain composed during the discussion.', '在讨论期间请别生气。', 3),
    ('我不太确定', 'I''m not sure', 'neutral', '一般场合表达不确定性', 'I''m not sure if the meeting is still on.', '我不太确定会议是否还开。', 1),
    ('我不太确定', 'I have no idea', 'casual', '随意表达完全不知情', 'Honestly, I have no idea where she went.', '老实说，我不太确定她去哪了。', 2),
    ('我不太确定', 'I lack sufficient information to confirm', 'formal', '正式场合强调信息不足', 'I lack sufficient information to confirm the project''s timeline.', '我不太确定项目时间表，因为信息不足。', 3),
    ('我来试试', 'Let me give it a shot', 'casual', '朋友间尝试新事物', 'That game looks fun, let me give it a shot.', '那个游戏看起来很有趣，我来试试。', 1),
    ('我来试试', 'I''ll give it a try', 'neutral', '一般场合尝试新事物', 'I haven''t cooked this dish before, but I''ll give it a try.', '我以前没做过这个菜，但我来试试。', 2),
    ('我来试试', 'I shall attempt this', 'formal', '正式场合尝试做某事', 'Given the circumstances, I shall attempt this task.', '鉴于情况，我来试试做这个任务。', 3),
    ('我很期待', 'Can''t wait', 'casual', '朋友间表达对某事的期待', 'Can''t wait for the concert next week!', '我很期待下周的演唱会！', 1),
    ('我很期待', 'I''m looking forward to it', 'neutral', '一般场合表达期待', 'I''m looking forward to our meeting next Monday.', '我很期待下周一的会议。', 2),
    ('我很期待', 'I eagerly anticipate', 'formal', '正式场合表达强烈期待', 'I eagerly anticipate the results of the upcoming study.', '我很期待即将到来的研究结果。', 3),
    ('水滴石穿', 'Keep on keeping on.', 'casual', '鼓励朋友坚持下去', 'I know it''s tough, but keep on keeping on.', '我知道这很难,但水滴石穿,继续坚持下去。', 1),
    ('水滴石穿', 'Persistence pays off.', 'neutral', '在一般场合谈论坚持的价值', 'It took years, but persistence pays off.', '花了几年时间,但水滴石穿,坚持的价值最终显现。', 2),
    ('水滴石穿', 'Constant effort can overcome any obstacle.', 'formal', '正式场合中强调努力的重要性', 'Constant effort can overcome any obstacle in this project.', '在这个项目中,水滴石穿,持续的努力可以克服任何障碍。', 3),
    ('无风不起浪', 'Where there''s smoke, there''s fire.', 'casual', '谈论传闻或谣言时', 'I heard they''re breaking up. Where there''s smoke, there''s fire.', '我听说他们要分手了,无风不起浪。', 1),
    ('无风不起浪', 'There''s no effect without a cause.', 'neutral', '分析问题时提到因果关系', 'The sudden drop in sales suggests there''s no effect without a cause.', '销售的突然下降表明无风不起浪,一定有原因。', 2),
    ('无风不起浪', 'Every event has an underlying cause.', 'formal', '正式分析事件的起因', 'Every event has an underlying cause that must be investigated thoroughly.', '每个事件都有其根本原因,无风不起浪,需要彻底调查。', 3),
    ('不入虎穴,焉得虎子', 'No guts, no glory.', 'casual', '鼓励朋友勇敢尝试', 'You should go for it. No guts, no glory!', '你应该去尝试,不入虎穴,焉得虎子!', 1),
    ('不入虎穴,焉得虎子', 'Nothing ventured, nothing gained.', 'neutral', '劝说某人尝试新事物', 'Consider applying for that job. Nothing ventured, nothing gained.', '考虑申请那份工作,不入虎穴,焉得虎子。', 2),
    ('不入虎穴,焉得虎子', 'Risk is indispensable to achievement.', 'formal', '正式场合中谈论风险和成就', 'In business, risk is indispensable to achievement and innovation.', '在商业中,不入虎穴,焉得虎子,风险是成就和创新的关键。', 3),
    ('江山易改,本性难移', 'A leopard can''t change its spots.', 'casual', '朋友间谈论某人不改的习惯', 'He promised to be punctual, but a leopard can''t change its spots.', '他承诺会准时,但江山易改,本性难移。', 1),
    ('江山易改,本性难移', 'Old habits die hard.', 'neutral', '一般场合讨论习惯难改', 'He''s trying to quit smoking, but old habits die hard.', '他在努力戒烟,但江山易改,本性难移。', 2),
    ('江山易改,本性难移', 'Innate characteristics are resistant to change.', 'formal', '正式场合中讨论性格特征', 'In psychology, innate characteristics are resistant to change, influencing behavior.', '在心理学中,江山易改,本性难移,影响行为。', 3),
    ('众口难调', 'You can''t please everyone.', 'casual', '朋友间谈论无法让每个人满意', 'I chose the movie, but you can''t please everyone.', '我选了电影,但众口难调,不可能让每个人都满意。', 1),
    ('众口难调', 'It''s difficult to satisfy all interests.', 'neutral', '一般场合中描述协调问题', 'In planning events, it''s difficult to satisfy all interests.', '在策划活动时,众口难调,很难满足所有人的需求。', 2),
    ('众口难调', 'Accommodating all preferences is challenging.', 'formal', '正式场合谈论协调复杂需求', 'In policy-making, accommodating all preferences is challenging and requires negotiation.', '在政策制定中,众口难调,协调所有偏好具有挑战性,需要协商。', 3),
    ('老马识途', 'An old hand knows the ropes.', 'casual', '谈论某人经验丰富', 'Ask Tom for help; he''s an old hand and knows the ropes.', '找汤姆帮忙,他是老马识途,经验丰富。', 1),
    ('老马识途', 'Experience is the best guide.', 'neutral', '一般场合中讨论经验的价值', 'In navigating complex tasks, experience is the best guide.', '在处理复杂任务时,老马识途,经验是最好的指导。', 2),
    ('老马识途', 'Veteran insight is invaluable for guidance.', 'formal', '正式场合中提到经验的作用', 'In strategic planning, veteran insight is invaluable for guidance and success.', '在战略规划中,老马识途,资深人士的见解对指导和成功至关重要。', 3),
    ('那不关我的事', 'That''s none of my business', 'neutral', '一般场合撇清关系', 'You can do what you like, that''s none of my business.', '你可以随便做,那不关我的事。', 1),
    ('那不关我的事', 'Not my problem', 'casual', '轻松场合撇清关系', 'If he messed up, that''s not my problem.', '如果他搞砸了,那不关我的事。', 2),
    ('那不关我的事', 'That is not my concern', 'formal', '正式场合撇清关系', 'I''m afraid that is not my concern at this point.', '恐怕那不关我的事。', 3),
    ('我不明白', 'I don''t understand', 'neutral', '一般场合表达不解', 'I don''t understand what you mean by that.', '我不明白你那是什么意思。', 1),
    ('我不明白', 'I''m lost', 'casual', '随意场合表达不解', 'I''m lost. Can you explain it again?', '我不明白。你能再解释一下吗?', 2),
    ('我不明白', 'I''m not clear on that', 'formal', '正式场合表达不解', 'I''m not clear on that point. Could you elaborate?', '我不明白那一点。你能详细说明吗?', 3),
    ('我得走了', 'I have to go', 'neutral', '一般场合表示要走', 'It''s getting late, I have to go.', '时间不早了,我得走了。', 1),
    ('我得走了', 'Gotta run', 'casual', '朋友间表达要离开', 'Sorry, gotta run, see you later!', '抱歉,我得走了,回头见!', 2),
    ('我得走了', 'I must take my leave', 'formal', '正式场合表示要离开', 'I must take my leave now, thank you for the meeting.', '我得走了,谢谢你们的会议。', 3),
    ('随便你', 'It''s up to you', 'neutral', '一般场合表示无所谓', 'We can eat anywhere, it''s up to you.', '我们可以随便吃,随便你。', 1),
    ('随便你', 'Whatever you want', 'casual', '朋友间表达无所谓', 'We can watch whatever you want.', '你想看什么都行,随便你。', 2),
    ('随便你', 'I leave it to your discretion', 'formal', '正式场合表示无所谓', 'I leave it to your discretion whether to proceed.', '是否继续,随便你。', 3),
    ('我来帮你', 'Let me help you', 'neutral', '一般场合表示愿意帮忙', 'Let me help you with those bags.', '我来帮你拿这些袋子。', 1),
    ('我来帮你', 'I''ve got you covered', 'casual', '朋友间表示帮忙', 'Don''t worry about the tickets, I''ve got you covered.', '别担心票的问题,我来帮你。', 2),
    ('我来帮你', 'I am at your service', 'formal', '正式场合表示愿意帮忙', 'If you need anything, I am at your service.', '如果你需要任何帮助,我来帮你。', 3),
    ('我同意', 'I agree', 'neutral', '一般场合表示赞同', 'I agree with your point about the budget.', '我同意你关于预算的观点。', 1),
    ('我同意', 'I''m with you', 'casual', '朋友间表示赞同', 'I''m with you on this, let''s go for it.', '我同意,就这么做吧。', 2),
    ('我同意', 'I am in accord', 'formal', '正式场合表示赞同', 'I am in accord with the board''s decision.', '我同意董事会的决定。', 3),
    ('我不知道', 'I don''t know', 'neutral', '一般场合表示不知情', 'I don''t know the answer to that question.', '我不知道那个问题的答案。', 1),
    ('我不知道', 'No idea', 'casual', '朋友间表示不知情', 'No idea where she went after the party.', '我不知道她派对后去了哪里。', 2),
    ('我不知道', 'I''m unaware', 'formal', '正式场合表示不知情', 'I''m unaware of any changes to the schedule.', '我不知道时间表有任何变动。', 3),
    ('我懂了', 'I get it', 'neutral', '一般场合表示理解', 'I get it now, thanks for explaining.', '我懂了,谢谢你的解释。', 1),
    ('我懂了', 'Got it', 'casual', '朋友间表示理解', 'Got it, I''ll send the email right away.', '我懂了,我会马上发邮件。', 2),
    ('我懂了', 'I comprehend', 'formal', '正式场合表示理解', 'I comprehend the terms you outlined.', '我懂了你所列出的条款。', 3),
    ('没关系', 'It''s okay', 'neutral', '一般场合安慰他人', 'It''s okay, we all make mistakes.', '没关系,我们都会犯错。', 1),
    ('没关系', 'No worries', 'casual', '朋友间安慰他人', 'No worries, it happens to everyone.', '没关系,每个人都会遇到。', 2),
    ('没关系', 'It''s of no consequence', 'formal', '正式场合安慰他人', 'It''s of no consequence, please proceed.', '没关系,请继续。', 3),
    ('我很高兴', 'I''m happy', 'neutral', '一般场合表达开心', 'I''m happy to hear about your success.', '我很高兴听到你的成功。', 1),
    ('我很高兴', 'I''m thrilled', 'casual', '朋友间表达开心', 'I''m thrilled we won the championship!', '我很高兴我们赢得了冠军!', 2),
    ('我很高兴', 'I am delighted', 'formal', '正式场合表达开心', 'I am delighted to accept the invitation.', '我很高兴接受邀请。', 3),
    ('我很着急', 'I''m anxious', 'neutral', '一般场合表达紧张', 'I''m anxious about my job interview tomorrow.', '我很着急明天的工作面试。', 1),
    ('我很着急', 'I''m freaking out', 'casual', '朋友间表达紧张', 'I''m freaking out about the test results!', '我很着急考试结果!', 2),
    ('我很着急', 'I am concerned', 'formal', '正式场合表达紧张', 'I am concerned about the recent developments.', '我很着急最近的发展情况。', 3),
    ('我没听见', 'I didn''t hear you', 'neutral', '一般场合表示没听清', 'I''m sorry, I didn''t hear you. Could you repeat that?', '抱歉,我没听见。你能再说一次吗?', 1),
    ('我没听见', 'I missed that', 'casual', '朋友间表示没听清', 'I missed that, can you say it again?', '我没听见,你能再说一次吗?', 2),
    ('我没听见', 'I did not catch that', 'formal', '正式场合表示没听清', 'I did not catch that last point, could you clarify?', '我没听见最后一点,你能澄清吗?', 3),
    ('我在路上', 'I''m on my way', 'neutral', '一般场合告知在路上', 'I''m on my way to the office now.', '我在路上去办公室。', 1),
    ('我在路上', 'Heading over now', 'casual', '朋友间告知在路上', 'I''m heading over now, see you soon!', '我在路上,很快见!', 2),
    ('我在路上', 'In transit', 'formal', '正式场合告知在路上', 'I am currently in transit and will arrive shortly.', '我在路上,即将到达。', 3),
    ('小心点', 'Be careful', 'neutral', '一般场合提醒注意安全', 'Be careful when you drive in the rain.', '下雨开车时小心点。', 1),
    ('小心点', 'Watch out', 'casual', '随意场合提醒注意安全', 'Watch out for the wet floor!', '小心点,地滑!', 2),
    ('小心点', 'Exercise caution', 'formal', '正式场合提醒注意安全', 'Please exercise caution when handling chemicals.', '处理化学品时请小心点。', 3),
    ('我在想', 'I''m thinking', 'neutral', '一般场合表示考虑中', 'I''m thinking about applying for that job.', '我在想要不要申请那份工作。', 1),
    ('我在想', 'I''m pondering', 'formal', '正式场合表示考虑中', 'I''m pondering the implications of this decision.', '我在想这个决定的影响。', 2),
    ('我在想', 'I''m mulling it over', 'casual', '朋友间表示考虑中', 'I''m mulling it over before I decide.', '我在想,再做决定。', 3),
    ('我想睡觉', 'I''m sleepy', 'neutral', '一般场合表示困倦', 'I''m sleepy, let''s call it a night.', '我想睡觉,我们结束吧。', 1),
    ('我想睡觉', 'I''m beat', 'casual', '随意场合表示困倦', 'I''m beat, time to hit the sack.', '我想睡觉,该上床了。', 2),
    ('我想睡觉', 'I am fatigued', 'formal', '正式场合表示困倦', 'After a long day, I am fatigued and ready for bed.', '经过漫长的一天,我想睡觉。', 3),
    ('我忘了', 'I forgot', 'neutral', '一般场合承认忘记', 'I forgot to bring my lunch today.', '我忘了带午餐。', 1),
    ('我忘了', 'It slipped my mind', 'casual', '随意场合承认忘记', 'Sorry, it slipped my mind to call you back.', '抱歉,我忘了回你电话。', 2),
    ('我忘了', 'I failed to recall', 'formal', '正式场合承认忘记', 'I failed to recall the details of the agreement.', '我忘了协议的细节。', 3),
    ('杯水车薪', 'a drop in the bucket', 'casual', '朋友间形容微不足道的贡献', 'Donating $5 is just a drop in the bucket for such a huge project.', '捐5美元对这个庞大的项目来说只是杯水车薪。', 1),
    ('杯水车薪', 'insufficient to meet the needs', 'neutral', '一般场合形容资源不足', 'The aid provided was insufficient to meet the needs of the affected families.', '提供的援助对受灾家庭来说是杯水车薪。', 2),
    ('杯水车薪', 'inadequate to address the issue', 'formal', '正式场合指措施不足', 'The proposed measures are inadequate to address the issue at hand.', '所提措施对眼前问题是杯水车薪。', 3),
    ('唇亡齿寒', 'We''re in the same boat.', 'casual', '朋友间形容共同利益', 'Don''t worry, we''re in the same boat with this project.', '别担心,我们这个项目唇亡齿寒。', 1),
    ('唇亡齿寒', 'interdependent', 'neutral', '一般场合描述互相依存关系', 'The two departments are interdependent for success.', '这两个部门唇亡齿寒,成功需要互相依存。', 2),
    ('唇亡齿寒', 'mutual dependency', 'formal', '正式场合论述密切关系', 'The mutual dependency of these systems ensures stability.', '这些系统唇亡齿寒,以确保稳定性。', 3),
    ('覆水难收', 'What''s done is done.', 'casual', '朋友间安慰对方放下过去', 'Don''t stress over it. What''s done is done.', '别太在意,覆水难收。', 1),
    ('覆水难收', 'There''s no use crying over spilled milk.', 'neutral', '一般场合劝人放下不可逆的事', 'You missed the deadline. There''s no use crying over spilled milk now.', '你错过了截止日期,覆水难收。', 2),
    ('覆水难收', 'The damage is irreversible.', 'formal', '正式场合论述不可逆转的后果', 'The damage to the environment is irreversible if actions are not taken.', '如不采取行动,对环境的损害将覆水难收。', 3),
    ('我饿了', 'I''m starving.', 'casual', '朋友间随意表达', 'Let''s grab a burger, I''m starving.', '我们去吃个汉堡吧,我饿了。', 1),
    ('我饿了', 'I''m hungry.', 'neutral', '一般场合表达饥饿', 'Do you have any snacks? I''m hungry.', '你有零食吗? 我饿了。', 2),
    ('你有空吗', 'Got a sec?', 'casual', '朋友间随意询问', 'Hey, got a sec to chat?', '嘿,你有空聊聊吗?', 1),
    ('你有空吗', 'Are you available?', 'neutral', '一般场合询问时间', 'Are you available for a meeting tomorrow?', '你明天有空开会吗?', 2),
    ('我保证', 'I swear.', 'casual', '承诺时的随意说法', 'I swear, I left the keys right here.', '我保证,我把钥匙放在这里了。', 1),
    ('我保证', 'I assure you.', 'neutral', '一般场合保证某事', 'I assure you, the product will be delivered on time.', '我保证,产品会按时交付。', 2),
    ('关灯', 'Kill the lights.', 'casual', '非正式场合关灯', 'It''s movie time, kill the lights.', '电影时间到了,关灯吧。', 1),
    ('关灯', 'Turn off the lights.', 'neutral', '一般场合要求关灯', 'Please turn off the lights when you leave.', '请离开时关灯。', 2),
    ('去散步', 'Go for a stroll.', 'casual', '朋友间随意提议', 'It''s a nice evening, let''s go for a stroll.', '今天天气不错,我们去散步吧。', 1),
    ('去散步', 'Take a walk.', 'neutral', '一般场合建议散步', 'I like to take a walk after dinner.', '我喜欢晚饭后去散步。', 2),
    ('我不在乎', 'I don''t care.', 'casual', '随意表达无所谓', 'I don''t care what they think.', '我不在乎他们怎么想。', 1),
    ('我不在乎', 'It doesn''t matter to me.', 'neutral', '一般场合表示不在乎', 'It doesn''t matter to me if we go or not.', '我不在乎我们去不去。', 2),
    ('我很无聊', 'I''m bored to death.', 'casual', '非正式表达极端无聊', 'This lecture is endless, I''m bored to death.', '这堂课没完没了,我很无聊。', 1),
    ('我很无聊', 'I''m bored.', 'neutral', '一般场合表达无聊', 'I''m bored, let''s do something fun.', '我很无聊,我们做点有趣的事吧。', 2),
    ('真可惜', 'What a bummer.', 'casual', '朋友间表示遗憾', 'The concert''s canceled, what a bummer.', '演唱会取消了,真可惜。', 1),
    ('真可惜', 'That''s unfortunate.', 'neutral', '一般场合表示遗憾', 'That''s unfortunate, I was looking forward to it.', '真可惜,我很期待的。', 2),
    ('我想休息一下', 'I need a break.', 'casual', '随意表达需要休息', 'I''ve been studying all day, I need a break.', '我学习了一整天,我想休息一下。', 1),
    ('我想休息一下', 'I want to take a rest.', 'neutral', '一般场合表示休息', 'After the meeting, I want to take a rest.', '会议结束后,我想休息一下。', 2),
    ('画蛇添足', 'add unnecessary details', 'neutral', '做事多此一举时', 'Her story was good, but she added unnecessary details that confused everyone.', '她的故事很好,但画蛇添足的细节让人困惑。', 1),
    ('画蛇添足', 'gild the lily', 'formal', '做事多此一举时', 'The designer suggested not to gild the lily by adding more decorations.', '设计师建议不要画蛇添足,增添更多装饰。', 2),
    ('入乡随俗', 'when in Rome, do as the Romans do', 'neutral', '适应当地习俗时', 'When in Rome, do as the Romans do; try the local food.', '入乡随俗,试试当地的食物。', 1),
    ('入乡随俗', 'adapt to local customs', 'formal', '适应当地习俗时', 'Visitors are advised to adapt to local customs to enhance their experience.', '建议游客入乡随俗,以提升体验。', 2),
    ('真好吃', 'This is delicious!', 'casual', '朋友聚餐时', 'Wow, this is delicious! Did you make it?', '哇,真好吃!是你做的吗?', 1),
    ('真好吃', 'The food tastes great.', 'neutral', '一般场合用餐时', 'The food tastes great. What''s the recipe?', '这食物真好吃。配方是什么?', 2),
    ('真好吃', 'The cuisine is exquisite.', 'formal', '正式场合用餐时', 'The cuisine is exquisite. My compliments to the chef.', '这道菜真好吃。请代我向厨师致意。', 3),
    ('我很生气', 'I''m pissed off', 'casual', '非正式场合表达愤怒时', 'I''m pissed off about the cancellation.', '取消让我很生气。', 1),
    ('我很生气', 'I''m upset', 'neutral', '一般场合表达不满时', 'I''m upset about how things turned out.', '事情的结果让我很生气。', 2),
    ('我很生气', 'I am quite displeased', 'formal', '正式场合表达不悦时', 'I am quite displeased with the service provided.', '我对所提供的服务很生气。', 3),
    ('骑虎难下', 'caught between a rock and a hard place', 'casual', '朋友间表达两难境地', 'I''m caught between a rock and a hard place with this job offer.', '我在这份工作邀请上骑虎难下。', 1),
    ('骑虎难下', 'in a bind', 'neutral', '一般场合表达困境', 'I''m in a bind with these conflicting deadlines.', '这些互相冲突的截止日期让我骑虎难下。', 2),
    ('骑虎难下', 'in an untenable position', 'formal', '正式场合描述难以维持的处境', 'The company found itself in an untenable position due to the scandal.', '公司因丑闻陷入骑虎难下的境地。', 3),
    ('我很抱歉', 'I''m really sorry', 'casual', '随意对话中道歉', 'I''m really sorry for breaking your mug.', '我很抱歉打破了你的杯子。', 1),
    ('我很抱歉', 'I apologize', 'neutral', '一般场合表达歉意', 'I apologize for the delay in response.', '我很抱歉回复晚了。', 2),
    ('我很抱歉', 'I extend my apologies', 'formal', '正式书面或对上级道歉', 'I extend my apologies for the oversight in the report.', '我很抱歉报告中的疏漏。', 3),
    ('你说得对', 'You''re right', 'casual', '随意同意他人观点', 'You''re right, this movie is really good.', '你说得对,这电影确实不错。', 1),
    ('你说得对', 'That is correct', 'neutral', '一般场合确认他人正确', 'That is correct, the meeting starts at 3 PM.', '你说得对,会议三点开始。', 2),
    ('你说得对', 'You are absolutely correct', 'formal', '正式场合强调对方正确', 'You are absolutely correct in your assessment.', '你说得对,你的评估很准确。', 3),
    ('我需要帮助', 'I need a hand', 'casual', '随意请求帮助', 'I need a hand with these boxes.', '我需要帮助搬这些箱子。', 1),
    ('我需要帮助', 'I need some assistance', 'neutral', '一般场合请求帮助', 'I need some assistance with my computer.', '我需要帮助修一下电脑。', 2),
    ('我需要帮助', 'I require assistance', 'formal', '正式场合请求帮助', 'I require assistance in finalizing the report.', '我需要帮助完成报告。', 3)
  ) AS v(cn_phrase, rendition, register, scene_hint, example_en, example_zh, sort_order)
  JOIN vocab_cn_expressions e ON e.cn_phrase = v.cn_phrase;

-- ── validate:六行都必须是 t(重跑本文件任意次,结果不变)──
SELECT '表达恰 50 条' AS expect,
       (SELECT count(*) FROM vocab_cn_expressions) = 50 AS ok
UNION ALL
SELECT '说法恰 139 条',
       (SELECT count(*) FROM vocab_cn_renditions) = 139
UNION ALL
SELECT '每条表达都有 2-3 个说法',
       NOT EXISTS (SELECT 1 FROM vocab_cn_expressions e
                    LEFT JOIN vocab_cn_renditions r ON r.expression_id = e.id
                    GROUP BY e.id HAVING count(r.id) NOT BETWEEN 2 AND 3)
UNION ALL
SELECT '同一表达下语域互不相同',
       NOT EXISTS (SELECT 1 FROM vocab_cn_renditions
                    GROUP BY expression_id, register HAVING count(*) > 1)
UNION ALL
SELECT '英文例句都真的含该说法(抽 sth/sb 后首词)',
       NOT EXISTS (SELECT 1 FROM vocab_cn_renditions
                    WHERE position(lower(split_part(rendition, ' ', 1)) in lower(example_en)) = 0)
UNION ALL
SELECT '无任何 NOT NULL 列为空',
       NOT EXISTS (SELECT 1 FROM vocab_cn_renditions
                    WHERE rendition = '' OR scene_hint = '' OR example_en = '' OR example_zh = '');

COMMIT;
