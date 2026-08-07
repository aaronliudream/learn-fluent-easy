-- ✅ DONE — Aaron 已在 Supabase Dashboard 执行,校验返回 1。
--    本文件是**先跑后建档**:内容用 pg_get_functiondef 从生产库现拉,与库内定义逐字一致。
--    库内实证(2026-08-07 现查):prosrc like '%_new >= 2%' = true,'%_new >= 3%' = false。
--
-- ================================================================
-- 错题 SRS 调参:bump_mistake_correct 阈值 3→2、间隔改「隔天」
-- 不动存量(next_review_at 已由 mistake_srs_fix.sql 段5 重铺过)
-- ================================================================
--
-- 与前一版(DONE_mistake_srs_fix.sql 段3)的差异:
--   · 移出阈值      _new >= 3        →  _new >= 2
--   · streak=1 间隔  now() + 3 days  →  now() + 1 day(隔天再见)
--   · streak=2 间隔  now() + 7 days  →  不再存在(此时已 resolved,next_review_at = null)
--
-- 口径提醒:前端文案必须跟这个阈值对齐 ——「隔天连续做对 2 次」移出错题本,
-- 不要再出现「3 次」的说法(见 src/components/MistakeReviewGate.tsx)。

CREATE OR REPLACE FUNCTION public.bump_mistake_correct(_module text, _source_key text)
 RETURNS TABLE(correct_streak integer, is_resolved boolean, already_today boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
         is_resolved       = (_new >= 2),
         next_review_at    = case
                               when _new >= 2 then null
                               else now() + interval '1 day'
                             end,
         updated_at        = now()
   where id = _id;
  return query select _new, (_new >= 2), false;
end;
$function$;

-- 校验:应返回 1
select count(*) as should_be_1 from pg_proc
 where proname = 'bump_mistake_correct'
   and prosrc like '%_new >= 2%';
