// 课本 PDF 渲染器。用法: node scripts/american/pdf/build-book.mjs <book> [unit|all]   例: node ... 2 all
// 读 data/book<N>/unitNN.json → 输出 out/book<N>-full.html(自带 print CSS)。
// 再用 Chrome headless --print-to-pdf 出 PDF。零改库、忠实渲染。单元数按该册实际 data 文件动态,不硬编。
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const book = Number(process.argv[2] || "0");
if (![2, 3, 4].includes(book)) { console.error("用法: build-book.mjs <2|3|4> [unit|all]"); process.exit(1); }
const arg = process.argv[3] || "all";
const isAll = arg === "all";
const DATADIR = path.join(ROOT, `scripts/american/pdf/data/book${book}`);
const OUT = path.join(ROOT, "scripts/american/pdf/out");
fs.mkdirSync(OUT, { recursive: true });
// 单元数据驱动:all 模式读该册 data 目录下实际存在的 unitNN.json(第二/三册=12、第四册=8),不硬编 12。
const availUnits = fs.readdirSync(DATADIR).filter((f) => /^unit\d+\.json$/.test(f)).map((f) => Number(f.match(/\d+/)[0])).sort((a, b) => a - b);
const unitNos = isAll ? availUnits : [Number(arg)];
const UNITS = unitNos.map((n) => JSON.parse(fs.readFileSync(path.join(DATADIR, `unit${String(n).padStart(2, "0")}.json`), "utf8")));

const CN_UNIT = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"];
const COURSE = "现代版美语新概念英语";
const VOL = ["", "第一册", "第二册", "第三册", "第四册"][book] || `第${book}册`;

