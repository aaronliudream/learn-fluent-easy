
-- =====================================================
-- 1. 物种图鉴
-- =====================================================
CREATE TABLE public.pet_species (
  id text PRIMARY KEY,
  name_cn text NOT NULL,
  emoji_egg text NOT NULL,
  emoji_baby text NOT NULL,
  emoji_adult text NOT NULL,
  emoji_legend text NOT NULL,
  rarity smallint NOT NULL DEFAULT 1, -- 1普通 2稀有 3史诗 4传说
  adopt_cost int NOT NULL DEFAULT 100,
  description_cn text,
  personality_cn text,
  unlock_level smallint NOT NULL DEFAULT 1,
  sort_order int NOT NULL DEFAULT 0
);
ALTER TABLE public.pet_species ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone read species" ON public.pet_species FOR SELECT USING (true);

-- =====================================================
-- 2. 饲料
-- =====================================================
CREATE TABLE public.pet_food_items (
  id text PRIMARY KEY,
  name_cn text NOT NULL,
  emoji text NOT NULL,
  price int NOT NULL DEFAULT 10,
  hunger_restore smallint NOT NULL DEFAULT 10,
  exp_bonus smallint NOT NULL DEFAULT 5,
  mood_bonus smallint NOT NULL DEFAULT 0,
  rarity smallint NOT NULL DEFAULT 1,
  description_cn text,
  sort_order int NOT NULL DEFAULT 0
);
ALTER TABLE public.pet_food_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone read foods" ON public.pet_food_items FOR SELECT USING (true);

-- =====================================================
-- 3. 出游地点
-- =====================================================
CREATE TABLE public.pet_destinations (
  id text PRIMARY KEY,
  name_cn text NOT NULL,
  emoji text NOT NULL,
  cost_coins int NOT NULL DEFAULT 30,
  hunger_cost smallint NOT NULL DEFAULT 20,
  exp_reward smallint NOT NULL DEFAULT 30,
  unlock_level smallint NOT NULL DEFAULT 1,
  description_cn text,
  sort_order int NOT NULL DEFAULT 0
);
ALTER TABLE public.pet_destinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone read destinations" ON public.pet_destinations FOR SELECT USING (true);

-- =====================================================
-- 4. 用户宠物实例
-- =====================================================
CREATE TABLE public.user_pets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  species_id text NOT NULL REFERENCES public.pet_species(id),
  nickname text NOT NULL,
  stage smallint NOT NULL DEFAULT 0 CHECK (stage BETWEEN 0 AND 3), -- 0蛋 1幼年 2成年 3传说
  level smallint NOT NULL DEFAULT 1,
  exp int NOT NULL DEFAULT 0,
  hunger smallint NOT NULL DEFAULT 80 CHECK (hunger BETWEEN 0 AND 100),
  mood smallint NOT NULL DEFAULT 80 CHECK (mood BETWEEN 0 AND 100),
  is_active boolean NOT NULL DEFAULT false,
  hatched_at timestamptz,
  last_fed_at timestamptz,
  last_played_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_user_pets_user ON public.user_pets(user_id);
CREATE UNIQUE INDEX idx_user_pets_active ON public.user_pets(user_id) WHERE is_active = true;
ALTER TABLE public.user_pets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pets viewable by anyone" ON public.user_pets FOR SELECT USING (true); -- 公开以便交换/查看好友
CREATE POLICY "users insert own pet" ON public.user_pets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own pet" ON public.user_pets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "users delete own pet" ON public.user_pets FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 5. 饲料库存
-- =====================================================
CREATE TABLE public.pet_inventory (
  user_id uuid NOT NULL,
  food_id text NOT NULL REFERENCES public.pet_food_items(id),
  qty int NOT NULL DEFAULT 0 CHECK (qty >= 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, food_id)
);
ALTER TABLE public.pet_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own inv" ON public.pet_inventory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users insert own inv" ON public.pet_inventory FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own inv" ON public.pet_inventory FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- 6. 宠物日记
-- =====================================================
CREATE TABLE public.pet_diary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  pet_id uuid REFERENCES public.user_pets(id) ON DELETE CASCADE,
  event_type text NOT NULL, -- adopt|hatch|feed|outing|levelup|evolve|trade|gift
  emoji text,
  message text NOT NULL,
  meta jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_pet_diary_user ON public.pet_diary(user_id, created_at DESC);
