CREATE TABLE IF NOT EXISTS public.primary_badges_earned (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id text NOT NULL,
  earned_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, badge_id)
);

ALTER TABLE public.primary_badges_earned ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users see own badges"
  ON public.primary_badges_earned
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users insert own badges"
  ON public.primary_badges_earned
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users delete own badges"
  ON public.primary_badges_earned
  FOR DELETE
  USING (auth.uid() = user_id);