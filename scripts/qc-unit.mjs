/**
 * 单元质检脚本（灌库前必跑）。依据 docs/单元质检标准.md。
 * 用法: node scripts/qc-unit.mjs --dir scripts/senior-rebuild/required1-u1 --vol required1 --unit U1 [--grade 10]
 * 期望该 dir 下 6 个源文件 + finalReading:
 *   <vol>-<unit>-vocab.json {words:[{word,ipa,pos,meaning_cn,example_en,example_cn,phrase_en}]}
 *   <vol>-<unit>-grammar.json {questions:[{code,stem,options[4],answer_index,explanation}]}
 *   <vol>-<unit>-reading.json {passages:[{code,title,body,questions:[{stem,options[4],answer_index,explanation}]}]}
 *   <vol>-<unit>-cloze.json {passages:[{code,title,text,questions:[{blank,options[4],answer_index,explanation}]}]}
 *   <vol>-<unit>-listening.json {exercises:[{code,title,kind,transcript[],translation_cn,questions:[{stem,options[4],answer_index}]}]}
 *   <vol>-<unit>-writing.json {topic,prompt_cn,prompt_en,model_essay|sample_answer}
 *   <vol>-<unit>-finalreading.json {finalReading:{passage,questions:[{q,options[4],answer,explanation}]}}
 * 输出: 控制台报告 + 退出码(0=全过,1=有硬卡FAIL) + REVIEWAA/<vol>-<unit>/_语义复核清单.md
 */
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const arg = k => { const i = process.argv.indexOf('--' + k); return i >= 0 ? process.argv[i + 1] : null; };
const DIR = arg('dir'), VOL = arg('vol'), UNIT = arg('unit'), GRADE = Number(arg('grade') || 10);
if (!DIR || !VOL || !UNIT) { console.error('需要 --dir --vol --unit'); process.exit(2); }
const L = ['A', 'B', 'C', 'D'];
const load = name => { const p = `${DIR}/${VOL.toLowerCase()}-${UNIT.toLowerCase()}-${name}.json`; return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null; };

const FAILS = [], WARNS = [];
const fail = (code, msg) => FAILS.push(`[${code}] ${msg}`);
const warn = (code, msg) => WARNS.push(`[${code}] ${msg}`);
const ansIdx = (a, opts) => { if (typeof a === 'number') return a; const i = L.indexOf(String(a ?? '').trim().toUpperCase()); if (i >= 0) return i; return opts.findIndex(o => String(o).trim() === String(a).trim()); };
const distOf = idxs => { const c = [0, 0, 0, 0]; idxs.forEach(i => { if (i >= 0 && i < 4) c[i]++; }); return c; };
const wc = s => String(s).split(/\s+/).filter(Boolean).length;

// ── 通用题级检查(0.4/0.5/越界) + 分布(1.1/1.2) ──
function checkQuestions(tag, qs, getOpts, getAns, getStem) {
  const idxs = [];
  qs.forEach((q, i) => {
    const opts = getOpts(q), ai = ansIdx(getAns(q), opts);
    if (opts.length !== 4) fail('0.2', `${tag} #${i + 1} 选项数=${opts.length}(应4)`);
    if (new Set(opts.map(o => String(o).trim().toLowerCase())).size !== opts.length) fail('0.5', `${tag} #${i + 1} 选项重复: ${opts.join(' / ')}`);
    if (ai < 0 || ai >= opts.length) fail('0.4', `${tag} #${i + 1} 答案越界/不在选项`);
    else idxs.push(ai);
    if (opts.some(o => o == null || String(o).trim() === '')) fail('0.2', `${tag} #${i + 1} 空选项`);
  });
  // 1.1 分布均匀
  const c = distOf(idxs), n = idxs.length;
  if (n >= 8) { const max = Math.max(...c); if (c.some(x => x === 0) || max / n > 0.4) fail('1.1', `${tag} 答案分布偏斜 ${c.map((x, i) => L[i] + ':' + x).join(' ')}`); }
  // 1.2 无长串同位(连续≥4同位才算异常长串;3连是均匀洗牌的正常概率现象,不拦)
  let run = 1; for (let i = 1; i < idxs.length; i++) { if (idxs[i] === idxs[i - 1]) { run++; if (run >= 4) { fail('1.2', `${tag} 第${i - 2}~${i + 1}题连续同位 ${L[idxs[i]]}(≥4连)`); break; } } else run = 1; }
  return idxs;
}

