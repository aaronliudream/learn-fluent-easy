// 美语课程 单元1 种子生成器 —— 解析 docs/american 的定稿 md → SQLAA/american_phase1_seed.sql
// 内容一字不改:直接从 md 解析,不手抄。choice 选项按 assignAnswerPositions 配额打散(种子固定,可复现)。
// 用法: node scripts/american/gen-unit1-seed.mjs
// gap(不入库,另行补): L1 词/关10(缺 v1)、关6 小测(缺题面)、grammar_points.body_md(待审)。
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const D = (f) => path.join(ROOT, "docs/american", f);
const batch = readFileSync(D("美语课程_批次1_第2-6课.md"), "utf8");
const l1v2 = readFileSync(D("美语第1课_定稿v2.md"), "utf8");
const l1v1 = readFileSync(D("美语第1课_v1.md"), "utf8");
const g5 = readFileSync(D("美语课程_单元1_关5题库_v1.md"), "utf8");
const g6 = readFileSync(D("美语课程_单元1_关6小测_v1.md"), "utf8");
// 单元2(第7-12课)
const batch2 = readFileSync(D("美语课程_批次2_第7-12课.md"), "utf8");
const g5_2 = readFileSync(D("美语课程_单元2_关5题库_v1.md"), "utf8");
const g6_2 = readFileSync(D("美语课程_单元2_关6小测_v1.md"), "utf8");
// 单元3(第13-18课)
const batch3 = readFileSync(D("美语课程_批次3_第13-18课.md"), "utf8");
const g5_3 = readFileSync(D("美语课程_单元3_关5题库_v1.md"), "utf8");
const g6_3 = readFileSync(D("美语课程_单元3_关6小测_v1.md"), "utf8");
// 单元4(第19-24课)
const batch4 = readFileSync(D("美语课程_批次4_第19-24课.md"), "utf8");
const g5_4 = readFileSync(D("美语课程_单元4_关5题库_v1.md"), "utf8");
const g6_4 = readFileSync(D("美语课程_单元4_关6小测_v1.md"), "utf8");
// 单元5(第25-30课)
const batch5 = readFileSync(D("美语课程_批次5_第25-30课.md"), "utf8");
const g5_5 = readFileSync(D("美语课程_单元5_关5题库_v1.md"), "utf8");
const g6_5 = readFileSync(D("美语课程_单元5_关6小测_v1.md"), "utf8");
// 单元6(第31-36课)
const batch6 = readFileSync(D("美语课程_批次6_第31-36课.md"), "utf8");
const g5_6 = readFileSync(D("美语课程_单元6_关5题库_v1.md"), "utf8");
const g6_6 = readFileSync(D("美语课程_单元6_关6小测_v1.md"), "utf8");
// 单元7(第37-42课)
const batch7 = readFileSync(D("美语课程_批次7_第37-42课.md"), "utf8");
const g5_7 = readFileSync(D("美语课程_单元7_关5题库_v1.md"), "utf8");
const g6_7 = readFileSync(D("美语课程_单元7_关6小测_v1.md"), "utf8");
// 单元8(第43-48课)
const batch8 = readFileSync(D("美语课程_批次8_第43-48课.md"), "utf8");
const g5_8 = readFileSync(D("美语课程_单元8_关5题库_v1.md"), "utf8");
const g6_8 = readFileSync(D("美语课程_单元8_关6小测_v1.md"), "utf8");
// 单元9(第49-54课)
const batch9 = readFileSync(D("美语课程_批次9_第49-54课.md"), "utf8");
const g5_9 = readFileSync(D("美语课程_单元9_关5题库_v1.md"), "utf8");
const g6_9 = readFileSync(D("美语课程_单元9_关6小测_v1.md"), "utf8");
// 单元10(第55-60课)
const batch10 = readFileSync(D("美语课程_批次10_第55-60课.md"), "utf8");
const g5_10 = readFileSync(D("美语课程_单元10_关5题库_v1.md"), "utf8");
const g6_10 = readFileSync(D("美语课程_单元10_关6小测_v1.md"), "utf8");
// 单元11(第61-66课)
const batch11 = readFileSync(D("美语课程_批次11_第61-66课.md"), "utf8");
const g5_11 = readFileSync(D("美语课程_单元11_关5题库_v1.md"), "utf8");
const g6_11 = readFileSync(D("美语课程_单元11_关6小测_v1.md"), "utf8");
// 单元12(第67-72课)
const batch12 = readFileSync(D("美语课程_批次12_第67-72课.md"), "utf8");
const g5_12 = readFileSync(D("美语课程_单元12_关5题库_v1.md"), "utf8");
const g6_12 = readFileSync(D("美语课程_单元12_关6小测_v1.md"), "utf8");

