-- ============================================================================
-- 图书馆「绘本模式」· 伊索寓言 ch42-ch46 五章分页(**一单五章 · 逐章独立硬闸**)
--
-- ⚠️ 抗切分写法(ch8 起的默认约定):不用任何 do 块、注释里不留分号、
--    断言用 CASE + 强制类型转换。
--
-- 分页口径:五章各自只有 1 段,按 seq 升序 row_number() 硬切,para_idx 一个字不动。
--   ch42 3 句 → 1/1/1    ch43 4 句 → 1/1/2    ch44 5 句 → 2/1/2
--   ch45 4 句 → 1/2/1    ch46 3 句 → 1/1/1
--
-- ✅ 15 张图已传桶(2026-07-30,1200 宽 q82),公开地址实测**全部 HTTP 200**
--    library-illustrations/aesop-easy-readers/ch{42,43,44,45,46}/p{1,2,3}.jpg
--
-- 画风:卡通彩色(粗描边 + 平涂 + 柔和 cel 阴影 非写实毛发)。
-- 三条通用红线:全画面无文字、无红色、角色零接触零重叠。
--
-- 影响面:只碰 book_key='aesop-easy-readers' 且 chapter_idx in (42,43,44,45,46) 的 19 行。
-- 幂等:再跑无害。任一章前置或后置断言不成立即整单回滚(同一个事务)。
-- ⚠️ 跑完还需前端把 'aesop-easy-readers#42' 到 '#46' 加进 PICTURE_BOOK_CHAPTERS。
-- ============================================================================

begin;

-- ------------------------------------------------------------------------
-- ch42 《屋顶上的小山羊》 —— 3 句 → 3 页 1/1/1
--    页1(句1)= 小山羊爬上棚顶 被茅草里长出来的青草引了上去
--    页2(句2)= 站在上面啃着 看见狼从下面走过 就冲他起哄笑他够不着
--    页3(句3)= 狼抬头「我听见了 不过那不是你在说话 是那屋顶」
--
-- 画面验收要点:
--   ① 姿态弧线:小山羊(低头啃草 半闭眼享受 → 探出屋檐 挺胸张口起哄 抬蹄挑衅指点
--      → 闭嘴 耳朵耷下 圆眼眨巴 前蹄局促并拢)、
--      狼(不在画面 → 边走边抬头看 挑眉不以为意 → 坐下抬爪指向**屋顶**而不是山羊 干笑)。
--   ② 关键在 p3 狼的手势指的是**屋顶**:寓意全在这一指上。
--   ③ 角色一致性逐项写死:山羊=奶白毛 + 背耳浅棕斑/两只短直角/短立尾
--      狼=石板灰身平涂/浅灰胸/尖立耳/长蓬尾/大圆眼 + 粗直眉。
--   ④ 狼始终在地面远处 与棚子隔一大片空地 全程零接触。
-- ------------------------------------------------------------------------

-- 前置计数 ch42:应为 3 句、1 段、page_index 全空
select count(*) as ch42_rows,
       count(distinct s.para_idx) as ch42_paras,
       count(s.page_index) as ch42_paged_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 42;

-- 前置硬闸 ch42:句数必须恰好 3
select case
         when count(*) = 3
           then 'OK 前置 ch42 恰好 3 句 硬编码切点成立'
         else ('前置硬闸失败 ch42 句数=' || count(*) ||
               ' 期望 3 正文已变 硬编码切点不再成立 已回滚')::int::text
       end as guard_before_ch42
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 42;

with tgt as (
  select s.id, row_number() over (order by s.seq) as rn
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers' and s.chapter_idx = 42
)
update public.library_sentences s
   set page_index = case when t.rn <= 1 then 1 when t.rn <= 2 then 2 else 3 end,
       image_url  = 'aesop-easy-readers/ch42/p'
                 || (case when t.rn <= 1 then 1 when t.rn <= 2 then 2 else 3 end) || '.jpg'
  from tgt t where s.id = t.id;

