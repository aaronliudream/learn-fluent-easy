-- ============================================================
-- t02 补标 kp_id : 建3新kp(obj/nposs/aposs) + 98道全显式标(不兜底)
-- 只标 kp_id IS NULL 的98道,不动已标60道
-- ============================================================

-- 【第一段】建 3 新 kp (现有 subj/poss/distinguish 不动)
INSERT INTO junior_knowledge_points (id, point_id, code, title, summary, sort_order, target_count)
SELECT 'e2a1b3c4-d5e6-4f70-9a81-b2c3d4e5f6a1', '6a185802-70df-4c91-a744-33c7b6f33789', 'g7-t02-obj', '宾格代词(me/him/her/us/them,动词或介词后)', NULL, 4, 20
WHERE NOT EXISTS (SELECT 1 FROM junior_knowledge_points WHERE code = 'g7-t02-obj');

INSERT INTO junior_knowledge_points (id, point_id, code, title, summary, sort_order, target_count)
SELECT 'e3b2c4d5-e6f7-4081-9b92-c3d4e5f6a1b2', '6a185802-70df-4c91-a744-33c7b6f33789', 'g7-t02-nposs', '名词性物主代词(mine/yours/his/hers/ours/theirs,单独用)', NULL, 5, 20
WHERE NOT EXISTS (SELECT 1 FROM junior_knowledge_points WHERE code = 'g7-t02-nposs');

INSERT INTO junior_knowledge_points (id, point_id, code, title, summary, sort_order, target_count)
SELECT 'e4c3d5e6-f708-4192-9ca3-d4e5f6a1b2c3', '6a185802-70df-4c91-a744-33c7b6f33789', 'g7-t02-aposs', '名词所有格''s(单数+''s/复数s结尾加''/并列共有最后+''s)', NULL, 6, 20
WHERE NOT EXISTS (SELECT 1 FROM junior_knowledge_points WHERE code = 'g7-t02-aposs');

