import { readFileSync, writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
const env=Object.fromEntries(readFileSync('.env','utf8').split(/\r?\n/).filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const sb=createClient(env.VITE_SUPABASE_URL,env.VITE_SUPABASE_PUBLISHABLE_KEY);
const e = s => String(s).replace(/'/g, "''");
const PT='c1e17c07-04a0-4660-9f86-807b56eea168';
const KP={ sgpl:'e1f2a3b4-1c2d-4e3f-8a9b-0c1d2e3f4a5b', prox:'f2a3b4c5-2d3e-4f50-9b0c-1d2e3f4a5b6c', q:'a3b4c5d6-3e4f-4051-ac1d-2e3f4a5b6c7d', neg:'b4c5d6e7-4f50-4162-bd2e-3f4a5b6c7d8e' };

const { data } = await sb.from('junior_grammar_questions').select('id,sort_order,stem,option_a,option_b,option_c,option_d,correct_answer,question_type').eq('point_id',PT);
const order=['mcq','fill','transform','translation','correction'];
const qs=data.sort((a,b)=>{const oa=order.indexOf(a.question_type),ob=order.indexOf(b.question_type);if(oa!==ob)return oa-ob;return a.sort_order-b.sort_order;});
if(qs.length!==60) throw new Error('expected 60 got '+qs.length);
const byIdx=i=>qs[i-1];
const at=q=>({A:q.option_a,B:q.option_b,C:q.option_c,D:q.option_d}[q.correct_answer]||'');

// ---- classification (1-based) ----
const delIdx=[49,50];
const proxIdx=[4,5,16,17,18,19,20,21,23,24,28,55,60];                              // 13
const qIdx   =[9,11,12,13,31,32,44,45,46,53];                                      // 10
const negIdx =[7,14,33,34,42,43,54];                                               // 7
const sgplIdx=[1,2,3,6,8,10,15,22,25,26,27,29,30,35,36,37,38,39,40,41,47,48,51,52,56,57,58,59]; // 28 (bottom-fill)

// ---- partition assert ----
const all=new Set(); [...delIdx,...proxIdx,...qIdx,...negIdx,...sgplIdx].forEach(i=>{ if(all.has(i)) throw new Error('overlap '+i); all.add(i); });
if(all.size!==60) throw new Error('partition '+all.size+'!=60');
if(proxIdx.length!==13||qIdx.length!==10||negIdx.length!==7||sgplIdx.length!==28) throw new Error('count mismatch');
// bottom-fill remainder (1..60 minus del/prox/q/neg) must equal sgplIdx
const taken=new Set([...delIdx,...proxIdx,...qIdx,...negIdx]);
const rem=[]; for(let i=1;i<=60;i++) if(!taken.has(i)) rem.push(i);
if(JSON.stringify(rem)!==JSON.stringify(sgplIdx)) throw new Error('bottom-fill remainder != sgplIdx');

// ---- delete assert: #49==#47, #50==#48 (dup) ----
const d49=byIdx(49), k47=byIdx(47), d50=byIdx(50), k48=byIdx(48);
if(!(d49.stem===k47.stem && at(d49)===at(k47))) throw new Error('#49 not dup of #47');
if(!(d50.stem===k48.stem && at(d50)===at(k48))) throw new Error('#50 not dup of #48');
const DEL=[ {id:d49.id,sort:d49.sort_order,keep:k47.sort_order}, {id:d50.id,sort:d50.sort_order,keep:k48.sort_order} ];
if(d49.id!=='d887f840-90c7-40fe-b29d-574972348719'||d50.id!=='f978c65b-6908-4ad4-a358-8925b03e15ca') throw new Error('delete id mismatch');

// ---- 5 explanations (all mcq) ----
const EXPL=[
  { id:'c36a08e1-6140-4f9b-8817-4283a87523ab', ex:`就近原则:There be 后接并列名词时,**be 与最近的(第一个)名词一致**→a library(单数)用 **is**。` },          // 8200 prox is
  { id:'a1fc29f6-9f42-4169-b7c0-80cb0ebc7572', ex:`就近原则:看最近的名词 a teachers' office(单数)→用 **is**(There is a... and three classrooms)。` },        // 8210 prox is
  { id:'2ece3380-fc62-4697-82a3-f11355c59412', ex:`就近原则:最近的 three computer rooms(复数)→用 **are**(There are... and a big library)。` },               // 8220 prox are
  { id:'0ba01b76-d541-4d2a-8874-96892cf0b36f', ex:`就近原则:最近的 a map(单数)→用 **is**(There is a map... and two pictures)。` },                            // 8223 prox is
  { id:'cf5de747-1cc5-455b-a859-5f5c1998ef0d', ex:`thirty students 是**复数**名词→There **are**。be 与后面名词的单复数一致。` },                                 // 8414 sgpl are
];

// ---- build SQL ----
let sql='';
sql+="-- ============================================================\n";
sql+="-- t06 there be : 建4kp + 删2重复 + 标kp_id(58) + 补5解析\n";
sql+="-- 整文件可一次跑(DELETE那段已注释包裹,可单独跑)\n";
sql+="-- ============================================================\n\n";

sql+="-- 【第一段】建 4 kp (WHERE NOT EXISTS by code 幂等)\n";
const KROW=[['sgpl','g7-t06-sgpl','单复数(There is单数/不可数 vs There are复数)',1],['prox','g7-t06-prox','就近原则(A and B就近决定is/are)',2],['q','g7-t06-q','疑问与简答(Is/Are there...?/Yes/No简答/提问)',3],['neg','g7-t06-neg','否定(There isn'+"'"+'t/aren'+"'"+'t/no)',4]];
KROW.forEach(([k,code,title,so])=>{
  sql+="INSERT INTO junior_knowledge_points (id, point_id, code, title, summary, sort_order, target_count)\n";
  sql+=`SELECT '${KP[k]}', '${PT}', '${code}', '${e(title)}', NULL, ${so}, 20\n`;
  sql+=`WHERE NOT EXISTS (SELECT 1 FROM junior_knowledge_points WHERE code = '${code}');\n\n`;
});

sql+="-- ↓↓↓ 【第二段】删 2 重复题 (sort289=#47重复, sort290=#48重复) —— 可单独跑 ↓↓↓\n";
DEL.forEach(d=>sql+=`DELETE FROM junior_grammar_questions WHERE id = '${d.id}';  -- sort${d.sort} (与保留的 sort${d.keep} 题干答案一致)\n`);
sql+="-- ↑↑↑ DELETE 结束 ↑↑↑\n\n";

sql+=`-- 【第三段】标 kp_id : 先显式 prox(${proxIdx.length})/q(${qIdx.length})/neg(${negIdx.length}), 再兜底 sgpl(${sgplIdx.length})\n`;
sql+=`-- ① prox 就近原则 → ${KP.prox}\n`;
proxIdx.forEach(i=>sql+=`UPDATE junior_grammar_questions SET kp_id = '${KP.prox}' WHERE id = '${byIdx(i).id}';  -- #${i} sort${byIdx(i).sort_order}\n`);
sql+=`\n-- ② q 疑问与简答 → ${KP.q}\n`;
qIdx.forEach(i=>sql+=`UPDATE junior_grammar_questions SET kp_id = '${KP.q}' WHERE id = '${byIdx(i).id}';  -- #${i} sort${byIdx(i).sort_order}\n`);
sql+=`\n-- ③ neg 否定 → ${KP.neg}\n`;
negIdx.forEach(i=>sql+=`UPDATE junior_grammar_questions SET kp_id = '${KP.neg}' WHERE id = '${byIdx(i).id}';  -- #${i} sort${byIdx(i).sort_order}\n`);
sql+=`\n-- ④ 兜底 sgpl : 剩余 kp_id IS NULL 全部 → ${KP.sgpl} (删2道后应正好${sgplIdx.length}道)\n`;
sql+=`UPDATE junior_grammar_questions SET kp_id = '${KP.sgpl}' WHERE point_id = '${PT}' AND kp_id IS NULL;\n\n`;

sql+="-- 【第四段】补 5 道缺解析 (全mcq); 只 SET explanation\n";
EXPL.forEach(u=>sql+=`UPDATE junior_grammar_questions SET explanation = '${e(u.ex)}' WHERE id = '${u.id}';\n`);
sql+="\n";

const nKp=4, nDel=DEL.length, nTag=proxIdx.length+qIdx.length+negIdx.length+1, nExpl=EXPL.length;
sql+=`-- 本文件语句数: 建kp ${nKp} + DELETE ${nDel} + 标kp ${nTag}(${proxIdx.length}prox+${qIdx.length}q+${negIdx.length}neg显式+1兜底,共标${proxIdx.length+qIdx.length+negIdx.length+sgplIdx.length}行) + 解析 ${nExpl} = ${nKp+nDel+nTag+nExpl}条\n\n`;

sql+="-- 【校验段】以下3条单独跑\n";
sql+=`SELECT count(*) AS n, kp_id FROM junior_grammar_questions WHERE point_id='${PT}' GROUP BY kp_id; -- 应 sgpl28/prox13/q10/neg7\n`;
sql+=`SELECT count(*) AS still_null FROM junior_grammar_questions WHERE point_id='${PT}' AND kp_id IS NULL; -- 应 0\n`;
sql+=`SELECT count(*) AS mcq_no_expl FROM junior_grammar_questions WHERE point_id='${PT}' AND question_type='mcq' AND (explanation IS NULL OR explanation=''); -- 应 0\n\n`;
sql+="-- END OF FILE t06-all.sql\n";

writeFileSync('scripts/t06-all.sql',sql);

// ---- self-check ----
const sq=(sql.match(/'/g)||[]).length;
const uuids=[...sql.matchAll(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g)].map(m=>m[0]);
console.log('=== kp UUID ===');
Object.entries(KP).forEach(([k,v])=>console.log(`g7-t06-${k.padEnd(5)} : ${v}`));
console.log('\n=== 自查 ===');
console.log('partition 1..60 完整无重叠:', all.size===60?'✓':'✗');
console.log('兜底remainder==sgplIdx(28全单复数):', JSON.stringify(rem)===JSON.stringify(sgplIdx)?'✓':'✗');
console.log('prox/q/neg/sgpl =', proxIdx.length,'/',qIdx.length,'/',negIdx.length,'/',sgplIdx.length,'(应13/10/7/28)');
console.log('DELETE断言 #49==#47 & #50==#48:', '✓ (脚本throw才会拦,此处已过)');
console.log('解析5条全mcq, id不在删除名单:', EXPL.length===5 && EXPL.every(x=>!DEL.some(d=>d.id===x.id))?'✓':'✗');
console.log('single-quote total:', sq, sq%2===0?'(EVEN ✓)':'(ODD ✗)');
console.log('kp UUID 4唯一:', new Set(Object.values(KP)).size===4?'✓':'✗', '| 全UUID36字符:', uuids.every(u=>u.length===36)?'✓':'✗');
console.log('撇号双写 isn'+"'"+'t/aren'+"'"+'t 出现:', /isn''t/.test(sql)&&/aren''t/.test(sql)?'✓':'✗');
console.log('语句数: 建kp',nKp,'+DEL',nDel,'+标kp',nTag,'+解析',nExpl,'=',nKp+nDel+nTag+nExpl);
console.log('END marker:', /-- END OF FILE t06-all\.sql\n$/.test(sql)?'✓':'✗');
process.exit(0);
