-- ============================================================================
-- 图书馆「绘本模式」第 2 本 · 给《伊索寓言》第 2 章「狮子和老鼠」写 3 页
-- 依赖:page_index / image_url 两列已存在(20260724_reading_chunks_picturebook_cols.sql 已跑)。
--
-- 口径:按 book slug + chapter 取本章句子,按 para_idx 升序分 3 页 →
--       page_index = 1,2,3;image_url = 'aesop-easy-readers/ch2/p{N}.jpg'。
--       与 ch1 那单(20260724_aesop_ch1_pages.sql)完全同构,只换章号和路径。
--
-- ✅ 这 3 张图**已经传好**(2026-07-25,水彩风重出 → 1200 宽 q82 → 桶 library-illustrations),
--    公开地址实测 HTTP 200:
--      https://degqpiiddkxcuzwombwp.supabase.co/storage/v1/object/public/library-illustrations/aesop-easy-readers/ch2/p1.jpg  (178KB)
--      …/p2.jpg (220KB)  …/p3.jpg (189KB)
--
-- 实测源数据(scripts/library/books/aesop-easy-readers.json,ch2):
--   本章 12 句、3 段(para_idx 三组 → 5/3/4 句)。
--   段1=狮子睡→醒→抓住老鼠→求饶  段2=笑着放走→被网困→吼叫  段3=老鼠咬绳→获救→寓意
--   book_id 不写死,按 book_key 取,避免环境漂移。
--
-- 影响面:where 双限 book_key + chapter_idx = 2,只碰这 12 行。幂等:再跑无害。
-- ⚠️ 跑完还需前端把 'aesop-easy-readers#2' 加进 PICTURE_BOOK_CHAPTERS 才会走绘本渲染。
-- ============================================================================

begin;

-- 前置计数:本章 12 句、page_index 应全空(=0 行已配页)
select count(*) as ch2_rows,
       count(s.page_index) as ch2_paged_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 2;

with tgt as (
  select s.id,
         dense_rank() over (order by s.para_idx) as pg
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers'
    and s.chapter_idx = 2
)
update public.library_sentences s
   set page_index = t.pg,
       image_url  = 'aesop-easy-readers/ch2/p' || t.pg || '.jpg'
  from tgt t
 where s.id = t.id;

-- 后置断言:12 行全部配页、恰好 3 页、3 张不同的图;不满足则整单回滚
do $$
declare v_rows int; v_pages int; v_imgs int;
begin
  select count(*), count(distinct s.page_index), count(distinct s.image_url)
    into v_rows, v_pages, v_imgs
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers'
    and s.chapter_idx = 2
    and s.page_index is not null;
  if v_rows <> 12 or v_pages <> 3 or v_imgs <> 3 then
    raise exception '绘本分页断言失败:已配页行=%(期望 12)、页数=%(期望 3)、图数=%(期望 3)', v_rows, v_pages, v_imgs;
  end if;
end $$;

-- 后置明细:应为 3 行 —— (1,5句,p1.jpg) (2,3句,p2.jpg) (3,4句,p3.jpg)
select s.page_index, count(*) as sentences, min(s.image_url) as image_url
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 2
group by s.page_index
order by s.page_index;

-- 其余 87 章零影响自检:本书除 ch1/ch2 外应无任何行被配页(期望 0)
select count(*) as other_chapters_paged
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx not in (1, 2)
  and s.page_index is not null;

-- ch1 未被本单影响自检(期望 11 / 3 / 3,与 20260724 那单一致)
select count(*) as ch1_paged, count(distinct s.page_index) as ch1_pages,
       count(distinct s.image_url) as ch1_imgs
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 1
  and s.page_index is not null;

commit;
