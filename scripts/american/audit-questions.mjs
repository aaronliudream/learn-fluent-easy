// 美语课程题库机审(anon 只读,零改库)。用法: node scripts/american/audit-questions.mjs
// 产出 scripts/american/audit-out/audit_report.md(分级:确定错误/疑似/flag) + unitNN.md ×12(供网页版语义复审)。
// 六项:①关7逐字核原文+答案位+干扰项不撞原词 ②choice结构 ③超纲扫描 ④全库题干查重 ⑤transform答案风险 ⑥导出。
// 只报不改;修复走 Aaron 拍板 + 独立 SQL。
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const env = fs.readFileSync(".env", "utf8");
const g = (k) => env.split("\n").find((l) => l.startsWith(k + "="))?.slice(k.length + 1).trim().replace(/^["']|["']$/g, "");
const SUP = g("VITE_SUPABASE_URL"), KEY = g("VITE_SUPABASE_PUBLISHABLE_KEY");

async function all(table, query) {
  const out = [];
  for (let from = 0; ; from += 1000) {
    const r = await fetch(`${SUP}/rest/v1/${table}?${query}`, {
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, Range: `${from}-${from + 999}` },
    });
    const rows = await r.json();
    if (!Array.isArray(rows)) throw new Error(table + ": " + JSON.stringify(rows));
    out.push(...rows);
    if (rows.length < 1000) break;
  }
  return out;
}

const unitOf = (lid) => Math.ceil(Number(String(lid).match(/am1_l(\d+)/)?.[1]) / 6);
const lnOf = (lid) => Number(String(lid).match(/am1_l(\d+)/)?.[1]);
const norm = (s) => (s || "").toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, " ").trim();
const stripSpeaker = (s) => (s || "").replace(/^[A-Z][A-Za-z .&']*:\s*/, "");
const tokens = (s) => (s || "").toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g) || [];

// 功能词白名单(超纲豁免)
const FUNC = new Set(`a an the this that these those i you he she it we they me him her us them my your his its
our their mine yours hers ours theirs myself yourself himself herself itself ourselves yourselves themselves
is am are was were be been being do does did done have has had having will would shall should can could may might must
to of in on at for with by from up down out off over under above below about into onto around through across near next
and or but so if then than as not no nor yes here there now today tonight tomorrow yesterday too very just only also
all any some none one two three four five six seven eight nine ten first second third what when where who which why how
whose whom s t m re ve ll d o' please ok okay oh ha hmm hey well yeah yep yay ugh wow shh aw aww dude ma'am sir mr mrs ms dr
let lets go going get got getting this's there's here's what's that's it's i'm you're we're they're he's she's don't doesn't
didn't isn't aren't wasn't weren't won't can't couldn't wouldn't shouldn't haven't hasn't hadn't mustn't i've you've we've
they've i'll you'll we'll they'll i'd you'd we'd they'd`.split(/\s+/).filter(Boolean));

const findings = { err: [], sus: [], flag: [] };
const add = (sev, code, lid, qid, msg) => findings[sev].push({ code, unit: unitOf(lid), lid, qid, msg });

const [Q, S, W, L] = await Promise.all([
  all("american_questions", "select=*&order=lesson_id.asc,stage.asc,seq.asc"),
  all("american_sentences", "select=lesson_id,seq,text_en,text_cn,speaker&order=lesson_id.asc,seq.asc"),
  all("american_words", "select=lesson_id,word&order=lesson_id.asc"),
  all("american_lessons", "select=id,unit_no,lesson_no,title_cn&order=unit_no.asc,lesson_no.asc"),
]);
console.log(`拉取:题${Q.length} 句${S.length} 词${W.length} 课${L.length}`);

// 按课索引
const sentByLesson = {}; for (const s of S) (sentByLesson[s.lesson_id] ??= []).push(s);
const wordsByLesson = {}; for (const w of W) (wordsByLesson[w.lesson_id] ??= []).push(w.word);

// 累积词表(按 unit/lesson 顺序):lessonId -> Set(截至该课已教 token)。
// 已教 = 词汇表字段 + 课文原文(sentences text_en) —— 课文里出现的词同样属已教范围。
const orderedLids = L.map((l) => l.id);
const cumVocab = {}; const seen = new Set();
for (const lid of orderedLids) {
  for (const w of (wordsByLesson[lid] || [])) for (const t of tokens(w)) seen.add(t);
  for (const s of (sentByLesson[lid] || [])) for (const t of tokens(s.text_en)) seen.add(t);
  cumVocab[lid] = new Set(seen); // 快照(含该课)
}

// 全局专有名词白名单(超纲豁免):课文任一句"非句首大写词" + speaker 名 => 人名/地名,全局小写归一豁免。
const PROPER = new Set();
for (const s of S) {
  if (s.speaker) PROPER.add(String(s.speaker).toLowerCase().replace(/[’']/g, "'").trim());
  const ws = stripSpeaker(s.text_en || "").split(/\s+/);
  ws.forEach((w, i) => {
    const m = w.match(/^[A-Z][A-Za-z'’-]+/);
    if (m && i > 0) PROPER.add(m[0].toLowerCase().replace(/[’']/g, "'"));
  });
}

// ============ ① 关7 cloze ============
// 按 blank_no 定位目标空(基础"___N___"/扩容单"___"),抽该空所在句子,填答案后按序子串核课文。
const SENT = ""; // 同句其他空的通配哨兵
const seqMatch = (cs, parts) => { let pos = 0; for (const p of parts) { const i = cs.indexOf(p, pos); if (i < 0) return false; pos = i + p.length; } return true; };
const clozes = Q.filter((q) => q.qtype === "cloze" || q.stage === 7);
for (const q of clozes) {
  const p = q.payload || {};
  const opts = p.options || [];
  const ai = p.answer_index;
  if (!Array.isArray(opts) || opts.length < 2) { add("err", "C7-结构", q.lesson_id, q.id, `关7选项异常(${opts.length})`); continue; }
  if (typeof ai !== "number" || ai < 0 || ai >= opts.length) { add("err", "C7-idx", q.lesson_id, q.id, `answer_index越界 ${ai}/${opts.length}`); continue; }
  const ans = opts[ai];
  const ctx = p.context || "";
  if (!ctx || !ctx.includes("___")) { add("sus", "C7-无原句", q.lesson_id, q.id, `context 缺失或无空位: "${ctx.slice(0,40)}"`); continue; }
  // 逐行去说话人 → 拼回 → 切句 → 找含目标空的句子
  const clean = ctx.split(/\n+/).map(stripSpeaker).join(" ");
  const numbered = new RegExp(`_{2,}${p.blank_no}_{2,}`);
  const marker = numbered.test(clean) ? `___${p.blank_no}___` : "___";
  const sentsInCtx = clean.split(/(?<=[.?!])\s+/);
  const targetRaw = sentsInCtx.find((s) => s.includes(marker));
  const courseSents = (sentByLesson[q.lesson_id] || []).map((s) => norm(stripSpeaker(s.text_en)));
  if (targetRaw) {
    // 目标空填答案,同句其他空→哨兵
    const filledSent = targetRaw.replace(marker, ans).replace(/_{2,}(?:\d+_{2,})?/g, SENT);
    // 子串匹配:按未知空切段,逐段去首尾空格与结尾标点,顺序子串命中任一原文行即通过
    const parts = norm(filledSent).split(SENT).map((x) => x.replace(/^\s+|[\s.?!,]+$/g, "").trim()).filter(Boolean);
    const ok = parts.length > 0 && courseSents.some((cs) => seqMatch(cs, parts));
    if (!ok) add("sus", "C7-未匹配原句", q.lesson_id, q.id, `空${p.blank_no}填"${ans}"后无逐字匹配(疑精简/改写/错词): "${norm(targetRaw).slice(0,55)}"`);
  } else {
    add("sus", "C7-定位失败", q.lesson_id, q.id, `context 内找不到空${p.blank_no}标记`);
  }
  // 干扰项不得与答案同词
  const dups = opts.filter((o, i) => i !== ai && norm(o) === norm(ans));
  if (dups.length) add("err", "C7-干扰撞答案", q.lesson_id, q.id, `干扰项与答案同词: ${ans}`);
}

// ============ ② choice 结构 ============
const choices = Q.filter((q) => q.qtype === "choice");
for (const q of choices) {
  const p = q.payload || {}; const opts = p.options || []; const ai = p.answer_index;
  if (!Array.isArray(opts) || opts.length !== 4) add("sus", "CH-选项数", q.lesson_id, q.id, `选项数=${opts.length}(非4) | ${String(p.stem).slice(0,40)}`);
  const set = new Set(opts.map(norm));
  if (set.size !== opts.length) add("err", "CH-重复项", q.lesson_id, q.id, `选项有重复 | ${opts.join(" / ")}`);
  if (typeof ai !== "number" || ai < 0 || ai >= opts.length) add("err", "CH-idx", q.lesson_id, q.id, `answer_index越界 ${ai}/${opts.length}`);
}

// ============ ③ 超纲扫描 ============
for (const q of Q) {
  const p = q.payload || {};
  const vocab = cumVocab[q.lesson_id]; if (!vocab) continue;
  const parts = [p.stem, ...(p.options || []), p.answer_text, p.context].filter(Boolean).join(" ");
  // 去掉中文,只看英文;跳过题干里明显是"考点描述"的中文题
  const oov = [];
  for (const raw of (parts.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g) || [])) {
    const t = raw.toLowerCase();
    if (FUNC.has(t) || vocab.has(t) || PROPER.has(t)) continue;
    // 轻量词形还原:去 -s/-ed/-ing/-es/-er/-est/-ly
    const bases = [t.replace(/s$/,""), t.replace(/es$/,""), t.replace(/ed$/,""), t.replace(/d$/,""), t.replace(/ing$/,""), t.replace(/ing$/,"e"), t.replace(/ly$/,""), t.replace(/er$/,""), t.replace(/est$/,""), t.replace(/ies$/,"y")];
    if (bases.some((b) => vocab.has(b))) continue;
    // 句首/专有名词(非题干起始的大写词)豁免:视为人名地名
    if (/^[A-Z]/.test(raw) && raw !== parts.trim().split(/\s+/)[0]) continue;
    oov.push(raw);
  }
  const uniq = [...new Set(oov)];
  if (uniq.length) add("flag", "超纲", q.lesson_id, q.id, `疑超纲实词: ${uniq.slice(0,8).join(", ")}${uniq.length>8?"…":""} | stage${q.stage}`);
}

// ============ ④ 全库题干查重 ============
// cloze 题干是占位"第 N 空",真内容在 context → cloze 用 context 查重;其余用 stem。
const stemMap = {};
for (const q of Q) {
  const p = q.payload || {};
  const key = (q.qtype === "cloze" || q.stage === 7) ? norm(p.context) + "|#" + (p.blank_no ?? "") : norm(p.stem);
  if (!key) continue;
  (stemMap[key] ??= []).push(q);
}
for (const [stem, arr] of Object.entries(stemMap)) {
  if (arr.length > 1) {
    const where = arr.map((q) => `${q.lesson_id}/s${q.stage}/seq${q.seq}`).join(" , ");
    add("sus", "查重", arr[0].lesson_id, arr.map((q)=>q.id).join(","), `题干/原句重复×${arr.length}: "${stem.slice(0,45)}" @ ${where}`);
  }
}

// ============ ⑤ transform 答案判定(放宽后复扫) ============
// 判定放宽已落地 src/lib/american/answerEquiv.ts:缩写≡全写 + that 可省 + 大小写/末标点/空白无关。
// 此处镜像同规则复扫:对每个 transform 答案生成"另一种合理写法"(缩写→全写 + 删 that),
// 若等价函数判为相等 → 已被放宽覆盖,不再报风险;仅当仍判不等(疑非缩写/that 类差异)才列入残余交语义复审。
const T_FOLD = [
  [/\bcan not\b/g, "can't"], [/\bcannot\b/g, "can't"],
  [/\bdo not\b/g, "don't"], [/\bdoes not\b/g, "doesn't"], [/\bdid not\b/g, "didn't"],
  [/\bis not\b/g, "isn't"], [/\bare not\b/g, "aren't"], [/\bwas not\b/g, "wasn't"], [/\bwere not\b/g, "weren't"],
  [/\bwill not\b/g, "won't"], [/\bwould not\b/g, "wouldn't"], [/\bshould not\b/g, "shouldn't"],
  [/\bcould not\b/g, "couldn't"], [/\bmust not\b/g, "mustn't"], [/\bneed not\b/g, "needn't"],
  [/\bhave not\b/g, "haven't"], [/\bhas not\b/g, "hasn't"], [/\bhad not\b/g, "hadn't"], [/\blet us\b/g, "let's"],
  [/\bi am\b/g, "i'm"], [/\byou are\b/g, "you're"], [/\bwe are\b/g, "we're"], [/\bthey are\b/g, "they're"],
  [/\bit is\b/g, "it's"], [/\bhe is\b/g, "he's"], [/\bshe is\b/g, "she's"], [/\bthat is\b/g, "that's"],
  [/\bthere is\b/g, "there's"], [/\bhere is\b/g, "here's"], [/\bwhat is\b/g, "what's"], [/\bwho is\b/g, "who's"],
  [/\bwhere is\b/g, "where's"], [/\bhow is\b/g, "how's"],
  [/\bi will\b/g, "i'll"], [/\byou will\b/g, "you'll"], [/\bhe will\b/g, "he'll"], [/\bshe will\b/g, "she'll"],
  [/\bwe will\b/g, "we'll"], [/\bthey will\b/g, "they'll"],
  [/\bi have\b/g, "i've"], [/\byou have\b/g, "you've"], [/\bwe have\b/g, "we've"], [/\bthey have\b/g, "they've"],
  [/\bi would\b/g, "i'd"], [/\byou would\b/g, "you'd"],
];
const T_EXPAND = [
  [/\bcan't\b/g, "cannot"], [/\bwon't\b/g, "will not"], [/\bdon't\b/g, "do not"], [/\bdoesn't\b/g, "does not"],
  [/\bdidn't\b/g, "did not"], [/\bisn't\b/g, "is not"], [/\baren't\b/g, "are not"], [/\bwasn't\b/g, "was not"],
  [/\bweren't\b/g, "were not"], [/\bwouldn't\b/g, "would not"], [/\bshouldn't\b/g, "should not"],
  [/\bcouldn't\b/g, "could not"], [/\bmustn't\b/g, "must not"], [/\bneedn't\b/g, "need not"],
  [/\bhaven't\b/g, "have not"], [/\bhasn't\b/g, "has not"], [/\bhadn't\b/g, "had not"], [/\blet's\b/g, "let us"],
  [/\bi'm\b/g, "i am"], [/\byou're\b/g, "you are"], [/\bwe're\b/g, "we are"], [/\bthey're\b/g, "they are"],
  [/\bit's\b/g, "it is"], [/\bhe's\b/g, "he is"], [/\bshe's\b/g, "she is"], [/\bthat's\b/g, "that is"],
  [/\bthere's\b/g, "there is"], [/\bhere's\b/g, "here is"], [/\bwhat's\b/g, "what is"], [/\bwho's\b/g, "who is"],
  [/\bi'll\b/g, "i will"], [/\byou'll\b/g, "you will"], [/\bwe'll\b/g, "we will"], [/\bthey'll\b/g, "they will"],
  [/\bi've\b/g, "i have"], [/\byou've\b/g, "you have"], [/\bwe've\b/g, "we have"], [/\bthey've\b/g, "they have"],
];
const tNorm = (s) => { let x = (s || "").toLowerCase().replace(/[’‘`]/g, "'").replace(/\s+/g, " ").trim().replace(/[.?!,;:]+$/g, "").trim(); for (const [re, to] of T_FOLD) x = x.replace(re, to); return x.replace(/\s+/g, " ").trim(); };
const tDropThat = (s) => s.replace(/(?<= )that\b(?!')/g, " ").replace(/\s+/g, " ").trim();
const tEquiv = (a, b) => { const ca = tNorm(a), cb = tNorm(b); return ca === cb || tDropThat(ca) === tDropThat(cb); };
const swapForm = (s) => { let x = (s || "").toLowerCase().replace(/[’‘`]/g, "'").replace(/\s+/g, " ").trim(); for (const [re, to] of T_EXPAND) x = x.replace(re, to); return x.replace(/(?<= )that\b(?!')/g, " ").replace(/\s+/g, " ").trim(); };
const transforms = Q.filter((q) => q.qtype === "transform");
const tRisk = [];
for (const q of transforms) {
  const a = (q.payload || {}).answer_text || "";
  const v = swapForm(a);
  if (v && !tEquiv(v, a)) tRisk.push({ q, a, v });
}
for (const { q, a, v } of tRisk) add("flag", "transform残余", q.lesson_id, q.id, `放宽后仍判不等: "${a}" vs 变体"${v}"`);

// ============ ⑥ 输出 ============
const OUT = path.join(ROOT, "scripts/american/audit-out");
fs.mkdirSync(OUT, { recursive: true });

// 报告
const sevTitle = { err: "🔴 确定错误", sus: "🟡 疑似(需人工判断)", flag: "⚪ flag(信息级)" };
let rep = `# 美语课程题库机审报告\n\n> anon 只读机审,只报不改。修复走 Aaron 拍板 + 独立 SQL。\n> 题库规模:${Q.length} 题(cloze ${clozes.length} / choice ${choices.length} / transform ${transforms.length})。\n\n`;
rep += `## 摘要\n\n| 级别 | 数量 |\n|---|---|\n| 🔴 确定错误 | ${findings.err.length} |\n| 🟡 疑似 | ${findings.sus.length} |\n| ⚪ flag | ${findings.flag.length} |\n\n`;
rep += `按 code 分布:\n\n`;
const byCode = {};
for (const sev of ["err","sus","flag"]) for (const f of findings[sev]) (byCode[f.code] ??= 0), byCode[f.code]++;
rep += "| code | 数 |\n|---|---|\n" + Object.entries(byCode).sort((a,b)=>b[1]-a[1]).map(([c,n])=>`| ${c} | ${n} |`).join("\n") + "\n\n";
for (const sev of ["err", "sus", "flag"]) {
  rep += `## ${sevTitle[sev]}（${findings[sev].length}）\n\n`;
  if (!findings[sev].length) { rep += "_无_\n\n"; continue; }
  // flag 超纲/风险量大 → 按单元汇总;err/sus 逐条
  const list = findings[sev].slice().sort((a, b) => a.unit - b.unit || a.lid.localeCompare(b.lid));
  rep += "| 单元 | 课 | code | 说明 | qid |\n|---|---|---|---|---|\n";
  for (const f of list.slice(0, sev === "flag" ? 2000 : 2000)) {
    rep += `| ${f.unit} | ${f.lid} | ${f.code} | ${f.msg.replace(/\|/g, "\\|")} | \`${String(f.qid).slice(0,8)}\` |\n`;
  }
  if (list.length > (sev === "flag" ? 2000 : 2000)) rep += `\n_…余 ${list.length - (sev==="flag"?400:1000)} 条见数据_\n`;
  rep += "\n";
}
// ⑤ transform 放宽(已实装)
rep += `## transform 判定放宽（已实装 src/lib/american/answerEquiv.ts + 单测）\n\n`;
rep += `共 ${transforms.length} 道 transform。放宽规则已落地(任一命中即判对),本次复扫仅剩 **${tRisk.length}** 道残余:\n\n`;
rep += `1. **缩写 ≡ 全写**:don't≡do not / isn't≡is not / it's≡it is / I'll≡I will 等(双向,规范形取缩写)。\n`;
rep += `2. **that 可省**:said (that) / a book (that) I bought —— 含/省 that 均判对(保护句首 That / that's)。\n`;
rep += `3. **末尾标点 + 首字母大小写 + 多余空白**已忽略。\n`;
rep += `4. 运行时关5/10 transform 现为"显示参考答案→自评";answerEquiv 供机审复扫 + 将来键入自动判分直接复用。\n\n`;

fs.writeFileSync(path.join(OUT, "audit_report.md"), rep, "utf8");

// 12 个单元 md(供网页版语义复审)
const gpName = {}; // 可选:不查名,直接给 gp id
const optLine = (p) => {
  if (p.qtype2 === "transform") return "";
  return "";
};
for (let u = 1; u <= 12; u++) {
  const qs = Q.filter((q) => unitOf(q.lesson_id) === u);
  let md = `# 单元${u} 题库全量导出（语义复审用）\n\n> 共 ${qs.length} 题。每题:stage · qtype · gp · 题干 · 选项(★=标答) · 答案。\n\n`;
  let curL = null;
  for (const q of qs) {
    if (q.lesson_id !== curL) { curL = q.lesson_id; md += `\n## ${q.lesson_id}\n\n`; }
    const p = q.payload || {};
    md += `- **s${q.stage}** \`${q.qtype}\` ${q.grammar_point_id ? "["+q.grammar_point_id.replace("am1_l"+String(lnOf(q.lesson_id)).padStart(2,"0")+"_","")+"]" : ""} ${p.context ? "〔"+p.context.replace(/\n/g," ").slice(0,60)+"〕 " : ""}${String(p.stem||"").replace(/\n/g," ")}\n`;
    if (Array.isArray(p.options)) md += `    - 选项: ${p.options.map((o,i)=>(i===p.answer_index?"★":"")+o).join(" / ")}\n`;
    if (p.answer_text) md += `    - 答案: ${p.answer_text}\n`;
  }
  fs.writeFileSync(path.join(OUT, `unit${String(u).padStart(2,"0")}.md`), md, "utf8");
}

console.log(`\n机审完成: 🔴${findings.err.length} 🟡${findings.sus.length} ⚪${findings.flag.length}`);
console.log(`产出: scripts/american/audit-out/audit_report.md + unit01..12.md`);
