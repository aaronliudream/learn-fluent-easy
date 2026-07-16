// 从结构化数据生成 Tom Sawyer 第1章语块 SQL(28条·CC亲判·Aaron审过·方案甲带 literal)。
// 与 REVIEWAA/图书馆词表/tom-sawyer-chunks-ch1-review.md + Aaron 裁定一致。
// 卡 schema 照 prewarm-chunks.mjs:{word,pos:"词块",ipa,gloss_cn,example,note,kind:"chunk",src_seqs,literal}。
// literal[] = 逐词辅义(方案甲);LessonBody 现成渲染,edge 已加 literal 透传(待重部署)。
// 关键校验:每个 surface 必须在其 seq 句里逐字(小写)出现,否则分词器下划线不中 → 生成前硬卡。
import { readFileSync, writeFileSync } from "node:fs";

const KEY = "tom-sawyer";
const book = JSON.parse(readFileSync(`scripts/library/books/${KEY}.json`, "utf8"));
const enBySeq = new Map(), cnBySeq = new Map();
let seq = 0;
for (const ch of book.chapters) for (const p of ch.paragraphs) for (const s of p) { seq += 1; enBySeq.set(seq, s.en); cnBySeq.set(seq, s.cn ?? ""); }

const L = (w, m, n) => (n ? { word: w, meaning_cn: m, note_cn: n } : { word: w, meaning_cn: m });

