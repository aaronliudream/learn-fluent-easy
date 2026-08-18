-- ══════════════════════════════════════════════════════════════════════
-- 【存档记录 · 不是待跑 SQL】商科词汇库(gmat)下架
-- ══════════════════════════════════════════════════════════════════════
-- 执行者:Cowork(直接对生产库执行,**没有经过本仓库**)
-- 执行时间:2026-08-17
-- 补记者:CC,2026-08-17 —— 补这一份是因为**原件不在仓库里**,
--         将来查"gmat 为什么是关的"会找不到出处。
--
-- ⚠️ 本文件**只作记录**。下面的 UPDATE 已经执行过了,不要再跑一遍。
--    真要重跑也无害(幂等),但没有任何意义。
--
-- ── 口径:为什么下架 ────────────────────────────────────────────────
-- gmat 不是一份独立词表,是从 GRE 词表按词频截出来的一段:
--     ingest 口径 = ECDICT `tag=gre` 且 freq_rank ≤ 15000
--     (见 scripts/vocab/ingest-toefl.mjs 的 DERIVED.gmat)
-- 实测:gmat 3,829 词**全部**也在 GRE 库里,独有词 0 个。
-- 后果:一个收费库里出现 school(频 125)、want(83)、down(118)、mean(154)
--       这类词 —— 词频 ≤1000 的有 53 个。挂着"商科学术词汇"的名字卖中考词。
-- 决定(Aaron):先下架,不删词。"商科学术词汇"到底该是
--       GMAT 考试高频词 / 商业实务词汇(amortization、arbitrage、leverage)/
--       学术论文常用词 —— 三个答案会得出三份完全不同的词表,那是产品决策。
--
-- ── 当时执行的语句 ────────────────────────────────────────────────
-- UPDATE vocab_banks SET is_active = false WHERE code = 'gmat';
--
-- ⚠️ **一个词都没删**:vocab_words 与 vocab_word_banks 未做任何改动。
--    下架只关闭展示,3,829 条挂载原样保留,随时可以再开。
--
-- ── 事后核对(CC 于 2026-08-17 现查生产库,库内实证)────────────────
--   gmat : is_active=false · is_free=false · total_words=3829 · 实际挂载=3829 ✓
--   gre  : is_active=true  · total_words=7470 · 实际挂载=7470
--          (7485 → 7470 是后来另一份清理 SQL 摘掉 15 个高频词所致,
--           见 DONE_vocab_cleanup_lowfreq_paid_banks.sql,与本次下架无关)
--   bank_id(gmat) = 6defb907-898b-4bed-90eb-950a76528983
--
-- ── 只读核对语句(要确认现状就跑这一段)────────────────────────────
/*
SELECT b.code, b.name_zh, b.is_active, b.is_free, b.total_words,
       (SELECT count(*) FROM vocab_word_banks wb WHERE wb.bank_id = b.id) AS actual_links,
       (SELECT count(*) FROM vocab_word_banks wb
         WHERE wb.bank_id = b.id
           AND NOT EXISTS (SELECT 1 FROM vocab_word_banks wb2
                            JOIN vocab_banks b2 ON b2.id = wb2.bank_id AND b2.code = 'gre'
                           WHERE wb2.word_id = wb.word_id)) AS gmat_only_words
  FROM vocab_banks b WHERE b.code IN ('gmat','gre');
-- 预期:gmat is_active=false · actual_links=3829 · gmat_only_words=0
*/

-- ── 撤销语句(要重新上架时用)──────────────────────────────────────
-- ⚠️ 故意注释掉:这份文件是存档,不该被"整份执行"时顺手把库又打开。
--    真要撤销,把下面三行取消注释单独跑。
--    ⚠️ 撤销前先想清楚:词表问题没解决,重新上架 = 又开始卖中考词。
/*
BEGIN;
UPDATE vocab_banks SET is_active = true WHERE code = 'gmat';
SELECT code, is_active FROM vocab_banks WHERE code = 'gmat';   -- 预期 t
COMMIT;
*/
