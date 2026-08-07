-- 🚫 ABANDONED 2026-08-07 —— 弱信号义项补全整段放弃(不是缩表),**永不执行**。
-- 放弃缘由:判据本身不成立 —— gpt-4o 判 53% 两义、gpt-4o-mini 判 0%,
--          结论完全由"哪个模型跑的"决定。ROI 倒挂,Aaron 裁决整段砍掉。
-- 保留仅为存档,不要跑,也不要出现在任何"待跑"清单里。
-- 弱信号试点 · **反向还原** —— 把这 53 词退回基线值
-- ⚠️ 只在试点出问题时跑。值取自不可变基线快照,不是当前值。
-- 由 Aaron 执行。

BEGIN;

UPDATE vocab_words w SET def_zh = v.def_zh, updated_at = now()
  FROM (VALUES
  ('concerned', '担忧的'),
  ('cite', '引用'),
  ('championship', '锦标赛'),
  ('retirement', '退休'),
  ('administrator', '管理员'),
  ('testimony', '证词'),
  ('infection', '感染'),
  ('constitutional', '宪法的'),
  ('emission', '排放物'),
  ('galaxy', '星系'),
  ('dramatically', '显著地'),
  ('presidency', '总统职务或任期'),
  ('allegation', '指控'),
  ('monster', '怪物'),
  ('recession', '经济衰退'),
  ('amendment', '修正案'),
  ('corruption', '腐败'),
  ('dedicate', '致力于'),
  ('counterpart', '对应物'),
  ('exploration', '探索'),
  ('accounting', '会计'),
  ('inflation', '通货膨胀'),
  ('ideological', '意识形态的'),
  ('conspiracy', '阴谋'),
  ('touchdown', '触地得分'),
  ('anonymous', '匿名的'),
  ('banker', '银行家'),
  ('sensitivity', '敏感性'),
  ('genre', '类型'),
  ('migration', '迁移'),
  ('depressed', '沮丧的'),
  ('butt', '臀部'),
  ('threshold', '阈值'),
  ('landmark', '地标'),
  ('devastating', '毁灭性的'),
  ('citizenship', '公民身份'),
  ('nominate', '提名'),
  ('skeptical', '怀疑的'),
  ('consistency', '一致性'),
  ('rejection', '拒绝'),
  ('evoke', '唤起'),
  ('intervene', '干预'),
  ('cult', '邪教'),
  ('odor', '气味'),
  ('freshly', '新鲜地'),
  ('venue', '场所'),
  ('flaw', '缺陷'),
  ('monopoly', '垄断'),
  ('courthouse', '法庭'),
  ('artery', '动脉'),
  ('denounce', '谴责'),
  ('membrane', '膜'),
  ('genus', '属')
  ) AS v(headword, def_zh)
 WHERE lower(w.headword) = v.headword;

SELECT '已全部退回基线(单义)' AS expect,
       NOT EXISTS (SELECT 1 FROM vocab_words
                    WHERE lower(headword) IN ('concerned', 'cite', 'championship', 'retirement', 'administrator', 'testimony', 'infection', 'constitutional', 'emission', 'galaxy', 'dramatically', 'presidency', 'allegation', 'monster', 'recession', 'amendment', 'corruption', 'dedicate', 'counterpart', 'exploration', 'accounting', 'inflation', 'ideological', 'conspiracy', 'touchdown', 'anonymous', 'banker', 'sensitivity', 'genre', 'migration', 'depressed', 'butt', 'threshold', 'landmark', 'devastating', 'citizenship', 'nominate', 'skeptical', 'consistency', 'rejection', 'evoke', 'intervene', 'cult', 'odor', 'freshly', 'venue', 'flaw', 'monopoly', 'courthouse', 'artery', 'denounce', 'membrane', 'genus')
                      AND def_zh LIKE '%；%') AS ok;

COMMIT;
