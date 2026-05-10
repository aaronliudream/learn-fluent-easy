
-- ============== Stage 1.1 unified_mastery ==============
CREATE TABLE IF NOT EXISTS public.unified_mastery (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stage           text NOT NULL CHECK (stage IN ('primary','junior','senior')),
  grade           int  NOT NULL CHECK (grade BETWEEN 1 AND 12),
  module          text NOT NULL CHECK (module IN ('vocab','grammar','reading','writing','listening','cloze','phonics')),
  item_type       text NOT NULL,
  item_id         text NOT NULL,
  item_label      text,
  state           text NOT NULL DEFAULT 'none' CHECK (state IN ('master','fluent','weak','none')),
  ease            real DEFAULT 2.5,
  interval_days   real DEFAULT 0,
  due_at          timestamptz,
  last_review_at  timestamptz,
  attempt_count   int  DEFAULT 0,
  correct_count   int  DEFAULT 0,
  wrong_count     int  DEFAULT 0,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  UNIQUE(user_id, stage, grade, module, item_type, item_id)
);

CREATE INDEX IF NOT EXISTS idx_um_user_stage  ON public.unified_mastery(user_id, stage);
CREATE INDEX IF NOT EXISTS idx_um_user_grade  ON public.unified_mastery(user_id, grade);
CREATE INDEX IF NOT EXISTS idx_um_user_state  ON public.unified_mastery(user_id, state);
CREATE INDEX IF NOT EXISTS idx_um_user_due    ON public.unified_mastery(user_id, due_at) WHERE state IN ('weak','fluent');
CREATE INDEX IF NOT EXISTS idx_um_user_module ON public.unified_mastery(user_id, module);

ALTER TABLE public.unified_mastery ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users see own mastery"   ON public.unified_mastery;
DROP POLICY IF EXISTS "users insert own mastery" ON public.unified_mastery;
DROP POLICY IF EXISTS "users update own mastery" ON public.unified_mastery;
CREATE POLICY "users see own mastery"   ON public.unified_mastery FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users insert own mastery" ON public.unified_mastery FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own mastery" ON public.unified_mastery FOR UPDATE USING (auth.uid() = user_id);

-- ============== Stage 1.2 mastery_snapshots ==============
CREATE TABLE IF NOT EXISTS public.mastery_snapshots (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snap_date   date NOT NULL,
  stage       text,
  grade       int,
  module      text,
  total       int NOT NULL,
  master      int NOT NULL DEFAULT 0,
  fluent      int NOT NULL DEFAULT 0,
  weak        int NOT NULL DEFAULT 0,
  none        int NOT NULL DEFAULT 0,
  score_pct   real NOT NULL DEFAULT 0,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(user_id, snap_date, stage, grade, module)
);
CREATE INDEX IF NOT EXISTS idx_snap_user_date ON public.mastery_snapshots(user_id, snap_date DESC);
ALTER TABLE public.mastery_snapshots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users see own snapshots" ON public.mastery_snapshots;
CREATE POLICY "users see own snapshots" ON public.mastery_snapshots FOR SELECT USING (auth.uid() = user_id);

-- ============== Stage 1.3 ai_diagnostics + logs ==============
CREATE TABLE IF NOT EXISTS public.ai_diagnostics (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  generated_at    timestamptz DEFAULT now(),
  insights        jsonb NOT NULL DEFAULT '[]'::jsonb,
  summary         text,
  expected_gain   text,
  expires_at      timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  UNIQUE(user_id, generated_at)
);
CREATE INDEX IF NOT EXISTS idx_diag_user_expires ON public.ai_diagnostics(user_id, expires_at DESC);
ALTER TABLE public.ai_diagnostics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users see own diagnostics" ON public.ai_diagnostics;
CREATE POLICY "users see own diagnostics" ON public.ai_diagnostics FOR SELECT USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.ai_diagnostic_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid,
  call_at     timestamptz DEFAULT now(),
  was_cached  boolean DEFAULT false,
  was_template boolean DEFAULT false,
  tokens_used int DEFAULT 0,
  model_used  text
);
CREATE INDEX IF NOT EXISTS idx_diag_logs_call_at ON public.ai_diagnostic_logs(call_at DESC);
ALTER TABLE public.ai_diagnostic_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin only diag logs" ON public.ai_diagnostic_logs;
CREATE POLICY "admin only diag logs" ON public.ai_diagnostic_logs FOR SELECT USING (false);

-- ============== Stage 1.5 Views ==============
CREATE OR REPLACE VIEW public.mastery_overall AS
SELECT user_id,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE state='master') AS master,
  COUNT(*) FILTER (WHERE state='fluent') AS fluent,
  COUNT(*) FILTER (WHERE state='weak')   AS weak,
  COUNT(*) FILTER (WHERE state='none')   AS none,
  ROUND((COUNT(*) FILTER (WHERE state='master') + COUNT(*) FILTER (WHERE state='fluent')*0.7)
        / NULLIF(COUNT(*),0)::numeric * 100, 1) AS score_pct
FROM public.unified_mastery GROUP BY user_id;

