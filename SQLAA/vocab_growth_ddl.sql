-- 成长图数据源补齐:user_vocab_mastery 加首学日列 + 建 vocab_review_daily
--
-- ── 为什么需要 ────────────────────────────────────────────────
-- /vocab 的「词汇成长」图与 /library/vocab 那张同源(共用 GrowthChart 组件),
-- 三条序列各要一个数据源:
--     掌握 ← user_vocab_mastery.last_correct_date        ✅ 已有
--     新增 ← 首次学习该词的日期                            ❌ 缺(本文件加 first_learned_date)
--     复习 ← 每日复习计数                                  ❌ 缺(本文件建 vocab_review_daily)
-- library 侧对应的是 library_vocab_favorites.created_at 与 library_vocab_review_daily。
-- 不补这两个,PR-2 一开始写入后用户会看到"天天学却只有绿柱",而不是图坏了。
--
-- ⚠️ 必须在 PR-2 动工前入库 —— PR-2 的 vocabMastery.ts 要从第一次写入就把三条序列写全,
--    否则前面这批用户的"新增/复习"历史永远补不回来(那是逐日数据,事后无法重建)。
--
-- 幂等:列用 ADD COLUMN IF NOT EXISTS、表用 CREATE TABLE IF NOT EXISTS、
--       策略先 DROP IF EXISTS 再建。重复跑安全。
-- 跑之前实测(2026-08-04):user_vocab_mastery 0 行、vocab_mistake_book 0 行,
--       所以回填语句这次不会动到任何行 —— 留着是为了将来在有数据的环境重放时也正确。
-- ⚠️ 由 Aaron 执行。

BEGIN;

SELECT 'BEFORE' AS stage,
       (SELECT count(*) FROM information_schema.columns
         WHERE table_schema='public' AND table_name='user_vocab_mastery'
           AND column_name='first_learned_date') AS has_first_learned,
       (SELECT count(*) FROM information_schema.tables
         WHERE table_schema='public' AND table_name='vocab_review_daily') AS has_review_daily;

-- ① 首学日:该词第一次被作答的北京日。
ALTER TABLE public.user_vocab_mastery
  ADD COLUMN IF NOT EXISTS first_learned_date date;

-- 回填历史行(本次 0 行,空跑)。取已有的最早可信日期,取不到就用 updated_at 的北京日。
UPDATE public.user_vocab_mastery
   SET first_learned_date = LEAST(
         COALESCE(last_correct_date, (updated_at AT TIME ZONE 'Asia/Shanghai')::date),
         (updated_at AT TIME ZONE 'Asia/Shanghai')::date
       )
 WHERE first_learned_date IS NULL;

-- ② 每日复习计数表。照 library_vocab_review_daily 的形状。
CREATE TABLE IF NOT EXISTS public.vocab_review_daily (
  user_id    uuid        NOT NULL,
  day        date        NOT NULL,          -- 北京日,由客户端按 Asia/Shanghai 算好传入
  reviewed   integer     NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, day)
);

ALTER TABLE public.vocab_review_daily ENABLE ROW LEVEL SECURITY;

-- 策略:只能读写自己的行。口径与 library_vocab_review_daily 一致。
-- ⚠️ 只建一套。library 那张表历史上被建了两套重复策略
--    (own review daily * 与 vrd_*),同一个动作要过两遍判断,没必要,这里不重演。
DROP POLICY IF EXISTS vrd_vocab_select_own ON public.vocab_review_daily;
DROP POLICY IF EXISTS vrd_vocab_insert_own ON public.vocab_review_daily;
DROP POLICY IF EXISTS vrd_vocab_update_own ON public.vocab_review_daily;

CREATE POLICY vrd_vocab_select_own ON public.vocab_review_daily
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY vrd_vocab_insert_own ON public.vocab_review_daily
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY vrd_vocab_update_own ON public.vocab_review_daily
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 成长图按 (user_id, day) 范围扫,建个索引省得全表扫。
CREATE INDEX IF NOT EXISTS vocab_review_daily_user_day_idx
  ON public.vocab_review_daily (user_id, day);

-- 首学日要按天分桶,同样建索引。
CREATE INDEX IF NOT EXISTS user_vocab_mastery_first_learned_idx
  ON public.user_vocab_mastery (user_id, first_learned_date);

SELECT 'AFTER' AS stage,
       (SELECT count(*) FROM information_schema.columns
         WHERE table_schema='public' AND table_name='user_vocab_mastery'
           AND column_name='first_learned_date') AS has_first_learned,
       (SELECT count(*) FROM information_schema.tables
         WHERE table_schema='public' AND table_name='vocab_review_daily') AS has_review_daily;

-- ── count-validate:五行都必须是 t,否则 ROLLBACK ──
SELECT 'first_learned_date 列已存在' AS expect,
       EXISTS (SELECT 1 FROM information_schema.columns
                WHERE table_schema='public' AND table_name='user_vocab_mastery'
                  AND column_name='first_learned_date' AND data_type='date') AS ok
UNION ALL
SELECT 'vocab_review_daily 表已存在',
       EXISTS (SELECT 1 FROM information_schema.tables
                WHERE table_schema='public' AND table_name='vocab_review_daily')
UNION ALL
SELECT 'vocab_review_daily 已开 RLS',
       COALESCE((SELECT relrowsecurity FROM pg_class
                  WHERE oid = 'public.vocab_review_daily'::regclass), false)
UNION ALL
SELECT 'vocab_review_daily 恰好 3 条策略(select/insert/update 各一)',
       (SELECT count(*) FROM pg_policies
         WHERE schemaname='public' AND tablename='vocab_review_daily') = 3
UNION ALL
SELECT '没有遗留 first_learned_date 为空的历史行',
       NOT EXISTS (SELECT 1 FROM public.user_vocab_mastery WHERE first_learned_date IS NULL);

COMMIT;
