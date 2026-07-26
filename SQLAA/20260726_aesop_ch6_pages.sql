-- ============================================================================
-- 图书馆「绘本模式」第 6 本 · 给《伊索寓言》第 6 章「猫与老鼠」写 3 页
--
-- ⚠️ 本单沿用 **ch5 的单段模板**(不是 ch1-ch4 的 dense_rank 版):
--   ch6 只有 1 段(新写的 85 则都是一段到底),按 `seq` 升序 `row_number()` 硬切:
--   1-2 → 页1,3-4 → 页2,5-6 → 页3。`para_idx` 一个字不动。
--   依据:buildPages 规则是「有 page_index 就按它,没有才回退 para_idx」,
--   所以绘本分页不需要改文字层段落结构,两件事互不牵扯。
--
-- 🔒 因为切点是硬编码的,先断言本章恰好 6 句;句数一变就整单回滚,不会切错。
--
-- 分页依据(内容转折):
--   页1(句1-2)= 猫搬进闹耗子的屋子 · 耗子被逼得躲进洞里不出来
--   页2(句3-4)= 猫想出诡计 · 后腿勾木钉倒挂装死
--   页3(句5-6)= 一只耗子探出头 · 识破并回敬"你休想骗我们过去"
--
-- ✅ 这 3 张图**已经传好**(2026-07-26,水彩风 → 1200 宽 q82 → 桶 library-illustrations),
--    公开地址实测 HTTP 200:
--      https://degqpiiddkxcuzwombwp.supabase.co/storage/v1/object/public/library-illustrations/aesop-easy-readers/ch6/p1.jpg  (198KB)
--      …/p2.jpg (195KB)  …/p3.jpg (193KB)
--
-- 画面验收要点(本章两条红线,首批曾因画风断裂 + 老鼠出洞被打回一次):
--   ① 寓意红线:第 3 页老鼠**只能露出头和肩、身子仍在洞里**,且与猫之间留大片空地板 ——
--      这则的落点是「你休想骗我们过去」,老鼠一旦整只站到地板上这句话就白说了。已验:通过。
--   ② 误读红线:第 2 页猫是**用后腿勾住木钉**倒挂,**不得出现绳索/套索/脖子上的绳子** ——
--      否则「装死的滑稽把戏」会变成「吊死」的画面。已验:木杆,无绳索。
--   另:句 1.2 写「逐只逮吃」,第 1 页只画**结果**(耗子全缩洞里),不画捕食过程。已验:通过。
--
-- 影响面:where 双限 book_key + chapter_idx = 6,只碰这 6 行。幂等:再跑无害。
-- ⚠️ 跑完还需前端把 'aesop-easy-readers#6' 加进 PICTURE_BOOK_CHAPTERS 才会走绘本渲染。
-- ============================================================================

begin;

-- 前置计数:本章 6 句、1 段、page_index 应全空
select count(*) as ch6_rows,
       count(distinct s.para_idx) as ch6_paras,
       count(s.page_index) as ch6_paged_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 6;

-- 🔒 前置硬闸:切点写死在 SQL 里,句数必须恰好 6,否则会切错 → 整单回滚
do $$
declare v_rows int;
begin
  select count(*) into v_rows
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers'
    and s.chapter_idx = 6;
  if v_rows <> 6 then
    raise exception 'ch6 句数=%,期望 6 —— 正文已变,硬编码切点(1-2/3-4/5-6)不再成立,已回滚', v_rows;
  end if;
end $$;

with tgt as (
  select s.id,
         row_number() over (order by s.seq) as rn
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers'
    and s.chapter_idx = 6
)
update public.library_sentences s
   set page_index = case when t.rn <= 2 then 1 when t.rn <= 4 then 2 else 3 end,
       image_url  = 'aesop-easy-readers/ch6/p'
                 || (case when t.rn <= 2 then 1 when t.rn <= 4 then 2 else 3 end)
                 || '.jpg'
  from tgt t
 where s.id = t.id;

-- 后置断言:6 行全配页、恰好 3 页、3 张图、且页分布必须是 2/2/2;不满足则整单回滚
do $$
declare v_rows int; v_pages int; v_imgs int; v_p1 int; v_p2 int; v_p3 int;
begin
  select count(*), count(distinct s.page_index), count(distinct s.image_url),
         count(*) filter (where s.page_index = 1),
         count(*) filter (where s.page_index = 2),
         count(*) filter (where s.page_index = 3)
    into v_rows, v_pages, v_imgs, v_p1, v_p2, v_p3
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers'
    and s.chapter_idx = 6
    and s.page_index is not null;
  if v_rows <> 6 or v_pages <> 3 or v_imgs <> 3 then
    raise exception '绘本分页断言失败:已配页行=%(期望 6)、页数=%(期望 3)、图数=%(期望 3)', v_rows, v_pages, v_imgs;
  end if;
  if v_p1 <> 2 or v_p2 <> 2 or v_p3 <> 2 then
    raise exception '页分布断言失败:实际 %/%/%,期望 2/2/2', v_p1, v_p2, v_p3;
  end if;
end $$;

-- 后置明细:应为 3 行 —— (1,2句,p1.jpg) (2,2句,p2.jpg) (3,2句,p3.jpg)
select s.page_index, count(*) as sentences, min(s.image_url) as image_url
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 6
group by s.page_index
order by s.page_index;

-- para_idx 未被改动自检(期望仍是 1 段)
select count(distinct s.para_idx) as ch6_paras_after
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 6;

-- 其余 83 章零影响自检:本书除 ch1-ch6 外应无任何行被配页(期望 0)
select count(*) as other_chapters_paged
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx not in (1, 2, 3, 4, 5, 6)
  and s.page_index is not null;

-- ch1-ch5 未被本单影响自检(期望 11/3/3、12/3/3、10/3/3、11/3/3、7/3/3)
select s.chapter_idx,
       count(*) as paged_rows,
       count(distinct s.page_index) as pages,
       count(distinct s.image_url) as imgs
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx in (1, 2, 3, 4, 5)
  and s.page_index is not null
group by s.chapter_idx
order by s.chapter_idx;

commit;