-- 【第二段】98道全显式标 kp_id (WHERE id AND kp_id IS NULL 双保险,不动已标)
-- subj 主格 (22道) → eb075cd2-5f3f-41f2-9b0b-e7c065a6d5d5
UPDATE junior_grammar_questions SET kp_id = 'eb075cd2-5f3f-41f2-9b0b-e7c065a6d5d5' WHERE id = 'ebb0c124-8676-4688-b869-cff9da165b2c' AND kp_id IS NULL;  -- sort8113
UPDATE junior_grammar_questions SET kp_id = 'eb075cd2-5f3f-41f2-9b0b-e7c065a6d5d5' WHERE id = '224eac67-97cd-4691-bfc8-9248b0ace639' AND kp_id IS NULL;  -- sort8501
UPDATE junior_grammar_questions SET kp_id = 'eb075cd2-5f3f-41f2-9b0b-e7c065a6d5d5' WHERE id = '5e8269f8-81c0-46a6-9c78-a281ce68e39b' AND kp_id IS NULL;  -- sort8502
UPDATE junior_grammar_questions SET kp_id = 'eb075cd2-5f3f-41f2-9b0b-e7c065a6d5d5' WHERE id = '4cbd7440-e227-461c-a2e9-68e3f6219ea0' AND kp_id IS NULL;  -- sort8503
UPDATE junior_grammar_questions SET kp_id = 'eb075cd2-5f3f-41f2-9b0b-e7c065a6d5d5' WHERE id = '0916dbe1-757c-4403-8261-adc6aff720e3' AND kp_id IS NULL;  -- sort8504
UPDATE junior_grammar_questions SET kp_id = 'eb075cd2-5f3f-41f2-9b0b-e7c065a6d5d5' WHERE id = '2b974a29-4356-4ae9-af9e-bd62a54eebd1' AND kp_id IS NULL;  -- sort8505
UPDATE junior_grammar_questions SET kp_id = 'eb075cd2-5f3f-41f2-9b0b-e7c065a6d5d5' WHERE id = '111cd754-e7d8-4903-9f10-71a3685094ac' AND kp_id IS NULL;  -- sort8506
UPDATE junior_grammar_questions SET kp_id = 'eb075cd2-5f3f-41f2-9b0b-e7c065a6d5d5' WHERE id = 'c8428a8d-df5e-4b23-8d6a-c0c5f1a83f08' AND kp_id IS NULL;  -- sort8507
UPDATE junior_grammar_questions SET kp_id = 'eb075cd2-5f3f-41f2-9b0b-e7c065a6d5d5' WHERE id = '04dc0084-d110-4450-b357-dc6cd2494ef2' AND kp_id IS NULL;  -- sort8508
UPDATE junior_grammar_questions SET kp_id = 'eb075cd2-5f3f-41f2-9b0b-e7c065a6d5d5' WHERE id = 'ad08cdcc-a1be-4613-abff-04ff6665ad35' AND kp_id IS NULL;  -- sort8509
UPDATE junior_grammar_questions SET kp_id = 'eb075cd2-5f3f-41f2-9b0b-e7c065a6d5d5' WHERE id = '85349015-0e7d-479a-9362-7ce092e02b64' AND kp_id IS NULL;  -- sort8510
UPDATE junior_grammar_questions SET kp_id = 'eb075cd2-5f3f-41f2-9b0b-e7c065a6d5d5' WHERE id = '210e258c-bedf-457d-acb0-099baa7cc9f4' AND kp_id IS NULL;  -- sort8511
UPDATE junior_grammar_questions SET kp_id = 'eb075cd2-5f3f-41f2-9b0b-e7c065a6d5d5' WHERE id = '3498ba81-9408-42f3-82bd-d2fb3c5dfd18' AND kp_id IS NULL;  -- sort8512
UPDATE junior_grammar_questions SET kp_id = 'eb075cd2-5f3f-41f2-9b0b-e7c065a6d5d5' WHERE id = '12223f56-eb88-4c93-9d98-9e9e38dbb434' AND kp_id IS NULL;  -- sort8513
UPDATE junior_grammar_questions SET kp_id = 'eb075cd2-5f3f-41f2-9b0b-e7c065a6d5d5' WHERE id = 'b67915ff-cdb0-461a-b06a-04fb6c49fa6c' AND kp_id IS NULL;  -- sort8514
UPDATE junior_grammar_questions SET kp_id = 'eb075cd2-5f3f-41f2-9b0b-e7c065a6d5d5' WHERE id = '3ab2dcac-f454-4435-8875-ef34a6a2c3c6' AND kp_id IS NULL;  -- sort8515
UPDATE junior_grammar_questions SET kp_id = 'eb075cd2-5f3f-41f2-9b0b-e7c065a6d5d5' WHERE id = '0fd99d44-63b6-42d0-bd11-1ef4b8bc31ed' AND kp_id IS NULL;  -- sort66
UPDATE junior_grammar_questions SET kp_id = 'eb075cd2-5f3f-41f2-9b0b-e7c065a6d5d5' WHERE id = '645e8646-e58f-42e5-af24-56d5e6f15356' AND kp_id IS NULL;  -- sort67
UPDATE junior_grammar_questions SET kp_id = 'eb075cd2-5f3f-41f2-9b0b-e7c065a6d5d5' WHERE id = '8a4c37d5-dcf4-424b-8e0c-d0b0b25b6bda' AND kp_id IS NULL;  -- sort68
UPDATE junior_grammar_questions SET kp_id = 'eb075cd2-5f3f-41f2-9b0b-e7c065a6d5d5' WHERE id = 'fd2ff63e-1d2a-4ad0-8567-498395a099c5' AND kp_id IS NULL;  -- sort69
UPDATE junior_grammar_questions SET kp_id = 'eb075cd2-5f3f-41f2-9b0b-e7c065a6d5d5' WHERE id = '72af80e7-de07-4e46-a3e8-9b8328a4d544' AND kp_id IS NULL;  -- sort80
UPDATE junior_grammar_questions SET kp_id = 'eb075cd2-5f3f-41f2-9b0b-e7c065a6d5d5' WHERE id = 'e73aaa87-47fc-4706-91fe-648803c18837' AND kp_id IS NULL;  -- sort96

