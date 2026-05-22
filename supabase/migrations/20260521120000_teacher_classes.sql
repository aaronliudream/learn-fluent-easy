-- =====================================================================
-- Teacher class oversight — Phase B of teacher dashboard redesign
--
-- Adds `classes` + `class_members` tables with RLS so a teacher can:
--   • create classes
--   • see students who joined via a unique 8-char invite code
--   • read aggregate stats for those students (via SECURITY DEFINER RPCs)
--
-- Students/parents can:
--   • join a class via code
--   • leave a class
--   • only see classes they are members of
--
-- All cross-user data access goes through SECURITY DEFINER RPCs whose
-- internal checks verify the caller is the class teacher — so RLS on
-- learning_events / user_mistakes remains the strict default.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) classes
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.classes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  stage       text NOT NULL DEFAULT 'mixed'
              CHECK (stage IN ('primary','junior','senior','mixed')),
  description text,
  join_code   text NOT NULL UNIQUE,
  archived_at timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_classes_teacher
  ON public.classes(teacher_id) WHERE archived_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_classes_join_code
  ON public.classes(join_code) WHERE archived_at IS NULL;

CREATE OR REPLACE TRIGGER trg_classes_updated_at
  BEFORE UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------
-- 2) class_members
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.class_members (
  class_id    uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  member_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        text NOT NULL DEFAULT 'student'
              CHECK (role IN ('student','parent')),
  joined_at   timestamptz NOT NULL DEFAULT now(),
  removed_at  timestamptz,
  PRIMARY KEY (class_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_class_members_class_active
  ON public.class_members(class_id) WHERE removed_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_class_members_member_active
  ON public.class_members(member_id) WHERE removed_at IS NULL;

-- ---------------------------------------------------------------------
-- 3) RLS — owners (teachers) get full access; members get scoped reads
-- ---------------------------------------------------------------------
ALTER TABLE public.classes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_members  ENABLE ROW LEVEL SECURITY;

-- Teachers fully manage their own classes
DROP POLICY IF EXISTS "classes_teacher_all" ON public.classes;
CREATE POLICY "classes_teacher_all" ON public.classes
  FOR ALL USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

-- Members can SELECT classes they belong to
DROP POLICY IF EXISTS "classes_member_select" ON public.classes;
CREATE POLICY "classes_member_select" ON public.classes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.class_members cm
       WHERE cm.class_id  = classes.id
         AND cm.member_id = auth.uid()
         AND cm.removed_at IS NULL
    )
  );

-- Teachers fully manage members of their own classes
DROP POLICY IF EXISTS "class_members_teacher_all" ON public.class_members;
CREATE POLICY "class_members_teacher_all" ON public.class_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.classes c
       WHERE c.id = class_members.class_id
         AND c.teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.classes c
       WHERE c.id = class_members.class_id
         AND c.teacher_id = auth.uid()
    )
  );

-- Members can SELECT their own enrollment rows
DROP POLICY IF EXISTS "class_members_self_select" ON public.class_members;
CREATE POLICY "class_members_self_select" ON public.class_members
  FOR SELECT USING (auth.uid() = member_id);

-- Members can self-leave (set removed_at via UPDATE)
DROP POLICY IF EXISTS "class_members_self_leave" ON public.class_members;
CREATE POLICY "class_members_self_leave" ON public.class_members
  FOR UPDATE USING (auth.uid() = member_id)
  WITH CHECK (auth.uid() = member_id);

-- ---------------------------------------------------------------------
-- 4) gen_class_join_code  — 4-4 dashed code using unambiguous alphabet
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.gen_class_join_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  -- No I / O / 0 / 1 (visually ambiguous when shared verbally)
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code text;
  tries int := 0;
BEGIN
  LOOP
    code := '';
    FOR i IN 1..4 LOOP
      code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    END LOOP;
    code := code || '-';
    FOR i IN 1..4 LOOP
      code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.classes WHERE join_code = code);
    tries := tries + 1;
    IF tries > 100 THEN
      RAISE EXCEPTION 'Failed to generate unique class join code after 100 tries';
    END IF;
  END LOOP;
  RETURN code;
