// =====================================================================
// Adaptive CEFR placement engine.
// Pulls questions from src/data/placementBank.ts (an independent,
// hand-authored bank that is NOT derived from the lesson content),
// runs an adaptive 24-question test, and produces a CEFR rating
// (A1..C2 → LEVEL 1..6) plus targeted study recommendations.
// =====================================================================

import { LEVELS } from "@/data/course";
import {
  PLACEMENT_BANK,
  TIER_TO_LEVEL,
  LEVEL_TO_TIER,
  type BankQuestion,
  type CEFRTier,
} from "@/data/placementBank";

export type Section = "vocab" | "grammar" | "reading" | "listening";

export type PlacementQuestion = {
  id: string;
  section: Section;
  level: number; // 1..6 (mapped from CEFR tier)
  prompt: string;
  context?: string;
  options: string[];
  answer: number;
  explain?: string;
};

// ---------------------------------------------------------------------
// RNG + array utilities
// ---------------------------------------------------------------------
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Convert a bank entry into the engine's question format,
// shuffling the answer options so they don't always appear in the same order.
function fromBank(b: BankQuestion, rng: () => number): PlacementQuestion {
  const indices = shuffle(b.options.map((_, i) => i), rng);
  const newOptions = indices.map((i) => b.options[i]);
  const newAnswer = indices.indexOf(b.answer);
  return {
    id: b.id,
    section: b.section,
    level: TIER_TO_LEVEL[b.tier],
    prompt: b.prompt,
    context: b.context,
    options: newOptions,
    answer: newAnswer,
    explain: b.explain,
  };
}

// ---------------------------------------------------------------------
// Section pool: section → level (1..6) → questions[]
// Guaranteed unique by question id (the bank itself has no duplicates).
// ---------------------------------------------------------------------
export type SectionPool = Record<Section, Record<number, PlacementQuestion[]>>;

export function buildSectionPool(seed = Date.now()): SectionPool {
  const rng = mulberry32(seed);
  const out: SectionPool = {
    vocab: { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] },
    grammar: { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] },
    reading: { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] },
    listening: { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] },
  };
  // De-dup by id just in case
  const seen = new Set<string>();
  const items = shuffle(PLACEMENT_BANK, rng);
  for (const b of items) {
    if (seen.has(b.id)) continue;
    seen.add(b.id);
    const q = fromBank(b, rng);
    out[q.section][q.level]?.push(q);
  }
  return out;
}

/**
 * Adaptive picker.
 *  - Tries the requested level first; falls back to nearest available level
 *    (alternates +1 / -1 / +2 / -2 ...) until it finds an unused question.
 *  - `used` MUST be the set of all question ids already shown so we never
 *    serve the same question twice in a single test session.
 */
export function pickAdaptive(
  pool: SectionPool,
  section: Section,
  desiredLevel: number,
  used: Set<string>,
): PlacementQuestion | null {
  const clamped = Math.max(1, Math.min(6, desiredLevel));
  const tryOrder: number[] = [clamped];
  for (let d = 1; d <= 5; d++) {
    if (clamped + d <= 6) tryOrder.push(clamped + d);
    if (clamped - d >= 1) tryOrder.push(clamped - d);
  }
  for (const lv of tryOrder) {
    const bucket = pool[section][lv] || [];
    const next = bucket.find((q) => !used.has(q.id));
    if (next) return next;
  }
  return null;
}

// ---------------------------------------------------------------------
// Scoring + recommendation
// ---------------------------------------------------------------------
export type PlacementResult = {
  total: number;
  correct: number;
  weighted: number; // 0..100
  cefr: CEFRTier;
  recommendedLevel: number; // 1..6
  bySection: Record<Section, { correct: number; total: number; level: number }>;
  byLevel: Record<number, { correct: number; total: number }>;
  ability: number; // 1.0 .. 6.5
  weakest: Section[]; // sections that scored worst
  recommendations: StudyRecommendation[];
};

