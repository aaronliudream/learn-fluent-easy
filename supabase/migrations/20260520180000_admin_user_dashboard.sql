-- Admin dashboard: list users + per-user learning / mistakes (admin role only)

CREATE OR REPLACE FUNCTION public.admin_list_users(
  p_search text DEFAULT '',
  p_limit int DEFAULT 100
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'forbidden: admin only' USING ERRCODE = '42501';
  END IF;

  RETURN COALESCE((
    SELECT jsonb_agg(row_to_json(t) ORDER BY t.last_active_at DESC NULLS LAST)
    FROM (
      SELECT
        p.user_id,
        p.email,
        COALESCE(NULLIF(TRIM(p.display_name), ''), NULLIF(TRIM(p.leaderboard_alias), ''), NULLIF(TRIM(p.username), ''), '用户') AS display_name,
        p.is_guest,
        p.created_at,
        p.recommended_grade,
        p.current_year_band,
        COALESCE(m.mistake_open, 0) AS open_mistakes,
        COALESCE(m.mistake_total, 0) AS total_mistakes,
        COALESCE(h.last_active_at, p.updated_at) AS last_active_at,
        COALESCE(st.primary_score, 0)::int AS primary_score,
        COALESCE(st.junior_score, 0)::int AS junior_score,
        COALESCE(st.gaokao_score, 0)::int AS gaokao_score
      FROM public.profiles p
      LEFT JOIN LATERAL (
        SELECT
          COUNT(*) FILTER (WHERE NOT um.is_resolved)::int AS mistake_open,
          COUNT(*)::int AS mistake_total
        FROM public.user_mistakes um
        WHERE um.user_id = p.user_id
      ) m ON TRUE
      LEFT JOIN LATERAL (
        SELECT MAX(lh.created_at) AS last_active_at
        FROM public.learning_heartbeats lh
        WHERE lh.user_id = p.user_id
      ) h ON TRUE
      LEFT JOIN LATERAL (
        SELECT
          MAX(msp.score_pct) FILTER (WHERE msp.stage = 'primary') AS primary_score,
          MAX(msp.score_pct) FILTER (WHERE msp.stage = 'junior') AS junior_score,
          MAX(msp.score_pct) FILTER (WHERE msp.stage = 'gaokao') AS gaokao_score
        FROM public.mastery_stage_proportion msp
        WHERE msp.user_id = p.user_id
      ) st ON TRUE
      WHERE (
        COALESCE(p_search, '') = ''
        OR p.email ILIKE '%' || p_search || '%'
        OR COALESCE(p.display_name, '') ILIKE '%' || p_search || '%'
        OR COALESCE(p.username, '') ILIKE '%' || p_search || '%'
        OR COALESCE(p.leaderboard_alias, '') ILIKE '%' || p_search || '%'
      )
      ORDER BY COALESCE(h.last_active_at, p.updated_at) DESC NULLS LAST
      LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 100), 200))
    ) t
  ), '[]'::jsonb);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_get_user_learning(
  p_user_id uuid,
  p_days int DEFAULT 30
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  since timestamptz := now() - make_interval(days => GREATEST(1, LEAST(COALESCE(p_days, 30), 90)));
  prof jsonb;
  mastery jsonb;
  mistakes jsonb;
  activity jsonb;
  recent_items jsonb;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'forbidden: admin only' USING ERRCODE = '42501';
  END IF;

  IF p_user_id IS NULL THEN
    RETURN '{}'::jsonb;
  END IF;

  SELECT jsonb_build_object(
    'user_id', p.user_id,
    'email', p.email,
    'display_name', COALESCE(NULLIF(TRIM(p.display_name), ''), NULLIF(TRIM(p.leaderboard_alias), ''), NULLIF(TRIM(p.username), ''), '用户'),
    'is_guest', p.is_guest,
    'created_at', p.created_at,
    'recommended_grade', p.recommended_grade,
    'current_year_band', p.current_year_band,
    'learning_goal', p.learning_goal,
    'target_language', p.target_language
  )
  INTO prof
  FROM public.profiles p
  WHERE p.user_id = p_user_id;

  IF prof IS NULL THEN
    RETURN jsonb_build_object('error', 'user_not_found');
  END IF;

  SELECT COALESCE(jsonb_agg(row_to_json(m) ORDER BY m.stage, m.module), '[]'::jsonb)
  INTO mastery
  FROM (
    SELECT stage, module, master_count, fluent_count, weak_count, none_count, score_pct, user_total
    FROM public.mastery_with_proportions
    WHERE user_id = p_user_id
  ) m;

  SELECT COALESCE(jsonb_agg(row_to_json(x) ORDER BY x.last_wrong_at DESC), '[]'::jsonb)
  INTO mistakes
  FROM (
    SELECT
      id,
      module,
      source_key,
      source_label,
      question,
      user_answer,
      correct_answer,
      explanation,
      wrong_count,
      is_resolved,
      is_starred,
      last_wrong_at,
      created_at
    FROM public.user_mistakes
    WHERE user_id = p_user_id
    ORDER BY last_wrong_at DESC
    LIMIT 80
  ) x;

  SELECT jsonb_build_object(
    'minutes_total', COALESCE(ROUND(SUM(active_seconds) / 60.0)::int, 0),
    'by_segment', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'segment', segment,
        'minutes', ROUND(SUM(active_seconds) / 60.0)::int,
        'days', COUNT(DISTINCT date_trunc('day', created_at))::int
      ))
      FROM public.learning_heartbeats
      WHERE user_id = p_user_id AND created_at >= since
      GROUP BY segment
    ), '[]'::jsonb)
  )
  INTO activity
  FROM public.learning_heartbeats
  WHERE user_id = p_user_id AND created_at >= since;

  SELECT COALESCE(jsonb_agg(row_to_json(r) ORDER BY r.last_review_at DESC NULLS LAST), '[]'::jsonb)
  INTO recent_items
  FROM (
    SELECT stage, grade, module, item_type, item_label, state, attempt_count, correct_count, wrong_count, accuracy_pct, last_review_at
    FROM public.unified_mastery
    WHERE user_id = p_user_id AND last_review_at IS NOT NULL
    ORDER BY last_review_at DESC
    LIMIT 40
  ) r;

  RETURN jsonb_build_object(
    'profile', prof,
    'days_window', p_days,
    'mastery', mastery,
    'mistakes', mistakes,
    'activity', activity,
    'recent_items', recent_items
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_users(text, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_user_learning(uuid, int) TO authenticated;

-- Ensure admin role for project owner (idempotent)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE lower(email) = lower('aaron.liudream@outlook.com')
ON CONFLICT (user_id, role) DO NOTHING;
