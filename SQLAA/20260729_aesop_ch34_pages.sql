-- ============================================================================
-- 图书馆「绘本模式」· 伊索寓言 ch34《占着食槽的狗》分页(3 页 / 3 张图)
--
-- ⚠️ 抗切分写法(ch8 起的默认约定):不用任何 do $$ 块、注释里不留分号、
--    断言用 CASE + 强制类型转换。
--
-- 分页口径:本章只有 1 段,按 seq 升序 row_number() 硬切 1/1/1,para_idx 一个字不动。
--    页1(句1)= 狗趴在食槽里 占着本该给牛吃的干草
--    页2(句2)= 牛来吃草 狗低吼龇牙 不让它们靠近
--    页3(句3)= 一头牛说「干草他自己吃不了 能吃的他还不让吃」
--
-- ✅ 3 张图已传桶(2026-07-29,1200 宽 q82),公开地址实测全部 HTTP 200
--    library-illustrations/aesop-easy-readers/ch34/p{1,2,3}.jpg
--
-- 画风:卡通彩色。
--
-- 画面验收要点:
--   ① **干草红线**:三页的干草都必须是完好未动的 —— 一口没被吃到才是这则寓言的全部道理。
--   ② 姿态弧线:狗(蜷在草上闭眼酣睡 → 前腿撑开炸毛龇牙 → 缩回草里下巴贴爪 沉着脸偷瞄)、
--      牛(不在画面 → 昂头后仰 抬蹄倒退 → 转过来彼此对话 抬蹄抱怨)。
--   ③ 角色一致性:狗是棕白花色、白鼻梁、垂耳、白胸白爪的软毛小狗,三页同一条。
--      ⚠️ p2 初版画成了深灰褐蓬毛㹴犬(中间那页换了品种),已按 p1/p3 锁死造型重出。
--   ④ 两头牛体型差异明显(大棕白花斑长弯角 / 小全棕短角),彼此完整分开。
--      牛与食槽之间始终留大片空地,全程零接触。无红色。
--
-- 影响面:只碰 book_key='aesop-easy-readers' 且 chapter_idx=33 的 3 行。幂等:再跑无害。
-- ⚠️ 跑完还需前端把 'aesop-easy-readers#34' 加进 PICTURE_BOOK_CHAPTERS。
-- ============================================================================

begin;

-- 前置计数:本章应为 3 句、1 段、page_index 全空
select count(*) as ch34_rows,
       count(distinct s.para_idx) as ch34_paras,
       count(s.page_index) as ch34_paged_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 34;

-- 🔒 前置硬闸:句数必须恰好 5
select case
         when count(*) = 3
           then 'OK 前置 ch34 恰好 3 句 硬编码切点 1/2/3 成立'
         else ('前置硬闸失败 ch34 句数=' || count(*) ||
               ' 期望 3 正文已变 硬编码切点不再成立 已回滚')::int::text
       end as guard_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 34;

with tgt as (
  select s.id, row_number() over (order by s.seq) as rn
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers' and s.chapter_idx = 34
)
update public.library_sentences s
   set page_index = case when t.rn <= 1 then 1 when t.rn <= 2 then 2 else 3 end,
       image_url  = 'aesop-easy-readers/ch34/p'
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
  and s.chapter_idx = 34
  and s.page_index is not null;

-- 后置明细:应为 3 行 —— (1,1句,p1.jpg) (2,1句,p2.jpg) (3,1句,p3.jpg)
select s.page_index, count(*) as sentences, min(s.image_url) as image_url
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 34
group by s.page_index
order by s.page_index;

-- para_idx 未被改动自检:期望仍是 1 段
select count(distinct s.para_idx) as ch34_paras_after
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 34;

-- ch35 起零影响自检:期望 0
select count(*) as later_chapters_paged
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx > 34
  and s.page_index is not null;

-- ch1-ch33 未被本单影响自检:期望 33 章(ch32 是 2 页 2 图 其余 32 章 3 页 3 图)
select count(*) as chapters_1_to_33_ok
from (
  select s.chapter_idx
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers'
    and s.chapter_idx between 1 and 33
    and s.page_index is not null
  group by s.chapter_idx
  having count(distinct s.page_index) = count(distinct s.image_url)
     and count(distinct s.page_index) = (case when s.chapter_idx = 32 then 2 else 3 end)
) t;

commit;
