/**
 * 词汇音频批量预生成:每词 1 条词音频 + 每词 3 条例句音频。
 *
 * 走线上 tts edge function(format:'url')。edge 的存储键是
 *     sha256(`${provider}|${voice}|${safeSpeed}|${accentUpper}|${text}`)
 * 参数对上了,前端 predictCdnUrl 猜出来的 URL 才和这里预生成的是同一个文件,
 * 否则用户点播还会现合成一遍,预生成白做、还多出一份重复文件。
 *
 * ⚠️ 定版参数 = voiceId 'alloy' · accent '' · speed 1(2026-08-08 统一)。
 *    依据不是猜的:拿库里现存音频的文件名(内容哈希)反解,20/20 命中
 *    `openai|alloy|1||<text>` —— 库里那 4470 条词音频和例句音频**全部**
 *    是这组参数烧的。
 *    此前这里默认 speed=0.95 / accent='US',和库里对不上;真按它补烧会
 *    生成一批哈希不同的重复文件,前端预测又指向另一个。
 *    ⚠️ 别把 accent 改回 'US':speak.ts:198 会因 accentUpper==='US'
 *       把 voice 强制成 'alloy'——结果凑巧一样,但 accentUpper 进哈希,
 *       'US' 与 '' 是两个不同的键,文件仍会分叉。
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
import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from 'node:fs';
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
const ACCENT = arg('accent', '');        // 定版:空(见文件头,不是 'US')
const SPEED = Number(arg('speed', '1'));  // 定版:1(见文件头,不是 0.95)
const THROTTLE_MS = Number(arg('throttle', '1200'));
const DRY = process.argv.includes('--dry-run');
/**
 * `--bank=all` —— **全库一遍过**,不按词库分。
 *
 * ⚠️ 为什么必须有这个:`vocab_words` 是全局唯一一张词表,一个词被多个库共享
 *    (ket_pet 那 3049 词整个是 中考∪高考∪四级 的子集;kaoyan 与 ielts 重合 3052 词)。
 *    逐库烧的话,同一个词会在好几个库的待办里各出现一次。
 *    edge 命中缓存**不花钱**,但**每次照样 sleep THROTTLE_MS** ——
 *    十个库叠起来,光等重复词就是好几个小时。
 *    全局一遍过:每个词、每条例句各访问一次,一次不多。
 *
 * `--only=words|examples` —— 只烧其中一类(Aaron 2026-08-11 定:词条优先于例句)。
 * `--limit=N` —— 只处理前 N 条,用来实测速率。
 */
const ALL_BANKS = arg('bank', 'toefl') === 'all';
const ONLY = arg('only', 'both');
const LIMIT = Number(arg('limit', '0')) || 0;
/**
 * `--concurrency=N` —— 并发合成。
 *
 * ⚠️ 原来是**严格串行 + 每条 sleep**。实测:串行 throttle=1200 是 3.27 秒/条,
 *    降到 throttle=300 是 2.18 秒/条(其中约 1.9 秒是真实请求,压不动)。
 *    按 2.18 算,词条 10305 条要 6.2 小时、例句 30915 条(文本更长)20 小时以上 ——
 *    **钱只要 $34,时间却要一天多**,瓶颈在这儿,不在预算。并发是唯一的杠杆。
 * ⚠️ 429/5xx 退避与账户级错误中止都在 synth 里,与并发无关,照旧生效。
 */
const CONCURRENCY = Math.max(1, Number(arg('concurrency', '1')) || 1);
/* --shards=N:回填 SQL 切成 N 份各自独立的文件(同一个出口,不另写切分脚本)。 */
const SHARDS = Math.max(1, Number(arg('shards', '1')) || 1);
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

/**
 * 账户级错误:重试多少次都没用,整轮必须立刻停。
 *
 * ⚠️ 为什么要专门认它:OpenAI 余额耗尽回的是 **429**,edge 又把它包成 **502**,
 *    和真限流长得一模一样 —— 但**响应体**里写着 `credit_balance_exhausted`。
 *    不看体就退避重试的话,每条白等 2+4+8+16+32=62 秒,还会被 per-item 的
 *    catch 吞掉继续下一条:4470 条能空跑一整夜,日志里全是"限流,重试中"。
 *    2026-08-08 真踩过 —— 我把余额耗尽误报成了限流。
 */
