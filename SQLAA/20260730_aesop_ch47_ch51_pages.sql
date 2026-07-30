-- ============================================================================
-- 图书馆「绘本模式」· 伊索寓言 ch47-ch51 五章分页(**一单五章 · 逐章独立硬闸**)
--
-- ⚠️ 抗切分写法(ch8 起的默认约定):不用任何 do 块、注释里不留分号、
--    断言用 CASE + 强制类型转换。
--
-- 分页口径:五章各自只有 1 段,按 seq 升序 row_number() 硬切,para_idx 一个字不动。
--   ch47 5 句 → 2/2/1    ch48 3 句 → 1/1/1    ch49 5 句 → 2/2/1
--   ch50 9 句 → 3/4/2    ch51 3 句 → 1/1/1
--
-- ✅ 15 张图已传桶(2026-07-30,1200 宽 q82),公开地址实测**全部 HTTP 200**
--    library-illustrations/aesop-easy-readers/ch{47,48,49,50,51}/p{1,2,3}.jpg
--
-- 画风:卡通彩色(粗描边 + 平涂 + 柔和 cel 阴影 非写实毛发)。
-- 三条通用红线:全画面无文字、无红色、角色零接触零重叠。
--
-- 影响面:只碰 book_key='aesop-easy-readers' 且 chapter_idx in (47,48,49,50,51) 的 25 行。
-- 幂等:再跑无害。任一章前置或后置断言不成立即整单回滚(同一个事务)。
-- ⚠️ 跑完还需前端把 'aesop-easy-readers#47' 到 '#51' 加进 PICTURE_BOOK_CHAPTERS。
-- ============================================================================

begin;

-- ------------------------------------------------------------------------
-- ch47 《水边的鹿》 —— 5 句 → 3 页 2/2/1
--    页1(句1-2)= 口渴的鹿俯身喝水看见自己的影子 · 欣赏那对宽大的角 嫌弃那双又细又瘦的腿
--    页2(句3-4)= 他正端详自己 狮子瞅见扑来 · 空地上他远远甩开 一进树林角就卡在枝桠上
--    页3(句5)  = 他嫌弃的腿本可带他脱身 他引以为傲的角却把他留在了原地
--
-- 画面验收要点:
--   ⚠️ **狮子全程不许碰到鹿**:p2 狮子还远在左侧空地上 与鹿之间隔一大片空草地
--      p3 狮子干脆不入画。三页鹿身上无伤无破损、无红色。
--   ① 对比是全章骨架:**角宽大醒目、腿细瘦**,三页都要一眼看出这组反差。
--   ② 姿态弧线:鹿(俯身照水 眼往上瞟着角得意 一只前蹄别扭地翘开不忍看腿
--      → 全速冲进林子 角被低枝勾住 头被猛地拽起 张口惊惶
--      → 角仍挂在枝上 低头看自己那四条完好的细腿 眉毛内挑 嘴抿平 —— 明白得太晚)。
--   ③ 角色一致性:鹿=浅茶褐身/奶白腹与喉/长立耳/大圆眼黑点瞳/**细瘦长腿**/宽大琥珀褐分叉角
--      狮=金褐身平涂/琥珀褐圆润鬃毛/簇尾/大圆眼黑点瞳。
-- ------------------------------------------------------------------------

-- 前置计数 ch47:应为 5 句、1 段、page_index 全空
select count(*) as ch47_rows,
       count(distinct s.para_idx) as ch47_paras,
       count(s.page_index) as ch47_paged_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 47;

-- 前置硬闸 ch47:句数必须恰好 5
select case
         when count(*) = 5
           then 'OK 前置 ch47 恰好 5 句 硬编码切点成立'
         else ('前置硬闸失败 ch47 句数=' || count(*) ||
               ' 期望 5 正文已变 硬编码切点不再成立 已回滚')::int::text
       end as guard_before_ch47
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 47;

with tgt as (
  select s.id, row_number() over (order by s.seq) as rn
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers' and s.chapter_idx = 47
)
update public.library_sentences s
   set page_index = case when t.rn <= 2 then 1 when t.rn <= 4 then 2 else 3 end,
       image_url  = 'aesop-easy-readers/ch47/p'
                 || (case when t.rn <= 2 then 1 when t.rn <= 4 then 2 else 3 end) || '.jpg'
  from tgt t where s.id = t.id;

