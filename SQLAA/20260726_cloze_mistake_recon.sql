-- 完形填空错题「空号缺失」调查(只读,零写入,可反复跑)
-- ⚠️ 全文**一条语句、一个分号**:Supabase SQL Editor 整份执行只返回最后一个结果集,
--    多段 SELECT 会被静默丢弃。故所有段收进 CTE,末尾一次 UNION ALL 输出。
-- 输出恒为三列:section(段号) / label(中文短名) / payload(jsonb 明细),整表复制回贴即可。
-- 脱敏:不输出 user_id；行号用 md5(id) 前 8 位；不输出 source_key 全文。

WITH
-- ① user_mistakes 实际列清单(证据:是否真的没有 blank_index)
s1 AS (
  SELECT ordinal_position AS pos, column_name, data_type, is_nullable, column_default
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'user_mistakes'
  ORDER BY ordinal_position
),

-- ② 完形错题总量 + 按来源分组
--    senior_cloze 两个来源靠 source_key 有无冒号区分:
--      有 ':' → 高考完形(sourceKeyBase = 篇uuid:空号)；无 ':' → 美语关7(= american_questions.id)
s2 AS (
  SELECT
    module,
    CASE
      WHEN module = 'junior_cloze' THEN '初中完形(整篇一条)'
      WHEN module = 'senior_cloze' AND source_key LIKE '%:%' THEN '高考完形(一空一条)'
      WHEN module = 'senior_cloze' THEN '美语关7(一空一条)'
      ELSE '其它'
    END AS 来源,
    COUNT(*) AS 行数,
    COUNT(*) FILTER (WHERE is_resolved = false) AS 未掌握,
    COUNT(*) FILTER (WHERE user_answer IS NULL) AS user_answer为空,
    COUNT(*) FILTER (WHERE correct_answer IS NULL OR correct_answer = '') AS correct_answer为空,
    COUNT(*) FILTER (WHERE jsonb_exists(snapshot, 'options'))   AS 顶层有options,
    COUNT(*) FILTER (WHERE jsonb_exists(snapshot, 'questions')) AS 有questions数组,
    COUNT(*) FILTER (WHERE jsonb_exists(snapshot, 'body'))      AS 有body原文,
    COUNT(*) FILTER (WHERE question LIKE '%第%空%') AS 题干含空号字样,
    MIN(created_at)::date AS 最早,
    MAX(created_at)::date AS 最新
  FROM public.user_mistakes
  WHERE module IN ('junior_cloze', 'senior_cloze')
  GROUP BY 1, 2
),

-- ③ 抽 3 条:美语关7(疑似出问题的那类)
s3 AS (
  SELECT
    left(md5(id::text), 8) AS 行号,
    source_label,
    question AS 题干原文,
    user_answer, correct_answer,
    snapshot -> 'options' AS 选项快照,
    snapshot ->> 'question_type' AS 题型,
    (snapshot ->> 'stem') = question AS stem等于question,
    question ~ '_{2,}[0-9]+_{2,}' AS 题干含编号空位,
    (question ~ '_{2,}' AND question !~ '_{2,}[0-9]+_{2,}') AS 题干只有无编号下划线,
    (length(question) - length(replace(question, '___', ''))) / 3 AS 下划线段数估计,
    created_at
  FROM public.user_mistakes
  WHERE module = 'senior_cloze' AND source_key NOT LIKE '%:%'
  ORDER BY created_at DESC
  LIMIT 3
),

-- ④ 抽 3 条:高考完形
s4 AS (
  SELECT
    left(md5(id::text), 8) AS 行号,
    source_label,
    question AS 题干原文,
    user_answer, correct_answer,
    snapshot -> 'options' AS 选项快照,
    split_part(split_part(source_key, ':', 2), '_', 1) AS 从source_key解出的空号,
    question ~ '_{2,}' AS 题干含下划线,
    created_at
  FROM public.user_mistakes
  WHERE module = 'senior_cloze' AND source_key LIKE '%:%'
  ORDER BY created_at DESC
  LIMIT 3
),

-- ⑤ 抽 3 条:初中完形(整篇一条,看 questions[] 里每空存了啥)
s5 AS (
  SELECT
    left(md5(m.id::text), 8) AS 行号,
    m.source_label,
    m.wrong_count AS 错空数,
    jsonb_array_length(m.snapshot -> 'questions') AS 篇内空数,
    left(m.snapshot ->> 'body', 200) AS 原文前200字,
    (SELECT jsonb_agg(e)
       FROM jsonb_array_elements(m.snapshot -> 'questions') e
      WHERE e ->> 'is_correct' = 'false') AS 做错的空,
    m.created_at
  FROM public.user_mistakes m
  WHERE m.module = 'junior_cloze' AND jsonb_exists(m.snapshot, 'questions')
  ORDER BY m.created_at DESC
  LIMIT 3
),

-- ⑥ 内容侧:美语关7 题库里 context 的空位标记形态分布
--    决定「高亮第 N 空」能否靠正则定位:___1___ 型可精确定位；裸 ___ 型只能按出现次序数
s6 AS (
  SELECT
    CASE
      WHEN payload ->> 'context' IS NULL THEN 'context 为空'
      WHEN payload ->> 'context' ~ '_{2,}[0-9]+_{2,}' THEN '带编号 ___N___(可精确定位)'
      WHEN payload ->> 'context' ~ '_{2,}' THEN '裸 ___(按次序数)'
      ELSE '无下划线(异常)'
    END AS 空位标记形态,
    COUNT(*) AS 题数,
    COUNT(DISTINCT payload ->> 'context') AS 不同篇数,
    MIN((payload ->> 'blank_no')::int) AS 最小空号,
    MAX((payload ->> 'blank_no')::int) AS 最大空号
  FROM public.american_questions
  WHERE stage = 7
  GROUP BY 1
),

parts AS (
  SELECT 1 AS ord, '①' AS section, 'user_mistakes 列清单' AS label,
         COALESCE(jsonb_agg(to_jsonb(s1)), '[]'::jsonb) AS payload FROM s1
  UNION ALL
  SELECT 2, '②', '完形错题分组计数',      COALESCE(jsonb_agg(to_jsonb(s2)), '[]'::jsonb) FROM s2
  UNION ALL
  SELECT 3, '③', '美语关7抽样3条',        COALESCE(jsonb_agg(to_jsonb(s3)), '[]'::jsonb) FROM s3
  UNION ALL
  SELECT 4, '④', '高考完形抽样3条',       COALESCE(jsonb_agg(to_jsonb(s4)), '[]'::jsonb) FROM s4
  UNION ALL
  SELECT 5, '⑤', '初中完形抽样3条',       COALESCE(jsonb_agg(to_jsonb(s5)), '[]'::jsonb) FROM s5
  UNION ALL
  SELECT 6, '⑥', '题库空位标记形态分布',   COALESCE(jsonb_agg(to_jsonb(s6)), '[]'::jsonb) FROM s6
)
SELECT section, label, payload FROM parts ORDER BY ord;
