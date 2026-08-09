/**
 * 补烧「缺音频」的零散内容 —— 场景短文 / 场景节点 / 中文这样说。
 *
 * 与 `generate-audio.mjs` 的分工:那份按**词库词**批量烧(--bank=toefl),
 * 这份专烧散落在别的表里、因内容修订被主动置空的那些。
 *
 * ⚠️ **定版参数必须与库内一致**:`provider=openai · voice=alloy · speed=1 · accent=空`。
 *    文件名是内容哈希 `sha256(provider|voice|speed|accent|text)` —— 参数不一致会
 *    烧出另一个文件,库里新旧混着,以后再也对不上账。
 * ⚠️ 我**写不了库**(只有 anon key),所以这份只负责拿到 audioUrl,
 *    最后把 UPDATE 语句打出来交给 Aaron 跑。
 * ⚠️ 账户级错误(额度耗尽/欠费)必须**立刻中止**,不能当成限流一直退避 ——
 *    那会把一次配置问题变成几十分钟的空转。
 *
 * 用法:node scripts/vocab/burn-missing-audio.mjs [--dry-run]
 */
import { createClient } from "@supabase/supabase-js";
import { loadEnv } from "./env.mjs";

const ENV = loadEnv(process.cwd(), { quiet: true });
const SUPA = ENV.VITE_SUPABASE_URL, ANON = ENV.VITE_SUPABASE_PUBLISHABLE_KEY;
const TTS = `${SUPA}/functions/v1/tts`;
const DRY = process.argv.includes("--dry-run");

/* 定版:与库内 44513 条一致,别改 */
const VOICE = "alloy", SPEED = 1, ACCENT = "";
const THROTTLE_MS = 1200;

const c = createClient(SUPA, ANON);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const FATAL = ["credit_balance_exhausted", "insufficient_quota", "billing_hard_limit_reached"];

function fatalIfAccountError(status, body) {
  if (FATAL.some(p => body.includes(p))) {
    console.error(`\n✗ 账户级错误(HTTP ${status}),立即中止,不再重试:\n  ${body.slice(0, 200)}`);
    process.exit(2);
  }
}

async function synth(text) {
  for (let b = 0; b < 5; b++) {
    const res = await fetch(TTS, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: ANON, Authorization: `Bearer ${ANON}` },
      body: JSON.stringify({ text, voiceId: VOICE, speed: SPEED, accent: ACCENT, format: "url" }),
    });
    if (res.status === 429 || res.status >= 500) {
      const body = await res.text();
      fatalIfAccountError(res.status, body);          // 先读体:账户级错误和限流同样是 429/502
      await sleep(2000 * 2 ** b); continue;
    }
    if (!res.ok) { const body = await res.text(); fatalIfAccountError(res.status, body);
      throw new Error(`tts HTTP ${res.status}: ${body.slice(0, 160)}`); }
    const d = await res.json();
    if (!d?.audioUrl) throw new Error(`没返回 audioUrl: ${JSON.stringify(d).slice(0, 160)}`);
    return d;
  }
  throw new Error("连续限流,放弃");
}

async function page(table, cols) {
  const out = [];
  for (let f = 0; ; f += 1000) {
    const { data, error } = await c.from(table).select(cols).range(f, f + 999);
    if (error) throw error;
    out.push(...data); if (data.length < 1000) break;
  }
  return out;
}

/* 待烧清单:{table, id, col, text} */
const jobs = [];
for (const p of await page("vocab_scene_packs", "id,title_zh,essay_short_en,essay_full_en,essay_short_audio_url,essay_full_audio_url")) {
  if (!p.essay_short_audio_url && p.essay_short_en)
    jobs.push({ table: "vocab_scene_packs", id: p.id, col: "essay_short_audio_url", text: p.essay_short_en, label: `场景短文·速览 ${p.title_zh}` });
  if (!p.essay_full_audio_url && p.essay_full_en)
    jobs.push({ table: "vocab_scene_packs", id: p.id, col: "essay_full_audio_url", text: p.essay_full_en, label: `场景短文·完整 ${p.title_zh}` });
}
for (const r of await page("vocab_scene_items", "id,text_en,audio_url"))
  if (!r.audio_url && r.text_en) jobs.push({ table: "vocab_scene_items", id: r.id, col: "audio_url", text: r.text_en, label: `场景节点 ${r.text_en}` });
for (const r of await page("vocab_cn_renditions", "id,rendition,example_en,audio_url,example_audio_url")) {
  if (!r.audio_url && r.rendition)
    jobs.push({ table: "vocab_cn_renditions", id: r.id, col: "audio_url", text: r.rendition, label: `说法 ${r.rendition}` });
  if (!r.example_audio_url && r.example_en)
    jobs.push({ table: "vocab_cn_renditions", id: r.id, col: "example_audio_url", text: r.example_en, label: `例句 ${r.example_en.slice(0, 30)}` });
}

const chars = jobs.reduce((n, j) => n + j.text.length, 0);
console.log(`待烧 ${jobs.length} 条 · ${chars} 字符 · tts-1 约 $${(chars / 1e6 * 15).toFixed(4)}`);
if (DRY) { jobs.forEach(j => console.log(`  [dry] ${j.label} (${j.text.length})`)); process.exit(0); }

const done = [];
for (const [i, j] of jobs.entries()) {
  process.stdout.write(`(${i + 1}/${jobs.length}) ${j.label.slice(0, 40)} … `);
  try {
    const d = await synth(j.text);
    done.push({ ...j, url: d.audioUrl });
    console.log(`✓ ${d.cached ? "(命中缓存)" : d.provider || ""}`);
  } catch (e) { console.log(`✗ ${String(e).slice(0, 90)}`); }
  await sleep(THROTTLE_MS);
}

console.log(`\n成功 ${done.length}/${jobs.length}\n`);
console.log("-- ↓↓↓ 回填 SQL(复制整段跑)↓↓↓");
console.log("BEGIN;");
for (const d of done) {
  console.log(`UPDATE ${d.table} SET ${d.col} = '${d.url}' WHERE id = '${d.id}' AND ${d.col} IS NULL;`);
}
console.log(`SELECT '场景短文仍空' AS 项, count(*) AS 行数 FROM vocab_scene_packs WHERE essay_short_audio_url IS NULL OR essay_full_audio_url IS NULL
UNION ALL SELECT '场景节点仍空', count(*) FROM vocab_scene_items WHERE audio_url IS NULL AND text_en IS NOT NULL
UNION ALL SELECT '中文这样说仍空', count(*) FROM vocab_cn_renditions WHERE audio_url IS NULL OR (example_en IS NOT NULL AND example_audio_url IS NULL);`);
console.log("COMMIT;");
