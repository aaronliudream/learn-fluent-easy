-- ============================================================
-- 一、宠物伴侣核心表
-- ============================================================

-- 1. 性格特质表
CREATE TABLE IF NOT EXISTS public.pet_personality_traits (
  species_id text PRIMARY KEY REFERENCES public.pet_species(id) ON DELETE CASCADE,
  energy numeric(3,2) NOT NULL DEFAULT 0.5 CHECK (energy BETWEEN 0 AND 1),
  patience numeric(3,2) NOT NULL DEFAULT 0.5 CHECK (patience BETWEEN 0 AND 1),
  curiosity numeric(3,2) NOT NULL DEFAULT 0.5 CHECK (curiosity BETWEEN 0 AND 1),
  empathy numeric(3,2) NOT NULL DEFAULT 0.5 CHECK (empathy BETWEEN 0 AND 1),
  humor numeric(3,2) NOT NULL DEFAULT 0.5 CHECK (humor BETWEEN 0 AND 1),
  ai_persona_prompt text,
  catchphrase_en text,
  catchphrase_cn text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pet_personality_traits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "traits readable by all" ON public.pet_personality_traits FOR SELECT USING (true);

-- 2. 宠物长期记忆
CREATE TABLE IF NOT EXISTS public.pet_memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  memory_type text NOT NULL,           -- 'milestone' | 'preference' | 'struggle' | 'win'
  content text NOT NULL,
  importance smallint NOT NULL DEFAULT 5 CHECK (importance BETWEEN 1 AND 10),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz                -- NULL = 永久
);
ALTER TABLE public.pet_memories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own memories" ON public.pet_memories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users insert own memories" ON public.pet_memories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users delete own memories" ON public.pet_memories FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_pet_memories_user_recent ON public.pet_memories(user_id, created_at DESC);

-- 3. 守护灵首次选择记录
CREATE TABLE IF NOT EXISTS public.pet_companion_choice (
  user_id uuid PRIMARY KEY,
  chosen_species_id text NOT NULL REFERENCES public.pet_species(id),
  personality_quiz_result jsonb,
  chosen_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pet_companion_choice ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own choice" ON public.pet_companion_choice FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users insert own choice" ON public.pet_companion_choice FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own choice" ON public.pet_companion_choice FOR UPDATE USING (auth.uid() = user_id);

-- 4. 全站行为奖励注册表
CREATE TABLE IF NOT EXISTS public.action_rewards (
  action_code text PRIMARY KEY,
  display_name_cn text NOT NULL,
  display_name_en text,
  coins_base int NOT NULL DEFAULT 0,
  xp_base int NOT NULL DEFAULT 0,
  flash_chance numeric(4,3) NOT NULL DEFAULT 0,
  daily_cap int NOT NULL DEFAULT 100,
  cooldown_seconds int NOT NULL DEFAULT 0,
  module text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.action_rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rewards readable by all" ON public.action_rewards FOR SELECT USING (true);

-- ============================================================
-- 二、风险 1：AI 成本/Token 配额护栏
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ai_usage_quota (
  user_id uuid NOT NULL,
  usage_date date NOT NULL DEFAULT (CURRENT_DATE),
  feature text NOT NULL,                -- 'pet_diary' | 'pet_chat' | 'mistake_explain' ...
  call_count int NOT NULL DEFAULT 0,
  token_count int NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, usage_date, feature)
);
ALTER TABLE public.ai_usage_quota ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own quota" ON public.ai_usage_quota FOR SELECT USING (auth.uid() = user_id);

-- 配额上限配置（可调）
CREATE TABLE IF NOT EXISTS public.ai_quota_limits (
  feature text PRIMARY KEY,
  daily_call_limit int NOT NULL,
  daily_token_limit int NOT NULL,
  description text
);
ALTER TABLE public.ai_quota_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "limits readable by all" ON public.ai_quota_limits FOR SELECT USING (true);

INSERT INTO public.ai_quota_limits (feature, daily_call_limit, daily_token_limit, description) VALUES
  ('pet_diary', 2, 2000, '每日宠物日记，2 次足以应付重生成'),
  ('pet_chat', 30, 30000, '与宠物对话，30 轮对话足够日常陪伴'),
  ('mistake_explain', 50, 50000, '错题解释，按需调用')
ON CONFLICT (feature) DO NOTHING;

-- 原子配额检查与扣减
CREATE OR REPLACE FUNCTION public.check_and_consume_ai_quota(
  _feature text, _estimated_tokens int DEFAULT 1000
) RETURNS TABLE(allowed boolean, remaining_calls int, remaining_tokens int)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_limit ai_quota_limits%ROWTYPE;
  v_current ai_usage_quota%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN
    RETURN QUERY SELECT false, 0, 0; RETURN;
  END IF;

  SELECT * INTO v_limit FROM ai_quota_limits WHERE feature = _feature;
  IF v_limit.feature IS NULL THEN
    RETURN QUERY SELECT true, 9999, 999999; RETURN;
  END IF;

  INSERT INTO ai_usage_quota(user_id, usage_date, feature, call_count, token_count)
  VALUES (v_uid, CURRENT_DATE, _feature, 0, 0)
  ON CONFLICT (user_id, usage_date, feature) DO NOTHING;

  SELECT * INTO v_current FROM ai_usage_quota
    WHERE user_id = v_uid AND usage_date = CURRENT_DATE AND feature = _feature;

  IF v_current.call_count >= v_limit.daily_call_limit
     OR v_current.token_count + _estimated_tokens > v_limit.daily_token_limit THEN
    RETURN QUERY SELECT false,
      GREATEST(v_limit.daily_call_limit - v_current.call_count, 0),
      GREATEST(v_limit.daily_token_limit - v_current.token_count, 0);
    RETURN;
  END IF;

  UPDATE ai_usage_quota
    SET call_count = call_count + 1,
        token_count = token_count + _estimated_tokens
    WHERE user_id = v_uid AND usage_date = CURRENT_DATE AND feature = _feature;

  RETURN QUERY SELECT true,
    v_limit.daily_call_limit - v_current.call_count - 1,
    v_limit.daily_token_limit - v_current.token_count - _estimated_tokens;
END;
$$;

-- ============================================================
-- 三、风险 2：儿童数据合规
-- ============================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='profiles') THEN
    ALTER TABLE public.profiles
      ADD COLUMN IF NOT EXISTS age_band text DEFAULT 'unspecified',  -- 'child'(<13) | 'teen'(13-17) | 'adult' | 'unspecified'
      ADD COLUMN IF NOT EXISTS is_minor boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS data_minimization boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS parental_consent_at timestamptz;
  END IF;
