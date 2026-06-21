-- 7A Starter 语法题进库(方案B Step1)。幂等:可重复跑。
-- 生成自 scripts/8b-u2-for-cc.json | 1 个语法点 / 10 道题

-- A. junior_grammar_points 加 volume/unit 列(单元归属;旧点保持 NULL → 单元视图自动隐藏)
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS volume text;
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS unit text;

-- B. 建 1 个新语法点(每考点一个;code 唯一,幂等)
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g8bu2.01', '①状语从句引导词 (although/until/so that)', 'A1', 7, '对应:8B U2', '', 1, '8B', 'U2'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g8bu2.01');

-- 兜底:若点已存在但缺 volume/unit(重跑场景),补齐
UPDATE public.junior_grammar_points SET volume='8B', unit='U2' WHERE code='g8bu2.01' AND (volume IS NULL OR unit IS NULL);

-- C. 插 10 道题(按 point code 挂 point_id;按 point+stem 去重幂等)
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu2.01'), '____ it rained, they still went out to play basketball.', 'Because', 'Until', 'Although', 'So that', 'C', '', 'mcq', 1, 1, 'g8bu2.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu2.01' AND q.stem='____ it rained, they still went out to play basketball.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu2.01'), 'You won''t understand how he feels ____ you talk to him.', 'although', 'so that', 'but', 'until', 'D', '', 'mcq', 1, 2, 'g8bu2.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu2.01' AND q.stem='You won''t understand how he feels ____ you talk to him.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu2.01'), 'I am studying hard ____ I can get good grades.', 'until', 'so that', 'but', 'although', 'B', '', 'mcq', 1, 3, 'g8bu2.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu2.01' AND q.stem='I am studying hard ____ I can get good grades.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu2.01'), '____ he is young, he knows how to protect himself.', 'Because', 'So that', 'Although', 'Until', 'C', '', 'mcq', 1, 4, 'g8bu2.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu2.01' AND q.stem='____ he is young, he knows how to protect himself.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu2.01'), 'Keep trying ____ you succeed.', 'so that', 'until', 'although', 'but', 'B', '', 'mcq', 1, 5, 'g8bu2.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu2.01' AND q.stem='Keep trying ____ you succeed.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu2.01'), 'She saved money ____ she could buy a new bike.', 'although', 'but', 'so that', 'until', 'C', '', 'mcq', 1, 6, 'g8bu2.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu2.01' AND q.stem='She saved money ____ she could buy a new bike.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu2.01'), '____ the weather was cold, we still had a good time.', 'Until', 'Because', 'So that', 'Although', 'D', '', 'mcq', 1, 7, 'g8bu2.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu2.01' AND q.stem='____ the weather was cold, we still had a good time.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu2.01'), 'Wait here ____ I come back.', 'but', 'until', 'so that', 'although', 'B', '', 'mcq', 1, 8, 'g8bu2.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu2.01' AND q.stem='Wait here ____ I come back.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu2.01'), 'He spoke loudly ____ everyone could hear him.', 'until', 'although', 'so that', 'but', 'C', '', 'mcq', 1, 9, 'g8bu2.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu2.01' AND q.stem='He spoke loudly ____ everyone could hear him.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu2.01'), '____ she was tired, she finished all her homework.', 'Until', 'Because', 'So that', 'Although', 'D', '', 'mcq', 1, 10, 'g8bu2.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu2.01' AND q.stem='____ she was tired, she finished all her homework.');

-- D. count 校验(本批,应:语法点 1 / 题 10)
SELECT 'points' AS kind, count(*) FROM public.junior_grammar_points WHERE (volume,unit) IN (('8B','U2'))
UNION ALL SELECT 'questions', count(*) FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE (p.volume,p.unit) IN (('8B','U2'));
