-- t20 动词搭配: 删26词汇错位题(F类) + 补28动词搭配题解析

-- ↓↓↓ 删 26 道词汇错位题 (F类:词义选词,非语法) —— 可单独跑。下方注释列 sort+答案供核对 ↓↓↓
DELETE FROM junior_grammar_questions WHERE id = '1320e669-0158-4e8b-aba9-406b8ee38b16';  -- sort8204 答案=raise
DELETE FROM junior_grammar_questions WHERE id = 'b9b02164-ee1b-471e-9a54-c2af6ed0510d';  -- sort8212 答案=center
DELETE FROM junior_grammar_questions WHERE id = '4bf48861-c1d4-42ce-b129-03b50c3c43a4';  -- sort8400 答案=Sports
DELETE FROM junior_grammar_questions WHERE id = 'ab343d21-8eef-4952-a570-272cb4ca1eeb';  -- sort8410 答案=animals
DELETE FROM junior_grammar_questions WHERE id = 'a893f752-ff91-4ff4-8e8a-078e92e2b5b3';  -- sort8420 答案=Drama
DELETE FROM junior_grammar_questions WHERE id = 'd5a128f4-a634-4374-b919-f13d57f66fcc';  -- sort8430 答案=Singing
DELETE FROM junior_grammar_questions WHERE id = 'a6a45272-97df-4c54-89f8-525e54627ad9';  -- sort9001 答案=meat; bamboo
DELETE FROM junior_grammar_questions WHERE id = 'e7276c88-709b-40e9-972a-3b030a08cea2';  -- sort9004 答案=Australia
DELETE FROM junior_grammar_questions WHERE id = '3a0a3473-e5aa-4b5a-b0e9-62cc7c28aad6';  -- sort9014 答案=protect
DELETE FROM junior_grammar_questions WHERE id = '42f618f3-4fb8-40cb-95dc-2f92c8c340d7';  -- sort9024 答案=hide
DELETE FROM junior_grammar_questions WHERE id = 'b3bf7a6b-69e4-45a8-89e0-924793724b09';  -- sort9027 答案=save
DELETE FROM junior_grammar_questions WHERE id = '93266538-df01-41ce-92ef-d38b07127c03';  -- sort9038 答案=stop
DELETE FROM junior_grammar_questions WHERE id = '6f3978ce-64c6-43a1-85ed-8ac182f42553';  -- sort9241 答案=hurt
DELETE FROM junior_grammar_questions WHERE id = '4d5dc117-56d7-4a6f-8ef4-186630c784dd';  -- sort9245 答案=swimming
DELETE FROM junior_grammar_questions WHERE id = 'a17bad01-db57-46f5-870a-6c05e04bbc9a';  -- sort9307 答案=order
DELETE FROM junior_grammar_questions WHERE id = '27a3d5a0-9e59-418e-8e10-ef062c0ddefb';  -- sort9308 答案=give
DELETE FROM junior_grammar_questions WHERE id = '644d2e0f-8011-4069-b064-0f9a4ff8633f';  -- sort9344 答案=order
DELETE FROM junior_grammar_questions WHERE id = '89c21b75-d5df-4e84-83ab-2e75c801bd3f';  -- sort9404 答案=making
DELETE FROM junior_grammar_questions WHERE id = 'b7687dff-95df-48a9-a706-57fccc733182';  -- sort9601 答案=experience
DELETE FROM junior_grammar_questions WHERE id = '026a382d-bb32-4d35-b250-577bdb413389';  -- sort9602 答案=surprise
DELETE FROM junior_grammar_questions WHERE id = '31d44077-285b-4bf4-bef0-a8f775dab22e';  -- sort9621 答案=moment
DELETE FROM junior_grammar_questions WHERE id = '4b4a5e1f-bf2e-4714-8da6-184095c13ec3';  -- sort9622 答案=lucky
DELETE FROM junior_grammar_questions WHERE id = '696316fb-2b29-4e9a-9cdd-0dbb5d0dff28';  -- sort9641 答案=moment
DELETE FROM junior_grammar_questions WHERE id = 'ae96ad60-1fd7-4df1-a4d3-d4fbdc054086';  -- sort9642 答案=proud
DELETE FROM junior_grammar_questions WHERE id = '94c973eb-4464-446c-94bd-618baeeb746c';  -- sort9709 答案=asleep
DELETE FROM junior_grammar_questions WHERE id = '8429dc15-b9d9-4727-87c2-1cef1521b031';  -- sort9731 答案=rest
-- ↑↑↑ DELETE 结束 (共26道) ↑↑↑

