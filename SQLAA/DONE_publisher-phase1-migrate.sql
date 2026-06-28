-- ============================================================
-- 出版社分叉 Phase 1 · 迁移(改结构)。Aaron 跑。先跑 publisher-phase1-diag.sql 核约束③。
-- 9 张内容表:ADD COLUMN publisher(可空) → 事务内 backfill(三分支 CASE) + 校验 0 NULL(残留 RAISE 回滚) → SET NOT NULL。
-- backfill 三分支:required%/elective% → 'pep';volume IS NULL → 'junior'(context_questions 1931 行已验证全 grade7/8 初中);其余 → 'junior'。
-- 扩 publisher 的唯一约束(2 个):
--   · junior_grammar_points: code → (publisher, code)
--   · junior_grammar_tips:   (volume,unit) → (publisher, volume, unit)
--   · junior_listening_items: 逐题表(128 行/volume),(volume,unit) 不唯一,无内容唯一约束 → 只加列(diag③ 确认仅 pkey)。
-- 故意不碰 junior_vocab 的 UNIQUE(word_id)×2:word_id 是逐行全局掌握度绑定键(junior_word_mastery 按它记),
--   必须全局唯一、与 publisher 正交;出版社区分走 volume+publisher,不动 word_id(动了=碰进度链路,违铁律)。
-- 不加列:junior_grammar_questions(FK 经 point_id 继承 publisher)。
-- ★零触碰:junior_user_mastery / junior_word_mastery / mastery_progress / gaokao_user_mastery;primary_vocab;所有 _junior_*_backup*。
-- 幂等:ADD COLUMN IF NOT EXISTS;backfill WHERE publisher IS NULL;约束 IF EXISTS。可安全重跑。
-- ============================================================

-- ===== 复用片段说明:每表 = ADD COLUMN → BEGIN/DO(backfill+校验)/COMMIT → SET NOT NULL =====

-- ---------- 1) junior_vocab(senior+初中:7A/7B/8A/8B/9) ----------
ALTER TABLE public.junior_vocab ADD COLUMN IF NOT EXISTS publisher text;
BEGIN;
DO $$ DECLARE n int; nn int; BEGIN
  SELECT count(*) INTO n FROM public.junior_vocab;
  UPDATE public.junior_vocab SET publisher = CASE
    WHEN volume LIKE 'required%' OR volume LIKE 'elective%' THEN 'pep'
    WHEN volume IS NULL THEN 'junior'
    ELSE 'junior' END
  WHERE publisher IS NULL;
  SELECT count(*) INTO nn FROM public.junior_vocab WHERE publisher IS NULL;
  IF nn<>0 THEN RAISE EXCEPTION 'junior_vocab 残留 % 行 NULL publisher,回滚', nn; END IF;
  RAISE NOTICE 'junior_vocab: % 行已 backfill, 0 NULL', n;
END $$;
COMMIT;
ALTER TABLE public.junior_vocab ALTER COLUMN publisher SET NOT NULL;

-- ---------- 2) junior_grammar_points(含 NULL-volume 老点→junior) ----------
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS publisher text;
BEGIN;
DO $$ DECLARE n int; nn int; BEGIN
  SELECT count(*) INTO n FROM public.junior_grammar_points;
  UPDATE public.junior_grammar_points SET publisher = CASE
    WHEN volume LIKE 'required%' OR volume LIKE 'elective%' THEN 'pep'
    WHEN volume IS NULL THEN 'junior'
    ELSE 'junior' END
  WHERE publisher IS NULL;
  SELECT count(*) INTO nn FROM public.junior_grammar_points WHERE publisher IS NULL;
  IF nn<>0 THEN RAISE EXCEPTION 'junior_grammar_points 残留 % 行 NULL,回滚', nn; END IF;
  RAISE NOTICE 'junior_grammar_points: % 行已 backfill, 0 NULL', n;
END $$;
COMMIT;
ALTER TABLE public.junior_grammar_points ALTER COLUMN publisher SET NOT NULL;
-- code 全局唯一 → (publisher, code)。幂等:先删新旧两个名,再建。
ALTER TABLE public.junior_grammar_points DROP CONSTRAINT IF EXISTS junior_grammar_points_code_key;
ALTER TABLE public.junior_grammar_points DROP CONSTRAINT IF EXISTS junior_grammar_points_publisher_code_key;
ALTER TABLE public.junior_grammar_points ADD CONSTRAINT junior_grammar_points_publisher_code_key UNIQUE (publisher, code);

-- ---------- 3) junior_reading ----------
ALTER TABLE public.junior_reading ADD COLUMN IF NOT EXISTS publisher text;
BEGIN;
DO $$ DECLARE n int; nn int; BEGIN
  SELECT count(*) INTO n FROM public.junior_reading;
  UPDATE public.junior_reading SET publisher = CASE
    WHEN volume LIKE 'required%' OR volume LIKE 'elective%' THEN 'pep'
    WHEN volume IS NULL THEN 'junior'
    ELSE 'junior' END
  WHERE publisher IS NULL;
  SELECT count(*) INTO nn FROM public.junior_reading WHERE publisher IS NULL;
  IF nn<>0 THEN RAISE EXCEPTION 'junior_reading 残留 % 行 NULL,回滚', nn; END IF;
  RAISE NOTICE 'junior_reading: % 行已 backfill, 0 NULL', n;