// ---------- 工具 ----------
// Noto SC 无国旗字形(🇺🇸/🇬🇧 会掉回 US/GB 字母),统一剥除;美/英标签已用中文文字。
const esc = (s) => String(s ?? "").replace(/[\u{1F1E6}-\u{1F1FF}]/gu, "").replace(/（\s*美语点睛\s*）/g, "（美语点睛）").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// 行内格式:**粗** ~~删~~ `码`
function inline(s) {
  let x = esc(s);
  x = x.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  x = x.replace(/~~([^~]+)~~/g, "<del>$1</del>");
  x = x.replace(/`([^`]+)`/g, "<code>$1</code>");
  return x;
}
// body_md → HTML(支持 ### 标题 / 表格 / - 列表 / --- 分隔 / 段落;⚠️ 行做提示框)
function md(src) {
  const lines = String(src || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const out = [];
  let i = 0;
  const flushList = (buf) => { if (buf.length) { out.push("<ul>" + buf.map((t) => `<li>${inline(t)}</li>`).join("") + "</ul>"); buf.length = 0; } };
  let list = [];
  while (i < lines.length) {
    let ln = lines[i];
    const t = ln.trim();
    if (t === "") { flushList(list); i++; continue; }
    if (/^（Grammar）$/.test(t) || /^\(Grammar\)$/.test(t)) { i++; continue; } // 去掉冗余标记
    if (/^#{1,6}\s+/.test(t)) {
      flushList(list);
      const m = t.match(/^(#{1,6})\s+(.*)$/);
      const lvl = Math.min(m[1].length + 2, 6); // ### → h5 视觉层级
      out.push(`<h${lvl} class="gh">${inline(m[2])}</h${lvl}>`);
      i++; continue;
    }
    if (/^---+$/.test(t)) { flushList(list); out.push('<hr class="gsep"/>'); i++; continue; }
    if (/^[-*]\s+/.test(t)) { list.push(t.replace(/^[-*]\s+/, "")); i++; continue; }
    // 表格
    if (/^\|.*\|$/.test(t) && i + 1 < lines.length && /^\|[\s:|-]+\|$/.test(lines[i + 1].trim())) {
      flushList(list);
      const cells = (row) => row.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
      const head = cells(t);
      i += 2;
      const rows = [];
      while (i < lines.length && /^\|.*\|$/.test(lines[i].trim())) { rows.push(cells(lines[i].trim())); i++; }
      out.push(
        '<table class="gtbl"><thead><tr>' + head.map((h) => `<th>${inline(h)}</th>`).join("") + "</tr></thead><tbody>" +
        rows.map((r) => "<tr>" + r.map((c) => `<td>${inline(c)}</td>`).join("") + "</tr>").join("") + "</tbody></table>"
      );
      continue;
    }
    flushList(list);
    // ⚠️ 提示
    if (/^⚠️/.test(t)) { out.push(`<p class="gwarn">${inline(t.replace(/^⚠️\s*/, ""))}</p>`); i++; continue; }
    out.push(`<p>${inline(t)}</p>`);
    i++;
  }
  flushList(list);
  return out.join("\n");
}

// ---------- 各区块 ----------
// 课文中文已带「说话人：」前缀,英文另配 speaker 标签
function textBlock(L) {
  const rows = L.sentences.map((s) => {
    const sp = s.speaker ? `<span class="sp">${esc(s.speaker)}</span>` : "";
    return `<div class="line"><div class="en">${sp}${esc(s.text_en)}</div><div class="cn">${esc(s.text_cn)}</div></div>`;
  }).join("");
  const pl = L.prelisten_question;
  const plBox = pl && pl.q
    ? `<div class="prelisten"><span class="pl-tag">听前思考</span> ${esc(pl.q)}
       <span class="pl-opts">${(pl.options || []).filter((o) => o && o !== "选项：").map((o, i) => `${String.fromCharCode(65 + i)}. ${esc(o)}`).join("　")}</span></div>`
    : "";
  return `<section class="text"><h3 class="sec">课文 Text</h3>${plBox}<div class="dialog">${rows}</div></section>`;
}

function vocabBlock(L) {
  if (!L.words.length) return "";
  const rows = L.words.map((w) =>
    `<tr><td class="vw">${esc(w.word)}</td><td class="vi">${esc(w.ipa)}</td><td class="vp">${esc(w.pos)}</td><td class="vm">${esc(w.meaning_cn)}</td><td class="ve">${esc(w.example)}</td></tr>`
  ).join("");
  return `<section class="vocab"><h3 class="sec">生词 New Words</h3><table class="vtbl"><thead><tr><th>单词</th><th>音标</th><th>词性</th><th>释义</th><th>例句</th></tr></thead><tbody>${rows}</tbody></table></section>`;
}

function contrastBlock(L) {
  if (!L.contrast.length) return "";
  const cards = L.contrast.map((c) =>
    `<div class="ccard"><div class="cus"><span class="lbl lbus">美式</span>${esc(c.us)}</div><div class="cuk"><span class="lbl lbuk">英式</span>${esc(c.uk)}</div>${c.note_cn ? `<div class="cnote">${esc(c.note_cn)}</div>` : ""}</div>`
  ).join("");
  return `<section class="contrast"><h3 class="sec">美英对照 US vs UK</h3><div class="cwrap">${cards}</div></section>`;
}

function grammarBlock(L) {
  if (!L.grammar_points.length) return "";
  // 同一课的 grammar_points 共享同一份 body_md(整课语法写一次挂到每个点),按正文去重只渲染一次。
  const seen = new Set();
  const bodies = [];
  for (const g of L.grammar_points) {
    const key = (g.body_md || "").trim();
    if (seen.has(key)) continue;
    seen.add(key);
    bodies.push(md(g.body_md));
  }
  const names = L.grammar_points.map((g) => esc(g.name)).join("　·　");
  return `<section class="grammar"><h3 class="sec">语法讲解 Grammar</h3><div class="gptags">语法点：${names}</div>${bodies.map((b) => `<div class="gp">${b}</div>`).join("")}</section>`;
}

// 练习:选择(关5)+ 填空(关7),答案放本课末答案条
function exerciseBlock(L) {
  const byStage = {};
  for (const q of L.questions) (byStage[q.stage] ??= []).push(q);
  const choice = (byStage[5] || []).filter((q) => q.qtype === "choice");
  const cloze = (byStage[7] || []).filter((q) => q.qtype === "cloze");
  const ansKey = [];
  let n = 0;
  const parts = [];
  if (choice.length) {
    const items = choice.map((q) => {
      n++;
      ansKey.push(`${n}.${String.fromCharCode(65 + q.payload.answer_index)}`);
      const opts = q.payload.options.map((o, i) => `<span class="opt">${String.fromCharCode(65 + i)}. ${esc(o)}</span>`).join("");
      return `<li class="ex"><span class="exq">${inline(q.payload.stem)}</span><span class="exopts">${opts}</span></li>`;
    }).join("");
    parts.push(`<div class="exgrp"><h4 class="exh">一、选择填空</h4><ol class="exlist">${items}</ol></div>`);
  }
  if (cloze.length) {
    // 填空按对话分组(同 context 只显示一次),空号提示选项
    const seen = new Set();
    const blocks = [];
    for (const q of cloze) {
      const ctx = q.payload.context;
      if (!seen.has(ctx)) {
        seen.add(ctx);
        blocks.push({ ctx, blanks: [] });
      }
      blocks[blocks.length - 1].blanks.push(q);
    }
    const rendered = blocks.map((b) => {
      const dlg = esc(b.ctx).replace(/\n/g, "<br/>").replace(/___(\d+)___/g, '<span class="blank">（$1）____</span>');
      const opts = b.blanks.map((q) => {
        n++;
        ansKey.push(`${n}.${String.fromCharCode(65 + q.payload.answer_index)}`);
        return `<div class="clz"><span class="clzn">${q.payload.blank_no}.</span> ${q.payload.options.map((o, i) => `<span class="opt">${String.fromCharCode(65 + i)}. ${esc(o)}</span>`).join("")}</div>`;
      }).join("");
      return `<div class="clzblock"><div class="clzctx">${dlg}</div>${opts}</div>`;
    }).join("");
    parts.push(`<div class="exgrp"><h4 class="exh">二、对话填空</h4>${rendered}</div>`);
  }
  if (!parts.length) return "";
  return `<section class="exercise"><h3 class="sec">练习 Exercises</h3>${parts.join("")}<div class="anskey"><span class="akt">参考答案</span> ${ansKey.join("　")}</div></section>`;
}

function lessonPage(L) {
  return `<article class="lesson">
    <header class="lhead">
      <div class="lno">Lesson ${L.lesson_no}</div>
      <h2 class="lten">${esc(L.title_en)}</h2>
      <div class="ltcn">${esc(L.title_cn)}</div>
      <div class="lmeta">
        ${L.scene ? `<span class="lscene">📍 ${esc(L.scene)}</span>` : ""}
        ${L.grammar_focus ? `<span class="lfocus">语法重点：${esc(L.grammar_focus)}</span>` : ""}
      </div>
    </header>
    ${textBlock(L)}
    ${vocabBlock(L)}
    ${contrastBlock(L)}
    ${grammarBlock(L)}
    ${exerciseBlock(L)}
  </article>`;
}

// ---------- 页面骨架 ----------
const cover = `<section class="cover">
  <div class="cv-vol">${VOL}</div>
  <h1 class="cv-title">${COURSE}</h1>
  <div class="cv-sub">地道美语 · 从零开始</div>
  <div class="cv-rule"></div>
  <div class="cv-scale">学完四册，托福雅思高分不是问题</div>
  <div class="cv-foot">American English · New Concept</div>
