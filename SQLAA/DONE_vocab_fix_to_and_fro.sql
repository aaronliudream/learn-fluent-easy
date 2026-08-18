-- 一次性修复:fro → to and fro(副词,来回地;往复地)
-- 生成: node scripts/vocab/fix-fro-to-and-fro.mjs
-- ⚠️ 由 Aaron 执行。脚本本身从不写库。
--
-- 病因:词表里混进了**不能独立成词**的半截固定搭配。fro 只以 to and fro 出现,
--       于是它那三条例句全是病句("Children often run fro their parents"),
--       释义也错("向后;反方向" → 实际是"来回地"),而且**九道闸门全过、音频都烧了**。
--       def_zh IS NULL 那类检查抓不到它 —— 它不是生成失败,是侥幸生成成功。
--
-- ⚠️ 全程**按 id 锁定**(WHERE id = 'b6c4e0b9-d44a-45c8-af06-842ce6498d51'):
--    · 不走 lower(headword) —— 那样得先假定库里叫什么,改名前后还不一样;
--    · 不加 def_zh IS NULL —— 这一行本来就有释义,加了等于自己把自己挡掉;
--    · 但也因此**不开任何通用覆盖通道**:内容 SQL 里 def_zh IS NULL 那道护栏
--      原样保留。作用面就这一行、这一次。
--
-- ⚠️ 旧音频 4 条(词 1 + 例句 3)**全部作废**:它们念的是错文本。已重烧,
--    下面断言里显式核对"新 URL ≠ 旧 URL"。

BEGIN;

SELECT 'BEFORE' AS stage, headword, def_zh, ipa, audio_url
  FROM vocab_words WHERE id = 'b6c4e0b9-d44a-45c8-af06-842ce6498d51'::uuid;

-- ① 改名 + 释义 + 音标 + 词音频(一条 UPDATE,按 id)
UPDATE vocab_words
   SET headword   = 'to and fro',
       pos        = 'adv.',
       ipa        = '/ˌtuː ən ˈfroʊ/',
       def_zh     = '来回地；往复地',
       def_en     = 'Moving repeatedly in one direction and then back again.',
       audio_url  = 'https://audio.bigmooneducation.com/51/5134ae67993268b52a52c2e36ac1ab2dadae8c62780204289abfe865411c55f1.mp3',
       updated_at = now()
 WHERE id = 'b6c4e0b9-d44a-45c8-af06-842ce6498d51'::uuid;

-- ② 三条例句整体换掉(连音频)。走 ON CONFLICT 是为了**行在不在都成立**:
--    现在这三行是存在的,但用 UPDATE 的话万一哪天不在了就静默改 0 行。
INSERT INTO vocab_examples (word_id, sort_order, collocation, sentence, translation_zh, scene, audio_url)
VALUES
  ('b6c4e0b9-d44a-45c8-af06-842ce6498d51'::uuid, 1, 'swaying to and fro', 'The tall branches were swaying to and fro in the evening wind.', '高高的树枝在晚风中来回摇曳。', 'environment', 'https://audio.bigmooneducation.com/22/222b19fd821367fb80248153861a1ae83f2154ae61aaf0212514518103163ab2.mp3'),
  ('b6c4e0b9-d44a-45c8-af06-842ce6498d51'::uuid, 2, 'paced to and fro', 'She paced to and fro outside the room while waiting for news.', '等消息的时候，她在房间外来回踱步。', 'daily_life', 'https://audio.bigmooneducation.com/63/6393289f5e74e7016d0a5f3eb5815c8c309b020acee2428b3b726a8aee6e7088.mp3'),
  ('b6c4e0b9-d44a-45c8-af06-842ce6498d51'::uuid, 3, 'moved to and fro', 'Workers moved to and fro between the loading dock and the storage area.', '工人们在装卸区和仓储区之间来回走动。', 'work', 'https://audio.bigmooneducation.com/15/156abdad99d8be36a1c000fb0cb0ef2b1dd703be6c9ab5a0a8c72062647ede65.mp3')
ON CONFLICT (word_id, sort_order) DO UPDATE
  SET collocation    = EXCLUDED.collocation,
      sentence       = EXCLUDED.sentence,
      translation_zh = EXCLUDED.translation_zh,
      scene          = EXCLUDED.scene,
      audio_url      = EXCLUDED.audio_url;

-- ③ 多余例句清掉(现在没有,但 sort_order >3 的残留会让"例句数=3"这条断言炸,
--    与其让 Aaron 手工排查,不如在这里按 id 收干净)
DELETE FROM vocab_examples WHERE word_id = 'b6c4e0b9-d44a-45c8-af06-842ce6498d51'::uuid AND sort_order > 3;

SELECT 'AFTER' AS stage, headword, def_zh, ipa, audio_url
  FROM vocab_words WHERE id = 'b6c4e0b9-d44a-45c8-af06-842ce6498d51'::uuid;

-- ── 断言:不过就抛异常整笔回滚 ──────────────────────────────────
DO $gate$
DECLARE
  v_head text; v_audio text; n int; n_links int;
