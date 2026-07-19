-- =====================================================================
-- 教师端错题读取:排除"薄听力"旧行(module='listening',edge 写、无题干无选项)。
--
-- 背景:专区听力做题走 recordUnifiedAttempt→edge,edge 写 user_mistakes 不带 snapshot、
--   听力还没传题干 → 落成薄行(老师端显示"无题目快照")。现已改由客户端 recordZoneMistake
--   额外直写完整快照,module='hub_listening'(听力)/ 'senior_cloze'(高中完形)。
--   本 SQL 把薄行 module='listening' 从教师端两个 RPC 的普通分支排除,避免与完整行重复显示。
--   完整行(hub_listening / senior_cloze / junior_cloze 等)不在排除名单,照常经 plain 分支返回。
--
-- 改动 = 仅把两处 `not in ('cloze','reading')` 增补为 `not in ('cloze','reading','listening')`。
-- 其余逻辑与 DONE_PHASE2_teacher_mistakes_union.sql 完全一致。幂等,可重复跑。
-- =====================================================================

-- ── 1) get_student_mistake_counts ────────────────────────────────────
create or replace function public.get_student_mistake_counts(_student_id uuid)
returns table(module text, unresolved_count int)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.class_members cm
    join public.classes c on c.id = cm.class_id
    where cm.member_id = _student_id and c.teacher_id = auth.uid() and cm.removed_at is null
  ) then return; end if;

  return query
  select um.module, count(*)::int
    from public.user_mistakes um
   where um.user_id = _student_id and um.is_resolved = false
     and um.module not in ('cloze','reading','listening')   -- ← 增补 'listening'
   group by um.module

  union all
  select 'cloze', count(distinct g.parent_id)::int
    from public.gaokao_user_mistakes g
   where g.user_id = _student_id and g.module = 'cloze' and g.is_resolved = false
  having count(*) > 0

  union all
  select 'reading', count(distinct t.reading_id)::int
    from (
      select distinct on (jra.reading_id, jra.question_idx)
             jra.reading_id, jra.is_correct
        from public.junior_reading_attempts jra
       where jra.user_id = _student_id
       order by jra.reading_id, jra.question_idx, jra.created_at desc
    ) t
   where t.is_correct = false
  having count(distinct t.reading_id) > 0;
end;
$$;

revoke all on function public.get_student_mistake_counts(uuid) from public, anon;
grant execute on function public.get_student_mistake_counts(uuid) to authenticated;


-- ── 2) get_student_mistakes ──────────────────────────────────────────
drop function if exists public.get_student_mistakes(uuid, text);

create function public.get_student_mistakes(_student_id uuid, _module text default null)
returns table(
  id             text,
  kind           text,
  module         text,
  title          text,
  question       text,
  user_answer    text,
  correct_answer text,
  explanation    text,
  snapshot       jsonb,
  items          jsonb,
  wrong_count    int,
  is_complete    boolean,
  last_wrong_at  timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.class_members cm
    join public.classes c on c.id = cm.class_id
    where cm.member_id = _student_id and c.teacher_id = auth.uid() and cm.removed_at is null
  ) then return; end if;

  return query
  -- 源1:普通题(逐题)
  select um.id::text, 'plain'::text, um.module, um.source_label,
         um.question, um.user_answer, um.correct_answer, um.explanation,
         um.snapshot, null::jsonb,
         coalesce(um.wrong_count,1)::int,
         (coalesce(um.snapshot,'{}'::jsonb) <> '{}'::jsonb
            or coalesce(um.question,'') <> ''),
         um.last_wrong_at
    from public.user_mistakes um
   where um.user_id = _student_id and um.is_resolved = false
     and um.module not in ('cloze','reading','listening')   -- ← 增补 'listening'
     and (_module is null or um.module = _module)

  union all
  -- 源2:完形(高中旧路径 gaokao_user_mistakes,按篇)
  select g.parent_id::text, 'cloze'::text, 'cloze'::text, max(g.parent_label),
         null::text, null::text, null::text, null::text,
         null::jsonb,
         jsonb_agg(jsonb_build_object(
           'no',             nullif(g.snapshot->>'blank_no','')::int,
           'user_answer',    g.user_answer,
           'correct_answer', g.correct_answer,
           'options', jsonb_build_object(
             'A', g.snapshot->>'option_a', 'B', g.snapshot->>'option_b',
             'C', g.snapshot->>'option_c', 'D', g.snapshot->>'option_d'),
           'explanation',    g.snapshot->>'general_explanation'
         ) order by nullif(g.snapshot->>'blank_no','')::int),
         count(*)::int,
         bool_and(g.snapshot ? 'option_a'),
         max(g.last_wrong_at)
    from public.gaokao_user_mistakes g
   where g.user_id = _student_id and g.module = 'cloze' and g.is_resolved = false
     and (_module is null or _module = 'cloze')
   group by g.parent_id

  union all
  -- 源3:阅读(junior_reading_attempts,按篇)
  select t.reading_id::text, 'reading'::text, 'reading'::text, null::text,
         null::text, null::text, null::text, null::text,
         null::jsonb,
         jsonb_agg(jsonb_build_object(
           'no', t.question_idx, 'user_answer', t.user_answer
         ) order by t.question_idx),
         count(*)::int,
         false,
         max(t.created_at)
    from (
      select distinct on (jra.reading_id, jra.question_idx)
             jra.reading_id, jra.question_idx, jra.user_answer, jra.is_correct, jra.created_at
        from public.junior_reading_attempts jra
       where jra.user_id = _student_id
       order by jra.reading_id, jra.question_idx, jra.created_at desc
    ) t
   where t.is_correct = false
     and (_module is null or _module = 'reading')
   group by t.reading_id;
end;
$$;

revoke all on function public.get_student_mistakes(uuid, text) from public, anon;
grant execute on function public.get_student_mistakes(uuid, text) to authenticated;
-- =====================================================================
