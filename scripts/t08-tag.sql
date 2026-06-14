-- ============================================================
-- t08 补标 kp_id : 建5新kp(who/when/why/how/howmany) + 删重复#288 + 81道全显式标
-- 只标 kp_id IS NULL 的,不动已标40道。整文件可一次跑(DELETE已包裹)
-- ============================================================

-- 【第一段】建 5 新 kp (现有 what/where-howold 不动)
INSERT INTO junior_knowledge_points (id, point_id, code, title, summary, sort_order, target_count)
SELECT 'f1a2b3c4-1d2e-4f30-8a41-5b2c3d4e5f61', '48e78919-5b25-4e64-9e8e-d801c5d950fd', 'g7-t08-who', '人物·所属·选择(Who/Whose/Which)', NULL, 3, 20
WHERE NOT EXISTS (SELECT 1 FROM junior_knowledge_points WHERE code = 'g7-t08-who');

INSERT INTO junior_knowledge_points (id, point_id, code, title, summary, sort_order, target_count)
SELECT 'f2b3c4d5-2e3f-4041-8b52-6c3d4e5f6072', '48e78919-5b25-4e64-9e8e-d801c5d950fd', 'g7-t08-when', '时间(When/What time)', NULL, 4, 20
WHERE NOT EXISTS (SELECT 1 FROM junior_knowledge_points WHERE code = 'g7-t08-when');

INSERT INTO junior_knowledge_points (id, point_id, code, title, summary, sort_order, target_count)
SELECT 'f3c4d5e6-3f40-4152-9c63-7d4e5f607183', '48e78919-5b25-4e64-9e8e-d801c5d950fd', 'g7-t08-why', '原因(Why...Because)', NULL, 5, 20
WHERE NOT EXISTS (SELECT 1 FROM junior_knowledge_points WHERE code = 'g7-t08-why');

INSERT INTO junior_knowledge_points (id, point_id, code, title, summary, sort_order, target_count)
SELECT 'f4d5e6f7-4051-4263-ad74-8e5f60718394', '48e78919-5b25-4e64-9e8e-d801c5d950fd', 'g7-t08-how', '方式状态(How...by/on foot/feel/spell)', NULL, 6, 20
WHERE NOT EXISTS (SELECT 1 FROM junior_knowledge_points WHERE code = 'g7-t08-how');

INSERT INTO junior_knowledge_points (id, point_id, code, title, summary, sort_order, target_count)
SELECT 'f5e6f708-5162-4374-be85-9f60718394a5', '48e78919-5b25-4e64-9e8e-d801c5d950fd', 'g7-t08-howmany', '数量程度(How many/much/often/long)', NULL, 7, 20
WHERE NOT EXISTS (SELECT 1 FROM junior_knowledge_points WHERE code = 'g7-t08-howmany');

-- ↓↓↓ 【第二段】删重复 #288 (≈#187, 都'对划线 book on the desk→Where') —— 可单独跑 ↓↓↓
DELETE FROM junior_grammar_questions WHERE id = '4e9db315-d68c-4326-a0a5-fc326fe9bfa6';  -- sort288 (与保留的 sort187 题干答案一致)
-- ↑↑↑ DELETE 结束 ↑↑↑

