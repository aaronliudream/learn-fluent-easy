-- ============================================================
-- t10 基数/序数词 : 建2kp + 删1重复(#19) + 标kp_id(64)
-- 缺解析0,无解析段。整文件可一次跑(DELETE段已注释包裹)
-- ============================================================

-- 【第一段】建 2 kp (WHERE NOT EXISTS by code 幂等)
INSERT INTO junior_knowledge_points (id, point_id, code, title, summary, sort_order, target_count)
SELECT 'd1e2f3a4-b5c6-4d70-8e91-f2a3b4c5d6e7', 'e118e032-dcb7-44b8-b9ac-8ef64ad41835', 'g7-t10-ordinal', '序数词(变化规则first/fifth/eighth/ninth/twelfth/twentieth+日期/楼层/年级/排名)', NULL, 1, 20
WHERE NOT EXISTS (SELECT 1 FROM junior_knowledge_points WHERE code = 'g7-t10-ordinal');

INSERT INTO junior_knowledge_points (id, point_id, code, title, summary, sort_order, target_count)
SELECT 'd2f3a4b5-c6d7-4e81-9f02-a3b4c5d6e7f8', 'e118e032-dcb7-44b8-b9ac-8ef64ad41835', 'g7-t10-cardinal', '基数词(基本数字+计数+年龄)', NULL, 2, 20
WHERE NOT EXISTS (SELECT 1 FROM junior_knowledge_points WHERE code = 'g7-t10-cardinal');

-- ↓↓↓ 【第二段】删 1 重复题 (#19 sort8602 December twelfth, ≈#6 sort6) —— 可单独跑 ↓↓↓
DELETE FROM junior_grammar_questions WHERE id = 'ce897389-e769-43d5-a433-17d933fe582a';  -- #19 sort8602 (与保留的 #6 sort6 题干答案近似)
-- ↑↑↑ DELETE 结束 ↑↑↑

-- 【第三段】标 kp_id : 先显式 cardinal(17), 再兜底 ordinal(47)
-- ① cardinal 基数词 → d2f3a4b5-c6d7-4e81-9f02-a3b4c5d6e7f8
UPDATE junior_grammar_questions SET kp_id = 'd2f3a4b5-c6d7-4e81-9f02-a3b4c5d6e7f8' WHERE id = '9a41935c-4dfb-4ee7-b4ae-60030bed2359';  -- #1 sort1
UPDATE junior_grammar_questions SET kp_id = 'd2f3a4b5-c6d7-4e81-9f02-a3b4c5d6e7f8' WHERE id = '3a46934b-aebe-4816-8a06-637dd95cd7e9';  -- #4 sort4
UPDATE junior_grammar_questions SET kp_id = 'd2f3a4b5-c6d7-4e81-9f02-a3b4c5d6e7f8' WHERE id = 'd8bde387-deb2-442b-b048-7e8bfe5c2127';  -- #5 sort5
UPDATE junior_grammar_questions SET kp_id = 'd2f3a4b5-c6d7-4e81-9f02-a3b4c5d6e7f8' WHERE id = '2ea4c1d8-2415-4324-91bd-970e011bc596';  -- #9 sort9
UPDATE junior_grammar_questions SET kp_id = 'd2f3a4b5-c6d7-4e81-9f02-a3b4c5d6e7f8' WHERE id = '8817584a-ded5-437e-a152-25b7ae211643';  -- #11 sort11
UPDATE junior_grammar_questions SET kp_id = 'd2f3a4b5-c6d7-4e81-9f02-a3b4c5d6e7f8' WHERE id = '940f3c25-d423-430a-9f3b-f0a4e525ffd2';  -- #13 sort13
UPDATE junior_grammar_questions SET kp_id = 'd2f3a4b5-c6d7-4e81-9f02-a3b4c5d6e7f8' WHERE id = '1ba349e8-90b2-4894-a5e6-421a698c6f58';  -- #28 sort8643
UPDATE junior_grammar_questions SET kp_id = 'd2f3a4b5-c6d7-4e81-9f02-a3b4c5d6e7f8' WHERE id = '2dc99a9b-9702-464c-9a18-1f9b8a94958b';  -- #29 sort8649
UPDATE junior_grammar_questions SET kp_id = 'd2f3a4b5-c6d7-4e81-9f02-a3b4c5d6e7f8' WHERE id = 'bba91154-78be-40b2-89c7-a5c93426b88f';  -- #42 sort477
UPDATE junior_grammar_questions SET kp_id = 'd2f3a4b5-c6d7-4e81-9f02-a3b4c5d6e7f8' WHERE id = '6fd6b602-ccce-4a7a-881a-63d35066c144';  -- #43 sort478
UPDATE junior_grammar_questions SET kp_id = 'd2f3a4b5-c6d7-4e81-9f02-a3b4c5d6e7f8' WHERE id = 'd19cbfbd-d679-4f4c-af7f-3d63030c7834';  -- #50 sort485
UPDATE junior_grammar_questions SET kp_id = 'd2f3a4b5-c6d7-4e81-9f02-a3b4c5d6e7f8' WHERE id = 'abe05470-7f42-4333-aea7-225856c8934a';  -- #54 sort489
UPDATE junior_grammar_questions SET kp_id = 'd2f3a4b5-c6d7-4e81-9f02-a3b4c5d6e7f8' WHERE id = 'e0d35c82-5955-4e44-aca2-c08fa118142a';  -- #57 sort492
UPDATE junior_grammar_questions SET kp_id = 'd2f3a4b5-c6d7-4e81-9f02-a3b4c5d6e7f8' WHERE id = '9841ba9a-159e-4efa-89d6-48b40273c880';  -- #59 sort494
UPDATE junior_grammar_questions SET kp_id = 'd2f3a4b5-c6d7-4e81-9f02-a3b4c5d6e7f8' WHERE id = '2ae3927e-9a2d-4645-9f25-99793e832e78';  -- #60 sort495
UPDATE junior_grammar_questions SET kp_id = 'd2f3a4b5-c6d7-4e81-9f02-a3b4c5d6e7f8' WHERE id = '00d3e87b-2de0-4371-b795-5b198d467b8f';  -- #61 sort496
UPDATE junior_grammar_questions SET kp_id = 'd2f3a4b5-c6d7-4e81-9f02-a3b4c5d6e7f8' WHERE id = '550c8a7d-5ee1-4649-8b89-4e335a94bbc5';  -- #65 sort500

-- ② 兜底 ordinal 序数词 : 剩余 kp_id IS NULL 全部 → d1e2f3a4-b5c6-4d70-8e91-f2a3b4c5d6e7 (删#19后应正好47道)
UPDATE junior_grammar_questions SET kp_id = 'd1e2f3a4-b5c6-4d70-8e91-f2a3b4c5d6e7' WHERE point_id = 'e118e032-dcb7-44b8-b9ac-8ef64ad41835' AND kp_id IS NULL;

-- 本文件语句数: 建kp 2 + DELETE 1 + 标kp 18(17cardinal显式+1兜底,共标64行) = 21条 (缺解析0,无解析段)

-- 【校验段】以下2条单独跑
SELECT count(*) AS n, kp_id FROM junior_grammar_questions WHERE point_id='e118e032-dcb7-44b8-b9ac-8ef64ad41835' GROUP BY kp_id; -- 应 ordinal47/cardinal17
SELECT count(*) AS still_null FROM junior_grammar_questions WHERE point_id='e118e032-dcb7-44b8-b9ac-8ef64ad41835' AND kp_id IS NULL; -- 应 0

-- END OF FILE t10-all.sql
