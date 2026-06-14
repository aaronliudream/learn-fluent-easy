import { writeFileSync } from 'node:fs';
const e = s => String(s).replace(/'/g, "''"); // SQL single-quote doubling (raw ' -> '')

// hardcoded = previously generated/reviewed (stable on regen)
const PUUID = 'a6924a11-f5e3-447c-a28b-08306437e4ba';
const KP_MUST = 'a82c1024-327c-40fc-aacb-78c8a66b6ef8';
const KP_PROH = '1c3626e4-6426-4428-993f-48d98fe95489';
const QUUID = [
  '079a122b-08c5-46fe-b42f-8216ba1f4fd7','1f4e6af0-4534-4f7f-8d58-ee57dd6a653f',
  '9d73af6f-8f01-438a-85d9-2cc310178faa','bb27e135-dcbd-49c3-b0d5-2f84daad7c23',
  '0d9501f6-2cb5-442a-853a-3f6614b5bb61','58e1842e-692a-4174-b51c-f56d63b860b2',
  '3d56b713-8375-48b7-9916-e1bde2302b2e','835b234c-c9d7-42c2-8393-8800a064056d',
  '9d72fc99-2c0e-4f71-ba70-1dbc60e5f4af','98af9ab8-74cd-4ecb-9b23-f1c902ccf927',
  '93a91b1e-c34c-4525-9f52-37ecd6d30067','f0dff529-93f2-4673-b7fb-f6bee284011f',
  'e090815f-dabd-4b38-8a98-47a96e9bd65f','b5223a14-7149-4441-aafc-4f6c5a066500',
  '9a76e39b-385d-4a88-9e08-3f07d45ad679','cd58d60e-cb68-4d99-8d49-1fd1dc633442',
  '556c6b04-e794-46f9-93d1-d604b61fd444','6846ad87-5b65-4ab1-9ce8-81916c8bdbd4',
  'fec50f78-c3d2-48e9-9700-8becbc4b9edf','57a6e6e4-0e86-44ca-9563-6306dc2f86e6',
  '0575f424-c020-4f3c-a62f-52fdf3beb747','3c7340ce-3113-482b-92f1-760310597dc4',
  'cc79a9d3-4c66-412a-90a1-0f99312c0152','3a65388c-97ba-4107-9ae9-81ffa1c49dcc',
];
const OTHER_CAT = 'e05f9874-6401-42f8-a361-28f1dee3a58e';

