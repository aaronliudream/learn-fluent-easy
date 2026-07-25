-- ============================================================================
-- 图书馆「绘本模式」第 3 本 · 给《伊索寓言》第 3 章「狐狸和葡萄」写 3 页
-- 依赖:page_index / image_url 两列已存在(20260724_reading_chunks_picturebook_cols.sql 已跑)。
--
-- 口径:按 book slug + chapter 取本章句子,按 para_idx 升序分 3 页 →
--       page_index = 1,2,3;image_url = 'aesop-easy-readers/ch3/p{N}.jpg'。
--       与 ch1 / ch2 两单完全同构,只换章号和路径。
--
-- ✅ 这 3 张图**已经传好**(2026-07-25,水彩风 → 1200 宽 q82 → 桶 library-illustrations),
--    公开地址实测 HTTP 200:
--      https://degqpiiddkxcuzwombwp.supabase.co/storage/v1/object/public/library-illustrations/aesop-easy-readers/ch3/p1.jpg  (218KB)
--      …/p2.jpg (207KB)  …/p3.jpg (178KB)
--
-- 实测源数据(scripts/library/books/aesop-easy-readers.json,ch3 + 生产库只读核对):
--   本章 10 句、3 段(para_idx 三组 → 3/3/4 句)。
--   段1=看见高悬的葡萄  段2=跃起够不到,一次又一次  段3=走开说"反正是酸的"+寓意
--   book_id 不写死,按 book_key 取,避免环境漂移。
--
-- 画面验收要点(本章曾因画反寓意被打回一次):三页葡萄串始终完好、狐狸从未碰到,
--   p2 爪尖与葡萄之间留有可见空隙 —— "够不到"是本则寓言的全部意义所在。
--
-- 影响面:where 双限 book_key + chapter_idx = 3,只碰这 10 行。幂等:再跑无害。
-- ⚠️ 跑完还需前端把 'aesop-easy-readers#3' 加进 PICTURE_BOOK_CHAPTERS 才会走绘本渲染。
-- ============================================================================

begin;

-- 前置计数:本章 10 句、page_index 应全空(=0 行已配页)
select count(*) as ch3_rows,
       count(s.page_index) as ch3_paged_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 3;

with tgt as (
  select s.id,
         dense_rank() over (order by s.para_idx) as pg
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers'
    and s.chapter_idx = 3
)
update public.library_sentences s
   set page_index = t.pg,
       image_url  = 'aesop-easy-readers/ch3/p' || t.pg || '.jpg'
  from tgt t
 where s.id = t.id;

-- 后置断言:10 行全部配页、恰好 3 页、3 张不同的图;不满足则整单回滚
do $$
declare v_rows int; v_pages int; v_imgs int;
begin
  select count(*), count(distinct s.page_index), count(distinct s.image_url)
    into v_rows, v_pages, v_imgs
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers'
    and s.chapter_idx = 3
    and s.page_index is not null;
  if v_rows <> 10 or v_pages <> 3 or v_imgs <> 3 then
    raise exception '绘本分页断言失败:已配页行=%(期望 10)、页数=%(期望 3)、图数=%(期望 3)', v_rows, v_pages, v_imgs;
  end if;
end $$;

-- 后置明细:应为 3 行 —— (1,3句,p1.jpg) (2,3句,p2.jpg) (3,4句,p3.jpg)
select s.page_index, count(*) as sentences, min(s.image_url) as image_url
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 3
group by s.page_index
order by s.page_index;

-- 其余 86 章零影响自检:本书除 ch1/ch2/ch3 外应无任何行被配页(期望 0)
select count(*) as other_chapters_paged
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx not in (1, 2, 3)
  and s.page_index is not null;

-- ch1 / ch2 未被本单影响自检(期望 ch1=11/3/3、ch2=12/3/3)
select s.chapter_idx,
       count(*) as paged_rows,
       count(distinct s.page_index) as pages,
       count(distinct s.image_url) as imgs
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx in (1, 2)
  and s.page_index is not null
group by s.chapter_idx
order by s.chapter_idx;

commit;
