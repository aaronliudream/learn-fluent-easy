import { readFileSync, writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
const env=Object.fromEntries(readFileSync('.env','utf8').split(/\r?\n/).filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const sb=createClient(env.VITE_SUPABASE_URL,env.VITE_SUPABASE_PUBLISHABLE_KEY);
const e = s => String(s).replace(/'/g, "''");
const PT='48e78919-5b25-4e64-9e8e-d801c5d950fd';
const KPNEW={ who:'f1a2b3c4-1d2e-4f30-8a41-5b2c3d4e5f61', when:'f2b3c4d5-2e3f-4041-8b52-6c3d4e5f6072', why:'f3c4d5e6-3f40-4152-9c63-7d4e5f607183', how:'f4d5e6f7-4051-4263-ad74-8e5f60718394', howmany:'f5e6f708-5162-4374-be85-9f60718394a5' };

const { data: qs } = await sb.from('junior_grammar_questions').select('id,sort_order,stem,option_a,option_b,option_c,option_d,correct_answer,question_type,kp_id').eq('point_id',PT);
const untag=qs.filter(q=>!q.kp_id);
if(untag.length!==82) throw new Error('untagged != 82: '+untag.length);
const bySort={}; untag.forEach(q=>{ if(bySort[q.sort_order]) throw new Error('dup sort '+q.sort_order); bySort[q.sort_order]=q; });
const at=q=>({A:q.option_a,B:q.option_b,C:q.option_c,D:q.option_d}[q.correct_answer]||'');

// existing kp ids by code
const { data: kps } = await sb.from('junior_knowledge_points').select('id,code').eq('point_id',PT);
const kpByCode=Object.fromEntries(kps.map(k=>[k.code,k.id]));
const KP={
  what:kpByCode['g7-t08-what'], 'where-howold':kpByCode['g7-t08-where-howold'],
  who:KPNEW.who, when:KPNEW.when, why:KPNEW.why, how:KPNEW.how, howmany:KPNEW.howmany,
};
if(!KP.what||!KP['where-howold']) throw new Error('missing existing kp');

const delIdx=[288];
const CLS={
  what:[15,9022,9032,9509,9532,9613,366,368,374,375,381,389,393],
  'where-howold':[8625,9350,9428,9708,9732,9747,367,187,385,390,400,186,382,391,397],
  who:[4,8014,8314,369,383,399,13,376,388,12,378],
  when:[6,8304,8320,8605,9310,9330,379,14,8501,8521,8645,371,384],
  why:[9,8330,9012,9653,370,386,392],
  how:[8,8002,8531,9506,9633,9714,377,394],
  howmany:[10,372,387,395,398,11,373,8511,9200,9207,9240,380,9227,9247],
};
const EXPECT={what:13,'where-howold':15,who:11,when:13,why:7,how:8,howmany:14};

// partition assert (del + 7 classes == 82, no overlap, no gap)
const seen=new Map(); const overlap=[];
for(const s of delIdx){ if(seen.has(s)) overlap.push(s); else seen.set(s,'DEL'); }
for(const [k,arr] of Object.entries(CLS)){
  if(arr.length!==EXPECT[k]) throw new Error(`${k} count ${arr.length}!=${EXPECT[k]}`);
  for(const s of arr){ if(seen.has(s)) overlap.push(s); else seen.set(s,k); }
}
if(overlap.length) throw new Error('overlap: '+overlap.join(','));
const tagTotal=Object.values(CLS).reduce((a,b)=>a+b.length,0);
if(tagTotal!==81) throw new Error('tag total '+tagTotal+'!=81');
for(const s of seen.keys()) if(!bySort[s]) throw new Error('classified sort not in untagged: '+s);
for(const s of Object.keys(bySort)) if(!seen.has(Number(s))) throw new Error('untagged sort not classified: '+s);

// DELETE assert: #288 ≈ #187 (both Where book on desk)
const d288=bySort[288], k187=bySort[187];
if(!d288) throw new Error('#288 not in untagged');
if(!/on the desk/i.test(d288.stem) || at(d288)!==at(k187)) throw new Error('#288 not dup of #187');
const DEL_ID=d288.id;

// build
let sql='';
sql+="-- ============================================================\n";
sql+="-- t08 补标 kp_id : 建5新kp(who/when/why/how/howmany) + 删重复#288 + 81道全显式标\n";
sql+="-- 只标 kp_id IS NULL 的,不动已标40道。整文件可一次跑(DELETE已包裹)\n";
sql+="-- ============================================================\n\n";

sql+="-- 【第一段】建 5 新 kp (现有 what/where-howold 不动)\n";
const KROW=[['who','g7-t08-who','人物·所属·选择(Who/Whose/Which)',3],['when','g7-t08-when','时间(When/What time)',4],['why','g7-t08-why','原因(Why...Because)',5],['how','g7-t08-how','方式状态(How...by/on foot/feel/spell)',6],['howmany','g7-t08-howmany','数量程度(How many/much/often/long)',7]];
KROW.forEach(([k,code,title,so])=>{
  sql+="INSERT INTO junior_knowledge_points (id, point_id, code, title, summary, sort_order, target_count)\n";
  sql+=`SELECT '${KPNEW[k]}', '${PT}', '${code}', '${e(title)}', NULL, ${so}, 20\n`;
  sql+=`WHERE NOT EXISTS (SELECT 1 FROM junior_knowledge_points WHERE code = '${code}');\n\n`;
});

sql+="-- ↓↓↓ 【第二段】删重复 #288 (≈#187, 都'对划线 book on the desk→Where') —— 可单独跑 ↓↓↓\n";
sql+=`DELETE FROM junior_grammar_questions WHERE id = '${DEL_ID}';  -- sort288 (与保留的 sort187 题干答案一致)\n`;
sql+="-- ↑↑↑ DELETE 结束 ↑↑↑\n\n";

sql+="-- 【第三段】81道全显式标 kp_id (WHERE id AND kp_id IS NULL 双保险)\n";
const CLABEL={what:'What类',['where-howold']:'Where/How old',who:'人物所属选择',when:'时间',why:'原因',how:'方式',howmany:'数量程度'};
let tagCount=0;
for(const [k,arr] of Object.entries(CLS)){
  sql+=`-- ${k} ${CLABEL[k]} (${arr.length}道) → ${KP[k]}\n`;
  for(const s of arr){
    sql+=`UPDATE junior_grammar_questions SET kp_id = '${KP[k]}' WHERE id = '${bySort[s].id}' AND kp_id IS NULL;  -- sort${s}\n`;
    tagCount++;
  }
  sql+="\n";
}

const nKp=5,nDel=1;
sql+=`-- 本文件语句数: 建kp ${nKp} + DELETE ${nDel} + 标kp ${tagCount} = ${nKp+nDel+tagCount}条\n\n`;
sql+="-- 【校验段】以下2条单独跑\n";
sql+=`SELECT count(*) AS n, kp_id FROM junior_grammar_questions WHERE point_id='${PT}' GROUP BY kp_id; -- 7 kp 合计121 (what33/where-howold35/who11/when13/why7/how8/howmany14)\n`;
sql+=`SELECT count(*) AS still_null FROM junior_grammar_questions WHERE point_id='${PT}' AND kp_id IS NULL; -- 应 0\n\n`;
sql+="-- END OF FILE t08-tag.sql\n";

writeFileSync('scripts/t08-tag.sql',sql);

const sq=(sql.match(/'/g)||[]).length;
console.log('=== 5 新 kp UUID ===');
Object.entries(KPNEW).forEach(([k,v])=>console.log(`g7-t08-${k.padEnd(8)} : ${v}`));
console.log('现有: what',KP.what,'| where-howold',KP['where-howold']);
console.log('\n=== 自查 ===');
console.log('未标=82:', untag.length===82?'✓':'✗');
console.log('del1 + 7类tag81 = 82, 无重叠无遗漏:', tagTotal===81 && !overlap.length?'✓':'✗');
console.log('每类:', Object.entries(CLS).map(([k,a])=>`${k.replace('where-howold','who')}${a.length}`).join('/'));
console.log('DELETE #288≈#187断言:', '✓ (throw才拦,已过) id='+DEL_ID);
console.log('标记语句=81:', tagCount===81?'✓':'✗');
console.log('5新kp UUID唯一:', new Set(Object.values(KPNEW)).size===5?'✓':'✗');
console.log('single-quote total:', sq, sq%2===0?'(EVEN ✓)':'(ODD ✗)');
console.log('语句数:', nKp,'+',nDel,'+',tagCount,'=',nKp+nDel+tagCount,'(应87)');
console.log('END marker:', /-- END OF FILE t08-tag\.sql\n$/.test(sql)?'✓':'✗');
process.exit(0);
