import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { loadEnv } from '../env.mjs';
const env = loadEnv(process.cwd(), { quiet: true });
const U = env.VITE_SUPABASE_URL, K = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const BASE = readFileSync('C:/Users/willi/AppData/Local/Temp/base335.txt','utf8').trim();
const s = await (await fetch(`${U}/auth/v1/token?grant_type=password`,{method:'POST',
  headers:{apikey:K,'Content-Type':'application/json'},
  body:JSON.stringify({email:'cc-audit@bigmooneducation.com',password:'AuditRun!2026x'})})).json();
const ref = new URL(U).hostname.split('.')[0];
const b = await chromium.launch();
const ctx = await b.newContext({ extraHTTPHeaders:{'x-vercel-protection-bypass':process.env.VBP}});
const p = await ctx.newPage();
await p.goto(BASE, {waitUntil:'commit',timeout:120000});
// 关键:写完 localStorage 后**必须重新加载**,否则客户端已用空存储初始化过了
await p.evaluate(([ref,sess])=>{
  localStorage.setItem(`sb-${ref}-auth-token`, JSON.stringify(sess));
}, [ref, s]);
const before = await p.evaluate((ref)=>({ 写完立刻读: (localStorage.getItem('sb-'+ref+'-auth-token')||'').slice(0,40), 键数: Object.keys(localStorage).length }), ref);
console.log('reload 前:', JSON.stringify(before));
await p.reload({waitUntil:'networkidle',timeout:120000});
await p.waitForTimeout(4000);
const out = await p.evaluate((ref)=>({
  存进去的键: Object.keys(localStorage).filter(k=>k.includes('auth-token')),
  值前80: (localStorage.getItem(`sb-${ref}-auth-token`)||'').slice(0,80),
  页面有登录按钮: document.body.innerText.includes('登录'),
}), ref);
console.log(JSON.stringify(out,null,1));
await b.close();
