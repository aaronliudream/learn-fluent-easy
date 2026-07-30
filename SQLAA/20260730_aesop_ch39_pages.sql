-- ============================================================================
-- 图书馆「绘本模式」· 伊索寓言 ch39《核桃树》分页(3 页 / 3 张图)
--
-- ⚠️ 抗切分写法(ch8 起的默认约定):不用任何 do $$ 块、注释里不留分号、
--    断言用 CASE + 强制类型转换。
--
-- 分页口径:本章只有 1 段,按 seq 升序 row_number() 硬切 1/1/1,para_idx 一个字不动。
--    页1(句1)= 路边一棵核桃树 年年结出满树核桃
--    页2(句2)= 过路的人个个往枝头扔石头抡棍子打核桃 那树没少挨打
--    页3(句3)= 树说「吃我核桃的 偏偏就是拿石头棍子回报我的」
--
-- ✅ 3 张图已传桶(2026-07-29,1200 宽 q82),公开地址实测全部 HTTP 200
--    library-illustrations/aesop-easy-readers/ch39/p{1,2,3}.jpg
--
-- 画风:卡通彩色。
--
-- 画面验收要点:
--   ⚠️ 画法决定:**本章给树画了脸**。ch22 芦苇那回的教训是「别给背景景物加脸」,
--      但这里树是**说话的主角**(第 3 句是它的台词),情绪必须靠脸带 ——
--      三页统一在树干上做一副简单树皮五官,不是临时加的。
--   ① 五官三页同一副:两只大圆眼(白眼球 + 棕眼珠)+ 两道短弯眉 + 一条简单弯嘴,
--      光换表情:得意微笑 → 眼珠上翻 眉毛内挑 嘴撇成「哎哟」 → 低头看着脚下 苦笑。
--      ⚠️ p2 初版把脸画成沟壑纵横、龇牙的凶脸(像换了一棵树),已按 p1/p3 锁死五官重出。
--   ② 石头棍子:p2 全部**飞在空中**、不碰到任何人 p3 全部**堆在树脚**,同一批东西。
--   ③ 三个村民体型各不相同(高瘦青年/矮胖妇人/瘦小男孩),彼此分开、都不碰树。
--   ④ p3 用「树冠变稀 + 断枝茬 + 脚下那堆石头棍子」收尾。三页全画面无文字、无红色。
--
-- 影响面:只碰 book_key='aesop-easy-readers' 且 chapter_idx=33 的 3 行。幂等:再跑无害。
-- ⚠️ 跑完还需前端把 'aesop-easy-readers#39' 加进 PICTURE_BOOK_CHAPTERS。
-- ============================================================================

begin;

-- 前置计数:本章应为 3 句、1 段、page_index 全空
select count(*) as ch39_rows,
       count(distinct s.para_idx) as ch39_paras,
       count(s.page_index) as ch39_paged_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 39;

-- 🔒 前置硬闸:句数必须恰好 5
select case
         when count(*) = 3
           then 'OK 前置 ch39 恰好 3 句 硬编码切点 1/2/3 成立'
         else ('前置硬闸失败 ch39 句数=' || count(*) ||
               ' 期望 3 正文已变 硬编码切点不再成立 已回滚')::int::text
       end as guard_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 39;

with tgt as (
  select s.id, row_number() over (order by s.seq) as rn
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers' and s.chapter_idx = 39
)
update public.library_sentences s
   set page_index = case when t.rn <= 1 then 1 when t.rn <= 2 then 2 else 3 end,
       image_url  = 'aesop-easy-readers/ch39/p'
                 || (case when t.rn <= 1 then 1 when t.rn <= 2 then 2 else 3 end) || '.jpg'
  from tgt t where s.id = t.id;

-- 🔒 后置硬闸:5 行全配页、恰好 3 页 3 图、页分布必须是 2/2/1
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
  and s.chapter_idx = 39
  and s.page_index is not null;

-- 后置明细:应为 3 行 —— (1,1句,p1.jpg) (2,1句,p2.jpg) (3,1句,p3.jpg)
select s.page_index, count(*) as sentences, min(s.image_url) as image_url
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 39
group by s.page_index
order by s.page_index;

-- para_idx 未被改动自检:期望仍是 1 段
select count(distinct s.para_idx) as ch39_paras_after
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 39;

-- ch40 起零影响自检:期望 0
select count(*) as later_chapters_paged
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx > 39
  and s.page_index is not null;

-- ch1-ch38 未被本单影响自检:期望 38 章(ch32/ch36 是 2 页 2 图 其余 36 章 3 页 3 图)
select count(*) as chapters_1_to_38_ok
from (
  select s.chapter_idx
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers'
    and s.chapter_idx between 1 and 38
    and s.page_index is not null
  group by s.chapter_idx
  having count(distinct s.page_index) = count(distinct s.image_url)
     and count(distinct s.page_index) = (case when s.chapter_idx in (32, 36) then 2 else 3 end)
) t;

commit;
