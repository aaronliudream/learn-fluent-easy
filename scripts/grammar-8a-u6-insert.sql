-- 7A Starter 语法题进库(方案B Step1)。幂等:可重复跑。
-- 生成自 scripts/8a-u6-for-cc.json | 3 个语法点 / 18 道题

-- A. junior_grammar_points 加 volume/unit 列(单元归属;旧点保持 NULL → 单元视图自动隐藏)
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS volume text;
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS unit text;

-- B. 建 3 个新语法点(每考点一个;code 唯一,幂等)
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g8au6.01', '①be going to 表将来计划 (am/is/are going to)', 'A1', 7, '对应:8A U6', '', 1, '8A', 'U6'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g8au6.01');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g8au6.02', '②Wh- 疑问句 with be going to', 'A1', 7, '对应:8A U6', '', 2, '8A', 'U6'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g8au6.02');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g8au6.03', '③want to + 动词原形 (谈理想)', 'A1', 7, '对应:8A U6', '', 3, '8A', 'U6'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g8au6.03');

-- 兜底:若点已存在但缺 volume/unit(重跑场景),补齐
UPDATE public.junior_grammar_points SET volume='8A', unit='U6' WHERE code='g8au6.01' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='8A', unit='U6' WHERE code='g8au6.02' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='8A', unit='U6' WHERE code='g8au6.03' AND (volume IS NULL OR unit IS NULL);

-- C. 插 18 道题(按 point code 挂 point_id;按 point+stem 去重幂等)
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au6.01'), 'I ____ going to visit my grandparents this weekend.', 'be', 'is', 'are', 'am', 'D', '', 'mcq', 1, 1, 'g8au6.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au6.01' AND q.stem='I ____ going to visit my grandparents this weekend.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au6.01'), 'Tom ____ going to be a doctor.', 'are', 'am', 'be', 'is', 'D', '', 'mcq', 1, 2, 'g8au6.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au6.01' AND q.stem='Tom ____ going to be a doctor.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au6.01'), 'They ____ going to play football tomorrow.', 'am', 'is', 'are', 'be', 'C', '', 'mcq', 1, 3, 'g8au6.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au6.01' AND q.stem='They ____ going to play football tomorrow.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au6.01'), 'My father is going to ____ me to the park.', 'took', 'take', 'takes', 'taking', 'B', '', 'mcq', 1, 4, 'g8au6.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au6.01' AND q.stem='My father is going to ____ me to the park.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au6.01'), 'She ____ going to waste time on games.', 'amn''t', 'don''t', 'isn''t', 'aren''t', 'C', '', 'mcq', 1, 5, 'g8au6.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au6.01' AND q.stem='She ____ going to waste time on games.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au6.01'), '____ you going to read more books this year?', 'Am', 'Is', 'Do', 'Are', 'D', '', 'mcq', 1, 6, 'g8au6.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au6.01' AND q.stem='____ you going to read more books this year?');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au6.02'), '____ are you going to do this weekend?', 'Which', 'Where', 'What', 'Who', 'C', '', 'mcq', 1, 1, 'g8au6.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au6.02' AND q.stem='____ are you going to do this weekend?');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au6.02'), '____ are you going to start your plan?', 'Which', 'Who', 'When', 'Whose', 'C', '', 'mcq', 1, 2, 'g8au6.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au6.02' AND q.stem='____ are you going to start your plan?');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au6.02'), '____ is he going to work in the future?', 'What', 'Which', 'Where', 'Whose', 'C', '', 'mcq', 1, 3, 'g8au6.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au6.02' AND q.stem='____ is he going to work in the future?');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au6.02'), '____ are you going to achieve your dream?', 'How', 'Which', 'What', 'Who', 'A', '', 'mcq', 1, 4, 'g8au6.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au6.02' AND q.stem='____ are you going to achieve your dream?');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au6.02'), 'What ____ Lily going to become?', 'are', 'is', 'am', 'do', 'B', '', 'mcq', 1, 5, 'g8au6.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au6.02' AND q.stem='What ____ Lily going to become?');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au6.02'), 'Where ____ they going to study English?', 'does', 'are', 'am', 'is', 'B', '', 'mcq', 1, 6, 'g8au6.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au6.02' AND q.stem='Where ____ they going to study English?');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au6.03'), 'I want ____ an engineer.', 'to be', 'being', 'be', 'am', 'A', '', 'mcq', 1, 1, 'g8au6.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au6.03' AND q.stem='I want ____ an engineer.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au6.03'), 'Lucy wants ____ a nurse.', 'to become', 'became', 'become', 'becoming', 'A', '', 'mcq', 1, 2, 'g8au6.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au6.03' AND q.stem='Lucy wants ____ a nurse.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au6.03'), 'They want ____ English well.', 'to learn', 'learning', 'learn', 'learned', 'A', '', 'mcq', 1, 3, 'g8au6.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au6.03' AND q.stem='They want ____ English well.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au6.03'), 'Tom wants ____ harder next year.', 'to study', 'studying', 'studied', 'study', 'A', '', 'mcq', 1, 4, 'g8au6.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au6.03' AND q.stem='Tom wants ____ harder next year.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au6.03'), 'She ____ to become a teacher.', 'wanting', 'wants', 'want', 'to want', 'B', '', 'mcq', 1, 5, 'g8au6.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au6.03' AND q.stem='She ____ to become a teacher.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au6.03'), 'My brother wants ____ others in the future.', 'help', 'helps', 'helping', 'to help', 'D', '', 'mcq', 1, 6, 'g8au6.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au6.03' AND q.stem='My brother wants ____ others in the future.');

-- D. count 校验(本批,应:语法点 3 / 题 18)
SELECT 'points' AS kind, count(*) FROM public.junior_grammar_points WHERE (volume,unit) IN (('8A','U6'))
UNION ALL SELECT 'questions', count(*) FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE (p.volume,p.unit) IN (('8A','U6'));
