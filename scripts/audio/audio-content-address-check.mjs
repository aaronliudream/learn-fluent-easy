/**
 * 音频「与文稿对得上」的客观反证 —— 不靠耳朵判。
 *
 * 原理:tts edge 的 URL 是内容寻址的 —— hash = sha256(provider|voice|speed|accent|text)。
 * 所以拿 **DB 里的 transcript** 用**同一组参数**再调一次 edge:
 *   ① 若返回 cached:true,说明这段文本此前确实被合成过;
 *   ② 若返回的 audioUrl 与 DB 里存的 audio_url 逐字相同,说明那条记录挂的音频
 *      正是这段文稿合成出来的 —— 不可能张冠李戴。
 * 两条同时成立 = 36 条音频与 36 篇文稿一一对应,机器可验。
 *
 * ⚠️ 必须走 cleanForTTS(与 pregenerate / 前端 speak.ts 同口径),否则 hash 对不上。
 *
 * 两种期望值来源:
 *   默认           —— 拿 DB 里已回填的 audio_url 当期望值(回填 SQL 跑完之后用)
 *   --expect-from= —— 拿待跑的回填 SQL 当期望值(回填**之前**用,好在跑之前就发现问题)
 *
 * 用法:
 *   node scripts/verify-audio-content-address.mjs --volume=wy9A --grade=9 \
 *     --publisher=junior_fltrp --voice=fable --accent=UK --speed=0.95 \
 *     [--expect-from=SQLAA/wy9a-listening-audio-url.sql]
 */
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const env = Object.fromEntries(readFileSync('.env', 'utf8').split(/\r?\n/).filter(l => l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const SUP = env.VITE_SUPABASE_URL;
const ANON = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const sb = createClient(SUP, ANON);
const TTS_URL = `${SUP}/functions/v1/tts`;

const arg = (k, d) => (process.argv.find(a => a.startsWith(`--${k}=`))?.split('=')[1]) ?? d;
const VOLUME = arg('volume', 'wy9A');
const GRADE = Number(arg('grade', '9'));
const PUBLISHER = arg('publisher', 'junior_fltrp');
const VOICE = arg('voice', 'fable');
const ACCENT = arg('accent', 'UK');
const SPEED = Number(arg('speed', '0.95'));
const THROTTLE_MS = 900;

const sleep = ms => new Promise(r => setTimeout(r, ms));
const SPEAKER_LABEL = /(^|[\r\n]+|[.?!]["'’)\]]?[ \t]+|\b\d{1,2}\.[ \t]+)([A-Z][a-zA-Z]{0,5}):[ \t]+(?=["'“‘A-Z])/g;
const cleanForTTS = (t) => (!t ? t : String(t).replace(SPEAKER_LABEL, '$1').replace(SPEAKER_LABEL, '$1'));

async function synth(text) {
  const res = await fetch(TTS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: ANON, Authorization: `Bearer ${ANON}` },
    body: JSON.stringify({ text: cleanForTTS(text), voiceId: VOICE, speed: SPEED, format: 'url', ...(ACCENT ? { accent: ACCENT } : {}) }),
  });
  if (!res.ok) return { err: `HTTP ${res.status}` };
  const d = await res.json();
  return { url: d?.audioUrl, cached: d?.cached, provider: d?.provider };
}

const { data: rows, error } = await sb
  .from('junior_listening_exercises')
  .select('id,unit,title,transcript,audio_url')
  .eq('grade', GRADE).eq('volume', VOLUME).eq('publisher', PUBLISHER)
  .order('unit');
if (error) { console.log('拉取失败:', error.message); process.exit(1); }
// 期望值来源:DB 已回填的 audio_url,或(回填之前)待跑的回填 SQL
const EXPECT_FROM = arg('expect-from', '');
let expectByI = null;
if (EXPECT_FROM) {
  const raw = readFileSync(EXPECT_FROM, 'utf8');
  expectByI = new Map();
  const re = /SET audio_url = '([^']+)'\s*\n\s*WHERE id = '([0-9a-f-]+)'/g;
  let m;
  while ((m = re.exec(raw))) expectByI.set(m[2], m[1]);
  console.log(`期望值来源:${EXPECT_FROM}(解出 ${expectByI.size} 条)`);
}
const expected = (r) => (expectByI ? expectByI.get(r.id) : r.audio_url);

console.log(`${VOLUME} 共 ${rows.length} 条 | voice=${VOICE} accent=${ACCENT} speed=${SPEED}`);
console.log(`反证口径:同参数重调 edge → 期望 cached=true 且 audioUrl 与${expectByI ? '待跑 SQL' : 'DB'}逐字相同\n`);

let okBoth = 0, notCached = 0, urlMismatch = 0, noUrl = 0, err = 0;
const bad = [];
for (const r of rows) {
  const want = expected(r);
  if (!want) { noUrl++; bad.push(`${r.unit}《${r.title}》期望值缺失(${expectByI ? 'SQL 里没有这条 id' : 'DB audio_url 为空'})`); continue; }
  const s = await synth(r.transcript);
  if (s.err) { err++; bad.push(`${r.unit}《${r.title}》${s.err}`); await sleep(THROTTLE_MS); continue; }
  const sameUrl = s.url === want;
  if (!sameUrl) { urlMismatch++; bad.push(`${r.unit}《${r.title}》URL 不一致\n      期望=${want}\n      edge=${s.url}`); }
  if (!s.cached) { notCached++; bad.push(`${r.unit}《${r.title}》cached=false(这段文本此前没被合成过?)`); }
  if (sameUrl && s.cached) okBoth++;
  await sleep(THROTTLE_MS);
}

console.log(`\n════ 反证结果 ════`);
console.log(`  cached=true 且 URL 逐字一致 : ${okBoth} / ${rows.length}`);
console.log(`  URL 不一致                  : ${urlMismatch}`);
console.log(`  cached=false                : ${notCached}`);
console.log(`  期望值缺失                  : ${noUrl}`);
console.log(`  edge 报错                   : ${err}`);
if (bad.length) { console.log('\n  明细:'); bad.forEach(b => console.log('    ✗ ' + b)); }
console.log(`\nVERIFY_VERDICT: ${okBoth === rows.length && rows.length > 0 ? 'PASS' : 'FAIL'}(${okBoth}/${rows.length})`);
process.exit(okBoth === rows.length && rows.length > 0 ? 0 : 1);
