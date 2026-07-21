-- ============================================================================
-- fir-tree 28 张旧全局卡修正(网页版Claude审定·B改全局主流义+2张Tom退A)。IPA 保留不动。
-- 起因:全局 read-v1 旧卡把罕见义/次要义/错词性当默认义(withered=使羞愧/after=照料/over=克服…),
--   Oz/Robinson/Tom 也在吃 → 改全局连带全修。2 张 Tom 真依赖旧义(withered=使羞愧/squeak=告密)退按书覆盖。
-- 幂等:UPDATE 现卡(不新建);tom 覆盖 ON CONFLICT DO UPDATE。BEGIN/COMMIT + 前后核验。
-- ============================================================================
BEGIN;

SELECT 'before' AS phase, normalized, explanation->>'pos' AS pos, explanation->>'gloss_cn' AS gloss_cn
  FROM public.phrase_explanations
 WHERE target_lang='read-v1' AND normalized IN ('withered','hang','squeak','star','sheer','trunks','sprung','spring','nurse','plant','plunder','troop','state','matter','rest','court','over','bend','fixed','beat','sing','word','assert','care','after','upright','peeping','kissed')
 ORDER BY normalized;

-- ① 28 张 global read-v1 修正(改默认义为主流义;IPA 原样保留)
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈwɪðərd/","pos":"adj.","word":"withered","example":{"en":"After a week without water, the plant looked withered.","cn":"一周没浇水,那株植物看上去枯蔫了。"},"gloss_cn":"枯萎的、干枯发蔫的","gloss_en":"withered; dried up and shrivelled","sense_key":"wither"}'::jsonb
 WHERE normalized = 'withered' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/hæŋ/","pos":"v.","word":"hang","example":{"en":"We hang our coats on the hooks by the door.","cn":"我们把外套挂在门边的钩子上。"},"gloss_cn":"悬挂、垂挂","gloss_en":"to hang or be suspended from something","sense_key":"hang"}'::jsonb
 WHERE normalized = 'hang' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/skwiːk/","pos":"v.","word":"squeak","example":{"en":"The little mouse squeaked and darted into its hole.","cn":"小老鼠吱吱一叫,窜进了洞里。"},"gloss_cn":"吱吱叫、发出尖细声","gloss_en":"to make a short high-pitched sound","sense_key":"squeak"}'::jsonb
 WHERE normalized = 'squeak' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/stɑr/","pos":"n.","word":"star","example":{"en":"One bright star appeared over the dark woods.","cn":"一颗明亮的星星出现在黑森林上空。"},"gloss_cn":"星、星星","gloss_en":"a shining point of light in the night sky","sense_key":"star"}'::jsonb
 WHERE normalized = 'star' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ʃɪr/","pos":"adj.","word":"sheer","example":{"en":"She laughed out of sheer joy.","cn":"她纯粹是出于高兴才笑起来。"},"gloss_cn":"纯粹的、十足的;(也指)陡峭的","gloss_en":"pure, absolute; also steep","sense_key":"sheer"}'::jsonb
 WHERE normalized = 'sheer' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/trʌŋks/","pos":"n.","word":"trunks","example":{"en":"They stacked the heavy trunks up in the attic.","cn":"他们把沉重的大箱子堆在阁楼里。"},"gloss_cn":"树干;(复)大衣箱、大木箱","gloss_en":"tree trunks; large storage chests","sense_key":"trunk"}'::jsonb
 WHERE normalized = 'trunks' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/sprʌŋ/","pos":"v.","word":"sprung","example":{"en":"Weeds had sprung up all over the garden.","cn":"杂草在花园里到处冒了出来。"},"gloss_cn":"跳起、涌现;(sprung up)冒出、长出","gloss_en":"leapt; sprang up (past participle of spring)","sense_key":"spring"}'::jsonb
 WHERE normalized = 'sprung' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/sprɪŋ/","pos":"n.","word":"spring","example":{"en":"In spring the whole valley turns green.","cn":"春天,整个山谷都绿了。"},"gloss_cn":"春天;泉水;(v.)跳、猛地(spring up)","gloss_en":"spring (season); a water spring; to leap","sense_key":"spring"}'::jsonb
 WHERE normalized = 'spring' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/nɜːs/","pos":"n.","word":"nurse","example":{"en":"The nurse gently looked after the sick child.","cn":"护士细心地照看生病的孩子。"},"gloss_cn":"护士;保姆;(v.)照料","gloss_en":"a nurse or nanny; to care for","sense_key":"nurse"}'::jsonb
 WHERE normalized = 'nurse' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/plɑːnt/","pos":"n.","word":"plant","example":{"en":"In April the farmers plant their seeds.","cn":"四月里,农夫们把种子种下去。"},"gloss_cn":"植物;(v.)栽种、种植","gloss_en":"a plant; to put in the ground to grow","sense_key":"plant"}'::jsonb
 WHERE normalized = 'plant' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈplʌn.dɚ/","pos":"v.","word":"plunder","example":{"en":"The pirates rushed in to plunder the town.","cn":"海盗们冲进来抢劫这座城镇。"},"gloss_cn":"掠夺、抢夺;(n.)掠夺物","gloss_en":"to rob or loot; also stolen goods","sense_key":"plunder"}'::jsonb
 WHERE normalized = 'plunder' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/truːp/","pos":"n.","word":"troop","example":{"en":"A troop of children ran across the field.","cn":"一群孩子跑过田野。"},"gloss_cn":"一群、一队;军队;(v.)成群结队走","gloss_en":"a group or band; troops; to move in a group","sense_key":"troop"}'::jsonb
 WHERE normalized = 'troop' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/steɪt/","pos":"n.","word":"state","example":{"en":"The old house was in a sad state.","cn":"那座老房子破败不堪。"},"gloss_cn":"状态、情形;国家","gloss_en":"a condition or situation; a nation","sense_key":"state"}'::jsonb
 WHERE normalized = 'state' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈmætər/","pos":"n.","word":"matter","example":{"en":"What''s the matter with your arm?","cn":"你的胳膊怎么了?"},"gloss_cn":"事情、问题;(v.)要紧、有关系","gloss_en":"a matter or affair; to be important","sense_key":"matter"}'::jsonb
 WHERE normalized = 'matter' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/rɛst/","pos":"n.","word":"rest","example":{"en":"Let''s sit down and rest for a while.","cn":"我们坐下来歇一会儿吧。"},"gloss_cn":"其余、剩余;(v.)休息、安歇","gloss_en":"the remainder; to rest or relax","sense_key":"rest"}'::jsonb
 WHERE normalized = 'rest' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/kɔːt/","pos":"n.","word":"court","example":{"en":"The children were playing in the courtyard.","cn":"孩子们在院子里玩耍。"},"gloss_cn":"庭院、院子;法庭;宫廷","gloss_en":"a courtyard; a law court; a royal court","sense_key":"court"}'::jsonb
 WHERE normalized = 'court' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈoʊvər/","pos":"prep.","word":"over","example":{"en":"When summer was over, the birds flew south.","cn":"夏天一结束,鸟儿就飞向南方。"},"gloss_cn":"越过、在…上方;(adj.)结束的、完了的","gloss_en":"over, above; also finished, ended","sense_key":"over"}'::jsonb
 WHERE normalized = 'over' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/bɛnd/","pos":"v.","word":"bend","example":{"en":"She had to bend down to pick up the coin.","cn":"她得弯下腰才能捡起那枚硬币。"},"gloss_cn":"弯曲、弯身;(n.)弯道、拐弯处","gloss_en":"to bend or curve; a bend in a road","sense_key":"bend"}'::jsonb
 WHERE normalized = 'bend' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/fɪkst/","pos":"adj.","word":"fixed","example":{"en":"The shelf was fixed firmly to the wall.","cn":"那块架子牢牢地固定在墙上。"},"gloss_cn":"固定的、安装牢的","gloss_en":"fixed firmly in place; not moving","sense_key":"fix"}'::jsonb
 WHERE normalized = 'fixed' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/biːt/","pos":"v.","word":"beat","example":{"en":"Rain beat against the window all night.","cn":"雨整夜拍打着窗户。"},"gloss_cn":"打、敲、拍打;(心)跳动","gloss_en":"to strike or hit; (of the heart) to throb","sense_key":"beat"}'::jsonb
 WHERE normalized = 'beat' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/sɪŋ/","pos":"v.","word":"sing","example":{"en":"The birds sing sweetly at dawn.","cn":"破晓时鸟儿婉转地鸣唱。"},"gloss_cn":"唱歌;(鸟)鸣叫","gloss_en":"to sing; (of birds) to chirp","sense_key":"sing"}'::jsonb
 WHERE normalized = 'sing' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/wɜːrd/","pos":"n.","word":"word","example":{"en":"He remembered every word of the song.","cn":"这首歌他每个字都记得。"},"gloss_cn":"词、单词;话语","gloss_en":"a word; something said","sense_key":"word"}'::jsonb
 WHERE normalized = 'word' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/əˈsɜːt/","pos":"v.","word":"assert","example":{"en":"She asserted that she was telling the truth.","cn":"她坚称自己说的是实话。"},"gloss_cn":"断言、声称、坚称","gloss_en":"to state firmly; to declare","sense_key":"assert"}'::jsonb
 WHERE normalized = 'assert' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/keə(r)/","pos":"v.","word":"care","example":{"en":"He doesn''t care what others think.","cn":"他不在乎别人怎么想。"},"gloss_cn":"关心、在意;(n.)照料、小心","gloss_en":"to care about; also care or caution","sense_key":"care"}'::jsonb
 WHERE normalized = 'care' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈæftər/","pos":"prep.","word":"after","example":{"en":"The dog ran after the ball.","cn":"狗追着球跑。"},"gloss_cn":"在…之后;追赶、追逐(run/go after)","gloss_en":"after (in time); in pursuit of","sense_key":"after"}'::jsonb
 WHERE normalized = 'after' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈʌpraɪt/","pos":"adj.","word":"upright","example":{"en":"Keep the bottle upright so it won''t spill.","cn":"把瓶子竖直放着,免得洒出来。"},"gloss_cn":"直立的、竖直的;正直的","gloss_en":"upright, vertical; also honest","sense_key":"upright"}'::jsonb
 WHERE normalized = 'upright' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈpiːpɪŋ/","pos":"v.","word":"peeping","example":{"en":"A rabbit was peeping out from the bushes.","cn":"一只兔子从灌木丛里探出头来偷看。"},"gloss_cn":"偷看、窥视;探出、探头(peep)","gloss_en":"peeping; peering or poking out","sense_key":"peep"}'::jsonb
 WHERE normalized = 'peeping' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/kɪst/","pos":"v.","word":"kissed","example":{"en":"She kissed the baby on the cheek.","cn":"她亲了亲宝宝的脸颊。"},"gloss_cn":"亲吻、吻(kiss 过去式)","gloss_en":"kissed (past tense of kiss)","sense_key":"kiss"}'::jsonb
 WHERE normalized = 'kissed' AND target_lang = 'read-v1';

