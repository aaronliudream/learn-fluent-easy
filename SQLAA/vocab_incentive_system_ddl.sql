-- ═══════════════════════════════════════════════════════════════
-- PR-6 学习激励系统 · 建表(纯 schema,零内容)
--
-- 四件事:学习时长 / 每日目标 / 打卡连续天数 / 积分。
-- 两张表:
--   vocab_user_stats  每人一行的累计量(积分、连续天数、目标档)
--   vocab_study_days  逐日明细(时长、答题数)—— 连续天数和"今日 X 分钟"都从它算
--
-- ⚠️ 为什么逐日明细要单独一张表,而不是往 user_stats 塞 today_seconds:
--    ① 跨天归零要靠定时任务或读时判断,两者都容易在时区/断网时算错;
--       逐日行天然带日期,读哪天就是哪天。
--    ② 连续天数、周报、成长图都要历史,单值列一旦覆盖就永远补不回来
--       (成长图那次的教训:逐日历史事后补不回来)。
--
-- ⚠️ RLS own-row:每人只能读写自己那行。与 vocab_words 那类公共只读表不同,
--    这是**用户数据**,策略必须带 auth.uid() 判定,不能 USING (true)。
--
-- ⚠️ 由 Aaron 执行。末尾 count-validate,任一行不是 t 就 ROLLBACK。
-- ⚠️ 本文件只建表。PR-6 开工时前端才接线,现在跑了也不影响任何现有功能。
-- ═══════════════════════════════════════════════════════════════

BEGIN;

SELECT 'BEFORE' AS stage,
       (SELECT count(*) FROM information_schema.tables WHERE table_schema='public'
         AND table_name IN ('vocab_user_stats','vocab_study_days')) AS tables;

