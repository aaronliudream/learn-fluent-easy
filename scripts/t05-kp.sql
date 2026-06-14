-- ============================================================
-- t05 一般现在时 拆4kp 框架 (只建kp,不标kp_id)
-- point_id subselect g7-t05; WHERE NOT EXISTS by code 幂等
-- ============================================================

INSERT INTO junior_knowledge_points (id, point_id, code, title, summary, sort_order, target_count)
SELECT 'ef2879a5-a18b-496d-97de-6a0adfc2f48a', (SELECT id FROM junior_grammar_points WHERE code='g7-t05'), 'g7-t05-3sg', '第三人称单数(动词+s/es、have→has、主谓一致)', NULL, 1, 20
WHERE NOT EXISTS (SELECT 1 FROM junior_knowledge_points WHERE code = 'g7-t05-3sg');

INSERT INTO junior_knowledge_points (id, point_id, code, title, summary, sort_order, target_count)
SELECT '2d7eaa58-c0ef-4d3b-91a0-56ca9698e4f2', (SELECT id FROM junior_grammar_points WHERE code='g7-t05'), 'g7-t05-q', '一般疑问与简答(Do/Does...?、Yes/No简答、特殊疑问提问)', NULL, 2, 20
WHERE NOT EXISTS (SELECT 1 FROM junior_knowledge_points WHERE code = 'g7-t05-q');

INSERT INTO junior_knowledge_points (id, point_id, code, title, summary, sort_order, target_count)
SELECT 'f44bded1-08db-4c95-92ac-0526026451e9', (SELECT id FROM junior_grammar_points WHERE code='g7-t05'), 'g7-t05-neg', '否定句(don''t/doesn''t)', NULL, 3, 20
WHERE NOT EXISTS (SELECT 1 FROM junior_knowledge_points WHERE code = 'g7-t05-neg');

INSERT INTO junior_knowledge_points (id, point_id, code, title, summary, sort_order, target_count)
SELECT '92850b5c-07a8-4d9a-a59e-9a86490cede1', (SELECT id FROM junior_grammar_points WHERE code='g7-t05'), 'g7-t05-aff', '肯定陈述与主谓一致(I/we/they+原形、be一致、表真理习惯)', NULL, 4, 20
WHERE NOT EXISTS (SELECT 1 FROM junior_knowledge_points WHERE code = 'g7-t05-aff');

-- 校验: 应4行
SELECT count(*) AS n, code FROM junior_knowledge_points WHERE code LIKE 'g7-t05-%' GROUP BY code ORDER BY code;
