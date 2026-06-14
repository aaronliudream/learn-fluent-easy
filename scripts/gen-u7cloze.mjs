import { writeFileSync } from 'node:fs';
const e=s=>String(s).replace(/'/g,"''");
const ID1='b1c2d3e4-0a1b-4c2d-8e3f-9a0b1c2d3e40';
const ID2='b2c3d4e5-1a2b-4c3d-8e4f-9a1b2c3d4e51';

// 第1篇 定稿 (答案 CDCBCACB, 本身够散,保持原选项顺序)
const P1={
  id:ID1, title:'七下 U7 完形:Our School Trip Yesterday', volume:'7B', unit:'U7', difficulty:3, sort_order:1,
  body:`Yesterday (1)____ a special day for the students in Class 1. We (2)____ a school trip to the Science Museum. We met at the school gate at 8:00 a.m. and (3)____ the bus there. The museum was very big. We (4)____ many interesting robots inside. They could talk to people! Tom (5)____ take photos because he lost his camera. He was a bit sad. But our teacher helped him. We ate our lunch (6)____ a big tree outside the museum. We (7)____ very happy all day. We (8)____ back home at 4:00 p.m. It was a wonderful trip!`,
  questions:[
    {q:'1',options:['is','am','was','were'],answer:'C',explanation:'Yesterday 时间状语,主语 a special day 是单数,be 动词过去式→**was**。'},
    {q:'2',options:['have','has','having','had'],answer:'D',explanation:'have 的不规则过去式→**had**(had a school trip 进行了一次校游)。'},
    {q:'3',options:['take','takes','took','taking'],answer:'C',explanation:'与 met 并列用过去式;take the bus 坐公交→**took**。'},
    {q:'4',options:['see','saw','sees','seeing'],answer:'B',explanation:'see 的不规则过去式→**saw**(看见了许多机器人)。'},
    {q:'5',options:["don't","doesn't","didn't","isn't"],answer:'C',explanation:'过去时否定:**didn’t** + 动词原形 take(丢了相机,没能拍照)。'},
    {q:'6',options:['under','on','in','from'],answer:'A',explanation:'在树下用 **under**:under a big tree。'},
    {q:'7',options:['are','was','were','been'],answer:'C',explanation:'主语 We 是复数,be 动词过去式→**were**(We were happy)。'},
    {q:'8',options:['go','went','goes','going'],answer:'B',explanation:'go 的不规则过去式→**went**(went back home 回家)。'},
  ],
};
// 第2篇 定稿原全A → 打散(正确词不变,只换在ABCD的位置;新答案 BDACADBC)
const P2={
  id:ID2, title:'七下 U7 完形:A Wonderful Weekend on the Farm', volume:'7B', unit:'U7', difficulty:3, sort_order:2,
  body:`Last weekend, Lucy went to her grandpa's farm. She stayed there (1)____ two days and had a great time. On Saturday morning, she (2)____ early because the birds sang happily outside. After breakfast, she helped her grandpa. She gave water (3)____ the chickens. In the afternoon, she rode a (4)____ with her cousin. It was her first time, so she was a bit afraid, but she loved the animal. On Sunday, they went to a small river near the farm. They swam in the clean (5)____. For dinner, they enjoyed some food. Lucy (6)____ her grandpa for his kindness and (7)____ the farm on Sunday evening. She wants to (8)____ there again next month.`,
  questions:[
    {q:'1',options:['at','for','on','in'],answer:'B',explanation:'stay **for** + 时间段:stayed there for two days(待了两天)。'},
    {q:'2',options:['slept','ran','sat','woke up'],answer:'D',explanation:'被鸟叫吵醒早起:wake up 的过去式→**woke up**。'},
    {q:'3',options:['to','from','in','on'],answer:'A',explanation:'give sth **to** sb:give water to the chickens(给鸡喂水)。'},
    {q:'4',options:['bird','chicken','horse','fish'],answer:'C',explanation:'ride a **horse**=骑马(固定搭配)。'},
    {q:'5',options:['water','tree','grass','desk'],answer:'A',explanation:'在河里游泳→swam in the **water**(干净的水里)。'},
    {q:'6',options:['lost','forgot','changed','thanked'],answer:'D',explanation:'thank sb for sth:Lucy **thanked** her grandpa(感谢爷爷的好意)。'},
    {q:'7',options:['found','left','liked','saw'],answer:'B',explanation:'leave 的过去式→**left**(left the farm 离开农场)。'},
    {q:'8',options:['went','goes','go','going'],answer:'C',explanation:'want **to** + 动词原形→to **go**(想下个月再去)。'},
  ],
};

function wc(b){ return b.split(/\s+/).filter(Boolean).length; }
// sanity: answer letter resolves to non-empty option
function vchk(p){ p.questions.forEach(q=>{ const i='ABCD'.indexOf(q.answer); if(i<0||!q.options[i]) throw new Error(p.title+' q'+q.q+' bad answer'); }); }
vchk(P1); vchk(P2);

function ins(p){
  const qj=JSON.stringify(p.questions);
  let s='INSERT INTO junior_cloze (id, grade, volume, unit, title, body, word_count, difficulty, questions, sort_order)\n';
  s+=`SELECT '${p.id}', 7, '${p.volume}', '${p.unit}', '${e(p.title)}', '${e(p.body)}', ${wc(p.body)}, ${p.difficulty}, '${e(qj)}'::jsonb, ${p.sort_order}\n`;
  s+=`WHERE NOT EXISTS (SELECT 1 FROM junior_cloze WHERE title = '${e(p.title)}');\n\n`;
  return s;
}
let sql='-- ============================================================\n';
sql+='-- 步2: 7B/U7 完形 2 篇 (定稿;每篇8空, questions jsonb)\n';
sql+='-- 第1篇答案 CDCBCACB(保持);第2篇原全A→已打散(词不变,只调ABCD位置)\n';
sql+='-- 幂等 WHERE NOT EXISTS by title; ⚠️先跑步1建表\n';
sql+='-- ============================================================\n\n';
sql+=ins(P1); sql+=ins(P2);
sql+='-- 校验(单独跑): 应 2 行, 各 8 空\n';
sql+="SELECT volume, unit, title, word_count, difficulty, jsonb_array_length(questions) AS blanks FROM junior_cloze WHERE volume='7B' AND unit='U7' ORDER BY sort_order;\n";
sql+='-- END OF FILE u7-cloze.sql\n';
writeFileSync('scripts/u7-cloze.sql',sql);

const sq=(sql.match(/'/g)||[]).length;
console.log('P1 词数',wc(P1.body),'答案',P1.questions.map(q=>q.answer).join(''));
console.log('P2 词数',wc(P2.body),'答案',P2.questions.map(q=>q.answer).join(''),'(原AAAAAAAA已打散)');
console.log('每篇空数: P1',P1.questions.length,'P2',P2.questions.length);
console.log('答案校验: 均映射到非空选项 ✓ (vchk未throw)');
console.log('P2 正确词核对:',P2.questions.map(q=>q.options['ABCD'.indexOf(q.answer)]).join('/'));
console.log('single-quote total:',sq, sq%2===0?'(EVEN ✓)':'(ODD ✗)');
process.exit(0);
