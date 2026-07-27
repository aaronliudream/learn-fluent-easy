-- 完形填空错题「空号/原文可回溯率」+ 残卡普查 + SRS 排程现状(只读,零写入,可反复跑)
-- 配套:20260726_cloze_mistake_recon.sql(先跑那份看形态,再跑这份看比例)
--
-- ⚠️ 全文**一条语句、一个分号**:Supabase SQL Editor 整份执行只返回最后一个结果集,
--    多段 SELECT 会被静默丢弃。故所有段收进 CTE,末尾一次 UNION ALL 输出。
-- 输出恒为三列:section(段号) / label(中文短名) / payload(jsonb 明细),整表复制回贴即可。
-- 脱敏:不输出 user_id；行号用 md5(id) 前 8 位；不输出 source_key 全文。
--
-- source_key 三种构造(来自代码,非猜测):
--   A 美语关7  recordZoneMistake: 'senior_cloze_' + american_questions.id + '_' + hash
--   B 高考完形 recordZoneMistake: 'senior_cloze_' + 篇uuid + ':' + 空号 + '_' + hash
--   C 初中完形 JuniorClozePlay 直写: 'junior_cloze_passage_' + junior_cloze.id
--
-- ⚠️ B 类有 21 篇是本地 JSON 篇目(src/data/gaokao/pep-bundle.json → clozePassages),
--    id 不在 gaokao_cloze_passages 表里,纯回表会误判成"回溯不到"。③ 段单独归类。

WITH
-- 本地 21 篇高考完形(前端 GaokaoClozePlay 优先走本地 bundle,查不到才回表)
local_ids(id) AS (VALUES
  ('28b9b6ee-fff8-59d7-b56a-17a2b52b07c5'::uuid),
  ('4779bfa5-d0c1-5a37-90f0-8f7bb203c5c5'::uuid),
  ('695c0fb7-8365-50ce-9066-aba2d0bd3791'::uuid),
  ('4e79396b-49fb-569b-b623-15f6ea240aaf'::uuid),
  ('0bc46680-6a57-598e-a4b6-7ab8c4265e43'::uuid),
  ('ebeb2829-21f5-56b2-a2f6-408e848d1393'::uuid),
  ('d3c6d0e5-aaf8-58e3-8d29-7e1a9688fe39'::uuid),
  ('54268692-20a6-5f98-a0f5-9d91a8cacd4b'::uuid),
  ('714f9a1a-b492-5ae8-b900-804781b7e16e'::uuid),
  ('bdead2fc-ed3f-5944-b53b-8b49bd5027bb'::uuid),
  ('f90620b0-6e56-50c7-b4cc-0e96c085d0f8'::uuid),
  ('cdec90cc-dc96-574d-81c1-5bf0151e98ca'::uuid),
  ('f2a13fa6-2ba0-580b-894e-61dc6d60401f'::uuid),
  ('e2dac090-a10a-5ff7-95bb-3c376b5b4fc9'::uuid),
  ('bfc68d19-9244-54bc-97dc-bc75a1e72872'::uuid),
  ('cb90bc87-6934-5c51-936c-9ffbc235edc3'::uuid),
  ('7b8301f3-5dc2-58fe-b1ba-65186fd6b1d1'::uuid),
  ('c1074f16-7cb7-595b-9b65-980c6b80904e'::uuid),
  ('4506ad09-0ee6-540b-a87e-360fff2393ee'::uuid),
  ('df301dc0-ae5a-5ea0-a600-70aa68ab5df3'::uuid),
  ('dfdedd41-6ddd-5002-8566-66911fe9fe78'::uuid)
),

