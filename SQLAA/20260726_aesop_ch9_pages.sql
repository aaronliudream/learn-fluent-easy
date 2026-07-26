-- ============================================================================
-- 图书馆「绘本模式」第 9 本 · 给《伊索寓言》第 9 章「狐狸与乌鸦」写 3 页
--
-- ⚠️ 抗切分写法(ch8 起的默认约定):不用任何 do $$ 块、注释里不留分号、
--    断言用 CASE + 强制类型转换。Supabase Dashboard 按分号朴素切分,
--    会切进 $$ 块内部把语句腰斩并报 42601 syntax error at or near "from"。
--
-- 分页口径:ch9 只有 1 段,按 seq 升序 row_number() 硬切
--    1 → 页1、2-3 → 页2、4 → 页3。para_idx 一个字不动
--    (buildPages 规则:有 page_index 就按它,没有才回退 para_idx)。
--
-- 三拍:
--    页1(句1)  = 乌鸦叼着奶酪停在树上,狐狸看见了开始盘算
--    页2(句2-3)= 狐狸站树下猛夸,乌鸦飘飘然张嘴要唱
--    页3(句4)  = 奶酪掉了,狐狸一口叼住,「嗓子您是有的,缺的是判断力」
--
-- ✅ 3 张图已传桶(2026-07-26,q82),公开地址实测 HTTP 200:
--    https://degqpiiddkxcuzwombwp.supabase.co/storage/v1/object/public/library-illustrations/aesop-easy-readers/ch9/p1.jpg  (133KB)
--    …/p2.jpg (133KB)  …/p3.jpg (136KB)
--
-- 画风:卡通彩色(ch8 起的新基准)。狐狸沿用 ch3 定稿的辨识特征
--    橘红毛、白胸白喉、四肢黑袜、白尖蓬尾、琥珀眼。
--
-- 画面验收要点 —— 本章的时序红线(第一版曾因此被打回一次):
--    第 2 页**奶酪必须仍在乌鸦嘴里**(张嘴要唱的那一刻,未脱未落、无下坠轨迹)。
--    「奶酪掉了」是第 3 页的文字(句 4 开头 The cheese dropped),
--    画在第 2 页等于让画面比文字抢先半拍。已验:第二版已修正。
--    注:p1/p3 源图比例 1.488 非 4:3,渲染时左右各裁约 5%,
--    主体(乌鸦/狐狸/奶酪)均在安全区内,不受影响。
--
-- 影响面:where 双限 book_key + chapter_idx = 9,只碰这 4 行。幂等:再跑无害。
-- ⚠️ 跑完还需前端把 'aesop-easy-readers#9' 加进 PICTURE_BOOK_CHAPTERS 才会走绘本渲染。
-- ============================================================================

begin;

-- 前置计数:本章应为 4 句、1 段、page_index 全空
select count(*) as ch9_rows,
       count(distinct s.para_idx) as ch9_paras,
       count(s.page_index) as ch9_paged_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 9;

-- 🔒 前置硬闸:切点写死在 SQL 里,句数必须恰好 4
-- 不等于 4 时,else 分支会把一段中文强制转 int 而报错,错误信息即为原因,整单回滚
select case
         when count(*) = 4
           then 'OK 前置:ch9 恰好 4 句,硬编码切点 1/2-3/4 成立'
         else ('前置硬闸失败 ch9 句数=' || count(*) ||
               ' 期望 4,正文已变,硬编码切点不再成立,已回滚')::int::text
       end as guard_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 9;

with tgt as (
  select s.id,
         row_number() over (order by s.seq) as rn
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers'
    and s.chapter_idx = 9
)
update public.library_sentences s
   set page_index = case when t.rn <= 1 then 1 when t.rn <= 3 then 2 else 3 end,
       image_url  = 'aesop-easy-readers/ch9/p'
                 || (case when t.rn <= 1 then 1 when t.rn <= 3 then 2 else 3 end)
                 || '.jpg'
  from tgt t
 where s.id = t.id;

-- 🔒 后置硬闸:4 行全配页、恰好 3 页、3 张不同的图、页分布必须是 1/2/1
select case
         when count(*) = 4
          and count(distinct s.page_index) = 3
          and count(distinct s.image_url) = 3
          and (count(*) filter (where s.page_index = 1)) = 1
          and (count(*) filter (where s.page_index = 2)) = 2
          and (count(*) filter (where s.page_index = 3)) = 1
           then 'OK 后置:4 行 3 页 3 图,分布 1/2/1'
         else ('后置断言失败 行=' || count(*) ||
               ' 页=' || count(distinct s.page_index) ||
               ' 图=' || count(distinct s.image_url) ||
               ' 分布=' || (count(*) filter (where s.page_index = 1)) ||
               '/' || (count(*) filter (where s.page_index = 2)) ||
               '/' || (count(*) filter (where s.page_index = 3)) ||
               ' 期望 4 行 3 页 3 图 分布 1/2/1,已回滚')::int::text
       end as guard_after
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 9
  and s.page_index is not null;

-- 后置明细:应为 3 行 —— (1,1句,p1.jpg) (2,2句,p2.jpg) (3,1句,p3.jpg)
select s.page_index, count(*) as sentences, min(s.image_url) as image_url
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 9
group by s.page_index
order by s.page_index;

-- para_idx 未被改动自检:期望仍是 1 段
select count(distinct s.para_idx) as ch9_paras_after
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 9;

-- 其余 80 章零影响自检:本书除 ch1-ch9 外应无任何行被配页,期望 0
select count(*) as other_chapters_paged
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx not in (1, 2, 3, 4, 5, 6, 7, 8, 9)
  and s.page_index is not null;

-- ch1-ch8 未被本单影响自检:期望 11/12/10/11/7/6/4/5 句,各 3 页 3 图
select s.chapter_idx,
       count(*) as paged_rows,
       count(distinct s.page_index) as pages,
       count(distinct s.image_url) as imgs
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx in (1, 2, 3, 4, 5, 6, 7, 8)
  and s.page_index is not null
group by s.chapter_idx
order by s.chapter_idx;

commit;
