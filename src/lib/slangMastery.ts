// Tracks which slang idioms the user has answered correctly.
// Mastered idioms sink to the bottom; unseen / wrong ones float to the top.
// Persists to Supabase when the user is signed in, with a localStorage cache
// so the UI stays snappy and works offline.

import { supabase } from "@/integrations/supabase/client";

const LOCAL_KEY = "slang_mastery_v2";

type Store = {
  correct: Record<number, number>;
  wrong: Record<number, number>;
  lastCorrectAt: Record<number, number>; // epoch ms of last correct answer
};

let cache: Store = { correct: {}, wrong: {}, lastCorrectAt: {} };
let loaded = false;

function loadLocal(): Store {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return { correct: {}, wrong: {}, lastCorrectAt: {} };
    const p = JSON.parse(raw);
    return {
      correct: p.correct ?? {},
      wrong: p.wrong ?? {},
      lastCorrectAt: p.lastCorrectAt ?? {},
    };
  } catch {
    return { correct: {}, wrong: {}, lastCorrectAt: {} };
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
      .select("idiom_id, correct_count, wrong_count, last_correct_at")
      .eq("user_id", uid);
    if (error || !data) return cache;
    const next: Store = { correct: {}, wrong: {}, lastCorrectAt: {} };
    for (const row of data) {
      next.correct[row.idiom_id] = row.correct_count ?? 0;
      next.wrong[row.idiom_id] = row.wrong_count ?? 0;
      if (row.last_correct_at) {
        next.lastCorrectAt[row.idiom_id] = new Date(row.last_correct_at).getTime();
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
  return items
    .map((it, i) => ({ it, i, b: bucket(it.id) }))
    .sort((a, b) => a.b - b.b || a.i - b.i)
    .map((x) => x.it);
}
