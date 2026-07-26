-- ============================================================================
-- 图书馆「绘本模式」第 8 本 · 给《伊索寓言》第 8 章「老鼠开会」写 3 页
--
-- ⚠️ 本单是「抗切分」重写版(v2)。上一版用 do $$ ... $$ 写断言,在 Supabase Dashboard
--    执行时报 42601 syntax error at or near "from" —— 文件本身语法没问题
--    (libpg-query 解析器验过 10 条语句),是执行端按分号朴素切分、切进了 $$ 块内部。
--    本版据此改造:①不用任何 do $$ 块 ②注释里一个分号都不留
--    ③断言改用 CASE + 强制类型转换,失败时错误信息直接带中文说明、整单回滚。
--
-- 分页口径:ch8 只有 1 段,按 seq 升序 row_number() 硬切
--    1-2 → 页1、3-4 → 页2、5 → 页3。para_idx 一个字不动
--    (buildPages 规则:有 page_index 就按它,没有才回退 para_idx)。
--
-- 三拍:
--    页1(句1-2)= 众鼠开会,方案一个个被否,一只有资历的鼠起身说他想出办法了
--    页2(句3-4)= 挂铃方案抛出,满堂叫好正要表决,一只年长的鼠悄悄站起来
--    页3(句5)  = 「谁去把铃铛挂到猫脖子上?」全场哑然
--
-- ✅ 3 张图已传桶(2026-07-26,1200 宽 q82),公开地址实测 HTTP 200:
--    https://degqpiiddkxcuzwombwp.supabase.co/storage/v1/object/public/library-illustrations/aesop-easy-readers/ch8/p1.jpg  (148KB)
--    …/p2.jpg (153KB)  …/p3.jpg (150KB)
--
-- ⚠️ 画风分界:ch1-ch7 为水彩,ch8 起改为卡通彩色(Aaron 2026-07-26 拍板,旧章不回头修)。
--
-- 影响面:where 双限 book_key + chapter_idx = 8,只碰这 5 行。幂等:再跑无害。
-- ⚠️ 跑完还需前端把 'aesop-easy-readers#8' 加进 PICTURE_BOOK_CHAPTERS 才会走绘本渲染。
-- ============================================================================

begin;

-- 前置计数:本章应为 5 句、1 段、page_index 全空
select count(*) as ch8_rows,
       count(distinct s.para_idx) as ch8_paras,
       count(s.page_index) as ch8_paged_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 8;

-- 🔒 前置硬闸:切点写死在 SQL 里,句数必须恰好 5
-- 不等于 5 时,else 分支会把一段中文强制转 int 而报错,错误信息即为原因,整单回滚
select case
         when count(*) = 5
           then 'OK 前置:ch8 恰好 5 句,硬编码切点 1-2/3-4/5 成立'
         else ('前置硬闸失败 ch8 句数=' || count(*) ||
               ' 期望 5,正文已变,硬编码切点不再成立,已回滚')::int::text
       end as guard_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 8;

with tgt as (
  select s.id,
         row_number() over (order by s.seq) as rn
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers'
    and s.chapter_idx = 8
)
update public.library_sentences s
   set page_index = case when t.rn <= 2 then 1 when t.rn <= 4 then 2 else 3 end,
       image_url  = 'aesop-easy-readers/ch8/p'
                 || (case when t.rn <= 2 then 1 when t.rn <= 4 then 2 else 3 end)
                 || '.jpg'
  from tgt t
 where s.id = t.id;

-- 🔒 后置硬闸:5 行全配页、恰好 3 页、3 张不同的图、页分布必须是 2/2/1
-- 任一项不满足即报错整单回滚
select case
         when count(*) = 5
          and count(distinct s.page_index) = 3
          and count(distinct s.image_url) = 3
          and (count(*) filter (where s.page_index = 1)) = 2
          and (count(*) filter (where s.page_index = 2)) = 2
          and (count(*) filter (where s.page_index = 3)) = 1
           then 'OK 后置:5 行 3 页 3 图,分布 2/2/1'
         else ('后置断言失败 行=' || count(*) ||
               ' 页=' || count(distinct s.page_index) ||
               ' 图=' || count(distinct s.image_url) ||
               ' 分布=' || (count(*) filter (where s.page_index = 1)) ||
               '/' || (count(*) filter (where s.page_index = 2)) ||
               '/' || (count(*) filter (where s.page_index = 3)) ||
               ' 期望 5 行 3 页 3 图 分布 2/2/1,已回滚')::int::text
       end as guard_after
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 8
  and s.page_index is not null;

-- 后置明细:应为 3 行 —— (1,2句,p1.jpg) (2,2句,p2.jpg) (3,1句,p3.jpg)
select s.page_index, count(*) as sentences, min(s.image_url) as image_url
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 8
group by s.page_index
order by s.page_index;

-- para_idx 未被改动自检:期望仍是 1 段
select count(distinct s.para_idx) as ch8_paras_after
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 8;

-- 其余 81 章零影响自检:本书除 ch1-ch8 外应无任何行被配页,期望 0
select count(*) as other_chapters_paged
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx not in (1, 2, 3, 4, 5, 6, 7, 8)
  and s.page_index is not null;

-- ch1-ch7 未被本单影响自检:期望 11/12/10/11/7/6/4 句,各 3 页 3 图
select s.chapter_idx,
       count(*) as paged_rows,
       count(distinct s.page_index) as pages,
       count(distinct s.image_url) as imgs
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx in (1, 2, 3, 4, 5, 6, 7)
  and s.page_index is not null
group by s.chapter_idx
order by s.chapter_idx;

commit;
