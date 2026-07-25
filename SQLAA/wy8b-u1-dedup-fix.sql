-- 外研社八下 wy8B U1 泛读《Homes of the future》去模板雷同(线上)
-- ngram_similarity.py 扫出:与同单元精读《So much is done for you》3 处 8-gram 重合
--   `energy will be made from the sun and the wind` —— 泛读照精读句式写的。
-- 改法保住本单元考点(一般将来时被动 will be done),只换句式。
-- 只 UPDATE 不删不插。
BEGIN;

UPDATE public.junior_reading SET
  body = 'In the future, our homes will be run in cleaner ways. Today, much power is made by burning coal, and the air is often dirty. But soon, sunlight and wind will be used to make most of our power. Solar panels will be put on every roof, and the light of the sun will be turned into power. On windy days, energy will be made by tall wind turbines. Extra power will be kept in batteries, so that it can be used on dark nights. Less coal will be burned, and cleaner air will be shared by all. Our homes will be kept warm and bright, and the planet will be protected at the same time. A greener life will be built by us, step by step.',
  word_count = 127
WHERE publisher='junior_fltrp' AND volume='wy8B' AND unit='U1' AND title='Homes of the future';

DO $$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM public.junior_reading WHERE publisher='junior_fltrp'
    AND volume='wy8B' AND body LIKE '%But soon, more energy will be made from the sun and the wind%';
  IF n<>0 THEN RAISE EXCEPTION '旧句仍在 % 行', n; END IF;
  SELECT count(*) INTO n FROM public.junior_reading WHERE publisher='junior_fltrp'
    AND volume='wy8B' AND body LIKE '%sunlight and wind will be used to make most of our power%';
  IF n<>1 THEN RAISE EXCEPTION '新句命中 % 行,期望 1', n; END IF;
  -- 被动语态考点(本单元)不得改没了
  SELECT count(*) INTO n FROM public.junior_reading WHERE publisher='junior_fltrp'
    AND volume='wy8B' AND title='Homes of the future' AND body LIKE '%will be used%';
  IF n<>1 THEN RAISE EXCEPTION '被动语态考点丢失'; END IF;
  RAISE NOTICE 'OK: Homes of the future 去雷同,被动考点保留';
END $$;

COMMIT;