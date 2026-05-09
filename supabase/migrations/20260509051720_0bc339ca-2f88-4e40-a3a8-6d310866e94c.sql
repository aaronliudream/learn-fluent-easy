
-- ============ 1. 语法点目录表 ============
CREATE TABLE public.grammar_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  stage TEXT NOT NULL CHECK (stage IN ('primary','junior','gaokao')),
  grade TEXT,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  weight NUMERIC NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.grammar_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "grammar_points readable by all authenticated"
  ON public.grammar_points FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "grammar_points admin write"
  ON public.grammar_points FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_grammar_points_stage_cat ON public.grammar_points(stage, category, sort_order);

-- ============ 2. 用户掌握度表 ============
CREATE TABLE public.user_grammar_mastery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  point_id UUID NOT NULL REFERENCES public.grammar_points(id) ON DELETE CASCADE,
  score NUMERIC NOT NULL DEFAULT 0,
  attempts INT NOT NULL DEFAULT 0,
  correct INT NOT NULL DEFAULT 0,
  last_practiced_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, point_id)
);
ALTER TABLE public.user_grammar_mastery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ugm select own" ON public.user_grammar_mastery
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "ugm insert own" ON public.user_grammar_mastery
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ugm update own" ON public.user_grammar_mastery
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "ugm delete own" ON public.user_grammar_mastery
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_ugm_user ON public.user_grammar_mastery(user_id);

-- ============ 3. 记录答题 RPC（EWMA 平滑） ============
CREATE OR REPLACE FUNCTION public.record_grammar_attempt(
  p_slug TEXT,
  p_correct BOOLEAN
) RETURNS public.user_grammar_mastery
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_point_id UUID;
  v_alpha NUMERIC := 0.25;        -- 学习率
  v_target NUMERIC;
  v_row public.user_grammar_mastery;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'auth required';
  END IF;

  SELECT id INTO v_point_id FROM public.grammar_points WHERE slug = p_slug;
  IF v_point_id IS NULL THEN
    RAISE EXCEPTION 'unknown grammar point: %', p_slug;
  END IF;

  v_target := CASE WHEN p_correct THEN 100 ELSE 0 END;

  INSERT INTO public.user_grammar_mastery (user_id, point_id, score, attempts, correct, last_practiced_at, updated_at)
  VALUES (v_uid, v_point_id, v_target, 1, CASE WHEN p_correct THEN 1 ELSE 0 END, now(), now())
  ON CONFLICT (user_id, point_id) DO UPDATE SET
    score = ROUND( (public.user_grammar_mastery.score * (1 - v_alpha) + v_target * v_alpha)::numeric, 2),
    attempts = public.user_grammar_mastery.attempts + 1,
    correct = public.user_grammar_mastery.correct + CASE WHEN p_correct THEN 1 ELSE 0 END,
    last_practiced_at = now(),
    updated_at = now()
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_grammar_attempt(TEXT, BOOLEAN) TO authenticated;

-- ============ 4. 预置虚拟语气考点 ============
INSERT INTO public.grammar_points (slug, stage, grade, category, name, sort_order) VALUES
  ('subj-present',   'gaokao', '高一', '虚拟语气', '与现在事实相反', 1),
  ('subj-past',      'gaokao', '高一', '虚拟语气', '与过去事实相反', 2),
  ('subj-future',    'gaokao', '高一', '虚拟语气', '与将来事实相反', 3),
  ('subj-mixed',     'gaokao', '高二', '虚拟语气', '混合虚拟语气',   4),
  ('subj-wish',      'gaokao', '高二', '虚拟语气', 'wish / if only', 5),
  ('subj-suggest',   'gaokao', '高二', '虚拟语气', '建议/要求/命令从句', 6);
