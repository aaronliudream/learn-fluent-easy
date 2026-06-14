import { writeFileSync } from 'node:fs';
const e = s => String(s).replace(/'/g, "''"); // raw ' -> '' (don't/doesn't)

// id + explanation (backtick literals; e() doubles ' for SQL)
const U = [
  // 3sg (6)
  { id:'b886ab5a-62d3-4949-bb98-76a097084662', ex:`Linda/She 是**第三人称单数**,be 动词用 **is**、have 变 **has**。三单主谓一致:She has(不是 She have)。` },
  { id:'0cdf37b2-84f5-4c1e-8d51-0a9e17b769d4', ex:`grandfather 是三单→have 变 **has**;we 是复数→用原形 **have**。三单加 s、复数用原形,对比记。` },
  { id:'6ac18791-d0ea-4ce2-b28b-3ff1c920e5aa', ex:`school 是**第三人称单数**,动词加 -s→**starts**(与后面 finishes 一致)。` },
  { id:'1612f84a-bd7d-4479-8201-31c288e8f301', ex:`Mary 是三单,brush 以 sh 结尾→加 -es 变 **brushes**(类似 goes/watches)。` },
  { id:'8b3f6e29-3650-4afe-b315-3196b1106b4e', ex:`mother 是三单,watch 以 ch 结尾→加 -es 变 **watches**(与 reads 并列,都用三单)。` },
  { id:'db707296-ae8a-44d2-b30d-5ce5850dffaa', ex:`cat 是**第三人称单数**,动词加 -s→**sleeps**。usually 表习惯,用一般现在时。` },
  // q (2)
  { id:'9b88885a-8772-4fb9-97b3-ceaad57984b9', ex:`主语 your parents 是**复数**,一般现在时疑问句用 **Do** 开头,后接动词原形 like。(三单才用 Does)` },
  { id:'4c8d7b1d-8e64-4c34-a8cb-453c6192e508', ex:`一般现在时的肯定简答用 **Yes, 主语 + do/does**→**I do**(表示"我喜欢")。` },
  // neg (3)
  { id:'b6747928-e807-4f9a-9d9e-efab69f280a3', ex:`主语 we 是复数,一般现在时否定用 **don't**+动词原形(don't have)。(三单才用 doesn't)` },
  { id:'8fc72877-07ff-4469-bc44-dcf3dab76f95', ex:`主语 brother 是三单,一般现在时否定用 **doesn't**+动词**原形**→doesn't **clean**(不是 doesn't cleans)。` },
  { id:'01eb8919-0d69-4b74-bbd5-c49813b7401f', ex:`主语 Ms. Green 是三单,否定用 **doesn't**+原形 speak。doesn't 后动词用原形。` },
  // aff (2)
  { id:'de916feb-671e-4c88-aadb-d1bcf9746c81', ex:`主语 Li Hua and I 相当于 **we(复数)**,be 用 **are**、实义动词用原形 **have**。复数主语动词不加 s。` },
  { id:'aa639e59-dcc2-4a43-849e-6d384356807a', ex:`主语 Jack and his brother 是**复数**,实义动词 do 用原形 **do**(do homework 做作业)。复数主语动词用原形。` },
];

let sql='';
sql+="-- ============================================================\n";
sql+="-- t05 补 13 道缺解析 (全mcq); 只 SET explanation, WHERE id 定位\n";
sql+="-- ============================================================\n\n";
U.forEach((u,i)=>{
  sql+=`-- ${i+1}\nUPDATE junior_grammar_questions SET explanation = '${e(u.ex)}' WHERE id = '${u.id}';\n\n`;
});
sql+="-- 校验(单独跑): mcq 缺解析应 0\n";
sql+="SELECT count(*) FROM junior_grammar_questions WHERE point_id='b9cd9a42-3f90-4722-ad55-810e23abfb87' AND question_type='mcq' AND (explanation IS NULL OR explanation='');\n";
writeFileSync('scripts/t05-expl.sql',sql);
const sq=(sql.match(/'/g)||[]).length;
console.log('updates:', U.length);
console.log('single-quote total:', sq, sq%2===0?'(EVEN ✓)':'(ODD ✗)');
console.log('SQL bytes:', sql.length);
process.exit(0);
