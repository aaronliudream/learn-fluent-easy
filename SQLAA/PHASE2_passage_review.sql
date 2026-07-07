-- =====================================================================
-- 教师功能 Phase 2 · 整篇下钻(方案 A · 第②层)—— 待 Aaron 跑
--
-- 老师点开一篇完形错题 → 每个做错的空 + 选项 + 正确答案 + 学生作答 + 解析。
--
-- 本轮范围:仅【完形 cloze】。阅读整篇【本轮不做】——
--   根因:junior_reading 内容经分册 load 文件反复 DELETE+INSERT 重灌(id 走
--   gen_random_uuid 默认,每次换新 uuid),旧 junior_reading_attempts.reading_id 成孤儿、
--   位置型 question_idx 也会错位 → 与内容表 join 会拼出错误整篇。故本 RPC 不碰 junior_reading,
--   阅读走前端"整篇原文暂不可用"静态标注(见 TeacherStudent.tsx),不 join、不编造、不拼错。
--
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

  if _source = 'cloze' then
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
