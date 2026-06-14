import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
const env=Object.fromEntries(readFileSync('.env','utf8').split(/\r?\n/).filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const sb=createClient(env.VITE_SUPABASE_URL,env.VITE_SUPABASE_PUBLISHABLE_KEY);
const e = s => String(s).replace(/'/g, "''");
const PT='0d9a7c0c-1628-4f03-b3b0-f9037e02c46f';

// kp UUIDs (hardcoded for stability)
const KP={ ability:'a1d4f7b2-3c6e-4a89-bf21-5e0c8d937a64', neg:'b2e5a8c3-4d7f-4b9a-8c12-6f1d9e048b75', q:'c3f6b9d4-5e80-4cab-9d23-7a2e0f159c86' };

// fetch + order identical to classification export
const { data } = await sb.from('junior_grammar_questions').select('id,sort_order,question_type').eq('point_id',PT);
const order=['mcq','fill','transform','translation','correction'];
const qs=data.sort((a,b)=>{const oa=order.indexOf(a.question_type),ob=order.indexOf(b.question_type);if(oa!==ob)return oa-ob;return a.sort_order-b.sort_order;});
if(qs.length!==57) throw new Error('expected 57 got '+qs.length);
const byIdx=i=>qs[i-1];

// ---- classification (1-based) ----
const delIdx=22;
const qIdx  =[3,6,9,13,14,16,17,18,25,29,36,38,40,43,47,49,57];               // 17
const negIdx=[2,7,8,12,15,19,20,21,24,27,31,35,37,39,41,45,48,52,55];          // 19
const abilityIdx=[1,4,5,10,11,23,26,28,30,32,33,34,42,44,46,50,51,53,54,56];   // 20 (bottom-fill)

// ---- safety asserts: partition of 1..57 ----
const all=new Set(); [delIdx,...qIdx,...negIdx,...abilityIdx].forEach(i=>{ if(all.has(i)) throw new Error('overlap idx '+i); all.add(i); });
if(all.size!==57) throw new Error('partition size '+all.size+' !=57');
if(qIdx.length!==17) throw new Error('q!=17');
if(negIdx.length!==19) throw new Error('neg!=19');
if(abilityIdx.length!==20) throw new Error('ability!=20');
// bottom-fill remainder = 1..57 minus delete minus q minus neg  => must equal abilityIdx
const explicitOrDel=new Set([delIdx,...qIdx,...negIdx]);
const remainder=[]; for(let i=1;i<=57;i++) if(!explicitOrDel.has(i)) remainder.push(i);
if(JSON.stringify(remainder)!==JSON.stringify(abilityIdx)) throw new Error('bottom-fill remainder != abilityIdx');

// ---- 6 explanations (sort9513=#22 deleted, not补) ----
const EXPL=[
  // q (3)
  { id:'52416137-922a-4c3f-8ec9-97d0e6355925', ex:`**Can + 主语 + 动词原形**构成疑问句;弹奏乐器要用 **play the guitar**(乐器前加 the)。` },
  { id:'20bb804d-00ac-4eea-918f-b205058a0104', ex:`**Can + 主语 + 原形**疑问;说某种语言用 **speak**(speak Chinese),不用 say/tell/talk。` },
  { id:'bc753509-70cd-4eaa-b85a-01840ab54a00', ex:`**Can + 主语 + 动词原形**→**talk**(不加 s、不用 ing)。简答 Yes, it can。` },
  // neg (3)
  { id:'23536a25-03b9-4bb0-94cb-2c9f50b89b75', ex:`询问许可"Can we…?"被拒绝→**No, you can't**(不可以/不准)。can't=cannot,后接动词原形。` },
  { id:'a0e8c033-0fcf-4394-b62e-e5de0c51dcd6', ex:`请求许可"May I…?"被拒绝,口语用 **can't**(不行)。No, you can't 表示不允许。` },
  { id:'d61dc42f-9887-409e-8487-adcfaa357ffe', ex:`请求许可"Can I…?"被拒绝→**No, you can't**(不可以)。can't 表禁止/不许。` },
];
const DEL_ID=byIdx(delIdx).id; // sort9513
if(DEL_ID!=='e70c4328-4d51-4366-94b4-14ffd9829996') throw new Error('delete id mismatch: '+DEL_ID);

// ---- build SQL ----
let sql='';
sql+="-- ============================================================\n";
sql+="-- t11 情态动词 can : 建3kp + 删错位#22 + 标kp_id(56) + 补6解析\n";
sql+="-- 整文件可一次跑(DELETE那条已注释单独标注,可单独跑也可随文件跑)\n";
sql+="-- ============================================================\n\n";

sql+="-- 【第一段】建 3 kp (WHERE NOT EXISTS by code 幂等)\n";
const KROW=[['ability','g7-t11-ability','能力(can/could do,会做某事)',1],['neg','g7-t11-neg','否定(can'+"'"+'t/cannot/couldn'+"'"+'t,不能/禁止/拒绝许可)',2],['q','g7-t11-q','疑问与请求(Can...?/Could you...?/May I...?/简答Yes I can/许可请求)',3]];
KROW.forEach(([k,code,title,so])=>{
  sql+="INSERT INTO junior_knowledge_points (id, point_id, code, title, summary, sort_order, target_count)\n";
  sql+=`SELECT '${KP[k]}', '${PT}', '${code}', '${e(title)}', NULL, ${so}, 20\n`;
  sql+=`WHERE NOT EXISTS (SELECT 1 FROM junior_knowledge_points WHERE code = '${code}');\n\n`;
});

sql+="-- ↓↓↓ 【第二段】删错位题 #22 (sort9513, may=可能,非can) —— 可单独跑 ↓↓↓\n";
sql+=`DELETE FROM junior_grammar_questions WHERE id = '${DEL_ID}';\n`;
sql+="-- ↑↑↑ DELETE 结束 ↑↑↑\n\n";

sql+=`-- 【第三段】标 kp_id : 先显式 q(${qIdx.length})/neg(${negIdx.length}), 再兜底 ability(${abilityIdx.length})\n`;
sql+=`-- ① q 疑问与请求 → ${KP.q}\n`;
qIdx.forEach(i=>sql+=`UPDATE junior_grammar_questions SET kp_id = '${KP.q}' WHERE id = '${byIdx(i).id}';  -- #${i} sort${byIdx(i).sort_order}\n`);
sql+=`\n-- ② neg 否定 → ${KP.neg}\n`;
negIdx.forEach(i=>sql+=`UPDATE junior_grammar_questions SET kp_id = '${KP.neg}' WHERE id = '${byIdx(i).id}';  -- #${i} sort${byIdx(i).sort_order}\n`);
sql+=`\n-- ③ 兜底 ability : 剩余 kp_id IS NULL 全部 → ${KP.ability} (删#22后应正好${abilityIdx.length}道)\n`;
sql+=`UPDATE junior_grammar_questions SET kp_id = '${KP.ability}' WHERE point_id = '${PT}' AND kp_id IS NULL;\n\n`;

sql+="-- 【第四段】补 6 道缺解析 (原7道缺,#22已删故补6); 只 SET explanation\n";
EXPL.forEach(u=>sql+=`UPDATE junior_grammar_questions SET explanation = '${e(u.ex)}' WHERE id = '${u.id}';\n`);
sql+="\n";

const nKp=3, nDel=1, nTag=qIdx.length+negIdx.length+1, nExpl=EXPL.length;
sql+=`-- 本文件语句数: 建kp ${nKp} + DELETE ${nDel} + 标kp ${nTag}(${qIdx.length}q+${negIdx.length}neg显式+1兜底,共标${qIdx.length+negIdx.length+abilityIdx.length}行) + 解析 ${nExpl}(#22删除故6非7) = ${nKp+nDel+nTag+nExpl}条\n\n`;

sql+="-- 【校验段】以下3条单独跑\n";
sql+=`SELECT count(*) AS n, kp_id FROM junior_grammar_questions WHERE point_id='${PT}' GROUP BY kp_id; -- 应 ability20/neg19/q17\n`;
sql+=`SELECT count(*) AS still_null FROM junior_grammar_questions WHERE point_id='${PT}' AND kp_id IS NULL; -- 应 0\n`;
sql+=`SELECT count(*) AS mcq_no_expl FROM junior_grammar_questions WHERE point_id='${PT}' AND question_type='mcq' AND (explanation IS NULL OR explanation=''); -- 应 0\n\n`;
sql+="-- END OF FILE t11-all.sql\n";

writeFileSync('scripts/t11-all.sql',sql);

// ---- self-check report ----
const sq=(sql.match(/'/g)||[]).length;
const uuids=[...sql.matchAll(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g)].map(m=>m[0]);
const kpUuidSet=new Set(Object.values(KP));
console.log('=== kp UUID 对照 ===');
Object.entries(KP).forEach(([k,v])=>console.log(`g7-t11-${k.padEnd(8)} : ${v}`));
console.log('\n=== 自查 ===');
console.log('partition 1..57 无重叠且完整:', all.size===57?'✓':'✗');
console.log('兜底remainder==abilityIdx(20全能力):', JSON.stringify(remainder)===JSON.stringify(abilityIdx)?'✓':'✗');
console.log('q/neg/ability =', qIdx.length,'/',negIdx.length,'/',abilityIdx.length,'(应17/19/20)');
console.log('DELETE id校验(sort9513):', DEL_ID==='e70c4328-4d51-4366-94b4-14ffd9829996'?'✓':'✗');
console.log('解析6条(不含#22):', EXPL.length===6?'✓':'✗', '| 解析id不含DEL_ID:', EXPL.every(x=>x.id!==DEL_ID)?'✓':'✗');
console.log('single-quote total:', sq, sq%2===0?'(EVEN ✓)':'(ODD ✗)');
console.log('all UUID 36-char:', uuids.every(u=>u.length===36)?'✓':'✗', '| kp UUID 3个唯一:', kpUuidSet.size===3?'✓':'✗');
console.log('撇号双写检查(can'+"'"+'t出现于解析):', /can''t/.test(sql)?'✓':'✗');
console.log('语句数: 建kp',nKp,'+ DEL',nDel,'+ 标kp',nTag,'+ 解析',nExpl,'=',nKp+nDel+nTag+nExpl);
console.log('END marker:', /-- END OF FILE t11-all\.sql\n$/.test(sql)?'✓':'✗');
process.exit(0);