export type StudyRecommendation = {
  section: Section;
  cnSection: string;
  pct: number;
  level: number; // recommended level for this section
  unitTitle: string; // e.g. "LEVEL 2 · Unit 4 · 食物、问路与假设"
  advice: string;
};

// =====================================================================
// CAT (simplified Computerized Adaptive Testing) helpers
// =====================================================================

/**
 * Per-section adaptive state. We track the running ability estimate, a
 * confidence indicator (number of answered items + variance), and a streak
 * counter so that consecutive correct/wrong answers move difficulty faster.
 */
export type SectionState = {
  ability: number; // current best estimate, 1.0 .. 6.5
  level: number; // next target difficulty (1..6)
  answered: number;
  correctStreak: number;
  wrongStreak: number;
  history: { level: number; correct: boolean }[];
};

export const initSectionState = (): SectionState => ({
  ability: 2,
  level: 2,
  answered: 0,
  correctStreak: 0,
  wrongStreak: 0,
  history: [],
});

/**
 * Update a section's adaptive state after one answer.
 *  - Answered correctly: jump up. Two-in-a-row → +2 levels (skip easy items).
 *  - Answered incorrectly: drop down. Two-in-a-row wrong → -2 levels.
 *  - Ability is a running average tilted by the difficulty of items answered
 *    correctly vs incorrectly, similar to Elo / simplified IRT.
 */
export function updateSectionState(
  state: SectionState,
  questionLevel: number,
  correct: boolean,
): SectionState {
  const next: SectionState = {
    ...state,
    answered: state.answered + 1,
    history: [...state.history, { level: questionLevel, correct }],
    correctStreak: correct ? state.correctStreak + 1 : 0,
    wrongStreak: correct ? 0 : state.wrongStreak + 1,
  };

  // Difficulty step
  let step = 0;
  if (correct) {
    step = next.correctStreak >= 2 ? 2 : 1;
  } else {
    step = next.wrongStreak >= 2 ? -2 : -1;
  }
  next.level = Math.max(1, Math.min(6, questionLevel + step));

  // Ability update — weight each item by its difficulty.
  // Correct on a hard item proves more than correct on an easy one.
  const target = correct ? questionLevel + 0.5 : questionLevel - 0.5;
  const learningRate = Math.max(0.18, 0.5 / Math.sqrt(next.answered)); // shrinks
  next.ability = state.ability + learningRate * (target - state.ability);
  next.ability = Math.max(1, Math.min(6.5, next.ability));

  return next;
}

/**
 * Confidence interval (rough): a standard-error-ish estimate that shrinks as
 * more items are answered and as the user's answers stabilize at one level.
 * Returns half-width in CEFR levels.
 */
export function sectionConfidenceHalfWidth(state: SectionState): number {
  if (state.answered === 0) return 3;
  // Variance of the difficulty levels at which "correct" and "wrong" answers landed.
  const correctLvls = state.history.filter((h) => h.correct).map((h) => h.level);
  const wrongLvls = state.history.filter((h) => !h.correct).map((h) => h.level);
  // Spread between hardest correct and easiest wrong → uncertainty.
  const maxCorrect = correctLvls.length ? Math.max(...correctLvls) : state.ability - 1;
  const minWrong = wrongLvls.length ? Math.min(...wrongLvls) : state.ability + 1;
  const spread = Math.max(0.5, minWrong - maxCorrect);
  return spread / Math.sqrt(state.answered);
}

const SECTION_CN: Record<Section, string> = {
  vocab: "词汇",
  grammar: "语法",
  reading: "阅读",
  listening: "听力",
};

