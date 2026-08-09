import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const BASE = readFileSync('C:/Users/willi/AppData/Local/Temp/base335.txt','utf8').trim();
const b = await chromium.launch();
const ctx = await b.newContext({ viewport:{width:390,height:844}, extraHTTPHeaders:{'x-vercel-protection-bypass':process.env.VBP}});
const p = await ctx.newPage();
for (const path of ['/vocab/toefl/quiz','/vocab/toefl/listen','/vocab/toefl/spell','/vocab/listen','/vocab/mistakes','/vocab/confusion','/vocab/today']) {
  await p.goto(BASE+path,{waitUntil:'networkidle',timeout:90000});
  await p.waitForTimeout(6000);   // 给足加载时间,排除"还在转圈"
  const t = await p.evaluate(()=>document.body.innerText.replace(/\n+/g,' | '));
  console.log(`\n### ${path}\n  ${t.slice(0,230)}`);
}
await b.close();
