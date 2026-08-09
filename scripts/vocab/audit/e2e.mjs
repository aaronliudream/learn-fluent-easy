/* 第一节:15 条路径端到端实跑(登录态,真 preview) */
import { chromium } from 'playwright';
import { loadEnv } from '../env.mjs';
const env = loadEnv(process.cwd(), { quiet: true });
const U = env.VITE_SUPABASE_URL, K = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const BASE = process.env.BASE;
const EMAIL=process.env.EMAIL, PASS=process.env.PASS;
let r = await fetch(`${U}/auth/v1/signup`, {method:'POST',headers:{apikey:K,'Content-Type':'application/json'},body:JSON.stringify({email:EMAIL,password:PASS})});
let s = await r.json();
if(!s.access_token){ r=await fetch(`${U}/auth/v1/token?grant_type=password`,{method:'POST',headers:{apikey:K,'Content-Type':'application/json'},body:JSON.stringify({email:EMAIL,password:PASS})}); s=await r.json(); }
if(!s?.access_token) { console.error('✗ 登录失败,整轮作废:', JSON.stringify(s).slice(0,200)); process.exit(1); }
console.log('测试用户', s.user.id, '\n');

const b = await chromium.launch();
const ctx = await b.newContext({ viewport:{width:390,height:844},
  extraHTTPHeaders:{ 'x-vercel-protection-bypass': process.env.VBP }});
const page = await ctx.newPage();
const errs = []; const net = [];
page.on('pageerror', e => errs.push(String(e).slice(0,160)));
page.on('console', m => { if (m.type()==='error') errs.push('console: '+m.text().slice(0,160)); });
page.on('response', res => { if (res.url().includes('/rest/v1/') && res.status()>=400) net.push(`${res.status()} ${res.url().split('/rest/v1/')[1].slice(0,90)}`); });

await page.goto(BASE,{waitUntil:'commit',timeout:120000});
const key=`sb-${new URL(U).hostname.split('.')[0]}-auth-token`;
await page.evaluate(([k,sess])=>localStorage.setItem(k,JSON.stringify(sess)),[key,s]);
await page.goto(BASE+'/vocab',{waitUntil:'networkidle',timeout:120000});
await page.waitForTimeout(4000);
/* ⚠️ 硬校验登录态。上一轮就是登录没成功却照跑,14 条全 ✓ 但那是未登录的世界。 */
const loggedIn = await page.evaluate(()=>!document.body.innerText.includes('未登录状态下'));
console.log(loggedIn ? '✓ 已登录态' : '✗ 仍是未登录态 —— 整轮作废');
if (!loggedIn) { await b.close(); process.exit(1); }

const PATHS = [
  ['/vocab','词汇中心'], ['/vocab/today','今日学习'], ['/vocab/scenes','场景列表'],
  ['/vocab/toefl','词库页'], ['/vocab/toefl/quiz','英汉选择'], ['/vocab/toefl/match','词汇配对'],
  ['/vocab/toefl/listen','听音辨义'], ['/vocab/toefl/spell','听写挑战'], ['/vocab/mistakes','错题本'],
  ['/vocab/listen','磨耳朵'], ['/vocab/chunks','词块与习语'], ['/vocab/expressions','中文这样说'],
  ['/vocab/confusion','易混词辨析'], ['/vocab/dictation','默写纸'],
];
for (const [p,name] of PATHS) {
  errs.length=0; net.length=0;
  try { await page.goto(BASE+p,{waitUntil:'networkidle',timeout:90000}); } catch(e){ console.log(`✗ ${name.padEnd(10)} 导航超时`); continue; }
  await page.waitForTimeout(3500);
  const t = await page.evaluate(()=>document.body.innerText);
  const fail = /加载失败|出错|Something went wrong|词库不存在/.test(t);
  const blank = t.replace(/Home|Courses|Mistakes|Me|登录|←/g,'').trim().length < 40;
  const flag = fail ? '✗失败文案' : blank ? '✗内容空白' : '✓';
  console.log(`${flag} ${name.padEnd(10)} ${p.padEnd(22)} 文本${String(t.length).padStart(5)}字  4xx/5xx:${net.length}  JS错:${errs.length}`);
  if (net.length) net.slice(0,3).forEach(n=>console.log(`      NET ${n}`));
  if (errs.length) errs.slice(0,2).forEach(e=>console.log(`      JS  ${e}`));
  if (fail||blank) console.log(`      文本: ${t.slice(0,150).replace(/\n/g,' | ')}`);
}
await b.close();
console.log('\n清理用 user id:', s.user.id);
