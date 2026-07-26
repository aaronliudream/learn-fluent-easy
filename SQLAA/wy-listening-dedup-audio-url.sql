-- ============================================================
-- 3 篇改写稿的音频回填(承接 wy-listening-dedup-fix.sql)
-- voice=fable accent=UK;wy7A speed=0.85 / wy8B speed=0.9
-- 幂等:仅 audio_url IS NULL 才更新;断言按终态(重跑实改 0 行是正确的)
-- ============================================================

BEGIN;

DO $$
DECLARE n int; total int := 0; filled int;
BEGIN
  -- wy7A U1 "A day at school"
  UPDATE public.junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/ca/ca51d5743e0042a93bff7a5b6858060c2639a6949b2f82d6cc2aee2a1afa7d33.mp3'
   WHERE id = '326846b9-3299-4d39-0a73-934f550e882a' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT; total := total + n;
  -- wy7A U5 "My little seed"
  UPDATE public.junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/b5/b5d3daa48229858bedbbe9f40c5dcfd9ab067fce78c692d0f37cddc45f04d61a.mp3'
   WHERE id = '685fa829-598e-f221-f532-682dde897b03' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT; total := total + n;
  -- wy8B U6 "Living close to nature"
  UPDATE public.junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/cd/cdb3d2661cc00ec260de3b1888bf6d4d8bf8714c6ebfc7be36c9c4b11d54f507.mp3'
   WHERE id = '11fa119a-fa33-eb39-1f8a-fe3a86159c57' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT; total := total + n;

  SELECT count(*) INTO filled FROM public.junior_listening_exercises
   WHERE publisher = 'junior_fltrp' AND volume = 'wy7A' AND audio_url IS NOT NULL;
  IF filled <> 42 THEN
    RAISE EXCEPTION 'wy7A 终态有音频 % 条,期望 42(本次实改 % 行)——勿当成功', filled, total;
  END IF;

  SELECT count(*) INTO filled FROM public.junior_listening_exercises
   WHERE publisher = 'junior_fltrp' AND volume = 'wy8B' AND audio_url IS NOT NULL;
  IF filled <> 36 THEN
    RAISE EXCEPTION 'wy8B 终态有音频 % 条,期望 36(本次实改 % 行)——勿当成功', filled, total;
  END IF;
END $$;

COMMIT;

-- ============================================================
-- 跑完必看:期望 2 行 —— wy7A 42/42、wy8B 36/36
-- ============================================================
SELECT volume, count(*) AS 总篇, count(audio_url) AS 有音频,
       count(*) - count(audio_url) AS 缺音频
  FROM public.junior_listening_exercises
 WHERE publisher = 'junior_fltrp' AND volume IN ('wy7A','wy8B')
 GROUP BY volume ORDER BY volume;
