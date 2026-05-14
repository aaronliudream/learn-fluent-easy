CREATE OR REPLACE FUNCTION public.get_user_dashboard_summary(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
  v_has_data boolean;
BEGIN
  -- Auth: allow service role (auth.uid() is null when called by service role) OR self
  IF auth.uid() IS NOT NULL AND auth.uid() <> p_user_id THEN
    RETURN '{}'::jsonb;
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM public.gaokao_user_mastery WHERE user_id = p_user_id
    UNION ALL
    SELECT 1 FROM public.gaokao_user_attempts WHERE user_id = p_user_id
  ) INTO v_has_data;

  WITH mastery_with_area AS (
    SELECT
      m.item_id,
      (m.mastery_level::numeric * 20.0) AS mastery_pct,
      COALESCE(v.skill_area, m.item_type, 'other') AS skill_area
    FROM public.gaokao_user_mastery m
    LEFT JOIN public.v_gaokao_all_knowledge_points v ON v.id = m.item_id
    WHERE m.user_id = p_user_id
  ),
  dim_agg AS (
    SELECT
      skill_area,
      ROUND(AVG(mastery_pct))::int AS mastery_pct,
      CASE skill_area
        WHEN 'listening' THEN 30
        WHEN 'reading'   THEN 50
        WHEN 'vocab'     THEN 15
        WHEN 'grammar'   THEN 15
        WHEN 'writing'   THEN 40
        WHEN 'cloze'     THEN 15
        ELSE 0
      END AS dim_max
    FROM mastery_with_area
    WHERE skill_area IN ('listening','reading','vocab','grammar','writing','cloze')
    GROUP BY skill_area
  )
  SELECT jsonb_build_object(
    'has_data', v_has_data,

    'dimensions', COALESCE((
      SELECT jsonb_object_agg(skill_area, jsonb_build_object(
        'score', ROUND(mastery_pct::numeric / 100.0 * dim_max),
        'max', dim_max,
        'mastery_pct', mastery_pct
      )) FROM dim_agg
    ), '{}'::jsonb),

    'kp_stats', jsonb_build_object(
      'total', (SELECT COUNT(*) FROM public.v_gaokao_all_knowledge_points),
      'mastered', COALESCE((SELECT COUNT(*) FROM public.gaokao_user_mastery WHERE user_id = p_user_id AND mastery_level >= 4), 0),
      'this_week_new', COALESCE((SELECT COUNT(*) FROM public.gaokao_user_mastery WHERE user_id = p_user_id AND created_at > NOW() - INTERVAL '7 days'), 0)
    ),

    'attempt_stats', jsonb_build_object(
      'total_attempts', COALESCE((SELECT COUNT(*) FROM public.gaokao_user_attempts WHERE user_id = p_user_id), 0),
      'correct_rate', COALESCE((
        SELECT ROUND(AVG(CASE WHEN is_correct THEN 1 ELSE 0 END) * 100)
        FROM public.gaokao_user_attempts WHERE user_id = p_user_id
      ), 0),
      'last_30d_total', COALESCE((SELECT COUNT(*) FROM public.gaokao_user_attempts WHERE user_id = p_user_id AND created_at > NOW() - INTERVAL '30 days'), 0)
    ),

    'error_distribution', (
      SELECT jsonb_build_object(
        'knowledge_gap', COALESCE(MAX(CASE WHEN error_type = 'knowledge_gap' THEN count_pct END), 0),
        'speed',         COALESCE(MAX(CASE WHEN error_type = 'speed' THEN count_pct END), 0),
        'strategy',      COALESCE(MAX(CASE WHEN error_type = 'strategy' THEN count_pct END), 0),
        'careless',      COALESCE(MAX(CASE WHEN error_type = 'careless' THEN count_pct END), 0)
      )
      FROM (
        SELECT error_type,
               ROUND(COUNT(*)::numeric / NULLIF(SUM(COUNT(*)) OVER (), 0) * 100) AS count_pct
        FROM public.user_error_analysis
        WHERE user_id = p_user_id AND created_at > NOW() - INTERVAL '30 days'
        GROUP BY error_type
      ) t
    ),

    'days_remaining', COALESCE((
      SELECT jsonb_object_agg(event_type, days)
      FROM (
        SELECT event_type, GREATEST(0, (event_date - CURRENT_DATE))::int AS days
        FROM public.gaokao_exam_calendar
        WHERE event_date >= CURRENT_DATE
        ORDER BY event_date ASC
      ) t
    ), '{}'::jsonb),

    'profile', COALESCE((
      SELECT jsonb_build_object(
        'display_name', display_name,
        'target_score', target_score,
        'current_year_band', current_year_band,
        'gaokao_year', gaokao_year
      )
      FROM public.profiles WHERE user_id = p_user_id
    ), '{}'::jsonb)
  ) INTO v_result;

  RETURN v_result;
END;
$$;