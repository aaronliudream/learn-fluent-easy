-- 7A Starter 语法题进库(方案B Step1)。幂等:可重复跑。
-- 生成自 scripts/8a-u2-for-cc.json | 4 个语法点 / 24 道题

-- A. junior_grammar_points 加 volume/unit 列(单元归属;旧点保持 NULL → 单元视图自动隐藏)
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS volume text;
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS unit text;

-- B. 建 4 个新语法点(每考点一个;code 唯一,幂等)
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g8au2.01', '①Can/Could 表请求 (Can/Could you...)', 'A1', 7, '对应:8A U2', '', 1, '8A', 'U2'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g8au2.01');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g8au2.02', '②Can/Could 表许可 (Can/Could I...)', 'A1', 7, '对应:8A U2', '', 2, '8A', 'U2'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g8au2.02');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g8au2.03', '③祈使句 (Imperatives)', 'A1', 7, '对应:8A U2', '', 3, '8A', 'U2'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g8au2.03');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g8au2.04', '④目的状语 to do (Infinitive of Purpose)', 'A1', 7, '对应:8A U2', '', 4, '8A', 'U2'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g8au2.04');

-- 兜底:若点已存在但缺 volume/unit(重跑场景),补齐
UPDATE public.junior_grammar_points SET volume='8A', unit='U2' WHERE code='g8au2.01' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='8A', unit='U2' WHERE code='g8au2.02' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='8A', unit='U2' WHERE code='g8au2.03' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='8A', unit='U2' WHERE code='g8au2.04' AND (volume IS NULL OR unit IS NULL);