// ---------- Plan C 扩容包(独立 american_expand_unitNN.sql,幂等增补,不动既有) ----------
// 每包每课增补:关5(+8,挂既有考点)/关7(挖空池,seq 续号)/关10(+3)。
// 关5 考点:含 gpN 码的直接用;含"考点描述"的按 gpSeq 覆盖表(题序→gpN)。
// gpSeq 由人工核对得来(门禁):数组长度须=该课关5增补题数,且每个 gpId 必须命中既有 grammar_point。
const readOpt = (f) => { try { return readFileSync(D(f), "utf8"); } catch { return null; } };
const EXPANSIONS = [
  { unit: 1, text: readOpt("美语课程_单元1_扩容包_v1.md"),
    gpSeq: { 1: [1,1,1,1,1,2,2,2], 2: [1,1,1,1,1,2,2,2], 3: [1,1,1,1,1,2,2,2], 4: [1,1,1,1,1,2,2,2], 5: [1,1,1,1,1,2,2,2], 6: [1,1,1,1,1,2,2,2] } },
  // 单元2:L7/L8/L9 合并描述按 A 线逐题拆挂(size→gp3、they应答→gp3、复数职业→gp3);L10-12 gp1×4/gp2×4
  { unit: 2, text: readOpt("美语课程_单元2_扩容包_v1.md"),
    gpSeq: { 7: [1,3,1,3,2,2,2,2], 8: [1,1,1,1,3,3,2,2], 9: [1,1,1,1,2,3,2,3], 10: [1,1,1,1,2,2,2,2], 11: [1,1,1,1,2,2,2,2], 12: [1,1,1,1,2,2,2,2] } },
  // 单元3:关5 用 gp 码(解析器直接读),无需 gpSeq;基线实查186→290
  { unit: 3, text: readOpt("美语课程_单元3_扩容包_v1.md") },
  // 单元4:同上用 gp 码;基线实查184→288
  { unit: 4, text: readOpt("美语课程_单元4_扩容包_v1.md") },
  // 单元6:gp 码;L33/L36 关7"新N"已换算为真实 blank_no(base7=5);基线实查184→284
  { unit: 6, text: readOpt("美语课程_单元6_扩容包_v1.md") },
  // 单元7:v1+v1.1合并(L37/L42关7来自v1.1);L37/L40/L41/L42 gp直挂,L38/L39 对号gpSeq(核题库:L38不规则2批×5+too×3,L39 Did×4+didn't×4);基线187→287
  { unit: 7, text: readOpt("美语课程_单元7_扩容包_v1_合并.md"),
    gpSeq: { 38: [1,1,1,1,1,2,2,2], 39: [1,1,1,1,2,2,2,2] } },
  // 单元8:v1+v1.1合并(L45四空作废改用v1.1六空,L46/L47/L48关7来自v1.1);L43 gp直挂,L44-L48对号gpSeq;L48=Aaron拍板(B)[2,1,1,1,1,1,2,2];基线187→289
  { unit: 8, text: readOpt("美语课程_单元8_扩容包_v1_合并.md"),
    gpSeq: { 44: [1,1,1,1,2,2,2,2], 45: [1,1,1,1,2,2,2,2], 46: [1,1,1,2,2,1,1,1], 47: [1,1,1,1,2,2,2,2], 48: [2,1,1,1,1,1,2,2] } },
  // 单元9:完整包无缺口;全6课对号(核题库:形式/用法·already/yet·too/enough·副词构成/辨析·比较级/than句,均顺序4+4对gp1/gp2);基线187→289
  { unit: 9, text: readOpt("美语课程_单元9_扩容包_v1.md"),
    gpSeq: { 49: [1,1,1,1,2,2,2,2], 50: [1,1,1,1,2,2,2,2], 51: [1,1,1,1,2,2,2,2], 52: [1,1,1,1,2,2,2,2], 53: [1,1,1,1,2,2,2,2], 54: [1,1,1,1,2,2,2,2] } },
  // 单元10:对号;L58/L60=Aaron拍板[1,1,1,1,1,1,2,1](仅第7题→gp2),余顺序4+4;基线187→289
  { unit: 10, text: readOpt("美语课程_单元10_扩容包_v1.md"),
    gpSeq: { 55: [1,1,1,1,2,2,2,2], 56: [1,1,1,1,2,2,2,2], 57: [1,1,1,1,2,2,2,2], 58: [1,1,1,1,1,1,2,1], 59: [1,1,1,1,2,2,2,2], 60: [1,1,1,1,1,1,2,1] } },
  // 单元11:对号;L62/L64=Aaron拍板全gp1(gp2本包无新题),余顺序4+4;基线187→289
  { unit: 11, text: readOpt("美语课程_单元11_扩容包_v1.md"),
    gpSeq: { 61: [1,1,1,1,2,2,2,2], 62: [1,1,1,1,1,1,1,1], 63: [1,1,1,1,2,2,2,2], 64: [1,1,1,1,1,1,1,1], 65: [1,1,1,1,2,2,2,2], 66: [1,1,1,1,2,2,2,2] } },
  // 单元12:对号收官;L69=Aaron拍板[2,2,2,2,1,1,1,1](包组与题库gp反),L70全gp1(gp2无新题),余顺序4+4;基线187→289
  { unit: 12, text: readOpt("美语课程_单元12_扩容包_v1.md"),
    gpSeq: { 67: [1,1,1,1,2,2,2,2], 68: [1,1,1,1,2,2,2,2], 69: [2,2,2,2,1,1,1,1], 70: [1,1,1,1,1,1,1,1], 71: [1,1,1,1,2,2,2,2], 72: [1,1,1,1,2,2,2,2] } },
];

// lesson_no → 内容 id(两位补零:am1_l01 … am1_l72)
const pad = (n) => "am1_l" + String(n).padStart(2, "0");

