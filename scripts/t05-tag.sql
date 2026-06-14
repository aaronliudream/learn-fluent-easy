-- ============================================================
-- t05 标 kp_id : 先标 q/neg/aff(39道,按id), 再兜底 3sg(剩余32)
-- ⚠️ 先跑 t05-kp.sql 建好4kp, 再跑本文件
-- ============================================================

-- ① q 疑问与简答 (18道 → 2d7eaa58)
UPDATE junior_grammar_questions SET kp_id = '2d7eaa58-c0ef-4d3b-91a0-56ca9698e4f2' WHERE id = 'fb366d34-cd90-4dc7-aef6-f9cbf91cb6b3';  -- #5 sort3
UPDATE junior_grammar_questions SET kp_id = '2d7eaa58-c0ef-4d3b-91a0-56ca9698e4f2' WHERE id = '1ed3b99d-e5e2-4249-b08d-825febea7f5e';  -- #14 sort7
UPDATE junior_grammar_questions SET kp_id = '2d7eaa58-c0ef-4d3b-91a0-56ca9698e4f2' WHERE id = '2200f05e-20ce-4c1c-96ce-df5cda5d6e10';  -- #16 sort8
UPDATE junior_grammar_questions SET kp_id = '2d7eaa58-c0ef-4d3b-91a0-56ca9698e4f2' WHERE id = '87a4e686-b5b9-43c8-8309-145499a7ad2c';  -- #17 sort9
UPDATE junior_grammar_questions SET kp_id = '2d7eaa58-c0ef-4d3b-91a0-56ca9698e4f2' WHERE id = '44954b6e-ec74-40a8-bb92-73b4e857d103';  -- #20 sort12
UPDATE junior_grammar_questions SET kp_id = '2d7eaa58-c0ef-4d3b-91a0-56ca9698e4f2' WHERE id = 'bc0c8e54-1c83-43a1-a44b-1de95d1cc1fb';  -- #21 sort13
UPDATE junior_grammar_questions SET kp_id = '2d7eaa58-c0ef-4d3b-91a0-56ca9698e4f2' WHERE id = '9b88885a-8772-4fb9-97b3-ceaad57984b9';  -- #27 sort8105
UPDATE junior_grammar_questions SET kp_id = '2d7eaa58-c0ef-4d3b-91a0-56ca9698e4f2' WHERE id = '4c8d7b1d-8e64-4c34-a8cb-453c6192e508';  -- #29 sort8324
UPDATE junior_grammar_questions SET kp_id = '2d7eaa58-c0ef-4d3b-91a0-56ca9698e4f2' WHERE id = '80862dbc-b0b2-46d9-afeb-15726e98afde';  -- #45 sort224
UPDATE junior_grammar_questions SET kp_id = '2d7eaa58-c0ef-4d3b-91a0-56ca9698e4f2' WHERE id = '1c3cfe0b-f7e7-4b9d-a20d-e5ab154700fd';  -- #46 sort225
UPDATE junior_grammar_questions SET kp_id = '2d7eaa58-c0ef-4d3b-91a0-56ca9698e4f2' WHERE id = 'c3fac86c-9038-429f-97b3-37218a320bd4';  -- #50 sort229
UPDATE junior_grammar_questions SET kp_id = '2d7eaa58-c0ef-4d3b-91a0-56ca9698e4f2' WHERE id = '8823d566-7207-49f1-bcfc-a3c3a5c466c0';  -- #54 sort233
UPDATE junior_grammar_questions SET kp_id = '2d7eaa58-c0ef-4d3b-91a0-56ca9698e4f2' WHERE id = 'f3d78e15-1139-4778-b9f1-ba3f7e86409e';  -- #55 sort234
UPDATE junior_grammar_questions SET kp_id = '2d7eaa58-c0ef-4d3b-91a0-56ca9698e4f2' WHERE id = '4dc9e9bc-78ee-4596-b4a6-4751d06ca174';  -- #57 sort236
UPDATE junior_grammar_questions SET kp_id = '2d7eaa58-c0ef-4d3b-91a0-56ca9698e4f2' WHERE id = '7a67e56b-b874-454e-b695-411ad65645ba';  -- #58 sort237
UPDATE junior_grammar_questions SET kp_id = '2d7eaa58-c0ef-4d3b-91a0-56ca9698e4f2' WHERE id = '8e76ea21-94bf-4a0b-8a0a-a237acbb334d';  -- #59 sort238
UPDATE junior_grammar_questions SET kp_id = '2d7eaa58-c0ef-4d3b-91a0-56ca9698e4f2' WHERE id = '74b2d226-fe0d-40c4-96e0-41293fcd7f71';  -- #63 sort242
UPDATE junior_grammar_questions SET kp_id = '2d7eaa58-c0ef-4d3b-91a0-56ca9698e4f2' WHERE id = 'ada4735e-001e-4ddc-a718-7c01111337b5';  -- #69 sort248

