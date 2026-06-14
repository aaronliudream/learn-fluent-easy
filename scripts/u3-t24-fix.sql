-- ============================================================
-- g7-t24: 替换 3 道语法术语题为地道频率题 (只改 stem/opts/ans/explanation)
-- WHERE id 定位; 不动 id/kp_id/point_id/sort_order
-- ============================================================

-- 替换 #1 (id=1c95a73d-f48a-4c39-bf77-0c25d6f2b6ce)
UPDATE junior_grammar_questions SET
  stem = 'My grandpa is healthy because he ___ does morning exercises.',
  option_a = 'always', option_b = 'never', option_c = 'badly', option_d = 'hardly',
  correct_answer = 'A',
  explanation = '他健康→**always**总是做晨练。always=总是,表高频率。'
WHERE id = '1c95a73d-f48a-4c39-bf77-0c25d6f2b6ce';

-- 替换 #2 (id=1efaa5a7-dbbf-452b-ad81-e1bb566e0311)
UPDATE junior_grammar_questions SET
  stem = '— Do you often eat snacks? — No, I ___ eat them. I prefer fruit.',
  option_a = 'always', option_b = 'usually', option_c = 'seldom', option_d = 'often',
  correct_answer = 'C',
  explanation = '更爱水果→**seldom**很少吃零食。seldom=很少。'
WHERE id = '1efaa5a7-dbbf-452b-ad81-e1bb566e0311';

-- 替换 #3 (id=762da5bb-3dcf-48a2-9f94-1f4fa7161a1b)
UPDATE junior_grammar_questions SET
  stem = '— How often do you go running? — ___ a week, on Monday and Friday.',
  option_a = 'One time', option_b = 'Twice', option_c = 'Second', option_d = 'Once time',
  correct_answer = 'B',
  explanation = '周一周五→一周两次=**Twice** a week。twice=两次。'
WHERE id = '762da5bb-3dcf-48a2-9f94-1f4fa7161a1b';

-- 校验①: 3 题新 stem/答案在库
SELECT sort_order, correct_answer, stem FROM junior_grammar_questions WHERE id IN ('1c95a73d-f48a-4c39-bf77-0c25d6f2b6ce','1efaa5a7-dbbf-452b-ad81-e1bb566e0311','762da5bb-3dcf-48a2-9f94-1f4fa7161a1b') ORDER BY sort_order;

-- 校验②: 旧语法术语题应已全部消失 (应 0)
SELECT count(*) FROM junior_grammar_questions WHERE point_id=(SELECT id FROM junior_grammar_points WHERE code='g7-t24') AND (stem LIKE 'Frequency adverbs%' OR stem = 'How often is used to ask about ___.');
