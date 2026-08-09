import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { loadEnv } from '../env.mjs';
const env = loadEnv(process.cwd(), { quiet: true });
const U = env.VITE_SUPABASE_URL, K = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const BASE = readFileSync('C:/Users/willi/AppData/Local/Temp/base335.txt','utf8').trim();
const s = await (await fetch(`${U}/auth/v1/token?grant_type=password`,{method:'POST',
  headers:{apikey:K,'Content-Type':'application/json'},
  body:JSON.stringify({email:'cc-audit2@bigmooneducation.com',password:'AuditRun2!2026x'})})).json();
if(!s.access_token){ console.error('登录失败'); process.exit(1); }
const ref=new URL(U).hostname.split('.')[0];
const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:390,height:844},extraHTTPHeaders:{'x-vercel-protection-bypass':process.env.VBP}});
const p=await ctx.newPage();
await p.goto(BASE,{waitUntil:'commit',timeout:120000});
await p.evaluate(([k,sess])=>localStorage.setItem(k,JSON.stringify(sess)),[`sb-${ref}-auth-token`,s]);
for (const path of ['/vocab/today']) {
  await p.goto(BASE+path,{waitUntil:'networkidle',timeout:120000});
  await p.waitForTimeout(22000);
  console.log(`\n### ${path}\n  ${(await p.evaluate(()=>document.body.innerText.replace(/\n+/g,' | '))).slice(0,300)}`);
}
await b.close();
