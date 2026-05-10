CREATE OR REPLACE FUNCTION public.merge_guest_to_real_user(
  p_guest_user_id uuid,
  p_real_user_id uuid
) RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
DECLARE
  migrated_count integer := 0;
  temp_count integer;
BEGIN
  IF p_guest_user_id IS NULL OR p_real_user_id IS NULL OR p_guest_user_id = p_real_user_id THEN
    RETURN 0;
  END IF;

  -- Only the signed-in real user can claim a guest's data into their own account.
  IF auth.uid() IS DISTINCT FROM p_real_user_id THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;

  -- Migrate unified_mastery rows that don't conflict
  UPDATE public.unified_mastery
  SET user_id = p_real_user_id
  WHERE user_id = p_guest_user_id
    AND NOT EXISTS (
      SELECT 1 FROM public.unified_mastery um2
      WHERE um2.user_id = p_real_user_id
        AND um2.stage = unified_mastery.stage
        AND um2.grade IS NOT DISTINCT FROM unified_mastery.grade
        AND um2.module = unified_mastery.module
        AND um2.item_type = unified_mastery.item_type
        AND um2.item_id = unified_mastery.item_id
    );
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  migrated_count := migrated_count + temp_count;

  -- Drop conflicting leftovers
  DELETE FROM public.unified_mastery WHERE user_id = p_guest_user_id;

  -- Migrate user_mistakes
  BEGIN
    UPDATE public.user_mistakes SET user_id = p_real_user_id WHERE user_id = p_guest_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    migrated_count := migrated_count + temp_count;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  RETURN migrated_count;
END;
$func$;

GRANT EXECUTE ON FUNCTION public.merge_guest_to_real_user(uuid, uuid) TO authenticated;