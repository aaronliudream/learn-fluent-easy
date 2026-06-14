import { writeFileSync } from 'node:fs';
const e = s => String(s).replace(/'/g, "''");

const PASS = [
  { id:'c3000001-0a1b-4c2d-8e3f-000000000005', title:'七下 U3 完形:Mike’s Sports Club', unit:'U3', difficulty:2, sort_order:1, tgt:[1,0,3,2,0,2,1,3],
    body:`Tim loves sports. He wants to be strong, so he (1)____ exercises after school. He joins the school basketball club. The club members meet (2)____ a week, on Tuesday and Thursday. Tim is very good at basketball. He (3)____ play it well. (4)____ does he go swimming? He goes swimming every Sunday morning. But his sister Lily (5)____ swims. She does not like water at all, so she never goes to the pool. Today, Tim's parents are (6)____ the club to watch him play. Do you want to have a healthy (7)____? Come and (8)____ sports with us!`,
    qs:[
      {w:'always',d:['always is','is always','always does'],e:'频率副词 **always** 放实义动词(exercises)前。'},
      {w:'twice',d:['two','second','two time'],e:'"一周两次"用 **twice** a week。'},
      {w:'can',d:['is','must to','does'],e:'**can**+动词原形 play(会、能力)。'},
      {w:'How often',d:['How long','How much','How many'],e:'答 every Sunday(频率)→**How often**。'},
      {w:'never',d:["don't","doesn't",'not'],e:'Lily swims(带 s),副词 **never** 直接修饰单三动词。'},
      {w:'at',d:['on','from','under'],e:'**at** the club(在俱乐部,固定)。'},
      {w:'body',d:['bodies','tooth','teeth'],e:'a healthy **body**(a+可数单数)。'},
      {w:'do',d:['play','run','swim'],e:'**do** sports(做运动;play 接球类)。'},
    ]},
  { id:'c3000002-0a1b-4c2d-8e3f-000000000006', title:'七下 U3 完形:Fitness Advice for Students', unit:'U3', difficulty:2, sort_order:2, tgt:[2,1,0,3,1,3,0,2],
    body:`Do you want to stay fit? Here is some good (1)____ for you. First, exercise every day. Running is a good (2)____. It makes your legs (3)____ and healthy. Second, do not sit all day. Many students watch (4)____ for hours. That is bad for your eyes. You can play basketball with your (5)____ after class. It is fun and you can make new friends. Third, go to school on foot if your home is near. Walking is also a kind of exercise. Finally, get enough (6)____. A tired body cannot work well. Follow these (7)____ habits, and you can (8)____ your school life.`,
    qs:[
      {w:'advice',d:['food','game','rule'],e:'全文给学生"建议"→**advice**。'},
      {w:'sport',d:['food','book','room'],e:'Running 是一种 **sport**(运动)。'},
      {w:'strong',d:['long','short','slow'],e:'跑步使腿 **strong**(强壮),与 healthy 并列。'},
      {w:'TV',d:['basketball','books','food'],e:'watch **TV** for hours→对眼睛有害。'},
      {w:'friends',d:['teachers','dogs','parents'],e:'后文 make new friends→和 **friends** 打球。'},
      {w:'sleep',d:['homework','food','water'],e:'get enough **sleep**(睡眠);A tired body 印证。'},
      {w:'healthy',d:['bad','busy','dangerous'],e:'跑步/打球/步行/睡眠都是 **healthy** habits(健康习惯)。'},
      {w:'enjoy',d:['lose','stop','forget'],e:'好习惯→**enjoy** your school life(享受)。'},
    ]},
  { id:'c4000001-0a1b-4c2d-8e3f-000000000007', title:'七下 U4 完形:What’s for Dinner?', unit:'U4', difficulty:2, sort_order:1, tgt:[0,3,1,2,3,0,2,1],
    body:`Tim and his mother are at the supermarket. They want to buy some food for dinner. "Mum, would you (1)____ some beef?" Tim asks. "Yes, let's get some," his mother says. "We also need (2)____ vegetables. Let's buy some tomatoes and carrots." Tim looks at the fruit. "Are there (3)____ apples in the basket?" he asks. "No, there aren't. Let's buy (4)____ apples." Then, they go to buy drinks. Tim wants (5)____ milk. His mother says, "Ok, let's get two (6)____ of milk." Tim's mother does not want (7)____ juice because it has too (8)____ sugar. Sugar is not good for teeth.`,
    qs:[
      {w:'like',d:['want','likes','to like'],e:'would **like** some beef(would like 固定;疑问后用原形)。'},
      {w:'some',d:['much','any','an'],e:'vegetables 可数复数+肯定→**some**。'},
      {w:'any',d:['some','much','many'],e:'一般疑问句"一些"→**any**(apples 可数)。'},
      {w:'many',d:['a piece of','a glass of','much'],e:'apples 可数复数→**many**。'},
      {w:'some',d:['many','any','a'],e:'milk 不可数+肯定→**some**。'},
      {w:'bottles',d:['bottle','piece','pieces'],e:'two+可数量词复数→**bottles**(牛奶用瓶装)。'},
      {w:'any',d:['some','many','an'],e:'does not want(否定)→**any**(juice 不可数)。'},
      {w:'much',d:['many','some','any'],e:'too **much** sugar(too much+不可数)。'},
    ]},
  { id:'c4000002-0a1b-4c2d-8e3f-000000000008', title:'七下 U4 完形:Healthy Eating Habits', unit:'U4', difficulty:2, sort_order:2, tgt:[3,2,1,0,2,0,3,1],
    body:`Healthy food gives us energy. It helps us grow well. What is a healthy meal? First, breakfast is very (1)____. For breakfast, you can drink a glass of (2)____ and eat an egg. Do not go to school with an empty stomach. For lunch and dinner, you need a balance of food. Eat some (3)____ or bread because they give you energy. Do not eat too much meat like (4)____ or fried chicken. They have too much fat. You must eat a lot of vegetables and (5)____ every day. They have vitamins. When you are (6)____, please drink water. Do not drink too much juice because it has too much (7)____. Choose your food well and stay (8)____!`,
    qs:[
      {w:'important',d:['dangerous','busy','bad'],e:'早饭很 **important**(后文别空腹上学)。'},
      {w:'milk',d:['bread','meat','rice'],e:'a glass of **milk**(杯装液体)。'},
      {w:'rice',d:['water','juice','tea'],e:'与 bread 并列、给能量→**rice**(主食)。'},
      {w:'hamburgers',d:['apples','carrots','tomatoes'],e:'too much meat like **hamburgers** or fried chicken(肉类高脂)。'},
      {w:'fruit',d:['sugar','salt','meat'],e:'vegetables 和 **fruit**(含 vitamins)。'},
      {w:'thirsty',d:['hungry','tired','happy'],e:'**thirsty**(口渴)时 drink water。'},
      {w:'sugar',d:['water','milk','apple'],e:'果汁含太多 **sugar**(糖)。'},
      {w:'healthy',d:['hungry','tired','late'],e:'选好食物,保持 **healthy**(健康)。'},
    ]},
  { id:'c5000001-0a1b-4c2d-8e3f-000000000009', title:'七下 U5 完形:A Busy Sunday Afternoon', unit:'U5', difficulty:3, sort_order:1, tgt:[1,3,0,2,2,0,3,1],
    body:`It is a sunny Sunday afternoon. Now, all the family members (1)____ at home. What are they doing? Look! Mr. Green (2)____ a book in the living room. He always (3)____ books on Sundays. Mrs. Green is in the kitchen. She (4)____ dinner for the family. Listen! Who (5)____ in the next room? Oh, it is Mary. She is singing an English song. Where is Tom? He is in the garden. He (6)____ with his cute dog. The dog (7)____ running happily on the grass. They (8)____ having a great time at the moment!`,
    qs:[
      {w:'are',d:['is','am','be'],e:'all the family members(复数)→be 用 **are**。'},
      {w:'is reading',d:['read','reads','reading'],e:'Look!→现在进行时,Mr. Green→**is reading**。'},
      {w:'reads',d:['read','reading','is reading'],e:'always(习惯)→一般现在时,He→**reads**。'},
      {w:'is cooking',d:['cook','cooks','cooking'],e:'此刻在厨房→**is cooking**(现在进行时)。'},
      {w:'is singing',d:['are singing','sing','sings'],e:'Listen!→进行时;Who 作主语默认单数→**is singing**。'},
      {w:'is playing',d:['play','plays','playing'],e:'Tom 此刻在玩→**is playing**。'},
      {w:'is',d:['are','am','be'],e:'The dog(单数)+running→进行时助动词 **is**。'},
      {w:'are',d:['is','am','be'],e:'at the moment+They→**are** having。'},
    ]},
  { id:'c5000002-0a1b-4c2d-8e3f-000000000010', title:'七下 U5 完形:At the Sports Center', unit:'U5', difficulty:3, sort_order:2, tgt:[0,2,3,1,1,3,2,0],
    body:`Today is Saturday. The sports center is very busy (1)____. Many people are doing their favorite sports here. Look at the swimming pool. Some boys are swimming in the (2)____. They are fast like fish. In the big hall, a basketball game is happening. Ten students are playing (3)____. Many people are watching them. Near the window, two girls are dancing (4)____ music. They look very beautiful. Where is Tony? Oh, he is sitting on a chair. He is (5)____ a storybook. He is resting because he is (6)____ after running. Everyone is having a (7)____ time at the center at the (8)____.`,
    qs:[
      {w:'now',d:['yesterday','ago','last week'],e:'现在进行时(are doing)→时间状语 **now**。'},
      {w:'water',d:['tree','room','desk'],e:'swimming pool→在 **water** 里游泳。'},
      {w:'basketball',d:['books','food','music'],e:'a basketball game→打 **basketball**。'},
      {w:'to',d:['on','under','from'],e:'dance **to** music(随着音乐跳)。'},
      {w:'reading',d:['writing','cooking','washing'],e:'a storybook→**reading**(看书)。'},
      {w:'tired',d:['happy','dangerous','fast'],e:'resting after running→**tired**(累)。'},
      {w:'good',d:['bad','cold','noisy'],e:'have a **good** time(玩得开心,固定)。'},
      {w:'moment',d:['year','month','morning'],e:'at the **moment**(此刻,进行时标志)。'},
    ]},
  { id:'c6000001-0a1b-4c2d-8e3f-000000000011', title:'七下 U6 完形:The Weather Today', unit:'U6', difficulty:3, sort_order:1, tgt:[2,0,1,3,3,1,0,2],
    body:`Today is Saturday. How (1)____ the weather today? It is (2)____ in Beijing now. The sun is shining brightly. But the weather (3)____ different in Harbin. It is snowy and very (4)____ there. People are wearing heavy clothes. Look! Some children (5)____ a snowman in the park. They are laughing. What about London? It (6)____ raining at the moment. The trees and roads are wet. The weather changes all the time, so people in different places (7)____ doing different things now. Are you (8)____ a good time in your city today?`,
    qs:[
      {w:'is',d:['am','are','be'],e:'How **is** the weather?(weather 不可数)。'},
      {w:'sunny',d:['sun','wind','rain'],e:'It is **sunny**(It is+形容词;后文 sun shining)。'},
      {w:'is',d:['am','are','be'],e:'the weather(不可数)→**is**。'},
      {w:'cold',d:['hot','warm','cool'],e:'snowy+穿厚衣→很 **cold**。'},
      {w:'are making',d:['make','makes','is making'],e:'Look!+Some children(复数)→**are making**。'},
      {w:'is',d:['are','am','be'],e:'at the moment+It→**is** raining。'},
      {w:'are',d:['is','am','be'],e:'people(复数)+now→**are** doing。'},
      {w:'having',d:['have','has','to have'],e:'Are you **having** a good time?(Are+ing)。'},
    ]},
  { id:'c6000002-0a1b-4c2d-8e3f-000000000012', title:'七下 U6 完形:A Rainy Sunday', unit:'U6', difficulty:3, sort_order:2, tgt:[3,1,2,0,0,2,1,3],
    body:`I don't like rainy days because I cannot play basketball outside. Today, it is (1)____ outside and the sky is grey. Big drops of water are falling from the sky. So, I must stay (2)____ home today. My father is looking out of the (3)____. He cannot drive his car because he cannot see the road clearly in the heavy (4)____. My mother is cooking a warm soup in the kitchen. My little sister is playing with her toys. We cannot see the (5)____ today because there are too many dark clouds. I hope tomorrow can be (6)____. Then the weather can be (7)____ and we can run in the (8)____ again!`,
    qs:[
      {w:'rainy',d:['sunny','windy','snowy'],e:"don't like rainy days+drops of water→**rainy**。"},
      {w:'at',d:['on','under','from'],e:'stay **at** home(待在家,固定)。'},
      {w:'window',d:['desk','bed','chair'],e:'look out of the **window**(向窗外看)。'},
      {w:'rain',d:['snow','wind','sun'],e:'heavy **rain**(大雨,看不清路)。'},
      {w:'sun',d:['rain','water','snow'],e:'too many dark clouds→看不见 **sun**(太阳)。'},
      {w:'sunny',d:['rainy','cloudy','cold'],e:'希望明天天好出去玩→**sunny**(晴)。'},
      {w:'fine',d:['bad','wet','snowy'],e:'The weather is **fine**(天气好,固定)。'},
      {w:'park',d:['kitchen','room','bed'],e:'天晴去 **park** 里跑(outside)。'},
    ]},
  { id:'c8000001-0a1b-4c2d-8e3f-000000000013', title:'七下 U8 完形:The King’s Clever Dog', unit:'U8', difficulty:3, sort_order:1, tgt:[1,2,0,3,3,0,2,1],
    body:`Once upon a time, there (1)____ an old king in a beautiful castle. He had a very clever dog. One day, the king (2)____ to the deep forest alone. He (3)____ see the road back because it was too dark. He was very afraid. Then, his dog looked (4)____ him. The dog ran fast and found the king by his smell. After that, the dog led the king out (5)____ the forest. Finally, they came (6)____ to the castle safely. The king was very happy. He (7)____ the dog a big piece of meat. There (8)____ many rewards for the dog after that day.`,
    qs:[
      {w:'was',d:['is','are','were'],e:'Once upon a time(过去)+an old king(单数)→there **was**。'},
      {w:'went',d:['go','goes','going'],e:'go 的过去式→**went**。'},
      {w:"couldn't",d:["can't","don't","didn't"],e:'过去"不能"+see→**couldn’t**(can 的过去否定)。'},
      {w:'for',d:['at','after','up'],e:'look **for** him(寻找)。'},
      {w:'of',d:['from','in','on'],e:'out **of** the forest(从……里出来)。'},
      {w:'back',d:['to','in','out'],e:'came **back** to the castle(回到)。'},
      {w:'gave',d:['give','gives','giving'],e:'give 的过去式→**gave**(给狗一块肉)。'},
      {w:'were',d:['is','was','are'],e:'many rewards(复数)+过去→there **were**。'},
    ]},
  { id:'c8000002-0a1b-4c2d-8e3f-000000000014', title:'七下 U8 完形:The Little Bird and the Big Tree', unit:'U8', difficulty:3, sort_order:2, tgt:[0,1,3,2,2,3,1,0],
    body:`Long ago, a little bird lived in a green forest. She was very small, but she had a big friend. It was an old (1)____. Every day, the bird (2)____ beautiful songs on it. The tree listened (3)____ her music and felt very happy. One day, a cold winter (4)____. The weather became very cold and snowy. The little bird had to (5)____ to the warm south. Before she left, she (6)____ to the tree, "Please wait for me." The tree was very sad, but he smiled and said, "(7)____, my friend. See you next year." Finally, spring came back, and the bird returned. She found her friend again and they were (8)____ again.`,
    qs:[
      {w:'tree',d:['dog','cat','river'],e:'后文 the bird on it / The tree→老 **tree**(树)。'},
      {w:'sang',d:['made','wrote','heard'],e:'sing 的过去式+songs→**sang**(唱歌)。'},
      {w:'to',d:['at','for','on'],e:'listen **to** her music(听……)。'},
      {w:'came',d:['stopped','left','lost'],e:'寒冬"来临"→**came**(后文变冷下雪)。'},
      {w:'fly',d:['run','swim','walk'],e:'鸟去南方→**fly**(飞)。'},
      {w:'said',d:['asked','called','told'],e:'said **to** the tree(对……说;后接直接引语)。'},
      {w:'Goodbye',d:['Hello','Morning','Thanks'],e:'要离开+See you next year→**Goodbye**(再见)。'},
      {w:'happy',d:['sad','cold','tired'],e:'春天重逢→很 **happy**(快乐)。'},
    ]},
];

function buildOptions(w, d, tIdx) { const o = new Array(4); o[tIdx] = w; let di = 0; for (let k = 0; k < 4; k++) if (k !== tIdx) o[k] = d[di++]; return o; }
function wc(b) { return b.split(/\s+/).filter(Boolean).length; }

let sql = '-- ============================================================\n';
sql += '-- 完形批2: 7B U3-U6 + U8 共10篇(各8空); 精简加粗解析; 答案打散(ABCD各2)\n';
sql += '-- 含修复:U3第2篇(7)→ "Follow these ___ habits" 答案 healthy(原 healthy healthy bug)\n';
sql += '-- 时态:U3-U4一般现在时 / U5-U6现在进行时 / U8一般过去时\n';
sql += '-- 幂等 WHERE NOT EXISTS by title; ⚠️先跑过 cloze-step1-ddl.sql 建表\n';
sql += '-- ============================================================\n\n';

const dist = [];
for (const p of PASS) {
  if (p.qs.length !== 8 || p.tgt.length !== 8) throw new Error(p.title + ' not 8');
  const c = {}; p.tgt.forEach(t => c[t] = (c[t] || 0) + 1);
  if (![0,1,2,3].every(k => c[k] === 2)) throw new Error('tgt 分布不均 ' + p.title);
  const questions = p.qs.map((q, i) => {
    const tIdx = p.tgt[i]; const options = buildOptions(q.w, q.d, tIdx); const answer = 'ABCD'[tIdx];
    if (options[tIdx] !== q.w) throw new Error('build mismatch ' + p.title + ' q' + (i + 1));
    if (new Set(options).size !== 4) throw new Error('dup option ' + p.title + ' q' + (i + 1));
    return { q: String(i + 1), options, answer, explanation: q.e };
  });
  dist.push(`${p.unit}.${p.sort_order} ${p.title.split(':')[1]}: ${questions.map(q => q.answer).join('')}`);
  const qj = JSON.stringify(questions);
  sql += 'INSERT INTO junior_cloze (id, grade, volume, unit, title, body, word_count, difficulty, questions, sort_order)\n';
  sql += `SELECT '${p.id}', 7, '7B', '${p.unit}', '${e(p.title)}', '${e(p.body)}', ${wc(p.body)}, ${p.difficulty}, '${e(qj)}'::jsonb, ${p.sort_order}\n`;
  sql += `WHERE NOT EXISTS (SELECT 1 FROM junior_cloze WHERE title = '${e(p.title)}');\n\n`;
}
sql += '-- 校验(单独跑): 全 7B 应共 16 行(含 U7), blanks 各 8\n';
sql += "SELECT unit, sort_order, title, word_count, jsonb_array_length(questions) AS blanks FROM junior_cloze WHERE volume='7B' ORDER BY unit, sort_order;\n";
sql += '-- END OF FILE cloze-u3-8.sql\n';
writeFileSync('scripts/cloze-u3-8.sql', sql);

const sq = (sql.match(/'/g) || []).length;
console.log('篇数:', PASS.length, '(应10)');
dist.forEach(d => console.log('  ' + d));
console.log('single-quote total:', sq, sq % 2 === 0 ? '(EVEN ✓)' : '(ODD ✗)');
console.log('每篇8空+ABCD各2+选项无重复: 断言通过(throw才会拦)');
console.log('word_count:', PASS.map(p => `${p.unit}.${p.sort_order}=${wc(p.body)}`).join(' '));
process.exit(0);
