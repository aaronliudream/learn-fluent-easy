-- ============================================================
-- 修 U1.1 Pandas at the Zoo 空6: "sleeps (6)____ daytime" → 补 the
-- 用 REPLACE 只换这一处子串,body 其余逐字节不变;答案 in 不变(in the daytime)
-- id 定位(c1000001…); 该子串无撇号,无需双写
-- ============================================================

UPDATE junior_cloze
SET body = REPLACE(body, 'He sleeps (6)____ daytime', 'He sleeps (6)____ the daytime')
WHERE id = 'c1000001-0a1b-4c2d-8e3f-000000000001';

-- 校验(单独跑): 应含 "sleeps (6)____ the daytime",且无 "the the"(没重复补)
SELECT
  (body LIKE '%He sleeps (6)____ the daytime%') AS has_the,
  (body LIKE '%the the%')                        AS double_the_bug,
  substring(body from 'under the tree[^!?]*daytime\.') AS snippet
FROM junior_cloze
WHERE id = 'c1000001-0a1b-4c2d-8e3f-000000000001';
-- 期望: has_the=true, double_the_bug=false, snippet 显示 "...He sleeps in the daytime."
-- END OF FILE cloze-fix-u1.sql
