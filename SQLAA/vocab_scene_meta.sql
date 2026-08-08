-- J 段 · 场景串记 —— 补 category / benefits / drawbacks 三列(**终态写法,可任意重放**)
--
-- 由来:建表 DDL(DONE_vocab_scene_packs_ddl.sql)只落了双档短文和音频,
--       没有「分类」和「好处/弊端」两项 —— 而 PR-12 前端的
--       五分类筛选(列表页)和 Benefits/Drawbacks 双色卡(详情页第 ③ 段)都要它们。
--       内容本身在 J 段就生成好了(scripts/vocab/data/generated/scenes.json),
--       这里只是把已有内容补进库,不新造任何内容。
--
-- ⚠️ 由 Aaron 执行。**PR-12 前端合并前跑**——不跑的话页面不会崩(前端有降级),
--    但筛选钮会全灰、Benefits/Drawbacks 卡整段不出现。
-- ⚠️ 幂等:ADD COLUMN IF NOT EXISTS + 按 title_zh 定位 UPDATE,可任意重放。
-- ⚠️ 不碰 is_published、不碰任何既有列、不碰 vocab_scene_items。
--
-- 分类分布(本次实测自 scenes.json,共 30 个场景):
--   日常生活 8
--   校园学习 6
--   工作职场 6
--   出行旅游 6
--   社会科技 4

BEGIN;

-- 改前计数
SELECT '改前 · 场景总数' AS label, count(*) AS n FROM vocab_scene_packs;

ALTER TABLE vocab_scene_packs ADD COLUMN IF NOT EXISTS category  text;
ALTER TABLE vocab_scene_packs ADD COLUMN IF NOT EXISTS benefits  text[];
ALTER TABLE vocab_scene_packs ADD COLUMN IF NOT EXISTS drawbacks text[];

-- category 只允许这五个值 —— 前端筛选钮硬编码同一套,库里冒出第六个值会静默漏掉整类场景
ALTER TABLE vocab_scene_packs DROP CONSTRAINT IF EXISTS vocab_scene_packs_category_chk;
ALTER TABLE vocab_scene_packs ADD CONSTRAINT vocab_scene_packs_category_chk
  CHECK (category IS NULL OR category IN ('日常生活', '校园学习', '工作职场', '出行旅游', '社会科技'));

UPDATE vocab_scene_packs p SET
  category   = v.category,
  benefits   = v.benefits,
  drawbacks  = v.drawbacks,
  updated_at = now()
