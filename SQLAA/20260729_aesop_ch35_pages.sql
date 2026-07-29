-- ============================================================================
-- 图书馆「绘本模式」· 伊索寓言 ch35《两只袋子》分页(3 页 / 3 张图)
--
-- ⚠️ 抗切分写法(ch8 起的默认约定):不用任何 do $$ 块、注释里不留分号、
--    断言用 CASE + 强制类型转换。
--
-- 分页口径:本章只有 1 段,按 seq 升序 row_number() 硬切 1/1/1,para_idx 一个字不动。
--    页1(句1)= 人人身前身后各挂一只袋子 两只都塞满了毛病
--    页2(句2)= 前面那只装别人的 后面那只装自己的
--    页3(句3)= 所以一辈子看不见自己一处毛病 却一次也不漏掉你的
--
-- ✅ 3 张图已传桶(2026-07-29,1200 宽 q82),公开地址实测全部 HTTP 200
--    library-illustrations/aesop-easy-readers/ch35/p{1,2,3}.jpg
--
-- 画风:卡通彩色。
--
-- 画面验收要点:
--   ⚠️ 本则没有情节、是纯寓意,画法上把抽象的「一处毛病」实体化成
--      **一只灰色小布团 + 团上一张脸**:前袋里全是别人的脸,后袋里全是他自己的脸。
--   ① p2 是全章的题眼,方位不能反:人侧身朝右,身前那只袋装五张**不同的别人**的脸
--      (金发少年/白发老妇/秃顶胖子/辫子女孩/雀斑小孩),身后那只袋装五张**他自己**的脸
--      (同一张黑须圆脸重复五次)。他正低头在前袋里翻得津津有味,头完全背对身后那只。
--   ② p3 用「磨损度」讲完一辈子:前袋磨得起毛发白、口子大开、边缘全是毛边
--      后袋鼓胀紧实、抽绳仍打着僵硬的旧结、结上落灰并牵着蛛网 —— 一次也没打开过。
--   ③ 角色一致性:中间那人三页同一个 —— 赭褐色长衣 + 小棕帽 + 黑短须
--      (p3 老去:白长须 + 驼背 + 拐杖,衣帽不变)。
--   ④ p1 四位村民年龄体型各不相同,彼此完整分开、零接触。三页全画面无文字、无红色。
--
-- 影响面:只碰 book_key='aesop-easy-readers' 且 chapter_idx=33 的 3 行。幂等:再跑无害。
-- ⚠️ 跑完还需前端把 'aesop-easy-readers#35' 加进 PICTURE_BOOK_CHAPTERS。
-- ============================================================================

begin;

-- 前置计数:本章应为 3 句、1 段、page_index 全空
select count(*) as ch35_rows,
       count(distinct s.para_idx) as ch35_paras,
       count(s.page_index) as ch35_paged_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 35;

-- 🔒 前置硬闸:句数必须恰好 5
select case
         when count(*) = 3
           then 'OK 前置 ch35 恰好 3 句 硬编码切点 1/2/3 成立'
         else ('前置硬闸失败 ch35 句数=' || count(*) ||
               ' 期望 3 正文已变 硬编码切点不再成立 已回滚')::int::text
       end as guard_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 35;

with tgt as (
  select s.id, row_number() over (order by s.seq) as rn
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers' and s.chapter_idx = 35
)
update public.library_sentences s
   set page_index = case when t.rn <= 1 then 1 when t.rn <= 2 then 2 else 3 end,
       image_url  = 'aesop-easy-readers/ch35/p'
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
  and s.chapter_idx = 35
  and s.page_index is not null;

-- 后置明细:应为 3 行 —— (1,1句,p1.jpg) (2,1句,p2.jpg) (3,1句,p3.jpg)
select s.page_index, count(*) as sentences, min(s.image_url) as image_url
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 35
group by s.page_index
order by s.page_index;

-- para_idx 未被改动自检:期望仍是 1 段
select count(distinct s.para_idx) as ch35_paras_after
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 35;

-- ch36 起零影响自检:期望 0
select count(*) as later_chapters_paged
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx > 35
  and s.page_index is not null;

-- ch1-ch34 未被本单影响自检:期望 34 章(ch32 是 2 页 2 图 其余 33 章 3 页 3 图)
select count(*) as chapters_1_to_34_ok
from (
  select s.chapter_idx
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers'
    and s.chapter_idx between 1 and 34
    and s.page_index is not null
  group by s.chapter_idx
  having count(distinct s.page_index) = count(distinct s.image_url)
     and count(distinct s.page_index) = (case when s.chapter_idx = 32 then 2 else 3 end)
) t;

commit;
