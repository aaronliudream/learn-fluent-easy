-- ============================================================================
-- 图书馆「私享访问层」· 受版权保护的书仅授权账号可见(在 DB RLS 层强制,不是前端藏)。
--   · library_books 加 visibility('public' 默认 / 'private');公有书全程不受影响。
--   · 白名单表 library_private_access(user_id):放被授权的账号。
--   · SECURITY DEFINER 判定函数绕过白名单表 RLS,避免递归/越权。
--   · 收紧 library_books / library_sentences 的 SELECT:private 书只对白名单账号返回,
--     直连 PostgREST 也取不到正文(publishable key + 无授权 JWT → auth.uid() 为 null → 判否)。
--   · 公有已发布书(绿野仙踪/伊索)保持人人可读,零回归(visibility 默认 public)。
-- 幂等:IF NOT EXISTS / CREATE OR REPLACE / DROP POLICY IF EXISTS / ON CONFLICT。
-- ============================================================================
BEGIN;

-- 1) 书目加 visibility 维度(默认 public → 现有书全部保持公开)
ALTER TABLE public.library_books
  ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'public'
  CHECK (visibility IN ('public','private'));

-- 2) 白名单表(只服务端写;客户端读不到 → 不暴露"谁被授权")
CREATE TABLE IF NOT EXISTS public.library_private_access (
  user_id    uuid PRIMARY KEY,
  note       text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.library_private_access ENABLE ROW LEVEL SECURITY;
-- 不建任何 SELECT/INSERT 策略 → 客户端无法读写;仅 service_role + 下面的 definer 函数可达。

-- 3) 判定函数(SECURITY DEFINER:绕过 library_private_access 的 RLS)
CREATE OR REPLACE FUNCTION public.has_library_private_access()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.library_private_access WHERE user_id = auth.uid());
$$;

-- 某书是否对当前账号"可读"(已发布 且 (公开 或 在白名单))。definer 绕过 books 自身 RLS,供 sentences 策略调用。
CREATE OR REPLACE FUNCTION public.library_book_readable(bookid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.library_books b
     WHERE b.id = bookid AND b.is_published = true
       AND (b.visibility = 'public' OR public.has_library_private_access())
  );
$$;

GRANT EXECUTE ON FUNCTION public.has_library_private_access() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.library_book_readable(uuid)  TO anon, authenticated;

-- 4) 收紧 RLS
-- 书:已发布 且 (公开 或 白名单)。公开书对所有人不变;private 书只对白名单账号可见。
DROP POLICY IF EXISTS "library_books_read" ON public.library_books;
CREATE POLICY "library_books_read" ON public.library_books FOR SELECT
  USING (is_published = true AND (visibility = 'public' OR public.has_library_private_access()));

-- 句子:随书可见性。原策略是 USING(true)(全可读),现改为"其所属书对当前账号可读"。
--   公开已发布书的句子照常人人可读;private 书句子只对白名单账号返回(封死直连拉正文)。
DROP POLICY IF EXISTS "library_sentences_read" ON public.library_sentences;
CREATE POLICY "library_sentences_read" ON public.library_sentences FOR SELECT
  USING (public.library_book_readable(book_id));

-- 5) 灌入首批授权账号(Aaron 指定)
INSERT INTO public.library_private_access (user_id, note) VALUES
  ('3c7ef843-f99e-4dbf-97f3-40758112fd9f', '8888 (guest)'),
  ('1d44a541-debe-48b0-bdd2-53243de3cfd5', 'aaron.liudream@outlook.com / aarondream')
ON CONFLICT (user_id) DO NOTHING;

-- 6) 校验
SELECT 'whitelist' AS chk, count(*) AS n FROM public.library_private_access;
SELECT 'books_by_visibility' AS chk, visibility, count(*) FROM public.library_books GROUP BY visibility;

COMMIT;