-- A 类基底
a_rows AS (
  SELECT m.id, m.source_key, m.source_label, m.question, m.created_at,
         substring(m.source_key from '^senior_cloze_([0-9a-fA-F-]{36})')::uuid AS qid
  FROM public.user_mistakes m
  WHERE m.module = 'senior_cloze' AND m.source_key NOT LIKE '%:%'
),
-- B 类基底
b_rows AS (
  SELECT m.id,
         substring(m.source_key from '^senior_cloze_([0-9a-fA-F-]{36})')::uuid AS passage_id,
         NULLIF(split_part(split_part(m.source_key, ':', 2), '_', 1), '') AS blank_no_txt
  FROM public.user_mistakes m
  WHERE m.module = 'senior_cloze' AND m.source_key LIKE '%:%'
),
-- C 类基底
c_rows AS (
  SELECT m.id, m.snapshot, m.wrong_count, m.correct_streak, m.last_correct_date,
         m.is_resolved, m.next_review_at
  FROM public.user_mistakes m
  WHERE m.module = 'junior_cloze'
),

-- ① A 类(美语关7):空号回溯率
s1 AS (
  SELECT
    'A 美语关7' AS 类,
    COUNT(*) AS 总行数,
    COUNT(*) FILTER (WHERE a.qid IS NOT NULL) AS source_key能解出uuid,
    COUNT(*) FILTER (WHERE q.id IS NOT NULL) AS 回表命中题库,
    COUNT(*) FILTER (WHERE q.payload ->> 'blank_no' IS NOT NULL) AS 空号可回溯,
    round(100.0 * COUNT(*) FILTER (WHERE q.payload ->> 'blank_no' IS NOT NULL)
          / NULLIF(COUNT(*), 0), 1) AS 空号回溯率百分比,
    COUNT(*) FILTER (WHERE a.question LIKE '【第%空】%') AS 题干已带空号前缀,
    COUNT(*) FILTER (WHERE q.payload ->> 'context' IS NOT NULL) AS 原文可回表,
    COUNT(*) FILTER (WHERE a.question ~ '_{2,}') AS 题干自带原文含空位
  FROM a_rows a
  LEFT JOIN public.american_questions q ON q.id = a.qid
),

-- ② A 类:回溯不到的样例(脱敏,最多 5 条)
s2 AS (
  SELECT left(md5(a.id::text), 8) AS 行号, a.source_label,
         left(a.question, 120) AS 题干前120字, a.created_at,
         CASE WHEN a.qid IS NULL THEN 'source_key 解不出 uuid'
              WHEN q.id IS NULL THEN '题库里已无此题(被删/重灌)'
              ELSE 'payload 无 blank_no' END AS 回溯失败原因
  FROM a_rows a
  LEFT JOIN public.american_questions q ON q.id = a.qid
  WHERE q.payload ->> 'blank_no' IS NULL
  ORDER BY a.created_at DESC
  LIMIT 5
),

-- ③ B 类(高考完形):空号纯字符串解析(理论 100%)+ 原文三分类
s3 AS (
  SELECT
    'B 高考完形' AS 类,
    COUNT(*) AS 总行数,
    COUNT(*) FILTER (WHERE b.blank_no_txt ~ '^[0-9]+$') AS 空号可解析,
    round(100.0 * COUNT(*) FILTER (WHERE b.blank_no_txt ~ '^[0-9]+$')
          / NULLIF(COUNT(*), 0), 1) AS 空号回溯率百分比,
    COUNT(*) FILTER (WHERE p.id IS NOT NULL) AS 原文命中DB表,
    COUNT(*) FILTER (WHERE p.id IS NULL AND l.id IS NOT NULL) AS 原文命中本地21篇,
    COUNT(*) FILTER (WHERE p.id IS NULL AND l.id IS NULL) AS 原文真回溯不到,
    round(100.0 * COUNT(*) FILTER (WHERE p.id IS NOT NULL OR l.id IS NOT NULL)
          / NULLIF(COUNT(*), 0), 1) AS 原文回溯率百分比
  FROM b_rows b
  LEFT JOIN public.gaokao_cloze_passages p ON p.id = b.passage_id
  LEFT JOIN local_ids l ON l.id = b.passage_id
),

