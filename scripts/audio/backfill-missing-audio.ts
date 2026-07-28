#!/usr/bin/env node
/**
 * 批量补生成缺失的 TTS 音频对象（列表驱动，可断点续跑）。
 *
 * 设计前提：
 *   - 走线上 `tts` edge 的冷路径：命中缓存就原样返回，不存在才合成并 upsert 进 tts-audio 桶。
 *     因此本脚本**不碰 cache key 公式、不改 edge、不 deploy**——它只是"替用户先点一遍播放键"。
 *   - 清单驱动：要生成什么全部来自 --list 指定的 CSV，代码里不写死任何业务清单，
 *     B4 语速档补生成直接复用本脚本，只换清单。
 *
 * 清单 CSV 必需列：cache_key, text, voice_id, speed, cdn_url, storage_url
 *   （可由 scripts/audio/export-c3-list.mjs 生成）
 *
 * 用法：
 *   node scripts/audio/backfill-missing-audio.ts --list data/audio-audit/b3_backfill_list.csv
 *   node scripts/audio/backfill-missing-audio.ts --list <csv> --limit 20 --dry-run
 *   中断后重跑同一条命令即可续跑（进度在 --progress 指定的 JSON 里）。
 *
 * 退出码：0 = 无 failed；1 = 有 failed（明细见结果 CSV 与终端汇总）。
 */
import { readFileSync, writeFileSync, existsSync, renameSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
// CSV 解析统一走 csv.mjs（CRLF 安全，且有单测盯着）——不要在这里再写一份
import { parseCsv } from './csv.mjs';

// ---------------- CLI ----------------
const argv = process.argv.slice(2);
const arg = (flag: string, dflt: string): string => {
  const i = argv.indexOf(flag);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : dflt;
};
const flag = (f: string): boolean => argv.includes(f);

const LIST = arg('--list', 'data/audio-audit/b3_backfill_list.csv');
const OUT = arg('--out', 'data/audio-audit/b3_backfill_result.csv');
const PROGRESS = arg('--progress', 'data/audio-audit/backfill_progress.json');
const BATCH = Number(arg('--batch', '200'));
const CONCURRENCY = Number(arg('--concurrency', '3'));
const PAUSE_MS = Number(arg('--pause-ms', '5000'));
const LIMIT = Number(arg('--limit', '0'));
const DRY = flag('--dry-run');

// ---------------- env ----------------
const envText = readFileSync(resolve(process.cwd(), '.env'), 'utf8');
const env: Record<string, string> = Object.fromEntries(
  envText.split(/\r?\n/).filter((l) => l.includes('=')).map((l) => {
    const i = l.indexOf('=');
    return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')];
  }),
);
const TTS_URL = `${env.VITE_SUPABASE_URL}/functions/v1/tts`;
const ANON = env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!env.VITE_SUPABASE_URL || !ANON) throw new Error('.env 缺 VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY');

const MIN_BYTES = 2048; // 小于这个体积按"疑似空音频"处理（审计里 1920B 的 funny 就是这么被抓到的）

// ---------------- csv ----------------
type Row = {
  cache_key: string; text: string; voice_id: string; speed: string;
  cdn_url: string; storage_url: string; [k: string]: string;
};
const esc = (v: unknown): string => {
  const s = String(v ?? '');
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// ---------------- progress ----------------
type Result = {
  key: string; text: string;
  status: 'created' | 'skipped' | 'failed';
  cdn_status: number | string;
  bytes: number;
  needs_purge: 'yes' | 'no';
  reason: string;
  attempts: number;
  provider: string;
};
type Progress = { list: string; startedAt: string; updatedAt: string; done: Record<string, Result> };

let progress: Progress = { list: LIST, startedAt: new Date().toISOString(), updatedAt: '', done: {} };
if (existsSync(PROGRESS)) {
  try {
    const prev = JSON.parse(readFileSync(PROGRESS, 'utf8')) as Progress;
    if (prev.list === LIST) {
      progress = prev;
      console.log(`↻ 续跑：进度文件已有 ${Object.keys(prev.done).length} 条完成记录`);
    } else {
      console.log(`⚠ 进度文件对应的是另一个清单(${prev.list})，本次重新开始`);
    }
  } catch { console.log('⚠ 进度文件损坏，忽略'); }
}
function saveProgress(): void {
  progress.updatedAt = new Date().toISOString();
  mkdirSync(dirname(PROGRESS), { recursive: true });
  const tmp = `${PROGRESS}.tmp`;
  writeFileSync(tmp, JSON.stringify(progress, null, 1), 'utf8');
  renameSync(tmp, PROGRESS);
}

// ---------------- http helpers ----------------
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const jitter = (ms: number) => ms + Math.floor(Math.random() * 400);

/** HEAD 探测：返回 {status, bytes}。429/5xx/网络错误会退避重试。 */
async function head(url: string, attempts = 4): Promise<{ status: number; bytes: number }> {
  for (let a = 0; a < attempts; a++) {
    try {
      const r = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(25_000) });
      if (r.status === 200 || r.status === 400 || r.status === 404) {
        return { status: r.status, bytes: Number(r.headers.get('content-length') || 0) };
      }
      // 429 = CDN / Storage 侧限流；5xx = 网关抖动 —— 都退避重试
      await sleep(jitter(1500 * 2 ** a));
    } catch {
      await sleep(jitter(1200 * 2 ** a));
    }
  }
  return { status: 0, bytes: 0 };
}

