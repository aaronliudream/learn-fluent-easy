/**
 * ⑤ 关10 听力音频预热:把 L2-L72 关10 听力题的 audio 文本(本课对话片段/词)
 * 逐条调 tts edge 现合成上 CDN,让 Aaron 真机验时"点喇叭立即有声",无冷合成延迟。
 *
 * 口径必须与 speakUS 完全一致(否则 hash 不同、白合成):
 *   accent='US' → voice=alloy;speed=1.0(safeSpeed=1);cleanForTTS(去说话人标签+展开sb/sth缩写)。
 *   edge 收到 cleanForTTS 后的文本再算 hash;本脚本发同样的 cleanForTTS 文本 → 命中同一 CDN key。
 *
 * 用法:
 *   node scripts/american/prewarm-stage10-listening.mjs           # 只跑前2条验证
 *   node scripts/american/prewarm-stage10-listening.mjs --all     # 全量预热清单
 *
 * 读清单:scratchpad/l10_audio_manifest.json(集中脚本产出的去重 audio 列表)。
 * 不写库、不生成 SQL —— 纯预热 CDN。
 */
import { readFileSync } from 'node:fs';

// 清单路径:默认第一册 scratchpad;第二册起用 L10_DIR 指向本册 l10_audio_manifest.json。
// audio 是纯文本、册无关(hash 只认 cleanForTTS 文本),故此脚本无需 lesson 前缀过滤。
const MANIFEST = process.env.L10_DIR
  ? `${process.env.L10_DIR.replace(/\/$/, '')}/l10_audio_manifest.json`
  : 'C:/Users/willi/AppData/Local/Temp/claude/C--Projects-learn-fluent-easy/dce5bb16-1d15-4c48-a6cb-7dba17192a75/scratchpad/l10_audio_manifest.json';

const env = Object.fromEntries(readFileSync('.env', 'utf8').split(/\r?\n/).filter(l => l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const SUP = env.VITE_SUPABASE_URL;
const ANON = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const TTS_URL = `${SUP}/functions/v1/tts`;
const THROTTLE_MS = 1200;
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── cleanForTTS 完整复刻(src/lib/ttsClean.ts):去说话人标签 + 展开 sb/sth/etc ──
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
  let out = text.replace(SPEAKER_LABEL, '$1').replace(SPEAKER_LABEL, '$1');
  for (const [re, rep] of SPEECH_ABBREV) out = out.replace(re, rep);
  return out;
}

async function synth(text) {
  const res = await fetch(TTS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: ANON, Authorization: `Bearer ${ANON}` },
    // 与 fetchTTS 一致:发 cleanForTTS 文本 + voiceId=alloy + speed=1.0 + accent=US
    body: JSON.stringify({ text: cleanForTTS(text), voiceId: 'alloy', speed: 1.0, accent: 'US', format: 'url' }),
  });
  if (!res.ok) return { ok: false, msg: `HTTP ${res.status}: ${(await res.text()).slice(0, 120)}` };
  const data = await res.json().catch(() => null);
  return data?.audioUrl ? { ok: true, url: data.audioUrl, cached: data.cached, provider: data.provider } : { ok: false, msg: 'no audioUrl' };
}

const audios = JSON.parse(readFileSync(MANIFEST, 'utf8'));
const ALL = process.argv.includes('--all');
const list = ALL ? audios : audios.slice(0, 2);
console.log(`关10听力预热:清单 ${audios.length} 条,本次跑 ${list.length} 条(accent=US voice=alloy speed=1.0)`);

let ok = 0, fail = 0, cachedN = 0;
for (let i = 0; i < list.length; i++) {
  const t = list[i];
  const r = await synth(t);
  if (r.ok) { ok++; if (r.cached) cachedN++; console.log(`  ✓ [${i + 1}/${list.length}] ${r.cached ? '(已缓存)' : r.provider} ${t.slice(0, 42).replace(/\n/g, ' / ')}…`); }
  else { fail++; console.log(`  ❌ [${i + 1}/${list.length}] ${r.msg} — ${t.slice(0, 42).replace(/\n/g, ' / ')}…`); }
  await sleep(THROTTLE_MS);
}
console.log(`\n完成:成功 ${ok} / 失败 ${fail}(其中已缓存 ${cachedN})。${ALL ? '' : '验证通过后加 --all 全量。'}`);
process.exit(fail ? 1 : 0);
