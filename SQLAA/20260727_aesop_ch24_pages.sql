-- ============================================================================
-- 图书馆「绘本模式」· 伊索寓言 ch24《狐狸与山羊》分页(3 页 / 3 张图)
--
-- ⚠️ 抗切分写法(ch8 起的默认约定):不用任何 do $$ 块、注释里不留分号、
--    断言用 CASE + 强制类型转换。
--
-- 分页口径:本章只有 1 段,按 seq 升序 row_number() 硬切 3/2/3,para_idx 一个字不动。
--    页1(句1-3)= 狐狸掉进井里上不来 · 口渴的山羊探头问水好不好 · 狐狸说好极了下来尝尝
--    页2(句4-5)= 山羊跳下去喝够才发现出不去 · 狐狸提出踩背爬出去再拉他上来
--    页3(句6-8)= 狐狸踩着他爬出井口扬长而去 · 山羊冲背影喊 · 狐狸回头那句胡子与脑子
--
-- ✅ 3 张图已传桶(2026-07-27,1200 宽 q82),公开地址实测全部 HTTP 200
--    library-illustrations/aesop-easy-readers/ch24/p{1,2,3}.jpg
--
-- 画风:卡通彩色。狐狸沿用 ch3/ch9/ch16 的设定。
--
-- 画面验收要点:
--   ① 构图用**井底仰视**(四壁围合 + 正上方一个小而亮的井口),不用剖面图 ——
--      剖面画法试过一轮,模型画成「拱形石墙 + 一汪浅水 + 底部还有草地」,读不出深度。
--   ② 山羊的**长白胡子三页都要醒目** —— 末句笑点全在胡子上。
--   ③ 狐狸踩山羊背那一下**不入画**(两个主体紧贴必糊),攀爬留给文字,
--      画面上 p3 直接是「狐狸已在草地上回头 / 山羊只露头在井口内喊」。
--
-- 影响面:只碰 book_key='aesop-easy-readers' 且 chapter_idx=24 的 8 行。幂等:再跑无害。
-- ⚠️ 跑完还需前端把 'aesop-easy-readers#24' 加进 PICTURE_BOOK_CHAPTERS。
-- ============================================================================

begin;

-- 前置计数:本章应为 8 句、1 段、page_index 全空
select count(*) as ch24_rows,
       count(distinct s.para_idx) as ch24_paras,
       count(s.page_index) as ch24_paged_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 24;

-- 🔒 前置硬闸:句数必须恰好 8
select case
         when count(*) = 8
           then 'OK 前置 ch24 恰好 8 句 硬编码切点 1-3/4-5/6-8 成立'
         else ('前置硬闸失败 ch24 句数=' || count(*) ||
               ' 期望 8 正文已变 硬编码切点不再成立 已回滚')::int::text
       end as guard_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 24;

with tgt as (
  select s.id, row_number() over (order by s.seq) as rn
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers' and s.chapter_idx = 24
)
update public.library_sentences s
   set page_index = case when t.rn <= 3 then 1 when t.rn <= 5 then 2 else 3 end,
       image_url  = 'aesop-easy-readers/ch24/p'
                 || (case when t.rn <= 3 then 1 when t.rn <= 5 then 2 else 3 end) || '.jpg'
  from tgt t where s.id = t.id;

-- 🔒 后置硬闸:8 行全配页、恰好 3 页 3 图、页分布必须是 3/2/3
select case
         when count(*) = 8
          and count(distinct s.page_index) = 3
          and count(distinct s.image_url) = 3
          and (count(*) filter (where s.page_index = 1)) = 3
          and (count(*) filter (where s.page_index = 2)) = 2
          and (count(*) filter (where s.page_index = 3)) = 3
           then 'OK 后置 8 行 3 页 3 图 分布 3/2/3'
         else ('后置断言失败 行=' || count(*) ||
               ' 页=' || count(distinct s.page_index) ||
               ' 图=' || count(distinct s.image_url) ||
               ' 分布=' || (count(*) filter (where s.page_index = 1)) ||
               '/' || (count(*) filter (where s.page_index = 2)) ||
               '/' || (count(*) filter (where s.page_index = 3)) ||
               ' 期望 8 行 3 页 3 图 分布 3/2/3 已回滚')::int::text
       end as guard_after
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 24
  and s.page_index is not null;

-- 后置明细:应为 3 行 —— (1,3句,p1.jpg) (2,2句,p2.jpg) (3,3句,p3.jpg)
select s.page_index, count(*) as sentences, min(s.image_url) as image_url
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 24
group by s.page_index
order by s.page_index;

-- para_idx 未被改动自检:期望仍是 1 段
select count(distinct s.para_idx) as ch24_paras_after
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 24;

-- ch25 起零影响自检:期望 0
select count(*) as later_chapters_paged
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx > 24
  and s.page_index is not null;

-- ch1-ch23 未被本单影响自检:期望 23 章各 3 页 3 图
select count(*) as chapters_1_to_23_ok
from (
  select s.chapter_idx
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers'
    and s.chapter_idx between 1 and 23
    and s.page_index is not null
  group by s.chapter_idx
  having count(distinct s.page_index) = 3 and count(distinct s.image_url) = 3
) t;

commit;