</section>`;

const unitDivider = (u) => `<section class="udiv">
  <div class="ud-cn">单元${CN_UNIT[u.unit_no]}</div>
  <div class="ud-en">Unit ${u.unit_no}</div>
  <ul class="ud-toc">
    ${u.lessons.map((L) => `<li><span class="ud-l">Lesson ${L.lesson_no}</span> <span class="ud-t">${esc(L.title_en)}</span> <span class="ud-c">${esc(L.title_cn)}</span></li>`).join("")}
  </ul>
</section>`;

// 整册目录(仅全量模式):列 12 单元 + 每单元起始课
const bookToc = `<section class="btoc">
  <h2 class="btoc-h">目录 Contents</h2>
  <ul class="btoc-list">
    ${UNITS.map((u) => `<li><span class="btoc-u">单元${CN_UNIT[u.unit_no]}</span><span class="btoc-r">Lesson ${u.lessons[0].lesson_no}–${u.lessons[u.lessons.length - 1].lesson_no}</span><span class="btoc-t">${esc(u.lessons[0].title_cn)} …</span></li>`).join("")}
  </ul>
</section>`;

const CSS = `
:root{ --ink:#1a1a1a; --muted:#666; --line:#d8d8d8; --accent:#c0392b; --accent2:#2c5f8a; --soft:#f6f4ef; }
*{ box-sizing:border-box; }
@page{ size:A4; margin:18mm 16mm 20mm; }
@page{ @bottom-center{ content:counter(page); font-family:"Noto Serif SC"; font-size:9pt; color:#999; } }
html,body{ margin:0; padding:0; }
body{ font-family:"Noto Serif SC","Source Han Serif SC",serif; color:var(--ink); font-size:10.5pt; line-height:1.7; }
h1,h2,h3,h4,h5,h6{ font-family:"Noto Sans SC",sans-serif; }

/* 封面 */
.cover{ height:calc(100vh - 40mm); display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; page-break-after:always; }
.cv-vol{ font-size:16pt; letter-spacing:.5em; color:var(--accent); margin-bottom:24pt; }
.cv-title{ font-size:34pt; font-weight:900; margin:0; line-height:1.35; }
.cv-sub{ font-size:15pt; color:var(--muted); margin-top:16pt; letter-spacing:.2em; }
.cv-rule{ width:80pt; height:3pt; background:var(--accent); margin:32pt 0; }
.cv-scale{ font-size:12pt; color:var(--accent2); }
.cv-foot{ position:absolute; bottom:0; font-family:"Noto Sans SC"; font-size:10pt; color:#aaa; letter-spacing:.3em; }

/* 单元分隔页 */
.udiv{ page-break-before:always; page-break-after:always; padding-top:40pt; }
.ud-cn{ font-family:"Noto Sans SC"; font-size:30pt; font-weight:900; color:var(--accent); }
.ud-en{ font-size:14pt; color:var(--muted); letter-spacing:.3em; margin-bottom:24pt; }
.ud-toc{ list-style:none; padding:0; margin-top:20pt; }
.ud-toc li{ padding:8pt 0; border-bottom:1px dashed var(--line); }
.ud-l{ font-family:"Noto Sans SC"; font-weight:700; color:var(--accent2); margin-right:10pt; }
.ud-t{ font-weight:600; }
.ud-c{ color:var(--muted); margin-left:6pt; }

/* 课页 */
.lesson{ page-break-before:always; }
.lhead{ border-bottom:2.5pt solid var(--accent); padding-bottom:8pt; margin-bottom:12pt; }
.lno{ font-family:"Noto Sans SC"; font-size:11pt; font-weight:700; color:var(--accent); letter-spacing:.15em; }
.lten{ font-size:18pt; margin:2pt 0 0; }
.ltcn{ font-size:13pt; color:var(--muted); margin-top:2pt; }
.lmeta{ margin-top:8pt; font-size:9.5pt; }
.lscene{ display:inline-block; background:var(--soft); padding:2pt 8pt; border-radius:3pt; margin-right:8pt; }
.lfocus{ color:var(--accent2); }

.sec{ font-size:12.5pt; color:#fff; background:var(--accent2); display:inline-block; padding:2pt 12pt; border-radius:3pt; margin:16pt 0 8pt; }
section{ page-break-inside:auto; }

/* 课文 */
.dialog{ }
.line{ margin:5pt 0; padding-left:8pt; border-left:2pt solid var(--soft); }
.line .en{ font-family:"Noto Sans SC"; font-size:11pt; }
.line .sp{ font-weight:700; color:var(--accent2); margin-right:5pt; }
.line .cn{ color:var(--muted); font-size:9.5pt; margin-top:1pt; }
.prelisten{ background:var(--soft); border-radius:4pt; padding:6pt 10pt; margin-bottom:10pt; font-size:10pt; }
.pl-tag{ font-family:"Noto Sans SC"; font-weight:700; color:var(--accent); margin-right:6pt; }
.pl-opts{ display:block; margin-top:3pt; color:var(--muted); font-size:9.5pt; }

/* 生词 */
.vtbl,.gtbl{ width:100%; border-collapse:collapse; font-size:9.5pt; margin:4pt 0; }
.vtbl th,.vtbl td,.gtbl th,.gtbl td{ border:1px solid var(--line); padding:4pt 6pt; text-align:left; vertical-align:top; }
.vtbl thead th,.gtbl thead th{ background:var(--soft); font-family:"Noto Sans SC"; font-weight:700; }
.vtbl .vw{ font-family:"Noto Sans SC"; font-weight:700; white-space:nowrap; }
.vtbl .vi{ font-family:"Noto Serif SC"; color:var(--accent2); white-space:nowrap; }
.vtbl .vp{ color:var(--muted); white-space:nowrap; }
.vtbl .ve{ font-style:italic; color:#555; }
.vtbl tbody tr:nth-child(even){ background:#fafafa; }

/* 对照卡 */
.cwrap{ display:flex; flex-wrap:wrap; gap:8pt; }
.ccard{ width:calc(50% - 4pt); border:1px solid var(--line); border-radius:5pt; padding:6pt 9pt; page-break-inside:avoid; }
.cus{ font-family:"Noto Sans SC"; font-weight:700; }
.cuk{ color:var(--muted); margin-top:2pt; }
.lbl{ display:inline-block; font-family:"Noto Sans SC"; font-size:8pt; font-weight:700; padding:1pt 5pt; border-radius:3pt; margin-right:6pt; vertical-align:1pt; }
.lbus{ background:var(--accent); color:#fff; }
.lbuk{ background:#e8e4dc; color:#7a6f5f; }
.cnote{ font-size:9pt; color:#888; margin-top:3pt; border-top:1px dashed var(--line); padding-top:3pt; }

/* 语法 */
.gp{ margin-bottom:10pt; }
.gptags{ font-family:"Noto Sans SC"; font-size:9.5pt; color:var(--accent2); background:var(--soft); padding:4pt 10pt; border-radius:4pt; margin-bottom:6pt; }
.gh{ margin:8pt 0 3pt; font-size:11pt; }
.grammar p{ margin:3pt 0; }
.grammar del{ color:#c0392b; }
.gwarn{ background:#fff7e6; border-left:3pt solid #e8a33d; padding:4pt 8pt; font-size:9.5pt; }
.gsep{ border:0; border-top:1px dashed var(--line); margin:8pt 0; }
code{ background:var(--soft); padding:0 3pt; border-radius:2pt; font-family:"Noto Sans SC"; }

/* 练习 */
.exh{ font-size:11pt; color:var(--accent2); margin:8pt 0 4pt; }
.exlist{ margin:0; padding-left:20pt; }
.ex{ margin:4pt 0; page-break-inside:avoid; }
.exq{ font-family:"Noto Sans SC"; }
.exopts{ display:block; margin-top:2pt; font-size:9.5pt; }
.opt{ display:inline-block; margin-right:12pt; }
.clzblock{ margin:6pt 0; page-break-inside:avoid; }
.clzctx{ background:var(--soft); border-radius:4pt; padding:6pt 10pt; font-family:"Noto Sans SC"; font-size:10pt; }
.blank{ color:var(--accent); font-weight:700; }
.clz{ margin:3pt 0 3pt 8pt; font-size:9.5pt; }
.clzn{ font-weight:700; margin-right:4pt; }
.anskey{ margin-top:10pt; padding:5pt 10pt; background:#f0f4f8; border-radius:4pt; font-size:9pt; color:#555; }
.akt{ font-family:"Noto Sans SC"; font-weight:700; color:var(--accent2); margin-right:6pt; }

/* 整册目录 */
.btoc{ page-break-before:always; page-break-after:always; padding-top:24pt; }
.btoc-h{ font-size:20pt; color:var(--accent); border-bottom:2pt solid var(--accent); padding-bottom:6pt; }
.btoc-list{ list-style:none; padding:0; margin-top:14pt; }
.btoc-list li{ display:flex; align-items:baseline; padding:7pt 0; border-bottom:1px dashed var(--line); }
.btoc-u{ font-family:"Noto Sans SC"; font-weight:900; color:var(--accent2); width:70pt; }
.btoc-r{ font-family:"Noto Sans SC"; color:var(--muted); width:110pt; }
.btoc-t{ flex:1; }
`;

const title = isAll ? `${COURSE} ${VOL}` : `${COURSE} ${VOL} 单元${CN_UNIT[UNITS[0].unit_no]}`;
const body = UNITS.map((u) => `${unitDivider(u)}\n${u.lessons.map(lessonPage).join("\n")}`).join("\n");
const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>${title}</title><style>${CSS}</style></head><body>
${cover}
${isAll ? bookToc : ""}
${body}
</body></html>`;

const base = isAll ? `book${book}-full` : `book${book}-unit${String(UNITS[0].unit_no).padStart(2, "0")}`;
const htmlPath = path.join(OUT, `${base}.html`);
fs.writeFileSync(htmlPath, html, "utf8");
const totalLessons = UNITS.reduce((s, u) => s + u.lessons.length, 0);
console.log("HTML →", htmlPath, `(${(html.length / 1024).toFixed(0)} KB, ${UNITS.length} 单元 / ${totalLessons} 课)`);
