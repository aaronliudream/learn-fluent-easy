-- ============================================================
-- t06 there be : 建4kp + 删2重复 + 标kp_id(58) + 补5解析
-- 整文件可一次跑(DELETE那段已注释包裹,可单独跑)
-- ============================================================

-- 【第一段】建 4 kp (WHERE NOT EXISTS by code 幂等)
INSERT INTO junior_knowledge_points (id, point_id, code, title, summary, sort_order, target_count)
SELECT 'e1f2a3b4-1c2d-4e3f-8a9b-0c1d2e3f4a5b', 'c1e17c07-04a0-4660-9f86-807b56eea168', 'g7-t06-sgpl', '单复数(There is单数/不可数 vs There are复数)', NULL, 1, 20
WHERE NOT EXISTS (SELECT 1 FROM junior_knowledge_points WHERE code = 'g7-t06-sgpl');

INSERT INTO junior_knowledge_points (id, point_id, code, title, summary, sort_order, target_count)
SELECT 'f2a3b4c5-2d3e-4f50-9b0c-1d2e3f4a5b6c', 'c1e17c07-04a0-4660-9f86-807b56eea168', 'g7-t06-prox', '就近原则(A and B就近决定is/are)', NULL, 2, 20
WHERE NOT EXISTS (SELECT 1 FROM junior_knowledge_points WHERE code = 'g7-t06-prox');

INSERT INTO junior_knowledge_points (id, point_id, code, title, summary, sort_order, target_count)
SELECT 'a3b4c5d6-3e4f-4051-ac1d-2e3f4a5b6c7d', 'c1e17c07-04a0-4660-9f86-807b56eea168', 'g7-t06-q', '疑问与简答(Is/Are there...?/Yes/No简答/提问)', NULL, 3, 20
WHERE NOT EXISTS (SELECT 1 FROM junior_knowledge_points WHERE code = 'g7-t06-q');

INSERT INTO junior_knowledge_points (id, point_id, code, title, summary, sort_order, target_count)
SELECT 'b4c5d6e7-4f50-4162-bd2e-3f4a5b6c7d8e', 'c1e17c07-04a0-4660-9f86-807b56eea168', 'g7-t06-neg', '否定(There isn''t/aren''t/no)', NULL, 4, 20
WHERE NOT EXISTS (SELECT 1 FROM junior_knowledge_points WHERE code = 'g7-t06-neg');

