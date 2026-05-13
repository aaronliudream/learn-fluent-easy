-- ============================================================
-- 1) record_cohort_attempt: add p_source + hypercorrection clear
-- ============================================================
DROP FUNCTION IF EXISTS public.record_cohort_attempt(uuid, uuid, text, boolean, jsonb);

CREATE OR REPLACE FUNCTION public.record_cohort_attempt(
  p_cohort_id  uuid,
  p_vocab_id   uuid,
  p_kind       text,
  p_correct    boolean,
  p_mastery    jsonb,
  p_source     text     -- REQUIRED: 'cohort' | 'fsrs_due' | 'free_practice'
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid          uuid := auth.uid();
  v_cohort       gaokao_user_active_cohort;
  v_existing_id  uuid;
  v_clear_hc     boolean := false;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  IF p_kind IS NULL OR length(p_kind) = 0 THEN RAISE EXCEPTION 'kind_required'; END IF;
  IF p_source NOT IN ('cohort','fsrs_due','free_practice') THEN
    RAISE EXCEPTION 'invalid_source: %', p_source;
  END IF;

  -- cohort_id is optional ONLY when source <> 'cohort'.
  IF p_source = 'cohort' THEN
    IF p_cohort_id IS NULL THEN RAISE EXCEPTION 'cohort_id_required_for_cohort_source'; END IF;
    SELECT * INTO v_cohort
      FROM gaokao_user_active_cohort
     WHERE id = p_cohort_id AND user_id = v_uid;
    IF NOT FOUND THEN RAISE EXCEPTION 'cohort_not_found'; END IF;
    IF v_cohort.status <> 'active' THEN
      RAISE EXCEPTION 'cohort_not_active: %', v_cohort.status;
    END IF;
    IF NOT (p_vocab_id = ANY(v_cohort.cohort_word_ids)) THEN
      RAISE EXCEPTION 'vocab_not_in_cohort';
    END IF;
  END IF;

  -- Hypercorrection clear: ONLY when this is a real FSRS-scheduled review
  -- AND the user got it right. Cohort-internal practice never clears.
  v_clear_hc := (p_source = 'fsrs_due' AND p_correct);

  -- Upsert mastery
  SELECT id INTO v_existing_id
    FROM gaokao_user_mastery
   WHERE user_id = v_uid AND item_type = 'vocab' AND item_id = p_vocab_id;

  IF v_existing_id IS NOT NULL THEN
    UPDATE gaokao_user_mastery SET
      mastery_matrix     = COALESCE(p_mastery->'mastery_matrix', mastery_matrix),
      mastery_level      = COALESCE((p_mastery->>'mastery_level')::smallint, mastery_level),
      last_latency_ms    = NULLIF(p_mastery->>'last_latency_ms','')::int,
      lapses             = COALESCE((p_mastery->>'lapses')::int, lapses),
      difficulty         = COALESCE((p_mastery->>'difficulty')::real, difficulty),
      stability          = COALESCE((p_mastery->>'stability')::real, stability),
      last_grade         = NULLIF(p_mastery->>'last_grade','')::smallint,
      due_at             = COALESCE((p_mastery->>'due_at')::timestamptz, due_at),
      next_review_at     = COALESCE((p_mastery->>'next_review_at')::timestamptz, next_review_at),
      correct_count      = COALESCE((p_mastery->>'correct_count')::int, correct_count),
      wrong_count        = COALESCE((p_mastery->>'wrong_count')::int, wrong_count),
      last_result        = COALESCE(p_mastery->>'last_result', last_result),
      last_seen_at       = COALESCE((p_mastery->>'last_seen_at')::timestamptz, now()),
      reached_master_at  = COALESCE((p_mastery->>'reached_master_at')::timestamptz, reached_master_at),
      hypercorrection    = CASE WHEN v_clear_hc THEN false ELSE hypercorrection END,
      updated_at         = now()
    WHERE id = v_existing_id;
  ELSE
    INSERT INTO gaokao_user_mastery (
      user_id, item_type, item_id,
      mastery_matrix, mastery_level,
      last_latency_ms, lapses, difficulty, stability, last_grade,
      due_at, next_review_at, correct_count, wrong_count,
      last_result, last_seen_at, reached_master_at, hypercorrection
    ) VALUES (
      v_uid, 'vocab', p_vocab_id,
      COALESCE(p_mastery->'mastery_matrix', '{}'::jsonb),
      COALESCE((p_mastery->>'mastery_level')::smallint, 0),
      NULLIF(p_mastery->>'last_latency_ms','')::int,
      COALESCE((p_mastery->>'lapses')::int, 0),
      COALESCE((p_mastery->>'difficulty')::real, 5.0),
      COALESCE((p_mastery->>'stability')::real, 0),
      NULLIF(p_mastery->>'last_grade','')::smallint,
      (p_mastery->>'due_at')::timestamptz,
      (p_mastery->>'next_review_at')::timestamptz,
      COALESCE((p_mastery->>'correct_count')::int, CASE WHEN p_correct THEN 1 ELSE 0 END),
      COALESCE((p_mastery->>'wrong_count')::int,   CASE WHEN p_correct THEN 0 ELSE 1 END),
      COALESCE(p_mastery->>'last_result', CASE WHEN p_correct THEN 'correct' ELSE 'wrong' END),
      now(),
      (p_mastery->>'reached_master_at')::timestamptz,
      false
    );
  END IF;

  -- Insert cohort event ONLY when this answer happened inside the cohort
  -- (so step 1-4 progress + step 5 fsrs_review counts both go in cohort_events).
  IF p_source IN ('cohort','fsrs_due') AND p_cohort_id IS NOT NULL THEN
    INSERT INTO gaokao_cohort_events (cohort_id, user_id, vocab_id, kind, correct)
    VALUES (p_cohort_id, v_uid, p_vocab_id,
            CASE WHEN p_source = 'fsrs_due' THEN 'fsrs_review' ELSE p_kind END,
            p_correct);

    UPDATE gaokao_user_active_cohort
       SET last_active_at = now()
     WHERE id = p_cohort_id;
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'source', p_source,
    'cleared_hypercorrection', v_clear_hc,
    'cohort_id', p_cohort_id,
    'vocab_id', p_vocab_id,
    'kind', p_kind
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_cohort_attempt(uuid, uuid, text, boolean, jsonb, text) TO authenticated;

-- ============================================================
-- 2) init_cohort_with_self_rate: atomic mastery seed + cohort start
-- ============================================================
CREATE OR REPLACE FUNCTION public.init_cohort_with_self_rate(
  p_word_ids   uuid[],
  -- jsonb array of { vocab_id: uuid, matrix: jsonb, level: int, hypercorrection: bool }
  p_seeds      jsonb,
  p_theme_tag  text DEFAULT NULL
) RETURNS public.gaokao_user_active_cohort
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid    uuid := auth.uid();
  v_size   int;
  v_seq    int;
  v_seed   jsonb;
  v_vid    uuid;
  v_row    public.gaokao_user_active_cohort;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;

  v_size := COALESCE(array_length(p_word_ids, 1), 0);
  IF v_size < 5 OR v_size > 20 THEN
    RAISE EXCEPTION 'cohort_size_out_of_range: %', v_size;
  END IF;
  IF jsonb_typeof(p_seeds) <> 'array' OR jsonb_array_length(p_seeds) <> v_size THEN
    RAISE EXCEPTION 'seeds_length_mismatch';
  END IF;

  -- validate all words exist
  IF (SELECT count(*) FROM unnest(p_word_ids) wid
       WHERE NOT EXISTS (SELECT 1 FROM gaokao_vocab WHERE id = wid)) > 0 THEN
    RAISE EXCEPTION 'cohort_words_invalid';
  END IF;

  -- Seed mastery rows FIRST (so when cohort becomes visible, data is ready)
  FOR v_seed IN SELECT * FROM jsonb_array_elements(p_seeds) LOOP
    v_vid := (v_seed->>'vocab_id')::uuid;
    INSERT INTO gaokao_user_mastery (
      user_id, item_type, item_id,
      mastery_matrix, mastery_level,
      hypercorrection, last_seen_at
    ) VALUES (
      v_uid, 'vocab', v_vid,
      COALESCE(v_seed->'matrix', '{}'::jsonb),
      COALESCE((v_seed->>'level')::smallint, 0),
      COALESCE((v_seed->>'hypercorrection')::boolean, false),
      now()
    )
    ON CONFLICT (user_id, item_type, item_id) DO UPDATE SET
      mastery_matrix  = COALESCE(EXCLUDED.mastery_matrix, gaokao_user_mastery.mastery_matrix),
      mastery_level   = GREATEST(gaokao_user_mastery.mastery_level, EXCLUDED.mastery_level),
      hypercorrection = gaokao_user_mastery.hypercorrection OR EXCLUDED.hypercorrection,
      last_seen_at    = now();
  END LOOP;

  -- Dormant existing active cohort, then create the new one
  UPDATE gaokao_user_active_cohort
     SET status = 'dormant', last_active_at = now()
   WHERE user_id = v_uid AND status = 'active';

  SELECT COALESCE(MAX(sequence_no), 0) + 1 INTO v_seq
    FROM gaokao_user_active_cohort
   WHERE user_id = v_uid;

  INSERT INTO gaokao_user_active_cohort (user_id, cohort_word_ids, status, sequence_no, theme_tag)
  VALUES (v_uid, p_word_ids, 'active', v_seq, p_theme_tag)
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.init_cohort_with_self_rate(uuid[], jsonb, text) TO authenticated;