END;
$$;

REVOKE ALL ON FUNCTION public.gen_class_join_code() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.gen_class_join_code() TO authenticated;

-- ---------------------------------------------------------------------
-- 5) create_class  — teacher creates a class for themselves
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_class(
  _name        text,
  _stage       text DEFAULT 'mixed',
  _description text DEFAULT NULL
)
RETURNS public.classes
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid       uuid := auth.uid();
  new_class public.classes;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  IF _name IS NULL OR length(trim(_name)) < 1 OR length(_name) > 80 THEN
    RAISE EXCEPTION 'class name must be 1-80 chars';
  END IF;
  IF _stage NOT IN ('primary','junior','senior','mixed') THEN
    _stage := 'mixed';
  END IF;

  INSERT INTO public.classes (teacher_id, name, stage, description, join_code)
       VALUES (uid, trim(_name), _stage, _description, public.gen_class_join_code())
    RETURNING * INTO new_class;
  RETURN new_class;
END;
$$;

REVOKE ALL ON FUNCTION public.create_class(text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_class(text, text, text) TO authenticated;

-- ---------------------------------------------------------------------
-- 6) join_class_by_code — student/parent self-enrolls
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.join_class_by_code(_code text, _role text DEFAULT 'student')
RETURNS public.classes
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid          uuid := auth.uid();
  target_class public.classes;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  IF _code IS NULL OR length(trim(_code)) < 4 THEN
    RAISE EXCEPTION 'invalid code';
  END IF;
  IF _role NOT IN ('student','parent') THEN
    _role := 'student';
  END IF;

  SELECT * INTO target_class FROM public.classes
   WHERE upper(join_code) = upper(trim(_code))
     AND archived_at IS NULL
   LIMIT 1;
  IF target_class IS NULL THEN
    RAISE EXCEPTION 'class not found';
  END IF;
  IF target_class.teacher_id = uid THEN
    RAISE EXCEPTION 'you are the teacher of this class';
  END IF;

  INSERT INTO public.class_members (class_id, member_id, role)
       VALUES (target_class.id, uid, _role)
  ON CONFLICT (class_id, member_id) DO UPDATE
     SET removed_at = NULL,
         role       = COALESCE(EXCLUDED.role, public.class_members.role);

  RETURN target_class;
END;
$$;