-- ↓↓↓ 【第二段】删 2 重复题 (sort289=#47重复, sort290=#48重复) —— 可单独跑 ↓↓↓
DELETE FROM junior_grammar_questions WHERE id = 'd887f840-90c7-40fe-b29d-574972348719';  -- sort289 (与保留的 sort194 题干答案一致)
DELETE FROM junior_grammar_questions WHERE id = 'f978c65b-6908-4ad4-a358-8925b03e15ca';  -- sort290 (与保留的 sort195 题干答案一致)
-- ↑↑↑ DELETE 结束 ↑↑↑

-- 【第三段】标 kp_id : 先显式 prox(13)/q(10)/neg(7), 再兜底 sgpl(28)
-- ① prox 就近原则 → f2a3b4c5-2d3e-4f50-9b0c-1d2e3f4a5b6c
UPDATE junior_grammar_questions SET kp_id = 'f2a3b4c5-2d3e-4f50-9b0c-1d2e3f4a5b6c' WHERE id = '0ffe89b8-36f3-4a31-b3bc-8b6494a020c5';  -- #4 sort4
UPDATE junior_grammar_questions SET kp_id = 'f2a3b4c5-2d3e-4f50-9b0c-1d2e3f4a5b6c' WHERE id = '118831a3-4b68-4736-8b33-6c3272025aa6';  -- #5 sort5
UPDATE junior_grammar_questions SET kp_id = 'f2a3b4c5-2d3e-4f50-9b0c-1d2e3f4a5b6c' WHERE id = '8cbb5286-fda5-495e-b6de-5158e7ce61a2';  -- #16 sort14
UPDATE junior_grammar_questions SET kp_id = 'f2a3b4c5-2d3e-4f50-9b0c-1d2e3f4a5b6c' WHERE id = '01fb3a94-5a01-4261-a8ba-d8cb3e138de2';  -- #17 sort15
UPDATE junior_grammar_questions SET kp_id = 'f2a3b4c5-2d3e-4f50-9b0c-1d2e3f4a5b6c' WHERE id = 'c36a08e1-6140-4f9b-8817-4283a87523ab';  -- #18 sort8200
UPDATE junior_grammar_questions SET kp_id = 'f2a3b4c5-2d3e-4f50-9b0c-1d2e3f4a5b6c' WHERE id = 'a1fc29f6-9f42-4169-b7c0-80cb0ebc7572';  -- #19 sort8210
UPDATE junior_grammar_questions SET kp_id = 'f2a3b4c5-2d3e-4f50-9b0c-1d2e3f4a5b6c' WHERE id = '2ece3380-fc62-4697-82a3-f11355c59412';  -- #20 sort8220
UPDATE junior_grammar_questions SET kp_id = 'f2a3b4c5-2d3e-4f50-9b0c-1d2e3f4a5b6c' WHERE id = '0ba01b76-d541-4d2a-8874-96892cf0b36f';  -- #21 sort8223
UPDATE junior_grammar_questions SET kp_id = 'f2a3b4c5-2d3e-4f50-9b0c-1d2e3f4a5b6c' WHERE id = '14e8bb97-2788-40a3-bc56-a6bef782cf36';  -- #23 sort171
UPDATE junior_grammar_questions SET kp_id = 'f2a3b4c5-2d3e-4f50-9b0c-1d2e3f4a5b6c' WHERE id = 'ca6c2aaa-849e-468f-81b2-6d52db929738';  -- #24 sort172
UPDATE junior_grammar_questions SET kp_id = 'f2a3b4c5-2d3e-4f50-9b0c-1d2e3f4a5b6c' WHERE id = 'b7efc64c-a058-4b37-a0a6-e256a91c3c35';  -- #28 sort269
UPDATE junior_grammar_questions SET kp_id = 'f2a3b4c5-2d3e-4f50-9b0c-1d2e3f4a5b6c' WHERE id = '17538ba6-58ff-4195-9300-304a199025b8';  -- #55 sort295
UPDATE junior_grammar_questions SET kp_id = 'f2a3b4c5-2d3e-4f50-9b0c-1d2e3f4a5b6c' WHERE id = '2ee5dd78-eab1-4b19-9ef8-cb4bcb3192ad';  -- #60 sort300

-- ② q 疑问与简答 → a3b4c5d6-3e4f-4051-ac1d-2e3f4a5b6c7d
UPDATE junior_grammar_questions SET kp_id = 'a3b4c5d6-3e4f-4051-ac1d-2e3f4a5b6c7d' WHERE id = 'de3a9d0b-57d9-4552-856d-ec2edb0d511b';  -- #9 sort8
UPDATE junior_grammar_questions SET kp_id = 'a3b4c5d6-3e4f-4051-ac1d-2e3f4a5b6c7d' WHERE id = 'fa97f86d-9fe4-4e16-8412-f6d8ce544739';  -- #11 sort9
UPDATE junior_grammar_questions SET kp_id = 'a3b4c5d6-3e4f-4051-ac1d-2e3f4a5b6c7d' WHERE id = '768bf139-f934-43ed-9141-3ee38b6d04bc';  -- #12 sort10
UPDATE junior_grammar_questions SET kp_id = 'a3b4c5d6-3e4f-4051-ac1d-2e3f4a5b6c7d' WHERE id = '11a6f975-efa8-4d14-82ec-db59e7405b5b';  -- #13 sort11
UPDATE junior_grammar_questions SET kp_id = 'a3b4c5d6-3e4f-4051-ac1d-2e3f4a5b6c7d' WHERE id = 'f85dabba-e5e6-426c-b324-1ba58e42ee6f';  -- #31 sort272
UPDATE junior_grammar_questions SET kp_id = 'a3b4c5d6-3e4f-4051-ac1d-2e3f4a5b6c7d' WHERE id = 'd1304b31-d9d6-49c7-aac9-8bb2ec4a4c2a';  -- #32 sort273
UPDATE junior_grammar_questions SET kp_id = 'a3b4c5d6-3e4f-4051-ac1d-2e3f4a5b6c7d' WHERE id = '940c2b81-989a-4b59-826a-d0e1c62b8b08';  -- #44 sort285
UPDATE junior_grammar_questions SET kp_id = 'a3b4c5d6-3e4f-4051-ac1d-2e3f4a5b6c7d' WHERE id = '3920c06c-99ff-4d4d-8ed2-23d1a456188a';  -- #45 sort286
UPDATE junior_grammar_questions SET kp_id = 'a3b4c5d6-3e4f-4051-ac1d-2e3f4a5b6c7d' WHERE id = '035b2cce-7a7a-465c-80b1-2b73b961b8a9';  -- #46 sort287
UPDATE junior_grammar_questions SET kp_id = 'a3b4c5d6-3e4f-4051-ac1d-2e3f4a5b6c7d' WHERE id = 'b4e5f0f7-796b-4f61-980d-7618edc41b6b';  -- #53 sort293

-- ③ neg 否定 → b4c5d6e7-4f50-4162-bd2e-3f4a5b6c7d8e
UPDATE junior_grammar_questions SET kp_id = 'b4c5d6e7-4f50-4162-bd2e-3f4a5b6c7d8e' WHERE id = '8f7c44de-1b42-484f-af52-a8fe1c17a08e';  -- #7 sort7
UPDATE junior_grammar_questions SET kp_id = 'b4c5d6e7-4f50-4162-bd2e-3f4a5b6c7d8e' WHERE id = '32e97cb6-d4de-4108-8402-c054a15a65a7';  -- #14 sort13
UPDATE junior_grammar_questions SET kp_id = 'b4c5d6e7-4f50-4162-bd2e-3f4a5b6c7d8e' WHERE id = '2c3f0df7-a35a-4ce6-b3ed-ac9cc427e6c8';  -- #33 sort274
UPDATE junior_grammar_questions SET kp_id = 'b4c5d6e7-4f50-4162-bd2e-3f4a5b6c7d8e' WHERE id = '3150f993-a326-4ab2-b27f-c1e79960deba';  -- #34 sort275
UPDATE junior_grammar_questions SET kp_id = 'b4c5d6e7-4f50-4162-bd2e-3f4a5b6c7d8e' WHERE id = '1f803fff-0f9d-4222-911f-d7d164feb094';  -- #42 sort283
UPDATE junior_grammar_questions SET kp_id = 'b4c5d6e7-4f50-4162-bd2e-3f4a5b6c7d8e' WHERE id = 'a83a6284-e83f-44be-8edf-8e28bf81ba9e';  -- #43 sort284
UPDATE junior_grammar_questions SET kp_id = 'b4c5d6e7-4f50-4162-bd2e-3f4a5b6c7d8e' WHERE id = '61a8ffdb-b7b3-4ff0-8dab-4f426650761d';  -- #54 sort294

-- ④ 兜底 sgpl : 剩余 kp_id IS NULL 全部 → e1f2a3b4-1c2d-4e3f-8a9b-0c1d2e3f4a5b (删2道后应正好28道)
UPDATE junior_grammar_questions SET kp_id = 'e1f2a3b4-1c2d-4e3f-8a9b-0c1d2e3f4a5b' WHERE point_id = 'c1e17c07-04a0-4660-9f86-807b56eea168' AND kp_id IS NULL;

-- 【第四段】补 5 道缺解析 (全mcq); 只 SET explanation
UPDATE junior_grammar_questions SET explanation = '就近原则:There be 后接并列名词时,**be 与最近的(第一个)名词一致**→a library(单数)用 **is**。' WHERE id = 'c36a08e1-6140-4f9b-8817-4283a87523ab';
UPDATE junior_grammar_questions SET explanation = '就近原则:看最近的名词 a teachers'' office(单数)→用 **is**(There is a... and three classrooms)。' WHERE id = 'a1fc29f6-9f42-4169-b7c0-80cb0ebc7572';
UPDATE junior_grammar_questions SET explanation = '就近原则:最近的 three computer rooms(复数)→用 **are**(There are... and a big library)。' WHERE id = '2ece3380-fc62-4697-82a3-f11355c59412';
UPDATE junior_grammar_questions SET explanation = '就近原则:最近的 a map(单数)→用 **is**(There is a map... and two pictures)。' WHERE id = '0ba01b76-d541-4d2a-8874-96892cf0b36f';
UPDATE junior_grammar_questions SET explanation = 'thirty students 是**复数**名词→There **are**。be 与后面名词的单复数一致。' WHERE id = 'cf5de747-1cc5-455b-a859-5f5c1998ef0d';

-- 本文件语句数: 建kp 4 + DELETE 2 + 标kp 31(13prox+10q+7neg显式+1兜底,共标58行) + 解析 5 = 42条

-- 【校验段】以下3条单独跑
SELECT count(*) AS n, kp_id FROM junior_grammar_questions WHERE point_id='c1e17c07-04a0-4660-9f86-807b56eea168' GROUP BY kp_id; -- 应 sgpl28/prox13/q10/neg7
SELECT count(*) AS still_null FROM junior_grammar_questions WHERE point_id='c1e17c07-04a0-4660-9f86-807b56eea168' AND kp_id IS NULL; -- 应 0
SELECT count(*) AS mcq_no_expl FROM junior_grammar_questions WHERE point_id='c1e17c07-04a0-4660-9f86-807b56eea168' AND question_type='mcq' AND (explanation IS NULL OR explanation=''); -- 应 0

-- END OF FILE t06-all.sql
