-- ============================================================================
-- 图书馆「绘本模式」· 伊索寓言 ch38《青蛙求王》分页(3 页 / 3 张图)
--
-- ⚠️ 抗切分写法(ch8 起的默认约定):不用任何 do $$ 块、注释里不留分号、
--    断言用 CASE + 强制类型转换。
--
-- 分页口径:本章只有 1 段,按 seq 升序 row_number() 硬切 2/2/2,para_idx 一个字不动。
--    页1(句1-2)= 青蛙嫌头上没管事的 派代表去讨一个王 · 朱庇特往池子里丢下一根木头
--    页2(句3-4)= 木头一动不动 胆子壮了索性坐上去 · 认定这是羞辱 再去求换一个
--    页3(句5-6)= 朱庇特被缠烦了 送去一只鹳 · 鹳一到就开始逮青蛙吃
--
-- ✅ 3 张图已传桶(2026-07-29,1200 宽 q82),公开地址实测全部 HTTP 200
--    library-illustrations/aesop-easy-readers/ch38/p{1,2,3}.jpg
--
-- 画风:卡通彩色。
--
-- 画面验收要点:
--   ⚠️ **年龄红线在第 3 页**:原文是鹳开始吃青蛙。照 ch31(溺水男孩)的老办法处理 ——
--      只画「威压 + 四散奔逃」,**不画捕食瞬间**:鹳嘴里空无一物、鹳与任何青蛙零接触、
--      四只青蛙朝四个方向逃开、木头空着漂在水上、全画面无红色。三张图实测符合。
--   ① 姿态弧线:青蛙(在岸上仰头举前肢乞求 → 摊在木头上懒散得意 一只在岸边仰天抱怨
--      → 四散奔逃 入水/上岸/腾空)。
--   ② 角色一致性:四只青蛙配色三页固定(深橄榄带斑/亮青柠/苔绿米白肚/黄绿长腿),
--      木头三页同一根(无枝干 粗树皮)。朱庇特沿用 ch33 的造型(白须/金桂冠/乳白金边袍)。
--   ③ ⚠️ p3 初版把鹳画成了细羽毛的写实鸟,与 p1/p2 的粗描边平涂卡通不是一个画风,
--      已按「粗描边 + 平涂 + 大圆眼 + 翅尖只用几笔黑块」重出。同章画风必须统一。
--   ④ 三页全画面无文字。
--
-- 影响面:只碰 book_key='aesop-easy-readers' 且 chapter_idx=33 的 6 行。幂等:再跑无害。
-- ⚠️ 跑完还需前端把 'aesop-easy-readers#38' 加进 PICTURE_BOOK_CHAPTERS。
-- ============================================================================

begin;

-- 前置计数:本章应为 6 句、1 段、page_index 全空
select count(*) as ch38_rows,
       count(distinct s.para_idx) as ch38_paras,
       count(s.page_index) as ch38_paged_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 38;

-- 🔒 前置硬闸:句数必须恰好 5
select case
         when count(*) = 6
           then 'OK 前置 ch38 恰好 6 句 硬编码切点 1-2/3-4/5-6 成立'
         else ('前置硬闸失败 ch38 句数=' || count(*) ||
               ' 期望 6 正文已变 硬编码切点不再成立 已回滚')::int::text
       end as guard_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 38;

with tgt as (
  select s.id, row_number() over (order by s.seq) as rn
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers' and s.chapter_idx = 38
)
update public.library_sentences s
   set page_index = case when t.rn <= 2 then 1 when t.rn <= 4 then 2 else 3 end,
       image_url  = 'aesop-easy-readers/ch38/p'
                 || (case when t.rn <= 2 then 1 when t.rn <= 4 then 2 else 3 end) || '.jpg'
  from tgt t where s.id = t.id;

-- 🔒 后置硬闸:5 行全配页、恰好 3 页 3 图、页分布必须是 2/2/1
select case
         when count(*) = 6
          and count(distinct s.page_index) = 3
          and count(distinct s.image_url) = 3
          and (count(*) filter (where s.page_index = 1)) = 2
          and (count(*) filter (where s.page_index = 2)) = 2
          and (count(*) filter (where s.page_index = 3)) = 2
           then 'OK 后置 6 行 3 页 3 图 分布 2/2/2'
         else ('后置断言失败 行=' || count(*) ||
               ' 页=' || count(distinct s.page_index) ||
               ' 图=' || count(distinct s.image_url) ||
               ' 分布=' || (count(*) filter (where s.page_index = 1)) ||
               '/' || (count(*) filter (where s.page_index = 2)) ||
               '/' || (count(*) filter (where s.page_index = 3)) ||
               ' 期望 6 行 3 页 3 图 分布 2/2/2 已回滚')::int::text
       end as guard_after
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 38
  and s.page_index is not null;

-- 后置明细:应为 3 行 —— (1,2句,p1.jpg) (2,2句,p2.jpg) (3,2句,p3.jpg)
select s.page_index, count(*) as sentences, min(s.image_url) as image_url
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 38
group by s.page_index
order by s.page_index;

-- para_idx 未被改动自检:期望仍是 1 段
select count(distinct s.para_idx) as ch38_paras_after
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 38;

-- ch39 起零影响自检:期望 0
select count(*) as later_chapters_paged
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx > 38
  and s.page_index is not null;

-- ch1-ch37 未被本单影响自检:期望 37 章(ch32/ch36 是 2 页 2 图 其余 35 章 3 页 3 图)
select count(*) as chapters_1_to_37_ok
from (
  select s.chapter_idx
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers'
    and s.chapter_idx between 1 and 37
    and s.page_index is not null
  group by s.chapter_idx
  having count(distinct s.page_index) = count(distinct s.image_url)
     and count(distinct s.page_index) = (case when s.chapter_idx in (32, 36) then 2 else 3 end)
) t;

commit;
