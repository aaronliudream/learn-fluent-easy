-- def_zh 义项补全(强信号批次)—— 140 词补出第二义
-- 口径:以 ECDICT 为义项基准,只**加**第二义,**第一义项逐字不变**(例句锚定它,本轮不重生成例句)。
-- 另有 139 词判定"无值得教的第二义",不改。
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
  ('ally', '盟友；结盟关系'),
  ('founder', '创始人；沉没'),
  ('sue', '起诉；请求'),
  ('chronic', '慢性的；慢性病患者'),
  ('shrimp', '虾；矮子'),
  ('secular', '世俗的；长期存在'),
  ('specialty', '专长；特产'),
  ('fossil', '化石；陈旧守旧'),
  ('hover', '悬停；盘旋翱翔'),
  ('prosecute', '起诉；彻底进行'),
  ('crab', '螃蟹；捕蟹'),
  ('exile', '流亡；流放'),
  ('merge', '合并；使消失'),
  ('posture', '姿势；态度'),
  ('armor', '盔甲；装甲'),
  ('valve', '阀门；活瓣'),
  ('census', '人口普查；统计调查'),
  ('pasture', '牧场；放牧'),
  ('reef', '珊瑚礁；暗礁'),
  ('terrace', '露台；梯田'),
  ('erode', '侵蚀；物质腐蚀'),
  ('mimic', '模仿；效颦者，模仿者'),
  ('dodge', '躲避；诡计，藏匿'),
  ('conform', '遵守；一致符合'),
  ('merchandise', '商品；交易买卖'),
  ('wholesale', '批发；大规模'),
  ('tariff', '关税；价格表'),
  ('inhibit', '抑制；禁止'),
  ('plight', '困境；宣誓保证'),
  ('default', '默认；违约责任'),
  ('subsidiary', '子公司；辅助机构'),
  ('lust', '欲望；色欲'),
  ('maze', '迷宫；迷惘'),
  ('nickel', '镍；镍币'),
  ('cardiac', '心脏的；贲门的'),
  ('glamour', '魅力；迷惑'),
  ('vapor', '蒸汽；蒸发现象'),
  ('mortar', '砂浆；研钵'),
  ('volcanic', '火山的；猛烈'),
  ('mint', '薄荷；造币厂'),
  ('disarm', '解除武装；缓和局势'),
  ('inflate', '膨胀；通货膨胀'),
  ('overlap', '重叠；重复发生'),
  ('frail', '脆弱的；虚弱之人'),
  ('soothe', '安抚；缓和'),
  ('jelly', '果冻；胶状物'),
  ('opaque', '不透明的；不传热'),
  ('assimilate', '同化；吸收'),
  ('ascend', '上升；攀登'),
  ('sulfur', '硫；硫磺处理'),
  ('magnify', '放大；夸大'),
  ('dent', '凹痕；削弱程度'),
  ('pollen', '花粉；传授花粉'),
  ('permeate', '渗透；弥漫'),
  ('dissipate', '消散；浪费掉'),
  ('manure', '肥料；施肥'),
  ('willow', '柳树；柳木制品'),
  ('clam', '蛤蜊；沉默者'),
  ('avalanche', '雪崩；大量'),
  ('gait', '步态；训练步法'),
  ('scarlet', '猩红色；红衣'),
  ('infiltrate', '渗透；渗透物'),
  ('zinc', '锌；镀锌'),
  ('beacon', '灯塔；烽火'),
  ('daisy', '雏菊；一流人物'),
  ('refund', '退款；偿还'),
  ('defective', '有缺陷的；缺陷者'),
  ('axe', '斧头；削减经费'),
  ('troupe', '剧团；巡回演出'),
  ('fresco', '湿壁画；湿壁画制作'),
  ('meditate', '冥想；沉思反省'),
  ('skyrocket', '急剧上升；焰火'),
  ('ornamental', '装饰性的；观赏植物'),
  ('venom', '毒液；恶意'),
  ('hoax', '骗局；恶作剧'),
  ('flaunt', '炫耀；飘扬'),
  ('starch', '淀粉；上浆'),
  ('embroider', '刺绣；镶边装饰'),
  ('diverge', '分歧；岔开'),
  ('maize', '玉米；黄色的植物'),
  ('effluent', '污水；流出水'),
  ('gradient', '梯度；倾斜度'),
  ('subterranean', '地下的；隐秘的'),
  ('accordion', '手风琴；可折叠物'),
  ('barbarian', '野蛮人；野蛮的'),
  ('sap', '树液；活力'),
  ('varnish', '清漆；粉饰'),
  ('luster', '光泽；光彩荣誉'),
  ('silt', '淤泥；使淤塞'),
  ('relapse', '复发；故态复萌'),
  ('audit', '审计；旁听'),
  ('nurture', '培养；养育'),
  ('asteroid', '小行星；星状'),
  ('commute', '通勤；交换折偿'),
  ('seam', '缝合处；裂痕'),
  ('reptile', '爬行动物；卑鄙之人'),
  ('confiscate', '没收；被没收物'),
  ('subversive', '颠覆性的；破坏分子'),
  ('repel', '击退；使厌恶'),
  ('digestive', '消化的；助消化剂'),
  ('mistrust', '不信任；疑惑'),
  ('raven', '渡鸦；乌黑色'),
  ('mason', '泥瓦匠；共济会会员'),
  ('domesticated', '驯化的；家庭生活者'),
  ('surcharge', '附加费；超载'),
  ('baroque', '巴洛克风格；绮靡俗艳'),
  ('corrosive', '腐蚀性的；有害物质'),
  ('sunburn', '晒伤；晒黑'),
  ('reversible', '可逆的；可撤消'),
  ('sapphire', '蓝宝石；天蓝色'),
  ('consonant', '辅音；一致调和'),
  ('sicken', '使恶心；使厌倦'),
  ('facsimile', '复制品；传真件'),
  ('incubate', '孵化；培养'),
  ('squall', '狂风；飑与喊叫'),
  ('crustacean', '甲壳类动物；甲壳纲'),
  ('crevasse', '冰川裂缝；裂缝'),
  ('lithograph', '平版画；平版印刷'),
  ('perishable', '易腐烂的；易腐坏物品'),
  ('ferret', '雪貂；搜索'),
  ('overcharge', '过高收费；超载'),
  ('lathe', '车床；车床加工'),
  ('ultrasonic', '超声波的；超音速'),
  ('erudite', '博学的；博学之人'),
  ('defrost', '解冻；除霜'),
  ('ragtime', '拉格泰姆音乐；滑稽风格'),
  ('sublimate', '升华；使高尚'),
  ('spanking', '打屁股；清爽疾行'),
  ('defecate', '排便；净化污物'),
  ('rawhide', '生皮；用生皮抽打'),
  ('canter', '慢跑；流浪者'),
  ('thresh', '脱粒；反复推敲'),
  ('fossilize', '使化石化；使陈腐'),
  ('magnetize', '磁化；吸引力'),
  ('overbalance', '失衡；超重'),
  ('fagot', '酒吧；柴把束薪'),
  ('tributary', '支流；纳贡者'),
  ('intestine', '肠；内部的，国内的'),
  ('fowl', '家禽；飞禽'),
  ('indent', '缩进；凹痕')
  ) AS v(headword, def_zh)
 WHERE lower(w.headword) = v.headword;

