-- 7A Starter 语法题进库(方案B Step1)。幂等:可重复跑。
-- 生成自 scripts/7a-u3-for-cc.json | 3 个语法点 / 18 道题

-- A. junior_grammar_points 加 volume/unit 列(单元归属;旧点保持 NULL → 单元视图自动隐藏)
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS volume text;
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS unit text;

-- B. 建 3 个新语法点(每考点一个;code 唯一,幂等)
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g7u3.01', '①There be 句型', 'A1', 7, '对应:7A U3', '', 1, '7A', 'U3'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g7u3.01');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g7u3.02', '②方位介词 (next to / behind / across from / between / in front of)', 'A1', 7, '对应:7A U3', '', 2, '7A', 'U3'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g7u3.02');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g7u3.03', '③Where / What 疑问句', 'A1', 7, '对应:7A U3', '', 3, '7A', 'U3'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g7u3.03');

-- 兜底:若点已存在但缺 volume/unit(重跑场景),补齐
UPDATE public.junior_grammar_points SET volume='7A', unit='U3' WHERE code='g7u3.01' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='7A', unit='U3' WHERE code='g7u3.02' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='7A', unit='U3' WHERE code='g7u3.03' AND (volume IS NULL OR unit IS NULL);

-- C. 插 18 道题(按 point code 挂 point_id;按 point+stem 去重幂等)
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u3.01'), 'There ____ a smart whiteboard in our classroom.', 'is', 'are', 'am', 'be', 'A', '', 'mcq', 1, 1, 'g7u3.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u3.01' AND q.stem='There ____ a smart whiteboard in our classroom.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u3.01'), '____ there any lockers in your school?', 'Do', 'Be', 'Is', 'Are', 'D', '', 'mcq', 1, 2, 'g7u3.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u3.01' AND q.stem='____ there any lockers in your school?');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u3.01'), 'No, there ____ any lockers.', 'doesn''t', 'aren''t', 'isn''t', 'don''t', 'B', '', 'mcq', 1, 3, 'g7u3.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u3.01' AND q.stem='No, there ____ any lockers.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u3.01'), 'There ____ two blackboards and a teacher''s desk in the room.', 'is', 'am', 'are', 'be', 'C', '', 'mcq', 1, 4, 'g7u3.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u3.01' AND q.stem='There ____ two blackboards and a teacher''s desk in the room.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u3.01'), '____ there a dining hall in your school?', 'Does', 'Are', 'Be', 'Is', 'D', '', 'mcq', 1, 5, 'g7u3.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u3.01' AND q.stem='____ there a dining hall in your school?');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u3.01'), 'There ____ 40 student desks in the classroom.', 'be', 'are', 'am', 'is', 'B', '', 'mcq', 1, 6, 'g7u3.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u3.01' AND q.stem='There ____ 40 student desks in the classroom.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u3.02'), 'The dining hall is ____ the sports field.', 'behind', 'between', 'next to', 'across from', 'D', '', 'mcq', 1, 1, 'g7u3.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u3.02' AND q.stem='The dining hall is ____ the sports field.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u3.02'), 'The teacher''s desk is ____ the blackboard.', 'across from', 'between', 'next to', 'in front of', 'C', '', 'mcq', 1, 2, 'g7u3.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u3.02' AND q.stem='The teacher''s desk is ____ the blackboard.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u3.02'), 'The student centre is ____ the library and the gym.', 'behind', 'between', 'next to', 'across from', 'B', '', 'mcq', 1, 3, 'g7u3.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u3.02' AND q.stem='The student centre is ____ the library and the gym.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u3.02'), 'There are some trees ____ the sports field.', 'between', 'behind', 'in front of', 'next to', 'C', '', 'mcq', 1, 4, 'g7u3.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u3.02' AND q.stem='There are some trees ____ the sports field.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u3.02'), 'The classroom building is ____ the sports field.', 'between', 'behind', 'across from', 'next to', 'B', '', 'mcq', 1, 5, 'g7u3.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u3.02' AND q.stem='The classroom building is ____ the sports field.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u3.02'), 'This week I sit ____ my best friend, Han Lin.', 'behind', 'next to', 'across from', 'between', 'B', '', 'mcq', 1, 6, 'g7u3.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u3.02' AND q.stem='This week I sit ____ my best friend, Han Lin.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u3.03'), '____ is the library? — It''s behind the classroom building.', 'How', 'What', 'Where', 'Who', 'C', '', 'mcq', 1, 1, 'g7u3.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u3.03' AND q.stem='____ is the library? — It''s behind the classroom building.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u3.03'), '____ is your new classroom like? — It''s large and clean.', 'Where', 'Who', 'What', 'How', 'C', '', 'mcq', 1, 2, 'g7u3.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u3.03' AND q.stem='____ is your new classroom like? — It''s large and clean.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u3.03'), '____ are the books? — They are on the desk.', 'How', 'Who', 'What', 'Where', 'D', '', 'mcq', 1, 3, 'g7u3.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u3.03' AND q.stem='____ are the books? — They are on the desk.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u3.03'), '____ is special in your classroom?', 'What', 'Who', 'How', 'Where', 'A', '', 'mcq', 1, 4, 'g7u3.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u3.03' AND q.stem='____ is special in your classroom?');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u3.03'), '____ do you sit? — I sit next to the window.', 'How', 'Who', 'Where', 'What', 'C', '', 'mcq', 1, 5, 'g7u3.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u3.03' AND q.stem='____ do you sit? — I sit next to the window.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u3.03'), '____ is your favourite place? — The dining hall.', 'How', 'What', 'Who', 'Where', 'B', '', 'mcq', 1, 6, 'g7u3.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u3.03' AND q.stem='____ is your favourite place? — The dining hall.');

-- D. count 校验(本批,应:语法点 3 / 题 18)
SELECT 'points' AS kind, count(*) FROM public.junior_grammar_points WHERE (volume,unit) IN (('7A','U3'))
UNION ALL SELECT 'questions', count(*) FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE (p.volume,p.unit) IN (('7A','U3'));
