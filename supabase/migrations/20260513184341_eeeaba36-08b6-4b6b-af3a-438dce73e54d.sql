-- Atomic cohort attempt: upsert mastery + insert event in one transaction.
CREATE OR REPLACE FUNCTION public.record_cohort_attempt(
  p_cohort_id     uuid,
  p_vocab_id      uuid,
  p_kind          text,
  p_correct       boolean,
  p_mastery       jsonb   -- precomputed payload from client (TS is FSRS source of truth)
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid          uuid := auth.uid();
  v_cohort       gaokao_user_active_cohort;
  v_existing_id  uuid;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  IF p_kind IS NULL OR length(p_kind) = 0 THEN RAISE EXCEPTION 'kind_required'; END IF;

  -- 1. Validate cohort: exists, owned, active, contains vocab_id
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

  -- 2. Upsert mastery (server merges precomputed payload onto existing row)
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
      updated_at         = now()
    WHERE id = v_existing_id;
  ELSE
    INSERT INTO gaokao_user_mastery (
      user_id, item_type, item_id,
      mastery_matrix, mastery_level,
      last_latency_ms, lapses, difficulty, stability, last_grade,
      due_at, next_review_at, correct_count, wrong_count,
      last_result, last_seen_at, reached_master_at
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
      (p_mastery->>'reached_master_at')::timestamptz
    );
  END IF;

  -- 3. Insert cohort event
  INSERT INTO gaokao_cohort_events (cohort_id, user_id, vocab_id, kind, correct)
  VALUES (p_cohort_id, v_uid, p_vocab_id, p_kind, p_correct);

  -- 4. Bump cohort liveness
  UPDATE gaokao_user_active_cohort
     SET last_active_at = now()
   WHERE id = p_cohort_id;

  RETURN jsonb_build_object(
    'ok', true,
    'cohort_id', p_cohort_id,
    'vocab_id', p_vocab_id,
    'kind', p_kind,
    'correct', p_correct
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_cohort_attempt(uuid, uuid, text, boolean, jsonb) TO authenticated;
