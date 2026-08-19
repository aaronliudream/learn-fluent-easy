-- 教材缺口批:挂词库 —— gaokao 55 个 / zhongkao 50 个
-- 生成: node scripts/vocab/emit-textbook-mount-sql.mjs --bank=textbookslots
-- ⚠️ 由 Aaron 执行。脚本本身从不写库。
--
-- 规则:junior_vocab 最低年级 ≤9 → zhongkao + gaokao;10–12 → 仅 gaokao。
--   实证来源:库里已挂好的 991 批 = gaokao 991 / zhongkao 663,
--   而那 991 里最低年级 ≤9 的正好 663 —— 数对上才照做的。
-- ⚠️ 顺序:建词条 → 内容 → **本份**。先挂后灌的话用户点开是空卡。

BEGIN;

SELECT 'BEFORE' AS stage, b.code, b.total_words AS 元数据,
       (SELECT count(*) FROM vocab_word_banks m WHERE m.bank_id = b.id) AS 实挂
  FROM vocab_banks b WHERE b.code IN ('zhongkao','gaokao') ORDER BY b.code;

CREATE TEMP TABLE _mount_gaokao(headword text PRIMARY KEY) ON COMMIT DROP;
INSERT INTO _mount_gaokao(headword) VALUES
  ('add sth to sth'),
  ('along with sb/sth'),
  ('argue with sb'),
  ('be connected to'),
  ('be connected with'),
  ('be friends with sb.'),
  ('be glued to sth'),
  ('be hard on sb.'),
  ('be home to sb/sth'),
  ('be ready'),
  ('be thankful to sb.'),
  ('cut sth in/into sth'),
  ('depend on'),
  ('depend upon'),
  ('drive sb. crazy'),
  ('drop sb a line'),
  ('feel free (to do sth)'),
  ('fight against sb/sth'),
  ('get ready'),
  ('get to one''s feet'),
  ('give sb a lift'),
  ('go out of one''s way'),
  ('have sth in common'),
  ('help sb with'),
  ('keep on doing sth'),
  ('keep one''s cool'),
  ('kick sb. off'),
  ('lend sb a hand'),
  ('lift sb''s spirits'),
  ('make one''s own decision'),
  ('make sb''s bed'),
  ('make up one''s mind'),
  ('move on (to sth)'),
  ('pour sth into sth'),
  ('prepare sth for'),
  ('pull one''s weight'),
  ('put oneself in sb''s shoes'),
  ('put sth back'),
  ('put sth. to good use'),
  ('ready to do sth'),
  ('run for one''s life'),
  ('run low (on sth)'),
  ('share sth with sb'),
  ('show interest in sth'),
  ('show sb around'),
  ('stick to sth'),
  ('stop sth from doing'),
  ('succeed in doing sth'),
  ('take sb''s breath away'),
  ('take sb''s temperature'),
  ('tend to do sth'),
  ('throw oneself into'),
  ('to sb''s surprise'),
  ('try one''s best'),
  ('unlock the secrets of sth');

CREATE TEMP TABLE _mount_zhongkao(headword text PRIMARY KEY) ON COMMIT DROP;
INSERT INTO _mount_zhongkao(headword) VALUES
  ('add sth to sth'),
  ('along with sb/sth'),
  ('argue with sb'),
  ('be connected to'),
  ('be connected with'),
  ('be friends with sb.'),
  ('be glued to sth'),
  ('be hard on sb.'),
  ('be home to sb/sth'),
  ('be ready'),
  ('be thankful to sb.'),
  ('cut sth in/into sth'),
  ('depend on'),
  ('depend upon'),
  ('drive sb. crazy'),
  ('drop sb a line'),
  ('feel free (to do sth)'),
  ('fight against sb/sth'),
  ('get ready'),
  ('get to one''s feet'),
  ('give sb a lift'),
  ('go out of one''s way'),
  ('have sth in common'),
  ('help sb with'),
  ('keep on doing sth'),
  ('keep one''s cool'),
  ('kick sb. off'),
  ('lend sb a hand'),
  ('lift sb''s spirits'),
  ('make one''s own decision'),
  ('make sb''s bed'),
  ('move on (to sth)'),
  ('pour sth into sth'),
  ('prepare sth for'),
  ('put oneself in sb''s shoes'),
  ('put sth back'),
  ('put sth. to good use'),
  ('ready to do sth'),
  ('run low (on sth)'),
  ('share sth with sb'),
  ('show interest in sth'),
  ('show sb around'),
  ('stick to sth'),
  ('stop sth from doing'),
  ('succeed in doing sth'),
  ('take sb''s breath away'),
  ('take sb''s temperature'),
  ('to sb''s surprise'),
  ('try one''s best'),
  ('unlock the secrets of sth');