// ---------- 确定性 PRNG(mulberry32),保证每次生成同一 SQL ----------
let _s = 0x9e3779b9;
function rand() {
  _s |= 0; _s = (_s + 0x6d2b79f5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
// ---------- assignAnswerPositions(复刻 questionBank.ts,P 可变) ----------
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
// 对一组 choice 题按"选项个数"分组统一配额放置答案(3 选/4 选各自配额)。
// q.options[0] 视为正确项(解析时把正确项放首位),打散后回填 answer_index。
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

const sq = (s) => (s == null ? "NULL" : "'" + String(s).replace(/'/g, "''") + "'");
const jb = (o) => "'" + JSON.stringify(o).replace(/'/g, "''") + "'::jsonb";

// ============ 解析辅助 ============
// 拆 "a) X　b) Y ✓　c) Z" → {options:[X,Y,Z...], answer_index}
function parseInlineOptions(s) {
  // 用 字母) 作分隔
  const parts = s.split(/[a-d]\)/).map((x) => x.trim()).filter(Boolean);
  let ans = -1;
  const options = parts.map((p, i) => {
    let t = p.replace(/[（）()]/g, "").trim();
    if (/✓/.test(t)) { ans = i; t = t.replace(/✓/g, "").trim(); }
    // 去尾部全角/半角分隔残留
    t = t.replace(/[　\s]+$/g, "").replace(/[、,;]$/,"").trim();
    return t;
  });
  return { options, answer_index: ans };
}

// ============ 解析单课 (通用块) ============
function parseLesson(block, meta) {
  const L = { ...meta };
  // 语法目标 / 场景
  const gf = block.match(/语法目标[：:]\s*(.+)/); L.grammar_focus = gf ? gf[1].trim() : null;
  const sc = block.match(/场景[：:]\s*(.+)/); L.scene = sc ? sc[1].trim() : null;

  // 关1 prelisten
  const pre = block.match(/前置听力问题[^\n]*[：:]\s*([^\n]+)\n（([^\n]+)）/);
  if (pre) {
    const q = pre[1].trim();
    const { options, answer_index } = parseInlineOptions(pre[2]);
    L.prelisten = { q, options, answer_index };
  }
  // 关1 句表: | # | English | 中文 |
  L.sentences = [];
  const sBlock = section(block, "关1");
  for (const row of tableRows(sBlock)) {
    if (row.length >= 3 && /^\d+$/.test(row[0])) {
      const en = row[1].trim(); const cn = row[2].trim();
      let speaker = null; let text_en = en;
      const m = en.match(/^([A-Z][A-Z' .]+):\s*(.*)$/);
      if (m) { speaker = cap(m[1].trim()); text_en = m[2].trim(); }
      L.sentences.push({ seq: Number(row[0]), speaker, text_en, text_cn: cn });
    }
  }
  // 关2-4 词表
  L.words = [];
  const wBlock = section(block, "关2");
  if (wBlock) {
    for (const row of tableRows(wBlock)) {
      if (row.length >= 5 && row[0] !== "词汇" && !/^-+$/.test(row[0])) {
        L.words.push({ word: row[0].trim(), ipa: clean(row[1]), pos: clean(row[2]), meaning_cn: clean(row[3]), example: clean(row[4]) });
      }
    }
  }
  // 关6 对照
  L.contrast = [];
  const cBlock = section(block, "关6");
  if (cBlock) {
    const rows = tableRows(cBlock);
    if (rows.length) {
      for (const row of rows) {
        if (row.length >= 3 && !/美语|^-+$/.test(row[0])) {
          L.contrast.push({ us: clean(row[0]), uk: clean(row[1]), note_cn: clean(row[2]) });
        }
      }
    } else {
      // 内联格式 "us–uk / us–uk / ..."(L1 v2,无中文注)
      const line = cBlock.split("\n").find((l) => /[–—]/.test(l) && l.includes("/") && !l.startsWith("#"));
      if (line) {
        for (const pair of line.split("/")) {
          const seg = pair.trim().split(/[–—]/);
          if (seg.length >= 2) L.contrast.push({ us: seg[0].trim(), uk: seg.slice(1).join("–").trim(), note_cn: null });
        }
      }
    }
  }
  // 关7 填空: 挖空对话 + | 空 | 选项 | 答案 |
  L.cloze = parseCloze(section(block, "关7"));
  // 关8 听力
  L.listening = parseNumberedChoice(section(block, "关8"));
  // 关9 情景
  L.scenario = parseScenario(section(block, "关9"));
  // 关10 通关
  L.guan10 = parseGuan10(section(block, "关10"));
  // 关5 语法讲解原文(body_md,批次1已审,原文填入)
  L.grammarBody = stripHeaderLine(section(block, "关5"));
  return L;
}
function stripHeaderLine(s) {
  if (!s) return null;
  const body = s.replace(/^##[^\n]*\n/, "").trim();
  return body || null;
}
function between(text, a, b) {
  const i = text.indexOf(a); if (i < 0) return "";
  const j = b ? text.indexOf(b, i + a.length) : -1;
  return text.slice(i + a.length, j < 0 ? undefined : j);
}
// v1 L1 生词表(## 二、生词...)
function parseV1Words(text) {
  const sec = between(text, "## 二、生词", "## 三");
  const out = [];
  for (const row of tableRows(sec)) {
    if (row.length >= 5 && row[0] !== "词汇" && !/^-+$/.test(row[0])) {
      out.push({ word: row[0].trim(), ipa: clean(row[1]), pos: clean(row[2]), meaning_cn: clean(row[3]), example: clean(row[4]) });
    }
  }
  return out;
}
// v1 L1 关10(## 五、练习 A 选择填空[3选] + B 句型转换),答案在"参考答案"块
function parseV1Guan10(text) {
  const out = [];
  const aBlock = between(text, "### A", "### B");
  const bBlock = between(text, "### B", "### C");
  const ansBlock = text.slice(text.indexOf("参考答案"));
  const ansA = {}; const mA = ansBlock.match(/A[：:]\s*([^\n]+)/);
  if (mA) for (const p of mA[1].matchAll(/(\d+)\s*-\s*([a-d])/g)) ansA[+p[1]] = p[2];
  const ansB = {}; const mB = ansBlock.match(/B[：:]\s*([^\n]+)/);
  if (mB) for (const it of mB[1].split(/(?=\d+\.)/)) { const mm = it.match(/(\d+)\.\s*(.+?)[\s　]*$/); if (mm) ansB[+mm[1]] = mm[2].trim(); }
  const aLines = aBlock.split("\n").map((x) => x.replace(/\s+$/, ""));
  for (let i = 0; i < aLines.length; i++) {
    const ms = aLines[i].match(/^\s*(\d+)\.\s*(.+)$/);
    if (!ms) continue;
    const n = +ms[1]; const stem = ms[2].trim();
    let optLine = "";
    for (let j = i + 1; j < aLines.length; j++) { if (/[a-d]\)/.test(aLines[j])) { optLine = aLines[j]; break; } if (/^\s*\d+\./.test(aLines[j])) break; }
    if (!optLine) continue;
    const { options } = parseInlineOptions(optLine);
    const ci = "abcd".indexOf(ansA[n]);
    const correct = options[ci];
    out.push({ qtype: "choice", stem, options: [correct, ...options.filter((_, k) => k !== ci)], answer_index: 0 });
  }
  for (const line of bBlock.split("\n")) {
    const mb = line.match(/^\s*(\d+)\.\s*(.+?)\s*(?:→|->)\s*(.*)$/);
    if (!mb) continue;
    const n = +mb[1]; const sentence = mb[2].trim(); const tail = mb[3] || "";
    const nm = tail.match(/[（(]([^）)]*)[）)]/);
    const stem = sentence + "（变一般疑问句" + (nm ? "；" + nm[1] : "") + "）";
    out.push({ qtype: "transform", stem, answer_text: ansB[n] });
  }
  return out;
}
// 关6 小测题库 → {lessonNo:[choice...]}
function parseGuan6(text) {
  const byLesson = {};
  const blocks = text.split(/##\s*L(\d+)（am1_l\d\d）/).slice(1);
  for (let i = 0; i < blocks.length; i += 2) {
    const ln = +blocks[i]; const body = blocks[i + 1]; const qs = [];
    for (const row of tableRows(body)) {
      if (row.length >= 5 && /^\d+$/.test(row[0])) {
        const stem = row[2].trim();
        const opts = row[3].split("/").map((x) => x.trim()).filter(Boolean);
        const ans = row[4].trim();
        qs.push({ qtype: "choice", stem, options: [ans, ...opts.filter((o) => o !== ans)] });
      }
    }
    byLesson[ln] = qs;
  }
  return byLesson;
}

function cap(s) { return s.replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\b(\w)(\w*)/g, (_, a, b) => a + b.toLowerCase()); }
function clean(s) { return (s || "").replace(/[🇺🇸🇬🇧]/g, "").trim() || null; }
// 取 "## 关N ..." 到下一个 "## " 之间
function section(block, key) {
  const re = new RegExp("##[^\\n]*" + key + "[\\s\\S]*?(?=\\n## |\\n═|$)");
  const m = block.match(re); return m ? m[0] : "";
}
function tableRows(s) {
  return s.split("\n").filter((l) => l.trim().startsWith("|"))
    .map((l) => l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim()))
    .filter((cells) => !cells.every((c) => /^-*$/.test(c)));
}
function parseCloze(s) {
  if (!s) return null;
  const dialogLines = s.split("\n").filter((l) => /___\d?_*___|_{3,}/.test(l) && !l.includes("|"));
  const context = dialogLines.join("\n").trim();
  const blanks = [];
  for (const row of tableRows(s)) {
    if (row.length >= 3 && /^\d+$/.test(row[0])) {
      const { options } = parseInlineOptions(row[1]);
      const ansLetter = row[2].trim().toLowerCase();
      const idx = "abcd".indexOf(ansLetter);
      blanks.push({ blank_no: Number(row[0]), options, answer_index: idx });
    }
  }
  return { context, blanks };
}
function parseNumberedChoice(s) {
  const out = [];
  for (const line of s.split("\n")) {
    const m = line.match(/^\s*(\d+)\.\s*(.+?)\s*[—-]\s*(.+)$/);
    if (m && /[a-d]\)/.test(m[3])) {
      const stem = m[2].trim();
      const { options, answer_index } = parseInlineOptions(m[3]);
      out.push({ stem, options, answer_index });
    }
  }
  return out;
}
function parseScenario(s) {
  const out = [];
  for (const line of s.split("\n")) {
    const m = line.match(/^\s*\d+\.\s*(.+?)\s*(?:→|->)\s*(.+)$/);
    if (m) out.push({ situation: m[1].trim(), answer_text: m[2].trim() });
  }
  return out;
}
function parseGuan10(s) {
  const out = [];
  // A 选择: "1. stem a) .. b) .. c) .. d) .. → **x**"
  for (const line of s.split("\n")) {
    const mc = line.match(/^\s*(\d+)\.\s*(.+?)→\s*\*\*([a-d])\*\*\s*$/);
    if (mc && /[a-d]\)/.test(mc[2])) {
      // 拆 stem 与 options: 第一个 "a)" 之前是 stem
      const seg = mc[2];
      const ai = seg.search(/a\)/);
      const stem = seg.slice(0, ai).trim().replace(/[　\s]+$/,"");
      const { options } = parseInlineOptions(seg.slice(ai));
      const answer_index = "abcd".indexOf(mc[3]);
      out.push({ qtype: "choice", stem, options, answer_index });
      continue;
    }
    // B 转换: "1. orig（instruction）→ answer"
    const mt = line.match(/^\s*(\d+)\.\s*(.+?)\s*(?:→|->)\s*(.+)$/);
    if (mt && !/\*\*/.test(line) && !/[a-d]\)/.test(mt[2])) {
      out.push({ qtype: "transform", stem: mt[2].trim(), answer_text: mt[3].trim() });
    }
  }
  return out;
}

// ============ 解析 关5 题库 ============
function parseGuan5(text) {
  const byLesson = {}; // lessonNo -> {points:[{gp,name}], questions:[...]}
  const lessonBlocks = text.split(/##\s*L(\d+)（am1_l\d\d）考点定义/).slice(1);
  for (let i = 0; i < lessonBlocks.length; i += 2) {
    const ln = Number(lessonBlocks[i]);
    const body = lessonBlocks[i + 1];
    const points = [];
    for (const m of body.matchAll(/-\s*(am1_l\d\d_gp\d)[：:]\s*(.+)/g)) points.push({ id: m[1], name: m[2].trim() });
    const questions = [];
    for (const row of tableRows(body)) {
      if (row.length >= 6 && /^\d+$/.test(row[0])) {
        const gp = row[1].trim(); const qtype = row[2].trim();
        const stem = row[3].trim(); const optRaw = row[4].trim(); const ans = row[5].trim();
        const gpId = `${pad(ln)}_${gp}`;
        if (qtype === "transform") {
          questions.push({ gpId, qtype: "transform", stem, answer_text: ans });
        } else {
          const opts = optRaw.split("/").map((x) => x.trim()).filter(Boolean);
          // 正确项放首位供 placeQuota
          const correct = ans;
          const ordered = [correct, ...opts.filter((o) => o !== correct)];
          questions.push({ gpId, qtype: "choice", stem, options: ordered });
        }
      }
    }
    byLesson[ln] = { points, questions };
  }
  return byLesson;
}

// ============ 组装 ============
const lessons = [];
// L1(部分): 从 v2 解析 sentences/prelisten/contrast/cloze/listening/scenario(词/关10 缺 v1,跳过)
{
  const meta = { id: "am1_l01", unit_no: 1, lesson_no: 1,
    title_en: "Excuse me, is this your phone?", title_cn: "打扰一下，这是你的手机吗？" };
  const L = parseLesson(l1v2, meta);          // 句/prelisten/关6/关7/关8/关9 用 v2 定稿
  L.words = parseV1Words(l1v1);               // L1 词详情来自 v1
  L.guan10 = parseV1Guan10(l1v1);             // L1 关10 来自 v1
  L.grammarBody = (between(l1v1, "## 三、语法", "## 四").trim()) || null; // L1 语法讲解来自 v1
  lessons.push(L);
}
// L2-6: 从 batch 解析
const titleMap = {
  2: ["Here's my ticket", "给您我的取车票"],
  3: ["This is my friend Diego", "这是我的朋友迭戈"],
  4: ["What's your job?", "你是做什么工作的？"],
  5: ["How are you today?", "你今天好吗？"],
  6: ["Whose mug is this?", "这是谁的马克杯？"],
};
for (const m of batch.matchAll(/#\s*Lesson\s*(\d)\s+[\s\S]*?(?=\n#\s*Lesson\s*\d|\n#\s*单元 1 完结|$)/g)) {
  const ln = Number(m[1]);
  if (ln < 2) continue;
  const meta = { id: `am1_l0${ln}`, unit_no: 1, lesson_no: ln, title_en: titleMap[ln][0], title_cn: titleMap[ln][1] };
  lessons.push(parseLesson(m[0], meta));
}
// 单元2+(batch2/3/…): 标题从每课 block 头(# Lesson N <英> / 首个 ## <中>)提取。
// unit_no 由 batch 显式给定;lesson_no 从 # Lesson N 读取。新增单元只需在此数组追加一行。
const extraBatches = [
  { text: batch2, unit: 2 },
  { text: batch3, unit: 3 },
  { text: batch4, unit: 4 },
  { text: batch5, unit: 5 },
  { text: batch6, unit: 6 },
  { text: batch7, unit: 7 },
  { text: batch8, unit: 8 },
  { text: batch9, unit: 9 },
  { text: batch10, unit: 10 },
  { text: batch11, unit: 11 },
  { text: batch12, unit: 12 },
];
for (const { text, unit } of extraBatches) {
  for (const m of text.matchAll(/#\s*Lesson\s*(\d+)\s+[\s\S]*?(?=\n#\s*Lesson\s*\d+|\n#\s*单元 \d+ 完结|$)/g)) {
    const ln = Number(m[1]);
    const block = m[0];
    const enM = block.match(/#\s*Lesson\s*\d+\s+(.+)/);
    const cnM = block.match(/\n##\s+([^\n]+)/);
    lessons.push(parseLesson(block, { id: pad(ln), unit_no: unit, lesson_no: ln,
      title_en: enM ? enM[1].trim() : "", title_cn: cnM ? cnM[1].trim() : "" }));
  }
}
lessons.sort((a, b) => a.lesson_no - b.lesson_no);

// 关5/关6 各单元合并(键 1-6 / 7-12 / 13-18 不冲突)
const g5byLesson = { ...parseGuan5(g5), ...parseGuan5(g5_2), ...parseGuan5(g5_3), ...parseGuan5(g5_4), ...parseGuan5(g5_5), ...parseGuan5(g5_6), ...parseGuan5(g5_7), ...parseGuan5(g5_8), ...parseGuan5(g5_9), ...parseGuan5(g5_10), ...parseGuan5(g5_11), ...parseGuan5(g5_12) };
const g6byLesson = { ...parseGuan6(g6), ...parseGuan6(g6_2), ...parseGuan6(g6_3), ...parseGuan6(g6_4), ...parseGuan6(g6_5), ...parseGuan6(g6_6), ...parseGuan6(g6_7), ...parseGuan6(g6_8), ...parseGuan6(g6_9), ...parseGuan6(g6_10), ...parseGuan6(g6_11), ...parseGuan6(g6_12) };
const bodyByLesson = {};
for (const L of lessons) bodyByLesson[L.lesson_no] = L.grammarBody;

// ============ 生成 SQL ============
// out 只装 INSERT 行(不含 BEGIN/COMMIT/注释);分片时按 lesson_id 前缀归到各单元。
const out = [];

// lessons
for (const L of lessons) {
  out.push(`INSERT INTO public.american_lessons (id,unit_no,lesson_no,title_en,title_cn,grammar_focus,scene,prelisten_question) VALUES (${sq(L.id)},${L.unit_no},${L.lesson_no},${sq(L.title_en)},${sq(L.title_cn)},${sq(L.grammar_focus)},${sq(L.scene)},${L.prelisten ? jb(L.prelisten) : "NULL"}) ON CONFLICT (id) DO UPDATE SET title_en=EXCLUDED.title_en,title_cn=EXCLUDED.title_cn,grammar_focus=EXCLUDED.grammar_focus,scene=EXCLUDED.scene,prelisten_question=EXCLUDED.prelisten_question;`);
}
// sentences
for (const L of lessons) for (const s of L.sentences) {
  out.push(`INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES (${sq(L.id)},${s.seq},${sq(s.speaker)},${sq(s.text_en)},${sq(s.text_cn)}) ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;`);
}
// words
for (const L of lessons) for (const w of L.words) {
  out.push(`INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES (${sq(L.id)},${sq(w.word)},${sq(w.ipa)},${sq(w.pos)},${sq(w.meaning_cn)},${sq(w.example)}) ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;`);
}
// grammar_points (15,来自关5题库考点定义;body_md=本课语法讲解原文[批次1已审])
for (const ln of Object.keys(g5byLesson)) {
  for (const p of g5byLesson[ln].points) {
    out.push(`INSERT INTO public.american_grammar_points (id,lesson_id,name,body_md) VALUES (${sq(p.id)},${sq(pad(Number(ln)))},${sq(p.name)},${sq(bodyByLesson[ln])}) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,body_md=EXCLUDED.body_md;`);
  }
}
// contrast(幂等靠 UNIQUE(lesson_id,us);裸 ON CONFLICT DO NOTHING 会因 id 自动 uuid 永不冲突→重跑重复插)
for (const L of lessons) for (const c of L.contrast) {
  out.push(`INSERT INTO public.american_amencontrast (lesson_id,us,uk,note_cn) VALUES (${sq(L.id)},${sq(c.us)},${sq(c.uk)},${sq(c.note_cn)}) ON CONFLICT (lesson_id,us) DO UPDATE SET uk=EXCLUDED.uk,note_cn=EXCLUDED.note_cn;`);
}

// questions:统一按 (lesson,stage) 分组,choice 打散
function emitQuestions(lessonId, stage, items) {
  const choices = items.filter((q) => q.qtype === "choice" && q.options && q.options.length);
  placeQuota(choices);
  let seq = 1;
  for (const q of items) {
    const payload = { stem: q.stem };
    if (q.qtype === "choice") { payload.options = q.options; payload.answer_index = q.answer_index; }
    else if (q.qtype === "cloze") { payload.context = q.context; payload.blank_no = q.blank_no; payload.options = q.options; payload.answer_index = q.answer_index; }
    else { payload.answer_text = q.answer_text; }
    if (q.situation) payload.situation = q.situation;
    out.push(`INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES (${sq(lessonId)},${stage},${sq(q.gpId || null)},${sq(q.qtype)},${jb(payload)},${seq}) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;`);
    seq++;
  }
}

const counts = { lessons: lessons.length, sentences: 0, words: 0, grammar_points: 0, contrast: 0, q5: 0, q6: 0, q7: 0, q8: 0, q9: 0, q10: 0 };
for (const L of lessons) { counts.sentences += L.sentences.length; counts.words += L.words.length; counts.contrast += L.contrast.length; }
for (const ln of Object.keys(g5byLesson)) counts.grammar_points += g5byLesson[ln].points.length;

for (const L of lessons) {
  const ln = L.lesson_no;
  // 关5(题库)
  const g5q = (g5byLesson[ln]?.questions || []).map((q) => ({ ...q }));
  if (g5q.length) { emitQuestions(L.id, 5, g5q); counts.q5 += g5q.length; }
  // 关6 美语点睛小测
  const g6q = (g6byLesson[ln] || []).map((q) => ({ ...q }));
  if (g6q.length) { emitQuestions(L.id, 6, g6q); counts.q6 += g6q.length; }
  // 关7 cloze(每空一题)
  if (L.cloze && L.cloze.blanks.length) {
    const items = L.cloze.blanks.map((b) => ({ qtype: "cloze", stem: `第 ${b.blank_no} 空`, context: L.cloze.context, blank_no: b.blank_no, options: b.options, answer_index: b.answer_index }));
    // cloze 已带 answer_index(原文位置),不再打散(保持与对话语境一致)
    let seq = 1;
    for (const q of items) {
      const payload = { stem: q.stem, context: q.context, blank_no: q.blank_no, options: q.options, answer_index: q.answer_index };
      out.push(`INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES (${sq(L.id)},7,NULL,'cloze',${jb(payload)},${seq}) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET payload=EXCLUDED.payload;`);
      seq++; counts.q7++;
    }
  }
  // 关8 listening
  if (L.listening.length) { const items = L.listening.map((q) => ({ qtype: "choice", stem: q.stem, options: reorderCorrectFirst(q) })); emitQuestions(L.id, 8, items); counts.q8 += items.length; }
  // 关9 scenario
  if (L.scenario.length) { const items = L.scenario.map((q) => ({ qtype: "scenario", stem: q.situation, answer_text: q.answer_text })); emitQuestions(L.id, 9, items); counts.q9 += items.length; }
  // 关10
  if (L.guan10.length) {
    const items = L.guan10.map((q) => q.qtype === "choice" ? ({ qtype: "choice", stem: q.stem, options: reorderCorrectFirst(q) }) : ({ qtype: "transform", stem: q.stem, answer_text: q.answer_text }));
    emitQuestions(L.id, 10, items); counts.q10 += items.length;
  }
}
// 把带 answer_index 的题的正确项挪到首位(供 placeQuota 重新配额)
function reorderCorrectFirst(q) {
  const correct = q.options[q.answer_index];
  return [correct, ...q.options.filter((_, i) => i !== q.answer_index)];
}

const totalQ = counts.q5 + counts.q6 + counts.q7 + counts.q8 + counts.q9 + counts.q10;

// 分单元对账(逐单元核对底账)
function unitCounts(U) {
  const ls = lessons.filter((L) => L.unit_no === U);
  const c = { unit: U, lessons: ls.length, sentences: 0, words: 0, contrast: 0, grammar_points: 0, q5: 0, q6: 0, q7: 0, q8: 0, q9: 0, q10: 0 };
  for (const L of ls) {
    c.sentences += L.sentences.length;
    c.words += L.words.length;
    c.contrast += L.contrast.length;
    const ln = L.lesson_no;
    c.grammar_points += g5byLesson[ln]?.points.length || 0;
    c.q5 += g5byLesson[ln]?.questions.length || 0;
    c.q6 += g6byLesson[ln]?.length || 0;
    c.q7 += L.cloze?.blanks.length || 0;
    c.q8 += L.listening.length;
    c.q9 += L.scenario.length;
    c.q10 += L.guan10.length;
  }
  c.qTotal = c.q5 + c.q6 + c.q7 + c.q8 + c.q9 + c.q10;
  return c;
}
const units = [...new Set(lessons.map((L) => L.unit_no))].sort((a, b) => a - b);

// ============ 分片写出(每片独立事务、幂等;绕开 SQL Editor 单查询大小上限) ============
// 每行 INSERT 均以 VALUES ('am1_lNN'... 开头(含 gp 的 'am1_lNN_gpK');据此把行归到单元。
const unitOfLine = (line) => { const m = line.match(/VALUES \('am1_l(\d\d)/); return m ? Math.ceil(Number(m[1]) / 6) : null; };
const shards = [
  { file: "american_seed_part1_unit01-04.sql", units: [1, 2, 3, 4] },
  { file: "american_seed_part2_unit05-08.sql", units: [5, 6, 7, 8] },
  { file: "american_seed_part3_unit09-12.sql", units: [9, 10, 11, 12] },
];
mkdirSync(path.join(ROOT, "SQLAA"), { recursive: true });
let shardedLines = 0;
for (const sh of shards) {
  const set = new Set(sh.units);
  const lines = out.filter((l) => set.has(unitOfLine(l)));
  shardedLines += lines.length;
  const uc = sh.units.map(unitCounts);
  const sumL = uc.reduce((a, c) => a + c.lessons, 0);
  const sumQ = uc.reduce((a, c) => a + c.qTotal, 0);
  const sumC = uc.reduce((a, c) => a + c.contrast, 0);
  const first = sh.units[0], last = sh.units[sh.units.length - 1];
  const hdr = [
    `-- 美语课程 seed 分片:单元 ${first}-${last}(生成器 gen-unit1-seed.mjs 产出,勿手改;改源 md 后重跑)`,
    `-- 幂等:全部 ON CONFLICT,分片重跑 / 乱序补跑均安全。唯一约束由 SQLAA/american_fix_contrast_dedup.sql 预建(仅需跑一次)。`,
    `-- 预期计数:lessons ${sumL} · questions ${sumQ} · contrast ${sumC}`,
    `-- 逐单元:${uc.map((c) => `U${c.unit}=${c.qTotal}题/${c.contrast}对照`).join(" · ")}`,
    "BEGIN;",
  ];
  writeFileSync(path.join(ROOT, "SQLAA", sh.file), hdr.concat(lines, ["COMMIT;", ""]).join("\n"), "utf8");
}
// 安全网:每一行都必须归入且仅归入一个分片(无孤行、无重复)
if (shardedLines !== out.length) throw new Error(`分片行数 ${shardedLines} ≠ 总行数 ${out.length}:有 INSERT 行未匹配 am1_lNN 前缀!`);

console.log("对账(生成器实测·合计):");
console.table(counts);
console.log("questions 合计 =", totalQ, "(关5", counts.q5, "关6", counts.q6, "关7", counts.q7, "关8", counts.q8, "关9", counts.q9, "关10", counts.q10, ")");
console.log("\n分单元对账:");
console.table(units.map(unitCounts));
console.log(`\n写出 3 分片(共 ${out.length} INSERT 行):`);
for (const sh of shards) console.log("  SQLAA/" + sh.file);

// ============ Plan C 扩容包 → 独立 american_expand_unitNN.sql(幂等增补,seq 续号,不动既有) ============
const p2 = (n) => String(n).padStart(2, "0");

function expLessonBlocks(text) {
  const out = {};
  for (const m of text.matchAll(/#\s*Lesson\s*(\d+)（am1_l\d\d）([\s\S]*?)(?=\n#\s*Lesson\s*\d+|\n#\s*扩容包底账|$)/g)) {
    out[Number(m[1])] = m[2];
  }
  return out;
}
function parseExpansionLesson(block, ln, gpSeq) {
  const sec = (key) => {
    const m = block.match(new RegExp("##\\s*" + key + "[^\\n]*\\n([\\s\\S]*?)(?=\\n##\\s|$)"));
    return m ? m[1] : "";
  };
  const ext5 = []; let idx = 0;
  for (const row of tableRows(sec("关5"))) {
    if (!/^\d+$/.test(row[0])) continue;
    const gpCell = row[1].trim(), qtype = row[2].trim(), stem = row[3].trim(), optRaw = row[4].trim(), ans = row[5].trim();
    const gm = gpCell.match(/gp(\d)/);
    const gpN = gm ? Number(gm[1]) : (gpSeq ? gpSeq[idx] : null);
    const gpId = gpN ? `${pad(ln)}_gp${gpN}` : null;
    if (qtype === "transform") ext5.push({ gpId, qtype: "transform", stem, answer_text: ans });
    else { const opts = optRaw.split("/").map((s) => s.trim()).filter(Boolean); ext5.push({ gpId, qtype: "choice", stem, options: [ans, ...opts.filter((o) => o !== ans)] }); }
    idx++;
  }
  const ext7 = [];
  for (const row of tableRows(sec("关7"))) {
    if (!/^\d+$/.test(row[0])) continue;
    const blank_no = Number(row[0]), context = row[1].trim(), optRaw = row[2].trim(), ans = row[3].trim();
    const opts = optRaw.split("/").map((s) => s.trim()).filter(Boolean);
    ext7.push({ blank_no, context, options: [ans, ...opts.filter((o) => o !== ans)] });
  }
  const ext10 = [];
  for (const row of tableRows(sec("关10"))) {
    if (!(row.length >= 5 && (row[1] === "choice" || row[1] === "transform"))) continue;
    const qtype = row[1], stem = row[2].trim(), optRaw = row[3].trim(), ans = row[4].trim();
    if (qtype === "transform") ext10.push({ qtype: "transform", stem, answer_text: ans });
    else { const opts = optRaw.split("/").map((s) => s.trim()).filter(Boolean); ext10.push({ qtype: "choice", stem, options: [ans, ...opts.filter((o) => o !== ans)] }); }
  }
  return { ext5, ext7, ext10 };
}
function emitExpansion(cfg) {
  if (!cfg.text) { console.log(`\n扩容单元${cfg.unit}: 无 md,跳过`); return; }
  const blocks = expLessonBlocks(cfg.text);
  const lessonsInUnit = lessons.filter((L) => L.unit_no === cfg.unit);
  const lines = [
    `-- 美语课程 扩容包 单元${cfg.unit}(生成器产出,勿手改)。幂等:ON CONFLICT,只 INSERT 增补行(seq 续号),既有题零改动。`,
    `-- 落 american_questions 关5/关7/关10。seq 接既有之后,可独立跑(不依赖重跑基础 seed)。`,
    "BEGIN;",
  ];
  const gate = []; const cnt = { q5: 0, q7: 0, q10: 0 }; const poolRep = [];
  _s = (0x9e3779b9 ^ (cfg.unit * 0x6d2b79f5)) | 0; // 每单元重置 PRNG → 各 expand 文件独立可复现
  const emitQ = (lid, stage, gpId, qtype, payload, seq) =>
    lines.push(`INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES (${sq(lid)},${stage},${sq(gpId)},${sq(qtype)},${jb(payload)},${seq}) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;`);
  for (const L of lessonsInUnit) {
    const ln = L.lesson_no;
    const ext = blocks[ln] ? parseExpansionLesson(blocks[ln], ln, cfg.gpSeq?.[ln]) : null;
    if (!ext) { gate.push(`L${ln}: 扩容包缺该课块`); continue; }
    const base5 = g5byLesson[ln]?.questions.length || 0;
    const base7 = L.cloze?.blanks.length || 0;
    const base10 = L.guan10.length;
    const existingGp = new Set((g5byLesson[ln]?.points || []).map((p) => p.id));
    // 关5(考点门禁 + 打散)
    placeQuota(ext.ext5.filter((q) => q.qtype === "choice"));
    let seq = base5;
    for (const q of ext.ext5) {
      if (!q.gpId) gate.push(`L${ln} 关5 第${seq - base5 + 1}题: 挂不到考点(gpSeq 缺或题数不符)`);
      else if (!existingGp.has(q.gpId)) gate.push(`L${ln} 关5: 考点 ${q.gpId} 不在既有[${[...existingGp].join(",")}]`);
      seq++;
      const payload = q.qtype === "choice" ? { stem: q.stem, options: q.options, answer_index: q.answer_index } : { stem: q.stem, answer_text: q.answer_text };
      emitQ(L.id, 5, q.gpId, q.qtype, payload, seq); cnt.q5++;
    }
    // 关7(挖空池增补,打散避免答案全 index0)
    placeQuota(ext.ext7);
    seq = base7;
    for (const b of ext.ext7) {
      seq++;
      emitQ(L.id, 7, null, "cloze", { stem: `第 ${b.blank_no} 空`, context: b.context, blank_no: b.blank_no, options: b.options, answer_index: b.answer_index }, seq);
      cnt.q7++;
    }
    poolRep.push(`L${ln}=${base7 + ext.ext7.length}`);
    // 关10
    placeQuota(ext.ext10.filter((q) => q.qtype === "choice"));
    seq = base10;
    for (const q of ext.ext10) {
      seq++;
      const payload = q.qtype === "choice" ? { stem: q.stem, options: q.options, answer_index: q.answer_index } : { stem: q.stem, answer_text: q.answer_text };
      emitQ(L.id, 10, null, q.qtype, payload, seq); cnt.q10++;
    }
  }
  if (gate.length) {
    console.log(`\n❌ 扩容单元${cfg.unit} 考点门禁失败,停止写出(报差异,不猜):`);
    for (const g of gate) console.log("   " + g);
    throw new Error(`扩容单元${cfg.unit} 门禁未过`);
  }
  lines.push("COMMIT;");
  writeFileSync(path.join(ROOT, "SQLAA", `american_expand_unit${p2(cfg.unit)}.sql`), lines.join("\n") + "\n", "utf8");
  const baseTot = unitCounts(cfg.unit).qTotal;
  const add = cnt.q5 + cnt.q7 + cnt.q10;
  console.log(`\n扩容单元${cfg.unit}: 关5+${cnt.q5} · 关7+${cnt.q7} · 关10+${cnt.q10} = +${add}`);
  console.log(`  关7 池总空数: ${poolRep.join(" / ")}`);
  console.log(`  入库后单元${cfg.unit}总题 = ${baseTot} + ${add} = ${baseTot + add}`);
  console.log(`  写出 SQLAA/american_expand_unit${p2(cfg.unit)}.sql`);
}
for (const cfg of EXPANSIONS) emitExpansion(cfg);
