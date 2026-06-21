-- 7A Starter 语法题进库(方案B Step1)。幂等:可重复跑。
-- 生成自 scripts/8a-u7-for-cc.json | 3 个语法点 / 18 道题

-- A. junior_grammar_points 加 volume/unit 列(单元归属;旧点保持 NULL → 单元视图自动隐藏)
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS volume text;
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS unit text;

-- B. 建 3 个新语法点(每考点一个;code 唯一,幂等)
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g8au7.01', '①一般将来时 will (表预测)', 'A1', 7, '对应:8A U7', '', 1, '8A', 'U7'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g8au7.01');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g8au7.02', '②There will be...', 'A1', 7, '对应:8A U7', '', 2, '8A', 'U7'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g8au7.02');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g8au7.03', '③more / fewer / less (数量比较)', 'A1', 7, '对应:8A U7', '', 3, '8A', 'U7'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g8au7.03');

-- 兜底:若点已存在但缺 volume/unit(重跑场景),补齐
UPDATE public.junior_grammar_points SET volume='8A', unit='U7' WHERE code='g8au7.01' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='8A', unit='U7' WHERE code='g8au7.02' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='8A', unit='U7' WHERE code='g8au7.03' AND (volume IS NULL OR unit IS NULL);

-- C. 插 18 道题(按 point code 挂 point_id;按 point+stem 去重幂等)
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au7.01'), 'People ____ live much longer in the future.', 'do', 'will', 'were', 'are', 'B', '', 'mcq', 1, 1, 'g8au7.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au7.01' AND q.stem='People ____ live much longer in the future.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au7.01'), 'Robots ____ help doctors do their work.', 'did', 'have', 'are', 'will', 'D', '', 'mcq', 1, 2, 'g8au7.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au7.01' AND q.stem='Robots ____ help doctors do their work.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au7.01'), 'People ____ use paper books in 50 years.', 'aren''t', 'won''t', 'didn''t', 'don''t', 'B', '', 'mcq', 1, 3, 'g8au7.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au7.01' AND q.stem='People ____ use paper books in 50 years.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au7.01'), '____ robots do housework in the future?', 'Did', 'Are', 'Will', 'Do', 'C', '', 'mcq', 1, 4, 'g8au7.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au7.01' AND q.stem='____ robots do housework in the future?');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au7.01'), 'What ____ the future be like?', 'are', 'is', 'will', 'does', 'C', '', 'mcq', 1, 5, 'g8au7.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au7.01' AND q.stem='What ____ the future be like?');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au7.01'), 'Scientists will ____ smarter robots.', 'builds', 'building', 'built', 'build', 'D', '', 'mcq', 1, 6, 'g8au7.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au7.01' AND q.stem='Scientists will ____ smarter robots.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au7.02'), 'There ____ more trees in the future.', 'is', 'has', 'will be', 'are', 'C', '', 'mcq', 1, 1, 'g8au7.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au7.02' AND q.stem='There ____ more trees in the future.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au7.02'), 'There ____ fewer cars in the city.', 'have', 'is', 'will be', 'are', 'C', '', 'mcq', 1, 2, 'g8au7.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au7.02' AND q.stem='There ____ fewer cars in the city.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au7.02'), 'There ____ less pollution one day.', 'will be', 'are', 'have', 'were', 'A', '', 'mcq', 1, 3, 'g8au7.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au7.02' AND q.stem='There ____ less pollution one day.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au7.02'), 'There ____ more electric buses soon.', 'will be', 'have', 'is', 'are', 'A', '', 'mcq', 1, 4, 'g8au7.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au7.02' AND q.stem='There ____ more electric buses soon.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au7.02'), 'There ____ more people in big cities.', 'will be', 'were', 'is', 'has', 'A', '', 'mcq', 1, 5, 'g8au7.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au7.02' AND q.stem='There ____ more people in big cities.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au7.02'), '____ there be more schools in 2050?', 'Will', 'Does', 'Are', 'Is', 'A', '', 'mcq', 1, 6, 'g8au7.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au7.02' AND q.stem='____ there be more schools in 2050?');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au7.03'), 'There will be ____ cars in the city. (可数复数)', 'much', 'less', 'fewer', 'little', 'C', '', 'mcq', 1, 1, 'g8au7.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au7.03' AND q.stem='There will be ____ cars in the city. (可数复数)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au7.03'), 'There will be ____ pollution. (不可数)', 'few', 'many', 'fewer', 'less', 'D', '', 'mcq', 1, 2, 'g8au7.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au7.03' AND q.stem='There will be ____ pollution. (不可数)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au7.03'), 'There will be ____ robots to help us.', 'little', 'much', 'less', 'more', 'D', '', 'mcq', 1, 3, 'g8au7.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au7.03' AND q.stem='There will be ____ robots to help us.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au7.03'), 'There will be ____ traffic in the future. (不可数)', 'fewer', 'less', 'many', 'few', 'B', '', 'mcq', 1, 4, 'g8au7.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au7.03' AND q.stem='There will be ____ traffic in the future. (不可数)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au7.03'), 'There will be ____ trees and parks.', 'less', 'much', 'little', 'more', 'D', '', 'mcq', 1, 5, 'g8au7.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au7.03' AND q.stem='There will be ____ trees and parks.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au7.03'), 'There will be ____ factories making pollution. (可数复数)', 'much', 'little', 'less', 'fewer', 'D', '', 'mcq', 1, 6, 'g8au7.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au7.03' AND q.stem='There will be ____ factories making pollution. (可数复数)');

-- D. count 校验(本批,应:语法点 3 / 题 18)
SELECT 'points' AS kind, count(*) FROM public.junior_grammar_points WHERE (volume,unit) IN (('8A','U7'))
UNION ALL SELECT 'questions', count(*) FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE (p.volume,p.unit) IN (('8A','U7'));
