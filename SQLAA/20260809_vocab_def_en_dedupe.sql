-- 8 组词共用同一条英文释义 —— 拆开。
--
-- ✅ **Aaron 2026-08-09 已审通过,可以跑。**
--    · ① millennia:选 **方案 A** —— 从 vocab_word_banks 摘掉托福归属,
--      词条本身留在 vocab_words **不删**(pos 为空坐实了导入时把屈折形当独立词条收了;
--      托福词表不该有两个条目教同一个词的单复数)。
--    · ②~⑧ 七组全部批准,只改一处措辞:satiric 的 def_zh 改成「讽刺的(书面)」——
--      原来那句「(较少用,多见于文学评论)」括号太长,会挤前端选项区;
--      详细说明留在 def_en 里(选项区只显示 def_zh 分号前那段,见 optionText)。
--    送审件留档:REVIEWAA/vocab_def_en_duplicates.md
--
-- ══ 库内实证(2026-08-09 现查)══════════════════════════════════
--   全表 4471 行,按 lower(trim(def_en)) 分组:8 组完全相同,涉及 16 词。
--   headword 重复:0 组。
--
-- ══ 影响面 ═══════════════════════════════════════════════════
--   · 音频:def_zh/def_en **都没有配音**(vocab_words 只有 headword 的 audio_url,
--     例句音频在 vocab_examples)→ 不需要置空任何 audio_url。
--   · 用户数据:掌握度/错题本按 word_id 存 → 一条都不受影响。
--   · 前端:选项文本取 def_zh 分号前第一段(optionText),改完 ②~⑧ 七组首义项互不相同。
--
-- ⚠️ 全部按 headword 定位并**双重限定当前 def_en**:
--    如果某一条已经被别人改过,那一条就不会被匹配到(而不是覆盖掉别人的修订)。
--    跑完看最后那段断言,它会告诉你实际改了几条。

BEGIN;

SELECT '改前' AS 阶段, headword, pos, def_en, def_zh
FROM vocab_words
WHERE headword IN ('millennium','millennia','satirical','satiric','sporadic','intermittent',
                   'concomitant','simultaneous','accusation','allegation','annihilate','exterminate',
                   'trifling','trivial','nutritious','nourishing')
ORDER BY headword;

-- ①【方案 A · Aaron 定】millennia 从**托福库**摘掉,词条留在 vocab_words 不删。
--    ⚠️ 不删词条:别的库将来可能要用,而且删了会连带影响 vocab_words 计数与
--       20260809_vocab_bank_total_words_fix.sql 里那条 4470 的断言。
--    ⚠️ 摘掉之后 toefl 实挂 4470 → 4469。**跑完这份要重跑一次 total_words 对账 SQL**
--       (那份是幂等的,重复跑安全),否则 total_words 又对不上了。
--    ⚠️ 顺手把它的释义写清楚是复数 —— 词条既然留着,就别留一条和 millennium
--       一字不差的释义在库里(那正是本次要消灭的东西)。
DELETE FROM vocab_word_banks
WHERE word_id = (SELECT id FROM vocab_words WHERE headword = 'millennia')
  AND bank_id = (SELECT id FROM vocab_banks  WHERE code = 'toefl');

UPDATE vocab_words SET
  def_en = 'plural of millennium; periods of one thousand years.',
  def_zh = '千年(millennium 的复数)',
  pos    = COALESCE(NULLIF(pos, ''), 'n.')          -- 它的 pos 是空的,顺手补上
WHERE headword = 'millennia' AND def_en = 'a period of one thousand years.';

-- ② satiric / satirical(同义,差在常用度)
UPDATE vocab_words SET
  def_en = 'the same as satirical, but far less common and mostly used in literary criticism.',
  def_zh = '讽刺的(书面)'          -- Aaron 2026-08-09:括号太长会挤选项区,细节留在 def_en
WHERE headword = 'satiric' AND def_en = 'using humor, irony, or exaggeration to criticize or mock.';

-- ③ sporadic / intermittent(零散无规律 vs 停停走走)
UPDATE vocab_words SET
  def_en = 'happening occasionally, at scattered and unpredictable times.',
  def_zh = '零星的；偶发的'
WHERE headword = 'sporadic' AND def_en = 'occurring at irregular intervals; not continuous or steady.';

UPDATE vocab_words SET
  def_en = 'stopping and starting again repeatedly, often at fairly regular intervals.',
  def_zh = '间歇的；断断续续的'
