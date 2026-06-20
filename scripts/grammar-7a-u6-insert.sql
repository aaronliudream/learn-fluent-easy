-- 7A Starter 语法题进库(方案B Step1)。幂等:可重复跑。
-- 生成自 scripts/7a-u6-for-cc.json | 2 个语法点 / 12 道题

-- A. junior_grammar_points 加 volume/unit 列(单元归属;旧点保持 NULL → 单元视图自动隐藏)
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS volume text;
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS unit text;

-- B. 建 2 个新语法点(每考点一个;code 唯一,幂等)
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g7u6.01', '①What time 引导的特殊疑问句 (问具体时刻)', 'A1', 7, '对应:7A U6', '', 1, '7A', 'U6'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g7u6.01');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g7u6.02', '②When 引导的特殊疑问句 (问哪天/什么时候)', 'A1', 7, '对应:7A U6', '', 2, '7A', 'U6'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g7u6.02');

-- 兜底:若点已存在但缺 volume/unit(重跑场景),补齐
UPDATE public.junior_grammar_points SET volume='7A', unit='U6' WHERE code='g7u6.01' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='7A', unit='U6' WHERE code='g7u6.02' AND (volume IS NULL OR unit IS NULL);

-- C. 插 12 道题(按 point code 挂 point_id;按 point+stem 去重幂等)
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u6.01'), '— ____ do you usually get up? — At 6:30 a.m.', 'Where', 'What', 'When', 'What time', 'D', '', 'mcq', 1, 1, 'g7u6.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u6.01' AND q.stem='— ____ do you usually get up? — At 6:30 a.m.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u6.01'), '— ____ does Tom usually go to bed? — At 9:30 p.m.', 'When', 'What', 'Who', 'What time', 'D', '', 'mcq', 1, 2, 'g7u6.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u6.01' AND q.stem='— ____ does Tom usually go to bed? — At 9:30 p.m.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u6.01'), '— ____ do you have lunch? — At 12:00.', 'What time', 'When', 'What', 'Where', 'A', '', 'mcq', 1, 3, 'g7u6.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u6.01' AND q.stem='— ____ do you have lunch? — At 12:00.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u6.01'), '— ____ is your maths class? — It''s at 1:45 p.m.', 'Who', 'When', 'What time', 'What', 'C', '', 'mcq', 1, 4, 'g7u6.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u6.01' AND q.stem='— ____ is your maths class? — It''s at 1:45 p.m.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u6.01'), '— ____ does school begin? — At 9:00.', 'What', 'When', 'What time', 'Where', 'C', '', 'mcq', 1, 5, 'g7u6.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u6.01' AND q.stem='— ____ does school begin? — At 9:00.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u6.01'), '— ____ do you walk to school? — At 7:40.', 'What', 'When', 'Who', 'What time', 'D', '', 'mcq', 1, 6, 'g7u6.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u6.01' AND q.stem='— ____ do you walk to school? — At 7:40.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u6.02'), '— ____ do you do your homework? — In the evening.', 'Where', 'What', 'What time', 'When', 'D', '', 'mcq', 1, 1, 'g7u6.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u6.02' AND q.stem='— ____ do you do your homework? — In the evening.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u6.02'), '— ____ do you visit your grandparents? — On weekends.', 'Who', 'What', 'What time', 'When', 'D', '', 'mcq', 1, 2, 'g7u6.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u6.02' AND q.stem='— ____ do you visit your grandparents? — On weekends.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u6.02'), '— ____ is the school trip? — It''s next Monday.', 'Where', 'When', 'What time', 'What', 'B', '', 'mcq', 1, 3, 'g7u6.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u6.02' AND q.stem='— ____ is the school trip? — It''s next Monday.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u6.02'), '— ____ does she exercise? — In the morning.', 'When', 'Who', 'What', 'What time', 'A', '', 'mcq', 1, 4, 'g7u6.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u6.02' AND q.stem='— ____ does she exercise? — In the morning.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u6.02'), '— ____ do they go to the music club? — On Monday afternoons.', 'What time', 'What', 'Where', 'When', 'D', '', 'mcq', 1, 5, 'g7u6.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u6.02' AND q.stem='— ____ do they go to the music club? — On Monday afternoons.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u6.02'), '— ____ do you read with your parents? — After dinner.', 'Who', 'When', 'What time', 'What', 'B', '', 'mcq', 1, 6, 'g7u6.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u6.02' AND q.stem='— ____ do you read with your parents? — After dinner.');

-- D. count 校验(本批,应:语法点 2 / 题 12)
SELECT 'points' AS kind, count(*) FROM public.junior_grammar_points WHERE (volume,unit) IN (('7A','U6'))
UNION ALL SELECT 'questions', count(*) FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE (p.volume,p.unit) IN (('7A','U6'));
