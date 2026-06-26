// 预生成小学听音辨词音频:对 grade3-6 各单元核心词调 tts edge(el:lily 儿童音,各年级现用语速),
// 拿固定 CF URL → 写入 src/data/primaryHub/listenWordAudio.json(键 `${gradeNum}|${en}`)。
// 纯前端:无 DB、无需 Aaron。运行时关卡优先读此 URL,缺则回退 speakKid 实时 TTS。
import { readFileSync, writeFileSync } from 'node:fs';

const env = Object.fromEntries(readFileSync('.env', 'utf8').split(/\r?\n/).filter(l => l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const SUP = env.VITE_SUPABASE_URL;
const ANON = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const TTS_URL = `${SUP}/functions/v1/tts`;

const VOICE = 'el:lily';                 // 现用儿童音,不变
const SPEED = { 3: 0.75, 4: 0.85, 5: 0.9, 6: 0.95 }; // listenWordStageConfig 各年级现值
const THROTTLE = 180;

const sleep = ms => new Promise(r => setTimeout(r, ms));
// 与 toHubTtsText 一致:trim + 弯撇号→直撇号
const clean = s => String(s).trim().replace(/[‘’]/g, "'");

async function synth(text, speed) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(TTS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: ANON, Authorization: `Bearer ${ANON}` },
        body: JSON.stringify({ text, voiceId: VOICE, speed, format: 'url' }),
      });
      if (res.status === 429) { await sleep(1500 * (attempt + 1)); continue; }
      if (!res.ok) return { err: `HTTP ${res.status}` };
      const data = await res.json();
      if (data?.audioUrl) return { url: data.audioUrl, cached: data.cached };
      return { err: 'no audioUrl' };
    } catch (e) { if (attempt === 2) return { err: String(e).slice(0, 60) }; await sleep(800); }
  }
  return { err: '429 retries exhausted' };
}

const grades = [3, 4, 5, 6];
const out = {};
let ok = 0, fail = 0, cachedN = 0;
const fails = [];

for (const g of grades) {
  const j = JSON.parse(readFileSync(`./src/data/primaryHub/grade${g}.json`, 'utf8'))[`grade${g}`];
  const words = new Set();
  (function w(o) { if (Array.isArray(o)) o.forEach(w); else if (o && typeof o == 'object') { if (o.vocabulary) for (const v of o.vocabulary) { if (v.en) words.add(String(v.en)); } for (const k in o) if (o[k] && typeof o[k] == 'object') w(o[k]); } })(j);
  const list = [...words];
  console.log(`\n=== grade${g}: ${list.length} 词 @ speed ${SPEED[g]} ===`);
  for (const en of list) {
    const r = await synth(clean(en), SPEED[g]);
    if (r.url) { out[`${g}|${en}`] = r.url; ok++; if (r.cached) cachedN++; }
    else { fail++; fails.push(`grade${g} "${en}": ${r.err}`); console.log(`  ✗ ${en}: ${r.err}`); }
    await sleep(THROTTLE);
  }
  console.log(`  grade${g} done. 累计 ok=${ok} fail=${fail}`);
}

writeFileSync('./src/data/primaryHub/listenWordAudio.json', JSON.stringify(out, null, 2) + '\n');
console.log(`\n✅ 完成: 成功 ${ok}(其中缓存命中 ${cachedN}) / 失败 ${fail} | 写入 listenWordAudio.json (${Object.keys(out).length} 条)`);
if (fails.length) { console.log('失败清单(将回退实时TTS,不影响可用):'); fails.forEach(f => console.log('  ' + f)); }