-- 【第三段】81道全显式标 kp_id (WHERE id AND kp_id IS NULL 双保险)
-- what What类 (13道) → b9f56a7e-eb07-4a68-92a6-6e948bb3f324
UPDATE junior_grammar_questions SET kp_id = 'b9f56a7e-eb07-4a68-92a6-6e948bb3f324' WHERE id = 'dc0e5580-ff54-47bf-bed6-626f8335221d' AND kp_id IS NULL;  -- sort15
UPDATE junior_grammar_questions SET kp_id = 'b9f56a7e-eb07-4a68-92a6-6e948bb3f324' WHERE id = 'f5be7d35-4d85-4ed7-a673-b2fae81add70' AND kp_id IS NULL;  -- sort9022
UPDATE junior_grammar_questions SET kp_id = 'b9f56a7e-eb07-4a68-92a6-6e948bb3f324' WHERE id = 'b2969c47-3b28-42bc-8dab-2fb0a145ca36' AND kp_id IS NULL;  -- sort9032
UPDATE junior_grammar_questions SET kp_id = 'b9f56a7e-eb07-4a68-92a6-6e948bb3f324' WHERE id = '53d7e107-6bbb-4e23-a0b7-07664b002b9f' AND kp_id IS NULL;  -- sort9509
UPDATE junior_grammar_questions SET kp_id = 'b9f56a7e-eb07-4a68-92a6-6e948bb3f324' WHERE id = '6ae3914a-ba67-47a9-9212-7dc4475052da' AND kp_id IS NULL;  -- sort9532
UPDATE junior_grammar_questions SET kp_id = 'b9f56a7e-eb07-4a68-92a6-6e948bb3f324' WHERE id = '3b9e692c-72c8-4d9f-8a43-8c9b6a2968d8' AND kp_id IS NULL;  -- sort9613
UPDATE junior_grammar_questions SET kp_id = 'b9f56a7e-eb07-4a68-92a6-6e948bb3f324' WHERE id = '89e31cb9-e6bf-4efe-9f0c-e713d787fb95' AND kp_id IS NULL;  -- sort366
UPDATE junior_grammar_questions SET kp_id = 'b9f56a7e-eb07-4a68-92a6-6e948bb3f324' WHERE id = '99121ccc-25f4-4269-b669-bd9f09beb122' AND kp_id IS NULL;  -- sort368
UPDATE junior_grammar_questions SET kp_id = 'b9f56a7e-eb07-4a68-92a6-6e948bb3f324' WHERE id = '56ca22dc-bdb5-463b-8ba3-ee7cf9361e90' AND kp_id IS NULL;  -- sort374
UPDATE junior_grammar_questions SET kp_id = 'b9f56a7e-eb07-4a68-92a6-6e948bb3f324' WHERE id = '8eb075b4-ddfa-4b87-8169-3dac2b4ef493' AND kp_id IS NULL;  -- sort375
UPDATE junior_grammar_questions SET kp_id = 'b9f56a7e-eb07-4a68-92a6-6e948bb3f324' WHERE id = '41be89cf-7fbf-4d65-b2e8-a2588c594598' AND kp_id IS NULL;  -- sort381
UPDATE junior_grammar_questions SET kp_id = 'b9f56a7e-eb07-4a68-92a6-6e948bb3f324' WHERE id = '6d476b68-8d12-4a48-8f98-056c13d98c31' AND kp_id IS NULL;  -- sort389
UPDATE junior_grammar_questions SET kp_id = 'b9f56a7e-eb07-4a68-92a6-6e948bb3f324' WHERE id = '28436e24-8e77-4c6d-9d29-6dafd378febe' AND kp_id IS NULL;  -- sort393

