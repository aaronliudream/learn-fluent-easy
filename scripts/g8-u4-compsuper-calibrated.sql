-- ============================================================
-- 八下 U4 自然奇观语境 · 比较级最高级 14 题 · 校准版
-- 目标表 junior_grammar_questions(真实列):
--   point_id(考点uuid,不是kp_id) / question_type='mcq' / option_a-d / correct_answer字母
--   / explanation / difficulty(int 1-3) / sort_order / distractors / use_ai_grading
--   ❌ 草稿用的 skill_area / year_band 列在本表不存在(已删);question_type 用 'mcq' 不是 'single_choice'。
--   kp_id 留 NULL → 归入考点日常池,U4 走 grammarCodes(loadPointMcq 按 point_id 抽)即可服务。
-- point_id: g8.09=4daeed76… g8.05=9994bed6… g8.04=37f28b3b…
-- 固定 UUID + sort_order 9400+;幂等 ON CONFLICT DO NOTHING。
-- ============================================================

INSERT INTO public.junior_grammar_questions
  (id, point_id, question_type, stem, option_a, option_b, option_c, option_d,
   correct_answer, explanation, distractors, use_ai_grading, difficulty, sort_order)
VALUES
-- ===== g8.09 形容词最高级 (8题) =====
('8b090001-0000-4000-8000-000000000001','4daeed76-f5a1-40b1-90a9-91663258952c','mcq',
 'Mount Qomolangma is the ______ mountain in the world.',
 'high','higher','highest','highly','C',
 '三者以上比较用最高级,the highest mountain 世界最高的山。','[]'::jsonb,false,3,9400),
('8b090002-0000-4000-8000-000000000002','4daeed76-f5a1-40b1-90a9-91663258952c','mcq',
 'Of all the oceans, the Pacific Ocean is the ______.',
 'deep','deeper','deepest','deeply','C',
 'Of all 表范围,用最高级 the deepest 最深的。','[]'::jsonb,false,3,9401),
('8b090003-0000-4000-8000-000000000003','4daeed76-f5a1-40b1-90a9-91663258952c','mcq',
 'The Sahara Desert is one of the ______ deserts on earth.',
 'hot','hotter','hottest','most hot','C',
 'one of the + 最高级复数;hot 重读闭音节双写 t→hottest。','[]'::jsonb,false,3,9402),
('8b090004-0000-4000-8000-000000000004','4daeed76-f5a1-40b1-90a9-91663258952c','mcq',
 'Russia is ______ country in the world in size.',
 'large','larger','the largest','largest','C',
 '形容词最高级前加 the,the largest 最大的。','[]'::jsonb,false,3,9403),
('8b090005-0000-4000-8000-000000000005','4daeed76-f5a1-40b1-90a9-91663258952c','mcq',
 'The Dead Sea is the ______ place on land. Its surface is 416 metres below sea level.',
 'low','lower','lowest','lowly','C',
 '陆地上最低的地方,最高级 the lowest。','[]'::jsonb,false,3,9404),
('8b090006-0000-4000-8000-000000000006','4daeed76-f5a1-40b1-90a9-91663258952c','mcq',
 'Some deep-sea animals have the ______ abilities to survive in the dark.',
 'strange','stranger','strangest','most strangely','C',
 '最高级 the strangest 最奇特的能力(修饰名词 abilities)。','[]'::jsonb,false,3,9405),
('8b090007-0000-4000-8000-000000000007','4daeed76-f5a1-40b1-90a9-91663258952c','mcq',
 'To me, visiting the Great Barrier Reef is ______ experience of my lifetime.',
 'exciting','more exciting','the most exciting','most exciting','C',
 '多音节形容词最高级 the most exciting 一生中最激动人心的经历。','[]'::jsonb,false,3,9406),
('8b090008-0000-4000-8000-000000000008','4daeed76-f5a1-40b1-90a9-91663258952c','mcq',
 'The Hukou Waterfall is the second ______ waterfall in China.',
 'large','larger','largest','most large','C',
 '序数词 second + 最高级 largest,表示第二大的。','[]'::jsonb,false,3,9407),
-- ===== g8.05 副词比较最高级 (3题) =====
('8b050001-0000-4000-8000-000000000001','9994bed6-1988-4e5a-afaa-a441c9cef7a6','mcq',
 'The Yangtze River travels the ______ in China, running about 6,300 kilometres.',
 'far','farther','farthest','most far','C',
 '副词最高级修饰动词 travels;far→farthest 走得最远。','[]'::jsonb,false,3,9400),
('8b050002-0000-4000-8000-000000000002','9994bed6-1988-4e5a-afaa-a441c9cef7a6','mcq',
 'Who climbed ______ of all the team members during the trip?',
 'highest','the higher','highly','more highly','A',
 '副词最高级修饰动词 climbed;of all 表范围,副词最高级可省 the→highest。','[]'::jsonb,false,3,9401),
('8b050003-0000-4000-8000-000000000003','9994bed6-1988-4e5a-afaa-a441c9cef7a6','mcq',
 'Which of the three rivers flows the ______?',
 'fast','faster','fastest','most fast','C',
 '三者中比较,副词最高级 fastest 修饰 flows 流得最快。','[]'::jsonb,false,3,9402),
-- ===== g8.04 形容词比较级 (3题) =====
('8b040001-0000-4000-8000-000000000001','37f28b3b-fb2a-4d14-beb9-18952861bb53','mcq',
 'This lake is much ______ than that one, so it is safer for swimming.',
 'shallow','shallower','shallowest','more shallow','B',
 'than 连接两者用比较级;much 修饰比较级 shallower 浅得多。','[]'::jsonb,false,3,9400),
('8b040002-0000-4000-8000-000000000002','37f28b3b-fb2a-4d14-beb9-18952861bb53','mcq',
 'The weather on Mount Qomolangma is ______ than the weather in the valley.',
 'changeable','more changeable','most changeable','changeably','B',
 '多音节形容词比较级用 more;than 提示比较级 more changeable 更多变。','[]'::jsonb,false,3,9401),
('8b040003-0000-4000-8000-000000000003','37f28b3b-fb2a-4d14-beb9-18952861bb53','mcq',
 'Human curiosity is ______ than fear when we explore the unknown world.',
 'strong','stronger','strongest','strongly','B',
 'than 连接两者用比较级 stronger 更强。','[]'::jsonb,false,3,9402)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 校验(应 14 行:g8.09=8 / g8.05=3 / g8.04=3;id 是 uuid 列须 ::text)
SELECT CASE
         WHEN id::text LIKE '8b09%' THEN 'g8.09最高级'
         WHEN id::text LIKE '8b05%' THEN 'g8.05副词'
         WHEN id::text LIKE '8b04%' THEN 'g8.04比较级'
       END AS point, count(*) AS cnt
FROM public.junior_grammar_questions
WHERE id::text LIKE '8b0%-0000-4000-8000-%'
GROUP BY 1 ORDER BY 1;
-- ============================================================
