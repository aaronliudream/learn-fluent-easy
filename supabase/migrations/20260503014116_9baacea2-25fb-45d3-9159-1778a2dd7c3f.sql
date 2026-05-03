CREATE TABLE IF NOT EXISTS public.primary_grades (
  id INT PRIMARY KEY,
  name_cn TEXT NOT NULL,
  name_en TEXT NOT NULL,
  emoji TEXT,
  gradient TEXT,
  unlocked BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.primary_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade INT NOT NULL REFERENCES public.primary_grades(id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  title_cn TEXT NOT NULL,
  title_en TEXT NOT NULL,
  emoji TEXT,
  skills TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_primary_units_grade ON public.primary_units(grade, sort_order);

CREATE TABLE IF NOT EXISTS public.primary_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES public.primary_units(id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  title_cn TEXT NOT NULL,
  title_en TEXT NOT NULL,
  primary_skill TEXT NOT NULL,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  estimated_minutes INT NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_primary_lessons_unit ON public.primary_lessons(unit_id, sort_order);

CREATE TABLE IF NOT EXISTS public.primary_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL REFERENCES public.primary_lessons(id) ON DELETE CASCADE,
  steps_done INT NOT NULL DEFAULT 0,
  total_steps INT NOT NULL DEFAULT 5,
  accuracy NUMERIC(5,2),
  stars INT NOT NULL DEFAULT 0,
  xp_earned INT NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);
CREATE INDEX IF NOT EXISTS idx_plp_user ON public.primary_lesson_progress(user_id, last_seen_at DESC);

CREATE TABLE IF NOT EXISTS public.pet_state (
  user_id UUID PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Spark',
  level INT NOT NULL DEFAULT 1,
  xp INT NOT NULL DEFAULT 0,
  stars INT NOT NULL DEFAULT 0,
  bond INT NOT NULL DEFAULT 0,
  skin TEXT NOT NULL DEFAULT 'default',
  last_interaction_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.primary_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.primary_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.primary_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.primary_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "primary_grades_read" ON public.primary_grades;
CREATE POLICY "primary_grades_read" ON public.primary_grades FOR SELECT USING (true);
DROP POLICY IF EXISTS "primary_units_read" ON public.primary_units;
CREATE POLICY "primary_units_read" ON public.primary_units FOR SELECT USING (true);
DROP POLICY IF EXISTS "primary_lessons_read" ON public.primary_lessons;
CREATE POLICY "primary_lessons_read" ON public.primary_lessons FOR SELECT USING (true);

DROP POLICY IF EXISTS "plp_select_own" ON public.primary_lesson_progress;
CREATE POLICY "plp_select_own" ON public.primary_lesson_progress FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "plp_insert_own" ON public.primary_lesson_progress;
CREATE POLICY "plp_insert_own" ON public.primary_lesson_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "plp_update_own" ON public.primary_lesson_progress;
CREATE POLICY "plp_update_own" ON public.primary_lesson_progress FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "pet_select_own" ON public.pet_state;
CREATE POLICY "pet_select_own" ON public.pet_state FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "pet_insert_own" ON public.pet_state;
CREATE POLICY "pet_insert_own" ON public.pet_state FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "pet_update_own" ON public.pet_state;
CREATE POLICY "pet_update_own" ON public.pet_state FOR UPDATE USING (auth.uid() = user_id);

INSERT INTO public.primary_grades (id, name_cn, name_en, emoji, gradient, sort_order) VALUES
  (1, '一年级', 'Grade 1', '🐣', 'from-amber-300 via-yellow-300 to-orange-300', 1),
  (2, '二年级', 'Grade 2', '🐥', 'from-orange-300 via-pink-300 to-rose-300', 2),
  (3, '三年级', 'Grade 3', '🦊', 'from-rose-300 via-fuchsia-300 to-violet-300', 3),
  (4, '四年级', 'Grade 4', '🐼', 'from-violet-300 via-indigo-300 to-blue-300', 4),
  (5, '五年级', 'Grade 5', '🦁', 'from-blue-300 via-sky-300 to-cyan-300', 5),
  (6, '六年级', 'Grade 6', '🦉', 'from-cyan-300 via-teal-300 to-emerald-300', 6)
ON CONFLICT (id) DO NOTHING;