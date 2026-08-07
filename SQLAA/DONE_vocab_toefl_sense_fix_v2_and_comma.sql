-- ✅ DONE 2026-08-07 已执行,库内实证:def_zh 含逗号/顿号的 0 行
-- ═══════════════════════════════════════════════════════════════
-- 义项对账终版(修复版)+ def_zh 逗号分隔符修正 · 合并交跑
--
-- ⚠️ 上一版 sense_fix 跑出两条 false。已查明:**数据全对、事务已提交、无半提交**。
--    用 anon 只读逐词比对 306 词,0 差异(DB_VERIFY_VERDICT: PASS)。
--    两条 false 都是我的判据写错:
--      ① 「本批 N 词都已是新值」用「含分号的条数 = N」当判据 ——
--         monochrome 的裁决新值「单色」是单义、没有分号,必然少 1。
--         已改为**逐词比对实际值**(VALUES join,一个字都不许差)。
--         计数式判据在本批内部有例外时天然失效,逐值比对才是真判据。
--      ② 「总词数没变(4471)」—— fagot 已被移除,基准是 4470,我忘了同步。
--         已改为**不依赖绝对数**:只断言本批没把任何词的 def_zh 弄丢。
--         绝对数会随别的 SQL 变动而失效,这种耦合迟早再咬一次。
--
-- 新判据已在线上干跑核对(纯 SELECT):两条都是 t;
-- 同时确认旧判据②在当前库确实是 false(4471≠4470),诊断成立。
--
-- 两段各自 BEGIN/COMMIT,都幂等。第一段实际上是空操作(数据已在库),
-- 留着是为了让这个文件自洽可重放。前段 validate 全 t 再跑后段。
-- ⚠️ 由 Aaron 执行。
-- ═══════════════════════════════════════════════════════════════

-- def_zh 义项补全(强信号批次)—— 67 词补出第二义
-- 口径:以 ECDICT 为义项基准,只**加**第二义,**第一义项逐字不变**(例句锚定它,本轮不重生成例句)。
-- 另有 212 词判定"无值得教的第二义",不改。
-- 闸门 s1(第一义不变)/ s2(第二义有词典依据)/ s3(体裁 ≤8 字)全量复检 0 不合格。
-- 对照件:REVIEWAA/vocab_toefl_sense_fix_sample.md
-- ⚠️ 由 Aaron 执行。

BEGIN;

SELECT 'BEFORE' AS stage,
       count(*) FILTER (WHERE def_zh LIKE '%；%') AS two_sense_words,
       count(*) AS total
  FROM vocab_words WHERE def_zh IS NOT NULL;

UPDATE vocab_words w
   SET def_zh = v.def_zh, updated_at = now()
  FROM (VALUES
  ('ally', '盟友；结盟'),
  ('founder', '创始人；沉没'),
  ('sue', '起诉；请求'),
  ('shrimp', '虾；矮子'),
  ('secular', '世俗的；长期存在'),
  ('specialty', '专长；特产'),
  ('fossil', '化石；老古董'),
  ('prosecute', '起诉；彻底进行'),
  ('exile', '流亡；流放'),
  ('merge', '合并；使消失'),
  ('posture', '姿势；态度'),
  ('reservoir', '水库；贮藏处'),
  ('valve', '阀门；活瓣'),
  ('terrace', '露台；梯田'),
  ('dodge', '躲避；花招'),
  ('merchandise', '商品；交易买卖'),
  ('wholesale', '批发；大规模'),
  ('tariff', '关税；价格表'),
  ('default', '默认；违约'),
  ('subsidiary', '子公司；辅助的'),
  ('nickel', '镍；镍币'),
  ('mortar', '砂浆；研钵'),
  ('volcanic', '火山的；猛烈的'),
  ('mint', '薄荷；造币厂'),
  ('disarm', '解除武装；缓和局势'),
  ('inflate', '膨胀；通货膨胀'),
  ('jelly', '果冻；胶状物'),
  ('assimilate', '同化；吸收'),
  ('magnify', '放大；夸大'),
  ('dent', '凹痕；削弱'),
  ('permeate', '渗透；弥漫'),
  ('dissipate', '消散；浪费掉'),
  ('clam', '蛤蜊；沉默者'),
  ('avalanche', '雪崩；大量'),
  ('beacon', '灯塔；烽火'),
  ('axe', '斧头；削减经费'),
  ('skyrocket', '急剧上升；焰火'),
  ('ornamental', '装饰性的；观赏植物'),
  ('venom', '毒液；恶意'),
  ('hoax', '骗局；恶作剧'),
  ('starch', '淀粉；上浆'),
  ('subterranean', '地下的；隐秘的'),
  ('sap', '树液；削弱'),
  ('varnish', '清漆；粉饰'),
  ('relapse', '复发；故态复萌'),
  ('audit', '审计；旁听'),
  ('commute', '通勤；减刑'),
  ('reptile', '爬行动物；卑鄙之人'),
  ('repel', '击退；使厌恶'),
  ('raven', '渡鸦；乌黑色'),
  ('mason', '泥瓦匠；共济会会员'),
  ('surcharge', '附加费；超载'),
  ('baroque', '巴洛克风格；绮靡的'),
  ('sapphire', '蓝宝石；天蓝色'),
  ('consonant', '辅音；一致的'),
  ('sicken', '使恶心；使厌倦'),
  ('facsimile', '复制品；传真件'),
  ('incubate', '孵化；培养'),
  ('monochrome', '单色'),
  ('squall', '狂风；尖叫'),
  ('ferret', '雪貂；搜索'),
  ('defrost', '解冻；除霜'),
  ('thresh', '脱粒；反复推敲'),
  ('fossilize', '使化石化；使陈腐'),
  ('magnetize', '磁化；吸引'),
  ('tributary', '支流；纳贡者'),
  ('indent', '缩进；凹痕')
  ) AS v(headword, def_zh)
 WHERE lower(w.headword) = v.headword;