// ── 占位垃圾(0.3) ──
const isGarbage = s => /([a-z])\1{3,}/i.test(String(s)) || /^[A-Z]{5,}$/.test(String(s).trim());

// ── 照抄检测(3.3/8.4):答案是正文 ≥5 词连续子串 ──
function isCopied(answer, body, N = 5) {
  const a = String(answer).toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
  if (a.length < N) return false;
  const b = ' ' + String(body).toLowerCase().replace(/[^\w\s]/g, '') + ' ';
  for (let i = 0; i + N <= a.length; i++) if (b.includes(' ' + a.slice(i, i + N).join(' ') + ' ')) return true;
  return false;
}
// ── 文本相似(7.1/7.2):词集合 Jaccard ──
const tokset = s => new Set(String(s).toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2));
function jaccard(a, b) { const A = tokset(a), B = tokset(b); let inter = 0; A.forEach(w => { if (B.has(w)) inter++; }); return inter / (A.size + B.size - inter || 1); }

const vocab = load('vocab'), grammar = load('grammar'), reading = load('reading'), cloze = load('cloze'), listening = load('listening'), writing = load('writing'), frFile = load('finalreading');
const finalReading = frFile?.finalReading;

// ===== 0/题量 =====
if (!vocab?.words?.length) fail('0.2', 'vocab 缺失/空');
if ((grammar?.questions?.length || 0) !== 60) fail('7', `语法题数=${grammar?.questions?.length || 0}(应60)`);
if ((reading?.passages?.length || 0) !== 6) fail('7', `阅读篇数=${reading?.passages?.length || 0}(应6)`);
if ((cloze?.passages?.length || 0) !== 6) fail('7', `完形篇数=${cloze?.passages?.length || 0}(应6)`);
if ((listening?.exercises?.length || 0) !== 6) fail('7', `听力篇数=${listening?.exercises?.length || 0}(应6)`);
if (!writing) fail('7', '写作缺失');

