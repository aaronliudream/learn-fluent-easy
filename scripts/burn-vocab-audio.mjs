/**
 * 托福词汇八段音频攒批 —— 一次烧全部待烧清单。
 *
 * 定版参数(Aaron 2026-08-07):tts-1 · alloy · speed 1 · accent 空
 *   edge 的存储键 = sha256(`provider|voice|speed|accentUpper|text`),
 *   库里现存音频全部是 `openai|alloy|1||text`(由文件名反解证实)。
 *   ⚠️ 别把 accent 改成 'US':结果音色凑巧一样,但 accentUpper 进哈希,
 *      'US' 与 '' 是两个键,会分叉出一批重复文件。
 *
 * ⚰️ G 段 syllable(拆读)**已于 2026-08-08 整条删除**,详见 JOBS 里的墓碑注释。
 *
 * 复用既有 tts edge(它负责合成 + 上传 CDN + 返回 audioUrl),不自己算 hash。
 *
 * ⚠️ 不写 DB —— 只产出回填 SQL 交 Aaron 次日跑。
 * ⚠️ 断点续跑:每批落盘 checkpoint,中断后重跑自动跳过已完成。
 * ⚠️ 失败重试 3 次后**记账不静默跳过**,最后统一报账。
 *
 *   node scripts/burn-vocab-audio.mjs --probe     # 每类各烧 1 条验证,不写 checkpoint
 *   node scripts/burn-vocab-audio.mjs --all       # 全量
 *   node scripts/burn-vocab-audio.mjs --all --only=example   # 单类;未知 key 会报错退出
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import path from 'node:path';

const env = Object.fromEntries(readFileSync('.env', 'utf8').split(/\r?\n/).filter(l => l.includes('='))
  .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const SUP = env.VITE_SUPABASE_URL, ANON = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const sb = createClient(SUP, ANON);
const TTS_URL = `${SUP}/functions/v1/tts`;

const VOICE = 'alloy';          // 与已烧的 594 条例句一致(speakUS 体系)
const SPEED = 1.0;
const CONCURRENCY = 6;
const RETRY = 3;

const OUT = 'vocab-audio-out';
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
const CKPT = path.join(OUT, 'checkpoint.json');
const e = s => String(s).replace(/'/g, "''");
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ══════ 11 类待烧任务 ══════
   text(row) 决定烧什么;col 决定回填哪一列。 */
const JOBS = [
  { key: 'word',        table: 'vocab_words',        col: 'audio_url',            idCol: 'id',
    select: 'id, headword', filter: q => q.is('audio_url', null),   text: r => r.headword },
  /* ⚰️ 'syllable'(G 段拆读)已于 2026-08-08 整条删除,别再加回来。
     原实现:text = syllables.join('. ') + '.',即 "cel. e. bra. ted."。
     OpenAI TTS 把每个音节当独立句子读 —— 各带完整重音和句末降调,
     celebrated 的 e 被读成字母音 /iː/ 而不是音节音 /ə/;
     实测拆读时长普遍是整词的 2 倍上下,全是句间停顿堆出来的。
     Aaron 裁决:整档去掉,不重烧。前端改用「整词音频 + 0.7 倍保音高慢放」
     (src/lib/vocab/earTraining.ts 的 timeStretch,WSOLA,零音频成本)。
     库里那 4471 条 syllable_audio_url 留着备查但前端不再引用;
     syllables 数组保留(切分是对的,将来做视觉逐音节高亮还用得上)。 */
  { key: 'example',     table: 'vocab_examples',     col: 'audio_url',            idCol: 'id',
    select: 'id, sentence', filter: q => q.is('audio_url', null),   text: r => r.sentence },
  { key: 'collocation', table: 'vocab_collocations', col: 'audio_url',            idCol: 'id',
    select: 'id, collocation', filter: q => q.is('audio_url', null), text: r => r.collocation },
  { key: 'chunk',       table: 'vocab_chunks',       col: 'audio_url',            idCol: 'id',
    select: 'id, chunk', filter: q => q.is('audio_url', null),      text: r => r.chunk },
  { key: 'chunk_ex',    table: 'vocab_chunks',       col: 'example_audio_url',    idCol: 'id',
    select: 'id, example_en', filter: q => q.is('example_audio_url', null).not('example_en', 'is', null), text: r => r.example_en },
  { key: 'rendition',   table: 'vocab_cn_renditions', col: 'audio_url',           idCol: 'id',
    select: 'id, rendition', filter: q => q.is('audio_url', null),  text: r => r.rendition },
  { key: 'rend_ex',     table: 'vocab_cn_renditions', col: 'example_audio_url',   idCol: 'id',
    select: 'id, example_en', filter: q => q.is('example_audio_url', null), text: r => r.example_en },
  { key: 'scene_item',  table: 'vocab_scene_items',  col: 'audio_url',            idCol: 'id',
    select: 'id, text_en', filter: q => q.is('audio_url', null),    text: r => r.text_en },
  { key: 'essay_full',  table: 'vocab_scene_packs',  col: 'essay_full_audio_url', idCol: 'id',
    select: 'id, essay_full_en', filter: q => q.is('essay_full_audio_url', null), text: r => r.essay_full_en },
  { key: 'essay_short', table: 'vocab_scene_packs',  col: 'essay_short_audio_url', idCol: 'id',
    select: 'id, essay_short_en', filter: q => q.is('essay_short_audio_url', null), text: r => r.essay_short_en },
];

