/**
 * 出「def_zh 存在 <2 字义项」的全库清单(51 条)—— 只列不改,交 Aaron 裁。
 *
 * 数据源:**线上库只读快照**(不是本地 JSON —— 本地缓存已落后于库,
 * sense_fix / comma_fix 跑过之后 DB 才是权威)。
 *
 * ══ 我的结论:这 51 条不该一刀切,而且**规格本身可能要改** ══
 *
 * 分两类:
 *   【A 类 · 单字就是标准词】32 条 —— 化学元素(钙/氦/锌/镁/钾/氖/硫)、
 *     生物与器官(酶/膜/腺/猿/蛾/龟/肠)、器物(窑/犁/鞘/箔/釉/耙/筏)…
 *     **单字形就是汉语里的规范词**。硬凑两字只能造出「钙元素」「锌金属」这种
 *     注水词,比"违规"更差 —— 学生查词典看到的就是「钙」。
 *     建议:**放宽规格**,允许单字义项;或给 A 类开白名单。
 *   【B 类 · 确实太简、双字更好】19 条 —— 动词类的「拉；拖」「砍；划」
 *     「啃；咬」「刺；戳」「拧；扭」,以及少数名词的「腔；洞」「壶；罐」。
 *     这类单字读起来像半个词,双字词典体确实更好。建议按下表改。
 *
 * ⚠️ 顺带记档:体裁闸 defZhShapeProblem **只卡了上限 8 字,没卡下限 2 字**,
 *    而规格写的是 2-8。又是判据没照规格写全(第四条规矩的同型问题)。
 *    但**先别急着补下限** —— 如果 A 类放宽,下限就该是 1 而不是 2。
 *    等 Aaron 裁完规格再改闸门,免得闸门先跟着错规格跑一轮。
 *
 *   node scripts/vocab/emit-short-sense-list.mjs
 */
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SPEC } from './spec.mjs';
import { REPO, ENV } from './llm.mjs';

const SUPA = ENV.VITE_SUPABASE_URL, ANON = ENV.VITE_SUPABASE_PUBLISHABLE_KEY;

/** B 类建议新值(人工拟,交 Aaron 裁)。未列入的按 A 类处理。 */
const B_SUGGEST = {
  tug: '拉拽；拖曳', slash: '砍劈；划破', gnaw: '啃咬', prod: '戳刺',
  wring: '拧绞；扭转', batter: '打击；揉捏', peck: '啄食；轻吻',
  squat: '蹲下；蹲坐', cavity: '空腔；洞穴', jug: '水壶；瓦罐',
  shaft: '轴杆；杆柄', stalk: '茎秆；叶柄', strand: '细线；一缕',
  strings: '细线；琴弦', hem: '边缘；褶边', arc: '弧线；弧形',
  ply: '层数；层次', deity: '神祇；神灵', trough: '水槽；食槽',
};

/** A 类里"单字确为规范词"的判断依据,写进清单供复核。 */
const A_REASON = {
  calcium: '化学元素名', helium: '化学元素名', zinc: '化学元素名',
  magnesium: '化学元素名', potassium: '化学元素名', neon: '化学元素名',
  sulfur: '化学元素名', alkali: '化学类名', enzyme: '生化术语',
  membrane: '解剖学名', gland: '解剖学名', intestine: '解剖学名',
  genus: '生物分类学名', ape: '动物名', moth: '动物名', turtle: '动物名',
  shrimp: '动物名', enigma: '单字即标准译法', kiln: '器物名', plow: '器物名',
  sheath: '器物名', foil: '材料名', glaze: '材料名', harrow: '农具名',
  raft: '器物名', badger: '动物名', nickel: '化学元素名', pulp: '材料名',
  sprout: '植物部位', pitcher: '器物名', parachute: '第二义为第一义缩略',
  stratum: '地质学名',
};

/* ⚠️ PostgREST **单次最多 1000 行**,`limit=5000` 不起作用 —— 它静默截断。
 *    第一版就栽在这:拿到 1000 词、筛出 19 条,而库里实际是 51 条。
 *    "少了 32 条"不会报错,只会让清单看起来完整。一律翻页。 */
