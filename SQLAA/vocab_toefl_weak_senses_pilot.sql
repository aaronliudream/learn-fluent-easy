-- ═══════════════════════════════════════════════════════════
-- ⚠️⚠️ 归档留痕,**不要执行** ⚠️⚠️
--
-- 弱信号 1290 义项补全**整段已放弃**(Aaron 2026-08-06 结案)。
-- 理由:预筛 1290 → 462 之后,抽检发现真「两种不同用法」只有个位数量级
--       (cite 型),为此改动 462 条**已上线内容**、耗人审、担回滚风险,
--       投入产出严重倒挂。当初押后弱信号的判断成立,现在正式结案。
-- cite 型例外走常设清单 scripts/vocab/data/sense-suggestions.json,攒批处理。
-- 本文件与 rollback 一并保留仅为留痕。
-- ═══════════════════════════════════════════════════════════

-- 弱信号义项补全 · 试点 —— 53 词补出第二义
-- 预筛:1290 → 462(字集重合 211 / 互为子串 2 / 英文释义反查 615),试点抽 462 条。
-- ⚠️ **改的是已上线内容**。跑之前请确认已保留 vocab_toefl_weak_senses_rollback.sql。
-- ⚠️ 第一义逐字不变(例句锚定它,不重生成例句)。
-- 由 Aaron 执行。

BEGIN;

UPDATE vocab_words w SET def_zh = v.def_zh, updated_at = now()
  FROM (VALUES
  ('concerned', '担忧的；关心的'),
  ('cite', '引用；表彰'),
  ('championship', '锦标赛；冠军身份'),
  ('retirement', '退休；隐居'),
  ('administrator', '管理员；行政官'),
  ('testimony', '证词；声明'),
  ('infection', '感染；影响'),
  ('constitutional', '宪法的；体质的'),
  ('emission', '排放物；发射'),
  ('galaxy', '星系；银河'),
  ('dramatically', '显著地；戏剧地'),
  ('presidency', '总统职务或任期；总裁职位'),
  ('allegation', '指控；断言'),
  ('monster', '怪物；恶人'),
  ('recession', '经济衰退；凹处'),
  ('amendment', '修正案；改善'),
  ('corruption', '腐败；堕落'),
  ('dedicate', '致力于；献出'),
  ('counterpart', '对应物；副本'),
  ('exploration', '探索；踏勘'),
  ('accounting', '会计；帐单'),
  ('inflation', '通货膨胀；夸张'),
  ('ideological', '意识形态的；空想的'),
  ('conspiracy', '阴谋；同谋'),
  ('touchdown', '触地得分；着陆'),
  ('anonymous', '匿名的；姓氏不详的'),
  ('banker', '银行家；庄家'),
  ('sensitivity', '敏感性；灵敏度'),
  ('genre', '类型；流派'),
  ('migration', '迁移；移民'),
  ('depressed', '沮丧的；降低的'),
  ('butt', '臀部；粗大的一头'),
  ('threshold', '阈值；门槛'),
  ('landmark', '地标；划时代的事'),
  ('devastating', '毁灭性的；很好的'),
  ('citizenship', '公民身份；市民权'),
  ('nominate', '提名；任命'),
  ('skeptical', '怀疑的；不可知论的'),
  ('consistency', '一致性；黏稠度'),
  ('rejection', '拒绝；抛弃'),
  ('evoke', '唤起；召(魂)'),
  ('intervene', '干预；插入'),
  ('cult', '邪教；膜拜'),
  ('odor', '气味；名声'),
  ('freshly', '新鲜地；精神饱满'),
  ('venue', '场所；犯罪地点'),
  ('flaw', '缺陷；裂纹'),
  ('monopoly', '垄断；专卖权'),
  ('courthouse', '法庭；郡政府所在地'),
  ('artery', '动脉；干道'),
  ('denounce', '谴责；告发'),
  ('membrane', '膜；羊皮纸'),
  ('genus', '属；类')
  ) AS v(headword, def_zh)
 WHERE lower(w.headword) = v.headword;

