-- ============================================================================
-- 图书馆「绘本模式」· 伊索寓言 ch23《驴与它的驮子》分页(3 页 / 3 张图)
--
-- ⚠️ 抗切分写法(ch8 起的默认约定):不用任何 do $$ 块、注释里不留分号、
--    断言用 CASE + 强制类型转换。
--
-- 分页口径:本章只有 1 段,按 seq 升序 row_number() 硬切 2/2/2,para_idx 一个字不动。
--    页1(句1-2)= 盐堆满驴背 · 过溪滑倒 · 盐化掉大半背上变轻
--    页2(句3-4)= 主人回城添盐 · 驴一到溪边就故意躺下 · 起来又轻了
--    页3(句5-6)= 主人改驮海绵 · 驴照例躺下 · 海绵吸饱水比哪回都重
--
-- ✅ 3 张图已传桶(2026-07-26,1200 宽 q82),公开地址实测全部 HTTP 200
--    library-illustrations/aesop-easy-readers/ch23/p{1,2,3}.jpg
--
-- 画风:卡通彩色(ch8 起的基准)。灰驴沿用 ch19 的设定。
--
-- 画面三条弧线(均已验证):驮子(湿瘪白口袋 → 鼓口袋 → 滴水海绵堆)、
--    驴的表情(吃惊 → 得意 → 吃力)、主人的表情(懊恼 → 叉腰起疑 → 抱臂偷笑)。
--    人始终在岸上、驴始终在水里,两个主体不重叠。
--
-- 影响面:只碰 book_key='aesop-easy-readers' 且 chapter_idx=23 的 6 行。幂等:再跑无害。
-- ⚠️ 跑完还需前端把 'aesop-easy-readers#23' 加进 PICTURE_BOOK_CHAPTERS。
-- ============================================================================

begin;

-- 前置计数:本章应为 6 句、1 段、page_index 全空
select count(*) as ch23_rows,
       count(distinct s.para_idx) as ch23_paras,
       count(s.page_index) as ch23_paged_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 23;

-- 🔒 前置硬闸:句数必须恰好 6
select case
         when count(*) = 6
           then 'OK 前置 ch23 恰好 6 句 硬编码切点 1-2/3-4/5-6 成立'
         else ('前置硬闸失败 ch23 句数=' || count(*) ||
               ' 期望 6 正文已变 硬编码切点不再成立 已回滚')::int::text
       end as guard_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 23;

with tgt as (
  select s.id, row_number() over (order by s.seq) as rn
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers' and s.chapter_idx = 23
)
update public.library_sentences s
   set page_index = case when t.rn <= 2 then 1 when t.rn <= 4 then 2 else 3 end,
       image_url  = 'aesop-easy-readers/ch23/p'
                 || (case when t.rn <= 2 then 1 when t.rn <= 4 then 2 else 3 end) || '.jpg'
  from tgt t where s.id = t.id;

-- 🔒 后置硬闸:6 行全配页、恰好 3 页 3 图、页分布必须是 2/2/2
select case
         when count(*) = 6
          and count(distinct s.page_index) = 3
          and count(distinct s.image_url) = 3
          and (count(*) filter (where s.page_index = 1)) = 2
          and (count(*) filter (where s.page_index = 2)) = 2
          and (count(*) filter (where s.page_index = 3)) = 2
           then 'OK 后置 6 行 3 页 3 图 分布 2/2/2'
         else ('后置断言失败 行=' || count(*) ||
               ' 页=' || count(distinct s.page_index) ||
               ' 图=' || count(distinct s.image_url) ||
               ' 分布=' || (count(*) filter (where s.page_index = 1)) ||
               '/' || (count(*) filter (where s.page_index = 2)) ||
               '/' || (count(*) filter (where s.page_index = 3)) ||
               ' 期望 6 行 3 页 3 图 分布 2/2/2 已回滚')::int::text
       end as guard_after
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 23
  and s.page_index is not null;

-- 后置明细:应为 3 行 —— (1,2句,p1.jpg) (2,2句,p2.jpg) (3,2句,p3.jpg)
select s.page_index, count(*) as sentences, min(s.image_url) as image_url
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 23
group by s.page_index
order by s.page_index;

-- para_idx 未被改动自检:期望仍是 1 段
select count(distinct s.para_idx) as ch23_paras_after
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 23;

-- ch24 起零影响自检:期望 0
select count(*) as later_chapters_paged
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx > 23
  and s.page_index is not null;

-- ch1-ch22 未被本单影响自检:期望 22 章各 3 页 3 图
select count(*) as chapters_1_to_22_ok
from (
  select s.chapter_idx
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers'
    and s.chapter_idx between 1 and 22
    and s.page_index is not null
  group by s.chapter_idx
  having count(distinct s.page_index) = 3 and count(distinct s.image_url) = 3
) t;

commit;
