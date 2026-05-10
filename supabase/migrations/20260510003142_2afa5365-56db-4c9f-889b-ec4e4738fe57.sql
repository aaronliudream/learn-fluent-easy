
-- Snapshot function: aggregates current unified_mastery into mastery_snapshots for one date
CREATE OR REPLACE FUNCTION public.run_mastery_snapshot(_snap_date date DEFAULT CURRENT_DATE)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inserted_count integer;
BEGIN
  -- Per stage+grade+module rows
  INSERT INTO public.mastery_snapshots
    (user_id, snap_date, stage, grade, module, total, master, fluent, weak, none, score_pct)
  SELECT
    user_id, _snap_date, stage, grade, module,
    COUNT(*)::int AS total,
    COUNT(*) FILTER (WHERE state = 'master')::int,
    COUNT(*) FILTER (WHERE state = 'fluent')::int,
    COUNT(*) FILTER (WHERE state = 'weak')::int,
    COUNT(*) FILTER (WHERE state = 'none')::int,
    (COUNT(*) FILTER (WHERE state = 'master')::real
       / NULLIF(COUNT(*),0)::real * 100)::real
  FROM public.unified_mastery
  GROUP BY user_id, stage, grade, module
  ON CONFLICT (user_id, snap_date, stage, grade, module) DO UPDATE
    SET total = EXCLUDED.total,
        master = EXCLUDED.master,
        fluent = EXCLUDED.fluent,
        weak = EXCLUDED.weak,
        none = EXCLUDED.none,
        score_pct = EXCLUDED.score_pct;

  -- Overall row per user (NULL stage/grade/module)
  INSERT INTO public.mastery_snapshots
    (user_id, snap_date, stage, grade, module, total, master, fluent, weak, none, score_pct)
  SELECT
    user_id, _snap_date, NULL, NULL, NULL,
    COUNT(*)::int,
    COUNT(*) FILTER (WHERE state = 'master')::int,
    COUNT(*) FILTER (WHERE state = 'fluent')::int,
    COUNT(*) FILTER (WHERE state = 'weak')::int,
    COUNT(*) FILTER (WHERE state = 'none')::int,
    (COUNT(*) FILTER (WHERE state = 'master')::real
       / NULLIF(COUNT(*),0)::real * 100)::real
  FROM public.unified_mastery
  GROUP BY user_id
  ON CONFLICT (user_id, snap_date, stage, grade, module) DO UPDATE
    SET total = EXCLUDED.total,
        master = EXCLUDED.master,
        fluent = EXCLUDED.fluent,
        weak = EXCLUDED.weak,
        none = EXCLUDED.none,
        score_pct = EXCLUDED.score_pct;

  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  RETURN inserted_count;
END;
$$;

-- Enable cron + schedule daily at 18:00 UTC (≈ 02:00 Beijing next day)
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.unschedule('mastery-daily-snapshot')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'mastery-daily-snapshot');

SELECT cron.schedule(
  'mastery-daily-snapshot',
  '0 18 * * *',
  $$ SELECT public.run_mastery_snapshot(CURRENT_DATE); $$
);
