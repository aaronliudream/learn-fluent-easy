-- ============================================================
-- U4 (Eat Well) 可数不可数与点餐 point g7-t26 + 2kp + 24题
-- WHERE NOT EXISTS 幂等; FK subselect-by-code; 裸'[]'隐式转
-- ============================================================

-- ① 建 point g7-t26
INSERT INTO junior_grammar_points (id, category_id, code, title, cefr, grade, summary, explanation_md, examples, sort_order, ai_corpus)
SELECT 'd0fef3f2-a13b-4064-9e8d-868d9f33e14e', 'e05f9874-6401-42f8-a361-28f1dee3a58e', 'g7-t26', '可数不可数与点餐:How much/many + would like', 'A1', 7, '初一专题:可数/不可数名词(much/many)、How much/How many提问、量词(a piece of/a glass of)、would like点餐。Eat Well食物主题。', '', '[]', 26, NULL
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_points WHERE code = 'g7-t26');

-- ② 建 2 kp
INSERT INTO junior_knowledge_points (id, point_id, code, title, summary, sort_order, target_count)
SELECT '96f552f9-0c18-4e92-ad10-89349e0bb5e2', (SELECT id FROM junior_grammar_points WHERE code='g7-t26'), 'g7-t26-count', '可数不可数与数量(much/many/How much/many/量词)', NULL, 1, 20
WHERE NOT EXISTS (SELECT 1 FROM junior_knowledge_points WHERE code = 'g7-t26-count');

INSERT INTO junior_knowledge_points (id, point_id, code, title, summary, sort_order, target_count)
SELECT 'c20337fd-b4da-47bb-be0a-18abf00f53d9', (SELECT id FROM junior_grammar_points WHERE code='g7-t26'), 'g7-t26-wouldlike', '点餐would like(would like + 食物/some)', NULL, 2, 20
WHERE NOT EXISTS (SELECT 1 FROM junior_knowledge_points WHERE code = 'g7-t26-wouldlike');

