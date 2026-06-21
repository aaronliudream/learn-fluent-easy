-- 7A Starter 语法题进库(方案B Step1)。幂等:可重复跑。
-- 生成自 scripts/7b-u2-for-cc.json | 3 个语法点 / 15 道题

-- A. junior_grammar_points 加 volume/unit 列(单元归属;旧点保持 NULL → 单元视图自动隐藏)
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS volume text;
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS unit text;

-- B. 建 3 个新语法点(每考点一个;code 唯一,幂等)
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g7bu2.01', '①must / mustn''t (义务与禁止)', 'A1', 7, '对应:7B U2', '', 1, '7B', 'U2'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g7bu2.01');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g7bu2.02', '②can / can''t (允许与不允许)', 'A1', 7, '对应:7B U2', '', 2, '7B', 'U2'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g7bu2.02');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g7bu2.03', '③have to / has to (客观规定)', 'A1', 7, '对应:7B U2', '', 3, '7B', 'U2'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g7bu2.03');

-- 兜底:若点已存在但缺 volume/unit(重跑场景),补齐
UPDATE public.junior_grammar_points SET volume='7B', unit='U2' WHERE code='g7bu2.01' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='7B', unit='U2' WHERE code='g7bu2.02' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='7B', unit='U2' WHERE code='g7bu2.03' AND (volume IS NULL OR unit IS NULL);

-- C. 插 15 道题(按 point code 挂 point_id;按 point+stem 去重幂等)
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu2.01'), 'You ____ talk during the exam. It''s strictly forbidden.', 'must', 'have to', 'can', 'mustn''t', 'D', '', 'mcq', 1, 1, 'g7bu2.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu2.01' AND q.stem='You ____ talk during the exam. It''s strictly forbidden.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu2.01'), 'Students ____ listen to the teacher carefully. It''s a must.', 'must', 'mustn''t', 'don''t have to', 'can''t', 'A', '', 'mcq', 1, 2, 'g7bu2.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu2.01' AND q.stem='Students ____ listen to the teacher carefully. It''s a must.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu2.01'), 'You ____ bring your pets to school. It''s not allowed at all.', 'must', 'mustn''t', 'have to', 'can', 'B', '', 'mcq', 1, 3, 'g7bu2.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu2.01' AND q.stem='You ____ bring your pets to school. It''s not allowed at all.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu2.01'), 'You ____ be late for class. It shows respect for your teacher.', 'may', 'can', 'mustn''t', 'have to', 'C', '', 'mcq', 1, 4, 'g7bu2.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu2.01' AND q.stem='You ____ be late for class. It shows respect for your teacher.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu2.01'), 'We ____ keep quiet in the library. It is a basic rule.', 'may not', 'must', 'can''t', 'mustn''t', 'B', '', 'mcq', 1, 5, 'g7bu2.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu2.01' AND q.stem='We ____ keep quiet in the library. It is a basic rule.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu2.02'), '— ____ we bring our mobile phones to class? — No, we can''t.', 'Have', 'Can', 'Do', 'Must', 'B', '', 'mcq', 1, 1, 'g7bu2.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu2.02' AND q.stem='— ____ we bring our mobile phones to class? — No, we can''t.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu2.02'), 'We ____ eat snacks in class. The teacher doesn''t allow it.', 'must', 'can', 'can''t', 'have to', 'C', '', 'mcq', 1, 2, 'g7bu2.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu2.02' AND q.stem='We ____ eat snacks in class. The teacher doesn''t allow it.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu2.02'), '— Can we drink water during the lesson? — Yes, you ____.', 'are', 'must', 'have to', 'can', 'D', '', 'mcq', 1, 3, 'g7bu2.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu2.02' AND q.stem='— Can we drink water during the lesson? — Yes, you ____.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu2.02'), 'You ____ play basketball in the playground after school. It''s allowed.', 'have to', 'mustn''t', 'can''t', 'can', 'D', '', 'mcq', 1, 4, 'g7bu2.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu2.02' AND q.stem='You ____ play basketball in the playground after school. It''s allowed.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu2.02'), 'You ____ use your phone in class. It''s against the rules.', 'can''t', 'have to', 'can', 'must', 'A', '', 'mcq', 1, 5, 'g7bu2.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu2.02' AND q.stem='You ____ use your phone in class. It''s against the rules.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu2.03'), 'I ____ wear a school uniform every day. It''s the school rule.', 'have to', 'am', 'do', 'has to', 'A', '', 'mcq', 1, 1, 'g7bu2.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu2.03' AND q.stem='I ____ wear a school uniform every day. It''s the school rule.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu2.03'), 'She ____ finish her homework before she goes out.', 'has to', 'is', 'does', 'have to', 'A', '', 'mcq', 1, 2, 'g7bu2.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu2.03' AND q.stem='She ____ finish her homework before she goes out.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu2.03'), 'We ____ turn off our phones in the library.', 'have to', 'are', 'do', 'has to', 'A', '', 'mcq', 1, 3, 'g7bu2.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu2.03' AND q.stem='We ____ turn off our phones in the library.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu2.03'), '— ____ he clean the classroom today? — Yes, he does.', 'Has', 'Do', 'Does', 'Is', 'C', '', 'mcq', 1, 4, 'g7bu2.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu2.03' AND q.stem='— ____ he clean the classroom today? — Yes, he does.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7bu2.03'), 'Tom ____ arrive at school on time every morning.', 'do', 'is', 'has to', 'have to', 'C', '', 'mcq', 1, 5, 'g7bu2.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7bu2.03' AND q.stem='Tom ____ arrive at school on time every morning.');

-- D. count 校验(本批,应:语法点 3 / 题 15)
SELECT 'points' AS kind, count(*) FROM public.junior_grammar_points WHERE (volume,unit) IN (('7B','U2'))
UNION ALL SELECT 'questions', count(*) FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE (p.volume,p.unit) IN (('7B','U2'));
