-- ============================================================
-- U3 (Keep Fit) 独立频率副词 point g7-t24 + 2kp + 20题
-- 全部 WHERE NOT EXISTS 幂等; FK 用 subselect-by-code 绑定
-- ============================================================

-- ① 建 point g7-t24
INSERT INTO junior_grammar_points (id, category_id, code, title, cefr, grade, summary, explanation_md, examples, sort_order, ai_corpus)
SELECT '79a87c79-ffc6-4b67-882b-35784c820f5d', 'e05f9874-6401-42f8-a361-28f1dee3a58e', 'g7-t24', '频率副词与频率提问（含How often）', 'A1', 7, '初一专题：频率副词(always/usually/often/sometimes/seldom/never)的用法与位置,以及How often提问。Keep Fit健身主题。', '', '[]', 24, NULL
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_points WHERE code = 'g7-t24');

-- ② 建 2 kp
INSERT INTO junior_knowledge_points (id, point_id, code, title, summary, sort_order, target_count)
SELECT '4ded9d97-3d03-4b0a-a7d9-86354e058704', (SELECT id FROM junior_grammar_points WHERE code='g7-t24'), 'g7-t24-freq', '频率副词（always/usually/often/sometimes/seldom/never用法与位置）', NULL, 1, 20
WHERE NOT EXISTS (SELECT 1 FROM junior_knowledge_points WHERE code = 'g7-t24-freq');

INSERT INTO junior_knowledge_points (id, point_id, code, title, summary, sort_order, target_count)
SELECT '2bc3448e-0207-4ec4-9940-52ef167e243a', (SELECT id FROM junior_grammar_points WHERE code='g7-t24'), 'g7-t24-howoften', 'How often提问与答语', NULL, 2, 20
WHERE NOT EXISTS (SELECT 1 FROM junior_knowledge_points WHERE code = 'g7-t24-howoften');

