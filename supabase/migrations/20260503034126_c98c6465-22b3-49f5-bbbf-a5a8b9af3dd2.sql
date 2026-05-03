
-- P3: 稀有皮肤 + 表情贴纸系统

CREATE TABLE IF NOT EXISTS public.pet_skins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name_cn text NOT NULL,
  description_cn text DEFAULT '',
  -- 视觉效果：CSS filter 字符串，应用到 emoji 上
  css_filter text NOT NULL DEFAULT '',
  -- 稀有度 1普通 2稀有 3史诗 4传说
  rarity int NOT NULL DEFAULT 1,
  price int NOT NULL DEFAULT 0,
  -- 解锁条件：宠物最低等级
  unlock_level int NOT NULL DEFAULT 1,
  -- 限时？(NULL = 永久)
  available_until timestamptz,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pet_skins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "skins readable" ON public.pet_skins FOR SELECT USING (true);

-- 用户拥有的皮肤
CREATE TABLE IF NOT EXISTS public.user_pet_skins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  skin_id uuid NOT NULL REFERENCES public.pet_skins(id) ON DELETE CASCADE,
  acquired_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, skin_id)
);
ALTER TABLE public.user_pet_skins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own skins read" ON public.user_pet_skins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own skins insert" ON public.user_pet_skins FOR INSERT WITH CHECK (auth.uid() = user_id);

-- user_pets 增加装备皮肤字段
ALTER TABLE public.user_pets
  ADD COLUMN IF NOT EXISTS equipped_skin_id uuid REFERENCES public.pet_skins(id);

-- 表情贴纸（按等级解锁）
CREATE TABLE IF NOT EXISTS public.pet_stickers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  emoji text NOT NULL,
  caption_cn text NOT NULL,
  unlock_level int NOT NULL DEFAULT 1,
  sort_order int NOT NULL DEFAULT 0
);
ALTER TABLE public.pet_stickers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stickers readable" ON public.pet_stickers FOR SELECT USING (true);

-- 种子数据：皮肤
INSERT INTO public.pet_skins (code, name_cn, description_cn, css_filter, rarity, price, unlock_level, sort_order) VALUES
('classic',    '原色',      '宠物原本的颜色',                     '',                                                          1, 0,    1,  0),
('sunset',     '日落橙',    '温暖的金黄色调',                     'hue-rotate(15deg) saturate(1.4) brightness(1.1)',           2, 80,   2,  1),
('ocean',      '海洋蓝',    '清凉透亮的海水色',                   'hue-rotate(180deg) saturate(1.3) brightness(1.05)',         2, 80,   2,  2),
('forest',     '森林绿',    '生机勃勃的森林之绿',                 'hue-rotate(90deg) saturate(1.2)',                           2, 80,   2,  3),
('rose',       '樱花粉',    '浪漫的粉色调',                       'hue-rotate(310deg) saturate(1.3) brightness(1.1)',          2, 100,  3,  4),
('galaxy',     '银河紫',    '神秘的宇宙紫色',                     'hue-rotate(260deg) saturate(1.5) contrast(1.1)',            3, 200,  4,  5),
('phoenix',    '凤凰红',    '炽热的火焰红',                       'hue-rotate(340deg) saturate(2) brightness(1.15) contrast(1.1)', 3, 250, 5, 6),
('aurora',     '极光',      '梦幻流动的极光色',                   'hue-rotate(120deg) saturate(2) brightness(1.2) drop-shadow(0 0 8px rgba(120,255,200,0.6))', 4, 500, 6, 7),
('rainbow',    '彩虹梦境',  '七彩流光的传说级皮肤',               'saturate(2.5) brightness(1.2) drop-shadow(0 0 6px rgba(255,180,255,0.7))',                  4, 800, 8, 8),
('legendary_gold', '黄金传说', '只有真正的勇者能驾驭',              'sepia(1) saturate(3) hue-rotate(0deg) brightness(1.2) drop-shadow(0 0 10px gold)',          4, 1500, 10, 9)
ON CONFLICT (code) DO NOTHING;

-- 种子数据：贴纸
INSERT INTO public.pet_stickers (code, emoji, caption_cn, unlock_level, sort_order) VALUES
('happy',    '😄', '开心',     1,  1),
('love',     '🥰', '爱你',     1,  2),
('star',     '⭐', '你最棒',   1,  3),
('cool',     '😎', '酷毙了',   2,  4),
('sleep',    '😴', '困了',     2,  5),
('fire',     '🔥', '燃烧吧',   3,  6),
('rocket',   '🚀', '冲冲冲',   3,  7),
('crown',    '👑', '冠军',     4,  8),
('trophy',   '🏆', '胜利',     5,  9),
('rainbow',  '🌈', '彩虹日',   5, 10),
('diamond',  '💎', '稀有时刻', 6, 11),
('magic',    '✨', '魔法',     7, 12),
('unicorn',  '🦄', '独角兽魂', 8, 13),
('legendary','🌟', '传说降临', 10, 14)
ON CONFLICT (code) DO NOTHING;

-- 购买皮肤
CREATE OR REPLACE FUNCTION public.buy_pet_skin(_skin_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := auth.uid();
  sk public.pet_skins%ROWTYPE;
  bal int;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION '未登录'; END IF;
  SELECT * INTO sk FROM public.pet_skins WHERE id = _skin_id;
  IF NOT FOUND THEN RAISE EXCEPTION '皮肤不存在'; END IF;
  IF EXISTS (SELECT 1 FROM public.user_pet_skins WHERE user_id = uid AND skin_id = _skin_id) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'already_owned');
  END IF;
  SELECT balance INTO bal FROM public.user_coins WHERE user_id = uid;
  IF COALESCE(bal,0) < sk.price THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_enough');
  END IF;
  UPDATE public.user_coins SET balance = balance - sk.price WHERE user_id = uid;
  INSERT INTO public.user_pet_skins (user_id, skin_id) VALUES (uid, _skin_id);
  RETURN jsonb_build_object('ok', true, 'new_balance', bal - sk.price);
END $$;

-- 装备皮肤到指定宠物
CREATE OR REPLACE FUNCTION public.equip_pet_skin(_pet_id uuid, _skin_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := auth.uid();
  pet_level int;
  sk public.pet_skins%ROWTYPE;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION '未登录'; END IF;
  SELECT level INTO pet_level FROM public.user_pets WHERE id = _pet_id AND user_id = uid;
  IF NOT FOUND THEN RAISE EXCEPTION '宠物不存在'; END IF;
  IF _skin_id IS NOT NULL THEN
    SELECT * INTO sk FROM public.pet_skins WHERE id = _skin_id;
    IF NOT FOUND THEN RAISE EXCEPTION '皮肤不存在'; END IF;
    IF NOT EXISTS (SELECT 1 FROM public.user_pet_skins WHERE user_id = uid AND skin_id = _skin_id) THEN
      RETURN jsonb_build_object('ok', false, 'reason', 'not_owned');
    END IF;
    IF pet_level < sk.unlock_level THEN
      RETURN jsonb_build_object('ok', false, 'reason', 'level_low', 'need_level', sk.unlock_level);
    END IF;
  END IF;
  UPDATE public.user_pets SET equipped_skin_id = _skin_id WHERE id = _pet_id AND user_id = uid;
  RETURN jsonb_build_object('ok', true);
END $$;
