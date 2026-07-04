import fs from "fs";
const SP = "C:/Users/willi/AppData/Local/Temp/claude/C--Projects-learn-fluent-easy/dce5bb16-1d15-4c48-a6cb-7dba17192a75/scratchpad";
const OUT = "C:/Projects/learn-fluent-easy/SQLAA";
const U = process.argv[2];                       // e.g. "3"
const NN = String(U).padStart(2, "0");           // "03"
const pending = (process.argv[3] || "").split(",").filter(Boolean); // first-8 of 待裁决
const dataBugs = (process.argv[4] || "").split(",").filter(Boolean); // first-8 of malformed answer_text

const data = JSON.parse(fs.readFileSync(`${SP}/u${U}_data.json`, "utf8"));
const perq = JSON.parse(fs.readFileSync(`${SP}/u${U}_perq.json`, "utf8"));

// build first8 -> question (assert unique)
const by8 = {};
for (const q of data) { const k = q.id.slice(0, 8); if (by8[k]) { console.error("DUP first8:", k); process.exit(1); } by8[k] = q; }

const GRAMMAR_TERMS = ["主语", "复数", "单数", "时态", "进行时", "祈使", "物主代词", "引导词", "否定句", "疑问句", "冠词", "比较级", "过去式", "情态", "系动词", "介词"];
const problems = { missing: [], extra: [], ansMiss: [], bleed: [], metaLeak: [], tooShort: [] };

// coverage
const target = data.filter(q => !pending.includes(q.id.slice(0, 8)));
const targetSet = new Set(target.map(q => q.id.slice(0, 8)));
for (const q of target) if (!(q.id.slice(0, 8) in perq)) problems.missing.push(q.id.slice(0, 8) + " " + q.lesson + " 关" + q.stage + " | " + (q.stem || "").slice(0, 30));
for (const k of Object.keys(perq)) {
  if (!by8[k]) problems.extra.push(k + " (no such qid)");
  else if (pending.includes(k)) problems.extra.push(k + " (待裁决,应排除)");
}

// per-question checks
const scenarioRe = /^(请|问|.*说：$|.*，说：)/;
for (const q of target) {
  const k = q.id.slice(0, 8); const e = perq[k]; if (!e) continue;
  // answer word (normalize malformed transform answer)
  let ans = q.answer ?? q.answer_text ?? "";
  if (dataBugs.includes(k) && ans.includes("）→")) ans = ans.split("→").pop().trim();
  if (ans && !e.includes(ans)) problems.ansMiss.push(`${k} 答案「${ans}」不在解释里: ${e}`);
  // 串味: scenario 题解释不得含语法术语
  const isScenario = q.qtype === "scenario" || scenarioRe.test((q.stem || ""));
  if (isScenario) { const hit = GRAMMAR_TERMS.filter(t => e.includes(t)); if (hit.length) problems.bleed.push(`${k} 情景题解释含语法术语[${hit}]: ${e}`); }
  // meta leak: Chinese-term options (·分隔 or 全中文选项) with rule-style stem
  const opts = q.options || [];
  const allCN = opts.length && opts.every(o => /^[一-龥·\s]+$/.test(o));
  if (allCN && /[:：]$|表示|后接|依次|用哪个|地图|写法/.test(q.stem || "")) problems.metaLeak.push(`${k} 疑似漏判元题: ${q.stem} | opts=${JSON.stringify(opts)}`);
  // length
  if (e.length < 8) problems.tooShort.push(k + ": " + e);
}

// report
const okCov = !problems.missing.length && !problems.extra.length;
console.log(`===== 单元${U} perq 自检 =====`);
console.log(`DB题数=${data.length} 待裁决=${pending.length} 应覆盖=${target.length} 解释条数=${Object.keys(perq).length}`);
console.log(`①覆盖: 缺${problems.missing.length} 多${problems.extra.length}`);
problems.missing.forEach(x => console.log("   缺→", x));
problems.extra.forEach(x => console.log("   多→", x));
console.log(`②答案词: 缺${problems.ansMiss.length}`); problems.ansMiss.forEach(x => console.log("   ", x));
console.log(`③串味: ${problems.bleed.length}`); problems.bleed.forEach(x => console.log("   ", x));
console.log(`④元题漏判: ${problems.metaLeak.length}`); problems.metaLeak.forEach(x => console.log("   ", x));
console.log(`⑤过短: ${problems.tooShort.length}`); problems.tooShort.forEach(x => console.log("   ", x));

const clean = okCov && !problems.ansMiss.length && !problems.bleed.length && !problems.tooShort.length;
console.log(clean ? "\n✅ 自检全绿" : "\n❌ 有问题，先修再出SQL");
if (!clean) process.exit(2);

// generate SQL
const lessons = [...new Set(target.map(q => q.lesson))].sort();
const esc = s => s.replace(/\$x\$/g, "");
let sql = `-- american_explanation_unit${NN}_perq.sql\n`;
sql += `-- 单元${U}(${lessons[0]}-${lessons[lessons.length-1]}) 逐题解释 ${target.length}题 按qid UPDATE payload.explanation_cn。\n`;
sql += `-- 排除${pending.length}道待裁决(${pending.join("/")||"无"});规范v2四类句式+情景题只讲套话+六项自检全过。\n`;
sql += `BEGIN;\n`;
sql += `SELECT '落库前 with_expl' AS label, count(*) FROM american_questions WHERE lesson_id IN (${lessons.map(l=>`'${l}'`).join(",")}) AND stage IN(5,7,10) AND payload ? 'explanation_cn';\n`;
for (const q of target) {
  const e = perq[q.id.slice(0, 8)];
  sql += `UPDATE american_questions SET payload = payload || jsonb_build_object('explanation_cn', $x$${esc(e)}$x$) WHERE id='${q.id}';\n`;
}
sql += `SELECT '落库后 with_expl(应${target.length}+)' AS label, count(*) FROM american_questions WHERE lesson_id IN (${lessons.map(l=>`'${l}'`).join(",")}) AND stage IN(5,7,10) AND payload ? 'explanation_cn';\n`;
sql += `COMMIT;\n`;
fs.writeFileSync(`${OUT}/american_explanation_unit${NN}_perq.sql`, sql);
console.log(`\n📄 写出 SQLAA/american_explanation_unit${NN}_perq.sql (${target.length} UPDATE)`);
