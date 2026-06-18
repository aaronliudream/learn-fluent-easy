-- 8A U1:回填 junior_vocab.phrase_en(英文短语/语块)。幂等:按 word_id 精确 UPDATE,可重跑。
-- 前置:必须先跑 ALTER TABLE ... ADD COLUMN phrase_en text;

UPDATE public.junior_vocab SET phrase_en = 'an ancient town' WHERE word_id = 'jr-8A-U1-0001';
UPDATE public.junior_vocab SET phrase_en = 'a summer camp' WHERE word_id = 'jr-8A-U1-0002';
UPDATE public.junior_vocab SET phrase_en = 'a beautiful landscape' WHERE word_id = 'jr-8A-U1-0003';
UPDATE public.junior_vocab SET phrase_en = 'a strange noise' WHERE word_id = 'jr-8A-U1-0004';
UPDATE public.junior_vocab SET phrase_en = 'summer vacation' WHERE word_id = 'jr-8A-U1-0005';
UPDATE public.junior_vocab SET phrase_en = 'a fantastic holiday' WHERE word_id = 'jr-8A-U1-0006';
UPDATE public.junior_vocab SET phrase_en = 'a small town' WHERE word_id = 'jr-8A-U1-0007';
UPDATE public.junior_vocab SET phrase_en = 'take a deep breath' WHERE word_id = 'jr-8A-U1-0008';
UPDATE public.junior_vocab SET phrase_en = 'especially in summer' WHERE word_id = 'jr-8A-U1-0009';
UPDATE public.junior_vocab SET phrase_en = 'steamed fish' WHERE word_id = 'jr-8A-U1-0010';
UPDATE public.junior_vocab SET phrase_en = 'go anywhere you like' WHERE word_id = 'jr-8A-U1-0011';
UPDATE public.junior_vocab SET phrase_en = 'nothing in the box' WHERE word_id = 'jr-8A-U1-0012';
UPDATE public.junior_vocab SET phrase_en = 'a tour guide' WHERE word_id = 'jr-8A-U1-0013';
UPDATE public.junior_vocab SET phrase_en = 'beautiful scenery' WHERE word_id = 'jr-8A-U1-0014';
UPDATE public.junior_vocab SET phrase_en = 'a silk scarf' WHERE word_id = 'jr-8A-U1-0015';
UPDATE public.junior_vocab SET phrase_en = 'a warm scarf' WHERE word_id = 'jr-8A-U1-0016';
UPDATE public.junior_vocab SET phrase_en = 'ready for school' WHERE word_id = 'jr-8A-U1-0017';
UPDATE public.junior_vocab SET phrase_en = 'somewhere quiet' WHERE word_id = 'jr-8A-U1-0018';
UPDATE public.junior_vocab SET phrase_en = 'do it by myself' WHERE word_id = 'jr-8A-U1-0019';
UPDATE public.junior_vocab SET phrase_en = 'stay at a hotel' WHERE word_id = 'jr-8A-U1-0020';
UPDATE public.junior_vocab SET phrase_en = 'a comfortable bed' WHERE word_id = 'jr-8A-U1-0021';
UPDATE public.junior_vocab SET phrase_en = 'feel bored at home' WHERE word_id = 'jr-8A-U1-0022';
UPDATE public.junior_vocab SET phrase_en = 'a blue sky' WHERE word_id = 'jr-8A-U1-0023';
UPDATE public.junior_vocab SET phrase_en = 'walk towards the door' WHERE word_id = 'jr-8A-U1-0024';
UPDATE public.junior_vocab SET phrase_en = 'a rainbow in the sky' WHERE word_id = 'jr-8A-U1-0025';
UPDATE public.junior_vocab SET phrase_en = 'the town square' WHERE word_id = 'jr-8A-U1-0026';
UPDATE public.junior_vocab SET phrase_en = 'during the holiday' WHERE word_id = 'jr-8A-U1-0027';
UPDATE public.junior_vocab SET phrase_en = 'win a great victory' WHERE word_id = 'jr-8A-U1-0028';
UPDATE public.junior_vocab SET phrase_en = 'Russian food' WHERE word_id = 'jr-8A-U1-0029';
UPDATE public.junior_vocab SET phrase_en = 'fight against pollution' WHERE word_id = 'jr-8A-U1-0030';
UPDATE public.junior_vocab SET phrase_en = 'lean against the wall' WHERE word_id = 'jr-8A-U1-0031';
UPDATE public.junior_vocab SET phrase_en = 'a famous artwork' WHERE word_id = 'jr-8A-U1-0032';
UPDATE public.junior_vocab SET phrase_en = 'tears of joy' WHERE word_id = 'jr-8A-U1-0033';
UPDATE public.junior_vocab SET phrase_en = 'remind me of home' WHERE word_id = 'jr-8A-U1-0034';
UPDATE public.junior_vocab SET phrase_en = 'peace and quiet' WHERE word_id = 'jr-8A-U1-0035';
UPDATE public.junior_vocab SET phrase_en = 'win the game easily' WHERE word_id = 'jr-8A-U1-0036';
UPDATE public.junior_vocab SET phrase_en = 'the view takes my breath away' WHERE word_id = 'jr-8A-U1-7001';
UPDATE public.junior_vocab SET phrase_en = 'nothing but blue sky' WHERE word_id = 'jr-8A-U1-7002';
UPDATE public.junior_vocab SET phrase_en = 'ready to help others' WHERE word_id = 'jr-8A-U1-7003';
UPDATE public.junior_vocab SET phrase_en = 'fight against pollution' WHERE word_id = 'jr-8A-U1-7004';
UPDATE public.junior_vocab SET phrase_en = 'thousands of people' WHERE word_id = 'jr-8A-U1-7005';

-- 校验:本单元已回填条数(应 = 41)
SELECT count(*) FILTER (WHERE phrase_en IS NOT NULL) AS filled, count(*) AS total
FROM public.junior_vocab WHERE grade = 8 AND volume = '8A' AND unit = 'U1';