export function scoreTest(
  questions: PlacementQuestion[],
  picks: Record<string, number>,
): PlacementResult {
  const bySection: PlacementResult["bySection"] = {
    vocab: { correct: 0, total: 0, level: 0 },
    grammar: { correct: 0, total: 0, level: 0 },
    reading: { correct: 0, total: 0, level: 0 },
    listening: { correct: 0, total: 0, level: 0 },
  };
  const byLevel: PlacementResult["byLevel"] = {
    1: { correct: 0, total: 0 },
    2: { correct: 0, total: 0 },
    3: { correct: 0, total: 0 },
    4: { correct: 0, total: 0 },
    5: { correct: 0, total: 0 },
    6: { correct: 0, total: 0 },
  };

  let weightedScore = 0;
  let weightedMax = 0;
  let correct = 0;

  // Per-section ability accumulators
  const secAbilitySum: Record<Section, number> = { vocab: 0, grammar: 0, reading: 0, listening: 0 };
  const secAbilityN: Record<Section, number> = { vocab: 0, grammar: 0, reading: 0, listening: 0 };

  for (const q of questions) {
    const w = q.level; // 1..6
    weightedMax += w;
    bySection[q.section].total++;
    byLevel[q.level].total++;
    const isRight = picks[q.id] === q.answer;
    if (isRight) {
      correct++;
      weightedScore += w;
      bySection[q.section].correct++;
      byLevel[q.level].correct++;
    }
    if (picks[q.id] !== undefined) {
      secAbilityN[q.section]++;
      secAbilitySum[q.section] += isRight ? q.level + 0.5 : q.level - 0.5;
    }
  }

  const weighted = weightedMax > 0 ? Math.round((weightedScore / weightedMax) * 100) : 0;

  // Overall ability = average of per-section averages (so each skill weighs equally).
  let overallSum = 0;
  let overallN = 0;
  (Object.keys(bySection) as Section[]).forEach((s) => {
    if (secAbilityN[s] > 0) {
      const avg = secAbilitySum[s] / secAbilityN[s];
      bySection[s].level = Math.max(1, Math.min(6, Math.round(avg)));
      overallSum += avg;
      overallN++;
    }
  });
  const ability = overallN > 0 ? overallSum / overallN : 1;

  // Map ability → CEFR & recommended starting level.
  // Cutoffs are calibrated for an adaptive 24-q test starting at L2.
  let cefr: CEFRTier = "A1";
  let recommendedLevel = 1;
  if (ability >= 5.5) { cefr = "C2"; recommendedLevel = 6; }
  else if (ability >= 4.5) { cefr = "C1"; recommendedLevel = 5; }
  else if (ability >= 3.6) { cefr = "B2"; recommendedLevel = 4; }
  else if (ability >= 2.7) { cefr = "B1"; recommendedLevel = 3; }
  else if (ability >= 1.8) { cefr = "A2"; recommendedLevel = 2; }
  else { cefr = "A1"; recommendedLevel = 1; }

  // Identify weakest sections (lowest accuracy)
  const sectionPcts = (Object.keys(bySection) as Section[]).map((s) => {
    const r = bySection[s];
    return { s, pct: r.total > 0 ? r.correct / r.total : 0 };
  });
  const minPct = Math.min(...sectionPcts.map((x) => x.pct));
  const weakest = sectionPcts.filter((x) => x.pct === minPct).map((x) => x.s);

  // Build per-section study recommendations
  const recommendations: StudyRecommendation[] = (Object.keys(bySection) as Section[]).map((s) => {
    const r = bySection[s];
    const pct = r.total > 0 ? Math.round((r.correct / r.total) * 100) : 0;
    const lv = Math.max(1, Math.min(6, r.level || recommendedLevel));
    const unit = pickRecommendedUnit(lv, s);
    const advice = buildAdvice(s, pct, lv);
    return {
      section: s,
      cnSection: SECTION_CN[s],
      pct,
      level: lv,
      unitTitle: unit,
      advice,
    };
  });

  return {
    total: questions.length,
    correct,
    weighted,
    cefr,
    recommendedLevel,
    bySection,
    byLevel,
    ability: Math.round(ability * 10) / 10,
    weakest,
    recommendations,
  };
}

