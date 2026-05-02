-- Personalized "today" recommendations across the whole app
-- Returns structured candidates the client can render. SECURITY DEFINER + auth.uid().

CREATE OR REPLACE FUNCTION public.get_today_recommendations()
RETURNS TABLE(
  -- Counts of due reviews from every SRS-style source
  due_expressions     integer,  -- AI talk / lesson saved phrases
  due_vocab           integer,  -- gaokao_user_mastery item_type='vocab'
  due_grammar         integer,  -- gaokao_user_mastery item_type='grammar'
  due_slang           integer,  -- slang_mastery
  due_mistakes        integer,  -- gaokao_user_mistakes
  total_due           integer,

  -- Weakness signal: which mistake module has the most unresolved items (last 14d)
  weakest_module      text,     -- 'grammar' | 'cloze' | 'reading' | 'vocab' | NULL
  weakest_count       integer,

  -- Preference signal: which area did the user touch most in last 7 days
  -- One of: 'lesson','ai_talk','slang','scenes','workplace','gaokao_vocab',
  --         'gaokao_grammar','gaokao_reading','gaokao_cloze','review'
  top_area            text,
  top_area_count      integer,

  -- Activity flags
  active_today        boolean,
  current_streak      integer
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RETURN QUERY SELECT 0,0,0,0,0,0, NULL::text,0, NULL::text,0, false, 0;
    RETURN;
  END IF;

  RETURN QUERY
  WITH
    -- ===== Due review counts =====
    d_expr AS (
      SELECT COUNT(*)::int AS c
      FROM expression_reviews
      WHERE user_id = uid AND due_at <= now()
    ),
    d_vocab AS (
      SELECT COUNT(*)::int AS c
      FROM gaokao_user_mastery
      WHERE user_id = uid AND item_type = 'vocab'
        AND due_at IS NOT NULL AND due_at <= now()
    ),
    d_gram AS (
      SELECT COUNT(*)::int AS c
      FROM gaokao_user_mastery
      WHERE user_id = uid AND item_type = 'grammar'
        AND due_at IS NOT NULL AND due_at <= now()
    ),
    d_slang AS (
      SELECT COUNT(*)::int AS c
      FROM slang_mastery
      WHERE user_id = uid
        AND COALESCE(due_at, next_review_at) IS NOT NULL
        AND COALESCE(due_at, next_review_at) <= now()
    ),
    d_mist AS (
      SELECT COUNT(*)::int AS c
      FROM gaokao_user_mistakes
      WHERE user_id = uid AND is_resolved = false
        AND next_review_at <= now()
    ),

    -- ===== Weakness: most unresolved mistakes by module in last 14 days =====
    weak AS (
      SELECT module, COUNT(*)::int AS c
      FROM gaokao_user_mistakes
      WHERE user_id = uid
        AND is_resolved = false
        AND last_wrong_at >= now() - interval '14 days'
      GROUP BY module
      ORDER BY c DESC
      LIMIT 1
    ),

    -- ===== Preference: most-touched area in last 7 days =====
    -- Map raw event_type / lesson_key to a normalized area code
    ev AS (
      SELECT
        CASE
          WHEN event_type = 'lesson_complete' THEN 'lesson'
          WHEN event_type = 'ai_talk' THEN 'ai_talk'
          WHEN event_type = 'visit' AND lesson_key LIKE 'slang%' THEN 'slang'
          WHEN event_type = 'visit' AND lesson_key LIKE 'scenes%' THEN 'scenes'
          WHEN event_type = 'visit' AND lesson_key LIKE 'workplace%' THEN 'workplace'
          WHEN event_type = 'visit' AND lesson_key LIKE 'gaokao_vocab%' THEN 'gaokao_vocab'
          WHEN event_type = 'visit' AND lesson_key LIKE 'gaokao_grammar%' THEN 'gaokao_grammar'
          WHEN event_type = 'visit' AND lesson_key LIKE 'gaokao_reading%' THEN 'gaokao_reading'
          WHEN event_type = 'visit' AND lesson_key LIKE 'gaokao_cloze%' THEN 'gaokao_cloze'
          WHEN event_type = 'visit' AND lesson_key LIKE 'gaokao%' THEN 'gaokao_vocab'
          WHEN event_type = 'quiz' THEN 'review'
          ELSE NULL
        END AS area
      FROM learning_events
      WHERE user_id = uid
        AND created_at >= now() - interval '7 days'
    ),
    pref AS (
      SELECT area, COUNT(*)::int AS c
      FROM ev
      WHERE area IS NOT NULL
      GROUP BY area
      ORDER BY c DESC
      LIMIT 1
    ),

    -- ===== Streak / today active (4am day boundary, like get_user_streak_stats) =====
    days AS (
      SELECT DISTINCT ((created_at AT TIME ZONE 'UTC') - interval '4 hours')::date AS d
      FROM learning_events WHERE user_id = uid
    ),
    today_d AS (
      SELECT ((now() AT TIME ZONE 'UTC') - interval '4 hours')::date AS d
    ),
    s_calc AS (
      SELECT d, d - (ROW_NUMBER() OVER (ORDER BY d))::int AS grp FROM days
    ),
    s_groups AS (
      SELECT grp, COUNT(*)::int AS len, MAX(d) AS last_day FROM s_calc GROUP BY grp
    ),
    cur_s AS (
      SELECT COALESCE(MAX(len), 0)::int AS s
      FROM s_groups, today_d
      WHERE last_day >= today_d.d - 1
    ),
    today_a AS (
      SELECT EXISTS(SELECT 1 FROM days, today_d WHERE days.d = today_d.d) AS x
    )
  SELECT
    (SELECT c FROM d_expr),
    (SELECT c FROM d_vocab),
    (SELECT c FROM d_gram),
    (SELECT c FROM d_slang),
    (SELECT c FROM d_mist),
    (SELECT c FROM d_expr) + (SELECT c FROM d_vocab) + (SELECT c FROM d_gram)
      + (SELECT c FROM d_slang) + (SELECT c FROM d_mist),
    (SELECT module FROM weak),
    COALESCE((SELECT c FROM weak), 0),
    (SELECT area FROM pref),
    COALESCE((SELECT c FROM pref), 0),
    (SELECT x FROM today_a),
    (SELECT s FROM cur_s);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_today_recommendations() TO authenticated, anon;