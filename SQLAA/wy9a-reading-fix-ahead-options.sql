-- ============================================================
-- wy9A 阅读:修两条「超前结构」干扰项(clause_gate 在写作棒复扫时查出,已灌库)
--
-- 两处都是**干扰项**(非正确答案),答案字母不变,不影响已有作答:
--   ① U1 泛读《The wall behind the school》Q3 选项 B
--      旧:The boy who wanted to stop left the school.   ← who 定从是 U4 才解禁
--      新:The paintings were washed off by the rain.
--   ② U2 泛读《The classroom bank》Q1 选项 A
--      旧:A place where students keep their pocket money. ← where 定从(先行词+where)是 U5 才解禁
--      新:A safe box for students' pocket money.
--
-- 新干扰项均经四门复扫(clause / past_perfect / comparative / 词表超前)为 0,
-- 且都与正文事实相反(仍是「合理但错」的干扰项):
--   ①正文只写下雨曾中断施工,未写画被雨冲掉;②正文写这个「银行」借的是笔和尺,不是存钱。
--
-- 幂等:jsonb_set 写死路径,重跑写入同一值(行数恒 1);更新前先断言该路径当前是「旧值或新值」,
--       两者都不是则说明题序/选项序已变,直接 RAISE 而不是盲写。
-- ============================================================

BEGIN;

DO $$
DECLARE
  n int;
  cur text;
  OLD1 CONSTANT text := 'The boy who wanted to stop left the school.';
  NEW1 CONSTANT text := 'The paintings were washed off by the rain.';
  OLD2 CONSTANT text := 'A place where students keep their pocket money.';
  NEW2 CONSTANT text := 'A safe box for students'' pocket money.';
BEGIN
  -- ── ① U1《The wall behind the school》questions[2].options[1] ────────────
  SELECT questions->2->'options'->>1 INTO cur
    FROM public.junior_reading
   WHERE publisher='junior_fltrp' AND volume='wy9A' AND unit='U1'
     AND title='The wall behind the school';
  IF cur IS NULL THEN
    RAISE EXCEPTION '① 定位失败:找不到该篇或该路径(questions[2].options[1])';
  END IF;
  IF cur <> OLD1 AND cur <> NEW1 THEN
    RAISE EXCEPTION '① 路径当前值既非旧值也非新值,题序可能已变,实际=%', cur;
  END IF;

  UPDATE public.junior_reading
     SET questions = jsonb_set(questions, '{2,options,1}', to_jsonb(NEW1), false)
   WHERE publisher='junior_fltrp' AND volume='wy9A' AND unit='U1'
     AND title='The wall behind the school';
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION '① 期望更新 1 行,实际 % 行', n; END IF;

  -- ── ② U2《The classroom bank》questions[0].options[0] ───────────────────
  SELECT questions->0->'options'->>0 INTO cur
    FROM public.junior_reading
   WHERE publisher='junior_fltrp' AND volume='wy9A' AND unit='U2'
     AND title='The classroom bank';
  IF cur IS NULL THEN
    RAISE EXCEPTION '② 定位失败:找不到该篇或该路径(questions[0].options[0])';
  END IF;
  IF cur <> OLD2 AND cur <> NEW2 THEN
    RAISE EXCEPTION '② 路径当前值既非旧值也非新值,题序可能已变,实际=%', cur;
  END IF;

  UPDATE public.junior_reading
     SET questions = jsonb_set(questions, '{0,options,0}', to_jsonb(NEW2), false)
   WHERE publisher='junior_fltrp' AND volume='wy9A' AND unit='U2'
     AND title='The classroom bank';
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION '② 期望更新 1 行,实际 % 行', n; END IF;

  -- ── 收口断言 ────────────────────────────────────────────────────────────
  -- a) 两条旧文本在全册任何题面里都不得再出现
  SELECT count(*) INTO n FROM public.junior_reading
   WHERE publisher='junior_fltrp' AND volume='wy9A'
     AND (questions::text LIKE '%' || OLD1 || '%' OR questions::text LIKE '%' || OLD2 || '%');
  IF n <> 0 THEN RAISE EXCEPTION '旧干扰项仍残留 % 篇', n; END IF;

  -- b) 答案字母未被动过(U1 那题仍 C、U2 那题仍 B)
  SELECT count(*) INTO n FROM public.junior_reading
   WHERE publisher='junior_fltrp' AND volume='wy9A' AND unit='U1'
     AND title='The wall behind the school' AND questions->2->>'answer' = 'C';
  IF n <> 1 THEN RAISE EXCEPTION '① 答案不再是 C,已被误改'; END IF;

  SELECT count(*) INTO n FROM public.junior_reading
   WHERE publisher='junior_fltrp' AND volume='wy9A' AND unit='U2'
     AND title='The classroom bank' AND questions->0->>'answer' = 'B';
  IF n <> 1 THEN RAISE EXCEPTION '② 答案不再是 B,已被误改'; END IF;

  -- c) 选项数没变(各 4 个),整册篇数没变(30)
  SELECT count(*) INTO n FROM public.junior_reading
   WHERE publisher='junior_fltrp' AND volume='wy9A'
     AND EXISTS (SELECT 1 FROM jsonb_array_elements(questions) q
                  WHERE jsonb_array_length(q->'options') <> 4);
  IF n <> 0 THEN RAISE EXCEPTION '出现选项数不为 4 的题,涉及 % 篇', n; END IF;

  SELECT count(*) INTO n FROM public.junior_reading
   WHERE publisher='junior_fltrp' AND volume='wy9A';
  IF n <> 30 THEN RAISE EXCEPTION '整册篇数变成 %,期望 30', n; END IF;
END $$;

COMMIT;

-- ============================================================
-- 跑完必看:期望 2 行,new_option 两列显示新文本,answer 仍为 C / B
-- ============================================================
SELECT unit,
       title,
       CASE WHEN unit='U1' THEN questions->2->'options'->>1
            ELSE questions->0->'options'->>0 END AS new_option,
       CASE WHEN unit='U1' THEN questions->2->>'answer'
            ELSE questions->0->>'answer' END AS answer,
       jsonb_array_length(questions) AS q_count
  FROM public.junior_reading
 WHERE publisher='junior_fltrp' AND volume='wy9A'
   AND title IN ('The wall behind the school', 'The classroom bank')
 ORDER BY unit;
