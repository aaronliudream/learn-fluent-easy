import { LEVELS, LESSON_CONTENT } from "../src/data/course";
import PREGEN from "../src/data/aiLessons.json";
import { getPriorLessonWords, isWordNew } from "../src/lib/priorWords";

const PREGEN_MAP = PREGEN as Record<string, any>;

let lessonsTotal = 0;
let lessonsAllNew = 0;
let lessonsWithFallback = 0; // all words were repeats -> fallback
let lessonsWithRemainingDup = 0;
const examples: string[] = [];

for (const lv of LEVELS) for (const u of lv.units) for (const l of u.lessons) {
  const c = LESSON_CONTENT[l.title] ?? PREGEN_MAP[l.title];
  if (!c) continue;
  lessonsTotal++;
  const seen = getPriorLessonWords(lv.id, u.id, l.id);
  const vocab: { word: string }[] = c.vocab ?? [];
  const filtered = vocab.filter((v) => isWordNew(v.word, seen));
  const shown = filtered.length > 0 ? filtered : vocab; // fallback
  const stillRepeated = shown.filter((v) => !isWordNew(v.word, seen));
  if (stillRepeated.length === 0) lessonsAllNew++;
  if (filtered.length === 0 && vocab.length > 0) {
    lessonsWithFallback++;
    if (examples.length < 5)
      examples.push(`fallback  L${lv.id}-U${u.id}-${l.id}  ${l.title.split(" · ")[0]}  (all ${vocab.length} words repeated)`);
  }
  if (stillRepeated.length > 0) {
    lessonsWithRemainingDup++;
    if (examples.length < 10)
      examples.push(`STILL DUP L${lv.id}-U${u.id}-${l.id} -> ${stillRepeated.map(v=>v.word).join(",")}`);
  }
}

console.log(`Lessons total:                      ${lessonsTotal}`);
console.log(`Lessons showing only new words:     ${lessonsAllNew}`);
console.log(`Lessons that hit fallback (all dup): ${lessonsWithFallback}`);
console.log(`Lessons still showing duplicates:    ${lessonsWithRemainingDup}`);
console.log("\nExamples:");
examples.forEach((e) => console.log("  " + e));