-- ③ 20 题 (freq 12 / howoften 8)
INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT '08ee2fb7-3b62-4a33-aede-c7bee11417f2', (SELECT id FROM junior_grammar_points WHERE code='g7-t24'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t24-freq'), 'I ___ eat vegetables because they are healthy.', 'always', 'badly', 'quickly', 'carefully', 'A', '频率副词(**always**总是/**usually**通常/**often**经常/**sometimes**有时/**seldom**很少/**never**从不)表示频率。蔬菜健康→**always**总是吃。', 2, 1, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = 'I ___ eat vegetables because they are healthy.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT 'ad25e4d5-6d0e-4bca-a170-e46f81d288cc', (SELECT id FROM junior_grammar_points WHERE code='g7-t24'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t24-freq'), 'Tom is fat because he ___ exercises.', 'always', 'usually', 'seldom', 'often', 'C', '他胖→**seldom**很少锻炼。seldom=很少,表低频率。', 2, 2, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = 'Tom is fat because he ___ exercises.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT '808c71e1-5f66-43ec-aa91-a9b21c2cd4cf', (SELECT id FROM junior_grammar_points WHERE code='g7-t24'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t24-freq'), 'We should ___ eat junk food. It is bad for our health.', 'always', 'usually', 'seldom', 'often', 'C', '垃圾食品有害→应该**seldom**很少吃。', 2, 3, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = 'We should ___ eat junk food. It is bad for our health.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT '556a49c3-64d3-4283-8a7c-0ad86fa4140f', (SELECT id FROM junior_grammar_points WHERE code='g7-t24'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t24-freq'), 'My mother ___ goes to the gym. She goes three times a week.', 'never', 'often', 'seldom', 'hardly', 'B', '一周三次→**often**经常去健身房。', 2, 4, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = 'My mother ___ goes to the gym. She goes three times a week.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT '1c95a73d-f48a-4c39-bf77-0c25d6f2b6ce', (SELECT id FROM junior_grammar_points WHERE code='g7-t24'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t24-freq'), 'Frequency adverbs like always usually go ___ the main verb.', 'before', 'after', 'behind', 'under', 'A', '频率副词通常放在**实义动词之前**(I always eat...)。所以选**before**。', 2, 5, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = 'Frequency adverbs like always usually go ___ the main verb.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT 'a5b58009-486e-49cd-823e-cbb4728983b7', (SELECT id FROM junior_grammar_points WHERE code='g7-t24'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t24-freq'), 'Lily ___ drinks milk in the morning. It is a good habit.', 'always', 'never', 'badly', 'hardly', 'A', '好习惯→**always**总是喝牛奶。', 2, 6, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = 'Lily ___ drinks milk in the morning. It is a good habit.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT '4ab805c6-74e5-4c0d-a689-b2f0862abd41', (SELECT id FROM junior_grammar_points WHERE code='g7-t24'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t24-freq'), '— Does your father smoke? — No, he ___ smokes. He cares about health.', 'always', 'usually', 'often', 'never', 'D', '关心健康→**never**从不抽烟。never=从不,表零频率。', 2, 7, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = '— Does your father smoke? — No, he ___ smokes. He cares about health.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT '3841623a-febe-4974-adcb-f7180e08c2e5', (SELECT id FROM junior_grammar_points WHERE code='g7-t24'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t24-freq'), 'I ___ feel tired because I sleep eight hours every night.', 'always', 'seldom', 'usually', 'often', 'B', '睡够8小时→**seldom**很少感到累。', 2, 8, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = 'I ___ feel tired because I sleep eight hours every night.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT '1efaa5a7-dbbf-452b-ad81-e1bb566e0311', (SELECT id FROM junior_grammar_points WHERE code='g7-t24'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t24-freq'), 'Frequency adverbs usually go ___ the verb be.', 'before', 'after', 'under', 'behind', 'B', '频率副词放在**be动词之后**(She is never late)。所以选**after**。', 2, 9, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = 'Frequency adverbs usually go ___ the verb be.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT 'c01a2b90-c758-4841-a2dd-324b7266ddb4', (SELECT id FROM junior_grammar_points WHERE code='g7-t24'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t24-freq'), 'Healthy people ___ eat too much sugar.', 'always', 'usually', 'seldom', 'often', 'C', '健康的人→**seldom**很少吃太多糖。', 2, 10, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = 'Healthy people ___ eat too much sugar.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT 'd777129c-5d90-49fa-bdb9-dcd21a98f1dd', (SELECT id FROM junior_grammar_points WHERE code='g7-t24'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t24-freq'), 'He ___ walks to school to keep fit. Walking is good exercise.', 'never', 'usually', 'seldom', 'hardly', 'B', '为保持健康→**usually**通常走路上学。', 2, 11, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = 'He ___ walks to school to keep fit. Walking is good exercise.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT '94236968-9ce9-480d-b995-41088a125629', (SELECT id FROM junior_grammar_points WHERE code='g7-t24'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t24-freq'), '— How often do you exercise? — I ___ exercise, almost every day.', 'seldom', 'never', 'usually', 'hardly', 'C', '几乎每天→**usually**通常锻炼,表高频率。', 2, 12, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = '— How often do you exercise? — I ___ exercise, almost every day.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT 'f87dd231-404f-49bd-8ca2-cf9fb0e4a9a2', (SELECT id FROM junior_grammar_points WHERE code='g7-t24'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t24-howoften'), '— ___ do you eat fruit? — Twice a day.', 'How often', 'How much', 'How many', 'How long', 'A', '答语“一天两次”是频率→用**How often**问频率(多久一次)。', 2, 13, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = '— ___ do you eat fruit? — Twice a day.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT '1e79a87a-2987-49d6-9e6e-e3f821f30d23', (SELECT id FROM junior_grammar_points WHERE code='g7-t24'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t24-howoften'), '— How often does she go swimming? — ___.', 'Two hours', 'Twice a week', 'Very well', 'By bus', 'B', 'How often问频率,答语用频率→**Twice a week**一周两次。', 2, 14, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = '— How often does she go swimming? — ___.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT '762da5bb-3dcf-48a2-9f94-1f4fa7161a1b', (SELECT id FROM junior_grammar_points WHERE code='g7-t24'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t24-howoften'), 'How often is used to ask about ___.', 'time', 'price', 'frequency', 'distance', 'C', '**How often**用来问**频率**(frequency,多久一次)。', 2, 15, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = 'How often is used to ask about ___.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT 'c7345f35-c933-4926-b55b-b51312c53c0d', (SELECT id FROM junior_grammar_points WHERE code='g7-t24'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t24-howoften'), '— How often do you play sports? — ___ a week.', 'Two time', 'Twice', 'Second', 'Twice time', 'B', '“一周两次”=**twice** a week。twice=两次,固定用法。', 2, 16, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = '— How often do you play sports? — ___ a week.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT 'd9c74d58-134d-45f0-8911-e70b289ce0e7', (SELECT id FROM junior_grammar_points WHERE code='g7-t24'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t24-howoften'), '— ___ does your brother work out? — Every day.', 'How long', 'How much', 'How often', 'How far', 'C', '答语“每天”是频率→用**How often**问。', 2, 17, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = '— ___ does your brother work out? — Every day.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT '962c6d18-3d0a-4010-bee5-0173b02a2922', (SELECT id FROM junior_grammar_points WHERE code='g7-t24'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t24-howoften'), '— How often do you eat fast food? — ___. I think it is unhealthy.', 'Never', 'Two hours', 'Very much', 'By car', 'A', 'How often可用频率副词答→**Never**从不(因为不健康)。', 2, 18, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = '— How often do you eat fast food? — ___. I think it is unhealthy.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT '1141a741-71ec-41b4-a6e2-2c77105103e2', (SELECT id FROM junior_grammar_points WHERE code='g7-t24'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t24-howoften'), '— How often do they have PE classes? — ___ a week.', 'Three time', 'Three times', 'Third', 'Third time', 'B', '“一周三次”=**three times** a week。三次及以上用“数字+times”。', 2, 19, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = '— How often do they have PE classes? — ___ a week.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT '659ede9f-eecf-4f5a-8e33-45eb7762f37b', (SELECT id FROM junior_grammar_points WHERE code='g7-t24'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t24-howoften'), '— How often do you drink water? — I drink water ___.', 'by hand', 'very fast', 'all the time', 'last week', 'C', 'How often问频率→**all the time**一直/总是,表高频率。', 2, 20, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = '— How often do you drink water? — I drink water ___.');

-- ④ 校验 (跑完手动看)
SELECT count(*) FROM junior_grammar_points WHERE code='g7-t24'; -- 应 1
SELECT count(*) FROM junior_knowledge_points WHERE code IN ('g7-t24-freq','g7-t24-howoften'); -- 应 2
SELECT count(*), kp_id FROM junior_grammar_questions WHERE point_id=(SELECT id FROM junior_grammar_points WHERE code='g7-t24') GROUP BY kp_id; -- 应 freq12/howoften8
