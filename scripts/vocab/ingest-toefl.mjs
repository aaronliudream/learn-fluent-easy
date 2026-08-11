/**
 * 托福词表摄取(词库无关流水线的第一棒)
 *
 * ── 数据来源与授权 ───────────────────────────────────────────────
 *   repo    : https://github.com/skywind3000/ECDICT
 *   file    : ecdict.csv（770,611 行,66MB）
 *   license : MIT License, Copyright (c) 2025 Linwei
 *             https://github.com/skywind3000/ECDICT/blob/master/LICENSE
 *   核实记录: 2026-08-03 经 GitHub API 确认 license.spdx_id === "MIT"。
 *             同期核过 kajweb/dict 与 mahavivo/english-wordlists,两者
 *             license 均为 null(无授权声明)→ 按"确认 license 后才可用"
 *             的要求弃用,不作为数据源。
 *
 * ── 为什么单一数据源就够 ─────────────────────────────────────────
 *   ECDICT 同时带 `tag`(含 toefl 分类)与 `frq`/`bnc` 两套词频排名,
 *   故 freq_rank 无需再引第二个词频表(如 wordfreq),避免多源许可叠加。
 *     frq = 当代语料库(COCA)词频排名,1 = 最高频
 *     bnc = British National Corpus 词频排名
 *   取值优先级: frq > 0 ? frq : (bnc > 0 ? bnc : null)
 *   两者皆 0 的词 freq_rank 留空,排序落到最末(不会进 batch1)。
 *
 * ── ECDICT 的两个坑(实测) ───────────────────────────────────────
 *   ① `pos` 列在全部 6974 条 toefl 词上都是空的 —— 不能用。
 *      词性改从 `translation` 的前缀提取("vt. 放弃, 抛弃" → v.),
 *      实测 6917/6974 命中,57 条无前缀 → pos 留空并记入 skipped.json 的
 *      no_pos 段(这 57 条仍然入表,只是 pos 为 NULL)。
 *   ② translation 的多义项分隔符是**字面量 \n 两个字符**,不是真换行,
 *      两种都要切。
 *
 * ── 输出 ─────────────────────────────────────────────────────────
 *   scripts/vocab/data/toefl.csv              headword,pos,freq_rank
 *   scripts/vocab/data/toefl-inflections.json 屈折形表(喂第二步 g1 闸门)
 *   scripts/vocab/data/skipped.json           被清洗掉的条目 + 原因
 *   REVIEWAA/vocab_<bank>_wordlist_sample.md  随机 50 词送审(文件名跟 --bank 走)
 *
 * ── 用法 ─────────────────────────────────────────────────────────
 *   node scripts/vocab/ingest-toefl.mjs                 # 摄取 + 出送审样本
 *   node scripts/vocab/ingest-toefl.mjs --emit-sql      # 追加出 batch1 SQL
 *   node scripts/vocab/ingest-toefl.mjs --src=<path>    # 指定本地 ecdict.csv
 *   node scripts/vocab/ingest-toefl.mjs --limit=200     # 改 batch 大小(默认200)
 *
 *   源文件默认下载到系统临时目录缓存,不落仓库(66MB 不进 git)。
 *
 * ⚠️ 本脚本只产出文件,绝不写库。SQL 一律交 Aaron 跑。
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, createWriteStream } from 'node:fs';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..');
const DATA_DIR = path.join(HERE, 'data');
const SRC_URL = 'https://raw.githubusercontent.com/skywind3000/ECDICT/master/ecdict.csv';
const CACHE = path.join(tmpdir(), 'ecdict-source', 'ecdict.csv');

const arg = (k, d) => process.argv.find(a => a.startsWith(`--${k}=`))?.split('=').slice(1).join('=') ?? d;
const BANK = arg('bank', 'toefl');
const LIMIT = Number(arg('limit', '200'));
const EMIT_SQL = process.argv.includes('--emit-sql');
const SRC = arg('src', '');
/* --exclude-tags=zk,gk,cet4 →  剔掉同时被这些考试打标的词。
 * 背景: ECDICT 的 toefl 标签表示"托福里出现过",不是"托福难度",
 * 所以不过滤时 freq_rank 前 200 全是 can/way/well/even 这类 A1 词。
 * 默认空(严格按原指令取前 200),要做 TOEFL 特色首批就传这个参数。 */