SELECT 'AFTER' AS stage,
       count(*) FILTER (WHERE def_zh LIKE '%；%') AS two_sense_words,
       count(*) AS total
  FROM vocab_words WHERE def_zh IS NOT NULL;

-- ── count-validate:四行都必须是 t,否则 ROLLBACK ──
/* ⚠️ 这一条原来写的是「count(... AND def_zh LIKE '%；%') = N」,实测报 false。
 *    不是数据错,是**判据错**:monochrome 的裁决新值是「单色」,单义、没有分号,
 *    于是"含分号的条数"必然比"本批条数"少 1。
 *    改成**逐词比对实际值**:把期望值当 VALUES join 回去,一个字都不许差。
 *    计数式判据在"本批内部有例外"时天然失效,逐值比对才是真判据。 */
SELECT '本批 67 词逐词与裁决一致' AS expect,
       NOT EXISTS (
         SELECT 1
           FROM (VALUES
             ('ally', '盟友；结盟'),
             ('founder', '创始人；沉没'),
             ('sue', '起诉；请求'),
             ('shrimp', '虾；矮子'),
             ('secular', '世俗的；长期存在'),
             ('specialty', '专长；特产'),
             ('fossil', '化石；老古董'),
             ('prosecute', '起诉；彻底进行'),
             ('exile', '流亡；流放'),
             ('merge', '合并；使消失'),
             ('posture', '姿势；态度'),
             ('reservoir', '水库；贮藏处'),
             ('valve', '阀门；活瓣'),
             ('terrace', '露台；梯田'),
             ('dodge', '躲避；花招'),
             ('merchandise', '商品；交易买卖'),
             ('wholesale', '批发；大规模'),
             ('tariff', '关税；价格表'),
             ('default', '默认；违约'),
             ('subsidiary', '子公司；辅助的'),
             ('nickel', '镍；镍币'),
             ('mortar', '砂浆；研钵'),
             ('volcanic', '火山的；猛烈的'),
             ('mint', '薄荷；造币厂'),
             ('disarm', '解除武装；缓和局势'),
             ('inflate', '膨胀；通货膨胀'),
             ('jelly', '果冻；胶状物'),
             ('assimilate', '同化；吸收'),
             ('magnify', '放大；夸大'),
             ('dent', '凹痕；削弱'),
             ('permeate', '渗透；弥漫'),
             ('dissipate', '消散；浪费掉'),
             ('clam', '蛤蜊；沉默者'),
             ('avalanche', '雪崩；大量'),
             ('beacon', '灯塔；烽火'),
             ('axe', '斧头；削减经费'),
             ('skyrocket', '急剧上升；焰火'),
             ('ornamental', '装饰性的；观赏植物'),
             ('venom', '毒液；恶意'),
             ('hoax', '骗局；恶作剧'),
             ('starch', '淀粉；上浆'),
             ('subterranean', '地下的；隐秘的'),
             ('sap', '树液；削弱'),
             ('varnish', '清漆；粉饰'),
             ('relapse', '复发；故态复萌'),
             ('audit', '审计；旁听'),
             ('commute', '通勤；减刑'),
             ('reptile', '爬行动物；卑鄙之人'),
             ('repel', '击退；使厌恶'),
             ('raven', '渡鸦；乌黑色'),
             ('mason', '泥瓦匠；共济会会员'),
             ('surcharge', '附加费；超载'),
             ('baroque', '巴洛克风格；绮靡的'),
             ('sapphire', '蓝宝石；天蓝色'),
             ('consonant', '辅音；一致的'),
             ('sicken', '使恶心；使厌倦'),
             ('facsimile', '复制品；传真件'),
             ('incubate', '孵化；培养'),
             ('monochrome', '单色'),
             ('squall', '狂风；尖叫'),
             ('ferret', '雪貂；搜索'),
             ('defrost', '解冻；除霜'),
             ('thresh', '脱粒；反复推敲'),
             ('fossilize', '使化石化；使陈腐'),
             ('magnetize', '磁化；吸引'),
             ('tributary', '支流；纳贡者'),
             ('indent', '缩进；凹痕')
           ) AS v(headword, def_zh)
           JOIN vocab_words w ON lower(w.headword) = v.headword
          WHERE w.def_zh IS DISTINCT FROM v.def_zh
       ) AS ok
