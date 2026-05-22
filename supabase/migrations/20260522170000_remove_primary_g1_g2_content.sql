-- =============================================================================
-- 移除小学 1/2 年级内容（新课标：英语从三年级正式开课）
-- =============================================================================
-- 背景：前端已经把一/二年级从年级选择页和路由里下线，本迁移把数据库里
-- 的一/二年级行也一并清理掉，避免后台/统计仍然能查到孤立数据。
--
-- 注意：
--   * 用 BEGIN/COMMIT 包住，任一语句失败整体回滚。
--   * 只 DELETE 数据，不 DROP 表 —— 表结构保留，将来要恢复也方便。
--   * 用户表（profiles）里 last_grade / recommended_grade 为 1 或 2 的
--     用户，统一归一到 3，避免用户登录后看到空白。
--   * primary_grades 是 FK 父表，删 id IN (1, 2) 会经 ON DELETE CASCADE
--     带走 primary_grade_targets 的相应行。
-- =============================================================================

BEGIN;

-- 1) 用户偏好：把 G1/G2 选择归一到 G3
UPDATE public.profiles
   SET last_grade = 3
 WHERE last_grade IN (1, 2);

UPDATE public.profiles
   SET recommended_grade = 3
 WHERE recommended_grade IN (1, 2);

-- 2) 用户进度数据（先删，避免 FK 阻塞）
DELETE FROM public.primary_word_mastery       WHERE grade IN (1, 2);
DELETE FROM public.primary_word_quest_attempts WHERE grade IN (1, 2);
DELETE FROM public.primary_game_scores        WHERE grade IN (1, 2);
DELETE FROM public.parent_weekly_snapshots    WHERE grade IN (1, 2);

-- 3) 课程内容
DELETE FROM public.primary_reading_articles   WHERE grade IN (1, 2);
DELETE FROM public.primary_vocab              WHERE grade IN (1, 2);

-- primary_units / primary_lessons：lesson 的 grade 通过 unit 反查，
-- 所以删 unit 即可（假定 primary_lessons.unit_id 有 ON DELETE CASCADE；
-- 若没有，请补一条 DELETE FROM primary_lessons WHERE unit_id IN (...)）。
DELETE FROM public.primary_units              WHERE grade IN (1, 2);

-- 4) 年级定义本身（CASCADE 带走 primary_grade_targets）
DELETE FROM public.primary_grades             WHERE id IN (1, 2);

-- 5) 收紧 CHECK 约束：今后不再允许写入 grade IN (1, 2)
ALTER TABLE public.primary_vocab
  DROP CONSTRAINT IF EXISTS primary_vocab_grade_check;
ALTER TABLE public.primary_vocab
  ADD CONSTRAINT primary_vocab_grade_check CHECK (grade BETWEEN 3 AND 6);

ALTER TABLE public.primary_reading_articles
  DROP CONSTRAINT IF EXISTS primary_reading_articles_grade_check;
ALTER TABLE public.primary_reading_articles
  ADD CONSTRAINT primary_reading_articles_grade_check CHECK (grade BETWEEN 3 AND 6);

COMMIT;