type SynthOk = { ok: true; url: string; cached: boolean; provider: string; attempts: number };
type SynthErr = { ok: false; reason: string; attempts: number };

/**
 * 调 tts edge 合成。退避覆盖两类来源：
 *   - 429：edge / Supabase / CDN 侧限流
 *   - 502 + 5xx：edge 把 OpenAI 的错误（含 OpenAI 自己的 429/超时）包装成 502 返回
 */
async function synth(text: string, voiceId: string, speed: number): Promise<SynthOk | SynthErr> {
  const MAX = 5;
  let last = 'unknown';
  for (let a = 0; a < MAX; a++) {
    try {
      const r = await fetch(TTS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: ANON, Authorization: `Bearer ${ANON}` },
        body: JSON.stringify({ text, voiceId, speed, format: 'url' }),
        signal: AbortSignal.timeout(120_000),
      });
      if (r.status === 429) { last = 'http_429'; await sleep(jitter(3000 * 2 ** a)); continue; }
      if (r.status >= 500) {
        const body = await r.text();
        last = `http_${r.status}:${body.slice(0, 80)}`;
        await sleep(jitter(2000 * 2 ** a));
        continue;
      }
      if (!r.ok) return { ok: false, reason: `http_${r.status}`, attempts: a + 1 };
      const j = (await r.json()) as { audioUrl?: string; cached?: boolean; provider?: string; error?: string };
      if (!j.audioUrl) return { ok: false, reason: `edge_no_url:${j.error ?? ''}`.slice(0, 80), attempts: a + 1 };
      return { ok: true, url: j.audioUrl, cached: !!j.cached, provider: j.provider ?? '', attempts: a + 1 };
    } catch (e) {
      last = `network:${(e as Error).message}`.slice(0, 80);
      await sleep(jitter(1500 * 2 ** a));
    }
  }
  return { ok: false, reason: last, attempts: MAX };
}

// ---------------- one item ----------------
async function processRow(row: Row): Promise<Result> {
  const base: Omit<Result, 'status' | 'cdn_status' | 'bytes' | 'reason' | 'attempts' | 'provider'> = {
    key: row.cache_key, text: row.text, needs_purge: 'no',
  };
  // 1) 幂等探测
  const pre = await head(row.cdn_url);
  if (pre.status === 200 && pre.bytes >= MIN_BYTES) {
    return { ...base, status: 'skipped', cdn_status: pre.status, bytes: pre.bytes, reason: '', attempts: 0, provider: '' };
  }
  if (DRY) {
    return { ...base, status: 'skipped', cdn_status: pre.status, bytes: pre.bytes, reason: 'dry-run', attempts: 0, provider: '' };
  }
  // 2) 合成 + 复验（复验没过就再合成一次，最多 SYNTH_ROUNDS 轮）
  //
  // 为什么要重试整轮而不是只重试 HEAD：实测有 5 条 edge 返回了正确 URL、却没真正落库
  // （再调一次 edge 是 cached:false，说明上一轮的对象确实不存在；重试后 5/5 都好了）。
  // 高并发下 edge 侧的上传偶发失败，一次复验就判 failed 会把"本来能生成的"记成失败，
  // 让人去追一个并不存在的内容问题。
  const SYNTH_ROUNDS = 3;
  let s = await synth(row.text, row.voice_id || 'el:lily', Number(row.speed));
  if (!s.ok) {
    return { ...base, status: 'failed', cdn_status: pre.status, bytes: 0, reason: s.reason, attempts: s.attempts, provider: '' };
  }
  // edge 返回的 URL 必须与清单预测的一致，否则说明 key/URL 构造漂移了，必须炸出来
  if (s.url !== row.cdn_url) {
    return { ...base, status: 'failed', cdn_status: 0, bytes: 0, reason: `url_mismatch:${s.url}`.slice(0, 120), attempts: s.attempts, provider: s.provider };
  }
  // 3) 复验；没过就再合成一轮（edge 偶发"返回了 URL 但没落库"）
  let post = { status: 0, bytes: 0 };
  let st = { status: 0, bytes: 0 };
  for (let round = 1; ; round++) {
    await sleep(300 * round);
    post = await head(row.cdn_url);
    if (post.status === 200 && post.bytes >= MIN_BYTES) {
      return { ...base, status: 'created', cdn_status: post.status, bytes: post.bytes, reason: round > 1 ? `ok_after_${round}_rounds` : '', attempts: s.attempts, provider: s.provider };
    }
    if (post.status === 200 && post.bytes < MIN_BYTES) {
      return { ...base, status: 'failed', cdn_status: post.status, bytes: post.bytes, reason: `too_small_lt_${MIN_BYTES}B`, attempts: s.attempts, provider: s.provider };
    }
    // CDN 拿不到 → 看存储侧。存储有、CDN 没有 = CDN 负缓存，需要 purge，单列出来不静默
    st = await head(row.storage_url);
    if (st.status === 200 && st.bytes >= MIN_BYTES) {
      return { ...base, status: 'created', cdn_status: post.status, bytes: st.bytes, needs_purge: 'yes', reason: 'cdn_negative_cache', attempts: s.attempts, provider: s.provider };
    }
    if (round >= SYNTH_ROUNDS) break;
    // 两边都没有 → 上一轮 edge 其实没把对象落库，重新合成一次再验
    const again = await synth(row.text, row.voice_id || 'el:lily', Number(row.speed));
    if (!again.ok) break;
    if (again.url !== row.cdn_url) {
      return { ...base, status: 'failed', cdn_status: 0, bytes: 0, reason: `url_mismatch:${again.url}`.slice(0, 120), attempts: s.attempts + again.attempts, provider: again.provider };
    }
    s = { ...again, attempts: s.attempts + again.attempts };
  }
  return { ...base, status: 'failed', cdn_status: post.status, bytes: 0, reason: `verify_missing_after_${SYNTH_ROUNDS}_rounds(storage=${st.status})`, attempts: s.attempts, provider: s.provider };
}

