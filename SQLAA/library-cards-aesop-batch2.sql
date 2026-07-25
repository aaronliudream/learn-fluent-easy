-- ============================================================================
-- 图书馆点词实词词典卡 · 伊索(aesop) 第2批(20张)。CC手写·Web审后跑。
-- 三兄弟按 Aaron 定序(现代最高频义居首,伊索义并列在后):plane=飞机居首/crane=起重机居首/stall=摊位居首。
-- 归并:oxen→IRREG→ox 剔;sponge/axle 造词根让规则复数回退;upside→⑤语块;airs 在 EXCLUDE(架子≠空气)独立卡。
-- INSERT..ON CONFLICT 幂等。8字段齐,美音IPA。四本共享 read-v1。
-- ============================================================================
BEGIN;
SELECT 'before' AS phase,(SELECT count(*) FROM public.phrase_explanations WHERE target_lang='read-v1') AS n;

INSERT INTO public.phrase_explanations (phrase, normalized, source_lang, target_lang, explanation) VALUES
  ('huntsmen', 'huntsmen', 'en', 'read-v1', '{"ipa":"/ˈhʌntsmən/","pos":"n.","word":"huntsmen","example":{"en":"The huntsmen tracked the deer through the woods.","cn":"猎人们在林中追踪那头鹿。"},"gloss_cn":"猎人（复数）","gloss_en":"men who hunt game","sense_key":"huntsman"}'::jsonb),
  ('lapdog', 'lapdog', 'en', 'read-v1', '{"ipa":"/ˈlæpdɔːɡ/","pos":"n.","word":"lapdog","example":{"en":"The tiny lapdog slept on her knees all day.","cn":"那只小哈巴狗整天睡在她膝上。"},"gloss_cn":"哈巴狗（供人抱在膝上的小狗）","gloss_en":"a small pet dog kept on the lap","sense_key":"lapdog"}'::jsonb),
  ('pasture', 'pasture', 'en', 'read-v1', '{"ipa":"/ˈpæstʃər/","pos":"n.","word":"pasture","example":{"en":"The sheep grazed in the green pasture.","cn":"羊在绿色的牧场上吃草。"},"gloss_cn":"牧场、草场","gloss_en":"grassy land where animals feed","sense_key":"pasture"}'::jsonb),
  ('plane', 'plane', 'en', 'read-v1', '{"ipa":"/pleɪn/","pos":"n.","word":"plane","example":{"en":"The plane took off into the clouds.","cn":"飞机飞入云层。"},"gloss_cn":"飞机;平面;(木工)刨子;(plane tree)梧桐树","gloss_en":"an aircraft; a flat surface; a woodworking tool; (plane tree) a broad-leaved tree","sense_key":"plane"}'::jsonb),
  ('selfish', 'selfish', 'en', 'read-v1', '{"ipa":"/ˈselfɪʃ/","pos":"adj.","word":"selfish","example":{"en":"It was selfish of him to take the last seat.","cn":"他抢了最后一个座位，真自私。"},"gloss_cn":"自私的","gloss_en":"caring only about oneself","sense_key":"selfish"}'::jsonb),
  ('sponge', 'sponge', 'en', 'read-v1', '{"ipa":"/spʌndʒ/","pos":"n.","word":"sponge","example":{"en":"She wiped the table with a wet sponge.","cn":"她用湿海绵擦桌子。"},"gloss_cn":"海绵","gloss_en":"a soft material that soaks up water","sense_key":"sponge"}'::jsonb),
  ('sprat', 'sprat', 'en', 'read-v1', '{"ipa":"/spræt/","pos":"n.","word":"sprat","example":{"en":"A sprat is a tiny silver sea fish.","cn":"小鲱鱼是一种银色的小海鱼。"},"gloss_cn":"小鲱鱼（一种很小的海鱼）","gloss_en":"a very small sea fish","sense_key":"sprat"}'::jsonb),
  ('stall', 'stall', 'en', 'read-v1', '{"ipa":"/stɔːl/","pos":"n.","word":"stall","example":{"en":"She sold flowers at a small market stall.","cn":"她在一个小摊位上卖花。"},"gloss_cn":"摊位、货摊;(引擎)熄火;拖延;畜栏、马厩","gloss_en":"a market booth; (of an engine) to stop; to delay; a stable space for one animal","sense_key":"stall"}'::jsonb),
  ('trail', 'trail', 'en', 'read-v1', '{"ipa":"/treɪl/","pos":"n.","word":"trail","example":{"en":"The dog followed the fox''''s trail into the woods.","cn":"狗顺着狐狸的踪迹追进树林。"},"gloss_cn":"踪迹、痕迹;小径","gloss_en":"a track or scent left behind; a path","sense_key":"trail"}'::jsonb),
  ('crane', 'crane', 'en', 'read-v1', '{"ipa":"/kreɪn/","pos":"n.","word":"crane","example":{"en":"A tall crane lifted the steel beams.","cn":"一台高大的起重机吊起了钢梁。"},"gloss_cn":"起重机;鹤（涉禽）;(v.)伸长(脖子)","gloss_en":"a machine for lifting heavy loads; a long-legged wading bird; (v.) to stretch (the neck)","sense_key":"crane"}'::jsonb),
  ('airs', 'airs', 'en', 'read-v1', '{"ipa":"/ɛrz/","pos":"n.","word":"airs","example":{"en":"He put on airs as if he owned the place.","cn":"他摆起架子，好像这地方是他的。"},"gloss_cn":"(give oneself airs)装腔作势、摆架子","gloss_en":"a showy, self-important manner","sense_key":"airs"}'::jsonb),
  ('annoyed', 'annoyed', 'en', 'read-v1', '{"ipa":"/əˈnɔɪd/","pos":"adj.","word":"annoyed","example":{"en":"She was annoyed by the constant noise.","cn":"她被不停的噪音弄得心烦。"},"gloss_cn":"恼火的、烦躁的","gloss_en":"slightly angry or irritated","sense_key":"annoyed"}'::jsonb),
  ('arrangement', 'arrangement', 'en', 'read-v1', '{"ipa":"/əˈreɪndʒmənt/","pos":"n.","word":"arrangement","example":{"en":"They made an arrangement to meet at noon.","cn":"他们约定中午见面。"},"gloss_cn":"约定、安排","gloss_en":"a plan or agreement","sense_key":"arrangement"}'::jsonb),
  ('axle', 'axle', 'en', 'read-v1', '{"ipa":"/ˈæksl/","pos":"n.","word":"axle","example":{"en":"The wheel spun freely on its axle.","cn":"车轮在车轴上自由转动。"},"gloss_cn":"车轴","gloss_en":"the rod on which a wheel turns","sense_key":"axle"}'::jsonb),
  ('bloodsucker', 'bloodsucker', 'en', 'read-v1', '{"ipa":"/ˈblʌdsʌkər/","pos":"n.","word":"bloodsucker","example":{"en":"A leech is a bloodsucker that clings to skin.","cn":"水蛭是一种吸附在皮肤上吸血的东西。"},"gloss_cn":"吸血的东西（如水蛭、蚊虫）","gloss_en":"a creature that sucks blood, like a leech","sense_key":"bloodsucker"}'::jsonb),
  ('blotchy', 'blotchy', 'en', 'read-v1', '{"ipa":"/ˈblɑːtʃi/","pos":"adj.","word":"blotchy","example":{"en":"His skin turned blotchy in the cold.","cn":"他的皮肤冻得一块块发红。"},"gloss_cn":"有斑点的、一块块的","gloss_en":"covered with uneven patches or spots","sense_key":"blotchy"}'::jsonb),
  ('bolted', 'bolted', 'en', 'read-v1', '{"ipa":"/ˈboʊltɪd/","pos":"v.","word":"bolted","example":{"en":"The frightened horse bolted across the field.","cn":"受惊的马飞奔过田野。"},"gloss_cn":"猛冲、飞奔（bolt过去式）;闩住","gloss_en":"ran off suddenly; also fastened with a bolt","sense_key":"bolt"}'::jsonb),
  ('briny', 'briny', 'en', 'read-v1', '{"ipa":"/ˈbraɪni/","pos":"adj.","word":"briny","example":{"en":"The briny sea air stung his eyes.","cn":"含盐的海风刺得他眼睛发疼。"},"gloss_cn":"咸的、含盐的","gloss_en":"salty, like seawater","sense_key":"briny"}'::jsonb),
  ('carelessness', 'carelessness', 'en', 'read-v1', '{"ipa":"/ˈkɛrləsnəs/","pos":"n.","word":"carelessness","example":{"en":"The fire was caused by simple carelessness.","cn":"那场火灾只是因为疏忽大意。"},"gloss_cn":"粗心、疏忽","gloss_en":"lack of care or attention","sense_key":"careless"}'::jsonb),
  ('caw', 'caw', 'en', 'read-v1', '{"ipa":"/kɔː/","pos":"n.","word":"caw","example":{"en":"The crow let out a loud caw.","cn":"乌鸦发出一声响亮的呱呱叫。"},"gloss_cn":"（乌鸦的）呱呱叫;(v.)呱呱叫","gloss_en":"the harsh cry of a crow; (v.) to make this cry","sense_key":"caw"}'::jsonb)
ON CONFLICT (normalized, target_lang) DO UPDATE SET phrase=EXCLUDED.phrase, explanation=EXCLUDED.explanation, updated_at=now();

SELECT 'after' AS phase,(SELECT count(*) FROM public.phrase_explanations WHERE target_lang='read-v1') AS n;
COMMIT;
