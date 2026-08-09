-- 孤儿词 fagot —— ⚠️ 这一份**要你先看一眼再决定跑不跑**,不是机械修数。
--
-- ══ 库内实证(2026-08-09 现查)══════════════════════════════════
--   vocab_words 里 def_zh IS NULL 的行:**1 行**(def_zh='' 空串:0 行)
--     id        fec57aa7-5629-4033-bb6f-6c1818844ce0
--     headword  fagot
--     pos       n./v.
--     def_zh    NULL
--     def_en    NULL
--     freq_rank NULL
--     挂库数    0        ← 不属于任何一个词库
--
--   它就是 "vocab_words 4471 行 vs vocab_word_banks 4470 行" 那 1 行差额的来源。
--
-- ══ 现在对用户的影响:零 ════════════════════════════════════════
--   `listBankWords` 带 `.not("def_zh","is",null)` 过滤,而且它一个库都没挂 ——
--   **任何页面都取不到它**。所以这不是线上事故,是一条对不上账的脏数据。
--
-- ══ 为什么建议删而不是补释义 ═══════════════════════════════════
--   `fagot` 是 `faggot` 的异体拼写。它确有一个古旧义项(一捆柴),
--   但在现代英语里,这个词首先是一个**针对同性恋者的侮辱语**。
--   这是一个面向中国 K-12 学生的英语产品:
--     · 补上释义 = 它会进词表、进四选一、进听写、进磨耳朵的自动朗读;
--     · 学生学到的是一个自己用出去会伤人、也会给自己惹麻烦的词;
--     · 它 freq_rank 为空、不属于任何词库,说明**本来也没人打算教它** ——
--       它更像一次词表导入的残渣,而不是有人选进来的。
--   所以删掉是把一条本来就不该在这里的行清掉,不是"回避难词"。
--
--   如果你判断要留(比如打算做"阅读时可能遇到但不主动教"的词库),
--   那就**别跑这份 SQL**,改成给它补 def_zh/def_en 并明确挂到某个库上 ——
--   但请注意上面那条:凡进了词库的词都会被自动朗读出来。
--
-- ⚠️ 删之前先确认它没有任何用户学习记录(下面第一段查询)。有的话先别删,叫我。

BEGIN;

-- ① 前置:它有没有被任何用户学过 / 进过错题本 / 被收藏
SELECT 'user_vocab_mastery' AS 表, count(*) AS 行数
FROM user_vocab_mastery WHERE word_id = 'fec57aa7-5629-4033-bb6f-6c1818844ce0'
UNION ALL
SELECT 'vocab_mistake_book', count(*)
FROM vocab_mistake_book WHERE word_id = 'fec57aa7-5629-4033-bb6f-6c1818844ce0'
UNION ALL
SELECT 'vocab_word_banks', count(*)
FROM vocab_word_banks WHERE word_id = 'fec57aa7-5629-4033-bb6f-6c1818844ce0'
UNION ALL
SELECT 'vocab_examples', count(*)
FROM vocab_examples WHERE word_id = 'fec57aa7-5629-4033-bb6f-6c1818844ce0';

-- ② 改前计数
SELECT '改前' AS 阶段, count(*) AS vocab_words 行数 FROM vocab_words;

-- ③ 删。⚠️ 带 headword 双重限定,避免 id 抄错时误删别的词。
DELETE FROM vocab_words
WHERE id = 'fec57aa7-5629-4033-bb6f-6c1818844ce0'
  AND headword = 'fagot'
  AND def_zh IS NULL;

-- ④ 改后计数:应为 4470,且 def_zh IS NULL 归零
SELECT '改后' AS 阶段, count(*) AS vocab_words 行数 FROM vocab_words;
SELECT count(*) AS 仍缺 def_zh 的行数 FROM vocab_words WHERE def_zh IS NULL;

-- ⑤ 硬断言:只该删掉 1 行,且不再有缺释义的词
DO $$
DECLARE nulls int; total int;
BEGIN
  SELECT count(*) INTO nulls FROM vocab_words WHERE def_zh IS NULL;
  SELECT count(*) INTO total FROM vocab_words;
  IF nulls <> 0 THEN
    RAISE EXCEPTION '还有 % 行缺 def_zh,已回滚', nulls;
  END IF;
  IF total <> 4470 THEN
    RAISE EXCEPTION 'vocab_words 应为 4470 行,实际 % 行,已回滚', total;
  END IF;
END $$;

COMMIT;

-- ⚠️ 跑完这份之后,请**重新跑一遍** 20260809_vocab_bank_total_words_fix.sql,
--    让 toefl 的 total_words 与新的实挂数再对一次(那份是幂等的,重复跑安全)。
