ALTER TABLE public.slang_mastery
ADD COLUMN IF NOT EXISTS last_correct_at timestamptz;