// fir-tree 28 张旧全局卡修正(审定稿·B改全局+2张Tom退A)。IPA 保留不动,只换 pos/gloss_cn/gloss_en/example/sense_key。
// 生成 SQLAA/library-global-cards-fix-28.sql(28 global UPDATE + 2 tom library_word_senses A)。含前后核验 + fir-tree 回读复验打印。
import { readFileSync, writeFileSync } from "node:fs";
const env = Object.fromEntries(readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")]; }));
const SUP = "https://degqpiiddkxcuzwombwp.supabase.co", KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };

// [normalized, pos, gloss_cn, gloss_en, sense_key, ex_en, ex_cn]  —— ipa 从现卡保留
const E = [
  ["withered","adj.","枯萎的、干枯发蔫的","withered; dried up and shrivelled","wither","After a week without water, the plant looked withered.","一周没浇水,那株植物看上去枯蔫了。"],
  ["hang","v.","悬挂、垂挂","to hang or be suspended from something","hang","We hang our coats on the hooks by the door.","我们把外套挂在门边的钩子上。"],
  ["squeak","v.","吱吱叫、发出尖细声","to make a short high-pitched sound","squeak","The little mouse squeaked and darted into its hole.","小老鼠吱吱一叫,窜进了洞里。"],
  ["star","n.","星、星星","a shining point of light in the night sky","star","One bright star appeared over the dark woods.","一颗明亮的星星出现在黑森林上空。"],
  ["sheer","adj.","纯粹的、十足的;(也指)陡峭的","pure, absolute; also steep","sheer","She laughed out of sheer joy.","她纯粹是出于高兴才笑起来。"],
  ["trunks","n.","树干;(复)大衣箱、大木箱","tree trunks; large storage chests","trunk","They stacked the heavy trunks up in the attic.","他们把沉重的大箱子堆在阁楼里。"],
  ["sprung","v.","跳起、涌现;(sprung up)冒出、长出","leapt; sprang up (past participle of spring)","spring","Weeds had sprung up all over the garden.","杂草在花园里到处冒了出来。"],
  ["spring","n.","春天;泉水;(v.)跳、猛地(spring up)","spring (season); a water spring; to leap","spring","In spring the whole valley turns green.","春天,整个山谷都绿了。"],
  ["nurse","n.","护士;保姆;(v.)照料","a nurse or nanny; to care for","nurse","The nurse gently looked after the sick child.","护士细心地照看生病的孩子。"],
  ["plant","n.","植物;(v.)栽种、种植","a plant; to put in the ground to grow","plant","In April the farmers plant their seeds.","四月里,农夫们把种子种下去。"],
  ["plunder","v.","掠夺、抢夺;(n.)掠夺物","to rob or loot; also stolen goods","plunder","The pirates rushed in to plunder the town.","海盗们冲进来抢劫这座城镇。"],
  ["troop","n.","一群、一队;军队;(v.)成群结队走","a group or band; troops; to move in a group","troop","A troop of children ran across the field.","一群孩子跑过田野。"],
  ["state","n.","状态、情形;国家","a condition or situation; a nation","state","The old house was in a sad state.","那座老房子破败不堪。"],
  ["matter","n.","事情、问题;(v.)要紧、有关系","a matter or affair; to be important","matter","What's the matter with your arm?","你的胳膊怎么了?"],
  ["rest","n.","其余、剩余;(v.)休息、安歇","the remainder; to rest or relax","rest","Let's sit down and rest for a while.","我们坐下来歇一会儿吧。"],
  ["court","n.","庭院、院子;法庭;宫廷","a courtyard; a law court; a royal court","court","The children were playing in the courtyard.","孩子们在院子里玩耍。"],
  ["over","prep.","越过、在…上方;(adj.)结束的、完了的","over, above; also finished, ended","over","When summer was over, the birds flew south.","夏天一结束,鸟儿就飞向南方。"],
  ["bend","v.","弯曲、弯身;(n.)弯道、拐弯处","to bend or curve; a bend in a road","bend","She had to bend down to pick up the coin.","她得弯下腰才能捡起那枚硬币。"],
  ["fixed","adj.","固定的、安装牢的","fixed firmly in place; not moving","fix","The shelf was fixed firmly to the wall.","那块架子牢牢地固定在墙上。"],
  ["beat","v.","打、敲、拍打;(心)跳动","to strike or hit; (of the heart) to throb","beat","Rain beat against the window all night.","雨整夜拍打着窗户。"],
  ["sing","v.","唱歌;(鸟)鸣叫","to sing; (of birds) to chirp","sing","The birds sing sweetly at dawn.","破晓时鸟儿婉转地鸣唱。"],
  ["word","n.","词、单词;话语","a word; something said","word","He remembered every word of the song.","这首歌他每个字都记得。"],
  ["assert","v.","断言、声称、坚称","to state firmly; to declare","assert","She asserted that she was telling the truth.","她坚称自己说的是实话。"],
  ["care","v.","关心、在意;(n.)照料、小心","to care about; also care or caution","care","He doesn't care what others think.","他不在乎别人怎么想。"],
  ["after","prep.","在…之后;追赶、追逐(run/go after)","after (in time); in pursuit of","after","The dog ran after the ball.","狗追着球跑。"],
  ["upright","adj.","直立的、竖直的;正直的","upright, vertical; also honest","upright","Keep the bottle upright so it won't spill.","把瓶子竖直放着,免得洒出来。"],
  ["peeping","v.","偷看、窥视;探出、探头(peep)","peeping; peering or poking out","peep","A rabbit was peeping out from the bushes.","一只兔子从灌木丛里探出头来偷看。"],
  ["kissed","v.","亲吻、吻(kiss 过去式)","kissed (past tense of kiss)","kiss","She kissed the baby on the cheek.","她亲了亲宝宝的脸颊。"],
];

