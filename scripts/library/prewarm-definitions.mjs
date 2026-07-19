/**
 * 图书馆精读 · 单词轻词义预生成 v3(带语境 + 缩写词 + 增量)。
 *
 * ⚠️ 释义(zh)一律由 AI 结合【出处句】生成,不抄 junior_vocab 通用释义(多义词会给错义)。
 *   音标(ipa)、词性(pos)可用 junior_vocab(不随语境变);专名跳过;虚词走内置表。
 *
 * v3 变更(2026-07-15,汤姆·索亚方言书驱动):
 *   ① normalize 先把弯撇号 U+2019 折成 ASCII '(否则 ain't/warn't 被断成 "ain t",键对不上,存了也查不中)。
 *   ② 分词器纳入缩写/方言词:弯撇号进 isWord(不进分隔符,与 TappableLine 一致)→ don't/ain't/t'other/foolin' 整词可点;
 *      剥所有格 's 判专名(tom's→tom 跳过),it's/that's 等语法缩写归虚词跳过。
 *   ③ 增量:预载库中已有 read-v1 词集,**只补缺口**,绝不重跑已审过的旧书释义(避免用本书语境覆盖别书审定义)。
 *   缓存改为单文件 <key>-defs-cache/_words.json(按词去重,sample 与 --all 共享缓存 → 不重复计费)。
 *
 * 用法:
 *   node scripts/library/prewarm-definitions.mjs tom-sawyer 1            # 单章(补该章缺口)
 *   node scripts/library/prewarm-definitions.mjs tom-sawyer --all        # 全书缺口:每章review + 合并SQL
 *   node scripts/library/prewarm-definitions.mjs tom-sawyer --sample 25  # 样本批:全书缩写词 + 第25章内容词,出审稿md,不出全量SQL
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env", "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => {
    const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
  }));
const SUP = env.VITE_SUPABASE_URL, ANON = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const H = { apikey: ANON, Authorization: `Bearer ${ANON}`, "Content-Type": "application/json" };
const DEFINE_URL = `${SUP}/functions/v1/define-words`;
const TARGET_LANG = "read-v1", AI_BATCH = 20;   // 20 而非 30:批越大 AI 越易错位串味
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const key = process.argv[2], arg = process.argv[3], arg2 = process.argv[4];
if (!key || !arg) { console.error("用法: node scripts/library/prewarm-definitions.mjs <book_key> <chapter|--all|--sample <ch>>"); process.exit(1); }
const isSample = arg === "--sample";
if (isSample && !arg2) { console.error("--sample 需指定一个 Huck 口语密集章号,如: --sample 25"); process.exit(1); }

// ① 弯撇号折叠(与 explain-phrase edge 的 normalize 保持一致)。
const foldApos = (s) => String(s).replace(/’/g, "'");
const normalize = (s) => foldApos(s).toLowerCase().replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim();
const sqlEsc = (s) => String(s).replace(/'/g, "''");
// ② 分词:弯撇号进 isWord、不进分隔符 → 缩写词整词保留(返回小写表面形,弯撇号保持原样;normalize 时再折叠)。
const tap = (sentence) => {
  const parts = sentence.replace(/<[^>]*>/g, "").split(/(\s+|[.,!?;:"'()\-—…])/g).filter((p) => p !== "");
  const out = []; for (const p of parts) if (/^[A-Za-z][A-Za-z'’\-]*$/.test(p)) out.push(p.toLowerCase());
  return out;
};
const GRAMMAR = {
  the:["art.","那/这个"], a:["art.","一个"], an:["art.","一个"], of:["prep.","……的"], to:["prep.","到;向"],
  in:["prep.","在……里"], on:["prep.","在……上"], at:["prep.","在(某处/时)"], and:["conj.","和;而且"], or:["conj.","或者"],
  but:["conj.","但是"], for:["prep.","为了;给"], with:["prep.","和;用"], as:["prep.","作为;像"], by:["prep.","通过;在旁"],
  from:["prep.","从"], this:["pron.","这个"], that:["pron.","那个"], these:["pron.","这些"], those:["pron.","那些"],
  is:["v.","是"], are:["v.","是"], was:["v.","是(过去)"], were:["v.","是(过去)"], be:["v.","是"], been:["v.","是(过去分词)"],
  am:["v.","是"], he:["pron.","他"], she:["pron.","她"], it:["pron.","它"], they:["pron.","他们"], we:["pron.","我们"],
  you:["pron.","你/你们"], his:["pron.","他的"], her:["pron.","她的;她"], its:["pron.","它的"], their:["pron.","他们的"],
  our:["pron.","我们的"], your:["pron.","你的"], not:["adv.","不"], no:["adv.","不;没有"], do:["v.","做(助动)"],
  does:["v.","做(助动)"], did:["v.","做(过去/助动)"], has:["v.","有"], have:["v.","有"], had:["v.","有(过去)"],
  will:["v.","将;会"], would:["v.","将;会"], can:["v.","能"], could:["v.","能"], so:["adv.","所以;这么"], if:["conj.","如果"],
  then:["adv.","然后"], than:["conj.","比"], there:["adv.","那里"], here:["adv.","这里"], where:["adv.","哪里"],
  when:["adv.","当……时"], who:["pron.","谁"], what:["pron.","什么"], which:["pron.","哪个"], how:["adv.","怎样"],
  why:["adv.","为什么"], all:["adj.","所有的"], any:["adj.","任何的"], some:["adj.","一些"],
};

const book = JSON.parse(readFileSync(`scripts/library/books/${key}.json`, "utf8"));
const flat = []; let seq = 0;
for (const ch of book.chapters) for (const p of ch.paragraphs) for (const s of p) { seq += 1; flat.push({ seq, ci: ch.idx, en: s.en }); }

const capMid = new Map(), lowMid = new Map();
for (const s of flat) (s.en.match(/[A-Za-z]+(?:['’][A-Za-z]+)?/g) || []).forEach((t, i) => {
  if (i === 0) return; const lw = t.toLowerCase();
  if (/^[A-Z]/.test(t)) capMid.set(lw, 1); else lowMid.set(lw, 1);
});
const isProper = (lw) => capMid.has(lw) && !lowMid.has(lw) && lw !== "i";

// 拟声/语气词等非真词(不是词典词):SH'T!=嘘(别出声),AI 会误当脏话"shit"。直接跳过不入库。
const NONWORD = new Set(["sh't", "s'h't", "sh", "'sh", "sh'", "'sh't", "hm", "h'm", "hi'st", "'st"]);
// X'll/X'd/X've/X're 中【标准】的 base(we'll/he'd/they're…保留);其余(reckon'll/god'll/nobody'll…)是两词连读硬拼的怪词,剔除。
const STD_CONTR_BASE = new Set(["i", "you", "he", "she", "it", "we", "they", "that", "this", "there", "what", "who", "how", "where", "when", "which"]);

/** 内容词判定:去虚词/专名/专名所有格/拟声词/连读怪词。返回 true=要讲解的内容词。 */
function isContent(w) {
  const f = foldApos(w);
  if (f.length < 2 && f !== "a") return false;
  if (NONWORD.has(f)) return false;                 // 拟声/语气词(sh't 等)不入库
  const m = f.match(/^(.+?)'(ll|d|ve|re)$/);        // reckon'll/god'll/nobody'll… 非标准 base → 剔除
  if (m && !STD_CONTR_BASE.has(m[1])) return false;
  const bare = f.replace(/'s$/, "").replace(/'$/, ""); // 剥 's 与 尾撇号(walters')判专名
  if (GRAMMAR[f] || GRAMMAR[bare]) return false;    // 虚词 + it's/that's/he's 等语法缩写(低价值)跳过
  if (isProper(f) || isProper(bare)) return false;  // 专名 + tom's/polly's/walters' 专名所有格跳过
  return true;
}

// —— 儿童读物红线:中译零脏字 + 去残留词性标签([名]/n. 等)。委婉咒骂(dern/dog'd/hang…)保留温和义(Aaron 确认保留)。
const clean = (s) => {
  let t = String(s ?? "");
  t = t.replace(/^\s*[\[［【][^\]］】]*[\]］】]\s*/, "");                 // 去开头 [名]/[动] 等残留标签
  t = t.replace(/^\s*(n|v|vt|vi|adj|adv|prep|conj|pron|art|num|int)\.\s*/i, ""); // 去开头 n./v. 等
  for (const [a, b] of [["真他妈", "真"], ["他妈的", ""], ["他妈", ""], ["妈的", ""], ["特么", ""], ["尼玛", ""],
    ["卧槽", "哎呀"], ["我操", "哎呀"], ["狗屎", "糟糕"], ["狗屁", "胡话"], ["傻逼", "笨蛋"], ["傻B", "笨蛋"],
    ["滚蛋", "走开"], ["婊子", "坏女人"], ["日了", "见了"]]) t = t.split(a).join(b);
  return t.replace(/\s{2,}/g, " ").trim();
};

