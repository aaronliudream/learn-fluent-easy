/* 第二节:静默失败扫描 —— 找"吞掉错误却不上报"的 catch */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
const ROOTS = ['src/lib/vocab','src/pages/vocab','src/components/vocab'];
const files=[];
const walk = d => { for(const f of readdirSync(d)){ const p=path.join(d,f);
  if(statSync(p).isDirectory()) walk(p); else if(/\.tsx?$/.test(f) && !/\.test\./.test(f)) files.push(p); } };
ROOTS.forEach(walk);

const LOGGY = /console\.|diag\(|捕获|上报|report/;
let total=0; const bad=[];
for (const f of files) {
  const src = readFileSync(f,'utf8');
  const lines = src.split('\n');
  lines.forEach((ln,i) => {
    if (!/\bcatch\s*(\(|\{)/.test(ln)) return;
    total++;
    /* 取 catch 之后 6 行作为块体粗判 */
    const body = lines.slice(i, i+7).join('\n');
    if (LOGGY.test(body)) return;
    /* 注释里写明"故意忽略"的算已交代 */
    const intentional = /\/\*[^*]*\*\/|\/\//.test(body) && /不影响|不报错|不拦|预期|noop|忽略|静默|照常|不该/.test(body);
    bad.push({ f, line:i+1, code: ln.trim().slice(0,80), intentional });
  });
}
const silent = bad.filter(b=>!b.intentional);
console.log(`catch 总数 ${total} · 有日志或明确交代 ${total-bad.length+bad.filter(b=>b.intentional).length} · **无日志且无交代 ${silent.length}**\n`);
for (const b of silent) console.log(`  ${b.f}:${b.line}  ${b.code}`);
console.log(`\n--- 有注释交代但仍无日志 ${bad.filter(b=>b.intentional).length} 处(次要)---`);
for (const b of bad.filter(x=>x.intentional).slice(0,12)) console.log(`  ${b.f}:${b.line}`);
