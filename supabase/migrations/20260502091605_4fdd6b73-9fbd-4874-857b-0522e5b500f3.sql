
-- 1. 阅读文章表加蓝思值/可读性指标
ALTER TABLE public.gaokao_reading_articles
  ADD COLUMN IF NOT EXISTS lexile_score integer,
  ADD COLUMN IF NOT EXISTS avg_sentence_length real,
  ADD COLUMN IF NOT EXISTS avg_word_length real,
  ADD COLUMN IF NOT EXISTS readability_grade real;

CREATE INDEX IF NOT EXISTS idx_articles_lexile ON public.gaokao_reading_articles(lexile_score);

COMMENT ON COLUMN public.gaokao_reading_articles.lexile_score IS '蓝思值 200L-1500L (MetaMetrics 国际标准)';
COMMENT ON COLUMN public.gaokao_reading_articles.readability_grade IS 'Flesch-Kincaid Grade Level 美式年级';

-- 2. 用户能力蓝思值估算: 基于近30天 efficiency × accuracy
CREATE OR REPLACE FUNCTION public.get_user_reading_lexile()
RETURNS TABLE(
  estimated_lexile integer,
  optimal_min integer,
  optimal_max integer,
  challenge_min integer,
  challenge_max integer,
  cefr_estimate text,
  articles_used integer,
  confidence text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  uid uuid := auth.uid();
  v_avg_lex real;
  v_avg_acc real;
  v_count int;
  v_est int;
BEGIN
  IF uid IS NULL THEN
    RETURN QUERY SELECT 800, 750, 850, 850, 950, 'B1'::text, 0, 'unknown'::text;
    RETURN;
  END IF;

  -- 近 30 天内做过的文章: 用蓝思值×正确率 加权
  WITH recent AS (
    SELECT DISTINCT ON (d.article_id)
      d.article_id,
      a.lexile_score,
      AVG(CASE WHEN d.is_correct THEN 1.0 ELSE 0.0 END)
        OVER (PARTITION BY d.article_id) AS acc
    FROM gaokao_reading_diagnostics d
    JOIN gaokao_reading_articles a ON a.id = d.article_id
    WHERE d.user_id = uid
      AND d.created_at > now() - interval '30 days'
      AND a.lexile_score IS NOT NULL
  )
  SELECT
    AVG(lexile_score)::real,
    AVG(acc)::real,
    COUNT(*)::int
  INTO v_avg_lex, v_avg_acc, v_count
  FROM recent;

  v_count := COALESCE(v_count, 0);

  IF v_count = 0 THEN
    -- 冷启动: 默认 B1 ~ 800L
    RETURN QUERY SELECT 800, 750, 850, 850, 950, 'B1 (默认)'::text, 0, 'cold_start'::text;
    RETURN;
  END IF;

  -- 估算公式: 平均做过的难度 + (正确率-0.7) × 200
  -- 准确率高 → 推升能力; 准确率低 → 拉低
  v_est := GREATEST(300, LEAST(1400,
    (COALESCE(v_avg_lex, 800) + (COALESCE(v_avg_acc, 0.5) - 0.70) * 200)::int
  ));

  RETURN QUERY SELECT
    v_est,
    v_est - 50, v_est + 50,           -- 最佳学习区 ±50L
    v_est + 50, v_est + 150,          -- 挑战区 +50~+150L
    CASE
      WHEN v_est < 500 THEN 'A1'
      WHEN v_est < 700 THEN 'A2'
      WHEN v_est < 950 THEN 'B1'
      WHEN v_est < 1150 THEN 'B2'
      WHEN v_est < 1350 THEN 'C1'
      ELSE 'C2'
    END,
    v_count,
    CASE
      WHEN v_count >= 8 THEN 'high'
      WHEN v_count >= 3 THEN 'medium'
      ELSE 'low'
    END;
END; $function$;

-- 3. 自适应推荐: 返回 6 篇文章 (3 篇最佳 + 2 篇巩固 + 1 篇挑战)
CREATE OR REPLACE FUNCTION public.get_lexile_recommendations()
RETURNS TABLE(
  article_id uuid,
  title text,
  lexile_score integer,
  grade_band text,
  genre_label text,
  specific_topic text,
  word_count integer,
  recommended_minutes integer,
  zone text,
  zone_label text,
  done_before boolean
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  uid uuid := auth.uid();
  v_lex int;
BEGIN
  -- 获取用户能力
  SELECT estimated_lexile INTO v_lex FROM public.get_user_reading_lexile();
  v_lex := COALESCE(v_lex, 800);

  RETURN QUERY
  WITH done AS (
    SELECT DISTINCT article_id FROM gaokao_reading_diagnostics
    WHERE user_id = COALESCE(uid, '00000000-0000-0000-0000-000000000000'::uuid)
  ),
  scored AS (
    SELECT
      a.id, a.title, a.lexile_score, a.grade_band, a.genre_label,
      a.specific_topic, a.word_count, a.recommended_minutes,
      CASE
        WHEN ABS(a.lexile_score - v_lex) <= 50  THEN 'optimal'
        WHEN a.lexile_score BETWEEN v_lex - 150 AND v_lex - 50 THEN 'reinforce'
        WHEN a.lexile_score BETWEEN v_lex + 50 AND v_lex + 150 THEN 'challenge'
        ELSE 'other'
      END AS z,
      EXISTS(SELECT 1 FROM done WHERE done.article_id = a.id) AS dn,
      ABS(a.lexile_score - v_lex) AS dist
    FROM gaokao_reading_articles a
    WHERE a.is_published = true AND a.lexile_score IS NOT NULL
  ),
  ranked AS (
    SELECT *,
      ROW_NUMBER() OVER (PARTITION BY z ORDER BY dn ASC, dist ASC) AS rn
    FROM scored
    WHERE z <> 'other'
  )
  SELECT
    r.id, r.title, r.lexile_score, r.grade_band, r.genre_label,
    r.specific_topic, r.word_count, r.recommended_minutes,
    r.z,
    CASE r.z
      WHEN 'optimal'   THEN '🎯 最适合你'
      WHEN 'reinforce' THEN '✅ 巩固区'
      WHEN 'challenge' THEN '🔥 挑战区'
    END,
    r.dn
  FROM ranked r
  WHERE (r.z = 'optimal'   AND r.rn <= 3)
     OR (r.z = 'reinforce' AND r.rn <= 2)
     OR (r.z = 'challenge' AND r.rn <= 1)
  ORDER BY
    CASE r.z WHEN 'optimal' THEN 1 WHEN 'challenge' THEN 2 ELSE 3 END,
    r.rn;
END; $function$;