// 所有格 IPA:从 base 音标 + 's 发音规则推导(不用 AI 给的 "form is" 分离音)。
// 's 读音:词尾咝音(s/x/z/ce/ge/sh/ch)→/ɪz/;清辅音(p/t/k/f/th)→/s/;其余→/z/。base 音已以 z/s 结尾则不叠加。
const possIpa = (base) => {
  let ip = baseIpaMap.get(normalize(base)) || (base.endsWith("s") ? baseIpaMap.get(normalize(base.slice(0, -1))) : null);
  if (!ip) return "";
  ip = ip.trim().replace(/^\/|\/$/g, "").split(/[,，/]/)[0].replace(/\s+/g, "");  // 双变体音标取第一个
  if (!ip) return "";
  if (/[zs]$/.test(ip)) return `/${ip}/`;
  const suf = /(s|x|z|ce|se|ge|sh|ch|zz|ss)$/i.test(base) ? "ɪz" : /(p|t|k|f|gh|th|ph)$/i.test(base) ? "s" : "z";
  return `/${ip}${suf}/`;
};

// —— 's 判定:所有格('的)vs is/has 缩写。所有格用 base 义确定性拼"…的";is/has(storm's coming)太易错→剔除。
const isPoss = (w) => /'s$/.test(foldApos(w)) || /s'$/.test(foldApos(w));
const possBase = (w) => foldApos(w).replace(/'s$/, "").replace(/s'$/, "s").replace(/'$/, "");
// X's 后跟这些 = is/has 缩写(所有格后只会跟名词,绝不跟介词/谓语词)→ 太易错,剔除不收录。
const ISHAS_NEXT = new Set(["a", "an", "the", "been", "got", "gone", "coming", "going", "come", "goin", "comin", "gettin",
  "here", "there", "just", "only", "always", "already", "never", "about", "back", "away",
  "in", "on", "over", "up", "out", "off", "down", "at", "to", "for", "with", "into", "from",
  "ready", "done", "dead", "right", "wrong", "all", "so", "too", "no", "not", "gonna"]);
const isHasCtx = (w, ctx) => {
  const s = foldApos(ctx || "").toLowerCase(), surf = foldApos(w).toLowerCase();
  const i = s.indexOf(surf); if (i < 0) return false;
  const after = (s.slice(i + surf.length).trim().split(/[^a-z']+/)[0]) || "";
  return ISHAS_NEXT.has(after) || /ing$/.test(after);   // X's coming/eating/over/in… = is/has
};
let baseGlossMap = new Map();   // normalized → gloss_cn(read-v1 + 本轮生成),给所有格拼"…的"
let baseIpaMap = new Map();     // normalized → ipa(read-v1 + 本轮生成),给所有格推导音标
// 这些 base 的 's 不是干净的名词所有格:let's=let us、mine's/nothing's=X is、one's/other's 代词所有格拼"…的"很别扭 → 不收录。
const NONPOSS_BASE = new Set(["let", "mine", "one", "other", "others", "i", "nothing", "something", "anything",
  "everything", "nobody", "somebody", "anybody", "everybody", "none", "aught", "each"]);
// base 的义是感叹词(lord→"天哪")→ 所有格"X的"变废话("天哪的"),不收录。
const INTERJ_GLOSS = new Set(["天哪", "天啊", "我的天", "哎呀", "见鬼", "该死", "唉", "哼", "呸", "啊", "哦", "嗯", "哈", "哎"]);

/** 某章:内容词(去重)→ 该章内首现出处句。 */
function chapterContent(ci) {
  const firstCtx = new Map();
  for (const s of flat) if (s.ci === ci) for (const w of tap(s.en)) {
    if (!isContent(w)) continue;
    if (!firstCtx.has(w)) firstCtx.set(w, s.en);
  }
  return firstCtx;
}

/** 全书缩写/方言词(含撇号,如 ain't/warn't/t'other/foolin')→ 全书首现出处句。 */
function contractionWords() {
  const firstCtx = new Map();
  for (const s of flat) for (const w of tap(s.en)) {
    if (!/['’]/.test(w)) continue;   // 只要含撇号的
    if (!isContent(w)) continue;
    if (!firstCtx.has(w)) firstCtx.set(w, s.en);
  }
  return firstCtx;
}

// junior/primary 只取 ipa/pos(不取释义)。
async function fetchDictIpaPos(words) {
  const map = new Map(); const uniq = [...new Set(words)]; const CH = 90;
  for (let i = 0; i < uniq.length; i += CH) {
    const inList = uniq.slice(i, i + CH).map((w) => `"${w.replace(/"/g, "")}"`).join(",");
    for (const [tbl, ipaCol] of [["junior_vocab", "phonetic"], ["primary_vocab", "ipa"]]) {
      try {
        const r = await fetch(`${SUP}/rest/v1/${tbl}?select=word,pos,${ipaCol}&order=grade.asc&word=in.(${encodeURIComponent(inList)})`, { headers: H });
        for (const row of (await r.json()) || []) {
          const w = String(row.word).toLowerCase();
          if (!map.has(w)) map.set(w, { pos: row.pos || "", ipa: row[ipaCol] || "" });
        }
      } catch { /* ignore */ }
    }
  }
  return map;
}

async function defineWords(items) {
  const r = await fetch(DEFINE_URL, { method: "POST", headers: H, body: JSON.stringify({ words: items }) });
  if (!r.ok) { const rl = r.status === 429; if (!rl) console.log(`  ❌ define-words HTTP ${r.status}`); return { results: [], rateLimited: rl }; }
  const { results, error } = await r.json();
  if (error) { const rl = error === "rate_limited"; if (!rl) console.log(`  ⚠️ ${error}`); return { results: [], rateLimited: rl }; }
  return { results: results || [], rateLimited: false };
}

// ③ 预载库中已有 read-v1 词(normalized + gloss_cn + ipa)→ 缺口判定 + 给所有格拼"…的"/推导音标。
async function fetchExistingReadV1() {
  const set = new Set(); const gloss = new Map(); const ipa = new Map(); let offset = 0; const page = 1000;
  for (;;) {
    const url = `${SUP}/rest/v1/phrase_explanations?select=normalized,explanation&target_lang=eq.${TARGET_LANG}&limit=${page}&offset=${offset}`;
    const r = await fetch(url, { headers: H });
    if (!r.ok) { console.error("预载 read-v1 失败 HTTP", r.status); break; }
    const rows = await r.json(); if (!Array.isArray(rows)) break;
    for (const row of rows) {
      set.add(row.normalized);
      const g = row.explanation && row.explanation.gloss_cn; if (g) gloss.set(row.normalized, g);
      const p = row.explanation && row.explanation.ipa; if (p) ipa.set(row.normalized, p);
    }
    if (rows.length < page) break; offset += page;
  }
  return { set, gloss, ipa };
}

const CACHE_DIR = `scripts/library/books/${key}-defs-cache`;
mkdirSync(CACHE_DIR, { recursive: true });
const CACHE_FILE = `${CACHE_DIR}/_words.json`;                 // 单文件,按表面词去重,跨 sample/--all 共享
const wordCache = existsSync(CACHE_FILE) ? JSON.parse(readFileSync(CACHE_FILE, "utf8")) : {};
let aiDown = false;   // 熔断:连续限流后置真,本轮不再调 AI,直接用现有缓存出 SQL(缺口留待配额恢复补)

// 归一:按【AI 回显的词】把结果对回我们的输入词(不信 AI 的 index —— 大批次里 index 会错位串味,
// 曾把 gang's 的释义安到 b'long 上)。匹配不上就留空(下轮重试/走实时),绝不臆测。
const normW = (s) => foldApos(s).toLowerCase().trim();
const stripApos = (s) => normW(s).replace(/['\s]+/g, "");

/** 生成一批词(带语境),用缓存;写回 wordCache;返回 AI 调用次数。 */
async function genWords(items) { // items: [{word, context}]
  const todo = items.filter((it) => !wordCache[it.word]);
  let calls = 0, consecRL = 0;
  for (let i = 0; i < todo.length; i += AI_BATCH) {
    if (aiDown) break;                        // 熔断后:余下缺口留空,快速收尾出 SQL
    const batch = todo.slice(i, i + AI_BATCH);
    // 429 退避重试:配额被限时,等 8/20s 再试;连续 3 批仍限流 → 熔断本轮 AI。
    let res = [], lastRL = false;
    for (let attempt = 0; ; attempt++) {
      const out = await defineWords(batch.map((b) => ({ word: b.word, context: b.context || "" })));
      lastRL = out.rateLimited;
      if (out.results.length || !out.rateLimited || attempt >= 2) { res = out.results; break; }
      const wait = [8000, 20000][attempt] || 20000;
      console.log(`  ⏳ 429 限流,等 ${wait / 1000}s 重试(第 ${attempt + 1} 次)`);
      await sleep(wait);
    }
    calls++;
    if (!res.length && lastRL) {
      if (++consecRL >= 3) { aiDown = true; console.log("  ⛔ 连续限流,本轮停止 AI 生成,用现有缓存出 SQL(缺口留待配额恢复后补跑 --all)"); }
    } else consecRL = 0;
    const byWord = new Map(), byStrip = new Map();
    for (const g of res) {
      const gw = normW(g.word || ""); if (gw && !byWord.has(gw)) byWord.set(gw, g);
      const gs = stripApos(g.word || ""); if (gs && !byStrip.has(gs)) byStrip.set(gs, g);
    }
    for (const it of batch) {
      const g = byWord.get(normW(it.word)) || byStrip.get(stripApos(it.word)); // 词匹配 + 撇号无关兜底(b'long≈blong)
      if (!g) continue;   // AI 没回这个词(或改写了拼写)→ 不臆测,留空
      wordCache[it.word] = { pos: g.pos || "", ipa: g.ipa || "", gloss_cn: g.gloss_cn || "", ex_en: g.example_en || "", ex_cn: g.example_cn || "" };
    }
    writeFileSync(CACHE_FILE, JSON.stringify(wordCache, null, 2));
    if (i + AI_BATCH < todo.length && !aiDown) await sleep(1200);
  }
  return calls;
}

/** 查 base 的中文义(read-v1 或本轮生成);boys→boy 单复兜底。 */
function baseGloss(base) {
  return baseGlossMap.get(normalize(base))
    || (base.endsWith("s") ? baseGlossMap.get(normalize(base.slice(0, -1))) : null) || null;
}

/** 把一个词组装成一行(轻卡)。所有格确定性拼"…的";is/has 's 剔除;中译洗脏字。 */
function makeCard(w, dict, ctx) {
  const surface = foldApos(w);   // 存 ASCII 表面形(ain't 而非弯撇号)
  const d = dict.get(w) || {};
  if (isPoss(w)) {
    const base = possBase(w);
    if (NONPOSS_BASE.has(base)) return null;         // let's/mine's/one's… 非干净名词所有格,不收录
    if (isHasCtx(w, ctx)) return null;              // storm's over = storm is → 太易错,不收录
    const bg = baseGloss(base);
    if (!bg) return null;                            // 查不到 base 义 → 不臆造,不收录
    const bgFirst = clean(bg).split(/[；;，,、。.!?！?（(]/)[0].trim();  // 取 base 首义、去括号注/句点/词性标签
    if (!bgFirst || INTERJ_GLOSS.has(bgFirst)) return null;   // 空 或 感叹词义(lord's→"天哪的")→ 不收录
    return { word: surface, norm: normalize(w), expl: {
      word: surface, pos: "n.(所有格)", ipa: possIpa(base),   // 从 base 音标推导所有格音标(不用 AI 的 "X is" 分离音)
      gloss_cn: bgFirst + "的", example: null } };     // 确定性:释义=base首义+的,不给可能矛盾的例句
  }
  const ai = wordCache[w]; if (!ai || !ai.gloss_cn) return null;
  return { word: surface, norm: normalize(w), expl: {
    word: surface, pos: ai.pos || d.pos || "", ipa: d.ipa || ai.ipa || "",
    gloss_cn: clean(ai.gloss_cn),
    example: ai.ex_en ? { en: ai.ex_en, cn: clean(ai.ex_cn || "") } : null } };
}

function esc(s) { return String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " "); }
function reviewTable(cards, ctx) {
  let md = `| # | 词 | 词性 | 音标 | 中文(本句语境) | 例句 | 出处英文原句 |\n|---|---|---|---|---|---|---|\n`;
  cards.forEach((c, i) => {
    const ex = c.expl.example ? `${esc(c.expl.example.en)} / ${esc(c.expl.example.cn)}` : "";
    md += `| ${i + 1} | **${esc(c.expl.word)}** | ${esc(c.expl.pos)} | ${esc(c.expl.ipa)} | ${esc(c.expl.gloss_cn)} | ${ex} | ${esc((ctx.get(c.word0) || "").slice(0, 70))} |\n`;
  });
  return md;
}

function writeSQL(rows, suffix) {
  const values = rows.map((r) => `  ('${sqlEsc(r.word)}', '${sqlEsc(r.norm)}', 'en', '${TARGET_LANG}', '${sqlEsc(JSON.stringify(r.expl))}'::jsonb)`).join(",\n");
  const sql = `-- 图书馆精读 单词轻词义(带语境·含缩写)· ${book.title || key} · ${rows.length} 词(增量:只补缺口)
-- ⚠️ 释义由 AI 结合出处句生成。幂等 upsert(normalized,target_lang)。只含库中原本没有的词(不覆盖已审旧义)。
BEGIN;
INSERT INTO public.phrase_explanations (phrase, normalized, source_lang, target_lang, explanation)
VALUES
${values}
ON CONFLICT (normalized, target_lang) DO UPDATE SET phrase=EXCLUDED.phrase, explanation=EXCLUDED.explanation, updated_at=now();
COMMIT;
`;
  writeFileSync(`SQLAA/library-dict-${key}-${suffix}.sql`, sql);
}

(async () => {
  const existing = await fetchExistingReadV1();
  baseGlossMap = new Map(existing.gloss);              // 所有格拼"…的"用:先装库中已有词义
  baseIpaMap = new Map(existing.ipa);                  // 所有格推导音标用:先装库中已有音标
  console.log(`库中已有 read-v1 词:${existing.set.size}(这些不重跑)\n`);
  const gapNew = (w) => !existing.set.has(normalize(w));   // 只留库里没有的缺口词
  const mergeRunGlosses = () => { for (const [k, v] of Object.entries(wordCache)) { if (v.gloss_cn) baseGlossMap.set(normalize(k), v.gloss_cn); if (v.ipa) baseIpaMap.set(normalize(k), v.ipa); } };

  // ---- 样本批:全书缩写词 + 指定章内容词(去已有),出审稿md + SAMPLE sql(不动全量)----
  if (isSample) {
    const huckCh = Number(arg2);
    const contr = contractionWords();
    const chap = chapterContent(huckCh);
    const isPoss = (w) => /['’]s$/.test(w);          // 以 's 结尾 = 多为所有格(自明,略审)
    const contrAll = [...contr.keys()].filter(gapNew);
    const dialWords = contrAll.filter((w) => !isPoss(w));   // ★ 真缩写/方言(ain't/warn't/t'other/an'/foolin'…)
    const possWords = contrAll.filter(isPoss);              // 所有格(man's/boy's…)
    const chapWords = [...chap.keys()].filter((w) => gapNew(w) && !contr.has(w));
    const ctxOf = (w) => contr.get(w) || chap.get(w) || "";
    const all = [...contrAll, ...chapWords];
    console.log(`样本:方言缩写 ${dialWords.length} + 所有格 ${possWords.length} + 第${huckCh}章内容词 ${chapWords.length} = ${all.length}(去已有后)`);

    const dict = await fetchDictIpaPos(all);
    const calls = await genWords(all.map((w) => ({ word: w, context: ctxOf(w) })));
    mergeRunGlosses();

    const mk = (words, ctx) => words.map((w) => { const c = makeCard(w, dict, ctx.get(w) || ""); if (c) c.word0 = w; return c; }).filter(Boolean);
    const dialCards = mk(dialWords, contr);
    const possCards = mk(possWords, contr);
    const chapCards = mk(chapWords, chap);

    let md = `# 图书馆精读 单词轻词义 · **样本批**(待 Aaron/网页版审方言)· ${book.title || key}

> 目的:先审 AI 讲解方言/19世纪口语的水准,**审过再全量入库**。未落库。target_lang='${TARGET_LANG}'。
> 重点核对:**ain't**(=am/is/are not 的方言,不是"语法错误")、**warn't**(=weren't/wasn't)、**reckon**(南方口语"想/认为")、**gwyne**(=going)、**t'other**(=the other)、**'a-going'/foolin'/roun'** 等 —— AI 有没有讲成"错误用法"或漏了口语义。
> **本轮已修**:① 所有格 X's 改**确定性**拼"base义+的"(不再让 AI 把 door's 讲成"门是");is/has 缩写(storm's coming)太易错→剔除不收录。② 中译过脏字过滤器(dern/dog'd 例句不会再出现"他妈")。③ X'll 连读怪词(reckon'll/god'll…)已从词表剔除。

## ★一、真缩写/方言词(全书非所有格,共 ${dialCards.length} 个)—— **重点审这一组**
${reviewTable(dialCards, contr)}

## 二、所有格 's 结尾(共 ${possCards.length} 个,确定性"base义+的";is/has 及查不到 base 义的已剔除)
${reviewTable(possCards, contr)}

## 三、第 ${huckCh} 章内容词样本(共 ${chapCards.length} 个)
${reviewTable(chapCards, chap)}

## 四、结论请回填
- [ ] 方言组质量 OK → CC 全量入库(--all)
- [ ] 有讲歪/漏口语义 → 指出问题词,CC 调 define-words prompt 重生成样本

## 五、边界
只产文件;未落库、未改收藏/读路径、未合main、未动P0、未碰掌握表。AI 调用本次 ${calls} 次。
`;
    mkdirSync("REVIEWAA/图书馆词表", { recursive: true });
    writeFileSync(`REVIEWAA/图书馆词表/${key}-SAMPLE-defs-review.md`, md);

    const rows = [...dialCards, ...possCards, ...chapCards].map((c) => ({ word: c.word, norm: c.norm, expl: c.expl }));
    writeSQL(rows, "SAMPLE");
    console.log(`\n✓ 样本审稿 → REVIEWAA/图书馆词表/${key}-SAMPLE-defs-review.md(${rows.length} 词)`);
    console.log(`✓ 样本SQL(勿跑,待审) → SQLAA/library-dict-${key}-SAMPLE.sql`);
    console.log(`本次 AI 调用 ${calls}`);
    return;
  }

  // ---- 全量 / 单章:补缺口 ----
  const chapters = arg === "--all" ? book.chapters.map((c) => c.idx) : [Number(arg)];
  const seen = new Set();
  let totalCalls = 0; const rows = [];
  for (const ci of chapters) {
    const ctx = chapterContent(ci);
    const newWords = [...ctx.keys()].filter((w) => !seen.has(w) && gapNew(w));
    newWords.forEach((w) => seen.add(w));
    const dict = await fetchDictIpaPos(newWords);
    const calls = await genWords(newWords.map((w) => ({ word: w, context: ctx.get(w) || "" })));
    totalCalls += calls;
    mergeRunGlosses();
    const cards = [];
    for (const w of newWords) { const c = makeCard(w, dict, ctx.get(w) || ""); if (!c) continue; c.word0 = w; cards.push(c); rows.push({ word: c.word, norm: c.norm, expl: c.expl }); }

    // 每章审稿 md
    let md = `# 图书馆精读 单词轻词义(带语境·含缩写)· 待审 · ${book.title || key} 第 ${ci} 章

> 释义 AI 结合出处句生成;ipa/pos 用 junior_vocab。增量:只列库中原本没有的缺口词。未落库。target_lang='${TARGET_LANG}'。
> 本章新缺口词:**${cards.length}**(跨章去重;库中已有的不重跑)

${reviewTable(cards, ctx)}
`;
    mkdirSync("REVIEWAA/图书馆词表", { recursive: true });
    writeFileSync(`REVIEWAA/图书馆词表/${key}-ch${ci}-defs-review.md`, md);
    console.log(`  ch${ci}: 新缺口 ${cards.length}(AI 调用 ${calls})`);
  }

  const suffix = arg === "--all" ? "all" : `ch${arg}`;
  writeSQL(rows, suffix);
  console.log(`\n✓ SQLAA/library-dict-${key}-${suffix}.sql — ${rows.length} 词(缺口增量,不覆盖旧义)`);
  console.log(`✓ ${chapters.length} 章 review → REVIEWAA/图书馆词表/`);
  console.log(`缺口合计 ${rows.length};本次 AI 调用 ${totalCalls}`);
})();
