-- 图书馆「绘本模式」样张 · 第 2 步:给《伊索寓言》第 1 章「龟兔赛跑」写 3 页
-- 依赖:先跑 20260724_reading_chunks_picturebook_cols.sql(加 page_index / image_url 两列)。
--
-- 口径:按 book slug + chapter 取本章句子,按现有顺序(para_idx 升序)分 3 页 →
--       page_index = 1,2,3;image_url = 'aesop-easy-readers/ch1/p{N}.jpg'。
--       ✅ 这 3 张图**已经传好**(2026-07-24,Aaron 出的图 → 1200 宽 q82 → 桶 library-illustrations),
--          公开地址实测 200:
--            https://degqpiiddkxcuzwombwp.supabase.co/storage/v1/object/public/library-illustrations/aesop-easy-readers/ch1/p1.jpg  (139KB)
--            …/p2.jpg (164KB)  …/p3.jpg (103KB)
--       跑不跑这单 SQL 都能看到绘本(前端有页图兜底表);跑了之后图路径就以 DB 为准,兜底表可删。
--
-- 实测数据(2026-07-24 直连 DB):本章 11 句、3 段(para_idx 1/2/3 → 4/3/4 句),
--   book_id = d2c34f14-0d04-4f8d-ad3d-07ddd8ce2822(此处不写死 id,按 book_key 取,避免环境漂移)。
-- 影响面:where 双限 book_key + chapter_idx = 1,只碰这 11 行。

begin;

-- 前置计数:本章 11 句、page_index 应全空(=0 行已配页)
select count(*) as ch1_rows,
       count(s.page_index) as ch1_paged_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 1;

with tgt as (
  select s.id,
         dense_rank() over (order by s.para_idx) as pg
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers'
    and s.chapter_idx = 1
)
update public.library_sentences s
   set page_index = t.pg,
       image_url  = 'aesop-easy-readers/ch1/p' || t.pg || '.jpg'
  from tgt t
 where s.id = t.id;

-- 后置断言:11 行全部配页、恰好 3 页、3 张不同的图;不满足则整单回滚
do $$
declare v_rows int; v_pages int; v_imgs int;
begin
  select count(*), count(distinct s.page_index), count(distinct s.image_url)
    into v_rows, v_pages, v_imgs
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers'
    and s.chapter_idx = 1
    and s.page_index is not null;
  if v_rows <> 11 or v_pages <> 3 or v_imgs <> 3 then
    raise exception '绘本分页断言失败:已配页行=%(期望 11)、页数=%(期望 3)、图数=%(期望 3)', v_rows, v_pages, v_imgs;
  end if;
end $$;

-- 后置明细:应为 3 行 —— (1,4句,p1.jpg) (2,3句,p2.jpg) (3,4句,p3.jpg)
select s.page_index, count(*) as sentences, min(s.image_url) as image_url
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 1
group by s.page_index
order by s.page_index;

-- 其余 88 章零影响自检:本书除第 1 章外应无任何行被配页(期望 0)
select count(*) as other_chapters_paged
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx <> 1
  and s.page_index is not null;

commit;
