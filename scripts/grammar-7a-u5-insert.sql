-- 7A Starter 语法题进库(方案B Step1)。幂等:可重复跑。
-- 生成自 scripts/7a-u5-for-cc.json | 1 个语法点 / 10 道题

-- A. junior_grammar_points 加 volume/unit 列(单元归属;旧点保持 NULL → 单元视图自动隐藏)
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS volume text;
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS unit text;

-- B. 建 1 个新语法点(每考点一个;code 唯一,幂等)
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g7u5.01', '情态动词 can 的用法 (肯定/否定/疑问)', 'A1', 7, '对应:7A U5', '', 1, '7A', 'U5'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g7u5.01');

-- 兜底:若点已存在但缺 volume/unit(重跑场景),补齐
UPDATE public.junior_grammar_points SET volume='7A', unit='U5' WHERE code='g7u5.01' AND (volume IS NULL OR unit IS NULL);

-- C. 插 10 道题(按 point code 挂 point_id;按 point+stem 去重幂等)
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u5.01'), 'I ____ play the guitar. (能)', 'am', 'can', 'can''t', 'do', 'B', '', 'mcq', 1, 1, 'g7u5.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u5.01' AND q.stem='I ____ play the guitar. (能)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u5.01'), 'She ____ play the violin well. (能)', 'can', 'is', 'can''t', 'does', 'A', '', 'mcq', 1, 2, 'g7u5.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u5.01' AND q.stem='She ____ play the violin well. (能)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u5.01'), 'I ____ cook, but I love great food. (不能)', 'can''t', 'don''t', 'am not', 'can', 'A', '', 'mcq', 1, 3, 'g7u5.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u5.01' AND q.stem='I ____ cook, but I love great food. (不能)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u5.01'), 'He ____ play the drums. (能)', 'does', 'can''t', 'is', 'can', 'D', '', 'mcq', 1, 4, 'g7u5.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u5.01' AND q.stem='He ____ play the drums. (能)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u5.01'), 'I can play the guitar, but I ____ play any other instruments. (不能)', 'can', 'don''t', 'am not', 'can''t', 'D', '', 'mcq', 1, 5, 'g7u5.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u5.01' AND q.stem='I can play the guitar, but I ____ play any other instruments. (不能)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u5.01'), '____ you play ping pong? — Yes, I can.', 'Can', 'Is', 'Do', 'Are', 'A', '', 'mcq', 1, 6, 'g7u5.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u5.01' AND q.stem='____ you play ping pong? — Yes, I can.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u5.01'), '— Can she play the violin? — No, she ____.', 'doesn''t', 'isn''t', 'can''t', 'can', 'C', '', 'mcq', 1, 7, 'g7u5.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u5.01' AND q.stem='— Can she play the violin? — No, she ____.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u5.01'), '____ they play chess? — Yes, they can.', 'Is', 'Do', 'Can', 'Are', 'C', '', 'mcq', 1, 8, 'g7u5.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u5.01' AND q.stem='____ they play chess? — Yes, they can.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u5.01'), '— Can you sing well? — Yes, I ____.', 'am', 'can''t', 'do', 'can', 'D', '', 'mcq', 1, 9, 'g7u5.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u5.01' AND q.stem='— Can you sing well? — Yes, I ____.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u5.01'), 'After ''can'', we use the ____ form of the verb.', 'base (原形)', 'past', '-s form', '-ing form', 'A', '', 'mcq', 1, 10, 'g7u5.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u5.01' AND q.stem='After ''can'', we use the ____ form of the verb.');

-- D. count 校验(本批,应:语法点 1 / 题 10)
SELECT 'points' AS kind, count(*) FROM public.junior_grammar_points WHERE (volume,unit) IN (('7A','U5'))
UNION ALL SELECT 'questions', count(*) FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE (p.volume,p.unit) IN (('7A','U5'));
