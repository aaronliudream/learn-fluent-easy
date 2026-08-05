/**
 * 词汇音频批量预生成:每词 1 条词音频 + 每词 3 条例句音频。
 *
 * 走线上 tts edge function(format:'url'),与前端 speakUS 完全同配置:
 *     voiceId = 'alloy' · accent = 'US' · speed = 0.95
 * 这三个值必须和 src/lib/speak.ts 的 normalizeForHash 一致 —— edge 的存储键是
 *     sha256(`${provider}|${voice}|${safeSpeed}|${accentUpper}|${text}`)
 * 对上了,前端 predictCdnUrl 猜出来的 URL 才和这里预生成的是同一个文件,
 * 否则用户点播还会现合成一遍,预生成白做。
 * (speak.ts:202 的 safeSpeed 兜底值就是 0.95,故这里取 0.95 而非 1.0)
 *
 * ⚠️ 不自己算 hash 拼 URL,一律用 edge 返回的 audioUrl 落库 ——
 *    edge 会按地区选 provider(openai / volcano),provider 进 hash,
 *    自己猜必错。这个坑踩过,见 memory「音频哑火治理」。
 *
 * ⚠️ 关于"vocab/ 前缀":做不到,且不该做。
 *    tts edge 的存储路径写死在 supabase/functions/tts/index.ts:333 —
 *        const path = `${hash.slice(0,2)}/${hash}.mp3`
 *    是内容寻址,没有按业务分目录的概念。要加 vocab/ 前缀必须改 edge 函数
 *    并重新部署,本轮明令禁止部署。而且内容寻址本身是有好处的:"system"
 *    这个词在托福库和初中库读音一样,全站只存一份、只花一次 TTS 钱。
 *    真要分目录再单独立项。
 *
 * 用法:
 *   node scripts/vocab/generate-audio.mjs --bank=toefl --dry-run   # 只统计,不合成
 *   node scripts/vocab/generate-audio.mjs --bank=toefl             # 全量合成 + 出回填 SQL
 *   node scripts/vocab/generate-audio.mjs --bank=toefl --emit-sql  # 只从缓存出 SQL
 *
 * 前置:第二步的内容 SQL 必须已经由 Aaron 跑过(要先有 def_zh 和例句)。
 *
 * ⚠️ 本脚本只读库 + 产出文件,绝不写库。SQL 一律交 Aaron 跑。
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv, requireKeys } from './env.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..');
const DATA = path.join(HERE, 'data');
const GEN = path.join(DATA, 'generated');

const arg = (k, d) => process.argv.find(a => a.startsWith(`--${k}=`))?.split('=').slice(1).join('=') ?? d;
const BANK = arg('bank', 'toefl');
const VOICE = arg('voice', 'alloy');
const ACCENT = arg('accent', 'US');
const SPEED = Number(arg('speed', '0.95'));
const THROTTLE_MS = Number(arg('throttle', '1200'));
const DRY = process.argv.includes('--dry-run');
const EMIT_ONLY = process.argv.includes('--emit-sql');

const ENV = loadEnv(REPO);
requireKeys(ENV, ['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY']);
const SUPA_URL = ENV.VITE_SUPABASE_URL;
const ANON = ENV.VITE_SUPABASE_PUBLISHABLE_KEY;
const TTS_URL = `${SUPA_URL}/functions/v1/tts`;

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function rest(pathname, params) {
  const url = new URL(`${SUPA_URL}/rest/v1/${pathname}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, { headers: { apikey: ANON, Authorization: `Bearer ${ANON}` } });
  if (!res.ok) throw new Error(`REST ${pathname} HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

/** ⚠️ PostgREST 单次最多 1000 行,一律翻页。 */
async function restPaged(pathname, params, page = 1000) {
  const out = [];
  for (let offset = 0; ; offset += page) {
    const chunk = await rest(pathname, { ...params, offset: String(offset), limit: String(page) });
    out.push(...chunk);
    if (chunk.length < page) return out;
  }
}

async function bankWordIds() {
  const banks = await rest('vocab_banks', { select: 'id', code: `eq.${BANK}` });
  if (!banks.length) throw new Error(`vocab_banks 里没有 code='${BANK}'`);
  const links = await restPaged('vocab_word_banks', { select: 'word_id', bank_id: `eq.${banks[0].id}` });
  return links.map(l => l.word_id);
}

