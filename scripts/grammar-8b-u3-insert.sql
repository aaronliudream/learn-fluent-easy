-- 7A Starter 语法题进库(方案B Step1)。幂等:可重复跑。
-- 生成自 scripts/8b-u3-for-cc.json | 1 个语法点 / 10 道题

-- A. junior_grammar_points 加 volume/unit 列(单元归属;旧点保持 NULL → 单元视图自动隐藏)
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS volume text;
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS unit text;

-- A2. U3 内容更新(状语从句加入 if):先清掉旧 g8bu3.01 的题与点,下面重建为新版(否则会新旧叠加成 20 题)。
DELETE FROM public.junior_grammar_questions WHERE point_id IN (SELECT id FROM public.junior_grammar_points WHERE code='g8bu3.01');
DELETE FROM public.junior_grammar_points WHERE code='g8bu3.01';

-- B. 建 1 个新语法点(每考点一个;code 唯一,幂等)
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g8bu3.01', '①状语从句 (although/until/so that/if)', 'A1', 7, '对应:8B U3', '', 1, '8B', 'U3'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g8bu3.01');

-- 兜底:若点已存在但缺 volume/unit(重跑场景),补齐
UPDATE public.junior_grammar_points SET volume='8B', unit='U3' WHERE code='g8bu3.01' AND (volume IS NULL OR unit IS NULL);

-- C. 插 10 道题(按 point code 挂 point_id;按 point+stem 去重幂等)
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu3.01'), '____ you argued, you are still very close friends.', 'Although', 'Until', 'So that', 'If', 'A', '', 'mcq', 1, 1, 'g8bu3.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu3.01' AND q.stem='____ you argued, you are still very close friends.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu3.01'), 'You won''t know how he feels ____ you talk to him.', 'although', 'until', 'so that', 'if', 'B', '', 'mcq', 1, 2, 'g8bu3.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu3.01' AND q.stem='You won''t know how he feels ____ you talk to him.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu3.01'), 'You can write to your parents ____ they''ll know how you feel.', 'so that', 'if', 'although', 'until', 'A', '', 'mcq', 1, 3, 'g8bu3.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu3.01' AND q.stem='You can write to your parents ____ they''ll know how you feel.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu3.01'), '____ you did something wrong, you should say sorry.', 'Until', 'So that', 'If', 'Although', 'C', '', 'mcq', 1, 4, 'g8bu3.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu3.01' AND q.stem='____ you did something wrong, you should say sorry.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu3.01'), '____ you feel upset, you should speak to someone you trust.', 'Although', 'So that', 'If', 'Until', 'C', '', 'mcq', 1, 5, 'g8bu3.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu3.01' AND q.stem='____ you feel upset, you should speak to someone you trust.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu3.01'), '____ people might hurt you sometimes, it isn''t always on purpose.', 'If', 'Until', 'So that', 'Although', 'D', '', 'mcq', 1, 6, 'g8bu3.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu3.01' AND q.stem='____ people might hurt you sometimes, it isn''t always on purpose.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu3.01'), 'You won''t feel better ____ you share your problems.', 'although', 'until', 'so that', 'if', 'B', '', 'mcq', 1, 7, 'g8bu3.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu3.01' AND q.stem='You won''t feel better ____ you share your problems.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu3.01'), 'Take a break ____ you can clear your mind.', 'until', 'if', 'although', 'so that', 'D', '', 'mcq', 1, 8, 'g8bu3.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu3.01' AND q.stem='Take a break ____ you can clear your mind.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu3.01'), '____ others might say bad things about you, don''t lose confidence.', 'Until', 'So that', 'If', 'Although', 'D', '', 'mcq', 1, 9, 'g8bu3.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu3.01' AND q.stem='____ others might say bad things about you, don''t lose confidence.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu3.01'), '____ I spend more time studying, I''ll get better grades.', 'So that', 'If', 'Until', 'Although', 'B', '', 'mcq', 1, 10, 'g8bu3.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu3.01' AND q.stem='____ I spend more time studying, I''ll get better grades.');

-- D. count 校验(本批,应:语法点 1 / 题 10)
SELECT 'points' AS kind, count(*) FROM public.junior_grammar_points WHERE (volume,unit) IN (('8B','U3'))
UNION ALL SELECT 'questions', count(*) FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE (p.volume,p.unit) IN (('8B','U3'));
