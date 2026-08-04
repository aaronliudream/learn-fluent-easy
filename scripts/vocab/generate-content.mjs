/**
 * 词汇内容生成 pipeline —— **词库无关(bank-agnostic)**
 *
 * 输入是 vocab_words 里 def_zh 为空的词,不关心这词属于哪个库;
 * --bank 只用来圈定本批范围(不传就是全库所有缺内容的词)。
 * 例句难度按**词自身的 freq_rank 层级**定,同样不看词库 —— 一个高频词
 * 不会因为挂在托福库下就配 C1 句子。
 *
 * 每词一次 gpt-4o-mini 调用,输出:
 *   { ipa, def_zh, def_en, examples: [3 × { collocation, scene, sentence, translation_zh }] }
 *
 * 六道机器闸门在 ./gates.mjs(独立模块,可离线单测:node scripts/vocab/test-gates.mjs)
 *   g1 目标词存在   g2 长度 8-16   g3 em-dash
 *   g4 全局 4-gram 去重 >50% 拒     g5 三句 scene/collocation 互斥
 *   g6 同词三句两两 4-gram 重合 >30% 拒
 * 任一失败 → 整词重生成,最多 3 次;仍失败记入 data/failed.json。
 * 重试时把**具体失败原因回喂给模型**,不做无信息的盲重试。
 *
 * 断点续跑:
 *   · 待办清单来自 DB(def_zh IS NULL),SQL 跑过一批,下次自然就不再出现
 *   · 本地 data/generated/<bank>-content.json 也会跳过(SQL 还没跑时重跑不浪费 token)
 *   · g4 的全局语料从这个 JSON 载入 → 跨批次去重真的是全局的
 *
 * 用法:
 *   node scripts/vocab/generate-content.mjs --bank=toefl --limit=200
 *   node scripts/vocab/generate-content.mjs --bank=toefl --limit=5 --dry-run   # 不调 API,打印将要处理的词
 *   node scripts/vocab/generate-content.mjs --bank=toefl --emit-sql            # 只从已有 JSON 出 SQL,不调 API
 *
 * 环境:OPENAI_API_KEY(进程环境变量,或 .env.local / .env)
 *
 * ⚠️ 本脚本只读库 + 产出文件,绝不写库。SQL 一律交 Aaron 跑。
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SCENES, runAllGates, ngrams } from './gates.mjs';
import { loadEnv, requireKeys } from './env.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..');
const DATA = path.join(HERE, 'data');
const GEN = path.join(DATA, 'generated');

const arg = (k, d) => process.argv.find(a => a.startsWith(`--${k}=`))?.split('=').slice(1).join('=') ?? d;
const BANK = arg('bank', '');
const LIMIT = Number(arg('limit', '200'));
const MODEL = arg('model', 'gpt-4o-mini');
const CONCURRENCY = Number(arg('concurrency', '4'));
const MAX_ATTEMPTS = 3;
const DRY = process.argv.includes('--dry-run');
const EMIT_ONLY = process.argv.includes('--emit-sql');

/* ── env ── */
const ENV = loadEnv(REPO);
requireKeys(ENV, ['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY']);
const SUPA_URL = ENV.VITE_SUPABASE_URL;
const ANON = ENV.VITE_SUPABASE_PUBLISHABLE_KEY;

/* ── 只读 DB(anon key) ──
 * ⚠️ PostgREST 单次最多 1000 行,一律翻页,别裸查。 */
