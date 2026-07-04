/**
 * 美语课程 第二册 · TTS 预热(no-DB,直接读 docs/american/book2/am2_l*.json)。
 * 好处:不依赖 seed 已落库,内容一造好即可暖;hash 寻址,与 speakUS 同键→真机首播即命中。
 *
 * 【hash 一致性铁律】与 prewarm-audio.mjs / src/lib/ttsClean.ts 完全同口径:
 *   accent="US" → 归一 alloy;speed 1.0(美语全程);文本先 cleanForTTS。
 *
 * 暖的素材(逐课):
 *   sentences[].text_en  → 关1 逐句 + 关8 听力(逐句播)
 *   words[].word         → 关2/3/4
 *   contrast[].us / chunks[].us → 关6 点读
 *   passage(整篇)       → 关10 听力题(speakUS 整段播,单独一条 blob,与逐句不同键)
 *
 * 用法: node scripts/american/prewarm-book2.mjs            # 暖全部 am2_l*.json
 *        node scripts/american/prewarm-book2.mjs --lesson=1 # 只暖某课
 */
import fs from "node:fs";
import path from "node:path";

const clean = (s) => (s || "").trim().replace(/^["']|["']$/g, "");
let env = "";
for (const f of [".env", ".env.local"]) { try { env += fs.readFileSync(f, "utf8") + "\n"; } catch { /* ignore */ } }
const URL = clean(process.env.VITE_SUPABASE_URL || (env.match(/VITE_SUPABASE_URL\s*=\s*(.+)/) || [])[1]);
const KEY = clean(process.env.VITE_SUPABASE_PUBLISHABLE_KEY || (env.match(/VITE_SUPABASE_(?:ANON|PUBLISHABLE)_KEY\s*=\s*(.+)/) || [])[1]);
if (!URL || !KEY) { console.error("缺 VITE_SUPABASE_URL / KEY"); process.exit(1); }

const TTS_URL = `${URL.replace(/\/$/, "")}/functions/v1/tts`;
const VOICE_ID = "alloy";
const CONCURRENCY = 3;
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };

// ── cleanForTTS:逐字节复刻 src/lib/ttsClean.ts ──
const SPEAKER_LABEL = /(^|[\r\n]+|[.?!]["'’)\]]?[ \t]+|\b\d{1,2}\.[ \t]+)([A-Z][a-zA-Z]{0,5}):[ \t]+(?=["'“‘A-Z])/g;
const SPEECH_ABBREV = [
  [/\bsth['’]s\b/gi, "something's"],
  [/\bsb['’]s\b/gi, "somebody's"],
  [/\bsth\b/gi, "something"],
  [/\bsb\b/gi, "somebody"],
  [/\betc\b\.?/gi, "et cetera"],
];
function cleanForTTS(text) {
  if (!text) return text;
  let out = text.replace(SPEAKER_LABEL, "$1").replace(SPEAKER_LABEL, "$1");
  for (const [re, rep] of SPEECH_ABBREV) out = out.replace(re, rep);
  return out;
}

const args = process.argv.slice(2);
const ONE = Number((args.find((a) => a.startsWith("--lesson=")) || "").split("=")[1]) || null;

const SRCDIR = path.join(process.cwd(), "docs/american/book2");
const files = fs.readdirSync(SRCDIR).filter((f) => /^am2_l\d+\.json$/.test(f)).sort();
const lessons = files.map((f) => JSON.parse(fs.readFileSync(path.join(SRCDIR, f), "utf8")))
  .filter((L) => !ONE || L.lesson_no === ONE);

const texts = new Set();
for (const L of lessons) {
  for (const s of L.sentences || []) texts.add(s.text_en);
  for (const w of L.words || []) texts.add(w.word);
  for (const c of L.contrast || []) texts.add(c.us);
  for (const c of L.chunks || []) texts.add(c.us);
  if (L.passage) texts.add(L.passage); // 关10 听力整篇 blob
}
const jobs = [...texts].map((t) => cleanForTTS((t || "").trim())).filter(Boolean).map((t) => ({ text: t, speed: 1.0 }));

async function warmOne(text, speed) {
  try {
    const res = await fetch(TTS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...H },
      body: JSON.stringify({ text, voiceId: VOICE_ID, speed, accent: "US", format: "url" }),
    });
    if (!res.ok) { console.warn(`  ✗ ${res.status}: ${(await res.text()).slice(0, 100)}`); return "fail"; }
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) { const j = await res.json(); return j.cached ? "hit" : "miss"; }
    return "miss";
  } catch (e) { console.warn("  ✗", e.message); return "fail"; }
}

async function main() {
  console.log(`第二册预热:${lessons.map((L) => L.id).join(", ")} · ${jobs.length} 条(含 passage 整篇)· voiceId=alloy(US) speed=1.0`);
  if (!jobs.length) { console.log("无素材,退出"); return; }
  let i = 0, hit = 0, miss = 0, fail = 0; const start = Date.now();
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    while (true) {
      const idx = i++; if (idx >= jobs.length) return;
      const r = await warmOne(jobs[idx].text, jobs[idx].speed);
      if (r === "hit") hit++; else if (r === "miss") miss++; else fail++;
      if ((idx + 1) % 10 === 0 || idx + 1 === jobs.length) console.log(`  [${idx + 1}/${jobs.length}] hit=${hit} miss(new)=${miss} fail=${fail} (${((Date.now() - start) / 1000).toFixed(1)}s)`);
    }
  }));
  console.log(`\n✅ 完成 — hit=${hit} miss(新合成)=${miss} fail=${fail}`);
  if (fail) console.log("⚠️ 有 fail,重跑即可(hit 跳过已暖,仅补 fail/新增)。");
}
main().catch((e) => { console.error(e); process.exit(1); });
