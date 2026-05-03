
-- ============ 1. 阶段测试定义表 ============
CREATE TABLE IF NOT EXISTS public.stage_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  segment text NOT NULL CHECK (segment IN ('primary','junior','gaokao')),
  grade int NOT NULL,
  scope text NOT NULL CHECK (scope IN ('unit','module','term','final')),
  unit_index int,
  title text NOT NULL,
  description text,
  required_lessons int NOT NULL DEFAULT 0,
  total_questions int NOT NULL DEFAULT 10,
  pass_threshold real NOT NULL DEFAULT 0.75,
  base_coins int NOT NULL DEFAULT 20,
  base_exp int NOT NULL DEFAULT 30,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.stage_tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stage_tests readable by all" ON public.stage_tests FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_stage_tests_segment_grade ON public.stage_tests(segment, grade, sort_order);

-- ============ 2. 用户测试尝试 ============
CREATE TABLE IF NOT EXISTS public.stage_test_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  test_id uuid NOT NULL REFERENCES public.stage_tests(id) ON DELETE CASCADE,
  attempt_no int NOT NULL DEFAULT 1,
  correct_count int NOT NULL DEFAULT 0,
  total_count int NOT NULL DEFAULT 0,
  new_question_count int NOT NULL DEFAULT 0,
  score real NOT NULL DEFAULT 0,
  passed boolean NOT NULL DEFAULT false,
  coins_awarded int NOT NULL DEFAULT 0,
  exp_awarded int NOT NULL DEFAULT 0,
  cooldown_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.stage_test_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stage_test_attempts own select" ON public.stage_test_attempts
  FOR SELECT USING (auth.uid() = user_id);
-- inserts go through SECURITY DEFINER function

CREATE INDEX IF NOT EXISTS idx_attempts_user_test ON public.stage_test_attempts(user_id, test_id, created_at DESC);

