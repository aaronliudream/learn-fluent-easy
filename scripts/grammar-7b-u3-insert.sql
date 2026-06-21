-- 7A Starter 语法题进库(方案B Step1)。幂等:可重复跑。
-- 生成自 scripts/7b-u3-for-cc.json | 2 个语法点 / 12 道题

-- A. junior_grammar_points 加 volume/unit 列(单元归属;旧点保持 NULL → 单元视图自动隐藏)
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS volume text;
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS unit text;

-- B. 建 2 个新语法点(每考点一个;code 唯一,幂等)
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g7bu3.01', '①名词性物主代词 (mine/yours/hers/his/ours/theirs)', 'A1', 7, '对应:7B U3', '', 1, '7B', 'U3'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g7bu3.01');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g7bu3.02', '②频度副词 (always/usually/often/sometimes/seldom/never)', 'A1', 7, '对应:7B U3', '', 2, '7B', 'U3'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g7bu3.02');

-- 兜底:若点已存在但缺 volume/unit(重跑场景),补齐
UPDATE public.junior_grammar_points SET volume='7B', unit='U3' WHERE code='g7bu3.01' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='7B', unit='U3' WHERE code='g7bu3.02' AND (volume IS NULL OR unit IS NULL);

-- C. 插 12 道题(按 point code 挂 point_id;按 point+stem 去重幂等)
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu3.01'), 'This T-shirt isn''t yours. It''s ____. (我的)', 'I', 'my', 'mine', 'me', 'C', '', 'mcq', 1, 1, 'g7bu3.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu3.01' AND q.stem='This T-shirt isn''t yours. It''s ____. (我的)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu3.01'), 'Whose racket is this? It''s ____. (她的)', 'hers', 'she', 'she''s', 'her', 'A', '', 'mcq', 1, 2, 'g7bu3.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu3.01' AND q.stem='Whose racket is this? It''s ____. (她的)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu3.01'), 'That pen is not mine; it is ____. (他的)', 'he''s', 'he', 'him', 'his', 'D', '', 'mcq', 1, 3, 'g7bu3.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu3.01' AND q.stem='That pen is not mine; it is ____. (他的)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu3.01'), 'These baseballs are not ours. They are ____. (他们的)', 'them', 'theirs', 'they', 'their', 'B', '', 'mcq', 1, 4, 'g7bu3.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu3.01' AND q.stem='These baseballs are not ours. They are ____. (他们的)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu3.01'), 'Your shoes are here. ____ are over there. (我的)', 'I', 'Me', 'My', 'Mine', 'D', '', 'mcq', 1, 5, 'g7bu3.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu3.01' AND q.stem='Your shoes are here. ____ are over there. (我的)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu3.01'), 'Is this bag yours or ____? (他的)', 'he''s', 'he', 'him', 'his', 'D', '', 'mcq', 1, 6, 'g7bu3.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu3.01' AND q.stem='Is this bag yours or ____? (他的)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu3.02'), 'He is very lazy, so he ____ does sports.', 'never', 'usually', 'always', 'often', 'A', '', 'mcq', 1, 1, 'g7bu3.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu3.02' AND q.stem='He is very lazy, so he ____ does sports.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu3.02'), 'I jog every single morning. I ____ miss a day.', 'sometimes', 'often', 'never', 'always', 'C', '', 'mcq', 1, 2, 'g7bu3.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu3.02' AND q.stem='I jog every single morning. I ____ miss a day.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu3.02'), 'My mother loves movies, so she ____ goes to the cinema.', 'hardly ever', 'often', 'seldom', 'never', 'B', '', 'mcq', 1, 3, 'g7bu3.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu3.02' AND q.stem='My mother loves movies, so she ____ goes to the cinema.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu3.02'), 'I''m very busy on working days, so I ____ jog in the afternoon.', 'seldom', 'always', 'usually', 'often', 'A', '', 'mcq', 1, 4, 'g7bu3.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu3.02' AND q.stem='I''m very busy on working days, so I ____ jog in the afternoon.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu3.02'), 'I get up at 6:00 every day. I ____ get up early.', 'never', 'hardly ever', 'always', 'seldom', 'C', '', 'mcq', 1, 5, 'g7bu3.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu3.02' AND q.stem='I get up at 6:00 every day. I ____ get up early.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu3.02'), '— How often do you play? — ____, about once a week.', 'Always', 'Never', 'Hardly ever', 'Sometimes', 'D', '', 'mcq', 1, 6, 'g7bu3.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu3.02' AND q.stem='— How often do you play? — ____, about once a week.');

-- D. count 校验(本批,应:语法点 2 / 题 12)
SELECT 'points' AS kind, count(*) FROM public.junior_grammar_points WHERE (volume,unit) IN (('7B','U3'))
UNION ALL SELECT 'questions', count(*) FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE (p.volume,p.unit) IN (('7B','U3'));
