// 预生成选择性必修四全单元听力音频(edge TTS, nova/0.85, 与关7同口径),产出 audio_url UPDATE SQL。
// 内容寻址:synth(cleanForTTS(transcript)) 得到的 CF URL = 播放路径请求的同一 URL。
// transcript 构造必须与 _gen_load.mjs 完全一致(speaker: text 用 \n 连接),否则 hash 不符。
// 用法: node scripts/senior-rebuild/elective4/_gen_audio.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { VOL, META } from './_meta.mjs';
const env = Object.fromEntries(readFileSync('.env', 'utf8').split(/\r?\n/).filter(l => l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const SUP = env.VITE_SUPABASE_URL, ANON = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const TTS_URL = `${SUP}/functions/v1/tts`;
const VOICE = 'nova', SPEED = 0.85, THROTTLE = 1200;
const e = s => String(s).replace(/'/g, "''");
const sleep = ms => new Promise(r => setTimeout(r, ms));
// 与 src/lib/ttsClean.ts 同口径:剥离说话人标签
const SPEAKER_LABEL = /(^|[\r\n]+|[.?!]["'’)\]]?[ \t]+|\b\d{1,2}\.[ \t]+)([A-Z][a-zA-Z]{0,5}):[ \t]+(?=["'“‘A-Z])/g;
const cleanForTTS = t => (!t ? t : String(t).replace(SPEAKER_LABEL, '$1').replace(SPEAKER_LABEL, '$1'));
// 与 _gen_load.mjs 同口径构造 transcript
const buildTr = ex => Array.isArray(ex.transcript) ? ex.transcript.map(t => typeof t === 'string' ? t : `${t.speaker || ''}: ${t.text}`).join('\n') : ex.transcript;

async function synth(text, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(TTS_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: ANON, Authorization: `Bearer ${ANON}` }, body: JSON.stringify({ text: cleanForTTS(text), voiceId: VOICE, speed: SPEED, format: 'url' }) });
      if (res.ok) { const d = await res.json(); if (d?.audioUrl) return d.audioUrl; }
      else console.log(`  HTTP ${res.status} retry ${i + 1}`);
    } catch (err) { console.log(`  err ${err.message} retry ${i + 1}`); }
    await sleep(2000);
  }
  return null;
}

const rows = [];
let ok = 0, total = 0;
for (const u of Object.keys(META)) {
  const m = META[u];
  const lf = JSON.parse(readFileSync(`scripts/senior-rebuild/elective4/${u}/${VOL}-${u}-listening.json`, 'utf8'));
  for (const ex of lf.exercises) {
    total++;
    const url = await synth(buildTr(ex));
    if (url) { ok++; rows.push({ unit: m.unit, title: ex.title, url }); console.log(`  ${m.unit} ${ex.title.slice(0, 30)} -> ${url.slice(-20)}`); }
    else console.log(`  ❌ ${m.unit} ${ex.title} 合成失败`);
    await sleep(THROTTLE);
  }
}

let sql = `-- 选择性必修四 听力 audio_url 回填(${ok}/${total} 合成成功)。content-addressed CF URL。Aaron 先跑各单元 load,再跑本文件。幂等。\nBEGIN;\n`;
for (const r of rows) sql += `UPDATE public.junior_listening_exercises SET audio_url='${e(r.url)}' WHERE volume='${VOL}' AND unit='${e(r.unit)}' AND title='${e(r.title)}';\n`;
sql += `COMMIT;\nSELECT unit, count(*) FILTER (WHERE audio_url IS NOT NULL) AS have_audio, count(*) AS total FROM public.junior_listening_exercises WHERE volume='${VOL}' GROUP BY unit ORDER BY unit;\n`;
writeFileSync('SQLAA/elective4-listening-audio-url.sql', sql);
console.log(`\n合成 ${ok}/${total} -> SQLAA/elective4-listening-audio-url.sql`);
