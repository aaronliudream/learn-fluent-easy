-- Phase 1: 全球化养成系统 schema
-- 1) pet_species 增加 CEFR / 星球 / 解锁路径字段
ALTER TABLE public.pet_species
  ADD COLUMN IF NOT EXISTS cefr_band text,
  ADD COLUMN IF NOT EXISTS planet_zone text,
  ADD COLUMN IF NOT EXISTS name_en text,
  ADD COLUMN IF NOT EXISTS unlock_task_code text,
  ADD COLUMN IF NOT EXISTS unlock_task_target integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_starter boolean DEFAULT false;

-- 2) pet_skins 增加多元文化标签
ALTER TABLE public.pet_skins
  ADD COLUMN IF NOT EXISTS culture_tag text DEFAULT 'universal',
  ADD COLUMN IF NOT EXISTS season_tag text,
  ADD COLUMN IF NOT EXISTS unlock_type text DEFAULT 'coin';

-- 3) 全球社区目标表（协作而非竞争）
CREATE TABLE IF NOT EXISTS public.community_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_code text UNIQUE NOT NULL,
  title_cn text NOT NULL,
  title_en text NOT NULL,
  description_cn text,
  target_metric text NOT NULL,
  target_value bigint NOT NULL,
  current_value bigint NOT NULL DEFAULT 0,
  reward_species_id text REFERENCES public.pet_species(id),
  reward_skin_id uuid,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.community_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "community goals readable by all"
ON public.community_goals FOR SELECT
USING (true);

-- 4) 用户对社区目标的贡献记录（仅自己可见）
CREATE TABLE IF NOT EXISTS public.community_goal_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  goal_id uuid NOT NULL REFERENCES public.community_goals(id) ON DELETE CASCADE,
  contribution bigint NOT NULL DEFAULT 0,
  rewarded boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, goal_id)
);

ALTER TABLE public.community_goal_contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users view own contribution"
ON public.community_goal_contributions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "users insert own contribution"
ON public.community_goal_contributions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users update own contribution"
ON public.community_goal_contributions FOR UPDATE
USING (auth.uid() = user_id);

-- 5) RPC：贡献社区目标（原子累加）
CREATE OR REPLACE FUNCTION public.contribute_community_goal(_goal_code text, _amount bigint)
RETURNS TABLE (current_value bigint, target_value bigint, completed boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_goal community_goals%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'auth required'; END IF;

  SELECT * INTO v_goal FROM community_goals
  WHERE goal_code = _goal_code AND is_active = true
    AND (ends_at IS NULL OR ends_at > now())
  LIMIT 1;

  IF v_goal.id IS NULL THEN
    RETURN QUERY SELECT 0::bigint, 0::bigint, false;
    RETURN;
  END IF;

  UPDATE community_goals
  SET current_value = LEAST(target_value, current_value + GREATEST(_amount, 0))
  WHERE id = v_goal.id
  RETURNING current_value INTO v_goal.current_value;

  INSERT INTO community_goal_contributions(user_id, goal_id, contribution)
  VALUES (v_uid, v_goal.id, GREATEST(_amount, 0))
  ON CONFLICT (user_id, goal_id) DO UPDATE
    SET contribution = community_goal_contributions.contribution + EXCLUDED.contribution,
        updated_at = now();

  RETURN QUERY SELECT v_goal.current_value, v_goal.target_value,
    (v_goal.current_value >= v_goal.target_value);
END;
$$;