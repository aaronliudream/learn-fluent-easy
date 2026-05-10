ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS recommended_grade smallint
  CHECK (recommended_grade IS NULL OR (recommended_grade BETWEEN 1 AND 6));