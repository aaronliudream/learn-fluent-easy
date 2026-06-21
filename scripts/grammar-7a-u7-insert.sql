-- 7A Starter 语法题进库(方案B Step1)。幂等:可重复跑。
-- 生成自 scripts/7a-u7-for-cc.json | 5 个语法点 / 25 道题

-- A. junior_grammar_points 加 volume/unit 列(单元归属;旧点保持 NULL → 单元视图自动隐藏)
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS volume text;
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS unit text;

-- B. 建 5 个新语法点(每考点一个;code 唯一,幂等)
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g7u7.01', '①When (询问时间/日期)', 'A1', 7, '对应:7A U7', '', 1, '7A', 'U7'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g7u7.01');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g7u7.02', '②How old (询问年龄)', 'A1', 7, '对应:7A U7', '', 2, '7A', 'U7'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g7u7.02');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g7u7.03', '③What (询问事物/活动)', 'A1', 7, '对应:7A U7', '', 3, '7A', 'U7'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g7u7.03');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g7u7.04', '④How many / How much (询问数量/价格)', 'A1', 7, '对应:7A U7', '', 4, '7A', 'U7'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g7u7.04');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g7u7.05', '⑤Who (询问人)', 'A1', 7, '对应:7A U7', '', 5, '7A', 'U7'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g7u7.05');

-- 兜底:若点已存在但缺 volume/unit(重跑场景),补齐
UPDATE public.junior_grammar_points SET volume='7A', unit='U7' WHERE code='g7u7.01' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='7A', unit='U7' WHERE code='g7u7.02' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='7A', unit='U7' WHERE code='g7u7.03' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='7A', unit='U7' WHERE code='g7u7.04' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='7A', unit='U7' WHERE code='g7u7.05' AND (volume IS NULL OR unit IS NULL);

