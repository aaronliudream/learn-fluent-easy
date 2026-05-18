-- ============================================================
-- Fix: unified_mastery UNION ALL duplicate counting
-- ============================================================
--
-- Root causes identified:
--
-- 1. StageTestPlay writes BOTH recordUnifiedAttempt (→ unified_mastery_manual,
--    item_type='word') AND the domain table (primary_word_mastery /
--    junior_word_mastery). Both branches in the old view emitted
--    (module='vocab', item_type='word', item_id=word_id), producing the
--    same synthetic id twice → item counted twice in every aggregation.
--
-- 2. gaokao_user_mastery (item_type='vocab') and gaokao_user_attempts
--    (question_type='vocab') both mapped to (module='vocab',
--    item_type='vocab', item_id=word_id) → same synthetic id twice.
--
-- 3. JuniorVocab / GaokaoVocab call recordUnifiedAttempt(item_type='word')
--    AND recordCohortAttempt → gaokao_user_mastery(item_type='vocab').
--    Old view exposed these as (vocab,word,id) + (vocab,vocab,id) → two
--    rows per word with different item_type keys.
--
-- Fix strategy (DB-only, no application code changes required):
--
-- A. Normalize: gaokao_user_mastery rows with item_type='vocab' now emit
--    item_type='word' in the UNION branch (matching recordUnifiedAttempt).
--    Similarly for gaokao_user_attempts question_type='vocab'.
--    After normalisation all three sources above share the same key
--    (vocab, word, word_id) for vocabulary items.
--
-- B. Add a `deduped` CTE using DISTINCT ON (user_id, module, item_type,
--    item_id) that keeps exactly one row per logical item per user.
--    Tie-breaking preference order:
--      1. Rows with a FSRS due_at (domain table rows) over manual rows
--      2. Among equals, the row with the highest attempt_count
--    This ensures domain-table rows (which carry FSRS scheduling) always
--    win over lightweight manual rows, while manual-only items are still
--    visible.
--
-- All downstream aggregation views (mastery_with_proportions, etc.) are
-- rebuilt to pick up the corrected unified_mastery base.
-- ============================================================

-- Drop all views that depend on unified_mastery (in dependency order)
DROP VIEW IF EXISTS public.mastery_overall              CASCADE;
DROP VIEW IF EXISTS public.mastery_module_proportion   CASCADE;
DROP VIEW IF EXISTS public.mastery_stage_proportion    CASCADE;
DROP VIEW IF EXISTS public.mastery_with_proportions    CASCADE;
DROP VIEW IF EXISTS public.mastery_by_skill            CASCADE;
DROP VIEW IF EXISTS public.unified_mastery             CASCADE;

