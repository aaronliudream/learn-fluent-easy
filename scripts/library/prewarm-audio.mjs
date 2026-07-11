/**
 * 图书馆样书:句级音频预生成 + 回填 library_sentences.audio_url(可选优化,消除首播延迟)。
 * 照 scripts/pregenerate-listening-audio.mjs 模式:调 tts edge 合成,拿 CDN URL 生成 UPDATE SQL。
 *
 * 从本地书 JSON 读句子(不需书已 published;anon 读不到未发布书,故不走 DB 取源),
 * 按 seq 生成:UPDATE library_sentences SET audio_url=… WHERE book_id=(书子查询) AND seq=N AND audio_url IS NULL;
 * (Aaron 用 service role 跑,能看到未发布书。)
 *
 * ⚠️ 阅读器对有 audio_url 的句子走 speakFromUrl(直接播该 URL,不再按用户音色算 hash),
 *    故此处固定用「美音叙述者」合成(voice=alloy, accent=US, speed=1.0),全书统一旁白声。慢速仍走实时。
 * ⚠️ 内容须先过审再预生成(别给未审文本上 CDN)。只有 anon key,不写库,产 UPDATE SQL 给 Aaron。
 *
 * 用法:
 *   node scripts/library/prewarm-audio.mjs aesop-easy-readers          # 验证:只跑第 1 句,打印 URL
 *   node scripts/library/prewarm-audio.mjs aesop-easy-readers --all    # 全量:合成 + 生成 UPDATE SQL
 */
import { readFileSync, writeFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env", "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
    }),
);
const SUP = env.VITE_SUPABASE_URL;
const ANON = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const TTS_URL = `${SUP}/functions/v1/tts`;
const VOICE = "alloy", ACCENT = "US", SPEED = 1.0; // 统一旁白;对齐阅读器 normal 档
const THROTTLE_MS = 1500;
const e = (s) => String(s).replace(/'/g, "''");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 与 src/lib/ttsClean.ts 一致(去说话人标签)。本册无标签,基本 no-op,保一致以命中同一 hash。
const SPEAKER_LABEL = /(^|[\r\n]+|[.?!]["'’)\]]?[ \t]+|\b\d{1,2}\.[ \t]+)([A-Z][a-zA-Z]{0,5}):[ \t]+(?=["'“‘A-Z])/g;
const cleanForTTS = (t) => (!t ? t : String(t).replace(SPEAKER_LABEL, "$1").replace(SPEAKER_LABEL, "$1"));

const key = process.argv[2];
if (!key) {
  console.error("用法: node scripts/library/prewarm-audio.mjs <book_key> [--all]");
  process.exit(1);
}
const ALL = process.argv.includes("--all");
const book = JSON.parse(readFileSync(`scripts/library/books/${key}.json`, "utf8"));

// 展平出 seq(与 build-seed.mjs 完全一致的顺序)
const rows = [];
let seq = 0;
for (const ch of book.chapters)
  for (const p of ch.paragraphs)
    for (const s of p) rows.push({ seq: ++seq, en: s.en });

async function synth(text) {
  const res = await fetch(TTS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON, Authorization: `Bearer ${ANON}` },
    body: JSON.stringify({ text: cleanForTTS(text), voiceId: VOICE, accent: ACCENT, speed: SPEED, format: "url" }),
  });
  if (!res.ok) {
    console.log(`  ❌ edge HTTP ${res.status}: ${(await res.text()).slice(0, 120)}`);
    return null;
  }
  const data = await res.json();
  return data?.audioUrl ? { audioUrl: data.audioUrl, provider: data.provider, cached: data.cached } : null;
}

if (!ALL) {
  console.log(`【验证模式·只跑第 1 句】${book.title}`);
  console.log(`seq1: "${rows[0].en}"`);
  const r = await synth(rows[0].en);
  if (!r) process.exit(1);
  console.log(`provider:${r.provider} cached:${r.cached}`);
  console.log(`audioUrl: ${r.audioUrl}`);
  console.log("\n⚠️ 生产浏览器打开确认能放音后,再 --all 全量。(本次未写 SQL)");
  process.exit(0);
}

let sql = `-- ============================================================================
-- 图书馆样书音频预生成回填 audio_url(${key}); voice=${VOICE} accent=${ACCENT} speed=${SPEED}
-- 幂等:仅 audio_url IS NULL 才更新;按 (book_key, seq) 定位。
-- ============================================================================

`;
let ok = 0, fail = 0;
for (const row of rows) {
  const r = await synth(row.en);
  if (!r) {
    fail++;
    console.log(`  ❌ seq${row.seq}`);
    await sleep(THROTTLE_MS);
    continue;
  }
  sql += `UPDATE public.library_sentences SET audio_url = '${e(r.audioUrl)}'\n`;
  sql += `  WHERE book_id = (SELECT id FROM public.library_books WHERE book_key = '${e(key)}') AND seq = ${row.seq} AND audio_url IS NULL;\n`;
  ok++;
  console.log(`  ✓ seq${row.seq} → ${r.audioUrl}`);
  await sleep(THROTTLE_MS);
}
sql += `\n-- 校验:已填 audio_url 的句数\n`;
sql += `SELECT count(*) FILTER (WHERE audio_url IS NOT NULL) AS filled, count(*) AS total\n`;
sql += `  FROM public.library_sentences WHERE book_id = (SELECT id FROM public.library_books WHERE book_key = '${e(key)}');\n`;
const out = `SQLAA/library-audio-${key}.sql`;
writeFileSync(out, sql);
console.log(`\n完成: 成功 ${ok} / 失败 ${fail} | 已生成 ${out}`);
