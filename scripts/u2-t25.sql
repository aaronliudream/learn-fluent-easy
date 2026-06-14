-- ============================================================
-- U2 (No Rules) 义务情态 point g7-t25 + 2kp + 24题
-- WHERE NOT EXISTS 幂等; FK subselect-by-code; 裸'[]'隐式转无cast
-- ============================================================

-- ① 建 point g7-t25
INSERT INTO junior_grammar_points (id, category_id, code, title, cefr, grade, summary, explanation_md, examples, sort_order, ai_corpus)
SELECT 'a6924a11-f5e3-447c-a28b-08306437e4ba', 'e05f9874-6401-42f8-a361-28f1dee3a58e', 'g7-t25', '情态动词(义务):have to/must/mustn''t', 'A1', 7, '初一专题:义务情态动词。have to(客观/外部规定)vs must(主观/强调);mustn''t(禁止)vs don''t have to(不必)。No Rules校规家规交规主题。', '', '[]', 25, NULL
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_points WHERE code = 'g7-t25');

-- ② 建 2 kp
INSERT INTO junior_knowledge_points (id, point_id, code, title, summary, sort_order, target_count)
SELECT 'a82c1024-327c-40fc-aacb-78c8a66b6ef8', (SELECT id FROM junior_grammar_points WHERE code='g7-t25'), 'g7-t25-must', '肯定义务(have to/must/has to/must+原形)', NULL, 1, 20
WHERE NOT EXISTS (SELECT 1 FROM junior_knowledge_points WHERE code = 'g7-t25-must');

INSERT INTO junior_knowledge_points (id, point_id, code, title, summary, sort_order, target_count)
SELECT '1c3626e4-6426-4428-993f-48d98fe95489', (SELECT id FROM junior_grammar_points WHERE code='g7-t25'), 'g7-t25-prohibit', '禁止与不必(mustn''t禁止/don''t have to不必/辨析)', NULL, 2, 20
WHERE NOT EXISTS (SELECT 1 FROM junior_knowledge_points WHERE code = 'g7-t25-prohibit');

