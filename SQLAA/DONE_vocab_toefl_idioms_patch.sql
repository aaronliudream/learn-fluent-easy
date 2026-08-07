-- ✅ DONE 2026-08-07 已执行,Aaron 回报 validate 四条全 t
-- H 段补丁 —— 删 1 增 1 改 3(Aaron 审 50 条后)
--
-- 【删】kick the bucket —— 粗俗戏谑说法(≈中文"蹬腿了"),违反本段
--       "排除粗俗俚语"的选品口径;且例句用戏谑语说高寿去世,措辞冲突。
-- 【增】on the same page —— 职场超高频,补足 50 条。
-- 【改】the last straw:汉语已借同一典故,"最后一根稻草"不构成直译陷阱,
--       陷阱从**义**转到**用法**。
--       hit the jackpot:中文栏与 trap 不一致,统一为"中大奖;大获成功"。
--       break the bank:"倾家荡产"过重,实际多用否定式表"不至于太贵"。
-- ⚠️ 由 Aaron 执行。

BEGIN;

DELETE FROM vocab_chunks WHERE lower(chunk) = 'kick the bucket' AND type = 'idiom';

INSERT INTO vocab_chunks (chunk, type, translation_zh, literal_trap, scene, example_en, example_zh, freq_rank)
VALUES ('on the same page', 'idiom', '达成共识', '字面"在同一页",实为"看法一致"', 'work', 'Let us make sure everyone is on the same page before the launch.', '发布前我们要确保每个人都达成共识。', 50)
ON CONFLICT (lower(chunk)) DO UPDATE SET translation_zh = EXCLUDED.translation_zh,
  literal_trap = EXCLUDED.literal_trap, scene = EXCLUDED.scene,
  example_en = EXCLUDED.example_en, example_zh = EXCLUDED.example_zh, updated_at = now();

UPDATE vocab_chunks w SET translation_zh = v.zh, literal_trap = v.trap, updated_at = now()
  FROM (VALUES
  ('the last straw', '最后一根稻草', '字面"最后一根稻草",实指"压垮忍耐的那件事"'),
  ('hit the jackpot', '中大奖；大获成功', '字面"中头奖",实为"获得巨大成功"'),
  ('break the bank', '花费过多', '字面"把银行弄破产",实为"花费过多"')
  ) AS v(chunk, zh, trap)
 WHERE lower(w.chunk) = v.chunk AND w.type = 'idiom';

-- ── count-validate:四行都必须是 t ──
SELECT 'idiom 仍是 50 条' AS expect,
       (SELECT count(*) FROM vocab_chunks WHERE type='idiom') = 50 AS ok
UNION ALL
SELECT 'kick the bucket 已删',
       NOT EXISTS (SELECT 1 FROM vocab_chunks WHERE lower(chunk)='kick the bucket')
UNION ALL
SELECT 'on the same page 已入',
       EXISTS (SELECT 1 FROM vocab_chunks WHERE lower(chunk)='on the same page' AND type='idiom')
UNION ALL
SELECT '每条 idiom 的 trap 仍点出字面义与实际义',
       NOT EXISTS (SELECT 1 FROM vocab_chunks WHERE type='idiom'
                    AND NOT (literal_trap LIKE '%字面%' AND literal_trap ~ '实为|实指|实际'));

COMMIT;
