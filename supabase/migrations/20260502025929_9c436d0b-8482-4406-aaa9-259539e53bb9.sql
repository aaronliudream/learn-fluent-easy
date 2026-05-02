ALTER TABLE public.gaokao_vocab
  ADD COLUMN IF NOT EXISTS phonetic text,
  ADD COLUMN IF NOT EXISTS star_level integer NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS cet_level text,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_gaokao_vocab_sort_order ON public.gaokao_vocab(sort_order);
CREATE UNIQUE INDEX IF NOT EXISTS idx_gaokao_vocab_word_unique ON public.gaokao_vocab(word);