-- ============ 3. 列出测试 + 状态 ============
CREATE OR REPLACE FUNCTION public.list_stage_tests(_segment text, _grade int)
RETURNS TABLE(
  id uuid, scope text, unit_index int, title text, description text,
  required_lessons int, total_questions int, pass_threshold real,
  base_coins int, base_exp int, sort_order int,
  completed_lessons int, unlocked boolean,
  pass_count int, attempt_count int,
  cooldown_until timestamptz, best_score real,
  next_reward_coins int, next_reward_exp int
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE
  uid uuid := auth.uid();
  done_lessons int := 0;
BEGIN
  IF uid IS NULL THEN RETURN; END IF;

  -- 估算该学段+年级已完成课时数
  IF _segment = 'primary' THEN
    SELECT COUNT(DISTINCT lesson_key)::int INTO done_lessons
    FROM primary_game_scores WHERE user_id = uid;
    SELECT done_lessons + COALESCE((SELECT COUNT(*)::int FROM primary_reading_progress WHERE user_id = uid AND completed = true), 0) INTO done_lessons;
  ELSIF _segment = 'junior' THEN
    SELECT COUNT(DISTINCT lesson_key)::int INTO done_lessons
    FROM junior_game_scores WHERE user_id = uid;
  ELSIF _segment = 'gaokao' THEN
    SELECT COUNT(DISTINCT item_id)::int INTO done_lessons
    FROM gaokao_user_mastery WHERE user_id = uid AND mastery_level >= 1;
  END IF;

  RETURN QUERY
  WITH t AS (
    SELECT * FROM stage_tests WHERE segment = _segment AND grade = _grade
  ),
  agg AS (
    SELECT
      a.test_id,
      COUNT(*) FILTER (WHERE a.passed)::int AS passes,
      COUNT(*)::int AS attempts,
      MAX(a.cooldown_until) AS cd,
      MAX(a.score) AS best
    FROM stage_test_attempts a
    WHERE a.user_id = uid
    GROUP BY a.test_id
  )
  SELECT
    t.id, t.scope, t.unit_index, t.title, t.description,
    t.required_lessons, t.total_questions, t.pass_threshold,
    t.base_coins, t.base_exp, t.sort_order,
    done_lessons,
    (done_lessons >= t.required_lessons),
    COALESCE(agg.passes, 0),
    COALESCE(agg.attempts, 0),
    agg.cd,
    COALESCE(agg.best, 0)::real,
    -- 下次奖励预览（递减）
    CASE COALESCE(agg.passes, 0)
      WHEN 0 THEN t.base_coins
      WHEN 1 THEN (t.base_coins * 0.5)::int
      WHEN 2 THEN (t.base_coins * 0.25)::int
      ELSE 0
    END,
    CASE COALESCE(agg.passes, 0)
      WHEN 0 THEN t.base_exp
      WHEN 1 THEN (t.base_exp * 0.5)::int
      WHEN 2 THEN (t.base_exp * 0.25)::int
      ELSE 0
    END
  FROM t LEFT JOIN agg ON agg.test_id = t.id
  ORDER BY t.sort_order;
END $$;

-- ============ 4. 提交测试结果（核心：奖励 + 防作弊） ============
CREATE OR REPLACE FUNCTION public.submit_stage_test(
  _test_id uuid,
  _correct int,
  _total int,
  _new_question_count int DEFAULT 0
) RETURNS TABLE(
  passed boolean, score real,
  coins_awarded int, exp_awarded int,
  cooldown_until timestamptz, message text,
  new_balance int, new_pet_level int, evolved boolean
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  uid uuid := auth.uid();
  t stage_tests%ROWTYPE;
  prev_passes int := 0;
  prev_attempts int := 0;
  active_cd timestamptz;
  s real;
  did_pass boolean;
  award_coins_v int := 0;
  award_exp_v int := 0;
  new_qratio real;
  attempt_no_v int;
  cd timestamptz;
  msg text := '';
  bal int := 0;
  today_coin int := 0;
  today_exp int := 0;
  pet_id_v uuid;
  pet_lvl int := 0;
  did_evolve boolean := false;
  exp_to_next int;
  pet_row user_pets%ROWTYPE;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF _total <= 0 THEN RAISE EXCEPTION 'invalid total'; END IF;
  IF _correct < 0 OR _correct > _total THEN RAISE EXCEPTION 'invalid correct count'; END IF;

  SELECT * INTO t FROM stage_tests WHERE id = _test_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'test not found'; END IF;

  -- 取最近一次尝试，检查冷却
  SELECT cooldown_until INTO active_cd
  FROM stage_test_attempts
  WHERE user_id = uid AND test_id = _test_id
  ORDER BY created_at DESC LIMIT 1;

  IF active_cd IS NOT NULL AND active_cd > now() THEN
    RAISE EXCEPTION 'still in cooldown until %', active_cd;
  END IF;

  SELECT
    COUNT(*) FILTER (WHERE passed)::int,
    COUNT(*)::int
  INTO prev_passes, prev_attempts
  FROM stage_test_attempts
  WHERE user_id = uid AND test_id = _test_id;

  attempt_no_v := prev_attempts + 1;
  s := _correct::real / _total::real;
  did_pass := s >= t.pass_threshold;
  new_qratio := CASE WHEN _total > 0 THEN _new_question_count::real / _total::real ELSE 0 END;

  -- 奖励计算（递减 + 重考新题门槛）
  IF did_pass THEN
    -- 第二次起要求新题占比 ≥ 60%，否则不发奖
    IF prev_passes = 0 OR new_qratio >= 0.6 THEN
      award_coins_v := CASE prev_passes
        WHEN 0 THEN t.base_coins
        WHEN 1 THEN (t.base_coins * 0.5)::int
        WHEN 2 THEN (t.base_coins * 0.25)::int
        ELSE 0
      END;
      award_exp_v := CASE prev_passes
        WHEN 0 THEN t.base_exp
        WHEN 1 THEN (t.base_exp * 0.5)::int
        WHEN 2 THEN (t.base_exp * 0.25)::int
        ELSE 0
      END;
      -- 首次满分加成 +50%
      IF prev_passes = 0 AND _correct = _total THEN
        award_coins_v := (award_coins_v * 1.5)::int;
        award_exp_v := (award_exp_v * 1.5)::int;
        msg := '🎉 首次满分！额外 +50% 奖励';
      END IF;
    ELSE
      msg := '⚠️ 重考时新题占比不足 60%，本次不发放奖励';
    END IF;
    cd := now() + interval '48 hours';
  ELSE
    cd := now() + interval '24 hours';
    msg := '继续加油，24 小时后可重考';
  END IF;

  -- 单日封顶检查
  SELECT
    COALESCE(SUM(coins_awarded), 0),
    COALESCE(SUM(exp_awarded), 0)
  INTO today_coin, today_exp
  FROM stage_test_attempts
  WHERE user_id = uid AND created_at > date_trunc('day', now() AT TIME ZONE 'UTC');

  IF today_coin + award_coins_v > 500 THEN
    award_coins_v := GREATEST(0, 500 - today_coin);
    msg := msg || ' · 今日金币已达上限';
  END IF;
  IF today_exp + award_exp_v > 200 THEN
    award_exp_v := GREATEST(0, 200 - today_exp);
  END IF;

  -- 写入尝试记录
  INSERT INTO stage_test_attempts(
    user_id, test_id, attempt_no, correct_count, total_count,
    new_question_count, score, passed, coins_awarded, exp_awarded, cooldown_until
  ) VALUES (
    uid, _test_id, attempt_no_v, _correct, _total,
    _new_question_count, s, did_pass, award_coins_v, award_exp_v, cd
  );

  -- 发放金币
  IF award_coins_v > 0 THEN
    INSERT INTO user_coins(user_id, balance, total_earned)
    VALUES (uid, award_coins_v, award_coins_v)
    ON CONFLICT (user_id) DO UPDATE
      SET balance = user_coins.balance + EXCLUDED.balance,
          total_earned = user_coins.total_earned + EXCLUDED.total_earned,
          updated_at = now()
    RETURNING user_coins.balance INTO bal;
  ELSE
    SELECT user_coins.balance INTO bal FROM user_coins WHERE user_id = uid;
  END IF;

  -- 发放宠物经验（找当前激活宠物）
  IF award_exp_v > 0 THEN
    SELECT id INTO pet_id_v FROM user_pets WHERE user_id = uid AND is_active = true LIMIT 1;
    IF pet_id_v IS NOT NULL THEN
      SELECT * INTO pet_row FROM user_pets WHERE id = pet_id_v;
      pet_row.exp := pet_row.exp + award_exp_v;
      exp_to_next := pet_row.level * 100;
      WHILE pet_row.exp >= exp_to_next LOOP
        pet_row.exp := pet_row.exp - exp_to_next;
        pet_row.level := pet_row.level + 1;
        exp_to_next := pet_row.level * 100;
      END LOOP;
      IF pet_row.stage = 0 AND pet_row.level >= 1 THEN
        pet_row.stage := 1; did_evolve := true;
        pet_row.hatched_at := COALESCE(pet_row.hatched_at, now());
      ELSIF pet_row.stage = 1 AND pet_row.level >= 5 THEN
        pet_row.stage := 2; did_evolve := true;
      ELSIF pet_row.stage = 2 AND pet_row.level >= 15 THEN
        pet_row.stage := 3; did_evolve := true;
      END IF;
      UPDATE user_pets SET exp=pet_row.exp, level=pet_row.level, stage=pet_row.stage,
        hatched_at=pet_row.hatched_at, updated_at=now() WHERE id = pet_id_v;
      pet_lvl := pet_row.level;
    END IF;
  END IF;

  RETURN QUERY SELECT did_pass, s, award_coins_v, award_exp_v, cd, msg, COALESCE(bal,0), pet_lvl, did_evolve;
END $$;

-- ============ 5. 预置测试数据 ============
-- 小学：每年级 4 单元小测 + 2 模块过关 + 1 毕业测
DO $$
DECLARE g int;
BEGIN
  FOR g IN 1..6 LOOP
    INSERT INTO stage_tests(segment, grade, scope, unit_index, title, description, required_lessons, total_questions, pass_threshold, base_coins, base_exp, sort_order) VALUES
      ('primary', g, 'unit', 1, g||'年级 · 单元 1 小测', '完成单元 1 后挑战', g*2, 8, 0.75, 20, 30, 1),
      ('primary', g, 'unit', 2, g||'年级 · 单元 2 小测', '完成单元 2 后挑战', g*4, 8, 0.75, 20, 30, 2),
      ('primary', g, 'unit', 3, g||'年级 · 单元 3 小测', '完成单元 3 后挑战', g*6, 8, 0.75, 20, 30, 3),
      ('primary', g, 'unit', 4, g||'年级 · 单元 4 小测', '完成单元 4 后挑战', g*8, 8, 0.75, 20, 30, 4),
      ('primary', g, 'module', NULL, g||'年级 · 上学期过关', '上学期综合测', g*5, 15, 0.80, 60, 80, 5),
      ('primary', g, 'module', NULL, g||'年级 · 下学期过关', '下学期综合测', g*9, 15, 0.80, 60, 80, 6),
      ('primary', g, 'final', NULL, g||'年级 · 毕业大考', '本年级综合毕业测', g*12, 25, 0.80, 200, 250, 7);
  END LOOP;
END $$;

-- 初中：每年级 6 单元 + 3 模块 + 1 学段诊断 + 1 毕业测
DO $$
DECLARE g int;
BEGIN
  FOR g IN 1..3 LOOP
    INSERT INTO stage_tests(segment, grade, scope, unit_index, title, description, required_lessons, total_questions, pass_threshold, base_coins, base_exp, sort_order) VALUES
      ('junior', g, 'unit', 1, '初'||g||' · 单元 1', '完成单元 1', 3, 10, 0.75, 25, 35, 1),
      ('junior', g, 'unit', 2, '初'||g||' · 单元 2', '完成单元 2', 6, 10, 0.75, 25, 35, 2),
      ('junior', g, 'unit', 3, '初'||g||' · 单元 3', '完成单元 3', 9, 10, 0.75, 25, 35, 3),
      ('junior', g, 'unit', 4, '初'||g||' · 单元 4', '完成单元 4', 12, 10, 0.75, 25, 35, 4),
      ('junior', g, 'unit', 5, '初'||g||' · 单元 5', '完成单元 5', 15, 10, 0.75, 25, 35, 5),
      ('junior', g, 'unit', 6, '初'||g||' · 单元 6', '完成单元 6', 18, 10, 0.75, 25, 35, 6),
      ('junior', g, 'module', NULL, '初'||g||' · 上学期过关', '上学期综合', 9, 18, 0.80, 80, 100, 7),
      ('junior', g, 'module', NULL, '初'||g||' · 下学期过关', '下学期综合', 18, 18, 0.80, 80, 100, 8),
      ('junior', g, 'module', NULL, '初'||g||' · 期末过关', '期末综合', 22, 18, 0.80, 80, 100, 9),
      ('junior', g, 'term', NULL, '初'||g||' · 学段诊断', '听说读写综合诊断', 24, 25, 0.85, 150, 180, 10),
      ('junior', g, 'final', NULL, '初'||g||' · 毕业大考', '中考冲刺级综合', 28, 40, 0.80, 300, 350, 11);
  END LOOP;
END $$;

-- 高中：每年级 8 单元 + 4 模块 + 2 学段诊断 + 1 高考模拟
DO $$
DECLARE g int;
BEGIN
  FOR g IN 1..3 LOOP
    INSERT INTO stage_tests(segment, grade, scope, unit_index, title, description, required_lessons, total_questions, pass_threshold, base_coins, base_exp, sort_order) VALUES
      ('gaokao', g, 'unit', 1, '高'||g||' · 单元 1', '完成单元 1', 5, 10, 0.75, 30, 40, 1),
      ('gaokao', g, 'unit', 2, '高'||g||' · 单元 2', '完成单元 2', 10, 10, 0.75, 30, 40, 2),
      ('gaokao', g, 'unit', 3, '高'||g||' · 单元 3', '完成单元 3', 15, 10, 0.75, 30, 40, 3),
      ('gaokao', g, 'unit', 4, '高'||g||' · 单元 4', '完成单元 4', 20, 10, 0.75, 30, 40, 4),
      ('gaokao', g, 'unit', 5, '高'||g||' · 单元 5', '完成单元 5', 25, 10, 0.75, 30, 40, 5),
      ('gaokao', g, 'unit', 6, '高'||g||' · 单元 6', '完成单元 6', 30, 10, 0.75, 30, 40, 6),
      ('gaokao', g, 'unit', 7, '高'||g||' · 单元 7', '完成单元 7', 35, 10, 0.75, 30, 40, 7),
      ('gaokao', g, 'unit', 8, '高'||g||' · 单元 8', '完成单元 8', 40, 10, 0.75, 30, 40, 8),
      ('gaokao', g, 'module', NULL, '高'||g||' · 模块 1 过关', '模块综合', 12, 20, 0.80, 100, 120, 9),
      ('gaokao', g, 'module', NULL, '高'||g||' · 模块 2 过关', '模块综合', 24, 20, 0.80, 100, 120, 10),
      ('gaokao', g, 'module', NULL, '高'||g||' · 模块 3 过关', '模块综合', 36, 20, 0.80, 100, 120, 11),
      ('gaokao', g, 'module', NULL, '高'||g||' · 模块 4 过关', '模块综合', 45, 20, 0.80, 100, 120, 12),
      ('gaokao', g, 'term', NULL, '高'||g||' · 上学期诊断', '听说读写写综合', 25, 30, 0.85, 180, 220, 13),
      ('gaokao', g, 'term', NULL, '高'||g||' · 下学期诊断', '听说读写综合', 50, 30, 0.85, 180, 220, 14),
      ('gaokao', g, 'final', NULL, '高'||g||' · 高考模拟终测', '高考真题级综合', 55, 50, 0.80, 400, 500, 15);
  END LOOP;
END $$;
