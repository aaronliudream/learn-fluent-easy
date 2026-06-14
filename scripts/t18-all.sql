-- ============================================================
-- t18 连词 : 建4kp + 删6超纲 + 标kp_id(60) + 补13解析
-- 整文件可一次跑(DELETE段已注释包裹,可单独跑)
-- ============================================================

-- 【第一段】建 4 kp (WHERE NOT EXISTS by code 幂等)
INSERT INTO junior_knowledge_points (id, point_id, code, title, summary, sort_order, target_count)
SELECT 'c1a2b3c4-d5e6-4f70-8a91-b2c3d4e5f601', '039c7cd5-8aed-4fbc-9d9c-6ae9ab325c02', 'g7-t18-coord', '并列连词(and/but/or/so)', NULL, 1, 20
WHERE NOT EXISTS (SELECT 1 FROM junior_knowledge_points WHERE code = 'g7-t18-coord');

INSERT INTO junior_knowledge_points (id, point_id, code, title, summary, sort_order, target_count)
SELECT 'c2b3c4d5-e6f7-4081-9b02-c3d4e5f60712', '039c7cd5-8aed-4fbc-9d9c-6ae9ab325c02', 'g7-t18-because', '原因(because)', NULL, 2, 20
WHERE NOT EXISTS (SELECT 1 FROM junior_knowledge_points WHERE code = 'g7-t18-because');

INSERT INTO junior_knowledge_points (id, point_id, code, title, summary, sort_order, target_count)
SELECT 'c3c4d5e6-f708-4192-ac13-d4e5f6071823', '039c7cd5-8aed-4fbc-9d9c-6ae9ab325c02', 'g7-t18-when', '时间(when/after)', NULL, 3, 20
WHERE NOT EXISTS (SELECT 1 FROM junior_knowledge_points WHERE code = 'g7-t18-when');

INSERT INTO junior_knowledge_points (id, point_id, code, title, summary, sort_order, target_count)
SELECT 'c4d5e6f7-0819-42a3-bd24-e5f607182934', '039c7cd5-8aed-4fbc-9d9c-6ae9ab325c02', 'g7-t18-if', '条件(if)', NULL, 4, 20
WHERE NOT EXISTS (SELECT 1 FROM junior_knowledge_points WHERE code = 'g7-t18-if');

-- ↓↓↓ 【第二段】删 6 超纲题 (although/neither/so...that, 超出7A基础连词) —— 可单独跑 ↓↓↓
DELETE FROM junior_grammar_questions WHERE id = 'a632ad0b-b86c-4392-9b67-cc09a5264375';  -- #9 sort9 (mcq)
DELETE FROM junior_grammar_questions WHERE id = 'bd5af844-54bd-4f76-a9ee-1351c0a8545d';  -- #12 sort12 (mcq)
DELETE FROM junior_grammar_questions WHERE id = 'a8e7fc52-43cf-448b-a61b-d7c6cc3f5945';  -- #26 sort9608 (mcq)
DELETE FROM junior_grammar_questions WHERE id = 'efb071d1-00bf-4c68-ac92-2c2d6a8147e0';  -- #28 sort9628 (mcq)
DELETE FROM junior_grammar_questions WHERE id = 'ce8b380e-7390-4208-b8c6-bbb4edee053c';  -- #30 sort9648 (mcq)
DELETE FROM junior_grammar_questions WHERE id = '11602b62-073b-4e41-a2ed-bcfdbb04e6a7';  -- #64 sort898 (correction)
-- ↑↑↑ DELETE 结束 ↑↑↑

