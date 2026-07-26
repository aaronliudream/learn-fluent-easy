-- ============================================================================
-- 图书馆「绘本模式」· 伊索寓言 ch10-ch19 十章一次性分页(共 30 页 / 30 张图)
--
-- ⚠️ 抗切分写法(ch8 起的默认约定):不用任何 do $$ 块、注释里不留分号、
--    断言用 CASE + 强制类型转换。Supabase Dashboard 按分号朴素切分,
--    会切进 $$ 块内部把语句腰斩并报 42601 syntax error at or near "from"。
--
-- 分页口径:这十章都只有 1 段(新写的 85 则都是一段到底),
--    按 seq 升序 row_number() 硬切,para_idx 一个字不动
--    (buildPages 规则:有 page_index 就按它,没有才回退 para_idx)。
--
-- 各章切点(全部按寓言转折点切,不按字数平均切):
--    ch10 狼与羊羔       10 句 → 2/6/2
--    ch11 败家子与燕子    4 句 → 1/1/2
--    ch12 墨丘利与樵夫   12 句 → 2/5/5
--    ch13 乌鸦与水罐      3 句 → 1/1/1
--    ch14 北风与太阳      9 句 → 2/3/4
--    ch15 兔子与青蛙      5 句 → 2/2/1
--    ch16 狐狸与鹳        4 句 → 2/1/1
--    ch17 挤奶女孩        7 句 → 1/4/2
--    ch18 海豚鲸小鲱鱼    4 句 → 2/1/1
--    ch19 驴与哈巴狗      9 句 → 3/4/2
--
-- ✅ 30 张图已全部传桶(2026-07-26,1200 宽 q82),公开地址实测全部 HTTP 200
--    https://degqpiiddkxcuzwombwp.supabase.co/storage/v1/object/public/library-illustrations/aesop-easy-readers/ch{10..19}/p{1..3}.jpg
--
-- 画风:卡通彩色(ch8 起的基准)。
--
-- 🔒 因为切点是硬编码的,前置断言十章句数必须全部等于预期,
--    后置断言十章必须各 3 页 3 图且页分布等于预期,任一不符即整单回滚。
--
-- 影响面:只碰 book_key='aesop-easy-readers' 且 chapter_idx 在 10-19 的 67 行。幂等:再跑无害。
-- ⚠️ 跑完还需前端把 'aesop-easy-readers#10' 到 '#19' 加进 PICTURE_BOOK_CHAPTERS。
-- ============================================================================

begin;

-- 前置计数:十章各自的句数、段数、已配页数
select s.chapter_idx,
       count(*) as sentences,
       count(distinct s.para_idx) as paragraphs,
       count(s.page_index) as paged_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx between 10 and 19
group by s.chapter_idx
order by s.chapter_idx;

-- 🔒 前置硬闸:十章句数必须全部等于预期,否则硬编码切点失效
select case
         when v.matched = 10
           then 'OK 前置 十章句数全部符合预期 10/4/12/3/9/5/4/7/4/9'
         else ('前置硬闸失败 只有 ' || v.matched ||
               ' 章句数符合预期 应为 10 章 正文已变 硬编码切点不再成立 已回滚')::int::text
       end as guard_before
from (
  select count(*) as matched
  from (
    select s.chapter_idx, count(*) as n
    from public.library_sentences s
    join public.library_books b on b.id = s.book_id
    where b.book_key = 'aesop-easy-readers'
      and s.chapter_idx between 10 and 19
    group by s.chapter_idx
  ) t
  join (values (10,10),(11,4),(12,12),(13,3),(14,9),
               (15,5),(16,4),(17,7),(18,4),(19,9)) e(ch, n)
    on e.ch = t.chapter_idx and e.n = t.n
) v;

-- ch10 狼与羊羔 2/6/2
with tgt as (
  select s.id, row_number() over (order by s.seq) as rn
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers' and s.chapter_idx = 10
)
update public.library_sentences s
   set page_index = case when t.rn <= 2 then 1 when t.rn <= 8 then 2 else 3 end,
       image_url  = 'aesop-easy-readers/ch10/p'
                 || (case when t.rn <= 2 then 1 when t.rn <= 8 then 2 else 3 end) || '.jpg'
  from tgt t where s.id = t.id;

-- ch11 败家子与燕子 1/1/2
with tgt as (
  select s.id, row_number() over (order by s.seq) as rn
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers' and s.chapter_idx = 11
)
update public.library_sentences s
   set page_index = case when t.rn <= 1 then 1 when t.rn <= 2 then 2 else 3 end,
       image_url  = 'aesop-easy-readers/ch11/p'
                 || (case when t.rn <= 1 then 1 when t.rn <= 2 then 2 else 3 end) || '.jpg'
  from tgt t where s.id = t.id;

-- ch12 墨丘利与樵夫 2/5/5
with tgt as (
  select s.id, row_number() over (order by s.seq) as rn
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers' and s.chapter_idx = 12
)
update public.library_sentences s
   set page_index = case when t.rn <= 2 then 1 when t.rn <= 7 then 2 else 3 end,
       image_url  = 'aesop-easy-readers/ch12/p'
                 || (case when t.rn <= 2 then 1 when t.rn <= 7 then 2 else 3 end) || '.jpg'
  from tgt t where s.id = t.id;

-- ch13 乌鸦与水罐 1/1/1
with tgt as (
  select s.id, row_number() over (order by s.seq) as rn
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers' and s.chapter_idx = 13
)
update public.library_sentences s
   set page_index = case when t.rn <= 1 then 1 when t.rn <= 2 then 2 else 3 end,
       image_url  = 'aesop-easy-readers/ch13/p'
                 || (case when t.rn <= 1 then 1 when t.rn <= 2 then 2 else 3 end) || '.jpg'
  from tgt t where s.id = t.id;