-- ④ C 类(初中完形):整篇一条,每空数据完整度
s4 AS (
  SELECT
    'C 初中完形' AS 类,
    COUNT(*) AS 总行数,
    COUNT(*) FILTER (WHERE jsonb_exists(snapshot, 'questions')) AS 有questions数组,
    COUNT(*) FILTER (WHERE jsonb_exists(snapshot, 'body')) AS 有原文body,
    COUNT(*) FILTER (WHERE jsonb_path_exists(snapshot, '$.questions[*].no')) AS 每空有空号no,
    COUNT(*) FILTER (WHERE jsonb_path_exists(snapshot, '$.questions[*].user_answer')) AS 每空有历史作答,
    COUNT(*) FILTER (WHERE jsonb_path_exists(snapshot, '$.questions[*].options')) AS 每空有选项,
    round(100.0 * COUNT(*) FILTER (WHERE jsonb_exists(snapshot, 'questions'))
          / NULLIF(COUNT(*), 0), 1) AS 空号回溯率百分比,
    SUM(COALESCE(jsonb_array_length(snapshot -> 'questions'), 0)) AS 篇内空位总数,
    SUM(wrong_count) AS 错空总数
  FROM c_rows
),

-- ⑤ C 类:拆成一空一条后的迁移体量(④ 路径二)
s5 AS (
  SELECT
    COUNT(*) AS 当前整篇行数,
    SUM(COALESCE(jsonb_array_length(snapshot -> 'questions'), 0)) AS 拆成全部空则行数,
    SUM((SELECT COUNT(*) FROM jsonb_array_elements(snapshot -> 'questions') e
         WHERE e ->> 'is_correct' = 'false')) AS 只拆做错的空则行数,
    COUNT(*) FILTER (WHERE NOT jsonb_exists(snapshot, 'questions')) AS 无questions无法拆的行
  FROM c_rows
),

-- ⑥ 三类汇总
s6 AS (
  SELECT
    CASE
      WHEN module = 'junior_cloze' THEN 'C 初中完形'
      WHEN source_key LIKE '%:%' THEN 'B 高考完形'
      ELSE 'A 美语关7'
    END AS 类,
    COUNT(*) AS 行数,
    COUNT(*) FILTER (WHERE is_resolved = false) AS 未掌握,
    COUNT(DISTINCT user_id) AS 涉及用户数,
    MIN(created_at)::date AS 最早,
    MAX(created_at)::date AS 最新
  FROM public.user_mistakes
  WHERE module IN ('senior_cloze', 'junior_cloze')
  GROUP BY 1
),

-- ⑦ C 类 SRS 状态占用(决定 B2 拆分策略)
s7 AS (
  SELECT
    COUNT(*) AS 总行数,
    COUNT(*) FILTER (WHERE correct_streak > 0) AS streak大于0行数,
    round(100.0 * COUNT(*) FILTER (WHERE correct_streak > 0)
          / NULLIF(COUNT(*), 0), 1) AS streak大于0占比,
    COUNT(*) FILTER (WHERE last_correct_date IS NOT NULL) AS 有last_correct_date行数,
    round(100.0 * COUNT(*) FILTER (WHERE last_correct_date IS NOT NULL)
          / NULLIF(COUNT(*), 0), 1) AS 有last_correct_date占比,
    COUNT(*) FILTER (WHERE is_resolved = true) AS 已移出行数,
    round(100.0 * COUNT(*) FILTER (WHERE is_resolved = true)
          / NULLIF(COUNT(*), 0), 1) AS 已移出占比,
    COUNT(*) FILTER (WHERE next_review_at IS NOT NULL AND next_review_at > now()) AS 未来到期行数,
    COUNT(*) FILTER (WHERE next_review_at IS NULL) AS next_review_at为空行数
  FROM c_rows
),

-- ⑦-b correct_streak 取值分布
s7b AS (
  SELECT correct_streak, COUNT(*) AS 行数
  FROM c_rows GROUP BY correct_streak ORDER BY correct_streak
),

-- ⑦-c wrong_count 分布 + 与实际错空数的交叉校验
s7c AS (
  SELECT
    MIN(wrong_count) AS 最小,
    percentile_cont(0.5) WITHIN GROUP (ORDER BY wrong_count) AS 中位数,
    round(AVG(wrong_count)::numeric, 2) AS 均值,
    MAX(wrong_count) AS 最大,
    COUNT(*) FILTER (WHERE wrong_count = 0) AS 等于0的行数,
    COUNT(*) FILTER (WHERE wrong_count
      <> COALESCE((SELECT COUNT(*) FROM jsonb_array_elements(snapshot -> 'questions') e
                   WHERE e ->> 'is_correct' = 'false'), -1)) AS wrong_count与错空数对不上的行
  FROM c_rows
),

