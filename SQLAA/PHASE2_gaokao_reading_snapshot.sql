-- =====================================================================
-- 教师功能 Phase 2 · 高中阅读错题自包含快照 · 读取层 —— 待 Aaron 跑
--
-- 背景:高中阅读(GaokaoReadingPlay)改造后,答完全题且有错时 client 直写一条自包含快照到
--   user_mistakes(module='reading', source_key='gaokao_reading_passage_<passage_id>',
--   snapshot={title,body,questions:[{no,stem,options,correct_answer,user_answer,is_correct,explanation}],
--   wrong_count})。与初中阅读(junior_reading_passage_)同构,只是前缀不同。
--
-- 本文件把三个读取 RPC 的【阅读分支】从"只认 junior_reading_passage_"放宽到
--   "junior_reading_passage_ 或 gaokao_reading_passage_"两种前缀,读同一套 snapshot、走同一套
--   PassageReviewPanel(前端零改动)。旧数据不动(高中旧记录在 gaokao_user_attempts,本步不降级,
--   只对改造后新做的阅读生效)。
--
-- ⚠ 只对上线后新产生的高中阅读错题生效。P0 归属校验 + SECURITY DEFINER + REVOKE。幂等。
-- ⚠ get_student_mistakes 改返回逻辑 → 先 DROP 再 CREATE。
-- =====================================================================

-- ── 1) get_student_mistake_counts —— 阅读计数放宽到两种前缀 ──────────────────────
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
  -- 源3:阅读,按篇 = 新快照篇(初中+高中两前缀) + 无快照的旧【初中】篇(高中旧数据本步不降级)
  select 'reading', cnt::int from (
    select (
      (select count(*) from public.user_mistakes um
         where um.user_id = _student_id and um.module = 'reading' and um.is_resolved = false
           and (um.source_key like 'junior_reading_passage_%'
             or um.source_key like 'gaokao_reading_passage_%'))
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


-- ── 2) get_student_mistakes —— 阅读新快照放宽到两前缀;旧降级仅初中 ────────────────
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
  -- 源2:完形(按篇,逐空进 items;内容全来自 snapshot,不 join)—— 原样
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
  -- 源3A:阅读【新快照】(初中 junior_ + 高中 gaokao_ 两前缀;自包含,可展开整篇 IXL)
  select regexp_replace(um.source_key, '^(junior|gaokao)_reading_passage_', ''),  -- id = passage_id
         'reading'::text, 'reading'::text, um.source_label,
         null::text, null::text, null::text, null::text,
         null::jsonb,
         coalesce(um.snapshot->'questions', '[]'::jsonb),
         coalesce(um.wrong_count, jsonb_array_length(um.snapshot->'questions'))::int,
         true,
         um.last_wrong_at
    from public.user_mistakes um
   where um.user_id = _student_id and um.module = 'reading' and um.is_resolved = false
     and (um.source_key like 'junior_reading_passage_%'
       or um.source_key like 'gaokao_reading_passage_%')
     and (_module is null or _module = 'reading')

  union all
  -- 源3B:阅读【旧残缺·仅初中】(junior_reading_attempts,且该篇无新快照)→ 降级
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


-- ── 3) get_teacher_student_passage_review —— 阅读分支放宽到两前缀 ─────────────────
create or replace function public.get_teacher_student_passage_review(
  _student_id uuid,
  _source     text,      -- 'reading' | 'cloze'
  _passage_id uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if not exists (
    select 1 from public.class_members cm
    join public.classes c on c.id = cm.class_id
    where cm.member_id = _student_id and c.teacher_id = auth.uid() and cm.removed_at is null
  ) then
    return null;
  end if;

  if _source = 'reading' then
    -- 阅读:纯读自包含快照(初中 junior_ / 高中 gaokao_ 两前缀,取存在的那条);不 join 题库
    select jsonb_build_object(
      'source', 'reading',
      'title',  um.snapshot->>'title',
      'body',   um.snapshot->>'body',
      'total',  jsonb_array_length(um.snapshot->'questions'),
      'has_user_answers', true,
      'wrong_count', coalesce(um.wrong_count, 0),
      'items', (
        select jsonb_agg(jsonb_build_object(
          'no',             (q->>'no')::int,
          'stem',           q->>'stem',
          'options',        q->'options',
          'correct_answer', q->>'correct_answer',
          'user_answer',    q->>'user_answer',
          'is_correct',     (q->>'is_correct')::boolean,
          'wrong',          not coalesce((q->>'is_correct')::boolean, false),
          'explanation',    q->>'explanation'
        ) order by (q->>'no')::int)
        from jsonb_array_elements(um.snapshot->'questions') as q
      )
    ) into result
    from public.user_mistakes um
    where um.user_id = _student_id and um.module = 'reading' and um.is_resolved = false
      and um.source_key in ('junior_reading_passage_' || _passage_id::text,
                            'gaokao_reading_passage_' || _passage_id::text);

    if result is null then
      return jsonb_build_object('source', 'reading', 'missing', true);
    end if;
    return result;

  elsif _source = 'cloze' then
    -- 完形:仅 snapshot(每行=一个做错的空);无整篇全文、无做对的空 → limited
    select jsonb_build_object(
      'source', 'cloze',
      'title',  max(g.parent_label),
      'body',   null,
      'limited', true,
      'has_full_passage', false,
      'wrong_count', count(*)::int,
      'items', jsonb_agg(jsonb_build_object(
        'no',             nullif(g.snapshot->>'blank_no','')::int,
        'stem',           null,
        'options',        jsonb_build_object(
                            'A', g.snapshot->>'option_a', 'B', g.snapshot->>'option_b',
                            'C', g.snapshot->>'option_c', 'D', g.snapshot->>'option_d'),
        'correct_answer', g.correct_answer,
        'user_answer',    g.user_answer,
        'is_correct',     false,
        'wrong',          true,
        'explanation',    g.snapshot->>'general_explanation'
      ) order by nullif(g.snapshot->>'blank_no','')::int)
    ) into result
    from public.gaokao_user_mistakes g
    where g.user_id = _student_id and g.module = 'cloze'
      and g.parent_id = _passage_id and g.is_resolved = false;

    if result is null then
      return jsonb_build_object('source', 'cloze', 'missing', true);
    end if;
    return result;

  else
    return null;
  end if;
end;
$$;

revoke all on function public.get_teacher_student_passage_review(uuid, text, uuid) from public, anon;
grant execute on function public.get_teacher_student_passage_review(uuid, text, uuid) to authenticated;
-- =====================================================================