SELECT 'AFTER' AS stage,
       count(*) FILTER (WHERE def_zh LIKE '%；%') AS two_sense_words,
       count(*) AS total
  FROM vocab_words WHERE def_zh IS NOT NULL;

-- ── count-validate:四行都必须是 t,否则 ROLLBACK ──
SELECT '本批 140 词都已是新值' AS expect,
       (SELECT count(*) FROM vocab_words WHERE lower(headword) IN ('ally', 'founder', 'sue', 'chronic', 'shrimp', 'secular', 'specialty', 'fossil', 'hover', 'prosecute', 'crab', 'exile', 'merge', 'posture', 'armor', 'valve', 'census', 'pasture', 'reef', 'terrace', 'erode', 'mimic', 'dodge', 'conform', 'merchandise', 'wholesale', 'tariff', 'inhibit', 'plight', 'default', 'subsidiary', 'lust', 'maze', 'nickel', 'cardiac', 'glamour', 'vapor', 'mortar', 'volcanic', 'mint', 'disarm', 'inflate', 'overlap', 'frail', 'soothe', 'jelly', 'opaque', 'assimilate', 'ascend', 'sulfur', 'magnify', 'dent', 'pollen', 'permeate', 'dissipate', 'manure', 'willow', 'clam', 'avalanche', 'gait', 'scarlet', 'infiltrate', 'zinc', 'beacon', 'daisy', 'refund', 'defective', 'axe', 'troupe', 'fresco', 'meditate', 'skyrocket', 'ornamental', 'venom', 'hoax', 'flaunt', 'starch', 'embroider', 'diverge', 'maize', 'effluent', 'gradient', 'subterranean', 'accordion', 'barbarian', 'sap', 'varnish', 'luster', 'silt', 'relapse', 'audit', 'nurture', 'asteroid', 'commute', 'seam', 'reptile', 'confiscate', 'subversive', 'repel', 'digestive', 'mistrust', 'raven', 'mason', 'domesticated', 'surcharge', 'baroque', 'corrosive', 'sunburn', 'reversible', 'sapphire', 'consonant', 'sicken', 'facsimile', 'incubate', 'squall', 'crustacean', 'crevasse', 'lithograph', 'perishable', 'ferret', 'overcharge', 'lathe', 'ultrasonic', 'erudite', 'defrost', 'ragtime', 'sublimate', 'spanking', 'defecate', 'rawhide', 'canter', 'thresh', 'fossilize', 'magnetize', 'overbalance', 'fagot', 'tributary', 'intestine', 'fowl', 'indent')
         AND def_zh LIKE '%；%') = 140 AS ok
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
