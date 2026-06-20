-- 7A Starter 语法题进库(方案B Step1)。幂等:可重复跑。
-- 生成自 scripts/starter-grammar-for-cc.json | 17 个语法点 / 102 道题

-- A. junior_grammar_points 加 volume/unit 列(单元归属;旧点保持 NULL → 单元视图自动隐藏)
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS volume text;
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS unit text;

-- B. 建 17 个新语法点(每考点一个;code 唯一,幂等)
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='tense'), 'g7su1.01', '①Be动词肯定句+自我介绍 (I am / My name is / is / are)', 'A1', 7, '对应:7A SU1', '', 1, '7A', 'SU1'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g7su1.01');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g7su1.02', '②特殊疑问词 How / What / Where', 'A1', 7, '对应:7A SU1', '', 2, '7A', 'SU1'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g7su1.02');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='verb'), 'g7su1.03', '③情态动词 May 的礼貌用法', 'A1', 7, '对应:7A SU1', '', 3, '7A', 'SU1'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g7su1.03');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g7su1.04', '④物主代词 My / Your', 'A1', 7, '对应:7A SU1', '', 4, '7A', 'SU1'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g7su1.04');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g7su1.05', '⑤名词代词单复数一致 (It''s / They''re)', 'A1', 7, '对应:7A SU1', '', 5, '7A', 'SU1'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g7su1.05');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g7su1.06', '⑥字母顺序/查词法 (Alphabetical order)', 'A1', 7, '对应:7A SU1', '', 6, '7A', 'SU1'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g7su1.06');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='verb'), 'g7su2.01', '①have 的用法 (have / has)', 'A1', 7, '对应:7A SU2', '', 1, '7A', 'SU2'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g7su2.01');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g7su2.02', '②名词单复数 (a bottle / pencils)', 'A1', 7, '对应:7A SU2', '', 2, '7A', 'SU2'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g7su2.02');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g7su2.03', '③be动词与代词数的一致性 (It is / They are)', 'A1', 7, '对应:7A SU2', '', 3, '7A', 'SU2'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g7su2.03');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g7su2.04', '④方位介词 in / on / under', 'A1', 7, '对应:7A SU2', '', 4, '7A', 'SU2'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g7su2.04');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g7su2.05', '⑤颜色提问 (What colour is / are)', 'A1', 7, '对应:7A SU2', '', 5, '7A', 'SU2'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g7su2.05');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g7su2.06', '⑥一般疑问句 Is it / Are they 及回答', 'A1', 7, '对应:7A SU2', '', 6, '7A', 'SU2'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g7su2.06');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g7su3.01', '①近远指代 This / That / These / Those', 'A1', 7, '对应:7A SU3', '', 1, '7A', 'SU3'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g7su3.01');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g7su3.02', '②基数词 1-20', 'A1', 7, '对应:7A SU3', '', 2, '7A', 'SU3'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g7su3.02');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g7su3.03', '③疑问句 How many / What is this-that / What are these-those', 'A1', 7, '对应:7A SU3', '', 3, '7A', 'SU3'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g7su3.03');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g7su3.04', '④名词复数 (规则+不规则 sheep)', 'A1', 7, '对应:7A SU3', '', 4, '7A', 'SU3'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g7su3.04');
INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)
SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='other'), 'g7su3.05', '⑤所有格/所属 He has / uncle''s', 'A1', 7, '对应:7A SU3', '', 5, '7A', 'SU3'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='g7su3.05');

-- 兜底:若点已存在但缺 volume/unit(重跑场景),补齐
UPDATE public.junior_grammar_points SET volume='7A', unit='SU1' WHERE code='g7su1.01' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='7A', unit='SU1' WHERE code='g7su1.02' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='7A', unit='SU1' WHERE code='g7su1.03' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='7A', unit='SU1' WHERE code='g7su1.04' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='7A', unit='SU1' WHERE code='g7su1.05' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='7A', unit='SU1' WHERE code='g7su1.06' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='7A', unit='SU2' WHERE code='g7su2.01' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='7A', unit='SU2' WHERE code='g7su2.02' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='7A', unit='SU2' WHERE code='g7su2.03' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='7A', unit='SU2' WHERE code='g7su2.04' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='7A', unit='SU2' WHERE code='g7su2.05' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='7A', unit='SU2' WHERE code='g7su2.06' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='7A', unit='SU3' WHERE code='g7su3.01' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='7A', unit='SU3' WHERE code='g7su3.02' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='7A', unit='SU3' WHERE code='g7su3.03' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='7A', unit='SU3' WHERE code='g7su3.04' AND (volume IS NULL OR unit IS NULL);
UPDATE public.junior_grammar_points SET volume='7A', unit='SU3' WHERE code='g7su3.05' AND (volume IS NULL OR unit IS NULL);