BEGIN
  -- ⑴ 改名核对
  SELECT headword, audio_url INTO v_head, v_audio FROM vocab_words WHERE id = 'b6c4e0b9-d44a-45c8-af06-842ce6498d51'::uuid;
  IF v_head IS NULL THEN RAISE EXCEPTION 'id b6c4e0b9-d44a-45c8-af06-842ce6498d51 这一行不存在'; END IF;
  IF lower(v_head) <> 'to and fro' THEN
    RAISE EXCEPTION '改名没生效:headword 现在是 "%"', v_head; END IF;

  -- ⑵ id 护栏:全库不许有第二个 to and fro
  --    ⚠️ 改名最阴的失败方式是"库里本来就有一个同名词条",改完变成两条并存,
  --       两条都能查到、都能学,但用户看到的是哪条全看排序 —— 表面完全正常。
  SELECT count(*) INTO n FROM vocab_words WHERE lower(headword) = 'to and fro';
  IF n <> 1 THEN RAISE EXCEPTION '全库有 % 个 "to and fro",应当正好 1 个', n; END IF;

  -- ⑶ 挂载核对(改名的全部风险在这:词还在,只是从所有词库里消失)
  SELECT count(*) INTO n_links FROM vocab_word_banks WHERE word_id = 'b6c4e0b9-d44a-45c8-af06-842ce6498d51'::uuid;
  IF n_links = 0 THEN RAISE EXCEPTION '改名后一个词库都没挂上 —— 挂载关系断了'; END IF;

  -- ⑷ 释义/音标真的写进去了
  PERFORM 1 FROM vocab_words
   WHERE id = 'b6c4e0b9-d44a-45c8-af06-842ce6498d51'::uuid AND def_zh = '来回地；往复地'
     AND def_en = 'Moving repeatedly in one direction and then back again.' AND ipa = '/ˌtuː ən ˈfroʊ/';
  IF NOT FOUND THEN RAISE EXCEPTION '释义/音标没写进去或与给定值不一致'; END IF;

  -- ⑸ 例句正好 3 条,且内容就是本次给的三句
  SELECT count(*) INTO n FROM vocab_examples WHERE word_id = 'b6c4e0b9-d44a-45c8-af06-842ce6498d51'::uuid;
  IF n <> 3 THEN RAISE EXCEPTION '例句 % 条,应当正好 3 条', n; END IF;
  SELECT count(*) INTO n FROM vocab_examples e
    JOIN (VALUES
      (1, 'The tall branches were swaying to and fro in the evening wind.'),
      (2, 'She paced to and fro outside the room while waiting for news.'),
      (3, 'Workers moved to and fro between the loading dock and the storage area.')
    ) AS v(sort_order, sentence) ON v.sort_order = e.sort_order AND v.sentence = e.sentence
   WHERE e.word_id = 'b6c4e0b9-d44a-45c8-af06-842ce6498d51'::uuid;
  IF n <> 3 THEN RAISE EXCEPTION '只有 % 条例句是本次给的句子,旧病句没换干净', n; END IF;

  -- ⑹ scene 合法
  SELECT count(*) INTO n FROM vocab_examples
   WHERE word_id = 'b6c4e0b9-d44a-45c8-af06-842ce6498d51'::uuid
     AND (scene IS NULL OR scene NOT IN ('academic','news','daily_life','work','science_tech','health','environment','education','travel','culture'));
  IF n > 0 THEN RAISE EXCEPTION '有 % 条例句的 scene 非法', n; END IF;

  -- ⑺ 音频形态 + **新旧必须不同**(旧的念的是错文本,同名就等于没换)
  SELECT count(*) INTO n FROM (
    SELECT audio_url FROM vocab_words WHERE id = 'b6c4e0b9-d44a-45c8-af06-842ce6498d51'::uuid
    UNION ALL SELECT audio_url FROM vocab_examples WHERE word_id = 'b6c4e0b9-d44a-45c8-af06-842ce6498d51'::uuid
  ) t WHERE t.audio_url IS NULL
      OR t.audio_url !~ '^https://audio\.bigmooneducation\.com/[0-9a-f]{2}/[0-9a-f]{64}\.mp3$';
  IF n > 0 THEN RAISE EXCEPTION '有 % 条音频缺失或形态不合法', n; END IF;

  SELECT count(*) INTO n FROM (
    SELECT audio_url FROM vocab_words WHERE id = 'b6c4e0b9-d44a-45c8-af06-842ce6498d51'::uuid
    UNION ALL SELECT audio_url FROM vocab_examples WHERE word_id = 'b6c4e0b9-d44a-45c8-af06-842ce6498d51'::uuid
  ) t WHERE t.audio_url IN ('https://audio.bigmooneducation.com/fc/fce0a0b70892471595ca4d184ada33b481efe6a85b45d34d813dd4a665642367.mp3', 'https://audio.bigmooneducation.com/2d/2db35199b676bb3b832a08b50d909d8bea387b19bf93a98c51ac973d1be300d2.mp3', 'https://audio.bigmooneducation.com/3b/3ba4a1e956af8a17b3cba061f828238714e0116aa430da14359e372215a158df.mp3', 'https://audio.bigmooneducation.com/a7/a7739c82e8b693d4d24e8e40ae2f7d76a0667cf3d2721e7ad87c94c69116d7f9.mp3');
  IF n > 0 THEN RAISE EXCEPTION '有 % 条音频还是旧文件 —— 念的是错文本,没换成功', n; END IF;

  RAISE NOTICE 'fro → to and fro 全部核对通过:仍挂在 % 个词库上,3 条例句 + 4 条新音频', n_links;
END
$gate$;

COMMIT;
