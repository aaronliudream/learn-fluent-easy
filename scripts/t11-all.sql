-- ============================================================
-- t11 情态动词 can : 建3kp + 删错位#22 + 标kp_id(56) + 补6解析
-- 整文件可一次跑(DELETE那条已注释单独标注,可单独跑也可随文件跑)
-- ============================================================

-- 【第一段】建 3 kp (WHERE NOT EXISTS by code 幂等)
INSERT INTO junior_knowledge_points (id, point_id, code, title, summary, sort_order, target_count)
SELECT 'a1d4f7b2-3c6e-4a89-bf21-5e0c8d937a64', '0d9a7c0c-1628-4f03-b3b0-f9037e02c46f', 'g7-t11-ability', '能力(can/could do,会做某事)', NULL, 1, 20
WHERE NOT EXISTS (SELECT 1 FROM junior_knowledge_points WHERE code = 'g7-t11-ability');

INSERT INTO junior_knowledge_points (id, point_id, code, title, summary, sort_order, target_count)
SELECT 'b2e5a8c3-4d7f-4b9a-8c12-6f1d9e048b75', '0d9a7c0c-1628-4f03-b3b0-f9037e02c46f', 'g7-t11-neg', '否定(can''t/cannot/couldn''t,不能/禁止/拒绝许可)', NULL, 2, 20
WHERE NOT EXISTS (SELECT 1 FROM junior_knowledge_points WHERE code = 'g7-t11-neg');

INSERT INTO junior_knowledge_points (id, point_id, code, title, summary, sort_order, target_count)
SELECT 'c3f6b9d4-5e80-4cab-9d23-7a2e0f159c86', '0d9a7c0c-1628-4f03-b3b0-f9037e02c46f', 'g7-t11-q', '疑问与请求(Can...?/Could you...?/May I...?/简答Yes I can/许可请求)', NULL, 3, 20
WHERE NOT EXISTS (SELECT 1 FROM junior_knowledge_points WHERE code = 'g7-t11-q');

-- ↓↓↓ 【第二段】删错位题 #22 (sort9513, may=可能,非can) —— 可单独跑 ↓↓↓
DELETE FROM junior_grammar_questions WHERE id = 'e70c4328-4d51-4366-94b4-14ffd9829996';
-- ↑↑↑ DELETE 结束 ↑↑↑

-- 【第三段】标 kp_id : 先显式 q(17)/neg(19), 再兜底 ability(20)
-- ① q 疑问与请求 → c3f6b9d4-5e80-4cab-9d23-7a2e0f159c86
UPDATE junior_grammar_questions SET kp_id = 'c3f6b9d4-5e80-4cab-9d23-7a2e0f159c86' WHERE id = '2f02499c-ba77-4db9-bc2a-362a03ca2490';  -- #3 sort3
UPDATE junior_grammar_questions SET kp_id = 'c3f6b9d4-5e80-4cab-9d23-7a2e0f159c86' WHERE id = 'db0a78c0-b538-468b-b4dd-bee31a8db8e9';  -- #6 sort6
UPDATE junior_grammar_questions SET kp_id = 'c3f6b9d4-5e80-4cab-9d23-7a2e0f159c86' WHERE id = 'fb65f489-1776-4a29-b085-044b7e0fd0e4';  -- #9 sort9
UPDATE junior_grammar_questions SET kp_id = 'c3f6b9d4-5e80-4cab-9d23-7a2e0f159c86' WHERE id = '4d35bc9b-0147-48cb-9db9-ed876606bf2c';  -- #13 sort13
UPDATE junior_grammar_questions SET kp_id = 'c3f6b9d4-5e80-4cab-9d23-7a2e0f159c86' WHERE id = '680c410b-c6c8-40c1-bb30-dd4d149f7008';  -- #14 sort14
UPDATE junior_grammar_questions SET kp_id = 'c3f6b9d4-5e80-4cab-9d23-7a2e0f159c86' WHERE id = '52416137-922a-4c3f-8ec9-97d0e6355925';  -- #16 sort8401
UPDATE junior_grammar_questions SET kp_id = 'c3f6b9d4-5e80-4cab-9d23-7a2e0f159c86' WHERE id = '20bb804d-00ac-4eea-918f-b205058a0104';  -- #17 sort8412
UPDATE junior_grammar_questions SET kp_id = 'c3f6b9d4-5e80-4cab-9d23-7a2e0f159c86' WHERE id = 'bc753509-70cd-4eaa-b85a-01840ab54a00';  -- #18 sort9005
UPDATE junior_grammar_questions SET kp_id = 'c3f6b9d4-5e80-4cab-9d23-7a2e0f159c86' WHERE id = 'a9c0b71b-d0cd-451c-96c0-11fd5a6ad780';  -- #25 sort518
UPDATE junior_grammar_questions SET kp_id = 'c3f6b9d4-5e80-4cab-9d23-7a2e0f159c86' WHERE id = '2ceb7154-2d17-4f85-ba67-73c51107b930';  -- #29 sort522
UPDATE junior_grammar_questions SET kp_id = 'c3f6b9d4-5e80-4cab-9d23-7a2e0f159c86' WHERE id = '80930fba-8373-41a5-b8a2-bcb52d4fde5e';  -- #36 sort529
UPDATE junior_grammar_questions SET kp_id = 'c3f6b9d4-5e80-4cab-9d23-7a2e0f159c86' WHERE id = 'c3eb780b-3a9a-43fa-8e31-0d64924da458';  -- #38 sort531
UPDATE junior_grammar_questions SET kp_id = 'c3f6b9d4-5e80-4cab-9d23-7a2e0f159c86' WHERE id = 'e375770c-331a-4f14-8705-c14958b9fb0d';  -- #40 sort533
UPDATE junior_grammar_questions SET kp_id = 'c3f6b9d4-5e80-4cab-9d23-7a2e0f159c86' WHERE id = 'e9b12154-3178-4ac4-a153-10f5c93836a1';  -- #43 sort536
UPDATE junior_grammar_questions SET kp_id = 'c3f6b9d4-5e80-4cab-9d23-7a2e0f159c86' WHERE id = '53cd01fa-e32e-4c28-8d86-7c27aba52535';  -- #47 sort540
UPDATE junior_grammar_questions SET kp_id = 'c3f6b9d4-5e80-4cab-9d23-7a2e0f159c86' WHERE id = '5b7db00d-f03a-4c93-bdc6-d39cb01ab83c';  -- #49 sort542
UPDATE junior_grammar_questions SET kp_id = 'c3f6b9d4-5e80-4cab-9d23-7a2e0f159c86' WHERE id = 'ba6641d0-22f1-4282-864f-34cea1ed0b37';  -- #57 sort550

