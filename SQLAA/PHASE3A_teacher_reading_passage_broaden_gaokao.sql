-- =====================================================================
-- 块③-A · 老师端阅读整篇放宽到高中 —— 待 Aaron 跑
--
-- 背景:老师端 get_student_mistakes 源3A 现在阅读只取 source_key like
--   'junior_reading_passage_%'(初中)。高中(GaokaoReadingPlay / 本块新增的
--   GaokaoReadingArticle)写的是 'gaokao_reading_passage_<id>',老师端看不到。
-- 本文件把源3A + 计数的阅读整篇分支放宽为 '%_reading_passage_%'(同时覆盖
--   junior + gaokao),并把 id 提取从写死的 replace('junior_reading_passage_')
--   改为 regexp 去掉任意 '<前缀>_reading_passage_',以正确还原 reading_id/article_id。
-- 学生端 /mistakes 无需改(过滤只看 snapshot.questions 有无,高中整篇天然通过)。
--
-- 只改这两个 RPC 的【阅读分支】;普通题(源1)/完形(源2)/旧残缺(源3B)原样保留。
-- P0 班级归属校验 + SECURITY DEFINER + REVOKE public/anon,幂等。改列 → 先 DROP。
-- =====================================================================

-- ── 1) get_student_mistake_counts —— 阅读计数放宽到 %_reading_passage_% ──
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
  -- 源1:普通题(排除 cloze/reading)
  select um.module, count(*)::int
    from public.user_mistakes um
   where um.user_id = _student_id and um.is_resolved = false
     and um.module not in ('cloze','reading')
   group by um.module

  union all
  -- 源2:完形,按篇
  select 'cloze', count(distinct g.parent_id)::int
    from public.gaokao_user_mistakes g
   where g.user_id = _student_id and g.module = 'cloze' and g.is_resolved = false
  having count(*) > 0

  union all
  -- 源3:阅读,按篇 = 新快照篇(junior+gaokao)+ 无快照的旧初中篇(不双算)
  select 'reading', cnt::int from (
    select (
      (select count(*) from public.user_mistakes um
         where um.user_id = _student_id and um.module = 'reading' and um.is_resolved = false
           and um.source_key like '%\_reading\_passage\_%')       -- ← 放宽:junior + gaokao
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
           select 1 from public.user_mistakes um2
            where um2.user_id = _student_id and um2.module = 'reading' and um2.is_resolved = false
              and um2.source_key = 'junior_reading_passage_' || t.reading_id::text))
    ) as cnt
  ) x
  where cnt > 0;
end;
$$;

revoke all on function public.get_student_mistake_counts(uuid) from public, anon;
grant execute on function public.get_student_mistake_counts(uuid) to authenticated;


-- ── 2) get_student_mistakes —— 源3A 阅读整篇放宽到 %_reading_passage_% ──
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
  -- 源1:普通题(逐题)—— 原样
  select um.id::text, 'plain'::text, um.module, um.source_label,
         um.question, um.user_answer, um.correct_answer, um.explanation,
         um.snapshot, null::jsonb,
         coalesce(um.wrong_count,1)::int,
         (coalesce(um.snapshot,'{}'::jsonb) <> '{}'::jsonb
            or coalesce(um.question,'') <> ''),
         um.last_wrong_at
    from public.user_mistakes um
   where um.user_id = _student_id and um.is_resolved = false
     and um.module not in ('cloze','reading')
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
  -- 源3A:阅读【新快照】放宽到 junior + gaokao;id 用 regexp 去 '<前缀>_reading_passage_'
  select regexp_replace(um.source_key, '^[a-z0-9]+_reading_passage_', '')::text,   -- id = reading_id / article_id
         'reading'::text, 'reading'::text, um.source_label,
         null::text, null::text, null::text, null::text,
         null::jsonb,
         coalesce(um.snapshot->'questions', '[]'::jsonb),
         coalesce(um.wrong_count, jsonb_array_length(um.snapshot->'questions'))::int,
         true,
         um.last_wrong_at
    from public.user_mistakes um
   where um.user_id = _student_id and um.module = 'reading' and um.is_resolved = false
     and um.source_key like '%\_reading\_passage\_%'                                -- ← 放宽
     and (_module is null or _module = 'reading')

  union all
  -- 源3B:阅读【旧残缺】(仅初中 junior_reading_attempts,且该篇无新快照)→ 降级
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
        where um2.user_id = _student_id and um2.module = 'reading' and um2.is_resolved = false
          and um2.source_key = 'junior_reading_passage_' || t.reading_id::text)
   group by t.reading_id;
end;
$$;

revoke all on function public.get_student_mistakes(uuid, text) from public, anon;
grant execute on function public.get_student_mistakes(uuid, text) to authenticated;
-- =====================================================================