-- ② 2 张 Tom 退 A:library_word_senses(book_key=tom-sawyer),global 走主流义、Tom 仍读旧义
INSERT INTO public.library_word_senses (book_key, normalized, word, ipa, pos, sense_key, gloss_cn, gloss_en, archaic, modern_cn, modern_en, example_en, example_cn, proper) VALUES
  ('tom-sawyer','withered','wither','/ˈwɪðərd/','v.','wither-scorn','(用眼神/话语)使…羞愧、无言以对','to make sb feel ashamed with a look or words',false,'枯萎、干枯','to dry up and shrivel','Tom withered him with a look of scorn.','汤姆一个轻蔑的眼神让他无地自容。',false),
  ('tom-sawyer','squeak','squeak','/skwiːk/','v.','squeak-inform','(方言)告密、说漏嘴','(dialect) to inform on someone; to blab',false,'吱吱叫','to make a high-pitched sound','If we squeak, the gang will come after us.','我们要是走漏了口风,那帮人就会来找我们。',false)
ON CONFLICT (book_key, normalized) DO UPDATE SET
  word=EXCLUDED.word, ipa=EXCLUDED.ipa, pos=EXCLUDED.pos, sense_key=EXCLUDED.sense_key,
  gloss_cn=EXCLUDED.gloss_cn, gloss_en=EXCLUDED.gloss_en, archaic=EXCLUDED.archaic,
  modern_cn=EXCLUDED.modern_cn, modern_en=EXCLUDED.modern_en, example_en=EXCLUDED.example_en, example_cn=EXCLUDED.example_cn;

SELECT 'after' AS phase, normalized, explanation->>'pos' AS pos, explanation->>'gloss_cn' AS gloss_cn
  FROM public.phrase_explanations
 WHERE target_lang='read-v1' AND normalized IN ('withered','hang','squeak','star','sheer','trunks','sprung','spring','nurse','plant','plunder','troop','state','matter','rest','court','over','bend','fixed','beat','sing','word','assert','care','after','upright','peeping','kissed')
 ORDER BY normalized;

COMMIT;