END $$;

-- 儿童账户写入儿童数据敏感字段拦截（trigger 示例：写宠物日记时禁止存住址等）
CREATE OR REPLACE FUNCTION public.guard_minor_pii() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_minor boolean;
BEGIN
  SELECT is_minor INTO v_minor FROM profiles WHERE id = NEW.user_id;
  IF v_minor IS TRUE AND NEW.content ~* '(住址|address|phone|电话|学校名|grade.*school|home location)' THEN
    NEW.content := regexp_replace(NEW.content, '(住址|address|phone|电话)[^。;.\n]*', '[redacted]', 'gi');
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS guard_minor_pet_memories ON public.pet_memories;
CREATE TRIGGER guard_minor_pet_memories
  BEFORE INSERT OR UPDATE ON public.pet_memories
  FOR EACH ROW EXECUTE FUNCTION public.guard_minor_pii();

-- ============================================================
-- 四、风险 3：AI 输出失控
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ai_blocked_keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword text NOT NULL UNIQUE,
  category text NOT NULL,           -- 'violence'|'sexual'|'politics'|'religion'|'self_harm'
  severity smallint NOT NULL DEFAULT 5,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_blocked_keywords ENABLE ROW LEVEL SECURITY;
CREATE POLICY "blocked keywords readable by all" ON public.ai_blocked_keywords FOR SELECT USING (true);

INSERT INTO public.ai_blocked_keywords(keyword, category, severity) VALUES
  ('suicide','self_harm',10),('自杀','self_harm',10),('kill yourself','self_harm',10),
  ('政治','politics',7),('president','politics',5),('war','violence',6),('战争','violence',6),
  ('sex','sexual',9),('性爱','sexual',10),
  ('religion debate','religion',6)
ON CONFLICT (keyword) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.ai_content_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  feature text NOT NULL,
  source_id text,
  content_snippet text NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending',   -- 'pending'|'reviewing'|'resolved'|'dismissed'
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_content_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users insert own report" ON public.ai_content_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users view own report" ON public.ai_content_reports FOR SELECT USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.ai_safety_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  feature text NOT NULL,
  matched_keywords text[],
  action_taken text NOT NULL,         -- 'blocked'|'redacted'|'logged'
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_safety_log ENABLE ROW LEVEL SECURITY;
-- service role only; 用户不应访问