async function synth(text) {
  for (let a = 1; a <= RETRY; a++) {
    try {
      const res = await fetch(TTS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: ANON, Authorization: `Bearer ${ANON}` },
        body: JSON.stringify({ text, voiceId: VOICE, speed: SPEED, format: 'url' }),
      });
      if (res.status === 429) { await sleep(3000 * a); continue; }
      if (!res.ok) { if (a === RETRY) return { err: `HTTP ${res.status} ${(await res.text()).slice(0, 100)}` }; await sleep(1200 * a); continue; }
      const d = await res.json();
      if (d?.audioUrl) return { url: d.audioUrl };
      if (a === RETRY) return { err: 'edge 未返回 audioUrl' };
    } catch (ex) { if (a === RETRY) return { err: String(ex).slice(0, 100) }; await sleep(1200 * a); }
  }
  return { err: '重试用尽' };
}

/** PostgREST 硬顶 1000 行 —— 必须翻页(踩过多次) */
async function fetchAll(job) {
  const rows = []; const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    let q = sb.from(job.table).select(job.select).order(job.idCol).range(from, from + PAGE - 1);
    const { data, error } = await job.filter(q);
    if (error) { console.log(`  ❌ 拉取 ${job.key}: ${error.message}`); break; }
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE) break;
  }
  return rows;
}

const PROBE = process.argv.includes('--probe');
const ONLY = process.argv.find(a => a.startsWith('--only='))?.split('=')[1];

/* ⚠️ 未知的 --only 必须**响亮失败**。
   下面那个循环是 `if (ONLY && job.key !== ONLY) continue`,拼错或用了已删除的 key
   会静默跳过每一个 job,然后报一句"0 条待烧" —— 看起来像"已经烧完了",
   实际是什么都没跑。这类假绿最难查,所以在这里就拦死。 */
if (ONLY && !JOBS.some(j => j.key === ONLY)) {
  const hint = ONLY === 'syllable'
    ? '\n  ⚰️ syllable(拆读)已于 2026-08-08 整条删除:TTS 把 "cel. e. bra. ted." 当独立句子读,\n' +
      '     已判废、不重烧。前端改用整词音频 + 0.7 倍保音高慢放,见 src/lib/vocab/earTraining.ts。'
    : '';
  console.error(`✗ --only=${ONLY} 不是有效的 job。可用:${JOBS.map(j => j.key).join(' / ')}${hint}`);
  process.exit(1);
}

const ck = existsSync(CKPT) ? JSON.parse(readFileSync(CKPT, 'utf8')) : { done: {}, failed: {} };
for (const j of JOBS) { ck.done[j.key] ??= {}; ck.failed[j.key] ??= {}; }

const t0 = Date.now();
let totalOk = 0, totalFail = 0;

for (const job of JOBS) {
  if (ONLY && job.key !== ONLY) continue;
  const all = await fetchAll(job);
  const todo = all.filter(r => !ck.done[job.key][r[job.idCol]]);
  const slice = PROBE ? todo.slice(0, 1) : todo;
  if (!slice.length) { console.log(`· ${job.key}: 无待烧`); continue; }
  console.log(`\n· ${job.key} (${job.table}.${job.col}):待烧 ${todo.length}${PROBE ? ' → 试烧 1 条' : ''}`);

  let ok = 0, fail = 0, n = 0;
  const queue = [...slice];
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
    while (queue.length) {
      const r = queue.shift();
      const text = String(job.text(r) ?? '').trim();
      if (!text) { ck.failed[job.key][r[job.idCol]] = '空文本'; fail++; continue; }
      const res = await synth(text);
      if (res.url) { ck.done[job.key][r[job.idCol]] = res.url; ok++; delete ck.failed[job.key][r[job.idCol]]; }
      else { ck.failed[job.key][r[job.idCol]] = res.err; fail++; }
      if (PROBE) console.log(`    「${text.slice(0, 60)}」→ ${res.url ?? '❌ ' + res.err}`);
      if (++n % 100 === 0) {
        writeFileSync(CKPT, JSON.stringify(ck), 'utf8');
        const el = (Date.now() - t0) / 1000;
        console.log(`    ${n}/${slice.length}  成 ${ok} 败 ${fail}  用时 ${Math.round(el)}s  速率 ${(n / el).toFixed(1)}/s`);
      }
    }
  }));
  if (!PROBE) writeFileSync(CKPT, JSON.stringify(ck), 'utf8');
  console.log(`  → ${job.key}:成 ${ok} 败 ${fail}`);
  totalOk += ok; totalFail += fail;
}

