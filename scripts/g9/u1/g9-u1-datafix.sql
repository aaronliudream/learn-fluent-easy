-- g9 U1 数据修复(对齐8年级):vocab.phrase_en + vocab.freq_rank + reading.vocab_notes。幂等。

-- 1) vocab phrase_en(language chunk)+ freq_rank(展示排序)
UPDATE public.junior_vocab SET phrase_en='open your textbook', freq_rank=1 WHERE volume='g9' AND unit='U1' AND lower(word)=lower('textbook');
UPDATE public.junior_vocab SET phrase_en='have a conversation', freq_rank=2 WHERE volume='g9' AND unit='U1' AND lower(word)=lower('conversation');
UPDATE public.junior_vocab SET phrase_en='read aloud in class', freq_rank=3 WHERE volume='g9' AND unit='U1' AND lower(word)=lower('aloud');
UPDATE public.junior_vocab SET phrase_en='improve your pronunciation', freq_rank=4 WHERE volume='g9' AND unit='U1' AND lower(word)=lower('pronunciation');
UPDATE public.junior_vocab SET phrase_en='make a sentence', freq_rank=5 WHERE volume='g9' AND unit='U1' AND lower(word)=lower('sentence');
UPDATE public.junior_vocab SET phrase_en='be patient with others', freq_rank=6 WHERE volume='g9' AND unit='U1' AND lower(word)=lower('patient');
UPDATE public.junior_vocab SET phrase_en='a useful expression', freq_rank=7 WHERE volume='g9' AND unit='U1' AND lower(word)=lower('expression');
UPDATE public.junior_vocab SET phrase_en='discover a secret', freq_rank=8 WHERE volume='g9' AND unit='U1' AND lower(word)=lower('discover');
UPDATE public.junior_vocab SET phrase_en='keep a secret', freq_rank=9 WHERE volume='g9' AND unit='U1' AND lower(word)=lower('secret');
UPDATE public.junior_vocab SET phrase_en='English grammar', freq_rank=10 WHERE volume='g9' AND unit='U1' AND lower(word)=lower('grammar');
UPDATE public.junior_vocab SET phrase_en='repeat the new words', freq_rank=11 WHERE volume='g9' AND unit='U1' AND lower(word)=lower('repeat');
UPDATE public.junior_vocab SET phrase_en='take notes in class', freq_rank=12 WHERE volume='g9' AND unit='U1' AND lower(word)=lower('note');
UPDATE public.junior_vocab SET phrase_en='pronounce the word', freq_rank=13 WHERE volume='g9' AND unit='U1' AND lower(word)=lower('pronounce');
UPDATE public.junior_vocab SET phrase_en='increase your vocabulary', freq_rank=14 WHERE volume='g9' AND unit='U1' AND lower(word)=lower('increase');
UPDATE public.junior_vocab SET phrase_en='work with a partner', freq_rank=15 WHERE volume='g9' AND unit='U1' AND lower(word)=lower('partner');
UPDATE public.junior_vocab SET phrase_en='a physics class', freq_rank=16 WHERE volume='g9' AND unit='U1' AND lower(word)=lower('physics');
UPDATE public.junior_vocab SET phrase_en='a chemistry teacher', freq_rank=17 WHERE volume='g9' AND unit='U1' AND lower(word)=lower('chemistry');
UPDATE public.junior_vocab SET phrase_en='be born in 2010', freq_rank=18 WHERE volume='g9' AND unit='U1' AND lower(word)=lower('born');
UPDATE public.junior_vocab SET phrase_en='create a story', freq_rank=19 WHERE volume='g9' AND unit='U1' AND lower(word)=lower('create');
UPDATE public.junior_vocab SET phrase_en='reading speed', freq_rank=20 WHERE volume='g9' AND unit='U1' AND lower(word)=lower('speed');
UPDATE public.junior_vocab SET phrase_en='the ability to learn', freq_rank=21 WHERE volume='g9' AND unit='U1' AND lower(word)=lower('ability');
UPDATE public.junior_vocab SET phrase_en='be active in class', freq_rank=22 WHERE volume='g9' AND unit='U1' AND lower(word)=lower('active');
UPDATE public.junior_vocab SET phrase_en='use your brain', freq_rank=23 WHERE volume='g9' AND unit='U1' AND lower(word)=lower('brain');
UPDATE public.junior_vocab SET phrase_en='connect words with pictures', freq_rank=24 WHERE volume='g9' AND unit='U1' AND lower(word)=lower('connect');
UPDATE public.junior_vocab SET phrase_en='review your lessons', freq_rank=25 WHERE volume='g9' AND unit='U1' AND lower(word)=lower('review');
UPDATE public.junior_vocab SET phrase_en='gain knowledge', freq_rank=26 WHERE volume='g9' AND unit='U1' AND lower(word)=lower('knowledge');
UPDATE public.junior_vocab SET phrase_en='use time wisely', freq_rank=27 WHERE volume='g9' AND unit='U1' AND lower(word)=lower('wisely');
UPDATE public.junior_vocab SET phrase_en='memorize new words', freq_rank=28 WHERE volume='g9' AND unit='U1' AND lower(word)=lower('memorize');
UPDATE public.junior_vocab SET phrase_en='pay attention to the teacher', freq_rank=29 WHERE volume='g9' AND unit='U1' AND lower(word)=lower('attention');

