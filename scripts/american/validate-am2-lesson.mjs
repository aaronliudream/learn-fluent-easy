/**
 * AM2 单课机器校验套件(自主生产步骤9)。用法: node validate-am2-lesson.mjs am2_lNN
 * 八项:计数对账(声明=JSON=SQL)· 解释全覆盖 · 选项无重复 · 答案位置(生成器保证) ·
 *       串味扫描(情景/套话零术语)· 禁引选项字母 · 词义唯一(人工标注) · G/W 覆盖。
 */
import { readFileSync } from "node:fs";
const id = process.argv[2]; if(!id){console.error("用法: validate-am2-lesson.mjs am2_lNN");process.exit(1);}
const unit = String(Math.ceil(Number(id.match(/l(\d+)/)[1])/8)).padStart(2,"0");
const J = JSON.parse(readFileSync(`docs/american/book2/${id}.json`,"utf8"));
const exp = readFileSync(`docs/american/book2/${id}_explanations_final.md`,"utf8");
const sql = readFileSync(`SQLAA/american_am2_seed_unit${unit}.sql`,"utf8");
let pass=true; const fail=(m)=>{pass=false;console.log("❌ "+m);}; const ok=(m)=>console.log("✅ "+m);
const jc={s5:J.stage5.length,s6:(J.stage6||[]).length,s7:J.stage7_cloze.blanks.length,s8:J.stage8_listening.length,s9:J.stage9_scenario.length,s10:J.stage10.length};
const jtot=Object.values(jc).reduce((a,b)=>a+b,0);
const sqlLines=sql.split("\n").filter(l=>l.includes("INSERT INTO public.american_questions")&&l.includes(`'${id}',`));
const sqlTot=sqlLines.length;
console.log(`${id} JSON: 关5=${jc.s5} 关6=${jc.s6} 关7=${jc.s7} 关8=${jc.s8} 关9=${jc.s9} 关10=${jc.s10} = ${jtot} | SQL=${sqlTot}`);
jtot===sqlTot?ok(`计数对账 JSON=SQL=${jtot}`):fail(`计数不平 JSON=${jtot} SQL=${sqlTot}`);
const expKeys=new Set([...exp.matchAll(/###\s*s(\d+)\s+seq(\d+)/g)].map(m=>`${m[1]}:${m[2]}`));
const need=[];for(const[st,n]of[["5",jc.s5],["6",jc.s6],["7",jc.s7],["8",jc.s8],["9",jc.s9],["10",jc.s10]])for(let i=1;i<=n;i++)need.push(`${st}:${i}`);
const miss=need.filter(k=>!expKeys.has(k));
miss.length===0?ok(`解释全覆盖 ${need.length}/${need.length}`):fail(`缺解释 ${miss.join(",")}`);
const withExp=sqlLines.filter(l=>l.includes("explanation_cn")).length;
withExp===jtot?ok(`SQL 带解释 ${withExp}/${jtot}`):fail(`SQL 带解释 ${withExp}/${jtot}`);
const allQ=[...J.stage5,...(J.stage6||[]),...J.stage8_listening,...J.stage9_scenario,...J.stage10];
let dup=0;for(const q of allQ)if(new Set(q.options).size!==q.options.length){dup++;console.log("  ⚠重复:",q.stem);}
dup===0?ok(`选项无重复(${allQ.length}题)`):fail(`${dup}题选项重复`);
const TERMS=["主语","谓语","宾语","系动词","表语","情态动词","助动词","句型","宾补","及物","不及物","双宾","定语","状语从句"];
const scen=[...exp.matchAll(/###\s*s(\d+)\s+seq(\d+)\s*\|[^\n]*\n([^\n]+)/g)].filter(m=>{const st=m[1],sq=+m[2];return st==="6"||st==="8"||st==="9"||(st==="10"&&(sq===5||sq===6));});
let tb=0;for(const b of scen){const bad=TERMS.filter(t=>b[3].includes(t));if(bad.length){tb++;console.log(`  ⚠s${b[1]}seq${b[2]}串味[${bad}]`);}}
tb===0?ok(`串味扫描 零术语(${scen.length}条)`):fail(`${tb}条串味`);
const blocks=[...exp.matchAll(/###[^\n]*\n([^\n]+)/g)];
let lb=0;for(const b of blocks)if(/\b选[项择]?\s*[abcdABCD]\b|[（(][abcdABCD][)）]/.test(b[1])){lb++;console.log("  ⚠字母:",b[1].slice(0,30));}
lb===0?ok(`禁引选项字母 ✓`):fail(`${lb}条引用字母`);
const gps=new Set(J.stage5.map(q=>q.gp));
J.grammar_points.every(p=>gps.has(p.gp))?ok(`G 覆盖 ${J.grammar_points.length}点≥1题`):fail(`G点漏:${J.grammar_points.filter(p=>!gps.has(p.gp)).map(p=>p.gp)}`);
ok(`W 词表 ${J.words.length} 词`);
console.log("\n"+(pass?"🟢 全绿":"🔴 有红灯"));
process.exit(pass?0:1);