async function rest(pathname, params) {
  const url = new URL(`${SUPA_URL}/rest/v1/${pathname}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, { headers: { apikey: ANON, Authorization: `Bearer ${ANON}` } });
  if (!res.ok) throw new Error(`REST ${pathname} HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

async function restPaged(pathname, params, page = 1000) {
  const out = [];
  for (let offset = 0; ; offset += page) {
    const chunk = await rest(pathname, { ...params, offset: String(offset), limit: String(page) });
    out.push(...chunk);
    if (chunk.length < page) return out;
  }
}

/** 待办词:def_zh 为空;--bank 只圈范围,不进入生成逻辑。 */
async function fetchPending() {
  let idFilter = null;
  if (BANK) {
    const banks = await rest('vocab_banks', { select: 'id,code', code: `eq.${BANK}` });
    if (!banks.length) throw new Error(`vocab_banks 里没有 code='${BANK}'`);
    const links = await restPaged('vocab_word_banks', { select: 'word_id', bank_id: `eq.${banks[0].id}` });
    idFilter = links.map(l => l.word_id);
    if (!idFilter.length) return [];
  }

  const rows = [];
  if (idFilter) {
    // id IN (...) 分片,避免 URL 过长
    for (let i = 0; i < idFilter.length; i += 100) {
      const slice = idFilter.slice(i, i + 100);
      rows.push(...await rest('vocab_words', {
        select: 'id,headword,pos,freq_rank,def_zh',
        id: `in.(${slice.join(',')})`,
        def_zh: 'is.null',
        order: 'freq_rank.asc.nullslast',
      }));
    }
  } else {
    rows.push(...await restPaged('vocab_words', {
      select: 'id,headword,pos,freq_rank,def_zh',
      def_zh: 'is.null',
      order: 'freq_rank.asc.nullslast',
    }));
  }
  rows.sort((a, b) => (a.freq_rank ?? 1e9) - (b.freq_rank ?? 1e9) || a.headword.localeCompare(b.headword));
  return rows;
}

/* ── 难度分层:按词自身频率,与词库无关 ── */
function cefrFor(freqRank) {
  const r = freqRank ?? Number.MAX_SAFE_INTEGER;
  if (r <= 2000) return { level: 'A2', note: '高频常用词:句子要短、结构简单、日常语域' };
  if (r <= 6000) return { level: 'B1', note: '中频词:一般复杂度,可用从句但别套叠' };
  if (r <= 15000) return { level: 'B2', note: '偏学术词:可用较正式的措辞与抽象主语' };
  return { level: 'C1', note: '低频学术词:正式语域,允许名词化与复杂搭配' };
}

/* ── prompt ── */
const SYSTEM = `You write vocabulary study cards for Chinese learners of English.
You return ONLY valid JSON matching the provided schema. No prose, no markdown.`;

function buildPrompt(word, cefr, failureNotes) {
  const retry = failureNotes?.length
    ? `\n\nYOUR PREVIOUS ATTEMPT WAS REJECTED. Fix exactly these problems:\n${failureNotes.map(f => `- ${f}`).join('\n')}\nRegenerate all three examples.`
    : '';
  return `Word: "${word.headword}"${word.pos ? `  (part of speech: ${word.pos})` : ''}
Frequency rank: ${word.freq_rank ?? 'unknown'} -> target sentence difficulty: ${cefr.level}. ${cefr.note}

Produce a study card with these HARD requirements:

1. ipa: American English IPA for "${word.headword}", wrapped in slashes, e.g. /ˈæb.sɪ.stəns/.
2. def_zh: 中文释义, concise, matches the word's most common sense. 不要写词性缩写, 只写释义本身.
3. def_en: English definition, AT MOST 15 words.
4. examples: EXACTLY 3 objects. Each anchors ONE high-frequency collocation of "${word.headword}".
   - Order the three by collocation frequency: examples[0] uses the MOST frequent collocation, examples[2] the least.
   - The three collocations MUST be different from one another.
   - scene MUST be one of: ${SCENES.join(', ')}.
   - The three scenes MUST all be different from one another.
   - sentence: between 8 and 16 words. "${word.headword}" must appear in a natural inflected
     form (plural / tense / comparative as the sentence requires) - do not force the bare form.
   - The three sentences must NOT share sentence structure: they must not all start with
     "The" or "A", and their subjects must not all be the same kind of entity
     (e.g. not all three a person, not all three an abstract noun).
   - Do NOT reuse wording across the three sentences. Each must be independently written,
     not one template with the scene word swapped.
   - translation_zh: 该句的中文翻译, 自然流畅.
5. NEVER use an em-dash (—) or en-dash (–) anywhere in any field. Use commas or periods.
6. Difficulty is set by the word's own frequency (${cefr.level}), NOT by any exam.${retry}`;

}

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['ipa', 'def_zh', 'def_en', 'examples'],
  properties: {
    ipa: { type: 'string' },
    def_zh: { type: 'string' },
    def_en: { type: 'string' },
    examples: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['collocation', 'scene', 'sentence', 'translation_zh'],
        properties: {
          collocation: { type: 'string' },
          scene: { type: 'string', enum: SCENES },
          sentence: { type: 'string' },
          translation_zh: { type: 'string' },
        },
      },
    },
  },
};