-- poss 形容词性物主 (23道) → 25c6dd32-2584-44a6-96b6-aca343578575
UPDATE junior_grammar_questions SET kp_id = '25c6dd32-2584-44a6-96b6-aca343578575' WHERE id = '0ff29817-d9d4-4264-aaef-e3b94fc347bb' AND kp_id IS NULL;  -- sort8516
UPDATE junior_grammar_questions SET kp_id = '25c6dd32-2584-44a6-96b6-aca343578575' WHERE id = '2737c187-da4c-41f5-b455-6f6364d716f9' AND kp_id IS NULL;  -- sort8517
UPDATE junior_grammar_questions SET kp_id = '25c6dd32-2584-44a6-96b6-aca343578575' WHERE id = '1de20398-4474-4cec-af3f-be877bba0e00' AND kp_id IS NULL;  -- sort8518
UPDATE junior_grammar_questions SET kp_id = '25c6dd32-2584-44a6-96b6-aca343578575' WHERE id = 'ae28c03a-bd64-45e0-852c-a97ca3017547' AND kp_id IS NULL;  -- sort8519
UPDATE junior_grammar_questions SET kp_id = '25c6dd32-2584-44a6-96b6-aca343578575' WHERE id = '1c15d4be-fe4f-437f-bd8e-0afb5e1cc2e7' AND kp_id IS NULL;  -- sort8520
UPDATE junior_grammar_questions SET kp_id = '25c6dd32-2584-44a6-96b6-aca343578575' WHERE id = '29813944-22f2-4b18-9509-004e1a0b8d3b' AND kp_id IS NULL;  -- sort8521
UPDATE junior_grammar_questions SET kp_id = '25c6dd32-2584-44a6-96b6-aca343578575' WHERE id = '9bacbb4c-d641-4bbf-bf58-357a3ecd476c' AND kp_id IS NULL;  -- sort8522
UPDATE junior_grammar_questions SET kp_id = '25c6dd32-2584-44a6-96b6-aca343578575' WHERE id = 'f9197e64-41cf-46dc-9578-c0f40edcf90d' AND kp_id IS NULL;  -- sort8523
UPDATE junior_grammar_questions SET kp_id = '25c6dd32-2584-44a6-96b6-aca343578575' WHERE id = '7cfc8737-1cd8-4ad0-b1c9-f0e51cd11593' AND kp_id IS NULL;  -- sort8524
UPDATE junior_grammar_questions SET kp_id = '25c6dd32-2584-44a6-96b6-aca343578575' WHERE id = '1d879a3a-ecf4-498f-8cbc-75acaca8711a' AND kp_id IS NULL;  -- sort8525
UPDATE junior_grammar_questions SET kp_id = '25c6dd32-2584-44a6-96b6-aca343578575' WHERE id = 'dc30462e-5142-40f3-99ad-75561c3d30a0' AND kp_id IS NULL;  -- sort8526
UPDATE junior_grammar_questions SET kp_id = '25c6dd32-2584-44a6-96b6-aca343578575' WHERE id = '05f12fa7-e1f3-4d97-a908-d276eace9384' AND kp_id IS NULL;  -- sort71
UPDATE junior_grammar_questions SET kp_id = '25c6dd32-2584-44a6-96b6-aca343578575' WHERE id = 'c478beb6-4309-4c14-a378-29e2f6635330' AND kp_id IS NULL;  -- sort73
UPDATE junior_grammar_questions SET kp_id = '25c6dd32-2584-44a6-96b6-aca343578575' WHERE id = 'b480dc00-9158-40ad-9230-4492453fc982' AND kp_id IS NULL;  -- sort75
UPDATE junior_grammar_questions SET kp_id = '25c6dd32-2584-44a6-96b6-aca343578575' WHERE id = '03c6dd17-53d9-4f50-b70f-783611097d01' AND kp_id IS NULL;  -- sort78
UPDATE junior_grammar_questions SET kp_id = '25c6dd32-2584-44a6-96b6-aca343578575' WHERE id = '2b8a95d9-fee5-4a3b-b6a1-944c07de29d2' AND kp_id IS NULL;  -- sort86
UPDATE junior_grammar_questions SET kp_id = '25c6dd32-2584-44a6-96b6-aca343578575' WHERE id = '4ee451d0-76ed-4d52-bbc8-d0d27a50b0ca' AND kp_id IS NULL;  -- sort87
UPDATE junior_grammar_questions SET kp_id = '25c6dd32-2584-44a6-96b6-aca343578575' WHERE id = 'c8397194-c0c3-4126-86c3-75e91b819430' AND kp_id IS NULL;  -- sort89
UPDATE junior_grammar_questions SET kp_id = '25c6dd32-2584-44a6-96b6-aca343578575' WHERE id = '91c8d304-5e93-4fac-93e8-0961b8168c54' AND kp_id IS NULL;  -- sort90
UPDATE junior_grammar_questions SET kp_id = '25c6dd32-2584-44a6-96b6-aca343578575' WHERE id = '51fe069c-5bb8-4968-bdf4-23712de0b148' AND kp_id IS NULL;  -- sort92
UPDATE junior_grammar_questions SET kp_id = '25c6dd32-2584-44a6-96b6-aca343578575' WHERE id = '5a44ddb7-7a02-47f3-94ea-7fd9cfe30900' AND kp_id IS NULL;  -- sort98
UPDATE junior_grammar_questions SET kp_id = '25c6dd32-2584-44a6-96b6-aca343578575' WHERE id = '0c25984b-c89c-41c6-899f-e23c416b2b3f' AND kp_id IS NULL;  -- sort100
UPDATE junior_grammar_questions SET kp_id = '25c6dd32-2584-44a6-96b6-aca343578575' WHERE id = '440ade9b-12a4-40a9-b06e-6deb0422657e' AND kp_id IS NULL;  -- sort396

