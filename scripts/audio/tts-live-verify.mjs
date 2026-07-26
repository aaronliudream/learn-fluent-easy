#!/usr/bin/env node
/**
 * tts edge function —— 线上冷/热路径行为复验（deploy 前后都可跑，用来对比"部署没改变行为"）。
 *
 * 跑什么：
 *   1) 热路径 ×N：拿已存在的对象发请求，断言返回 JSON 里的 audioUrl 与本地代码构造的完整 URL 逐字相等，
 *      且 cached=true（走 existsInStorage 命中，不重新合成）。
 *   2) 冷路径 ×M：用一次性探针文本触发真实合成，断言
 *      - 响应是 JSON（不是裸 audio/mpeg 字节），字段齐全，cached=false
 *      - audioUrl 与本地代码构造的 URL 逐字相等（新对象仍落在同一 CDN 路径格式）
 *      - 该 URL 立刻可下载，且 MP3 帧头解析出的时长 > 0（端到端真出声，不是空文件）
 *   3) 前端解析兼容性：按 src/lib/speak.ts fetchTTS 的判定顺序检查
 *      content-type 是 application/json 且 data.audioUrl 以 http 开头。
 *
 * 用法：
 *   node scripts/audio/tts-live-verify.mjs                 # 默认 20 热 + 0 冷
 *   node scripts/audio/tts-live-verify.mjs --hot 20 --cold 3
 * 冷路径会在 tts-audio 桶里留下探针对象，脚本结束会打印它们的 storage path 供清理。
 * 退出码：0 全绿 / 1 有失败。
 */
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '../..');
const args = process.argv.slice(2);
const argNum = (flag, dflt) => {
  const i = args.indexOf(flag);
  return i >= 0 ? Number(args[i + 1]) : dflt;
};
const HOT_N = argNum('--hot', 20);
const COLD_N = argNum('--cold', 0);
const STAMP = args.includes('--stamp') ? args[args.indexOf('--stamp') + 1] : String(Date.now());

const env = Object.fromEntries(
  readFileSync(join(REPO, '.env'), 'utf8').split(/\r?\n/).filter((l) => l.includes('='))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }),
);
const TTS = `${env.VITE_SUPABASE_URL}/functions/v1/tts`;
const ANON = env.VITE_SUPABASE_PUBLISHABLE_KEY;

// ---- 复用黄金测试的"从真源码抠片段"机制，拿到本地 URL 构造器 ----
const SRC = join(REPO, 'supabase/functions/tts/index.ts');
const src = readFileSync(SRC, 'utf8').replace(/\r\n/g, '\n');
const ENV = {
  SUPABASE_URL: env.VITE_SUPABASE_URL,
  AUDIO_CDN_BASE: process.env.AUDIO_CDN_BASE || 'https://audio.bigmooneducation.com',
  SUPABASE_SERVICE_ROLE_KEY: 'test-not-used',
};
function block(startsWith, endLine) {
  const lines = src.split('\n');
  const i = lines.findIndex((l) => l.startsWith(startsWith));
  if (i < 0) throw new Error(`抽取失败：${startsWith}`);
  if (endLine === null) return lines[i];
  for (let j = i + 1; j < lines.length; j++) if (lines[j] === endLine) return lines.slice(i, j + 1).join('\n');
  throw new Error(`抽取失败(终止行)：${startsWith}`);
}
function region(a, b) {
  const lines = src.split('\n');
  const i = lines.findIndex((l) => l.trimStart().startsWith(a));
  const j = lines.findIndex((l, k) => k > i && l.trimStart().startsWith(b));
  if (i < 0 || j < 0) throw new Error(`抽取失败(区间)：${a} → ${b}`);
  return lines.slice(i, j + 1).join('\n');
}
const mod = `const __ENV: Record<string,string> = ${JSON.stringify(ENV)};
const Deno = { env: { get: (k: string) => __ENV[k] } };
${block('const OPENAI_VOICES = ', null)}
${block('const ELEVENLABS_VOICE_MAP: Record<string, string> = {', '};')}
${block('function isMainlandChina(req: Request): boolean {', '}')}
${block('async function sha256Hex(s: string): Promise<string> {', '}')}
${block('const SUPABASE_URL = ', null)}
${block('const BUCKET = ', null)}
${block('const AUDIO_CDN_BASE = ', null)}
${block('function storageUrlFor(path: string): string {', '}')}
${block('function publicUrlFor(path: string): string {', '}')}
export async function buildUrl(body: { text: string; voiceId?: string; speed?: number; accent?: string }, req: Request) {
  const { text, voiceId, speed, accent } = body;
${region('const requestedVoice =', 'const cdnUrl = publicUrlFor(path);')}
  return { cdnUrl, storageUrl: storageUrlFor(path), path, keyInput };
}
`;
const dir = mkdtempSync(join(tmpdir(), 'tts-verify-'));
writeFileSync(join(dir, 'm.ts'), mod, 'utf8');
const { buildUrl } = await import(pathToFileURL(join(dir, 'm.ts')).href);
const req = new Request('https://example.test/', { headers: { 'accept-language': 'en-US' } });

