-- 7A Starter 语法题进库(方案B Step1)。幂等:可重复跑。
-- 生成自 scripts/8b-u5-for-cc.json | 2 个语法点 / 12 道题

-- A. junior_grammar_points 加 volume/unit 列(单元归属;旧点保持 NULL → 单元视图自动隐藏)
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS volume text;
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS unit text;

-- B. 建 2 个新语法点(每考点一个;code 唯一,幂等)
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g8bu5.01', '①过去进行时 (was/were + doing)', 'A1', 7, '对应:8B U5', '', 1, '8B', 'U5'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g8bu5.01');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g8bu5.02', '②when / while 用法区分', 'A1', 7, '对应:8B U5', '', 2, '8B', 'U5'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g8bu5.02');

-- 兜底:若点已存在但缺 volume/unit(重跑场景),补齐
UPDATE public.junior_grammar_points SET volume='8B', unit='U5' WHERE code='g8bu5.01' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='8B', unit='U5' WHERE code='g8bu5.02' AND (volume IS NULL OR unit IS NULL);

-- C. 插 12 道题(按 point code 挂 point_id;按 point+stem 去重幂等)
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu5.01'), 'The wind ____ strongly last night.', 'blew', 'was blowing', 'is blowing', 'blows', 'B', '', 'mcq', 1, 1, 'g8bu5.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu5.01' AND q.stem='The wind ____ strongly last night.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu5.01'), 'They ____ for the typhoon yesterday afternoon.', 'prepared', 'prepare', 'are preparing', 'were preparing', 'D', '', 'mcq', 1, 2, 'g8bu5.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu5.01' AND q.stem='They ____ for the typhoon yesterday afternoon.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu5.01'), 'It ____ heavily at that time.', 'rains', 'rained', 'was raining', 'is raining', 'C', '', 'mcq', 1, 3, 'g8bu5.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu5.01' AND q.stem='It ____ heavily at that time.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu5.01'), 'What ____ you doing at 8:00 yesterday evening?', 'are', 'were', 'was', 'did', 'B', '', 'mcq', 1, 4, 'g8bu5.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu5.01' AND q.stem='What ____ you doing at 8:00 yesterday evening?');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu5.01'), 'They ____ dinner when I called. (否定)', 'don''t have', 'aren''t having', 'weren''t having', 'didn''t have', 'C', '', 'mcq', 1, 5, 'g8bu5.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu5.01' AND q.stem='They ____ dinner when I called. (否定)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu5.01'), 'We ____ at home when the storm came.', 'stayed', 'are staying', 'stay', 'were staying', 'D', '', 'mcq', 1, 6, 'g8bu5.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu5.01' AND q.stem='We ____ at home when the storm came.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu5.02'), 'I was reading ____ the lights went out. (后接突发动作)', 'while', 'if', 'because', 'when', 'D', '', 'mcq', 1, 1, 'g8bu5.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu5.02' AND q.stem='I was reading ____ the lights went out. (后接突发动作)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu5.02'), '____ I was sleeping, it was raining. (后接持续动作)', 'Because', 'When', 'If', 'While', 'D', '', 'mcq', 1, 2, 'g8bu5.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu5.02' AND q.stem='____ I was sleeping, it was raining. (后接持续动作)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu5.02'), 'Tom was sleeping ____ the earthquake happened.', 'although', 'when', 'unless', 'because', 'B', '', 'mcq', 1, 3, 'g8bu5.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu5.02' AND q.stem='Tom was sleeping ____ the earthquake happened.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu5.02'), '____ we were driving home, the strong winds started.', 'While', 'Since', 'Because', 'If', 'A', '', 'mcq', 1, 4, 'g8bu5.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu5.02' AND q.stem='____ we were driving home, the strong winds started.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu5.02'), 'The power went out ____ my father was making dinner.', 'while', 'if', 'although', 'until', 'A', '', 'mcq', 1, 5, 'g8bu5.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu5.02' AND q.stem='The power went out ____ my father was making dinner.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu5.02'), 'My neighbour called ____ my family was having dinner.', 'because', 'although', 'when', 'unless', 'C', '', 'mcq', 1, 6, 'g8bu5.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu5.02' AND q.stem='My neighbour called ____ my family was having dinner.');

-- D. count 校验(本批,应:语法点 2 / 题 12)
SELECT 'points' AS kind, count(*) FROM public.junior_grammar_points WHERE (volume,unit) IN (('8B','U5'))
UNION ALL SELECT 'questions', count(*) FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE (p.volume,p.unit) IN (('8B','U5'));
