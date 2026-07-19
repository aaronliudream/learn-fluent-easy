-- =====================================================================
-- 块:错题「跨3天连对移出」+ 幽灵错题修复(分歧A/B) —— 待 Aaron 跑
--
-- 内容:
--   1) user_mistakes 加 correct_streak / last_correct_date 两列。
--   2) RPC bump_mistake_correct(_module,_source_key):做对累计,按北京时间 UTC+8
--      判"同天"防刷,correct_streak>=3 才 is_resolved=true 移出。前端 7 处做对 + edge 都调它。
--   3) 老师端 get_student_mistake_counts / get_student_mistakes 两处修:
--      · 分歧A:源1 排除补回 listening → not in ('cloze','reading','listening')
--               (曾在 exclude_thin_listening 修过,被 reading_snapshot_union 从旧基线重写漏回,此处重新落实)
--      · 分歧B:源3B 守卫改"曾有整篇行(不论 is_resolved)就永久压住"——学生做对/移出后不再从
--               junior_reading_attempts 原始日志复活。#2 那种从没整篇行的老篇不受影响,照常降级显示。
--
-- 幂等;改列 → 先 DROP。P0 班级归属校验 + SECURITY DEFINER + REVOKE public/anon 全保留。
-- =====================================================================

-- ── 0) 加列 ──────────────────────────────────────────────────────────
alter table public.user_mistakes
  add column if not exists correct_streak int not null default 0,
  add column if not exists last_correct_date date;

comment on column public.user_mistakes.correct_streak is
  '跨天连对计数:做对且非同天 +1,做错归0,>=3 → is_resolved=true 移出(见 bump_mistake_correct)';
comment on column public.user_mistakes.last_correct_date is
  '最近一次计入连对的北京时间(UTC+8)日期;同一天重复做对不再加(防刷)';


-- ── 1) 做对累计 RPC(唯一移出途径)──────────────────────────────────
-- auth.uid() 归属;(user_id,module,source_key) 唯一 → 至多一行未解决,无歧义。
-- 前端各做对路径 + record-attempt edge(以用户身份跑,auth.uid() 有效)统一调用。
create or replace function public.bump_mistake_correct(_module text, _source_key text)
returns table(correct_streak int, is_resolved boolean, already_today boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  _uid   uuid := auth.uid();
  _today date := (now() at time zone 'Asia/Shanghai')::date;  -- 北京时间,不用 UTC
  _id    uuid;
  _streak int;
  _lcd   date;
  _resolved boolean;
  _new   int;
begin
  if _uid is null then return; end if;

  select um.id, um.correct_streak, um.last_correct_date, um.is_resolved
    into _id, _streak, _lcd, _resolved
    from public.user_mistakes um
   where um.user_id = _uid and um.module = _module
     and um.source_key = _source_key and um.is_resolved = false;
  if not found then return; end if;               -- 本就没错过该题 → no-op

  if _lcd = _today then                            -- 同天已计 → 防刷,不加
    return query select _streak, _resolved, true;
    return;
  end if;

  _new := coalesce(_streak, 0) + 1;
  update public.user_mistakes
     set correct_streak    = _new,
         last_correct_date = _today,
         is_resolved       = (_new >= 3),
         updated_at        = now()
   where id = _id;

  return query select _new, (_new >= 3), false;
end;
$$;

revoke all on function public.bump_mistake_correct(text, text) from public, anon;
grant execute on function public.bump_mistake_correct(text, text) to authenticated;


-- ── 2) get_student_mistake_counts —— 分歧A(源1补 listening)+ 分歧B(源3B守卫)─
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
  -- 源1:普通题(排除 cloze/reading/listening ← A:补回 listening)
  select um.module, count(*)::int
    from public.user_mistakes um
   where um.user_id = _student_id and um.is_resolved = false
     and um.module not in ('cloze','reading','listening')
   group by um.module

  union all
  -- 源2:完形,按篇
  select 'cloze', count(distinct g.parent_id)::int
    from public.gaokao_user_mistakes g
   where g.user_id = _student_id and g.module = 'cloze' and g.is_resolved = false
  having count(*) > 0

  union all
  -- 源3:阅读,按篇 = 新快照篇 + 无快照的旧篇(避免同篇双算)
  select 'reading', cnt::int from (
    select (
      (select count(*) from public.user_mistakes um
         where um.user_id = _student_id and um.module = 'reading' and um.is_resolved = false
           and um.source_key like 'junior_reading_passage_%')
      +
      (select count(distinct t.reading_id) from (
         select distinct on (jra.reading_id, jra.question_idx)
                jra.reading_id, jra.is_correct
           from public.junior_reading_attempts jra
          where jra.user_id = _student_id
          order by jra.reading_id, jra.question_idx, jra.created_at desc
       ) t
       where t.is_correct = false
         and not exists (
           -- B:曾有该篇整篇行(不论 is_resolved)就永久压住,不从原始日志复活
           select 1 from public.user_mistakes um2
            where um2.user_id = _student_id and um2.module = 'reading'
              and um2.source_key = 'junior_reading_passage_' || t.reading_id::text))
    ) as cnt
  ) x
  where cnt > 0;