-- 补 28 道动词搭配题解析 (只 SET explanation)
UPDATE junior_grammar_questions SET explanation = 'like + **doing**(like playing sports);weekends 用 **on**。' WHERE id = '00755a8d-c06a-40a4-be81-2c9cd1e40568';  -- sort8004
UPDATE junior_grammar_questions SET explanation = '疑问句用 **any**(Do you have any…);肯定句用 **some**(I have some…)。' WHERE id = '74b0fe8a-d8fa-42ba-9cac-59b0fc17d0d1';  -- sort8107
UPDATE junior_grammar_questions SET explanation = 'help sb (to) do,常省 to→help us **learn**(原形)。' WHERE id = '5c6020a5-6f64-4039-80d2-87df8dc5a8a3';  -- sort8214
UPDATE junior_grammar_questions SET explanation = 'teach sb **to** do(教某人做)→teaches us **to** think。' WHERE id = '365eb3c0-0100-40ff-bd04-0cd7247257b4';  -- sort8421
UPDATE junior_grammar_questions SET explanation = 'help us **develop**(help sb do,原形)。' WHERE id = 'f7ab0e48-93dd-439e-8f04-66cfd0e4abe1';  -- sort8431
UPDATE junior_grammar_questions SET explanation = 'enjoy + **doing**→enjoys **reading**。' WHERE id = '53149e5e-0118-4665-b2e7-2a584928ffea';  -- sort8523
UPDATE junior_grammar_questions SET explanation = 'clean up 是可分短语动词,代词 them 必须放中间→**clean them up**(不能 clean up them)。' WHERE id = 'bb12470b-6912-4998-9fb8-259f578c2570';  -- sort9103
UPDATE junior_grammar_questions SET explanation = '宾语是名词(bedroom)→**clean up** your bedroom(名词可放后)。' WHERE id = '360f176c-6f01-455f-8378-e6c03aa742cb';  -- sort9114
UPDATE junior_grammar_questions SET explanation = 'ask sb **to** do→asks me **to read**。' WHERE id = '01dfda98-1656-46a0-82d9-073de0223da2';  -- sort9117
UPDATE junior_grammar_questions SET explanation = '**clean up** my books(宾语名词放后)。' WHERE id = '048441fa-e125-49e8-9a23-fbf2fa76ae8f';  -- sort9125
UPDATE junior_grammar_questions SET explanation = 'forget **to** do(忘记去做)→forget **to wash**。' WHERE id = 'ecf27b3a-7ad5-435b-97f2-80d1760b07ee';  -- sort9128
UPDATE junior_grammar_questions SET explanation = 'help us **keep**(help sb do,原形)。' WHERE id = 'f6c402a8-00fe-4db9-82d0-12987473dac2';  -- sort9201
UPDATE junior_grammar_questions SET explanation = 'make sb **do**(原形)→makes me **feel**。' WHERE id = 'b99a835d-0f79-4a81-9eee-be34ffd6ec52';  -- sort9206
UPDATE junior_grammar_questions SET explanation = 'It is important **to** do→important **to develop**。' WHERE id = '9b24b66a-9669-46ef-b3a4-baa2052481e2';  -- sort9209
UPDATE junior_grammar_questions SET explanation = 'enjoy + **doing**→enjoys **playing**。' WHERE id = '62805ca1-6df3-47a5-9eac-a9f26a06d48c';  -- sort9210
UPDATE junior_grammar_questions SET explanation = '**do** exercise(做运动,固定用 do,不用 make)。' WHERE id = '9b0bee73-3dc5-463d-b8f4-941bccb64e60';  -- sort9211
UPDATE junior_grammar_questions SET explanation = '**do** a warm-up(做热身,用 do)。' WHERE id = 'bbf574c0-d5e1-4c80-9123-2b4c0a419878';  -- sort9223
UPDATE junior_grammar_questions SET explanation = 'teach sb **to** do→teaches us **to exercise**。' WHERE id = '4a259118-67d9-4e6a-a650-c106939c58c0';  -- sort9228
UPDATE junior_grammar_questions SET explanation = 'enjoy + **doing**→enjoys **kicking**。' WHERE id = '5f67180c-dc2b-44c9-b660-966b14e8bd6d';  -- sort9230
UPDATE junior_grammar_questions SET explanation = 'make sb **feel**(原形)。' WHERE id = 'a101c5bb-a8a6-4568-a019-3123df7e28d7';  -- sort9246
UPDATE junior_grammar_questions SET explanation = 'It is a good habit **to** do→habit **to get up**。' WHERE id = 'f4f8c561-3208-4666-bc7a-7e9f7744d7e8';  -- sort9249
UPDATE junior_grammar_questions SET explanation = 'love + **doing**→loves **joining**。' WHERE id = '3c286f5e-190d-4598-b40e-80d45fd67779';  -- sort9250
UPDATE junior_grammar_questions SET explanation = 'have fun **doing**→have fun **making**。' WHERE id = '8059afdb-ce73-49e1-8972-215e27370278';  -- sort9510
UPDATE junior_grammar_questions SET explanation = '"躺下"用不及物动词 **lie**(lie down);lay 是"放置"或 lie 的过去式。' WHERE id = '1cf98084-3148-4e06-aec9-dca8a06931db';  -- sort9711
UPDATE junior_grammar_questions SET explanation = 'turn **off** the TV(关电视;turn on 开 / turn off 关)。' WHERE id = '0823e466-4a87-4c28-a60b-b77c5e6cbada';  -- sort9723
UPDATE junior_grammar_questions SET explanation = '介词 without + **doing**→without **knocking**。' WHERE id = '7c2ff326-5346-4ad9-b45e-918ed5ba86bc';  -- sort9724
UPDATE junior_grammar_questions SET explanation = 'make sb **do**(原形)→made me **cry**。' WHERE id = '145959fc-67e3-455a-a7cc-99a61078cb84';  -- sort9746
UPDATE junior_grammar_questions SET explanation = 'decide to **lie** down(躺下,原形 lie)。' WHERE id = '0f47e4ba-774d-45a5-8259-ca829a13cf4e';  -- sort9751

-- 语句数: DELETE 26 + UPDATE 28 = 54条
-- 校验(单独跑): 删26+补28后, t20 mcq缺解析应0
SELECT count(*) FROM junior_grammar_questions WHERE point_id='d565b705-65ea-4fa3-8fa9-2f0e5744deb1' AND question_type='mcq' AND (explanation IS NULL OR explanation='');

-- END OF FILE t20-expl.sql
