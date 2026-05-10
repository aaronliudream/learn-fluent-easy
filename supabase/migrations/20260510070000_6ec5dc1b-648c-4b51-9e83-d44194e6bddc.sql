
-- ============================================================
-- Stage 1: viewify unified_mastery + add mastery_by_skill view
-- ============================================================

-- 1. Drop dependent views (will recreate)
DROP VIEW IF EXISTS public.mastery_module_proportion CASCADE;
DROP VIEW IF EXISTS public.mastery_stage_proportion  CASCADE;
DROP VIEW IF EXISTS public.mastery_with_proportions  CASCADE;
DROP VIEW IF EXISTS public.mastery_by_skill          CASCADE;

-- 2. Preserve the existing unified_mastery table (24 historical rows + future
--    record-attempt writes keep landing here). Rename to *_manual.
ALTER TABLE IF EXISTS public.unified_mastery RENAME TO unified_mastery_manual;

-- 3. Helper: state formula expressed inline; we wrap source rows in subqueries.

-- 4. Create the new unified_mastery VIEW
CREATE OR REPLACE VIEW public.unified_mastery AS
WITH src AS (
  -- ---------- legacy direct writes ----------
  SELECT user_id, stage, grade, module, item_type, item_id, item_label,
         attempt_count, correct_count, wrong_count,
         due_at, last_review_at, updated_at
    FROM public.unified_mastery_manual

  UNION ALL
  -- ---------- primary vocab ----------
  SELECT user_id, 'primary'::text, grade::int, 'vocab'::text,
         'word'::text, word_id::text, NULL::text,
         (COALESCE(quiz_correct,0)+COALESCE(quiz_wrong,0)
          +COALESCE(listen_correct,0)+COALESCE(listen_wrong,0)
          +COALESCE(spell_correct,0)+COALESCE(spell_wrong,0)
          +COALESCE(match_correct,0)+COALESCE(match_wrong,0))::int,
         (COALESCE(quiz_correct,0)+COALESCE(listen_correct,0)
          +COALESCE(spell_correct,0)+COALESCE(match_correct,0))::int,
         (COALESCE(quiz_wrong,0)+COALESCE(listen_wrong,0)
          +COALESCE(spell_wrong,0)+COALESCE(match_wrong,0))::int,
         due_at, last_seen_at, updated_at
    FROM public.primary_word_mastery

  UNION ALL
  -- ---------- primary reading ----------
  SELECT user_id, 'primary'::text, NULL::int, 'reading'::text,
         'article'::text, article_id::text, NULL::text,
         1::int,
         CASE WHEN COALESCE(stars,0) >= 3 OR COALESCE(score,0) >= 80 THEN 1 ELSE 0 END,
         CASE WHEN COALESCE(stars,0) >= 3 OR COALESCE(score,0) >= 80 THEN 0 ELSE 1 END,
         NULL::timestamptz, completed_at, updated_at
    FROM public.primary_reading_progress

  UNION ALL
  -- ---------- primary lesson ----------
  SELECT user_id, 'primary'::text, NULL::int, 'lesson'::text,
         'lesson'::text, lesson_id::text, NULL::text,
         GREATEST(COALESCE(steps_done,0),1)::int,
         CASE WHEN completed_at IS NOT NULL OR COALESCE(stars,0) >= 3 THEN 1 ELSE 0 END,
         CASE WHEN completed_at IS NOT NULL OR COALESCE(stars,0) >= 3 THEN 0 ELSE 1 END,
         NULL::timestamptz, last_seen_at, last_seen_at
    FROM public.primary_lesson_progress

  UNION ALL
  -- ---------- primary speaking (group per sentence) ----------
  SELECT user_id, 'primary'::text, grade::int, 'speaking'::text,
         'sentence'::text, md5(target_sentence)::text, target_sentence,
         COUNT(*)::int,
         SUM(CASE WHEN COALESCE(overall_score,0) >= 80 THEN 1 ELSE 0 END)::int,
         SUM(CASE WHEN COALESCE(overall_score,0) >= 80 THEN 0 ELSE 1 END)::int,
         NULL::timestamptz, MAX(created_at), MAX(created_at)
    FROM public.primary_speaking_attempts
   GROUP BY user_id, grade, target_sentence

  UNION ALL
  -- ---------- junior vocab ----------
  SELECT user_id, 'junior'::text, grade::int, 'vocab'::text,
         'word'::text, word_id::text, NULL::text,
         (COALESCE(quiz_correct,0)+COALESCE(quiz_wrong,0)
          +COALESCE(listen_correct,0)+COALESCE(listen_wrong,0)
          +COALESCE(spell_correct,0)+COALESCE(spell_wrong,0)
          +COALESCE(match_correct,0)+COALESCE(match_wrong,0)
          +COALESCE(cloze_correct,0)+COALESCE(cloze_wrong,0)
          +COALESCE(reading_correct,0)+COALESCE(reading_wrong,0))::int,
         (COALESCE(quiz_correct,0)+COALESCE(listen_correct,0)
          +COALESCE(spell_correct,0)+COALESCE(match_correct,0)
          +COALESCE(cloze_correct,0)+COALESCE(reading_correct,0))::int,
         (COALESCE(quiz_wrong,0)+COALESCE(listen_wrong,0)
          +COALESCE(spell_wrong,0)+COALESCE(match_wrong,0)
          +COALESCE(cloze_wrong,0)+COALESCE(reading_wrong,0))::int,
         due_at, last_seen_at, updated_at
    FROM public.junior_word_mastery

  UNION ALL
  -- ---------- junior listening (group per exercise) ----------
  SELECT user_id, 'junior'::text, NULL::int, 'listening'::text,
         'exercise'::text, exercise_id::text, NULL::text,
         COUNT(*)::int,
         SUM(CASE WHEN is_correct THEN 1 ELSE 0 END)::int,
         SUM(CASE WHEN is_correct THEN 0 ELSE 1 END)::int,
         NULL::timestamptz, MAX(created_at), MAX(created_at)
    FROM public.junior_listening_attempts
   GROUP BY user_id, exercise_id

  UNION ALL
  -- ---------- junior writing (group per prompt, max score) ----------
  SELECT user_id, 'junior'::text, NULL::int, 'writing'::text,
         'prompt'::text, prompt_id::text, NULL::text,
         COUNT(*)::int,
         SUM(CASE WHEN COALESCE(overall_score,0) >= 80 THEN 1 ELSE 0 END)::int,
         SUM(CASE WHEN COALESCE(overall_score,0) >= 80 THEN 0 ELSE 1 END)::int,
         NULL::timestamptz, MAX(created_at), MAX(created_at)
    FROM public.junior_writing_attempts
   GROUP BY user_id, prompt_id

  UNION ALL
  -- ---------- grammar mastery (junior + senior unified) ----------
  SELECT user_id, 'junior'::text, NULL::int, 'grammar'::text,
         'point'::text, point_id::text, NULL::text,
         COALESCE(attempts,0)::int,
         COALESCE(correct,0)::int,
         GREATEST(COALESCE(attempts,0)-COALESCE(correct,0),0)::int,
         NULL::timestamptz, last_practiced_at, updated_at
    FROM public.user_grammar_mastery

  UNION ALL
  -- ---------- gaokao mastery (vocab / grammar_point / reading / cloze) ----------
  SELECT user_id, 'senior'::text, NULL::int,
         CASE
           WHEN item_type = 'vocab'         THEN 'vocab'
           WHEN item_type = 'grammar_point' THEN 'grammar'
           WHEN item_type = 'reading'       THEN 'reading'
           WHEN item_type = 'cloze'         THEN 'cloze'
           ELSE item_type
         END::text,
         item_type::text, item_id::text, NULL::text,
         (COALESCE(correct_count,0)+COALESCE(wrong_count,0))::int,
         COALESCE(correct_count,0)::int,
         COALESCE(wrong_count,0)::int,
         COALESCE(due_at, next_review_at), last_seen_at, updated_at
    FROM public.gaokao_user_mastery

  UNION ALL
  -- ---------- gaokao raw attempts (group per question) ----------
  SELECT user_id, 'senior'::text, NULL::int,
         CASE
           WHEN question_type IN ('reading','cloze','grammar','vocab') THEN question_type
           ELSE 'reading'
         END::text,
         question_type::text, question_id::text, NULL::text,
         COUNT(*)::int,
         SUM(CASE WHEN is_correct THEN 1 ELSE 0 END)::int,
         SUM(CASE WHEN is_correct THEN 0 ELSE 1 END)::int,
         NULL::timestamptz, MAX(created_at), MAX(created_at)
    FROM public.gaokao_user_attempts
   GROUP BY user_id, question_type, question_id

  UNION ALL
  -- ---------- mastery_progress (cross-stage: gaokao_reading, gaokao_cloze, junior_reading, etc.) ----------
  SELECT user_id,
         CASE
           WHEN module LIKE 'gaokao%' OR module LIKE 'senior%' THEN 'senior'
           WHEN module LIKE 'junior%'                          THEN 'junior'
           WHEN module LIKE 'primary%'                         THEN 'primary'
           ELSE 'junior'
         END::text,
         NULL::int,
         CASE
           WHEN module LIKE '%reading%'   THEN 'reading'
           WHEN module LIKE '%cloze%'     THEN 'cloze'
           WHEN module LIKE '%listening%' THEN 'listening'
           WHEN module LIKE '%writing%'   THEN 'writing'
           WHEN module LIKE '%grammar%'   THEN 'grammar'
           WHEN module LIKE '%vocab%'     THEN 'vocab'
           ELSE module
         END::text,
         module::text, item_id::text, NULL::text,
         GREATEST(COALESCE(attempts,0),1)::int,
         CASE WHEN COALESCE(best_pct,0) >= 80 THEN GREATEST(COALESCE(attempts,0),1) ELSE 0 END,
         CASE WHEN COALESCE(best_pct,0) >= 80 THEN 0 ELSE GREATEST(COALESCE(attempts,0),1) END,
         next_review_at, last_attempt_at, updated_at
    FROM public.mastery_progress

  UNION ALL
  -- ---------- card_attempts (group per card) ----------
  SELECT user_id, COALESCE(stage,'junior')::text, NULL::int,
         'card'::text, 'card'::text, card_id::text, NULL::text,
         COUNT(*)::int,
         SUM(CASE WHEN COALESCE(score_pct,0) >= 80 THEN 1 ELSE 0 END)::int,
         SUM(CASE WHEN COALESCE(score_pct,0) >= 80 THEN 0 ELSE 1 END)::int,
         NULL::timestamptz, MAX(created_at), MAX(created_at)
    FROM public.card_attempts
   WHERE user_id IS NOT NULL
   GROUP BY user_id, stage, card_id

  UNION ALL
  -- ---------- slang mastery ----------
  SELECT user_id, 'junior'::text, NULL::int, 'slang'::text,
         'idiom'::text, idiom_id::text, NULL::text,
         (COALESCE(correct_count,0)+COALESCE(wrong_count,0))::int,
         COALESCE(correct_count,0)::int,
         COALESCE(wrong_count,0)::int,
         NULL::timestamptz, last_correct_at, updated_at
    FROM public.slang_mastery
)
SELECT
  user_id, stage, grade, module, item_type, item_id, item_label,
  attempt_count, correct_count, wrong_count,
  CASE WHEN attempt_count > 0
       THEN ROUND(100.0 * correct_count / attempt_count)::int
       ELSE 0
  END AS accuracy_pct,
  CASE
    WHEN attempt_count = 0 THEN 'none'
    WHEN attempt_count >= 5 AND correct_count::float / NULLIF(attempt_count,0) >= 0.9 THEN 'master'
    WHEN attempt_count >= 3 AND correct_count::float / NULLIF(attempt_count,0) >= 0.7 THEN 'fluent'
    ELSE 'weak'
  END AS state,
  due_at, last_review_at, updated_at
