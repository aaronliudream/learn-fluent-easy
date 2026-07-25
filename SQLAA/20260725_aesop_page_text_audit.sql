-- ============================================================================
-- 【只读审计 · 不改任何数据】伊索寓言绘本模式「每页文字量」压力普查
--
-- 目的:绘本扩章前先证明版式扛得住最坏的一页。
-- 口径依据(前端 src/lib/library/pictureBook.ts buildPages):
--   · page_index 有值 → 按 page_index 分页;
--   · 全章为空 → **退回按 para_idx 分段,一段一页**。
--   伊索目前只有 ch1 配了 page_index(其余 88 章全空),所以对 ch2-89 而言
--   **(chapter_idx, para_idx) 就是将来的一页**,本审计据此统计。
--
-- 安全性:全部 SELECT,无 UPDATE/INSERT/DELETE,无事务副作用。可反复跑。
-- 跑法:Aaron 从本文件复制到 Supabase Dashboard SQL Editor 执行(勿从聊天复制)。
-- ============================================================================

-- ── 查询 1:基准线 —— ch1 现役三页的实测数值(版式已知能扛/不能扛的参照点) ──
-- 期望 3 行(page_index=1/2/3,句数 4/3/4)。en_chars 是英文字符数,both_chars=英+中(中英模式最坏)。
SELECT
  '基准 ch1' AS scope,
  s.page_index                                   AS page,
  count(*)                                       AS sentences,
  sum(length(s.text_en))                         AS en_chars,
  sum(length(coalesce(s.text_cn, '')))           AS cn_chars,
  sum(length(s.text_en) + length(coalesce(s.text_cn, ''))) AS both_chars
FROM public.library_sentences s
JOIN public.library_books b ON b.id = s.book_id
WHERE b.book_key = 'aesop-easy-readers'
  AND s.chapter_idx = 1
GROUP BY s.page_index
ORDER BY s.page_index;

-- ── 查询 2:全书 89 章「将来的每一页」按英文字符数降序 top 20 ──
-- 这 20 行就是版式的压力点。看 ratio_vs_ch1_max:>1 表示比 ch1 最重的一页还重,
-- 3 倍以上意味着要改的是分页规则(拆段/改 page_index),不是 CSS。
WITH pages AS (
  SELECT
    s.chapter_idx,
    coalesce(s.page_index, s.para_idx)           AS page_unit,
    (s.page_index IS NOT NULL)                   AS is_paged,
    count(*)                                     AS sentences,
    sum(length(s.text_en))                       AS en_chars,
    sum(length(coalesce(s.text_cn, '')))         AS cn_chars,
    sum(length(s.text_en) + length(coalesce(s.text_cn, ''))) AS both_chars
  FROM public.library_sentences s
  JOIN public.library_books b ON b.id = s.book_id
  WHERE b.book_key = 'aesop-easy-readers'
  GROUP BY s.chapter_idx, coalesce(s.page_index, s.para_idx), (s.page_index IS NOT NULL)
),
ch1_max AS (
  SELECT max(en_chars) AS v FROM pages WHERE chapter_idx = 1
)
SELECT
  p.chapter_idx,
  p.page_unit,
  CASE WHEN p.is_paged THEN 'page_index(已配页)' ELSE 'para_idx(将来分页)' END AS unit_kind,
  p.sentences,
  p.en_chars,
  p.cn_chars,
  p.both_chars,
  round(p.en_chars::numeric / nullif(c.v, 0), 2) AS ratio_vs_ch1_max
FROM pages p CROSS JOIN ch1_max c
ORDER BY p.en_chars DESC
LIMIT 20;

-- ── 查询 3:整体分布摘要(判断 top20 是长尾个例还是普遍偏重) ──
WITH pages AS (
  SELECT
    s.chapter_idx,
    coalesce(s.page_index, s.para_idx) AS page_unit,
    count(*)                           AS sentences,
    sum(length(s.text_en))             AS en_chars
  FROM public.library_sentences s
  JOIN public.library_books b ON b.id = s.book_id
  WHERE b.book_key = 'aesop-easy-readers'
  GROUP BY s.chapter_idx, coalesce(s.page_index, s.para_idx)
)
SELECT
  count(*)                                                   AS total_pages,
  count(DISTINCT chapter_idx)                                AS total_chapters,
  round(avg(sentences), 2)                                   AS avg_sentences_per_page,
  max(sentences)                                             AS max_sentences_per_page,
  round(avg(en_chars), 1)                                    AS avg_en_chars,
  percentile_cont(0.5) WITHIN GROUP (ORDER BY en_chars)      AS p50_en_chars,
  percentile_cont(0.9) WITHIN GROUP (ORDER BY en_chars)      AS p90_en_chars,
  percentile_cont(0.99) WITHIN GROUP (ORDER BY en_chars)     AS p99_en_chars,
  max(en_chars)                                              AS max_en_chars
FROM pages;

-- ── 查询 4:超出 ch1 基准的页有多少(定量决定"改 CSS 还是改分页规则") ──
-- 若 over_2x 为 0,拆栈版式基本够用;若 over_3x 有量,扩章前必须先改分页。
WITH pages AS (
  SELECT
    s.chapter_idx,
    coalesce(s.page_index, s.para_idx) AS page_unit,
    sum(length(s.text_en))             AS en_chars
  FROM public.library_sentences s
  JOIN public.library_books b ON b.id = s.book_id
  WHERE b.book_key = 'aesop-easy-readers'
  GROUP BY s.chapter_idx, coalesce(s.page_index, s.para_idx)
),
ch1_max AS (
  SELECT max(en_chars) AS v FROM pages WHERE chapter_idx = 1
)
SELECT
  c.v                                                              AS ch1_max_en_chars,
  count(*) FILTER (WHERE p.en_chars > c.v)                         AS over_ch1_max,
  count(*) FILTER (WHERE p.en_chars > c.v * 1.5)                   AS over_1_5x,
  count(*) FILTER (WHERE p.en_chars > c.v * 2)                     AS over_2x,
  count(*) FILTER (WHERE p.en_chars > c.v * 3)                     AS over_3x,
  count(*)                                                         AS total_pages
FROM pages p CROSS JOIN ch1_max c
GROUP BY c.v;

-- ── 查询 5:ch1-ch4 章首图落库没有(顺带确认 library-illustrations-aesop.sql 跑没跑) ──
-- 期望:若跑过 → 4 行(chapter_idx 1/2/3/4,position=0);没跑过 → 0 行。
SELECT li.chapter_idx, li.position, li.image_path, li.is_published
FROM public.library_illustrations li
JOIN public.library_books b ON b.id = li.book_id
WHERE b.book_key = 'aesop-easy-readers'
ORDER BY li.chapter_idx, li.position;

-- ── 查询 6:ch1 页图是否已落 DB(决定前端硬编码兜底表 PICTURE_BOOK_PAGE_IMAGES 能不能删) ──
-- 期望:若 20260724_aesop_ch1_pages.sql 跑过 → 11 行全部 page_index/image_url 非空、3 张不同图。
SELECT
  count(*)                              AS ch1_rows,
  count(s.page_index)                   AS paged_rows,
  count(s.image_url)                    AS imaged_rows,
  count(DISTINCT s.image_url)           AS distinct_images,
  min(s.image_url)                      AS sample_image
FROM public.library_sentences s
JOIN public.library_books b ON b.id = s.book_id
WHERE b.book_key = 'aesop-easy-readers'
  AND s.chapter_idx = 1;
