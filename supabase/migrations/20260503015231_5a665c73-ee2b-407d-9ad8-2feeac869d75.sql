
CREATE TABLE public.primary_vocab (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word text NOT NULL,
  pos text,
  meaning_cn text NOT NULL,
  example_en text,
  example_cn text,
  tip text,
  theme text,
  grade int NOT NULL CHECK (grade BETWEEN 1 AND 6),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_primary_vocab_grade ON public.primary_vocab(grade);
CREATE INDEX idx_primary_vocab_theme ON public.primary_vocab(theme);
ALTER TABLE public.primary_vocab ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read primary vocab" ON public.primary_vocab FOR SELECT USING (true);

CREATE TABLE public.primary_game_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  game_type text NOT NULL,
  grade int,
  score int NOT NULL DEFAULT 0,
  accuracy real,
  duration_ms int,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_pgs_user ON public.primary_game_scores(user_id);
CREATE INDEX idx_pgs_game ON public.primary_game_scores(game_type, grade);
ALTER TABLE public.primary_game_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read game scores" ON public.primary_game_scores FOR SELECT USING (true);
CREATE POLICY "Users insert own scores" ON public.primary_game_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own scores" ON public.primary_game_scores FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own scores" ON public.primary_game_scores FOR DELETE USING (auth.uid() = user_id);