-- C. 插 102 道题(按 point code 挂 point_id;按 point+stem 去重幂等)
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su1.01'), 'I ____ Peter Brown.', 'are', 'is', 'be', 'am', 'D', '', 'mcq', 1, 1, 'g7su1.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su1.01' AND q.stem='I ____ Peter Brown.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su1.01'), 'My name ____ Emma.', 'be', 'are', 'is', 'am', 'C', '', 'mcq', 1, 2, 'g7su1.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su1.01' AND q.stem='My name ____ Emma.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su1.01'), 'This ____ my friend, Mike.', 'am', 'do', 'are', 'is', 'D', '', 'mcq', 1, 3, 'g7su1.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su1.01' AND q.stem='This ____ my friend, Mike.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su1.01'), 'We ____ in the same class.', 'am', 'is', 'are', 'be', 'C', '', 'mcq', 1, 4, 'g7su1.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su1.01' AND q.stem='We ____ in the same class.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su1.01'), 'Hello! I ____ Lin Tao.', 'is', 'are', 'do', 'am', 'D', '', 'mcq', 1, 5, 'g7su1.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su1.01' AND q.stem='Hello! I ____ Lin Tao.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su1.01'), 'Tom and I ____ good friends.', 'am', 'be', 'is', 'are', 'D', '', 'mcq', 1, 6, 'g7su1.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su1.01' AND q.stem='Tom and I ____ good friends.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su1.02'), '____ is your name? — My name is Jing Pei.', 'Where', 'How', 'What', 'Who', 'C', '', 'mcq', 1, 1, 'g7su1.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su1.02' AND q.stem='____ is your name? — My name is Jing Pei.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su1.02'), '____ do you spell your name? — E-M-M-A.', 'What', 'Why', 'How', 'Where', 'C', '', 'mcq', 1, 2, 'g7su1.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su1.02' AND q.stem='____ do you spell your name? — E-M-M-A.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su1.02'), '____ are you today? — I''m fine, thank you.', 'How', 'Where', 'What', 'Who', 'A', '', 'mcq', 1, 3, 'g7su1.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su1.02' AND q.stem='____ are you today? — I''m fine, thank you.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su1.02'), '____ is Ms Gao? — She is in the classroom.', 'How', 'Who', 'Where', 'What', 'C', '', 'mcq', 1, 4, 'g7su1.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su1.02' AND q.stem='____ is Ms Gao? — She is in the classroom.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su1.02'), '____ is the letter "B"? — It''s here on the keyboard.', 'How', 'What', 'When', 'Where', 'D', '', 'mcq', 1, 5, 'g7su1.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su1.02' AND q.stem='____ is the letter "B"? — It''s here on the keyboard.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su1.02'), '____ is this in English? — It''s a pen.', 'Who', 'Where', 'How', 'What', 'D', '', 'mcq', 1, 6, 'g7su1.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su1.02' AND q.stem='____ is this in English? — It''s a pen.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su1.03'), '____ I have your name, please?', 'Are', 'Am', 'May', 'Do', 'C', '', 'mcq', 1, 1, 'g7su1.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su1.03' AND q.stem='____ I have your name, please?');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su1.03'), '— May I have your name? — ____', 'No, thanks.', 'I''m fine.', 'Yes, I do.', 'Sure, I''m Anna.', 'D', '', 'mcq', 1, 2, 'g7su1.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su1.03' AND q.stem='— May I have your name? — ____');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su1.03'), '____ I come in, please?', 'May', 'Do', 'Are', 'Is', 'A', '', 'mcq', 1, 3, 'g7su1.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su1.03' AND q.stem='____ I come in, please?');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su1.03'), 'Excuse me, ____ I have a look?', 'be', 'may', 'do', 'am', 'B', '', 'mcq', 1, 4, 'g7su1.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su1.03' AND q.stem='Excuse me, ____ I have a look?');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su1.03'), '"May I have your name?" is a ____ way to ask.', 'rude', 'loud', 'wrong', 'polite', 'D', '', 'mcq', 1, 5, 'g7su1.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su1.03' AND q.stem='"May I have your name?" is a ____ way to ask.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su1.03'), '____ I ask you a question, Miss Li?', 'Be', 'Are', 'May', 'Does', 'C', '', 'mcq', 1, 6, 'g7su1.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su1.03' AND q.stem='____ I ask you a question, Miss Li?');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su1.04'), 'Hello! ____ name is Lin Tao.', 'Me', 'I', 'Your', 'My', 'D', '', 'mcq', 1, 1, 'g7su1.04'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su1.04' AND q.stem='Hello! ____ name is Lin Tao.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su1.04'), '— What''s ____ name? — My name is Tom. (问对方)', 'your', 'my', 'you', 'I', 'A', '', 'mcq', 1, 2, 'g7su1.04'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su1.04' AND q.stem='— What''s ____ name? — My name is Tom. (问对方)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su1.04'), 'Nice to meet you. ____ name is Anna.', 'My', 'Me', 'I', 'Your', 'A', '', 'mcq', 1, 3, 'g7su1.04'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su1.04' AND q.stem='Nice to meet you. ____ name is Anna.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su1.04'), 'Is this ____ pen? — Yes, it''s my pen. (问对方)', 'your', 'me', 'you', 'my', 'A', '', 'mcq', 1, 4, 'g7su1.04'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su1.04' AND q.stem='Is this ____ pen? — Yes, it''s my pen. (问对方)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su1.04'), 'I like ____ new bag. (说自己的)', 'your', 'I', 'me', 'my', 'D', '', 'mcq', 1, 5, 'g7su1.04'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su1.04' AND q.stem='I like ____ new bag. (说自己的)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su1.04'), 'Hi, Tom! What''s ____ phone number?', 'you', 'me', 'your', 'my', 'C', '', 'mcq', 1, 6, 'g7su1.04'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su1.04' AND q.stem='Hi, Tom! What''s ____ phone number?');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su1.05'), 'Look at my ruler. ____ red.', 'I''m', 'It''s', 'They''re', 'He''s', 'B', '', 'mcq', 1, 1, 'g7su1.05'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su1.05' AND q.stem='Look at my ruler. ____ red.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su1.05'), 'Look at my keys. ____ yellow.', 'It''s', 'She''s', 'They''re', 'He''s', 'C', '', 'mcq', 1, 2, 'g7su1.05'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su1.05' AND q.stem='Look at my keys. ____ yellow.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su1.05'), 'This is a cat. ____ black.', 'You''re', 'We''re', 'They''re', 'It''s', 'D', '', 'mcq', 1, 3, 'g7su1.05'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su1.05' AND q.stem='This is a cat. ____ black.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su1.05'), 'These are books. ____ new.', 'It''s', 'I''m', 'They''re', 'He''s', 'C', '', 'mcq', 1, 4, 'g7su1.05'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su1.05' AND q.stem='These are books. ____ new.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su1.05'), 'That is a dog. ____ cute.', 'I''m', 'They''re', 'It''s', 'We''re', 'C', '', 'mcq', 1, 5, 'g7su1.05'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su1.05' AND q.stem='That is a dog. ____ cute.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su1.05'), 'Those are pens. ____ blue.', 'They''re', 'It''s', 'She''s', 'I''m', 'A', '', 'mcq', 1, 6, 'g7su1.05'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su1.05' AND q.stem='Those are pens. ____ blue.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su1.06'), 'Which letter comes right after "C"?', 'E', 'D', 'A', 'B', 'B', '', 'mcq', 1, 1, 'g7su1.06'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su1.06' AND q.stem='Which letter comes right after "C"?');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su1.06'), 'Which letter comes right before "H"?', 'G', 'J', 'F', 'I', 'A', '', 'mcq', 1, 2, 'g7su1.06'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su1.06' AND q.stem='Which letter comes right before "H"?');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su1.06'), 'Put in alphabetical order: which word comes first?', 'apple', 'book', 'cat', 'dog', 'A', '', 'mcq', 1, 3, 'g7su1.06'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su1.06' AND q.stem='Put in alphabetical order: which word comes first?');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su1.06'), 'Put in alphabetical order: which word comes last?', 'apple', 'cat', 'spell', 'book', 'C', '', 'mcq', 1, 4, 'g7su1.06'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su1.06' AND q.stem='Put in alphabetical order: which word comes last?');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su1.06'), 'Which letter is between "M" and "O"?', 'L', 'P', 'N', 'Q', 'C', '', 'mcq', 1, 5, 'g7su1.06'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su1.06' AND q.stem='Which letter is between "M" and "O"?');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su1.06'), 'In a dictionary, which word comes first?', 'duck', 'desk', 'door', 'dog', 'B', '', 'mcq', 1, 6, 'g7su1.06'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su1.06' AND q.stem='In a dictionary, which word comes first?');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su2.01'), 'I ____ a red pen.', 'has', 'have', 'am', 'is', 'B', '', 'mcq', 1, 1, 'g7su2.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su2.01' AND q.stem='I ____ a red pen.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su2.01'), 'She ____ a blue book.', 'has', 'is', 'have', 'do', 'A', '', 'mcq', 1, 2, 'g7su2.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su2.01' AND q.stem='She ____ a blue book.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su2.01'), 'We ____ many books in the schoolbag.', 'has', 'have', 'are', 'is', 'B', '', 'mcq', 1, 3, 'g7su2.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su2.01' AND q.stem='We ____ many books in the schoolbag.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su2.01'), 'He ____ a new cap.', 'do', 'have', 'is', 'has', 'D', '', 'mcq', 1, 4, 'g7su2.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su2.01' AND q.stem='He ____ a new cap.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su2.01'), '— What do you ____ in your schoolbag? — A bottle.', 'is', 'has', 'have', 'are', 'C', '', 'mcq', 1, 5, 'g7su2.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su2.01' AND q.stem='— What do you ____ in your schoolbag? — A bottle.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su2.01'), 'My friend ____ two erasers.', 'is', 'have', 'has', 'do', 'C', '', 'mcq', 1, 6, 'g7su2.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su2.01' AND q.stem='My friend ____ two erasers.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su2.02'), 'I have two ____.', 'penciles', 'pencil', 'a pencil', 'pencils', 'D', '', 'mcq', 1, 1, 'g7su2.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su2.02' AND q.stem='I have two ____.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su2.02'), 'This is an ____.', 'erasere', 'eraser', 'a eraser', 'erasers', 'B', '', 'mcq', 1, 2, 'g7su2.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su2.02' AND q.stem='This is an ____.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su2.02'), 'I have a ____ in my hand.', 'bottles', 'bottle', 'bottlees', 'an bottle', 'B', '', 'mcq', 1, 3, 'g7su2.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su2.02' AND q.stem='I have a ____ in my hand.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su2.02'), 'There are three ____ on the desk.', 'a key', 'keys', 'keyes', 'key', 'B', '', 'mcq', 1, 4, 'g7su2.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su2.02' AND q.stem='There are three ____ on the desk.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su2.02'), 'She has a ____ and two caps.', 'ruleres', 'rulers', 'an ruler', 'ruler', 'D', '', 'mcq', 1, 5, 'g7su2.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su2.02' AND q.stem='She has a ____ and two caps.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su2.02'), 'My ____ are black. (复数)', 'trouser', 'a trousers', 'trousers', 'trouseres', 'C', '', 'mcq', 1, 6, 'g7su2.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su2.02' AND q.stem='My ____ are black. (复数)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su2.03'), 'Look at my ruler. ____ brown.', 'He''s', 'It''s', 'They''re', 'I''m', 'B', '', 'mcq', 1, 1, 'g7su2.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su2.03' AND q.stem='Look at my ruler. ____ brown.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su2.03'), 'Look at my keys. ____ yellow.', 'It''s', 'She''s', 'I''m', 'They''re', 'D', '', 'mcq', 1, 2, 'g7su2.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su2.03' AND q.stem='Look at my keys. ____ yellow.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su2.03'), '— What colour is the cap? — ____ red.', 'We''re', 'They''re', 'He''s', 'It''s', 'D', '', 'mcq', 1, 3, 'g7su2.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su2.03' AND q.stem='— What colour is the cap? — ____ red.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su2.03'), '— What colour are the trousers? — ____ black.', 'It''s', 'I''m', 'She''s', 'They''re', 'D', '', 'mcq', 1, 4, 'g7su2.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su2.03' AND q.stem='— What colour are the trousers? — ____ black.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su2.03'), 'This is my eraser. ____ white.', 'It''s', 'You''re', 'We''re', 'They''re', 'A', '', 'mcq', 1, 5, 'g7su2.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su2.03' AND q.stem='This is my eraser. ____ white.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su2.03'), 'These are my shoes. ____ green.', 'They''re', 'He''s', 'I''m', 'It''s', 'A', '', 'mcq', 1, 6, 'g7su2.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su2.03' AND q.stem='These are my shoes. ____ green.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su2.04'), 'The book is ____ the desk. (在桌面上)', 'of', 'on', 'under', 'in', 'B', '', 'mcq', 1, 1, 'g7su2.04'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su2.04' AND q.stem='The book is ____ the desk. (在桌面上)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su2.04'), 'The cat is ____ the box. (在盒子里)', 'in', 'to', 'on', 'under', 'A', '', 'mcq', 1, 2, 'g7su2.04'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su2.04' AND q.stem='The cat is ____ the box. (在盒子里)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su2.04'), 'My cap is ____ the desk. (在桌子下面)', 'under', 'on', 'in', 'of', 'A', '', 'mcq', 1, 3, 'g7su2.04'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su2.04' AND q.stem='My cap is ____ the desk. (在桌子下面)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su2.04'), 'The keys are ____ your schoolbag. (在书包里)', 'on', 'under', 'to', 'in', 'D', '', 'mcq', 1, 4, 'g7su2.04'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su2.04' AND q.stem='The keys are ____ your schoolbag. (在书包里)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su2.04'), 'The glasses are ____ your head. (在头上)', 'under', 'of', 'in', 'on', 'D', '', 'mcq', 1, 5, 'g7su2.04'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su2.04' AND q.stem='The glasses are ____ your head. (在头上)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su2.04'), 'The ball is ____ the chair. (在椅子下面)', 'to', 'under', 'on', 'in', 'B', '', 'mcq', 1, 6, 'g7su2.04'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su2.04' AND q.stem='The ball is ____ the chair. (在椅子下面)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su2.05'), '____ ____ is your cap? — It''s blue.', 'How colour', 'What color is', 'Where colour', 'What colour', 'D', '', 'mcq', 1, 1, 'g7su2.05'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su2.05' AND q.stem='____ ____ is your cap? — It''s blue.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su2.05'), '— What colour ____ the trousers? — They''re black.', 'be', 'am', 'are', 'is', 'C', '', 'mcq', 1, 2, 'g7su2.05'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su2.05' AND q.stem='— What colour ____ the trousers? — They''re black.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su2.05'), '— What colour ____ the cap? — It''s red.', 'are', 'be', 'is', 'am', 'C', '', 'mcq', 1, 3, 'g7su2.05'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su2.05' AND q.stem='— What colour ____ the cap? — It''s red.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su2.05'), '____ is the eraser? — It''s white.', 'What colour', 'How many', 'Who', 'Where', 'A', '', 'mcq', 1, 4, 'g7su2.05'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su2.05' AND q.stem='____ is the eraser? — It''s white.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su2.05'), '— What colour are the keys? — ____ yellow.', 'I''m', 'They''re', 'He''s', 'It''s', 'B', '', 'mcq', 1, 5, 'g7su2.05'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su2.05' AND q.stem='— What colour are the keys? — ____ yellow.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su2.05'), '____ ____ are the shoes? — They''re green.', 'What color are', 'How colour', 'What colour', 'Where colour', 'C', '', 'mcq', 1, 6, 'g7su2.05'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su2.05' AND q.stem='____ ____ are the shoes? — They''re green.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su2.06'), 'They are in the bag. → ____ they in the bag?', 'Is', 'Do', 'Are', 'Am', 'C', '', 'mcq', 1, 1, 'g7su2.06'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su2.06' AND q.stem='They are in the bag. → ____ they in the bag?');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su2.06'), 'It is a ruler. → ____ it a ruler?', 'Am', 'Are', 'Do', 'Is', 'D', '', 'mcq', 1, 2, 'g7su2.06'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su2.06' AND q.stem='It is a ruler. → ____ it a ruler?');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su2.06'), '— Is it in your schoolbag? — No, ____.', 'it isn''t', 'I''m not', 'they aren''t', 'it is', 'A', '', 'mcq', 1, 3, 'g7su2.06'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su2.06' AND q.stem='— Is it in your schoolbag? — No, ____.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su2.06'), '— Are they books? — Yes, ____.', 'it is', 'they are', 'they aren''t', 'I am', 'B', '', 'mcq', 1, 4, 'g7su2.06'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su2.06' AND q.stem='— Are they books? — Yes, ____.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su2.06'), '____ it your new cap? — Yes, it is.', 'Do', 'Are', 'Am', 'Is', 'D', '', 'mcq', 1, 5, 'g7su2.06'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su2.06' AND q.stem='____ it your new cap? — Yes, it is.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su2.06'), '____ they your glasses? — No, they aren''t.', 'Is', 'Am', 'Are', 'Do', 'C', '', 'mcq', 1, 6, 'g7su2.06'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su2.06' AND q.stem='____ they your glasses? — No, they aren''t.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su3.01'), '____ is my cat. (近，单数)', 'Those', 'They', 'This', 'These', 'C', '', 'mcq', 1, 1, 'g7su3.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su3.01' AND q.stem='____ is my cat. (近，单数)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su3.01'), 'What are ____ over there? (远，复数)', 'this', 'those', 'it', 'that', 'B', '', 'mcq', 1, 2, 'g7su3.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su3.01' AND q.stem='What are ____ over there? (远，复数)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su3.01'), '____ is a bird in the sky. (远，单数)', 'They', 'That', 'These', 'Those', 'B', '', 'mcq', 1, 3, 'g7su3.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su3.01' AND q.stem='____ is a bird in the sky. (远，单数)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su3.01'), '____ books in my hand are new. (近，复数)', 'That', 'It', 'This', 'These', 'D', '', 'mcq', 1, 4, 'g7su3.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su3.01' AND q.stem='____ books in my hand are new. (近，复数)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su3.01'), 'Is ____ your apple? (近，单数)', 'these', 'they', 'those', 'this', 'D', '', 'mcq', 1, 5, 'g7su3.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su3.01' AND q.stem='Is ____ your apple? (近，单数)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su3.01'), '____ are carrot plants over there. (远，复数)', 'That', 'This', 'It', 'Those', 'D', '', 'mcq', 1, 6, 'g7su3.01'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su3.01' AND q.stem='____ are carrot plants over there. (远，复数)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su3.02'), '15 的英文是 ____.', 'fifteen', 'fiveteen', 'fifty', 'fifteenth', 'A', '', 'mcq', 1, 1, 'g7su3.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su3.02' AND q.stem='15 的英文是 ____.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su3.02'), 'There are ____ ducks on the lake. (12)', 'twolve', 'twelve', 'twelfth', 'twenty', 'B', '', 'mcq', 1, 2, 'g7su3.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su3.02' AND q.stem='There are ____ ducks on the lake. (12)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su3.02'), '8 + 9 = ____.', 'sixteen', 'seventeen', 'eighteen', 'seventy', 'B', '', 'mcq', 1, 3, 'g7su3.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su3.02' AND q.stem='8 + 9 = ____.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su3.02'), '____ chickens are in the yard. (20)', 'Twenty', 'Twoteen', 'Twelve', 'Twentieth', 'A', '', 'mcq', 1, 4, 'g7su3.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su3.02' AND q.stem='____ chickens are in the yard. (20)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su3.02'), '13 的英文是 ____.', 'thirteen', 'thirteenth', 'thirty', 'threeteen', 'A', '', 'mcq', 1, 5, 'g7su3.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su3.02' AND q.stem='13 的英文是 ____.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su3.02'), 'How many? — ____ trees. (11)', 'twelve', 'eleventh', 'eleven', 'elephen', 'C', '', 'mcq', 1, 6, 'g7su3.02'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su3.02' AND q.stem='How many? — ____ trees. (11)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su3.03'), '____ many rabbits do you have?', 'Who', 'Where', 'How', 'What', 'C', '', 'mcq', 1, 1, 'g7su3.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su3.03' AND q.stem='____ many rabbits do you have?');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su3.03'), 'What ____ these? — They are flowers.', 'is', 'do', 'are', 'am', 'C', '', 'mcq', 1, 2, 'g7su3.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su3.03' AND q.stem='What ____ these? — They are flowers.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su3.03'), '____ is that? — It''s a dog.', 'How', 'What', 'Where', 'Who', 'B', '', 'mcq', 1, 3, 'g7su3.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su3.03' AND q.stem='____ is that? — It''s a dog.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su3.03'), 'How many ____ are there? — Five.', 'sheeps', 'sheepes', 'a sheep', 'sheep', 'D', '', 'mcq', 1, 4, 'g7su3.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su3.03' AND q.stem='How many ____ are there? — Five.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su3.03'), '____ is this? — It''s a cat.', 'Who', 'Where', 'What', 'How', 'C', '', 'mcq', 1, 5, 'g7su3.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su3.03' AND q.stem='____ is this? — It''s a cat.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su3.03'), 'What ____ those? — They''re apple trees.', 'am', 'are', 'do', 'is', 'B', '', 'mcq', 1, 6, 'g7su3.03'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su3.03' AND q.stem='What ____ those? — They''re apple trees.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su3.04'), 'I have two ____. (box)', 'boxies', 'boxes', 'box', 'boxs', 'B', '', 'mcq', 1, 1, 'g7su3.04'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su3.04' AND q.stem='I have two ____. (box)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su3.04'), 'The ____ are white. (sheep, 不规则)', 'a sheep', 'sheepes', 'sheeps', 'sheep', 'D', '', 'mcq', 1, 2, 'g7su3.04'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su3.04' AND q.stem='The ____ are white. (sheep, 不规则)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su3.04'), 'Look at those ____ in the yard. (rabbit)', 'a rabbit', 'rabbit', 'rabbits', 'rabbites', 'C', '', 'mcq', 1, 3, 'g7su3.04'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su3.04' AND q.stem='Look at those ____ in the yard. (rabbit)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su3.04'), 'There are many ____ plants here. (tomato)', 'tomato', 'tomatoes', 'a tomato', 'tomatos', 'A', '', 'mcq', 1, 4, 'g7su3.04'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su3.04' AND q.stem='There are many ____ plants here. (tomato)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su3.04'), 'I can see ten ____. (baby chicken)', 'baby chickens', 'baby chickenes', 'babies chicken', 'baby chicken', 'A', '', 'mcq', 1, 5, 'g7su3.04'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su3.04' AND q.stem='I can see ten ____. (baby chicken)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su3.04'), 'We have five ____. (horse)', 'horsees', 'horses', 'horse', 'a horse', 'B', '', 'mcq', 1, 6, 'g7su3.04'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su3.04' AND q.stem='We have five ____. (horse)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su3.05'), 'My ____ farm is big. (uncle, 所有格)', 'uncles', 'uncles''', 'uncle', 'uncle''s', 'D', '', 'mcq', 1, 1, 'g7su3.05'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su3.05' AND q.stem='My ____ farm is big. (uncle, 所有格)');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su3.05'), 'He ____ three horses.', 'have', 'do', 'is', 'has', 'D', '', 'mcq', 1, 2, 'g7su3.05'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su3.05' AND q.stem='He ____ three horses.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su3.05'), 'Does he ____ any cows?', 'had', 'has', 'have', 'is', 'C', '', 'mcq', 1, 3, 'g7su3.05'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su3.05' AND q.stem='Does he ____ any cows?');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su3.05'), 'My uncle''s farm ____ beautiful.', 'am', 'are', 'have', 'is', 'D', '', 'mcq', 1, 4, 'g7su3.05'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su3.05' AND q.stem='My uncle''s farm ____ beautiful.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su3.05'), 'She ____ ten white sheep.', 'do', 'have', 'has', 'is', 'C', '', 'mcq', 1, 5, 'g7su3.05'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su3.05' AND q.stem='She ____ ten white sheep.');
INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)
SELECT (SELECT id FROM public.junior_grammar_points WHERE code='g7su3.05'), 'This is ____ schoolbag. (Tom, 所有格)', 'Tom', 'Tom''s', 'Toms''', 'Toms', 'B', '', 'mcq', 1, 6, 'g7su3.05'
WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='g7su3.05' AND q.stem='This is ____ schoolbag. (Tom, 所有格)');

-- D. count 校验(应:语法点 17 / 题 102)
SELECT 'points' AS kind, count(*) FROM public.junior_grammar_points WHERE unit IS NOT NULL
UNION ALL SELECT 'questions', count(*) FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.unit IS NOT NULL;
