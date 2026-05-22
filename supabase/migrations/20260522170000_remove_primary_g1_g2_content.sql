-- =============================================================================
-- 移除小学 1/2 年级内容（新课标：英语从三年级正式开课）
-- =============================================================================
-- 背景：前端已经把一/二年级从年级选择页和路由里下线，本迁移把数据库里
-- 的一/二年级行也一并清理掉，避免后台/统计仍然能查到孤立数据。
--
-- 防御式写法（v2）：
--   * 每一段都先检查目标列/表是否存在，不存在就跳过 + 打 NOTICE。
--     不同环境（dev / staging / prod）schema 可能略有差异，这样不会
--     因为某张表/某个列缺失而整体回滚。
--   * 用 BEGIN/COMMIT 包住，真正的 SQL 失败仍然整体回滚。
--   * 只 DELETE 数据 + 收紧 CHECK，不 DROP 表。
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1) 用户偏好：把 G1/G2 归一到 G3（仅当 profiles 表上有这些列时执行）
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'last_grade'
  ) THEN
    UPDATE public.profiles SET last_grade = 3 WHERE last_grade IN (1, 2);
    RAISE NOTICE 'profiles.last_grade normalized to 3 for G1/G2 users';
  ELSE
    RAISE NOTICE 'profiles.last_grade column missing — skipping';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'recommended_grade'
  ) THEN
    UPDATE public.profiles SET recommended_grade = 3 WHERE recommended_grade IN (1, 2);
    RAISE NOTICE 'profiles.recommended_grade normalized to 3 for G1/G2 users';
  ELSE
    RAISE NOTICE 'profiles.recommended_grade column missing — skipping';
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 2) 删除数据。一张张表来，缺表就跳过。
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  -- (table, grade-column) 列表
  t RECORD;
BEGIN
  FOR t IN
    SELECT * FROM (VALUES
      ('primary_word_mastery',        'grade'),
      ('primary_word_quest_attempts', 'grade'),
      ('primary_game_scores',         'grade'),
      ('parent_weekly_snapshots',     'grade'),
      ('primary_reading_articles',    'grade'),
      ('primary_vocab',               'grade'),
      ('primary_units',               'grade')
    ) AS x(tbl, col)
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = t.tbl AND column_name = t.col
    ) THEN
      EXECUTE format(
        'DELETE FROM public.%I WHERE %I IN (1, 2)',
        t.tbl, t.col
      );
      RAISE NOTICE 'Deleted G1/G2 rows from public.%', t.tbl;
    ELSE
      RAISE NOTICE 'Table public.% or column %.% missing — skipping', t.tbl, t.tbl, t.col;
    END IF;
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 3) 年级定义本身（primary_grades）。CASCADE 会带走 primary_grade_targets
--    等 FK 子表的对应行。
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = 'primary_grades'
  ) THEN
    DELETE FROM public.primary_grades WHERE id IN (1, 2);
    RAISE NOTICE 'Deleted G1/G2 from primary_grades (cascades to children)';
  ELSE
    RAISE NOTICE 'primary_grades table missing — skipping';
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 4) 收紧 CHECK 约束：今后写入 grade IN (1, 2) 会被拒绝
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'primary_vocab' AND column_name = 'grade'
  ) THEN
    ALTER TABLE public.primary_vocab DROP CONSTRAINT IF EXISTS primary_vocab_grade_check;
    ALTER TABLE public.primary_vocab ADD CONSTRAINT primary_vocab_grade_check CHECK (grade BETWEEN 3 AND 6);
    RAISE NOTICE 'Tightened primary_vocab CHECK to grade BETWEEN 3 AND 6';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'primary_reading_articles' AND column_name = 'grade'
  ) THEN
    ALTER TABLE public.primary_reading_articles DROP CONSTRAINT IF EXISTS primary_reading_articles_grade_check;
    ALTER TABLE public.primary_reading_articles ADD CONSTRAINT primary_reading_articles_grade_check CHECK (grade BETWEEN 3 AND 6);
    RAISE NOTICE 'Tightened primary_reading_articles CHECK to grade BETWEEN 3 AND 6';
  END IF;
END $$;

COMMIT;