async function callModel(word, cefr, failureNotes) {
  requireKeys(ENV, ['OPENAI_API_KEY']);
  const key = ENV.OPENAI_API_KEY;
  const body = {
    model: MODEL,
    temperature: 0.8,
    messages: [
      { role: 'system', content: SYSTEM },
      { role: 'user', content: buildPrompt(word, cefr, failureNotes) },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: { name: 'vocab_card', strict: true, schema: SCHEMA },
    },
  };
  for (let backoff = 0; backoff < 5; backoff++) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify(body),
    });
    if (res.status === 429 || res.status >= 500) {
      const wait = 2000 * 2 ** backoff;
      process.stdout.write(`  · HTTP ${res.status},${wait}ms 后重试\n`);
      await new Promise(r => setTimeout(r, wait));
      continue;
    }
    if (!res.ok) throw new Error(`OpenAI HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const data = await res.json();
    return JSON.parse(data.choices[0].message.content);
  }
  throw new Error('OpenAI 连续限流,放弃');
}

/* ── 主流程 ── */
async function main() {
  mkdirSync(GEN, { recursive: true });
  const resultsPath = path.join(GEN, `${BANK || 'all'}-content.json`);
  const failedPath = path.join(DATA, 'failed.json');
  const inflectPath = path.join(DATA, `${BANK || 'toefl'}-inflections.json`);

  const results = existsSync(resultsPath) ? JSON.parse(readFileSync(resultsPath, 'utf8')) : {};
  const inflectTable = existsSync(inflectPath) ? JSON.parse(readFileSync(inflectPath, 'utf8')) : {};
  const failed = existsSync(failedPath) ? JSON.parse(readFileSync(failedPath, 'utf8')) : {};

  // g4 全局语料:所有历史已接受句子
  const corpus = [];
  for (const rec of Object.values(results)) {
    for (const ex of rec.examples || []) corpus.push(ngrams(ex.sentence));
  }
  process.stdout.write(`· 全局去重语料:${corpus.length} 句(来自 ${Object.keys(results).length} 个已生成词)\n`);

  if (EMIT_ONLY) {
    emit(results);
    return;
  }

  const pending = (await fetchPending()).filter(w => !results[w.headword.toLowerCase()]).slice(0, LIMIT);
  process.stdout.write(`· 待生成 ${pending.length} 词${BANK ? `(范围 --bank=${BANK})` : '(全库)'}\n`);
  if (!pending.length) { process.stdout.write('  没有待办词。若 SQL 还没跑,先跑 batch1 灌词表。\n'); emit(results); return; }

  if (DRY) {
    for (const w of pending.slice(0, 20)) {
      process.stdout.write(`  ${w.headword.padEnd(18)} rank=${String(w.freq_rank ?? '-').padStart(6)}  → ${cefrFor(w.freq_rank).level}\n`);
    }
    process.stdout.write(`  (--dry-run:未调用 API)\n`);
    return;
  }

  let ok = 0, ko = 0;
  const queue = [...pending];
  // 顺序保证 g4 语料一致性:并发内各自比对 corpus 快照 + 已完成的,收敛后统一入库
  const workers = Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
    while (queue.length) {
      const word = queue.shift();
      const cefr = cefrFor(word.freq_rank);
      let notes = null, saved = false;
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        let payload;
        try {
          payload = await callModel(word, cefr, notes);
        } catch (e) {
          notes = [`API 错误:${e.message}`];
          process.stdout.write(`  ✗ ${word.headword} 第${attempt}次 API 失败:${e.message}\n`);
          continue;
        }
        const fails = runAllGates(word, payload, corpus, inflectTable);
        if (!fails.length) {
          results[word.headword.toLowerCase()] = {
            word_id: word.id, headword: word.headword, pos: word.pos,
            freq_rank: word.freq_rank, cefr: cefr.level, ...payload,
            _attempts: attempt, _model: MODEL,
          };
          for (const ex of payload.examples) corpus.push(ngrams(ex.sentence));
          delete failed[word.headword.toLowerCase()];
          ok++; saved = true;
          process.stdout.write(`  ✓ ${word.headword} (${cefr.level}, 第${attempt}次)\n`);
          break;
        }
        notes = fails;
        process.stdout.write(`  ↻ ${word.headword} 第${attempt}次被闸门拦下:${fails[0]}\n`);
      }
      if (!saved) {
        failed[word.headword.toLowerCase()] = { headword: word.headword, freq_rank: word.freq_rank, reasons: notes, at: 'gate' };
        ko++;
        process.stdout.write(`  ✗✗ ${word.headword} 三次未过闸,记入 failed.json\n`);
      }
      writeFileSync(resultsPath, JSON.stringify(results, null, 2), 'utf8');
      writeFileSync(failedPath, JSON.stringify(failed, null, 2), 'utf8');
    }
  });
  await Promise.all(workers);

  process.stdout.write(`\n· 完成:通过 ${ok} · 失败 ${ko} · 累计已生成 ${Object.keys(results).length}\n`);
  emit(results);
}

/* ── 产出 SQL + 送审样本 ── */
function emit(results) {
  const list = Object.values(results);
  if (!list.length) { process.stdout.write('· 无内容可出 SQL\n'); return; }
  writeSql(list);
  writeSample(list);
}

const esc = s => String(s ?? '').replace(/'/g, "''");
const q = s => (s === null || s === undefined || s === '') ? 'NULL' : `'${esc(s)}'`;

function writeSql(list) {
  const bank = BANK || 'all';
  const wordRows = list.map(w => `  (${q(w.headword.toLowerCase())}, ${q(w.ipa)}, ${q(w.def_zh)}, ${q(w.def_en)})`).join(',\n');
  const exRows = list.flatMap(w =>
    w.examples.map((ex, i) =>
      `  (${q(w.headword.toLowerCase())}, ${i + 1}, ${q(ex.collocation)}, ${q(ex.sentence)}, ${q(ex.translation_zh)}, ${q(ex.scene)})`)
  ).join(',\n');
  const exCount = list.reduce((n, w) => n + w.examples.length, 0);

  const sql = `-- 词汇内容 batch1:${list.length} 词 · ${exCount} 例句
-- 生成: node scripts/vocab/generate-content.mjs --bank=${bank} --emit-sql
-- 模型: ${list[0]._model || 'gpt-4o-mini'} · 六道机器闸门全过
-- ⚠️ 由 Aaron 执行。脚本本身从不写库。
--
-- 幂等: vocab_words 按 lower(headword) 定位更新;
--       vocab_examples 走 ON CONFLICT (word_id, sort_order)(索引 vocab_examples_word_id_sort_order_key)。
--       重复跑只会覆盖同一批内容,不产生重复行。
--
-- scene(academic/news/daily_life/... 共 10 类)既用于生成期的 g5/g6 闸门判定,
-- 也一并入库,将来可按场景筛例句。

BEGIN;

-- ⚠️ 前置:scene 列。
-- 2026-08-03 实测 information_schema 里 vocab_examples 还**没有**这一列
-- (当时 public 库内唯一的 scene 列在 american_lessons 上)。
-- 这句是幂等的:你要是已经加过,它就是 no-op;没加过,它替你补上。
-- 不加这列,下面的 INSERT 会直接报 column "scene" does not exist。
ALTER TABLE vocab_examples ADD COLUMN IF NOT EXISTS scene text;

SELECT 'BEFORE' AS stage,
       (SELECT count(*) FROM vocab_words WHERE def_zh IS NOT NULL) AS words_with_def,
       (SELECT count(*) FROM vocab_examples) AS examples;

-- ① 释义 / 音标
UPDATE vocab_words w
   SET ipa        = v.ipa,
       def_zh     = v.def_zh,
       def_en     = v.def_en,
       updated_at = now()
  FROM (VALUES
${wordRows}
  ) AS v(headword, ipa, def_zh, def_en)
 WHERE lower(w.headword) = v.headword;

-- ② 例句
INSERT INTO vocab_examples (word_id, sort_order, collocation, sentence, translation_zh, scene)
SELECT w.id, v.sort_order, v.collocation, v.sentence, v.translation_zh, v.scene
  FROM (VALUES
${exRows}
  ) AS v(headword, sort_order, collocation, sentence, translation_zh, scene)
  JOIN vocab_words w ON lower(w.headword) = v.headword
ON CONFLICT (word_id, sort_order) DO UPDATE
  SET collocation    = EXCLUDED.collocation,
      sentence       = EXCLUDED.sentence,
      translation_zh = EXCLUDED.translation_zh,
      scene          = EXCLUDED.scene;

SELECT 'AFTER' AS stage,
       (SELECT count(*) FROM vocab_words WHERE def_zh IS NOT NULL) AS words_with_def,
       (SELECT count(*) FROM vocab_examples) AS examples;

-- ── count-validate:四行都必须是 t,否则 ROLLBACK ──
SELECT 'words_with_def = ${list.length}' AS expect,
       (SELECT count(*) FROM vocab_words WHERE def_zh IS NOT NULL) = ${list.length} AS ok
UNION ALL
SELECT 'examples = ${exCount}',
       (SELECT count(*) FROM vocab_examples) = ${exCount}
UNION ALL
SELECT 'every word with a definition has exactly 3 examples',
       NOT EXISTS (
         SELECT 1
           FROM vocab_words w
          WHERE w.def_zh IS NOT NULL
            AND (SELECT count(*) FROM vocab_examples e WHERE e.word_id = w.id) <> 3
       )
UNION ALL
SELECT 'every example has a scene from the 10-value enum',
       NOT EXISTS (
         SELECT 1 FROM vocab_examples
          WHERE scene IS NULL
             OR scene NOT IN (${SCENES.map(s => `'${s}'`).join(', ')})
       );

COMMIT;
`;
  const out = path.join(REPO, 'SQLAA', `vocab_${bank}_content_batch1.sql`);
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, sql, 'utf8');
  process.stdout.write(`· 内容 SQL(${list.length} 词/${exCount} 句) → SQLAA/vocab_${bank}_content_batch1.sql\n`);
}

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function writeSample(list) {
  const bank = BANK || 'all';
  const rnd = mulberry32(20260803);
  const idx = new Set();
  while (idx.size < Math.min(16, list.length)) idx.add(Math.floor(rnd() * list.length));
  const picked = [...idx].sort((a, b) => a - b).map(i => list[i]);

  const body = picked.map((w, n) => `### ${n + 1}. ${w.headword}  ${w.pos ? `*${w.pos}*` : ''}

| | |
| --- | --- |
| 音标 | ${w.ipa} |
| 中文释义 | ${w.def_zh} |
| 英文释义 | ${w.def_en} |
| freq_rank | ${w.freq_rank ?? '—'} |
| 难度档 | ${w.cefr} |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
${w.examples.map((e, i) => `| ${i + 1} | ${e.collocation} | \`${e.scene}\` | ${e.sentence} | ${e.translation_zh} |`).join('\n')}
`).join('\n');

  const md = `# 托福词汇内容 batch1 · 送审样本

> 随机抽 ${picked.length} 词(种子固定 20260803,复跑抽到同样这批)。
> 全量 ${list.length} 词见 \`scripts/vocab/data/generated/${bank}-content.json\`。

## 这批内容是怎么把住质量的

六道**机器**闸门,任一不过就整词重生成(最多 3 次),仍不过记入 \`scripts/vocab/data/failed.json\`:

| 闸门 | 判据 | 拦的是什么 |
| --- | --- | --- |
| g1 | 句中含 headword 或其屈折形 | 例句根本没用上目标词 |
| g2 | 例句 8-16 词 | 太短没语境 / 太长读不动 |
| g3 | 全字段扫 em-dash / en-dash | 破折号(中文排版里很丑) |
| g4 | 与**历史全部**已生成句 4-gram 重合 >50% | 跨词、跨批次的套话复读 |
| g5 | 三句 scene 互不相同且在枚举内;三句 collocation 互不相同 | 三句其实在讲同一个用法 |
| g6 | 同词任意两句 4-gram 重合 >30% | "换个场景词、其余照抄"的偷懒句 |

场景枚举固定 10 个:\`${SCENES.join('`, `')}\`。

\`scene\` 既服务于 g5/g6 判定,也**随例句一并入库**(\`vocab_examples.scene\`),将来可按场景筛例句。

## 请重点看这几点

1. **中文释义准不准**、有没有把次要义当主义。
2. **搭配是不是真高频**,顺序是不是真按频率(句1 应该是最常见的说法)。
3. **例句像不像人写的** —— 三句之间是不是真的换了写法,不是同一个模子。
4. **难度档合不合适**:高频词配 A2 句、低频学术词配 B2/C1 句。

---

${body}`;
  const out = path.join(REPO, 'REVIEWAA', `vocab_${bank}_batch1_sample.md`);
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, md, 'utf8');
  process.stdout.write(`· 送审样本(${picked.length} 词) → REVIEWAA/vocab_${bank}_batch1_sample.md\n`);
}

main().catch(e => { process.stderr.write(`✗ ${e.stack || e.message}\n`); process.exit(1); });
