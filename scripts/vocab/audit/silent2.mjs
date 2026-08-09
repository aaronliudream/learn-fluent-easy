/* 静默失败分级:只挑"吞掉数据查询错误"的 —— 那种会让「空」和「失败」无法区分 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
const files=[]; const walk=d=>{for(const f of readdirSync(d)){const p=path.join(d,f);
  if(statSync(p).isDirectory())walk(p); else if(/\.tsx?$/.test(f)&&!/\.test\./.test(f))files.push(p);}};
['src/lib/vocab','src/pages/vocab','src/components/vocab'].forEach(walk);

/* 危险信号:catch 附近有数据获取调用,且块体无日志 */
const FETCHY = /\b(list[A-Z]\w*|get[A-Z]\w*|count[A-Z]\w*|build[A-Z]\w*|db\.from|supabase|fetch\()/;
const BENIGN = /localStorage|sessionStorage|matchMedia|\.pause\(|currentTime|scrollIntoView|play\(\)|randomUUID|JSON\.parse/;
const LOGGY = /console\.|diag\(/;
const out=[];
for (const f of files) {
  const lines = readFileSync(f,'utf8').split('\n');
  lines.forEach((ln,i)=>{
    if(!/\bcatch\s*(\(|\{)/.test(ln)) return;
    const ctx = lines.slice(Math.max(0,i-4), i+6).join('\n');
    if (LOGGY.test(ctx)) return;
    if (BENIGN.test(ln) || BENIGN.test(ctx.split('\n').slice(0,5).join('\n')) && !FETCHY.test(ctx)) return;
    if (!FETCHY.test(ctx)) return;
    out.push({ f: f.split(String.fromCharCode(92)).join('/'), line:i+1, code: ln.trim().slice(0,88) });
  });
}
console.log(`## 吞掉数据查询错误且无日志:${out.length} 处\n`);
for (const o of out) console.log(`  ${o.f}:${o.line}\n      ${o.code}`);
