-- D1: 初中掌握度总览 RPC —— 按 publisher='junior'(人教) 过滤的 分子+分母,一次返回全模块。
-- 根治 dashboard 初中环 >100%(高中 mastery 经共用表灌进分子 + 分母硬编码过时)。
--
-- ★安全铁律★
--  · SECURITY DEFINER 绕过 RLS → 函数自身锁 auth.uid(),★不接 _user_id 参数★
--    (接参数=任何登录用户传别人 uuid 即可读他人掌握度,SECURITY DEFINER 恰好绕开 RLS 拦截)。
--  · SET search_path TO 'public'。
--  · 只授权 authenticated;anon 拿不到(且 auth.uid() 为 null 时无行匹配)。
-- 幂等:create or replace,可重跑。Aaron service role 跑。
--
-- 口径与前端 useMasteryOverview 对齐:
--  vocab   mastered=level>=3 / learned=1..2 / due=due_at<=now
--  reading mastered=stars>=5 或 best_pct>=80 / else learned / due=next_review<=now 且 stars<5
--  listen  按 exercise 聚合:答对率>=0.8=mastered else learned(无 due)
--  writing 按 prompt 取 max(score):>=80=mastered else learned(无 due)
--  grammar item_type='grammar_question':correct_count>=2=mastered / 有练过=learned(无 due)
--  分母 = 该模块 publisher='junior' 内容总数(grammar=挂在 unit 非空语法点上的题数)

create or replace function public.junior_mastery_overview()
returns table (module text, mastered int, learned int, due int, total int)
language sql
security definer
set search_path to 'public'
as $$
  -- 词汇
  select 'vocab'::text,
    count(*) filter (where wm.mastery_level >= 3)::int,
    count(*) filter (where wm.mastery_level >= 1 and wm.mastery_level < 3)::int,
    count(*) filter (where wm.due_at is not null and wm.due_at <= now())::int,
    (select count(*) from junior_vocab where publisher = 'junior')::int
  from junior_word_mastery wm
  join junior_vocab v on v.id::text = wm.word_id::text
  where wm.user_id = auth.uid() and v.publisher = 'junior'

  union all
  -- 阅读
  select 'reading'::text,
    count(*) filter (where mp.stars >= 5 or mp.best_pct >= 80)::int,
    count(*) filter (where not (mp.stars >= 5 or mp.best_pct >= 80))::int,
    count(*) filter (where mp.next_review_at is not null and mp.next_review_at <= now() and mp.stars < 5)::int,
    (select count(*) from junior_reading where publisher = 'junior')::int
  from mastery_progress mp
  join junior_reading jr on jr.id::text = mp.item_id::text
  where mp.user_id = auth.uid() and mp.module = 'junior_reading' and jr.publisher = 'junior'

  union all
  -- 听力(按 exercise 聚合)
  select 'listening'::text,
    count(*) filter (where a.ratio >= 0.8)::int,
    count(*) filter (where a.ratio < 0.8)::int,
    0,
    (select count(*) from junior_listening_exercises where publisher = 'junior')::int
  from (
    select la.exercise_id,
      (count(*) filter (where la.is_correct))::float / nullif(count(*), 0) as ratio
    from junior_listening_attempts la
    join junior_listening_exercises e on e.id::text = la.exercise_id::text
    where la.user_id = auth.uid() and e.publisher = 'junior'
    group by la.exercise_id
  ) a

  union all
  -- 写作(按 prompt 取 max score)
  select 'writing'::text,
    count(*) filter (where w.sc >= 80)::int,
    count(*) filter (where w.sc < 80)::int,
    0,
    (select count(*) from junior_writing_prompts where publisher = 'junior')::int
  from (
    select wa.prompt_id, max(wa.overall_score) as sc
    from junior_writing_attempts wa
    join junior_writing_prompts p on p.id::text = wa.prompt_id::text
    where wa.user_id = auth.uid() and p.publisher = 'junior'
    group by wa.prompt_id
  ) w

  union all
  -- 语法(item_type='grammar_question' → questions → points.publisher)
  select 'grammar'::text,
    count(*) filter (where um.correct_count >= 2)::int,
    count(*) filter (where um.correct_count < 2 and (um.correct_count + um.wrong_count) > 0)::int,
    0,
    (select count(*)
       from junior_grammar_questions q2
       join junior_grammar_points gp2 on gp2.id::text = q2.point_id::text
      where gp2.publisher = 'junior' and gp2.unit is not null)::int
  from junior_user_mastery um
  join junior_grammar_questions q on q.id::text = um.item_id::text
  join junior_grammar_points gp on gp.id::text = q.point_id::text
  where um.user_id = auth.uid() and um.item_type = 'grammar_question' and gp.publisher = 'junior';
$$;

revoke all on function public.junior_mastery_overview() from public, anon;
grant execute on function public.junior_mastery_overview() to authenticated;