-- where-howold Where/How old (15道) → d394a521-3a91-43c8-b8f7-fa597266a368
UPDATE junior_grammar_questions SET kp_id = 'd394a521-3a91-43c8-b8f7-fa597266a368' WHERE id = '95483254-763c-4726-b392-d99b5316946c' AND kp_id IS NULL;  -- sort8625
UPDATE junior_grammar_questions SET kp_id = 'd394a521-3a91-43c8-b8f7-fa597266a368' WHERE id = '363cba79-194c-4d63-b72c-b4d48fc566d7' AND kp_id IS NULL;  -- sort9350
UPDATE junior_grammar_questions SET kp_id = 'd394a521-3a91-43c8-b8f7-fa597266a368' WHERE id = '2073bb00-0144-4906-9911-77b58dcfdc81' AND kp_id IS NULL;  -- sort9428
UPDATE junior_grammar_questions SET kp_id = 'd394a521-3a91-43c8-b8f7-fa597266a368' WHERE id = '858639db-c16a-44e3-bd93-4a990f30428e' AND kp_id IS NULL;  -- sort9708
UPDATE junior_grammar_questions SET kp_id = 'd394a521-3a91-43c8-b8f7-fa597266a368' WHERE id = '07957d93-f10a-402e-82a8-5699e0a7a2b9' AND kp_id IS NULL;  -- sort9732
UPDATE junior_grammar_questions SET kp_id = 'd394a521-3a91-43c8-b8f7-fa597266a368' WHERE id = '464d5dd3-33da-481d-8375-033e20ecba7a' AND kp_id IS NULL;  -- sort9747
UPDATE junior_grammar_questions SET kp_id = 'd394a521-3a91-43c8-b8f7-fa597266a368' WHERE id = 'e4dc89a7-8b40-4544-b673-a49373b46b65' AND kp_id IS NULL;  -- sort367
UPDATE junior_grammar_questions SET kp_id = 'd394a521-3a91-43c8-b8f7-fa597266a368' WHERE id = 'fa50b9d3-32fc-4e0f-ac6e-5778c7c4fc0b' AND kp_id IS NULL;  -- sort187
UPDATE junior_grammar_questions SET kp_id = 'd394a521-3a91-43c8-b8f7-fa597266a368' WHERE id = '2ad76b07-49a9-4a6d-91ce-2b5e8eb53c9c' AND kp_id IS NULL;  -- sort385
UPDATE junior_grammar_questions SET kp_id = 'd394a521-3a91-43c8-b8f7-fa597266a368' WHERE id = '79b6d422-272a-4bda-b45c-8b2fb41ed53b' AND kp_id IS NULL;  -- sort390
UPDATE junior_grammar_questions SET kp_id = 'd394a521-3a91-43c8-b8f7-fa597266a368' WHERE id = 'c601a28d-0c21-4966-82e9-0735bb1c88e8' AND kp_id IS NULL;  -- sort400
UPDATE junior_grammar_questions SET kp_id = 'd394a521-3a91-43c8-b8f7-fa597266a368' WHERE id = 'b367c724-7038-407e-aa83-86f09d95b9c2' AND kp_id IS NULL;  -- sort186
UPDATE junior_grammar_questions SET kp_id = 'd394a521-3a91-43c8-b8f7-fa597266a368' WHERE id = '610fc276-729c-4e93-a647-932fb378f334' AND kp_id IS NULL;  -- sort382
UPDATE junior_grammar_questions SET kp_id = 'd394a521-3a91-43c8-b8f7-fa597266a368' WHERE id = '847d9fde-6a76-4509-b431-25453948069f' AND kp_id IS NULL;  -- sort391
UPDATE junior_grammar_questions SET kp_id = 'd394a521-3a91-43c8-b8f7-fa597266a368' WHERE id = '9aa886ff-7c06-47e5-b029-c43ad49097c0' AND kp_id IS NULL;  -- sort397

-- who 人物所属选择 (11道) → f1a2b3c4-1d2e-4f30-8a41-5b2c3d4e5f61
UPDATE junior_grammar_questions SET kp_id = 'f1a2b3c4-1d2e-4f30-8a41-5b2c3d4e5f61' WHERE id = 'df6e454d-c371-40bc-96f5-a20474e7327f' AND kp_id IS NULL;  -- sort4
UPDATE junior_grammar_questions SET kp_id = 'f1a2b3c4-1d2e-4f30-8a41-5b2c3d4e5f61' WHERE id = 'f86cfbff-cf08-4f37-b758-a375a024c9aa' AND kp_id IS NULL;  -- sort8014
UPDATE junior_grammar_questions SET kp_id = 'f1a2b3c4-1d2e-4f30-8a41-5b2c3d4e5f61' WHERE id = '8f6c0bcb-b19b-4645-96f1-8a37eba651ce' AND kp_id IS NULL;  -- sort8314
UPDATE junior_grammar_questions SET kp_id = 'f1a2b3c4-1d2e-4f30-8a41-5b2c3d4e5f61' WHERE id = 'bfe9d6bb-46f5-4a77-b621-ca58a79f4514' AND kp_id IS NULL;  -- sort369
UPDATE junior_grammar_questions SET kp_id = 'f1a2b3c4-1d2e-4f30-8a41-5b2c3d4e5f61' WHERE id = '9e310d40-16c9-4d73-a132-fa1fb7b4f5da' AND kp_id IS NULL;  -- sort383
UPDATE junior_grammar_questions SET kp_id = 'f1a2b3c4-1d2e-4f30-8a41-5b2c3d4e5f61' WHERE id = '288ed026-5a75-4a5c-baef-c6fe410fe85c' AND kp_id IS NULL;  -- sort399
UPDATE junior_grammar_questions SET kp_id = 'f1a2b3c4-1d2e-4f30-8a41-5b2c3d4e5f61' WHERE id = '924e05ae-deab-4c12-be6f-5cdbff189a01' AND kp_id IS NULL;  -- sort13
UPDATE junior_grammar_questions SET kp_id = 'f1a2b3c4-1d2e-4f30-8a41-5b2c3d4e5f61' WHERE id = 'e5fa5290-ecd1-42dc-97d3-22bc37f3dff1' AND kp_id IS NULL;  -- sort376
UPDATE junior_grammar_questions SET kp_id = 'f1a2b3c4-1d2e-4f30-8a41-5b2c3d4e5f61' WHERE id = 'b0267329-71e7-47a5-959a-07928252952f' AND kp_id IS NULL;  -- sort388
UPDATE junior_grammar_questions SET kp_id = 'f1a2b3c4-1d2e-4f30-8a41-5b2c3d4e5f61' WHERE id = 'b49fb288-06a4-4ddd-8656-fca787dce5aa' AND kp_id IS NULL;  -- sort12
UPDATE junior_grammar_questions SET kp_id = 'f1a2b3c4-1d2e-4f30-8a41-5b2c3d4e5f61' WHERE id = '8d5ee56e-4951-43f9-be04-86d2bd1119a8' AND kp_id IS NULL;  -- sort378

