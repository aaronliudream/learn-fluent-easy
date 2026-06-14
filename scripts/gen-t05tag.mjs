import { readFileSync, writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
const env=Object.fromEntries(readFileSync('.env','utf8').split(/\r?\n/).filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const sb=createClient(env.VITE_SUPABASE_URL,env.VITE_SUPABASE_PUBLISHABLE_KEY);
const PT='b9cd9a42-3f90-4722-ad55-810e23abfb87';
const KP={ '3sg':'ef2879a5-a18b-496d-97de-6a0adfc2f48a', 'q':'2d7eaa58-c0ef-4d3b-91a0-56ca9698e4f2', 'neg':'f44bded1-08db-4c95-92ac-0526026451e9', 'aff':'92850b5c-07a8-4d9a-a59e-9a86490cede1' };

// fetch + order identically to the classification export
const { data } = await sb.from('junior_grammar_questions').select('id,sort_order,stem,question_type').eq('point_id',PT);
const order=['mcq','fill','transform','translation','correction'];
const qs=data.sort((a,b)=>{const oa=order.indexOf(a.question_type),ob=order.indexOf(b.question_type);if(oa!==ob)return oa-ob;return a.sort_order-b.sort_order;});
if(qs.length!==71) throw new Error('expected 71 got '+qs.length);
// index (1-based) -> question
const byIdx=i=>qs[i-1];

// classification (1-based indices) from the 3-batch review
const qIdx  =[5,14,16,17,20,21, 27,29,45,46, 50,54,55,57,58,59,63,69];      // 18
const negIdx=[10,18,19, 31,32,35,47,48, 52,53,62,65,68];                    // 13
const affIdx=[1,8,13, 25,34,37,44, 60];                                     // 8
const explicit=new Set([...qIdx,...negIdx,...affIdx]);
// 3sg = remainder
const sgIdx=[]; for(let i=1;i<=71;i++) if(!explicit.has(i)) sgIdx.push(i);

// ---- safety asserts ----
if(qIdx.length!==18) throw new Error('q!=18 got '+qIdx.length);
if(negIdx.length!==13) throw new Error('neg!=13 got '+negIdx.length);
if(affIdx.length!==8) throw new Error('aff!=8 got '+affIdx.length);
if(explicit.size!==39) throw new Error('explicit overlap! size '+explicit.size);
if(sgIdx.length!==32) throw new Error('3sg remainder!=32 got '+sgIdx.length);

const upd=(idx,kp)=>`UPDATE junior_grammar_questions SET kp_id = '${KP[kp]}' WHERE id = '${byIdx(idx).id}';`;
let sql='';
sql+="-- ============================================================\n";
sql+="-- t05 标 kp_id : 先标 q/neg/aff(39道,按id), 再兜底 3sg(剩余32)\n";
sql+="-- ⚠️ 先跑 t05-kp.sql 建好4kp, 再跑本文件\n";
sql+="-- ============================================================\n\n";
sql+=`-- ① q 疑问与简答 (${qIdx.length}道 → 2d7eaa58)\n`;
qIdx.forEach(i=>sql+=upd(i,'q')+`  -- #${i} sort${byIdx(i).sort_order}\n`);
sql+=`\n-- ② neg 否定 (${negIdx.length}道 → f44bded1)\n`;
negIdx.forEach(i=>sql+=upd(i,'neg')+`  -- #${i} sort${byIdx(i).sort_order}\n`);
sql+=`\n-- ③ aff 肯定陈述 (${affIdx.length}道 → 92850b5c)\n`;
affIdx.forEach(i=>sql+=upd(i,'aff')+`  -- #${i} sort${byIdx(i).sort_order}\n`);
sql+=`\n-- ④ 兜底 3sg : 剩余 kp_id IS NULL 的全部 → ef2879a5 (应正好${sgIdx.length}道)\n`;
sql+=`UPDATE junior_grammar_questions SET kp_id = '${KP['3sg']}' WHERE point_id = '${PT}' AND kp_id IS NULL;\n\n`;
sql+="-- ⑤ 校验(单独跑): 应 3sg32/q18/neg13/aff8, 无NULL, 合计71\n";
sql+=`SELECT k.code, count(q.id) AS n FROM junior_knowledge_points k LEFT JOIN junior_grammar_questions q ON q.kp_id=k.id WHERE k.code LIKE 'g7-t05-%' GROUP BY k.code ORDER BY k.code;\n`;
sql+=`SELECT count(*) AS still_null FROM junior_grammar_questions WHERE point_id='${PT}' AND kp_id IS NULL; -- 应 0\n`;
writeFileSync('scripts/t05-tag.sql',sql);

// ---- print verification: confirm the 32 bottom-fill remainder are all 3sg in my review ----
const sgExpected=[2,3,4,6,7,9,11,12,15,22,23,24, 26,28,30,33,36,38,39,40,41,42,43, 49,51,56,61,64,66,67,70,71];
const sgMatch = JSON.stringify(sgIdx)===JSON.stringify(sgExpected);
const sqn=(sql.match(/'/g)||[]).length;
console.log('q indices :', qIdx.join(','));
console.log('neg indices:', negIdx.join(','));
console.log('aff indices:', affIdx.join(','));
console.log('3sg remainder (bottom-fill):', sgIdx.join(','));
console.log('3sg remainder == expected 3sg set?', sgMatch ? 'YES ✓ (兜底剩余全是3sg)' : 'NO ✗✗');
console.log('counts: 3sg',sgIdx.length,'q',qIdx.length,'neg',negIdx.length,'aff',affIdx.length,'= ',sgIdx.length+qIdx.length+negIdx.length+affIdx.length);
console.log('single-quote total:', sqn, sqn%2===0?'(EVEN ✓)':'(ODD ✗)');
console.log('UPDATE rows (explicit):', explicit.size, '+ 1 bottom-fill');
process.exit(0);
