-- =====================================================================
-- 教师功能 Phase 2 · 整篇下钻(方案 A · 第②层)—— 待 Aaron 跑
--
-- 老师点开一篇完形/阅读错题 → 整篇 + 所有题 + 正确答案 + 学生作答 + 解析(IXL 三栏)。
-- ⚠ 两种源都【只读写入当下的 snapshot,绝不 join 会变的题库表】,天然绕开重灌换 id。
--
-- 完形(_source='cloze'):
--   从 gaokao_user_mistakes.snapshot 读(每行=一个做错的空:选项/答案/学生作答/解析);
--   snapshot 无整篇全文、无做对的空 → limited=true,前端老实标注,不 join legacy 题库。
--
-- 阅读(_source='reading'):
--   从 user_mistakes(module='reading', source_key='junior_reading_passage_<reading_id>')的
--   自包含 snapshot 读(整篇原文 body + 全题 questions:题干/选项/正确答案/学生作答/对错/解析)。
--   仅【改造上线后新做】的阅读才有此快照;老篇无 → 返回 missing,前端标"整篇不可用(旧数据)"。
--   _passage_id 传 reading_id。
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
    -- 阅读:纯读自包含快照(改造上线后新做的篇才有);不 join 题库
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
      and um.source_key = 'junior_reading_passage_' || _passage_id::text;

    if result is null then
      return jsonb_build_object('source', 'reading', 'missing', true);
    end if;
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
