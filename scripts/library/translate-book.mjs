/**
 * 图书馆:带「强制术语表」的整书翻译(复用 translate 边缘函数,不改共享函数)。
 * 手法:
 *   1) 翻译前把每个术语英文替换成占位符 ⟦k⟧(边缘函数会原样保留占位符);
 *   2) 送边缘函数翻译(targetLanguage 里注入"儿童向·简洁口语·好朗读"语气);
 *   3) 译文里把 ⟦k⟧ 还原成术语表钦定的中文 → 跨章绝对一致。
 * 术语表按"最长最具体优先"排序替换,避免 Lion 抢先于 Cowardly Lion 等。
 *
 * ⚠️ 只有 anon key,不写库;只改本地 JSON。译文须人工抽查(教学内容审核门)。
 * ⚠️ 儿童读物:targetLanguage 已要求简洁口语好朗读。
 * 用法:node scripts/library/translate-book.mjs <book_key>
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env", "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => {
    const i = l.indexOf("=");
    return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
  }),
);
const SUP = env.VITE_SUPABASE_URL;
const ANON = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const TR_URL = `${SUP}/functions/v1/translate`;
// 默认儿童向语气(Oz/Aesop);成书可在 books/<key>.json 里给 translate_target 覆盖(见下,读书后赋值)。
const DEFAULT_TARGET = "Simplified Chinese for young children (ages 6-9): short, plain, spoken sentences that are easy to read aloud; avoid formal or literary long sentences";
const BATCH = 30;
const THROTTLE_MS = 1500;
const MAX_RETRY = 4;            // 批次失败(HTTP错/降级/空)重试次数,退避 2s→4s→8s→16s
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const hasCJK = (s) => /[一-鿿]/.test(s || "");   // 有中日韩汉字
// 英文残留信号:cn 里有 3+ 连续英文词。专抓"降级回传英文、但术语占位还原出中文人名"这类
// 伪译文(如 "So 哈克 made pipes and filled them.")——它有汉字,骗过 hasCJK,却仍是英文。
const ENG_RUN = /[A-Za-z]{2,}(?:[ ,.'’]+[A-Za-z]{2,}){2,}/;
const looksTranslated = (cn) => hasCJK(cn) && !ENG_RUN.test(cn);   // 真译文 = 有汉字且无长英文串

// 强制术语表(最长最具体优先)。s?/Gates? 等吸收复数;占位后剩余 's 由翻译处理成"的"。
let GLOSSARY = [
  [/\bWicked Witch of the West\b/g, "西方坏女巫"],
  [/\bWicked Witch of the East\b/g, "东方坏女巫"],
  [/\bGood Witch of the North\b/g, "北方好女巫"],
  [/\bWitch of the North\b/g, "北方好女巫"],
  [/\bWicked Witch\b/g, "坏女巫"],
  [/\bGood Witch\b/g, "好女巫"],
  [/\bQueen of the Field Mice\b/g, "田鼠女王"],
  [/\bField Mice\b/g, "田鼠"],
  [/\bGuardian of the Gates?\b/g, "城门守卫"],
  [/\bWinged Monkeys\b/g, "飞猴"],
  [/\bWinged Monkey\b/g, "飞猴"],
  [/\bCowardly Lion\b/g, "胆小的狮子"],
  [/\bTin Woodman\b/g, "铁皮人"],
  [/\bEmerald City\b/g, "翡翠城"],
  [/\bGolden Cap\b/g, "金冠"],
  [/\bSilver Shoes\b/g, "银鞋"],
  [/\bHammer-Heads?\b/g, "锤头人"],
  [/\bAunt Em\b/g, "艾姆婶婶"],
  [/\bUncle Henry\b/g, "亨利叔叔"],
  [/\bWizard of Oz\b/g, "奥兹大王"],
  [/\bLand of Oz\b/g, "奥兹国"],
  [/\bChina Princess\b/g, "瓷娃娃公主"],
  [/\bChina Country\b/g, "瓷器国"],
  [/\bMunchkins?\b/g, "芒奇金人"],
  [/\bWinkies?\b/g, "温基人"],
  [/\bQuadlings?\b/g, "奎德林人"],
  [/\bKalidahs?\b/g, "卡力达"],
  [/\bDorothy\b/g, "多萝西"],
  [/\bScarecrow\b/g, "稻草人"],
  [/\bWoodman\b/g, "铁皮人"],
  [/\bGlinda\b/g, "格林达"],
  [/\bKansas\b/g, "堪萨斯"],
  [/\bQuelala\b/g, "奎拉拉"],
  [/\bGayelette\b/g, "盖耶莱特"],
  [/\bStork\b/g, "鹳鸟"],
  [/\bToto\b/g, "托托"],
  [/\bLion\b/g, "狮子"],
  [/\bOz\b/g, "奥兹大王"],
];

/** 把术语替换成占位符 ⟦k⟧,返回 {masked, map}。 */
function mask(en) {
  let s = en;
  const map = [];
  for (const [re, cn] of GLOSSARY) {
    s = s.replace(re, () => {
      const tok = `⟦${map.length}⟧`;
      map.push(cn);
      return tok;
    });
  }
  return { masked: s, map };
}
/** 还原占位符 → 钦定中文。返回 {cn, missing}(missing=模型丢失的占位符数)。 */
function unmask(cn, map) {
  let out = cn, missing = 0;
  for (let k = 0; k < map.length; k++) {
    const tok = `⟦${k}⟧`;
    if (out.includes(tok)) out = out.split(tok).join(map[k]);
    else missing++;
  }
  return { cn: out, missing };
}

