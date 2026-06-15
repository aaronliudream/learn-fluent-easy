// 填充八下 U1–U8 内容 + 修正 U6/U7 标题对调(语法按单元号不变)。
// 用法: node scripts/gen-g8b-content.mjs
import fs from "node:fs";
const PATH = "src/data/juniorHub/grade8.json";
const root = JSON.parse(fs.readFileSync(PATH, "utf8"));
const units = root.grade8.semesters.grade8_volume2.units;
const byId = Object.fromEntries(units.map((u) => [u.id, u]));

// ① 修标题对调:U6=Crossing Cultures(习俗) / U7=A Good Read(文学)。语法保持按单元号不动。
const u6 = byId.g8v2_u6, u7 = byId.g8v2_u7;
Object.assign(u6, { title: "Crossing Cultures", cn: "跨越文化", emoji: "🌍", bigQuestion: "How do we communicate with people from different cultures?" });
Object.assign(u7, { title: "A Good Read", cn: "好书共读", emoji: "📚", bigQuestion: "Why should we read great books?" });

// ② 填内容
let done = [];
for (let n = 1; n <= 8; n++) {
  const f = `scripts/_g8b_u${n}.json`;
  const c = JSON.parse(fs.readFileSync(f, "utf8"));
  const u = byId[`g8v2_u${n}`];
  u.vocabulary = c.vocabulary;
  u.reading = c.reading;
  u.grammarQuiz = c.grammarQuiz;
  u.listeningQuestions = c.listeningQuestions;
  u.quizQuestions = c.quizQuestions;
  u.writing = c.writing;
  u.available = true;
  u.contentStatus = "TODO_待真题填充";
  done.push(`g8v2_u${n}=${u.title}(v${u.vocabulary.length}/r${u.reading.questions.length}/g${u.grammarQuiz.length}/l${u.listeningQuestions.length}/q${u.quizQuestions.length})`);
}
fs.writeFileSync(PATH, JSON.stringify(root, null, 2).replace(/\n/g, "\r\n"), "utf8");
console.log("八下填充:\n  " + done.join("\n  "));