async function fetchAll() {
  const out = [];
  for (let offset = 0; ; offset += 1000) {
    const url = `${SUPA}/rest/v1/vocab_words?select=headword,pos,def_zh&def_zh=not.is.null`
      + `&order=headword&offset=${offset}&limit=1000`;
    const res = await fetch(url, { headers: { apikey: ANON, Authorization: `Bearer ${ANON}` } });
    if (!res.ok) { process.stderr.write(`REST HTTP ${res.status}\n`); process.exit(1); }
    const page = await res.json();
    out.push(...page);
    if (page.length < 1000) return out;
  }
}
const all = await fetchAll();
process.stdout.write(`· 只读拉取 ${all.length} 词(翻页)\n`);
const rows = all.filter(r =>
  String(r.def_zh).split(SPEC.defZh.sep).some(s => s.trim().length < SPEC.defZh.minChars));
rows.sort((a, b) => a.headword.localeCompare(b.headword));

const B = rows.filter(r => B_SUGGEST[r.headword]);
const A = rows.filter(r => !B_SUGGEST[r.headword]);

const md = [
  `# def_zh 短义项(<${SPEC.defZh.minChars} 字)全库清单 · 待裁(${rows.length} 条)`,
  '',
  '数据源:**线上库只读快照**(本地缓存已落后于库,sense_fix / comma_fix 跑过之后 DB 才是权威)。',
  '',
  '## ⚠️ 我的结论:不该一刀切,而且规格本身可能要改',
  '',
  `体裁闸只卡了上限 ${SPEC.defZh.maxChars} 字、**没卡下限 ${SPEC.defZh.minChars} 字**,而规格写的是 ${SPEC.defZh.minChars}-${SPEC.defZh.maxChars} ——`,
  '又是判据没照规格写全(第四条规矩的同型问题)。但**先别急着补下限**:',
  '如果 A 类放宽,下限就该是 1 而不是 2,闸门跟着错规格跑一轮更麻烦。',
  '',
  `## A 类 · 单字就是标准词(${A.length} 条)—— 建议**放宽规格**,不改内容`,
  '',
  '这些词的单字形**就是汉语里的规范词**:化学元素、生物分类、解剖学名、器物名。',
  '硬凑两字只能造出「钙元素」「锌金属」这种注水词,比"违规"更差 ——',
  '学生查词典看到的就是「钙」。',
  '',
  '| 词 | 词性 | 现值 | 为什么单字是对的 |',
  '| --- | --- | --- | --- |',
  ...A.map(r => `| ${r.headword} | ${r.pos ?? ''} | ${r.def_zh} | ${A_REASON[r.headword] ?? '单字为规范译名'} |`),
  '',
  `## B 类 · 确实太简,双字更好(${B.length} 条)—— 建议按下表改`,
  '',
  '这类单字读起来像半个词(动词尤其明显),双字词典体确实更好。',
  '下面是我拟的新值,**以你裁决为准**。',
  '',
  '| 词 | 词性 | 现值 | 建议新值 |',
  '| --- | --- | --- | --- |',
  ...B.map(r => `| ${r.headword} | ${r.pos ?? ''} | ${r.def_zh} | **${B_SUGGEST[r.headword]}** |`),
  '',
  '## 三种可能的裁法',
  '',
  `1. **A 放宽 + B 改**(我倾向):规格下限从 ${SPEC.defZh.minChars} 降到 1,B 类 ${B.length} 条按上表改。`,
  '   闸门相应改成"下限 1 字"。',
  `2. **全改**:${rows.length} 条都凑成双字。会造出一批注水词,我不建议。`,
  '3. **全放宽**:下限降到 1,一条都不改。B 类的「拉；拖」会一直读着别扭。',
  '',
  '裁完我出 SQL;规格改动我同步改 `spec.mjs` 与闸门,保持单一事实源。',
].join('\n');

writeFileSync(path.join(REPO, 'REVIEWAA', 'vocab_toefl_short_sense_list.md'), md, 'utf8');
process.stdout.write(`→ REVIEWAA/vocab_toefl_short_sense_list.md(共 ${rows.length}:A 类 ${A.length} / B 类 ${B.length})\n`);
