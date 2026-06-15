// 修正:① 八上 U6=Plan for Yourself / U7=When Tomorrow Comes(标题对调+内容重填;语法按单元号本就正确)
//       ② 全 16 单元(八上8+八下8)在阅读关后插入第9关「完形填空」cloze(对齐七年级9板块)
// 用法: node scripts/fix-g8-u6u7-and-cloze.mjs
import fs from "node:fs";
const PATH = "src/data/juniorHub/grade8.json";
const root = JSON.parse(fs.readFileSync(PATH, "utf8"));
const v1 = root.grade8.semesters.grade8_volume1.units;
const v2 = root.grade8.semesters.grade8_volume2.units;
const all = [...v1, ...v2];
const byId = Object.fromEntries(all.map((u) => [u.id, u]));

// ① 八上 U6/U7 标题对调
const u6 = byId.g8v1_u6, u7 = byId.g8v1_u7;
Object.assign(u6, { title: "Plan for Yourself", cn: "为自己制订计划", emoji: "📅", bigQuestion: "Why do we need plans?" });
Object.assign(u7, { title: "When Tomorrow Comes", cn: "当明天来临", emoji: "🔮", bigQuestion: "What will the future look like?" });

const fill = (id, file) => {
  const c = JSON.parse(fs.readFileSync(file, "utf8"));
  const u = byId[id];
  u.vocabulary = c.vocabulary;
  u.reading = c.reading;
  u.grammarQuiz = c.grammarQuiz;
  u.listeningQuestions = c.listeningQuestions;
  u.quizQuestions = c.quizQuestions;
  u.writing = c.writing;
};
fill("g8v1_u6", "scripts/_g8a_u6_fix.json"); // Plan for Yourself
fill("g8v1_u7", "scripts/_g8a_u7_fix.json"); // When Tomorrow Comes

// ② 全 16 单元加 cloze 关(s5b),插在 reading(s5)之后、listening(s6)之前;已有则跳过
const clozeStage = { id: "s5b", title: "完形填空", subtitle: "语篇填空", icon: "📝", type: "cloze", time: "8分钟" };
let added = 0;
for (const u of all) {
  if (u.stages.some((s) => s.type === "cloze")) continue;
  const ri = u.stages.findIndex((s) => s.type === "reading");
  const at = ri >= 0 ? ri + 1 : u.stages.length - 1;
  u.stages.splice(at, 0, { ...clozeStage });
  added++;
}

fs.writeFileSync(PATH, JSON.stringify(root, null, 2).replace(/\n/g, "\r\n"), "utf8");
console.log(`八上 U6=${u6.title} / U7=${u7.title}(已对调+重填)`);
console.log(`cloze 关已加到 ${added} 个单元(每单元 stages: ${byId.g8v1_u1.stages.length} 关)`);
console.log("stages 顺序示例:", byId.g8v1_u1.stages.map((s) => s.type).join(" → "));
