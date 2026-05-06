ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS quiz_session_size smallint NOT NULL DEFAULT 6,
  ADD COLUMN IF NOT EXISTS quiz_type_mix jsonb NOT NULL DEFAULT '{"en2cn":2,"cn2en":2,"listen2en":2}'::jsonb;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_quiz_session_size_chk CHECK (quiz_session_size BETWEEN 4 AND 12);