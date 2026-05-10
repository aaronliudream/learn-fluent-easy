CREATE OR REPLACE FUNCTION public.submit_cloze_session(_passage_id uuid, _answers jsonb, _duration_seconds integer DEFAULT NULL::integer)
 RETURNS TABLE(session_id uuid, total_blanks integer, correct_count integer, score_pct real)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  uid uuid := auth.uid();
  v_total int;
  v_correct int := 0;
  v_session_id uuid;
  v_passage_title text;
  v_passage_no int;
  rec record;
  user_ans text;
  is_correct boolean;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;

  SELECT title, passage_no INTO v_passage_title, v_passage_no
  FROM gaokao_cloze_passages WHERE id = _passage_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'passage not found'; END IF;

  SELECT COUNT(*) INTO v_total FROM gaokao_cloze_blanks WHERE passage_id = _passage_id;

  FOR rec IN
    SELECT b.id, b.blank_no, b.correct_answer,
           b.option_a, b.option_b, b.option_c, b.option_d,
           b.general_explanation, b.explanation_a, b.explanation_b,
           b.explanation_c, b.explanation_d, b.skill_tag
    FROM gaokao_cloze_blanks b
    WHERE b.passage_id = _passage_id
    ORDER BY b.blank_no
  LOOP
    user_ans := upper(coalesce(_answers ->> rec.blank_no::text, ''));
    is_correct := (user_ans = upper(rec.correct_answer::text));
    IF is_correct THEN
      v_correct := v_correct + 1;
    ELSIF user_ans <> '' THEN
      INSERT INTO gaokao_user_mistakes(
        user_id, module, item_id, parent_id, parent_label,
        user_answer, correct_answer, snapshot, last_wrong_at, next_review_at
      ) VALUES (
        uid, 'cloze', rec.id, _passage_id,
        format('第 %s 篇 · %s · 第 %s 空', v_passage_no, v_passage_title, rec.blank_no),
        user_ans, rec.correct_answer::text,
        jsonb_build_object(
          'blank_no', rec.blank_no,
          'option_a', rec.option_a, 'option_b', rec.option_b,
          'option_c', rec.option_c, 'option_d', rec.option_d,
          'general_explanation', rec.general_explanation,
          'explanation_a', rec.explanation_a, 'explanation_b', rec.explanation_b,
          'explanation_c', rec.explanation_c, 'explanation_d', rec.explanation_d,
          'skill_tag', rec.skill_tag
        ),
        now(), now() + interval '1 day'
      )
      ON CONFLICT (user_id, module, item_id) DO UPDATE SET
        wrong_count = gaokao_user_mistakes.wrong_count + 1,
        last_wrong_at = now(),
        next_review_at = now() + interval '1 day',
        is_resolved = false,
        user_answer = EXCLUDED.user_answer,
        snapshot = EXCLUDED.snapshot,
        updated_at = now();
    END IF;
  END LOOP;

  INSERT INTO gaokao_cloze_sessions(
    user_id, passage_id, answers, total_blanks, correct_count,
    score_pct, status, duration_seconds, submitted_at
  ) VALUES (
    uid, _passage_id, _answers, v_total, v_correct,
    CASE WHEN v_total > 0 THEN (v_correct::real / v_total)::real ELSE 0::real END,
    'submitted', _duration_seconds, now()
  )
  RETURNING id INTO v_session_id;

  RETURN QUERY SELECT
    v_session_id,
    v_total,
    v_correct,
    (CASE WHEN v_total > 0 THEN (v_correct::real / v_total) ELSE 0 END)::real;
END;
$function$;