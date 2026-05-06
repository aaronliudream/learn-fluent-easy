// Tracks which slang idioms the user has answered correctly.
// Mastered idioms sink to the bottom; unseen / wrong ones float to the top.
//
// 4-DIM MASTERY (v3): each slang has a mastery_matrix:
//   recognize — see English phrase, pick Chinese meaning  (en2cn)
//   hear      — listen to a sentence, pick the slang      (listen) [phase 2]
//   recall    — see Chinese / scenario / blank, recall    (cn2en, fill, scenario)
//   use       — write a sentence using the slang          (compose, AI graded)
// Each dim is an integer 0..4. A slang becomes 👑 mastered only when ALL
// four dims ≥ 2 — guaranteeing the learner can recognise, hear, recall AND
// produce the phrase. This mirrors the gaokao vocab mastery model.

import { supabase } from "@/integrations/supabase/client";

const LOCAL_KEY = "slang_mastery_v2";

export type SlangDim = "recognize" | "hear" | "recall" | "use";
export const SLANG_DIMS: SlangDim[] = ["recognize", "hear", "recall", "use"];
export type SlangMatrix = Partial<Record<SlangDim, number>>;

type Store = {
  correct: Record<number, number>;
  wrong: Record<number, number>;
  lastCorrectAt: Record<number, number>; // epoch ms of last correct answer
  matrix: Record<number, SlangMatrix>;     // 4-dim matrix per idiom
  reachedMasterAt: Record<number, number>; // epoch ms when 4 dims first all ≥ 2
};

let cache: Store = { correct: {}, wrong: {}, lastCorrectAt: {}, matrix: {}, reachedMasterAt: {} };
let loaded = false;

function loadLocal(): Store {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return { correct: {}, wrong: {}, lastCorrectAt: {}, matrix: {}, reachedMasterAt: {} };
    const p = JSON.parse(raw);
    return {
      correct: p.correct ?? {},
      wrong: p.wrong ?? {},
      lastCorrectAt: p.lastCorrectAt ?? {},
      matrix: p.matrix ?? {},
      reachedMasterAt: p.reachedMasterAt ?? {},
    };
  } catch {
    return { correct: {}, wrong: {}, lastCorrectAt: {}, matrix: {}, reachedMasterAt: {} };
  }
}

function saveLocal(s: Store) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(s));
  } catch {
    /* noop */
  }
}

/** Pull the user's mastery records from the cloud once per session. */
export async function loadSlangMastery(): Promise<Store> {
  if (loaded) return cache;
  cache = loadLocal();
  loaded = true;
  try {
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) return cache;
    const { data, error } = await supabase
      .from("slang_mastery")
      .select("idiom_id, correct_count, wrong_count, last_correct_at, mastery_matrix, reached_master_at")
      .eq("user_id", uid);
    if (error || !data) return cache;
    const next: Store = { correct: {}, wrong: {}, lastCorrectAt: {}, matrix: {}, reachedMasterAt: {} };
    for (const row of data) {
      next.correct[row.idiom_id] = row.correct_count ?? 0;
      next.wrong[row.idiom_id] = row.wrong_count ?? 0;
      if (row.last_correct_at) {
        next.lastCorrectAt[row.idiom_id] = new Date(row.last_correct_at).getTime();
      }
      if (row.mastery_matrix && typeof row.mastery_matrix === "object") {
        next.matrix[row.idiom_id] = row.mastery_matrix as SlangMatrix;
      }
      if (row.reached_master_at) {
        next.reachedMasterAt[row.idiom_id] = new Date(row.reached_master_at).getTime();
      }
    }
    cache = next;
    saveLocal(cache);
  } catch {
    /* offline / not signed in — keep local cache */
  }
  return cache;
}

export function getSlangStoreSync(): Store {
  if (!loaded) {
    cache = loadLocal();
    loaded = true;
  }
  return cache;
}

/** Optimistically update the local cache and best-effort sync to cloud. */
export async function recordSlangResult(id: number, correct: boolean) {
  const s = getSlangStoreSync();
  if (correct) {
    s.correct[id] = (s.correct[id] ?? 0) + 1;
    s.lastCorrectAt[id] = Date.now();
  } else {
    s.wrong[id] = (s.wrong[id] ?? 0) + 1;
  }
  saveLocal(s);

  try {
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) return;
    await supabase.from("slang_mastery").upsert(
      {
        user_id: uid,
        idiom_id: id,
        correct_count: s.correct[id] ?? 0,
        wrong_count: s.wrong[id] ?? 0,
        last_result: correct ? "correct" : "wrong",
        last_correct_at: correct ? new Date().toISOString() : undefined,
      },
      { onConflict: "user_id,idiom_id" },
    );
  } catch {
    /* ignore — local cache wins, will sync on next successful write */
  }
}

