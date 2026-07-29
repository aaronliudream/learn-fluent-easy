-- ============================================================================
-- 图书馆「绘本模式」· 伊索寓言 ch36《牛与车轴》分页(**2 页 / 2 张图**)
--
-- ⚠️ 抗切分写法(ch8 起的默认约定):不用任何 do $$ 块、注释里不留分号、
--    断言用 CASE + 强制类型转换。
--
-- 分页口径:本章只有 1 段,按 seq 升序 row_number() 硬切 1/1,para_idx 一个字不动。
--    页1(句1)= 两头牛顶着轭拉一辆装满的车 车下的轴吱吱嘎嘎叫得没完
--    页2(句2)= 牛受够了回过头去「活是我们干的 你们俩鬼叫什么」
--
-- ✅ 2 张图已传桶(2026-07-29,1200 宽 q82),公开地址实测全部 HTTP 200
--    library-illustrations/aesop-easy-readers/ch36/p{1,2}.jpg
--
-- 画风:卡通彩色。
--
-- 画面验收要点:
--   ⚠️ 本章只有 2 句,继 ch32 之后第二个 2 页章。buildPages 按分组数出页不强制 3 页,
--      前端无需改动。本单断言相应为 2 页 2 图、分布 1/1。
--   ① 难点:叫唤的是**车轴**,而车轴是死物,不能给它画脸(ch22 芦苇那次的教训)。
--      解法=从每个轮毂放射**锯齿状黑色声纹**,p2 比 p1 更大更密。车与轮全程无脸无眼。
--   ② 全画面禁出现任何文字 —— CREAK! 之类拟声词模型必写糊,一律不要。
--   ③ 姿态弧线:牛(低头顶轭、前腿撑地、蹄下扬尘、闭眼使劲 → 整个回过头瞪着车 张口开吼
--      身子仍前倾没停下拉)。
--   ④ 角色一致性:深炭灰长弯角 / 浅奶油短角,两页同一对,彼此完整分开。
--      车与牛之间始终留一段空路面,零重叠。
--
-- 影响面:只碰 book_key='aesop-easy-readers' 且 chapter_idx=33 的 2 行。幂等:再跑无害。
-- ⚠️ 跑完还需前端把 'aesop-easy-readers#36' 加进 PICTURE_BOOK_CHAPTERS。
-- ============================================================================

begin;

-- 前置计数:本章应为 2 句、1 段、page_index 全空
select count(*) as ch36_rows,
       count(distinct s.para_idx) as ch36_paras,
       count(s.page_index) as ch36_paged_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 36;

-- 🔒 前置硬闸:句数必须恰好 5
select case
         when count(*) = 2
           then 'OK 前置 ch36 恰好 2 句 硬编码切点 1/2 成立'
         else ('前置硬闸失败 ch36 句数=' || count(*) ||
               ' 期望 2 正文已变 硬编码切点不再成立 已回滚')::int::text
       end as guard_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 36;

with tgt as (
  select s.id, row_number() over (order by s.seq) as rn
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers' and s.chapter_idx = 36
)
update public.library_sentences s
   set page_index = case when t.rn <= 1 then 1 else 2 end,
       image_url  = 'aesop-easy-readers/ch36/p'
                 || (case when t.rn <= 1 then 1 else 2 end) || '.jpg'
  from tgt t where s.id = t.id;

-- 🔒 后置硬闸:5 行全配页、恰好 3 页 3 图、页分布必须是 2/2/1
select case
         when count(*) = 2
          and count(distinct s.page_index) = 2
          and count(distinct s.image_url) = 2
          and (count(*) filter (where s.page_index = 1)) = 1
          and (count(*) filter (where s.page_index = 2)) = 1
          and (count(*) filter (where s.page_index = 3)) = 0
           then 'OK 后置 2 行 2 页 2 图 分布 1/1'
         else ('后置断言失败 行=' || count(*) ||
               ' 页=' || count(distinct s.page_index) ||
               ' 图=' || count(distinct s.image_url) ||
               ' 分布=' || (count(*) filter (where s.page_index = 1)) ||
               '/' || (count(*) filter (where s.page_index = 2)) ||
               '/' || (count(*) filter (where s.page_index = 3)) ||
               ' 期望 2 行 2 页 2 图 分布 1/1 已回滚')::int::text
       end as guard_after
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 36
  and s.page_index is not null;

-- 后置明细:应为 2 行 —— (1,1句,p1.jpg) (2,1句,p2.jpg)
select s.page_index, count(*) as sentences, min(s.image_url) as image_url
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 36
group by s.page_index
order by s.page_index;

-- para_idx 未被改动自检:期望仍是 1 段
select count(distinct s.para_idx) as ch36_paras_after
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 36;

-- ch37 起零影响自检:期望 0
select count(*) as later_chapters_paged
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx > 36
  and s.page_index is not null;

-- ch1-ch35 未被本单影响自检:期望 35 章(ch32 是 2 页 2 图 其余 34 章 3 页 3 图)
select count(*) as chapters_1_to_35_ok
from (
  select s.chapter_idx
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers'
    and s.chapter_idx between 1 and 35
    and s.page_index is not null
  group by s.chapter_idx
  having count(distinct s.page_index) = count(distinct s.image_url)
     and count(distinct s.page_index) = (case when s.chapter_idx = 32 then 2 else 3 end)
) t;

commit;
