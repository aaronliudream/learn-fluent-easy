-- Learning events for weekly report
CREATE TABLE IF NOT EXISTS public.learning_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('lesson_complete','quiz','study_minutes','vocab_learned')),
  -- generic metric fields
  lesson_key text,
  quiz_correct integer DEFAULT 0,
  quiz_total integer DEFAULT 0,
  study_minutes integer DEFAULT 0,
  vocab_count integer DEFAULT 0,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS learning_events_user_created_idx
  ON public.learning_events (user_id, created_at DESC);

ALTER TABLE public.learning_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own events"
  ON public.learning_events FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own events"
  ON public.learning_events FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Weekly email preferences on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS weekly_report_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS preferred_language text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS last_weekly_report_at timestamptz;
