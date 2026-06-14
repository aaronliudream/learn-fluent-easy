-- ============================================================
-- t01 补标 kp_id : 建3新kp(irregular/uncountable/quantifier) + 56道全显式标
-- 只标 kp_id IS NULL 的,不动已标20道。
-- ============================================================

-- 【第一段】建 3 新 kp (现有 unit1-markers 不动)
INSERT INTO junior_knowledge_points (id, point_id, code, title, summary, sort_order, target_count)
SELECT 'a1b2c3d4-1e2f-4031-8a42-b3c4d5e6f701', 'd91fb261-b2e0-43e9-b8d2-4e5d0315447b', 'g7-t01-irregular', '不规则复数(sheep/children/men/feet/women/mice/teeth/people等)', NULL, 2, 20
WHERE NOT EXISTS (SELECT 1 FROM junior_knowledge_points WHERE code = 'g7-t01-irregular');

INSERT INTO junior_knowledge_points (id, point_id, code, title, summary, sort_order, target_count)
SELECT 'a2c3d4e5-2f30-4142-9b53-c4d5e6f70812', 'd91fb261-b2e0-43e9-b8d2-4e5d0315447b', 'g7-t01-uncountable', '不可数名词与名词作定语(water/bread不加s;paper bags/tooth problems作定语用单数)', NULL, 3, 20
WHERE NOT EXISTS (SELECT 1 FROM junior_knowledge_points WHERE code = 'g7-t01-uncountable');

INSERT INTO junior_knowledge_points (id, point_id, code, title, summary, sort_order, target_count)
SELECT 'a3d4e5f6-3041-4253-ac64-d5e6f7081923', 'd91fb261-b2e0-43e9-b8d2-4e5d0315447b', 'g7-t01-quantifier', '可数不可数限定词(many/much/few/little/fewer/less/a few)', NULL, 4, 20
WHERE NOT EXISTS (SELECT 1 FROM junior_knowledge_points WHERE code = 'g7-t01-quantifier');

