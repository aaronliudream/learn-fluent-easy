/**
 * junior 盘点的分组统计（只读）。
 *
 * 抽取仍然走 extract.mjs（禁止另写抽取逻辑），这里只做两件 extract 不该管的事：
 *   ① 把导出的缺口清单与「可达对象全集」对上，按 档位 / 内容源 / 出版社 分组
 *   ② 标出**自动播路径**上的缺口——那部分不是"慢 1–3 秒"，是**真静音**
 *
 * 出版社归属靠 record_id 回查 junior_vocab（publisher 不进 cache key，只用于报告）。
 *
 * 用法：node scripts/audio/junior-breakdown.mjs [--missing data/audio-audit/junior_missing.csv]
 */
import fs from 'node:fs';
import path from 'node:path';
import { loadConfig, checkCoverage, extractItems, REPO } from './extract.mjs';
import { loadDbEnv, fetchTableRows } from './table-source.mjs';
import { parseCsv, toCsv } from './csv.mjs';

const arg = (name, dflt) => {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : dflt;
};

/**
 * 自动播路径 = 冷 key 就是**静音**的地方（非手势 → speak/speakKid 只预热不出声）。
 * 依据 docs/audio/JUNIOR_1_speed_matrix.md §1.B / §1.C：
 *   - 闯关 听音选词 / 情景应答：mount 后 250ms playTwice
 *   - 词汇板块 默写游戏 DictationSession：useEffect 依赖 cur?.id，每换一词就读
 * 其余全是点击触发（冷合成 = 1–3s 延迟，不是静音）。
 */
const AUTOPLAY_FC_TYPES = new Set(['listen_and_choose_word', 'dialogue_response']);
const isAutoplay = (row, fcAutoplayIds) =>
  (row.field.endsWith('@userDefault') && row.record_id.startsWith('junior_vocab:') && !row.record_id.includes('#'))
  || fcAutoplayIds.has(row.record_id);

