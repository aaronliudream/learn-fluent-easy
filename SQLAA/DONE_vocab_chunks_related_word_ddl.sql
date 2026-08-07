-- ✅ DONE 2026-08-07 已执行,Aaron 回报 validate 四条全 t(related_word_id 列存在/可空/外键 ON DELETE SET NULL/反查索引已建)
-- D 段词块 ↔ F 段搭配 · 连通列(纯 schema,零内容)
--
-- 背景(Aaron 2026-08-06 裁决):D 段词块与 F 段搭配**允许重叠,不删**。
--   F 段 = "某个词的搭配",挂在词卡上
--   D 段 = "独立学习单元",出现在词块页 / 听音短语 / 磨耳朵
-- 同一个短语在两处出现是**多入口强化**,不是浪费。
-- 但重叠必须**连通**,否则用户会以为是两个不相干的东西:
--   · 词块卡显示"来自 <role> 的搭配",可跳词卡
--   · 词卡搭配区反向标记"重点词块"
--
-- ⚠️ 可空:绝大多数词块不与任何 F 段搭配重叠,做成 NOT NULL 会逼着乱挂。
-- ⚠️ 反向标记不加列 —— 词卡那边直接查 vocab_chunks 里
--    related_word_id = 本词 的行即可,加一列反而要双写维护。
--
-- ⚠️ 先勘验后 ALTER(老规矩):第一版 H+I 段 DDL 就是因为假设表不存在、
--    用了 CREATE TABLE IF NOT EXISTS 而静默跳过,后续语句全废。
-- ⚠️ 由 Aaron 执行。

BEGIN;

SELECT 'BEFORE' AS stage,
       (SELECT count(*) FROM information_schema.columns
         WHERE table_schema='public' AND table_name='vocab_chunks'
           AND column_name='related_word_id') AS has_col,
       (SELECT count(*) FROM vocab_chunks) AS chunk_rows;

ALTER TABLE public.vocab_chunks
  ADD COLUMN IF NOT EXISTS related_word_id uuid;

-- 外键:词被删时把关联置空,而不是把词块一起删 ——
-- 词块是独立学习单元,不该因为某个词下架就消失。
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conrelid='public.vocab_chunks'::regclass
       AND conname='vocab_chunks_related_word_fkey'
  ) THEN
    ALTER TABLE public.vocab_chunks
      ADD CONSTRAINT vocab_chunks_related_word_fkey
      FOREIGN KEY (related_word_id) REFERENCES public.vocab_words(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 词卡那边要反向查"这个词有哪些重点词块",按 related_word_id 建索引
CREATE INDEX IF NOT EXISTS vocab_chunks_related_word_idx
  ON public.vocab_chunks (related_word_id) WHERE related_word_id IS NOT NULL;

SELECT 'AFTER' AS stage,
       (SELECT count(*) FROM information_schema.columns
         WHERE table_schema='public' AND table_name='vocab_chunks'
           AND column_name='related_word_id') AS has_col,
       (SELECT count(*) FROM vocab_chunks) AS chunk_rows;

-- ── count-validate:四行都必须是 t,否则 ROLLBACK ──
SELECT 'vocab_chunks 有 related_word_id 列' AS expect,
       EXISTS (SELECT 1 FROM information_schema.columns
                WHERE table_schema='public' AND table_name='vocab_chunks'
                  AND column_name='related_word_id') AS ok
UNION ALL
SELECT '该列可空(多数词块不重叠)',
       (SELECT is_nullable FROM information_schema.columns
         WHERE table_schema='public' AND table_name='vocab_chunks'
           AND column_name='related_word_id') = 'YES'
UNION ALL
SELECT '外键存在且为 ON DELETE SET NULL',
       (SELECT pg_get_constraintdef(oid) FROM pg_constraint
         WHERE conrelid='public.vocab_chunks'::regclass
           AND conname='vocab_chunks_related_word_fkey') LIKE '%SET NULL%'
UNION ALL
SELECT '反查索引已建',
       EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public'
                AND indexname='vocab_chunks_related_word_idx');

COMMIT;
