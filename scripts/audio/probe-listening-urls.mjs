#!/usr/bin/env node
/**
 * `junior_listening_exercises.audio_url` 存活探测（初中 + 高中）。
 *
 * 为什么要单独一项巡检：这批预生成 MP3 **不经运行时 cache key**，
 * `audit-audio.mjs` 的可达集里根本没有它们 —— 覆盖率 100% 也证明不了这些 URL 还活着。
 * 而播放侧一旦拿不到文件，现在会回落 TTS（见 lib/juniorHub/playListeningAudio.ts），
 * 但回落的是**实时合成**：慢、且与预生成音频不同音色。所以死链要当场知道，不能等用户反馈。
 *
 * 判据与其它探测一致：**200 且 ≥2KB 才算活**；429/5xx/超时会退避重试，
 * 重试用完仍没有确定答案的记 `unknown` —— 不当成死链（把不确定说成结论是另一类错误）。
 *
 * 退出码：0 = 全活；1 = 有死链；2 = 配置/取数错误；3 = 有 unknown（本轮结论不可信，降并发重跑）。
 */
import fs from 'node:fs';
import path from 'node:path';
import { REPO } from './extract.mjs';
import { loadDbEnv, fetchTableRows, TableSourceError } from './table-source.mjs';

const argv = process.argv.slice(2);
const arg = (f, d) => { const i = argv.lastIndexOf(f); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const CONC = Number(arg('--concurrency', '4'));
const OUT = arg('--out', 'data/audio-audit/listening_url_probe.json');
const MIN_BYTES = 2048;

const head = async (url, attempts = 5) => {
  for (let a = 0; a < attempts; a++) {
    try {
      const r = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(20000) });
      if ([200, 400, 403, 404].includes(r.status)) {
        return { status: r.status, bytes: Number(r.headers.get('content-length') || 0) };
      }
    } catch { /* 退避重试 */ }
    await new Promise((x) => setTimeout(x, 800 * 2 ** a + Math.floor(Math.random() * 300)));
  }
  return { status: 0, bytes: 0 }; // unknown
};

async function main() {
  let rows;
  try {
    const db = loadDbEnv(REPO);
    rows = await fetchTableRows(db, {
      table: 'junior_listening_exercises',
      select: 'id,grade,volume,unit,publisher,audio_url',
      filters: {},
      orderBy: 'id',
    });
  } catch (e) {
    console.error(e instanceof TableSourceError ? e.message : String(e));
    return 2;
  }
  const withUrl = rows.filter((r) => r.audio_url);
  console.log(`junior_listening_exercises 共 ${rows.length} 行，其中有 audio_url 的 ${withUrl.length} 行（无 URL 的 ${rows.length - withUrl.length} 行走实时 TTS，不在本项范围）`);

  const results = [];
  let done = 0;
  const q = [...withUrl];
  const worker = async () => {
    for (let r = q.shift(); r; r = q.shift()) {
      const h = await head(r.audio_url);
      results.push({ ...r, ...h });
      if (++done % 200 === 0) console.log(`  已探 ${done}/${withUrl.length}`);
    }
  };
  await Promise.all(Array.from({ length: CONC }, worker));

  const alive = results.filter((r) => r.status === 200 && r.bytes >= MIN_BYTES);
  const unknown = results.filter((r) => r.status === 0);
  const dead = results.filter((r) => r.status !== 0 && !(r.status === 200 && r.bytes >= MIN_BYTES));

  const bySeg = (list) => {
    const m = {};
    for (const r of list) {
      const seg = /^(required|elective)/.test(String(r.volume)) ? 'senior' : 'junior';
      m[seg] = (m[seg] ?? 0) + 1;
    }
    return m;
  };
  console.log(`\n存活 ${alive.length} / 死链 ${dead.length} / 未探明 ${unknown.length}`);
  console.log(`  存活按学段: ${JSON.stringify(bySeg(alive))}`);
  if (dead.length) {
    console.log(`\n❌ 死链 ${dead.length} 条（全部列出）：`);
    for (const d of dead) console.log(`   HTTP ${d.status} ${d.bytes}B  ${d.publisher} ${d.volume}/${d.unit}  ${d.audio_url}`);
  }
  if (unknown.length) {
    console.log(`\n⚠ 未探明 ${unknown.length} 条（重试用完仍是 429/5xx/超时）—— 既不能算活也不能算死，降低 --concurrency 后重跑`);
    for (const u of unknown.slice(0, 10)) console.log(`   ? ${u.publisher} ${u.volume}/${u.unit} ${u.audio_url}`);
  }

  fs.mkdirSync(path.dirname(path.join(REPO, OUT)), { recursive: true });
  fs.writeFileSync(path.join(REPO, OUT), JSON.stringify({
    checkedAt: new Date().toISOString(),
    total: withUrl.length,
    alive: alive.length,
    dead: dead.map((d) => ({ id: d.id, publisher: d.publisher, volume: d.volume, unit: d.unit, status: d.status, bytes: d.bytes, audio_url: d.audio_url })),
    unknown: unknown.map((u) => ({ id: u.id, audio_url: u.audio_url })),
  }, null, 1), 'utf8');
  console.log(`\n结构化结果 → ${OUT}`);

  if (unknown.length) return 3;
  return dead.length ? 1 : 0;
}

const code = await main();
process.exitCode = code;
setTimeout(() => process.exit(code), 8000).unref();
