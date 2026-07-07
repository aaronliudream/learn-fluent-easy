-- =====================================================================
-- 教师功能 Phase 2 · 错题读取层统一(方案 A · 第①层)—— 待 Aaron 跑
--
-- 目标:学生详情页"错题(按板块)"把三套源合并,并把完形/阅读按【篇】计薄弱数。
--   源1 user_mistakes(普通题:语法/知识卡/听力/chat…)—— 读各自 snapshot,逐题一行
--   源2 gaokao_user_mistakes(module='cloze')—— 完形,按 parent_id(篇)聚合,读逐空 snapshot
--   源3 junior_reading_attempts —— 阅读,按 reading_id(篇)聚合,取每题最新一次作答判错
--
-- 【不 join 现在的题库表】:完形逐空内容全部来自 gaokao_user_mistakes.snapshot
--   (option_a..d/general_explanation,写入当下的快照,与题库版本解耦,天然绕开旧数据)。
--   阅读 junior_reading_attempts 没有 snapshot → 标 is_complete=false,前端降级(只标错、不展开)。
-- 【薄弱数按篇】:一篇完形错 3 空 = 1 块(count(distinct parent_id));阅读同理(distinct reading_id)。
-- 【残缺降级不砍】:snapshot 空/缺 → is_complete=false,仍返回(前端降级显示),绝不 join 拼脏数据。
--
-- 全部 P0 班级归属校验 + SECURITY DEFINER + REVOKE public/anon。幂等。
-- ⚠ get_student_mistakes 改了返回列 → 先 DROP 再 CREATE。
-- =====================================================================

-- ── 1) get_student_mistake_counts —— 三源计数(完形/阅读按篇)──────────────
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
  -- 源1:普通题(排除 cloze/reading,交给源2/3 按篇)
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
  -- 源3:阅读,按篇(每题取最新一次,错的)
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


-- ── 2) get_student_mistakes —— 三源明细(普通题逐题 / 完形阅读按篇)──────────
drop function if exists public.get_student_mistakes(uuid, text);

create function public.get_student_mistakes(_student_id uuid, _module text default null)
returns table(
  id             text,        -- 普通题=um.id;篇=parent_id/reading_id
  kind           text,        -- 'plain' | 'cloze' | 'reading'
  module         text,        -- 分组键:um.module / 'cloze' / 'reading'
  title          text,        -- source_label / parent_label(篇名);阅读无则 null
  question       text,        -- 普通题题干;篇型 null
  user_answer    text,        -- 普通题;篇型 null(在 items 里)
  correct_answer text,
  explanation    text,
  snapshot       jsonb,       -- 普通题原 snapshot;篇型 null
  items          jsonb,       -- 篇型:错空/题数组;普通题 null
  wrong_count    int,         -- 普通题=um.wrong_count;篇型=错空/题数
  is_complete    boolean,     -- snapshot 是否够展开(前端据此降级)
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
            or coalesce(um.question,'') <> ''),           -- 有快照或有题干 → 可展开
         um.last_wrong_at
    from public.user_mistakes um
   where um.user_id = _student_id and um.is_resolved = false
     and um.module not in ('cloze','reading')
     and (_module is null or um.module = _module)

  union all
  -- 源2:完形(按篇,逐空进 items;内容全来自 snapshot,不 join)
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
         bool_and(g.snapshot ? 'option_a'),               -- 每空都有选项快照才算完整
         max(g.last_wrong_at)
    from public.gaokao_user_mistakes g
   where g.user_id = _student_id and g.module = 'cloze' and g.is_resolved = false
     and (_module is null or _module = 'cloze')
   group by g.parent_id

  union all
  -- 源3:阅读(按篇;无 snapshot → is_complete=false,items 仅存作答,前端降级)
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
