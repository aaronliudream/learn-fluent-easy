import { writeFileSync } from 'node:fs';

const e = s => String(s).replace(/'/g, "''"); // SQL single-quote doubling

// ---- fixed UUIDs (hardcoded = previously reviewed) ----
const PUUID = '79a87c79-ffc6-4b67-882b-35784c820f5d';
const KP_FREQ = '4ded9d97-3d03-4b0a-a7d9-86354e058704';
const KP_HOW  = '2bc3448e-0207-4ec4-9940-52ef167e243a';
const QUUID = [
  '08ee2fb7-3b62-4a33-aede-c7bee11417f2','ad25e4d5-6d0e-4bca-a170-e46f81d288cc',
  '808c71e1-5f66-43ec-aa91-a9b21c2cd4cf','556a49c3-64d3-4283-8a7c-0ad86fa4140f',
  '1c95a73d-f48a-4c39-bf77-0c25d6f2b6ce','a5b58009-486e-49cd-823e-cbb4728983b7',
  '4ab805c6-74e5-4c0d-a689-b2f0862abd41','3841623a-febe-4974-adcb-f7180e08c2e5',
  '1efaa5a7-dbbf-452b-ad81-e1bb566e0311','c01a2b90-c758-4841-a2dd-324b7266ddb4',
  'd777129c-5d90-49fa-bdb9-dcd21a98f1dd','94236968-9ce9-480d-b995-41088a125629',
  'f87dd231-404f-49bd-8ca2-cf9fb0e4a9a2','1e79a87a-2987-49d6-9e6e-e3f821f30d23',
  '762da5bb-3dcf-48a2-9f94-1f4fa7161a1b','c7345f35-c933-4926-b55b-b51312c53c0d',
  'd9c74d58-134d-45f0-8911-e70b289ce0e7','962c6d18-3d0a-4010-bee5-0173b02a2922',
  '1141a741-71ec-41b4-a6e2-2c77105103e2','659ede9f-eecf-4f5a-8e33-45eb7762f37b',
];

const OTHER_CAT = 'e05f9874-6401-42f8-a361-28f1dee3a58e';

// ---- 20 questions ----
// kp: 'freq' | 'howoften'
const Q = [
  // freq kp (12)
  {kp:'freq', stem:"I ___ eat vegetables because they are healthy.", a:"always", b:"badly", c:"quickly", d:"carefully", ans:"A",
   ex:"频率副词(**always**总是/**usually**通常/**often**经常/**sometimes**有时/**seldom**很少/**never**从不)表示频率。蔬菜健康→**always**总是吃。"},
  {kp:'freq', stem:"Tom is fat because he ___ exercises.", a:"always", b:"usually", c:"seldom", d:"often", ans:"C",
   ex:"他胖→**seldom**很少锻炼。seldom=很少,表低频率。"},
  {kp:'freq', stem:"We should ___ eat junk food. It is bad for our health.", a:"always", b:"usually", c:"seldom", d:"often", ans:"C",
   ex:"垃圾食品有害→应该**seldom**很少吃。"},
  {kp:'freq', stem:"My mother ___ goes to the gym. She goes three times a week.", a:"never", b:"often", c:"seldom", d:"hardly", ans:"B",
   ex:"一周三次→**often**经常去健身房。"},
  {kp:'freq', stem:"Frequency adverbs like always usually go ___ the main verb.", a:"before", b:"after", c:"behind", d:"under", ans:"A",
   ex:"频率副词通常放在**实义动词之前**(I always eat...)。所以选**before**。"},
  {kp:'freq', stem:"Lily ___ drinks milk in the morning. It is a good habit.", a:"always", b:"never", c:"badly", d:"hardly", ans:"A",
   ex:"好习惯→**always**总是喝牛奶。"},
  {kp:'freq', stem:"— Does your father smoke? — No, he ___ smokes. He cares about health.", a:"always", b:"usually", c:"often", d:"never", ans:"D",
   ex:"关心健康→**never**从不抽烟。never=从不,表零频率。"},
  {kp:'freq', stem:"I ___ feel tired because I sleep eight hours every night.", a:"always", b:"seldom", c:"usually", d:"often", ans:"B",
   ex:"睡够8小时→**seldom**很少感到累。"},
  {kp:'freq', stem:"Frequency adverbs usually go ___ the verb be.", a:"before", b:"after", c:"under", d:"behind", ans:"B",
   ex:"频率副词放在**be动词之后**(She is never late)。所以选**after**。"},
  {kp:'freq', stem:"Healthy people ___ eat too much sugar.", a:"always", b:"usually", c:"seldom", d:"often", ans:"C",
   ex:"健康的人→**seldom**很少吃太多糖。"},
  {kp:'freq', stem:"He ___ walks to school to keep fit. Walking is good exercise.", a:"never", b:"usually", c:"seldom", d:"hardly", ans:"B",
   ex:"为保持健康→**usually**通常走路上学。"},
  {kp:'freq', stem:"— How often do you exercise? — I ___ exercise, almost every day.", a:"seldom", b:"never", c:"usually", d:"hardly", ans:"C",
   ex:"几乎每天→**usually**通常锻炼,表高频率。"},
  // howoften kp (8)
  {kp:'howoften', stem:"— ___ do you eat fruit? — Twice a day.", a:"How often", b:"How much", c:"How many", d:"How long", ans:"A",
   ex:"答语“一天两次”是频率→用**How often**问频率(多久一次)。"},
  {kp:'howoften', stem:"— How often does she go swimming? — ___.", a:"Two hours", b:"Twice a week", c:"Very well", d:"By bus", ans:"B",
   ex:"How often问频率,答语用频率→**Twice a week**一周两次。"},
  {kp:'howoften', stem:"How often is used to ask about ___.", a:"time", b:"price", c:"frequency", d:"distance", ans:"C",
   ex:"**How often**用来问**频率**(frequency,多久一次)。"},
  {kp:'howoften', stem:"— How often do you play sports? — ___ a week.", a:"Two time", b:"Twice", c:"Second", d:"Twice time", ans:"B",
   ex:"“一周两次”=**twice** a week。twice=两次,固定用法。"},
  {kp:'howoften', stem:"— ___ does your brother work out? — Every day.", a:"How long", b:"How much", c:"How often", d:"How far", ans:"C",
   ex:"答语“每天”是频率→用**How often**问。"},
  {kp:'howoften', stem:"— How often do you eat fast food? — ___. I think it is unhealthy.", a:"Never", b:"Two hours", c:"Very much", d:"By car", ans:"A",
   ex:"How often可用频率副词答→**Never**从不(因为不健康)。"},
  {kp:'howoften', stem:"— How often do they have PE classes? — ___ a week.", a:"Three time", b:"Three times", c:"Third", d:"Third time", ans:"B",
   ex:"“一周三次”=**three times** a week。三次及以上用“数字+times”。"},
  {kp:'howoften', stem:"— How often do you drink water? — I drink water ___.", a:"by hand", b:"very fast", c:"all the time", d:"last week", ans:"C",
   ex:"How often问频率→**all the time**一直/总是,表高频率。"},
];

if (QUUID.length !== Q.length) throw new Error(`UUID count ${QUUID.length} != Q count ${Q.length}`);

let sql = '';
sql += "-- ============================================================\n";
sql += "-- U3 (Keep Fit) 独立频率副词 point g7-t24 + 2kp + 20题\n";
sql += "-- 全部 WHERE NOT EXISTS 幂等; FK 用 subselect-by-code 绑定\n";
sql += "-- ============================================================\n\n";

// ---- ① build point ----
sql += "-- ① 建 point g7-t24\n";
sql += "INSERT INTO junior_grammar_points (id, category_id, code, title, cefr, grade, summary, explanation_md, examples, sort_order, ai_corpus)\n";
sql += `SELECT '${PUUID}', '${OTHER_CAT}', 'g7-t24', '${e('频率副词与频率提问（含How often）')}', 'A1', 7, '${e('初一专题：频率副词(always/usually/often/sometimes/seldom/never)的用法与位置,以及How often提问。Keep Fit健身主题。')}', '', '[]', 24, NULL\n`;
sql += "WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_points WHERE code = 'g7-t24');\n\n";

// ---- ② build 2 kp ----
sql += "-- ② 建 2 kp\n";
sql += "INSERT INTO junior_knowledge_points (id, point_id, code, title, summary, sort_order, target_count)\n";
sql += `SELECT '${KP_FREQ}', (SELECT id FROM junior_grammar_points WHERE code='g7-t24'), 'g7-t24-freq', '${e('频率副词（always/usually/often/sometimes/seldom/never用法与位置）')}', NULL, 1, 20\n`;
sql += "WHERE NOT EXISTS (SELECT 1 FROM junior_knowledge_points WHERE code = 'g7-t24-freq');\n\n";
sql += "INSERT INTO junior_knowledge_points (id, point_id, code, title, summary, sort_order, target_count)\n";
sql += `SELECT '${KP_HOW}', (SELECT id FROM junior_grammar_points WHERE code='g7-t24'), 'g7-t24-howoften', '${e('How often提问与答语')}', NULL, 2, 20\n`;
sql += "WHERE NOT EXISTS (SELECT 1 FROM junior_knowledge_points WHERE code = 'g7-t24-howoften');\n\n";

// ---- ③ 20 questions ----
sql += "-- ③ 20 题 (freq 12 / howoften 8)\n";
Q.forEach((q, i) => {
  const kpcode = q.kp === 'freq' ? 'g7-t24-freq' : 'g7-t24-howoften';
  sql += "INSERT INTO junior_grammar_questions (id, point_id, kp_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, distractors, use_ai_grading)\n";
  sql += `SELECT '${QUUID[i]}', (SELECT id FROM junior_grammar_points WHERE code='g7-t24'), (SELECT id FROM junior_knowledge_points WHERE code='${kpcode}'), '${e(q.stem)}', '${e(q.a)}', '${e(q.b)}', '${e(q.c)}', '${e(q.d)}', '${q.ans}', '${e(q.ex)}', 2, ${i+1}, 'mcq', '[]', false\n`;
  sql += `WHERE NOT EXISTS (SELECT 1 FROM junior_grammar_questions WHERE stem = '${e(q.stem)}');\n\n`;
});

// ---- ④ 校验 SELECT ----
sql += "-- ④ 校验 (跑完手动看)\n";
sql += "SELECT count(*) FROM junior_grammar_points WHERE code='g7-t24'; -- 应 1\n";
sql += "SELECT count(*) FROM junior_knowledge_points WHERE code IN ('g7-t24-freq','g7-t24-howoften'); -- 应 2\n";
sql += "SELECT count(*), kp_id FROM junior_grammar_questions WHERE point_id=(SELECT id FROM junior_grammar_points WHERE code='g7-t24') GROUP BY kp_id; -- 应 freq12/howoften8\n";

writeFileSync('scripts/u3-t24.sql', sql, 'utf8');

// ---- sanity: single-quote pairing ----
const sq = (sql.match(/'/g) || []).length;
console.log('=== UUID 对照表 ===');
console.log('point  g7-t24          :', PUUID);
console.log('kp     g7-t24-freq     :', KP_FREQ);
console.log('kp     g7-t24-howoften :', KP_HOW);
QUUID.forEach((u,i)=>console.log(`q${String(i+1).padStart(2)} [${Q[i].kp.padEnd(8)}] ${u}  ans=${Q[i].ans}`));
console.log('\n=== sanity ===');
console.log('single-quote total count:', sq, sq%2===0 ? '(EVEN ✓)' : '(ODD ✗!!)');
console.log('freq questions:', Q.filter(q=>q.kp==='freq').length, '| howoften:', Q.filter(q=>q.kp==='howoften').length);
console.log('SQL bytes:', sql.length);
process.exit(0);
