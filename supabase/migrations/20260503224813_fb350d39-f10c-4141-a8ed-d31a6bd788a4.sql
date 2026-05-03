
CREATE TABLE IF NOT EXISTS public.pet_postcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  pet_id UUID NOT NULL,
  month_key TEXT NOT NULL,
  destination_cn TEXT NOT NULL,
  destination_emoji TEXT NOT NULL,
  message_cn TEXT NOT NULL,
  trip_start DATE NOT NULL DEFAULT CURRENT_DATE,
  trip_end DATE NOT NULL DEFAULT (CURRENT_DATE + 3),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, pet_id, month_key)
);
ALTER TABLE public.pet_postcards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own postcards select" ON public.pet_postcards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own postcards update" ON public.pet_postcards FOR UPDATE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.get_or_create_monthly_postcard()
RETURNS SETOF public.pet_postcards
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid UUID := auth.uid();
  pid UUID;
  mkey TEXT := to_char(now(), 'YYYY-MM');
  dests TEXT[] := ARRAY['🗼 巴黎','🗽 纽约','🏯 京都','🐨 悉尼','🌋 冰岛','🏝️ 巴厘岛','🐘 曼谷','🎡 伦敦','🏰 布拉格','🌴 夏威夷','🦒 肯尼亚','🐧 南极'];
  msgs TEXT[] := ARRAY[
    '这里好热闹！我学到了好多新词，回来教你～',
    '我在写明信片时想起了你认真做题的样子💌',
    '今天没有手机也没有题目，就是发呆和散步。',
    '休息也是学习的一部分哦，我们都需要。',
    '我看到一只和我很像的小动物！',
    '吃了很奇怪的东西，但很好吃。'
  ];
  pick_dest TEXT;
  pick_msg TEXT;
BEGIN
  IF uid IS NULL THEN RETURN; END IF;
  SELECT id INTO pid FROM public.user_pets WHERE user_id = uid AND is_active = true LIMIT 1;
  IF pid IS NULL THEN RETURN; END IF;
  pick_dest := dests[1 + floor(random()*array_length(dests,1))::int];
  pick_msg := msgs[1 + floor(random()*array_length(msgs,1))::int];
  INSERT INTO public.pet_postcards (user_id, pet_id, month_key, destination_cn, destination_emoji, message_cn)
  VALUES (uid, pid, mkey, split_part(pick_dest,' ',2), split_part(pick_dest,' ',1), pick_msg)
  ON CONFLICT (user_id, pet_id, month_key) DO NOTHING;
  RETURN QUERY SELECT * FROM public.pet_postcards
    WHERE user_id = uid AND pet_id = pid AND month_key = mkey;
END;
$$;
