/**
 * 美语课程 · TTS 预热(no-DB,暖内容寻址 CDN)。
 *
 * 美语全程走 speak(accent:"US") / speakUS → 预测式 CDN 探测(predictCdnUrl)→ 命中直接放,
 * 未命中付 1-3s 冷合成。本脚本把美语所有会被朗读的文本逐条 POST tts edge(强制推进 CDN),
 * 跑完连第一个用户首播都是 CDN 命中(≈50-200ms),不再冷。
 *
 * 【hash 一致性铁律】预热键必须与真机 speak 完全一致,否则暖了也不命中:
 *   - accent 必须传 "US"(normalizeForHash 把任意 OpenAI 声 + US 归一成 alloy;默认 nova 也一样)。
 *   - speed:speakUS 默认 1.0(关2/3/4/6/7/8/9/10 全部);关1 课文正常 1.0 / 慢速 0.7。
 *   - 文本必须先 cleanForTTS(与 src/lib/ttsClean.ts 逐字节一致:去说话人标签 + 展开 sb/sth/etc)。
 *   - voiceId 传 "alloy"(US 归一后即 alloy;edge 与前端同款 normalize)。
 *
 * 素材(anon 只读拉库):
 *   - american_sentences.text_en  → 关1 逐句/整篇 + 关8 听力(speed 1.0;--slow 另暖 0.7)
 *   - american_words.word         → 关2 生词卡 / 关3 听音辨词(自动播) / 关4 配对(speed 1.0)
 *   - american_amencontrast.us    → 关6 美语点睛点读(speed 1.0)
 *
 * 用法(anon key 即可,tts 允许 anon 调):
 *   node scripts/american/prewarm-audio.mjs                 # 验证:只暖单元1,打印 hit/miss/fail
 *   node scripts/american/prewarm-audio.mjs --all           # 全量 12 单元(1.0 速)
 *   node scripts/american/prewarm-audio.mjs --all --slow    # 全量 + 关1 慢速 0.7 句子
 *   node scripts/american/prewarm-audio.mjs --unit=7        # 只暖单元7
 *   附加 --part=sentences|words|contrast 限定素材类(默认三类全暖)
 */
import fs from "node:fs";

const clean = (s) => (s || "").trim().replace(/^["']|["']$/g, "");
let env = "";
for (const f of [".env", ".env.local"]) { try { env += fs.readFileSync(f, "utf8") + "\n"; } catch { /* ignore */ } }
const URL = clean(process.env.VITE_SUPABASE_URL || (env.match(/VITE_SUPABASE_URL\s*=\s*(.+)/) || [])[1]);
const KEY = clean(process.env.VITE_SUPABASE_PUBLISHABLE_KEY || (env.match(/VITE_SUPABASE_(?:ANON|PUBLISHABLE)_KEY\s*=\s*(.+)/) || [])[1]);
if (!URL || !KEY) { console.error("缺 VITE_SUPABASE_URL / KEY"); process.exit(1); }

const TTS_URL = `${URL.replace(/\/$/, "")}/functions/v1/tts`;
const VOICE_ID = "alloy";   // US 归一后即 alloy(与前端 normalizeForHash 同)
const CONCURRENCY = 3;       // 与 junior 预热一致,避开 tts edge 资源上限丢词
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };

// ── cleanForTTS:逐字节复刻 src/lib/ttsClean.ts(改那边这里也要改)──
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
const ALL = args.includes("--all");
const SLOW = args.includes("--slow");
const UNIT = Number((args.find((a) => a.startsWith("--unit=")) || "").split("=")[1]) || null;
const PART = (args.find((a) => a.startsWith("--part=")) || "").split("=")[1] || "all";
const wantUnit = UNIT || (ALL ? null : 1); // 无 --all 且无 --unit → 默认单元1 验证
// 册号:--book N(默认1)。多册共表,按 lesson_id 前缀过滤本册。每单元课数:册1=6,册2起=8。
const BOOK = (() => { const i = args.indexOf("--book"); return i >= 0 && args[i + 1] ? args[i + 1] : "1"; })();
const UNIT_SIZE = BOOK === "1" ? 6 : 8;
const LFILT = `&lesson_id=like.am${BOOK}_l*`;

function uniq(arr) { return Array.from(new Set(arr.map((s) => cleanForTTS((s || "").trim())).filter(Boolean))); }
const unitOf = (lid) => Math.ceil(Number(String(lid).match(/am\d+_l(\d\d)/)?.[1]) / UNIT_SIZE);

async function fetchAllRest(path) {
  const out = []; const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const r = await fetch(`${URL}/rest/v1/${path}`, { headers: { ...H, Range: `${from}-${from + PAGE - 1}`, "Range-Unit": "items" } });
    if (!r.ok) { console.warn("DB 读取失败:", r.status, await r.text().catch(() => "")); break; }
    const rows = await r.json(); out.push(...rows);
    if (rows.length < PAGE) break;
  }
  return out;
}