end;
$$;

revoke all on function public.get_student_mistake_counts(uuid) from public, anon;
grant execute on function public.get_student_mistake_counts(uuid) to authenticated;


-- ── 3) get_student_mistakes —— 分歧A(源1补 listening)+ 分歧B(源3B守卫)──────
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
  -- 源1:普通题(逐题;排除 cloze/reading/listening ← A:补回 listening)
  select um.id::text, 'plain'::text, um.module, um.source_label,
         um.question, um.user_answer, um.correct_answer, um.explanation,
         um.snapshot, null::jsonb,
         coalesce(um.wrong_count,1)::int,
         (coalesce(um.snapshot,'{}'::jsonb) <> '{}'::jsonb
            or coalesce(um.question,'') <> ''),
         um.last_wrong_at
    from public.user_mistakes um
   where um.user_id = _student_id and um.is_resolved = false
     and um.module not in ('cloze','reading','listening')
     and (_module is null or um.module = _module)

  union all
  -- 源2:完形(按篇)—— 原样
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
  -- 源3A:阅读【新快照】(自包含,可展开整篇)—— 原样
  select replace(um.source_key, 'junior_reading_passage_', '')::text,
         'reading'::text, 'reading'::text, um.source_label,
         null::text, null::text, null::text, null::text,
         null::jsonb,
         coalesce(um.snapshot->'questions', '[]'::jsonb),
         coalesce(um.wrong_count, jsonb_array_length(um.snapshot->'questions'))::int,
         true,
         um.last_wrong_at
    from public.user_mistakes um
   where um.user_id = _student_id and um.module = 'reading' and um.is_resolved = false
     and um.source_key like 'junior_reading_passage_%'
     and (_module is null or _module = 'reading')

  union all
  -- 源3B:阅读【旧残缺】—— B:曾有该篇整篇行(不论 is_resolved)就永久压住,不复活
  select t.reading_id::text, 'reading'::text, 'reading'::text, null::text,
         null::text, null::text, null::text, null::text,
         null::jsonb,
         jsonb_agg(jsonb_build_object('no', t.question_idx, 'user_answer', t.user_answer)
                   order by t.question_idx),
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
     and not exists (
       select 1 from public.user_mistakes um2
        where um2.user_id = _student_id and um2.module = 'reading'
          and um2.source_key = 'junior_reading_passage_' || t.reading_id::text)
   group by t.reading_id;
end;
$$;

revoke all on function public.get_student_mistakes(uuid, text) from public, anon;
grant execute on function public.get_student_mistakes(uuid, text) to authenticated;
-- =====================================================================