FROM (VALUES
  ('网络购物', '日常生活', ARRAY['convenience', 'wide selection', 'time-saving']::text[], ARRAY['impersonal experience', 'shipping delays', 'difficult returns']::text[]),
  ('租房搬家', '日常生活', ARRAY['more living space', 'independent lifestyle', 'experience a new environment']::text[], ARRAY['high moving costs', 'adjustment challenges', 'potential noise issues']::text[]),
  ('超市采购', '日常生活', ARRAY['time saver', 'get discounts', 'stay organized']::text[], ARRAY['items out of stock', 'forget the list', 'long lines']::text[]),
  ('看病就医', '日常生活', ARRAY['early detection of diseases', 'personalized treatment', 'professional advice']::text[], ARRAY['time-consuming', 'expensive', 'side effects from medication']::text[]),
  ('在餐厅点餐', '日常生活', ARRAY['convenient dining experience', 'variety of food options', 'social interaction']::text[], ARRAY['expensive', 'limited control over ingredients', 'potential wait times']::text[]),
  ('点外卖', '日常生活', ARRAY['convenient and fast', 'variety of options', 'time-saving']::text[], ARRAY['extra cost', 'temperature issues', 'uncertain wait times']::text[]),
  ('手机套餐与换运营商', '日常生活', ARRAY['higher data allowance', 'avoid overage charges', 'lower roaming fees']::text[], ARRAY['switching carriers hassle', 'poor network coverage', 'potential hidden fees']::text[]),
  ('邻里噪音纠纷', '日常生活', ARRAY['Improved quality of life', 'Better sleep', 'Enhanced communication']::text[], ARRAY['Strained relationships', 'Time-consuming process', 'Potential for escalation']::text[]),
  ('选课与退课', '校园学习', ARRAY['Flexibility in schedule', 'Ability to explore interests', 'Manageable academic workload']::text[], ARRAY['Potential for schedule conflicts', 'Risk of dropping necessary courses', 'Stress from decision-making']::text[]),
  ('小组作业', '校园学习', ARRAY['enhanced communication skills', 'teamwork development', 'boosted creative thinking']::text[], ARRAY['time management challenges', 'prone to conflicts', 'uneven responsibility distribution']::text[]),
  ('图书馆借还书', '校园学习', ARRAY['Access to a wide range of books', 'Quiet study environment', 'Free educational resources']::text[], ARRAY['Limited book availability', 'Overdue fines', 'Restricted borrowing periods']::text[]),
  ('论文写作与查重', '校园学习', ARRAY['enhanced organizational skills', 'accurate citation practices', 'preventing academic misconduct']::text[], ARRAY['time-consuming process', 'inaccurate plagiarism detection', 'overreliance on technology']::text[]),
  ('考前复习', '校园学习', ARRAY['Improved time management', 'Better retention of information', 'Reduced exam anxiety']::text[], ARRAY['Potential for burnout', 'Time-consuming', 'Over-reliance on old exams']::text[]),
  ('找导师改论文', '校园学习', ARRAY['gain new insights', 'enhance writing skills', 'build mentor relationship']::text[], ARRAY['time-consuming', 'potential discouragement', 'over-dependence']::text[]),
  ('求职面试', '工作职场', ARRAY['Career advancement opportunities', 'Increased financial stability', 'Networking opportunities']::text[], ARRAY['Time-consuming process', 'Risk of rejection', 'High pressure during interviews']::text[]),
  ('第一天上班', '工作职场', ARRAY['broaden your network', 'learn new skills', 'increase earning potential']::text[], ARRAY['stressful adaptation period', 'uncertain job security', 'work-life balance challenges']::text[]),
  ('开会与汇报', '工作职场', ARRAY['Encourages open communication', 'Facilitates problem-solving', 'Ensures accountability']::text[], ARRAY['Time-consuming', 'Potential for conflict', 'May lack focus']::text[]),
  ('远程与混合办公', '工作职场', ARRAY['Flexibility in schedule', 'Reduced commute time', 'Access to global talent']::text[], ARRAY['Isolation from colleagues', 'Difficulty in communication', 'Potential overworking']::text[]),
  ('加薪与升职', '工作职场', ARRAY['financial stability', 'increased motivation', 'enhanced reputation']::text[], ARRAY['increased stress', 'work-life imbalance', 'higher expectations']::text[]),
  ('辞职交接', '工作职场', ARRAY['career growth potential', 'emotional closure', 'network expansion']::text[], ARRAY['financial instability', 'stress of adapting', 'loss of current benefits']::text[]),
  ('订机票与值机', '出行旅游', ARRAY['convenience of online booking', 'access to multiple airlines', 'often cheaper than traditional agents']::text[], ARRAY['connection flights increase travel time', 'risk of missing connections', 'potential for flight delays']::text[]),
  ('过海关入境', '出行旅游', ARRAY['Efficient processing', 'Clear guidelines', 'Improved security']::text[], ARRAY['Long wait times', 'Complex procedures', 'Possibility of errors']::text[]),
  ('酒店入住', '出行旅游', ARRAY['convenient location', 'variety of services', 'comfortable stay']::text[], ARRAY['unexpected charges', 'noisy environment', 'limited availability']::text[]),
  ('城市交通', '出行旅游', ARRAY['time-saving', 'cost-effective', 'eco-friendly travel']::text[], ARRAY['traffic congestion', 'unpredictable timing', 'inconvenient routes']::text[]),
  ('旅途出岔子', '出行旅游', ARRAY['flexibility in plans', 'financial protection', 'peace of mind']::text[], ARRAY['additional costs', 'time-consuming process', 'limited coverage']::text[]),
  ('租车与事故处理', '出行旅游', ARRAY['convenient and quick', 'flexible vehicle options', 'no long-term commitment']::text[], ARRAY['additional fees', 'complex insurance', 'potential damage liability']::text[]),
  ('社交媒体', '社会科技', ARRAY['expand your network', 'stay updated', 'boost brand presence']::text[], ARRAY['information overload', 'privacy risks', 'cyberbullying']::text[]),
  ('网上支付与诈骗', '社会科技', ARRAY['convenient and fast', 'enhanced transaction security', 'real-time transaction records']::text[], ARRAY['risk of identity theft', 'financial loss', 'account freezing']::text[]),
  ('垃圾分类与环保', '社会科技', ARRAY['reduce landfill waste', 'lower carbon footprint', 'conserve natural resources']::text[], ARRAY['high initial cost', 'time and effort required', 'potential for mis-sorting']::text[]),
  ('人工智能进课堂', '社会科技', ARRAY['Increases efficiency', 'Enhances creativity', 'Provides instant feedback']::text[], ARRAY['May reduce critical thinking', 'Potential for misinformation', 'Risk of plagiarism']::text[])
) AS v(title_zh, category, benefits, drawbacks)
WHERE p.title_zh = v.title_zh;

-- ── count-validate:五行都必须是 t ──
SELECT '三列都已建' AS expect,
       (SELECT count(*) FROM information_schema.columns
         WHERE table_name = 'vocab_scene_packs'
           AND column_name IN ('category', 'benefits', 'drawbacks')) = 3 AS ok
UNION ALL
SELECT '30 个场景 category 全部非空',
       (SELECT count(*) FROM vocab_scene_packs WHERE category IS NOT NULL) = 30
UNION ALL
SELECT 'benefits / drawbacks 全部非空且每项至少 2 条',
       (SELECT count(*) FROM vocab_scene_packs
         WHERE coalesce(array_length(benefits, 1), 0) >= 2
           AND coalesce(array_length(drawbacks, 1), 0) >= 2) = 30
UNION ALL
SELECT 'category 恰好五类',
       (SELECT count(DISTINCT category) FROM vocab_scene_packs WHERE category IS NOT NULL) = 5
UNION ALL
SELECT '没有场景漏更新(title_zh 全部对上)',
       (SELECT count(*) FROM vocab_scene_packs WHERE category IS NULL) = 0;

-- 改后计数 + 分类分布(应与文件头注释一致)
SELECT '改后 · 分类分布' AS label, category, count(*) AS n
  FROM vocab_scene_packs GROUP BY category ORDER BY category;

COMMIT;
