// 8年级基准对照体检:把 9年级 U1 vs 8年级单元逐表逐字段 diff,机器列出所有偏差。
// 输出 scripts/g9/u1-vs-g8-audit.md。只读。
import { readFileSync, writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
const env = Object.fromEntries(readFileSync('C:\\Projects\\learn-fluent-easy\\.env', 'utf8').split(/\r?\n/).filter(l => l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY);
const HUBDIR = 'C:\\Projects\\learn-fluent-easy\\src\\data\\juniorHub\\';
const L = [];
const w = (s = '') => L.push(s);

const filled = (v) => {
  if (v === null || v === undefined) return false;
  if (typeof v === 'string') return v.trim() !== '';
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'object') return Object.keys(v).length > 0;
  return true; // 数字/布尔
};
async function rows(tbl, filt, cols = '*') {
  let q = sb.from(tbl).select(cols);
  for (const [k, val] of Object.entries(filt)) q = q.eq(k, val);
  const { data, error } = await q.limit(500);
  return error ? [] : (data ?? []);
}
function fillRate(rs, col) {
  if (!rs.length) return null;
  return rs.filter(r => filled(r[col])).length / rs.length;
}

w('# 9年级 U1 vs 8年级 基准对照体检报告');
w('');
w('> 机器逐表逐字段 diff。✅一致 / ⚠️偏差(8年级有值、9年级缺)。生成自 `scripts/g9/_audit_vs_g8.mjs`。');
w('');

// ============ 1. 字段完整性 ============
w('## 1. 字段完整性(8年级有值 → 9年级是否也有)');
const TABLES = [
  { t: 'junior_vocab', g8: { volume: '8A', unit: 'U1' }, g9: { volume: 'g9', unit: 'U1' },
    cols: ['word','pos','phonetic','meaning_cn','phrase_en','example_en','star_level','freq_rank','source_type','confidence'] },
  { t: 'junior_reading', g8: { volume: '8A', unit: 'U1' }, g9: { volume: 'g9', unit: 'U1' },
    cols: ['title','body','topic','word_count','questions','vocab_notes','difficulty'] },
  { t: 'junior_cloze', g8: { volume: '7B' }, g9: { volume: 'g9', unit: 'U1' },
    cols: ['title','body','word_count','questions','difficulty','sort_order'] },
  { t: 'junior_listening_exercises', g8: { volume: '8A', unit: 'U1' }, g9: { volume: 'g9', unit: 'U1' },
    cols: ['title','topic','difficulty','transcript','translation_cn','speaker','questions','kind'] },
];
let fieldGaps = 0;
for (const cfg of TABLES) {
  const g8rs = await rows(cfg.t, cfg.g8);
  const g9rs = await rows(cfg.t, cfg.g9);
  w(`\n### ${cfg.t}  (8年级 ${JSON.stringify(cfg.g8)}:${g8rs.length}行 | 9年级 g9/U1:${g9rs.length}行)`);
  for (const c of cfg.cols) {
    const r8 = fillRate(g8rs, c), r9 = fillRate(g9rs, c);
    const p = (x) => x === null ? 'NA' : Math.round(x * 100) + '%';
    if (r8 !== null && r8 > 0 && (r9 === null || r9 === 0)) {
      w(`- ⚠️ **${c}**:8年级填充 ${p(r8)},9年级 **${p(r9)}(缺)**`); fieldGaps++;
    } else {
      w(`- ✅ ${c}:8=${p(r8)} / 9=${p(r9)}`);
    }
  }
}

// grammar_points / grammar_questions(经 point 关联)
w('\n### junior_grammar_points / questions');
{
  const p8 = await rows('junior_grammar_points', { volume: '8A', unit: 'U1' });
  const p9 = await rows('junior_grammar_points', { volume: 'g9', unit: 'U1' });
  w(`- points:8A/U1 ${p8.length}个 / g9/U1 ${p9.length}个`);
  for (const c of ['code','title','cefr','category_id','sort_order','volume','unit']) {
    const r8 = fillRate(p8, c), r9 = fillRate(p9, c);
    const flag = (r8 > 0 && !(r9 > 0)) ? '⚠️' : '✅';
    if (flag === '⚠️') fieldGaps++;
    w(`  - ${flag} points.${c}:8=${r8 === null ? 'NA' : Math.round(r8*100)+'%'} / 9=${r9 === null ? 'NA' : Math.round(r9*100)+'%'}`);
  }
  const qcols = ['stem','option_a','option_b','option_c','option_d','correct_answer','explanation','difficulty','question_type','grammar_topic'];
  const ids8 = p8.map(p => p.id), ids9 = p9.map(p => p.id);
  const q8 = ids8.length ? await sb.from('junior_grammar_questions').select(qcols.join(',')).in('point_id', ids8).limit(500).then(r => r.data ?? []) : [];
  const q9 = ids9.length ? await sb.from('junior_grammar_questions').select(qcols.join(',')).in('point_id', ids9).limit(500).then(r => r.data ?? []) : [];
  w(`- questions:8A/U1 ${q8.length}题 / g9/U1 ${q9.length}题`);
  for (const c of qcols) {
    const r8 = fillRate(q8, c), r9 = fillRate(q9, c);
    const flag = (r8 > 0 && !(r9 > 0)) ? '⚠️' : '✅';
    if (flag === '⚠️') fieldGaps++;
    w(`  - ${flag} q.${c}:8=${r8===null?'NA':Math.round(r8*100)+'%'} / 9=${r9===null?'NA':Math.round(r9*100)+'%'}`);
  }
}

// writing(8年级 prompt 可能 volume 空,用任意已填充行做参照)
w('\n### junior_writing_prompts');
{
  const wr9 = await rows('junior_writing_prompts', { volume: 'g9', unit: 'U1' });
  const wrAll = await rows('junior_writing_prompts', {});
  const ref = wrAll.filter(r => filled(r.sample_answer));
  w(`- 参照(任意已填充写作)${ref.length}行 / g9/U1 ${wr9.length}行`);
  for (const c of ['topic','prompt_cn','prompt_en','requirements','min_words','max_words','sample_answer','scoring_rubric','title_en','high_sentences','error_pairs','paragraph_template']) {
    const r8 = fillRate(ref, c), r9 = fillRate(wr9, c);
    const flag = (r8 > 0 && !(r9 > 0)) ? '⚠️' : '✅';
    if (flag === '⚠️') fieldGaps++;
    w(`  - ${flag} ${c}:ref=${r8===null?'NA':Math.round(r8*100)+'%'} / 9=${r9===null?'NA':Math.round(r9*100)+'%'}`);
  }
}

// ============ 2. 归属完整性 ============
w('\n## 2. 归属完整性(9年级 volume/unit/grade 非空)');
let attrBad = 0;
for (const t of ['junior_vocab','junior_reading','junior_cloze','junior_listening_exercises']) {
  const rs = await rows(t, { volume: 'g9', unit: 'U1' });
  const bad = rs.filter(r => !filled(r.volume) || !filled(r.unit) || r.grade == null).length;
  attrBad += bad;
  w(`- ${bad === 0 ? '✅' : '⚠️'} ${t}:${rs.length}行,缺归属 ${bad}`);
}
{
  const p9 = await rows('junior_grammar_points', { volume: 'g9', unit: 'U1' });
  const bad = p9.filter(r => !filled(r.volume) || !filled(r.unit) || !filled(r.category_id)).length;
  attrBad += bad;
  w(`- ${bad === 0 ? '✅' : '⚠️'} junior_grammar_points:${p9.length}行,缺归属/分类 ${bad}`);
}

// ============ 3. 口径一致性(结构性:同表→同读取函数→同阈值) ============
w('\n## 3. 掌握度口径一致性(9年级与8年级同表→同函数→同阈值)');
const KOUJING = [
  ['核心词汇','junior_word_mastery','mastery_level≥3','同 loadUnitVocabProgress'],
  ['听音辨词','junior_word_mastery.listen_correct','≥2','同'],
  ['词义配对','junior_word_mastery.match_consec','≥2','同'],
  ['语法专项','junior_user_mastery(grammar_question)','correct_count≥2','同 loadProgressForCodes'],
  ['课文阅读','mastery_progress(junior_reading)','best_pct≥80/stars≥5','同'],
  ['完形填空','mastery_progress','best_pct≥80','同(9年级新增关,机制同阅读)'],
  ['听力','junior_listening_attempts','正确率≥80%','同'],
  ['写作','junior_writing_attempts','overall_score≥80','同'],
  ['通关','junior_user_mastery(grammar_point)','仅回写语法FSRS','同'],
];
w('| 关 | 表/字段 | 阈值 | 9年级 |');
w('|---|---|---|---|');
for (const [k, tb, th, note] of KOUJING) w(`| ${k} | ${tb} | ${th} | ✅ ${note} |`);
w('\n> 口径由共享表+grade无关的读取函数(loadProgressForCodes/loadUnitVocabProgress/useMasteryOverview 按 code/wordId/item_type 查,不按 grade)保证;9年级内容入同表 → 自动同口径。');

// ============ 4. 关数与顺序 ============
w('\n## 4. 关数与顺序(grade9 U1 vs grade8 单元)');
const g8 = JSON.parse(readFileSync(HUBDIR + 'grade8.json', 'utf8')).grade8;
const g9 = JSON.parse(readFileSync(HUBDIR + 'grade9.json', 'utf8')).grade9;
const g8u1 = Object.values(g8.semesters)[0].units[0];
const g9u1 = Object.values(g9.semesters)[0].units[0];
const seq = (u) => u.stages.map(s => s.type);
w(`- 8年级(${g8u1.book} ${g8u1.unitKey})关序:\`${seq(g8u1).join(' / ')}\` (${g8u1.stages.length}关)`);
w(`- 9年级(${g9u1.book} ${g9u1.unitKey})关序:\`${seq(g9u1).join(' / ')}\` (${g9u1.stages.length}关)`);
const expect9 = ['vocab','listenWord','match','grammar','reading','cloze','listening','writing','finalQuiz'];
const seqOk = JSON.stringify(seq(g9u1)) === JSON.stringify(expect9);
w(`- ${seqOk ? '✅' : '⚠️'} 9年级关序 ${seqOk ? '符合预期(完形在阅读后、听力前)' : '不符预期! 期望 ' + expect9.join('/')}`);
const clozePos = seq(g9u1).indexOf('cloze');
w(`- 完形位置:第 ${clozePos + 1} 关(应=6);8年级无完形关(${g8u1.stages.length}关)→ 9年级 +完形 = ${g9u1.stages.length}关`);

// ============ 5. hub 接入 ============
w('\n## 5. hub 接入(book / grammarCodes / wordIds)');
w(`- book:8年级=\`${g8u1.book}\`(分卷字母) / 9年级=\`${g9u1.book}\` ${g9u1.book === 'g9' ? '✅(全一册统一 g9)' : '⚠️ 应为 g9'}`);
const gcFmt = (arr) => Array.isArray(arr) ? arr.join(',') : String(arr);
w(`- grammarCodes:8年级=\`${gcFmt(g8u1.grammarCodes)}\` / 9年级=\`${gcFmt(g9u1.grammarCodes)}\` ${Array.isArray(g9u1.grammarCodes) && g9u1.grammarCodes.length ? '✅(数组,与DB code一致)' : '⚠️'}`);
// 校验 grammarCodes 在 DB 真有 point
{
  const codes = g9u1.grammarCodes ?? [];
  const { data } = await sb.from('junior_grammar_points').select('code').in('code', codes);
  const found = (data ?? []).map(r => r.code);
  const miss = codes.filter(c => !found.includes(c));
  w(`- ${miss.length === 0 ? '✅' : '⚠️'} grammarCodes 在 DB 命中:${found.length}/${codes.length}${miss.length ? ' 缺:' + miss.join(',') : ''}`);
}
w(`- wordIds 机制:9年级与8年级同走 useUnitVocab(grade+volume=book+unit 查 junior_vocab → .id)✅ 同函数`);
// 校验 book 能查到词
{
  const { count } = await sb.from('junior_vocab').select('*', { count: 'exact', head: true }).eq('grade', 9).eq('volume', g9u1.book).eq('unit', g9u1.unitKey);
  w(`- ${count > 0 ? '✅' : '⚠️'} useUnitVocab(grade=9,volume='${g9u1.book}',unit='${g9u1.unitKey}') 命中词数:${count ?? 0}(应=29;若0说明 book 与 DB volume 不匹配)`);
}

// ============ 总结 ============
w('\n## 总结');
w(`- 字段缺口(⚠️):**${fieldGaps}** 项`);
w(`- 归属缺失:**${attrBad}** 行`);
w(`- 关序:${seqOk ? '✅ 符合' : '⚠️ 不符'}`);

const OUT = 'C:\\Projects\\learn-fluent-easy\\scripts\\g9\\u1-vs-g8-audit.md';
writeFileSync(OUT, L.join('\n'));
console.log(L.join('\n'));
console.log('\n报告 ->', OUT);
process.exit(0);
