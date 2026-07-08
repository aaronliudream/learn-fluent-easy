// 美语课程 第二册 seed 生成器 —— 读 docs/american/book2/am2_l*.json → SQLAA/american_am2_seed_unitNN.sql
// 设计:JSON 为机器源(逐题 options[0]=正确项),消除 prose 解析歧义;本器只负责打散+落 SQL,内容不改。
// 打散口径与 am1(gen-unit1-seed.mjs)完全一致:mulberry32 + assignAnswerPositions + placeQuota(答案位置配额 ≤⌊N/2⌋、无相邻重复)。
// 幂等:全部 ON CONFLICT。按 unit_no 分单元写文件,增课后重跑累积。
// 用法: node scripts/american/gen-book2-seed.mjs
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRCDIR = path.join(ROOT, "docs/american/book2");

// ---------- 确定性 PRNG(mulberry32,与 am1 生成器同实现,保证每次同一 SQL)----------
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
// options[0] 视为正确项,按"选项个数"分组统一配额放置答案,打散后回填 answer_index。
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

const sq = (v) => (v == null ? "NULL" : "'" + String(v).replace(/'/g, "''") + "'");
const jb = (o) => "'" + JSON.stringify(o).replace(/'/g, "''") + "'::jsonb";

// 逐题解释合并:若存在 <id>_explanations_final.md(格式 "### sN seqM | ans: ..."+解释),
// 按 (stage,seq) 注入 payload.explanation_cn → 重跑 seed 不抹掉已审解释(防 ON CONFLICT 覆盖)。
function loadExp(id) {
  const map = new Map();
  let text; try { text = readFileSync(path.join(SRCDIR, `${id}_explanations_final.md`), "utf8"); }
  catch { return { map, fileExists: false }; }
  const re = /###\s*s(\d+)\s+seq(\d+)\s*\|\s*ans:.+?\r?\n([\s\S]*?)(?=\r?\n###\s*s\d+\s+seq|\s*$)/g;
  let m; while ((m = re.exec(text)) !== null) map.set(`${m[1]}:${m[2]}`, m[3].trim());
  return { map, fileExists: true };
}

// ---------- 载入所有 am2_l*.json ----------
const files = readdirSync(SRCDIR).filter((f) => /^am2_l\d+\.json$/.test(f)).sort();
if (!files.length) { console.error("docs/american/book2/ 下无 am2_l*.json"); process.exit(1); }
const lessons = files.map((f) => JSON.parse(readFileSync(path.join(SRCDIR, f), "utf8")));
lessons.sort((a, b) => a.lesson_no - b.lesson_no);

// ---------- 逐课生成 INSERT 行(带 unit 归属)----------
const rows = []; // {unit, sql}
const push = (unit, sql) => rows.push({ unit, sql });
const verify = []; // 自检回显

for (const L of lessons) {
  const U = L.unit_no;
  const gpId = (gp) => `${L.id}_${gp}`;
  const { map: expMap, fileExists: expFileExists } = loadExp(L.id); // (stage:seq) → explanation_cn(已审定稿,若有)
  let mergedExp = 0; // 本课实际合并进 payload 的解释条数(防 CRLF/格式静默失效)

  // american_lessons(含 grammar_card:关5 语法小知识折叠卡 jsonb;依赖 american_add_grammar_card.sql 已跑)
  push(U, `INSERT INTO public.american_lessons (id,book_no,unit_no,lesson_no,title_en,title_cn,grammar_focus,scene,prelisten_question,grammar_card) VALUES (${sq(L.id)},2,${L.unit_no},${L.lesson_no},${sq(L.title_en)},${sq(L.title_cn)},${sq(L.grammar_focus)},${sq(L.scene)},${L.prelisten ? jb(L.prelisten) : "NULL"},${L.grammar_card ? jb(L.grammar_card) : "NULL"}) ON CONFLICT (id) DO UPDATE SET book_no=EXCLUDED.book_no,title_en=EXCLUDED.title_en,title_cn=EXCLUDED.title_cn,grammar_focus=EXCLUDED.grammar_focus,scene=EXCLUDED.scene,prelisten_question=EXCLUDED.prelisten_question,grammar_card=EXCLUDED.grammar_card;`);

  // american_sentences
  for (const s of L.sentences) {
    push(U, `INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES (${sq(L.id)},${s.seq},${sq(s.speaker)},${sq(s.text_en)},${sq(s.text_cn)}) ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;`);
  }

  // american_words
  for (const w of L.words) {
    push(U, `INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES (${sq(L.id)},${sq(w.word)},${sq(w.ipa)},${sq(w.pos)},${sq(w.meaning_cn)},${sq(w.example)}) ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;`);
  }

  // american_grammar_points(body_md 暂 null;关5 不渲染 body,考点掌握靠 gp 计数)
  for (const p of L.grammar_points) {
    push(U, `INSERT INTO public.american_grammar_points (id,lesson_id,name,body_md) VALUES (${sq(gpId(p.gp))},${sq(L.id)},${sq(p.name)},NULL) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name;`);
  }

  // american_amencontrast:对照卡(uk=英式词)+ 语块卡(uk='',带 ipa/example)
  for (const c of (L.contrast || [])) {
    push(U, `INSERT INTO public.american_amencontrast (lesson_id,us,uk,note_cn) VALUES (${sq(L.id)},${sq(c.us)},${sq(c.uk)},${sq(c.note_cn)}) ON CONFLICT (lesson_id,us) DO UPDATE SET uk=EXCLUDED.uk,note_cn=EXCLUDED.note_cn;`);
  }
  for (const c of (L.chunks || [])) {
    push(U, `INSERT INTO public.american_amencontrast (lesson_id,us,uk,note_cn,ipa,example1,example1_cn,example2,example2_cn) VALUES (${sq(L.id)},${sq(c.us)},'',NULL,${sq(c.ipa)},${sq(c.example1)},${sq(c.example1_cn)},${sq(c.example2)},${sq(c.example2_cn)}) ON CONFLICT (lesson_id,us) DO UPDATE SET ipa=EXCLUDED.ipa,example1=EXCLUDED.example1,example1_cn=EXCLUDED.example1_cn,example2=EXCLUDED.example2,example2_cn=EXCLUDED.example2_cn;`);
  }

  // ---- questions ----
  const emitChoice = (stage, items, extra = () => ({})) => {
    const qs = items.map((it) => ({ ...it, options: it.options.slice() }));
    placeQuota(qs);
    let seq = 1;
    for (const q of qs) {
      const payload = { stem: q.stem, options: q.options, answer_index: q.answer_index, ...extra(q) };
      if (q.stem_cn) payload.stem_cn = q.stem_cn; // ④ 句型题填答案后整句中译(关5/关10)
      const ex = expMap.get(`${stage}:${seq}`); if (ex) { payload.explanation_cn = ex; mergedExp++; }
      push(U, `INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES (${sq(L.id)},${stage},${sq(q.gpId || null)},'choice',${jb(payload)},${seq}) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;`);
      verify.push(`  ${L.id} s${stage} #${seq} [${"abcd"[q.answer_index]}] ${q.options[q.answer_index]}`);
      seq++;
    }
  };

  // 关5(gp 挂题)
  emitChoice(5, L.stage5.map((q) => ({ stem: q.stem, options: q.options, gpId: gpId(q.gp), stem_cn: q.stem_cn })));

  // 关6 美语点睛小测(stage6;看卡后小测,必须有题否则空 QuizRunner 崩)
  emitChoice(6, (L.stage6 || []).map((q) => ({ stem: q.stem, options: q.options })));

  // 关7 cloze(不打散,保原文位置;每空一题)
  {
    let seq = 1;
    for (const b of L.stage7_cloze.blanks) {
      const payload = { stem: `第 ${b.blank_no} 空`, context: L.stage7_cloze.context, blank_no: b.blank_no, options: b.options, answer_index: b.answer_index };
      const ex = expMap.get(`7:${seq}`); if (ex) { payload.explanation_cn = ex; mergedExp++; }
      push(U, `INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES (${sq(L.id)},7,NULL,'cloze',${jb(payload)},${seq}) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET payload=EXCLUDED.payload;`);
      verify.push(`  ${L.id} s7 #${seq} 空${b.blank_no} [${"abcd"[b.answer_index]}] ${b.options[b.answer_index]}`);
      seq++;
    }
  }

  // 关8 听力(choice;音频由 stage 播 sentences)
  emitChoice(8, L.stage8_listening.map((q) => ({ stem: q.stem, options: q.options })));

  // 关9 情景(choice)
  emitChoice(9, L.stage9_scenario.map((q) => ({ stem: q.stem, options: q.options })));

  // 关10 通关(全 choice;reading→passage、listening→audio 均=本课课文)
  emitChoice(10, L.stage10.map((q) => ({ stem: q.stem, options: q.options, _kind: q.kind, _passage: q.passage, _audio: q.audio, stem_cn: q.stem_cn })),
    (q) => {
      const ex = {};
      if (q._passage) ex.passage = L.passage;
      if (q._audio) ex.audio = L.passage;
      return ex;
    });

  // 防静默失效:存在 explanations_final.md 却一条都没合并进 payload(CRLF/格式失配)→ 生成即中止,
  // 不许产出"有解释文件却无解释"的 seed(否则 ON CONFLICT 整包覆盖会抹掉线上已落的解释,正是当初的 footgun)。
  if (expFileExists && mergedExp === 0) {
    console.error(`❌ ${L.id}: 存在 ${L.id}_explanations_final.md 但合并解释 0 条 → 生成中止(疑 CRLF/格式失配,勿产出无解释 seed)`);
    process.exit(1);
  }
  console.log(`  ${L.id}: merged ${mergedExp}${expFileExists ? "" : "(无解释文件)"}`);
}

// ---------- 分单元写出 ----------
mkdirSync(path.join(ROOT, "SQLAA"), { recursive: true });
const units = [...new Set(lessons.map((L) => L.unit_no))].sort((a, b) => a - b);
const p2 = (n) => String(n).padStart(2, "0");
// 写前比对:内容不变则不动文件、不刷时间戳 —— 这样 Aaron 看时间戳即可判断"哪几个 unit 真变了要跑"。
// 生成器确定性(mulberry32 固定种子 + 按 lesson_no 顺序消耗随机流):末尾加课不改前面单元输出,故未改单元逐字节相同。
const written = []; const unchanged = [];
for (const U of units) {
  const lines = rows.filter((r) => r.unit === U).map((r) => r.sql);
  const ls = lessons.filter((L) => L.unit_no === U);
  const hdr = [
    `-- 美语课程 第二册 seed · 单元 ${U}(生成器 gen-book2-seed.mjs 产出,勿手改;改 am2_l*.json 后重跑)`,
    `-- 幂等:全部 ON CONFLICT。依赖 SQLAA/american_add_book_no.sql 已跑(book_no 列)。`,
    `-- 本单元课:${ls.map((L) => L.id).join(", ")}`,
    "BEGIN;",
  ];
  const fp = path.join(ROOT, "SQLAA", `american_am2_seed_unit${p2(U)}.sql`);
  const next = hdr.concat(lines, ["COMMIT;", ""]).join("\n");
  const prev = existsSync(fp) ? readFileSync(fp, "utf8") : null;
  if (prev === next) { unchanged.push(U); }
  else { writeFileSync(fp, next, "utf8"); written.push(U); }
}

// ---------- 对账 + 自检回显 ----------
console.log("第二册 seed 生成完毕。");
for (const L of lessons) {
  const c = { s5: L.stage5.length, s6: (L.stage6 || []).length, s7: L.stage7_cloze.blanks.length, s8: L.stage8_listening.length, s9: L.stage9_scenario.length, s10: L.stage10.length };
  const q = c.s5 + c.s6 + c.s7 + c.s8 + c.s9 + c.s10;
  console.log(`${L.id}: 句${L.sentences.length} 词${L.words.length} 考点${L.grammar_points.length} 对照${(L.contrast||[]).length}+语块${(L.chunks||[]).length} | 关5=${c.s5} 关6=${c.s6} 关7=${c.s7} 关8=${c.s8} 关9=${c.s9} 关10=${c.s10} = ${q}题`);
}
console.log("\n答案自检回显(逐题打散后正确项,核对用):");
console.log(verify.join("\n"));
console.log("\n========== 本次写文件判定(时间戳只在真变时才刷)==========");
if (written.length) for (const U of written) console.log(`  ✍️  需跑  american_am2_seed_unit${p2(U)}.sql(内容有变,已重写)`);
if (unchanged.length) for (const U of unchanged) console.log(`  ⏭️  无需重跑  american_am2_seed_unit${p2(U)}.sql(内容不变,未动文件)`);
console.log(`小结:本次改写 ${written.length} 个单元 [${written.map(p2).join(", ") || "无"}];未变 ${unchanged.length} 个 [${unchanged.map(p2).join(", ") || "无"}]。`);
