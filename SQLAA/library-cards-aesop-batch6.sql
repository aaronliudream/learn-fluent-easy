-- ============================================================================
-- 图书馆点词实词词典卡 · 伊索(aesop) 第6批(真生词收尾·21张·CC自审)。判据:现代最高频义居首/解释性gloss/例句演居首义/屈折并卡。
-- 屈折并:scraps→scrap,statues→statue,voted→vote,whales→whale,solved→solve,taunting→taunt。strutting双写辅音不回退→单独造。
-- 查现有卡:全21无卡无撞车。0处需Aaron裁。至此真生词全清(batch1-6=118张·含dive)。
-- INSERT..ON CONFLICT 幂等。8字段齐,美音IPA。四本共享 read-v1。
-- ============================================================================
BEGIN;
SELECT 'before' AS phase,(SELECT count(*) FROM public.phrase_explanations WHERE target_lang='read-v1') AS n;

INSERT INTO public.phrase_explanations (phrase, normalized, source_lang, target_lang, explanation) VALUES
  ('salty', 'salty', 'en', 'read-v1', '{"ipa":"/ˈsɔːlti/","pos":"adj.","word":"salty","example":{"en":"The sea water is very salty.","cn":"海水很咸。"},"gloss_cn":"咸的、含盐的","gloss_en":"tasting of salt","sense_key":"salty"}'::jsonb),
  ('scold', 'scold', 'en', 'read-v1', '{"ipa":"/skoʊld/","pos":"v.","word":"scold","example":{"en":"His mother scolded him for coming home late.","cn":"妈妈因为他回家晚而责骂他。"},"gloss_cn":"责骂、训斥","gloss_en":"to speak angrily to someone who did wrong","sense_key":"scold"}'::jsonb),
  ('scrap', 'scrap', 'en', 'read-v1', '{"ipa":"/skræp/","pos":"n.","word":"scrap","example":{"en":"The dog ate the scraps under the table.","cn":"狗吃了桌下的残羹。"},"gloss_cn":"碎屑、残羹;小片;(v.)废弃","gloss_en":"a small bit, as of food; a small piece; (v.) to throw away","sense_key":"scrap"}'::jsonb),
  ('shaft', 'shaft', 'en', 'read-v1', '{"ipa":"/ʃæft/","pos":"n.","word":"shaft","example":{"en":"The arrow''s shaft was made of smooth wood.","cn":"那支箭的箭杆是光滑的木头做的。"},"gloss_cn":"杆、轴;(井/电梯)竖井;(箭)杆","gloss_en":"a long rod or pole; a deep vertical passage; the body of an arrow","sense_key":"shaft"}'::jsonb),
  ('sick', 'sick', 'en', 'read-v1', '{"ipa":"/sɪk/","pos":"adj.","word":"sick","example":{"en":"She stayed home because she was sick.","cn":"她生病了，就待在家里。"},"gloss_cn":"生病的;恶心的;(sick of)厌倦的","gloss_en":"ill; feeling like vomiting; (sick of) tired of","sense_key":"sick"}'::jsonb),
  ('solve', 'solve', 'en', 'read-v1', '{"ipa":"/sɑːlv/","pos":"v.","word":"solve","example":{"en":"He was the first to solve the puzzle.","cn":"他第一个解出了那道谜题。"},"gloss_cn":"解决、解答","gloss_en":"to find the answer to a problem","sense_key":"solve"}'::jsonb),
  ('soup', 'soup', 'en', 'read-v1', '{"ipa":"/suːp/","pos":"n.","word":"soup","example":{"en":"She had a bowl of hot soup for lunch.","cn":"她午饭喝了一碗热汤。"},"gloss_cn":"汤","gloss_en":"a liquid food made by boiling","sense_key":"soup"}'::jsonb),
  ('spindly', 'spindly', 'en', 'read-v1', '{"ipa":"/ˈspɪndli/","pos":"adj.","word":"spindly","example":{"en":"The newborn colt had spindly legs.","cn":"刚出生的小马腿又细又长。"},"gloss_cn":"细长的、瘦弱的","gloss_en":"long, thin, and weak-looking","sense_key":"spindly"}'::jsonb),
  ('splash', 'splash', 'en', 'read-v1', '{"ipa":"/splæʃ/","pos":"n.","word":"splash","example":{"en":"The stone hit the pond with a loud splash.","cn":"石头扑通一声落进池塘。"},"gloss_cn":"溅泼声、水花;(v.)溅、泼","gloss_en":"the sound or spray of water; (v.) to scatter liquid","sense_key":"splash"}'::jsonb),
  ('stack', 'stack', 'en', 'read-v1', '{"ipa":"/stæk/","pos":"n.","word":"stack","example":{"en":"She carried a stack of books to her desk.","cn":"她抱着一叠书走到书桌前。"},"gloss_cn":"一叠、一堆;(v.)堆叠","gloss_en":"a neat pile; (v.) to pile up","sense_key":"stack"}'::jsonb),
  ('statue', 'statue', 'en', 'read-v1', '{"ipa":"/ˈstætʃuː/","pos":"n.","word":"statue","example":{"en":"A stone statue stood in the town square.","cn":"镇上的广场上立着一座石像。"},"gloss_cn":"雕像、塑像","gloss_en":"a carved or cast figure of a person or animal","sense_key":"statue"}'::jsonb),
  ('strutting', 'strutting', 'en', 'read-v1', '{"ipa":"/ˈstrʌtɪŋ/","pos":"v.","word":"strutting","example":{"en":"The rooster went strutting across the yard.","cn":"公鸡在院子里趾高气扬地走来走去。"},"gloss_cn":"大摇大摆地走、趾高气扬（strut现在分词）","gloss_en":"walking proudly with a showy step","sense_key":"strut"}'::jsonb),
  ('taunt', 'taunt', 'en', 'read-v1', '{"ipa":"/tɔːnt/","pos":"v.","word":"taunt","example":{"en":"The bigger boys taunted him about his old shoes.","cn":"大些的男孩拿他的旧鞋奚落他。"},"gloss_cn":"嘲弄、奚落、讥讽","gloss_en":"to mock or tease cruelly","sense_key":"taunt"}'::jsonb),
  ('test', 'test', 'en', 'read-v1', '{"ipa":"/tɛst/","pos":"n.","word":"test","example":{"en":"They agreed on a test to see who was stronger.","cn":"他们约定用一场比试看谁更强。"},"gloss_cn":"测验、考验;(v.)检验","gloss_en":"an exam or trial; (v.) to check or try out","sense_key":"test"}'::jsonb),
  ('trace', 'trace', 'en', 'read-v1', '{"ipa":"/treɪs/","pos":"n.","word":"trace","example":{"en":"There was not a trace of dust on the shelf.","cn":"架子上一丝灰尘都没有。"},"gloss_cn":"痕迹、一丝;(v.)追溯、描摹","gloss_en":"a slight sign or bit; (v.) to follow or copy","sense_key":"trace"}'::jsonb),
  ('tune', 'tune', 'en', 'read-v1', '{"ipa":"/tuːn/","pos":"n.","word":"tune","example":{"en":"He hummed a cheerful tune on the way home.","cn":"他回家路上哼着欢快的曲子。"},"gloss_cn":"曲调、旋律;(v.)调音、调准","gloss_en":"a melody; (v.) to adjust an instrument''''s pitch","sense_key":"tune"}'::jsonb),
  ('undrinkable', 'undrinkable', 'en', 'read-v1', '{"ipa":"/ʌnˈdrɪŋkəbl/","pos":"adj.","word":"undrinkable","example":{"en":"The muddy water was undrinkable.","cn":"那浑浊的水没法喝。"},"gloss_cn":"不能喝的、难以下咽的","gloss_en":"not fit or safe to drink","sense_key":"undrinkable"}'::jsonb),
  ('unwatched', 'unwatched', 'en', 'read-v1', '{"ipa":"/ʌnˈwɑːtʃt/","pos":"adj.","word":"unwatched","example":{"en":"He left the gate unwatched for a moment.","cn":"他一时间没看住那道门。"},"gloss_cn":"无人看守的、没设防的","gloss_en":"not being watched or guarded","sense_key":"unwatched"}'::jsonb),
  ('vote', 'vote', 'en', 'read-v1', '{"ipa":"/voʊt/","pos":"v.","word":"vote","example":{"en":"The class will vote for a new leader.","cn":"全班将投票选出新的负责人。"},"gloss_cn":"投票、表决;(n.)选票","gloss_en":"to choose by a formal count; (n.) a ballot","sense_key":"vote"}'::jsonb),
  ('whale', 'whale', 'en', 'read-v1', '{"ipa":"/weɪl/","pos":"n.","word":"whale","example":{"en":"A giant whale surfaced beside the boat.","cn":"一头巨鲸浮出水面，就在船边。"},"gloss_cn":"鲸、鲸鱼","gloss_en":"a huge sea mammal","sense_key":"whale"}'::jsonb),
  ('yoke', 'yoke', 'en', 'read-v1', '{"ipa":"/joʊk/","pos":"n.","word":"yoke","example":{"en":"The two oxen pulled the plow under one yoke.","cn":"两头牛在同一副轭下拉犁。"},"gloss_cn":"（架在牛颈上的）轭;束缚","gloss_en":"a wooden bar joining two oxen; a burden","sense_key":"yoke"}'::jsonb)
ON CONFLICT (normalized, target_lang) DO UPDATE SET phrase=EXCLUDED.phrase, explanation=EXCLUDED.explanation, updated_at=now();

SELECT 'after' AS phase,(SELECT count(*) FROM public.phrase_explanations WHERE target_lang='read-v1') AS n;
COMMIT;