-- 【第二段】56道全显式标 kp_id (WHERE id AND kp_id IS NULL 双保险)
-- unit1-markers 规则复数 (27道) → 200bed40-b08d-4b4f-adde-a4f864384dce
UPDATE junior_grammar_questions SET kp_id = '200bed40-b08d-4b4f-adde-a4f864384dce' WHERE id = '5a58ad85-d768-493a-9ae3-58235933b70c' AND kp_id IS NULL;  -- sort3
UPDATE junior_grammar_questions SET kp_id = '200bed40-b08d-4b4f-adde-a4f864384dce' WHERE id = '83963db4-6c01-4640-98c2-074e283cc4de' AND kp_id IS NULL;  -- sort4
UPDATE junior_grammar_questions SET kp_id = '200bed40-b08d-4b4f-adde-a4f864384dce' WHERE id = '581b05e9-de31-4a30-b93e-3f54fc37e8a9' AND kp_id IS NULL;  -- sort7
UPDATE junior_grammar_questions SET kp_id = '200bed40-b08d-4b4f-adde-a4f864384dce' WHERE id = 'a624791f-2215-401c-876b-3b79ee1727d5' AND kp_id IS NULL;  -- sort9
UPDATE junior_grammar_questions SET kp_id = '200bed40-b08d-4b4f-adde-a4f864384dce' WHERE id = 'e79855a0-b2c9-4e42-9c04-ca5bfeb062bb' AND kp_id IS NULL;  -- sort10
UPDATE junior_grammar_questions SET kp_id = '200bed40-b08d-4b4f-adde-a4f864384dce' WHERE id = 'a8034b8e-9ee9-4ffa-aef3-dca85ef6e316' AND kp_id IS NULL;  -- sort11
UPDATE junior_grammar_questions SET kp_id = '200bed40-b08d-4b4f-adde-a4f864384dce' WHERE id = '78539f02-2e5f-489b-b0e5-d60d0de65cfd' AND kp_id IS NULL;  -- sort16
UPDATE junior_grammar_questions SET kp_id = '200bed40-b08d-4b4f-adde-a4f864384dce' WHERE id = '2e90d0c7-c3da-410a-8312-1253bb710dd7' AND kp_id IS NULL;  -- sort17
UPDATE junior_grammar_questions SET kp_id = '200bed40-b08d-4b4f-adde-a4f864384dce' WHERE id = 'dbb5b046-f9c2-4f44-867e-fc388343030e' AND kp_id IS NULL;  -- sort18
UPDATE junior_grammar_questions SET kp_id = '200bed40-b08d-4b4f-adde-a4f864384dce' WHERE id = '70c5020d-2464-4256-90be-08d659c0f353' AND kp_id IS NULL;  -- sort24
UPDATE junior_grammar_questions SET kp_id = '200bed40-b08d-4b4f-adde-a4f864384dce' WHERE id = 'db2474c4-9643-4c33-ad7e-ac091675c3ef' AND kp_id IS NULL;  -- sort25
UPDATE junior_grammar_questions SET kp_id = '200bed40-b08d-4b4f-adde-a4f864384dce' WHERE id = '4adcba73-2a61-4433-898a-4622803d7e9e' AND kp_id IS NULL;  -- sort26
UPDATE junior_grammar_questions SET kp_id = '200bed40-b08d-4b4f-adde-a4f864384dce' WHERE id = 'ea0b3cf1-4ae6-471d-b854-968d4fa63f77' AND kp_id IS NULL;  -- sort28
UPDATE junior_grammar_questions SET kp_id = '200bed40-b08d-4b4f-adde-a4f864384dce' WHERE id = '4dbb7aff-011b-4dd0-8676-438a289385bd' AND kp_id IS NULL;  -- sort31
UPDATE junior_grammar_questions SET kp_id = '200bed40-b08d-4b4f-adde-a4f864384dce' WHERE id = '3c08ced8-f982-4c97-90a6-b1dc05410e21' AND kp_id IS NULL;  -- sort32
UPDATE junior_grammar_questions SET kp_id = '200bed40-b08d-4b4f-adde-a4f864384dce' WHERE id = '1d5d5407-7863-47cb-b8bc-275db9de249f' AND kp_id IS NULL;  -- sort33
UPDATE junior_grammar_questions SET kp_id = '200bed40-b08d-4b4f-adde-a4f864384dce' WHERE id = 'd56847f5-40c4-4cd2-8fc9-62e759d115bc' AND kp_id IS NULL;  -- sort35
UPDATE junior_grammar_questions SET kp_id = '200bed40-b08d-4b4f-adde-a4f864384dce' WHERE id = '62fdbe72-a773-4764-891a-7ee2141cf713' AND kp_id IS NULL;  -- sort36
UPDATE junior_grammar_questions SET kp_id = '200bed40-b08d-4b4f-adde-a4f864384dce' WHERE id = '8b665ec1-c3f1-4fe4-8a01-1d380558e026' AND kp_id IS NULL;  -- sort37
UPDATE junior_grammar_questions SET kp_id = '200bed40-b08d-4b4f-adde-a4f864384dce' WHERE id = 'a6f19901-7584-484f-adef-c433cd150b0f' AND kp_id IS NULL;  -- sort188
UPDATE junior_grammar_questions SET kp_id = '200bed40-b08d-4b4f-adde-a4f864384dce' WHERE id = '75a26d50-340e-4f08-8c40-ce0967c60783' AND kp_id IS NULL;  -- sort39
UPDATE junior_grammar_questions SET kp_id = '200bed40-b08d-4b4f-adde-a4f864384dce' WHERE id = '7f8e76b7-db0c-4e20-a02f-1f1cd9fd8dd0' AND kp_id IS NULL;  -- sort40
UPDATE junior_grammar_questions SET kp_id = '200bed40-b08d-4b4f-adde-a4f864384dce' WHERE id = '054a856b-9169-47ef-a0fe-bc6f0b183bc6' AND kp_id IS NULL;  -- sort42
UPDATE junior_grammar_questions SET kp_id = '200bed40-b08d-4b4f-adde-a4f864384dce' WHERE id = 'ebaad20f-dbc1-4c92-b4a0-e9ef848ede55' AND kp_id IS NULL;  -- sort43
UPDATE junior_grammar_questions SET kp_id = '200bed40-b08d-4b4f-adde-a4f864384dce' WHERE id = '7663b1fc-115f-4068-8d80-d8ba161a75c1' AND kp_id IS NULL;  -- sort44
UPDATE junior_grammar_questions SET kp_id = '200bed40-b08d-4b4f-adde-a4f864384dce' WHERE id = '1d1ab400-5e59-4719-90c8-cc817e82e559' AND kp_id IS NULL;  -- sort46
UPDATE junior_grammar_questions SET kp_id = '200bed40-b08d-4b4f-adde-a4f864384dce' WHERE id = '712e2bdc-50d4-42db-878e-916bba994b22' AND kp_id IS NULL;  -- sort48

