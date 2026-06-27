-- 必修一 U2 语法:换掉不地道的 'is catching the flight' 题 → 'am taking the night train'(take 比 catch 适合进行时表将来)。保留答案位 C,分布不变。Aaron 跑。
BEGIN;
UPDATE public.junior_grammar_questions
SET stem='"I ____ the night train to the coast tonight; I have already booked a bed."', option_a='took', option_b='take', option_c='am taking', option_d='was taking', correct_answer='C',
    explanation='已定安排(已订卧铺)→ 现在进行时表将来 am taking;take a train 比 catch a flight 更适合进行时表将来(catch 有瞬间性,进行时不地道)。'
WHERE id='bc9c92d9-60fc-4741-9733-b2baf6b0f229';
COMMIT;
-- 校验(自带):应显示新题面 + correct_answer=C;catch_flight_left 应=0
SELECT stem, correct_answer AS ans, option_c AS correct_option FROM public.junior_grammar_questions WHERE id='bc9c92d9-60fc-4741-9733-b2baf6b0f229';
SELECT count(*) AS catch_flight_left FROM public.junior_grammar_questions WHERE point_id IN (SELECT id FROM public.junior_grammar_points WHERE volume='required1' AND unit='U2') AND (stem ILIKE '%catch%' OR option_a ILIKE '%catching%' OR option_b ILIKE '%catching%' OR option_c ILIKE '%catching%' OR option_d ILIKE '%catching%');
