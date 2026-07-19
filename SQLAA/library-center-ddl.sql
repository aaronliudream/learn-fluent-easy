-- ============================================================================
-- 图书馆(Library / Reading Center v1)· 建表 DDL
-- 3 张新表(追加式,绝不改老表):
--   library_books            书目元数据(内容表,书类内容唯一权威书目 · DECISIONS D12)
--   library_sentences        逐句原子(内容表)——沉浸朗读器/断点续读/连续朗读的最小单位
--   library_reading_progress 每用户每册一个 JSON blob(用户私有表,照 primary_hub_progress)
-- 与 P0 reading_library / /reading 完全隔离,一行不碰。
-- 纯技术 DDL(不含内容),可随时跑;跑完再跑 library-seed-*.sql(内容,须先过审)。
-- 幂等:IF NOT EXISTS / DROP POLICY IF EXISTS,可重复执行。
-- 规约:BEGIN/COMMIT + 前后 COUNT 基线(改库铁律)。
-- ============================================================================

BEGIN;

-- 跑前基线
SELECT 'before' AS phase,
       (SELECT count(*) FROM information_schema.tables
         WHERE table_schema='public' AND table_name='library_books')            AS books_exists,
       (SELECT count(*) FROM information_schema.tables
         WHERE table_schema='public' AND table_name='library_sentences')        AS sentences_exists,
       (SELECT count(*) FROM information_schema.tables
         WHERE table_schema='public' AND table_name='library_reading_progress') AS progress_exists;

-- ---------------------------------------------------------------------------
-- 1) library_books —— 书目元数据(内容表)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.library_books (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_key       text NOT NULL UNIQUE,                 -- 稳定 slug(路由用),如 aesop-fables
  title          text NOT NULL,                        -- 英文书名
  zh_title       text,                                 -- 中文书名
  author         text,
  age_band       text NOT NULL CHECK (age_band IN ('少儿','儿童','青少年','成人')),
  age_range      text,                                 -- 软提示,如 7-9岁
  cover          jsonb NOT NULL DEFAULT '{}'::jsonb,   -- 封面配置,如 {"c1":"#2A315A","c2":"#4A5AA0"}
  intro_en       text,                                 -- 英文简介
  intro_zh       text,                                 -- 中文简介
  sentence_count int  NOT NULL DEFAULT 0,              -- 总句数(进度分母)
  copyright_note text,                                 -- 版权提示(公版书可空)
  is_published   boolean NOT NULL DEFAULT false,       -- 软上线开关
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 2) library_sentences —— 逐句原子(内容表)
--    (book_id, seq) 覆盖全书顺序;chapter_idx 用真实章号(D12),para_idx 段落分隔。
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.library_sentences (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id     uuid NOT NULL REFERENCES public.library_books(id) ON DELETE CASCADE,
  chapter_idx int  NOT NULL DEFAULT 0,                 -- 真实章号(D12:不塌成全 0)
  para_idx    int  NOT NULL,                           -- 段落序号(渲染段落分隔)
  seq         int  NOT NULL,                           -- 全书句子顺序(断点续读/连续朗读)
  text_en     text NOT NULL,                           -- 英文原句
  text_cn     text,                                    -- 中文翻译
  audio_url   text,                                    -- 预生成后回填;空则前端实时合成
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_library_sentences_book_seq
  ON public.library_sentences (book_id, seq);

-- ---------------------------------------------------------------------------
-- 3) library_reading_progress —— 每用户每册一个 JSON blob(用户私有表)
--    state 形状:{ furthest_seq, last_seq, seconds, chapter_idx, updated_at }
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.library_reading_progress (
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id    uuid NOT NULL REFERENCES public.library_books(id) ON DELETE CASCADE,
  state      jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, book_id)
);

CREATE INDEX IF NOT EXISTS idx_library_reading_progress_user
  ON public.library_reading_progress (user_id, updated_at DESC);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.library_books            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_sentences        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_reading_progress ENABLE ROW LEVEL SECURITY;

-- 内容表:书只在 is_published=true 时对客户端可见;句子随书公开(未发布书靠 books 侧过滤)。
-- 写入仅 service role(灌库脚本),不建 client 写策略(照 junior_vocab 那套)。
DROP POLICY IF EXISTS "library_books_read" ON public.library_books;
CREATE POLICY "library_books_read"
  ON public.library_books FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "library_sentences_read" ON public.library_sentences;
CREATE POLICY "library_sentences_read"
  ON public.library_sentences FOR SELECT USING (true);

-- 用户私有表:标准四件套(auth.uid() = user_id)。
DROP POLICY IF EXISTS "lrp_select_own" ON public.library_reading_progress;
CREATE POLICY "lrp_select_own" ON public.library_reading_progress
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "lrp_insert_own" ON public.library_reading_progress;
CREATE POLICY "lrp_insert_own" ON public.library_reading_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "lrp_update_own" ON public.library_reading_progress;
CREATE POLICY "lrp_update_own" ON public.library_reading_progress
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "lrp_delete_own" ON public.library_reading_progress;
CREATE POLICY "lrp_delete_own" ON public.library_reading_progress
  FOR DELETE USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- updated_at 自动维护:挂共享触发器 public.update_updated_at_column()
-- (全站已有的 updated_at 触发函数;user_mistakes 等在用。DROP IF EXISTS 保幂等。)
-- ---------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_library_books_updated_at ON public.library_books;
CREATE TRIGGER trg_library_books_updated_at
  BEFORE UPDATE ON public.library_books
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_library_reading_progress_updated_at ON public.library_reading_progress;
CREATE TRIGGER trg_library_reading_progress_updated_at
  BEFORE UPDATE ON public.library_reading_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.library_books IS
  '图书馆书目元数据(书类内容唯一权威书目;未来理解题走追加式 library_questions(book_id,chapter_idx) 引用之 · DECISIONS D12)。';
COMMENT ON TABLE public.library_sentences IS
  '图书馆逐句原子(沉浸朗读器/断点续读/连续朗读的最小单位;chapter_idx 用真实章号)。';
COMMENT ON TABLE public.library_reading_progress IS
  '图书馆阅读进度(每用户每册一个 JSON blob:furthest_seq/last_seq/seconds/chapter_idx;云同步 local∪remote 取 max)。';

-- 跑后核对
SELECT 'after' AS phase,
       (SELECT count(*) FROM public.library_books)            AS books_rows,
       (SELECT count(*) FROM public.library_sentences)        AS sentences_rows,
       (SELECT count(*) FROM public.library_reading_progress) AS progress_rows;

COMMIT;