END $$;
COMMIT;
ALTER TABLE public.junior_reading ALTER COLUMN publisher SET NOT NULL;

-- ---------- 4) junior_cloze ----------
ALTER TABLE public.junior_cloze ADD COLUMN IF NOT EXISTS publisher text;
BEGIN;
DO $$ DECLARE n int; nn int; BEGIN
  SELECT count(*) INTO n FROM public.junior_cloze;
  UPDATE public.junior_cloze SET publisher = CASE
    WHEN volume LIKE 'required%' OR volume LIKE 'elective%' THEN 'pep'
    WHEN volume IS NULL THEN 'junior'
    ELSE 'junior' END
  WHERE publisher IS NULL;
  SELECT count(*) INTO nn FROM public.junior_cloze WHERE publisher IS NULL;
  IF nn<>0 THEN RAISE EXCEPTION 'junior_cloze 残留 % 行 NULL,回滚', nn; END IF;
  RAISE NOTICE 'junior_cloze: % 行已 backfill, 0 NULL', n;
END $$;
COMMIT;
ALTER TABLE public.junior_cloze ALTER COLUMN publisher SET NOT NULL;

-- ---------- 5) junior_listening_exercises(含 NULL-volume→junior) ----------
ALTER TABLE public.junior_listening_exercises ADD COLUMN IF NOT EXISTS publisher text;
BEGIN;
DO $$ DECLARE n int; nn int; BEGIN
  SELECT count(*) INTO n FROM public.junior_listening_exercises;
  UPDATE public.junior_listening_exercises SET publisher = CASE
    WHEN volume LIKE 'required%' OR volume LIKE 'elective%' THEN 'pep'
    WHEN volume IS NULL THEN 'junior'
    ELSE 'junior' END
  WHERE publisher IS NULL;
  SELECT count(*) INTO nn FROM public.junior_listening_exercises WHERE publisher IS NULL;
  IF nn<>0 THEN RAISE EXCEPTION 'junior_listening_exercises 残留 % 行 NULL,回滚', nn; END IF;
  RAISE NOTICE 'junior_listening_exercises: % 行已 backfill, 0 NULL', n;
END $$;
COMMIT;
ALTER TABLE public.junior_listening_exercises ALTER COLUMN publisher SET NOT NULL;

-- ---------- 6) junior_listening_items(逐题表,全初中 7B/8A/8B,无内容唯一约束→只加列) ----------
ALTER TABLE public.junior_listening_items ADD COLUMN IF NOT EXISTS publisher text;
BEGIN;
DO $$ DECLARE n int; nn int; BEGIN
  SELECT count(*) INTO n FROM public.junior_listening_items;
  UPDATE public.junior_listening_items SET publisher = CASE
    WHEN volume LIKE 'required%' OR volume LIKE 'elective%' THEN 'pep'
    WHEN volume IS NULL THEN 'junior'
    ELSE 'junior' END
  WHERE publisher IS NULL;
  SELECT count(*) INTO nn FROM public.junior_listening_items WHERE publisher IS NULL;
  IF nn<>0 THEN RAISE EXCEPTION 'junior_listening_items 残留 % 行 NULL,回滚', nn; END IF;
  RAISE NOTICE 'junior_listening_items: % 行已 backfill, 0 NULL', n;
END $$;
COMMIT;
ALTER TABLE public.junior_listening_items ALTER COLUMN publisher SET NOT NULL;
-- ✓ diag③ 已确认 junior_listening_items 仅 pkey(id),无 UNIQUE(volume,…) → 只加列,无约束扩展。

-- ---------- 7) junior_writing_prompts(含 NULL-volume→junior) ----------
ALTER TABLE public.junior_writing_prompts ADD COLUMN IF NOT EXISTS publisher text;
BEGIN;
DO $$ DECLARE n int; nn int; BEGIN
  SELECT count(*) INTO n FROM public.junior_writing_prompts;
  UPDATE public.junior_writing_prompts SET publisher = CASE
    WHEN volume LIKE 'required%' OR volume LIKE 'elective%' THEN 'pep'
    WHEN volume IS NULL THEN 'junior'
    ELSE 'junior' END
  WHERE publisher IS NULL;
  SELECT count(*) INTO nn FROM public.junior_writing_prompts WHERE publisher IS NULL;
  IF nn<>0 THEN RAISE EXCEPTION 'junior_writing_prompts 残留 % 行 NULL,回滚', nn; END IF;
  RAISE NOTICE 'junior_writing_prompts: % 行已 backfill, 0 NULL', n;
END $$;
COMMIT;
ALTER TABLE public.junior_writing_prompts ALTER COLUMN publisher SET NOT NULL;