const post = async (body) => {
  const r = await fetch(TTS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: ANON, Authorization: `Bearer ${ANON}` },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(90000),
  });
  const ct = r.headers.get('content-type') || '';
  const text = await r.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* not json */ }
  return { status: r.status, ct, json, raw: text.slice(0, 120) };
};

// MP3 帧解析（判断"真出声"而不是空文件）
const BR = { 1: { 3: [0,32,40,48,56,64,80,96,112,128,160,192,224,256,320] }, 2: { 3: [0,8,16,24,32,40,48,56,64,80,96,112,128,144,160] } };
const SRT = { 1: [44100,48000,32000], 2: [22050,24000,16000], 2.5: [11025,12000,8000] };
function mp3Info(buf) {
  let i = 0, frames = 0, dur = 0, sr = 0, ver = 0;
  while (i < buf.length - 4) {
    if (buf[i] !== 0xff || (buf[i + 1] & 0xe0) !== 0xe0) { i++; continue; }
    const vb = (buf[i + 1] >> 3) & 3, lb = (buf[i + 1] >> 1) & 3;
    if (vb === 1 || lb === 0) { i++; continue; }
    ver = vb === 3 ? 1 : vb === 2 ? 2 : 2.5;
    const layer = lb === 1 ? 3 : lb === 2 ? 2 : 1;
    const bri = (buf[i + 2] >> 4) & 15, sri = (buf[i + 2] >> 2) & 3, pad = (buf[i + 2] >> 1) & 1;
    const tab = BR[ver === 2.5 ? 2 : ver]?.[layer];
    if (!tab || bri === 0 || bri === 15 || sri === 3) { i++; continue; }
    sr = SRT[ver][sri];
    const spf = ver === 1 ? 1152 : 576;
    const flen = Math.floor((spf / 8) * (tab[bri] * 1000) / sr) + pad;
    if (flen < 4) { i++; continue; }
    frames++; dur += spf / sr; i += flen;
  }
  return { frames, seconds: dur, sampleRate: sr, mpeg: ver };
}

let fail = 0;
const ok = (cond, label, extra = '') => {
  console.log(`${cond ? '  ✅' : '  ❌'} ${label}${extra ? ' — ' + extra : ''}`);
  if (!cond) fail++;
};

// ---------- 1) 热路径 ----------
const fx = JSON.parse(readFileSync(join(HERE, 'fixtures/tts-golden-439.json'), 'utf8'));
const step = Math.max(1, Math.floor(fx.cases.length / Math.max(1, HOT_N)));
const hotCases = Array.from({ length: HOT_N }, (_, i) => fx.cases[(i * step) % fx.cases.length]);
console.log(`\n=== 热路径复验 ${HOT_N} 条（已存在对象，应命中缓存）===`);
let hotPass = 0;
for (const c of hotCases) {
  const local = await buildUrl({ text: c.text, voiceId: c.voiceId, speed: c.speed, accent: c.accent }, req);
  const res = await post({ text: c.text, voiceId: c.voiceId, speed: c.speed, format: 'url' });
  const good = res.status === 200 && res.ct.includes('application/json')
    && res.json?.audioUrl === c.expectedUrl && res.json?.audioUrl === local.cdnUrl
    && res.json?.cached === true;
  if (good) hotPass++;
  else console.log(`  ❌ "${c.text}" G${c.grade} @${c.speed}: status=${res.status} ct=${res.ct} cached=${res.json?.cached}\n     线上 ${res.json?.audioUrl}\n     本地 ${local.cdnUrl}\n     基准 ${c.expectedUrl}`);
}
ok(hotPass === HOT_N, `热路径 ${hotPass}/${HOT_N} 条：URL 三方一致(线上=本地=Phase A 基准) 且 cached=true`);

