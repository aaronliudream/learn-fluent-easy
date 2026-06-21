-- 7A Starter 语法题进库(方案B Step1)。幂等:可重复跑。
-- 生成自 scripts/8a-u4-for-cc.json | 2 个语法点 / 13 道题

-- A. junior_grammar_points 加 volume/unit 列(单元归属;旧点保持 NULL → 单元视图自动隐藏)
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS volume text;
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS unit text;

-- B. 建 2 个新语法点(每考点一个;code 唯一,幂等)
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g8au4.01', '①最高级 (the + 形容词/副词最高级)', 'A1', 7, '对应:8A U4', '', 1, '8A', 'U4'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g8au4.01');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g8au4.02', '②one of the + 最高级 + 复数名词', 'A1', 7, '对应:8A U4', '', 2, '8A', 'U4'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g8au4.02');

-- 兜底:若点已存在但缺 volume/unit(重跑场景),补齐
UPDATE public.junior_grammar_points SET volume='8A', unit='U4' WHERE code='g8au4.01' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='8A', unit='U4' WHERE code='g8au4.02' AND (volume IS NULL OR unit IS NULL);

-- C. 插 13 道题(按 point code 挂 point_id;按 point+stem 去重幂等)
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au4.01'), 'The blue whale is the ____ animal in the world.', 'most large', 'larger', 'largest', 'large', 'C', '', 'mcq', 1, 1, 'g8au4.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au4.01' AND q.stem='The blue whale is the ____ animal in the world.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au4.01'), 'Mount Qomolangma is the ____ mountain in the world.', 'most high', 'higher', 'high', 'highest', 'D', '', 'mcq', 1, 2, 'g8au4.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au4.01' AND q.stem='Mount Qomolangma is the ____ mountain in the world.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au4.01'), 'I think pandas are the ____ animals in the world.', 'cutest', 'cute', 'most cute', 'cuter', 'A', '', 'mcq', 1, 3, 'g8au4.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au4.01' AND q.stem='I think pandas are the ____ animals in the world.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au4.01'), 'Bamboo is one of the ____ growing plants.', 'faster', 'fastest', 'most fast', 'fast', 'B', '', 'mcq', 1, 4, 'g8au4.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au4.01' AND q.stem='Bamboo is one of the ____ growing plants.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au4.01'), 'Which do you think is the ____, the rose, the peony, or the lotus?', 'most beautiful', 'more beautiful', 'beautifullest', 'beautiful', 'A', '', 'mcq', 1, 5, 'g8au4.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au4.01' AND q.stem='Which do you think is the ____, the rose, the peony, or the lotus?');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au4.01'), 'The cheetah runs the ____ among all land animals.', 'fastest', 'faster', 'fast', 'most fast', 'A', '', 'mcq', 1, 6, 'g8au4.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au4.01' AND q.stem='The cheetah runs the ____ among all land animals.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au4.01'), 'Bamboo is the ____ plant for pandas. (good→?)', 'good', 'most good', 'best', 'better', 'C', '', 'mcq', 1, 7, 'g8au4.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au4.01' AND q.stem='Bamboo is the ____ plant for pandas. (good→?)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au4.02'), 'The tiger is one of the ____ animals in Asia.', 'stronger', 'most strong', 'strong', 'strongest', 'D', '', 'mcq', 1, 1, 'g8au4.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au4.02' AND q.stem='The tiger is one of the ____ animals in Asia.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au4.02'), 'The giant sequoia is one of the ____ trees in the world.', 'tall', 'most tall', 'tallest', 'taller', 'C', '', 'mcq', 1, 2, 'g8au4.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au4.02' AND q.stem='The giant sequoia is one of the ____ trees in the world.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au4.02'), 'Blue whales are one of the most amazing ____ on Earth.', 'animal', 'animals', 'animales', 'an animal', 'B', '', 'mcq', 1, 3, 'g8au4.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au4.02' AND q.stem='Blue whales are one of the most amazing ____ on Earth.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au4.02'), 'Bamboo is one of the most useful ____ in the world.', 'plant', 'a plant', 'plantes', 'plants', 'D', '', 'mcq', 1, 4, 'g8au4.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au4.02' AND q.stem='Bamboo is one of the most useful ____ in the world.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au4.02'), 'The ginkgo is one of the ____ living trees on earth.', 'ancient', 'more ancient', 'most ancient', 'ancientest', 'C', '', 'mcq', 1, 5, 'g8au4.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au4.02' AND q.stem='The ginkgo is one of the ____ living trees on earth.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au4.02'), 'Bees are one of the most interesting ____ in the world.', 'an animal', 'animales', 'animal', 'animals', 'D', '', 'mcq', 1, 6, 'g8au4.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au4.02' AND q.stem='Bees are one of the most interesting ____ in the world.');

-- D. count 校验(本批,应:语法点 2 / 题 13)
SELECT 'points' AS kind, count(*) FROM public.junior_grammar_points WHERE (volume,unit) IN (('8A','U4'))
UNION ALL SELECT 'questions', count(*) FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE (p.volume,p.unit) IN (('8A','U4'));
