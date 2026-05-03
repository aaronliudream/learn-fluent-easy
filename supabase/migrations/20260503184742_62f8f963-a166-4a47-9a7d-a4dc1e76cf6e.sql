CREATE OR REPLACE FUNCTION public.guard_minor_pii() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_minor boolean;
BEGIN
  SELECT is_minor INTO v_minor FROM public.profiles WHERE user_id = NEW.user_id;
  IF v_minor IS TRUE AND NEW.content ~* '(住址|address|phone|电话|学校名|grade.*school|home location)' THEN
    NEW.content := regexp_replace(NEW.content, '(住址|address|phone|电话)[^。;.\n]*', '[redacted]', 'gi');
  END IF;
  RETURN NEW;
END $$;