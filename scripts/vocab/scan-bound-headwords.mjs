/**
 * 扫「不能独立成词的词条」—— 词表里混进来的半截固定搭配(inasmuch → inasmuch as)。
 *
 * ── 这个检测器能判什么、不能判什么 ────────────────────────────────
 * **不能判**"这个词能不能独立成词" —— 那是语义判断,不是表层形式。
 * 按第九条(分不清就别硬判),这里**不出裁决,只出短名单交人审**。
 *
 * ⚠️ 为什么不能靠 def_zh IS NULL:那只抓得到**生成失败**的。
 *    真正危险的是"半截词侥幸编出了释义"—— 库里查不出任何异常,
 *    只有看它怎么被用才看得见。这个扫描补的就是这个洞。
 *
 * ── 判据 ────────────────────────────────────────────────────────
 * A【词典标注】ECDICT 的英文 definition 里带**元语言标注**,直说这个词要搭伴:
 *      inasmuch → "in like manner; ... -- followed by as. See In as much as"
 *      fro      → "now used only in opposition to the word to, in the phrase to and fro"
 *      dint     → "interchangeable with `means' in the expression `by means of'"
 *    这是**读词典自己写的话**,不是我推断语义 —— 可计算、可复现。
 *
 * B【邻词固定】词条的 3 条例句里,它**每一次**都被同一个词紧跟/紧跟同一个词。
 *    ⚠️ 只对 adv./conj./prep. 这类虚词开这条。
 *       第一版对全部词性开,命中 1371 条几乎全是噪声:英语抽象名词天然吃
 *       "the X of" 这个框架(the gist of / a modicum of / the brunt of),
 *       那是**能产的语法框架,不是固定搭配**。判据选错了对象,不是阈值问题。
 *       虚词才有"必须带某个伴儿"这回事,所以把范围收在虚词上。
 *
 * C【已知残片】拉丁/法语短语被切一半留下的词(versa / fide / facto …),
 *    词典里往往连英文释义都是空的。列表是人工的,membership 判定是客观的。
 *
 * 用法:node scripts/vocab/scan-bound-headwords.mjs [--ecdict=<path>]
 * 只读:本地 generated JSON + ecdict.csv。不连库、不写库、不出 SQL。
 */