-- ── count-validate:三行都必须是 t,否则 ROLLBACK ──
SELECT '本批 53 词逐词与产出一致' AS expect,
       NOT EXISTS (
         SELECT 1 FROM (VALUES
           ('concerned', '担忧的；关心的'),
           ('cite', '引用；表彰'),
           ('championship', '锦标赛；冠军身份'),
           ('retirement', '退休；隐居'),
           ('administrator', '管理员；行政官'),
           ('testimony', '证词；声明'),
           ('infection', '感染；影响'),
           ('constitutional', '宪法的；体质的'),
           ('emission', '排放物；发射'),
           ('galaxy', '星系；银河'),
           ('dramatically', '显著地；戏剧地'),
           ('presidency', '总统职务或任期；总裁职位'),
           ('allegation', '指控；断言'),
           ('monster', '怪物；恶人'),
           ('recession', '经济衰退；凹处'),
           ('amendment', '修正案；改善'),
           ('corruption', '腐败；堕落'),
           ('dedicate', '致力于；献出'),
           ('counterpart', '对应物；副本'),
           ('exploration', '探索；踏勘'),
           ('accounting', '会计；帐单'),
           ('inflation', '通货膨胀；夸张'),
           ('ideological', '意识形态的；空想的'),
           ('conspiracy', '阴谋；同谋'),
           ('touchdown', '触地得分；着陆'),
           ('anonymous', '匿名的；姓氏不详的'),
           ('banker', '银行家；庄家'),
           ('sensitivity', '敏感性；灵敏度'),
           ('genre', '类型；流派'),
           ('migration', '迁移；移民'),
           ('depressed', '沮丧的；降低的'),
           ('butt', '臀部；粗大的一头'),
           ('threshold', '阈值；门槛'),
           ('landmark', '地标；划时代的事'),
           ('devastating', '毁灭性的；很好的'),
           ('citizenship', '公民身份；市民权'),
           ('nominate', '提名；任命'),
           ('skeptical', '怀疑的；不可知论的'),
           ('consistency', '一致性；黏稠度'),
           ('rejection', '拒绝；抛弃'),
           ('evoke', '唤起；召(魂)'),
           ('intervene', '干预；插入'),
           ('cult', '邪教；膜拜'),
           ('odor', '气味；名声'),
           ('freshly', '新鲜地；精神饱满'),
           ('venue', '场所；犯罪地点'),
           ('flaw', '缺陷；裂纹'),
           ('monopoly', '垄断；专卖权'),
           ('courthouse', '法庭；郡政府所在地'),
           ('artery', '动脉；干道'),
           ('denounce', '谴责；告发'),
           ('membrane', '膜；羊皮纸'),
           ('genus', '属；类')
         ) AS v(headword, def_zh)
         JOIN vocab_words w ON lower(w.headword) = v.headword
         WHERE w.def_zh IS DISTINCT FROM v.def_zh
       ) AS ok
UNION ALL
SELECT '本批没把任何词的 def_zh 弄丢',
       NOT EXISTS (SELECT 1 FROM vocab_words
                    WHERE lower(headword) IN ('concerned', 'cite', 'championship', 'retirement', 'administrator', 'testimony', 'infection', 'constitutional', 'emission', 'galaxy', 'dramatically', 'presidency', 'allegation', 'monster', 'recession', 'amendment', 'corruption', 'dedicate', 'counterpart', 'exploration', 'accounting', 'inflation', 'ideological', 'conspiracy', 'touchdown', 'anonymous', 'banker', 'sensitivity', 'genre', 'migration', 'depressed', 'butt', 'threshold', 'landmark', 'devastating', 'citizenship', 'nominate', 'skeptical', 'consistency', 'rejection', 'evoke', 'intervene', 'cult', 'odor', 'freshly', 'venue', 'flaw', 'monopoly', 'courthouse', 'artery', 'denounce', 'membrane', 'genus')
                      AND def_zh IS NULL)
UNION ALL
SELECT '没有义项超 8 字',
       NOT EXISTS (
         SELECT 1 FROM vocab_words, unnest(string_to_array(def_zh, '；')) AS seg
          WHERE def_zh IS NOT NULL AND char_length(btrim(seg)) > 8
       );

COMMIT;
