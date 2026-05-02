/**
 * FSRS-4.5 (simplified) — Free Spaced Repetition Scheduler
 *
 * Based on the open-source algorithm used as Anki's default since 2023,
 * trained on millions of real reviews. Significantly outperforms SM-2 in
 * long-term retention.
 *
 * Reference: https://github.com/open-spaced-repetition/fsrs4anki
 *
 * Each card has two state variables:
 *  - difficulty (D): 1..10, intrinsic difficulty of the card
 *  - stability (S): days, the interval at which retention drops to ~90%
 *
 * Grade scale (1..4):
 *  1 = Again — couldn't recall / wrong
 *  2 = Hard  — recalled with significant struggle (slow + correct)
 *  3 = Good  — recalled comfortably (correct, normal speed)
 *  4 = Easy  — recalled instantly (correct, fast)
 */

export type FsrsGrade = 1 | 2 | 3 | 4;

export interface FsrsState {
  difficulty: number; // 1..10
  stability: number; // days
  lastReviewIso: string | null;
}

export interface FsrsResult {
  difficulty: number;
  stability: number;
  intervalDays: number;
  dueAt: Date;
}

// Default request retention — we want users to remember at least 90% of items at due time.
const REQUEST_RETENTION = 0.9;

// FSRS-4.5 default 17-parameter weight set (open-spaced-repetition default).
const W = [
  0.4197, 1.1869, 3.0412, 15.2441,
  7.1434, 0.6477, 1.0007, 0.0674,
  1.6597, 0.1712, 1.1178, 2.0225,
  0.0904, 0.3025, 2.1214, 0.2498,
  2.9466,
];

/* ---------------- helpers ---------------- */
function clampD(d: number): number {
  return Math.min(10, Math.max(1, d));
}

function initStability(grade: FsrsGrade): number {
  // W[0..3] = initial stabilities for grades 1..4
  return Math.max(0.1, W[grade - 1]);
}

function initDifficulty(grade: FsrsGrade): number {
  // W[4] = initial mean difficulty; reduced for higher grades.
  return clampD(W[4] - W[5] * (grade - 3));
}

function nextDifficulty(d: number, grade: FsrsGrade): number {
  // Mean reversion to the initial difficulty for grade 3.
  const dPrime = d - W[6] * (grade - 3);
  // Pull back toward mean D for grade 3
  const mean = initDifficulty(3);
  return clampD(W[7] * mean + (1 - W[7]) * dPrime);
}

/** Retrievability = predicted recall probability after `elapsed` days. */
function retrievability(stability: number, elapsedDays: number): number {
  if (stability <= 0) return 0;
  // FSRS forgetting curve: R = (1 + elapsed / (9 * S)) ^ -1
  return Math.pow(1 + elapsedDays / (9 * stability), -1);
}

function nextStabilitySuccess(d: number, s: number, r: number, grade: FsrsGrade): number {
  // Hard / Good / Easy multipliers
  const hardPenalty = grade === 2 ? W[15] : 1;
  const easyBonus = grade === 4 ? W[16] : 1;
  const stabIncrement =
    Math.exp(W[8]) *
    (11 - d) *
    Math.pow(s, -W[9]) *
    (Math.exp((1 - r) * W[10]) - 1);
  return Math.max(0.1, s * (1 + stabIncrement * hardPenalty * easyBonus));
}

function nextStabilityFailure(d: number, s: number, r: number): number {
  // After a lapse: stability drops dramatically.
  const dFactor = W[11];
  const sFactor = Math.pow(s + 1, W[13]) - 1;
  const rFactor = Math.exp((1 - r) * W[14]);
  return Math.max(
    0.1,
    Math.min(s, dFactor * Math.pow(d, -W[12]) * sFactor * rFactor),
  );
}

function intervalForRetention(stability: number, retention = REQUEST_RETENTION): number {
  // Inverse of retrievability formula.
  return Math.max(1, Math.round(9 * stability * (1 / retention - 1)));
}

/* ---------------- main API ---------------- */

/**
 * Schedule the next review.
 * @param prev current FSRS state (or null for a brand-new card)
 * @param grade the user's response (1..4)
 * @param now optional reference time
 */
export function fsrsSchedule(
  prev: FsrsState | null,
  grade: FsrsGrade,
  now: Date = new Date(),
): FsrsResult {
  // First review
  if (!prev || !prev.lastReviewIso || prev.stability <= 0) {
    const stability = initStability(grade);
    const difficulty = initDifficulty(grade);
    const intervalDays = intervalForRetention(stability);
    return {
      stability,
      difficulty,
      intervalDays,
      dueAt: new Date(now.getTime() + intervalDays * 24 * 3600 * 1000),
    };
  }

  const last = new Date(prev.lastReviewIso).getTime();
  const elapsedDays = Math.max(0, (now.getTime() - last) / (24 * 3600 * 1000));
  const r = retrievability(prev.stability, elapsedDays);
  const newD = nextDifficulty(prev.difficulty, grade);
  const newS =
    grade === 1
      ? nextStabilityFailure(prev.difficulty, prev.stability, r)
      : nextStabilitySuccess(prev.difficulty, prev.stability, r, grade);

  // After failure, force a quick re-test in 1 day.
  const intervalDays =
    grade === 1 ? 1 : intervalForRetention(newS);

  return {
    difficulty: newD,
    stability: newS,
    intervalDays,
    dueAt: new Date(now.getTime() + intervalDays * 24 * 3600 * 1000),
  };
}

/**
 * Convert raw answer correctness + reaction time → FSRS grade (1..4).
 * This is how the algorithm reads "fluency" without asking the user to self-rate.
 */
export function gradeFromAttempt(args: {
  isCorrect: boolean;
  /** milliseconds from question shown to answer submitted */
  latencyMs?: number;
  /** soft target latency for this question type (default 4000) */
  targetMs?: number;
}): FsrsGrade {
  if (!args.isCorrect) return 1;
  const latency = args.latencyMs ?? 0;
  const target = args.targetMs ?? 4000;
  if (latency === 0) return 3; // unknown → Good
  if (latency < target * 0.5) return 4; // Easy: faster than half-target
  if (latency > target * 1.8) return 2; // Hard: very slow
  return 3; // Good
}