-- Junior Grammar Upgrade Migration
ALTER TABLE public.junior_grammar_points
  ADD COLUMN IF NOT EXISTS teacher_script jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS immersion_cards jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS mnemonic text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS content_depth smallint NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.junior_grammar_points.teacher_script IS
  'Paced lesson narration. Array of {text,show,highlight,duration}. Empty = skip teacher stage.';
COMMENT ON COLUMN public.junior_grammar_points.immersion_cards IS
  'Swipeable situation cards. Array of {situation,cn,en}. Empty = skip immersion stage.';
COMMENT ON COLUMN public.junior_grammar_points.mnemonic IS
  '1-line memorable formula shown at lesson end.';
COMMENT ON COLUMN public.junior_grammar_points.content_depth IS
  '0=md only · 1=+script · 2=+cards · 3=full. Set automatically by content authors.';

ALTER TABLE public.junior_grammar_questions
  ADD COLUMN IF NOT EXISTS distractors jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS natural_note text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS grammar_topic text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS use_ai_grading boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.junior_grammar_questions.distractors IS
  '3 wrong-sentence options for multi-choice rewrite mode. Each {text,msg}.';
COMMENT ON COLUMN public.junior_grammar_questions.natural_note IS
  'Optional 地道度 hint shown when grammar is right but phrasing is awkward.';
COMMENT ON COLUMN public.junior_grammar_questions.use_ai_grading IS
  'If true, the open-question answer goes through check-grammar-rewrite edge function for nuanced judgment.';

CREATE TABLE IF NOT EXISTS public.junior_user_mastery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  item_type text NOT NULL,
  item_id uuid NOT NULL,
  correct_count integer NOT NULL DEFAULT 0,
  wrong_count integer NOT NULL DEFAULT 0,
  mastery_level smallint NOT NULL DEFAULT 0,
  stability real NOT NULL DEFAULT 0,
  difficulty real NOT NULL DEFAULT 5.0,
  last_seen_at timestamptz,
  last_grade smallint,
  last_latency_ms integer,
  due_at timestamptz,
  next_review_at timestamptz,
  reached_master_at timestamptz,
  retention_check_at timestamptz,
  last_result text,
  lapses integer NOT NULL DEFAULT 0,
  mastery_matrix jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_type, item_id)
);

ALTER TABLE public.junior_user_mastery ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "jum select own"
    ON public.junior_user_mastery FOR SELECT
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "jum insert own"
    ON public.junior_user_mastery FOR INSERT
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "jum update own"
    ON public.junior_user_mastery FOR UPDATE
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_jum_user_type
  ON public.junior_user_mastery (user_id, item_type);

CREATE INDEX IF NOT EXISTS idx_jum_user_due
  ON public.junior_user_mastery (user_id, due_at)
  WHERE item_type = 'grammar_point';

CREATE INDEX IF NOT EXISTS idx_jum_user_level
  ON public.junior_user_mastery (user_id, mastery_level)
  WHERE item_type = 'grammar_point';

CREATE OR REPLACE FUNCTION public.touch_jum_updated_at()
RETURNS trigger LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_jum_touch ON public.junior_user_mastery;
CREATE TRIGGER trg_jum_touch
  BEFORE UPDATE ON public.junior_user_mastery
  FOR EACH ROW EXECUTE FUNCTION public.touch_jum_updated_at();

COMMENT ON TABLE public.junior_user_mastery IS
  'Per-user FSRS mastery tracking for Junior grammar (and future Junior items).';