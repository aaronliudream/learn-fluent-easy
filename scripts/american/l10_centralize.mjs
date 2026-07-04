/**
 * ⑤ 关10 丰富化 · 集中处理:读 12 个 l10_out_U*.json → 校验 → 打散选项(修位置偏差)→
 * 生成 12 个 per-unit SQL(SQLAA/american_stage10_enrich_unitNN.sql)+ audio 清单 + flag 汇总。
 * 只生成文件,不碰库、不联网。
 */
import { readFileSync, writeFileSync } from 'node:fs';

const SCRATCH = 'C:/Users/willi/AppData/Local/Temp/claude/C--Projects-learn-fluent-easy/dce5bb16-1d15-4c48-a6cb-7dba17192a75/scratchpad';
const SQLAA = 'C:/Projects/learn-fluent-easy/SQLAA';

// 说话人标签清洗(与 speak.ts / ttsClean 同口径),用于 audio 清单预热核对
const SPEAKER_LABEL = /(^|[\r\n]+|[.?!]["'’)\]]?[ \t]+|\b\d{1,2}\.[ \t]+)([A-Z][a-zA-Z]{0,5}):[ \t]+(?=["'“‘A-Z])/g;
const cleanForTTS = (t) => (!t ? t : String(t).replace(SPEAKER_LABEL, '$1').replace(SPEAKER_LABEL, '$1'));

// 每题一个确定性 LCG,种子来自 lesson+题序,保证可重跑生成同样 SQL
function lcg(seedStr) {
  let s = 0;
  for (let i = 0; i < seedStr.length; i++) s = (s * 31 + seedStr.charCodeAt(i)) >>> 0;
  return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
}
function shuffleOptions(options, answerIndex, seedStr) {
  const rnd = lcg(seedStr);
  const correct = options[answerIndex];
  const arr = options.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return { options: arr, answer_index: arr.indexOf(correct) };
}

const esc = (s) => String(s).replace(/'/g, "''");
const lessonNum = (id) => Number(id.replace('am1_l', ''));
const unitOf = (id) => Math.ceil(lessonNum(id) / 6);
const pad2 = (n) => String(n).padStart(2, '0');

const errors = [], flags = [], audioSet = new Set();
const posDist = [0, 0, 0, 0];
let totalQ = 0, totalLessons = 0;

// 收集所有单元数据
const units = {}; // unitNo -> [lessonObj...]
for (let u = 1; u <= 12; u++) {
  let raw;
  try { raw = JSON.parse(readFileSync(`${SCRATCH}/l10_out_U${u}.json`, 'utf8')); }
  catch (e) { errors.push(`U${u} 读取/解析失败: ${e.message}`); continue; }
  for (const les of raw) {
    const uno = unitOf(les.lesson);
    (units[uno] ||= []).push(les);
  }
}

function validateLesson(les) {
  const L = les.lesson;
  const keep = les.keepSeqs || [], del = les.deleteSeqs || [];
  // keep∪del 应=现有全集(1..10 的子集),keep 与 del 不重叠
  const overlap = keep.filter((s) => del.includes(s));
  if (overlap.length) errors.push(`${L}: keepSeqs 与 deleteSeqs 重叠 ${overlap}`);
  if (keep.length < 3 || keep.length > 4) errors.push(`${L}: keepSeqs 数=${keep.length}(应3-4)`);
  const nq = les.newQuestions || [];
  const cnt = { vocab: 0, scenario: 0, reading: 0, listening: 0 };
  nq.forEach((q, i) => {
    cnt[q.type] = (cnt[q.type] || 0) + 1;
    const tag = `${L}#${i}(${q.type})`;
    if (!q.stem || !q.stem.trim()) errors.push(`${tag}: 空 stem`);
    if (!Array.isArray(q.options) || q.options.length !== 4) errors.push(`${tag}: options 非4个`);
    if (new Set(q.options).size !== q.options.length) errors.push(`${tag}: 选项有重复`);
    if (typeof q.answer_index !== 'number' || q.answer_index < 0 || q.answer_index > 3) errors.push(`${tag}: answer_index 越界`);
    if (!q.explanation_cn || !q.explanation_cn.trim()) errors.push(`${tag}: 空 explanation_cn`);
    if (q.type === 'reading' && (!q.passage || !q.passage.trim())) errors.push(`${tag}: reading 缺 passage`);
    if (q.type === 'listening' && (!q.audio || !q.audio.trim())) errors.push(`${tag}: listening 缺 audio`);
    if (q.flag) flags.push(`${tag}: ${q.flag}`);
  });
  // 构成检查:词义2/情景约2/阅读2-3/听力(short1-2 / long2-3)
  const tier = les.listeningTier;
  const warnBits = [];
  if (cnt.vocab !== 2) warnBits.push(`词义${cnt.vocab}`);
  if (cnt.scenario < 1 || cnt.scenario > 2) warnBits.push(`情景${cnt.scenario}`);
  if (cnt.reading < 2 || cnt.reading > 3) warnBits.push(`阅读${cnt.reading}`);
  if (tier === 'long' && (cnt.listening < 2 || cnt.listening > 3)) warnBits.push(`听力${cnt.listening}`);
  if (tier === 'short' && (cnt.listening < 1 || cnt.listening > 2)) warnBits.push(`听力${cnt.listening}`);
  return { cnt, tier, keep, del, warnBits };
}

// 生成每单元 SQL
const summary = [];
for (let u = 1; u <= 12; u++) {
  const lessons = (units[u] || []).sort((a, b) => lessonNum(a.lesson) - lessonNum(b.lesson));
  if (!lessons.length) { errors.push(`单元${u} 无课`); continue; }
  let sql = `-- american_stage10_enrich_unit${pad2(u)}.sql\n`;
  sql += `-- ⑤ 关10 丰富化 · 单元${u}(${lessons.map(l => l.lesson.replace('am1_l', 'L')).join('/')})。单调复用题 → 五题型综合检验。\n`;
  sql += `-- 每课:删旧关10冗余(deleteSeqs)+ 上轮增量(seq>=21),再插新五题型(seq 21+);保留的句型题(keepSeqs≤10)不动。\n`;
  sql += `-- 幂等可重跑;词义/情景/阅读(带passage)/听力(带audio)全本课取材,选项已打散答案位置。\n`;
  sql += `BEGIN;\n\n`;

  for (const les of lessons) {
    const v = validateLesson(les);
    totalLessons++;
    const L = les.lesson;
    summary.push(`  ${L}: 留${v.keep.length}/删${v.del.length}/新${les.newQuestions.length}(词${v.cnt.vocab}情${v.cnt.scenario}读${v.cnt.reading}听${v.cnt.listening}) tier=${v.tier}${v.warnBits.length ? ' ⚠ ' + v.warnBits.join(',') : ''}`);
    sql += `-- ═══ ${L}  留[${v.keep.join(',')}] 删[${v.del.join(',')}] 新增${les.newQuestions.length}(词${v.cnt.vocab}/情${v.cnt.scenario}/读${v.cnt.reading}/听${v.cnt.listening}) ═══\n`;
    const delList = [...new Set(v.del)].sort((a, b) => a - b);
    sql += `DELETE FROM american_questions WHERE lesson_id='${L}' AND stage=10 AND (seq IN (${delList.join(',')}) OR seq>=21);\n`;
    sql += `INSERT INTO american_questions (lesson_id, stage, grammar_point_id, qtype, payload, seq) VALUES\n`;
    const rows = les.newQuestions.map((q, i) => {
      const sh = shuffleOptions(q.options, q.answer_index, `${L}|${i}|${q.stem}`);
      posDist[sh.answer_index]++; totalQ++;
      const payload = { stem: q.stem, options: sh.options, answer_index: sh.answer_index, explanation_cn: q.explanation_cn };
      if (q.type === 'reading') payload.passage = q.passage;
      if (q.type === 'listening') { payload.audio = q.audio; audioSet.add(q.audio); }
      const j = JSON.stringify(payload);
      return `('${L}',10,NULL,'choice','${esc(j)}'::jsonb,${21 + i})`;
    });
    sql += rows.join(',\n') + ';\n\n';
  }

  const ids = lessons.map(l => `'${l.lesson}'`).join(',');
  sql += `-- ═══ 校验:每课关10题数 + 听力/阅读带载 ═══\n`;
  sql += `SELECT lesson_id, count(*) AS 关10题数,\n`;
  sql += `       count(*) FILTER (WHERE (payload->>'audio') IS NOT NULL) AS 听力,\n`;
  sql += `       count(*) FILTER (WHERE (payload->>'passage') IS NOT NULL) AS 阅读带课文\n`;
  sql += `FROM american_questions WHERE lesson_id IN (${ids}) AND stage=10 GROUP BY lesson_id ORDER BY lesson_id;\n\n`;
  sql += `COMMIT;\n`;

  writeFileSync(`${SQLAA}/american_stage10_enrich_unit${pad2(u)}.sql`, sql);
}

// audio 清单(去重,写预热用)
const audios = [...audioSet];
writeFileSync(`${SCRATCH}/l10_audio_manifest.json`, JSON.stringify(audios, null, 1));

// 报告
console.log('=== ⑤ 关10 批量集中 · 自检 ===');
console.log(`单元 SQL: 12 个已写入 SQLAA/american_stage10_enrich_unit01..12.sql`);
console.log(`课数: ${totalLessons} | 新题总数: ${totalQ} | 去重 audio: ${audios.length}`);
console.log(`答案位置分布(打散后) A/B/C/D: ${posDist.join(' / ')}`);
console.log('\n--- 每课构成 ---');
console.log(summary.join('\n'));
console.log(`\n--- 错误(${errors.length}) ---`);
console.log(errors.length ? errors.join('\n') : '(无)');
console.log(`\n--- flag 待裁决(${flags.length}) ---`);
console.log(flags.length ? flags.join('\n') : '(无)');
