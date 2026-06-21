-- 7A Starter 语法题进库(方案B Step1)。幂等:可重复跑。
-- 生成自 scripts/7b-u4-for-cc.json | 2 个语法点 / 12 道题

-- A. junior_grammar_points 加 volume/unit 列(单元归属;旧点保持 NULL → 单元视图自动隐藏)
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS volume text;
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS unit text;

-- B. 建 2 个新语法点(每考点一个;code 唯一,幂等)
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g7bu4.01', '①可数名词 (复数形式)', 'A1', 7, '对应:7B U4', '', 1, '7B', 'U4'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g7bu4.01');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g7bu4.02', '②不可数名词 (量词搭配 a ... of)', 'A1', 7, '对应:7B U4', '', 2, '7B', 'U4'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g7bu4.02');

-- 兜底:若点已存在但缺 volume/unit(重跑场景),补齐
UPDATE public.junior_grammar_points SET volume='7B', unit='U4' WHERE code='g7bu4.01' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='7B', unit='U4' WHERE code='g7bu4.02' AND (volume IS NULL OR unit IS NULL);

-- C. 插 12 道题(按 point code 挂 point_id;按 point+stem 去重幂等)
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu4.01'), 'There are many ____ on the plate.', 'cookys', 'cookiess', 'cookie', 'cookies', 'D', '', 'mcq', 1, 1, 'g7bu4.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu4.01' AND q.stem='There are many ____ on the plate.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu4.01'), 'I eat two ____ every day.', 'apple', 'applies', 'apples', 'applees', 'C', '', 'mcq', 1, 2, 'g7bu4.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu4.01' AND q.stem='I eat two ____ every day.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu4.01'), 'How many ____ are there in the bowl?', 'beanies', 'bean', 'beans', 'beanes', 'C', '', 'mcq', 1, 3, 'g7bu4.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu4.01' AND q.stem='How many ____ are there in the bowl?');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu4.01'), 'She bought three ____ for her lunch.', 'chips', 'chip', 'chipes', 'chipies', 'A', '', 'mcq', 1, 4, 'g7bu4.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu4.01' AND q.stem='She bought three ____ for her lunch.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu4.01'), 'The little boy likes eating ____.', 'strawberry', 'strawberrys', 'strawberries', 'strawberryes', 'C', '', 'mcq', 1, 5, 'g7bu4.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu4.01' AND q.stem='The little boy likes eating ____.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu4.01'), 'We need some ____ for the salad.', 'tomatos', 'tomatoes', 'tomatoies', 'tomato', 'B', '', 'mcq', 1, 6, 'g7bu4.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu4.01' AND q.stem='We need some ____ for the salad.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu4.02'), 'Would you like ____ tea?', 'a bowl of', 'a piece of', 'many', 'a cup of', 'D', '', 'mcq', 1, 1, 'g7bu4.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu4.02' AND q.stem='Would you like ____ tea?');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu4.02'), 'I''d like ____ rice for lunch.', 'a glass of', 'a cup of', 'a bowl of', 'two', 'C', '', 'mcq', 1, 2, 'g7bu4.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu4.02' AND q.stem='I''d like ____ rice for lunch.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu4.02'), 'She wants ____ bread for breakfast.', 'a piece of', 'a cup of', 'three', 'a glass of', 'A', '', 'mcq', 1, 3, 'g7bu4.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu4.02' AND q.stem='She wants ____ bread for breakfast.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu4.02'), 'He drinks ____ milk every morning.', 'a piece of', 'a bowl of', 'a glass of', 'many', 'C', '', 'mcq', 1, 4, 'g7bu4.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu4.02' AND q.stem='He drinks ____ milk every morning.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu4.02'), 'How ____ sugar is there in the soft drink?', 'some', 'much', 'a few', 'many', 'B', '', 'mcq', 1, 5, 'g7bu4.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu4.02' AND q.stem='How ____ sugar is there in the soft drink?');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu4.02'), 'I want some ____. (不可数,不加s)', 'meat', 'meates', 'a meat', 'meats', 'A', '', 'mcq', 1, 6, 'g7bu4.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu4.02' AND q.stem='I want some ____. (不可数,不加s)');

-- D. count 校验(本批,应:语法点 2 / 题 12)
SELECT 'points' AS kind, count(*) FROM public.junior_grammar_points WHERE (volume,unit) IN (('7B','U4'))
UNION ALL SELECT 'questions', count(*) FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE (p.volume,p.unit) IN (('7B','U4'));