-- ⑧ 老师端 RPC 实际部署版本(以库为准,不以 SQLAA 脚本文件为准)
--   疑点:PHASE2_junior_cloze_snapshot 加过"源4 初中完形按篇",但 PHASE3/6/7 三份后续脚本
--   都是整体 CREATE OR REPLACE 且全文 0 次提到 junior_cloze → 可能已被静默覆盖。
s8 AS (
  SELECT p.proname AS 函数名,
         (pg_get_functiondef(p.oid) LIKE '%junior_cloze%') AS 定义里是否还有junior_cloze分支,
         (pg_get_functiondef(p.oid) LIKE '%phonics%') AS 是否已含PHASE7的裸模块排除,
         length(pg_get_functiondef(p.oid)) AS 定义长度
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
    AND p.proname IN ('get_student_mistakes', 'get_student_mistake_counts')
  ORDER BY p.proname
),

-- ⑧-b get_student_mistakes 完整定义(作为 supabase/rpc/ 权威文件的 baseline)
s8b AS (
  SELECT p.proname AS 函数名, pg_get_functiondef(p.oid) AS 完整定义
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public' AND p.proname = 'get_student_mistakes'
),

-- ⑨ 残卡普查:哪些 module 在悄悄产出「揭晓后无答案可给」的行
--   判据与 ReviewToday 渲染路径一致:揭晓分支只渲染 correct_answer + explanation。
--   (snapshot 的 alex_used_sentence 等只喂朗读按钮,不算答案。)
--   已按 module 聚合收敛,不出明细。
s9 AS (
  SELECT
    module,
    COUNT(*) AS 未解决行数,
    COUNT(*) FILTER (WHERE correct_answer IS NULL OR btrim(correct_answer) = '') AS 无正确答案,
    COUNT(*) FILTER (
      WHERE COALESCE(NULLIF(btrim(correct_answer), ''), '') = ''
        AND COALESCE(NULLIF(btrim(explanation), ''), '') = ''
    ) AS 真残卡行数,
    COUNT(*) FILTER (
      WHERE next_review_at <= now()
        AND COALESCE(NULLIF(btrim(correct_answer), ''), '') = ''
        AND COALESCE(NULLIF(btrim(explanation), ''), '') = ''
    ) AS 已到期残卡
  FROM public.user_mistakes
  WHERE is_resolved = false
  GROUP BY module
  ORDER BY 4 DESC, 2 DESC
),

-- ⑩ limit 截断风险(O 节)
s10 AS (
  SELECT
    (SELECT MAX(c) FROM (SELECT COUNT(*) AS c FROM public.user_mistakes
                          WHERE is_resolved = false GROUP BY user_id) t) AS 单用户未解决最大值,
    (SELECT MAX(c) FROM (SELECT COUNT(*) AS c FROM public.user_mistakes
                          WHERE is_resolved = false AND next_review_at <= now()
                          GROUP BY user_id) t) AS 单用户已到期最大值,
    (SELECT SUM((SELECT COUNT(*) FROM jsonb_array_elements(snapshot -> 'questions') e
                 WHERE e ->> 'is_correct' = 'false')) - COUNT(*)
       FROM public.user_mistakes
      WHERE module = 'junior_cloze' AND jsonb_exists(snapshot, 'questions')) AS 全站拆条净增,
    50 AS ReviewToday_limit,
    500 AS Mistakes_limit,
    500 AS Dashboard_limit
),

