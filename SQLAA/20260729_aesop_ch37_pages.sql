-- ============================================================================
-- 图书馆「绘本模式」· 伊索寓言 ch37《男孩与榛子》分页(3 页 / 3 张图)
--
-- ⚠️ 抗切分写法(ch8 起的默认约定):不用任何 do $$ 块、注释里不留分号、
--    断言用 CASE + 强制类型转换。
--
-- 分页口径:本章只有 1 段,按 seq 升序 row_number() 硬切 2/1/1,para_idx 一个字不动。
--    页1(句1-2)= 男孩伸手抓了拳头能握下的最多榛子 · 要抽手时罐口太窄抽不动了
--    页2(句3)  = 榛子舍不得松 手又拔不出来 他就哭了
--    页3(句4)  = 旁人看出症结「抓一半 手马上就出来了」
--
-- ✅ 3 张图已传桶(2026-07-29,1200 宽 q82),公开地址实测全部 HTTP 200
--    library-illustrations/aesop-easy-readers/ch37/p{1,2,3}.jpg
--
-- 画风:卡通彩色。
--
-- 画面验收要点:
--   ⚠️ 可视化关键:必须让人看见罐子里那只**攥满的拳头**,否则「罐口太窄」讲不通。
--      解法=罐子用**浅绿半透明玻璃**。不用剖面图 —— ch24 井那次证明剖面读不出来。
--   ① 三页玻璃里那只拳头都**一颗榛子没松**,这是全章的因果链。
--   ② 姿态弧线:男孩(身子后仰死命拔、另一手撑住罐壁、眉毛惊起 → 仰头大哭 泪珠飞出
--      揉眼 肩膀垮掉 → 收声仰头去听 脸上泪痕还在 眼睛睁大)。
--   ③ p3 大人在左、男孩在右,中间隔一大片空地板:大人手在胸前比出「少一点」的手势,
--      全程不碰男孩也不碰罐子。
--   ④ 角色一致性:男孩三页同一个(乱蓬蓬浅金发/雀斑/鼠尾草绿短袖长衫 + 米色领),
--      罐子三页同一只(浅绿半透明玻璃 大肚 窄颈)。三页全画面无文字、无红色。
--
-- 影响面:只碰 book_key='aesop-easy-readers' 且 chapter_idx=33 的 4 行。幂等:再跑无害。
-- ⚠️ 跑完还需前端把 'aesop-easy-readers#37' 加进 PICTURE_BOOK_CHAPTERS。
-- ============================================================================

begin;

-- 前置计数:本章应为 4 句、1 段、page_index 全空
select count(*) as ch37_rows,
       count(distinct s.para_idx) as ch37_paras,
       count(s.page_index) as ch37_paged_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 37;

-- 🔒 前置硬闸:句数必须恰好 5
select case
         when count(*) = 4
           then 'OK 前置 ch37 恰好 4 句 硬编码切点 1-2/3/4 成立'
         else ('前置硬闸失败 ch37 句数=' || count(*) ||
               ' 期望 4 正文已变 硬编码切点不再成立 已回滚')::int::text
       end as guard_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 37;

with tgt as (
  select s.id, row_number() over (order by s.seq) as rn
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers' and s.chapter_idx = 37
)
update public.library_sentences s
   set page_index = case when t.rn <= 2 then 1 when t.rn <= 3 then 2 else 3 end,
       image_url  = 'aesop-easy-readers/ch37/p'
                 || (case when t.rn <= 2 then 1 when t.rn <= 3 then 2 else 3 end) || '.jpg'
  from tgt t where s.id = t.id;

-- 🔒 后置硬闸:5 行全配页、恰好 3 页 3 图、页分布必须是 2/2/1
select case
         when count(*) = 4
          and count(distinct s.page_index) = 3
          and count(distinct s.image_url) = 3
          and (count(*) filter (where s.page_index = 1)) = 2
          and (count(*) filter (where s.page_index = 2)) = 1
          and (count(*) filter (where s.page_index = 3)) = 1
           then 'OK 后置 4 行 3 页 3 图 分布 2/1/1'
         else ('后置断言失败 行=' || count(*) ||
               ' 页=' || count(distinct s.page_index) ||
               ' 图=' || count(distinct s.image_url) ||
               ' 分布=' || (count(*) filter (where s.page_index = 1)) ||
               '/' || (count(*) filter (where s.page_index = 2)) ||
               '/' || (count(*) filter (where s.page_index = 3)) ||
               ' 期望 4 行 3 页 3 图 分布 2/1/1 已回滚')::int::text
       end as guard_after
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 37
  and s.page_index is not null;

-- 后置明细:应为 3 行 —— (1,2句,p1.jpg) (2,1句,p2.jpg) (3,1句,p3.jpg)
select s.page_index, count(*) as sentences, min(s.image_url) as image_url
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 37
group by s.page_index
order by s.page_index;

-- para_idx 未被改动自检:期望仍是 1 段
select count(distinct s.para_idx) as ch37_paras_after
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 37;

-- ch38 起零影响自检:期望 0
select count(*) as later_chapters_paged
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx > 37
  and s.page_index is not null;

-- ch1-ch36 未被本单影响自检:期望 36 章(ch32/ch36 是 2 页 2 图 其余 34 章 3 页 3 图)
select count(*) as chapters_1_to_36_ok
from (
  select s.chapter_idx
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers'
    and s.chapter_idx between 1 and 36
    and s.page_index is not null
  group by s.chapter_idx
  having count(distinct s.page_index) = count(distinct s.image_url)
     and count(distinct s.page_index) = (case when s.chapter_idx in (32, 36) then 2 else 3 end)
) t;

commit;
