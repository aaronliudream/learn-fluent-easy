// 生成阅读时长脏数据截断 SQL(方案A):每句上限 = 该书句均词长 ÷ 80wpm × 60s。只削 seconds 爆表值,不动 furthest_seq。
import { readFileSync, writeFileSync } from "node:fs";
function envFrom(f){try{return Object.fromEntries(readFileSync(f,"utf8").split(/\r?\n/).filter(l=>l.includes("=")).map(l=>{const i=l.indexOf("=");return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,"")];}));}catch{return{};}}
const env={...envFrom(".env"),...envFrom(".env.local")};
const KEY=env.SUPABASE_SERVICE_ROLE_KEY||env.SERVICE_ROLE_KEY;
const H={apikey:KEY,Authorization:`Bearer ${KEY}`};
const FILES={"tom-sawyer":"tom-sawyer.json","robinson-crusoe":"robinson-crusoe.json","wizard-of-oz":"wizard-of-oz.json","aesop-easy-readers":"aesop-easy-readers.json"};
const books=await (await fetch(`${env.VITE_SUPABASE_URL}/rest/v1/library_books?select=id,book_key`,{headers:H})).json();
let sql="-- 阅读时长脏数据截断(方案A)· 每句上限 = 该书句均词长 ÷ 80wpm × 60s(80wpm 给足慢速余量,只削爆表)\n";
sql+="-- ⚠️ 待【心跳止血版部署后】再跑,否则挂机会重新灌高。只改 state.seconds,不动 furthest_seq(完成度修法属第二步)。\nBEGIN;\n";
const preview=[];
for(const bk of books){
  const file=FILES[bk.book_key]; if(!file) continue;
  const b=JSON.parse(readFileSync(`scripts/library/books/${file}`,"utf8"));
  let words=0,sents=0;
  for(const ch of b.chapters||[]) for(const p of ch.paragraphs||[]) for(const s of p){ sents++; words+=(s.en||"").trim().split(/\s+/).filter(Boolean).length; }
  const wps=words/sents;
  const capPerSent=+(wps/80*60).toFixed(2);
  preview.push(`${bk.book_key}: ${sents}句 均${wps.toFixed(1)}词/句 → 每句上限 ${capPerSent}s`);
  sql+=`-- ${bk.book_key}(每句上限 ${capPerSent}s)\n`;
  sql+="UPDATE public.library_reading_progress\n";
  sql+=`   SET state = jsonb_set(state, '{seconds}', to_jsonb( LEAST( (state->>'seconds')::numeric, ROUND(((state->>'furthest_seq')::numeric + 1) * ${capPerSent}) ) ))\n`;
  sql+=` WHERE book_id = '${bk.id}'\n`;
  sql+="   AND (state->>'furthest_seq')::numeric >= 0\n";
  sql+=`   AND (state->>'seconds')::numeric > ((state->>'furthest_seq')::numeric + 1) * ${capPerSent};\n`;
}
sql+="COMMIT;\n\n-- 预览(各书句均词 → 每句秒上限):\n"+preview.map(p=>"-- "+p).join("\n")+"\n";
writeFileSync("SQLAA/library-reading-time-cap.sql",sql);
console.log("✓ SQLAA/library-reading-time-cap.sql");
console.log(preview.join("\n"));
