-- 第一册(am1)答案泄漏 + 语域注回扫修复 · DB 为准 · 按 qid 幂等 UPDATE
-- 铁律:payload || 局部覆盖(只改 stem/explanation_cn,保留 answer_text/options/answer_index 等),qid/seq 不动、不删题、无答案键改动。
-- ⚠️ 勿改走 expand_unit*.sql 重跑:那些文件 payload 无 explanation_cn,ON CONFLICT 整包覆盖会抹掉线上 am1 逐题解释(perq 落的)。此文件是 am1 唯一安全修法。
-- 来源:scripts/american/scan-am1-db.mjs(anon 全库扫描 3556 题);A 泄漏 RED 11 + B 语域 am1_l70 May I 2 条(其余 I'm fine/whom 命中经核实均为合法干扰项,不改)。
BEGIN;

-- 修复前:确认 11 条泄漏题仍含箭头/直给(期望 count=11)
SELECT count(*) AS leak_before FROM public.american_questions
WHERE id IN ('e4403e23-2165-4966-a9e1-fae9bf5e551b','d6c5136c-34a3-4611-a0d9-2c9f4df8dd22','5337b155-0392-49ed-a877-7e7e1fb0014b',
             'e280f2bd-aaa8-497a-81f3-8f2b271e9a3a','8067bebc-de43-4e1c-99ed-c967fdfe0f6d','00fc84b0-6ac8-415d-bf04-a3300a98aa4e',
             'ee6edca3-3eff-47c2-a11b-33b998c01d2f','3773807a-1171-4aed-8117-119ffe55f795','590d7243-f4b2-4da2-9df0-b5ef5fc21c60',
             'a2f3e152-a893-44fe-a855-9c03aabd1fba','209f4593-922f-4648-b7ac-c125defc4fad')
  AND (payload->>'stem' LIKE '%→%' OR payload->>'stem' LIKE '%用 may%');

-- ===== A. 答案泄漏(去箭头 / 删直给答案;仅改 stem)=====
-- am1_l01 s5#17  my→your
UPDATE public.american_questions SET payload = payload || jsonb_build_object('stem','This is my jacket.（变一般疑问句，my 变 your）') WHERE id='e4403e23-2165-4966-a9e1-fae9bf5e551b';
-- am1_l14 s5#3   some→any
UPDATE public.american_questions SET payload = payload || jsonb_build_object('stem','There are some tools here.（变否定句，some 变 any）') WHERE id='d6c5136c-34a3-4611-a0d9-2c9f4df8dd22';
-- am1_l14 s5#11  some→any
UPDATE public.american_questions SET payload = payload || jsonb_build_object('stem','There are some paintbrushes on the table.（变否定句，some 变 any）') WHERE id='5337b155-0392-49ed-a877-7e7e1fb0014b';
-- am1_l21 s5#8   some→any
UPDATE public.american_questions SET payload = payload || jsonb_build_object('stem','There is some juice.（变否定句，some 变 any）') WHERE id='e280f2bd-aaa8-497a-81f3-8f2b271e9a3a';
-- am1_l21 s5#16  some→any
UPDATE public.american_questions SET payload = payload || jsonb_build_object('stem','There is some cheese.（变一般疑问句，some 变 any）') WHERE id='8067bebc-de43-4e1c-99ed-c967fdfe0f6d';
-- am1_l49 s5#10  my → mine 类比
UPDATE public.american_questions SET payload = payload || jsonb_build_object('stem','my 对应 mine，那么 your 对应 ___') WHERE id='00fc84b0-6ac8-415d-bf04-a3300a98aa4e';
-- am1_l54 s5#12  cheap → 比较级
UPDATE public.american_questions SET payload = payload || jsonb_build_object('stem','cheap 变比较级') WHERE id='ee6edca3-3eff-47c2-a11b-33b998c01d2f';
-- am1_l55 s5#12  comfortable → 比较级
UPDATE public.american_questions SET payload = payload || jsonb_build_object('stem','comfortable 变比较级') WHERE id='3773807a-1171-4aed-8117-119ffe55f795';
-- am1_l56 s5#15  big → 最高级
UPDATE public.american_questions SET payload = payload || jsonb_build_object('stem','big 变最高级') WHERE id='590d7243-f4b2-4da2-9df0-b5ef5fc21c60';
-- am1_l66 s10#9  [b] 直给 may(choice;仅改 stem,options/answer_index 不动)
UPDATE public.american_questions SET payload = payload || jsonb_build_object('stem','She ___ come too.（表示可能性）') WHERE id='a2f3e152-a893-44fe-a855-9c03aabd1fba';
-- am1_l67 s5#12  is→was
UPDATE public.american_questions SET payload = payload || jsonb_build_object('stem','"Twenty years is enough."（He 转述，said 开头，注意时态后移）') WHERE id='209f4593-922f-4648-b7ac-c125defc4fad';

-- ===== B. 语域注(am1_l70 May I:加语感注,追加到既有 explanation_cn 末尾;不改 options)=====
-- s5#13 "___ I ask, when was your last cleaning?"(May)
UPDATE public.american_questions SET payload = payload || jsonb_build_object('explanation_cn', COALESCE(payload->>'explanation_cn','') || E'\n📌 口语里 "Can I ask…?" 更常用;"May I ask…?" 更正式礼貌。两种都对,场合不同。') WHERE id='9a7d5b63-79df-4131-91bf-be29cdafefc7';
-- s10#9 "___ I ask a quick question?"(May)
UPDATE public.american_questions SET payload = payload || jsonb_build_object('explanation_cn', COALESCE(payload->>'explanation_cn','') || E'\n📌 口语里 "Can I ask…?" 更常用;"May I ask…?" 更正式礼貌。两种都对,场合不同。') WHERE id='c7cbe76d-3530-45a9-b2cc-aa9c8734ba62';

-- 修复后:泄漏应清零(期望 count=0)
SELECT count(*) AS leak_after FROM public.american_questions
WHERE id IN ('e4403e23-2165-4966-a9e1-fae9bf5e551b','d6c5136c-34a3-4611-a0d9-2c9f4df8dd22','5337b155-0392-49ed-a877-7e7e1fb0014b',
             'e280f2bd-aaa8-497a-81f3-8f2b271e9a3a','8067bebc-de43-4e1c-99ed-c967fdfe0f6d','00fc84b0-6ac8-415d-bf04-a3300a98aa4e',
             'ee6edca3-3eff-47c2-a11b-33b998c01d2f','3773807a-1171-4aed-8117-119ffe55f795','590d7243-f4b2-4da2-9df0-b5ef5fc21c60',
             'a2f3e152-a893-44fe-a855-9c03aabd1fba','209f4593-922f-4648-b7ac-c125defc4fad')
  AND (payload->>'stem' LIKE '%→%' OR payload->>'stem' LIKE '%用 may%');

COMMIT;