// head 缺省=首个 surface;occ:[[seq, surface(小写,正文里连续出现的形)]]
const chunks = [
  { head: "play hookey", gloss: "逃学、旷课", ipa: "/pleɪ ˈhʊki/",
    note: "hookey 几乎只用在此搭配里;play 此处不是“玩”。",
    literal: [L("play", "玩、做（此处非“玩”）"), L("hookey", "逃学", "旧俚,几乎只用在 play hookey 里,单独罕见")],
    occ: [[51, "play hookey"], [54, "play hookey"], [85, "played hookey"]] },

  { head: "play tricks (on sb)", gloss: "捉弄、耍花招、恶作剧", ipa: "/pleɪ trɪks/",
    note: "常带 on sb;这里 played me tricks = 捉弄我。",
    literal: [L("play", "玩、耍（此处=施展花招）"), L("tricks", "把戏、诡计、恶作剧")],
    occ: [[40, "played me tricks"]] },

  { head: "have the heart to", gloss: "忍心（做某事）", ipa: "/hæv ðə hɑːrt tuː/",
    note: "多用否定 not have the heart to = 不忍心;这里 ain't got the heart to = 狠不下心。",
    literal: [L("have", "有（此处 got = have）"), L("heart", "心;此处=狠得下心的心肠"), L("to", "去（做）")],
    occ: [[48, "the heart to"]] },

  { head: "miss a trick", gloss: "漏算、错失机会、疏忽一着", ipa: "/mɪs ə trɪk/",
    note: "源自棋牌“漏吃一墩”;多用否定 never miss a trick = 精得很、什么都不放过。",
    literal: [L("miss", "错过、漏掉"), L("trick", "一着、一墩（牌术语）;引申=机会")],
    occ: [[76, "missed a trick"]] },

  { head: "make sure", gloss: "确保、弄确实、务必", ipa: "/meɪk ʃʊr/",
    note: "make sure (that)… / make sure of…;这里 made sure = 原以为确定。",
    literal: [L("make", "使、弄"), L("sure", "确定的、有把握的")],
    occ: [[85, "made sure"]] },

  { head: "the knack of (sth)", gloss: "窍门、诀窍", ipa: "/ðə næk əv/",
    note: "get / have the knack of (doing) sth = 摸到门道、找到巧劲。",
    literal: [L("knack", "巧劲、诀窍"), L("of", "……的")],
    occ: [[110, "the knack of"]] },

  { head: "make faces (at)", gloss: "做鬼脸、扮怪相", ipa: "/meɪk ˈfeɪsɪz/",
    note: "face 复数化才是“鬼脸”;常带 at sb。",
    literal: [L("make", "做、摆出"), L("faces", "鬼脸、怪相（复数才有此义）"), L("at", "冲着、对着")],
    occ: [[212, "made faces at"]] },

  { head: "I dare you to", gloss: "谅你不敢、有本事你就……", ipa: "/aɪ der juː tuː/",
    note: "激将套话,dare 此处=激（某人做）,不是“胆敢”。",
    literal: [L("dare", "激（某人做）、量（你不敢）"), L("to", "去（做）")],
    occ: [[156, "i dare you to"]] },

  { head: "with one hand tied behind (one's back)", gloss: "轻而易举、闭着眼都行", ipa: "/wɪð wʌn hænd taɪd bɪˈhaɪnd/",
    note: "整体习语,字面“一只手绑在背后”,极言容易。",
    literal: [L("tied", "绑住的（tie 的过去分词）"), L("behind", "在……后面")],
    occ: [[147, "with one hand tied behind"]] },

  { head: "look out for", gloss: "提防、留意、当心着", ipa: "/lʊk aʊt fɔːr/",
    note: "look out for sb/sth = 小心提防;这里 looking out for = 提防着他。",
    literal: [L("look out", "往外看;此处=当心、提防"), L("for", "盯着、为了")],
    occ: [[40, "looking out for"]] },

  { head: "put off", gloss: "拖延、搪塞、把人打发过去", ipa: "/pʊt ɔːf/",
    note: "可分开 put sb off;这里 put me off = 把我搪塞过去,≠“关掉”。",
    literal: [L("put", "放、置"), L("off", "开、离;与 put 合成“推迟/打发”")],
    occ: [[44, "put me off"]] },

  { head: "let (sth) alone", gloss: "别碰、由它去、随它", ipa: "/let əˈloʊn/",
    note: "let sth alone = 别去动它(let that jam alone = 别碰那果酱);另有 let alone = 更不用说。",
    literal: [L("let", "让、任"), L("alone", "独自;此处=不受打扰地留着")],
    occ: [[31, "let that jam alone"]] },

  { head: "let (sb) off", gloss: "放过、饶了、不罚", ipa: "/let ɔːf/",
    note: "可分开 let sb off;这里 let him off = 饶了他,≠“放炮/放掉”。",
    literal: [L("let", "让"), L("off", "脱身、免除;与 let 合成“放过”")],
    occ: [[49, "let him off"]] },

  { head: "get back", gloss: "回到、返回", ipa: "/ɡet bæk/",
    note: "get back (home) = 回来;这里 got back home = 回到家。",
    literal: [L("get", "到达、抵"), L("back", "回、返")],
    occ: [[55, "got back"]] },

  { head: "be through with", gloss: "做完、结束、了结（某事）", ipa: "/biː θruː wɪð/",
    note: "be through with sth = 把某事干完;这里 through with his part = 做完他那份。",
    literal: [L("through", "穿过;此处=完成、了结"), L("with", "对于、和")],
    occ: [[56, "through with"]] },

  { head: "pick up", gloss: "捡起、拾起", ipa: "/pɪk ʌp/",
    note: "picking up chips = 捡碎木片;pick up 另有“接人/学会/好转”等义。",
    literal: [L("pick", "拣、挑"), L("up", "起来")],
    occ: [[56, "picking up"]] },

  { head: "stick to", gloss: "坚持、固守、不变卦", ipa: "/stɪk tuː/",
    note: "stick to one = 咬定一种、不换;stick 本义“粘”,引申“黏着不放”。",
    literal: [L("stick", "粘、黏"), L("to", "于、朝")],
    occ: [[101, "stick to"]] },

  { head: "fool with", gloss: "招惹、摆弄、跟人闹", ipa: "/fuːl wɪð/",
    note: "fool 此处作动词=胡闹、瞎弄,不是名词“傻瓜”;fool with me = 惹我。",
    literal: [L("fool", "胡闹、瞎摆弄（动词）"), L("with", "和、跟")],
    occ: [[150, "fool with"]] },

  { head: "look out", gloss: "当心、小心、留神", ipa: "/lʊk aʊt/",
    note: "感叹式 Look out! = 小心!;better look out = 你给我当心点。",
    literal: [L("look", "看"), L("out", "向外;与 look 合成“警觉、当心”")],
    occ: [[194, "look out"], [208, "look out"]] },

  { head: "look back", gloss: "回头看、回顾", ipa: "/lʊk bæk/",
    note: "looking back = 回头张望;亦可引申“回想往事”。",
    literal: [L("look", "看"), L("back", "向后、回")],
    occ: [[209, "looking back"]] },

  { head: "find out", gloss: "发现、查明、弄清楚", ipa: "/faɪnd aʊt/",
    note: "find out ≠ “找到（find）”,强调“查出真相/得知”;found out where he lived = 查出他住哪。",
    literal: [L("find", "找到"), L("out", "出来;与 find 合成“查明、揭出”")],
    occ: [[211, "found out"]] },

  { head: "as far as", gloss: "就……而言、说到……（as far as … is concerned 的头）", ipa: "/æz fɑːr æz/",
    note: "常搭 as far as … is concerned 框架;此处 as far as … pleasure is concerned = 就……快乐来说。高频写作连接语。",
    literal: [L("as far as", "在……范围内;引申“就……而言”"), L("concerned", "涉及的、相关的（… is concerned = 就……来说）")],
    occ: [[111, "as far as"]] },

  { head: "face to face", gloss: "面对面、当面", ipa: "/feɪs tuː feɪs/",
    note: "face to face (with) = 正对着;这里 kept face to face = 一直脸对脸。",
    literal: [L("face", "脸、面"), L("to", "对、朝")],
    occ: [[125, "face to face"]] },

  { head: "shoulder to shoulder", gloss: "肩并肩、并肩地", ipa: "/ˈʃoʊldər tuː ˈʃoʊldər/",
    note: "字面并肩;亦引申“齐心协力”。",
    literal: [L("shoulder", "肩膀"), L("to", "对、挨")],
    occ: [[173, "shoulder to shoulder"]] },

  { head: "just in time", gloss: "正好赶上、及时", ipa: "/dʒʌst ɪn taɪm/",
    note: "just in time (to do) = 恰好来得及;这里 just in time to seize = 正好赶上抓住。",
    literal: [L("just", "恰好、正"), L("in time", "及时、来得及")],
    occ: [[19, "just in time"]] },

  { head: "take a walk", gloss: "（口语）走开、别烦我;字面：散步", ipa: "/teɪk ə wɔːk/",
    note: "此处 Aw—take a walk! 是打发人的俚语=“一边儿去”,不是字面“去散步”。",
    literal: [L("take", "去做、来一（次）"), L("walk", "散步、走一走;此处俚语=走开")],
    occ: [[160, "take a walk"]] },

  { head: "take a dare", gloss: "接受挑战、应下激将", ipa: "/teɪk ə der/",
    note: "和 I dare you to 成套;take a dare = 敢应下别人的“量你不敢”。",
    literal: [L("take", "接、应下"), L("dare", "激将、挑战（名词）")],
    occ: [[156, "take a dare"], [191, "take a dare"]] },

  // tell on:ch1 唯一出处 [183] 是分离式("tell my big brother on you"),连续匹配下划线标不了。
  // → cardOnly:入词典(供后续连续出处点亮),ch1 不出索引行/不校验。这是分词器对可分短语动词的固有边界。
  { head: "tell on (sb)", gloss: "告发、打小报告、检举", ipa: "/tel ɒn/",
    note: "tell on sb = 去告某人的状;on 让 tell 从“告诉”变“检举”。ch1 出处为分离式,故本章不画虚线。",
    literal: [L("tell", "告诉;此处=告状"), L("on", "针对;与 tell 合成“检举”")],
    cardOnly: true, key: "tell on", exSeq: 183 },
];

