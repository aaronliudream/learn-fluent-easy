-- ⛔ SUPERSEDED —— 已被重出的主 SQL(DONE_vocab_toefl_syllables.sql)整体覆盖,勿单独重跑。
-- Aaron 查库实证:avant-garde / broad-brimmed / baby-sitter 的音节数组均已无连字符。
-- G 段连字符归一化补丁 —— 16 词(2026-08-07)
--
-- ⚠️ 为什么需要这个补丁:交接说明里写的是「Aaron 未跑库,直接改源」,但实况相反 ——
--    DONE_vocab_toefl_syllables.sql 头部写着「✅ DONE 2026-08-07 已执行」,
--    库内实证 4471/4471 已回填。所以**只改源文件不够,库里这 16 行已经是错的**,必须打这个补丁。
--
-- 约定(A 方案,Web Claude 拍板):连字符保留在**前一音节末尾**。
--    baby-sitter → ba / by- / sit / ter
--    avant-garde → a / vant- / garde
--
-- 逃逸原因:原 y1 闸两边都套 regexp_replace('[^a-zA-Z]','') 把标点剥掉再比,
--    'a'+'vant'+'garde' = "avantgarde" 于是和 "avant-garde" 判等,连字符丢了照样过闸。
--    本文件把 y1 收紧成逐字符严格相等,并新增 y3 连字符专项(源文件同步已改)。
--
-- 实测前置(2026-08-07 现查 DB):
--    · 含连字符 headword 共 18 个;其中 16 个 syllables 丢了连字符,
--      cast-iron → cast-/iron 与 hands-on → hands-/on 本来就对(不在本文件内,不动)。
--    · 全库严格拼接不符的恰好 16 条,且全部是连字符词(其余 4455 条本来就满足)→ 收紧 y1 不误伤。
--    · headword 无大写(0 条)、无撇号/空格/句点(各 0 条)→ 连字符是唯一的分隔符情形。
--
-- 只改 syllables 文本数组,syllable_ipa 一个字符不动(音节数不变,y2 自然仍成立)。
-- UPDATE-only,幂等,重跑无害。

BEGIN;

SELECT 'BEFORE' AS stage,
       count(*) FILTER (WHERE lower(array_to_string(syllables,'')) IS DISTINCT FROM lower(headword)) AS strict_mismatch
  FROM vocab_words WHERE syllables IS NOT NULL;
-- 期望 BEFORE = 16

UPDATE vocab_words w
   SET syllables = v.syllables, updated_at = now()
  FROM (VALUES
  ('avant-garde', ARRAY['a', 'vant-', 'garde']::text[]),
  ('baby-sitter', ARRAY['ba', 'by-', 'sit', 'ter']::text[]),
  ('broad-brimmed', ARRAY['broad-', 'brimmed']::text[]),
  ('by-product', ARRAY['by-', 'pro', 'duct']::text[]),
  ('eye-catching', ARRAY['eye-', 'catch', 'ing']::text[]),
  ('far-reaching', ARRAY['far-', 'reach', 'ing']::text[]),
  ('long-lasting', ARRAY['long-', 'last', 'ing']::text[]),
  ('long-range', ARRAY['long-', 'range']::text[]),
  ('long-standing', ARRAY['long-', 'stand', 'ing']::text[]),
  ('self-sufficient', ARRAY['self-', 'suf', 'fi', 'cient']::text[]),
  ('short-range', ARRAY['short-', 'range']::text[]),
  ('thousand-fold', ARRAY['thou', 'sand-', 'fold']::text[]),
  ('three-dimensional', ARRAY['three-', 'di', 'men', 'sion', 'al']::text[]),
  ('time-consuming', ARRAY['time-', 'con', 'su', 'ming']::text[]),
  ('wedge-shaped', ARRAY['wedge-', 'shaped']::text[]),
  ('well-being', ARRAY['well-', 'be', 'ing']::text[])
  ) AS v(headword, syllables)
 WHERE lower(w.headword) = v.headword;

-- ── validate:五行都必须是 t,否则 ROLLBACK ──
SELECT 'y0 有音节的词 = 4471' AS expect,
       (SELECT count(*) FROM vocab_words WHERE syllables IS NOT NULL) = 4471 AS ok
UNION ALL
SELECT 'y2 两个数组逐词等长',
       NOT EXISTS (SELECT 1 FROM vocab_words WHERE syllables IS NOT NULL
                    AND array_length(syllables, 1) IS DISTINCT FROM array_length(syllable_ipa, 1))
UNION ALL
SELECT 'y1 音节拼接逐字符等于原词(核心闸,已收紧)',
       NOT EXISTS (
         SELECT 1 FROM vocab_words
          WHERE syllables IS NOT NULL
            AND lower(array_to_string(syllables, '')) IS DISTINCT FROM lower(headword)
       )
UNION ALL
SELECT 'y3 连字符个数与音节末尾的 - 一一对应',
       NOT EXISTS (
         SELECT 1 FROM vocab_words w
          WHERE w.syllables IS NOT NULL
            AND (SELECT count(*) FROM unnest(w.syllables) AS s WHERE s LIKE '%-')
                IS DISTINCT FROM (length(w.headword) - length(replace(w.headword, '-', '')))::bigint
       )
UNION ALL
SELECT 'y4 没有空音节段',
       NOT EXISTS (SELECT 1 FROM vocab_words, unnest(syllables) AS s
                    WHERE syllables IS NOT NULL AND btrim(s) = '');

-- 人眼对照:18 条连字符词改后全貌(应每条都是 t)
SELECT headword,
       array_to_string(syllables, '/') AS syllables,
       lower(array_to_string(syllables,'')) = lower(headword) AS y1_ok
  FROM vocab_words
 WHERE headword LIKE '%-%'
 ORDER BY headword;

COMMIT;

-- 渲染备注(前端 join 时):
--   音节之间默认插分隔点 ·,但**前一 token 以 '-' 结尾时不插**,
--   否则会渲染成 "ba·by-·sit·ter"。正确形态:ba·by-sit·ter。