// ---------------------------------------------------------------------
// Recommendation helpers
// ---------------------------------------------------------------------
function pickRecommendedUnit(level: number, section: Section): string {
  const lv = LEVELS.find((l) => l.id === level);
  if (!lv) return `LEVEL ${level}`;
  if (!lv.units || lv.units.length === 0) {
    return `LEVEL ${level} (即将上线)`;
  }
  // Heuristic: vocab → unit 1, grammar → middle unit, reading → 2/3 of the way, listening → unit 2
  const n = lv.units.length;
  let idx = 0;
  if (section === "vocab") idx = 0;
  else if (section === "grammar") idx = Math.floor(n / 2);
  else if (section === "reading") idx = Math.min(n - 1, Math.floor((n * 2) / 3));
  else idx = Math.min(n - 1, 1);
  const u = lv.units[idx];
  return `LEVEL ${level} · Unit ${u.id} · ${u.title}`;
}

function buildAdvice(section: Section, pct: number, level: number): string {
  const tier = LEVEL_TO_TIER[level] || "A1";
  const strength = pct >= 80 ? "扎实" : pct >= 60 ? "基本掌握" : pct >= 40 ? "薄弱" : "明显不足";
  const focus: Record<Section, string> = {
    vocab: "建议每日背 15–20 个 " + tier + " 级核心词，重点掌握常用搭配（collocation）。",
    grammar: "建议系统复习 " + tier + " 级语法点（时态、条件句、语态、虚拟语气），多做填空训练。",
    reading: "建议每天精读一篇 " + tier + " 级短文，做 3 题理解题，并总结生词与连接词。",
    listening: "建议每天精听 5 分钟 " + tier + " 级音频，先盲听 → 看原文 → 跟读，重点训练连读与弱读。",
  };
  return `当前${strength}（${pct}%）。${focus[section]}`;
}

// ---------------------------------------------------------------------
// Public CEFR labels
// ---------------------------------------------------------------------
export const CEFR_DESC: Record<CEFRTier, { name: string; tag: string }> = {
  A1: { name: "入门 (Beginner)", tag: "可以理解并使用最基本的日常表达" },
  A2: { name: "初级 (Elementary)", tag: "可以进行简单的日常交流" },
  B1: { name: "中级 (Intermediate)", tag: "可以应对工作、旅行中的常见情境" },
  B2: { name: "中高级 (Upper-Intermediate)", tag: "可以流利地与母语者讨论复杂话题" },
  C1: { name: "高级 (Advanced)", tag: "可以在学术与专业场合熟练表达" },
  C2: { name: "精通 (Proficiency)", tag: "几乎接近母语者的理解与表达水平" },
};

// =====================================================================
// Per-question time-limit calculator
// ---------------------------------------------------------------------
// Real proficiency tests (TOEFL / IELTS / Cambridge) do NOT use one
// blanket time per section. Each item's time budget is derived from:
//   1. how much text the user must read (prompt + options [+ passage])
//   2. how much audio they must listen to (× allowed plays)
//   3. cognitive load: harder CEFR tier → more analysis time
//   4. section type: grammar items need parsing, reading items need
//      passage scanning + option matching, etc.
//
// Baseline reading speeds (conservative, tuned for non-native test takers
// under exam pressure):
//   - English: ~3.0 words/sec (≈180 wpm — slightly below native 250 wpm)
//   - Chinese: ~4.5 chars/sec (≈270 cpm)
//   - Listening narration: ~2.3 words/sec (≈140 wpm — TOEFL-like pace)
//
// Tier multipliers reflect that harder items also use longer, denser
// vocabulary, so each word takes more time to process.
// =====================================================================

const TIER_LOAD: Record<CEFRTier, number> = {
  A1: 1.0,
  A2: 1.05,
  B1: 1.15,
  B2: 1.25,
  C1: 1.35,
  C2: 1.45,
};