-- ③ 24 题 (must 12 / prohibit 12)
INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT '079a122b-08c5-46fe-b42f-8216ba1f4fd7', (SELECT id FROM junior_grammar_points WHERE code='g7-t25'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t25-must'), 'Students ___ wear school uniforms. It is a school rule.', 'have to', 'can', 'may', 'don''t have to', 'A', '**have to**表示客观必须(外部规定)。学校规定→**have to**穿校服。', 2, 1, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = 'Students ___ wear school uniforms. It is a school rule.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT '1f4e6af0-4534-4f7f-8d58-ee57dd6a653f', (SELECT id FROM junior_grammar_points WHERE code='g7-t25'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t25-must'), 'You ___ finish your homework before you watch TV. I really mean it.', 'can', 'must', 'may', 'don''t have to', 'B', '**must**表示说话人主观强调的必须。语气强烈→**must**。', 2, 2, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = 'You ___ finish your homework before you watch TV. I really mean it.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT '9d73af6f-8f01-438a-85d9-2cc310178faa', (SELECT id FROM junior_grammar_points WHERE code='g7-t25'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t25-must'), 'In China, drivers ___ stop when the traffic light is red.', 'can', 'may', 'have to', 'needn''t', 'C', '交通规则(客观规定)→**have to**。must偏主观,客观规定多用have to。', 2, 3, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = 'In China, drivers ___ stop when the traffic light is red.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT 'bb27e135-dcbd-49c3-b0d5-2f84daad7c23', (SELECT id FROM junior_grammar_points WHERE code='g7-t25'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t25-must'), 'It is late. We ___ go home now, or our parents will worry.', 'must', 'can', 'may', 'don''t have to', 'A', '说话人判断的必须→**must**。', 2, 4, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = 'It is late. We ___ go home now, or our parents will worry.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT '0d9501f6-2cb5-442a-853a-3f6614b5bb61', (SELECT id FROM junior_grammar_points WHERE code='g7-t25'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t25-must'), '— Why are you in a hurry? — Because I ___ catch the early bus.', 'can', 'have to', 'may', 'mustn''t', 'B', '外部安排(赶早班车)的客观必须→**have to**。', 2, 5, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = '— Why are you in a hurry? — Because I ___ catch the early bus.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT '58e1842e-692a-4174-b51c-f56d63b860b2', (SELECT id FROM junior_grammar_points WHERE code='g7-t25'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t25-must'), 'My mother says I ___ clean my room every weekend.', 'can', 'may', 'have to', 'don''t have to', 'C', '家规(外部要求)→**have to**。', 2, 6, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = 'My mother says I ___ clean my room every weekend.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT '3d56b713-8375-48b7-9916-e1bde2302b2e', (SELECT id FROM junior_grammar_points WHERE code='g7-t25'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t25-must'), 'Everyone ___ follow the rules in the library. Keep quiet, please.', 'must', 'can', 'may', 'needn''t', 'A', '强调人人必须遵守规则→**must**。', 2, 7, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = 'Everyone ___ follow the rules in the library. Keep quiet, please.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT '835b234c-c9d7-42c2-8393-8800a064056d', (SELECT id FROM junior_grammar_points WHERE code='g7-t25'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t25-must'), 'When the third person is the subject, we use ___ not "have to".', 'have to', 'has to', 'must to', 'musts', 'B', '主语是第三人称单数时,have to变**has to**(He has to...)。', 2, 8, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = 'When the third person is the subject, we use ___ not "have to".');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT '9d72fc99-2c0e-4f71-ba70-1dbc60e5f4af', (SELECT id FROM junior_grammar_points WHERE code='g7-t25'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t25-must'), 'Tom ___ wear glasses because he can''t see the blackboard clearly.', 'have to', 'has to', 'must to', 'can', 'B', 'Tom是三单+客观需要→**has to**(三单用has to)。', 2, 9, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = 'Tom ___ wear glasses because he can''t see the blackboard clearly.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT '98af9ab8-74cd-4ecb-9b23-f1c902ccf927', (SELECT id FROM junior_grammar_points WHERE code='g7-t25'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t25-must'), 'After "must", we use the ___ of the verb.', '-ing form', '-ed form', 'base form', 'to + verb', 'C', '情态动词must后接动词**原形**(base form):must go,不是must to go。', 2, 10, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = 'After "must", we use the ___ of the verb.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT '93a91b1e-c34c-4525-9f52-37ecd6d30067', (SELECT id FROM junior_grammar_points WHERE code='g7-t25'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t25-must'), 'You ___ be on time for class. Being late is not allowed.', 'can', 'may', 'must', 'don''t have to', 'C', '强调规则要求→**must**准时。', 2, 11, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = 'You ___ be on time for class. Being late is not allowed.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT 'f0dff529-93f2-4673-b7fb-f6bee284011f', (SELECT id FROM junior_grammar_points WHERE code='g7-t25'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t25-must'), '— Do I have to wear a tie? — Yes, you ___. It is required.', 'must', 'can', 'may', 'needn''t', 'A', 'required(被要求)→肯定回答用**must**(必须)。', 2, 12, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = '— Do I have to wear a tie? — Yes, you ___. It is required.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT 'e090815f-dabd-4b38-8a98-47a96e9bd65f', (SELECT id FROM junior_grammar_points WHERE code='g7-t25'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t25-prohibit'), 'You ___ smoke here. It is a no-smoking area.', 'don''t have to', 'mustn''t', 'may not need', 'can', 'B', '禁烟区→**mustn''t**(禁止/不准)。mustn''t表示禁止。', 2, 13, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = 'You ___ smoke here. It is a no-smoking area.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT 'b5223a14-7149-4441-aafc-4f6c5a066500', (SELECT id FROM junior_grammar_points WHERE code='g7-t25'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t25-prohibit'), 'Tomorrow is Sunday, so we ___ get up early. We can sleep in.', 'mustn''t', 'can''t', 'don''t have to', 'must', 'C', '周日可睡懒觉→**don''t have to**(不必)。表示没必要做。', 2, 14, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = 'Tomorrow is Sunday, so we ___ get up early. We can sleep in.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT '9a76e39b-385d-4a88-9e08-3f07d45ad679', (SELECT id FROM junior_grammar_points WHERE code='g7-t25'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t25-prohibit'), '"Mustn''t" means ___.', 'don''t need to', 'it is not necessary', 'it is not allowed', 'you can choose', 'C', '**mustn''t**=禁止/不准做(it is not allowed),语气强。', 2, 15, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = '"Mustn''t" means ___.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT 'cd58d60e-cb68-4d99-8d49-1fd1dc633442', (SELECT id FROM junior_grammar_points WHERE code='g7-t25'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t25-prohibit'), '"Don''t have to" means ___.', 'it is forbidden', 'it is not necessary', 'you can''t', 'it is a must', 'B', '**don''t have to**=不必/没必要(it is not necessary),可做可不做。', 2, 16, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = '"Don''t have to" means ___.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT '556c6b04-e794-46f9-93d1-d604b61fd444', (SELECT id FROM junior_grammar_points WHERE code='g7-t25'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t25-prohibit'), 'You ___ talk loudly in the hospital. People are resting.', 'don''t have to', 'mustn''t', 'needn''t', 'can', 'B', '医院应安静→**mustn''t**(不准大声说话)。', 2, 17, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = 'You ___ talk loudly in the hospital. People are resting.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT '6846ad87-5b65-4ab1-9ce8-81916c8bdbd4', (SELECT id FROM junior_grammar_points WHERE code='g7-t25'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t25-prohibit'), 'It is a free day. You ___ wear your uniform if you don''t want to.', 'mustn''t', 'can''t', 'don''t have to', 'must', 'C', '自由着装日→**don''t have to**(不必穿校服)。', 2, 18, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = 'It is a free day. You ___ wear your uniform if you don''t want to.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT 'fec50f78-c3d2-48e9-9700-8becbc4b9edf', (SELECT id FROM junior_grammar_points WHERE code='g7-t25'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t25-prohibit'), 'Students ___ run in the hallways. It is dangerous.', 'don''t have to', 'mustn''t', 'needn''t', 'should', 'B', '危险→**mustn''t**(禁止奔跑)。', 2, 19, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = 'Students ___ run in the hallways. It is dangerous.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT '57a6e6e4-0e86-44ca-9563-6306dc2f86e6', (SELECT id FROM junior_grammar_points WHERE code='g7-t25'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t25-prohibit'), 'We have enough time, so you ___ hurry.', 'mustn''t', 'can''t', 'don''t have to', 'must', 'C', '时间充足→**don''t have to**(不必赶)。', 2, 20, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = 'We have enough time, so you ___ hurry.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT '0575f424-c020-4f3c-a62f-52fdf3beb747', (SELECT id FROM junior_grammar_points WHERE code='g7-t25'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t25-prohibit'), 'You ___ touch that! It is very hot and dangerous.', 'don''t have to', 'mustn''t', 'needn''t', 'may', 'B', '危险→**mustn''t**(不准碰)。', 2, 21, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = 'You ___ touch that! It is very hot and dangerous.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT '3c7340ce-3113-482b-92f1-760310597dc4', (SELECT id FROM junior_grammar_points WHERE code='g7-t25'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t25-prohibit'), '— Do I have to bring my own pen? — No, you ___. We have some here.', 'mustn''t', 'must', 'don''t have to', 'can''t', 'C', '这里有笔→否定回答用**don''t have to**(不必带)。注意:Do you have to...?否定答用don''t have to,不是mustn''t。', 2, 22, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = '— Do I have to bring my own pen? — No, you ___. We have some here.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT 'cc79a9d3-4c66-412a-90a1-0f99312c0152', (SELECT id FROM junior_grammar_points WHERE code='g7-t25'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t25-prohibit'), 'Drivers ___ use phones while driving. It is against the law.', 'don''t have to', 'mustn''t', 'needn''t', 'may', 'B', '违法→**mustn''t**(禁止开车用手机)。', 2, 23, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = 'Drivers ___ use phones while driving. It is against the law.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT '3a65388c-97ba-4107-9ae9-81ffa1c49dcc', (SELECT id FROM junior_grammar_points WHERE code='g7-t25'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t25-prohibit'), 'You ___ finish all the food. Eat as much as you like.', 'mustn''t', 'can''t', 'don''t have to', 'must', 'C', '随意吃→**don''t have to**(不必吃完)。', 2, 24, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = 'You ___ finish all the food. Eat as much as you like.');

-- ④ 校验
SELECT count(*) FROM junior_grammar_points WHERE code='g7-t25'; -- 应 1
SELECT count(*) FROM junior_knowledge_points WHERE code IN ('g7-t25-must','g7-t25-prohibit'); -- 应 2
SELECT count(*), kp_id FROM junior_grammar_questions WHERE point_id=(SELECT id FROM junior_grammar_points WHERE code='g7-t25') GROUP BY kp_id; -- 应 must12/prohibit12
