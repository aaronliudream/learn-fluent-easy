// 把 starter 语法题 JSON 转成幂等 SQL:加 volume/unit 列 + 建新语法点 + 插题。
// 用法: node scripts/gen-grammar-insert.mjs scripts/starter-grammar-for-cc.json scripts/grammar-starter-insert.sql
import { readFileSync, writeFileSync } from 'node:fs';

const [, , inFile, outFile] = process.argv;
if (!inFile || !outFile) { console.error('用法: node gen-grammar-insert.mjs <in.json> <out.sql>'); process.exit(1); }
const rows = JSON.parse(readFileSync(inFile, 'utf8'));
const esc = s => String(s ?? '').replace(/'/g, "''");
const LET = ['A', 'B', 'C', 'D'];

// 考点 → 分类(category code)。默认 other;be动词→tense;情态/have→verb。
const CAT = {
  '①Be动词肯定句+自我介绍 (I am / My name is / is / are)': 'tense',
  '③情态动词 May 的礼貌用法': 'verb',
  '①have 的用法 (have / has)': 'verb',
  '①be动词的现在时 (am/is/are)': 'tense',
};
const catFor = pt => CAT[pt] || 'other';
const gradeOf = vol => Number(String(vol)[0]);
// 单元 → code 前缀:卷别 A 无后缀、B 加 'b' 区分。
//   7A SU1→g7su1、7A U1→g7u1、7B U1→g7bu1、8A U1→g8u1、8B U1→g8bu1
function unitCodePrefix(vol, unit) {
  const g = gradeOf(vol);
  const volTag = String(vol).slice(1).toUpperCase() === 'B' ? 'b' : '';
  const m = String(unit).match(/^(SU|U)(\d+)$/i);
  if (!m) return `g${g}${volTag}x${unit}`;
  const pre = m[1].toUpperCase() === 'SU' ? 'su' : 'u';
  return `g${g}${volTag}${pre}${m[2]}`;
}

// 1) 聚合语法点:按出现顺序 distinct(volume,unit,point)
const points = []; // {key, volume, unit, point, code, cat, sort}
const pkey = r => `${r.volume}|${r.unit}|${r.point}`;
const seen = new Map();
const perUnitCount = {};
for (const r of rows) {
  const k = pkey(r);
  if (seen.has(k)) continue;
  const un = r.unit;
  perUnitCount[un] = (perUnitCount[un] || 0) + 1;
  const idx = perUnitCount[un];
  const code = `${unitCodePrefix(r.volume, un)}.${String(idx).padStart(2, '0')}`;
  const p = { key: k, volume: r.volume, unit: un, point: r.point, code, cat: catFor(r.point), sort: idx };
  seen.set(k, p);
  points.push(p);
}

// 2) 校验每题
let bad = 0;
for (const [i, r] of rows.entries()) {
  if (!Array.isArray(r.options) || r.options.length !== 4) { console.error(`#${i} 选项≠4: ${r.stem}`); bad++; }
  if (r.answer_index < 0 || r.answer_index > 3) { console.error(`#${i} answer_index越界: ${r.stem}`); bad++; }
  if (r.options?.[r.answer_index] !== r.answer_text) { console.error(`#${i} answer_text对不上下标: ${r.stem} | idx=${r.answer_index} opt=${r.options?.[r.answer_index]} text=${r.answer_text}`); bad++; }
}
if (bad) { console.error(`\n❌ ${bad} 处校验失败,未生成 SQL。`); process.exit(1); }

// 3) 生成 SQL
let sql = `-- 7A Starter 语法题进库(方案B Step1)。幂等:可重复跑。\n`;
sql += `-- 生成自 ${inFile} | ${points.length} 个语法点 / ${rows.length} 道题\n\n`;

sql += `-- A. junior_grammar_points 加 volume/unit 列(单元归属;旧点保持 NULL → 单元视图自动隐藏)\n`;
sql += `ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS volume text;\n`;
sql += `ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS unit text;\n\n`;

sql += `-- B. 建 ${points.length} 个新语法点(每考点一个;code 唯一,幂等)\n`;
for (const p of points) {
  sql += `INSERT INTO public.junior_grammar_points (category_id, code, title, cefr, grade, summary, explanation_md, sort_order, volume, unit)\n`;
  sql += `SELECT (SELECT id FROM public.junior_grammar_categories WHERE code='${p.cat}'), '${esc(p.code)}', '${esc(p.point)}', 'A1', 7, '对应:${esc(p.volume)} ${esc(p.unit)}', '', ${p.sort}, '${esc(p.volume)}', '${esc(p.unit)}'\n`;
  sql += `WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='${esc(p.code)}');\n`;
}
sql += `\n-- 兜底:若点已存在但缺 volume/unit(重跑场景),补齐\n`;
for (const p of points) {
  sql += `UPDATE public.junior_grammar_points SET volume='${esc(p.volume)}', unit='${esc(p.unit)}' WHERE code='${esc(p.code)}' AND (volume IS NULL OR unit IS NULL);\n`;
}

sql += `\n-- C. 插 ${rows.length} 道题(按 point code 挂 point_id;按 point+stem 去重幂等)\n`;
const codeByKey = new Map(points.map(p => [p.key, p.code]));
let qSort = {};
for (const r of rows) {
  const code = codeByKey.get(pkey(r));
  qSort[code] = (qSort[code] || 0) + 1;
  const [a, b, c, d] = r.options;
  const letter = LET[r.answer_index];
  sql += `INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, question_type, difficulty, sort_order, grammar_topic)\n`;
  sql += `SELECT (SELECT id FROM public.junior_grammar_points WHERE code='${esc(code)}'), '${esc(r.stem)}', '${esc(a)}', '${esc(b)}', '${esc(c)}', '${esc(d)}', '${letter}', '${esc(r.explanation)}', 'mcq', 1, ${qSort[code]}, '${esc(code)}'\n`;
  sql += `WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE p.code='${esc(code)}' AND q.stem='${esc(r.stem)}');\n`;
}

const pairs = [...new Set(points.map(p => `('${esc(p.volume)}','${esc(p.unit)}')`))].join(', ');
sql += `\n-- D. count 校验(本批,应:语法点 ${points.length} / 题 ${rows.length})\n`;
sql += `SELECT 'points' AS kind, count(*) FROM public.junior_grammar_points WHERE (volume,unit) IN (${pairs})\n`;
sql += `UNION ALL SELECT 'questions', count(*) FROM public.junior_grammar_questions q JOIN public.junior_grammar_points p ON q.point_id=p.id WHERE (p.volume,p.unit) IN (${pairs});\n`;

writeFileSync(outFile, sql);
console.log(`✅ 生成 ${outFile}`);
console.log(`语法点: ${points.length} (SU1=${points.filter(p => p.unit === 'SU1').length}/SU2=${points.filter(p => p.unit === 'SU2').length}/SU3=${points.filter(p => p.unit === 'SU3').length}) | 题: ${rows.length}`);
console.log(`点列表:`);
for (const p of points) console.log(`  ${p.code} [${p.cat}] ${p.unit} ${p.point}`);
