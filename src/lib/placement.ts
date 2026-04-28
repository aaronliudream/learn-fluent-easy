import { LEVELS, LESSON_CONTENT } from "@/data/course";

export type Section = "vocab" | "grammar" | "reading" | "listening";

export type PlacementQuestion = {
  id: string;
  section: Section;
  level: number; // 1..4 — source level (difficulty weight)
  prompt: string;
  context?: string; // optional reading/listening passage
  options: string[];
  answer: number; // index into options
  explain?: string;
};

/** Deterministic seeded RNG so the same browser sees the same test on retake. */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickN<T>(arr: T[], n: number, rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

/**
 * Walk through LEVELS 1..4 and collect candidate questions per section.
 * Each lesson contributes vocab quizzes, fill-blanks (grammar), reading quiz,
 * and listening cloze.
 */
function collectCandidates() {
  const vocab: PlacementQuestion[] = [];
  const grammar: PlacementQuestion[] = [];
  const reading: PlacementQuestion[] = [];
  const listening: PlacementQuestion[] = [];

  for (const lv of LEVELS) {
    if (lv.id < 1 || lv.id > 4) continue;
    for (const unit of lv.units) {
      for (const lesson of unit.lessons) {
        const c = LESSON_CONTENT[lesson.title];
        if (!c) continue;
        const tag = `L${lv.id}-U${unit.id}-${lesson.id}`;

        // VOCAB — word → meaning
        c.vocab.forEach((v, i) => {
          const distractors = c.vocab.filter((x) => x.word !== v.word).slice(0, 3);
          if (distractors.length < 3) return;
          const opts = [...distractors.map((d) => d.meaning), v.meaning];
          vocab.push({
            id: `${tag}-v${i}`,
            section: "vocab",
            level: lv.id,
            prompt: `单词 “${v.word}” 的含义是？`,
            options: opts,
            answer: opts.indexOf(v.meaning),
          });
        });

        // GRAMMAR — fill-in-blanks
        c.fillBlanks.forEach((f, i) => {
          if (f.options.length < 2) return;
          grammar.push({
            id: `${tag}-g${i}`,
            section: "grammar",
            level: lv.id,
            prompt: f.sentence,
            context: f.cn,
            options: f.options,
            answer: f.options.indexOf(f.answer),
          });
        });

        // READING — pair short passage with one quiz question
        const passage = c.reading.map((p) => p.en).join(" ");
        c.quiz.forEach((q, i) => {
          reading.push({
            id: `${tag}-r${i}`,
            section: "reading",
            level: lv.id,
            context: passage,
            prompt: q.q,
            options: q.options,
            answer: q.answer,
            explain: q.explain,
          });
        });

        // LISTENING — use listening blanks (audio is the cloze sentence)
        c.listening.blanks.forEach((b, i) => {
          // Build distractors from vocab pool
          const pool = c.vocab.map((v) => v.word).filter((w) => w !== b.answer);
          const distractors = pool.slice(0, 3);
          if (distractors.length < 3) return;
          const opts = [...distractors, b.answer];
          listening.push({
            id: `${tag}-l${i}`,
            section: "listening",
            level: lv.id,
            context: c.listening.audio, // plays via TTS
            prompt: `${b.before} _____ ${b.after}`,
            options: opts,
            answer: opts.indexOf(b.answer),
          });
        });
      }
    }
  }

  return { vocab, grammar, reading, listening };
}

export type SectionPool = Record<Section, Record<number, PlacementQuestion[]>>;

/** Build a pool keyed by section → level → questions, randomly shuffled. */
export function buildSectionPool(seed = Date.now()): SectionPool {
  const rng = mulberry32(seed);
  const pools = collectCandidates();
  const out: SectionPool = {
    vocab: { 1: [], 2: [], 3: [], 4: [] },
    grammar: { 1: [], 2: [], 3: [], 4: [] },
    reading: { 1: [], 2: [], 3: [], 4: [] },
    listening: { 1: [], 2: [], 3: [], 4: [] },
  };
  (Object.keys(pools) as Section[]).forEach((sec) => {
    const shuffled = pickN(pools[sec], pools[sec].length, rng);
    for (const q of shuffled) {
      if (out[sec][q.level]) out[sec][q.level].push(q);
    }
  });
  return out;
}

/**
 * Pick the next adaptive question for a section.
 *  - Tries the requested level first; falls back to nearest available level.
 *  - Skips already-used IDs.
 */
export function pickAdaptive(
  pool: SectionPool,
  section: Section,
  desiredLevel: number,
  used: Set<string>,
): PlacementQuestion | null {
  const tryOrder: number[] = [];
  const clamped = Math.max(1, Math.min(4, desiredLevel));
  tryOrder.push(clamped);
  for (let d = 1; d <= 3; d++) {
    if (clamped + d <= 4) tryOrder.push(clamped + d);
    if (clamped - d >= 1) tryOrder.push(clamped - d);
  }
  for (const lv of tryOrder) {
    const bucket = pool[section][lv] || [];
    const next = bucket.find((q) => !used.has(q.id));
    if (next) return next;
  }
  return null;
}

/**
 * Build a 40-question placement test (10 per section), with even spread
 * across LEVELS 1..4 (2-3 per level per section).
 * (Legacy non-adaptive builder — still used as a fallback.)
 */
export function buildPlacementTest(seed = Date.now()): PlacementQuestion[] {
  const rng = mulberry32(seed);
  const pools = collectCandidates();
  const sections: Section[] = ["vocab", "grammar", "reading", "listening"];
  const PER_SECTION = 10;
  const PER_LEVEL = [2, 3, 3, 2]; // L1, L2, L3, L4

  const out: PlacementQuestion[] = [];
  for (const sec of sections) {
    const all = pools[sec];
    const buckets: Record<number, PlacementQuestion[]> = { 1: [], 2: [], 3: [], 4: [] };
    for (const q of all) buckets[q.level]?.push(q);

    const sectionQs: PlacementQuestion[] = [];
    for (let lv = 1; lv <= 4; lv++) {
      const want = PER_LEVEL[lv - 1];
      sectionQs.push(...pickN(buckets[lv] ?? [], want, rng));
    }
    // Top up if any level lacked questions
    while (sectionQs.length < PER_SECTION && all.length) {
      const extra = pickN(
        all.filter((q) => !sectionQs.find((x) => x.id === q.id)),
        PER_SECTION - sectionQs.length,
        rng,
      );
      if (!extra.length) break;
      sectionQs.push(...extra);
    }
    out.push(...sectionQs.slice(0, PER_SECTION));
  }
  return out;
}

export type PlacementResult = {
  total: number;
  correct: number;
  weighted: number; // 0..100
  cefr: "A1" | "A2" | "B1" | "B2" | "C1";
  recommendedLevel: number; // 1..6
  bySection: Record<Section, { correct: number; total: number }>;
  byLevel: Record<number, { correct: number; total: number }>;
  ability: number; // estimated CEFR-aligned ability, 1.0 .. 4.5
};

export function scoreTest(
  questions: PlacementQuestion[],
  picks: Record<string, number>,
): PlacementResult {
  const bySection: PlacementResult["bySection"] = {
    vocab: { correct: 0, total: 0 },
    grammar: { correct: 0, total: 0 },
    reading: { correct: 0, total: 0 },
    listening: { correct: 0, total: 0 },
  };
  const byLevel: PlacementResult["byLevel"] = {
    1: { correct: 0, total: 0 },
    2: { correct: 0, total: 0 },
    3: { correct: 0, total: 0 },
    4: { correct: 0, total: 0 },
  };

  let weightedScore = 0;
  let weightedMax = 0;
  let correct = 0;

  for (const q of questions) {
    const w = q.level; // L1=1pt, L2=2pt, L3=3pt, L4=4pt
    weightedMax += w;
    bySection[q.section].total++;
    byLevel[q.level].total++;
    if (picks[q.id] === q.answer) {
      correct++;
      weightedScore += w;
      bySection[q.section].correct++;
      byLevel[q.level].correct++;
    }
  }

  const weighted = weightedMax > 0 ? Math.round((weightedScore / weightedMax) * 100) : 0;

  // Adaptive ability estimate:
  // For every answered question, contribute (level + 0.5) on a correct pick,
  // (level - 0.5) on a wrong pick. Average across answered items.
  let abilitySum = 0;
  let abilityN = 0;
  for (const q of questions) {
    const pick = picks[q.id];
    if (pick === undefined) continue;
    abilityN++;
    abilitySum += pick === q.answer ? q.level + 0.5 : q.level - 0.5;
  }
  const ability = abilityN > 0 ? abilitySum / abilityN : 1;

  // Map ability → CEFR & recommended starting level.
  // ability ranges roughly 0.5 .. 4.5
  let cefr: PlacementResult["cefr"] = "A1";
  let recommendedLevel = 1;
  if (ability >= 4.0) { cefr = "C1"; recommendedLevel = 5; }
  else if (ability >= 3.2) { cefr = "B2"; recommendedLevel = 4; }
  else if (ability >= 2.4) { cefr = "B1"; recommendedLevel = 3; }
  else if (ability >= 1.6) { cefr = "A2"; recommendedLevel = 2; }
  else { cefr = "A1"; recommendedLevel = 1; }

  return {
    total: questions.length,
    correct,
    weighted,
    cefr,
    recommendedLevel,
    bySection,
    byLevel,
    ability: Math.round(ability * 10) / 10,
  };
}

export const CEFR_DESC: Record<PlacementResult["cefr"], { name: string; tag: string }> = {
  A1: { name: "入门 (Beginner)", tag: "可以理解和使用最基本的日常表达" },
  A2: { name: "初级 (Elementary)", tag: "可以进行简单的日常交流" },
  B1: { name: "中级 (Intermediate)", tag: "可以应对工作、旅行中的常见情境" },
  B2: { name: "中高级 (Upper-Intermediate)", tag: "可以流利地与母语者讨论复杂话题" },
  C1: { name: "高级 (Advanced)", tag: "可以在学术与专业场合熟练表达" },
};