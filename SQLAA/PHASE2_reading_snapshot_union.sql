-- =====================================================================
-- 教师功能 Phase 2 · 阅读错题自包含快照 · 读取层(试点:仅初中阅读)—— 待 Aaron 跑
--
-- 背景:初中阅读做题时完整数据(原文/题干/选项/正确答案/学生作答)都在手边,但过去
--   只写了 junior_reading_attempts(reading_id/question_idx/user_answer/is_correct)这点残渣,
--   题干/选项/正确答案/原文全丢 → 老师端只剩"错N题+第N题选X"。且题库 load 文件反复
--   DELETE+INSERT 换 uuid,事后 join 内容表拼不出可靠整篇。
--
-- 改造后(见 JuniorReadingPlay.handleSubmit):提交且有错题时,client 直写一条
--   自包含快照到 user_mistakes(module='reading', source_key='junior_reading_passage_<reading_id>',
--   snapshot={title,body,grade,questions:[{no,stem,options,correct_answer,user_answer,is_correct,explanation}],
--   wrong_count})。一篇一条(onConflict 覆盖),wrong_count=错题数(按题不按次)。彻底不依赖题库表。
--
-- 本文件重定义两个读取 RPC 的【阅读分支】:
--   · 新篇(有 junior_reading_passage_ 快照)→ 自包含、is_complete=true、items 直取 snapshot 全题。
--   · 旧篇(无快照,只有 junior_reading_attempts)→ 降级、is_complete=false、只标"错哪题",
--     整篇由前端标"旧数据不可用",绝不 join 拼脏。
--   普通题(源1)/完形(源2)分支与 DONE_PHASE2_teacher_mistakes_union.sql 完全一致,原样保留。
--
-- ⚠ 只对改造上线后新产生的阅读错题生效;旧残缺记录不动、只降级显示。
-- P0 班级归属校验 + SECURITY DEFINER + REVOKE public/anon。幂等。get_student_mistakes 改列 → 先 DROP。
-- =====================================================================

-- ── 1) get_student_mistake_counts —— 阅读计数=新快照篇数 + 无快照的旧篇数(不重复)──
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


-- ── 2) get_student_mistakes —— 阅读:新快照(完整) + 旧残缺(降级)────────────────
drop function if exists public.get_student_mistakes(uuid, text);

create function public.get_student_mistakes(_student_id uuid, _module text default null)
returns table(
  id             text,
  kind           text,        -- 'plain' | 'cloze' | 'reading'
  module         text,
  title          text,
  question       text,
  user_answer    text,
  correct_answer text,
  explanation    text,
  snapshot       jsonb,
  items          jsonb,
  wrong_count    int,
  is_complete    boolean,     -- 阅读:新快照=true(可展开整篇);旧残缺=false(整篇不可用)
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
  -- 源3A:阅读【新快照】(自包含,可展开整篇 IXL)
  select replace(um.source_key, 'junior_reading_passage_', '')::text,   -- id = reading_id
         'reading'::text, 'reading'::text, um.source_label,
         null::text, null::text, null::text, null::text,
         null::jsonb,
         coalesce(um.snapshot->'questions', '[]'::jsonb),                -- items = 全题快照
         coalesce(um.wrong_count, jsonb_array_length(um.snapshot->'questions'))::int,
         true,                                                          -- is_complete
         um.last_wrong_at
    from public.user_mistakes um
   where um.user_id = _student_id and um.module = 'reading' and um.is_resolved = false
     and um.source_key like 'junior_reading_passage_%'
     and (_module is null or _module = 'reading')

  union all
  -- 源3B:阅读【旧残缺】(仅 junior_reading_attempts,且该篇无新快照)→ 降级,整篇不可用
  select t.reading_id::text, 'reading'::text, 'reading'::text, null::text,
         null::text, null::text, null::text, null::text,
         null::jsonb,
         jsonb_agg(jsonb_build_object('no', t.question_idx, 'user_answer', t.user_answer)
                   order by t.question_idx),
         count(*)::int,
         false,                                                         -- is_complete=false
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