-- when 时间 (13道) → f2b3c4d5-2e3f-4041-8b52-6c3d4e5f6072
UPDATE junior_grammar_questions SET kp_id = 'f2b3c4d5-2e3f-4041-8b52-6c3d4e5f6072' WHERE id = 'c9ccd1a0-2780-43aa-9e50-133ea39f2796' AND kp_id IS NULL;  -- sort6
UPDATE junior_grammar_questions SET kp_id = 'f2b3c4d5-2e3f-4041-8b52-6c3d4e5f6072' WHERE id = '486a92ef-b03a-4d9e-92d4-391958170ffa' AND kp_id IS NULL;  -- sort8304
UPDATE junior_grammar_questions SET kp_id = 'f2b3c4d5-2e3f-4041-8b52-6c3d4e5f6072' WHERE id = 'dd535c87-1367-49b3-bde7-ef01c770d890' AND kp_id IS NULL;  -- sort8320
UPDATE junior_grammar_questions SET kp_id = 'f2b3c4d5-2e3f-4041-8b52-6c3d4e5f6072' WHERE id = '477e997d-0813-427b-ab7f-84394e39a9c0' AND kp_id IS NULL;  -- sort8605
UPDATE junior_grammar_questions SET kp_id = 'f2b3c4d5-2e3f-4041-8b52-6c3d4e5f6072' WHERE id = '1b0bf9b4-fe60-423d-afab-2ba442aaa5bd' AND kp_id IS NULL;  -- sort9310
UPDATE junior_grammar_questions SET kp_id = 'f2b3c4d5-2e3f-4041-8b52-6c3d4e5f6072' WHERE id = 'b2804d3a-938f-4121-b071-d817dafc10b6' AND kp_id IS NULL;  -- sort9330
UPDATE junior_grammar_questions SET kp_id = 'f2b3c4d5-2e3f-4041-8b52-6c3d4e5f6072' WHERE id = '3ef018a4-b631-4503-9d2e-1a908b2d667e' AND kp_id IS NULL;  -- sort379
UPDATE junior_grammar_questions SET kp_id = 'f2b3c4d5-2e3f-4041-8b52-6c3d4e5f6072' WHERE id = '71b9abe9-7569-476c-8741-1bbb02abb72d' AND kp_id IS NULL;  -- sort14
UPDATE junior_grammar_questions SET kp_id = 'f2b3c4d5-2e3f-4041-8b52-6c3d4e5f6072' WHERE id = 'b1fd2654-f1c7-4fc5-9292-56dbfd611108' AND kp_id IS NULL;  -- sort8501
UPDATE junior_grammar_questions SET kp_id = 'f2b3c4d5-2e3f-4041-8b52-6c3d4e5f6072' WHERE id = '3afbbdf0-e841-4965-ad17-ba996f8b78b5' AND kp_id IS NULL;  -- sort8521
UPDATE junior_grammar_questions SET kp_id = 'f2b3c4d5-2e3f-4041-8b52-6c3d4e5f6072' WHERE id = '5e192015-2950-4054-a42e-6b0b540ca0c3' AND kp_id IS NULL;  -- sort8645
UPDATE junior_grammar_questions SET kp_id = 'f2b3c4d5-2e3f-4041-8b52-6c3d4e5f6072' WHERE id = '180e1786-43c5-4d16-b0ca-918717dfcb07' AND kp_id IS NULL;  -- sort371
UPDATE junior_grammar_questions SET kp_id = 'f2b3c4d5-2e3f-4041-8b52-6c3d4e5f6072' WHERE id = '501f32ba-2a52-455c-a953-4d088d7ab2b7' AND kp_id IS NULL;  -- sort384

