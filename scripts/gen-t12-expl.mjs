import { writeFileSync } from 'node:fs';
const e = s => String(s).replace(/'/g, "''"); // raw ' -> '' (Let's/I'd/can't 等)

// id + explanation (backtick literals; raw apostrophes, e() doubles for SQL)
const U = [
  // --- 4 祈使/建议 (Let's / Why not + 原形) ---
  { id:'431c1338-0750-4c25-b147-25586c901423', // #8610 ans A=buy
    ex:`**Let's + 动词原形**表示建议"我们一起做……"(Let's eat/sing)。本题应填原形**buy**。` },
  { id:'050f02d4-83dc-4ee9-8624-73f511919173', // #8627 ans A=sing
    ex:`**Let's + 动词原形**表示建议"我们一起做……"(Let's go/sing)。本题应填原形**sing**。` },
  { id:'33b833cb-6d3c-4c2d-aeb6-5ebc91e8788c', // #8647 ans D=buy
    ex:`**Let's + 动词原形**表示建议"我们一起做……"(Let's eat/buy)。本题应填原形**buy**。` },
  { id:'33d3831f-c945-4593-8014-770cf62be07b', // #9229 ans A=take
    ex:`**Why not + 动词原形**?是提建议的句型,=Why don't you...,表示"何不……"。本题应填原形**take**(take a walk 散步)。` },
  // --- 6 交际应答 ---
  { id:'ea8b9819-b8ad-4a81-a0ef-987ed14529e9', // #8609 ans B="Yes, I'd love to"
    ex:`邀请"你想来吗"的得体接受回答:**Yes, I'd love to**(我很乐意)。I'd love to = I would love to。` },
  { id:'e03142a1-3a8b-40e1-bd8a-f6dc67bbc2ec', // #8630 ans B="Yes"
    ex:`邀请"你想来吗",空格后已有 I'd love to,接受邀请用**Yes**。Yes, I'd love to = 我很乐意。` },
  { id:'c415e0af-0aa2-4847-910f-2239a4af5859', // #8650 ans C="Sorry, I can't"
    ex:`婉拒邀请用**Sorry, I can't**(抱歉,不行),后接原因(作业太多),比直接说 No 更礼貌。` },
  { id:'9636a282-c565-4954-a08f-a1b142e9433c', // #9314 ans B="Good idea"
    ex:`对提议"Let's..."的赞同回答:**Good idea**(好主意)/OK/Sure。` },
  { id:'7dcf1e98-e975-43f7-9a5c-4df75c76fec5', // #9334 ans B="Thanks, I will"
    ex:`对叮嘱"记得……"的应承:**Thanks, I will**(谢谢,我会的)。I will = I will remember。` },
  { id:'289cc16a-d4bb-4bb6-acbb-9efb3a0ce5e8', // #9354 ans B="Good idea"
    ex:`对提议"Let's..."的赞同:**Good idea**(好主意)/OK/Sure。` },
];

let sql = '';
sql += "-- ============================================================\n";
sql += "-- t12 补 10 道缺解析 (删#9119后剩10道) 方案甲:祈使/建议 4 + 交际应答 6\n";
sql += "-- 只 SET explanation; WHERE id 定位\n";
sql += "-- ============================================================\n\n";
U.forEach((u,i)=>{
  sql += `-- ${i+1} (id=${u.id})\n`;
  sql += `UPDATE junior_grammar_questions SET explanation = '${e(u.ex)}' WHERE id = '${u.id}';\n\n`;
});
sql += "-- 校验: t12 删后缺解析应 = 0 (60题全有解析)\n";
sql += "SELECT count(*) FROM junior_grammar_questions WHERE point_id=(SELECT id FROM junior_grammar_points WHERE code='g7-t12') AND (explanation IS NULL OR explanation = '');\n";

writeFileSync('scripts/t12-expl.sql', sql, 'utf8');
const sq=(sql.match(/'/g)||[]).length;
console.log('updates:', U.length);
console.log('single-quote total:', sq, sq%2===0?'(EVEN ✓)':'(ODD ✗)');
console.log('SQL bytes:', sql.length);
process.exit(0);