-- C. 插 24 道题(按 point code 挂 point_id;按 point+stem 去重幂等)
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au2.01'), '____ you help me clean the room?', 'Could', 'Are', 'Did', 'Do', 'A', '', 'mcq', 1, 1, 'g8au2.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au2.01' AND q.stem='____ you help me clean the room?');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au2.01'), '____ you please pass me the salt?', 'Were', 'Have', 'Could', 'Did', 'C', '', 'mcq', 1, 2, 'g8au2.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au2.01' AND q.stem='____ you please pass me the salt?');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au2.01'), 'Could you help me carry this heavy box? — ____', 'You''re welcome.', 'I''m fine.', 'Sure, no problem.', 'No, thanks.', 'C', '', 'mcq', 1, 3, 'g8au2.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au2.01' AND q.stem='Could you help me carry this heavy box? — ____');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au2.01'), '____ you please sweep the floor? — OK, I''ll do it at once.', 'Do', 'Could', 'Are', 'Has', 'B', '', 'mcq', 1, 4, 'g8au2.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au2.01' AND q.stem='____ you please sweep the floor? — OK, I''ll do it at once.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au2.01'), 'Could you please clean your room today? — ____', 'You''re welcome.', 'Sure.', 'Never mind.', 'No, thanks.', 'B', '', 'mcq', 1, 5, 'g8au2.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au2.01' AND q.stem='Could you please clean your room today? — ____');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au2.01'), '____ you open the window, please?', 'Were', 'Have', 'Did', 'Could', 'D', '', 'mcq', 1, 6, 'g8au2.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au2.01' AND q.stem='____ you open the window, please?');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au2.02'), '____ I use your computer? — Yes, if you are careful.', 'Could', 'Did', 'Do', 'Are', 'A', '', 'mcq', 1, 1, 'g8au2.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au2.02' AND q.stem='____ I use your computer? — Yes, if you are careful.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au2.02'), '____ I borrow your pen for a moment?', 'Were', 'Have', 'Did', 'Could', 'D', '', 'mcq', 1, 2, 'g8au2.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au2.02' AND q.stem='____ I borrow your pen for a moment?');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au2.02'), 'Can I go to the movies? — Of course, but you ____ do your homework first.', 'may', 'can', 'are', 'have to', 'D', '', 'mcq', 1, 3, 'g8au2.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au2.02' AND q.stem='Can I go to the movies? — Of course, but you ____ do your homework first.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au2.02'), 'Could I hang out with my friends after lunch? — Sorry, you have to ____ up your things first.', 'wash', 'sweep', 'pack', 'clean', 'C', '', 'mcq', 1, 4, 'g8au2.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au2.02' AND q.stem='Could I hang out with my friends after lunch? — Sorry, you have to ____ up your things first.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au2.02'), '____ I invite my friends to the party? — Sure.', 'Could', 'Are', 'Do', 'Did', 'A', '', 'mcq', 1, 5, 'g8au2.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au2.02' AND q.stem='____ I invite my friends to the party? — Sure.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au2.02'), 'Can I watch TV now? — ____', 'No, you can''t. Do your homework first.', 'You''re welcome.', 'I''m fine.', 'Never mind.', 'A', '', 'mcq', 1, 6, 'g8au2.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au2.02' AND q.stem='Can I watch TV now? — ____');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au2.03'), '____ your room before dinner, please.', 'To clean', 'Cleans', 'Clean', 'Cleaning', 'C', '', 'mcq', 1, 1, 'g8au2.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au2.03' AND q.stem='____ your room before dinner, please.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au2.03'), '____ leave your toys on the floor!', 'Doesn''t', 'No', 'Don''t', 'Not', 'C', '', 'mcq', 1, 2, 'g8au2.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au2.03' AND q.stem='____ leave your toys on the floor!');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au2.03'), 'Please ____ down and have some tea.', 'sits', 'to sit', 'sit', 'sitting', 'C', '', 'mcq', 1, 3, 'g8au2.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au2.03' AND q.stem='Please ____ down and have some tea.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au2.03'), '____ me pull the heavy luggage into the house.', 'Helping', 'To help', 'Helps', 'Help', 'D', '', 'mcq', 1, 4, 'g8au2.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au2.03' AND q.stem='____ me pull the heavy luggage into the house.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au2.03'), '____ be late for the family dinner!', 'No', 'Doesn''t', 'Not', 'Don''t', 'D', '', 'mcq', 1, 5, 'g8au2.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au2.03' AND q.stem='____ be late for the family dinner!');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au2.03'), '____ quiet, please. The baby is sleeping.', 'Is', 'Being', 'Are', 'Be', 'D', '', 'mcq', 1, 6, 'g8au2.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au2.03' AND q.stem='____ quiet, please. The baby is sleeping.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au2.04'), 'We got up early ____ the train.', 'catches', 'catching', 'catch', 'to catch', 'D', '', 'mcq', 1, 1, 'g8au2.04'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au2.04' AND q.stem='We got up early ____ the train.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au2.04'), 'My parents went to the kitchen ____ with the cooking.', 'helps', 'to help', 'helping', 'help', 'B', '', 'mcq', 1, 2, 'g8au2.04'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au2.04' AND q.stem='My parents went to the kitchen ____ with the cooking.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au2.04'), 'He went to the market ____ some food for the festival.', 'buying', 'to buy', 'buy', 'buys', 'B', '', 'mcq', 1, 3, 'g8au2.04'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au2.04' AND q.stem='He went to the market ____ some food for the festival.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au2.04'), 'We went home ____ our grandparents.', 'visits', 'visit', 'visiting', 'to visit', 'D', '', 'mcq', 1, 4, 'g8au2.04'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au2.04' AND q.stem='We went home ____ our grandparents.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au2.04'), 'I went to the station ____ my family.', 'to meet', 'meet', 'meets', 'meeting', 'A', '', 'mcq', 1, 5, 'g8au2.04'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au2.04' AND q.stem='I went to the station ____ my family.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au2.04'), 'She stayed up late ____ the room for the party.', 'cleaning', 'cleans', 'clean', 'to clean', 'D', '', 'mcq', 1, 6, 'g8au2.04'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au2.04' AND q.stem='She stayed up late ____ the room for the party.');

-- D. count 校验(本批,应:语法点 4 / 题 24)
SELECT 'points' AS kind, count(*) FROM public.junior_grammar_points WHERE (volume,unit) IN (('8A','U2'))
UNION ALL SELECT 'questions', count(*) FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE (p.volume,p.unit) IN (('8A','U2'));
