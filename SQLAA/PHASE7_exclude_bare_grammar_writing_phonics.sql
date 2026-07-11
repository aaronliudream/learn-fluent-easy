-- =====================================================================
-- 【待跑·Aaron】老师端错题再排除裸模块 grammar/writing/phonics(edge 薄行残渣)
--
-- 承接 PHASE6:edge(record-attempt)对一批"裸模块"无差别写薄行(无 snapshot)。PHASE6 已挡
-- vocab + 小学 primary_%;本次补挡 **裸 grammar / writing / phonics**——老师端曾冒「(无题目
-- 快照)答案—」的残卡(实测裸 grammar 5 条)。
--
-- 精确匹配:grammar/writing/phonics 放进 not in 集合,**绝不误伤 senior_grammar / gaokao_grammar**
-- (正牌完整语法错题,必须保留)。故用 not in 精确集合、不用 like。
-- 读库预演已验:加此过滤后裸 grammar 消失、senior_grammar(8)/gaokao_grammar 照常显示。
-- 纯改两个 RPC 定义,零表结构/零数据删除。
-- =====================================================================

CREATE OR REPLACE FUNCTION public.get_student_mistake_counts(_student_id uuid)
 RETURNS TABLE(module text, unresolved_count integer)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if not exists (
    select 1 from public.class_members cm
    join public.classes c on c.id = cm.class_id
    where cm.member_id = _student_id and c.teacher_id = auth.uid() and cm.removed_at is null
  ) then return; end if;

  return query
  -- 源1:普通题(排除 cloze/reading/listening + ④ 小学 primary_% + 词汇 vocab)
  select um.module, count(*)::int
    from public.user_mistakes um
   where um.user_id = _student_id and um.is_resolved = false
     and um.module not in ('cloze','reading','listening','vocab','grammar','writing','phonics')
     and um.module not like 'primary_%'
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
            where um2.user_id = _student_id and um2.module = 'reading'
              and um2.source_key = 'junior_reading_passage_' || t.reading_id::text))
    ) as cnt
  ) x
  where cnt > 0;
end;
$function$;


-- ── 2) get_student_mistakes —— 源1 加排除 primary_%/vocab ─────────────────────
CREATE OR REPLACE FUNCTION public.get_student_mistakes(_student_id uuid, _module text DEFAULT NULL::text)
 RETURNS TABLE(id text, kind text, module text, title text, question text, user_answer text, correct_answer text, explanation text, snapshot jsonb, items jsonb, wrong_count integer, is_complete boolean, last_wrong_at timestamp with time zone)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if not exists (
    select 1 from public.class_members cm
    join public.classes c on c.id = cm.class_id
    where cm.member_id = _student_id and c.teacher_id = auth.uid() and cm.removed_at is null
  ) then return; end if;

  return query
  -- 源1:普通题(逐题;排除 cloze/reading/listening + ④ 小学 primary_% + 词汇 vocab)
  select um.id::text, 'plain'::text, um.module, um.source_label,
         um.question, um.user_answer, um.correct_answer, um.explanation,
         um.snapshot, null::jsonb,
         coalesce(um.wrong_count,1)::int,
         (coalesce(um.snapshot,'{}'::jsonb) <> '{}'::jsonb
            or coalesce(um.question,'') <> ''),
         um.last_wrong_at
    from public.user_mistakes um
   where um.user_id = _student_id and um.is_resolved = false
     and um.module not in ('cloze','reading','listening','vocab','grammar','writing','phonics')
     and um.module not like 'primary_%'
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
  -- 源3B:阅读【旧残缺】—— 曾有该篇整篇行(不论 is_resolved)就永久压住,不复活
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
$function$;