-- 【第三段】标 kp_id : 先显式 because(12)/when(8)/if(4), 再兜底 coord(36)
-- ① because 原因 → c2b3c4d5-e6f7-4081-9b02-c3d4e5f60712
UPDATE junior_grammar_questions SET kp_id = 'c2b3c4d5-e6f7-4081-9b02-c3d4e5f60712' WHERE id = '74c79ea5-6877-424e-aa3b-ad9111ba8bf4';  -- #7 sort7
UPDATE junior_grammar_questions SET kp_id = 'c2b3c4d5-e6f7-4081-9b02-c3d4e5f60712' WHERE id = '37e56e7c-07c2-45ee-a079-2ea2a1764e7b';  -- #15 sort15
UPDATE junior_grammar_questions SET kp_id = 'c2b3c4d5-e6f7-4081-9b02-c3d4e5f60712' WHERE id = 'f9a3ba2d-a68f-4fab-8f80-ff48ad59bfea';  -- #16 sort8310
UPDATE junior_grammar_questions SET kp_id = 'c2b3c4d5-e6f7-4081-9b02-c3d4e5f60712' WHERE id = '24d910b7-aaaf-49e7-a8d3-822bc8ec0391';  -- #20 sort9002
UPDATE junior_grammar_questions SET kp_id = 'c2b3c4d5-e6f7-4081-9b02-c3d4e5f60712' WHERE id = 'd64b1bf4-6c35-4528-ba05-4b8029cd84e7';  -- #22 sort9025
UPDATE junior_grammar_questions SET kp_id = 'c2b3c4d5-e6f7-4081-9b02-c3d4e5f60712' WHERE id = '82c90a45-8a48-435f-ae4d-bbc027824c41';  -- #23 sort9035
UPDATE junior_grammar_questions SET kp_id = 'c2b3c4d5-e6f7-4081-9b02-c3d4e5f60712' WHERE id = 'cead88a7-0457-4c61-8bc8-522e3a21fec9';  -- #36 sort870
UPDATE junior_grammar_questions SET kp_id = 'c2b3c4d5-e6f7-4081-9b02-c3d4e5f60712' WHERE id = '0980c61b-e6ac-4a6a-bc63-91c1e2ed5676';  -- #39 sort873
UPDATE junior_grammar_questions SET kp_id = 'c2b3c4d5-e6f7-4081-9b02-c3d4e5f60712' WHERE id = '432657bf-6feb-4c36-9fa5-81df8f0a62d7';  -- #49 sort883
UPDATE junior_grammar_questions SET kp_id = 'c2b3c4d5-e6f7-4081-9b02-c3d4e5f60712' WHERE id = '4717159f-b1b2-42bb-a2d8-0a4572a0bd26';  -- #50 sort884
UPDATE junior_grammar_questions SET kp_id = 'c2b3c4d5-e6f7-4081-9b02-c3d4e5f60712' WHERE id = '1f9b7bdc-5d3a-4dbd-882d-a14ed05d9ae7';  -- #56 sort890
UPDATE junior_grammar_questions SET kp_id = 'c2b3c4d5-e6f7-4081-9b02-c3d4e5f60712' WHERE id = '28b3e104-2bce-4a33-ac82-532b9bde5e8d';  -- #63 sort897

-- ② when 时间 → c3c4d5e6-f708-4192-ac13-d4e5f6071823
UPDATE junior_grammar_questions SET kp_id = 'c3c4d5e6-f708-4192-ac13-d4e5f6071823' WHERE id = '308762a6-0dd9-432c-8a7d-8de7456c8447';  -- #8 sort8
UPDATE junior_grammar_questions SET kp_id = 'c3c4d5e6-f708-4192-ac13-d4e5f6071823' WHERE id = '18588b97-9114-4210-a30d-90214755cd7d';  -- #11 sort11
UPDATE junior_grammar_questions SET kp_id = 'c3c4d5e6-f708-4192-ac13-d4e5f6071823' WHERE id = 'f35fbc0a-59ba-432a-8fcd-435879391555';  -- #13 sort13
UPDATE junior_grammar_questions SET kp_id = 'c3c4d5e6-f708-4192-ac13-d4e5f6071823' WHERE id = '53b92443-9809-4615-96e9-e9c0747ceb20';  -- #38 sort872
UPDATE junior_grammar_questions SET kp_id = 'c3c4d5e6-f708-4192-ac13-d4e5f6071823' WHERE id = 'bf62ffbe-803d-40e4-8f2a-c532c73dd5ed';  -- #44 sort878
UPDATE junior_grammar_questions SET kp_id = 'c3c4d5e6-f708-4192-ac13-d4e5f6071823' WHERE id = 'aadca212-2723-444a-a02b-6be890bfe02e';  -- #51 sort885
UPDATE junior_grammar_questions SET kp_id = 'c3c4d5e6-f708-4192-ac13-d4e5f6071823' WHERE id = 'f83f69f1-cdbd-414f-9795-4c11a19f8c41';  -- #58 sort892
UPDATE junior_grammar_questions SET kp_id = 'c3c4d5e6-f708-4192-ac13-d4e5f6071823' WHERE id = '883c7f76-80c1-43bf-aedb-f42a2de9ca8d';  -- #65 sort899

-- ③ if 条件 → c4d5e6f7-0819-42a3-bd24-e5f607182934
UPDATE junior_grammar_questions SET kp_id = 'c4d5e6f7-0819-42a3-bd24-e5f607182934' WHERE id = 'b39bc742-a447-4edd-b108-9bb51411c267';  -- #10 sort10
UPDATE junior_grammar_questions SET kp_id = 'c4d5e6f7-0819-42a3-bd24-e5f607182934' WHERE id = '5486f17d-2d7a-4045-8b0e-728e1fe72921';  -- #40 sort874
UPDATE junior_grammar_questions SET kp_id = 'c4d5e6f7-0819-42a3-bd24-e5f607182934' WHERE id = 'dfe602af-4f61-4bf3-8faf-f6526e57c530';  -- #45 sort879
UPDATE junior_grammar_questions SET kp_id = 'c4d5e6f7-0819-42a3-bd24-e5f607182934' WHERE id = 'b4692597-8275-430f-aa41-45e80f11f0f6';  -- #57 sort891

