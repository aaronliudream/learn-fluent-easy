-- 7A Starter 语法题进库(方案B Step1)。幂等:可重复跑。
-- 生成自 scripts/7b-u6-for-cc.json | 2 个语法点 / 12 道题

-- A. junior_grammar_points 加 volume/unit 列(单元归属;旧点保持 NULL → 单元视图自动隐藏)
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS volume text;
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS unit text;

-- B. 建 2 个新语法点(每考点一个;code 唯一,幂等)
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g7bu6.01', '①一般现在时 (习惯/常态)', 'A1', 7, '对应:7B U6', '', 1, '7B', 'U6'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g7bu6.01');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g7bu6.02', '②现在进行时 (此刻正在进行)', 'A1', 7, '对应:7B U6', '', 2, '7B', 'U6'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g7bu6.02');

-- 兜底:若点已存在但缺 volume/unit(重跑场景),补齐
UPDATE public.junior_grammar_points SET volume='7B', unit='U6' WHERE code='g7bu6.01' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='7B', unit='U6' WHERE code='g7bu6.02' AND (volume IS NULL OR unit IS NULL);

-- C. 插 12 道题(按 point code 挂 point_id;按 point+stem 去重幂等)
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu6.01'), 'In my hometown, the sun ____ at around 6 a.m. in summer.', 'rises', 'rising', 'is rising', 'rise', 'A', '', 'mcq', 1, 1, 'g7bu6.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu6.01' AND q.stem='In my hometown, the sun ____ at around 6 a.m. in summer.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu6.01'), 'She always ____ her favourite sweater in winter.', 'wear', 'wears', 'wearing', 'is wearing', 'B', '', 'mcq', 1, 2, 'g7bu6.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu6.01' AND q.stem='She always ____ her favourite sweater in winter.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu6.01'), 'People often ____ kites in this season.', 'flies', 'are flying', 'fly', 'flying', 'C', '', 'mcq', 1, 3, 'g7bu6.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu6.01' AND q.stem='People often ____ kites in this season.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu6.01'), 'It ____ quite often in London.', 'rains', 'raining', 'is raining', 'rain', 'A', '', 'mcq', 1, 4, 'g7bu6.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu6.01' AND q.stem='It ____ quite often in London.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu6.01'), 'We usually ____ in when it snows.', 'stays', 'staying', 'stay', 'are staying', 'C', '', 'mcq', 1, 5, 'g7bu6.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu6.01' AND q.stem='We usually ____ in when it snows.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu6.01'), 'It ____ cold here every winter.', 'getting', 'is getting', 'gets', 'get', 'C', '', 'mcq', 1, 6, 'g7bu6.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu6.01' AND q.stem='It ____ cold here every winter.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu6.02'), 'Look, it ____! That''s amazing! It doesn''t usually snow here.', 'snow', 'snows', 'snowing', 'is snowing', 'D', '', 'mcq', 1, 1, 'g7bu6.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu6.02' AND q.stem='Look, it ____! That''s amazing! It doesn''t usually snow here.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu6.02'), 'What ____ the boys ____ at the moment?', 'do; do', 'are; doing', 'is; doing', 'are; do', 'B', '', 'mcq', 1, 2, 'g7bu6.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu6.02' AND q.stem='What ____ the boys ____ at the moment?');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu6.02'), 'It ____ outside now, so please take your umbrella.', 'is raining', 'rains', 'raining', 'rain', 'A', '', 'mcq', 1, 3, 'g7bu6.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu6.02' AND q.stem='It ____ outside now, so please take your umbrella.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu6.02'), 'The wind ____ hard right now.', 'blow', 'blows', 'blowing', 'is blowing', 'D', '', 'mcq', 1, 4, 'g7bu6.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu6.02' AND q.stem='The wind ____ hard right now.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu6.02'), 'Listen! Someone ____ in the next room.', 'singing', 'sing', 'is singing', 'sings', 'C', '', 'mcq', 1, 5, 'g7bu6.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu6.02' AND q.stem='Listen! Someone ____ in the next room.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu6.02'), 'I ____ at the beach at the moment.', 'sunbathing', 'sunbathe', 'sunbathes', 'am sunbathing', 'D', '', 'mcq', 1, 6, 'g7bu6.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu6.02' AND q.stem='I ____ at the beach at the moment.');

-- D. count 校验(本批,应:语法点 2 / 题 12)
SELECT 'points' AS kind, count(*) FROM public.junior_grammar_points WHERE (volume,unit) IN (('7B','U6'))
UNION ALL SELECT 'questions', count(*) FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE (p.volume,p.unit) IN (('7B','U6'));
