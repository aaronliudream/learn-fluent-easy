-- =====================================================================
-- 【待跑·Aaron】老师端错题排除小学 + 词汇 —— 落实 ④「小学不进」+「词汇任何学段不进」
--
-- 背景:record-attempt edge 曾对所有做错无差别写 user_mistakes(薄行),小学词汇/课程/口语/
--   阅读 + 初中词汇因此漏进错题本,老师端「词汇」组冒出一堆「(无题目快照)、答案—」的残缺错题,
--   还虚高「薄弱」计数。edge 侧已加 guard(stage=primary / module=vocab 不再写);本 SQL 是显示端
--   兜底:两个老师端 RPC 源1 加排除,**老数据也立即隐藏**(只滤不删)。
--
-- 排除口径(按 module,不按 source_key —— 小学核心 primary_lesson/chat_quiz/reading 的 source_key
--   是纯词/uuid、不带 primary_ 前缀,只有薄行才带;按 module 才干净):
--     · module like 'primary_%'  → 小学核心(primary_lesson/primary_chat_quiz/primary_reading)
--     · module = 'vocab'         → 全学段词汇(小学 primary_vocab_* + 初中 junior_vocab_*)
--   (小学听力走 module='listening'、已在原黑名单;故无需另加。)
--
-- 纯改两个 RPC 定义,零表结构变更、零数据删除。跑完老师端「词汇」组即消失、小学错题不再显示。
-- =====================================================================

-- ── 1) get_student_mistake_counts —— 源1 加排除 primary_%/vocab ───────────────
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
     and um.module not in ('cloze','reading','listening')
     and um.module not like 'primary_%'
     and um.module <> 'vocab'
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
     and um.module not in ('cloze','reading','listening')
     and um.module not like 'primary_%'
     and um.module <> 'vocab'
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
