-- ============================================================================
-- 图书馆「绘本模式」· 伊索寓言 ch25《吹牛的旅人》分页(3 页 / 3 张图)
--
-- ⚠️ 抗切分写法(ch8 起的默认约定):不用任何 do $$ 块、注释里不留分号、
--    断言用 CASE + 强制类型转换。
--
-- 分页口径:本章只有 1 段,按 seq 升序 row_number() 硬切 1/1/1,para_idx 一个字不动。
--    页1(句1)= 出国游历归来 · 带回一堆讲自己壮举的故事
--    页2(句2)= 吹罗得岛跳远那一跳无人能及 · 「不信你去罗得岛问」
--    页3(句3)= 有人接话「就当这儿是罗得岛 跳吧」· 吹牛者僵住
--
-- ✅ 3 张图已传桶(2026-07-27,1200 宽 q82),公开地址实测全部 HTTP 200
--    library-illustrations/aesop-easy-readers/ch25/p{1,2,3}.jpg
--
-- 画风:卡通彩色。
--
-- 画面验收要点:
--   ① 笑点在第 3 页的**沉默** —— 吹牛者双臂垂下、肩塌、闭嘴、面色发虚,
--      三个村民抱臂等着看,中间留出空地板强化尴尬。
--   ② 第 2 页他**双脚必须踩在地上**(只是在说) —— 真跳是第 3 页要他做而做不到的事。
--   ③ 四人始终分开站立,彼此不重叠(防主体糊在一起)。
--   ④ 用衣袍颜色区分角色:吹牛者黄袍,三村民分别绿/蓝/灰,三页一致。
--
-- 影响面:只碰 book_key='aesop-easy-readers' 且 chapter_idx=25 的 3 行。幂等:再跑无害。
-- ⚠️ 跑完还需前端把 'aesop-easy-readers#25' 加进 PICTURE_BOOK_CHAPTERS。
-- ============================================================================

begin;

-- 前置计数:本章应为 3 句、1 段、page_index 全空
select count(*) as ch25_rows,
       count(distinct s.para_idx) as ch25_paras,
       count(s.page_index) as ch25_paged_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 25;

-- 🔒 前置硬闸:句数必须恰好 3
select case
         when count(*) = 3
           then 'OK 前置 ch25 恰好 3 句 硬编码切点 1/2/3 成立'
         else ('前置硬闸失败 ch25 句数=' || count(*) ||
               ' 期望 3 正文已变 硬编码切点不再成立 已回滚')::int::text
       end as guard_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 25;

with tgt as (
  select s.id, row_number() over (order by s.seq) as rn
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers' and s.chapter_idx = 25
)
update public.library_sentences s
   set page_index = case when t.rn <= 1 then 1 when t.rn <= 2 then 2 else 3 end,
       image_url  = 'aesop-easy-readers/ch25/p'
                 || (case when t.rn <= 1 then 1 when t.rn <= 2 then 2 else 3 end) || '.jpg'
  from tgt t where s.id = t.id;

-- 🔒 后置硬闸:3 行全配页、恰好 3 页 3 图、页分布必须是 1/1/1
select case
         when count(*) = 3
          and count(distinct s.page_index) = 3
          and count(distinct s.image_url) = 3
          and (count(*) filter (where s.page_index = 1)) = 1
          and (count(*) filter (where s.page_index = 2)) = 1
          and (count(*) filter (where s.page_index = 3)) = 1
           then 'OK 后置 3 行 3 页 3 图 分布 1/1/1'
         else ('后置断言失败 行=' || count(*) ||
               ' 页=' || count(distinct s.page_index) ||
               ' 图=' || count(distinct s.image_url) ||
               ' 分布=' || (count(*) filter (where s.page_index = 1)) ||
               '/' || (count(*) filter (where s.page_index = 2)) ||
               '/' || (count(*) filter (where s.page_index = 3)) ||
               ' 期望 3 行 3 页 3 图 分布 1/1/1 已回滚')::int::text
       end as guard_after
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 25
  and s.page_index is not null;

-- 后置明细:应为 3 行 —— (1,1句,p1.jpg) (2,1句,p2.jpg) (3,1句,p3.jpg)
select s.page_index, count(*) as sentences, min(s.image_url) as image_url
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 25
group by s.page_index
order by s.page_index;

-- para_idx 未被改动自检:期望仍是 1 段
select count(distinct s.para_idx) as ch25_paras_after
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 25;

-- ch26 起零影响自检:期望 0
select count(*) as later_chapters_paged
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx > 25
  and s.page_index is not null;

-- ch1-ch24 未被本单影响自检:期望 24 章各 3 页 3 图
select count(*) as chapters_1_to_24_ok
from (
  select s.chapter_idx
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers'
    and s.chapter_idx between 1 and 24
    and s.page_index is not null
  group by s.chapter_idx
  having count(distinct s.page_index) = 3 and count(distinct s.image_url) = 3
) t;

commit;
