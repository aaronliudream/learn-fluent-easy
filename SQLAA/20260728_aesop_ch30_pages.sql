-- ============================================================================
-- 图书馆「绘本模式」· 伊索寓言 ch30《老狮子》分页(3 页 / 3 张图)
--
-- ⚠️ 抗切分写法(ch8 起的默认约定):不用任何 do $$ 块、注释里不留分号、
--    断言用 CASE + 强制类型转换。
--
-- 分页口径:本章只有 1 段,按 seq 升序 row_number() 硬切 2/1/2,para_idx 一个字不动。
--    页1(句1-2)= 狮子老得靠不了力气改用心计 · 躲进山洞躺下装病 谁来探望就吃谁
--    页2(句3)= 不少动物送了命 直到狐狸来了 · 他起疑站在洞外冲里头喊话
--    页3(句4-5)= 狮子「进来呀」· 狐狸「脚印全朝里去 没有一个是出来的」
--
-- ✅ 3 张图已传桶(2026-07-28,1200 宽 q82),公开地址实测全部 HTTP 200
--    library-illustrations/aesop-easy-readers/ch30/p{1,2,3}.jpg
--
-- 画风:卡通彩色。
--
-- 画面验收要点:
--   ① 年龄红线:原文第 2、3 句写扑咬捕食与「不少动物送了命」。
--      **全篇不画扑咬、不画尸骨、不出现红色** —— 暴力交给文字,画面只呈现装病与识破。
--   ② 关键道具是**脚印**:第 2、3 页地上满是又大又深的脚印,连成长长的轨迹,
--      **全部朝洞口方向,没有一个朝外** —— 这是狐狸识破的全部依据。
--   ③ 老狮子必须**明显区别于书中早前那头金鬃壮狮**:瘦削嶙峋、灰白稀疏鬃毛、
--      灰口鼻、耷拉的倦眼、微驼背,老态而非凶相。
--   ④ 狮子始终在洞里(第 3 页只在洞口内露出头肩前爪)、狐狸始终远在洞外,
--      两者之间留大片空沙地,全程零接触。
--
-- 影响面:只碰 book_key='aesop-easy-readers' 且 chapter_idx=25 的 3 行。幂等:再跑无害。
-- ⚠️ 跑完还需前端把 'aesop-easy-readers#25' 加进 PICTURE_BOOK_CHAPTERS。
-- ============================================================================

begin;

-- 前置计数:本章应为 5 句、1 段、page_index 全空
select count(*) as ch30_rows,
       count(distinct s.para_idx) as ch30_paras,
       count(s.page_index) as ch30_paged_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 30;

-- 🔒 前置硬闸:句数必须恰好 3
select case
         when count(*) = 5
           then 'OK 前置 ch30 恰好 5 句 硬编码切点 1-2/3/4-5 成立'
         else ('前置硬闸失败 ch30 句数=' || count(*) ||
               ' 期望 5 正文已变 硬编码切点不再成立 已回滚')::int::text
       end as guard_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 30;

with tgt as (
  select s.id, row_number() over (order by s.seq) as rn
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers' and s.chapter_idx = 30
)
update public.library_sentences s
   set page_index = case when t.rn <= 2 then 1 when t.rn <= 3 then 2 else 3 end,
       image_url  = 'aesop-easy-readers/ch30/p'
                 || (case when t.rn <= 2 then 1 when t.rn <= 3 then 2 else 3 end) || '.jpg'
  from tgt t where s.id = t.id;

-- 🔒 后置硬闸:3 行全配页、恰好 3 页 3 图、页分布必须是 1/1/1
select case
         when count(*) = 5
          and count(distinct s.page_index) = 3
          and count(distinct s.image_url) = 3
          and (count(*) filter (where s.page_index = 1)) = 2
          and (count(*) filter (where s.page_index = 2)) = 1
          and (count(*) filter (where s.page_index = 3)) = 2
           then 'OK 后置 5 行 3 页 3 图 分布 2/1/2'
         else ('后置断言失败 行=' || count(*) ||
               ' 页=' || count(distinct s.page_index) ||
               ' 图=' || count(distinct s.image_url) ||
               ' 分布=' || (count(*) filter (where s.page_index = 1)) ||
               '/' || (count(*) filter (where s.page_index = 2)) ||
               '/' || (count(*) filter (where s.page_index = 3)) ||
               ' 期望 5 行 3 页 3 图 分布 2/1/2 已回滚')::int::text
       end as guard_after
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 30
  and s.page_index is not null;

-- 后置明细:应为 3 行 —— (1,2句,p1.jpg) (2,1句,p2.jpg) (3,2句,p3.jpg)
select s.page_index, count(*) as sentences, min(s.image_url) as image_url
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 30
group by s.page_index
order by s.page_index;

-- para_idx 未被改动自检:期望仍是 1 段
select count(distinct s.para_idx) as ch30_paras_after
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 30;

-- ch31 起零影响自检:期望 0
select count(*) as later_chapters_paged
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx > 30
  and s.page_index is not null;

-- ch1-ch29 未被本单影响自检:期望 29 章各 3 页 3 图
select count(*) as chapters_1_to_29_ok
from (
  select s.chapter_idx
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers'
    and s.chapter_idx between 1 and 29
    and s.page_index is not null
  group by s.chapter_idx
  having count(distinct s.page_index) = 3 and count(distinct s.image_url) = 3
) t;

commit;
