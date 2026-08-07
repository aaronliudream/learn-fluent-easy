-- ✅ DONE 2026-08-07 已执行,Aaron 回报已跑
-- 词汇内容 patch1:第三轮审核打回的定点修复
--
-- 本 patch 只动**与线上实际值真有差异**的字段(现查 DB 逐字段比对得出),
-- 不是重跑全量 —— 594 条例句里只有 3 条变了,其余一字不动。
--
-- 本轮改了什么:
--   ① def_zh 25 条:清理"短解释句"残留。
--      新增检测规则:释义命中解释性标记词(某物/某人/的行为/相关的/一种/通常/尤其…)
--      即判不合格,规则已并入形状校验固化(gates.mjs defZhShapeProblem)。
--      模型三次给不出合格短释义的,由人工按词典体裁改写,逐条记在
--      scripts/vocab/data/defzh-manual.json 供复核。
--   ② def_en 1 条:随 nonetheless 重生成一并更新。
--   ③ 例句 3 条:nonetheless 整词重生成 —— 原先三条 collocation 被写成整句,
--      且例3"decided to go out; nonetheless, I went for a walk"前后没有真转折。
--      新增功能词规格(pos 全为 conj./prep./adv. 时触发):collocation 给 2-5 词用法模式、
--      禁整句;转折词例句前后须真的构成转折。
--   ⚠️ 其余 197 词的例句**一字未动**。
--
-- ⚠️ 由 Aaron 执行。脚本本身从不写库。

BEGIN;

SELECT 'BEFORE' AS stage,
       (SELECT count(*) FROM vocab_words WHERE def_zh IS NOT NULL) AS words_with_def,
       (SELECT count(*) FROM vocab_examples) AS examples;

-- ① 释义(def_zh / def_en)
UPDATE vocab_words w
   SET def_zh = v.def_zh,
       def_en = v.def_en,
       updated_at = now()
  FROM (VALUES
  ('involved', '参与的；复杂的', 'Being part of something or connected to it.'),
  ('grab', '抓住', 'To take hold of something quickly or suddenly.'),
  ('regional', '地区的', 'Relating to a specific area or locality.'),
  ('funding', '资金；拨款', 'The act of providing financial support.'),
  ('ally', '盟友', 'A person or group that supports another.'),
  ('dealer', '经销商', 'A person who buys and sells goods or services.'),
  ('mechanism', '机制；机构', 'A system or process for achieving something.'),
  ('penalty', '处罚；罚款', 'A punishment for breaking a rule or law.'),
  ('constitutional', '宪法的', 'Related to a nation''s legal framework or system of governance.'),
  ('ken', '知识范围', 'The range of what someone knows or understands.'),
  ('entitled', '有权的', 'Having a right or claim to something.'),
  ('survivor', '幸存者', 'A person remaining alive after an event.'),
  ('standing', '地位；立场', 'Position of being upright or having status.'),
  ('flavor', '风味；特色', 'A distinctive taste or quality of something.'),
  ('orientation', '方向；入职培训', 'The process of familiarizing someone with a new environment.'),
  ('cluster', '集群', 'A group of similar things positioned closely together.'),
  ('colonial', '殖民的；殖民地的', 'Relating to a colony or colonies.'),
  ('dramatically', '显著地', 'In a way that is very sudden or extreme.'),
  ('counsel', '建议；法律顾问', 'Advice or guidance, especially in legal matters.'),
  ('administrative', '行政的', 'Related to the organization and management of activities.'),
  ('seemingly', '表面上；看似', 'In appearance but not necessarily in reality.'),
  ('array', '阵列；大批', 'A collection of items arranged in a systematic way.'),
  ('ballot', '选票；投票', 'A voting paper or the act of voting.'),
  ('residential', '住宅的', 'Relating to housing or residences.'),
  ('minimize', '使最小化；尽量减少', 'To make something as small as possible.'),
  ('nonetheless', '尽管如此', 'In spite of that; nevertheless; used to introduce a contrast.')
  ) AS v(headword, def_zh, def_en)
 WHERE lower(w.headword) = v.headword;

-- ② 例句(只有下面这 3 条)
INSERT INTO vocab_examples (word_id, sort_order, collocation, sentence, translation_zh, scene)
SELECT w.id, v.sort_order, v.collocation, v.sentence, v.translation_zh, v.scene
  FROM (VALUES
  ('nonetheless', 1, '..., nonetheless, ...', 'The economy is struggling; nonetheless, job growth continues in some sectors.', '经济正在挣扎，尽管如此，某些行业的就业增长仍在继续。', 'news'),
  ('nonetheless', 2, 'nonetheless, + 主句', 'There were numerous challenges; nonetheless, the research team achieved their goals.', '面临众多挑战，尽管如此，研究团队实现了他们的目标。', 'science_tech'),
  ('nonetheless', 3, '小句; nonetheless', 'I was tired after work; nonetheless, I decided to exercise.', '我下班后很累，尽管如此，我决定锻炼。', 'daily_life')
  ) AS v(headword, sort_order, collocation, sentence, translation_zh, scene)
  JOIN vocab_words w ON lower(w.headword) = v.headword
ON CONFLICT (word_id, sort_order) DO UPDATE
  SET collocation    = EXCLUDED.collocation,
      sentence       = EXCLUDED.sentence,
      translation_zh = EXCLUDED.translation_zh,
      scene          = EXCLUDED.scene;

SELECT 'AFTER' AS stage,
       (SELECT count(*) FROM vocab_words WHERE def_zh IS NOT NULL) AS words_with_def,
       (SELECT count(*) FROM vocab_examples) AS examples;

-- ── count-validate:五行都必须是 t,否则 ROLLBACK ──
-- patch 不该改变行数,只改内容。
SELECT 'words_with_def 仍是 198' AS expect,
       (SELECT count(*) FROM vocab_words WHERE def_zh IS NOT NULL) = 198 AS ok
UNION ALL
SELECT 'examples 仍是 594',
       (SELECT count(*) FROM vocab_examples) = 594
UNION ALL
-- ⚠️ 判"是不是整句"只能看**字母后面的句点**,不能看有没有点号。
--    裁决指定的模式本身就带省略号("..., nonetheless, ..."),
--    用 LIKE '%.%' 会把合规模式判成违规,这条 validate 会直接让你 ROLLBACK。
SELECT 'nonetheless 三条 collocation 都是短模式(<=5 词且不是句子)',
       NOT EXISTS (
         SELECT 1 FROM vocab_examples e
           JOIN vocab_words w ON w.id = e.word_id AND lower(w.headword) = 'nonetheless'
          WHERE e.collocation ~ '[A-Za-z]\.'          -- 字母后接句点 = 写成句子了
             OR array_length(string_to_array(btrim(e.collocation), ' '), 1) > 5
       )
UNION ALL
SELECT '没有 def_zh 写成句子(不含句号)',
       NOT EXISTS (SELECT 1 FROM vocab_words WHERE def_zh LIKE '%。%')
UNION ALL
SELECT '每条例句都有合法 scene',
       NOT EXISTS (
         SELECT 1 FROM vocab_examples
          WHERE scene IS NULL
             OR scene NOT IN ('academic','news','daily_life','work','science_tech',
                              'health','environment','education','travel','culture')
       );

COMMIT;
