-- t19/t09/t17 补缺解析 (3 point 合一); 只 SET explanation

-- t19 反身/不定代词 (4道)
UPDATE junior_grammar_questions SET explanation = '疑问句中"一些"用 **any**(some 多用于肯定句):Do you have any hobbies?' WHERE id = 'a956a7b8-53da-4e2c-96f0-bbadb7cd80bc';  -- sort8422
UPDATE junior_grammar_questions SET explanation = '疑问句中"任何事"用 **anything**(something 用于肯定句):know anything about…?' WHERE id = '51814560-bb00-411b-ba66-03717d2bd1dc';  -- sort8432
UPDATE junior_grammar_questions SET explanation = '"其他人"用 **others**(=other people,名词性):work with others。' WHERE id = 'ff30ae1d-7163-4447-aa86-9e1dfdc5ae5b';  -- sort9233
UPDATE junior_grammar_questions SET explanation = '"互相/彼此"用 **each other**:work with each other。' WHERE id = '1f493506-89ca-4ecc-b0cc-67d53385737b';  -- sort9254

-- t09 指示代词 (1道)
UPDATE junior_grammar_questions SET explanation = 'your brothers 是复数→指示代词用复数 **these**(this 单数 / these 复数)。' WHERE id = '48cc4fb8-bbbc-4078-a5e6-9de0cbc67290';  -- sort8112

-- t17 比较级 (1道)
UPDATE junior_grammar_questions SET explanation = 'grow **taller** and stronger=长得更高更壮(taller 是 tall 的比较级,与 stronger 并列)。' WHERE id = '5c124eea-7172-4773-bdc9-fa6fccbbc393';  -- sort9221

-- 语句数: 6 UPDATE
-- 校验(单独跑): 3 point mcq缺解析应0
SELECT p.code, count(*) FROM junior_grammar_questions q JOIN junior_grammar_points p ON q.point_id=p.id WHERE p.code IN ('g7-t19','g7-t09','g7-t17') AND q.question_type='mcq' AND (q.explanation IS NULL OR q.explanation='') GROUP BY p.code;

-- END OF FILE t19-t09-t17-expl.sql