-- 2) reading vocab_notes(词汇注释)
UPDATE public.junior_reading SET vocab_notes='[{"word":"active","cn":"积极的；主动的"},{"word":"patient","cn":"有耐心的"},{"word":"connect","cn":"联系；连接"}]'::jsonb WHERE volume='g9' AND unit='U1' AND title='Becoming a Good Learner';
UPDATE public.junior_reading SET vocab_notes='[{"word":"hate","cn":"讨厌；厌恶"},{"word":"guess","cn":"猜测"},{"word":"hobby","cn":"爱好"}]'::jsonb WHERE volume='g9' AND unit='U1' AND title='Anna and Her Reading Journey';
UPDATE public.junior_reading SET vocab_notes='[{"word":"repeat","cn":"重复"},{"word":"meaning","cn":"含义；意思"},{"word":"connected","cn":"相联系的"}]'::jsonb WHERE volume='g9' AND unit='U1' AND title='Two Ways to Remember Words';
UPDATE public.junior_reading SET vocab_notes='[{"word":"mistake","cn":"错误"},{"word":"partner","cn":"搭档；同伴"},{"word":"progress","cn":"进步"}]'::jsonb WHERE volume='g9' AND unit='U1' AND title='A Letter to a New Classmate';
UPDATE public.junior_reading SET vocab_notes='[{"word":"mistake","cn":"错误"},{"word":"correct","cn":"改正；正确的"},{"word":"brave","cn":"勇敢的"}]'::jsonb WHERE volume='g9' AND unit='U1' AND title='The Power of Mistakes';
UPDATE public.junior_reading SET vocab_notes='[{"word":"subtitle","cn":"字幕"},{"word":"pronunciation","cn":"发音"},{"word":"diary","cn":"日记"}]'::jsonb WHERE volume='g9' AND unit='U1' AND title='Learning Beyond the Classroom';

-- count 校验
SELECT 'vocab_phrase' k, count(*) v, 29 expect FROM public.junior_vocab WHERE volume='g9' AND unit='U1' AND phrase_en IS NOT NULL AND phrase_en<>''
UNION ALL SELECT 'vocab_freq', count(*), 29 FROM public.junior_vocab WHERE volume='g9' AND unit='U1' AND freq_rank IS NOT NULL
UNION ALL SELECT 'reading_vnotes', count(*), 6 FROM public.junior_reading WHERE volume='g9' AND unit='U1' AND jsonb_array_length(vocab_notes)>0;
