import { readFileSync, writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
const env=Object.fromEntries(readFileSync('.env','utf8').split(/\r?\n/).filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const sb=createClient(env.VITE_SUPABASE_URL,env.VITE_SUPABASE_PUBLISHABLE_KEY);
const e = s => String(s).replace(/'/g, "''");
const PT='d91fb261-b2e0-43e9-b8d2-4e5d0315447b';
const KPNEW={ irregular:'a1b2c3d4-1e2f-4031-8a42-b3c4d5e6f701', uncountable:'a2c3d4e5-2f30-4142-9b53-c4d5e6f70812', quantifier:'a3d4e5f6-3041-4253-ac64-d5e6f7081923' };

const { data: qs } = await sb.from('junior_grammar_questions').select('id,sort_order,kp_id').eq('point_id',PT);
const untag=qs.filter(q=>!q.kp_id);
if(untag.length!==56) throw new Error('untagged != 56: '+untag.length);
const bySort={}; untag.forEach(q=>{ if(bySort[q.sort_order]) throw new Error('dup sort '+q.sort_order); bySort[q.sort_order]=q; });

const { data: kps } = await sb.from('junior_knowledge_points').select('id,code').eq('point_id',PT);
const kpByCode=Object.fromEntries(kps.map(k=>[k.code,k.id]));
const KP={
  'unit1-markers':kpByCode['g7-t01-unit1-markers'],
  irregular:KPNEW.irregular, uncountable:KPNEW.uncountable, quantifier:KPNEW.quantifier,
};
if(!KP['unit1-markers']) throw new Error('missing existing kp unit1-markers');

const CLS={
  'unit1-markers':[3,4,7,9,10,11,16,17,18,24,25,26,28,31,32,33,35,36,37,188,39,40,42,43,44,46,48],
  irregular:[5,6,8,19,20,21,23,29,34,38,41,45,47,50],
  uncountable:[12,13,49,8413,22,27],
  quantifier:[8402,9100,9111,9121,9309,9322,9329,9342,9349],
};
const EXPECT={'unit1-markers':27,irregular:14,uncountable:6,quantifier:9};

// partition assert
const seen=new Map(); const overlap=[];
for(const [k,arr] of Object.entries(CLS)){
  if(arr.length!==EXPECT[k]) throw new Error(`${k} count ${arr.length}!=${EXPECT[k]}`);
  for(const s of arr){ if(seen.has(s)) overlap.push(s); else seen.set(s,k); }
}
if(overlap.length) throw new Error('overlap: '+overlap.join(','));
const total=Object.values(CLS).reduce((a,b)=>a+b.length,0);
if(total!==56) throw new Error('total '+total+'!=56');
for(const s of seen.keys()) if(!bySort[s]) throw new Error('classified sort not in untagged: '+s);
for(const s of Object.keys(bySort)) if(!seen.has(Number(s))) throw new Error('untagged sort not classified: '+s);

let sql='';
sql+="-- ============================================================\n";
sql+="-- t01 补标 kp_id : 建3新kp(irregular/uncountable/quantifier) + 56道全显式标\n";
sql+="-- 只标 kp_id IS NULL 的,不动已标20道。\n";
sql+="-- ============================================================\n\n";

sql+="-- 【第一段】建 3 新 kp (现有 unit1-markers 不动)\n";
const KROW=[['irregular','g7-t01-irregular','不规则复数(sheep/children/men/feet/women/mice/teeth/people等)',2],['uncountable','g7-t01-uncountable','不可数名词与名词作定语(water/bread不加s;paper bags/tooth problems作定语用单数)',3],['quantifier','g7-t01-quantifier','可数不可数限定词(many/much/few/little/fewer/less/a few)',4]];
KROW.forEach(([k,code,title,so])=>{
  sql+="INSERT INTO junior_knowledge_points (id, point_id, code, title, summary, sort_order, target_count)\n";
  sql+=`SELECT '${KPNEW[k]}', '${PT}', '${code}', '${e(title)}', NULL, ${so}, 20\n`;
  sql+=`WHERE NOT EXISTS (SELECT 1 FROM junior_knowledge_points WHERE code = '${code}');\n\n`;
});

sql+="-- 【第二段】56道全显式标 kp_id (WHERE id AND kp_id IS NULL 双保险)\n";
const CLABEL={'unit1-markers':'规则复数',irregular:'不规则复数',uncountable:'不可数名词与名词作定语',quantifier:'可数不可数限定词'};
let tagCount=0;
for(const [k,arr] of Object.entries(CLS)){
  sql+=`-- ${k} ${CLABEL[k]} (${arr.length}道) → ${KP[k]}\n`;
  for(const s of arr){
    sql+=`UPDATE junior_grammar_questions SET kp_id = '${KP[k]}' WHERE id = '${bySort[s].id}' AND kp_id IS NULL;  -- sort${s}\n`;
    tagCount++;
  }
  sql+="\n";
}

const nKp=3;
sql+=`-- 本文件语句数: 建kp ${nKp} + 标kp ${tagCount} = ${nKp+tagCount}条\n\n`;
sql+="-- 【校验段】以下2条单独跑\n";
sql+=`SELECT count(*) AS n, kp_id FROM junior_grammar_questions WHERE point_id='${PT}' GROUP BY kp_id; -- 4 kp 合计76 (unit1-markers47/irregular14/uncountable6/quantifier9)\n`;
sql+=`SELECT count(*) AS still_null FROM junior_grammar_questions WHERE point_id='${PT}' AND kp_id IS NULL; -- 应 0\n\n`;
sql+="-- END OF FILE t01-tag.sql\n";

writeFileSync('scripts/t01-tag.sql',sql);

const sq=(sql.match(/'/g)||[]).length;
console.log('=== 3 新 kp UUID ===');
Object.entries(KPNEW).forEach(([k,v])=>console.log(`g7-t01-${k.padEnd(11)} : ${v}`));
console.log('现有: unit1-markers',KP['unit1-markers']);
console.log('\n=== 自查 ===');
console.log('未标=56:', untag.length===56?'✓':'✗');
console.log('4类合计=56无重叠无遗漏:', total===56&&!overlap.length?'✓':'✗');
console.log('每类:', Object.entries(CLS).map(([k,a])=>`${k.replace('unit1-markers','reg')}${a.length}`).join('/'));
console.log('标记语句=56:', tagCount===56?'✓':'✗');
console.log('3新kp UUID唯一:', new Set(Object.values(KPNEW)).size===3?'✓':'✗', '| 全36:', Object.values(KPNEW).every(u=>u.length===36)?'✓':'✗');
console.log('single-quote total:', sq, sq%2===0?'(EVEN ✓)':'(ODD ✗)');
console.log('语句数:', nKp,'+',tagCount,'=',nKp+tagCount,'(应59)');
console.log('END marker:', /-- END OF FILE t01-tag\.sql\n$/.test(sql)?'✓':'✗');
process.exit(0);
