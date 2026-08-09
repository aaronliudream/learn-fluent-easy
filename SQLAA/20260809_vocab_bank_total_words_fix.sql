-- 词库 total_words 元数据对齐(纯元数据,不动任何一个词、任何一条用户记录)
--
-- ══ 库内实证(2026-08-09 用 anon key 现查,不是凭记忆)══════════════════
-- 逐库比对 vocab_banks.total_words 与 vocab_word_banks 的实挂条数:
--
--   code      active  total_words   实挂    差
--   zhongkao    0        1600         0   -1600
--   gaokao      0        3500         0   -3500
--   ket_pet     0        3500         0   -3500
--   cet4        0        4500         0   -4500
--   cet6        0        5500         0   -5500
--   kaoyan      0        5500         0   -5500
--   ielts       0        8000         0   -8000
--   gmat        0        3000         0   -3000
--   toefl       1        4473      4470      -3
--   nce         0           0         0       0
--   gre         0           0         0       0
--
--   vocab_words 总行数 = 4471 · vocab_word_banks 总行数 = 4470
--
-- ══ 两类问题 ══════════════════════════════════════════════════════
-- ① 未上线的 8 个库写着 1600~8000,而一个词都没挂 —— 那是**计划值当成了实测值**。
--    前端凡是拿 total_words 当分母的地方(词库页进度、快筛池子大小)全会算错。
--    这类库现在对用户不可见(is_active=false),所以是隐患不是事故 —— 但一旦开灯就是事故。
--    归 0 = 说实话:现在确实一个词都没有。将来灌词时随灌随更新。
--
-- ② toefl 写 4473、实挂 4470,差 3。**根因未查明**(报告里也标了"这个数最初从哪来"未知)。
--    4471 - 4470 = 1 是那条 def_zh/def_en 全空、且没挂任何库的孤儿行 fagot
--    (单独一份 SQL 处理,见 20260809_vocab_orphan_word_fagot.sql);
--    剩下 2 的来源查不到,不编。这里只把 total_words 校成**实挂数**,
--    因为实挂数是唯一可复算的口径。
--
-- ⚠️ 不写死 4470,而是**从 vocab_word_banks 现场数**:
--    如果在你跑之前又灌了词,写死的数字当场就是新的错值。
-- ⚠️ 这份 SQL 幂等,重复跑无副作用。

BEGIN;

-- ── 跑之前:留一份现状 ──────────────────────────────────────────
SELECT '改前' AS 阶段, b.code, b.is_active, b.total_words AS 元数据,
       (SELECT count(*) FROM vocab_word_banks m WHERE m.bank_id = b.id) AS 实挂
FROM vocab_banks b
ORDER BY b.sort_order;

-- ── 改:total_words 一律等于实挂条数 ────────────────────────────
UPDATE vocab_banks b
SET total_words = (SELECT count(*) FROM vocab_word_banks m WHERE m.bank_id = b.id)
WHERE b.total_words IS DISTINCT FROM
      (SELECT count(*) FROM vocab_word_banks m WHERE m.bank_id = b.id);

-- ── 跑之后:必须全部 差=0 ──────────────────────────────────────
SELECT '改后' AS 阶段, b.code, b.is_active, b.total_words AS 元数据,
       (SELECT count(*) FROM vocab_word_banks m WHERE m.bank_id = b.id) AS 实挂,
       b.total_words - (SELECT count(*) FROM vocab_word_banks m WHERE m.bank_id = b.id) AS 差
FROM vocab_banks b
ORDER BY b.sort_order;

-- ── 硬断言:还有对不齐的就整笔回滚,别留半吊子 ──────────────────
DO $$
DECLARE bad int;
BEGIN
  SELECT count(*) INTO bad
  FROM vocab_banks b
  WHERE b.total_words IS DISTINCT FROM
        (SELECT count(*) FROM vocab_word_banks m WHERE m.bank_id = b.id);
  IF bad > 0 THEN
    RAISE EXCEPTION '还有 % 个库的 total_words 与实挂数不符,已回滚', bad;
  END IF;
END $$;

COMMIT;