CREATE OR REPLACE VIEW public.mastery_by_stage AS
SELECT user_id, stage,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE state='master') AS master,
  COUNT(*) FILTER (WHERE state='fluent') AS fluent,
  COUNT(*) FILTER (WHERE state='weak')   AS weak,
  COUNT(*) FILTER (WHERE state='none')   AS none,
  ROUND((COUNT(*) FILTER (WHERE state='master') + COUNT(*) FILTER (WHERE state='fluent')*0.7)
        / NULLIF(COUNT(*),0)::numeric * 100, 1) AS score_pct
FROM public.unified_mastery GROUP BY user_id, stage;

CREATE OR REPLACE VIEW public.mastery_by_grade AS
SELECT user_id, stage, grade,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE state='master') AS master,
  COUNT(*) FILTER (WHERE state='fluent') AS fluent,
  COUNT(*) FILTER (WHERE state='weak')   AS weak,
  COUNT(*) FILTER (WHERE state='none')   AS none,
  ROUND((COUNT(*) FILTER (WHERE state='master') + COUNT(*) FILTER (WHERE state='fluent')*0.7)
        / NULLIF(COUNT(*),0)::numeric * 100, 1) AS score_pct
FROM public.unified_mastery GROUP BY user_id, stage, grade;

CREATE OR REPLACE VIEW public.mastery_by_module AS
SELECT user_id, stage, grade, module,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE state='master') AS master,
  COUNT(*) FILTER (WHERE state='fluent') AS fluent,
  COUNT(*) FILTER (WHERE state='weak')   AS weak,
  COUNT(*) FILTER (WHERE state='none')   AS none,
  ROUND((COUNT(*) FILTER (WHERE state='master') + COUNT(*) FILTER (WHERE state='fluent')*0.7)
        / NULLIF(COUNT(*),0)::numeric * 100, 1) AS score_pct
FROM public.unified_mastery GROUP BY user_id, stage, grade, module;

CREATE OR REPLACE VIEW public.mastery_by_module_overall AS
SELECT user_id, module,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE state='master') AS master,
  COUNT(*) FILTER (WHERE state='fluent') AS fluent,
  COUNT(*) FILTER (WHERE state='weak')   AS weak,
  COUNT(*) FILTER (WHERE state='none')   AS none,
  ROUND((COUNT(*) FILTER (WHERE state='master') + COUNT(*) FILTER (WHERE state='fluent')*0.7)
        / NULLIF(COUNT(*),0)::numeric * 100, 1) AS score_pct
FROM public.unified_mastery GROUP BY user_id, module;

-- ============== Stage 1.6 Diagnostic summary fn ==============
CREATE OR REPLACE FUNCTION public.get_diagnostic_summary(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  weak_top jsonb;
  none_summary jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total', COUNT(*),
    'master_count', COUNT(*) FILTER (WHERE state='master'),
    'master_pct', ROUND(COUNT(*) FILTER (WHERE state='master')::numeric / NULLIF(COUNT(*),0) * 100, 1),
    'weak_count', COUNT(*) FILTER (WHERE state='weak'),
    'none_count', COUNT(*) FILTER (WHERE state='none'),
    'due_count', COUNT(*) FILTER (WHERE due_at < now() AND state IN ('weak','fluent')),
    'recent_master_count', COUNT(*) FILTER (WHERE state='master' AND updated_at > now() - interval '30 days'),
    'recent_attempt_count', COALESCE(SUM(CASE WHEN updated_at > now() - interval '30 days' THEN attempt_count ELSE 0 END), 0)
  ) INTO result
  FROM public.unified_mastery WHERE user_id = p_user_id;

  SELECT jsonb_agg(jsonb_build_object(
    'label', item_label, 'module', module, 'stage', stage, 'grade', grade, 'wrong_count', wrong_count
  )) INTO weak_top
  FROM (
    SELECT * FROM public.unified_mastery
    WHERE user_id = p_user_id AND state='weak'
    ORDER BY wrong_count DESC NULLS LAST LIMIT 3
  ) t;

  SELECT jsonb_agg(jsonb_build_object('module', module, 'count', cnt)) INTO none_summary
  FROM (
    SELECT module, COUNT(*) AS cnt FROM public.unified_mastery
    WHERE user_id = p_user_id AND state='none'
    GROUP BY module ORDER BY cnt DESC
  ) t;

  result := result
    || jsonb_build_object('weak_top3', COALESCE(weak_top, '[]'::jsonb))
    || jsonb_build_object('none_by_module', COALESCE(none_summary, '[]'::jsonb));
  RETURN result;
END;
$$;

-- ============== Stage 1.4 Data migration (adapted) ==============
-- primary_word_mastery -> unified
INSERT INTO public.unified_mastery
  (user_id, stage, grade, module, item_type, item_id, item_label, state,
   ease, interval_days, due_at, last_review_at,
   attempt_count, correct_count, wrong_count)