-- why 原因 (7道) → f3c4d5e6-3f40-4152-9c63-7d4e5f607183
UPDATE junior_grammar_questions SET kp_id = 'f3c4d5e6-3f40-4152-9c63-7d4e5f607183' WHERE id = '8c5f9563-fa78-4e6b-89a0-185d467d8df7' AND kp_id IS NULL;  -- sort9
UPDATE junior_grammar_questions SET kp_id = 'f3c4d5e6-3f40-4152-9c63-7d4e5f607183' WHERE id = 'f585f95d-6db1-4989-bc19-a4c5e58f3035' AND kp_id IS NULL;  -- sort8330
UPDATE junior_grammar_questions SET kp_id = 'f3c4d5e6-3f40-4152-9c63-7d4e5f607183' WHERE id = '62a63f1a-256f-498e-a685-aa6f5b8a69f1' AND kp_id IS NULL;  -- sort9012
UPDATE junior_grammar_questions SET kp_id = 'f3c4d5e6-3f40-4152-9c63-7d4e5f607183' WHERE id = 'ab5c6193-b5b8-44d7-9807-86b5c6a8483d' AND kp_id IS NULL;  -- sort9653
UPDATE junior_grammar_questions SET kp_id = 'f3c4d5e6-3f40-4152-9c63-7d4e5f607183' WHERE id = 'e2bd30a9-14a4-4728-9863-f44959054b89' AND kp_id IS NULL;  -- sort370
UPDATE junior_grammar_questions SET kp_id = 'f3c4d5e6-3f40-4152-9c63-7d4e5f607183' WHERE id = 'b4e321ab-0192-470a-a08f-62cb74c7f3a4' AND kp_id IS NULL;  -- sort386
UPDATE junior_grammar_questions SET kp_id = 'f3c4d5e6-3f40-4152-9c63-7d4e5f607183' WHERE id = 'f1afff4e-cfa7-4235-905e-09fbf3e77a86' AND kp_id IS NULL;  -- sort392

-- how 方式 (8道) → f4d5e6f7-4051-4263-ad74-8e5f60718394
UPDATE junior_grammar_questions SET kp_id = 'f4d5e6f7-4051-4263-ad74-8e5f60718394' WHERE id = '6f79d738-93b7-41a4-85e6-30018f3b83a1' AND kp_id IS NULL;  -- sort8
UPDATE junior_grammar_questions SET kp_id = 'f4d5e6f7-4051-4263-ad74-8e5f60718394' WHERE id = 'ecfecb48-d322-457d-b53f-d6ad3ed710ff' AND kp_id IS NULL;  -- sort8002
UPDATE junior_grammar_questions SET kp_id = 'f4d5e6f7-4051-4263-ad74-8e5f60718394' WHERE id = '432b6b4b-fe82-42bd-b334-0bbcdb3cf92c' AND kp_id IS NULL;  -- sort8531
UPDATE junior_grammar_questions SET kp_id = 'f4d5e6f7-4051-4263-ad74-8e5f60718394' WHERE id = '93c1c405-a7da-4cee-bbd5-ac52e6b22b7b' AND kp_id IS NULL;  -- sort9506
UPDATE junior_grammar_questions SET kp_id = 'f4d5e6f7-4051-4263-ad74-8e5f60718394' WHERE id = '1ed1d905-cb5c-4214-bce9-f3a1a9a8f7b7' AND kp_id IS NULL;  -- sort9633
UPDATE junior_grammar_questions SET kp_id = 'f4d5e6f7-4051-4263-ad74-8e5f60718394' WHERE id = 'f8b28452-f923-40f2-a56e-b4be9806565c' AND kp_id IS NULL;  -- sort9714
UPDATE junior_grammar_questions SET kp_id = 'f4d5e6f7-4051-4263-ad74-8e5f60718394' WHERE id = '2688d10f-4c96-4367-bbf3-c5188caf8f60' AND kp_id IS NULL;  -- sort377
UPDATE junior_grammar_questions SET kp_id = 'f4d5e6f7-4051-4263-ad74-8e5f60718394' WHERE id = '3795ebd4-db96-4d14-83b4-65496895d0d4' AND kp_id IS NULL;  -- sort394

