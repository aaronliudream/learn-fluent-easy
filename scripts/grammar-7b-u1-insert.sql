-- 7A Starter 语法题进库(方案B Step1)。幂等:可重复跑。
-- 生成自 scripts/7b-u1-for-cc.json | 4 个语法点 / 20 道题

-- A. junior_grammar_points 加 volume/unit 列(单元归属;旧点保持 NULL → 单元视图自动隐藏)
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS volume text;
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS unit text;

-- B. 建 4 个新语法点(每考点一个;code 唯一,幂等)
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g7bu1.01', '①Why (询问原因)', 'A1', 7, '对应:7B U1', '', 1, '7B', 'U1'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g7bu1.01');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g7bu1.02', '②Where (询问地点)', 'A1', 7, '对应:7B U1', '', 2, '7B', 'U1'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g7bu1.02');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g7bu1.03', '③because (引出原因)', 'A1', 7, '对应:7B U1', '', 3, '7B', 'U1'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g7bu1.03');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g7bu1.04', '④名词复数 (规则+不规则)', 'A1', 7, '对应:7B U1', '', 4, '7B', 'U1'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g7bu1.04');

-- 兜底:若点已存在但缺 volume/unit(重跑场景),补齐
UPDATE public.junior_grammar_points SET volume='7B', unit='U1' WHERE code='g7bu1.01' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='7B', unit='U1' WHERE code='g7bu1.02' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='7B', unit='U1' WHERE code='g7bu1.03' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='7B', unit='U1' WHERE code='g7bu1.04' AND (volume IS NULL OR unit IS NULL);

-- C. 插 20 道题(按 point code 挂 point_id;按 point+stem 去重幂等)
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu1.01'), '— ____ do you like penguins so much? — Because they''re very cute.', 'Where', 'Why', 'When', 'What', 'B', '', 'mcq', 1, 1, 'g7bu1.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu1.01' AND q.stem='— ____ do you like penguins so much? — Because they''re very cute.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu1.01'), '— ____ don''t you like snakes? — Because they''re scary.', 'Where', 'Who', 'Why', 'What', 'C', '', 'mcq', 1, 2, 'g7bu1.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu1.01' AND q.stem='— ____ don''t you like snakes? — Because they''re scary.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu1.01'), '— ____ do you like elephants? — Because they are clever.', 'Where', 'When', 'Why', 'What', 'C', '', 'mcq', 1, 3, 'g7bu1.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu1.01' AND q.stem='— ____ do you like elephants? — Because they are clever.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu1.01'), '— ____ are you happy? — Because it''s my birthday.', 'Where', 'Who', 'What', 'Why', 'D', '', 'mcq', 1, 4, 'g7bu1.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu1.01' AND q.stem='— ____ are you happy? — Because it''s my birthday.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu1.01'), '— ____ do you like the zoo? — Because it''s great fun.', 'When', 'Where', 'What', 'Why', 'D', '', 'mcq', 1, 5, 'g7bu1.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu1.01' AND q.stem='— ____ do you like the zoo? — Because it''s great fun.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu1.02'), '— ____ are penguins from? — They''re from Antarctica.', 'What', 'Why', 'Where', 'When', 'C', '', 'mcq', 1, 1, 'g7bu1.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu1.02' AND q.stem='— ____ are penguins from? — They''re from Antarctica.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu1.02'), '— ____ do the elephants live? — They live in the forests.', 'What', 'Who', 'Where', 'Why', 'C', '', 'mcq', 1, 2, 'g7bu1.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu1.02' AND q.stem='— ____ do the elephants live? — They live in the forests.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu1.02'), '— ____ is your favourite animal? — At the zoo.', 'What', 'When', 'Why', 'Where', 'D', '', 'mcq', 1, 3, 'g7bu1.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu1.02' AND q.stem='— ____ is your favourite animal? — At the zoo.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu1.02'), '— ____ are the monkeys? — They''re in the trees.', 'Where', 'What', 'Who', 'Why', 'A', '', 'mcq', 1, 4, 'g7bu1.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu1.02' AND q.stem='— ____ are the monkeys? — They''re in the trees.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu1.02'), '— ____ does Malee live? — She lives in Thailand.', 'Why', 'What', 'Where', 'When', 'C', '', 'mcq', 1, 5, 'g7bu1.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu1.02' AND q.stem='— ____ does Malee live? — She lives in Thailand.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu1.03'), 'I like elephants ____ they are strong and clever.', 'or', 'because', 'and', 'but', 'B', '', 'mcq', 1, 1, 'g7bu1.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu1.03' AND q.stem='I like elephants ____ they are strong and clever.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu1.03'), '— Why do you like monkeys? — ____ they''re clever and funny.', 'And', 'Or', 'Because', 'But', 'C', '', 'mcq', 1, 2, 'g7bu1.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu1.03' AND q.stem='— Why do you like monkeys? — ____ they''re clever and funny.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu1.03'), '— Why are you happy? — ____ it''s my birthday today.', 'But', 'Because', 'Or', 'And', 'B', '', 'mcq', 1, 3, 'g7bu1.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu1.03' AND q.stem='— Why are you happy? — ____ it''s my birthday today.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu1.03'), 'I don''t like sharks ____ they are very scary.', 'or', 'because', 'but', 'and', 'B', '', 'mcq', 1, 4, 'g7bu1.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu1.03' AND q.stem='I don''t like sharks ____ they are very scary.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu1.03'), 'She likes the zoo ____ it''s great fun.', 'but', 'and', 'because', 'or', 'C', '', 'mcq', 1, 5, 'g7bu1.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu1.03' AND q.stem='She likes the zoo ____ it''s great fun.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu1.04'), 'one eagle, two ____', 'eagle', 'eaglees', 'eaglies', 'eagles', 'D', '', 'mcq', 1, 1, 'g7bu1.04'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu1.04' AND q.stem='one eagle, two ____');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu1.04'), 'one fox, two ____', 'foxies', 'foxs', 'foxes', 'fox', 'C', '', 'mcq', 1, 2, 'g7bu1.04'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu1.04' AND q.stem='one fox, two ____');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu1.04'), 'one mouse, two ____ (不规则)', 'mice', 'mouse', 'mouses', 'mices', 'A', '', 'mcq', 1, 3, 'g7bu1.04'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu1.04' AND q.stem='one mouse, two ____ (不规则)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu1.04'), 'one whale, two ____', 'whale', 'whalies', 'whales', 'whalees', 'C', '', 'mcq', 1, 4, 'g7bu1.04'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu1.04' AND q.stem='one whale, two ____');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu1.04'), 'one sheep, two ____ (不规则,不变)', 'sheeps', 'sheep', 'sheepies', 'sheepes', 'B', '', 'mcq', 1, 5, 'g7bu1.04'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu1.04' AND q.stem='one sheep, two ____ (不规则,不变)');

-- D. count 校验(本批,应:语法点 4 / 题 20)
SELECT 'points' AS kind, count(*) FROM public.junior_grammar_points WHERE (volume,unit) IN (('7B','U1'))
UNION ALL SELECT 'questions', count(*) FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE (p.volume,p.unit) IN (('7B','U1'));
