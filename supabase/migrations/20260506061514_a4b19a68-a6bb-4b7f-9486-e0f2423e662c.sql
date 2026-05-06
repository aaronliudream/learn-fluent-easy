
-- 年级目标分母表
CREATE TABLE public.primary_grade_targets (
  grade integer PRIMARY KEY REFERENCES public.primary_grades(id) ON DELETE CASCADE,
  target_vocab integer NOT NULL DEFAULT 150,
  target_lessons integer NOT NULL DEFAULT 36,
  benchmark_name text NOT NULL DEFAULT '剑桥 Starters',
  benchmark_desc text,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.primary_grade_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "grade_targets_read" ON public.primary_grade_targets
FOR SELECT USING (true);

INSERT INTO public.primary_grade_targets (grade, target_vocab, target_lessons, benchmark_name, benchmark_desc) VALUES
  (1, 220, 32, '剑桥 Starters', '对标 Cambridge Pre-A1 Starters 词汇与话题'),
  (2, 280, 36, '剑桥 Starters+', '巩固 Starters 并向 Movers 过渡'),
  (3, 350, 40, '剑桥 Movers', '对标 Cambridge A1 Movers'),
  (4, 450, 40, '剑桥 Movers+', '巩固 Movers 并向 Flyers 过渡'),
  (5, 600, 44, '剑桥 Flyers', '对标 Cambridge A2 Flyers'),
  (6, 800, 48, '小升初', '小学毕业 + 小升初核心词')
ON CONFLICT (grade) DO UPDATE SET
  target_vocab = EXCLUDED.target_vocab,
  target_lessons = EXCLUDED.target_lessons,
  benchmark_name = EXCLUDED.benchmark_name,
  benchmark_desc = EXCLUDED.benchmark_desc;

-- 每周快照表（用于"比上周 +X%"对比）
CREATE TABLE public.parent_weekly_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  grade integer NOT NULL,
  week_start date NOT NULL,
  vocab_mastered integer NOT NULL DEFAULT 0,
  vocab_learning integer NOT NULL DEFAULT 0,
  lessons_completed integer NOT NULL DEFAULT 0,
  listen_correct integer NOT NULL DEFAULT 0,
  listen_total integer NOT NULL DEFAULT 0,
  minutes_studied integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, grade, week_start)
);

CREATE INDEX idx_pws_user_grade ON public.parent_weekly_snapshots (user_id, grade, week_start DESC);

ALTER TABLE public.parent_weekly_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pws_select_own" ON public.parent_weekly_snapshots
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "pws_insert_own" ON public.parent_weekly_snapshots
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "pws_update_own" ON public.parent_weekly_snapshots
FOR UPDATE USING (auth.uid() = user_id);
