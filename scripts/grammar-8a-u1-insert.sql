-- 7A Starter 语法题进库(方案B Step1)。幂等:可重复跑。
-- 生成自 scripts/8a-u1-for-cc.json | 3 个语法点 / 18 道题

-- A. junior_grammar_points 加 volume/unit 列(单元归属;旧点保持 NULL → 单元视图自动隐藏)
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS volume text;
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS unit text;

-- B. 建 3 个新语法点(每考点一个;code 唯一,幂等)
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g8au1.01', '①不定代词 (something/anything/nothing/someone/anyone/everyone...)', 'A1', 7, '对应:8A U1', '', 1, '8A', 'U1'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g8au1.01');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='tense'), 'g8au1.02', '②一般过去时 (动词过去式描述假期)', 'A1', 7, '对应:8A U1', '', 2, '8A', 'U1'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g8au1.02');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g8au1.03', '③Wh- 过去时特殊疑问句 (Where/What/Who/How/When did...)', 'A1', 7, '对应:8A U1', '', 3, '8A', 'U1'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g8au1.03');

-- 兜底:若点已存在但缺 volume/unit(重跑场景),补齐
UPDATE public.junior_grammar_points SET volume='8A', unit='U1' WHERE code='g8au1.01' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='8A', unit='U1' WHERE code='g8au1.02' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='8A', unit='U1' WHERE code='g8au1.03' AND (volume IS NULL OR unit IS NULL);

-- C. 插 18 道题(按 point code 挂 point_id;按 point+stem 去重幂等)
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au1.01'), 'I tried ____ new — I worked as a tour guide. (肯定句)', 'something', 'nothing', 'anything', 'everything', 'A', '', 'mcq', 1, 1, 'g8au1.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au1.01' AND q.stem='I tried ____ new — I worked as a tour guide. (肯定句)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au1.01'), '— Did you do ____ interesting on your holiday? (疑问句)', 'something', 'nothing', 'anything', 'everyone', 'C', '', 'mcq', 1, 2, 'g8au1.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au1.01' AND q.stem='— Did you do ____ interesting on your holiday? (疑问句)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au1.01'), 'No, ____ special. But I met someone interesting. (否定)', 'anything', 'nothing', 'everything', 'something', 'B', '', 'mcq', 1, 3, 'g8au1.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au1.01' AND q.stem='No, ____ special. But I met someone interesting. (否定)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au1.01'), 'We had a great time. ____ loved it! (每个人)', 'Everyone', 'Someone', 'Anyone', 'No one', 'A', '', 'mcq', 1, 4, 'g8au1.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au1.01' AND q.stem='We had a great time. ____ loved it! (每个人)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au1.01'), '— Did you go ____ interesting? — Yes, I went to Yunnan.', 'nowhere', 'anywhere', 'everywhere', 'somewhere', 'B', '', 'mcq', 1, 5, 'g8au1.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au1.01' AND q.stem='— Did you go ____ interesting? — Yes, I went to Yunnan.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au1.01'), 'I met ____ interesting at the festival. (某人)', 'no one', 'anyone', 'everyone', 'someone', 'D', '', 'mcq', 1, 6, 'g8au1.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au1.01' AND q.stem='I met ____ interesting at the festival. (某人)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au1.02'), 'I ____ to Yunnan with my family last summer.', 'went', 'going', 'goed', 'go', 'A', '', 'mcq', 1, 1, 'g8au1.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au1.02' AND q.stem='I ____ to Yunnan with my family last summer.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au1.02'), 'We ____ a lot of great photos there.', 'taked', 'took', 'taking', 'take', 'B', '', 'mcq', 1, 2, 'g8au1.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au1.02' AND q.stem='We ____ a lot of great photos there.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au1.02'), 'I ____ a deer in the forest in Scotland.', 'seed', 'see', 'saw', 'seeing', 'C', '', 'mcq', 1, 3, 'g8au1.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au1.02' AND q.stem='I ____ a deer in the forest in Scotland.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au1.02'), 'They ____ the Victory Museum in Moscow.', 'visiting', 'visit', 'visitted', 'visited', 'D', '', 'mcq', 1, 4, 'g8au1.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au1.02' AND q.stem='They ____ the Victory Museum in Moscow.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au1.02'), 'We ____ in a comfortable house in the countryside.', 'stayed', 'staying', 'stay', 'stayd', 'A', '', 'mcq', 1, 5, 'g8au1.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au1.02' AND q.stem='We ____ in a comfortable house in the countryside.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au1.02'), 'It ____ a wonderful experience!', 'was', 'is', 'be', 'were', 'A', '', 'mcq', 1, 6, 'g8au1.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au1.02' AND q.stem='It ____ a wonderful experience!');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au1.03'), '____ did you go on holiday? — I went to Yunnan.', 'What', 'Who', 'How', 'Where', 'D', '', 'mcq', 1, 1, 'g8au1.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au1.03' AND q.stem='____ did you go on holiday? — I went to Yunnan.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au1.03'), '____ did you do there? — I visited my grandparents.', 'What', 'Where', 'Who', 'When', 'A', '', 'mcq', 1, 2, 'g8au1.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au1.03' AND q.stem='____ did you do there? — I visited my grandparents.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au1.03'), '____ did you feel during the trip? — It was tiring but fun.', 'What', 'Who', 'How', 'Where', 'C', '', 'mcq', 1, 3, 'g8au1.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au1.03' AND q.stem='____ did you feel during the trip? — It was tiring but fun.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au1.03'), '____ did you go with? — I went with my family.', 'What', 'Where', 'Who', 'How', 'C', '', 'mcq', 1, 4, 'g8au1.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au1.03' AND q.stem='____ did you go with? — I went with my family.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au1.03'), '____ did your holiday happen? — Last autumn.', 'Who', 'Where', 'When', 'What', 'C', '', 'mcq', 1, 5, 'g8au1.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au1.03' AND q.stem='____ did your holiday happen? — Last autumn.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au1.03'), 'Where ____ you go on your holiday?', 'are', 'did', 'do', 'was', 'B', '', 'mcq', 1, 6, 'g8au1.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au1.03' AND q.stem='Where ____ you go on your holiday?');

-- D. count 校验(本批,应:语法点 3 / 题 18)
SELECT 'points' AS kind, count(*) FROM public.junior_grammar_points WHERE (volume,unit) IN (('8A','U1'))
UNION ALL SELECT 'questions', count(*) FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE (p.volume,p.unit) IN (('8A','U1'));