-- 后置硬闸 ch47:5 行全配页、恰好 3 页 3 图、页分布必须是 2/2/1
select case
         when count(*) = 5
          and count(distinct s.page_index) = 3
          and count(distinct s.image_url) = 3
          and (count(*) filter (where s.page_index = 1)) = 2
          and (count(*) filter (where s.page_index = 2)) = 2
          and (count(*) filter (where s.page_index = 3)) = 1
           then 'OK 后置 ch47 5 行 3 页 3 图 分布 2/2/1'
         else ('后置断言失败 ch47 行=' || count(*) ||
               ' 页=' || count(distinct s.page_index) ||
               ' 图=' || count(distinct s.image_url) ||
               ' 分布=' || (count(*) filter (where s.page_index = 1)) ||
               '/' || (count(*) filter (where s.page_index = 2)) ||
               '/' || (count(*) filter (where s.page_index = 3)) ||
               ' 期望 5 行 3 页 3 图 分布 2/2/1 已回滚')::int::text
       end as guard_after_ch47
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 47
  and s.page_index is not null;

-- ------------------------------------------------------------------------
-- ch48 《狗与水中的影子》 —— 3 句 → 3 页 1/1/1
--    页1(句1)= 狗叼着一块肉走过溪上的木板桥 忽然看见自己在水里的影子
--    页2(句2)= 他当成了另一条狗 那块比自己的大一倍 松嘴扑了过去
--    页3(句3)= 什么也没捞着 一块从来不存在 另一块已经顺水漂走了
--
-- 画面验收要点:
--   ① 因果链靠**三样东西的状态变化**讲完:嘴里的肉(叼着 → 脱嘴在空中 → 空嘴)、
--      水中的影(清晰且那块明显更大 → 刚开始碎成涟漪 → 全碎没有影子)、
--      真肉的位置(在嘴里 → 在空中掉落 → 已漂到画面最右远处)。
--   ② p1 影子里那块肉必须画得**明显大于**真的那块 —— 他上当的全部理由在这。
--   ③ 姿态弧线:狗(桥上停步侧头看水 眼睁圆起了贪心 → 腾空扑出 张着空嘴
--      → 站在浅水里浑身湿透毛贴平 滴着水 空嘴半张 耳朵塌 尾巴夹 眉毛内挑)。
--   ④ 角色一致性:蜜褐色短毛/奶白胸与爪/一只垂耳一只半立耳/黑鼻头/大圆眼黑点瞳。
-- ------------------------------------------------------------------------

-- 前置计数 ch48:应为 3 句、1 段、page_index 全空
select count(*) as ch48_rows,
       count(distinct s.para_idx) as ch48_paras,
       count(s.page_index) as ch48_paged_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 48;

-- 前置硬闸 ch48:句数必须恰好 3
select case
         when count(*) = 3
           then 'OK 前置 ch48 恰好 3 句 硬编码切点成立'
         else ('前置硬闸失败 ch48 句数=' || count(*) ||
               ' 期望 3 正文已变 硬编码切点不再成立 已回滚')::int::text
       end as guard_before_ch48
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 48;

with tgt as (
  select s.id, row_number() over (order by s.seq) as rn
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers' and s.chapter_idx = 48
)
update public.library_sentences s
   set page_index = case when t.rn <= 1 then 1 when t.rn <= 2 then 2 else 3 end,
       image_url  = 'aesop-easy-readers/ch48/p'
                 || (case when t.rn <= 1 then 1 when t.rn <= 2 then 2 else 3 end) || '.jpg'
  from tgt t where s.id = t.id;

-- 后置硬闸 ch48:3 行全配页、恰好 3 页 3 图、页分布必须是 1/1/1
select case
         when count(*) = 3
          and count(distinct s.page_index) = 3
          and count(distinct s.image_url) = 3
          and (count(*) filter (where s.page_index = 1)) = 1
          and (count(*) filter (where s.page_index = 2)) = 1
          and (count(*) filter (where s.page_index = 3)) = 1
           then 'OK 后置 ch48 3 行 3 页 3 图 分布 1/1/1'
         else ('后置断言失败 ch48 行=' || count(*) ||
               ' 页=' || count(distinct s.page_index) ||
               ' 图=' || count(distinct s.image_url) ||
               ' 分布=' || (count(*) filter (where s.page_index = 1)) ||
               '/' || (count(*) filter (where s.page_index = 2)) ||
               '/' || (count(*) filter (where s.page_index = 3)) ||
               ' 期望 3 行 3 页 3 图 分布 1/1/1 已回滚')::int::text
       end as guard_after_ch48
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 48
  and s.page_index is not null;

