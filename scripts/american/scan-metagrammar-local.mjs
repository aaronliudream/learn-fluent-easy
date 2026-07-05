/**
 * 本地 JSON 版元语法题扫描 v2(docs/american/book2/am2_l*.json)。
 * 按"题型"分类,高召回:application(运用) / vocab(词义) / concept(元语法) 三类。
 * concept = 既不是运用题、也不是词义题的 stage5/stage10-grammar 题(答案是抽象概念/规则)。
 * 用法: node scripts/american/scan-metagrammar-local.mjs
 */
import fs from "node:fs";
import path from "node:path";

const DIR = "docs/american/book2";
const hasBlank = (s) => /_{2,}|＿|_/.test(s);
const enWords = (s) => (String(s).match(/[A-Za-z][A-Za-z'’.-]*/g) || []).length;
const isEnSentence = (o) => enWords(o) >= 3;

// 词义题:stem 里有英文词 + "意思",选项是中文释义(不含语法元词)
const META_TOKEN = /动词-?ing|过去分词|过去式|动词原形|不定式|复数|单数|名词|时态|句型|从句|系动词|情态|助动词|词尾|构成|否定式|疑问句|加\s*-|表示|经历|承受者|习惯|义务|推测|转述/;
const isVocab = (stem, opts) => {
  if (!/意思是|什么意思|的意思/.test(stem)) return false;
  return opts.every((o) => !/[A-Za-z]{2,}/.test(o)) && !opts.some((o) => META_TOKEN.test(o));
};

// 运用题:①stem 是带 ___ 的英文句子(≥2 英文词) ②选项多为英文句/短语(识别等价句/语序/改写) ③"你想说/说法/改成/换成"场景题
function isApplication(stem, opts) {
  const stemEnBlank = hasBlank(stem) && enWords(stem) >= 2;
  const optsEnSent = opts.filter(isEnSentence).length >= 2;
  const scenario = /你想说|的说法|改成|改写|换成|同样意思|意思相同|意思不变|哪一?句|口语缩略/.test(stem) && opts.some((o) => enWords(o) >= 2);
  return stemEnBlank || optsEnSent || scenario;
}

const files = fs.readdirSync(DIR).filter((f) => /^am2_l\d+\.json$/.test(f))
  .sort((a, b) => a.match(/l(\d+)/)[1] - b.match(/l(\d+)/)[1]);
let totalConcept = 0;
const superLessons = [];
for (const f of files) {
  const j = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  const items = [];
  const scan = (arr, stage, kindGuard) => (arr || []).forEach((q, i) => {
    if (kindGuard && q.kind && q.kind !== "grammar") return;
    const opts = q.options || [];
    if (isVocab(q.stem, opts)) return;
    if (isApplication(q.stem, opts)) return;
    const correct = opts[0]; // JSON 里 options[0] 恒为正确答案
    // HARD = 答案是抽象概念/规则描述(纯背诵);SOFT = 答案是具体英文形式/搭配(近运用)
    const ABSTRACT = /过去分词|动词原形|动词-?ing|动名词|不定式|加\s*-|＋|复数动词|单数动词|可数名词|不可数名词|现在分词作|承受者|反复的习惯|正在.{0,4}(进行|做)|将来.{0,3}(要|某|发生)|到现在为止|先(发生|完成|做完)|不规则|单独记|前面(加|必须)|不加\s*the|就前一致|就近|退一步|陈述语序|疑问语序|情态动词\s*\+|be\s*\+\s*过去分词|单数\(is|复数\(are|习惯性|经历|尽的义务|义务|把握的推测|之前.{0,4}就已/;
    const hard = !/[A-Za-z]/.test(correct) ? ABSTRACT.test(correct) || correct.length >= 6 : ABSTRACT.test(correct);
    items.push({ stage, seq: i + 1, stem: q.stem, opts, gp: q.gp, correct, tag: hard ? "HARD" : "SOFT" });
  });
  scan(j.stage5, 5, false);
  scan(j.stage10, 10, true);
  if (!items.length) continue;
  totalConcept += items.length;
  const over = items.length > 1;
  if (over) superLessons.push(`${j.id}(${items.length})`);
  console.log(`## ${j.id} (${j.title_cn}) — concept ${items.length}${over ? "  ⚠️>1" : "  ✓"}`);
  for (const it of items) console.log(`   s${it.stage}#${it.seq} [${it.gp || ""}] ${it.stem}  || ${it.opts.join(" / ")}`);
  console.log("");
}
console.log(`合计 concept ${totalConcept} 道;超标(>1)课:${superLessons.length} → ${superLessons.join(", ")}`);