FROM src
WHERE item_id IS NOT NULL;

-- 5. Recreate the 3 dependent proportion views on top of the new view.
CREATE OR REPLACE VIEW public.mastery_with_proportions AS
WITH per_scope AS (
  SELECT user_id, stage, grade, module,
         COUNT(*) AS user_total,
         SUM(CASE WHEN state='master' THEN 1 ELSE 0 END) AS master_count,
         SUM(CASE WHEN state='fluent' THEN 1 ELSE 0 END) AS fluent_count,
         SUM(CASE WHEN state='weak'   THEN 1 ELSE 0 END) AS weak_count,
         SUM(CASE WHEN state='none'   THEN 1 ELSE 0 END) AS none_count
    FROM public.unified_mastery
   GROUP BY user_id, stage, grade, module
),
totals AS (
  SELECT user_id, SUM(user_total) AS scope_total FROM per_scope GROUP BY user_id
)
SELECT p.user_id, p.stage, p.grade, p.module,
       p.user_total, t.scope_total,
       p.master_count, p.fluent_count, p.weak_count, p.none_count,
       ROUND(100.0 * p.master_count / NULLIF(p.user_total,0), 2) AS master_pct,
       ROUND(100.0 * p.fluent_count / NULLIF(p.user_total,0), 2) AS fluent_pct,
       ROUND(100.0 * p.weak_count   / NULLIF(p.user_total,0), 2) AS weak_pct,
       ROUND(100.0 * p.none_count   / NULLIF(p.user_total,0), 2) AS none_pct,
       ROUND(100.0 * (p.master_count + 0.5*p.fluent_count) / NULLIF(p.user_total,0), 2) AS score_pct,
       ROUND(100.0 * p.user_total / NULLIF(t.scope_total,0), 2) AS proportion_of_total
  FROM per_scope p JOIN totals t USING (user_id);

