
-- 1. profiles 新字段
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS is_guest boolean NOT NULL DEFAULT false;

-- 大小写不敏感的唯一索引（防止 Tom / tom 冲突）
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_key
  ON public.profiles (lower(username))
  WHERE username IS NOT NULL;

-- 2. 简易脏话/敏感词过滤（最小集，可后续扩充）
CREATE OR REPLACE FUNCTION public.is_username_clean(_name text)
RETURNS boolean LANGUAGE sql IMMUTABLE AS $$
  SELECT _name !~* '(fuck|shit|bitch|cunt|asshole|nigger|nazi|porn|sex|admin|root|moderator|官方|管理员|客服|系统)';
$$;

-- 3. 校验昵称合法性
CREATE OR REPLACE FUNCTION public.validate_username(_name text)
RETURNS text LANGUAGE plpgsql IMMUTABLE AS $$
BEGIN
  IF _name IS NULL OR length(trim(_name)) < 2 THEN
    RETURN 'too_short';
  END IF;
  IF length(_name) > 24 THEN
    RETURN 'too_long';
  END IF;
  -- 允许：字母、数字、中日韩文、下划线、点、连字符、emoji 范围
  IF _name !~ '^[A-Za-z0-9_.\-\u4e00-\u9fff\u3040-\u30ff]+$' THEN
    RETURN 'invalid_chars';
  END IF;
  IF NOT public.is_username_clean(_name) THEN
    RETURN 'forbidden_word';
  END IF;
  RETURN 'ok';
END $$;

-- 4. 检查昵称是否可用（公开，给注册前的实时校验用）
CREATE OR REPLACE FUNCTION public.username_available(_name text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT NOT EXISTS (SELECT 1 FROM public.profiles WHERE lower(username) = lower(_name));
$$;
GRANT EXECUTE ON FUNCTION public.username_available(text) TO anon, authenticated;

-- 5. 通过昵称查找 guest 邮箱（用于登录）
CREATE OR REPLACE FUNCTION public.guest_email_for_username(_name text)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public, auth AS $$
  SELECT u.email
    FROM public.profiles p
    JOIN auth.users u ON u.id = p.user_id
   WHERE lower(p.username) = lower(_name)
     AND p.is_guest = true
   LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.guest_email_for_username(text) TO anon, authenticated;

-- 6. 让用户能更新自己的 profile（昵称/is_guest 升级时需要）
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='profiles' AND policyname='Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile" ON public.profiles
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- 7. 升级 guest 为正式账号（绑定真实邮箱后调用）
CREATE OR REPLACE FUNCTION public.upgrade_guest_to_full(_real_email text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  UPDATE public.profiles
     SET is_guest = false,
         email = _real_email,
         updated_at = now()
   WHERE user_id = uid;
END $$;
GRANT EXECUTE ON FUNCTION public.upgrade_guest_to_full(text) TO authenticated;
