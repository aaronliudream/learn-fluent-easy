import { readFileSync, writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
const env=Object.fromEntries(readFileSync('.env','utf8').split(/\r?\n/).filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const sb=createClient(env.VITE_SUPABASE_URL,env.VITE_SUPABASE_PUBLISHABLE_KEY);
const e = s => String(s).replace(/'/g, "''");
const PT='6a185802-70df-4c91-a744-33c7b6f33789';
// existing kp (subj/poss/distinguish) + 3 new (obj/nposs/aposs). need kp ids for tagging.
const KPNEW={ obj:'e2a1b3c4-d5e6-4f70-9a81-b2c3d4e5f6a1', nposs:'e3b2c4d5-e6f7-4081-9b92-c3d4e5f6a1b2', aposs:'e4c3d5e6-f708-4192-9ca3-d4e5f6a1b2c3' };

// fetch all t02 questions
const { data: qs } = await sb.from('junior_grammar_questions').select('id,sort_order,kp_id').eq('point_id',PT);
const untag=qs.filter(q=>!q.kp_id);
if(untag.length!==98) throw new Error('untagged != 98: '+untag.length);
const bySort={}; untag.forEach(q=>{ if(bySort[q.sort_order]) throw new Error('dup sort in untagged: '+q.sort_order); bySort[q.sort_order]=q; });

// resolve existing kp ids (subj/poss/distinguish) by code
const { data: kps } = await sb.from('junior_knowledge_points').select('id,code').eq('point_id',PT);
const kpByCode=Object.fromEntries(kps.map(k=>[k.code,k.id]));
const KP={
  subj:kpByCode['g7-t02-subj'], poss:kpByCode['g7-t02-poss'], distinguish:kpByCode['g7-t02-distinguish'],
  obj:KPNEW.obj, nposs:KPNEW.nposs, aposs:KPNEW.aposs,
};
for(const c of ['subj','poss','distinguish']) if(!KP[c]) throw new Error('missing existing kp '+c);

const CLS={
  subj:[8113,8501,8502,8503,8504,8505,8506,8507,8508,8509,8510,8511,8512,8513,8514,8515,66,67,68,69,80,96],
  poss:[8516,8517,8518,8519,8520,8521,8522,8523,8524,8525,8526,71,73,75,78,86,87,89,90,92,98,100,396],
  distinguish:[8130,8527,8528,8529,8530,8531,8532,8533,8534,8535,8536,8537,8538,8539,8540,8541,8542,8543,8544,8545,93],
  obj:[3,6,10,15,8321,70,85,95,99],
  nposs:[4,7,8424,72,74,76,77,79,81,82,83,84,88,91,94,97],
  aposs:[8101,8106,8133,8203,8213,8224,8433],
};
const EXPECT={subj:22,poss:23,distinguish:21,obj:9,nposs:16,aposs:7};

// ---- partition asserts ----
const seen=new Map(); const overlap=[];
for(const [k,arr] of Object.entries(CLS)){
  if(arr.length!==EXPECT[k]) throw new Error(`${k} count ${arr.length}!=${EXPECT[k]}`);
  for(const s of arr){ if(seen.has(s)) overlap.push(s); else seen.set(s,k); }
}
if(overlap.length) throw new Error('overlap sorts: '+overlap.join(','));
const totalCls=Object.values(CLS).reduce((a,b)=>a+b.length,0);
if(totalCls!==98) throw new Error('class total '+totalCls+'!=98');
// every classified sort exists in untagged, every untagged sort classified
for(const s of seen.keys()) if(!bySort[s]) throw new Error('classified sort not in untagged: '+s);
for(const s of Object.keys(bySort)) if(!seen.has(Number(s))) throw new Error('untagged sort not classified: '+s);

// ---- build ----
let sql='';
sql+="-- ============================================================\n";
sql+="-- t02 补标 kp_id : 建3新kp(obj/nposs/aposs) + 98道全显式标(不兜底)\n";
sql+="-- 只标 kp_id IS NULL 的98道,不动已标60道\n";
sql+="-- ============================================================\n\n";

sql+="-- 【第一段】建 3 新 kp (现有 subj/poss/distinguish 不动)\n";
const KROW=[['obj','g7-t02-obj','宾格代词(me/him/her/us/them,动词或介词后)',4],['nposs','g7-t02-nposs','名词性物主代词(mine/yours/his/hers/ours/theirs,单独用)',5],['aposs','g7-t02-aposs','名词所有格'+"'"+'s(单数+'+"'"+'s/复数s结尾加'+"'"+'/并列共有最后+'+"'"+'s)',6]];
KROW.forEach(([k,code,title,so])=>{
  sql+="INSERT INTO junior_knowledge_points (id, point_id, code, title, summary, sort_order, target_count)\n";
  sql+=`SELECT '${KPNEW[k]}', '${PT}', '${code}', '${e(title)}', NULL, ${so}, 20\n`;
  sql+=`WHERE NOT EXISTS (SELECT 1 FROM junior_knowledge_points WHERE code = '${code}');\n\n`;
});

sql+="-- 【第二段】98道全显式标 kp_id (WHERE id AND kp_id IS NULL 双保险,不动已标)\n";
const CLABEL={subj:'主格',poss:'形容词性物主',distinguish:'辨析双空',obj:'宾格',nposs:'名词性物主',aposs:'名词所有格s'};
let tagCount=0;
for(const [k,arr] of Object.entries(CLS)){
  sql+=`-- ${k} ${CLABEL[k]} (${arr.length}道) → ${KP[k]}\n`;
  for(const s of arr){
    const q=bySort[s];
    sql+=`UPDATE junior_grammar_questions SET kp_id = '${KP[k]}' WHERE id = '${q.id}' AND kp_id IS NULL;  -- sort${s}\n`;
    tagCount++;
  }
  sql+="\n";
}

const nKp=3;
sql+=`-- 本文件语句数: 建kp ${nKp} + 标kp ${tagCount} = ${nKp+tagCount}条\n\n`;
sql+="-- 【校验段】以下2条单独跑\n";
sql+=`SELECT count(*) AS n, kp_id FROM junior_grammar_questions WHERE point_id='${PT}' GROUP BY kp_id; -- 6 kp 合计158 (subj42/poss43/distinguish41/obj9/nposs16/aposs7)\n`;
sql+=`SELECT count(*) AS still_null FROM junior_grammar_questions WHERE point_id='${PT}' AND kp_id IS NULL; -- 应 0\n\n`;
sql+="-- END OF FILE t02-tag.sql\n";

writeFileSync('scripts/t02-tag.sql',sql);

const sq=(sql.match(/'/g)||[]).length;
const uuids=[...sql.matchAll(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g)].map(m=>m[0]);
console.log('=== 新 kp UUID ===');
Object.entries(KPNEW).forEach(([k,v])=>console.log(`g7-t02-${k.padEnd(6)} : ${v}`));
console.log('现有 kp id: subj',KP.subj,'poss',KP.poss,'distinguish',KP.distinguish);
console.log('\n=== 自查 ===');
console.log('未标=98:', untag.length===98?'✓':'✗');
console.log('6类合计=98无重叠无遗漏:', totalCls===98&&!overlap.length?'✓':'✗');
console.log('每类count:', Object.entries(CLS).map(([k,a])=>`${k}${a.length}`).join('/'));
console.log('标记语句数=98:', tagCount===98?'✓':'✗');
console.log('3新kp UUID唯一:', new Set(Object.values(KPNEW)).size===3?'✓':'✗');
console.log('single-quote total:', sq, sq%2===0?'(EVEN ✓)':'(ODD ✗)');
console.log("撇号双写 's:", /''s/.test(sql)?'✓':'✗');
console.log('语句数:', nKp,'+',tagCount,'=',nKp+tagCount,'(应101)');
console.log('END marker:', /-- END OF FILE t02-tag\.sql\n$/.test(sql)?'✓':'✗');
process.exit(0);
