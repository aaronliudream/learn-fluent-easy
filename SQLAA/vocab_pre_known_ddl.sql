-- ═══════════════════════════════════════════════════════════════════
-- 托福词表快筛:结果表 vocab_pre_known
--
-- 由 Aaron 执行。脚本/前端从不建表。
--
-- 用途:记录用户在「快筛」里对每个词的自评(认识/不认识)与验真结果。
--   ⚠️ **不写 user_vocab_mastery** —— 快筛是自评不是作答,不该占掌握度,
--      也不该占 user_vocab_mastery 那 200 条 RLS 配额。
--   ⚠️ 带 bank_id:现在只有 toefl 一个库真正挂了词(实测 4470 条,
--      其余 10 个库挂载数全为 0),但将来别的库上线时「每个库一份快筛」
--      才说得通。现在留字段比以后改表强(Aaron 2026-08-09 定)。
--
-- 估算口径(前端 screening.ts 与此一致,改一处必须改另一处):
--   5 层 × 8 题 = 40 题;层是按 freq_rank 在**托福池内部**五等分切的,
--   分层点由实测分布定(各层 894 词,合计 4470):
--     ① 657–6968  ② 6977–10234  ③ 10236–14458  ④ 14459–20528  ⑤ 20532+ 及未定频
--   freq_rank 为空的 123 个词并入第 5 层 —— 抽样核对过全是生僻词
--   (avant-garde / ultrasonics / oversecretion / jocose / contemn / warrantable …)。
-- ═══════════════════════════════════════════════════════════════════

BEGIN;

-- 建表前计数(应为 0 或报表不存在)
SELECT 'before' AS phase, COUNT(*) AS rows
FROM information_schema.tables WHERE table_schema='public' AND table_name='vocab_pre_known';

CREATE TABLE IF NOT EXISTS public.vocab_pre_known (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id)          ON DELETE CASCADE,
  bank_id          uuid NOT NULL REFERENCES public.vocab_banks(id)  ON DELETE CASCADE,
  word_id          uuid NOT NULL REFERENCES public.vocab_words(id)  ON DELETE CASCADE,

  -- 用户自评:认识 = true
  known            boolean NOT NULL,

  -- 验真题(每层 2 题带干扰项)。没被抽中验真的词这两列为 NULL ——
  -- ⚠️ 三态是有意义的:NULL=没验过,false=自称认识但选错,true=验对了。
  --    合并成 boolean 会把"没验过"和"验错了"混为一谈,估算就偏了。
  verified_correct boolean,

  -- 该词属于第几层(1-5),冗余存一份:分层点将来若调整,历史结果仍可解释
  stratum          smallint NOT NULL CHECK (stratum BETWEEN 1 AND 5),

  -- 一次快筛 = 一个 session_id 的 40 行。用它取"最近一次"结果
  session_id       uuid NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),

  -- 同一个词重筛时覆盖旧答案(这是一本"已知词"的账,不是流水)
  UNIQUE (user_id, bank_id, word_id)
);

CREATE INDEX IF NOT EXISTS idx_vocab_pre_known_user_bank
  ON public.vocab_pre_known (user_id, bank_id);
CREATE INDEX IF NOT EXISTS idx_vocab_pre_known_session
  ON public.vocab_pre_known (user_id, session_id, created_at DESC);

ALTER TABLE public.vocab_pre_known ENABLE ROW LEVEL SECURITY;

-- 只能读写自己的行
DROP POLICY IF EXISTS "pre_known_select_own" ON public.vocab_pre_known;
CREATE POLICY "pre_known_select_own" ON public.vocab_pre_known
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "pre_known_insert_own" ON public.vocab_pre_known;
CREATE POLICY "pre_known_insert_own" ON public.vocab_pre_known
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "pre_known_update_own" ON public.vocab_pre_known;
CREATE POLICY "pre_known_update_own" ON public.vocab_pre_known
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "pre_known_delete_own" ON public.vocab_pre_known;
CREATE POLICY "pre_known_delete_own" ON public.vocab_pre_known
  FOR DELETE USING (auth.uid() = user_id);

COMMIT;

-- ── validate:跑完贴回给我 ──────────────────────────────────────────
-- ① 表在,列齐(应为 9 行)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema='public' AND table_name='vocab_pre_known'
ORDER BY ordinal_position;

-- ② RLS 已开且有 4 条策略
SELECT relrowsecurity AS rls_on FROM pg_class WHERE relname='vocab_pre_known';
SELECT COUNT(*) AS policy_count FROM pg_policies
WHERE schemaname='public' AND tablename='vocab_pre_known';

-- ③ 唯一约束在(重筛覆盖靠它)
SELECT conname, pg_get_constraintdef(oid) AS def
FROM pg_constraint
WHERE conrelid='public.vocab_pre_known'::regclass AND contype='u';

-- ④ 分层点自查:五层各 894 词、合计 4470(与前端 screening.ts 的 STRATA 必须一致)
SELECT stratum, COUNT(*) AS words FROM (
  SELECT CASE
    WHEN freq_rank IS NULL      THEN 5
    WHEN freq_rank <=  6968     THEN 1
    WHEN freq_rank <= 10234     THEN 2
    WHEN freq_rank <= 14458     THEN 3
    WHEN freq_rank <= 20528     THEN 4
    ELSE 5
  END AS stratum
  FROM public.vocab_words WHERE def_zh IS NOT NULL
) t GROUP BY stratum ORDER BY stratum;
-- 期望:1→894  2→894  3→894  4→894  5→894  合计 4470
