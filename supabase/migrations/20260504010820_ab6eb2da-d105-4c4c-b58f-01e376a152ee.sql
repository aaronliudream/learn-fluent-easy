ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS daily_goal_minutes integer NOT NULL DEFAULT 15,
  ADD COLUMN IF NOT EXISTS recall_email_sent_at timestamptz;