/** 合成一条。返回 edge 实际给的 audioUrl。 */
async function synth(text) {
  for (let backoff = 0; backoff < 5; backoff++) {
    const res = await fetch(TTS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: ANON, Authorization: `Bearer ${ANON}` },
      body: JSON.stringify({ text, voiceId: VOICE, speed: SPEED, accent: ACCENT, format: 'url' }),
    });
    if (res.status === 429 || res.status >= 500) {
      const wait = 2000 * 2 ** backoff;
      process.stdout.write(`   · HTTP ${res.status},${wait}ms 后重试\n`);
      await sleep(wait);
      continue;
    }
    if (!res.ok) throw new Error(`tts edge HTTP ${res.status}: ${(await res.text()).slice(0, 160)}`);
    const data = await res.json();
    if (!data?.audioUrl) throw new Error(`tts edge 没返回 audioUrl: ${JSON.stringify(data).slice(0, 160)}`);
    return { audioUrl: data.audioUrl, provider: data.provider, cached: !!data.cached };
  }
  throw new Error('tts edge 连续限流,放弃');
}

async function main() {
  mkdirSync(GEN, { recursive: true });
  const cachePath = path.join(GEN, `${BANK}-audio.json`);
  const cache = existsSync(cachePath) ? JSON.parse(readFileSync(cachePath, 'utf8')) : { words: {}, examples: {} };

  if (EMIT_ONLY) { emit(cache); return; }

  const ids = await bankWordIds();
  if (!ids.length) { process.stdout.write(`· ${BANK} 库里还没有词,先跑第一步的 batch1 SQL\n`); return; }

  // 只给已有内容的词配音;audio_url 已有的跳过(断点续跑)
  const words = [];
  for (let i = 0; i < ids.length; i += 100) {
    words.push(...await rest('vocab_words', {
      select: 'id,headword,audio_url,def_zh',
      id: `in.(${ids.slice(i, i + 100).join(',')})`,
      def_zh: 'not.is.null',
      audio_url: 'is.null',
      order: 'freq_rank.asc.nullslast',
    }));
  }

  const examples = [];
  for (let i = 0; i < ids.length; i += 100) {
    examples.push(...await rest('vocab_examples', {
      select: 'id,word_id,sort_order,sentence,audio_url',
      word_id: `in.(${ids.slice(i, i + 100).join(',')})`,
      audio_url: 'is.null',
      order: 'word_id.asc,sort_order.asc',
    }));
  }

  const todoWords = words.filter(w => !cache.words[w.id]);
  const todoExamples = examples.filter(e => !cache.examples[e.id]);
  process.stdout.write(
    `· ${BANK}:待合成 词 ${todoWords.length}/${words.length} · 例句 ${todoExamples.length}/${examples.length}\n` +
    `  配置 voice=${VOICE} accent=${ACCENT} speed=${SPEED}(与 speakUS 一致)\n`
  );

  if (DRY) { process.stdout.write('  (--dry-run:未调用 tts)\n'); return; }

  let done = 0, cached = 0;
  const total = todoWords.length + todoExamples.length;
  const save = () => writeFileSync(cachePath, JSON.stringify(cache, null, 2), 'utf8');

  for (const w of todoWords) {
    try {
      const r = await synth(w.headword);
      cache.words[w.id] = { headword: w.headword, audio_url: r.audioUrl, provider: r.provider };
      done++; if (r.cached) cached++;
      process.stdout.write(`  ✓ [${done}/${total}] 词 ${w.headword}${r.cached ? ' (命中缓存)' : ''}\n`);
    } catch (e) {
      process.stdout.write(`  ✗ 词 ${w.headword}: ${e.message}\n`);
    }
    save();
    await sleep(THROTTLE_MS);
  }

  for (const ex of todoExamples) {
    try {
      const r = await synth(ex.sentence);
      cache.examples[ex.id] = { word_id: ex.word_id, sort_order: ex.sort_order, audio_url: r.audioUrl, provider: r.provider };
      done++; if (r.cached) cached++;
      process.stdout.write(`  ✓ [${done}/${total}] 例句 ${ex.sentence.slice(0, 44)}…${r.cached ? ' (命中缓存)' : ''}\n`);
    } catch (e) {
      process.stdout.write(`  ✗ 例句 ${ex.id}: ${e.message}\n`);
    }
    save();
    await sleep(THROTTLE_MS);
  }

  process.stdout.write(`\n· 完成 ${done}/${total}(其中命中已有缓存 ${cached},没花 TTS 钱)\n`);
  emit(cache);
}

