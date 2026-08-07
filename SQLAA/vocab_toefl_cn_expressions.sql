-- I 段 · 中文高频表达 51 条(**终态写法,可任意重放**)
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
  '我随便说说', '没问题', '我想也是', '别生气', '我不太确定', '我来试试', '我很期待', '那不关我的事', '我不明白', '我得走了', '随便你', '我来帮你', '我同意', '我不知道', '我懂了', '没关系', '我很高兴', '我很着急', '我没听见', '我在路上', '小心点', '我在想', '我想睡觉', '我忘了', '我饿了', '你有空吗', '我保证', '关灯', '去散步', '我不在乎', '我很无聊', '真可惜', '我想休息一下', '真好吃', '我很生气', '我很抱歉', '你说得对', '我需要帮助', '耳听为虚,眼见为实', '吃一堑,长一智', '熟能生巧', '一分耕耘,一分收获', '人无远虑,必有近忧', '不入虎穴,焉得虎子', '近朱者赤,近墨者黑', '井底之蛙', '画蛇添足', '亡羊补牢', '隔墙有耳', '三思而后行', '杯水车薪'
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
  ('那不关我的事', '用于撇清关系', 'daily', 8),
  ('我不明白', '用于表达不理解', 'daily', 9),
  ('我得走了', '用于表示要离开', 'daily', 10),
  ('随便你', '用于表示无所谓', 'daily', 11),
  ('我来帮你', '用于表示愿意帮忙', 'daily', 12),
  ('我同意', '用于表示赞同', 'daily', 13),
  ('我不知道', '用于表示不知情', 'daily', 14),
  ('我懂了', '用于表示理解', 'daily', 15),
  ('没关系', '用于安慰他人', 'daily', 16),
  ('我很高兴', '用于表达开心', 'daily', 17),
  ('我很着急', '用于描述紧张或焦虑', 'daily', 18),
  ('我没听见', '用于表示没听清', 'daily', 19),
  ('我在路上', '用于告知正前往之中', 'daily', 20),
  ('小心点', '用于提醒注意安全', 'daily', 21),
  ('我在想', '用于表示正在考虑', 'daily', 22),
  ('我想睡觉', '用于表示困倦', 'daily', 23),
  ('我忘了', '用于承认忘记', 'daily', 24),
  ('我饿了', NULL, 'daily', 25),
  ('你有空吗', NULL, 'daily', 26),
  ('我保证', NULL, 'daily', 27),
  ('关灯', NULL, 'daily', 28),
  ('去散步', NULL, 'daily', 29),
  ('我不在乎', NULL, 'daily', 30),
  ('我很无聊', NULL, 'daily', 31),
  ('真可惜', NULL, 'daily', 32),
  ('我想休息一下', NULL, 'daily', 33),
  ('真好吃', NULL, 'daily', 34),
  ('我很生气', NULL, 'daily', 35),
  ('我很抱歉', NULL, 'daily', 36),
  ('你说得对', NULL, 'daily', 37),
  ('我需要帮助', NULL, 'daily', 38),
  ('耳听为虚,眼见为实', '/', 'proverb', 39),
  ('吃一堑,长一智', '/', 'proverb', 40),
  ('熟能生巧', '/', 'proverb', 41),
  ('一分耕耘,一分收获', '/', 'proverb', 42),
  ('人无远虑,必有近忧', '/', 'proverb', 43),
  ('不入虎穴,焉得虎子', '/', 'proverb', 44),
  ('近朱者赤,近墨者黑', '/', 'proverb', 45),
  ('井底之蛙', NULL, 'proverb', 46),
  ('画蛇添足', NULL, 'proverb', 47),
  ('亡羊补牢', NULL, 'proverb', 48),
  ('隔墙有耳', NULL, 'proverb', 49),
  ('三思而后行', '英语无对等。', 'proverb', 50),
  ('杯水车薪', NULL, 'proverb', 51)
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
    ('我不太确定', 'I''m not sure', 'neutral', '一般场合表达不确定性', 'I''m not sure if the meeting is at 3 PM.', '我不太确定会议是不是在下午三点。', 1),
    ('我不太确定', 'I have no idea', 'casual', '随意表达完全不知情', 'I have no idea where she went after dinner.', '晚饭后她去哪儿了,我不太确定。', 2),
    ('我不太确定', 'I can''t confirm that', 'formal', '正式场合强调信息不足', 'I can''t confirm that the report will be ready by Friday.', '报告能不能在周五前准备好,我不太确定。', 3),
    ('我来试试', 'Let me give it a shot', 'casual', '朋友间尝试新事物', 'I''m not sure if I can fix it, but let me give it a shot.', '我不确定我能不能修好它,但我来试试。', 1),
    ('我来试试', 'I''ll give it a try', 'neutral', '一般场合尝试新事物', 'I''ve never cooked Italian food before, but I''ll give it a try.', '我从来没有做过意大利菜,但我来试试。', 2),
    ('我来试试', 'I''ll take that on', 'formal', '正式场合尝试做某事', 'The manager said, ''I''ll take that on and handle the negotiations.''', '经理说:“我来试试,负责这次谈判。”', 3),
    ('我很期待', 'Can''t wait', 'casual', '朋友间表达对某事的期待', 'Can''t wait for the concert next week!', '我很期待下周的演唱会！', 1),
    ('我很期待', 'I''m looking forward to it', 'neutral', '一般场合表达期待', 'I''m looking forward to our meeting next Monday.', '我很期待下周一的会议。', 2),
    ('我很期待', 'I eagerly anticipate', 'formal', '正式场合表达强烈期待', 'I eagerly anticipate the results of the upcoming study.', '我很期待即将到来的研究结果。', 3),
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
    ('我同意', 'I agree', 'neutral', '一般场合表示赞同', 'I agree with your decision to move forward.', '我同意你的决定,继续前进吧。', 1),
    ('我同意', 'I''m with you', 'casual', '朋友间表示赞同', 'I''m with you on trying that new restaurant.', '我同意,我们去试试那家新餐馆吧。', 2),
    ('我同意', 'I''m in full agreement', 'formal', '正式场合表示赞同', 'I''m in full agreement with the proposed policy changes.', '我完全同意你提出的政策变更。', 3),
    ('我不知道', 'I don''t know', 'neutral', '一般场合表示不知情', 'I don''t know where she put the keys.', '我不知道她把钥匙放在哪里了。', 1),
    ('我不知道', 'No idea', 'casual', '朋友间表示不知情', 'No idea what time the movie starts.', '我不知道电影几点开始。', 2),
    ('我不知道', 'I''m not aware of that', 'formal', '正式场合表示不知情', 'I''m not aware of that policy change at work.', '我不知道工作上的政策变动。', 3),
    ('我懂了', 'I get it', 'neutral', '一般场合表示理解', 'After your explanation, I get it now.', '听完你的解释,我懂了。', 1),
    ('我懂了', 'Got it', 'casual', '朋友间表示理解', 'You want the report by Friday? Got it!', '你想要周五前拿到报告?我懂了!', 2),
    ('我懂了', 'I understand completely', 'formal', '正式场合表示理解', 'After reviewing the policy, I understand completely.', '看完政策后,我完全懂了。', 3),
    ('没关系', 'It''s okay', 'neutral', '一般场合安慰他人', 'It''s okay, mistakes happen to everyone.', '没关系,犯错是每个人都会有的事。', 1),
    ('没关系', 'No worries', 'casual', '朋友间安慰他人', 'No worries, you can try again tomorrow.', '没关系,你明天可以再试一次。', 2),
    ('没关系', 'Please don''t worry about it', 'formal', '正式场合安慰他人', 'Please don''t worry about it; we will handle everything.', '没关系,我们会处理好一切的。', 3),
    ('我很高兴', 'I''m happy', 'neutral', '一般场合表达开心', 'I''m happy to hear about your success.', '我很高兴听到你的成功。', 1),
    ('我很高兴', 'I''m thrilled', 'casual', '朋友间表达开心', 'I''m thrilled we won the championship!', '我很高兴我们赢得了冠军!', 2),
    ('我很高兴', 'I am delighted', 'formal', '正式场合表达开心', 'I am delighted to accept the invitation.', '我很高兴接受邀请。', 3),
    ('我很着急', 'I''m anxious', 'neutral', '一般场合表达紧张', 'I''m anxious about the upcoming job interview.', '我很着急,因为明天有个重要的工作面试。', 1),
    ('我很着急', 'I''m freaking out', 'casual', '朋友间表达紧张', 'I''m freaking out about the final exams next week.', '我很着急,因为下周就要期末考试了。', 2),
    ('我很着急', 'I am concerned', 'formal', '正式场合表达紧张', 'I am concerned about the recent changes in policy.', '我很着急,因为最近的政策变动让我感到不安。', 3),
    ('我没听见', 'I didn''t hear you', 'neutral', '一般场合表示没听清', 'I''m sorry, I didn''t hear you. Could you repeat that?', '抱歉,我没听见。你能再说一次吗?', 1),
    ('我没听见', 'I missed that', 'casual', '朋友间表示没听清', 'I missed that, can you say it again?', '我没听见,你能再说一次吗?', 2),
    ('我没听见', 'I did not catch that', 'formal', '正式场合表示没听清', 'I did not catch that last point, could you clarify?', '我没听见最后一点,你能澄清吗?', 3),
    ('我在路上', 'I''m on my way', 'neutral', '一般场合告知在路上', 'Don''t worry, I''m on my way to the meeting.', '别担心,我在路上去开会呢。', 1),
    ('我在路上', 'Heading over now', 'casual', '朋友间告知在路上', 'Hey, I''m heading over now, see you soon!', '嘿,我在路上了,很快见! ', 2),
    ('我在路上', 'I''m en route', 'formal', '正式场合告知在路上', 'I am en route to the conference; I''ll arrive by 3 PM.', '我在路上去参加会议,会在下午三点到。', 3),
    ('小心点', 'Be careful', 'neutral', '一般场合提醒注意安全', 'Be careful when you drive in the rain.', '下雨开车时小心点。', 1),
    ('小心点', 'Watch out', 'casual', '随意场合提醒注意安全', 'Watch out for the wet floor!', '小心点,地滑!', 2),
    ('小心点', 'Exercise caution', 'formal', '正式场合提醒注意安全', 'Please exercise caution when handling chemicals.', '处理化学品时请小心点。', 3),
    ('我在想', 'I''m thinking', 'neutral', '一般场合表示考虑中', 'I''m thinking about applying for that job.', '我在想要不要申请那份工作。', 1),
    ('我在想', 'I''m pondering', 'formal', '正式场合表示考虑中', 'I''m pondering the implications of this decision.', '我在想这个决定的影响。', 2),
    ('我在想', 'I''m mulling it over', 'casual', '朋友间表示考虑中', 'I''m mulling it over before I decide.', '我在想,再做决定。', 3),
    ('我想睡觉', 'I''m sleepy', 'neutral', '一般场合表示困倦', 'After the long meeting, I''m sleepy and need a nap.', '开完长会之后，我想睡觉，需要小憩一下。', 1),
    ('我想睡觉', 'I''m beat', 'casual', '随意场合表示困倦', 'After hiking all day, I''m beat and ready for bed.', '在外面徒步了一整天，我想睡觉，准备去睡了。', 2),
    ('我想睡觉', 'I''m quite tired', 'formal', '正式场合表示困倦', 'After the conference, I''m quite tired and need to rest.', '参加完会议后，我想睡觉，需要休息一下。', 3),
    ('我忘了', 'I forgot', 'neutral', '一般场合承认忘记', 'I forgot to bring my keys to the office.', '今天早上出门时我忘了带钥匙。', 1),
    ('我忘了', 'It slipped my mind', 'casual', '随意场合承认忘记', 'I was supposed to call her, but it slipped my mind.', '我本来要打电话给她,但我忘了。', 2),
    ('我忘了', 'It escaped my memory', 'formal', '正式场合承认忘记', 'Her birthday escaped my memory this year, unfortunately.', '很不幸,今年我忘了她的生日。', 3),
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
    ('真好吃', 'This is delicious!', 'casual', '朋友聚餐时', 'Wow, this is delicious! Did you make it?', '哇,真好吃!是你做的吗?', 1),
    ('真好吃', 'The food tastes great.', 'neutral', '一般场合用餐时', 'The food tastes great. What''s the recipe?', '这食物真好吃。配方是什么?', 2),
    ('真好吃', 'The cuisine is exquisite.', 'formal', '正式场合用餐时', 'The cuisine is exquisite. My compliments to the chef.', '这道菜真好吃。请代我向厨师致意。', 3),
    ('我很生气', 'I''m pissed off', 'casual', '非正式场合表达愤怒时', 'I''m pissed off because they canceled the concert.', '他们取消了演唱会,我很生气。', 1),
    ('我很生气', 'I''m annoyed', 'neutral', '一般场合表达不满时', 'I''m annoyed by the constant noise from the construction.', '施工的噪音不断,我很生气。', 2),
    ('我很生气', 'I am quite displeased', 'formal', '正式场合表达不悦时', 'I am quite displeased with the service at the restaurant.', '餐厅的服务让我很生气。', 3),
    ('我很抱歉', 'I''m really sorry', 'casual', '随意对话中道歉', 'I''m really sorry for breaking your mug.', '我很抱歉打破了你的杯子。', 1),
    ('我很抱歉', 'I apologize', 'neutral', '一般场合表达歉意', 'I apologize for the delay in response.', '我很抱歉回复晚了。', 2),
    ('我很抱歉', 'I extend my apologies', 'formal', '正式书面或对上级道歉', 'I extend my apologies for the oversight in the report.', '我很抱歉报告中的疏漏。', 3),
    ('你说得对', 'You''re right', 'casual', '随意同意他人观点', 'You''re right, this movie is really good.', '你说得对,这电影确实不错。', 1),
    ('你说得对', 'That is correct', 'neutral', '一般场合确认他人正确', 'That is correct, the meeting starts at 3 PM.', '你说得对,会议三点开始。', 2),
    ('你说得对', 'You are absolutely correct', 'formal', '正式场合强调对方正确', 'You are absolutely correct in your assessment.', '你说得对,你的评估很准确。', 3),
    ('我需要帮助', 'I need a hand', 'casual', '随意请求帮助', 'I need a hand with these boxes.', '我需要帮助搬这些箱子。', 1),
    ('我需要帮助', 'I need some assistance', 'neutral', '一般场合请求帮助', 'I need some assistance with my computer.', '我需要帮助修一下电脑。', 2),
    ('我需要帮助', 'I require assistance', 'formal', '正式场合请求帮助', 'I require assistance in finalizing the report.', '我需要帮助完成报告。', 3),
    ('耳听为虚,眼见为实', 'I''ll believe it when I see it.', 'casual', '怀疑未经证实的信息', 'They say the movie''s fantastic, but I''ll believe it when I see it.', '他们说这电影很棒,但耳听为虚,眼见为实。', 1),
    ('耳听为虚,眼见为实', 'Seeing is believing.', 'neutral', '强调实证的重要性', 'People were skeptical about the new invention, but seeing is believing.', '人们对新发明表示怀疑,但耳听为虚,眼见为实。', 2),
    ('吃一堑,长一智', 'Live and learn.', 'casual', '生活中学到教训后', 'I won''t make that mistake again. Live and learn.', '我不会再犯那个错误了。吃一堑,长一智。', 1),
    ('吃一堑,长一智', 'Experience is the best teacher.', 'neutral', '谈论经验的重要性', 'After failing the exam, he realized experience is the best teacher.', '考试失败后,他意识到吃一堑,长一智。', 2),
    ('熟能生巧', 'Practice makes perfect.', 'casual', '鼓励多加练习', 'Keep practicing the piano. Practice makes perfect.', '继续练习钢琴吧,熟能生巧。', 1),
    ('熟能生巧', 'Repetition breeds skill.', 'neutral', '强调重复练习的价值', 'They say repetition breeds skill, so keep at it.', '他们说熟能生巧,所以坚持下去。', 2),
    ('一分耕耘,一分收获', 'You reap what you sow.', 'neutral', '讨论努力与结果的关系', 'His hard work paid off; you reap what you sow.', '他的努力得到了回报;一分耕耘,一分收获。', 1),
    ('一分耕耘,一分收获', 'Effort brings reward.', 'formal', '正式场合谈论努力的价值', 'The success of the project shows that effort brings reward.', '项目的成功表明一分耕耘,一分收获。', 2),
    ('人无远虑,必有近忧', 'Failing to plan is planning to fail.', 'formal', '强调计划的重要性', 'Without a strategy, the company floundered. Failing to plan is planning to fail.', '没有策略,公司陷入困境。人无远虑,必有近忧。', 1),
    ('人无远虑,必有近忧', 'Look before you leap.', 'neutral', '提醒谨慎行事', 'Before investing in stocks, remember to look before you leap.', '在投资股票前,记得人无远虑,必有近忧。', 2),
    ('不入虎穴,焉得虎子', 'No risk, no reward.', 'neutral', '谈论冒险的重要性', 'Starting your own business is tough, but no risk, no reward.', '创业很难,但不入虎穴,焉得虎子。', 1),
    ('不入虎穴,焉得虎子', 'Fortune favors the bold.', 'formal', '正式场合鼓励冒险', 'He took a chance and succeeded. Fortune favors the bold.', '他冒险并成功了。不入虎穴,焉得虎子。', 2),
    ('近朱者赤,近墨者黑', 'Birds of a feather flock together.', 'neutral', '形容人以类聚', 'He started hanging out with musicians and became one himself. Birds of a feather flock together.', '他开始和音乐家们混在一起,自己也成了音乐家。近朱者赤,近墨者黑。', 1),
    ('近朱者赤,近墨者黑', 'You are judged by the company you keep.', 'formal', '正式场合谈论交友影响', 'Her reputation suffered because of her friends. You are judged by the company you keep.', '她的名声因朋友受损。近朱者赤,近墨者黑。', 2),
    ('井底之蛙', 'A frog in a well.', 'neutral', '形容见识短浅的人', 'He thinks his small town is the whole world; he''s a frog in a well.', '他以为小镇就是整个世界,真是井底之蛙。', 1),
    ('井底之蛙', 'You''re living in a bubble.', 'casual', '指出对方视野狭窄', 'You''ve never traveled outside your city? You''re living in a bubble.', '你从没出过城? 真是井底之蛙。', 2),
    ('画蛇添足', 'You''re overdoing it.', 'casual', '朋友间提醒画蛇添足', 'Adding more spices will ruin the dish. You''re overdoing it.', '加更多香料会毁了这道菜,你这就是画蛇添足。', 1),
    ('画蛇添足', 'That''s unnecessary embellishment.', 'neutral', '指出某人多此一举', 'The extra chapter doesn''t add value; it''s unnecessary embellishment.', '加的那一章没有意义,这就是画蛇添足。', 2),
    ('亡羊补牢', 'Better late than never.', 'casual', '朋友间鼓励及时补救', 'You finally started exercising? Better late than never!', '你终于开始锻炼了? 亡羊补牢,犹未晚也!', 1),
    ('亡羊补牢', 'It''s not too late to fix it.', 'neutral', '鼓励改正错误', 'The project can still meet the deadline. It''s not too late to fix it.', '项目仍能按期完成。亡羊补牢,犹未晚也。', 2),
    ('隔墙有耳', 'Walls have ears.', 'neutral', '提醒小心说话', 'Don''t discuss sensitive topics here. Walls have ears.', '别在这里讨论敏感话题。隔墙有耳。', 1),
    ('隔墙有耳', 'You never know who''s listening.', 'casual', '提醒注意保密', 'Lower your voice. You never know who''s listening.', '小声点。隔墙有耳。', 2),
    ('三思而后行', 'Think twice before you act.', 'neutral', '建议他人仔细考虑时', 'Before you quit your job, think twice before you act.', '在你辞职之前,三思而后行。', 1),
    ('三思而后行', 'It''s better to be safe than sorry.', 'casual', '劝人多加小心时', 'Bring a jacket; it''s better to be safe than sorry.', '带上夹克,三思而后行。', 2),
    ('三思而后行', 'Exercise caution before proceeding.', 'formal', '正式建议谨慎行事时', 'In regulatory matters, it''s wise to exercise caution before proceeding.', '在监管事务中,理应三思而后行。', 3),
    ('杯水车薪', 'a drop in the bucket', 'casual', '捐款或资源量小', 'Our donation is just a drop in the bucket compared to their need.', '跟他们的需求比,我们的捐款只是杯水车薪。', 1),
    ('杯水车薪', 'barely makes a dent', 'neutral', '职场供应链谈影响甚微', 'This quantity barely makes a dent in the shortage.', '这点数量对缓解短缺几乎没有影响。杯水车薪而已。', 2),
    ('杯水车薪', 'nowhere near enough', 'formal', '正式场合说远远不够', 'The current funding is nowhere near enough to finish the project.', '现有资金要完成这个项目远远不够。真是杯水车薪。', 3)
  ) AS v(cn_phrase, rendition, register, scene_hint, example_en, example_zh, sort_order)
  JOIN vocab_cn_expressions e ON e.cn_phrase = v.cn_phrase;

-- ── validate:六行都必须是 t(重跑本文件任意次,结果不变)──
SELECT '表达恰 51 条' AS expect,
       (SELECT count(*) FROM vocab_cn_expressions) = 51 AS ok
UNION ALL
SELECT '说法恰 133 条',
       (SELECT count(*) FROM vocab_cn_renditions) = 133
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
