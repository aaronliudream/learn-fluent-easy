import { readFileSync, writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
const env=Object.fromEntries(readFileSync('.env','utf8').split(/\r?\n/).filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const sb=createClient(env.VITE_SUPABASE_URL,env.VITE_SUPABASE_PUBLISHABLE_KEY);
const e = s => String(s).replace(/'/g, "''");
const PT='e118e032-dcb7-44b8-b9ac-8ef64ad41835';
const KP={ ordinal:'d1e2f3a4-b5c6-4d70-8e91-f2a3b4c5d6e7', cardinal:'d2f3a4b5-c6d7-4e81-9f02-a3b4c5d6e7f8' };

const { data } = await sb.from('junior_grammar_questions').select('id,sort_order,stem,option_a,option_b,option_c,option_d,correct_answer,question_type').eq('point_id',PT);
const order=['mcq','fill','transform','translation','correction'];
const qs=data.sort((a,b)=>{const oa=order.indexOf(a.question_type),ob=order.indexOf(b.question_type);if(oa!==ob)return oa-ob;return a.sort_order-b.sort_order;});
if(qs.length!==65) throw new Error('expected 65 got '+qs.length);
const byIdx=i=>qs[i-1];
const at=q=>({A:q.option_a,B:q.option_b,C:q.option_c,D:q.option_d}[q.correct_answer]||'');

const delIdx=[19];
const cardinalIdx=[1,4,5,9,11,13,28,29,42,43,50,54,57,59,60,61,65];                 // 17
const ordinalIdx=[2,3,6,7,8,10,12,14,15,16,17,18,20,21,22,23,24,25,26,27,30,31,32,33,34,35,36,37,38,39,40,41,44,45,46,47,48,49,51,52,53,55,56,58,62,63,64]; // 47 bottom-fill

// partition assert
const all=new Set(); [...delIdx,...cardinalIdx,...ordinalIdx].forEach(i=>{ if(all.has(i)) throw new Error('overlap '+i); all.add(i); });
if(all.size!==65) throw new Error('partition '+all.size+'!=65');
if(cardinalIdx.length!==17||ordinalIdx.length!==47) throw new Error('count: card '+cardinalIdx.length+' ord '+ordinalIdx.length);
const taken=new Set([...delIdx,...cardinalIdx]);
const rem=[]; for(let i=1;i<=65;i++) if(!taken.has(i)) rem.push(i);
if(JSON.stringify(rem)!==JSON.stringify(ordinalIdx)) throw new Error('bottom-fill remainder != ordinalIdx');

// delete assert: #19 sort8602, December, answer twelfth ; #6 also December/twelfth (dup)
const d19=byIdx(19), k6=byIdx(6);
if(d19.sort_order!==8602) throw new Error('#19 sort != 8602: '+d19.sort_order);
if(!/December/i.test(d19.stem) || at(d19).toLowerCase()!=='twelfth') throw new Error('#19 not December/twelfth');
if(!/December/i.test(k6.stem) || at(k6).toLowerCase()!=='twelfth') throw new Error('#6 not December/twelfth (dup check)');
const DEL_ID=d19.id;

// build (no explanation section: 缺解析=0)
let sql='';
sql+="-- ============================================================\n";
sql+="-- t10 基数/序数词 : 建2kp + 删1重复(#19) + 标kp_id(64)\n";
sql+="-- 缺解析0,无解析段。整文件可一次跑(DELETE段已注释包裹)\n";
sql+="-- ============================================================\n\n";

sql+="-- 【第一段】建 2 kp (WHERE NOT EXISTS by code 幂等)\n";
const KROW=[['ordinal','g7-t10-ordinal','序数词(变化规则first/fifth/eighth/ninth/twelfth/twentieth+日期/楼层/年级/排名)',1],['cardinal','g7-t10-cardinal','基数词(基本数字+计数+年龄)',2]];
KROW.forEach(([k,code,title,so])=>{
  sql+="INSERT INTO junior_knowledge_points (id, point_id, code, title, summary, sort_order, target_count)\n";
  sql+=`SELECT '${KP[k]}', '${PT}', '${code}', '${e(title)}', NULL, ${so}, 20\n`;
  sql+=`WHERE NOT EXISTS (SELECT 1 FROM junior_knowledge_points WHERE code = '${code}');\n\n`;
});

sql+="-- ↓↓↓ 【第二段】删 1 重复题 (#19 sort8602 December twelfth, ≈#6 sort6) —— 可单独跑 ↓↓↓\n";
sql+=`DELETE FROM junior_grammar_questions WHERE id = '${DEL_ID}';  -- #19 sort8602 (与保留的 #6 sort6 题干答案近似)\n`;
sql+="-- ↑↑↑ DELETE 结束 ↑↑↑\n\n";

sql+=`-- 【第三段】标 kp_id : 先显式 cardinal(${cardinalIdx.length}), 再兜底 ordinal(${ordinalIdx.length})\n`;
sql+=`-- ① cardinal 基数词 → ${KP.cardinal}\n`;
cardinalIdx.forEach(i=>sql+=`UPDATE junior_grammar_questions SET kp_id = '${KP.cardinal}' WHERE id = '${byIdx(i).id}';  -- #${i} sort${byIdx(i).sort_order}\n`);
sql+=`\n-- ② 兜底 ordinal 序数词 : 剩余 kp_id IS NULL 全部 → ${KP.ordinal} (删#19后应正好${ordinalIdx.length}道)\n`;
sql+=`UPDATE junior_grammar_questions SET kp_id = '${KP.ordinal}' WHERE point_id = '${PT}' AND kp_id IS NULL;\n\n`;

const nKp=2,nDel=1,nTag=cardinalIdx.length+1;
sql+=`-- 本文件语句数: 建kp ${nKp} + DELETE ${nDel} + 标kp ${nTag}(${cardinalIdx.length}cardinal显式+1兜底,共标${cardinalIdx.length+ordinalIdx.length}行) = ${nKp+nDel+nTag}条 (缺解析0,无解析段)\n\n`;

sql+="-- 【校验段】以下2条单独跑\n";
sql+=`SELECT count(*) AS n, kp_id FROM junior_grammar_questions WHERE point_id='${PT}' GROUP BY kp_id; -- 应 ordinal47/cardinal17\n`;
sql+=`SELECT count(*) AS still_null FROM junior_grammar_questions WHERE point_id='${PT}' AND kp_id IS NULL; -- 应 0\n\n`;
sql+="-- END OF FILE t10-all.sql\n";

writeFileSync('scripts/t10-all.sql',sql);

const sq=(sql.match(/'/g)||[]).length;
const uuids=[...sql.matchAll(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g)].map(m=>m[0]);
console.log('=== kp UUID ===');
Object.entries(KP).forEach(([k,v])=>console.log(`g7-t10-${k.padEnd(8)} : ${v}`));
console.log('\n=== 自查 ===');
console.log('partition 1..65 完整无重叠:', all.size===65?'✓':'✗');
console.log('兜底remainder==ordinalIdx(47全序数):', JSON.stringify(rem)===JSON.stringify(ordinalIdx)?'✓':'✗');
console.log('cardinal/ordinal =', cardinalIdx.length,'/',ordinalIdx.length,'(应17/47)');
console.log('DELETE断言 #19=sort8602+December+twelfth, #6也December+twelfth:', '✓ (throw才会拦,此处已过)');
console.log('DELETE id:', DEL_ID);
console.log('single-quote total:', sq, sq%2===0?'(EVEN ✓)':'(ODD ✗)');
console.log('kp UUID 2唯一:', new Set(Object.values(KP)).size===2?'✓':'✗','| 全UUID36:', uuids.every(u=>u.length===36)?'✓':'✗');
console.log('无解析段(缺解析0):', !/SET explanation/.test(sql)?'✓':'✗');
console.log('语句数:', nKp,'+',nDel,'+',nTag,'=',nKp+nDel+nTag);
console.log('END marker:', /-- END OF FILE t10-all\.sql\n$/.test(sql)?'✓':'✗');
process.exit(0);