// all string values use backtick literals so ' and " pass through raw; e() doubles ' for SQL.
const Q = [
  // must kp (12)
  {kp:'must', stem:`Students ___ wear school uniforms. It is a school rule.`, a:`have to`, b:`can`, c:`may`, d:`don't have to`, ans:`A`,
   ex:`**have to**表示客观必须(外部规定)。学校规定→**have to**穿校服。`},
  {kp:'must', stem:`You ___ finish your homework before you watch TV. I really mean it.`, a:`can`, b:`must`, c:`may`, d:`don't have to`, ans:`B`,
   ex:`**must**表示说话人主观强调的必须。语气强烈→**must**。`},
  {kp:'must', stem:`In China, drivers ___ stop when the traffic light is red.`, a:`can`, b:`may`, c:`have to`, d:`needn't`, ans:`C`,
   ex:`交通规则(客观规定)→**have to**。must偏主观,客观规定多用have to。`},
  {kp:'must', stem:`It is late. We ___ go home now, or our parents will worry.`, a:`must`, b:`can`, c:`may`, d:`don't have to`, ans:`A`,
   ex:`说话人判断的必须→**must**。`},
  {kp:'must', stem:`— Why are you in a hurry? — Because I ___ catch the early bus.`, a:`can`, b:`have to`, c:`may`, d:`mustn't`, ans:`B`,
   ex:`外部安排(赶早班车)的客观必须→**have to**。`},
  {kp:'must', stem:`My mother says I ___ clean my room every weekend.`, a:`can`, b:`may`, c:`have to`, d:`don't have to`, ans:`C`,
   ex:`家规(外部要求)→**have to**。`},
  {kp:'must', stem:`Everyone ___ follow the rules in the library. Keep quiet, please.`, a:`must`, b:`can`, c:`may`, d:`needn't`, ans:`A`,
   ex:`强调人人必须遵守规则→**must**。`},
  {kp:'must', stem:`When the third person is the subject, we use ___ not "have to".`, a:`have to`, b:`has to`, c:`must to`, d:`musts`, ans:`B`,
   ex:`主语是第三人称单数时,have to变**has to**(He has to...)。`},
  {kp:'must', stem:`Tom ___ wear glasses because he can't see the blackboard clearly.`, a:`have to`, b:`has to`, c:`must to`, d:`can`, ans:`B`,
   ex:`Tom是三单+客观需要→**has to**(三单用has to)。`},
  {kp:'must', stem:`After "must", we use the ___ of the verb.`, a:`-ing form`, b:`-ed form`, c:`base form`, d:`to + verb`, ans:`C`,
   ex:`情态动词must后接动词**原形**(base form):must go,不是must to go。`},
  {kp:'must', stem:`You ___ be on time for class. Being late is not allowed.`, a:`can`, b:`may`, c:`must`, d:`don't have to`, ans:`C`,
   ex:`强调规则要求→**must**准时。`},
  {kp:'must', stem:`— Do I have to wear a tie? — Yes, you ___. It is required.`, a:`must`, b:`can`, c:`may`, d:`needn't`, ans:`A`,
   ex:`required(被要求)→肯定回答用**must**(必须)。`},
  // prohibit kp (12)
  {kp:'prohibit', stem:`You ___ smoke here. It is a no-smoking area.`, a:`don't have to`, b:`mustn't`, c:`may not need`, d:`can`, ans:`B`,
   ex:`禁烟区→**mustn't**(禁止/不准)。mustn't表示禁止。`},
  {kp:'prohibit', stem:`Tomorrow is Sunday, so we ___ get up early. We can sleep in.`, a:`mustn't`, b:`can't`, c:`don't have to`, d:`must`, ans:`C`,
   ex:`周日可睡懒觉→**don't have to**(不必)。表示没必要做。`},
  {kp:'prohibit', stem:`"Mustn't" means ___.`, a:`don't need to`, b:`it is not necessary`, c:`it is not allowed`, d:`you can choose`, ans:`C`,
   ex:`**mustn't**=禁止/不准做(it is not allowed),语气强。`},
  {kp:'prohibit', stem:`"Don't have to" means ___.`, a:`it is forbidden`, b:`it is not necessary`, c:`you can't`, d:`it is a must`, ans:`B`,
   ex:`**don't have to**=不必/没必要(it is not necessary),可做可不做。`},
  {kp:'prohibit', stem:`You ___ talk loudly in the hospital. People are resting.`, a:`don't have to`, b:`mustn't`, c:`needn't`, d:`can`, ans:`B`,
   ex:`医院应安静→**mustn't**(不准大声说话)。`},
  {kp:'prohibit', stem:`It is a free day. You ___ wear your uniform if you don't want to.`, a:`mustn't`, b:`can't`, c:`don't have to`, d:`must`, ans:`C`,
   ex:`自由着装日→**don't have to**(不必穿校服)。`},
  {kp:'prohibit', stem:`Students ___ run in the hallways. It is dangerous.`, a:`don't have to`, b:`mustn't`, c:`needn't`, d:`should`, ans:`B`,
   ex:`危险→**mustn't**(禁止奔跑)。`},
  {kp:'prohibit', stem:`We have enough time, so you ___ hurry.`, a:`mustn't`, b:`can't`, c:`don't have to`, d:`must`, ans:`C`,
   ex:`时间充足→**don't have to**(不必赶)。`},
  {kp:'prohibit', stem:`You ___ touch that! It is very hot and dangerous.`, a:`don't have to`, b:`mustn't`, c:`needn't`, d:`may`, ans:`B`,
   ex:`危险→**mustn't**(不准碰)。`},
  {kp:'prohibit', stem:`— Do I have to bring my own pen? — No, you ___. We have some here.`, a:`mustn't`, b:`must`, c:`don't have to`, d:`can't`, ans:`C`,
   ex:`这里有笔→否定回答用**don't have to**(不必带)。注意:Do you have to...?否定答用don't have to,不是mustn't。`},
  {kp:'prohibit', stem:`Drivers ___ use phones while driving. It is against the law.`, a:`don't have to`, b:`mustn't`, c:`needn't`, d:`may`, ans:`B`,
   ex:`违法→**mustn't**(禁止开车用手机)。`},
  {kp:'prohibit', stem:`You ___ finish all the food. Eat as much as you like.`, a:`mustn't`, b:`can't`, c:`don't have to`, d:`must`, ans:`C`,
   ex:`随意吃→**don't have to**(不必吃完)。`},
];

if (QUUID.length !== Q.length) throw new Error(`UUID count ${QUUID.length} != Q count ${Q.length}`);

