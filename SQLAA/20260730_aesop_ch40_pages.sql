-- ============================================================================
-- 图书馆「绘本模式」· 伊索寓言 ch40《人与狮子》分页(3 页 / 3 张图)
--
-- ⚠️ 抗切分写法(ch8 起的默认约定):不用任何 do $$ 块、注释里不留分号、
--    断言用 CASE + 强制类型转换。
--
-- 分页口径:本章只有 1 段,按 seq 升序 row_number() 硬切 2/1/1,para_idx 一个字不动。
--    页1(句1-2)= 人和狮结伴赶路 争谁更强更有胆 · 争到岔路口 撞见一座石像
--    页2(句3)  = 人指着石像「谁更强 这不就清楚了」
--    页3(句4)  = 狮说「那是你们那边的说法 要是狮子会刻像 多半你会看见人在下面」
--
-- ✅ 3 张图已传桶(2026-07-29,1200 宽 q82),公开地址实测全部 HTTP 200
--    library-illustrations/aesop-easy-readers/ch40/p{1,2,3}.jpg
--
-- 画风:卡通彩色。
--
-- 画面验收要点:
--   ⚠️ 石像内容是「人制住狮子」,处理成**古典摔跤姿势的灰石像**(人站立 一手按在
--      伏在下面的狮子身上),整座一色灰石、无血、无红。三页同一姿势同一灰。
--   ① 姿态弧线:人(挺胸伸指争辩 → 拄杖昂头 咧嘴得意指着石像 → 手垂下摸后颈 笑没了
--      眉头皱起 侧眼瞟石像)、狮(抬前爪反驳 → 蹲坐半眯眼 一脸不买账 → 挺身抬爪一挥
--      开口 挑眉冷笑)。
--   ② ⚠️ 角色一致性逐项写死(ch34/ch38/ch39 连栽三次的教训:the same X as before 无效):
--      人=黑色短卷发/无须方下巴/米色及膝长衣+细棕腰带/蓝灰披肩/木杖
--      狮=金褐毛/琥珀色圆润鬃毛(平涂简形 非写实毛发)/簇尾/大圆眼黑点瞳
--   ③ 人与狮三页全程零接触、彼此不重叠,与石像之间也始终留大片空地。
--   ④ 三页全画面无文字、无红色。
--
-- 影响面:只碰 book_key='aesop-easy-readers' 且 chapter_idx=33 的 4 行。幂等:再跑无害。
-- ⚠️ 跑完还需前端把 'aesop-easy-readers#40' 加进 PICTURE_BOOK_CHAPTERS。
-- ============================================================================

begin;

-- 前置计数:本章应为 4 句、1 段、page_index 全空
select count(*) as ch40_rows,
       count(distinct s.para_idx) as ch40_paras,
       count(s.page_index) as ch40_paged_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 40;

-- 🔒 前置硬闸:句数必须恰好 5
select case
         when count(*) = 4
           then 'OK 前置 ch40 恰好 4 句 硬编码切点 1-2/3/4 成立'
         else ('前置硬闸失败 ch40 句数=' || count(*) ||
               ' 期望 4 正文已变 硬编码切点不再成立 已回滚')::int::text
       end as guard_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 40;

with tgt as (
  select s.id, row_number() over (order by s.seq) as rn
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers' and s.chapter_idx = 40
)
update public.library_sentences s
   set page_index = case when t.rn <= 2 then 1 when t.rn <= 3 then 2 else 3 end,
       image_url  = 'aesop-easy-readers/ch40/p'
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
  and s.chapter_idx = 40
  and s.page_index is not null;

-- 后置明细:应为 3 行 —— (1,2句,p1.jpg) (2,1句,p2.jpg) (3,1句,p3.jpg)
select s.page_index, count(*) as sentences, min(s.image_url) as image_url
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 40
group by s.page_index
order by s.page_index;

-- para_idx 未被改动自检:期望仍是 1 段
select count(distinct s.para_idx) as ch40_paras_after
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 40;

-- ch41 起零影响自检:期望 0
select count(*) as later_chapters_paged
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx > 40
  and s.page_index is not null;

-- ch1-ch39 未被本单影响自检:期望 39 章(ch32/ch36 是 2 页 2 图 其余 37 章 3 页 3 图)
select count(*) as chapters_1_to_39_ok
from (
  select s.chapter_idx
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers'
    and s.chapter_idx between 1 and 39
    and s.page_index is not null
  group by s.chapter_idx
  having count(distinct s.page_index) = count(distinct s.image_url)
     and count(distinct s.page_index) = (case when s.chapter_idx in (32, 36) then 2 else 3 end)
) t;

commit;