// 返回 {ok, translations, reason}。ok=false 表示该批不可信(HTTP错/边缘函数降级)——
// 关键:边缘函数降级时会把英文原文当 translations 回传(fallback:true),旧版直接写进 cn、
// 造成"翻译完成"是假象(Tom Sawyer ch15-18 就是这样静默塞了 252 句英文)。现在降级一律判失败,
// 交给上层重试;绝不拿英文原文冒充译文。
async function translateBatch(items) {
  let res;
  try {
    res = await fetch(TR_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: ANON, Authorization: `Bearer ${ANON}` },
      body: JSON.stringify({ targetLanguage: TARGET, sourceLanguage: "English", items }),
    });
  } catch (e) {
    return { ok: false, translations: {}, reason: `fetch_error:${e.message}` };
  }
  if (!res.ok) {
    return { ok: false, translations: {}, reason: `http_${res.status}:${(await res.text()).slice(0, 100)}` };
  }
  const data = await res.json();
  if (data.fallback) return { ok: false, translations: {}, reason: `fallback:${data.reason}` };
  return { ok: true, translations: data.translations || {}, reason: null };
}

const key = process.argv[2];
if (!key) { console.error("用法: node scripts/library/translate-book.mjs <book_key>"); process.exit(1); }
const path = `scripts/library/books/${key}.json`;
const book = JSON.parse(readFileSync(path, "utf8"));
// 语气:成书(如鲁滨逊)在 JSON 里给 translate_target 覆盖默认儿童向;缺省则用默认。
const TARGET = book.translate_target || DEFAULT_TARGET;