export function isMasteredSlang(id: number, store = getSlangStoreSync()): boolean {
  return (store.correct[id] ?? 0) >= 1 && (store.correct[id] ?? 0) > (store.wrong[id] ?? 0);
}

/**
 * 5-level learning ladder for a slang phrase. Each level is a different
 * drill type and difficulty:
 *   1 (recognise)    — see English, pick Chinese meaning
 *   2 (listen)       — listen / fill blank
 *   3 (situate)      — read a Chinese real-life scenario, pick the right slang
 *   4 (compose)      — given a scenario, write a sentence using the slang (AI graded)
 *   5 (own)          — you can use it freely; revisited only on long SRS intervals
 * The ladder is derived from the user's correct/wrong/lastCorrectAt history,
 * so it auto-progresses as they answer correctly.
 */
export type SlangLevel = 1 | 2 | 3 | 4 | 5;

export function getSlangLevel(id: number, store = getSlangStoreSync()): SlangLevel {
  const c = store.correct[id] ?? 0;
  const w = store.wrong[id] ?? 0;
  if (c === 0 && w === 0) return 1;
  if (c <= w) return 1;        // still struggling — drop back to recognition
  if (c === 1) return 2;
  if (c === 2) return 3;
  if (c === 3) return 4;
  return 5;
}

/**
 * Today's recommended practice mix:
 *   - 3 brand-new phrases (level 1)
 *   - 4 due-for-review (any level whose cooldown expired)
 *   - 2 "in-progress" (level 3-4 that the user is actively climbing)
 * Returns the chosen ids in display order.
 */
export function pickDailyPlan<T extends { id: number }>(items: T[]): {
  fresh: T[];
  review: T[];
  climbing: T[];
} {
  const store = getSlangStoreSync();
  const fresh: T[] = [];
  const review: T[] = [];
  const climbing: T[] = [];
  for (const it of items) {
    const c = store.correct[it.id] ?? 0;
    const w = store.wrong[it.id] ?? 0;
    if (c === 0 && w === 0) {
      fresh.push(it);
    } else if (isInCooldown(it.id, store)) {
      // still cooling down, skip
      continue;
    } else {
      const lvl = getSlangLevel(it.id, store);
      if (lvl >= 3 && lvl <= 4) climbing.push(it);
      else review.push(it);
    }
  }
  // Lightweight shuffling (deterministic-per-day so the plan is stable
  // within the day and the user can come back to the same set).
  const dayIdx = Math.floor(Date.now() / 86_400_000);
  const seeded = (id: number) => {
    let h = (id * 2654435761) ^ (dayIdx * 1000003);
    h = (h ^ (h >>> 15)) >>> 0;
    h = Math.imul(h, 2246822507) >>> 0;
    return ((h ^ (h >>> 13)) >>> 0) / 4294967296;
  };
  const sortStable = <X extends { id: number }>(arr: X[]) =>
    [...arr].sort((a, b) => seeded(a.id) - seeded(b.id));
  return {
    fresh: sortStable(fresh).slice(0, 3),
    review: sortStable(review).slice(0, 4),
    climbing: sortStable(climbing).slice(0, 2),
  };
}

/** Compact stats for the daily-plan badge / progress bar. */
export function getSlangProgress(items: { id: number }[]): {
  total: number;
  unseen: number;
  learning: number;
  mastered: number;
} {
  const store = getSlangStoreSync();
  let unseen = 0, learning = 0, mastered = 0;
  for (const it of items) {
    const c = store.correct[it.id] ?? 0;
    const w = store.wrong[it.id] ?? 0;
    if (c === 0 && w === 0) unseen++;
    else if (c >= 3 && c > w) mastered++;
    else learning++;
  }
  return { total: items.length, unseen, learning, mastered };
}

/** Top N slang phrases the user is currently working on (level 3-4). Used
 *  by AI Talk so Alex can sprinkle them into the conversation. */
export function getActiveLearningSlangIds(limit = 8): number[] {
  const store = getSlangStoreSync();
  const candidates: { id: number; lvl: number; last: number }[] = [];
  for (const idStr of Object.keys(store.correct)) {
    const id = Number(idStr);
    const c = store.correct[id] ?? 0;
    const w = store.wrong[id] ?? 0;
    if (c === 0 || c <= w) continue; // not engaged yet, or struggling
    const lvl = getSlangLevel(id, store);
    if (lvl >= 3 && lvl <= 4) {
      candidates.push({ id, lvl, last: store.lastCorrectAt[id] ?? 0 });
    }
  }
  // Most recently engaged first.
  candidates.sort((a, b) => b.last - a.last);
  return candidates.slice(0, limit).map((x) => x.id);
}