-- ④ 兜底 coord 并列 : 剩余 kp_id IS NULL 全部 → c1a2b3c4-d5e6-4f70-8a91-b2c3d4e5f601 (删6道后应正好36道)
UPDATE junior_grammar_questions SET kp_id = 'c1a2b3c4-d5e6-4f70-8a91-b2c3d4e5f601' WHERE point_id = '039c7cd5-8aed-4fbc-9d9c-6ae9ab325c02' AND kp_id IS NULL;

-- 【第四段】补 13 道缺解析 (原16缺,3道so...that已删故13); 只 SET explanation
UPDATE junior_grammar_questions SET explanation = '回答 Why...? 用 **Because**(因为)引导原因。Because + 原因。' WHERE id = 'f9a3ba2d-a68f-4fab-8f80-ff48ad59bfea';
UPDATE junior_grammar_questions SET explanation = 'Why 提问→用 **Because**(因为)引出原因(它们又可爱又懒)。' WHERE id = '24d910b7-aaaf-49e7-a8d3-822bc8ec0391';
UPDATE junior_grammar_questions SET explanation = 'Why 提问→用 **Because**(因为)说明原因。' WHERE id = 'd64b1bf4-6c35-4528-ba05-4b8029cd84e7';
UPDATE junior_grammar_questions SET explanation = 'Why...worried? →用 **Because**(因为)引出原因(猫丢了)。' WHERE id = '82c90a45-8a48-435f-ae4d-bbc027824c41';
UPDATE junior_grammar_questions SET explanation = '转折用 **but**(但是),前后意思相反(英语难↔每天坚持练)。' WHERE id = '6b179cb2-dabf-4a74-a25c-5d889feafdcd';
UPDATE junior_grammar_questions SET explanation = '祈使句承接用 **and**(Join us and show=加入并展示才艺)。' WHERE id = '534f1f07-06cb-4dc7-9fb0-5d726436d93a';
UPDATE junior_grammar_questions SET explanation = '转折用 **but**(不爱运动↔却爱编程社)。' WHERE id = 'f4972050-86bd-43ab-b554-d93c86d33b28';
UPDATE junior_grammar_questions SET explanation = '并列两件事用 **and**(熊吃鱼,猴吃果)。' WHERE id = '51b8c20c-edab-42a6-b94d-38fa64731a5b';
UPDATE junior_grammar_questions SET explanation = '选择/无论用 **or**:rain or shine=无论晴雨(风雨无阻)。' WHERE id = 'ee2c733a-0fb5-479c-8de0-eedf8cb69481';
UPDATE junior_grammar_questions SET explanation = '固定短语 **rain or shine**(风雨无阻)→第一个空填 **Rain**。' WHERE id = '2ff39739-68d4-4467-99fb-5b4a282bd1cf';
UPDATE junior_grammar_questions SET explanation = '因果结果用 **so**(下大雨→所以停赛)。so 表"所以"。' WHERE id = '6abf59bb-7174-4ca9-b741-0bbb0143d227';
UPDATE junior_grammar_questions SET explanation = '转折用 **but**(路很长↔但没人抱怨)。' WHERE id = 'd4c24104-d5c0-41a4-a351-5a05ba1247aa';
UPDATE junior_grammar_questions SET explanation = '转折用 **but**(到处找↔但没找到)。' WHERE id = 'e273a8a7-1536-467e-894d-dfb34f2f8ef8';

-- 本文件语句数: 建kp 4 + DELETE 6 + 标kp 25(12because+8when+4if显式+1兜底,共标60行) + 解析 13 = 48条

-- 【校验段】以下3条单独跑
SELECT count(*) AS n, kp_id FROM junior_grammar_questions WHERE point_id='039c7cd5-8aed-4fbc-9d9c-6ae9ab325c02' GROUP BY kp_id; -- 应 coord36/because12/when8/if4
SELECT count(*) AS still_null FROM junior_grammar_questions WHERE point_id='039c7cd5-8aed-4fbc-9d9c-6ae9ab325c02' AND kp_id IS NULL; -- 应 0
SELECT count(*) AS mcq_no_expl FROM junior_grammar_questions WHERE point_id='039c7cd5-8aed-4fbc-9d9c-6ae9ab325c02' AND question_type='mcq' AND (explanation IS NULL OR explanation=''); -- 应 0

-- END OF FILE t18-all.sql