function emit(cache) {
  const wordRows = Object.entries(cache.words);
  const exRows = Object.entries(cache.examples);
  if (!wordRows.length && !exRows.length) { process.stdout.write('· 缓存为空,无 SQL 可出\n'); return; }

  const esc = s => String(s).replace(/'/g, "''");
  const sql = `-- 词汇音频回填:${wordRows.length} 词音频 + ${exRows.length} 例句音频
-- 生成: node scripts/vocab/generate-audio.mjs --bank=${BANK} --emit-sql
-- 合成配置: voice=${VOICE} accent=${ACCENT} speed=${SPEED}(与前端 speakUS 一致,
--           故前端 predictCdnUrl 猜到的就是这些文件,点播不会再现合成)
-- ⚠️ audio_url 一律取 tts edge 实际返回值,不是本地猜的 hash。
-- ⚠️ 由 Aaron 执行。脚本本身从不写库。

BEGIN;

SELECT 'BEFORE' AS stage,
       (SELECT count(*) FROM vocab_words    WHERE audio_url IS NOT NULL) AS word_audio,
       (SELECT count(*) FROM vocab_examples WHERE audio_url IS NOT NULL) AS example_audio;

${wordRows.length ? `-- ① 词音频
UPDATE vocab_words w
   SET audio_url = v.audio_url, updated_at = now()
  FROM (VALUES
${wordRows.map(([id, r]) => `  ('${id}'::uuid, '${esc(r.audio_url)}')`).join(',\n')}
  ) AS v(id, audio_url)
 WHERE w.id = v.id;
` : '-- ① 词音频:本批无\n'}
${exRows.length ? `-- ② 例句音频
UPDATE vocab_examples e
   SET audio_url = v.audio_url
  FROM (VALUES
${exRows.map(([id, r]) => `  ('${id}'::uuid, '${esc(r.audio_url)}')`).join(',\n')}
  ) AS v(id, audio_url)
 WHERE e.id = v.id;
` : '-- ② 例句音频:本批无\n'}
SELECT 'AFTER' AS stage,
       (SELECT count(*) FROM vocab_words    WHERE audio_url IS NOT NULL) AS word_audio,
       (SELECT count(*) FROM vocab_examples WHERE audio_url IS NOT NULL) AS example_audio;

-- ── count-validate:五行都必须是 t,否则 ROLLBACK ──
SELECT 'word_audio = ${wordRows.length}' AS expect,
       (SELECT count(*) FROM vocab_words WHERE audio_url IS NOT NULL) = ${wordRows.length} AS ok
UNION ALL
SELECT 'example_audio = ${exRows.length}',
       (SELECT count(*) FROM vocab_examples WHERE audio_url IS NOT NULL) = ${exRows.length}
UNION ALL
SELECT 'no word left without audio (in ${BANK})',
       NOT EXISTS (
         SELECT 1 FROM vocab_words w
           JOIN vocab_word_banks wb ON wb.word_id = w.id
           JOIN vocab_banks b ON b.id = wb.bank_id AND b.code = '${BANK}'
          WHERE w.def_zh IS NOT NULL AND w.audio_url IS NULL
       )
UNION ALL
-- 例句侧的完整性,与上面词侧对称。少了这条,例句漏配也能一路绿灯过去。
SELECT 'no example left without audio (in ${BANK})',
       NOT EXISTS (
         SELECT 1 FROM vocab_examples e
           JOIN vocab_words w ON w.id = e.word_id
           JOIN vocab_word_banks wb ON wb.word_id = w.id
           JOIN vocab_banks b ON b.id = wb.bank_id AND b.code = '${BANK}'
          WHERE e.audio_url IS NULL
       )
UNION ALL
-- 全部指向 CDN 且是内容寻址路径,防止回填进半成品/空串。
SELECT 'every audio_url is a well-formed CDN url',
       NOT EXISTS (
         SELECT 1 FROM vocab_examples
          WHERE audio_url IS NOT NULL
            AND audio_url !~ '^https://audio\\.bigmooneducation\\.com/[0-9a-f]{2}/[0-9a-f]{64}\\.mp3$'
       );

COMMIT;
`;
  const out = path.join(REPO, 'SQLAA', `vocab_${BANK}_audio_batch1.sql`);
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, sql, 'utf8');
  process.stdout.write(`· 音频回填 SQL(${wordRows.length} 词 + ${exRows.length} 例句) → SQLAA/vocab_${BANK}_audio_batch1.sql\n`);
}

main().catch(e => { process.stderr.write(`✗ ${e.stack || e.message}\n`); process.exit(1); });