WHERE headword = 'intermittent' AND def_en = 'occurring at irregular intervals; not continuous or steady.';

-- ④ concomitant / simultaneous(伴随/因果 vs 纯时间重合)
UPDATE vocab_words SET
  def_en = 'happening at exactly the same moment.',
  def_zh = '同时发生的'
WHERE headword = 'simultaneous' AND def_en = 'occurring at the same time as something else.';

UPDATE vocab_words SET
  def_en = 'naturally accompanying something else, often as a side effect of it.',
  def_zh = '伴随的；随之而来的'
WHERE headword = 'concomitant' AND def_en = 'occurring at the same time as something else.';

-- ⑤ accusation / allegation(已证实 vs 尚未证实)
UPDATE vocab_words SET
  def_en = 'a direct charge that someone has done something wrong.',
  def_zh = '指责；控告'
WHERE headword = 'accusation' AND def_en = 'a claim that someone has done something illegal or wrong.';

UPDATE vocab_words SET
  def_en = 'a claim of wrongdoing that has not yet been proved, typically in a legal or news context.',
  def_zh = '指称；(未经证实的)指控'
WHERE headword = 'allegation' AND def_en = 'a claim that someone has done something illegal or wrong.';

-- ⑥ annihilate / exterminate(宾语可以是任何东西 vs 必须是活的成群的)
UPDATE vocab_words SET
  def_en = 'to destroy something completely, leaving nothing behind.',
  def_zh = '彻底摧毁；歼灭'
WHERE headword = 'annihilate' AND def_en = 'to completely destroy or eliminate something.';

UPDATE vocab_words SET
  def_en = 'to kill off an entire population of living things, especially pests.',
  def_zh = '灭绝；根除(害虫等)'
WHERE headword = 'exterminate' AND def_en = 'to completely destroy or eliminate something.';

-- ⑦ trifling / trivial(量少 vs 不重要)
UPDATE vocab_words SET
  def_en = 'of little importance; not worth serious attention.',
  def_zh = '微不足道的；不重要的'
WHERE headword = 'trivial' AND def_en = 'of little value or importance; insignificant.';

UPDATE vocab_words SET
  def_en = 'very small in amount or value, especially of a sum of money.',
  def_zh = '微薄的；(数额)极小的'
WHERE headword = 'trifling' AND def_en = 'of little value or importance; insignificant.';

-- ⑧ nutritious / nourishing(成分客观描述 vs 滋养作用,后者可比喻)
UPDATE vocab_words SET
  def_en = 'containing the nutrients the body needs.',
  def_zh = '有营养的'
WHERE headword = 'nutritious' AND def_en = 'providing essential nutrients for growth and health.';

UPDATE vocab_words SET
  def_en = 'giving the body what it needs to grow and stay healthy; also used figuratively of things that sustain the mind.',
  def_zh = '滋养的；养人的(也可比喻)'
WHERE headword = 'nourishing' AND def_en = 'providing essential nutrients for growth and health.';

SELECT '改后' AS 阶段, headword, pos, def_en, def_zh
FROM vocab_words
WHERE headword IN ('millennium','millennia','satirical','satiric','sporadic','intermittent',
                   'concomitant','simultaneous','accusation','allegation','annihilate','exterminate',
                   'trifling','trivial','nutritious','nourishing')
ORDER BY headword;

-- ── 硬断言:这 16 个词里不许再有两个共用同一条 def_en ──────────
DO $$
DECLARE dup int;
BEGIN
  SELECT count(*) INTO dup FROM (
    SELECT lower(btrim(def_en)) AS k
    FROM vocab_words
    WHERE headword IN ('millennium','millennia','satirical','satiric','sporadic','intermittent',
                       'concomitant','simultaneous','accusation','allegation','annihilate','exterminate',
                       'trifling','trivial','nutritious','nourishing')
      AND def_en IS NOT NULL
    GROUP BY 1 HAVING count(*) > 1
  ) t;
  IF dup > 0 THEN
    RAISE EXCEPTION '这 16 个词里还有 % 组共用同一条 def_en(可能是某条 UPDATE 没匹配上),已回滚', dup;
  END IF;
END $$;

-- ── 参考:全表还剩几组 def_en 重复(本次只处理这 8 组,其余若有请另报)──
SELECT count(*) AS 全表剩余重复组数 FROM (
  SELECT lower(btrim(def_en)) FROM vocab_words WHERE def_en IS NOT NULL
  GROUP BY 1 HAVING count(*) > 1
) t;

COMMIT;
