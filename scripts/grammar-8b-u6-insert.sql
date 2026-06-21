-- 7A Starter 语法题进库(方案B Step1)。幂等:可重复跑。
-- 生成自 scripts/8b-u6-for-cc.json | 1 个语法点 / 10 道题

-- A. junior_grammar_points 加 volume/unit 列(单元归属;旧点保持 NULL → 单元视图自动隐藏)
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS volume text;
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS unit text;

-- B. 建 1 个新语法点(每考点一个;code 唯一,幂等)
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g8bu6.01', '①状语从句 (so...that / unless / as soon as)', 'A1', 7, '对应:8B U6', '', 1, '8B', 'U6'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g8bu6.01');

-- 兜底:若点已存在但缺 volume/unit(重跑场景),补齐
UPDATE public.junior_grammar_points SET volume='8B', unit='U6' WHERE code='g8bu6.01' AND (volume IS NULL OR unit IS NULL);

-- C. 插 10 道题(按 point code 挂 point_id;按 point+stem 去重幂等)
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu6.01'), 'The story was ____ interesting that I read it twice.', 'such', 'very', 'too', 'so', 'D', '', 'mcq', 1, 1, 'g8bu6.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu6.01' AND q.stem='The story was ____ interesting that I read it twice.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu6.01'), 'You will not pass the exam ____ you study hard.', 'as soon as', 'unless', 'although', 'so that', 'B', '', 'mcq', 1, 2, 'g8bu6.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu6.01' AND q.stem='You will not pass the exam ____ you study hard.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu6.01'), 'Please call me ____ you arrive at the airport.', 'although', 'unless', 'as soon as', 'so that', 'C', '', 'mcq', 1, 3, 'g8bu6.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu6.01' AND q.stem='Please call me ____ you arrive at the airport.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu6.01'), 'It was so cold ____ we had to stay at home.', 'so', 'as', 'that', 'than', 'C', '', 'mcq', 1, 4, 'g8bu6.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu6.01' AND q.stem='It was so cold ____ we had to stay at home.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu6.01'), 'Don''t open the gift ____ you get home.', 'until', 'as soon as', 'so that', 'because', 'A', '', 'mcq', 1, 5, 'g8bu6.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu6.01' AND q.stem='Don''t open the gift ____ you get home.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu6.01'), 'In Japan, we bow ____ we meet a teacher.', 'so that', 'as soon as', 'unless', 'although', 'B', '', 'mcq', 1, 6, 'g8bu6.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu6.01' AND q.stem='In Japan, we bow ____ we meet a teacher.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu6.01'), 'Don''t bring food ____ the host asks you to.', 'although', 'unless', 'as soon as', 'so that', 'B', '', 'mcq', 1, 7, 'g8bu6.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu6.01' AND q.stem='Don''t bring food ____ the host asks you to.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu6.01'), 'The bus was ____ crowded that I couldn''t move.', 'such', 'so', 'too', 'very', 'B', '', 'mcq', 1, 8, 'g8bu6.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu6.01' AND q.stem='The bus was ____ crowded that I couldn''t move.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu6.01'), 'Take off your shoes ____ you enter someone''s home.', 'although', 'unless', 'as soon as', 'so that', 'C', '', 'mcq', 1, 9, 'g8bu6.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu6.01' AND q.stem='Take off your shoes ____ you enter someone''s home.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu6.01'), 'Don''t use someone''s first name ____ you know them well.', 'as soon as', 'so that', 'because', 'unless', 'D', '', 'mcq', 1, 10, 'g8bu6.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu6.01' AND q.stem='Don''t use someone''s first name ____ you know them well.');

-- D. count 校验(本批,应:语法点 1 / 题 10)
SELECT 'points' AS kind, count(*) FROM public.junior_grammar_points WHERE (volume,unit) IN (('8B','U6'))
UNION ALL SELECT 'questions', count(*) FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE (p.volume,p.unit) IN (('8B','U6'));
