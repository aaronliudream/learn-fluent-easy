-- ============================================================================
-- 图书馆「绘本模式」· 伊索寓言 ch28《农夫与他的儿子们》分页(3 页 / 3 张图)
--
-- ⚠️ 抗切分写法(ch8 起的默认约定):不用任何 do $$ 块、注释里不留分号、
--    断言用 CASE + 强制类型转换。
--
-- 分页口径:本章只有 1 段,按 seq 升序 row_number() 硬切 2/1/1,para_idx 一个字不动。
--    页1(句1-2)= 农夫将逝把儿子们叫到跟前 · 「葡萄园里埋着财宝 去挖」
--    页2(句3)= 他一走 儿子们扛锹去翻土 翻了一遍又一遍 什么也没挖着
--    页3(句4)= 藤被翻得这么透 那年结出前所未有的大丰收
--
-- ✅ 3 张图已传桶(2026-07-27,1200 宽 q82),公开地址实测全部 HTTP 200
--    library-illustrations/aesop-easy-readers/ch28/p{1,2,3}.jpg
--
-- 画风:卡通彩色。
--
-- 画面验收要点:
--   ① 年龄红线:原文第 1 句写农夫「快不行了」。画面画成**老人睁眼坐在床上说话**,
--      儿子们围着听 —— 不画躺平、不画闭眼、不画哭、不画死亡。第 2 页起父亲不入画。
--   ② 第 2 页**画面里绝不能出现任何箱子、金币、宝物** —— 他们什么也没挖到,
--      整片地必须翻得全是土块土垄(读得出「翻了一遍又一遍」)。
--   ③ 三兄弟必须是**成年男子**(第一版被画成小孩已打回重出)。
--   ④ 用衣袍区分角色:长子绿袍、次子蓝袍、幼子棕袍,三页一致,全程分开不接触。
--
-- 影响面:只碰 book_key='aesop-easy-readers' 且 chapter_idx=25 的 3 行。幂等:再跑无害。
-- ⚠️ 跑完还需前端把 'aesop-easy-readers#25' 加进 PICTURE_BOOK_CHAPTERS。
-- ============================================================================

begin;

-- 前置计数:本章应为 4 句、1 段、page_index 全空
select count(*) as ch28_rows,
       count(distinct s.para_idx) as ch28_paras,
       count(s.page_index) as ch28_paged_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 28;

-- 🔒 前置硬闸:句数必须恰好 3
select case
         when count(*) = 4
           then 'OK 前置 ch28 恰好 4 句 硬编码切点 1-2/3/4 成立'
         else ('前置硬闸失败 ch28 句数=' || count(*) ||
               ' 期望 4 正文已变 硬编码切点不再成立 已回滚')::int::text
       end as guard_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 28;

with tgt as (
  select s.id, row_number() over (order by s.seq) as rn
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers' and s.chapter_idx = 28
)
update public.library_sentences s
   set page_index = case when t.rn <= 2 then 1 when t.rn <= 3 then 2 else 3 end,
       image_url  = 'aesop-easy-readers/ch28/p'
                 || (case when t.rn <= 2 then 1 when t.rn <= 3 then 2 else 3 end) || '.jpg'
  from tgt t where s.id = t.id;

-- 🔒 后置硬闸:3 行全配页、恰好 3 页 3 图、页分布必须是 1/1/1
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
  and s.chapter_idx = 28
  and s.page_index is not null;

-- 后置明细:应为 3 行 —— (1,2句,p1.jpg) (2,1句,p2.jpg) (3,1句,p3.jpg)
select s.page_index, count(*) as sentences, min(s.image_url) as image_url
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 28
group by s.page_index
order by s.page_index;

-- para_idx 未被改动自检:期望仍是 1 段
select count(distinct s.para_idx) as ch28_paras_after
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 28;

-- ch29 起零影响自检:期望 0
select count(*) as later_chapters_paged
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx > 28
  and s.page_index is not null;

-- ch1-ch27 未被本单影响自检:期望 27 章各 3 页 3 图
select count(*) as chapters_1_to_27_ok
from (
  select s.chapter_idx
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers'
    and s.chapter_idx between 1 and 27
    and s.page_index is not null
  group by s.chapter_idx
  having count(distinct s.page_index) = 3 and count(distinct s.image_url) = 3
) t;

commit;