-- ═══ ① 每人一行的累计量 ═══
CREATE TABLE IF NOT EXISTS public.vocab_user_stats (
  user_id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points     integer NOT NULL DEFAULT 0,   -- 只增不减(掌握回退不扣分)
  total_correct    integer NOT NULL DEFAULT 0,
  total_time_ms    bigint  NOT NULL DEFAULT 0,   -- ⚠️ bigint:毫秒累计,integer 约 24 天就溢出
  daily_goal       integer NOT NULL DEFAULT 20,  -- 10 / 20 / 30 / 50
  current_streak   integer NOT NULL DEFAULT 0,
  longest_streak   integer NOT NULL DEFAULT 0,   -- 留档给分享卡
  last_active_date date,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- 幂等补列(表若在早前部分执行里已建,上面的 CREATE 会整个跳过)
ALTER TABLE public.vocab_user_stats
  ADD COLUMN IF NOT EXISTS total_points     integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_correct    integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_time_ms    bigint  NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS daily_goal       integer NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS current_streak   integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS longest_streak   integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_active_date date,
  ADD COLUMN IF NOT EXISTS created_at       timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at       timestamptz NOT NULL DEFAULT now();

-- 目标档位收敛到四档 —— 前端只给这四个选项,DB 兜底防脏数据
ALTER TABLE public.vocab_user_stats DROP CONSTRAINT IF EXISTS vocab_user_stats_goal_chk;
ALTER TABLE public.vocab_user_stats
  ADD CONSTRAINT vocab_user_stats_goal_chk CHECK (daily_goal IN (10, 20, 30, 50));

-- 只增不减是业务规则,DB 这层只兜"不能为负"
ALTER TABLE public.vocab_user_stats DROP CONSTRAINT IF EXISTS vocab_user_stats_nonneg_chk;
ALTER TABLE public.vocab_user_stats
  ADD CONSTRAINT vocab_user_stats_nonneg_chk
  CHECK (total_points >= 0 AND total_correct >= 0 AND total_time_ms >= 0
         AND current_streak >= 0 AND longest_streak >= 0);

-- ═══ ② 逐日明细 ═══
CREATE TABLE IF NOT EXISTS public.vocab_study_days (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day        date NOT NULL,
  seconds    integer NOT NULL DEFAULT 0,   -- 活跃时长,切后台暂停后 flush 上来的累计
  answers    integer NOT NULL DEFAULT 0,   -- 当天作答题数,用于"今日 12/20"
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.vocab_study_days
  ADD COLUMN IF NOT EXISTS seconds    integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS answers    integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- ⚠️ 唯一约束是 flush 幂等的基础:每 30 秒一次的心跳走
--    ON CONFLICT (user_id, day) DO UPDATE,没有它会一天写出上百行。
CREATE UNIQUE INDEX IF NOT EXISTS vocab_study_days_uq ON public.vocab_study_days (user_id, day);
-- 连续天数要倒序扫最近若干天,按 (user_id, day desc) 建索引
CREATE INDEX IF NOT EXISTS vocab_study_days_user_day_idx ON public.vocab_study_days (user_id, day DESC);

ALTER TABLE public.vocab_study_days DROP CONSTRAINT IF EXISTS vocab_study_days_nonneg_chk;
ALTER TABLE public.vocab_study_days
  ADD CONSTRAINT vocab_study_days_nonneg_chk CHECK (seconds >= 0 AND answers >= 0);

-- ═══ ③ RLS:own-row ═══
-- ⚠️ 这是用户数据,不是公共内容表。策略必须带 auth.uid() 判定;
--    写成 USING (true) 等于把所有人的学习记录对全网公开。
ALTER TABLE public.vocab_user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocab_study_days ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS vus_select_own ON public.vocab_user_stats;
DROP POLICY IF EXISTS vus_insert_own ON public.vocab_user_stats;
DROP POLICY IF EXISTS vus_update_own ON public.vocab_user_stats;
CREATE POLICY vus_select_own ON public.vocab_user_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY vus_insert_own ON public.vocab_user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY vus_update_own ON public.vocab_user_stats FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS vsd_select_own ON public.vocab_study_days;
DROP POLICY IF EXISTS vsd_insert_own ON public.vocab_study_days;
DROP POLICY IF EXISTS vsd_update_own ON public.vocab_study_days;
CREATE POLICY vsd_select_own ON public.vocab_study_days FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY vsd_insert_own ON public.vocab_study_days FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY vsd_update_own ON public.vocab_study_days FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- ⚠️ 故意**不建 DELETE 策略**:学习记录不该被前端删掉。
--    真要清理走 service role。

SELECT 'AFTER' AS stage,
       (SELECT count(*) FROM information_schema.tables WHERE table_schema='public'
         AND table_name IN ('vocab_user_stats','vocab_study_days')) AS tables;

-- ── count-validate:六行都必须是 t,否则 ROLLBACK ──
SELECT '两张表都在' AS expect,
       (SELECT count(*) FROM information_schema.tables WHERE table_schema='public'
         AND table_name IN ('vocab_user_stats','vocab_study_days')) = 2 AS ok
UNION ALL
SELECT 'total_time_ms 是 bigint(integer 约 24 天就溢出)',
       EXISTS (SELECT 1 FROM information_schema.columns
                WHERE table_schema='public' AND table_name='vocab_user_stats'
                  AND column_name='total_time_ms' AND data_type='bigint')
UNION ALL
SELECT 'daily_goal 默认 20 且限定四档',
       (SELECT column_default FROM information_schema.columns
         WHERE table_schema='public' AND table_name='vocab_user_stats' AND column_name='daily_goal') LIKE '20%'
       AND EXISTS (SELECT 1 FROM pg_constraint
                    WHERE conrelid='public.vocab_user_stats'::regclass AND conname='vocab_user_stats_goal_chk')
UNION ALL
SELECT '(user_id, day) 唯一(flush 幂等的基础)',
       EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='vocab_study_days_uq')
UNION ALL
SELECT '两张表都开了 RLS',
       (SELECT bool_and(relrowsecurity) FROM pg_class
         WHERE oid IN ('public.vocab_user_stats'::regclass,'public.vocab_study_days'::regclass))
UNION ALL
SELECT '策略都是 own-row 且没有 DELETE 策略',
       (SELECT count(*) FROM pg_policies WHERE schemaname='public'
         AND tablename IN ('vocab_user_stats','vocab_study_days')) = 6
       AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public'
                        AND tablename IN ('vocab_user_stats','vocab_study_days') AND cmd='DELETE')
       AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public'
                        AND tablename IN ('vocab_user_stats','vocab_study_days')
                        AND coalesce(qual,'') = 'true');

COMMIT;
