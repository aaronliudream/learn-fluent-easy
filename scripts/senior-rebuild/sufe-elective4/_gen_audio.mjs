// 上外(sufe)必修一 听力音频预生成(edge TTS nova/0.85),产出 audio_url UPDATE SQL。
// UPDATE 按 publisher+volume+unit+title(只回填 sufe 本册,不动人教)。内容寻址 CF URL。
import { readFileSync, writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { VOL, META, PUBLISHER } from './_meta.mjs';
const env = Object.fromEntries(readFileSync('.env', 'utf8').split(/\r?\n/).filter(l => l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const SUP = env.VITE_SUPABASE_URL, ANON = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const TTS_URL = `${SUP}/functions/v1/tts`;
const VOICE = 'nova', SPEED = 0.85, THROTTLE = 1200, PUB = PUBLISHER;
const e = s => String(s).replace(/'/g, "''");
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SPEAKER_LABEL = /(^|[\r\n]+|[.?!]["'’)\]]?[ \t]+|\b\d{1,2}\.[ \t]+)([A-Z][a-zA-Z]{0,5}):[ \t]+(?=["'“‘A-Z])/g;
const cleanForTTS = t => (!t ? t : String(t).replace(SPEAKER_LABEL, '$1').replace(SPEAKER_LABEL, '$1'));
const buildTr = ex => Array.isArray(ex.transcript) ? ex.transcript.map(t => typeof t === 'string' ? t : `${t.speaker || ''}: ${t.text}`).join('\n') : ex.transcript;
async function synth(text, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(TTS_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: ANON, Authorization: `Bearer ${ANON}` }, body: JSON.stringify({ text: cleanForTTS(text), voiceId: VOICE, speed: SPEED, format: 'url' }) });
      if (res.ok) { const d = await res.json(); if (d?.audioUrl) return d.audioUrl; }
    } catch (err) { /* retry */ }
    await sleep(2000);
  }
  return null;
}
const rows = [];
let ok = 0, total = 0;
for (const u of Object.keys(META)) {
  const m = META[u];
  const lf = JSON.parse(readFileSync(`scripts/senior-rebuild/sufe-${VOL}/${u}/${VOL}-${u}-listening.json`, 'utf8'));
  for (const ex of lf.exercises) {
    total++;
    const url = await synth(buildTr(ex));
    if (url) { ok++; rows.push({ unit: m.unit, title: ex.title, url }); console.log(`  ${m.unit} ${ex.title.slice(0, 30)} -> ${url.slice(-18)}`); }
    else console.log(`  ❌ ${m.unit} ${ex.title}`);
    await sleep(THROTTLE);
  }
}
let sql = `-- 上外(sufe)必修一 听力 audio_url 回填(${ok}/${total})。先跑各单元 load,再跑本文件。幂等。\nBEGIN;\n`;
for (const r of rows) sql += `UPDATE public.junior_listening_exercises SET audio_url='${e(r.url)}' WHERE publisher='${PUB}' AND volume='${VOL}' AND unit='${e(r.unit)}' AND title='${e(r.title)}';\n`;
sql += `COMMIT;\nSELECT unit, count(*) FILTER (WHERE audio_url IS NOT NULL) AS have_audio, count(*) AS total FROM public.junior_listening_exercises WHERE publisher='${PUB}' AND volume='${VOL}' GROUP BY unit ORDER BY unit;\n`;
writeFileSync(`SQLAA/sufe-${VOL}-listening-audio-url.sql`, sql);
console.log(`\n合成 ${ok}/${total} -> SQLAA/sufe-${VOL}-listening-audio-url.sql`);