-- irregular 不规则复数 (14道) → a1b2c3d4-1e2f-4031-8a42-b3c4d5e6f701
UPDATE junior_grammar_questions SET kp_id = 'a1b2c3d4-1e2f-4031-8a42-b3c4d5e6f701' WHERE id = '2677f065-b577-4fff-8512-9d27beea1698' AND kp_id IS NULL;  -- sort5
UPDATE junior_grammar_questions SET kp_id = 'a1b2c3d4-1e2f-4031-8a42-b3c4d5e6f701' WHERE id = 'd897c3fe-7eb7-46ab-bd22-496fdf68d49c' AND kp_id IS NULL;  -- sort6
UPDATE junior_grammar_questions SET kp_id = 'a1b2c3d4-1e2f-4031-8a42-b3c4d5e6f701' WHERE id = 'a7ec27a7-a993-4100-a825-975f0b3fa834' AND kp_id IS NULL;  -- sort8
UPDATE junior_grammar_questions SET kp_id = 'a1b2c3d4-1e2f-4031-8a42-b3c4d5e6f701' WHERE id = '8b603385-4b50-4287-b928-fa71c80bee8d' AND kp_id IS NULL;  -- sort19
UPDATE junior_grammar_questions SET kp_id = 'a1b2c3d4-1e2f-4031-8a42-b3c4d5e6f701' WHERE id = '80d8b920-fec4-408a-8757-544f276ab6dd' AND kp_id IS NULL;  -- sort20
UPDATE junior_grammar_questions SET kp_id = 'a1b2c3d4-1e2f-4031-8a42-b3c4d5e6f701' WHERE id = '79b854ae-476f-4867-a59d-953ca076871f' AND kp_id IS NULL;  -- sort21
UPDATE junior_grammar_questions SET kp_id = 'a1b2c3d4-1e2f-4031-8a42-b3c4d5e6f701' WHERE id = 'ec597777-4b1a-455e-b3a6-c5f9f800245e' AND kp_id IS NULL;  -- sort23
UPDATE junior_grammar_questions SET kp_id = 'a1b2c3d4-1e2f-4031-8a42-b3c4d5e6f701' WHERE id = '746f1d7b-2d20-414f-ad53-605016676ab9' AND kp_id IS NULL;  -- sort29
UPDATE junior_grammar_questions SET kp_id = 'a1b2c3d4-1e2f-4031-8a42-b3c4d5e6f701' WHERE id = '28fba012-f40a-4671-9a44-95cf6f326694' AND kp_id IS NULL;  -- sort34
UPDATE junior_grammar_questions SET kp_id = 'a1b2c3d4-1e2f-4031-8a42-b3c4d5e6f701' WHERE id = 'ca5aaea4-5b1e-4696-ab92-a92dbb16fd18' AND kp_id IS NULL;  -- sort38
UPDATE junior_grammar_questions SET kp_id = 'a1b2c3d4-1e2f-4031-8a42-b3c4d5e6f701' WHERE id = 'a19ef598-7590-4b74-a5a3-bed867d91ddb' AND kp_id IS NULL;  -- sort41
UPDATE junior_grammar_questions SET kp_id = 'a1b2c3d4-1e2f-4031-8a42-b3c4d5e6f701' WHERE id = 'ddffc289-76b4-4a92-97b0-59cc7e648221' AND kp_id IS NULL;  -- sort45
UPDATE junior_grammar_questions SET kp_id = 'a1b2c3d4-1e2f-4031-8a42-b3c4d5e6f701' WHERE id = '45b55855-e6ff-46c9-ace6-be81ce998d74' AND kp_id IS NULL;  -- sort47
UPDATE junior_grammar_questions SET kp_id = 'a1b2c3d4-1e2f-4031-8a42-b3c4d5e6f701' WHERE id = '486b6f73-34bf-4888-9147-02106e725c03' AND kp_id IS NULL;  -- sort50

