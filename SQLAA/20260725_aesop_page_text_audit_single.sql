-- ============================================================================
-- 【只读审计 · 单一结果集版】伊索寓言绘本模式「每页文字量」压力普查
--
-- 为什么有这一版:Supabase Dashboard 的 SQL Editor 一次执行多条 SELECT 时**只返回最后一个结果集**,
--   原文件 20260725_aesop_page_text_audit.sql 的前 5 条会被吞掉。本版用 UNION ALL 合成一张表,
--   加 section 列标明来源 → 一次粘贴、一次 Run、一张结果。原文件保留不动。
--
-- 口径依据(前端 src/lib/library/pictureBook.ts buildPages):
--   page_index 有值 → 按 page_index 分页;全章为空 → 退回按 para_idx,一段一页。
--   伊索目前只有 ch1 配了 page_index,故 ch2-89 的 (chapter_idx, para_idx) 就是将来的一页。
--
-- 读法:
--   section=ch1_baseline       ch1 现役三页基准(判读下面几条的分母)
--   section=top20              全书最重的 20 页,看 ratio_vs_ch1_max 倍数列
--   section=distribution       分布摘要(长尾 还是 普遍偏重),值看 metric_value
--   section=threshold_counts   ★卡闸★ over_2x / over_3x 计数,值看 metric_value
--   section=illustrations      ch1-ch4 章首图落库没有(row_count=0 表示那单 SQL 没跑)
--   section=ch1_pages          ch1 页图是否已落 DB(决定 PICTURE_BOOK_PAGE_IMAGES 能否删)
--
-- 判读线:over_2x=0 → 拆栈够用可开闸;over_2x 有量且 over_3x=0 → 看 top20 再定;
--         over_3x 有量 → 改的不是 CSS 是分页规则,ch1 模板要回炉。
--
-- 安全性:全部 SELECT,无 UPDATE/INSERT/DELETE,无事务副作用。可反复跑。
-- ============================================================================

