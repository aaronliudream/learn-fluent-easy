-- ============================================================
-- 自然奇观 how 提问 · 10 题 · 挂 g8.15 考点 + 专属知识点 kp(只抽这 10 题)
-- 校准:目标表 = junior_grammar_questions(不是 ai_generated_questions)。
--   机器区分 = kp_id 列(loadKpMcqPool 按 kp_id 抽题);日常 g8.15 题 kp_id=NULL,不会混入。
--   g8.15 point_id = 8d97e828-56dd-4abe-99a0-a82f380a4b7a
-- 幂等:固定 UUID + sort_order 9300-9309;重跑前可先删本 kp 的题(见文件尾备注)。
-- ============================================================

-- ① 建专属知识点(grammarKpCode 将引用 code='g8.15-wonder')
INSERT INTO public.junior_knowledge_points (id, point_id, code, title, sort_order, target_count)
VALUES ('b8150000-0000-4000-8000-000000000015',
        '8d97e828-56dd-4abe-99a0-a82f380a4b7a',
        'g8.15-wonder', '自然奇观 how 提问（how high/deep/long/large）', 10, 10)
ON CONFLICT (id) DO NOTHING;

-- ② 10 题入 junior_grammar_questions(point_id=g8.15, kp_id=上面的 kp)
INSERT INTO public.junior_grammar_questions
  (id, point_id, kp_id, question_type, stem, option_a, option_b, option_c, option_d,
   correct_answer, explanation, distractors, use_ai_grading, difficulty, sort_order)
VALUES
('8b150001-0000-4000-8000-000000000001','8d97e828-56dd-4abe-99a0-a82f380a4b7a','b8150000-0000-4000-8000-000000000015','mcq',
 '______ is Mount Qomolangma? — It''s 8,848 metres high.',
 'How long','How high','How deep','How old','B',
 '问高度用 how high。答语 8,848 metres high 含形容词 high。','[]'::jsonb,false,1,9300),
('8b150002-0000-4000-8000-000000000002','8d97e828-56dd-4abe-99a0-a82f380a4b7a','b8150000-0000-4000-8000-000000000015','mcq',
 '______ is the Mariana Trench? — It''s very deep, about 11,000 metres.',
 'How high','How deep','How long','How wide','B',
 '问深度用 how deep。答语 very deep 含形容词 deep。','[]'::jsonb,false,2,9301),
('8b150003-0000-4000-8000-000000000003','8d97e828-56dd-4abe-99a0-a82f380a4b7a','b8150000-0000-4000-8000-000000000015','mcq',
 '______ is the Yangtze River? — It''s about 6,300 kilometres long.',
 'How deep','How high','How long','How big','C',
 '问长度用 how long。答语 6,300 kilometres long 含形容词 long。','[]'::jsonb,false,1,9302),
('8b150004-0000-4000-8000-000000000004','8d97e828-56dd-4abe-99a0-a82f380a4b7a','b8150000-0000-4000-8000-000000000015','mcq',
 '______ is the Great Barrier Reef? — It''s very large, covering 348,000 square kilometres.',
 'How long','How high','How large','How deep','C',
 '问面积大小用 how large。答语 very large 含形容词 large。','[]'::jsonb,false,2,9303),
('8b150005-0000-4000-8000-000000000005','8d97e828-56dd-4abe-99a0-a82f380a4b7a','b8150000-0000-4000-8000-000000000015','mcq',
 'The Nile River is 6,671 kilometres long. （对划线部分提问）______ is the Nile River?',
 'How long','How high','How big','How far','A',
 '对 6,671 kilometres long 提问,问长度用 How long。','[]'::jsonb,false,2,9304),
('8b150006-0000-4000-8000-000000000006','8d97e828-56dd-4abe-99a0-a82f380a4b7a','b8150000-0000-4000-8000-000000000015','mcq',
 'Mount Qomolangma is 8,848 metres high. （对划线部分提问）______ is Mount Qomolangma?',
 'How deep','How high','How old','How long','B',
 '对 8,848 metres high 提问,问高度用 How high。','[]'::jsonb,false,2,9305),
('8b150007-0000-4000-8000-000000000007','8d97e828-56dd-4abe-99a0-a82f380a4b7a','b8150000-0000-4000-8000-000000000015','mcq',
 '— How high is the mountain? — ______',
 'It''s 6,300 km long.','It''s about 5,000 metres high.','It''s very deep.','It''s blue.','B',
 'How high 问高度,应答含 high + 高度数值。','[]'::jsonb,false,2,9306),
('8b150008-0000-4000-8000-000000000008','8d97e828-56dd-4abe-99a0-a82f380a4b7a','b8150000-0000-4000-8000-000000000015','mcq',
 '— How deep is the lake? — ______',
 'It''s 200 metres deep.','It''s 100 km long.','It''s very tall.','It''s beautiful.','A',
 'How deep 问深度,应答含 deep + 深度数值。','[]'::jsonb,false,2,9307),
('8b150009-0000-4000-8000-000000000009','8d97e828-56dd-4abe-99a0-a82f380a4b7a','b8150000-0000-4000-8000-000000000015','mcq',
 'How ______ is the river? We want to know its length.',
 'high','deep','long','old','C',
 'length(长度)对应形容词 long → How long。','[]'::jsonb,false,1,9308),
('8b15000a-0000-4000-8000-00000000000a','8d97e828-56dd-4abe-99a0-a82f380a4b7a','b8150000-0000-4000-8000-000000000015','mcq',
 '想知道珠峰有多高,应该问:______',
 'How long is Qomolangma?','How deep is Qomolangma?','How high is Qomolangma?','How old is Qomolangma?','C',
 '问"多高"用 How high。','[]'::jsonb,false,2,9309)
ON CONFLICT (id) DO NOTHING;

-- ③ 校验:本 kp 应有 10 题,且日常 g8.15 题 kp_id 仍为 NULL(不被 KP 路径抽到)
SELECT count(*) AS wonder_count
FROM public.junior_grammar_questions
WHERE kp_id = 'b8150000-0000-4000-8000-000000000015';   -- 期望 10

SELECT
  count(*) FILTER (WHERE kp_id = 'b8150000-0000-4000-8000-000000000015') AS wonder,
  count(*) FILTER (WHERE kp_id IS NULL) AS daily_untagged
FROM public.junior_grammar_questions
WHERE point_id = '8d97e828-56dd-4abe-99a0-a82f380a4b7a';

-- ============================================================
-- 重跑/回滚:
--   DELETE FROM public.junior_grammar_questions WHERE kp_id='b8150000-0000-4000-8000-000000000015';
--   DELETE FROM public.junior_knowledge_points  WHERE id='b8150000-0000-4000-8000-000000000015';
-- ============================================================