UNION ALL
/* ⚠️ 原来硬编码 4471,实测报 false —— fagot 已被 vocab_toefl_remove_fagot.sql
 *    移除(def_zh 置 NULL),基准变成 4470,而我忘了同步。
 *    改成**不依赖绝对数**:只断言本批没有把任何词的 def_zh 弄丢。
 *    绝对数会随别的 SQL 变动而失效,这种耦合迟早再咬一次。 */
SELECT '本批没有把任何词的 def_zh 弄丢',
       NOT EXISTS (
         SELECT 1 FROM vocab_words
          WHERE lower(headword) IN ('ally', 'founder', 'sue', 'shrimp', 'secular', 'specialty', 'fossil', 'prosecute', 'exile', 'merge', 'posture', 'reservoir', 'valve', 'terrace', 'dodge', 'merchandise', 'wholesale', 'tariff', 'default', 'subsidiary', 'nickel', 'mortar', 'volcanic', 'mint', 'disarm', 'inflate', 'jelly', 'assimilate', 'magnify', 'dent', 'permeate', 'dissipate', 'clam', 'avalanche', 'beacon', 'axe', 'skyrocket', 'ornamental', 'venom', 'hoax', 'starch', 'subterranean', 'sap', 'varnish', 'relapse', 'audit', 'commute', 'reptile', 'repel', 'raven', 'mason', 'surcharge', 'baroque', 'sapphire', 'consonant', 'sicken', 'facsimile', 'incubate', 'monochrome', 'squall', 'ferret', 'defrost', 'thresh', 'fossilize', 'magnetize', 'tributary', 'indent')
            AND def_zh IS NULL
       )
UNION ALL
SELECT '没有义项超 8 字',
       NOT EXISTS (
         SELECT 1 FROM vocab_words, unnest(string_to_array(def_zh, '；')) AS seg
          WHERE def_zh IS NOT NULL AND char_length(trim(seg)) > 8
       )
UNION ALL
SELECT '没有义项数超过 2',
       NOT EXISTS (
         SELECT 1 FROM vocab_words
          WHERE def_zh IS NOT NULL
            AND array_length(string_to_array(def_zh, '；'), 1) > 2
       );

COMMIT;


-- def_zh 逗号分隔符修正 —— 43 条
--
-- 问题:这些条目用**逗号/顿号**当义项分隔符,而规格里分隔符只能是全角分号。
-- 后果不是排版,是**绕过体裁闸**:「单色，单色图像」在闸门眼里是一个 7 字义项,
-- 「≤2 义项」那条约束形同虚设,双义统计也偏低,
-- 前端 optionText 只按分号切,选项里会整个显示「推，挤」。
-- 闸门已修(逗号一律拒)。本文件清存量。
--
-- ⚠️ 处理方式按 Aaron 裁决,**不是"一律只留第一个"** ——
--    那会造出一批 1 字义项(推 / 拖 / 砍),违反"每义项 2-8 字"的下限。
--    改双字词典体 11 条 / 混用规范分隔 2 条 / 留第一义 30 条。
--
-- 每条新值都过了 defZhShapeProblem(含新加的"禁逗号"),人裁条目不免检。
-- 幂等:按 lower(headword) UPDATE。⚠️ 由 Aaron 执行。
--
-- ⚠️ **BEFORE 那行会显示 42 不是 43,这是对的**:monochrome 原值「单色，单色图像」
--    已被上一段 sense_fix 改成「单色」,不再含逗号。本文件里它那条是 no-op
--    (留第一义算出来还是「单色」)。清单仍按 43 条走,是为了让这个文件
--    在任何执行顺序下都自洽 —— 先跑哪个都得到同样的终态。