REVOKE ALL ON FUNCTION public.join_class_by_code(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.join_class_by_code(text, text) TO authenticated;

-- ---------------------------------------------------------------------
-- 7) get_my_teacher_classes — hub list with rollup stats
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_my_teacher_classes()
RETURNS TABLE(
  id                  uuid,
  name                text,
  stage               text,
  join_code           text,
  archived_at         timestamptz,
  created_at          timestamptz,
  student_count       int,
  active_this_week    int,
  weak_student_count  int,
  last_activity_at    timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RETURN; END IF;

  RETURN QUERY
  SELECT
    c.id, c.name, c.stage, c.join_code, c.archived_at, c.created_at,
    (SELECT count(*)::int FROM public.class_members cm
       WHERE cm.class_id  = c.id
         AND cm.removed_at IS NULL
         AND cm.role = 'student')                                  AS student_count,
    (SELECT count(DISTINCT le.user_id)::int FROM public.learning_events le
        JOIN public.class_members cm ON cm.member_id = le.user_id
       WHERE cm.class_id   = c.id
         AND cm.removed_at IS NULL
         AND cm.role       = 'student'
         AND le.created_at >= now() - interval '7 days')           AS active_this_week,
    (SELECT count(DISTINCT um.user_id)::int FROM public.user_mistakes um
        JOIN public.class_members cm ON cm.member_id = um.user_id
       WHERE cm.class_id   = c.id
         AND cm.removed_at IS NULL
         AND cm.role       = 'student'
         AND um.is_resolved = false
         AND um.wrong_count >= 3)                                  AS weak_student_count,
    (SELECT max(le.created_at) FROM public.learning_events le
        JOIN public.class_members cm ON cm.member_id = le.user_id
       WHERE cm.class_id   = c.id
         AND cm.removed_at IS NULL
         AND cm.role       = 'student')                            AS last_activity_at
  FROM public.classes c
  WHERE c.teacher_id = uid
  ORDER BY c.archived_at NULLS FIRST, c.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_my_teacher_classes() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_teacher_classes() TO authenticated;

-- ---------------------------------------------------------------------
-- 8) get_class_students — roster with per-student rollup
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_class_students(_class_id uuid)
RETURNS TABLE(
  member_id              uuid,
  display_name           text,
  role                   text,
  joined_at              timestamptz,
  weekly_minutes         int,
  active_days_last_7     int,
  unresolved_weak_count  int,
  last_active_at         timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RETURN; END IF;

  -- Only the class teacher may list students
  IF NOT EXISTS (
    SELECT 1 FROM public.classes
     WHERE id = _class_id AND teacher_id = uid
  ) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    cm.member_id,
    p.display_name,
    cm.role,
    cm.joined_at,
    COALESCE((SELECT sum(le.study_minutes)::int FROM public.learning_events le
               WHERE le.user_id = cm.member_id
                 AND le.created_at >= now() - interval '7 days'),  0) AS weekly_minutes,
    COALESCE((SELECT count(DISTINCT date(le.created_at))::int
                FROM public.learning_events le
               WHERE le.user_id = cm.member_id
                 AND le.created_at >= now() - interval '7 days'),  0) AS active_days_last_7,
    COALESCE((SELECT count(*)::int FROM public.user_mistakes um
               WHERE um.user_id     = cm.member_id
                 AND um.is_resolved = false),                       0) AS unresolved_weak_count,
    (SELECT max(le.created_at) FROM public.learning_events le
       WHERE le.user_id = cm.member_id)                                AS last_active_at
  FROM public.class_members cm
  LEFT JOIN public.profiles p ON p.user_id = cm.member_id
  WHERE cm.class_id   = _class_id
    AND cm.removed_at IS NULL
  ORDER BY cm.joined_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_class_students(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_class_students(uuid) TO authenticated;

-- ---------------------------------------------------------------------
-- 9) get_class_weakness — top class-wide weak topics (for "推送讲解")
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_class_weakness(_class_id uuid, _limit int DEFAULT 10)
RETURNS TABLE(
  module             text,
  source_label       text,
  affected_students  int,
  total_wrong_count  int
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RETURN; END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.classes
     WHERE id = _class_id AND teacher_id = uid
  ) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    um.module,
    coalesce(um.source_label, um.module) AS source_label,
    count(DISTINCT um.user_id)::int      AS affected_students,
    sum(um.wrong_count)::int             AS total_wrong_count
    FROM public.user_mistakes um
    JOIN public.class_members cm ON cm.member_id = um.user_id
   WHERE cm.class_id   = _class_id
     AND cm.removed_at IS NULL
     AND cm.role       = 'student'
     AND um.is_resolved = false
   GROUP BY um.module, coalesce(um.source_label, um.module)
   ORDER BY affected_students DESC, total_wrong_count DESC
   LIMIT greatest(1, least(_limit, 100));
END;
$$;

REVOKE ALL ON FUNCTION public.get_class_weakness(uuid, int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_class_weakness(uuid, int) TO authenticated;

-- ---------------------------------------------------------------------
-- 10) leave_class — member self-leave helper (sets removed_at)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.leave_class(_class_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  UPDATE public.class_members
     SET removed_at = now()
   WHERE class_id  = _class_id
     AND member_id = uid
     AND removed_at IS NULL;
  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.leave_class(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.leave_class(uuid) TO authenticated;