-- ------------------------------------------------------------------------
-- ch49 《孔雀与朱诺》 —— 5 句 → 3 页 2/2/1
--    页1(句1-2)= 孔雀嫌自己没有夜莺那样的嗓子 跑去向朱诺抱怨 · 「我一张嘴就成了笑话」
--    页2(句3-4)= 朱诺安慰他 论美没有谁比得上他 · 他不领情「长得再美 配上我这条嗓子有什么用」
--    页3(句5)  = 朱诺语气冷下来 各有各的天赋 只有你一个跑来说事 就算给了你 天亮前你又会有新的不满
--
-- 画面验收要点:
--   ① 姿态弧线是本章全部:孔雀(仰头张喙大声抱怨 双翅摊开作戏 → **尾屏全开**成一大片
--      金翠眼斑 可他自己扭头低眼 喙抿成一条 完全不领情 → 尾屏收下拖在地上 缩颈 冠羽垂
--      闭喙 眼睛别开)、朱诺(端坐倾听 → 前倾摊掌 和蔼安慰 → 起身站直 权杖顿地 竖起一指
--      眉压下 嘴抿成直线 语气转冷)。
--   ② p2 的反差是题眼:**满屏的美 + 一张不领情的脸**同框,一眼说明「给再多也没用」。
--   ③ 朱诺造型定死:高挑/深栗色发盘髻/细金冠/天蓝长袍配金边/金权杖。
--      孔雀=翠绿与孔雀蓝身/头顶三根细冠羽/金翠眼斑长尾。
-- ------------------------------------------------------------------------

-- 前置计数 ch49:应为 5 句、1 段、page_index 全空
select count(*) as ch49_rows,
       count(distinct s.para_idx) as ch49_paras,
       count(s.page_index) as ch49_paged_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 49;

-- 前置硬闸 ch49:句数必须恰好 5
select case
         when count(*) = 5
           then 'OK 前置 ch49 恰好 5 句 硬编码切点成立'
         else ('前置硬闸失败 ch49 句数=' || count(*) ||
               ' 期望 5 正文已变 硬编码切点不再成立 已回滚')::int::text
       end as guard_before_ch49
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 49;

with tgt as (
  select s.id, row_number() over (order by s.seq) as rn
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers' and s.chapter_idx = 49
)
update public.library_sentences s
   set page_index = case when t.rn <= 2 then 1 when t.rn <= 4 then 2 else 3 end,
       image_url  = 'aesop-easy-readers/ch49/p'
                 || (case when t.rn <= 2 then 1 when t.rn <= 4 then 2 else 3 end) || '.jpg'
  from tgt t where s.id = t.id;

-- 后置硬闸 ch49:5 行全配页、恰好 3 页 3 图、页分布必须是 2/2/1
select case
         when count(*) = 5
          and count(distinct s.page_index) = 3
          and count(distinct s.image_url) = 3
          and (count(*) filter (where s.page_index = 1)) = 2
          and (count(*) filter (where s.page_index = 2)) = 2
          and (count(*) filter (where s.page_index = 3)) = 1
           then 'OK 后置 ch49 5 行 3 页 3 图 分布 2/2/1'
         else ('后置断言失败 ch49 行=' || count(*) ||
               ' 页=' || count(distinct s.page_index) ||
               ' 图=' || count(distinct s.image_url) ||
               ' 分布=' || (count(*) filter (where s.page_index = 1)) ||
               '/' || (count(*) filter (where s.page_index = 2)) ||
               '/' || (count(*) filter (where s.page_index = 3)) ||
               ' 期望 5 行 3 页 3 图 分布 2/2/1 已回滚')::int::text
       end as guard_after_ch49
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 49
  and s.page_index is not null;