// ---------- 2) 冷路径 ----------
const probes = [];
if (COLD_N > 0) {
  console.log(`\n=== 冷路径复验 ${COLD_N} 条（一次性探针文本，会真的合成）===`);
  const words = ['alpha', 'bravo', 'charlie', 'delta', 'echo'];
  for (let i = 0; i < COLD_N; i++) {
    const text = `b2 alignment probe ${words[i % words.length]} ${STAMP}`;
    const local = await buildUrl({ text, voiceId: 'el:lily', speed: 0.85 }, req);
    const pre = await fetch(local.cdnUrl, { method: 'HEAD' });
    const res = await post({ text, voiceId: 'el:lily', speed: 0.85, format: 'url' });
    const isJson = res.ct.includes('application/json');
    const shapeOk = isJson && typeof res.json?.audioUrl === 'string' && res.json.audioUrl.startsWith('http')
      && res.json?.cached === false && res.json?.mimeType === 'audio/mpeg' && typeof res.json?.provider === 'string';
    const urlOk = res.json?.audioUrl === local.cdnUrl;
    let dl = { status: 0 }, info = { frames: 0, seconds: 0 };
    if (urlOk) {
      const g = await fetch(local.cdnUrl);
      dl = { status: g.status, bytes: 0 };
      if (g.ok) { const b = Buffer.from(await g.arrayBuffer()); dl.bytes = b.length; info = mp3Info(b); }
    }
    console.log(`  探针 "${text}"`);
    ok(pre.status !== 200, '    合成前对象确实不存在（真冷路径）', `HEAD=${pre.status}`);
    ok(shapeOk, '    响应为 JSON 且字段齐全 cached=false/mimeType/provider', `ct=${res.ct} provider=${res.json?.provider}`);
    ok(urlOk, '    audioUrl 与本地代码构造逐字相等', urlOk ? '' : `线上 ${res.json?.audioUrl} vs 本地 ${local.cdnUrl}`);
    ok(dl.status === 200 && info.frames > 0 && info.seconds > 0.2,
      '    新对象可下载且解析出真实音频', `${dl.bytes}B / ${info.frames} 帧 / ${info.seconds.toFixed(2)}s / ${info.sampleRate}Hz`);
    probes.push({ text, path: local.path, url: local.cdnUrl, bytes: dl.bytes, seconds: +info.seconds.toFixed(2) });
  }
}

// ---------- 3) 前端解析兼容性 ----------
console.log('\n=== 前端 fetchTTS 解析兼容性（src/lib/speak.ts:436-447 的判定顺序）===');
const sample = await post({ text: fx.cases[0].text, voiceId: 'el:lily', speed: fx.cases[0].speed, format: 'url' });
ok(sample.ct.includes('application/json'), 'content-type 命中 application/json 分支（不会走 audio/ 或 unexpected 分支）', sample.ct);
ok(typeof sample.json?.audioUrl === 'string' && sample.json.audioUrl.startsWith('http'), 'data.audioUrl 存在且是 http URL — 直接被当作播放地址');

if (probes.length) {
  console.log('\n探针对象（如需清理，删这些 storage path 即可）：');
  for (const p of probes) console.log(`  tts-audio / ${p.path}   ${p.bytes}B ${p.seconds}s   "${p.text}"`);
}
console.log(fail === 0 ? '\n✅ 全部通过' : `\n❌ 失败 ${fail} 项`);
process.exit(fail === 0 ? 0 : 1);
