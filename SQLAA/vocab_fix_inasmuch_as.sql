-- 词汇内容(单词修复):1 词 · 3 例句

-- 生成: node scripts/vocab/generate-content.mjs --bank=all --emit-sql
-- 来源: **人工撰写**(模型写不出来的词,见 content-manual.json 里的 _why) · 九道机器闸门全过
-- ⚠️ 由 Aaron 执行。脚本本身从不写库。
--
-- 幂等: vocab_words 按 lower(headword) 定位更新;
--       vocab_examples 走 ON CONFLICT (word_id, sort_order)(索引 vocab_examples_word_id_sort_order_key)。
--       重复跑只会覆盖同一批内容,不产生重复行。
--
-- scene(academic/news/daily_life/... 共 10 类)既用于生成期的 g5/g6 闸门判定,
-- 也一并入库,将来可按场景筛例句。

BEGIN;

-- scene 列的安全网。2026-08-03 出这份 SQL 时已实测确认 vocab_examples.scene
-- 存在(text, nullable),所以这句就是个 no-op,留着是防回滚/换环境时缺列。
ALTER TABLE vocab_examples ADD COLUMN IF NOT EXISTS scene text;

SELECT 'BEFORE' AS stage,
       (SELECT count(*) FROM vocab_words WHERE def_zh IS NOT NULL) AS words_with_def,
       (SELECT count(*) FROM vocab_examples) AS examples;

-- ⓪ 改名:词表里混进了**不能独立成词**的半截固定搭配,原地改成完整短语。
--    ⚠️ 必须**原地改 headword、保留原 id** —— 新建行会和 vocab_word_banks
--       的挂载关系断开,那个词就从库里消失了(挂载表按 word_id 关联)。
--    ⚠️ 改名必须排在①②前面:①②靠 lower(headword) 定位,
--       先改名它们才认得出这一行。
UPDATE vocab_words SET headword = 'inasmuch as', updated_at = now()
 WHERE id = '0fcd5134-4edc-42a9-b638-e9e929b749fa'::uuid AND lower(headword) IN ('inasmuch', 'inasmuch as');   -- inasmuch → inasmuch as(幂等:跑第二遍是 no-op)

-- ① 释义 / 音标
UPDATE vocab_words w
   SET ipa        = v.ipa,
       def_zh     = v.def_zh,
       def_en     = v.def_en,
       updated_at = now()
  FROM (VALUES
  ('inasmuch as', '/ˌɪnəzˈmʌtʃ əz/', '（正式书面语）因为，鉴于；就……而言', '(formal) because of the fact that; to the extent that.')
  ) AS v(headword, ipa, def_zh, def_en)
 WHERE lower(w.headword) = v.headword
   AND w.def_zh IS NULL;        -- ← 护栏:只填空,绝不覆盖库里已有的释义

-- ② 例句
INSERT INTO vocab_examples (word_id, sort_order, collocation, sentence, translation_zh, scene)
SELECT w.id, v.sort_order, v.collocation, v.sentence, v.translation_zh, v.scene
  FROM (VALUES
  ('inasmuch as', 1, 'risky inasmuch as', 'The plan is risky inasmuch as it relies on a single supplier.', '该计划有风险，因为它只依赖一家供应商。', 'work'),
  ('inasmuch as', 2, 'inasmuch as the evidence', 'Inasmuch as the evidence remains incomplete, the committee has postponed its decision.', '鉴于证据仍不完整，委员会推迟了决定。', 'academic'),
  ('inasmuch as', 3, 'matters inasmuch as', 'This ruling matters inasmuch as it sets a precedent for future disputes.', '这项裁决之所以重要，是因为它为今后的纠纷树立了先例。', 'news')
  ) AS v(headword, sort_order, collocation, sentence, translation_zh, scene)
  JOIN vocab_words w ON lower(w.headword) = v.headword
ON CONFLICT (word_id, sort_order) DO UPDATE
  SET collocation    = EXCLUDED.collocation,
      sentence       = EXCLUDED.sentence,
      translation_zh = EXCLUDED.translation_zh,
      scene          = EXCLUDED.scene;


-- ③ 词音频(已按全库定版参数烧好:openai | alloy | speed 1 | accent 空)
UPDATE vocab_words w SET audio_url = v.audio_url
  FROM (VALUES
  ('inasmuch as', 'https://audio.bigmooneducation.com/52/52f47a1980aaa7cd10ff5bd568778cb7843837d4fe0407f67b55b85cd48b085b.mp3')
  ) AS v(headword, audio_url)
 WHERE lower(w.headword) = v.headword;

-- ④ 例句音频
UPDATE vocab_examples e SET audio_url = v.audio_url
  FROM (VALUES
  ('inasmuch as', 1, 'https://audio.bigmooneducation.com/ca/ca0519b784a41a7b0f852847ae3e2e1d1a8347ee9034430abcecabaabdc7c8e0.mp3'),
  ('inasmuch as', 2, 'https://audio.bigmooneducation.com/1c/1ce0c198ddbbc885391d4a69aa3e25c0d049306f30269176a9ae4a55958d9108.mp3'),
  ('inasmuch as', 3, 'https://audio.bigmooneducation.com/53/5330770b0c356852b8229e482fe1ad0acf83ed0a76581682c0535436350d8667.mp3')
  ) AS v(headword, sort_order, audio_url)
  JOIN vocab_words w ON lower(w.headword) = v.headword
 WHERE e.word_id = w.id AND e.sort_order = v.sort_order;

