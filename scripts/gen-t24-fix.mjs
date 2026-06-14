import { writeFileSync } from 'node:fs';
const e = s => String(s).replace(/'/g, "''");

const U = [
  { id:'1c95a73d-f48a-4c39-bf77-0c25d6f2b6ce', // #5 freq
    stem:"My grandpa is healthy because he ___ does morning exercises.",
    a:"always", b:"never", c:"badly", d:"hardly", ans:"A",
    ex:"他健康→**always**总是做晨练。always=总是,表高频率。" },
  { id:'1efaa5a7-dbbf-452b-ad81-e1bb566e0311', // #9 freq
    stem:"— Do you often eat snacks? — No, I ___ eat them. I prefer fruit.",
    a:"always", b:"usually", c:"seldom", d:"often", ans:"C",
    ex:"更爱水果→**seldom**很少吃零食。seldom=很少。" },
  { id:'762da5bb-3dcf-48a2-9f94-1f4fa7161a1b', // #15 howoften
    stem:"— How often do you go running? — ___ a week, on Monday and Friday.",
    a:"One time", b:"Twice", c:"Second", d:"Once time", ans:"B",
    ex:"周一周五→一周两次=**Twice** a week。twice=两次。" },
];

let sql = '';
sql += "-- ============================================================\n";
sql += "-- g7-t24: 替换 3 道语法术语题为地道频率题 (只改 stem/opts/ans/explanation)\n";
sql += "-- WHERE id 定位; 不动 id/kp_id/point_id/sort_order\n";
sql += "-- ============================================================\n\n";
U.forEach((u,i)=>{
  sql += `-- 替换 #${i+1} (id=${u.id})\n`;
  sql += "UPDATE junior_grammar_questions SET\n";
  sql += `  stem = '${e(u.stem)}',\n`;
  sql += `  option_a = '${e(u.a)}', option_b = '${e(u.b)}', option_c = '${e(u.c)}', option_d = '${e(u.d)}',\n`;
  sql += `  correct_answer = '${u.ans}',\n`;
  sql += `  explanation = '${e(u.ex)}'\n`;
  sql += `WHERE id = '${u.id}';\n\n`;
});

sql += "-- 校验①: 3 题新 stem/答案在库\n";
sql += `SELECT sort_order, correct_answer, stem FROM junior_grammar_questions WHERE id IN ('${U[0].id}','${U[1].id}','${U[2].id}') ORDER BY sort_order;\n\n`;
sql += "-- 校验②: 旧语法术语题应已全部消失 (应 0)\n";
sql += "SELECT count(*) FROM junior_grammar_questions WHERE point_id=(SELECT id FROM junior_grammar_points WHERE code='g7-t24') AND (stem LIKE 'Frequency adverbs%' OR stem = 'How often is used to ask about ___.');\n";

writeFileSync('scripts/u3-t24-fix.sql', sql, 'utf8');

const sq=(sql.match(/'/g)||[]).length;
console.log('targets:', U.map(u=>u.id.slice(0,8)).join(', '));
console.log('single-quote total:', sq, sq%2===0?'(EVEN ✓)':'(ODD ✗)');
console.log('SQL bytes:', sql.length);
process.exit(0);