// ---------------- main ----------------
const rowsAll = parseCsv(readFileSync(LIST, 'utf8'));
const rows = LIMIT > 0 ? rowsAll.slice(0, LIMIT) : rowsAll;
const todo = rows.filter((r) => !progress.done[r.cache_key]);
console.log(`清单 ${LIST}: ${rowsAll.length} 条${LIMIT ? `（--limit ${LIMIT}）` : ''}；本次待处理 ${todo.length} 条`);
console.log(`并发 ${CONCURRENCY} / 每批 ${BATCH} / 批间停顿 ${PAUSE_MS}ms${DRY ? ' / DRY-RUN' : ''}`);

let created = 0, skipped = 0, failed = 0, purge = 0, n = 0;
const t0 = Date.now();

for (let b = 0; b < todo.length; b += BATCH) {
  const batch = todo.slice(b, b + BATCH);
  const queue = [...batch];
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    for (;;) {
      const row = queue.shift();
      if (!row) return;
      const res = await processRow(row);
      progress.done[row.cache_key] = res;
      if (res.status === 'created') created++;
      else if (res.status === 'skipped') skipped++;
      else failed++;
      if (res.needs_purge === 'yes') purge++;
      n++;
      if (n % 25 === 0 || res.status === 'failed') {
        const rate = n / ((Date.now() - t0) / 1000);
        const eta = rate > 0 ? Math.round((todo.length - n) / rate) : 0;
        console.log(`  [${n}/${todo.length}] created=${created} skipped=${skipped} failed=${failed} purge=${purge} ~${eta}s 剩余` +
          (res.status === 'failed' ? `  ✗ "${res.text.slice(0, 40)}" ${res.reason}` : ''));
        saveProgress();
      }
    }
  }));
  saveProgress();
  if (b + BATCH < todo.length) {
    console.log(`— 批次 ${Math.floor(b / BATCH) + 1} 完成，停顿 ${PAUSE_MS}ms —`);
    await sleep(PAUSE_MS);
  }
}
saveProgress();

// ---------------- output ----------------
const results: Result[] = rows.map((r) => progress.done[r.cache_key]).filter(Boolean);
const COLS = ['key', 'text', 'status', 'cdn_status', 'bytes', 'needs_purge', 'reason', 'attempts', 'provider'];
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, '﻿' + [COLS.join(',')]
  .concat(results.map((r) => COLS.map((c) => esc((r as unknown as Record<string, unknown>)[c])).join(',')))
  .join('\n') + '\n', 'utf8');

const sum = (s: string) => results.filter((r) => r.status === s).length;
const purgeList = results.filter((r) => r.needs_purge === 'yes');
const failList = results.filter((r) => r.status === 'failed');
console.log('\n================ 汇总 ================');
console.log(`created     : ${sum('created')}`);
console.log(`skipped     : ${sum('skipped')}`);
console.log(`failed      : ${sum('failed')}`);
console.log(`needs_purge : ${purgeList.length}`);
console.log(`结果 CSV    : ${OUT}`);
console.log(`进度文件    : ${PROGRESS}`);
if (purgeList.length) {
  console.log('\n--- needs_purge（存储已有但 CDN 取不到，需要清 CDN 缓存）---');
  for (const r of purgeList) console.log(`  ${r.key}  cdn=${r.cdn_status}  "${r.text.slice(0, 50)}"`);
}
if (failList.length) {
  console.log('\n--- failed 明细 ---');
  const byReason: Record<string, number> = {};
  for (const r of failList) {
    const cat = r.reason.split(':')[0] || 'unknown';
    byReason[cat] = (byReason[cat] ?? 0) + 1;
    console.log(`  "${r.text.slice(0, 50)}" | ${r.reason} | cdn=${r.cdn_status} bytes=${r.bytes} attempts=${r.attempts}`);
  }
  console.log('  失败原因分类:', JSON.stringify(byReason));
}
process.exit(failList.length > 0 ? 1 : 0);