ALTER TABLE public.pet_diary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own diary" ON public.pet_diary FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users insert own diary" ON public.pet_diary FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 7. 宠物交换
-- =====================================================
CREATE TABLE public.pet_trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user uuid NOT NULL,
  from_pet_id uuid NOT NULL REFERENCES public.user_pets(id) ON DELETE CASCADE,
  to_user uuid NOT NULL,
  to_pet_id uuid NOT NULL REFERENCES public.user_pets(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending', -- pending|accepted|rejected|cancelled
  created_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz
);
CREATE INDEX idx_trades_to ON public.pet_trades(to_user, status);
CREATE INDEX idx_trades_from ON public.pet_trades(from_user, status);
ALTER TABLE public.pet_trades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own trades" ON public.pet_trades FOR SELECT USING (auth.uid() IN (from_user, to_user));
CREATE POLICY "users insert trades" ON public.pet_trades FOR INSERT WITH CHECK (auth.uid() = from_user);
CREATE POLICY "users update own trades" ON public.pet_trades FOR UPDATE USING (auth.uid() IN (from_user, to_user));

-- =====================================================
-- 8. 每日学习星币上限（防刷）
-- =====================================================
CREATE TABLE public.daily_coin_log (
  user_id uuid NOT NULL,
  log_date date NOT NULL,
  earned int NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, log_date)
);
ALTER TABLE public.daily_coin_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own log" ON public.daily_coin_log FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- 9. 触发器
-- =====================================================
CREATE TRIGGER trg_user_pets_touch BEFORE UPDATE ON public.user_pets
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_pet_inv_touch BEFORE UPDATE ON public.pet_inventory
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =====================================================
-- 10. RPC 函数
-- =====================================================

