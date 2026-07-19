-- ===========================================================================
-- 图书馆插图 · Storage 桶 + library_illustrations 表(一次性建好)。
--   · 桶 library-illustrations:公开读(public bucket → 公开 URL 直供,无需读策略);
--     写入仅 service_role(dashboard / CLING 上传);限图片 MIME + 5MB。
--   · 表 library_illustrations:每章 0..N 张图(v1 只用 position=0 章首);内容表 RLS。
--   · 不碰掌握表、不碰现有表。幂等:ON CONFLICT / IF NOT EXISTS。BEGIN/COMMIT + 前后计数。
-- ===========================================================================

BEGIN;

SELECT 'before' AS phase,
       (SELECT count(*) FROM storage.buckets WHERE id='library-illustrations') AS bucket_exists,
       (SELECT count(*) FROM information_schema.tables
         WHERE table_schema='public' AND table_name='library_illustrations') AS table_exists;

-- 1) 公开桶(公开读;写靠 service_role)。限图片 + 5MB(降采样后单图应 <500KB)。
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('library-illustrations', 'library-illustrations', true, 5242880,
        ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

-- 2) 插图表
CREATE TABLE IF NOT EXISTS public.library_illustrations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id     uuid NOT NULL REFERENCES public.library_books(id) ON DELETE CASCADE,
  chapter_idx int  NOT NULL,
  position    int  NOT NULL DEFAULT 0,          -- 0=章首(v1 只用 0);>0 留给 v2 文中穿插
  image_path  text NOT NULL,                    -- 桶内路径 ${book_key}/ch${n}-${slug}.jpg
  caption     text,                             -- 原书图注(如 "The tree fell with a crash…")
  alt_text    text,                             -- 无障碍/降级文字
  credit      text,                             -- 来源标注(Denslow / Wikimedia Commons)
  width       int,                              -- 存尺寸 → 前端写死宽高防 CLS 布局跳动
  height      int,
  is_published boolean NOT NULL DEFAULT false,  -- 审后置 true(软上线开关)
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (book_id, chapter_idx, position)       -- 每章每位置一张,幂等 upsert 用
);

CREATE INDEX IF NOT EXISTS idx_library_illustrations_book_ch
  ON public.library_illustrations (book_id, chapter_idx);

-- 3) RLS:内容表老套路——只读已发布,写仅 service_role(无客户端写策略)。
ALTER TABLE public.library_illustrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "li_read_published" ON public.library_illustrations;
CREATE POLICY "li_read_published" ON public.library_illustrations
  FOR SELECT USING (is_published = true);

COMMENT ON TABLE public.library_illustrations IS
  '图书馆每章插图(v1 章首,position=0);公有领域 Denslow 图;公开桶 library-illustrations。';

SELECT 'after' AS phase,
       (SELECT count(*) FROM storage.buckets WHERE id='library-illustrations') AS bucket_exists,
       (SELECT count(*) FROM information_schema.tables
         WHERE table_schema='public' AND table_name='library_illustrations') AS table_exists;

COMMIT;
