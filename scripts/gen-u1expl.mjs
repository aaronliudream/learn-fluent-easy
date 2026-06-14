import { writeFileSync } from 'node:fs';
const e = s => String(s).replace(/'/g, "''");

// id + explanation (backtick literals; e() doubles ' for SQL)
const U = [
  // ---- t02 人称代词与物主代词 / 名词所有格 (17) ----
  { id:'3dee18e0-07fb-422a-92cf-4ef5f83347ec', ex:`形容词性物主代词 **your**(你的)+名词(full name)。物主代词后必须接名词。` },
  { id:'65eef58c-9f64-4bd8-b526-4f5c343d24d1', ex:`**our**(我们的)+名词 classmate;**His**(他的)+名词 name。两空都是形容词性物主代词。` },
  { id:'cfa43acb-abf7-4bcb-a02e-e485d28dd2d8', ex:`**your** book(你的,形容词性物主+名词);**her** book(她的+名词)。注意 your≠yours,后面有名词用 your。` },
  { id:'71bdf86a-b6e5-4b6f-a30c-1c38ff596fcb', ex:`名词所有格:单数名词 +'s 表"……的"→**mother's**(妈妈的)。my mother's brother=舅舅。` },
  { id:'47f381be-f78d-4b54-887f-ec8a065b49af', ex:`形容词性物主 **my**(我的)+sister;**Her**(她的)+name。my/her 后接名词。` },
  { id:'51fa4271-58bd-41f1-bd47-46aabd03590a', ex:`并列名词"共同拥有"→只在**最后一个名词**加's:**Jeff and Tony's** room(两人共用的房间)。` },
  { id:'ebb0c124-8676-4688-b869-cff9da165b2c', ex:`Those **are**(复数主语用 are);**They**(主格,作主语)。They=它们,指代复数。` },
  { id:'d92352f6-c880-45f9-9e9e-06c6cc24d80e', ex:`形容词性物主 **my**(我的)+friend;**He**(主格,作主语)=他。` },
  { id:'05b1b327-c331-43d6-86f6-2b86e4d47f7c', ex:`复数名词所有格:parents 已以 s 结尾,只加一撇→**parents'**(父母的)room。` },
  { id:'96936422-69e5-4e37-822c-2b0c8c8d1c3f', ex:`复数名词所有格:teachers 以 s 结尾,只加撇号→**teachers'**(老师们的)office。` },
  { id:'34b16fbd-53ed-48d9-bba4-6e0667d086e4', ex:`复数名词所有格:students 以 s 结尾,只加撇号→**students'**(学生们的)desk。They sit here 提示是复数。` },
  { id:'75704fcb-3386-44bd-ae8f-73fb277f5caf', ex:`复数名词所有格:girls 以 s 结尾,只加撇号→**girls'**(女孩们的)bags。` },
  { id:'ccc7a0a6-9d7b-4b8a-8eb1-44c50a03517a', ex:`形容词性物主 **My**(我的)+favourite subject。作主语的"我的……"用 My+名词,不用 I/Me/Mine。` },
  { id:'5ba46d1c-976c-41cd-b1e8-87c5954eda59', ex:`宾格 **him**(他):动词 like 后用宾格。like him=喜欢他。` },
  { id:'dadd5b05-47c5-4b50-91cd-fb513b36f71f', ex:`名词性物主代词 **his**(他的东西):单独使用,=his guitar,后面不再接名词。` },
  { id:'92ae53ee-368c-4eb4-bd6f-a6870f05bbb1', ex:`名词所有格单独用:**Linda's**(=Linda's chess set,Linda 的那套)。单数名词 +'s。` },
  { id:'1d1cbbc7-2b19-4804-a115-b55bb84d33f0', ex:`形容词性物主 **his**(他的)+way:lost his way=迷路。his+名词。` },
  // ---- t01 名词单复数 / 可数不可数限定词 (13) ----
  { id:'36079737-e0b7-43ca-aa8e-1de8c35096a9', ex:`规则复数:cousin→**cousins**(+s)。These are…提示用复数。` },
  { id:'c1a059c6-d4c1-4408-b257-c5d9162755ad', ex:`clubs 是可数名词复数,用 **many**(许多)修饰。many+可数复数。` },
  { id:'8435d887-0104-46df-928e-494357bd9207', ex:`名词作定语(修饰另一名词)用单数→**paper** bags(纸袋)。作定语的名词一般不变复数。` },
  { id:'7f7e47a1-6db6-4930-9da0-77ab9446e80c', ex:`表年龄"……岁"用复数 **years**:thirty years old。` },
  { id:'3ed0bf7e-1118-44be-a952-f8effd525993', ex:`表年龄"……岁"用复数 **years**:fifteen years old。` },
  { id:'b3a54bfa-c3c2-4d30-a0da-de7a4fde1d6f', ex:`rules 可数复数,"太多"用 **too many**:too many rules。too many+可数。` },
  { id:'ae703843-6ada-4623-bac9-a5f9866925b0', ex:`people 可数(复数),"太多"用 **too many**:too many people。` },
  { id:'bbcd5fb8-3f14-4a1a-a052-a2d6aaf8237a', ex:`butter 不可数,"太多"用 **too much**:too much butter。too much+不可数。` },
  { id:'9bb5cd78-fb31-4c3e-851b-988685ec861e', ex:`meat 不可数,**little**=几乎没有(否定语气):little meat→所以要去买。little+不可数。` },
  { id:'22c3b335-231f-46d7-8308-4de3fa28461d', ex:`candies 可数复数,"更少"用 **fewer**(few 的比较级):fewer candies。可数用 fewer,不用 less。` },
  { id:'3493a3bf-a31c-4555-b818-cd78c89a5b9b', ex:`eggs 可数复数,**a few**=一些(肯定):a few eggs left。a few+可数复数。` },
  { id:'27bb90cd-07c8-42de-af7d-e744ff90d704', ex:`food 不可数→"更少"用 **less**;water 不可数→"更多"用 **more**。less/more+不可数。` },
  { id:'6038c5d8-c3fa-4fbd-8f86-01b7d8a98470', ex:`apple juice 不可数,**little**=几乎没有(almost empty):little juice。little+不可数。` },
  // ---- t04 be 动词 (3) ----
  { id:'8c7d811b-2d84-4b7f-bbc7-13a0763a6509', ex:`主谓一致:Meimei and I 是复数主语→用 **are**(We are classmates 也提示复数)。` },
  { id:'8ac2d57c-da32-4881-a23f-052837ce9abb', ex:`一般疑问 Are those…? 的否定简答→**No, they aren't**(用主格 they 回答,aren't=are not)。` },
  { id:'0e921a87-6431-4a54-8a2f-359012500594', ex:`Are these…? 否定简答用 **aren't**:No, they aren't(these/those 在简答里用 they)。` },
];

let sql='';
sql+="-- ============================================================\n";
sql+="-- 7A/U1 补缺解析: t02(17)+t01(13)+t04(3)=33 道 mcq; 只 SET explanation\n";
sql+="-- 按各题实际考点(物主/所有格/复数/可数不可数/be一致),WHERE id 定位\n";
sql+="-- ============================================================\n\n";
sql+="-- 【t02 人称代词与物主代词 / 名词所有格 — 17 道】\n";
U.slice(0,17).forEach(u=>sql+=`UPDATE junior_grammar_questions SET explanation = '${e(u.ex)}' WHERE id = '${u.id}';\n`);
sql+="\n-- 【t01 名词单复数 / 可数不可数限定词 — 13 道】\n";
U.slice(17,30).forEach(u=>sql+=`UPDATE junior_grammar_questions SET explanation = '${e(u.ex)}' WHERE id = '${u.id}';\n`);
sql+="\n-- 【t04 be 动词 — 3 道】\n";
U.slice(30,33).forEach(u=>sql+=`UPDATE junior_grammar_questions SET explanation = '${e(u.ex)}' WHERE id = '${u.id}';\n`);
sql+=`\n-- 本文件语句数: 解析 UPDATE ${U.length} 条 (t02 17 + t01 13 + t04 3)\n\n`;
sql+="-- 【校验段】单独跑: 三个 point 的 mcq 缺解析应全 0 (返回空/0行)\n";
sql+="SELECT p.code, count(*) FROM junior_grammar_questions q JOIN junior_grammar_points p ON q.point_id=p.id WHERE p.code IN ('g7-t02','g7-t01','g7-t04') AND q.question_type='mcq' AND (q.explanation IS NULL OR q.explanation='') GROUP BY p.code;\n\n";
sql+="-- END OF FILE u1-expl.sql\n";

writeFileSync('scripts/u1-expl.sql',sql);
const sq=(sql.match(/'/g)||[]).length;
const ids=U.map(u=>u.id);
console.log('UPDATE 条数:', U.length, '(应33)');
console.log('id 唯一:', new Set(ids).size===33?'✓':'✗ dup!');
console.log('single-quote total:', sq, sq%2===0?'(EVEN ✓)':'(ODD ✗)');
console.log('撇号双写检查:', /mother''s/.test(sql)&&/aren''t/.test(sql)&&/parents''/.test(sql)?"✓ (mother''s/aren''t/parents'')":'✗');
console.log('END marker:', /-- END OF FILE u1-expl\.sql\n$/.test(sql)?'✓':'✗');
console.log('SQL bytes:', sql.length);
process.exit(0);
