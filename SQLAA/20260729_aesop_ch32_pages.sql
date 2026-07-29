-- ============================================================================
-- 图书馆「绘本模式」· 伊索寓言 ch32《冒牌大夫青蛙》分页(**2 页 / 2 张图**)
--
-- ⚠️ 抗切分写法(ch8 起的默认约定):不用任何 do $$ 块、注释里不留分号、
--    断言用 CASE + 强制类型转换。
--
-- 分页口径:本章只有 1 段,按 seq 升序 row_number() 硬切 1/1,para_idx 一个字不动。
--    页1(句1)= 青蛙从沼泽爬出来 宣布自己通晓药理包治百病
--    页2(句2)= 狐狸喊「你连自己那条瘸腿和一身又花又皱的皮都治不好」

--
-- ✅ 2 张图已传桶(2026-07-28,1200 宽 q82),公开地址实测全部 HTTP 200
--    library-illustrations/aesop-easy-readers/ch32/p{1,2}.jpg
--
-- 画风:卡通彩色。
--
-- 画面验收要点:
--   ⚠️ **本章只有 2 句,是全书第一个不足 3 句的章,因此做成 2 页 2 图**。
--      buildPages 按分组数出页,不强制 3 页,前端无需改动。本单断言相应改为 2 页 2 图、分布 1/1。
--   ① 关键道具是青蛙自身的两处毛病:**歪斜的后腿**与**斑驳起皱的皮**,
--      两页都必须清清楚楚 —— 第 2 页狐狸那句话全靠它们才成立。
--   ② 姿态弧线:青蛙(高举前肢吹嘘、趾高气扬 → 前肢垂下、闭嘴、泄气)。
--   ③ 角色差异化:五只旁听小动物种类体型各不相同(棕兔/灰鼠/白鸭/棕刺猬/褐雀),
--      各自完整分开。狐狸沿用全书设定。
--   ④ 全程零接触、无红色。
--
-- 影响面:只碰 book_key='aesop-easy-readers' 且 chapter_idx=25 的 3 行。幂等:再跑无害。
-- ⚠️ 跑完还需前端把 'aesop-easy-readers#25' 加进 PICTURE_BOOK_CHAPTERS。
-- ============================================================================

begin;

-- 前置计数:本章应为 2 句、1 段、page_index 全空
select count(*) as ch32_rows,
       count(distinct s.para_idx) as ch32_paras,
       count(s.page_index) as ch32_paged_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 32;

-- 🔒 前置硬闸:句数必须恰好 3
select case
         when count(*) = 2
           then 'OK 前置 ch32 恰好 2 句 硬编码切点 1/2 成立'
         else ('前置硬闸失败 ch32 句数=' || count(*) ||
               ' 期望 2 正文已变 硬编码切点不再成立 已回滚')::int::text
       end as guard_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 32;

with tgt as (
  select s.id, row_number() over (order by s.seq) as rn
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers' and s.chapter_idx = 32
)
update public.library_sentences s
   set page_index = case when t.rn <= 1 then 1 else 2 end,
       image_url  = 'aesop-easy-readers/ch32/p'
                 || (case when t.rn <= 1 then 1 else 2 end) || '.jpg'
  from tgt t where s.id = t.id;

-- 🔒 后置硬闸:3 行全配页、恰好 3 页 3 图、页分布必须是 1/1/1
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
  and s.chapter_idx = 32
  and s.page_index is not null;

-- 后置明细:应为 2 行 —— (1,1句,p1.jpg) (2,1句,p2.jpg)
select s.page_index, count(*) as sentences, min(s.image_url) as image_url
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 32
group by s.page_index
order by s.page_index;

-- para_idx 未被改动自检:期望仍是 1 段
select count(distinct s.para_idx) as ch32_paras_after
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 32;

-- ch33 起零影响自检:期望 0
select count(*) as later_chapters_paged
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx > 32
  and s.page_index is not null;

-- ch1-ch31 未被本单影响自检:期望 31 章各 3 页 3 图
select count(*) as chapters_1_to_31_ok
from (
  select s.chapter_idx
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers'
    and s.chapter_idx between 1 and 31
    and s.page_index is not null
  group by s.chapter_idx
  having count(distinct s.page_index) = 3 and count(distinct s.image_url) = 3
) t;

commit;
