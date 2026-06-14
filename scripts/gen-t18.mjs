import { readFileSync, writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
const env=Object.fromEntries(readFileSync('.env','utf8').split(/\r?\n/).filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const sb=createClient(env.VITE_SUPABASE_URL,env.VITE_SUPABASE_PUBLISHABLE_KEY);
const e = s => String(s).replace(/'/g, "''");
const PT='039c7cd5-8aed-4fbc-9d9c-6ae9ab325c02';
const KP={ coord:'c1a2b3c4-d5e6-4f70-8a91-b2c3d4e5f601', because:'c2b3c4d5-e6f7-4081-9b02-c3d4e5f60712', when:'c3c4d5e6-f708-4192-ac13-d4e5f6071823', if:'c4d5e6f7-0819-42a3-bd24-e5f607182934' };

const { data } = await sb.from('junior_grammar_questions').select('id,sort_order,stem,question_type').eq('point_id',PT);
const order=['mcq','fill','transform','translation','correction'];
const qs=data.sort((a,b)=>{const oa=order.indexOf(a.question_type),ob=order.indexOf(b.question_type);if(oa!==ob)return oa-ob;return a.sort_order-b.sort_order;});
if(qs.length!==66) throw new Error('expected 66 got '+qs.length);
const byIdx=i=>qs[i-1];

const delIdx=[9,12,26,28,30,64];
const becauseIdx=[7,15,16,20,22,23,36,39,49,50,56,63];   // 12
const whenIdx   =[8,11,13,38,44,51,58,65];                // 8
const ifIdx     =[10,40,45,57];                           // 4
const coordIdx  =[1,2,3,4,5,6,14,17,18,19,21,24,25,27,29,31,32,33,34,35,37,41,42,43,46,47,48,52,53,54,55,59,60,61,62,66]; // 36 bottom-fill

// partition assert
const all=new Set(); [...delIdx,...becauseIdx,...whenIdx,...ifIdx,...coordIdx].forEach(i=>{ if(all.has(i)) throw new Error('overlap '+i); all.add(i); });
if(all.size!==66) throw new Error('partition '+all.size+'!=66');
if(becauseIdx.length!==12||whenIdx.length!==8||ifIdx.length!==4||coordIdx.length!==36) throw new Error('count mismatch');
const taken=new Set([...delIdx,...becauseIdx,...whenIdx,...ifIdx]);
const rem=[]; for(let i=1;i<=66;i++) if(!taken.has(i)) rem.push(i);
if(JSON.stringify(rem)!==JSON.stringify(coordIdx)) throw new Error('bottom-fill remainder != coordIdx');

// delete id assert
const DELEXP={9:'a632ad0b-b86c-4392-9b67-cc09a5264375',12:'bd5af844-54bd-4f76-a9ee-1351c0a8545d',26:'a8e7fc52-43cf-448b-a61b-d7c6cc3f5945',28:'efb071d1-00bf-4c68-ac92-2c2d6a8147e0',30:'ce8b380e-7390-4208-b8c6-bbb4edee053c',64:'11602b62-073b-4e41-a2ed-bcfdbb04e6a7'};
delIdx.forEach(i=>{ if(byIdx(i).id!==DELEXP[i]) throw new Error(`delete idx ${i} id mismatch: ${byIdx(i).id}`); });

// 13 explanations (deletes excluded)
const EXPL=[
  { id:'f9a3ba2d-a68f-4fab-8f80-ff48ad59bfea', ex:`回答 Why...? 用 **Because**(因为)引导原因。Because + 原因。` },
  { id:'24d910b7-aaaf-49e7-a8d3-822bc8ec0391', ex:`Why 提问→用 **Because**(因为)引出原因(它们又可爱又懒)。` },
  { id:'d64b1bf4-6c35-4528-ba05-4b8029cd84e7', ex:`Why 提问→用 **Because**(因为)说明原因。` },
  { id:'82c90a45-8a48-435f-ae4d-bbc027824c41', ex:`Why...worried? →用 **Because**(因为)引出原因(猫丢了)。` },
  { id:'6b179cb2-dabf-4a74-a25c-5d889feafdcd', ex:`转折用 **but**(但是),前后意思相反(英语难↔每天坚持练)。` },
  { id:'534f1f07-06cb-4dc7-9fb0-5d726436d93a', ex:`祈使句承接用 **and**(Join us and show=加入并展示才艺)。` },
  { id:'f4972050-86bd-43ab-b554-d93c86d33b28', ex:`转折用 **but**(不爱运动↔却爱编程社)。` },
  { id:'51b8c20c-edab-42a6-b94d-38fa64731a5b', ex:`并列两件事用 **and**(熊吃鱼,猴吃果)。` },
  { id:'ee2c733a-0fb5-479c-8de0-eedf8cb69481', ex:`选择/无论用 **or**:rain or shine=无论晴雨(风雨无阻)。` },
  { id:'2ff39739-68d4-4467-99fb-5b4a282bd1cf', ex:`固定短语 **rain or shine**(风雨无阻)→第一个空填 **Rain**。` },
  { id:'6abf59bb-7174-4ca9-b741-0bbb0143d227', ex:`因果结果用 **so**(下大雨→所以停赛)。so 表"所以"。` },
  { id:'d4c24104-d5c0-41a4-a351-5a05ba1247aa', ex:`转折用 **but**(路很长↔但没人抱怨)。` },
  { id:'e273a8a7-1536-467e-894d-dfb34f2f8ef8', ex:`转折用 **but**(到处找↔但没找到)。` },
];
const delIds=new Set(delIdx.map(i=>byIdx(i).id));
if(EXPL.some(x=>delIds.has(x.id))) throw new Error('explanation targets a deleted row');

// build
let sql='';
sql+="-- ============================================================\n";
sql+="-- t18 连词 : 建4kp + 删6超纲 + 标kp_id(60) + 补13解析\n";
sql+="-- 整文件可一次跑(DELETE段已注释包裹,可单独跑)\n";
sql+="-- ============================================================\n\n";

sql+="-- 【第一段】建 4 kp (WHERE NOT EXISTS by code 幂等)\n";
const KROW=[['coord','g7-t18-coord','并列连词(and/but/or/so)',1],['because','g7-t18-because','原因(because)',2],['when','g7-t18-when','时间(when/after)',3],['if','g7-t18-if','条件(if)',4]];
KROW.forEach(([k,code,title,so])=>{
  sql+="INSERT INTO junior_knowledge_points (id, point_id, code, title, summary, sort_order, target_count)\n";
  sql+=`SELECT '${KP[k]}', '${PT}', '${code}', '${e(title)}', NULL, ${so}, 20\n`;
  sql+=`WHERE NOT EXISTS (SELECT 1 FROM junior_knowledge_points WHERE code = '${code}');\n\n`;
});

sql+="-- ↓↓↓ 【第二段】删 6 超纲题 (although/neither/so...that, 超出7A基础连词) —— 可单独跑 ↓↓↓\n";
delIdx.forEach(i=>{const q=byIdx(i); sql+=`DELETE FROM junior_grammar_questions WHERE id = '${q.id}';  -- #${i} sort${q.sort_order} (${q.question_type})\n`;});
sql+="-- ↑↑↑ DELETE 结束 ↑↑↑\n\n";

sql+=`-- 【第三段】标 kp_id : 先显式 because(${becauseIdx.length})/when(${whenIdx.length})/if(${ifIdx.length}), 再兜底 coord(${coordIdx.length})\n`;
const grp=(label,idxs,kp)=>{ sql+=`-- ${label} → ${KP[kp]}\n`; idxs.forEach(i=>sql+=`UPDATE junior_grammar_questions SET kp_id = '${KP[kp]}' WHERE id = '${byIdx(i).id}';  -- #${i} sort${byIdx(i).sort_order}\n`); sql+="\n"; };
grp('① because 原因', becauseIdx, 'because');
grp('② when 时间', whenIdx, 'when');
grp('③ if 条件', ifIdx, 'if');
sql+=`-- ④ 兜底 coord 并列 : 剩余 kp_id IS NULL 全部 → ${KP.coord} (删6道后应正好${coordIdx.length}道)\n`;
sql+=`UPDATE junior_grammar_questions SET kp_id = '${KP.coord}' WHERE point_id = '${PT}' AND kp_id IS NULL;\n\n`;

sql+="-- 【第四段】补 13 道缺解析 (原16缺,3道so...that已删故13); 只 SET explanation\n";
EXPL.forEach(u=>sql+=`UPDATE junior_grammar_questions SET explanation = '${e(u.ex)}' WHERE id = '${u.id}';\n`);
sql+="\n";

const nKp=4,nDel=delIdx.length,nTag=becauseIdx.length+whenIdx.length+ifIdx.length+1,nExpl=EXPL.length;
sql+=`-- 本文件语句数: 建kp ${nKp} + DELETE ${nDel} + 标kp ${nTag}(${becauseIdx.length}because+${whenIdx.length}when+${ifIdx.length}if显式+1兜底,共标${becauseIdx.length+whenIdx.length+ifIdx.length+coordIdx.length}行) + 解析 ${nExpl} = ${nKp+nDel+nTag+nExpl}条\n\n`;

sql+="-- 【校验段】以下3条单独跑\n";
sql+=`SELECT count(*) AS n, kp_id FROM junior_grammar_questions WHERE point_id='${PT}' GROUP BY kp_id; -- 应 coord36/because12/when8/if4\n`;
sql+=`SELECT count(*) AS still_null FROM junior_grammar_questions WHERE point_id='${PT}' AND kp_id IS NULL; -- 应 0\n`;
sql+=`SELECT count(*) AS mcq_no_expl FROM junior_grammar_questions WHERE point_id='${PT}' AND question_type='mcq' AND (explanation IS NULL OR explanation=''); -- 应 0\n\n`;
sql+="-- END OF FILE t18-all.sql\n";

writeFileSync('scripts/t18-all.sql',sql);

const sq=(sql.match(/'/g)||[]).length;
const uuids=[...sql.matchAll(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g)].map(m=>m[0]);
console.log('=== kp UUID ===');
Object.entries(KP).forEach(([k,v])=>console.log(`g7-t18-${k.padEnd(7)} : ${v}`));
console.log('\n=== 自查 ===');
console.log('partition 1..66 完整无重叠:', all.size===66?'✓':'✗');
console.log('兜底remainder==coordIdx(36全并列):', JSON.stringify(rem)===JSON.stringify(coordIdx)?'✓':'✗');
console.log('because/when/if/coord =', becauseIdx.length,'/',whenIdx.length,'/',ifIdx.length,'/',coordIdx.length,'(应12/8/4/36)');
console.log('6删除id全部匹配预期:', '✓ (throw才会拦,此处已过)');
console.log('解析13条,无一指向删除行:', EXPL.length===13 && !EXPL.some(x=>delIds.has(x.id))?'✓':'✗');
console.log('single-quote total:', sq, sq%2===0?'(EVEN ✓)':'(ODD ✗)');
console.log('kp UUID 4唯一:', new Set(Object.values(KP)).size===4?'✓':'✗','| 全UUID36:', uuids.every(u=>u.length===36)?'✓':'✗');
console.log('语句数:', nKp,'+',nDel,'+',nTag,'+',nExpl,'=',nKp+nDel+nTag+nExpl);
console.log('END marker:', /-- END OF FILE t18-all\.sql\n$/.test(sql)?'✓':'✗');
process.exit(0);