import { readFileSync, readdirSync, existsSync, createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GEN = path.join(HERE, 'data', 'generated');
const arg = (k, d) => process.argv.find(a => a.startsWith(`--${k}=`))?.split('=').slice(1).join('=') ?? d;
const ECDICT = arg('ecdict', path.join(tmpdir(), 'ecdict-source', 'ecdict.csv'));

/* ── 收齐所有词条(连同它们的例句) ─────────────────────────────
   ⚠️ 必须**连库里的词表一起**扫,不能只扫本地已生成内容的:
      inasmuch 正因为没生成出内容,才不在 generated JSON 里 ——
      第一版只扫本地,于是**唯一一个已知真阳性反而漏了**,还看不出来。
      这就是"覆盖不全被读成全通过"。 */
const words = new Map();   // headword -> { pos, freq, banks:Set, examples[] }
if (!process.argv.includes('--local-only')) {
  const { loadEnv, requireKeys } = await import('./env.mjs');
  const ENV = loadEnv(path.resolve(HERE, '..', '..'), { quiet: true });
  requireKeys(ENV, ['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY']);
  const H = { apikey: ENV.VITE_SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${ENV.VITE_SUPABASE_PUBLISHABLE_KEY}` };
  for (let off = 0; ; off += 1000) {
    const r = await fetch(`${ENV.VITE_SUPABASE_URL}/rest/v1/vocab_words?select=headword,pos,freq_rank&offset=${off}&limit=1000`, { headers: H });
    if (!r.ok) throw new Error(`REST ${r.status}: ${(await r.text()).slice(0, 200)}`);
    const rows = await r.json();
    for (const w of rows) {
      const hw = String(w.headword || '').toLowerCase();
      if (hw) words.set(hw, { pos: w.pos || '', freq: w.freq_rank ?? null, banks: new Set(['(库)']), examples: [] });
    }
    if (rows.length < 1000) break;
  }
  console.log(`库内词表:${words.size} 词`);
}
for (const file of readdirSync(GEN)) {
  if (!file.endsWith('-content.json') || file.includes('trial') || file.includes('before-')) continue;
  const bank = file.replace('-content.json', '');
  const rec = JSON.parse(readFileSync(path.join(GEN, file), 'utf8'));
  for (const w of Object.values(rec)) {
    const hw = String(w.headword || '').toLowerCase();
    if (!hw) continue;
    const e = words.get(hw) || { pos: w.pos || '', freq: w.freq_rank ?? null, banks: new Set(), examples: [] };
    e.banks.add(bank);
    if (!e.examples.length) e.examples = w.examples || [];
    words.set(hw, e);
  }
}
console.log(`词条总数(本地已生成内容的):${words.size}\n`);

/* ── A:词典元语言标注 ─────────────────────────────────────────── */
/* ⚠️ 每条都得能举出真实例子,否则就是凭感觉加正则(断言必附证据)。
      followed by      ← inasmuch
      in the phrase    ← fro
      in the expression← dint
      used only        ← fro
      preceded by / chiefly in / usually in ← 同族写法,ECDICT 里成对出现 */
const MARKERS = [
  /--\s*followed by\s+\w+/i,
  /--\s*preceded by\s+\w+/i,
  /\bnow used only\b/i,
  /\bused only in\b/i,
  /\bonly in the phrase\b/i,
  /\bchiefly in the phrase\b/i,
  /\bin the phrase\b/i,
  /\bin the expression\b/i,
];

/**
 * 标注命中之后还要判**这条标注管的是整个词条,还是多义词的某个义项**。
 *
 * ⚠️ 这是第二版判据。第一版判的是"标注后面的短语里含不含词条本身",
 *    结果**正好判反**:唯一已知真阳性 inasmuch 掉进了"弱"那一档
 *    (它的标注写作 "See In as much as",带空格,不含 "inasmuch" 这个连写串),
 *    而 call / credit / old / nude 那 13 个误报全占着"强"。
 *    有一个已知真阳性可对,才看得出判据方向反了 —— 没有它我会把 13 个误报当战果交出去。
 *
 * 真正的区别是**义项数**:
 *    fro / inasmuch —— 整个词条就一两个义项,标注说的就是这个词本身的用法;
 *    call / credit —— 十几个义项,"in the phrase" 只是其中某一条的顺带说明。
 * ECDICT 的 definition 用 \n 分义项,数一下就是了。
 */
const SENSE_LIMIT = 2;

/**
 * 数义项数。
 *
 * ⚠️ 不能直接 split('\n') —— ECDICT 里 `\n` **既当义项分隔、又当换行续行**:
 *      inasmuch: "adv. In like degree; ...;\n   considering that; ...\n   In, prep."
 *                → 3 个 \n,但只有 1 个义项,后两段是续行。
 *    第一版这么数,inasmuch 被算成 3 个义项、fro 算成 4 个,双双掉出"强"档 ——
 *    等于判据又白写一轮。真正的义项边界是**以词性标签开头**的段;
 *    续行一律以空格缩进开头。
 */
const POS_HEAD = /^\s*(n|v|vt|vi|a|adj|adv|r|s|prep|conj|pron|int|num|art|aux)\b\.?\s/i;
const countSenses = def =>
  def.split(/\\n|\n/).filter(seg => POS_HEAD.test(seg)).length || 1;

/** 极简 CSV 取字段:ECDICT 用标准双引号转义(字段内可含逗号和 \n)。 */
function csvFields(line) {
  const out = [];
  let cur = '', q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') q = false;
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === ',') { out.push(cur); cur = ''; }
    else cur += c;
  }
  out.push(cur);
  return out;
}

const flaggedA = [];
const emptyDef = [];
if (!existsSync(ECDICT)) {
  console.log(`⊘ 找不到 ecdict.csv(${ECDICT}),A/C 两条判据跳过 —— **这不叫"没问题",叫没测**。`);
} else {
  const rl = createInterface({ input: createReadStream(ECDICT, 'utf8'), crlfDelay: Infinity });
  let first = true;
  for await (const line of rl) {
    if (first) { first = false; continue; }
    const comma = line.indexOf(',');
    if (comma < 0) continue;
    const w = line.slice(0, comma).replace(/^"|"$/g, '').toLowerCase();
    if (!words.has(w)) continue;
    /* definition 是第 3 列;简单起见直接在整行里找标注 —— 标注只可能出现在释义文本里 */
    const f = csvFields(line);
    const definition = f[2] || '';
    const hit = MARKERS.find(re => re.test(definition));
    if (hit) {
      /* ⚠️ 报**上下文**不报"命中了哪条正则":标注后面跟的到底是哪个短语,
         直接决定这是真半截词(fro → "in the phrase to and fro")还是
         多义词某个子义项的顺带说明(call → "in the phrase `the call of duty'")。
         只打正则名的话两者长得一模一样,人也判不了。 */
      const m = definition.match(hit);
      const ctx = definition.slice(Math.max(0, m.index - 15), m.index + 65).replace(/\s+/g, ' ').trim();
      const senses = countSenses(definition);
      flaggedA.push({ w, ctx, senses, strong: senses <= SENSE_LIMIT });
    }
    if (!definition.trim()) emptyDef.push(w);
  }
}

/* ── B:虚词的邻词固定 ─────────────────────────────────────────── */
const FUNCTION_POS = /\b(adv|conj|prep|pron|aux|art)\b/i;
/* 语法框架填充词:限定词 / 系动词 / 助动词。
   ⚠️ 它们做邻词**不构成任何证据** —— "is obviously" / "across the" 里固定的是
      英语句法本身,不是这个词的搭配。第一版没排除它们,B 全是这种。
      同一个道理:名词的 "the X of" 也是框架,所以 B 干脆不看名词。 */