// 例句:另造的简单新句(严禁抄原文出处句),短/常见/易懂,演示该 chunk 典型用法。按 head 索引。
const EX = {
  "play hookey": ["The boys decided to play hookey and go fishing.", "男孩们决定逃学去钓鱼。"],
  "play tricks (on sb)": ["My little brother loves to play tricks on me.", "我弟弟老爱捉弄我。"],
  "have the heart to": ["The puppy looked so sad that I didn't have the heart to say no.", "小狗一脸可怜,我实在不忍心拒绝。"],
  "miss a trick": ["Grandma sees everything—she never misses a trick.", "奶奶什么都看在眼里,精得很,什么都瞒不过。"],
  "make sure": ["Make sure you lock the door before you leave.", "走之前务必锁好门。"],
  "the knack of (sth)": ["After a few tries she got the knack of it.", "试了几次,她就摸到窍门了。"],
  "make faces (at)": ["Stop making faces at your sister!", "别冲你妹妹做鬼脸!"],
  "I dare you to": ["I dare you to jump into the cold water.", "有本事你就跳进冷水里。"],
  "with one hand tied behind (one's back)": ["I could beat him at chess with one hand tied behind my back.", "下棋我闭着眼都能赢他。"],
  "look out for": ["Look out for cars when you cross the street.", "过马路时当心车。"],
  "put off": ["She tried to put me off with another excuse.", "她又找了个借口想把我搪塞过去。"],
  "let (sth) alone": ["Let the dog alone while it's eating.", "狗吃东西时别去碰它。"],
  "let (sb) off": ["The teacher let him off with just a warning.", "老师只是警告了一下就放过了他。"],
  "get back": ["We got back home just before it started to rain.", "我们刚到家就下雨了。"],
  "be through with": ["Are you through with your homework yet?", "你作业做完了没?"],
  "pick up": ["Please pick up the toys off the floor.", "请把地上的玩具捡起来。"],
  "stick to": ["Whatever happens, just stick to the plan.", "不管发生什么,照计划来就行。"],
  "fool with": ["You'd better not fool with me today.", "今天你最好别惹我。"],
  "look out": ["Look out! The floor is wet.", "小心!地板是湿的。"],
  "look back": ["She looked back to see who was calling her.", "她回头看是谁在叫她。"],
  "find out": ["I called the school to find out when the test is.", "我打电话给学校,问清楚考试是哪天。"],
  "as far as": ["As far as I'm concerned, the plan is fine.", "就我而言,这个计划没问题。"],
  "face to face": ["We finally got to talk face to face.", "我们终于能面对面聊了。"],
  "shoulder to shoulder": ["The two friends stood shoulder to shoulder.", "两个朋友肩并肩站着。"],
  "just in time": ["We got to the station just in time to catch the bus.", "我们正好赶到车站,搭上了那班车。"],
  "take a walk": ["When I kept bothering him, he told me to take a walk.", "我老烦他,他就叫我一边儿去。"],
  "take a dare": ["He took the dare and climbed to the top of the wall.", "他应下激将,爬到了墙头。"],
  "tell on (sb)": ["If you break it, I'll tell on you.", "你要是弄坏了,我就去告你状。"],
};

