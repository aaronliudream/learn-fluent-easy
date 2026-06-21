-- 7A Starter 语法题进库(方案B Step1)。幂等:可重复跑。
-- 生成自 scripts/8b-u8-for-cc.json | 2 个语法点 / 12 道题

-- A. junior_grammar_points 加 volume/unit 列(单元归属;旧点保持 NULL → 单元视图自动隐藏)
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS volume text;
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS unit text;

-- B. 建 2 个新语法点(每考点一个;code 唯一,幂等)
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g8bu8.01', '①for / since (持续时间)', 'A1', 7, '对应:8B U8', '', 1, '8B', 'U8'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g8bu8.01');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g8bu8.02', '②How long 提问 (现在完成时)', 'A1', 7, '对应:8B U8', '', 2, '8B', 'U8'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g8bu8.02');

-- 兜底:若点已存在但缺 volume/unit(重跑场景),补齐
UPDATE public.junior_grammar_points SET volume='8B', unit='U8' WHERE code='g8bu8.01' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='8B', unit='U8' WHERE code='g8bu8.02' AND (volume IS NULL OR unit IS NULL);

-- C. 插 12 道题(按 point code 挂 point_id;按 point+stem 去重幂等)
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu8.01'), 'Mr Wang has worked at the museum ____ his summer holidays started. (过去从句)', 'since', 'for', 'from', 'during', 'A', '', 'mcq', 1, 1, 'g8bu8.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu8.01' AND q.stem='Mr Wang has worked at the museum ____ his summer holidays started. (过去从句)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu8.01'), 'She has been a member of the Red Cross ____ six years. (时段)', 'since', 'for', 'from', 'at', 'B', '', 'mcq', 1, 2, 'g8bu8.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu8.01' AND q.stem='She has been a member of the Red Cross ____ six years. (时段)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu8.01'), 'The group has trained many volunteers ____ it began three years ago.', 'since', 'in', 'during', 'for', 'A', '', 'mcq', 1, 3, 'g8bu8.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu8.01' AND q.stem='The group has trained many volunteers ____ it began three years ago.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu8.01'), 'I have lived in this neighbourhood ____ I was a child. (过去从句)', 'during', 'when', 'since', 'for', 'C', '', 'mcq', 1, 4, 'g8bu8.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu8.01' AND q.stem='I have lived in this neighbourhood ____ I was a child. (过去从句)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu8.01'), 'They have helped the animal shelter ____ a long time. (时段)', 'since', 'at', 'for', 'from', 'C', '', 'mcq', 1, 5, 'g8bu8.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu8.01' AND q.stem='They have helped the animal shelter ____ a long time. (时段)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu8.01'), 'He has played the violin ____ 2019. (时间点)', 'in', 'for', 'during', 'since', 'D', '', 'mcq', 1, 6, 'g8bu8.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu8.01' AND q.stem='He has played the violin ____ 2019. (时间点)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu8.02'), '____ have you been a volunteer at the nursing home?', 'How much', 'How long', 'How many', 'How often', 'B', '', 'mcq', 1, 1, 'g8bu8.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu8.02' AND q.stem='____ have you been a volunteer at the nursing home?');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu8.02'), 'How long ____ he known his best friend?', 'have', 'does', 'did', 'has', 'D', '', 'mcq', 1, 2, 'g8bu8.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu8.02' AND q.stem='How long ____ he known his best friend?');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu8.02'), 'How long ____ they lived in this city?', 'has', 'did', 'do', 'have', 'D', '', 'mcq', 1, 3, 'g8bu8.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu8.02' AND q.stem='How long ____ they lived in this city?');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu8.02'), '____ has the school had a volunteer group?', 'How often', 'How long', 'How many', 'How much', 'B', '', 'mcq', 1, 4, 'g8bu8.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu8.02' AND q.stem='____ has the school had a volunteer group?');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu8.02'), 'How long have you ____ your pet dog?', 'owned', 'owns', 'own', 'owning', 'A', '', 'mcq', 1, 5, 'g8bu8.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu8.02' AND q.stem='How long have you ____ your pet dog?');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu8.02'), '____ have you studied English so far?', 'How old', 'How long', 'How many', 'How much', 'B', '', 'mcq', 1, 6, 'g8bu8.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu8.02' AND q.stem='____ have you studied English so far?');

-- D. count 校验(本批,应:语法点 2 / 题 12)
SELECT 'points' AS kind, count(*) FROM public.junior_grammar_points WHERE (volume,unit) IN (('8B','U8'))
UNION ALL SELECT 'questions', count(*) FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE (p.volume,p.unit) IN (('8B','U8'));
