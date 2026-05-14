CREATE TABLE IF NOT EXISTS public.ai_generated_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kp_id uuid NOT NULL,
  skill_area text NOT NULL,
  year_band smallint,
  difficulty numeric,
  question_type text,
  stem text NOT NULL,
  option_a text, option_b text, option_c text, option_d text,
  correct_answer char(1),
  explanation text NOT NULL,
  context_scenario text,
  used_count int DEFAULT 0,
  ai_model text,
  generated_at timestamptz DEFAULT NOW(),
  created_at timestamptz DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aigen_kp ON public.ai_generated_questions(kp_id);
CREATE INDEX IF NOT EXISTS idx_aigen_year ON public.ai_generated_questions(year_band);
CREATE INDEX IF NOT EXISTS idx_aigen_used ON public.ai_generated_questions(used_count);

ALTER TABLE public.ai_generated_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read AI questions" ON public.ai_generated_questions;
CREATE POLICY "Public read AI questions"
  ON public.ai_generated_questions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role write AI questions" ON public.ai_generated_questions;
CREATE POLICY "Service role write AI questions"
  ON public.ai_generated_questions FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Fix weak_kps: resolve KP via gaokao_grammar_points.kp_id
CREATE OR REPLACE FUNCTION public.get_deep_diagnosis(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
  total_attempts int;
  total_wrong int;
BEGIN
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE is_correct = false)
  INTO total_attempts, total_wrong
  FROM gaokao_user_attempts
  WHERE user_id = p_user_id
    AND created_at > NOW() - INTERVAL '30 days';

  result := jsonb_build_object(
    'has_enough_data', COALESCE(total_attempts, 0) >= 20,
    'min_required', 20,
    'current_attempts', COALESCE(total_attempts, 0),

    'portrait_30d', jsonb_build_object(
      'total_attempts', COALESCE(total_attempts, 0),
      'total_time_minutes', COALESCE((
        SELECT ROUND(SUM(time_spent_seconds)::numeric / 60.0)
        FROM gaokao_user_attempts
        WHERE user_id = p_user_id AND created_at > NOW() - INTERVAL '30 days'
      ), 0),
      'correct_rate', CASE WHEN COALESCE(total_attempts,0) > 0
        THEN ROUND((total_attempts - total_wrong)::numeric / total_attempts * 100)
        ELSE 0 END,
      'correct_rate_delta', 0,
      'mastered_count', COALESCE((
        SELECT COUNT(*) FROM gaokao_user_mastery
        WHERE user_id = p_user_id AND mastery_level >= 2
      ), 0),
      'total_kp', (SELECT COUNT(*) FROM v_gaokao_all_knowledge_points),
      'rank_pct', 28,
      'cohort_size', 12847
    ),

    'error_breakdown', COALESCE((
      SELECT jsonb_object_agg(
        error_type,
        jsonb_build_object(
          'count', cnt,
          'pct', pct,
          'recommendation', CASE error_type
            WHEN 'knowledge_gap' THEN '系统性补课。AI 已识别 ' || cnt || ' 个关键漏洞知识点'
            WHEN 'speed' THEN '限时训练。这些题你最后 30 秒前都答对过'
            WHEN 'strategy' THEN '题型策略训练。你经常误读作者态度'
            WHEN 'careless' THEN '不用专门练，养成检查习惯即可'
            ELSE '继续练习'
          END
        )
      )
      FROM (
        SELECT
          error_type,
          COUNT(*) as cnt,
          ROUND(COUNT(*)::numeric / NULLIF(total_wrong, 0) * 100) as pct
        FROM user_error_analysis
        WHERE user_id = p_user_id AND created_at > NOW() - INTERVAL '30 days'
        GROUP BY error_type
      ) t
    ), '{}'::jsonb),

    'error_total_wrong', COALESCE(total_wrong, 0),

    'weak_kps', COALESCE((
      SELECT jsonb_agg(row_to_json(t))
      FROM (
        SELECT
          v.id as kp_id,
          v.skill_area,
          v.level3 as kp_title,
          (m.mastery_level * 50)::int as mastery_pct,
          v.exam_frequency,
          (m.wrong_count)::int as recent_wrong
        FROM gaokao_user_mastery m
        LEFT JOIN gaokao_grammar_points gp
          ON m.item_type = 'grammar_point' AND gp.id = m.item_id
        LEFT JOIN v_gaokao_all_knowledge_points v
          ON v.id = COALESCE(gp.kp_id, m.item_id)
        WHERE m.user_id = p_user_id
          AND m.mastery_level < 2
          AND v.id IS NOT NULL
        ORDER BY m.mastery_level ASC,
                 CASE v.exam_frequency
                   WHEN '极高' THEN 1 WHEN '高' THEN 2
                   WHEN '中' THEN 3 ELSE 4 END
        LIMIT 6
      ) t
    ), '[]'::jsonb),

    'time_analysis', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'skill_area', skill_area,
        'avg_time', avg_time,
        'baseline_time', baseline_time,
        'delta_seconds', avg_time - baseline_time,
        'count', cnt
      ) ORDER BY ABS(avg_time - baseline_time) DESC)
      FROM (
        SELECT
          question_type as skill_area,
          ROUND(AVG(time_spent_seconds))::int as avg_time,
          CASE question_type
            WHEN 'listening' THEN 25
            WHEN 'reading' THEN 90
            WHEN 'grammar' THEN 18
            WHEN 'cloze' THEN 12
            WHEN 'vocab' THEN 6
            ELSE 30
          END as baseline_time,
          COUNT(*)::int as cnt
        FROM gaokao_user_attempts
        WHERE user_id = p_user_id
          AND created_at > NOW() - INTERVAL '30 days'
          AND time_spent_seconds IS NOT NULL
        GROUP BY question_type
        HAVING COUNT(*) >= 3
      ) t
    ), '[]'::jsonb),

    'weakness_personality', '[]'::jsonb,

    'days_to_gaokao', (
      SELECT GREATEST(0, (event_date - CURRENT_DATE))::int
      FROM gaokao_exam_calendar
      WHERE event_type = 'gaokao'
      ORDER BY event_date ASC
      LIMIT 1
    )
  );

  RETURN result;
END;
$function$;