INSERT INTO vocab_word_banks (word_id, bank_id)
SELECT w.id, b.id FROM _mount_gaokao m
  JOIN vocab_words w ON lower(w.headword) = m.headword
  JOIN vocab_banks b ON b.code = 'gaokao'
ON CONFLICT DO NOTHING;

INSERT INTO vocab_word_banks (word_id, bank_id)
SELECT w.id, b.id FROM _mount_zhongkao m
  JOIN vocab_words w ON lower(w.headword) = m.headword
  JOIN vocab_banks b ON b.code = 'zhongkao'
ON CONFLICT DO NOTHING;

-- ── 同步 total_words:前端拿它当分母 ──────────────────────────
-- ⚠️ 现场数,不写死;**全库**一起校,不只本次动过的两个。幂等,重复跑无副作用。
UPDATE vocab_banks b
   SET total_words = (SELECT count(*) FROM vocab_word_banks m WHERE m.bank_id = b.id)
 WHERE b.total_words IS DISTINCT FROM
       (SELECT count(*) FROM vocab_word_banks m WHERE m.bank_id = b.id);

SELECT 'AFTER' AS stage, b.code, b.total_words AS 元数据,
       (SELECT count(*) FROM vocab_word_banks m WHERE m.bank_id = b.id) AS 实挂
  FROM vocab_banks b WHERE b.code IN ('zhongkao','gaokao') ORDER BY b.code;

-- ── 断言:判终态,不判这一次改了多少 ──────────────────────────
DO $gate$
DECLARE v_n int;
BEGIN
  -- ⑴ 临时表非空(空表会让下面每条断言真空通过)
  SELECT count(*) INTO v_n FROM _mount_gaokao;
  IF v_n <> 55 THEN RAISE EXCEPTION 'gaokao 名单应 55 行,实际 %', v_n; END IF;
  SELECT count(*) INTO v_n FROM _mount_zhongkao;
  IF v_n <> 50 THEN RAISE EXCEPTION 'zhongkao 名单应 50 行,实际 %', v_n; END IF;

  -- ⑵ 名单里每个词都真的在 vocab_words 里(词条 SQL 没跑就会在这里炸)
  SELECT count(*) INTO v_n FROM _mount_gaokao m
   WHERE NOT EXISTS (SELECT 1 FROM vocab_words w WHERE lower(w.headword) = m.headword);
  IF v_n <> 0 THEN RAISE EXCEPTION '有 % 个词还没建词条 —— 先跑 vocab_textbookslots_words.sql', v_n; END IF;

  -- ⑶ 终态:名单里每个词都已挂在对应库上
  SELECT count(*) INTO v_n FROM _mount_gaokao m
    JOIN vocab_words w ON lower(w.headword) = m.headword
   WHERE NOT EXISTS (SELECT 1 FROM vocab_word_banks wb JOIN vocab_banks b ON b.id = wb.bank_id
                      WHERE wb.word_id = w.id AND b.code = 'gaokao');
  IF v_n <> 0 THEN RAISE EXCEPTION '还有 % 个词没挂进 gaokao', v_n; END IF;

  SELECT count(*) INTO v_n FROM _mount_zhongkao m
    JOIN vocab_words w ON lower(w.headword) = m.headword
   WHERE NOT EXISTS (SELECT 1 FROM vocab_word_banks wb JOIN vocab_banks b ON b.id = wb.bank_id
                      WHERE wb.word_id = w.id AND b.code = 'zhongkao');
  IF v_n <> 0 THEN RAISE EXCEPTION '还有 % 个词没挂进 zhongkao', v_n; END IF;

  -- ⑷ **全库** total_words 与实挂条数一致 —— 漏了这条,用户看到的进度条分母就是错的
  SELECT count(*) INTO v_n FROM vocab_banks b
   WHERE b.total_words IS DISTINCT FROM
         (SELECT count(*) FROM vocab_word_banks m WHERE m.bank_id = b.id);
  IF v_n <> 0 THEN RAISE EXCEPTION '全库有 % 个词库的 total_words 与实挂条数对不上', v_n; END IF;

  -- ⑸ 挂进去的词都有释义 —— 空卡是这一步最怕的事故
  SELECT count(*) INTO v_n FROM _mount_gaokao m
    JOIN vocab_words w ON lower(w.headword) = m.headword
   WHERE w.def_zh IS NULL;
  IF v_n <> 0 THEN RAISE EXCEPTION '有 % 个词没有释义就被挂进词库(空卡)—— 先跑内容 SQL', v_n; END IF;
END
$gate$;

COMMIT;