-- distinguish 辨析双空 (21道) → dd460b04-9739-42c9-9889-0ba29dcfa8b4
UPDATE junior_grammar_questions SET kp_id = 'dd460b04-9739-42c9-9889-0ba29dcfa8b4' WHERE id = 'd92352f6-c880-45f9-9e9e-06c6cc24d80e' AND kp_id IS NULL;  -- sort8130
UPDATE junior_grammar_questions SET kp_id = 'dd460b04-9739-42c9-9889-0ba29dcfa8b4' WHERE id = '59185d84-898a-4fd7-b846-05ae5282f938' AND kp_id IS NULL;  -- sort8527
UPDATE junior_grammar_questions SET kp_id = 'dd460b04-9739-42c9-9889-0ba29dcfa8b4' WHERE id = 'd12a2d3c-ef65-41ed-bfa7-3f107b24a54d' AND kp_id IS NULL;  -- sort8528
UPDATE junior_grammar_questions SET kp_id = 'dd460b04-9739-42c9-9889-0ba29dcfa8b4' WHERE id = 'ee4ea078-13fb-4306-8bf4-a6b257f93ebc' AND kp_id IS NULL;  -- sort8529
UPDATE junior_grammar_questions SET kp_id = 'dd460b04-9739-42c9-9889-0ba29dcfa8b4' WHERE id = '29b81232-ef8b-4cdb-a482-f8d1bfd144c2' AND kp_id IS NULL;  -- sort8530
UPDATE junior_grammar_questions SET kp_id = 'dd460b04-9739-42c9-9889-0ba29dcfa8b4' WHERE id = '3f0873ed-e4d4-4be4-aa0a-6e8aa955bd16' AND kp_id IS NULL;  -- sort8531
UPDATE junior_grammar_questions SET kp_id = 'dd460b04-9739-42c9-9889-0ba29dcfa8b4' WHERE id = 'bd6265c8-ada1-426a-a50b-be8e31de7dde' AND kp_id IS NULL;  -- sort8532
UPDATE junior_grammar_questions SET kp_id = 'dd460b04-9739-42c9-9889-0ba29dcfa8b4' WHERE id = '17a2100c-f5ce-4761-b6d3-b39a7acce17a' AND kp_id IS NULL;  -- sort8533
UPDATE junior_grammar_questions SET kp_id = 'dd460b04-9739-42c9-9889-0ba29dcfa8b4' WHERE id = '4bde4914-2638-4761-a8ce-033f428146b2' AND kp_id IS NULL;  -- sort8534
UPDATE junior_grammar_questions SET kp_id = 'dd460b04-9739-42c9-9889-0ba29dcfa8b4' WHERE id = '282b946f-32fe-4d47-aced-0248af6717de' AND kp_id IS NULL;  -- sort8535
UPDATE junior_grammar_questions SET kp_id = 'dd460b04-9739-42c9-9889-0ba29dcfa8b4' WHERE id = '75416e5d-3beb-4876-a181-cf81a0bf571e' AND kp_id IS NULL;  -- sort8536
UPDATE junior_grammar_questions SET kp_id = 'dd460b04-9739-42c9-9889-0ba29dcfa8b4' WHERE id = '7319c0e5-3ae2-4816-852d-ff627e87ebae' AND kp_id IS NULL;  -- sort8537
UPDATE junior_grammar_questions SET kp_id = 'dd460b04-9739-42c9-9889-0ba29dcfa8b4' WHERE id = '6778b7f3-0400-4418-b74c-85f2d6936602' AND kp_id IS NULL;  -- sort8538
UPDATE junior_grammar_questions SET kp_id = 'dd460b04-9739-42c9-9889-0ba29dcfa8b4' WHERE id = '337e0194-980e-419c-b13c-1e07b8c05976' AND kp_id IS NULL;  -- sort8539
UPDATE junior_grammar_questions SET kp_id = 'dd460b04-9739-42c9-9889-0ba29dcfa8b4' WHERE id = '2db632c8-ebe8-4ec3-9642-20e8cf0cf888' AND kp_id IS NULL;  -- sort8540
UPDATE junior_grammar_questions SET kp_id = 'dd460b04-9739-42c9-9889-0ba29dcfa8b4' WHERE id = '4629c171-fb89-4897-abeb-ee68350460bc' AND kp_id IS NULL;  -- sort8541
UPDATE junior_grammar_questions SET kp_id = 'dd460b04-9739-42c9-9889-0ba29dcfa8b4' WHERE id = '7af4a7b8-d66a-4416-b9ab-4ec8152009e0' AND kp_id IS NULL;  -- sort8542
UPDATE junior_grammar_questions SET kp_id = 'dd460b04-9739-42c9-9889-0ba29dcfa8b4' WHERE id = '72598630-a22e-495d-aa06-50cab1efe1f1' AND kp_id IS NULL;  -- sort8543
UPDATE junior_grammar_questions SET kp_id = 'dd460b04-9739-42c9-9889-0ba29dcfa8b4' WHERE id = 'b235201f-6212-422d-b291-7a7daa26fa94' AND kp_id IS NULL;  -- sort8544
UPDATE junior_grammar_questions SET kp_id = 'dd460b04-9739-42c9-9889-0ba29dcfa8b4' WHERE id = 'f022bf12-a633-47b4-8eea-f1265f4c572b' AND kp_id IS NULL;  -- sort8545
UPDATE junior_grammar_questions SET kp_id = 'dd460b04-9739-42c9-9889-0ba29dcfa8b4' WHERE id = '4099cbb0-f879-4afd-ac46-c81e50bd6734' AND kp_id IS NULL;  -- sort93

