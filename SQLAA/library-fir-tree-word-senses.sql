-- 枞树按书覆盖 library_word_senses(book_key=fir-tree·美音·点词/复习优先书中义,按book隔离)。
-- want/wanted/prime/swallows=全局卡义对本书误读(缺乏/首要/吞没)→ 覆盖为书中义;gaily=古今异义(鲜艳vs欢乐)。
-- 幂等 DO UPDATE。想改书内某词回全局义,删该 (book_key,normalized) 行即可。
BEGIN;
INSERT INTO public.library_word_senses (book_key, normalized, word, ipa, pos, sense_key, gloss_cn, gloss_en, archaic, modern_cn, modern_en, example_en, example_cn, proper) VALUES
  ('fir-tree','want','want','/wɑːnt/','v.','desire','想要、希望','to wish for or desire',false,NULL,NULL,'The children want a bigger tree this year.','孩子们今年想要一棵更大的树。',false),
  ('fir-tree','wanted','want','/ˈwɑːntɪd/','v.','desire','想要、希望(过去式)','wished for or desired (past)',false,NULL,NULL,'He wanted to leave before the snow came.','他想在下雪之前离开。',false),
  ('fir-tree','prime','prime','/praɪm/','n.','peak-of-life','(人生的)壮年、盛年','the best and strongest years of one''s life',false,'首要的、最主要的','most important, chief','The athlete was in his prime that season.','那个赛季,这名运动员正当盛年。',false),
  ('fir-tree','swallows','swallow','/ˈswɑːloʊz/','n.','bird','燕子','small, fast-flying birds',false,'吞、咽下','to make food go down the throat','In spring the swallows return to the old barn.','春天,燕子飞回那座旧谷仓。',false),
  ('fir-tree','gaily','gaily','/ˈɡeɪli/','adv.','brightly','鲜艳地、色彩明丽地','brightly, in vivid colors',true,'欢乐地、愉快地','merrily, cheerfully','The hall was hung with gaily colored ribbons.','大厅里挂满了色彩鲜艳的丝带。',false)
ON CONFLICT (book_key, normalized) DO UPDATE SET
  word=EXCLUDED.word, ipa=EXCLUDED.ipa, pos=EXCLUDED.pos, sense_key=EXCLUDED.sense_key,
  gloss_cn=EXCLUDED.gloss_cn, gloss_en=EXCLUDED.gloss_en, archaic=EXCLUDED.archaic,
  modern_cn=EXCLUDED.modern_cn, modern_en=EXCLUDED.modern_en,
  example_en=EXCLUDED.example_en, example_cn=EXCLUDED.example_cn;
COMMIT;