// 2 张 Tom 退 A(library_word_senses·book_key=tom-sawyer):global 走主流义、Tom 保旧义。
const TOM = [
  // [normalized, word, ipa, pos, sense_key, book义gloss_cn, gloss_en, modern_cn, modern_en, ex_en, ex_cn]
  ["withered","wither","/ˈwɪðərd/","v.","wither-scorn","(用眼神/话语)使…羞愧、无言以对","to make sb feel ashamed with a look or words","枯萎、干枯","to dry up and shrivel","Tom withered him with a look of scorn.","汤姆一个轻蔑的眼神让他无地自容。"],
  ["squeak","squeak","/skwiːk/","v.","squeak-inform","(方言)告密、说漏嘴","(dialect) to inform on someone; to blab","吱吱叫","to make a high-pitched sound","If we squeak, the gang will come after us.","我们要是走漏了口风,那帮人就会来找我们。"],
];

const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
const jlit = (o) => `'${JSON.stringify(o).replace(/'/g, "''")}'::jsonb`;

(async () => {
  // 拉现卡:保留 ipa + word;打印回读复验(fir-tree ctx)
  const norms = E.map((e) => e[0]);
  const cur = {};
  const r = await (await fetch(`${SUP}/rest/v1/phrase_explanations?target_lang=eq.read-v1&normalized=in.(${norms.map(encodeURIComponent).join(",")})&select=normalized,explanation`, { headers: H })).json();
  for (const c of r) cur[c.normalized] = c.explanation;
  const missing = norms.filter((n) => !cur[n]);
  if (missing.length) { console.error("✗ 现卡缺失(无法保留IPA):", missing.join(",")); process.exit(1); }

  // fir-tree ctx(回读复验)
  const ft = JSON.parse(readFileSync("scripts/library/books/fir-tree.json", "utf8"));
  const ftSents = ft.chapters.flatMap((c) => c.paragraphs.flat().map((s) => s.en));
  const ftHas = (w) => ftSents.find((s) => s.toLowerCase().replace(/[^a-z']+/g, " ").split(/\s+/).includes(w));

  const updates = E.map(([n, pos, gcn, gen, sk, exen, excn]) => {
    const old = cur[n];
    const expl = { ipa: old.ipa || "", pos, word: old.word || n, example: { en: exen, cn: excn }, gloss_cn: gcn, gloss_en: gen, sense_key: sk };
    if (old.proper) expl.proper = true;
    return `UPDATE public.phrase_explanations SET explanation = ${jlit(expl)}\n WHERE normalized = ${q(n)} AND target_lang = 'read-v1';`;
  });

  const tomVals = TOM.map((t) => `  ('tom-sawyer',${q(t[0])},${q(t[1])},${q(t[2])},${q(t[3])},${q(t[4])},${q(t[5])},${q(t[6])},false,${q(t[7])},${q(t[8])},${q(t[9])},${q(t[10])},false)`).join(",\n");

  const sql = `-- ============================================================================
-- fir-tree 28 张旧全局卡修正(网页版Claude审定·B改全局主流义+2张Tom退A)。IPA 保留不动。
-- 起因:全局 read-v1 旧卡把罕见义/次要义/错词性当默认义(withered=使羞愧/after=照料/over=克服…),
--   Oz/Robinson/Tom 也在吃 → 改全局连带全修。2 张 Tom 真依赖旧义(withered=使羞愧/squeak=告密)退按书覆盖。
-- 幂等:UPDATE 现卡(不新建);tom 覆盖 ON CONFLICT DO UPDATE。BEGIN/COMMIT + 前后核验。
-- ============================================================================
BEGIN;

SELECT 'before' AS phase, normalized, explanation->>'pos' AS pos, explanation->>'gloss_cn' AS gloss_cn
  FROM public.phrase_explanations
 WHERE target_lang='read-v1' AND normalized IN (${norms.map(q).join(",")})
 ORDER BY normalized;

-- ① 28 张 global read-v1 修正(改默认义为主流义;IPA 原样保留)
${updates.join("\n")}

-- ② 2 张 Tom 退 A:library_word_senses(book_key=tom-sawyer),global 走主流义、Tom 仍读旧义
INSERT INTO public.library_word_senses (book_key, normalized, word, ipa, pos, sense_key, gloss_cn, gloss_en, archaic, modern_cn, modern_en, example_en, example_cn, proper) VALUES
${tomVals}
ON CONFLICT (book_key, normalized) DO UPDATE SET
  word=EXCLUDED.word, ipa=EXCLUDED.ipa, pos=EXCLUDED.pos, sense_key=EXCLUDED.sense_key,
  gloss_cn=EXCLUDED.gloss_cn, gloss_en=EXCLUDED.gloss_en, archaic=EXCLUDED.archaic,
  modern_cn=EXCLUDED.modern_cn, modern_en=EXCLUDED.modern_en, example_en=EXCLUDED.example_en, example_cn=EXCLUDED.example_cn;

SELECT 'after' AS phase, normalized, explanation->>'pos' AS pos, explanation->>'gloss_cn' AS gloss_cn
  FROM public.phrase_explanations
 WHERE target_lang='read-v1' AND normalized IN (${norms.map(q).join(",")})
 ORDER BY normalized;

COMMIT;
`;
  writeFileSync("SQLAA/library-global-cards-fix-28.sql", sql);
  console.log(`✓ SQLAA/library-global-cards-fix-28.sql (28 global UPDATE + 2 Tom A)`);

  // 回读复验:新 gloss vs fir-tree 出处
  console.log("\n=== 回读复验(新义 vs fir-tree 出处) ===");
  for (const [n, pos, gcn] of E) {
    const c = ftHas(n);
    console.log(`${n.padEnd(9)} [${pos}] ${gcn}`);
    console.log(`   ctx: ${c ? c.trim().slice(0, 95) : "(屈折,未直接命中)"}`);
  }
})();
