-- =========================================================
-- A. daily_prescriptions
-- =========================================================
CREATE TABLE IF NOT EXISTS public.daily_prescriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  year_band smallint NOT NULL,
  prescription_date date NOT NULL DEFAULT CURRENT_DATE,
  tasks jsonb NOT NULL DEFAULT '[]'::jsonb,
  weak_top3 jsonb NOT NULL DEFAULT '[]'::jsonb,
  weekly_focus jsonb NOT NULL DEFAULT '[]'::jsonb,
  generated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, prescription_date)
);
CREATE INDEX IF NOT EXISTS idx_dp_user_date ON public.daily_prescriptions(user_id, prescription_date DESC);
ALTER TABLE public.daily_prescriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own prescriptions" ON public.daily_prescriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own prescriptions" ON public.daily_prescriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own prescriptions" ON public.daily_prescriptions FOR UPDATE USING (auth.uid() = user_id);

-- =========================================================
-- B. gaokao_exam_calendar
-- =========================================================
CREATE TABLE IF NOT EXISTS public.gaokao_exam_calendar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year_band smallint,
  event_type text NOT NULL,
  event_date date NOT NULL,
  label text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cal_year ON public.gaokao_exam_calendar(year_band, event_date);
ALTER TABLE public.gaokao_exam_calendar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read calendar" ON public.gaokao_exam_calendar FOR SELECT USING (true);

INSERT INTO public.gaokao_exam_calendar (year_band, event_type, event_date, label) VALUES
  (3, 'gaokao',   DATE '2026-06-07', '2026 高考'),
  (1, 'midterm',  DATE '2026-11-15', '高一期中'),
  (2, 'midterm',  DATE '2026-11-15', '高二期中'),
  (1, 'finals',   DATE '2027-01-15', '高一期末'),
  (2, 'finals',   DATE '2027-01-15', '高二上学期末')
ON CONFLICT DO NOTHING;

-- =========================================================
-- C. user_error_analysis
-- =========================================================
CREATE TABLE IF NOT EXISTS public.user_error_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  attempt_id uuid,
  error_type text NOT NULL CHECK (error_type IN ('knowledge_gap','speed','strategy','careless')),
  confidence numeric,
  evidence text,
  kp_id uuid,
  skill_area text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_uea_user_type ON public.user_error_analysis(user_id, error_type);
CREATE INDEX IF NOT EXISTS idx_uea_user_date ON public.user_error_analysis(user_id, created_at DESC);
ALTER TABLE public.user_error_analysis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own errors" ON public.user_error_analysis FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own errors" ON public.user_error_analysis FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =========================================================
-- D. profiles 扩列
-- =========================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS target_score integer DEFAULT 130,
  ADD COLUMN IF NOT EXISTS current_year_band smallint,
  ADD COLUMN IF NOT EXISTS gaokao_year integer;

-- =========================================================
-- E. RPC: get_user_dashboard_summary
-- =========================================================
CREATE OR REPLACE FUNCTION public.get_user_dashboard_summary(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  -- 严格鉴权：只能查自己
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RETURN '{}'::jsonb;
  END IF;

  WITH mastery_with_area AS (
    SELECT
      m.item_id,
      (m.mastery_level::numeric * 20.0) AS mastery_pct,
      COALESCE(v.skill_area, 'other') AS skill_area
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
    WHERE skill_area <> 'other'
    GROUP BY skill_area
  )
  SELECT jsonb_build_object(
    'dimensions', COALESCE((
      SELECT jsonb_object_agg(skill_area, jsonb_build_object(
        'score', ROUND(mastery_pct::numeric / 100.0 * dim_max),
        'max', dim_max,
        'mastery_pct', mastery_pct
      )) FROM dim_agg
    ), '{}'::jsonb),

    'kp_stats', jsonb_build_object(
      'total', (SELECT COUNT(*) FROM public.v_gaokao_all_knowledge_points),
      'mastered', (SELECT COUNT(*) FROM public.gaokao_user_mastery WHERE user_id = p_user_id AND mastery_level >= 4),
      'this_week_new', (SELECT COUNT(*) FROM public.gaokao_user_mastery WHERE user_id = p_user_id AND created_at > NOW() - INTERVAL '7 days')
    ),

    'attempt_stats', jsonb_build_object(
      'total_attempts', (SELECT COUNT(*) FROM public.gaokao_user_attempts WHERE user_id = p_user_id),
      'correct_rate', COALESCE((
        SELECT ROUND(AVG(CASE WHEN is_correct THEN 1 ELSE 0 END) * 100)
        FROM public.gaokao_user_attempts WHERE user_id = p_user_id
      ), 0),
      'last_30d_total', (SELECT COUNT(*) FROM public.gaokao_user_attempts WHERE user_id = p_user_id AND created_at > NOW() - INTERVAL '30 days')
    ),

    'error_distribution', COALESCE((
      SELECT jsonb_object_agg(error_type, count_pct)
      FROM (
        SELECT error_type,
               ROUND(COUNT(*)::numeric / NULLIF(SUM(COUNT(*)) OVER (), 0) * 100) AS count_pct
        FROM public.user_error_analysis
        WHERE user_id = p_user_id AND created_at > NOW() - INTERVAL '30 days'
        GROUP BY error_type
      ) t
    ), '{}'::jsonb),

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
      ) FROM public.profiles WHERE user_id = p_user_id LIMIT 1
    ), '{}'::jsonb)
  ) INTO v_result;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_dashboard_summary(uuid) TO authenticated;