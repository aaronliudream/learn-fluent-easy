import { readFileSync } from 'node:fs';
const sql = readFileSync('scripts/required1-u1-load.sql', 'utf8');
// 字符级扫描:'' 视为转义(跳过两个),单个 ' 切换字符串状态。
// 统计每个顶层 ';' 处是否在字符串外(语句结束应在串外);结尾应在串外。
let inStr = false, stmtEnds = 0, badSemis = 0;
for (let i = 0; i < sql.length; i++) {
  const c = sql[i];
  if (c === "'") {
    if (inStr && sql[i + 1] === "'") { i++; continue; } // escaped ''
    inStr = !inStr;
  } else if (c === ';' && !inStr) {
    stmtEnds++;
  } else if (c === ';' && inStr) {
    // 串内分号正常(如 meaning_cn 里的中文分号其实是；,英文;也可能在串内)— 不计
  }
}
console.log('结尾字符串状态(应 false=闭合):', inStr);
console.log('顶层(串外) ; 数量:', stmtEnds);
console.log('单引号总数:', (sql.match(/'/g) || []).length, '(偶数=配平)');
console.log(!inStr && (sql.match(/'/g) || []).length % 2 === 0 ? '✅ SQL 字符串全部闭合,引号配平,无截断' : '❌ 引号未闭合');
