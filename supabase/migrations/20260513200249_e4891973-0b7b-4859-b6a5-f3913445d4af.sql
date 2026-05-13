-- 1. Add column to active cohort table
ALTER TABLE public.gaokao_user_active_cohort
  ADD COLUMN graduated_without_essay boolean NOT NULL DEFAULT false;

-- 2. New essays table
CREATE TABLE public.gaokao_cohort_essays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id uuid NOT NULL REFERENCES public.gaokao_user_active_cohort(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  sentence text NOT NULL,
  words_used text[] NOT NULL,
  llm_strength text NOT NULL,
  llm_refinement text NOT NULL,
  llm_score int NOT NULL CHECK (llm_score BETWEEN 1 AND 5),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_gaokao_cohort_essays_cohort ON public.gaokao_cohort_essays(cohort_id);
CREATE INDEX idx_gaokao_cohort_essays_user_created ON public.gaokao_cohort_essays(user_id, created_at DESC);

ALTER TABLE public.gaokao_cohort_essays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own essays"
  ON public.gaokao_cohort_essays FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own essays"
  ON public.gaokao_cohort_essays FOR INSERT
  WITH CHECK (auth.uid() = user_id);
-- No UPDATE / DELETE policies => immutable once submitted

-- 3. RPC: submit essay + graduate atomically
CREATE OR REPLACE FUNCTION public.submit_cohort_essay(
  p_cohort_id uuid,
  p_sentence text,
  p_words_used text[],
  p_strength text,
  p_refinement text,
  p_score int
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_cohort_words text[];
  v_essay_id uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  IF p_score IS NULL OR p_score < 1 OR p_score > 5 THEN
    RAISE EXCEPTION 'invalid_score';
  END IF;

  IF p_words_used IS NULL OR array_length(p_words_used, 1) IS NULL OR array_length(p_words_used, 1) < 1 THEN
    RAISE EXCEPTION 'no_words_used';
  END IF;

  IF p_sentence IS NULL OR length(trim(p_sentence)) = 0 THEN
    RAISE EXCEPTION 'empty_sentence';
  END IF;

  IF p_strength IS NULL OR length(trim(p_strength)) = 0
     OR p_refinement IS NULL OR length(trim(p_refinement)) = 0 THEN
    RAISE EXCEPTION 'empty_feedback';
  END IF;

  -- Lock cohort row + check ownership/status
  SELECT cohort_word_ids INTO v_cohort_words
  FROM public.gaokao_user_active_cohort
  WHERE id = p_cohort_id
    AND user_id = v_uid
    AND status = 'active'
  FOR UPDATE;

  IF v_cohort_words IS NULL THEN
    RAISE EXCEPTION 'cohort_not_active_or_not_owned';
  END IF;

  -- All words_used must be in cohort
  IF NOT (p_words_used <@ v_cohort_words) THEN
    RAISE EXCEPTION 'words_not_in_cohort';
  END IF;

  INSERT INTO public.gaokao_cohort_essays(
    cohort_id, user_id, sentence, words_used, llm_strength, llm_refinement, llm_score
  ) VALUES (
    p_cohort_id, v_uid, p_sentence, p_words_used, p_strength, p_refinement, p_score
  )
  RETURNING id INTO v_essay_id;

  UPDATE public.gaokao_user_active_cohort
  SET status = 'graduated',
      graduated_at = now(),
      graduated_without_essay = false
  WHERE id = p_cohort_id;

  RETURN v_essay_id;
END;
$$;

-- 4. RPC: graduate without essay
CREATE OR REPLACE FUNCTION public.graduate_cohort_without_essay(
  p_cohort_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_found boolean;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  SELECT true INTO v_found
  FROM public.gaokao_user_active_cohort
  WHERE id = p_cohort_id
    AND user_id = v_uid
    AND status = 'active'
  FOR UPDATE;

  IF NOT COALESCE(v_found, false) THEN
    RAISE EXCEPTION 'cohort_not_active_or_not_owned';
  END IF;

  UPDATE public.gaokao_user_active_cohort
  SET status = 'graduated',
      graduated_at = now(),
      graduated_without_essay = true
  WHERE id = p_cohort_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_cohort_essay(uuid, text, text[], text, text, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.graduate_cohort_without_essay(uuid) TO authenticated;