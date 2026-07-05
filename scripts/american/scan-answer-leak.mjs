/**
 * 答案泄漏全量扫描(P0)。用法: node scripts/american/scan-answer-leak.mjs
 * 规则:
 *   a(RED) 任何 stem/context 含 "→"/"->"(内部标注符,禁出现在面向学生字段)
 *   b(RED) choice 题:中文括号提示内含"正确选项完整字符串"(直给答案)
 *   c(YEL) 英文题干主体(括号外)含正确选项作为独立词 → 人工判(可能合法复现)
 * 覆盖:am2 全部 docs/american/book2/am2_l*.json + am1 全部 SQLAA/american_*.sql(american_questions payload)
 */
import { readFileSync, readdirSync } from "node:fs";

const red = [], yellow = [];
const hasArrow = (s) => typeof s === "string" && /→|->/.test(s);
// 抽取中文/英文括号内的提示片段
const parenHints = (s) => [...String(s).matchAll(/[（(]([^（()）]*)[)）]/g)].map(m => m[1]);
// 英文题干主体(去掉括号提示)
const stemBody = (s) => String(s).replace(/[（(][^（()）]*[)）]/g, " ");

function checkChoice({ file, tag, stem, correct, context }) {
  const field = context ? "context" : "stem";
  const text = context || stem;
  if (hasArrow(text)) red.push(`[a] ${file} ${tag} ${field} 含箭头: ${text}`);
  if (correct) {
    // rule b: 括号提示内直给正确选项完整串(英文用词边界防子串误杀,如 in⊂morning)
    const isEn = /^[A-Za-z][A-Za-z .'…]*$/.test(correct);
    const esc0 = correct.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const inHint = isEn ? new RegExp(`(^|[^A-Za-z])${esc0}([^A-Za-z]|$)`) : { test: (h) => h.includes(correct) };
    for (const h of parenHints(text)) {
      if (correct.length >= 2 && inHint.test(h)) {
        red.push(`[b] ${file} ${tag} 括号提示直给答案「${correct}」: ${text}`);
        break;
      }
    }
    // rule c: 英文主体(括号外)含正确选项独立词
    const body = stemBody(text);
    const esc = correct.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`(^|[^A-Za-z])${esc}([^A-Za-z]|$)`).test(body) && /[A-Za-z]/.test(correct)) {
      yellow.push(`[c] ${file} ${tag} 英文主体含答案词「${correct}」(人工判): ${body.trim().slice(0,90)}`);
    }
  }
}

// ---------- am2: JSON ----------
const b2 = "docs/american/book2";
for (const fn of readdirSync(b2).filter(f => /^am2_l\d+\.json$/.test(f)).sort()) {
  const J = JSON.parse(readFileSync(`${b2}/${fn}`, "utf8"));
  const S = (arr, st) => (arr || []).forEach((q, i) => checkChoice({ file: fn, tag: `s${st}#${i+1}`, stem: q.stem, correct: q.options ? q.options[0] : null }));
  S(J.stage5, 5); S(J.stage6, 6); S(J.stage8_listening, 8); S(J.stage9_scenario, 9); S(J.stage10, 10);
  // cloze: context 箭头 + 每空答案直给
  const cl = J.stage7_cloze;
  if (cl) {
    if (hasArrow(cl.context)) red.push(`[a] ${fn} s7 context 含箭头: ${cl.context}`);
    cl.blanks.forEach(b => checkChoice({ file: fn, tag: `s7空${b.blank_no}`, stem: cl.context, correct: b.options ? b.options[b.answer_index] : null, context: cl.context }));
  }
}

// ---------- am1: SQL payload(仅 am1_ 课;am2 已由上面 JSON 覆盖,跳过 am2 seed)----------
const sqlDir = "SQLAA";
for (const fn of readdirSync(sqlDir).filter(f => /^american_.*\.sql$/.test(f) && !/am2/.test(f)).sort()) {
  const txt = readFileSync(`${sqlDir}/${fn}`, "utf8");
  if (!txt.includes("american_questions")) continue;
  // 逐条 INSERT:取 lesson_id + payload,SQL 里 '' 是转义单引号
  for (const row of txt.matchAll(/VALUES\s*\(\s*'(am1_l\d+)'[^,]*,[^,]*,[^,]*,[^,]*,\s*'(\{.*?\})'::jsonb/gs)) {
    let p; try { p = JSON.parse(row[2].replace(/''/g, "'")); } catch { continue; }
    const stem = p.stem; if (!stem) continue;
    const correct = p.options && typeof p.answer_index === "number" ? p.options[p.answer_index] : null;
    checkChoice({ file: `${fn}(${row[1]})`, tag: (p.answer_text ? "transform" : "choice"), stem, correct });
  }
}

console.log(`\n=== 答案泄漏扫描结果 ===`);
console.log(`RED(必修): ${red.length}`);
red.forEach(r => console.log("  🔴 " + r));
console.log(`YELLOW(人工判): ${yellow.length}`);
yellow.forEach(y => console.log("  🟡 " + y));
console.log(`\n${red.length === 0 ? "🟢 无 RED 泄漏" : "🔴 有 RED 泄漏,需修"}`);
process.exit(red.length === 0 ? 0 : 1);