// Count "reading units" in a string. English words count as 1 unit per word
// at 3 wps; Chinese characters count at 4.5 cps so 1 CN char ≈ 0.67 EN words
// in time terms. We return seconds-to-read directly.
function readingSeconds(text: string | undefined): number {
  if (!text) return 0;
  const cnChars = (text.match(/[\u3400-\u9fff\u3040-\u30ff\uac00-\ud7af]/g) || []).length;
  // Count English words as runs of latin letters/digits/apostrophes
  const enWords = (text.match(/[A-Za-z0-9'’]+/g) || []).length;
  // Convert to seconds. CN: 4.5 chars/sec → s = chars/4.5
  // EN: 3.0 words/sec → s = words/3.0
  return cnChars / 4.5 + enWords / 3.0;
}

// Estimate spoken duration of a script (assumes English narration).
// 2.3 words/sec ≈ 140 wpm — matches TOEFL/IELTS narration pace.
function spokenSeconds(text: string | undefined): number {
  if (!text) return 0;
  const enWords = (text.match(/[A-Za-z0-9'’]+/g) || []).length;
  // Add a small floor for very short clips (loading/intonation overhead)
  return Math.max(2, enWords / 2.3);
}

/**
 * Compute the per-question time budget in seconds, based on the actual
 * content of the question (prompt + context + all options) and the
 * cognitive load implied by its CEFR tier and section type.
 *
 * Floors and ceilings are applied so the timer never feels absurd:
 *   - vocab/grammar: 12s ≤ t ≤ 60s
 *   - reading:       30s ≤ t ≤ 180s
 *   - listening:     20s ≤ t ≤ 120s
 */
export function computeQuestionTimeLimit(
  q: PlacementQuestion,
  opts: { listeningMaxPlays?: number } = {},
): number {
  const tier = (LEVEL_TO_TIER[q.level] ?? "A1") as CEFRTier;
  const load = TIER_LOAD[tier];

  // Time to read the prompt + every option (the user has to scan all of them).
  const promptSec = readingSeconds(q.prompt);
  const optionsSec = q.options.reduce((acc, o) => acc + readingSeconds(o), 0);

  let total = 0;
  let lo = 0;
  let hi = 0;

  switch (q.section) {
    case "vocab": {
      // Decide between 4 short options after a short prompt. Mostly recall.
      // Base "thinking" budget = 4s easy, scaling with tier.
      const think = 4 * load;
      total = (promptSec + optionsSec) * load + think;
      lo = 12;
      hi = 60;
      break;
    }
    case "grammar": {
      // Must parse the carrier sentence (context) + decide which form fits.
      const ctxSec = readingSeconds(q.context);
      const think = 6 * load;
      total = (promptSec + ctxSec + optionsSec) * load + think;
      lo = 15;
      hi = 70;
      break;
    }
    case "reading": {
      // Passage scan (with re-reading allowance ×1.4) + question + options
      // + analysis time that scales strongly with tier.
      const passageSec = readingSeconds(q.context) * 1.4;
      const analyse = 10 * load;
      total = passageSec * load + (promptSec + optionsSec) * load + analyse;
      lo = 30;
      hi = 180;
      break;
    }
    case "listening": {
      // Audio plays (allowed plays × clip duration) + options reading +
      // post-audio reflection time.
      const plays = Math.max(1, opts.listeningMaxPlays ?? 2);
      const audioSec = spokenSeconds(q.context) * plays;
      // Brief gap between plays (1s) for the user to mentally reset.
      const interPlayGap = (plays - 1) * 1;
      const reflect = 6 * load;
      total = audioSec + interPlayGap + (promptSec + optionsSec) * load + reflect;
      lo = 20;
      hi = 120;
      break;
    }
  }

  // Round up to a whole second; clamp to section bounds.
  return Math.max(lo, Math.min(hi, Math.ceil(total)));
}