-- ③ 24 题 (count 14 / wouldlike 10)
INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT 'c0f7b103-fd6b-486c-8f1d-e0f179fa2b6d', (SELECT id FROM junior_grammar_points WHERE code='g7-t26'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t26-count'), 'How ___ apples do you want? — Three, please.', 'much', 'many', 'some', 'any', 'B', 'apples**可数复数**,问数量用**How many**。many修饰可数名词。', 2, 1, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = 'How ___ apples do you want? — Three, please.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT '8ee1d1f8-f8ef-4c86-96f9-a0d88c2d9e38', (SELECT id FROM junior_grammar_points WHERE code='g7-t26'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t26-count'), 'How ___ milk do you drink every day?', 'many', 'much', 'some', 'few', 'B', 'milk**不可数**,问数量用**How much**。much修饰不可数名词。', 2, 2, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = 'How ___ milk do you drink every day?');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT 'f5a2b22b-1d0c-445b-87d3-5de77a327862', (SELECT id FROM junior_grammar_points WHERE code='g7-t26'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t26-count'), 'There isn''t ___ bread on the table.', 'some', 'many', 'much', 'a', 'C', 'bread不可数+否定→**much**。', 2, 3, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = 'There isn''t ___ bread on the table.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT 'b450e777-0e02-48d8-9bb6-c9b3075a9683', (SELECT id FROM junior_grammar_points WHERE code='g7-t26'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t26-count'), 'I''d like some ___ for lunch.', 'rice', 'a rice', 'rices', 'an rice', 'A', 'some+**不可数**rice,不加a/s→**rice**。', 2, 4, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = 'I''d like some ___ for lunch.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT '57d6b61b-4fdf-4809-8070-6dcf817286cf', (SELECT id FROM junior_grammar_points WHERE code='g7-t26'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t26-count'), '— Do we have any juice? — Yes, there is ___ in the fridge.', 'many', 'some', 'a few', 'an', 'B', '疑问/否定用any,**肯定回答用some**。', 2, 5, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = '— Do we have any juice? — Yes, there is ___ in the fridge.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT '033d2d37-fe02-40a1-a438-5aed15d55eb0', (SELECT id FROM junior_grammar_points WHERE code='g7-t26'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t26-count'), '___ oranges are there in the basket? — Five.', 'How much', 'How many', 'How old', 'What', 'B', 'oranges可数复数,问数量**How many**。', 2, 6, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = '___ oranges are there in the basket? — Five.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT '8b8c3834-c58f-40ec-b5a2-85e3b932f39a', (SELECT id FROM junior_grammar_points WHERE code='g7-t26'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t26-count'), 'Would you like a ___ of bread?', 'piece', 'glass', 'cup', 'bottle', 'A', '面包量词**a piece of**(一片)。', 2, 7, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = 'Would you like a ___ of bread?');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT '80fdb108-2268-45d0-b60b-8d10aeebe4e7', (SELECT id FROM junior_grammar_points WHERE code='g7-t26'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t26-count'), 'We don''t have ___ rice. Let''s buy some.', 'many', 'a few', 'much', 'some', 'C', 'rice不可数+否定→**much**。', 2, 8, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = 'We don''t have ___ rice. Let''s buy some.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT 'b08d16d4-6ba6-428e-bf1f-b5332f45e581', (SELECT id FROM junior_grammar_points WHERE code='g7-t26'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t26-count'), 'How much ___ do you need?', 'apples', 'bananas', 'sugar', 'eggs', 'C', 'How much后接**不可数**→sugar。其它都可数复数。', 2, 9, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = 'How much ___ do you need?');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT 'f96076d7-350e-435d-bd7a-e604126bb5f4', (SELECT id FROM junior_grammar_points WHERE code='g7-t26'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t26-count'), 'There are ___ tomatoes in the fridge.', 'much', 'a little', 'some', 'any', 'C', 'tomatoes可数复数+肯定→**some**。', 2, 10, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = 'There are ___ tomatoes in the fridge.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT 'd574ddf1-6bcb-4353-a779-4e5f30765438', (SELECT id FROM junior_grammar_points WHERE code='g7-t26'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t26-count'), '— How many ___ would you like? — Two cups.', 'tea', 'coffee', 'cups of tea', 'water', 'C', 'tea不可数,用**cups of tea**计量。', 2, 11, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = '— How many ___ would you like? — Two cups.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT '06d1b2b5-f5cd-4246-87f3-2bb6fb93db25', (SELECT id FROM junior_grammar_points WHERE code='g7-t26'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t26-count'), 'I want a ___ of milk.', 'piece', 'glass', 'bag', 'bowl', 'B', '牛奶量词**a glass of**(一杯)。', 2, 12, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = 'I want a ___ of milk.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT '0ff0d77c-973d-4eaf-889d-8885fada5047', (SELECT id FROM junior_grammar_points WHERE code='g7-t26'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t26-count'), '— How much bread do you want? — ___, please.', 'Three', 'Two pieces', 'Many', 'Five', 'B', 'bread不可数,计量用"数字+**pieces**"→Two pieces。', 2, 13, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = '— How much bread do you want? — ___, please.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT '6136e8c6-65bd-459d-acce-3c8fa6f462a8', (SELECT id FROM junior_grammar_points WHERE code='g7-t26'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t26-count'), 'There isn''t any ___ in the soup.', 'carrots', 'potatoes', 'salt', 'eggs', 'C', 'any+**不可数**→salt。其它可数复数。', 2, 14, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = 'There isn''t any ___ in the soup.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT '8a126eda-4ba4-4ae8-b71e-6810cf50232c', (SELECT id FROM junior_grammar_points WHERE code='g7-t26'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t26-wouldlike'), '___ you like some juice? — Yes, please.', 'Do', 'Are', 'Would', 'Will', 'C', '礼貌邀请/点餐**Would you like...?**', 2, 15, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = '___ you like some juice? — Yes, please.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT '937b98c4-7cda-4390-b2c6-cea63358ac1a', (SELECT id FROM junior_grammar_points WHERE code='g7-t26'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t26-wouldlike'), 'I''d like ___ noodles for lunch.', 'any', 'some', 'much', 'a', 'B', 'I''d like后肯定/点餐用**some**。', 2, 16, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = 'I''d like ___ noodles for lunch.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT '82398afa-fb8e-40e4-a47f-50641877c942', (SELECT id FROM junior_grammar_points WHERE code='g7-t26'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t26-wouldlike'), 'I''d like some rice and some ___, please.', 'any', 'chicken', 'many', 'a', 'B', '点餐肯定some+不可数**chicken**。', 2, 17, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = 'I''d like some rice and some ___, please.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT '11c76173-219a-4e8a-8103-d704ccdd2594', (SELECT id FROM junior_grammar_points WHERE code='g7-t26'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t26-wouldlike'), 'Would you like ___ more rice? — No, thanks. I''m full.', 'any', 'some', 'many', 'a', 'B', '**请求/邀请**即使疑问句也用**some**→some more rice。', 2, 18, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = 'Would you like ___ more rice? — No, thanks. I''m full.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT 'e700ef27-1a5a-4785-8832-cddee1d1e701', (SELECT id FROM junior_grammar_points WHERE code='g7-t26'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t26-wouldlike'), 'Would you like some bread? — ___, I''m hungry.', 'No thanks', 'Yes, please', 'I''m not', 'No way', 'B', '接受邀请的得体回答→**Yes, please**。', 2, 19, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = 'Would you like some bread? — ___, I''m hungry.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT '8711eb8e-eb63-45fc-ada8-c22b525931a6', (SELECT id FROM junior_grammar_points WHERE code='g7-t26'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t26-wouldlike'), 'What would you like ___ breakfast?', 'to', 'for', 'at', 'of', 'B', '**What would you like for + 餐**(早餐想吃什么)。', 2, 20, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = 'What would you like ___ breakfast?');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT 'dfdf89d9-c5d2-4e70-8698-daf9067eeb3a', (SELECT id FROM junior_grammar_points WHERE code='g7-t26'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t26-wouldlike'), 'My sister would ___ a hamburger and some salad.', 'likes', 'like', 'liking', 'to like', 'B', 'would是情态动词,后接**原形**→would **like**。', 2, 21, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = 'My sister would ___ a hamburger and some salad.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT 'f64eafaf-2cb4-42e2-8636-223da8e7fada', (SELECT id FROM junior_grammar_points WHERE code='g7-t26'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t26-wouldlike'), 'Would you like ___ soup? — Yes, please.', 'any', 'some', 'many', 'a', 'B', '邀请用**some**(表期待接受)。', 2, 22, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = 'Would you like ___ soup? — Yes, please.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT '60699b83-83e0-4ae8-9f5a-574f31dcaf0f', (SELECT id FROM junior_grammar_points WHERE code='g7-t26'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t26-wouldlike'), 'There are some ___ and some bread in the basket.', 'rice', 'milk', 'apples', 'water', 'C', 'There are+可数复数→**apples**(可数);对比bread不可数。', 2, 23, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = 'There are some ___ and some bread in the basket.');

INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)
SELECT '9038df55-815f-4dca-9194-ca0d8f5aeb19', (SELECT id FROM junior_grammar_points WHERE code='g7-t26'), (SELECT id FROM junior_knowledge_points WHERE code='g7-t26-wouldlike'), '— What would you like? — I''d like ___ apples, please.', 'much', 'any', 'some', 'a', 'C', '点餐肯定+可数复数→**some** apples。', 2, 24, 'mcq', '[]', false
WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = '— What would you like? — I''d like ___ apples, please.');

-- ④ 校验
SELECT count(*) FROM junior_grammar_points WHERE code='g7-t26'; -- 应 1
SELECT count(*) FROM junior_knowledge_points WHERE code IN ('g7-t26-count','g7-t26-wouldlike'); -- 应 2
SELECT count(*), kp_id FROM junior_grammar_questions WHERE point_id=(SELECT id FROM junior_grammar_points WHERE code='g7-t26') GROUP BY kp_id; -- 应 count14/wouldlike10
