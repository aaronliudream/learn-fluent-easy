-- t03 冠词 补缺解析; 只 SET explanation

UPDATE junior_grammar_questions SET explanation = '国家全称用 **the**(the UK);语言名前**不用**冠词(English)。' WHERE id = '43ca211e-9b3f-4f8c-934c-3509f57f1df3';  -- sort103
UPDATE junior_grammar_questions SET explanation = '乐器前用 **the**:play **the** piano。' WHERE id = '69d79801-ee43-4443-91f5-11c730674aef';  -- sort8013
UPDATE junior_grammar_questions SET explanation = 'photo 辅音音素→**a** photo;物主代词 **my** 直接修饰 family(不再加冠词)。' WHERE id = 'bad488cc-99ab-40ed-83a1-28662604eb9a';  -- sort8110
UPDATE junior_grammar_questions SET explanation = 'your uncle(物主);English 以**元音音素**开头→**an** English teacher。' WHERE id = '4cc3524f-659f-4f88-87b1-c13cf8644444';  -- sort8120
UPDATE junior_grammar_questions SET explanation = 'English class 以元音音素开头→**an** English class。' WHERE id = '8873a9a2-f050-4bc3-95f2-96556d5e51fa';  -- sort8334
UPDATE junior_grammar_questions SET explanation = '**a** great way(great 辅音音素);show **your** talent(物主代词)。' WHERE id = '2ab9610b-b4d1-4275-94ca-8c74cdd5cd91';  -- sort8434
UPDATE junior_grammar_questions SET explanation = '**an** elephant(元音音素,首次提及);第二次特指→**The** elephant。' WHERE id = '79741ead-b300-45c8-86a8-c5df21cac729';  -- sort9000
UPDATE junior_grammar_questions SET explanation = '**a** farm、**a** dog(均辅音,首次提及)。' WHERE id = 'e379ba77-c1f6-47d1-a92b-0f5aa00dbb22';  -- sort9010
UPDATE junior_grammar_questions SET explanation = '**an** interesting movie(interesting 元音)、**an** animal park(animal 元音)。' WHERE id = 'f4b143ab-4a10-4d10-930a-9b339d6e248f';  -- sort9020
UPDATE junior_grammar_questions SET explanation = '**a** small rabbit(首次,辅音);第二次特指→**the** rabbit。' WHERE id = 'eb30038b-90bb-4c67-9303-2563cb2f5195';  -- sort9030
UPDATE junior_grammar_questions SET explanation = '球类运动前**不用**冠词(play basketball);乐器前用 **the**(play the violin)。' WHERE id = '814ba3a8-1a1b-4786-ba60-8c53a79e4a42';  -- sort9203
UPDATE junior_grammar_questions SET explanation = '乐器用 **the**(play the guitar);球类**不用**冠词(play badminton)。' WHERE id = '02b994b3-a9f0-4dc0-8a9c-26ce7ba78ba3';  -- sort9224
UPDATE junior_grammar_questions SET explanation = '特指桌下那个篮球→**the** basketball;泛指打篮球运动→**不用**冠词。' WHERE id = 'fb6238d5-ab06-4de7-8c28-8cc5fd3862de';  -- sort9243
UPDATE junior_grammar_questions SET explanation = 'apple 元音音素→**an** apple。' WHERE id = 'ace75520-7005-4bed-9f51-8f79f1291570';  -- sort9300
UPDATE junior_grammar_questions SET explanation = '**a** bowl of(辅音);三餐(lunch)前**不用**冠词。' WHERE id = '44c5d423-9793-4a78-bade-dad892c77368';  -- sort9320
UPDATE junior_grammar_questions SET explanation = '**an** egg(元音);**a** quick way(quick /kw/ 辅音音素)。' WHERE id = 'b5dbb4f7-365e-4c24-8f93-5f6bafbacd21';  -- sort9340
UPDATE junior_grammar_questions SET explanation = 'special 辅音音素→**a** special day。' WHERE id = '140bf086-f81f-491b-9c96-448c4f5093f1';  -- sort9600
UPDATE junior_grammar_questions SET explanation = 'online 元音音素→**an** online meeting。' WHERE id = 'f50b77e9-5a44-4842-a295-7816d7fd0498';  -- sort9620
UPDATE junior_grammar_questions SET explanation = 'unforgettable 元音音素→**an** unforgettable experience。' WHERE id = 'bbcb3258-f4bb-4562-a94b-6fb44c716935';  -- sort9640
UPDATE junior_grammar_questions SET explanation = '特指那个故事(about the magic beans)→**the** story;**an** exciting story(exciting 元音)。' WHERE id = '2860c33c-44cd-4e3f-a99f-27008f35cc94';  -- sort9720

-- 语句数: 20 UPDATE
-- 校验(单独跑): mcq缺解析应0
SELECT count(*) FROM junior_grammar_questions WHERE point_id='1a83a73f-5d50-4eb2-a097-554b5a7446c0' AND question_type='mcq' AND (explanation IS NULL OR explanation='');

-- END OF FILE t03-expl.sql
