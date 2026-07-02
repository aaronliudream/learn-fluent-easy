-- ============================================================
-- 美语课程 · 修复 american_amencontrast 重复行 + 补幂等唯一约束
-- ============================================================
-- 背景:该表原缺内容唯一约束,seed 用裸 ON CONFLICT DO NOTHING(id=自动 uuid,永不冲突)
--      → 每跑一次 seed 就整份重插对照卡。实测(2026-07-02 anon 查库):
--        unit1 各课被灌 3 次(am1_l01=15 应为 5)、unit2 各课 1 次(正确)。
-- 本脚本:①去重(每 lesson_id+us 保留最早一行)②加 UNIQUE(lesson_id,us) 幂等键。
-- 执行:Aaron service role。**先跑本脚本,再跑 american_phase1_seed.sql**
--       (seed 已改 ON CONFLICT (lesson_id,us) DO UPDATE,需此约束存在才不报错)。
-- 项目 ref: degqpiiddkxcuzwombwp
-- ============================================================

BEGIN;

-- 前:每课行数(应看到 unit1 ×3 之类)
-- SELECT lesson_id, count(*) FROM public.american_amencontrast GROUP BY 1 ORDER BY 1;

-- ① 去重:同 (lesson_id, us) 只保留 id 最小的一行
DELETE FROM public.american_amencontrast a
USING public.american_amencontrast b
WHERE a.lesson_id = b.lesson_id
  AND a.us = b.us
  AND a.id > b.id;

-- ② 补唯一约束(幂等:已存在则跳过)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.american_amencontrast'::regclass
      AND conname = 'american_amencontrast_lesson_id_us_key'
  ) THEN
    ALTER TABLE public.american_amencontrast
      ADD CONSTRAINT american_amencontrast_lesson_id_us_key UNIQUE (lesson_id, us);
  END IF;
END $$;

COMMIT;

-- 校验:去重后每课应为对照卡真实数(unit1 L1=5、L2-6=4;unit2 L7=5、L8-12=4)
SELECT lesson_id, count(*) AS n
FROM public.american_amencontrast
GROUP BY lesson_id ORDER BY lesson_id;