BEGIN;

SELECT 'BEFORE' AS stage,
       count(*) FILTER (WHERE def_zh ~ '[，,、]') AS with_comma
  FROM vocab_words WHERE def_zh IS NOT NULL;

UPDATE vocab_words w
   SET def_zh = v.def_zh, updated_at = now()
  FROM (VALUES
  ('shove', '猛推'),
  ('chunk', '大块'),
  ('autonomy', '自主'),
  ('formulate', '制定'),
  ('obsessed', '着迷的'),
  ('tow', '拖曳'),
  ('receptive', '接受的'),
  ('unearth', '发掘'),
  ('unpack', '拆开'),
  ('ration', '配给'),
  ('lug', '搬运；拖曳'),
  ('incense', '熏香'),
  ('juxtaposition', '并列'),
  ('bedrock', '基础'),
  ('quail', '鹌鹑；胆怯'),
  ('melancholy', '忧郁'),
  ('fruitless', '徒劳的'),
  ('eccentricity', '古怪'),
  ('homage', '致敬'),
  ('synthesize', '合成'),
  ('exude', '散发'),
  ('ranching', '牧场经营'),
  ('jettison', '抛弃'),
  ('elation', '欢欣'),
  ('infest', '滋扰'),
  ('forerunner', '先驱'),
  ('hew', '砍伐'),
  ('monochrome', '单色'),
  ('canny', '精明的'),
  ('reclamation', '复垦'),
  ('plumage', '羽毛'),
  ('apportion', '分配'),
  ('hominid', '人科动物'),
  ('figment', '虚构'),
  ('capacious', '宽敞的'),
  ('propound', '提出'),
  ('convivial', '欢快的'),
  ('antedate', '早于'),
  ('convoke', '召集'),
  ('frowzy', '邋遢的'),
  ('indite', '撰写'),
  ('oxen', '公牛'),
  ('deport', '驱逐')
  ) AS v(headword, def_zh)
 WHERE lower(w.headword) = v.headword;

SELECT 'AFTER' AS stage,
       count(*) FILTER (WHERE def_zh ~ '[，,、]') AS with_comma
  FROM vocab_words WHERE def_zh IS NOT NULL;

-- ── count-validate:四行都必须是 t,否则 ROLLBACK ──
SELECT '全库 def_zh 不再含逗号/顿号' AS expect,
       NOT EXISTS (SELECT 1 FROM vocab_words WHERE def_zh ~ '[，,、]') AS ok
UNION ALL
SELECT '没有义项短于 2 字',
       NOT EXISTS (
         SELECT 1 FROM vocab_words, unnest(string_to_array(def_zh, '；')) AS seg
          WHERE def_zh IS NOT NULL AND char_length(btrim(seg)) < 2
       )
UNION ALL
SELECT '没有义项超过 8 字',
       NOT EXISTS (
         SELECT 1 FROM vocab_words, unnest(string_to_array(def_zh, '；')) AS seg
          WHERE def_zh IS NOT NULL AND char_length(btrim(seg)) > 8
       )
UNION ALL
SELECT '本批 43 词都已是新值',
       (SELECT count(*) FROM vocab_words
         WHERE lower(headword) IN ('shove', 'chunk', 'autonomy', 'formulate', 'obsessed', 'tow', 'receptive', 'unearth', 'unpack', 'ration', 'lug', 'incense', 'juxtaposition', 'bedrock', 'quail', 'melancholy', 'fruitless', 'eccentricity', 'homage', 'synthesize', 'exude', 'ranching', 'jettison', 'elation', 'infest', 'forerunner', 'hew', 'monochrome', 'canny', 'reclamation', 'plumage', 'apportion', 'hominid', 'figment', 'capacious', 'propound', 'convivial', 'antedate', 'convoke', 'frowzy', 'indite', 'oxen', 'deport')
           AND def_zh !~ '[，,、]') = 43;

COMMIT;