-- ---------- 8) junior_grammar_tips(全 senior,36 行→pep) ----------
ALTER TABLE public.junior_grammar_tips ADD COLUMN IF NOT EXISTS publisher text;
BEGIN;
DO $$ DECLARE n int; nn int; BEGIN
  SELECT count(*) INTO n FROM public.junior_grammar_tips;
  UPDATE public.junior_grammar_tips SET publisher = CASE
    WHEN volume LIKE 'required%' OR volume LIKE 'elective%' THEN 'pep'
    WHEN volume IS NULL THEN 'junior'
    ELSE 'junior' END
  WHERE publisher IS NULL;
  SELECT count(*) INTO nn FROM public.junior_grammar_tips WHERE publisher IS NULL;
  IF nn<>0 THEN RAISE EXCEPTION 'junior_grammar_tips 残留 % 行 NULL,回滚', nn; END IF;
  RAISE NOTICE 'junior_grammar_tips: % 行已 backfill, 0 NULL', n;
END $$;
COMMIT;
ALTER TABLE public.junior_grammar_tips ALTER COLUMN publisher SET NOT NULL;
-- (volume,unit) 唯一 → (publisher, volume, unit)。幂等:约束/索引两形态兜底删 + 删新名,再建。
ALTER TABLE public.junior_grammar_tips DROP CONSTRAINT IF EXISTS junior_grammar_tips_volume_unit_key;
DROP INDEX IF EXISTS public.junior_grammar_tips_volume_unit_key;
ALTER TABLE public.junior_grammar_tips DROP CONSTRAINT IF EXISTS junior_grammar_tips_publisher_volume_unit_key;
ALTER TABLE public.junior_grammar_tips ADD CONSTRAINT junior_grammar_tips_publisher_volume_unit_key UNIQUE (publisher, volume, unit);

-- ---------- 9) context_questions(含 1931 NULL-volume,已验证 grade7/8 全初中→junior) ----------
ALTER TABLE public.context_questions ADD COLUMN IF NOT EXISTS publisher text;
BEGIN;
DO $$ DECLARE n int; nn int; BEGIN
  SELECT count(*) INTO n FROM public.context_questions;
  UPDATE public.context_questions SET publisher = CASE
    WHEN volume LIKE 'required%' OR volume LIKE 'elective%' THEN 'pep'
    WHEN volume IS NULL THEN 'junior'
    ELSE 'junior' END
  WHERE publisher IS NULL;
  SELECT count(*) INTO nn FROM public.context_questions WHERE publisher IS NULL;
  IF nn<>0 THEN RAISE EXCEPTION 'context_questions 残留 % 行 NULL,回滚', nn; END IF;
  RAISE NOTICE 'context_questions: % 行已 backfill, 0 NULL', n;
END $$;
COMMIT;
ALTER TABLE public.context_questions ALTER COLUMN publisher SET NOT NULL;

-- ============================================================
-- 自带验收(只读)
-- ① 每内容表 GROUP BY publisher:应只有 pep / junior 两类,且 pep+junior 总数 = diag⑤ 基线
-- ============================================================
SELECT 'junior_vocab' t, publisher, count(*) n FROM public.junior_vocab GROUP BY publisher
UNION ALL SELECT 'junior_grammar_points', publisher, count(*) FROM public.junior_grammar_points GROUP BY publisher
UNION ALL SELECT 'junior_reading', publisher, count(*) FROM public.junior_reading GROUP BY publisher
UNION ALL SELECT 'junior_cloze', publisher, count(*) FROM public.junior_cloze GROUP BY publisher
UNION ALL SELECT 'junior_listening_exercises', publisher, count(*) FROM public.junior_listening_exercises GROUP BY publisher
UNION ALL SELECT 'junior_listening_items', publisher, count(*) FROM public.junior_listening_items GROUP BY publisher
UNION ALL SELECT 'junior_writing_prompts', publisher, count(*) FROM public.junior_writing_prompts GROUP BY publisher
UNION ALL SELECT 'junior_grammar_tips', publisher, count(*) FROM public.junior_grammar_tips GROUP BY publisher
UNION ALL SELECT 'context_questions', publisher, count(*) FROM public.context_questions GROUP BY publisher
ORDER BY t, publisher;

-- ② 两个新唯一约束确认
SELECT conrelid::regclass tbl, conname, pg_get_constraintdef(oid) def FROM pg_constraint
WHERE conrelid IN ('public.junior_grammar_points'::regclass,'public.junior_grammar_tips'::regclass) AND contype='u'
ORDER BY tbl;

-- ③ ★进度三表 + gaokao_user_mastery 行数:必须 = diag⑥,完全不变(零触碰证明)
SELECT 'junior_user_mastery' t, count(*) n FROM public.junior_user_mastery
UNION ALL SELECT 'junior_word_mastery', count(*) FROM public.junior_word_mastery
UNION ALL SELECT 'mastery_progress', count(*) FROM public.mastery_progress
UNION ALL SELECT 'gaokao_user_mastery', count(*) FROM public.gaokao_user_mastery
ORDER BY t;