-- uncountable 不可数名词与名词作定语 (6道) → a2c3d4e5-2f30-4142-9b53-c4d5e6f70812
UPDATE junior_grammar_questions SET kp_id = 'a2c3d4e5-2f30-4142-9b53-c4d5e6f70812' WHERE id = 'defbcf5f-9feb-44ef-be29-ab3899187660' AND kp_id IS NULL;  -- sort12
UPDATE junior_grammar_questions SET kp_id = 'a2c3d4e5-2f30-4142-9b53-c4d5e6f70812' WHERE id = 'efda4a4e-d00c-459a-b307-813a20076010' AND kp_id IS NULL;  -- sort13
UPDATE junior_grammar_questions SET kp_id = 'a2c3d4e5-2f30-4142-9b53-c4d5e6f70812' WHERE id = '5e331ffd-5272-47b1-bcd9-56ad7bf46d9d' AND kp_id IS NULL;  -- sort49
UPDATE junior_grammar_questions SET kp_id = 'a2c3d4e5-2f30-4142-9b53-c4d5e6f70812' WHERE id = '8435d887-0104-46df-928e-494357bd9207' AND kp_id IS NULL;  -- sort8413
UPDATE junior_grammar_questions SET kp_id = 'a2c3d4e5-2f30-4142-9b53-c4d5e6f70812' WHERE id = 'bb6af2c6-baac-4a73-95aa-b48c8dd6d7ba' AND kp_id IS NULL;  -- sort22
UPDATE junior_grammar_questions SET kp_id = 'a2c3d4e5-2f30-4142-9b53-c4d5e6f70812' WHERE id = '261f9654-030f-4d96-8a87-6c0a495eec0e' AND kp_id IS NULL;  -- sort27

-- quantifier 可数不可数限定词 (9道) → a3d4e5f6-3041-4253-ac64-d5e6f7081923
UPDATE junior_grammar_questions SET kp_id = 'a3d4e5f6-3041-4253-ac64-d5e6f7081923' WHERE id = 'c1a059c6-d4c1-4408-b257-c5d9162755ad' AND kp_id IS NULL;  -- sort8402
UPDATE junior_grammar_questions SET kp_id = 'a3d4e5f6-3041-4253-ac64-d5e6f7081923' WHERE id = 'b3a54bfa-c3c2-4d30-a0da-de7a4fde1d6f' AND kp_id IS NULL;  -- sort9100
UPDATE junior_grammar_questions SET kp_id = 'a3d4e5f6-3041-4253-ac64-d5e6f7081923' WHERE id = 'ae703843-6ada-4623-bac9-a5f9866925b0' AND kp_id IS NULL;  -- sort9111
UPDATE junior_grammar_questions SET kp_id = 'a3d4e5f6-3041-4253-ac64-d5e6f7081923' WHERE id = 'bbcd5fb8-3f14-4a1a-a052-a2d6aaf8237a' AND kp_id IS NULL;  -- sort9121
UPDATE junior_grammar_questions SET kp_id = 'a3d4e5f6-3041-4253-ac64-d5e6f7081923' WHERE id = '9bb5cd78-fb31-4c3e-851b-988685ec861e' AND kp_id IS NULL;  -- sort9309
UPDATE junior_grammar_questions SET kp_id = 'a3d4e5f6-3041-4253-ac64-d5e6f7081923' WHERE id = '22c3b335-231f-46d7-8308-4de3fa28461d' AND kp_id IS NULL;  -- sort9322
UPDATE junior_grammar_questions SET kp_id = 'a3d4e5f6-3041-4253-ac64-d5e6f7081923' WHERE id = '3493a3bf-a31c-4555-b818-cd78c89a5b9b' AND kp_id IS NULL;  -- sort9329
UPDATE junior_grammar_questions SET kp_id = 'a3d4e5f6-3041-4253-ac64-d5e6f7081923' WHERE id = '27bb90cd-07c8-42de-af7d-e744ff90d704' AND kp_id IS NULL;  -- sort9342
UPDATE junior_grammar_questions SET kp_id = 'a3d4e5f6-3041-4253-ac64-d5e6f7081923' WHERE id = '6038c5d8-c3fa-4fbd-8f86-01b7d8a98470' AND kp_id IS NULL;  -- sort9349

-- 本文件语句数: 建kp 3 + 标kp 56 = 59条

-- 【校验段】以下2条单独跑
SELECT count(*) AS n, kp_id FROM junior_grammar_questions WHERE point_id='d91fb261-b2e0-43e9-b8d2-4e5d0315447b' GROUP BY kp_id; -- 4 kp 合计76 (unit1-markers47/irregular14/uncountable6/quantifier9)
SELECT count(*) AS still_null FROM junior_grammar_questions WHERE point_id='d91fb261-b2e0-43e9-b8d2-4e5d0315447b' AND kp_id IS NULL; -- 应 0

-- END OF FILE t01-tag.sql