-- C. 插 25 道题(按 point code 挂 point_id;按 point+stem 去重幂等)
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u7.01'), '— ____ is your birthday? — It''s on 2nd August.', 'Who', 'What', 'When', 'How old', 'C', '', 'mcq', 1, 1, 'g7u7.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u7.01' AND q.stem='— ____ is your birthday? — It''s on 2nd August.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u7.01'), '— ____ does the party start? — At 6:00 p.m.', 'What', 'How many', 'Who', 'When', 'D', '', 'mcq', 1, 2, 'g7u7.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u7.01' AND q.stem='— ____ does the party start? — At 6:00 p.m.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u7.01'), '— ____ is National Day? — It''s on 1st October.', 'What', 'When', 'Where', 'How old', 'B', '', 'mcq', 1, 3, 'g7u7.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u7.01' AND q.stem='— ____ is National Day? — It''s on 1st October.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u7.01'), '— ____ is your school trip? — It''s next Monday.', 'Who', 'How much', 'When', 'What', 'C', '', 'mcq', 1, 4, 'g7u7.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u7.01' AND q.stem='— ____ is your school trip? — It''s next Monday.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u7.01'), '— ____ is Judy''s birthday? — On 28th July.', 'How old', 'When', 'What', 'Who', 'B', '', 'mcq', 1, 5, 'g7u7.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u7.01' AND q.stem='— ____ is Judy''s birthday? — On 28th July.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u7.02'), '— ____ are you? — I am 12 years old.', 'When', 'Who', 'How old', 'How many', 'C', '', 'mcq', 1, 1, 'g7u7.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u7.02' AND q.stem='— ____ are you? — I am 12 years old.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u7.02'), '— ____ is your brother? — He is six.', 'How much', 'What', 'When', 'How old', 'D', '', 'mcq', 1, 2, 'g7u7.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u7.02' AND q.stem='— ____ is your brother? — He is six.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u7.02'), '— ____ is Ella? — She is 13 years old.', 'Where', 'How old', 'Who', 'How many', 'B', '', 'mcq', 1, 3, 'g7u7.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u7.02' AND q.stem='— ____ is Ella? — She is 13 years old.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u7.02'), '— ____ are the twins? — They are 12.', 'How much', 'When', 'How old', 'What', 'C', '', 'mcq', 1, 4, 'g7u7.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u7.02' AND q.stem='— ____ are the twins? — They are 12.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u7.02'), '— ____ is your grandpa? — He is 70 years old.', 'How many', 'When', 'Who', 'How old', 'D', '', 'mcq', 1, 5, 'g7u7.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u7.02' AND q.stem='— ____ is your grandpa? — He is 70 years old.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u7.03'), '— ____ do you want to do for your birthday? — Have a party.', 'How old', 'What', 'Who', 'When', 'B', '', 'mcq', 1, 1, 'g7u7.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u7.03' AND q.stem='— ____ do you want to do for your birthday? — Have a party.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u7.03'), '— ____ is your favourite birthday gift? — A new pair of shoes.', 'How many', 'Who', 'When', 'What', 'D', '', 'mcq', 1, 2, 'g7u7.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u7.03' AND q.stem='— ____ is your favourite birthday gift? — A new pair of shoes.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u7.03'), '— ____ do you eat on your birthday? — Birthday noodles.', 'How old', 'When', 'What', 'Who', 'C', '', 'mcq', 1, 3, 'g7u7.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u7.03' AND q.stem='— ____ do you eat on your birthday? — Birthday noodles.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u7.03'), '— ____ is the total? — 165 yuan.', 'Who', 'How old', 'What', 'When', 'C', '', 'mcq', 1, 4, 'g7u7.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u7.03' AND q.stem='— ____ is the total? — 165 yuan.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u7.03'), '— ____ is a symbol of long life? — Long noodles.', 'Who', 'How much', 'When', 'What', 'D', '', 'mcq', 1, 5, 'g7u7.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u7.03' AND q.stem='— ____ is a symbol of long life? — Long noodles.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u7.04'), '— ____ kilos of apples do you want? — Five kilos.', 'How many', 'How much', 'How old', 'What', 'A', '', 'mcq', 1, 1, 'g7u7.04'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u7.04' AND q.stem='— ____ kilos of apples do you want? — Five kilos.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u7.04'), '— ____ is this birthday cake? — It''s 85 yuan.', 'How much', 'What', 'How many', 'How old', 'A', '', 'mcq', 1, 2, 'g7u7.04'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u7.04' AND q.stem='— ____ is this birthday cake? — It''s 85 yuan.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u7.04'), '— ____ bottles of yogurt do you need? — Ten bottles.', 'When', 'How many', 'How much', 'How old', 'B', '', 'mcq', 1, 3, 'g7u7.04'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u7.04' AND q.stem='— ____ bottles of yogurt do you need? — Ten bottles.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u7.04'), '— ____ are those oranges? — Six yuan a kilo.', 'What', 'How much', 'How old', 'How many', 'B', '', 'mcq', 1, 4, 'g7u7.04'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u7.04' AND q.stem='— ____ are those oranges? — Six yuan a kilo.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u7.04'), '— ____ candles are on the cake? — Six candles.', 'Who', 'How much', 'How old', 'How many', 'D', '', 'mcq', 1, 5, 'g7u7.04'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u7.04' AND q.stem='— ____ candles are on the cake? — Six candles.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u7.05'), '— ____ is that girl? — She is my best friend.', 'Who', 'When', 'What', 'How old', 'A', '', 'mcq', 1, 1, 'g7u7.05'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u7.05' AND q.stem='— ____ is that girl? — She is my best friend.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u7.05'), '— ____ do you invite to your party? — My classmates.', 'What', 'Who', 'How many', 'When', 'B', '', 'mcq', 1, 2, 'g7u7.05'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u7.05' AND q.stem='— ____ do you invite to your party? — My classmates.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u7.05'), '— ____ is your class teacher? — It''s Ms Gao.', 'How old', 'What', 'When', 'Who', 'D', '', 'mcq', 1, 3, 'g7u7.05'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u7.05' AND q.stem='— ____ is your class teacher? — It''s Ms Gao.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u7.05'), '— ____ makes the birthday cake? — My mother.', 'When', 'Who', 'How much', 'What', 'B', '', 'mcq', 1, 4, 'g7u7.05'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u7.05' AND q.stem='— ____ makes the birthday cake? — My mother.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7u7.05'), '— ____ is at the party? — All my friends.', 'When', 'Who', 'What', 'How old', 'B', '', 'mcq', 1, 5, 'g7u7.05'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7u7.05' AND q.stem='— ____ is at the party? — All my friends.');

-- D. count 校验(本批,应:语法点 5 / 题 25)
SELECT 'points' AS kind, count(*) FROM public.junior_grammar_points WHERE (volume,unit) IN (('7A','U7'))
UNION ALL SELECT 'questions', count(*) FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE (p.volume,p.unit) IN (('7A','U7'));
