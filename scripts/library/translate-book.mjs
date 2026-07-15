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
const TARGET = "Simplified Chinese for young children (ages 6-9): short, plain, spoken sentences that are easy to read aloud; avoid formal or literary long sentences";
const BATCH = 30;
const THROTTLE_MS = 1500;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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

async function translateBatch(items) {
  const res = await fetch(TR_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON, Authorization: `Bearer ${ANON}` },
    body: JSON.stringify({ targetLanguage: TARGET, sourceLanguage: "English", items }),
  });
  if (!res.ok) { console.log(`  ❌ HTTP ${res.status}: ${(await res.text()).slice(0, 120)}`); return {}; }
  const data = await res.json();
  if (data.fallback) console.log(`  ⚠️ 降级(${data.reason}),该批保留原文待重跑`);
  return data.translations || {};
}

const key = process.argv[2];
if (!key) { console.error("用法: node scripts/library/translate-book.mjs <book_key>"); process.exit(1); }
const path = `scripts/library/books/${key}.json`;
const book = JSON.parse(readFileSync(path, "utf8"));

// 每书术语表:若存在 books/<key>.glossary.json([[word, cn], …],长/具体优先)→ 覆盖内置(Oz)表。
// 名字用词边界整词匹配,跨章一致;新作者只需给这个文件,不用改脚本。
const glossPath = `scripts/library/books/${key}.glossary.json`;
if (existsSync(glossPath)) {
  const esc = (w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  GLOSSARY = JSON.parse(readFileSync(glossPath, "utf8")).map(([w, cn]) => [new RegExp(`\\b${esc(w)}\\b`, "g"), cn]);
  console.log(`用书内术语表 ${glossPath}(${GLOSSARY.length} 条)。`);
}

const todo = [];
book.chapters.forEach((ch, ci) => ch.paragraphs.forEach((p, pi) => p.forEach((s, si) => {
  if (!s.cn) todo.push({ id: `${ci}.${pi}.${si}`, ref: s, ...mask(s.en) });
})));
if (!todo.length) { console.log("没有待翻译句子。"); process.exit(0); }
console.log(`待翻译 ${todo.length} 句,分 ${Math.ceil(todo.length / BATCH)} 批;术语表 ${GLOSSARY.length} 条。`);

let done = 0, totalMissing = 0;
for (let i = 0; i < todo.length; i += BATCH) {
  const chunk = todo.slice(i, i + BATCH);
  const tr = await translateBatch(chunk.map((t) => ({ key: t.id, text: t.masked })));
  for (const t of chunk) {
    const raw = tr[t.id];
    if (!raw) continue;
    const { cn, missing } = unmask(raw, t.map);
    t.ref.cn = cn;
    totalMissing += missing;
    done++;
  }
  writeFileSync(path, JSON.stringify(book, null, 2)); // 每批落盘,断了可续
  console.log(`  ✓ ${Math.min(i + BATCH, todo.length)}/${todo.length}${totalMissing ? ` (占位丢失累计 ${totalMissing})` : ""}`);
  if (i + BATCH < todo.length) await sleep(THROTTLE_MS);
}
console.log(`完成:${done}/${todo.length} 句已配中文${totalMissing ? `;⚠️ ${totalMissing} 个术语占位被模型丢失(需查)` : ";术语占位零丢失"} → ${path}`);
