-- =====================================================================
-- 教师功能 Phase 2 · 整篇下钻(方案 A · 第②层)—— 待 Aaron 跑
--
-- 老师点开一篇阅读/完形错题 → 整篇原文 + 所有题 + 正确答案 + 该生错题 + 可得作答。
--
-- 阅读(_source='reading'):
--   原文/所有题/正确答案 ← 内容表 junior_reading(body + questions jsonb);
--   学生每题作答/对错     ← junior_reading_attempts(每题最新一次);
--   INNER 读 junior_reading:原题已删 → 返回 {missing:true},绝不显示脏数据。
-- 完形(_source='cloze'):
--   仅从 gaokao_user_mistakes.snapshot 读(每行=一个做错的空:选项/答案/学生作答/解析);
--   ⚠ snapshot 无整篇全文、无做对的空 → limited=true,前端老实标注,不 join legacy 题库、不编造。
--
-- P0 班级归属校验 + SECURITY DEFINER + REVOKE public/anon。幂等。
-- =====================================================================

create or replace function public.get_teacher_student_passage_review(
  _student_id uuid,
  _source     text,      -- 'reading' | 'cloze'
  _passage_id uuid       -- reading_id / cloze parent_id
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  result jsonb;
  jr     record;
begin
  -- P0 归属校验:该生须在调用老师的某个班
  if not exists (
    select 1 from public.class_members cm
    join public.classes c on c.id = cm.class_id
    where cm.member_id = _student_id and c.teacher_id = auth.uid() and cm.removed_at is null
  ) then
    return null;
  end if;

  if _source = 'reading' then
    -- 内容表(当前活表)读整篇;INNER:没有=原题已删
    select title, body, questions into jr
      from public.junior_reading where id = _passage_id;
    if not found then
      return jsonb_build_object('source', 'reading', 'missing', true);
    end if;

    select jsonb_build_object(
      'source', 'reading',
      'title',  jr.title,
      'body',   jr.body,
      'total',  jsonb_array_length(jr.questions),
      'has_user_answers', true,
      'wrong_count', (
        select count(*) from (
          select distinct on (jra.question_idx) jra.is_correct
            from public.junior_reading_attempts jra
           where jra.user_id = _student_id and jra.reading_id = _passage_id
           order by jra.question_idx, jra.created_at desc
        ) x where x.is_correct = false
      ),
      'items', (
        select jsonb_agg(jsonb_build_object(
          'no',             q.ord,
          'stem',           q.val->>'q',
          'options',        (select jsonb_object_agg(chr(64 + o.ord::int), o.val)
                               from jsonb_array_elements_text(q.val->'options')
                                    with ordinality as o(val, ord)),
          'correct_answer', q.val->>'answer',
          'user_answer',    a.user_answer,
          'is_correct',     a.is_correct,
          'wrong',          (a.is_correct is not null and a.is_correct = false),
          'explanation',    q.val->>'explanation'
        ) order by q.ord)
        from jsonb_array_elements(jr.questions) with ordinality as q(val, ord)
        left join lateral (
          select jra.user_answer, jra.is_correct
            from public.junior_reading_attempts jra
           where jra.user_id = _student_id
             and jra.reading_id = _passage_id
             and jra.question_idx = q.ord - 1
           order by jra.created_at desc
           limit 1
        ) a on true
      )
    ) into result;
    return result;

  elsif _source = 'cloze' then
    -- 仅 snapshot;无整篇全文、无做对的空
    select jsonb_build_object(
      'source', 'cloze',
      'title',  max(g.parent_label),
      'body',   null,
      'limited', true,            -- 前端据此标注"仅错空,无整篇原文快照"
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
