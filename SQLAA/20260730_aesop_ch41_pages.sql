-- ============================================================================
-- 图书馆「绘本模式」· 伊索寓言 ch41《乌龟与鹰》分页(3 页 / 3 张图)
--
-- ⚠️ 抗切分写法(ch8 起的默认约定):不用任何 do $$ 块、注释里不留分号、
--    断言用 CASE + 强制类型转换。
--
-- 分页口径:本章只有 1 段,按 seq 升序 row_number() 硬切 2/2/1,para_idx 一个字不动。
--    页1(句1-2)= 乌龟嫌地上日子无趣 眼馋天上的鸟 缠着鹰教他飞 · 鹰说没用 老天没给你翅膀
--    页2(句3-4)= 乌龟不依不饶 许以财宝 · 鹰终究松口 用爪抓起他带上高空 一撒手
--    页3(句5)  = 乌龟直直坠下
--
-- ✅ 3 张图已传桶(2026-07-29,1200 宽 q82),公开地址实测全部 HTTP 200
--    library-illustrations/aesop-easy-readers/ch41/p{1,2,3}.jpg
--
-- 画风:卡通彩色。
--
-- 画面验收要点:
--   ⚠️⚠️ **全书目前最狠的结局**:原文末句是乌龟「在岩石上摔得粉碎」。
--      照 ch31(溺水男孩)那套办法 —— **只画坠落中,不画落地**:
--      第 3 页乌龟仍在高空、壳完好无裂无碎、与地面之间隔着一大片空白天空、
--      地面只有一块远远的小岩石、鹰的爪子已空。全画面无红色、无破损。三张图实测符合。
--   ① 姿态弧线:乌龟(伸长脖子抬前腿苦苦哀求 → 被爪子提着 四腿在空中乱划 咧嘴大乐
--      → 四腿僵直张开 闭眼张口 身后拖速度线)、
--      鹰(蹲在石头上侧头 半抬翅 一脸不信 → 展翅上升 神情疲惫认了 → 远远滑走 爪子空着)。
--   ② p2 财宝落在地面石板上(一小堆金币和琥珀色宝石),代表「许以财宝」这一句。
--   ③ ⚠️ 角色一致性逐项写死(ch34/ch38/ch39 连栽三次的教训):
--      乌龟=琥珀棕圆顶壳 + 六边形甲片(平涂简形)/灰绿皱头长颈/大圆眼黑点瞳
--      鹰  =金褐身平涂/翅尖只用三四笔炭黑/琥珀橙钩喙与爪/大圆眼 + 一道粗直眉
--   ④ 三页全画面无文字。
--
-- 影响面:只碰 book_key='aesop-easy-readers' 且 chapter_idx=33 的 5 行。幂等:再跑无害。
-- ⚠️ 跑完还需前端把 'aesop-easy-readers#41' 加进 PICTURE_BOOK_CHAPTERS。
-- ============================================================================

begin;

-- 前置计数:本章应为 5 句、1 段、page_index 全空
select count(*) as ch41_rows,
       count(distinct s.para_idx) as ch41_paras,
       count(s.page_index) as ch41_paged_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 41;

-- 🔒 前置硬闸:句数必须恰好 5
select case
         when count(*) = 5
           then 'OK 前置 ch41 恰好 5 句 硬编码切点 1-2/3-4/5 成立'
         else ('前置硬闸失败 ch41 句数=' || count(*) ||
               ' 期望 5 正文已变 硬编码切点不再成立 已回滚')::int::text
       end as guard_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 41;

with tgt as (
  select s.id, row_number() over (order by s.seq) as rn
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers' and s.chapter_idx = 41
)
update public.library_sentences s
   set page_index = case when t.rn <= 2 then 1 when t.rn <= 4 then 2 else 3 end,
       image_url  = 'aesop-easy-readers/ch41/p'
                 || (case when t.rn <= 2 then 1 when t.rn <= 4 then 2 else 3 end) || '.jpg'
  from tgt t where s.id = t.id;

-- 🔒 后置硬闸:5 行全配页、恰好 3 页 3 图、页分布必须是 2/2/1
select case
         when count(*) = 5
          and count(distinct s.page_index) = 3
          and count(distinct s.image_url) = 3
          and (count(*) filter (where s.page_index = 1)) = 2
          and (count(*) filter (where s.page_index = 2)) = 2
          and (count(*) filter (where s.page_index = 3)) = 1
           then 'OK 后置 5 行 3 页 3 图 分布 2/2/1'
         else ('后置断言失败 行=' || count(*) ||
               ' 页=' || count(distinct s.page_index) ||
               ' 图=' || count(distinct s.image_url) ||
               ' 分布=' || (count(*) filter (where s.page_index = 1)) ||
               '/' || (count(*) filter (where s.page_index = 2)) ||
               '/' || (count(*) filter (where s.page_index = 3)) ||
               ' 期望 5 行 3 页 3 图 分布 2/2/1 已回滚')::int::text
       end as guard_after
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 41
  and s.page_index is not null;

-- 后置明细:应为 3 行 —— (1,2句,p1.jpg) (2,2句,p2.jpg) (3,1句,p3.jpg)
select s.page_index, count(*) as sentences, min(s.image_url) as image_url
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 41
group by s.page_index
order by s.page_index;

-- para_idx 未被改动自检:期望仍是 1 段
select count(distinct s.para_idx) as ch41_paras_after
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 41;

-- ch42 起零影响自检:期望 0
select count(*) as later_chapters_paged
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx > 41
  and s.page_index is not null;

-- ch1-ch40 未被本单影响自检:期望 40 章(ch32/ch36 是 2 页 2 图 其余 38 章 3 页 3 图)
select count(*) as chapters_1_to_40_ok
from (
  select s.chapter_idx
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers'
    and s.chapter_idx between 1 and 40
    and s.page_index is not null
  group by s.chapter_idx
  having count(distinct s.page_index) = count(distinct s.image_url)
     and count(distinct s.page_index) = (case when s.chapter_idx in (32, 36) then 2 else 3 end)
) t;

commit;