const EXCLUDE_TAGS = new Set(arg('exclude-tags', '').split(',').map(s => s.trim()).filter(Boolean));

/**
 * `vocab_banks.code` -> ECDICT 的 `tag` 值。**两边命名不一样,别拿 bank 当 tag 用。**
 *
 * 2026-08-10 踩到:`--bank=zhongkao` 跑完报「打标 0 条 保留 0」,还照样写了一份
 * 0 词的送审样本文件,退出码 0 —— 看上去像"这个库就是没词",实际是 ECDICT 里
 * 中考的标签叫 `zk`。同理 高考=gk、考研=ky。
 *
 * ⚠️ `ket_pet` / `gmat` / `nce` **ECDICT 里根本没有对应标签**,得另找词表来源,
 *    不能靠这条流水线。做到那三个库时必须先解决词源,别指望这里能出词。
 */
const ECDICT_TAG = {
  zhongkao: 'zk', gaokao: 'gk', kaoyan: 'ky',
  cet4: 'cet4', cet6: 'cet6', toefl: 'toefl', ielts: 'ielts', gre: 'gre',
};
/**
 * **派生库** —— ECDICT 里没有对应标签,但可以用**已有标签 + 词频**推出来。
 *
 * ⚠️ 这不是"官方大纲词表",是我们自己定的口径。所以:
 *   ① 每条都必须写清楚判据(下面的 note),将来才知道这批词凭什么是这批词;
 *   ② 库的**显示名**要跟口径相符,不能挂着"KET/PET词汇"卖一批不是大纲词的词。
 *      三个库现在都是 is_active=false(没对用户开),开灯前由 Aaron 定名。
 *
 * ⚠️ 明确不做的事:**不搬 Cambridge 的 KET/PET 官方词表**(版权在对方)。
 */
const DERIVED = {
  ket_pet: {
    tags: ['zk', 'gk', 'cet4'], maxFreq: 4000,
    note: 'KET≈A2 / PET≈B1。用中考∪高考∪四级里**词频前 4000**当口径 —— ' +
          '这三份都是我们已有的基础词表,A2/B1 的实际覆盖面与之高度重叠。',
  },
  gmat: {
    tags: ['gre'], maxFreq: 15000,
    note: 'GMAT 没有官方词表(verbal 考阅读与逻辑),市面上的都是各家自编。' +
          'GMAT 的词汇语域与 GRE 同源但**不用那么生僻**,故取 gre 标签里 ' +
          'freq_rank ≤ 15000 的那一半(GRE 全体的中位数是 13934)。',
  },
};
/* nce(新概念)既没标签也推不出来 —— 它是教材,得按教材本身的词表来。 */
const NO_ECDICT_SOURCE = ['nce'];
const TAG = arg('tag', ECDICT_TAG[BANK] || BANK);
const DERIVE = DERIVED[BANK] || null;
if (NO_ECDICT_SOURCE.includes(BANK)) {
  process.stderr.write(`x ${BANK}:ECDICT 没有对应标签,这条流水线出不了词,需要另找词表来源。
`);
  process.exit(2);
}

/* ── 确定性随机(送审样本可复现,换人跑抽的是同 50 词) ── */
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ── 极简 CSV 解析:ECDICT 用标准双引号转义,字段内含逗号/换行 ── */
function* parseCsv(text) {
  let i = 0, field = '', row = [], inQ = false;
  const n = text.length;
  while (i < n) {
    const c = text[i];
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQ = false; i++; continue;
      }
      field += c; i++; continue;
    }
    if (c === '"') { inQ = true; i++; continue; }
    if (c === ',') { row.push(field); field = ''; i++; continue; }
    if (c === '\r') { i++; continue; }
    if (c === '\n') { row.push(field); yield row; row = []; field = ''; i++; continue; }
    field += c; i++;
  }
  if (field.length || row.length) { row.push(field); yield row; }
}

