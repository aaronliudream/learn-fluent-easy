-- 修正 7A SU3 名词复数点(g7su3.04)里设计有误的 tomato 题:
-- 旧题 "There are many ____ plants here. (tomato)" 答案是单数 tomato(名词作定语),既不考复数还会误判。
-- 改为真正考复数的句子,答案 tomatoes。幂等(改完再跑不会重复匹配旧 stem)。
UPDATE public.junior_grammar_questions
SET stem = 'There are some ____ on the plate. (tomato)',
    option_a = 'tomato', option_b = 'tomatoes', option_c = 'a tomato', option_d = 'tomatos',
    correct_answer = 'B'
WHERE point_id = (SELECT id FROM public.junior_grammar_points WHERE code = 'g7su3.04')
  AND stem = 'There are many ____ plants here. (tomato)';
