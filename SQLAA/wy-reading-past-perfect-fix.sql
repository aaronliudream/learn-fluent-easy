-- 外研社阅读·过去完成时越界修正(wy8A / wy8B 线上 7 行)
-- 背景:过去完成时在本库挂 grade9 U12;fltrp-grade7/grade8 全文不含该点 → 对 wy8A/wy8B 越界。
--       wy8B U5/U6 宾语从句单元的时态呼应(said that he had seen)是教材正课,不在本次修正范围。
-- 范围:只 UPDATE,不删不插。wy7A 无命中;wy7B 未入库(走 wy7b-reading-load.sql);
--       wy8A 听力 1 处未入库(走 wy8a-listening-load.sql)。
-- 幂等:REPLACE 找不到旧串时为空操作;断言按"旧串=0 且新串=1"判定,重复跑安全。
BEGIN;

-- 改前快照
SELECT volume, unit, title, word_count
FROM public.junior_reading
WHERE publisher='junior_fltrp' AND body LIKE '%had %'
ORDER BY volume, unit;

-- ── wy8A ────────────────────────────────────────────────────────────
-- U1《My first time on a train》until last week + 现在完成时不兼容 → 改 until now
UPDATE public.junior_reading SET
  body = REPLACE(body,
    'but until last week I had never taken a long train ride.',
    'but I have never taken a long train ride until now.'),
  word_count = 127
WHERE publisher='junior_fltrp' AND volume='wy8A' AND unit='U1'
  AND title='My first time on a train';

-- U2《The river has come back to life》(后半 had a bad smell 是实义动词,保留)
UPDATE public.junior_reading SET
  body = REPLACE(body, 'The water had turned dark,', 'The water turned dark,'),
  word_count = 132
WHERE publisher='junior_fltrp' AND volume='wy8A' AND unit='U2'
  AND title='The river has come back to life';

-- U6《The day the lights went out》主句 did + 从句 have not done 会语义矛盾 → 一般过去
UPDATE public.junior_reading SET
  body = REPLACE(body,
    'so we did something we had not done for a long time.',
    'so we did something we did not often do.'),
  word_count = 128
WHERE publisher='junior_fltrp' AND volume='wy8A' AND unit='U6'
  AND title='The day the lights went out';

-- ── wy8B ────────────────────────────────────────────────────────────
UPDATE public.junior_reading SET
  body = REPLACE(body,
    'The children who had read there were sad,',
    'The children who read there were sad,'),
  word_count = 234
WHERE publisher='junior_fltrp' AND volume='wy8B' AND unit='U2'
  AND title='The library that was saved';

UPDATE public.junior_reading SET
  body = REPLACE(body,
    'We had learnt an important lesson:',
    'We learnt an important lesson:'),
  word_count = 239
WHERE publisher='junior_fltrp' AND volume='wy8B' AND unit='U3'
  AND title='Reaching the top together';

-- U4《The light in the old house》正文 + 一个干扰项(该题答案是 A,改 D 不影响答案唯一性)
UPDATE public.junior_reading SET
  body = REPLACE(body,
    'the old house at the end of our village had stood empty.',
    'the old house at the end of our village stood empty.'),
  questions = REPLACE(questions::text, 'sorry they had come', 'sorry they came')::jsonb,
  word_count = 253
WHERE publisher='junior_fltrp' AND volume='wy8B' AND unit='U4'
  AND title='The light in the old house';

UPDATE public.junior_reading SET
  body = REPLACE(body,
    'A little care had brought them home.',
    'A little care brought them home.'),
  word_count = 128
WHERE publisher='junior_fltrp' AND volume='wy8B' AND unit='U4'
  AND title='The lost dog';

-- ── 断言:7 处旧串全灭、7 处新串到位、答案键未被动过 ──────────────────
DO $$
DECLARE old_cnt int; new_cnt int; ans_bad int;
BEGIN
  SELECT count(*) INTO old_cnt FROM public.junior_reading
  WHERE publisher='junior_fltrp' AND (
       body LIKE '%had never taken a long train ride%'
    OR body LIKE '%The water had turned dark%'
    OR body LIKE '%had not done for a long time%'
    OR body LIKE '%who had read there%'
    OR body LIKE '%We had learnt an important lesson%'
    OR body LIKE '%village had stood empty%'
    OR body LIKE '%A little care had brought them home%'
    OR questions::text LIKE '%sorry they had come%');
  IF old_cnt<>0 THEN RAISE EXCEPTION '仍有 % 处旧串未替换', old_cnt; END IF;

  SELECT count(*) INTO new_cnt FROM public.junior_reading
  WHERE publisher='junior_fltrp' AND (
       body LIKE '%I have never taken a long train ride until now%'
    OR body LIKE '%The water turned dark%'
    OR body LIKE '%we did not often do%'
    OR body LIKE '%The children who read there were sad%'
    OR body LIKE '%We learnt an important lesson%'
    OR body LIKE '%village stood empty%'
    OR body LIKE '%A little care brought them home%');
  IF new_cnt<>7 THEN RAISE EXCEPTION '新串命中 % 行,期望 7', new_cnt; END IF;

  -- 改干扰项不得动答案键
  SELECT count(*) INTO ans_bad FROM public.junior_reading
  WHERE publisher='junior_fltrp' AND volume='wy8B' AND title='The light in the old house'
    AND NOT (questions::text LIKE '%"answer": "A"%');
  IF ans_bad<>0 THEN RAISE EXCEPTION 'U4 该题答案键被改动'; END IF;

  RAISE NOTICE 'OK: wy8A/wy8B 过去完成时越界 7 处已清,答案键未变';
END $$;

-- 改后快照:junior_reading 全表应只剩宾从 backshift 类的 had(本次为 0 行)
SELECT volume, unit, title
FROM public.junior_reading
WHERE publisher='junior_fltrp'
  AND body ~ 'had +(never |already |just |not |ever )*(been|gone|done|seen|taken|read|learnt|stood|brought|turned|come)\M'
ORDER BY volume, unit;

COMMIT;
