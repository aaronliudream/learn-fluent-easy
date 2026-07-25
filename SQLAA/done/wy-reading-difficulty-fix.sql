-- 外研社阅读·精读排序修正:精读 difficulty -> 0(泛读保持 1)
-- 背景:ReadingStage/JuniorReading 按 difficulty 升序排卡,精读原为 1(wy7A)/2(wy8A·wy8B),
--       导致泛读排在精读前面。精读统一降到 0,排最前。
-- 适用:wy7A / wy8A / wy8B 三册(已在线上,只做 UPDATE,不删不插)。
-- ★ wy7B 不在此文件★ wy7B 走 SQLAA/wy7b-reading-load.sql 重跑(那一版已含 difficulty=0)。
-- 判据:精读=5题、泛读=3题(全库实测唯一区分,已静态核验 95/95 篇无例外)。
BEGIN;

-- 改前快照
SELECT volume, difficulty, jsonb_array_length(questions) AS nq, count(*)
FROM public.junior_reading
WHERE publisher='junior_fltrp' AND volume IN ('wy7A','wy8A','wy8B')
GROUP BY 1,2,3 ORDER BY 1,2,3;

UPDATE public.junior_reading
SET difficulty = 0
WHERE publisher='junior_fltrp'
  AND volume IN ('wy7A','wy8A','wy8B')
  AND jsonb_array_length(questions) = 5
  AND difficulty <> 0;

-- 断言
DO $$
DECLARE v text; ni int; ne int; other int;
BEGIN
  FOREACH v IN ARRAY ARRAY['wy7A','wy8A','wy8B'] LOOP
    SELECT count(*) INTO ni FROM public.junior_reading
      WHERE publisher='junior_fltrp' AND volume=v AND difficulty=0;
    SELECT count(*) INTO ne FROM public.junior_reading
      WHERE publisher='junior_fltrp' AND volume=v AND difficulty=1;
    IF v='wy7A' THEN
      IF ni<>7  THEN RAISE EXCEPTION 'wy7A 精读(diff0)=% 期望7',  ni; END IF;
      IF ne<>28 THEN RAISE EXCEPTION 'wy7A 泛读(diff1)=% 期望28', ne; END IF;
    ELSE
      IF ni<>6  THEN RAISE EXCEPTION '% 精读(diff0)=% 期望6',  v, ni; END IF;
      IF ne<>24 THEN RAISE EXCEPTION '% 泛读(diff1)=% 期望24', v, ne; END IF;
    END IF;
  END LOOP;
  -- 难度与题数必须一一对应,且不得残留 2
  SELECT count(*) INTO other FROM public.junior_reading
    WHERE publisher='junior_fltrp' AND volume IN ('wy7A','wy8A','wy8B')
      AND NOT ((difficulty=0 AND jsonb_array_length(questions)=5)
            OR (difficulty=1 AND jsonb_array_length(questions)=3));
  IF other<>0 THEN RAISE EXCEPTION '难度/题数不匹配的篇=%', other; END IF;
  RAISE NOTICE 'OK: wy7A/wy8A/wy8B 精读已降为 difficulty=0,排序修正';
END $$;

-- 改后快照
SELECT volume, difficulty, count(*)
FROM public.junior_reading
WHERE publisher='junior_fltrp' AND volume IN ('wy7A','wy8A','wy8B')
GROUP BY 1,2 ORDER BY 1,2;

COMMIT;
