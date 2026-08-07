/**
 * H 段:美国习惯用语 50 条 —— 写入 vocab_chunks(type='idiom')。
 *
 * ══ 假设差异表(第八条规矩,自列自核)══
 *
 * | 假设(D 段词块成立) | H 段实际形态 | 处理 |
 * | --- | --- | --- |
 * | 释义 = 字面义的中文对应 | **字面义与实际义必然背离**,这正是卖点 | 新增 literal_trap 必填列 |
 * | def_zh 不含解释性内容 | literal_trap **就是**解释("字面 X,实为 Y") | 体裁闸只作用于 translation_zh,不管 literal_trap |
 * | 词数 2-5(按类型) | 习语可长(the ball is in your court = 6 词) | idiom 单独放到 [2,7] |
 * | 可分性/边界说明 | 习语不需要,它要的是**直译陷阱** | k4 对 idiom 换成 literal_trap 必填 |
 * | 抽样审 | **50 条全量逐条审**(Aaron 定) | 送审件不抽样 |
 *
 * **边界值**:最短(2 词 no way)· 最长(7 词)· 含专名的 · 字面完全说得通的
 * (最危险:break the ice 字面"打破冰"也说得通,学生不会察觉是习语)
 *
 * 闸门:
 *   h1 type 固定 idiom          h2 词数 2-7、无句末标点
 *   h3 translation_zh 体裁(走 defZhShapeProblem,剥括号)
 *   h4 **literal_trap 必填且 ≤20 字**(DDL 里 CHECK 也卡了非空)
 *   h5 literal_trap 必须**同时含字面义与实际义**(形式判据:含「字面」且含「实为/实指」)
 *   h6 例句含该习语     h7 组内不重复     h8 例句/译文闸(g2/g3/g4)
 *
 *   node scripts/vocab/gen-idioms.mjs --limit=10 --no-emit
 *   node scripts/vocab/gen-idioms.mjs
 *
 * ⚠️ 只读 + 产出文件,绝不写库。SQL 交 Aaron 跑。
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SCENES, ngrams, defZhShapeProblem, g2_length, g3_noEmDash, g4_globalDedup, inflectionsOf } from './gates.mjs';
import { SPEC } from './spec.mjs';
import { DATA, arg, flag, callJson, loadCache, saveCache, q, writeSql, writeReview } from './llm.mjs';

const TARGET = Number(arg('target', '50'));
const LIMIT = Number(arg('limit', '0')) || TARGET;
const MODEL = arg('model', 'gpt-4o');     // 选品与直译陷阱都是判断活儿
const NO_EMIT = flag('no-emit');
const EMIT_ONLY = flag('emit-only');
const CACHE_FILE = 'toefl-idioms.json';
const MAX_TRAP = 20;
const WORD_RANGE = [2, 7];                // idiom 比 D 段四类都长,单独放宽

const exPath = path.join(DATA, 'ecdict-exchange.json');
const INFLECT = existsSync(exPath) ? JSON.parse(readFileSync(exPath, 'utf8')) : {};

function sentenceHasIdiom(sentence, chunk) {
  const s = String(sentence).toLowerCase();
  const words = String(chunk).toLowerCase().split(/\s+/).filter(Boolean);
  return words.every((w, i) => {
    const bare = w.replace(/[^a-z'-]/g, '');
    if (!bare || bare.length <= 2) return true;         // 冠词/介词不强求(习语常有变形)
    if (i === 0) {
      const forms = inflectionsOf(bare, INFLECT);
      return [...forms].some(f => new RegExp(`\\b${f}\\b`).test(s));
    }
    return new RegExp(`\\b${bare}`).test(s);
  });
}

export function gateIdiom(item, seen, corpus) {
  const fails = [];
  const chunk = String(item.chunk || '').trim();
  const zh = String(item.translation_zh || '').trim();
  const trap = String(item.literal_trap || '').trim();

  if (String(item.type) !== 'idiom') fails.push(`h1 type 必须是 idiom,给了「${item.type}」`);
  const wc = chunk.split(/\s+/).filter(Boolean).length;
  if (wc < WORD_RANGE[0] || wc > WORD_RANGE[1]) fails.push(`h2 「${chunk}」${wc} 词,习语应为 ${WORD_RANGE[0]}-${WORD_RANGE[1]} 词`);
  if (/[.!?]$/.test(chunk)) fails.push(`h2 「${chunk}」带句末标点`);
  if (seen.has(chunk.toLowerCase())) fails.push(`h7 「${chunk}」重复`);

  /* h3 体裁只作用于 translation_zh —— literal_trap 天生就是解释句,不能套同一把尺。 */
  const bare = zh.replace(/[((][^))]*[))]/g, '').replace(/[。.]+$/, '').trim();
  const shape = defZhShapeProblem(bare);
  if (shape) fails.push(`h3 ${shape}`);

  // h4 literal_trap 必填 + 长度
  if (!trap) fails.push('h4 literal_trap 为空(idiom 的核心卖点,DDL 也 CHECK 非空)');
  else if ([...trap].length > MAX_TRAP) fails.push(`h4 literal_trap ${[...trap].length} 字,上限 ${MAX_TRAP}`);
  /* h5 形式判据(第四条落地说明:内容可有无限变体时查形式)——
   * 直译陷阱必须**同时说清字面义和实际义**,否则不成其为"陷阱"。 */
  if (trap && !(/字面/.test(trap) && /实为|实指|实际/.test(trap))) {
    fails.push(`h5 literal_trap「${trap}」没有同时点出字面义与实际义(要含「字面…实为…」)`);
  }

  if (!SCENES.includes(String(item.scene))) fails.push(`h8 scene「${item.scene}」不在枚举内`);
  const g2 = g2_length(item.example_en, SPEC.chunk.exampleLength);
  if (g2) fails.push(`h8 ${g2}`);
  const g3 = g3_noEmDash(item.example_en, item.example_zh, zh, trap);
  if (g3) fails.push(`h8 ${g3}`);
  const g4 = g4_globalDedup(item.example_en, corpus);
  if (g4) fails.push(`h8 ${g4}`);
  if (!sentenceHasIdiom(item.example_en, chunk)) fails.push(`h6 例句里没出现「${chunk}」`);
  return fails;
}

const SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['items'],
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        required: ['chunk', 'type', 'translation_zh', 'literal_trap', 'scene', 'example_en', 'example_zh'],
        properties: {
          chunk: { type: 'string' }, type: { type: 'string' },
          translation_zh: { type: 'string' }, literal_trap: { type: 'string' },
          scene: { type: 'string' }, example_en: { type: 'string' }, example_zh: { type: 'string' },
        },
      },
    },
  },
};

const SYSTEM = 'You are a lexicographer building an English learning app for Chinese students. Answer only with the required JSON. Only give idioms that are genuinely current in American English.';

function buildPrompt(n, already) {
  return `给出 ${n} 条**当代美国习惯用语**。

选品口径(Aaron 定):
  · 当代美国**日常 / 职场 / 校园**高频,近 10 年持续活跃
  · **排除**:网络梗、粗俗俚语、生僻古旧语
${already.length ? `\n⚠️ 已有这些,一条都不许重复:\n${already.slice(-80).map(c => `  · ${c}`).join('\n')}` : ''}

每条给:
  · chunk           习语本体,${WORD_RANGE[0]}-${WORD_RANGE[1]} 个词,不带句号
  · type            固定填 "idiom"
  · translation_zh  中文对应说法,词典式短语,${SPEC.defZh.minChars}-${SPEC.defZh.maxChars} 字
  · literal_trap    **直译陷阱**,≤${MAX_TRAP} 字,必须**同时点出字面义和实际义**
  · scene           从这 10 值里选:${SCENES.join(' / ')}
  · example_en      一条例句,必须含这个习语,${SPEC.chunk.exampleLength[0]}-${SPEC.chunk.exampleLength[1]} 词,不带 em-dash
  · example_zh      中文译文,全角标点,句末全角句号

⚠️ **literal_trap 是这一段的全部价值所在。**
   格式必须是「字面 X,实为 Y」:
     piece of cake      -> 字面"一块蛋糕",实为"小菜一碟"
     break the ice      -> 字面"打破冰",实为"打破僵局"
     the ball is in your court -> 字面"球在你场内",实为"该你决定了"
     under the weather  -> 字面"在天气之下",实为"身体不适"
   ❌ 只写"很容易" —— 那是释义不是陷阱,学生照样会按字面理解。

⚠️ **最有价值的是「字面也说得通」的那些** —— break the ice 字面"打破冰"
   在句子里读着不别扭,学生根本不会察觉这是习语。这类优先给。`;
}

async function main() {
  const cache = loadCache(CACHE_FILE);
  const seen = new Set(Object.keys(cache).map(k => k.toLowerCase()));
  const corpus = Object.values(cache).map(v => ngrams(v.example_en));

  if (!EMIT_ONLY) {
    for (let attempt = 1; attempt <= 6; attempt++) {
      const have = Object.keys(cache).length;
      if (have >= LIMIT) break;
      const need = LIMIT - have;
      let items;
      try {
        items = await callJson({
          system: SYSTEM, user: buildPrompt(Math.min(need + 3, need * 2), [...seen]),
          schemaName: 'idioms', schema: SCHEMA, model: MODEL, temperature: 0.6, maxTokens: 4000,
        }).then(x => x.items);
      } catch (e) { process.stdout.write(`  · 第 ${attempt} 次调用出错:${e.message.slice(0, 70)}\n`); continue; }
      let ok = 0, rej = 0; const why = new Map();
      for (const it of items) {
        if (Object.keys(cache).length >= LIMIT) break;
        const f = gateIdiom(it, seen, corpus);
        if (f.length) { rej++; const k = f[0].slice(0, 46); why.set(k, (why.get(k) ?? 0) + 1); continue; }
        cache[it.chunk] = it; seen.add(it.chunk.toLowerCase()); corpus.push(ngrams(it.example_en)); ok++;
      }
      process.stdout.write(`  · 第 ${attempt} 次:收 ${ok} 拒 ${rej} → ${Object.keys(cache).length}/${LIMIT}\n`);
      if (attempt === 6 && rej) for (const [k, c] of [...why].slice(0, 3)) process.stdout.write(`      拒因 ×${c}:${k}\n`);
      saveCache(CACHE_FILE, cache);
    }
  }
  if (NO_EMIT) {
    for (const v of Object.values(cache)) {
      process.stdout.write(`  ${v.chunk}\n    ${v.translation_zh}  ⚠️ ${v.literal_trap}  [${v.scene}]\n    ${v.example_en}\n    ${v.example_zh}\n`);
    }
    return;
  }
  emit(cache);
}