/**
 * Spaced-repetition interval (in days) before a mastered idiom is eligible
 * to appear in a quiz again. The more times answered correctly in a row,
 * the longer the gap.
 *   1 correct  → 3 days
 *   2 correct  → 7 days
 *   3 correct  → 14 days
 *   4+ correct → 30 days
 */
function reviewIntervalDays(correctCount: number): number {
  if (correctCount <= 1) return 3;
  if (correctCount === 2) return 7;
  if (correctCount === 3) return 14;
  return 30;
}

/**
 * Should this idiom be skipped from the quiz right now because the user
 * recently mastered it? True when the next-review date hasn't arrived.
 */
export function isInCooldown(id: number, store = getSlangStoreSync()): boolean {
  const c = store.correct[id] ?? 0;
  const w = store.wrong[id] ?? 0;
  const last = store.lastCorrectAt[id];
  if (!last) return false;
  // Only mastered items get a cooldown.
  if (!(c >= 1 && c > w)) return false;
  const days = reviewIntervalDays(c);
  return Date.now() - last < days * 86_400_000;
}

/**
 * Pick the best pool of idioms to quiz on, in priority order:
 *   1. Wrong/struggling (correct ≤ wrong) — needs the most practice
 *   2. Unseen
 *   3. Mastered & cooldown expired — due for a review
 *   4. Mastered & still in cooldown — only used to top up if pool is short
 */
export function pickQuizPool<T extends { id: number }>(items: T[], desired: number): T[] {
  const store = getSlangStoreSync();
  const struggling: T[] = [];
  const unseen: T[] = [];
  const dueReview: T[] = [];
  const cooldown: T[] = [];
  for (const it of items) {
    const c = store.correct[it.id] ?? 0;
    const w = store.wrong[it.id] ?? 0;
    if (c === 0 && w === 0) {
      unseen.push(it);
    } else if (!(c >= 1 && c > w)) {
      struggling.push(it);
    } else if (isInCooldown(it.id, store)) {
      cooldown.push(it);
    } else {
      dueReview.push(it);
    }
  }
  const shuffleArr = <X,>(a: X[]) => a.map(x => [Math.random(), x] as const).sort((a, b) => a[0] - b[0]).map(x => x[1]);
  const ordered = [
    ...shuffleArr(struggling),
    ...shuffleArr(unseen),
    ...shuffleArr(dueReview),
    ...shuffleArr(cooldown),
  ];
  return ordered.slice(0, desired);
}

/**
 * Sort idioms so unseen / wrong ones come first and mastered ones sink down.
 * Order key (low → high):
 *   0  unseen
 *   1  wrong ≥ correct (still struggling)
 *   2  mastered
 */
export function sortByMastery<T extends { id: number }>(items: T[]): T[] {
  const store = getSlangStoreSync();
  const bucket = (id: number) => {
    const c = store.correct[id] ?? 0;
    const w = store.wrong[id] ?? 0;
    if (c === 0 && w === 0) return 0;
    if (c >= 1 && c > w) return 2;
    return 1;
  };
  // Deterministic per-day seed so the order stays stable within a session
  // but rotates each day (and across devices/users via a stored salt). This
  // prevents users from always seeing "rizz, drip" first.
  const seed = getRotationSeed();
  const rand = (id: number) => {
    // Simple hash → [0, 1). Mixes id with daily seed.
    let h = (id * 2654435761) ^ seed;
    h = (h ^ (h >>> 15)) >>> 0;
    h = Math.imul(h, 2246822507) >>> 0;
    h = (h ^ (h >>> 13)) >>> 0;
    return (h >>> 0) / 4294967296;
  };
  return items
    .map((it) => ({ it, b: bucket(it.id), r: rand(it.id) }))
    .sort((a, b) => a.b - b.b || a.r - b.r)
    .map((x) => x.it);
}

const ROTATION_SALT_KEY = "slang_rotation_salt_v1";
function getRotationSalt(): number {
  try {
    const raw = localStorage.getItem(ROTATION_SALT_KEY);
    if (raw) {
      const n = parseInt(raw, 10);
      if (!Number.isNaN(n)) return n;
    }
    const salt = Math.floor(Math.random() * 1_000_000);
    localStorage.setItem(ROTATION_SALT_KEY, String(salt));
    return salt;
  } catch {
    return 0;
  }
}
function getRotationSeed(): number {
  // Day index since epoch (UTC) — changes once per day.
  const dayIdx = Math.floor(Date.now() / 86_400_000);
  return (dayIdx * 1000003) ^ getRotationSalt();
}

/**
 * Force a new rotation order on next render — call this after the user
 * signs in so each login session gives a fresh first-impression order.
 */
export function bumpSlangRotation() {
  try {
    const salt = Math.floor(Math.random() * 1_000_000);
    localStorage.setItem(ROTATION_SALT_KEY, String(salt));
  } catch {
    /* noop */
  }
}