const FATAL_PATTERNS = ['credit_balance_exhausted', 'insufficient_quota', 'billing_hard_limit_reached'];
function fatalIfAccountError(status, body) {
  if (!FATAL_PATTERNS.some(p => body.includes(p))) return;
  const e = new Error(
    `TTS 账户不可用(HTTP ${status})—— 重试无效,已中止整轮。\n` +
    `   多半是余额用尽,去 https://platform.openai.com/settings/organization/billing/ 充值。\n` +
    `   原文:${body.slice(0, 300)}`
  );
  e.fatal = true;
  throw e;
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
      /* ⚠️ 必须先读体再决定退避 —— 账户级错误和限流同样是 429/502,只有体能区分 */
      const body = await res.text();
      fatalIfAccountError(res.status, body);
      const wait = 2000 * 2 ** backoff;
      process.stdout.write(`   · HTTP ${res.status},${wait}ms 后重试\n`);
      await sleep(wait);
      continue;
    }
    if (!res.ok) {
      const body = await res.text();
      fatalIfAccountError(res.status, body);
      throw new Error(`tts edge HTTP ${res.status}: ${body.slice(0, 160)}`);
    }
    const data = await res.json();
    if (!data?.audioUrl) throw new Error(`tts edge 没返回 audioUrl: ${JSON.stringify(data).slice(0, 160)}`);
    return { audioUrl: data.audioUrl, provider: data.provider, cached: !!data.cached };
  }
  throw new Error('tts edge 连续限流,放弃');
}

async function main() {
  mkdirSync(GEN, { recursive: true });
  const cachePath = path.join(GEN, `${ALL_BANKS ? 'all' : BANK}-audio.json`);
  const cache = existsSync(cachePath) ? JSON.parse(readFileSync(cachePath, 'utf8')) : { words: {}, examples: {} };

  if (EMIT_ONLY) { emit(cache); return; }

  // 只给已有内容的词配音;audio_url 已有的跳过(断点续跑)
  const words = [], examples = [];
  if (ALL_BANKS) {
    /* 全局一遍过。按 freq_rank 升序 —— 万一中途断了,先烧完的是最高频的词,
       那部分用户最常碰到,断点处的损失最小。 */
    if (ONLY !== 'examples') {
      words.push(...await restPaged('vocab_words', {
        select: 'id,headword,audio_url,def_zh',
        def_zh: 'not.is.null', audio_url: 'is.null',
        order: 'freq_rank.asc.nullslast',
      }));
    }
    if (ONLY !== 'words') {
      examples.push(...await restPaged('vocab_examples', {
        select: 'id,word_id,sort_order,sentence,audio_url',
        audio_url: 'is.null', order: 'word_id.asc,sort_order.asc',
      }));
    }
  } else {
    const ids = await bankWordIds();
    if (!ids.length) { process.stdout.write(`· ${BANK} 库里还没有词,先跑第一步的 batch1 SQL\n`); return; }
    for (let i = 0; i < ids.length; i += 100) {
      if (ONLY !== 'examples') words.push(...await rest('vocab_words', {
        select: 'id,headword,audio_url,def_zh',
        id: `in.(${ids.slice(i, i + 100).join(',')})`,
        def_zh: 'not.is.null', audio_url: 'is.null',
        order: 'freq_rank.asc.nullslast',
      }));
      if (ONLY !== 'words') examples.push(...await rest('vocab_examples', {
        select: 'id,word_id,sort_order,sentence,audio_url',
        word_id: `in.(${ids.slice(i, i + 100).join(',')})`,
        audio_url: 'is.null', order: 'word_id.asc,sort_order.asc',
      }));
    }
  }

  let todoWords = words.filter(w => !cache.words[w.id]);
  let todoExamples = examples.filter(e => !cache.examples[e.id]);
  /* --limit:只处理前 N 条。用来**实测速率**再报工期,不拍脑袋估。 */
  if (LIMIT) { todoWords = todoWords.slice(0, LIMIT); todoExamples = todoExamples.slice(0, Math.max(0, LIMIT - todoWords.length)); }
  process.stdout.write(
    `· ${BANK}:待合成 词 ${todoWords.length}/${words.length} · 例句 ${todoExamples.length}/${examples.length}\n` +
    `  配置 voice=${VOICE} accent='${ACCENT}' speed=${SPEED}(与库内现存音频同参)\n`
  );

  if (DRY) { process.stdout.write('  (--dry-run:未调用 tts)\n'); return; }

  let done = 0, cached = 0;
  const total = todoWords.length + todoExamples.length;
  /**
   * 落缓存 —— **原子写**:先写临时文件,再 rename 覆盖。
   *
   * ⚠️ 由来(2026-08-12):原来直接 `writeFileSync(cachePath, ...)`。这个文件此刻已经
   *    3MB 多,单次写要好几十毫秒,而且**每合成一条就写一次**。
   *    这一轮真读到过半截 JSON(`Unterminated string at position 3194880`)——
   *    那次只是我并发去读,没事;但这一轮已经**被杀过三次**,
   *    只要有一次杀在写的中途,留下的就是个截断的 JSON,
   *    下次启动 `JSON.parse` 直接抛,**上万条进度全丢、几十美元重烧**。
   *    rename 在同一分区上是原子的:要么是旧的完整文件,要么是新的完整文件,
   *    不存在"写了一半的 cachePath"。
   */
  const tmpPath = cachePath + '.tmp';
  const save = () => {
    writeFileSync(tmpPath, JSON.stringify(cache, null, 2), 'utf8');
    renameSync(tmpPath, cachePath);
  };

  /* 词排在例句前面 —— Aaron 2026-08-11 定的顺序是"词条音频优先于例句音频"。
     worker 从同一个队列取,所以词天然先被取完。 */
  const queue = [
    ...todoWords.map(w => ({ kind: 'word', id: w.id, text: w.headword })),
    ...todoExamples.map(e => ({ kind: 'ex', id: e.id, text: e.sentence, word_id: e.word_id, sort_order: e.sort_order })),
  ];
  let fatal = null;
  const workers = Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
    while (queue.length && !fatal) {
      const job = queue.shift();
      try {
        const r = await synth(job.text);
        if (job.kind === 'word') {
          cache.words[job.id] = { headword: job.text, audio_url: r.audioUrl, provider: r.provider };
        } else {
          cache.examples[job.id] = { word_id: job.word_id, sort_order: job.sort_order, audio_url: r.audioUrl, provider: r.provider };
        }
        done++; if (r.cached) cached++;
        /* 并发下逐条打印会刷屏,每 50 条报一次进度就够 */
        if (done % 50 === 0 || done === total) {
          process.stdout.write(`  ✓ [${done}/${total}] ${job.kind === 'word' ? '词' : '例句'} ${job.text.slice(0, 40)}\n`);
        }
      } catch (e) {
        /* ⚠️ 账户级错误不能吞:吞了就会带着"每条都失败"把整批跑完。
           ⚠️ 并发下要**让所有 worker 都停** —— 只 throw 自己那条的话,
              其余 worker 还在继续,照样空跑几万条。所以设共享 fatal 标志。 */
        if (e.fatal) { fatal = e; save(); break; }
        process.stdout.write(`  ✗ ${job.kind === 'word' ? '词' : '例句'} ${job.text.slice(0, 30)}: ${e.message}\n`);
      }
      /* writeFileSync 是同步的,单线程里不会交错;并发下照样安全。
         每条都存 = 断点粒度是一条,中断最多丢正在飞的那几条。 */
      save();
      await sleep(THROTTLE_MS);
    }
  });
  await Promise.all(workers);
  if (fatal) throw fatal;

  process.stdout.write(`\n· 完成 ${done}/${total}(其中命中已有缓存 ${cached},没花 TTS 钱)\n`);
  emit(cache);
}