-- ② neg 否定 → b2e5a8c3-4d7f-4b9a-8c12-6f1d9e048b75
UPDATE junior_grammar_questions SET kp_id = 'b2e5a8c3-4d7f-4b9a-8c12-6f1d9e048b75' WHERE id = '426c1ed9-3666-4cc5-ae89-c0d3dc40989b';  -- #2 sort2
UPDATE junior_grammar_questions SET kp_id = 'b2e5a8c3-4d7f-4b9a-8c12-6f1d9e048b75' WHERE id = 'fef09216-a0dc-4e69-b6e3-7f9840ff8473';  -- #7 sort7
UPDATE junior_grammar_questions SET kp_id = 'b2e5a8c3-4d7f-4b9a-8c12-6f1d9e048b75' WHERE id = 'd983adc5-57fd-468e-b9ec-71f6486987f6';  -- #8 sort8
UPDATE junior_grammar_questions SET kp_id = 'b2e5a8c3-4d7f-4b9a-8c12-6f1d9e048b75' WHERE id = 'feac25c9-b587-4633-9909-366d5b99a8f9';  -- #12 sort12
UPDATE junior_grammar_questions SET kp_id = 'b2e5a8c3-4d7f-4b9a-8c12-6f1d9e048b75' WHERE id = 'd35598f0-46e9-4d88-9316-09bb2df72b29';  -- #15 sort15
UPDATE junior_grammar_questions SET kp_id = 'b2e5a8c3-4d7f-4b9a-8c12-6f1d9e048b75' WHERE id = '23536a25-03b9-4bb0-94cb-2c9f50b89b75';  -- #19 sort9101
UPDATE junior_grammar_questions SET kp_id = 'b2e5a8c3-4d7f-4b9a-8c12-6f1d9e048b75' WHERE id = 'a0e8c033-0fcf-4394-b62e-e5de0c51dcd6';  -- #20 sort9112
UPDATE junior_grammar_questions SET kp_id = 'b2e5a8c3-4d7f-4b9a-8c12-6f1d9e048b75' WHERE id = 'd61dc42f-9887-409e-8487-adcfaa357ffe';  -- #21 sort9122
UPDATE junior_grammar_questions SET kp_id = 'b2e5a8c3-4d7f-4b9a-8c12-6f1d9e048b75' WHERE id = '921fb67f-6c99-4e57-925d-7d08e408d162';  -- #24 sort517
UPDATE junior_grammar_questions SET kp_id = 'b2e5a8c3-4d7f-4b9a-8c12-6f1d9e048b75' WHERE id = '41ac01b3-fca9-4170-af0d-cb31b79ed197';  -- #27 sort520
UPDATE junior_grammar_questions SET kp_id = 'b2e5a8c3-4d7f-4b9a-8c12-6f1d9e048b75' WHERE id = '711fd605-90fc-449d-bf07-cc4b79543818';  -- #31 sort524
UPDATE junior_grammar_questions SET kp_id = 'b2e5a8c3-4d7f-4b9a-8c12-6f1d9e048b75' WHERE id = '728f2150-794a-402e-b682-22f78fd69b76';  -- #35 sort528
UPDATE junior_grammar_questions SET kp_id = 'b2e5a8c3-4d7f-4b9a-8c12-6f1d9e048b75' WHERE id = '367f8168-4dbe-43ea-bdfa-a7643a156164';  -- #37 sort530
UPDATE junior_grammar_questions SET kp_id = 'b2e5a8c3-4d7f-4b9a-8c12-6f1d9e048b75' WHERE id = 'f2ceef5e-4a3d-4541-8593-297e5fb3053a';  -- #39 sort532
UPDATE junior_grammar_questions SET kp_id = 'b2e5a8c3-4d7f-4b9a-8c12-6f1d9e048b75' WHERE id = 'f930abfa-9c96-4597-84e5-00c842312cfd';  -- #41 sort534
UPDATE junior_grammar_questions SET kp_id = 'b2e5a8c3-4d7f-4b9a-8c12-6f1d9e048b75' WHERE id = '94d42d26-77aa-4eda-9d7a-5e991043cf56';  -- #45 sort538
UPDATE junior_grammar_questions SET kp_id = 'b2e5a8c3-4d7f-4b9a-8c12-6f1d9e048b75' WHERE id = '77d124aa-bfd9-4e35-a974-1fb70b6300b0';  -- #48 sort541
UPDATE junior_grammar_questions SET kp_id = 'b2e5a8c3-4d7f-4b9a-8c12-6f1d9e048b75' WHERE id = '36fa45f8-7ee5-4486-8426-e0b50101abaf';  -- #52 sort545
UPDATE junior_grammar_questions SET kp_id = 'b2e5a8c3-4d7f-4b9a-8c12-6f1d9e048b75' WHERE id = '41f9fbca-6afd-4355-8ac8-e04ecdc77829';  -- #55 sort548

