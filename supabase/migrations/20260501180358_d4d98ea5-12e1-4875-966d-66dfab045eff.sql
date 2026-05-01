CREATE TABLE public.phrase_explanations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phrase text NOT NULL,
  normalized text NOT NULL,
  source_lang text NOT NULL DEFAULT 'en',
  target_lang text NOT NULL DEFAULT 'zh',
  explanation jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (normalized, target_lang)
);

CREATE INDEX idx_phrase_explanations_norm ON public.phrase_explanations(normalized, target_lang);

ALTER TABLE public.phrase_explanations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Phrase explanations are public readable"
  ON public.phrase_explanations FOR SELECT USING (true);

CREATE POLICY "Service role can insert phrase explanations"
  ON public.phrase_explanations FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update phrase explanations"
  ON public.phrase_explanations FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER update_phrase_explanations_updated_at
BEFORE UPDATE ON public.phrase_explanations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();