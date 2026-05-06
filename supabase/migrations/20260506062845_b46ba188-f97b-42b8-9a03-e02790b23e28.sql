
-- ========== Unit Challenges ==========
CREATE TABLE IF NOT EXISTS public.primary_unit_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  unit_id uuid NOT NULL REFERENCES public.primary_units(id) ON DELETE CASCADE,
  grade integer NOT NULL,
  score integer NOT NULL DEFAULT 0,
  total integer NOT NULL DEFAULT 12,
  accuracy numeric(5,2) NOT NULL DEFAULT 0,
  medal text NOT NULL DEFAULT 'none', -- none / bronze / silver / gold
  passed boolean NOT NULL DEFAULT false,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, unit_id, created_at)
);
CREATE INDEX IF NOT EXISTS idx_puc_user_grade ON public.primary_unit_challenges (user_id, grade, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_puc_user_unit ON public.primary_unit_challenges (user_id, unit_id, created_at DESC);

ALTER TABLE public.primary_unit_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "puc_select_own" ON public.primary_unit_challenges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "puc_insert_own" ON public.primary_unit_challenges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ========== Monthly Checkup ==========
CREATE TABLE IF NOT EXISTS public.primary_monthly_checkups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  grade integer NOT NULL,
  month_key text NOT NULL, -- e.g. '2026-05'
  total_questions integer NOT NULL DEFAULT 15,
  correct integer NOT NULL DEFAULT 0,
  vocab_score integer NOT NULL DEFAULT 0,    -- 0-100
  listen_score integer NOT NULL DEFAULT 0,
  spell_score integer NOT NULL DEFAULT 0,
  overall_score integer NOT NULL DEFAULT 0,  -- weighted
  level_label text NOT NULL DEFAULT 'B',     -- A+/A/B+/B/C+
  cert_code text NOT NULL DEFAULT '',         -- shareable cert code
  weak_themes jsonb,                          -- ["动物","食物饮料"]
  recommendations jsonb,                      -- structured next steps
  questions jsonb,                            -- per-question record
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, grade, month_key)
);
CREATE INDEX IF NOT EXISTS idx_pmc_user_grade ON public.primary_monthly_checkups (user_id, grade, created_at DESC);

ALTER TABLE public.primary_monthly_checkups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pmc_select_own" ON public.primary_monthly_checkups FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "pmc_insert_own" ON public.primary_monthly_checkups FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pmc_update_own" ON public.primary_monthly_checkups FOR UPDATE USING (auth.uid() = user_id);
