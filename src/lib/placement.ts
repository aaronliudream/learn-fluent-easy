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
