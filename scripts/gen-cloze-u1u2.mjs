import { writeFileSync } from 'node:fs';
const e = s => String(s).replace(/'/g, "''");

// 每空: w=正确词, d=[3干扰项], e=精简解析(加粗答案词)
// tgt=该篇8空的目标位置(0..3),保证 ABCD 各2次、打散
const PASS = [
  {
    id:'c1000001-0a1b-4c2d-8e3f-000000000001', title:'七下 U1 完形:Pandas at the Zoo', unit:'U1', difficulty:2, sort_order:1,
    tgt:[1,0,3,2,0,2,1,3],
    body:`Hello! I am a guide at the zoo. Let me show you my favorite animals. Look at these (1)____! They are pandas. They come from China. They are black and (2)____, and they look very cute. Now, look at the baby panda. It (3)____ on the grass. It is very small. What (4)____ the mother panda do? She (5)____ a lot of bamboo every day. Pandas like bamboo very much. The father panda is under the tree. He sleeps (6)____ daytime. There (7)____ many people here today. They all like the pandas. Do you want to take a photo (8)____ them?`,
    qs:[
      {w:'animals',d:['animal','tiger','tigers'],e:'后文 They are pandas(复数)→可数名词复数 **animals**。'},
      {w:'white',d:['yellow','brown','blue'],e:'熊猫黑白相间→black and **white**(常识)。'},
      {w:'plays',d:['play','playing','played'],e:'It 是第三人称单数,一般现在时动词加 s→**plays**。'},
      {w:'does',d:['do','is','are'],e:'主语 the mother panda 单三,疑问句用 **does**+动词原形。'},
      {w:'eats',d:['eat','eating','to eat'],e:'She 单三→一般现在时动词加 s→**eats**。'},
      {w:'in',d:['on','at','from'],e:'在白天用 **in** the daytime。'},
      {w:'are',d:['is','am','be'],e:'there be + many people(复数)→there **are**。'},
      {w:'with',d:['for','in','on'],e:'take a photo **with** sb=和某人合影。'},
    ],
  },
  {
    id:'c1000002-0a1b-4c2d-8e3f-000000000002', title:'七下 U1 完形:Elephant Friends', unit:'U1', difficulty:2, sort_order:2,
    tgt:[2,1,0,3,1,3,0,2],
    body:`I have a story about some special friends. They are elephants. Elephants are very (1)____, but they are friendly to people. Look! These elephants have long (2)____ and large ears. They also have a very long (3)____ to help them eat and drink. They are from Africa. They (4)____ in the forest. What do they like to eat? They love plants, fruit and (5)____. They can eat a lot every day! Elephants are also very (6)____. They can help people work, and they can play games. They walk very slowly, but they (7)____ swim well in the river. Do you (8)____ these amazing animal friends? Please come and see them.`,
    qs:[
      {w:'big',d:['small','dangerous','beautiful'],e:'大象体型 **big**,后接 but 转折(但对人友好)。'},
      {w:'legs',d:['arms','hair','hands'],e:'大象有粗壮的长 **legs**(腿),不是 arms/hands。'},
      {w:'nose',d:['tail','neck','head'],e:'大象用长 **nose**(鼻子)吃喝,最标志特征。'},
      {w:'live',d:['sleep','run','fly'],e:'**live** in the forest=生活在森林。'},
      {w:'vegetables',d:['meat','fish','milk'],e:'草食:plants、fruit 和 **vegetables**(蔬菜)。'},
      {w:'clever',d:['lazy','scary','ugly'],e:'能帮人工作、会玩游戏→很 **clever**(聪明)。'},
      {w:'can',d:['do','are','like'],e:'they **can** swim well(can 表能力,后接动词原形)。'},
      {w:'like',d:['call','see','make'],e:'Do you **like** these animal friends?(喜欢)'},
    ],
  },
  {
    id:'c2000001-0a1b-4c2d-8e3f-000000000003', title:'七下 U2 完形:Our School Rules', unit:'U2', difficulty:2, sort_order:1,
    tgt:[0,3,1,2,3,0,2,1],
    body:`Rules are everywhere. At our school, we have many rules and we must follow (1)____ every day. First, we cannot be late (2)____ school. We must arrive at the classroom before 7:30 a.m. Second, we must wear our school (3)____ from Monday to Friday. Can we (4)____ food into the classroom? No, we can't. We can only eat in the dining hall. Third, look at the signs in the hallway. They say, "(5)____ run here!" and "Be quiet." We must (6)____ quietly in the hallway. Rules help us study well. Do you (7)____ to follow rules at your school? Let (8)____ be good students together.`,
    qs:[
      {w:'them',d:['it','they','him'],e:'many rules→宾格 **them**(作 follow 的宾语)。'},
      {w:'for',d:['to','at','in'],e:'be late **for** school(固定搭配:……迟到)。'},
      {w:'uniforms',d:['uniform','shoe','clothes'],e:'our school **uniforms**(校服,用复数)。'},
      {w:'bring',d:['brings','to bring','bringing'],e:'情态动词 Can 后接动词原形→**bring**。'},
      {w:"Don't",d:['Not','No',"Can't"],e:'否定祈使句:**Don’t**+动词原形 run。'},
      {w:'walk',d:['walks','walking','to walk'],e:'情态动词 must 后接动词原形→**walk**。'},
      {w:'have',d:['must','can','should'],e:'后面有 to→**have** to do sth(必须;must/can 后不加 to)。'},
      {w:'us',d:['we','our','ours'],e:'Let **us**+动词原形(祈使句固定,用宾格)。'},
    ],
  },
  {
    id:'c2000002-0a1b-4c2d-8e3f-000000000004', title:'七下 U2 完形:Rules in the Library', unit:'U2', difficulty:2, sort_order:2,
    tgt:[3,2,1,0,2,0,3,1],
    body:`The city library is a wonderful place. It is very (1)____ inside, so many people love to read books here. But we must follow the library rules. When you enter the library, please don't (2)____ or make noise. Your mobile phones (3)____ be off, or you can put them on silent mode. Can we (4)____ juices or water here? Yes, but you must be careful. Do not drop water on the books. (5)____ clean after you drink. Also, we can (6)____ three books from the library every time. But we cannot keep them (7)____ a long time. Let's remember these (8)____ and enjoy our reading time.`,
    qs:[
      {w:'quiet',d:['noisy','dirty','cold'],e:'图书馆很 **quiet**(安静),后文 make noise 印证。'},
      {w:'talk',d:['read','sit','look'],e:'don’t **talk** or make noise(说话会产生噪音)。'},
      {w:'must',d:['can','have',"mustn't"],e:'手机 **must** be off(规定:必须关)。'},
      {w:'drink',d:['wash','buy','sell'],e:'**drink** juices or water(喝),后文 after you drink。'},
      {w:'Keep',d:['Leave','Make','Give'],e:'**Keep** clean=保持干净(Keep+形容词)。'},
      {w:'borrow',d:['lose','write','buy'],e:'**borrow** … from the library(借书)。'},
      {w:'for',d:['in','at','on'],e:'cannot keep them **for** a long time(for+一段时间)。'},
      {w:'rules',d:['plans','stories','games'],e:'remember these **rules**(规则,全文主题)。'},
    ],
  },
];

function buildOptions(w, d, tIdx) {
  const opts = new Array(4);
  opts[tIdx] = w;
  let di = 0;
  for (let k = 0; k < 4; k++) if (k !== tIdx) opts[k] = d[di++];
  return opts;
}
function wc(b) { return b.split(/\s+/).filter(Boolean).length; }

let sql = '-- ============================================================\n';
sql += '-- 完形批1: 7B U1+U2 共4篇(各8空); 解析精简加粗; 答案已打散(ABCD各2)\n';
sql += '-- 含修复:U1第2篇(7)→can; U2第2篇(7)→for(原take/bring软判断已删)\n';
sql += '-- 幂等 WHERE NOT EXISTS by title; ⚠️先跑过 cloze-step1-ddl.sql 建表\n';
sql += '-- ============================================================\n\n';

const distSummary = [];
for (const p of PASS) {
  if (p.qs.length !== 8 || p.tgt.length !== 8) throw new Error(p.title + ' not 8');
  const questions = p.qs.map((q, i) => {
    const tIdx = p.tgt[i];
    const options = buildOptions(q.w, q.d, tIdx);
    const answer = 'ABCD'[tIdx];
    if (options[tIdx] !== q.w) throw new Error('build mismatch ' + p.title + ' q' + (i + 1));
    return { q: String(i + 1), options, answer, explanation: q.e };
  });
  distSummary.push(`${p.title.split(':')[1]}: ${questions.map(q => q.answer).join('')}`);
  const qj = JSON.stringify(questions);
  sql += 'INSERT INTO junior_cloze (id, grade, volume, unit, title, body, word_count, difficulty, questions, sort_order)\n';
  sql += `SELECT '${p.id}', 7, '7B', '${p.unit}', '${e(p.title)}', '${e(p.body)}', ${wc(p.body)}, ${p.difficulty}, '${e(qj)}'::jsonb, ${p.sort_order}\n`;
  sql += `WHERE NOT EXISTS (SELECT 1 FROM junior_cloze WHERE title = '${e(p.title)}');\n\n`;
}
sql += '-- 校验(单独跑): U1/U2 应共 4 行, blanks 各 8\n';
sql += "SELECT unit, title, word_count, jsonb_array_length(questions) AS blanks FROM junior_cloze WHERE volume='7B' AND unit IN ('U1','U2') ORDER BY unit, sort_order;\n";
sql += '-- END OF FILE cloze-u1u2.sql\n';

writeFileSync('scripts/cloze-u1u2.sql', sql);
const sq = (sql.match(/'/g) || []).length;
console.log('篇数:', PASS.length, '| 每篇答案分布(打散后):');
distSummary.forEach(s => console.log('  ' + s));
console.log('single-quote total:', sq, sq % 2 === 0 ? '(EVEN ✓)' : '(ODD ✗)');
// 验证每篇 ABCD 各2
PASS.forEach((p, pi) => {
  const cnt = { A: 0, B: 0, C: 0, D: 0 };
  p.tgt.forEach(t => cnt['ABCD'[t]]++);
  const ok = cnt.A === 2 && cnt.B === 2 && cnt.C === 2 && cnt.D === 2;
  if (!ok) console.log('  ⚠️ 分布不均:', p.title, cnt);
});
console.log('每篇 ABCD 各2:', PASS.every(p => { const c = {}; p.tgt.forEach(t => c[t] = (c[t] || 0) + 1); return [0,1,2,3].every(k => c[k] === 2); }) ? '✓' : '✗');
console.log('word_count:', PASS.map(p => `${p.unit}.${p.sort_order}=${wc(p.body)}`).join(' '));
process.exit(0);
