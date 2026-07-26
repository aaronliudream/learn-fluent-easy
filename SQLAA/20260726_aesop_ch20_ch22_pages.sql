-- ============================================================================
-- 图书馆「绘本模式」· 伊索寓言 ch20-ch22 三章分页(共 9 页 / 9 张图)
--
-- ⚠️ 抗切分写法(ch8 起的默认约定):不用任何 do $$ 块、注释里不留分号、
--    断言用 CASE + 强制类型转换。
--
-- 分页口径:这三章都只有 1 段,按 seq 升序 row_number() 硬切,para_idx 一个字不动。
--
-- 各章切点:
--    ch20 蚊子与公牛    3 句 → 1/1/1
--    ch21 熊与两个旅人  6 句 → 2/2/2
--    ch22 橡树与芦苇    3 句 → 1/1/1
--
-- ✅ 9 张图已传桶(2026-07-26,1200 宽 q82),公开地址实测全部 HTTP 200
--    library-illustrations/aesop-easy-readers/ch{20,21,22}/p{1,2,3}.jpg
--
-- 画风:卡通彩色(ch8 起的基准)。
--
-- 画面验收要点:
--    ch20 笑点在公牛的漠然,第 3 页写死「眼皮半闭、看都不看蚊子」。
--    ch21 熊与装死者在画面上完全分开(熊四爪着地、身体不与人重叠、只低头闻),
--         人画成一具完整连贯的身体,不出现血迹。
--    ch22 橡树与芦苇**都不给脸**(试过给脸,芦苇每次都被画成橙色小生物),
--         纯景物呈现「倒下的橡树 vs 挺立/柔弯的芦苇」这个对比即可。
--
-- 影响面:只碰 book_key='aesop-easy-readers' 且 chapter_idx 在 20-22 的 12 行。幂等:再跑无害。
-- ⚠️ 跑完还需前端把 'aesop-easy-readers#20' 到 '#22' 加进 PICTURE_BOOK_CHAPTERS。
-- ============================================================================

begin;

-- 前置计数:三章各自的句数、段数、已配页数
select s.chapter_idx,
       count(*) as sentences,
       count(distinct s.para_idx) as paragraphs,
       count(s.page_index) as paged_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx between 20 and 22
group by s.chapter_idx
order by s.chapter_idx;

-- 🔒 前置硬闸:三章句数必须全部等于预期 3/6/3
select case
         when v.matched = 3
           then 'OK 前置 三章句数全部符合预期 ch20=3 ch21=6 ch22=3'
         else ('前置硬闸失败 只有 ' || v.matched ||
               ' 章句数符合预期 应为 3 章 正文已变 硬编码切点不再成立 已回滚')::int::text
       end as guard_before
from (
  select count(*) as matched
  from (
    select s.chapter_idx, count(*) as n
    from public.library_sentences s
    join public.library_books b on b.id = s.book_id
    where b.book_key = 'aesop-easy-readers'
      and s.chapter_idx between 20 and 22
    group by s.chapter_idx
  ) t
  join (values (20,3),(21,6),(22,3)) e(ch, n)
    on e.ch = t.chapter_idx and e.n = t.n
) v;

-- ch20 蚊子与公牛 1/1/1
with tgt as (
  select s.id, row_number() over (order by s.seq) as rn
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers' and s.chapter_idx = 20
)
update public.library_sentences s
   set page_index = case when t.rn <= 1 then 1 when t.rn <= 2 then 2 else 3 end,
       image_url  = 'aesop-easy-readers/ch20/p'
                 || (case when t.rn <= 1 then 1 when t.rn <= 2 then 2 else 3 end) || '.jpg'
  from tgt t where s.id = t.id;

-- ch21 熊与两个旅人 2/2/2
with tgt as (
  select s.id, row_number() over (order by s.seq) as rn
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers' and s.chapter_idx = 21
)
update public.library_sentences s
   set page_index = case when t.rn <= 2 then 1 when t.rn <= 4 then 2 else 3 end,
       image_url  = 'aesop-easy-readers/ch21/p'
                 || (case when t.rn <= 2 then 1 when t.rn <= 4 then 2 else 3 end) || '.jpg'
  from tgt t where s.id = t.id;

-- ch22 橡树与芦苇 1/1/1
with tgt as (
  select s.id, row_number() over (order by s.seq) as rn
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers' and s.chapter_idx = 22
)
update public.library_sentences s
   set page_index = case when t.rn <= 1 then 1 when t.rn <= 2 then 2 else 3 end,
       image_url  = 'aesop-easy-readers/ch22/p'
                 || (case when t.rn <= 1 then 1 when t.rn <= 2 then 2 else 3 end) || '.jpg'
  from tgt t where s.id = t.id;

-- 🔒 后置硬闸:三章必须各 3 页 3 图,且页分布等于预期
select case
         when v.ok = 3
           then 'OK 后置 三章各 3 页 3 图 页分布全部符合预期'
         else ('后置断言失败 只有 ' || v.ok || ' 章符合 应为 3 章 已回滚')::int::text
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
      and s.chapter_idx between 20 and 22
      and s.page_index is not null
    group by s.chapter_idx
  ) t
  join (values (20,1,1,1),(21,2,2,2),(22,1,1,1)) e(ch, a1, a2, a3)
    on e.ch = t.chapter_idx
   and t.pages = 3 and t.imgs = 3
   and t.n1 = e.a1 and t.n2 = e.a2 and t.n3 = e.a3
) v;

-- 后置明细:三章各三页的句数与图路径
select s.chapter_idx, s.page_index, count(*) as sentences, min(s.image_url) as image_url
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx between 20 and 22
group by s.chapter_idx, s.page_index
order by s.chapter_idx, s.page_index;

-- para_idx 未被改动自检:三章应仍各为 1 段
select count(*) as chapters_still_one_paragraph
from (
  select s.chapter_idx
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers'
    and s.chapter_idx between 20 and 22
  group by s.chapter_idx
  having count(distinct s.para_idx) = 1
) t;

-- ch23 起零影响自检:期望 0
select count(*) as later_chapters_paged
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx > 22
  and s.page_index is not null;

-- ch1-ch19 未被本单影响自检:期望 19 章各 3 页 3 图
select count(*) as chapters_1_to_19_ok
from (
  select s.chapter_idx
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers'
    and s.chapter_idx between 1 and 19
    and s.page_index is not null
  group by s.chapter_idx
  having count(distinct s.page_index) = 3 and count(distinct s.image_url) = 3
) t;

commit;
