-- 7A Starter 语法题进库(方案B Step1)。幂等:可重复跑。
-- 生成自 scripts/7a-u4-for-cc.json | 3 个语法点 / 18 道题

-- A. junior_grammar_points 加 volume/unit 列(单元归属;旧点保持 NULL → 单元视图自动隐藏)
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS volume text;
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS unit text;

-- B. 建 3 个新语法点(每考点一个;code 唯一,幂等)
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g7u4.01', '①and (并列)', 'A1', 7, '对应:7A U4', '', 1, '7A', 'U4'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g7u4.01');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g7u4.02', '②but (转折)', 'A1', 7, '对应:7A U4', '', 2, '7A', 'U4'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g7u4.02');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g7u4.03', '③because (原因)', 'A1', 7, '对应:7A U4', '', 3, '7A', 'U4'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g7u4.03');

-- 兜底:若点已存在但缺 volume/unit(重跑场景),补齐
UPDATE public.junior_grammar_points SET volume='7A', unit='U4' WHERE code='g7u4.01' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='7A', unit='U4' WHERE code='g7u4.02' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='7A', unit='U4' WHERE code='g7u4.03' AND (volume IS NULL OR unit IS NULL);

-- C. 插 18 道题(按 point code 挂 point_id;按 point+stem 去重幂等)
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u4.01'), 'I have art ____ geography today.', 'and', 'or', 'but', 'because', 'A', '', 'mcq', 1, 1, 'g7u4.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u4.01' AND q.stem='I have art ____ geography today.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u4.01'), 'Music is fun ____ we learn a lot of new songs.', 'or', 'but', 'and', 'because', 'C', '', 'mcq', 1, 2, 'g7u4.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u4.01' AND q.stem='Music is fun ____ we learn a lot of new songs.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u4.01'), 'I like maths, ____ I like history too.', 'but', 'or', 'and', 'because', 'C', '', 'mcq', 1, 3, 'g7u4.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u4.01' AND q.stem='I like maths, ____ I like history too.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u4.01'), 'She is kind, ____ she is beautiful.', 'but', 'because', 'and', 'or', 'C', '', 'mcq', 1, 4, 'g7u4.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u4.01' AND q.stem='She is kind, ____ she is beautiful.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u4.01'), 'We study Chinese, ____ we study PE.', 'or', 'but', 'and', 'because', 'C', '', 'mcq', 1, 5, 'g7u4.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u4.01' AND q.stem='We study Chinese, ____ we study PE.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u4.01'), 'My teacher is nice ____ helpful.', 'but', 'or', 'because', 'and', 'D', '', 'mcq', 1, 6, 'g7u4.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u4.01' AND q.stem='My teacher is nice ____ helpful.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u4.02'), 'History is my favourite subject, ____ my sister doesn''t like it.', 'because', 'but', 'or', 'and', 'B', '', 'mcq', 1, 1, 'g7u4.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u4.02' AND q.stem='History is my favourite subject, ____ my sister doesn''t like it.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u4.02'), 'I like all the subjects, ____ maths is my favourite.', 'but', 'or', 'because', 'and', 'A', '', 'mcq', 1, 2, 'g7u4.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u4.02' AND q.stem='I like all the subjects, ____ maths is my favourite.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u4.02'), 'It''s interesting, ____ it''s difficult for me.', 'or', 'and', 'because', 'but', 'D', '', 'mcq', 1, 3, 'g7u4.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u4.02' AND q.stem='It''s interesting, ____ it''s difficult for me.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u4.02'), 'I want to go to the park, ____ it is raining.', 'or', 'but', 'because', 'and', 'B', '', 'mcq', 1, 4, 'g7u4.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u4.02' AND q.stem='I want to go to the park, ____ it is raining.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u4.02'), 'He is very smart, ____ he is not good at English.', 'because', 'and', 'or', 'but', 'D', '', 'mcq', 1, 5, 'g7u4.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u4.02' AND q.stem='He is very smart, ____ he is not good at English.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u4.02'), 'I like science, ____ I''m not good at it.', 'but', 'or', 'and', 'because', 'A', '', 'mcq', 1, 6, 'g7u4.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u4.02' AND q.stem='I like science, ____ I''m not good at it.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u4.03'), 'I like music ____ the class is fun.', 'and', 'or', 'but', 'because', 'D', '', 'mcq', 1, 1, 'g7u4.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u4.03' AND q.stem='I like music ____ the class is fun.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u4.03'), 'I like maths ____ I am good with numbers.', 'or', 'and', 'but', 'because', 'D', '', 'mcq', 1, 2, 'g7u4.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u4.03' AND q.stem='I like maths ____ I am good with numbers.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u4.03'), 'I like English ____ my teacher is nice.', 'because', 'but', 'and', 'or', 'A', '', 'mcq', 1, 3, 'g7u4.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u4.03' AND q.stem='I like English ____ my teacher is nice.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u4.03'), 'I want to be a scientist ____ maths is useful.', 'or', 'and', 'but', 'because', 'D', '', 'mcq', 1, 4, 'g7u4.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u4.03' AND q.stem='I want to be a scientist ____ maths is useful.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u4.03'), 'I like history ____ I learn about the past.', 'and', 'because', 'or', 'but', 'B', '', 'mcq', 1, 5, 'g7u4.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u4.03' AND q.stem='I like history ____ I learn about the past.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u4.03'), 'Emma likes history ____ it is interesting.', 'and', 'but', 'or', 'because', 'D', '', 'mcq', 1, 6, 'g7u4.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u4.03' AND q.stem='Emma likes history ____ it is interesting.');

-- D. count 校验(本批,应:语法点 3 / 题 18)
SELECT 'points' AS kind, count(*) FROM public.junior_grammar_points WHERE (volume,unit) IN (('7A','U4'))
UNION ALL SELECT 'questions', count(*) FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE (p.volume,p.unit) IN (('7A','U4'));
