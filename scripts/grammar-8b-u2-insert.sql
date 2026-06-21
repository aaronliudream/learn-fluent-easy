-- 7A Starter 语法题进库(方案B Step1)。幂等:可重复跑。
-- 生成自 scripts/8b-u2-for-cc.json | 2 个语法点 / 12 道题

-- A. junior_grammar_points 加 volume/unit 列(单元归属;旧点保持 NULL → 单元视图自动隐藏)
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS volume text;
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS unit text;

-- A2. 清除之前误挂到 8B U2 的旧「状语从句」点(那批应属 U3),先删题再删点;下面重建为 should/反身代词。
DELETE FROM public.junior_grammar_questions WHERE point_id IN (SELECT id FROM public.junior_grammar_points WHERE code IN ('g8bu2.01','g8bu2.02'));
DELETE FROM public.junior_grammar_points WHERE code IN ('g8bu2.01','g8bu2.02');

-- B. 建 2 个新语法点(每考点一个;code 唯一,幂等)
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g8bu2.01', '①情态动词表建议 (should/shouldn''t/could)', 'A1', 7, '对应:8B U2', '', 1, '8B', 'U2'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g8bu2.01');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g8bu2.02', '②反身代词 (myself/yourself/ourselves...)', 'A1', 7, '对应:8B U2', '', 2, '8B', 'U2'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g8bu2.02');

-- 兜底:若点已存在但缺 volume/unit(重跑场景),补齐
UPDATE public.junior_grammar_points SET volume='8B', unit='U2' WHERE code='g8bu2.01' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='8B', unit='U2' WHERE code='g8bu2.02' AND (volume IS NULL OR unit IS NULL);

-- C. 插 12 道题(按 point code 挂 point_id;按 point+stem 去重幂等)
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu2.01'), 'You ____ eat so much next time; it''s bad for you.', 'shouldn''t', 'should', 'must', 'can', 'A', '', 'mcq', 1, 1, 'g8bu2.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu2.01' AND q.stem='You ____ eat so much next time; it''s bad for you.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu2.01'), 'You ____ eat some soft food for now.', 'couldn''t', 'could', 'mustn''t', 'aren''t', 'B', '', 'mcq', 1, 2, 'g8bu2.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu2.01' AND q.stem='You ____ eat some soft food for now.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu2.01'), 'You ____ see a doctor if you feel ill.', 'should', 'did', 'are', 'shouldn''t', 'A', '', 'mcq', 1, 3, 'g8bu2.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu2.01' AND q.stem='You ____ see a doctor if you feel ill.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu2.01'), 'You ____ stay up too late before an exam.', 'could', 'can', 'shouldn''t', 'should', 'C', '', 'mcq', 1, 4, 'g8bu2.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu2.01' AND q.stem='You ____ stay up too late before an exam.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu2.01'), 'You ____ drink more water to stay healthy.', 'shouldn''t', 'did', 'should', 'were', 'C', '', 'mcq', 1, 5, 'g8bu2.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu2.01' AND q.stem='You ____ drink more water to stay healthy.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu2.01'), 'If you have a cold, you ____ have some hot soup.', 'aren''t', 'couldn''t', 'mustn''t', 'could', 'D', '', 'mcq', 1, 6, 'g8bu2.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu2.01' AND q.stem='If you have a cold, you ____ have some hot soup.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu2.02'), 'I hurt ____ when I fell off my bike.', 'me', 'myself', 'my', 'mine', 'B', '', 'mcq', 1, 1, 'g8bu2.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu2.02' AND q.stem='I hurt ____ when I fell off my bike.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu2.02'), 'If we are not careful, we can easily hurt ____.', 'us', 'ourself', 'our', 'ourselves', 'D', '', 'mcq', 1, 2, 'g8bu2.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu2.02' AND q.stem='If we are not careful, we can easily hurt ____.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu2.02'), 'Be careful! Don''t cut ____ with the knife.', 'you', 'your', 'yours', 'yourself', 'D', '', 'mcq', 1, 3, 'g8bu2.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu2.02' AND q.stem='Be careful! Don''t cut ____ with the knife.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu2.02'), 'She made the cake all by ____.', 'she', 'herself', 'hers', 'her', 'B', '', 'mcq', 1, 4, 'g8bu2.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu2.02' AND q.stem='She made the cake all by ____.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu2.02'), 'He looked at ____ in the mirror.', 'himself', 'his', 'him', 'he', 'A', '', 'mcq', 1, 5, 'g8bu2.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu2.02' AND q.stem='He looked at ____ in the mirror.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8bu2.02'), 'The children enjoyed ____ at the party.', 'theirselves', 'themselves', 'their', 'them', 'B', '', 'mcq', 1, 6, 'g8bu2.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8bu2.02' AND q.stem='The children enjoyed ____ at the party.');

-- D. count 校验(本批,应:语法点 2 / 题 12)
SELECT 'points' AS kind, count(*) FROM public.junior_grammar_points WHERE (volume,unit) IN (('8B','U2'))
UNION ALL SELECT 'questions', count(*) FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE (p.volume,p.unit) IN (('8B','U2'));