SELECT 'AFTER' AS stage,
       (SELECT count(*) FROM vocab_words WHERE def_zh IS NOT NULL) AS words_with_def,
       (SELECT count(*) FROM vocab_examples) AS examples;

-- ── 断言:**只判本批这 1 个词**,不判全表 ────────────────────
-- ⚠️ 原来写的是 (SELECT count(*) FROM vocab_words WHERE def_zh IS NOT NULL) = 本批词数。
--    那在只有托福一个库时碰巧成立,多几个库以后必然为 f —— 全表里还有别的库的词。
--    判据必须锁在本批范围内(见 batch-validate-scope-to-batch)。
-- ⚠️ 用 DO + RAISE:断言不过**直接抛异常整笔回滚**,不靠人眼看那几个 t/f。
DO $gate$
DECLARE
  n_missing int; n_badcount int; n_badscene int; n_links int; n_noaudio int;
BEGIN
  SELECT count(*) INTO n_missing
    FROM (VALUES
  ('inasmuch as', '/ˌɪnəzˈmʌtʃ əz/', '（正式书面语）因为，鉴于；就……而言', '(formal) because of the fact that; to the extent that.')
    ) AS v(headword, ipa, def_zh, def_en)
    LEFT JOIN vocab_words w ON lower(w.headword) = v.headword
   WHERE w.id IS NULL OR w.def_zh IS NULL;

  SELECT count(*) INTO n_badcount
    FROM (VALUES
  ('inasmuch as', '/ˌɪnəzˈmʌtʃ əz/', '（正式书面语）因为，鉴于；就……而言', '(formal) because of the fact that; to the extent that.')
    ) AS v(headword, ipa, def_zh, def_en)
    JOIN vocab_words w ON lower(w.headword) = v.headword
   WHERE (SELECT count(*) FROM vocab_examples e WHERE e.word_id = w.id) <> 3;

  SELECT count(*) INTO n_badscene
    FROM (VALUES
  ('inasmuch as', '/ˌɪnəzˈmʌtʃ əz/', '（正式书面语）因为，鉴于；就……而言', '(formal) because of the fact that; to the extent that.')
    ) AS v(headword, ipa, def_zh, def_en)
    JOIN vocab_words w ON lower(w.headword) = v.headword
    JOIN vocab_examples e ON e.word_id = w.id
   WHERE e.scene IS NULL
      OR e.scene NOT IN ('academic', 'news', 'daily_life', 'work', 'science_tech', 'health', 'environment', 'education', 'travel', 'culture');


  -- 改名核对:inasmuch → inasmuch as
  --  ⚠️ 光看 headword 改没改**不够**。改名的全部风险在于挂载关系断掉,
  --     而那个后果在 vocab_words 这张表上完全看不出来 —— 词还在,只是从任何词库里消失了。
  --     所以必须连 vocab_word_banks 一起验。
  PERFORM 1 FROM vocab_words WHERE id = '0fcd5134-4edc-42a9-b638-e9e929b749fa'::uuid AND lower(headword) = 'inasmuch as';
  IF NOT FOUND THEN RAISE EXCEPTION '改名没生效:id 0fcd5134-4edc-42a9-b638-e9e929b749fa 的 headword 不是 inasmuch as'; END IF;
  SELECT count(*) INTO n_links FROM vocab_word_banks WHERE word_id = '0fcd5134-4edc-42a9-b638-e9e929b749fa'::uuid;
  IF n_links = 0 THEN RAISE EXCEPTION '改名后 inasmuch as 一个词库都没挂上 —— 挂载关系断了'; END IF;
  RAISE NOTICE '改名 inasmuch → inasmuch as 成功,仍挂在 % 个词库上', n_links;


  -- 音频核对:本批带音频的行必须真的写进去了,且是 CDN 内容寻址路径。
  -- ⚠️ 判**本批这几行**,不判全表 —— 全表还有别批的行(batch-validate-scope-to-batch)。
  SELECT count(*) INTO n_noaudio
    FROM (VALUES
  ('inasmuch as')
    ) AS v(headword)
    JOIN vocab_words w ON lower(w.headword) = v.headword
   WHERE w.audio_url IS NULL
      OR w.audio_url !~ '^https://audio\.bigmooneducation\.com/[0-9a-f]{2}/[0-9a-f]{64}\.mp3$';
  IF n_noaudio > 0 THEN RAISE EXCEPTION '本批有 % 个词的音频没写进去或形态不合法', n_noaudio; END IF;

  SELECT count(*) INTO n_noaudio
    FROM (VALUES
  ('inasmuch as', 1),
  ('inasmuch as', 2),
  ('inasmuch as', 3)
    ) AS v(headword, sort_order)
    JOIN vocab_words w ON lower(w.headword) = v.headword
    JOIN vocab_examples e ON e.word_id = w.id AND e.sort_order = v.sort_order
   WHERE e.audio_url IS NULL
      OR e.audio_url !~ '^https://audio\.bigmooneducation\.com/[0-9a-f]{2}/[0-9a-f]{64}\.mp3$';
  IF n_noaudio > 0 THEN RAISE EXCEPTION '本批有 % 条例句的音频没写进去或形态不合法', n_noaudio; END IF;

  RAISE NOTICE '本批 1 词:缺释义 %,例句数不等于3 %,scene 非法 %',
    n_missing, n_badcount, n_badscene;

  IF n_missing > 0 OR n_badcount > 0 OR n_badscene > 0 THEN
    RAISE EXCEPTION '断言不过:缺释义 % · 例句数异常 % · scene 非法 % —— 已回滚,库里没有任何改动',
      n_missing, n_badcount, n_badscene;
  END IF;
END
$gate$;

COMMIT;