async function ensureSource() {
  if (SRC) {
    if (!existsSync(SRC)) throw new Error(`--src 指向的文件不存在: ${SRC}`);
    return SRC;
  }
  if (existsSync(CACHE)) return CACHE;
  mkdirSync(path.dirname(CACHE), { recursive: true });
  process.stdout.write(`↓ 下载 ECDICT (66MB) → ${CACHE}\n`);
  const res = await fetch(SRC_URL);
  if (!res.ok) throw new Error(`下载失败 HTTP ${res.status}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(CACHE));
  return CACHE;
}

/* ── 词性:从 translation 前缀提取 ──
 *  ECDICT 缩写 → 面向学习者的规范写法。vt./vi./v. 统一并成 v.(学习卡不区分及物)。*/
const POS_MAP = {
  n: 'n.', pl: 'n.', a: 'adj.', adj: 'adj.', ad: 'adv.', adv: 'adv.',
  vt: 'v.', vi: 'v.', v: 'v.', aux: 'aux.', modal: 'aux.',
  prep: 'prep.', conj: 'conj.', pron: 'pron.', int: 'int.', interj: 'int.',
  num: 'num.', art: 'art.', abbr: 'abbr.',
};
const POS_LINE = /^\s*(?:\[[^\]]*\]\s*)?([a-z]+)\./;

function extractPos(translation) {
  if (!translation) return '';
  const lines = translation.split(/\\n|\r?\n/);
  const out = [];
  for (const line of lines) {
    const m = POS_LINE.exec(line);
    if (!m) continue;
    const mapped = POS_MAP[m[1]];
    if (mapped && !out.includes(mapped)) out.push(mapped);
  }
  return out.join('/');
}

/* ── 屈折形:exchange 列 ──
 *  键义: p过去式 d过去分词 i现在分词 3三单 s复数 r比较级 t最高级
 *        0原形指针 1变换类型(这两个不是"形",跳过) */
const INFLECT_KEYS = new Set(['p', 'd', 'i', '3', 's', 'r', 't']);
function extractInflections(exchange, headword) {
  const out = new Set();
  for (const part of (exchange || '').split('/')) {
    const idx = part.indexOf(':');
    if (idx < 1) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim().toLowerCase();
    if (!INFLECT_KEYS.has(k) || !v || v === headword) continue;
    if (/^[a-z][a-z'-]*$/.test(v)) out.add(v);
  }
  return [...out].sort();
}

const PURE_WORD = /^[a-z][a-z'-]*$/;

/** 排除名单(固化)。放在这里而不是每次手工剔 —— 否则重跑 ingest 时被剔的词会悄悄回来。
 *  ⚠️ 剔词标准只认**内容质量实测**,不认话题范围(见文件里的 _criterion)。 */
function loadExcluded() {
  const p = path.join(DATA_DIR, 'excluded-words.json');
  if (!existsSync(p)) return new Map();
  const j = JSON.parse(readFileSync(p, 'utf8'));
  return new Map((j.words || []).map(w => [w.headword.toLowerCase(), w.reason]));
}

async function main() {
  const src = await ensureSource();
  process.stdout.write(`· 读取 ${src}\n`);
  const text = readFileSync(src, 'utf8');

  const rows = parseCsv(text);
  const header = rows.next().value;
  const col = Object.fromEntries(header.map((h, i) => [h.trim(), i]));
  for (const need of ['word', 'translation', 'tag', 'bnc', 'frq', 'exchange']) {
    if (col[need] === undefined) throw new Error(`ECDICT 缺列 ${need}(表头变了,脚本要改)`);
  }

  const excluded = loadExcluded();
  const kept = [];
  const skipped = { phrase: [], proper_noun: [], non_alpha: [], duplicate: [], no_freq: [], excluded: [] };
  const noPos = [];
  const inflections = {};
  const seen = new Map();
  let toeflTotal = 0;

  let excludedByTag = 0;
  let derivedOut = 0;

  for (const r of rows) {
    const tag = (r[col.tag] || '').split(/\s+/).filter(Boolean);
    /* 正常库按自己的 ECDICT 标签取;派生库按"命中任一来源标签"取,
       词频上限在下面拿到 freqRank 之后再卡。 */
    if (DERIVE ? !tag.some(t => DERIVE.tags.includes(t)) : !tag.includes(TAG)) continue;
    toeflTotal++;
    if (EXCLUDE_TAGS.size && tag.some(t => EXCLUDE_TAGS.has(t))) { excludedByTag++; continue; }

    const raw = (r[col.word] || '').trim();
    if (!raw) continue;

    if (/\s/.test(raw)) { skipped.phrase.push(raw); continue; }
    if (/^[A-Z]/.test(raw)) { skipped.proper_noun.push(raw); continue; }

    const hw = raw.toLowerCase();
    if (!PURE_WORD.test(hw)) { skipped.non_alpha.push(raw); continue; }
    if (excluded.has(hw)) { skipped.excluded.push(`${hw} (${excluded.get(hw)})`); continue; }

    const frq = Number(r[col.frq]) || 0;
    const bnc = Number(r[col.bnc]) || 0;
    const freqRank = frq > 0 ? frq : (bnc > 0 ? bnc : null);
    /* 派生库的词频闸:超出上限的直接不收。
       ⚠️ freq_rank 缺失的**也不收** —— 判不了就别猜着收进来,
          这是派生库唯一的取词依据。 */
    if (DERIVE && (freqRank === null || freqRank > DERIVE.maxFreq)) { derivedOut++; continue; }
    if (freqRank === null) skipped.no_freq.push(hw);

    if (seen.has(hw)) {
      const prev = seen.get(hw);
      skipped.duplicate.push(hw);
      // 同形保留 freq_rank 更优(数值更小)的那条
      if (freqRank !== null && (prev.freq_rank === null || freqRank < prev.freq_rank)) {
        prev.freq_rank = freqRank;
      }
      continue;
    }

    const pos = extractPos(r[col.translation]);
    if (!pos) noPos.push(hw);

    const rec = { headword: hw, pos, freq_rank: freqRank, freq_src: frq > 0 ? 'coca' : (bnc > 0 ? 'bnc' : 'none'), tags: tag };
    seen.set(hw, rec);
    kept.push(rec);

    const inf = extractInflections(r[col.exchange], hw);
    if (inf.length) inflections[hw] = inf;
  }

  // freq_rank 升序(1 = 最高频);无排名的一律沉底,再按字母序保证确定性
  kept.sort((a, b) => {
    const ar = a.freq_rank ?? Number.MAX_SAFE_INTEGER;
    const br = b.freq_rank ?? Number.MAX_SAFE_INTEGER;
    return ar - br || a.headword.localeCompare(b.headword);
  });

  mkdirSync(DATA_DIR, { recursive: true });
  const csvOut = ['headword,pos,freq_rank', ...kept.map(w => `${w.headword},${w.pos},${w.freq_rank ?? ''}`)].join('\n') + '\n';
  writeFileSync(path.join(DATA_DIR, `${BANK}.csv`), csvOut, 'utf8');
  writeFileSync(path.join(DATA_DIR, `${BANK}-inflections.json`), JSON.stringify(inflections, null, 0), 'utf8');
  writeFileSync(path.join(DATA_DIR, 'skipped.json'), JSON.stringify({
    _note: '被清洗掉的条目。no_pos 段的词仍然入表,只是 pos 为空。',
    source: { repo: 'skywind3000/ECDICT', license: 'MIT (c) 2025 Linwei', file: 'ecdict.csv' },
    bank: BANK,
    exclude_tags: [...EXCLUDE_TAGS],
    excluded_by_tag: excludedByTag,
    tagged_rows: toeflTotal,
    kept: kept.length,
    counts: Object.fromEntries(Object.entries(skipped).map(([k, v]) => [k, v.length]).concat([['no_pos', noPos.length]])),
    ...skipped,
    no_pos: noPos,
  }, null, 2), 'utf8');

  process.stdout.write(
    (DERIVE
      ? `· ${BANK}（**派生库**：来源标签 ${DERIVE.tags.join('/')}，词频 ≤ ${DERIVE.maxFreq}）
` +
        `  命中来源 ${toeflTotal} 条 → 词频超限/缺失剔除 ${derivedOut} → 保留 ${kept.length}
` +
        `  口径：${DERIVE.note}
`
      : `· ${BANK}（ECDICT tag=${TAG}）打标 ${toeflTotal} 条 → 保留 ${kept.length}
`) +
    (EXCLUDE_TAGS.size ? `  按 --exclude-tags=${[...EXCLUDE_TAGS].join(',')} 剔除 ${excludedByTag}\n` : '') +
    `  跳过: 短语${skipped.phrase.length} 专名${skipped.proper_noun.length} 非纯字母${skipped.non_alpha.length} 重复${skipped.duplicate.length}\n` +
    `  freq_rank 缺失 ${skipped.no_freq.length} · pos 缺失 ${noPos.length} · 屈折表 ${Object.keys(inflections).length} 词\n`
  );

  /* 0 词必须**报错退出**,不许静默出一份空送审件。
     踩过:--bank=zhongkao 因为标签名不对拿到 0 词,却照常写文件、退出码 0。
     "跑通了" 和 "跑出东西了" 是两回事。 */
  if (!kept.length) {
    process.stderr.write(`x ${BANK}(tag=${TAG})一个词都没取到 —— 多半是标签名不对(ECDICT 用 zk/gk/ky 这类短名)。
`);
    process.exit(2);
  }

  writeSample(kept, skipped, noPos, toeflTotal, excludedByTag);
  if (EMIT_SQL) writeSql(kept.slice(0, LIMIT));
}

function writeSample(kept, skipped, noPos, toeflTotal, excludedByTag) {
  const rnd = mulberry32(20260803);
  const idx = new Set();
  while (idx.size < Math.min(50, kept.length)) idx.add(Math.floor(rnd() * kept.length));
  const picked = [...idx].sort((a, b) => a - b).map(i => kept[i]);

  const md = `# 托福词表 · 送审样本

> 生成: \`node scripts/vocab/ingest-toefl.mjs\` · 抽样种子固定(20260803),复跑抽到的是同 50 词。

## 数据来源与授权

| 项 | 值 |
| --- | --- |
| 仓库 | [skywind3000/ECDICT](https://github.com/skywind3000/ECDICT) |
| 文件 | \`ecdict.csv\`(770,611 行) |
| 授权 | **MIT License, Copyright (c) 2025 Linwei** |
| 核实 | 2026-08-03 经 GitHub API 确认 \`license.spdx_id === "MIT"\` |

**被否掉的候选源**:\`kajweb/dict\`、\`mahavivo/english-wordlists\` 两个仓库 \`license\` 字段均为 \`null\`(无授权声明),按"确认 license 后才可用"弃用。

**词频来源**:同一份 ECDICT 自带 \`frq\`(COCA 当代语料库排名)与 \`bnc\`(英国国家语料库排名),故未再引第三方词频表。取值 \`frq > 0 ? frq : (bnc > 0 ? bnc : 空)\`。

## 总量

| 指标 | 数量 |
| --- | ---: |
| ECDICT 中 \`toefl\` 打标条目 | ${toeflTotal} |
| **清洗后入库词数** | **${kept.length}** |
| 跳过 · 含空格短语 | ${skipped.phrase.length} |
| 跳过 · 专有名词(首字母大写) | ${skipped.proper_noun.length} |
| 跳过 · 非纯字母 | ${skipped.non_alpha.length} |
| 跳过 · 小写后重复 | ${skipped.duplicate.length} |
| 保留但 freq_rank 缺失(排序沉底) | ${skipped.no_freq.length} |
| 保留但 pos 缺失 | ${noPos.length} |

> \`vocab_banks.toefl.total_words\` 目前填的是 8000,实际可用 ${kept.length}。**要不要把 total_words 改成 ${kept.length}?** 这个数会显示在词库中心的卡片上。

## 随机 50 词

| # | headword | pos | freq_rank |
| ---: | --- | --- | ---: |
${picked.map((w, i) => `| ${i + 1} | ${w.headword} | ${w.pos || '—'} | ${w.freq_rank ?? '—'} |`).join('\n')}

## batch1 预览(freq_rank 前 20,即最高频的 20 个托福词)

| # | headword | pos | freq_rank |
| ---: | --- | --- | ---: |
${kept.slice(0, 20).map((w, i) => `| ${i + 1} | ${w.headword} | ${w.pos || '—'} | ${w.freq_rank} |`).join('\n')}

${EXCLUDE_TAGS.size
      ? `## 选词口径(已定:方案 D)

按 \`--exclude-tags=${[...EXCLUDE_TAGS].join(',')}\` 剔除 **${excludedByTag}** 个已被中考/高考/四级覆盖的词,
词池从 6955 收到 **${kept.length}**,再按 freq_rank 取前 200 作 batch1。

这么做的原因:ECDICT 的 \`toefl\` 标签含义是"托福里出现过",不是"托福难度"。
不过滤时前 200 全是 \`can / way / well / even\` 这类 A1 词,给托福考生做词卡没价值。
`
      : buildTagComparison(kept)}

## 请 Aaron 确认${EXCLUDE_TAGS.size ? '三' : '四'}件事

${EXCLUDE_TAGS.size ? '' : `1. **⚠️ 首批取哪 200 词**(见上面的对比表,这条最要紧)。
`}1. **词表本身**:上面 50 词是不是托福该有的样子?有没有明显不该在托福库里的?
2. **屈折形是否算独立词条**:ECDICT 把 \`abandon\` / \`abandoned\` / \`abandonment\` 都打了 toefl 标,本脚本**全部保留**为独立词条(\`abandoned\` 有独立的形容词义"被抛弃的",托福词表通常也这么收)。如果你要按原形合并,说一声,清洗规则加一条即可。
3. **total_words 要不要从 8000 改成 ${kept.length}**(这个数会显示在词库中心的卡片上)。
`;
  /* ⚠️ 文件名**必须跟 --bank 走**。原来写死 'toefl',跑 --bank=cet4 会把托福那份
     送审样本整个覆盖掉(2026-08-09 踩过一次,靠 git checkout 救回)。SQL 同理。 */
  const out = path.join(REPO, 'REVIEWAA', `vocab_${BANK}_wordlist_sample.md`);
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, md, 'utf8');
  process.stdout.write(`· 送审样本 → REVIEWAA/vocab_${BANK}_wordlist_sample.md\n`);
}