let sql = '';
sql += "-- ============================================================\n";
sql += "-- U2 (No Rules) 义务情态 point g7-t25 + 2kp + 24题\n";
sql += "-- WHERE NOT EXISTS 幂等; FK subselect-by-code; 裸'[]'隐式转无cast\n";
sql += "-- ============================================================\n\n";

sql += "-- ① 建 point g7-t25\n";
sql += "INSERT INTO junior_grammar_points (id, category_id, code, title, cefr, grade, summary, explanation_md, examples, sort_order, ai_corpus)\n";
sql += `SELECT '${PUUID}', '${OTHER_CAT}', 'g7-t25', '${e("情态动词(义务):have to/must/mustn't")}', 'A1', 7, '${e("初一专题:义务情态动词。have to(客观/外部规定)vs must(主观/强调);mustn't(禁止)vs don't have to(不必)。No Rules校规家规交规主题。")}', '', '[]', 25, NULL\n`;
sql += "WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_points WHERE code = 'g7-t25');\n\n";

sql += "-- ② 建 2 kp\n";
sql += "INSERT INTO junior_knowledge_points (id, point_id, code, title, summary, sort_order, target_count)\n";
sql += `SELECT '${KP_MUST}', (SELECT id FROM junior_grammar_points WHERE code='g7-t25'), 'g7-t25-must', '${e("肯定义务(have to/must/has to/must+原形)")}', NULL, 1, 20\n`;
sql += "WHERE NOT EXISTS (SELECT 1 FROM junior_knowledge_points WHERE code = 'g7-t25-must');\n\n";
sql += "INSERT INTO junior_knowledge_points (id, point_id, code, title, summary, sort_order, target_count)\n";
sql += `SELECT '${KP_PROH}', (SELECT id FROM junior_grammar_points WHERE code='g7-t25'), 'g7-t25-prohibit', '${e("禁止与不必(mustn't禁止/don't have to不必/辨析)")}', NULL, 2, 20\n`;
sql += "WHERE NOT EXISTS (SELECT 1 FROM junior_knowledge_points WHERE code = 'g7-t25-prohibit');\n\n";

sql += "-- ③ 24 题 (must 12 / prohibit 12)\n";
Q.forEach((q,i)=>{
  const kpcode = q.kp==='must' ? 'g7-t25-must' : 'g7-t25-prohibit';
  sql += "INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)\n";
  sql += `SELECT '${QUUID[i]}', (SELECT id FROM junior_grammar_points WHERE code='g7-t25'), (SELECT id FROM junior_knowledge_points WHERE code='${kpcode}'), '${e(q.stem)}', '${e(q.a)}', '${e(q.b)}', '${e(q.c)}', '${e(q.d)}', '${q.ans}', '${e(q.ex)}', 2, ${i+1}, 'mcq', '[]', false\n`;
  sql += `WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = '${e(q.stem)}');\n\n`;
});

sql += "-- ④ 校验\n";
sql += "SELECT count(*) FROM junior_grammar_points WHERE code='g7-t25'; -- 应 1\n";
sql += "SELECT count(*) FROM junior_knowledge_points WHERE code IN ('g7-t25-must','g7-t25-prohibit'); -- 应 2\n";
sql += "SELECT count(*), kp_id FROM junior_grammar_questions WHERE point_id=(SELECT id FROM junior_grammar_points WHERE code='g7-t25') GROUP BY kp_id; -- 应 must12/prohibit12\n";

writeFileSync('scripts/u2-t25.sql', sql, 'utf8');

const sq=(sql.match(/'/g)||[]).length;
console.log('=== UUID 对照表 ===');
console.log('point  g7-t25          :', PUUID);
console.log('kp     g7-t25-must     :', KP_MUST);
console.log('kp     g7-t25-prohibit :', KP_PROH);
QUUID.forEach((u,i)=>console.log(`q${String(i+1).padStart(2)} [${Q[i].kp.padEnd(8)}] ${u}  ans=${Q[i].ans}`));
console.log('\n=== sanity ===');
console.log('single-quote total:', sq, sq%2===0?'(EVEN ✓)':'(ODD ✗!!)');
console.log('must:', Q.filter(q=>q.kp==='must').length, '| prohibit:', Q.filter(q=>q.kp==='prohibit').length);
console.log('SQL bytes:', sql.length);
// quick check: every option/stem has matching answer letter present
const bad=Q.filter(q=>!['A','B','C','D'].includes(q.ans));
console.log('answer letter valid:', bad.length===0?'all A-D ✓':JSON.stringify(bad));
process.exit(0);
