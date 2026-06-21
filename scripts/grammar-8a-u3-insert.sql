-- 7A Starter 语法题进库(方案B Step1)。幂等:可重复跑。
-- 生成自 scripts/8a-u3-for-cc.json | 3 个语法点 / 19 道题

-- A. junior_grammar_points 加 volume/unit 列(单元归属;旧点保持 NULL → 单元视图自动隐藏)
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS volume text;
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS unit text;

-- B. 建 3 个新语法点(每考点一个;code 唯一,幂等)
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g8au3.01', '①形容词比较级 (规则/不规则/more/than)', 'A1', 7, '对应:8A U3', '', 1, '8A', 'U3'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g8au3.01');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g8au3.02', '②副词比较级 (faster/better/more loudly)', 'A1', 7, '对应:8A U3', '', 2, '8A', 'U3'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g8au3.02');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g8au3.03', '③同级比较 as...as (as...as / not as...as)', 'A1', 7, '对应:8A U3', '', 3, '8A', 'U3'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g8au3.03');

-- 兜底:若点已存在但缺 volume/unit(重跑场景),补齐
UPDATE public.junior_grammar_points SET volume='8A', unit='U3' WHERE code='g8au3.01' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='8A', unit='U3' WHERE code='g8au3.02' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='8A', unit='U3' WHERE code='g8au3.03' AND (volume IS NULL OR unit IS NULL);

-- C. 插 19 道题(按 point code 挂 point_id;按 point+stem 去重幂等)
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au3.01'), 'My brother is ____ than me.', 'tallest', 'taller', 'tall', 'more tall', 'B', '', 'mcq', 1, 1, 'g8au3.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au3.01' AND q.stem='My brother is ____ than me.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au3.01'), 'This bag is ____ than that one.', 'heaviest', 'heavier', 'more heavy', 'heavy', 'B', '', 'mcq', 1, 2, 'g8au3.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au3.01' AND q.stem='This bag is ____ than that one.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au3.01'), 'Lucy is ____ than her sister.', 'friendly', 'more friendlier', 'friendliest', 'friendlier', 'D', '', 'mcq', 1, 3, 'g8au3.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au3.01' AND q.stem='Lucy is ____ than her sister.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au3.01'), 'The red apple is ____ than the green one.', 'biggest', 'more big', 'bigger', 'big', 'C', '', 'mcq', 1, 4, 'g8au3.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au3.01' AND q.stem='The red apple is ____ than the green one.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au3.01'), 'This story is ____ than that one.', 'most interesting', 'interesting', 'interestinger', 'more interesting', 'D', '', 'mcq', 1, 5, 'g8au3.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au3.01' AND q.stem='This story is ____ than that one.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au3.01'), 'Her hair is ____ than Ella''s. (good→?)', 'better', 'best', 'more good', 'gooder', 'A', '', 'mcq', 1, 6, 'g8au3.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au3.01' AND q.stem='Her hair is ____ than Ella''s. (good→?)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au3.01'), 'Kate is taller ____ Lucy.', 'with', 'than', 'for', 'as', 'B', '', 'mcq', 1, 7, 'g8au3.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au3.01' AND q.stem='Kate is taller ____ Lucy.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au3.02'), 'My father runs ____ than my uncle.', 'fast', 'fastest', 'faster', 'more faster', 'C', '', 'mcq', 1, 1, 'g8au3.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au3.02' AND q.stem='My father runs ____ than my uncle.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au3.02'), 'He plays badminton ____ than I do.', 'well', 'good', 'best', 'better', 'D', '', 'mcq', 1, 2, 'g8au3.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au3.02' AND q.stem='He plays badminton ____ than I do.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au3.02'), 'Emma sings ____ than Ella.', 'more louder', 'louder', 'loud', 'loudest', 'B', '', 'mcq', 1, 3, 'g8au3.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au3.02' AND q.stem='Emma sings ____ than Ella.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au3.02'), 'He sings ____ than the others.', 'more loudly', 'most loudly', 'loudly', 'loudlier', 'A', '', 'mcq', 1, 4, 'g8au3.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au3.02' AND q.stem='He sings ____ than the others.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au3.02'), 'Ella dances ____ than Emma.', 'best', 'better', 'good', 'well', 'B', '', 'mcq', 1, 5, 'g8au3.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au3.02' AND q.stem='Ella dances ____ than Emma.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au3.02'), 'I work ____ than my brother.', 'harder', 'more hard', 'hardest', 'hard', 'A', '', 'mcq', 1, 6, 'g8au3.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au3.02' AND q.stem='I work ____ than my brother.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au3.03'), 'Tom is ____ tall as Jack.', 'more', 'as', 'than', 'so', 'B', '', 'mcq', 1, 1, 'g8au3.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au3.03' AND q.stem='Tom is ____ tall as Jack.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au3.03'), 'Lucy isn''t ____ outgoing as Emma.', 'much', 'more', 'than', 'as', 'D', '', 'mcq', 1, 2, 'g8au3.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au3.03' AND q.stem='Lucy isn''t ____ outgoing as Emma.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au3.03'), 'This book is as ____ as that one.', 'useful', 'most useful', 'more useful', 'usefuler', 'A', '', 'mcq', 1, 3, 'g8au3.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au3.03' AND q.stem='This book is as ____ as that one.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au3.03'), 'Mike isn''t as ____ as Peter.', 'stronger', 'more strong', 'strongest', 'strong', 'D', '', 'mcq', 1, 4, 'g8au3.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au3.03' AND q.stem='Mike isn''t as ____ as Peter.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au3.03'), 'I try to work as ____ as she does.', 'hard', 'harder', 'hardest', 'more hard', 'A', '', 'mcq', 1, 5, 'g8au3.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au3.03' AND q.stem='I try to work as ____ as she does.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g8au3.03'), 'Our classroom is as ____ as theirs.', 'cleanest', 'more clean', 'clean', 'cleaner', 'C', '', 'mcq', 1, 6, 'g8au3.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g8au3.03' AND q.stem='Our classroom is as ____ as theirs.');

-- D. count 校验(本批,应:语法点 3 / 题 19)
SELECT 'points' AS kind, count(*) FROM public.junior_grammar_points WHERE (volume,unit) IN (('8A','U3'))
UNION ALL SELECT 'questions', count(*) FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE (p.volume,p.unit) IN (('8A','U3'));