-- ⑪-a next_review_at 分布(验证「不回填也能 14 天内自然收敛」；>14天 应为 0)
s11a AS (
  SELECT
    CASE
      WHEN next_review_at <= now() THEN '已到期'
      WHEN next_review_at <= now() + interval '1 day' THEN '1天内'
      WHEN next_review_at <= now() + interval '7 days' THEN '2-7天'
      WHEN next_review_at <= now() + interval '14 days' THEN '8-14天'
      ELSE '超过14天(应为0)'
    END AS 排程区间,
    COUNT(*) AS 行数,
    MIN(next_review_at) AS 区间最早
  FROM public.user_mistakes
  WHERE is_resolved = false
  GROUP BY 1
  ORDER BY 3
),

-- ⑪-b 已到期行中 correct_streak>0 的占比
--     =「答对过、本该被推远,却因不是在今日复习里答对的、至今还钉在队列里」的存量规模
s11b AS (
  SELECT
    COUNT(*) AS 已到期行数,
    COUNT(*) FILTER (WHERE correct_streak > 0) AS 其中已答对过,
    round(100.0 * COUNT(*) FILTER (WHERE correct_streak > 0)
          / NULLIF(COUNT(*), 0), 1) AS 占比,
    COUNT(*) FILTER (WHERE correct_streak = 2) AS 差一次就毕业却还在队列
  FROM public.user_mistakes
  WHERE is_resolved = false AND next_review_at <= now()
),

parts AS (
  SELECT 1 AS ord, '①' AS section, 'A美语关7-空号回溯率' AS label,
         COALESCE(jsonb_agg(to_jsonb(s1)), '[]'::jsonb) AS payload FROM s1
  UNION ALL SELECT 2,  '②',   'A类回溯失败样例5条',   COALESCE(jsonb_agg(to_jsonb(s2)),  '[]'::jsonb) FROM s2
  UNION ALL SELECT 3,  '③',   'B高考完形-空号与原文',  COALESCE(jsonb_agg(to_jsonb(s3)),  '[]'::jsonb) FROM s3
  UNION ALL SELECT 4,  '④',   'C初中完形-字段完整度',  COALESCE(jsonb_agg(to_jsonb(s4)),  '[]'::jsonb) FROM s4
  UNION ALL SELECT 5,  '⑤',   'C类拆条迁移体量',      COALESCE(jsonb_agg(to_jsonb(s5)),  '[]'::jsonb) FROM s5
  UNION ALL SELECT 6,  '⑥',   '三类汇总',            COALESCE(jsonb_agg(to_jsonb(s6)),  '[]'::jsonb) FROM s6
  UNION ALL SELECT 7,  '⑦',   'C类SRS状态占用',       COALESCE(jsonb_agg(to_jsonb(s7)),  '[]'::jsonb) FROM s7
  UNION ALL SELECT 8,  '⑦-b', 'C类streak取值分布',    COALESCE(jsonb_agg(to_jsonb(s7b)), '[]'::jsonb) FROM s7b
  UNION ALL SELECT 9,  '⑦-c', 'C类wrong_count分布',   COALESCE(jsonb_agg(to_jsonb(s7c)), '[]'::jsonb) FROM s7c
  UNION ALL SELECT 10, '⑧',   '老师端RPC部署版本',     COALESCE(jsonb_agg(to_jsonb(s8)),  '[]'::jsonb) FROM s8
  UNION ALL SELECT 11, '⑧-b', 'RPC完整定义baseline',  COALESCE(jsonb_agg(to_jsonb(s8b)), '[]'::jsonb) FROM s8b
  UNION ALL SELECT 12, '⑨',   '残卡普查按module',      COALESCE(jsonb_agg(to_jsonb(s9)),  '[]'::jsonb) FROM s9
  UNION ALL SELECT 13, '⑩',   'limit截断风险',        COALESCE(jsonb_agg(to_jsonb(s10)), '[]'::jsonb) FROM s10
  UNION ALL SELECT 14, '⑪-a', 'SRS排程区间分布',      COALESCE(jsonb_agg(to_jsonb(s11a)),'[]'::jsonb) FROM s11a
  UNION ALL SELECT 15, '⑪-b', '已到期中已答对过占比',  COALESCE(jsonb_agg(to_jsonb(s11b)),'[]'::jsonb) FROM s11b
)
SELECT section, label, payload FROM parts ORDER BY ord;
