import { readFileSync, writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
const env=Object.fromEntries(readFileSync('.env','utf8').split(/\r?\n/).filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const sb=createClient(env.VITE_SUPABASE_URL,env.VITE_SUPABASE_PUBLISHABLE_KEY);
const e=s=>String(s).replace(/'/g,"''");
const at=q=>({A:q.option_a,B:q.option_b,C:q.option_c,D:q.option_d}[q.correct_answer]||'');
const P={t07:'679de02b-b27b-4438-812b-c18579213bdf',t20:'d565b705-65ea-4fa3-8fa9-2f0e5744deb1',t03:'1a83a73f-5d50-4eb2-a097-554b5a7446c0',t19:'e83bf407-8b64-4e7e-b846-745316f0dfcd',t09:'67066e7f-1e4a-4221-878b-eb3ca338f7eb',t17:'9427a850-26ab-4594-a06c-e2c7424bf91f'};

async function missing(pid){
  const { data } = await sb.from('junior_grammar_questions').select('id,sort_order,option_a,option_b,option_c,option_d,correct_answer,question_type,explanation').eq('point_id',pid);
  return data.filter(q=>q.question_type==='mcq'&&(q.explanation===null||String(q.explanation).trim()===''));
}
const log=[];
// ---------- T07 ----------
const T07={8100:`of 表所属"……的":a photo **of** my family。`,8123:`主语 two photos 复数→**are**;a photo **of**(……的照片)。`,8201:`在第几层楼用 **on**:on the first floor。`,8301:`具体星期几用 **on**:on Saturday and Sunday。`,8303:`固定搭配 be kind **to** sb(对某人友好)。`,8313:`具体某天上午用 **on**(on Monday morning);泛指下午用 **in**(in the afternoon)。`,8331:`weekdays 用 **on**;美式 the weekend 也用 **on**(on the weekend)。`,8404:`具体时刻用 **at**(at 4:00 p.m.);星期用 **on**(on Thursdays)。`,8500:`具体某天下午用 **on**:on Tuesday afternoons。`,8510:`具体钟点用 **at**:at 8:00 AM。`,8530:`泛指上午用 **in**:in the morning。`,8600:`月份用 **in**:in May。`,8604:`具体日期用 **on**:on October 15th。`,8606:`价格用 **at**:at a very good price(以……价格)。`,8607:`固定 Happy birthday **to** you。`,8612:`具体某天下午用 **on**:on Tuesday afternoon。`,8614:`from…to…(从……到……):from May 3rd **to** May 5th。`,8620:`月份用 **in**:in October。`,8624:`具体某天(July 2nd)的下午也用 **on**:on the afternoon of July 2nd。`,8631:`next/this/last+时间词前**不用介词**:next Friday。`,8632:`价格用 **at**:at a good price。`,8634:`from 8:00 a.m. **to** 6:00 p.m.(从……到……)。`,8640:`月份用 **in**:in February。`,8644:`具体某天(January 1st)的晚上用 **on**:on the evening of January 1st。`,8651:`this afternoon 前**不用介词**(this/today/tomorrow+时间不加介词)。`,8652:`价格用 **at**:at very low prices。`,8654:`from Monday **to** Friday(从周一到周五)。`,9006:`固定 **in** danger(处于危险中)。`,9016:`play games **with** people(和……玩)。`,9028:`栖息在树间用 **in**:in trees。`,9031:`固定 **at** night(在夜里)。`,9037:`**in** groups(成群地)。`,9115:`具体星期用 **on**:on Mondays to Fridays。`,9126:`⚠实际考冠词:星期几(Friday)前**不用冠词**(不加 a/an/the),用 on Friday。`,9202:`固定 be good **for**(对……有益):good for our body and mind。`,9226:`固定 be bad **for**(对……有害):bad for your back。`,9242:`be good **for**:good for our health。`,9311:`be bad **for**:bad for your teeth。`,9312:`**without**(没有,与 with 相反):hamburgers without onions(不加洋葱)。`,9331:`be bad **for**:bad for our bodies。`,9332:`**without** any sugar(不加糖)。`,9351:`be bad **for**:bad for your stomach。`,9352:`**without** sugar or milk(不加糖和奶)。`,9427:`固定 **at** the moment(此刻)。`,9508:`具体某类天用 **on**:on sunny days。`,9538:`具体某类下午用 **on**:on summer afternoons。`,9606:`从内部穿过用 **through**:through the forest(穿过森林)。`,9626:`横过表面用 **across**:across the playground(穿过操场)。`,9646:`穿过隧道(内部)用 **through**:through the tunnel。`,9713:`穿过森林(内部)用 **through**:through the forest。`,9729:`关于用 **about**:a story **about** a brave soldier。`,9733:`沿着(街道)走用 **down**:down the dark street。`,9741:`⚠实际考时间词:"昨天上午"用 **yesterday** morning(时间副词,前不用介词)。`,9742:`走进(进入)用 **into**:walked **into** the room。`};
// ---------- T20 update ----------
const T20U={8004:`like + **doing**(like playing sports);weekends 用 **on**。`,8214:`help sb (to) do,常省 to→help us **learn**(原形)。`,8421:`teach sb **to** do(教某人做)→teaches us **to** think。`,8431:`help us **develop**(help sb do,原形)。`,8523:`enjoy + **doing**→enjoys **reading**。`,9117:`ask sb **to** do→asks me **to read**。`,9128:`forget **to** do(忘记去做)→forget **to wash**。`,9201:`help us **keep**(help sb do,原形)。`,9206:`make sb **do**(原形)→makes me **feel**。`,9209:`It is important **to** do→important **to develop**。`,9210:`enjoy + **doing**→enjoys **playing**。`,9228:`teach sb **to** do→teaches us **to exercise**。`,9230:`enjoy + **doing**→enjoys **kicking**。`,9246:`make sb **feel**(原形)。`,9249:`It is a good habit **to** do→habit **to get up**。`,9250:`love + **doing**→loves **joining**。`,9510:`have fun **doing**→have fun **making**。`,9724:`介词 without + **doing**→without **knocking**。`,9746:`make sb **do**(原形)→made me **cry**。`,9211:`**do** exercise(做运动,固定用 do,不用 make)。`,9223:`**do** a warm-up(做热身,用 do)。`,9103:`clean up 是可分短语动词,代词 them 必须放中间→**clean them up**(不能 clean up them)。`,9114:`宾语是名词(bedroom)→**clean up** your bedroom(名词可放后)。`,9125:`**clean up** my books(宾语名词放后)。`,9723:`turn **off** the TV(关电视;turn on 开 / turn off 关)。`,8107:`疑问句用 **any**(Do you have any…);肯定句用 **some**(I have some…)。`,9711:`"躺下"用不及物动词 **lie**(lie down);lay 是"放置"或 lie 的过去式。`,9751:`decide to **lie** down(躺下,原形 lie)。`};
const T20D_SORTS=[8204,8212,8400,8410,8420,8430,9001,9004,9014,9024,9027,9038,9241,9245,9307,9308,9344,9404,9601,9602,9621,9622,9641,9642,9709,9731];
// ---------- T03 ----------
const T03={103:`国家全称用 **the**(the UK);语言名前**不用**冠词(English)。`,8013:`乐器前用 **the**:play **the** piano。`,8110:`photo 辅音音素→**a** photo;物主代词 **my** 直接修饰 family(不再加冠词)。`,8120:`your uncle(物主);English 以**元音音素**开头→**an** English teacher。`,8334:`English class 以元音音素开头→**an** English class。`,8434:`**a** great way(great 辅音音素);show **your** talent(物主代词)。`,9000:`**an** elephant(元音音素,首次提及);第二次特指→**The** elephant。`,9010:`**a** farm、**a** dog(均辅音,首次提及)。`,9020:`**an** interesting movie(interesting 元音)、**an** animal park(animal 元音)。`,9030:`**a** small rabbit(首次,辅音);第二次特指→**the** rabbit。`,9203:`球类运动前**不用**冠词(play basketball);乐器前用 **the**(play the violin)。`,9224:`乐器用 **the**(play the guitar);球类**不用**冠词(play badminton)。`,9243:`特指桌下那个篮球→**the** basketball;泛指打篮球运动→**不用**冠词。`,9300:`apple 元音音素→**an** apple。`,9320:`**a** bowl of(辅音);三餐(lunch)前**不用**冠词。`,9340:`**an** egg(元音);**a** quick way(quick /kw/ 辅音音素)。`,9600:`special 辅音音素→**a** special day。`,9620:`online 元音音素→**an** online meeting。`,9640:`unforgettable 元音音素→**an** unforgettable experience。`,9720:`特指那个故事(about the magic beans)→**the** story;**an** exciting story(exciting 元音)。`};
// ---------- T19/T09/T17 ----------
const TL={8422:`疑问句中"一些"用 **any**(some 多用于肯定句):Do you have any hobbies?`,8432:`疑问句中"任何事"用 **anything**(something 用于肯定句):know anything about…?`,9233:`"其他人"用 **others**(=other people,名词性):work with others。`,9254:`"互相/彼此"用 **each other**:work with each other。`,8112:`your brothers 是复数→指示代词用复数 **these**(this 单数 / these 复数)。`,9221:`grow **taller** and stronger=长得更高更壮(taller 是 tall 的比较级,与 stronger 并列)。`};

function buildUpdates(missQ, exBySort){
  // assert: every missing sort has ex, every ex sort is missing
  const missSorts=new Set(missQ.map(q=>q.sort_order));
  const exSorts=new Set(Object.keys(exBySort).map(Number));
  for(const s of missSorts) if(!exSorts.has(s)) throw new Error('missing sort without ex: '+s);
  for(const s of exSorts) if(!missSorts.has(s)) throw new Error('ex sort not in missing: '+s);
  let sql=''; let n=0;
  missQ.sort((a,b)=>a.sort_order-b.sort_order).forEach(q=>{ sql+=`UPDATE junior_grammar_questions SET explanation = '${e(exBySort[q.sort_order])}' WHERE id = '${q.id}';  -- sort${q.sort_order}\n`; n++; });
  return {sql,n};
}
function chk(sq){ return (sq.match(/'/g)||[]).length%2===0; }

// ===== t07-expl.sql =====
{
  const miss=await missing(P.t07);
  const {sql,n}=buildUpdates(miss,T07);
  let f="-- t07 介词 补缺解析 (含9126冠词/9741时间词 按实际考点); 只 SET explanation\n\n"+sql;
  f+=`\n-- 语句数: ${n} UPDATE\n-- 校验(单独跑): mcq缺解析应0\nSELECT count(*) FROM junior_grammar_questions WHERE point_id='${P.t07}' AND question_type='mcq' AND (explanation IS NULL OR explanation='');\n\n-- END OF FILE t07-expl.sql\n`;
  writeFileSync('scripts/t07-expl.sql',f);
  log.push(`t07-expl.sql: ${n} UPDATE | quote even ${chk(f)} | 应54 ${n===54}`);
}
// ===== t20-expl.sql (DELETE26 + UPDATE28) =====
{
  const miss=await missing(P.t20);
  const bySort={}; miss.forEach(q=>bySort[q.sort_order]=q);
  // partition assert: update sorts + delete sorts == all missing, disjoint
  const uSorts=Object.keys(T20U).map(Number), dSorts=T20D_SORTS;
  const inter=uSorts.filter(s=>dSorts.includes(s));
  if(inter.length) throw new Error('t20 update/delete overlap: '+inter.join(','));
  const all=new Set([...uSorts,...dSorts]);
  const missSorts=new Set(miss.map(q=>q.sort_order));
  if(all.size!==54) throw new Error('t20 u+d != 54: '+all.size);
  for(const s of missSorts) if(!all.has(s)) throw new Error('t20 missing sort uncovered: '+s);
  for(const s of all) if(!missSorts.has(s)) throw new Error('t20 covered sort not missing: '+s);
  let f="-- t20 动词搭配: 删26词汇错位题(F类) + 补28动词搭配题解析\n\n";
  f+="-- ↓↓↓ 删 26 道词汇错位题 (F类:词义选词,非语法) —— 可单独跑。下方注释列 sort+答案供核对 ↓↓↓\n";
  dSorts.forEach(s=>{ const q=bySort[s]; f+=`DELETE FROM junior_grammar_questions WHERE id = '${q.id}';  -- sort${s} 答案=${at(q)}\n`; });
  f+="-- ↑↑↑ DELETE 结束 (共26道) ↑↑↑\n\n";
  let n=0;
  f+="-- 补 28 道动词搭配题解析 (只 SET explanation)\n";
  miss.filter(q=>uSorts.includes(q.sort_order)).sort((a,b)=>a.sort_order-b.sort_order).forEach(q=>{ f+=`UPDATE junior_grammar_questions SET explanation = '${e(T20U[q.sort_order])}' WHERE id = '${q.id}';  -- sort${q.sort_order}\n`; n++; });
  f+=`\n-- 语句数: DELETE 26 + UPDATE ${n} = ${26+n}条\n-- 校验(单独跑): 删26+补28后, t20 mcq缺解析应0\nSELECT count(*) FROM junior_grammar_questions WHERE point_id='${P.t20}' AND question_type='mcq' AND (explanation IS NULL OR explanation='');\n\n-- END OF FILE t20-expl.sql\n`;
  writeFileSync('scripts/t20-expl.sql',f);
  log.push(`t20-expl.sql: DELETE26 + UPDATE${n} | quote even ${chk(f)} | u+d=54 ${all.size===54} | 无重叠 ${inter.length===0}`);
}
// ===== t03-expl.sql =====
{
  const miss=await missing(P.t03);
  const {sql,n}=buildUpdates(miss,T03);
  let f="-- t03 冠词 补缺解析; 只 SET explanation\n\n"+sql;
  f+=`\n-- 语句数: ${n} UPDATE\n-- 校验(单独跑): mcq缺解析应0\nSELECT count(*) FROM junior_grammar_questions WHERE point_id='${P.t03}' AND question_type='mcq' AND (explanation IS NULL OR explanation='');\n\n-- END OF FILE t03-expl.sql\n`;
  writeFileSync('scripts/t03-expl.sql',f);
  log.push(`t03-expl.sql: ${n} UPDATE | quote even ${chk(f)} | 应20 ${n===20}`);
}
// ===== t19-t09-t17-expl.sql =====
{
  const m19=await missing(P.t19), m09=await missing(P.t09), m17=await missing(P.t17);
  const allMiss=[...m19,...m09,...m17];
  const missSorts=new Set(allMiss.map(q=>q.sort_order));
  const exSorts=new Set(Object.keys(TL).map(Number));
  for(const s of missSorts) if(!exSorts.has(s)) throw new Error('TL missing sort without ex: '+s);
  for(const s of exSorts) if(!missSorts.has(s)) throw new Error('TL ex not in missing: '+s);
  let f="-- t19/t09/t17 补缺解析 (3 point 合一); 只 SET explanation\n\n"; let n=0;
  for(const [label,arr] of [['t19 反身/不定代词',m19],['t09 指示代词',m09],['t17 比较级',m17]]){
    f+=`-- ${label} (${arr.length}道)\n`;
    arr.sort((a,b)=>a.sort_order-b.sort_order).forEach(q=>{ f+=`UPDATE junior_grammar_questions SET explanation = '${e(TL[q.sort_order])}' WHERE id = '${q.id}';  -- sort${q.sort_order}\n`; n++; });
    f+="\n";
  }
  f+=`-- 语句数: ${n} UPDATE\n-- 校验(单独跑): 3 point mcq缺解析应0\nSELECT p.code, count(*) FROM junior_grammar_questions q JOIN junior_grammar_points p ON q.point_id=p.id WHERE p.code IN ('g7-t19','g7-t09','g7-t17') AND q.question_type='mcq' AND (q.explanation IS NULL OR q.explanation='') GROUP BY p.code;\n\n-- END OF FILE t19-t09-t17-expl.sql\n`;
  writeFileSync('scripts/t19-t09-t17-expl.sql',f);
  log.push(`t19-t09-t17-expl.sql: ${n} UPDATE | quote even ${chk(f)} | 应6 ${n===6}`);
}
console.log(log.join('\n'));
process.exit(0);
