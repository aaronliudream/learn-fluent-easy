import { LEVELS, LESSON_CONTENT } from "./src/data/course";
import PREGEN from "./src/data/aiLessons.json";

const PREGEN_MAP = PREGEN as Record<string, any>;

const normalize = (raw: string): string => {
  let w = raw.toLowerCase().trim();
  w = w.replace(/^[^a-z']+|[^a-z']+$/g, "");
  if (!w) return "";
  if (w.length > 4 && w.endsWith("ies")) return w.slice(0, -3) + "y";
  if (w.length > 3 && w.endsWith("es")) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) return w.slice(0, -1);
  if (w.length > 4 && w.endsWith("ing")) return w.slice(0, -3);
  if (w.length > 4 && w.endsWith("ed")) return w.slice(0, -2);
  return w;
};
const tokenize = (text: string) =>
  text.split(/[^A-Za-z']+/).map(normalize).filter((w) => w.length > 0);

type Lesson = { level: number; unit: number; lesson: number; title: string };
const lessons: Lesson[] = [];
for (const lv of LEVELS) for (const u of lv.units) for (const l of u.lessons)
  lessons.push({ level: lv.id, unit: u.id, lesson: l.id, title: l.title });

const seen = new Set<string>();
let totalRepeated = 0;
let totalNew = 0;
let lessonsWithRepeats = 0;
const offenders: { coord: string; title: string; repeats: string[]; total: number }[] = [];

for (const L of lessons) {
  const c = LESSON_CONTENT[L.title] ?? PREGEN_MAP[L.title];
  if (!c) continue;
  const vocab: { word: string }[] = c.vocab ?? [];
  const reading: { en: string }[] = c.reading ?? [];
  const repeats: string[] = [];
  let newCount = 0;
  for (const v of vocab) {
    const n = normalize(v.word);
    if (!n) continue;
    if (seen.has(n)) repeats.push(v.word);
    else newCount++;
  }
  totalRepeated += repeats.length;
  totalNew += newCount;
  if (repeats.length > 0) {
    lessonsWithRepeats++;
    offenders.push({
      coord: `L${L.level}-U${L.unit}-${L.lesson}`,
      title: L.title.split(" · ")[0],
      repeats,
      total: vocab.length,
    });
  }
  // Add this lesson's words to seen AFTER processing
  for (const v of vocab) { const n = normalize(v.word); if (n) seen.add(n); }
  for (const p of reading) tokenize(p.en ?? "").forEach((w) => seen.add(w));
}

console.log(`Total lessons checked: ${lessons.length}`);
console.log(`Vocab entries that are NEW (good):     ${totalNew}`);
console.log(`Vocab entries that are REPEATS (bad):  ${totalRepeated}`);
console.log(`Lessons containing at least one repeat: ${lessonsWithRepeats}`);
console.log(`\nFirst 30 offenders:`);
for (const o of offenders.slice(0, 30)) {
  console.log(`  ${o.coord}  ${o.title}  (${o.repeats.length}/${o.total} repeats)  -> ${o.repeats.join(", ")}`);
}