-- ch14 北风与太阳 2/3/4
with tgt as (
  select s.id, row_number() over (order by s.seq) as rn
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers' and s.chapter_idx = 14
)
update public.library_sentences s
   set page_index = case when t.rn <= 2 then 1 when t.rn <= 5 then 2 else 3 end,
       image_url  = 'aesop-easy-readers/ch14/p'
                 || (case when t.rn <= 2 then 1 when t.rn <= 5 then 2 else 3 end) || '.jpg'
  from tgt t where s.id = t.id;

-- ch15 兔子与青蛙 2/2/1
with tgt as (
  select s.id, row_number() over (order by s.seq) as rn
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers' and s.chapter_idx = 15
)
update public.library_sentences s
   set page_index = case when t.rn <= 2 then 1 when t.rn <= 4 then 2 else 3 end,
       image_url  = 'aesop-easy-readers/ch15/p'
                 || (case when t.rn <= 2 then 1 when t.rn <= 4 then 2 else 3 end) || '.jpg'
  from tgt t where s.id = t.id;

-- ch16 狐狸与鹳 2/1/1
with tgt as (
  select s.id, row_number() over (order by s.seq) as rn
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers' and s.chapter_idx = 16
)
update public.library_sentences s
   set page_index = case when t.rn <= 2 then 1 when t.rn <= 3 then 2 else 3 end,
       image_url  = 'aesop-easy-readers/ch16/p'
                 || (case when t.rn <= 2 then 1 when t.rn <= 3 then 2 else 3 end) || '.jpg'
  from tgt t where s.id = t.id;

-- ch17 挤奶女孩 1/4/2
with tgt as (
  select s.id, row_number() over (order by s.seq) as rn
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers' and s.chapter_idx = 17
)
update public.library_sentences s
   set page_index = case when t.rn <= 1 then 1 when t.rn <= 5 then 2 else 3 end,
       image_url  = 'aesop-easy-readers/ch17/p'
                 || (case when t.rn <= 1 then 1 when t.rn <= 5 then 2 else 3 end) || '.jpg'
  from tgt t where s.id = t.id;

-- ch18 海豚鲸与小鲱鱼 2/1/1
with tgt as (
  select s.id, row_number() over (order by s.seq) as rn
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers' and s.chapter_idx = 18
)
update public.library_sentences s
   set page_index = case when t.rn <= 2 then 1 when t.rn <= 3 then 2 else 3 end,
       image_url  = 'aesop-easy-readers/ch18/p'
                 || (case when t.rn <= 2 then 1 when t.rn <= 3 then 2 else 3 end) || '.jpg'
  from tgt t where s.id = t.id;

-- ch19 驴与哈巴狗 3/4/2
with tgt as (
  select s.id, row_number() over (order by s.seq) as rn
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers' and s.chapter_idx = 19
)
update public.library_sentences s
   set page_index = case when t.rn <= 3 then 1 when t.rn <= 7 then 2 else 3 end,
       image_url  = 'aesop-easy-readers/ch19/p'
                 || (case when t.rn <= 3 then 1 when t.rn <= 7 then 2 else 3 end) || '.jpg'
  from tgt t where s.id = t.id;

-- 🔒 后置硬闸:十章必须各 3 页 3 图,且页分布等于预期
select case
         when v.ok = 10
           then 'OK 后置 十章各 3 页 3 图 页分布全部符合预期'
         else ('后置断言失败 只有 ' || v.ok ||
               ' 章符合 应为 10 章 已回滚')::int::text
       end as guard_after
from (
  select count(*) as ok
  from (
    select s.chapter_idx,
           count(distinct s.page_index) as pages,
           count(distinct s.image_url) as imgs,
           (count(*) filter (where s.page_index = 1)) as n1,
           (count(*) filter (where s.page_index = 2)) as n2,
           (count(*) filter (where s.page_index = 3)) as n3
    from public.library_sentences s
    join public.library_books b on b.id = s.book_id
    where b.book_key = 'aesop-easy-readers'
      and s.chapter_idx between 10 and 19
      and s.page_index is not null
    group by s.chapter_idx
  ) t
  join (values (10,2,6,2),(11,1,1,2),(12,2,5,5),(13,1,1,1),(14,2,3,4),
               (15,2,2,1),(16,2,1,1),(17,1,4,2),(18,2,1,1),(19,3,4,2)) e(ch, a1, a2, a3)
    on e.ch = t.chapter_idx
   and t.pages = 3 and t.imgs = 3
   and t.n1 = e.a1 and t.n2 = e.a2 and t.n3 = e.a3
) v;

-- 后置明细:十章各三页的句数与图路径
select s.chapter_idx, s.page_index, count(*) as sentences, min(s.image_url) as image_url
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx between 10 and 19
group by s.chapter_idx, s.page_index
order by s.chapter_idx, s.page_index;

-- para_idx 未被改动自检:十章应仍各为 1 段
select count(*) as chapters_still_one_paragraph
from (
  select s.chapter_idx
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers'
    and s.chapter_idx between 10 and 19
  group by s.chapter_idx
  having count(distinct s.para_idx) = 1
) t;

-- 其余 70 章零影响自检:本书除 ch1-ch19 外应无任何行被配页,期望 0
select count(*) as other_chapters_paged
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx > 19
  and s.page_index is not null;

-- ch1-ch9 未被本单影响自检:期望 11/12/10/11/7/6/4/5/4 句,各 3 页 3 图
select s.chapter_idx,
       count(*) as paged_rows,
       count(distinct s.page_index) as pages,
       count(distinct s.image_url) as imgs
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx between 1 and 9
  and s.page_index is not null
group by s.chapter_idx
order by s.chapter_idx;

commit;
