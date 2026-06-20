-- 7A Starter 语法题进库(方案B Step1)。幂等:可重复跑。
-- 生成自 scripts/7a-u2-for-cc.json | 3 个语法点 / 18 道题

-- A. junior_grammar_points 加 volume/unit 列(单元归属;旧点保持 NULL → 单元视图自动隐藏)
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS volume text;
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS unit text;

-- B. 建 3 个新语法点(每考点一个;code 唯一,幂等)
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g7u2.01', '①名词所有格 (''s)', 'A1', 7, '对应:7A U2', '', 1, '7A', 'U2'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g7u2.01');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g7u2.02', '②动词第三人称单数 (-s/-es)', 'A1', 7, '对应:7A U2', '', 2, '7A', 'U2'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g7u2.02');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g7u2.03', '③一般现在时疑问句与否定句 (do/does)', 'A1', 7, '对应:7A U2', '', 3, '7A', 'U2'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g7u2.03');

-- 兜底:若点已存在但缺 volume/unit(重跑场景),补齐
UPDATE public.junior_grammar_points SET volume='7A', unit='U2' WHERE code='g7u2.01' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='7A', unit='U2' WHERE code='g7u2.02' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='7A', unit='U2' WHERE code='g7u2.03' AND (volume IS NULL OR unit IS NULL);

-- C. 插 18 道题(按 point code 挂 point_id;按 point+stem 去重幂等)
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u2.01'), 'This is ____ cat. It likes fish very much.', 'Kate', 'Kate''', 'Kate''s', 'Kates', 'C', '', 'mcq', 1, 1, 'g7u2.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u2.01' AND q.stem='This is ____ cat. It likes fish very much.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u2.01'), 'Those are ____ desks. They are new.', 'Peter and Emma''s', 'Peter and Emmas', 'Peter''s and Emma''s', 'Peter and Emma', 'A', '', 'mcq', 1, 2, 'g7u2.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u2.01' AND q.stem='Those are ____ desks. They are new.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u2.01'), 'Are these ____ fishing rods?', 'grandpa', 'grandpas''', 'grandpa''s', 'grandpas', 'C', '', 'mcq', 1, 3, 'g7u2.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u2.01' AND q.stem='Are these ____ fishing rods?');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u2.01'), 'This is my ____ piano. She plays it well.', 'mothers''', 'mother''s', 'mother', 'mothers', 'B', '', 'mcq', 1, 4, 'g7u2.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u2.01' AND q.stem='This is my ____ piano. She plays it well.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u2.01'), 'Is this ____ pink hat?', 'Lily''s', 'Lilys''', 'Lilys', 'Lily', 'A', '', 'mcq', 1, 5, 'g7u2.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u2.01' AND q.stem='Is this ____ pink hat?');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u2.01'), 'The red ping pong bat is my ____.', 'grandpa', 'grandpas', 'grandpa''', 'grandpa''s', 'D', '', 'mcq', 1, 6, 'g7u2.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u2.01' AND q.stem='The red ping pong bat is my ____.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u2.02'), 'My dad ____ tennis every week.', 'playes', 'plays', 'play', 'playing', 'B', '', 'mcq', 1, 1, 'g7u2.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u2.02' AND q.stem='My dad ____ tennis every week.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u2.02'), 'She ____ me a story at night.', 'reades', 'reads', 'read', 'reading', 'B', '', 'mcq', 1, 2, 'g7u2.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u2.02' AND q.stem='She ____ me a story at night.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u2.02'), 'My grandpa ____ sport.', 'lovees', 'loving', 'loves', 'love', 'C', '', 'mcq', 1, 3, 'g7u2.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u2.02' AND q.stem='My grandpa ____ sport.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u2.02'), 'He ____ a lot of time fishing.', 'spending', 'spends', 'spendes', 'spend', 'B', '', 'mcq', 1, 4, 'g7u2.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u2.02' AND q.stem='He ____ a lot of time fishing.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u2.02'), 'Sam ____ chess very much.', 'likes', 'like', 'liking', 'likees', 'A', '', 'mcq', 1, 5, 'g7u2.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u2.02' AND q.stem='Sam ____ chess very much.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u2.02'), 'My mother ____ the piano very well.', 'plays', 'play', 'playing', 'playes', 'A', '', 'mcq', 1, 6, 'g7u2.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u2.02' AND q.stem='My mother ____ the piano very well.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u2.03'), '____ you often play ping pong together?', 'Are', 'Is', 'Does', 'Do', 'D', '', 'mcq', 1, 1, 'g7u2.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u2.03' AND q.stem='____ you often play ping pong together?');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u2.03'), '____ your father play any sport?', 'Does', 'Do', 'Is', 'Are', 'A', '', 'mcq', 1, 2, 'g7u2.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u2.03' AND q.stem='____ your father play any sport?');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u2.03'), 'He ____ play the piano.', 'aren''t', 'isn''t', 'doesn''t', 'don''t', 'C', '', 'mcq', 1, 3, 'g7u2.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u2.03' AND q.stem='He ____ play the piano.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u2.03'), '____ she read stories at night?', 'Do', 'Does', 'Are', 'Is', 'B', '', 'mcq', 1, 4, 'g7u2.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u2.03' AND q.stem='____ she read stories at night?');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u2.03'), 'No, he ____ play tennis with me.', 'don''t', 'isn''t', 'aren''t', 'doesn''t', 'D', '', 'mcq', 1, 5, 'g7u2.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u2.03' AND q.stem='No, he ____ play tennis with me.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u2.03'), '____ they have a dog?', 'Is', 'Does', 'Do', 'Are', 'C', '', 'mcq', 1, 6, 'g7u2.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u2.03' AND q.stem='____ they have a dog?');

-- D. count 校验(本批,应:语法点 3 / 题 18)
SELECT 'points' AS kind, count(*) FROM public.junior_grammar_points WHERE (volume,unit) IN (('7A','U2'))
UNION ALL SELECT 'questions', count(*) FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE (p.volume,p.unit) IN (('7A','U2'));