async function collectSentences() {
  const rows = await fetchAllRest(`american_sentences?select=lesson_id,text_en${LFILT}`);
  return uniq(rows.filter((r) => !wantUnit || unitOf(r.lesson_id) === wantUnit).map((r) => r.text_en));
}
async function collectWords() {
  const rows = await fetchAllRest(`american_words?select=lesson_id,word${LFILT}`);
  return uniq(rows.filter((r) => !wantUnit || unitOf(r.lesson_id) === wantUnit).map((r) => r.word));
}
async function collectContrast() {
  const rows = await fetchAllRest(`american_amencontrast?select=lesson_id,us${LFILT}`);
  return uniq(rows.filter((r) => !wantUnit || unitOf(r.lesson_id) === wantUnit).map((r) => r.us));
}

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

async function runPool(jobs, label) {
  let i = 0, hit = 0, miss = 0, fail = 0; const start = Date.now();
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    while (true) {
      const idx = i++; if (idx >= jobs.length) return;
      const r = await warmOne(jobs[idx].text, jobs[idx].speed);
      if (r === "hit") hit++; else if (r === "miss") miss++; else fail++;
      if ((idx + 1) % 25 === 0 || idx + 1 === jobs.length) {
        console.log(`  [${label} ${idx + 1}/${jobs.length}] hit=${hit} miss(new)=${miss} fail=${fail} (${((Date.now() - start) / 1000).toFixed(1)}s)`);
      }
    }
  }));
  return { hit, miss, fail };
}

async function main() {
  const jobs = [];
  const doPart = (p) => PART === "all" || PART === p;
  if (doPart("sentences")) {
    const s = await collectSentences();
    for (const t of s) jobs.push({ text: t, speed: 1.0 });
    if (SLOW) for (const t of s) jobs.push({ text: t, speed: 0.7 });
    console.log(`句子 ${s.length}${SLOW ? " ×(1.0+0.7)" : " ×1.0"}`);
  }
  if (doPart("words")) { const w = await collectWords(); for (const t of w) jobs.push({ text: t, speed: 1.0 }); console.log(`单词 ${w.length} ×1.0`); }
  if (doPart("contrast")) { const c = await collectContrast(); for (const t of c) jobs.push({ text: t, speed: 1.0 }); console.log(`对照点读 ${c.length} ×1.0`); }

  const scope = wantUnit ? `单元${wantUnit}` : "全 12 单元";
  console.log(`\n美语 TTS 预热 [${scope}] · voiceId=alloy(US) · 共 ${jobs.length} 个合成任务`);
  if (!jobs.length) { console.log("无素材,退出"); return; }
  if (!ALL && !UNIT) console.log("(验证模式:仅单元1;确认无误后加 --all 全量)");
  const r = await runPool(jobs, scope);
  console.log(`\n✅ 完成 — hit(已暖)=${r.hit} miss(新合成)=${r.miss} fail=${r.fail}`);
  if (r.fail) console.log("⚠️ 有 fail,重跑本命令即可(hit 会跳过已暖,仅补 fail/新增)。");
  console.log("此后美语首播即 CDN 命中(≈50-200ms),不再冷延迟。");
}
main().catch((e) => { console.error(e); process.exit(1); });
