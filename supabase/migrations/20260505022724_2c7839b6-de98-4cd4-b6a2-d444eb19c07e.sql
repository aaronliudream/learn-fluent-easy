
-- ===== knowledge_cards =====
CREATE TABLE public.knowledge_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  slug TEXT NOT NULL UNIQUE,
  question TEXT NOT NULL,
  short_answer TEXT NOT NULL,
  explanation TEXT NOT NULL,
  examples JSONB NOT NULL DEFAULT '[]'::jsonb,
  common_mistakes JSONB NOT NULL DEFAULT '[]'::jsonb,
  quiz JSONB NOT NULL DEFAULT '[]'::jsonb,
  tags TEXT[] NOT NULL DEFAULT '{}',
  language TEXT NOT NULL DEFAULT 'en',
  status TEXT NOT NULL DEFAULT 'published',
  view_count INTEGER NOT NULL DEFAULT 0,
  like_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_kc_status_created ON public.knowledge_cards(status, created_at DESC);
CREATE INDEX idx_kc_author ON public.knowledge_cards(author_id);
CREATE INDEX idx_kc_tags ON public.knowledge_cards USING GIN(tags);

ALTER TABLE public.knowledge_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published cards are public"
  ON public.knowledge_cards FOR SELECT
  USING (status = 'published' OR author_id = auth.uid());

CREATE POLICY "Users insert own cards"
  ON public.knowledge_cards FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors update own cards"
  ON public.knowledge_cards FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Authors delete own cards"
  ON public.knowledge_cards FOR DELETE
  USING (auth.uid() = author_id);

-- ===== card_likes =====
CREATE TABLE public.card_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES public.knowledge_cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(card_id, user_id)
);
CREATE INDEX idx_card_likes_card ON public.card_likes(card_id);

ALTER TABLE public.card_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes readable by all"
  ON public.card_likes FOR SELECT USING (true);
CREATE POLICY "Users insert own likes"
  ON public.card_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own likes"
  ON public.card_likes FOR DELETE USING (auth.uid() = user_id);

-- ===== card_views =====
CREATE TABLE public.card_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES public.knowledge_cards(id) ON DELETE CASCADE,
  viewer_id UUID,
  ref_user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_card_views_card ON public.card_views(card_id, created_at DESC);

ALTER TABLE public.card_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record a view"
  ON public.card_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Authors see views on their cards"
  ON public.card_views FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.knowledge_cards kc WHERE kc.id = card_id AND kc.author_id = auth.uid())
  );

-- ===== Triggers =====
CREATE TRIGGER trg_kc_updated
  BEFORE UPDATE ON public.knowledge_cards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.bump_card_like_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.knowledge_cards SET like_count = like_count + 1 WHERE id = NEW.card_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.knowledge_cards SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.card_id;
  END IF;
  RETURN NULL;
END $$;

CREATE TRIGGER trg_card_like_count
  AFTER INSERT OR DELETE ON public.card_likes
  FOR EACH ROW EXECUTE FUNCTION public.bump_card_like_count();

CREATE OR REPLACE FUNCTION public.bump_card_view_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.knowledge_cards SET view_count = view_count + 1 WHERE id = NEW.card_id;
  RETURN NULL;
END $$;

CREATE TRIGGER trg_card_view_count
  AFTER INSERT ON public.card_views
  FOR EACH ROW EXECUTE FUNCTION public.bump_card_view_count();