WITH pages AS (
  SELECT
    s.chapter_idx,
    coalesce(s.page_index, s.para_idx)                       AS page_unit,
    (s.page_index IS NOT NULL)                               AS is_paged,
    count(*)                                                 AS sentences,
    sum(length(s.text_en))                                   AS en_chars,
    sum(length(coalesce(s.text_cn, '')))                     AS cn_chars,
    sum(length(s.text_en) + length(coalesce(s.text_cn, ''))) AS both_chars
  FROM public.library_sentences s
  JOIN public.library_books b ON b.id = s.book_id
  WHERE b.book_key = 'aesop-easy-readers'
  GROUP BY s.chapter_idx, coalesce(s.page_index, s.para_idx), (s.page_index IS NOT NULL)
),
ch1_max AS (
  SELECT max(en_chars) AS v FROM pages WHERE chapter_idx = 1
),
top20 AS (
  SELECT p.*, row_number() OVER (ORDER BY p.en_chars DESC, p.chapter_idx, p.page_unit) AS rn
  FROM pages p
  ORDER BY p.en_chars DESC, p.chapter_idx, p.page_unit
  LIMIT 20
),
summary AS (
  SELECT
    count(*)                                                          AS total_pages,
    count(DISTINCT chapter_idx)                                       AS total_chapters,
    avg(sentences)::numeric                                           AS avg_sentences,
    max(sentences)::numeric                                           AS max_sentences,
    avg(en_chars)::numeric                                            AS avg_en,
    -- ⚠️ percentile_cont 只有 double precision / interval 两个变体(没有 numeric 版):
    --    cast 必须加在**结果**上,加在 ORDER BY 上会被隐式转回 double precision,
    --    导致后面 round(double precision, int) 找不到函数(42883)。
    (percentile_cont(0.5)  WITHIN GROUP (ORDER BY en_chars))::numeric AS p50_en,
    (percentile_cont(0.9)  WITHIN GROUP (ORDER BY en_chars))::numeric AS p90_en,
    (percentile_cont(0.99) WITHIN GROUP (ORDER BY en_chars))::numeric AS p99_en,
    max(en_chars)::numeric                                            AS max_en
  FROM pages
),
thresholds AS (
  SELECT
    c.v::numeric                                                   AS ch1_max_en,
    count(*)::numeric                                              AS total_pages,
    (count(*) FILTER (WHERE p.en_chars > c.v))::numeric            AS over_1x,
    (count(*) FILTER (WHERE p.en_chars > c.v * 1.5))::numeric      AS over_1_5x,
    (count(*) FILTER (WHERE p.en_chars > c.v * 2))::numeric        AS over_2x,
    (count(*) FILTER (WHERE p.en_chars > c.v * 3))::numeric        AS over_3x
  FROM pages p CROSS JOIN ch1_max c
  GROUP BY c.v
),
illus AS (
  SELECT li.chapter_idx, li.position, li.image_path, li.is_published
  FROM public.library_illustrations li
  JOIN public.library_books b ON b.id = li.book_id
  WHERE b.book_key = 'aesop-easy-readers'
),
ch1p AS (
  SELECT
    count(*)::numeric                    AS ch1_rows,
    count(s.page_index)::numeric         AS paged_rows,
    count(s.image_url)::numeric          AS imaged_rows,
    count(DISTINCT s.image_url)::numeric AS distinct_images
  FROM public.library_sentences s
  JOIN public.library_books b ON b.id = s.book_id
  WHERE b.book_key = 'aesop-easy-readers' AND s.chapter_idx = 1
),
unioned AS (
  -- ① ch1 基准:现役三页
  SELECT 1 AS srt, p.page_unit AS srt2,
         'ch1_baseline'::text        AS section,
         p.chapter_idx::int          AS chapter_idx,
         p.page_unit::int            AS page_unit,
         ('第 ' || p.page_unit || ' 页')::text AS label,
         p.sentences::bigint         AS sentences,
         p.en_chars::bigint          AS en_chars,
         p.cn_chars::bigint          AS cn_chars,
         p.both_chars::bigint        AS both_chars,
         NULL::numeric               AS ratio_vs_ch1_max,
         NULL::numeric               AS metric_value
  FROM pages p WHERE p.chapter_idx = 1

  UNION ALL
  -- ② 全书最重的 20 页
  SELECT 2, t.rn,
         'top20',
         t.chapter_idx::int,
         t.page_unit::int,
         CASE WHEN t.is_paged THEN 'page_index(已配页)' ELSE 'para_idx(将来分页)' END,
         t.sentences::bigint,
         t.en_chars::bigint,
         t.cn_chars::bigint,
         t.both_chars::bigint,
         round(t.en_chars::numeric / nullif(c.v, 0), 2),
         NULL::numeric
  FROM top20 t CROSS JOIN ch1_max c

  UNION ALL
  -- ③ 分布摘要
  SELECT 3, m.ord,
         'distribution',
         NULL::int, NULL::int,
         m.name,
         NULL::bigint, NULL::bigint, NULL::bigint, NULL::bigint,
         NULL::numeric,
         m.val
  FROM summary s
  CROSS JOIN LATERAL (VALUES
      (1, 'total_pages',            s.total_pages::numeric),
      (2, 'total_chapters',         s.total_chapters::numeric),
      (3, 'avg_sentences_per_page', round(s.avg_sentences, 2)),
      (4, 'max_sentences_per_page', s.max_sentences),
      (5, 'avg_en_chars',           round(s.avg_en, 1)),
      (6, 'p50_en_chars',           round(s.p50_en, 1)),
      (7, 'p90_en_chars',           round(s.p90_en, 1)),
      (8, 'p99_en_chars',           round(s.p99_en, 1)),
      (9, 'max_en_chars',           s.max_en)
  ) AS m(ord, name, val)

  UNION ALL
  -- ④ ★卡闸★ 超标计数
  SELECT 4, m.ord,
         'threshold_counts',
         NULL::int, NULL::int,
         m.name,
         NULL::bigint, NULL::bigint, NULL::bigint, NULL::bigint,
         NULL::numeric,
         m.val
  FROM thresholds t
  CROSS JOIN LATERAL (VALUES
      (1, 'ch1_max_en_chars(分母)', t.ch1_max_en),
      (2, 'total_pages',            t.total_pages),
      (3, 'over_ch1_max',           t.over_1x),
      (4, 'over_1_5x',              t.over_1_5x),
      (5, 'over_2x  ★',             t.over_2x),
      (6, 'over_3x  ★★',            t.over_3x)
  ) AS m(ord, name, val)

  UNION ALL
  -- ⑤a 章首图行数(恒有一行:=0 说明 library-illustrations-aesop.sql 没跑)
  SELECT 5, 0,
         'illustrations',
         NULL::int, NULL::int,
         'row_count'::text,
         NULL::bigint, NULL::bigint, NULL::bigint, NULL::bigint,
         NULL::numeric,
         (SELECT count(*) FROM illus)::numeric

  UNION ALL
  -- ⑤b 章首图明细(跑过则 4 行)
  SELECT 5, i.chapter_idx + 1,
         'illustrations',
         i.chapter_idx::int,
         i.position::int,
         (i.image_path || CASE WHEN i.is_published THEN '  [published]' ELSE '  [UNPUBLISHED]' END),
         NULL::bigint, NULL::bigint, NULL::bigint, NULL::bigint,
         NULL::numeric, NULL::numeric
  FROM illus i

  UNION ALL
  -- ⑥ ch1 页图落库情况
  SELECT 6, m.ord,
         'ch1_pages',
         NULL::int, NULL::int,
         m.name,
         NULL::bigint, NULL::bigint, NULL::bigint, NULL::bigint,
         NULL::numeric,
         m.val
  FROM ch1p p
  CROSS JOIN LATERAL (VALUES
      (1, 'ch1_rows(期望 11)',       p.ch1_rows),
      (2, 'paged_rows(期望 11)',     p.paged_rows),
      (3, 'imaged_rows(期望 11)',    p.imaged_rows),
      (4, 'distinct_images(期望 3)', p.distinct_images)
  ) AS m(ord, name, val)
)
SELECT
  section,
  chapter_idx,
  page_unit,
  label,
  sentences,
  en_chars,
  cn_chars,
  both_chars,
  ratio_vs_ch1_max,
  metric_value
FROM unioned
ORDER BY srt, srt2;
