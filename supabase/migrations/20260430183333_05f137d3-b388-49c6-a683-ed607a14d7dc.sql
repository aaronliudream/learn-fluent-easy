
CREATE TABLE public.placement_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cefr TEXT NOT NULL,
  ability NUMERIC NOT NULL,
  weighted INTEGER NOT NULL,
  recommended_level INTEGER NOT NULL,
  by_section JSONB NOT NULL,
  weakest TEXT[] NOT NULL DEFAULT '{}',
  question_log JSONB NOT NULL DEFAULT '[]'::jsonb,
  ai_report JSONB,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.placement_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own placement results"
  ON public.placement_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own placement results"
  ON public.placement_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own placement results"
  ON public.placement_results FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own placement results"
  ON public.placement_results FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX placement_results_user_created_idx
  ON public.placement_results (user_id, created_at DESC);

CREATE TRIGGER placement_results_updated_at
  BEFORE UPDATE ON public.placement_results
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
