-- 7A Starter 语法题进库(方案B Step1)。幂等:可重复跑。
-- 生成自 scripts/8a-u5-for-cc.json | 3 个语法点 / 18 道题

-- A. junior_grammar_points 加 volume/unit 列(单元归属;旧点保持 NULL → 单元视图自动隐藏)
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS volume text;
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS unit text;

-- B. 建 3 个新语法点(每考点一个;code 唯一,幂等)
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g8au5.01', '①What 引导的感叹句 (What + adj + 名词!)', 'A1', 7, '对应:8A U5', '', 1, '8A', 'U5'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g8au5.01');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g8au5.02', '②How 引导的感叹句 (How + adj/adv + 主语 + 谓语!)', 'A1', 7, '对应:8A U5', '', 2, '8A', 'U5'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g8au5.02');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g8au5.03', '③祈使句 (烹饪语境)', 'A1', 7, '对应:8A U5', '', 3, '8A', 'U5'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g8au5.03');

-- 兜底:若点已存在但缺 volume/unit(重跑场景),补齐
UPDATE public.junior_grammar_points SET volume='8A', unit='U5' WHERE code='g8au5.01' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='8A', unit='U5' WHERE code='g8au5.02' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='8A', unit='U5' WHERE code='g8au5.03' AND (volume IS NULL OR unit IS NULL);

-- C. 插 18 道题(按 point code 挂 point_id;按 point+stem 去重幂等)
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au5.01'), '____ delicious meal it is!', 'How a', 'What a', 'How', 'What', 'B', '', 'mcq', 1, 1, 'g8au5.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au5.01' AND q.stem='____ delicious meal it is!');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au5.01'), '____ beautiful flowers they are!', 'What a', 'How a', 'What', 'How', 'C', '', 'mcq', 1, 2, 'g8au5.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au5.01' AND q.stem='____ beautiful flowers they are!');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au5.01'), '____ nice weather it is today!', 'How a', 'What', 'What a', 'What an', 'B', '', 'mcq', 1, 3, 'g8au5.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au5.01' AND q.stem='____ nice weather it is today!');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au5.01'), '____ exciting game it was!', 'What', 'What an', 'How', 'How an', 'B', '', 'mcq', 1, 4, 'g8au5.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au5.01' AND q.stem='____ exciting game it was!');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au5.01'), '____ useful information it is!', 'What', 'What a', 'How a', 'What an', 'A', '', 'mcq', 1, 5, 'g8au5.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au5.01' AND q.stem='____ useful information it is!');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au5.01'), '____ amazing smell it is!', 'What a', 'How', 'How an', 'What an', 'D', '', 'mcq', 1, 6, 'g8au5.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au5.01' AND q.stem='____ amazing smell it is!');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au5.02'), '____ delicious the dish looks!', 'How', 'What a', 'What', 'How a', 'A', '', 'mcq', 1, 1, 'g8au5.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au5.02' AND q.stem='____ delicious the dish looks!');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au5.02'), '____ well Emma sings!', 'What', 'How', 'What a', 'How a', 'B', '', 'mcq', 1, 2, 'g8au5.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au5.02' AND q.stem='____ well Emma sings!');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au5.02'), '____ terrible the weather is!', 'What a', 'How an', 'How', 'What', 'C', '', 'mcq', 1, 3, 'g8au5.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au5.02' AND q.stem='____ terrible the weather is!');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au5.02'), '____ fantastic the Christmas tree looks!', 'What a', 'How a', 'What', 'How', 'D', '', 'mcq', 1, 4, 'g8au5.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au5.02' AND q.stem='____ fantastic the Christmas tree looks!');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au5.02'), '____ fast the cheetah runs!', 'What a', 'How a', 'What', 'How', 'D', '', 'mcq', 1, 5, 'g8au5.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au5.02' AND q.stem='____ fast the cheetah runs!');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au5.02'), '____ sweet the cake tastes!', 'What a', 'How an', 'How', 'What', 'C', '', 'mcq', 1, 6, 'g8au5.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au5.02' AND q.stem='____ sweet the cake tastes!');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au5.03'), '____ the carrots into small pieces.', 'Cuts', 'To cut', 'Cut', 'Cutting', 'C', '', 'mcq', 1, 1, 'g8au5.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au5.03' AND q.stem='____ the carrots into small pieces.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au5.03'), '____ the eggs before cooking.', 'Washing', 'Washes', 'Wash', 'Washed', 'C', '', 'mcq', 1, 2, 'g8au5.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au5.03' AND q.stem='____ the eggs before cooking.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au5.03'), '____ too much salt in the soup.', 'Not add', 'Didn''t add', 'Don''t add', 'Doesn''t add', 'C', '', 'mcq', 1, 3, 'g8au5.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au5.03' AND q.stem='____ too much salt in the soup.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au5.03'), '____ the milk into the bowl.', 'Pours', 'Pour', 'Pouring', 'Poured', 'B', '', 'mcq', 1, 4, 'g8au5.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au5.03' AND q.stem='____ the milk into the bowl.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au5.03'), '____ the noodles for five minutes.', 'Cooking', 'Cooked', 'Cook', 'Cooks', 'C', '', 'mcq', 1, 5, 'g8au5.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au5.03' AND q.stem='____ the noodles for five minutes.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au5.03'), '____ open the oven while baking.', 'Not', 'Don''t', 'No', 'Doesn''t', 'B', '', 'mcq', 1, 6, 'g8au5.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au5.03' AND q.stem='____ open the oven while baking.');

-- D. count 校验(本批,应:语法点 3 / 题 18)
SELECT 'points' AS kind, count(*) FROM public.junior_grammar_points WHERE (volume,unit) IN (('8A','U5'))
UNION ALL SELECT 'questions', count(*) FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE (p.volume,p.unit) IN (('8A','U5'));
