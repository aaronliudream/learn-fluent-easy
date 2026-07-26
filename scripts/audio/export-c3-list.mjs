#!/usr/bin/env node
/**
 * 从音频审计结果里导出「存储缺失(C3)」的待补清单，供 backfill-missing-audio.ts 消费。
 *
 * 用法：
 *   node scripts/audio/export-c3-list.mjs \
 *     --status data/audio-audit/primary_audio_status.csv \
 *     --exclude data/audio-audit/p0_silent_set.csv \
 *     --out data/audio-audit/b3_backfill_list.csv
 *
 * --exclude 可给多次，用于排除已经补过的批次（按 cache_key 匹配）。
 * 输出按 cache_key 去重（同一文本+语速在多个调用点复用同一个音频对象，只需生成一次）。
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { parseCsv, escapeCell as esc } from './csv.mjs';

const args = process.argv.slice(2);
const arg = (f, d) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : d; };
const argAll = (f) => args.reduce((acc, v, i) => (v === f ? [...acc, args[i + 1]] : acc), []);

const STATUS = arg('--status', 'data/audio-audit/primary_audio_status.csv');
const OUT = arg('--out', 'data/audio-audit/b3_backfill_list.csv');
const EXCLUDES = argAll('--exclude');


const rows = parseCsv(readFileSync(STATUS, 'utf8'));
const excluded = new Set();
for (const f of EXCLUDES) for (const r of parseCsv(readFileSync(f, 'utf8'))) excluded.add(r.cache_key);

const seen = new Set();
const out = [];
let skippedExcluded = 0;
for (const r of rows) {
  if (r.verdict !== 'C3_MISSING') continue;
  if (excluded.has(r.cache_key)) { skippedExcluded++; continue; }
  if (seen.has(r.cache_key)) continue;
  seen.add(r.cache_key);
  out.push({
    cache_key: r.cache_key,
    text: r.raw_text,
    voice_id: 'el:lily',
    speed: r.speed,
    cdn_url: r.cdn_url,
    storage_url: r.storage_url,
    source_ref: r.source_ref,
    record_id: r.record_id,
    field: r.field,
  });
}

const COLS = ['cache_key', 'text', 'voice_id', 'speed', 'cdn_url', 'storage_url', 'source_ref', 'record_id', 'field'];
writeFileSync(OUT, '﻿' + [COLS.join(',')].concat(out.map((r) => COLS.map((c) => esc(r[c])).join(','))).join('\n') + '\n', 'utf8');

const tally = (f) => out.reduce((m, r) => ((m[f(r)] = (m[f(r)] ?? 0) + 1), m), {});
console.log(`输入 ${STATUS}: ${rows.length} 行`);
console.log(`排除清单命中(已补过): ${skippedExcluded} 行`);
console.log(`输出 ${OUT}: ${out.length} 个唯一对象`);
console.log('按语速:', tally((r) => r.speed));
console.log('按来源:', tally((r) => r.source_ref.split('/').pop()));
console.log('总字符数:', out.reduce((n, r) => n + r.text.length, 0));
