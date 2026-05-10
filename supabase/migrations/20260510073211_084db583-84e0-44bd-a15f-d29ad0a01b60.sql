CREATE TABLE public.quiz_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  scope_key TEXT NOT NULL,
  consecutive_count INTEGER NOT NULL DEFAULT 0,
  challenge_unlocked BOOLEAN NOT NULL DEFAULT false,
  last_completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, scope_key)
);

ALTER TABLE public.quiz_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own streaks" ON public.quiz_streaks
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own streaks" ON public.quiz_streaks
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own streaks" ON public.quiz_streaks
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own streaks" ON public.quiz_streaks
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_quiz_streaks_user_scope
  ON public.quiz_streaks(user_id, scope_key);

CREATE TRIGGER update_quiz_streaks_updated_at
  BEFORE UPDATE ON public.quiz_streaks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();