/** ⚠️ 首批选词的实质问题:ECDICT 的 toefl 标签是"托福里出现过",不是"托福难度"。
 *  直接取 freq_rank 前 200 → 全是 can/way/well/even 这种 A1 词,给托福考生做词卡没意义。
 *  这里把几档过滤方案的实际结果摆出来,让 Aaron 拿证据拍板。 */
function buildTagComparison(kept) {
  const OPTIONS = [
    { label: '**A. 不过滤**(原指令:直接取前 200)', excl: [] },
    { label: 'B. 排除 `zk`(中考)', excl: ['zk'] },
    { label: 'C. 排除 `zk` `gk`(中考+高考)', excl: ['zk', 'gk'] },
    { label: '**D. 排除 `zk` `gk` `cet4`**(中考+高考+四级)', excl: ['zk', 'gk', 'cet4'] },
    { label: 'E. 排除 `zk` `gk` `cet4` `cet6`', excl: ['zk', 'gk', 'cet4', 'cet6'] },
  ];
  const lines = OPTIONS.map(o => {
    const ex = new Set(o.excl);
    const pool = kept.filter(w => w.freq_rank !== null && !w.tags.some(t => ex.has(t)));
    return `| ${o.label} | ${pool.length} | ${pool.slice(0, 12).map(w => w.headword).join(', ')} |`;
  });
  return `## ⚠️ 首批 200 词怎么取 —— 需要你拍板

ECDICT 的 \`toefl\` 标签含义是"**这个词在托福里出现过**",不是"这个词是托福难度"。
所以严格按原指令"取 freq_rank 前 200"拿到的是**最简单的 200 个词**(见上表:can / way / well / even / down…),
给托福考生做词卡基本没价值 —— 这批词还要配 3 条例句 + 4 条音频,成本花在 A1 词上很亏。

各档过滤方案的**实测结果**:

| 方案 | 可选词池 | freq_rank 最高的 12 个词 |
| --- | ---: | --- |
${lines.join('\n')}

**我的建议是 D**:剔掉中考/高考/四级已覆盖的词之后,首批变成
defense / attorney / participant / context / regime / perception 这一档 —— 明显是托福该练的词,
而且仍然按词频排序,不是随机挑难词。

**当前交付的 \`SQLAA/vocab_toefl_words_batch1.sql\` 走的是方案 A(严格按原指令)。**
你要是选 D,我重跑一条命令就换掉,不用改任何代码:

\`\`\`
node scripts/vocab/ingest-toefl.mjs --exclude-tags=zk,gk,cet4 --emit-sql
\`\`\`
`;
}

