import { writeFileSync } from 'node:fs';
const e = s => String(s).replace(/'/g, "''");
const OTHER_CAT='e05f9874-6401-42f8-a361-28f1dee3a58e';

// hardcoded = previously generated/reviewed (stable on regen)
const PUUID='d0fef3f2-a13b-4064-9e8d-868d9f33e14e', KP_COUNT='96f552f9-0c18-4e92-ad10-89349e0bb5e2', KP_WL='c20337fd-b4da-47bb-be0a-18abf00f53d9';
const QUUID=[
  'c0f7b103-fd6b-486c-8f1d-e0f179fa2b6d','8ee1d1f8-f8ef-4c86-96f9-a0d88c2d9e38',
  'f5a2b22b-1d0c-445b-87d3-5de77a327862','b450e777-0e02-48d8-9bb6-c9b3075a9683',
  '57d6b61b-4fdf-4809-8070-6dcf817286cf','033d2d37-fe02-40a1-a438-5aed15d55eb0',
  '8b8c3834-c58f-40ec-b5a2-85e3b932f39a','80fdb108-2268-45d0-b60b-8d10aeebe4e7',
  'b08d16d4-6ba6-428e-bf1f-b5332f45e581','f96076d7-350e-435d-bd7a-e604126bb5f4',
  'd574ddf1-6bcb-4353-a779-4e5f30765438','06d1b2b5-f5cd-4246-87f3-2bb6fb93db25',
  '0ff0d77c-973d-4eaf-889d-8885fada5047','6136e8c6-65bd-459d-acce-3c8fa6f462a8',
  '8a126eda-4ba4-4ae8-b71e-6810cf50232c','937b98c4-7cda-4390-b2c6-cea63358ac1a',
  '82398afa-fb8e-40e4-a47f-50641877c942','11c76173-219a-4e8a-8103-d704ccdd2594',
  'e700ef27-1a5a-4785-8832-cddee1d1e701','8711eb8e-eb63-45fc-ada8-c22b525931a6',
  'dfdf89d9-c5d2-4e70-8698-daf9067eeb3a','f64eafaf-2cb4-42e2-8636-223da8e7fada',
  '60699b83-83e0-4ae8-9f5a-574f31dcaf0f','9038df55-815f-4dca-9194-ca0d8f5aeb19',
];

// backtick literals: raw ' and " pass through; e() doubles ' for SQL
const Q=[
  // count kp (14)
  {kp:'count', stem:`How ___ apples do you want? — Three, please.`, a:`much`,b:`many`,c:`some`,d:`any`, ans:`B`, ex:`apples**可数复数**,问数量用**How many**。many修饰可数名词。`},
  {kp:'count', stem:`How ___ milk do you drink every day?`, a:`many`,b:`much`,c:`some`,d:`few`, ans:`B`, ex:`milk**不可数**,问数量用**How much**。much修饰不可数名词。`},
  {kp:'count', stem:`There isn't ___ bread on the table.`, a:`some`,b:`many`,c:`much`,d:`a`, ans:`C`, ex:`bread不可数+否定→**much**。`},
  {kp:'count', stem:`I'd like some ___ for lunch.`, a:`rice`,b:`a rice`,c:`rices`,d:`an rice`, ans:`A`, ex:`some+**不可数**rice,不加a/s→**rice**。`},
  {kp:'count', stem:`— Do we have any juice? — Yes, there is ___ in the fridge.`, a:`many`,b:`some`,c:`a few`,d:`an`, ans:`B`, ex:`疑问/否定用any,**肯定回答用some**。`},
  {kp:'count', stem:`___ oranges are there in the basket? — Five.`, a:`How much`,b:`How many`,c:`How old`,d:`What`, ans:`B`, ex:`oranges可数复数,问数量**How many**。`},
  {kp:'count', stem:`Would you like a ___ of bread?`, a:`piece`,b:`glass`,c:`cup`,d:`bottle`, ans:`A`, ex:`面包量词**a piece of**(一片)。`},
  {kp:'count', stem:`We don't have ___ rice. Let's buy some.`, a:`many`,b:`a few`,c:`much`,d:`some`, ans:`C`, ex:`rice不可数+否定→**much**。`},
  {kp:'count', stem:`How much ___ do you need?`, a:`apples`,b:`bananas`,c:`sugar`,d:`eggs`, ans:`C`, ex:`How much后接**不可数**→sugar。其它都可数复数。`},
  {kp:'count', stem:`There are ___ tomatoes in the fridge.`, a:`much`,b:`a little`,c:`some`,d:`any`, ans:`C`, ex:`tomatoes可数复数+肯定→**some**。`},
  {kp:'count', stem:`— How many ___ would you like? — Two cups.`, a:`tea`,b:`coffee`,c:`cups of tea`,d:`water`, ans:`C`, ex:`tea不可数,用**cups of tea**计量。`},
  {kp:'count', stem:`I want a ___ of milk.`, a:`piece`,b:`glass`,c:`bag`,d:`bowl`, ans:`B`, ex:`牛奶量词**a glass of**(一杯)。`},
  {kp:'count', stem:`— How much bread do you want? — ___, please.`, a:`Three`,b:`Two pieces`,c:`Many`,d:`Five`, ans:`B`, ex:`bread不可数,计量用"数字+**pieces**"→Two pieces。`},
  {kp:'count', stem:`There isn't any ___ in the soup.`, a:`carrots`,b:`potatoes`,c:`salt`,d:`eggs`, ans:`C`, ex:`any+**不可数**→salt。其它可数复数。`},
  // wouldlike kp (10)
  {kp:'wouldlike', stem:`___ you like some juice? — Yes, please.`, a:`Do`,b:`Are`,c:`Would`,d:`Will`, ans:`C`, ex:`礼貌邀请/点餐**Would you like...?**`},
  {kp:'wouldlike', stem:`I'd like ___ noodles for lunch.`, a:`any`,b:`some`,c:`much`,d:`a`, ans:`B`, ex:`I'd like后肯定/点餐用**some**。`},
  {kp:'wouldlike', stem:`I'd like some rice and some ___, please.`, a:`any`,b:`chicken`,c:`many`,d:`a`, ans:`B`, ex:`点餐肯定some+不可数**chicken**。`},
  {kp:'wouldlike', stem:`Would you like ___ more rice? — No, thanks. I'm full.`, a:`any`,b:`some`,c:`many`,d:`a`, ans:`B`, ex:`**请求/邀请**即使疑问句也用**some**→some more rice。`},
  {kp:'wouldlike', stem:`Would you like some bread? — ___, I'm hungry.`, a:`No thanks`,b:`Yes, please`,c:`I'm not`,d:`No way`, ans:`B`, ex:`接受邀请的得体回答→**Yes, please**。`},
  {kp:'wouldlike', stem:`What would you like ___ breakfast?`, a:`to`,b:`for`,c:`at`,d:`of`, ans:`B`, ex:`**What would you like for + 餐**(早餐想吃什么)。`},
  {kp:'wouldlike', stem:`My sister would ___ a hamburger and some salad.`, a:`likes`,b:`like`,c:`liking`,d:`to like`, ans:`B`, ex:`would是情态动词,后接**原形**→would **like**。`},
  {kp:'wouldlike', stem:`Would you like ___ soup? — Yes, please.`, a:`any`,b:`some`,c:`many`,d:`a`, ans:`B`, ex:`邀请用**some**(表期待接受)。`},
  {kp:'wouldlike', stem:`There are some ___ and some bread in the basket.`, a:`rice`,b:`milk`,c:`apples`,d:`water`, ans:`C`, ex:`There are+可数复数→**apples**(可数);对比bread不可数。`},
  {kp:'wouldlike', stem:`— What would you like? — I'd like ___ apples, please.`, a:`much`,b:`any`,c:`some`,d:`a`, ans:`C`, ex:`点餐肯定+可数复数→**some** apples。`},
];
if(QUUID.length!==Q.length)throw new Error("len");

// validation: answer letter resolves to a non-empty option
const bad=Q.filter(q=>!({A:q.a,B:q.b,C:q.c,D:q.d}[q.ans]));
if(bad.length) throw new Error('answer maps to empty option: '+JSON.stringify(bad.map(b=>b.stem)));

let sql='';
sql+="-- ============================================================\n";
sql+="-- U4 (Eat Well) 可数不可数与点餐 point g7-t26 + 2kp + 24题\n";
sql+="-- WHERE NOT EXISTS 幂等; FK subselect-by-code; 裸'[]'隐式转\n";
sql+="-- ============================================================\n\n";
sql+="-- ① 建 point g7-t26\n";
sql+="INSERT INTO junior_grammar_points (id, category_id, code, title, cefr, grade, summary, explanation_md, examples, sort_order, ai_corpus)\n";
sql+=`SELECT '${PUUID}', '${OTHER_CAT}', 'g7-t26', '${e("可数不可数与点餐:How much/many + would like")}', 'A1', 7, '${e("初一专题:可数/不可数名词(much/many)、How much/How many提问、量词(a piece of/a glass of)、would like点餐。Eat Well食物主题。")}', '', '[]', 26, NULL\n`;
sql+="WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_points WHERE code = 'g7-t26');\n\n";
sql+="-- ② 建 2 kp\n";
sql+="INSERT INTO junior_knowledge_points (id, point_id, code, title, summary, sort_order, target_count)\n";
sql+=`SELECT '${KP_COUNT}', (SELECT id FROM junior_grammar_points WHERE code='g7-t26'), 'g7-t26-count', '${e("可数不可数与数量(much/many/How much/many/量词)")}', NULL, 1, 20\n`;
sql+="WHERE NOT EXISTS (SELECT 1 FROM junior_knowledge_points WHERE code = 'g7-t26-count');\n\n";
sql+="INSERT INTO junior_knowledge_points (id, point_id, code, title, summary, sort_order, target_count)\n";
sql+=`SELECT '${KP_WL}', (SELECT id FROM junior_grammar_points WHERE code='g7-t26'), 'g7-t26-wouldlike', '${e("点餐would like(would like + 食物/some)")}', NULL, 2, 20\n`;
sql+="WHERE NOT EXISTS (SELECT 1 FROM junior_knowledge_points WHERE code = 'g7-t26-wouldlike');\n\n";
sql+="-- ③ 24 题 (count 14 / wouldlike 10)\n";
Q.forEach((q,i)=>{
  const kpcode=q.kp==='count'?'g7-t26-count':'g7-t26-wouldlike';
  sql+="INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)\n";
  sql+=`SELECT '${QUUID[i]}', (SELECT id FROM junior_grammar_points WHERE code='g7-t26'), (SELECT id FROM junior_knowledge_points WHERE code='${kpcode}'), '${e(q.stem)}', '${e(q.a)}', '${e(q.b)}', '${e(q.c)}', '${e(q.d)}', '${q.ans}', '${e(q.ex)}', 2, ${i+1}, 'mcq', '[]', false\n`;
  sql+=`WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = '${e(q.stem)}');\n\n`;
});
sql+="-- ④ 校验\n";
sql+="SELECT count(*) FROM junior_grammar_points WHERE code='g7-t26'; -- 应 1\n";
sql+="SELECT count(*) FROM junior_knowledge_points WHERE code IN ('g7-t26-count','g7-t26-wouldlike'); -- 应 2\n";
sql+="SELECT count(*), kp_id FROM junior_grammar_questions WHERE point_id=(SELECT id FROM junior_grammar_points WHERE code='g7-t26') GROUP BY kp_id; -- 应 count14/wouldlike10\n";

writeFileSync('scripts/u4-t26.sql', sql, 'utf8');
const sq=(sql.match(/'/g)||[]).length;
console.log('=== UUID 对照表 ===');
console.log('point  g7-t26          :', PUUID);
console.log('kp     g7-t26-count    :', KP_COUNT);
console.log('kp     g7-t26-wouldlike:', KP_WL);
QUUID.forEach((u,i)=>console.log(`q${String(i+1).padStart(2)} [${Q[i].kp.padEnd(9)}] ${u} ans=${Q[i].ans}`));
console.log('\nsingle-quote total:', sq, sq%2===0?'(EVEN ✓)':'(ODD ✗)');
console.log('count:', Q.filter(q=>q.kp==='count').length, '| wouldlike:', Q.filter(q=>q.kp==='wouldlike').length);
console.log('answer letters valid: all map to non-empty option ✓');
console.log('SQL bytes:', sql.length);
process.exit(0);
