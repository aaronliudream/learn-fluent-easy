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
SELECT '本批 67 词都已是新值' AS expect,
       (SELECT count(*) FROM vocab_words WHERE lower(headword) IN ('ally', 'founder', 'sue', 'shrimp', 'secular', 'specialty', 'fossil', 'prosecute', 'exile', 'merge', 'posture', 'reservoir', 'valve', 'terrace', 'dodge', 'merchandise', 'wholesale', 'tariff', 'default', 'subsidiary', 'nickel', 'mortar', 'volcanic', 'mint', 'disarm', 'inflate', 'jelly', 'assimilate', 'magnify', 'dent', 'permeate', 'dissipate', 'clam', 'avalanche', 'beacon', 'axe', 'skyrocket', 'ornamental', 'venom', 'hoax', 'starch', 'subterranean', 'sap', 'varnish', 'relapse', 'audit', 'commute', 'reptile', 'repel', 'raven', 'mason', 'surcharge', 'baroque', 'sapphire', 'consonant', 'sicken', 'facsimile', 'incubate', 'monochrome', 'squall', 'ferret', 'defrost', 'thresh', 'fossilize', 'magnetize', 'tributary', 'indent')
         AND def_zh LIKE '%；%') = 67 AS ok
UNION ALL
SELECT '总词数没变(4471)',
       (SELECT count(*) FROM vocab_words WHERE def_zh IS NOT NULL) = 4471
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
