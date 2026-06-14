import { randomUUID } from 'node:crypto';
import { writeFileSync } from 'node:fs';
const e = s => String(s).replace(/'/g, "''");
const K = [
  ['g7-t05-3sg', `第三人称单数(动词+s/es、have→has、主谓一致)`, 1],
  ['g7-t05-q',   `一般疑问与简答(Do/Does...?、Yes/No简答、特殊疑问提问)`, 2],
  ['g7-t05-neg', `否定句(don't/doesn't)`, 3],
  ['g7-t05-aff', `肯定陈述与主谓一致(I/we/they+原形、be一致、表真理习惯)`, 4],
];
const ids = K.map(() => randomUUID());
let sql = '';
sql += "-- ============================================================\n";
sql += "-- t05 一般现在时 拆4kp 框架 (只建kp,不标kp_id)\n";
sql += "-- point_id subselect g7-t05; WHERE NOT EXISTS by code 幂等\n";
sql += "-- ============================================================\n\n";
K.forEach((k,i) => {
  sql += "INSERT INTO junior_knowledge_points (id, point_id, code, title, summary, sort_order, target_count)\n";
  sql += `SELECT '${ids[i]}', (SELECT id FROM junior_grammar_points WHERE code='g7-t05'), '${k[0]}', '${e(k[1])}', NULL, ${k[2]}, 20\n`;
  sql += `WHERE NOT EXISTS (SELECT 1 FROM junior_knowledge_points WHERE code = '${k[0]}');\n\n`;
});
sql += "-- 校验: 应4行\nSELECT count(*) AS n, code FROM junior_knowledge_points WHERE code LIKE 'g7-t05-%' GROUP BY code ORDER BY code;\n";
writeFileSync('scripts/t05-kp.sql', sql);
const sq = (sql.match(/'/g) || []).length;
console.log('=== kp UUID 对照表 ===');
K.forEach((k,i) => console.log(`${k[0].padEnd(12)} : ${ids[i]}`));
console.log('\nsingle-quote total:', sq, sq%2===0 ? '(EVEN ✓)' : '(ODD ✗)');
process.exit(0);
