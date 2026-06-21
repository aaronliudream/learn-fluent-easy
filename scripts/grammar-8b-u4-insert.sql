-- 7A Starter 语法题进库(方案B Step1)。幂等:可重复跑。
-- 生成自 scripts/8b-u4-for-cc.json | 2 个语法点 / 13 道题

-- A. junior_grammar_points 加 volume/unit 列(单元归属;旧点保持 NULL → 单元视图自动隐藏)
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS volume text;
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS unit text;

-- B. 建 2 个新语法点(每考点一个;code 唯一,幂等)
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g8bu4.01', '①比较级 (地理数据比较)', 'A1', 7, '对应:8B U4', '', 1, '8B', 'U4'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g8bu4.01');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g8bu4.02', '②最高级 (地理之最)', 'A1', 7, '对应:8B U4', '', 2, '8B', 'U4'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g8bu4.02');

-- 兜底:若点已存在但缺 volume/unit(重跑场景),补齐
UPDATE public.junior_grammar_points SET volume='8B', unit='U4' WHERE code='g8bu4.01' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='8B', unit='U4' WHERE code='g8bu4.02' AND (volume IS NULL OR unit IS NULL);

-- C. 插 13 道题(按 point code 挂 point_id;按 point+stem 去重幂等)
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu4.01'), 'The Yangtze River is ____ than the Yellow River.', 'longest', 'more long', 'longer', 'long', 'C', '', 'mcq', 1, 1, 'g8bu4.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu4.01' AND q.stem='The Yangtze River is ____ than the Yellow River.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu4.01'), 'This mountain is ____ than the one we climbed last year.', 'higher', 'highest', 'high', 'more high', 'A', '', 'mcq', 1, 2, 'g8bu4.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu4.01' AND q.stem='This mountain is ____ than the one we climbed last year.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu4.01'), 'Africa is ____ than Europe.', 'more big', 'bigger', 'big', 'biggest', 'B', '', 'mcq', 1, 3, 'g8bu4.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu4.01' AND q.stem='Africa is ____ than Europe.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu4.01'), 'He walked ____ than his partner in the race. (far→?)', 'far', 'more far', 'farther', 'farthest', 'C', '', 'mcq', 1, 4, 'g8bu4.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu4.01' AND q.stem='He walked ____ than his partner in the race. (far→?)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu4.01'), 'The water is ____ in this area than in that area.', 'more deep', 'deeper', 'deep', 'deepest', 'B', '', 'mcq', 1, 5, 'g8bu4.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu4.01' AND q.stem='The water is ____ in this area than in that area.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu4.01'), 'The rainforest is ____ than the grassland.', 'beautifuller', 'beautiful', 'beautifulest', 'more beautiful', 'D', '', 'mcq', 1, 6, 'g8bu4.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu4.01' AND q.stem='The rainforest is ____ than the grassland.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu4.01'), 'Lake Baikal is ____ than West Lake.', 'deepest', 'more deep', 'deeper', 'deep', 'C', '', 'mcq', 1, 7, 'g8bu4.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu4.01' AND q.stem='Lake Baikal is ____ than West Lake.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu4.02'), 'Mount Qomolangma is the ____ mountain in the world.', 'high', 'higher', 'most high', 'highest', 'D', '', 'mcq', 1, 1, 'g8bu4.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu4.02' AND q.stem='Mount Qomolangma is the ____ mountain in the world.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu4.02'), 'The Sahara is the ____ desert in the world.', 'bigger', 'most big', 'big', 'biggest', 'D', '', 'mcq', 1, 2, 'g8bu4.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu4.02' AND q.stem='The Sahara is the ____ desert in the world.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu4.02'), 'The Mariana Trench is the ____ point in the ocean.', 'deep', 'deepest', 'deeper', 'most deep', 'B', '', 'mcq', 1, 3, 'g8bu4.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu4.02' AND q.stem='The Mariana Trench is the ____ point in the ocean.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu4.02'), 'The Yangtze River travels the ____ in China. (far→?)', 'most far', 'farther', 'farthest', 'far', 'C', '', 'mcq', 1, 4, 'g8bu4.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu4.02' AND q.stem='The Yangtze River travels the ____ in China. (far→?)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu4.02'), 'This is the ____ experience I have ever had.', 'more wonderful', 'wonderfuller', 'most wonderful', 'wonderfullest', 'C', '', 'mcq', 1, 5, 'g8bu4.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu4.02' AND q.stem='This is the ____ experience I have ever had.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu4.02'), 'The Pacific is the ____ ocean on earth.', 'large', 'larger', 'largest', 'most large', 'C', '', 'mcq', 1, 6, 'g8bu4.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu4.02' AND q.stem='The Pacific is the ____ ocean on earth.');

-- D. count 校验(本批,应:语法点 2 / 题 13)
SELECT 'points' AS kind, count(*) FROM public.junior_grammar_points WHERE (volume,unit) IN (('8B','U4'))
UNION ALL SELECT 'questions', count(*) FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE (p.volume,p.unit) IN (('8B','U4'));