-- howmany 数量程度 (14道) → f5e6f708-5162-4374-be85-9f60718394a5
UPDATE junior_grammar_questions SET kp_id = 'f5e6f708-5162-4374-be85-9f60718394a5' WHERE id = '2ee43600-7960-40a9-b131-877aa03dd7a9' AND kp_id IS NULL;  -- sort10
UPDATE junior_grammar_questions SET kp_id = 'f5e6f708-5162-4374-be85-9f60718394a5' WHERE id = '94ec971f-6862-4771-b68b-c3635446c8a1' AND kp_id IS NULL;  -- sort372
UPDATE junior_grammar_questions SET kp_id = 'f5e6f708-5162-4374-be85-9f60718394a5' WHERE id = 'a7235f8d-7dba-4e9b-b9b2-5c00c6482b06' AND kp_id IS NULL;  -- sort387
UPDATE junior_grammar_questions SET kp_id = 'f5e6f708-5162-4374-be85-9f60718394a5' WHERE id = 'd16ddf81-b87b-4e2b-9c60-7231752653a3' AND kp_id IS NULL;  -- sort395
UPDATE junior_grammar_questions SET kp_id = 'f5e6f708-5162-4374-be85-9f60718394a5' WHERE id = '90173d0f-a959-4d95-bc31-255d2d4835b4' AND kp_id IS NULL;  -- sort398
UPDATE junior_grammar_questions SET kp_id = 'f5e6f708-5162-4374-be85-9f60718394a5' WHERE id = '8abea868-8eaf-41af-a48c-0cca84368313' AND kp_id IS NULL;  -- sort11
UPDATE junior_grammar_questions SET kp_id = 'f5e6f708-5162-4374-be85-9f60718394a5' WHERE id = 'd2babb8c-0fbc-40b6-8887-60ec39d98280' AND kp_id IS NULL;  -- sort373
UPDATE junior_grammar_questions SET kp_id = 'f5e6f708-5162-4374-be85-9f60718394a5' WHERE id = '3baedef7-dd38-4673-9be1-26cc1a2f7886' AND kp_id IS NULL;  -- sort8511
UPDATE junior_grammar_questions SET kp_id = 'f5e6f708-5162-4374-be85-9f60718394a5' WHERE id = 'fbd59132-f6d7-42c4-8f8a-5c593e7e5922' AND kp_id IS NULL;  -- sort9200
UPDATE junior_grammar_questions SET kp_id = 'f5e6f708-5162-4374-be85-9f60718394a5' WHERE id = '3e7a4410-a2a8-4a8a-bc76-76cd1fd00b60' AND kp_id IS NULL;  -- sort9207
UPDATE junior_grammar_questions SET kp_id = 'f5e6f708-5162-4374-be85-9f60718394a5' WHERE id = 'e82d4135-f9d4-42fa-97b8-e73c1e990fc4' AND kp_id IS NULL;  -- sort9240
UPDATE junior_grammar_questions SET kp_id = 'f5e6f708-5162-4374-be85-9f60718394a5' WHERE id = '2e7d419b-16e4-40d4-9663-623d44d59c3a' AND kp_id IS NULL;  -- sort380
UPDATE junior_grammar_questions SET kp_id = 'f5e6f708-5162-4374-be85-9f60718394a5' WHERE id = '8fd6d8ee-05dd-4936-8505-0d308420aa4e' AND kp_id IS NULL;  -- sort9227
UPDATE junior_grammar_questions SET kp_id = 'f5e6f708-5162-4374-be85-9f60718394a5' WHERE id = 'e557748b-ba53-4180-b99c-81e3a4239f05' AND kp_id IS NULL;  -- sort9247

-- 本文件语句数: 建kp 5 + DELETE 1 + 标kp 81 = 87条

-- 【校验段】以下2条单独跑
SELECT count(*) AS n, kp_id FROM junior_grammar_questions WHERE point_id='48e78919-5b25-4e64-9e8e-d801c5d950fd' GROUP BY kp_id; -- 7 kp 合计121 (what33/where-howold35/who11/when13/why7/how8/howmany14)
SELECT count(*) AS still_null FROM junior_grammar_questions WHERE point_id='48e78919-5b25-4e64-9e8e-d801c5d950fd' AND kp_id IS NULL; -- 应 0

-- END OF FILE t08-tag.sql
