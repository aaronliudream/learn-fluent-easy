-- ============================================================
-- P0: Cohort-locked 5-step vocab mastery
-- ============================================================

-- ---- 1. Backfill primary_gloss on gaokao_vocab ----
ALTER TABLE public.gaokao_vocab
  ADD COLUMN IF NOT EXISTS primary_gloss text,
  ADD COLUMN IF NOT EXISTS theme_tag text,
  ADD COLUMN IF NOT EXISTS contrast_card jsonb;

CREATE OR REPLACE FUNCTION public._gaokao_primary_gloss_split(s text) RETURNS text AS $$
DECLARE
  i int; ch text; depth int := 0; len int;
BEGIN
  s := trim(s);
  len := length(s);
  FOR i IN 1..len LOOP
    ch := substr(s, i, 1);
    IF ch IN ('（','(') THEN depth := depth + 1;
    ELSIF ch IN ('）',')') THEN depth := greatest(0, depth - 1);
    ELSIF depth = 0 AND ch IN ('；',';','，',',','、') THEN
      RETURN trim(substr(s, 1, i - 1));
    END IF;
  END LOOP;
  RETURN s;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

UPDATE public.gaokao_vocab
   SET primary_gloss = public._gaokao_primary_gloss_split(meaning_cn)
 WHERE primary_gloss IS NULL;

ALTER TABLE public.gaokao_vocab
  ALTER COLUMN primary_gloss SET NOT NULL;

DROP FUNCTION public._gaokao_primary_gloss_split(text);

-- ---- 2. Theme tag whitelist (P2 will populate) ----
CREATE TABLE IF NOT EXISTS public.gaokao_theme_tags (
  tag         text PRIMARY KEY,
  label_cn    text NOT NULL,
  description text,
  created_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.gaokao_theme_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "theme tags public read" ON public.gaokao_theme_tags FOR SELECT USING (true);

ALTER TABLE public.gaokao_vocab
  ADD CONSTRAINT gaokao_vocab_theme_tag_fk
  FOREIGN KEY (theme_tag) REFERENCES public.gaokao_theme_tags(tag)
  ON UPDATE CASCADE ON DELETE SET NULL;

-- ---- 3. Hypercorrection flag on gaokao_user_mastery ----
ALTER TABLE public.gaokao_user_mastery
  ADD COLUMN IF NOT EXISTS hypercorrection boolean NOT NULL DEFAULT false;

-- ---- 4. Cohort status enum ----
DO $$ BEGIN
  CREATE TYPE public.cohort_status AS ENUM ('active','dormant','graduated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- 5. Active cohort table ----
CREATE TABLE IF NOT EXISTS public.gaokao_user_active_cohort (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL,
  cohort_word_ids uuid[] NOT NULL,
  status          public.cohort_status NOT NULL DEFAULT 'active',
  sequence_no     integer NOT NULL,
  theme_tag       text REFERENCES public.gaokao_theme_tags(tag) ON UPDATE CASCADE ON DELETE SET NULL,
  started_at      timestamptz NOT NULL DEFAULT now(),
  last_active_at  timestamptz NOT NULL DEFAULT now(),
  graduated_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cohort_size_chk CHECK (array_length(cohort_word_ids, 1) BETWEEN 5 AND 20)
);

CREATE UNIQUE INDEX IF NOT EXISTS gaokao_cohort_one_active_per_user
  ON public.gaokao_user_active_cohort(user_id)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS gaokao_cohort_user_status
  ON public.gaokao_user_active_cohort(user_id, status);

ALTER TABLE public.gaokao_user_active_cohort ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cohort owner select" ON public.gaokao_user_active_cohort
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "cohort owner insert" ON public.gaokao_user_active_cohort
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cohort owner update" ON public.gaokao_user_active_cohort
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "cohort owner delete" ON public.gaokao_user_active_cohort
  FOR DELETE USING (auth.uid() = user_id);

-- ---- 6. Cohort events table (replaces step_events jsonb) ----
CREATE TABLE IF NOT EXISTS public.gaokao_cohort_events (
  cohort_id  uuid NOT NULL REFERENCES public.gaokao_user_active_cohort(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL,
  vocab_id   uuid NOT NULL,
  kind       text NOT NULL,
  correct    boolean NOT NULL,
  ts         timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (cohort_id, vocab_id, kind, ts)
);
CREATE INDEX IF NOT EXISTS gaokao_cohort_events_cohort
  ON public.gaokao_cohort_events(cohort_id, vocab_id);

ALTER TABLE public.gaokao_cohort_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cohort events owner select" ON public.gaokao_cohort_events
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "cohort events owner insert" ON public.gaokao_cohort_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ---- 7. RPC start_new_cohort (transactional, with sanity checks) ----
CREATE OR REPLACE FUNCTION public.start_new_cohort(
  p_word_ids uuid[],
  p_theme_tag text DEFAULT NULL
) RETURNS public.gaokao_user_active_cohort
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_size int;
  v_missing int;
  v_seq int;
  v_row public.gaokao_user_active_cohort;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  v_size := COALESCE(array_length(p_word_ids, 1), 0);
  IF v_size < 5 OR v_size > 20 THEN
    RAISE EXCEPTION 'cohort_size_out_of_range: got %', v_size;
  END IF;

  -- ensure all word ids exist
  SELECT count(*) INTO v_missing
    FROM unnest(p_word_ids) AS wid
   WHERE NOT EXISTS (SELECT 1 FROM gaokao_vocab WHERE id = wid);
  IF v_missing > 0 THEN
    RAISE EXCEPTION 'cohort_words_invalid: % missing', v_missing;
  END IF;

  -- dormant any existing active cohort (one statement transaction)
  UPDATE gaokao_user_active_cohort
     SET status = 'dormant', last_active_at = now()
   WHERE user_id = v_uid AND status = 'active';

  -- next sequence number for this user
  SELECT COALESCE(MAX(sequence_no), 0) + 1 INTO v_seq
    FROM gaokao_user_active_cohort
   WHERE user_id = v_uid;

  INSERT INTO gaokao_user_active_cohort (user_id, cohort_word_ids, status, sequence_no, theme_tag)
  VALUES (v_uid, p_word_ids, 'active', v_seq, p_theme_tag)
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.start_new_cohort(uuid[], text) TO authenticated;

-- ---- 8. RPC resume_cohort (dormant -> active, dormant the current active) ----
CREATE OR REPLACE FUNCTION public.resume_cohort(p_cohort_id uuid)
RETURNS public.gaokao_user_active_cohort
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_row public.gaokao_user_active_cohort;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;

  -- target must exist, belong to user, and be dormant
  SELECT * INTO v_row FROM gaokao_user_active_cohort
   WHERE id = p_cohort_id AND user_id = v_uid;
  IF NOT FOUND THEN RAISE EXCEPTION 'cohort_not_found'; END IF;
  IF v_row.status <> 'dormant' THEN RAISE EXCEPTION 'cohort_not_dormant: %', v_row.status; END IF;

  -- dormant current active
  UPDATE gaokao_user_active_cohort
     SET status = 'dormant', last_active_at = now()
   WHERE user_id = v_uid AND status = 'active';

  -- activate target
  UPDATE gaokao_user_active_cohort
     SET status = 'active', last_active_at = now()
   WHERE id = p_cohort_id
   RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.resume_cohort(uuid) TO authenticated;