/**
 * 出回填 SQL。`--shards=N` 切成 N 份各自独立的文件。
 *
 * ⚠️ 切分走这个出口,**别另写切分脚本** —— 手搓第二个 SQL 生成器就是
 *    2026-08-09 那次 0-based sort_order 事故的来源。
 * ⚠️ 词音频和例句音频**按各自的行数独立切**:两者是两张表的两条 UPDATE,
 *    互不依赖,不像内容 SQL 那样"一个词的三条例句必须同片"。
 * ⚠️ 每片自带 BEGIN/COMMIT 与断言,顺序无所谓、单独跑任意一片都成立。
 */
function emit(cache) {
  const allWords = Object.entries(cache.words);
  const allEx = Object.entries(cache.examples);
  if (!allWords.length && !allEx.length) { process.stdout.write('· 缓存为空,无 SQL 可出\n'); return; }
  if (SHARDS > 1) {
    const perW = Math.ceil(allWords.length / SHARDS);
    const perE = Math.ceil(allEx.length / SHARDS);
    for (let i = 0; i < SHARDS; i++) {
      const w = allWords.slice(i * perW, (i + 1) * perW);
      const e = allEx.slice(i * perE, (i + 1) * perE);
      if (w.length || e.length) emitOne(w, e, { part: i + 1, of: SHARDS });
    }
    return;
  }
  emitOne(allWords, allEx, null);
}

function emitOne(wordRows, exRows, shard) {

  const esc = s => String(s).replace(/'/g, "''");
  const sql = `-- 词汇音频回填${shard ? `【第 ${shard.part}/${shard.of} 片】` : ''}:${wordRows.length} 词音频 + ${exRows.length} 例句音频
-- 生成: node scripts/vocab/generate-audio.mjs --bank=${BANK} --emit-sql
-- 合成配置: voice=${VOICE} accent='${ACCENT}' speed=${SPEED}
--           与库内现存音频同参(由文件名内容哈希反解证实:openai|alloy|1||text),
--           故前端 predictCdnUrl 猜到的就是这些文件,点播不会再现合成、也不分叉出重复文件。
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
  const label = ALL_BANKS ? 'all' : BANK;
  const suffix = shard ? `_part${shard.part}of${shard.of}` : '';
  const name = `vocab_${label}_audio_batch1${suffix}.sql`;
  const out = path.join(REPO, 'SQLAA', name);
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, sql, 'utf8');
  process.stdout.write(`· 音频回填 SQL(${wordRows.length} 词 + ${exRows.length} 例句) → SQLAA/${name}\n`);
}

main().catch(e => { process.stderr.write(`✗ ${e.stack || e.message}\n`); process.exit(1); });
