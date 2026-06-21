-- 7A Starter 语法题进库(方案B Step1)。幂等:可重复跑。
-- 生成自 scripts/8b-u3-for-cc.json | 1 个语法点 / 10 道题

-- A. junior_grammar_points 加 volume/unit 列(单元归属;旧点保持 NULL → 单元视图自动隐藏)
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS volume text;
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS unit text;

-- B. 建 1 个新语法点(每考点一个;code 唯一,幂等)
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g8bu3.01', '①状语从句 (although/until/so that)', 'A1', 7, '对应:8B U3', '', 1, '8B', 'U3'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g8bu3.01');

-- 兜底:若点已存在但缺 volume/unit(重跑场景),补齐
UPDATE public.junior_grammar_points SET volume='8B', unit='U3' WHERE code='g8bu3.01' AND (volume IS NULL OR unit IS NULL);

-- C. 插 10 道题(按 point code 挂 point_id;按 point+stem 去重幂等)
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu3.01'), '____ it was raining heavily, we still went out for a walk.', 'Because', 'Although', 'Until', 'So that', 'B', '', 'mcq', 1, 1, 'g8bu3.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu3.01' AND q.stem='____ it was raining heavily, we still went out for a walk.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu3.01'), '____ he is very young, he can speak three languages.', 'Because', 'Until', 'So that', 'Although', 'D', '', 'mcq', 1, 2, 'g8bu3.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu3.01' AND q.stem='____ he is very young, he can speak three languages.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu3.01'), 'You should wait here ____ the rain stops.', 'until', 'although', 'so that', 'but', 'A', '', 'mcq', 1, 3, 'g8bu3.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu3.01' AND q.stem='You should wait here ____ the rain stops.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu3.01'), 'He didn''t go to bed ____ he finished his homework.', 'until', 'so that', 'but', 'although', 'A', '', 'mcq', 1, 4, 'g8bu3.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu3.01' AND q.stem='He didn''t go to bed ____ he finished his homework.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu3.01'), 'Please speak clearly ____ everyone can hear you.', 'but', 'until', 'so that', 'although', 'C', '', 'mcq', 1, 5, 'g8bu3.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu3.01' AND q.stem='Please speak clearly ____ everyone can hear you.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu3.01'), 'He studied hard ____ he could get a good grade.', 'until', 'although', 'so that', 'but', 'C', '', 'mcq', 1, 6, 'g8bu3.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu3.01' AND q.stem='He studied hard ____ he could get a good grade.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu3.01'), '____ she tried her best, she didn''t pass the exam.', 'Because', 'So that', 'Although', 'Until', 'C', '', 'mcq', 1, 7, 'g8bu3.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu3.01' AND q.stem='____ she tried her best, she didn''t pass the exam.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu3.01'), 'Don''t leave the room ____ the teacher tells you to.', 'until', 'so that', 'but', 'although', 'A', '', 'mcq', 1, 8, 'g8bu3.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu3.01' AND q.stem='Don''t leave the room ____ the teacher tells you to.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu3.01'), 'She saved money ____ she could buy a new computer.', 'so that', 'until', 'although', 'but', 'A', '', 'mcq', 1, 9, 'g8bu3.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu3.01' AND q.stem='She saved money ____ she could buy a new computer.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu3.01'), '____ they lost the game, they felt proud of themselves.', 'Because', 'So that', 'Although', 'Until', 'C', '', 'mcq', 1, 10, 'g8bu3.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu3.01' AND q.stem='____ they lost the game, they felt proud of themselves.');

-- D. count 校验(本批,应:语法点 1 / 题 10)
SELECT 'points' AS kind, count(*) FROM public.junior_grammar_points WHERE (volume,unit) IN (('8B','U3'))
UNION ALL SELECT 'questions', count(*) FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE (p.volume,p.unit) IN (('8B','U3'));