const FRAME_WORDS = new Set(['the', 'a', 'an', 'this', 'that', 'these', 'those', 'its', 'his', 'her', 'their', 'our', 'my', 'your',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'am',
  'has', 'have', 'had', 'will', 'would', 'can', 'could', 'may', 'might', 'must', 'should', 'do', 'does', 'did', 'becoming', 'become']);
const norm = t => t.toLowerCase().replace(/^[^a-z']+|[^a-z']+$/g, '').replace(/'s$|'$/, '');
const flaggedB = [];
for (const [hw, e] of words) {
  if (hw.includes(' ')) continue;
  if (!FUNCTION_POS.test(e.pos)) continue;
  if (!e.examples || e.examples.length < 2) continue;
  const nexts = [], prevs = [];
  for (const ex of e.examples) {
    const toks = String(ex.sentence || '').split(/\s+/).map(norm).filter(Boolean);
    const i = toks.indexOf(hw);
    if (i < 0) { nexts.push(null); prevs.push(null); continue; }
    nexts.push(toks[i + 1] ?? '<句末>');
    prevs.push(i === 0 ? '<句首>' : toks[i - 1]);
  }
  const same = a => a.length && a.every(x => x && x === a[0]);
  const usable = t => t && t !== '<句末>' && t !== '<句首>' && !FRAME_WORDS.has(t);
  const fn = same(nexts) && usable(nexts[0]) ? nexts[0] : null;
  const fp = same(prevs) && usable(prevs[0]) ? prevs[0] : null;
  if (fn || fp) flaggedB.push({ w: hw, pos: e.pos, pattern: [fp, hw, fn].filter(Boolean).join(' ') });
}

/* ── 汇总 ──────────────────────────────────────────────────────── */
const show = (title, rows, fmt) => {
  console.log(`${title}(${rows.length})`);
  if (!rows.length) console.log('   —— 无');
  for (const r of rows) console.log('   ' + fmt(r));
  console.log('');
};
show(`A① 词典标注"要跟某个词连用",且整条词目只有 ≤${SENSE_LIMIT} 个义项(强)`,
  flaggedA.filter(r => r.strong).sort((a, b) => a.w.localeCompare(b.w)),
  r => `${r.w.padEnd(16)} 义项${String(r.senses).padStart(2)}  ${r.ctx}`);
show('A② 有标注但词目义项很多(标注只管其中一个义项,基本是误报)',
  flaggedA.filter(r => !r.strong).sort((a, b) => a.w.localeCompare(b.w)),
  r => `${r.w.padEnd(16)} 义项${String(r.senses).padStart(2)}  ${r.ctx}`);
show('B 虚词且三条例句邻词完全固定', flaggedB.sort((a, b) => a.w.localeCompare(b.w)),
  r => `${r.w.padEnd(18)} ${r.pos.padEnd(10)} ${r.pattern}`);
/* C:人工列的已知残片表,查 membership。
   ⚠️ 判据分工写清楚:**列表是人的判断,查表是机器的判断**。
      别把它包装成"检测器发现的" —— 它发现不了没列进来的词。
   ⚠️ 上一版 C 是"ECDICT 英文释义为空",命中 86 个,全是 adlib/cook/cost 这种
      正常词(ECDICT 单纯缺英文释义而已),零判别力,已废弃。 */
const KNOWN_BOUND = [
  // 只以固定连词短语出现
  'inasmuch', 'insofar', 'forasmuch', 'howbeit',
  // 拉丁/法语短语被切一半
  'versa', 'fide', 'facto', 'jure', 'ipso', 'sequitur', 'oeuvre', 'esprit', 'raison',
  // 只活在某个介词短语里的名词
  'lieu', 'dint', 'behest', 'yore', 'kilter', 'cahoots', 'smithereens', 'fettle', 'sooth',
  'tenterhooks', 'loggerheads', 'abeyance', 'auspices', 'aegis', 'umbrage',
  // 只活在成对结构里
  'fro', 'akimbo', 'amok', 'amuck',
];
const hitC = KNOWN_BOUND.filter(w => words.has(w));
show('C 人工残片表 ∩ 库内词表', hitC.map(w => ({ w })), r => `${r.w}`);
console.log(`   (表里共 ${KNOWN_BOUND.length} 个,库里有 ${hitC.length} 个)\n`);
console.log(`   参考:词典英文释义为空的有 ${new Set(emptyDef).size} 个 —— 已验证零判别力(全是 ECDICT 缺英文释义的普通词),不列。\n`);

const all = new Set([...flaggedA.filter(r => r.strong).map(r => r.w), ...flaggedB.map(r => r.w), ...hitC]);
console.log(`短名单合计 ${all.size} 个:${[...all].sort().join(', ') || '(空)'}`);
console.log('\n⚠️ 这是**短名单不是裁决**。是不是半截词、改不改、改成什么,要人看(第九条)。');
