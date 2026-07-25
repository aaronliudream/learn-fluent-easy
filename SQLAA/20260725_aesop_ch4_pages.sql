-- ============================================================================
-- 图书馆「绘本模式」第 4 本 · 给《伊索寓言》第 4 章「蚂蚁和蚱蜢」写 3 页
-- 依赖:page_index / image_url 两列已存在(20260724_reading_chunks_picturebook_cols.sql 已跑)。
--
-- 口径:按 book slug + chapter 取本章句子,按 para_idx 升序分 3 页 →
--       page_index = 1,2,3;image_url = 'aesop-easy-readers/ch4/p{N}.jpg'。
--       与 ch1 / ch2 / ch3 三单完全同构,只换章号和路径。
--
-- ✅ 这 3 张图**已经传好**(2026-07-25,水彩风 → 1200 宽 q82 → 桶 library-illustrations),
--    公开地址实测 HTTP 200:
--      https://degqpiiddkxcuzwombwp.supabase.co/storage/v1/object/public/library-illustrations/aesop-easy-readers/ch4/p1.jpg  (202KB)
--      …/p2.jpg (203KB)  …/p3.jpg (180KB)
--
-- 实测源数据(scripts/library/books/aesop-easy-readers.json,ch4 + 生产库只读核对):
--   本章 11 句、3 段(para_idx 三组 → 4/3/4 句)。
--   段1=夏日蚂蚁搬粮·蚱蜢唱歌  段2=蚱蜢邀约·蚂蚁不停  段3=冬来蚱蜢空手·蚂蚁温饱+寓意
--   book_id 不写死,按 book_key 取,避免环境漂移。
--
-- 画面验收要点(本章有两条红线):
--   ① 寓意红线:第 3 页**不得**画成蚂蚁开门施舍/递食物/迎蚱蜢进屋 —— 那会把
--      「未雨绸缪才明智」当场反转成「没关系总有人救你」。已验:土墙分隔,无施舍。
--   ② 年龄红线:蚱蜢**不得**画成倒毙/僵卧/濒死 —— 他是冷、饿、后悔,站着。已验:站立发抖。
--
-- 影响面:where 双限 book_key + chapter_idx = 4,只碰这 11 行。幂等:再跑无害。
-- ⚠️ 跑完还需前端把 'aesop-easy-readers#4' 加进 PICTURE_BOOK_CHAPTERS 才会走绘本渲染。
-- ============================================================================

begin;

-- 前置计数:本章 11 句、page_index 应全空(=0 行已配页)
select count(*) as ch4_rows,
       count(s.page_index) as ch4_paged_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 4;

with tgt as (
  select s.id,
         dense_rank() over (order by s.para_idx) as pg
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers'
    and s.chapter_idx = 4
)
update public.library_sentences s
   set page_index = t.pg,
       image_url  = 'aesop-easy-readers/ch4/p' || t.pg || '.jpg'
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
    and s.chapter_idx = 4
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
  and s.chapter_idx = 4
group by s.page_index
order by s.page_index;

-- 其余 85 章零影响自检:本书除 ch1-ch4 外应无任何行被配页(期望 0)
select count(*) as other_chapters_paged
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx not in (1, 2, 3, 4)
  and s.page_index is not null;

-- ch1-ch3 未被本单影响自检(期望 ch1=11/3/3、ch2=12/3/3、ch3=10/3/3)
select s.chapter_idx,
       count(*) as paged_rows,
       count(distinct s.page_index) as pages,
       count(distinct s.image_url) as imgs
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx in (1, 2, 3)
  and s.page_index is not null
group by s.chapter_idx
order by s.chapter_idx;

commit;
