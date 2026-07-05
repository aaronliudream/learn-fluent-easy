/**
 * 第一册(am1)DB 为准全库扫描:答案泄漏(a/b/c)+ 语域分化点(register_spec)。
 * anon 只读 REST 拉 american_questions(lesson_id like am1_l%),产出修复清单(不改库)。
 * 用法: node scripts/american/scan-am1-db.mjs
 */
const URL = "https://degqpiiddkxcuzwombwp.supabase.co";
const KEY = "sb_publishable_0lZoKG2xKcwgDkpLUAZVFQ_mGEdCqHE";

async function fetchAll() {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const r = await fetch(`${URL}/rest/v1/american_questions?lesson_id=like.am1_l*&select=id,lesson_id,stage,seq,qtype,payload&order=lesson_id,stage,seq`, {
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, Range: `${from}-${from + 999}` },
    });
    if (!r.ok) { console.error("HTTP", r.status, await r.text()); process.exit(1); }
    const batch = await r.json();
    rows.push(...batch);
    if (batch.length < 1000) break;
  }
  return rows;
}

const hasArrow = (s) => typeof s === "string" && /→|->/.test(s);
const parenHints = (s) => [...String(s).matchAll(/[（(]([^（()）]*)[)）]/g)].map((m) => m[1]);
const stemBody = (s) => String(s).replace(/[（(][^（()）]*[)）]/g, " ");
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// 语域分化点探测(register_spec 三节)
const REGISTER = [
  { key: "May I", re: /\bmay I\b/i, note: "May I vs Can I(口语主流 Can I)" },
  { key: "I'm fine", re: /I'?m fine|I am fine/i, note: "I'm fine 应答偏套话/过时,美语常 Good/I'm good" },
  { key: "have got", re: /\bhave got\b|\bhas got\b|\bhaven'?t got\b/i, note: "have got=英式,美语用 have" },
  { key: "If I were", re: /\bif I were\b/i, note: "If I were(规范) vs If I was(口语)" },
  { key: "whom", re: /\bwhom\b/i, note: "whom 仅正式,口语 who" },
  { key: "fewer", re: /\bfewer\b/i, note: "fewer+可数(规范) vs less(口语)" },
  { key: "shall future", re: /\bI shall\b|\bwe shall\b/i, note: "I/we shall 表将来=英式,美语用 will" },
];

const leakRed = [], leakYel = [], reg = [];
const all = await fetchAll();
console.log(`拉到 am1 题目 ${all.length} 条`);

for (const q of all) {
  const p = q.payload || {};
  const tag = `${q.lesson_id} s${q.stage}#${q.seq} (qid ${q.id})`;
  const stem = p.stem ?? "";
  const context = p.context ?? "";
  const text = context || stem;
  const correct = p.options && typeof p.answer_index === "number" ? p.options[p.answer_index] : null;
  // 泄漏 a/b/c
  if (hasArrow(text)) leakRed.push(`[a] ${tag} 含箭头: ${text}`);
  if (correct && correct.length >= 2) {
    const isEn = /^[A-Za-z][A-Za-z .'…]*$/.test(correct);
    const inHint = isEn ? new RegExp(`(^|[^A-Za-z])${esc(correct)}([^A-Za-z]|$)`) : { test: (h) => h.includes(correct) };
    for (const h of parenHints(text)) if (inHint.test(h)) { leakRed.push(`[b] ${tag} 提示直给「${correct}」: ${text}`); break; }
    if (/[A-Za-z]/.test(correct) && new RegExp(`(^|[^A-Za-z])${esc(correct)}([^A-Za-z]|$)`).test(stemBody(text)))
      leakYel.push(`[c] ${tag} 主体含答案词「${correct}」: ${stemBody(text).trim().slice(0, 80)}`);
  }
  // 语域:扫 stem/options/explanation
  const blob = [stem, context, ...(p.options || []), p.explanation_cn || ""].join(" | ");
  for (const R of REGISTER) if (R.re.test(blob)) reg.push(`[${R.key}] ${tag} — ${R.note}\n      ${(stem || context).slice(0, 90)}${correct ? ` | 答:${correct}` : ""}`);
}

console.log(`\n=== A. 答案泄漏 ===\nRED ${leakRed.length}`); leakRed.forEach((r) => console.log("  🔴 " + r));
console.log(`YELLOW ${leakYel.length}`); leakYel.forEach((y) => console.log("  🟡 " + y));
console.log(`\n=== B. 语域分化点 ${reg.length} ===`); reg.forEach((r) => console.log("  🟠 " + r));