CREATE OR REPLACE VIEW public.mastery_stage_proportion AS
WITH per_stage AS (
  SELECT user_id, stage,
         COUNT(*) AS stage_total,
         SUM(CASE WHEN state='master' THEN 1 ELSE 0 END) AS master_count,
         SUM(CASE WHEN state='fluent' THEN 1 ELSE 0 END) AS fluent_count,
         SUM(CASE WHEN state='weak'   THEN 1 ELSE 0 END) AS weak_count,
         SUM(CASE WHEN state='none'   THEN 1 ELSE 0 END) AS none_count
    FROM public.unified_mastery
   GROUP BY user_id, stage
),
totals AS (SELECT user_id, SUM(stage_total) AS user_total FROM per_stage GROUP BY user_id)
SELECT s.user_id, s.stage, s.stage_total, t.user_total,
       ROUND(100.0 * s.stage_total / NULLIF(t.user_total,0), 2) AS proportion_pct,
       s.master_count, s.fluent_count, s.weak_count, s.none_count,
       ROUND(100.0 * (s.master_count + 0.5*s.fluent_count) / NULLIF(s.stage_total,0), 2) AS score_pct
  FROM per_stage s JOIN totals t USING (user_id);

CREATE OR REPLACE VIEW public.mastery_module_proportion AS
WITH per_mod AS (
  SELECT user_id, module,
         COUNT(*) AS module_total,
         SUM(CASE WHEN state='master' THEN 1 ELSE 0 END) AS master_count,
         SUM(CASE WHEN state='fluent' THEN 1 ELSE 0 END) AS fluent_count,
         SUM(CASE WHEN state='weak'   THEN 1 ELSE 0 END) AS weak_count,
         SUM(CASE WHEN state='none'   THEN 1 ELSE 0 END) AS none_count
    FROM public.unified_mastery
   GROUP BY user_id, module
),
totals AS (SELECT user_id, SUM(module_total) AS user_total FROM per_mod GROUP BY user_id)
SELECT m.user_id, m.module, m.module_total, t.user_total,
       ROUND(100.0 * m.module_total / NULLIF(t.user_total,0), 2) AS proportion_pct,
       m.master_count, m.fluent_count, m.weak_count, m.none_count,
       ROUND(100.0 * (m.master_count + 0.5*m.fluent_count) / NULLIF(m.module_total,0), 2) AS score_pct
  FROM per_mod m JOIN totals t USING (user_id);

