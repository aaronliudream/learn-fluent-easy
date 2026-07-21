/**
 * 初中(junior)听力 TTS 预热脚本。
 *
 * 通关 finalQuiz 听力段走 hubSpeak(audio_text, 0.8) → speakKid(el:lily) → tts Edge Function 云端合成。
 * 某句"第一次被任何人播放"要付 1-3s 冷合成;合成后内容寻址 CDN 永久缓存(≈50-200ms)。
 * 本脚本把所有初中听力句子逐条 POST tts(强制冷合成、推进 CDN),跑完连第一个用户都不再冷。
 *
 * 预热键必须与真机播放一致:voiceId=el:lily(KID_VOICE_ID)、speed=0.8、accent 省略。
 *
 * 素材两路:
 *   1) DB junior_listening_items(grade=8 已灌库的真题,如 8A/U1 16 条)
 *   2) grade8.json 内联 listeningQuestions(尚未灌库的 15 单元仍走内联回退,96 句)
 *
 * 用法(anon key 即可,tts 函数允许 anon 调):
 *   VITE_SUPABASE_URL=... VITE_SUPABASE_PUBLISHABLE_KEY=... node scripts/prewarm-junior-listening.mjs
 *   可选参数: db | inline | all(默认 all)
 */
import fs from "node:fs";

const clean = (s) => (s || "").trim().replace(/^["']|["']$/g, "");
let env = "";
for (const f of [".env", ".env.local"]) { try { env += fs.readFileSync(f, "utf8") + "\n"; } catch { /* ignore */ } }
const URL = clean(process.env.VITE_SUPABASE_URL || (env.match(/VITE_SUPABASE_URL\s*=\s*(.+)/) || [])[1]);
const KEY = clean(process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY ||
  (env.match(/VITE_SUPABASE_(?:ANON|PUBLISHABLE)_KEY\s*=\s*(.+)/) || [])[1]);
if (!URL || !KEY) { console.error("缺 VITE_SUPABASE_URL / KEY"); process.exit(1); }

const TTS_URL = `${URL.replace(/\/$/, "")}/functions/v1/tts`;
const VOICE_ID = "el:lily"; // KID_VOICE_ID,必须与 speakKid 一致
// 速率从第3个参数读,默认 0.8(听音辨词/通关听力);0.85=词汇卡 VocabStage;0.7=答错慢速按钮。
const SPEED = parseFloat(process.argv[3]) || 0.8;
const CONCURRENCY = 3;      // 降并发,避开 tts Edge Function 资源上限丢词(原 6 会 fail)
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };

function uniq(arr) { return Array.from(new Set(arr.map((s) => (s || "").trim()).filter(Boolean))); }

async function collectDb() {
  const r = await fetch(`${URL}/rest/v1/junior_listening_items?select=audio_text&grade=eq.8`, { headers: H });
  if (!r.ok) { console.warn("DB 读取失败:", r.status); return []; }
  return uniq((await r.json()).map((x) => x.audio_text));
}

function collectInline() {
  const root = JSON.parse(fs.readFileSync("src/data/juniorHub/grade8.json", "utf8"));
  const units = [...root.grade8.semesters.grade8_volume1.units, ...root.grade8.semesters.grade8_volume2.units];
  return uniq(units.flatMap((u) => (u.listeningQuestions || []).map((q) => q.audio)));
}

// 听音辨词(第2关)🔊 读的是 ListenWordStage 的同源 = junior_vocab DB 的 word
// (grade+volume+unit 拉整单元词,g7=608 / g8=957)。⚠️ 必须读 DB,不能读 grade8.json
// (后者每单元仅 12 词、共 192,与运行时严重对不上 → 765 词冷、点了不响)。
// 暖全部单词,首点即在手势内 CDN 命中、不再冷。
async function fetchAllRest(path) {
  // PostgREST 默认单页有上限,按 Range 分页拉全(1000/页)。
  const out = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const to = from + PAGE - 1;
    const r = await fetch(`${URL}/rest/v1/${path}`, { headers: { ...H, Range: `${from}-${to}`, "Range-Unit": "items" } });
    if (!r.ok) { console.warn("DB 读取失败:", r.status, await r.text().catch(() => "")); break; }
    const rows = await r.json();
    out.push(...rows);
    if (rows.length < PAGE) break;
  }
  return out;
}

async function collectVocab() {
  const rows = await fetchAllRest("junior_vocab?select=word&grade=in.(7,8)");
  return uniq(rows.map((x) => x.word));
}

async function warmOne(text) {
  try {
    const res = await fetch(TTS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...H },
      body: JSON.stringify({ text, voiceId: VOICE_ID, speed: SPEED, format: "url" }),
    });
    if (!res.ok) { console.warn(`  ✗ ${res.status}: ${(await res.text()).slice(0, 100)}`); return "fail"; }
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) { const j = await res.json(); return j.cached ? "hit" : "miss"; }
    return "miss";
  } catch (e) { console.warn("  ✗", e.message); return "fail"; }
}

async function runPool(texts) {
  let i = 0, hit = 0, miss = 0, fail = 0;
  const start = Date.now();
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    while (true) {
      const idx = i++;
      if (idx >= texts.length) return;
      const r = await warmOne(texts[idx]);
      if (r === "hit") hit++; else if (r === "miss") miss++; else fail++;
      if ((idx + 1) % 20 === 0 || idx + 1 === texts.length) {
        console.log(`  [${idx + 1}/${texts.length}] hit=${hit} miss(new)=${miss} fail=${fail} (${((Date.now() - start) / 1000).toFixed(1)}s)`);
      }
    }
  }));
  return { hit, miss, fail };
}

async function main() {
  const want = process.argv[2] || "all";  // all | db | inline | vocab
  let texts = [];
  if (want === "all" || want === "db") texts.push(...(await collectDb()));
  if (want === "all" || want === "inline") texts.push(...collectInline());
  if (want === "all" || want === "vocab") texts.push(...(await collectVocab()));
  texts = uniq(texts);
  console.log(`初中 TTS 预热: ${texts.length} 条 × voiceId=${VOICE_ID} speed=${SPEED} (含听力句+听音辨词单词)`);
  if (!texts.length) { console.log("无素材,退出"); return; }
  const r = await runPool(texts);
  console.log(`\n✅ 完成 — hit(已暖)=${r.hit} miss(新合成)=${r.miss} fail=${r.fail}`);
  console.log("此后初中通关听力首播即 CDN 命中(≈50-200ms),不再冷延迟。");
}
main().catch((e) => { console.error(e); process.exit(1); });
