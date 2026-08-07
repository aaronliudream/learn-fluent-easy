-- ✅ DONE 2026-08-07 已执行,Aaron 回报已执行成功;库内复核五条全 t(不在 toefl 库/无例句/无搭配/释义已清/4470 词)
-- fagot 移除 —— A 段幻觉漏网,整词从 toefl 库摘除
--
-- ⚠️ 为什么必须删而不是改:
--   `fagot` 的 def_zh 被写成了「酒吧」,而这个词的实义是"一捆柴";
--   更要命的是它是一个歧视性词的异拼形。三条例句**全部建立在幻觉义上**:
--     fagot culture / fagot scene / fagot events(译文全是"酒吧文化/场景/活动")
--   改释义救不回来 —— 例句得整套重写,而这个词本身也不该出现在学生词表里。
--
-- 处理方式(Aaron 定):从 toefl 库 unlink + 删例句 + 删搭配。
-- ⚠️ **vocab_words 那一行本身保留**:它是 bank-agnostic 的,别的库将来可能引用;
--    但把 def_zh / def_en / 例句清掉,免得幻觉内容以任何路径被读到。
--
-- ⚠️ 跑完 toefl 库的词数从 4471 变成 4470。之后所有 count-validate 用 4470。
-- ⚠️ 由 Aaron 执行。

BEGIN;

SELECT 'BEFORE' AS stage,
       (SELECT count(*) FROM vocab_word_banks wb
          JOIN vocab_words w ON w.id = wb.word_id
          JOIN vocab_banks b ON b.id = wb.bank_id
         WHERE b.code = 'toefl') AS toefl_words,
       (SELECT count(*) FROM vocab_examples e
          JOIN vocab_words w ON w.id = e.word_id
         WHERE lower(w.headword) = 'fagot') AS fagot_examples,
       (SELECT count(*) FROM vocab_collocations c
          JOIN vocab_words w ON w.id = c.word_id
         WHERE lower(w.headword) = 'fagot') AS fagot_collocations;

-- ① 例句(幻觉内容,三条全废)
DELETE FROM vocab_examples e
 USING vocab_words w
 WHERE e.word_id = w.id AND lower(w.headword) = 'fagot';

-- ② 搭配(F 段若已灌过,一并清;没灌过就是 0 行,无害)
DELETE FROM vocab_collocations c
 USING vocab_words w
 WHERE c.word_id = w.id AND lower(w.headword) = 'fagot';

-- ③ 从 toefl 库摘除
DELETE FROM vocab_word_banks wb
 USING vocab_words w, vocab_banks b
 WHERE wb.word_id = w.id AND wb.bank_id = b.id
   AND lower(w.headword) = 'fagot' AND b.code = 'toefl';

-- ④ 清空幻觉释义(词行保留,内容不留)
UPDATE vocab_words
   SET def_zh = NULL, def_en = NULL, updated_at = now()
 WHERE lower(headword) = 'fagot';

SELECT 'AFTER' AS stage,
       (SELECT count(*) FROM vocab_word_banks wb
          JOIN vocab_words w ON w.id = wb.word_id
          JOIN vocab_banks b ON b.id = wb.bank_id
         WHERE b.code = 'toefl') AS toefl_words,
       (SELECT count(*) FROM vocab_examples e
          JOIN vocab_words w ON w.id = e.word_id
         WHERE lower(w.headword) = 'fagot') AS fagot_examples;

-- ── count-validate:五行都必须是 t,否则 ROLLBACK ──
SELECT 'fagot 已不在 toefl 库' AS expect,
       NOT EXISTS (
         SELECT 1 FROM vocab_word_banks wb
           JOIN vocab_words w ON w.id = wb.word_id
           JOIN vocab_banks b ON b.id = wb.bank_id
          WHERE lower(w.headword) = 'fagot' AND b.code = 'toefl'
       ) AS ok
UNION ALL
SELECT 'fagot 没有残留例句',
       NOT EXISTS (SELECT 1 FROM vocab_examples e JOIN vocab_words w ON w.id = e.word_id
                    WHERE lower(w.headword) = 'fagot')
UNION ALL
SELECT 'fagot 没有残留搭配',
       NOT EXISTS (SELECT 1 FROM vocab_collocations c JOIN vocab_words w ON w.id = c.word_id
                    WHERE lower(w.headword) = 'fagot')
UNION ALL
SELECT 'fagot 释义已清空',
       (SELECT def_zh IS NULL AND def_en IS NULL FROM vocab_words WHERE lower(headword) = 'fagot')
UNION ALL
SELECT 'toefl 库现有 4470 词',
       (SELECT count(*) FROM vocab_word_banks wb
          JOIN vocab_banks b ON b.id = wb.bank_id
         WHERE b.code = 'toefl') = 4470;

COMMIT;
