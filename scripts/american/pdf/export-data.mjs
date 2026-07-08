// 课本 PDF 数据导出(本地 JSON 源,零 DB 依赖)。
// 用法: node scripts/american/pdf/export-data.mjs <book> [unit|all]   例: node ... 2 all
// 读 docs/american/book<N>/am<N>_l*.json(+ *_explanations_final.md)→ scripts/american/pdf/data/book<N>/unitNN.json
// 输出 shape 与旧 DB 导出一致(供 build-book.mjs 消费):
//   { unit_no, lessons:[ {lesson字段, prelisten_question, sentences, words, grammar_points(body_md=null),
//                          contrast(含语块卡 uk=''), questions(关5打散 + 关7填空)} ] }
// 选项打散口径与 gen-book<N>-seed.mjs 完全一致(mulberry32 + placeQuota,options[0]=正确项),
// 保证 PDF 与线上题库同源(净化后健康版本;内容取本地全本,不受 SQL 是否跑齐影响)。
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const book = Number(process.argv[2] || "0");
if (![2, 3, 4].includes(book)) { console.error("用法: export-data.mjs <2|3|4> [unit|all]"); process.exit(1); }
const arg = process.argv[3] || "all";

const SRCDIR = path.join(ROOT, `docs/american/book${book}`);
const OUTDIR = path.join(ROOT, `scripts/american/pdf/data/book${book}`);
fs.mkdirSync(OUTDIR, { recursive: true });

// ---------- 确定性 PRNG + 打散(照抄 gen-book<N>-seed.mjs,口径一致)----------
let _s = 0x9e3779b9;
function rand() {
  _s |= 0; _s = (_s + 0x6d2b79f5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
function assignAnswerPositions(M, P, attempts = 400) {
  const cap = Math.floor(M / 2) || 1;
  for (let t = 0; t < attempts; t++) {
    const seq = []; const counts = new Array(P).fill(0); let ok = true;
    for (let i = 0; i < M; i++) {
      const cands = [];
      for (let p = 0; p < P; p++) if (counts[p] < cap && (i === 0 || p !== seq[i - 1])) cands.push(p);
      if (!cands.length) { ok = false; break; }
      const p = cands[Math.floor(rand() * cands.length)];
      seq.push(p); counts[p]++;
    }
    if (ok) return seq;
  }
  const seq = []; const counts = new Array(P).fill(0);
  for (let i = 0; i < M; i++) {
    let best = 0, bestc = Infinity;
    for (let p = 0; p < P; p++) if (counts[p] < bestc) { best = p; bestc = counts[p]; }
    seq.push(best); counts[best]++;
  }
  return seq;
}
function placeQuota(qs) {
  const byLen = new Map();
  for (const q of qs) { const n = q.options.length; if (!byLen.has(n)) byLen.set(n, []); byLen.get(n).push(q); }
  for (const [P, group] of byLen) {
    const seq = assignAnswerPositions(group.length, P);
    group.forEach((q, k) => {
      const pos = seq[k];
      const correct = q.options[0];
      const rest = q.options.slice(1);
      for (let i = rest.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [rest[i], rest[j]] = [rest[j], rest[i]]; }
      const out = new Array(q.options.length);
      out[pos] = correct; let d = 0;
      for (let p = 0; p < out.length; p++) { if (p === pos) continue; out[p] = rest[d++]; }
      q.options = out; q.answer_index = pos;
    });
  }
}

// ---------- 载入本课 ----------
const files = fs.readdirSync(SRCDIR).filter((f) => new RegExp(`^am${book}_l\\d+\\.json$`).test(f));
const lessons = files.map((f) => JSON.parse(fs.readFileSync(path.join(SRCDIR, f), "utf8")));
lessons.sort((a, b) => a.lesson_no - b.lesson_no); // 按课号消耗随机流(与 gen 同序)

// 每课 → 导出对象
function exportLesson(L) {
  // 关5 选择题:options[0]=正确项 → placeQuota 打散 + 回填 answer_index
  const s5 = (L.stage5 || []).map((q) => ({ options: q.options.slice(), stem: q.stem, stem_cn: q.stem_cn }));
  placeQuota(s5);
  const questions = [];
  s5.forEach((q, i) => {
    const payload = { stem: q.stem, options: q.options, answer_index: q.answer_index };
    if (q.stem_cn) payload.stem_cn = q.stem_cn;
    questions.push({ stage: 5, qtype: "choice", payload, seq: i + 1 });
  });
  // 关7 填空:不打散,保原位(与 gen 一致),answer_index 取本课 JSON
  (L.stage7_cloze?.blanks || []).forEach((b, i) => {
    questions.push({
      stage: 7, qtype: "cloze", seq: i + 1,
      payload: { stem: `第 ${b.blank_no} 空`, context: L.stage7_cloze.context, blank_no: b.blank_no, options: b.options, answer_index: b.answer_index },
    });
  });
  // 对照卡(真美英对照)+ 语块卡(uk='',带 ipa/example)—— 同 gen 全进 amencontrast
  const contrast = [
    ...(L.contrast || []).map((c) => ({ us: c.us, uk: c.uk, note_cn: c.note_cn ?? null, ipa: null })),
    ...(L.chunks || []).map((c) => ({ us: c.us, uk: "", note_cn: null, ipa: c.ipa ?? null })),
  ];
  return {
    id: L.id, book_no: book, unit_no: L.unit_no, lesson_no: L.lesson_no,
    title_en: L.title_en, title_cn: L.title_cn, grammar_focus: L.grammar_focus, scene: L.scene,
    prelisten_question: L.prelisten ?? null,
    sentences: L.sentences || [],
    words: L.words || [],
    grammar_points: (L.grammar_points || []).map((g) => ({ name: g.name, body_md: null })), // body_md 恒 null(与 DB/第一册一致,关5 不渲染 body)
    contrast,
    questions,
  };
}

const units = [...new Set(lessons.map((L) => L.unit_no))].sort((a, b) => a - b);
const wantUnits = arg === "all" ? units : [Number(arg)];
for (const u of wantUnits) {
  const ls = lessons.filter((L) => L.unit_no === u).map(exportLesson);
  const data = { unit_no: u, lessons: ls };
  fs.writeFileSync(path.join(OUTDIR, `unit${String(u).padStart(2, "0")}.json`), JSON.stringify(data, null, 1), "utf8");
  const counts = ls.map((L) => `L${L.lesson_no}:句${L.sentences.length}/词${L.words.length}/卡${L.contrast.length}/语${L.grammar_points.length}/题${L.questions.length}`);
  console.log(`book${book} 单元${u}: ${ls.length}课  ${counts.join("  ")}`);
}
console.log(`book${book} 导出完毕 → ${OUTDIR}（${units.length} 单元）`);
