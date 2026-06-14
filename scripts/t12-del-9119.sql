-- 删 t12 劣质题 #9119 (No camera 告示语不地道 + A/B/C全-ing唯D名词camera格式矛盾)
-- ⚠️ 单独跑此 DELETE,校验另起一次
DELETE FROM junior_grammar_questions WHERE id = '94111acb-0a9a-4b26-a361-5f9570a96978';

-- 校验(另起一次跑): 应 0
-- SELECT count(*) FROM junior_grammar_questions WHERE id = '94111acb-0a9a-4b26-a361-5f9570a96978';