-- obj 宾格 (9道) → e2a1b3c4-d5e6-4f70-9a81-b2c3d4e5f6a1
UPDATE junior_grammar_questions SET kp_id = 'e2a1b3c4-d5e6-4f70-9a81-b2c3d4e5f6a1' WHERE id = 'f6392f41-8b85-4f5d-ad96-8242a923a385' AND kp_id IS NULL;  -- sort3
UPDATE junior_grammar_questions SET kp_id = 'e2a1b3c4-d5e6-4f70-9a81-b2c3d4e5f6a1' WHERE id = '03916c25-a453-42e8-a955-e303cd89a6ec' AND kp_id IS NULL;  -- sort6
UPDATE junior_grammar_questions SET kp_id = 'e2a1b3c4-d5e6-4f70-9a81-b2c3d4e5f6a1' WHERE id = 'c4eab6d3-17de-4bee-bb8a-8cc8c07b2849' AND kp_id IS NULL;  -- sort10
UPDATE junior_grammar_questions SET kp_id = 'e2a1b3c4-d5e6-4f70-9a81-b2c3d4e5f6a1' WHERE id = 'ca9dd1d0-ca8f-4c0b-968f-614383be7284' AND kp_id IS NULL;  -- sort15
UPDATE junior_grammar_questions SET kp_id = 'e2a1b3c4-d5e6-4f70-9a81-b2c3d4e5f6a1' WHERE id = '5ba46d1c-976c-41cd-b1e8-87c5954eda59' AND kp_id IS NULL;  -- sort8321
UPDATE junior_grammar_questions SET kp_id = 'e2a1b3c4-d5e6-4f70-9a81-b2c3d4e5f6a1' WHERE id = 'f3b41d9b-f94a-43fa-b7c9-84d915430a2e' AND kp_id IS NULL;  -- sort70
UPDATE junior_grammar_questions SET kp_id = 'e2a1b3c4-d5e6-4f70-9a81-b2c3d4e5f6a1' WHERE id = '60e728fc-22d3-4f62-8bdf-9f023e57edfe' AND kp_id IS NULL;  -- sort85
UPDATE junior_grammar_questions SET kp_id = 'e2a1b3c4-d5e6-4f70-9a81-b2c3d4e5f6a1' WHERE id = '4635f833-9711-4e5d-8827-dcdb65cbdb53' AND kp_id IS NULL;  -- sort95
UPDATE junior_grammar_questions SET kp_id = 'e2a1b3c4-d5e6-4f70-9a81-b2c3d4e5f6a1' WHERE id = 'a02675fd-d840-4f88-af49-913cab0651ff' AND kp_id IS NULL;  -- sort99

