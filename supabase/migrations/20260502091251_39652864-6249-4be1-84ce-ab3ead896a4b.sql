
-- 1. 给诊断表添加信心度和阅读速度字段
ALTER TABLE public.gaokao_reading_diagnostics
  ADD COLUMN IF NOT EXISTS confidence smallint CHECK (confidence BETWEEN 1 AND 3),
  ADD COLUMN IF NOT EXISTS reading_wpm integer,
  ADD COLUMN IF NOT EXISTS reading_seconds integer;

COMMENT ON COLUMN public.gaokao_reading_diagnostics.confidence IS '答题信心度: 1=猜的, 2=比较确定, 3=非常确定 (PISA金标准)';
COMMENT ON COLUMN public.gaokao_reading_diagnostics.reading_wpm IS '当篇文章阅读速度 Words Per Minute';
COMMENT ON COLUMN public.gaokao_reading_diagnostics.reading_seconds IS '当篇文章实际阅读用时(秒,不含答题)';

-- 2. 升级雷达图函数: 5维诊断 (新增 wpm 平均值 + 元认知准确度)
CREATE OR REPLACE FUNCTION public.get_reading_diagnostic_radar_v2()
RETURNS TABLE(
  question_type text,
  total_attempts integer,
  correct_count integer,
  accuracy real,
  top_error_tag text,
  top_error_count integer,
  avg_confidence real,
  metacog_accuracy real,
  high_conf_wrong integer
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RETURN; END IF;
  RETURN QUERY
  WITH base AS (
    SELECT d.question_type, d.is_correct, d.error_tags, d.confidence
    FROM gaokao_reading_diagnostics d
    WHERE d.user_id = uid
  ),
  agg AS (
    SELECT
      b.question_type,
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE b.is_correct)::int AS correct,
      AVG(b.confidence)::real AS avg_conf,
      -- 元认知准确度: (高信心答对 + 低信心答错) / 有信心数据的题
      (COUNT(*) FILTER (WHERE b.confidence IS NOT NULL AND ((b.confidence>=2 AND b.is_correct) OR (b.confidence=1 AND NOT b.is_correct)))::real
        / NULLIF(COUNT(*) FILTER (WHERE b.confidence IS NOT NULL), 0)) AS metacog,
      COUNT(*) FILTER (WHERE b.confidence=3 AND NOT b.is_correct)::int AS hcw
    FROM base b GROUP BY b.question_type
  ),
  errs AS (
    SELECT b.question_type, tag::text AS err, COUNT(*)::int AS c
    FROM base b, jsonb_array_elements_text(b.error_tags) tag
    WHERE NOT b.is_correct
    GROUP BY b.question_type, tag
  ),
  top_err AS (
    SELECT DISTINCT ON (e.question_type) e.question_type, e.err, e.c
    FROM errs e ORDER BY e.question_type, e.c DESC
  )
  SELECT
    a.question_type, a.total, a.correct,
    CASE WHEN a.total > 0 THEN a.correct::real / a.total ELSE 0 END,
    t.err, COALESCE(t.c, 0),
    a.avg_conf, a.metacog, a.hcw
  FROM agg a
  LEFT JOIN top_err t ON t.question_type = a.question_type
  ORDER BY a.total DESC;
END; $function$;

-- 3. 阅读效率综合视图函数: WPM + 理解率
CREATE OR REPLACE FUNCTION public.get_reading_efficiency()
RETURNS TABLE(
  articles_done integer,
  avg_wpm integer,
  avg_accuracy real,
  efficiency_index real,
  benchmark_label text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  uid uuid := auth.uid();
  v_wpm real;
  v_acc real;
  v_arts int;
  v_eff real;
BEGIN
  IF uid IS NULL THEN RETURN QUERY SELECT 0,0,0::real,0::real,'未开始'::text; RETURN; END IF;

  WITH per_article AS (
    SELECT article_id,
           AVG(reading_wpm) AS wpm,
           AVG(CASE WHEN is_correct THEN 1.0 ELSE 0.0 END) AS acc
    FROM gaokao_reading_diagnostics
    WHERE user_id = uid AND reading_wpm IS NOT NULL
    GROUP BY article_id
  )
  SELECT COUNT(*)::int, AVG(wpm)::real, AVG(acc)::real
  INTO v_arts, v_wpm, v_acc FROM per_article;

  v_arts := COALESCE(v_arts, 0);
  v_wpm := COALESCE(v_wpm, 0);
  v_acc := COALESCE(v_acc, 0);
  v_eff := v_wpm * v_acc;

  RETURN QUERY SELECT
    v_arts,
    v_wpm::int,
    v_acc,
    v_eff,
    CASE
      WHEN v_arts = 0 THEN '未开始'
      WHEN v_eff >= 70 THEN '🏆 高考优秀 (≥70)'
      WHEN v_eff >= 52 THEN '✅ 高考达标 (52-70)'
      WHEN v_eff >= 35 THEN '⚠️ 接近达标 (35-52)'
      ELSE '🔴 需大量训练 (<35)'
    END;
END; $function$;