const main = async () => {
  const cfg = loadConfig('junior');
  const files = checkCoverage(cfg);
  const all = [...(await extractItems(cfg, { allFiles: files })).values()];

  // 闯关自动播两关的题目 id（从 seed 直接读 type，避免把填空/排序也算成自动播）
  const fcAutoplayIds = new Set();
  for (const rel of files.filter((f) => f.includes('finalChallenge'))) {
    for (const q of JSON.parse(fs.readFileSync(path.join(REPO, rel), 'utf8'))) {
      if (AUTOPLAY_FC_TYPES.has(q.type) && q.id) fcAutoplayIds.add(q.id);
    }
  }

  // 出版社归属：junior_vocab.id → publisher
  const db = loadDbEnv(REPO);
  const vocab = await fetchTableRows(db, {
    table: 'junior_vocab',
    select: 'id,publisher,grade',
    filters: { grade: 'in.(7,8,9)' },
    orderBy: 'id',
  });
  const pubOf = new Map(vocab.map((r) => [r.id, r.publisher]));
  const publisherOf = (row) => {
    const m = /^junior_vocab:([^#]+)/.exec(row.record_id);
    if (!m) return row.source_ref.includes('fltrp') ? 'fltrp(JSON)' : '(非词表源)';
    return pubOf.get(m[1]) ?? '(查无此行)';
  };

  const missingPath = arg('--missing', 'data/audio-audit/junior_missing.csv');
  const abs = path.join(REPO, missingPath);
  if (!fs.existsSync(abs)) {
    console.error(`✗ 找不到缺口清单 ${missingPath}——先跑 export-content-audio-list.mjs --section junior`);
    process.exitCode = 2;
    return;
  }
  const missingKeys = new Set(parseCsv(fs.readFileSync(abs, 'utf8')).map((r) => r.cache_key));

  const tally = (rows, keyFn) => {
    const out = new Map();
    for (const r of rows) {
      const k = keyFn(r);
      const cur = out.get(k) ?? { total: 0, missing: 0 };
      cur.total++;
      if (missingKeys.has(r.cache_key)) cur.missing++;
      out.set(k, cur);
    }
    return [...out.entries()].sort((a, b) => b[1].total - a[1].total);
  };

  const line = (label, { total, missing }) =>
    `  ${String(label).padEnd(38)} 总 ${String(total).padStart(6)}   缺 ${String(missing).padStart(6)}   覆盖 ${((1 - missing / total) * 100).toFixed(1)}%`;

  const auto = all.filter((r) => isAutoplay(r, fcAutoplayIds));

  // --emit-batches：把缺口清单按 P0–P4 切成子清单，喂 backfill-missing-audio.ts --list。
  // 分批定义与上面的统计**共用同一份判据**（尤其"自动播"），不另写一套免得漂。
  if (process.argv.includes('--emit-batches')) {
    const missRows = parseCsv(fs.readFileSync(abs, 'utf8'));
    const byKey = new Map(all.map((r) => [r.cache_key, r]));
    const tierOf = (m) => (m.field.split('@')[1] ?? '');
    const fieldOf = (m) => m.field.split('@')[0];
    const isAuto = (m) => { const r = byKey.get(m.cache_key); return r ? isAutoplay(r, fcAutoplayIds) : false; };
    const batches = [
      ['p0_autoplay', (m) => isAuto(m)],
      ['p1_listening', (m) => !isAuto(m) && (m.field === 'transcript@userDefault' || fieldOf(m) === 'listeningQuestions.opts[answer]')],
      ['p2_words', (m) => !isAuto(m) && fieldOf(m) === 'word'],
      ['p3_chunks', (m) => !isAuto(m) && ['chunks.en', 'phrase_en', 'example_en'].includes(fieldOf(m))],
      ['p4_rest', () => true], // 兜底：前面没被认领的全在这里，保证四批之和 = 清单总数
    ];
    const left = new Set(missRows);
    const cols = ['cache_key', 'text', 'voice_id', 'speed', 'cdn_url', 'storage_url', 'source_ref', 'record_id', 'field'];
    console.log('\n分批清单（--emit-batches）：');
    let acc = 0;
    for (const [name, pred] of batches) {
      const picked = [...left].filter(pred);
      picked.forEach((m) => left.delete(m));
      const out = `data/audio-audit/junior_${name}.csv`;
      fs.writeFileSync(path.join(REPO, out), toCsv(cols, picked), 'utf8');
      const chars = picked.reduce((n, m) => n + m.text.length, 0);
      const el = picked.filter((m) => m.voice_id.startsWith('el:'));
      acc += picked.length;
      console.log(`  ${out.padEnd(44)} ${String(picked.length).padStart(5)} 条  ${String(chars).padStart(7)} 字符  (elevenlabs ${el.length} 条/${el.reduce((n, m) => n + m.text.length, 0)} 字符)`);
    }
    if (acc !== missRows.length) { console.error(`✗ 分批之和 ${acc} ≠ 清单 ${missRows.length}`); process.exitCode = 2; return; }
    console.log(`  分批之和 ${acc} = 清单总数 ${missRows.length} ✓`);
    return;
  }
  console.log(`可达对象 ${all.length}  缺口 ${missingKeys.size}  覆盖 ${((1 - missingKeys.size / all.length) * 100).toFixed(1)}%\n`);
  console.log('按档位：');
  for (const [k, v] of tally(all, (r) => r.field.split('@')[1])) console.log(line(k, v));
  console.log('\n按字段：');
  for (const [k, v] of tally(all, (r) => r.field)) console.log(line(k, v));
  console.log('\n按内容源：');
  for (const [k, v] of tally(all, (r) => r.source_ref)) console.log(line(k, v));
  console.log('\n按出版社（仅词表源，publisher 不进 key、只用于报告）：');
  for (const [k, v] of tally(all.filter((r) => r.record_id.startsWith('junior_vocab:')), publisherOf)) console.log(line(k, v));
  console.log(`\n自动播路径（冷 key = 真静音，不是延迟）：`);
  for (const [k, v] of tally(auto, (r) => (r.record_id.startsWith('junior_vocab:') ? '词汇板块 默写游戏(nova@0.85)' : '闯关 听音选词/情景应答(1.0)'))) console.log(line(k, v));
  console.log(line('小计', { total: auto.length, missing: auto.filter((r) => missingKeys.has(r.cache_key)).length }));
};

await main();