-- ── unified_mastery (deduplicated) ──────────────────────────────────────────
CREATE VIEW public.unified_mastery
WITH (security_invoker = on) AS
WITH src AS (
  -- Manual attempts layer (from record-attempt Edge Function)
  SELECT user_id, stage, grade, module, item_type, item_id, item_label,
         attempt_count, correct_count, wrong_count,
         due_at, last_review_at, updated_at
    FROM public.unified_mastery_manual

  UNION ALL
  -- Primary vocabulary (FSRS domain table)
  SELECT user_id, 'primary'::text, grade::int, 'vocab'::text,
         'word'::text, word_id::text, NULL::text,
         (COALESCE(quiz_correct,0)+COALESCE(quiz_wrong,0)+COALESCE(listen_correct,0)+COALESCE(listen_wrong,0)
          +COALESCE(spell_correct,0)+COALESCE(spell_wrong,0)+COALESCE(match_correct,0)+COALESCE(match_wrong,0))::int,
         (COALESCE(quiz_correct,0)+COALESCE(listen_correct,0)+COALESCE(spell_correct,0)+COALESCE(match_correct,0))::int,
         (COALESCE(quiz_wrong,0)+COALESCE(listen_wrong,0)+COALESCE(spell_wrong,0)+COALESCE(match_wrong,0))::int,
         due_at, last_seen_at, updated_at
    FROM public.primary_word_mastery

  UNION ALL
  -- Primary reading progress
  SELECT user_id, 'primary'::text, NULL::int, 'reading'::text, 'article'::text, article_id::text, NULL::text,
         1::int,
         CASE WHEN COALESCE(stars,0) >= 3 OR COALESCE(score,0) >= 80 THEN 1 ELSE 0 END,
         CASE WHEN COALESCE(stars,0) >= 3 OR COALESCE(score,0) >= 80 THEN 0 ELSE 1 END,
         NULL::timestamptz, completed_at, updated_at
    FROM public.primary_reading_progress

  UNION ALL
  -- Primary lesson progress
  SELECT user_id, 'primary'::text, NULL::int, 'lesson'::text, 'lesson'::text, lesson_id::text, NULL::text,
         GREATEST(COALESCE(steps_done,0),1)::int,
         CASE WHEN completed_at IS NOT NULL OR COALESCE(stars,0) >= 3 THEN 1 ELSE 0 END,
         CASE WHEN completed_at IS NOT NULL OR COALESCE(stars,0) >= 3 THEN 0 ELSE 1 END,
         NULL::timestamptz, last_seen_at, last_seen_at
    FROM public.primary_lesson_progress

  UNION ALL
  -- Primary speaking attempts
  SELECT user_id, 'primary'::text, grade::int, 'speaking'::text, 'sentence'::text, md5(target_sentence)::text, target_sentence,
         COUNT(*)::int,
         SUM(CASE WHEN COALESCE(overall_score,0) >= 80 THEN 1 ELSE 0 END)::int,
         SUM(CASE WHEN COALESCE(overall_score,0) >= 80 THEN 0 ELSE 1 END)::int,
         NULL::timestamptz, MAX(created_at), MAX(created_at)
    FROM public.primary_speaking_attempts
   GROUP BY user_id, grade, target_sentence

  UNION ALL
  -- Junior vocabulary (FSRS domain table)
  SELECT user_id, 'junior'::text, grade::int, 'vocab'::text, 'word'::text, word_id::text, NULL::text,
         (COALESCE(quiz_correct,0)+COALESCE(quiz_wrong,0)+COALESCE(listen_correct,0)+COALESCE(listen_wrong,0)
          +COALESCE(spell_correct,0)+COALESCE(spell_wrong,0)+COALESCE(match_correct,0)+COALESCE(match_wrong,0)
          +COALESCE(cloze_correct,0)+COALESCE(cloze_wrong,0)+COALESCE(reading_correct,0)+COALESCE(reading_wrong,0))::int,
         (COALESCE(quiz_correct,0)+COALESCE(listen_correct,0)+COALESCE(spell_correct,0)+COALESCE(match_correct,0)
          +COALESCE(cloze_correct,0)+COALESCE(reading_correct,0))::int,
         (COALESCE(quiz_wrong,0)+COALESCE(listen_wrong,0)+COALESCE(spell_wrong,0)+COALESCE(match_wrong,0)
          +COALESCE(cloze_wrong,0)+COALESCE(reading_wrong,0))::int,
         due_at, last_seen_at, updated_at
    FROM public.junior_word_mastery

  UNION ALL
  -- Junior listening attempts
  SELECT user_id, 'junior'::text, NULL::int, 'listening'::text, 'exercise'::text, exercise_id::text, NULL::text,
         COUNT(*)::int,
         SUM(CASE WHEN is_correct THEN 1 ELSE 0 END)::int,
         SUM(CASE WHEN is_correct THEN 0 ELSE 1 END)::int,
         NULL::timestamptz, MAX(created_at), MAX(created_at)
    FROM public.junior_listening_attempts
   GROUP BY user_id, exercise_id

  UNION ALL
  -- Junior writing attempts
  SELECT user_id, 'junior'::text, NULL::int, 'writing'::text, 'prompt'::text, prompt_id::text, NULL::text,
         COUNT(*)::int,
         SUM(CASE WHEN COALESCE(overall_score,0) >= 80 THEN 1 ELSE 0 END)::int,
         SUM(CASE WHEN COALESCE(overall_score,0) >= 80 THEN 0 ELSE 1 END)::int,
         NULL::timestamptz, MAX(created_at), MAX(created_at)
    FROM public.junior_writing_attempts
   GROUP BY user_id, prompt_id

  UNION ALL
  -- Junior grammar mastery
  SELECT user_id, 'junior'::text, NULL::int, 'grammar'::text, 'point'::text, point_id::text, NULL::text,
         COALESCE(attempts,0)::int,
         COALESCE(correct,0)::int,
         GREATEST(COALESCE(attempts,0)-COALESCE(correct,0),0)::int,
         NULL::timestamptz, last_practiced_at, updated_at
    FROM public.user_grammar_mastery

  UNION ALL
  -- Senior / Gaokao mastery (FSRS domain table)
  -- FIX A: normalize item_type='vocab' → 'word' to match recordUnifiedAttempt
  SELECT user_id, 'senior'::text, NULL::int,
         CASE WHEN item_type='vocab'         THEN 'vocab'
              WHEN item_type='grammar_point' THEN 'grammar'
              WHEN item_type='reading'       THEN 'reading'
              WHEN item_type='cloze'         THEN 'cloze'
              ELSE item_type END::text,
         CASE WHEN item_type='vocab' THEN 'word' ELSE item_type END::text,
         item_id::text, NULL::text,
         (COALESCE(correct_count,0)+COALESCE(wrong_count,0))::int,
         COALESCE(correct_count,0)::int, COALESCE(wrong_count,0)::int,
         COALESCE(due_at, next_review_at), last_seen_at, updated_at
    FROM public.gaokao_user_mastery

  UNION ALL
  -- Senior / Gaokao per-attempt records
  -- FIX A: normalize question_type='vocab' → item_type='word' to match above
  SELECT user_id, 'senior'::text, NULL::int,
         CASE WHEN question_type IN ('reading','cloze','grammar','vocab') THEN question_type ELSE 'reading' END::text,
         CASE WHEN question_type='vocab' THEN 'word' ELSE question_type END::text,
         question_id::text, NULL::text,
         COUNT(*)::int,
         SUM(CASE WHEN is_correct THEN 1 ELSE 0 END)::int,
         SUM(CASE WHEN is_correct THEN 0 ELSE 1 END)::int,
         NULL::timestamptz, MAX(created_at), MAX(created_at)
    FROM public.gaokao_user_attempts
   GROUP BY user_id, question_type, question_id

  UNION ALL
  -- mastery_progress (reading/cloze/listening/writing/grammar passages)
  SELECT user_id,
         CASE WHEN module LIKE 'gaokao%' OR module LIKE 'senior%' THEN 'senior'
              WHEN module LIKE 'junior%'                          THEN 'junior'
              WHEN module LIKE 'primary%'                         THEN 'primary'
              ELSE 'junior' END::text,
         NULL::int,
         CASE WHEN module LIKE '%reading%'   THEN 'reading'
              WHEN module LIKE '%cloze%'     THEN 'cloze'
              WHEN module LIKE '%listening%' THEN 'listening'
              WHEN module LIKE '%writing%'   THEN 'writing'
              WHEN module LIKE '%grammar%'   THEN 'grammar'
              WHEN module LIKE '%vocab%'     THEN 'vocab'
              ELSE module END::text,
         module::text, item_id::text, NULL::text,
         GREATEST(COALESCE(attempts,0),1)::int,
         CASE WHEN COALESCE(best_pct,0) >= 80 THEN GREATEST(COALESCE(attempts,0),1) ELSE 0 END,
         CASE WHEN COALESCE(best_pct,0) >= 80 THEN 0 ELSE GREATEST(COALESCE(attempts,0),1) END,
         next_review_at, last_attempt_at, updated_at
    FROM public.mastery_progress

  UNION ALL
  -- Flashcard attempts
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
  -- Slang / idiom mastery
  SELECT user_id, 'junior'::text, NULL::int, 'slang'::text, 'idiom'::text, idiom_id::text, NULL::text,
         (COALESCE(correct_count,0)+COALESCE(wrong_count,0))::int,
         COALESCE(correct_count,0)::int, COALESCE(wrong_count,0)::int,
         NULL::timestamptz, last_correct_at, updated_at
    FROM public.slang_mastery
),
-- FIX B: deduplicate — keep exactly one row per (user, module, item_type, item_id).
-- Prefer domain-table rows (those with a FSRS due_at), then prefer rows
-- with the highest attempt count.
deduped AS (
  SELECT DISTINCT ON (user_id, module, item_type, item_id)
    user_id, stage, grade, module, item_type, item_id, item_label,
    attempt_count, correct_count, wrong_count,
    due_at, last_review_at, updated_at
  FROM src
  WHERE item_id IS NOT NULL
  ORDER BY
    user_id, module, item_type, item_id,
    (due_at IS NOT NULL) DESC,  -- domain-table rows (FSRS) win over manual
    attempt_count DESC           -- then prefer whichever has more data
)
SELECT
  md5(user_id::text || '|' || COALESCE(module,'') || '|' || COALESCE(item_type,'') || '|' || COALESCE(item_id,''))::uuid AS id,
  user_id, stage, grade, module, item_type, item_id, item_label,
  attempt_count, correct_count, wrong_count,
  CASE WHEN attempt_count > 0
       THEN ROUND(100.0 * correct_count / attempt_count)::int ELSE 0 END AS accuracy_pct,
  CASE
    WHEN attempt_count = 0 THEN 'none'
    WHEN attempt_count >= 5 AND correct_count::float / NULLIF(attempt_count,0) >= 0.9 THEN 'master'
    WHEN attempt_count >= 3 AND correct_count::float / NULLIF(attempt_count,0) >= 0.7 THEN 'fluent'
    ELSE 'weak'
  END AS state,
  due_at, last_review_at, updated_at