// ---- 校验:每个 surface 必须在其 seq 句里(小写)逐字出现 ----
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim();
const normSent = (s) => (s || "").toLowerCase().replace(/[’]/g, "'").replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ");
let errs = 0;
for (const c of chunks) { if (c.cardOnly) continue; for (const [sq, surf] of c.occ) {
  const sent = normSent(enBySeq.get(sq));
  if (!sent.includes(` ${norm(surf)} `.trim().length ? norm(surf) : norm(surf))) {
    // 用带空格边界的包含判断,避免子串误命中
  }
  if (!(` ${sent} `).includes(` ${norm(surf)} `)) { console.error(`✗ seq ${sq}: 找不到 "${surf}" | 句: ${sent}`); errs++; }
} }
if (errs) { console.error(`\n${errs} 处 surface 不在正文,先改数据再生成。`); process.exit(1); }

// ---- 校验:每个 chunk 必须有另造例句,且例句不得等于任一出处原文句 ----
let exErrs = 0;
for (const c of chunks) {
  const head = c.head || c.occ?.[0]?.[1];
  const ex = EX[head];
  if (!ex || !ex[0] || !ex[1]) { console.error(`✗ ${head}: 缺例句`); exErrs++; continue; }
  const srcSeqs = c.cardOnly ? [c.exSeq] : c.occ.map(([sq]) => sq);
  for (const sq of srcSeqs) {
    if (normSent(ex[0]) === normSent(enBySeq.get(sq))) { console.error(`✗ ${head}: 例句=原文出处句 seq ${sq}(必须另造)`); exErrs++; }
  }
}
if (exErrs) { console.error(`\n${exErrs} 处例句问题,修好再生成。`); process.exit(1); }