// 每书术语表:若存在 books/<key>.glossary.json([[word, cn], …],长/具体优先)→ 覆盖内置(Oz)表。
// 名字用词边界整词匹配,跨章一致;新作者只需给这个文件,不用改脚本。
const glossPath = `scripts/library/books/${key}.glossary.json`;
if (existsSync(glossPath)) {
  const esc = (w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  GLOSSARY = JSON.parse(readFileSync(glossPath, "utf8")).map(([w, cn]) => [new RegExp(`\\b${esc(w)}\\b`, "g"), cn]);
  console.log(`用书内术语表 ${glossPath}(${GLOSSARY.length} 条)。`);
}

// 待译判定:英文原文含真实单词、但 cn 还不是真译文(空 / 纯英文 / 含中文名却仍是英文串)。
// 纯标点行(en 无 2+ 字母词)不误触。
const needsTx = (s) => /[A-Za-z]{2,}/.test(s.en) && !looksTranslated(s.cn);
const todo = [];
book.chapters.forEach((ch, ci) => ch.paragraphs.forEach((p, pi) => p.forEach((s, si) => {
  if (needsTx(s)) todo.push({ id: `${ci}.${pi}.${si}`, ref: s, ...mask(s.en) });
})));
if (!todo.length) { console.log("没有待翻译句子。"); process.exit(0); }
const fallbackCount = todo.filter((t) => t.ref.cn).length;
console.log(`待翻译 ${todo.length} 句(其中 ${fallbackCount} 句为旧版英文 fallback 需重译),分 ${Math.ceil(todo.length / BATCH)} 批;术语表 ${GLOSSARY.length} 条。`);

let done = 0, totalMissing = 0, failedItems = 0, failedBatches = 0;
for (let i = 0; i < todo.length; i += BATCH) {
  const chunk = todo.slice(i, i + BATCH);
  // 批次带重试:降级/HTTP错/空 都算失败,退避重试;耗尽仍失败则该批留待下次(不写英文)。
  let tr = {}, ok = false, reason = "";
  for (let attempt = 0; attempt <= MAX_RETRY; attempt++) {
    if (attempt) { await sleep(THROTTLE_MS * Math.pow(2, attempt)); console.log(`  ↻ 重试 ${attempt}/${MAX_RETRY}(${reason})`); }
    const r = await translateBatch(chunk.map((t) => ({ key: t.id, text: t.masked })));
    if (r.ok) { tr = r.translations; ok = true; break; }
    reason = r.reason;
  }
  if (!ok) {
    failedBatches++; failedItems += chunk.length;
    console.log(`  ❌ 批次 [${i}..${Math.min(i + BATCH, todo.length)}) 重试${MAX_RETRY}次仍失败(${reason})——保持未译(cn 不写英文),下次重跑`);
    if (i + BATCH < todo.length) await sleep(THROTTLE_MS);
    continue;
  }
  for (const t of chunk) {
    const raw = tr[t.id];
    if (!raw) { failedItems++; continue; }
    const { cn, missing } = unmask(raw, t.map);
    // 防御:模型若回传的不是真译文(无汉字,或含中文名却仍是英文串),判失败——绝不冒充译文。
    if (!looksTranslated(cn)) { failedItems++; continue; }
    t.ref.cn = cn;
    totalMissing += missing;
    done++;
  }
  writeFileSync(path, JSON.stringify(book, null, 2)); // 每批落盘,断了可续
  console.log(`  ✓ ${Math.min(i + BATCH, todo.length)}/${todo.length}${totalMissing ? ` (占位丢失累计 ${totalMissing})` : ""}`);
  if (i + BATCH < todo.length) await sleep(THROTTLE_MS);
}

// 收尾全书自检:凡英文有实词、cn 却不是真译文 = 仍未译,响亮报出。这是"翻译完成状态可信"的硬闸。
let stillEnglish = 0;
book.chapters.forEach((ch) => ch.paragraphs.forEach((p) => p.forEach((s) => {
  if (/[A-Za-z]{2,}/.test(s.en) && !looksTranslated(s.cn)) stillEnglish++;
})));
console.log(`完成:${done}/${todo.length} 句已配中文${totalMissing ? `;⚠️ ${totalMissing} 个术语占位被模型丢失(需查)` : ";术语占位零丢失"} → ${path}`);
if (failedItems || stillEnglish) {
  console.log(`\n⚠️⚠️ 未全部完成:失败批 ${failedBatches}、失败句 ${failedItems};全书仍有 ${stillEnglish} 句 cn 是英文(未译)。请重跑本脚本续补。`);
  process.exit(2);   // 非零退出:让"翻译完成"状态不可信时无法被误当成功
}
console.log(`✅ 全书自检通过:0 句 cn 残留英文。翻译状态可信。`);
