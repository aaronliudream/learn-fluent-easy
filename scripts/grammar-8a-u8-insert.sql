-- 7A Starter 语法题进库(方案B Step1)。幂等:可重复跑。
-- 生成自 scripts/8a-u8-for-cc.json | 3 个语法点 / 18 道题

-- A. junior_grammar_points 加 volume/unit 列(单元归属;旧点保持 NULL → 单元视图自动隐藏)
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS volume text;
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS unit text;

-- B. 建 3 个新语法点(每考点一个;code 唯一,幂等)
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g8au8.01', '①if条件状语从句 (主将从现)', 'A1', 7, '对应:8A U8', '', 1, '8A', 'U8'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g8au8.01');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g8au8.02', '②should 提建议 (should/shouldn''t)', 'A1', 7, '对应:8A U8', '', 2, '8A', 'U8'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g8au8.02');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g8au8.03', '③建议句型 (Why don''t you/Let''s/How about)', 'A1', 7, '对应:8A U8', '', 3, '8A', 'U8'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g8au8.03');

-- 兜底:若点已存在但缺 volume/unit(重跑场景),补齐
UPDATE public.junior_grammar_points SET volume='8A', unit='U8' WHERE code='g8au8.01' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='8A', unit='U8' WHERE code='g8au8.02' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='8A', unit='U8' WHERE code='g8au8.03' AND (volume IS NULL OR unit IS NULL);

-- C. 插 18 道题(按 point code 挂 point_id;按 point+stem 去重幂等)
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au8.01'), 'If you study hard, you ____ good grades.', 'got', 'get', 'will get', 'getting', 'C', '', 'mcq', 1, 1, 'g8au8.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au8.01' AND q.stem='If you study hard, you ____ good grades.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au8.01'), 'If it rains tomorrow, we ____ at home.', 'staying', 'will stay', 'stayed', 'stay', 'B', '', 'mcq', 1, 2, 'g8au8.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au8.01' AND q.stem='If it rains tomorrow, we ____ at home.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au8.01'), 'If you don''t hurry, you ____ late.', 'being', 'were', 'are', 'will be', 'D', '', 'mcq', 1, 3, 'g8au8.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au8.01' AND q.stem='If you don''t hurry, you ____ late.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au8.01'), 'If Lucy ____ hard, she will pass the test. (从句不用will)', 'studying', 'studied', 'studies', 'will study', 'C', '', 'mcq', 1, 4, 'g8au8.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au8.01' AND q.stem='If Lucy ____ hard, she will pass the test. (从句不用will)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au8.01'), 'If it ____ tomorrow, we will stay home. (从句不用will)', 'raining', 'rains', 'rained', 'will rain', 'B', '', 'mcq', 1, 5, 'g8au8.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au8.01' AND q.stem='If it ____ tomorrow, we will stay home. (从句不用will)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au8.01'), 'If you ask politely, people ____ you.', 'will help', 'helped', 'help', 'helping', 'A', '', 'mcq', 1, 6, 'g8au8.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au8.01' AND q.stem='If you ask politely, people ____ you.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au8.02'), 'You ____ listen carefully in class.', 'did', 'mustn''t', 'should', 'are', 'C', '', 'mcq', 1, 1, 'g8au8.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au8.02' AND q.stem='You ____ listen carefully in class.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au8.02'), 'You ____ interrupt others when they speak.', 'do', 'can', 'shouldn''t', 'should', 'C', '', 'mcq', 1, 2, 'g8au8.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au8.02' AND q.stem='You ____ interrupt others when they speak.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au8.02'), 'Students ____ be polite to each other.', 'shouldn''t', 'did', 'should', 'were', 'C', '', 'mcq', 1, 3, 'g8au8.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au8.02' AND q.stem='Students ____ be polite to each other.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au8.02'), 'You ____ shout in the library.', 'are', 'shouldn''t', 'have', 'should', 'B', '', 'mcq', 1, 4, 'g8au8.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au8.02' AND q.stem='You ____ shout in the library.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au8.02'), 'We ____ help each other with problems.', 'has', 'was', 'should', 'shouldn''t', 'C', '', 'mcq', 1, 5, 'g8au8.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au8.02' AND q.stem='We ____ help each other with problems.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au8.02'), 'You should ____ when you meet new friends.', 'smile', 'smiling', 'smiled', 'smiles', 'A', '', 'mcq', 1, 6, 'g8au8.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au8.02' AND q.stem='You should ____ when you meet new friends.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au8.03'), '____ join us after school?', 'How you', 'What you', 'Why you don''t', 'Why don''t you', 'D', '', 'mcq', 1, 1, 'g8au8.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au8.03' AND q.stem='____ join us after school?');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au8.03'), '____ play basketball this afternoon.', 'Lets', 'Let''s', 'Let', 'Letting', 'B', '', 'mcq', 1, 2, 'g8au8.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au8.03' AND q.stem='____ play basketball this afternoon.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au8.03'), '____ going for a walk in the park?', 'Let''s', 'Why don''t', 'How about', 'Should', 'C', '', 'mcq', 1, 3, 'g8au8.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au8.03' AND q.stem='____ going for a walk in the park?');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au8.03'), '____ asking your teacher for help?', 'Why don''t', 'Let''s', 'Should', 'How about', 'D', '', 'mcq', 1, 4, 'g8au8.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au8.03' AND q.stem='____ asking your teacher for help?');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au8.03'), '____ study together this evening.', 'Lets', 'Let''s', 'Letting', 'Let', 'B', '', 'mcq', 1, 5, 'g8au8.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au8.03' AND q.stem='____ study together this evening.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au8.03'), 'How about ____ a film tonight?', 'to watch', 'watches', 'watching', 'watch', 'C', '', 'mcq', 1, 6, 'g8au8.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au8.03' AND q.stem='How about ____ a film tonight?');

-- D. count 校验(本批,应:语法点 3 / 题 18)
SELECT 'points' AS kind, count(*) FROM public.junior_grammar_points WHERE (volume,unit) IN (('8A','U8'))
UNION ALL SELECT 'questions', count(*) FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE (p.volume,p.unit) IN (('8A','U8'));
