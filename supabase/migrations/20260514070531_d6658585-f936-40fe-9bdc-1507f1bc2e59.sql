
-- Step 1: add year_band smallint to 4 tables (1=高一, 2=高二, 3=高三, NULL=通用)
ALTER TABLE public.gaokao_grammar_questions ADD COLUMN IF NOT EXISTS year_band smallint;
ALTER TABLE public.gaokao_reading_articles  ADD COLUMN IF NOT EXISTS year_band smallint;
ALTER TABLE public.gaokao_cloze_passages    ADD COLUMN IF NOT EXISTS year_band smallint;
ALTER TABLE public.gaokao_vocab             ADD COLUMN IF NOT EXISTS year_band smallint;

CREATE INDEX IF NOT EXISTS idx_gaokao_grammar_q_year_band  ON public.gaokao_grammar_questions(year_band);
CREATE INDEX IF NOT EXISTS idx_gaokao_reading_art_year_band ON public.gaokao_reading_articles(year_band);
CREATE INDEX IF NOT EXISTS idx_gaokao_cloze_pass_year_band  ON public.gaokao_cloze_passages(year_band);
CREATE INDEX IF NOT EXISTS idx_gaokao_vocab_year_band       ON public.gaokao_vocab(year_band);

-- Step 2: backfill ----------------------------------------------------

-- 2a. gaokao_grammar_questions: tertiles by irt_difficulty (fallback difficulty, then 2)
WITH ranked AS (
  SELECT id,
         COALESCE(irt_difficulty::numeric, difficulty::numeric) AS d
  FROM public.gaokao_grammar_questions
),
cuts AS (
  SELECT
    percentile_cont(0.3333) WITHIN GROUP (ORDER BY d) AS p33,
    percentile_cont(0.6666) WITHIN GROUP (ORDER BY d) AS p66
  FROM ranked WHERE d IS NOT NULL
)
UPDATE public.gaokao_grammar_questions q
SET year_band = CASE
  WHEN r.d IS NULL THEN 2
  WHEN r.d <= c.p33 THEN 1
  WHEN r.d <= c.p66 THEN 2
  ELSE 3
END
FROM ranked r, cuts c
WHERE q.id = r.id;

-- 2b. gaokao_reading_articles: prefer existing text grade_band, else difficulty rule
UPDATE public.gaokao_reading_articles
SET year_band = CASE
  WHEN grade_band = 'g1' THEN 1
  WHEN grade_band = 'g2' THEN 2
  WHEN grade_band = 'g3' THEN 3
  WHEN grade_band = 'gaokao' THEN 3
  WHEN difficulty IS NULL THEN 2
  WHEN difficulty <= 2 THEN 1
  WHEN difficulty <= 3 THEN 2  -- (2.0,3.5] -> 2; integer column so <=3 covers 3
  ELSE 3
END;

-- 2c. gaokao_cloze_passages: by difficulty (integer)
UPDATE public.gaokao_cloze_passages
SET year_band = CASE
  WHEN difficulty IS NULL THEN 2
  WHEN difficulty <= 2 THEN 1
  WHEN difficulty <= 3 THEN 2
  ELSE 3
END;

-- 2d. gaokao_vocab: by freq_rank
UPDATE public.gaokao_vocab
SET year_band = CASE
  WHEN freq_rank IS NULL THEN 1
  WHEN freq_rank <= 1500 THEN 1
  WHEN freq_rank <= 2800 THEN 2
  ELSE 3
END;
