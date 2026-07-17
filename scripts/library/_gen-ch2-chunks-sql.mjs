// 从结构化数据生成 Tom Sawyer 第2章语块 SQL(CC亲判·不走Gemini·待Aaron/Web审)。
// 与 ch1 同规:例句必须另造简单句(禁抄原文)、literal 逐词、surface 逐字校验、可分式做 card-only。
// 跨章去重:ch1 已建的卡(如 got back)本章只补 library_chunks 索引行(画虚线),不重出卡。
import { readFileSync, writeFileSync } from "node:fs";

const KEY = "tom-sawyer", CH = 2;
const book = JSON.parse(readFileSync(`scripts/library/books/${KEY}.json`, "utf8"));
const enBySeq = new Map(), cnBySeq = new Map();
let seq = 0;
for (const ch of book.chapters) for (const p of ch.paragraphs) for (const s of p) { seq += 1; enBySeq.set(seq, s.en); cnBySeq.set(seq, s.cn ?? ""); }

// 读 ch1 SQL,取已建卡的 normalized(第2个引号字段)→ 本章同名不重出卡
const ch1Norm = new Set();
try {
  const ch1sql = readFileSync(`SQLAA/library-chunks-${KEY}-ch1.sql`, "utf8");
  const rx = /^\s*\('(?:[^']|'')*',\s*'((?:[^']|'')*)',\s*'en',\s*'read-v1'/gm;
  let m; while ((m = rx.exec(ch1sql))) ch1Norm.add(m[1].replace(/''/g, "'"));
} catch { console.warn("⚠ 未读到 ch1 SQL,跳过跨章去重"); }

const L = (w, m, n) => (n ? { word: w, meaning_cn: m, note_cn: n } : { word: w, meaning_cn: m });

const chunks = [
  { head: "go after", gloss: "去追、去找(把人/东西弄回来)", ipa: "/ɡoʊ ˈæftər/",
    note: "go after sb/sth = 追赶、去把……弄到手。",
    literal: [L("go", "去"), L("after", "追在……后面")], occ: [[230, "go after"]] },
  { head: "go on", gloss: "继续(做);接着", ipa: "/ɡoʊ ɒn/",
    note: "go on doing = 继续做;Go on! = 接着说/往下讲。",
    literal: [L("go", "进行"), L("on", "继续下去")], occ: [[306, "went on"]] },
  { head: "put down", gloss: "放下", ipa: "/pʊt daʊn/",
    note: "put sth down = 把……放下。",
    literal: [L("put", "放、置"), L("down", "向下")], occ: [[257, "put down"]] },
  { head: "bend over", gloss: "俯身、弯腰", ipa: "/bend ˈoʊvər/",
    note: "bend over = 弯下身子。",
    literal: [L("bend", "弯"), L("over", "俯过去")], occ: [[257, "bent over"]] },
  { head: "get out", gloss: "拿出、掏出", ipa: "/ɡet aʊt/",
    note: "get sth out = 把……拿出来;另有“出去”义。",
    literal: [L("get", "拿、取"), L("out", "出来")], occ: [[262, "got out"]] },
  { head: "take up", gloss: "拿起、抄起", ipa: "/teɪk ʌp/",
    note: "take up = 拿起;另有“开始从事 / 占用(时间空间)”义。",
    literal: [L("take", "拿"), L("up", "起来")], occ: [[266, "took up"]] },
  { head: "give up", gloss: "放弃、作罢", ipa: "/ɡɪv ʌp/",
    note: "give up (doing) = 放弃;认输。",
    literal: [L("give", "给"), L("up", "交出;与 give 合成“放弃”")], occ: [[263, "gave up"], [354, "gave up"]] },
  { head: "pay attention to", gloss: "注意、留意(此处否定=没理会)", ipa: "/peɪ əˈtenʃən tuː/",
    note: "pay attention to sth = 关注;paid no attention to = 压根没理。",
    literal: [L("pay", "付出"), L("attention", "注意力"), L("to", "对、向")], occ: [[306, "paid no attention to"]] },
  { head: "let on", gloss: "透露、流露;假装", ipa: "/let ɒn/",
    note: "let on = 说漏嘴、露口风;也指“假装”。",
    literal: [L("let", "让"), L("on", "显露出来")], occ: [[328, "let on"]] },
  { head: "back and forth", gloss: "来回地、前前后后", ipa: "/bæk ənd fɔːrθ/",
    note: "move back and forth = 来来回回地动。",
    literal: [L("back", "向后"), L("forth", "向前")], occ: [[335, "back and forth"]] },
  { head: "be about to", gloss: "正要、即将(做)", ipa: "/biː əˈbaʊt tuː/",
    note: "be about to do = 眼看就要做、正打算做。",
    literal: [L("about", "将要"), L("to", "去(做)")], occ: [[338, "was about to"]] },
  { head: "particular about", gloss: "对……讲究、挑剔", ipa: "/pərˈtɪkjələr əˈbaʊt/",
    note: "(be) particular about sth = 对某事很挑、很讲究。",
    literal: [L("particular", "讲究的、挑剔的"), L("about", "关于、对于")], occ: [[340, "particular about"]] },
  { head: "close by", gloss: "在近旁、旁边", ipa: "/kloʊs baɪ/",
    note: "close by = 就在附近。",
    literal: [L("close", "近的"), L("by", "在旁边")], occ: [[355, "close by"]] },
  { head: "run out of", gloss: "用完、耗尽", ipa: "/rʌn aʊt əv/",
    note: "run out of sth = 把……用光了。",
    literal: [L("run out", "耗尽"), L("of", "……的")], occ: [[361, "run out of"]] },
  { head: "say to oneself", gloss: "自言自语、心里想", ipa: "/seɪ tuː wʌnˈself/",
    note: "say to oneself = 心中默念、自言自语。",
    literal: [L("say", "说"), L("to", "对"), L("oneself", "自己(此处 himself)")], occ: [[362, "said to himself"]] },
  { head: "after all", gloss: "毕竟、终究;到头来", ipa: "/ˈæftər ɔːl/",
    note: "after all = 毕竟(讲道理);或“终究还是”。",
    literal: [L("after", "在……之后"), L("all", "一切;合成“毕竟”")], occ: [[362, "after all"]] },
  { head: "in order to", gloss: "为了、以便", ipa: "/ɪn ˈɔːrdər tuː/",
    note: "in order to do = 为了做……(表目的)。",
    literal: [L("in order", "为了"), L("to", "去(做)")], occ: [[363, "in order to"]] },
  { head: "and so on", gloss: "等等、诸如此类", ipa: "/ənd soʊ ɒn/",
    note: "…and so on = ……等等(列举收尾)。",
    literal: [L("and", "和"), L("so on", "以此类推")], occ: [[357, "and so on"]] },
  { head: "make one's mouth water", gloss: "让人垂涎、直流口水", ipa: "/meɪk maʊθ ˈwɔːtər/",
    note: "make one's mouth water = 馋得流口水;mouth waters = 垂涎。",
    literal: [L("mouth", "嘴"), L("water", "(动词)分泌口水、流涎")], occ: [[312, "mouth watered"]] },
  { head: "never mind", gloss: "别在意、别管;没关系", ipa: "/ˈnevər maɪnd/",
    note: "Never mind = 算了、别在意;原文 never you mind 是加强语气的变体。",
    literal: [L("never", "绝不"), L("mind", "在意、介意")], occ: [[237, "never you mind"]] },
  { head: "be obliged to", gloss: "不得不、被迫(做)", ipa: "/biː əˈblaɪdʒd tuː/",
    note: "be obliged to do = 不得不做(较正式)。",
    literal: [L("obliged", "被迫的、有义务的"), L("to", "去(做)")], occ: [[364, "is obliged to"]] },
  { head: "change (alter) one's mind", gloss: "改变主意", ipa: "/tʃeɪndʒ maɪnd/",
    note: "change one's mind = 改主意;原文用 altered=changed。",
    literal: [L("change", "改变(原文 alter 同义)"), L("mind", "主意、想法")], occ: [[338, "altered his mind"]] },
  { head: "draw near", gloss: "(渐渐)靠近、临近", ipa: "/drɔː nɪr/",
    note: "draw near = 走近、临近(略文雅)。",
    literal: [L("draw", "移动、行进"), L("near", "靠近")], occ: [[270, "drew near"]] },

  // 可分式:出处 [261] make a world of fun of him,连续匹配标不了 → card-only。
  { head: "make fun of", gloss: "取笑、拿……开玩笑", ipa: "/meɪk fʌn əv/",
    note: "make fun of sb = 取笑某人。ch2 出处为分离式(make a world of fun of),故本章不画虚线,卡入库待后续连续出处点亮。",
    literal: [L("make", "做出"), L("fun", "取乐、玩笑"), L("of", "拿……(取乐)")],
    cardOnly: true, key: "make fun of", exSeq: 261 },

  // 跨章去重:ch1 已建 got back 卡 → 本章仅补索引(画虚线),不重出卡。
  { head: "get back", gloss: "回到、返回", ipa: "/ɡet bæk/",
    note: "get back = 回来(ch1 已建卡)。",
    literal: [L("get", "到达"), L("back", "回、返")], occ: [[230, "got back"]] },
];

// 例句:另造简单新句(禁抄原文),按 head 索引。
const EX = {
  "go after": ["The dog ran off, so I went after it.", "狗跑了,我就去追它。"],
  "go on": ["Please go on with your story.", "请接着把故事讲下去。"],
  "put down": ["She put down her bag and sat on the sofa.", "她放下包,坐到沙发上。"],
  "bend over": ["He bent over to tie his shoes.", "他弯腰系鞋带。"],
  "get out": ["He got out his phone to take a photo.", "他掏出手机拍照。"],
  "take up": ["She took up her pen and began to write.", "她抄起笔就写了起来。"],
  "give up": ["Don't give up—you're almost there!", "别放弃,你就快成了!"],
  "pay attention to": ["Pay attention to the teacher.", "注意听老师讲。"],
  "let on": ["Don't let on that we already know.", "别露出我们已经知道了。"],
  "back and forth": ["The swing moved back and forth.", "秋千来回摆动。"],
  "be about to": ["I was about to leave when the phone rang.", "我正要走,电话就响了。"],
  "particular about": ["She's very particular about her food.", "她对吃的很挑剔。"],
  "close by": ["There's a little shop close by.", "旁边就有家小店。"],
  "run out of": ["We've run out of milk.", "我们的牛奶用完了。"],
  "say to oneself": ["\"I can do this,\" she said to herself.", "“我能行,”她心里对自己说。"],
  "after all": ["Don't be angry—he's only a child, after all.", "别生气,他毕竟还是个孩子。"],
  "in order to": ["She got up early in order to catch the train.", "她早起是为了赶火车。"],
  "and so on": ["We bought apples, oranges, and so on.", "我们买了苹果、橘子等等。"],
  "make one's mouth water": ["The smell of pizza made my mouth water.", "披萨的香味让我直流口水。"],
  "never mind": ["Never mind, it's not important.", "没关系,这不要紧。"],
  "be obliged to": ["He was obliged to sell his old car.", "他不得不卖掉了旧车。"],
  "change (alter) one's mind": ["She changed her mind at the last minute.", "她最后一刻改了主意。"],
  "draw near": ["As winter drew near, the days grew short.", "冬天临近,白天变短了。"],
  "make fun of": ["The kids made fun of his funny hat.", "孩子们取笑他那顶滑稽的帽子。"],
  "get back": ["We got back home just before dark.", "我们赶在天黑前回到了家。"],
};

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim();
const normSent = (s) => (s || "").toLowerCase().replace(/[’]/g, "'").replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ");

// 校验:surface 逐字在出处句
let errs = 0;
for (const c of chunks) { if (c.cardOnly) continue; for (const [sq, surf] of c.occ) {
  const sent = normSent(enBySeq.get(sq));
  if (!(` ${sent} `).includes(` ${norm(surf)} `)) { console.error(`✗ seq ${sq}: 找不到 "${surf}" | 句: ${sent}`); errs++; }
} }
if (errs) { console.error(`\n${errs} 处 surface 不在正文,先改数据。`); process.exit(1); }

// 校验:例句存在且不等于任一出处原文句
let exErrs = 0;
for (const c of chunks) {
  const head = c.head || c.occ?.[0]?.[1];
  const ex = EX[head];
  if (!ex || !ex[0] || !ex[1]) { console.error(`✗ ${head}: 缺例句`); exErrs++; continue; }
  const srcSeqs = c.cardOnly ? [c.exSeq] : c.occ.map(([sq]) => sq);
  for (const sq of srcSeqs) if (normSent(ex[0]) === normSent(enBySeq.get(sq))) { console.error(`✗ ${head}: 例句=原文 seq ${sq}`); exErrs++; }
}
if (exErrs) { console.error(`\n${exErrs} 处例句问题。`); process.exit(1); }

// 生成
const sqlEsc = (s) => String(s).replace(/'/g, "''");
const cardRows = [], idxRows = [];
const seenNorm = new Set();
let dedupCards = 0;
for (const c of chunks) {
  const head = c.head || c.occ[0][1];
  if (c.cardOnly) {
    const n = norm(c.key);
    if (!seenNorm.has(n) && !ch1Norm.has(n)) {
      seenNorm.add(n);
      const expl = { word: head, pos: "词块", ipa: c.ipa || "", gloss_cn: c.gloss,
        example: { en: EX[head][0], cn: EX[head][1] }, note: c.note, kind: "chunk", src_seqs: [c.exSeq], literal: c.literal };
      cardRows.push(`  ('${sqlEsc(head)}', '${sqlEsc(n)}', 'en', 'read-v1', '${sqlEsc(JSON.stringify(expl))}'::jsonb)`);
    }
    continue;
  }
  const bySurf = new Map();
  for (const [sq, surf] of c.occ) {
    const n = norm(surf);
    if (!bySurf.has(n)) bySurf.set(n, { seqs: [] });
    bySurf.get(n).seqs.push(sq);
    idxRows.push({ term: n, seq: sq });
  }
  for (const [n, { seqs }] of bySurf) {
    if (seenNorm.has(n)) continue;
    seenNorm.add(n);
    if (ch1Norm.has(n)) { dedupCards++; continue; } // ch1 已建卡 → 仅索引,不重出卡
    const expl = { word: head, pos: "词块", ipa: c.ipa || "", gloss_cn: c.gloss,
      example: { en: EX[head][0], cn: EX[head][1] }, note: c.note, kind: "chunk", src_seqs: seqs, literal: c.literal };
    cardRows.push(`  ('${sqlEsc(head)}', '${sqlEsc(n)}', 'en', 'read-v1', '${sqlEsc(JSON.stringify(expl))}'::jsonb)`);
  }
}
const ix = idxRows.map((r) => `  ((SELECT id FROM public.library_books WHERE book_key='${KEY}'), ${CH}, '${sqlEsc(r.term)}', ${r.seq}, true)`).join(",\n");

const sql = `-- ============================================================================
-- 图书馆精读语块 · 汤姆·索亚历险记 第 ${CH} 章(CC亲判·不走Gemini·例句另造·待Aaron/Web审后跑)
-- 与 REVIEWAA/图书馆词表/tom-sawyer-chunks-ch2-review.md 一致。跨章去重:ch1 已建卡不重出(仅补索引)。
-- read-v1 卡 ${cardRows.length} 张(去掉 ch1 已建 ${dedupCards} 张)/ library_chunks 索引 ${idxRows.length} 行。幂等 upsert。
-- ⚠️ 逐词节需 explain-phrase 已部署 literal 透传(已部署)。数据先跑不碍事。
-- ============================================================================
BEGIN;
SELECT 'before' AS phase,
  (SELECT count(*) FROM public.phrase_explanations WHERE target_lang='read-v1' AND explanation->>'kind'='chunk') AS chunk_cards,
  (SELECT count(*) FROM public.library_chunks lc JOIN public.library_books b ON b.id=lc.book_id WHERE b.book_key='${KEY}' AND lc.chapter_idx=${CH}) AS ch2_index;

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
  (SELECT count(*) FROM public.library_chunks lc JOIN public.library_books b ON b.id=lc.book_id WHERE b.book_key='${KEY}' AND lc.chapter_idx=${CH}) AS ch2_index;
COMMIT;
`;
writeFileSync(`SQLAA/library-chunks-${KEY}-ch2.sql`, sql);
console.log(`✓ SQLAA/library-chunks-${KEY}-ch2.sql — ${chunks.length} 条语块 / ${cardRows.length} 卡(ch1去重${dedupCards}) / ${idxRows.length} 索引行`);
