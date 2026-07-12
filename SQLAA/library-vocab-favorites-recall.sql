-- ===========================================================================
-- 图书馆精读 · 词库收藏表加「微提取」计数字段(先回忆后揭晓)。
--   · recall_hit_count  想起来了的次数
--   · recall_miss_count 想不起来的次数
--   · last_recalled_at  最近一次回忆时间
-- 纯加列,只加不减;暂不接掌握引擎(那三张掌握表的坑留下一轮)。幂等:IF NOT EXISTS。
-- ===========================================================================

BEGIN;

ALTER TABLE public.library_vocab_favorites
  ADD COLUMN IF NOT EXISTS recall_hit_count  integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS recall_miss_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_recalled_at  timestamptz;

-- 确认加成
SELECT column_name
  FROM information_schema.columns
 WHERE table_schema='public' AND table_name='library_vocab_favorites'
   AND column_name IN ('recall_hit_count','recall_miss_count','last_recalled_at')
 ORDER BY column_name;

COMMIT;
