-- ============================================================================
-- 图书馆「绘本模式」第 7 本 · 给《伊索寓言》第 7 章「爱咬人的狗」写 3 页
--
-- ⚠️ 沿用 **ch5/ch6 的单段模板**(不是 ch1-ch4 的 dense_rank 版):
--   ch7 只有 1 段,按 `seq` 升序 `row_number()` 硬切:1 → 页1,2-3 → 页2,4 → 页3。
--   `para_idx` 一个字不动(buildPages:有 page_index 就按它,没有才回退 para_idx)。
--
-- 🔒 因为切点是硬编码的,先断言本章恰好 4 句;句数一变就整单回滚,不会切错。
--
-- 分页依据 —— 正好是这则寓言的三拍:
--   页1(句1)  = 狗无故咬人,来客苦不堪言        → 「为什么要挂铃」
--   页2(句2-3)= 主人挂铃警示 · 狗得意昂首摇铃    → 「他以为是奖章」
--   页3(句4)  = 老狗淡淡点破                     → 「其实是警示牌」
--
-- ✅ 这 3 张图**已经传好**(2026-07-26,水彩风 → 1200 宽 q82 → 桶 library-illustrations),
--    公开地址实测 HTTP 200:
--      https://degqpiiddkxcuzwombwp.supabase.co/storage/v1/object/public/library-illustrations/aesop-easy-readers/ch7/p1.jpg  (187KB)
--      …/p2.jpg (228KB)  …/p3.jpg (209KB)
--
-- 画面验收要点(三条,均已验证通过):
--   ① 年龄红线:第 1 页咬人是**动势不是接触** —— 狗与来客之间留明显空当,
--      无破口、无血迹、无衣物撕裂;狗要显得讨嫌,不要显得吓人。
--   ② 寓意红线:第 2 页**主人绝不能显得在奖励狗**(不笑、不拍、不递食、无奖章绶带)。
--      铃铛是警报器,狗当成勋章 —— 主人一旦像在颁奖,末句「你不会真以为这是奖给你的吧」当场作废。
--      反向也禁:狗不能显得羞愧挨罚,他得意得越真,第 3 页点破才越有劲。
--   ③ 节奏红线:第 3 页年轻的狗**还没醒悟**,仍在得意地走;老狗是看透不是训斥,
--      不画两狗对峙。狗要是当场蔫了,笑点就提前泄掉了。
--
-- 影响面:where 双限 book_key + chapter_idx = 7,只碰这 4 行。幂等:再跑无害。
-- ⚠️ 跑完还需前端把 'aesop-easy-readers#7' 加进 PICTURE_BOOK_CHAPTERS 才会走绘本渲染。
-- ============================================================================

begin;

-- 前置计数:本章 4 句、1 段、page_index 应全空
select count(*) as ch7_rows,
       count(distinct s.para_idx) as ch7_paras,
       count(s.page_index) as ch7_paged_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 7;

-- 🔒 前置硬闸:切点写死在 SQL 里,句数必须恰好 4,否则会切错 → 整单回滚
do $$
declare v_rows int;
begin
  select count(*) into v_rows
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers'
    and s.chapter_idx = 7;
  if v_rows <> 4 then
    raise exception 'ch7 句数=%,期望 4 —— 正文已变,硬编码切点(1/2-3/4)不再成立,已回滚', v_rows;
  end if;
end $$;

with tgt as (
  select s.id,
         row_number() over (order by s.seq) as rn
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers'
    and s.chapter_idx = 7
)
update public.library_sentences s
   set page_index = case when t.rn <= 1 then 1 when t.rn <= 3 then 2 else 3 end,
       image_url  = 'aesop-easy-readers/ch7/p'
                 || (case when t.rn <= 1 then 1 when t.rn <= 3 then 2 else 3 end)
                 || '.jpg'
  from tgt t
 where s.id = t.id;

-- 后置断言:4 行全配页、恰好 3 页、3 张图、且页分布必须是 1/2/1;不满足则整单回滚
do $$
declare v_rows int; v_pages int; v_imgs int; v_p1 int; v_p2 int; v_p3 int;
begin
  select count(*), count(distinct s.page_index), count(distinct s.image_url),
         count(*) filter (where s.page_index = 1),
         count(*) filter (where s.page_index = 2),
         count(*) filter (where s.page_index = 3)
    into v_rows, v_pages, v_imgs, v_p1, v_p2, v_p3
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers'
    and s.chapter_idx = 7
    and s.page_index is not null;
  if v_rows <> 4 or v_pages <> 3 or v_imgs <> 3 then
    raise exception '绘本分页断言失败:已配页行=%(期望 4)、页数=%(期望 3)、图数=%(期望 3)', v_rows, v_pages, v_imgs;
  end if;
  if v_p1 <> 1 or v_p2 <> 2 or v_p3 <> 1 then
    raise exception '页分布断言失败:实际 %/%/%,期望 1/2/1', v_p1, v_p2, v_p3;
  end if;
end $$;

-- 后置明细:应为 3 行 —— (1,1句,p1.jpg) (2,2句,p2.jpg) (3,1句,p3.jpg)
select s.page_index, count(*) as sentences, min(s.image_url) as image_url
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 7
group by s.page_index
order by s.page_index;

-- para_idx 未被改动自检(期望仍是 1 段)
select count(distinct s.para_idx) as ch7_paras_after
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 7;

-- 其余 82 章零影响自检:本书除 ch1-ch7 外应无任何行被配页(期望 0)
select count(*) as other_chapters_paged
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx not in (1, 2, 3, 4, 5, 6, 7)
  and s.page_index is not null;

-- ch1-ch6 未被本单影响自检(期望 11/12/10/11/7/6 句,各 3 页 3 图)
select s.chapter_idx,
       count(*) as paged_rows,
       count(distinct s.page_index) as pages,
       count(distinct s.image_url) as imgs
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx in (1, 2, 3, 4, 5, 6)
  and s.page_index is not null
group by s.chapter_idx
order by s.chapter_idx;

commit;
