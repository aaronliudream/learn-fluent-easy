-- 8B U1:回填 junior_vocab.phrase_en(英文短语/语块)。幂等:按 word_id 精确 UPDATE,可重跑。
-- 前置:必须先跑 ALTER TABLE ... ADD COLUMN phrase_en text;

UPDATE public.junior_vocab SET phrase_en = 'Chinese calligraphy' WHERE word_id = 'jr-8B-U1-0001';
UPDATE public.junior_vocab SET phrase_en = 'learn to ski' WHERE word_id = 'jr-8B-U1-0002';
UPDATE public.junior_vocab SET phrase_en = 'a TV program' WHERE word_id = 'jr-8B-U1-0003';
UPDATE public.junior_vocab SET phrase_en = 'express your feelings' WHERE word_id = 'jr-8B-U1-0004';
UPDATE public.junior_vocab SET phrase_en = 'go ice-skating' WHERE word_id = 'jr-8B-U1-0005';
UPDATE public.junior_vocab SET phrase_en = 'a ski instructor' WHERE word_id = 'jr-8B-U1-0006';
UPDATE public.junior_vocab SET phrase_en = 'feel scared' WHERE word_id = 'jr-8B-U1-0007';
UPDATE public.junior_vocab SET phrase_en = 'overcome your fear' WHERE word_id = 'jr-8B-U1-0008';
UPDATE public.junior_vocab SET phrase_en = 'write a poem' WHERE word_id = 'jr-8B-U1-0009';
UPDATE public.junior_vocab SET phrase_en = 'a single ticket' WHERE word_id = 'jr-8B-U1-0010';
UPDATE public.junior_vocab SET phrase_en = 'a brush stroke' WHERE word_id = 'jr-8B-U1-0011';
UPDATE public.junior_vocab SET phrase_en = 'black ink' WHERE word_id = 'jr-8B-U1-0012';
UPDATE public.junior_vocab SET phrase_en = 'return the book' WHERE word_id = 'jr-8B-U1-0013';
UPDATE public.junior_vocab SET phrase_en = 'a good deal' WHERE word_id = 'jr-8B-U1-0014';
UPDATE public.junior_vocab SET phrase_en = 'manage your time' WHERE word_id = 'jr-8B-U1-0015';
UPDATE public.junior_vocab SET phrase_en = 'learn to ice-skate' WHERE word_id = 'jr-8B-U1-0016';
UPDATE public.junior_vocab SET phrase_en = 'practise kung fu' WHERE word_id = 'jr-8B-U1-0017';
UPDATE public.junior_vocab SET phrase_en = 'push the door' WHERE word_id = 'jr-8B-U1-0018';
UPDATE public.junior_vocab SET phrase_en = 'chat with friends' WHERE word_id = 'jr-8B-U1-0019';
UPDATE public.junior_vocab SET phrase_en = 'a family outing' WHERE word_id = 'jr-8B-U1-0020';
UPDATE public.junior_vocab SET phrase_en = 'reduce stress' WHERE word_id = 'jr-8B-U1-0021';
UPDATE public.junior_vocab SET phrase_en = 'under stress' WHERE word_id = 'jr-8B-U1-0022';
UPDATE public.junior_vocab SET phrase_en = 'do yoga' WHERE word_id = 'jr-8B-U1-0023';
UPDATE public.junior_vocab SET phrase_en = 'a small object' WHERE word_id = 'jr-8B-U1-0024';
UPDATE public.junior_vocab SET phrase_en = 'Italian food' WHERE word_id = 'jr-8B-U1-0025';
UPDATE public.junior_vocab SET phrase_en = 'a computer programmer' WHERE word_id = 'jr-8B-U1-0026';
UPDATE public.junior_vocab SET phrase_en = 'allow enough time' WHERE word_id = 'jr-8B-U1-0027';
UPDATE public.junior_vocab SET phrase_en = 'a great achievement' WHERE word_id = 'jr-8B-U1-0028';
UPDATE public.junior_vocab SET phrase_en = 'an old coin' WHERE word_id = 'jr-8B-U1-0029';
UPDATE public.junior_vocab SET phrase_en = 'collect stamps' WHERE word_id = 'jr-8B-U1-0030';
UPDATE public.junior_vocab SET phrase_en = 'a teenage girl' WHERE word_id = 'jr-8B-U1-0031';
UPDATE public.junior_vocab SET phrase_en = 'send a postcard' WHERE word_id = 'jr-8B-U1-0032';
UPDATE public.junior_vocab SET phrase_en = 'rather difficult' WHERE word_id = 'jr-8B-U1-0033';
UPDATE public.junior_vocab SET phrase_en = 'an old-fashioned phone' WHERE word_id = 'jr-8B-U1-0034';
UPDATE public.junior_vocab SET phrase_en = 'a foreign country' WHERE word_id = 'jr-8B-U1-0035';
UPDATE public.junior_vocab SET phrase_en = 'a good suggestion' WHERE word_id = 'jr-8B-U1-0036';
UPDATE public.junior_vocab SET phrase_en = 'learn from failure' WHERE word_id = 'jr-8B-U1-0037';
UPDATE public.junior_vocab SET phrase_en = 'a great inspiration' WHERE word_id = 'jr-8B-U1-0038';
UPDATE public.junior_vocab SET phrase_en = 'a strict teacher' WHERE word_id = 'jr-8B-U1-0039';
UPDATE public.junior_vocab SET phrase_en = 'surprisingly easy' WHERE word_id = 'jr-8B-U1-0040';
UPDATE public.junior_vocab SET phrase_en = 'the next stage' WHERE word_id = 'jr-8B-U1-0041';
UPDATE public.junior_vocab SET phrase_en = 'more importantly' WHERE word_id = 'jr-8B-U1-0042';
UPDATE public.junior_vocab SET phrase_en = 'never give up' WHERE word_id = 'jr-8B-U1-7001';
UPDATE public.junior_vocab SET phrase_en = 'scared of the dark' WHERE word_id = 'jr-8B-U1-7002';
UPDATE public.junior_vocab SET phrase_en = 'get over a cold' WHERE word_id = 'jr-8B-U1-7003';
UPDATE public.junior_vocab SET phrase_en = 'deal with problems' WHERE word_id = 'jr-8B-U1-7005';
UPDATE public.junior_vocab SET phrase_en = 'get into music' WHERE word_id = 'jr-8B-U1-7006';
UPDATE public.junior_vocab SET phrase_en = 'give it a go' WHERE word_id = 'jr-8B-U1-7007';
UPDATE public.junior_vocab SET phrase_en = 'once in a while' WHERE word_id = 'jr-8B-U1-7008';
UPDATE public.junior_vocab SET phrase_en = 'go on an outing' WHERE word_id = 'jr-8B-U1-7009';
UPDATE public.junior_vocab SET phrase_en = 'dream of success' WHERE word_id = 'jr-8B-U1-7010';
UPDATE public.junior_vocab SET phrase_en = 'so far so good' WHERE word_id = 'jr-8B-U1-7011';

-- 校验:本单元已回填条数(应 = 52)
SELECT count(*) FILTER (WHERE phrase_en IS NOT NULL) AS filled, count(*) AS total
FROM public.junior_vocab WHERE grade = 8 AND volume = '8B' AND unit = 'U1';
