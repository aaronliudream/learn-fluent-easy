-- 仅测试账号使用,验完跑还原段(段3)
-- ================================================================
-- 错题复习弹窗 PR-2 真机验证用数据
-- 目标账号:8888  →  3c7ef843-f99e-4dbf-97f3-40758112fd9f
--                    (email: 8888.lrr084@guest.bigmoon.local)
-- ================================================================
--
-- ⚠️ 原计划(把 8888 已有错题的 next_review_at 改到过去)**行不通**,实测原因:
--    8888 名下 61 条未解决错题 = listening 32 条 + reading 29 条,
--      · listening 32 条 → 被 MISTAKE_HIDDEN_DEFAULT 模块排除集挡掉;
--      · reading  29 条 → snapshot 里**根本没有 options 字段**(has_options = 0),
--        过不了前端 isRedoableMcq(要求 options ≥ 2 项且正确答案命中某字母)。
--    结论:单纯 backdate 只会验出**空弹窗**。所以本文件改成「插 6 条合规测试题」。
--
-- 参考(2026-08-07 实测):全站符合弹窗条件的错题共 857 条、分布在 10 个账号,
-- 所以弹窗逻辑本身没问题,只是 8888 这个账号的数据形态不满足。
--
-- 幂等:段1 先删同前缀旧测试题再插,可反复跑。
-- 清理:段3 按 source_key 前缀 'TEST_GATE_' 精确删除,不碰任何真实错题。

-- ========== 段1:为 8888 插入 6 条到期且可重做的 MCQ 测试题 ==========
delete from public.user_mistakes
 where user_id = '3c7ef843-f99e-4dbf-97f3-40758112fd9f'
   and source_key like 'TEST_GATE_%';

insert into public.user_mistakes
  (user_id, module, source_key, source_label, question, user_answer, correct_answer,
   explanation, snapshot, is_resolved, correct_streak, last_correct_date,
   last_wrong_at, next_review_at, last_shown_date)
select
  '3c7ef843-f99e-4dbf-97f3-40758112fd9f'::uuid,
  'hub_reading',
  'TEST_GATE_' || n,
  '弹窗验证测试题',
  q.question,
  'B',
  q.ans,
  '这是 PR-2 真机验证用的测试题,验完会被段3 删除。',
  jsonb_build_object(
    'source', 'hub_reading',
    'question_type', 'mcq',
    'stem', q.question,
    'options', q.options,
    'correct_answer', q.ans
  ),
  false, 0, null,
  now() - interval '2 hours',
  now() - interval '1 hour',   -- 已到期
  null                          -- 今天还没展示过
from (values
  (1, 'TEST 1 — What does "abundant" mean?',      jsonb_build_object('A','scarce','B','tiny','C','plentiful','D','broken'), 'C'),
  (2, 'TEST 2 — Choose the past tense of "go".',  jsonb_build_object('A','goed','B','went','C','gone','D','going'),        'B'),
  (3, 'TEST 3 — Which word is a synonym of "happy"?', jsonb_build_object('A','glad','B','angry','C','tired','D','slow'),   'A'),
  (4, 'TEST 4 — She ___ to school every day.',    jsonb_build_object('A','go','B','goes','C','going','D','gone'),          'B'),
  (5, 'TEST 5 — The opposite of "increase" is:',  jsonb_build_object('A','rise','B','grow','C','decrease','D','expand'),   'C'),
  (6, 'TEST 6 — Pick the correct spelling.',      jsonb_build_object('A','recieve','B','receive','C','receve','D','reciev'), 'B')
) as q(n, question, options, ans);

-- 段1校验:用与前端**完全同口径**的判定复算(模块排除集 + options≥2 + 正确答案命中字母
--          + 已到期 + 今天未展示),应返回 >= 6
with base as (
  select m.id,
         btrim(coalesce(m.correct_answer, m.snapshot->>'correct_answer','')) as ans,
         (select count(*) from jsonb_each_text(m.snapshot->'options') o(k,v)
           where v is not null and btrim(v) <> '') as opt_n,
         (select array_agg(k) from jsonb_each_text(m.snapshot->'options') o(k,v)
           where v is not null and btrim(v) <> '') as opt_keys
    from public.user_mistakes m
   where m.user_id = '3c7ef843-f99e-4dbf-97f3-40758112fd9f'
     and m.is_resolved = false
     and m.module not in ('listening','cloze','vocab','grammar','writing','phonics','junior_cloze')
     and m.module not like 'primary_%'
     and m.next_review_at <= now()
     and (m.last_shown_date is null
          or m.last_shown_date < (now() at time zone 'Asia/Shanghai')::date)
     and jsonb_typeof(m.snapshot->'options') = 'object'
)
select count(*) as should_be_at_least_6
  from base where opt_n >= 2 and ans = any(opt_keys);

-- ========== 段2:验证中途想再来一次时用(不用重插,只清展示标记) ==========
-- 弹窗展示后会把这 6 条的 last_shown_date 写成今天,再登录就不会再选中它们。
-- 想当天重复验,跑这一段把标记清掉:
--
-- update public.user_mistakes
--    set last_shown_date = null, next_review_at = now() - interval '1 hour'
--  where user_id = '3c7ef843-f99e-4dbf-97f3-40758112fd9f'
--    and source_key like 'TEST_GATE_%';
--
-- ⚠️ 光清 DB 不够!浏览器里还有 PR-1 那个「今天已弹过」的 localStorage 标记,
--    必须同时在 DevTools → Application → Local Storage 删掉 key:
--    mistake_gate_shown_<今天日期,如 2026-08-07>
--    否则弹窗在前端就被拦住,根本不会发选题请求。

-- ========== 段3:还原(验完必跑)==========
-- 精确按前缀删,只删本文件插入的 6 条,不碰任何真实错题。
--
-- delete from public.user_mistakes
--  where user_id = '3c7ef843-f99e-4dbf-97f3-40758112fd9f'
--    and source_key like 'TEST_GATE_%';
--
-- 段3校验:应返回 0
-- select count(*) as should_be_0 from public.user_mistakes
--  where user_id = '3c7ef843-f99e-4dbf-97f3-40758112fd9f'
--    and source_key like 'TEST_GATE_%';

-- ================================================================
-- 备选:不想插测试数据,改用本来就有合规错题的账号(前 3 名,实测)
--   fbba6b31-f032-455e-a479-533cf9cf7ef3  hcjjk.ngkp12@guest.bigmoon.local   501 条
--   cb42e179-e121-42ac-88b7-ecb6785983e0  bzn.v5ft3f@guest.bigmoon.local     210 条
--   db45429f-e9e1-4852-b151-20ca906e3655  andywang.etospx@guest.bigmoon.local 48 条
-- 这些都是 guest 账号,除非你有登录方式,否则还是走上面的 8888 插题方案。
-- ================================================================