if (PROBE) { console.log('\n试烧结束(未写 checkpoint,未出 SQL)。'); process.exit(0); }

/* ══════ 出回填 SQL(每类一份,避免单文件过大)══════ */
let manifest = [];
for (const job of JOBS) {
  const pairs = Object.entries(ck.done[job.key] ?? {});
  if (!pairs.length) continue;
  const SHARD = 6000;
  for (let i = 0; i < pairs.length; i += SHARD) {
    const part = pairs.slice(i, i + SHARD);
    const n = Math.ceil(pairs.length / SHARD) > 1 ? `_p${i / SHARD + 1}of${Math.ceil(pairs.length / SHARD)}` : '';
    const f = `vocab_audio_${job.key}${n}.sql`;
    writeFileSync(path.join(OUT, f),
      `-- 音频回填 · ${job.key} → ${job.table}.${job.col}(${part.length} 行)\n`
      + `-- 定版:tts-1 · alloy · speed 1 · accent 空(哈希键 openai|alloy|1||text)\n`
      + `-- ⚠️ 由 Aaron 执行。幂等:只填 NULL 行,重跑无害。\n`
      /* ⚠️ validate 按**本片 id 列表**判,不是全表 IS NULL = 0(Aaron 2026-08-07 裁决)。
         分批回填时全表判据必然为 f —— 那不是缺陷,是"其他批还没跑",
         用它当通过条件等于中间态永远报错,判据本身失效。 */
      + `-- ⚠️ validate 判据 = **本片 ${part.length} 行全部非空**(不是全表无空缺)——\n`
      + `--    分批回填的中间态下,全表判据必然为 f,那样的判据没有意义。\n\nBEGIN;\n\n`
      + `WITH v(id, url) AS (VALUES\n`
      + part.map(([id, url]) => `  ('${id}'::uuid, '${e(url)}')`).join(',\n')
      + `\n), upd AS (\n`
      + `  UPDATE ${job.table} t SET ${job.col} = v.url\n`
      + `    FROM v WHERE t.${job.idCol} = v.id AND t.${job.col} IS NULL\n`
      + `  RETURNING t.${job.idCol}\n)\n`
      + `SELECT '本片 ${part.length} 行全部已回填' AS expect,\n`
      + `       NOT EXISTS (SELECT 1 FROM ${job.table} t JOIN v ON v.id = t.${job.idCol}\n`
      + `                    WHERE t.${job.col} IS NULL) AS ok,\n`
      + `       (SELECT count(*) FROM upd) AS 本次实改行数;\n\n`
      + `-- 参考(非通过条件):全表剩余空缺数,烧全后应为 0\n`
      + `SELECT '${job.table}.${job.col} 全表剩余空缺' AS info,\n`
      + `       (SELECT count(*) FROM ${job.table} WHERE ${job.col} IS NULL) AS remaining;\n\nCOMMIT;\n`, 'utf8');
    manifest.push(f);
  }
}

const failed = JOBS.flatMap(j => Object.entries(ck.failed[j.key] ?? {}).map(([id, err]) => `${j.key} ${id}: ${err}`));
writeFileSync(path.join(OUT, 'REPORT.md'),
  `# 音频攒批报账\n\n成 ${totalOk} · 败 ${failed.length} · 用时 ${Math.round((Date.now() - t0) / 60000)} 分钟\n\n`
  + `## 回填 SQL(${manifest.length} 份,按此顺序跑)\n\n${manifest.map(f => `- \`${f}\``).join('\n')}\n\n`
  + `每份末尾一条 count-validate:该列 \`IS NULL\` 行数 = 0,零漏配。\n\n`
  + `## 失败清单(${failed.length} 条)\n\n${failed.length ? failed.map(x => `- ${x}`).join('\n') : '无'}\n`
  + `\n⚠️ 失败项**未静默跳过**,重跑本脚本会自动只补这些(checkpoint 已记录成功项)。\n`, 'utf8');

console.log(`\n════ 完成 ════\n成 ${totalOk} · 败 ${failed.length} · 用时 ${Math.round((Date.now() - t0) / 60000)} 分钟`);
console.log(`→ ${OUT}/(${manifest.length} 份回填 SQL + REPORT.md)`);