// ---- 生成 read-v1 卡(按 surface 归一化去重)+ index 行 ----
const sqlEsc = (s) => String(s).replace(/'/g, "''");
const cardRows = [], idxRows = [];
const seenNorm = new Set();
for (const c of chunks) {
  const head = c.head || c.occ[0][1];
  if (c.cardOnly) {
    const n = norm(c.key);
    if (!seenNorm.has(n)) {
      seenNorm.add(n);
      const expl = { word: head, pos: "词块", ipa: c.ipa || "", gloss_cn: c.gloss,
        example: { en: EX[head][0], cn: EX[head][1] },  // 另造简单例句,不抄原文
        note: c.note, kind: "chunk", src_seqs: [c.exSeq], literal: c.literal };
      cardRows.push(`  ('${sqlEsc(head)}', '${sqlEsc(n)}', 'en', 'read-v1', '${sqlEsc(JSON.stringify(expl))}'::jsonb)`);
    }
    continue; // 不出 index 行
  }
  const bySurf = new Map();
  for (const [sq, surf] of c.occ) {
    const n = norm(surf);
    if (!bySurf.has(n)) bySurf.set(n, { surf, seqs: [] });
    bySurf.get(n).seqs.push(sq);
    idxRows.push({ term: n, seq: sq }); // index term = 归一化小写 surface(分词器按小写匹配)
  }
  for (const [n, { surf, seqs }] of bySurf) {
    if (seenNorm.has(n)) continue;
    seenNorm.add(n);
    const src = seqs[0];
    const expl = {
      word: head, pos: "词块", ipa: c.ipa || "",
      gloss_cn: c.gloss,
      example: { en: EX[head][0], cn: EX[head][1] },  // 另造简单例句,不抄原文
      note: c.note, kind: "chunk", src_seqs: seqs, literal: c.literal,
    };
    cardRows.push(`  ('${sqlEsc(head)}', '${sqlEsc(n)}', 'en', 'read-v1', '${sqlEsc(JSON.stringify(expl))}'::jsonb)`);
  }
}
const ix = idxRows.map((r) => `  ((SELECT id FROM public.library_books WHERE book_key='${KEY}'), 1, '${sqlEsc(r.term)}', ${r.seq}, true)`).join(",\n");

const sql = `-- ============================================================================
-- 图书馆精读语块 · 汤姆·索亚历险记 第 1 章(${chunks.length} 条 · CC亲判 · Aaron审过 · 方案甲带 literal 逐词)
-- 内容与 REVIEWAA/图书馆词表/tom-sawyer-chunks-ch1-review.md + Aaron 裁定一致。
-- 前置:表已建(library-chunks-ddl.sql)+ phrase_explanations 已存在。幂等 upsert。
-- ⚠️ 方案甲逐词节要生效,需重部署 explain-phrase(已加 literal 透传,待部署)。数据先跑不碍事。
-- read-v1 卡 ${cardRows.length} 张 / library_chunks 索引 ${idxRows.length} 行。
-- ============================================================================
BEGIN;
SELECT 'before' AS phase,
  (SELECT count(*) FROM public.phrase_explanations WHERE target_lang='read-v1' AND explanation->>'kind'='chunk') AS chunk_cards,
  (SELECT count(*) FROM public.library_chunks lc JOIN public.library_books b ON b.id=lc.book_id WHERE b.book_key='${KEY}' AND lc.chapter_idx=1) AS ch1_index;

INSERT INTO public.phrase_explanations (phrase, normalized, source_lang, target_lang, explanation)
VALUES
${cardRows.join(",\n")}
ON CONFLICT (normalized, target_lang) DO UPDATE SET phrase=EXCLUDED.phrase, explanation=EXCLUDED.explanation, updated_at=now();

INSERT INTO public.library_chunks (book_id, chapter_idx, term, src_seq, is_published)
VALUES
${ix}
ON CONFLICT (book_id, chapter_idx, term, src_seq) DO NOTHING;

SELECT 'after' AS phase,
  (SELECT count(*) FROM public.phrase_explanations WHERE target_lang='read-v1' AND explanation->>'kind'='chunk') AS chunk_cards,
  (SELECT count(*) FROM public.library_chunks lc JOIN public.library_books b ON b.id=lc.book_id WHERE b.book_key='${KEY}' AND lc.chapter_idx=1) AS ch1_index;
COMMIT;
`;
writeFileSync(`SQLAA/library-chunks-${KEY}-ch1.sql`, sql);
console.log(`✓ SQLAA/library-chunks-${KEY}-ch1.sql — ${chunks.length} 条语块 / ${cardRows.length} 卡 / ${idxRows.length} 索引行`);