// ===== 2 语法 =====
if (grammar?.questions) {
  const qs = grammar.questions;
  checkQuestions('语法', qs, q => q.options, q => q.answer_index ?? q.answer);
  const byCode = {};
  qs.forEach(q => {
    byCode[q.code] = (byCode[q.code] || 0) + 1;
    const s = q.stem || '';
    if (/^选出/.test(s)) fail('2.1', `语法残留"选出"前缀: ${s.slice(0, 30)}`);
    if (q.options.some(o => /[一-鿿]/.test(String(o)))) fail('2.2', `语法术语题(中文选项): ${s.slice(0, 30)}`);
    if (/下列哪一?项是.*短语|下列哪一?项不是.*短语|作____/.test(s)) fail('2.2', `语法术语题: ${s.slice(0, 30)}`);
    if (!/____|＿/.test(s) && !/判断句子结构|下列哪一?句/.test(s)) fail('2.3', `语法非应用型(无填空/非判断句): ${s.slice(0, 30)}`);
  });
  Object.entries(byCode).forEach(([c, n]) => { if (n !== 20) fail('2.4', `语法点 ${c} 题数=${n}(应20)`); });
  // 2.5 搭配/答案词重复>2
  const ac = {}; qs.forEach(q => { const a = String(q.options[ansIdx(q.answer_index ?? q.answer, q.options)] || '').toLowerCase(); ac[a] = (ac[a] || 0) + 1; });
  // 2.5 豁免:答案是固定语法形式(时态/助动词/情态)的题——重复是设计使然,只对实义搭配词查重复。
  const TENSE = /\b(will|won'?t|wo|going to|am|is|are|was|were|be|been|being|do|does|did|have|has|had|shall|should|would|could|may|might|must)\b/;
  // 反意疑问句答语逻辑(Yes/No 等)是固定答案,重复是设计使然,同样豁免。
  const TAGREPLY = /^(yes|no|sure|never|not|of course)$/;
  // 定语从句关系代词/关系副词(that/which/who/whom/whose/when/where/why)是固定语法形式答案,重复是设计使然,豁免。
  const RELWORD = /^(that|which|who|whom|whose|when|where|why)$/;
  Object.entries(ac).forEach(([a, n]) => { if (n > 2 && !TENSE.test(a) && !TAGREPLY.test(a) && !RELWORD.test(a)) warn('2.5', `答案"${a}"在语法关出现${n}次(>2)`); });
}

// ===== 3 阅读 =====
const readingBodies = [];
if (reading?.passages) {
  const allQ = [];
  reading.passages.forEach(p => {
    readingBodies.push(p.body || '');
    const w = wc(p.body); if (w < 120 || w > 210) fail('3.1', `阅读 ${p.code || p.title} 字数 ${w}(目标120-210)`);
    (p.questions || []).forEach((q, i) => {
      allQ.push(q);
      const ai = ansIdx(q.answer_index ?? q.answer, q.options); const ans = q.options[ai];
      if (isCopied(ans, p.body)) fail('3.3', `阅读 ${p.code} 第${i + 1}题答案照抄正文: "${String(ans).slice(0, 40)}"`);
      const bodyTok = tokset(p.body);
      // 3.4 放宽:单个干扰项不含正文词是正常(合理迷惑错项常用不同措辞);只标记"整题全部干扰项都与正文无词重合"的极端(疑似整题脱离文本)。
      let zeroD = 0, totD = 0;
      q.options.forEach((o, k) => { if (k !== ai) { totD++; const ot = tokset(o); let hit = 0; ot.forEach(w => { if (bodyTok.has(w)) hit++; }); if (!ot.size || hit === 0) zeroD++; } });
      if (totD > 0 && zeroD === totD) warn('3.4', `阅读 ${p.code} 第${i + 1}题全部干扰项都与正文无词重合(疑似整题脱离文本)`);
    });
  });
  checkQuestions('阅读', allQ, q => q.options, q => q.answer_index ?? q.answer);
}

// ===== 4 完形 =====
const clozeBodies = [];
if (cloze?.passages) {
  const allB = [];
  cloze.passages.forEach(p => { clozeBodies.push(p.text || p.body || ''); (p.questions || []).forEach(q => allB.push(q)); });
  checkQuestions('完形', allB, q => q.options, q => q.answer_index ?? q.answer);
  if (allB.length !== 60) fail('4.1', `完形空数=${allB.length}(应60)`);
}

// ===== 5 听力 =====
const listenBodies = [];
if (listening?.exercises) {
  const allQ = [];
  listening.exercises.forEach(e => {
    listenBodies.push(Array.isArray(e.transcript) ? e.transcript.join(' ') : (e.transcript || ''));
    if (!e.translation_cn) fail('5.1', `听力 ${e.title} 缺 translation_cn`);
    if (!(Array.isArray(e.transcript) ? e.transcript.length : e.transcript)) fail('5.1', `听力 ${e.title} 缺 transcript`);
    (e.questions || []).forEach(q => allQ.push(q));
  });
  checkQuestions('听力', allQ, q => q.options, q => q.answer_index ?? q.answer);
  if (allQ.length !== 30) fail('5.1', `听力题数=${allQ.length}(应30)`);
}

// ===== 7 跨关去重 =====
const groups = [['阅读', readingBodies], ['完形', clozeBodies], ['听力', listenBodies]];
for (let a = 0; a < groups.length; a++) for (let b = a + 1; b < groups.length; b++)
  groups[a][1].forEach((x, i) => groups[b][1].forEach((y, j) => { if (jaccard(x, y) > 0.6) fail('7.1', `${groups[a][0]}#${i + 1} 与 ${groups[b][0]}#${j + 1} 文章重复(jaccard>0.6)`); }));

// ===== 6 词汇 =====
let whitelist = new Set();
async function buildWhitelist() {
  // ① junior_vocab 全表(初中+已灌senior)
  try {
    const env = Object.fromEntries(readFileSync('.env', 'utf8').split(/\r?\n/).filter(l => l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
    const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY);
    for (let off = 0; ; off += 1000) { const { data } = await sb.from('junior_vocab').select('word').range(off, off + 999); if (!data?.length) break; data.forEach(r => whitelist.add(String(r.word).toLowerCase())); if (data.length < 1000) break; }
  } catch (e) { warn('6.5', 'junior_vocab 拉取失败,白名单不含已学词: ' + e.message); }
  // ② 小学 primary 全词表
  for (const g of [3, 4, 5, 6]) { try { const j = JSON.parse(readFileSync(`src/data/primaryHub/grade${g}.json`, 'utf8')); (function w(o) { if (Array.isArray(o)) o.forEach(w); else if (o && typeof o == 'object') { if (o.vocabulary) o.vocabulary.forEach(v => v.en && whitelist.add(String(v.en).toLowerCase())); for (const k in o) if (o[k] && typeof o[k] == 'object') w(o[k]); } })(j); } catch { } }
  // ③ 本单元词
  (vocab?.words || []).forEach(v => whitelist.add(String(v.word).toLowerCase()));
  // ④ 基础功能词(硬编码 + 可选 function_basewords.txt)
  'a an the be is am are was were been being do does did have has had will would can could shall should may might must of in on at to for from by with about into over under and but or so because if when while as than then this that these those i you he she it we they me him her them my your his their our its not no yes very more most some any all each every here there what which who how why where good day time school student teacher class people friend new like go get make take see know think want come use find give tell ask work look first last next year week today'.split(/\s+/).forEach(w => whitelist.add(w));
  try { readFileSync('scripts/function_basewords.txt', 'utf8').split(/\s+/).forEach(w => w && whitelist.add(w.toLowerCase())); } catch { }
}
function lemmaIn(word) {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return true;
  if (whitelist.has(w)) return true;
  for (const suf of ['s', 'es', 'ed', 'ing', 'er', 'est', 'd', 'ly', 'ies']) if (w.endsWith(suf) && whitelist.has(w.slice(0, -suf.length))) return true;
  if (w.endsWith('ies') && whitelist.has(w.slice(0, -3) + 'y')) return true;
  if (w.endsWith('ing') && whitelist.has(w.slice(0, -3) + 'e')) return true;
  return false;
}

// ===== 8 finalReading =====
function checkFinalReading() {
  if (!finalReading?.passage) { fail('8.1', 'finalReading 缺失'); return; }
  const sents = String(finalReading.passage).split(/[.!?]+/).filter(s => s.trim()).length;
  if (sents < 2 || sents > 4) fail('8.2', `finalReading 短文 ${sents} 句(应2-4)`);
  const qs = finalReading.questions || [];
  if (qs.length < 2) fail('8.3', `finalReading 题数=${qs.length}(应≥2)`);
  qs.forEach((q, i) => {
    const opts = q.options || []; const ai = ansIdx(q.answer, opts);
    if (opts.length !== 4) fail('8.4', `finalReading 第${i + 1}题选项数≠4`);
    if (new Set(opts.map(o => String(o).toLowerCase())).size !== opts.length) fail('8.4', `finalReading 第${i + 1}题选项重复`);
    if (ai < 0 || ai >= opts.length) fail('8.4', `finalReading 第${i + 1}题答案越界`);
    else if (isCopied(opts[ai], finalReading.passage)) fail('8.4', `finalReading 第${i + 1}题答案照抄短文`);
  });
  // 8.5 不撞阅读关
  readingBodies.forEach((b, i) => { if (jaccard(b, finalReading.passage) > 0.6) fail('8.5', `finalReading 短文与阅读关#${i + 1}重复`); });
}

// ===== 字段/占位/词汇/超纲 =====
function checkVocabAndFields() {
  const seen = new Set();
  (vocab?.words || []).forEach((v, i) => {
    if (seen.has(v.word.toLowerCase())) fail('6.1', `vocab 重复词 ${v.word}`); seen.add(v.word.toLowerCase());
    if (!v.ipa || !/\/.*\//.test(v.ipa)) fail('6.2', `vocab ${v.word} IPA 格式可疑: ${v.ipa}`);
    if (!v.meaning_cn) fail('6.4', `vocab ${v.word} 缺中文释义`);
    if (!v.example_en || !v.example_cn) fail('6.4', `vocab ${v.word} 缺例句`);
    else { const stem = v.word.toLowerCase().split(/[\s/]/)[0].replace(/[^a-z]/g, '').slice(0, 4); if (stem && !v.example_en.toLowerCase().includes(stem) && !(v.phrase_en && v.example_en.toLowerCase().includes(v.phrase_en.toLowerCase().split(' ')[0]))) warn('6.3', `vocab ${v.word} 例句疑似不含目标词: ${v.example_en}`); }
    if (!v.phrase_en) warn('0.2', `vocab ${v.word} 缺 phrase_en`);
  });
  // 占位垃圾
  (vocab?.words || []).forEach(v => { if (isGarbage(v.word)) fail('0.3', `vocab 占位垃圾词: ${v.word}`); });
  // 6.5 超纲:扫所有英文文本
  const texts = [];
  (vocab?.words || []).forEach(v => { texts.push(v.example_en || ''); });
  (reading?.passages || []).forEach(p => { texts.push(p.body || ''); (p.questions || []).forEach(q => { texts.push(q.stem || ''); (q.options || []).forEach(o => texts.push(o)); }); });
  (finalReading?.questions || []).forEach(q => { texts.push(finalReading.passage); texts.push(q.q || ''); (q.options || []).forEach(o => texts.push(o)); });
  const oov = new Set();
  texts.forEach(t => String(t).split(/\s+/).forEach(tok => { const w = tok.replace(/[^A-Za-z'-]/g, ''); if (w.length > 2 && /^[A-Za-z]/.test(w) && !lemmaIn(w) && !/^[A-Z]/.test(tok)) oov.add(w.toLowerCase()); }));
  if (oov.size) warn('6.5', `疑似超纲词(${oov.size}): ${[...oov].slice(0, 40).join(', ')}`);
}

// ===== 语义复核清单(喂LLM,不预筛) =====
function writeSemanticChecklist() {
  const outDir = `REVIEWAA/${arg('outlabel') || `${VOL}-${UNIT}`}`; mkdirSync(outDir, { recursive: true });
  let md = `# ${VOL}-${UNIT} 语义复核清单(喂网页版 Claude · 脚本看不出的语义层)\n\n`;
  md += `> 语法全60题 + 完形全60空 + 阅读全24题 + finalReading 全部**逐题全列、不预筛**(双解/语义对应/句子地道性只能人/LLM逐题看)。\n\n`;
  md += `## 语法(全60题,查【句子地道·本单元语法点自然成立】+ 答案唯一,见质检标准 §2.*铁律)\n`;
  (grammar?.points || []).forEach(p => {
    md += `\n### ${p.code} ${p.point}\n`;
    (grammar.questions || []).filter(q => q.code === p.code).forEach(q => {
      const ai = ansIdx(q.answer_index ?? q.answer, q.options);
      md += `- ${q.stem}\n  ${q.options.map((o, i) => (i === ai ? `**${o}✓**` : o)).join(' / ')}\n  考点:${p.point} ｜ 解析:${q.explanation || ''}\n`;
    });
  });
  md += `\n## 完形(全60空,查双解/同词性/通顺)\n`;
  (cloze?.passages || []).forEach(p => { md += `\n### ${p.code || p.title}\n`; (p.questions || []).forEach(q => { const ai = ansIdx(q.answer_index ?? q.answer, q.options); md += `- 空${q.blank ?? ''}: ${q.options.map((o, i) => (i === ai ? `**${o}✓**` : o)).join(' / ')}\n`; }); });
  md += `\n## 阅读(全24题,查双解/答案唯一/转述质量)\n`;
  (reading?.passages || []).forEach(p => { md += `\n### ${p.code || p.title}\n> ${(p.body || '').slice(0, 200)}…\n`; (p.questions || []).forEach(q => { const ai = ansIdx(q.answer_index ?? q.answer, q.options); md += `- ${q.stem}\n  ${q.options.map((o, i) => (i === ai ? `**${o}✓**` : o)).join(' / ')}\n`; }); });
  md += `\n## finalReading(查转述质量/干扰迷惑性)\n> ${finalReading?.passage || '(缺)'}\n`;
  (finalReading?.questions || []).forEach(q => { const ai = ansIdx(q.answer, q.options); md += `- ${q.q}\n  ${q.options.map((o, i) => (i === ai ? `**${o}✓**` : o)).join(' / ')}\n`; });
  if (WARNS.length) md += `\n## 脚本标记的可疑项(复核)\n` + WARNS.map(w => '- ' + w).join('\n') + '\n';
  writeFileSync(`${outDir}/_语义复核清单.md`, md);
  return `${outDir}/_语义复核清单.md`;
}

// ===== 跑 =====
await buildWhitelist();
checkVocabAndFields();
checkFinalReading();
const checklistPath = writeSemanticChecklist();

console.log(`\n========== 质检报告 ${VOL}-${UNIT} ==========`);
console.log(`硬卡 FAIL: ${FAILS.length}`); FAILS.forEach(f => console.log('  ❌ ' + f));
console.log(`标记复核 WARN: ${WARNS.length}`); WARNS.slice(0, 30).forEach(w => console.log('  ⚠️  ' + w));
console.log(`\n语义复核清单 → ${checklistPath}`);
console.log(FAILS.length === 0 ? '\n✅ 硬卡全过 → 可生成灌库 SQL' : `\n🚫 有 ${FAILS.length} 项硬卡 FAIL → 禁止入库`);
process.exit(FAILS.length === 0 ? 0 : 1);