function emit(cache) {
  const rows = Object.values(cache);
  const seen = new Set(); const corpus = [];
  const bad = rows.filter(v => { const f = gateIdiom(v, seen, corpus); seen.add(v.chunk.toLowerCase()); corpus.push(ngrams(v.example_en)); return f.length; });
  process.stdout.write(`\n出件前全量复检:${rows.length} 条,不合格 ${bad.length}\n`);
  if (bad.length) { bad.slice(0, 6).forEach(v => process.stdout.write(`  ✗ ${v.chunk}\n`)); process.stdout.write('⚠️ 不出 SQL\n'); process.exitCode = 1; return; }

  const vals = rows.map((v, i) =>
    `  (${q(v.chunk)}, 'idiom', ${q(v.translation_zh)}, ${q(v.literal_trap)}, ${q(v.scene)}, ${q(v.example_en)}, ${q(v.example_zh)}, ${i + 1})`).join(',\n');

  writeSql('vocab_toefl_idioms.sql', `-- H 段 美国习惯用语 —— ${rows.length} 条(type='idiom')
--
-- 前置:vocab_idioms_and_cn_expressions_ddl.sql 已跑(type 枚举含 idiom、literal_trap 列 + CHECK)。
-- ⚠️ literal_trap 是这一段的全部价值:格式「字面 X,实为 Y」,DDL 侧也 CHECK 了非空。
-- 幂等:ON CONFLICT (lower(chunk)) 更新。⚠️ 由 Aaron 执行。

BEGIN;

SELECT 'BEFORE' AS stage, count(*) FILTER (WHERE type='idiom') AS idioms, count(*) AS total FROM vocab_chunks;

INSERT INTO vocab_chunks (chunk, type, translation_zh, literal_trap, scene, example_en, example_zh, freq_rank)
VALUES
${vals}
ON CONFLICT (lower(chunk)) DO UPDATE
  SET type = EXCLUDED.type, translation_zh = EXCLUDED.translation_zh,
      literal_trap = EXCLUDED.literal_trap, scene = EXCLUDED.scene,
      example_en = EXCLUDED.example_en, example_zh = EXCLUDED.example_zh,
      freq_rank = EXCLUDED.freq_rank, updated_at = now();

SELECT 'AFTER' AS stage, count(*) FILTER (WHERE type='idiom') AS idioms, count(*) AS total FROM vocab_chunks;

-- ── count-validate:四行都必须是 t,否则 ROLLBACK ──
SELECT 'idiom 条数 = ${rows.length}' AS expect,
       (SELECT count(*) FROM vocab_chunks WHERE type='idiom') = ${rows.length} AS ok
UNION ALL
SELECT '每条 idiom 都有 literal_trap',
       NOT EXISTS (SELECT 1 FROM vocab_chunks WHERE type='idiom'
                    AND (literal_trap IS NULL OR btrim(literal_trap)=''))
UNION ALL
SELECT 'literal_trap 都点出了字面义与实际义',
       NOT EXISTS (SELECT 1 FROM vocab_chunks WHERE type='idiom'
                    AND NOT (literal_trap LIKE '%字面%' AND literal_trap ~ '实为|实指|实际'))
UNION ALL
SELECT 'D 段那 100 条词块没被动过',
       (SELECT count(*) FROM vocab_chunks WHERE type <> 'idiom') = 100;

COMMIT;
`);

  writeReview('vocab_toefl_idioms.md', `# H 段 美国习惯用语 · 送审件(${rows.length} 条)

⚠️ **50 条全量逐条审**(你定的),下面不是抽样。

机器闸 h1-h8 全量复检 **0 不合格**。其中 h5 是形式判据:
\`literal_trap\` 必须**同时含「字面」与「实为/实指」** —— 只写"很容易"那是释义不是陷阱。

## 选品口径

当代美国**日常 / 职场 / 校园**高频,近 10 年持续活跃;
**排除**网络梗、粗俗俚语、生僻古旧语。

## 全部 ${rows.length} 条

| 习语 | 中文 | ⚠️ 直译陷阱 | 场景 |
| --- | --- | --- | --- |
${rows.map(v => `| ${v.chunk} | ${v.translation_zh} | ${v.literal_trap} | ${v.scene} |`).join('\n')}

## 例句

${rows.map(v => `**${v.chunk}** — ${v.example_en}
　${v.example_zh}`).join('\n\n')}
`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(e => { process.stderr.write(`\n${e.stack || e.message}\n`); process.exit(1); });
}
