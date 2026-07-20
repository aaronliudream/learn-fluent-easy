-- D1-c: junior_mastery_overview() 增加 publisher 参数(内容维度·做成参数安全)。
-- 原 D1 版把 publisher='junior' 写死 → 外研社学生进度环永远 0/2434(分子滤掉外研社词·分母人教)。
-- ★安全铁律不变★:auth.uid() 仍锁在函数体、绝不接 _user_id;只把"内容维度"的 publisher 参数化。
-- 幂等:先 DROP 旧 0 参版(避免与新版重载歧义),再建带默认值的新版。Aaron service role 跑。

drop function if exists public.junior_mastery_overview();

create or replace function public.junior_mastery_overview(_publisher text default 'junior')
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
    (select count(*) from junior_vocab where publisher = _publisher)::int
  from junior_word_mastery wm
  join junior_vocab v on v.id::text = wm.word_id::text
  where wm.user_id = auth.uid() and v.publisher = _publisher

  union all
  -- 阅读
  select 'reading'::text,
    count(*) filter (where mp.stars >= 5 or mp.best_pct >= 80)::int,
    count(*) filter (where not (mp.stars >= 5 or mp.best_pct >= 80))::int,
    count(*) filter (where mp.next_review_at is not null and mp.next_review_at <= now() and mp.stars < 5)::int,
    (select count(*) from junior_reading where publisher = _publisher)::int
  from mastery_progress mp
  join junior_reading jr on jr.id::text = mp.item_id::text
  where mp.user_id = auth.uid() and mp.module = 'junior_reading' and jr.publisher = _publisher

  union all
  -- 听力(按 exercise 聚合)
  select 'listening'::text,
    count(*) filter (where a.ratio >= 0.8)::int,
    count(*) filter (where a.ratio < 0.8)::int,
    0,
    (select count(*) from junior_listening_exercises where publisher = _publisher)::int
  from (
    select la.exercise_id,
      (count(*) filter (where la.is_correct))::float / nullif(count(*), 0) as ratio
    from junior_listening_attempts la
    join junior_listening_exercises e on e.id::text = la.exercise_id::text
    where la.user_id = auth.uid() and e.publisher = _publisher
    group by la.exercise_id
  ) a

  union all
  -- 写作(按 prompt 取 max score)
  select 'writing'::text,
    count(*) filter (where w.sc >= 80)::int,
    count(*) filter (where w.sc < 80)::int,
    0,
    (select count(*) from junior_writing_prompts where publisher = _publisher)::int
  from (
    select wa.prompt_id, max(wa.overall_score) as sc
    from junior_writing_attempts wa
    join junior_writing_prompts p on p.id::text = wa.prompt_id::text
    where wa.user_id = auth.uid() and p.publisher = _publisher
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
      where gp2.publisher = _publisher and gp2.unit is not null)::int
  from junior_user_mastery um
  join junior_grammar_questions q on q.id::text = um.item_id::text
  join junior_grammar_points gp on gp.id::text = q.point_id::text
  where um.user_id = auth.uid() and um.item_type = 'grammar_question' and gp.publisher = _publisher;
$$;

revoke all on function public.junior_mastery_overview(text) from public, anon;
grant execute on function public.junior_mastery_overview(text) to authenticated;
