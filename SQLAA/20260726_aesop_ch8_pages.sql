-- ============================================================================
-- 图书馆「绘本模式」第 8 本 · 给《伊索寓言》第 8 章「老鼠开会」写 3 页
--
-- ⚠️ 沿用 **ch5/ch6/ch7 的单段模板**(不是 ch1-ch4 的 dense_rank 版):
--   ch8 只有 1 段,按 `seq` 升序 `row_number()` 硬切:1-2 → 页1,3-4 → 页2,5 → 页3。
--   `para_idx` 一个字不动(buildPages:有 page_index 就按它,没有才回退 para_idx)。
--
-- 🔒 因为切点是硬编码的,先断言本章恰好 5 句;句数一变就整单回滚,不会切错。
--
-- 分页依据 —— 这则寓言的三拍:
--   页1(句1-2)= 众鼠开会 · 方案一个个被否 · 一只有资历的鼠起身说他想出办法了
--   页2(句3-4)= 挂铃方案抛出 · 满堂叫好正要表决 · 一只年长的鼠悄悄站起来
--   页3(句5)  = 「谁去把铃铛挂到猫脖子上?」· 全场哑然
--
-- ✅ 这 3 张图**已经传好**(2026-07-26,1200 宽 q82 → 桶 library-illustrations),
--    公开地址实测 HTTP 200:
--      https://degqpiiddkxcuzwombwp.supabase.co/storage/v1/object/public/library-illustrations/aesop-easy-readers/ch8/p1.jpg  (148KB)
--      …/p2.jpg (153KB)  …/p3.jpg (150KB)
--
-- ⚠️ 画风分界:ch1-ch7 为水彩;**ch8 起改为卡通彩色**(Aaron 2026-07-26 拍板,
--    旧章不回头修)。造型统一为可爱圆润的绘本卡通角色,非写实动物。
--
-- 画面验收要点(均已验证通过):
--   ① 第 2 页**全场必须真心叫好** —— 只要有几只已经面露疑色,第 3 页那句反问就先泄了力道;
--      年长的老鼠这一页要**悄悄起身但无人注意**(对应原文「眼看就要表决通过,一只年长的老鼠站了起来」)。
--   ② 第 3 页是**哑口无言**不是**吵起来** —— 安静、面面相觑、举起的爪子慢慢放下;
--      **绝不能有任何一只举爪自告奋勇或往前一步**,那等于把寓言直接推翻;
--      老鼠也不能显得得意或教训人,他只是平静地问了一句。
--   ③ **猫全程不出现** —— 她只是个假想敌,这正是笑点所在。
--   贯穿:铃铛 p1 没有 → p2 高举闪亮 → p3 垂在爪中失了光彩。
--
-- 影响面:where 双限 book_key + chapter_idx = 8,只碰这 5 行。幂等:再跑无害。
-- ⚠️ 跑完还需前端把 'aesop-easy-readers#8' 加进 PICTURE_BOOK_CHAPTERS 才会走绘本渲染。
-- ============================================================================

begin;

-- 前置计数:本章 5 句、1 段、page_index 应全空
select count(*) as ch8_rows,
       count(distinct s.para_idx) as ch8_paras,
       count(s.page_index) as ch8_paged_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 8;

-- 🔒 前置硬闸:切点写死在 SQL 里,句数必须恰好 5,否则会切错 → 整单回滚
do $$
declare v_rows int;
begin
  select count(*) into v_rows
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers'
    and s.chapter_idx = 8;
  if v_rows <> 5 then
    raise exception 'ch8 句数=%,期望 5 —— 正文已变,硬编码切点(1-2/3-4/5)不再成立,已回滚', v_rows;
  end if;
end $$;

with tgt as (
  select s.id,
         row_number() over (order by s.seq) as rn
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers'
    and s.chapter_idx = 8
)
update public.library_sentences s
   set page_index = case when t.rn <= 2 then 1 when t.rn <= 4 then 2 else 3 end,
       image_url  = 'aesop-easy-readers/ch8/p'
                 || (case when t.rn <= 2 then 1 when t.rn <= 4 then 2 else 3 end)
                 || '.jpg'
  from tgt t
 where s.id = t.id;

-- 后置断言:5 行全配页、恰好 3 页、3 张图、且页分布必须是 2/2/1;不满足则整单回滚
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
    and s.chapter_idx = 8
    and s.page_index is not null;
  if v_rows <> 5 or v_pages <> 3 or v_imgs <> 3 then
    raise exception '绘本分页断言失败:已配页行=%(期望 5)、页数=%(期望 3)、图数=%(期望 3)', v_rows, v_pages, v_imgs;
  end if;
  if v_p1 <> 2 or v_p2 <> 2 or v_p3 <> 1 then
    raise exception '页分布断言失败:实际 %/%/%,期望 2/2/1', v_p1, v_p2, v_p3;
  end if;
end $$;

-- 后置明细:应为 3 行 —— (1,2句,p1.jpg) (2,2句,p2.jpg) (3,1句,p3.jpg)
select s.page_index, count(*) as sentences, min(s.image_url) as image_url
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 8
group by s.page_index
order by s.page_index;

-- para_idx 未被改动自检(期望仍是 1 段)
select count(distinct s.para_idx) as ch8_paras_after
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 8;

-- 其余 81 章零影响自检:本书除 ch1-ch8 外应无任何行被配页(期望 0)
select count(*) as other_chapters_paged
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx not in (1, 2, 3, 4, 5, 6, 7, 8)
  and s.page_index is not null;

-- ch1-ch7 未被本单影响自检(期望 11/12/10/11/7/6/4 句,各 3 页 3 图)
select s.chapter_idx,
       count(*) as paged_rows,
       count(distinct s.page_index) as pages,
       count(distinct s.image_url) as imgs
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx in (1, 2, 3, 4, 5, 6, 7)
  and s.page_index is not null
group by s.chapter_idx
order by s.chapter_idx;

commit;