-- nposs 名词性物主 (16道) → e3b2c4d5-e6f7-4081-9b92-c3d4e5f6a1b2
UPDATE junior_grammar_questions SET kp_id = 'e3b2c4d5-e6f7-4081-9b92-c3d4e5f6a1b2' WHERE id = 'ada166b3-b94a-4bbf-a063-4bb3ab4a086a' AND kp_id IS NULL;  -- sort4
UPDATE junior_grammar_questions SET kp_id = 'e3b2c4d5-e6f7-4081-9b92-c3d4e5f6a1b2' WHERE id = 'fa196dba-b6b7-4366-b5f4-656d1b0f2eb8' AND kp_id IS NULL;  -- sort7
UPDATE junior_grammar_questions SET kp_id = 'e3b2c4d5-e6f7-4081-9b92-c3d4e5f6a1b2' WHERE id = 'dadd5b05-47c5-4b50-91cd-fb513b36f71f' AND kp_id IS NULL;  -- sort8424
UPDATE junior_grammar_questions SET kp_id = 'e3b2c4d5-e6f7-4081-9b92-c3d4e5f6a1b2' WHERE id = 'e6271283-95ee-45ec-b116-114a764412c6' AND kp_id IS NULL;  -- sort72
UPDATE junior_grammar_questions SET kp_id = 'e3b2c4d5-e6f7-4081-9b92-c3d4e5f6a1b2' WHERE id = 'b52fba8c-fe02-4fb7-b1f2-abf2e83a28d9' AND kp_id IS NULL;  -- sort74
UPDATE junior_grammar_questions SET kp_id = 'e3b2c4d5-e6f7-4081-9b92-c3d4e5f6a1b2' WHERE id = 'b3642c4d-df70-4103-8dd6-330fa02fd4c7' AND kp_id IS NULL;  -- sort76
UPDATE junior_grammar_questions SET kp_id = 'e3b2c4d5-e6f7-4081-9b92-c3d4e5f6a1b2' WHERE id = '5dd9d65e-de93-4628-a0bf-e91d11806681' AND kp_id IS NULL;  -- sort77
UPDATE junior_grammar_questions SET kp_id = 'e3b2c4d5-e6f7-4081-9b92-c3d4e5f6a1b2' WHERE id = 'b915898e-11ba-46dd-af0c-642a95349497' AND kp_id IS NULL;  -- sort79
UPDATE junior_grammar_questions SET kp_id = 'e3b2c4d5-e6f7-4081-9b92-c3d4e5f6a1b2' WHERE id = '17e740fb-8555-4434-a4e3-7db104e2a1ab' AND kp_id IS NULL;  -- sort81
UPDATE junior_grammar_questions SET kp_id = 'e3b2c4d5-e6f7-4081-9b92-c3d4e5f6a1b2' WHERE id = 'aad210ef-7d21-4447-9a49-a81b7099fa60' AND kp_id IS NULL;  -- sort82
UPDATE junior_grammar_questions SET kp_id = 'e3b2c4d5-e6f7-4081-9b92-c3d4e5f6a1b2' WHERE id = '1ecc42ca-b875-4de6-99c6-76e5673189cc' AND kp_id IS NULL;  -- sort83
UPDATE junior_grammar_questions SET kp_id = 'e3b2c4d5-e6f7-4081-9b92-c3d4e5f6a1b2' WHERE id = '583e03b6-e978-454f-abe2-a5b2cb51a1b5' AND kp_id IS NULL;  -- sort84
UPDATE junior_grammar_questions SET kp_id = 'e3b2c4d5-e6f7-4081-9b92-c3d4e5f6a1b2' WHERE id = '66afe471-5aeb-4cac-a3b0-2c49fcce3e3e' AND kp_id IS NULL;  -- sort88
UPDATE junior_grammar_questions SET kp_id = 'e3b2c4d5-e6f7-4081-9b92-c3d4e5f6a1b2' WHERE id = 'aeb09b52-a2ee-41d5-8fe7-25124dec2106' AND kp_id IS NULL;  -- sort91
UPDATE junior_grammar_questions SET kp_id = 'e3b2c4d5-e6f7-4081-9b92-c3d4e5f6a1b2' WHERE id = 'ef243dfd-5417-4c43-b94a-7d44f32154b7' AND kp_id IS NULL;  -- sort94
UPDATE junior_grammar_questions SET kp_id = 'e3b2c4d5-e6f7-4081-9b92-c3d4e5f6a1b2' WHERE id = 'ef591eb3-7107-4800-8e38-add3e9cd44fa' AND kp_id IS NULL;  -- sort97

