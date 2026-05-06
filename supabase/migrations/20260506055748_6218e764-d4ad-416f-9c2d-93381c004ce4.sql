ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS lessons_per_week smallint NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS study_days smallint[] NOT NULL DEFAULT ARRAY[1,3,5]::smallint[];

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_lessons_per_week_chk CHECK (lessons_per_week BETWEEN 1 AND 7);