-- 后置硬闸 ch42:3 行全配页、恰好 3 页 3 图、页分布必须是 1/1/1
select case
         when count(*) = 3
          and count(distinct s.page_index) = 3
          and count(distinct s.image_url) = 3
          and (count(*) filter (where s.page_index = 1)) = 1
          and (count(*) filter (where s.page_index = 2)) = 1
          and (count(*) filter (where s.page_index = 3)) = 1
           then 'OK 后置 ch42 3 行 3 页 3 图 分布 1/1/1'
         else ('后置断言失败 ch42 行=' || count(*) ||
               ' 页=' || count(distinct s.page_index) ||
               ' 图=' || count(distinct s.image_url) ||
               ' 分布=' || (count(*) filter (where s.page_index = 1)) ||
               '/' || (count(*) filter (where s.page_index = 2)) ||
               '/' || (count(*) filter (where s.page_index = 3)) ||
               ' 期望 3 行 3 页 3 图 分布 1/1/1 已回滚')::int::text
       end as guard_after_ch42
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 42
  and s.page_index is not null;

-- ------------------------------------------------------------------------
-- ch43 《没有尾巴的狐狸》 —— 4 句 → 3 页 1/1/2
--    页1(句1)  = 狐狸掉进捕兽夹 挣脱出来 尾巴留在了里面
--    页2(句2-3)= 难堪得没法过 召集大家开会 讲尾巴又丑又沉
--    页3(句4)  = 另一只狐狸「要是你自己那条还在 你哪会这么起劲让我们剪掉」
--
-- 画面验收要点:
--   ⚠️ **不画夹住的瞬间**:p1 是挣脱之后 —— 夹子空着张开躺在地上 断尾落在旁边
--      狐狸身上无伤无血无红 画面无任何破损。
--   ① 姿态弧线:秃尾狐(扭头看自己的秃桩 抬爪惊骇张口 → 站上石头挺胸摊开双爪演说
--      → 爪子垂下 肩膀塌 耳朵贴头 别开眼)、
--      听众(眯眼将信将疑 互相递眼色 → 老狐前倾抬爪一挥 挑眉干笑 其余交换笑意)。
--   ② 四只听众体型各异(壮硕暗鞍/瘦高长耳浅金/圆胖颊毛/灰嘴缺耳老狐),彼此完整分开
--      且**每只的大蓬尾都清清楚楚** —— 有尾无尾的对比是本章的全部道理。
--   ③ 角色一致性:秃尾狐=赭橙身/奶白胸与吻/四腿黑袜/尖立耳深色尖/**只有短圆秃桩**。
-- ------------------------------------------------------------------------

-- 前置计数 ch43:应为 4 句、1 段、page_index 全空
select count(*) as ch43_rows,
       count(distinct s.para_idx) as ch43_paras,
       count(s.page_index) as ch43_paged_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 43;

-- 前置硬闸 ch43:句数必须恰好 4
select case
         when count(*) = 4
           then 'OK 前置 ch43 恰好 4 句 硬编码切点成立'
         else ('前置硬闸失败 ch43 句数=' || count(*) ||
               ' 期望 4 正文已变 硬编码切点不再成立 已回滚')::int::text
       end as guard_before_ch43
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 43;

with tgt as (
  select s.id, row_number() over (order by s.seq) as rn
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers' and s.chapter_idx = 43
)
update public.library_sentences s
   set page_index = case when t.rn <= 1 then 1 when t.rn <= 2 then 2 else 3 end,
       image_url  = 'aesop-easy-readers/ch43/p'
                 || (case when t.rn <= 1 then 1 when t.rn <= 2 then 2 else 3 end) || '.jpg'
  from tgt t where s.id = t.id;

-- 后置硬闸 ch43:4 行全配页、恰好 3 页 3 图、页分布必须是 1/1/2
select case
         when count(*) = 4
          and count(distinct s.page_index) = 3
          and count(distinct s.image_url) = 3
          and (count(*) filter (where s.page_index = 1)) = 1
          and (count(*) filter (where s.page_index = 2)) = 1
          and (count(*) filter (where s.page_index = 3)) = 2
           then 'OK 后置 ch43 4 行 3 页 3 图 分布 1/1/2'
         else ('后置断言失败 ch43 行=' || count(*) ||
               ' 页=' || count(distinct s.page_index) ||
               ' 图=' || count(distinct s.image_url) ||
               ' 分布=' || (count(*) filter (where s.page_index = 1)) ||
               '/' || (count(*) filter (where s.page_index = 2)) ||
               '/' || (count(*) filter (where s.page_index = 3)) ||
               ' 期望 4 行 3 页 3 图 分布 1/1/2 已回滚')::int::text
       end as guard_after_ch43
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 43
  and s.page_index is not null;

-- ------------------------------------------------------------------------
-- ch44 《爱慕虚荣的寒鸦》 —— 5 句 → 3 页 2/1/2
--    页1(句1-2)= 朱庇特宣布要给鸟立王 择最美者 · 鸟儿们跑到溪边梳洗整羽
--    页2(句3-4)= 寒鸦自知没指望 等旁的鸟走了 捡起最鲜亮的落羽插满全身
--    页3(句5)  = 宝座前朱庇特正要立他为王 别的鸟把借来的羽毛全拔了下来
--
-- 画面验收要点:
--   ⚠️ **不画围攻**:p3 画的是**之后** —— 借来的羽毛已经散落一地并在空中飘
--      寒鸦独自站在一圈空地板中央 光溜溜但**完好无损、无伤无秃斑**
--      其他鸟远远退在画面边缘各自理自己的毛 没有一只朝他移动 谁也没碰到谁。
--   ① 姿态弧线:寒鸦(站在最边上 明显比谁都灰扑扑 → 半身已插满彩羽 叼着一根 得意
--      → 缩起脖子 翅膀夹紧 闭眼 喙抿成一条线)、
--      朱庇特(抬臂宣布 和蔼 → 不在画面 → 手僵在半空 眉毛高抬 嘴张成小圆)。
--   ② 朱庇特沿用 ch33/ch38 的造型(白须/金桂冠/乳白金边袍)。
--   ③ 五只鸟形色各异(深蓝长尾/白天鹅/胖黄雀/高灰鹤/小寒鸦),三页彼此完整分开。
-- ------------------------------------------------------------------------

-- 前置计数 ch44:应为 5 句、1 段、page_index 全空
select count(*) as ch44_rows,
       count(distinct s.para_idx) as ch44_paras,
       count(s.page_index) as ch44_paged_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 44;

-- 前置硬闸 ch44:句数必须恰好 5
select case
         when count(*) = 5
           then 'OK 前置 ch44 恰好 5 句 硬编码切点成立'
         else ('前置硬闸失败 ch44 句数=' || count(*) ||
               ' 期望 5 正文已变 硬编码切点不再成立 已回滚')::int::text
       end as guard_before_ch44
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 44;

with tgt as (
  select s.id, row_number() over (order by s.seq) as rn
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers' and s.chapter_idx = 44
)
update public.library_sentences s
   set page_index = case when t.rn <= 2 then 1 when t.rn <= 3 then 2 else 3 end,
       image_url  = 'aesop-easy-readers/ch44/p'
                 || (case when t.rn <= 2 then 1 when t.rn <= 3 then 2 else 3 end) || '.jpg'
  from tgt t where s.id = t.id;

-- 后置硬闸 ch44:5 行全配页、恰好 3 页 3 图、页分布必须是 2/1/2
select case
         when count(*) = 5
          and count(distinct s.page_index) = 3
          and count(distinct s.image_url) = 3
          and (count(*) filter (where s.page_index = 1)) = 2
          and (count(*) filter (where s.page_index = 2)) = 1
          and (count(*) filter (where s.page_index = 3)) = 2
           then 'OK 后置 ch44 5 行 3 页 3 图 分布 2/1/2'
         else ('后置断言失败 ch44 行=' || count(*) ||
               ' 页=' || count(distinct s.page_index) ||
               ' 图=' || count(distinct s.image_url) ||
               ' 分布=' || (count(*) filter (where s.page_index = 1)) ||
               '/' || (count(*) filter (where s.page_index = 2)) ||
               '/' || (count(*) filter (where s.page_index = 3)) ||
               ' 期望 5 行 3 页 3 图 分布 2/1/2 已回滚')::int::text
       end as guard_after_ch44
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 44
  and s.page_index is not null;

-- ------------------------------------------------------------------------
-- ch45 《小鹿与母鹿》 —— 4 句 → 3 页 1/2/1
--    页1(句1)  = 母鹿对已长大长壮的小鹿说「老天给了你身板和角 怎么见了猎狗就跑」
--    页2(句2-3)= 正说着听见远处犬吠 · 母鹿「你待着别动 别管我」
--    页3(句4)  = 她撒开腿就跑 要多快有多快
--
-- 画面验收要点:
--   ⚠️ **猎狗自始至终不入画**:只用远处树林边缘的一团浅米色尘土表示
--      加上母鹿竖直转向声源的耳朵。画面里没有任何狗。
--   ① 姿态弧线:母鹿(侧头讲道理 抬蹄比划 一脸不解 → 双耳猛地竖起转向尘土 身子压低
--      前腿绷住 圆眼惊 → 四蹄腾空全速逃 耳朵后贴 身后拖速度线和尘土 已跑到画面最左将出框)、
--      小鹿(低头听 有点难为情 → 直立不动 耳朵也转过去 疑惑看母亲 → 原地一步没动
--      扭头目送 挑眉张口 一脸难以置信)。
--   ② 母鹿**无角**、小鹿**有一对琥珀褐分叉角且体型明显更壮**,三页固定,一眼分得清谁是谁。
--   ③ 两鹿三页零接触、始终隔一大片空地。
-- ------------------------------------------------------------------------

-- 前置计数 ch45:应为 4 句、1 段、page_index 全空
select count(*) as ch45_rows,
       count(distinct s.para_idx) as ch45_paras,
       count(s.page_index) as ch45_paged_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 45;

-- 前置硬闸 ch45:句数必须恰好 4
select case
         when count(*) = 4
           then 'OK 前置 ch45 恰好 4 句 硬编码切点成立'
         else ('前置硬闸失败 ch45 句数=' || count(*) ||
               ' 期望 4 正文已变 硬编码切点不再成立 已回滚')::int::text
       end as guard_before_ch45
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 45;

with tgt as (
  select s.id, row_number() over (order by s.seq) as rn
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers' and s.chapter_idx = 45
)
update public.library_sentences s
   set page_index = case when t.rn <= 1 then 1 when t.rn <= 3 then 2 else 3 end,
       image_url  = 'aesop-easy-readers/ch45/p'
                 || (case when t.rn <= 1 then 1 when t.rn <= 3 then 2 else 3 end) || '.jpg'
  from tgt t where s.id = t.id;

-- 后置硬闸 ch45:4 行全配页、恰好 3 页 3 图、页分布必须是 1/2/1
select case
         when count(*) = 4
          and count(distinct s.page_index) = 3
          and count(distinct s.image_url) = 3
          and (count(*) filter (where s.page_index = 1)) = 1
          and (count(*) filter (where s.page_index = 2)) = 2
          and (count(*) filter (where s.page_index = 3)) = 1
           then 'OK 后置 ch45 4 行 3 页 3 图 分布 1/2/1'
         else ('后置断言失败 ch45 行=' || count(*) ||
               ' 页=' || count(distinct s.page_index) ||
               ' 图=' || count(distinct s.image_url) ||
               ' 分布=' || (count(*) filter (where s.page_index = 1)) ||
               '/' || (count(*) filter (where s.page_index = 2)) ||
               '/' || (count(*) filter (where s.page_index = 3)) ||
               ' 期望 4 行 3 页 3 图 分布 1/2/1 已回滚')::int::text
       end as guard_after_ch45
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 45
  and s.page_index is not null;

-- ------------------------------------------------------------------------
-- ch46 《狐狸与狮子》 —— 3 句 → 3 页 1/1/1
--    页1(句1)= 从没见过狮子的狐狸撞见一头 吓得差点没了命
--    页2(句2)= 第二次碰见 还是怕 可远不像头一回
--    页3(句3)= 第三次径直走上前搭话 像相识多年的老熟人
--
-- 画面验收要点:
--   ① **距离本身就是叙事**:三页狐狸离狮子一页比一页近 —— 画面最左 → 中偏左 → 并排。
--      审图时先量这个距离梯度,不成立就是废图。
--   ② 姿态弧线:狐狸(四腿僵直 蓬尾竖起炸成两倍粗 背毛倒竖 眼珠暴突 大张着嘴
--      → 压低身子试探前伸一爪 耳半后 尾放下不再炸 眼睁大但不暴 → 端坐挺胸 尾松松盘在身边
--      仰头抬爪 眉飞色舞地聊)、狮(站着淡然 → 蹲坐挑眉 → 低头应答 抬爪 眼角笑纹)。
--   ③ 角色一致性:狮=金褐身平涂/琥珀褐圆润鬃毛(简形非写实毛发)/簇尾/大圆眼黑点瞳
--      狐=赭橙身/奶白胸与吻/四腿黑袜/白尖大蓬尾/尖立耳深色尖。
--   ④ 三页人物零接触、始终不重叠(第 3 页并排也留出空隙)。
-- ------------------------------------------------------------------------

-- 前置计数 ch46:应为 3 句、1 段、page_index 全空
select count(*) as ch46_rows,
       count(distinct s.para_idx) as ch46_paras,
       count(s.page_index) as ch46_paged_before
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 46;

-- 前置硬闸 ch46:句数必须恰好 3
select case
         when count(*) = 3
           then 'OK 前置 ch46 恰好 3 句 硬编码切点成立'
         else ('前置硬闸失败 ch46 句数=' || count(*) ||
               ' 期望 3 正文已变 硬编码切点不再成立 已回滚')::int::text
       end as guard_before_ch46
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 46;

with tgt as (
  select s.id, row_number() over (order by s.seq) as rn
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers' and s.chapter_idx = 46
)
update public.library_sentences s
   set page_index = case when t.rn <= 1 then 1 when t.rn <= 2 then 2 else 3 end,
       image_url  = 'aesop-easy-readers/ch46/p'
                 || (case when t.rn <= 1 then 1 when t.rn <= 2 then 2 else 3 end) || '.jpg'
  from tgt t where s.id = t.id;

-- 后置硬闸 ch46:3 行全配页、恰好 3 页 3 图、页分布必须是 1/1/1
select case
         when count(*) = 3
          and count(distinct s.page_index) = 3
          and count(distinct s.image_url) = 3
          and (count(*) filter (where s.page_index = 1)) = 1
          and (count(*) filter (where s.page_index = 2)) = 1
          and (count(*) filter (where s.page_index = 3)) = 1
           then 'OK 后置 ch46 3 行 3 页 3 图 分布 1/1/1'
         else ('后置断言失败 ch46 行=' || count(*) ||
               ' 页=' || count(distinct s.page_index) ||
               ' 图=' || count(distinct s.image_url) ||
               ' 分布=' || (count(*) filter (where s.page_index = 1)) ||
               '/' || (count(*) filter (where s.page_index = 2)) ||
               '/' || (count(*) filter (where s.page_index = 3)) ||
               ' 期望 3 行 3 页 3 图 分布 1/1/1 已回滚')::int::text
       end as guard_after_ch46
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx = 46
  and s.page_index is not null;

-- ------------------------------------------------------------------------
-- 全单收尾自检
-- ------------------------------------------------------------------------

-- 五章后置明细:应为 15 行 —— 每章 3 行 (页号, 句数, 图)
select s.chapter_idx, s.page_index, count(*) as sentences, min(s.image_url) as image_url
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx in (42, 43, 44, 45, 46)
group by s.chapter_idx, s.page_index
order by s.chapter_idx, s.page_index;

-- para_idx 未被改动自检:五章应各仍是 1 段 —— 期望 5 行 且 paras 全为 1
select s.chapter_idx, count(distinct s.para_idx) as paras_after
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx in (42, 43, 44, 45, 46)
group by s.chapter_idx
order by s.chapter_idx;

-- ch47 起零影响自检:期望 0
select count(*) as later_chapters_paged
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.chapter_idx > 46
  and s.page_index is not null;

-- ch1-ch41 未被本单影响自检:期望 41 章(ch32/ch36 是 2 页 2 图 其余 39 章 3 页 3 图)
select count(*) as chapters_1_to_41_ok
from (
  select s.chapter_idx
  from public.library_sentences s
  join public.library_books b on b.id = s.book_id
  where b.book_key = 'aesop-easy-readers'
    and s.chapter_idx between 1 and 41
    and s.page_index is not null
  group by s.chapter_idx
  having count(distinct s.page_index) = count(distinct s.image_url)
     and count(distinct s.page_index) = (case when s.chapter_idx in (32, 36) then 2 else 3 end)
) t;

-- 全书已配页章数自检:期望 46
select count(distinct s.chapter_idx) as paged_chapters_total
from public.library_sentences s
join public.library_books b on b.id = s.book_id
where b.book_key = 'aesop-easy-readers'
  and s.page_index is not null;

commit;