function writeSql(batch) {
  const esc = s => String(s).replace(/'/g, "''");
  const val = w => `('${esc(w.headword)}', ${w.pos ? `'${esc(w.pos)}'` : 'NULL'}, ${w.freq_rank ?? 'NULL'})`;

  const sql = `-- ${BANK} 词库 batch1:freq_rank 前 ${batch.length} 词
-- 生成: node scripts/vocab/ingest-toefl.mjs --bank=${BANK} --limit=${batch.length} --emit-sql
-- 数据源: skywind3000/ECDICT · MIT License (c) 2025 Linwei
-- ⚠️ 由 Aaron 执行。脚本本身从不写库。
--
-- 幂等性: vocab_words 走 ON CONFLICT (lower(headword))(索引 vocab_words_headword_uq),
--         vocab_word_banks 走 PK (word_id, bank_id)。重复跑不会产生重复行。
-- bank_id 用子查询取,不硬编码 uuid。

BEGIN;

-- ── 跑之前的基线 ──
SELECT 'BEFORE' AS stage,
       (SELECT count(*) FROM vocab_words) AS words,
       (SELECT count(*) FROM vocab_word_banks
         WHERE bank_id = (SELECT id FROM vocab_banks WHERE code = '${BANK}')) AS bank_links;

-- ① 词条
INSERT INTO vocab_words (headword, pos, freq_rank) VALUES
${batch.map(val).join(',\n')}
ON CONFLICT (lower(headword)) DO UPDATE
  SET pos        = COALESCE(EXCLUDED.pos, vocab_words.pos),
      freq_rank  = COALESCE(EXCLUDED.freq_rank, vocab_words.freq_rank),
      updated_at = now();

-- ② 挂到 ${BANK} 词库
INSERT INTO vocab_word_banks (word_id, bank_id)
SELECT w.id, b.id
  FROM vocab_words w
  CROSS JOIN (SELECT id FROM vocab_banks WHERE code = '${BANK}') b
 WHERE lower(w.headword) IN (${batch.map(w => `'${esc(w.headword)}'`).join(', ')})
ON CONFLICT (word_id, bank_id) DO NOTHING;

-- ── 跑之后的实测 ──
SELECT 'AFTER' AS stage,
       (SELECT count(*) FROM vocab_words) AS words,
       (SELECT count(*) FROM vocab_word_banks
         WHERE bank_id = (SELECT id FROM vocab_banks WHERE code = '${BANK}')) AS bank_links;

-- ── 断言:**只判本批这 ${batch.length} 个词**,不判全表 ──────
-- ⚠️ 原来写的是 (SELECT count(*) FROM vocab_words) = 本批词数。
--    那只在**第一个词库**(全表就是这一批)时成立。从 cet6 起每次都报 f,
--    Aaron 每次都得自己心算"哦这是没算共用词" —— **断言变成噪音就等于没有断言**。
--    真正要判的是:本批的词是不是都进表了、是不是都挂上了本库。
-- ⚠️ 用 DO + RAISE:不过直接抛异常整笔回滚,不靠人眼看 t/f。
DO $gate$
DECLARE
  n_batch    int := ${batch.length};
  n_missing  int;
  n_unlinked int;
  n_links    int;
BEGIN
  SELECT count(*) INTO n_missing
    FROM (VALUES ${batch.map(w => `('${esc(w.headword)}')`).join(', ')}) AS v(headword)
    LEFT JOIN vocab_words w ON lower(w.headword) = v.headword
   WHERE w.id IS NULL;

  SELECT count(*) INTO n_unlinked
    FROM (VALUES ${batch.map(w => `('${esc(w.headword)}')`).join(', ')}) AS v(headword)
    JOIN vocab_words w ON lower(w.headword) = v.headword
   WHERE NOT EXISTS (
     SELECT 1 FROM vocab_word_banks wb
      WHERE wb.word_id = w.id
        AND wb.bank_id = (SELECT id FROM vocab_banks WHERE code = '${BANK}'));

  SELECT count(*) INTO n_links
    FROM vocab_word_banks
   WHERE bank_id = (SELECT id FROM vocab_banks WHERE code = '${BANK}');

  RAISE NOTICE '本批 % 词:未进表 % · 未挂库 % · ${BANK} 链接总数 %',
    n_batch, n_missing, n_unlinked, n_links;

  IF n_missing > 0 OR n_unlinked > 0 OR n_links <> n_batch THEN
    RAISE EXCEPTION '断言不过:未进表 % · 未挂库 % · 链接 %/% —— 已回滚,库里没有任何改动',
      n_missing, n_unlinked, n_links, n_batch;
  END IF;
END
$gate$;

COMMIT;
`;
  const out = path.join(REPO, 'SQLAA', `vocab_${BANK}_words_batch1.sql`);
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, sql, 'utf8');
  process.stdout.write(`· batch1 SQL(${batch.length} 词) → SQLAA/vocab_${BANK}_words_batch1.sql\n`);
}

main().catch(e => { process.stderr.write(`✗ ${e.stack || e.message}\n`); process.exit(1); });
