-- ============================================================================
-- 图书馆「绘本模式」· 伊索寓言 ch29《父亲与儿子们》分页(3 页 / 3 张图)
--
-- ⚠️ 抗切分写法(ch8 起的默认约定):不用任何 do $$ 块、注释里不留分号、
--    断言用 CASE + 强制类型转换。
--
-- 分页口径:本章只有 1 段,按 seq 升序 row_number() 硬切 2/2/1,para_idx 一个字不动。
--    页1(句1-2)= 儿子们成天吵架说也没用 · 父亲让他们抱来一捆柴 挨个递过去叫他们折断
--    页2(句3-4)= 人人都试了谁也折不断 · 解开捆绳一根根分下去 不费吹灰之力全折了
--    页3(句5)= 「捆在一起谁都拿你们没办法 散开就是一堆松柴」
--
-- ✅ 3 张图已传桶(2026-07-28,1200 宽 q82),公开地址实测全部 HTTP 200
--    library-illustrations/aesop-easy-readers/ch29/p{1,2,3}.jpg
--
-- 画风:卡通彩色。
--
-- 画面验收要点:
--   ① 🆕 **角色必须有实质差异,不能只靠衣袍颜色区分**(Aaron 2026-07-28 提出:
--      之前几章人物一个模子换衣服)。本章据此重出,四人各给独立的体型/发色/胡须/年龄:
--      父亲=矮胖秃顶白须、老大=高大黑卷发满脸黑须、老二=中等偏瘦扎马尾无须、
--      老三=最矮最瘦姜黄卷发带雀斑。身高从高到矮排开,黑白打印也分得出。
--   ② 柴是关键道具:第 1 页完整一捆 · 第 2 页左边整捆完好右边单根应声而断
--      (地上散落断柴与解开的绳子)· 第 3 页父亲右手高举整捆、左手低举一根断柴。
--   ③ 兄弟姿态弧线:抱臂各朝一边 → 各自使劲 → **并肩站成一排**。
--   ④ 全程分开不接触、全篇无红色。
--
-- 影响面:只碰 book_key='aesop-easy-readers' 且 chapter_idx=25 的 3 行。幂等:再跑无害。
-- ⚠️ 跑完还需前端把 'aesop-easy-readers#25' 加进 PICTURE_BOOK_CHAPTERS。
-- ============================================================================

begin;

-- 前置计数:本章应为 5 句、1 段、page_index 全空
select count(*) as ch29_rows,
       count(distinct s.para_idx) as ch29_paras,
       count(s.page_index) as ch29_paged_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 29;

-- 🔒 前置硬闸:句数必须恰好 3
select case
         when count(*) = 5
           then 'OK 前置 ch29 恰好 5 句 硬编码切点 1-2/3-4/5 成立'
         else ('前置硬闸失败 ch29 句数=' || count(*) ||
               ' 期望 5 正文已变 硬编码切点不再成立 已回滚')::int::text
       end as guard_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 29;

with tgt as (
  select s.id, row_number() over (order by s.seq) as rn
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers' and s.chapter_idx = 29
)
update public.library_sentences s
   set page_index = case when t.rn <= 2 then 1 when t.rn <= 4 then 2 else 3 end,
       image_url  = 'aesop-easy-readers/ch29/p'
                 || (case when t.rn <= 2 then 1 when t.rn <= 4 then 2 else 3 end) || '.jpg'
  from tgt t where s.id = t.id;

-- 🔒 后置硬闸:3 行全配页、恰好 3 页 3 图、页分布必须是 1/1/1
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
  and s.chapter_idx = 29
  and s.page_index is not null;

-- 后置明细:应为 3 行 —— (1,2句,p1.jpg) (2,2句,p2.jpg) (3,1句,p3.jpg)
select s.page_index, count(*) as sentences, min(s.image_url) as image_url
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 29
group by s.page_index
order by s.page_index;

-- para_idx 未被改动自检:期望仍是 1 段
select count(distinct s.para_idx) as ch29_paras_after
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 29;

-- ch30 起零影响自检:期望 0
select count(*) as later_chapters_paged
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx > 29
  and s.page_index is not null;

-- ch1-ch28 未被本单影响自检:期望 28 章各 3 页 3 图
select count(*) as chapters_1_to_28_ok
from (
  select s.chapter_idx
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers'
    and s.chapter_idx between 1 and 28
    and s.page_index is not null
  group by s.chapter_idx
  having count(distinct s.page_index) = 3 and count(distinct s.image_url) = 3
) t;

commit;