-- 6. New: skill-axis aggregate for the radar chart (cross-stage)
CREATE OR REPLACE VIEW public.mastery_by_skill AS
WITH per_skill AS (
  SELECT user_id,
         CASE
           WHEN module IN ('grammar','reading','vocab','listening','writing','cloze','speaking') THEN module
           WHEN module = 'lesson' THEN 'lesson'
           WHEN module = 'slang'  THEN 'vocab'
           WHEN module = 'card'   THEN 'vocab'
           ELSE module
         END AS skill,
         COUNT(*) AS total,
         SUM(CASE WHEN state='master' THEN 1 ELSE 0 END) AS master_count,
         SUM(CASE WHEN state='fluent' THEN 1 ELSE 0 END) AS fluent_count,
         SUM(CASE WHEN state='weak'   THEN 1 ELSE 0 END) AS weak_count,
         SUM(CASE WHEN state='none'   THEN 1 ELSE 0 END) AS none_count,
         SUM(attempt_count) AS attempts,
         SUM(correct_count) AS corrects
    FROM public.unified_mastery
   GROUP BY user_id, 2
)
SELECT user_id, skill, total,
       master_count, fluent_count, weak_count, none_count, attempts, corrects,
       ROUND(100.0 * (master_count + 0.5*fluent_count) / NULLIF(total,0), 2) AS score_pct,
       ROUND(100.0 * corrects / NULLIF(attempts,0), 2)                       AS accuracy_pct
  FROM per_skill;

-- 7. Re-grant select to authenticated/anon as before
GRANT SELECT ON public.unified_mastery            TO authenticated, anon;
GRANT SELECT ON public.mastery_with_proportions   TO authenticated, anon;
GRANT SELECT ON public.mastery_stage_proportion   TO authenticated, anon;
GRANT SELECT ON public.mastery_module_proportion  TO authenticated, anon;
GRANT SELECT ON public.mastery_by_skill           TO authenticated, anon;
