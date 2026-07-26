-- ============================================================================
-- 图书馆「绘本模式」第 5 本 · 给《伊索寓言》第 5 章「下金蛋的鹅」写 3 页
--
-- ⚠️⚠️ 本单与 ch1-ch4 那四单**结构不同**,别照抄:
--   ch1-ch4 各有 3 个 para_idx,可以 `dense_rank() over (order by para_idx)` 让数据自己分页。
--   **ch5 只有 1 段**(新写的 85 则都是一段到底),dense_rank 会把整则压成 1 页。
--   所以本单改为按 `seq` 升序 `row_number()` **硬切**:1-2 → 页1,3-4 → 页2,5-7 → 页3。
--   `para_idx` **一个字不动** —— buildPages 的规则是「有 page_index 就按它,没有才回退 para_idx」,
--   所以绘本分页不需要改文字层的段落结构,两件事可以分开做。
--
-- 🔒 因为切点是硬编码的,先断言本章恰好 7 句;句数一变就整单回滚,不会切错。
--
-- 分页依据(内容转折):
--   页1(句1-2)= 夫妻拥有金蛋鹅 · 觉得是天大的好运
--   页2(句3-4)= 开始算账 · 嫌慢 · 说服自己鹅肚里是实心金子
--   页3(句5-7)= 杀了鹅 · 里面和普通鹅无异 · 没发财也再无金蛋
--
-- ✅ 这 3 张图**已经传好**(2026-07-25,水彩风 → 1200 宽 q82 → 桶 library-illustrations),
--    公开地址实测 HTTP 200:
--      https://degqpiiddkxcuzwombwp.supabase.co/storage/v1/object/public/library-illustrations/aesop-easy-readers/ch5/p1.jpg  (201KB)
--      …/p2.jpg (163KB)  …/p3.jpg (156KB)
--
-- 画面处理(Aaron 定的方针:避开杀戮):
--   第 3 页做成**事后**——空稻草窝 + 空手夫妻 + 灰调,画面里没有鹅的任何形态、
--   没有刀具血迹羽毛、也没有金蛋。第 2 页「起心动念」同样禁止出现任何刀具。
--   三页靠「同一个稻草窝:有蛋 → 鹅卧其中 → 彻底空」和「暖金 → 烛黄 → 灰白」的色调弧
--   把结局说完,不靠暴力画面。
--
-- 影响面:where 双限 book_key + chapter_idx = 5,只碰这 7 行。幂等:再跑无害。
-- ⚠️ 跑完还需前端把 'aesop-easy-readers#5' 加进 PICTURE_BOOK_CHAPTERS 才会走绘本渲染。
-- ============================================================================

begin;

-- 前置计数:本章 7 句、1 段、page_index 应全空
select count(*) as ch5_rows,
       count(distinct s.para_idx) as ch5_paras,
       count(s.page_index) as ch5_paged_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 5;

-- 🔒 前置硬闸:切点写死在 SQL 里,句数必须恰好 7,否则会切错 → 整单回滚
do $$
declare v_rows int;
begin
  select count(*) into v_rows
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers'
    and s.chapter_idx = 5;
  if v_rows <> 7 then
    raise exception 'ch5 句数=%,期望 7 —— 正文已变,硬编码切点(1-2/3-4/5-7)不再成立,已回滚', v_rows;
  end if;
end $$;

with tgt as (
  select s.id,
         row_number() over (order by s.seq) as rn
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers'
    and s.chapter_idx = 5
)
update public.library_sentences s
   set page_index = case when t.rn <= 2 then 1 when t.rn <= 4 then 2 else 3 end,
       image_url  = 'aesop-easy-readers/ch5/p'
                 || (case when t.rn <= 2 then 1 when t.rn <= 4 then 2 else 3 end)
                 || '.jpg'
  from tgt t
 where s.id = t.id;

-- 后置断言:7 行全配页、恰好 3 页、3 张图、且页分布必须是 2/2/3;不满足则整单回滚
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
    and s.chapter_idx = 5
    and s.page_index is not null;
  if v_rows <> 7 or v_pages <> 3 or v_imgs <> 3 then
    raise exception '绘本分页断言失败:已配页行=%(期望 7)、页数=%(期望 3)、图数=%(期望 3)', v_rows, v_pages, v_imgs;
  end if;
  if v_p1 <> 2 or v_p2 <> 2 or v_p3 <> 3 then
    raise exception '页分布断言失败:实际 %/%/%,期望 2/2/3', v_p1, v_p2, v_p3;
  end if;
end $$;

-- 后置明细:应为 3 行 —— (1,2句,p1.jpg) (2,2句,p2.jpg) (3,3句,p3.jpg)
select s.page_index, count(*) as sentences, min(s.image_url) as image_url
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 5
group by s.page_index
order by s.page_index;

-- para_idx 未被改动自检(期望仍是 1 段)
select count(distinct s.para_idx) as ch5_paras_after
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 5;

-- 其余 84 章零影响自检:本书除 ch1-ch5 外应无任何行被配页(期望 0)
select count(*) as other_chapters_paged
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx not in (1, 2, 3, 4, 5)
  and s.page_index is not null;

-- ch1-ch4 未被本单影响自检(期望 11/3/3、12/3/3、10/3/3、11/3/3)
select s.chapter_idx,
       count(*) as paged_rows,
       count(distinct s.page_index) as pages,
       count(distinct s.image_url) as imgs
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx in (1, 2, 3, 4)
  and s.page_index is not null
group by s.chapter_idx
order by s.chapter_idx;

commit;