-- ------------------------------------------------------------------------
-- ch50 《牛与青蛙》 —— 9 句 → 3 页 3/4/2
--    页1(句1-3)= 牛下来喝水 · 母蛙发现少了一只 问另一只 · 「今早来了个四条腿的大家伙」
--    页2(句4-7)= 「有这么大吗」她鼓起来 · 「大得多」 · 又鼓 「这么大」 · 「还要大 妈妈」
--    页3(句8-9)= 她越鼓越大 快成个球了 · 然后炸了
--
-- 画面验收要点:
--   ⚠️⚠️ **本章有两处死亡,两处都不画**:
--      (a) 小青蛙被踩死那一下**完全不入画**:p1 里牛只是远远在池对岸低头喝水
--          画面上只有母蛙和另一只小蛙两只青蛙,不出现任何受伤或死去的青蛙。
--      (b) 母蛙炸开画**炸之前那一刻**:p3 她鼓成一个绷得发亮的大圆球
--          有张力线和汗珠,但**完好无损** —— 无破裂、无碎片、无红色。
--      三张图实测符合。
--   ① 尺寸阶梯是本章的笑点结构:母蛙 常态 → 约两倍的圆球 → 巨大到近乎正球、四肢撑不到地。
--   ② 姿态弧线:母蛙(前倾发问 抬前肢 → 鼓成球 腮帮撑开 眉毛高抬 一脸期待
--      → 闭眼 腮鼓到极限 汗珠飞 四条小腿从球两侧僵直伸出)、
--      小蛙(缩着肩低头 抬前肢指向对岸的牛 → 摇头 两前肢张开比出「比那还大得多」
--      → 往后退一步 两前肢举在身前 眼睛瞪到最大 张口报警)。
--   ③ 角色一致性:母蛙=苔绿身 + 浅奶油腹/宽蹼足/**特别大的圆眼**
--      小蛙=亮青柠身 + 奶油腹/明显小一号。
-- ------------------------------------------------------------------------

-- 前置计数 ch50:应为 9 句、1 段、page_index 全空
select count(*) as ch50_rows,
       count(distinct s.para_idx) as ch50_paras,
       count(s.page_index) as ch50_paged_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 50;

-- 前置硬闸 ch50:句数必须恰好 9
select case
         when count(*) = 9
           then 'OK 前置 ch50 恰好 9 句 硬编码切点成立'
         else ('前置硬闸失败 ch50 句数=' || count(*) ||
               ' 期望 9 正文已变 硬编码切点不再成立 已回滚')::int::text
       end as guard_before_ch50
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 50;

with tgt as (
  select s.id, row_number() over (order by s.seq) as rn
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers' and s.chapter_idx = 50
)
update public.library_sentences s
   set page_index = case when t.rn <= 3 then 1 when t.rn <= 7 then 2 else 3 end,
       image_url  = 'aesop-easy-readers/ch50/p'
                 || (case when t.rn <= 3 then 1 when t.rn <= 7 then 2 else 3 end) || '.jpg'
  from tgt t where s.id = t.id;

-- 后置硬闸 ch50:9 行全配页、恰好 3 页 3 图、页分布必须是 3/4/2
select case
         when count(*) = 9
          and count(distinct s.page_index) = 3
          and count(distinct s.image_url) = 3
          and (count(*) filter (where s.page_index = 1)) = 3
          and (count(*) filter (where s.page_index = 2)) = 4
          and (count(*) filter (where s.page_index = 3)) = 2
           then 'OK 后置 ch50 9 行 3 页 3 图 分布 3/4/2'
         else ('后置断言失败 ch50 行=' || count(*) ||
               ' 页=' || count(distinct s.page_index) ||
               ' 图=' || count(distinct s.image_url) ||
               ' 分布=' || (count(*) filter (where s.page_index = 1)) ||
               '/' || (count(*) filter (where s.page_index = 2)) ||
               '/' || (count(*) filter (where s.page_index = 3)) ||
               ' 期望 9 行 3 页 3 图 分布 3/4/2 已回滚')::int::text
       end as guard_after_ch50
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 50
  and s.page_index is not null;

-- ------------------------------------------------------------------------
-- ch51 《赫拉克勒斯与车夫》 —— 3 句 → 3 页 1/1/1
--    页1(句1)= 满载的车走在泥泞小路上 轮子陷得太深 马再使劲也拽不动
--    页2(句2)= 车夫站在车旁看着 什么也不干 每隔一会儿就大喊赫拉克勒斯来帮忙
--    页3(句3)= 赫拉克勒斯来了「用肩膀顶住轮子 把马赶起来 然后再叫我」
--
-- 画面验收要点:
--   ① 全章道理压在**车夫的手上**:p2 他双臂朝天举着喊、手里空空、离车老远、一点力不出
--      p3 他的手垂了下来。这只手的状态就是寓意本身。
--   ② p1 **人不入画**:只有陷到轮毂的车和两匹拼命前倾的马,先把「使劲的是马不是人」立住。
--   ③ 姿态弧线:车夫(不在画面 → 仰头闭眼张口大喊 双臂高举 肩耸起 双手空空
--      → 手臂垂下 闭嘴 眨着眼 讪讪地在赫拉克勒斯和轮子之间来回看)。
--   ④ 赫拉克勒斯造型定死:高大壮硕/黑色短卷发与短须/浅棕狮皮披在一肩/一根木棒拄地
--      伸手指着**那个陷住的轮子**、神情平淡不为所动、周身一层暖金光。
--   ⑤ 两匹马体型毛色分明(高大枣红配黑鬃 / 略小浅驼配奶白鬃),彼此完整分开。
--      人与人、人与车三页零接触。
-- ------------------------------------------------------------------------

-- 前置计数 ch51:应为 3 句、1 段、page_index 全空
select count(*) as ch51_rows,
       count(distinct s.para_idx) as ch51_paras,
       count(s.page_index) as ch51_paged_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 51;

-- 前置硬闸 ch51:句数必须恰好 3
select case
         when count(*) = 3
           then 'OK 前置 ch51 恰好 3 句 硬编码切点成立'
         else ('前置硬闸失败 ch51 句数=' || count(*) ||
               ' 期望 3 正文已变 硬编码切点不再成立 已回滚')::int::text
       end as guard_before_ch51
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 51;

with tgt as (
  select s.id, row_number() over (order by s.seq) as rn
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers' and s.chapter_idx = 51
)
update public.library_sentences s
   set page_index = case when t.rn <= 1 then 1 when t.rn <= 2 then 2 else 3 end,
       image_url  = 'aesop-easy-readers/ch51/p'
                 || (case when t.rn <= 1 then 1 when t.rn <= 2 then 2 else 3 end) || '.jpg'
  from tgt t where s.id = t.id;

-- 后置硬闸 ch51:3 行全配页、恰好 3 页 3 图、页分布必须是 1/1/1
select case
         when count(*) = 3
          and count(distinct s.page_index) = 3
          and count(distinct s.image_url) = 3
          and (count(*) filter (where s.page_index = 1)) = 1
          and (count(*) filter (where s.page_index = 2)) = 1
          and (count(*) filter (where s.page_index = 3)) = 1
           then 'OK 后置 ch51 3 行 3 页 3 图 分布 1/1/1'
         else ('后置断言失败 ch51 行=' || count(*) ||
               ' 页=' || count(distinct s.page_index) ||
               ' 图=' || count(distinct s.image_url) ||
               ' 分布=' || (count(*) filter (where s.page_index = 1)) ||
               '/' || (count(*) filter (where s.page_index = 2)) ||
               '/' || (count(*) filter (where s.page_index = 3)) ||
               ' 期望 3 行 3 页 3 图 分布 1/1/1 已回滚')::int::text
       end as guard_after_ch51
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 51
  and s.page_index is not null;

-- ------------------------------------------------------------------------
-- 全单收尾自检
-- ------------------------------------------------------------------------

-- 五章后置明细:应为 15 行 —— 每章 3 行 (页号, 句数, 图)
select s.chapter_idx, s.page_index, count(*) as sentences, min(s.image_url) as image_url
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx in (47, 48, 49, 50, 51)
group by s.chapter_idx, s.page_index
order by s.chapter_idx, s.page_index;

-- para_idx 未被改动自检:五章应各仍是 1 段 —— 期望 5 行 且 paras 全为 1
select s.chapter_idx, count(distinct s.para_idx) as paras_after
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx in (47, 48, 49, 50, 51)
group by s.chapter_idx
order by s.chapter_idx;

-- ch52 起零影响自检:期望 0
select count(*) as later_chapters_paged
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx > 51
  and s.page_index is not null;

-- ch1-ch46 未被本单影响自检:期望 46 章(ch32/ch36 是 2 页 2 图 其余 44 章 3 页 3 图)
select count(*) as chapters_1_to_46_ok
from (
  select s.chapter_idx
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers'
    and s.chapter_idx between 1 and 46
    and s.page_index is not null
  group by s.chapter_idx
  having count(distinct s.page_index) = count(distinct s.image_url)
     and count(distinct s.page_index) = (case when s.chapter_idx in (32, 36) then 2 else 3 end)
) t;

-- 全书已配页章数自检:期望 51
select count(distinct s.chapter_idx) as paged_chapters_total
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.page_index is not null;

commit;
