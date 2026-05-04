-- Extend junior_grammar_questions to support fill-in / translation / transform / correction
ALTER TABLE public.junior_grammar_questions
  ADD COLUMN IF NOT EXISTS question_type text NOT NULL DEFAULT 'mcq',
  ADD COLUMN IF NOT EXISTS accepted_answers text[] DEFAULT NULL;

ALTER TABLE public.junior_grammar_questions
  ALTER COLUMN option_a DROP NOT NULL,
  ALTER COLUMN option_b DROP NOT NULL,
  ALTER COLUMN option_c DROP NOT NULL,
  ALTER COLUMN option_d DROP NOT NULL,
  ALTER COLUMN correct_answer DROP NOT NULL;

-- Allow values: mcq, fill, transform, translation, correction
ALTER TABLE public.junior_grammar_questions
  DROP CONSTRAINT IF EXISTS junior_grammar_questions_qtype_chk;
ALTER TABLE public.junior_grammar_questions
  ADD CONSTRAINT junior_grammar_questions_qtype_chk
  CHECK (question_type IN ('mcq','fill','transform','translation','correction'));

CREATE INDEX IF NOT EXISTS idx_jgq_point_type ON public.junior_grammar_questions(point_id, question_type);