FROM deduped;


-- ── Downstream aggregation views (rebuilt on corrected base) ────────────────

CREATE VIEW public.mastery_with_proportions
WITH (security_invoker = on) AS
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
totals AS (SELECT user_id, SUM(user_total) AS scope_total FROM per_scope GROUP BY user_id)
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

CREATE VIEW public.mastery_stage_proportion
WITH (security_invoker = on) AS
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

CREATE VIEW public.mastery_module_proportion
WITH (security_invoker = on) AS
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

CREATE VIEW public.mastery_by_skill
WITH (security_invoker = on) AS
WITH per_skill AS (
  SELECT user_id,
         CASE WHEN module IN ('grammar','reading','vocab','listening','writing','cloze','speaking','lesson') THEN module
              WHEN module = 'slang' THEN 'vocab'
              WHEN module = 'card'  THEN 'vocab'
              ELSE module END AS skill,
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

-- mastery_overall: overall totals per user (used by LearningCenter GPS ring)
-- Uses fluent*0.7 coefficient to match the original GPS formula.
CREATE VIEW public.mastery_overall
WITH (security_invoker = on) AS
SELECT user_id,
       COUNT(*)                                                 AS total,
       COUNT(*) FILTER (WHERE state='master')                  AS master,
       COUNT(*) FILTER (WHERE state='fluent')                  AS fluent,
       COUNT(*) FILTER (WHERE state='weak')                    AS weak,
       COUNT(*) FILTER (WHERE state='none')                    AS none,
       ROUND((COUNT(*) FILTER (WHERE state='master')
            + COUNT(*) FILTER (WHERE state='fluent') * 0.7)
            / NULLIF(COUNT(*),0)::numeric * 100, 1)            AS score_pct
  FROM public.unified_mastery
 GROUP BY user_id;

-- Restore grants
GRANT SELECT ON public.unified_mastery            TO authenticated, anon;
GRANT SELECT ON public.mastery_with_proportions   TO authenticated, anon;
GRANT SELECT ON public.mastery_stage_proportion   TO authenticated, anon;
GRANT SELECT ON public.mastery_module_proportion  TO authenticated, anon;
GRANT SELECT ON public.mastery_by_skill           TO authenticated, anon;
GRANT SELECT ON public.mastery_overall            TO authenticated, anon;
