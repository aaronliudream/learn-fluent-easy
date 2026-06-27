// 把 year1.json 的 必修一 U1 接入 junior 整套:① 插完形关(第9关,type=cloze)② 设 grammarCodes(走DB语法测+混合通关)。
import { readFileSync, writeFileSync } from 'node:fs';
const F = 'C:\\Projects\\learn-fluent-easy\\src\\data\\gaokaoHub\\year1.json';
const y = JSON.parse(readFileSync(F, 'utf8'));
const u1 = y.year1.semesters.gk_required1.units.find((u) => u.unitKey === 'U1');
if (!u1) { console.error('U1 未找到'); process.exit(1); }

// ① grammarCodes(我的3个语法点 code,已灌 junior_grammar_points volume=required1)
u1.grammarCodes = ['r1u1.01', 'r1u1.02', 'r1u1.03'];

// ② 插完形关:在 reading 关之后、listening 关之前
const clozeStage = { id: 's5c', title: '完形填空', subtitle: '语境填词', icon: '📝', type: 'cloze', time: '8分钟' };
const ri = u1.stages.findIndex((s) => s.type === 'reading');
if (!u1.stages.some((s) => s.type === 'cloze')) {
  u1.stages.splice(ri + 1, 0, clozeStage);
}

writeFileSync(F, JSON.stringify(y, null, 2));
console.log('U1 已接入 junior:');
console.log('  grammarCodes =', JSON.stringify(u1.grammarCodes));
console.log('  stages(' + u1.stages.length + ') =', u1.stages.map((s) => s.type).join(' → '));
