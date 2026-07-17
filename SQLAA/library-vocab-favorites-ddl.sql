-- ===========================================================================
-- 图书馆精读 · 用户词库(收藏)表 —— 全局跨书、追加式、用户私有。
--   · 收藏一个词/语块进个人词库;出处英文原句 + 中文一并存(天然例句 + 将来复习出题语境)。
--   · 不碰任何掌握表(unified_mastery_manual / junior_word_mastery / mastery_progress)。
--   · RLS 用户私有四件套。幂等:IF NOT EXISTS + DROP POLICY IF EXISTS。BEGIN/COMMIT + 前后计数。
-- ===========================================================================

-- 跑前:确认是否已存在
SELECT EXISTS (SELECT 1 FROM information_schema.tables
       WHERE table_schema='public' AND table_name='library_vocab_favorites') AS table_exists;

BEGIN;

CREATE TABLE IF NOT EXISTS public.library_vocab_favorites (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  term         text NOT NULL,                                  -- 收藏的词 / 语块(表面词形)
  kind         text NOT NULL DEFAULT 'word',                   -- 'word' | 'chunk'
  zh           text,                                           -- 中文释义(轻词义 gloss_cn)
  ipa          text,                                           -- 音标
  pos          text,                                           -- 词性
  src_sentence text,                                           -- 出处英文原句(天然例句/复习语境)
  src_zh       text,                                           -- 出处中文
  book_id      uuid REFERENCES public.library_books(id) ON DELETE SET NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, term, kind)                                 -- 同一词按 term+kind 去重(再收藏=更新)
);

CREATE INDEX IF NOT EXISTS idx_library_vocab_favorites_user
  ON public.library_vocab_favorites (user_id, kind, created_at DESC);

ALTER TABLE public.library_vocab_favorites ENABLE ROW LEVEL SECURITY;

-- 用户私有四件套(照 library_reading_progress / exam_favorites 先例)
DROP POLICY IF EXISTS "lvf_select_own" ON public.library_vocab_favorites;
CREATE POLICY "lvf_select_own" ON public.library_vocab_favorites
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "lvf_insert_own" ON public.library_vocab_favorites;
CREATE POLICY "lvf_insert_own" ON public.library_vocab_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "lvf_update_own" ON public.library_vocab_favorites;
CREATE POLICY "lvf_update_own" ON public.library_vocab_favorites
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "lvf_delete_own" ON public.library_vocab_favorites;
CREATE POLICY "lvf_delete_own" ON public.library_vocab_favorites
  FOR DELETE USING (auth.uid() = user_id);

COMMENT ON TABLE public.library_vocab_favorites IS
  '图书馆精读用户词库:收藏词/语块 + 出处原句;全局跨书、用户私有;不碰掌握表。';

-- 跑后:确认建成
SELECT 'after' AS phase,
       (SELECT count(*) FROM public.library_vocab_favorites) AS rows;

COMMIT;
