-- Make the grammar question stats refresh trigger run as SECURITY DEFINER so it can update points table
CREATE OR REPLACE FUNCTION public.refresh_grammar_point_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  pid uuid;
BEGIN
  pid := COALESCE(NEW.point_id, OLD.point_id);
  IF pid IS NOT NULL THEN
    UPDATE public.gaokao_grammar_points p
    SET question_count = (SELECT COUNT(*) FROM public.gaokao_grammar_questions WHERE point_id = pid),
        irt_avg_difficulty = (SELECT AVG(irt_difficulty)::real FROM public.gaokao_grammar_questions WHERE point_id = pid),
        updated_at = now()
    WHERE p.id = pid;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;