-- ② neg 否定 (13道 → f44bded1)
UPDATE junior_grammar_questions SET kp_id = 'f44bded1-08db-4c95-92ac-0526026451e9' WHERE id = 'd18f966e-c524-4ac9-afc8-a17e07e17158';  -- #10 sort5
UPDATE junior_grammar_questions SET kp_id = 'f44bded1-08db-4c95-92ac-0526026451e9' WHERE id = '8f45e2c2-c88f-42a4-837f-1c53189c4bf1';  -- #18 sort10
UPDATE junior_grammar_questions SET kp_id = 'f44bded1-08db-4c95-92ac-0526026451e9' WHERE id = '20df6779-bd96-4888-a95e-da50bd7ea1ff';  -- #19 sort11
UPDATE junior_grammar_questions SET kp_id = 'f44bded1-08db-4c95-92ac-0526026451e9' WHERE id = 'b6747928-e807-4f9a-9d9e-efab69f280a3';  -- #31 sort8503
UPDATE junior_grammar_questions SET kp_id = 'f44bded1-08db-4c95-92ac-0526026451e9' WHERE id = '8fc72877-07ff-4469-bc44-dcf3dab76f95';  -- #32 sort8512
UPDATE junior_grammar_questions SET kp_id = 'f44bded1-08db-4c95-92ac-0526026451e9' WHERE id = '01eb8919-0d69-4b74-bbd5-c49813b7401f';  -- #35 sort8532
UPDATE junior_grammar_questions SET kp_id = 'f44bded1-08db-4c95-92ac-0526026451e9' WHERE id = '41296c93-7149-4419-8552-ebb35993c65b';  -- #47 sort226
UPDATE junior_grammar_questions SET kp_id = 'f44bded1-08db-4c95-92ac-0526026451e9' WHERE id = '8cf9ca1f-3916-41a2-bd8b-09283f646f4c';  -- #48 sort227
UPDATE junior_grammar_questions SET kp_id = 'f44bded1-08db-4c95-92ac-0526026451e9' WHERE id = '1ac282c5-b33f-49c9-b053-a71ed013e023';  -- #52 sort231
UPDATE junior_grammar_questions SET kp_id = 'f44bded1-08db-4c95-92ac-0526026451e9' WHERE id = 'd31cd4a0-ac43-4de8-8139-e020e4cd72c8';  -- #53 sort232
UPDATE junior_grammar_questions SET kp_id = 'f44bded1-08db-4c95-92ac-0526026451e9' WHERE id = 'd0b56c91-ed16-47da-b320-9d9ebb3f5ecb';  -- #62 sort241
UPDATE junior_grammar_questions SET kp_id = 'f44bded1-08db-4c95-92ac-0526026451e9' WHERE id = '7cb2206c-5ad6-4434-98cd-9661deefaa83';  -- #65 sort244
UPDATE junior_grammar_questions SET kp_id = 'f44bded1-08db-4c95-92ac-0526026451e9' WHERE id = '300a045e-19b6-4e7b-8021-994bb549c951';  -- #68 sort247

-- ③ aff 肯定陈述 (8道 → 92850b5c)
UPDATE junior_grammar_questions SET kp_id = '92850b5c-07a8-4d9a-a59e-9a86490cede1' WHERE id = '92ad9721-5c20-4eec-a0bc-891c1a8d2e67';  -- #1 sort1
UPDATE junior_grammar_questions SET kp_id = '92850b5c-07a8-4d9a-a59e-9a86490cede1' WHERE id = '4f773c33-5225-4ead-9c86-db9f30a25f6d';  -- #8 sort4
UPDATE junior_grammar_questions SET kp_id = '92850b5c-07a8-4d9a-a59e-9a86490cede1' WHERE id = '7482ceb8-8531-4c13-ac63-89ee19fe6050';  -- #13 sort7
UPDATE junior_grammar_questions SET kp_id = '92850b5c-07a8-4d9a-a59e-9a86490cede1' WHERE id = 'de916feb-671e-4c88-aadb-d1bcf9746c81';  -- #25 sort8012
UPDATE junior_grammar_questions SET kp_id = '92850b5c-07a8-4d9a-a59e-9a86490cede1' WHERE id = 'aa639e59-dcc2-4a43-849e-6d384356807a';  -- #34 sort8522
UPDATE junior_grammar_questions SET kp_id = '92850b5c-07a8-4d9a-a59e-9a86490cede1' WHERE id = '5196afca-3214-4fe5-b0c1-345fdfab086b';  -- #37 sort216
UPDATE junior_grammar_questions SET kp_id = '92850b5c-07a8-4d9a-a59e-9a86490cede1' WHERE id = '69386569-ac4a-46cf-b350-0fe28fba815d';  -- #44 sort223
UPDATE junior_grammar_questions SET kp_id = '92850b5c-07a8-4d9a-a59e-9a86490cede1' WHERE id = '99624ea9-2c81-4f86-a1b5-89ca25d7f7fe';  -- #60 sort239

-- ④ 兜底 3sg : 剩余 kp_id IS NULL 的全部 → ef2879a5 (应正好32道)
UPDATE junior_grammar_questions SET kp_id = 'ef2879a5-a18b-496d-97de-6a0adfc2f48a' WHERE point_id = 'b9cd9a42-3f90-4722-ad55-810e23abfb87' AND kp_id IS NULL;

-- ⑤ 校验(单独跑): 应 3sg32/q18/neg13/aff8, 无NULL, 合计71
SELECT k.code, count(q.id) AS n FROM junior_knowledge_points k LEFT JOIN junior_grammar_questions q ON q.kp_id=k.id WHERE k.code LIKE 'g7-t05-%' GROUP BY k.code ORDER BY k.code;
SELECT count(*) AS still_null FROM junior_grammar_questions WHERE point_id='b9cd9a42-3f90-4722-ad55-810e23abfb87' AND kp_id IS NULL; -- 应 0
