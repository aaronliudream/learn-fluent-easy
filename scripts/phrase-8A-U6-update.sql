-- 8A U6:回填 junior_vocab.phrase_en(英文短语/语块)。幂等:按 word_id 精确 UPDATE,可重跑。
-- 前置:必须先跑 ALTER TABLE ... ADD COLUMN phrase_en text;

UPDATE public.junior_vocab SET phrase_en = 'keep on trying' WHERE word_id = 'jr-8A-U6-7001';
UPDATE public.junior_vocab SET phrase_en = 'make sure to practise' WHERE word_id = 'jr-8A-U6-7002';
UPDATE public.junior_vocab SET phrase_en = 'try your best' WHERE word_id = 'jr-8A-U6-7003';
UPDATE public.junior_vocab SET phrase_en = 'put out the candles' WHERE word_id = 'jr-8A-U6-7004';
UPDATE public.junior_vocab SET phrase_en = 'draw to a close' WHERE word_id = 'jr-8A-U6-7005';
UPDATE public.junior_vocab SET phrase_en = 'last but not least' WHERE word_id = 'jr-8A-U6-7006';
UPDATE public.junior_vocab SET phrase_en = 'believe in yourself' WHERE word_id = 'jr-8A-U6-9001';
UPDATE public.junior_vocab SET phrase_en = 'a software engineer' WHERE word_id = 'jr-8A-U6-9002';
UPDATE public.junior_vocab SET phrase_en = 'fashion design' WHERE word_id = 'jr-8A-U6-9003';
UPDATE public.junior_vocab SET phrase_en = 'a fashion designer' WHERE word_id = 'jr-8A-U6-9004';
UPDATE public.junior_vocab SET phrase_en = 'a film director' WHERE word_id = 'jr-8A-U6-9005';
UPDATE public.junior_vocab SET phrase_en = 'a talented musician' WHERE word_id = 'jr-8A-U6-9006';
UPDATE public.junior_vocab SET phrase_en = 'a brave fireman' WHERE word_id = 'jr-8A-U6-9007';
UPDATE public.junior_vocab SET phrase_en = 'good health' WHERE word_id = 'jr-8A-U6-9008';
UPDATE public.junior_vocab SET phrase_en = 'eat healthily' WHERE word_id = 'jr-8A-U6-9009';
UPDATE public.junior_vocab SET phrase_en = 'great intelligence' WHERE word_id = 'jr-8A-U6-9010';
UPDATE public.junior_vocab SET phrase_en = 'write an essay' WHERE word_id = 'jr-8A-U6-9011';
UPDATE public.junior_vocab SET phrase_en = 'a classic novel' WHERE word_id = 'jr-8A-U6-9012';
UPDATE public.junior_vocab SET phrase_en = 'English literature' WHERE word_id = 'jr-8A-U6-9013';
UPDATE public.junior_vocab SET phrase_en = 'a great athlete' WHERE word_id = 'jr-8A-U6-9014';
UPDATE public.junior_vocab SET phrase_en = 'a famous photographer' WHERE word_id = 'jr-8A-U6-9015';
UPDATE public.junior_vocab SET phrase_en = 'a famous painter' WHERE word_id = 'jr-8A-U6-9016';
UPDATE public.junior_vocab SET phrase_en = 'a successful businessman' WHERE word_id = 'jr-8A-U6-9017';
UPDATE public.junior_vocab SET phrase_en = 'a famous actress' WHERE word_id = 'jr-8A-U6-9018';
UPDATE public.junior_vocab SET phrase_en = 'study law' WHERE word_id = 'jr-8A-U6-9019';
UPDATE public.junior_vocab SET phrase_en = 'look ahead' WHERE word_id = 'jr-8A-U6-9020';
UPDATE public.junior_vocab SET phrase_en = 'design a poster' WHERE word_id = 'jr-8A-U6-9021';
UPDATE public.junior_vocab SET phrase_en = 'a long bridge' WHERE word_id = 'jr-8A-U6-9022';
UPDATE public.junior_vocab SET phrase_en = 'the final exam' WHERE word_id = 'jr-8A-U6-9023';
UPDATE public.junior_vocab SET phrase_en = 'full of confidence' WHERE word_id = 'jr-8A-U6-9024';
UPDATE public.junior_vocab SET phrase_en = 'form good habits' WHERE word_id = 'jr-8A-U6-9025';
UPDATE public.junior_vocab SET phrase_en = 'a good relationship' WHERE word_id = 'jr-8A-U6-9026';
UPDATE public.junior_vocab SET phrase_en = 'do ten push-ups' WHERE word_id = 'jr-8A-U6-9027';
UPDATE public.junior_vocab SET phrase_en = 'an energetic boy' WHERE word_id = 'jr-8A-U6-9028';

-- 校验:本单元已回填条数(应 = 34)
SELECT count(*) FILTER (WHERE phrase_en IS NOT NULL) AS filled, count(*) AS total
FROM public.junior_vocab WHERE grade = 8 AND volume = '8A' AND unit = 'U6';
