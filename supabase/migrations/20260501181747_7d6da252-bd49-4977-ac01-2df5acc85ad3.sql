-- Favorites
CREATE TABLE public.saved_phrases (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  phrase text NOT NULL,
  normalized text NOT NULL,
  context_text text,
  source text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, normalized)
);

CREATE INDEX idx_saved_phrases_user ON public.saved_phrases(user_id, created_at DESC);

ALTER TABLE public.saved_phrases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own saved phrases"
  ON public.saved_phrases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own saved phrases"
  ON public.saved_phrases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own saved phrases"
  ON public.saved_phrases FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own saved phrases"
  ON public.saved_phrases FOR DELETE
  USING (auth.uid() = user_id);

-- Cache for spoken rewrites
CREATE TABLE public.line_rewrites (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original text NOT NULL,
  normalized text NOT NULL,
  target_lang text NOT NULL DEFAULT 'zh-v1',
  rewrites jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (normalized, target_lang)
);

CREATE INDEX idx_line_rewrites_norm ON public.line_rewrites(normalized, target_lang);

ALTER TABLE public.line_rewrites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Line rewrites are public readable"
  ON public.line_rewrites FOR SELECT USING (true);

CREATE POLICY "Service role can insert line rewrites"
  ON public.line_rewrites FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update line rewrites"
  ON public.line_rewrites FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER update_line_rewrites_updated_at
BEFORE UPDATE ON public.line_rewrites
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();