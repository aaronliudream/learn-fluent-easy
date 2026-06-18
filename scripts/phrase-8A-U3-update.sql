-- 8A U3:回填 junior_vocab.phrase_en(英文短语/语块)。幂等:按 word_id 精确 UPDATE,可重跑。
-- 前置:必须先跑 ALTER TABLE ... ADD COLUMN phrase_en text;

UPDATE public.junior_vocab SET phrase_en = 'compare two photos' WHERE word_id = 'jr-8A-U3-0001';
UPDATE public.junior_vocab SET phrase_en = 'a shy smile' WHERE word_id = 'jr-8A-U3-0002';
UPDATE public.junior_vocab SET phrase_en = 'a lazy afternoon' WHERE word_id = 'jr-8A-U3-0003';
UPDATE public.junior_vocab SET phrase_en = 'a loud voice' WHERE word_id = 'jr-8A-U3-0004';
UPDATE public.junior_vocab SET phrase_en = 'an outgoing girl' WHERE word_id = 'jr-8A-U3-0005';
UPDATE public.junior_vocab SET phrase_en = 'a hard-working student' WHERE word_id = 'jr-8A-U3-0006';
UPDATE public.junior_vocab SET phrase_en = 'perform on stage' WHERE word_id = 'jr-8A-U3-0007';
UPDATE public.junior_vocab SET phrase_en = 'stay home alone' WHERE word_id = 'jr-8A-U3-0008';
UPDATE public.junior_vocab SET phrase_en = 'solve a problem' WHERE word_id = 'jr-8A-U3-0009';
UPDATE public.junior_vocab SET phrase_en = 'play the flute' WHERE word_id = 'jr-8A-U3-0010';
UPDATE public.junior_vocab SET phrase_en = 'warm congratulations' WHERE word_id = 'jr-8A-U3-0011';
UPDATE public.junior_vocab SET phrase_en = 'win first prize' WHERE word_id = 'jr-8A-U3-0012';
UPDATE public.junior_vocab SET phrase_en = 'attend a meeting' WHERE word_id = 'jr-8A-U3-0013';
UPDATE public.junior_vocab SET phrase_en = 'besides English' WHERE word_id = 'jr-8A-U3-0014';
UPDATE public.junior_vocab SET phrase_en = 'a spare key' WHERE word_id = 'jr-8A-U3-0015';
UPDATE public.junior_vocab SET phrase_en = 'with great pleasure' WHERE word_id = 'jr-8A-U3-0016';
UPDATE public.junior_vocab SET phrase_en = 'a neat appearance' WHERE word_id = 'jr-8A-U3-0017';
UPDATE public.junior_vocab SET phrase_en = 'a kind personality' WHERE word_id = 'jr-8A-U3-0018';
UPDATE public.junior_vocab SET phrase_en = 'a serious face' WHERE word_id = 'jr-8A-U3-0019';
UPDATE public.junior_vocab SET phrase_en = 'great strength' WHERE word_id = 'jr-8A-U3-0020';
UPDATE public.junior_vocab SET phrase_en = 'an interesting fact' WHERE word_id = 'jr-8A-U3-0021';
UPDATE public.junior_vocab SET phrase_en = 'a large population' WHERE word_id = 'jr-8A-U3-0022';
UPDATE public.junior_vocab SET phrase_en = 'ten km away' WHERE word_id = 'jr-8A-U3-0023';
UPDATE public.junior_vocab SET phrase_en = 'the average score' WHERE word_id = 'jr-8A-U3-0024';
UPDATE public.junior_vocab SET phrase_en = 'a pleasant day' WHERE word_id = 'jr-8A-U3-0025';
UPDATE public.junior_vocab SET phrase_en = 'look very alike' WHERE word_id = 'jr-8A-U3-0026';
UPDATE public.junior_vocab SET phrase_en = 'look in the mirror' WHERE word_id = 'jr-8A-U3-0027';
UPDATE public.junior_vocab SET phrase_en = 'a big difference' WHERE word_id = 'jr-8A-U3-0028';
UPDATE public.junior_vocab SET phrase_en = 'a great interest' WHERE word_id = 'jr-8A-U3-0029';
UPDATE public.junior_vocab SET phrase_en = 'a straightforward answer' WHERE word_id = 'jr-8A-U3-0030';
UPDATE public.junior_vocab SET phrase_en = 'read a novel' WHERE word_id = 'jr-8A-U3-0031';
UPDATE public.junior_vocab SET phrase_en = 'common sense' WHERE word_id = 'jr-8A-U3-0032';
UPDATE public.junior_vocab SET phrase_en = 'a sense of humour' WHERE word_id = 'jr-8A-U3-0033';
UPDATE public.junior_vocab SET phrase_en = 'in my opinion' WHERE word_id = 'jr-8A-U3-0034';
UPDATE public.junior_vocab SET phrase_en = 'less than before' WHERE word_id = 'jr-8A-U3-0035';
UPDATE public.junior_vocab SET phrase_en = 'an honest person' WHERE word_id = 'jr-8A-U3-0036';
UPDATE public.junior_vocab SET phrase_en = 'a direct answer' WHERE word_id = 'jr-8A-U3-0037';
UPDATE public.junior_vocab SET phrase_en = 'find the similarities' WHERE word_id = 'jr-8A-U3-0038';
UPDATE public.junior_vocab SET phrase_en = 'a close friendship' WHERE word_id = 'jr-8A-U3-0039';
UPDATE public.junior_vocab SET phrase_en = 'two metres tall' WHERE word_id = 'jr-8A-U3-0040';
UPDATE public.junior_vocab SET phrase_en = 'a young prince' WHERE word_id = 'jr-8A-U3-0041';
UPDATE public.junior_vocab SET phrase_en = 'the main character' WHERE word_id = 'jr-8A-U3-0042';
UPDATE public.junior_vocab SET phrase_en = 'the prince and the pauper' WHERE word_id = 'jr-8A-U3-0043';
UPDATE public.junior_vocab SET phrase_en = 'exchange gifts' WHERE word_id = 'jr-8A-U3-0044';
UPDATE public.junior_vocab SET phrase_en = 'as tall as me' WHERE word_id = 'jr-8A-U3-7001';
UPDATE public.junior_vocab SET phrase_en = 'in my spare time' WHERE word_id = 'jr-8A-U3-7002';
UPDATE public.junior_vocab SET phrase_en = 'have much in common' WHERE word_id = 'jr-8A-U3-7003';
UPDATE public.junior_vocab SET phrase_en = 'thanks to your help' WHERE word_id = 'jr-8A-U3-7004';
UPDATE public.junior_vocab SET phrase_en = 'make a mistake' WHERE word_id = 'jr-8A-U3-7005';
UPDATE public.junior_vocab SET phrase_en = 'meet by accident' WHERE word_id = 'jr-8A-U3-7006';

-- 校验:本单元已回填条数(应 = 50)
SELECT count(*) FILTER (WHERE phrase_en IS NOT NULL) AS filled, count(*) AS total
FROM public.junior_vocab WHERE grade = 8 AND volume = '8A' AND unit = 'U3';
