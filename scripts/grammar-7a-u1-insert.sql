-- 7A Starter 语法题进库(方案B Step1)。幂等:可重复跑。
-- 生成自 scripts/7a-u1-for-cc.json | 3 个语法点 / 18 道题

-- A. junior_grammar_points 加 volume/unit 列(单元归属;旧点保持 NULL → 单元视图自动隐藏)
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS volume text;
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS unit text;

-- B. 建 3 个新语法点(每考点一个;code 唯一,幂等)
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='tense'), 'g7u1.01', '①be动词的现在时 (am/is/are)', 'A1', 7, '对应:7A U1', '', 1, '7A', 'U1'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g7u1.01');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g7u1.02', '②一般疑问句及其简略回答 (Are you...? Yes/No)', 'A1', 7, '对应:7A U1', '', 2, '7A', 'U1'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g7u1.02');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g7u1.03', '③Wh-特殊疑问句 (What/Where/How old/Who/What class)', 'A1', 7, '对应:7A U1', '', 3, '7A', 'U1'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g7u1.03');

-- 兜底:若点已存在但缺 volume/unit(重跑场景),补齐
UPDATE public.junior_grammar_points SET volume='7A', unit='U1' WHERE code='g7u1.01' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='7A', unit='U1' WHERE code='g7u1.02' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='7A', unit='U1' WHERE code='g7u1.03' AND (volume IS NULL OR unit IS NULL);

-- C. 插 18 道题(按 point code 挂 point_id;按 point+stem 去重幂等)
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u1.01'), 'I ____ a student at this school.', 'be', 'is', 'am', 'are', 'C', '', 'mcq', 1, 1, 'g7u1.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u1.01' AND q.stem='I ____ a student at this school.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u1.01'), 'She ____ from Australia.', 'am', 'are', 'be', 'is', 'D', '', 'mcq', 1, 2, 'g7u1.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u1.01' AND q.stem='She ____ from Australia.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u1.01'), 'We ____ in the same class.', 'am', 'are', 'be', 'is', 'B', '', 'mcq', 1, 3, 'g7u1.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u1.01' AND q.stem='We ____ in the same class.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u1.01'), 'He ____ my best friend.', 'do', 'are', 'is', 'am', 'C', '', 'mcq', 1, 4, 'g7u1.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u1.01' AND q.stem='He ____ my best friend.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u1.01'), 'Emma and Ella ____ twins.', 'is', 'are', 'am', 'be', 'B', '', 'mcq', 1, 5, 'g7u1.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u1.01' AND q.stem='Emma and Ella ____ twins.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u1.01'), 'Lin Yu''s favourite animal ____ the panda.', 'are', 'be', 'is', 'am', 'C', '', 'mcq', 1, 6, 'g7u1.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u1.01' AND q.stem='Lin Yu''s favourite animal ____ the panda.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u1.02'), '— Are you Peter? — Yes, ____.', 'you are', 'he is', 'I''m not', 'I am', 'D', '', 'mcq', 1, 1, 'g7u1.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u1.02' AND q.stem='— Are you Peter? — Yes, ____.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u1.02'), '— Is she from Australia? — No, ____.', 'they aren''t', 'she isn''t', 'I''m not', 'she is', 'B', '', 'mcq', 1, 2, 'g7u1.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u1.02' AND q.stem='— Is she from Australia? — No, ____.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u1.02'), '— Are they in the same class? — Yes, ____.', 'I am', 'they aren''t', 'they are', 'we are', 'C', '', 'mcq', 1, 3, 'g7u1.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u1.02' AND q.stem='— Are they in the same class? — Yes, ____.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u1.02'), '— Is he your new teacher? — No, ____.', 'he is', 'I''m not', 'she isn''t', 'he isn''t', 'D', '', 'mcq', 1, 4, 'g7u1.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u1.02' AND q.stem='— Is he your new teacher? — No, ____.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u1.02'), '— Are you in Class 1? — No, ____.', 'he isn''t', 'I''m not', 'I am', 'you aren''t', 'B', '', 'mcq', 1, 5, 'g7u1.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u1.02' AND q.stem='— Are you in Class 1? — No, ____.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u1.02'), '— Are Meimei and Peter friends? — Yes, ____.', 'they aren''t', 'he is', 'we are', 'they are', 'D', '', 'mcq', 1, 6, 'g7u1.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u1.02' AND q.stem='— Are Meimei and Peter friends? — Yes, ____.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u1.03'), '____ is your name? — My name is Peter Brown.', 'Who', 'Where', 'What', 'How', 'C', '', 'mcq', 1, 1, 'g7u1.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u1.03' AND q.stem='____ is your name? — My name is Peter Brown.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u1.03'), '____ are you from? — I''m from the UK.', 'What', 'Who', 'Where', 'How', 'C', '', 'mcq', 1, 2, 'g7u1.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u1.03' AND q.stem='____ are you from? — I''m from the UK.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u1.03'), '____ old are you? — I''m 12 years old.', 'What', 'Who', 'Where', 'How', 'D', '', 'mcq', 1, 3, 'g7u1.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u1.03' AND q.stem='____ old are you? — I''m 12 years old.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u1.03'), '____ is your class teacher? — It''s Ms Gao.', 'Who', 'What', 'Where', 'How', 'A', '', 'mcq', 1, 4, 'g7u1.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u1.03' AND q.stem='____ is your class teacher? — It''s Ms Gao.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u1.03'), '____ class are you in? — I''m in Class 1.', 'What', 'Who', 'How', 'Where', 'A', '', 'mcq', 1, 5, 'g7u1.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u1.03' AND q.stem='____ class are you in? — I''m in Class 1.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u1.03'), '____ is Mr Smith from? — He''s from the US.', 'Who', 'Where', 'What', 'How', 'B', '', 'mcq', 1, 6, 'g7u1.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u1.03' AND q.stem='____ is Mr Smith from? — He''s from the US.');

-- D. count 校验(本批,应:语法点 3 / 题 18)
SELECT 'points' AS kind, count(*) FROM public.junior_grammar_points WHERE (volume,unit) IN (('7A','U1'))
UNION ALL SELECT 'questions', count(*) FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE (p.volume,p.unit) IN (('7A','U1'));
