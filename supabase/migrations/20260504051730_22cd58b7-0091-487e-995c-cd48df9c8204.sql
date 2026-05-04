ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS learning_goal text,
  ADD COLUMN IF NOT EXISTS self_level text,
  ADD COLUMN IF NOT EXISTS onboarded_at timestamptz;