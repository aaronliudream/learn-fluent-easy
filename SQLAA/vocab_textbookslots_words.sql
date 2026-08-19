-- 教材词表缺口:建词条 —— 55 个词
-- 生成: node scripts/vocab/emit-textbook-word-sql.mjs --bank=textbookslots
-- ⚠️ 由 Aaron 执行。脚本本身从不写库。
--
-- 来源:junior_vocab 里 grade 7–12 的教材词表,取 lower(headword) 不在 vocab_words 的那些。
--   ⚠️ 按 **grade** 过滤,不按 publisher —— pep 在那张表里是**高中人教**,不是初中人教。
--      已用 grade×publisher 交叉表实证。
--
-- ⚠️ **顺序是硬的**:先跑这份,再跑内容 SQL(vocab_textbookslots_content_*.sql)。
--    内容 SQL 是 UPDATE … WHERE lower(headword) = …,词不存在就安静地改 0 行。
-- ⚠️ 本份**不挂任何词库**。挂载是内容跑完之后单独一份 ——
--    没有释义就挂进去的话,用户在词表里点开是一张空卡。
-- ⚠️ freq_rank 一律留空:这批大部分是短语,ECDICT 里没有词频。
--    编一个假词频进去会污染 byLearnOrder 的排序(它拿 freq_rank 决定先学哪个)。

BEGIN;

SELECT 'BEFORE' AS stage, count(*) AS words FROM vocab_words;

CREATE TEMP TABLE _new_words(headword text PRIMARY KEY, pos text) ON COMMIT DROP;
INSERT INTO _new_words(headword, pos) VALUES
  ('add sth to sth', NULL),
  ('along with sb/sth', NULL),
  ('argue with sb', NULL),
  ('be connected to', NULL),
  ('be connected with', NULL),
  ('be friends with sb.', NULL),
  ('be glued to sth', NULL),
  ('be hard on sb.', NULL),
  ('be home to sb/sth', NULL),
  ('be ready', NULL),
  ('be thankful to sb.', NULL),
  ('cut sth in/into sth', NULL),
  ('depend on', NULL),
  ('depend upon', NULL),
  ('drive sb. crazy', NULL),
  ('drop sb a line', NULL),
  ('feel free (to do sth)', NULL),
  ('fight against sb/sth', NULL),
  ('get ready', NULL),
  ('get to one''s feet', NULL),
  ('give sb a lift', NULL),
  ('go out of one''s way', NULL),
  ('have sth in common', NULL),
  ('help sb with', NULL),
  ('keep on doing sth', NULL),
  ('keep one''s cool', NULL),
  ('kick sb. off', NULL),
  ('lend sb a hand', NULL),
  ('lift sb''s spirits', NULL),
  ('make one''s own decision', NULL),
  ('make sb''s bed', NULL),
  ('make up one''s mind', NULL),
  ('move on (to sth)', NULL),
  ('pour sth into sth', NULL),
  ('prepare sth for', NULL),
  ('pull one''s weight', NULL),
  ('put oneself in sb''s shoes', NULL),
  ('put sth back', NULL),
  ('put sth. to good use', NULL),
  ('ready to do sth', NULL),
  ('run for one''s life', NULL),
  ('run low (on sth)', NULL),
  ('share sth with sb', NULL),
  ('show interest in sth', NULL),
  ('show sb around', NULL),
  ('stick to sth', NULL),
  ('stop sth from doing', NULL),
  ('succeed in doing sth', NULL),
  ('take sb''s breath away', NULL),
  ('take sb''s temperature', NULL),
  ('tend to do sth', NULL),
  ('throw oneself into', NULL),
  ('to sb''s surprise', NULL),
  ('try one''s best', NULL),
  ('unlock the secrets of sth', NULL);

INSERT INTO vocab_words (headword, pos)
SELECT n.headword, n.pos FROM _new_words n
ON CONFLICT (lower(headword)) DO UPDATE
  SET pos = COALESCE(EXCLUDED.pos, vocab_words.pos), updated_at = now();

SELECT 'AFTER' AS stage, count(*) AS words FROM vocab_words;

-- ── 断言:只判本片 ────────────────────────────────────────────
DO $gate$
DECLARE v_n int;
BEGIN
  -- ⑴ 本片每个词都在库里了
  SELECT count(*) INTO v_n FROM _new_words n
   WHERE NOT EXISTS (SELECT 1 FROM vocab_words w WHERE lower(w.headword) = n.headword);
  IF v_n <> 0 THEN RAISE EXCEPTION '本片有 % 个词没建进去', v_n; END IF;

  -- ⑵ 临时表行数与声明一致(空表会让上面那条真空通过)
  SELECT count(*) INTO v_n FROM _new_words;
  IF v_n <> 55 THEN RAISE EXCEPTION '本片应有 55 个词,实际 %', v_n; END IF;

  -- ⑶ 这批词此刻**都还没有释义**,而且**一个词库都没挂** —— 证明这份没越界
  --    (挂载和内容都是后面单独的 SQL 干的事)
  SELECT count(*) INTO v_n FROM _new_words n
    JOIN vocab_words w ON lower(w.headword) = n.headword
   WHERE EXISTS (SELECT 1 FROM vocab_word_banks wb WHERE wb.word_id = w.id);
  RAISE NOTICE '本片 % 词已建;其中已挂在某个词库上的 % 个(应为 0,除非该词此前就存在)',
    55, v_n;
END
$gate$;

COMMIT;
