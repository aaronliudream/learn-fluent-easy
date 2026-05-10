
CREATE OR REPLACE VIEW public.mastery_with_proportions AS
WITH user_totals AS (
  SELECT user_id, COUNT(*) AS user_total
  FROM public.unified_mastery
  GROUP BY user_id
)
SELECT
  um.user_id,
  um.stage,
  um.grade,
  um.module,
  ut.user_total,
  COUNT(*) AS scope_total,
  COUNT(*) FILTER (WHERE state = 'master') AS master_count,
  COUNT(*) FILTER (WHERE state = 'fluent') AS fluent_count,
  COUNT(*) FILTER (WHERE state = 'weak')   AS weak_count,
  COUNT(*) FILTER (WHERE state = 'none')   AS none_count,
  ROUND(100.0 * COUNT(*) FILTER (WHERE state = 'master') / NULLIF(COUNT(*), 0), 1) AS master_pct,
  ROUND(100.0 * COUNT(*) FILTER (WHERE state = 'fluent') / NULLIF(COUNT(*), 0), 1) AS fluent_pct,
  ROUND(100.0 * COUNT(*) FILTER (WHERE state = 'weak')   / NULLIF(COUNT(*), 0), 1) AS weak_pct,
  ROUND(100.0 * COUNT(*) FILTER (WHERE state = 'none')   / NULLIF(COUNT(*), 0), 1) AS none_pct,
  ROUND(100.0 * (
    COUNT(*) FILTER (WHERE state = 'master')
    + COUNT(*) FILTER (WHERE state = 'fluent') * 0.7
    + COUNT(*) FILTER (WHERE state = 'weak') * 0.3
  ) / NULLIF(COUNT(*), 0), 1) AS score_pct,
  ROUND(100.0 * COUNT(*) / NULLIF(ut.user_total, 0), 1) AS proportion_of_total
FROM public.unified_mastery um
JOIN user_totals ut ON ut.user_id = um.user_id
GROUP BY um.user_id, um.stage, um.grade, um.module, ut.user_total;

CREATE OR REPLACE VIEW public.mastery_stage_proportion AS
WITH user_totals AS (
  SELECT user_id, COUNT(*) AS user_total
  FROM public.unified_mastery
  GROUP BY user_id
)
SELECT
  um.user_id,
  um.stage,
  COUNT(*) AS stage_total,
  ut.user_total,
  ROUND(100.0 * COUNT(*) / NULLIF(ut.user_total, 0), 1) AS proportion_pct,
  COUNT(*) FILTER (WHERE state = 'master') AS master_count,
  COUNT(*) FILTER (WHERE state = 'fluent') AS fluent_count,
  COUNT(*) FILTER (WHERE state = 'weak')   AS weak_count,
  COUNT(*) FILTER (WHERE state = 'none')   AS none_count,
  ROUND(100.0 * (
    COUNT(*) FILTER (WHERE state = 'master')
    + COUNT(*) FILTER (WHERE state = 'fluent') * 0.7
    + COUNT(*) FILTER (WHERE state = 'weak') * 0.3
  ) / NULLIF(COUNT(*), 0), 1) AS score_pct
FROM public.unified_mastery um
JOIN user_totals ut ON ut.user_id = um.user_id
GROUP BY um.user_id, um.stage, ut.user_total;

CREATE OR REPLACE VIEW public.mastery_module_proportion AS
WITH user_totals AS (
  SELECT user_id, COUNT(*) AS user_total
  FROM public.unified_mastery
  GROUP BY user_id
)
SELECT
  um.user_id,
  um.module,
  COUNT(*) AS module_total,
  ut.user_total,
  ROUND(100.0 * COUNT(*) / NULLIF(ut.user_total, 0), 1) AS proportion_pct,
  COUNT(*) FILTER (WHERE state = 'master') AS master_count,
  COUNT(*) FILTER (WHERE state = 'fluent') AS fluent_count,
  COUNT(*) FILTER (WHERE state = 'weak')   AS weak_count,
  COUNT(*) FILTER (WHERE state = 'none')   AS none_count,
  ROUND(100.0 * (
    COUNT(*) FILTER (WHERE state = 'master')
    + COUNT(*) FILTER (WHERE state = 'fluent') * 0.7
    + COUNT(*) FILTER (WHERE state = 'weak') * 0.3
  ) / NULLIF(COUNT(*), 0), 1) AS score_pct
FROM public.unified_mastery um
JOIN user_totals ut ON ut.user_id = um.user_id
GROUP BY um.user_id, um.module, ut.user_total;

ALTER VIEW public.mastery_with_proportions  SET (security_invoker = true);
ALTER VIEW public.mastery_stage_proportion  SET (security_invoker = true);
ALTER VIEW public.mastery_module_proportion SET (security_invoker = true);
