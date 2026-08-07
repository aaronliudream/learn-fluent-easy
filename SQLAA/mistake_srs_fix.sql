-- ================================================================
-- 错题 SRS 修复:加列 / 答错触发器 / 重建 bump_mistake_correct /
-- mark_mistakes_shown / 存量重铺
-- Aaron 在 Supabase Dashboard 分 5 段执行,每段核对 count 再进下一段
-- ================================================================

-- ========== 段1:列与约束 ==========
alter table public.user_mistakes add column if not exists last_shown_date date;
alter table public.user_mistakes alter column next_review_at drop not null;

-- 段1校验:应返回 0
select count(*) as should_be_0
  from public.user_mistakes where last_shown_date is not null;

-- ========== 段2:答错触发器(统一 6 条写入路径) ==========
create or replace function public.reset_mistake_schedule()
returns trigger
language plpgsql
as $$
begin
  if new.last_wrong_at is distinct from old.last_wrong_at then
    new.next_review_at := now() + interval '1 day';
    new.correct_streak := 0;
    new.is_resolved    := false;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_reset_mistake_schedule on public.user_mistakes;
create trigger trg_reset_mistake_schedule
  before update on public.user_mistakes
  for each row
  execute function public.reset_mistake_schedule();

-- 段2校验:应返回 1
select count(*) as should_be_1 from pg_trigger
 where tgname = 'trg_reset_mistake_schedule' and not tgisinternal;

-- ========== 段3:重建 bump_mistake_correct(答对推进日程) ==========
create or replace function public.bump_mistake_correct(_module text, _source_key text)
 returns table(correct_streak integer, is_resolved boolean, already_today boolean)
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  _uid   uuid := auth.uid();
  _today date := (now() at time zone 'Asia/Shanghai')::date;
  _id    uuid;
  _streak int;
  _lcd   date;
  _resolved boolean;
  _new   int;
begin
  if _uid is null then return; end if;
  select um.id, um.correct_streak, um.last_correct_date, um.is_resolved
    into _id, _streak, _lcd, _resolved
    from public.user_mistakes um
   where um.user_id = _uid and um.module = _module
     and um.source_key = _source_key and um.is_resolved = false;
  if not found then return; end if;
  if _lcd = _today then
    return query select _streak, _resolved, true;
    return;
  end if;
  _new := coalesce(_streak, 0) + 1;
  update public.user_mistakes
     set correct_streak    = _new,
         last_correct_date = _today,
         is_resolved       = (_new >= 3),
         next_review_at    = case
                               when _new >= 3 then null
                               when _new = 1  then now() + interval '3 days'
                               when _new = 2  then now() + interval '7 days'
                             end,
         updated_at        = now()
   where id = _id;
  return query select _new, (_new >= 3), false;
end;
$function$;

-- 段3校验:应返回 1
select count(*) as should_be_1 from pg_proc
 where proname = 'bump_mistake_correct'
   and prosrc like '%next_review_at%';

-- ========== 段4:mark_mistakes_shown(弹窗展示即回写) ==========
create or replace function public.mark_mistakes_shown(_ids uuid[])
 returns void
 language sql
 security definer
 set search_path to 'public'
as $$
  update public.user_mistakes
     set last_shown_date = (now() at time zone 'Asia/Shanghai')::date
   where id = any(_ids) and user_id = auth.uid();
$$;

grant execute on function public.mark_mistakes_shown(uuid[]) to authenticated;

-- 段4校验:应返回 1
select count(*) as should_be_1 from pg_proc where proname = 'mark_mistakes_shown';

-- ========== 段5:存量重铺(1480 条到期错题散到未来 1-30 天) ==========
-- 近期做错的排前面(更有复习价值),旧的往后排
with ranked as (
  select id, ntile(30) over (order by last_wrong_at desc) as bucket
    from public.user_mistakes
   where is_resolved = false and next_review_at <= now()
)
update public.user_mistakes um
   set next_review_at = now() + (r.bucket * interval '1 day')
  from ranked r
 where um.id = r.id;

-- 段5校验:due_now 应从 1480 降到 50 上下
select count(*) filter (where next_review_at <= now()) as due_now,
       count(*)                                        as total_unresolved,
       min(next_review_at)                             as earliest,
       max(next_review_at)                             as latest
  from public.user_mistakes
 where is_resolved = false;
