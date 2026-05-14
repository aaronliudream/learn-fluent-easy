DELETE FROM public.ai_generated_questions
WHERE kp_id IN (
  SELECT id FROM public.gaokao_grammar_points WHERE slug = 'a1-04-dan-fu-shu-tong-xing-ming-ci'
);