/* 静默失败分级:只挑"吞掉数据查询错误"的 —— 那种会让「空」和「失败」无法区分 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
const files=[]; const walk=d=>{for(const f of readdirSync(d)){const p=path.join(d,f);
  if(statSync(p).isDirectory())walk(p); else if(/\.tsx?$/.test(f)&&!/\.test\./.test(f))files.push(p);}};
['src/lib/vocab','src/pages/vocab','src/components/vocab'].forEach(walk);

/* 危险信号:catch 附近有数据获取调用,且块体无日志 */
const FETCHY = /\b(list[A-Z]\w*|get[A-Z]\w*|count[A-Z]\w*|build[A-Z]\w*|db\.from|supabase|fetch\()/;
const BENIGN = /localStorage|sessionStorage|matchMedia|\.pause\(|currentTime|scrollIntoView|play\(\)|randomUUID|JSON\.parse/;
/* ⚠️ 判"这个 catch 留没留痕"。除了直接 console,还认 lib/vocab/report.ts 的两个出口。
 *    `\s*\(` 是必需的:data.ts 里有 `fallbackTotal` 这个变量名,不加就会被误判成"记了日志"
 *    (它后面跟的是 Total 不是括号,所以现在不会误伤)。 */
const LOGGY = /console\.|diag\(|\b(logFail|fallback)\s*\(/;
const out=[];
for (const f of files) {
  const lines = readFileSync(f,'utf8').split('\n');
  lines.forEach((ln,i)=>{
    if(!/\bcatch\s*(\(|\{)/.test(ln)) return;
    /* ⚠️ 注释行里出现 catch( 不是代码。踩过:VocabBank 里一句解释
       "原来三项各自 .catch(兜底 0)" 被当成了一处静默 catch。 */
    if(/^\s*(\*|\/\/|\/\*)/.test(ln)) return;
    /* 尾窗从 +6 放到 +10:VocabMistakes 的 catch 与它的 console.log 隔了 7 行
       (中间是一段说明注释),+6 判不到 —— 一个**已经修好**的页面一直被报成未修。
       ⚠️ 放宽窗口 = 放宽通过条件,必做回归(第七条)。
          +6 与 +10 两次全量扫描的差集只有 VocabMistakes 一条,其余判定不变。 */
    const ctx = lines.slice(Math.max(0,i-4), i+10).join('\n');
    if (LOGGY.test(ctx)) return;
    if (BENIGN.test(ln) || BENIGN.test(ctx.split('\n').slice(0,5).join('\n')) && !FETCHY.test(ctx)) return;
    if (!FETCHY.test(ctx)) return;
    out.push({ f: f.split(String.fromCharCode(92)).join('/'), line:i+1, code: ln.trim().slice(0,88) });
  });
}
console.log(`## 吞掉数据查询错误且无日志:${out.length} 处\n`);
for (const o of out) console.log(`  ${o.f}:${o.line}\n      ${o.code}`);
