-- 托福 batch1 补插:congressional
--
-- 背景:此前按「美国政体专名」的范围理由把 congressional 从词表剔除并从 DB 删掉,
--       该裁决已撤销 —— 剔词标准只认内容质量实测,不认话题范围
--       (照范围口径推下去 senator / presidency / amendment 都得剔,而它们
--        都是托福阅读的正经高频词)。故把 congressional 插回。
--
--       democrat 保持剔除(两轮生成都产出错误英语 Democrat Party / democrat voters,
--       属机器闸门兜不住的构词陷阱),不在本 SQL 内。
--       congressman 词频第 504 位,本来就不在 batch1 前 200 内,DB 里从来没有过,
--       无需补插;它已回到词池,将来批次会自然覆盖。
--
-- 跑之前 vocab_words 应为 198,跑完 199。
-- ⚠️ 由 Aaron 执行。脚本本身从不写库。

BEGIN;

SELECT 'BEFORE' AS stage,
       (SELECT count(*) FROM vocab_words) AS words,
       (SELECT count(*) FROM vocab_word_banks
         WHERE bank_id = (SELECT id FROM vocab_banks WHERE code = 'toefl')) AS toefl_links;

-- ① 词条(幂等:走 lower(headword) 唯一索引)
INSERT INTO vocab_words (headword, pos, freq_rank) VALUES
('congressional', 'adj.', 2309)
ON CONFLICT (lower(headword)) DO UPDATE
  SET pos        = COALESCE(EXCLUDED.pos, vocab_words.pos),
      freq_rank  = COALESCE(EXCLUDED.freq_rank, vocab_words.freq_rank),
      updated_at = now();

-- ② 挂到 toefl 词库
INSERT INTO vocab_word_banks (word_id, bank_id)
SELECT w.id, b.id
  FROM vocab_words w
  CROSS JOIN (SELECT id FROM vocab_banks WHERE code = 'toefl') b
 WHERE lower(w.headword) = 'congressional'
ON CONFLICT (word_id, bank_id) DO NOTHING;

SELECT 'AFTER' AS stage,
       (SELECT count(*) FROM vocab_words) AS words,
       (SELECT count(*) FROM vocab_word_banks
         WHERE bank_id = (SELECT id FROM vocab_banks WHERE code = 'toefl')) AS toefl_links;

-- ── count-validate:四行都必须是 t,否则 ROLLBACK ──
SELECT 'words = 199' AS expect,
       (SELECT count(*) FROM vocab_words) = 199 AS ok
UNION ALL
SELECT 'toefl_links = 199',
       (SELECT count(*) FROM vocab_word_banks
         WHERE bank_id = (SELECT id FROM vocab_banks WHERE code = 'toefl')) = 199
UNION ALL
SELECT 'congressional 已入库且挂在 toefl 下',
       EXISTS (SELECT 1 FROM vocab_words w
                 JOIN vocab_word_banks wb ON wb.word_id = w.id
                 JOIN vocab_banks b ON b.id = wb.bank_id AND b.code = 'toefl'
                WHERE lower(w.headword) = 'congressional')
UNION ALL
SELECT 'democrat 仍不在库(应保持剔除)',
       NOT EXISTS (SELECT 1 FROM vocab_words WHERE lower(headword) = 'democrat');

COMMIT;