-- ③ 兜底 ability : 剩余 kp_id IS NULL 全部 → a1d4f7b2-3c6e-4a89-bf21-5e0c8d937a64 (删#22后应正好20道)
UPDATE junior_grammar_questions SET kp_id = 'a1d4f7b2-3c6e-4a89-bf21-5e0c8d937a64' WHERE point_id = '0d9a7c0c-1628-4f03-b3b0-f9037e02c46f' AND kp_id IS NULL;

-- 【第四段】补 6 道缺解析 (原7道缺,#22已删故补6); 只 SET explanation
UPDATE junior_grammar_questions SET explanation = '**Can + 主语 + 动词原形**构成疑问句;弹奏乐器要用 **play the guitar**(乐器前加 the)。' WHERE id = '52416137-922a-4c3f-8ec9-97d0e6355925';
UPDATE junior_grammar_questions SET explanation = '**Can + 主语 + 原形**疑问;说某种语言用 **speak**(speak Chinese),不用 say/tell/talk。' WHERE id = '20bb804d-00ac-4eea-918f-b205058a0104';
UPDATE junior_grammar_questions SET explanation = '**Can + 主语 + 动词原形**→**talk**(不加 s、不用 ing)。简答 Yes, it can。' WHERE id = 'bc753509-70cd-4eaa-b85a-01840ab54a00';
UPDATE junior_grammar_questions SET explanation = '询问许可"Can we…?"被拒绝→**No, you can''t**(不可以/不准)。can''t=cannot,后接动词原形。' WHERE id = '23536a25-03b9-4bb0-94cb-2c9f50b89b75';
UPDATE junior_grammar_questions SET explanation = '请求许可"May I…?"被拒绝,口语用 **can''t**(不行)。No, you can''t 表示不允许。' WHERE id = 'a0e8c033-0fcf-4394-b62e-e5de0c51dcd6';
UPDATE junior_grammar_questions SET explanation = '请求许可"Can I…?"被拒绝→**No, you can''t**(不可以)。can''t 表禁止/不许。' WHERE id = 'd61dc42f-9887-409e-8487-adcfaa357ffe';

-- 本文件语句数: 建kp 3 + DELETE 1 + 标kp 37(17q+19neg显式+1兜底,共标56行) + 解析 6(#22删除故6非7) = 47条

-- 【校验段】以下3条单独跑
SELECT count(*) AS n, kp_id FROM junior_grammar_questions WHERE point_id='0d9a7c0c-1628-4f03-b3b0-f9037e02c46f' GROUP BY kp_id; -- 应 ability20/neg19/q17
SELECT count(*) AS still_null FROM junior_grammar_questions WHERE point_id='0d9a7c0c-1628-4f03-b3b0-f9037e02c46f' AND kp_id IS NULL; -- 应 0
SELECT count(*) AS mcq_no_expl FROM junior_grammar_questions WHERE point_id='0d9a7c0c-1628-4f03-b3b0-f9037e02c46f' AND question_type='mcq' AND (explanation IS NULL OR explanation=''); -- 应 0

-- END OF FILE t11-all.sql