SELECT
  pwm.user_id, 'primary',
  COALESCE(pwm.grade, 3), 'vocab', 'word',
  pwm.word_id::text,
  pv.word,
  CASE
    WHEN pwm.mastery_level >= 4 THEN 'master'
    WHEN pwm.mastery_level >= 2 THEN 'fluent'
    WHEN pwm.mastery_level >= 1 THEN 'weak'
    ELSE 'none'
  END,
  COALESCE(pwm.ease, 2.5),
  COALESCE(pwm.interval_days, 0),
  pwm.due_at, pwm.updated_at,
  COALESCE(pwm.quiz_correct,0)+COALESCE(pwm.quiz_wrong,0)
   + COALESCE(pwm.listen_correct,0)+COALESCE(pwm.listen_wrong,0)
   + COALESCE(pwm.spell_correct,0)+COALESCE(pwm.spell_wrong,0)
   + COALESCE(pwm.match_correct,0)+COALESCE(pwm.match_wrong,0),
  COALESCE(pwm.quiz_correct,0)+COALESCE(pwm.listen_correct,0)
   + COALESCE(pwm.spell_correct,0)+COALESCE(pwm.match_correct,0),
  COALESCE(pwm.quiz_wrong,0)+COALESCE(pwm.listen_wrong,0)
   + COALESCE(pwm.spell_wrong,0)+COALESCE(pwm.match_wrong,0)
FROM public.primary_word_mastery pwm
LEFT JOIN public.primary_vocab pv ON pv.id = pwm.word_id
WHERE pwm.grade BETWEEN 1 AND 6
ON CONFLICT (user_id, stage, grade, module, item_type, item_id)
  DO UPDATE SET state = EXCLUDED.state, updated_at = now();

-- junior_word_mastery -> unified
INSERT INTO public.unified_mastery
  (user_id, stage, grade, module, item_type, item_id, item_label, state,
   ease, interval_days, due_at, last_review_at,
   attempt_count, correct_count, wrong_count)
SELECT
  jwm.user_id, 'junior',
  COALESCE(jwm.grade, jv.grade, 7), 'vocab', 'word',
  jwm.word_id::text, jv.word,
  CASE
    WHEN jwm.mastery_level >= 4 THEN 'master'
    WHEN jwm.mastery_level >= 2 THEN 'fluent'
    WHEN jwm.mastery_level >= 1 THEN 'weak'
    ELSE 'none'
  END,
  COALESCE(jwm.ease, 2.5),
  COALESCE(jwm.interval_days, 0),
  jwm.due_at, jwm.updated_at,
  COALESCE(jwm.quiz_correct,0)+COALESCE(jwm.quiz_wrong,0)
   + COALESCE(jwm.listen_correct,0)+COALESCE(jwm.listen_wrong,0)
   + COALESCE(jwm.spell_correct,0)+COALESCE(jwm.spell_wrong,0)
   + COALESCE(jwm.match_correct,0)+COALESCE(jwm.match_wrong,0)
   + COALESCE(jwm.cloze_correct,0)+COALESCE(jwm.cloze_wrong,0)
   + COALESCE(jwm.reading_correct,0)+COALESCE(jwm.reading_wrong,0),
  COALESCE(jwm.quiz_correct,0)+COALESCE(jwm.listen_correct,0)
   + COALESCE(jwm.spell_correct,0)+COALESCE(jwm.match_correct,0)
   + COALESCE(jwm.cloze_correct,0)+COALESCE(jwm.reading_correct,0),
  COALESCE(jwm.quiz_wrong,0)+COALESCE(jwm.listen_wrong,0)
   + COALESCE(jwm.spell_wrong,0)+COALESCE(jwm.match_wrong,0)
   + COALESCE(jwm.cloze_wrong,0)+COALESCE(jwm.reading_wrong,0)
FROM public.junior_word_mastery jwm
LEFT JOIN public.junior_vocab jv ON jv.id = jwm.word_id
WHERE COALESCE(jwm.grade, jv.grade, 7) BETWEEN 7 AND 9
ON CONFLICT (user_id, stage, grade, module, item_type, item_id)
  DO UPDATE SET state = EXCLUDED.state, updated_at = now();

-- gaokao_user_mastery -> unified (no module/grade columns, default vocab/10)
INSERT INTO public.unified_mastery
  (user_id, stage, grade, module, item_type, item_id, state,
   ease, interval_days, due_at, last_review_at,
   attempt_count, correct_count, wrong_count)
SELECT
  gum.user_id, 'senior', 10, 'vocab',
  COALESCE(gum.item_type, 'item'),
  gum.item_id::text,
  CASE
    WHEN gum.mastery_level >= 4 THEN 'master'
    WHEN gum.mastery_level >= 2 THEN 'fluent'
    WHEN gum.mastery_level >= 1 THEN 'weak'
    ELSE 'none'
  END,
  2.5,
  0,
  gum.due_at, gum.updated_at,
  COALESCE(gum.correct_count,0)+COALESCE(gum.wrong_count,0),
  COALESCE(gum.correct_count,0),
  COALESCE(gum.wrong_count,0)
FROM public.gaokao_user_mastery gum
ON CONFLICT (user_id, stage, grade, module, item_type, item_id)
  DO UPDATE SET state = EXCLUDED.state, updated_at = now();