-- aposs 名词所有格s (7道) → e4c3d5e6-f708-4192-9ca3-d4e5f6a1b2c3
UPDATE junior_grammar_questions SET kp_id = 'e4c3d5e6-f708-4192-9ca3-d4e5f6a1b2c3' WHERE id = '71bdf86a-b6e5-4b6f-a30c-1c38ff596fcb' AND kp_id IS NULL;  -- sort8101
UPDATE junior_grammar_questions SET kp_id = 'e4c3d5e6-f708-4192-9ca3-d4e5f6a1b2c3' WHERE id = '51fa4271-58bd-41f1-bd47-46aabd03590a' AND kp_id IS NULL;  -- sort8106
UPDATE junior_grammar_questions SET kp_id = 'e4c3d5e6-f708-4192-9ca3-d4e5f6a1b2c3' WHERE id = '05b1b327-c331-43d6-86f6-2b86e4d47f7c' AND kp_id IS NULL;  -- sort8133
UPDATE junior_grammar_questions SET kp_id = 'e4c3d5e6-f708-4192-9ca3-d4e5f6a1b2c3' WHERE id = '96936422-69e5-4e37-822c-2b0c8c8d1c3f' AND kp_id IS NULL;  -- sort8203
UPDATE junior_grammar_questions SET kp_id = 'e4c3d5e6-f708-4192-9ca3-d4e5f6a1b2c3' WHERE id = '34b16fbd-53ed-48d9-bba4-6e0667d086e4' AND kp_id IS NULL;  -- sort8213
UPDATE junior_grammar_questions SET kp_id = 'e4c3d5e6-f708-4192-9ca3-d4e5f6a1b2c3' WHERE id = '75704fcb-3386-44bd-ae8f-73fb277f5caf' AND kp_id IS NULL;  -- sort8224
UPDATE junior_grammar_questions SET kp_id = 'e4c3d5e6-f708-4192-9ca3-d4e5f6a1b2c3' WHERE id = '92ae53ee-368c-4eb4-bd6f-a6870f05bbb1' AND kp_id IS NULL;  -- sort8433

-- 本文件语句数: 建kp 3 + 标kp 98 = 101条

-- 【校验段】以下2条单独跑
SELECT count(*) AS n, kp_id FROM junior_grammar_questions WHERE point_id='6a185802-70df-4c91-a744-33c7b6f33789' GROUP BY kp_id; -- 6 kp 合计158 (subj42/poss43/distinguish41/obj9/nposs16/aposs7)
SELECT count(*) AS still_null FROM junior_grammar_questions WHERE point_id='6a185802-70df-4c91-a744-33c7b6f33789' AND kp_id IS NULL; -- 应 0

-- END OF FILE t02-tag.sql