-- 学习奖励星币（封顶每日 500，防刷）
CREATE OR REPLACE FUNCTION public.award_learning_coins(_amount int, _source text DEFAULT 'study')
RETURNS TABLE(awarded int, balance int, capped boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  uid uuid := auth.uid();
  today date := ((now() AT TIME ZONE 'UTC') - interval '4 hours')::date;
  already int;
  cap int := 500;
  give int;
  new_bal int;
  was_capped boolean := false;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF _amount IS NULL OR _amount <= 0 THEN
    RETURN QUERY SELECT 0, COALESCE((SELECT user_coins.balance FROM user_coins WHERE user_id=uid),0), false;
    RETURN;
  END IF;

  INSERT INTO daily_coin_log(user_id, log_date, earned) VALUES (uid, today, 0)
    ON CONFLICT (user_id, log_date) DO NOTHING;
  SELECT earned INTO already FROM daily_coin_log WHERE user_id=uid AND log_date=today;

  give := LEAST(_amount, GREATEST(0, cap - already));
  IF give < _amount THEN was_capped := true; END IF;

  IF give > 0 THEN
    UPDATE daily_coin_log SET earned = earned + give WHERE user_id=uid AND log_date=today;
    INSERT INTO user_coins(user_id, balance, total_earned, updated_at)
    VALUES (uid, give, give, now())
    ON CONFLICT (user_id) DO UPDATE
      SET balance = user_coins.balance + give,
          total_earned = user_coins.total_earned + give,
          updated_at = now()
    RETURNING balance INTO new_bal;
  ELSE
    SELECT balance INTO new_bal FROM user_coins WHERE user_id=uid;
  END IF;

  RETURN QUERY SELECT give, COALESCE(new_bal,0), was_capped;
END $$;

-- 领养宠物
CREATE OR REPLACE FUNCTION public.adopt_pet(_species_id text, _nickname text)
RETURNS TABLE(pet_id uuid, balance int)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  uid uuid := auth.uid();
  cost int;
  bal int;
  new_pet_id uuid;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT adopt_cost INTO cost FROM pet_species WHERE id = _species_id;
  IF cost IS NULL THEN RAISE EXCEPTION 'species not found'; END IF;

  SELECT balance INTO bal FROM user_coins WHERE user_id = uid;
  IF COALESCE(bal,0) < cost THEN RAISE EXCEPTION 'not enough coins'; END IF;

  UPDATE user_coins SET balance = balance - cost, updated_at = now() WHERE user_id = uid RETURNING balance INTO bal;

  INSERT INTO user_pets(user_id, species_id, nickname, stage, hatched_at, is_active)
  VALUES (uid, _species_id, _nickname, 0, NULL, NOT EXISTS(SELECT 1 FROM user_pets WHERE user_id=uid))
  RETURNING id INTO new_pet_id;

  INSERT INTO pet_diary(user_id, pet_id, event_type, emoji, message)
  VALUES (uid, new_pet_id, 'adopt', '🥚', '欢迎新伙伴！蛋蛋孵化中…');

  RETURN QUERY SELECT new_pet_id, bal;
END $$;

-- 购买饲料
CREATE OR REPLACE FUNCTION public.buy_pet_food(_food_id text, _qty int)
RETURNS TABLE(new_qty int, balance int)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  uid uuid := auth.uid();
  price int;
  total int;
  bal int;
  q int;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF _qty IS NULL OR _qty <= 0 THEN RAISE EXCEPTION 'invalid qty'; END IF;

  SELECT pet_food_items.price INTO price FROM pet_food_items WHERE id=_food_id;
  IF price IS NULL THEN RAISE EXCEPTION 'food not found'; END IF;
  total := price * _qty;

  SELECT balance INTO bal FROM user_coins WHERE user_id=uid;
  IF COALESCE(bal,0) < total THEN RAISE EXCEPTION 'not enough coins'; END IF;

  UPDATE user_coins SET balance = balance - total, updated_at=now() WHERE user_id=uid RETURNING balance INTO bal;

  INSERT INTO pet_inventory(user_id, food_id, qty) VALUES (uid, _food_id, _qty)
  ON CONFLICT (user_id, food_id) DO UPDATE SET qty = pet_inventory.qty + EXCLUDED.qty, updated_at=now()
  RETURNING qty INTO q;

  RETURN QUERY SELECT q, bal;
END $$;

-- 喂食 (含进化)
CREATE OR REPLACE FUNCTION public.feed_pet(_pet_id uuid, _food_id text)
RETURNS TABLE(new_hunger int, new_exp int, new_level int, new_stage int, evolved boolean, leveled boolean, message text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  uid uuid := auth.uid();
  pet_row user_pets%ROWTYPE;
  hres int; ebon int; mbon int;
  exp_to_next int;
  msg text := '';
  did_evolve boolean := false;
  did_level boolean := false;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT * INTO pet_row FROM user_pets WHERE id=_pet_id AND user_id=uid;
  IF NOT FOUND THEN RAISE EXCEPTION 'pet not found'; END IF;

  -- 扣库存
  UPDATE pet_inventory SET qty = qty - 1, updated_at=now()
  WHERE user_id=uid AND food_id=_food_id AND qty > 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'no food in inventory'; END IF;

  SELECT hunger_restore, exp_bonus, mood_bonus INTO hres, ebon, mbon
  FROM pet_food_items WHERE id=_food_id;

  pet_row.hunger := LEAST(100, pet_row.hunger + hres);
  pet_row.mood := LEAST(100, pet_row.mood + mbon);
  pet_row.exp := pet_row.exp + ebon;
  pet_row.last_fed_at := now();

  -- 升级判定: 每级 100 经验
  exp_to_next := pet_row.level * 100;
  WHILE pet_row.exp >= exp_to_next LOOP
    pet_row.exp := pet_row.exp - exp_to_next;
    pet_row.level := pet_row.level + 1;
    did_level := true;
    exp_to_next := pet_row.level * 100;
  END LOOP;

  -- 进化阶段: lv1+任一次喂食=幼年, lv5=成年, lv15=传说
  IF pet_row.stage = 0 AND pet_row.level >= 1 THEN
    pet_row.stage := 1; did_evolve := true; pet_row.hatched_at := COALESCE(pet_row.hatched_at, now()); msg := '🐣 蛋蛋孵化啦！';
  ELSIF pet_row.stage = 1 AND pet_row.level >= 5 THEN
    pet_row.stage := 2; did_evolve := true; msg := '🌟 进化成成年形态！';
  ELSIF pet_row.stage = 2 AND pet_row.level >= 15 THEN
    pet_row.stage := 3; did_evolve := true; msg := '👑 觉醒为传说之姿！';
  END IF;

  UPDATE user_pets SET
    hunger=pet_row.hunger, mood=pet_row.mood, exp=pet_row.exp, level=pet_row.level,
    stage=pet_row.stage, hatched_at=pet_row.hatched_at, last_fed_at=now(), updated_at=now()
  WHERE id=_pet_id;

  IF did_evolve THEN
    INSERT INTO pet_diary(user_id, pet_id, event_type, emoji, message)
    VALUES (uid, _pet_id, 'evolve', '✨', msg);
  ELSIF did_level THEN
    INSERT INTO pet_diary(user_id, pet_id, event_type, emoji, message)
    VALUES (uid, _pet_id, 'levelup', '⭐', '升到 Lv.' || pet_row.level || ' 啦！');
  END IF;

  RETURN QUERY SELECT pet_row.hunger::int, pet_row.exp::int, pet_row.level::int, pet_row.stage::int, did_evolve, did_level, msg;
END $$;

-- 出游
CREATE OR REPLACE FUNCTION public.take_pet_outing(_pet_id uuid, _dest_id text)
RETURNS TABLE(new_hunger int, new_exp int, new_level int, balance int, surprise text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  uid uuid := auth.uid();
  pet_row user_pets%ROWTYPE;
  cost int; hcost int; ereward int;
  bal int;
  surp text := '';
  exp_to_next int;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT * INTO pet_row FROM user_pets WHERE id=_pet_id AND user_id=uid;
  IF NOT FOUND THEN RAISE EXCEPTION 'pet not found'; END IF;
  IF pet_row.stage < 1 THEN RAISE EXCEPTION 'pet still in egg'; END IF;

  SELECT cost_coins, hunger_cost, exp_reward INTO cost, hcost, ereward
  FROM pet_destinations WHERE id=_dest_id;
  IF cost IS NULL THEN RAISE EXCEPTION 'destination not found'; END IF;

  IF pet_row.hunger < hcost THEN RAISE EXCEPTION 'pet too hungry to travel'; END IF;
  SELECT balance INTO bal FROM user_coins WHERE user_id=uid;
  IF COALESCE(bal,0) < cost THEN RAISE EXCEPTION 'not enough coins'; END IF;

  UPDATE user_coins SET balance=balance-cost, updated_at=now() WHERE user_id=uid RETURNING balance INTO bal;

  pet_row.hunger := pet_row.hunger - hcost;
  pet_row.exp := pet_row.exp + ereward;
  pet_row.mood := LEAST(100, pet_row.mood + 10);

  -- 升级
  exp_to_next := pet_row.level * 100;
  WHILE pet_row.exp >= exp_to_next LOOP
    pet_row.exp := pet_row.exp - exp_to_next;
    pet_row.level := pet_row.level + 1;
    exp_to_next := pet_row.level * 100;
  END LOOP;

  -- 随机彩蛋: 10% 概率获得 5-15 星币
  IF random() < 0.1 THEN
    surp := '🎁 路上捡到 10 星币！';
    UPDATE user_coins SET balance=balance+10, total_earned=total_earned+10, updated_at=now() WHERE user_id=uid RETURNING balance INTO bal;
  END IF;

  UPDATE user_pets SET
    hunger=pet_row.hunger, mood=pet_row.mood, exp=pet_row.exp, level=pet_row.level,
    last_played_at=now(), updated_at=now()
  WHERE id=_pet_id;

  INSERT INTO pet_diary(user_id, pet_id, event_type, emoji, message)
  VALUES (uid, _pet_id, 'outing', '🗺️', '去 ' || (SELECT name_cn FROM pet_destinations WHERE id=_dest_id) || ' 玩了一趟');

  RETURN QUERY SELECT pet_row.hunger::int, pet_row.exp::int, pet_row.level::int, bal, surp;
END $$;

-- 切换出战宠物
CREATE OR REPLACE FUNCTION public.set_active_pet(_pet_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  UPDATE user_pets SET is_active=false WHERE user_id=uid;
  UPDATE user_pets SET is_active=true WHERE id=_pet_id AND user_id=uid;
END $$;

-- =====================================================
-- 11. 种子数据
-- =====================================================
INSERT INTO public.pet_species(id, name_cn, emoji_egg, emoji_baby, emoji_adult, emoji_legend, rarity, adopt_cost, description_cn, personality_cn, sort_order) VALUES
  ('star_cat',    '星灵猫',  '🥚','🐱','😺','🦁', 1, 100,  '夜空中坠落的星之化身', '好奇 · 温柔', 1),
  ('cloud_bunny', '云朵兔',  '🥚','🐰','🐇','🦄', 1, 120,  '住在云端的小毛球',   '柔软 · 善良', 2),
  ('fire_fox',    '火焰狐',  '🥚','🦊','🐺','🔥', 2, 200,  '尾尖闪着小火苗',     '机灵 · 勇敢', 3),
  ('mini_dragon', '小恐龙',  '🥚','🦎','🦖','🐉', 2, 220,  '迷你侏罗纪小伙伴',   '热情 · 坚定', 4),
  ('moon_lamb',   '月亮羊',  '🥚','🐑','🐏','🌙', 2, 200,  '羊毛会发光的小羊',   '温和 · 治愈', 5),
  ('thunder_bird','闪电鸟',  '🥚','🐤','🐦','⚡', 3, 320,  '展翅时雷光飞舞',     '迅捷 · 灵动', 6),
  ('rainbow_whale','彩虹鲸', '🥚','🐳','🐋','🌈', 3, 380,  '能在天空游泳的鲸',   '智慧 · 包容', 7),
  ('unicorn',     '独角兽',  '🥚','🐴','🦄','✨', 4, 600,  '最纯净的奇幻使者',   '高贵 · 守护', 8);

INSERT INTO public.pet_food_items(id, name_cn, emoji, price, hunger_restore, exp_bonus, mood_bonus, rarity, description_cn, sort_order) VALUES
  ('bread',     '小麦面包',  '🍞', 10, 15, 5,  2, 1, '基础温饱',       1),
  ('apple',     '红苹果',    '🍎', 12, 18, 6,  3, 1, '清脆又香甜',     2),
  ('milk',      '鲜牛奶',    '🥛', 15, 20, 8,  4, 1, '强壮的秘密',     3),
  ('cookie',    '友谊曲奇',  '🍪', 18, 18, 12, 8, 1, '心情大提升',     4),
  ('cheese',    '奶酪块',    '🧀', 20, 25, 10, 5, 2, '高蛋白点心',     5),
  ('sushi',     '迷你寿司',  '🍣', 30, 30, 18, 8, 2, '海洋的力量',     6),
  ('berry',     '奇幻浆果',  '🫐', 35, 25, 22, 12,2, '森林的礼物',     7),
  ('honey',     '蜂蜜罐',    '🍯', 40, 35, 20, 15,2, '甜到心里',       8),
  ('star_fish', '星辰鱼',    '🐟', 50, 40, 30, 10,3, '宇宙级营养',     9),
  ('rainbow_cake','彩虹蛋糕','🎂', 60, 45, 35, 25,3, '生日特供',      10),
  ('magic_potion','魔法药水','🧪', 80, 50, 50, 30,4, '快速成长神器',  11),
  ('gold_apple','金苹果',    '🍏', 120,80, 80, 50,4, '一口长一岁',    12);

INSERT INTO public.pet_destinations(id, name_cn, emoji, cost_coins, hunger_cost, exp_reward, unlock_level, description_cn, sort_order) VALUES
  ('park',        '阳光公园',  '🌳', 20,  10, 25, 1, '散步晒太阳，最简单的快乐', 1),
  ('beach',       '欢乐海滩',  '🏖️', 30,  15, 35, 2, '挖沙堡、追海浪',           2),
  ('forest',      '魔法森林',  '🌲', 40,  20, 45, 3, '认识森林里的小精灵',       3),
  ('mountain',    '云顶山',    '⛰️', 50,  25, 55, 4, '登顶看日出',               4),
  ('library',     '智慧图书馆','📚', 35,  10, 50, 3, '边玩边学，经验加成',       5),
  ('amusement',   '游乐场',    '🎡', 60,  20, 60, 5, '过山车与棉花糖',           6),
  ('aquarium',    '海洋馆',    '🐠', 55,  15, 55, 5, '认识各种海洋生物',         7),
  ('space',       '星际海洋',  '🌌', 100, 30, 110,10,'飞向银河系（解锁需 Lv.10）',8),
  ('school',      '云端学院',  '🏫', 45,  15, 60, 4, '上一节奇幻课程',           9),
  ('rainbow_town','欢乐镇',    '🌈', 70,  25, 75, 6, '与其它宠物开派对',        10),
  ('dragon_den',  '龙之巢穴',  '🐲', 150, 35, 160,15,'传说挑战（高难度）',      11),
  ('moon_garden', '月光花园',  '🌙', 80,  20, 90, 8, '夜晚开放的神秘花园',      12);
