ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS streak_recall_sent_at timestamptz;